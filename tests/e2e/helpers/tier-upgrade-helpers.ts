/**
 * Tier Upgrade E2E Test Helper Functions
 *
 * Comprehensive helper functions for testing tier upgrade request workflows.
 * Provides utilities for both vendor and admin workflows.
 */

import { Page } from '@playwright/test';
import { seedVendors, VendorSeedData } from './seed-api-helpers';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

/**
 * Configuration for creating an upgrade request
 */
interface UpgradeRequestConfig {
  requestedTier: 'tier1' | 'tier2' | 'tier3';
  vendorNotes?: string;
}

/**
 * Configuration for creating a downgrade request
 */
interface DowngradeRequestConfig {
  requestedTier: 'free' | 'tier1' | 'tier2';
  vendorNotes?: string;
}

/**
 * Result from upgrade/downgrade request operations
 */
interface UpgradeRequestResult {
  success: boolean;
  requestId?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  error?: string;
}

/**
 * Vendor configuration for seeding
 */
interface VendorConfig extends Partial<VendorSeedData> {
  tier?: 'free' | 'tier1' | 'tier2' | 'tier3';
}

/**
 * Tier feature validation result
 */
interface TierFeatureValidation {
  hasExpectedFeatures: boolean;
  details: string;
  checkedFeatures: string[];
}

/**
 * Helper 1: Seed vendor with pending upgrade request in one call
 *
 * Creates a vendor and immediately submits an upgrade request.
 * Useful for setting up test scenarios quickly.
 *
 * @param page - Playwright page object
 * @param vendorConfig - Vendor configuration (uses defaults if not provided)
 * @param requestConfig - Upgrade request configuration
 * @returns Object with vendorId, requestId, and vendorData
 */
export async function seedVendorWithUpgradeRequest(
  page: Page,
  vendorConfig: VendorConfig = {},
  requestConfig: UpgradeRequestConfig
): Promise<{ vendorId: string; requestId: string; vendorData: VendorSeedData }> {
  try {
    console.log('[seedVendorWithUpgradeRequest] Creating vendor with upgrade request...');

    // Create vendor with default values
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);

    const vendorData: VendorSeedData = {
      companyName: `Test Vendor ${timestamp}`,
      email: `vendor-${timestamp}-${random}@test.example.com`,
      password: 'SecureTestPass123!@#',
      tier: 'free',
      status: 'approved',
      description: 'Test vendor for tier upgrade testing',
      ...vendorConfig,
    };

    // Seed the vendor
    const vendorIds = await seedVendors(page, [vendorData]);
    const vendorId = vendorIds[0];

    console.log(`[seedVendorWithUpgradeRequest] Vendor created: ${vendorId}`);

    // Login as the vendor before submitting upgrade request
    // The tier upgrade API requires authentication
    console.log(`[seedVendorWithUpgradeRequest] Logging in as vendor: ${vendorData.email}`);
    const loginResponse = await page.request.post(`${BASE_URL}/api/auth/login`, {
      data: {
        email: vendorData.email,
        password: vendorData.password,
      },
    });

    if (!loginResponse.ok()) {
      const errorText = await loginResponse.text();
      throw new Error(`Failed to login as vendor: ${loginResponse.status()} - ${errorText}`);
    }
    console.log(`[seedVendorWithUpgradeRequest] Vendor logged in successfully`);

    // Submit upgrade request (now authenticated)
    const result = await submitUpgradeRequest(
      page,
      vendorId,
      requestConfig.requestedTier,
      requestConfig.vendorNotes
    );

    if (!result.success || !result.requestId) {
      throw new Error(`Failed to create upgrade request: ${result.error}`);
    }

    console.log(`[seedVendorWithUpgradeRequest] Upgrade request created: ${result.requestId}`);

    return {
      vendorId,
      requestId: result.requestId,
      vendorData,
    };
  } catch (error) {
    console.error('[seedVendorWithUpgradeRequest] Error:', error);
    throw error;
  }
}

