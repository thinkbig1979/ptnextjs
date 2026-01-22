import { NextRequest, NextResponse } from 'next/server';
import { decodeToken } from '@/lib/utils/jwt';
import { deferLogLogout } from '@/lib/services/audit-service';

/**
 * POST /api/auth/logout
 *
 * Clears authentication cookies and logs the logout event
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Try to decode the access token to log the logout event
  const access_token = request.cookies.get('access_token')?.value;
  if (access_token) {
    const decoded = decodeToken(access_token);
    if (decoded) {
      // Log logout event (deferred via Next.js after() - runs after response sent)
      deferLogLogout(decoded.id, decoded.email, request);
    }
  }

  const response = NextResponse.json({
    message: 'Logout successful',
  });

  // Clear access token cookie
  response.cookies.set('access_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0, // Expire immediately
    path: '/',
  });

  // Clear refresh token cookie
  response.cookies.set('refresh_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0, // Expire immediately
    path: '/',
  });

  return response;
}
