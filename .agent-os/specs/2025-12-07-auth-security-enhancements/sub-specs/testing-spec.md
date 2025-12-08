# Testing Specification

> Parent Spec: @.agent-os/specs/2025-12-07-auth-security-enhancements/spec.md

## TDD Configuration

```yaml
tdd_enforcement:
  enabled: true
  level: STRICT
  minimum_coverage: 90
  target_coverage: 95
```

## Test File Structure

```
__tests__/
├── unit/
│   └── auth/
│       ├── jwt.test.ts              # Token generation/verification
│       ├── auth-service.test.ts     # Auth service with tokenVersion
│       ├── audit-service.test.ts    # Audit logging
│       └── auth-module.test.ts      # Unified auth module
├── integration/
│   └── auth/
│       ├── token-revocation.test.ts # Password change invalidates tokens
│       ├── refresh-rotation.test.ts # Refresh token rotation
│       └── audit-logging.test.ts    # Audit log entries created
tests/
└── e2e/
    └── auth/
        ├── login-flow.spec.ts       # Full login with audit
        ├── token-refresh.spec.ts    # Refresh rotation flow
        └── session-invalidation.spec.ts # Password change logout
```

---

## RED Phase: Failing Tests

### Unit Tests

#### 1. JWT Token Generation (`__tests__/unit/auth/jwt.test.ts`)

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  rotateTokens,
} from '@/lib/utils/jwt';

describe('JWT Token Generation', () => {
  const testPayload = {
    id: 'user-123',
    email: 'test@example.com',
    role: 'vendor' as const,
    tier: 'tier1' as const,
    tokenVersion: 0,
  };

  describe('generateTokens', () => {
    it('should generate access token with jti claim', () => {
      const { accessToken } = generateTokens(testPayload);
      const decoded = verifyAccessToken(accessToken);

      expect(decoded.jti).toBeDefined();
      expect(typeof decoded.jti).toBe('string');
      expect(decoded.jti.length).toBeGreaterThan(0);
    });

    it('should generate unique jti for each token', () => {
      const tokens1 = generateTokens(testPayload);
      const tokens2 = generateTokens(testPayload);

      const decoded1 = verifyAccessToken(tokens1.accessToken);
      const decoded2 = verifyAccessToken(tokens2.accessToken);

      expect(decoded1.jti).not.toBe(decoded2.jti);
    });

    it('should generate access token with type: access', () => {
      const { accessToken } = generateTokens(testPayload);
      const decoded = verifyAccessToken(accessToken);

      expect(decoded.type).toBe('access');
    });

    it('should generate refresh token with type: refresh', () => {
      const { refreshToken } = generateTokens(testPayload);
      const decoded = verifyRefreshToken(refreshToken);

      expect(decoded.type).toBe('refresh');
    });

    it('should include tokenVersion in both tokens', () => {
      const { accessToken, refreshToken } = generateTokens(testPayload);

      const accessDecoded = verifyAccessToken(accessToken);
      const refreshDecoded = verifyRefreshToken(refreshToken);

      expect(accessDecoded.tokenVersion).toBe(0);
      expect(refreshDecoded.tokenVersion).toBe(0);
    });
  });

  describe('verifyAccessToken', () => {
    it('should reject refresh token when verifying as access token', () => {
      const { refreshToken } = generateTokens(testPayload);

      expect(() => verifyAccessToken(refreshToken)).toThrow('Invalid token');
    });

    it('should reject expired token', async () => {
      // This test requires mocking time or using a very short expiry
      // Implementation should handle TokenExpiredError
    });

    it('should reject token signed with wrong secret', () => {
      // Generate token, modify secret, should fail verification
    });
  });

  describe('verifyRefreshToken', () => {
    it('should reject access token when verifying as refresh token', () => {
      const { accessToken } = generateTokens(testPayload);

      expect(() => verifyRefreshToken(accessToken)).toThrow('Invalid token');
    });
  });

  describe('rotateTokens', () => {
    it('should generate new token pair from valid refresh token', () => {
      const original = generateTokens(testPayload);
      const rotated = rotateTokens(original.refreshToken);

      expect(rotated.accessToken).toBeDefined();
      expect(rotated.refreshToken).toBeDefined();
      expect(rotated.accessToken).not.toBe(original.accessToken);
      expect(rotated.refreshToken).not.toBe(original.refreshToken);
    });

    it('should preserve user data in rotated tokens', () => {
      const original = generateTokens(testPayload);
      const rotated = rotateTokens(original.refreshToken);

      const decoded = verifyAccessToken(rotated.accessToken);

      expect(decoded.id).toBe(testPayload.id);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.role).toBe(testPayload.role);
    });

    it('should generate new jti for rotated tokens', () => {
      const original = generateTokens(testPayload);
      const originalDecoded = verifyAccessToken(original.accessToken);

      const rotated = rotateTokens(original.refreshToken);
      const rotatedDecoded = verifyAccessToken(rotated.accessToken);

      expect(rotatedDecoded.jti).not.toBe(originalDecoded.jti);
    });
  });
});
```

#### 2. Auth Service Token Version (`__tests__/unit/auth/auth-service.test.ts`)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '@/lib/services/auth-service';

// Mock Payload CMS
vi.mock('payload', () => ({
  getPayload: vi.fn(),
}));

describe('AuthService', () => {
  describe('validateTokenWithVersion', () => {
    it('should reject token when tokenVersion does not match database', async () => {
      // Setup: Token has tokenVersion=0, database has tokenVersion=1
      // Expected: Validation fails with "Token revoked" error
    });

    it('should accept token when tokenVersion matches database', async () => {
      // Setup: Token has tokenVersion=1, database has tokenVersion=1
      // Expected: Validation succeeds
    });

    it('should reject token for non-existent user', async () => {
      // Setup: Token references user that doesn't exist
      // Expected: Validation fails with "User not found" error
    });
  });

  describe('login', () => {
    it('should include current tokenVersion in generated tokens', async () => {
      // Setup: User with tokenVersion=5
      // Expected: Generated tokens include tokenVersion=5
    });
  });
});
```

