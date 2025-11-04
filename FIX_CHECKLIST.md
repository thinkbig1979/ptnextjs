# E2E Auth Fixes - Implementation Checklist

## Pre-Implementation Verification

- [ ] Dev server is running: `curl http://localhost:3000 -s > /dev/null && echo "OK"`
- [ ] Git branch is correct: `git branch` shows `tier-structure-implementation`
- [ ] All prepared files exist:
  - [ ] `seed-route-fixed.ts`
  - [ ] `do-fix.sh`
  - [ ] `manual-test-login.sh`
  - [ ] `E2E_BLOCKING_ISSUES_ANALYSIS.md`
  - [ ] `EXACT_CHANGES.md`

## Step 1: Apply Fixes

- [ ] Backup original files:
  ```bash
  cp app/api/test/vendors/seed/route.ts app/api/test/vendors/seed/route.ts.backup
  cp app/api/auth/login/route.ts app/api/auth/login/route.ts.backup
  ```

- [ ] Apply fixes:
  ```bash
  bash /home/edwin/development/ptnextjs/do-fix.sh
  ```

- [ ] Verify files were updated:
  ```bash
  # Check seed API has plain password (not hashedPassword)
  grep -n "password: vendorData.password" app/api/test/vendors/seed/route.ts

  # Check login has logging
  grep -n "\[Login\] Authentication error" app/api/auth/login/route.ts
  ```

- [ ] Check TypeScript compilation:
  ```bash
  npx tsc --noEmit
  ```
  Expected: No errors

## Step 2: Manual Verification

### Test 2.1: Seed API
- [ ] Run seed API test:
  ```bash
  curl -X POST http://localhost:3000/api/test/vendors/seed \
    -H "Content-Type: application/json" \
    -d '[{
      "companyName":"Manual Test Vendor",
      "email":"manualtest@example.com",
      "password":"ManualTest123!@#",
      "tier":"free",
      "status":"approved"
    }]'
  ```

- [ ] Verify response:
  - [ ] Status code: 200
  - [ ] Response contains: `"success":true`
  - [ ] Response contains: `"vendorIds":[...]`

### Test 2.2: Login Endpoint
- [ ] Run login test with same credentials:
  ```bash
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email":"manualtest@example.com",
      "password":"ManualTest123!@#"
    }'
  ```

- [ ] Verify response:
  - [ ] Status code: 200 (NOT 401)
  - [ ] Response contains: `"message":"Login successful"`
  - [ ] Response contains: `"user":{"id":"...","email":"manualtest@example.com"...}`

### Test 2.3: Automated Script
- [ ] Run automated test:
  ```bash
  bash /home/edwin/development/ptnextjs/manual-test-login.sh
  ```

- [ ] Verify output:
  - [ ] "✓ Server is running"
  - [ ] "✓ Vendor created with ID:..."
  - [ ] "✓ Login successful!"
  - [ ] "✓ Response contains user data"

## Step 3: E2E Testing

### Test 3.1: Authentication Tests
- [ ] Run authentication tests:
  ```bash
  npm run test:e2e -- tests/e2e/vendor-onboarding/03-authentication.spec.ts --reporter=list
  ```

- [ ] Check results:
  - [ ] Test 3.1: Login with valid credentials - **SHOULD PASS**
  - [ ] Test 3.2: Login with invalid credentials - **SHOULD PASS**
  - [ ] Test 3.3: Logout functionality - **SHOULD PASS**
  - [ ] Test 3.4: Session persistence - **SHOULD PASS**
  - [ ] Test 3.5: Protected route access - Should pass
  - [ ] Test 3.6: Token refresh behavior - **SHOULD PASS**

- [ ] Expected improvement: 4+ additional tests passing

### Test 3.2: Registration Tests
- [ ] Run registration tests:
  ```bash
  npm run test:e2e -- tests/e2e/vendor-onboarding/01-registration.spec.ts --reporter=list
  ```

- [ ] Check results:
  - [ ] Test 1.1: Register new vendor - Check for timeout
  - [ ] Test 1.6: Admin approval workflow - Check for timeout
  - [ ] Test 1.8: Email verification link - Check for timeout

### Test 3.3: Full Suite
- [ ] Run full vendor onboarding tests:
  ```bash
  npm run test:e2e -- tests/e2e/vendor-onboarding/ --reporter=list
  ```

- [ ] Check overall pass rate:
  - [ ] Before: ~37.5% (9/24)
  - [ ] After: Should be 50%+ (12/24+)

