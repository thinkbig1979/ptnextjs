# Excel Import - Critical Fixes Required

## Quick Reference

**Total Issues Found**: 7
**Critical Issues**: 3
**Files to Fix**: 2
**Estimated Effort**: 4-6 hours

---

## Critical Issue #1: serviceAreas Array Transformation Missing

### Problem
Excel column accepts "Mediterranean, Caribbean, Pacific" but the parser doesn't convert it to an array, causing validation failures.

### Fix Location
**File**: `/home/edwin/development/ptnextjs/lib/config/excel-field-mappings.ts`
**Line**: 386

### Current Code
```typescript
{
  fieldName: 'serviceAreas',
  excelColumn: 'Service Areas',
  accessLevel: FieldAccessLevel.TIER1,
  dataType: FieldDataType.ARRAY_STRING,
  required: false,
  exportable: true,
  importable: true,
  description: 'Comma-separated list of service areas/regions',
  example: 'Mediterranean, Caribbean, Pacific Northwest'
},
```

### Fix Code
```typescript
{
  fieldName: 'serviceAreas',
  excelColumn: 'Service Areas',
  accessLevel: FieldAccessLevel.TIER1,
  dataType: FieldDataType.ARRAY_STRING,
  required: false,
  exportable: true,
  importable: true,
  // ADD THIS:
  importTransform: (value: string) =>
    value.split(',').map(s => s.trim()).filter(s => s.length > 0),
  description: 'Comma-separated list of service areas/regions',
  example: 'Mediterranean, Caribbean, Pacific Northwest'
},
```

---

## Critical Issue #2: companyValues Field Missing Entirely

### Problem
The field exists in Payload schema and vendor-update-schema, but has NO field mapping definition. Vendors cannot import company values.

### Fix Location
**File**: `/home/edwin/development/ptnextjs/lib/config/excel-field-mappings.ts`
**Line**: After line 395 (after serviceAreas definition)

### Fix Code
```typescript
// Add this new field mapping after serviceAreas:
{
  fieldName: 'companyValues',
  excelColumn: 'Company Values',
  accessLevel: FieldAccessLevel.TIER1,
  dataType: FieldDataType.ARRAY_STRING,
  required: false,
  exportable: true,
  importable: true,
  importTransform: (value: string) =>
    value.split(',').map(s => s.trim()).filter(s => s.length > 0),
  description: 'Comma-separated list of company values and principles',
  example: 'Quality, Innovation, Customer Service, Sustainability'
},
```

---

## Critical Issue #3: HQ Locations Missing Geocoding

### Problem
HQ location fields are imported but without latitude/longitude, so locations don't appear on maps.

### Fix Location
**File**: `/home/edwin/development/ptnextjs/lib/services/ImportExecutionService.ts`
**Line**: 336 (buildHQLocationChange method)

### Current Code
```typescript
private static buildHQLocationChange(
  currentVendor: Partial<Vendor>,
  hqFields: { address?: string; city?: string; country?: string },
  overwrite: boolean
): FieldChange | null {
  // ... existing code ...

  const hqLocation = {
    address: hqFields.address,
    city: hqFields.city,
    country: hqFields.country,
    isHQ: true
    // Missing: latitude, longitude, type, locationName
  };
```

### Fix Code
```typescript
private static async buildHQLocationChange(  // Make async
  currentVendor: Partial<Vendor>,
  hqFields: { address?: string; city?: string; country?: string },
  overwrite: boolean
): Promise<FieldChange | null> {  // Return Promise
  // ... existing code ...

  // Geocode the address
  let latitude = null;
  let longitude = null;

  if (hqFields.address && hqFields.city && hqFields.country) {
    const fullAddress = `${hqFields.address}, ${hqFields.city}, ${hqFields.country}`;
    try {
      const geocodeResponse = await fetch(
        `/api/geocode?address=${encodeURIComponent(fullAddress)}`
      );
      if (geocodeResponse.ok) {
        const geocodeData = await geocodeResponse.json();
        latitude = geocodeData.latitude || null;
        longitude = geocodeData.longitude || null;
      }
    } catch (error) {
      console.error('Geocoding failed during import:', error);
      // Continue without coordinates
    }
  }

  const hqLocation = {
    locationName: 'Headquarters',  // Auto-name
    address: hqFields.address,
    city: hqFields.city,
    country: hqFields.country,
    latitude,
    longitude,
    isHQ: true,
    type: 'headquarters' as const
  };

  // ... rest of function
}
```