#### 3. Audit Service (`__tests__/unit/auth/audit-service.test.ts`)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  logAuditEvent,
  logLoginSuccess,
  logLoginFailed,
  logLogout,
  logTokenRefresh,
} from '@/lib/services/audit-service';
import { NextRequest } from 'next/server';

vi.mock('payload', () => ({
  getPayload: vi.fn(),
}));

describe('AuditService', () => {
  const mockRequest = {
    headers: new Headers({
      'x-forwarded-for': '192.168.1.1',
      'user-agent': 'Mozilla/5.0 Test Agent',
    }),
  } as unknown as NextRequest;

  describe('logAuditEvent', () => {
    it('should create audit log entry with correct fields', async () => {
      // Verify payload.create is called with correct data structure
    });

    it('should extract IP from x-forwarded-for header', async () => {
      // Verify ipAddress field contains first IP from header
    });

    it('should extract IP from x-real-ip as fallback', async () => {
      // When x-forwarded-for missing, use x-real-ip
    });

    it('should not throw when logging fails', async () => {
      // Audit logging is best-effort, should not block operations
    });
  });

  describe('logLoginSuccess', () => {
    it('should log LOGIN_SUCCESS event with tokenId', async () => {
      await logLoginSuccess('user-123', 'test@example.com', 'jti-abc', mockRequest);
      // Verify correct event type and tokenId
    });
  });

  describe('logLoginFailed', () => {
    it('should log LOGIN_FAILED event with reason in metadata', async () => {
      await logLoginFailed('test@example.com', 'Invalid password', mockRequest);
      // Verify reason captured in metadata
    });
  });
});
```

#### 4. Unified Auth Module (`__tests__/unit/auth/auth-module.test.ts`)

```typescript
import { describe, it, expect, vi } from 'vitest';
import {
  validateToken,
  requireAuth,
  requireRole,
  requireAdmin,
  requireVendorOwnership,
  isAuthError,
} from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

