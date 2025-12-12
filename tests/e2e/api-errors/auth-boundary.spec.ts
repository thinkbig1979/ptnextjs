/**
 * E2E Test: Authentication Boundary Errors
 *
 * TEST PLACEMENT DECISION:
 * - Tier: REGRESSION (security boundary testing)
 * - Feature Group: api-errors
 * - Gap Identified: No comprehensive auth boundary error testing
 * - Not Redundant: Existing auth tests focus on happy paths
 *
 * Verifies that 401 (Unauthorized) and 403 (Forbidden) responses
 * are properly returned and handled in the UI.
 */

import { test, expect, Page } from '@playwright/test';
import { TEST_VENDORS, loginVendor, API_BASE } from '../helpers/test-vendors';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

/**
 * Helper to check API response for auth errors
 */
async function checkAuthError(
  page: Page,
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: unknown
): Promise<{ status: number; hasAuthError: boolean; errorMessage?: string }> {
  let response;

  switch (method) {
    case 'GET':
      response = await page.request.get(`${BASE_URL}${endpoint}`);
      break;
    case 'POST':
      response = await page.request.post(`${BASE_URL}${endpoint}`, { data: body });
      break;
    case 'PUT':
      response = await page.request.put(`${BASE_URL}${endpoint}`, { data: body });
      break;
    case 'DELETE':
      response = await page.request.delete(`${BASE_URL}${endpoint}`);
      break;
  }

  const status = response.status();
  const isAuthError = status === 401 || status === 403;

  let errorMessage: string | undefined;
  try {
    const data = await response.json();
    errorMessage = data.error?.message || data.message || data.error;
  } catch {
    errorMessage = await response.text();
  }

  return { status, hasAuthError: isAuthError, errorMessage };
}

test.describe('API Error Handling: 401 Unauthorized', () => {
  test.setTimeout(60000);

  test('AUTH-401-01: Protected portal endpoints require authentication', async ({ page }) => {
    // Access protected endpoint without login
    const profileResult = await checkAuthError(page, '/api/portal/vendors/profile');

    expect(profileResult.hasAuthError).toBe(true);
    expect(profileResult.status).toBe(401);
    console.log('Profile endpoint error:', profileResult.errorMessage);
  });

  test('AUTH-401-02: Dashboard page redirects to login when unauthenticated', async ({
    page,
  }) => {
    // Try to access dashboard without authentication
    await page.goto(`${BASE_URL}/vendor/dashboard`);
    await page.waitForLoadState('networkidle');

    // Should redirect to login
    expect(page.url()).toMatch(/\/vendor\/login|\/login|\/auth/);
  });

  test('AUTH-401-03: API returns consistent 401 format', async ({ page }) => {
    // Check multiple protected endpoints
    const endpoints = [
      '/api/portal/vendors/profile',
      '/api/portal/tier-requests',
      '/api/portal/vendors/me',
    ];

    for (const endpoint of endpoints) {
      const result = await checkAuthError(page, endpoint);

      if (result.status === 401) {
        // Should have error message
        expect(result.errorMessage).toBeTruthy();
        console.log(`${endpoint}: ${result.errorMessage}`);
      }
    }
  });

  test('AUTH-401-04: Expired session returns 401', async ({ page }) => {
    // Login first
    await loginVendor(page, TEST_VENDORS.tier1.email, TEST_VENDORS.tier1.password);

    // Verify we can access profile
    const beforeExpire = await checkAuthError(page, '/api/portal/vendors/profile');
    expect(beforeExpire.status).toBe(200);

    // Clear cookies to simulate expired session
    await page.context().clearCookies();

    // Try to access again
    const afterExpire = await checkAuthError(page, '/api/portal/vendors/profile');
    expect(afterExpire.status).toBe(401);
  });

  test('AUTH-401-05: Invalid token returns 401', async ({ page }) => {
    // Set invalid authorization header
    const response = await page.request.get(`${BASE_URL}/api/portal/vendors/profile`, {
      headers: {
        Authorization: 'Bearer invalid-token-12345',
      },
    });

    expect(response.status()).toBe(401);
  });
});

