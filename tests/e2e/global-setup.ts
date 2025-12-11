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
import http from 'http';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

/**
 * Standard test vendors that will be seeded before tests run
 * These match the TEST_VENDORS from helpers/test-vendors.ts
 */
const STANDARD_TEST_VENDORS = [
  {
    companyName: 'Free Tier Test Vendor',
    email: 'testvendor-free@example.com',
    password: 'TestVendor123!Free',
    tier: 'free' as const,
    status: 'approved' as const,
    description: 'Free tier test vendor for E2E tests',
    slug: 'testvendor-free', // Explicit slug matching test expectations
  },
  {
    companyName: 'Tier 1 Test Vendor',
    email: 'testvendor-tier1@example.com',
    password: 'TestVendor123!Tier1',
    tier: 'tier1' as const,
    status: 'approved' as const,
    description: 'Tier 1 test vendor for E2E tests',
    slug: 'testvendor-tier1', // Explicit slug matching test expectations
  },
  {
    companyName: 'Tier 2 Professional Vendor',
    email: 'testvendor-tier2@example.com',
    password: 'TestVendor123!Tier2',
    tier: 'tier2' as const,
    status: 'approved' as const,
    description: 'Tier 2 test vendor for E2E tests',
    slug: 'testvendor-tier2', // Explicit slug matching test expectations
  },
  {
    companyName: 'Tier 3 Premium Vendor',
    email: 'testvendor-tier3@example.com',
    password: 'TestVendor123!Tier3',
    tier: 'tier3' as const,
    status: 'approved' as const,
    description: 'Tier 3 test vendor for E2E tests',
    slug: 'testvendor-tier3', // Explicit slug matching test expectations
  },
  {
    companyName: 'Mobile Test Vendor',
    email: 'testvendor-mobile@example.com',
    password: 'TestVendor123!Mobile',
    tier: 'tier1' as const,
    status: 'approved' as const,
    description: 'Mobile test vendor for E2E tests',
    slug: 'testvendor-mobile', // Explicit slug matching test expectations
  },
  {
    companyName: 'Tablet Test Vendor',
    email: 'testvendor-tablet@example.com',
    password: 'TestVendor123!Tablet',
    tier: 'tier1' as const,
    status: 'approved' as const,
    description: 'Tablet test vendor for E2E tests',
    slug: 'testvendor-tablet', // Explicit slug matching test expectations
  },
  // Location mapping test vendors
  {
    companyName: 'Alfa Laval',
    email: 'alfa-laval@test.example.com',
    password: 'TestVendor123!AlfaLaval',
    tier: 'tier2' as const,
    status: 'approved' as const,
    description: 'Alfa Laval - World leader in heat transfer and fluid handling',
    slug: 'alfa-laval',
    locations: [
      {
        name: 'Alfa Laval HQ',
        city: 'Lund',
        country: 'Sweden',
        latitude: 55.7058,
        longitude: 13.1932,
        isHQ: true,
      },
    ],
  },
  {
    companyName: 'Caterpillar Marine',
    email: 'caterpillar-marine@test.example.com',
    password: 'TestVendor123!CatMarine',
    tier: 'tier2' as const,
    status: 'approved' as const,
    description: 'Caterpillar Marine - Marine propulsion and power solutions',
    slug: 'caterpillar-marine',
    locations: [
      {
        name: 'Caterpillar Marine HQ',
        city: 'Peoria',
        country: 'United States',
        latitude: 40.6936,
        longitude: -89.5890,
        isHQ: true,
      },
    ],
  },
  {
    companyName: 'Crestron Electronics',
    email: 'crestron@test.example.com',
    password: 'TestVendor123!Crestron',
    tier: 'tier2' as const,
    status: 'approved' as const,
    description: 'Crestron - Automation and control solutions for yachts',
    slug: 'crestron',
    locations: [
      {
        name: 'Crestron HQ',
        city: 'Rockleigh',
        country: 'United States',
        latitude: 41.0198,
        longitude: -74.0291,
        isHQ: true,
      },
    ],
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
  const serverReady = await waitForServer(baseURL, 60000);
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
 * Wait for the server to be available using http module
 * This is more reliable than fetch in Playwright's execution environment
 */
async function waitForServer(baseURL: string, timeout: number): Promise<boolean> {
  const startTime = Date.now();
  const pollInterval = 500; // Check more frequently

  while (Date.now() - startTime < timeout) {
    try {
      const isReady = await new Promise<boolean>((resolve) => {
        const req = http.get(baseURL, { timeout: 5000 }, (res) => {
          resolve(res.statusCode === 200 || res.statusCode === 304);
          res.resume(); // Consume response data to free up memory
        });

        req.on('error', () => resolve(false));
        req.on('timeout', () => {
          req.destroy();
          resolve(false);
        });
      });

      if (isReady) {
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
    const response = await fetch(`${baseURL}/api/test/vendors/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(STANDARD_TEST_VENDORS),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Report what happened
      if (data.existing > 0 && data.created > 0) {
        console.log(`[Global Setup] Created ${data.created} vendors, ${data.existing} already existed`);
      } else if (data.existing > 0) {
        console.log(`[Global Setup] All ${data.existing} test vendors already exist (OK)`);
      } else {
        console.log(`[Global Setup] Seeded ${data.created || data.count || 0} vendors`);
      }
      return true;
    }

    // Handle case where vendors already exist (not an error)
    if (data.errors) {
      const errorMessages = Object.values(data.errors) as string[];
      const allDuplicates = errorMessages.every(
        (msg: string) =>
          msg.includes('duplicate') ||
          msg.includes('already exists') ||
          msg.includes('unique') ||
          msg.includes('email') // Payload returns "field is invalid: email" for duplicate emails
      );

      if (allDuplicates) {
        console.log('[Global Setup] Test vendors already exist (this is OK)');
        return true;
      }

      console.warn('[Global Setup] Some vendor seeding errors:', data.errors);
    }

    return data.success !== false;
  } catch (error) {
    console.error('[Global Setup] Error seeding test vendors:', error);
    return false;
  }
}

export default globalSetup;
