# Testing Strategy

**Spec:** Multi-Location Support for Vendors
**Date:** 2025-10-22
**Testing Framework:** Jest, React Testing Library, Playwright
**Coverage Target:** 80% minimum

## Testing Framework

### Primary Testing Framework

**Framework:** Jest 29.x with React Testing Library

**Justification:**
- Jest is the de facto standard for React/Next.js testing
- React Testing Library enforces testing best practices (test behavior, not implementation)
- Excellent integration with TypeScript and ESM modules
- Built-in code coverage reporting

**Testing Tool Ecosystem:**
- **Unit Tests:** Jest + React Testing Library
- **Integration Tests:** Jest + Payload CMS test utilities
- **E2E Tests:** Playwright
- **API Testing:** Supertest + Payload CMS test instance
- **Mocking:** MSW (Mock Service Worker) for API mocking

**Test Runner Configuration:**

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.stories.tsx',
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

```javascript
// jest.setup.js
import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Establish API mocking before all tests
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished
afterAll(() => server.close());
```

## Test Types and Coverage

### Unit Tests: Component-Level Testing Strategy

**Scope:** Individual React components, utility functions, services

**Coverage Target:** 90%+ for critical business logic (tier restrictions, HQ validation), 80%+ for UI components

**Critical Components to Test:**

**LocationFormFields Component:**
```typescript
// tests/components/LocationFormFields.test.tsx
describe('LocationFormFields', () => {
  it('renders all form fields with correct labels', () => {
    // Test: All inputs (address, city, country, lat, lng) render
    // Test: Labels have correct htmlFor associations
  });

  it('validates address field (required, max 500 chars)', () => {
    // Test: Empty address shows error "Address is required"
    // Test: 501 char address shows error "Address must be less than 500 characters"
  });

  it('validates latitude/longitude ranges', () => {
    // Test: Latitude 91 shows error "Latitude must be between -90 and 90"
    // Test: Longitude 181 shows error "Longitude must be between -180 and 180"
    // Test: Valid coordinates pass validation
  });

  it('calls onChange callback when fields update', () => {
    // Test: Type in address field, verify onChange called with updated location
    // Test: Update city field, verify onChange called with correct payload
  });

  it('disables fields when canEdit is false', () => {
    // Test: Pass canEdit={false}, verify all inputs disabled
  });

  it('displays HQ badge when isHQ is true', () => {
    // Test: Pass isHQ={true}, verify "Headquarters" badge visible
  });
});
```

**LocationsManagerCard Component:**
```typescript
// tests/components/LocationsManagerCard.test.tsx
describe('LocationsManagerCard', () => {
  it('renders existing locations from vendor prop', () => {
    // Test: Pass vendor with 3 locations, verify 3 LocationFormFields render
  });

  it('adds new location when "Add Location" button clicked', () => {
    // Test: Click add button, verify new empty LocationFormFields appears
  });

  it('removes location when delete button clicked', () => {
    // Test: Click delete on second location, verify only 2 locations remain
  });

  it('prevents HQ deletion if other locations exist', () => {
    // Test: Try to delete HQ location, verify error message "Cannot delete HQ. Designate another location as HQ first."
  });

  it('enforces exactly one HQ location', () => {
    // Test: Check isHQ on second location, verify first location's isHQ unchecked
    // Test: Uncheck all isHQ, verify error "One location must be designated as HQ"
  });

  it('calls onUpdate with updated locations array on save', async () => {
    // Test: Edit location, click save, verify onUpdate called with PATCH payload
  });

  it('displays loading state during save', async () => {
    // Test: Click save, verify save button shows spinner and "Saving..." text
  });

  it('displays error toast on save failure', async () => {
    // Test: Mock API failure, click save, verify error toast appears
  });

  it('reverts optimistic update on save failure', async () => {
    // Test: Edit location, save fails, verify UI reverts to original state
  });
});
```

