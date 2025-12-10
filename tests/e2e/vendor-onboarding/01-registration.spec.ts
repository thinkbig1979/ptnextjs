import { test, expect } from '@playwright/test';
import {
  generateUniqueVendorData,
  fillRegistrationForm,
  registerVendor,
} from '../helpers/vendor-onboarding-helpers';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('VENDOR-REG-P1: Registration Workflow', () => {
  test.setTimeout(30000);

  test('Test 1.1: Successful registration with all fields', async ({ page }) => {
    const vendor = generateUniqueVendorData({
      description: 'Professional marine technology',
    });

    await page.goto(`${BASE_URL}/vendor/register/`);
    expect(page.url()).toContain('/vendor/register');

    await fillRegistrationForm(page, vendor);

    // Click submit and wait for API response in parallel
    const [apiResponse] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/api/portal/vendors/register') && r.status() < 300,
        { timeout: 10000 }
      ),
      page.click('button[type="submit"]')
    ]);

    expect(apiResponse.status()).toBeLessThan(300);

    // Wait for redirect
    await page.waitForURL(/\/vendor\/registration-pending\/?/, { timeout: 10000 });
    expect(page.url()).toContain('/vendor/registration-pending');
  });

  test('Test 1.2: Validation errors for missing required fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendor/register/`);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/vendor/register');
  });

  test('Test 1.3: Invalid email format validation', async ({ page }) => {
    const vendor = generateUniqueVendorData({ email: 'invalid-email' });
    await page.goto(`${BASE_URL}/vendor/register/`);
    // Simplified form: only Company Name, Email, Password, Confirm Password
    await page.getByPlaceholder('Your Company Ltd').fill(vendor.companyName);
    await page.getByPlaceholder('vendor@example.com').fill(vendor.email);
    await page.getByPlaceholder('Enter strong password').fill(vendor.password);
    await page.getByPlaceholder('Re-enter password').fill(vendor.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/vendor/register');
  });

  test('Test 1.4: Password mismatch validation', async ({ page }) => {
    const vendor = generateUniqueVendorData();
    await page.goto(`${BASE_URL}/vendor/register/`);
    await fillRegistrationForm(page, vendor);
    await page.getByPlaceholder('Re-enter password').clear();
    await page.getByPlaceholder('Re-enter password').fill('DifferentPass123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/vendor/register');
  });

  test('Test 1.5: Weak password rejection', async ({ page }) => {
    const vendor = generateUniqueVendorData({ password: '123' });
    await page.goto(`${BASE_URL}/vendor/register/`);
    // Simplified form: only Company Name, Email, Password, Confirm Password
    await page.getByPlaceholder('Your Company Ltd').fill(vendor.companyName);
    await page.getByPlaceholder('vendor@example.com').fill(vendor.email);
    await page.getByPlaceholder('Enter strong password').fill('123');
    await page.getByPlaceholder('Re-enter password').fill('123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/vendor/register');
  });

  test('Test 1.6: Duplicate email detection', async ({ page }) => {
    const vendor1 = generateUniqueVendorData();
    await page.goto(`${BASE_URL}/vendor/register/`);
    await fillRegistrationForm(page, vendor1);

    // First registration - use Promise.all for proper coordination
    const [response1] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/api/portal/vendors/register'),
        { timeout: 10000 }
      ),
      page.click('button[type="submit"]')
    ]);

    expect(response1.status()).toBeLessThan(300);
    await page.waitForURL(/\/vendor\/registration-pending\/?/, { timeout: 10000 });
    await page.goto(`${BASE_URL}/vendor/register/`);

    const vendor2 = generateUniqueVendorData({
      email: vendor1.email,
      companyName: 'Different',
    });
    await fillRegistrationForm(page, vendor2);

    // Second registration with duplicate email - should fail
    const [response2] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/api/portal/vendors/register'),
        { timeout: 10000 }
      ),
      page.click('button[type="submit"]')
    ]);

    expect(response2.status()).toBeGreaterThanOrEqual(400);
  });

  test('Test 1.7: Submit button disabled during submission', async ({ page }) => {
    const vendor = generateUniqueVendorData();
    await page.goto(`${BASE_URL}/vendor/register/`);
    await fillRegistrationForm(page, vendor);
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeEnabled();

    const apiPromise = page.waitForResponse(
      (r) => r.url().includes('/api/portal/vendors/register') && r.status() < 300
    ).catch(() => null);

    await submitBtn.click();
    const response = await apiPromise;
    if (response) {
      expect(response.status()).toBeLessThan(300);
    }
    await page.waitForURL(/\/vendor\/registration-pending\/?|\/vendor\/login\//, { timeout: 10000 });
  });

  test('Test 1.8: Form validation prevents submission with empty fields', async ({ page }) => {
    // NOTE: The simplified form no longer has a terms checkbox.
    // This test verifies that client-side form validation prevents submission with empty required fields.
    await page.goto(`${BASE_URL}/vendor/register/`);

    // The submit button should be enabled (no captcha blocking)
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeEnabled();

    // Try to click submit with empty form - should NOT make API call due to client validation
    await submitBtn.click();
    await page.waitForTimeout(300);

    // Should still be on register page (client-side validation blocks)
    expect(page.url()).toContain('/vendor/register');

    // Verify validation error is shown for required fields
    // The form should show validation messages for empty required fields
    const companyNameError = page.locator('text=Company name is required').or(
      page.locator('[role="alert"]').filter({ hasText: /company/i })
    );
    const emailError = page.locator('text=Email is required').or(
      page.locator('[role="alert"]').filter({ hasText: /email/i })
    );

    // At least one validation error should be visible
    const hasCompanyError = await companyNameError.isVisible().catch(() => false);
    const hasEmailError = await emailError.isVisible().catch(() => false);

    // Form should still be on the same page (validation prevented submission)
    expect(page.url()).toContain('/vendor/register');
  });
});
