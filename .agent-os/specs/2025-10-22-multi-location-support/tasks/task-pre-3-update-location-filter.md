# Task: Update useLocationFilter Hook for Multi-Location Support

**Task ID**: PRE-3
**Agent**: frontend-react-specialist
**Estimated Time**: 10-15 minutes
**Dependencies**: location-name-search feature deployed (provides useLocationFilter hook)

---

## Task Description

Update the existing `useLocationFilter` hook (from location-name-search feature) to support vendors with multiple locations (`locations[]` array) while maintaining backward compatibility with vendors that have a single `location` object.

This is a **critical coordination task** that bridges the location-name-search and multi-location-support features.

---

## Specifics

### File to Modify

**File**: `hooks/useLocationFilter.ts`

**Current Behavior**:
- Filters vendors based on distance from `vendor.location` (single location object)
- Returns vendors within `maxDistance` kilometers from `userLocation`
- Adds `distance` property to each vendor

**Required New Behavior**:
- Support both `vendor.location` (old format) and `vendor.locations[]` (new format)
- Apply tier-based filtering:
  - Tier 0/1 vendors: Only consider HQ location (`isHQ: true`)
  - Tier 2+ vendors: Consider all locations in the array
- Find the **closest eligible location** for each vendor
- Return `matchedLocation` to indicate which office matched the search
- Maintain backward compatibility during transition period

### Implementation Requirements

1. **Backward Compatibility**:
   - Support vendors with `location` object (legacy)
   - Support vendors with `locations[]` array (new)
   - Handle vendors with neither (skip them)

2. **Tier-Based Location Filtering**:
   - Read `vendor.tier` field
   - Filter locations based on tier:
     - `tier === 'free'` or `tier === 'tier1'`: Only HQ location
     - `tier === 'tier2'` or higher: All locations

3. **Closest Location Algorithm**:
   - For each vendor, iterate through eligible locations
   - Calculate distance from `userLocation` to each location
   - Select the location with minimum distance
   - Include vendor if closest location is within `maxDistance`

4. **Enhanced Return Type**:
   ```typescript
   interface UseLocationFilterReturn {
     filteredVendors: VendorWithDistance[];
     isFiltering: boolean;
     vendorsWithCoordinates: Vendor[];
   }

   interface VendorWithDistance extends Vendor {
     distance: number;
     matchedLocation?: VendorLocation; // NEW: Which location matched
   }
   ```

---

## Acceptance Criteria

### Functional Requirements

- [ ] Hook accepts same parameters: `(vendors, userLocation, maxDistance)`
- [ ] Hook returns same structure with added `matchedLocation` field
- [ ] Vendors with single `location` object are processed correctly (backward compatible)
- [ ] Vendors with `locations[]` array are processed correctly (new format)
- [ ] Tier-based filtering is applied correctly:
  - [ ] Tier 0/1 vendors: Only HQ location considered
  - [ ] Tier 2+ vendors: All locations considered
- [ ] **Closest location** is selected for each vendor (not just first location)
- [ ] Vendors beyond `maxDistance` from all their locations are excluded
- [ ] Results are sorted by distance (ascending)
- [ ] `matchedLocation` field indicates which office location matched the search

### Edge Cases

- [ ] Vendor with no locations: Excluded from results
- [ ] Vendor with `locations: []` empty array: Excluded from results
- [ ] Tier 1 vendor with multiple locations: Only HQ location considered
- [ ] Tier 2 vendor with HQ beyond range but office within range: Included (office matched)
- [ ] Vendor with all locations beyond range: Excluded from results

### Backward Compatibility

- [ ] Existing location-name-search functionality unaffected
- [ ] Vendors with old `location` format work without errors
- [ ] No breaking changes to hook interface
- [ ] Tests from location-name-search still pass

---

## Testing Requirements

### Unit Tests

Create/update test file: `hooks/useLocationFilter.test.ts`

**Test Cases**:

