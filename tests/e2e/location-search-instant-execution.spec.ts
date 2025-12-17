import { test, expect } from './fixtures/test-fixtures';

test.describe('Location Search - Instant Execution on Selection', () => {
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

  test('should execute search immediately after selecting location with Enter key', async ({ page }) => {
    const input = page.locator('[data-testid="location-search-input"]');

    // Type location (use Monaco which is in the mock data)
    await input.fill('Monaco');

    // Wait for search results to appear
    const dropdown = page.locator('[data-testid="location-results-dropdown"]');
    await expect(dropdown).toBeVisible({ timeout: 3000 });

    // Press ArrowDown to highlight first result, then Enter to select
    await input.press('ArrowDown');
    await input.press('Enter');

    // Dropdown should close immediately
    await expect(dropdown).not.toBeVisible();

    // Reset button should appear (indicates location is active)
    await expect(page.locator('[data-testid="reset-button"]')).toBeVisible({ timeout: 3000 });

    // The displayed location name should be in the input
    const inputValue = await input.inputValue();
    expect(inputValue.length).toBeGreaterThan(0);
  });

  test('should execute search immediately after clicking on a result', async ({ page }) => {
    const input = page.locator('[data-testid="location-search-input"]');

    // Type location
    await input.fill('Monaco');

    // Wait for search results
    const dropdown = page.locator('[data-testid="location-results-dropdown"]');
    await expect(dropdown).toBeVisible({ timeout: 3000 });

    // Click first result
    await page.locator('[data-testid="location-result-0"]').click();

    // Dropdown should close
    await expect(dropdown).not.toBeVisible();

    // Reset button should appear (indicates location is active)
    await expect(page.locator('[data-testid="reset-button"]')).toBeVisible({ timeout: 3000 });
  });

  test('should NOT show suggestions again after selecting a location', async ({ page }) => {
    const input = page.locator('[data-testid="location-search-input"]');

    // Type and select location
    await input.fill('Paris');

    const dropdown = page.locator('[data-testid="location-results-dropdown"]');
    await expect(dropdown).toBeVisible({ timeout: 3000 });

    // Press ArrowDown to highlight first result, then Enter to select
    await input.press('ArrowDown');
    await input.press('Enter');

    // Dropdown closes and search executes
    await expect(dropdown).not.toBeVisible();

    // Reset button should appear (indicates location is active)
    await expect(page.locator('[data-testid="reset-button"]')).toBeVisible({ timeout: 3000 });

    // Wait to see if dropdown reappears (it shouldn't)
    await page.waitForTimeout(1000);

    // Dropdown should still NOT be visible
    await expect(dropdown).not.toBeVisible();
  });

  test('should allow searching for a new location after selection', async ({ page }) => {
    const input = page.locator('[data-testid="location-search-input"]');

    // First search
    await input.fill('London');

    const dropdown = page.locator('[data-testid="location-results-dropdown"]');
    await expect(dropdown).toBeVisible({ timeout: 3000 });

    // Press ArrowDown to highlight first result, then Enter to select
    await input.press('ArrowDown');
    await input.press('Enter');

    // Reset button should appear (indicates location is active)
    await expect(page.locator('[data-testid="reset-button"]')).toBeVisible({ timeout: 3000 });
    await expect(dropdown).not.toBeVisible();

    // Clear and search for new location
    await input.clear();
    await input.fill('Amsterdam');

    // New results should appear
    await expect(dropdown).toBeVisible({ timeout: 3000 });

    // Should be able to select new location
    await input.press('ArrowDown');
    await input.press('Enter');
    await expect(dropdown).not.toBeVisible();
  });
});
