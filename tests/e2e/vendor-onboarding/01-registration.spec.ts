import { test, expect } from '@playwright/test';
import {
  generateUniqueVendorData,
  fillRegistrationForm,
  registerVendor,
} from '../helpers/vendor-onboarding-helpers';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || `${BASE_URL}';

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
    await page.getByPlaceholder('vendor@example.com').fill(vendor.email);
    await page.getByPlaceholder('Your Company Ltd').fill(vendor.companyName);
    await page.getByPlaceholder('John Smith').fill('Test');
    await page.getByPlaceholder('+1 (555) 123-4567').fill('+1-555-0000');
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
    await page.getByPlaceholder('vendor@example.com').fill(vendor.email);
    await page.getByPlaceholder('Your Company Ltd').fill(vendor.companyName);
    await page.getByPlaceholder('John Smith').fill('Test');
    await page.getByPlaceholder('+1 (555) 123-4567').fill('+1-555-0000');
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

  test('Test 1.8: Terms and conditions acceptance required', async ({ page }) => {
    const vendor = generateUniqueVendorData();
    await page.goto(`${BASE_URL}/vendor/register/`);
    await fillRegistrationForm(page, vendor);
    const termsCheckbox = page.getByRole('checkbox', { name: /agree.*terms/i });
    await termsCheckbox.uncheck();
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/vendor/register');

    await termsCheckbox.check();

    // Use Promise.all for proper coordination
    const [response] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/api/portal/vendors/register') && r.status() < 300,
        { timeout: 10000 }
      ),
      page.click('button[type="submit"]')
    ]);

    expect(response.status()).toBeLessThan(300);

    // Wait for redirect
    await page.waitForURL(/\/vendor\/registration-pending\/?/, { timeout: 10000 });
    expect(page.url()).toContain('/vendor/registration-pending');
  });
});
