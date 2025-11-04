# Vendor Tier Testing Strategy

**Date**: 2025-10-26
**Status**: ✅ COMPLETE - Security tests passing (7/7)

---

## Testing Philosophy

The tier system requires testing at **two levels**:

1. **Security Level**: Verify vendors cannot self-upgrade (fraud prevention)
2. **Display Level**: Verify tier-appropriate content shows correctly

---

## Test Suite 1: Security Tests ✅

**File**: `tests/e2e/vendor-tier-security.spec.ts`
**Status**: **7/7 PASSING**

### What It Tests

#### API Security (3 tests)
- ✅ Free tier vendor cannot upgrade to tier1 via API
- ✅ Tier1 vendor cannot upgrade to tier2 via API
- ✅ Tier3 vendor cannot downgrade to tier1 via API

**Result**: All attempts return `403 TIER_PERMISSION_DENIED`

#### UI Upgrade Prompts (2 tests)
- ✅ Free tier vendor sees upgrade prompts for tier1+ features
- ✅ Tier1 vendor sees upgrade prompts for tier2+ features

**Components Tested**:
- `TierUpgradePrompt.tsx` - Shows upgrade CTA
- `UpgradePromptCard.tsx` - Displays benefits and pricing

#### UI Tier Selection Restriction (2 tests)
- ✅ Vendor profile editor does not show tier dropdown
- ✅ Current tier is displayed read-only (not editable)

---

## Test Suite 2: Display Tests (In Progress)

**File**: `tests/e2e/vendor-profile-tiers.spec.ts`
**Status**: Needs fixing

### What It Tests

#### Tier-Based Content Display (6 tests)
1. Free tier: Only basic sections visible
2. Tier1: Extended sections (longDescription, certifications, etc.)
3. Tier2: Product showcase enabled
4. Tier3: Featured badge and editorial content
5. Mobile: Responsive display
6. Tablet: Responsive display

### Current Issues

Tests are failing because they expect content to be visible that isn't being rendered. The root causes:

1. **ISR Cache**: Tests update data but don't wait for cache revalidation
2. **Schema Mismatch**: `certifications` field expects array but tests send string
3. **Component Rendering**: Some tier-restricted content may not be displayed

---

## Testing Approach: Pre-Seeded Tiers

### Why This Approach?

**Business Rule**: Vendors cannot change their own tier (security)
**Testing Need**: Verify each tier level works correctly

**Solution**: Pre-seed test vendors at their correct tiers

### How It Works

1. **Vendor Creation** (`scripts/create-test-vendors.ts`):
```typescript
const tierMap = {
  'testvendor-free@test.com': 'free',
  'testvendor-tier1@test.com': 'tier1',
  'testvendor-tier2@test.com': 'tier2',
  'testvendor-tier3@test.com': 'tier3',
};
```

2. **Test Execution**:
- Login as specific tier vendor
- Update profile data (NOT tier)
- Verify tier-appropriate features display

3. **Validation**:
- Security tests verify tier cannot be changed
- Display tests verify content matches tier

---

## What Gets Tested

### Security (✅ Complete)
- ✅ API blocks tier changes by vendors
- ✅ UI doesn't expose tier editing
- ✅ Upgrade prompts guide users to sales contact

### Functionality (Partial)
- ⚠️ Tier-based feature access (needs fixing)
- ⚠️ Content rendering per tier (needs fixing)
- ⚠️ ISR cache invalidation (needs fixing)

---

## The Upgrade Path (User Flow)

### For Vendors
1. Vendor logs into dashboard
2. Tries to use tier-restricted feature
3. Sees `TierUpgradePrompt` or `UpgradePromptCard`
4. Clicks "Contact Sales" or "View Pricing"
5. Sales team manually upgrades vendor tier (admin action)

### For Admins (Not Yet Implemented)
**Future**: Create admin API endpoint to update vendor tiers
- `POST /api/admin/vendors/{id}/tier` (admin auth required)
- Bypasses tier validator
- Used for legitimate upgrades after sales contact

---

## Test Coverage Summary

| Test Category | Tests | Passing | Coverage |
|---|---|---|---|
| API Security | 3 | 3 | 100% |
| UI Upgrade Prompts | 2 | 2 | 100% |
| UI Tier Editing Prevention | 2 | 2 | 100% |
| **Security Total** | **7** | **7** | **100%** ✅ |
| Tier Display | 6 | 0 | 0% |
| ISR Revalidation | 0 | 0 | 0% |
| **Display Total** | **6** | **0** | **0%** ⚠️ |

---

## Key Insights

### What Works Well
1. **Security is solid**: Vendors cannot self-upgrade (fraud prevention)
2. **UI provides upgrade path**: `TierUpgradePrompt` components exist
3. **Pre-seeded approach**: Tests can verify each tier without breaking security

### What Needs Work
1. **Display tests**: Need to fix schema mismatches and rendering issues
2. **ISR validation**: Need to verify cache revalidation works correctly
3. **Admin tier management**: Need endpoint for legitimate tier changes

---

## Next Steps

### Immediate (Security - DONE ✅)
- ✅ Create vendor-tier-security.spec.ts
- ✅ Verify API blocks tier changes
- ✅ Verify UI doesn't expose tier editing
- ✅ Verify upgrade prompts display

### Short-term (Display Tests)
1. Fix `vendor-profile-tiers.spec.ts` failures
2. Fix certifications schema mismatch
3. Add ISR wait times to tests
4. Verify tier-restricted content renders

### Long-term (Admin Features)
1. Create admin API for tier management
2. Build admin UI for tier changes
3. Add audit log for tier changes
4. Create admin E2E tests

---

## Files Modified

**Test Files**:
- ✅ `tests/e2e/vendor-tier-security.spec.ts` - NEW (7 tests, all passing)
- ⚠️ `tests/e2e/vendor-profile-tiers.spec.ts` - EXISTING (6 tests, needs fixes)
- ✅ `tests/e2e/helpers/test-vendors.ts` - Updated (removed tier parameter)

**Seed Scripts**:
- ✅ `scripts/create-test-vendors.ts` - Pre-seeds vendors at correct tiers
- ✅ `scripts/reset-test-vendors.ts` - Deletes and recreates test vendors

**UI Components** (Already Exist):
- `components/dashboard/TierUpgradePrompt.tsx`
- `components/dashboard/UpgradePromptCard.tsx`

---

## Conclusion

**Security testing is COMPLETE and PASSING** ✅

The tier system correctly:
1. Prevents vendors from self-upgrading (fraud prevention)
2. Shows upgrade prompts when appropriate (user guidance)
3. Hides tier editing from vendor UI (security by design)

**Display testing needs work** but the **security foundation is solid**. The system is production-ready from a security perspective, with display tests providing additional confidence once fixed.
