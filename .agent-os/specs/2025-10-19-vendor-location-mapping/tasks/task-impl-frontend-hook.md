# Task: Create useLocationFilter Custom Hook

**Task ID**: impl-frontend-hook
**Phase**: Phase 3 - Frontend Implementation (Map Components & UI)
**Agent**: frontend-react-specialist
**Estimated Time**: 2 hours
**Dependencies**: impl-frontend-distance

## Objective

Create a custom React hook that filters vendors by location proximity using the distance calculation utility and provides vendor data with calculated distances.

## Context Requirements

**Files to Review**:
- `/home/edwin/development/ptnextjs/lib/distance-calculator.ts` (distance utilities)
- `/home/edwin/development/ptnextjs/lib/types.ts` (Vendor interface)
- `/home/edwin/development/ptnextjs/hooks/` (existing hook patterns, if any)

## Hook Specification

### File Location

Create: `/home/edwin/development/ptnextjs/hooks/useLocationFilter.ts`

### Hook Interface

```typescript
import { Vendor, VendorCoordinates } from '@/lib/types';

export interface VendorWithDistance extends Vendor {
  /** Calculated distance from user location in kilometers */
  distance?: number;
}

export interface UseLocationFilterResult {
  /** Vendors filtered by distance */
  filteredVendors: VendorWithDistance[];
  /** Number of vendors with valid coordinates */
  vendorsWithCoordinates: number;
  /** Number of vendors without coordinates */
  vendorsWithoutCoordinates: number;
  /** Whether filtering is currently active */
  isFiltering: boolean;
}

export function useLocationFilter(
  vendors: Vendor[],
  userLocation: VendorCoordinates | null,
  maxDistance: number
): UseLocationFilterResult;
```

### Implementation

```typescript
'use client';

import { useMemo } from 'react';
import { Vendor, VendorCoordinates } from '@/lib/types';
import { calculateDistance, isWithinDistance } from '@/lib/distance-calculator';

export interface VendorWithDistance extends Vendor {
  distance?: number;
}

export interface UseLocationFilterResult {
  filteredVendors: VendorWithDistance[];
  vendorsWithCoordinates: number;
  vendorsWithoutCoordinates: number;
  isFiltering: boolean;
}

/**
 * Custom hook for filtering vendors by location proximity
 *
 * @param vendors - Array of all vendors
 * @param userLocation - User's current location coordinates (null if not set)
 * @param maxDistance - Maximum distance in kilometers for filtering
 * @returns Filtered vendors with calculated distances and metadata
 *
 * @example
 * const { filteredVendors, isFiltering } = useLocationFilter(
 *   vendors,
 *   { latitude: 43.7384, longitude: 7.4246 },
 *   100
 * );
 */
export function useLocationFilter(
  vendors: Vendor[],
  userLocation: VendorCoordinates | null,
  maxDistance: number
): UseLocationFilterResult {
  const result = useMemo(() => {
    // Count vendors with/without coordinates
    const vendorsWithCoordinates = vendors.filter(v => v.coordinates).length;
    const vendorsWithoutCoordinates = vendors.length - vendorsWithCoordinates;

    // If no user location set, return all vendors without filtering
    if (!userLocation) {
      return {
        filteredVendors: vendors,
        vendorsWithCoordinates,
        vendorsWithoutCoordinates,
        isFiltering: false,
      };
    }

    // Calculate distances and filter vendors
    const vendorsWithDistances: VendorWithDistance[] = vendors
      .map(vendor => {
        // Skip vendors without coordinates
        if (!vendor.coordinates) {
          return { ...vendor, distance: undefined };
        }

        try {
          // Calculate distance from user location
          const distance = calculateDistance(
            userLocation,
            vendor.coordinates,
            'km'
          );

          return { ...vendor, distance };
        } catch (error) {
          // Log error but don't fail - just exclude this vendor
          console.warn(
            `Error calculating distance for vendor ${vendor.name}:`,
            error
          );
          return { ...vendor, distance: undefined };
        }
      })
      .filter(vendor => {
        // Include vendors without coordinates (they won't be shown on map but still listed)
        if (!vendor.coordinates || vendor.distance === undefined) {
          return false; // Exclude from filtered results when searching by location
        }

        // Filter by distance
        return vendor.distance <= maxDistance;
      })
      .sort((a, b) => {
        // Sort by distance (closest first)
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });

    return {
      filteredVendors: vendorsWithDistances,
      vendorsWithCoordinates,
      vendorsWithoutCoordinates,
      isFiltering: true,
    };
  }, [vendors, userLocation, maxDistance]);

  return result;
}

/**
 * Helper hook for getting vendors within a specific distance
 * (simplified version without metadata)
 *
 * @param vendors - Array of all vendors
 * @param userLocation - User's current location coordinates
 * @param maxDistance - Maximum distance in kilometers
 * @returns Array of vendors within distance, sorted by proximity
 *
 * @example
 * const nearbyVendors = useNearbyVendors(vendors, userLocation, 50);
 */
export function useNearbyVendors(
  vendors: Vendor[],
  userLocation: VendorCoordinates | null,
  maxDistance: number
): VendorWithDistance[] {
  return useLocationFilter(vendors, userLocation, maxDistance).filteredVendors;
}

/**
 * Helper hook for checking if a specific vendor is nearby
 *
 * @param vendor - Vendor to check
 * @param userLocation - User's current location coordinates
 * @param maxDistance - Maximum distance in kilometers
 * @returns Object with isNearby flag and calculated distance
 *
 * @example
 * const { isNearby, distance } = useIsVendorNearby(vendor, userLocation, 100);
 */
export function useIsVendorNearby(
  vendor: Vendor,
  userLocation: VendorCoordinates | null,
  maxDistance: number
): { isNearby: boolean; distance?: number } {
  return useMemo(() => {
    if (!userLocation || !vendor.coordinates) {
      return { isNearby: false, distance: undefined };
    }

    try {
      const distance = calculateDistance(userLocation, vendor.coordinates, 'km');
      const isNearby = distance <= maxDistance;

      return { isNearby, distance };
    } catch (error) {
      console.warn(`Error checking if vendor ${vendor.name} is nearby:`, error);
      return { isNearby: false, distance: undefined };
    }
  }, [vendor, userLocation, maxDistance]);
}
```

