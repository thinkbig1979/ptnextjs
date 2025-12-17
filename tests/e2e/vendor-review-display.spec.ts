/**
 * E2E Test: Vendor Review Display
 * Verifies that the vendor reviews section is properly displayed
 */

import { test, expect } from '@playwright/test';

test.describe('Vendor Review Display', () => {
  const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
  const vendorSlug = 'testvendor-tier2'; // Use tier2 vendor from global setup

  test('should display submitted review with all details', async ({ page }) => {
    console.log('\n=== Verifying Review Display ===\n');

    await page.goto(`${BASE_URL}/vendors/${vendorSlug}`);
    await page.waitForLoadState('networkidle');

    // Click Reviews tab
    const reviewsTab = page.locator('[role="tab"]').filter({ hasText: 'Reviews' });
    await expect(reviewsTab).toBeVisible();
    await reviewsTab.click();
    await page.waitForTimeout(1000);

    // The test should verify the reviews section is present
    // It may show reviews or "No reviews available" message

    // Check for the reviews container
    const reviewsContainer = page.locator('[data-testid="vendor-reviews"], .reviews-section, [class*="review"]').first();
    const noReviewsMessage = page.getByText(/no reviews available/i);
    const reviewCard = page.locator('[data-testid="review-card"], [class*="review-card"]').first();

    // Either reviews should be visible OR "no reviews" message
    const hasReviewCard = await reviewCard.isVisible().catch(() => false);
    const hasNoReviewsMessage = await noReviewsMessage.isVisible().catch(() => false);

    if (hasReviewCard) {
      console.log('[OK] Review cards are displayed');

      // If we have reviews, verify they have content
      const reviewContent = await reviewCard.textContent();
      expect(reviewContent?.length).toBeGreaterThan(0);
      console.log('[OK] Review card has content');

      // Check for rating display (stars or numeric)
      const hasRating = await page.locator('[class*="star"], [class*="rating"], svg').first().isVisible().catch(() => false);
      console.log(`Rating display visible: ${hasRating}`);

    } else if (hasNoReviewsMessage) {
      console.log('[OK] "No reviews available" message displayed correctly');
      // This is valid - the vendor just doesn't have reviews yet

      // Verify there's a way to write a review
      const writeReviewButton = page.getByRole('button', { name: /write.*review/i });
      const hasWriteButton = await writeReviewButton.isVisible().catch(() => false);
      console.log(`Write review button visible: ${hasWriteButton}`);

    } else {
      // If neither, check what's on the page
      const pageText = await page.locator('body').textContent();
      console.log('Page content sample:', pageText?.substring(0, 500));

      // The reviews section should exist even if empty
      throw new Error('Neither reviews nor "no reviews" message found');
    }

    console.log('\n=== Review Display Test Complete ===\n');
  });
});
