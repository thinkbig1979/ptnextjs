/**
 * Seed API Helper Functions
 *
 * Utility functions for using the test seed APIs in E2E tests.
 * These helpers simplify bulk data creation for tests.
 */

import { Page } from '@playwright/test';

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
  const response = await page.request.post('/api/test/vendors/seed', {
    data: vendors,
  });

  if (!response.ok()) {
    throw new Error(`Vendor seed API failed: ${response.status()}`);
  }

  const data = (await response.json()) as SeedResponse;

  if (!data.success || !data.vendorIds) {
    throw new Error(`Failed to seed vendors: ${data.error || 'Unknown error'}`);
  }

  return data.vendorIds;
}

/**
 * Create test products using the seed API
 */
export async function seedProducts(
  page: Page,
  products: ProductSeedData[]
): Promise<string[]> {
  const response = await page.request.post('/api/test/products/seed', {
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
        `/api/vendors/${vendorIds[0]}`,
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
