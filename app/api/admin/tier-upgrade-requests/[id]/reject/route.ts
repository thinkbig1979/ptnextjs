/**
 * Admin API - Reject Tier Upgrade Request
 *
 * PUT /api/admin/tier-upgrade-requests/[id]/reject - Reject request with reason
 *
 * Authentication: Required (admin role)
 * Authorization: Admin only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import * as TierUpgradeRequestService from '@/lib/services/TierUpgradeRequestService';

/**
 * Authenticate admin user
 */
async function authenticateAdmin(request: NextRequest) {
  const payload = await getPayload({ config });

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
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateAdmin(request);

    if ('error' in auth) {
      return NextResponse.json(
        { success: false, error: auth.error, message: auth.message },
        { status: auth.status }
      );
    }

    const { user } = auth;
    const body = await request.json();

    // Validate rejection reason
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
      params.id,
      user.id,
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
}
