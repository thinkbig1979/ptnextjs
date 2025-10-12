# Task impl-auth-system: Deliverable Manifest

## Task Overview
- **Task ID**: impl-auth-system
- **Phase**: Phase 2: Backend Implementation
- **Status**: Implementation Complete, Tests Missing
- **Primary Gap**: Comprehensive test coverage (80%+ target)

## Implementation Status: ✅ COMPLETE

All implementation files exist and meet specifications:

### Core Implementation Files (Verified Complete)
1. ✅ `/lib/services/auth-service.ts` - AuthService with all required methods
2. ✅ `/lib/utils/jwt.ts` - JWT utilities (generate, verify, refresh)
3. ✅ `/lib/middleware/auth-middleware.ts` - Auth middleware (JWT validation, role/tier checks)
4. ✅ `/payload/access/rbac.ts` - Complete RBAC functions (isAdmin, isVendor, hasTierAccess, canAccessTierField)
5. ✅ `/payload/access/isAdmin.ts` - Admin role check (redundant with rbac.ts)
6. ✅ `/payload/access/isVendor.ts` - Vendor role check (redundant with rbac.ts)
7. ✅ `/payload/access/tierRestrictions.ts` - Tier restrictions (already in rbac.ts)

### Implementation Features Verified
- ✅ bcrypt password hashing (12 rounds)
- ✅ OWASP password validation (12+ chars, uppercase, lowercase, number, special char)
- ✅ JWT tokens with proper expiry (1h access, 7d refresh)
- ✅ httpOnly cookie support
- ✅ Role-based access control (admin vs vendor)
- ✅ Tier-based restrictions (free, tier1, tier2)
- ✅ Comprehensive error handling
- ✅ Security logging
- ✅ Token refresh mechanism
- ✅ getUserFromRequest() helper

## Testing Requirements: ⚠️ MISSING

### Test Files to Create (Priority Order)

#### 1. Unit Tests - AuthService
**File**: `__tests__/unit/services/auth-service.test.ts`

**Test Cases Required**:
- **login() method**:
  - ✅ Successful login with valid credentials returns user and tokens
  - ✅ Invalid email returns error
  - ✅ Invalid password returns error
  - ✅ Pending vendor (status !== 'active') returns 403 error
  - ✅ Rejected vendor returns 403 error
  - ✅ Admin login bypasses vendor status checks
  - ✅ Vendor login includes tier information
  - ✅ Security logging on failure

- **validateToken() method**:
  - ✅ Valid JWT token returns decoded payload
  - ✅ Expired JWT token throws 'Token expired' error
  - ✅ Invalid JWT token throws 'Invalid token' error
  - ✅ Tampered JWT token throws error

- **refreshToken() method**:
  - ✅ Valid refresh token generates new access token
  - ✅ Expired refresh token throws error
  - ✅ Invalid refresh token throws error
  - ✅ New access token has same user payload

- **hashPassword() method**:
  - ✅ Password hashed with bcrypt
  - ✅ Bcrypt rounds set to 12
  - ✅ Same password produces different hashes (salt verification)
  - ✅ Weak password (< 12 chars) throws error
  - ✅ Password without uppercase throws error
  - ✅ Password without lowercase throws error
  - ✅ Password without number throws error
  - ✅ Password without special char throws error

- **comparePassword() method**:
  - ✅ Matching password returns true
  - ✅ Non-matching password returns false
  - ✅ Empty password returns false
  - ✅ Invalid hash returns false

- **checkPermission() method**:
  - ✅ Admin has all permissions
  - ✅ Vendor can read public resources
  - ✅ Vendor can update own vendor profile
  - ✅ Tier2 vendor can create products
  - ✅ Tier2 vendor can manage own products
  - ✅ Free tier vendor cannot create products
  - ✅ Tier1 vendor cannot create products
  - ✅ Vendor cannot access admin-only resources

**Target Coverage**: 80%+ for auth-service.ts

