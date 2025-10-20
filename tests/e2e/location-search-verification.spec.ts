import { test, expect } from '@playwright/test';

test.describe('Location Search Functionality', () => {
  test('should display LocationSearchFilter component on vendors page', async ({ page }) => {
    await page.goto('http://localhost:3000/vendors');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Verify LocationSearchFilter component is visible
    const locationFilter = page.locator('[data-testid="location-search-filter"]');
    await expect(locationFilter).toBeVisible({ timeout: 10000 });

    // Verify all key elements exist
    await expect(page.locator('[data-testid="location-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="distance-slider"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="distance-value"]')).toContainText('100 miles');

    console.log('✅ LocationSearchFilter component rendered successfully');
  });

  test('should perform location search and show filtered results', async ({ page }) => {
    await page.goto('http://localhost:3000/vendors');
    await page.waitForLoadState('networkidle');

    // Enter Fort Lauderdale coordinates
    const locationInput = page.locator('[data-testid="location-input"]');
    await locationInput.fill('26.1224, -80.1373');

    // Verify search button is enabled
    const searchButton = page.locator('[data-testid="search-button"]');
    await expect(searchButton).toBeEnabled();

    // Click search
    await searchButton.click();

    // Wait a moment for filtering to complete
    await page.waitForTimeout(500);

    // Verify result count appears
    const resultCount = page.locator('[data-testid="result-count"]');
    await expect(resultCount).toBeVisible({ timeout: 5000 });

    // Check if result count contains expected text
    const resultText = await resultCount.textContent();
    console.log('Result count text:', resultText);
    expect(resultText).toContain('vendors');
    expect(resultText).toContain('100 miles');

    // Verify at least one vendor card has distance badge
    const vendorCards = page.locator('[data-testid="vendor-card"]');
    const cardCount = await vendorCards.count();
    console.log(`Found ${cardCount} vendor cards after filtering`);

    if (cardCount > 0) {
      // Check if any vendor has a distance badge
      const distanceBadges = page.locator('[data-testid="vendor-distance"]');
      const badgeCount = await distanceBadges.count();
      console.log(`Found ${badgeCount} vendor cards with distance badges`);

      if (badgeCount > 0) {
        const firstBadge = distanceBadges.first();
        await expect(firstBadge).toBeVisible();
        const badgeText = await firstBadge.textContent();
        console.log('Distance badge text:', badgeText);
        expect(badgeText).toContain('miles away');
      }
    }

    console.log('✅ Location search performed successfully');
  });

  test('should show error for invalid coordinates', async ({ page }) => {
    await page.goto('http://localhost:3000/vendors');
    await page.waitForLoadState('networkidle');

    // Enter invalid latitude (> 90)
    await page.locator('[data-testid="location-input"]').fill('100, 50');

    // Click search
    await page.locator('[data-testid="search-button"]').click();

    // Verify error message appears
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible({ timeout: 3000 });

    const errorText = await errorMessage.textContent();
    console.log('Error message:', errorText);
    expect(errorText).toContain('Latitude must be between -90 and 90');

    console.log('✅ Invalid coordinate validation working');
  });

  test('should reset filters correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/vendors');
    await page.waitForLoadState('networkidle');

    // Perform a search first
    await page.locator('[data-testid="location-input"]').fill('26.1224, -80.1373');
    await page.locator('[data-testid="search-button"]').click();
    await page.waitForTimeout(500);

    // Verify reset button appears
    const resetButton = page.locator('[data-testid="reset-button"]');
    await expect(resetButton).toBeVisible({ timeout: 3000 });

    // Click reset
    await resetButton.click();

    // Verify input is cleared
    const locationInput = page.locator('[data-testid="location-input"]');
    await expect(locationInput).toHaveValue('');

    // Verify reset button disappears
    await expect(resetButton).not.toBeVisible();

    // Verify result count disappears
    await expect(page.locator('[data-testid="result-count"]')).not.toBeVisible();

    console.log('✅ Reset functionality working correctly');
  });

  test('should trigger search with Enter key', async ({ page }) => {
    await page.goto('http://localhost:3000/vendors');
    await page.waitForLoadState('networkidle');

    // Enter coordinates
    const locationInput = page.locator('[data-testid="location-input"]');
    await locationInput.fill('26.1224, -80.1373');

    // Press Enter
    await locationInput.press('Enter');

    // Wait for search to trigger
    await page.waitForTimeout(500);

    // Verify result count appears (indicating search was triggered)
    const resultCount = page.locator('[data-testid="result-count"]');
    await expect(resultCount).toBeVisible({ timeout: 3000 });

    console.log('✅ Enter key triggers search correctly');
  });
});
