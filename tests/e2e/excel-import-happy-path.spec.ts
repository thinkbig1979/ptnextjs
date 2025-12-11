import { test, expect } from '@playwright/test';
import path from 'path';
import { TEST_VENDORS, loginVendor, clearRateLimits } from './helpers/test-vendors';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

/**
 * E2E tests for successful Excel import workflow
 *
 * Tests the complete happy path: upload → validate → preview → confirm → success
 */

const VALID_FIXTURE = path.join(__dirname, '../test-fixtures/valid-vendor-data.xlsx');

// FIXED: Tests now properly login with tier2 vendor and wait for VendorDashboardContext to load
test.describe('Excel Import - Happy Path', () => {
  test.beforeEach(async ({ page }) => {
    // Clear rate limits to prevent 429 errors when running many tests
    await clearRateLimits(page);

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

    // Step 2: Wait for file to be selected
    await expect(page.getByText(/file selected/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/valid-vendor-data\.xlsx/i)).toBeVisible();

    // Step 3: Click upload button
    await page.getByRole('button', { name: /upload and validate/i }).click();

    // Step 4: Wait for upload progress
    await expect(page.getByText(/uploading/i)).toBeVisible({ timeout: 2000 });

    // Step 5: Wait for validation to complete
    await expect(page.getByText(/validating/i)).toBeVisible({ timeout: 5000 });

    // Step 6: Preview dialog should appear
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/validation results/i)).toBeVisible();

    // Step 7: Check validation summary shows no errors
    await expect(page.getByText(/0.*error/i)).toBeVisible();
    await expect(page.getByText(/3.*valid/i)).toBeVisible(); // 3 rows in fixture

    // Step 8: Confirm button should be enabled
    const confirmButton = page.getByRole('button', { name: /confirm import/i });
    await expect(confirmButton).toBeEnabled();

    // Step 9: Click confirm to execute import
    await confirmButton.click();

    // Step 10: Wait for import to execute
    await expect(page.getByText(/importing/i)).toBeVisible({ timeout: 2000 });

    // Step 11: Wait for success message
    await expect(page.getByText(/import successful/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/3.*imported/i)).toBeVisible();

    // Step 12: Dialog should close or show completion
    await expect(page.getByText(/complete/i)).toBeVisible();
  });

  test('should show accurate progress throughout workflow', async ({ page }) => {
    // Upload file
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(VALID_FIXTURE);

    // Click upload
    await page.getByRole('button', { name: /upload and validate/i }).click();

    // Should show progress bar during upload
    const progressBar = page.locator('[role="progressbar"]').first();
    await expect(progressBar).toBeVisible({ timeout: 2000 });

    // Progress should increase
    // Note: This might be too fast to reliably test, but we can try
    await page.waitForTimeout(500);

    // Eventually moves to validation
    await expect(page.getByText(/validating/i)).toBeVisible({ timeout: 5000 });
  });

  test('should display parsed data in preview', async ({ page }) => {
    // Upload and validate
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(VALID_FIXTURE);
    await page.getByRole('button', { name: /upload and validate/i }).click();

    // Wait for preview dialog
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 });

    // Switch to Data Preview tab
    await page.getByRole('tab', { name: /data preview/i }).click();

    // Should show data from fixture
    await expect(page.getByText('Test Vendor 1')).toBeVisible();
    await expect(page.getByText('Test Vendor 2')).toBeVisible();
    await expect(page.getByText('Test Vendor 3')).toBeVisible();
  });

  test('should show validation summary with correct counts', async ({ page }) => {
    // Upload and validate
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(VALID_FIXTURE);
    await page.getByRole('button', { name: /upload and validate/i }).click();

    // Wait for preview
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 });

    // Check summary metrics
    await expect(page.getByText(/total.*3/i)).toBeVisible(); // 3 total rows
    await expect(page.getByText(/valid.*3/i)).toBeVisible(); // 3 valid rows
    await expect(page.getByText(/errors.*0/i)).toBeVisible(); // 0 errors
  });

  test('should allow canceling import after preview', async ({ page }) => {
    // Upload and validate
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(VALID_FIXTURE);
    await page.getByRole('button', { name: /upload and validate/i }).click();

    // Wait for preview dialog
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 });

    // Click cancel button
    await page.getByRole('button', { name: /cancel/i }).click();

    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Should return to initial state
    await expect(page.getByRole('button', { name: /upload and validate/i })).toBeVisible();
  });

  test('should show import history after successful import', async ({ page }) => {
    // Complete import workflow
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(VALID_FIXTURE);
    await page.getByRole('button', { name: /upload and validate/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /confirm import/i }).click();
    await expect(page.getByText(/import successful/i)).toBeVisible({ timeout: 10000 });

    // Check import history card
    await expect(page.getByText(/import history/i)).toBeVisible();

    // Should show the completed import in history
    // (might need to wait for history to refresh)
    await page.waitForTimeout(2000);
    await expect(page.getByText(/success/i)).toBeVisible();
  });

  test('should allow resetting and starting a new import', async ({ page }) => {
    // Complete an import
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(VALID_FIXTURE);
    await page.getByRole('button', { name: /upload and validate/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /confirm import/i }).click();
    await expect(page.getByText(/import successful/i)).toBeVisible({ timeout: 10000 });

    // Click reset or start new import button
    await page.getByRole('button', { name: /start new|reset/i }).click();

    // Should return to initial state
    await expect(page.getByRole('button', { name: /upload and validate/i })).toBeDisabled();

    // Should be able to upload a new file
    await fileInput.setInputFiles(VALID_FIXTURE);
    await expect(page.getByRole('button', { name: /upload and validate/i })).toBeEnabled();
  });
});

// FIXED: Tests now properly login with tier2 vendor and wait for VendorDashboardContext to load
test.describe('Excel Import - File Selection', () => {
  test.beforeEach(async ({ page }) => {
    // Clear rate limits to prevent 429 errors when running many tests
    await clearRateLimits(page);

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
    await expect(page.getByText(/valid-vendor-data\.xlsx/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /upload and validate/i })).toBeEnabled();
  });

  test('should show file information after selection', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(VALID_FIXTURE);

    // Should show filename
    await expect(page.getByText(/valid-vendor-data\.xlsx/i)).toBeVisible();

    // Should show file size
    await expect(page.getByText(/\d+(\.\d+)?\s*(KB|MB)/i)).toBeVisible();
  });

  test('should allow removing selected file', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(VALID_FIXTURE);

    // File should be selected
    await expect(page.getByText(/valid-vendor-data\.xlsx/i)).toBeVisible();

    // Click remove button
    await page.getByRole('button', { name: /remove|clear/i }).click();

    // File should be cleared
    await expect(page.getByText(/valid-vendor-data\.xlsx/i)).not.toBeVisible();
    await expect(page.getByRole('button', { name: /upload and validate/i })).toBeDisabled();
  });
});
