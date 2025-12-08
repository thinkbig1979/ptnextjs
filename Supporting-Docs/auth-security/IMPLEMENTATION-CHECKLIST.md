# Refresh Token Rotation - Implementation Checklist

**Task ID**: ptnextjs-hqs6 (impl-refresh-rotation)
**Depends On**: ptnextjs-hqr6 (test-refresh-rotation) ✅ COMPLETED
**Status**: ⏳ READY TO START

## Pre-Implementation Verification

- [x] Test file created: `__tests__/integration/auth/refresh-rotation.test.ts`
- [x] 20 test cases covering all scenarios
- [x] Tests confirmed to FAIL (RED phase)
- [x] Documentation complete
- [x] No .only() or .skip() in tests

## Implementation Steps

### Step 1: Update Imports
**File**: `app/api/auth/refresh/route.ts`

**Current**:
```typescript
import { refreshAccessToken } from '@/lib/utils/jwt';
```

**Change To**:
```typescript
import { rotateTokens, verifyRefreshToken } from '@/lib/utils/jwt';
```

**Verification**:
```bash
grep "import.*rotateTokens" app/api/auth/refresh/route.ts
```

- [ ] rotateTokens imported
- [ ] verifyRefreshToken imported (optional, for better error handling)
- [ ] Old refreshAccessToken import removed

---

### Step 2: Replace Token Generation Logic
**File**: `app/api/auth/refresh/route.ts`
**Location**: Around line 31

**Current**:
```typescript
// Generate new access token
const newAccessToken = refreshAccessToken(refreshToken);
```

**Change To**:
```typescript
// Generate new token pair (both access and refresh)
const { accessToken, refreshToken: newRefreshToken } = rotateTokens(refreshToken);
```

**Note**: The `rotateTokens()` function already handles verification internally

**Verification**:
```bash
grep "rotateTokens(" app/api/auth/refresh/route.ts
```

- [ ] rotateTokens() called instead of refreshAccessToken()
- [ ] Both accessToken and newRefreshToken destructured
- [ ] Variable names are clear and descriptive

---

### Step 3: Update Response Cookie - Access Token
**File**: `app/api/auth/refresh/route.ts`
**Location**: Around line 38

**Current**:
```typescript
response.cookies.set('access_token', newAccessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 60 * 60, // 1 hour
  path: '/',
});
```

**Change To**:
```typescript
// Set new access token cookie (1 hour)
response.cookies.set('access_token', accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 60 * 60, // 1 hour
  path: '/',
});
```

**Verification**:
- [ ] Variable name updated to `accessToken`
- [ ] All cookie attributes present
- [ ] maxAge is 3600 (1 hour)

---

### Step 4: Add Response Cookie - Refresh Token
**File**: `app/api/auth/refresh/route.ts`
**Location**: Immediately after access token cookie

**Add**:
```typescript
// Set new refresh token cookie (7 days)
response.cookies.set('refresh_token', newRefreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/',
});
```

**Verification**:
- [ ] refresh_token cookie added
- [ ] Same attributes as access_token (except maxAge)
- [ ] maxAge is 604800 (7 days)
- [ ] httpOnly: true
- [ ] sameSite: 'strict'
- [ ] path: '/'

---

### Step 5: Update Comments
**File**: `app/api/auth/refresh/route.ts`

**Update Documentation**:
```typescript
/**
 * POST /api/auth/refresh
 *
 * Refreshes both access and refresh tokens using refresh token from httpOnly cookie.
 * Implements token rotation for enhanced security.
 *
 * @returns New access_token and refresh_token cookies
 */
```

**Update Inline Comments**:
- [ ] Comment above rotateTokens() explains token rotation
- [ ] Comment above each cookie explains purpose and expiry
- [ ] Remove outdated comments referencing old behavior

---

### Step 6: Error Handling (Optional Enhancement)
**File**: `app/api/auth/refresh/route.ts`
**Location**: catch block (around line 47)

**Consider Adding**:
```typescript
catch (error) {
  const message = error instanceof Error ? error.message : 'Token refresh failed';

  // rotateTokens() internally calls verifyRefreshToken()
  // which can throw specific error types
  if (message.includes('Token expired')) {
    return NextResponse.json(
      { error: 'Refresh token expired', code: 'REFRESH_TOKEN_EXPIRED' },
      { status: 401 }
    );
  }

  if (message.includes('invalid') || message.includes('type')) {
    return NextResponse.json(
      { error: 'Invalid refresh token', code: 'INVALID_REFRESH_TOKEN' },
      { status: 401 }
    );
  }

  // Generic error
  return NextResponse.json(
    { error: 'Token refresh failed', code: 'REFRESH_FAILED' },
    { status: 401 }
  );
}
```

