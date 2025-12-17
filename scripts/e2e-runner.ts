#!/usr/bin/env npx tsx
/**
 * E2E Test Runner - Tiered Test Execution with Reporting
 *
 * Usage:
 *   npx tsx scripts/e2e-runner.ts [options]
 *
 * Options:
 *   --tier=smoke|core|regression|full  Select test tier (default: smoke)
 *   --feature=auth|tiers|...           Run specific feature group
 *   --list                             List available tiers and features
 *   --workers=N                        Number of parallel workers
 *   --headed                           Run in headed browser mode
 *   --debug                            Run in debug mode
 *   --no-server-check                  Skip server check
 *   --help                             Show this help
 */

import { spawn, execSync } from 'child_process';
import { TEST_TIERS, FEATURE_GROUPS, TIER_METADATA } from '../tests/e2e/test-inventory';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log('');
  log(`${'='.repeat(60)}`, 'dim');
  log(`  ${title}`, 'bright');
  log(`${'='.repeat(60)}`, 'dim');
}

function parseArgs(): {
  tier: string;
  feature?: string;
  list: boolean;
  workers?: number;
  headed: boolean;
  debug: boolean;
  noServerCheck: boolean;
  help: boolean;
} {
  const args = process.argv.slice(2);
  const result = {
    tier: 'smoke',
    feature: undefined as string | undefined,
    list: false,
    workers: undefined as number | undefined,
    headed: false,
    debug: false,
    noServerCheck: false,
    help: false,
  };

  for (const arg of args) {
    if (arg === '--list') result.list = true;
    else if (arg === '--help' || arg === '-h') result.help = true;
    else if (arg === '--headed') result.headed = true;
    else if (arg === '--debug') result.debug = true;
    else if (arg === '--no-server-check') result.noServerCheck = true;
    else if (arg.startsWith('--tier=')) result.tier = arg.split('=')[1];
    else if (arg.startsWith('--feature=')) result.feature = arg.split('=')[1];
    else if (arg.startsWith('--workers=')) result.workers = parseInt(arg.split('=')[1]);
  }

  return result;
}

function showHelp() {
  log(`
E2E Test Runner - Tiered Test Execution
`, 'cyan');
  log(`USAGE:`, 'bright');
  log(`  npx tsx scripts/e2e-runner.ts [options]`);
  log(`  npm run test:e2e:run -- [options]`);

  log(`
TIERS:`, 'bright');
  log(`  --tier=smoke       Critical paths only (~5 min)`, 'green');
  log(`  --tier=core        Main features (~20 min)`, 'yellow');
  log(`  --tier=regression  Edge cases (~45 min)`, 'blue');
  log(`  --tier=full        Complete suite (~60 min)`);
  log(`  --tier=quarantine  Debug tests only`, 'dim');

  log(`
FEATURES:`, 'bright');
  Object.keys(FEATURE_GROUPS).forEach((f) => {
    log(`  --feature=${f}`);
  });

  log(`
OPTIONS:`, 'bright');
  log(`  --list             List all tiers and test counts`);
  log(`  --workers=N        Number of parallel workers`);
  log(`  --headed           Run in headed browser mode`);
  log(`  --debug            Run in Playwright debug mode`);
  log(`  --no-server-check  Skip dev server check`);

  log(`
EXAMPLES:`, 'bright');
  log(`  npm run test:e2e:smoke              # Quick validation`);
  log(`  npm run test:e2e:core               # PR validation`);
  log(`  npm run test:e2e:run -- --tier=core --workers=4`);
  log(`  npm run test:e2e:auth               # Auth tests only`);
  console.log('');
}

function showList() {
  logSection('TEST TIERS');

  const tierKeys = ['smoke', 'core', 'regression', 'quarantine'] as const;

  for (const tier of tierKeys) {
    const tests = TEST_TIERS[tier];
    const meta = TIER_METADATA[tier];
    const color =
      tier === 'smoke'
        ? 'green'
        : tier === 'core'
          ? 'yellow'
          : tier === 'regression'
            ? 'blue'
            : 'dim';

    log(`
${meta.name} (${tests.length} files)`, color as keyof typeof colors);
    log(`  ${meta.description}`, 'dim');
    log(`  Target: ${meta.targetDuration} | Run on: ${meta.runOn}`, 'dim');
  }

  // Show cumulative counts
  const smokeCount = TEST_TIERS.smoke.length;
  const coreCount = TEST_TIERS.smoke.length + TEST_TIERS.core.length;
  const fullCount =
    TEST_TIERS.smoke.length + TEST_TIERS.core.length + TEST_TIERS.regression.length;

  log(`
CUMULATIVE:`, 'bright');
  log(`  smoke:      ${smokeCount} files`, 'green');
  log(`  core:       ${coreCount} files (smoke + core)`, 'yellow');
  log(`  full:       ${fullCount} files (smoke + core + regression)`, 'blue');
  log(`  quarantine: ${TEST_TIERS.quarantine.length} files (excluded from full)`, 'dim');

  logSection('FEATURE GROUPS');

  for (const [feature, tests] of Object.entries(FEATURE_GROUPS)) {
    log(`  ${feature.padEnd(20)} ${tests.length} files`);
  }

  console.log('');
}

