# E2E Test Failure Analysis

**Date**: 2025-12-08
**Branch**: `auth-security-enhancements`
**Test Run**: Partial (119 tests ran before stopped, 20 passed, 99 failed)

## Summary of Failure Categories

Based on analysis of `/tmp/playwright-port-fix-results.txt`, failures fall into **5 main categories**:

---

## Category 1: Admin Panel 500 Errors (CRITICAL - Infrastructure)

**Root Cause**: Missing `.next/server/pages/_document.js`
```
ENOENT: no such file or directory, open '/home/edwin/development/ptnextjs/.next/server/pages/_document.js'
```

**Affected Tests**:
- `admin-login-visual.spec.ts` (all tests)
- `admin-panel.spec.ts` (most tests)
- `dual-auth-system.spec.ts` (admin-related tests)

**Fix**: Run `npm run build` or restart dev server to regenerate `.next` folder

---

## Category 2: Test Vendor Credentials Invalid (CRITICAL - Test Data)

**Root Cause**: Test vendors don't exist in database or have wrong passwords
```
Login failed: 401 - {"error":"Invalid credentials"}
```

**Affected Tests**:
- `computed-fields.spec.ts` (all tests)
- `certifications-awards-manager.spec.ts` (all tests)
- `dashboard-integration.spec.ts` (all tests)
- `comprehensive-form-save-test.spec.ts`
- Any test using `testvendor-tier1@test.com`

**Fix**: Need to seed test vendors before running tests. Use:
```bash
curl -X POST http://localhost:3000/api/test/vendors/seed \
  -H "Content-Type: application/json" \
  -d '[
    {"companyName":"Tier 1 Test Vendor","email":"testvendor-tier1@test.com","password":"TestVendor123!Tier1","tier":"tier1","status":"approved"},
    {"companyName":"Tier 2 Professional Vendor","email":"testvendor-tier2@test.com","password":"TestVendor123!Tier2","tier":"tier2","status":"approved"},
    {"companyName":"Tier 3 Premium Vendor","email":"testvendor-tier3@test.com","password":"TestVendor123!Tier3","tier":"tier3","status":"approved"},
    {"companyName":"Free Tier Test Vendor","email":"testvendor-free@test.com","password":"TestVendor123!Free","tier":"free","status":"approved"}
  ]'
```

---

## Category 3: Rate Limiting (MAJOR - Test Infrastructure)

**Root Cause**: Tests hit the 5 requests/15 minutes login rate limit
```
RATE_LIMIT_EXCEEDED - Too many requests. Please try again later.
```

**Affected Tests**: Any test that runs after ~5 login attempts

**Fix Options**:
1. **Quick fix**: Clear rate limits between test files
   ```bash
   curl -X POST http://localhost:3000/api/test/rate-limit/clear
   ```
2. **Better fix**: Add rate limit clearing to Playwright global setup or beforeEach hooks
3. **Best fix**: Disable rate limiting in test environment via env variable

---

## Category 4: Seed API Validation Errors (MODERATE)

**Root Cause**: Seed API requires valid slug format
```
Vendor seed API failed: 400 - {"errors":{"vendor_0_Example Vendor":"The following field is invalid: slug"}}
```

**Affected Tests**:
- `example-seed-api-usage.spec.ts`
- Tests that create vendors with spaces in names

**Fix**: Ensure seed API auto-generates valid slugs (it does, but slug validation may be stricter)

---

## Category 5: Auth Test Expectations (MODERATE)

**Root Cause**: Tests expect specific API responses that don't match implementation
```
Expected: 401, Received: different status
```

**Affected Tests**:
- `auth-security-enhancements.spec.ts` (some tests)

**Fix**: Review and align test expectations with actual API behavior

---

## Recommended Fix Order

### Phase 1: Infrastructure (Do First)
1. Delete `.next` folder and restart dev server OR run `npm run build`
2. Create a Playwright global setup to seed test vendors automatically

### Phase 2: Rate Limiting
1. Add `beforeAll` hook in test fixtures to clear rate limits
2. OR create env variable `DISABLE_RATE_LIMIT=true` for test environment

### Phase 3: Test Data
1. Create script to seed all required test vendors
2. Add to Playwright global setup

### Phase 4: Individual Test Fixes
1. Fix auth test expectations
2. Fix seed API validation tests

---

## Files to Create/Modify

### 1. Create: `tests/e2e/global-setup.ts`
```typescript
import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use?.baseURL || 'http://localhost:3000';
  
  // Clear rate limits
  await fetch(`${baseURL}/api/test/rate-limit/clear`, { method: 'POST' });
  
  // Seed test vendors
  await fetch(`${baseURL}/api/test/vendors/seed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([
      {companyName:'Tier 1 Test Vendor',email:'testvendor-tier1@test.com',password:'TestVendor123!Tier1',tier:'tier1',status:'approved'},
      // ... more vendors
    ])
  });
}

export default globalSetup;
```

### 2. Modify: `playwright.config.ts`
Add:
```typescript
globalSetup: require.resolve('./tests/e2e/global-setup.ts'),
```

### 3. Create: `tests/e2e/fixtures/auth.fixture.ts`
Custom fixture that clears rate limits before each test file

---

## Commands for Next Session

```bash
# 1. Check if dev server is running
lsof -ti :3000

# 2. Kill and restart with clean .next
lsof -ti :3000 | xargs -r kill -9
rm -rf .next
DISABLE_EMAILS=true npm run dev &
sleep 15

# 3. Clear rate limits
curl -X POST http://localhost:3000/api/test/rate-limit/clear

# 4. Seed test vendors
curl -X POST http://localhost:3000/api/test/vendors/seed \
  -H "Content-Type: application/json" \
  -d '[{"companyName":"Tier 1 Test Vendor","email":"testvendor-tier1@test.com","password":"TestVendor123!Tier1","tier":"tier1","status":"approved"}]'

# 5. Run tests
npx playwright test --reporter=list 2>&1 | tee /tmp/playwright-results.txt
```

---

## Raw Error Logs Location

Full test output saved at: `/tmp/playwright-port-fix-results.txt`
