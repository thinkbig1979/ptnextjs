# Vendor Location Mapping - Remaining Tasks

**Status:** 🚧 In Progress
**Date:** 2025-10-19
**Core Features:** ✅ Complete (24/24 tests passing)
**Search Features:** ⏳ Pending Implementation

---

## Executive Summary

The **core vendor location mapping feature is complete** with all maps displaying correctly. What remains are the **location-based search/filtering features** that allow users to find vendors by proximity.

### Completed ✅
- Maps display with OpenStreetMap tiles
- Vendor detail pages show location maps
- Location cards display address/coordinates
- All 24 Playwright E2E tests passing
- Responsive design verified

### Pending 🚧
- Distance-based vendor search
- Location proximity filtering
- Haversine distance calculations
- Location search UI integration

---

## Remaining Implementation Tasks

### 1. Haversine Distance Calculation Utility ⏳

**Task ID:** `impl-frontend-distance`
**File:** `lib/utils/distance.ts`
**Time Estimate:** 2 hours
**Status:** Not Started

**What to Build:**
```typescript
// Calculate distance between two coordinates
export function calculateDistance(
  coord1: VendorCoordinates,
  coord2: VendorCoordinates
): number

// Format distance for display
export function formatDistance(distanceKm: number): string

// Validate coordinates
export function isValidCoordinates(coord: VendorCoordinates): boolean
```

**Details:** See `.agent-os/specs/2025-10-19-vendor-location-mapping/tasks/task-impl-frontend-distance.md`

**Acceptance Criteria:**
- [ ] Haversine formula implemented correctly
- [ ] Handles coordinate validation
- [ ] Returns distance in kilometers
- [ ] Formats distance as "X km" or "X.X km"
- [ ] Unit tests pass with known distances
- [ ] Edge cases handled (poles, international date line)

---

### 2. LocationSearchFilter Component ⏳

**Task ID:** `impl-frontend-search`
**File:** `components/LocationSearchFilter.tsx`
**Time Estimate:** 3 hours
**Status:** Not Started

**What to Build:**
A search filter component with:
- Latitude/Longitude input fields
- Distance radius slider (1-500 km)
- "Search" and "Reset" buttons
- Results counter display
- Optional: Browser geolocation button

**Interface:**
```typescript
interface LocationSearchFilterProps {
  onSearch: (userLocation: VendorCoordinates, distance: number) => void;
  onReset: () => void;
  resultCount?: number;
  totalCount?: number;
  className?: string;
}
```

**Details:** See `.agent-os/specs/2025-10-19-vendor-location-mapping/tasks/task-impl-frontend-search.md`

**Acceptance Criteria:**
- [ ] Component renders with shadcn/ui components
- [ ] Input fields validate coordinate ranges
- [ ] Distance slider works smoothly (1-500 km)
- [ ] "Get My Location" button uses browser geolocation API
- [ ] Shows "X of Y vendors within Z km" message
- [ ] Reset button clears all filters
- [ ] Responsive on mobile devices
- [ ] Accessible (keyboard navigation, ARIA labels)

---

### 3. useLocationFilter Custom Hook ⏳

**Task ID:** `impl-frontend-hook`
**File:** `hooks/useLocationFilter.ts`
**Time Estimate:** 2 hours
**Status:** Not Started

**What to Build:**
A custom React hook that:
- Filters vendors by distance from user location
- Sorts vendors by proximity
- Memoizes calculations for performance
- Returns filtered/sorted vendor list

**Interface:**
```typescript
export function useLocationFilter(
  vendors: Vendor[],
  userLocation: VendorCoordinates | null,
  maxDistance: number
): {
  filteredVendors: Vendor[];
  totalCount: number;
  filteredCount: number;
  isActive: boolean;
}
```

**Details:** See `.agent-os/specs/2025-10-19-vendor-location-mapping/tasks/task-impl-frontend-hook.md`

**Acceptance Criteria:**
- [ ] Filters vendors by distance correctly
- [ ] Sorts by proximity (closest first)
- [ ] Memoizes calculations (useMemo)
- [ ] Handles null/undefined locations gracefully
- [ ] Returns correct counts
- [ ] Performance tested with 100+ vendors
- [ ] Unit tests pass

---

### 4. Integrate Location Search into Vendor List Page ⏳

**Task ID:** `impl-frontend-vendor-list`
**File:** `app/(site)/vendors/page.tsx` and `app/(site)/components/vendors-client.tsx`
**Time Estimate:** 3 hours
**Status:** Not Started

**What to Build:**
Integrate the location search filter into the existing vendors page:
- Add LocationSearchFilter component above vendor grid
- Wire up useLocationFilter hook
- Update URL parameters for location filters
- Combine with existing category/search filters
- Add visual indicators for location-filtered results

