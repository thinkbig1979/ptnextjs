import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth-service';
import { rateLimit } from '@/lib/middleware/rateLimit';

// Rate limit: 5 attempts per 15 minutes per IP
const LOGIN_RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  identifier: '/api/auth/login',
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  return rateLimit(request, async () => {
    try {
      const body = await request.json();
      const { email, password } = body;

      // Validate input
      if (!email || !password) {
        return NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        );
      }

      // Authenticate user
      const loginResponse = await authService.login(email, password);

      // Set httpOnly cookies for security
      const response = NextResponse.json({
        user: loginResponse.user,
        message: 'Login successful',
      });

      // Set access token cookie (1 hour)
      response.cookies.set('access_token', loginResponse.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60, // 1 hour
        path: '/',
      });

      // Set refresh token cookie (7 days)
      response.cookies.set('refresh_token', loginResponse.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';

      // Return appropriate error status
      if (message.includes('Invalid credentials') || message.includes('pending approval')) {
        return NextResponse.json({ error: message }, { status: 401 });
      }

      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }, LOGIN_RATE_LIMIT);
}
