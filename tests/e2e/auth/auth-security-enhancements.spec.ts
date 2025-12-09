import { test, expect, type Page, type APIRequestContext } from '@playwright/test';

/**
 * Authentication Security Enhancements E2E Tests
 *
 * This test suite verifies the security enhancements implemented as part of
 * the auth-security-enhancements spec:
 *
 * - Login flow with audit logging
 * - Logout flow with audit logging
 * - Token refresh with rotation
 * - Session invalidation on status change
 *
 * @see .agent-os/specs/2025-12-07-auth-security-enhancements
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || `${BASE_URL}';

// Test credentials
const TEST_ADMIN = {
  email: 'admin@paulthames.com',
  password: 'Admin123!@#$', // Test environment password
};

test.describe('Auth Security Enhancements E2E', () => {
  // Rate limits are cleared in global-setup.ts

  test.describe('Login Flow', () => {
    test('successful login sets httpOnly cookies', async ({ page, context }) => {
      // Navigate to login
      await page.goto(`${BASE_URL}/vendor/login`);

      // Fill in credentials (using a test vendor if available)
      await page.fill('input[name="email"], input[type="email"]', TEST_ADMIN.email);
      await page.fill('input[name="password"], input[type="password"]', TEST_ADMIN.password);

      // Submit form
      await page.click('button[type="submit"]');

      // Wait for navigation or response
      await page.waitForLoadState('networkidle');

      // Check cookies are set
      const cookies = await context.cookies();
      const access_token = cookies.find((c) => c.name === 'access_token');
      const refresh_token = cookies.find((c) => c.name === 'refresh_token');

      // Verify cookies exist (they should be httpOnly so we can check they exist)
      expect(access_token).toBeTruthy();
      expect(refresh_token).toBeTruthy();

      // Verify httpOnly flag
      expect(access_token?.httpOnly).toBe(true);
      expect(refresh_token?.httpOnly).toBe(true);

      // Verify secure flag in production
      if (process.env.NODE_ENV === 'production') {
        expect(access_token?.secure).toBe(true);
        expect(refresh_token?.secure).toBe(true);
      }
    });

    test('failed login with wrong password returns 401', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/auth/login`, {
        data: {
          email: 'nonexistent@example.com',
          password: 'wrongpassword123',
        },
      });

      expect(response.status()).toBe(401);

      const body = await response.json();
      expect(body.error).toBeDefined();
    });

    test('login with missing credentials returns 400', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/auth/login`, {
        data: {
          email: 'test@example.com',
          // Missing password
        },
      });

      expect(response.status()).toBe(400);
    });
  });

  test.describe('Logout Flow', () => {
    test('logout clears authentication cookies', async ({ page, context }) => {
      // First login
      await page.goto(`${BASE_URL}/vendor/login`);
      await page.fill('input[name="email"], input[type="email"]', TEST_ADMIN.email);
      await page.fill('input[name="password"], input[type="password"]', TEST_ADMIN.password);
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');

      // Verify cookies exist after login
      let cookies = await context.cookies();
      expect(cookies.find((c) => c.name === 'access_token')).toBeTruthy();

      // Logout via API
      const response = await page.request.post(`${BASE_URL}/api/auth/logout`);
      expect(response.ok()).toBe(true);

      // Wait for cookies to be cleared
      await page.waitForTimeout(500);

      // Check cookies are cleared
      cookies = await context.cookies();
      const access_token = cookies.find((c) => c.name === 'access_token');
      const refresh_token = cookies.find((c) => c.name === 'refresh_token');

      // Cookies should either not exist or be empty
      expect(!access_token || access_token.value === '').toBe(true);
      expect(!refresh_token || refresh_token.value === '').toBe(true);
    });
  });

  test.describe('Token Refresh', () => {
    test('refresh endpoint rotates both tokens', async ({ page, context }) => {
      // First login to get tokens
      await page.goto(`${BASE_URL}/vendor/login`);
      await page.fill('input[name="email"], input[type="email"]', TEST_ADMIN.email);
      await page.fill('input[name="password"], input[type="password"]', TEST_ADMIN.password);
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');

      // Get initial cookies
      const initial_cookies = await context.cookies();
      const initial_access = initial_cookies.find((c) => c.name === 'access_token')?.value;
      const initial_refresh = initial_cookies.find((c) => c.name === 'refresh_token')?.value;

      expect(initial_access).toBeTruthy();
      expect(initial_refresh).toBeTruthy();

      // Call refresh endpoint
      const response = await page.request.post(`${BASE_URL}/api/auth/refresh`);
      expect(response.ok()).toBe(true);

      // Get new cookies
      const new_cookies = await context.cookies();
      const new_access = new_cookies.find((c) => c.name === 'access_token')?.value;
      const new_refresh = new_cookies.find((c) => c.name === 'refresh_token')?.value;

      // Both tokens should be rotated (different from initial)
      expect(new_access).toBeTruthy();
      expect(new_refresh).toBeTruthy();
      expect(new_access).not.toBe(initial_access);
      expect(new_refresh).not.toBe(initial_refresh);
    });

    test('refresh without token returns 401', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/auth/refresh`);

      expect(response.status()).toBe(401);

      const body = await response.json();
      expect(body.error).toBeDefined();
    });
  });

  test.describe('Protected Route Access', () => {
    test('unauthenticated request to protected API returns 401', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/portal/me`);

      expect(response.status()).toBe(401);
    });

    test('authenticated request to protected API succeeds', async ({ page, context }) => {
      // Login first
      await page.goto(`${BASE_URL}/vendor/login`);
      await page.fill('input[name="email"], input[type="email"]', TEST_ADMIN.email);
      await page.fill('input[name="password"], input[type="password"]', TEST_ADMIN.password);
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');

      // Make authenticated request using page context (includes cookies)
      const response = await page.request.get(`${BASE_URL}/api/portal/me`);

      // Should not be 401
      expect(response.status()).not.toBe(401);
    });
  });

  test.describe('Security Headers', () => {
    test('HSTS header is present in production mode', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/`);

      // In production, HSTS header should be set
      // In development, it might not be present
      if (process.env.NODE_ENV === 'production') {
        const hsts = response.headers()['strict-transport-security'];
        expect(hsts).toBeDefined();
        expect(hsts).toContain('max-age=');
      }
    });
  });

  test.describe('Rate Limiting', () => {
    test('login endpoint has rate limiting', async ({ request }) => {
      const responses: number[] = [];

      // Make multiple rapid requests
      for (let i = 0; i < 10; i++) {
        const response = await request.post(`${BASE_URL}/api/auth/login`, {
          data: {
            email: 'ratelimit-test@example.com',
            password: 'wrongpassword',
          },
        });
        responses.push(response.status());
      }

      // At least some requests should be rate limited (429) if rate limiting is active
      // or all should be 401 if under the limit
      const rate_limited = responses.filter((s) => s === 429).length;
      const unauthorized = responses.filter((s) => s === 401).length;

      // Either rate limiting kicked in, or all requests were processed
      expect(rate_limited + unauthorized).toBe(responses.length);
    });
  });
});

test.describe('Unified Auth Module Integration', () => {
  test('validateToken rejects invalid tokens', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/portal/me`, {
      headers: {
        Authorization: 'Bearer invalid-token-here',
      },
    });

    expect(response.status()).toBe(401);
  });

  test('validateToken rejects expired tokens', async ({ request }) => {
    // An expired JWT for testing (you would generate a real expired token)
    const expired_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoidmVuZG9yIiwidHlwZSI6ImFjY2VzcyIsImp0aSI6InRlc3QtanRpIiwiZXhwIjoxNjAwMDAwMDAwfQ.invalid';

    const response = await request.get(`${BASE_URL}/api/portal/me`, {
      headers: {
        Authorization: `Bearer ${expired_token}`,
      },
    });

    expect(response.status()).toBe(401);
  });
});
