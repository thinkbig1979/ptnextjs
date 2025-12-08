# Task: impl-jwt - Implement JWT Token Enhancements

## Task Metadata
- **Task ID**: impl-jwt
- **Phase**: Phase 2 - Backend Implementation
- **Agent**: backend-nodejs-specialist
- **Estimated Time**: 25-35 minutes
- **Dependencies**: [test-jwt]
- **Status**: [ ] Not Started

## Task Description
Implement enhanced JWT token generation with separate secrets for access/refresh tokens, jti (unique ID) claims, type claims, and tokenVersion support. This is the GREEN phase of TDD - make the tests pass.

## Specifics
- **Files to Modify**:
  - `lib/utils/jwt.ts` - Main implementation

- **Key Implementation Details**:
  ```typescript
  // Separate secrets with backward-compatible fallbacks
  const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.PAYLOAD_SECRET;
  const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ||
    (process.env.PAYLOAD_SECRET + '_refresh');

  // Enhanced JWTPayload interface
  export interface JWTPayload {
    id: string;
    email: string;
    role: 'admin' | 'vendor';
    tier?: 'free' | 'tier1' | 'tier2';
    status?: 'pending' | 'approved' | 'rejected' | 'suspended';
    tokenVersion: number;  // NEW
    type: 'access' | 'refresh';  // NEW
    jti: string;  // NEW
  }
  ```

- **Functions to Implement/Modify**:
  1. `generateTokens(payload)` - Generate both tokens with separate secrets, jti, type
  2. `verifyAccessToken(token)` - Verify with access secret, check type='access'
  3. `verifyRefreshToken(token)` - Verify with refresh secret, check type='refresh'
  4. `rotateTokens(refreshToken)` - Generate new pair from valid refresh
  5. `decodeToken(token)` - Decode without verification (for logging)

- **jti Generation**:
  ```typescript
  const jti = crypto.randomUUID();
  ```

## Acceptance Criteria
- [ ] Access tokens use JWT_ACCESS_SECRET (with fallback)
- [ ] Refresh tokens use JWT_REFRESH_SECRET (with fallback)
- [ ] All tokens include unique jti claim
- [ ] Access tokens have type: 'access'
- [ ] Refresh tokens have type: 'refresh'
- [ ] verifyAccessToken rejects refresh tokens
- [ ] verifyRefreshToken rejects access tokens
- [ ] rotateTokens creates new token pair
- [ ] All test-jwt tests pass

## Context Requirements
- Reference `@.agent-os/specs/2025-12-07-auth-security-enhancements/sub-specs/implementation-spec.md`
- Maintain backward compatibility with existing token consumers

## Implementation Notes
- Use crypto.randomUUID() for jti (Node.js built-in)
- Fallback secrets ensure existing deployments continue working
- Token expiry: access=1h, refresh=7d
- Export TokenPair interface for type safety

## Quality Gates
- [ ] All test-jwt tests pass
- [ ] TypeScript compiles without errors
- [ ] No hardcoded secrets
- [ ] Proper error handling for invalid tokens
