/**
 * Seed API Helper Functions
 *
 * Utility functions for using the test seed APIs in E2E tests.
 * These helpers simplify bulk data creation for tests.
 */

import { Page } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

/**
 * Vendor seed request data
 */
export interface VendorSeedData {
  companyName: string;
  email: string;
  password: string;
  tier?: 'free' | 'tier1' | 'tier2' | 'tier3';
  description?: string;
  contactPhone?: string;
  website?: string;
  featured?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  foundedYear?: number;
  totalProjects?: number;
  employeeCount?: number;
  locations?: Array<{
    name: string;
    city: string;
    country: string;
    latitude: number;
    longitude: number;
    isHQ?: boolean;
  }>;
}

/**
 * Product seed request data
 */
export interface ProductSeedData {
  name: string;
  description?: string;
  category?: string;
  manufacturer?: string;
  model?: string;
  price?: number;
  vendor?: string;
  published?: boolean;
  specifications?: Record<string, unknown>;
}

/**
 * Seed API response
 */
export interface SeedResponse {
  success: boolean;
  vendorIds?: string[];
  productIds?: string[];
  count?: number;
  error?: string;
  errors?: Record<string, string>;
}

/**
 * Create test vendors using the seed API
 */
export async function seedVendors(
  page: Page,
  vendors: VendorSeedData[]
): Promise<string[]> {
  console.log(`[seedVendors] Seeding ${vendors.length} vendors...`);

  const response = await page.request.post(`${BASE_URL}/api/test/vendors/seed`, {
    data: vendors,
  });

  const responseBody = await response.text();

  if (!response.ok()) {
    console.error(`[seedVendors] API failed with status ${response.status()}:`, responseBody);
    throw new Error(`Vendor seed API failed: ${response.status()} - ${responseBody}`);
  }

  let data: SeedResponse;
  try {
    data = JSON.parse(responseBody) as SeedResponse;
  } catch (parseError) {
    console.error('[seedVendors] Failed to parse response:', responseBody);
    throw new Error(`Failed to parse seed API response: ${responseBody}`);
  }

  if (!data.success || !data.vendorIds) {
    console.error('[seedVendors] Seed failed:', data.error, data.errors);
    throw new Error(`Failed to seed vendors: ${data.error || JSON.stringify(data.errors) || 'Unknown error'}`);
  }

  console.log(`[seedVendors] Successfully seeded ${data.vendorIds.length} vendors`);
  return data.vendorIds;
}

/**
 * Create test products using the seed API
 */
export async function seedProducts(
  page: Page,
  products: ProductSeedData[]
): Promise<string[]> {
  const response = await page.request.post(`${BASE_URL}/api/test/products/seed`, {
    data: products,
  });

  if (!response.ok()) {
    throw new Error(`Product seed API failed: ${response.status()}`);
  }

  const data = (await response.json()) as SeedResponse;

  if (!data.success || !data.productIds) {
    throw new Error(`Failed to seed products: ${data.error || 'Unknown error'}`);
  }

  return data.productIds;
}

/**
 * Create a test vendor with default values
 */
export function createTestVendor(
  overrides: Partial<VendorSeedData> = {}
): VendorSeedData {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);

  return {
    companyName: `Test Vendor ${timestamp}`,
    email: `vendor-${timestamp}-${random}@test.example.com`,
    password: 'SecureTestPass123!@#',
    tier: 'free',
    description: 'Test vendor for E2E testing',
    contactPhone: '+1-555-0000',
    status: 'approved',
    ...overrides,
  };
}

/**
 * Create a test product with default values
 */
export function createTestProduct(
  overrides: Partial<ProductSeedData> = {}
): ProductSeedData {
  return {
    name: `Test Product ${Date.now()}`,
    description: 'Test product for E2E testing',
    category: 'General',
    price: 10000,
    published: true,
    ...overrides,
  };
}

/**
 * Create multiple test vendors quickly
 */
export function createTestVendors(
  count: number,
  baseOverrides: Partial<VendorSeedData> = {}
): VendorSeedData[] {
  return Array.from({ length: count }, (_, index) =>
    createTestVendor({
      companyName: `Test Vendor ${index + 1} ${Date.now()}`,
      tier: ['free', 'tier1', 'tier2', 'tier3'][index % 4] as any,
      ...baseOverrides,
    })
  );
}

/**
 * Create multiple test products quickly
 */
