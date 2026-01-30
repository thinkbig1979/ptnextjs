#!/usr/bin/env node
/**
 * PostgreSQL Schema Sync Script for Docker Deployments
 *
 * This script ensures the PostgreSQL database schema is synchronized with
 * Payload CMS collection definitions before the main application starts.
 *
 * How it works:
 * 1. Connects to PostgreSQL using DATABASE_URL
 * 2. Initializes Payload CMS which triggers Drizzle's push mode
 * 3. Waits for schema sync to complete
 * 4. Exits so the main app can start fresh
 *
 * This runs BEFORE the Next.js server starts in docker-entrypoint.sh
 */

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function syncSchema() {
  console.log('🔄 Starting PostgreSQL schema synchronization...');

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || !databaseUrl.startsWith('postgres')) {
    console.log('⚠️  DATABASE_URL is not PostgreSQL, skipping schema sync');
    process.exit(0);
  }

  console.log('📦 Database: PostgreSQL');
  console.log('🔗 Connecting to database...');

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Dynamically import Payload to trigger schema sync
      // The payload.config.ts has push: true which uses Drizzle push mode
      const { getPayload } = await import('payload');

      // Import the config - this is available in the standalone build
      // because we copy payload.config.ts to the runner stage
      const configModule = await import('../payload.config.js');
      const config = configModule.default;

      console.log(`📝 Attempt ${attempt}/${MAX_RETRIES}: Initializing Payload CMS...`);

      // Initialize Payload - this triggers the database adapter's push mode
      // which synchronizes the schema with the collection definitions
      const payload = await getPayload({ config });

      console.log('✅ Payload initialized successfully');
      console.log('✅ Schema synchronization complete');

      // Gracefully close the connection
      // Note: Payload 3.x doesn't expose a direct close method,
      // but exiting the process will clean up connections
      process.exit(0);
    } catch (error) {
      console.error(`❌ Attempt ${attempt}/${MAX_RETRIES} failed:`, error.message);

      if (attempt < MAX_RETRIES) {
        console.log(`⏳ Retrying in ${RETRY_DELAY_MS / 1000} seconds...`);
        await sleep(RETRY_DELAY_MS);
      } else {
        console.error('❌ Schema sync failed after all retries');
        console.error('⚠️  The application will attempt to sync on startup');
        // Exit with 0 to not block container startup
        // The app's push: true will retry on startup
        process.exit(0);
      }
    }
  }
}

// Run the sync
syncSchema();
