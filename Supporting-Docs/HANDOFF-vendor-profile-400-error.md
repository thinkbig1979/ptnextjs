# Handoff Brief: Vendor Profile Save 400 Error

**Date**: 2025-12-07
**Status**: IN PROGRESS - Fix applied but needs verification
**Priority**: HIGH

---

## Problem Statement

Saving a vendor profile via the dashboard returns:
```
HTTP 400 Bad Request - "Invalid input data"
```

The form data looks correct:
```js
{
  companyName: "Test Company",
  slug: "test-company",
  description: "description for test",
  logo: undefined,
  contactEmail: "test@test.com",
  contactPhone: "+2132 2334434"
}
```

---

## Root Cause Analysis

### Issue 1: `slug` field missing from API schema ✅ FIXED
- **Location**: `lib/validation/vendor-update-schema.ts`
- **Problem**: `slug` was in `ALLOWED_UPDATE_FIELDS` (context sends it) but NOT in the Zod validation schema (API rejects it)
- **Fix Applied**: Added slug validation to schema

### Issue 2: `companyName` → `name` transformation ✅ FIXED EARLIER
- **Location**: `app/(site)/vendor/dashboard/components/ProfileEditTabs.tsx`
- **Problem**: Code was transforming `companyName` to `name` before sending
- **Fix Applied**: Removed transformation, pass through as-is

### Issue 3: `locationSchema` field mismatch ✅ FIXED EARLIER
- **Location**: `lib/validation/vendorSchemas.ts`
- **Problem**: Used `name` instead of `locationName`
- **Fix Applied**: Changed to `locationName`, removed unused `state` field

---

## Files Modified

### 1. `lib/validation/vendor-update-schema.ts`
Added `slug` field validation:
```typescript
slug: z
  .string()
  .min(2, 'Slug must be at least 2 characters')
  .max(100, 'Slug must not exceed 100 characters')
  .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
  .optional(),
```

### 2. `app/(site)/vendor/dashboard/components/ProfileEditTabs.tsx`
Removed `companyName` → `name` transformation in `handleFormSave`

### 3. `lib/validation/vendorSchemas.ts`
Fixed `locationSchema`:
- Changed `name` → `locationName`
- Removed unused `state` field
- Made `latitude`/`longitude` optional

---

## Tests Added

### New Test File: `__tests__/integration/api-contract/form-to-api-field-mapping.test.ts`

**16 tests** including critical sync test:
```
CRITICAL: Context-to-API Field Sync
  ✓ should have all ALLOWED_UPDATE_FIELDS present in API schema
  ✓ should accept slug field (regression test)
  ✓ should validate slug format correctly
```

This test will **fail immediately** if any field is added to `ALLOWED_UPDATE_FIELDS` but not to the API schema.

---

## IMPORTANT: Next Steps to Verify Fix

### 1. Restart the dev server
The schema changes won't take effect until the server restarts:
```bash
npm run stop:dev
npm run dev
```

### 2. Check server console for debug logs
Debug logging has been added to `app/api/portal/vendors/[id]/route.ts`.

When you try to save, check the terminal running `npm run dev` for:
```
[VendorUpdate] Received body: { ... }
[VendorUpdate] Validation FAILED: { receivedFields: [...], errors: [...] }
```

This will show EXACTLY which field is failing validation and why.

### 3. Check what's actually being sent
In browser Network tab, check the PUT request payload to see the exact JSON being sent.

---

## Data Flow Reference

```
BasicInfoForm
    ↓ sends { companyName, slug, description, logo, contactEmail, contactPhone }
ProfileEditTabs.handleFormSave
    ↓ passes through as-is (no transformation)
VendorDashboardContext.saveVendor
    ↓ calls filterVendorPayload()
filterVendorPayload()
    ↓ filters by ALLOWED_UPDATE_FIELDS
    ↓ maps 'name' → 'companyName' (if present)
    ↓ removes undefined/null/empty values
API PUT /api/portal/vendors/[id]
    ↓ validates with safeValidateVendorUpdate(body)
    ↓ if fails → 400 "Invalid input data"
```

---

## Key Files to Check

| File | Purpose |
|------|---------|
| `lib/validation/vendor-update-schema.ts` | API validation schema - all accepted fields |
| `lib/context/VendorDashboardContext.tsx` | `ALLOWED_UPDATE_FIELDS` list (lines 13-41) |
| `app/api/portal/vendors/[id]/route.ts` | API endpoint - PUT handler |
| `components/dashboard/BasicInfoForm.tsx` | Form that sends the data |

---

## Potential Remaining Issues

1. **Server not restarted** - Schema changes need server restart
2. **`logo: undefined`** - May need to ensure undefined values are stripped from JSON
3. **Description too short** - Schema requires description but may have min length

---

## How to Verify Fix Works

1. Restart dev server
2. Go to vendor dashboard → Basic Info tab
3. Make a change (e.g., edit description)
4. Click Save
5. Should see 200 OK instead of 400

If still failing, check server console for the debug logs showing exact validation errors.

---

## Related Beads/Issues

- This was discovered during production deployment preparation
- No beads issue created yet - create one if fix doesn't work after restart
