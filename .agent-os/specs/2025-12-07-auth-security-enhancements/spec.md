# Spec Requirements Document

> Spec: Authentication Security Enhancements
> Created: 2025-12-07
> Detail Level: Standard

## Overview

Implement security best practices for the existing JWT authentication system to address token security gaps, enable token revocation, add audit logging, and improve overall authentication resilience. These improvements harden the existing auth infrastructure without adding external dependencies (no Redis) or development friction.

## User Stories

### 1. Secure Token Isolation

As a **security-conscious platform operator**, I want access and refresh tokens to use separate signing secrets, so that compromise of one token type doesn't compromise the other.

**Workflow**: The system generates tokens with different secrets. Access tokens signed with `JWT_ACCESS_SECRET` cannot be verified with refresh token verification, and vice versa. Token type claims (`type: 'access'` or `type: 'refresh'`) prevent confusion attacks.

### 2. Token Revocation on Security Events

As a **vendor user**, I want my sessions to be invalidated when I change my password or an admin suspends my account, so that unauthorized access is immediately prevented.

**Workflow**: When a user changes their password or their status changes to suspended/rejected, their `tokenVersion` is incremented in the database. All existing tokens become invalid because they contain an old `tokenVersion` that doesn't match the current value.

### 3. Security Audit Trail

As a **platform administrator**, I want authentication events logged to a structured audit log, so that I can investigate security incidents and monitor for suspicious activity.

**Workflow**: All auth events (login, logout, token refresh, password change, failed attempts) are logged to a Payload CMS `audit_logs` collection with timestamp, user ID, IP address, user agent, event type, and outcome. Admins can query this log through the admin panel.

## Spec Scope

1. **Separate JWT Secrets** - Use distinct secrets for access and refresh tokens with token type claims
2. **Token Versioning** - Add `tokenVersion` field to Users collection for instant token invalidation
3. **Unique Token IDs (jti)** - Add unique identifiers to all tokens for individual token tracking
4. **Refresh Token Rotation** - Issue new refresh token on each refresh to limit exposure window
5. **Audit Logging Collection** - Create structured audit log for all authentication events
6. **HSTS Header Enablement** - Enable Strict-Transport-Security in production environments
7. **Middleware Token Validation** - Validate token signature (not just existence) in Next.js middleware
8. **Auth Utility Consolidation** - Unify three auth utilities into single consistent module

## Out of Scope

- Redis-based rate limiting (keep existing in-memory implementation)
- External token blocklist storage (use database-based tokenVersion instead)
- HTTPS enforcement in local development (keep current secure:production behavior)
- OAuth/social login providers
- Multi-factor authentication (separate future spec)
- Session management UI for users to view/revoke sessions

## Expected Deliverable

1. All JWT tokens include `jti` (unique ID) and `type` (access/refresh) claims, with access and refresh tokens using separate secrets
2. Password changes and account status changes immediately invalidate all existing user tokens via tokenVersion increment
3. All authentication events are logged to audit_logs collection with searchable metadata
4. HSTS header is automatically enabled when NODE_ENV=production
5. Vendor dashboard access is blocked at middleware level for invalid/expired tokens (not just missing tokens)

## Technical Requirements

### TR-1: Separate JWT Secrets

**Current State**: Both access and refresh tokens use `PAYLOAD_SECRET`

**Required Changes**:
- Access tokens: Sign with `process.env.JWT_ACCESS_SECRET || process.env.PAYLOAD_SECRET`
- Refresh tokens: Sign with `process.env.JWT_REFRESH_SECRET || (process.env.PAYLOAD_SECRET + '_refresh')`
- Add fallback derivation so existing deployments work without new env vars
- Add `type` claim to prevent token type confusion attacks

**Files to Modify**:
- `lib/utils/jwt.ts` - Add separate secrets and type claims
- `.env.example` - Document optional new env vars

### TR-2: Token Versioning for Revocation

**Required Changes**:
- Add `tokenVersion: number` field to Users collection (default: 0)
- Include `tokenVersion` in JWT payload when generating tokens
- Verify `tokenVersion` matches current database value on every token validation
- Increment `tokenVersion` on: password change, account suspension, admin-initiated revocation

**Files to Modify**:
- `payload/collections/Users.ts` - Add tokenVersion field and hooks
- `lib/utils/jwt.ts` - Include tokenVersion in payload
- `lib/services/auth-service.ts` - Verify tokenVersion on validation

### TR-3: Unique Token IDs (jti)

**Required Changes**:
- Generate UUID for each token using `crypto.randomUUID()`
- Include `jti` claim in all generated tokens
- Log jti in audit events for token tracking

**Files to Modify**:
- `lib/utils/jwt.ts` - Add jti generation

### TR-4: Refresh Token Rotation

**Required Changes**:
- On refresh, generate BOTH new access token AND new refresh token
- Set new refresh token cookie alongside new access token
- Old refresh token becomes invalid (single-use pattern)

**Files to Modify**:
- `lib/utils/jwt.ts` - Add function to generate new token pair from refresh
- `app/api/auth/refresh/route.ts` - Return and set both new tokens

### TR-5: Audit Logging Collection

