/**
 * E2E Test: Product Reviews Visual Check
 * Manual visual verification of review cards
 */
import { test } from '@playwright/test';

test.describe('Product Reviews Visual Verification', () => {
  const productUrl = '/products/nautictech-solutions-complete-system-integration';

  test('Visual check - scroll to see review cards', async ({ page }) => {
    await page.goto(productUrl);
    await page.waitForLoadState('networkidle');

    // Navigate to Reviews tab
    const reviewsTab = page.getByRole('tab', { name: /reviews/i });
    await reviewsTab.click();
    await page.waitForTimeout(1000);

    console.log('📍 Step 1: On Reviews tab');

    // Scroll down to see review cards
    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(1000);

    // Take screenshot of top section
    await page.screenshot({
      path: 'test-results/product-reviews-step1-top.png',
      fullPage: false
    });
    console.log('📸 Screenshot 1 saved: test-results/product-reviews-step1-top.png');

    // Scroll more to see individual review cards
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: 'test-results/product-reviews-step2-cards.png',
      fullPage: false
    });
    console.log('📸 Screenshot 2 saved: test-results/product-reviews-step2-cards.png');

    // Check page content for review data
    const content = await page.content();

    const checks = {
      'David Martinez': content.includes('David Martinez'),
      'Mike Roberts': content.includes('Mike Roberts'),
      'Sarah Chen': content.includes('Sarah Chen'),
      'reviewerName': content.includes('reviewerName') || content.includes('reviewer_name'),
      'overallRating': content.includes('overallRating') || content.includes('overall_rating'),
      'reviewText': content.includes('reviewText') || content.includes('review_text'),
    };

    console.log('\n📊 Page Content Analysis:');
    Object.entries(checks).forEach(([key, found]) => {
      console.log(`  ${found ? '✅' : '❌'} ${key}: ${found}`);
    });

    // Count visible review elements
    const reviewCards = await page.locator('.card, [class*="review"], [data-testid*="review"]').count();
    console.log(`\n📦 Found ${reviewCards} potential review card elements`);

    // Look for specific reviewer names in visible text
    const visibleText = await page.locator('body').textContent();
    const reviewerMatches = (visibleText || '').match(/David Martinez|Mike Roberts|Sarah Chen/gi);
    console.log(`👤 Found ${reviewerMatches?.length || 0} reviewer name mentions in visible text`);

    // Final full page screenshot
    await page.screenshot({
      path: 'test-results/product-reviews-fullpage.png',
      fullPage: true
    });
    console.log('📸 Full page screenshot saved: test-results/product-reviews-fullpage.png');

    console.log('\n✅ Visual verification complete - check screenshots');
  });
});
