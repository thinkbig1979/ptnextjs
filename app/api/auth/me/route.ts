import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth-service';

/**
 * GET /api/auth/me
 *
 * Returns current authenticated user from JWT token in httpOnly cookie
 */
export async function GET(request: NextRequest) {
  try {
    // Extract token from httpOnly cookie
    const token = request.cookies.get('access_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Validate token and get user data
    const user = authService.validateToken(token);

    return NextResponse.json({
      user,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication failed';

    if (message === 'Token expired') {
      return NextResponse.json(
        { error: 'Token expired', code: 'TOKEN_EXPIRED' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}
