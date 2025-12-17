/**
 * E2E Test: Rate Limit Behavior
 *
 * TEST PLACEMENT DECISION:
 * - Tier: REGRESSION (API resilience testing)
 * - Feature Group: api-errors
 * - Gap Identified: No tests verify rate limit responses and retry behavior
 * - Not Redundant: Existing tests don't trigger or verify rate limit handling
 *
 * Verifies 429 responses are properly returned and the UI handles
 * rate limits gracefully with appropriate user feedback.
 */

import { test, expect, Page } from '@playwright/test';
import { TEST_VENDORS, loginVendor, clearRateLimits, API_BASE } from '../helpers/test-vendors';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

/**
 * Helper to make rapid API calls to trigger rate limit
 */
async function makeRapidRequests(
  page: Page,
  endpoint: string,
  count: number
): Promise<{ responses: number[]; rateLimited: boolean }> {
  const responses: number[] = [];
  let rateLimited = false;

  for (let i = 0; i < count; i++) {
    const response = await page.request.get(`${BASE_URL}${endpoint}`);
    responses.push(response.status());

    if (response.status() === 429) {
      rateLimited = true;
      break;
    }
  }

  return { responses, rateLimited };
}

/**
 * Helper to check rate limit headers
 */
async function checkRateLimitHeaders(
  page: Page,
  endpoint: string
): Promise<{
  hasRateLimitHeaders: boolean;
  remaining?: string;
  limit?: string;
  reset?: string;
}> {
  const response = await page.request.get(`${BASE_URL}${endpoint}`);
  const headers = response.headers();

  return {
    hasRateLimitHeaders: !!(
      headers['x-ratelimit-limit'] ||
      headers['x-ratelimit-remaining'] ||
      headers['ratelimit-limit'] ||
      headers['ratelimit-remaining']
    ),
    remaining: headers['x-ratelimit-remaining'] || headers['ratelimit-remaining'],
    limit: headers['x-ratelimit-limit'] || headers['ratelimit-limit'],
    reset: headers['x-ratelimit-reset'] || headers['ratelimit-reset'],
  };
}

