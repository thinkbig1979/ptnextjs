/**
 * Unified Authentication Module
 *
 * Consolidated authentication API for the Paul Thames Superyacht Technology platform.
 * This module provides a consistent interface for token validation, role-based access,
 * and vendor ownership checks.
 *
 * Features:
 * - Token extraction from Authorization header or httpOnly cookie
 * - Token signature verification with separate access/refresh secrets
 * - Token version validation against database (for revocation)
 * - Role-based access control
 * - Vendor ownership verification with admin bypass
 *
 * @module lib/auth
 */

import { NextRequest } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { verifyAccessToken } from '@/lib/utils/jwt';
import type {
  AuthResult,
  AuthSuccess,
  AuthError,
  AuthUser,
  VendorOwnershipResult,
} from './types';

// Re-export types for convenience
export type {
  AuthResult,
  AuthSuccess,
  AuthError,
  AuthUser,
  VendorOwnershipResult,
} from './types';

/**
 * Extract JWT token from request
 *
 * Priority:
 * 1. Authorization header (Bearer token)
 * 2. access_token cookie
 *
 * @param request - The incoming request
 * @returns The token string or null if not found
 */
function extractToken(request: NextRequest): string | null {
  // Try Authorization header first
  const auth_header = request.headers.get('authorization');
  if (auth_header?.startsWith('Bearer ')) {
    return auth_header.substring(7);
  }

  // Fall back to cookie
  const cookie_token = request.cookies.get('access_token')?.value;
  if (cookie_token) {
    return cookie_token;
  }

  return null;
}

/**
 * Validate an access token and verify the user's token version
 *
 * This is the core authentication function. It:
 * 1. Extracts the token from the request
 * 2. Verifies the token signature
 * 3. Validates the token version against the database
 *
 * @param request - The incoming request
 * @returns AuthResult with user data on success, or error details on failure
 */
export async function validateToken(request: NextRequest): Promise<AuthResult> {
  const token = extractToken(request);

  if (!token) {
    return {
      success: false,
      error: 'Authentication required',
      status: 401,
      code: 'UNAUTHORIZED',
    };
  }

  try {
    // Verify token signature and decode
    const decoded = verifyAccessToken(token);

    // Validate token version against database
    const payload = await getPayload({ config });
    const users = await payload.find({
      collection: 'users',
      where: {
        id: { equals: decoded.id },
      },
      limit: 1,
    });

    const user = users.docs[0];

    if (!user) {
      return {
        success: false,
        error: 'User not found',
        status: 401,
        code: 'TOKEN_INVALID',
      };
    }

    // Check token version for revocation
    const current_token_version = user.tokenVersion ?? 0;
    const token_version = decoded.tokenVersion ?? 0;

    if (token_version < current_token_version) {
      return {
        success: false,
        error: 'Token revoked',
        status: 401,
        code: 'TOKEN_REVOKED',
      };
    }

    // Build the authenticated user object
    const auth_user: AuthUser = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      tier: decoded.tier,
      status: decoded.status,
      tokenVersion: token_version,
      type: decoded.type,
      jti: decoded.jti,
    };

    return {
      success: true,
      user: auth_user,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token verification failed';

    if (message === 'Token expired') {
      return {
        success: false,
        error: 'Token expired',
        status: 401,
        code: 'TOKEN_EXPIRED',
      };
    }

    return {
      success: false,
      error: 'Invalid token',
      status: 401,
      code: 'TOKEN_INVALID',
    };
  }
}

/**
 * Require authentication for a request
 *
 * Validates the token and returns the user if authenticated,
 * or an error result if not.
 *
 * @param request - The incoming request
 * @returns AuthResult with user on success
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  return validateToken(request);
}

/**
 * Require specific role(s) for a request
 *
 * Returns a function that validates the token and checks if the user
 * has one of the allowed roles.
 *
 * @param allowed_roles - Array of roles that are permitted
 * @returns Function that validates request and checks role
 */
export function requireRole(
  allowed_roles: Array<'admin' | 'vendor'>
): (request: NextRequest) => Promise<AuthResult> {
  return async (request: NextRequest): Promise<AuthResult> => {
    const result = await validateToken(request);

    if (!result.success) {
      return result;
    }

    if (!allowed_roles.includes(result.user.role)) {
      return {
        success: false,
        error: 'Insufficient permissions',
        status: 403,
        code: 'UNAUTHORIZED',
      };
    }

    return result;
  };
}

/**
 * Require admin role for a request
 *
 * Shortcut for requireRole(['admin'])
 *
 * @param request - The incoming request
 * @returns AuthResult - success with admin user or error
 */
export async function requireAdmin(request: NextRequest): Promise<AuthResult> {
  return requireRole(['admin'])(request);
}

/**
 * Require vendor ownership or admin access
 *
 * Validates that the authenticated user either:
 * 1. Is an admin (bypass ownership check)
 * 2. Is the owner of the specified vendor
 *
 * @param vendor_id - The vendor ID to check ownership for
 * @returns Function that validates request and checks ownership
 */
export function requireVendorOwnership(
  vendor_id: string
): (request: NextRequest) => Promise<VendorOwnershipResult> {
  return async (request: NextRequest): Promise<VendorOwnershipResult> => {
    const result = await validateToken(request);

    if (!result.success) {
      return result;
    }

    // Admin bypass - can access any vendor
    if (result.user.role === 'admin') {
      return {
        success: true,
        user: result.user,
        vendor: {
          id: vendor_id,
          user: 'admin-bypass',
        },
      };
    }

    // Check vendor ownership
    try {
      const payload = await getPayload({ config });
      const vendors = await payload.find({
        collection: 'vendors',
        where: {
          id: { equals: vendor_id },
        },
        limit: 1,
      });

      const vendor = vendors.docs[0];

      if (!vendor) {
        return {
          success: false,
          error: 'Vendor not found',
          status: 404,
          code: 'UNAUTHORIZED',
        };
      }

      // Check if the vendor belongs to this user
      const vendor_user_id = typeof vendor.user === 'string'
        ? vendor.user
        : (vendor.user as { id: string })?.id;

      if (vendor_user_id !== result.user.id) {
        return {
          success: false,
          error: 'Access denied',
          status: 403,
          code: 'UNAUTHORIZED',
        };
      }

      return {
        success: true,
        user: result.user,
        vendor: {
          id: String(vendor.id),
          user: vendor_user_id,
          ...vendor,
        },
      };
    } catch (error) {
      console.error('[Auth] Vendor ownership check failed:', error);
      return {
        success: false,
        error: 'Access denied',
        status: 403,
        code: 'UNAUTHORIZED',
      };
    }
  };
}

/**
 * Type guard to check if a result is an auth error
 *
 * @param result - The result to check
 * @returns True if the result is an error
 */
export function isAuthError(result: AuthResult | VendorOwnershipResult): result is AuthError {
  return result.success === false;
}

/**
 * Type guard to check if a result is successful
 *
 * @param result - The result to check
 * @returns True if the result is successful
 */
export function isAuthSuccess(result: AuthResult): result is AuthSuccess {
  return result.success === true;
}
