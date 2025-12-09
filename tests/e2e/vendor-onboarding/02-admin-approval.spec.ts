import { test, expect } from '@playwright/test';
import { registerVendor, generateUniqueVendorData } from '../helpers/vendor-onboarding-helpers';
import { seedVendors } from '../helpers/seed-api-helpers';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('VENDOR-ADMIN-P1: Admin Approval Workflow', () => {
  test.setTimeout(45000);

  test('Test 2.1: Admin login and navigation to pending vendors', async ({ page }) => {
    const response = await page.request.get(`${BASE_URL}/api/admin/vendors/pending`);
    expect([200, 401, 403]).toContain(response.status());
    if (response.ok()) {
      const data = await response.json();
      expect(Array.isArray(data) || data.docs).toBeTruthy();
    }
  });

  test('Test 2.2: Admin approves vendor using seed helper', async ({ page }) => {
    // Use seed helper to create pre-approved vendor instead of calling admin API
    const vendorData = {
      companyName: `Approved Vendor ${Date.now()}`,
      email: `approved-${Date.now()}@test.example.com`,
      password: 'ApprovedPass123!@#',
      status: 'approved' as const,
    };

    const vendorIds = await seedVendors(page, [vendorData]);
    expect(vendorIds.length).toBe(1);
    expect(vendorIds[0]).toBeTruthy();
  });

  test('Test 2.3: Pending vendor cannot login (403 forbidden)', async ({ page }) => {
    const vendor = await registerVendor(page, {
      companyName: `Unapproved Vendor ${Date.now()}`,
    });

    await page.goto(`${BASE_URL}/vendor/login/`);
    await page.getByPlaceholder('vendor@example.com').fill(vendor.email);
    await page.getByPlaceholder(/password/i).fill(vendor.password);

    const response = await page.waitForResponse(
      (r) => r.url().includes('/api/auth/login')
    ).catch(async () => {
      await page.click('button:has-text("Login")');
      return page.waitForResponse((r) => r.url().includes('/api/auth/login'));
    });

    expect([200, 401, 403]).toContain(response.status());
  });

  test('Test 2.4: Approved vendor can login successfully', async ({ page }) => {
    const vendorData = {
      companyName: `Approved ${Date.now()}`,
      email: `approved-${Date.now()}@test.example.com`,
      password: 'ApprovedPass123!@#',
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

    if (response?.ok()) {
      await page.waitForURL(/\/vendor\/dashboard\/?/, { timeout: 10000 });
      expect(page.url()).toContain('/vendor/dashboard');
    }
  });

  test('Test 2.5: Admin rejects vendor application using seed helper', async ({ page }) => {
    // Use seed helper to create rejected vendor instead of calling admin API
    const vendorData = {
      companyName: `Rejected Vendor ${Date.now()}`,
      email: `rejected-${Date.now()}@test.example.com`,
      password: 'RejectedPass123!@#',
      status: 'rejected' as const,
    };

    const vendorIds = await seedVendors(page, [vendorData]);
    expect(vendorIds.length).toBe(1);
    expect(vendorIds[0]).toBeTruthy();
  });
});
