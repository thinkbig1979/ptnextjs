/**
 * Admin API - Reject Tier Change Request (Upgrade or Downgrade)
 *
 * PUT /api/admin/tier-upgrade-requests/[id]/reject - Reject request with reason
 *
 * This route works for BOTH tier upgrade and downgrade requests.
 * A rejection reason is required (10-1000 characters).
 *
 * Authentication: Required (admin role)
 * Authorization: Admin only
 * Security: Rate limited to 10 requests per minute per IP
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/lib/utils/get-payload-config';
import * as TierUpgradeRequestService from '@/lib/services/TierUpgradeRequestService';
import { rateLimit } from '@/lib/middleware/rateLimit';

/**
 * Authenticate admin user
 */
async function authenticateAdmin(request: NextRequest) {
  const payload = await getPayloadClient();

  // Get user from cookie
  const token = request.cookies.get('payload-token')?.value;

  if (!token) {
    return { error: 'UNAUTHORIZED', status: 401, message: 'Authentication required' };
  }

  try {
    // Verify token and get user
    const { user } = await payload.auth({ headers: request.headers });

    if (!user) {
      return { error: 'UNAUTHORIZED', status: 401, message: 'Invalid authentication token' };
    }

    // Check admin role
    if (user.role !== 'admin') {
      return { error: 'FORBIDDEN', status: 403, message: 'Admin access required' };
    }

    return { user };
  } catch (error) {
    console.error('Authentication error:', error);
    return { error: 'UNAUTHORIZED', status: 401, message: 'Authentication failed' };
  }
}

/**
 * PUT - Reject a tier upgrade request with reason
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return rateLimit(request, async () => {
    try {
      const auth = await authenticateAdmin(request);

      if ('error' in auth) {
        return NextResponse.json(
          { success: false, error: auth.error, message: auth.message },
          { status: auth.status }
        );
      }

      const { user } = auth;
      const { id } = await params;
      const body = await request.json();

      // Validate rejection reason - enhanced validation
      if (!body.rejectionReason || body.rejectionReason.trim().length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Rejection reason is required',
          },
          { status: 400 }
        );
      }

      // Minimum length validation (security requirement)
      if (body.rejectionReason.trim().length < 10) {
        return NextResponse.json(
          {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Rejection reason must be at least 10 characters',
          },
          { status: 400 }
        );
      }

      // Maximum length validation
      if (body.rejectionReason.length > 1000) {
        return NextResponse.json(
          {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Rejection reason must not exceed 1000 characters',
          },
          { status: 400 }
        );
      }

      // Reject the request
      const result = await TierUpgradeRequestService.rejectRequest(
        id,
        String(user.id),
        body.rejectionReason
      );

      if (!result.success) {
        const statusCode = result.error === 'Request not found' ? 404 :
                          result.error === 'Can only reject pending requests' ? 400 : 500;

        return NextResponse.json(
          {
            success: false,
            error: result.error?.toUpperCase().replace(/ /g, '_') || 'REJECT_FAILED',
            message: result.error || 'Failed to reject request',
          },
          { status: statusCode }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Tier upgrade request rejected successfully',
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error rejecting tier upgrade request:', error);
      return NextResponse.json(
        { success: false, error: 'INTERNAL_ERROR', message: 'Failed to reject request' },
        { status: 500 }
      );
    }
  });
}
