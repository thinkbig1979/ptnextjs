# E2E Test Repair Handoff

## Current State: 66/71 tests passing (93.0%)

## Session Progress

### APPLICATION BUG FIX Applied
**LocationsManagerCard "Add Location" button disabled bug**

**Root Cause**: The "Add Location" button was disabled when `isEditing || !canAddMore`. When a user clicked "Add Location", `editingIndex` was set to non-null which made `isEditing = true`. There was no way to exit edit mode without completing all required fields (including geocoded lat/lng) via "Save Locations".

**Fix Applied** (`components/dashboard/LocationsManagerCard.tsx`):
1. Added `Check` icon import
2. Added "Done Editing" button after LocationFormFields that calls `setEditingIndex(null)` to exit edit mode without requiring full validation/save

This allows users to:
- Add a location and exit edit mode without filling all fields
- Add another location immediately after
- Fill incomplete locations later before saving to backend

### Test Updates Applied
Updated tests to use the new "Done Editing" button:

1. **08-tier3-promotions.spec.ts**:
   - Line 231-242: Changed from `/Save|Add/` button to `/Done.*Editing/` button
   - Added pre-check to close any existing location edit form before adding new ones (lines 201-207)

2. **12-e2e-happy-path.spec.ts**:
   - Lines 227-232, 249-254: Changed from "Save" button to "Done Editing" button for locations
   - Added pre-check to close any existing location edit form (lines 203-208)
   - Added graceful handling when Add button is disabled (lines 270-273)

## Remaining Failures (5 tests)

| Test | File:Line | Error | Root Cause |
|------|-----------|-------|------------|
| 6.8 Drag-drop | 06-tier1-advanced-profile.spec.ts:377 | Timeout | Feature may not be implemented or selector issue |
| 8.5 Unlimited locations | 08-tier3-promotions.spec.ts:184 | Flaky | Pre-existing location in edit mode on page load |
| 9.2 View product list | 09-product-management.spec.ts:55 | Products not visible | UI cache/refresh after seeding |
| 9.3 Add new product | 09-product-management.spec.ts:105 | Timeout on name input | Product form not opening |
| 12 Happy path | 12-e2e-happy-path.spec.ts:17 | Timeout on location input | Pre-existing location in edit mode |

## Investigation Findings

### Test 8.5, 12 - Location Form State Issue
Tests are flaky because:
- Sometimes a location already exists in edit mode when the page loads
- The seed API doesn't create locations, so this may be state from previous test runs
- The "close existing edit form" logic helps but doesn't catch all cases

Potential fixes:
1. Clear vendor data between tests more aggressively
2. Add explicit wait for component to be in "ready" state
3. Investigate why location exists with editingIndex=0 on load

### Test 9.2, 9.3 - Product Management Issues
- Products are seeded successfully but not visible in UI
- May be cache invalidation or selector issues
- Product form may require specific sequence to open

## Files Modified This Session
- `components/dashboard/LocationsManagerCard.tsx` - Added "Done Editing" button (APPLICATION BUG FIX)
- `tests/e2e/vendor-onboarding/08-tier3-promotions.spec.ts` - Updated location handling
- `tests/e2e/vendor-onboarding/12-e2e-happy-path.spec.ts` - Updated location handling

## Beads Tasks
- `ptnextjs-zrw1` - FIX: Location/product form selectors (in_progress)

## To Continue

```bash
# Start server
DISABLE_EMAILS=true DISABLE_RATE_LIMIT=true npm run dev

# Run failing tests to investigate
DISABLE_EMAILS=true npx playwright test tests/e2e/vendor-onboarding/08-tier3-promotions.spec.ts:184 --workers=1 --timeout=90000

# Run specific test with trace for debugging
DISABLE_EMAILS=true npx playwright test tests/e2e/vendor-onboarding/09-product-management.spec.ts:55 --trace=on --workers=1

# Run full suite
DISABLE_EMAILS=true npx playwright test tests/e2e/vendor-onboarding/ --workers=2 --reporter=list --timeout=90000
```

## Recommended Next Steps

1. **Investigate flaky location state**:
   - Check if component initializes `editingIndex` incorrectly
   - Check if there's stale session/localStorage data

2. **Fix Product Management Tests**:
   - Add wait/refresh after product seeding
   - Verify product form selector is correct
   - Check if products tab opens correctly

3. **Fix drag-and-drop test**:
   - Verify drag-and-drop is implemented
   - Use proper Playwright drag-drop API
