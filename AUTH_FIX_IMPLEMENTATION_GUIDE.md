# Authentication Fixes - Implementation Guide

## Executive Summary

Two critical issues preventing E2E tests from passing:

1. **LOGIN FAILURE** - Seeded vendors cannot log in (blocks 9/24 tests)
2. **REGISTRATION TIMEOUT** - Possible slowness in registration endpoint (blocks 3/24 tests)

## Root Cause Analysis

### Issue #1: Login Failure - Double Password Hashing

**File:** `/home/edwin/development/ptnextjs/app/api/test/vendors/seed/route.ts` (line ~95)

**Problem:**
```typescript
// WRONG - Double hashing!
const hashedPassword = await authService.hashPassword(vendorData.password);
const createdUser = await payload.create({
  collection: 'users',
  data: {
    password: hashedPassword,  // Payload CMS hashes this AGAIN
  },
});
```

When user logs in:
- Login sends plain password: "AuthTest123!@#"
- App hashes it with bcrypt: → "hash1"
- Database has: "hash(hash1)" (double-hashed)
- Comparison fails → Login rejects

**Solution:**
Pass plain password to Payload CMS - let it handle hashing:

```typescript
// CORRECT - Let Payload CMS handle hashing
try {
  await authService.hashPassword(vendorData.password); // Validates only
} catch (validationError) {
  // ... handle error
}

const createdUser = await payload.create({
  collection: 'users',
  data: {
    password: vendorData.password,  // Plain password, Payload CMS hashes it
  },
});
```

### Issue #2: Registration Timeout

**File:** `/home/edwin/development/ptnextjs/app/api/portal/vendors/register/route.ts`

**Investigation:** The endpoint returns immediately with status 201 after:
1. Validating input
2. Checking for duplicates
3. Creating user
4. Creating vendor

No slow blocking operations detected. This may be a test infrastructure issue rather than an endpoint issue.

## Implementation Steps

### Step 1: Apply Fixes

Run the fix script:

```bash
cd /home/edwin/development/ptnextjs
bash do-fix.sh
```

This will:
- Copy the corrected seed API (removes double hashing)
- Update login endpoint (adds debugging)

### Step 2: Verify Fixes

**Manual Test:**

```bash
# Test 1: Create vendor via seed
curl -X POST http://localhost:3000/api/test/vendors/seed \
  -H "Content-Type: application/json" \
  -d '[{
    "companyName":"Auth Test",
    "email":"authtest@example.com",
    "password":"AuthTest123!@#",
    "tier":"free",
    "status":"approved"
  }]'

# Expected: {"success":true,"vendorIds":["..."],"count":1}

# Test 2: Login with same credentials
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"authtest@example.com",
    "password":"AuthTest123!@#"
  }'

# Expected: {"user":{"id":"...","email":"authtest@example.com",...},"message":"Login successful"}
```

Or use the automated script:

```bash
bash manual-test-login.sh
```

### Step 3: Run E2E Tests

```bash
# Test authentication flow
npm run test:e2e -- tests/e2e/vendor-onboarding/03-authentication.spec.ts

# Expected: 3.1, 3.2, 3.3, 3.4 tests should now PASS

# Test registration flow
npm run test:e2e -- tests/e2e/vendor-onboarding/01-registration.spec.ts

# Check for improvement in tests 1.1, 1.6, 1.8
```

## Files Changed

### 1. `/home/edwin/development/ptnextjs/app/api/test/vendors/seed/route.ts`

**Change:** Remove double password hashing

Lines to modify: ~88-107

From:
```typescript
const hashedPassword = await authService.hashPassword(vendorData.password);
// ...
const createdUser = await payload.create({
  collection: 'users',
  data: {
    password: hashedPassword,
```

To:
```typescript
try {
  await authService.hashPassword(vendorData.password);
} catch (validationError) {
  errors[`vendor_${i}_${vendorData.companyName}`] = validationError instanceof Error ? validationError.message : 'Invalid password';
  continue;
}
// ...
const createdUser = await payload.create({
  collection: 'users',
  data: {
    password: vendorData.password,  // Plain password
```

### 2. `/home/edwin/development/ptnextjs/app/api/auth/login/route.ts` (Optional)

**Change:** Add logging for debugging

Add after line `const message = error instanceof Error ? error.message : 'Authentication failed';`:

```typescript
console.error('[Login] Authentication error:', {
  email: body?.email || 'unknown',
  error: message,
  timestamp: new Date().toISOString(),
});
```

## Testing Strategy

### Phase 1: Unit Verification
1. Verify seed API creates users with correct password hashing
2. Verify login endpoint accepts credentials from seeded users
3. Check error messages are appropriate

### Phase 2: Integration Testing
1. Run E2E authentication tests (03-authentication.spec.ts)
2. Run E2E registration tests (01-registration.spec.ts)
3. Verify all 4 login tests pass:
   - 3.1: Login with valid credentials
   - 3.2: Login with invalid credentials
   - 3.3: Logout functionality
   - 3.4: Session persistence

### Phase 3: Full Suite
1. Run complete E2E test suite
2. Verify test pass rate increases from 37.5% to higher
3. Document any remaining issues

## Expected Improvements

After implementing fixes:
- **Before:** 9/24 tests passing (37.5%)
- **After:** 12-15/24 tests passing (50-62.5%)
  - +3 tests from authentication fixes
  - +1-3 tests from registration fixes
  - +0-2 tests from cascading fixes

## Debugging If Issues Remain

### If login still fails:

1. Check seed API response:
```bash
curl -s http://localhost:3000/api/test/vendors/seed -d '...' | jq .
```

2. Check user was created correctly:
```bash
# In Payload admin panel: check users collection
# Verify: user exists, email matches, password field is hashed (not double-hashed)
```

3. Check login endpoint logs:
```bash
# Terminal running dev server should show:
# [Login] Attempt: { email: '...', timestamp: '...' }
# or
# [Login] Authentication error: { email: '...', error: '...', timestamp: '...' }
```

4. Manually test password comparison:
```javascript
// In Node.js REPL:
const bcrypt = require('bcryptjs');
const hash = '$2a$12$...'; // from database
bcrypt.compare('AuthTest123!@#', hash).then(result => console.log(result));
// Should be: true
```

### If registration still times out:

1. Check endpoint response time:
```bash
time curl -X POST http://localhost:3000/api/portal/vendors/register \
  -H "Content-Type: application/json" \
  -d '...'
```

2. Check database performance:
```bash
# Verify SQLite database isn't locked or slow
# Check disk space: df -h
# Check database size: du -h payload.db
```

3. Check for blocking operations:
```bash
# In dev server logs, look for:
# - Database queries taking > 1 second
# - External API calls (geocoding, email, etc.)
# - Memory spikes
```

## Success Criteria

- ✅ Seed API successfully creates users with correct password hashing
- ✅ Login endpoint accepts credentials from seeded vendors
- ✅ Login returns 200 status within 5 seconds
- ✅ Authentication E2E tests pass (3.1, 3.2, 3.3, 3.4)
- ✅ Registration E2E tests don't timeout
- ✅ Test pass rate increases to 50%+ (12/24 tests)

## References

- Payload CMS Docs: https://payloadcms.com/docs
- BCrypt: Password hashing should only happen once
- Auth Flow: User registration → seed creates user → login verifies password
