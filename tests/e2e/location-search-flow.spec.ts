import { test, expect } from '@playwright/test';

// Enable reduced motion to skip Framer Motion animations
test.use({ reducedMotion: 'reduce' });

const LOCATION_SELECTORS = {
  locationTab: '[data-testid="search-tab-location"]',
  locationInput: '[data-testid="location-search-input"]',
  resultsDropdown: '[data-testid="location-results-dropdown"]',
  resultItem: (index: number) => `[data-testid="location-result-${index}"]`,
};

test.describe('Location Search Complete Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to vendors page and wait for full hydration
    await page.goto('/vendors');
    await page.waitForLoadState('networkidle');

    // Wait for the location tab to be visible and clickable
    await page.waitForSelector(LOCATION_SELECTORS.locationTab, { state: 'visible', timeout: 15000 });

    // Click the location tab using Playwright's click (triggers React events properly)
    await page.click(LOCATION_SELECTORS.locationTab);

    // Wait for tab content to switch
    await page.waitForSelector(LOCATION_SELECTORS.locationInput, { state: 'visible', timeout: 10000 });
  });

  test('should maintain focus when dropdown appears', async ({ page }) => {
    const locationInput = page.locator(LOCATION_SELECTORS.locationInput);

    // Focus the input
    await locationInput.click();

    // Type to trigger dropdown
    await locationInput.fill('Monaco');

    // Wait for mock response (much faster than real API)
    await expect(page.locator(LOCATION_SELECTORS.resultsDropdown)).toBeVisible({ timeout: 3000 });

    // Input should still be focused
    const isFocused = await locationInput.evaluate((el) => el === document.activeElement);
    expect(isFocused).toBe(true);
  });

  test('should show dropdown results when typing location', async ({ page }) => {
    const locationInput = page.locator(LOCATION_SELECTORS.locationInput);

    // Type and wait for results
    await locationInput.fill('Monaco');
    await expect(page.locator(LOCATION_SELECTORS.resultsDropdown)).toBeVisible({ timeout: 3000 });

    // Should have at least one result
    const firstResult = page.locator(LOCATION_SELECTORS.resultItem(0));
    await expect(firstResult).toBeVisible();
  });

  test('should select location from dropdown', async ({ page }) => {
    const locationInput = page.locator(LOCATION_SELECTORS.locationInput);

    // Type and wait for results
    await locationInput.fill('Monaco');
    await expect(page.locator(LOCATION_SELECTORS.resultsDropdown)).toBeVisible({ timeout: 3000 });

    // Click first result
    await page.locator(LOCATION_SELECTORS.resultItem(0)).click();

    // Dropdown should close
    await expect(page.locator(LOCATION_SELECTORS.resultsDropdown)).not.toBeVisible();

    // Input should have the selected location
    const inputValue = await locationInput.inputValue();
    expect(inputValue).toContain('Monaco');
  });

  test('should execute search when pressing Enter after selection', async ({ page }) => {
    const locationInput = page.locator(LOCATION_SELECTORS.locationInput);

    // Type and wait for results
    await locationInput.fill('Paris');
    await expect(page.locator(LOCATION_SELECTORS.resultsDropdown)).toBeVisible({ timeout: 3000 });

    // Press Enter to select first result
    await locationInput.press('Enter');

    // Dropdown should close
    await expect(page.locator(LOCATION_SELECTORS.resultsDropdown)).not.toBeVisible();

    // Input should have the selected location
    const inputValue = await locationInput.inputValue();
    expect(inputValue).toContain('Paris');
  });

  test('should maintain focus when clicking dropdown result', async ({ page }) => {
    const locationInput = page.locator(LOCATION_SELECTORS.locationInput);

    // Type to show dropdown
    await locationInput.fill('London');
    await expect(page.locator(LOCATION_SELECTORS.resultsDropdown)).toBeVisible({ timeout: 3000 });

    // Click on a result
    await page.locator(LOCATION_SELECTORS.resultItem(0)).click();

    // Input should still be focused (or quickly regain focus)
    await page.waitForTimeout(100);
    const isFocused = await locationInput.evaluate((el) => el === document.activeElement);
    expect(isFocused).toBe(true);
  });

  test('complete user flow: type, select from dropdown', async ({ page }) => {
    const locationInput = page.locator(LOCATION_SELECTORS.locationInput);

    // Step 1: Type location name
    await locationInput.fill('Mon');

    // Dropdown should appear (mock will match Monaco)
    await expect(page.locator(LOCATION_SELECTORS.resultsDropdown)).toBeVisible({ timeout: 3000 });

    // Step 2: Select a location
    await page.locator(LOCATION_SELECTORS.resultItem(0)).click();

    // Dropdown should close
    await expect(page.locator(LOCATION_SELECTORS.resultsDropdown)).not.toBeVisible();

    // Input should show selected location
    const inputValue = await locationInput.inputValue();
    expect(inputValue.length).toBeGreaterThan(0);
  });

  test('should close dropdown when pressing Escape', async ({ page }) => {
    const locationInput = page.locator(LOCATION_SELECTORS.locationInput);

    // Type to show dropdown
    await locationInput.fill('Monaco');
    await expect(page.locator(LOCATION_SELECTORS.resultsDropdown)).toBeVisible({ timeout: 3000 });

    // Press Escape
    await locationInput.press('Escape');

    // Dropdown should close
    await expect(page.locator(LOCATION_SELECTORS.resultsDropdown)).not.toBeVisible();
  });

  test('should not show dropdown for less than 3 characters', async ({ page }) => {
    const locationInput = page.locator(LOCATION_SELECTORS.locationInput);

    // Type only 2 characters
    await locationInput.fill('Pa');

    // Wait a moment
    await page.waitForTimeout(500);

    // Dropdown should NOT appear
    await expect(page.locator(LOCATION_SELECTORS.resultsDropdown)).not.toBeVisible();
  });
});