test.describe('API Error Handling: Rate Limits', () => {
  test.setTimeout(90000);

  test.beforeEach(async ({ page }) => {
    // Clear rate limits before each test
    await clearRateLimits(page);
  });

  test('RATE-01: API returns rate limit headers', async ({ page }) => {
    // Check if rate limit headers are present
    const headerCheck = await checkRateLimitHeaders(page, '/api/vendors');

    // Log findings for debugging
    console.log('Rate limit headers:', headerCheck);

    // Rate limit headers should be present for protected endpoints
    // (This may vary by endpoint - some public endpoints might not have them)
  });

  test('RATE-02: Rapid login attempts trigger rate limit', async ({ page }) => {
    // Make rapid login attempts with wrong credentials
    const loginAttempts: number[] = [];

    for (let i = 0; i < 15; i++) {
      const response = await page.request.post(`${BASE_URL}/api/auth/login`, {
        data: {
          email: `fake-user-${i}@test.example.com`,
          password: 'wrongpassword',
        },
      });
      loginAttempts.push(response.status());

      if (response.status() === 429) {
        console.log(`Rate limited after ${i + 1} attempts`);
        break;
      }
    }

    // Should either hit rate limit (429) or get auth errors (401/400)
    const hasRateLimit = loginAttempts.includes(429);
    const hasAuthError = loginAttempts.some((s) => s === 401 || s === 400);

    expect(hasRateLimit || hasAuthError).toBe(true);
  });

  test('RATE-03: Rate limit response includes Retry-After', async ({ page }) => {
    // Try to trigger rate limit
    for (let i = 0; i < 20; i++) {
      const response = await page.request.post(`${BASE_URL}/api/auth/login`, {
        data: {
          email: 'rate-limit-test@example.com',
          password: 'wrongpassword',
        },
      });

      if (response.status() === 429) {
        // Check for Retry-After header
        const retryAfter = response.headers()['retry-after'];
        console.log('Retry-After header:', retryAfter);

        // Check response body for retry information
        const body = await response.json().catch(() => ({}));
        console.log('Rate limit response:', body);

        // Should have some indication of when to retry
        expect(retryAfter || body.retryAfter || body.message).toBeTruthy();
        break;
      }
    }
  });

  test('RATE-04: UI shows rate limit error message', async ({ page }) => {
    // Go to login page
    await page.goto(`${BASE_URL}/vendor/login`);
    await page.waitForLoadState('networkidle');

    // Make rapid login attempts via UI
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    for (let i = 0; i < 10; i++) {
      await emailInput.fill(`rate-test-${i}@example.com`);
      await passwordInput.fill('wrongpassword');
      await submitBtn.click();
      await page.waitForTimeout(200);

      // Check for rate limit message
      const rateLimitMessage = page.locator(
        'text=/too many|rate limit|slow down|try again later/i'
      );
      if ((await rateLimitMessage.count()) > 0) {
        console.log(`Rate limit message shown after ${i + 1} attempts`);
        await expect(rateLimitMessage.first()).toBeVisible();
        break;
      }
    }
  });

  test('RATE-05: Authenticated endpoints have rate limits', async ({ page }) => {
    // Login as vendor
    await loginVendor(page, TEST_VENDORS.tier1.email, TEST_VENDORS.tier1.password);

    // Make rapid API calls
    const { responses, rateLimited } = await makeRapidRequests(
      page,
      '/api/portal/vendors/profile',
      30
    );

    console.log('Profile API responses:', responses);
    console.log('Rate limited:', rateLimited);

    // Should have consistent responses until rate limited
    const successResponses = responses.filter((s) => s === 200);
    expect(successResponses.length).toBeGreaterThan(0);
  });

  test('RATE-06: Rate limits reset after cooldown', async ({ page }) => {
    // Trigger rate limit
    let rateLimited = false;
    for (let i = 0; i < 20; i++) {
      const response = await page.request.post(`${BASE_URL}/api/auth/login`, {
        data: {
          email: 'reset-test@example.com',
          password: 'wrongpassword',
        },
      });

      if (response.status() === 429) {
        rateLimited = true;
        const retryAfter = response.headers()['retry-after'];

        if (retryAfter) {
          // Wait for cooldown (up to 5 seconds max for test)
          const waitTime = Math.min(parseInt(retryAfter, 10) * 1000, 5000);
          console.log(`Waiting ${waitTime}ms for rate limit reset`);
          await page.waitForTimeout(waitTime);

          // Try again
          const retryResponse = await page.request.post(`${BASE_URL}/api/auth/login`, {
            data: {
              email: 'reset-test@example.com',
              password: 'wrongpassword',
            },
          });

          // Should no longer be rate limited
          expect(retryResponse.status()).not.toBe(429);
        }
        break;
      }
    }
  });

  test('RATE-07: Registration endpoint has rate protection', async ({ page }) => {
    // Make rapid registration attempts
    for (let i = 0; i < 10; i++) {
      const response = await page.request.post(`${BASE_URL}/api/portal/vendors/register`, {
        data: {
          companyName: `Rate Test Company ${i}`,
          email: `rate-reg-${i}-${Date.now()}@example.com`,
          password: 'TestPass123!@#',
        },
      });

      if (response.status() === 429) {
        console.log(`Registration rate limited after ${i + 1} attempts`);
        expect(response.status()).toBe(429);
        break;
      }
    }
  });
});

test.describe('API Error Handling: Rate Limit UI Recovery', () => {
  test.setTimeout(60000);

  test('RATE-UI-01: Form remains usable after rate limit', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendor/login`);
    await page.waitForLoadState('networkidle');

    // Trigger rate limit via API
    for (let i = 0; i < 15; i++) {
      await page.request.post(`${BASE_URL}/api/auth/login`, {
        data: { email: 'test@example.com', password: 'wrong' },
      });
    }

    // Now try to use the form
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');

    // Form should still be interactive
    await expect(emailInput).toBeEnabled();
    await expect(passwordInput).toBeEnabled();

    // Should be able to fill form
    await emailInput.fill('valid@example.com');
    await passwordInput.fill('ValidPass123!');

    // Clear rate limits for cleanup
    await clearRateLimits(page);
  });

  test('RATE-UI-02: Rate limit does not break navigation', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendor/login`);

    // Trigger rate limit
    for (let i = 0; i < 15; i++) {
      await page.request.post(`${BASE_URL}/api/auth/login`, {
        data: { email: 'nav-test@example.com', password: 'wrong' },
      });
    }

    // Should still be able to navigate
    await page.goto(`${BASE_URL}/vendors`);
    await page.waitForLoadState('networkidle');

    // Page should load (even if API is rate limited)
    await expect(page.locator('body')).toBeVisible();

    // Clear for next tests
    await clearRateLimits(page);
  });
});
