import { test, expect } from '@playwright/test';

test.describe('Location Search Focus Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vendors');
    await page.waitForLoadState('networkidle');
  });

  test('should keep focus in input when suggestions appear', async ({ page }) => {
    const locationInput = page.getByTestId('location-input');

    // Focus the input
    await locationInput.focus();
    expect(await locationInput.evaluate(el => el === document.activeElement)).toBe(true);

    // Type 3 characters
    await locationInput.type('Mon');

    // Wait for suggestions to appear
    await page.waitForTimeout(1000);

    // Verify dropdown is visible
    const dropdown = page.getByTestId('location-results-dropdown');
    await expect(dropdown).toBeVisible();

    // Focus should STILL be in the input
    const isFocusedAfterDropdown = await locationInput.evaluate(el => el === document.activeElement);
    expect(isFocusedAfterDropdown).toBe(true);
  });

  test('should allow typing to continue after suggestions appear', async ({ page }) => {
    const locationInput = page.getByTestId('location-input');

    // Start typing
    await locationInput.type('Mon');

    // Wait for suggestions
    await page.waitForTimeout(1000);

    // Continue typing - should still work
    await locationInput.type('aco');

    // Input should have the complete text
    const value = await locationInput.inputValue();
    expect(value).toBe('Monaco');

    // Focus should still be in input
    expect(await locationInput.evaluate(el => el === document.activeElement)).toBe(true);
  });

  test('should support arrow key navigation without losing focus', async ({ page }) => {
    const locationInput = page.getByTestId('location-input');

    // Type to show suggestions
    await locationInput.type('Paris');
    await page.waitForTimeout(1000);

    // Verify dropdown is visible
    await expect(page.getByTestId('location-results-dropdown')).toBeVisible();

    // Press arrow down
    await locationInput.press('ArrowDown');

    // Focus should still be in input
    expect(await locationInput.evaluate(el => el === document.activeElement)).toBe(true);

    // First result should be highlighted
    const firstResult = page.getByTestId('location-result-0');
    await expect(firstResult).toHaveClass(/bg-accent/);

    // Press arrow down again
    await locationInput.press('ArrowDown');

    // Focus should STILL be in input
    expect(await locationInput.evaluate(el => el === document.activeElement)).toBe(true);

    // Second result should now be highlighted
    const secondResult = page.getByTestId('location-result-1');
    await expect(secondResult).toHaveClass(/bg-accent/);
  });

  test('should maintain focus when hovering over suggestions with mouse', async ({ page }) => {
    const locationInput = page.getByTestId('location-input');

    // Type to show suggestions
    await locationInput.type('London');
    await page.waitForTimeout(1000);

    // Input should be focused
    expect(await locationInput.evaluate(el => el === document.activeElement)).toBe(true);

    // Hover over a result
    const firstResult = page.getByTestId('location-result-0');
    await firstResult.hover();

    // Focus should STILL be in input (not stolen by hover)
    expect(await locationInput.evaluate(el => el === document.activeElement)).toBe(true);
  });

  test('should refocus input after clicking a suggestion', async ({ page }) => {
    const locationInput = page.getByTestId('location-input');

    // Type to show suggestions
    await locationInput.type('Monaco');
    await page.waitForTimeout(1000);

    // Click a result
    await page.getByTestId('location-result-0').click();

    // Wait a moment for refocus
    await page.waitForTimeout(100);

    // Input should be focused again
    expect(await locationInput.evaluate(el => el === document.activeElement)).toBe(true);

    // User should be able to press Enter immediately
    await page.keyboard.press('Enter');

    // Search should execute
    await expect(page.getByTestId('result-count')).toBeVisible({ timeout: 5000 });
  });

  test('complete keyboard flow without mouse', async ({ page }) => {
    const locationInput = page.getByTestId('location-input');

    // Step 1: Type location
    await locationInput.type('Paris');
    await page.waitForTimeout(1000);

    // Step 2: Navigate with arrow keys
    await locationInput.press('ArrowDown');
    await locationInput.press('ArrowDown'); // Select second result

    // Step 3: Press Enter to select
    await locationInput.press('Enter');

    // Dropdown should close
    await expect(page.getByTestId('location-results-dropdown')).not.toBeVisible();

    // Step 4: Press Enter again to search
    await locationInput.press('Enter');

    // Results should appear
    await expect(page.getByTestId('result-count')).toBeVisible({ timeout: 5000 });

    // All of this should work without losing focus once
  });

  test('should handle rapid typing without focus issues', async ({ page }) => {
    const locationInput = page.getByTestId('location-input');

    // Type rapidly
    await locationInput.type('New York', { delay: 50 });

    // Wait for debounce
    await page.waitForTimeout(1000);

    // Input should still be focused
    expect(await locationInput.evaluate(el => el === document.activeElement)).toBe(true);

    // Input should have the text
    expect(await locationInput.inputValue()).toBe('New York');

    // Should be able to continue typing or use keyboard immediately
    await locationInput.press('Escape');

    // Dropdown should close
    await expect(page.getByTestId('location-results-dropdown')).not.toBeVisible();
  });
});