describe('Unified Auth Module', () => {
  describe('validateToken', () => {
    it('should return success with user for valid token', async () => {
      // Valid token, matching tokenVersion
    });

    it('should return error for missing token', async () => {
      const request = new NextRequest('http://localhost/api/test');
      const result = await validateToken(request);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Authentication required');
        expect(result.status).toBe(401);
      }
    });

    it('should return error for revoked token', async () => {
      // Token valid but tokenVersion mismatch
    });
  });

  describe('requireRole', () => {
    it('should allow access for matching role', async () => {
      // User with vendor role, allowedRoles includes vendor
    });

    it('should deny access for non-matching role', async () => {
      // User with vendor role, allowedRoles only includes admin
    });
  });

  describe('requireVendorOwnership', () => {
    it('should allow vendor to access own profile', async () => {
      // Vendor user accessing their own vendor profile
    });

    it('should deny vendor accessing other vendor profile', async () => {
      // Vendor user trying to access different vendor
    });

    it('should allow admin to access any vendor profile', async () => {
      // Admin user can access any vendor
    });
  });

  describe('isAuthError', () => {
    it('should return true for NextResponse', () => {
      const response = NextResponse.json({ error: 'test' }, { status: 401 });
      expect(isAuthError(response)).toBe(true);
    });

    it('should return false for user object', () => {
      const result = { user: { id: '123', email: 'test@example.com' } };
      expect(isAuthError(result)).toBe(false);
    });
  });
});
```

### Integration Tests

#### 5. Token Revocation (`__tests__/integration/auth/token-revocation.test.ts`)

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Token Revocation Integration', () => {
  describe('Password Change', () => {
    it('should increment tokenVersion when password changes', async () => {
      // 1. Create user with tokenVersion=0
      // 2. Change password
      // 3. Verify tokenVersion=1
    });

    it('should invalidate existing tokens after password change', async () => {
      // 1. Login, get tokens
      // 2. Change password
      // 3. Use old token to access protected route
      // 4. Verify 401 response
    });
  });

  describe('Account Suspension', () => {
    it('should increment tokenVersion when account suspended', async () => {
      // 1. Create approved user
      // 2. Admin suspends account
      // 3. Verify tokenVersion incremented
    });

    it('should invalidate tokens after suspension', async () => {
      // 1. Vendor logs in
      // 2. Admin suspends vendor
      // 3. Vendor's next request should fail
    });
  });
});
```

#### 6. Refresh Rotation (`__tests__/integration/auth/refresh-rotation.test.ts`)

```typescript
import { describe, it, expect } from 'vitest';

describe('Refresh Token Rotation Integration', () => {
  it('should return both new access and refresh tokens', async () => {
    // 1. Login, get initial tokens
    // 2. Call refresh endpoint
    // 3. Verify response contains new access_token cookie
    // 4. Verify response contains new refresh_token cookie
    // 5. Verify new tokens are different from original
  });

  it('should invalidate old refresh token after rotation', async () => {
    // 1. Login, get tokens
    // 2. Refresh once (get new tokens)
    // 3. Try to refresh again with OLD refresh token
    // 4. Should fail (token already used)
    // Note: This requires single-use tracking, which may not be implemented initially
  });

  it('should set correct cookie attributes on rotated tokens', async () => {
    // Verify httpOnly, secure, sameSite, path, maxAge
  });
});
```

#### 7. Audit Logging (`__tests__/integration/auth/audit-logging.test.ts`)

