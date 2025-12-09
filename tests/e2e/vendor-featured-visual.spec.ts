import { test } from '@playwright/test';

test('Visual verification of featured vendor badges', async ({ page }) => {
  await page.goto(`${BASE_URL}/vendors');
  await page.waitForLoadState('networkidle');

  // Wait for content to load
  await page.waitForTimeout(1000);

  // Take screenshot showing featured vendors at the top
  await page.screenshot({
    path: 'test-results/vendor-featured-badges.png',
    fullPage: true,
  });
});