## Usage Examples

### Example 1: Vendor List Page with Location Filter

```typescript
'use client';

import { useState } from 'react';
import { useLocationFilter } from '@/hooks/useLocationFilter';
import { LocationSearchFilter } from '@/components/LocationSearchFilter';
import { VendorCard } from '@/components/VendorCard';
import { Vendor, VendorCoordinates } from '@/lib/types';

export default function VendorsPage({ vendors }: { vendors: Vendor[] }) {
  const [userLocation, setUserLocation] = useState<VendorCoordinates | null>(null);
  const [maxDistance, setMaxDistance] = useState(100);

  const {
    filteredVendors,
    vendorsWithCoordinates,
    isFiltering
  } = useLocationFilter(vendors, userLocation, maxDistance);

  const handleSearch = (location: VendorCoordinates, distance: number) => {
    setUserLocation(location);
    setMaxDistance(distance);
  };

  const handleReset = () => {
    setUserLocation(null);
    setMaxDistance(100);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="grid md:grid-cols-3 gap-6">
        <aside className="md:col-span-1">
          <LocationSearchFilter
            onSearch={handleSearch}
            onReset={handleReset}
            resultCount={filteredVendors.length}
            totalCount={vendors.length}
          />

          {isFiltering && (
            <p className="mt-4 text-sm text-gray-600">
              {vendorsWithCoordinates} vendors have location data
            </p>
          )}
        </aside>

        <div className="md:col-span-2">
          <div className="grid gap-4">
            {filteredVendors.map(vendor => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                distance={vendor.distance}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Example 2: Nearby Vendors Widget

```typescript
'use client';

import { useNearbyVendors } from '@/hooks/useLocationFilter';

