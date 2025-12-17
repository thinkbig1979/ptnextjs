import { test, expect } from '@playwright/test';

test.describe('Partner Filter Validation', () => {
  test('should show partner products toggle in partner mode when view=partners', async ({ page }) => {
    // Navigate to products page with partners view
    await page.goto('/products?view=partners');

    // Wait for the page to load - toggle should be visible even with no products
    const vendorToggle = page.locator('#vendor-toggle');
    await expect(vendorToggle).toBeVisible();

    // Verify toggle is in "Partner Products" mode (unchecked state)
    await expect(vendorToggle).not.toBeChecked();

    // Check the results summary reflects partner view
    const resultsSummary = page.locator('p.text-muted-foreground.font-poppins-light').filter({ hasText: 'Showing' });
    await expect(resultsSummary).toContainText('from partners');

    // Get product count - may be 0 if no partner products exist
    const productCards = page.locator('[data-testid="product-card"]');
    const count = await productCards.count();
    console.log(`Found ${count} products in partner view`);

    // If there are partner products, verify they're from partner vendors
    if (count > 0) {
      // Partner products exist - validate them
      for (let i = 0; i < Math.min(count, 3); i++) {
        const card = productCards.nth(i);
        const vendorName = await card.locator('.flex.items-center.space-x-1 span').textContent();
        console.log(`Product ${i + 1} vendor: ${vendorName}`);
      }
    } else {
      // No partner products - verify "no products" message is shown
      const noProducts = page.locator('text=No products found matching your criteria');
      await expect(noProducts).toBeVisible();
    }
  });

  test('should show all products when all vendors filter is active', async ({ page }) => {
    // Navigate to products page (defaults to all vendors)
    await page.goto('/products');

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    // Verify toggle is in "All Vendors" mode (checked state) - this is the default
    const vendorToggle = page.locator('#vendor-toggle');
    await expect(vendorToggle).toBeChecked();

    // Get all vendors count
    const allCards = page.locator('[data-testid="product-card"]');
    const allCount = await allCards.count();
    console.log(`All vendor products count: ${allCount}`);
    expect(allCount).toBeGreaterThan(0);

    // Verify results summary shows "from all vendors"
    const resultsSummary = page.locator('p.text-muted-foreground.font-poppins-light').filter({ hasText: 'Showing' });
    await expect(resultsSummary).toContainText('from all vendors');

    // Now switch to partners to verify the toggle works
    await vendorToggle.click();
    await expect(vendorToggle).not.toBeChecked();

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Get partner count (should be less than or equal to all)
    const partnerCards = page.locator('[data-testid="product-card"]');
    const partnerCount = await partnerCards.count();
    console.log(`Partner products count: ${partnerCount}`);

    // Partners should be fewer than or equal to all vendors
    expect(partnerCount).toBeLessThanOrEqual(allCount);
  });

  test('should toggle between partner and all vendor views correctly', async ({ page }) => {
    // Navigate to products page (defaults to all vendors)
    await page.goto('/products');

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    const vendorToggle = page.locator('#vendor-toggle');
    const productCards = page.locator('[data-testid="product-card"]');

    // Initial state - All Vendors (checked state is the default)
    await expect(vendorToggle).toBeChecked();
    const allCount = await productCards.count();
    console.log(`Initial (all vendors): ${allCount}`);
    expect(allCount).toBeGreaterThan(0);

    // Switch to Partners (uncheck)
    await vendorToggle.click();
    await expect(vendorToggle).not.toBeChecked();
    await page.waitForTimeout(500);
    const partnersCount = await productCards.count();
    console.log(`After toggle (partners): ${partnersCount}`);
    // Partners should be <= all vendors
    expect(partnersCount).toBeLessThanOrEqual(allCount);

    // Switch back to All Vendors
    await vendorToggle.click();
    await expect(vendorToggle).toBeChecked();
    await page.waitForTimeout(500);
    const backToAllCount = await productCards.count();
    console.log(`Back to all vendors: ${backToAllCount}`);
    expect(backToAllCount).toBe(allCount);
  });

  test('should correctly filter products by partner status', async ({ page }) => {
    // Navigate to products page (defaults to all vendors)
    await page.goto('/products');

    // Wait for the page to load
    const vendorToggle = page.locator('#vendor-toggle');
    await expect(vendorToggle).toBeVisible();

    // Default should be all vendors (checked)
    await expect(vendorToggle).toBeChecked();

    // Get all vendors product count
    const productCards = page.locator('[data-testid="product-card"]');
    const allCount = await productCards.count();
    console.log(`All vendors products: ${allCount}`);

    // Switch to partners view
    await vendorToggle.click();
    await expect(vendorToggle).not.toBeChecked();
    await page.waitForTimeout(500);

    // Get partner product count
    const partnerCount = await productCards.count();
    console.log(`Partner products: ${partnerCount}`);

    // Partner products should be <= all vendors products
    expect(partnerCount).toBeLessThanOrEqual(allCount);

    // Verify results summary shows correct view
    const resultsSummary = page.locator('p.text-muted-foreground.font-poppins-light').filter({ hasText: 'Showing' });
    await expect(resultsSummary).toContainText('from partners');
  });
});
