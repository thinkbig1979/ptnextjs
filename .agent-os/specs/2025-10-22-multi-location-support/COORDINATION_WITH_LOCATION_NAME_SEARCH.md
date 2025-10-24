# Coordination with Location-Name-Search Feature

**Date**: 2025-10-23
**Purpose**: Document coordination between multi-location-support and location-name-search features

---

## Summary

The multi-location-support spec has been updated to **build on** and **extend** the location-name-search feature foundation, ensuring no duplicate infrastructure and proper integration.

---

## Key Changes Made

### 1. Unified Geocoding API (Photon via `/api/geocode`)

**Before**: Multi-location spec planned to use geocode.maps.co API directly from client

**After**: Reuses existing `/api/geocode` backend proxy from location-name-search

**Benefits**:
- ✅ Consistent geocoding infrastructure across all features
- ✅ Single rate limiting and monitoring point
- ✅ No duplicate API integrations
- ✅ Easier to maintain and swap providers if needed

**Files Updated**:
- `sub-specs/technical-spec.md` - Updated GeocodingButton component description
- `sub-specs/architecture-decisions.md` - ADR-002 completely rewritten
- `sub-specs/integration-requirements.md` - External service section updated to use Photon

---

### 2. Added useLocationFilter Hook Update Task

**New Task**: PRE-3 - Update useLocationFilter Hook for Multi-Location Support

**Purpose**: Update the existing hook from location-name-search to support:
- Both `vendor.location` (old single location) and `vendor.locations[]` (new array)
- Tier-based filtering (Tier 0/1 = HQ only, Tier 2+ = all locations)
- Find closest location for each vendor (not just first location)
- Return `matchedLocation` to indicate which office matched search

**Critical**: This bridges the two features and must maintain backward compatibility

**Files Created**:
- `tasks/task-pre-3-update-location-filter.md` - Complete task specification with:
  - Detailed implementation requirements
  - Full test suite specifications (5+ test cases)
  - Backward compatibility requirements
  - Code examples showing before/after

**Files Updated**:
- `tasks.md` - Added PRE-3 to Phase 1, updated task count to 20, updated dependency graph

---

### 3. Type System Coordination

**Documented** in `sub-specs/integration-requirements.md`:

```typescript
// Existing from location-name-search
export interface VendorCoordinates {
  latitude: number;
  longitude: number;
}

// New from multi-location (extends VendorCoordinates)
export interface VendorLocation extends VendorCoordinates {
  address: string;
  city: string;
  country: string;
  isHQ: boolean;
}

// Enhanced return type
export interface VendorWithDistance extends Vendor {
  distance: number;
  matchedLocation?: VendorLocation; // NEW: Which location matched
}
```

**Compatibility**: ✅ VendorLocation is a superset of VendorCoordinates

---

### 4. Integration Requirements Documentation

**Added Section**: "Critical Integration with Location-Name-Search Feature"

**Location**: `sub-specs/integration-requirements.md:62-224

**Contents**:
- Dependency declaration (multi-location depends on location-name-search)
- Required components from location-name-search
- Detailed useLocationFilter update specification with before/after code
- Type system coordination
- Geocoding API unification explanation

---

### 5. Dependency Graph Updated

**Updated**: `tasks.md` dependency graph now shows:

```
Phase 0: External Dependency
  [location-name-search feature deployed]
    ↓ (provides /api/geocode and useLocationFilter hook)
    ↓
Phase 1: Pre-Execution
  PRE-1 (context-fetcher)
    ↓
  PRE-2 (context-fetcher)
    ↓
  PRE-3 (frontend-react-specialist) ← Updates useLocationFilter hook
    ↓
    ├─────────────────────────────────────────┐
    ↓                                         ↓
Phase 2: Backend                    Phase 3: Frontend
  ...
```

---

## Implementation Order

### ✅ Step 1: Complete location-name-search feature
- Currently 52.6% complete (10/19 tasks done)
- Provides: `/api/geocode` endpoint and `useLocationFilter` hook

### ⏭️ Step 2: Execute multi-location PRE-3 task
- Update useLocationFilter hook to support locations[] array
- Add tier-based filtering logic
- Maintain backward compatibility
- All tests must pass

### ⏭️ Step 3: Proceed with multi-location implementation
- Backend schema changes (locations array field)
- Frontend UI components (LocationsManagerCard, etc.)
- Integration with updated useLocationFilter hook

---

## Files Modified

### Specification Files
1. ✅ `spec.md` - Added coordination note in Overview
2. ✅ `sub-specs/technical-spec.md` - Updated GeocodingButton description
3. ✅ `sub-specs/architecture-decisions.md` - Rewrote ADR-002 for Photon API reuse
4. ✅ `sub-specs/integration-requirements.md` - Added critical integration section, updated external service docs

### Task Files
5. ✅ `tasks.md` - Added PRE-3, updated counts, updated dependency graph, updated execution guide
6. ✅ `tasks/task-pre-3-update-location-filter.md` - NEW: Complete task specification

### Documentation
7. ✅ `COORDINATION_WITH_LOCATION_NAME_SEARCH.md` - THIS FILE (summary of changes)

---

## Verification Checklist

Before implementing multi-location-support:

- [ ] location-name-search feature is deployed to production
- [ ] `/api/geocode` endpoint is available and tested
- [ ] `useLocationFilter` hook exists in codebase
- [ ] All location-name-search tests are passing
- [ ] PRE-3 task completed successfully
- [ ] Updated useLocationFilter hook tests are passing (existing + new)
- [ ] No regression in location-name-search functionality

---

## Benefits of This Coordination

### 1. No Duplicate Infrastructure
- Single geocoding API proxy (not two different services)
- Single location filtering hook (not parallel implementations)

### 2. Consistent User Experience
- Same geocoding service across all features
- Same distance calculation logic
- Consistent error handling and rate limiting

### 3. Easier Maintenance
- One place to update geocoding provider
- One place to update distance calculation algorithm
- Shared test coverage

### 4. Proper Feature Layering
- location-name-search = foundation (user-facing search)
- multi-location-support = extension (vendor profile enhancement)
- Clear separation of concerns

---

## Questions & Answers

**Q: Why not use two different geocoding APIs?**
A: Maintaining two different APIs doubles the maintenance burden, creates inconsistent user experiences, and provides no real benefit since both need the same functionality.

**Q: Why update useLocationFilter instead of creating a new hook?**
A: The hook's purpose is "filter vendors by location distance" - this doesn't change. Supporting multiple locations is an enhancement, not a new feature. Creating a parallel hook would duplicate logic.

**Q: What if location-name-search isn't finished?**
A: Multi-location implementation is blocked until location-name-search is deployed. The dependency is clearly documented and the task order prevents proceeding without the foundation.

**Q: Is backward compatibility guaranteed?**
A: Yes. PRE-3 task has explicit acceptance criteria requiring all existing location-name-search tests to pass, and the implementation supports both old (location) and new (locations[]) formats.

---

## Contact

For questions about this coordination:
- Review this document
- Check `sub-specs/integration-requirements.md` section on "Critical Integration"
- Review PRE-3 task file for useLocationFilter update details
