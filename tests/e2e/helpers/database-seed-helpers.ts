/**
 * Database Seed Helpers for E2E Tests
 *
 * Functions to seed test data into the database for vendor onboarding tests.
 */

import { Page } from '@playwright/test';
import { VendorTestData, ProductData, LocationData } from './vendor-onboarding-helpers';

const API_BASE = process.env.BASE_URL || 'http://localhost:3000';

// ============================================================================
// Vendor Seeding
// ============================================================================

/**
 * Seed vendor into database via API
 */
export async function seedVendor(
  page: Page,
  vendorData: VendorTestData
): Promise<string> {
  console.log(`[Seed] Creating vendor: ${vendorData.email}`);

  const response = await page.request.post(`${API_BASE}/api/test/vendors/seed`, {
    data: vendorData,
  });

  if (!response.ok()) {
    const errorText = await response.text();
    throw new Error(`Failed to seed vendor: ${response.status()} - ${errorText}`);
  }

  const result = await response.json();
  const vendorId = result.id || result.vendorId || result.data?.id;

  if (!vendorId) {
    throw new Error('Vendor ID not returned from seed API');
  }

  console.log(`[Seed] Vendor created with ID: ${vendorId}`);
  return vendorId;
}

/**
 * Seed multiple vendors
 */
export async function seedVendors(
  page: Page,
  vendors: VendorTestData[]
): Promise<string[]> {
  console.log(`[Seed] Creating ${vendors.length} vendors`);

  const vendorIds: string[] = [];

  for (const vendor of vendors) {
    const vendorId = await seedVendor(page, vendor);
    vendorIds.push(vendorId);
  }

  console.log(`[Seed] Created ${vendorIds.length} vendors`);
  return vendorIds;
}

/**
 * Seed vendors from JSON fixture
 */
export async function seedVendorsFromFixture(
  page: Page,
  fixturePath: string = 'tests/fixtures/sample-vendors.json'
): Promise<string[]> {
  console.log(`[Seed] Loading vendors from fixture: ${fixturePath}`);

  const fs = require('fs');
  const fixtureData = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));

  return await seedVendors(page, fixtureData.vendors);
}

// ============================================================================
// Product Seeding
// ============================================================================

/**
 * Seed product for a vendor
 */
export async function seedProduct(
  page: Page,
  vendorId: string,
  productData: ProductData
): Promise<string> {
  console.log(`[Seed] Creating product: ${productData.name} for vendor ${vendorId}`);

  const response = await page.request.post(`${API_BASE}/api/test/products/seed`, {
    data: {
      ...productData,
      vendorId,
    },
  });

  if (!response.ok()) {
    const errorText = await response.text();
    throw new Error(`Failed to seed product: ${response.status()} - ${errorText}`);
  }

  const result = await response.json();
  const productId = result.id || result.productId || result.data?.id;

  if (!productId) {
    throw new Error('Product ID not returned from seed API');
  }

  console.log(`[Seed] Product created with ID: ${productId}`);
  return productId;
}

/**
 * Seed multiple products for a vendor
 */
export async function seedProducts(
  page: Page,
  vendorId: string,
  products: ProductData[]
): Promise<string[]> {
  console.log(`[Seed] Creating ${products.length} products for vendor ${vendorId}`);

  const productIds: string[] = [];

  for (const product of products) {
    const productId = await seedProduct(page, vendorId, product);
    productIds.push(productId);
  }

  console.log(`[Seed] Created ${productIds.length} products`);
  return productIds;
}

/**
 * Seed products from JSON fixture
 */
export async function seedProductsFromFixture(
  page: Page,
  vendorId: string,
  fixturePath: string = 'tests/fixtures/sample-products.json'
): Promise<string[]> {
  console.log(`[Seed] Loading products from fixture: ${fixturePath}`);

  const fs = require('fs');
  const fixtureData = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));

  return await seedProducts(page, vendorId, fixtureData.products);
}

// ============================================================================
// Location Seeding
// ============================================================================

/**
 * Seed location for a vendor
 */