/**
 * Helper 2: Seed vendor with pending downgrade request in one call
 *
 * Creates a vendor and immediately submits a downgrade request.
 * Useful for setting up test scenarios quickly.
 *
 * @param page - Playwright page object
 * @param vendorConfig - Vendor configuration (uses defaults if not provided)
 * @param requestConfig - Downgrade request configuration
 * @returns Object with vendorId, requestId, and vendorData
 */
async function seedVendorWithDowngradeRequest(
  page: Page,
  vendorConfig: VendorConfig = {},
  requestConfig: DowngradeRequestConfig
): Promise<{ vendorId: string; requestId: string; vendorData: VendorSeedData }> {
  try {
    console.log('[seedVendorWithDowngradeRequest] Creating vendor with downgrade request...');

    // Create vendor with default values
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);

    const vendorData: VendorSeedData = {
      companyName: `Test Vendor ${timestamp}`,
      email: `vendor-${timestamp}-${random}@test.example.com`,
      password: 'SecureTestPass123!@#',
      tier: 'tier2', // Default to tier2 so we can downgrade
      status: 'approved',
      description: 'Test vendor for tier downgrade testing',
      ...vendorConfig,
    };

    // Seed the vendor
    const vendorIds = await seedVendors(page, [vendorData]);
    const vendorId = vendorIds[0];

    console.log(`[seedVendorWithDowngradeRequest] Vendor created: ${vendorId}`);

    // Login as the vendor before submitting downgrade request
    // The tier downgrade API requires authentication
    console.log(`[seedVendorWithDowngradeRequest] Logging in as vendor: ${vendorData.email}`);
    const loginResponse = await page.request.post(`${BASE_URL}/api/auth/login`, {
      data: {
        email: vendorData.email,
        password: vendorData.password,
      },
    });

    if (!loginResponse.ok()) {
      const errorText = await loginResponse.text();
      throw new Error(`Failed to login as vendor: ${loginResponse.status()} - ${errorText}`);
    }
    console.log(`[seedVendorWithDowngradeRequest] Vendor logged in successfully`);

    // Submit downgrade request (now authenticated)
    const result = await submitDowngradeRequest(
      page,
      vendorId,
      requestConfig.requestedTier,
      requestConfig.vendorNotes
    );

    if (!result.success || !result.requestId) {
      throw new Error(`Failed to create downgrade request: ${result.error}`);
    }

    console.log(`[seedVendorWithDowngradeRequest] Downgrade request created: ${result.requestId}`);

    return {
      vendorId,
      requestId: result.requestId,
      vendorData,
    };
  } catch (error) {
    console.error('[seedVendorWithDowngradeRequest] Error:', error);
    throw error;
  }
}

/**
 * Helper 3: Approve an upgrade/downgrade request (admin action)
 *
 * @param page - Playwright page object
 * @param requestId - ID of the request to approve
 * @returns Approval response data
 */
