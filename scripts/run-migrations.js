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
        await db.execute(migration.up);
        console.log(`✅ Applied: ${migration.name}`);
      } else {
        console.log(`⏭️  Already applied: ${migration.name}`);
      }
    }

    console.log('🎉 All migrations complete');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    // Don't exit with error - let the app try to start anyway
    // The app's push: true might handle it
  } finally {
    db.close();
  }
}

runMigrations();
