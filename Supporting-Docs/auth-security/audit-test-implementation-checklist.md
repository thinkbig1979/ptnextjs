# Audit Logging Implementation Checklist

**For Implementation Teams**: Use this checklist to ensure the audit logging implementation passes all tests.

## Phase 1: AuditLogs Collection (impl-audit-collection)

### Payload Collection Schema
- [ ] Create `payload/collections/AuditLogs.ts`
- [ ] Register in `payload.config.ts`

### Required Fields
- [ ] `event` - select field with these options:
  - LOGIN_SUCCESS
  - LOGIN_FAILED
  - LOGOUT
  - TOKEN_REFRESH
  - ACCOUNT_SUSPENDED
  - ACCOUNT_APPROVED
  - ACCOUNT_REJECTED
  - PASSWORD_CHANGED
- [ ] `userId` - relationship to 'users' collection (optional)
- [ ] `email` - text field (required)
- [ ] `ipAddress` - text field (optional)
- [ ] `userAgent` - text field (optional)
- [ ] `metadata` - JSON field (optional)
- [ ] `createdAt` - auto-generated timestamp

### Access Control
- [ ] Admin: full access (read/write)
- [ ] Logged in users: no access (security)
- [ ] Admin panel configured with proper list view

## Phase 2: Audit Service (impl-audit-service)

### Create `lib/services/audit-service.ts`

### Type Exports
```typescript
export type AuditEvent =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'TOKEN_REFRESH'
  | 'ACCOUNT_SUSPENDED'
  | 'ACCOUNT_APPROVED'
  | 'ACCOUNT_REJECTED'
  | 'PASSWORD_CHANGED';

export interface AuditLogEntry {
  event: AuditEvent;
  userId?: string;
  email: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}
```

### Function Implementations

#### getClientIp()
- [ ] Extract from `x-forwarded-for` header (first IP if comma-separated)
- [ ] Fallback to `x-real-ip` header
- [ ] Return undefined if neither present
- [ ] Handle undefined request parameter

#### logAuditEvent()
- [ ] Accept `AuditLogEntry` and optional `NextRequest`
- [ ] Extract IP using `getClientIp()`
- [ ] Extract user-agent from headers
- [ ] Call Payload `create()` with collection 'audit-logs'
- [ ] Wrap in try/catch (best-effort pattern)
- [ ] Log errors to console.error
- [ ] Never throw exceptions

#### logLoginSuccess()
- [ ] Accept: userId, email, tokenId, request
- [ ] Call logAuditEvent with:
  - event: 'LOGIN_SUCCESS'
  - userId, email from parameters
  - metadata: { tokenId }

#### logLoginFailed()
- [ ] Accept: email, reason, request
- [ ] Call logAuditEvent with:
  - event: 'LOGIN_FAILED'
  - email from parameter
  - metadata: { reason }
  - NO userId (login failed)

#### logLogout()
- [ ] Accept: userId, email, request
- [ ] Call logAuditEvent with:
  - event: 'LOGOUT'
  - userId, email from parameters

#### logTokenRefresh()
- [ ] Accept: userId, email, tokenId, request
- [ ] Call logAuditEvent with:
  - event: 'TOKEN_REFRESH'
  - userId, email from parameters
  - metadata: { tokenId }

## Phase 3: Integration with Auth Routes (integ-audit-routes)

### Login Route (`app/api/auth/login/route.ts`)
- [ ] Import audit functions
- [ ] On successful login: call `logLoginSuccess(userId, email, tokenId, request)`
- [ ] On failed login: call `logLoginFailed(email, reason, request)`
- [ ] Handle different failure scenarios:
  - Invalid credentials
  - User not found
  - Account suspended
  - Account pending approval

### Logout Route (`app/api/auth/logout/route.ts`)
- [ ] Import audit functions
- [ ] On logout: call `logLogout(userId, email, request)`
- [ ] Extract user info from token before invalidating

### Refresh Route (`app/api/auth/refresh/route.ts`)
- [ ] Import audit functions
- [ ] On successful refresh: call `logTokenRefresh(userId, email, newTokenId, request)`
- [ ] Extract user info from old token
- [ ] Log with NEW token ID (after rotation)

## Phase 4: Test Verification

### Run Unit Tests
```bash
npm test -- __tests__/unit/auth/audit-service.test.ts
```
**Expected**: All 19 tests pass

### Run Integration Tests
```bash
npm test -- __tests__/integration/auth/audit-logging.test.ts
```
**Expected**: All 15 tests pass

### Check Coverage
```bash
npm run test:coverage -- __tests__/unit/auth/audit-service.test.ts
```
**Expected**: 90%+ coverage

### Manual Verification
- [ ] Login via UI → check admin panel for LOGIN_SUCCESS entry
- [ ] Wrong password → check for LOGIN_FAILED entry with reason
- [ ] Logout → check for LOGOUT entry
- [ ] Wait 1 hour, access site → verify TOKEN_REFRESH entry
- [ ] All entries have IP address and user agent
- [ ] Token IDs are captured in metadata

## Common Issues & Solutions

### Tests fail with "Module not found"
**Solution**: Ensure `lib/services/audit-service.ts` exists and exports all required functions/types

### Tests fail with "collection not found"
**Solution**: Ensure AuditLogs collection is registered in `payload.config.ts`

### Tests timeout
**Solution**: Check that async functions have proper error handling (try/catch)

### IP extraction fails
**Solution**: Verify header name capitalization matches exactly (`x-forwarded-for`, `x-real-ip`)

### Metadata not saved
**Solution**: Ensure Payload collection has JSON field for metadata (not just text)

### Audit logging throws errors
**Solution**: All audit functions MUST have try/catch - they should never throw

## Success Criteria

- ✓ All 34 tests pass (19 unit + 15 integration)
- ✓ 90%+ code coverage on audit service
- ✓ No `.only()` or `.skip()` in tests
- ✓ Manual verification in admin panel works
- ✓ Authentication still works even if Payload fails (best-effort)
- ✓ All event types logged correctly
- ✓ IP addresses captured from headers
- ✓ Token IDs captured in metadata

## Dependencies

- `payload` - Must be configured and running
- `next/server` - For NextRequest type
- Payload collection 'users' must exist (for userId relationship)

## Performance Considerations

- Audit logging is async and non-blocking
- Failed audit logs don't impact auth performance
- Consider adding indexes on `event`, `userId`, `createdAt` for reporting queries

## Security Considerations

- Only admins can read audit logs
- Logged-out users cannot access audit logs
- Passwords/tokens are NEVER logged (only token IDs)
- IP addresses help detect suspicious activity
- Failure reasons help identify attack patterns
