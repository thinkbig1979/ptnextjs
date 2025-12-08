# Task: test-jwt - Design JWT Enhancement Test Suite

## Task Metadata
- **Task ID**: test-jwt
- **Phase**: Phase 2 - Backend Implementation (Testing)
- **Agent**: test-architect
- **Estimated Time**: 20-25 minutes
- **Dependencies**: [pre-1]
- **Status**: [ ] Not Started

## Task Description
Design and implement comprehensive unit tests for JWT token enhancements including separate secrets, jti generation, type claims, and token rotation. Tests must be written BEFORE implementation (TDD RED phase).

## Specifics
- **Files to Create**:
  - `__tests__/unit/auth/jwt.test.ts`

- **Test Cases Required**:
  1. `generateTokens` - generates access token with jti claim
  2. `generateTokens` - generates unique jti for each token
  3. `generateTokens` - generates access token with type: 'access'
  4. `generateTokens` - generates refresh token with type: 'refresh'
  5. `generateTokens` - includes tokenVersion in both tokens
  6. `verifyAccessToken` - rejects refresh token
  7. `verifyAccessToken` - rejects expired token
  8. `verifyAccessToken` - rejects token signed with wrong secret
  9. `verifyRefreshToken` - rejects access token
  10. `rotateTokens` - generates new token pair from valid refresh token
  11. `rotateTokens` - preserves user data in rotated tokens
  12. `rotateTokens` - generates new jti for rotated tokens

- **Testing Patterns**:
  ```typescript
  import { describe, it, expect, beforeAll } from 'vitest';
  import {
    generateTokens,
    verifyAccessToken,
    verifyRefreshToken,
    rotateTokens,
  } from '@/lib/utils/jwt';
  ```

## Acceptance Criteria
- [ ] All test cases from testing-spec.md implemented
- [ ] Tests verify jti uniqueness
- [ ] Tests verify type claim enforcement
- [ ] Tests verify tokenVersion inclusion
- [ ] Tests verify secret separation (access vs refresh)
- [ ] Tests verify rotation generates new tokens
- [ ] Tests fail initially (RED phase - implementation doesn't exist yet)

## Testing Requirements
- **Framework**: Vitest
- **Mocking**: Use vi.mock for jsonwebtoken if needed
- **Assertions**: Use expect() with specific matchers
- **Coverage Target**: 100% for critical paths

## Evidence Required
- [ ] Test file created at correct location
- [ ] All test cases defined and runnable
- [ ] Tests fail with expected errors (functions don't exist yet)

## Context Requirements
- Reference `@.agent-os/specs/2025-12-07-auth-security-enhancements/sub-specs/testing-spec.md`
- Use Vitest testing patterns

## Quality Gates
- [ ] No `.only()` or `.skip()` in tests
- [ ] Real assertions (not just expect(true))
- [ ] Proper describe/it structure
- [ ] Tests are isolated (no shared state)
