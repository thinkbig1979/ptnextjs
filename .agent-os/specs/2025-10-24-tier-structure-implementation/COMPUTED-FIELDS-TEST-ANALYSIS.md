# Computed Fields Test Analysis - Founded Year Display Issue

## Test Results Summary (October 26, 2025)

### Status: 5-7 tests FAILING

```
Running 8 tests using 4 workers

✓ 1-4 passed
✘ 5-7 failed

Time: ~1.5 minutes
```

## Failing Tests

1. **should compute years in business correctly for foundedYear 2010**
   - Expected: "15 years" badge visible
   - Actual: Element not found
   - Error: `locator('text=/15 years/i')` - element(s) not found

2. **should handle null foundedYear gracefully**
   - Expected: NO years badge when foundedYear is null
   - Actual: Years badge IS visible (shows old cached value)
   - Error: Badge should not be visible but is

3. **should handle edge case foundedYear 1800 correctly**
   - Expected: "225 years" badge visible
   - Actual: Element not found

4. **should update computed field immediately after foundedYear change**
   - Expected: Badge updates from "15 years" to "20 years"
   - Actual: Initial badge not found

5. **should display years in business on vendor card in listing**
   - Expected: Vendor card visible on `/vendors` page
   - Actual: Vendor card not found

## Validation Tests (Working Correctly)

1. **should handle future year (2030) as invalid**
   - API correctly rejects: `{"foundedYear":"Year cannot be in the future"}`
   - ✅ Validation working

2. **should handle year below minimum (1799) as invalid**
   - API correctly rejects: `{"foundedYear":"Year must be after 1800"}`
   - ✅ Validation working

## Root Cause Analysis

### What's Working ✅

1. **API Validation** - Input validation correctly rejects invalid years
2. **Component Code** - `YearsInBusinessDisplay` component logic is correct
3. **Cache Clearing** - `clearVendorCache()` now clears ALL vendor keys
4. **ISR Config** - Changed to `dynamic: 'auto'` to allow revalidation
5. **Data Transform** - `transformPayloadVendor()` includes `foundedYear` field (line 291)

### What's NOT Working ❌

1. **Field Not Displaying** - `foundedYear` value not reaching the public profile page
2. **Null Handling** - Setting foundedYear to null doesn't hide the badge (cache issue)
3. **Vendor Listing** - Test vendors not appearing on listing page

## Technical Investigation

### Data Flow Chain

```
User Update → API Endpoint → Database → Cache Clear → ISR Revalidate → Page Render → Component Display
                   ↓              ↓            ↓             ↓              ↓              ↓
               PATCH /api/    vendors       clearVendor   revalidate   getVendorBySlug   VendorHero
                 portal       table          Cache()       Path()                         Component
```

### Verified Components

1. **VendorHero.tsx** (line 47-49)
   ```tsx
   {vendor.foundedYear && (
     <YearsInBusinessDisplay foundedYear={vendor.foundedYear} variant="badge" />
   )}
   ```
   - Correctly conditionally renders based on `vendor.foundedYear`

2. **YearsInBusinessDisplay.tsx**
   ```tsx
   export function computeYearsInBusiness(foundedYear?: number | null): number | null {
     if (!foundedYear || foundedYear < 1800 || foundedYear > new Date().getFullYear()) {
       return null;
     }
     return new Date().getFullYear() - foundedYear;
   }
   ```
   - Correct validation and computation logic

3. **PayloadCMSDataService.transformPayloadVendor()** (line 291)
   ```tsx
   foundedYear: doc.foundedYear,
   ```
   - Field is included in the transform

### Suspected Issues

#### Issue #1: Database Schema

**Hypothesis**: The `foundedYear` column might not exist in the Payload CMS vendors collection schema.

**Check**:
```bash
sqlite3 cms-db.sqlite "PRAGMA table_info(vendors);" | grep foundedYear
```

#### Issue #2: API Endpoint Not Saving

**Hypothesis**: The PATCH `/api/portal/vendors/[id]` route might not be persisting the `foundedYear` field to the database.