async function checkServer(): Promise<boolean> {
  try {
    execSync('curl -sf --max-time 2 http://localhost:3000 > /dev/null', {
      stdio: 'pipe',
    });
    return true;
  } catch {
    return false;
  }
}

async function clearRateLimits(): Promise<void> {
  try {
    execSync(
      'curl -sf -X POST http://localhost:3000/api/test/rate-limit/clear > /dev/null 2>&1',
      { stdio: 'pipe' }
    );
    log('  Rate limits cleared', 'dim');
  } catch {
    log('  Could not clear rate limits (endpoint may not exist)', 'dim');
  }
}

function getTestCount(tier: string, feature?: string): number {
  if (feature && feature in FEATURE_GROUPS) {
    return FEATURE_GROUPS[feature as keyof typeof FEATURE_GROUPS].length;
  }

  switch (tier) {
    case 'smoke':
      return TEST_TIERS.smoke.length;
    case 'core':
      return TEST_TIERS.smoke.length + TEST_TIERS.core.length;
    case 'regression':
      return TEST_TIERS.regression.length;
    case 'quarantine':
      return TEST_TIERS.quarantine.length;
    case 'full':
    default:
      return (
        TEST_TIERS.smoke.length + TEST_TIERS.core.length + TEST_TIERS.regression.length
      );
  }
}

async function runTests(options: ReturnType<typeof parseArgs>): Promise<number> {
  const { tier, feature, workers, headed, debug, noServerCheck } = options;
  const testCount = getTestCount(tier, feature);

  logSection(`E2E TEST RUNNER`);

  // Show what we're running
  if (feature) {
    log(`  Feature: ${feature}`, 'cyan');
  } else {
    const meta = TIER_METADATA[tier as keyof typeof TIER_METADATA];
    log(`  Tier: ${meta?.name || tier}`, 'cyan');
    if (meta) {
      log(`  ${meta.description}`, 'dim');
    }
  }
  log(`  Files: ${testCount}`, 'dim');

  // Check server
  if (!noServerCheck) {
    log(`
Checking dev server...`, 'bright');
    const serverUp = await checkServer();
    if (!serverUp) {
      log(`  Server not running at http://localhost:3000`, 'red');
      log(`  Start with: DISABLE_EMAILS=true npm run dev`, 'yellow');
      return 1;
    }
    log(`  Server is running`, 'green');
  }

  // Clear rate limits
  log(`
Preparing test environment...`, 'bright');
  await clearRateLimits();

  // Build playwright command
  const env = {
    ...process.env,
    TEST_TIER: tier,
    TEST_FEATURE: feature || '',
    DISABLE_EMAILS: 'true',
    E2E_TEST: 'true',
  };

  const args = ['test'];
  if (workers) args.push(`--workers=${workers}`);
  if (headed) args.push('--headed');
  if (debug) args.push('--debug');

  log(`
Running tests...`, 'bright');
  log(`  Command: playwright ${args.join(' ')}`, 'dim');
  console.log('');

  const startTime = Date.now();

  return new Promise((resolve) => {
    const proc = spawn('npx', ['playwright', ...args], {
      env,
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    proc.on('close', (code) => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);

      logSection('TEST SUMMARY');
      log(`  Duration: ${duration}s`);
      log(`  Files: ${testCount}`);

      if (code === 0) {
        log(`  Status: PASSED`, 'green');
      } else {
        log(`  Status: FAILED (exit code ${code})`, 'red');
        log(`
  View report: npx playwright show-report`, 'yellow');
      }
      console.log('');

      resolve(code || 0);
    });

    proc.on('error', (err) => {
      log(`  Error: ${err.message}`, 'red');
      resolve(1);
    });
  });
}

// Main
async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  if (options.list) {
    showList();
    process.exit(0);
  }

  const exitCode = await runTests(options);
  process.exit(exitCode);
}

main().catch((err) => {
  log(`Error: ${err.message}`, 'red');
  process.exit(1);
});
