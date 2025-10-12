# Task: impl-auth-system - Implement Authentication and Authorization System

## Task Metadata
- **Task ID**: impl-auth-system
- **Phase**: Phase 2: Backend Implementation
- **Agent**: backend-nodejs-specialist
- **Estimated Time**: 35-45 minutes
- **Dependencies**: [impl-payload-collections]
- **Status**: [x] ✅ COMPLETE

## Task Description
Implement JWT-based authentication system using Payload CMS built-in auth, create access control functions for RBAC and tier restrictions, and set up authentication middleware for API routes.

## Specifics
- **Files to Create**:
  - `/home/edwin/development/ptnextjs/lib/services/auth-service.ts` - Authentication service layer
  - `/home/edwin/development/ptnextjs/payload/access/isAdmin.ts` - Admin role check
  - `/home/edwin/development/ptnextjs/payload/access/isVendor.ts` - Vendor role check
  - `/home/edwin/development/ptnextjs/payload/access/tierRestrictions.ts` - Tier-based access control
  - `/home/edwin/development/ptnextjs/lib/middleware/auth-middleware.ts` - JWT validation middleware
  - `/home/edwin/development/ptnextjs/lib/utils/jwt.ts` - JWT token utilities
- **Key Requirements**:
  - JWT token generation with 1-hour expiry for access tokens
  - Refresh token with 7-day expiry
  - Password hashing with bcrypt (12 rounds)
  - Role-based access control (admin vs vendor)
  - Tier-based field restrictions (free, tier1, tier2)
  - Token validation middleware for protected routes
  - httpOnly cookie storage for JWT tokens
- **AuthService Methods**:
  - `login(email: string, password: string)` → returns { user, token }
  - `validateToken(token: string)` → returns decoded user or throws
  - `refreshToken(refreshToken: string)` → returns new access token
  - `hashPassword(password: string)` → returns hashed password
  - `comparePassword(plain: string, hashed: string)` → returns boolean
  - `checkPermission(user: User, action: string, resource: string)` → returns boolean

## Acceptance Criteria
- [ ] AuthService implemented with all required methods
- [ ] JWT tokens generated with correct expiry times
- [ ] Password hashing uses bcrypt with 12 rounds
- [ ] Access control functions prevent unauthorized access
- [ ] Tier restrictions enforce field-level permissions
- [ ] Auth middleware validates tokens and attaches user to request
- [ ] httpOnly cookies configured for XSS protection
- [ ] Token refresh mechanism working correctly
- [ ] All authentication methods include proper error handling

## Testing Requirements
- **Unit Tests**:
  - AuthService.login() - success and failure cases
  - AuthService.validateToken() - valid, expired, invalid tokens
  - AuthService.hashPassword() - bcrypt rounds verification
  - AuthService.comparePassword() - matching and non-matching passwords
  - tierRestrictions() - free, tier1, tier2 access validation
- **Integration Tests**:
  - POST /api/auth/login - successful login returns JWT
  - POST /api/auth/login - invalid credentials return 401
  - Protected route with valid JWT - access granted
  - Protected route with expired JWT - access denied
  - Protected route with invalid JWT - access denied
  - Vendor accessing admin route - access denied (403)
  - Free tier vendor accessing tier1 field - access denied

## Evidence Required
- Unit test results showing 80%+ coverage for AuthService
- Integration test results for login endpoint
- Example JWT token payload (decoded)
- Evidence of bcrypt password hashing (hashed password sample)

## Context Requirements
- Technical Spec: Authentication & Authorization section
- Payload CMS authentication documentation
- JWT best practices (RFC 7519)
- Password security standards (OWASP guidelines)

## Implementation Notes
- Use Payload's built-in authentication for Users collection
- Store JWT secret in environment variables (never hardcode)
- Implement token blacklist for logout (in-memory cache or Redis)
- Use httpOnly cookies to prevent XSS attacks
- Implement CSRF protection for state-changing operations
- Ensure tier restrictions are enforced at both UI and API levels (defense in depth)
- Log authentication failures for security monitoring

## Quality Gates
- [ ] All authentication tests pass
- [ ] No hardcoded secrets in code
- [ ] Password requirements enforced (12+ chars, uppercase, lowercase, number, special char)
- [ ] JWT tokens use secure signing algorithm (HS256 or RS256)
- [ ] Access control prevents privilege escalation

## Related Files
- Technical Spec: `/home/edwin/development/ptnextjs/.agent-os/specs/2025-10-11-payload-cms-vendor-enrollment/sub-specs/technical-spec.md` (Authentication & Authorization section)
- Collections: `/home/edwin/development/ptnextjs/payload/collections/Users.ts`
- Test Plan: (output from task test-backend)
