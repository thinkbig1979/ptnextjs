# Task: test-token-version - Design Token Versioning Test Suite

## Task Metadata
- **Task ID**: test-token-version
- **Phase**: Phase 2 - Backend Implementation (Testing)
- **Agent**: test-architect
- **Estimated Time**: 20-25 minutes
- **Dependencies**: [impl-jwt]
- **Status**: [ ] Not Started

## Task Description
Design and implement tests for token versioning functionality including Users collection field, version validation, and automatic version increment on security events.

## Specifics
- **Files to Create**:
  - `__tests__/unit/auth/token-version.test.ts`
  - `__tests__/integration/auth/token-revocation.test.ts`

- **Unit Test Cases**:
  1. Users collection has tokenVersion field with default 0
  2. Token validation fails when tokenVersion doesn't match database
  3. Token validation succeeds when tokenVersion matches database
  4. Token validation fails for non-existent user

- **Integration Test Cases**:
  1. Password change increments tokenVersion
  2. Existing tokens invalidated after password change
  3. Account suspension increments tokenVersion
  4. Tokens invalidated after suspension
  5. Account rejection increments tokenVersion

- **Testing Patterns**:
  ```typescript
  // Mock Payload CMS for unit tests
  vi.mock('payload', () => ({
    getPayload: vi.fn(),
  }));

  // Integration tests use real database
  ```

## Acceptance Criteria
- [ ] Unit tests for tokenVersion validation logic
- [ ] Integration tests for password change flow
- [ ] Integration tests for account status change flows
- [ ] Tests verify tokenVersion increment
- [ ] Tests verify token invalidation after version change
- [ ] Tests initially fail (RED phase)

## Testing Requirements
- **Framework**: Vitest
- **Database**: Use test database for integration tests
- **Mocking**: Mock Payload CMS for unit tests
- **Coverage Target**: 90%+ for validation logic

## Evidence Required
- [ ] Test files created at correct locations
- [ ] Tests cover all revocation triggers
- [ ] Tests fail with expected errors initially

## Context Requirements
- Reference `@.agent-os/specs/2025-12-07-auth-security-enhancements/sub-specs/testing-spec.md`

## Quality Gates
- [ ] No `.only()` or `.skip()` in tests
- [ ] Real assertions
- [ ] Integration tests clean up test data
- [ ] Proper async/await handling