- [ ] Document results:
  - [ ] Total tests: ___
  - [ ] Passing: ___
  - [ ] Failing: ___
  - [ ] Pass rate: ___%

## Step 4: Verify No Regressions

- [ ] Check no new errors in dev server logs
- [ ] Run type checking:
  ```bash
  npm run type-check
  ```
  Expected: No errors

- [ ] Run linting:
  ```bash
  npm run lint
  ```
  Expected: No new errors

- [ ] Run unit tests (if any):
  ```bash
  npm run test
  ```
  Expected: No regressions

## Step 5: Document Results

### Summary Form
```
Date: _______________
Time to fix: _________
Issues encountered: ___________

Before Implementation:
- Total E2E tests: 24
- Passing: 9 (37.5%)
- Auth failures: 9
- Registration timeouts: 3
- Other failures: 3

After Implementation:
- Total E2E tests: 24
- Passing: ___ (___%)
- Auth failures: ___
- Registration timeouts: ___
- Other failures: ___

Tests fixed:
- Test 3.1: ___________
- Test 3.2: ___________
- Test 3.3: ___________
- Test 3.4: ___________
- Test 3.6: ___________
- Additional: ___________

Regressions: ___________
```

## Step 6: If Tests Still Fail

### Debug 6.1: Login Not Working
- [ ] Check Payload admin panel:
  - Go to http://localhost:3000/admin
  - Check users collection
  - Verify user exists and has correct email
  - Check password field (should be hashed)

- [ ] Check dev server logs for errors:
  ```bash
  # Look for "[Login] Authentication error:" messages
  # Check error details
  ```

- [ ] Manually verify password:
  ```bash
  # In Node.js REPL:
  const bcrypt = require('bcryptjs');
  const hash = 'hash_from_db';
  const password = 'TestPassword123!@#';
  bcrypt.compare(password, hash).then(result => console.log(result));
  // Should be: true
  ```

### Debug 6.2: Registration Timeout
- [ ] Profile endpoint response time:
  ```bash
  time curl -X POST http://localhost:3000/api/portal/vendors/register \
    -H "Content-Type: application/json" \
    -d '...'
  # Should be < 2 seconds
  ```

- [ ] Check dev server logs for slow queries
- [ ] Check database size: `du -h payload.db`
- [ ] Check disk space: `df -h`

### Debug 6.3: TypeScript Errors
- [ ] Run type check:
  ```bash
  npx tsc --noEmit
  ```

- [ ] Check for import errors
- [ ] Verify file syntax

## Success Criteria

### Minimum Requirements
- [x] Seed API creates users with plain password (not hashed)
- [ ] Login endpoint accepts credentials from seeded users
- [ ] Login returns 200 status within 5 seconds
- [ ] Authentication E2E tests pass (at least 3.1, 3.2)
- [ ] Test pass rate increases from 37.5% to at least 50%

### Nice-to-Have
- [ ] All 6 authentication tests pass
- [ ] Registration tests don't timeout
- [ ] Test pass rate reaches 60%+
- [ ] No TypeScript errors
- [ ] No linting errors

## Rollback Plan (If Needed)

If something goes wrong:
```bash
# Restore original files
cp app/api/test/vendors/seed/route.ts.backup app/api/test/vendors/seed/route.ts
cp app/api/auth/login/route.ts.backup app/api/auth/login/route.ts

# Restart dev server
npm run stop:dev
npm run dev
```

## Sign-Off

- [ ] All tests pass
- [ ] No regressions
- [ ] Documentation updated
- [ ] Ready for merge

**Date Completed:** _______________
**Completed By:** _______________
**Notes:** _______________

---

## Quick Reference

### Key Files
- Fixes: `/home/edwin/development/ptnextjs/do-fix.sh`
- Test: `/home/edwin/development/ptnextjs/manual-test-login.sh`
- Docs: `/home/edwin/development/ptnextjs/E2E_BLOCKING_ISSUES_ANALYSIS.md`

### Critical Commands
```bash
# Apply fixes
bash do-fix.sh

# Verify with manual test
bash manual-test-login.sh

# Run E2E tests
npm run test:e2e -- tests/e2e/vendor-onboarding/03-authentication.spec.ts

# Check everything
npm run type-check && npm run lint && npm run test:e2e
```

### Expected Success Indicators
- Seed API returns 200
- Login returns 200 (not 401)
- Test 3.1, 3.2, 3.3, 3.4 pass
- Pass rate goes from 37.5% to 50%+
- No new TypeScript errors
