import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || `${BASE_URL}';

/**
 * Comprehensive Dual Authentication System Test
 *
 * This test verifies the fix for 401 Unauthorized errors when accessing
 * Payload CMS admin panel after vendor portal routes were implemented.
 *
 * The fix: Moved vendor portal routes from /api/vendors/* to /api/portal/vendors/*
 * to prevent interception of Payload CMS authentication requests.
 */
test.describe('Dual Authentication System - 401 Error Fix', () => {
  // Rate limits are cleared in global-setup.ts, no need for beforeAll here

  const ADMIN_LOGIN_URL = `${BASE_URL}/admin/login`;
  const ADMIN_URL = `${BASE_URL}/admin`;

  test.describe('Test Suite 1: Admin Panel Accessibility', () => {
    test('Admin login page loads without 401 errors', async ({ page }) => {
      console.log('TEST: Verifying admin login page loads without 401...');

      const response = await page.goto(ADMIN_LOGIN_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

      expect(response).toBeTruthy();
      expect(response?.status()).not.toBe(401);
      expect(response?.status()).not.toBe(500);

      console.log(`✓ Admin login page loaded: HTTP ${response?.status()}`);
    });

    test('Admin panel dashboard is accessible', async ({ page }) => {
      console.log('TEST: Verifying admin dashboard is accessible...');

      const response = await page.goto(ADMIN_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

      expect(response).toBeTruthy();
      expect(response?.status()).not.toBe(401);
      expect(response?.status()).not.toBe(500);

      console.log(`✓ Admin dashboard accessible: HTTP ${response?.status()}`);
    });
  });

  test.describe('Test Suite 2: API Route Separation (CRITICAL FIX)', () => {
    test('CRITICAL - /api/vendors route is NOT returning 401', async ({ page }) => {
      console.log('TEST: CRITICAL - Verifying /api/vendors does not return 401...');

      // Use page.request instead of page.evaluate for API calls
      const response = await page.request.get(`${BASE_URL}/api/vendors`);
      const status = response.status();

      // CRITICAL: Before fix this would be 401, after fix it should not be
      expect(status).not.toBe(401);
      console.log(`✓ CRITICAL FIX VERIFIED: /api/vendors returns ${status} (NOT 401)`);
    });

    test('/api/portal/vendors routes exist and are separate', async ({ page }) => {
      console.log('TEST: Verifying /api/portal/vendors routes exist...');

      // Use page.request instead of page.evaluate for API calls
      const response = await page.request.get(`${BASE_URL}/api/portal/vendors/profile`);
      const status = response.status();

      // Should exist (may be 401 without auth, but NOT 404)
      expect(status).not.toBe(404);
      console.log(`✓ /api/portal/vendors/profile exists: HTTP ${status}`);
    });
  });

  test.describe('Test Suite 3: Vendor Portal Isolation', () => {
    test('Vendor login page is functional and separate', async ({ page }) => {
      console.log('TEST: Verifying vendor portal is accessible...');

      const response = await page.goto(`${BASE_URL}/vendor/login`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });

      expect(response?.status()).not.toBe(500);
      expect(response?.status()).not.toBe(401);

      console.log(`✓ Vendor login page accessible: HTTP ${response?.status()}`);
    });
  });

  test.describe('Test Suite 4: Summary', () => {
    test('FINAL - All authentication systems working independently', async ({ page }) => {
      console.log('\n========== FINAL TEST SUMMARY ==========\n');

      // Test admin panel
      const adminResponse = await page.goto(ADMIN_LOGIN_URL, { waitUntil: 'domcontentloaded' });
      const adminOk = adminResponse?.status() === 200;

      // Test vendor portal
      const vendorResponse = await page.goto(`${BASE_URL}/vendor/login`, { waitUntil: 'domcontentloaded' });
      const vendorOk = vendorResponse?.status() !== 500;

      // Test API routes using page.request instead of page.evaluate
      const payloadApiResponse = await page.request.get(`${BASE_URL}/api/vendors`);
      const portalApiResponse = await page.request.get(`${BASE_URL}/api/portal/vendors/profile`);

      const no401Error = payloadApiResponse.status() !== 401;
      const routesSeparated = portalApiResponse.status() !== 404;

      console.log('RESULTS:');
      console.log(`  ${adminOk ? '✓' : '✗'} Admin panel accessible`);
      console.log(`  ${vendorOk ? '✓' : '✗'} Vendor portal accessible`);
      console.log(`  ${routesSeparated ? '✓' : '✗'} Routes separated`);
      console.log(`  ${no401Error ? '✓' : '✗'} No 401 errors on /api/vendors (CRITICAL FIX)`);
      console.log('\n========================================\n');

      expect(adminOk).toBe(true);
      expect(vendorOk).toBe(true);
      expect(routesSeparated).toBe(true);
      expect(no401Error).toBe(true);
    });
  });
});
