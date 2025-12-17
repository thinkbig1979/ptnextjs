# E2E Test Suite Stability Strategy

**Document Version:** 1.0
**Date:** December 14, 2025
**Scope:** Changes implemented December 12-14, 2025 (48-hour window)

---

## Executive Summary

Over a 48-hour period, we implemented a comprehensive set of changes to stabilize our E2E test infrastructure. These changes address five major categories of test failures: **server overload**, **test isolation**, **timing/race conditions**, **data seeding**, and **selector reliability**. The result is a more reliable, maintainable, and faster test suite.

---

## Problem Statement

Before these changes, the E2E test suite suffered from:

1. **Server Overload:** Unlimited parallel workers exhausted system resources
2. **Test Pollution:** Parallel tests sharing vendor accounts caused race conditions
3. **Timing Flakiness:** Hardcoded `waitForTimeout` calls were unreliable
4. **Missing Test Data:** Products page showed 0 items due to tier filtering
5. **Brittle Selectors:** Tests broke when UI changed due to implicit selectors
6. **Database Race Conditions:** Write-heavy tests conflicted when running in parallel

---

## Changes Implemented

### 1. Balanced Parallelism Configuration

**Commit:** `ee729de` - feat(e2e): stabilize E2E test infrastructure

**Problem:** Unlimited workers caused server resource exhaustion and ECONNRESET errors.

**Solution:** Configure optimal worker count based on environment.

```typescript
// playwright.config.ts
workers: isCI ? 4 : 3,  // Was: undefined (auto-detect)
```

**Why 3 workers locally:**
- Leaves headroom for dev server + OS on 8-core systems
- Prevents CPU/memory thrashing
- Reduces ECONNRESET network errors

**Additional:** Added `reuseExistingServer: true` to prevent multiple server instances.

```typescript
webServer: {
  command: 'DISABLE_EMAILS=true npm run dev',
  url: 'http://localhost:3000',
  reuseExistingServer: true,
  timeout: 120000,
},
```

---

### 2. Serial Mode for Write-Heavy Tests

**Commit:** `ee729de` - feat(e2e): stabilize E2E test infrastructure

**Problem:** Tests that modify shared state (vendor accounts, products) conflicted when running in parallel.

**Solution:** Mark 11 write-heavy test files with `test.describe.configure({ mode: 'serial' })`.

**Files configured for serial execution:**
| Test File | Reason |
|-----------|--------|
| `vendor-dashboard.spec.ts` | Modifies vendor profile |
| `vendor-registration-integration.spec.ts` | Creates new vendors |
| `vendor-review-submission.spec.ts` | Creates reviews |
| `product-review-submission.spec.ts` | Creates reviews |
| `excel-import-happy-path.spec.ts` | Bulk data import |
| `vendor-onboarding/01-registration.spec.ts` | Creates vendors |
| `vendor-onboarding/02-admin-approval.spec.ts` | Modifies vendor status |
| `vendor-onboarding/05-tier-upgrade.spec.ts` | Modifies tier |
| `vendor-onboarding/06-tier1-advanced-profile.spec.ts` | Modifies profile |
| `vendor-onboarding/07-tier2-locations.spec.ts` | Creates locations |
| `concurrent-updates.spec.ts` | Tests race conditions |
| `notifications/registration-email.spec.ts` | Tests email sending |

---

### 3. Per-Test Vendor Isolation (Unique Vendor Fixtures)

**Commits:**
- `ee729de` - Created `testWithUniqueVendor` fixture
- `7d9bba2` - Migrated 3 high-impact test files

**Problem:** Multiple parallel tests logging into the same vendor account caused:
- Session conflicts
- Data corruption
- Unpredictable test state

**Solution:** Created Playwright fixtures that provision unique vendors per test.

```typescript
// tests/e2e/fixtures/test-fixtures.ts
export const testWithUniqueVendor = base.extend<UniqueVendorFixture>({
  uniqueVendor: async ({ page }, use, testInfo) => {
    const vendor = await createUniqueTestVendor(page, testInfo, { tier: 'tier1' });
    await use(vendor);
    await vendor.cleanup();  // Automatic cleanup
  },
  uniqueVendorTier2: async ({ page }, use, testInfo) => { /* ... */ },
  uniqueVendorFree: async ({ page }, use, testInfo) => { /* ... */ },
});
```

**Benefits:**
- Each test gets an isolated vendor with unique email/slug
- Automatic cleanup after test completion
- No more parallel test conflicts
- Tests are fully independent

**Files migrated:**
- `vendor-dashboard.spec.ts`
- `dashboard-integration.spec.ts`
- `vendor-profile-tiers.spec.ts`

---

### 4. Comprehensive Health Check Endpoint

**Commit:** `ee729de` - feat(e2e): stabilize E2E test infrastructure

**Problem:** Tests started before database was ready, causing false failures.

**Solution:** Created `/api/test/health` endpoint for pre-test validation.