---

#### 2. Unit Tests - JWT Utilities
**File**: `__tests__/unit/utils/jwt.test.ts`

**Test Cases Required**:
- **generateTokens()**:
  - ✅ Returns access token with 1h expiry
  - ✅ Returns refresh token with 7d expiry
  - ✅ Tokens contain correct payload (id, email, role, tier)
  - ✅ Tokens are valid JWT format

- **verifyToken()**:
  - ✅ Valid token returns decoded payload
  - ✅ Expired token throws 'Token expired' error
  - ✅ Invalid token throws 'Invalid token' error
  - ✅ Empty token throws error

- **refreshAccessToken()**:
  - ✅ Valid refresh token generates new access token
  - ✅ New token has 1h expiry
  - ✅ New token preserves user payload
  - ✅ Invalid refresh token throws error

**Target Coverage**: 90%+ for jwt.ts

---

#### 3. Unit Tests - Auth Middleware
**File**: `__tests__/unit/middleware/auth-middleware.test.ts`

**Test Cases Required**:
- **authMiddleware()**:
  - ✅ Valid JWT in Authorization header grants access
  - ✅ Valid JWT in httpOnly cookie grants access
  - ✅ Missing token returns 401
  - ✅ Expired JWT returns 401 with TOKEN_EXPIRED code
  - ✅ Invalid JWT returns 401
  - ✅ User data attached to request headers (x-user-id, x-user-email, x-user-role, x-user-tier)

- **requireRole()**:
  - ✅ Admin accessing admin route succeeds
  - ✅ Vendor accessing vendor route succeeds
  - ✅ Vendor accessing admin route returns 403
  - ✅ Admin accessing vendor route succeeds (admin has all permissions)
  - ✅ Missing token returns 401
  - ✅ Invalid token returns 401

- **requireTier()**:
  - ✅ Free tier accessing free resource succeeds
  - ✅ Tier1 accessing tier1 resource succeeds
  - ✅ Tier2 accessing tier2 resource succeeds
  - ✅ Free tier accessing tier1 resource returns 403 with upgrade message
  - ✅ Tier1 accessing tier2 resource returns 403
  - ✅ Admin bypasses tier restrictions
  - ✅ Missing token returns 401

- **getUserFromRequest()**:
  - ✅ Extracts user from request headers
  - ✅ Returns null when headers missing
  - ✅ Correctly parses role and tier

**Target Coverage**: 85%+ for auth-middleware.ts

---

#### 4. Unit Tests - RBAC Access Control
**File**: `__tests__/unit/access/rbac.test.ts`

**Test Cases Required**:
- **isAdmin()**:
  - ✅ Admin user returns true
  - ✅ Vendor user returns false
  - ✅ Unauthenticated user returns false

- **isVendor()**:
  - ✅ Vendor user returns true
  - ✅ Admin user returns false
  - ✅ Unauthenticated user returns false

- **isAuthenticated()**:
  - ✅ Admin user returns true
  - ✅ Vendor user returns true
  - ✅ Unauthenticated user returns false

- **isAdminOrSelf()**:
  - ✅ Admin accessing any resource returns true
  - ✅ Vendor accessing own resource returns true
  - ✅ Vendor accessing other's resource returns false
  - ✅ Unauthenticated user returns false

- **hasTierAccess()**:
  - ✅ Admin has access to all tiers
  - ✅ Tier2 vendor has access to tier2, tier1, free
  - ✅ Tier1 vendor has access to tier1, free
  - ✅ Free tier vendor has access to free only
  - ✅ Non-vendor user returns false
  - ✅ Vendor without tier defaults to free

- **canAccessTierField()**:
  - ✅ Admin can access all tier fields
  - ✅ Vendor with matching tier can access field
  - ✅ Vendor with higher tier can access lower tier field
  - ✅ Vendor with lower tier cannot access higher tier field
  - ✅ Non-vendor user returns false

