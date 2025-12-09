import { test, expect } from '@playwright/test';
import { TEST_VENDORS } from './helpers/test-vendors';

const TEST_VENDOR_EMAIL = TEST_VENDORS.tier1.email;
const TEST_VENDOR_PASSWORD = TEST_VENDORS.tier1.password;
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('Verify Single Form Instance', () => {

  test('Desktop viewport renders only ONE form instance', async ({ page }) => {
    // Set desktop viewport explicitly
    await page.setViewportSize({ width: 1280, height: 720 });

    // Login
    await page.goto(`${BASE_URL}/vendor/login`);
    await page.getByPlaceholder('vendor@example.com').fill(TEST_VENDOR_EMAIL);
    await page.getByPlaceholder('Enter your password').fill(TEST_VENDOR_PASSWORD);
    await page.getByRole('button', { name: /login/i }).click();
    await page.waitForURL(`${BASE_URL}/vendor/dashboard`, { timeout: 10000 });

    // Navigate to edit profile
    await page.getByRole('button', { name: /Edit Profile/i }).first().click();
    await page.waitForTimeout(1000);

    // Click Basic Info tab
    await page.locator('button[role="tab"]').filter({ hasText: /Basic Info/ }).first().click();
    await page.waitForTimeout(500);

    // CRITICAL TEST: Verify only ONE instance of each form field
    const logoInputs = await page.locator('input[id="logo"]').all();
    console.log(`Found ${logoInputs.length} logo input(s)`);
    expect(logoInputs.length).toBe(1);

    const companyNameInputs = await page.locator('input[id="companyName"]').all();
    console.log(`Found ${companyNameInputs.length} companyName input(s)`);
    expect(companyNameInputs.length).toBe(1);

    const slugInputs = await page.locator('input[id="slug"]').all();
    console.log(`Found ${slugInputs.length} slug input(s)`);
    expect(slugInputs.length).toBe(1);

    const descriptionInputs = await page.locator('textarea[id="description"]').all();
    console.log(`Found ${descriptionInputs.length} description input(s)`);
    expect(descriptionInputs.length).toBe(1);

    const contactEmailInputs = await page.locator('input[id="contactEmail"]').all();
    console.log(`Found ${contactEmailInputs.length} contactEmail input(s)`);
    expect(contactEmailInputs.length).toBe(1);

    // Take a screenshot
    await page.screenshot({ path: 'test-results/single-form-verified.png', fullPage: true });

    console.log('[OK] SUCCESS: All form fields have exactly ONE instance');
  });
});
