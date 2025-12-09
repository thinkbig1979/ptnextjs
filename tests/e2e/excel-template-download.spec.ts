import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * E2E tests for Excel template download functionality
 *
 * Tests the complete workflow of downloading tier-appropriate Excel templates
 * from the vendor dashboard.
 */

test.describe('Excel Template Download', () => {
  test.beforeEach(async ({ page }) => {
    // Login as a vendor user (adjust based on your auth setup)
    await page.goto('/auth/login');
    // TODO: Implement actual login flow
    // await page.fill('[name="email"]', 'vendor@example.com');
    // await page.fill('[name="password"]', 'password');
    // await page.click('button[type="submit"]');

    // Navigate to data management page
    await page.goto('/vendor/dashboard/data-management');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display Excel Export card with download template button', async ({ page }) => {
    // Check that Excel Export card is visible
    await expect(page.getByText('Excel Export')).toBeVisible();

    // Check for download template button
    await expect(page.getByRole('button', { name: /download template/i })).toBeVisible();
  });

  test('should download template file when button clicked', async ({ page }) => {
    // Set up download listener
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 });

    // Click download template button
    await page.getByRole('button', { name: /download template/i }).click();

    // Wait for download to start
    const download = await downloadPromise;

    // Verify filename matches expected pattern
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/vendor_import_template.*\.xlsx$/);
    expect(filename).toContain(new Date().toISOString().split('T')[0]); // Contains today's date

    // Verify file is downloaded
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();

    // Verify file size is reasonable (not empty)
    if (downloadPath) {
      const stats = fs.statSync(downloadPath);
      expect(stats.size).toBeGreaterThan(1000); // At least 1KB
    }
  });

  test('should show success toast after template download', async ({ page }) => {
    // Click download button
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /download template/i }).click();
    await downloadPromise;

    // Wait for and verify success toast
    await expect(page.getByText(/template downloaded/i)).toBeVisible({ timeout: 5000 });
  });

  test('should show loading state during template generation', async ({ page }) => {
    // Click download button
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /download template/i }).click();

    // Button should show loading state (disabled with "Downloading..." text)
    const downloadButton = page.getByRole('button', { name: /downloading/i });
    await expect(downloadButton).toBeVisible({ timeout: 2000 });

    // Wait for download to complete
    await downloadPromise;

    // Button should return to normal state
    await expect(page.getByRole('button', { name: /download template/i })).toBeVisible();
  });

  test('should handle download errors gracefully', async ({ page }) => {
    // Simulate error by going offline
    await page.context().setOffline(true);

    // Try to download
    await page.getByRole('button', { name: /download template/i }).click();

    // Wait for error toast
    await expect(page.getByText(/download failed/i)).toBeVisible({ timeout: 5000 });

    // Go back online
    await page.context().setOffline(false);
  });

  test('should download different templates for different tiers', async ({ page, context }) => {
    // This test would need to login as different tier vendors
    // For now, just verify the template contains tier info in filename

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /download template/i }).click();
    const download = await downloadPromise;

    const filename = download.suggestedFilename();
    // Filename should contain tier identifier (e.g., tier1, tier2, etc.)
    expect(filename).toMatch(/tier\d/i);
  });

  test('should allow multiple template downloads', async ({ page }) => {
    // Download first template
    let downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /download template/i }).click();
    await downloadPromise;

    // Wait a moment
    await page.waitForTimeout(1000);

    // Download second template
    downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /download template/i }).click();
    await downloadPromise;

    // Both downloads should succeed
    await expect(page.getByRole('button', { name: /download template/i })).toBeVisible();
  });
});

test.describe('Excel Template Download - Accessibility', () => {
  test('should be keyboard accessible', async ({ page }) => {
    await page.goto('/vendor/dashboard/data-management');
    await page.waitForLoadState('networkidle');

    // Tab to the download button
    await page.keyboard.press('Tab');
    const downloadButton = page.getByRole('button', { name: /download template/i });

    // Verify button is focused
    await expect(downloadButton).toBeFocused();

    // Trigger download with Enter key
    const downloadPromise = page.waitForEvent('download');
    await page.keyboard.press('Enter');
    await downloadPromise;

    // Verify download succeeded
    await expect(page.getByText(/template downloaded/i)).toBeVisible();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/vendor/dashboard/data-management');

    const downloadButton = page.getByRole('button', { name: /download template/i });
    await expect(downloadButton).toHaveAttribute('type', 'button');
  });
});
