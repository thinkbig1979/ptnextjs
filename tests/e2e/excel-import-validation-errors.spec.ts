import { test, expect } from '@playwright/test';
import path from 'path';
import { TEST_VENDORS, loginVendor, clearRateLimits } from './helpers/test-vendors';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

/**
 * E2E tests for Excel import with validation errors
 *
 * Tests the workflow when uploaded data contains validation errors,
 * ensuring errors are displayed clearly and import is blocked.
 */

const INVALID_FIXTURE = path.join(__dirname, '../test-fixtures/invalid-vendor-data.xlsx');

// FIXED: Tests updated to match actual inline validation UI (no dialog)
test.describe('Excel Import - Validation Errors', () => {
  test.beforeEach(async ({ page }) => {
    // Clear rate limits to prevent 429 errors when running many tests
    await clearRateLimits(page);

    // Login as tier2 vendor (has access to data management features)
    await loginVendor(page, TEST_VENDORS.tier2.email, TEST_VENDORS.tier2.password);

    // Navigate to data management page
    await page.goto(`${BASE_URL}/vendor/dashboard/data-management`);
    await page.waitForLoadState('networkidle');

    // Wait for vendor context to load - Export Data button has aria-label "Export vendor data to Excel"
    await expect(page.getByRole('button', { name: /Export.*data/i })).toBeVisible({ timeout: 15000 });
  });

  test('should display validation errors after upload', async ({ page }) => {
    // Upload file with validation errors
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(INVALID_FIXTURE);

    // Click upload
    await page.getByRole('button', { name: /upload and validate/i }).click();

    // Wait for validation results to appear inline
    await expect(page.getByText(/Total Rows/i)).toBeVisible({ timeout: 15000 });

    // Should show error count label
    await expect(page.getByText('Errors', { exact: true })).toBeVisible();
  });

  test('should disable action button when errors exist', async ({ page }) => {
    // Upload invalid file
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(INVALID_FIXTURE);
    await page.getByRole('button', { name: /upload and validate/i }).click();

    // Wait for validation to complete
    await expect(page.getByText(/Total Rows/i)).toBeVisible({ timeout: 15000 });

    // When errors exist, the button shows "Fix Errors First" and is disabled
    const fixButton = page.getByRole('button', { name: /fix errors first/i });
    await expect(fixButton).toBeDisabled();
  });

  test('should show validation error message', async ({ page }) => {
    // Upload invalid file
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(INVALID_FIXTURE);
    await page.getByRole('button', { name: /upload and validate/i }).click();

    // Wait for validation to complete
    await expect(page.getByText(/Total Rows/i)).toBeVisible({ timeout: 15000 });

    // Should show validation error warning message
    await expect(page.getByText(/Found.*rows with errors/i)).toBeVisible();
  });

  test('should show validation summary with error counts', async ({ page }) => {
    // Upload invalid file
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(INVALID_FIXTURE);
    await page.getByRole('button', { name: /upload and validate/i }).click();

    // Wait for validation to complete
    await expect(page.getByText(/Total Rows/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Valid Rows/i)).toBeVisible();
    await expect(page.getByText('Errors', { exact: true })).toBeVisible();

    // The invalid fixture has 3 rows with errors, so valid rows should be 0
    // Total rows: 3, Valid rows: 0, Errors: 3
    const totalRowsSection = page.locator('p:has-text("Total Rows")').locator('..').locator('p').last();
    await expect(totalRowsSection).toHaveText('3');

    // Valid rows should be 0
    const validRowsSection = page.locator('p:has-text("Valid Rows")').locator('..').locator('p').last();
    await expect(validRowsSection).toHaveText('0');
  });

  test('should allow canceling after seeing validation errors', async ({ page }) => {
    // Upload invalid file
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(INVALID_FIXTURE);
    await page.getByRole('button', { name: /upload and validate/i }).click();

    // Wait for validation to complete
    await expect(page.getByText(/Total Rows/i)).toBeVisible({ timeout: 15000 });

    // Click cancel
    await page.getByRole('button', { name: /cancel/i }).click();

    // Should return to initial state - "Fix Errors First" button should no longer be visible
    await expect(page.getByRole('button', { name: /fix errors first/i })).not.toBeVisible({ timeout: 5000 });
  });
});

// FIXED: Tests updated to match actual inline validation UI
test.describe('Excel Import - Error Prevention', () => {
  test.beforeEach(async ({ page }) => {
    // Clear rate limits to prevent 429 errors when running many tests
    await clearRateLimits(page);

    // Login as tier2 vendor (has access to data management features)
    await loginVendor(page, TEST_VENDORS.tier2.email, TEST_VENDORS.tier2.password);

    // Navigate to data management page
    await page.goto(`${BASE_URL}/vendor/dashboard/data-management`);
    await page.waitForLoadState('networkidle');

    // Wait for vendor context to load
    await expect(page.getByRole('button', { name: /Export.*data/i })).toBeVisible({ timeout: 15000 });
  });

  test('should prevent import when validation fails', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(INVALID_FIXTURE);
    await page.getByRole('button', { name: /upload and validate/i }).click();

    // Wait for validation to complete
    await expect(page.getByText(/Total Rows/i)).toBeVisible({ timeout: 15000 });

    // "Fix Errors First" button should be disabled with validation errors
    const fixButton = page.getByRole('button', { name: /fix errors first/i });
    await expect(fixButton).toBeDisabled();

    // Cancel should still work
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    await expect(cancelButton).toBeEnabled();
  });

  test('should show all validation results after processing', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(INVALID_FIXTURE);
    await page.getByRole('button', { name: /upload and validate/i }).click();

    // Wait for validation results
    await expect(page.getByText(/Total Rows/i)).toBeVisible({ timeout: 15000 });

    // All key metrics should be visible - use exact match to avoid strict mode violations
    await expect(page.getByText(/Total Rows/i)).toBeVisible();
    await expect(page.getByText(/Valid Rows/i)).toBeVisible();
    await expect(page.getByText('Errors', { exact: true })).toBeVisible();
    await expect(page.getByText('Warnings', { exact: true })).toBeVisible();
  });
});
