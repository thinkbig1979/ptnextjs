import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth-service';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { logLoginSuccess, logLoginFailed } from '@/lib/services/audit-service';
import { decodeToken } from '@/lib/utils/jwt';

// Rate limit: 5 attempts per 15 minutes per IP
const LOGIN_RATE_LIMIT = {
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  identifier: '/api/auth/login',
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  return rateLimit(request, async () => {
    let email_attempt = '';

    try {
      const body = await request.json();
      const { email, password } = body;
      email_attempt = email || '';

      // Validate input
      if (!email || !password) {
        return NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        );
      }

      // Authenticate user
      const login_response = await authService.login(email, password);

      // Extract the jti from the new access token for audit logging
      const decoded = decodeToken(login_response.tokens.accessToken);
      const token_id = decoded?.jti || 'unknown';

      // Log successful login (non-blocking)
      logLoginSuccess(
        login_response.user.id,
        login_response.user.email,
        token_id,
        request
      );

      // Set httpOnly cookies for security
      const response = NextResponse.json({
        user: login_response.user,
        message: 'Login successful',
      });

      // Set access token cookie (1 hour)
      response.cookies.set('access_token', login_response.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60, // 1 hour
        path: '/',
      });

      // Set refresh token cookie (7 days)
      response.cookies.set('refresh_token', login_response.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      console.error('[Login API] Error:', error);

      // Log failed login attempt (non-blocking)
      if (email_attempt) {
        logLoginFailed(email_attempt, message, request);
      }

      // Return appropriate error status
      if (message.includes('Invalid credentials') || message.includes('pending approval') || message.includes('suspended') || message.includes('rejected') || message.includes('not approved')) {
        return NextResponse.json({ error: message }, { status: 401 });
      }

      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }, LOGIN_RATE_LIMIT);
}
