# Task: Update TypeScript Interfaces for Location Data

**Task ID**: impl-backend-types
**Phase**: Phase 2 - Backend Implementation (TinaCMS Schema)
**Agent**: backend-nodejs-specialist
**Estimated Time**: 1 hour
**Dependencies**: impl-backend-schema

## Objective

Update TypeScript type definitions in `lib/types.ts` to include coordinate and address data structures for the Vendor interface.

## Context Requirements

**Files to Review**:
- `/home/edwin/development/ptnextjs/lib/types.ts` (lines 179-222: current Vendor interface)
- `/home/edwin/development/ptnextjs/tina/__generated__/types.ts` (TinaCMS generated types)
- `/home/edwin/development/ptnextjs/.agent-os/specs/2025-10-19-vendor-location-mapping/integration-strategy.md`

**Current Vendor Interface Location**:
- File: `/home/edwin/development/ptnextjs/lib/types.ts`
- Interface: `Vendor` (lines 179-222)
- Current location field: `location?: string` (line 188)

## Implementation Specifics

### 1. Add VendorCoordinates Interface

Insert BEFORE the `Vendor` interface (around line 178):

```typescript
/**
 * Geographic coordinates for vendor location mapping
 */
export interface VendorCoordinates {
  latitude: number;
  longitude: number;
}
```

### 2. Add VendorAddress Interface

Insert AFTER `VendorCoordinates`:

```typescript
/**
 * Structured address data for vendor location
 */
export interface VendorAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string; // ISO 3166-1 alpha-2 code (e.g., "US", "MC")
}
```

### 3. Update Vendor Interface

Modify the `Vendor` interface (currently lines 179-222) to include new fields:

Find the `location?: string` field (line 188) and add AFTER it:

```typescript
export interface Vendor {
  // ... existing fields above location ...

  location?: string;
  coordinates?: VendorCoordinates;
  address?: VendorAddress;

  // ... existing fields below location ...
}
```

### 4. Verify Partner Interface Compatibility

The `Partner` interface (line 224+) extends from base Vendor data. Verify it inherits coordinate/address fields correctly:

```typescript
// No changes needed - Partner uses Vendor fields
export type Partner = Vendor; // or similar inheritance pattern
```

## File Modifications

**File**: `/home/edwin/development/ptnextjs/lib/types.ts`

**Actions**:
1. Add `VendorCoordinates` interface (before Vendor)
2. Add `VendorAddress` interface (before Vendor)
3. Update `Vendor` interface to include optional coordinates and address fields

**Exact Line Locations**:
- Insert `VendorCoordinates` at ~line 178 (before current Vendor interface)
- Insert `VendorAddress` at ~line 185 (after VendorCoordinates)
- Update `Vendor` interface location field area (~line 188 in current file)

## Type Safety Considerations

### Optional vs Required

All new fields are **optional** (`?:`) to maintain backward compatibility:
- `coordinates?: VendorCoordinates` (not required)
- `address?: VendorAddress` (not required)
- All address subfields are optional

### Coordinate Validation

While TypeScript enforces `number` type, add JSDoc comments for runtime validation:

```typescript
/**
 * Geographic coordinates for vendor location mapping
 *
 * @property latitude - Must be between -90 and 90
 * @property longitude - Must be between -180 and 180
 */
export interface VendorCoordinates {
  latitude: number;
  longitude: number;
}
```

## Testing Steps

### 1. Type Check
```bash
cd /home/edwin/development/ptnextjs
npm run type-check
```

Expected: No TypeScript errors

### 2. Verify Import Compatibility

Check that components using `Vendor` type still compile:
```bash
# These files import Vendor type
grep -r "import.*Vendor.*from.*types" app/
```

### 3. Test Type Inference

Create a test file to verify type definitions:

```typescript
// Test file (temporary)
import { Vendor, VendorCoordinates, VendorAddress } from './lib/types';

const testVendor: Vendor = {
  id: 'test',
  name: 'Test Vendor',
  slug: 'test-vendor',
  location: 'Monaco',
  coordinates: {
    latitude: 43.7384,
    longitude: 7.4246
  },
  address: {
    city: 'Monaco',
    country: 'MC'
  }
};

// TypeScript should not error
const coords: VendorCoordinates | undefined = testVendor.coordinates;
const addr: VendorAddress | undefined = testVendor.address;
```

## Acceptance Criteria

- [ ] `VendorCoordinates` interface created with latitude/longitude fields
- [ ] `VendorAddress` interface created with all address subfields
- [ ] `Vendor` interface updated to include optional coordinates and address
- [ ] All new fields marked as optional (`?:`)
- [ ] JSDoc comments added for clarity
- [ ] `npm run type-check` passes without errors
- [ ] No breaking changes to existing code
- [ ] Partner interface inherits new fields correctly

## Integration Points

### Files That Import Vendor Type

These files will automatically get updated type definitions:
- `/home/edwin/development/ptnextjs/lib/tinacms-data-service.ts`
- `/home/edwin/development/ptnextjs/app/(site)/vendors/[slug]/page.tsx`
- `/home/edwin/development/ptnextjs/app/(site)/partners/[slug]/page.tsx`
- Component files that use vendor data

### Next Steps

After this task, `impl-backend-service` will use these new types in the data transformation logic.

## Example Usage

```typescript
// Component example
function VendorMap({ vendor }: { vendor: Vendor }) {
  if (!vendor.coordinates) {
    return <p>Location: {vendor.location}</p>;
  }

  return (
    <Map
      latitude={vendor.coordinates.latitude}
      longitude={vendor.coordinates.longitude}
    />
  );
}
```

## Notes

- Keep interfaces simple and focused
- Use optional fields for backward compatibility
- Add JSDoc comments for complex types
- Follow existing naming conventions in types.ts
- Maintain alphabetical ordering of interfaces where appropriate
