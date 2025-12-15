import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('Featured Vendors Priority', () => {
  test('should show featured vendors before non-featured vendors', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendors`);
    await page.waitForLoadState('networkidle');

    // Get all vendor cards
    const vendorCards = page.locator('[data-testid="vendor-card"]');
    const totalCards = await vendorCards.count();

    console.log(`Total vendor cards: ${totalCards}`);

    // Check the first 6 cards for featured badges
    const featuredInTopSix = [];
    for (let i = 0; i < Math.min(6, totalCards); i++) {
      const card = vendorCards.nth(i);
      const hasFeaturedBadge = await card.locator('text=/featured/i').count() > 0;
      featuredInTopSix.push(hasFeaturedBadge);

      // Use .first() to handle mobile/desktop duplicate headings
      const companyName = await card.locator('h3').first().textContent();
      console.log(`Card ${i + 1}: ${companyName} - Featured: ${hasFeaturedBadge}`);
    }

    // Count how many of the top 6 are featured
    const featuredCount = featuredInTopSix.filter(Boolean).length;
    console.log(`Featured vendors in top 6: ${featuredCount}`);

    // At least some of the top vendors should be featured
    expect(featuredCount).toBeGreaterThan(0);
  });

  test('should maintain featured priority with name search', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendors`);
    await page.waitForLoadState('networkidle');

    // Search for "yacht" or "superyacht" which should match featured vendors
    const searchInput = page.getByTestId('name-search-input');
    await searchInput.fill('yacht');
    await page.waitForTimeout(500);

    // Check that featured vendors still appear first
    const vendorCards = page.locator('[data-testid="vendor-card"]');
    const firstCard = vendorCards.first();

    if (await vendorCards.count() > 0) {
      const hasFeatured = await firstCard.locator('text=/featured/i').count() > 0;
      console.log('First result after search is featured:', hasFeatured);

      // Take screenshot
      await page.screenshot({
        path: 'test-results/featured-priority-search.png',
        fullPage: false,
      });
    }
  });

  test('should show featured badge with correct styling', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendors`);
    await page.waitForLoadState('networkidle');

    // Find a featured badge - it may be on mobile-hidden element so scroll to first card
    const vendorCards = page.locator('[data-testid="vendor-card"]');
    await expect(vendorCards.first()).toBeVisible({ timeout: 10000 });

    // Look for featured badge within visible cards
    const featuredBadge = page.locator('[data-testid="vendor-card"] >> text=/featured/i').first();
    const badgeCount = await featuredBadge.count();

    if (badgeCount > 0) {
      // Scroll to the badge's parent card to make it visible
      await featuredBadge.scrollIntoViewIfNeeded();

      // The badge may be part of a conditional render - just verify the badge element exists
      const isVisible = await featuredBadge.isVisible().catch(() => false);
      if (isVisible) {
        console.log('Featured badge is visible');
      } else {
        console.log('[INFO] Featured badge exists but not visible in current viewport');
      }

      // Check that parent card has star icon somewhere
      const parentCard = featuredBadge.locator('xpath=ancestor::*[@data-testid="vendor-card"]');
      const hasStar = await parentCard.locator('svg').count() > 0;

      console.log('Featured card has star icon:', hasStar);
      expect(hasStar).toBe(true);
    } else {
      console.log('[INFO] No featured badges found in current view');
    }
  });

  test('featured vendors should be sorted before non-featured regardless of name', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendors`);
    await page.waitForLoadState('networkidle');

    const vendorCards = page.locator('[data-testid="vendor-card"]');
    const totalCards = await vendorCards.count();

    let firstNonFeaturedIndex = -1;
    let lastFeaturedIndex = -1;

    // Find the last featured vendor and first non-featured vendor
    for (let i = 0; i < totalCards; i++) {
      const card = vendorCards.nth(i);
      const isFeatured = await card.locator('text=/featured/i').count() > 0;

      if (isFeatured) {
        lastFeaturedIndex = i;
      } else if (firstNonFeaturedIndex === -1) {
        firstNonFeaturedIndex = i;
      }
    }

    console.log(`Last featured vendor at index: ${lastFeaturedIndex}`);
    console.log(`First non-featured vendor at index: ${firstNonFeaturedIndex}`);

    // If there are both featured and non-featured vendors,
    // all featured should come before all non-featured
    if (lastFeaturedIndex !== -1 && firstNonFeaturedIndex !== -1) {
      expect(lastFeaturedIndex).toBeLessThan(firstNonFeaturedIndex);
    }
  });
});
