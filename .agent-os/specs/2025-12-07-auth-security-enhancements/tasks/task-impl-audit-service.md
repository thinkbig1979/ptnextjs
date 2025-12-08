# Task: impl-audit-service - Implement Audit Service

## Task Metadata
- **Task ID**: impl-audit-service
- **Phase**: Phase 2 - Backend Implementation
- **Agent**: backend-nodejs-specialist
- **Estimated Time**: 25-30 minutes
- **Dependencies**: [impl-audit-collection]
- **Status**: [ ] Not Started

## Task Description
Create the audit service with functions for logging authentication events. Service should be best-effort (failures logged but don't block operations).

## Specifics
- **Files to Create**:
  - `lib/services/audit-service.ts`

- **Types to Export**:
  ```typescript
  export type AuditEvent =
    | 'LOGIN_SUCCESS' | 'LOGIN_FAILED'
    | 'LOGOUT'
    | 'TOKEN_REFRESH' | 'TOKEN_REFRESH_FAILED'
    | 'PASSWORD_CHANGED'
    | 'ACCOUNT_SUSPENDED' | 'ACCOUNT_APPROVED' | 'ACCOUNT_REJECTED';

  export interface AuditLogEntry {
    event: AuditEvent;
    userId?: string;
    email: string;
    ipAddress?: string;
    userAgent?: string;
    tokenId?: string;
    metadata?: Record<string, unknown>;
  }
  ```

- **Functions to Implement**:
  1. `getClientIp(request)` - Extract IP from headers
  2. `logAuditEvent(entry, request?)` - Core logging function
  3. `logLoginSuccess(userId, email, tokenId, request)`
  4. `logLoginFailed(email, reason, request)`
  5. `logLogout(userId, email, request)`
  6. `logTokenRefresh(userId, email, newTokenId, request)`
  7. `logPasswordChanged(userId, email, request)` - for afterChange hook
  8. `logAccountStatusChange(userId, email, newStatus, request)` - for status changes

- **IP Extraction Priority**:
  1. x-forwarded-for (first IP)
  2. x-real-ip
  3. 'unknown' fallback

## Acceptance Criteria
- [ ] All logging functions implemented
- [ ] IP extraction handles proxy headers correctly
- [ ] User agent captured from request
- [ ] Failures don't throw (try/catch with console.error)
- [ ] tokenId captured for token-related events
- [ ] metadata captured for event context
- [ ] All test-audit unit tests pass

## Context Requirements
- Reference `@.agent-os/specs/2025-12-07-auth-security-enhancements/sub-specs/implementation-spec.md`

## Implementation Notes
- Use `getPayload({ config })` for Payload access
- Wrap all Payload calls in try/catch
- Log errors but don't throw
- Use async/await properly

## Quality Gates
- [ ] All test-audit tests pass
- [ ] TypeScript compiles without errors
- [ ] No uncaught promise rejections
- [ ] Console.error logs include useful context
