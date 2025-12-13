/**
 * Custom Playwright Test Fixtures
 *
 * Provides reusable test fixtures for common test scenarios:
 * - geocodeMock: Mocks the Photon geocoding API to avoid rate limiting
 * - emailMock: Mocks the Resend email API to capture emails without sending
 *
 * Usage:
 *   import { test, expect } from './fixtures/test-fixtures';
 *   // Now use test.beforeEach, test(), etc. with automatic mocking
 *
 * Or selectively:
 *   import { testWithGeocode, testWithEmail, testWithMocks } from './fixtures/test-fixtures';
 */

import { test as base, Page, TestInfo } from '@playwright/test';
import { GeocodeMock, GeocodeMockOptions, setupGeocodeMock } from '../helpers/geocode-mock-helpers';
import { EmailMock, EmailMockOptions, setupEmailMock } from '../helpers/email-mock-helpers';

const API_BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

/**
 * Unique test vendor data generated per-test
 * This prevents parallel tests from interfering with each other
 */
export interface UniqueTestVendor {
  id: string;
  email: string;
  password: string;
  companyName: string;
  slug: string;
  tier: 'free' | 'tier1' | 'tier2' | 'tier3';
  cleanup: () => Promise<void>;
}

/**
 * Location search selectors - use these for consistent test targeting
 */
export const LOCATION_SELECTORS = {
  // Tab to click to show location search
  locationTab: '[data-testid="search-tab-location"]',
  nameTab: '[data-testid="search-tab-name"]',
  // Location input field
  locationInput: '[data-testid="location-search-input"]',
  // Dropdown with results
  resultsDropdown: '[data-testid="location-results-dropdown"]',
  // Individual result items (use with index, e.g., `location-result-0`)
  resultItem: (index: number) => `[data-testid="location-result-${index}"]`,
  // Search button
  searchButton: '[data-testid="search-location-button"]',
  // Result count display
  resultCount: '[data-testid="result-count"]',
  // Reset button
  resetButton: '[data-testid="reset-button"]',
  // Distance slider
  distanceSlider: '[data-testid="distance-slider"]',
  distanceValue: '[data-testid="distance-value"]',
};

/**
 * Extended test fixtures with geocoding mock
 */
export type GeocodeMockFixture = {
  geocodeMock: GeocodeMock;
};

/**
 * Extended test fixtures with email mock
 */
export type EmailMockFixture = {
  emailMock: EmailMock;
};

/**
 * Extended test fixtures with both mocks
 */
export type AllMockFixtures = GeocodeMockFixture & EmailMockFixture;

/**
 * Test with geocoding mock automatically set up
 * Use this for tests that involve location search
 */
export const testWithGeocode = base.extend<GeocodeMockFixture>({
  geocodeMock: async ({ page }, use) => {
    const mock = await setupGeocodeMock(page, { verbose: false });
    await use(mock);
    await mock.teardown();
  },
});

/**
 * Test with email mock automatically set up
 * Use this for tests that involve email sending
 */
export const testWithEmail = base.extend<EmailMockFixture>({
  emailMock: async ({ page }, use) => {
    const mock = await setupEmailMock(page, { verbose: false });
    await use(mock);
    await mock.teardown();
  },
});

/**
 * Test with both geocoding and email mocks
 * Use this for tests that involve both location and email functionality
 */
export const testWithMocks = base.extend<AllMockFixtures>({
  geocodeMock: async ({ page }, use) => {
    const mock = await setupGeocodeMock(page, { verbose: false });
    await use(mock);
    await mock.teardown();
  },
  emailMock: async ({ page }, use) => {
    const mock = await setupEmailMock(page, { verbose: false });
    await use(mock);
    await mock.teardown();
  },
});

/**
 * Default export is testWithGeocode for location search tests
 * This is a common case where geocoding is needed but email is not
 */
export const test = testWithGeocode;
export { expect } from '@playwright/test';

/**
 * Helper to set up geocode mock manually (for tests that can't use fixtures)
 */
export async function setupGeocodeMockForPage(
  page: Page,
  options?: GeocodeMockOptions
): Promise<GeocodeMock> {
  return setupGeocodeMock(page, options);
}

/**
 * Helper to set up email mock manually (for tests that can't use fixtures)
 */
export async function setupEmailMockForPage(
  page: Page,
  options?: EmailMockOptions
): Promise<EmailMock> {
  return setupEmailMock(page, options);
}

/**
 * Helper to navigate to vendors page and activate location search tab
 * Use this in beforeEach for location search tests
 */
export async function goToLocationSearch(page: Page): Promise<void> {
  await page.goto('/vendors');
  await page.waitForLoadState('networkidle');
  // Click on Location tab to show location search
  await page.click(LOCATION_SELECTORS.locationTab);
  // Wait for location input to be visible
  await page.waitForSelector(LOCATION_SELECTORS.locationInput, { state: 'visible', timeout: 5000 });
}

// ============================================================================
// Unique Test Vendor Fixture
// ============================================================================

/**
 * Options for creating a unique test vendor
 */
