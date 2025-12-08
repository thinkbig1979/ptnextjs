# Task: valid-final - Final Quality Validation

## Task Metadata
- **Task ID**: valid-final
- **Phase**: Phase 3 - Final Validation
- **Agent**: quality-assurance
- **Estimated Time**: 25-30 minutes
- **Dependencies**: [test-e2e]
- **Status**: [ ] Not Started

## Task Description
Perform comprehensive final validation of all security enhancements, verify all acceptance criteria are met, and ensure no regressions in existing functionality.

## Specifics
- **Validation Areas**:

  1. **Token Security Verification**:
     - [ ] AC-1: Access and refresh tokens use different signing secrets
     - [ ] AC-2: Tokens include `type` claim verified on validation
     - [ ] AC-3: Tokens include unique `jti` claim

  2. **Token Revocation Verification**:
     - [ ] AC-4: Users collection has `tokenVersion` field
     - [ ] AC-5: Changing password increments tokenVersion
     - [ ] AC-6: Suspending account increments tokenVersion
     - [ ] AC-7: Token validation fails if tokenVersion doesn't match

  3. **Refresh Rotation Verification**:
     - [ ] AC-8: Refresh endpoint returns both new access AND refresh tokens

  4. **Audit Logging Verification**:
     - [ ] AC-9: AuditLogs collection exists with proper schema
     - [ ] AC-10: Login success/failure creates audit log entry
     - [ ] AC-11: Logout creates audit log entry
     - [ ] AC-12: Token refresh creates audit log entry

  5. **Middleware Verification**:
     - [ ] AC-13: HSTS header present when NODE_ENV=production
     - [ ] AC-14: Middleware validates token signature

  6. **Auth Module Verification**:
     - [ ] AC-15: Unified auth module exports all required functions
     - [ ] AC-16: All existing API routes work with new auth module

- **Test Execution**:
  ```bash
  # Run all auth tests
  pnpm vitest run __tests__/unit/auth/
  pnpm vitest run __tests__/integration/auth/
  pnpm playwright test tests/e2e/auth/

  # Coverage report
  pnpm vitest run --coverage
  ```

- **Manual Verification**:
  1. Login as vendor → verify audit entry in admin panel
  2. Refresh token → verify both cookies updated
  3. Change password → verify logged out
  4. Admin suspend vendor → verify vendor can't access dashboard
  5. Check HSTS header in production build

## Acceptance Criteria
- [ ] All 16 acceptance criteria verified
- [ ] All unit tests pass (90%+ coverage)
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] No TypeScript errors
- [ ] No eslint errors
- [ ] Existing auth functionality not broken
- [ ] Performance not degraded (no noticeable slowdown)

## Evidence Required
- [ ] Test coverage report (90%+ for auth code)
- [ ] Screenshot of audit logs in admin panel
- [ ] Screenshot of HSTS header in production
- [ ] Verification of each acceptance criterion

## Context Requirements
- Reference main spec for complete AC list
- Access to admin panel for audit log verification

## Quality Gates
- [ ] All tests pass
- [ ] All ACs verified
- [ ] No security vulnerabilities introduced
- [ ] Documentation updated if needed