```typescript
// app/api/test/health/route.ts
interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  checks: {
    database: { ok: boolean; message: string };
    vendorsTable: { ok: boolean; count: number; message: string };
    productsTable: { ok: boolean; count: number; message: string };
    testEndpoints: { ok: boolean; message: string };
  };
  readyForTests: boolean;
}
```

**Integration:** Global setup now waits for health check before proceeding:

```typescript
// tests/e2e/global-setup.ts
const healthCheck = await checkHealth(baseURL, 30000);
if (!healthCheck.ready) {
  throw new Error(`Server health check failed:\n${healthCheck.details}`);
}
```

---

### 5. Proper Wait Utilities (Replacing waitForTimeout)

**Commit:** `ee729de` - feat(e2e): stabilize E2E test infrastructure

**Problem:** Hardcoded `page.waitForTimeout(2000)` calls were:
- Unreliable (sometimes too short, sometimes too long)
- Slow (always waited full duration even if ready sooner)
- Anti-pattern in Playwright

**Solution:** Created 5 semantic wait utilities:

```typescript
// tests/e2e/helpers/vendor-onboarding-helpers.ts

// 1. Wait for page navigation/reload
export async function waitForPageReady(page: Page, options?: { timeout?: number })

// 2. Wait for element to appear and stabilize
export async function waitForElementStable(page: Page, selector: string, options?: { timeout?: number; stable?: boolean })

// 3. Wait for form inputs to be editable
export async function waitForFormReady(page: Page, options?: { timeout?: number })

// 4. Wait for tab content after tab click
export async function waitForTabContent(page: Page, options?: { timeout?: number; checkFor?: string })

// 5. Wait for API response after form submission
export async function waitForApiResponse(page: Page, urlPattern: string | RegExp, options?: { timeout?: number; method?: string })
```

**Usage example:**
```typescript
// Before (bad)
await page.waitForTimeout(2000);

// After (good)
await waitForPageReady(page);
```

---

### 6. Test Data Seeding (Products for Tier2+ Vendors)

**Commit:** `0d65f2f` - fix(e2e): seed tier2+ products and fix review tests

**Problem:** Products page showed 0 products because `getAllProducts()` filters to tier2+ vendors only, and no tier2+ products existed.

**Solution:** Added automatic product seeding in global setup.

```typescript
// tests/e2e/global-setup.ts
const STANDARD_TEST_PRODUCTS = [
  { name: 'Professional Marine Navigation System', vendorSlug: 'testvendor-tier2', slug: 'tier2-nav-system' },
  { name: 'Yacht Communication Suite', vendorSlug: 'testvendor-tier2', slug: 'tier2-comm-suite' },
  { name: 'Marine Entertainment System', vendorSlug: 'testvendor-tier2', slug: 'tier2-entertainment' },
  { name: 'Premium Yacht Control System', vendorSlug: 'testvendor-tier3', slug: 'tier3-control-system' },
  { name: 'Luxury Interior Lighting Package', vendorSlug: 'testvendor-tier3', slug: 'tier3-lighting' },
];
```

**Also fixed:** Updated review tests to use seeded products/vendors:
- `product-review-modal-fix.spec.ts` - uses `tier2-nav-system`
- `vendor-review-submission.spec.ts` - uses `testvendor-tier2`
- `verify-product-reviews-display.spec.ts` - uses `tier2-nav-system`

---

### 7. Transaction Settlement Delay

**Commit:** `ee729de` - feat(e2e): stabilize E2E test infrastructure

**Problem:** Product seeding failed because vendor records weren't fully committed when product creation started.

**Solution:** Added 500ms delay between vendor and product seeding.

```typescript
// tests/e2e/global-setup.ts
console.log('[Global Setup] Step 3.5: Waiting for vendor transactions to settle...');
await new Promise((resolve) => setTimeout(resolve, 500));
```

**Also added:** Vendor existence verification with retry logic in product seed endpoint.

---

### 8. Geocode Mock Enhancement

**Commit:** `d4cf03e` - fix(e2e): fix location search tests and add missing test IDs

**Problem:** Geocode mock only intercepted external Photon API, but tests hit local `/api/geocode` endpoint.

**Solution:** Extended mock to intercept both endpoints:

```typescript
// tests/e2e/helpers/geocode-mock-helpers.ts
// Now intercepts:
// - External: https://photon.komoot.io/*
// - Local: /api/geocode (which proxies to Photon)
```

---

### 9. Data-TestID Standardization

**Commit:** `d4cf03e` - fix(e2e): fix location search tests and add missing test IDs

**Problem:** Tests used implicit selectors that broke when UI changed.

**Solution:** Added explicit `data-testid` attributes and standardized selectors:

```typescript
// tests/e2e/fixtures/test-fixtures.ts
export const LOCATION_SELECTORS = {
  locationTab: '[data-testid="search-tab-location"]',
  nameTab: '[data-testid="search-tab-name"]',
  locationInput: '[data-testid="location-search-input"]',
  resultsDropdown: '[data-testid="location-results-dropdown"]',
  resultItem: (index: number) => `[data-testid="location-result-${index}"]`,
  searchButton: '[data-testid="search-location-button"]',
  resultCount: '[data-testid="result-count"]',
  resetButton: '[data-testid="reset-button"]',
  distanceSlider: '[data-testid="distance-slider"]',
  distanceValue: '[data-testid="distance-value"]',
};
```

