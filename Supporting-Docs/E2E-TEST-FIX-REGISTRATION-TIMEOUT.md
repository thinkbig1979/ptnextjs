# Fix for E2E Test Registration Timeout Issue

## Problem Summary

Test `tests/e2e/vendor-onboarding/02-admin-approval.spec.ts:33:7` (Test 2.3: Pending vendor cannot login) is failing with:

```
Error: TimeoutError waiting for `/api/portal/vendors/register` response in `helpers/vendor-onboarding-helpers.ts:183`
```

## Root Cause Analysis

### Primary Issue: waitForResponse Filter Too Restrictive

The `registerVendor` helper function in `/home/edwin/development/ptnextjs/tests/e2e/helpers/vendor-onboarding-helpers.ts` (lines 183-187) only waits for successful responses (200 or 201):

```typescript
const apiResponsePromise = page.waitForResponse(
  (response) =>
    response.url().includes('/api/portal/vendors/register') &&
    (response.status() === 201 || response.status() === 200)
);
```

**Problem**: If the API returns ANY other status code (429 rate limit, 409 duplicate, 400 validation error, etc.), the `waitForResponse` will keep waiting indefinitely until it times out, even though the API did respond.

### Secondary Issue: Rate Limiting Not Disabled for Tests

The registration API (`/home/edwin/development/ptnextjs/app/api/portal/vendors/register/route.ts`) has rate limiting enabled:
- Limit: 3 requests per hour per IP
- Multiple tests register vendors, hitting this limit

The rate limit middleware (`/home/edwin/development/ptnextjs/lib/middleware/rateLimit.ts`) supports disabling via `DISABLE_RATE_LIMIT=true` environment variable, but this is not set in `.env`.

### Why Test 1.1 Works But Test 2.3 Fails

Test 1.1 in `01-registration.spec.ts` uses a different pattern:

```typescript
const [apiResponse] = await Promise.all([
  page.waitForResponse(
    (r) => r.url().includes('/api/portal/vendors/register') && r.status() < 300,
    { timeout: 10000 }
  ),
  page.click('button[type="submit"]')
]);
```

This works because:
1. Uses `Promise.all` to coordinate click and waitForResponse properly
2. Accepts ANY 2xx response (`r.status() < 300`)
3. Has an explicit timeout

## Solution

### Fix 1: Update registerVendor Helper Function

**File**: `/home/edwin/development/ptnextjs/tests/e2e/helpers/vendor-onboarding-helpers.ts`

**Lines to replace**: 182-198

**Current code**:
```typescript
  // Wait for API response
  const apiResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/portal/vendors/register') &&
      (response.status() === 201 || response.status() === 200)
  );

  await page.click('button[type="submit"]');

  const apiResponse = await apiResponsePromise;
  const responseBody = await apiResponse.json();

  if (!responseBody.success || !responseBody.data?.vendorId) {
    throw new Error(
      `Registration failed: ${JSON.stringify(responseBody)}`
    );
  }
```

**Replace with**:
```typescript
  // Wait for API response - using Promise.all to coordinate click and waitForResponse
  // Accept ANY status code to avoid timeout if API returns error (429, 409, etc.)
  const [apiResponse] = await Promise.all([
    page.waitForResponse(
      (response) => response.url().includes('/api/portal/vendors/register'),
      { timeout: 15000 }
    ),
    page.click('button[type="submit"]')
  ]);

  const responseBody = await apiResponse.json();

  // Check if registration was successful
  if (apiResponse.status() !== 200 && apiResponse.status() !== 201) {
    throw new Error(
      `Registration failed with status ${apiResponse.status()}: ${JSON.stringify(responseBody)}`
    );
  }

  if (!responseBody.success || !responseBody.data?.vendorId) {
    throw new Error(
      `Registration failed: ${JSON.stringify(responseBody)}`
    );
  }
```

**Key changes**:
1. Use `Promise.all` to properly coordinate button click and response waiting
2. Remove status code filter from `waitForResponse` - accept ANY response
3. Add explicit `{ timeout: 15000 }` option
4. Check status code explicitly AFTER receiving response
5. Provide better error message with actual status code

### Fix 2: Disable Rate Limiting for E2E Tests

**File**: `/home/edwin/development/ptnextjs/.env`

**Add these lines** after line 25 (after `DISABLE_EMAILS=true`):
```bash
# Disable rate limiting for E2E testing (prevents test failures from rate limits)
DISABLE_RATE_LIMIT=true
```

## Verification Steps

After applying the fixes:

1. Restart the development server to pick up the new environment variable:
   ```bash
   npm run stop:dev
   npm run dev
   ```

2. Run the failing test:
   ```bash
   npx playwright test tests/e2e/vendor-onboarding/02-admin-approval.spec.ts:33
   ```

3. Run all smoke tier tests to ensure no regressions:
   ```bash
   npx playwright test --grep "@smoke"
   ```

## Files Modified

1. `/home/edwin/development/ptnextjs/tests/e2e/helpers/vendor-onboarding-helpers.ts` - Fixed registerVendor function
2. `/home/edwin/development/ptnextjs/.env` - Added DISABLE_RATE_LIMIT=true

## Related Issues

- Similar pattern should be checked in other helper functions that use `waitForResponse`
- Consider adding rate limit disabling to test documentation/setup guides

## Technical Details

### Why Promise.all Matters

The original code had a race condition risk:
```typescript
const promise = page.waitForResponse(...);  // Start waiting
await page.click('button[type="submit"]');   // Then click
const response = await promise;              // Then await
```

While this often works, there's a theoretical race where the response could arrive before `waitForResponse` is set up. Using `Promise.all` ensures both operations start simultaneously:

```typescript
const [response] = await Promise.all([
  page.waitForResponse(...),  // Both start
  page.click(...)             // at the same time
]);
```

This is the pattern recommended by Playwright documentation and used in Test 1.1.

### Why Filtering by Status Code in waitForResponse is Problematic

When you filter by status code in `waitForResponse`:
```typescript
page.waitForResponse(r => r.url().includes('/api/...') && r.status() === 200)
```

If the API returns status 429 (rate limit) or 409 (duplicate), the response IS received but doesn't match the filter, so Playwright keeps waiting until timeout. This causes confusing "timeout" errors instead of clear "rate limit exceeded" or "duplicate entry" errors.

Better approach:
```typescript
page.waitForResponse(r => r.url().includes('/api/...'))  // Accept any response
// Then check status explicitly after receiving
```

This way you get the actual API error message immediately.