export function createTestProducts(
  count: number,
  baseOverrides: Partial<ProductSeedData> = {}
): ProductSeedData[] {
  return Array.from({ length: count }, (_, index) =>
    createTestProduct({
      name: `Test Product ${index + 1} ${Date.now()}`,
      ...baseOverrides,
    })
  );
}

/**
 * Seed vendors and products in bulk
 */
export async function seedTestData(
  page: Page,
  options: {
    vendorCount?: number;
    productsPerVendor?: number;
    vendorOverrides?: Partial<VendorSeedData>;
    productOverrides?: Partial<ProductSeedData>;
  } = {}
): Promise<{
  vendorIds: string[];
  productIds: string[];
}> {
  const vendorCount = options.vendorCount || 1;
  const productsPerVendor = options.productsPerVendor || 0;

  // Create vendors
  const vendors = createTestVendors(vendorCount, options.vendorOverrides);
  const vendorIds = await seedVendors(page, vendors);

  // Create products if requested
  let productIds: string[] = [];
  if (productsPerVendor > 0) {
    const products: ProductSeedData[] = [];

    for (const vendorId of vendorIds) {
      const vendorProducts = createTestProducts(productsPerVendor, {
        vendor: vendorId,
        ...options.productOverrides,
      });
      products.push(...vendorProducts);
    }

    productIds = await seedProducts(page, products);
  }

  return { vendorIds, productIds };
}

/**
 * Wait for seeded data to be available
 * (useful for ISR/cache invalidation)
 */
export async function waitForSeedData(
  page: Page,
  vendorIds: string[],
  options: { timeout?: number } = {}
): Promise<void> {
  const timeout = options.timeout || 5000;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      // Try to load a seeded vendor
      const response = await page.request.get(
        `/api/public/vendors/${vendorIds[0]}`,
        {
          timeout: 2000,
        }
      );

      if (response.ok()) {
        return; // Data is available
      }
    } catch (error) {
      // Continue waiting
    }

    // Wait before retrying
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(
    `Timeout waiting for seeded data to become available (timeout: ${timeout}ms)`
  );
}

// ============================================================================
// Test Admin Helpers (bypasses authentication for E2E testing)
// ============================================================================

/**
 * Look up a vendor ID by email using the test API (no auth required)
 *
 * @param page - Playwright page object
 * @param email - The vendor's email address
 * @returns The vendor ID if found
 */
export async function lookupVendorIdByEmail(
  page: Page,
  email: string
): Promise<{ success: boolean; vendorId?: number; error?: string }> {
  const response = await page.request.get(
    `${BASE_URL}/api/test/vendors/lookup?email=${encodeURIComponent(email)}`
  );

  if (!response.ok()) {
    // Try alternative approach - use the list endpoint with a filter
    const listResponse = await page.request.get(`${BASE_URL}/api/test/vendors/list?email=${encodeURIComponent(email)}`);
    if (listResponse.ok()) {
      const data = await listResponse.json();
      if (data.vendors?.length > 0) {
        return { success: true, vendorId: data.vendors[0].id };
      }
    }
    return { success: false, error: 'Vendor not found' };
  }

  const data = await response.json();
  return { success: true, vendorId: data.vendorId || data.id };
}

/**
 * Reset a vendor's tier to a specific value via test API
 * This is essential for tests that depend on vendors being at specific tiers,
 * since tier approval tests permanently change vendor tiers.
 *
 * @param page - Playwright page object
 * @param vendorId - The vendor ID to reset
 * @param tier - The tier to set ('free', 'tier1', 'tier2', 'tier3')
 * @returns Success status
 */
export async function resetVendorTier(
  page: Page,
  vendorId: number | string,
  tier: 'free' | 'tier1' | 'tier2' | 'tier3'
): Promise<{ success: boolean; error?: string }> {
  console.log(`[Test Admin] Resetting vendor ${vendorId} to tier: ${tier}`);

  const response = await page.request.patch(`${BASE_URL}/api/test/admin/vendors/${vendorId}`, {
    data: { tier },
  });

  if (!response.ok()) {
    const errorText = await response.text();
    console.error(`[Test Admin] Tier reset failed:`, errorText);
    return { success: false, error: errorText };
  }

  console.log(`[Test Admin] Vendor ${vendorId} tier reset to ${tier}`);
  return { success: true };
}

/**
 * Reset a vendor's tier by email (looks up vendor first)
 * Convenience function that combines lookup and reset
 *
 * @param page - Playwright page object
 * @param email - The vendor's email address
 * @param tier - The tier to set
 * @returns Success status
 */
