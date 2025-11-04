#!/bin/bash
set -e

cd /home/edwin/development/ptnextjs

# Apply fixes
echo "Applying authentication fixes..."

# Fix 1: Copy the corrected seed API
cp seed-route-fixed.ts app/api/test/vendors/seed/route.ts
echo "✓ Fixed: app/api/test/vendors/seed/route.ts (removed double hashing)"

# Fix 2: Update login endpoint with logging
cat > app/api/auth/login/route-temp.ts << 'ENDFILE'
import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth-service';

export async function POST(request: NextRequest) {
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

    // Log login attempt (without password)
    console.log('[Login] Attempt:', {
      email,
      timestamp: new Date().toISOString(),
    });

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

    // Log authentication failures for debugging
    console.error('[Login] Authentication error:', {
      email: (request.body as any)?.email || 'unknown',
      error: message,
      timestamp: new Date().toISOString(),
    });

    // Return appropriate error status
    if (message.includes('Invalid credentials') || message.includes('pending approval')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
ENDFILE

mv app/api/auth/login/route-temp.ts app/api/auth/login/route.ts
echo "✓ Fixed: app/api/auth/login/route.ts (added debugging)"

echo ""
echo "=========================================="
echo "All fixes applied successfully!"
echo "=========================================="
echo ""
echo "To verify the fixes:"
echo "1. Start the dev server: npm run dev"
echo "2. Run authentication tests: npm run test:e2e -- tests/e2e/vendor-onboarding/03-authentication.spec.ts"
echo ""
