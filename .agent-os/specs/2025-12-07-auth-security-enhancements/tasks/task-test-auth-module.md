# Task: test-auth-module - Design Unified Auth Module Tests

## Task Metadata
- **Task ID**: test-auth-module
- **Phase**: Phase 2 - Backend Implementation (Testing)
- **Agent**: test-architect
- **Estimated Time**: 20-25 minutes
- **Dependencies**: [impl-token-version]
- **Status**: [ ] Not Started

## Task Description
Design and implement tests for the unified authentication module that consolidates the three existing auth utilities into one consistent API.

## Specifics
- **Files to Create**:
  - `__tests__/unit/auth/auth-module.test.ts`

- **Test Cases**:
  1. `validateToken` returns success with user for valid token
  2. `validateToken` returns error for missing token
  3. `validateToken` returns error for expired token
  4. `validateToken` returns error for revoked token (tokenVersion mismatch)
  5. `requireAuth` returns user object for valid request
  6. `requireAuth` returns NextResponse error for invalid request
  7. `requireRole(['vendor'])` allows vendor access
  8. `requireRole(['admin'])` denies vendor access
  9. `requireRole(['admin', 'vendor'])` allows both
  10. `requireAdmin` allows admin, denies vendor
  11. `requireVendorOwnership` allows vendor to access own profile
  12. `requireVendorOwnership` denies vendor accessing other vendor
  13. `requireVendorOwnership` allows admin to access any vendor
  14. `isAuthError` type guard works correctly

- **Testing Pattern**:
  ```typescript
  describe('Unified Auth Module', () => {
    describe('validateToken', () => {
      it('should return error for missing token', async () => {
        const request = new NextRequest('http://localhost/api/test');
        const result = await validateToken(request);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe('Authentication required');
          expect(result.status).toBe(401);
        }
      });
    });
  });
  ```

## Acceptance Criteria
- [ ] All validation scenarios tested
- [ ] Role-based access tested
- [ ] Vendor ownership tested
- [ ] Admin override tested
- [ ] Type guard tested
- [ ] Tests initially fail (RED phase)

## Testing Requirements
- **Framework**: Vitest
- **Mocking**: Mock Payload CMS, mock jwt verification
- **Coverage Target**: 95%+ for auth decision paths

## Evidence Required
- [ ] Test file created
- [ ] All auth paths covered
- [ ] Edge cases tested

## Quality Gates
- [ ] Complete coverage of auth decision logic
- [ ] Real assertions
- [ ] Proper mocking setup
