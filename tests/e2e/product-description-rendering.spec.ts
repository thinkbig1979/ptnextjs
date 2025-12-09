import { test, expect } from '@playwright/test';

test.describe('Product Description Rendering', () => {
  test('should not show HTML tags in product card descriptions', async ({ page }) => {
    await page.goto(`${BASE_URL}/products');
    await page.waitForLoadState('networkidle');

    // Get all product cards
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards.first()).toBeVisible();

    // Get the first product card's description
    const firstCard = productCards.first();
    const cardText = await firstCard.textContent();

    // Check that there are no HTML tags visible in the text
    expect(cardText).not.toContain('<p>');
    expect(cardText).not.toContain('</p>');
    expect(cardText).not.toContain('<div>');
    expect(cardText).not.toContain('</div>');

    console.log('First product card text (first 200 chars):', cardText?.substring(0, 200));
  });

  test('should not show HTML tags in product detail page description', async ({ page }) => {
    // Navigate to the specific product mentioned in the issue
    await page.goto(`${BASE_URL}/products/maritime-technology-partners-intelligent-lighting-control-system');
    await page.waitForLoadState('networkidle');

    // Get the product description
    const description = page.getByTestId('product-description');
    await expect(description).toBeVisible();

    const descriptionText = await description.textContent();

    // Check that there are no HTML tags visible
    expect(descriptionText).not.toContain('<p>');
    expect(descriptionText).not.toContain('</p>');

    // Check that the actual content is there (without tags)
    expect(descriptionText).toContain('Illuminate your yacht');
    expect(descriptionText).toContain('intelligent lighting');

    console.log('Product description:', descriptionText);
  });

  test('should render clean text in product list', async ({ page }) => {
    await page.goto(`${BASE_URL}/products');
    await page.waitForLoadState('networkidle');

    // Search for a specific product to make the test more reliable
    const searchInput = page.locator('input[placeholder*="Search products"]');
    await searchInput.fill('lighting');
    await page.waitForTimeout(500);

    const productCards = page.locator('[data-testid="product-card"]');

    if (await productCards.count() > 0) {
      const firstCard = productCards.first();
      const cardHTML = await firstCard.innerHTML();

      // The HTML should not contain visible HTML entity codes or raw tags
      expect(cardHTML).not.toContain('&lt;p&gt;');
      expect(cardHTML).not.toContain('&lt;/p&gt;');

      console.log('Product card renders clean text without HTML tags');
    }
  });

  test('should handle different product descriptions correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/products');
    await page.waitForLoadState('networkidle');

    const productCards = page.locator('[data-testid="product-card"]');
    const count = await productCards.count();

    console.log(`Found ${count} products`);

    // Check first 3 products
    for (let i = 0; i < Math.min(3, count); i++) {
      const card = productCards.nth(i);
      const text = await card.textContent();

      // No HTML tags should be visible
      expect(text).not.toContain('<');
      expect(text).not.toContain('>');

      console.log(`Product ${i + 1} description is clean`);
    }
  });

  test('should display readable descriptions without JSON objects', async ({ page }) => {
    await page.goto(`${BASE_URL}/products');
    await page.waitForLoadState('networkidle');

    const productCards = page.locator('[data-testid="product-card"]');
    const firstCard = productCards.first();
    const text = await firstCard.textContent();

    // Should not contain JSON structure
    expect(text).not.toContain('"root"');
    expect(text).not.toContain('"children"');
    expect(text).not.toContain('"type":"paragraph"');

    console.log('Product descriptions are human-readable');
  });
});
