import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 *
 * Clears authentication cookies
 */
export async function POST(request: NextRequest) {
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
