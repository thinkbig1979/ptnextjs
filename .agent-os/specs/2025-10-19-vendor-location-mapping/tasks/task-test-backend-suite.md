# Task: Design Backend Validation Test Suite

**Task ID**: test-backend
**Phase**: Phase 2 - Backend Implementation (TinaCMS Schema)
**Agent**: test-architect
**Estimated Time**: 2 hours
**Dependencies**: pre-2 (integration strategy)

## Objective

Design comprehensive test suite for TinaCMS schema extensions and data service modifications before implementation begins.

## Context Requirements

**Files to Review**:
- `/home/edwin/development/ptnextjs/tina/config.ts` (current schema patterns)
- `/home/edwin/development/ptnextjs/lib/tinacms-data-service.ts` (transformation methods)
- `/home/edwin/development/ptnextjs/.agent-os/specs/2025-10-19-vendor-location-mapping/sub-specs/technical-spec.md`
- `/home/edwin/development/ptnextjs/.agent-os/specs/2025-10-19-vendor-location-mapping/integration-strategy.md`

## Deliverables

Create test specification: `/home/edwin/development/ptnextjs/.agent-os/specs/2025-10-19-vendor-location-mapping/tasks/backend-test-suite.md`

### Test Categories

#### 1. TinaCMS Schema Validation Tests
```typescript
// Test: Coordinate field validation
describe('Vendor Schema - Coordinates', () => {
  test('accepts valid latitude (-90 to 90)')
  test('accepts valid longitude (-180 to 180)')
  test('rejects latitude > 90')
  test('rejects latitude < -90')
  test('rejects longitude > 180')
  test('rejects longitude < -180')
  test('allows null/undefined for optional coordinates')
})

// Test: Address field validation
describe('Vendor Schema - Address', () => {
  test('accepts valid structured address')
  test('validates country code format')
  test('validates postal code patterns')
  test('allows partial address data')
})
```

#### 2. Data Service Transformation Tests
```typescript
// Test: transformTinaVendor with coordinates
describe('TinaCMSDataService.transformTinaVendor', () => {
  test('transforms vendor with full coordinates')
  test('transforms vendor with missing coordinates')
  test('handles legacy location string only')
  test('merges address components correctly')
  test('validates coordinate ranges during transform')
  test('preserves backward compatibility')
})
```

#### 3. Backward Compatibility Tests
```typescript
// Test: Existing vendor data
describe('Backward Compatibility', () => {
  test('existing vendors without coordinates still work')
  test('location string preserved when coordinates added')
  test('vendor list pages handle mixed data')
  test('vendor detail pages degrade gracefully')
})
```

#### 4. Integration Tests
```typescript
// Test: End-to-end TinaCMS data flow
describe('TinaCMS Integration', () => {
  test('vendor with coordinates builds successfully')
  test('getVendors() returns coordinate data')
  test('getVendorBySlug() includes coordinates')
  test('static generation succeeds with new schema')
})
```

## Test Data Requirements

### Sample Vendor Fixtures

```typescript
// Fixture 1: Complete location data
const vendorWithFullLocation = {
  name: "Test Vendor 1",
  slug: "test-vendor-1",
  location: "Monaco",
  coordinates: {
    latitude: 43.7384,
    longitude: 7.4246
  },
  address: {
    street: "10 Port de Fontvieille",
    city: "Monaco",
    state: "Monaco",
    postalCode: "98000",
    country: "MC"
  }
}

// Fixture 2: Coordinates only (no structured address)
const vendorWithCoordinatesOnly = {
  name: "Test Vendor 2",
  slug: "test-vendor-2",
  location: "Fort Lauderdale, Florida",
  coordinates: {
    latitude: 26.1224,
    longitude: -80.1373
  }
}

// Fixture 3: Legacy vendor (no coordinates)
const legacyVendor = {
  name: "Legacy Vendor",
  slug: "legacy-vendor",
  location: "Miami, Florida"
  // No coordinates or address fields
}

// Fixture 4: Invalid coordinates (should fail validation)
const invalidVendor = {
  name: "Invalid Vendor",
  slug: "invalid-vendor",
  coordinates: {
    latitude: 100, // Invalid: > 90
    longitude: -200 // Invalid: < -180
  }
}
```

## Acceptance Criteria

- [ ] Test suite document created at specified path
- [ ] All 4 test categories defined with specific test cases
- [ ] Test fixtures created for various data scenarios
- [ ] TinaCMS-specific validation patterns included
- [ ] Backward compatibility tests specified
- [ ] Integration test scenarios documented
- [ ] Expected test outcomes defined
- [ ] Test implementation guidance provided

## Testing Tools

- **TypeScript**: Type checking and compilation tests
- **TinaCMS CLI**: Schema validation (`npm run tina:build`)
- **Manual Testing**: TinaCMS admin interface testing
- **Build Testing**: Static generation validation (`npm run build`)

## Key Validation Rules

1. **Latitude**: -90 to 90 (inclusive)
2. **Longitude**: -180 to 180 (inclusive)
3. **Coordinates**: Optional (allows null/undefined)
4. **Address**: Optional structured object
5. **Country Code**: ISO 3166-1 alpha-2 format (e.g., "US", "MC")
6. **Backward Compatibility**: Existing vendors with only `location` string must work

## Notes

- Focus on TinaCMS schema validation patterns
- Consider static generation constraints (build-time validation)
- Plan for manual testing of TinaCMS admin interface
- Design tests that can be run during development
