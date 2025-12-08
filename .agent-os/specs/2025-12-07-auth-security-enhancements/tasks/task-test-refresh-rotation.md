# Task: test-refresh-rotation - Design Refresh Token Rotation Tests

## Task Metadata
- **Task ID**: test-refresh-rotation
- **Phase**: Phase 2 - Backend Implementation (Testing)
- **Agent**: test-architect
- **Estimated Time**: 15-20 minutes
- **Dependencies**: [impl-jwt]
- **Status**: [ ] Not Started

## Task Description
Design and implement integration tests for refresh token rotation - ensuring both access and refresh tokens are renewed on each refresh operation.

## Specifics
- **Files to Create**:
  - `__tests__/integration/auth/refresh-rotation.test.ts`

- **Test Cases**:
  1. Refresh endpoint returns both new access AND refresh tokens
  2. New tokens are different from original tokens
  3. New access token cookie has correct attributes (httpOnly, secure, etc.)
  4. New refresh token cookie has correct attributes
  5. User data preserved in rotated tokens
  6. New jti generated for rotated tokens

- **Testing Pattern**:
  ```typescript
  describe('Refresh Token Rotation Integration', () => {
    it('should return both new access and refresh tokens', async () => {
      // 1. Create test user
      // 2. Login to get initial tokens
      // 3. Call refresh endpoint with refresh token
      // 4. Verify response sets new access_token cookie
      // 5. Verify response sets new refresh_token cookie
      // 6. Verify new tokens != original tokens
    });

    it('should set correct cookie attributes', async () => {
      // Verify httpOnly, secure (in prod), sameSite, path, maxAge
    });
  });
  ```

## Acceptance Criteria
- [ ] Test for both tokens returned on refresh
- [ ] Test for token uniqueness after rotation
- [ ] Test for cookie attribute correctness
- [ ] Test for user data preservation
- [ ] Tests initially fail (RED phase)

## Testing Requirements
- **Framework**: Vitest
- **HTTP**: Use app API routes directly or test client
- **Database**: Use test database for user creation

## Evidence Required
- [ ] Test file created at correct location
- [ ] All rotation scenarios covered
- [ ] Cookie attribute verification included

## Quality Gates
- [ ] Real assertions on cookie values
- [ ] Proper async handling
- [ ] Test cleanup (remove test users)
