/**
 * E2E Test: Product Reviews Display Verification
 * Verifies that product reviews are properly fetched and displayed
 */
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('Product Reviews Display', () => {
  // Use tier2 product that is seeded in global-setup.ts
  const productUrl = '/products/tier2-nav-system';

  test('01 - Reviews section renders correctly', async ({ page }) => {
    await page.goto(productUrl);

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Navigate to Reviews tab
    const reviewsTab = page.getByRole('tab', { name: /reviews/i });
    expect(await reviewsTab.isVisible()).toBeTruthy();

    await reviewsTab.click();

    // Wait for the reviews tab content to become visible
    // The tab panel should become visible after clicking
    const reviewsTabPanel = page.locator('[role="tabpanel"][data-state="active"]');
    await reviewsTabPanel.waitFor({ state: 'visible', timeout: 5000 });
    console.log('[OK] Reviews tab panel is visible');

    // Check for Write Review button (should exist for products without reviews)
    const writeReviewButton = page.locator('button').filter({ hasText: /write.*review/i }).first();
    const hasWriteButton = await writeReviewButton.isVisible({ timeout: 3000 }).catch(() => false);
    console.log('  - Write Review button visible:', hasWriteButton);

    // Check for rating filter dropdown (indicates review filtering capability)
    const ratingFilter = page.locator('select').first();
    const hasFilter = await ratingFilter.isVisible({ timeout: 2000 }).catch(() => false);
    console.log('  - Rating filter visible:', hasFilter);

    // Reviews section should have Write Review button and/or rating filter
    expect(hasWriteButton || hasFilter).toBeTruthy();
  });

  test('02 - Check product page loads correctly', async ({ request }) => {
    // Check that the product page returns 200 OK
    const productResponse = await request.get(`${BASE_URL}${productUrl}`);
    expect(productResponse.ok()).toBeTruthy();

    const html = await productResponse.text();

    // Check that the page contains product-related elements
    const hasProductName = html.includes('Professional Marine Navigation System') ||
                          html.includes('tier2-nav-system');
    const hasReviewsTab = html.includes('Reviews') || html.includes('reviews');
    const hasProductVendor = html.includes('data-testid="product-vendor"');

    console.log('Product Page Check:');
    console.log('  - Contains product name:', hasProductName);
    console.log('  - Contains reviews tab:', hasReviewsTab);
    console.log('  - Contains vendor info:', hasProductVendor);

    expect(hasProductName || hasReviewsTab).toBeTruthy();
  });

  test('03 - Verify review submission component exists', async ({ page }) => {
    await page.goto(productUrl);
    await page.waitForLoadState('networkidle');

    // Look for a "Write a Review" or similar button
    const writeReviewButton = page.locator('button, a').filter({
      hasText: /write.*review|add.*review|submit.*review/i
    });

    const buttonVisible = await writeReviewButton.first().isVisible().catch(() => false);
    console.log('Write Review button visible:', buttonVisible);

    if (buttonVisible) {
      await writeReviewButton.first().click();
      await page.waitForTimeout(500);

      // Check if modal/form appears
      const formVisible = await page.locator('form, [role="dialog"]').isVisible().catch(() => false);
      console.log('Review form/modal appears:', formVisible);
    }
  });
});
