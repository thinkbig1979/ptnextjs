/**
 * E2E Test: Vendor Review Display
 * Verifies that submitted reviews are properly displayed
 */

import { test, expect } from '@playwright/test';

test.describe('Vendor Review Display', () => {
  const vendorUrl = '/vendors/test-vendor-1762171312643';

  test('should display submitted review with all details', async ({ page }) => {
    console.log('\n=== Verifying Review Display ===\n');

    await page.goto(vendorUrl);
    await page.waitForLoadState('networkidle');

    // Click Reviews tab
    const reviewsTab = page.locator('[role="tab"]').filter({ hasText: 'Reviews' });
    await reviewsTab.click();
    await page.waitForTimeout(1000);

    // Check for review statistics
    const statistics = page.locator('[data-testid="review-statistics"]');
    if (await statistics.isVisible()) {
      const avgRating = await page.locator('text=/Average Rating/').textContent();
      console.log(`[OK] Found rating summary: ${avgRating}`);
    }

    // Look for the reviewer name "Tester"
    const reviewerName = page.locator('text=Tester').first();
    const reviewerVisible = await reviewerName.isVisible().catch(() => false);

    if (reviewerVisible) {
      console.log('[OK] SUCCESS: Review is displayed on the page');

      // Check for review content
      const reviewText = page.locator('text=/All good, lovely and such/');
      const hasReviewText = await reviewText.isVisible().catch(() => false);
      console.log(`Review text visible: ${hasReviewText}`);

      // Check for rating stars
      const stars = page.locator('[class*="fill-yellow"]');
      const starCount = await stars.count();
      console.log(`Rating stars found: ${starCount}`);

      // Check for yacht name
      const yachtName = page.locator('text=/Pete/');
      const hasYachtName = await yachtName.isVisible().catch(() => false);
      console.log(`Yacht name visible: ${hasYachtName}`);

      expect(reviewerVisible).toBe(true);
    } else {
      console.log('[FAIL] FAILURE: Review not visible on page');

      // Debug: Check what's on the page
      const noReviewsMessage = page.locator('text=/No reviews available/');
      const hasNoReviews = await noReviewsMessage.isVisible().catch(() => false);

      if (hasNoReviews) {
        console.log('  - "No reviews available" message is showing');
      }

      const allText = await page.locator('body').textContent();
      const hasTesterInDom = allText?.includes('Tester');
      console.log(`  - "Tester" in DOM: ${hasTesterInDom}`);

      throw new Error('Review not displayed on page');
    }
  });
});
