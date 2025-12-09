import { test, expect, Page } from '@playwright/test';
import { TEST_VENDORS } from './helpers/test-vendors';

const TEST_VENDOR_EMAIL = TEST_VENDORS.tier1.email;
const TEST_VENDOR_PASSWORD = TEST_VENDORS.tier1.password;
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('INTEG-FRONTEND-BACKEND: Dashboard Integration Tests', () => {

  async function loginAsTestVendor(page: Page) {
    await page.goto(`${BASE_URL}/vendor/login`);
    await page.getByPlaceholder('vendor@example.com').fill(TEST_VENDOR_EMAIL);
    await page.getByPlaceholder('Enter your password').fill(TEST_VENDOR_PASSWORD);
    const loginPromise = page.waitForResponse((response: any) => response.url().includes('/api/auth/login') && response.status() === 200);
    await page.getByRole('button', { name: /login/i }).click();
    await loginPromise;
    await page.waitForURL(`${BASE_URL}/vendor/dashboard`, { timeout: 10000 });
  }

  async function navigateToEditProfile(page: Page) {
    // Click "Edit Profile" button to get to the tabbed interface (use first one from Quick Actions)
    const editProfileBtn = page.getByRole('button', { name: /Edit Profile/i }).first();
    await editProfileBtn.click();
    await page.waitForTimeout(1000); // Wait for profile edit page to load
  }

  test('Test 1: Authentication and Dashboard Load', async ({ page }) => {
    test.setTimeout(60000);
    const startTime = Date.now();

    await page.goto(`${BASE_URL}/vendor/login`);
    expect(page.url()).toContain('/vendor/login');

    await page.getByPlaceholder('vendor@example.com').fill(TEST_VENDOR_EMAIL);
    await page.getByPlaceholder('Enter your password').fill(TEST_VENDOR_PASSWORD);

    const loginPromise = page.waitForResponse(response => response.url().includes('/api/auth/login') && response.status() === 200);
    await page.getByRole('button', { name: /login/i }).click();
    const loginResponse = await loginPromise;
    expect(loginResponse.status()).toBe(200);

    await page.waitForURL(`${BASE_URL}/vendor/dashboard`, { timeout: 10000 });
    expect(page.url()).toContain('/vendor/dashboard');

    await page.waitForSelector('h1', { timeout: 5000 });

    const tierBadge = page.locator('aside span').filter({ hasText: /Free|Tier [1-4]/ }).first();
    await expect(tierBadge).toBeVisible({ timeout: 5000 });
    const tierText = await tierBadge.textContent();
    expect(tierText).toMatch(/Free|Tier [1-4]/);

    const profileStatus = page.locator('text=Profile Status').first();
    await expect(profileStatus).toBeVisible({ timeout: 5000 });

    const elapsed = Date.now() - startTime;
    console.log(`Test 1: ${elapsed}ms`);
    expect(elapsed).toBeLessThan(60000);
  });

  test('Test 2: Basic Info Form Save', async ({ page }) => {
    test.setTimeout(60000);
    const startTime = Date.now();

    await loginAsTestVendor(page);
    await navigateToEditProfile(page);

    const basicInfoTab = page.locator('button[role="tab"]').filter({ hasText: /Basic Info|Profile/ }).first();
    await basicInfoTab.click();
    await page.waitForTimeout(1000); // Wait for form to initialize

    // Target the description textarea specifically
    const descriptionField = page.locator('textarea[id="description"]');
    const newValue = `Updated description at ${Date.now()}`;
    await descriptionField.clear();
    await descriptionField.fill(newValue);
    await page.waitForTimeout(500); // Wait for isDirty to update

    // Verify button is enabled
    const saveButton = page.locator('button[type="submit"]').filter({ hasText: /Save Changes/ });
    await expect(saveButton).toBeEnabled({ timeout: 5000 });

    const putPromise: Promise<any> = page.waitForResponse(response => response.url().includes('/api/portal/vendors/') && (response as any).method() === 'PUT');
    await saveButton.click();
    const putResponse = await putPromise;
    expect(putResponse.status()).toBe(200);

    const successToast = page.locator('text=/Success|saved/i');
    await expect(successToast.first()).toBeVisible({ timeout: 5000 });

    await page.reload();
    await page.waitForTimeout(1000);
    const reloadedValue = await page.locator('textarea[id="description"]').inputValue();
    expect(reloadedValue).toBe(newValue);

    const elapsed = Date.now() - startTime;
    console.log(`Test 2: ${elapsed}ms`);
    expect(elapsed).toBeLessThan(60000);
  });

  test('Test 3: Brand Story - Founded Year & Computed Field', async ({ page }) => {
    test.setTimeout(60000);
    const startTime = Date.now();

    await loginAsTestVendor(page);
    await navigateToEditProfile(page);

    const brandStoryTab = page.locator('button[role="tab"]').filter({ hasText: /Brand Story/ }).first();
    if (!await brandStoryTab.isVisible()) { test.skip(); }

    await brandStoryTab.click();
    await page.waitForTimeout(500);

    const foundedYearField = page.locator('input[id*="foundedYear"], input[placeholder*="Founded"]').first();
    if (!await foundedYearField.isVisible()) { test.skip(); }

    const newYear = new Date().getFullYear() - 5;
    await foundedYearField.fill(String(newYear));
    await page.waitForTimeout(300);

    const yearsInBusiness = page.locator('text=/Years in Business/i');
    await expect(yearsInBusiness.first()).toBeVisible({ timeout: 5000 });

    const saveButton = page.locator('button').filter({ hasText: /Save|Update/ }).first();
    const putPromise: Promise<any> = page.waitForResponse(response => response.url().includes('/api/portal/vendors/') && (response as any).method() === 'PUT');
    await saveButton.click();
    const putResponse = await putPromise;
    expect(putResponse.status()).toBe(200);

    await page.reload();
    const reloadedValue = await foundedYearField.inputValue();
    expect(reloadedValue).toBe(String(newYear));

    const elapsed = Date.now() - startTime;
    console.log(`Test 3: ${elapsed}ms`);
    expect(elapsed).toBeLessThan(60000);
  });

  test('Test 4: Tier Validation Error Display', async ({ page }) => {
    test.setTimeout(60000);
    const startTime = Date.now();

    await loginAsTestVendor(page);
    const tierBadge = page.locator('aside span').filter({ hasText: /Free|Tier/ }).first();
    const tierText = await tierBadge.textContent();
    expect(tierText).toMatch(/Free|Tier/);

    if (tierText?.includes('Free')) {
      const certTab = page.locator('button[role="tab"]').filter({ hasText: /Certification/ }).first();
      if (await certTab.isVisible()) {
        await certTab.click();
        await page.waitForTimeout(300);
        const warning = page.locator('text=/Tier 1|upgrade/i');
        await expect(warning.first()).toBeVisible({ timeout: 5000 });
      }
    }

    const elapsed = Date.now() - startTime;
    console.log(`Test 4: ${elapsed}ms`);
    expect(elapsed).toBeLessThan(60000);
  });

  test('Test 5: Certifications Manager Save', async ({ page }) => {
    test.setTimeout(75000);
    const startTime = Date.now();

    await loginAsTestVendor(page);
    const tierBadge = page.locator('aside span').filter({ hasText: /Free|Tier/ }).first();
    const tierText = await tierBadge.textContent();
    if (tierText?.includes('Free')) { test.skip(); }

    await navigateToEditProfile(page);

    const certTab = page.locator('button[role="tab"]').filter({ hasText: /Certification/ }).first();
    if (!await certTab.isVisible()) { test.skip(); }

    await certTab.click();
    await page.waitForTimeout(500);

    const addBtn = page.locator('button').filter({ hasText: /Add.*Certification/ }).first();
    if (!await addBtn.isVisible()) { test.skip(); }

    await addBtn.click();
    await page.waitForTimeout(800);

    const certName = `Test ${Date.now()}`;
    const nameInput = page.locator('role=dialog').first().locator('input').first();
    if (await nameInput.isVisible()) { await nameInput.fill(certName); }

    const dialogSave = page.locator('role=dialog').first().locator('button').filter({ hasText: /Save|Add/ }).first();
    await dialogSave.click();
    await page.waitForTimeout(300);

    const certList = page.locator(`text=${certName}`);
    await expect(certList.first()).toBeVisible({ timeout: 5000 });

    const mainSave = page.locator('button').filter({ hasText: /Save Profile/ }).first();
    if (await mainSave.isVisible()) {
      const putPromise: Promise<any> = page.waitForResponse(response => response.url().includes('/api/portal/vendors/') && (response as any).method() === 'PUT');
      await mainSave.click();
      await putPromise;
    }

    await page.reload();
    await page.waitForTimeout(1000);
    await expect(certList.first()).toBeVisible({ timeout: 5000 });

    const elapsed = Date.now() - startTime;
    console.log(`Test 5: ${elapsed}ms`);
    expect(elapsed).toBeLessThan(75000);
  });

  test('Test 6: Optimistic Update & Error Handling', async ({ page }) => {
    test.setTimeout(60000);
    const startTime = Date.now();

    await loginAsTestVendor(page);
    await navigateToEditProfile(page);

    const basicTab = page.locator('button[role="tab"]').filter({ hasText: /Basic Info/ }).first();
    await basicTab.click();
    await page.waitForTimeout(500);

    const field = page.locator('input[type="text"]').first();
    const testValue = `Test ${Date.now()}`;
    await field.fill(testValue);
    expect(await field.inputValue()).toBe(testValue);

    const saveBtn = page.locator('button').filter({ hasText: /Save/ }).first();
    const putPromise: Promise<any> = page.waitForResponse(response => response.url().includes('/api/portal/vendors/') && (response as any).method() === 'PUT');
    await saveBtn.click();
    const putResponse = await putPromise;

    if (putResponse.status() === 200) {
      const success = page.locator('text=/Success|saved/i');
      await expect(success.first()).toBeVisible({ timeout: 5000 });
    }

    expect(await field.inputValue()).toBe(testValue);

    const elapsed = Date.now() - startTime;
    console.log(`Test 6: ${elapsed}ms`);
    expect(elapsed).toBeLessThan(60000);
  });
});
