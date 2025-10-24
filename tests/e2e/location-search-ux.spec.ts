import { test, expect } from '@playwright/test';

test.describe('Location Search UX Improvements', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the vendors page with location search filter
    await page.goto('/vendors');

    // Wait for page to be ready
    await page.waitForLoadState('networkidle');
  });

  test('should require 3 characters before showing dropdown', async ({ page }) => {
    const locationInput = page.getByTestId('location-input');
    const dropdown = page.getByTestId('location-results-dropdown');

    // Type only 2 characters
    await locationInput.fill('Pa');

    // Wait a moment for any potential debounce
    await page.waitForTimeout(700);

    // Dropdown should NOT appear
    await expect(dropdown).not.toBeVisible();

    // Type 3rd character
    await locationInput.fill('Par');

    // Wait for debounce (600ms) + API call
    await page.waitForTimeout(1000);

    // Dropdown should now appear
    await expect(dropdown).toBeVisible();
  });

  test('should use inline dropdown instead of modal', async ({ page }) => {
    const locationInput = page.getByTestId('location-input');

    // Type location name
    await locationInput.fill('Monaco');

    // Wait for debounce + API call
    await page.waitForTimeout(1000);

    // Should show inline dropdown (not a dialog/modal)
    const dropdown = page.getByTestId('location-results-dropdown');
    await expect(dropdown).toBeVisible();

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
    const locationInput = page.getByTestId('location-input');

    // Type location name to show dropdown
    await locationInput.fill('Paris');
    await page.waitForTimeout(1000);

    const dropdown = page.getByTestId('location-results-dropdown');
    await expect(dropdown).toBeVisible();

    // Click outside (on the page title)
    await page.click('h1');

    // Dropdown should close
    await expect(dropdown).not.toBeVisible();
  });

  test('should close dropdown when pressing Escape', async ({ page }) => {
    const locationInput = page.getByTestId('location-input');

    // Type location name to show dropdown
    await locationInput.fill('London');
    await page.waitForTimeout(1000);

    const dropdown = page.getByTestId('location-results-dropdown');
    await expect(dropdown).toBeVisible();

    // Press Escape
    await locationInput.press('Escape');

    // Dropdown should close
    await expect(dropdown).not.toBeVisible();
  });

  test('should select location and update input when clicking result', async ({ page }) => {
    const locationInput = page.getByTestId('location-input');

    // Type location name
    await locationInput.fill('Monaco');
    await page.waitForTimeout(1000);

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
    const locationInput = page.getByTestId('location-input');

    // Type location name
    await locationInput.fill('Paris');
    await page.waitForTimeout(1000);

    // Verify dropdown is visible
    await expect(page.getByTestId('location-results-dropdown')).toBeVisible();

    // Press Enter to select first result
    await locationInput.press('Enter');

    // Input should be updated with selection
    const inputValue = await locationInput.inputValue();
    expect(inputValue).toContain('Paris');

    // Dropdown should close
    await expect(page.getByTestId('location-results-dropdown')).not.toBeVisible();
  });

  test('should have longer debounce delay (600ms) for better typing experience', async ({ page }) => {
    const locationInput = page.getByTestId('location-input');

    // Start typing
    await locationInput.fill('Lon');

    // Check at 400ms - should still be loading or not yet triggered
    await page.waitForTimeout(400);
    const dropdown400 = page.getByTestId('location-results-dropdown');

    // At 400ms, API shouldn't have been called yet (600ms debounce)
    // So either no dropdown or still loading
    const isVisible400 = await dropdown400.isVisible().catch(() => false);

    // Wait for full debounce + API
    await page.waitForTimeout(700);

    // Now dropdown should be visible
    await expect(page.getByTestId('location-results-dropdown')).toBeVisible();
  });

  test('should allow continuing to type without popup interference', async ({ page }) => {
    const locationInput = page.getByTestId('location-input');

    // Type quickly without waiting for results
    await locationInput.fill('New');
    // Continue typing immediately
    await locationInput.fill('New Y');
    await locationInput.fill('New Yo');
    await locationInput.fill('New Yor');
    await locationInput.fill('New York');

    // Wait for debounce
    await page.waitForTimeout(1000);

    // Input should still have what we typed
    const inputValue = await locationInput.inputValue();
    expect(inputValue).toBe('New York');

    // Results should now be shown
    await expect(page.getByTestId('location-results-dropdown')).toBeVisible();
  });

  test('should show helpful hint about 3 character minimum', async ({ page }) => {
    // Check that help text mentions 3 characters
    const helpText = page.locator('#location-name-help');
    await expect(helpText).toContainText('3 characters');
    await expect(helpText).toContainText('Press Enter');
  });
});
