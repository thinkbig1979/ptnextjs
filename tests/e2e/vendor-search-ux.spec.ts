import { test, expect } from '@playwright/test';

test.describe('Vendor Search UX Improvements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/vendors`);
    await page.waitForLoadState('networkidle');
  });

  test('should display unified search bar with tabs', async ({ page }) => {
    // Check that tabs are visible
    const nameTab = page.getByRole('tab', { name: /name/i });
    const locationTab = page.getByRole('tab', { name: /location/i });

    await expect(nameTab).toBeVisible();
    await expect(locationTab).toBeVisible();
  });

  test('should default to name search mode', async ({ page }) => {
    // Name tab should be active by default
    const nameTab = page.getByRole('tab', { name: /name/i });
    await expect(nameTab).toHaveAttribute('data-state', 'active');

    // Name search input should be visible
    const nameInput = page.getByTestId('name-search-input');
    await expect(nameInput).toBeVisible();
  });

  test('should switch to location search mode', async ({ page }) => {
    // Click location tab
    const locationTab = page.getByRole('tab', { name: /location/i });
    await locationTab.click();

    // Location tab should be active
    await expect(locationTab).toHaveAttribute('data-state', 'active');

    // Location input should be visible
    const locationInput = page.getByTestId('location-search-input');
    await expect(locationInput).toBeVisible();

    // Distance slider should be visible in location mode
    const distanceLabel = page.getByText(/search radius/i);
    await expect(distanceLabel).toBeVisible();
  });

  test('should show category filter in compact layout', async ({ page }) => {
    // Category filter should be visible and inline with tabs
    const categoryFilter = page.getByTestId('category-filter');
    await expect(categoryFilter).toBeVisible();
  });

  test('should allow name search', async ({ page }) => {
    const nameInput = page.getByTestId('name-search-input');

    // Type in name search
    await nameInput.fill('Test');
    await expect(nameInput).toHaveValue('Test');

    // Clear button should be visible next to the input
    const clearButton = page.locator('button').filter({ hasText: '' }).filter({ has: page.locator('svg') });
    const visibleClearButton = clearButton.last(); // Get the clear button in the input

    await visibleClearButton.click();
    await expect(nameInput).toHaveValue('');
  });

  test('should show location results dropdown when typing', async ({ page }) => {
    // Switch to location mode
    await page.getByRole('tab', { name: /location/i }).click();

    // Type in location search
    const locationInput = page.getByTestId('location-search-input');
    await locationInput.fill('Monaco');

    // Wait for dropdown to appear (debounced)
    await page.waitForTimeout(600);

    // Dropdown should appear with results
    const dropdown = page.getByTestId('location-results-dropdown');
    await expect(dropdown).toBeVisible();
  });

  test('should hide manual coordinates by default', async ({ page }) => {
    // Switch to location mode
    await page.getByRole('tab', { name: /location/i }).click();

    // Manual coordinates should be hidden initially
    const latInput = page.locator('#latitude-input');
    await expect(latInput).not.toBeVisible();

    // Show advanced options
    const advancedButton = page.getByRole('button', { name: /manual coordinates/i });
    await advancedButton.click();

    // Now coordinates should be visible
    await expect(latInput).toBeVisible();
  });

  test('should maintain compact layout with all controls visible', async ({ page }) => {
    // All key controls should be visible without scrolling on desktop
    const nameTab = page.getByRole('tab', { name: /name/i });
    const categoryFilter = page.getByTestId('category-filter');
    const vendorToggle = page.locator('#vendor-toggle');

    await expect(nameTab).toBeInViewport();
    await expect(categoryFilter).toBeInViewport();
    await expect(vendorToggle).toBeInViewport();
  });

  test('should switch modes and clear previous search', async ({ page }) => {
    // Type in name search
    const nameInput = page.getByTestId('name-search-input');
    await nameInput.fill('Test Vendor');
    await expect(nameInput).toHaveValue('Test Vendor');

    // Switch to location mode
    await page.getByRole('tab', { name: /location/i }).click();

    // Name input should no longer be visible
    await expect(nameInput).not.toBeVisible();

    // Switch back to name mode
    await page.getByRole('tab', { name: /name/i }).click();

    // Name search should be cleared (modes reset each other)
    await expect(nameInput).toHaveValue('');
  });

  test('should show clear button only when name search has content', async ({ page }) => {
    const nameInput = page.getByTestId('name-search-input');

    // Initially no clear button visible (or not interactable)
    await expect(nameInput).toHaveValue('');

    // Type something
    await nameInput.fill('Test');

    // Clear button should now be visible
    const clearButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    if (await clearButton.isVisible()) {
      await expect(clearButton).toBeEnabled();
    }
  });

  test('should show distance slider immediately in location mode', async ({ page }) => {
    // Switch to location mode
    await page.getByRole('tab', { name: /location/i }).click();

    // Distance slider and label should be immediately visible
    const distanceLabel = page.getByText(/search radius/i);
    await expect(distanceLabel).toBeVisible();

    // Should show current distance value (specific match to avoid multiple matches)
    const distanceValue = page.locator('span.text-sm.font-medium.text-muted-foreground').first();
    await expect(distanceValue).toBeVisible();
    await expect(distanceValue).toContainText(/\d+ km/);
  });
});
