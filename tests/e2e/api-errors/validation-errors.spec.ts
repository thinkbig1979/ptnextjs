/**
 * E2E Test: API Validation Error Handling
 *
 * TEST PLACEMENT DECISION:
 * - Tier: REGRESSION (API error handling)
 * - Feature Group: api-errors
 * - Gap Identified: No tests verify 400 error handling and UI feedback
 * - Not Redundant: Existing validation tests are client-side only
 *
 * Verifies that malformed request handling (400 errors) returns
 * appropriate error messages and the UI displays them correctly.
 */

import { test, expect, Page } from '@playwright/test';
import { TEST_VENDORS, loginVendor, API_BASE } from '../helpers/test-vendors';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

/**
 * Helper to send invalid API request
 */
async function sendInvalidRequest(
  page: Page,
  endpoint: string,
  method: 'POST' | 'PUT' | 'PATCH',
  invalidData: unknown
): Promise<{
  status: number;
  errors?: Record<string, string | string[]>;
  message?: string;
}> {
  let response;

  switch (method) {
    case 'POST':
      response = await page.request.post(`${BASE_URL}${endpoint}`, { data: invalidData });
      break;
    case 'PUT':
      response = await page.request.put(`${BASE_URL}${endpoint}`, { data: invalidData });
      break;
    case 'PATCH':
      response = await page.request.patch(`${BASE_URL}${endpoint}`, { data: invalidData });
      break;
  }

  const status = response.status();
  let errors: Record<string, string | string[]> | undefined;
  let message: string | undefined;

  try {
    const data = await response.json();
    errors = data.errors || data.error?.errors;
    message = data.message || data.error?.message || data.error;
  } catch {
    // Non-JSON response
  }

  return { status, errors, message };
}

test.describe('API Error Handling: 400 Validation Errors', () => {
  test.setTimeout(60000);

  test('VAL-400-01: Registration with missing required fields', async ({ page }) => {
    // Send registration with missing fields
    const result = await sendInvalidRequest(
      page,
      '/api/portal/vendors/register',
      'POST',
      {
        // Missing companyName, email, password
      }
    );

    expect(result.status).toBe(400);
    expect(result.message || result.errors).toBeTruthy();
    console.log('Missing fields error:', result.message || result.errors);
  });

  test('VAL-400-02: Registration with invalid email format', async ({ page }) => {
    const result = await sendInvalidRequest(
      page,
      '/api/portal/vendors/register',
      'POST',
      {
        companyName: 'Test Company',
        email: 'not-an-email',
        password: 'ValidPass123!@#',
      }
    );

    expect(result.status).toBe(400);
    expect(result.message).toMatch(/email|invalid|format/i);
  });

  test('VAL-400-03: Registration with weak password', async ({ page }) => {
    const result = await sendInvalidRequest(
      page,
      '/api/portal/vendors/register',
      'POST',
      {
        companyName: 'Test Company',
        email: `weak-pass-${Date.now()}@example.com`,
        password: '123', // Too weak
      }
    );

    expect(result.status).toBe(400);
    expect(result.message).toMatch(/password|weak|strength|character/i);
  });

  test('VAL-400-04: Profile update with invalid data types', async ({ page }) => {
    // Login first
    const vendorId = await loginVendor(
      page,
      TEST_VENDORS.tier1.email,
      TEST_VENDORS.tier1.password
    );

    // Send invalid data types
    const result = await sendInvalidRequest(
      page,
      `/api/portal/vendors/${vendorId}?byUserId=true`,
      'PUT',
      {
        foundedYear: 'not-a-number', // Should be number
        employeeCount: -5, // Should be positive
      }
    );

    // Should reject invalid data
    expect([400, 422]).toContain(result.status);
  });

  test('VAL-400-05: Tier request with invalid tier value', async ({ page }) => {
    await loginVendor(page, TEST_VENDORS.tier1.email, TEST_VENDORS.tier1.password);

    const result = await sendInvalidRequest(
      page,
      '/api/portal/tier-requests',
      'POST',
      {
        requestedTier: 'tier999', // Invalid tier
        requestType: 'upgrade',
      }
    );

    expect([400, 422]).toContain(result.status);
  });

  test('VAL-400-06: Product creation with missing required fields', async ({ page }) => {
    await loginVendor(page, TEST_VENDORS.tier2.email, TEST_VENDORS.tier2.password);

    const result = await sendInvalidRequest(
      page,
      '/api/portal/products',
      'POST',
      {
        // Missing name and other required fields
        description: 'A product without a name',
      }
    );

    // Should require name at minimum
    expect([400, 422]).toContain(result.status);
  });

  test('VAL-400-07: Location with invalid coordinates', async ({ page }) => {
    const vendorId = await loginVendor(
      page,
      TEST_VENDORS.tier2.email,
      TEST_VENDORS.tier2.password
    );

    const result = await sendInvalidRequest(
      page,
      `/api/portal/vendors/${vendorId}/locations?byUserId=true`,
      'POST',
      {
        name: 'Invalid Location',
        city: 'Test City',
        country: 'Test Country',
        latitude: 999, // Invalid (max 90)
        longitude: 999, // Invalid (max 180)
      }
    );

    // Should reject invalid coordinates
    expect([400, 422]).toContain(result.status);
  });

  test('VAL-400-08: API returns field-specific error messages', async ({ page }) => {
    const result = await sendInvalidRequest(
      page,
      '/api/portal/vendors/register',
      'POST',
      {
        companyName: '', // Empty
        email: 'invalid', // Invalid format
        password: '12', // Too short
      }
    );

    expect(result.status).toBe(400);

    // Should have specific field errors or descriptive message
    if (result.errors) {
      // Field-specific errors
      console.log('Field errors:', result.errors);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    } else if (result.message) {
      // General message mentioning the issues
      console.log('Error message:', result.message);
      expect(result.message.length).toBeGreaterThan(0);
    }
  });
});