**Components updated:**
- `app/(site)/components/vendors-client.tsx` - added `data-testid="result-count"`
- `components/VendorSearchBar.tsx` - added `data-testid="distance-value"`, standardized reset button

---

### 10. API Path and Assertion Fixes

**Commits:**
- `2e6a7c2` - fix(e2e): fix api-errors test suite
- `08771ea` - fix(e2e): fix Data Integrity tests
- `502bacd` - fix(e2e): fix computed-fields tests

**Issues fixed:**

| Test File | Issue | Fix |
|-----------|-------|-----|
| `auth-boundary.spec.ts` | Used vendorId+1000 for "other vendor" | Use actual second vendor ID |
| `validation-errors.spec.ts` | Wrong API paths | Fixed to `/api/tier-requests`, `/api/products`, `/api/locations` |
| `concurrent-updates.spec.ts` | Wrong parameter usage | Fixed `byUserId` usage |
| `foreign-key-constraints.spec.ts` | Used authenticated endpoint for public data | Use `/api/vendors` public API |
| `computed-fields.spec.ts` | ISR cache timing | Added `navigateToFreshVendorPage()` with API verification |

---

## Results Summary

### Before Changes
- **135 failing tests** out of ~612 total
- Frequent ECONNRESET errors
- Flaky location search tests
- Products page tests failing (0 products)
- Race conditions in vendor dashboard tests

### After Changes
- **Location search tests:** 43/43 passing (was 0/43)
- **API errors tests:** 42/42 passing
- **Data integrity tests:** Fixed
- **Computed fields tests:** 9/9 passing
- Significantly reduced flakiness
- Faster test execution (proper waits vs hardcoded delays)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        E2E Test Execution                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐  │
│  │ Global Setup │───▶│ Health Check │───▶│ Seed Vendors/Products│  │
│  └──────────────┘    └──────────────┘    └──────────────────────┘  │
│                             │                                       │
│                             ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Playwright Workers (3)                    │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │                                                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │   │
│  │  │  Worker 1   │  │  Worker 2   │  │     Worker 3        │  │   │
│  │  │ (Parallel)  │  │ (Parallel)  │  │ (Serial for writes) │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘  │   │
│  │                                                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                             │                                       │
│                             ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     Test Fixtures                            │   │
│  ├─────────────────────────────────────────────────────────────┤   │
│  │  • testWithGeocode     - Mocks geocoding API                 │   │
│  │  • testWithEmail       - Mocks email sending                 │   │
│  │  • testWithUniqueVendor - Per-test vendor isolation          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Best Practices Established

### 1. Prefer Fixtures Over Setup/Teardown
```typescript
// Use this:
testWithUniqueVendor('test name', async ({ page, uniqueVendor }) => { ... });

// Not this:
test.beforeEach(async () => { /* manual vendor creation */ });
```

### 2. Use Semantic Waits
```typescript
// Use this:
await waitForPageReady(page);
await waitForApiResponse(page, '/api/vendors');

// Not this:
await page.waitForTimeout(2000);
```

### 3. Use Data-TestID Selectors
```typescript
// Use this:
await page.click('[data-testid="submit-button"]');

// Not this:
await page.click('button:has-text("Submit")');
```

### 4. Mark Write-Heavy Tests as Serial
```typescript
test.describe.configure({ mode: 'serial' });
```

### 5. Verify API Before UI
```typescript
// First verify via API (source of truth)
const apiResponse = await page.request.get('/api/public/vendors/slug');
expect(apiResponse.ok()).toBeTruthy();

// Then check UI
await expect(page.locator('[data-testid="vendor-name"]')).toBeVisible();
```

---

## Future Recommendations

1. **Production Build Testing:** Consider running full suite against production build for 2-5x faster page loads
2. **Test Sharding in CI:** Use Playwright's `--shard` flag for parallel CI runs
3. **Quarantine Flaky Tests:** Use the existing tier system to quarantine problematic tests
4. **Visual Regression:** Add screenshot comparisons for UI-critical tests

---

## Commit Reference

| Commit | Description |
|--------|-------------|
| `ee729de` | Stabilize E2E test infrastructure (major) |
| `7d9bba2` | Migrate 3 test files to unique vendor fixtures |
| `d4cf03e` | Fix location search tests and add missing test IDs |
| `0d65f2f` | Seed tier2+ products and fix review tests |
| `2e6a7c2` | Fix api-errors test suite |
| `08771ea` | Fix Data Integrity tests |
| `502bacd` | Fix computed-fields tests |
| `5327273`, `e41f986`, `7763a06` | Location search selector fixes |
| `aa7a775` | Add admin DELETE route for cleanup |

---

*Document generated: December 14, 2025*
