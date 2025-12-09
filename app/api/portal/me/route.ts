import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth-service';

/**
 * GET /api/portal/me - Get current authenticated user information
 *
 * This endpoint returns the authenticated user's basic information
 * extracted from their JWT token. It's useful for verifying authentication
 * status and getting the current user's details.
 *
 * @returns User information from JWT token
 * @throws 401 if no valid authentication token is provided
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract token from cookie or Authorization header
    const token = request.cookies.get('access_token')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validate token and extract user information
    const user = authService.validateToken(token);

    // Return user information
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        // Include type and jti for new tokens (optional for legacy tokens)
        ...(('type' in user) && { type: user.type }),
        ...(('jti' in user) && { jti: user.jti }),
      }
    });
  } catch (error) {
    // Token validation failed
    const message = error instanceof Error ? error.message : 'Invalid or expired token';
    return NextResponse.json(
      { error: message },
      { status: 401 }
    );
  }
}
