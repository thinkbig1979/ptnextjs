import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Create timestamped backup of content directory
 */
export async function createBackup(sourceDir: string, backupDir: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupPath = path.join(backupDir, `backup-${timestamp}`);

  console.log(`📦 Creating backup: ${backupPath}`);

  // Ensure backup directory exists
  await fs.mkdir(backupDir, { recursive: true });

  // Copy directory recursively
  await execAsync(`cp -r "${sourceDir}" "${backupPath}"`);

  console.log(`✅ Backup created successfully`);
  return backupPath;
}

/**
 * Restore from backup
 */
export async function restoreBackup(backupPath: string, targetDir: string): Promise<void> {
  console.log(`♻️ Restoring from backup: ${backupPath}`);

  // Remove current directory
  await execAsync(`rm -rf "${targetDir}"`);

  // Restore from backup
  await execAsync(`cp -r "${backupPath}" "${targetDir}"`);

  console.log(`✅ Backup restored successfully`);
}
