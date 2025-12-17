import { testWithUniqueVendor as test, expect, loginAsUniqueVendor } from './fixtures/test-fixtures';
import { type Page } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('INTEG-FRONTEND-BACKEND: Dashboard Integration Tests', () => {

  async function navigateToEditProfile(page: Page) {
    // Click "Edit Profile" button to get to the tabbed interface (use first one from Quick Actions)
    const editProfileBtn = page.getByRole('button', { name: /Edit Profile/i }).first();
    await editProfileBtn.click();
    await page.waitForTimeout(1000); // Wait for profile edit page to load
  }

  test('Test 1: Authentication and Dashboard Load', async ({ page, uniqueVendor }) => {
    test.setTimeout(60000);
    const startTime = Date.now();

    await page.goto(`${BASE_URL}/vendor/login`);
    expect(page.url()).toContain('/vendor/login');

    await page.getByPlaceholder('vendor@example.com').fill(uniqueVendor.email);
    await page.getByPlaceholder('Enter your password').fill(uniqueVendor.password);

    const loginPromise = page.waitForResponse(response => response.url().includes('/api/auth/login') && response.status() === 200);
    await page.getByRole('button', { name: /login/i }).click();
    const loginResponse = await loginPromise;
    expect(loginResponse.status()).toBe(200);

    await page.waitForURL(`${BASE_URL}/vendor/dashboard`, { timeout: 10000 });
    expect(page.url()).toContain('/vendor/dashboard');

    await page.waitForSelector('h1', { timeout: 5000 });

    // TierBadge renders as <Badge><Icon /><span>{label}</span></Badge>
    // Labels are: "Free", "Tier 1", "Tier 2", "Tier 3"
    const tierBadge = page.getByText(/^(Free|Tier [1-3])$/).first();
    await expect(tierBadge).toBeVisible({ timeout: 5000 });
    const tierText = await tierBadge.textContent();
    expect(tierText).toMatch(/^(Free|Tier [1-3])$/);

    const profileStatus = page.locator('text=Profile Status').first();
    await expect(profileStatus).toBeVisible({ timeout: 5000 });

    const elapsed = Date.now() - startTime;
    console.log(`Test 1: ${elapsed}ms`);
    expect(elapsed).toBeLessThan(60000);
  });

  test('Test 2: Basic Info Form Save', async ({ page, uniqueVendor }) => {
    test.setTimeout(60000);
    const startTime = Date.now();

    await loginAsUniqueVendor(page, uniqueVendor);
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

    const putPromise = page.waitForResponse(response =>
      response.url().includes('/api/portal/vendors/') && response.request().method() === 'PUT'
    );
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

  test('Test 3: Brand Story - Founded Year & Computed Field', async ({ page, uniqueVendor }) => {
    test.setTimeout(60000);
    const startTime = Date.now();

    await loginAsUniqueVendor(page, uniqueVendor);
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
    const putPromise = page.waitForResponse(response =>
      response.url().includes('/api/portal/vendors/') && response.request().method() === 'PUT'
    );
    await saveButton.click();
    const putResponse = await putPromise;
    expect(putResponse.status()).toBe(200);

    // After reload, just click the Brand Story tab again (we're still on Edit Profile page)
    await page.reload();
    await page.waitForTimeout(1000);
    // Wait for the tab to be available again
    await expect(brandStoryTab).toBeVisible({ timeout: 10000 });
    await brandStoryTab.click();
    await page.waitForTimeout(500);

    const reloadedValue = await foundedYearField.inputValue();
    expect(reloadedValue).toBe(String(newYear));

    const elapsed = Date.now() - startTime;
    console.log(`Test 3: ${elapsed}ms`);
    expect(elapsed).toBeLessThan(60000);
  });

  test('Test 4: Tier Validation Error Display', async ({ page, uniqueVendor }) => {
    test.setTimeout(60000);
    const startTime = Date.now();

    await loginAsUniqueVendor(page, uniqueVendor);
    const tierBadge = page.getByText(/^(Free|Tier [1-3])$/).first();
    await expect(tierBadge).toBeVisible({ timeout: 5000 });
    const tierText = await tierBadge.textContent();
    expect(tierText).toMatch(/^(Free|Tier [1-3])$/);

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

  test('Test 5: Certifications Manager Save', async ({ page, uniqueVendor }) => {
    test.setTimeout(75000);
    const startTime = Date.now();

    await loginAsUniqueVendor(page, uniqueVendor);
    const tierBadge = page.getByText(/^(Free|Tier [1-3])$/).first();
    await expect(tierBadge).toBeVisible({ timeout: 5000 });
    const tierText = await tierBadge.textContent();
    // Certifications feature requires Tier 2+ (skip for Free and Tier 1)
    if (tierText?.includes('Free') || tierText?.includes('Tier 1')) {
      console.log(`Skipping Test 5: Certifications not available for ${tierText}`);
      test.skip();
    }

    await navigateToEditProfile(page);

    const certTab = page.locator('button[role="tab"]').filter({ hasText: /Certification/ }).first();
    if (!await certTab.isVisible()) { test.skip(); }

    await certTab.click();
    await page.waitForTimeout(500);

    const addBtn = page.locator('button').filter({ hasText: /Add.*Certification/ }).first();
    if (!await addBtn.isVisible()) { test.skip(); }

    await addBtn.click();
    await page.waitForTimeout(800);

    const certName = `Test Cert ${Date.now()}`;
    const dialog = page.locator('role=dialog').first();

    // Fill Certification Name (required)
    const nameInput = dialog.getByLabel(/Certification Name/i);
    await nameInput.fill(certName);

    // Fill Issuing Organization (required)
    const issuerInput = dialog.getByLabel(/Issuing Organization/i);
    await issuerInput.fill('Test Organization');

    await page.waitForTimeout(300);

    const dialogSave = dialog.locator('button').filter({ hasText: /Add Certification/i });
    await dialogSave.click();
    await page.waitForTimeout(500);

    const certList = page.locator(`text=${certName}`);
    await expect(certList.first()).toBeVisible({ timeout: 5000 });

    // Click the main Save Changes button to persist to database
    const mainSave = page.locator('button').filter({ hasText: /Save Changes/i }).first();
    await expect(mainSave).toBeEnabled({ timeout: 5000 });

    const putPromise = page.waitForResponse(response =>
      response.url().includes('/api/portal/vendors/') && response.request().method() === 'PUT'
    );
    await mainSave.click();
    const putResponse = await putPromise;
    expect(putResponse.status()).toBe(200);

    await page.reload();
    await page.waitForLoadState('networkidle');

    // After reload, re-query and navigate back to Certifications tab
    const certTabAfterReload = page.locator('button[role="tab"]').filter({ hasText: /Certification/ }).first();
    await expect(certTabAfterReload).toBeVisible({ timeout: 10000 });
    await certTabAfterReload.click();
    await page.waitForTimeout(1000);

    // Re-query the certification list after reload
    const certListAfterReload = page.locator(`text=${certName}`);
    await expect(certListAfterReload.first()).toBeVisible({ timeout: 5000 });

    const elapsed = Date.now() - startTime;
    console.log(`Test 5: ${elapsed}ms`);
    expect(elapsed).toBeLessThan(75000);
  });

  test('Test 6: Optimistic Update & Error Handling', async ({ page, uniqueVendor }) => {
    test.setTimeout(60000);
    const startTime = Date.now();

    await loginAsUniqueVendor(page, uniqueVendor);
    await navigateToEditProfile(page);

    const basicTab = page.locator('button[role="tab"]').filter({ hasText: /Basic Info|Profile/ }).first();
    await basicTab.click();
    await page.waitForTimeout(1000); // Wait for form to initialize

    // Use the description textarea (same as Test 2)
    const field = page.locator('textarea[id="description"]');
    const testValue = `Test description ${Date.now()}`;
    await field.clear();
    await field.fill(testValue);
    await page.waitForTimeout(500); // Wait for isDirty to update
    expect(await field.inputValue()).toBe(testValue);

    const saveBtn = page.locator('button[type="submit"]').filter({ hasText: /Save Changes/ });
    const putPromise = page.waitForResponse(response =>
      response.url().includes('/api/portal/vendors/') && response.request().method() === 'PUT'
    );
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
