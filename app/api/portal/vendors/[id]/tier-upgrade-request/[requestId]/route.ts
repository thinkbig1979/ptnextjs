/**
 * Vendor Portal API - Cancel Tier Upgrade Request
 *
 * DELETE /api/portal/vendors/[id]/tier-upgrade-request/[requestId] - Cancel pending request
 *
 * Authentication: Required (vendor role)
 * Authorization: Vendors can only cancel their own requests
 * Security: Rate limited to 10 requests per minute per IP
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import * as TierUpgradeRequestService from '@/lib/services/TierUpgradeRequestService';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { authService } from '@/lib/services/auth-service';

/**
 * Authenticate and authorize vendor access
 */
async function authenticateVendor(request: NextRequest, vendorId: string) {
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

    // Check if user has vendor relationship
    const vendor = await payload.findByID({
      collection: 'vendors',
      id: vendorId,
    });

    if (!vendor) {
      return { error: 'NOT_FOUND', status: 404, message: 'Vendor not found' };
    }

    // Check if this user owns the vendor account
    const vendorUserId = typeof vendor.user === 'object' && vendor.user !== null
      ? (vendor.user as { id: string | number }).id
      : vendor.user;

    if (vendorUserId?.toString() !== user.id.toString() && user.role !== 'admin') {
      return { error: 'FORBIDDEN', status: 403, message: 'Cannot access another vendor account' };
    }

    return { user, vendor };
  } catch (error) {
    console.error('Authentication error:', error);
    return { error: 'UNAUTHORIZED', status: 401, message: 'Authentication failed' };
  }
}

/**
 * DELETE - Cancel a pending tier upgrade request
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; requestId: string }> }
) {
  return rateLimit(request, async () => {
    try {
      const { id, requestId } = await params;
      const auth = await authenticateVendor(request, id);

      if ('error' in auth) {
        return NextResponse.json(
          { success: false, error: auth.error, message: auth.message },
          { status: auth.status }
        );
      }

      // Cancel the request
      const result = await TierUpgradeRequestService.cancelRequest(
        requestId,
        id
      );

      if (!result.success) {
        const statusCode = result.error === 'Request not found' ? 404 :
                          result.error === 'Request does not belong to vendor' ? 403 :
                          result.error === 'Can only cancel pending requests' ? 400 : 500;

        return NextResponse.json(
          {
            success: false,
            error: result.error?.toUpperCase().replace(/ /g, '_') || 'CANCEL_FAILED',
            message: result.error || 'Failed to cancel request',
          },
          { status: statusCode }
        );
      }

      return NextResponse.json(
        { success: true, message: 'Request cancelled successfully' },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error cancelling tier upgrade request:', error);
      return NextResponse.json(
        { success: false, error: 'INTERNAL_ERROR', message: 'Failed to cancel request' },
        { status: 500 }
      );
    }
  });
}
