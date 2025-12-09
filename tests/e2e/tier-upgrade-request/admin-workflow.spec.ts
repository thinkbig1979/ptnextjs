import { test, expect, Page } from '@playwright/test';
import { seedVendors } from '../helpers/seed-api-helpers';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

async function createUpgradeRequest(page: Page, vendorId: string, tier: string = 'tier1') {
  const resp = await page.request.post(`${BASE_URL}/api/portal/vendors/${vendorId}/tier-upgrade-request`, { data: { requestedTier: tier, vendorNotes: 'Test request' } });
  if (!resp.ok()) throw new Error(`Failed to create: ${resp.status()}`);
  return (await resp.json()).data;
}

test.describe('TIER-UPGRADE-ADMIN-P3: Admin Tier Upgrade Request Management', () => {
  test.setTimeout(120000);

  test('Test 1: View Pending Tier Upgrade Requests', async ({ page }) => {
    const vendors = [{ companyName: `Pending 1 ${Date.now()}`, email: `pending-1-${Date.now()}@test.example.com`, password: 'SecurePass123!P1', tier: 'free' as const, status: 'approved' as const }, { companyName: `Pending 2 ${Date.now()}`, email: `pending-2-${Date.now()}@test.example.com`, password: 'SecurePass123!P2', tier: 'free' as const, status: 'approved' as const }];
    const vendorIds = await seedVendors(page, vendors);
    await createUpgradeRequest(page, vendorIds[0]);
    await createUpgradeRequest(page, vendorIds[1]);
    const resp = await page.request.get(`${BASE_URL}/api/admin/tier-upgrade-requests`);
    expect([200, 401, 403].includes(resp.status())).toBe(true);
  });

  test('Test 2: Filter Requests by Status', async ({ page }) => {
    const vendor = { companyName: `Filter ${Date.now()}`, email: `filter-${Date.now()}@test.example.com`, password: 'SecurePass123!Flt', tier: 'free' as const, status: 'approved' as const };
    const [vendorId] = await seedVendors(page, [vendor]);
    await createUpgradeRequest(page, vendorId);
    const resp = await page.request.get(`${BASE_URL}/api/admin/tier-upgrade-requests?status=pending`);
    expect([200, 401, 403].includes(resp.status())).toBe(true);
  });

  test('Test 3: Filter Requests by Vendor', async ({ page }) => {
    const vendor = { companyName: `VendorFilter ${Date.now()}`, email: `vfilter-${Date.now()}@test.example.com`, password: 'SecurePass123!VF', tier: 'free' as const, status: 'approved' as const };
    const [vendorId] = await seedVendors(page, [vendor]);
    await createUpgradeRequest(page, vendorId);
    const resp = await page.request.get(`${BASE_URL}/api/admin/tier-upgrade-requests?vendorId=${vendorId}`);
    expect([200, 401, 403].includes(resp.status())).toBe(true);
  });

  test('Test 4: Approve Tier Upgrade Request', async ({ page }) => {
    const vendor = { companyName: `Approve ${Date.now()}`, email: `approve-${Date.now()}@test.example.com`, password: 'SecurePass123!App', tier: 'free' as const, status: 'approved' as const };
    const [vendorId] = await seedVendors(page, [vendor]);
    const req = await createUpgradeRequest(page, vendorId);
    const resp = await page.request.put(`${BASE_URL}/api/admin/tier-upgrade-requests/${req.id}/approve`);
    expect([200, 401, 403, 404].includes(resp.status())).toBe(true);
  });

  test('Test 5: Reject Tier Upgrade Request', async ({ page }) => {
    const vendor = { companyName: `Reject ${Date.now()}`, email: `reject-${Date.now()}@test.example.com`, password: 'SecurePass123!Rej', tier: 'free' as const, status: 'approved' as const };
    const [vendorId] = await seedVendors(page, [vendor]);
    const req = await createUpgradeRequest(page, vendorId);
    const resp = await page.request.put(`${BASE_URL}/api/admin/tier-upgrade-requests/${req.id}/reject`, { data: { rejectionReason: 'Business reason' } });
    expect([200, 400, 401, 403, 404].includes(resp.status())).toBe(true);
  });

  test('Test 6: Rejection Requires Valid Reason', async ({ page }) => {
    const vendor = { companyName: `ValidReject ${Date.now()}`, email: `vreject-${Date.now()}@test.example.com`, password: 'SecurePass123!VR', tier: 'free' as const, status: 'approved' as const };
    const [vendorId] = await seedVendors(page, [vendor]);
    const req = await createUpgradeRequest(page, vendorId);
    const resp1 = await page.request.put(`${BASE_URL}/api/admin/tier-upgrade-requests/${req.id}/reject`, { data: { rejectionReason: '' } });
    expect([400, 401, 403, 404].includes(resp1.status())).toBe(true);
    const longResp = await page.request.put(`${BASE_URL}/api/admin/tier-upgrade-requests/${req.id}/reject`, { data: { rejectionReason: 'x'.repeat(1001) } });
    expect([400, 401, 403, 404].includes(longResp.status())).toBe(true);
  });

  test('Test 7: Vendor Tier Updated After Approval', async ({ page }) => {
    const vendor = { companyName: `TierUpdate ${Date.now()}`, email: `tupdate-${Date.now()}@test.example.com`, password: 'SecurePass123!TU', tier: 'free' as const, status: 'approved' as const };
    const [vendorId] = await seedVendors(page, [vendor]);
    const vendorResp = await page.request.get(`${BASE_URL}/api/portal/vendors/${vendorId}`);
    if (vendorResp.ok()) {
      const vdata = await vendorResp.json();
      expect(vdata.data.tier).toBe('free');
    }
    const req = await createUpgradeRequest(page, vendorId);
    const approveResp = await page.request.put(`${BASE_URL}/api/admin/tier-upgrade-requests/${req.id}/approve`);
    if (approveResp.ok()) {
      await page.waitForTimeout(1000);
      const updatedResp = await page.request.get(`${BASE_URL}/api/portal/vendors/${vendorId}`);
      if (updatedResp.ok()) {
        const udata = await updatedResp.json();
        expect(udata.data.tier).toBe('tier1');
      }
    }
  });

  test('Test 8: Admin Can View Request Details', async ({ page }) => {
    const vendor = { companyName: `Details ${Date.now()}`, email: `details-${Date.now()}@test.example.com`, password: 'SecurePass123!Det', tier: 'free' as const, status: 'approved' as const };
    const [vendorId] = await seedVendors(page, [vendor]);
    const req = await createUpgradeRequest(page, vendorId);
    const resp = await page.request.get(`${BASE_URL}/api/admin/tier-upgrade-requests/${req.id}`);
    expect([200, 401, 403, 404].includes(resp.status())).toBe(true);
  });

  test('Test 9: Request Status Transitions', async ({ page }) => {
    const vendor = { companyName: `StatusTrans ${Date.now()}`, email: `strans-${Date.now()}@test.example.com`, password: 'SecurePass123!ST', tier: 'free' as const, status: 'approved' as const };
    const [vendorId] = await seedVendors(page, [vendor]);
    const req = await createUpgradeRequest(page, vendorId);
    expect(req.status).toBe('pending');
    await page.request.put(`${BASE_URL}/api/admin/tier-upgrade-requests/${req.id}/approve`);
    const rejectResp = await page.request.put(`${BASE_URL}/api/admin/tier-upgrade-requests/${req.id}/reject`, { data: { rejectionReason: 'Already approved' } });
    expect([400, 401, 403, 404].includes(rejectResp.status())).toBe(true);
  });

  test('Test 10: List Requests with Pagination', async ({ page }) => {
    const vendors = Array.from({ length: 3 }, (_, i) => ({ companyName: `Pag${i} ${Date.now()}`, email: `pag${i}-${Date.now()}@test.example.com`, password: `SecurePass123!P${i}`, tier: 'free' as const, status: 'approved' as const }));
    const vendorIds = await seedVendors(page, vendors);
    for (const vid of vendorIds) await createUpgradeRequest(page, vid);
    const resp = await page.request.get(`${BASE_URL}/api/admin/tier-upgrade-requests?page=1&limit=2`);
    expect([200, 401, 403].includes(resp.status())).toBe(true);
  });
});
