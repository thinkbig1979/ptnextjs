# Task: impl-api-auth-login - Implement Authentication Login API Endpoint

## Task Metadata
- **Task ID**: impl-api-auth-login
- **Phase**: Phase 2: Backend Implementation
- **Agent**: backend-nodejs-specialist
- **Estimated Time**: 20-25 minutes
- **Dependencies**: [impl-auth-system]
- **Status**: [ ] Not Started

## Task Description
Implement POST /api/auth/login endpoint for vendor and admin authentication with JWT token generation.

## Specifics
- **File to Create**: `/home/edwin/development/ptnextjs/app/api/auth/login/route.ts`
- **Request**: `{ email: string, password: string }`
- **Response Success (200)**: `{ success: true, data: { user: {id, email, role, tier?, companyName?}, token: string } }`
- **Response Error**: 401 (invalid credentials), 403 (account pending), 500 (server error)
- **Logic**: Validate input → Find user → Check status → Compare password → Generate JWT → Return token

## Acceptance Criteria
- [ ] API route accessible at POST /api/auth/login
- [ ] Input validation with Zod
- [ ] Password comparison uses bcrypt
- [ ] JWT token includes user ID, role, tier
- [ ] Pending users cannot login (403 error)
- [ ] Rejected users cannot login (403 error)
- [ ] Token stored in httpOnly cookie
- [ ] Success response includes user data and token

## Testing Requirements
- Integration tests: Valid credentials (200), invalid credentials (401), pending account (403), rejected account (403)
- Manual verification: Login with Postman, verify JWT payload, check httpOnly cookie set

## Related Files
- Technical Spec: POST /api/auth/login endpoint specification
- Auth Service: `/home/edwin/development/ptnextjs/lib/services/auth-service.ts`
