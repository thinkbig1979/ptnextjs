# Phase 3: Vendor Seeding Fixes

## Problem Identified

The E2E tests are failing with `Login failed: 401 - Invalid credentials` because of a **slug mismatch** between seeded vendors and what tests expect.

### Root Cause Analysis

1. **global-setup.ts** creates test vendors with company names like:
   - `"Tier 1 Test Vendor"`
   - `"Free Tier Test Vendor"`

2. **Seed API** (`/app/api/test/vendors/seed/route.ts`) auto-generates slugs:
   - `generateSlug("Tier 1 Test Vendor")` → `"tier-1-test-vendor"`
   - `generateSlug("Free Tier Test Vendor")` → `"free-tier-test-vendor"`

3. **test-vendors.ts** expects different slugs:
   - `"testvendor-tier1"`
   - `"testvendor-free"`

**Result**: Vendors are created successfully, but with wrong slugs. When tests try to login, they can't find the vendors because slugs don't match.

## Solution

### Fix 1: Update Seed API to Accept Optional Slug

**File**: `/home/edwin/development/ptnextjs/app/api/test/vendors/seed/route.ts`

**Changes**:

1. Add `slug?:string;` to `TestVendorInput` interface (line 15)
2. Use provided slug or generate it (line 106)
3. Add verbose logging to see what's happening during seed

**Critical Changes**:

```typescript
// BEFORE (line 13-34):
interface TestVendorInput {
  companyName: string;
  email: string;
  password: string;
  // ... rest of fields
}

// AFTER:
interface TestVendorInput {
  companyName: string;
  slug?: string; // Optional: if not provided, will be auto-generated from companyName
  email: string;
  password: string;
  // ... rest of fields
}
```

```typescript
// BEFORE (line 105-106):
        // Generate slug
        const slug = generateSlug(vendorData.companyName);

// AFTER:
        // Use provided slug or generate from company name
        const slug = vendorData.slug || generateSlug(vendorData.companyName);

        console.log(`[Vendor Seed] [${i + 1}/${vendors.length}] Creating: ${vendorData.email}`);
        console.log(`              Company: ${vendorData.companyName}`);
        console.log(`              Slug: ${slug}`);
        console.log(`              Tier: ${vendorData.tier || 'free'}`);
```

```typescript
// BEFORE (line 147-148):
        createdVendorIds.push(createdVendor.id as string);
      } catch (vendorError) {

// AFTER:
        createdVendorIds.push(createdVendor.id as string);
        console.log(`              ✓ Vendor created: ${createdVendor.id}\n`);
      } catch (vendorError) {
        const errorMessage = vendorError instanceof Error ? vendorError.message : 'Unknown error';
        errors[`vendor_${i}_${vendorData.companyName}`] = errorMessage;
        console.error(`              ✗ FAILED: ${errorMessage}\n`);
```

```typescript
// BEFORE (line 166-167):
    // Return response
    const hasErrors = Object.keys(errors).length > 0;

// AFTER:
    // Log summary
    console.log('\n========================================');
    console.log('  VENDOR SEED SUMMARY');
    console.log('========================================');
    console.log(`✓ Successfully created: ${createdVendorIds.length} vendors`);
    console.log(`✗ Failed: ${Object.keys(errors).length} vendors`);
    if (Object.keys(errors).length > 0) {
      console.log('\nErrors:');
      Object.entries(errors).forEach(([key, msg]) => {
        console.log(`  - ${key}: ${msg}`);
      });
    }
    console.log('========================================\n');

    // Return response
    const hasErrors = Object.keys(errors).length > 0;
```

### Fix 2: Update global-setup.ts to Provide Explicit Slugs

**File**: `/home/edwin/development/ptnextjs/tests/e2e/global-setup.ts`

**Changes**:

1. Add `slug` property to each test vendor matching test-vendors.ts expectations
2. Improve error logging to show exactly what's failing
3. Add login verification step

**Critical Changes**:

