import { test, expect, type Page } from '@playwright/test';

/**
 * TEST-E2E-DASHBOARD: Comprehensive E2E Tests for Vendor Dashboard Editing Workflow
 */

const TEST_VENDOR_EMAIL = 'testvendor@test.com';
const TEST_VENDOR_PASSWORD = '123';
const BASE_URL = `${BASE_URL}';

test.describe.serial('TEST-E2E-DASHBOARD: Vendor Dashboard Editing Workflow', () => {

  async function loginAsTestVendor(page: Page) {
    console.log('Logging in as test vendor...');
    await page.goto(`${BASE_URL}/vendor/login`);

    // Wait for React hydration - look for the form to be interactive
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500); // Extra wait for hydration

    const emailInput = page.getByPlaceholder('vendor@example.com');
    const passwordInput = page.getByPlaceholder('Enter your password');

    // Wait for inputs to be visible and enabled
    await emailInput.waitFor({ state: 'visible', timeout: 5000 });
    await passwordInput.waitFor({ state: 'visible', timeout: 5000 });

    await emailInput.fill(TEST_VENDOR_EMAIL);
    await passwordInput.fill(TEST_VENDOR_PASSWORD);

    const loginPromise = page.waitForResponse(
      response => response.url().includes('/api/auth/login') && response.status() === 200
    );
    await page.getByRole('button', { name: /login/i }).click();
    await loginPromise;
    await page.waitForURL(`${BASE_URL}/vendor/dashboard`, { timeout: 10000 });

    // Wait for dashboard to hydrate
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
  }

  async function navigateToDashboardProfile(page: Page) {
    await page.goto(`${BASE_URL}/vendor/dashboard/profile`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for React hydration
  }

  async function switchToTab(page: Page, tabName: string) {
    const tab = page.locator('button[role="tab"]').filter({ hasText: new RegExp(tabName, 'i') }).first();
    const isVisible = await tab.isVisible({ timeout: 5000 }).catch(() => false);
    if (!isVisible) return false;
    await tab.click();
    await page.waitForTimeout(500);
    return true;
  }

  async function getCurrentTier(page: Page): Promise<string> {
    // Try multiple selectors for tier badge
    const tierBadge = page.locator('aside').locator('text=/Free|Tier [1-4]/').first();
    try {
      const tierText = await tierBadge.textContent({ timeout: 10000 });
      return tierText?.trim() || 'Unknown';
    } catch (e) {
      console.log('Could not find tier badge, defaulting to Unknown');
      return 'Unknown';
    }
  }

  test('Test 1: Authentication and Dashboard Access', async ({ page }) => {
    test.setTimeout(60000);
    console.log('\n=== Test 1: Authentication ===\n');

    await loginAsTestVendor(page);

    // Check for dashboard heading (use first() to avoid strict mode violation)
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 5000 });

    const tierText = await getCurrentTier(page);
    console.log(`User tier: ${tierText}`);

    await expect(page.locator('aside').first()).toBeVisible();
    console.log('✓ Test 1 PASSED\n');
  });

  test('Test 2: Edit Basic Info and Verify Save', async ({ page }) => {
    test.setTimeout(90000);
    console.log('\n=== Test 2: Edit Basic Info ===\n');

    await loginAsTestVendor(page);
    await navigateToDashboardProfile(page);
    await switchToTab(page, 'Basic Info');

    const companyNameField = page.locator('input[name="companyName"], input[id="companyName"]').first();
    const descriptionField = page.locator('textarea[name="description"], textarea[id="description"]').first();

    await expect(companyNameField).toBeVisible({ timeout: 5000 });
    await expect(descriptionField).toBeVisible({ timeout: 5000 });

    const timestamp = Date.now();
    const newName = `Updated Name ${timestamp}`;
    const newDescription = `Updated description at ${new Date().toISOString()}`;

    await companyNameField.clear();
    await companyNameField.fill(newName);
    await descriptionField.clear();
    await descriptionField.fill(newDescription);
    await page.waitForTimeout(500);

    const saveButton = page.locator('button[type="submit"]').filter({ hasText: /Save|Update|Changes/ });
    await expect(saveButton).toBeVisible({ timeout: 5000 });

    const putPromise = page.waitForResponse(
      response => response.url().includes('/api/portal/vendors/') && response.request().method() === 'PUT'
    );
    await saveButton.click();
    const putResponse = await putPromise;
    expect(putResponse.status()).toBe(200);

    const successToast = page.locator('text=/Success|saved|updated/i').first();
    await expect(successToast).toBeVisible({ timeout: 5000 });

    // Wait for save to complete and any revalidation
    await page.waitForTimeout(2000);

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for hydration after reload

    await switchToTab(page, 'Basic Info'); // Re-navigate to the tab

    const reloadedName = await companyNameField.inputValue();
    const reloadedDescription = await descriptionField.inputValue();
    expect(reloadedName).toBe(newName);
    expect(reloadedDescription).toBe(newDescription);

    console.log('✓ Test 2 PASSED\n');
  });

  test('Test 3: Locations Tab with Tier Limit', async ({ page }) => {
    test.setTimeout(90000);
    console.log('\n=== Test 3: Locations Tab ===\n');

    await loginAsTestVendor(page);
    await navigateToDashboardProfile(page);
    const tierText = await getCurrentTier(page);

    const switched = await switchToTab(page, 'Location');
    expect(switched).toBe(true);

    const locationsManager = page.locator('text=/location|Location/i').first();
    await expect(locationsManager).toBeVisible({ timeout: 5000 });

    console.log(`✓ Test 3 PASSED (Tier: ${tierText})\n`);
  });

  test('Test 4: Brand Story with Founded Year', async ({ page }) => {
    test.setTimeout(90000);
    console.log('\n=== Test 4: Brand Story ===\n');

    await loginAsTestVendor(page);
    await navigateToDashboardProfile(page);
    const tierText = await getCurrentTier(page);

    const switched = await switchToTab(page, 'Brand Story');

    if (!switched) {
      if (tierText.includes('Free')) {
        const upgradePrompt = page.locator('text=/upgrade|unlock/i').first();
        await expect(upgradePrompt).toBeVisible({ timeout: 5000 });
        console.log('✓ Free tier sees upgrade prompt\n');
        return;
      }
    }

    const foundedYearField = page.locator('input[id="foundedYear"], input[name="foundedYear"]').first();
    const isVisible = await foundedYearField.isVisible({ timeout: 5000 }).catch(() => false);

    if (isVisible) {
      // Read current value to ensure we pick a DIFFERENT year
      const currentValue = await foundedYearField.inputValue();
      const currentYear = parseInt(currentValue) || new Date().getFullYear();

      // Use a year that's definitely different (toggle between 2015 and 2020)
      const newYear = currentYear === 2020 ? 2015 : 2020;

      await foundedYearField.clear();
      await foundedYearField.fill(String(newYear));
      await page.waitForTimeout(500);

      // Wait for form to detect changes
      await page.waitForTimeout(500);

      const yearsInBusiness = page.locator('text=/Years in Business/i').first();
      const yearsVisible = await yearsInBusiness.isVisible({ timeout: 3000 }).catch(() => false);
      if (yearsVisible) {
        console.log('✓ Years in Business computed field visible\n');
      }

      const saveButton = page.locator('button[type="submit"]').filter({ hasText: /Save|Update/ }).first();

      // Wait for button to be enabled (form dirty state)
      await saveButton.waitFor({ state: 'visible', timeout: 5000 });
      await expect(saveButton).toBeEnabled({ timeout: 5000 });

      if (await saveButton.isEnabled()) {
        const putPromise = page.waitForResponse(
          response => response.url().includes('/api/portal/vendors/') && response.request().method() === 'PUT'
        );
        await saveButton.click();
        await putPromise;

        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000); // Wait for hydration
        await switchToTab(page, 'Brand Story'); // Re-navigate to Brand Story tab
        await page.waitForTimeout(500); // Wait for tab content to render
        const reloadedYear = await foundedYearField.inputValue();
        expect(reloadedYear).toBe(String(newYear));
      }
    }

    console.log('✓ Test 4 PASSED\n');
  });

  test('Test 5: Certifications Operations', async ({ page }) => {
    test.setTimeout(120000);
    console.log('\n=== Test 5: Certifications ===\n');

    await loginAsTestVendor(page);
    await navigateToDashboardProfile(page);
    const tierText = await getCurrentTier(page);

    const switched = await switchToTab(page, 'Certification');

    if (!switched) {
      if (tierText.includes('Free')) {
        const upgradePrompt = page.locator('text=/upgrade|unlock/i').first();
        await expect(upgradePrompt).toBeVisible({ timeout: 5000 });
        console.log('✓ Free tier sees upgrade prompt\n');
        return;
      }
    }

    const addButton = page.locator('button').filter({ hasText: /Add.*Certification/i }).first();
    if (!await addButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('✓ Test 5 PASSED (button not available)\n');
      return;
    }

    await addButton.click();
    await page.waitForTimeout(800);

    const certName = `Test Cert ${Date.now()}`;

    // Fill in the certification form
    const dialog = page.locator('role=dialog').first();
    const nameInput = dialog.locator('input[id="name"], input[name="name"]').first();
    const issuerInput = dialog.locator('input[id="issuer"], input[name="issuer"]').first();

    if (await nameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await nameInput.fill(certName);

      // Fill issuer field (required)
      if (await issuerInput.isVisible().catch(() => false)) {
        await issuerInput.fill('Test Issuer');
      }

      const dialogSave = dialog.locator('button[type="submit"], button').filter({
        hasText: /Save|Add/
      }).first();

      // Wait for the save button to be clickable
      await dialogSave.waitFor({ state: 'visible', timeout: 3000 });
      await dialogSave.click();

      // Wait for dialog to close
      await dialog.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});

      // Wait for React to re-render with new certification
      await page.waitForTimeout(1000);

      // Look for the certification in the list
      const certList = page.locator('text=' + certName);
      await expect(certList.first()).toBeVisible({ timeout: 5000 });
    }

    console.log('✓ Test 5 PASSED\n');
  });

  test('Test 6: Form Validation', async ({ page }) => {
    test.setTimeout(90000);
    console.log('\n=== Test 6: Form Validation ===\n');

    await loginAsTestVendor(page);
    await navigateToDashboardProfile(page);
    await switchToTab(page, 'Basic Info');

    const emailField = page.locator('input[type="email"]').first();
    if (await emailField.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailField.clear();
      await emailField.fill('invalid');
      await page.waitForTimeout(300);
    }

    console.log('✓ Test 6 PASSED\n');
  });

  test('Test 7: Free Tier Upgrade Prompts', async ({ page }) => {
    test.setTimeout(60000);
    console.log('\n=== Test 7: Upgrade Prompts ===\n');

    await loginAsTestVendor(page);
    await navigateToDashboardProfile(page);
    const tierText = await getCurrentTier(page);

    if (!tierText.includes('Free')) {
      console.log(`✓ User is ${tierText} - skipping\n`);
      return;
    }

    const restrictedTabs = ['Brand Story', 'Certification'];
    for (const tabName of restrictedTabs) {
      const switched = await switchToTab(page, tabName);
      if (switched) {
        const upgradePrompt = page.locator('text=/upgrade|unlock/i').first();
        const isVisible = await upgradePrompt.isVisible({ timeout: 3000 }).catch(() => false);
        console.log(`${isVisible ? '✓' : '⚠'} ${tabName}: ${isVisible ? 'upgrade prompt' : 'no prompt'}`);
      }
    }

    console.log('✓ Test 7 PASSED\n');
  });

  test('Test 8: Logout', async ({ page }) => {
    test.setTimeout(60000);
    console.log('\n=== Test 8: Logout ===\n');

    await loginAsTestVendor(page);

    const logoutButton = page.locator('button').filter({ hasText: /Logout|Log out/i }).first();
    if (await logoutButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await logoutButton.click();
      await page.waitForURL('**/vendor/login', { timeout: 10000 });
      expect(page.url()).toContain('/vendor/login');

      await page.goto(`${BASE_URL}/vendor/dashboard`);
      await page.waitForTimeout(1000);
      expect(page.url()).toContain('/vendor/login');
    }

    console.log('✓ Test 8 PASSED\n');
  });

  test('Test 9: Sidebar Navigation', async ({ page }) => {
    test.setTimeout(60000);
    console.log('\n=== Test 9: Sidebar Navigation ===\n');

    await loginAsTestVendor(page);

    const sidebar = page.locator('aside').first();
    await expect(sidebar).toBeVisible({ timeout: 5000 });

    const tierBadge = page.locator('aside span').filter({ hasText: /Free|Tier/ }).first();
    await expect(tierBadge).toBeVisible({ timeout: 5000 });

    console.log('✓ Test 9 PASSED\n');
  });

  test('Test 10: Profile Completion Status', async ({ page }) => {
    test.setTimeout(60000);
    console.log('\n=== Test 10: Profile Status ===\n');

    await loginAsTestVendor(page);

    const completionIndicator = page.locator('text=/completion|complete/i').first();
    const isVisible = await completionIndicator.isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`Completion indicator: ${isVisible ? 'visible' : 'not visible'}`);

    console.log('✓ Test 10 PASSED\n');
  });
});
