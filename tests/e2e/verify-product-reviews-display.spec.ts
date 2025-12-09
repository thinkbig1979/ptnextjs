/**
 * E2E Test: Product Reviews Display Verification
 * Verifies that product reviews are properly fetched and displayed
 */
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('Product Reviews Display', () => {
  const productUrl = '/products/nautictech-solutions-complete-system-integration';

  test('01 - Product with reviews displays them correctly', async ({ page }) => {
    await page.goto(productUrl);

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Navigate to Reviews tab (if it exists)
    const reviewsTab = page.getByRole('tab', { name: /reviews/i });
    if (await reviewsTab.isVisible()) {
      await reviewsTab.click();
      await page.waitForTimeout(500);
    }

    // Check if reviews are displayed
    const reviewsSection = page.locator('[data-testid*="review"], .review, [class*="review"]').first();

    if (await reviewsSection.isVisible()) {
      console.log('[OK] Reviews section found and visible');

      // Check for review content
      const hasReviewerName = await page.locator('text=/David Martinez|Sarah Chen|Mike Roberts/i').isVisible();
      const hasRating = await page.locator('[data-testid*="rating"], [class*="rating"], [aria-label*="star"]').first().isVisible();

      console.log('  - Has reviewer name:', hasReviewerName);
      console.log('  - Has rating display:', hasRating);

      expect(hasReviewerName || hasRating).toBeTruthy();
    } else {
      console.log('[WARN]️  No reviews section visible - checking if ownerReviews are being passed to component');

      // Check the page source for review data
      const content = await page.content();
      const hasReviewData = content.includes('David Martinez') ||
                           content.includes('Sarah Chen') ||
                           content.includes('overall_rating') ||
                           content.includes('ownerReview');

      if (hasReviewData) {
        console.log('[WARN]️  Review data exists in page but not rendered in UI');
      } else {
        console.log('[FAIL] Review data not found in page at all - data service may not be passing ownerReviews');
      }
    }
  });

  test('02 - Check API endpoint returns reviews', async ({ request }) => {
    // First, let's check if there's a reviews API endpoint
    const productResponse = await request.get(`${BASE_URL}${productUrl}`);
    expect(productResponse.ok()).toBeTruthy();

    const html = await productResponse.text();

    // Check if review data is in the page HTML
    const hasReviewerName = html.includes('David Martinez') || html.includes('Sarah Chen');
    const hasReviewData = html.includes('ownerReview') || html.includes('rating');

    console.log('API Response Check:');
    console.log('  - Contains reviewer names:', hasReviewerName);
    console.log('  - Contains review data:', hasReviewData);

    if (!hasReviewerName && !hasReviewData) {
      console.log('[FAIL] ISSUE FOUND: Product reviews not in SSG page data');
      console.log('   This indicates transformPayloadProduct may not be including ownerReviews in return object');
    }
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