```typescript
// BEFORE (lines 20-69):
const STANDARD_TEST_VENDORS = [
  {
    companyName: 'Free Tier Test Vendor',
    email: 'testvendor-free@test.com',
    password: 'TestVendor123!Free',
    tier: 'free' as const,
    status: 'approved' as const,
    description: 'Free tier test vendor for E2E tests',
  },
  {
    companyName: 'Tier 1 Test Vendor',
    email: 'testvendor-tier1@test.com',
    password: 'TestVendor123!Tier1',
    tier: 'tier1' as const,
    status: 'approved' as const,
    description: 'Tier 1 test vendor for E2E tests',
  },
  // ... rest of vendors
];

// AFTER:
/**
 * Standard test vendors that will be seeded before tests run
 * These match the TEST_VENDORS from helpers/test-vendors.ts
 *
 * IMPORTANT: Slugs must match exactly what tests expect!
 */
const STANDARD_TEST_VENDORS = [
  {
    companyName: 'Free Tier Test Vendor',
    slug: 'testvendor-free', // EXPLICIT SLUG - must match test-vendors.ts
    email: 'testvendor-free@test.com',
    password: 'TestVendor123!Free',
    tier: 'free' as const,
    status: 'approved' as const,
    description: 'Free tier test vendor for E2E tests',
  },
  {
    companyName: 'Tier 1 Test Vendor',
    slug: 'testvendor-tier1', // EXPLICIT SLUG - must match test-vendors.ts
    email: 'testvendor-tier1@test.com',
    password: 'TestVendor123!Tier1',
    tier: 'tier1' as const,
    status: 'approved' as const,
    description: 'Tier 1 test vendor for E2E tests',
  },
  {
    companyName: 'Tier 2 Professional Vendor',
    slug: 'testvendor-tier2', // EXPLICIT SLUG
    email: 'testvendor-tier2@test.com',
    password: 'TestVendor123!Tier2',
    tier: 'tier2' as const,
    status: 'approved' as const,
    description: 'Tier 2 test vendor for E2E tests',
  },
  {
    companyName: 'Tier 3 Premium Vendor',
    slug: 'testvendor-tier3', // EXPLICIT SLUG
    email: 'testvendor-tier3@test.com',
    password: 'TestVendor123!Tier3',
    tier: 'tier3' as const,
    status: 'approved' as const,
    description: 'Tier 3 test vendor for E2E tests',
  },
  {
    companyName: 'Mobile Test Vendor',
    slug: 'testvendor-mobile', // EXPLICIT SLUG
    email: 'testvendor-mobile@test.com',
    password: 'TestVendor123!Mobile',
    tier: 'tier1' as const,
    status: 'approved' as const,
    description: 'Mobile test vendor for E2E tests',
  },
  {
    companyName: 'Tablet Test Vendor',
    slug: 'testvendor-tablet', // EXPLICIT SLUG
    email: 'testvendor-tablet@test.com',
    password: 'TestVendor123!Tablet',
    tier: 'tier1' as const,
    status: 'approved' as const,
    description: 'Tablet test vendor for E2E tests',
  },
];
```

