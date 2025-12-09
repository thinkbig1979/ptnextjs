import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('Brand Story Tier Access Fix Verification', () => {
  test('testvendor (tier1) should see Brand Story form, NOT upgrade prompt', async ({ page }) => {
    console.log('\n=== Testing Brand Story Tier Access Fix ===\n');

    // Step 1: Login
    console.log('Step 1: Login as testvendor...');
    await page.goto(`${BASE_URL}/vendor/login`);
    await page.getByPlaceholder('vendor@example.com').fill('testvendor@example.com');
    await page.getByPlaceholder('Enter your password').fill('123');
    await page.getByRole('button', { name: /login/i }).click();
    await page.waitForURL(/\/vendor\/dashboard/, { timeout: 10000 });
    console.log('[OK] Logged in successfully\n');

    // Step 2: Navigate to Profile
    console.log('Step 2: Navigate to Profile page...');
    await page.goto(`${BASE_URL}/vendor/dashboard/profile`);
    await page.waitForLoadState('networkidle');
    console.log('[OK] Profile page loaded\n');

    // Step 3: Click Brand Story tab
    console.log('Step 3: Click Brand Story tab...');
    const brandStoryTab = page.locator('[role="tab"]:has-text("Brand Story")').first();
    await expect(brandStoryTab).toBeVisible({ timeout: 5000 });
    await brandStoryTab.click();
    await page.waitForTimeout(1000);
    console.log('[OK] Brand Story tab clicked\n');

    // Step 4: Verify form is visible (NOT upgrade prompt)
    console.log('Step 4: Verifying form visibility...');

    // Check for form elements
    const companyLinksHeader = page.locator('text=Company Links').first();
    const formVisible = await companyLinksHeader.isVisible({ timeout: 3000 }).catch(() => false);

    // Check for upgrade prompt (should NOT exist)
    const upgradeDialog = page.locator('[role="dialog"]');
    const dialogCount = await upgradeDialog.count();
    let hasUpgradePrompt = false;

    for (let i = 0; i < dialogCount; i++) {
      const text: string | null = await upgradeDialog.nth(i).textContent().catch(() => '');
      if (text && (text.includes('Upgrade') || text.includes('Unlock') || text.includes('tier'))) {
        hasUpgradePrompt = true;
        console.error(`✗ Found upgrade prompt: "${text.substring(0, 100)}..."`);
      }
    }

    console.log(`Form visible: ${formVisible}`);
    console.log(`Upgrade prompt found: ${hasUpgradePrompt}`);

    // Take screenshot
    await page.screenshot({
      path: '/tmp/brand-story-test-result.png',
      fullPage: true
    });
    console.log('[OK] Screenshot saved to /tmp/brand-story-test-result.png\n');

    // Assert: Form should be visible AND no upgrade prompt
    if (hasUpgradePrompt) {
      throw new Error(
        '[FAIL] FAILURE: Upgrade prompt detected! The tier field is not being passed correctly. ' +
        'VendorDashboardContext fetcher may not be extracting vendor data from API response.'
      );
    }

    expect(formVisible).toBe(true);
    console.log('[OK] SUCCESS: Brand Story form is accessible for tier1 vendor!');
    console.log('[OK] The VendorDashboardContext fix is working correctly!\n');
  });
});
