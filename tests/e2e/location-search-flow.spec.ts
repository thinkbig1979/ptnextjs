import { test, expect } from '@playwright/test';

test.describe('Location Search Complete Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vendors');
    await page.waitForLoadState('networkidle');
  });

  test('should maintain focus when dropdown appears', async ({ page }) => {
    const locationInput = page.getByTestId('location-input');

    // Focus the input
    await locationInput.click();

    // Type to trigger dropdown
    await locationInput.fill('Monaco');
    await page.waitForTimeout(1000);

    // Check dropdown is visible
    const dropdown = page.getByTestId('location-results-dropdown');
    await expect(dropdown).toBeVisible();

    // Input should still be focused
    const isFocused = await locationInput.evaluate((el) => el === document.activeElement);
    expect(isFocused).toBe(true);
  });

  test('should require explicit search action - not auto-search on selection', async ({ page }) => {
    const locationInput = page.getByTestId('location-input');

    // Type and select location
    await locationInput.fill('Monaco');
    await page.waitForTimeout(1000);

    // Click first result
    await page.getByTestId('location-result-0').click();

    // Wait a moment
    await page.waitForTimeout(500);

    // Result count should NOT appear yet (search not executed)
    const resultCount = page.getByTestId('result-count');
    await expect(resultCount).not.toBeVisible();

    // Search button should be enabled
    const searchButton = page.getByTestId('search-location-button');
    await expect(searchButton).toBeEnabled();
  });

  test('should execute search when clicking Search button', async ({ page }) => {
    const locationInput = page.getByTestId('location-input');
    const searchButton = page.getByTestId('search-location-button');

    // Search button should be disabled initially
    await expect(searchButton).toBeDisabled();

    // Type and select location
    await locationInput.fill('Monaco');
    await page.waitForTimeout(1000);
    await page.getByTestId('location-result-0').click();

    // Search button should now be enabled
    await expect(searchButton).toBeEnabled();

    // Click search button
    await searchButton.click();

    // Result count should now appear (search executed)
    await expect(page.getByTestId('result-count')).toBeVisible({ timeout: 5000 });
  });

  test('should execute search when pressing Enter after selection', async ({ page }) => {
    const locationInput = page.getByTestId('location-input');

    // Type and wait for results
    await locationInput.fill('Paris');
    await page.waitForTimeout(1000);

    // Press Enter to select first result (but not search yet)
    await locationInput.press('Enter');

    // Wait a moment
    await page.waitForTimeout(300);

    // Dropdown should be closed
    await expect(page.getByTestId('location-results-dropdown')).not.toBeVisible();

    // Input should have the selected location
    const inputValue = await locationInput.inputValue();
    expect(inputValue).toContain('Paris');

    // Press Enter again to trigger search
    await locationInput.press('Enter');

    // Result count should now appear
    await expect(page.getByTestId('result-count')).toBeVisible({ timeout: 5000 });
  });

  test('should maintain focus when clicking dropdown result', async ({ page }) => {
    const locationInput = page.getByTestId('location-input');

    // Type to show dropdown
    await locationInput.fill('London');
    await page.waitForTimeout(1000);

    // Click on a result
    await page.getByTestId('location-result-0').click();

    // Input should still be focused (or quickly regain focus)
    await page.waitForTimeout(100);

    // We should be able to immediately press Enter without clicking
    await locationInput.press('Enter');

    // Search should execute
    await expect(page.getByTestId('result-count')).toBeVisible({ timeout: 5000 });
  });

  test('complete user flow: type, select, search', async ({ page }) => {
    const locationInput = page.getByTestId('location-input');
    const searchButton = page.getByTestId('search-location-button');

    // Step 1: Type location name
    await locationInput.fill('Mon');
    await page.waitForTimeout(1000);

    // Dropdown should appear
    await expect(page.getByTestId('location-results-dropdown')).toBeVisible();

    // Step 2: Select a location
    await page.getByTestId('location-result-0').click();

    // Dropdown should close
    await expect(page.getByTestId('location-results-dropdown')).not.toBeVisible();

    // Input should show selected location
    const inputValue = await locationInput.inputValue();
    expect(inputValue.length).toBeGreaterThan(0);

    // Search button should be enabled
    await expect(searchButton).toBeEnabled();

    // Step 3: Click search
    await searchButton.click();

    // Results should appear
    await expect(page.getByTestId('result-count')).toBeVisible({ timeout: 5000 });

    // Should show vendors found
    const resultText = await page.getByTestId('result-count').textContent();
    expect(resultText).toContain('vendors');
    expect(resultText).toContain('km');
  });

  test('should show helpful instructions to user', async ({ page }) => {
    const helpText = page.locator('#location-name-help');

    // Should mention multiple actions
    await expect(helpText).toContainText('3 characters');
    await expect(helpText).toContainText('select a location');
    await expect(helpText).toContainText('Search');
    await expect(helpText).toContainText('Enter');
  });

  test('should disable search button when no location selected', async ({ page }) => {
    const searchButton = page.getByTestId('search-location-button');

    // Initially disabled
    await expect(searchButton).toBeDisabled();

    // Still disabled after just typing
    await page.getByTestId('location-input').fill('Test');
    await expect(searchButton).toBeDisabled();
  });
});
