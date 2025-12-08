import { NextRequest, NextResponse } from 'next/server';
import { rotateTokens, decodeToken, verifyRefreshToken } from '@/lib/utils/jwt';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { logTokenRefresh, logTokenRefreshFailed } from '@/lib/services/audit-service';

// Rate limit: 10 requests per minute per IP
const REFRESH_RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
  identifier: '/api/auth/refresh',
};

/**
 * POST /api/auth/refresh
 *
 * Rotates both access and refresh tokens (TR-4: Refresh Token Rotation)
 * Security enhancement: Each refresh invalidates the old refresh token
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  return rateLimit(request, async () => {
    let user_email = 'unknown';

    try {
      // Extract refresh token from httpOnly cookie
      const refresh_token = request.cookies.get('refresh_token')?.value;

      if (!refresh_token) {
        return NextResponse.json(
          { error: 'No refresh token provided' },
          { status: 401 }
        );
      }

      // Try to decode to get user info for logging (even if verification might fail)
      const old_decoded = decodeToken(refresh_token);
      if (old_decoded) {
        user_email = old_decoded.email;
      }

      // Rotate both tokens (verifies and generates new pair)
      const { accessToken, refreshToken: new_refresh_token } = rotateTokens(refresh_token);

      // Decode the new access token to get the jti for audit logging
      const new_decoded = decodeToken(accessToken);
      const new_token_id = new_decoded?.jti || 'unknown';

      // Log token refresh event (non-blocking)
      if (old_decoded) {
        logTokenRefresh(old_decoded.id, old_decoded.email, new_token_id, request);
      }

      // Build success response
      const response = NextResponse.json({
        message: 'Tokens refreshed successfully',
      });

      // Set new access token cookie
      response.cookies.set('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60, // 1 hour
        path: '/',
      });

      // Set new refresh token cookie (rotation!)
      response.cookies.set('refresh_token', new_refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Token refresh failed';

      // Log failed refresh attempt (non-blocking)
      logTokenRefreshFailed(user_email, message, request);

      if (message === 'Token expired') {
        return NextResponse.json(
          { error: 'Refresh token expired', code: 'REFRESH_TOKEN_EXPIRED' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 }
      );
    }
  }, REFRESH_RATE_LIMIT);
}
