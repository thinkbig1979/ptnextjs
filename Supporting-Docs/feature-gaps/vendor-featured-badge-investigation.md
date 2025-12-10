# Vendor Featured Badge - Test Investigation

**Date**: 2024-12-09
**Status**: ✅ RESOLVED
**Impact**: 1 E2E test failing (Test 10.4)
**Priority**: Medium
**Resolution Date**: 2024-12-09
**Root Cause**: INFRASTRUCTURE_ISSUE (server not running or port conflicts)

## Resolution Summary

The test passes when the server is running correctly on port 3000. The issue was NOT an application bug - both "Tier 3" and "Featured Vendor" badges are correctly rendered by the VendorHero component.

**Verified Working:**
- VendorHero correctly renders TierBadge when vendor.tier is set
- VendorHero correctly renders "Featured Vendor" badge when vendor.featured is true
- Seed API correctly stores both tier and featured fields
- Data service correctly transforms both fields

---

## Summary

Test 10.4 expects a Tier 3 vendor with `featured: true` to display either a "Tier 3" badge or "Featured Vendor" badge on their public profile. The test is failing because neither badge is visible.

---

## Test Details

**File**: `tests/e2e/vendor-onboarding/10-public-profile-display.spec.ts`
**Location**: Line 136

### Test Code

```typescript
test('Test 10.4: Tier 3 public profile shows featured badge', async ({ page }) => {
  const vendorData = createTestVendor({
    tier: 'tier3',
    status: 'approved',
    featured: true,
    description: 'Tier 3 featured enterprise vendor',
  });

  await seedVendors(page, [vendorData]);

  const slug = vendorData.companyName.toLowerCase().replace(/\s+/g, '-');
  await page.goto(`${BASE_URL}/vendors/${slug}/`);
  await page.waitForLoadState('networkidle');

  // Look for tier 3 / enterprise badge - TierBadge component renders "Tier 3"
  const tier3Badge = page.locator('text=/Tier.?3/i').first();
  const badgeVisible = await tier3Badge.isVisible({ timeout: 5000 }).catch(() => false);

  // Look for featured indicator - VendorHero renders "Featured Vendor"
  const featuredBadge = page.locator('text=/Featured Vendor/i').first();
  const featuredVisible = await featuredBadge.isVisible({ timeout: 5000 }).catch(() => false);

  // At least one of tier or featured badge should be visible
  expect(badgeVisible || featuredVisible).toBeTruthy();
});
```

---

## Component Analysis

### VendorHero Component

**File**: `components/vendors/VendorHero.tsx`

The component DOES have the logic to display both badges:

```tsx
{/* Badges Row */}
<div className="flex items-center flex-wrap gap-2 mb-4">
  {vendor.tier && <TierBadge tier={vendor.tier} size="md" showIcon={true} />}
  {vendor.category && <Badge variant="secondary">{vendor.category}</Badge>}
  {vendor.featured && (
    <Badge variant="default" className="bg-accent">
      Featured Vendor
    </Badge>
  )}
  {vendor.partner && (
    <Badge variant="default" className="bg-green-600">
      Partner
    </Badge>
  )}
</div>
```

### TierBadge Component

**File**: `components/vendors/TierBadge.tsx`

Should render "Tier 3" for tier3 vendors.

---

## Possible Root Causes

### 1. Data Not Reaching Component
The vendor data from the seed API may not include `tier` or `featured` fields when fetched for the public profile page.

**Check**: `app/(site)/vendors/[slug]/page.tsx` - how vendor data is fetched

### 2. Slug Mismatch
The test generates a slug from company name, but the seed API may generate a different slug.

**Test generates**: `vendorData.companyName.toLowerCase().replace(/\s+/g, '-')`
**Seed API generates**: May use different logic or add timestamp

### 3. Vendor Not Found
The public profile page may not find the vendor and show a 404 or empty page.

### 4. Data Transform Issue
The data service may not be transforming `tier` and `featured` fields correctly.

---

## Investigation Steps

1. **Check vendor slug generation** in seed API vs test expectation
2. **Verify vendor data** includes tier and featured when fetched
3. **Check public profile page** data fetching logic
4. **Run test with trace** to see what page actually renders:
   ```bash
   DISABLE_EMAILS=true npx playwright test tests/e2e/vendor-onboarding/10-public-profile-display.spec.ts:136 --trace=on
   ```
5. **Check test screenshot** in `test-results/` folder

---

## Quick Fix Attempt

If the issue is slug mismatch, the test could be updated to use the vendor ID or fetch the actual slug from the seed response.

If the issue is data not reaching component, check:
- `lib/payload-cms-data-service.ts` - vendor transform function
- `app/(site)/vendors/[slug]/page.tsx` - data fetching

---

## Related Files

| File | Purpose |
|------|---------|
| `tests/e2e/vendor-onboarding/10-public-profile-display.spec.ts` | Test file |
| `components/vendors/VendorHero.tsx` | Badge display logic |
| `components/vendors/TierBadge.tsx` | Tier badge component |
| `app/(site)/vendors/[slug]/page.tsx` | Public vendor profile page |
| `lib/payload-cms-data-service.ts` | Data fetching/transform |
| `app/api/test/vendors/seed/route.ts` | Vendor seed API |
