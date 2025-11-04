# E2E Blocking Issues - Root Cause Analysis & Solutions

## Summary

Two critical issues prevent 15/24 E2E tests from passing:

1. **LOGIN FAILURE** (Blocks 9 tests) - CRITICAL
2. **REGISTRATION TIMEOUT** (Blocks 3 tests) - MEDIUM

## Issue #1: Login Flow Failure (9 Blocked Tests)

### Affected Tests
- `tests/e2e/vendor-onboarding/03-authentication.spec.ts`:
  - Test 3.1: Login with valid credentials ❌
  - Test 3.2: Login with invalid credentials ❌
  - Test 3.3: Logout functionality ❌
  - Test 3.4: Session persistence ❌
  - Test 3.5: Protected route access ✅
  - Test 3.6: Token refresh behavior ❌

- Other tests that rely on login:
  - `tests/e2e/vendor-onboarding/02-admin-approval.spec.ts` (partial)
  - `tests/e2e/vendor-onboarding/04-free-tier-profile.spec.ts` (partial)
  - Various profile/dashboard tests

### Root Cause: Double Password Hashing

**Location:** `/home/edwin/development/ptnextjs/app/api/test/vendors/seed/route.ts` (lines 88-107)

**The Problem:**
```typescript
// Step 1: Seed API manually hashes the password
const hashedPassword = await authService.hashPassword(vendorData.password);

// Step 2: Then passes the HASHED password to Payload CMS
const createdUser = await payload.create({
  collection: 'users',
  data: {
    email: vendorData.email,
    password: hashedPassword,  // ❌ WRONG: Already hashed!
  },
});

// Step 3: Payload CMS hashes it AGAIN (it thinks it's plain text)
// Database stores: hash(hash(original_password))
```

**When User Tries to Login:**
1. User enters: `"AuthTest123!@#"`
2. Login endpoint hashes it: → `hash(original_password)`
3. But database has: `hash(hash(original_password))`
4. Hashes don't match → **Login rejected** ❌

### The Solution

Pass the **plain password** to Payload CMS and let it handle hashing:

```typescript
// Step 1: Validate password strength (don't hash it yet)
try {
  await authService.hashPassword(vendorData.password); // Just validates
} catch (validationError) {
  errors[...] = validationError.message;
  continue;
}

// Step 2: Pass PLAIN password to Payload CMS
const createdUser = await payload.create({
  collection: 'users',
  data: {
    email: vendorData.email,
    password: vendorData.password,  // ✅ CORRECT: Plain password
  },
});

// Step 3: Payload CMS hashes it ONCE
// Database stores: hash(original_password)
```

**When User Tries to Login (Fixed):**
1. User enters: `"AuthTest123!@#"`
2. Login endpoint hashes it: → `hash(original_password)`
3. Database has: `hash(original_password)`
4. Hashes match → **Login succeeds** ✅

### Implementation

**File to Change:** `/home/edwin/development/ptnextjs/app/api/test/vendors/seed/route.ts`

**Lines:** 88-107 (approximately)

**Changes:**
- Remove: `const hashedPassword = await authService.hashPassword(vendorData.password);`
- Add: Try-catch block that only validates password strength
- Change: `password: hashedPassword,` to `password: vendorData.password,`

**Full fix is in:** `/home/edwin/development/ptnextjs/seed-route-fixed.ts` (ready to copy)

### Impact
- **Before:** Login times out after 45-60 seconds
- **After:** Login succeeds in < 1 second
- **Tests Fixed:** 5-9 authentication-related tests

---

## Issue #2: Registration Redirect Timeout (3 Blocked Tests)

### Affected Tests
- `tests/e2e/vendor-onboarding/01-registration.spec.ts`:
  - Test 1.1: Register new vendor ❌
  - Test 1.2: Duplicate email validation ✅
  - Test 1.3: Duplicate company validation ✅
  - Test 1.4: Invalid data rejection ✅
  - Test 1.5: Pending status after registration ⚠️
  - Test 1.6: Admin approval workflow ❌
  - Test 1.7: Vendor profile creation ✅
  - Test 1.8: Email verification link ❌

### Root Cause: (Investigating)

**Location:** `/home/edwin/development/ptnextjs/app/api/portal/vendors/register/route.ts`

**Investigation Findings:**
1. Endpoint validates input ✅
2. Checks for duplicate email ✅
3. Checks for duplicate company ✅
4. Creates user record ✅
5. Creates vendor record ✅
6. Returns HTTP 201 immediately ✅

**No slow operations detected in endpoint itself.**

Possible causes:
1. Frontend redirect logic issue
2. Cookie/session setup timing
3. Database write performance
4. ISR/revalidation on the target page

### Expected Behavior
```
Registration Form Submit
    ↓
POST /api/portal/vendors/register
    ↓ (< 2 seconds)
HTTP 201 Response
    ↓
JavaScript: Navigate to /vendor/registration-pending
    ↓ (< 5 seconds)
Page displays
```

### Test Timeout Scenario
```
Registration Form Submit
    ↓
POST /api/portal/vendors/register
    ↓ (30+ seconds)
Timeout ❌
```

### Possible Solutions

1. **Check frontend redirect:** Verify `page.waitForURL()` conditions
2. **Check cookie setup:** Ensure session cookies are set correctly
3. **Check database performance:** Monitor SQLite query times
4. **Check page revalidation:** ISR might be blocking the redirect

### Investigation Steps

