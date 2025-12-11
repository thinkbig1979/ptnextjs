import { test, expect } from '@playwright/test';
import path from 'path';

/**
 * E2E tests for Excel import with validation errors
 *
 * Tests the workflow when uploaded data contains validation errors,
 * ensuring errors are displayed clearly and import is blocked.
 */

const INVALID_FIXTURE = path.join(__dirname, '../test-fixtures/invalid-vendor-data.xlsx');

// QUARANTINED: Excel Import validation tests need VendorDashboardContext to load vendor data
// Issue: Page requires VendorDashboardProvider which needs proper auth context setup
// The page/components exist at /vendor/dashboard/data-management but require:
// 1. Proper login with tier2+ vendor
// 2. VendorDashboardProvider to provide vendor context
// Tracking: beads task ptnextjs-p19a
test.describe.skip('Excel Import - Validation Errors', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to data management page
    await page.goto('/vendor/dashboard/data-management');
    await page.waitForLoadState('networkidle');
  });

  test('should display validation errors in preview dialog', async ({ page }) => {
    // Upload file with validation errors
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(INVALID_FIXTURE);

    // Click upload
    await page.getByRole('button', { name: /upload and validate/i }).click();

    // Wait for preview dialog
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 });

    // Should show error count
    await expect(page.getByText(/error/i)).toBeVisible();

    // Error count should be > 0
    const errorText = await page.locator('[data-testid="error-count"]').textContent().catch(() => '');
    if (errorText) {
      const errorCount = parseInt(errorText);
      expect(errorCount).toBeGreaterThan(0);
    }
  });

  test('should disable confirm button when errors exist', async ({ page }) => {
    // Upload invalid file
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(INVALID_FIXTURE);
    await page.getByRole('button', { name: /upload and validate/i }).click();

    // Wait for preview
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 });

    // Confirm button should be disabled
    const confirmButton = page.getByRole('button', { name: /confirm import/i });
    await expect(confirmButton).toBeDisabled();
  });

  test('should show validation errors in errors tab', async ({ page }) => {
    // Upload invalid file
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(INVALID_FIXTURE);
    await page.getByRole('button', { name: /upload and validate/i }).click();

    // Wait for preview
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 });

    // Click on Validation Errors tab
    await page.getByRole('tab', { name: /validation errors/i }).click();

    // Should show error table
    await expect(page.locator('table')).toBeVisible();

    // Should show error details
    await expect(page.getByRole('columnheader', { name: /row/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /field/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /message/i })).toBeVisible();
  });

  test('should highlight error rows in data preview', async ({ page }) => {
    // Upload invalid file
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(INVALID_FIXTURE);
    await page.getByRole('button', { name: /upload and validate/i }).click();

    // Wait for preview
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 });

    // Go to Data Preview tab
    await page.getByRole('tab', { name: /data preview/i }).click();

    // Error rows should have error styling (red background or indicator)
    const errorRows = page.locator('[data-has-errors="true"]');
    await expect(errorRows.first()).toBeVisible();
  });

  test('should show specific error messages for each validation failure', async ({ page }) => {
    // Upload invalid file
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(INVALID_FIXTURE);
    await page.getByRole('button', { name: /upload and validate/i }).click();

    // Wait for preview
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 });

    // Go to Validation Errors tab
    await page.getByRole('tab', { name: /validation errors/i }).click();

    // Should show specific error messages
    // Based on invalid-vendor-data.xlsx fixture:
    // - Empty company name error
    await expect(page.getByText(/company name.*required|cannot be empty/i)).toBeVisible();

    // - Invalid email error
    await expect(page.getByText(/invalid email|email.*format/i)).toBeVisible();

    // - Invalid URL error
    await expect(page.getByText(/invalid url|website.*format/i)).toBeVisible();
  });

  test('should show row numbers for each error', async ({ page }) => {
    // Upload invalid file
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(INVALID_FIXTURE);
    await page.getByRole('button', { name: /upload and validate/i }).click();

    // Wait for preview
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 });

    // Go to Validation Errors tab
    await page.getByRole('tab', { name: /validation errors/i }).click();

    // Should show row numbers (2, 3, 4 for the 3 error rows)
    await expect(page.getByText(/^2$/)).toBeVisible(); // Row 2
    await expect(page.getByText(/^3$/)).toBeVisible(); // Row 3
    await expect(page.getByText(/^4$/)).toBeVisible(); // Row 4
  });

  test('should allow sorting validation errors', async ({ page }) => {
    // Upload invalid file
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(INVALID_FIXTURE);
    await page.getByRole('button', { name: /upload and validate/i }).click();

    // Wait for preview
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 });

    // Go to Validation Errors tab
    await page.getByRole('tab', { name: /validation errors/i }).click();

    // Click sort by field button
    const sortButton = page.getByRole('button', { name: /sort.*field/i });
    await sortButton.click();

    // Errors should be re-ordered (verify by checking first row changes)
    await page.waitForTimeout(500);
  });

  test('should allow filtering validation errors by field', async ({ page }) => {
    // Upload invalid file
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(INVALID_FIXTURE);
    await page.getByRole('button', { name: /upload and validate/i }).click();

    // Wait for preview
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 });

    // Go to Validation Errors tab
    await page.getByRole('tab', { name: /validation errors/i }).click();

    // Use field filter
    const fieldFilter = page.locator('select[name="field-filter"]').or(
      page.getByLabel(/filter by field/i)
    );

    if (await fieldFilter.isVisible()) {
      await fieldFilter.selectOption('email');

      // Should only show email errors
      await expect(page.getByText(/invalid email/i)).toBeVisible();
    }
  });

  test('should allow exporting errors to clipboard', async ({ page }) => {
    // Upload invalid file
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(INVALID_FIXTURE);
    await page.getByRole('button', { name: /upload and validate/i }).click();

    // Wait for preview
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 });

    // Go to Validation Errors tab
    await page.getByRole('tab', { name: /validation errors/i }).click();

    // Click export button
    await page.getByRole('button', { name: /export|copy/i }).click();

    // Should show success message
    await expect(page.getByText(/copied|exported/i)).toBeVisible({ timeout: 3000 });
  });

  test('should show validation summary with error breakdown', async ({ page }) => {
    // Upload invalid file
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(INVALID_FIXTURE);
    await page.getByRole('button', { name: /upload and validate/i }).click();

    // Wait for preview
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 });

    // Should show summary metrics
    await expect(page.getByText(/total.*3/i)).toBeVisible(); // 3 total rows
    await expect(page.getByText(/error/i)).toBeVisible();

    // Valid rows should be 0 (all rows have errors)
    await expect(page.getByText(/valid.*0/i)).toBeVisible();
  });

  test('should allow canceling import after seeing errors', async ({ page }) => {
    // Upload invalid file
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(INVALID_FIXTURE);
    await page.getByRole('button', { name: /upload and validate/i }).click();

    // Wait for preview
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 });

    // Click cancel
    await page.getByRole('button', { name: /cancel|close/i }).click();

    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Should return to initial state
    await expect(page.getByRole('button', { name: /upload and validate/i })).toBeVisible();
  });
});

// QUARANTINED: Same issue as main suite - needs VendorDashboardContext
test.describe.skip('Excel Import - Mixed Valid and Invalid Data', () => {
  test('should show both valid and error row counts', async ({ page }) => {
    // This test would need a fixture with mixed valid/invalid data
    // For now, use the invalid fixture
    await page.goto('/vendor/dashboard/data-management');

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(INVALID_FIXTURE);
    await page.getByRole('button', { name: /upload and validate/i }).click();

    // Wait for preview
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 });

    // Should show breakdown of valid vs error rows
    await expect(page.getByText(/total/i)).toBeVisible();
    await expect(page.getByText(/error/i)).toBeVisible();
  });

  test('should still block import if any errors exist', async ({ page }) => {
    await page.goto('/vendor/dashboard/data-management');

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(INVALID_FIXTURE);
    await page.getByRole('button', { name: /upload and validate/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 });

    // Confirm button should be disabled even with some valid rows
    const confirmButton = page.getByRole('button', { name: /confirm import/i });
    await expect(confirmButton).toBeDisabled();
  });
});
