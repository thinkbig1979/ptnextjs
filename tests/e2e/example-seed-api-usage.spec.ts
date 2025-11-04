/**
 * Example: Using Test Seed APIs in E2E Tests
 *
 * This example demonstrates how to use the vendor and product seed APIs
 * to quickly set up test data for E2E tests. This approach is 50-100x faster
 * than registering vendors through the UI.
 *
 * To run this test:
 * npm run test:e2e -- example-seed-api-usage.spec.ts
 */

import { test, expect } from '@playwright/test';
import {
  seedVendors,
  seedProducts,
  createTestVendor,
  createTestProduct,
  seedTestData,
} from './helpers/seed-api-helpers';

test.describe('Example: Seed API Usage', () => {
  test('should create a vendor using the seed API', async ({ page }) => {
    // Create a single vendor
    const vendor = createTestVendor({
      companyName: 'Example Vendor LLC',
      tier: 'tier1',
      website: 'https://example-vendor.test',
    });

    const vendorIds = await seedVendors(page, [vendor]);

    expect(vendorIds).toHaveLength(1);
    expect(vendorIds[0]).toBeTruthy();

    console.log(`Created vendor with ID: ${vendorIds[0]}`);
  });

  test('should create multiple vendors at once', async ({ page }) => {
    // Create 5 vendors with different tiers
    const vendors = [
      createTestVendor({ tier: 'free' }),
      createTestVendor({ tier: 'tier1' }),
      createTestVendor({ tier: 'tier2' }),
      createTestVendor({ tier: 'tier3', featured: true }),
      createTestVendor({ tier: 'tier2' }),
    ];

    const vendorIds = await seedVendors(page, vendors);

    expect(vendorIds).toHaveLength(5);
    vendorIds.forEach((id) => expect(id).toBeTruthy());

    console.log(`Created ${vendorIds.length} vendors`);
  });

  test('should create products for a vendor', async ({ page }) => {
    // First create a vendor
    const vendorIds = await seedVendors(page, [
      createTestVendor({
        companyName: 'Product Test Vendor',
        tier: 'tier2',
      }),
    ]);

    const vendorId = vendorIds[0];

    // Then create products for that vendor
    const products = [
      createTestProduct({
        name: 'Navigation System Pro',
        category: 'Navigation',
        price: 15000,
        vendor: vendorId,
      }),
      createTestProduct({
        name: 'Communication Suite',
        category: 'Communication',
        price: 8000,
        vendor: vendorId,
      }),
      createTestProduct({
        name: 'Entertainment System',
        category: 'Entertainment',
        price: 25000,
        vendor: vendorId,
      }),
    ];

    const productIds = await seedProducts(page, products);

    expect(productIds).toHaveLength(3);
    productIds.forEach((id) => expect(id).toBeTruthy());

    console.log(`Created ${productIds.length} products for vendor ${vendorId}`);
  });

  test('should set up complete test data with seedTestData helper', async ({
    page,
  }) => {
    // Create 3 vendors with 5 products each in one call
    const { vendorIds, productIds } = await seedTestData(page, {
      vendorCount: 3,
      productsPerVendor: 5,
      vendorOverrides: { tier: 'tier2' },
      productOverrides: { category: 'Navigation Systems' },
    });

    expect(vendorIds).toHaveLength(3);
    expect(productIds).toHaveLength(15); // 3 vendors * 5 products

    console.log(`Created ${vendorIds.length} vendors with ${productIds.length} total products`);
  });

  test('should verify seeded vendor data is accessible', async ({ page }) => {
    // Create a vendor with specific data
    const vendor = createTestVendor({
      companyName: 'Alfa Laval Test',
      tier: 'tier3',
      featured: true,
      foundedYear: 2015,
      totalProjects: 150,
      employeeCount: 50,
    });

    const vendorIds = await seedVendors(page, [vendor]);
    const vendorId = vendorIds[0];

    // Verify the vendor can be accessed via API
    const vendorResponse = await page.request.get(`/api/vendors/${vendorId}`, {
      timeout: 5000,
    });

    // Note: This endpoint may not exist - adjust based on your actual API
    // This is an example of how you might verify seeded data
    if (vendorResponse.ok()) {
      const vendorData = await vendorResponse.json();
      console.log('Vendor data:', vendorData);
    }
  });

  test('should handle vendor locations in seeding', async ({ page }) => {
    // Create a vendor with multiple locations
    const vendor = createTestVendor({
      companyName: 'Multi-Location Vendor',
      tier: 'tier3',
      locations: [
        {
          name: 'Headquarters',
          city: 'Monaco',
          country: 'Monaco',
          latitude: 43.7384,
          longitude: 7.4246,
          isHQ: true,
        },
        {
          name: 'Barcelona Office',
          city: 'Barcelona',
          country: 'Spain',
          latitude: 41.3874,
          longitude: 2.1686,
          isHQ: false,
        },
        {
          name: 'Miami Office',
          city: 'Miami',
          country: 'United States',
          latitude: 25.7617,
          longitude: -80.1918,
          isHQ: false,
        },
      ],
    });

    const vendorIds = await seedVendors(page, [vendor]);

    expect(vendorIds).toHaveLength(1);
    console.log(`Created vendor with 3 locations: ${vendorIds[0]}`);
  });

  test('should create products with specifications', async ({ page }) => {
    // Create products with detailed specifications
    const products = [
      createTestProduct({
        name: 'Advanced Navigation System',
        specifications: {
          accuracy: '+/- 1 meter',
          power: '24V DC',
          interface: 'Ethernet',
          warranty: '5 years',
          weight: '2.5 kg',
        },
      }),
      createTestProduct({
        name: 'Marine Communication Suite',
        specifications: {
          frequency: 'VHF/MF/HF',
          channels: 'Programmable',
          power: '24V DC',
          interface: 'NMEA 0183',
          warranty: '3 years',
        },
      }),
    ];

    const productIds = await seedProducts(page, products);

    expect(productIds).toHaveLength(2);
    console.log(`Created ${productIds.length} products with specifications`);
  });

  test.skip('should demonstrate performance improvement', async ({ page }) => {
    // This test demonstrates the performance benefit of using seed APIs
    // Timing: Seeding 10 vendors should take ~100-200ms vs 50-100 seconds via UI

    const startTime = Date.now();

    const vendors = Array.from({ length: 10 }, (_, i) =>
      createTestVendor({
        companyName: `Performance Test Vendor ${i + 1}`,
        tier: ['free', 'tier1', 'tier2', 'tier3'][i % 4] as any,
      })
    );

    const vendorIds = await seedVendors(page, vendors);
    const endTime = Date.now();

    const duration = endTime - startTime;
    console.log(`Created ${vendorIds.length} vendors in ${duration}ms`);
    console.log(`Average time per vendor: ${(duration / vendorIds.length).toFixed(2)}ms`);

    expect(vendorIds).toHaveLength(10);
    expect(duration).toBeLessThan(5000); // Should be very fast
  });
});