**Check**: Review `app/api/portal/vendors/[id]/route.ts` to ensure `foundedYear` is in the allowed fields list.

#### Issue #3: Cache Not Being Cleared Server-Side

**Hypothesis**: Even though `clearVendorCache()` is called, the Next.js page cache might not be revalidating.

**Evidence**:
- Debug logs show: `🗑️  Clearing vendor cache for vendor ID: 1`
- But page still shows old data or no data

## Recommended Next Steps

### Step 1: Verify Database Schema

Check if `foundedYear` column exists in the `vendors` table:

```bash
sqlite3 cms-db.sqlite ".schema vendors"
```

Look for:
```sql
"foundedYear" integer
```

### Step 2: Verify API Endpoint Saves Field

Check `app/api/portal/vendors/[id]/route.ts` to ensure `foundedYear` is in the update payload.

### Step 3: Add Server-Side Logging

Add console.logs in:
- `app/(site)/vendors/[slug]/page.tsx` line 147-151 (already has debug logs)
- Check what `vendor.foundedYear` value is when page renders

### Step 4: Manual Test

1. Update vendor via Payload CMS admin at `/admin`
2. Set foundedYear to 2010
3. Navigate to public profile
4. Check if years display

### Step 5: Check Payload CMS Collection Schema

Review `payload/collections/Vendors.ts` to ensure `foundedYear` field is defined:

```typescript
{
  name: 'foundedYear',
  type: 'number',
  min: 1800,
  max: () => new Date().getFullYear(),
}
```

## Cache Clearing Fixes Applied

### Fix #1: clearVendorCache() - ALL Keys Cleared

**File**: `lib/payload-cms-data-service.ts` line 1233

```typescript
clearVendorCache(vendorId: number, slug?: string): void {
  const keys = [
    `vendor:${vendorId}`,
    `vendor:slug:${slug}`,
    `vendor:user:${vendorId}`,
    'vendors:all',
  ];

  keys.forEach(key => {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      console.log(`🗑️  Cleared cache key: ${key}`);
    }
  });

  // Also clear any vendor-specific keys that match the pattern
  for (const [key] of this.cache) {
    if (key.includes(`vendor:${vendorId}`) || (slug && key.includes(slug))) {
      this.cache.delete(key);
      console.log(`🗑️  Cleared related cache key: ${key}`);
    }
  }

  console.log(`✅ Vendor cache cleared for vendor ${vendorId}`);
}
```

### Fix #2: ISR Configuration

**File**: `app/(site)/vendors/[slug]/page.tsx` line 33

Changed from:
```typescript
export const dynamic = 'force-static';
```

To:
```typescript
export const dynamic = 'auto';
```

This allows `revalidatePath()` to work properly.

### Fix #3: revalidatePath() Called

**File**: `app/api/portal/vendors/[id]/route.ts`

```typescript
import { revalidatePath } from 'next/cache';

// After successful update:
revalidatePath(`/vendors/${vendor.slug}`);
revalidatePath('/vendors');
```

## Test Helper Improvements

### navigateToFreshVendorPage()

**File**: `tests/e2e/helpers/test-vendors.ts` line 288

```typescript
export async function navigateToFreshVendorPage(page: any, vendorSlug: string): Promise<void> {
  const timestamp = Date.now();
  const url = `${API_BASE}/vendors/${vendorSlug}?_t=${timestamp}`;

  console.log(`[Navigate] Loading fresh vendor page: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle' });

  // Force reload to bypass any client-side cache
  await page.reload({ waitUntil: 'networkidle' });

  console.log(`[Navigate] ✓ Page loaded and reloaded`);
}
```

## Conclusion

The cache clearing and ISR configuration fixes are correct and necessary, but the fundamental issue is that **the `foundedYear` field is not being populated in the vendor data** when the public profile page renders.

The next investigation should focus on:

1. Verifying the database schema includes `foundedYear`
2. Confirming the API endpoint saves `foundedYear` to the database
3. Checking server-side logs to see what data is actually being passed to the VendorHero component

The tests are correctly written and the component logic is sound - the issue is in the data pipeline somewhere between the database and the component.
