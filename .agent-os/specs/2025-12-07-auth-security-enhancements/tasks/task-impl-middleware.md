# Task: impl-middleware - Implement Middleware Token Validation and HSTS

## Task Metadata
- **Task ID**: impl-middleware
- **Phase**: Phase 2 - Backend Implementation
- **Agent**: backend-nodejs-specialist
- **Estimated Time**: 25-30 minutes
- **Dependencies**: [impl-jwt]
- **Status**: [ ] Not Started

## Task Description
Enhance Next.js middleware to validate token signatures (not just check existence) and enable HSTS header in production.

## Specifics
- **Files to Modify**:
  - `middleware.ts`

- **Current State**:
  - Middleware only checks if access_token cookie exists
  - HSTS header is commented out

- **Required Changes**:
  1. **Token Validation**:
  ```typescript
  import jwt from 'jsonwebtoken';

  function verifyTokenLightweight(token: string): boolean {
    try {
      const secret = process.env.JWT_ACCESS_SECRET || process.env.PAYLOAD_SECRET;
      if (!secret) return false;

      const payload = jwt.verify(token, secret) as { type?: string };

      // Verify it's an access token
      if (payload.type && payload.type !== 'access') {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }
  ```

  2. **Vendor Dashboard Protection**:
  ```typescript
  if (pathname.startsWith('/vendor/dashboard')) {
    const token = request.cookies.get('access_token')?.value;

    if (!token) {
      // Redirect to login
    }

    if (!verifyTokenLightweight(token)) {
      const loginUrl = new URL('/vendor/login', request.url);
      loginUrl.searchParams.set('error', 'session_expired');

      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
      return response;
    }
  }
  ```

  3. **HSTS Header**:
  ```typescript
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }
  ```

## Acceptance Criteria
- [ ] Missing token redirects to login
- [ ] Invalid token redirects to login with error param
- [ ] Expired token redirects to login with session_expired error
- [ ] Invalid cookies are cleared on redirect
- [ ] HSTS header present when NODE_ENV=production
- [ ] HSTS not present in development
- [ ] Lightweight validation (no database call)

## Context Requirements
- Reference existing middleware.ts implementation
- Use jwt.verify for signature validation

## Implementation Notes
- Lightweight verification = signature check only, no DB
- Full tokenVersion check happens in API routes
- Clear both cookies on invalid token
- Error param helps frontend show appropriate message

## Quality Gates
- [ ] TypeScript compiles without errors
- [ ] No database calls in middleware
- [ ] HSTS only in production
- [ ] Redirect URLs are correct