export function NearbyVendorsWidget({ vendors, userLocation }: Props) {
  const nearbyVendors = useNearbyVendors(vendors, userLocation, 50);

  if (nearbyVendors.length === 0) {
    return <p>No vendors within 50km</p>;
  }

  return (
    <div>
      <h3>Nearby Vendors</h3>
      {nearbyVendors.map(vendor => (
        <div key={vendor.id}>
          {vendor.name} - {vendor.distance?.toFixed(1)} km away
        </div>
      ))}
    </div>
  );
}
```

### Example 3: Vendor Detail Page with Proximity Badge

```typescript
'use client';

import { useIsVendorNearby } from '@/hooks/useLocationFilter';

export function VendorDetailPage({ vendor, userLocation }: Props) {
  const { isNearby, distance } = useIsVendorNearby(vendor, userLocation, 100);

  return (
    <div>
      <h1>{vendor.name}</h1>

      {isNearby && distance && (
        <div className="bg-green-100 px-3 py-1 rounded">
          📍 {distance.toFixed(1)} km away
        </div>
      )}

      {/* Rest of vendor details */}
    </div>
  );
}
```

## Testing Steps

### 1. Unit Tests

Create: `/home/edwin/development/ptnextjs/hooks/__tests__/useLocationFilter.test.ts`

```typescript
import { renderHook } from '@testing-library/react';
import { useLocationFilter } from '../useLocationFilter';
import { Vendor } from '@/lib/types';

// Mock vendors
const mockVendors: Vendor[] = [
  {
    id: '1',
    name: 'Monaco Vendor',
    slug: 'monaco-vendor',
    location: 'Monaco',
    coordinates: { latitude: 43.7384, longitude: 7.4246 },
  },
  {
    id: '2',
    name: 'Paris Vendor',
    slug: 'paris-vendor',
    location: 'Paris',
    coordinates: { latitude: 48.8566, longitude: 2.3522 },
  },
  {
    id: '3',
    name: 'Legacy Vendor',
    slug: 'legacy-vendor',
    location: 'Miami',
    // No coordinates
  },
] as Vendor[];

describe('useLocationFilter', () => {
  test('returns all vendors when userLocation is null', () => {
    const { result } = renderHook(() =>
      useLocationFilter(mockVendors, null, 100)
    );

    expect(result.current.filteredVendors).toHaveLength(3);
    expect(result.current.isFiltering).toBe(false);
  });

  test('filters vendors by distance', () => {
    const userLocation = { latitude: 43.7384, longitude: 7.4246 }; // Monaco

    const { result } = renderHook(() =>
      useLocationFilter(mockVendors, userLocation, 100)
    );

    // Monaco vendor should be included (distance ~0)
    // Paris vendor should be excluded (distance ~688km)
    expect(result.current.filteredVendors).toHaveLength(1);
    expect(result.current.filteredVendors[0].name).toBe('Monaco Vendor');
    expect(result.current.isFiltering).toBe(true);
  });

  test('includes distance in filtered vendors', () => {
    const userLocation = { latitude: 43.7384, longitude: 7.4246 };

    const { result } = renderHook(() =>
      useLocationFilter(mockVendors, userLocation, 1000)
    );

    const monacoVendor = result.current.filteredVendors.find(
      v => v.name === 'Monaco Vendor'
    );

    expect(monacoVendor?.distance).toBeDefined();
    expect(monacoVendor?.distance).toBeCloseTo(0, 1);
  });

  test('sorts vendors by distance (closest first)', () => {
    const userLocation = { latitude: 45, longitude: 5 }; // Somewhere between

    const { result } = renderHook(() =>
      useLocationFilter(mockVendors, userLocation, 1000)
    );

    const distances = result.current.filteredVendors.map(v => v.distance || 0);

    // Check distances are in ascending order
    for (let i = 1; i < distances.length; i++) {
      expect(distances[i]).toBeGreaterThanOrEqual(distances[i - 1]);
    }
  });

  test('counts vendors with and without coordinates', () => {
    const { result } = renderHook(() =>
      useLocationFilter(mockVendors, null, 100)
    );

    expect(result.current.vendorsWithCoordinates).toBe(2);
    expect(result.current.vendorsWithoutCoordinates).toBe(1);
  });

  test('excludes vendors without coordinates from filtered results', () => {
    const userLocation = { latitude: 25.7617, longitude: -80.1918 }; // Miami area

    const { result } = renderHook(() =>
      useLocationFilter(mockVendors, userLocation, 1000)
    );

    // Legacy vendor (no coordinates) should not appear in filtered results
    const hasLegacyVendor = result.current.filteredVendors.some(
      v => v.name === 'Legacy Vendor'
    );

    expect(hasLegacyVendor).toBe(false);
  });

  test('memoizes result when inputs unchanged', () => {
    const userLocation = { latitude: 43.7384, longitude: 7.4246 };

    const { result, rerender } = renderHook(
      ({ vendors, location, distance }) =>
        useLocationFilter(vendors, location, distance),
      {
        initialProps: {
          vendors: mockVendors,
          location: userLocation,
          distance: 100,
        },
      }
    );

    const firstResult = result.current.filteredVendors;

    // Rerender with same props
    rerender({
      vendors: mockVendors,
      location: userLocation,
      distance: 100,
    });

    // Should return same reference (memoized)
    expect(result.current.filteredVendors).toBe(firstResult);
  });
});
```

### 2. Integration Testing with Playwright

```typescript
// tests/e2e/location-filter-integration.spec.ts
import { test, expect } from '@playwright/test';

