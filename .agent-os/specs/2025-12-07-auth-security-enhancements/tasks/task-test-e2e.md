# Task: test-e2e - Implement E2E Authentication Tests

## Task Metadata
- **Task ID**: test-e2e
- **Phase**: Phase 3 - Final Validation
- **Agent**: test-architect
- **Estimated Time**: 40-50 minutes
- **Dependencies**: [integ-api-routes, integ-audit-routes, impl-middleware]
- **Status**: [ ] Not Started

## Task Description
Implement end-to-end Playwright tests for the complete authentication flow including login, logout, token refresh, and session invalidation.

## Specifics
- **Files to Create**:
  - `tests/e2e/auth/login-flow.spec.ts`
  - `tests/e2e/auth/token-refresh.spec.ts`
  - `tests/e2e/auth/session-invalidation.spec.ts`
  - `tests/fixtures/auth-users.ts`
  - `tests/fixtures/audit-logs.ts`

- **Login Flow Tests** (`login-flow.spec.ts`):
  ```typescript
  test('successful login creates audit entry', async ({ page, request }) => {
    // Navigate to login, fill credentials, submit
    // Verify redirect to dashboard
    // API call to verify LOGIN_SUCCESS audit entry
  });

  test('failed login creates audit entry', async ({ page, request }) => {
    // Wrong credentials → verify LOGIN_FAILED entry
  });
  ```

- **Token Refresh Tests** (`token-refresh.spec.ts`):
  ```typescript
  test('automatic refresh updates both tokens', async ({ page, context }) => {
    // Login, capture initial cookies
    // Wait/trigger refresh
    // Verify both cookies updated
  });

  test('expired token redirects to login', async ({ page, context }) => {
    // Manipulate cookie expiry
    // Navigate to protected page
    // Verify redirect with session_expired param
  });
  ```

- **Session Invalidation Tests** (`session-invalidation.spec.ts`):
  ```typescript
  test('password change logs out user', async ({ page, request }) => {
    // Login, change password, verify redirect to login
  });

  test('admin suspension invalidates session', async ({ page, request }) => {
    // Vendor logged in
    // Admin API suspends vendor
    // Vendor's next navigation → login redirect
  });
  ```

## Acceptance Criteria
- [ ] Login success flow tested with audit verification
- [ ] Login failure flow tested with audit verification
- [ ] Logout flow tested
- [ ] Token refresh rotation tested
- [ ] Expired token redirect tested
- [ ] Password change invalidation tested
- [ ] Admin suspension invalidation tested
- [ ] All E2E tests pass

## Testing Requirements
- **Framework**: Playwright
- **Fixtures**: Create test users, cleanup after tests
- **API Verification**: Use request context to verify audit entries

## Evidence Required
- [ ] Test files created at correct locations
- [ ] Screenshots on failure
- [ ] All auth flows covered

## Context Requirements
- Reference `@.agent-os/specs/2025-12-07-auth-security-enhancements/sub-specs/testing-spec.md`

## Quality Gates
- [ ] Tests isolated (no cross-test dependencies)
- [ ] Proper cleanup of test data
- [ ] Timeout configuration for async operations
- [ ] No flaky tests
