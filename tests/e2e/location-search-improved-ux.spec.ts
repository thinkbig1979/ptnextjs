import { test, expect } from '@playwright/test';

test.describe('Location Search - Improved UX', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to vendors page
    await page.goto('/vendors');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should allow continuous typing without interruption', async ({ page }) => {
    const input = page.locator('[data-testid="location-input"]');

    // Type the full location name quickly without pauses
    // This simulates a user typing "Leiden" continuously
    await input.fill('Leiden');

    // Input should contain the full text immediately
    await expect(input).toHaveValue('Leiden');

    // Wait to see if the API call is triggered (after 1 second debounce)
    await page.waitForTimeout(1200);

    // Results should appear
    const dropdown = page.locator('[data-testid="location-results"]');
    await expect(dropdown).toBeVisible({ timeout: 5000 });

    // Input should still be focused
    await expect(input).toBeFocused();

    // Input should still have the value
    await expect(input).toHaveValue('Leiden');
  });

  test('should show loading indicator after 1 second of no typing', async ({ page }) => {
    const input = page.locator('[data-testid="location-input"]');

    // Type 3 characters
    await input.fill('Lei');

    // Loading indicator should NOT appear immediately
    const loader = page.locator('.animate-spin').first();
    await expect(loader).not.toBeVisible();

    // Wait for debounce period (1 second)
    await page.waitForTimeout(1100);

    // Loading indicator should now be visible
    await expect(loader).toBeVisible();

    // Input should remain enabled and focused
    await expect(input).toBeFocused();
    await expect(input).not.toBeDisabled();
  });

  test('should abort search when user continues typing', async ({ page }) => {
    const input = page.locator('[data-testid="location-input"]');

    // Type initial text
    await input.fill('Lei');

    // Wait 800ms (not enough to trigger search)
    await page.waitForTimeout(800);

    // Continue typing before the 1000ms debounce completes
    await input.fill('Leiden');

    // Wait another 1200ms to allow the new search to complete
    await page.waitForTimeout(1200);

    // Results should appear for "Leiden", not "Lei"
    const dropdown = page.locator('[data-testid="location-results"]');
    await expect(dropdown).toBeVisible({ timeout: 5000 });

    // Should show results for Leiden
    const firstResult = dropdown.locator('.cursor-pointer').first();
    await expect(firstResult).toContainText(/leiden/i);
  });

  test('should never steal focus from input during search', async ({ page }) => {
    const input = page.locator('[data-testid="location-input"]');

    // Type and wait for search to complete
    await input.fill('Monaco');
    await page.waitForTimeout(1200);

    // Wait for results to appear
    const dropdown = page.locator('[data-testid="location-results"]');
    await expect(dropdown).toBeVisible({ timeout: 5000 });

    // Input should still be focused
    await expect(input).toBeFocused();

    // User should be able to continue typing immediately
    await input.press('Backspace');
    await expect(input).toHaveValue('Monac');

    // Still focused
    await expect(input).toBeFocused();
  });

  test('should handle rapid typing and retyping', async ({ page }) => {
    const input = page.locator('[data-testid="location-input"]');

    // Type quickly
    await input.fill('Par');
    await page.waitForTimeout(500);

    // Change mind and type something else
    await input.fill('Lon');
    await page.waitForTimeout(500);

    // Change mind again
    await input.fill('Amsterdam');

    // Wait for search to complete
    await page.waitForTimeout(1200);

    // Results should be for Amsterdam only
    const dropdown = page.locator('[data-testid="location-results"]');
    await expect(dropdown).toBeVisible({ timeout: 5000 });

    const firstResult = dropdown.locator('.cursor-pointer').first();
    await expect(firstResult).toContainText(/amsterdam/i);
  });

  test('should clear results when typing less than 3 characters', async ({ page }) => {
    const input = page.locator('[data-testid="location-input"]');

    // Type and get results
    await input.fill('Monaco');
    await page.waitForTimeout(1200);

    const dropdown = page.locator('[data-testid="location-results"]');
    await expect(dropdown).toBeVisible({ timeout: 5000 });

    // Clear input to less than 3 characters
    await input.fill('Mo');

    // Results should disappear immediately
    await expect(dropdown).not.toBeVisible();

    // Loading indicator should also not be visible
    const loader = page.locator('.animate-spin').first();
    await expect(loader).not.toBeVisible();
  });

  test('should show visual search indicator without blocking interaction', async ({ page }) => {
    const input = page.locator('[data-testid="location-input"]');

    // Type text
    await input.fill('Berlin');

    // Wait for debounce
    await page.waitForTimeout(1100);

    // Loading spinner should be visible
    const loader = page.locator('.animate-spin').first();
    await expect(loader).toBeVisible();

    // But input should not be disabled
    await expect(input).not.toBeDisabled();

    // User should be able to type even while loading
    await input.press('Backspace');
    await expect(input).toHaveValue('Berli');

    // And the search should be aborted/restarted
  });

  test('should handle complete typing flow naturally', async ({ page }) => {
    const input = page.locator('[data-testid="location-input"]');
    const searchButton = page.locator('button:has-text("Search")');

    // User types full location name in one go
    await input.fill('Rotterdam');

    // Input shows what was typed immediately
    await expect(input).toHaveValue('Rotterdam');

    // Wait for debounce + API call
    await page.waitForTimeout(2000);

    // Results appear
    const dropdown = page.locator('[data-testid="location-results"]');
    await expect(dropdown).toBeVisible({ timeout: 5000 });

    // User can use arrow keys to select
    await input.press('ArrowDown');

    // First result should be highlighted
    const firstResult = dropdown.locator('.cursor-pointer').first();
    await expect(firstResult).toHaveClass(/bg-slate-100/);

    // User presses Enter to select
    await input.press('Enter');

    // Dropdown closes
    await expect(dropdown).not.toBeVisible();

    // User can click Search to apply filter
    await searchButton.click();

    // URL should update with location parameter
    await expect(page).toHaveURL(/location=/);
  });

  test('should maintain focus after selecting from dropdown with mouse', async ({ page }) => {
    const input = page.locator('[data-testid="location-input"]');

    // Type and wait for results
    await input.fill('Paris');
    await page.waitForTimeout(1500);

    const dropdown = page.locator('[data-testid="location-results"]');
    await expect(dropdown).toBeVisible({ timeout: 5000 });

    // Click first result
    const firstResult = dropdown.locator('.cursor-pointer').first();
    await firstResult.click();

    // Dropdown should close
    await expect(dropdown).not.toBeVisible();

    // Input should be updated
    await expect(input).not.toHaveValue('Paris');

    // Focus should still be on input
    await expect(input).toBeFocused();
  });
});