export async function resetVendorTierByEmail(
  page: Page,
  email: string,
  tier: 'free' | 'tier1' | 'tier2' | 'tier3'
): Promise<{ success: boolean; vendorId?: number; error?: string }> {
  console.log(`[Tier Reset] Resetting ${email} to ${tier} BEFORE login...`);

  // Use a simpler approach - just call the seed API with the updated tier
  // This effectively "re-seeds" the vendor with the correct tier
  const response = await page.request.post(`${BASE_URL}/api/test/vendors/reset-tier`, {
    data: { email, tier },
  });

  if (response.ok()) {
    const data = await response.json();
    console.log(`[Tier Reset] Success - vendor ${data.vendorId} reset to ${tier}`);
    return { success: true, vendorId: data.vendorId };
  }

  const errorText = await response.text();
  console.error(`[Tier Reset] API failed: ${response.status()} - ${errorText}`);

  // Fallback: lookup + reset
  const lookup = await lookupVendorIdByEmail(page, email);
  if (!lookup.success || !lookup.vendorId) {
    return { success: false, error: lookup.error || 'Vendor not found' };
  }

  const reset = await resetVendorTier(page, lookup.vendorId, tier);
  return { success: reset.success, vendorId: lookup.vendorId, error: reset.error };
}

/**
 * Get a vendor's current tier via the profile API
 *
 * @param page - Playwright page object (must be logged in as the vendor)
 * @returns The vendor's current tier
 */
export async function getVendorCurrentTier(
  page: Page
): Promise<{ success: boolean; tier?: string; vendorId?: number; error?: string }> {
  const response = await page.request.get(`${BASE_URL}/api/portal/vendors/profile`);

  if (!response.ok()) {
    const errorText = await response.text();
    return { success: false, error: errorText };
  }

  const data = await response.json();
  return {
    success: true,
    tier: data.vendor?.tier,
    vendorId: data.vendor?.id,
  };
}

/**
 * Approve a tier upgrade/downgrade request via test API
 * This bypasses admin authentication for E2E testing
 */
export async function adminApproveTierRequest(
  page: Page,
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  console.log(`[Test Admin] Approving tier request: ${requestId}`);

  const response = await page.request.post(`${BASE_URL}/api/test/admin/tier-requests/approve`, {
    data: { requestId },
  });

  const data = await response.json();

  if (!response.ok()) {
    console.error(`[Test Admin] Approval failed:`, data.error);
    return { success: false, error: data.error };
  }

  console.log(`[Test Admin] Tier request approved successfully`);
  return { success: true };
}

/**
 * Reject a tier upgrade/downgrade request via test API
 * This bypasses admin authentication for E2E testing
 */
export async function adminRejectTierRequest(
  page: Page,
  requestId: string,
  rejectionReason: string
): Promise<{ success: boolean; error?: string }> {
  console.log(`[Test Admin] Rejecting tier request: ${requestId}`);

  const response = await page.request.post(`${BASE_URL}/api/test/admin/tier-requests/reject`, {
    data: { requestId, rejectionReason },
  });

  const data = await response.json();

  if (!response.ok()) {
    console.error(`[Test Admin] Rejection failed:`, data.error);
    return { success: false, error: data.error };
  }

  console.log(`[Test Admin] Tier request rejected successfully`);
  return { success: true };
}

/**
 * List tier requests via test API
 * This bypasses admin authentication for E2E testing
 */
export async function adminListTierRequests(
  page: Page,
  filters?: {
    status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
    requestType?: 'upgrade' | 'downgrade';
    vendorId?: string;
  }
): Promise<{
  success: boolean;
  requests?: Array<{
    id: string;
    vendor: string;
    currentTier: string;
    requestedTier: string;
    requestType: string;
    status: string;
    vendorNotes?: string;
    rejectionReason?: string;
    requestedAt: string;
  }>;
  error?: string;
}> {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.requestType) params.set('requestType', filters.requestType);
  if (filters?.vendorId) params.set('vendorId', filters.vendorId);

  const url = `/api/test/admin/tier-requests${params.toString() ? `?${params.toString()}` : ''}`;

  const response = await page.request.get(url);
  const data = await response.json();

  if (!response.ok()) {
    return { success: false, error: data.error };
  }

  return { success: true, requests: data.data?.requests || [] };
}
