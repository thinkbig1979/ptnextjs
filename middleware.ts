import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware for route-level authentication
 *
 * Protects vendor dashboard routes by checking for authentication cookie.
 * Redirects unauthenticated users to login page.
 */
export function middleware(request: NextRequest) {
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

    // Token exists, allow access
    // Note: Token validation happens at API route level
    return NextResponse.next();
  }

  // Allow all other routes
  return NextResponse.next();
}

/**
 * Configure which routes this middleware should run on
 */
export const config = {
  matcher: [
    '/vendor/dashboard/:path*',
  ],
};
