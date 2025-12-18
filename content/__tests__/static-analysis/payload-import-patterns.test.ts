/**
 * Static Analysis Test: Payload Import Patterns
 *
 * This test ensures that the Payload CMS is always imported correctly.
 *
 * The RECOMMENDED pattern (lazy-loading to avoid circular dependencies) is:
 *   import { getPayloadClient } from '@/lib/utils/get-payload-config';
 *   // Then use: const payload = await getPayloadClient();
 *
 * The LEGACY pattern (still acceptable but may cause circular dependency issues) is:
 *   import { getPayload } from 'payload';
 *   import config from '@/payload.config';
 *   // Then use: const payload = await getPayload({ config });
 *
 * The INCORRECT pattern (that breaks at runtime) is:
 *   import payload from 'payload';
 *
 * This test scans the codebase for incorrect patterns and fails if any are found.
 */

import { glob } from 'glob';
import * as fs from 'fs';
import * as path from 'path';

describe('Payload Import Patterns', () => {
  // Directories to scan for incorrect patterns
  const SCAN_DIRECTORIES = ['app/api', 'lib/services', 'lib/repositories', 'lib/middleware'];

  // File extensions to check
  const FILE_EXTENSIONS = ['ts', 'tsx'];

  // Patterns that indicate incorrect usage
  const INCORRECT_PATTERNS = [
    // Direct default import (breaks because payload instance isn't initialized)
    /import\s+payload\s+from\s+['"]payload['"]/,
    // Using payload without getPayload (indicates global usage without initialization)
    /^(?!.*getPayload).*from\s+['"]payload['"].*$/m,
  ];

  // Patterns that are acceptable
  const ACCEPTABLE_PATTERNS = [
    /import\s+{\s*getPayload\s*}\s+from\s+['"]payload['"]/,
    /import\s+type\s+.*\s+from\s+['"]payload['"]/,
    /import\s+{\s*.*Payload.*\s*}\s+from\s+['"]payload['"]/,
  ];

  /**
   * Get all TypeScript/TSX files in specified directories
   */
  async function getFilesToScan(): Promise<string[]> {
    const projectRoot = path.resolve(__dirname, '../..');
    const files: string[] = [];

    for (const dir of SCAN_DIRECTORIES) {
      const dirPath = path.join(projectRoot, dir);

      // Skip if directory doesn't exist
      if (!fs.existsSync(dirPath)) {
        continue;
      }

      for (const ext of FILE_EXTENSIONS) {
        const pattern = path.join(dirPath, `**/*.${ext}`);
        const matches = await glob(pattern, { absolute: true });
        files.push(...matches);
      }
    }

    return files;
  }

  /**
   * Check if a file contains incorrect payload import patterns
   */
  function checkFileForIncorrectPatterns(filePath: string): { hasIssue: boolean; issues: string[] } {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const issues: string[] = [];

    // Check for the most common error: direct default import
    const directImportPattern = /import\s+payload\s+from\s+['"]payload['"]/;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      if (directImportPattern.test(line)) {
        issues.push(
          `Line ${lineNumber}: Direct default import found: "${line.trim()}"\n` +
          `  Fix: Use "import { getPayload } from 'payload'" instead and call "await getPayload({ config })"`
        );
      }
    }

    return {
      hasIssue: issues.length > 0,
      issues
    };
  }

  it('should not have any files with incorrect "import payload from payload" pattern', async () => {
    const files = await getFilesToScan();
    const violations: { file: string; issues: string[] }[] = [];

    for (const file of files) {
      const result = checkFileForIncorrectPatterns(file);
      if (result.hasIssue) {
        const relativePath = path.relative(path.resolve(__dirname, '../..'), file);
        violations.push({
          file: relativePath,
          issues: result.issues
        });
      }
    }

    if (violations.length > 0) {
      const errorMessage = violations
        .map(v => `\n${v.file}:\n  ${v.issues.join('\n  ')}`)
        .join('\n');

      fail(
        `Found ${violations.length} file(s) with incorrect Payload import patterns:\n${errorMessage}\n\n` +
        `CORRECT PATTERN:\n` +
        `  import { getPayload } from 'payload';\n` +
        `  import config from '@/payload.config';\n` +
        `  // Then inside async function:\n` +
        `  const payload = await getPayload({ config });\n\n` +
        `INCORRECT PATTERN (causes "collection not found" errors at runtime):\n` +
        `  import payload from 'payload';`
      );
    }

    // Log success with count of files scanned
    console.log(`Scanned ${files.length} files for incorrect Payload import patterns - all clean!`);
  });

  it('should verify critical API routes use getPayloadClient correctly', async () => {
    const projectRoot = path.resolve(__dirname, '../..');

    // Critical routes that MUST use payload correctly
    const criticalRoutes = [
      'app/api/portal/vendors/[id]/route.ts',
      'app/api/portal/vendors/[id]/import-history/route.ts',
      'app/api/portal/vendors/register/route.ts',
      'app/api/portal/vendors/profile/route.ts',
      'app/api/admin/vendors/approval/route.ts',
      'app/api/admin/tier-upgrade-requests/route.ts',
    ];

    const missingLazyLoadImport: string[] = [];

    for (const route of criticalRoutes) {
      const filePath = path.join(projectRoot, route);

      // Skip if file doesn't exist (may not be implemented yet)
      if (!fs.existsSync(filePath)) {
        continue;
      }

      const content = fs.readFileSync(filePath, 'utf-8');

      // Check for lazy-load pattern (recommended) OR legacy pattern (acceptable)
      const hasLazyLoadImport = /import\s+{\s*getPayloadClient\s*}\s+from\s+['"]@\/lib\/utils\/get-payload-config['"]/.test(content);
      const hasLegacyPattern = /import\s+{\s*getPayload\s*}\s+from\s+['"]payload['"]/.test(content) &&
                               /import\s+config\s+from\s+['"]@\/payload\.config['"]/.test(content);

      if (!hasLazyLoadImport && !hasLegacyPattern) {
        missingLazyLoadImport.push(route);
      }
    }

    if (missingLazyLoadImport.length > 0) {
      fail(
        `Critical API routes missing proper Payload imports:\n  - ${missingLazyLoadImport.join('\n  - ')}\n\n` +
        `RECOMMENDED PATTERN (avoids circular dependencies):\n` +
        `  import { getPayloadClient } from '@/lib/utils/get-payload-config';\n` +
        `  // Then: const payload = await getPayloadClient();\n\n` +
        `LEGACY PATTERN (acceptable but may cause issues in standalone builds):\n` +
        `  import { getPayload } from 'payload';\n` +
        `  import config from '@/payload.config';\n` +
        `  // Then: const payload = await getPayload({ config });`
      );
    }
  });

  it('should ensure services that use Payload have correct imports', async () => {
    const projectRoot = path.resolve(__dirname, '../..');

    // Services known to use Payload
    const payloadServices = [
      'lib/services/ImportExecutionService.ts',
      'lib/services/TierUpgradeRequestService.ts',
      'lib/services/VendorProfileService.ts',
      'lib/services/NotificationService.ts',
      'lib/services/auth-service.ts',
    ];

    const issues: { file: string; problem: string }[] = [];

    for (const service of payloadServices) {
      const filePath = path.join(projectRoot, service);

      if (!fs.existsSync(filePath)) {
        continue;
      }

      const content = fs.readFileSync(filePath, 'utf-8');

      // Check for direct import (incorrect)
      if (/import\s+payload\s+from\s+['"]payload['"]/.test(content)) {
        issues.push({
          file: service,
          problem: 'Uses incorrect "import payload from \'payload\'" pattern'
        });
      }

      // If file uses payload operations, ensure it has proper payload access
      const usesPayloadOps = /payload\.(find|findByID|create|update|delete)/.test(content);
      const hasLazyLoad = /getPayloadClient\s*\(\s*\)/.test(content);
      const hasLegacyGetPayload = /getPayload\s*\(\s*{\s*config\s*}\s*\)/.test(content);

      if (usesPayloadOps && !hasLazyLoad && !hasLegacyGetPayload) {
        issues.push({
          file: service,
          problem: 'Uses payload operations but is not calling getPayloadClient() or getPayload({ config })'
        });
      }
    }

    if (issues.length > 0) {
      const errorMessage = issues
        .map(i => `${i.file}: ${i.problem}`)
        .join('\n');
      fail(`Service files have Payload import issues:\n\n${errorMessage}`);
    }
  });
});
