#!/usr/bin/env tsx

/**
 * SQLite to PostgreSQL Migration Script
 *
 * This script migrates all data from a SQLite database to PostgreSQL
 * while preserving all relationships, credentials, and CMS content.
 *
 * Usage:
 *   1. Ensure PostgreSQL is running and accessible
 *   2. Set environment variables:
 *      - SQLITE_SOURCE_PATH: Path to source SQLite database
 *      - POSTGRES_TARGET_URL: PostgreSQL connection string
 *   3. Run: npx tsx scripts/migration/sqlite-to-postgres.ts
 *
 * Options:
 *   --dry-run    Preview migration without making changes
 *   --verbose    Show detailed output
 *
 * The script will:
 *   - Export all data from SQLite
 *   - Create schema in PostgreSQL (via Payload push)
 *   - Import all data preserving relationships
 *   - Verify data integrity
 */

import Database from 'better-sqlite3';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const config = {
  sqlitePath: process.env.SQLITE_SOURCE_PATH || './data/payload.db',
  postgresUrl: process.env.POSTGRES_TARGET_URL || process.env.DATABASE_URL || 'postgresql://ptnextjs:ptnextjs_dev_password@localhost:5432/ptnextjs',
  backupDir: process.env.BACKUP_DIR || './backups/migration',
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
};

// Tables that should be migrated (in order to respect foreign key constraints)
// Order matters: parent tables before child tables
const MIGRATION_ORDER = [
  // Core Payload tables
  'payload_migrations',
  'payload_preferences',

  // Independent entities first
  'users',
  'media',
  'categories',
  'tags',
  'company_info',

  // Entities with relationships
  'vendors',
  'products',
  'blog_posts',
  'team_members',
  'yachts',
  'tier_upgrade_requests',
  'import_history',
  'audit_logs',

  // Relationship/junction tables (order matters)
  'users_sessions',
  'payload_preferences_rels',
  'payload_locked_documents',
  'payload_locked_documents_rels',

  // Vendor sub-tables
  'vendors_rels',
  'vendors_locations',
  'vendors_awards',
  'vendors_certifications',
  'vendors_case_studies',
  'vendors_case_studies_images',
  'vendors_company_values',
  'vendors_editorial_content',
  'vendors_innovation_highlights',
  'vendors_innovation_highlights_benefits',
  'vendors_media_gallery',
  'vendors_service_areas',
  'vendors_team_members',
  'vendors_vendor_reviews',
  'vendors_vendor_reviews_pros',
  'vendors_vendor_reviews_cons',
  'vendors_yacht_projects',
  'vendors_yacht_projects_systems_installed',

  // Product sub-tables
  'products_rels',
  'products_images',
  'products_features',
  'products_specifications',
  'products_benefits',
  'products_badges',
  'products_services',
  'products_action_buttons',
  'products_comparison_metrics',
  'products_technical_documentation',
  'products_owner_reviews',
  'products_owner_reviews_pros',
  'products_owner_reviews_cons',
  'products_integration_compatibility_supported_protocols',
  'products_integration_compatibility_sdk_languages',
  'products_integration_compatibility_integration_partners',
  'products_visual_demo_content_images360',
  'products_visual_demo_content_video_walkthrough_chapters',
  'products_visual_demo_content_interactive_hotspots',
  'products_visual_demo_content_interactive_hotspots_hotspots',
  'products_warranty_support_support_channels',

  // Blog sub-tables
  'blog_posts_rels',
  'blog_posts_tags',

  // Yacht sub-tables
  'yachts_rels',
  'yachts_gallery',
  'yachts_timeline',
  'yachts_maintenance_history',
  'yachts_supplier_map',
  'yachts_sustainability_features',
  'yachts_green_certifications',

  // Compatibility matrix
  'compat_matrix',
  'compat_matrix_requirements',
];

interface MigrationStats {
  table: string;
  sourceCount: number;
  migratedCount: number;
  errors: string[];
}

class SQLiteToPostgresMigration {
  private sqlite: Database.Database;
  private pgPool: Pool;
  private stats: MigrationStats[] = [];