**Details:** See `.agent-os/specs/2025-10-19-vendor-location-mapping/tasks/task-impl-frontend-vendor-list.md`

**Acceptance Criteria:**
- [ ] LocationSearchFilter displays above vendor grid
- [ ] Location filtering works with category/search filters
- [ ] URL parameters include location data (?lat=X&lng=Y&distance=Z)
- [ ] Pagination resets when location filter changes
- [ ] Visual indicator shows when location filtering active
- [ ] "Clear location filter" button available
- [ ] Results show distance from user location
- [ ] Responsive layout on mobile
- [ ] Playwright E2E tests pass

---

## Implementation Order

Follow this sequence for optimal development flow:

```
1. impl-frontend-distance (2h)
   ↓ (distance calculations needed by hook)
2. impl-frontend-hook (2h)
   ↓ (hook needed by component)
3. impl-frontend-search (3h)
   ↓ (component ready for integration)
4. impl-frontend-vendor-list (3h)
   ↓ (full integration)
```

**Total Time Estimate:** 10 hours

---

## Testing Requirements

### Unit Tests
- [ ] Distance calculation tests (lib/utils/distance.test.ts)
- [ ] useLocationFilter hook tests (hooks/useLocationFilter.test.ts)
- [ ] LocationSearchFilter component tests (optional)

### E2E Tests
Create: `tests/e2e/vendor-location-search.spec.ts`

**Test Scenarios:**
- [ ] Enter coordinates and search for vendors
- [ ] Adjust distance slider and see results update
- [ ] Use "Get My Location" button (mock geolocation)
- [ ] Reset location filter
- [ ] Combine location filter with category filter
- [ ] Combine location filter with search query
- [ ] Verify URL parameters update correctly
- [ ] Test mobile responsive layout
- [ ] Verify accessibility (keyboard navigation)

---

## Files to Create

```
lib/utils/distance.ts                    # NEW - Distance calculations
lib/utils/distance.test.ts               # NEW - Unit tests
hooks/useLocationFilter.ts               # NEW - Filtering hook
hooks/useLocationFilter.test.ts          # NEW - Hook tests
components/LocationSearchFilter.tsx       # NEW - Search UI
tests/e2e/vendor-location-search.spec.ts # NEW - E2E tests
```

## Files to Modify

```
app/(site)/vendors/page.tsx              # Add location filter
app/(site)/components/vendors-client.tsx # Integrate filter logic
```

---

## Success Criteria

**Feature Complete When:**
- [ ] All 4 remaining tasks implemented
- [ ] Distance calculations accurate (tested with real coordinates)
- [ ] Location search UI functional and responsive
- [ ] Filtering works correctly with existing filters
- [ ] All unit tests pass
- [ ] All E2E tests pass (existing + new location search tests)
- [ ] URL parameters persist location search state
- [ ] Performance acceptable with 100+ vendors
- [ ] Accessibility requirements met (WCAG 2.1 AA)
- [ ] Documentation updated

---

## Quick Start Commands

### To Implement Distance Utility:
```bash
# Create file
touch lib/utils/distance.ts

# Implement Haversine formula
# See: tasks/task-impl-frontend-distance.md

# Create tests
touch lib/utils/distance.test.ts
npm test lib/utils/distance.test.ts
```

### To Implement Search Component:
```bash
# Create component
touch components/LocationSearchFilter.tsx

# Use shadcn/ui components
# See: tasks/task-impl-frontend-search.md

# Test in isolation
npm run dev
# Navigate to http://localhost:3000/vendors
```

### To Run E2E Tests:
```bash
# Run existing tests
npx playwright test tests/e2e/vendor-location-mapping.spec.ts

# Create new location search tests
touch tests/e2e/vendor-location-search.spec.ts

# Run all vendor tests
npx playwright test tests/e2e/vendor-*.spec.ts
```

---

## Notes

- **Browser Geolocation:** Optional feature - requires HTTPS in production
- **Geocoding:** Not in scope - users enter coordinates manually
- **Performance:** Memoize distance calculations for large vendor lists
- **Mobile:** Location search especially useful on mobile devices
- **Privacy:** Don't store user location - use URL params only

---

## References

- **Haversine Formula:** https://en.wikipedia.org/wiki/Haversine_formula
- **Geolocation API:** https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
- **shadcn/ui Slider:** https://ui.shadcn.com/docs/components/slider
- **React Hooks:** https://react.dev/reference/react

---

**Ready to implement?** Start with `task-impl-frontend-distance.md` to build the distance calculation utility.
