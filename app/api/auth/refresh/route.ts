import { NextRequest, NextResponse } from 'next/server';
import { rotateTokens } from '@/lib/utils/jwt';
import { rateLimit } from '@/lib/middleware/rateLimit';

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
    try {
      // Extract refresh token from httpOnly cookie
      const refreshToken = request.cookies.get('refresh_token')?.value;

      if (!refreshToken) {
        return NextResponse.json(
          { error: 'No refresh token provided' },
          { status: 401 }
        );
      }

      // Rotate both tokens (verifies and generates new pair)
      const { accessToken, refreshToken: newRefreshToken } = rotateTokens(refreshToken);

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
      response.cookies.set('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Token refresh failed';

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