```typescript
import { describe, it, expect } from 'vitest';

describe('Audit Logging Integration', () => {
  it('should log LOGIN_SUCCESS on successful login', async () => {
    // 1. Login with valid credentials
    // 2. Query audit_logs collection
    // 3. Verify entry with event=LOGIN_SUCCESS, correct email, IP
  });

  it('should log LOGIN_FAILED on failed login', async () => {
    // 1. Attempt login with wrong password
    // 2. Query audit_logs collection
    // 3. Verify entry with event=LOGIN_FAILED, reason in metadata
  });

  it('should log LOGOUT on logout', async () => {
    // 1. Login
    // 2. Logout
    // 3. Verify LOGOUT entry
  });

  it('should log TOKEN_REFRESH on refresh', async () => {
    // 1. Login
    // 2. Refresh token
    // 3. Verify TOKEN_REFRESH entry with new tokenId
  });

  it('should log ACCOUNT_SUSPENDED when admin suspends user', async () => {
    // 1. Admin suspends vendor
    // 2. Verify ACCOUNT_SUSPENDED entry
  });
});
```

### E2E Tests

#### 8. Login Flow (`tests/e2e/auth/login-flow.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Login Flow with Audit', () => {
  test('successful login creates audit entry', async ({ page, request }) => {
    // 1. Navigate to login page
    // 2. Fill credentials
    // 3. Submit
    // 4. Verify redirect to dashboard
    // 5. API call to verify audit log entry exists
  });

  test('failed login creates audit entry', async ({ page, request }) => {
    // 1. Navigate to login page
    // 2. Fill wrong credentials
    // 3. Submit
    // 4. Verify error message
    // 5. API call to verify LOGIN_FAILED audit entry
  });
});
```

#### 9. Token Refresh (`tests/e2e/auth/token-refresh.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Token Refresh Rotation', () => {
  test('automatic refresh updates both tokens', async ({ page, context }) => {
    // 1. Login
    // 2. Get initial cookies
    // 3. Wait for refresh interval (or trigger manually)
    // 4. Verify both cookies updated
  });

  test('expired token redirects to login', async ({ page, context }) => {
    // 1. Login
    // 2. Clear refresh token, let access token expire
    // 3. Navigate to protected page
    // 4. Verify redirect to login with session_expired param
  });
});
```

#### 10. Session Invalidation (`tests/e2e/auth/session-invalidation.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Session Invalidation on Password Change', () => {
  test('password change logs out user', async ({ page, request }) => {
    // 1. Login as vendor
    // 2. Navigate to profile/password change
    // 3. Change password
    // 4. Verify redirected to login
    // 5. Old session should not work on another browser/tab
  });

  test('admin suspension immediately invalidates session', async ({ page, request }) => {
    // 1. Vendor logged in
    // 2. Admin suspends vendor (via API)
    // 3. Vendor's next navigation should redirect to login
    // 4. Verify appropriate error message
  });
});
```

---

## Coverage Targets

| Category | Minimum | Target |
|----------|---------|--------|
| Statement | 90% | 95% |
| Branch | 85% | 90% |
| Function | 90% | 95% |
| Line | 90% | 95% |

### Critical Paths (100% coverage required)

- `generateTokens()` - All token generation logic
- `verifyAccessToken()` - All verification branches
- `verifyRefreshToken()` - All verification branches
- `validateToken()` - All auth decision paths
- Token version comparison logic

---

## Test Data Requirements

### Users

```typescript
const testUsers = {
  vendor: {
    email: 'vendor@test.com',
    password: 'Test123!@#$%^',
    role: 'vendor',
    status: 'approved',
    tokenVersion: 0,
  },
  admin: {
    email: 'admin@test.com',
    password: 'Admin123!@#$%^',
    role: 'admin',
    tokenVersion: 0,
  },
  pendingVendor: {
    email: 'pending@test.com',
    password: 'Pending123!@#$%^',
    role: 'vendor',
    status: 'pending',
    tokenVersion: 0,
  },
};
```

### Fixtures

- `tests/fixtures/auth-users.ts` - User creation/cleanup
- `tests/fixtures/audit-logs.ts` - Audit log query helpers

---

## Test Commands

```bash
# Unit tests
pnpm vitest run __tests__/unit/auth/

# Integration tests
pnpm vitest run __tests__/integration/auth/

# E2E tests
pnpm playwright test tests/e2e/auth/

# Coverage report
pnpm vitest run --coverage __tests__/unit/auth/ __tests__/integration/auth/
```