**Verification**:
- [ ] Error types handled appropriately
- [ ] Consistent error codes returned
- [ ] Security-safe error messages (no sensitive data leaked)

---

## Testing Checklist

### Step 7: Run Tests
```bash
# Run the specific test file
npm run test __tests__/integration/auth/refresh-rotation.test.ts

# Run all auth tests
npm run test -- __tests__/unit/auth/
npm run test -- __tests__/integration/auth/
```

**Expected Results**:
- [ ] All 20 tests in refresh-rotation.test.ts pass ✅
- [ ] Token Rotation tests pass (4/4)
- [ ] Cookie Attributes tests pass (7/7)
- [ ] Token Content tests pass (3/3)
- [ ] Error Cases tests pass (4/4)
- [ ] Token Rotation Sequence tests pass (2/2)

### Step 8: Manual Testing
```bash
# Start development server
npm run dev

# In another terminal, test the refresh endpoint
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Cookie: refresh_token=<your-refresh-token>" \
  -v
```

**Verify**:
- [ ] Response includes Set-Cookie header for access_token
- [ ] Response includes Set-Cookie header for refresh_token
- [ ] Both cookies have HttpOnly attribute
- [ ] Both cookies have SameSite=Strict attribute
- [ ] Access token cookie has Max-Age=3600
- [ ] Refresh token cookie has Max-Age=604800

---

## Code Quality Checks

### Step 9: TypeScript Validation
```bash
npm run type-check
```

- [ ] No TypeScript errors
- [ ] Proper types for destructured values
- [ ] Import statements correct

### Step 10: Linting
```bash
npm run lint
```

- [ ] No linting errors
- [ ] Code follows project style guide
- [ ] No unused variables

### Step 11: Code Review
- [ ] Both tokens are rotated
- [ ] Cookie security attributes are correct
- [ ] Error handling is comprehensive
- [ ] Comments are clear and accurate
- [ ] No sensitive data logged

---

## Documentation Updates

### Step 12: Update Supporting Docs
- [ ] Mark ptnextjs-hqs6 as completed in beads
- [ ] Update TEST-SUITE-SUMMARY.md status to GREEN
- [ ] Add implementation notes if needed

---

## Commit and Push

### Step 13: Git Workflow
```bash
# Stage changes
git add app/api/auth/refresh/route.ts
git add __tests__/integration/auth/refresh-rotation.test.ts
git add Supporting-Docs/auth-security/

# Commit with clear message
git commit -m "feat(auth): implement refresh token rotation

- Replace refreshAccessToken() with rotateTokens()
- Set both access_token and refresh_token cookies
- Maintain proper cookie security attributes
- All 20 integration tests now passing (TDD GREEN)

Closes: ptnextjs-hqs6
Related: ptnextjs-hqr6"

# Push to branch
git push origin auth-security-enhancements
```

- [ ] All test files committed
- [ ] Implementation file committed
- [ ] Documentation files committed
- [ ] Commit message follows convention
- [ ] Branch pushed to remote

---

## Final Verification

### Step 14: End-to-End Test
1. Start fresh development server
2. Register a new test user
3. Login and get tokens
4. Call refresh endpoint
5. Verify both tokens rotated
6. Try refreshing again with new token
7. Verify successive rotations work

- [ ] Registration works
- [ ] Login returns both tokens
- [ ] Refresh rotates both tokens
- [ ] Multiple rotations work
- [ ] Old tokens are rejected (if revocation implemented)

---

## Success Criteria

All of the following must be true:

- [x] Tests written (RED phase) ✅
- [ ] Implementation complete
- [ ] All tests passing (GREEN phase)
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Documentation updated
- [ ] Code committed and pushed
- [ ] Manual E2E test passed

---

## Rollback Plan

If implementation causes issues:

```bash
# Revert the commit
git revert HEAD

# Or reset to previous commit
git reset --hard HEAD~1

# Push the revert
git push origin auth-security-enhancements --force
```

**When to Rollback**:
- Tests don't pass after multiple attempts
- TypeScript errors can't be resolved
- Breaking changes to other auth flows
- Security vulnerabilities discovered

---

## Next Tasks

After completing this implementation:

1. **ptnextjs-hqs7**: Middleware token validation
2. **ptnextjs-hqs8**: Environment configuration
3. **Future**: Token blacklisting/revocation
4. **Future**: Token version increment on password change

---

**Checklist Version**: 1.0
**Last Updated**: 2025-12-08
**Ready to Start**: YES ✅
