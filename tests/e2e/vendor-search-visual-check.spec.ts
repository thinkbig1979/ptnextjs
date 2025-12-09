import { test } from '@playwright/test';

test('Visual check of vendor search UX - Name mode', async ({ page }) => {
  await page.goto(`${BASE_URL}/vendors`);
  await page.waitForLoadState('networkidle');

  // Take screenshot of name search mode (default)
  await page.screenshot({
    path: 'test-results/vendor-search-name-mode.png',
    fullPage: false,
  });
});

test('Visual check of vendor search UX - Location mode', async ({ page }) => {
  await page.goto(`${BASE_URL}/vendors`);
  await page.waitForLoadState('networkidle');

  // Switch to location mode
  await page.getByRole('tab', { name: /location/i }).click();

  // Wait a moment for any animations
  await page.waitForTimeout(500);

  // Take screenshot of location search mode
  await page.screenshot({
    path: 'test-results/vendor-search-location-mode.png',
    fullPage: false,
  });
});

test('Visual check of vendor search UX - With dropdown results', async ({ page }) => {
  await page.goto(`${BASE_URL}/vendors`);
  await page.waitForLoadState('networkidle');

  // Switch to location mode
  await page.getByRole('tab', { name: /location/i }).click();

  // Type to trigger dropdown
  const locationInput = page.getByTestId('location-search-input');
  await locationInput.fill('Monaco');

  // Wait for dropdown
  await page.waitForTimeout(600);

  // Take screenshot with dropdown visible
  await page.screenshot({
    path: 'test-results/vendor-search-location-dropdown.png',
    fullPage: false,
  });
});