```typescript
// Improve seedTestVendors function logging (lines 165-200):
async function seedTestVendors(baseURL: string): Promise<boolean> {
  try {
    console.log(`[Global Setup] Sending ${STANDARD_TEST_VENDORS.length} vendors to seed API...`);

    const response = await fetch(`${baseURL}/api/test/vendors/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(STANDARD_TEST_VENDORS),
    });

    const data = await response.json();

    // Log the response for debugging
    console.log(`[Global Setup] Seed API response status: ${response.status}`);
    console.log(`[Global Setup] Seed API response:`, JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      console.log(`[Global Setup] ✓ Successfully seeded ${data.count || data.vendorIds?.length || 0} vendors`);
      if (data.vendorIds) {
        console.log(`[Global Setup] Vendor IDs:`, data.vendorIds);
      }
      return true;
    }

    // Handle case where vendors already exist (not an error)
    if (data.errors) {
      const errorMessages = Object.values(data.errors) as string[];
      const allDuplicates = errorMessages.every(
        (msg: string) => msg.includes('duplicate') || msg.includes('already exists') || msg.includes('unique')
      );

      if (allDuplicates) {
        console.log('[Global Setup] ✓ Test vendors already exist (this is OK)');
        return true;
      }

      console.warn('[Global Setup] ⚠ Some vendor seeding errors:');
      Object.entries(data.errors).forEach(([key, msg]) => {
        console.warn(`  - ${key}: ${msg}`);
      });
    }

    // If we got here, check if at least some vendors were created
    if (data.count > 0) {
      console.log(`[Global Setup] ⚠ Partial success: ${data.count} vendors created despite errors`);
      return true;
    }

    console.error('[Global Setup] ✗ Vendor seeding failed');
    return false;
  } catch (error) {
    console.error('[Global Setup] ✗ Error seeding test vendors:', error);
    if (error instanceof Error) {
      console.error('[Global Setup] Error details:', error.message);
      console.error('[Global Setup] Stack:', error.stack);
    }
    return false;
  }
}
```

## Verification Steps

After applying these fixes:

1. **Clear database** (if using SQLite):
   ```bash
   rm -f payload.db
   ```

2. **Start dev server**:
   ```bash
   DISABLE_EMAILS=true npm run dev
   ```

3. **Watch the seed process**:
   - Global setup will log detailed vendor creation
   - Seed API will show each vendor being created with its slug
   - Summary will show success/failure counts

4. **Verify vendors exist with correct credentials**:
   ```bash
   # Test login for tier1 vendor
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"testvendor-tier1@test.com","password":"TestVendor123!Tier1"}'
   ```

5. **Run a simple test**:
   ```bash
   npx playwright test tests/e2e/computed-fields.spec.ts --headed
   ```

## Expected Output

### Global Setup (successful):
```
========================================
  PLAYWRIGHT GLOBAL SETUP
========================================
Base URL: http://localhost:3000

[Global Setup] Step 1: Checking server availability...
[Global Setup] Server is ready!

[Global Setup] Step 2: Clearing rate limits...
[Global Setup] Rate limits cleared successfully!

[Global Setup] Step 3: Seeding test vendors...
[Global Setup] Sending 6 vendors to seed API...

[Vendor Seed] Starting seed of 6 vendors...
[Vendor Seed] [1/6] Creating: testvendor-free@test.com
              Company: Free Tier Test Vendor
              Slug: testvendor-free
              Tier: free
              User created: 673a1b2c3d4e5f6g7h8i9j0k
              ✓ Vendor created: 123a4b5c6d7e8f9g0h1i2j3k

[Vendor Seed] [2/6] Creating: testvendor-tier1@test.com
              Company: Tier 1 Test Vendor
              Slug: testvendor-tier1
              Tier: tier1
              User created: 774a1b2c3d4e5f6g7h8i9j0k
              ✓ Vendor created: 224a4b5c6d7e8f9g0h1i2j3k

... (rest of vendors)

========================================
  VENDOR SEED SUMMARY
========================================
✓ Successfully created: 6 vendors
✗ Failed: 0 vendors
========================================

[Global Setup] ✓ Successfully seeded 6 vendors
[Global Setup] Test vendors seeded successfully!

========================================
  GLOBAL SETUP COMPLETE
========================================
```

### On subsequent runs (vendors already exist):
```
[Global Setup] ✓ Test vendors already exist (this is OK)
```

## Files Modified

1. `/home/edwin/development/ptnextjs/app/api/test/vendors/seed/route.ts`
   - Added optional `slug` parameter to TestVendorInput interface
   - Use provided slug instead of always auto-generating
   - Added comprehensive logging throughout seed process
   - Added summary logging at the end

2. `/home/edwin/development/ptnextjs/tests/e2e/global-setup.ts`
   - Added explicit `slug` property to all STANDARD_TEST_VENDORS
   - Slugs now match exactly what test-vendors.ts expects
   - Improved error logging in seedTestVendors function
   - Added detailed response logging for debugging

## Impact

- All 401 "Invalid credentials" errors should be resolved
- Tests will be able to login successfully
- Verbose logging will help debug any future seeding issues
- Slugs are now explicitly controlled, not auto-generated
