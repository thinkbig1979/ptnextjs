/**
 * Auth Middleware
 *
 * @deprecated This module is deprecated. Use `@/lib/auth` instead.
 *
 * Migration guide:
 * ```typescript
 * // Before:
 * import { authMiddleware, requireRole, getUserFromRequest } from '@/lib/middleware/auth-middleware';
 *
 * // After:
 * import { validateToken, requireRole, isAuthError } from '@/lib/auth';
 * ```
 *
 * This module is maintained for backward compatibility but will be removed
 * in a future version.
 */

// Log deprecation warning on first import
if (typeof console !== 'undefined') {
  console.warn(
    '[DEPRECATED] @/lib/middleware/auth-middleware is deprecated. ' +
    'Use @/lib/auth instead. See the module documentation for migration guide.'
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth-service';
import type { JWTPayload, LegacyJWTPayload } from '@/lib/utils/jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Extract JWT token from request headers or cookies
 */
function extractToken(request: NextRequest): string | null {
  // Try Authorization header first (Bearer token)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try httpOnly cookie
  const cookieToken = request.cookies.get('access_token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

/**
 * Middleware to validate JWT token and attach user to request
 */
export async function authMiddleware(request: NextRequest): Promise<NextResponse> {
  const token = extractToken(request);

  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const user = authService.validateToken(token);

    // Attach user to request headers so API routes can access it
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id);
    requestHeaders.set('x-user-email', user.email);
    requestHeaders.set('x-user-role', user.role);
    if (user.tier) {
      requestHeaders.set('x-user-tier', user.tier);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid token';

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

/**
 * Middleware to check if user has required role
 */
export function requireRole(allowedRoles: Array<'admin' | 'vendor'>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const token = extractToken(request);

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    try {
      const user = authService.validateToken(token);

      if (!allowedRoles.includes(user.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      // Attach user to request headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', user.id);
      requestHeaders.set('x-user-email', user.email);
      requestHeaders.set('x-user-role', user.role);
      if (user.tier) {
        requestHeaders.set('x-user-tier', user.tier);
      }

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  };
}

/**
 * Middleware to check if vendor has required tier
 */
export function requireTier(minTier: 'free' | 'tier1' | 'tier2') {
  return async (request: NextRequest): Promise<NextResponse> => {
    const token = extractToken(request);

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    try {
      const user = authService.validateToken(token);

      // Admin bypass tier restrictions
      if (user.role === 'admin') {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', user.id);
        requestHeaders.set('x-user-email', user.email);
        requestHeaders.set('x-user-role', user.role);

        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      }

      // Check vendor tier
      const tierLevels = { free: 0, tier1: 1, tier2: 2 };
      const userTier = user.tier || 'free';

      if (tierLevels[userTier] < tierLevels[minTier]) {
        return NextResponse.json(
          {
            error: 'Upgrade required',
            message: `This feature requires ${minTier} tier subscription`,
            current_tier: userTier,
            required_tier: minTier,
          },
          { status: 403 }
        );
      }

      // Attach user to request headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', user.id);
      requestHeaders.set('x-user-email', user.email);
      requestHeaders.set('x-user-role', user.role);
      requestHeaders.set('x-user-tier', userTier);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
  };
}

/**
 * Extract user from request headers (set by auth middleware)
 *
 * Note: This returns a LegacyJWTPayload without the new token fields
 * since headers only contain basic user info.
 */
export function getUserFromRequest(request: NextRequest): LegacyJWTPayload | null {
  const id = request.headers.get('x-user-id');
  const email = request.headers.get('x-user-email');
  const role = request.headers.get('x-user-role') as 'admin' | 'vendor';
  const tier = request.headers.get('x-user-tier') as 'free' | 'tier1' | 'tier2' | null;

  if (!id || !email || !role) {
    return null;
  }

  return {
    id,
    email,
    role,
    tier: tier || undefined,
  };
}
