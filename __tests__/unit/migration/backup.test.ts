import * as fs from 'fs/promises';
import * as path from 'path';
import { createBackup, restoreBackup } from '../../../scripts/migration/utils/backup';

describe('Backup Utilities', () => {
  const testDir = path.resolve(__dirname, '../../fixtures/backup-test');
  const backupDir = path.resolve(__dirname, '../../fixtures/backup-test-backups');

  beforeEach(async () => {
    // Setup test directories
    await fs.mkdir(testDir, { recursive: true });
    await fs.mkdir(backupDir, { recursive: true });

    // Create test files
    await fs.writeFile(path.join(testDir, 'test1.md'), 'Test content 1');
    await fs.writeFile(path.join(testDir, 'test2.md'), 'Test content 2');
    await fs.mkdir(path.join(testDir, 'subdir'), { recursive: true });
    await fs.writeFile(path.join(testDir, 'subdir', 'test3.md'), 'Test content 3');
  });

  afterEach(async () => {
    // Cleanup test directories
    try {
      await fs.rm(testDir, { recursive: true, force: true });
      await fs.rm(backupDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('createBackup', () => {
    it('should create a timestamped backup directory', async () => {
      const backupPath = await createBackup(testDir, backupDir);

      // Verify backup path format
      expect(backupPath).toMatch(/backup-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/);

      // Verify backup directory exists
      const backupExists = await fs.access(backupPath).then(() => true).catch(() => false);
      expect(backupExists).toBe(true);

      // Verify files are copied
      const files = await fs.readdir(backupPath);
      expect(files).toContain('test1.md');
      expect(files).toContain('test2.md');
      expect(files).toContain('subdir');

      // Verify subdirectory is copied
      const subdirFiles = await fs.readdir(path.join(backupPath, 'subdir'));
      expect(subdirFiles).toContain('test3.md');

      // Verify file contents
      const content = await fs.readFile(path.join(backupPath, 'test1.md'), 'utf-8');
      expect(content).toBe('Test content 1');
    });

    it('should create backup directory if it does not exist', async () => {
      const newBackupDir = path.resolve(__dirname, '../../fixtures/new-backup-dir');

      const backupPath = await createBackup(testDir, newBackupDir);

      const backupExists = await fs.access(backupPath).then(() => true).catch(() => false);
      expect(backupExists).toBe(true);

      // Cleanup
      await fs.rm(newBackupDir, { recursive: true, force: true });
    });

    it('should handle backup of empty directory', async () => {
      const emptyDir = path.resolve(__dirname, '../../fixtures/empty-dir');
      await fs.mkdir(emptyDir, { recursive: true });

      const backupPath = await createBackup(emptyDir, backupDir);

      const backupExists = await fs.access(backupPath).then(() => true).catch(() => false);
      expect(backupExists).toBe(true);

      const files = await fs.readdir(backupPath);
      expect(files).toHaveLength(0);

      // Cleanup
      await fs.rm(emptyDir, { recursive: true, force: true });
    });

    it('should throw error for non-existent source directory', async () => {
      const nonExistentDir = path.resolve(__dirname, '../../fixtures/non-existent');

      await expect(createBackup(nonExistentDir, backupDir)).rejects.toThrow();
    });
  });

  describe('restoreBackup', () => {
    it('should restore files from backup', async () => {
      // Create a backup first
      const backupPath = await createBackup(testDir, backupDir);

      // Modify original files
      await fs.writeFile(path.join(testDir, 'test1.md'), 'Modified content');
      await fs.writeFile(path.join(testDir, 'new-file.md'), 'New file');

      // Restore from backup
      await restoreBackup(backupPath, testDir);

      // Verify original content is restored
      const content = await fs.readFile(path.join(testDir, 'test1.md'), 'utf-8');
      expect(content).toBe('Test content 1');

      // Verify new file is removed
      const files = await fs.readdir(testDir);
      expect(files).not.toContain('new-file.md');
    });

    it('should restore directory structure', async () => {
      const backupPath = await createBackup(testDir, backupDir);

      // Remove subdirectory
      await fs.rm(path.join(testDir, 'subdir'), { recursive: true });

      // Restore from backup
      await restoreBackup(backupPath, testDir);

      // Verify subdirectory is restored
      const subdirExists = await fs.access(path.join(testDir, 'subdir')).then(() => true).catch(() => false);
      expect(subdirExists).toBe(true);

      const content = await fs.readFile(path.join(testDir, 'subdir', 'test3.md'), 'utf-8');
      expect(content).toBe('Test content 3');
    });

    it('should throw error for non-existent backup', async () => {
      const nonExistentBackup = path.resolve(__dirname, '../../fixtures/non-existent-backup');

      await expect(restoreBackup(nonExistentBackup, testDir)).rejects.toThrow();
    });

    it('should handle restore to non-existent target directory', async () => {
      const backupPath = await createBackup(testDir, backupDir);
      const newTargetDir = path.resolve(__dirname, '../../fixtures/new-target-dir');

      // This should work since restore creates the directory
      await restoreBackup(backupPath, newTargetDir);

      const targetExists = await fs.access(newTargetDir).then(() => true).catch(() => false);
      expect(targetExists).toBe(true);

      // Cleanup
      await fs.rm(newTargetDir, { recursive: true, force: true });
    });
  });

  describe('Backup timestamp format', () => {
    it('should use ISO format without colons and dots', async () => {
      const backupPath = await createBackup(testDir, backupDir);
      const backupName = path.basename(backupPath);

      // Verify format: backup-YYYY-MM-DDTHH-MM-SS
      expect(backupName).toMatch(/^backup-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}$/);
    });

    it('should create unique backups for multiple calls', async () => {
      const backup1 = await createBackup(testDir, backupDir);

      // Wait a moment to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 1100));

      const backup2 = await createBackup(testDir, backupDir);

      expect(backup1).not.toBe(backup2);

      const backup1Exists = await fs.access(backup1).then(() => true).catch(() => false);
      const backup2Exists = await fs.access(backup2).then(() => true).catch(() => false);

      expect(backup1Exists).toBe(true);
      expect(backup2Exists).toBe(true);
    });
  });
});
