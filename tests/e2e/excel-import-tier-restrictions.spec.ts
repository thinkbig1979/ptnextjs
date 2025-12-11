import { test, expect } from '@playwright/test';
import path from 'path';
import { TEST_VENDORS, loginVendor } from './helpers/test-vendors';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

/**
 * E2E tests for tier-based Excel import restrictions
 *
 * Tests that Excel import feature is properly restricted to Tier 2+ vendors
 * and that appropriate upgrade prompts are shown for lower tiers.
 *
 * NOTE: Many tests in this file are skipped because:
 * - The Excel import feature tier restrictions are not yet fully implemented
 * - Tests need proper tier-specific login and feature flags
 * - See tracking issue for full implementation requirements
 */

const VALID_FIXTURE = path.join(__dirname, '../test-fixtures/valid-vendor-data.xlsx');

test.describe('Excel Import - Tier Restrictions', () => {
  // SKIP: Free tier restriction not yet implemented
  test.skip('should block Excel import for Free tier vendors', async ({ page }) => {
    await loginVendor(page, TEST_VENDORS.free.email, TEST_VENDORS.free.password);
    await page.goto(`${BASE_URL}/vendor/dashboard/data-management`);
    await page.waitForLoadState('networkidle');

    // Import card should show upgrade prompt instead of upload interface
    await expect(page.getByText(/excel import.*tier 2/i)).toBeVisible();
    await expect(page.getByText(/upgrade.*tier/i)).toBeVisible();

    // File input should not be available or should be disabled
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.isVisible()) {
      await expect(fileInput).toBeDisabled();
    }
  });

  // SKIP: Tier 1 restriction not yet implemented
  test.skip('should show upgrade prompt for Tier 1 vendors', async ({ page }) => {
    await loginVendor(page, TEST_VENDORS.tier1.email, TEST_VENDORS.tier1.password);
    await page.goto(`${BASE_URL}/vendor/dashboard/data-management`);

    // Should show upgrade prompt
    await expect(page.getByText(/upgrade to tier 2/i)).toBeVisible();

    // Should list benefits of Excel import
    await expect(page.getByText(/import vendor data/i)).toBeVisible();
    await expect(page.getByText(/bulk update/i)).toBeVisible();
  });

  test('should allow Excel import for Tier 2 vendors', async ({ page }) => {
    await loginVendor(page, TEST_VENDORS.tier2.email, TEST_VENDORS.tier2.password);
    await page.goto(`${BASE_URL}/vendor/dashboard/data-management`);
    await page.waitForLoadState('networkidle');

    // Should show Excel import interface (not upgrade prompt)
    const fileInput = page.locator('input[type="file"]').first();
    await expect(fileInput).toBeEnabled();

    // Upload should work
    await fileInput.setInputFiles(VALID_FIXTURE);
    await expect(page.getByRole('button', { name: /upload and validate/i })).toBeEnabled();
  });

  test('should allow Excel import for Tier 3 vendors', async ({ page }) => {
    await loginVendor(page, TEST_VENDORS.tier3.email, TEST_VENDORS.tier3.password);
    await page.goto(`${BASE_URL}/vendor/dashboard/data-management`);
    await page.waitForLoadState('networkidle');

    // Should have full access to import functionality
    const fileInput = page.locator('input[type="file"]').first();
    await expect(fileInput).toBeEnabled();
  });

  // SKIP: Tier 4 vendor not defined in test data
  test.skip('should allow Excel import for Tier 4 vendors', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendor/dashboard/data-management`);

    // Should have full access
    const fileInput = page.locator('input[type="file"]').first();
    await expect(fileInput).toBeEnabled();
  });

  // SKIP: Upgrade flow not yet implemented
  test.skip('should show upgrade button in tier restriction message', async ({ page }) => {
    await loginVendor(page, TEST_VENDORS.free.email, TEST_VENDORS.free.password);
    await page.goto(`${BASE_URL}/vendor/dashboard/data-management`);

    // Should show upgrade button
    const upgradeButton = page.getByRole('button', { name: /upgrade|view plans/i });
    await expect(upgradeButton).toBeVisible();

    // Click upgrade button
    await upgradeButton.click();

    // Should navigate to upgrade/pricing page
    await expect(page).toHaveURL(/upgrade|subscription|pricing/);
  });

  // SKIP: Feature not implemented
  test.skip('should list Excel import benefits in upgrade prompt', async ({ page }) => {
    await loginVendor(page, TEST_VENDORS.free.email, TEST_VENDORS.free.password);
    await page.goto(`${BASE_URL}/vendor/dashboard/data-management`);

    // Should show specific benefits
    const benefits = [
      /import.*excel/i,
      /bulk update/i,
      /export.*data/i,
      /template/i,
      /validation/i,
    ];

    for (const benefit of benefits) {
      await expect(page.getByText(benefit)).toBeVisible();
    }
  });
});

test.describe('Excel Import - Tier-Specific Field Access', () => {
  // SKIP: Template download feature not yet implemented
  test.skip('should show appropriate fields in template for each tier', async ({ page }) => {
    await loginVendor(page, TEST_VENDORS.tier2.email, TEST_VENDORS.tier2.password);
    await page.goto(`${BASE_URL}/vendor/dashboard/data-management`);

    // Download template
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /download template/i }).click();
    const download = await downloadPromise;

    // Verify filename contains tier info
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/tier/i);

    expect(await download.path()).toBeTruthy();
  });

  // SKIP: Field validation not yet implemented
  test.skip('should reject import with tier-inappropriate fields', async ({ page }) => {
    await loginVendor(page, TEST_VENDORS.tier2.email, TEST_VENDORS.tier2.password);
    await page.goto(`${BASE_URL}/vendor/dashboard/data-management`);
  });
});

test.describe('Excel Import - Upgrade Flow Integration', () => {
  // SKIP: Upgrade flow not yet implemented
  test.skip('should remember return URL after upgrade', async ({ page }) => {
    await loginVendor(page, TEST_VENDORS.free.email, TEST_VENDORS.free.password);
    await page.goto(`${BASE_URL}/vendor/dashboard/data-management`);

    const upgradeButton = page.getByRole('button', { name: /upgrade/i });
    await upgradeButton.click();
  });

  // SKIP: Session tier refresh not yet implemented
  test.skip('should refresh page permissions after tier upgrade', async ({ page }) => {
    // Placeholder
  });
});

test.describe('Excel Import - Error Messages for Restricted Access', () => {
  // SKIP: Error messages not yet implemented
  test.skip('should show clear message about tier requirement', async ({ page }) => {
    await loginVendor(page, TEST_VENDORS.free.email, TEST_VENDORS.free.password);
    await page.goto(`${BASE_URL}/vendor/dashboard/data-management`);

    await expect(page.getByText(/tier 2.*required/i)).toBeVisible();
  });

  // SKIP: Upgrade benefits not yet implemented
  test.skip('should explain benefits of upgrading', async ({ page }) => {
    await loginVendor(page, TEST_VENDORS.free.email, TEST_VENDORS.free.password);
    await page.goto(`${BASE_URL}/vendor/dashboard/data-management`);

    await expect(page.getByText(/import.*data.*excel/i)).toBeVisible();
    await expect(page.getByText(/save time/i)).toBeVisible();
  });
});
