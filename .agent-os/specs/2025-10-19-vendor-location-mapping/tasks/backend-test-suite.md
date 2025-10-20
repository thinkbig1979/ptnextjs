# Backend Validation Test Suite

**Version**: 1.0
**Date**: 2025-10-19
**Technology**: Payload CMS (NOT TinaCMS - migrated per PR #5)
**Testing Approach**: Manual validation + TypeScript + Build validation

---

## Testing Strategy Overview

**Technology Correction**: Despite file naming (`tinacms-data-service.ts`), this codebase uses **Payload CMS** with SQLite database (TinaCMS migration completed 2 hours ago per git commit).

**Testing Tools**:
- ✅ **TypeScript Compiler**: Type checking (`npm run type-check`)
- ✅ **Next.js Build**: Static generation validation (`npm run build`)
- ✅ **Payload Admin UI**: Manual schema testing (`npm run dev` → http://localhost:3000/admin)
- ✅ **Console Validation**: transformVendorLocation() warnings and errors
- ❌ **Unit Tests**: Not used in this project (no test framework configured)

**Testing Phases**:
1. **Schema Validation**: Payload CMS field validation in admin UI
2. **Type Checking**: TypeScript compilation without errors
3. **Build Validation**: Static site generation succeeds
4. **Manual Testing**: Create test vendors, verify transformations
5. **Browser Verification**: Playwright E2E (deferred to frontend phase)

---

## Test Category 1: Payload CMS Schema Validation

### 1.1 Coordinate Field Validation

**Test Location**: `/admin/collections/vendors/create` (Payload admin UI)

**Test Cases**:

| Test ID | Description | Input | Expected Outcome | Validation Method |
|---------|-------------|-------|------------------|-------------------|
| SCHEMA-001 | Valid latitude (positive) | `26.122439` | Accepted, saved to database | Payload admin save |
| SCHEMA-002 | Valid latitude (negative) | `-33.865143` | Accepted, saved to database | Payload admin save |
| SCHEMA-003 | Valid latitude (boundary min) | `-90.0` | Accepted | Payload admin save |
| SCHEMA-004 | Valid latitude (boundary max) | `90.0` | Accepted | Payload admin save |
| SCHEMA-005 | Invalid latitude (too high) | `91.0` | **Rejected**: "Latitude must be between -90 and 90" | Payload validation error |
| SCHEMA-006 | Invalid latitude (too low) | `-91.0` | **Rejected**: "Latitude must be between -90 and 90" | Payload validation error |
| SCHEMA-007 | Valid longitude (positive) | `7.4246` | Accepted, saved to database | Payload admin save |
| SCHEMA-008 | Valid longitude (negative) | `-80.137314` | Accepted, saved to database | Payload admin save |
| SCHEMA-009 | Valid longitude (boundary min) | `-180.0` | Accepted | Payload admin save |
| SCHEMA-010 | Valid longitude (boundary max) | `180.0` | Accepted | Payload admin save |
| SCHEMA-011 | Invalid longitude (too high) | `181.0` | **Rejected**: "Longitude must be between -180 and 180" | Payload validation error |
| SCHEMA-012 | Invalid longitude (too low) | `-181.0` | **Rejected**: "Longitude must be between -180 and 180" | Payload validation error |
| SCHEMA-013 | Empty latitude (optional field) | (leave empty) | Accepted, saved as null | Payload admin save |
| SCHEMA-014 | Empty longitude (optional field) | (leave empty) | Accepted, saved as null | Payload admin save |

**Manual Test Steps**:
```bash
# 1. Start dev server
npm run dev

# 2. Open Payload admin
# Navigate to: http://localhost:3000/admin

# 3. Create new vendor
# Click: Collections → Vendors → Create New

# 4. Scroll to Location Information section
# Test each case above by entering values and attempting to save

# 5. Verify validation messages appear for invalid values
# Verify successful saves for valid values
```

### 1.2 Address Field Validation

**Test Location**: Payload admin UI → Location Information group

**Test Cases**:

| Test ID | Description | Input | Expected Outcome |
|---------|-------------|-------|------------------|
| SCHEMA-015 | Full address (all fields) | address: "123 Main St", city: "Fort Lauderdale", country: "United States" | Accepted, all fields saved |
| SCHEMA-016 | Partial address (address only) | address: "10 Port de Fontvieille" | Accepted, other fields null |
| SCHEMA-017 | Partial address (city only) | city: "Monaco" | Accepted, other fields null |
| SCHEMA-018 | Empty address (all optional) | (all fields empty) | Accepted, entire location group null |
| SCHEMA-019 | Long address text (500 chars) | (500-character address string) | Accepted (text field, no max length) |
| SCHEMA-020 | Special characters in address | "Rue de l'Église, Côte d'Azur" | Accepted (UTF-8 support) |

### 1.3 Location Group Field Behavior

**Test Location**: Payload admin UI

**Test Cases**:

| Test ID | Description | Action | Expected Outcome |
|---------|-------------|--------|------------------|
| SCHEMA-021 | Location group appears in form | Open vendor edit page | "Location Information" section visible |
| SCHEMA-022 | Location group is collapsible | Click section header | Section expands/collapses |
| SCHEMA-023 | Helper text displays | Hover over field labels | Placeholder and description text visible |
| SCHEMA-024 | Geocoding link in description | Read latitude field description | Contains link/reference to geocode.maps.co |
| SCHEMA-025 | All fields have placeholders | Review all location fields | Example values visible (e.g., "26.122439") |

---

## Test Category 2: Data Service Transformation Tests

### 2.1 transformVendorLocation Method Tests

**Test Location**: Console output during `npm run build`

**Test Cases**:

| Test ID | Description | Input Scenario | Expected Transform Output | Validation Method |
|---------|-------------|----------------|---------------------------|-------------------|
| TRANS-001 | Vendor with full location | `{ address: "...", latitude: 26, longitude: -80, city: "...", country: "..." }` | VendorLocation object with all fields | Console: no warnings |
| TRANS-002 | Vendor with coordinates only | `{ latitude: 26, longitude: -80 }` | VendorLocation object with lat/lng, other fields undefined | Console: no warnings |
| TRANS-003 | Vendor with address only | `{ address: "Fort Lauderdale, FL" }` | VendorLocation object with address, no coordinates | Console: no warnings |
| TRANS-004 | Vendor with no location | `undefined` or `null` | undefined (graceful fallback) | Console: no warnings |
| TRANS-005 | Vendor with legacy string location | `"Monaco"` (string, not object) | String passthrough (backward compatibility) | Console: no warnings |
| TRANS-006 | Invalid latitude (too high) | `{ latitude: 100, longitude: -80 }` | VendorLocation without coordinates + console warning | Console: "Invalid coordinates" warning |
| TRANS-007 | Invalid longitude (too low) | `{ latitude: 26, longitude: -200 }` | VendorLocation without coordinates + console warning | Console: "Invalid coordinates" warning |
| TRANS-008 | Both invalid coordinates | `{ latitude: -100, longitude: 200 }` | VendorLocation without coordinates + console warning | Console: "Invalid coordinates" warning |
| TRANS-009 | Partial coordinates (lat only) | `{ latitude: 26 }` (missing longitude) | VendorLocation without coordinates (both required) | Console: no warnings |
| TRANS-010 | Empty string address | `{ address: "" }` | VendorLocation with address undefined | Console: no warnings |

**Manual Test Steps**:
```bash
# 1. Create test vendors in Payload admin with various location data scenarios
# (See test fixtures below)

# 2. Run build and watch console output
npm run build 2>&1 | grep -i "location\|coordinate\|invalid"

# 3. Verify warnings appear for invalid coordinates (TRANS-006, TRANS-007, TRANS-008)
# Verify no warnings for valid data (TRANS-001 through TRANS-005)

# 4. Inspect build output JSON
# Check: .next/server/app/(site)/vendors/[slug]/page.js
# Verify vendor location data transformed correctly
```

### 2.2 Type Guard Validation Tests

**Test Location**: Build-time type checking

**Test Cases**:

| Test ID | Description | Input Type | isVendorLocationObject() Result | areValidCoordinates() Result |
|---------|-------------|------------|--------------------------------|------------------------------|
| GUARD-001 | Valid location object | `{ latitude: 26, longitude: -80 }` | `true` | `true` |
| GUARD-002 | Legacy string location | `"Monaco"` | `false` | N/A (not called) |
| GUARD-003 | Undefined location | `undefined` | `false` | N/A |
| GUARD-004 | Null location | `null` | `false` | N/A |
| GUARD-005 | Object without coordinates | `{ address: "..." }` | `false` (missing lat/lng) | N/A |
| GUARD-006 | Object with partial coordinates | `{ latitude: 26 }` | `false` (missing longitude) | N/A |
| GUARD-007 | Invalid coordinates (bounds) | `{ latitude: 100, longitude: -80 }` | `true` (object structure) | `false` (out of bounds) |

**Validation Method**: TypeScript compilation succeeds without type errors

---

## Test Category 3: Backward Compatibility Tests

### 3.1 Existing Vendor Data Compatibility

**Test Scenario**: Verify existing vendors (created before location feature) still work

**Test Cases**:

| Test ID | Description | Vendor State | Expected Behavior | Validation Method |
|---------|-------------|--------------|-------------------|-------------------|
| COMPAT-001 | Vendor with no location field | `location: undefined` in database | Vendor page loads, no location section displayed | Browser: visit `/vendors/vendor-slug` |
| COMPAT-002 | Vendor with legacy string location | `location: "Miami, FL"` in database | Vendor page loads, text location displayed with MapPin icon | Browser: inspect location section |
| COMPAT-003 | Vendor list page with mixed data | Mix of: location objects, strings, undefined | All vendors render, no errors | Browser: `/vendors` page loads |
| COMPAT-004 | Build succeeds with legacy data | Database has vendors with old schema | `npm run build` completes without errors | Terminal: build success |
| COMPAT-005 | Type checking passes | Mixed location types in codebase | `npm run type-check` passes | Terminal: no type errors |

**Manual Test Steps**:
```bash
# 1. Identify existing vendors (created before location feature deployment)
# Query database or check Payload admin for vendors without location group data

# 2. Visit vendor pages in browser
npm run dev
# Navigate to: http://localhost:3000/vendors/existing-vendor-slug

# 3. Verify no errors in browser console
# Verify vendor page renders (location section may be hidden)

# 4. Run build with existing data
npm run build
# Expected: Build succeeds, no transformation errors

# 5. Verify vendor list page handles mixed data
# Navigate to: http://localhost:3000/vendors
# Expected: All vendors display (with and without location data)
```

### 3.2 Migration Path Validation

**Test Scenario**: Verify vendors can be upgraded from string location to structured location

**Test Cases**:

| Test ID | Description | Before | After | Expected Behavior |
|---------|-------------|--------|-------|-------------------|
| MIGRATE-001 | Add coordinates to existing vendor | `location: "Monaco"` | `location: { address: "Monaco", latitude: 43.7384, longitude: 7.4246 }` | Both string and object coexist (union type) |
| MIGRATE-002 | Vendor page displays map after migration | No map (string only) | Map displays with pin | Browser: map renders on vendor page |
| MIGRATE-003 | Build succeeds after partial migration | 5 vendors with strings, 3 with objects | All vendors render correctly | Build passes, pages render |

---

## Test Category 4: Integration Tests

### 4.1 End-to-End Data Flow Tests

**Test Scenario**: Validate data flows correctly from Payload CMS → Data Service → Static Pages

**Test Cases**:

| Test ID | Description | Test Steps | Expected Outcome | Validation Method |
|---------|-------------|------------|------------------|-------------------|
| INTEG-001 | Vendor with coordinates builds successfully | 1. Create vendor in Payload admin<br>2. Add location with coordinates<br>3. Run `npm run build` | Build succeeds, static page generated | Terminal: build success |
| INTEG-002 | getVendors() returns coordinate data | 1. Fetch vendors via data service<br>2. Inspect returned data | Vendor objects include location with lat/lng | Code inspection in page component |
| INTEG-003 | getVendorBySlug() includes coordinates | 1. Fetch single vendor by slug<br>2. Inspect location field | Location object with coordinates present | Code inspection |
| INTEG-004 | Static page props include location | 1. Build site<br>2. Inspect generated HTML | Vendor location data embedded in page props | View page source: search for "latitude" |
| INTEG-005 | Multiple vendors with locations | 1. Create 5 vendors with different locations<br>2. Build site | All vendor pages generate, all display correctly | Browser: visit all 5 vendor pages |

**Manual Test Steps**:
```bash
# INTEG-001: Build test
npm run dev
# Create vendor: "Test Vendor - Integration" with location (26.122439, -80.137314)
npm run build
# Expected: ✓ Generating static pages (XX/XX) - no errors

# INTEG-004: Static props test
npm run build
# Inspect: .next/server/app/(site)/vendors/test-vendor-integration.html
# Search for: "latitude" in file
# Expected: Find coordinate data in serialized props

# INTEG-005: Multiple vendors test
# Create 5 test vendors with different locations:
# - Monaco (43.7384, 7.4246)
# - Fort Lauderdale (26.1224, -80.1373)
# - Singapore (1.3521, 103.8198)
# - Sydney (-33.8651, 151.2099)
# - London (51.5074, -0.1278)
npm run dev
# Visit each vendor page, verify map displays at correct location
```

### 4.2 Payload Admin UI Integration Tests

**Test Scenario**: Verify location fields work correctly in Payload admin interface

**Test Cases**:

| Test ID | Description | Test Action | Expected Outcome |
|---------|-------------|-------------|------------------|
| ADMIN-001 | Location group appears in vendor form | Open vendor create/edit page | "Location Information" section visible |
| ADMIN-002 | Save vendor with location data | Fill location fields, click Save | Vendor saves successfully |
| ADMIN-003 | Edit existing vendor location | Update coordinates, save | Changes persist in database |
| ADMIN-004 | Validation errors display | Enter invalid latitude (100), save | Error message appears, save blocked |
| ADMIN-005 | Location data persists after save | Save vendor, close, reopen | Location fields populated with saved data |

---

## Test Data Fixtures

### Fixture 1: Complete Location Data (Monaco Superyacht Facility)

```json
{
  "name": "Test Vendor - Full Location",
  "slug": "test-vendor-full-location",
  "tier": 2,
  "partner": false,
  "location": {
    "address": "10 Port de Fontvieille, Monaco",
    "latitude": 43.7384,
    "longitude": 7.4246,
    "city": "Monaco",
    "country": "Monaco"
  }
}
```

**Usage**: Test complete location object transformation and map display

**Expected**:
- ✅ Payload admin accepts all fields
- ✅ Build succeeds
- ✅ Vendor page displays map with pin at Monaco
- ✅ Console: no warnings

---

### Fixture 2: Coordinates Only (Fort Lauderdale)

```json
{
  "name": "Test Vendor - Coordinates Only",
  "slug": "test-vendor-coords-only",
  "tier": 2,
  "partner": false,
  "location": {
    "latitude": 26.122439,
    "longitude": -80.137314
  }
}
```

**Usage**: Test minimal valid location (map can display without address)

**Expected**:
- ✅ Payload admin accepts coordinates
- ✅ Build succeeds
- ✅ Map displays at Fort Lauderdale
- ✅ Address section hidden (no address data)

---

### Fixture 3: Address Only (No Coordinates)

```json
{
  "name": "Test Vendor - Address Only",
  "slug": "test-vendor-address-only",
  "tier": 2,
  "partner": false,
  "location": {
    "address": "123 Marina Drive, Miami, FL 33131",
    "city": "Miami",
    "country": "United States"
  }
}
```

**Usage**: Test graceful degradation when coordinates missing

**Expected**:
- ✅ Payload admin accepts address fields
- ✅ Build succeeds
- ✅ Map does NOT display (no coordinates)
- ✅ Text address displays with MapPin icon

---

### Fixture 4: Legacy Vendor (String Location)

```json
{
  "name": "Legacy Vendor - String Location",
  "slug": "legacy-vendor-string",
  "tier": 2,
  "partner": false,
  "location": "Fort Lauderdale, Florida"
}
```

**Usage**: Test backward compatibility with old string-based location

**Expected**:
- ✅ Database preserves string value (if migration not run)
- ✅ Build succeeds
- ✅ transformVendorLocation() returns string (passthrough)
- ✅ Text location displays (no map)
- ✅ Console: no errors or warnings

---

### Fixture 5: No Location Data

```json
{
  "name": "Test Vendor - No Location",
  "slug": "test-vendor-no-location",
  "tier": 2,
  "partner": false
  // location field not set (undefined)
}
```

**Usage**: Test vendors without any location data (common scenario)

**Expected**:
- ✅ Payload admin allows saving without location
- ✅ Build succeeds
- ✅ transformVendorLocation() returns undefined
- ✅ Vendor page renders (location section hidden)
- ✅ Console: no errors

---

### Fixture 6: Invalid Coordinates (Boundary Test)

```json
{
  "name": "Test Vendor - Invalid Coordinates",
  "slug": "test-vendor-invalid",
  "tier": 2,
  "partner": false,
  "location": {
    "address": "Invalid Location",
    "latitude": 100,      // INVALID: > 90
    "longitude": -200     // INVALID: < -180
  }
}
```

**Usage**: Test validation catches out-of-bounds coordinates

**Expected**:
- ❌ Payload admin **rejects** save (validation error)
- OR (if validation bypassed):
  - ✅ Build succeeds (graceful error handling)
  - ⚠️ Console warning: "Invalid coordinates for vendor location: lat=100, lng=-200"
  - ✅ transformVendorLocation() strips coordinates, preserves address
  - ✅ Vendor page renders with address only (no map)

---

### Fixture 7: Mixed Data (Listing Page Test)

**Create 5 vendors with different location states**:

1. **Full location** (Monaco - coordinates + address)
2. **Coordinates only** (Fort Lauderdale)
3. **Address only** (Miami - no coordinates)
4. **Legacy string** ("Singapore")
5. **No location** (undefined)

**Usage**: Test vendor listing page handles heterogeneous location data

**Expected**:
- ✅ All 5 vendors display on `/vendors` page
- ✅ No errors in browser console
- ✅ Build succeeds with mixed data
- ✅ Future location search filter excludes vendors 3, 4, 5 (no coordinates)

---

## Testing Checklist

### Pre-Implementation Testing

- [ ] Review Payload CMS Vendors.ts schema (existing patterns)
- [ ] Review lib/tinacms-data-service.ts transformTinaVendor() method
- [ ] Confirm integration-strategy.md alignment with tests
- [ ] Prepare test fixtures data (copy JSON above)

### Schema Implementation Testing

- [ ] Run `npm run type-check` after schema changes
- [ ] Test Payload admin UI displays location fields
- [ ] Test field validation (latitude/longitude bounds)
- [ ] Test optional field behavior (allow empty values)
- [ ] Verify schema documentation (placeholders, descriptions)

### Data Service Testing

- [ ] Run `npm run build` after transformVendorLocation() implementation
- [ ] Create test vendors (fixtures 1-7)
- [ ] Verify console output (check for warnings)
- [ ] Inspect build output JSON (vendor location data)
- [ ] Test type guards with various input scenarios

### Backward Compatibility Testing

- [ ] Identify 2-3 existing vendors in database
- [ ] Visit existing vendor pages (verify no errors)
- [ ] Run build with existing data (verify success)
- [ ] Test vendor list page with mixed data
- [ ] Migrate 1 existing vendor (string → object) and verify

### Integration Testing

- [ ] Create complete location vendor (fixture 1)
- [ ] Create coordinates-only vendor (fixture 2)
- [ ] Create address-only vendor (fixture 3)
- [ ] Build site and verify all pages generate
- [ ] Inspect static page props (verify location data embedded)
- [ ] Visit all test vendor pages in browser

### Final Validation

- [ ] All test cases executed (documented results)
- [ ] No TypeScript errors (`npm run type-check` passes)
- [ ] Build succeeds (`npm run build` passes)
- [ ] No console errors (only expected warnings for invalid coords)
- [ ] Backward compatibility verified (existing vendors work)
- [ ] Test fixtures documented and saved

---

## Expected Test Outcomes

### Success Criteria

**TypeScript Compilation**:
```bash
npm run type-check
# Expected output:
# ✓ No type errors found
```

**Build Validation**:
```bash
npm run build
# Expected output:
# ✓ Compiled successfully
# ✓ Generating static pages (XX/XX)
# ⚠️ Warning: Invalid coordinates for vendor location: lat=100, lng=-200
#   (Only for test-vendor-invalid fixture - expected warning)
```

**Payload Admin UI**:
- Location Information section visible in vendor form
- Latitude validation error appears for values outside -90 to 90
- Longitude validation error appears for values outside -180 to 180
- Save succeeds for valid coordinate values
- Save succeeds when location fields left empty (optional)

**Browser Testing**:
- Vendor pages with coordinates: Load without errors
- Vendor pages without coordinates: Load without errors (location section hidden)
- Vendor listing page: Loads with mixed location data, no errors
- Browser console: No React errors, no transformation errors

---

## Test Execution Timeline

**Phase 1: Schema Testing** (30 minutes)
- Create Payload schema changes
- Test Payload admin UI
- Validate field constraints
- Document schema test results

**Phase 2: Type & Transformation Testing** (45 minutes)
- Implement TypeScript types
- Implement transformVendorLocation() method
- Run `npm run type-check`
- Create test fixtures
- Run `npm run build`, verify console output

**Phase 3: Integration Testing** (30 minutes)
- Create 5 test vendors in Payload admin
- Build site, verify static page generation
- Visit all test vendor pages in browser
- Inspect page source for location data
- Document integration test results

**Phase 4: Backward Compatibility** (15 minutes)
- Identify existing vendors
- Verify existing vendor pages load
- Test vendor list page
- Migrate 1 vendor (optional)

**Total Estimated Time**: 2 hours

---

## Test Result Documentation Template

After executing tests, document results in this format:

```markdown
## Backend Test Results - [DATE]

### Schema Validation Tests
- SCHEMA-001 to SCHEMA-014: [PASS/FAIL] - Notes: [...]
- SCHEMA-015 to SCHEMA-020: [PASS/FAIL] - Notes: [...]
- SCHEMA-021 to SCHEMA-025: [PASS/FAIL] - Notes: [...]

### Data Transformation Tests
- TRANS-001 to TRANS-010: [PASS/FAIL] - Notes: [...]
- GUARD-001 to GUARD-007: [PASS/FAIL] - Notes: [...]

### Backward Compatibility Tests
- COMPAT-001 to COMPAT-005: [PASS/FAIL] - Notes: [...]
- MIGRATE-001 to MIGRATE-003: [PASS/FAIL] - Notes: [...]

### Integration Tests
- INTEG-001 to INTEG-005: [PASS/FAIL] - Notes: [...]
- ADMIN-001 to ADMIN-005: [PASS/FAIL] - Notes: [...]

### Test Fixtures Results
- Fixture 1 (Full Location): [PASS/FAIL] - Map displays: [YES/NO]
- Fixture 2 (Coords Only): [PASS/FAIL] - Map displays: [YES/NO]
- Fixture 3 (Address Only): [PASS/FAIL] - No map, text shows: [YES/NO]
- Fixture 4 (Legacy String): [PASS/FAIL] - String displays: [YES/NO]
- Fixture 5 (No Location): [PASS/FAIL] - Section hidden: [YES/NO]
- Fixture 6 (Invalid): [PASS/FAIL] - Validation caught: [YES/NO]
- Fixture 7 (Mixed Data): [PASS/FAIL] - All render: [YES/NO]

### Build & Type Check Results
```bash
npm run type-check
# Output: [paste output]

npm run build
# Output: [paste relevant output]
```

### Issues Found
1. [Issue description] - Severity: [HIGH/MEDIUM/LOW] - Status: [OPEN/RESOLVED]
2. [...]

### Overall Test Status
- Total Tests: [XX]
- Passed: [XX]
- Failed: [XX]
- Skipped: [XX]
- **Status**: [READY FOR NEXT PHASE / ISSUES TO RESOLVE]
```

---

## Notes & Reminders

**Technology Stack**:
- ✅ Payload CMS (NOT TinaCMS - despite file naming)
- ✅ SQLite database (not markdown files)
- ✅ File: `payload/collections/Vendors.ts` (NOT `tina/config.ts`)
- ✅ Data service: `lib/tinacms-data-service.ts` (legacy name, Payload implementation)

**Key Testing Constraints**:
- No unit test framework configured (use manual testing + build validation)
- Static site generation (test at build time, not runtime)
- Backward compatibility critical (existing vendors must work)
- Console validation important (dev mode warnings acceptable)

**Manual Testing Priority**:
- Payload admin UI validation (highest priority - user-facing)
- Build success (critical path - blocks deployment)
- Browser verification (user experience validation)
- Type checking (catches integration issues early)

---

**END OF BACKEND TEST SUITE DOCUMENT**
