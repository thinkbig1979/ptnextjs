/**
 * Playwright Global Setup
 *
 * This file runs ONCE before all tests to set up the test environment:
 * 1. Clears rate limits to prevent rate limiting during tests
 * 2. Seeds standard test vendors used across E2E tests
 *
 * IMPORTANT: This requires a dev server to be running BEFORE tests start.
 * Start the server with: DISABLE_EMAILS=true npm run dev
 */

import { FullConfig } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

/**
 * Standard test vendors that will be seeded before tests run
 * These match the TEST_VENDORS from helpers/test-vendors.ts
 *
 * IMPORTANT: Slugs must match exactly what tests expect!
 */
const STANDARD_TEST_VENDORS = [
  {
    companyName: 'Free Tier Test Vendor',
    slug: 'testvendor-free', // EXPLICIT SLUG - must match test-vendors.ts
    email: 'testvendor-free@test.com',
    password: 'TestVendor123!Free',
    tier: 'free' as const,
    status: 'approved' as const,
    description: 'Free tier test vendor for E2E tests',
  },
  {
    companyName: 'Tier 1 Test Vendor',
    slug: 'testvendor-tier1', // EXPLICIT SLUG - must match test-vendors.ts
    email: 'testvendor-tier1@test.com',
    password: 'TestVendor123!Tier1',
    tier: 'tier1' as const,
    status: 'approved' as const,
    description: 'Tier 1 test vendor for E2E tests',
  },
  {
    companyName: 'Tier 2 Professional Vendor',
    slug: 'testvendor-tier2', // EXPLICIT SLUG
    email: 'testvendor-tier2@test.com',
    password: 'TestVendor123!Tier2',
    tier: 'tier2' as const,
    status: 'approved' as const,
    description: 'Tier 2 test vendor for E2E tests',
  },
  {
    companyName: 'Tier 3 Premium Vendor',
    slug: 'testvendor-tier3', // EXPLICIT SLUG
    email: 'testvendor-tier3@test.com',
    password: 'TestVendor123!Tier3',
    tier: 'tier3' as const,
    status: 'approved' as const,
    description: 'Tier 3 test vendor for E2E tests',
  },
  {
    companyName: 'Mobile Test Vendor',
    slug: 'testvendor-mobile', // EXPLICIT SLUG
    email: 'testvendor-mobile@test.com',
    password: 'TestVendor123!Mobile',
    tier: 'tier1' as const,
    status: 'approved' as const,
    description: 'Mobile test vendor for E2E tests',
  },
  {
    companyName: 'Tablet Test Vendor',
    slug: 'testvendor-tablet', // EXPLICIT SLUG
    email: 'testvendor-tablet@test.com',
    password: 'TestVendor123!Tablet',
    tier: 'tier1' as const,
    status: 'approved' as const,
    description: 'Tablet test vendor for E2E tests',
  },
];

async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL = config.projects[0]?.use?.baseURL || BASE_URL;

  console.log('\n========================================');
  console.log('  PLAYWRIGHT GLOBAL SETUP');
  console.log('========================================');
  console.log(`Base URL: ${baseURL}`);

  // Step 1: Wait for server to be ready
  console.log('\n[Global Setup] Step 1: Checking server availability...');
  const serverReady = await waitForServer(baseURL, 30000);
  if (!serverReady) {
    throw new Error(
      `Server not available at ${baseURL}. Please start the dev server with: DISABLE_EMAILS=true npm run dev`
    );
  }
  console.log('[Global Setup] Server is ready!');

  // Step 2: Clear rate limits
  console.log('\n[Global Setup] Step 2: Clearing rate limits...');
  const rateLimitCleared = await clearRateLimits(baseURL);
  if (!rateLimitCleared) {
    console.warn('[Global Setup] Warning: Failed to clear rate limits. Tests may be affected.');
  } else {
    console.log('[Global Setup] Rate limits cleared successfully!');
  }

  // Step 3: Seed test vendors
  console.log('\n[Global Setup] Step 3: Seeding test vendors...');
  const vendorsSeeded = await seedTestVendors(baseURL);
  if (!vendorsSeeded) {
    console.warn('[Global Setup] Warning: Some test vendors may not have been seeded.');
  } else {
    console.log('[Global Setup] Test vendors seeded successfully!');
  }

  console.log('\n========================================');
  console.log('  GLOBAL SETUP COMPLETE');
  console.log('========================================\n');
}

/**
 * Wait for the server to be available
 */
async function waitForServer(baseURL: string, timeout: number): Promise<boolean> {
  const startTime = Date.now();
  const pollInterval = 1000;

  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(baseURL, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok || response.status === 200 || response.status === 304) {
        return true;
      }
    } catch {
      // Server not ready yet, continue waiting
    }

    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  return false;
}

/**
 * Clear all rate limits
 */
async function clearRateLimits(baseURL: string): Promise<boolean> {
  try {
    const response = await fetch(`${baseURL}/api/test/rate-limit/clear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.warn(`[Global Setup] Rate limit clear failed: ${response.status}`);
      return false;
    }

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('[Global Setup] Error clearing rate limits:', error);
    return false;
  }
}

/**
 * Seed standard test vendors
 */
async function seedTestVendors(baseURL: string): Promise<boolean> {
  try {
    console.log(`[Global Setup] Sending ${STANDARD_TEST_VENDORS.length} vendors to seed API...`);

    const response = await fetch(`${baseURL}/api/test/vendors/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(STANDARD_TEST_VENDORS),
    });

    const data = await response.json();

    // Log the response for debugging
    console.log(`[Global Setup] Seed API response status: ${response.status}`);
    console.log(`[Global Setup] Seed API response:`, JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      console.log(`[Global Setup] ✓ Successfully seeded ${data.count || data.vendorIds?.length || 0} vendors`);
      if (data.vendorIds) {
        console.log(`[Global Setup] Vendor IDs:`, data.vendorIds);
      }
      return true;
    }

    // Handle case where vendors already exist (not an error)
    if (data.errors) {
      const errorMessages = Object.values(data.errors) as string[];
      const allDuplicates = errorMessages.every(
        (msg: string) => msg.includes('duplicate') || msg.includes('already exists') || msg.includes('unique')
      );

      if (allDuplicates) {
        console.log('[Global Setup] ✓ Test vendors already exist (this is OK)');
        return true;
      }

      console.warn('[Global Setup] ⚠ Some vendor seeding errors:');
      Object.entries(data.errors).forEach(([key, msg]) => {
        console.warn(`  - ${key}: ${msg}`);
      });
    }

    // If we got here, check if at least some vendors were created
    if (data.count > 0) {
      console.log(`[Global Setup] ⚠ Partial success: ${data.count} vendors created despite errors`);
      return true;
    }

    console.error('[Global Setup] ✗ Vendor seeding failed');
    return false;
  } catch (error) {
    console.error('[Global Setup] ✗ Error seeding test vendors:', error);
    if (error instanceof Error) {
      console.error('[Global Setup] Error details:', error.message);
      console.error('[Global Setup] Stack:', error.stack);
    }
    return false;
  }
}

export default globalSetup;
