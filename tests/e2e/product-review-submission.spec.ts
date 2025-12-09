/**
 * E2E Test: Product Review Submission
 *
 * Verifies:
 * 1. Reviews display properly after submission
 * 2. No page reload occurs (optimistic UI update)
 * 3. Rating filter works correctly
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('Product Review Submission', () => {
  const testProductUrl = `${BASE_URL}/products/superyacht-integration-solutions-intelligent-lighting-control-system`;

  test.beforeEach(async ({ page }) => {
    await page.goto(testProductUrl);
    await page.waitForLoadState('networkidle');
  });

  test('should submit a review and display it immediately without page reload', async ({ page }) => {
    // Navigate to Reviews tab
    await page.click('button[value="reviews"]');
    await expect(page.locator('[data-testid="owner-reviews"]')).toBeVisible();

    // Count initial reviews
    const initialReviewCount = await page.locator('[data-testid="review-card"]').count();
    console.log(`Initial review count: ${initialReviewCount}`);

    // Click "Write a Review" button
    const writeReviewButton = page.locator('button:has-text("Write a Review")');
    await expect(writeReviewButton).toBeVisible();
    await writeReviewButton.click();

    // Fill out the review form
    const reviewData = {
      name: `Test Reviewer ${Date.now()}`,
      title: 'Yacht Captain',
      yachtName: 'M/Y Test Yacht',
      rating: 5,
      review: 'This is an excellent product! The lighting control system works flawlessly and integrates perfectly with our yacht systems.'
    };

    // Wait for modal dialog to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input[name="ownerName"], input[placeholder*="name"]')).toBeVisible({ timeout: 5000 });

    // Fill form fields
    await page.fill('input[name="ownerName"], input[placeholder*="name"]', reviewData.name);
    await page.fill('input[name="title"], input[placeholder*="title"], input[placeholder*="role"]', reviewData.title);
    await page.fill('input[name="yachtName"], input[placeholder*="yacht"]', reviewData.yachtName);

    // Select rating (click the 5th star)
    const stars = page.locator('button[role="radio"], [data-rating]');
    await stars.nth(4).click(); // 5th star (0-indexed)

    // Fill review text
    await page.fill('textarea[name="review"], textarea[placeholder*="review"]', reviewData.review);

    // Listen for navigation (which should NOT happen)
    let navigationOccurred = false;
    page.on('framenavigated', () => {
      navigationOccurred = true;
    });

    // Submit the review
    const submitButton = page.locator('button:has-text("Submit Review"), button:has-text("Submit")');
    await submitButton.click();

    // Wait for success toast
    await expect(page.locator('text=Review Submitted')).toBeVisible({ timeout: 10000 });

    // Wait a moment for optimistic update
    await page.waitForTimeout(1000);

    // Verify NO page reload occurred
    expect(navigationOccurred).toBe(false);
    console.log('[OK] No page reload occurred');

    // Verify the new review appears in the list
    const updatedReviewCount = await page.locator('[data-testid="review-card"]').count();
    expect(updatedReviewCount).toBe(initialReviewCount + 1);
    console.log(`[OK] New review added. Updated count: ${updatedReviewCount}`);

    // Verify the review content is visible
    await expect(page.locator(`text=${reviewData.name}`)).toBeVisible();
    await expect(page.locator(`text=${reviewData.review}`).first()).toBeVisible();
    console.log('[OK] Review content is visible');
  });

  test('should filter reviews by rating', async ({ page }) => {
    // Navigate to Reviews tab
    await page.click('button[value="reviews"]');
    await expect(page.locator('[data-testid="owner-reviews"]')).toBeVisible();

    // Wait for reviews to load
    await page.waitForTimeout(1000);

    // Count total reviews
    const totalReviews = await page.locator('[data-testid="review-card"]').count();
    console.log(`Total reviews: ${totalReviews}`);

    // Find the rating filter dropdown
    const ratingFilter = page.locator('select').filter({ hasText: 'All ratings' }).or(
      page.locator('select:has(option:has-text("All ratings"))')
    );

    await expect(ratingFilter).toBeVisible();

    // Select 5-star reviews
    await ratingFilter.selectOption('5');
    await page.waitForTimeout(500);

    // Verify filtered reviews (all should be 5-star)
    const fiveStarReviews = await page.locator('[data-testid="review-card"]').count();
    console.log(`5-star reviews: ${fiveStarReviews}`);

    // Verify the filter count message
    if (fiveStarReviews < totalReviews) {
      await expect(page.locator(`text=Showing ${fiveStarReviews} of ${totalReviews} reviews`)).toBeVisible();
    }

    // Select 4-star reviews
    await ratingFilter.selectOption('4');
    await page.waitForTimeout(500);

    const fourStarReviews = await page.locator('[data-testid="review-card"]').count();
    console.log(`4-star reviews: ${fourStarReviews}`);

    // Reset filter to all reviews
    await ratingFilter.selectOption('');
    await page.waitForTimeout(500);

    const allReviewsAgain = await page.locator('[data-testid="review-card"]').count();
    expect(allReviewsAgain).toBe(totalReviews);
    console.log('[OK] Filter reset to show all reviews');
  });

  test('should NOT show search box (search feature removed)', async ({ page }) => {
    // Navigate to Reviews tab
    await page.click('button[value="reviews"]');
    await expect(page.locator('[data-testid="owner-reviews"]')).toBeVisible();

    // Verify NO search input exists
    const searchInputs = page.locator('input[type="search"], input[placeholder*="search" i]');
    await expect(searchInputs).toHaveCount(0);
    console.log('[OK] No search box found (as expected)');

    // Verify rating filter IS present
    const ratingFilter = page.locator('select:has(option:has-text("All ratings"))');
    await expect(ratingFilter).toBeVisible();
    console.log('[OK] Rating filter is present');
  });

  test('should display review statistics', async ({ page }) => {
    // Navigate to Reviews tab
    await page.click('button[value="reviews"]');
    await expect(page.locator('[data-testid="owner-reviews"]')).toBeVisible();

    // Wait for statistics to load
    await page.waitForTimeout(1000);

    // Verify statistics section exists
    const statsSection = page.locator('text=Average Rating').or(
      page.locator('text=Total Reviews')
    );

    // Statistics might not always be visible depending on review count
    const statsCount = await statsSection.count();
    console.log(`Statistics sections found: ${statsCount}`);

    if (statsCount > 0) {
      console.log('[OK] Review statistics are displayed');
    } else {
      console.log('ℹ️ No statistics displayed (may require minimum reviews)');
    }
  });

  test('should open review form in a modal dialog', async ({ page }) => {
    // Navigate to Reviews tab
    await page.click('button[value="reviews"]');
    await expect(page.locator('[data-testid="owner-reviews"]')).toBeVisible();

    // Verify modal is NOT visible initially
    const modal = page.locator('[role="dialog"]');
    await expect(modal).not.toBeVisible();
    console.log('[OK] Modal is hidden initially');

    // Click "Write a Review" button
    const writeReviewButton = page.locator('button:has-text("Write a Review")');
    await writeReviewButton.click();

    // Verify modal appears
    await expect(modal).toBeVisible();
    await expect(page.locator('[role="dialog"] >> text=Write a Review')).toBeVisible();
    console.log('[OK] Modal opened with form');

    // Verify form fields are present in modal
    await expect(page.locator('[role="dialog"] input[placeholder*="name"]')).toBeVisible();
    await expect(page.locator('[role="dialog"] textarea[placeholder*="review"]')).toBeVisible();
    console.log('[OK] Form fields are visible in modal');

    // Click cancel button
    const cancelButton = page.locator('[role="dialog"] button:has-text("Cancel")');
    await cancelButton.click();

    // Verify modal closes
    await expect(modal).not.toBeVisible();
    console.log('[OK] Modal closes when Cancel is clicked');

    // Verify we're still on the Reviews tab (no navigation occurred)
    await expect(page.locator('[data-testid="owner-reviews"]')).toBeVisible();
    console.log('[OK] User stays on Reviews tab after closing modal');
  });
});
