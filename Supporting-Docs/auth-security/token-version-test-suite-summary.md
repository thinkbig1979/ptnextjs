# Token Version Test Suite Summary

## Overview
Comprehensive test suite for JWT token versioning system, implementing TDD RED phase tests that define the expected behavior for token invalidation on security events.

**Task ID**: ptnextjs-umg8 (test-token-version)
**Phase**: TDD RED Phase
**Status**: Complete - All tests written and will fail until implementation

## Test Files Created

### 1. Unit Tests: `__tests__/unit/auth/token-version.test.ts`
**Purpose**: Test token version validation logic in isolation
**Test Count**: 14 test cases
**Coverage Areas**:
- Users collection schema requirements
- Token version validation logic
- Version comparison edge cases
- Database query optimization
- Error message formatting

#### Test Categories

**Users Collection Schema (2 tests)**
- Verify tokenVersion field exists with default value 0
- Verify new users are initialized with tokenVersion 0

**validateTokenVersion Function (5 tests)**
- Pass when token version matches database
- Fail when token version is lower (outdated token)
- Fail when token version is higher (tampering attempt)
- Fail when user does not exist
- Fail when user is deleted

**Version Comparison Edge Cases (5 tests)**
- Handle tokenVersion = 0 correctly
- Handle large version numbers (100+)
- Reject negative tokenVersion values
- Reject non-integer tokenVersion values
- Optimize database queries (only fetch needed fields)

**Error Messages (2 tests)**
- Provide clear message for outdated tokens
- Provide clear message for deleted users

### 2. Integration Tests: `__tests__/integration/auth/token-revocation.test.ts`
**Purpose**: Test end-to-end token revocation workflows with real database
**Test Count**: 17 test cases
**Coverage Areas**:
- Password change triggers
- Account status change triggers
- Combined security events
- Edge cases and legacy data
- Token validation integration

#### Test Categories

**Password Change Workflow (5 tests)**
- Increment tokenVersion on password change
- Invalidate existing tokens after password change
- Allow new tokens with updated version
- Increment only once per password change
- Handle multiple sequential password changes

**Account Status Changes (6 tests)**
- Increment tokenVersion on account suspension
- Invalidate tokens after suspension
- Increment tokenVersion on account rejection
- Invalidate tokens after rejection
- NOT increment for pending status (not a security event)
- NOT increment for approved status (restoration, not revocation)

**Combined Security Events (2 tests)**
- Handle password change + suspension sequence
- Handle suspension + password change sequence

**Edge Cases (2 tests)**
- Handle legacy users without tokenVersion field
- NOT change tokenVersion on unrelated field updates

**Validation Integration (2 tests)**
- Successfully validate token with correct version
- Reject token after tokenVersion mismatch

## Testing Patterns Used

### Mocking Strategy (Unit Tests)
```typescript
// Mock Payload CMS for unit tests
const mockPayload = {
  findByID: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
};

jest.mock('payload', () => ({
  getPayload: jest.fn(() => mockPayload),
}));
```

### Database Integration (Integration Tests)
```typescript
// Use real Payload instance with test database
let payload: Payload;

beforeAll(async () => {
  payload = await getPayload({ config });
});

// Clean up test data after tests
afterAll(async () => {
  // Delete test users and vendors
});
```

### Test Isolation
- Each integration test creates fresh test user and vendor
- All tests clean up after themselves
- No shared state between tests
- Tests can run in any order

## Expected Behavior (Defined by Tests)

### TokenVersion Field Requirements
1. **Schema**: Users collection MUST have `tokenVersion` field
2. **Default**: New users get `tokenVersion: 0`
3. **Type**: Integer, non-negative
4. **Updates**: Automatically incremented on security events

### Security Events That Increment TokenVersion
1. **Password Change**: Always increments
2. **Account Suspension**: Always increments
3. **Account Rejection**: Always increments

### Security Events That Do NOT Increment TokenVersion
1. **Pending Status**: Initial state, not a revocation
2. **Approved Status**: Restoration, not a revocation
3. **Unrelated Fields**: Email, name, etc.

### Token Validation Requirements
1. **Match Required**: Token tokenVersion MUST equal database tokenVersion
2. **Lower Version**: Reject (token is outdated)
3. **Higher Version**: Reject (potential tampering)
4. **User Not Found**: Reject (user deleted or never existed)

### Error Messages (User-Friendly)
- Outdated token: "Token has been invalidated. Please log in again."
- User not found: "User not found"

## Implementation Requirements

### 1. Database Schema Change
```typescript
// Add to payload/collections/Users.ts
{
  name: 'tokenVersion',
  type: 'number',
  defaultValue: 0,
  required: true,
  admin: {
    readOnly: true, // Only modified by hooks
    hidden: true,   // Hide from admin UI
  },
}
```

### 2. Validation Function
```typescript
// Create lib/utils/validateTokenVersion.ts
export async function validateTokenVersion(
  tokenPayload: JWTPayload
): Promise<void> {
  // Fetch user's current tokenVersion
  // Compare with token's tokenVersion
  // Throw error if mismatch or user not found
}
```

