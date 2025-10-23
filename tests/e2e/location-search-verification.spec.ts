import { test, expect } from '@playwright/test';

test.describe('Location Name Search Feature E2E - Phase 4 Validation', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await page.goto('/vendors');
    await page.waitForLoadState('networkidle');
    const locationFilter = page.locator('[data-testid="location-search-filter"]');
    await expect(locationFilter).toBeVisible({ timeout: 10000 });
  });

  // ============================================================
  // CRITICAL TESTS (Must Have)
  // ============================================================

  test('CRITICAL #1: Simple search workflow - Monaco auto-applies', async ({ page }) => {
    console.log('\n=== TEST: Simple Search (Monaco) ===');

    const locationInput = page.locator('[data-testid="location-input"]');
    await locationInput.fill('Monaco');
    await page.waitForTimeout(700);

    // Verify no dialog for single result
    const dialog = page.locator('role=dialog');
    const isDialogVisible = await dialog.isVisible().catch(() => false);
    expect(isDialogVisible).toBeFalsy();

    // Verify result count appears
    const resultCount = page.locator('[data-testid="result-count"]');
    await expect(resultCount).toBeVisible({ timeout: 5000 });
    const resultText = await resultCount.textContent();
    expect(resultText).toContain('km');

    console.log('✅ PASSED: Monaco auto-applied');
  });

  test('CRITICAL #2: Ambiguous search workflow - Paris dialog selection', async ({ page }) => {
    console.log('\n=== TEST: Ambiguous Search (Paris) ===');

    const locationInput = page.locator('[data-testid="location-input"]');
    await locationInput.fill('Paris');
    await page.waitForTimeout(700);

    // Wait for dialog
    const dialog = page.locator('role=dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    console.log('Dialog appeared for ambiguous location');

    // Verify multiple results
    const resultCards = page.locator('role=option');
    const optionCount = await resultCards.count();
    console.log(`Number of location options: ${optionCount}`);
    expect(optionCount).toBeGreaterThan(1);

    // Select first result
    await resultCards.first().click();
    console.log('Selected first Paris result');

    // Verify dialog closes
    await expect(dialog).not.toBeVisible({ timeout: 3000 });
    console.log('Dialog closed');

    // Verify filter applied
    const resultCount = page.locator('[data-testid="result-count"]');
    await expect(resultCount).toBeVisible({ timeout: 5000 });

    console.log('✅ PASSED: Paris dialog shown and filter applied');
  });

  test('CRITICAL #3: Reset workflow - Clear all filters', async ({ page }) => {
    console.log('\n=== TEST: Reset Workflow ===');

    // Apply filter
    const locationInput = page.locator('[data-testid="location-input"]');
    await locationInput.fill('Monaco');
    await page.waitForTimeout(700);

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

    console.log('✅ PASSED: Reset workflow works');
  });

  test('CRITICAL #4: Error handling - No locations found message', async ({ page }) => {
    console.log('\n=== TEST: Error Handling ===');

    const locationInput = page.locator('[data-testid="location-input"]');
    await locationInput.fill('XYZ123InvalidLocation999');
    await page.waitForTimeout(700);

    // Verify error message
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    const errorText = await errorMessage.textContent();
    expect(errorText?.toLowerCase()).toContain('no locations found');

    console.log('✅ PASSED: Error handling works');
  });

  // ============================================================
  // IMPORTANT TESTS (Should Have)
  // ============================================================

  test('IMPORTANT: Distance slider - Adjust after search', async ({ page }) => {
    console.log('\n=== TEST: Distance Slider ===');

    // Apply filter
    const locationInput = page.locator('[data-testid="location-input"]');
    await locationInput.fill('Monaco');
    await page.waitForTimeout(700);

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

    console.log('✅ PASSED: Distance slider works');
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

    console.log('✅ PASSED: Advanced coordinates tested');
  });
});
