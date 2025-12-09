import { test, expect } from '@playwright/test';

test.describe('Bug Fixes Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto(`${BASE_URL}');
  });

  test('should not have company info error in console', async ({ page }) => {
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];

    // Listen for console messages
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(text);
      }
    });

    // Navigate to a page that would load company info
    await page.goto(`${BASE_URL}/about');
    await page.waitForLoadState('networkidle');

    // Check that there are no "Company info not found" errors
    const hasCompanyInfoError = consoleErrors.some(err =>
      err.includes('Company info not found')
    );
    const hasCompanyInfoWarning = consoleWarnings.some(warn =>
      warn.includes('Company info not found')
    );

    expect(hasCompanyInfoError, 'Should not have company info error').toBe(false);
    expect(hasCompanyInfoWarning, 'Should not have company info warning').toBe(false);
  });

  test('should not show partners link in navigation', async ({ page }) => {
    // Wait for navigation to load
    await page.waitForSelector('nav', { state: 'visible' });

    // Check that /partners link is not in the navigation
    const partnersLink = page.locator('a[href="/partners"]');
    await expect(partnersLink).toHaveCount(0);

    // Verify that vendors link is present (as replacement)
    const vendorsLink = page.locator('a[href="/vendors"]').first();
    await expect(vendorsLink).toBeVisible();
  });

  test('should not navigate to 404 when clicking partners in dropdown', async ({ page }) => {
    // Open the Discovery Platform dropdown
    const discoveryButton = page.locator('text=Discovery Platform').first();
    await discoveryButton.click();

    // Wait for dropdown to open
    await page.waitForTimeout(500);

    // Check that Partners is not in the dropdown
    const dropdownPartnersLink = page.locator('[role="menuitem"] a[href="/partners"]');
    await expect(dropdownPartnersLink).toHaveCount(0);
  });

  test('vendor profile product cards should have clickable images, names, and Learn More buttons', async ({ page }) => {
    // Navigate to a vendor profile page
    await page.goto(`${BASE_URL}/vendors');
    await page.waitForLoadState('networkidle');

    // Click on the first vendor card
    const firstVendorCard = page.locator('[data-testid="vendor-card"]').first();
    await expect(firstVendorCard).toBeVisible();
    await firstVendorCard.locator('a').first().click();

    // Wait for vendor profile page to load
    await page.waitForLoadState('networkidle');

    // Check if there are products on this vendor page
    const productsSection = page.locator('[data-testid="vendor-products"]');
    const hasProducts = await productsSection.isVisible().catch(() => false);

    if (hasProducts) {
      // Get the first product card
      const productCards = page.locator('[data-testid="vendor-products"] .grid > *');
      const productCardCount = await productCards.count();

      if (productCardCount > 0) {
        const firstProductCard = productCards.first();

        // Check that the image is clickable (wrapped in Link)
        const productImage = firstProductCard.locator('a img').first();
        await expect(productImage).toBeVisible();

        // Check that the product title is clickable
        const productTitle = firstProductCard.locator('h3 a, a h3').first();
        await expect(productTitle).toBeVisible();

        // Check that there's a "Learn More" button
        const learnMoreButton = firstProductCard.locator('text=Learn More').first();
        await expect(learnMoreButton).toBeVisible();

        // Get the href from Learn More button
        const learnMoreLink = firstProductCard.locator('a:has-text("Learn More")').first();
        const learnMoreHref = await learnMoreLink.getAttribute('href');

        // Click the Learn More button and verify navigation
        await learnMoreButton.click();
        await page.waitForLoadState('networkidle');

        // Verify we're on a product detail page
        expect(page.url()).toContain('/products/');

        // Verify the URL matches the expected pattern
        if (learnMoreHref) {
          expect(page.url()).toContain(learnMoreHref);
        }
      }
    }
  });

  test('product image click should navigate to product detail page', async ({ page }) => {
    // Navigate to vendors page
    await page.goto(`${BASE_URL}/vendors');
    await page.waitForLoadState('networkidle');

    // Click on the first vendor
    const firstVendorLink = page.locator('[data-testid="vendor-card"] a').first();
    await firstVendorLink.click();
    await page.waitForLoadState('networkidle');

    // Check if there are products
    const productsSection = page.locator('[data-testid="vendor-products"]');
    const hasProducts = await productsSection.isVisible().catch(() => false);

    if (hasProducts) {
      const productCards = page.locator('[data-testid="vendor-products"] .grid > *');
      const productCardCount = await productCards.count();

      if (productCardCount > 0) {
        const firstProductCard = productCards.first();

        // Click on the product image
        const productImageLink = firstProductCard.locator('a').first();
        const imageHref = await productImageLink.getAttribute('href');

        await productImageLink.click();
        await page.waitForLoadState('networkidle');

        // Verify navigation to product detail page
        expect(page.url()).toContain('/products/');

        if (imageHref) {
          expect(page.url()).toContain(imageHref);
        }
      }
    }
  });

  test('product name click should navigate to product detail page', async ({ page }) => {
    // Navigate to vendors page
    await page.goto(`${BASE_URL}/vendors');
    await page.waitForLoadState('networkidle');

    // Click on the first vendor
    const firstVendorLink = page.locator('[data-testid="vendor-card"] a').first();
    await firstVendorLink.click();
    await page.waitForLoadState('networkidle');

    // Check if there are products
    const productsSection = page.locator('[data-testid="vendor-products"]');
    const hasProducts = await productsSection.isVisible().catch(() => false);

    if (hasProducts) {
      const productCards = page.locator('[data-testid="vendor-products"] .grid > *');
      const productCardCount = await productCards.count();

      if (productCardCount > 0) {
        const firstProductCard = productCards.first();

        // Find and click the product name link
        const productNameLink = firstProductCard.locator('h3 a, a h3').first();
        await expect(productNameLink).toBeVisible();

        const nameHref = await productNameLink.locator('..').getAttribute('href');
        await productNameLink.click();
        await page.waitForLoadState('networkidle');

        // Verify navigation to product detail page
        expect(page.url()).toContain('/products/');

        if (nameHref) {
          expect(page.url()).toContain(nameHref);
        }
      }
    }
  });
});
