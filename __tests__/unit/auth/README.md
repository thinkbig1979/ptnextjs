# Auth Unit Tests

This directory contains unit tests for authentication and authorization functionality.

## Test Files

### jwt.test.ts
Tests JWT token generation, verification, and rotation with enhanced security features:
- Token generation with jti (unique ID) claims
- Type claims (access vs refresh)
- Token version support
- Secret separation
- Token expiration

**Status**: ✅ GREEN (Implementation complete)

### token-version.test.ts
Tests token version validation logic for automatic token invalidation:
- Users collection tokenVersion field
- Token version validation function
- Version comparison edge cases
- Database query optimization
- Error message formatting

**Status**: ❌ RED (Tests written, awaiting implementation)
**Related Task**: impl-token-version

### audit-service.test.ts
Tests audit logging service for authentication events.

**Status**: Check file header for current status

## Running Tests

### Run All Auth Unit Tests
```bash
npm test -- __tests__/unit/auth
```

### Run Specific Test File
```bash
npm test -- __tests__/unit/auth/jwt.test.ts
npm test -- __tests__/unit/auth/token-version.test.ts
npm test -- __tests__/unit/auth/audit-service.test.ts
```

### Watch Mode
```bash
npm test -- __tests__/unit/auth --watch
```

## Test Patterns

### Mocking Payload CMS
```typescript
const mockPayload = {
  findByID: jest.fn(),
  find: jest.fn(),
  update: jest.fn(),
};

jest.mock('payload', () => ({
  getPayload: jest.fn(() => mockPayload),
}));
```

### Testing JWT Functions
```typescript
import { generateTokens, verifyAccessToken } from '@/lib/utils/jwt';

const tokens = generateTokens(payload);
const decoded = verifyAccessToken(tokens.accessToken);
expect(decoded.id).toBe(payload.id);
```

## Coverage Target

Unit tests should achieve 90%+ coverage for:
- Token generation logic
- Token validation logic
- Error handling
- Edge cases
