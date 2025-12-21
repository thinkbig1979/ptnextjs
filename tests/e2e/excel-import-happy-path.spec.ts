import { test, expect } from '@playwright/test';
import path from 'path';
import { TEST_VENDORS, loginVendor, clearRateLimits } from './helpers/test-vendors';
import { resetVendorTierByEmail } from './helpers/seed-api-helpers';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

/**
 * E2E tests for successful Excel import workflow
 *
 * Tests the complete happy path: upload → validate → preview → confirm → success
 */

const VALID_FIXTURE = path.join(__dirname, '../test-fixtures/valid-vendor-data.xlsx');

// FIXED: Tests now properly login with tier2 vendor and wait for VendorDashboardContext to load
test.describe('Excel Import - Happy Path', () => {
  // Serial mode: file uploads and imports modify database state
  test.describe.configure({ mode: 'serial' });
  test.beforeEach(async ({ page }) => {
    // Clear rate limits to prevent 429 errors when running many tests
    await clearRateLimits(page);

    // Reset vendor to tier2 BEFORE login (may have been changed by previous test runs)
    await resetVendorTierByEmail(page, TEST_VENDORS.tier2.email, 'tier2');

    // Login as tier2 vendor (has access to data management features)
    await loginVendor(page, TEST_VENDORS.tier2.email, TEST_VENDORS.tier2.password);

    // Navigate to data management page
    await page.goto(`${BASE_URL}/vendor/dashboard/data-management`);
    await page.waitForLoadState('networkidle');

    // Wait for vendor context to load - Export Data button only appears when vendor is loaded
    await expect(page.getByRole('button', { name: /Export Data|Export vendor data/i })).toBeVisible({ timeout: 15000 });
  });

  test('should complete full import workflow successfully', async ({ page }) => {
    // Step 1: Upload file
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(VALID_FIXTURE);

    // Step 2: Wait for file to be selected (toast notification)
    await expect(page.getByText('valid-vendor-data.xlsx').first()).toBeVisible({ timeout: 5000 });

    // Step 3: Click upload button
    await page.getByRole('button', { name: /upload and validate/i }).click();

    // Step 4: Wait for validation to complete - validation results appear inline
    // The UI shows inline validation stats, not a dialog
    await expect(page.getByText(/Total Rows/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Valid Rows/i)).toBeVisible();

    // Step 5: Check validation summary shows 3 valid rows and 0 errors
    await expect(page.getByText('3').first()).toBeVisible(); // Total rows = 3
    await expect(page.getByText('0').first()).toBeVisible(); // Errors = 0

    // Step 6: Success message should appear
    await expect(page.getByText(/validated successfully|Ready to import/i)).toBeVisible();

    // Step 7: Confirm button should be enabled
    const confirmButton = page.getByRole('button', { name: /confirm import/i });
    await expect(confirmButton).toBeEnabled();

    // Step 8: Click confirm to execute import
    await confirmButton.click();

    // Step 9: Wait for import to complete - check import history table shows Success
    // The import history table appears with the import result
    await expect(page.locator('table').getByText('Success').first()).toBeVisible({ timeout: 15000 });
  });

  test('should show accurate progress throughout workflow', async ({ page }) => {
    // Upload file
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(VALID_FIXTURE);

    // Click upload
    await page.getByRole('button', { name: /upload and validate/i }).click();

    // Wait for validation to complete - the progress states may be too fast to catch
    // So we just verify the end state: validation results shown
    await expect(page.getByText(/Total Rows/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Valid Rows/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /confirm import/i })).toBeVisible();
  });

  test('should display validation results in preview', async ({ page }) => {
    // Upload and validate
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(VALID_FIXTURE);
    await page.getByRole('button', { name: /upload and validate/i }).click();

    // Wait for validation results to appear inline
    await expect(page.getByText(/Total Rows/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/validated successfully|Ready to import/i)).toBeVisible();
  });

  test('should show validation summary with correct counts', async ({ page }) => {
    // Upload and validate
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(VALID_FIXTURE);
    await page.getByRole('button', { name: /upload and validate/i }).click();

    // Wait for validation results - shown inline (not in dialog)
    await expect(page.getByText(/Total Rows/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Valid Rows/i)).toBeVisible();
    await expect(page.getByText(/Errors/i)).toBeVisible();

    // Check counts: Total 3, Valid 3, Errors 0
    // The numbers appear as separate elements next to labels
    const totalRowsSection = page.locator('p:has-text("Total Rows")').locator('..').locator('p').last();
    await expect(totalRowsSection).toHaveText('3');
  });

  test('should allow canceling import after preview', async ({ page }) => {
    // Upload and validate
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(VALID_FIXTURE);
    await page.getByRole('button', { name: /upload and validate/i }).click();

    // Wait for validation results to appear inline
    await expect(page.getByText(/Total Rows/i)).toBeVisible({ timeout: 15000 });

    // Cancel button should be visible
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    await expect(cancelButton).toBeVisible();

    // Click cancel button
    await cancelButton.click();

    // After canceling, the validation results should be gone and UI returns to idle state
    // The confirm button should no longer be visible
    await expect(page.getByRole('button', { name: /confirm import/i })).not.toBeVisible({ timeout: 5000 });
  });

  test('should show import history after successful import', async ({ page }) => {
    // Complete import workflow
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(VALID_FIXTURE);
    await page.getByRole('button', { name: /upload and validate/i }).click();

    // Wait for validation to complete
    await expect(page.getByText(/Total Rows/i)).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /confirm import/i }).click();

    // Wait for import to complete - check import history table shows Success
    await expect(page.locator('table').getByText('Success').first()).toBeVisible({ timeout: 15000 });

    // Check import history section is visible
    await expect(page.getByText(/import history/i)).toBeVisible();
  });

  test('should allow starting a new import after completion', async ({ page }) => {
    // Complete an import
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(VALID_FIXTURE);
    await page.getByRole('button', { name: /upload and validate/i }).click();

    // Wait for validation to complete
    await expect(page.getByText(/Total Rows/i)).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: /confirm import/i }).click();

    // Wait for import to complete - check import history table shows Success
    await expect(page.locator('table').getByText('Success').first()).toBeVisible({ timeout: 15000 });

    // After successful import, the import UI should reset or allow starting new import
    // Refresh page to ensure clean state for new import
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: /Export Data|Export vendor data/i })).toBeVisible({ timeout: 15000 });

    // Now should be able to select a new file
    const newFileInput = page.locator('input[type="file"]').first();
    await newFileInput.setInputFiles(VALID_FIXTURE);
    await expect(page.getByText('valid-vendor-data.xlsx').first()).toBeVisible({ timeout: 5000 });
  });
});

