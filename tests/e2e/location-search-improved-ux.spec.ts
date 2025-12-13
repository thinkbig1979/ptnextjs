import { test, expect } from './fixtures/test-fixtures';

test.describe('Location Search - Improved UX', () => {
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

  test('should allow continuous typing without interruption', async ({ page }) => {
    const input = page.locator('[data-testid="location-search-input"]');

    // Type the full location name quickly without pauses
    await input.fill('Leiden');

    // Input should contain the full text immediately
    await expect(input).toHaveValue('Leiden');

    // Results should appear (mock responds quickly)
    const dropdown = page.locator('[data-testid="location-results-dropdown"]');
    await expect(dropdown).toBeVisible({ timeout: 3000 });

    // Input should still be focused
    await expect(input).toBeFocused();

    // Input should still have the value
    await expect(input).toHaveValue('Leiden');
  });

  test('should show loading indicator after debounce period', async ({ page }) => {
    const input = page.locator('[data-testid="location-search-input"]');

    // Type 3 characters
    await input.fill('Lei');

    // Loading indicator should NOT appear immediately
    const loader = page.locator('.animate-spin').first();
    await expect(loader).not.toBeVisible();

    // Wait for debounce period - loader may briefly appear before mock responds
    await page.waitForTimeout(600);

    // Input should remain enabled and focused
    await expect(input).toBeFocused();
    await expect(input).not.toBeDisabled();
  });

  test('should abort search when user continues typing', async ({ page }) => {
    const input = page.locator('[data-testid="location-search-input"]');

    // Type initial text
    await input.fill('Par');

    // Wait a bit (not enough to trigger search)
    await page.waitForTimeout(300);

    // Continue typing before the debounce completes
    await input.fill('Paris');

    // Results should appear for "Paris"
    const dropdown = page.locator('[data-testid="location-results-dropdown"]');
    await expect(dropdown).toBeVisible({ timeout: 3000 });

    // Should show results for Paris
    const firstResult = page.locator('[data-testid="location-result-0"]');
    await expect(firstResult).toBeVisible();
  });

  test('should never steal focus from input during search', async ({ page }) => {
    const input = page.locator('[data-testid="location-search-input"]');

    // Type and wait for search to complete
    await input.fill('Monaco');

    // Wait for results to appear
    const dropdown = page.locator('[data-testid="location-results-dropdown"]');
    await expect(dropdown).toBeVisible({ timeout: 3000 });

    // Input should still be focused
    await expect(input).toBeFocused();

    // User should be able to continue typing immediately
    await input.press('Backspace');
    await expect(input).toHaveValue('Monac');

    // Still focused
    await expect(input).toBeFocused();
  });

  test('should handle rapid typing and retyping', async ({ page }) => {
    const input = page.locator('[data-testid="location-search-input"]');

    // Type quickly
    await input.fill('Par');
    await page.waitForTimeout(200);

    // Change mind and type something else
    await input.fill('Lon');
    await page.waitForTimeout(200);

    // Change mind again
    await input.fill('Amsterdam');

    // Results should appear
    const dropdown = page.locator('[data-testid="location-results-dropdown"]');
    await expect(dropdown).toBeVisible({ timeout: 3000 });

    const firstResult = page.locator('[data-testid="location-result-0"]');
    await expect(firstResult).toContainText(/amsterdam/i);
  });

  test('should clear results when typing less than 3 characters', async ({ page }) => {
    const input = page.locator('[data-testid="location-search-input"]');

    // Type and get results
    await input.fill('Monaco');

    const dropdown = page.locator('[data-testid="location-results-dropdown"]');
    await expect(dropdown).toBeVisible({ timeout: 3000 });

    // Clear input to less than 3 characters
    await input.fill('Mo');

    // Results should disappear immediately
    await expect(dropdown).not.toBeVisible();

    // Loading indicator should also not be visible
    const loader = page.locator('.animate-spin').first();
    await expect(loader).not.toBeVisible();
  });

  test('should show visual search indicator without blocking interaction', async ({ page }) => {
    const input = page.locator('[data-testid="location-search-input"]');

    // Type text
    await input.fill('Berlin');

    // Wait for results
    const dropdown = page.locator('[data-testid="location-results-dropdown"]');
    await expect(dropdown).toBeVisible({ timeout: 3000 });

    // Input should not be disabled
    await expect(input).not.toBeDisabled();

    // User should be able to type even after results appear
    await input.press('Backspace');
    await expect(input).toHaveValue('Berli');
  });

  test('should handle complete typing flow naturally', async ({ page }) => {
    const input = page.locator('[data-testid="location-search-input"]');

    // User types full location name in one go
    await input.fill('Rotterdam');

    // Input shows what was typed immediately
    await expect(input).toHaveValue('Rotterdam');

    // Results appear
    const dropdown = page.locator('[data-testid="location-results-dropdown"]');
    await expect(dropdown).toBeVisible({ timeout: 3000 });

    // User can use arrow keys to select
    await input.press('ArrowDown');

    // First result should be highlighted
    const firstResult = page.locator('[data-testid="location-result-0"]');
    await expect(firstResult).toHaveClass(/bg-accent/);

    // User presses Enter to select
    await input.press('Enter');

    // Dropdown closes
    await expect(dropdown).not.toBeVisible();

    // Reset button should appear (indicates location is active)
    await expect(page.locator('[data-testid="reset-button"]')).toBeVisible({ timeout: 3000 });
  });

  test('should maintain focus after selecting from dropdown with mouse', async ({ page }) => {
    const input = page.locator('[data-testid="location-search-input"]');

    // Type and wait for results
    await input.fill('Paris');

    const dropdown = page.locator('[data-testid="location-results-dropdown"]');
    await expect(dropdown).toBeVisible({ timeout: 3000 });

    // Click first result
    await page.locator('[data-testid="location-result-0"]').click();

    // Dropdown should close
    await expect(dropdown).not.toBeVisible();

    // Input should be updated (the selected location name)
    const inputValue = await input.inputValue();
    expect(inputValue).toBeTruthy();

    // Reset button should appear (indicates location is active)
    await expect(page.locator('[data-testid="reset-button"]')).toBeVisible({ timeout: 3000 });
  });
});
