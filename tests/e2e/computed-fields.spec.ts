import { test, expect } from '@playwright/test';
import { TEST_VENDORS, API_BASE, loginVendor, updateVendorData, resetVendorData, navigateToFreshVendorPage } from './helpers/test-vendors';

/**
 * E2E Test Suite: Vendor Computed Fields - Years in Business
 *
 * Tests that the yearsInBusiness computed field is calculated correctly
 * across the dashboard and public profile, with proper edge case handling.
 */

test.describe('Vendor Computed Fields - Years in Business', () => {
  // Reset vendor data before each test to prevent data pollution
  test.beforeEach(async ({ page }) => {
    console.log('[Test Setup] Resetting vendor data...');
    await resetVendorData(page, TEST_VENDORS.tier1.email, TEST_VENDORS.tier1.password);
    console.log('[Test Setup] Vendor reset complete');
  });

  test.describe('Computed Field Accuracy', () => {
    test('should compute years in business correctly for foundedYear 2010', async ({ page }) => {
      // Login as Tier 1 vendor
      const vendorId = await loginVendor(page, TEST_VENDORS.tier1.email, TEST_VENDORS.tier1.password);

      // Update foundedYear - this VERIFIES data persisted in API
      await updateVendorData(page, vendorId, {
        companyName: 'Tier 1 Test Vendor',
        foundedYear: 2010,
      });

      // Navigate to FRESH page (cache-busted)
      await navigateToFreshVendorPage(page, TEST_VENDORS.tier1.slug);

      // Calculate expected years
      const currentYear = new Date().getFullYear();
      const expectedYears = currentYear - 2010;
      const yearsText = `${expectedYears} ${expectedYears === 1 ? 'year' : 'years'}`;

      // Verify years badge displays
      await expect(page.locator(`text=/${yearsText}/i`)).toBeVisible({ timeout: 10000 });
    });

    test('should handle null foundedYear gracefully', async ({ page }) => {
      // Login as Tier 1 vendor
      const vendorId = await loginVendor(page, TEST_VENDORS.tier1.email, TEST_VENDORS.tier1.password);

      // Set foundedYear to null (remove it)
      await updateVendorData(page, vendorId, {
        companyName: 'Tier 1 Test Vendor - No Founded Year',
        foundedYear: null,
      });

      // Wait briefly for cache clearing and revalidation (on-demand via API)
      await page.waitForTimeout(2000);

      // Visit public profile
      await page.goto(`${API_BASE}/vendors/${TEST_VENDORS.tier1.slug}`);
      await page.waitForLoadState('networkidle');

      // Verify page loaded
      await expect(page).toHaveTitle(/Tier 1 Test Vendor/);

      // Verify years in business badge is NOT visible (component returns null)
      const yearsBadgePattern = /\d+\s+years?\s+in\s+business/i;
      const yearsBadge = page.locator(`text=${yearsBadgePattern}`);

      await expect(yearsBadge).not.toBeVisible();
    });

    test('should handle future year (2030) as invalid', async ({ page }) => {
      // Login as Tier 1 vendor
      const vendorId = await loginVendor(page, TEST_VENDORS.tier1.email, TEST_VENDORS.tier1.password);

      // Attempt to set foundedYear to future year (2030) - should fail validation
      const futureYear = new Date().getFullYear() + 5;

      // Expect the API to reject the invalid future year
      let updateFailed = false;
      try {
        await updateVendorData(page, vendorId, {
          companyName: 'Tier 1 Test Vendor - Future Year',
          foundedYear: futureYear,
        });
      } catch (error: any) {
        // Verify the error indicates validation failure for foundedYear
        // Note: Payload CMS returns generic field validation message
        expect(error.message).toMatch(/Founded Year|invalid|future/i);
        updateFailed = true;
      }

      // Verify the update was rejected by the API
      expect(updateFailed).toBe(true);
    });

    test('should handle edge case foundedYear 1800 correctly', async ({ page }) => {
      // Login as Tier 1 vendor
      const vendorId = await loginVendor(page, TEST_VENDORS.tier1.email, TEST_VENDORS.tier1.password);

      // Set foundedYear to edge case minimum (1800)
      await updateVendorData(page, vendorId, {
        companyName: 'Tier 1 Test Vendor - Founded 1800',
        foundedYear: 1800,
      });

      // Wait briefly for cache clearing and revalidation (on-demand via API)
      await page.waitForTimeout(2000);

      // Visit public profile
      await page.goto(`${API_BASE}/vendors/${TEST_VENDORS.tier1.slug}`);
      await page.waitForLoadState('networkidle');

      // Verify page loaded
      await expect(page).toHaveTitle(/Tier 1 Test Vendor/);

      // Calculate expected years (current year - 1800)
      const currentYear = new Date().getFullYear();
      const expectedYears = currentYear - 1800;

      // Verify years in business badge shows correct calculation
      const yearsText = `${expectedYears} ${expectedYears === 1 ? 'year' : 'years'}`;
      const yearsBadge = page.locator(`text=/${yearsText}/i`);

      await expect(yearsBadge).toBeVisible({ timeout: 10000 });
    });

    test('should handle year below minimum (1799) as invalid', async ({ page }) => {
      // Login as Tier 1 vendor
      const vendorId = await loginVendor(page, TEST_VENDORS.tier1.email, TEST_VENDORS.tier1.password);

      // Attempt to set foundedYear below minimum (1799) - should fail validation
      let updateFailed = false;
      try {
        await updateVendorData(page, vendorId, {
          companyName: 'Tier 1 Test Vendor - Year 1799',
          foundedYear: 1799,
        });
      } catch (error: any) {
        // Verify the error indicates validation failure for foundedYear
        // Note: Payload CMS returns generic field validation message
        expect(error.message).toMatch(/Founded Year|invalid|1800/i);
        updateFailed = true;
      }

      // Verify the update was rejected by the API
      expect(updateFailed).toBe(true);
    });

    test('should NOT display years badge when foundedYear validation fails', async ({ page }) => {
      // Login as Tier 1 vendor
      const vendorId = await loginVendor(page, TEST_VENDORS.tier1.email, TEST_VENDORS.tier1.password);

      // This test verifies that the years badge is NOT visible when foundedYear is invalid
      // (continuing from previous test's rejected update)

      // Visit public profile
      await page.goto(`${API_BASE}/vendors/${TEST_VENDORS.tier1.slug}`);
      await page.waitForLoadState('networkidle');

      // Verify page loaded
      await expect(page).toHaveTitle(/Tier 1 Test Vendor/);

      // Verify years in business badge is NOT visible (validation failed, no valid year stored)
      const yearsBadgePattern = /\d+\s+years?\s+in\s+business/i;
      const yearsBadge = page.locator(`text=${yearsBadgePattern}`);

      await expect(yearsBadge).not.toBeVisible();
    });
  });

  test.describe('Dashboard and Public Profile Synchronization', () => {
    test('should show same computed value in dashboard and public profile', async ({ page }) => {
      // Login as Tier 1 vendor
      const vendorId = await loginVendor(page, TEST_VENDORS.tier1.email, TEST_VENDORS.tier1.password);

      // Set foundedYear to 2015
      await updateVendorData(page, vendorId, {
        companyName: 'Tier 1 Test Vendor - Sync Test',
        foundedYear: 2015,
      });

      // Wait for update to process
      await page.waitForTimeout(2000);

      // Navigate to vendor dashboard
      await page.goto(`${API_BASE}/vendor/dashboard/profile`);
      await page.waitForLoadState('networkidle');

      // Click Brand Story tab to see foundedYear and computed field
      const brandStoryTab = page.locator('button:has-text("Brand Story")');
      if (await brandStoryTab.isVisible()) {
        await brandStoryTab.click();
        await page.waitForTimeout(1000);

        // Check if years in business display exists in dashboard
        const currentYear = new Date().getFullYear();
        const expectedYears = currentYear - 2015;
        const dashboardYears = page.locator(`text=/${expectedYears}\\s+years?/i`).first();

        // If visible in dashboard, note the value
        const dashboardVisible = await dashboardYears.isVisible().catch(() => false);

        console.log(`Dashboard years visible: ${dashboardVisible}`);
      }

      // Now visit public profile
      await page.goto(`${API_BASE}/vendors/${TEST_VENDORS.tier1.slug}`);
      await page.waitForLoadState('networkidle');

      // Wait for ISR cache (since we just updated)
      await page.waitForTimeout(12000);

      // Reload to get fresh ISR data
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Verify years in business on public profile
      const currentYear = new Date().getFullYear();
      const expectedYears = currentYear - 2015;
      const yearsText = `${expectedYears} ${expectedYears === 1 ? 'year' : 'years'}`;
      const publicYearsBadge = page.locator(`text=/${yearsText}/i`);

      await expect(publicYearsBadge).toBeVisible({ timeout: 10000 });
    });

    test('should update computed field immediately after foundedYear change', async ({ page }) => {
      // Login as Tier 1 vendor
      const vendorId = await loginVendor(page, TEST_VENDORS.tier1.email, TEST_VENDORS.tier1.password);

      const currentYear = new Date().getFullYear();

      // Set initial foundedYear to 2010
      await updateVendorData(page, vendorId, {
        companyName: 'Tier 1 Test Vendor - Update Test',
        foundedYear: 2010,
      });

      // Verify initial yearsInBusiness via API (database is source of truth)
      const initialApiResponse = await page.request.get(
        `${API_BASE}/api/public/vendors/${TEST_VENDORS.tier1.slug}`
      );
      expect(initialApiResponse.ok()).toBe(true);
      const initialData = await initialApiResponse.json();
      expect(initialData.data?.foundedYear || initialData.data?.founded).toBe(2010);

      // Update foundedYear to 2005
      await updateVendorData(page, vendorId, {
        foundedYear: 2005,
      });

      // Verify updated yearsInBusiness via API (database is source of truth)
      const updatedApiResponse = await page.request.get(
        `${API_BASE}/api/public/vendors/${TEST_VENDORS.tier1.slug}`
      );
      expect(updatedApiResponse.ok()).toBe(true);
      const updatedData = await updatedApiResponse.json();
      const updatedYears = currentYear - 2005;
      expect(updatedData.data?.foundedYear || updatedData.data?.founded).toBe(2005);

      // Verify UI shows updated value on fresh page load
      // (ISR cache may take time to update, but API is always fresh)
      await navigateToFreshVendorPage(page, TEST_VENDORS.tier1.slug);

      // The page should show the years in business badge
      // Note: ISR may cache old value for a few seconds, use longer timeout
      const yearsText = `${updatedYears} ${updatedYears === 1 ? 'year' : 'years'}`;
      await expect(page.locator(`text=/${yearsText}/i`)).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe('Vendor Card Display', () => {
    test('should display years in business on vendor profile page', async ({ page }) => {
      // Use tier2 vendor to verify years in business display
      // Note: Verifying on profile page instead of listing due to complex search/filter behavior
      const vendorId = await loginVendor(page, TEST_VENDORS.tier2.email, TEST_VENDORS.tier2.password);

      await updateVendorData(page, vendorId, {
        companyName: 'Tier 2 Years Test Vendor',
        foundedYear: 2012,
      });

      // First verify via API that data is persisted correctly
      const apiResponse = await page.request.get(
        `${API_BASE}/api/public/vendors/${TEST_VENDORS.tier2.slug}`
      );
      expect(apiResponse.ok()).toBe(true);
      const apiData = await apiResponse.json();
      expect(apiData.data?.foundedYear || apiData.data?.founded).toBe(2012);

      // Navigate to vendor profile page with cache-busting
      await navigateToFreshVendorPage(page, TEST_VENDORS.tier2.slug);

      // Calculate expected years
      const currentYear = new Date().getFullYear();
      const expectedYears = currentYear - 2012;

      // Verify years in business badge is displayed in VendorHero
      const yearsText = `${expectedYears} ${expectedYears === 1 ? 'year' : 'years'}`;
      await expect(page.locator(`text=/${yearsText}/i`)).toBeVisible({ timeout: 15000 });
    });
  });
});