**Target Coverage**: 90%+ for rbac.ts

---

#### 5. Integration Tests - Login API Endpoint
**File**: `__tests__/integration/api/auth/login.test.ts`

**Test Cases Required**:
- **POST /api/auth/login**:
  - ✅ Successful login returns 200 with user and tokens
  - ✅ JWT tokens in response body
  - ✅ httpOnly cookie set with access_token
  - ✅ Invalid credentials return 401
  - ✅ Missing email returns 400
  - ✅ Missing password returns 400
  - ✅ Pending vendor returns 403 with 'Account pending approval' message
  - ✅ Rejected vendor returns 403
  - ✅ Admin login succeeds regardless of status
  - ✅ Vendor login includes tier information

**Target Coverage**: Full endpoint coverage

---

### Test Infrastructure Files to Create

#### 6. Test Fixtures
**File**: `__tests__/fixtures/users.ts`

**Contents**:
- Mock admin user with valid credentials
- Mock vendor users (free, tier1, tier2)
- Mock pending vendor user
- Mock rejected vendor user
- Mock hashed passwords for test users
- Mock JWT tokens for each user type

#### 7. Test Helpers
**File**: `__tests__/utils/auth-helpers.ts`

**Helper Functions**:
- `generateTestToken(payload: JWTPayload)` - Generate valid JWT for testing
- `generateExpiredToken(payload: JWTPayload)` - Generate expired JWT
- `generateInvalidToken()` - Generate malformed JWT
- `mockAuthenticatedRequest(user: User)` - Create mock request with auth headers
- `createMockNextRequest(headers?: Headers, cookies?: Record<string, string>)` - Mock NextRequest
- `createMockNextResponse()` - Mock NextResponse

---

## Acceptance Criteria Verification Checklist

### Implementation Criteria (Already Complete)
- [x] AuthService implemented with all required methods
- [x] JWT tokens generated with correct expiry times (1h access, 7d refresh)
- [x] Password hashing uses bcrypt with 12 rounds
- [x] Access control functions prevent unauthorized access
- [x] Tier restrictions enforce field-level permissions
- [x] Auth middleware validates tokens and attaches user to request
- [x] httpOnly cookies configured for XSS protection
- [x] Token refresh mechanism working correctly
- [x] All authentication methods include proper error handling

### Testing Criteria (To Be Completed)
- [ ] Unit tests created for AuthService (all methods)
- [ ] Unit tests created for JWT utilities
- [ ] Unit tests created for auth middleware
- [ ] Unit tests created for RBAC functions
- [ ] Integration tests created for login endpoint
- [ ] Test fixtures created for users
- [ ] Test helpers created for auth operations
- [ ] All tests pass (100% pass rate)
- [ ] Code coverage meets 80%+ threshold

### Evidence Requirements
- [ ] Test execution report showing 100% pass rate
- [ ] Coverage report showing 80%+ coverage for:
  - lib/services/auth-service.ts
  - lib/utils/jwt.ts
  - lib/middleware/auth-middleware.ts
  - payload/access/rbac.ts
- [ ] Example JWT token payload (decoded) documented
- [ ] Example bcrypt password hash documented
- [ ] Security logging verification (authentication failures logged)

---

## Test Execution Plan

### Phase 1: Test Infrastructure Setup (5-10 minutes)
1. Create `__tests__/fixtures/users.ts` with mock data
2. Create `__tests__/utils/auth-helpers.ts` with helper functions
3. Create directory structure:
   - `__tests__/unit/services/`
   - `__tests__/unit/utils/`
   - `__tests__/unit/middleware/`
   - `__tests__/unit/access/`
   - `__tests__/integration/api/auth/`

### Phase 2: Unit Test Creation (15-20 minutes)
1. Create AuthService unit tests (most critical)
2. Create JWT utilities unit tests
3. Create auth middleware unit tests
4. Create RBAC access control unit tests

