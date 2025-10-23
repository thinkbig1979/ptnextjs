# Task: impl-frontend-unit-mismatch-fix - Fix Unit Mismatch in useLocationFilter

**Metadata:**
- **Task ID:** impl-frontend-unit-mismatch-fix
- **Phase:** Phase 3: Frontend Implementation
- **Agent:** frontend-react-specialist
- **Estimated Time:** 20-25 min
- **Dependencies:** test-frontend-ui
- **Status:** Pending
- **Priority:** Critical

## Description

Fix the unit mismatch in useLocationFilter hook where distance calculations are performed in miles but the UI displays them as kilometers. Change all distance calculations to use kilometers consistently.

## Specifics

**Issue:**
- Current: `calculateDistance` in `lib/utils/location.ts` returns miles
- Current: `useLocationFilter` uses miles for filtering
- Current: UI displays distance as "km" (incorrect)
- Required: All calculations in km, UI displays "km" (correct)

**Files to Modify:**
- `/home/edwin/development/ptnextjs/hooks/useLocationFilter.ts`
- `/home/edwin/development/ptnextjs/lib/utils/location.ts`

**Changes Required:**

1. **Update calculateDistance function:**
   - Change calculation from miles to kilometers
   - Update constant: Earth radius in km (6371 km) instead of miles (3959 miles)
   - Update JSDoc comments to reflect km units

2. **Update useLocationFilter hook:**
   - Verify distance parameter is treated as km
   - Update any comments referencing miles
   - Ensure isWithinDistance uses km

3. **Update all usages:**
   - Verify LocationSearchFilter uses km for slider
   - Verify formatDistance displays km correctly
   - Update any hardcoded distance values

4. **Update tests:**
   - Update test expectations from miles to km
   - Verify distance calculations with known coordinates
   - Test edge cases (0 km, very large distances)

**Expected Conversions:**
- 1 mile = 1.60934 km
- Current slider max: 500 (miles) → Keep as 500 (km) (larger radius)
- Test coordinate pairs should verify km distances

## Acceptance Criteria

- [ ] calculateDistance returns kilometers
- [ ] useLocationFilter uses kilometers for filtering
- [ ] UI correctly displays "km" (no change needed, already correct)
- [ ] All distance calculations consistent with km
- [ ] Test coordinates verify correct km distances
- [ ] No breaking changes to vendor filtering logic
- [ ] All tests pass with updated expectations
- [ ] TypeScript compilation succeeds
- [ ] No ESLint warnings

## Testing Requirements

**Functional Testing:**
- Run hook tests: `npm test -- useLocationFilter.test.ts`
- Run location utils tests: `npm test -- location.test.ts`
- All tests must pass with km expectations

**Manual Verification:**
- Known coordinate tests:
  ```typescript
  // Monaco to Nice: ~20 km (not ~12 miles)
  const distance = calculateDistance(
    { lat: 43.7384, lon: 7.4246 },  // Monaco
    { lat: 43.7102, lon: 7.2620 }   // Nice
  );
  expect(distance).toBeCloseTo(20, 1);

  // New York to Los Angeles: ~3944 km (not ~2451 miles)
  const distance2 = calculateDistance(
    { lat: 40.7128, lon: -74.0060 },  // NYC
    { lat: 34.0522, lon: -118.2437 }  // LA
  );
  expect(distance2).toBeCloseTo(3944, 0);
  ```

**Browser Testing:**
- Test vendor filtering with known locations
- Verify distance slider shows correct filtered results
- Verify distance display is accurate

**Error Scenarios:**
- Distance = 0 → Same location, 0 km
- Very large distance (>20000 km) → Handles correctly
- Negative coordinates → Calculates correctly

**Evidence Required:**
- All unit tests passing with km expectations
- Manual verification with real coordinates
- Before/after comparison showing:
  - Old: calculateDistance returned miles
  - New: calculateDistance returns kilometers
- Vendor filtering still works correctly

## Context Requirements

**Required Context:**
- @.agent-os/specs/2025-10-22-location-name-search/spec.md
- @.agent-os/specs/2025-10-22-location-name-search/tasks/task-pre-1.md (identified the issue)
- @.agent-os/specs/2025-10-22-location-name-search/tasks/task-test-frontend-ui.md
- Existing useLocationFilter hook code
- Existing location utilities code

**Assumptions:**
- Haversine formula implementation is correct (just wrong radius)
- UI already displays "km" (no UI changes needed)
- Slider values in km are acceptable (0-500 km)

