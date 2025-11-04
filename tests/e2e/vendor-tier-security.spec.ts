import { test, expect } from '@playwright/test';
import { TEST_VENDORS, API_BASE, loginVendor } from './helpers/test-vendors';

/**
 * E2E Test Suite: Vendor Tier Security
 *
 * Validates that vendors cannot self-upgrade their tier (security requirement)
 * and that proper upgrade prompts are shown in the UI.
 */
test.describe('Vendor Tier Security', () => {
  test.describe('API Security: Prevent Self-Tier-Changes', () => {
    test('free tier vendor cannot upgrade their own tier via API', async ({ page }) => {
      const vendorId = await loginVendor(page, TEST_VENDORS.free.email, TEST_VENDORS.free.password);

      // Attempt to upgrade to tier1
      const response = await page.request.put(
        `${API_BASE}/api/portal/vendors/${vendorId}?byUserId=true`,
        { data: { tier: 'tier1' } }
      );

      // Should be rejected
      expect(response.ok()).toBe(false);
      expect(response.status()).toBe(403);

      const errorData = await response.json();
      expect(errorData.error.code).toBe('TIER_PERMISSION_DENIED');
      expect(errorData.error.message.toLowerCase()).toContain('tier');
    });

    test('tier1 vendor cannot upgrade to tier2 via API', async ({ page }) => {
      const vendorId = await loginVendor(page, TEST_VENDORS.tier1.email, TEST_VENDORS.tier1.password);

      const response = await page.request.put(
        `${API_BASE}/api/portal/vendors/${vendorId}?byUserId=true`,
        { data: { tier: 'tier2' } }
      );

      expect(response.ok()).toBe(false);
      expect(response.status()).toBe(403);
    });

    test('tier3 vendor cannot downgrade to tier1 via API', async ({ page }) => {
      const vendorId = await loginVendor(page, TEST_VENDORS.tier3.email, TEST_VENDORS.tier3.password);

      const response = await page.request.put(
        `${API_BASE}/api/portal/vendors/${vendorId}?byUserId=true`,
        { data: { tier: 'tier1' } }
      );

      expect(response.ok()).toBe(false);
      expect(response.status()).toBe(403);
    });
  });

  test.describe('UI: Upgrade Prompts for Tier-Restricted Features', () => {
    test('free tier vendor sees upgrade prompt for tier1+ feature', async ({ page }) => {
      await loginVendor(page, TEST_VENDORS.free.email, TEST_VENDORS.free.password);

      // Navigate to dashboard
      await page.goto(`${API_BASE}/vendor/dashboard/profile`);
      await page.waitForLoadState('networkidle');

      // Try to access a tier-restricted feature (e.g., case studies tab)
      const caseStudiesTab = page.locator('[data-testid="tab-case-studies"]').or(
        page.getByRole('tab', { name: /case studies/i })
      );

      // If tab exists, it should either be disabled or show upgrade prompt
      const isVisible = await caseStudiesTab.isVisible().catch(() => false);

      if (isVisible) {
        await caseStudiesTab.click();

        // Should show upgrade prompt
        const upgradePrompt = page.locator('text=/upgrade/i').or(
          page.locator('[class*="upgrade"]')
        );
        await expect(upgradePrompt.first()).toBeVisible({ timeout: 3000 });
      }
    });

    test('tier1 vendor sees upgrade prompt for tier2+ features', async ({ page }) => {
      await loginVendor(page, TEST_VENDORS.tier1.email, TEST_VENDORS.tier1.password);

      await page.goto(`${API_BASE}/vendor/dashboard/profile`);
      await page.waitForLoadState('networkidle');

      // Check for location limit upgrade prompt (tier1 has 5 location limit)
      const locationsSection = page.locator('text=/locations/i').first();
      if (await locationsSection.isVisible()) {
        await locationsSection.click();

        // Should show location limit or upgrade prompt
        const limitText = page.locator('text=/5 locations/i, text=/upgrade for more/i');
        const hasLimitInfo = await limitText.count() > 0;

        // Tier1 should have location restrictions mentioned
        expect(hasLimitInfo || await page.locator('text=/tier 2/i').count() > 0).toBeTruthy();
      }
    });
  });

  test.describe('UI: No Tier Selection in Profile Editor', () => {
    test('vendor profile editor does not show tier dropdown', async ({ page }) => {
      await loginVendor(page, TEST_VENDORS.tier2.email, TEST_VENDORS.tier2.password);

      await page.goto(`${API_BASE}/vendor/dashboard/profile`);
      await page.waitForLoadState('networkidle');

      // Look for any tier selection UI elements
      const tierDropdown = page.locator('select[name="tier"], input[name="tier"]');
      const tierRadio = page.locator('input[type="radio"][value*="tier"]');

      // Should NOT exist in the form
      await expect(tierDropdown).not.toBeVisible();
      await expect(tierRadio).not.toBeVisible();
    });

    test('vendor can see their current tier but cannot edit it', async ({ page }) => {
      await loginVendor(page, TEST_VENDORS.tier1.email, TEST_VENDORS.tier1.password);

      await page.goto(`${API_BASE}/vendor/dashboard`);
      await page.waitForLoadState('networkidle');

      // Should display current tier as read-only info
      const tierBadge = page.locator('text=/tier 1/i, [data-testid="current-tier"]');
      const isVisible = await tierBadge.first().isVisible().catch(() => false);

      if (isVisible) {
        // If tier is shown, it should be read-only (badge, not input)
        const tierInput = page.locator('input[value*="tier1"], select option[selected]:has-text("Tier 1")');
        await expect(tierInput).not.toBeVisible();
      }
    });
  });
});
