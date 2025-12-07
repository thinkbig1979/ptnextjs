# Excel Import API Contract Audit Report

**Date**: 2025-12-07
**Auditor**: Senior JavaScript/TypeScript Developer
**Scope**: Excel import data flow from form submission to vendor update API

## Executive Summary

This audit examined the complete data flow for Excel vendor imports, tracing structure transformations from Excel columns through parsing, validation, execution, and final vendor updates. **7 critical mismatches** were identified that could cause import failures or data corruption.

### Critical Issues Found

1. **ARRAY_STRING fields lack CSV-to-array transformation** - Severity: HIGH
2. **companyValues field completely missing from field mappings** - Severity: HIGH
3. **HQ location transformation creates incomplete location objects** - Severity: MEDIUM
4. **Import history uses string IDs but Payload expects numbers** - Severity: LOW (handled via conversion)
5. **Multiple vendor schema fields have no Excel mapping** - Severity: MEDIUM
6. **serviceAreas validation expects array but receives string** - Severity: HIGH
7. **No geocoding for HQ locations during import** - Severity: MEDIUM

---

## 1. ARRAY_STRING Transformation Mismatch

### Issue Details

**File**: `/home/edwin/development/ptnextjs/lib/config/excel-field-mappings.ts:386-395`

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
  // MISSING: importTransform function
}
```

### The Problem

1. **Excel Input**: `"Mediterranean, Caribbean, Pacific Northwest"` (comma-separated string)
2. **Parser Output**: `"Mediterranean, Caribbean, Pacific Northwest"` (still a string - no transformation)
3. **Validation Expectation**: Array (see ImportValidationService.ts:424-440)
4. **Vendor Update Schema**: Expects `string[] | object[]` union

### Validation Failure Point

**File**: `/home/edwin/development/ptnextjs/lib/services/ImportValidationService.ts:424-440`

```typescript
private static validateArrayString(
  rowNumber: number,
  fieldName: string,
  value: unknown,
  rowResult: RowValidationResult
): void {
  if (!Array.isArray(value)) {  // ❌ FAILS - value is string, not array
    rowResult.errors.push({
      rowNumber,
      field: fieldName,
      severity: ValidationSeverity.ERROR,
      code: 'INVALID_ARRAY',
      message: 'Value must be an array',
      value
    });
  }
}
```

### Impact

- **All serviceAreas imports will fail validation**
- Users see cryptic "Value must be an array" errors
- Excel template says "comma-separated" but that format doesn't work

### Recommended Fix

Add `importTransform` function to field mapping:

```typescript
{
  fieldName: 'serviceAreas',
  excelColumn: 'Service Areas',
  dataType: FieldDataType.ARRAY_STRING,
  importTransform: (value: string) =>
    value.split(',').map(s => s.trim()).filter(s => s.length > 0),
  // ... rest of config
}
```

---

## 2. Missing companyValues Field Mapping

### Issue Details

**File**: `/home/edwin/development/ptnextjs/lib/config/excel-field-mappings.ts`

The `companyValues` field is referenced in multiple places but has **NO field mapping definition**:

**References Found**:
1. Payload Vendors.ts:1108-1128 - Collection field definition
2. Payload Vendors.ts:1819 - Tier 1 validation list
3. vendor-update-schema.ts:184-196 - Validation schema
4. VendorDashboardContext - Runtime usage

**Field Mapping**: ❌ **NOT FOUND**

### Impact

- Vendors **cannot import company values via Excel**
- No export capability for this field either
- Field exists in CMS and API but unavailable in bulk operations
- Template generation will not include this column

### Recommended Fix

Add field mapping:

```typescript
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
  description: 'Comma-separated list of company values',
  example: 'Quality, Innovation, Customer Service'
}
```

---

## 3. HQ Location Transformation Issues

### Current Implementation

**File**: `/home/edwin/development/ptnextjs/lib/services/ImportExecutionService.ts:317-350`

```typescript
private static extractHQFields(newData: Record<string, unknown>) {
  return {
    address: (hqAddress as string | undefined) || undefined,
    city: (hqCity as string | undefined) || undefined,
    country: (hqCountry as string | undefined) || undefined
  };
}
```

### The Problem

Excel provides only 3 HQ fields:
- `hqAddress`
- `hqCity`
- `hqCountry`

But the `locations` array expects:
- `locationName` - ❌ Missing
- `address` - ✅ Provided
- `city` - ✅ Provided
- `state` - ❌ Missing
- `country` - ✅ Provided
- `postalCode` - ❌ Missing
- `latitude` - ❌ Missing (no geocoding)
- `longitude` - ❌ Missing (no geocoding)
- `type` - ❌ Missing (should be 'headquarters')
- `isHQ` - ✅ Set to true

### Impact

- **Incomplete location records** created during import
- **No geocoding** - locations won't appear on maps
- **Missing location name** - defaults to undefined
- **Missing postal code** - address is incomplete

### Recommended Fix

1. Add more HQ fields to field mappings:
   - `hqLocationName` → `locationName`
   - `hqState` → `state`
   - `hqPostalCode` → `postalCode`

2. Add geocoding step in ImportExecutionService:
   ```typescript
   // Call geocoding API to get lat/lng from address
   const coords = await geocodeAddress(fullAddress);
   ```

3. Auto-set location type to 'headquarters'

---

## 4. Import History ID Type Conversion

### Issue Details

**File**: `/home/edwin/development/ptnextjs/lib/services/ImportExecutionService.ts:479-496`

```typescript
// ImportOptions uses string IDs
export interface ImportOptions {
  vendorId: string;  // ← STRING
  userId: string;    // ← STRING
  // ...
}