**TierService Utility:**
```typescript
// tests/lib/TierService.test.ts
describe('TierService', () => {
  describe('canManageMultipleLocations', () => {
    it('returns true for tier2 vendors', () => {
      expect(TierService.canManageMultipleLocations('tier2')).toBe(true);
    });

    it('returns false for tier1 vendors', () => {
      expect(TierService.canManageMultipleLocations('tier1')).toBe(false);
    });

    it('returns false for free tier vendors', () => {
      expect(TierService.canManageMultipleLocations('free')).toBe(false);
    });
  });

  describe('validateLocationsTier', () => {
    it('allows single location for free tier', () => {
      const result = TierService.validateLocationsTier('free', [mockLocation]);
      expect(result.valid).toBe(true);
    });

    it('rejects multiple locations for tier1', () => {
      const result = TierService.validateLocationsTier('tier1', [mockLocation, mockLocation2]);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Multiple locations require Tier 2');
    });

    it('allows multiple locations for tier2', () => {
      const result = TierService.validateLocationsTier('tier2', [mockLocation, mockLocation2, mockLocation3]);
      expect(result.valid).toBe(true);
    });
  });
});
```

**LocationService Utility:**
```typescript
// tests/lib/LocationService.test.ts
describe('LocationService', () => {
  describe('validateHQUniqueness', () => {
    it('passes when exactly one location is HQ', () => {
      const locations = [
        { ...mockLocation, isHQ: true },
        { ...mockLocation2, isHQ: false },
      ];
      expect(LocationService.validateHQUniqueness(locations)).toBe(true);
    });

    it('fails when no locations are HQ', () => {
      const locations = [
        { ...mockLocation, isHQ: false },
        { ...mockLocation2, isHQ: false },
      ];
      expect(() => LocationService.validateHQUniqueness(locations))
        .toThrow('At least one location must be designated as Headquarters');
    });

    it('fails when multiple locations are HQ', () => {
      const locations = [
        { ...mockLocation, isHQ: true },
        { ...mockLocation2, isHQ: true },
      ];
      expect(() => LocationService.validateHQUniqueness(locations))
        .toThrow('Only one location can be designated as Headquarters');
    });
  });

  describe('calculateDistance', () => {
    it('calculates distance between two coordinates in kilometers', () => {
      const coord1 = { lat: 26.122439, lng: -80.137314 }; // Fort Lauderdale
      const coord2 = { lat: 25.761681, lng: -80.191788 }; // Miami
      const distance = LocationService.calculateDistance(coord1, coord2);
      expect(distance).toBeCloseTo(43.5, 1); // ~43.5 km
    });

    it('returns 0 for identical coordinates', () => {
      const coord = { lat: 26.122439, lng: -80.137314 };
      const distance = LocationService.calculateDistance(coord, coord);
      expect(distance).toBe(0);
    });
  });
});
```

### Integration Tests: System Interaction Validation

**Scope:** API endpoints, database interactions, Payload CMS hooks

**Coverage Target:** 85%+ for critical API endpoints and business logic

**API Endpoint Tests:**

