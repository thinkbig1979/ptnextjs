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

      console.log('  📝 Step 3: Dropping old featured_image column...');
      // SQLite doesn't support DROP COLUMN directly, so we need to recreate the table
      try {
        // Check if featured_image column exists
        const tableInfo = await db.execute(`PRAGMA table_info(blog_posts)`);
        const hasFeaturedImage = tableInfo.rows.some(col => col.name === 'featured_image');

        if (!hasFeaturedImage) {
          console.log('  ✓ Legacy featured_image column already removed');
        } else {
          // Disable foreign key constraints during table recreation
          await db.execute(`PRAGMA foreign_keys = OFF`);

          // Get all columns except featured_image
          const columns = tableInfo.rows
            .filter(col => col.name !== 'featured_image')
            .map(col => col.name)
            .join(', ');

          // Recreate table without featured_image column, preserving data and structure
          await db.execute(`BEGIN TRANSACTION`);

          // Create new table with proper schema (without featured_image)
          await db.execute(`CREATE TABLE blog_posts_new AS SELECT ${columns} FROM blog_posts`);

          // Drop old table
          await db.execute(`DROP TABLE blog_posts`);

          // Rename new table
          await db.execute(`ALTER TABLE blog_posts_new RENAME TO blog_posts`);

          // Recreate indexes (Payload will auto-create these on next startup, but we'll add the unique slug index)
          await db.execute(`CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts(slug)`);

          await db.execute(`COMMIT`);

          // Re-enable foreign key constraints
          await db.execute(`PRAGMA foreign_keys = ON`);

          console.log('  ✓ Removed legacy featured_image column');
        }
      } catch (error) {
        console.log('  ⚠️  Could not drop featured_image column (non-critical):', error.message);
        // Try to rollback if we're in a transaction
        try {
          await db.execute(`ROLLBACK`);
          await db.execute(`PRAGMA foreign_keys = ON`);
        } catch (rollbackError) {
          // Ignore rollback errors
        }
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
