/**
 * E2E Test: Product Review Modal Fix
 * Verifies that "Write the First Review" button opens modal on products with no reviews
 */
import { test, expect } from '@playwright/test';

test.describe('Product Review Modal Fix', () => {
  // Use product from build-time seed data (data/seed.ts), not global-setup.ts
  // Products seeded at build time have their pages pre-generated via SSG
  const productUrl = '/products/marine-av-technologies-complete-system-integration';

  test('01 - Modal opens when clicking "Write the First Review"', async ({ page }) => {
    await page.goto(productUrl);
    await page.waitForLoadState('networkidle');

    // Navigate to Reviews tab if it exists
    const reviewsTab = page.getByRole('tab', { name: /reviews/i });
    if (await reviewsTab.isVisible()) {
      await reviewsTab.click();
      await page.waitForTimeout(500);
    }

    console.log('[PIN] Step 1: Looking for Write Review button');

    // Look for the "Write the First Review" or "Write a Review" button
    const writeReviewButton = page.locator('button').filter({
      hasText: /write.*first.*review|write.*review/i
    }).first();

    const buttonVisible = await writeReviewButton.isVisible();
    console.log('  - Button visible:', buttonVisible);

    if (!buttonVisible) {
      console.log('[FAIL] ERROR: Write Review button not found');
      throw new Error('Write Review button not found');
    }

    const buttonText = await writeReviewButton.textContent();
    console.log('  - Button text:', buttonText);

    // Click the button
    console.log('\n[PIN] Step 2: Clicking Write Review button');
    await writeReviewButton.click();
    await page.waitForTimeout(1000);

    // Check if modal/dialog appears
    const dialog = page.locator('[role="dialog"]');
    const dialogVisible = await dialog.isVisible();
    console.log('  - Dialog visible:', dialogVisible);

    if (!dialogVisible) {
      console.log('[FAIL] ERROR: Dialog did not appear after clicking button');
      await page.screenshot({
        path: 'test-results/product-review-modal-failed.png',
        fullPage: true
      });
      throw new Error('Dialog did not open');
    }

    console.log('\n[OK] SUCCESS: Modal opened!');

    // Verify modal contains review form elements
    const modalTitle = await page.locator('[role="dialog"]').getByText('Write a Review').isVisible();
    const ratingSelect = await page.locator('[role="dialog"]').locator('select, [role="combobox"]').first().isVisible();
    const nameInput = await page.locator('[role="dialog"]').getByPlaceholder(/captain|name/i).isVisible();

    console.log('\n[LIST] Modal Form Elements:');
    console.log('  - Title "Write a Review":', modalTitle);
    console.log('  - Rating selector:', ratingSelect);
    console.log('  - Name input:', nameInput);

    expect(dialogVisible).toBeTruthy();
    expect(modalTitle).toBeTruthy();

    // Take screenshot of success
    await page.screenshot({
      path: 'test-results/product-review-modal-success.png',
      fullPage: false
    });
    console.log('\n[PHOTO] Screenshot saved: test-results/product-review-modal-success.png');
  });
});
