import { test, expect } from './fixtures/test-fixtures';

test.describe('Location Search - Instant Execution on Selection', () => {
  test.beforeEach(async ({ page, geocodeMock }) => {
    // geocodeMock is automatically set up via fixture
    await page.goto('/vendors');
    await page.waitForLoadState('networkidle');
  });

  test('should execute search immediately after selecting location with Enter key', async ({ page }) => {
    const input = page.locator('[data-testid="location-input"]');

    // Type location
    await input.fill('Leiden');

    // Wait for search results to appear
    const dropdown = page.locator('[data-testid="location-results"]');
    await expect(dropdown).toBeVisible({ timeout: 3000 });

    // Press Enter to select first result
    await input.press('Enter');

    // Dropdown should close immediately
    await expect(dropdown).not.toBeVisible();

    // URL should update immediately with location parameter (search was executed)
    await expect(page).toHaveURL(/location=/, { timeout: 2000 });

    // Input should still be focused
    await expect(input).toBeFocused();

    // The displayed location name should be in the input
    const inputValue = await input.inputValue();
    expect(inputValue.length).toBeGreaterThan(0);
  });

  test('should execute search immediately after clicking on a result', async ({ page }) => {
    const input = page.locator('[data-testid="location-input"]');

    // Type location
    await input.fill('Monaco');

    // Wait for search results
    const dropdown = page.locator('[data-testid="location-results"]');
    await expect(dropdown).toBeVisible({ timeout: 3000 });

    // Click first result
    const firstResult = dropdown.locator('.cursor-pointer').first();
    await firstResult.click();

    // Dropdown should close
    await expect(dropdown).not.toBeVisible();

    // URL should update with location parameter
    await expect(page).toHaveURL(/location=/, { timeout: 2000 });
  });

  test('should NOT show suggestions again after selecting a location', async ({ page }) => {
    const input = page.locator('[data-testid="location-input"]');

    // Type and select location
    await input.fill('Paris');

    const dropdown = page.locator('[data-testid="location-results"]');
    await expect(dropdown).toBeVisible({ timeout: 3000 });

    await input.press('Enter');

    // Dropdown closes and search executes
    await expect(dropdown).not.toBeVisible();
    await expect(page).toHaveURL(/location=/);

    // Wait to see if dropdown reappears (it shouldn't)
    await page.waitForTimeout(1000);

    // Dropdown should still NOT be visible
    await expect(dropdown).not.toBeVisible();
  });

  test('should allow searching for a new location after selection', async ({ page }) => {
    const input = page.locator('[data-testid="location-input"]');

    // First search
    await input.fill('London');

    let dropdown = page.locator('[data-testid="location-results"]');
    await expect(dropdown).toBeVisible({ timeout: 3000 });
    await input.press('Enter');

    await expect(page).toHaveURL(/location=/);
    await expect(dropdown).not.toBeVisible();

    // Clear and search for new location
    await input.clear();
    await input.fill('Amsterdam');

    // New results should appear
    await expect(dropdown).toBeVisible({ timeout: 3000 });

    // Should be able to select new location
    await input.press('Enter');
    await expect(dropdown).not.toBeVisible();
  });
});
