# Refresh Token Rotation Test Design

**Beads Task**: ptnextjs-hqr6
**Phase**: TDD RED
**Created**: 2025-12-08
**Status**: Tests Designed (Expected to Fail)

## Overview

This document describes the integration test suite for refresh token rotation, designed following Test-Driven Development (TDD) RED phase principles.

## Test File

**Location**: `__tests__/integration/auth/refresh-rotation.test.ts`

## Current vs Expected Implementation

### Current Implementation
**File**: `app/api/auth/refresh/route.ts`

```typescript
// Currently uses refreshAccessToken()
const newAccessToken = refreshAccessToken(refreshToken);

// Only sets access_token cookie
response.cookies.set('access_token', newAccessToken, {...});
```

**Problems**:
- Only refreshes access token, not refresh token
- Old refresh token can be reused indefinitely
- No protection against token replay attacks

### Expected Implementation
**File**: `app/api/auth/refresh/route.ts` (after implementation task)

```typescript
// Should use rotateTokens()
const { accessToken, refreshToken: newRefreshToken } = rotateTokens(refreshToken);

// Should set BOTH cookies
response.cookies.set('access_token', accessToken, {...});
response.cookies.set('refresh_token', newRefreshToken, {...});
```

**Improvements**:
- Returns new access AND refresh tokens
- Old refresh token becomes stale
- Better security through token rotation

## Test Suite Structure

### 1. Token Rotation Tests (Core Functionality)

**Purpose**: Verify that both tokens are returned and properly rotated

**Test Cases**:
- ✓ `should return both new access and refresh tokens on refresh`
  - Validates that response contains both cookie headers
  - Critical for core rotation functionality

- ✓ `should set new access_token cookie`
  - Verifies access token is set correctly
  - Validates JWT structure and type claim

- ✓ `should set new refresh_token cookie`
  - Verifies refresh token is set correctly
  - Validates JWT structure and type claim

- ✓ `should generate different tokens from original`
  - Ensures new tokens are unique
  - Prevents token reuse vulnerabilities

### 2. Cookie Attributes Tests (Security)

**Purpose**: Ensure proper security attributes on cookies

**Test Cases**:
- ✓ `should set httpOnly on access token cookie`
  - Prevents XSS attacks via JavaScript access

- ✓ `should set httpOnly on refresh token cookie`
  - Prevents XSS attacks via JavaScript access

- ✓ `should set secure flag in production`
  - Ensures HTTPS-only transmission in production
  - Tests environment-aware security

- ✓ `should set sameSite to strict`
  - Prevents CSRF attacks
  - Both tokens must have strict sameSite

- ✓ `should set correct maxAge for access token (1 hour)`
  - Validates 3600 seconds = 1 hour
  - Short-lived for security

- ✓ `should set correct maxAge for refresh token (7 days)`
  - Validates 604800 seconds = 7 days
  - Longer-lived for user convenience

- ✓ `should set path to / for both tokens`
  - Ensures tokens are available app-wide

### 3. Token Content Tests (Data Integrity)

**Purpose**: Verify user data preservation and JWT claims

**Test Cases**:
- ✓ `should preserve user data in rotated tokens`
  - All user fields must be preserved: id, email, role, tier, status
  - Validated in both access and refresh tokens

- ✓ `should preserve tokenVersion in rotated tokens`
  - Critical for future token revocation
  - Must match original tokenVersion

- ✓ `should generate new jti for rotated tokens`
  - Each token must have unique identifier
  - Different from original tokens
  - Access and refresh JTIs must differ

### 4. Error Cases Tests (Error Handling)

**Purpose**: Validate proper error responses

**Test Cases**:
- ✓ `should reject invalid refresh token`
  - Returns 401 status
  - Returns error message containing "invalid"

- ✓ `should reject access token used as refresh token`
  - Prevents type confusion attacks
  - Returns 401 status

- ✓ `should reject expired refresh token`
  - Validates expiration checking
  - Returns 401 status with expiration message

- ✓ `should reject request with no refresh token`
  - Returns 401 status
  - Returns "no refresh token" error

### 5. Token Rotation Sequence Tests (Advanced)

**Purpose**: Validate multi-rotation scenarios

**Test Cases**:
- ✓ `should allow multiple successive rotations`
  - Rotation 1: original → tokens1
  - Rotation 2: tokens1 → tokens2
  - All tokens unique

- ✓ `should invalidate previous refresh token after rotation`
  - Documents security goal
  - May require additional implementation (token blacklist/version increment)
  - Currently just documents expected behavior

## Test Helpers

### parseCookies(response: Response)

