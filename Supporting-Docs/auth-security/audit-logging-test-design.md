# Audit Logging Test Suite Design

**Task ID**: ptnextjs-d2fw (test-audit)
**Phase**: TDD RED - Test Design
**Date**: 2025-12-08
**Status**: Complete (Tests Failing - Expected)

## Overview

This document describes the comprehensive test suite designed for the audit logging system as part of the authentication security enhancements. The tests follow TDD RED phase principles and are expected to fail until the implementation tasks are completed.

## Test Files Created

### 1. Unit Tests: `__tests__/unit/auth/audit-service.test.ts`

**Purpose**: Test the audit service functions in isolation with mocked dependencies.

**Test Coverage**:

#### getClientIp() Function Tests
- ✓ Extracts IP from `x-forwarded-for` header (handles comma-separated list)
- ✓ Uses `x-real-ip` header as fallback
- ✓ Prioritizes `x-forwarded-for` over `x-real-ip`
- ✓ Handles missing IP headers gracefully (returns undefined)

#### logAuditEvent() Function Tests
- ✓ Creates audit log entry with all correct fields
- ✓ Extracts IP from `x-forwarded-for` header
- ✓ Uses `x-real-ip` as fallback
- ✓ Does not throw when logging fails (best-effort pattern)
- ✓ Handles missing request object gracefully

#### logLoginSuccess() Function Tests
- ✓ Logs LOGIN_SUCCESS event with tokenId in metadata
- ✓ Captures user ID, email, IP, and user agent

#### logLoginFailed() Function Tests
- ✓ Logs LOGIN_FAILED event with failure reason in metadata
- ✓ Captures attempted email (no userId since login failed)

#### logLogout() Function Tests
- ✓ Logs LOGOUT event
- ✓ Captures user ID and email

#### logTokenRefresh() Function Tests
- ✓ Logs TOKEN_REFRESH event with new tokenId
- ✓ Captures new token ID in metadata

#### Additional Event Types
- ✓ Supports ACCOUNT_SUSPENDED with admin metadata
- ✓ Supports PASSWORD_CHANGED event

**Total Unit Tests**: 19 test cases

### 2. Integration Tests: `__tests__/integration/auth/audit-logging.test.ts`

**Purpose**: Test the audit logging system integrated with authentication flows.

**Test Coverage**:

#### Login Events
- ✓ Creates LOGIN_SUCCESS entry on successful login
- ✓ Creates LOGIN_FAILED entry with specific failure reason
- ✓ Captures different failure reasons (invalid credentials, account suspended, etc.)

#### Logout Events
- ✓ Creates LOGOUT entry on logout
- ✓ Captures complete user context

#### Token Refresh Events
- ✓ Creates TOKEN_REFRESH entry on token refresh
- ✓ Captures new token ID in metadata
- ✓ Tracks token rotation chain (multiple refreshes)

#### Account Status Events
- ✓ Creates ACCOUNT_SUSPENDED entry with admin ID and reason
- ✓ Creates ACCOUNT_APPROVED entry with admin ID
- ✓ Creates ACCOUNT_REJECTED entry with reason

#### Password Change Events
- ✓ Creates PASSWORD_CHANGED entry

#### Error Handling
- ✓ Handles database errors gracefully (no throwing)
- ✓ Continues operations even if audit logging fails

#### Metadata Capture
- ✓ Preserves custom metadata fields

**Total Integration Tests**: 15 test cases

## Event Types Tested

The test suite covers all planned audit event types:

```typescript
type AuditEvent =
  | 'LOGIN_SUCCESS'       // Successful authentication
  | 'LOGIN_FAILED'        // Failed authentication attempt
  | 'LOGOUT'              // User logout
  | 'TOKEN_REFRESH'       // Token rotation event
  | 'ACCOUNT_SUSPENDED'   // Admin suspends account
  | 'ACCOUNT_APPROVED'    // Admin approves account
  | 'ACCOUNT_REJECTED'    // Admin rejects account
  | 'PASSWORD_CHANGED';   // User changes password
```

## Audit Log Entry Schema

Tests verify the following schema structure:

```typescript
interface AuditLogEntry {
  event: AuditEvent;           // Event type (required)
  userId?: string;             // User ID (optional - not present for LOGIN_FAILED)
  email: string;               // User email (required)
  ipAddress?: string;          // Client IP (optional)
  userAgent?: string;          // Browser/client info (optional)
  metadata?: Record<string, any>; // Event-specific metadata (optional)
}
```

## IP Extraction Logic

Tests verify the following priority order for IP extraction:

1. `x-forwarded-for` header (takes first IP if comma-separated)
2. `x-real-ip` header (fallback)
3. `undefined` if no headers present

This handles various proxy/load balancer configurations.

## Best-Effort Pattern