```typescript
// tests/api/vendors.integration.test.ts
describe('PATCH /api/vendors/:id', () => {
  let testVendor: Vendor;
  let authToken: string;

  beforeEach(async () => {
    // Create test vendor with tier2
    testVendor = await createTestVendor({ tier: 'tier2' });
    authToken = await getAuthToken(testVendor.user);
  });

  it('updates vendor locations array successfully', async () => {
    const response = await request(app)
      .patch(`/api/vendors/${testVendor.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        locations: [
          { address: '123 Main St', latitude: 26.122, longitude: -80.137, city: 'Fort Lauderdale', country: 'USA', isHQ: true },
          { address: '456 Beach Rd', latitude: 25.761, longitude: -80.191, city: 'Miami', country: 'USA', isHQ: false },
        ],
      });

    expect(response.status).toBe(200);
    expect(response.body.data.locations).toHaveLength(2);
    expect(response.body.data.locations[0].isHQ).toBe(true);
  });

  it('rejects multiple HQ locations', async () => {
    const response = await request(app)
      .patch(`/api/vendors/${testVendor.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        locations: [
          { address: '123 Main St', latitude: 26.122, longitude: -80.137, city: 'Fort Lauderdale', country: 'USA', isHQ: true },
          { address: '456 Beach Rd', latitude: 25.761, longitude: -80.191, city: 'Miami', country: 'USA', isHQ: true },
        ],
      });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toContain('Only one location can be designated as Headquarters');
  });

  it('rejects multiple locations for tier1 vendor', async () => {
    const tier1Vendor = await createTestVendor({ tier: 'tier1' });
    const tier1Token = await getAuthToken(tier1Vendor.user);

    const response = await request(app)
      .patch(`/api/vendors/${tier1Vendor.id}`)
      .set('Authorization', `Bearer ${tier1Token}`)
      .send({
        locations: [
          { address: '123 Main St', latitude: 26.122, longitude: -80.137, city: 'Fort Lauderdale', country: 'USA', isHQ: true },
          { address: '456 Beach Rd', latitude: 25.761, longitude: -80.191, city: 'Miami', country: 'USA', isHQ: false },
        ],
      });

    expect(response.status).toBe(403);
    expect(response.body.error.message).toContain('Multiple locations require Tier 2 subscription');
  });

  it('rejects unauthorized access (different vendor)', async () => {
    const otherVendor = await createTestVendor({ tier: 'tier2' });
    const otherToken = await getAuthToken(otherVendor.user);

    const response = await request(app)
      .patch(`/api/vendors/${testVendor.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ locations: [mockLocation] });

    expect(response.status).toBe(403);
  });

  it('allows admin to update any vendor', async () => {
    const adminToken = await getAdminAuthToken();

    const response = await request(app)
      .patch(`/api/vendors/${testVendor.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ locations: [mockLocation, mockLocation2] });

    expect(response.status).toBe(200);
  });
});

describe('GET /api/vendors/search', () => {
  beforeEach(async () => {
    // Create test vendors with various locations
    await createTestVendor({
      tier: 'tier2',
      locations: [
        { lat: 26.122, lng: -80.137, isHQ: true, city: 'Fort Lauderdale' },
        { lat: 25.761, lng: -80.191, isHQ: false, city: 'Miami' },
      ],
    });
    await createTestVendor({
      tier: 'tier1',
      locations: [
        { lat: 40.712, lng: -74.006, isHQ: true, city: 'New York' },
      ],
    });
  });

  it('returns vendors within radius including HQ for all tiers', async () => {
    const response = await request(app)
      .get('/api/vendors/search')
      .query({ latitude: 26.0, longitude: -80.0, radius: 50 });

    expect(response.status).toBe(200);
    expect(response.body.data.vendors).toHaveLength(1); // Only Fort Lauderdale vendor in range
    expect(response.body.data.vendors[0].matchedLocations).toHaveLength(2); // HQ + additional location for tier2
  });

  it('includes only HQ for tier1 vendors', async () => {
    const response = await request(app)
      .get('/api/vendors/search')
      .query({ latitude: 40.7, longitude: -74.0, radius: 10 });

    expect(response.status).toBe(200);
    const tier1Vendor = response.body.data.vendors.find((v: any) => v.tier === 'tier1');
    expect(tier1Vendor.matchedLocations).toHaveLength(1);
    expect(tier1Vendor.matchedLocations[0].isHQ).toBe(true);
  });

  it('calculates distance from search center', async () => {
    const response = await request(app)
      .get('/api/vendors/search')
      .query({ latitude: 26.0, longitude: -80.0, radius: 100 });

    expect(response.status).toBe(200);
    response.body.data.vendors.forEach((vendor: any) => {
      vendor.matchedLocations.forEach((loc: any) => {
        expect(loc.distance).toBeDefined();
        expect(loc.distance).toBeLessThanOrEqual(100);
      });
    });
  });
});
```

**Payload CMS Hook Tests:**

```typescript
// tests/payload/vendors.hooks.test.ts
describe('Vendors Collection Hooks', () => {
  let payload: Payload;

  beforeAll(async () => {
    payload = await getPayloadClient();
  });

  describe('beforeChange hook: auto-designate first location as HQ', () => {
    it('sets isHQ=true on first location if none specified', async () => {
      const vendor = await payload.create({
        collection: 'vendors',
        data: {
          companyName: 'Test Co',
          tier: 'tier2',
          locations: [
            { address: '123 Main', latitude: 26.1, longitude: -80.1, city: 'Miami', country: 'USA' },
          ],
        },
      });

      expect(vendor.locations[0].isHQ).toBe(true);
    });
  });

  describe('validation hook: HQ uniqueness', () => {
    it('rejects vendor with zero HQ locations', async () => {
      await expect(
        payload.create({
          collection: 'vendors',
          data: {
            companyName: 'Test Co',
            tier: 'tier2',
            locations: [
              { address: '123 Main', latitude: 26.1, longitude: -80.1, city: 'Miami', country: 'USA', isHQ: false },
            ],
          },
        })
      ).rejects.toThrow('At least one location must be designated as Headquarters');
    });

    it('rejects vendor with multiple HQ locations', async () => {
      await expect(
        payload.create({
          collection: 'vendors',
          data: {
            companyName: 'Test Co',
            tier: 'tier2',
            locations: [
              { address: '123 Main', latitude: 26.1, longitude: -80.1, city: 'Miami', country: 'USA', isHQ: true },
              { address: '456 Beach', latitude: 25.7, longitude: -80.2, city: 'Miami', country: 'USA', isHQ: true },
            ],
          },
        })
      ).rejects.toThrow('Only one location can be designated as Headquarters');
    });
  });

  describe('validation hook: tier restrictions', () => {
    it('rejects tier1 vendor with multiple locations', async () => {
      await expect(
        payload.create({
          collection: 'vendors',
          data: {
            companyName: 'Test Co',
            tier: 'tier1',
            locations: [
              { address: '123 Main', latitude: 26.1, longitude: -80.1, city: 'Miami', country: 'USA', isHQ: true },
              { address: '456 Beach', latitude: 25.7, longitude: -80.2, city: 'Miami', country: 'USA', isHQ: false },
            ],
          },
        })
      ).rejects.toThrow('Multiple locations require Tier 2 subscription');
    });
  });
});
```

### End-to-End Tests: Complete User Workflows

**Scope:** Full user workflows from browser to database and back

**Coverage Target:** 100% of critical user paths

**E2E Test Scenarios:**

```typescript
// tests/e2e/multi-location-workflow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Tier 2 Vendor Multi-Location Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as tier2 vendor
    await page.goto('/login');
    await page.fill('[name="email"]', 'tier2vendor@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('add additional location successfully', async ({ page }) => {
    // Navigate to profile
    await page.click('a[href="/dashboard/profile"]');
    await expect(page).toHaveURL('/dashboard/profile');

    // Scroll to locations section
    await page.locator('text=Office Locations').scrollIntoViewIfNeeded();

    // Click "Add Location" button
    await page.click('button:has-text("Add Location")');

    // Fill in location form
    await page.fill('input[name="locations[1].address"]', '456 Yachting Way, Monaco 98000');
    await page.fill('input[name="locations[1].city"]', 'Monaco');
    await page.fill('input[name="locations[1].country"]', 'Monaco');

    // Click geocode button
    await page.click('button:has-text("Geocode")');

    // Wait for coordinates to populate
    await expect(page.locator('input[name="locations[1].latitude"]')).not.toBeEmpty();
    await expect(page.locator('input[name="locations[1].longitude"]')).not.toBeEmpty();

    // Save profile
    await page.click('button:has-text("Save Profile")');

    // Verify success toast
    await expect(page.locator('text=Profile updated successfully')).toBeVisible();

    // Verify new location appears in list
    await expect(page.locator('text=Monaco')).toBeVisible();

    // Navigate to public profile to verify
    const vendorSlug = await page.locator('[data-vendor-slug]').getAttribute('data-vendor-slug');
    await page.goto(`/vendors/${vendorSlug}`);

    // Click Locations tab
    await page.click('button:has-text("Locations")');

    // Verify both locations displayed
    await expect(page.locator('text=Fort Lauderdale')).toBeVisible(); // HQ
    await expect(page.locator('text=Monaco')).toBeVisible(); // Additional location

    // Verify map has 2 markers
    const markers = page.locator('.leaflet-marker-icon');
    await expect(markers).toHaveCount(2);
  });

  test('cannot designate multiple HQ locations', async ({ page }) => {
    await page.goto('/dashboard/profile');
    await page.locator('text=Office Locations').scrollIntoViewIfNeeded();

    // Verify one location has HQ badge
    await expect(page.locator('text=Headquarters')).toHaveCount(1);

    // Click "Add Location" button
    await page.click('button:has-text("Add Location")');

    // Fill in new location
    await page.fill('input[name="locations[1].address"]', '789 Marina Blvd');
    await page.fill('input[name="locations[1].latitude"]', '43.738418');
    await page.fill('input[name="locations[1].longitude"]', '7.424616');
    await page.fill('input[name="locations[1].city"]', 'Monaco');
    await page.fill('input[name="locations[1].country"]', 'Monaco');

    // Try to check isHQ on new location
    await page.check('input[name="locations[1].isHQ"]');

    // Verify first location's isHQ automatically unchecked
    await expect(page.locator('input[name="locations[0].isHQ"]')).not.toBeChecked();
    await expect(page.locator('input[name="locations[1].isHQ"]')).toBeChecked();

    // Save and verify only one HQ badge
    await page.click('button:has-text("Save Profile")');
    await expect(page.locator('text=Profile updated successfully')).toBeVisible();
    await expect(page.locator('text=Headquarters')).toHaveCount(1);
  });
});

test.describe('Free/Tier 1 Vendor Tier Gate', () => {
  test('free vendor sees tier upgrade prompt instead of locations manager', async ({ page }) => {
    // Login as free tier vendor
    await page.goto('/login');
    await page.fill('[name="email"]', 'freevendor@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Navigate to profile
    await page.goto('/dashboard/profile');

    // Scroll to locations section
    await page.locator('text=Office Locations').scrollIntoViewIfNeeded();

    // Verify locked feature message
    await expect(page.locator('text=Additional Locations')).toBeVisible();
    await expect(page.locator('text=Tier 2+ Feature')).toBeVisible();

    // Verify no "Add Location" button
    await expect(page.locator('button:has-text("Add Location")')).not.toBeVisible();

    // Verify upgrade CTA present
    await expect(page.locator('button:has-text("Upgrade to Tier 2")')).toBeVisible();

    // Click upgrade button
    await page.click('button:has-text("Upgrade to Tier 2")');

    // Verify redirects to subscription page
    await expect(page).toHaveURL('/dashboard/subscription');
  });
});

test.describe('Location-Based Search', () => {
  test('search includes HQ for all tiers, additional locations for tier2+', async ({ page }) => {
    await page.goto('/vendors');

    // Click "Search by Location" button
    await page.click('button:has-text("Search by Location")');

    // Fill in location search
    await page.fill('input[placeholder="Enter city or coordinates"]', 'Fort Lauderdale, FL');
    await page.fill('input[name="radius"]', '50');
    await page.click('button:has-text("Search")');

    // Wait for results
    await page.waitForSelector('.vendor-search-results');

    // Verify map displays markers
    const markers = page.locator('.leaflet-marker-icon');
    await expect(markers.count()).toBeGreaterThan(0);

    // Find tier2 vendor result
    const tier2Vendor = page.locator('.vendor-card:has-text("Tier 2")').first();
    await expect(tier2Vendor).toBeVisible();

    // Click vendor card to expand locations
    await tier2Vendor.click();

    // Verify multiple locations shown for tier2
    const tier2Locations = tier2Vendor.locator('.location-item');
    await expect(tier2Locations.count()).toBeGreaterThan(1);

    // Find tier1 vendor result
    const tier1Vendor = page.locator('.vendor-card:has-text("Tier 1")').first();
    if (await tier1Vendor.count() > 0) {
      await tier1Vendor.click();

      // Verify only HQ shown for tier1
      const tier1Locations = tier1Vendor.locator('.location-item');
      await expect(tier1Locations).toHaveCount(1);
      await expect(tier1Vendor.locator('text=Headquarters')).toBeVisible();
    }
  });

  test('map markers clickable and show location details', async ({ page }) => {
    await page.goto('/vendors?lat=26.122&lng=-80.137&radius=50');

    // Wait for map to load
    await page.waitForSelector('.leaflet-container');

    // Click first marker
    const firstMarker = page.locator('.leaflet-marker-icon').first();
    await firstMarker.click();

    // Verify popup appears with location details
    await expect(page.locator('.leaflet-popup')).toBeVisible();
    await expect(page.locator('.leaflet-popup')).toContainText(['city', 'country']);

    // Click "View Profile" link in popup
    await page.locator('.leaflet-popup a:has-text("View Profile")').click();

    // Verify navigates to vendor profile
    await expect(page).toHaveURL(/\/vendors\/[^\/]+/);
  });
});
```

## Test Data Management

### Test Data Creation and Maintenance Strategy

**Seed Data Strategy:**
- Use TypeScript seed scripts in `tests/seeds/` directory
- Create realistic vendor data covering all tiers and location scenarios
- Ensure geographic diversity (US, Europe, Asia, multiple cities)

**Seed Script Example:**
```typescript
// tests/seeds/vendors-with-locations.seed.ts
export async function seedVendorsWithLocations(payload: Payload) {
  const vendors = [
    {
      companyName: 'Marine Tech Solutions',
      slug: 'marine-tech-solutions',
      tier: 'tier2',
      locations: [
        {
          address: '123 Harbor View Drive, Fort Lauderdale, FL 33316',
          latitude: 26.122439,
          longitude: -80.137314,
          city: 'Fort Lauderdale',
          country: 'United States',
          isHQ: true,
        },
        {
          address: '456 Beach Road, Miami, FL 33139',
          latitude: 25.761681,
          longitude: -80.191788,
          city: 'Miami',
          country: 'United States',
          isHQ: false,
        },
        {
          address: '789 Yachting Way, Monaco 98000',
          latitude: 43.738418,
          longitude: 7.424616,
          city: 'Monaco',
          country: 'Monaco',
          isHQ: false,
        },
      ],
    },
    {
      companyName: 'Ocean Electronics Ltd',
      slug: 'ocean-electronics',
      tier: 'tier1',
      locations: [
        {
          address: '101 Dock Street, Southampton SO14 2AQ, UK',
          latitude: 50.905632,
          longitude: -1.403935,
          city: 'Southampton',
          country: 'United Kingdom',
          isHQ: true,
        },
      ],
    },
    {
      companyName: 'Yacht Systems Inc',
      slug: 'yacht-systems-inc',
      tier: 'free',
      locations: [
        {
          address: '222 Marina Drive, Newport, RI 02840',
          latitude: 41.490474,
          longitude: -71.313477,
          city: 'Newport',
          country: 'United States',
          isHQ: true,
        },
      ],
    },
  ];

  for (const vendorData of vendors) {
    await payload.create({
      collection: 'vendors',
      data: vendorData,
    });
  }
}
```

**Test Data Cleanup:**
```typescript
// tests/utils/cleanup.ts
export async function cleanupTestData(payload: Payload) {
  // Delete all test vendors (identified by slug prefix or test flag)
  const testVendors = await payload.find({
    collection: 'vendors',
    where: {
      slug: {
        contains: 'test-',
      },
    },
  });

  for (const vendor of testVendors.docs) {
    await payload.delete({
      collection: 'vendors',
      id: vendor.id,
    });
  }
}
```

### Mock and Stub Management

**MSW (Mock Service Worker) for API Mocking:**

```typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock geocoding API
  http.get('https://geocode.maps.co/search', ({ request }) => {
    const url = new URL(request.url);
    const address = url.searchParams.get('q');

    if (address?.includes('Fort Lauderdale')) {
      return HttpResponse.json([
        {
          lat: '26.122439',
          lon: '-80.137314',
          display_name: '123 Harbor View Drive, Fort Lauderdale, FL 33316, USA',
        },
      ]);
    }

    if (address?.includes('Monaco')) {
      return HttpResponse.json([
        {
          lat: '43.738418',
          lon: '7.424616',
          display_name: '456 Yachting Way, Monaco 98000',
        },
      ]);
    }

    return HttpResponse.json([]);
  }),

  // Mock vendor update API
  http.patch('/api/vendors/:id', async ({ request, params }) => {
    const body = await request.json();

    // Validate HQ uniqueness
    const hqCount = body.locations?.filter((loc: any) => loc.isHQ).length || 0;
    if (hqCount !== 1) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: hqCount === 0
              ? 'At least one location must be designated as Headquarters'
              : 'Only one location can be designated as Headquarters',
          },
        },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        id: params.id,
        companyName: 'Test Vendor',
        locations: body.locations,
        updatedAt: new Date().toISOString(),
      },
    });
  }),
];
```

```typescript
// mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### Test Environment Configuration

**Test Database:**
- Use separate SQLite file for tests: `./data/payload-test.db`
- Reset database before each test suite
- Use transactions for test isolation

**Environment Variables for Tests:**
```bash
# .env.test
DATABASE_URL=file:./data/payload-test.db
PAYLOAD_SECRET=test-secret-key-minimum-32-characters
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
NODE_ENV=test
```

**Playwright Configuration:**
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // Run serially to avoid database conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Continuous Integration

### Automated Testing Pipeline Integration

**GitHub Actions Workflow:**

```yaml
# .github/workflows/test.yml
name: Test Multi-Location Feature

on:
  pull_request:
    branches: [main]
  push:
    branches: [feature/multi-location-support]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run unit tests
        run: pnpm test --coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run migrations
        run: pnpm run payload:migrate
        env:
          DATABASE_URL: file:./data/payload-test.db

      - name: Run integration tests
        run: pnpm test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload Playwright report
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### Test Reporting and Metrics

**Coverage Reports:**
- Jest generates coverage report in `coverage/` directory
- Codecov integration provides PR comments with coverage diff
- Enforce 80% minimum coverage threshold (builds fail if below)

**E2E Test Reports:**
- Playwright generates HTML report on failure
- Screenshots and videos captured for failed tests
- Uploaded as GitHub Actions artifacts

**Test Metrics Dashboard:**
- Track test execution time trends
- Monitor flaky test rate
- Alert on test coverage drops

### Quality Gate Enforcement

**Pre-Merge Checks:**
- All unit tests must pass
- All integration tests must pass
- All E2E tests must pass
- Code coverage must be ≥ 80%
- No TypeScript errors
- ESLint passes with no errors

**Branch Protection Rules:**
- Require status checks to pass before merging
- Require 1 approving review
- Require branches to be up to date before merging

**Automated Quality Checks:**
```yaml
# .github/workflows/quality-gate.yml
name: Quality Gate

on:
  pull_request:
    branches: [main]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: pnpm install

      - name: TypeScript check
        run: pnpm run type-check

      - name: Lint check
        run: pnpm run lint

      - name: Test coverage check
        run: |
          pnpm test --coverage
          if [ $(jq '.total.lines.pct' coverage/coverage-summary.json | cut -d. -f1) -lt 80 ]; then
            echo "Coverage below 80%"
            exit 1
          fi
```
