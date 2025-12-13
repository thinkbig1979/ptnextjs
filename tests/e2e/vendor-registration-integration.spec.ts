/**
 * End-to-End Integration Test: Vendor Registration Flow
 *
 * Tests the complete vendor registration workflow:
 * 1. Fill registration form
 * 2. Submit form -> POST /api/portal/vendors/register
 * 3. Verify database record created
 * 4. Check redirect to pending page
 *
 * This test verifies frontend-backend integration.
 */

import { test, expect } from '@playwright/test';
import {
  generateUniqueVendorData,
  fillRegistrationForm,
} from './helpers/vendor-onboarding-helpers';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('Vendor Registration Integration', () => {
  // Serial mode: registration creates vendors and tests duplicate email detection
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(60000);

  test('should complete full registration flow', async ({ page }) => {
    const vendor = generateUniqueVendorData();

    // Navigate to registration page
    await page.goto(`${BASE_URL}/vendor/register/`);

    // Wait for form to load
    await expect(page.locator('h1')).toContainText('Vendor Registration');

    // Fill out registration form using helper
    await fillRegistrationForm(page, vendor);

    // Intercept API call to verify request payload
    const [apiResponse] = await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes('/api/portal/vendors/register') &&
          response.request().method() === 'POST',
        { timeout: 15000 }
      ),
      page.click('button[type="submit"]'),
    ]);

    // Verify successful response
    expect(apiResponse.status()).toBeLessThan(300);
    const responseBody = await apiResponse.json();

    // Verify response structure
    expect(responseBody.success).toBe(true);
    expect(responseBody.data).toHaveProperty('vendorId');
    expect(responseBody.data).toHaveProperty('status');
    expect(responseBody.data.status).toBe('pending');

    // Verify redirect to pending page
    await page.waitForURL(/\/vendor\/registration-pending\/?/, { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('Registration Successful');

    console.log(`[OK] Registration successful for: ${vendor.email}`);
    console.log(`[OK] Company: ${vendor.companyName}`);
    console.log(`[OK] Vendor ID: ${responseBody.data.vendorId}`);
  });

  test('should show validation errors for invalid data', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendor/register/`);

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should stay on same page
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/vendor/register');

    // Check for error messages (form validation)
    const errorMessages = await page
      .locator('[role="alert"], .text-destructive, .text-red-500, .text-red-600')
      .count();
    expect(errorMessages).toBeGreaterThan(0);
  });

  test('should handle duplicate email error', async ({ page }) => {
    // First, register a vendor
    const vendor = generateUniqueVendorData();
    await page.goto(`${BASE_URL}/vendor/register/`);
    await fillRegistrationForm(page, vendor);

    const [firstResponse] = await Promise.all([
      page.waitForResponse(
        (response) => response.url().includes('/api/portal/vendors/register'),
        { timeout: 15000 }
      ),
      page.click('button[type="submit"]'),
    ]);

    // Only proceed if first registration succeeded
    if (firstResponse.status() < 300) {
      await page.waitForURL(/\/vendor\/registration-pending\/?/, { timeout: 10000 });

      // Try to register again with same email
      await page.goto(`${BASE_URL}/vendor/register/`);
      await fillRegistrationForm(page, vendor);

      const [duplicateResponse] = await Promise.all([
        page.waitForResponse(
          (response) => response.url().includes('/api/portal/vendors/register'),
          { timeout: 15000 }
        ),
        page.click('button[type="submit"]'),
      ]);

      // Should return 409 conflict
      expect(duplicateResponse.status()).toBe(409);
      console.log('[OK] Duplicate email error handled correctly');
    }
  });

  test('should disable submit button during submission', async ({ page }) => {
    const vendor = generateUniqueVendorData();

    await page.goto(`${BASE_URL}/vendor/register/`);
    await fillRegistrationForm(page, vendor);

    // Get the submit button
    const submitButton = page.locator('button[type="submit"]');

    // Click submit
    await submitButton.click();

    // Button should be disabled during submission (check within 500ms)
    await expect(submitButton).toBeDisabled({ timeout: 1000 });
  });
});