Parses Set-Cookie headers into structured data:

```typescript
interface CookieData {
  value: string;
  attributes: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: string;
    maxAge?: number;
    path?: string;
  };
}
```

**Returns**: `Map<string, CookieData>`

### callRefreshEndpoint(refreshToken: string)

Simulates HTTP POST to `/api/auth/refresh`:

```typescript
fetch(`${baseUrl}/api/auth/refresh`, {
  method: 'POST',
  headers: {
    'Cookie': `refresh_token=${refreshToken}`,
  },
});
```

**Returns**: `Promise<Response>`

## Expected Test Results

### RED Phase (Current State)

All tests are **EXPECTED TO FAIL** because:

1. **Missing refresh token in response**
   - Current implementation only returns access token
   - Tests expect both tokens

2. **Missing refresh_token cookie**
   - Current implementation only sets access_token cookie
   - Tests verify both cookies exist

3. **Incorrect token rotation**
   - Current implementation doesn't rotate refresh token
   - Tests verify new refresh token differs from original

### GREEN Phase (After Implementation)

After completing task `ptnextjs-hqs6` (impl-refresh-rotation), all tests should pass.

## Implementation Checklist

The implementation task will:

- [ ] Replace `refreshAccessToken()` with `rotateTokens()`
- [ ] Set both `access_token` and `refresh_token` cookies
- [ ] Verify cookie attributes are correct
- [ ] Ensure both tokens have proper JWT structure
- [ ] Maintain backward-compatible error handling

## Running the Tests

```bash
# Run all tests
npm run test

# Run only this test file
npm run test __tests__/integration/auth/refresh-rotation.test.ts

# Run with watch mode
npm run test:watch __tests__/integration/auth/refresh-rotation.test.ts

# Run with coverage
npm run test:coverage
```

## Security Considerations

### Why Token Rotation Matters

**Without Rotation**:
- Refresh token never changes
- If stolen, attacker has indefinite access
- No way to detect token theft

**With Rotation**:
- Each refresh generates new tokens
- Old refresh token becomes stale
- Shorter window for token theft
- Future: can detect concurrent usage (security breach indicator)

### Future Enhancements

1. **Token Blacklisting**
   - Track used refresh tokens
   - Reject reused tokens
   - Detect theft attempts

2. **Token Version Increments**
   - Increment tokenVersion on security events
   - Invalidate all tokens on password change
   - Already in JWT payload, ready to use

3. **Rate Limiting**
   - Already implemented in refresh route
   - 10 requests per minute per IP
   - Prevents brute force attacks

## Dependencies

### JWT Utilities
**File**: `lib/utils/jwt.ts`

- `generateTokens(payload)` - Creates token pair
- `rotateTokens(refreshToken)` - Rotates both tokens
- `verifyAccessToken(token)` - Validates access token
- `verifyRefreshToken(token)` - Validates refresh token

### Existing Tests
**File**: `__tests__/unit/auth/jwt.test.ts`

- Unit tests for JWT functions
- Already validates rotateTokens() function
- Integration tests validate HTTP layer

## Related Tasks

- `ptnextjs-hqr5` (test-jwt) - JWT unit tests (COMPLETED - GREEN)
- `ptnextjs-hqr6` (test-refresh-rotation) - This test suite (COMPLETED - RED)
- `ptnextjs-hqs6` (impl-refresh-rotation) - Implementation (NEXT)
- `ptnextjs-hqs7` (impl-middleware-token) - Middleware validation (AFTER)

## Notes

1. **Test Environment**: Uses Jest with jsdom environment
2. **No Database Required**: Integration tests use in-memory tokens only
3. **No Server Startup**: Tests call endpoints directly via fetch
4. **Environment Variables**: Uses NEXT_PUBLIC_BASE_URL or defaults to localhost:3000

## Verification

To verify test suite is complete:

```bash
# Count test cases
grep -c "it('should" __tests__/integration/auth/refresh-rotation.test.ts

# Expected: 20+ test cases

# Check no .only() or .skip()
grep -E "\.(only|skip)\(" __tests__/integration/auth/refresh-rotation.test.ts

# Expected: No matches
```

## Success Criteria

- [x] 20+ test cases covering all scenarios
- [x] Tests use real JWT generation and verification
- [x] Cookie parsing helper implemented
- [x] Error cases covered
- [x] Tests currently FAIL (RED phase confirmed)
- [x] No .only() or .skip() in test file
- [x] Clear documentation of expectations
- [x] Implementation checklist provided

---

**Status**: Ready for implementation phase
**Next Step**: Begin task `ptnextjs-hqs6` (impl-refresh-rotation)
