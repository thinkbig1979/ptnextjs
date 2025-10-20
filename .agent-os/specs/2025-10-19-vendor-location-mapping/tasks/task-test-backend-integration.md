# Task: Validate TinaCMS Schema and Data Transformation

**Task ID**: test-backend-integration
**Phase**: Phase 2 - Backend Implementation (TinaCMS Schema)
**Agent**: test-architect
**Estimated Time**: 2 hours
**Dependencies**: impl-backend-service

## Objective

Perform comprehensive validation of TinaCMS schema changes and data service transformations to ensure backend implementation is working correctly before frontend development begins.

## Context Requirements

**Files to Review**:
- `/home/edwin/development/ptnextjs/tina/config.ts` (updated schema)
- `/home/edwin/development/ptnextjs/lib/tinacms-data-service.ts` (updated transformations)
- `/home/edwin/development/ptnextjs/tina/__generated__/types.ts` (generated types)
- `/home/edwin/development/ptnextjs/.agent-os/specs/2025-10-19-vendor-location-mapping/tasks/backend-test-suite.md`

## Testing Phases

### Phase 1: Schema Validation

#### Test 1.1: TinaCMS Build
```bash
cd /home/edwin/development/ptnextjs
npm run tina:build
```

**Expected Results**:
- ✓ Schema compiles without errors
- ✓ Types generated in `tina/__generated__/types.ts`
- ✓ No TypeScript compilation errors
- ✓ Coordinate fields present in generated types
- ✓ Address fields present in generated types

#### Test 1.2: TypeScript Type Check
```bash
npm run type-check
```

**Expected Results**:
- ✓ No type errors in project
- ✓ Data service types align with TinaCMS types
- ✓ Vendor interface matches usage in components

#### Test 1.3: Admin UI Field Validation

```bash
npm run dev:tinacms
# Navigate to http://localhost:3000/admin
```

**Manual Test Steps**:
1. Log into TinaCMS admin (if credentials configured)
2. Navigate to Vendors collection
3. Open an existing vendor or create new vendor
4. Verify fields appear:
   - [ ] Location field (existing)
   - [ ] Geographic Coordinates section
     - [ ] Latitude field
     - [ ] Longitude field
   - [ ] Structured Address section
     - [ ] Street Address field
     - [ ] City field
     - [ ] State/Region field
     - [ ] Postal Code field
     - [ ] Country field

5. Test field validation:
   - [ ] Enter latitude > 90 → Should show error
   - [ ] Enter latitude < -90 → Should show error
   - [ ] Enter longitude > 180 → Should show error
   - [ ] Enter longitude < -180 → Should show error
   - [ ] Enter valid coordinates → Should accept
   - [ ] Enter country code "USA" (3 letters) → Should show error
   - [ ] Enter country code "US" (2 letters) → Should accept

### Phase 2: Test Data Creation

Create test vendors with different location data scenarios:

#### Test 2.1: Vendor with Full Location Data

Create file: `/home/edwin/development/ptnextjs/content/vendors/test-full-location.md`

```markdown
---
name: Test Vendor - Full Location
featured: false
partner: true
location: Monaco
coordinates:
  latitude: 43.7384
  longitude: 7.4246
address:
  street: 10 Port de Fontvieille
  city: Monaco
  state: Monaco
  postalCode: "98000"
  country: MC
description: Test vendor with complete location data
---

This is a test vendor with full coordinates and address data.
```

#### Test 2.2: Vendor with Coordinates Only

Create file: `/home/edwin/development/ptnextjs/content/vendors/test-coordinates-only.md`

```markdown
---
name: Test Vendor - Coordinates Only
featured: false
partner: false
location: Fort Lauderdale, Florida
coordinates:
  latitude: 26.1224
  longitude: -80.1373
description: Test vendor with coordinates but no structured address
---

This vendor has coordinates for map display but no structured address.
```

#### Test 2.3: Legacy Vendor (No Coordinates)

Create file: `/home/edwin/development/ptnextjs/content/vendors/test-legacy-vendor.md`

```markdown
---
name: Test Vendor - Legacy
featured: false
partner: false
location: Miami, Florida
description: Legacy vendor with no coordinate data
---

This vendor has only a location string (backward compatibility test).
```

#### Test 2.4: Vendor with Invalid Coordinates (Should Fail)

Create file: `/home/edwin/development/ptnextjs/content/vendors/test-invalid-coords.md`

```markdown
---
name: Test Vendor - Invalid Coordinates
featured: false
partner: false
location: Invalid Location
coordinates:
  latitude: 100
  longitude: -200
description: Test vendor with invalid coordinates
---

This should fail validation or be filtered out.
```