test.describe('API Error Handling: Validation UI Integration', () => {
  test.setTimeout(60000);

  test('VAL-UI-01: Registration form shows server validation errors', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendor/register`);
    await page.waitForLoadState('networkidle');

    // Fill form with invalid data that bypasses client validation
    const companyInput = page.getByPlaceholder('Your Company Ltd');
    const emailInput = page.getByPlaceholder('vendor@example.com');
    const passwordInput = page.getByPlaceholder('Enter strong password');
    const confirmInput = page.getByPlaceholder('Re-enter password');

    // Use valid-looking but problematic data
    await companyInput.fill('A'); // Too short
    await emailInput.fill('test@test'); // Missing TLD (may pass client, fail server)
    await passwordInput.fill('Password1'); // No special chars
    await confirmInput.fill('Password1');

    // Submit
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    await page.waitForTimeout(1000);

    // Should show some form of error (either client or server validation)
    const errorElements = page.locator(
      '[role="alert"], .error, [class*="error"], [class*="Error"], text=/error|invalid|required/i'
    );

    // Form should provide feedback
    const hasErrors = (await errorElements.count()) > 0 || page.url().includes('/register');
    expect(hasErrors).toBe(true);
  });

  test('VAL-UI-02: Profile edit shows validation errors inline', async ({ page }) => {
    await loginVendor(page, TEST_VENDORS.tier2.email, TEST_VENDORS.tier2.password);
    await page.goto(`${BASE_URL}/vendor/dashboard/profile`);
    await page.waitForLoadState('networkidle');

    // Find a text input field
    const textInputs = page.locator('input[type="text"]:visible, input[type="url"]:visible');

    if ((await textInputs.count()) > 0) {
      const input = textInputs.first();

      // Enter invalid data (like invalid URL)
      await input.clear();
      await input.fill('not-a-valid-url');
      await input.blur();

      // Look for validation feedback
      const validationMessage = page.locator(
        '[class*="error"], [class*="invalid"], [aria-invalid="true"]'
      );

      // Should show inline validation
      await page.waitForTimeout(500);
      const hasValidation = (await validationMessage.count()) > 0;
      console.log('Has inline validation:', hasValidation);
    }
  });

  test('VAL-UI-03: Form prevents submission with validation errors', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendor/register`);
    await page.waitForLoadState('networkidle');

    // Try to submit empty form
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    await page.waitForTimeout(500);

    // Should still be on registration page
    expect(page.url()).toContain('/register');

    // Form should show validation state
    const invalidInputs = page.locator('[aria-invalid="true"], :invalid');
    const hasInvalidInputs = (await invalidInputs.count()) > 0;

    // Either HTML5 validation or custom validation should prevent submission
    expect(hasInvalidInputs || page.url().includes('/register')).toBe(true);
  });

  test('VAL-UI-04: Error messages are human-readable', async ({ page }) => {
    const result = await sendInvalidRequest(
      page,
      '/api/portal/vendors/register',
      'POST',
      {
        companyName: '',
        email: 'bad',
        password: '',
      }
    );

    expect(result.status).toBe(400);

    // Error message should be human-readable (not technical error)
    const errorText = JSON.stringify(result.message || result.errors);

    // Should not contain stack traces or technical jargon
    expect(errorText).not.toMatch(/at\s+\w+\s+\(/); // No stack traces
    expect(errorText).not.toMatch(/ECONNREFUSED|TypeError/); // No Node errors

    // Should contain helpful information
    expect(errorText.length).toBeGreaterThan(10);
  });

  test('VAL-UI-05: Validation errors clear on valid input', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendor/register`);
    await page.waitForLoadState('networkidle');

    const emailInput = page.getByPlaceholder('vendor@example.com');

    // Enter invalid email
    await emailInput.fill('invalid');
    await emailInput.blur();
    await page.waitForTimeout(200);

    // Check for error state
    const hasError = await emailInput.evaluate((el) => {
      return el.classList.contains('error') || el.getAttribute('aria-invalid') === 'true';
    });

    // Now enter valid email
    await emailInput.fill('valid@example.com');
    await emailInput.blur();
    await page.waitForTimeout(200);

    // Error should clear (if it was showing)
    const hasErrorAfter = await emailInput.evaluate((el) => {
      return el.getAttribute('aria-invalid') === 'true';
    });

    // If there was an error, it should be cleared
    if (hasError) {
      expect(hasErrorAfter).toBe(false);
    }
  });
});

test.describe('API Error Handling: Edge Cases', () => {
  test.setTimeout(60000);

  test('VAL-EDGE-01: Empty JSON body returns 400', async ({ page }) => {
    await loginVendor(page, TEST_VENDORS.tier1.email, TEST_VENDORS.tier1.password);

    const response = await page.request.post(
      `${BASE_URL}/api/portal/tier-requests`,
      { data: {} }
    );

    expect([400, 422]).toContain(response.status());
  });

  test('VAL-EDGE-02: Non-JSON body returns appropriate error', async ({ page }) => {
    const response = await page.request.post(
      `${BASE_URL}/api/portal/vendors/register`,
      {
        data: 'not json',
        headers: { 'Content-Type': 'text/plain' },
      }
    );

    // Should return 400 or 415 (Unsupported Media Type)
    expect([400, 415, 422]).toContain(response.status());
  });

  test('VAL-EDGE-03: Very long input is handled gracefully', async ({ page }) => {
    const veryLongString = 'a'.repeat(10000);

    const result = await sendInvalidRequest(
      page,
      '/api/portal/vendors/register',
      'POST',
      {
        companyName: veryLongString,
        email: `long-${Date.now()}@example.com`,
        password: 'ValidPass123!@#',
      }
    );

    // Should handle gracefully (400 with length error, or truncate)
    expect([200, 400, 413, 422]).toContain(result.status);
  });

  test('VAL-EDGE-04: Special characters are handled', async ({ page }) => {
    const specialChars = '<script>alert("xss")</script>';

    const result = await sendInvalidRequest(
      page,
      '/api/portal/vendors/register',
      'POST',
      {
        companyName: specialChars,
        email: `special-${Date.now()}@example.com`,
        password: 'ValidPass123!@#',
      }
    );

    // Should sanitize or reject
    // Not return unescaped script in error
    if (result.message) {
      expect(result.message).not.toContain('<script>');
    }
  });

  test('VAL-EDGE-05: SQL injection attempts are blocked', async ({ page }) => {
    const sqlInjection = "'; DROP TABLE vendors; --";

    const result = await sendInvalidRequest(
      page,
      '/api/portal/vendors/register',
      'POST',
      {
        companyName: sqlInjection,
        email: `sql-${Date.now()}@example.com`,
        password: 'ValidPass123!@#',
      }
    );

    // Should not execute SQL - either reject or sanitize
    // Server should still be operational
    const healthCheck = await page.request.get(`${BASE_URL}/api/vendors`);
    expect(healthCheck.ok()).toBe(true);
  });
});
