/**
 * Runtime database migration script for Docker deployments
 * Ensures database schema is in sync with the application code
 *
 * This script runs at container startup before the main application
 * to handle schema changes that push: true might miss
 */

const { createClient } = require('@libsql/client');

const DATABASE_URL = process.env.DATABASE_URL || 'file:///data/payload.db';

console.log(`📊 Checking database schema at: ${DATABASE_URL}`);

// Schema migrations to apply
// Add new migrations here when schema changes
const migrations = [
  {
    name: 'add_business_hours_to_company_info',
    check: `SELECT COUNT(*) as count FROM pragma_table_info('company_info') WHERE name = 'business_hours'`,
    up: `ALTER TABLE company_info ADD COLUMN business_hours TEXT`,
  },
  {
    name: 'blog_featured_image_to_upload_relationship',
    check: `SELECT COUNT(*) as count FROM pragma_table_info('blog_posts_rels') WHERE name = 'media_id'`,
    up: async (db) => {
      console.log('  📝 Step 1: Adding media_id column to blog_posts_rels...');
      await db.execute(`ALTER TABLE blog_posts_rels ADD COLUMN media_id INTEGER`);

      // Check if featured_image_id column already exists
      const blogPostsCols = await db.execute(`PRAGMA table_info(blog_posts)`);
      const hasFeaturedImageId = blogPostsCols.rows.some(col => col.name === 'featured_image_id');

      if (!hasFeaturedImageId) {
        await db.execute(`ALTER TABLE blog_posts ADD COLUMN featured_image_id INTEGER`);
      }

      console.log('  📝 Step 2: Migrating existing featured_image URLs to media relationships...');

      // Get all blog posts with featured_image
      const posts = await db.execute(`SELECT id, featured_image FROM blog_posts WHERE featured_image IS NOT NULL AND featured_image != ''`);

      // Get all media for matching
      const mediaItems = await db.execute(`SELECT id, filename, url FROM media`);

      let migratedCount = 0;
      let notFoundCount = 0;

      // Match each blog post's featured_image URL to a media ID
      for (const post of posts.rows) {
        const featuredImage = post.featured_image;
        if (!featuredImage) continue;

        // Extract filename from URL path (e.g., /uploads/speaker.png -> speaker.png)
        const filename = featuredImage.split('/').pop();

        // Find matching media
        const matchingMedia = mediaItems.rows.find(media =>
          media.filename === filename ||
          media.url === featuredImage ||
          `/media/${media.filename}` === featuredImage ||
          `/uploads/${media.filename}` === featuredImage
        );

        if (matchingMedia) {
          // Update blog_posts table
          await db.execute({
            sql: `UPDATE blog_posts SET featured_image_id = ? WHERE id = ?`,
            args: [matchingMedia.id, post.id]
          });

          // Insert into blog_posts_rels table for Payload relationship
          // Get max order for this parent
          const maxOrderResult = await db.execute({
            sql: `SELECT COALESCE(MAX("order"), 0) as max_order FROM blog_posts_rels WHERE parent_id = ?`,
            args: [post.id]
          });
          const nextOrder = (maxOrderResult.rows[0]?.max_order || 0) + 1;

          await db.execute({
            sql: `INSERT INTO blog_posts_rels (parent_id, path, media_id, "order") VALUES (?, ?, ?, ?)`,
            args: [post.id, 'featuredImage', matchingMedia.id, nextOrder]
          });

          console.log(`    ✓ Post ${post.id}: "${featuredImage}" -> Media ID ${matchingMedia.id}`);
          migratedCount++;
        } else {
          console.log(`    ⚠ Post ${post.id}: No media found for "${featuredImage}"`);
          notFoundCount++;
        }
      }

      console.log(`  📊 Migration summary: ${migratedCount} migrated, ${notFoundCount} not found`);

      console.log('  📝 Step 3: Cleanup complete');
      console.log('  ℹ️  Note: Legacy featured_image column kept for backward compatibility');
      console.log('  ℹ️  Payload will use featured_image_id from blog_posts_rels table')
    },
  },
  {
    name: 'fix_broken_foreign_keys_simple',
    // Check if there are foreign key violations - only run if violations exist
    check: async (db) => {
      try {
        const fkCheck = await db.execute(`PRAGMA foreign_key_check`);
        // Return count > 0 if no violations (skip migration), 0 if violations exist (run migration)
        return fkCheck.rows && fkCheck.rows.length > 0 ? 0 : 1;
      } catch (e) {
        return 1; // Skip if we can't check
      }
    },
    up: async (db) => {
      console.log('  🔧 Checking and fixing broken foreign keys...');

      try {
        // Check for foreign key violations
        const fkCheck = await db.execute(`PRAGMA foreign_key_check`);

        if (fkCheck.rows && fkCheck.rows.length > 0) {
          console.log(`  ⚠️  Found ${fkCheck.rows.length} foreign key violations`);
          console.log('  🔧  Recreating payload_locked_documents tables with correct schema...');

          // Disable foreign keys temporarily
          await db.execute(`PRAGMA foreign_keys = OFF`);

          // Drop the locked documents tables
          await db.execute(`DROP TABLE IF EXISTS payload_locked_documents_rels`);
          await db.execute(`DROP TABLE IF EXISTS payload_locked_documents`);

          // Recreate payload_locked_documents table with minimal schema
          await db.execute(`
            CREATE TABLE IF NOT EXISTS payload_locked_documents (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              global_slug TEXT,
              updated_at INTEGER DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer)),
              created_at INTEGER DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer))
            )
          `);

          // Recreate payload_locked_documents_rels table with correct foreign keys
          await db.execute(`
            CREATE TABLE IF NOT EXISTS payload_locked_documents_rels (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              "order" INTEGER,
              parent_id INTEGER NOT NULL REFERENCES payload_locked_documents(id) ON DELETE CASCADE,
              path TEXT NOT NULL,
              users_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
              media_id INTEGER REFERENCES media(id) ON DELETE CASCADE,
              vendors_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
              products_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
              categories_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
              blog_posts_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
              team_members_id INTEGER REFERENCES team_members(id) ON DELETE CASCADE,
              company_info_id INTEGER REFERENCES company_info(id) ON DELETE CASCADE,
              tags_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
              yachts_id INTEGER REFERENCES yachts(id) ON DELETE CASCADE,
              tier_upgrade_requests_id INTEGER REFERENCES tier_upgrade_requests(id) ON DELETE CASCADE,
              import_history_id INTEGER REFERENCES import_history(id) ON DELETE CASCADE
            )
          `);

          // Re-enable foreign keys
          await db.execute(`PRAGMA foreign_keys = ON`);

          console.log('  ✅ Recreated locked documents tables with correct schema');
        } else {
          console.log('  ✓ No foreign key violations detected');
        }
      } catch (error) {
        console.log('  ⚠️  Error checking foreign keys:', error.message);
        // Try to drop the tables anyway
        try {
          await db.execute(`PRAGMA foreign_keys = OFF`);
          await db.execute(`DROP TABLE IF EXISTS payload_locked_documents_rels`);
          await db.execute(`DROP TABLE IF EXISTS payload_locked_documents`);
          await db.execute(`PRAGMA foreign_keys = ON`);
          console.log('  ✅ Dropped locked documents tables as precaution');
        } catch (dropError) {
          console.log('  ⚠️  Could not drop tables:', dropError.message);
        }
      }
    },
  },
  {
    name: 'ensure_locked_documents_tables_exist',
    check: `SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='payload_locked_documents'`,
    up: async (db) => {
      console.log('  🔧  Ensuring payload_locked_documents tables exist...');

      // Disable foreign keys temporarily
      await db.execute(`PRAGMA foreign_keys = OFF`);

      // Create payload_locked_documents table if it doesn't exist
      await db.execute(`
        CREATE TABLE IF NOT EXISTS payload_locked_documents (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          global_slug TEXT,
          updated_at INTEGER DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer)),
          created_at INTEGER DEFAULT (cast((julianday('now') - 2440587.5) * 86400000 as integer))
        )
      `);

      // Create payload_locked_documents_rels table if it doesn't exist with correct foreign keys
      await db.execute(`
        CREATE TABLE IF NOT EXISTS payload_locked_documents_rels (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          "order" INTEGER,
          parent_id INTEGER NOT NULL REFERENCES payload_locked_documents(id) ON DELETE CASCADE,
          path TEXT NOT NULL,
          users_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          media_id INTEGER REFERENCES media(id) ON DELETE CASCADE,
          vendors_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
          products_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
          categories_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
          blog_posts_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
          team_members_id INTEGER REFERENCES team_members(id) ON DELETE CASCADE,
          company_info_id INTEGER REFERENCES company_info(id) ON DELETE CASCADE,
          tags_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
          yachts_id INTEGER REFERENCES yachts(id) ON DELETE CASCADE,
          tier_upgrade_requests_id INTEGER REFERENCES tier_upgrade_requests(id) ON DELETE CASCADE,
          import_history_id INTEGER REFERENCES import_history(id) ON DELETE CASCADE
        )
      `);

      // Re-enable foreign keys
      await db.execute(`PRAGMA foreign_keys = ON`);

      console.log('  ✅ Locked documents tables created successfully');
    },
  },
  // Add more migrations as needed:
  // {
  //   name: 'migration_name',
  //   check: `SQL to check if migration is needed (returns count > 0 if already applied)`,
  //   up: `SQL to apply the migration`,
  // },
];

async function runMigrations() {
  const db = createClient({
    url: DATABASE_URL,
  });

  try {
    for (const migration of migrations) {
      console.log(`🔍 Checking migration: ${migration.name}`);

      // Check if migration is needed (supports both SQL string and async function)
      let count;
      if (typeof migration.check === 'function') {
        count = await migration.check(db);
      } else {
        const result = await db.execute(migration.check);
        count = result.rows[0]?.count || 0;
      }

      if (count === 0) {
        console.log(`⬆️  Applying migration: ${migration.name}`);

        // Handle both string SQL and async function migrations
        if (typeof migration.up === 'function') {
          await migration.up(db);
        } else {
          await db.execute(migration.up);
        }

        console.log(`✅ Applied: ${migration.name}`);
      } else {
        console.log(`⏭️  Already applied: ${migration.name}`);
      }
    }

    console.log('🎉 All migrations complete');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    console.error('Stack:', error.stack);
    // Don't exit with error - let the app try to start anyway
    // The app's push: true might handle it
  } finally {
    db.close();
  }
}

runMigrations();