**Required Schema**:
```typescript
{
  name: 'audit_logs',
  fields: [
    { name: 'event', type: 'select', options: [
      'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT',
      'TOKEN_REFRESH', 'TOKEN_REFRESH_FAILED',
      'PASSWORD_CHANGED', 'ACCOUNT_SUSPENDED',
      'ACCOUNT_APPROVED', 'ACCOUNT_REJECTED'
    ]},
    { name: 'userId', type: 'relationship', relationTo: 'users' },
    { name: 'email', type: 'text' }, // Denormalized for deleted users
    { name: 'ipAddress', type: 'text' },
    { name: 'userAgent', type: 'text' },
    { name: 'tokenId', type: 'text' }, // jti if applicable
    { name: 'metadata', type: 'json' }, // Additional context
    { name: 'timestamp', type: 'date' }
  ],
  access: { read: adminOnly, create: serverOnly }
}
```

**Files to Create**:
- `payload/collections/AuditLogs.ts` - Collection definition
- `lib/services/audit-service.ts` - Logging service

**Files to Modify**:
- `payload.config.ts` - Register collection
- `app/api/auth/login/route.ts` - Log login events
- `app/api/auth/logout/route.ts` - Log logout events
- `app/api/auth/refresh/route.ts` - Log refresh events

### TR-6: HSTS Header Enablement

**Required Changes**:
- Enable HSTS header when `NODE_ENV === 'production'`
- Use recommended settings: `max-age=31536000; includeSubDomains`

**Files to Modify**:
- `middleware.ts` - Uncomment and conditionally enable HSTS

### TR-7: Middleware Token Validation

**Current State**: Middleware only checks if token exists, not if it's valid

**Required Changes**:
- Import lightweight JWT verification in middleware
- Validate token signature and expiry
- Redirect to login with appropriate error message for invalid tokens

**Files to Modify**:
- `middleware.ts` - Add token validation logic

### TR-8: Auth Utility Consolidation

**Current State**: Three overlapping utilities:
- `lib/middleware/auth-middleware.ts`
- `lib/middleware/vendor-portal-auth.ts`
- `lib/utils/admin-auth.ts`

**Required Changes**:
- Create unified `lib/auth/index.ts` with:
  - `validateToken(request)` - Base token validation
  - `requireAuth(request)` - Ensure authenticated
  - `requireRole(roles)(request)` - Role-based access
  - `requireVendorOwnership(vendorId)(request)` - Vendor ownership check
  - `requireAdmin(request)` - Admin-only access
- Update all API routes to use new unified auth module
- Deprecate old utilities (keep as re-exports for backwards compatibility)

**Files to Create**:
- `lib/auth/index.ts` - Unified auth module
- `lib/auth/types.ts` - Shared types

**Files to Modify**:
- All API routes currently importing old auth utilities

## Security Considerations

### Token Security
- Separate secrets prevent cross-token forgery
- Token versioning enables instant revocation without blocklist
- jti enables individual token tracking in audit logs
- Refresh rotation limits exposure window

### Audit Trail
- All events logged with IP and user agent for forensics
- Denormalized email preserves audit history if user deleted
- Metadata field allows context-specific information

### Backward Compatibility
- Fallback secret derivation maintains existing deployment compatibility
- Old auth utilities re-export from new module
- No breaking changes to existing API contracts

## Testing Strategy

### Unit Tests
- JWT generation with separate secrets
- Token verification with correct/incorrect secrets
- Token versioning validation
- jti uniqueness
- Audit log creation

### Integration Tests
- Login creates audit log entry
- Password change invalidates existing tokens
- Account suspension invalidates tokens
- Refresh rotation issues new refresh token
- Middleware rejects expired tokens

### E2E Tests
- Full login flow with audit verification
- Token refresh rotation flow
- Access denied after password change

## Acceptance Criteria

- [ ] AC-1: Access and refresh tokens use different signing secrets
- [ ] AC-2: Tokens include `type` claim (access/refresh) verified on validation
- [ ] AC-3: Tokens include unique `jti` claim
- [ ] AC-4: Users collection has `tokenVersion` field
- [ ] AC-5: Changing password increments tokenVersion
- [ ] AC-6: Suspending account increments tokenVersion
- [ ] AC-7: Token validation fails if tokenVersion doesn't match
- [ ] AC-8: Refresh endpoint returns both new access AND refresh tokens
- [ ] AC-9: AuditLogs collection exists with proper schema
- [ ] AC-10: Login success/failure creates audit log entry
- [ ] AC-11: Logout creates audit log entry
- [ ] AC-12: Token refresh creates audit log entry
- [ ] AC-13: HSTS header present when NODE_ENV=production
- [ ] AC-14: Middleware validates token signature (not just existence)
- [ ] AC-15: Unified auth module exports all required functions
- [ ] AC-16: All existing API routes work with new auth module

## TDD Configuration

```yaml
tdd_enforcement:
  enabled: true
  level: STRICT  # Security-sensitive code
  minimum_coverage: 90
  target_coverage: 95
```

## Dependencies

- No new external dependencies required
- Uses Node.js built-in `crypto.randomUUID()` for jti generation
- Uses existing Payload CMS for audit log storage

## Migration Notes

1. **No database migration required** - tokenVersion defaults to 0
2. **No env var changes required** - Fallback derivation handles missing vars
3. **Existing tokens remain valid** - Until user changes password or is suspended
4. **Gradual API route migration** - Old auth utilities continue to work
