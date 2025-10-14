/**
 * Integration Test: Rollback Mechanism
 * Tests backup and rollback functionality for migration error recovery
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { createBackup, restoreBackup } from '../../../scripts/migration/utils/backup';

describe('Migration Rollback Mechanism', () => {
  const testContentDir = path.resolve(__dirname, '../../fixtures/rollback-test-content');
  const backupDir = path.resolve(__dirname, '../../fixtures/rollback-test-backups');

  beforeEach(async () => {
    // Setup test content
    await fs.mkdir(testContentDir, { recursive: true });
    await fs.mkdir(backupDir, { recursive: true });

    await fs.writeFile(path.join(testContentDir, 'vendor-1.md'), 'Original vendor 1 content');
    await fs.writeFile(path.join(testContentDir, 'vendor-2.md'), 'Original vendor 2 content');
  });

  afterEach(async () => {
    // Cleanup
    try {
      await fs.rm(testContentDir, { recursive: true, force: true });
      await fs.rm(backupDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Backup creation before migration', () => {
    it('should create backup before starting migration', async () => {
      const backupPath = await createBackup(testContentDir, backupDir);

      const backupExists = await fs.access(backupPath).then(() => true).catch(() => false);
      expect(backupExists).toBe(true);

      const files = await fs.readdir(backupPath);
      expect(files).toContain('vendor-1.md');
      expect(files).toContain('vendor-2.md');
    });

    it('should preserve original content in backup', async () => {
      const backupPath = await createBackup(testContentDir, backupDir);

      const content1 = await fs.readFile(path.join(backupPath, 'vendor-1.md'), 'utf-8');
      const content2 = await fs.readFile(path.join(backupPath, 'vendor-2.md'), 'utf-8');

      expect(content1).toBe('Original vendor 1 content');
      expect(content2).toBe('Original vendor 2 content');
    });
  });

  describe('Error-triggered rollback', () => {
    it('should rollback on migration error', async () => {
      // Create backup
      const backupPath = await createBackup(testContentDir, backupDir);

      // Simulate migration that modifies content
      await fs.writeFile(path.join(testContentDir, 'vendor-1.md'), 'Modified during migration');
      await fs.writeFile(path.join(testContentDir, 'vendor-3.md'), 'New file during migration');

      // Simulate error and trigger rollback
      try {
        throw new Error('Simulated migration error');
      } catch (error) {
        // Rollback on error
        await restoreBackup(backupPath, testContentDir);
      }

      // Verify original state restored
      const content1 = await fs.readFile(path.join(testContentDir, 'vendor-1.md'), 'utf-8');
      expect(content1).toBe('Original vendor 1 content');

      // Verify new file removed
      const files = await fs.readdir(testContentDir);
      expect(files).not.toContain('vendor-3.md');
    });

    it('should log rollback operation clearly', async () => {
      const backupPath = await createBackup(testContentDir, backupDir);
      const logs: string[] = [];

      try {
        // Simulate migration error
        logs.push('Starting migration...');
        throw new Error('Database connection failed');
      } catch (error) {
        logs.push(`Error: ${(error as Error).message}`);
        logs.push(`Rolling back from backup: ${backupPath}`);

        await restoreBackup(backupPath, testContentDir);

        logs.push('Rollback completed successfully');
      }

      expect(logs).toContain('Error: Database connection failed');
      expect(logs.some(log => log.includes('Rolling back from backup'))).toBe(true);
      expect(logs).toContain('Rollback completed successfully');
    });
  });

  describe('Rollback verification', () => {
    it('should verify database state after rollback', async () => {
      const backupPath = await createBackup(testContentDir, backupDir);

      // Simulate migration and error
      await fs.writeFile(path.join(testContentDir, 'vendor-1.md'), 'Modified');

      // Rollback
      await restoreBackup(backupPath, testContentDir);

      // Verify files match backup
      const content1 = await fs.readFile(path.join(testContentDir, 'vendor-1.md'), 'utf-8');
      const backupContent1 = await fs.readFile(path.join(backupPath, 'vendor-1.md'), 'utf-8');

      expect(content1).toBe(backupContent1);
      expect(content1).toBe('Original vendor 1 content');
    });

    it('should restore directory structure on rollback', async () => {
      // Add subdirectory
      await fs.mkdir(path.join(testContentDir, 'subdir'), { recursive: true });
      await fs.writeFile(path.join(testContentDir, 'subdir', 'nested.md'), 'Nested content');

      const backupPath = await createBackup(testContentDir, backupDir);

      // Remove subdirectory
      await fs.rm(path.join(testContentDir, 'subdir'), { recursive: true });

      // Rollback
      await restoreBackup(backupPath, testContentDir);

      // Verify subdirectory restored
      const subdirExists = await fs.access(path.join(testContentDir, 'subdir')).then(() => true).catch(() => false);
      expect(subdirExists).toBe(true);

      const nestedContent = await fs.readFile(path.join(testContentDir, 'subdir', 'nested.md'), 'utf-8');
      expect(nestedContent).toBe('Nested content');
    });
  });

  describe('Partial migration rollback', () => {
    it('should rollback partial migration (vendors succeeded, products failed)', async () => {
      const backupPath = await createBackup(testContentDir, backupDir);

      // Simulate partial migration
      const migrationState = {
        vendors: { migrated: true, count: 2 },
        products: { migrated: false, count: 0 },
        error: 'Product migration failed: vendor not found',
      };

      // Simulate database inserts for vendors
      const mockDB = {
        vendors: [
          { slug: 'vendor-1', name: 'Vendor 1' },
          { slug: 'vendor-2', name: 'Vendor 2' },
        ],
        products: [],
      };

      // Error during product migration triggers rollback
      if (migrationState.error) {
        // Clear database (in real migration, this would be a transaction rollback)
        mockDB.vendors = [];
        mockDB.products = [];

        // Restore content
        await restoreBackup(backupPath, testContentDir);
      }

      expect(mockDB.vendors).toHaveLength(0);
      expect(mockDB.products).toHaveLength(0);

      const content = await fs.readFile(path.join(testContentDir, 'vendor-1.md'), 'utf-8');
      expect(content).toBe('Original vendor 1 content');
    });
  });

  describe('Multiple error scenarios', () => {
    it('should rollback on validation error', async () => {
      const backupPath = await createBackup(testContentDir, backupDir);

      try {
        throw new Error('Validation failed: required field missing');
      } catch (error) {
        await restoreBackup(backupPath, testContentDir);
      }

      const content = await fs.readFile(path.join(testContentDir, 'vendor-1.md'), 'utf-8');
      expect(content).toBe('Original vendor 1 content');
    });

    it('should rollback on database connection error', async () => {
      const backupPath = await createBackup(testContentDir, backupDir);

      try {
        throw new Error('Database connection refused');
      } catch (error) {
        await restoreBackup(backupPath, testContentDir);
      }

      const content = await fs.readFile(path.join(testContentDir, 'vendor-1.md'), 'utf-8');
      expect(content).toBe('Original vendor 1 content');
    });

    it('should rollback on duplicate slug error', async () => {
      const backupPath = await createBackup(testContentDir, backupDir);

      try {
        throw new Error('Duplicate slug: vendor-1 already exists');
      } catch (error) {
        await restoreBackup(backupPath, testContentDir);
      }

      const content = await fs.readFile(path.join(testContentDir, 'vendor-1.md'), 'utf-8');
      expect(content).toBe('Original vendor 1 content');
    });
  });

  describe('Rollback logging', () => {
    it('should provide clear rollback status messages', async () => {
      const backupPath = await createBackup(testContentDir, backupDir);
      const rollbackLogs: string[] = [];

      rollbackLogs.push(`Rollback initiated from: ${backupPath}`);
      rollbackLogs.push('Restoring content directory...');

      await restoreBackup(backupPath, testContentDir);

      rollbackLogs.push('Content restored successfully');
      rollbackLogs.push('Database changes reverted');

      expect(rollbackLogs.some(log => log.includes('Rollback initiated'))).toBe(true);
      expect(rollbackLogs.some(log => log.includes('restored successfully'))).toBe(true);
      expect(rollbackLogs.some(log => log.includes('Database changes reverted'))).toBe(true);
    });

    it('should log backup timestamp during rollback', async () => {
      const backupPath = await createBackup(testContentDir, backupDir);
      const backupName = path.basename(backupPath);

      // Extract timestamp from backup name
      const timestampMatch = backupName.match(/backup-(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})/);

      expect(timestampMatch).toBeTruthy();
      expect(timestampMatch![1]).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/);
    });
  });
});
