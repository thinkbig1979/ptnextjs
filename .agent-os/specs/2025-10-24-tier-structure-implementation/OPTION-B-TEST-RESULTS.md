# Option B Test Results

**Date**: 2025-10-25
**Status**: ISSUE IDENTIFIED - Tier Update Sequence Problem

## Summary

Successfully created all 6 test vendor accounts and ran the refactored E2E tests. Tests are failing due to a **tier validation logic issue**, not the refactoring approach.

## Vendor Creation: ✅ SUCCESS

All 6 test vendors created successfully:
```
✅ testvendor-free@test.com
✅ testvendor-tier1@test.com
✅ testvendor-tier2@test.com
✅ testvendor-tier3@test.com
✅ testvendor-mobile@test.com
✅ testvendor-tablet@test.com
```

## Test Results: ❌ ALL 6 FAILING

**Failure Reason**: Tier permission validation error

### Error Pattern

All tests fail with the same type of error:
```
Error: Update failed: 403 - {
  "success": false,
  "error": {
    "code": "TIER_PERMISSION_DENIED",
    "message": "Tier restriction violated",
    "details": "Fields website, foundedYear, longDescription, certifications are not accessible for free tier"
  }
}
```

### Root Cause Analysis

**The Problem**: Tests are trying to update both `tier` AND tier-restricted fields in a SINGLE request:

```typescript
await updateVendorData(page, vendorId, 'tier1', {
  companyName: 'Tier 1 Test Vendor',
  website: 'https://tier1.example.com',  // ❌ TIER 1+ ONLY
  foundedYear: 2010,                      // ❌ TIER 1+ ONLY
  certifications: '...',                  // ❌ TIER 1+ ONLY
});
```

When this request is sent:
1. Vendor is currently at `free` tier
2. API validates fields against CURRENT tier (`free`)
3. Fields like `website`, `foundedYear`, `certifications` are tier1+ only
4. Validation fails with `TIER_PERMISSION_DENIED`
5. **The `tier` field update never happens** because the whole request is rejected

### Why This Happens

The tier validation service (`TierValidationService`) validates fields based on the **vendor's current tier** in the database, NOT the tier being set in the update request.

**Validation Flow**:
```typescript
// In VendorProfileService.updateVendorProfile()
const vendor = await payload.findByID({ collection: 'vendors', id: vendorId });
const currentTier = vendor.tier || 'free';  // ← Uses CURRENT tier

// Validate fields against CURRENT tier (not new tier in request)
TierValidationService.validateFieldsAccess(updateData, currentTier, isAdmin);
```

## Solution Options

### Option 1: Two-Step Update (Recommended)
Update tier first, then update tier-restricted fields:

```typescript
// Step 1: Update tier only
await updateVendorData(page, vendorId, 'tier1', {});

// Step 2: Update tier-restricted fields
await updateVendorData(page, vendorId, 'tier1', {
  companyName: 'Tier 1 Test Vendor',
  website: 'https://tier1.example.com',
  foundedYear: 2010,
  certifications: '...',
});
```

### Option 2: Fix Validation Logic
Modify `VendorProfileService` to validate against the NEW tier if `tier` field is being updated:

```typescript
// In VendorProfileService.updateVendorProfile()
const tierToValidateAgainst = updateData.tier || vendor.tier || 'free';
TierValidationService.validateFieldsAccess(updateData, tierToValidateAgainst, isAdmin);
```

### Option 3: Admin Bypass
Create vendors with higher tiers from the start, or use admin credentials to bypass tier validation.

## Recommended Fix

**Implement Option 1** (two-step update) in the test helpers:

```typescript
export async function updateVendorData(
  page: any,
  vendorId: number,
  tier: 'free' | 'tier1' | 'tier2' | 'tier3',
  additionalData: Record<string, any> = {}
): Promise<any> {
  // Step 1: Update tier if changing from current tier
  if (tier !== 'free') {
    const tierResponse = await page.request.put(
      `${API_BASE}/api/portal/vendors/${vendorId}?byUserId=true`,
      { data: { tier } }
    );
    if (!tierResponse.ok()) {
      throw new Error(`Tier update failed: ${tierResponse.status()}`);
    }
  }

  // Step 2: Update other fields (if any)
  if (Object.keys(additionalData).length > 0) {
    const response = await page.request.put(
      `${API_BASE}/api/portal/vendors/${vendorId}?byUserId=true`,
      { data: additionalData }
    );
    if (!response.ok()) {
      throw new Error(`Data update failed: ${response.status()}`);
    }
    return await response.json();
  }
}
```

## Impact Assessment

- **Refactoring**: ✅ Working correctly (separate vendors eliminates state bleeding)
- **Vendor Creation**: ✅ All vendors created successfully
- **Tier Validation**: ❌ Blocking tests (needs two-step update)

## Next Steps

1. Update `updateVendorData()` helper to use two-step update approach
2. Re-run E2E tests
3. Verify all 6 tests pass

## Files to Modify

- `tests/e2e/helpers/test-vendors.ts` - Update `updateVendorData()` function

---

**Investigation Result**: Option B refactoring is correct. Issue is with tier validation logic requiring two-step updates.
