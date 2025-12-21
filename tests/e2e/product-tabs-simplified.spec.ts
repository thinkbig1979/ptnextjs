import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('Product Detail Page - Simplified Tabs', () => {
  // Use a product that exists in the database (seeded via data/seed.ts at build time)
  // Cannot use test-seeded products here as they're created after the build
  const testProductSlug = 'marine-av-technologies-complete-system-integration';

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/products/${testProductSlug}`);
    await page.waitForLoadState('networkidle');
  });

  test('should only show 3 tabs (Integration, Reviews, Demo)', async ({ page }) => {
    // Check that only 3 tabs exist
    const tabs = page.getByRole('tab');
    const tabCount = await tabs.count();
    expect(tabCount).toBe(3);

    // Check that the correct tabs are present
    await expect(page.getByRole('tab', { name: /integration/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /reviews/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /demo/i })).toBeVisible();
  });

  test('should not show Overview tab', async ({ page }) => {
    const overviewTab = page.getByRole('tab', { name: /overview/i });
    await expect(overviewTab).not.toBeVisible();
  });

  test('should not show Performance tab', async ({ page }) => {
    const performanceTab = page.getByRole('tab', { name: /performance/i });
    await expect(performanceTab).not.toBeVisible();
  });

  test('should default to Integration tab', async ({ page }) => {
    const integrationTab = page.getByRole('tab', { name: /integration/i });
    await expect(integrationTab).toHaveAttribute('data-state', 'active');
  });

  test('should switch between tabs correctly', async ({ page }) => {
    // Click Reviews tab
    await page.getByRole('tab', { name: /reviews/i }).click();
    await expect(page.getByRole('tab', { name: /reviews/i })).toHaveAttribute('data-state', 'active');

    // Click Demo tab
    await page.getByRole('tab', { name: /demo/i }).click();
    await expect(page.getByRole('tab', { name: /demo/i })).toHaveAttribute('data-state', 'active');

    // Click Integration tab
    await page.getByRole('tab', { name: /integration/i }).click();
    await expect(page.getByRole('tab', { name: /integration/i })).toHaveAttribute('data-state', 'active');
  });

  test('should display Integration tab content', async ({ page }) => {
    await page.getByRole('tab', { name: /integration/i }).click();

    // Check for Integration heading inside the tab panel (h3, not h1)
    const heading = page.getByRole('heading', { name: 'System Integration', exact: true });
    await expect(heading).toBeVisible();
  });

  test('should display Reviews tab content', async ({ page }) => {
    await page.getByRole('tab', { name: /reviews/i }).click();
    // Wait for tab to be active
    await expect(page.getByRole('tab', { name: /reviews/i })).toHaveAttribute('data-state', 'active');

    // Check for Reviews heading - there may be multiple data-testid="owner-reviews"
    // so we look for the heading directly within the active tab panel
    const heading = page.getByRole('heading', { name: 'Owner Reviews', exact: true }).first();
    await expect(heading).toBeVisible();
  });

  test('should display Demo tab content', async ({ page }) => {
    await page.getByRole('tab', { name: /demo/i }).click();

    // Check for Demo heading
    const heading = page.getByRole('heading', { name: /interactive demo/i });
    await expect(heading).toBeVisible();
  });

  test('should have proper grid layout for 3 tabs', async ({ page }) => {
    const tabsList = page.locator('[role="tablist"]');

    // Check that the TabsList has grid-cols-3 class
    const className = await tabsList.getAttribute('class');
    expect(className).toContain('grid-cols-3');
  });
});
