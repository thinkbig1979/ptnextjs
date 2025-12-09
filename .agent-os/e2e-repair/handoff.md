# E2E Test Repair Handoff

## Current State: 66/71 tests passing (93.0%)

## Session Progress

### Fixes Applied
1. **Product Seed API - Empty description fix**
   - File: `app/api/test/products/seed/route.ts`
   - Changed `textToLexical('')` to default to `'Product description'` for empty strings
   - This fixed products collection requiring non-empty richText description field

### Test Results After Fix
```
66 passed (8.9m)
5 failed
```

## Remaining Failures (5 tests)

| Test | File:Line | Error | Root Cause |
|------|-----------|-------|------------|
| 7.5 Geocoding | 07-tier2-locations.spec.ts:240 | Timeout waiting for coordinates update | SELECTOR_BROKEN - geocode button not responsive |
| 8.5 Unlimited locations | 08-tier3-promotions.spec.ts:184 | `expect(locationsAdded).toBeGreaterThan(0)` | APPLICATION_BUG - "Add Location" button disabled (isEditing=true) |
| 9.2 View product list | 09-product-management.spec.ts:55 | Products not visible after seeding | UI_CACHE or SELECTOR - products seeded but not displayed |
| 9.3 Add new product | 09-product-management.spec.ts:105 | Timeout on name input | SELECTOR_BROKEN - product form not opening |
| 12 Happy path | 12-e2e-happy-path.spec.ts:17 | Timeout on location name input | Same as 8.5 - location form issue |

## Investigation Findings

### Test 8.5, 12 - Location Form Button Disabled Issue
The "Add Location" button in `LocationsManagerCard.tsx` is disabled when `isEditing || !canAddMore`:
- `isEditing = editingIndex !== null`
- The button shows disabled even with 1 location for tier3

Looking at error-context.md for test 8.5:
- Button shows as `button "Add Location" [disabled]`
- The location form shows input fields are visible (editing mode)
- `editingIndex` appears to be non-null causing button disable

**Hypothesis**: When the page loads with existing locations, the component may be entering edit mode automatically, which disables the Add button.

**File to investigate**: `components/dashboard/LocationsManagerCard.tsx:244`
```tsx
<Button onClick={handleAddLocation} size="sm" disabled={isEditing || !canAddMore}>
```

### Test 9.2 - Products Not Visible
Products are seeded successfully but not showing in the UI. Possible causes:
1. Product list not refreshing after seed
2. Products tab content not rendering correctly
3. Selectors incorrect for finding products

## Files Modified This Session
- `app/api/test/products/seed/route.ts` - Added default description for empty strings

## Beads Tasks
- `ptnextjs-zrw1` - FIX: Location/product form selectors not finding elements in E2E tests (in_progress)

## To Continue

```bash
# Start server
DISABLE_EMAILS=true DISABLE_RATE_LIMIT=true npm run dev

# Run specific failing tests
DISABLE_EMAILS=true npx playwright test tests/e2e/vendor-onboarding/08-tier3-promotions.spec.ts:184 --workers=1 --timeout=90000

# Run all vendor-onboarding tests
DISABLE_EMAILS=true npx playwright test tests/e2e/vendor-onboarding/ --workers=1 --reporter=list --timeout=90000
```

## Recommended Next Steps

1. **Fix Location Form Issue (8.5, 12)**:
   - Investigate why `editingIndex` is non-null on page load
   - Check if component auto-enters edit mode for incomplete locations
   - May need to modify test to save/close existing location before adding new ones

2. **Fix Product List Issue (9.2)**:
   - Add wait/refresh after product seeding
   - Check if products tab selector is correct
   - Verify products are associated with correct vendor

3. **Fix Product Form Issue (9.3)**:
   - Similar to location form - check if form opens correctly
   - May need different selector for product name input
