# Task: Integrate Location Search into Listing Pages

**Task ID**: impl-frontend-vendor-list
**Phase**: Phase 3 - Frontend Implementation (Map Components & UI)
**Agent**: frontend-react-specialist
**Estimated Time**: 3 hours
**Dependencies**: impl-frontend-vendor-detail

## Objective

Integrate LocationSearchFilter component and useLocationFilter hook into vendor and partner listing pages to enable location-based search functionality.

## Context Requirements

**Files to Review**:
- `/home/edwin/development/ptnextjs/app/(site)/vendors/page.tsx` (current vendor list page)
- `/home/edwin/development/ptnextjs/app/(site)/partners/page.tsx` (similar structure with partner filter)
- `/home/edwin/development/ptnextjs/components/LocationSearchFilter.tsx`
- `/home/edwin/development/ptnextjs/hooks/useLocationFilter.ts`

**Current Architecture**: Pages use client components (VendorsClient, PartnersClient) for filtering

## Implementation Strategy

### Approach 1: Extend Existing Client Components (Recommended)

Modify the existing client components to add location search without breaking current functionality.

### File 1: Vendors Page Client Component

**File**: `/home/edwin/development/ptnextjs/app/(site)/vendors/components/VendorsClient.tsx` (if it exists)

Or create new client component if vendors page is currently server-only.

**Implementation**:

```typescript
'use client';

import { useState } from 'react';
import { Vendor, VendorCoordinates } from '@/lib/types';
import { useLocationFilter } from '@/hooks/useLocationFilter';
import { LocationSearchFilter } from '@/components/LocationSearchFilter';
import { VendorCard } from '@/components/VendorCard';

interface VendorsClientProps {
  vendors: Vendor[];
  showPartnersOnly?: boolean;
}

export function VendorsClient({ vendors, showPartnersOnly = false }: VendorsClientProps) {
  // Location filter state
  const [userLocation, setUserLocation] = useState<VendorCoordinates | null>(null);
  const [maxDistance, setMaxDistance] = useState(100);

  // Apply partner filter first (if applicable)
  const baseVendors = showPartnersOnly
    ? vendors.filter(v => v.partner === true)
    : vendors;

  // Apply location filter
  const {
    filteredVendors,
    vendorsWithCoordinates,
    isFiltering
  } = useLocationFilter(baseVendors, userLocation, maxDistance);

  const displayVendors = filteredVendors;

  const handleSearch = (location: VendorCoordinates, distance: number) => {
    setUserLocation(location);
    setMaxDistance(distance);
  };

  const handleReset = () => {
    setUserLocation(null);
    setMaxDistance(100);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">
          {showPartnersOnly ? 'Partners' : 'Vendors'}
        </h1>
        <p className="text-gray-600">
          {showPartnersOnly
            ? 'Explore our trusted partners'
            : 'Browse our complete vendor directory'}
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar: Search Filters */}
        <aside className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            <LocationSearchFilter
              onSearch={handleSearch}
              onReset={handleReset}
              resultCount={displayVendors.length}
              totalCount={baseVendors.length}
            />

            {isFiltering && vendorsWithCoordinates > 0 && (
              <div className="text-sm text-gray-600 p-4 bg-blue-50 rounded-lg">
                <p className="font-medium mb-1">Location Search Active</p>
                <p>
                  Searching {vendorsWithCoordinates} vendors with location data
                  within {maxDistance}km
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content: Vendor Grid */}
        <div className="lg:col-span-3">
          {displayVendors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">
                {isFiltering
                  ? `No vendors found within ${maxDistance}km of your location`
                  : 'No vendors available'}
              </p>
              {isFiltering && (
                <button
                  onClick={handleReset}
                  className="text-blue-600 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayVendors.map(vendor => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                  distance={vendor.distance}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### File 2: Update Vendors Page (Server Component)

**File**: `/home/edwin/development/ptnextjs/app/(site)/vendors/page.tsx`

```typescript
import { TinaCMSDataService } from '@/lib/tinacms-data-service';
import { VendorsClient } from './components/VendorsClient';

export const metadata = {
  title: 'Vendors | YourSite',
  description: 'Browse our complete vendor directory',
};

export default async function VendorsPage() {
  const dataService = new TinaCMSDataService();
  const vendors = await dataService.getVendors();

  return <VendorsClient vendors={vendors} />;
}
```

### File 3: Update Partners Page

**File**: `/home/edwin/development/ptnextjs/app/(site)/partners/page.tsx`

```typescript
import { TinaCMSDataService } from '@/lib/tinacms-data-service';
import { VendorsClient } from '../vendors/components/VendorsClient';

export const metadata = {
  title: 'Partners | YourSite',
  description: 'Explore our trusted partners',
};

export default async function PartnersPage() {
  const dataService = new TinaCMSDataService();
  const vendors = await dataService.getVendors();

  return <VendorsClient vendors={vendors} showPartnersOnly={true} />;
}
```

### File 4: Enhanced VendorCard Component

Update VendorCard to display distance when available:

```typescript
// components/VendorCard.tsx
import { Vendor } from '@/lib/types';
import { Navigation } from 'lucide-react';