1. **Legacy Single Location Format**:
   ```typescript
   it('should filter vendors with single location object (legacy)', () => {
     const vendors = [
       { id: '1', name: 'Vendor A', location: { latitude: 26.1, longitude: -80.1 } }
     ];
     const userLocation = { latitude: 26.1, longitude: -80.1 };
     const { filteredVendors } = useLocationFilter(vendors, userLocation, 50);
     expect(filteredVendors).toHaveLength(1);
     expect(filteredVendors[0].distance).toBeLessThan(1);
   });
   ```

2. **New Multi-Location Format**:
   ```typescript
   it('should filter vendors with locations array (new format)', () => {
     const vendors = [
       {
         id: '1',
         name: 'Vendor A',
         tier: 'tier2',
         locations: [
           { latitude: 26.1, longitude: -80.1, isHQ: true, address: 'HQ', city: 'Miami', country: 'USA' },
           { latitude: 43.7, longitude: 7.4, isHQ: false, address: 'Office', city: 'Monaco', country: 'Monaco' }
         ]
       }
     ];
     const userLocation = { latitude: 43.7, longitude: 7.4 }; // Near Monaco office
     const { filteredVendors } = useLocationFilter(vendors, userLocation, 50);
     expect(filteredVendors).toHaveLength(1);
     expect(filteredVendors[0].matchedLocation?.city).toBe('Monaco');
   });
   ```

3. **Tier-Based Filtering**:
   ```typescript
   it('should only consider HQ location for tier 1 vendors', () => {
     const vendors = [
       {
         id: '1',
         name: 'Vendor A',
         tier: 'tier1',
         locations: [
           { latitude: 26.1, longitude: -80.1, isHQ: true, address: 'HQ', city: 'Miami', country: 'USA' },
           { latitude: 43.7, longitude: 7.4, isHQ: false, address: 'Office', city: 'Monaco', country: 'Monaco' }
         ]
       }
     ];
     const userLocation = { latitude: 43.7, longitude: 7.4 }; // Near Monaco office
     const { filteredVendors } = useLocationFilter(vendors, userLocation, 50);
     expect(filteredVendors).toHaveLength(0); // Monaco office ignored for tier1
   });
   ```

4. **Closest Location Selection**:
   ```typescript
   it('should select closest location for tier 2+ vendors', () => {
     const vendors = [
       {
         id: '1',
         name: 'Vendor A',
         tier: 'tier2',
         locations: [
           { latitude: 26.1, longitude: -80.1, isHQ: true, address: 'HQ', city: 'Miami', country: 'USA' },
           { latitude: 43.7, longitude: 7.4, isHQ: false, address: 'Office', city: 'Monaco', country: 'Monaco' }
         ]
       }
     ];
     const userLocation = { latitude: 43.7, longitude: 7.4 }; // Near Monaco office
     const { filteredVendors } = useLocationFilter(vendors, userLocation, 5000);
     expect(filteredVendors[0].matchedLocation?.city).toBe('Monaco'); // Closest location
   });
   ```

5. **No Locations Edge Case**:
   ```typescript
   it('should exclude vendors with no locations', () => {
     const vendors = [
       { id: '1', name: 'Vendor A', locations: [] },
       { id: '2', name: 'Vendor B' } // No location or locations field
     ];
     const userLocation = { latitude: 26.1, longitude: -80.1 };
     const { filteredVendors } = useLocationFilter(vendors, userLocation, 50);
     expect(filteredVendors).toHaveLength(0);
   });
   ```

### Integration Tests

- [ ] Test with real vendor data from Payload CMS (mix of old and new formats)
- [ ] Verify performance with 1000+ vendors
- [ ] Test with extreme distance values (0km, 10000km)

---

## Implementation Notes

### Code Structure

