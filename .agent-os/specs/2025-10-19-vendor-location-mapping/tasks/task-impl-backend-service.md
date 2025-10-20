# Task: Update TinaCMSDataService Transformation Logic

**Task ID**: impl-backend-service
**Phase**: Phase 2 - Backend Implementation (TinaCMS Schema)
**Agent**: backend-nodejs-specialist
**Estimated Time**: 2 hours
**Dependencies**: impl-backend-types

## Objective

Extend the `transformTinaVendor()` method in TinaCMSDataService to handle coordinate and address data transformation from TinaCMS to application format.

## Context Requirements

**Files to Review**:
- `/home/edwin/development/ptnextjs/lib/tinacms-data-service.ts` (lines 267-363: transformTinaVendor method)
- `/home/edwin/development/ptnextjs/lib/types.ts` (updated Vendor interface)
- `/home/edwin/development/ptnextjs/tina/__generated__/types.ts` (TinaCMS generated types)

**Current Method Location**:
- File: `/home/edwin/development/ptnextjs/lib/tinacms-data-service.ts`
- Method: `transformTinaVendor()` (lines 267-363)
- Returns: `Vendor` type

## Implementation Specifics

### 1. Update transformTinaVendor Method

Locate the `transformTinaVendor()` method (line 267) and add coordinate/address transformation logic.

**Current Pattern** (example from existing code):
```typescript
private transformTinaVendor(tinaVendor: any): Vendor {
  return {
    id: tinaVendor._sys.filename,
    name: tinaVendor.name || '',
    slug: tinaVendor._sys.filename,
    // ... other fields ...
    location: tinaVendor.location,
    // ... rest of fields ...
  };
}
```

**Add After `location` Field**:

```typescript
private transformTinaVendor(tinaVendor: any): Vendor {
  return {
    // ... existing fields above location ...

    location: tinaVendor.location,

    // NEW: Transform coordinates
    coordinates: tinaVendor.coordinates?.latitude && tinaVendor.coordinates?.longitude
      ? {
          latitude: tinaVendor.coordinates.latitude,
          longitude: tinaVendor.coordinates.longitude,
        }
      : undefined,

    // NEW: Transform address
    address: tinaVendor.address
      ? {
          street: tinaVendor.address.street,
          city: tinaVendor.address.city,
          state: tinaVendor.address.state,
          postalCode: tinaVendor.address.postalCode,
          country: tinaVendor.address.country,
        }
      : undefined,

    // ... existing fields below ...
  };
}
```

### 2. Add Coordinate Validation Helper

Add a private validation method BEFORE `transformTinaVendor()`:

```typescript
/**
 * Validates geographic coordinates
 * @param latitude - Latitude value to validate
 * @param longitude - Longitude value to validate
 * @returns true if coordinates are valid, false otherwise
 */
private isValidCoordinates(latitude?: number, longitude?: number): boolean {
  if (latitude === undefined || longitude === undefined) {
    return false;
  }

  if (latitude < -90 || latitude > 90) {
    console.warn(`Invalid latitude: ${latitude}. Must be between -90 and 90.`);
    return false;
  }

  if (longitude < -180 || longitude > 180) {
    console.warn(`Invalid longitude: ${longitude}. Must be between -180 and 180.`);
    return false;
  }

  return true;
}
```

### 3. Use Validation in Transform Method

Update the coordinates transformation to use validation:

```typescript
// Transform coordinates with validation
coordinates: this.isValidCoordinates(
  tinaVendor.coordinates?.latitude,
  tinaVendor.coordinates?.longitude
)
  ? {
      latitude: tinaVendor.coordinates.latitude,
      longitude: tinaVendor.coordinates.longitude,
    }
  : undefined,
```

### 4. Add Content Validation Enhancement

Locate the `validateCMSContent()` method (if it exists) or add validation logic to log warnings for vendors with incomplete location data:

