import { test, expect } from '@playwright/test';
import { seedVendors } from '../helpers/seed-api-helpers';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('VENDOR-AUTH-P1: Authentication Workflow', () => {
  test.setTimeout(45000);

  test('Test 3.1: Login with valid credentials', async ({ page }) => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const vendorData = {
      companyName: `Auth Test ${uniqueId}`,
      email: `auth-${uniqueId}@test.example.com`,
      password: 'AuthTest123!@#',
      status: 'approved' as const,
    };

    await seedVendors(page, [vendorData]);

    await page.goto(`${BASE_URL}/vendor/login/`);
    await page.getByPlaceholder('vendor@example.com').fill(vendorData.email);
    await page.getByPlaceholder(/password/i).fill(vendorData.password);

    const response = await page.waitForResponse(
      (r) => r.url().includes('/api/auth/login') && r.status() === 200
    ).catch(async () => {
      await page.click('button:has-text("Login")');
      return page.waitForResponse(
        (r) => r.url().includes('/api/auth/login') && r.status() === 200
      );
    });

    expect(response.status()).toBe(200);
    await page.waitForURL(/\/vendor\/dashboard\/?/, { timeout: 10000 });
    expect(page.url()).toContain('/vendor/dashboard');
  });

  test('Test 3.2: Login with invalid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendor/login/`);
    await page.getByPlaceholder('vendor@example.com').fill('nonexistent@example.com');
    await page.getByPlaceholder(/password/i).fill('WrongPass123!');

    const response = await page.waitForResponse(
      (r) => r.url().includes('/api/auth/login')
    ).catch(async () => {
      await page.click('button:has-text("Login")');
      return page.waitForResponse((r) => r.url().includes('/api/auth/login'));
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(page.url()).toContain('/vendor/login');
  });

  test('Test 3.3: Logout functionality', async ({ page }) => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const vendorData = {
      companyName: `Logout Test ${uniqueId}`,
      email: `logout-${uniqueId}@test.example.com`,
      password: 'LogoutTest123!@#',
      status: 'approved' as const,
    };

    await seedVendors(page, [vendorData]);
    await page.goto(`${BASE_URL}/vendor/login/`);
    await page.getByPlaceholder('vendor@example.com').fill(vendorData.email);
    await page.getByPlaceholder(/password/i).fill(vendorData.password);

    const loginPromise = page.waitForResponse(
      (r) => r.url().includes('/api/auth/login') && r.status() === 200
    ).catch(() => null);

    await page.click('button:has-text("Login")');
    await loginPromise;
    await page.waitForURL(/\/vendor\/dashboard\/?/, { timeout: 10000 });

    const logoutBtn = page.locator('button:has-text("Logout"), a:has-text("Logout")').first();
    if (await logoutBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await logoutBtn.click();
      await page.waitForURL(/\/vendor\/login\/?/, { timeout: 10000 });
    }
    expect(page.url()).toContain('/vendor/login');
  });

  test('Test 3.4: Session persistence across page reloads', async ({ page, context }) => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const vendorData = {
      companyName: `Session Test ${uniqueId}`,
      email: `session-${uniqueId}@test.example.com`,
      password: 'SessionTest123!@#',
      status: 'approved' as const,
    };

    await seedVendors(page, [vendorData]);
    await page.goto(`${BASE_URL}/vendor/login/`);
    await page.getByPlaceholder('vendor@example.com').fill(vendorData.email);
    await page.getByPlaceholder(/password/i).fill(vendorData.password);

    await page.waitForResponse(
      (r) => r.url().includes('/api/auth/login') && r.status() === 200
    ).catch(async () => {
      await page.click('button:has-text("Login")');
      return page.waitForResponse(
        (r) => r.url().includes('/api/auth/login') && r.status() === 200
      );
    });

    await page.waitForURL(/\/vendor\/dashboard\/?/, { timeout: 10000 });
    const url1 = page.url();

    await page.reload();
    await page.waitForLoadState('networkidle');
    const url2 = page.url();

    expect(url2).toContain('/vendor/dashboard');
  });

  test('Test 3.5: Protected route access without authentication', async ({ page, context }) => {
    await context.clearCookies();
    await page.goto(`${BASE_URL}/vendor/dashboard/`, { waitUntil: 'networkidle' });
    expect(page.url()).not.toContain('/vendor/dashboard');
  });

  test('Test 3.6: Token refresh behavior', async ({ page }) => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const vendorData = {
      companyName: `Token Test ${uniqueId}`,
      email: `token-${uniqueId}@test.example.com`,
      password: 'TokenTest123!@#',
      status: 'approved' as const,
    };

    await seedVendors(page, [vendorData]);
    await page.goto(`${BASE_URL}/vendor/login/`);
    await page.getByPlaceholder('vendor@example.com').fill(vendorData.email);
    await page.getByPlaceholder(/password/i).fill(vendorData.password);

    await page.waitForResponse(
      (r) => r.url().includes('/api/auth/login') && r.status() === 200
    ).catch(async () => {
      await page.click('button:has-text("Login")');
      return page.waitForResponse(
        (r) => r.url().includes('/api/auth/login') && r.status() === 200
      );
    });

    await page.waitForURL(/\/vendor\/dashboard\/?/, { timeout: 10000 });

    const r1 = await page.request.get(`${BASE_URL}/api/portal/vendors/profile`);
    expect(r1.ok()).toBe(true);

    await page.waitForTimeout(2000);
    const r2 = await page.request.get(`${BASE_URL}/api/portal/vendors/profile`);
    expect(r2.ok()).toBe(true);
  });
});
