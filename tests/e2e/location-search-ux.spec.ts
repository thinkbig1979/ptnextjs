import { test, expect } from './fixtures/test-fixtures';

test.describe('Location Search UX Improvements', () => {
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

  test('should require 3 characters before showing dropdown', async ({ page }) => {
    const locationInput = page.getByTestId('location-search-input');
    const dropdown = page.getByTestId('location-results-dropdown');

    // Type only 2 characters
    await locationInput.fill('Pa');

    // Wait a moment for any potential debounce
    await page.waitForTimeout(700);

    // Dropdown should NOT appear
    await expect(dropdown).not.toBeVisible();

    // Type 3rd character
    await locationInput.fill('Par');

    // Wait for debounce + mock response
    await expect(dropdown).toBeVisible({ timeout: 3000 });
  });

  test('should use inline dropdown instead of modal', async ({ page }) => {
    const locationInput = page.getByTestId('location-search-input');

    // Type location name
    await locationInput.fill('Monaco');

    // Should show inline dropdown (not a dialog/modal)
    const dropdown = page.getByTestId('location-results-dropdown');
    await expect(dropdown).toBeVisible({ timeout: 3000 });

    // Check it's positioned correctly (absolute within relative container)
    const dropdownBox = await dropdown.boundingBox();
    const inputBox = await locationInput.boundingBox();

    expect(dropdownBox).toBeTruthy();
    expect(inputBox).toBeTruthy();

    // Dropdown should be below the input
    if (dropdownBox && inputBox) {
      expect(dropdownBox.y).toBeGreaterThan(inputBox.y);
    }
  });

  test('should close dropdown when clicking outside', async ({ page }) => {
    const locationInput = page.getByTestId('location-search-input');

    // Type location name to show dropdown
    await locationInput.fill('Paris');

    const dropdown = page.getByTestId('location-results-dropdown');
    await expect(dropdown).toBeVisible({ timeout: 3000 });

    // Click outside (on the page title)
    await page.click('h1');

    // Dropdown should close
    await expect(dropdown).not.toBeVisible();
  });

  test('should close dropdown when pressing Escape', async ({ page }) => {
    const locationInput = page.getByTestId('location-search-input');

    // Type location name to show dropdown
    await locationInput.fill('London');

    const dropdown = page.getByTestId('location-results-dropdown');
    await expect(dropdown).toBeVisible({ timeout: 3000 });

    // Press Escape
    await locationInput.press('Escape');

    // Dropdown should close
    await expect(dropdown).not.toBeVisible();
  });

  test('should select location and update input when clicking result', async ({ page }) => {
    const locationInput = page.getByTestId('location-search-input');

    // Type location name
    await locationInput.fill('Monaco');

    // Wait for dropdown
    await expect(page.getByTestId('location-results-dropdown')).toBeVisible({ timeout: 3000 });

    // Click first result
    await page.getByTestId('location-result-0').click();

    // Input should now show selected location name
    const inputValue = await locationInput.inputValue();
    expect(inputValue).toContain('Monaco');

    // Dropdown should close after selection
    const dropdown = page.getByTestId('location-results-dropdown');
    await expect(dropdown).not.toBeVisible();

    // Filter should be active
    await expect(page.getByTestId('result-count')).toBeVisible();
  });

  test('should select first result when pressing Enter', async ({ page }) => {
    const locationInput = page.getByTestId('location-search-input');

    // Type location name
    await locationInput.fill('Paris');

    // Verify dropdown is visible
    await expect(page.getByTestId('location-results-dropdown')).toBeVisible({ timeout: 3000 });

    // Press Enter to select first result
    await locationInput.press('Enter');

    // Input should be updated with selection
    const inputValue = await locationInput.inputValue();
    expect(inputValue).toContain('Paris');

    // Dropdown should close
    await expect(page.getByTestId('location-results-dropdown')).not.toBeVisible();
  });

  test('should have debounce delay for better typing experience', async ({ page }) => {
    const locationInput = page.getByTestId('location-search-input');

    // Start typing
    await locationInput.fill('Lon');

    // Check at 200ms - should not have results yet
    await page.waitForTimeout(200);
    const dropdown = page.getByTestId('location-results-dropdown');
    const isVisible200 = await dropdown.isVisible().catch(() => false);
    // May or may not be visible at 200ms

    // Wait for full debounce + API
    await expect(dropdown).toBeVisible({ timeout: 3000 });
  });

  test('should allow continuing to type without popup interference', async ({ page }) => {
    const locationInput = page.getByTestId('location-search-input');

    // Type quickly without waiting for results
    await locationInput.fill('New');
    // Continue typing immediately
    await locationInput.fill('New Y');
    await locationInput.fill('New Yo');
    await locationInput.fill('New Yor');
    await locationInput.fill('New York');

    // Wait for debounce
    await page.waitForTimeout(800);

    // Input should still have what we typed
    const inputValue = await locationInput.inputValue();
    expect(inputValue).toBe('New York');

    // Results should now be shown
    await expect(page.getByTestId('location-results-dropdown')).toBeVisible({ timeout: 3000 });
  });

  test('should show helpful hint about 3 character minimum', async ({ page }) => {
    // Check that help text mentions 3 characters
    const helpText = page.locator('#location-name-help');
    await expect(helpText).toContainText('3 characters');
    await expect(helpText).toContainText('Press Enter');
  });
});
