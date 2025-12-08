# Task: impl-auth-module - Implement Unified Auth Module

## Task Metadata
- **Task ID**: impl-auth-module
- **Phase**: Phase 2 - Backend Implementation
- **Agent**: backend-nodejs-specialist
- **Estimated Time**: 35-45 minutes
- **Dependencies**: [test-auth-module, impl-token-version]
- **Status**: [ ] Not Started

## Task Description
Create a unified authentication module that consolidates the three existing auth utilities (auth-middleware.ts, vendor-portal-auth.ts, admin-auth.ts) into one consistent API.

## Specifics
- **Files to Create**:
  - `lib/auth/index.ts` - Main unified module
  - `lib/auth/types.ts` - Shared types

- **Files to Modify** (deprecation notices):
  - `lib/middleware/auth-middleware.ts`
  - `lib/middleware/vendor-portal-auth.ts`
  - `lib/utils/admin-auth.ts`

- **Functions to Implement**:
  ```typescript
  // Core validation
  export async function validateToken(request: NextRequest): Promise<AuthResult>

  // Higher-order auth functions
  export async function requireAuth(request: NextRequest): Promise<NextResponse | { user: JWTPayload }>

  export function requireRole(allowedRoles: Array<'admin' | 'vendor'>):
    (request: NextRequest) => Promise<NextResponse | { user: JWTPayload }>

  export async function requireAdmin(request: NextRequest): Promise<NextResponse | { user: JWTPayload }>

  export async function requireVendorOwnership(
    request: NextRequest,
    vendorId: string
  ): Promise<NextResponse | { user: JWTPayload; vendor: unknown }>

  // Type guard
  export function isAuthError(result): result is NextResponse
  ```

- **Key Implementation Details**:
  - Extract token from Authorization header or access_token cookie
  - Verify token signature with verifyAccessToken
  - Validate tokenVersion against database
  - Return structured AuthResult type
  - Admin can access any vendor resource

## Acceptance Criteria
- [ ] validateToken verifies signature AND tokenVersion
- [ ] requireAuth returns user or NextResponse error
- [ ] requireRole checks user role against allowed roles
- [ ] requireAdmin is shortcut for requireRole(['admin'])
- [ ] requireVendorOwnership checks vendor.user matches token.id
- [ ] Admin bypass works for vendor ownership
- [ ] isAuthError type guard works correctly
- [ ] All test-auth-module tests pass

## Context Requirements
- Reference existing auth utilities for patterns
- Reference `@.agent-os/specs/2025-12-07-auth-security-enhancements/sub-specs/implementation-spec.md`

## Implementation Notes
- Use discriminated union for AuthResult type
- Token extraction priority: Authorization header > cookie
- tokenVersion check requires database query
- Handle edge cases: missing user, deleted vendor

## Quality Gates
- [ ] All test-auth-module tests pass
- [ ] TypeScript compiles without errors
- [ ] Clean API surface
- [ ] Proper error messages (no sensitive data leaked)
