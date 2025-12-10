import { test, expect, Page } from '@playwright/test';
import { seedVendors } from '../helpers/seed-api-helpers';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

async function loginAsVendor(page: Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/vendor/login/`);
  await page.getByPlaceholder('vendor@example.com').fill(email);
  await page.getByPlaceholder(/password/i).fill(password);
  // Use Promise.all to click button and wait for response simultaneously
  await Promise.all([
    page.waitForResponse(
      (r) => r.url().includes('/api/auth/login') && r.status() === 200,
      { timeout: 15000 }
    ),
    page.click('button:has-text("Login")'),
  ]);
  await page.waitForURL(/\/vendor\/dashboard\/?/, { timeout: 15000 });
}

test.describe('TIER-UPGRADE-VENDOR-P3: Vendor Tier Upgrade Request Workflow', () => {
  test.setTimeout(120000);
  // Run tests serially to avoid rate limit interference
  test.describe.configure({ mode: 'serial' });

  // Clear rate limits before each test
  test.beforeEach(async ({ request }) => {
    await request.post(`${BASE_URL}/api/test/rate-limit/clear`);
  });

  test('Test 1: View Tier Comparison on Subscription Page', async ({ page }) => {
    const vendorData = { companyName: `Tier Comparison ${Date.now()}`, email: `tier-comparison-${Date.now()}@test.example.com`, password: 'TierComparison123!@#', tier: 'free' as const, status: 'approved' as const };
    const vendorIds = await seedVendors(page, [vendorData]);
    expect(vendorIds[0]).toBeTruthy();
    await loginAsVendor(page, vendorData.email, vendorData.password);
    await page.goto(`${BASE_URL}/vendor/dashboard/subscription/`);
    await page.waitForLoadState('networkidle');
    // Wait for loading spinner to disappear
    await page.locator('text=/Loading subscription/i').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    // Check for various subscription page elements that indicate content loaded
    const hasComparison = await page.locator('text=/tier.*comparison|pricing|current plan|subscription/i').first().isVisible({ timeout: 5000 }).catch(() => false);
    const hasTiers = (await page.locator('text=/tier [0-9]|tier[0-9]|free tier|upgrade/i').count()) > 0;
    expect([hasComparison, hasTiers].some(v => v === true)).toBe(true);
  });

  test('Test 2: Submit Tier Upgrade Request with Notes', async ({ page }) => {
    const vendorData = { companyName: `Submit Upgrade ${Date.now()}`, email: `submit-upgrade-${Date.now()}@test.example.com`, password: 'SubmitUpgrade123!@#', tier: 'free' as const, status: 'approved' as const };
    const vendorIds = await seedVendors(page, [vendorData]);
    const vendorId = vendorIds[0];
    await loginAsVendor(page, vendorData.email, vendorData.password);
    const resp = await page.request.post(`${BASE_URL}/api/portal/vendors/${vendorId}/tier-upgrade-request`, { data: { requestedTier: 'tier1', vendorNotes: 'Scaling operations to meet growing demand and expand services' } });
    expect(resp.status()).toBe(201);
    const data = await resp.json();
    expect(data.success).toBe(true);
    expect(data.data.requestedTier).toBe('tier1');
  });

  test('Test 3: View Request Status', async ({ page }) => {
    const vendorData = { companyName: `View Status ${Date.now()}`, email: `view-status-${Date.now()}@test.example.com`, password: 'ViewStatus123!@#', tier: 'free' as const, status: 'approved' as const };
    const vendorIds = await seedVendors(page, [vendorData]);
    const vendorId = vendorIds[0];
    await loginAsVendor(page, vendorData.email, vendorData.password);
    await page.request.post(`${BASE_URL}/api/portal/vendors/${vendorId}/tier-upgrade-request`, { data: { requestedTier: 'tier1', vendorNotes: 'Testing upgrade request process for verification' } });
    const getResp = await page.request.get(`${BASE_URL}/api/portal/vendors/${vendorId}/tier-upgrade-request`);
    expect(getResp.ok()).toBe(true);
    const data = await getResp.json();
    expect(data.data.status).toBe('pending');
  });

  test('Test 4: Cancel Pending Request', async ({ page }) => {
    const vendorData = { companyName: `Cancel Request ${Date.now()}`, email: `cancel-request-${Date.now()}@test.example.com`, password: 'CancelRequest123!@#', tier: 'free' as const, status: 'approved' as const };
    const vendorIds = await seedVendors(page, [vendorData]);
    const vendorId = vendorIds[0];
    await loginAsVendor(page, vendorData.email, vendorData.password);
    const createResp = await page.request.post(`${BASE_URL}/api/portal/vendors/${vendorId}/tier-upgrade-request`, { data: { requestedTier: 'tier1' } });
    expect(createResp.status()).toBe(201);
    const createData = await createResp.json();
    const requestId = createData.data.id;
    expect(requestId).toBeTruthy();
    const deleteResp = await page.request.delete(`${BASE_URL}/api/portal/vendors/${vendorId}/tier-upgrade-request/${requestId}`);
    if (!deleteResp.ok()) {
      console.error(`Delete failed with status ${deleteResp.status()}: ${await deleteResp.text()}`);
    }
    expect(deleteResp.ok()).toBe(true);
  });

  test('Test 5: Duplicate Request Prevention (409 Error)', async ({ page }) => {
    const vendorData = { companyName: `Duplicate Test ${Date.now()}`, email: `duplicate-test-${Date.now()}@test.example.com`, password: 'DuplicateTest123!@#', tier: 'free' as const, status: 'approved' as const };
    const vendorIds = await seedVendors(page, [vendorData]);
    const vendorId = vendorIds[0];
    await loginAsVendor(page, vendorData.email, vendorData.password);
    await page.request.post(`${BASE_URL}/api/portal/vendors/${vendorId}/tier-upgrade-request`, { data: { requestedTier: 'tier1' } });
    const secondResp = await page.request.post(`${BASE_URL}/api/portal/vendors/${vendorId}/tier-upgrade-request`, { data: { requestedTier: 'tier2' } });
    expect(secondResp.status()).toBe(409);
    const data = await secondResp.json();
    expect(data.error).toContain('DUPLICATE');
  });

  test('Test 6: Form Validation - Required Fields', async ({ page }) => {
    const vendorData = { companyName: `Validation Test ${Date.now()}`, email: `validation-test-${Date.now()}@test.example.com`, password: 'ValidationTest123!@#', tier: 'free' as const, status: 'approved' as const };
    const vendorIds = await seedVendors(page, [vendorData]);
    const vendorId = vendorIds[0];
    await loginAsVendor(page, vendorData.email, vendorData.password);
    const missingResp = await page.request.post(`${BASE_URL}/api/portal/vendors/${vendorId}/tier-upgrade-request`, { data: {} });
    expect(missingResp.status()).toBe(400);
    const data = await missingResp.json();
    expect(data.error).toContain('VALIDATION');
  });

  test('Test 7: Authentication Required', async ({ page }) => {
    const vendorData = { companyName: `Auth Test ${Date.now()}`, email: `auth-test-${Date.now()}@test.example.com`, password: 'AuthTest123!@#', tier: 'free' as const, status: 'approved' as const };
    const vendorIds = await seedVendors(page, [vendorData]);
    const vendorId = vendorIds[0];
    const unauthResp = await page.request.post(`${BASE_URL}/api/portal/vendors/${vendorId}/tier-upgrade-request`, { data: { requestedTier: 'tier1' } });
    expect(unauthResp.status()).toBe(401);
  });
});