// But createImportHistory converts to numbers
const history = await payload.create({
  collection: 'import_history',
  data: {
    vendor: Number(options.vendorId),  // ← Converted to NUMBER
    user: Number(options.userId),      // ← Converted to NUMBER
    // ...
  }
});
```

### Why This Works (But Shouldn't)

Payload CMS relationship fields internally use numeric IDs, so the conversion works. However:

1. **Type mismatch** between interface and usage
2. **Runtime conversion risk** - what if vendorId is not numeric?
3. **Inconsistent API design** - other services use string IDs

### Impact

Currently **LOW** - the conversion happens and works correctly. But creates technical debt.

### Recommended Fix

Update ImportOptions interface to match Payload expectations:

```typescript
export interface ImportOptions {
  vendorId: number;  // Match Payload relationship type
  userId: number;    // Match Payload relationship type
  overwriteExisting: boolean;
  dryRun?: boolean;
  filename?: string;
}
```

---

## 5. Missing Field Mappings - Coverage Analysis

### Fields in Vendor Schema But Missing from Excel Mappings

| Field Name | In Payload Schema | In vendor-update-schema | Has Field Mapping | Impact |
|------------|------------------|------------------------|------------------|---------|
| `companyValues` | ✅ | ✅ | ❌ | Cannot import company values |
| `certifications` | ✅ | ✅ | ❌ | Cannot import certifications |
| `awards` | ✅ | ❌ | ❌ | Cannot import awards |
| `innovationHighlights` | ✅ | ❌ | ❌ | Cannot import innovation highlights |
| `caseStudies` | ✅ | ✅ | ❌ | Cannot import case studies |
| `teamMembers` | ✅ | ✅ | ❌ | Cannot import team members |
| `videoDuration` | ✅ | ✅ | ❌ | Cannot import video duration |
| `slug` | ✅ | ✅ | ❌ | Cannot import slug |

### Coverage Statistics

- **Total Vendor Schema Fields**: ~50+
- **Total Field Mappings**: 28
- **Coverage**: ~56%

### Impact

Many vendor profile fields **cannot be bulk imported** via Excel. Users must manually enter:
- Company values
- Certifications
- Awards
- Case studies
- Team members

This defeats the purpose of bulk import for comprehensive vendor profiles.

### Recommended Fix

**Phase 1 (Simple fields)**: Add mappings for:
- `companyValues` (ARRAY_STRING with transform)
- `certifications` (STRING)
- `awards` (STRING)
- `slug` (STRING with validation)
- `videoDuration` (STRING)

**Phase 2 (Complex fields)**: Document that these require UI:
- `caseStudies` (too complex for single Excel row)
- `teamMembers` (too complex for single Excel row)
- `innovationHighlights` (complex structure)

---

## 6. Vendor Update Schema vs Import Data Structure

### ServiceAreas Format Mismatch

**Vendor Update Schema** (`vendor-update-schema.ts:169-182`):

```typescript
serviceAreas: z.array(
  z.union([
    z.string(),  // Simple format: ["Mediterranean", "Caribbean"]
    z.object({   // Payload CMS format
      id: z.string().optional(),
      area: z.string().max(255).optional(),
      description: z.string().max(1000).optional().nullable(),
      icon: z.union([z.string(), z.number(), z.null()]).optional(),
    }),
  ])
).optional().nullable()
```

**Import Data Structure** (what parser provides):

```typescript
// CURRENT (wrong):
serviceAreas: "Mediterranean, Caribbean, Pacific"  // STRING ❌

