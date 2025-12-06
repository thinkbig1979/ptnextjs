import { NextRequest, NextResponse } from 'next/server';
import { refreshAccessToken } from '@/lib/utils/jwt';

/**
 * POST /api/auth/refresh
 *
 * Refreshes access token using refresh token from httpOnly cookie
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract refresh token from httpOnly cookie
    const refreshToken = request.cookies.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token provided' },
        { status: 401 }
      );
    }

    // Generate new access token
    const newAccessToken = refreshAccessToken(refreshToken);

    // Set new access token cookie
    const response = NextResponse.json({
      message: 'Token refreshed successfully',
    });

    response.cookies.set('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 hour
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
}
