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
    name: 'repair_blog_posts_foreign_keys',
    check: `SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='blog_posts_repair_temp'`,
    up: async (db) => {
      console.log('  🔧 Repairing blog_posts table foreign keys...');

      try {
        // First, check if foreign keys are actually broken
        await db.execute(`PRAGMA foreign_key_check(blog_posts)`);
        console.log('  ✓ Foreign keys are valid, no repair needed');
        return;
      } catch (fkError) {
        console.log('  ⚠️  Foreign key issues detected, proceeding with repair...');
      }

      try {
        // Disable foreign keys for repair
        await db.execute(`PRAGMA foreign_keys = OFF`);
        await db.execute(`BEGIN TRANSACTION`);

        // Get current table structure
        const tableInfo = await db.execute(`SELECT sql FROM sqlite_master WHERE type='table' AND name='blog_posts'`);
        const createTableSql = tableInfo.rows[0]?.sql;

        if (!createTableSql) {
          throw new Error('Could not get blog_posts table schema');
        }

        console.log('  📝 Backing up blog_posts data...');

        // Create temp table with all data
        await db.execute(`CREATE TABLE blog_posts_repair_temp AS SELECT * FROM blog_posts`);

        console.log('  🔄 Recreating blog_posts table with proper foreign keys...');

        // Drop and recreate the table (this resets foreign keys)
        await db.execute(`DROP TABLE blog_posts`);

        // Recreate table with original schema
        await db.execute(createTableSql);

        console.log('  📥 Restoring blog_posts data...');

        // Copy data back
        const columns = await db.execute(`PRAGMA table_info(blog_posts)`);
        const columnNames = columns.rows.map(col => col.name).join(', ');

        await db.execute(`INSERT INTO blog_posts SELECT ${columnNames} FROM blog_posts_repair_temp`);

        // Drop temp table
        await db.execute(`DROP TABLE blog_posts_repair_temp`);

        console.log('  🔍 Recreating indexes...');

        // Recreate indexes
        await db.execute(`CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts(slug)`);
        await db.execute(`CREATE INDEX IF NOT EXISTS blog_posts_author_idx ON blog_posts(author_id)`);
        await db.execute(`CREATE INDEX IF NOT EXISTS blog_posts_updated_at_idx ON blog_posts(updated_at)`);
        await db.execute(`CREATE INDEX IF NOT EXISTS blog_posts_created_at_idx ON blog_posts(created_at)`);

        await db.execute(`COMMIT`);
        await db.execute(`PRAGMA foreign_keys = ON`);

        console.log('  ✅ Foreign keys repaired successfully');

        // Verify repair
        try {
          await db.execute(`PRAGMA foreign_key_check(blog_posts)`);
          console.log('  ✓ Foreign key validation passed');
        } catch (error) {
          console.warn('  ⚠️  Foreign key validation warning:', error.message);
        }

      } catch (error) {
        console.error('  ❌ Repair failed:', error.message);
        try {
          await db.execute(`ROLLBACK`);
          await db.execute(`DROP TABLE IF EXISTS blog_posts_repair_temp`);
          await db.execute(`PRAGMA foreign_keys = ON`);
        } catch (rollbackError) {
          console.error('  ❌ Rollback failed:', rollbackError.message);
        }
        throw error;
      }
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

      // Check if migration is needed
      const result = await db.execute(migration.check);
      const count = result.rows[0]?.count || 0;

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