  constructor() {
    // Validate SQLite file exists
    if (!fs.existsSync(config.sqlitePath)) {
      throw new Error(`SQLite database not found at: ${config.sqlitePath}`);
    }

    this.sqlite = new Database(config.sqlitePath, { readonly: true });
    this.pgPool = new Pool({ connectionString: config.postgresUrl });
  }

  async run(): Promise<void> {
    console.log('='.repeat(64));
    console.log('     SQLite to PostgreSQL Migration Script');
    console.log('='.repeat(64));
    console.log('');
    console.log('Source:', config.sqlitePath);
    console.log('Target:', this.maskConnectionString(config.postgresUrl));
    console.log('Dry Run:', config.dryRun);
    console.log('');

    try {
      // Step 1: Create backup
      await this.createBackup();

      // Step 2: Verify connections
      await this.verifyConnections();

      // Step 3: Get list of tables from SQLite
      const sqliteTables = this.getSqliteTables();
      console.log(`Found ${sqliteTables.length} tables in SQLite database`);

      // Step 4: Verify PostgreSQL schema exists
      await this.verifyPostgresSchema();

      // Step 5: Disable foreign key checks for migration
      if (!config.dryRun) {
        await this.disableForeignKeyChecks();
      }

      // Step 6: Migrate tables in order
      console.log('\nMigrating tables...');
      for (const table of MIGRATION_ORDER) {
        if (sqliteTables.includes(table)) {
          await this.migrateTable(table);
        }
      }

      // Step 7: Migrate any remaining tables not in the order list
      for (const table of sqliteTables) {
        if (!MIGRATION_ORDER.includes(table)) {
          console.log(`[WARN] Migrating unlisted table: ${table}`);
          await this.migrateTable(table);
        }
      }

      // Step 8: Re-enable foreign key checks
      if (!config.dryRun) {
        await this.enableForeignKeyChecks();
      }

      // Step 9: Reset sequences
      if (!config.dryRun) {
        await this.resetSequences();
      }

      // Step 10: Print summary
      this.printSummary();

    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    } finally {
      this.sqlite.close();
      await this.pgPool.end();
    }
  }

  private maskConnectionString(url: string): string {
    try {
      const parsed = new URL(url);
      if (parsed.password) {
        parsed.password = '****';
      }
      return parsed.toString();
    } catch {
      return url.replace(/:[^:@]+@/, ':****@');
    }
  }

  private async createBackup(): Promise<void> {
    console.log('[BACKUP] Creating backup...');

    const backupDir = config.backupDir;
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `sqlite-backup-${timestamp}.db`);

