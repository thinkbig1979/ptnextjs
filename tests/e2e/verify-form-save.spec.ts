import { test, expect } from '@playwright/test';

const TEST_VENDOR = {
  email: 'testvendor@example.com',
  password: '123',
};

test.describe('Verify Form Save Fix', () => {
  test('should successfully save BasicInfoForm changes', async ({ page }) => {
    // Track network requests
    const requests: any[] = [];
    const responses: any[] = [];

    page.on('request', req => {
      if (req.url().includes('/api/')) {
        requests.push({
          method: req.method(),
          url: req.url(),
          postData: req.postDataJSON(),
        });
      }
    });

    page.on('response', res => {
      if (res.url().includes('/api/')) {
        responses.push({
          url: res.url(),
          status: res.status(),
        });
      }
    });

    // Track console logs
    const consoleLogs: string[] = [];
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      }
    });

    console.log('Step 1: Navigate to login page');
    await page.goto(`${BASE_URL}/vendor/login`);
    await page.waitForLoadState('networkidle');

    console.log('Step 2: Login');
    await page.fill('input[type="email"]', TEST_VENDOR.email);
    await page.fill('input[type="password"]', TEST_VENDOR.password);
    await page.click('button[type="submit"]');

    console.log('Step 3: Wait for dashboard');
    await page.waitForURL('**/vendor/dashboard**', { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    console.log('Step 4: Navigate to Profile tab');
    await page.click('text=Profile');
    await page.waitForTimeout(2000); // Let form load

    console.log('Step 5: Check initial form state');
    const initialDescription = await page.inputValue('textarea[id="description"]');
    console.log('Initial description:', initialDescription);

    console.log('Step 6: Modify description to trigger isDirty');
    const newDescription = initialDescription + ' - Updated at ' + Date.now();
    await page.fill('textarea[id="description"]', newDescription);
    await page.waitForTimeout(500);

    console.log('Step 7: Check if Save button is enabled');
    const saveButton = page.locator('button[type="submit"]');
    const isDisabled = await saveButton.isDisabled();
    console.log('Save button disabled?', isDisabled);

    if (isDisabled) {
      console.error('[FAIL] FAILURE: Save button is still disabled after edit!');

      // Check validation state
      const validationLogs = consoleLogs.filter(log =>
        log.includes('Validation') || log.includes('error')
      );
      console.log('Validation logs:', validationLogs);

      throw new Error('Save button is disabled - validation may be failing');
    }

    console.log('Step 8: Clear request/response tracking arrays');
    requests.length = 0;
    responses.length = 0;

    console.log('Step 9: Click Save button');
    await saveButton.click();

    console.log('Step 10: Wait for save operation');
    await page.waitForTimeout(3000);

    console.log('\n=== RESULTS ===\n');

    // Check for validation errors in console
    const validationErrors = consoleLogs.filter(log =>
      log.includes('[BasicInfoForm] Validation failed')
    );

    if (validationErrors.length > 0) {
      console.error('[FAIL] VALIDATION ERRORS FOUND:');
      validationErrors.forEach(err => console.error(err));
    }

    // Check for handler execution
    const handlerLogs = consoleLogs.filter(log =>
      log.includes('[BasicInfoForm] handleFormSubmit') ||
      log.includes('[ProfileEditTabs] handleFormSave') ||
      log.includes('[VendorDashboardContext] saveVendor')
    );

    console.log('Handler execution logs:', handlerLogs.length);
    handlerLogs.forEach(log => console.log('  ', log));

    // Check for PUT requests
    const putRequests = requests.filter(r =>
      r.method === 'PUT' && r.url.includes('/api/portal/vendors/')
    );

    console.log('\nPUT Requests:', putRequests.length);
    putRequests.forEach(req => {
      console.log('  Method:', req.method);
      console.log('  URL:', req.url);
      console.log('  Data:', JSON.stringify(req.postData, null, 2));
    });

    // Check for PUT responses
    const putResponses = responses.filter(r =>
      r.url.includes('/api/portal/vendors/') && r.url.includes('/api/portal/vendors/2')
    );

    console.log('\nPUT Responses:', putResponses.length);
    putResponses.forEach(res => {
      console.log('  URL:', res.url);
      console.log('  Status:', res.status);
    });

    // Assertions
    console.log('\n=== ASSERTIONS ===\n');

    expect(validationErrors.length, '[FAIL] No validation errors should occur').toBe(0);
    expect(handlerLogs.length, '[OK] Handler should be called').toBeGreaterThan(0);
    expect(putRequests.length, '[OK] PUT request should be made').toBeGreaterThan(0);

    if (putResponses.length > 0) {
      expect(putResponses[0].status, '[OK] PUT should return 200').toBe(200);
    }

    console.log('[OK] ALL CHECKS PASSED!');
  });
});
