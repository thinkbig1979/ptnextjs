/**
 * Admin Authentication Utility
 *
 * @deprecated This module is deprecated. Use `@/lib/auth` instead.
 *
 * Migration guide:
 * ```typescript
 * // Before:
 * import { authenticateAdmin, isAuthError } from '@/lib/utils/admin-auth';
 *
 * // After:
 * import { requireAdmin, isAuthError } from '@/lib/auth';
 * ```
 *
 * This module is maintained for backward compatibility but will be removed
 * in a future version.
 */

// Log deprecation warning on first import
if (typeof console !== 'undefined') {
  console.warn(
    '[DEPRECATED] @/lib/utils/admin-auth is deprecated. ' +
    'Use @/lib/auth instead. See the module documentation for migration guide.'
  );
}

/**
 * @deprecated Use `@/lib/auth` instead.
 *
 * Provides standardized authentication for all admin API routes.
 * Uses Payload CMS authentication with support for both cookie and header tokens.
 *
 * Security:
 * - Verifies admin role
 * - Supports multiple token sources (cookie, header)
 * - Returns structured error responses
 * - Async authentication via Payload CMS
 *
 * Usage:
 * ```typescript
 * import { authenticateAdmin } from '@/lib/utils/admin-auth';
 *
 * export async function GET(request: NextRequest) {
 *   const auth = await authenticateAdmin(request);
 *
 *   if ('error' in auth) {
 *     return NextResponse.json(
 *       { error: auth.error, message: auth.message },
 *       { status: auth.status }
 *     );
 *   }
 *
 *   const { user } = auth;
 *   // ... use authenticated user
 * }
 * ```
 */

import { NextRequest } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

/**
 * Authentication Error Response
 */
interface AuthError {
  error: 'UNAUTHORIZED' | 'FORBIDDEN' | 'AUTHENTICATION_FAILED';
  status: 401 | 403;
  message: string;
}

/**
 * Authentication Success Response
 */
interface AuthSuccess {
  user: {
    id: string | number;
    email: string;
    role: string;
    [key: string]: unknown;
  };
}

/**
 * Authentication Result
 */
export type AuthResult = AuthError | AuthSuccess;

/**
 * Authenticate admin user from request
 *
 * Supports multiple token sources:
 * 1. payload-token cookie (Payload CMS default)
 * 2. access_token cookie (legacy support)
 * 3. Authorization header (Bearer token)
 *
 * @param request - Next.js request object
 * @returns Authentication result with user or error
 */
export async function authenticateAdmin(request: NextRequest): Promise<AuthResult> {
  const payload = await getPayload({ config });

  // Support multiple token sources for backward compatibility
  const token =
    request.cookies.get('payload-token')?.value ||
    request.cookies.get('access_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return {
      error: 'UNAUTHORIZED',
      status: 401,
      message: 'Authentication required',
    };
  }

  try {
    // Verify token and get user via Payload CMS auth
    const { user } = await payload.auth({ headers: request.headers });

    if (!user) {
      return {
        error: 'UNAUTHORIZED',
        status: 401,
        message: 'Invalid authentication token',
      };
    }

    // Check admin role
    if (user.role !== 'admin') {
      return {
        error: 'FORBIDDEN',
        status: 403,
        message: 'Admin access required',
      };
    }

    // We've verified the user has the admin role, cast to AuthSuccess type
    return { user: user as unknown as AuthSuccess['user'] };
  } catch (error) {
    console.error('[Admin Auth] Authentication error:', error);
    return {
      error: 'AUTHENTICATION_FAILED',
      status: 401,
      message: 'Authentication failed',
    };
  }
}

/**
 * Type guard to check if auth result is an error
 *
 * @param auth - Authentication result
 * @returns True if result is an error
 */
export function isAuthError(auth: AuthResult): auth is AuthError {
  return 'error' in auth;
}

/**
 * Type guard to check if auth result is successful
 *
 * @param auth - Authentication result
 * @returns True if result contains user
 */
export function isAuthSuccess(auth: AuthResult): auth is AuthSuccess {
  return 'user' in auth;
}