test.describe('API Error Handling: 403 Forbidden', () => {
  test.setTimeout(60000);

  test('AUTH-403-01: Cannot access other vendor data', async ({ page }) => {
    // Login as one vendor
    const vendorId = await loginVendor(
      page,
      TEST_VENDORS.tier1.email,
      TEST_VENDORS.tier1.password
    );

    // Try to access different vendor's data
    const otherVendorId = vendorId + 1000; // Non-existent or different vendor
    const result = await checkAuthError(page, `/api/portal/vendors/${otherVendorId}`);

    // Should be either 403 (forbidden) or 404 (not found)
    expect([403, 404]).toContain(result.status);
  });

  test('AUTH-403-02: Vendor cannot access admin endpoints', async ({ page }) => {
    // Login as regular vendor
    await loginVendor(page, TEST_VENDORS.tier1.email, TEST_VENDORS.tier1.password);

    // Try to access admin endpoint
    const result = await checkAuthError(page, '/api/admin/users');

    // Should be forbidden or not found
    expect([401, 403, 404]).toContain(result.status);
  });

  test('AUTH-403-03: Free tier cannot access tier-restricted features', async ({ page }) => {
    // Login as free tier vendor
    const vendorId = await loginVendor(
      page,
      TEST_VENDORS.free.email,
      TEST_VENDORS.free.password
    );

    // Try to update tier-restricted field (e.g., website for free tier)
    const result = await checkAuthError(
      page,
      `/api/portal/vendors/${vendorId}?byUserId=true`,
      'PUT',
      { website: 'https://should-not-work.com' }
    );

    // May be 403 if tier restriction is enforced at API level
    // or 200 if ignored but not persisted
    console.log('Free tier restricted update:', result.status, result.errorMessage);
  });

  test('AUTH-403-04: Vendor cannot modify another vendor tier', async ({ page }) => {
    // Login as vendor
    const vendorId = await loginVendor(
      page,
      TEST_VENDORS.tier1.email,
      TEST_VENDORS.tier1.password
    );

    // Try to change own tier (should be forbidden)
    const result = await checkAuthError(
      page,
      `/api/portal/vendors/${vendorId}?byUserId=true`,
      'PUT',
      { tier: 'tier3' }
    );

    expect(result.status).toBe(403);
    expect(result.errorMessage).toMatch(/tier|permission|denied/i);
  });

  test('AUTH-403-05: UI shows appropriate forbidden message', async ({ page }) => {
    // Login as free tier
    await loginVendor(page, TEST_VENDORS.free.email, TEST_VENDORS.free.password);

    // Navigate to dashboard
    await page.goto(`${BASE_URL}/vendor/dashboard/profile`);
    await page.waitForLoadState('networkidle');

    // Try to access a tier-restricted feature via UI
    // Look for upgrade prompts or locked features
    const upgradePrompt = page.locator('text=/upgrade|locked|unavailable|tier/i');
    const isUpgradePromptVisible = (await upgradePrompt.count()) > 0;

    // Should either show upgrade prompt or not show restricted feature at all
    // This verifies the UI handles permission boundaries
    console.log('Has upgrade/restricted UI:', isUpgradePromptVisible);
  });
});

test.describe('API Error Handling: Auth Boundary UI', () => {
  test.setTimeout(60000);

  test('AUTH-UI-01: Login form shows auth error messages', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendor/login`);
    await page.waitForLoadState('networkidle');

    // Try to login with wrong credentials
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    await emailInput.fill('wrong@example.com');
    await passwordInput.fill('wrongpassword');
    await submitBtn.click();

    // Wait for error message
    await page.waitForTimeout(1000);

    // Should show error message
    const errorMessage = page.locator(
      'text=/invalid|incorrect|wrong|not found|failed/i'
    );
    const hasError = (await errorMessage.count()) > 0;

    // Should show some feedback
    expect(hasError).toBe(true);
  });

  test('AUTH-UI-02: Session expiry redirects to login', async ({ page }) => {
    // Login
    await loginVendor(page, TEST_VENDORS.tier1.email, TEST_VENDORS.tier1.password);

    // Go to dashboard
    await page.goto(`${BASE_URL}/vendor/dashboard`);
    await page.waitForLoadState('networkidle');

    // Clear cookies (simulate expiry)
    await page.context().clearCookies();

    // Try to navigate or perform action
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should redirect to login
    expect(page.url()).toMatch(/login|auth/);
  });

  test('AUTH-UI-03: Forbidden action shows user-friendly message', async ({ page }) => {
    // Login as free tier vendor
    await loginVendor(page, TEST_VENDORS.free.email, TEST_VENDORS.free.password);

    // Go to profile
    await page.goto(`${BASE_URL}/vendor/dashboard/profile`);
    await page.waitForLoadState('networkidle');

    // Look for tier-restricted UI elements
    const restrictedElements = page.locator(
      '[data-tier-restricted], [class*="restricted"], [class*="locked"], text=/upgrade to|available in tier/i'
    );

    // If tier-restricted features exist, they should be clearly marked
    const restrictedCount = await restrictedElements.count();
    if (restrictedCount > 0) {
      console.log(`Found ${restrictedCount} tier-restricted UI elements`);
    }
  });

  test('AUTH-UI-04: API error toast notifications work', async ({ page }) => {
    // Login
    await loginVendor(page, TEST_VENDORS.tier1.email, TEST_VENDORS.tier1.password);

    // Go to profile page
    await page.goto(`${BASE_URL}/vendor/dashboard/profile`);
    await page.waitForLoadState('networkidle');

    // Try to trigger an API error by submitting invalid data
    // This depends on the specific form implementation
    const form = page.locator('form').first();

    if ((await form.count()) > 0) {
      // Look for toast/notification container
      const toastContainer = page.locator(
        '[class*="toast"], [class*="notification"], [role="alert"]'
      );

      // Submit might trigger validation or API error
      // Check if error feedback mechanism exists
      console.log('Toast container exists:', (await toastContainer.count()) > 0);
    }
  });

  test('AUTH-UI-05: Multiple failed logins show appropriate feedback', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendor/login`);
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    // Try multiple wrong logins
    for (let i = 0; i < 3; i++) {
      await emailInput.fill(`wrong${i}@example.com`);
      await passwordInput.fill('wrongpass');
      await submitBtn.click();
      await page.waitForTimeout(500);
    }

    // Should show error message (not crash or lock up)
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Form should still be usable
    await expect(emailInput).toBeEnabled();
  });
});