A critical requirement tested throughout is the "best-effort" pattern:

- **Audit logging failures MUST NOT block application operations**
- All audit functions catch errors and log to console.error
- Tests verify no exceptions are thrown even when Payload CMS fails
- This ensures authentication still works even if audit logging is unavailable

## Metadata Patterns

Tests verify proper metadata capture for different events:

### Login Success
```typescript
metadata: { tokenId: string }
```

### Login Failed
```typescript
metadata: { reason: string }
```

### Token Refresh
```typescript
metadata: { tokenId: string } // new token ID
```

### Account Suspended
```typescript
metadata: { adminId: string, reason: string }
```

### Custom Metadata
Tests verify arbitrary metadata fields are preserved for extensibility.

## Mock Strategy

### Unit Tests
- Mock Payload CMS `getPayload()` and `create()` methods
- Mock NextRequest objects with various header configurations
- Mock console.error to verify error logging

### Integration Tests
- Mock Payload CMS but test realistic event sequences
- Verify correct Payload collection ('audit-logs') is used
- Test multiple events in sequence to verify state handling

## Test Execution

### Expected Behavior (RED Phase)

Currently, all tests are **expected to fail** with:
- Module not found: `@/lib/services/audit-service`
- This is correct TDD RED phase behavior

### After Implementation

Once the following tasks are completed, tests should pass:
1. `impl-audit-collection` - Creates AuditLogs Payload collection
2. `impl-audit-service` - Implements audit service functions
3. `integ-audit-routes` - Integrates audit logging into auth routes

## Test Quality Standards

### Met Requirements
- ✓ No `.only()` or `.skip()` directives
- ✓ Real assertions (no empty test bodies)
- ✓ Descriptive test names following "should..." pattern
- ✓ Clean mock setup with proper beforeEach cleanup
- ✓ Comprehensive edge case coverage
- ✓ Follows existing project test patterns (@jest/globals imports)

### Coverage Target
- **Goal**: 90%+ code coverage for audit service
- **Unit Tests**: 19 test cases covering all service functions
- **Integration Tests**: 15 test cases covering all event flows
- **Total**: 34 test cases

## Implementation Guidance

The test suite defines the following implementation contract:

### Required Exports from `lib/services/audit-service.ts`

```typescript
// Types
export type AuditEvent = /* ... */;
export interface AuditLogEntry { /* ... */ }

// Functions
export function getClientIp(request?: NextRequest): string | undefined;
export async function logAuditEvent(entry: AuditLogEntry, request?: NextRequest): Promise<void>;
export async function logLoginSuccess(userId: string, email: string, tokenId: string, request?: NextRequest): Promise<void>;
export async function logLoginFailed(email: string, reason: string, request?: NextRequest): Promise<void>;
export async function logLogout(userId: string, email: string, request?: NextRequest): Promise<void>;
export async function logTokenRefresh(userId: string, email: string, tokenId: string, request?: NextRequest): Promise<void>;
```

### Payload Collection Requirements

Tests expect an `audit-logs` collection with these fields:
- `event` (required, string, one of AuditEvent values)
- `userId` (optional, relationship to users)
- `email` (required, string)
- `ipAddress` (optional, string)
- `userAgent` (optional, string)
- `metadata` (optional, JSON)
- `createdAt` (auto-generated timestamp)

### Error Handling Pattern

All audit functions must follow this pattern:

```typescript
try {
  // Attempt to log to Payload
  const payload = await getPayload();
  await payload.create({ /* ... */ });
} catch (error) {
  // Log but don't throw
  console.error('Failed to create audit log:', error);
}
```

## Next Steps

1. **Implementation**: Complete tasks impl-audit-collection, impl-audit-service
2. **Integration**: Complete task integ-audit-routes
3. **Verification**: Run test suite - all tests should pass
4. **Coverage**: Verify 90%+ coverage with `npm run test:coverage`

## Success Criteria

- [ ] All 19 unit tests pass
- [ ] All 15 integration tests pass
- [ ] 90%+ code coverage for audit service
- [ ] No `.only()` or `.skip()` in final tests
- [ ] Tests follow project conventions
- [ ] Implementation matches test contracts exactly

## Test Execution Commands

```bash
# Run all auth tests
npm test -- __tests__/unit/auth __tests__/integration/auth

# Run only audit tests
npm test -- audit

# Run with coverage
npm run test:coverage -- __tests__/unit/auth/audit-service.test.ts

# Run in watch mode during development
npm run test:watch -- audit
```

## Notes

- Tests use Jest framework (not Vitest as initially specified in task)
- Tests follow project convention of using `@jest/globals` for imports
- Mock setup follows pattern from existing `jwt.test.ts` and `token-version.test.ts`
- Integration tests verify realistic authentication flows
- Best-effort pattern ensures high availability even with audit failures
