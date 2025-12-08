# Task: integ-audit-routes - Integrate Audit Logging with Auth Routes

## Task Metadata
- **Task ID**: integ-audit-routes
- **Phase**: Phase 2 - Backend Implementation
- **Agent**: backend-nodejs-specialist
- **Estimated Time**: 30-40 minutes
- **Dependencies**: [impl-audit-service]
- **Status**: [ ] Not Started

## Task Description
Integrate audit logging into all authentication API routes: login, logout, and refresh endpoints.

## Specifics
- **Files to Modify**:
  - `app/api/auth/login/route.ts`
  - `app/api/auth/logout/route.ts`
  - `app/api/auth/refresh/route.ts`
  - `payload/collections/Users.ts` - Add afterChange hook for status changes

- **Login Route Integration**:
  ```typescript
  // On successful login
  await logLoginSuccess(user.id, user.email, accessJti, request);

  // On failed login (wrong password, user not found, etc.)
  await logLoginFailed(email, 'Invalid credentials', request);
  await logLoginFailed(email, 'User not found', request);
  await logLoginFailed(email, 'Account not approved', request);
  ```

- **Logout Route Integration**:
  ```typescript
  // Before clearing cookies
  const decoded = decodeToken(accessToken);
  if (decoded) {
    await logLogout(decoded.id, decoded.email, request);
  }
  ```

- **Refresh Route Integration**:
  ```typescript
  // On successful refresh
  await logTokenRefresh(payload.id, payload.email, newAccessJti, request);

  // On failed refresh
  await logAuditEvent({
    event: 'TOKEN_REFRESH_FAILED',
    email: decoded?.email || 'unknown',
    metadata: { reason: error.message },
  }, request);
  ```

- **Users Collection afterChange Hook**:
  ```typescript
  // Log status changes
  if (operation === 'update' && originalDoc) {
    if (data.status === 'suspended' && originalDoc.status !== 'suspended') {
      await logAuditEvent({ event: 'ACCOUNT_SUSPENDED', ... });
    }
    // Similar for approved, rejected
  }
  ```

## Acceptance Criteria
- [ ] Login success creates LOGIN_SUCCESS entry
- [ ] Login failures create LOGIN_FAILED entry with reason
- [ ] Logout creates LOGOUT entry
- [ ] Token refresh creates TOKEN_REFRESH entry
- [ ] Failed refresh creates TOKEN_REFRESH_FAILED entry
- [ ] Account status changes create appropriate entries
- [ ] All audit-logging integration tests pass

## Context Requirements
- Reference existing route implementations
- Import from `@/lib/services/audit-service`

## Implementation Notes
- Audit logging is non-blocking (await but don't fail on error)
- Extract jti from tokens for tracking
- Pass NextRequest to all logging functions
- Handle cases where token decode fails

## Quality Gates
- [ ] All integration tests pass
- [ ] Audit logs appear in admin panel
- [ ] No impact on auth response times
- [ ] Error cases still return correct HTTP responses
