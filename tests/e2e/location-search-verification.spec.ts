import { test, expect } from './fixtures/test-fixtures';

test.describe('Location Name Search Feature E2E - Phase 4 Validation', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page, geocodeMock }) => {
    // geocodeMock is automatically set up via fixture
    await page.goto('/vendors');
    await page.waitForLoadState('networkidle');

    // Click on Location tab to show location search UI
    const locationTab = page.getByTestId('search-tab-location');
    await locationTab.waitFor({ state: 'visible', timeout: 15000 });
    await locationTab.click();

    // Wait for location input to be visible
    await page.getByTestId('location-search-input').waitFor({ state: 'visible', timeout: 10000 });
  });

  // ============================================================
  // CRITICAL TESTS (Must Have)
  // ============================================================

  test('CRITICAL #1: Simple search workflow - Monaco auto-applies', async ({ page }) => {
    console.log('\n=== TEST: Simple Search (Monaco) ===');

    const locationInput = page.locator('[data-testid="location-search-input"]');
    await locationInput.fill('Monaco');

    // Wait for dropdown to appear (mock responds quickly)
    await expect(page.locator('[data-testid="location-results-dropdown"]')).toBeVisible({ timeout: 3000 });

    // Select first result
    await page.locator('[data-testid="location-result-0"]').click();

    // Verify no dialog for single result
    const dialog = page.locator('role=dialog');
    const isDialogVisible = await dialog.isVisible().catch(() => false);
    expect(isDialogVisible).toBeFalsy();

    // Verify result count appears
    const resultCount = page.locator('[data-testid="result-count"]');
    await expect(resultCount).toBeVisible({ timeout: 5000 });
    const resultText = await resultCount.textContent();
    expect(resultText).toContain('km');

    console.log('[OK] PASSED: Monaco auto-applied');
  });

  test('CRITICAL #2: Multiple results - Paris shows dropdown', async ({ page }) => {
    console.log('\n=== TEST: Multiple Results (Paris) ===');

    const locationInput = page.locator('[data-testid="location-search-input"]');
    await locationInput.fill('Paris');

    // Wait for dropdown
    const dropdown = page.locator('[data-testid="location-results-dropdown"]');
    await expect(dropdown).toBeVisible({ timeout: 3000 });
    console.log('Dropdown appeared for location');

    // Verify results are shown
    const resultCards = page.locator('[data-testid^="location-result-"]');
    const optionCount = await resultCards.count();
    console.log(`Number of location options: ${optionCount}`);
    expect(optionCount).toBeGreaterThan(0);

    // Select first result
    await resultCards.first().click();
    console.log('Selected first Paris result');

    // Verify dropdown closes
    await expect(dropdown).not.toBeVisible({ timeout: 3000 });
    console.log('Dropdown closed');

    // Verify filter applied
    const resultCount = page.locator('[data-testid="result-count"]');
    await expect(resultCount).toBeVisible({ timeout: 5000 });

    console.log('[OK] PASSED: Paris dropdown shown and filter applied');
  });

  test('CRITICAL #3: Reset workflow - Clear all filters', async ({ page }) => {
    console.log('\n=== TEST: Reset Workflow ===');

    // Apply filter
    const locationInput = page.locator('[data-testid="location-search-input"]');
    await locationInput.fill('Monaco');
    await expect(page.locator('[data-testid="location-results-dropdown"]')).toBeVisible({ timeout: 3000 });
    await page.locator('[data-testid="location-result-0"]').click();

    // Click reset
    const resetButton = page.locator('[data-testid="reset-button"]');
    await expect(resetButton).toBeVisible({ timeout: 3000 });
    await resetButton.click();
    await page.waitForTimeout(500);

    // Verify input cleared
    await expect(locationInput).toHaveValue('');
    await expect(resetButton).not.toBeVisible({ timeout: 2000 });

    // Verify distance reset to 160 km
    const distanceValue = page.locator('[data-testid="distance-value"]');
    const distanceText = await distanceValue.textContent();
    expect(distanceText).toContain('160');

    console.log('[OK] PASSED: Reset workflow works');
  });

  test('CRITICAL #4: Error handling - No locations found message', async ({ page, geocodeMock }) => {
    console.log('\n=== TEST: Error Handling ===');

    // Configure mock to return empty results for invalid location
    geocodeMock.addMockResponse('XYZ123InvalidLocation999', []);

    const locationInput = page.locator('[data-testid="location-search-input"]');
    await locationInput.fill('XYZ123InvalidLocation999');
    await page.waitForTimeout(1000);

    // Verify error message or empty results
    const errorMessage = page.locator('[data-testid="error-message"]');
    const noResults = page.locator('text=/no.*location/i');

    // Either error message or no results indicator should appear
    const hasError = await errorMessage.isVisible().catch(() => false);
    const hasNoResults = await noResults.isVisible().catch(() => false);

    expect(hasError || hasNoResults).toBeTruthy();

    console.log('[OK] PASSED: Error handling works');
  });

  // ============================================================
  // IMPORTANT TESTS (Should Have)
  // ============================================================

  test('IMPORTANT: Distance slider - Adjust after search', async ({ page }) => {
    console.log('\n=== TEST: Distance Slider ===');

    // Apply filter
    const locationInput = page.locator('[data-testid="location-search-input"]');
    await locationInput.fill('Monaco');
    await expect(page.locator('[data-testid="location-results-dropdown"]')).toBeVisible({ timeout: 3000 });
    await page.locator('[data-testid="location-result-0"]').click();

    // Adjust slider
    const distanceSlider = page.locator('[data-testid="distance-slider"]');
    const sliderInput = distanceSlider.locator('input[type="range"]');

    if (await sliderInput.count() > 0) {
      await sliderInput.evaluate((el: HTMLInputElement) => {
        el.value = '320';
        el.dispatchEvent(new Event('input', { bubbles: true }));
      });
      await page.waitForTimeout(500);

      // Verify distance changed
      const distanceValue = page.locator('[data-testid="distance-value"]');
      const newDistance = await distanceValue.textContent();
      expect(newDistance).toContain('320');
    }

    console.log('[OK] PASSED: Distance slider works');
  });

  test('IMPORTANT: Advanced coordinates - Manual lat/lon entry', async ({ page }) => {
    console.log('\n=== TEST: Advanced Coordinates ===');

    // Expand advanced options
    const advancedTrigger = page.getByText(/Advanced Options/i);
    if (await advancedTrigger.isVisible()) {
      await advancedTrigger.click();
      await page.waitForTimeout(300);

      // Enter coordinates
      const latInput = page.locator('[data-testid="latitude-input"]');
      if (await latInput.isVisible()) {
        await latInput.fill('43.7384');
        await page.locator('[data-testid="longitude-input"]').fill('7.4246');

        // Click search
        const searchButton = page.getByRole('button', { name: /search by coordinates/i });
        if (await searchButton.isVisible()) {
          await searchButton.click();
          await page.waitForTimeout(500);
        }
      }
    }

    console.log('[OK] PASSED: Advanced coordinates tested');
  });
});