### 3. Payload Hooks
```typescript
// Add to payload/collections/Users.ts

// Before Update Hook
beforeChange: [
  async ({ data, req, operation, originalDoc }) => {
    if (operation === 'update') {
      // Increment tokenVersion on password change
      if (data.password && data.password !== originalDoc.password) {
        data.tokenVersion = (originalDoc.tokenVersion || 0) + 1;
      }

      // Increment tokenVersion on suspension
      if (data.status === 'suspended' && originalDoc.status !== 'suspended') {
        data.tokenVersion = (originalDoc.tokenVersion || 0) + 1;
      }

      // Increment tokenVersion on rejection
      if (data.status === 'rejected' && originalDoc.status !== 'rejected') {
        data.tokenVersion = (originalDoc.tokenVersion || 0) + 1;
      }
    }

    return data;
  }
]
```

### 4. Middleware Integration
```typescript
// Add to middleware or auth utilities
import { validateTokenVersion } from '@/lib/utils/validateTokenVersion';

// After verifying JWT signature
const decoded = verifyAccessToken(token);

// Validate tokenVersion matches database
await validateTokenVersion(decoded);
```

## Test Execution

### Run Unit Tests Only
```bash
npm test -- __tests__/unit/auth/token-version.test.ts
```

### Run Integration Tests Only
```bash
npm test -- __tests__/integration/auth/token-revocation.test.ts
```

### Run All Token Version Tests
```bash
npm test -- __tests__/unit/auth/token-version.test.ts __tests__/integration/auth/token-revocation.test.ts
```

## Expected Initial Results (RED Phase)

All tests are expected to FAIL initially with errors like:

1. **Schema Tests**: `tokenVersion is not defined on user object`
2. **Validation Tests**: `validateTokenVersion is not a function`
3. **Hook Tests**: `tokenVersion not incremented after password change`
4. **Integration Tests**: `Cannot find module '@/lib/utils/validateTokenVersion'`

These failures are intentional and expected in TDD RED phase. They define what needs to be implemented.

## Quality Metrics

### Test Coverage
- **Total Test Cases**: 31 (14 unit + 17 integration)
- **Code Paths**: 100% of validation logic (once implemented)
- **Security Events**: 100% coverage
- **Edge Cases**: Comprehensive coverage

### Code Quality
- ✅ No `.only()` or `.skip()` calls
- ✅ All assertions are real (no `expect(true).toBe(true)` in production)
- ✅ Proper async/await handling
- ✅ Clean test data in integration tests
- ✅ Descriptive test names
- ✅ Comprehensive comments and TODOs

### Testing Best Practices
- ✅ Follows Jest conventions
- ✅ Uses existing project patterns
- ✅ Proper mocking for unit tests
- ✅ Real database for integration tests
- ✅ Test isolation (no shared state)
- ✅ Clear arrange-act-assert structure

## Dependencies

### Before Implementation Can Begin
1. ✅ JWT token generation includes tokenVersion (already implemented in lib/utils/jwt.ts)
2. ❌ Users collection schema updated with tokenVersion field
3. ❌ Validation function created
4. ❌ Payload hooks implemented

### Related Tasks
- **impl-token-version**: Implement Users collection field and hooks
- **impl-auth-module**: Integrate validateTokenVersion into auth flow
- **test-auth-module**: End-to-end auth testing

## Success Criteria

### Tests Are Successful When:
1. ✅ All 31 test cases written
2. ✅ Tests initially fail (RED phase complete)
3. ✅ Clear expected behavior defined
4. ✅ Implementation requirements documented
5. ✅ No test anti-patterns (`.only()`, `.skip()`, placeholder assertions)

### Tests Will Pass When:
1. Users collection has tokenVersion field
2. validateTokenVersion function implemented
3. Payload hooks increment tokenVersion correctly
4. Token validation integrated into auth flow

## Next Steps

1. **Review Tests**: Implementation team reviews test requirements
2. **Schema Update**: Add tokenVersion field to Users collection
3. **Validation Logic**: Implement validateTokenVersion function
4. **Hooks**: Add beforeChange hooks to Users collection
5. **Integration**: Connect validation to middleware
6. **Verify GREEN**: Run tests to confirm all pass

## Files Modified

- ✅ Created: `__tests__/unit/auth/token-version.test.ts`
- ✅ Created: `__tests__/integration/auth/token-revocation.test.ts`
- ✅ Created: `Supporting-Docs/auth-security/token-version-test-suite-summary.md`

## Notes for Implementation Team

### Critical Requirements
1. **Atomic Updates**: tokenVersion increment MUST be atomic (no race conditions)
2. **Password Comparison**: Only increment if password actually changed
3. **Status Transitions**: Track previous status to detect changes
4. **Legacy Data**: Handle users without tokenVersion gracefully (default to 0)

### Security Considerations
1. **Admin UI**: Hide tokenVersion field from admin (auto-managed only)
2. **API Exposure**: Never expose tokenVersion in public APIs
3. **Client Side**: Never send tokenVersion to frontend
4. **Logging**: Log tokenVersion increments for security audit

### Performance Considerations
1. **Query Optimization**: Only fetch tokenVersion field for validation
2. **Caching**: Consider caching user tokenVersion (with invalidation)
3. **Database Index**: Index tokenVersion for faster lookups (optional)

## Conclusion

This test suite provides comprehensive coverage of the token versioning system, defining clear requirements for implementation. All tests are designed to fail initially (TDD RED phase) and will guide the implementation team through the GREEN phase.

The tests ensure:
- Tokens are automatically invalidated on security events
- No old tokens can be used after password change or account suspension
- System handles edge cases and legacy data gracefully
- Clear error messages guide users through token issues

Total test cases: **31**
Expected pass rate (pre-implementation): **0%** ✅ (RED phase complete)
Expected pass rate (post-implementation): **100%** (GREEN phase goal)