### Phase 3: Integration Test Creation (5-10 minutes)
1. Create login API endpoint integration tests
2. Mock Payload CMS database calls
3. Test full authentication flow

### Phase 4: Test Execution & Verification (5-10 minutes)
1. Run all tests: `npm test -- __tests__/unit/services/auth-service.test.ts`
2. Run all tests: `npm test -- __tests__/unit/utils/jwt.test.ts`
3. Run all tests: `npm test -- __tests__/unit/middleware/auth-middleware.test.ts`
4. Run all tests: `npm test -- __tests__/unit/access/rbac.test.ts`
5. Run all tests: `npm test -- __tests__/integration/api/auth/login.test.ts`
6. Generate coverage report: `npm test -- --coverage --collectCoverageFrom="lib/services/auth-service.ts" --collectCoverageFrom="lib/utils/jwt.ts" --collectCoverageFrom="lib/middleware/auth-middleware.ts" --collectCoverageFrom="payload/access/rbac.ts"`
7. Verify 80%+ coverage achieved
8. Document test results and coverage

### Phase 5: Task Completion (5 minutes)
1. Verify all deliverable files exist using Read tool
2. Confirm all tests pass
3. Document evidence (test results, coverage report)
4. Mark task complete in tasks.md and task-impl-auth-system.md
5. Generate completion summary

---

## Deliverable Verification Checklist

Before marking task complete, VERIFY:

### File Existence (Use Read Tool)
- [ ] Read `__tests__/unit/services/auth-service.test.ts` - verify content
- [ ] Read `__tests__/unit/utils/jwt.test.ts` - verify content
- [ ] Read `__tests__/unit/middleware/auth-middleware.test.ts` - verify content
- [ ] Read `__tests__/unit/access/rbac.test.ts` - verify content
- [ ] Read `__tests__/integration/api/auth/login.test.ts` - verify content
- [ ] Read `__tests__/fixtures/users.ts` - verify fixtures exist
- [ ] Read `__tests__/utils/auth-helpers.ts` - verify helpers exist

### Test Execution (Use test-runner via Bash)
- [ ] All AuthService tests pass
- [ ] All JWT utility tests pass
- [ ] All middleware tests pass
- [ ] All RBAC tests pass
- [ ] All login API integration tests pass
- [ ] 100% test pass rate achieved
- [ ] 80%+ coverage threshold met

### Implementation Verification (Already Complete)
- [x] AuthService methods exist and work correctly
- [x] JWT utilities exist with correct expiry
- [x] Auth middleware exists with role/tier checks
- [x] RBAC functions exist with tier restrictions
- [x] httpOnly cookie support implemented
- [x] Error handling implemented
- [x] Security logging implemented

### Documentation
- [ ] Test results documented in completion report
- [ ] Coverage metrics documented
- [ ] JWT token payload example provided
- [ ] Bcrypt hash example provided

---

## Expected Test Count

**Total Test Cases**: ~70 tests
- AuthService: ~25 tests
- JWT utilities: ~12 tests
- Auth middleware: ~18 tests
- RBAC access control: ~15 tests
- Login API integration: ~10 tests

**Target Coverage**: 80%+ for all auth-related files

---

## Notes

- Implementation is **100% COMPLETE** - all code files exist and meet requirements
- Focus is **ENTIRELY ON TESTING** - create comprehensive test suite
- Test infrastructure (fixtures, helpers) must be created first
- Use Jest testing framework (already configured)
- Mock Payload CMS database calls in tests
- Use `@testing-library/react` for any React component testing (not needed for this task)
- Follow existing test patterns in `__tests__/` directory

---

## Success Criteria

Task is complete when:
1. All 7 test files exist and contain comprehensive tests
2. All tests pass (100% pass rate)
3. Coverage meets 80%+ threshold for auth files
4. All acceptance criteria verified with evidence
5. Task marked complete in tasks.md
6. Completion report generated with test results and coverage
