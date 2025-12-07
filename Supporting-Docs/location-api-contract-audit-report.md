# Location Management API Contract Audit Report

**Date**: 2025-12-07
**Auditor**: Senior TypeScript Developer
**Scope**: Location management forms, geocoding, and backend API data structures

---

## Executive Summary

**Status**: CRITICAL MISMATCHES FOUND

This audit identified **3 critical mismatches** between frontend forms, TypeScript types, validation schemas, and the Payload CMS database schema for vendor location management. These mismatches can cause:

1. Data loss (fields accepted by API but not stored in database)
2. Validation failures (fields missing from forms but expected by database)
3. Type safety violations (TypeScript types don't match database reality)

---

## Critical Findings

### MISMATCH 1: Extra Fields in API Validation Schema Not in Database

**Severity**: HIGH
**Impact**: Data Accepted But Not Persisted

**Location**: `/home/edwin/development/ptnextjs/lib/validation/vendor-update-schema.ts` (lines 204-243)

The `vendorUpdateSchema.locations` array accepts **5 fields that do not exist** in the Payload database schema:

| Field | Line | Status | Issue |
|-------|------|--------|-------|
| `state` | 211 | EXTRA | Accepted by API, but NOT stored in database |
| `phone` | 214 | EXTRA | Accepted by API, but NOT stored in database |
| `email` | 215 | EXTRA | Accepted by API, but NOT stored in database |
| `type` | 228 | EXTRA | Accepted by API, but NOT stored in database (enum: headquarters/office/showroom/service/warehouse) |
| `isPrimary` | 230 | EXTRA | Accepted by API, but NOT stored in database |

**Risk**: Frontend could send these fields, validation passes, but data silently disappears after save.

---

### MISMATCH 2: Missing Fields in Payload Database Schema

**Severity**: CRITICAL
**Impact**: Data Loss & Type Inconsistency

**Location**: `/home/edwin/development/ptnextjs/payload/collections/Vendors.ts` (lines 1159-1230)

The Payload `locations` array field is **missing 2 fields** that exist in TypeScript types and form validation:

| Field | Defined In | Missing From | Issue |
|-------|-----------|--------------|-------|
| `postalCode` | `VendorLocation` type, `locationSchema`, form fields | Payload schema | Frontend collects it, but database won't store it |
| `locationName` | `VendorLocation` type, `locationSchema`, form fields | Payload schema | Frontend collects it, but database won't store it |

**Evidence**:

**TypeScript Type** (`/home/edwin/development/ptnextjs/lib/types.ts` lines 219-229):
```typescript
export interface VendorLocation {
  id?: string;
  locationName?: string;  // ✗ NOT in Payload
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;    // ✗ NOT in Payload
  latitude?: number;
  longitude?: number;
  isHQ?: boolean;
}
```

**Zod Validation** (`/home/edwin/development/ptnextjs/lib/validation/vendorSchemas.ts` lines 163-173):
```typescript
export const locationSchema = z.object({
  id: z.string().optional(),
  locationName: z.string().min(2).max(255).optional().nullable(),  // ✗ NOT in Payload
  address: z.string().min(5).max(500),
  city: z.string().min(2).max(255),
  postalCode: z.string().max(20).optional().nullable(),            // ✗ NOT in Payload
  country: z.string().min(2).max(255),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  isHQ: z.boolean().optional().nullable(),
});
```

**Form Component** (`/home/edwin/development/ptnextjs/components/dashboard/LocationFormFields.tsx`):
- Line 189: Collects `locationName` input
- Line 270: Collects `postalCode` input

**Payload Schema** (`/home/edwin/development/ptnextjs/payload/collections/Vendors.ts` lines 1159-1230):
```typescript
fields: [
  { name: 'address', type: 'text', maxLength: 500 },
  { name: 'latitude', type: 'number', min: -90, max: 90 },
  { name: 'longitude', type: 'number', min: -180, max: 180 },
  { name: 'city', type: 'text', maxLength: 255 },
  { name: 'country', type: 'text', maxLength: 255 },
  { name: 'isHQ', type: 'checkbox', defaultValue: false },
  // Missing: postalCode, locationName
]
```

**Risk**: Users fill out `postalCode` and `locationName` in forms, data passes validation, but gets silently dropped when saving to database.

---

### MISMATCH 3: Field Length Validation Inconsistencies

**Severity**: MEDIUM
**Impact**: Inconsistent Validation Rules

**Issue**: Different maximum lengths defined across layers:

| Field | Payload Schema | vendorUpdateSchema | locationSchema | TypeScript Type |
|-------|----------------|-------------------|----------------|-----------------|
| `address` | 500 chars | 500 chars | 500 chars | Optional string (no limit) |
| `city` | 255 chars | 255 chars | 255 chars | Optional string (no limit) |
| `country` | 255 chars | 255 chars | 255 chars | Optional string (no limit) |
| `postalCode` | N/A (missing) | 50 chars | 20 chars | Optional string (no limit) |
| `locationName` | N/A (missing) | 255 chars | 255 chars | Optional string (no limit) |

**Inconsistency**: `postalCode` has different max lengths (50 vs 20) between schemas.

---

## Data Flow Analysis

### Current Data Flow (BROKEN)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User fills form (LocationFormFields.tsx)                 │
│    - locationName ✓                                         │
│    - address ✓                                              │
│    - city ✓                                                 │
│    - country ✓                                              │
│    - postalCode ✓                                           │
│    - latitude/longitude ✓                                   │
│    - isHQ ✓                                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Frontend sends PATCH to /api/portal/vendors/[id]         │
│    Body: { locations: [VendorLocation, ...] }              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. API validates with vendorUpdateSchema                    │
│    - Accepts: postalCode, locationName ✓                    │
│    - Also accepts (EXTRA): state, phone, email, type,       │
│      isPrimary (these don't exist in Payload)               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Payload CMS saves to database                            │
│    - Saves: address, city, country, latitude, longitude,    │
│      isHQ ✓                                                 │
│    - DROPS: postalCode, locationName ✗                      │
│    - DROPS: state, phone, email, type, isPrimary (if sent)  │
└─────────────────────────────────────────────────────────────┘
```

**Result**: Data loss. User expects `postalCode` and `locationName` to be saved, but they're silently dropped.

---

## Component-by-Component Analysis

### 1. LocationsManagerCard.tsx

**File**: `/home/edwin/development/ptnextjs/components/dashboard/LocationsManagerCard.tsx`

**Data Sent** (line 184-193):
```typescript
const response = await fetch(`/api/portal/vendors/${vendor.id}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    locations: locations, // Array of VendorLocation
  }),
});
```

**Fields in `locations` array**:
- All fields from `VendorLocation` type
- Including: `postalCode`, `locationName` (which won't be saved)

**Status**: BROKEN - Sends fields that database won't persist.

---

### 2. LocationFormFields.tsx

**File**: `/home/edwin/development/ptnextjs/components/dashboard/LocationFormFields.tsx`

**Fields Collected**:
- Line 189: `locationName` ✗ (not in Payload)
- Line 209: `address` ✓
- Line 230: `city` ✓
- Line 249: `country` ✓
- Line 270: `postalCode` ✗ (not in Payload)
- Lines 288/309: `latitude`/`longitude` ✓
- Line 341: `isHQ` ✓

**Status**: BROKEN - Collects 2 fields that won't be persisted.

---

### 3. LocationSearchFilter.tsx

**File**: `/home/edwin/development/ptnextjs/components/LocationSearchFilter.tsx`

**Data Sent to Geocode API** (line 122-125):
```typescript
const response = await fetch(
  `/api/geocode?q=${encodeURIComponent(locationInput.trim())}&limit=5`,
  { signal: abortController.signal }
);
```

**Expected Response Type**: `GeocodeSuccessResponse`

**Analysis**: This component only sends search queries and receives geocode results. It does NOT send location updates, so it's not affected by the mismatch.

**Status**: OK - No contract issues found.

---

### 4. Geocode API Route

**File**: `/home/edwin/development/ptnextjs/app/api/geocode/route.ts`

**Request Format** (line 295-296):
```typescript
const { searchParams } = new URL(request.url);
const validation = validateQueryParams(searchParams);
// Expected: ?q=<location>&limit=<number>&lang=<code>
```

**Response Format** (lines 323-344):
```typescript
return NextResponse.json<SuccessResponse>({
  success: true,
  results: photonResponse.features.map((feature) => ({
    name: feature.properties.name || 'Unnamed Location',
    city: feature.properties.city || null,
    country: feature.properties.country || null,
    latitude: feature.geometry.coordinates[1],
    longitude: feature.geometry.coordinates[0],
    displayName: feature.properties.name || 'Unnamed Location',
    fullAddress: /* computed */,
  })),
  count: photonResponse.features.length,
});
```

**Status**: OK - Contract matches frontend expectations.

---

### 5. Vendor Update API Route

**File**: `/home/edwin/development/ptnextjs/app/api/portal/vendors/[id]/route.ts`

**Validation** (lines 238, 469):
```typescript
const validationResult = safeValidateVendorUpdate(body);
```

**Schema Used**: `vendorUpdateSchema` from `/home/edwin/development/ptnextjs/lib/validation/vendor-update-schema.ts`

**Issue**: Schema accepts fields not in Payload (state, phone, email, type, isPrimary).

**Status**: BROKEN - Accepts data that won't be persisted.

---

### 6. LocationService.ts

**File**: `/home/edwin/development/ptnextjs/lib/services/LocationService.ts`

**Functions**:
- `validateVendorLocations()` - Validates coordinate ranges, field lengths, HQ uniqueness
- `checkTierLocationAccess()` - Enforces tier-based location limits
- `autoDesignateHQLocation()` - Auto-designates first location as HQ

**Fields Validated**:
- `latitude`, `longitude` - Range validation ✓
- `address` - Max 500 chars ✓
- `city` - Max 255 chars ✓
- `country` - Max 255 chars ✓
- `isHQ` - Uniqueness ✓

**Missing Validation**:
- `postalCode` - No validation (field doesn't exist in Payload anyway)
- `locationName` - No validation (field doesn't exist in Payload anyway)

**Status**: PARTIALLY BROKEN - Validates fields that match Payload, but TypeScript type includes extra fields.

---

## Tier-Based Location Limits

**Implementation**: `/home/edwin/development/ptnextjs/lib/services/LocationService.ts` (lines 93-108)

```typescript
export function checkTierLocationAccess(tier: string, locations: VendorLocation[]): TierAccessResult {
  if (!locations || locations.length <= 1) {
    return { allowed: true };
  }

  // Multiple locations require tier2
  if (tier === 'free' || tier === 'tier1') {
    return {
      allowed: false,
      error: 'Multiple locations require Tier 2 subscription',
    };
  }

  return { allowed: true };
}
```

**Status**: OK - Logic is correct, but note tier limits mentioned in CLAUDE.md differ:
- CLAUDE.md says: Tier 1: 1 location, Tier 2: 5, Tier 3: 10, Tier 4: unlimited
- Code implements: Tier 0/1: 1 location, Tier 2+: unlimited

**Recommendation**: Align tier limits with CLAUDE.md or update documentation.

---

## Recommended Fixes

### Priority 1: Add Missing Fields to Payload Schema (CRITICAL)

**File**: `/home/edwin/development/ptnextjs/payload/collections/Vendors.ts`

**Action**: Add `postalCode` and `locationName` fields to the `locations` array.

**Location**: After line 1220 (after `country` field)

```typescript
{
  name: 'postalCode',
  type: 'text',
  label: 'Postal Code',
  maxLength: 20,
  admin: {
    placeholder: 'e.g., 98000, FL 33316',
    description: 'Postal or ZIP code',
  },
},
{
  name: 'locationName',
  type: 'text',
  label: 'Location Name',
  maxLength: 255,
  admin: {
    placeholder: 'e.g., Monaco Office, Fort Lauderdale Branch',
    description: 'Display name for this location (optional)',
  },
},
```

---

### Priority 2: Remove Extra Fields from vendorUpdateSchema (HIGH)

**File**: `/home/edwin/development/ptnextjs/lib/validation/vendor-update-schema.ts`

**Action**: Remove fields that don't exist in Payload: `state`, `phone`, `email`, `type`, `isPrimary`.

**Location**: Lines 211, 214-215, 228, 230

**Before**:
```typescript
locations: z.array(
  z.object({
    id: z.string().optional(),
    locationName: z.string().max(255).optional(),
    address: z.string().max(500).optional(),
    city: z.string().max(255).optional(),
    state: z.string().max(255).optional().nullable(),           // REMOVE
    country: z.string().max(255).optional(),
    postalCode: z.string().max(50).optional(),
    phone: z.string().max(50).optional().nullable(),             // REMOVE
    email: z.string().email().optional().nullable(),             // REMOVE
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
    type: z.enum(['headquarters', 'office', ...]).optional().nullable(),  // REMOVE
    isHQ: z.boolean().optional().nullable(),
    isPrimary: z.boolean().optional().nullable(),                // REMOVE
  })
)
```

**After**:
```typescript
locations: z.array(
  z.object({
    id: z.string().optional(),
    locationName: z.string().max(255).optional(),
    address: z.string().max(500).optional(),
    city: z.string().max(255).optional(),
    country: z.string().max(255).optional(),
    postalCode: z.string().max(20).optional(),  // Match locationSchema (20, not 50)
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
    isHQ: z.boolean().optional().nullable(),
  })
)
```

---

### Priority 3: Standardize postalCode Max Length (MEDIUM)

**Files**:
- `/home/edwin/development/ptnextjs/lib/validation/vendor-update-schema.ts` (line 213)
- `/home/edwin/development/ptnextjs/lib/validation/vendorSchemas.ts` (line 168)

**Action**: Use consistent max length of 20 characters for `postalCode` across all schemas.

**Rationale**: Most postal codes worldwide are under 20 characters (US: 10 with ZIP+4, UK: 8, Canada: 7).

---

## Test Coverage Recommendations

### Create New Test File: location-api-contract.test.ts

**Path**: `/home/edwin/development/ptnextjs/__tests__/integration/api-contract/location-api-contract.test.ts`

**Test Cases**:

1. **Field Alignment Tests**
   - Verify all fields in `VendorLocation` type exist in Payload schema
   - Verify all Payload location fields have corresponding TypeScript types
   - Verify `vendorUpdateSchema.locations` matches Payload schema exactly

2. **Data Persistence Tests**
   - Send location with `postalCode` and `locationName`, verify both are saved
   - Send location with all fields, verify no data loss
   - Verify fields NOT in Payload schema are rejected by validation

3. **Geocode API Contract Tests**
   - Verify request query params match expected format
   - Verify response structure matches `GeocodeSuccessResponse` type
   - Verify coordinate precision (6 decimal places minimum)

4. **Tier Limit Tests**
   - Verify Tier 0/1 vendors can create 1 location
   - Verify Tier 0/1 vendors cannot create 2+ locations
   - Verify Tier 2+ vendors can create unlimited locations

5. **Form-to-API Field Mapping Tests**
   - Verify `LocationFormFields` collects all Payload schema fields
   - Verify `LocationFormFields` does NOT collect extra fields
   - Verify form validation matches API validation

---

## Files Requiring Changes

| File Path | Priority | Action | Lines |
|-----------|----------|--------|-------|
| `/home/edwin/development/ptnextjs/payload/collections/Vendors.ts` | P1 | Add `postalCode` and `locationName` fields | After 1220 |
| `/home/edwin/development/ptnextjs/lib/validation/vendor-update-schema.ts` | P2 | Remove 5 extra fields (state, phone, email, type, isPrimary) | 211, 214-215, 228, 230 |
| `/home/edwin/development/ptnextjs/lib/validation/vendor-update-schema.ts` | P3 | Change `postalCode` max from 50 to 20 | 213 |
| `/home/edwin/development/ptnextjs/__tests__/integration/api-contract/location-api-contract.test.ts` | P2 | Create new test file | New file |

---

## Summary

**Total Mismatches Found**: 3 critical issues

**Impact**:
- Data loss for `postalCode` and `locationName` fields
- Potential confusion from accepting fields that aren't persisted
- Type safety violations between frontend and backend

**Recommended Timeline**:
1. Immediate: Add missing fields to Payload schema (P1)
2. Same PR: Remove extra fields from validation schema (P2)
3. Same PR: Create comprehensive contract tests (P2)
4. Follow-up: Standardize field lengths (P3)

**Risk Level**: HIGH - Users are losing data without knowing it.

---

## Appendix: Complete Field Comparison

| Field | VendorLocation Type | locationSchema | vendorUpdateSchema | Payload Schema | Status |
|-------|---------------------|----------------|-------------------|----------------|--------|
| id | ✓ Optional | ✓ Optional | ✓ Optional | Auto-generated | OK |
| locationName | ✓ Optional | ✓ Optional (2-255 chars) | ✓ Optional (max 255) | ✗ MISSING | BROKEN |
| address | ✓ Optional | ✓ Required (5-500 chars) | ✓ Optional (max 500) | ✓ Max 500 | OK |
| city | ✓ Optional | ✓ Required (2-255 chars) | ✓ Optional (max 255) | ✓ Max 255 | OK |
| country | ✓ Optional | ✓ Required (2-255 chars) | ✓ Optional (max 255) | ✓ Max 255 | OK |
| postalCode | ✓ Optional | ✓ Optional (max 20) | ✓ Optional (max 50) | ✗ MISSING | BROKEN |
| latitude | ✓ Optional number | ✓ Optional (-90 to 90) | ✓ Optional (-90 to 90) | ✓ -90 to 90 | OK |
| longitude | ✓ Optional number | ✓ Optional (-180 to 180) | ✓ Optional (-180 to 180) | ✓ -180 to 180 | OK |
| isHQ | ✓ Optional boolean | ✓ Optional boolean | ✓ Optional boolean | ✓ Checkbox (default false) | OK |
| state | ✗ | ✗ | ✓ Optional (max 255) | ✗ | EXTRA (remove) |
| phone | ✗ | ✗ | ✓ Optional (max 50) | ✗ | EXTRA (remove) |
| email | ✗ | ✗ | ✓ Optional email | ✗ | EXTRA (remove) |
| type | ✗ | ✗ | ✓ Optional enum | ✗ | EXTRA (remove) |
| isPrimary | ✗ | ✗ | ✓ Optional boolean | ✗ | EXTRA (remove) |

**Legend**:
- ✓ = Field exists
- ✗ = Field does not exist
- OK = Aligned across all layers
- BROKEN = Missing in Payload (data loss)
- EXTRA = In validation but not in Payload (should remove)

---

**End of Report**