## Implementation Notes

**Current Implementation (INCORRECT):**

```typescript
// lib/utils/location.ts
export function calculateDistance(
  coord1: { lat: number; lon: number },
  coord2: { lat: number; lon: number }
): number {
  const R = 3959; // Earth's radius in MILES (WRONG)

  // Haversine formula
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lon - coord1.lon);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance; // Returns MILES but UI says KM
}
```

**Corrected Implementation:**

```typescript
// lib/utils/location.ts

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param coord1 First coordinate (latitude, longitude)
 * @param coord2 Second coordinate (latitude, longitude)
 * @returns Distance in kilometers
 */
export function calculateDistance(
  coord1: { lat: number; lon: number },
  coord2: { lat: number; lon: number }
): number {
  const R = 6371; // Earth's radius in KILOMETERS (CORRECT)

  // Haversine formula
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lon - coord1.lon);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance; // Returns KILOMETERS
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 * @param distance Distance in kilometers
 * @returns Formatted string (e.g., "20 km", "350 km")
 */
export function formatDistance(distance: number): string {
  return `${Math.round(distance)} km`;
}

/**
 * Check if a coordinate is within a certain distance of another coordinate
 * @param coord1 First coordinate
 * @param coord2 Second coordinate
 * @param maxDistance Maximum distance in kilometers
 * @returns True if within distance, false otherwise
 */
export function isWithinDistance(
  coord1: { lat: number; lon: number },
  coord2: { lat: number; lon: number },
  maxDistance: number
): boolean {
  const distance = calculateDistance(coord1, coord2);
  return distance <= maxDistance;
}
```

**Updated Hook (if changes needed):**

```typescript
// hooks/useLocationFilter.ts
export function useLocationFilter(
  vendors: Vendor[],
  userLocation: { lat: number; lon: number } | null,
  maxDistance: number // in KILOMETERS
): Vendor[] {
  if (!userLocation) return vendors;

  return vendors.filter(vendor => {
    if (!vendor.coordinates) return false;

    const distance = calculateDistance(
      userLocation,
      vendor.coordinates
    ); // distance in KM

    return distance <= maxDistance; // maxDistance in KM
  });
}
```

**Test Updates:**

```typescript
describe('calculateDistance', () => {
  it('should calculate distance in kilometers', () => {
    // Monaco to Nice: ~20 km
    const distance = calculateDistance(
      { lat: 43.7384, lon: 7.4246 },
      { lat: 43.7102, lon: 7.2620 }
    );
    expect(distance).toBeCloseTo(20, 1);
  });

  it('should calculate long distances correctly', () => {
    // NYC to LA: ~3944 km
    const distance = calculateDistance(
      { lat: 40.7128, lon: -74.0060 },
      { lat: 34.0522, lon: -118.2437 }
    );
    expect(distance).toBeCloseTo(3944, 0);
  });

  it('should return 0 for same location', () => {
    const coord = { lat: 43.7384, lon: 7.4246 };
    expect(calculateDistance(coord, coord)).toBe(0);
  });
});
```

## Quality Gates

- [ ] All distance calculations use kilometers
- [ ] JSDoc comments updated to reflect km units
- [ ] All tests pass with km expectations
- [ ] No breaking changes to existing functionality
- [ ] Code reviewed for correctness
- [ ] Manual verification with real coordinates
- [ ] TypeScript compilation succeeds

## Related Files

**Spec Files:**
- @.agent-os/specs/2025-10-22-location-name-search/spec.md
- @.agent-os/specs/2025-10-22-location-name-search/sub-specs/technical-spec.md

**Implementation Files:**
- /home/edwin/development/ptnextjs/hooks/useLocationFilter.ts (MODIFY)
- /home/edwin/development/ptnextjs/lib/utils/location.ts (MODIFY)
- /home/edwin/development/ptnextjs/components/LocationSearchFilter.tsx (verify km usage)

**Test Files:**
- /home/edwin/development/ptnextjs/tests/unit/hooks/useLocationFilter.test.ts (UPDATE)
- /home/edwin/development/ptnextjs/tests/unit/lib/location.test.ts (UPDATE or CREATE)

**Related Tasks:**
- task-pre-1 (identified the issue)
- task-test-frontend-ui (provides test expectations)
- task-impl-frontend-location-search-filter (uses fixed hook)