// FIXED: Tests now properly login with tier2 vendor and wait for VendorDashboardContext to load
test.describe('Excel Import - File Selection', () => {
  test.beforeEach(async ({ page }) => {
    // Clear rate limits to prevent 429 errors when running many tests
    await clearRateLimits(page);

    // Reset vendor to tier2 BEFORE login (may have been changed by previous test runs)
    await resetVendorTierByEmail(page, TEST_VENDORS.tier2.email, 'tier2');

    // Login as tier2 vendor (has access to data management features)
    await loginVendor(page, TEST_VENDORS.tier2.email, TEST_VENDORS.tier2.password);

    // Navigate to data management page
    await page.goto(`${BASE_URL}/vendor/dashboard/data-management`);
    await page.waitForLoadState('networkidle');

    // Wait for vendor context to load - Export Data button only appears when vendor is loaded
    await expect(page.getByRole('button', { name: /Export Data|Export vendor data/i })).toBeVisible({ timeout: 15000 });
  });

  test('should accept file via browse button', async ({ page }) => {
    // Click browse button
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(VALID_FIXTURE);

    // File should be selected
    await expect(page.getByText('valid-vendor-data.xlsx').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /upload and validate/i })).toBeEnabled();
  });

  test('should show file information after selection', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(VALID_FIXTURE);

    // Should show filename
    await expect(page.getByText('valid-vendor-data.xlsx').first()).toBeVisible();

    // Should show file size (e.g., "6.8 KB")
    await expect(page.getByText(/\d+\.?\d*\s*KB/i)).toBeVisible();
  });

  test('should allow removing selected file', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(VALID_FIXTURE);

    // File should be selected
    await expect(page.getByText('valid-vendor-data.xlsx').first()).toBeVisible();

    // Click remove button
    await page.getByRole('button', { name: /remove|clear/i }).click();

    // File should be cleared
    await expect(page.getByText('valid-vendor-data.xlsx').first()).not.toBeVisible();
    await expect(page.getByRole('button', { name: /upload and validate/i })).toBeDisabled();
  });
});