    fs.copyFileSync(config.sqlitePath, backupPath);
    console.log(`[OK] Backup created: ${backupPath}`);
  }

  private async verifyConnections(): Promise<void> {
    console.log('[CHECK] Verifying connections...');

    // Test SQLite
    const sqliteVersion = this.sqlite.prepare('SELECT sqlite_version()').get() as { 'sqlite_version()': string };
    console.log(`   SQLite version: ${sqliteVersion['sqlite_version()']}`);

    // Test PostgreSQL
    const pgClient = await this.pgPool.connect();
    try {
      const result = await pgClient.query('SELECT version()');
      const version = result.rows[0].version.split(',')[0];
      console.log(`   PostgreSQL: ${version}`);
    } finally {
      pgClient.release();
    }

    console.log('[OK] Connections verified');
  }

  private getSqliteTables(): string[] {
    const tables = this.sqlite.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table'
      AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `).all() as { name: string }[];

    return tables.map(t => t.name);
  }

  private async verifyPostgresSchema(): Promise<void> {
    console.log('[CHECK] Verifying PostgreSQL schema...');

    const pgClient = await this.pgPool.connect();
    try {
      const result = await pgClient.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);

      const pgTables = result.rows.map(r => r.table_name);
      console.log(`   Found ${pgTables.length} tables in PostgreSQL`);

      if (pgTables.length === 0) {
        throw new Error(
          'No tables found in PostgreSQL. Please start your Next.js app first to create the schema, ' +
          'or run with Payload\'s push: true option.'
        );
      }
    } finally {
      pgClient.release();
    }
  }

  private async disableForeignKeyChecks(): Promise<void> {
    const pgClient = await this.pgPool.connect();
    try {
      // Disable triggers (which includes FK checks) for the session
      await pgClient.query('SET session_replication_role = replica');
      if (config.verbose) {
        console.log('[INFO] Foreign key checks disabled');
      }
    } finally {
      pgClient.release();
    }
  }

  private async enableForeignKeyChecks(): Promise<void> {
    const pgClient = await this.pgPool.connect();
    try {
      await pgClient.query('SET session_replication_role = DEFAULT');
      if (config.verbose) {
        console.log('[INFO] Foreign key checks re-enabled');
      }
    } finally {
      pgClient.release();
    }
  }

  private async migrateTable(table: string): Promise<void> {
    const stat: MigrationStats = {
      table,
      sourceCount: 0,
      migratedCount: 0,
      errors: [],
    };

    try {
      // Get row count from SQLite
      const countResult = this.sqlite.prepare(`SELECT COUNT(*) as count FROM "${table}"`).get() as { count: number };
      stat.sourceCount = countResult.count;

      if (stat.sourceCount === 0) {
        if (config.verbose) {
          console.log(`   [SKIP] ${table}: 0 rows`);
        }
        this.stats.push(stat);
        return;
      }

      // Get all rows from SQLite
      const rows = this.sqlite.prepare(`SELECT * FROM "${table}"`).all();

      if (config.dryRun) {
        console.log(`   [DRY] ${table}: ${stat.sourceCount} rows would be migrated`);
        stat.migratedCount = stat.sourceCount;
        this.stats.push(stat);
        return;
      }

      // Get column info from PostgreSQL
      const pgClient = await this.pgPool.connect();
      try {
        // Disable FK checks for this connection
        await pgClient.query('SET session_replication_role = replica');

        // Check if table exists in PostgreSQL
        const tableCheck = await pgClient.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = $1
          )
        `, [table]);

        if (!tableCheck.rows[0].exists) {
          console.log(`   [WARN] ${table}: table does not exist in PostgreSQL (skipping)`);
          stat.errors.push('Table does not exist in PostgreSQL');
          this.stats.push(stat);
          return;
        }

        // Get PostgreSQL columns with their types
        const colResult = await pgClient.query(`
          SELECT column_name, data_type, udt_name
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1
          ORDER BY ordinal_position
        `, [table]);

        const pgColumns = new Map<string, { dataType: string; udtName: string }>();
        for (const row of colResult.rows) {
          pgColumns.set(row.column_name, {
            dataType: row.data_type,
            udtName: row.udt_name
          });
        }

        // Clear existing data
        await pgClient.query(`DELETE FROM "${table}"`);

        // Insert rows in batches
        const batchSize = 100;
        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize);

          for (const row of batch) {
            const rowObj = row as Record<string, unknown>;

            // Filter to only columns that exist in PostgreSQL
            const columns = Object.keys(rowObj).filter(col => pgColumns.has(col));
            const values = columns.map(col => {
              const val = rowObj[col];
              const colInfo = pgColumns.get(col);

              // Handle type conversions
              if (val === null || val === undefined) {
                return null;
              }

              // Handle boolean conversion (SQLite uses 0/1)
              if (colInfo && colInfo.udtName === 'bool') {
                return val === 1 || val === true || val === 'true';
              }

              // Handle JSON fields
              if (colInfo && (colInfo.udtName === 'json' || colInfo.udtName === 'jsonb')) {
                if (typeof val === 'string') {
                  try {
                    JSON.parse(val);
                    return val; // Already valid JSON string
                  } catch {
                    return JSON.stringify(val);
                  }
                }
                return JSON.stringify(val);
              }

              return val;
            });

            const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(', ');
            const columnNames = columns.map(c => `"${c}"`).join(', ');

            try {
              await pgClient.query(
                `INSERT INTO "${table}" (${columnNames}) VALUES (${placeholders})`,
                values
              );
              stat.migratedCount++;
            } catch (insertError) {
              const errorMsg = insertError instanceof Error ? insertError.message : String(insertError);
              if (config.verbose) {
                console.log(`   [ERR] ${table}: ${errorMsg}`);
              }
              stat.errors.push(`Row insert error: ${errorMsg.substring(0, 100)}`);
            }
          }
        }

        // Re-enable FK checks
        await pgClient.query('SET session_replication_role = DEFAULT');

        const status = stat.migratedCount === stat.sourceCount ? '[OK]' : '[WARN]';
        console.log(`   ${status} ${table}: ${stat.migratedCount}/${stat.sourceCount} rows`);

      } finally {
        pgClient.release();
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      stat.errors.push(errorMsg);
      console.log(`   [ERR] ${table}: ${errorMsg}`);
    }

    this.stats.push(stat);
  }

  private async resetSequences(): Promise<void> {
    console.log('\n[FIX] Resetting PostgreSQL sequences...');

    const pgClient = await this.pgPool.connect();
    try {
      // Get all tables with serial/identity columns
      const result = await pgClient.query(`
        SELECT
          t.relname AS table_name,
          a.attname AS column_name,
          pg_get_serial_sequence(t.relname::text, a.attname::text) AS sequence_name
        FROM pg_class t
        JOIN pg_attribute a ON a.attrelid = t.oid
        WHERE t.relkind = 'r'
          AND t.relnamespace = 'public'::regnamespace
          AND a.attnum > 0
          AND NOT a.attisdropped
          AND pg_get_serial_sequence(t.relname::text, a.attname::text) IS NOT NULL
      `);

      let resetCount = 0;
      for (const row of result.rows) {
        if (row.sequence_name) {
          try {
            await pgClient.query(`
              SELECT setval($1, COALESCE((SELECT MAX("${row.column_name}") FROM "${row.table_name}"), 1), true)
            `, [row.sequence_name]);
            resetCount++;
          } catch {
            // Ignore errors for sequences that don't work
          }
        }
      }

      console.log(`[OK] Reset ${resetCount} sequences`);
    } finally {
      pgClient.release();
    }
  }

  private printSummary(): void {
    console.log('');
    console.log('='.repeat(64));
    console.log('                    Migration Summary');
    console.log('='.repeat(64));

    let totalSource = 0;
    let totalMigrated = 0;
    let tablesWithErrors = 0;
    let tablesWithData = 0;

    for (const stat of this.stats) {
      totalSource += stat.sourceCount;
      totalMigrated += stat.migratedCount;
      if (stat.errors.length > 0) {
        tablesWithErrors++;
      }
      if (stat.sourceCount > 0) {
        tablesWithData++;
      }
    }

    console.log(`Tables processed: ${this.stats.length}`);
    console.log(`Tables with data: ${tablesWithData}`);
    console.log(`Total rows in source: ${totalSource}`);
    console.log(`Total rows migrated: ${totalMigrated}`);
    console.log(`Tables with errors: ${tablesWithErrors}`);

    if (tablesWithErrors > 0) {
      console.log('');
      console.log('Tables with errors:');
      for (const stat of this.stats) {
        if (stat.errors.length > 0) {
          console.log(`  ${stat.table}:`);
          for (const error of stat.errors.slice(0, 3)) {
            console.log(`    - ${error}`);
          }
          if (stat.errors.length > 3) {
            console.log(`    ... and ${stat.errors.length - 3} more errors`);
          }
        }
      }
    }

    console.log('');
    if (totalMigrated === totalSource && tablesWithErrors === 0) {
      console.log('[SUCCESS] Migration completed successfully!');
    } else if (totalMigrated > 0) {
      console.log('[PARTIAL] Migration completed with some issues. Please review errors above.');
    } else {
      console.log('[FAILED] Migration failed. Please check errors above.');
    }
  }
}

// Main execution
console.log('');
const migration = new SQLiteToPostgresMigration();
migration.run().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
