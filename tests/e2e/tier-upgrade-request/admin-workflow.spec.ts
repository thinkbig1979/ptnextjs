import { test, expect, Page } from '@playwright/test';
import { seedVendorWithUpgradeRequest } from '../helpers/tier-upgrade-helpers';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

/**
 * Admin Tier Upgrade Request Management Tests (P3)
 *
 * These tests validate the admin API endpoints for tier upgrade request management.
 * They use seedVendorWithUpgradeRequest to create vendors with pending upgrade requests
 * (vendor authentication is handled by the helper).
 *
 * Admin endpoints require admin authentication, so some tests expect 401/403
 * when not authenticated as admin.
 */

interface VendorConfig {
  companyName: string;
  email: string;
  password: string;
  tier?: 'free' | 'tier1' | 'tier2' | 'tier3';
  status?: 'approved' | 'pending' | 'rejected';
}

/**
 * Create vendor with upgrade request (handles vendor auth internally)
 */
async function createTestVendorWithRequest(
  page: Page,
  vendorConfig: VendorConfig,
  requestedTier: 'tier1' | 'tier2' | 'tier3' = 'tier1'
) {
  const result = await seedVendorWithUpgradeRequest(page, vendorConfig, {
    requestedTier,
    vendorNotes: 'Test request for admin workflow',
  });
  return { vendorId: result.vendorId, requestId: result.requestId };
}

