import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Next.js Middleware for route-level authentication and security headers
 *
 * Features:
 * - Protects vendor dashboard routes with token signature validation
 * - Applies security headers to all API routes
 * - HSTS header in production
 * - Redirects unauthenticated users to login page
 *
 * Note: Uses 'jose' library instead of 'jsonwebtoken' for Edge Runtime compatibility.
 * The 'jsonwebtoken' library relies on Node.js crypto APIs which are not available
 * in Edge Runtime where Next.js middleware runs.
 */

/**
 * Lightweight token verification for middleware (Edge Runtime compatible)
 *
 * Only validates signature and type, no database call.
 * Full tokenVersion validation happens in API routes.
 */
async function verifyTokenLightweight(token: string): Promise<boolean> {
  try {
    const secret = process.env.JWT_ACCESS_SECRET || process.env.PAYLOAD_SECRET;
    if (!secret) return false;

    // Convert secret to Uint8Array for jose library
    const secretKey = new TextEncoder().encode(secret);

    const { payload } = await jwtVerify(token, secretKey);

    // Verify it's an access token (new format)
    // Legacy tokens without type are still accepted
    if (payload.type && payload.type !== 'access') {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if accessing vendor dashboard routes
  if (pathname.startsWith('/vendor/dashboard')) {
    // Check for authentication token
    const token = request.cookies.get('access_token')?.value;

    if (!token) {
      // Redirect to login with return URL
      const loginUrl = new URL('/vendor/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Validate token signature (lightweight - no DB call)
    const isValidToken = await verifyTokenLightweight(token);
    if (!isValidToken) {
      // Token invalid or expired - redirect to login with error
      const loginUrl = new URL('/vendor/login', request.url);
      loginUrl.searchParams.set('error', 'session_expired');

      const response = NextResponse.redirect(loginUrl);

      // Clear invalid cookies
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');

      return response;
    }

    // Token valid, allow access
    // Full tokenVersion check happens at API route level
    return NextResponse.next();
  }

  // Apply security headers to custom API routes only
  // IMPORTANT: Exclude Payload CMS API routes as they need different CSP settings
  // for the admin panel to function properly
  // Payload CMS routes: /api/(anything that's not explicitly our custom routes)
  const isCustomApiRoute = pathname.startsWith('/api/portal') ||
                           pathname.startsWith('/api/geocode') ||
                           pathname.startsWith('/api/contact') ||
                           pathname.startsWith('/api/auth');

  if (isCustomApiRoute) {
    const response = NextResponse.next();

    // Content Security Policy (CSP)
    // Restricts sources for scripts, styles, images, etc. to prevent XSS attacks
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Allow inline scripts for Next.js
      "style-src 'self' 'unsafe-inline'", // Allow inline styles
      "img-src 'self' data: https:", // Allow images from same origin, data URIs, and HTTPS
      "font-src 'self' data:", // Allow fonts from same origin and data URIs
      "connect-src 'self'", // API calls to same origin only
      "frame-ancestors 'none'", // Prevent framing (equivalent to X-Frame-Options: DENY)
      "base-uri 'self'", // Restrict base element URLs
      "form-action 'self'", // Restrict form submission targets
    ].join('; ');

    response.headers.set('Content-Security-Policy', cspDirectives);

    // X-Content-Type-Options: Prevents MIME type sniffing
    // Ensures browsers respect the Content-Type header
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // X-Frame-Options: Prevents clickjacking attacks
    // Ensures the API cannot be embedded in iframes
    response.headers.set('X-Frame-Options', 'DENY');

    // X-XSS-Protection: Legacy XSS protection (for older browsers)
    // Modern browsers use CSP, but this provides fallback protection
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Strict-Transport-Security: Enforces HTTPS in production
    // Forces browsers to only use HTTPS for future requests
    if (process.env.NODE_ENV === 'production') {
      response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains'
      );
    }

    // Referrer-Policy: Controls referrer information
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions-Policy: Restricts browser features
    response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    return response;
  }

  // Allow all other routes
  return NextResponse.next();
}

/**
 * Configure which routes this middleware should run on
 *
 * IMPORTANT: We explicitly list only our custom routes to avoid interfering
 * with Payload CMS API routes which handle their own CORS and security headers.
 * The middleware should NOT run for Payload's /api/* routes at all.
 */
export const config = {
  matcher: [
    '/vendor/dashboard/:path*',
    '/api/portal/:path*',
    '/api/geocode/:path*',
    '/api/contact/:path*',
    '/api/auth/:path*',
  ],
};
