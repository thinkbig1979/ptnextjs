# Task: test-audit - Design Audit Logging Test Suite

## Task Metadata
- **Task ID**: test-audit
- **Phase**: Phase 2 - Backend Implementation (Testing)
- **Agent**: test-architect
- **Estimated Time**: 20-25 minutes
- **Dependencies**: [impl-jwt]
- **Status**: [ ] Not Started

## Task Description
Design and implement tests for the audit logging system including collection schema, service functions, and integration with auth routes.

## Specifics
- **Files to Create**:
  - `__tests__/unit/auth/audit-service.test.ts`
  - `__tests__/integration/auth/audit-logging.test.ts`

- **Unit Test Cases**:
  1. `logAuditEvent` creates audit log entry with correct fields
  2. `logAuditEvent` extracts IP from x-forwarded-for header
  3. `logAuditEvent` uses x-real-ip as fallback
  4. `logAuditEvent` doesn't throw when logging fails (best-effort)
  5. `logLoginSuccess` logs LOGIN_SUCCESS with tokenId
  6. `logLoginFailed` logs LOGIN_FAILED with reason in metadata
  7. `logLogout` logs LOGOUT event
  8. `logTokenRefresh` logs TOKEN_REFRESH with new tokenId

- **Integration Test Cases**:
  1. Successful login creates LOGIN_SUCCESS audit entry
  2. Failed login creates LOGIN_FAILED audit entry with reason
  3. Logout creates LOGOUT audit entry
  4. Token refresh creates TOKEN_REFRESH audit entry
  5. Account suspension creates ACCOUNT_SUSPENDED audit entry

- **Testing Patterns**:
  ```typescript
  const mockRequest = {
    headers: new Headers({
      'x-forwarded-for': '192.168.1.1',
      'user-agent': 'Mozilla/5.0 Test Agent',
    }),
  } as unknown as NextRequest;
  ```

## Acceptance Criteria
- [ ] Unit tests for all audit service functions
- [ ] Integration tests for auth event logging
- [ ] Tests verify correct event types logged
- [ ] Tests verify IP extraction logic
- [ ] Tests verify tokenId captured
- [ ] Tests verify metadata captured
- [ ] Tests initially fail (RED phase)

## Testing Requirements
- **Framework**: Vitest
- **Mocking**: Mock Payload CMS for unit tests
- **Database**: Use test database for integration tests
- **Coverage Target**: 90%+

## Evidence Required
- [ ] Test files created at correct locations
- [ ] All audit event types covered
- [ ] Error handling tested

## Quality Gates
- [ ] No `.only()` or `.skip()` in tests
- [ ] Real assertions
- [ ] Mock setup is clean and reusable