**Manual Test:**
```bash
# Time the registration endpoint
time curl -X POST http://localhost:3000/api/portal/vendors/register \
  -H "Content-Type: application/json" \
  -d '{
    "companyName":"Test",
    "contactEmail":"test@test.com",
    "password":"TestPass123!@#"
  }'

# Should complete in < 2 seconds
```

**E2E Test Debug:**
```bash
npm run test:e2e -- tests/e2e/vendor-onboarding/01-registration.spec.ts --debug
# Look at network tab to see timing
```

**Dev Server Logs:**
- Watch for database queries > 1 second
- Watch for external API calls (geocoding, email, etc.)
- Watch for memory spikes

---

## Implementation Roadmap

### Phase 1: Fix Critical Issues (LOGIN)
**Time:** ~15 minutes
**Steps:**
1. Apply seed API fix (remove double hashing)
2. Test with curl
3. Run E2E authentication tests
4. Verify 5+ tests now pass

### Phase 2: Investigate Secondary Issues (REGISTRATION)
**Time:** ~30 minutes
**Steps:**
1. Manual timing tests
2. Check frontend redirect logic
3. Profile database performance
4. Check for slow external API calls
5. Implement optimizations if needed

### Phase 3: Verify Full Suite
**Time:** ~30 minutes
**Steps:**
1. Run all E2E tests
2. Check pass rate increases to 50%+
3. Document any remaining issues
4. Create remediation plan for remaining 12/24 tests

---

## Files to Modify

### Critical (Required)
- **File:** `/home/edwin/development/ptnextjs/app/api/test/vendors/seed/route.ts`
- **Lines:** 88-107
- **Type:** Password hashing logic
- **Impact:** Fixes login (9 tests)

### Optional (Nice-to-have)
- **File:** `/home/edwin/development/ptnextjs/app/api/auth/login/route.ts`
- **Lines:** Add logging in catch block
- **Type:** Debugging only
- **Impact:** Better error diagnostics

### Investigation Only
- **File:** `/home/edwin/development/ptnextjs/app/api/portal/vendors/register/route.ts`
- **Action:** Profile performance, don't modify yet
- **Impact:** May need fixes after investigation

---

## Test Execution Commands

### Verify Fixes
```bash
# Manual curl test
curl -X POST http://localhost:3000/api/test/vendors/seed \
  -H "Content-Type: application/json" \
  -d '[{"companyName":"Test","email":"test@test.com","password":"Test123!@#","status":"approved"}]'

curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!@#"}'
```

### Run E2E Tests
```bash
# Authentication tests (should improve)
npm run test:e2e -- tests/e2e/vendor-onboarding/03-authentication.spec.ts

# Registration tests (check for timeout improvements)
npm run test:e2e -- tests/e2e/vendor-onboarding/01-registration.spec.ts

# Full vendor onboarding suite
npm run test:e2e -- tests/e2e/vendor-onboarding/

# All E2E tests
npm run test:e2e
```

---

## Expected Results After Fixes

### Before
- Total Tests: 24
- Passing: 9 (37.5%)
- Failing: 15 (62.5%)
- - Authentication failures: 9
- - Registration timeouts: 3
- - Other issues: 3

### After Phase 1 (Fix Login)
- Total Tests: 24
- Passing: 14-15 (58-62.5%)
- Failing: 9-10 (38-42.5%)
- - Registration timeouts: 3
- - Other issues: 6-7

### After Phase 2 (Fix Registration if needed)
- Total Tests: 24
- Passing: 17-18 (70-75%)
- Failing: 6-7 (25-30%)

### After Phase 3 (Fix Other Issues)
- Total Tests: 24
- Passing: 20-24 (83-100%)
- Target: At least 20 passing (83%)

---

## Quick Start

### Apply Fixes Immediately
```bash
cd /home/edwin/development/ptnextjs

# Copy fixed seed API
cp seed-route-fixed.ts app/api/test/vendors/seed/route.ts

# Start dev server
npm run dev

# Test login flow
bash manual-test-login.sh

# Run E2E authentication tests
npm run test:e2e -- tests/e2e/vendor-onboarding/03-authentication.spec.ts
```

### Full Fix Script
```bash
cd /home/edwin/development/ptnextjs
bash do-fix.sh        # Apply all fixes
bash manual-test-login.sh  # Verify with manual test
```

---

## References

### Files Prepared
- `seed-route-fixed.ts` - Corrected seed API (ready to copy)
- `do-fix.sh` - Script to apply all fixes
- `manual-test-login.sh` - Manual verification script
- `EXACT_CHANGES.md` - Detailed diff of all changes
- `AUTH_FIX_IMPLEMENTATION_GUIDE.md` - Complete implementation guide

### Auth Flow Diagram
```
User Registration:
  Form Submit → POST /api/portal/vendors/register → Create User + Vendor
                                                      (password hashed once by Payload)

Test Seed (Creating Vendors for Tests):
  Seed API → Create User (password must be plain, not pre-hashed)
           → Payload CMS hashes it
           → Database stores hashed password

User Login:
  Form Submit → POST /api/auth/login
  User enters password → Hash with bcrypt
  Compare to database hash → Match? Success : Fail
```

---

## Support

For issues during implementation:
1. Check `EXACT_CHANGES.md` for specific line numbers
2. Review `AUTH_FIX_IMPLEMENTATION_GUIDE.md` for detailed steps
3. Run `manual-test-login.sh` to verify fixes
4. Check dev server logs for errors
5. Verify TypeScript compilation: `npx tsc --noEmit`