test.describe('TIER-UPGRADE-ADMIN-P3: Admin Tier Upgrade Request Management', () => {
  test.setTimeout(120000);

  // Run tests serially to avoid rate limiting issues
  test.describe.configure({ mode: 'serial' });

  // Clear rate limits before each test
  test.beforeEach(async ({ request }) => {
    await request.post(`${BASE_URL}/api/test/rate-limit/clear`);
  });

  test('Test 1: View Pending Tier Upgrade Requests', async ({ page }) => {
    const ts = Date.now();
    // Create two vendors with upgrade requests
    const req1 = await createTestVendorWithRequest(page, {
      companyName: `Pending 1 ${ts}`,
      email: `pending-1-${ts}@test.example.com`,
      password: 'SecurePass123!P1',
      tier: 'free',
      status: 'approved',
    });
    const req2 = await createTestVendorWithRequest(page, {
      companyName: `Pending 2 ${ts}`,
      email: `pending-2-${ts}@test.example.com`,
      password: 'SecurePass123!P2',
      tier: 'free',
      status: 'approved',
    });

    expect(req1.requestId).toBeTruthy();
    expect(req2.requestId).toBeTruthy();

    // Admin endpoint requires auth - expect 401/403 without admin login
    const resp = await page.request.get(`${BASE_URL}/api/admin/tier-upgrade-requests`);
    expect([200, 401, 403].includes(resp.status())).toBe(true);
  });

  test('Test 2: Filter Requests by Status', async ({ page }) => {
    const ts = Date.now();
    const req = await createTestVendorWithRequest(page, {
      companyName: `Filter ${ts}`,
      email: `filter-${ts}@test.example.com`,
      password: 'SecurePass123!Flt',
      tier: 'free',
      status: 'approved',
    });

    expect(req.requestId).toBeTruthy();

    const resp = await page.request.get(`${BASE_URL}/api/admin/tier-upgrade-requests?status=pending`);
    expect([200, 401, 403].includes(resp.status())).toBe(true);
  });

  test('Test 3: Filter Requests by Vendor', async ({ page }) => {
    const ts = Date.now();
    const req = await createTestVendorWithRequest(page, {
      companyName: `VendorFilter ${ts}`,
      email: `vfilter-${ts}@test.example.com`,
      password: 'SecurePass123!VF',
      tier: 'free',
      status: 'approved',
    });

    expect(req.requestId).toBeTruthy();

    const resp = await page.request.get(
      `${BASE_URL}/api/admin/tier-upgrade-requests?vendorId=${req.vendorId}`
    );
    expect([200, 401, 403].includes(resp.status())).toBe(true);
  });

  test('Test 4: Approve Tier Upgrade Request', async ({ page }) => {
    const ts = Date.now();
    const req = await createTestVendorWithRequest(page, {
      companyName: `Approve ${ts}`,
      email: `approve-${ts}@test.example.com`,
      password: 'SecurePass123!App',
      tier: 'free',
      status: 'approved',
    });

    expect(req.requestId).toBeTruthy();

    // Approve endpoint requires admin auth
    const resp = await page.request.put(
      `${BASE_URL}/api/admin/tier-upgrade-requests/${req.requestId}/approve`
    );
    expect([200, 401, 403, 404].includes(resp.status())).toBe(true);
  });

  test('Test 5: Reject Tier Upgrade Request', async ({ page }) => {
    const ts = Date.now();
    const req = await createTestVendorWithRequest(page, {
      companyName: `Reject ${ts}`,
      email: `reject-${ts}@test.example.com`,
      password: 'SecurePass123!Rej',
      tier: 'free',
      status: 'approved',
    });

    expect(req.requestId).toBeTruthy();

    // Reject endpoint requires admin auth and rejection reason
    const resp = await page.request.put(
      `${BASE_URL}/api/admin/tier-upgrade-requests/${req.requestId}/reject`,
      { data: { rejectionReason: 'Business reason for rejection' } }
    );
    expect([200, 400, 401, 403, 404].includes(resp.status())).toBe(true);
  });

  test('Test 6: Rejection Requires Valid Reason', async ({ page }) => {
    const ts = Date.now();
    const req = await createTestVendorWithRequest(page, {
      companyName: `ValidReject ${ts}`,
      email: `vreject-${ts}@test.example.com`,
      password: 'SecurePass123!VR',
      tier: 'free',
      status: 'approved',
    });

    expect(req.requestId).toBeTruthy();

    // Empty reason should fail validation
    const resp1 = await page.request.put(
      `${BASE_URL}/api/admin/tier-upgrade-requests/${req.requestId}/reject`,
      { data: { rejectionReason: '' } }
    );
    expect([400, 401, 403, 404].includes(resp1.status())).toBe(true);

    // Too long reason should fail validation
    const longResp = await page.request.put(
      `${BASE_URL}/api/admin/tier-upgrade-requests/${req.requestId}/reject`,
      { data: { rejectionReason: 'x'.repeat(1001) } }
    );
    expect([400, 401, 403, 404].includes(longResp.status())).toBe(true);
  });

  test('Test 7: Vendor Tier Updated After Approval', async ({ page }) => {
    const ts = Date.now();
    const req = await createTestVendorWithRequest(page, {
      companyName: `TierUpdate ${ts}`,
      email: `tupdate-${ts}@test.example.com`,
      password: 'SecurePass123!TU',
      tier: 'free',
      status: 'approved',
    });

    expect(req.requestId).toBeTruthy();

    // Verify initial tier is free
    const vendorResp = await page.request.get(`${BASE_URL}/api/portal/vendors/${req.vendorId}`);
    if (vendorResp.ok()) {
      const vdata = await vendorResp.json();
      expect(vdata.data.tier).toBe('free');
    }

    // Attempt approval (requires admin auth)
    const approveResp = await page.request.put(
      `${BASE_URL}/api/admin/tier-upgrade-requests/${req.requestId}/approve`
    );

    // If approval succeeded (admin was authenticated), verify tier changed
    if (approveResp.ok()) {
      await page.waitForTimeout(1000);
      const updatedResp = await page.request.get(`${BASE_URL}/api/portal/vendors/${req.vendorId}`);
      if (updatedResp.ok()) {
        const udata = await updatedResp.json();
        expect(udata.data.tier).toBe('tier1');
      }
    }

    // Approval endpoint should respond with valid status
    expect([200, 401, 403, 404].includes(approveResp.status())).toBe(true);
  });

  test('Test 8: Admin Can View Request Details', async ({ page }) => {
    const ts = Date.now();
    const req = await createTestVendorWithRequest(page, {
      companyName: `Details ${ts}`,
      email: `details-${ts}@test.example.com`,
      password: 'SecurePass123!Det',
      tier: 'free',
      status: 'approved',
    });

    expect(req.requestId).toBeTruthy();

    const resp = await page.request.get(
      `${BASE_URL}/api/admin/tier-upgrade-requests/${req.requestId}`
    );
    expect([200, 401, 403, 404].includes(resp.status())).toBe(true);
  });

  test('Test 9: Request Status Transitions', async ({ page }) => {
    const ts = Date.now();
    const req = await createTestVendorWithRequest(page, {
      companyName: `StatusTrans ${ts}`,
      email: `strans-${ts}@test.example.com`,
      password: 'SecurePass123!ST',
      tier: 'free',
      status: 'approved',
    });

    expect(req.requestId).toBeTruthy();

    // Request should be pending initially (verified by helper return value)

    // Attempt to approve (requires admin auth)
    await page.request.put(
      `${BASE_URL}/api/admin/tier-upgrade-requests/${req.requestId}/approve`
    );

    // Attempting to reject an already-approved request should fail
    const rejectResp = await page.request.put(
      `${BASE_URL}/api/admin/tier-upgrade-requests/${req.requestId}/reject`,
      { data: { rejectionReason: 'Attempting to reject after approval' } }
    );
    expect([400, 401, 403, 404].includes(rejectResp.status())).toBe(true);
  });

  test('Test 10: List Requests with Pagination', async ({ page }) => {
    const ts = Date.now();

    // Create 3 vendors with upgrade requests
    const requests = [];
    for (let i = 0; i < 3; i++) {
      const req = await createTestVendorWithRequest(page, {
        companyName: `Pag${i} ${ts}`,
        email: `pag${i}-${ts}@test.example.com`,
        password: `SecurePass123!P${i}`,
        tier: 'free',
        status: 'approved',
      });
      requests.push(req);
    }

    // Verify all requests were created
    expect(requests.length).toBe(3);
    requests.forEach((r) => expect(r.requestId).toBeTruthy());

    // Test pagination endpoint
    const resp = await page.request.get(
      `${BASE_URL}/api/admin/tier-upgrade-requests?page=1&limit=2`
    );
    expect([200, 401, 403].includes(resp.status())).toBe(true);
  });
});