**Note**: Also need to update all callers to await this method:
```typescript
// Line ~270
const locationChange = await this.buildHQLocationChange(  // Add await
  currentVendor,
  hqFields,
  overwrite
);
```

---

## Medium Priority Fixes

### Issue #4: Add More HQ Location Fields

Add these optional field mappings for more complete HQ data:

```typescript
// Add after hqCountry (line 306):

{
  fieldName: 'hqState',
  excelColumn: 'HQ State/Province',
  accessLevel: FieldAccessLevel.TIER1,
  dataType: FieldDataType.STRING,
  required: false,
  maxLength: 255,
  exportable: true,
  importable: true,
  description: 'Headquarters state or province',
  example: 'Florida'
},
{
  fieldName: 'hqPostalCode',
  excelColumn: 'HQ Postal Code',
  accessLevel: FieldAccessLevel.TIER1,
  dataType: FieldDataType.STRING,
  required: false,
  maxLength: 50,
  exportable: true,
  importable: true,
  description: 'Headquarters postal/zip code',
  example: '33316'
},
{
  fieldName: 'hqLocationName',
  excelColumn: 'HQ Location Name',
  accessLevel: FieldAccessLevel.TIER1,
  dataType: FieldDataType.STRING,
  required: false,
  maxLength: 255,
  exportable: true,
  importable: true,
  description: 'Name/label for headquarters location',
  example: 'Corporate Headquarters'
},
```

Then update ImportExecutionService.extractHQFields to include these:

```typescript
private static extractHQFields(newData: Record<string, unknown>) {
  const hqAddress = newData['hqAddress'];
  const hqCity = newData['hqCity'];
  const hqState = newData['hqState'];
  const hqCountry = newData['hqCountry'];
  const hqPostalCode = newData['hqPostalCode'];
  const hqLocationName = newData['hqLocationName'];

  if (!hqAddress && !hqCity && !hqCountry) {
    return null;
  }

  return {
    locationName: (hqLocationName as string | undefined) || 'Headquarters',
    address: (hqAddress as string | undefined) || undefined,
    city: (hqCity as string | undefined) || undefined,
    state: (hqState as string | undefined) || undefined,
    country: (hqCountry as string | undefined) || undefined,
    postalCode: (hqPostalCode as string | undefined) || undefined,
  };
}
```

---

### Issue #5: Add Missing Simple Fields

Add these field mappings for fields that exist in schema but are unmapped:

```typescript
// Add after videoDescription (line 383):

{
  fieldName: 'certifications',
  excelColumn: 'Certifications',
  accessLevel: FieldAccessLevel.TIER1,
  dataType: FieldDataType.STRING,
  required: false,
  maxLength: 1000,
  exportable: true,
  importable: true,
  description: 'Certifications and accreditations (comma-separated or free text)',
  example: 'ISO 9001, ABYC Certified, NMEA Certified'
},
{
  fieldName: 'awards',
  excelColumn: 'Awards',
  accessLevel: FieldAccessLevel.TIER1,
  dataType: FieldDataType.STRING,
  required: false,
  maxLength: 1000,
  exportable: true,
  importable: true,
  description: 'Awards and recognition (comma-separated or free text)',
  example: 'Best Vendor 2023, Innovation Award 2022'
},
{
  fieldName: 'videoDuration',
  excelColumn: 'Video Duration',
  accessLevel: FieldAccessLevel.TIER1,
  dataType: FieldDataType.STRING,
  required: false,
  maxLength: 10,
  exportable: true,
  importable: true,
  description: 'Duration of introduction video',
  example: '2:30'
},
```

---

## Low Priority Fix

### Issue #6: Fix ImportOptions Type Consistency

**File**: `/home/edwin/development/ptnextjs/lib/services/ImportExecutionService.ts`
**Line**: 27