```typescript
// Add to existing validation method or create new helper
private validateVendorLocation(vendor: Vendor): void {
  // Warn if location string exists but no coordinates
  if (vendor.location && !vendor.coordinates) {
    console.info(
      `Vendor "${vendor.name}" (${vendor.slug}) has location "${vendor.location}" but no coordinates. Map display will be unavailable.`
    );
  }

  // Warn if coordinates exist but no location string
  if (vendor.coordinates && !vendor.location) {
    console.warn(
      `Vendor "${vendor.name}" (${vendor.slug}) has coordinates but no location string. Consider adding a display location.`
    );
  }
}
```

## File Modifications

**File**: `/home/edwin/development/ptnextjs/lib/tinacms-data-service.ts`

**Actions**:
1. Add `isValidCoordinates()` private method
2. Update `transformTinaVendor()` to include coordinates and address
3. Add validation logging for location data completeness

**Exact Locations**:
- Insert `isValidCoordinates()` before `transformTinaVendor()` (~line 266)
- Modify `transformTinaVendor()` coordinate/address fields (~line 300-310 area)
- Add validation calls in appropriate methods

## Testing Steps

### 1. Create Test Vendor Content

Create test vendor markdown file:

```bash
# Create test vendor with coordinates
cat > /home/edwin/development/ptnextjs/content/vendors/test-vendor-monaco.md << 'EOF'
---
name: Test Vendor Monaco
featured: false
partner: false
location: Monaco
coordinates:
  latitude: 43.7384
  longitude: 7.4246
address:
  city: Monaco
  country: MC
---

Test vendor for location mapping.
EOF
```

### 2. Test Data Service

```bash
cd /home/edwin/development/ptnextjs
npm run build
```

Expected:
- ✓ Build succeeds
- ✓ No validation errors
- ✓ Test vendor data transformed correctly

### 3. Verify Transform Output

Add temporary logging to verify:

```typescript
// Temporary debug logging
const vendor = this.transformTinaVendor(tinaVendor);
console.log('Transformed vendor coordinates:', vendor.coordinates);
console.log('Transformed vendor address:', vendor.address);
```

### 4. Test Edge Cases

Test vendors with:
- Valid coordinates
- Missing coordinates
- Invalid coordinates (should be filtered out)
- Partial address data
- No location data at all

## Acceptance Criteria

- [ ] `isValidCoordinates()` method added with proper validation
- [ ] `transformTinaVendor()` includes coordinates transformation
- [ ] `transformTinaVendor()` includes address transformation
- [ ] Coordinate validation prevents invalid data
- [ ] Undefined coordinates handled gracefully (returns undefined)
- [ ] Partial address data handled correctly
- [ ] Console warnings for invalid coordinates
- [ ] `npm run build` succeeds without errors
- [ ] Type checking passes (`npm run type-check`)
- [ ] Test vendor with coordinates transforms correctly

## Data Flow Verification

```
TinaCMS Markdown File
  ↓
TinaCMS Generated Types (tina/__generated__/types.ts)
  ↓
transformTinaVendor() method
  ↓
Vendor interface (lib/types.ts)
  ↓
React Components (pages/components)
```

## Example Transformed Output

Input (TinaCMS):
```typescript
{
  name: "Test Vendor",
  location: "Monaco",
  coordinates: {
    latitude: 43.7384,
    longitude: 7.4246
  },
  address: {
    city: "Monaco",
    country: "MC"
  }
}
```

Output (Vendor type):
```typescript
{
  id: "test-vendor",
  name: "Test Vendor",
  slug: "test-vendor",
  location: "Monaco",
  coordinates: {
    latitude: 43.7384,
    longitude: 7.4246
  },
  address: {
    street: undefined,
    city: "Monaco",
    state: undefined,
    postalCode: undefined,
    country: "MC"
  }
}
```

## Notes

- Follow existing transformation patterns in the file
- Maintain null safety (use optional chaining)
- Add helpful console warnings for validation issues
- Don't throw errors for missing optional data
- Consider performance (validation runs at build time)
- Keep transformation logic simple and readable

## Rollback Plan

If issues occur:
1. Remove coordinate/address transformation code
2. Revert to previous transformTinaVendor implementation
3. Run `npm run build` to verify rollback
4. Document issue for troubleshooting
