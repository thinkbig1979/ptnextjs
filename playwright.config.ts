import { defineConfig, devices } from '@playwright/test';
import { TEST_TIERS, FEATURE_GROUPS } from './tests/e2e/test-inventory';

/**
 * Playwright Configuration for E2E Tests
 *
 * TIERED TEST EXECUTION:
 * - npm run test:e2e:smoke     - Critical paths only (~5 min)
 * - npm run test:e2e:core      - Main features (~20 min)
 * - npm run test:e2e:full      - Complete suite (~60 min)
 * - npm run test:e2e:feature   - Specific feature group
 *
 * PARALLEL EXECUTION:
 * - Uses Playwright's built-in sharding for CI
 * - Local: auto-detect workers based on CPU
 *
 * See https://playwright.dev/docs/test-configuration
 */

// Environment-based configuration
const isCI = !!process.env.CI;
const tier = process.env.TEST_TIER || 'full';
const feature = process.env.TEST_FEATURE;

// Get test files based on tier or feature
function getTestFiles(): string[] {
  if (feature && feature in FEATURE_GROUPS) {
    return FEATURE_GROUPS[feature as keyof typeof FEATURE_GROUPS].map(
      (f) => `tests/e2e/${f}`
    );
  }

  switch (tier) {
    case 'smoke':
      return TEST_TIERS.smoke.map((f) => `tests/e2e/${f}`);
    case 'core':
      return [...TEST_TIERS.smoke, ...TEST_TIERS.core].map(
        (f) => `tests/e2e/${f}`
      );
    case 'regression':
      return TEST_TIERS.regression.map((f) => `tests/e2e/${f}`);
    case 'quarantine':
      return TEST_TIERS.quarantine.map((f) => `tests/e2e/${f}`);
    case 'full':
    default:
      // Full = smoke + core + regression (excludes quarantine)
      return [
        ...TEST_TIERS.smoke,
        ...TEST_TIERS.core,
        ...TEST_TIERS.regression,
      ].map((f) => `tests/e2e/${f}`);
  }
}

export default defineConfig({
  testDir: './tests/e2e',

  // Only run tests from the selected tier/feature
  testMatch: getTestFiles().map((f) => f.replace('tests/e2e/', '')),

  // Global setup - runs once before all tests
  globalSetup: require.resolve('./tests/e2e/global-setup.ts'),

  // Parallel execution
  fullyParallel: true,

  // Fail on test.only in CI
  forbidOnly: isCI,

  // Retries: handle network-flaky tests (ECONNRESET errors)
  // Local: 1 retry for network issues, CI: 2 retries for full resilience
  retries: isCI ? 2 : 1,

  // Workers: auto-detect locally, limit in CI
  workers: isCI ? 4 : undefined,

  // Reporter configuration based on environment
  reporter: isCI
    ? [
        ['github'] as ['github'],
        ['html', { outputFolder: 'playwright-report', open: 'never' }] as ['html', { outputFolder: string; open: string }],
        ['json', { outputFile: 'test-results/results.json' }] as ['json', { outputFile: string }],
      ]
    : [
        ['list'] as ['list'],
        ['html', { outputFolder: 'playwright-report', open: 'on-failure' }] as ['html', { outputFolder: string; open: string }],
      ],

  // Global settings
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 30000,
    video: isCI ? 'on-first-retry' : 'off',
  },

  // Test timeout (2 min default, can be overridden per test)
  timeout: 120000,

  // Assertion timeout
  expect: {
    timeout: 10000,
  },

  // Browser configuration
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment for cross-browser testing:
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],

  // Output directory for test artifacts
  outputDir: 'test-results/',

  /*
   * Web server configuration DISABLED
   * Start the dev server manually: DISABLE_EMAILS=true npm run dev
   */
});
