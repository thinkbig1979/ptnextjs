import { test, expect } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

test.describe('Data Mapping Verification', () => {
  test('Verify companyName -> name mapping and save flow', async ({ page }) => {
    // Enable console logging
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      const text = msg.text();
      consoleLogs.push(text);
      console.log('Browser:', text);
    });

    // Login
    await page.goto(`${BASE_URL}/vendor/login');
    await page.fill('input[type="email"]', 'testvendor@test.com');
    await page.fill('input[type="password"]', 'testpassword');
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await page.waitForURL('**/vendor/dashboard');
    console.log('✓ Logged in successfully');

    // Navigate to profile
    await page.goto(`${BASE_URL}/vendor/dashboard/profile');
    await page.waitForLoadState('networkidle');

    // Wait for vendor data to load
    await page.waitForTimeout(1000);

    // Check if vendor.name is populated in the console logs
    const vendorDataLogs = consoleLogs.filter(log =>
      log.includes('[VendorProfileService]') ||
      log.includes('[VendorComputedFields]') ||
      log.includes('vendor.name') ||
      log.includes('companyName')
    );

    console.log('\n=== Vendor Data Logs ===');
    vendorDataLogs.forEach(log => console.log(log));

    // Check if company name field is populated
    const companyNameInput = page.locator('input#companyName');
    await expect(companyNameInput).toBeVisible();

    const companyNameValue = await companyNameInput.inputValue();
    console.log('\n=== Company Name Input Value ===');
    console.log('Value:', companyNameValue);

    if (!companyNameValue || companyNameValue === '') {
      console.log('\n❌ FAILURE: Company name field is EMPTY!');
      console.log('This means vendor.name is not populated');
      throw new Error('Company name field is empty - data mapping failed');
    }

    console.log('✓ Company name field is populated:', companyNameValue);

    // Get original database value
    const { stdout: beforeUpdate } = await execAsync(
      `sqlite3 /home/edwin/development/ptnextjs/payload.db "SELECT company_name, description, updated_at FROM vendors WHERE user_id = 21"`
    );
    console.log('\n=== Database BEFORE Update ===');
    console.log(beforeUpdate.trim());

    // Edit description to trigger a save
    const newDescription = `Test save at ${Date.now()}`;
    await page.fill('textarea#description', newDescription);

    // Wait a moment for the form to register the change
    await page.waitForTimeout(500);

    // Check validation state
    const validationLogs = consoleLogs.filter(log =>
      log.includes('[BasicInfoForm] Validation State')
    );
    console.log('\n=== Validation State Logs (last 3) ===');
    validationLogs.slice(-3).forEach(log => console.log(log));

    // Click save
    console.log('\nClicking Save button...');
    await page.click('button:has-text("Save")');

    // Wait for save to complete (look for success message or button state change)
    await page.waitForTimeout(3000);

    // Check for any error messages
    const errorMessages = await page.locator('[role="alert"]').count();
    if (errorMessages > 0) {
      const errorText = await page.locator('[role="alert"]').first().textContent();
      console.log('\n❌ ERROR MESSAGE FOUND:', errorText);
    }

    // Get updated database value
    const { stdout: afterUpdate } = await execAsync(
      `sqlite3 /home/edwin/development/ptnextjs/payload.db "SELECT company_name, description, updated_at FROM vendors WHERE user_id = 21"`
    );
    console.log('\n=== Database AFTER Update ===');
    console.log(afterUpdate.trim());

    // Parse the results
    const beforeParts = beforeUpdate.trim().split('|');
    const afterParts = afterUpdate.trim().split('|');

    const beforeDescription = beforeParts[1];
    const afterDescription = afterParts[1];
    const beforeTimestamp = beforeParts[2];
    const afterTimestamp = afterParts[2];

    console.log('\n=== Comparison ===');
    console.log('Before description:', beforeDescription);
    console.log('After description:', afterDescription);
    console.log('Before timestamp:', beforeTimestamp);
    console.log('After timestamp:', afterTimestamp);

    // Verify the save actually happened
    if (afterDescription === beforeDescription && afterTimestamp === beforeTimestamp) {
      console.log('\n❌ SAVE FAILED: Database was NOT updated!');
      console.log('Description unchanged:', afterDescription);
      console.log('Timestamp unchanged:', afterTimestamp);

      // Check console logs for errors
      const errorLogs = consoleLogs.filter(log =>
        log.toLowerCase().includes('error') ||
        log.includes('failed') ||
        log.includes('validation failed')
      );
      console.log('\n=== Error Logs ===');
      errorLogs.forEach(log => console.log(log));

      throw new Error('Save operation failed - database not updated');
    }

    console.log('\n✅ SUCCESS: Database was updated!');
    expect(afterDescription).toBe(newDescription);
    expect(afterTimestamp).not.toBe(beforeTimestamp);
  });
});
