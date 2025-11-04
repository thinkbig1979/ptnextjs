# Seed API Quick Start Guide

## Generate Test Fixtures (5 seconds)

```bash
npm run test:fixtures:generate
```

This creates placeholder images in `tests/fixtures/`:
- `team-member.jpg` (300x300px)
- `case-study-1.jpg` (800x600px)
- `product-image.jpg` (600x600px)

## Create Test Vendors (via API)

```typescript
import { seedVendors, createTestVendor } from './helpers/seed-api-helpers';

// Single vendor
const vendors = await seedVendors(page, [
  createTestVendor({
    companyName: 'My Test Company',
    tier: 'tier2',
    featured: true,
  }),
]);
console.log('Created vendor:', vendors[0]);

// Multiple vendors at once
const manyVendors = await seedVendors(page, [
  createTestVendor({ tier: 'free' }),
  createTestVendor({ tier: 'tier1' }),
  createTestVendor({ tier: 'tier2', featured: true }),
]);
```

## Create Test Products (via API)

```typescript
import { seedProducts, createTestProduct } from './helpers/seed-api-helpers';

// Single product
const products = await seedProducts(page, [
  createTestProduct({
    name: 'Navigation System Pro',
    vendor: vendorId, // or vendor slug
    price: 15000,
  }),
]);

// Multiple products
const manyProducts = await seedProducts(page, [
  createTestProduct({ name: 'Product 1', category: 'Navigation' }),
  createTestProduct({ name: 'Product 2', category: 'Communication' }),
  createTestProduct({ name: 'Product 3', category: 'Entertainment' }),
]);
```

## Quick Test Setup Pattern

```typescript
test('full vendor profile test', async ({ page }) => {
  // Setup: Create a complete vendor with products
  const { vendorIds, productIds } = await seedTestData(page, {
    vendorCount: 1,
    productsPerVendor: 5,
    vendorOverrides: {
      companyName: 'Test Vendor Inc',
      tier: 'tier3',
      featured: true,
    },
  });

  // Test: Navigate and verify
  await page.goto(`/vendors/${vendorIds[0]}`);
  await expect(page.locator('h1')).toContainText('Test Vendor Inc');

  // Verify products are displayed
  const products = await page.locator('[data-testid="product-card"]').count();
  expect(products).toBeGreaterThan(0);
});
```

## Available Helper Functions

```typescript
// Create factories
createTestVendor(overrides?)          // Single vendor with defaults
createTestVendors(count, overrides?)  // Multiple vendors
createTestProduct(overrides?)         // Single product with defaults
createTestProducts(count, overrides?) // Multiple products

// Seed functions
seedVendors(page, vendorArray)        // Create vendors via API
seedProducts(page, productArray)      // Create products via API
seedTestData(page, options)           // Create vendors + products at once

// Utilities
waitForSeedData(page, vendorIds)      // Wait for ISR/cache refresh
```

## Common Patterns

### Pattern 1: Setup Featured Vendors
```typescript
const vendors = await seedTestData(page, {
  vendorCount: 5,
  vendorOverrides: { featured: true, tier: 'tier3' },
});
```

### Pattern 2: Setup Vendor with Locations
```typescript
const vendors = await seedVendors(page, [
  createTestVendor({
    companyName: 'Global Company',
    tier: 'tier3',
    locations: [
      {
        name: 'HQ Monaco',
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
    ],
  }),
]);
```

### Pattern 3: Products with Specifications
```typescript
const products = await seedProducts(page, [
  createTestProduct({
    name: 'Advanced Navigation',
    specifications: {
      accuracy: '+/- 1 meter',
      power: '24V DC',
      warranty: '5 years',
    },
  }),
]);
```

### Pattern 4: Different Tiers
```typescript
const tiers = ['free', 'tier1', 'tier2', 'tier3'];
const vendors = await seedVendors(page,
  tiers.map(tier =>
    createTestVendor({ tier, companyName: `${tier} Vendor` })
  )
);
```

## API Endpoints

### `POST /api/test/vendors/seed`
Creates vendors in bulk. Only works in development/test.

**Request:**
```json
[
  {
    "companyName": "Vendor Name",
    "email": "vendor@example.com",
    "password": "SecurePass123!",
    "tier": "tier2",
    "status": "approved"
  }
]
```

**Response:**
```json
{
  "success": true,
  "vendorIds": ["id1", "id2"],
  "count": 2
}
```

### `POST /api/test/products/seed`
Creates products in bulk. Only works in development/test.

**Request:**
```json
[
  {
    "name": "Product Name",
    "vendor": "vendor-id",
    "price": 10000
  }
]
```

**Response:**
```json
{
  "success": true,
  "productIds": ["id1"],
  "count": 1
}
```

## Performance

| Operation | Time | Speedup |
|-----------|------|---------|
| Create 1 vendor via API | 50-100ms | 50-100x faster than UI |
| Create 1 product via API | 20-50ms | 40-150x faster than UI |
| Create 50 vendors + 200 products | ~10s | 50x faster than UI (~500s) |

## Troubleshooting

**Q: API returns 403 Forbidden**
- A: Check NODE_ENV is `test` or `development` (not production)

**Q: "duplicate email" error**
- A: Use timestamps in email: `vendor-${Date.now()}@test.example.com`

**Q: Fixtures not generated**
- A: Run `npm run test:fixtures:generate`
- Check write permissions on `tests/fixtures/`
- Ensure Sharp is installed: `npm install sharp`

**Q: Products not linked to vendor**
- A: Vendor ID must exist before creating products
- Use correct vendor ID or slug format

## Files Used

- API Endpoints:
  - `app/api/test/vendors/seed/route.ts`
  - `app/api/test/products/seed/route.ts`

- Helpers:
  - `tests/e2e/helpers/seed-api-helpers.ts`

- Examples:
  - `tests/e2e/example-seed-api-usage.spec.ts`

- Documentation:
  - `TEST_INFRASTRUCTURE.md` (detailed reference)
  - `INFRASTRUCTURE_TASKS_COMPLETE.md` (completion report)

## Next: Write Your Test

Now you're ready to write super-fast E2E tests! See `tests/e2e/example-seed-api-usage.spec.ts` for more examples.