### Phase 3: Data Transformation Testing

#### Test 3.1: Build Static Site
```bash
npm run build
```

**Expected Results**:
- ✓ Build completes successfully
- ✓ Console warnings for invalid coordinates (test-invalid-coords)
- ✓ Console info for legacy vendor without coordinates
- ✓ No errors for valid coordinate data
- ✓ Static pages generated for all test vendors

#### Test 3.2: Verify Data Service Output

Add temporary logging to verify transformation:

```typescript
// In lib/tinacms-data-service.ts, temporarily add:
async getVendors() {
  const vendors = /* existing logic */;

  // Temporary debug logging
  vendors.forEach(vendor => {
    if (vendor.name.startsWith('Test Vendor')) {
      console.log('Test Vendor:', vendor.name);
      console.log('  Location:', vendor.location);
      console.log('  Coordinates:', vendor.coordinates);
      console.log('  Address:', vendor.address);
    }
  });

  return vendors;
}
```

Run build and check console output.

#### Test 3.3: Verify Coordinate Validation

Expected behavior:
- ✓ `test-full-location.md` → coordinates present
- ✓ `test-coordinates-only.md` → coordinates present
- ✓ `test-legacy-vendor.md` → coordinates undefined
- ✓ `test-invalid-coords.md` → coordinates undefined (validation failed)

### Phase 4: Integration Testing

#### Test 4.1: Vendor List API
```bash
# Start dev server
npm run dev

# In another terminal, test data endpoint
curl http://localhost:3000/api/vendors 2>/dev/null | jq '.[] | select(.name | startswith("Test Vendor")) | {name, location, coordinates, address}'
```

**Expected**: JSON response with coordinate and address data for test vendors

#### Test 4.2: Static Page Generation

```bash
# After build, verify generated pages
ls -la .next/server/app/\(site\)/vendors/
ls -la .next/server/app/\(site\)/vendors/test-*/
```

**Expected**: HTML files generated for all test vendors

### Phase 5: Backward Compatibility Testing

#### Test 5.1: Existing Vendors

```bash
# List existing vendors without coordinates
grep -L "coordinates:" content/vendors/*.md | head -5
```

For each existing vendor:
- [ ] Build succeeds
- [ ] Vendor page renders
- [ ] No errors in console
- [ ] Location string displays correctly

#### Test 5.2: Mixed Vendor List

Verify vendor list pages handle mixed data:
- [ ] Some vendors with coordinates
- [ ] Some vendors without coordinates
- [ ] No rendering errors
- [ ] Page builds successfully

## Acceptance Criteria

### Schema Validation
- [ ] `npm run tina:build` succeeds
- [ ] `npm run type-check` passes
- [ ] TinaCMS admin UI shows new fields
- [ ] Field validation works in admin UI

### Test Data
- [ ] 4 test vendors created with different scenarios
- [ ] Test vendor markdown files in `content/vendors/`
- [ ] All scenarios covered (full, coordinates-only, legacy, invalid)

### Data Transformation
- [ ] `npm run build` succeeds
- [ ] Valid coordinates transformed correctly
- [ ] Invalid coordinates filtered out (undefined)
- [ ] Legacy vendors work without coordinates
- [ ] Console warnings for validation failures

### Integration
- [ ] Vendor data includes coordinates when available
- [ ] Vendor data includes address when available
- [ ] Static pages generate correctly
- [ ] No breaking changes to existing vendors

### Backward Compatibility
- [ ] Existing vendors without coordinates still work
- [ ] Vendor list pages handle mixed data
- [ ] No errors for missing coordinate data
- [ ] Graceful degradation implemented

## Validation Checklist

Before marking this task complete:

- [ ] All Phase 1 tests pass (Schema Validation)
- [ ] All Phase 2 test files created (Test Data)
- [ ] All Phase 3 tests pass (Data Transformation)
- [ ] All Phase 4 tests pass (Integration)
- [ ] All Phase 5 tests pass (Backward Compatibility)
- [ ] No TypeScript errors
- [ ] No build errors
- [ ] Console warnings only (no errors)
- [ ] Test data ready for frontend development
- [ ] Documentation updated with test findings

## Test Results Documentation

Create test results file: `/home/edwin/development/ptnextjs/.agent-os/specs/2025-10-19-vendor-location-mapping/backend-test-results.md`

Document:
- Test execution date
- Pass/fail status for each test
- Console output samples
- Screenshots of admin UI validation
- Any issues discovered
- Performance observations

## Notes

- Some tests require manual verification (admin UI)
- Keep test vendor files for frontend development
- Remove debug logging after validation
- Document any unexpected behavior
- Consider test data as fixtures for frontend testing