async function approveUpgradeRequest(
  page: Page,
  requestId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log(`[approveUpgradeRequest] Approving request: ${requestId}`);

    const response = await page.request.put(
      `${BASE_URL}/api/admin/tier-upgrade-requests/${requestId}/approve`
    );

    const data = await response.json();

    if (!response.ok()) {
      console.error(`[approveUpgradeRequest] Approval failed: ${response.status()}`, data);
      return {
        success: false,
        error: data.error || `HTTP ${response.status()}`,
      };
    }

    console.log(`[approveUpgradeRequest] Request approved successfully`);
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('[approveUpgradeRequest] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Helper 4: Reject an upgrade/downgrade request with reason (admin action)
 *
 * @param page - Playwright page object
 * @param requestId - ID of the request to reject
 * @param reason - Rejection reason (required, 10-1000 characters)
 * @returns Rejection response data
 */
async function rejectUpgradeRequest(
  page: Page,
  requestId: string,
  reason: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log(`[rejectUpgradeRequest] Rejecting request: ${requestId}`);

    const response = await page.request.put(
      `${BASE_URL}/api/admin/tier-upgrade-requests/${requestId}/reject`,
      {
        data: {
          rejectionReason: reason,
        },
      }
    );

    const data = await response.json();

    if (!response.ok()) {
      console.error(`[rejectUpgradeRequest] Rejection failed: ${response.status()}`, data);
      return {
        success: false,
        error: data.error || `HTTP ${response.status()}`,
      };
    }

    console.log(`[rejectUpgradeRequest] Request rejected successfully`);
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('[rejectUpgradeRequest] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Helper 5: Get current upgrade request status for a vendor
 *
 * @param page - Playwright page object
 * @param vendorId - Vendor ID
 * @returns Request data or null if no pending request
 */
async function getUpgradeRequestStatus(
  page: Page,
  vendorId: string
): Promise<any | null> {
  try {
    console.log(`[getUpgradeRequestStatus] Getting request status for vendor: ${vendorId}`);

    const response = await page.request.get(
      `${BASE_URL}/api/portal/vendors/${vendorId}/tier-upgrade-request`
    );

    if (!response.ok()) {
      if (response.status() === 404) {
        console.log(`[getUpgradeRequestStatus] No pending request found`);
        return null;
      }

      console.error(`[getUpgradeRequestStatus] Failed: ${response.status()}`);
      return null;
    }

    const data = await response.json();
    console.log(`[getUpgradeRequestStatus] Request found:`, data.data?.status);

    return data.data;
  } catch (error) {
    console.error('[getUpgradeRequestStatus] Error:', error);
    return null;
  }
}

/**
 * Helper 6: Get current downgrade request status for a vendor
 *
 * @param page - Playwright page object
 * @param vendorId - Vendor ID
 * @returns Request data or null if no pending request
 */
async function getDowngradeRequestStatus(
  page: Page,
  vendorId: string
): Promise<any | null> {
  try {
    console.log(`[getDowngradeRequestStatus] Getting downgrade request status for vendor: ${vendorId}`);

    const response = await page.request.get(
      `${BASE_URL}/api/portal/vendors/${vendorId}/tier-downgrade-request`
    );

    if (!response.ok()) {
      if (response.status() === 404) {
        console.log(`[getDowngradeRequestStatus] No pending downgrade request found`);
        return null;
      }

      console.error(`[getDowngradeRequestStatus] Failed: ${response.status()}`);
      return null;
    }

    const data = await response.json();
    console.log(`[getDowngradeRequestStatus] Downgrade request found:`, data.data?.status);

    return data.data;
  } catch (error) {
    console.error('[getDowngradeRequestStatus] Error:', error);
    return null;
  }
}

/**
 * Helper 7: Submit a new upgrade request
 *
 * @param page - Playwright page object
 * @param vendorId - Vendor ID
 * @param targetTier - Requested tier (tier1, tier2, or tier3)
 * @param notes - Optional vendor notes (max 500 characters)
 * @returns Result with success status, requestId, and error if failed
 */
async function submitUpgradeRequest(
  page: Page,
  vendorId: string,
  targetTier: 'tier1' | 'tier2' | 'tier3',
  notes?: string
): Promise<UpgradeRequestResult> {
  try {
    console.log(`[submitUpgradeRequest] Submitting upgrade to ${targetTier} for vendor: ${vendorId}`);

    const requestData: any = {
      requestedTier: targetTier,
    };

    if (notes) {
      requestData.vendorNotes = notes;
    }

    const response = await page.request.post(
      `${BASE_URL}/api/portal/vendors/${vendorId}/tier-upgrade-request`,
      {
        data: requestData,
      }
    );

    const data = await response.json();

    if (!response.ok()) {
      console.error(`[submitUpgradeRequest] Submission failed: ${response.status()}`, data);
      return {
        success: false,
        error: data.error || `HTTP ${response.status()}`,
      };
    }

    console.log(`[submitUpgradeRequest] Request submitted successfully: ${data.data?.id}`);

    return {
      success: true,
      requestId: data.data?.id,
      status: data.data?.status,
    };
  } catch (error) {
    console.error('[submitUpgradeRequest] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Helper 8: Submit a new downgrade request
 *
 * @param page - Playwright page object
 * @param vendorId - Vendor ID
 * @param targetTier - Requested tier (free, tier1, or tier2)
 * @param notes - Optional vendor notes (max 500 characters)
 * @returns Result with success status, requestId, and error if failed
 */
async function submitDowngradeRequest(
  page: Page,
  vendorId: string,
  targetTier: 'free' | 'tier1' | 'tier2',
  notes?: string
): Promise<UpgradeRequestResult> {
  try {
    console.log(`[submitDowngradeRequest] Submitting downgrade to ${targetTier} for vendor: ${vendorId}`);

    const requestData: any = {
      requestedTier: targetTier,
    };

    if (notes) {
      requestData.vendorNotes = notes;
    }

    const response = await page.request.post(
      `${BASE_URL}/api/portal/vendors/${vendorId}/tier-downgrade-request`,
      {
        data: requestData,
      }
    );

    const data = await response.json();

    if (!response.ok()) {
      console.error(`[submitDowngradeRequest] Submission failed: ${response.status()}`, data);
      return {
        success: false,
        error: data.error || `HTTP ${response.status()}`,
      };
    }

    console.log(`[submitDowngradeRequest] Downgrade request submitted successfully: ${data.data?.id}`);

    return {
      success: true,
      requestId: data.data?.id,
      status: data.data?.status,
    };
  } catch (error) {
    console.error('[submitDowngradeRequest] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Helper 9: Cancel a pending upgrade request
 *
 * @param page - Playwright page object
 * @param vendorId - Vendor ID
 * @param requestId - Request ID to cancel
 * @returns Success boolean
 */
async function cancelUpgradeRequest(
  page: Page,
  vendorId: string,
  requestId: string
): Promise<boolean> {
  try {
    console.log(`[cancelUpgradeRequest] Cancelling request: ${requestId} for vendor: ${vendorId}`);

    const response = await page.request.delete(
      `${BASE_URL}/api/portal/vendors/${vendorId}/tier-upgrade-request/${requestId}`
    );

    if (!response.ok()) {
      console.error(`[cancelUpgradeRequest] Cancellation failed: ${response.status()}`);
      return false;
    }

    console.log(`[cancelUpgradeRequest] Request cancelled successfully`);
    return true;
  } catch (error) {
    console.error('[cancelUpgradeRequest] Error:', error);
    return false;
  }
}

/**
 * Helper 10: Cancel a pending downgrade request
 *
 * @param page - Playwright page object
 * @param vendorId - Vendor ID
 * @param requestId - Request ID to cancel
 * @returns Success boolean
 */
async function cancelDowngradeRequest(
  page: Page,
  vendorId: string,
  requestId: string
): Promise<boolean> {
  try {
    console.log(`[cancelDowngradeRequest] Cancelling downgrade request: ${requestId} for vendor: ${vendorId}`);

    const response = await page.request.delete(
      `${BASE_URL}/api/portal/vendors/${vendorId}/tier-downgrade-request/${requestId}`
    );

    if (!response.ok()) {
      console.error(`[cancelDowngradeRequest] Cancellation failed: ${response.status()}`);
      return false;
    }

    console.log(`[cancelDowngradeRequest] Downgrade request cancelled successfully`);
    return true;
  } catch (error) {
    console.error('[cancelDowngradeRequest] Error:', error);
    return false;
  }
}

/**
 * Helper 11: Poll until vendor tier matches expected value
 *
 * Useful after approving an upgrade request to wait for the tier to be updated.
 *
 * @param page - Playwright page object
 * @param vendorId - Vendor ID
 * @param expectedTier - Expected tier value
 * @param timeout - Timeout in milliseconds (default: 10000)
 * @returns True if tier matches within timeout, false otherwise
 */
async function waitForTierUpdate(
  page: Page,
  vendorId: string,
  expectedTier: 'free' | 'tier1' | 'tier2' | 'tier3',
  timeout: number = 10000
): Promise<boolean> {
  try {
    console.log(`[waitForTierUpdate] Waiting for vendor ${vendorId} to reach tier: ${expectedTier}`);

    const startTime = Date.now();
    const pollInterval = 500; // Check every 500ms

    while (Date.now() - startTime < timeout) {
      try {
        const response = await page.request.get(
          `${BASE_URL}/api/portal/vendors/${vendorId}`
        );

        if (response.ok()) {
          const data = await response.json();
          const currentTier = data.data?.tier;

          console.log(`[waitForTierUpdate] Current tier: ${currentTier}, expected: ${expectedTier}`);

          if (currentTier === expectedTier) {
            console.log(`[waitForTierUpdate] Tier updated successfully!`);
            return true;
          }
        }
      } catch (error) {
        console.warn(`[waitForTierUpdate] Polling error (will retry):`, error);
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    console.error(`[waitForTierUpdate] Timeout waiting for tier update`);
    return false;
  } catch (error) {
    console.error('[waitForTierUpdate] Error:', error);
    return false;
  }
}

/**
 * Helper 12: Verify tier-specific features are accessible
 *
 * Checks that tier-restricted features are available based on vendor tier.
 *
 * @param page - Playwright page object
 * @param vendorId - Vendor ID
 * @param tier - Tier to validate features for
 * @returns Validation result with details
 */
async function verifyTierFeatures(
  page: Page,
  vendorId: string,
  tier: 'free' | 'tier1' | 'tier2' | 'tier3'
): Promise<TierFeatureValidation> {
  try {
    console.log(`[verifyTierFeatures] Verifying features for vendor ${vendorId} at tier: ${tier}`);

    const checkedFeatures: string[] = [];
    let allFeaturesPresent = true;
    let details = '';

    // Get vendor data
    const response = await page.request.get(
      `${BASE_URL}/api/portal/vendors/${vendorId}`
    );

    if (!response.ok()) {
      return {
        hasExpectedFeatures: false,
        details: `Failed to fetch vendor data: HTTP ${response.status()}`,
        checkedFeatures: [],
      };
    }

    const vendorData = await response.json();
    const vendor = vendorData.data;

    // Verify tier level
    if (vendor.tier !== tier) {
      return {
        hasExpectedFeatures: false,
        details: `Tier mismatch: expected ${tier}, got ${vendor.tier}`,
        checkedFeatures: ['tier'],
      };
    }

    checkedFeatures.push('tier');

    // Feature limits based on tier
    const tierLimits: Record<string, any> = {
      free: {
        maxProducts: 3,
        maxLocations: 1,
        maxTeamMembers: 2,
        hasBrandStory: false,
        hasCertifications: false,
        hasPromotionPack: false,
      },
      tier1: {
        maxProducts: 10,
        maxLocations: 1,
        maxTeamMembers: 5,
        hasBrandStory: true,
        hasCertifications: true,
        hasPromotionPack: false,
      },
      tier2: {
        maxProducts: 25,
        maxLocations: 5,
        maxTeamMembers: 10,
        hasBrandStory: true,
        hasCertifications: true,
        hasPromotionPack: false,
      },
      tier3: {
        maxProducts: -1, // unlimited
        maxLocations: -1, // unlimited
        maxTeamMembers: -1, // unlimited
        hasBrandStory: true,
        hasCertifications: true,
        hasPromotionPack: true,
      },
    };

    const limits = tierLimits[tier];
    const featureDetails: string[] = [];

    // Check max products
    if (limits.maxProducts !== -1) {
      checkedFeatures.push('maxProducts');
      featureDetails.push(`Max products: ${limits.maxProducts}`);
    } else {
      checkedFeatures.push('unlimitedProducts');
      featureDetails.push(`Unlimited products`);
    }

    // Check max locations
    if (limits.maxLocations !== -1) {
      checkedFeatures.push('maxLocations');
      featureDetails.push(`Max locations: ${limits.maxLocations}`);
    } else {
      checkedFeatures.push('unlimitedLocations');
      featureDetails.push(`Unlimited locations`);
    }

    // Check max team members
    if (limits.maxTeamMembers !== -1) {
      checkedFeatures.push('maxTeamMembers');
      featureDetails.push(`Max team members: ${limits.maxTeamMembers}`);
    } else {
      checkedFeatures.push('unlimitedTeamMembers');
      featureDetails.push(`Unlimited team members`);
    }

    // Check feature availability
    if (limits.hasBrandStory) {
      checkedFeatures.push('brandStory');
      featureDetails.push(`Brand story: available`);
    }

    if (limits.hasCertifications) {
      checkedFeatures.push('certifications');
      featureDetails.push(`Certifications: available`);
    }

    if (limits.hasPromotionPack) {
      checkedFeatures.push('promotionPack');
      featureDetails.push(`Promotion pack: available`);
    }

    details = `Tier ${tier} features: ${featureDetails.join(', ')}`;

    console.log(`[verifyTierFeatures] ${details}`);

    return {
      hasExpectedFeatures: allFeaturesPresent,
      details,
      checkedFeatures,
    };
  } catch (error) {
    console.error('[verifyTierFeatures] Error:', error);
    return {
      hasExpectedFeatures: false,
      details: error instanceof Error ? error.message : 'Unknown error',
      checkedFeatures: [],
    };
  }
}

/**
 * Helper 13: List all tier upgrade/downgrade requests (admin)
 *
 * @param page - Playwright page object
 * @param filters - Optional filters (status, vendorId, requestedTier, requestType)
 * @returns List of requests or null if failed
 */
async function listTierRequests(
  page: Page,
  filters: {
    status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
    vendorId?: string;
    requestedTier?: 'free' | 'tier1' | 'tier2' | 'tier3';
    requestType?: 'upgrade' | 'downgrade';
  } = {}
): Promise<any[] | null> {
  try {
    console.log(`[listTierRequests] Listing requests with filters:`, filters);

    // Build query string
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.vendorId) params.append('vendorId', filters.vendorId);
    if (filters.requestedTier) params.append('requestedTier', filters.requestedTier);
    if (filters.requestType) params.append('requestType', filters.requestType);

    const queryString = params.toString();
    const url = `${BASE_URL}/api/admin/tier-upgrade-requests${queryString ? `?${queryString}` : ''}`;

    const response = await page.request.get(url);

    if (!response.ok()) {
      console.error(`[listTierRequests] Failed: ${response.status()}`);
      return null;
    }

    const data = await response.json();
    console.log(`[listTierRequests] Found ${data.data?.length || 0} requests`);

    return data.data || [];
  } catch (error) {
    console.error('[listTierRequests] Error:', error);
    return null;
  }
}

/**
 * Helper 14: Get current vendor tier
 *
 * @param page - Playwright page object
 * @param vendorId - Vendor ID
 * @returns Current tier or null if failed
 */
async function getVendorTier(
  page: Page,
  vendorId: string
): Promise<'free' | 'tier1' | 'tier2' | 'tier3' | null> {
  try {
    console.log(`[getVendorTier] Getting tier for vendor: ${vendorId}`);

    const response = await page.request.get(
      `${BASE_URL}/api/portal/vendors/${vendorId}`
    );

    if (!response.ok()) {
      console.error(`[getVendorTier] Failed: ${response.status()}`);
      return null;
    }

    const data = await response.json();
    const tier = data.data?.tier;

    console.log(`[getVendorTier] Current tier: ${tier}`);
    return tier || null;
  } catch (error) {
    console.error('[getVendorTier] Error:', error);
    return null;
  }
}

/**
 * Helper 15: Login as vendor (authentication helper)
 *
 * @param page - Playwright page object
 * @param email - Vendor email
 * @param password - Vendor password
 * @returns True if login successful, false otherwise
 */
async function loginAsVendor(
  page: Page,
  email: string,
  password: string
): Promise<boolean> {
  try {
    console.log(`[loginAsVendor] Logging in as: ${email}`);

    await page.goto(`${BASE_URL}/vendor/login/`);
    await page.getByPlaceholder('vendor@example.com').fill(email);
    await page.getByPlaceholder(/password/i).fill(password);

    // Wait for login response
    await page.waitForResponse(
      (r: any) => r.url().includes('/api/auth/login') && r.status() === 200
    ).catch(async () => {
      await page.click('button:has-text("Login")');
      return page.waitForResponse(
        (r: any) => r.url().includes('/api/auth/login') && r.status() === 200
      );
    });

    // Wait for redirect to dashboard
    await page.waitForURL(/\/vendor\/dashboard\/?/, { timeout: 10000 });

    console.log(`[loginAsVendor] Login successful`);
    return true;
  } catch (error) {
    console.error('[loginAsVendor] Login failed:', error);
    return false;
  }
}