export interface UniqueVendorOptions {
  tier?: 'free' | 'tier1' | 'tier2' | 'tier3';
  status?: 'pending' | 'approved' | 'rejected';
}

/**
 * Create a unique test vendor for isolated testing
 * Each test gets its own vendor, eliminating parallel test conflicts
 */
async function createUniqueTestVendor(
  page: Page,
  testInfo: TestInfo,
  options: UniqueVendorOptions = {}
): Promise<UniqueTestVendor> {
  const tier = options.tier || 'tier1';
  const status = options.status || 'approved';

  // Generate unique identifiers based on test ID and timestamp
  const uniqueId = `${testInfo.testId}-${Date.now()}`;
  const email = `test-${uniqueId}@e2e-test.local`;
  const password = 'TestVendor123!Unique';
  const companyName = `Test Vendor ${uniqueId.slice(-8)}`;
  const slug = `test-vendor-${uniqueId.slice(-12)}`.toLowerCase();

  console.log(`[UniqueVendor] Creating vendor: ${email} (${tier})`);

  // Create vendor via seed API
  const response = await page.request.post(`${API_BASE}/api/test/vendors/seed`, {
    data: [{
      companyName,
      email,
      password,
      slug,
      tier,
      status,
      description: `E2E test vendor for ${testInfo.title}`,
    }],
  });

  if (!response.ok()) {
    const errorText = await response.text();
    throw new Error(`Failed to create unique test vendor: ${response.status()} - ${errorText}`);
  }

  const result = await response.json();
  const vendorId = result.vendorIds?.[0] || result.created?.[0];

  if (!vendorId) {
    throw new Error(`Vendor created but no ID returned: ${JSON.stringify(result)}`);
  }

  console.log(`[UniqueVendor] Created: ${email} -> ${vendorId}`);

  // Return vendor data with cleanup function
  return {
    id: vendorId,
    email,
    password,
    companyName,
    slug,
    tier,
    cleanup: async () => {
      try {
        console.log(`[UniqueVendor] Cleaning up: ${email}`);
        // Delete via admin API
        const deleteResponse = await page.request.delete(
          `${API_BASE}/api/test/admin/vendors/${vendorId}`
        );
        if (deleteResponse.ok()) {
          console.log(`[UniqueVendor] Deleted: ${email}`);
        } else {
          console.warn(`[UniqueVendor] Delete failed for ${email}: ${deleteResponse.status()}`);
        }
      } catch (error) {
        console.warn(`[UniqueVendor] Cleanup error for ${email}:`, error);
      }
    },
  };
}

/**
 * Login as a unique test vendor and return the page
 */
async function loginAsUniqueVendor(
  page: Page,
  vendor: UniqueTestVendor
): Promise<void> {
  console.log(`[UniqueVendor] Logging in as: ${vendor.email}`);

  await page.goto(`${API_BASE}/vendor/login`);
  await page.waitForLoadState('networkidle');

  await page.getByPlaceholder('vendor@example.com').fill(vendor.email);
  await page.getByPlaceholder(/password/i).fill(vendor.password);

  await Promise.all([
    page.waitForResponse(
      (r) => r.url().includes('/api/auth/login') && r.status() === 200,
      { timeout: 15000 }
    ),
    page.getByRole('button', { name: /sign in|login/i }).click(),
  ]);

  await page.waitForURL(/\/vendor\/dashboard\/?/, { timeout: 15000 });
  console.log(`[UniqueVendor] Logged in successfully: ${vendor.email}`);
}

/**
 * Extended test fixtures with unique vendor per test
 */
export type UniqueVendorFixture = {
  uniqueVendor: UniqueTestVendor;
  uniqueVendorTier2: UniqueTestVendor;
  uniqueVendorFree: UniqueTestVendor;
};

/**
 * Test with unique vendor automatically created and cleaned up
 * Provides isolated vendor for each test - prevents parallel conflicts
 *
 * Usage:
 *   import { testWithUniqueVendor } from './fixtures/test-fixtures';
 *   testWithUniqueVendor('my test', async ({ page, uniqueVendor }) => {
 *     // uniqueVendor is a fresh, unique vendor just for this test
 *     await loginAsUniqueVendor(page, uniqueVendor);
 *     // ... test code
 *   }); // vendor is automatically cleaned up
 */
export const testWithUniqueVendor = base.extend<UniqueVendorFixture>({
  uniqueVendor: async ({ page }, use, testInfo) => {
    const vendor = await createUniqueTestVendor(page, testInfo, { tier: 'tier1' });
    await use(vendor);
    await vendor.cleanup();
  },
  uniqueVendorTier2: async ({ page }, use, testInfo) => {
    const vendor = await createUniqueTestVendor(page, testInfo, { tier: 'tier2' });
    await use(vendor);
    await vendor.cleanup();
  },
  uniqueVendorFree: async ({ page }, use, testInfo) => {
    const vendor = await createUniqueTestVendor(page, testInfo, { tier: 'free' });
    await use(vendor);
    await vendor.cleanup();
  },
});

// Export helper functions for manual use
export { createUniqueTestVendor, loginAsUniqueVendor };