// SHOULD BE:
serviceAreas: ["Mediterranean", "Caribbean", "Pacific"]  // ARRAY ✅
```

### Impact

Even if validation passes (currently it doesn't), the vendor update API might reject the data because:
1. Zod schema expects `Array<string | object>`
2. Import provides `string`
3. Type mismatch causes validation error

### Recommended Fix

Add transformation in field mapping (see Issue #1 fix).

---

## 7. Missing Geocoding for HQ Locations

### Current Behavior

When HQ fields are imported:
1. `hqAddress`, `hqCity`, `hqCountry` are parsed
2. Location object is created with these fields
3. **No geocoding occurs**
4. `latitude` and `longitude` remain `null`

### Impact

- **Locations won't appear on vendor profile maps**
- **Location search by radius won't work**
- **LocationsDisplaySection shows no map pins**

### Comparison with Dashboard Location Management

**File**: `/home/edwin/development/ptnextjs/components/dashboard/LocationFormFields.tsx`

When users add locations via dashboard:
1. They enter address fields
2. Component calls `/api/geocode` endpoint
3. Coordinates are fetched and stored
4. Map displays correctly

**Import flow has no equivalent geocoding step.**

### Recommended Fix

Add geocoding step in ImportExecutionService:

```typescript
private static async buildHQLocationChange(
  currentVendor: Partial<Vendor>,
  hqFields: { address?: string; city?: string; country?: string },
  overwrite: boolean
): Promise<FieldChange | null> {
  // ... existing code ...

  // NEW: Geocode the address
  const fullAddress = `${hqFields.address}, ${hqFields.city}, ${hqFields.country}`;
  const coords = await geocodeAddress(fullAddress);

  const hqLocation = {
    address: hqFields.address,
    city: hqFields.city,
    country: hqFields.country,
    latitude: coords?.latitude || null,
    longitude: coords?.longitude || null,
    isHQ: true,
    type: 'headquarters'
  };

  // ... rest of function
}
```

---

## Data Flow Diagram

```
┌─────────────────┐
│  Excel File     │
│  .xlsx / .xls   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────┐
│  ExcelParserService.parse()                         │
│  - Reads Excel columns via field mappings           │
│  - Applies importTransform (IF DEFINED) ❌ MISSING   │
│  - Creates ParsedVendorRow[]                        │
└────────┬────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────┐
│  ImportValidationService.validate()                 │
│  - Validates data types (expects arrays) ❌ FAILS   │
│  - Validates tier access                            │
│  - Returns RowValidationResult[]                    │
└────────┬────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────┐
│  ImportExecutionService.execute()                   │
│  - Calculates field changes                         │
│  - Transforms HQ fields → locations array           │
│  - Builds update payload                            │
│  - NO GEOCODING ❌ MISSING                          │
└────────┬────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────┐
│  Payload.update() - Vendor Update API               │
│  - Validates via vendor-update-schema               │
│  - Expects arrays, not strings ❌ MISMATCH          │
│  - Saves to database                                │
└────────┬────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────┐
│  ImportHistoryService.createImportHistory()         │
│  - Converts string IDs → number IDs ⚠️ TYPE ISSUE  │
│  - Stores import record in import_history           │
└─────────────────────────────────────────────────────┘
```

---

## Field Mapping Audit Summary

### Fields With Correct Mappings (25)

✅ Basic fields (5): companyName, description, contactEmail, contactPhone, logo
✅ Tier 1 fields (20): website, linkedinUrl, twitterUrl, foundedYear, employeeCount, totalProjects, videoUrl, videoTitle, videoThumbnail, yearsInBusiness, hqAddress, hqCity, hqCountry, longDescription, linkedinFollowers, instagramFollowers, clientSatisfactionScore, repeatClientPercentage, videoDescription, serviceAreas
✅ Admin fields (3): featured, partner, tier

### Fields Missing Mappings But Should Have (8)

❌ **companyValues** - CRITICAL (array field, no transformation)
❌ **certifications** - Simple text field
❌ **awards** - Simple text field
❌ **slug** - String field with validation
❌ **videoDuration** - Simple text field
❌ **hqState** - Missing from HQ location set
❌ **hqPostalCode** - Missing from HQ location set
❌ **hqLocationName** - Missing from HQ location set

### Complex Fields (Correctly Excluded from Excel)

These fields are too complex for single-row Excel import:
- ✅ caseStudies (multi-row, images, nested data)
- ✅ teamMembers (multi-row, photos, bios)
- ✅ locations (multi-row, geocoding) - except HQ
- ✅ innovationHighlights (complex structure)
- ✅ yachtProjects (relationships)

---

## Test Coverage Analysis

### Existing Tests

**File**: `/home/edwin/development/ptnextjs/__tests__/integration/api-contract/vendor-update-schema-contract.test.ts`

Covers:
- ✅ Locations array validation
- ✅ ServiceAreas as array of strings/objects
- ✅ CompanyValues as array of strings/objects
- ✅ Case studies with images
- ✅ Team members with photos
- ✅ Coordinate validation
- ✅ HQ designation rules

### New Test File Created

**File**: `/home/edwin/development/ptnextjs/__tests__/integration/api-contract/import-api-contract.test.ts`

Covers:
- ✅ Field mapping coverage audit
- ✅ ARRAY_STRING transformation issues
- ✅ HQ location transformation flow
- ✅ Import history structure validation
- ✅ Missing field impact analysis
- ✅ Data flow integration contracts
- ✅ Edge cases and performance

**Total Test Cases**: 28 (documents all issues found)

---

## Recommendations

### Immediate Fixes (Critical - Do Now)

1. **Add importTransform for serviceAreas**
   - File: `lib/config/excel-field-mappings.ts:386`
   - Fix: Add CSV-to-array transformation function
   - Impact: Unblocks all serviceAreas imports

2. **Add companyValues field mapping**
   - File: `lib/config/excel-field-mappings.ts`
   - Fix: Add complete field definition with transformation
   - Impact: Enables company values import

### Medium Priority (Do This Sprint)

3. **Expand HQ location fields**
   - Files: `lib/config/excel-field-mappings.ts`, `lib/services/ImportExecutionService.ts`
   - Fix: Add hqState, hqPostalCode, hqLocationName fields
   - Impact: More complete location data

4. **Add geocoding to import flow**
   - File: `lib/services/ImportExecutionService.ts:336`
   - Fix: Call geocoding service during HQ location transformation
   - Impact: Imported locations appear on maps

5. **Add missing simple field mappings**
   - File: `lib/config/excel-field-mappings.ts`
   - Fix: Add certifications, awards, slug, videoDuration
   - Impact: Broader import capability

### Low Priority (Technical Debt)

6. **Fix ImportOptions type inconsistency**
   - File: `lib/services/ImportExecutionService.ts:27`
   - Fix: Change vendorId/userId to number type
   - Impact: Better type safety, no runtime impact

7. **Document complex field exclusions**
   - File: `lib/config/excel-field-mappings.ts:437-446`
   - Fix: Expand comments explaining why certain fields aren't mappable
   - Impact: Developer clarity

---

## Files Audited

### Configuration Files
- ✅ `/home/edwin/development/ptnextjs/lib/config/excel-field-mappings.ts` (561 lines)

### Service Files
- ✅ `/home/edwin/development/ptnextjs/lib/services/ExcelParserService.ts` (324 lines)
- ✅ `/home/edwin/development/ptnextjs/lib/services/ImportValidationService.ts` (500+ lines)
- ✅ `/home/edwin/development/ptnextjs/lib/services/ImportExecutionService.ts` (550+ lines)

### API Routes
- ✅ `/home/edwin/development/ptnextjs/app/api/portal/vendors/[id]/excel-import/route.ts` (257 lines)
- ✅ `/home/edwin/development/ptnextjs/app/api/portal/vendors/[id]/import-history/route.ts` (189 lines)
- ✅ `/home/edwin/development/ptnextjs/app/api/portal/vendors/[id]/route.ts` (PUT method)

### Schema Files
- ✅ `/home/edwin/development/ptnextjs/lib/validation/vendor-update-schema.ts` (300+ lines)
- ✅ `/home/edwin/development/ptnextjs/payload/collections/ImportHistory.ts` (192 lines)
- ✅ `/home/edwin/development/ptnextjs/payload/collections/Vendors.ts` (serviceAreas/companyValues sections)

### Component Files
- ✅ `/home/edwin/development/ptnextjs/components/dashboard/ExcelImportCard.tsx` (execution flow)

### Test Files
- ✅ `/home/edwin/development/ptnextjs/__tests__/integration/api-contract/vendor-update-schema-contract.test.ts` (existing)
- ✅ `/home/edwin/development/ptnextjs/__tests__/integration/api-contract/import-api-contract.test.ts` (created)

---

## Conclusion

The Excel import system has **7 critical structural mismatches** that prevent successful imports of array fields and create incomplete location data. The most critical issues are:

1. **serviceAreas and companyValues cannot be imported** due to missing transformations
2. **HQ locations are created without geocoding** and missing key fields
3. **Field mapping coverage is only 56%** - many vendor fields unavailable

**Immediate action required** on issues #1 and #2 to unblock vendor Excel imports.

All issues have been documented with:
- Exact file paths and line numbers
- Code examples showing the problem
- Recommended fixes with code samples
- 28 test cases covering all scenarios

---

**Audit completed**: 2025-12-07
**Test file created**: `/home/edwin/development/ptnextjs/__tests__/integration/api-contract/import-api-contract.test.ts`
