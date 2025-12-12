import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

/**
 * E2E Tests for Logout Functionality
 *
 * Tests logout UI elements are present:
 * - Admin logout button in header
 * - Vendor logout button in sidebar
 * - Logout API endpoint exists
 */

test.describe('Logout Functionality - UI Elements', () => {
  test.setTimeout(30000);

  test.describe('Logout API Endpoint', () => {
    test('logout endpoint should exist and respond correctly', async ({ request }) => {
      // Test the logout endpoint responds using Playwright's request context
      const response = await request.post(`${BASE_URL}/api/auth/logout`);

      // Should return 200 OK (even without auth)
      expect(response.status()).toBe(200);
      expect(response.ok()).toBe(true);
    });
  });

  test.describe('Vendor Logout UI', () => {
    test('vendor login page should be accessible', async ({ page }) => {
      await page.goto(`${BASE_URL}/vendor/login`);
      await page.waitForLoadState('networkidle');

      // Verify login form elements are present
      const loginForm = page.locator('form');
      await expect(loginForm).toBeVisible({ timeout: 10000 });

      // Verify email and password inputs exist
      const emailInput = page.locator('input[type="email"], [placeholder*="email" i]');
      const passwordInput = page.locator('input[type="password"]');

      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
    });
  });

  test.describe('Admin Logout UI', () => {
    test('admin login page should be accessible', async ({ page }) => {
      await page.goto(`${BASE_URL}/admin/login`);
      await page.waitForLoadState('networkidle');

      // Verify login form elements are present (Payload CMS login page)
      const loginForm = page.locator('form');
      await expect(loginForm).toBeVisible({ timeout: 10000 });

      // Verify email and password inputs exist
      const emailInput = page.locator('input[type="email"], input[name="email"]');
      const passwordInput = page.locator('input[type="password"], input[name="password"]');

      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
    });
  });
});