export async function seedLocation(
  page: Page,
  vendorId: string,
  locationData: LocationData
): Promise<string> {
  console.log(`[Seed] Creating location: ${locationData.name} for vendor ${vendorId}`);

  const response = await page.request.post(
    `${API_BASE}/api/portal/vendors/${vendorId}/locations`,
    {
      data: locationData,
    }
  );

  if (!response.ok()) {
    const errorText = await response.text();
    throw new Error(`Failed to seed location: ${response.status()} - ${errorText}`);
  }

  const result = await response.json();
  const locationId = result.id || result.locationId || result.data?.id;

  if (!locationId) {
    throw new Error('Location ID not returned from seed API');
  }

  console.log(`[Seed] Location created with ID: ${locationId}`);
  return locationId;
}

/**
 * Seed multiple locations for a vendor
 */
export async function seedLocations(
  page: Page,
  vendorId: string,
  locations: LocationData[]
): Promise<string[]> {
  console.log(`[Seed] Creating ${locations.length} locations for vendor ${vendorId}`);

  const locationIds: string[] = [];

  for (const location of locations) {
    const locationId = await seedLocation(page, vendorId, location);
    locationIds.push(locationId);
  }

  console.log(`[Seed] Created ${locationIds.length} locations`);
  return locationIds;
}

// ============================================================================
// Complete Vendor Setup
// ============================================================================

/**
 * Seed complete vendor profile with all related data
 */
export async function seedCompleteVendorProfile(
  page: Page,
  vendorData: VendorTestData,
  options?: {
    products?: ProductData[];
    locations?: LocationData[];
    certifications?: any[];
    teamMembers?: any[];
  }
): Promise<string> {
  console.log(`[Seed] Creating complete vendor profile: ${vendorData.email}`);

  // Create vendor
  const vendorId = await seedVendor(page, vendorData);

  // Seed products if provided
  if (options?.products && options.products.length > 0) {
    await seedProducts(page, vendorId, options.products);
  }

  // Seed locations if provided
  if (options?.locations && options.locations.length > 0) {
    await seedLocations(page, vendorId, options.locations);
  }

  // Note: Certifications and team members would be seeded via profile update API
  // if they're managed as relational data

  console.log(`[Seed] Complete vendor profile created: ${vendorId}`);
  return vendorId;
}

// ============================================================================
// Cleanup Helpers
// ============================================================================

/**
 * Delete test vendor
 */
export async function deleteVendor(page: Page, vendorId: string): Promise<void> {
  console.log(`[Cleanup] Deleting vendor: ${vendorId}`);

  const response = await page.request.delete(`${API_BASE}/api/test/vendors/${vendorId}`);

  if (!response.ok()) {
    console.warn(`[Cleanup] Failed to delete vendor: ${response.status()}`);
  } else {
    console.log(`[Cleanup] Vendor deleted: ${vendorId}`);
  }
}

/**
 * Delete test product
 */
export async function deleteProduct(page: Page, productId: string): Promise<void> {
  console.log(`[Cleanup] Deleting product: ${productId}`);

  const response = await page.request.delete(`${API_BASE}/api/test/products/${productId}`);

  if (!response.ok()) {
    console.warn(`[Cleanup] Failed to delete product: ${response.status()}`);
  } else {
    console.log(`[Cleanup] Product deleted: ${productId}`);
  }
}

/**
 * Cleanup all test data created during test run
 */
export async function cleanupTestData(
  page: Page,
  data: {
    vendorIds?: string[];
    productIds?: string[];
  }
): Promise<void> {
  console.log(`[Cleanup] Cleaning up test data`);

  // Delete products first (foreign key constraints)
  if (data.productIds) {
    for (const productId of data.productIds) {
      await deleteProduct(page, productId).catch((err) =>
        console.warn(`Failed to delete product ${productId}:`, err)
      );
    }
  }

  // Delete vendors
  if (data.vendorIds) {
    for (const vendorId of data.vendorIds) {
      await deleteVendor(page, vendorId).catch((err) =>
        console.warn(`Failed to delete vendor ${vendorId}:`, err)
      );
    }
  }

  console.log(`[Cleanup] Test data cleanup complete`);
}

/**
 * Reset database to clean state
 * WARNING: This deletes ALL test data
 */
export async function resetTestDatabase(page: Page): Promise<void> {
  console.log(`[Cleanup] Resetting test database (WARNING: deletes all test data)`);

  const response = await page.request.post(`${API_BASE}/api/test/reset-database`, {
    data: { confirm: true },
  });

  if (!response.ok()) {
    throw new Error(`Failed to reset database: ${response.status()}`);
  }

  console.log(`[Cleanup] Test database reset complete`);
}
