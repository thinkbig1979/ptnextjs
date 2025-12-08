# Auth Integration Tests

This directory contains integration tests for authentication workflows using real database operations.

## Test Files

### token-revocation.test.ts
Tests automatic token invalidation on security events:
- Password change triggers
- Account suspension/rejection triggers
- Combined security events
- Token validation integration
- Edge cases and legacy data handling

**Status**: ❌ RED (Tests written, awaiting implementation)
**Related Task**: impl-token-version

### refresh-rotation.test.ts
Tests refresh token rotation and security.

**Status**: Check file header for current status

### audit-logging.test.ts
Tests end-to-end audit logging for authentication events.

**Status**: Check file header for current status

## Running Tests

### Run All Auth Integration Tests
```bash
npm test -- __tests__/integration/auth
```

### Run Specific Test File
```bash
npm test -- __tests__/integration/auth/token-revocation.test.ts
npm test -- __tests__/integration/auth/refresh-rotation.test.ts
npm test -- __tests__/integration/auth/audit-logging.test.ts
```

### Watch Mode
```bash
npm test -- __tests__/integration/auth --watch
```

## Test Patterns

### Database Setup
```typescript
import { getPayload } from 'payload';
import config from '@/payload.config';

let payload: Payload;

beforeAll(async () => {
  payload = await getPayload({ config });
});
```

### Test Data Cleanup
```typescript
afterAll(async () => {
  // Clean up test users/vendors
  if (testUserId) {
    await payload.delete({
      collection: 'users',
      id: testUserId,
    });
  }
});
```

### Testing Security Events
```typescript
// Change password
await payload.update({
  collection: 'users',
  id: userId,
  data: { password: 'NewPassword123!' },
});

// Verify tokenVersion incremented
const user = await payload.findByID({
  collection: 'users',
  id: userId,
});
expect(user.tokenVersion).toBe(previousVersion + 1);
```

## Database Considerations

Integration tests use the test database configured in Jest setup. Ensure:
1. Test database is separate from development/production
2. Tests clean up all created data
3. Tests can run in any order (no shared state)
4. Each test creates fresh test data

## Coverage Target

Integration tests should cover:
- End-to-end user workflows
- Database hooks and triggers
- Token validation integration
- Error scenarios with real database
