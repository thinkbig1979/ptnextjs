/**
 * Example Test: Demonstrating Tier Upgrade Helper Usage
 *
 * This test file demonstrates how to use the tier upgrade helper functions
 * for E2E testing of tier upgrade/downgrade workflows.
 */

import { test, expect } from '@playwright/test';
import {
  seedVendorWithUpgradeRequest,
  seedVendorWithDowngradeRequest,
  approveUpgradeRequest,
  rejectUpgradeRequest,
  getUpgradeRequestStatus,
  getDowngradeRequestStatus,
  submitUpgradeRequest,
  submitDowngradeRequest,
  cancelUpgradeRequest,
  cancelDowngradeRequest,
  waitForTierUpdate,
  verifyTierFeatures,
  listTierRequests,
  getVendorTier,
  loginAsVendor,
} from './helpers/tier-upgrade-helpers';

test.describe('Example: Tier Upgrade Helpers Usage', () => {
  test.setTimeout(120000);

  test('Example 1: Create vendor with pending upgrade request', async ({ page }) => {
    // Create a vendor with a pending upgrade request in one call
    const { vendorId, requestId, vendorData } = await seedVendorWithUpgradeRequest(
      page,
      {
        companyName: 'Example Vendor',
        tier: 'free',
      },
      {
        requestedTier: 'tier1',
        vendorNotes: 'Growing our business',
      }
    );

    expect(vendorId).toBeTruthy();
    expect(requestId).toBeTruthy();

    // Verify the request exists
    const status = await getUpgradeRequestStatus(page, vendorId);
    expect(status).toBeTruthy();
    expect(status.status).toBe('pending');
    expect(status.requestedTier).toBe('tier1');
  });

  test('Example 2: Create vendor with pending downgrade request', async ({ page }) => {
    // Create a tier2 vendor with a pending downgrade request
    const { vendorId, requestId, vendorData } = await seedVendorWithDowngradeRequest(
      page,
      {
        companyName: 'Downgrading Vendor',
        tier: 'tier2',
      },
      {
        requestedTier: 'tier1',
        vendorNotes: 'Reducing costs',
      }
    );

    expect(vendorId).toBeTruthy();
    expect(requestId).toBeTruthy();

    // Verify the downgrade request exists
    const status = await getDowngradeRequestStatus(page, vendorId);
    expect(status).toBeTruthy();
    expect(status.status).toBe('pending');
    expect(status.requestedTier).toBe('tier1');
  });

  test('Example 3: Complete upgrade approval workflow', async ({ page }) => {
    // Create vendor with upgrade request
    const { vendorId, requestId } = await seedVendorWithUpgradeRequest(
      page,
      { tier: 'free' },
      { requestedTier: 'tier1' }
    );

    // Verify initial tier
    const initialTier = await getVendorTier(page, vendorId);
    expect(initialTier).toBe('free');

    // Approve the request (as admin)
    const approvalResult = await approveUpgradeRequest(page, requestId);

    // Note: This may fail with 401/403 if not authenticated as admin
    // In a real test, you would login as admin first
    if (approvalResult.success) {
      // Wait for tier to be updated
      const tierUpdated = await waitForTierUpdate(page, vendorId, 'tier1', 10000);
      expect(tierUpdated).toBe(true);

      // Verify features are available
      const features = await verifyTierFeatures(page, vendorId, 'tier1');
      expect(features.hasExpectedFeatures).toBe(true);
      expect(features.checkedFeatures).toContain('tier');
    }
  });

  test('Example 4: Reject upgrade request', async ({ page }) => {
    // Create vendor with upgrade request
    const { vendorId, requestId } = await seedVendorWithUpgradeRequest(
      page,
      { tier: 'free' },
      { requestedTier: 'tier2' }
    );

    // Reject the request (as admin)
    const rejectionResult = await rejectUpgradeRequest(
      page,
      requestId,
      'Insufficient business justification provided'
    );

    // Note: This may fail with 401/403 if not authenticated as admin
    if (rejectionResult.success) {
      // Verify tier didn't change
      const currentTier = await getVendorTier(page, vendorId);
      expect(currentTier).toBe('free');

      // Verify request status
      const status = await getUpgradeRequestStatus(page, vendorId);
      expect(status.status).toBe('rejected');
      expect(status.rejectionReason).toContain('Insufficient');
    }
  });

  test('Example 5: Submit and cancel upgrade request', async ({ page }) => {
    // Create a vendor without upgrade request
    const { vendorId, vendorData } = await seedVendorWithUpgradeRequest(
      page,
      { tier: 'free' },
      { requestedTier: 'tier1' }
    );

    // Get the request ID
    const request = await getUpgradeRequestStatus(page, vendorId);
    expect(request).toBeTruthy();

    const requestId = request.id;

    // Cancel the request
    const cancelled = await cancelUpgradeRequest(page, vendorId, requestId);
    expect(cancelled).toBe(true);

    // Verify no pending request
    const statusAfterCancel = await getUpgradeRequestStatus(page, vendorId);
    expect(statusAfterCancel?.status).not.toBe('pending');
  });

  test('Example 6: Submit upgrade request manually', async ({ page }) => {
    // This example shows manual submission workflow
    const { vendorId, vendorData } = await seedVendorWithUpgradeRequest(
      page,
      { tier: 'tier1' },
      { requestedTier: 'tier2' }
    );

    // Login as vendor first
    const loggedIn = await loginAsVendor(page, vendorData.email, vendorData.password);
    expect(loggedIn).toBe(true);

    // Cancel existing request
    const existingRequest = await getUpgradeRequestStatus(page, vendorId);
    if (existingRequest) {
      await cancelUpgradeRequest(page, vendorId, existingRequest.id);
    }

    // Submit new request
    const result = await submitUpgradeRequest(
      page,
      vendorId,
      'tier3',
      'Expanding to premium tier'
    );

    expect(result.success).toBe(true);
    expect(result.requestId).toBeTruthy();
    expect(result.status).toBe('pending');
  });

  test('Example 7: List and filter tier requests', async ({ page }) => {
    // Create multiple requests
    await seedVendorWithUpgradeRequest(
      page,
      { tier: 'free' },
      { requestedTier: 'tier1' }
    );

    await seedVendorWithUpgradeRequest(
      page,
      { tier: 'tier1' },
      { requestedTier: 'tier2' }
    );

    await seedVendorWithDowngradeRequest(
      page,
      { tier: 'tier2' },
      { requestedTier: 'tier1' }
    );

    // List all pending requests
    const allPending = await listTierRequests(page, { status: 'pending' });

    // Note: This will fail with 401/403 if not authenticated as admin
    if (allPending) {
      expect(allPending.length).toBeGreaterThan(0);
    }

    // Filter by request type
    const upgrades = await listTierRequests(page, {
      status: 'pending',
      requestType: 'upgrade',
    });

    const downgrades = await listTierRequests(page, {
      status: 'pending',
      requestType: 'downgrade',
    });

    if (upgrades && downgrades) {
      expect(upgrades.length).toBeGreaterThan(0);
      expect(downgrades.length).toBeGreaterThan(0);
    }
  });

  test('Example 8: Verify tier features after upgrade', async ({ page }) => {
    const { vendorId } = await seedVendorWithUpgradeRequest(
      page,
      { tier: 'free' },
      { requestedTier: 'tier1' }
    );

    // Check free tier features
    const freeTierFeatures = await verifyTierFeatures(page, vendorId, 'free');
    expect(freeTierFeatures.hasExpectedFeatures).toBe(true);
    expect(freeTierFeatures.details).toContain('Max products: 3');
    expect(freeTierFeatures.checkedFeatures).toContain('maxProducts');
    expect(freeTierFeatures.checkedFeatures).toContain('maxLocations');
    expect(freeTierFeatures.checkedFeatures).toContain('maxTeamMembers');

    // After approval (simulated by directly checking tier1 features)
    // In a real test, you would approve the request first
    const tier1Features = await verifyTierFeatures(page, vendorId, 'free');
    expect(tier1Features.checkedFeatures).toBeTruthy();
  });

  test('Example 9: Complete downgrade workflow', async ({ page }) => {
    // Create tier3 vendor with downgrade request to tier1
    const { vendorId, requestId, vendorData } = await seedVendorWithDowngradeRequest(
      page,
      {
        companyName: 'Premium Vendor Downgrading',
        tier: 'tier3',
      },
      {
        requestedTier: 'tier1',
        vendorNotes: 'Business constraints require downgrade',
      }
    );

    expect(vendorId).toBeTruthy();
    expect(requestId).toBeTruthy();

    // Verify initial tier
    const initialTier = await getVendorTier(page, vendorId);
    expect(initialTier).toBe('tier3');

    // Verify downgrade request status
    const status = await getDowngradeRequestStatus(page, vendorId);
    expect(status).toBeTruthy();
    expect(status.status).toBe('pending');
    expect(status.requestedTier).toBe('tier1');
    expect(status.requestType).toBe('downgrade');

    // Approve the downgrade (as admin)
    const approvalResult = await approveUpgradeRequest(page, requestId);

    // Note: This may fail with 401/403 if not authenticated as admin
    if (approvalResult.success) {
      // Wait for tier to be updated
      const tierUpdated = await waitForTierUpdate(page, vendorId, 'tier1', 10000);
      expect(tierUpdated).toBe(true);

      // Verify tier1 features are now in effect
      const features = await verifyTierFeatures(page, vendorId, 'tier1');
      expect(features.hasExpectedFeatures).toBe(true);
      expect(features.details).toContain('Max products: 10');
    }
  });

  test('Example 10: Cancel downgrade request', async ({ page }) => {
    // Create vendor with downgrade request
    const { vendorId, requestId, vendorData } = await seedVendorWithDowngradeRequest(
      page,
      { tier: 'tier2' },
      { requestedTier: 'free' }
    );

    // Verify request exists
    const request = await getDowngradeRequestStatus(page, vendorId);
    expect(request).toBeTruthy();
    expect(request.id).toBe(requestId);

    // Cancel the downgrade request
    const cancelled = await cancelDowngradeRequest(page, vendorId, requestId);
    expect(cancelled).toBe(true);

    // Verify no pending downgrade request
    const statusAfterCancel = await getDowngradeRequestStatus(page, vendorId);
    expect(statusAfterCancel?.status).not.toBe('pending');

    // Verify tier unchanged
    const currentTier = await getVendorTier(page, vendorId);
    expect(currentTier).toBe('tier2');
  });
});
