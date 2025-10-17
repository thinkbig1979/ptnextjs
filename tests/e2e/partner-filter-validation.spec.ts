import { test, expect } from '@playwright/test';

test.describe('Partner Filter Validation', () => {
  test('should show only partner products when partner filter is active', async ({ page }) => {
    // Navigate to products page
    await page.goto('/products');

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    // Check initial state - should default to "Partner Products" view
    const vendorToggle = page.locator('#vendor-toggle');
    await expect(vendorToggle).toBeVisible();

    // Verify toggle is in "Partner Products" mode (unchecked state)
    await expect(vendorToggle).not.toBeChecked();

    // Get all product cards and their vendor names
    const productCards = page.locator('[data-testid="product-card"]');
    const count = await productCards.count();

    console.log(`Found ${count} products in partner view`);
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(10); // We should have exactly 10 partner products based on DB query

    // Verify each product is from a partner vendor
    for (let i = 0; i < count; i++) {
      const card = productCards.nth(i);
      const vendorName = await card.locator('.flex.items-center.space-x-1 span').textContent();
      console.log(`Product ${i + 1} vendor: ${vendorName}`);

      // These are the partner vendors we identified in the database
      const partnerVendors = [
        'Alfa Laval',
        'Furuno Electric Co.',
        'Lumishore',
        'OceanLED',
        'Yanmar Marine'
      ];

      expect(partnerVendors.some(partner => vendorName?.includes(partner))).toBeTruthy();
    }
  });

  test('should show all products when all vendors filter is active', async ({ page }) => {
    // Navigate to products page
    await page.goto('/products');

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    // Get initial count (partner products)
    const initialCards = page.locator('[data-testid="product-card"]');
    const partnerCount = await initialCards.count();
    console.log(`Partner products count: ${partnerCount}`);

    // Click the toggle to switch to "All Vendors"
    const vendorToggle = page.locator('#vendor-toggle');
    await vendorToggle.click();

    // Verify toggle is now in "All Vendors" mode (checked state)
    await expect(vendorToggle).toBeChecked();

    // Wait a moment for filter to apply
    await page.waitForTimeout(500);

    // Get count after switching to all vendors
    const allCards = page.locator('[data-testid="product-card"]');
    const allCount = await allCards.count();
    console.log(`All vendor products count: ${allCount}`);

    // We should have more products when showing all vendors
    expect(allCount).toBeGreaterThan(partnerCount);

    // Verify results summary reflects the change
    const resultsSummary = page.locator('p.text-muted-foreground.font-poppins-light').filter({ hasText: 'Showing' });
    await expect(resultsSummary).toContainText('from all vendors');
  });

  test('should toggle between partner and all vendor views correctly', async ({ page }) => {
    // Navigate to products page
    await page.goto('/products');

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    const vendorToggle = page.locator('#vendor-toggle');
    const productCards = page.locator('[data-testid="product-card"]');

    // Initial state - Partner Products
    const initialCount = await productCards.count();
    console.log(`Initial (partners): ${initialCount}`);

    // Switch to All Vendors
    await vendorToggle.click();
    await page.waitForTimeout(500);
    const allCount = await productCards.count();
    console.log(`After toggle (all): ${allCount}`);
    expect(allCount).toBeGreaterThan(initialCount);

    // Switch back to Partner Products
    await vendorToggle.click();
    await page.waitForTimeout(500);
    const backToPartnersCount = await productCards.count();
    console.log(`Back to partners: ${backToPartnersCount}`);
    expect(backToPartnersCount).toBe(initialCount);
  });

  test('should correctly filter to only show 10 partner products', async ({ page }) => {
    // Navigate to products page
    await page.goto('/products');

    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    // Verify default is partner view
    const vendorToggle = page.locator('#vendor-toggle');
    await expect(vendorToggle).not.toBeChecked();

    // Count products
    const productCards = page.locator('[data-testid="product-card"]');
    const partnerCount = await productCards.count();

    console.log(`Partner products displayed: ${partnerCount}`);
    expect(partnerCount).toBe(10); // Exactly 10 partner products from our database

    // Verify results summary
    const resultsSummary = page.locator('p.text-muted-foreground.font-poppins-light').filter({ hasText: 'Showing' });
    await expect(resultsSummary).toContainText('from partners');
  });
});
