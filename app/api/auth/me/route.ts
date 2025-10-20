import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth-service';
import { getPayload } from 'payload';
import config from '@/payload.config';

/**
 * GET /api/auth/me
 *
 * Returns current authenticated user from JWT token in httpOnly cookie
 * Also fetches fresh approval status from database to ensure it's up-to-date
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

    // Fetch fresh approval status from database
    try {
      const payload = await getPayload({ config });
      const userDoc = await payload.findByID({
        collection: 'users',
        id: user.id,
      });

      // Update status from database if user is a vendor
      if (userDoc && user.role === 'vendor') {
        user.status = (userDoc.status as any) || 'pending';
      }
    } catch (dbError) {
      // If database fetch fails, continue with JWT status
      console.warn('[Auth] Failed to fetch fresh user status from database:', dbError);
    }

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
