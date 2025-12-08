# Task: impl-refresh-rotation - Implement Refresh Token Rotation

## Task Metadata
- **Task ID**: impl-refresh-rotation
- **Phase**: Phase 2 - Backend Implementation
- **Agent**: backend-nodejs-specialist
- **Estimated Time**: 20-25 minutes
- **Dependencies**: [test-refresh-rotation, impl-jwt]
- **Status**: [ ] Not Started

## Task Description
Update the refresh token endpoint to implement token rotation - issue both new access and refresh tokens on each refresh operation.

## Specifics
- **Files to Modify**:
  - `app/api/auth/refresh/route.ts`

- **Current Behavior**:
  - Only generates new access token
  - Keeps same refresh token

- **New Behavior**:
  ```typescript
  import { rotateTokens, verifyRefreshToken } from '@/lib/utils/jwt';

  export async function POST(request: NextRequest) {
    const refreshToken = request.cookies.get('refresh_token')?.value;

    // Verify and rotate tokens
    const { accessToken, refreshToken: newRefreshToken } = rotateTokens(refreshToken);

    // Set both cookies
    const response = NextResponse.json({ success: true });

    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60, // 1 hour
    });

    response.cookies.set('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  }
  ```

- **Error Handling**:
  - Token expired → 401 with appropriate message
  - Invalid token → 401
  - tokenVersion mismatch → 401 (token revoked)

## Acceptance Criteria
- [ ] Refresh endpoint uses rotateTokens function
- [ ] Both access_token and refresh_token cookies set
- [ ] Cookie attributes correct (httpOnly, secure in prod, sameSite lax)
- [ ] Old refresh token no longer works (single-use rotation)
- [ ] Proper error responses for invalid/expired tokens
- [ ] All test-refresh-rotation tests pass

## Context Requirements
- Reference existing refresh route implementation
- Use enhanced jwt.ts functions

## Implementation Notes
- rotateTokens() handles verification internally
- Catch errors from rotateTokens to return proper HTTP status
- Include tokenVersion verification for revocation check

## Quality Gates
- [ ] All refresh rotation tests pass
- [ ] TypeScript compiles without errors
- [ ] Cookie security attributes correct
- [ ] Error messages don't leak sensitive info