interface VendorCardProps {
  vendor: Vendor;
  distance?: number;
}

export function VendorCard({ vendor, distance }: VendorCardProps) {
  return (
    <div className="border rounded-lg p-6 hover:shadow-lg transition" data-testid="vendor-card">
      <h3 className="text-xl font-semibold mb-2">{vendor.name}</h3>

      {/* Distance Badge */}
      {distance !== undefined && (
        <div
          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm mb-3"
          data-testid="vendor-distance"
        >
          <Navigation className="w-3 h-3" />
          <span>{distance.toFixed(1)} km away</span>
        </div>
      )}

      {vendor.location && (
        <p className="text-sm text-gray-600 mb-2">📍 {vendor.location}</p>
      )}

      {vendor.description && (
        <p className="text-gray-700 mb-4 line-clamp-3">{vendor.description}</p>
      )}

      <a
        href={`/vendors/${vendor.slug}`}
        className="text-blue-600 hover:underline text-sm font-medium"
      >
        View Details →
      </a>
    </div>
  );
}
```

## Testing Steps

### 1. Playwright E2E Tests

Create: `/home/edwin/development/ptnextjs/tests/e2e/vendor-list-search.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Vendor List Page - Location Search', () => {
  test('renders location search filter', async ({ page }) => {
    await page.goto('/vendors');

    // Verify search filter is visible
    await expect(page.locator('[data-testid="location-search-filter"]')).toBeVisible();

    // Verify filter components
    await expect(page.locator('[data-testid="location-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="distance-slider"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-button"]')).toBeVisible();
  });

  test('filters vendors by location successfully', async ({ page }) => {
    await page.goto('/vendors');

    // Count initial vendors
    const initialCount = await page.locator('[data-testid="vendor-card"]').count();
    expect(initialCount).toBeGreaterThan(0);

    // Enter Monaco coordinates
    await page.fill('[data-testid="location-input"]', '43.7384, 7.4246');

    // Set distance to 200km
    await page.locator('[data-testid="distance-slider"]').fill('200');

    // Click search
    await page.click('[data-testid="search-button"]');

    // Wait for filtering
    await page.waitForTimeout(500);

    // Verify results
    const filteredCount = await page.locator('[data-testid="vendor-card"]').count();

    // Should have results (at least test vendor)
    expect(filteredCount).toBeGreaterThan(0);

    // Should have fewer or equal vendors
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    // Verify result count message
    await expect(page.locator('[data-testid="result-count"]')).toBeVisible();

    // Verify distance badges appear
    const firstCard = page.locator('[data-testid="vendor-card"]').first();
    await expect(firstCard.locator('[data-testid="vendor-distance"]')).toBeVisible();
  });

  test('shows "no results" message when no vendors in range', async ({ page }) => {
    await page.goto('/vendors');

    // Enter remote location (middle of ocean)
    await page.fill('[data-testid="location-input"]', '0, -30');

    // Small distance
    await page.locator('[data-testid="distance-slider"]').fill('10');

    // Click search
    await page.click('[data-testid="search-button"]');

    await page.waitForTimeout(500);

    // Should show no results message
    await expect(page.locator('text=No vendors found within 10km')).toBeVisible();

    // Should have clear filters option
    await expect(page.locator('button', { hasText: 'Clear filters' })).toBeVisible();
  });

  test('reset button clears filters and shows all vendors', async ({ page }) => {
    await page.goto('/vendors');

    // Perform search
    await page.fill('[data-testid="location-input"]', '43.7384, 7.4246');
    await page.click('[data-testid="search-button"]');

    await page.waitForTimeout(500);

    const filteredCount = await page.locator('[data-testid="vendor-card"]').count();

    // Click reset
    await page.click('[data-testid="reset-button"]');

    await page.waitForTimeout(500);

    // Should show all vendors again
    const resetCount = await page.locator('[data-testid="vendor-card"]').count();

    expect(resetCount).toBeGreaterThanOrEqual(filteredCount);

    // Distance badges should not be visible
    await expect(page.locator('[data-testid="vendor-distance"]')).not.toBeVisible();
  });

  test('vendors are sorted by distance (closest first)', async ({ page }) => {
    await page.goto('/vendors');

    // Search with large radius to get multiple results
    await page.fill('[data-testid="location-input"]', '43.7384, 7.4246');
    await page.locator('[data-testid="distance-slider"]').fill('1000');
    await page.click('[data-testid="search-button"]');

    await page.waitForTimeout(500);

    // Get all distance badges
    const distanceBadges = page.locator('[data-testid="vendor-distance"]');
    const count = await distanceBadges.count();

    if (count > 1) {
      // Extract distances
      const distances: number[] = [];
      for (let i = 0; i < count; i++) {
        const text = await distanceBadges.nth(i).textContent();
        const distance = parseFloat(text?.match(/[\d.]+/)?.[0] || '0');
        distances.push(distance);
      }

      // Verify ascending order
      for (let i = 1; i < distances.length; i++) {
        expect(distances[i]).toBeGreaterThanOrEqual(distances[i - 1]);
      }
    }
  });

  test('partner page also has location search', async ({ page }) => {
    await page.goto('/partners');

    // Verify search filter exists
    await expect(page.locator('[data-testid="location-search-filter"]')).toBeVisible();

    // Perform search
    await page.fill('[data-testid="location-input"]', '43.7384, 7.4246');
    await page.click('[data-testid="search-button"]');

    await page.waitForTimeout(500);

    // Should show filtered partners
    const partnerCount = await page.locator('[data-testid="vendor-card"]').count();
    expect(partnerCount).toBeGreaterThanOrEqual(0);
  });

  test('mobile layout works correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/vendors');

    // Search filter should be visible
    await expect(page.locator('[data-testid="location-search-filter"]')).toBeVisible();

    // Vendor cards should stack vertically
    const cards = page.locator('[data-testid="vendor-card"]');
    const count = await cards.count();

    if (count > 1) {
      const firstBox = await cards.first().boundingBox();
      const secondBox = await cards.nth(1).boundingBox();

      if (firstBox && secondBox) {
        // Second card should be below first
        expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height);
      }
    }

    // Take mobile screenshot
    await page.screenshot({ path: 'test-results/vendor-list-mobile.png' });
  });
});
```

Run tests:
```bash
npx playwright test vendor-list-search.spec.ts
```

### 2. Manual Testing Checklist

```bash
npm run dev
```

Test scenarios:
- [ ] Navigate to /vendors page
- [ ] Location search filter visible
- [ ] Enter valid coordinates → filter works
- [ ] Adjust distance slider → results update
- [ ] Click search → vendors filter correctly
- [ ] Distance badges appear on vendor cards
- [ ] Vendors sorted by distance (closest first)
- [ ] Click reset → all vendors show again
- [ ] Navigate to /partners page → same functionality
- [ ] Test on mobile viewport → responsive layout
- [ ] Test with 0 results → proper message shown

## Acceptance Criteria

- [ ] LocationSearchFilter integrated into vendors page
- [ ] LocationSearchFilter integrated into partners page
- [ ] useLocationFilter hook used for filtering logic
- [ ] VendorCard updated to show distance badge
- [ ] Search filter in sidebar (desktop) or top (mobile)
- [ ] Vendors filtered by proximity when search active
- [ ] Vendors sorted by distance (closest first)
- [ ] Distance displayed on vendor cards
- [ ] Result count message shown
- [ ] "No results" message when appropriate
- [ ] Reset button clears filters
- [ ] Partner filter still works (showPartnersOnly)
- [ ] Responsive layout on all screen sizes
- [ ] No TypeScript errors
- [ ] Playwright tests pass
- [ ] Accessible keyboard navigation

## Layout Structure

### Desktop (≥1024px)
```
┌────────────────────────────────────────────────────┐
│ Vendors / Partners                                 │
├───────────┬────────────────────────────────────────┤
│ Sidebar   │ Vendor Grid (2-3 columns)              │
│           │                                        │
│ Location  │ ┌─────────┬─────────┬─────────┐      │
│ Search    │ │ Vendor  │ Vendor  │ Vendor  │      │
│ Filter    │ │ Card    │ Card    │ Card    │      │
│           │ │ + Dist  │ + Dist  │ + Dist  │      │
│ (sticky)  │ └─────────┴─────────┴─────────┘      │
│           │ ┌─────────┬─────────┬─────────┐      │
│           │ │ Vendor  │ Vendor  │ Vendor  │      │
│           │ │ Card    │ Card    │ Card    │      │
│           │ └─────────┴─────────┴─────────┘      │
└───────────┴────────────────────────────────────────┘
```

### Mobile (<1024px)
```
┌────────────────────┐
│ Vendors / Partners │
├────────────────────┤
│                    │
│ Location Search    │
│ Filter             │
│                    │
├────────────────────┤
│                    │
│ ┌────────────────┐ │
│ │ Vendor Card    │ │
│ │ + Distance     │ │
│ └────────────────┘ │
│                    │
│ ┌────────────────┐ │
│ │ Vendor Card    │ │
│ │ + Distance     │ │
│ └────────────────┘ │
│                    │
└────────────────────┘
```

## Performance Considerations

- [ ] Client component for interactivity
- [ ] Server-side data fetching (vendors from TinaCMS)
- [ ] Filtering happens client-side (fast)
- [ ] Memoization in useLocationFilter hook
- [ ] Sticky sidebar doesn't cause reflows
- [ ] Distance calculation efficient (<1000 vendors)

## SEO Considerations

- [ ] Page metadata unchanged (server component)
- [ ] Vendor cards still crawlable
- [ ] Links to vendor detail pages work
- [ ] Structured data unaffected
- [ ] Initial page load shows all vendors (no search applied)

## Notes

- Client component required for state management
- Server component fetches data at build time
- Filter state is local (not in URL params for MVP)
- Consider URL params for shareable search results (future)
- Distance badges only show when location search active
- Partner page reuses VendorsClient with showPartnersOnly prop
- Sticky sidebar improves UX on long vendor lists