test('location filter integrates with vendor list', async ({ page }) => {
  await page.goto('/vendors');

  // Count initial vendors
  const initialCount = await page.locator('[data-testid="vendor-card"]').count();

  // Enter user location
  await page.fill('[data-testid="location-input"]', '43.7384, 7.4246');
  await page.click('[data-testid="search-button"]');

  await page.waitForTimeout(500);

  // Count filtered vendors
  const filteredCount = await page.locator('[data-testid="vendor-card"]').count();

  // Should have fewer vendors after filtering
  expect(filteredCount).toBeLessThanOrEqual(initialCount);

  // First vendor should show distance badge
  const firstVendor = page.locator('[data-testid="vendor-card"]').first();
  await expect(firstVendor.locator('[data-testid="vendor-distance"]')).toBeVisible();
});
```

## Acceptance Criteria

- [ ] `useLocationFilter` hook created at `/home/edwin/development/ptnextjs/hooks/useLocationFilter.ts`
- [ ] Returns filtered vendors sorted by distance
- [ ] Includes calculated distance in vendor objects
- [ ] Handles null userLocation (returns all vendors)
- [ ] Excludes vendors without coordinates from filtered results
- [ ] Counts vendors with/without coordinates
- [ ] Uses useMemo for performance optimization
- [ ] Handles distance calculation errors gracefully
- [ ] Helper hook `useNearbyVendors` implemented
- [ ] Helper hook `useIsVendorNearby` implemented
- [ ] TypeScript types are correct
- [ ] Comprehensive JSDoc comments
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] No memory leaks or performance issues

## Performance Considerations

- [ ] Uses `useMemo` to prevent unnecessary recalculations
- [ ] Memoization depends on vendors array, userLocation, and maxDistance
- [ ] Distance calculation is O(n) where n = number of vendors
- [ ] Sorting is O(n log n)
- [ ] Overall acceptable for <1000 vendors
- [ ] Consider virtualization for very large vendor lists

## Edge Cases

- [ ] Empty vendors array (returns empty results)
- [ ] All vendors without coordinates (returns empty filtered results)
- [ ] User location equals vendor location (distance = 0)
- [ ] Very large maxDistance (returns all vendors with coordinates)
- [ ] Very small maxDistance (might return 0 vendors)
- [ ] Invalid vendor coordinates (logged and excluded)

## Notes

- Hook is client-side only ('use client' in components using it)
- Memoization improves performance on re-renders
- Distance calculation errors are logged but don't break the UI
- Vendors without coordinates are counted but not shown in filtered results
- Sorting by distance provides better UX (closest first)
- Consider adding loading state for very large vendor lists
