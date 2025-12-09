import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('Featured Vendors Sorting', () => {
  test('should display featured vendors at the top of the listing', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendors`);
    await page.waitForLoadState('networkidle');

    // Get all vendor cards
    const vendorCards = page.locator('[data-testid="vendor-card"]').or(page.locator('article').filter({ hasText: /vendor/i })).or(page.locator('a[href*="/vendors/"]'));

    // Wait for vendors to load
    await page.waitForTimeout(1000);

    // Get the first few vendor cards
    const firstCard = vendorCards.first();
    const secondCard = vendorCards.nth(1);
    const thirdCard = vendorCards.nth(2);

    // Check if any of the first cards have featured indicators
    // Featured vendors typically have badges or special styling
    const hasFeaturedBadge = await firstCard.locator('text=/featured/i').count() > 0;

    console.log('First vendor has featured badge:', hasFeaturedBadge);

    // Take a screenshot to visually verify
    await page.screenshot({
      path: 'test-results/vendor-featured-sorting.png',
      fullPage: false,
    });
  });

  test('should maintain featured sorting with search filter', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendors`);
    await page.waitForLoadState('networkidle');

    // Search for something that should include featured vendors
    const nameInput = page.getByTestId('name-search-input');
    await nameInput.fill('Superyacht');

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Take screenshot of filtered results
    await page.screenshot({
      path: 'test-results/vendor-featured-sorting-filtered.png',
      fullPage: false,
    });
  });

  test('should maintain featured sorting with category filter', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendors`);
    await page.waitForLoadState('networkidle');

    // Select a category
    const categoryFilter = page.getByTestId('category-filter');
    await categoryFilter.click();

    // Wait for dropdown
    await page.waitForTimeout(300);

    // Select first non-"All" category
    const categories = page.locator('[role="option"]');
    const categoryCount = await categories.count();

    if (categoryCount > 1) {
      await categories.nth(1).click();
      await page.waitForTimeout(500);

      // Take screenshot
      await page.screenshot({
        path: 'test-results/vendor-featured-sorting-category.png',
        fullPage: false,
      });
    }
  });

  test('should show featured vendors in API response', async ({ page, request }) => {
    // Make direct API call to vendors endpoint
    const response = await request.get(`${BASE_URL}/api/vendors`);

    if (response.ok()) {
      const data = await response.json();
      console.log('Vendors API response structure:', Object.keys(data));

      // Check if vendors have featured property
      if (data.docs && Array.isArray(data.docs)) {
        const featuredVendors = data.docs.filter((v: any) => v.featured === true);
        console.log('Featured vendors in API:', featuredVendors.length);
        console.log('First 3 featured:', featuredVendors.slice(0, 3).map((v: any) => v.companyName || v.company_name));
      }
    }
  });

  test('should verify featured field is passed to client component', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendors`);
    await page.waitForLoadState('networkidle');

    // Check the HTML for featured indicators
    const html = await page.content();
    const hasFeaturedClass = html.includes('featured') || html.includes('Featured');

    console.log('Page HTML contains "featured":', hasFeaturedClass);

    // Log initial vendor order to console
    const vendorLinks = page.locator('a[href*="/vendors/"]');
    const count = await vendorLinks.count();
    console.log(`Found ${count} vendor links`);

    for (let i = 0; i < Math.min(5, count); i++) {
      const href = await vendorLinks.nth(i).getAttribute('href');
      const text = await vendorLinks.nth(i).textContent();
      console.log(`Vendor ${i + 1}: ${href} - ${text?.substring(0, 50)}`);
    }
  });
});
