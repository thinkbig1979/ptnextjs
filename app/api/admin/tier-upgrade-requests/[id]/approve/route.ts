/**
 * Admin API - Approve Tier Upgrade Request
 *
 * PUT /api/admin/tier-upgrade-requests/[id]/approve - Approve request and update vendor tier
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
 * PUT - Approve a tier upgrade request (atomically updates vendor tier)
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

    // Approve the request
    const result = await TierUpgradeRequestService.approveRequest(
      params.id,
      user.id
    );

    if (!result.success) {
      const statusCode = result.error === 'Request not found' ? 404 :
                        result.error === 'Can only approve pending requests' ? 400 : 500;

      return NextResponse.json(
        {
          success: false,
          error: result.error?.toUpperCase().replace(/ /g, '_') || 'APPROVE_FAILED',
          message: result.error || 'Failed to approve request',
        },
        { status: statusCode }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Tier upgrade request approved and vendor tier updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error approving tier upgrade request:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR', message: 'Failed to approve request' },
      { status: 500 }
    );
  }
}
