/**
 * Vendor Portal Authentication Middleware
 *
 * Shared utility for authenticating and authorizing vendor portal API requests
 * using Payload CMS authentication.
 *
 * Usage:
 *   import { authenticateVendorPortal } from '@/lib/middleware/vendor-portal-auth';
 *
 *   const auth = await authenticateVendorPortal(request, vendorId);
 *   if ('error' in auth) {
 *     return NextResponse.json(
 *       { success: false, error: auth.error, message: auth.message },
 *       { status: auth.status }
 *     );
 *   }
 *   const { user, vendor } = auth;
 */

import { NextRequest } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { authService } from '@/lib/services/auth-service';

/**
 * Authentication error result
 */
export interface AuthError {
  error: string;
  status: number;
  message: string;
}

/**
 * Successful authentication result
 */
export interface AuthSuccess {
  user: {
    id: string;
    email: string;
    role: string;
    [key: string]: unknown;
  };
  vendor: {
    id: string;
    companyName: string;
    tier: string;
    user: string;
    [key: string]: unknown;
  };
}

/**
 * Authentication result type
 */
export type AuthResult = AuthError | AuthSuccess;

/**
 * Authenticate and authorize vendor portal access
 *
 * Validates:
 * 1. User is authenticated via Payload CMS token
 * 2. Vendor exists
 * 3. User owns the vendor account OR user is admin
 *
 * @param request - The Next.js request object
 * @param vendorId - The vendor ID to authenticate against
 * @returns AuthSuccess with user and vendor, or AuthError with error details
 */
export async function authenticateVendorPortal(
  request: NextRequest,
  vendorId: string
): Promise<AuthResult> {
  // Get token from cookie (same as other portal routes)
  const token =
    request.headers.get('authorization')?.replace('Bearer ', '') ||
    request.cookies.get('access_token')?.value;

  if (!token) {
    return { error: 'UNAUTHORIZED', status: 401, message: 'Authentication required' };
  }

  try {
    // Verify token using authService (same as other portal routes)
    const user = authService.validateToken(token);

    if (!user) {
      return { error: 'UNAUTHORIZED', status: 401, message: 'Invalid authentication token' };
    }

    // Get Payload instance to fetch vendor
    const payload = await getPayload({ config });

    // Fetch vendor
    const vendor = await payload.findByID({
      collection: 'vendors',
      id: vendorId,
    });

    if (!vendor) {
      return { error: 'NOT_FOUND', status: 404, message: 'Vendor not found' };
    }

    // Check if this user owns the vendor account or is admin
    const vendorUserId = typeof vendor.user === 'object' && vendor.user !== null
      ? (vendor.user as { id: string | number }).id
      : vendor.user;

    if (vendorUserId?.toString() !== user.id.toString() && user.role !== 'admin') {
      return { error: 'FORBIDDEN', status: 403, message: 'Cannot access another vendor account' };
    }

    return {
      user: user as unknown as AuthSuccess['user'],
      vendor: vendor as unknown as AuthSuccess['vendor'],
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { error: 'UNAUTHORIZED', status: 401, message: 'Authentication failed' };
  }
}

/**
 * Type guard to check if auth result is an error
 */
export function isAuthError(result: AuthResult): result is AuthError {
  return 'error' in result;
}