```typescript
// Change from:
export interface ImportOptions {
  vendorId: string;
  userId: string;
  overwriteExisting: boolean;
  dryRun?: boolean;
  filename?: string;
}

// To:
export interface ImportOptions {
  vendorId: number;  // Match Payload relationship type
  userId: number;    // Match Payload relationship type
  overwriteExisting: boolean;
  dryRun?: boolean;
  filename?: string;
}
```

Then update all callers in excel-import/route.ts:

```typescript
// Line 227
const executionResult = await ImportExecutionService.execute(
  validationResult.rows,
  {
    vendorId: Number(vendor.id),  // Convert to number
    userId: Number(user.id),      // Convert to number
    overwriteExisting: true,
    filename: file.name
  }
);
```

---

## Testing Plan

### 1. Run Unit Tests
```bash
npm test -- __tests__/integration/api-contract/import-api-contract.test.ts
```

### 2. Manual Test Scenarios

**Test 1: serviceAreas Import**
- Create Excel with: `Service Areas: "Mediterranean, Caribbean, Pacific"`
- Import via dashboard
- Verify: serviceAreas in DB is `["Mediterranean", "Caribbean", "Pacific"]`
- Verify: Profile displays all three areas

**Test 2: companyValues Import**
- Create Excel with: `Company Values: "Quality, Innovation, Service"`
- Import via dashboard
- Verify: companyValues in DB is `["Quality", "Innovation", "Service"]`
- Verify: Profile displays all three values

**Test 3: HQ Location with Geocoding**
- Create Excel with:
  - `HQ Address: "123 Harbor View Drive"`
  - `HQ City: "Fort Lauderdale"`
  - `HQ Country: "United States"`
- Import via dashboard
- Verify: locations array has one entry with `isHQ: true`
- Verify: Entry has latitude/longitude populated
- Verify: Vendor profile map shows HQ pin

**Test 4: Complete Import**
- Use template with all fields
- Import vendor data
- Verify: No validation errors
- Verify: All imported fields appear in vendor profile
- Verify: Import history record created correctly

---

## Deployment Checklist

- [ ] Fix #1: Add serviceAreas importTransform
- [ ] Fix #2: Add companyValues field mapping
- [ ] Fix #3: Add geocoding to HQ location import
- [ ] Update field count test (28 → 31 after adding companyValues + 3 HQ fields)
- [ ] Run all integration tests
- [ ] Test Excel import in staging environment
- [ ] Update Excel template if new columns added
- [ ] Update user documentation

---

## Impact Assessment

### Before Fixes
- ❌ serviceAreas imports fail with "Value must be an array" error
- ❌ companyValues cannot be imported at all
- ❌ HQ locations import but don't appear on maps
- ⚠️ Only 28 fields available for import (56% coverage)

### After Fixes
- ✅ serviceAreas imports work correctly
- ✅ companyValues can be bulk imported
- ✅ HQ locations appear on maps with pins
- ✅ 34+ fields available for import (68% coverage)
- ✅ More complete vendor profile data via Excel

### User Experience Improvement
- Vendors can now import comprehensive profiles in one operation
- No more manual entry for array fields
- Locations immediately appear on maps
- Excel template is more valuable and complete

---

## Files to Modify

1. `/home/edwin/development/ptnextjs/lib/config/excel-field-mappings.ts`
   - Add importTransform to serviceAreas
   - Add companyValues field mapping
   - Add 3 new HQ field mappings (optional)
   - Add certifications, awards, videoDuration (optional)

2. `/home/edwin/development/ptnextjs/lib/services/ImportExecutionService.ts`
   - Make buildHQLocationChange async
   - Add geocoding API call
   - Update extractHQFields to include new fields
   - Fix ImportOptions interface types

3. `/home/edwin/development/ptnextjs/app/api/portal/vendors/[id]/excel-import/route.ts`
   - Update ImportOptions call to use numbers (if fixing #6)

4. `/home/edwin/development/ptnextjs/__tests__/integration/api-contract/import-api-contract.test.ts`
   - Update field count assertions after adding new mappings

---

**Priority Order**: Fix #1 and #2 immediately (Critical), then #3 (High), then #4-5 (Medium), then #6 (Low)

**Estimated Total Development Time**: 4-6 hours
**Estimated Testing Time**: 2-3 hours