```typescript
// hooks/useLocationFilter.ts
import { useMemo } from 'react';
import { Vendor, VendorCoordinates, VendorLocation } from '@/lib/types';

interface VendorWithDistance extends Vendor {
  distance: number;
  matchedLocation?: VendorLocation;
}

interface UseLocationFilterReturn {
  filteredVendors: VendorWithDistance[];
  isFiltering: boolean;
  vendorsWithCoordinates: Vendor[];
}

export function useLocationFilter(
  vendors: Vendor[],
  userLocation: VendorCoordinates | null,
  maxDistance: number
): UseLocationFilterReturn {
  const result = useMemo(() => {
    if (!userLocation) {
      return {
        filteredVendors: vendors,
        isFiltering: false,
        vendorsWithCoordinates: vendors.filter(v => v.locations?.length || v.location)
      };
    }

    const filtered = vendors
      .map(vendor => {
        // Normalize to locations array (support both formats)
        const locations = vendor.locations?.length
          ? vendor.locations
          : vendor.location
            ? [{ ...vendor.location, isHQ: true }]
            : [];

        if (locations.length === 0) return null;

        // Apply tier-based filtering
        const eligibleLocations = locations.filter(loc => {
          if (vendor.tier === 'free' || vendor.tier === 'tier1') {
            return loc.isHQ === true; // Only HQ
          }
          return true; // All locations for tier2+
        });

        if (eligibleLocations.length === 0) return null;

        // Find closest eligible location
        const closestLocation = eligibleLocations
          .map(loc => ({
            location: loc,
            distance: calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              loc.latitude,
              loc.longitude
            )
          }))
          .filter(({ distance }) => distance <= maxDistance)
          .sort((a, b) => a.distance - b.distance)[0];

        if (!closestLocation) return null;

        return {
          ...vendor,
          distance: closestLocation.distance,
          matchedLocation: closestLocation.location
        };
      })
      .filter((vendor): vendor is VendorWithDistance => vendor !== null)
      .sort((a, b) => a.distance - b.distance);

    return {
      filteredVendors: filtered,
      isFiltering: true,
      vendorsWithCoordinates: vendors.filter(v => v.locations?.length || v.location)
    };
  }, [vendors, userLocation, maxDistance]);

  return result;
}

// Haversine formula for distance calculation (already exists)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
```

### Type Updates Required

Add to `lib/types.ts`:

```typescript
export interface VendorLocation extends VendorCoordinates {
  address: string;
  city: string;
  country: string;
  isHQ: boolean;
}

export interface Vendor {
  // ... existing fields
  location?: VendorCoordinates; // Legacy format (deprecated)
  locations?: VendorLocation[]; // New format
  tier?: 'free' | 'tier1' | 'tier2';
}
```

---

## Quality Gates

### Pre-Implementation

- [ ] Read existing `useLocationFilter` implementation
- [ ] Read existing tests for `useLocationFilter`
- [ ] Understand current usage in `VendorsClient` component

### During Implementation

- [ ] Write failing tests first (TDD approach)
- [ ] Implement changes incrementally
- [ ] Run tests after each change
- [ ] Verify no TypeScript errors

### Post-Implementation

- [ ] All unit tests passing (new + existing)
- [ ] No regression in location-name-search functionality
- [ ] TypeScript compilation successful
- [ ] ESLint passing with no warnings
- [ ] Code review checklist:
  - [ ] Backward compatibility maintained
  - [ ] Performance optimized (useMemo used correctly)
  - [ ] Edge cases handled
  - [ ] Clear variable names and comments

---

## Evidence of Completion

Provide the following artifacts:

1. **Updated Hook File**:
   - `hooks/useLocationFilter.ts` with multi-location support

2. **Test Results**:
   - Screenshot or output of `npm run test hooks/useLocationFilter.test.ts`
   - All tests passing (100% pass rate)

3. **Type Check**:
   - Output of `npm run type-check` showing no errors

4. **Integration Verification**:
   - Confirm VendorsClient component still works with updated hook
   - Verify location-name-search feature unaffected

---

## Notes

- This task is **critical** for multi-location support to work correctly
- Changes must maintain **100% backward compatibility**
- The hook is used by both location-name-search and will be used by multi-location-support
- This is a **shared infrastructure update**, not a new feature component
- Must be completed **before** multi-location database migration runs

---

## Related Tasks

- Depends on: location-name-search feature being deployed
- Blocks: IMPL-BACKEND-SCHEMA (database schema needs matching hook logic)
- Related: IMPL-FRONTEND-LOCATION-SEARCH-FILTER (will use updated hook)
