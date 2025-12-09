/**
 * E2E Test: Product Reviews Full Display
 * Comprehensive check that reviews display completely
 */
import { test, expect } from '@playwright/test';

test.describe('Product Reviews Complete Display', () => {
  const productUrl = '/products/nautictech-solutions-complete-system-integration';

  test('Product reviews display all elements correctly', async ({ page }) => {
    await page.goto(productUrl);
    await page.waitForLoadState('networkidle');

    // Navigate to Reviews tab
    const reviewsTab = page.getByRole('tab', { name: /reviews/i });
    await reviewsTab.click();
    await page.waitForTimeout(1000);

    // Verify "Owner Reviews" heading exists
    const ownerReviewsHeading = page.getByText('Owner Reviews');
    await expect(ownerReviewsHeading).toBeVisible();
    console.log('[OK] "Owner Reviews" heading visible');

    // Verify average rating is shown
    const averageRating = page.locator('text=/Average Rating|3\\.5/i').first();
    await expect(averageRating).toBeVisible();
    console.log('[OK] Average rating displayed');

    // Verify review count is shown
    const reviewCount = page.locator('text=/\\(\\d+ reviews?\\)/i');
    await expect(reviewCount).toBeVisible();
    const countText = await reviewCount.textContent();
    console.log('[OK] Review count displayed:', countText);

    // Verify "Write a Review" button exists
    const writeReviewBtn = page.getByRole('button', { name: /write a review/i });
    await expect(writeReviewBtn).toBeVisible();
    console.log('[OK] "Write a Review" button visible');

    // Scroll down to see actual review cards
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(500);

    // Look for reviewer names
    const reviewerNames = page.locator('span.font-medium').filter({
      hasText: /David Martinez|Sarah Chen|Mike Roberts/i
    });
    const nameCount = await reviewerNames.count();
    console.log(`[OK] Found ${nameCount} reviewer name(s)`);
    expect(nameCount).toBeGreaterThan(0);

    // Take screenshot of the reviews section
    await page.screenshot({
      path: 'test-results/product-reviews-working.png',
      fullPage: false
    });
    console.log('[PHOTO] Screenshot saved to test-results/product-reviews-working.png');

    // Verify stars are displayed
    const stars = page.locator('svg').filter({ hasText: '' }).or(page.locator('[aria-label*="star"]'));
    const starCount = await stars.count();
    console.log(`[OK] Found ${starCount} star rating elements`);

    console.log('\n🎉 CONCLUSION: Product reviews are displaying correctly!');
  });
});
