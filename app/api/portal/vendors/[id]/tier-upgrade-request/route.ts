/**
 * Vendor Portal API - Tier Upgrade Request Management
 *
 * POST   /api/portal/vendors/[id]/tier-upgrade-request - Submit new request
 * GET    /api/portal/vendors/[id]/tier-upgrade-request - Get pending/recent request
 *
 * Authentication: Required (vendor role)
 * Authorization: Vendors can only access their own requests
 * Security: Rate limited to 10 requests per minute per IP
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/lib/utils/get-payload-config';
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
    const payload = await getPayloadClient();

    // Check if user has vendor relationship
    const vendor = await payload.findByID({
      collection: 'vendors',
      id: vendorId,
    });

    if (!vendor) {
      return { error: 'NOT_FOUND', status: 404, message: 'Vendor not found' };
    }

    if (!vendor.user) {
      return { error: 'FORBIDDEN', status: 403, message: 'Vendor not linked to user account' };
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
 * POST - Submit a new tier upgrade request
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return rateLimit(request, async () => {
    try {
      const { id } = await params;
      const auth = await authenticateVendor(request, id);

      if ('error' in auth) {
        return NextResponse.json(
          { success: false, error: auth.error, message: auth.message },
          { status: auth.status }
        );
      }

      const { user, vendor } = auth;
      const body = await request.json();

      // Validate request body
      if (!body.requestedTier) {
        return NextResponse.json(
          {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Requested tier is required',
          },
          { status: 400 }
        );
      }

      // Validate tier upgrade
      const validation = TierUpgradeRequestService.validateTierUpgradeRequest({
        vendor: id,
        user: String(user.id),
        currentTier: vendor.tier,
        requestedTier: body.requestedTier,
        vendorNotes: body.vendorNotes,
        status: 'pending',
      });

      if (!validation.valid) {
        return NextResponse.json(
          {
            success: false,
            error: 'VALIDATION_ERROR',
            message: validation.errors.join(', '),
            details: validation.errors.map(error => ({ issue: error })),
          },
          { status: 400 }
        );
      }

      // Check for duplicate pending request
      const existingRequest = await TierUpgradeRequestService.getPendingRequest(id);

      if (existingRequest) {
        return NextResponse.json(
          {
            success: false,
            error: 'DUPLICATE_REQUEST',
            message: 'You already have a pending upgrade request',
            existingRequest: {
              id: existingRequest.id,
              requestedTier: existingRequest.requestedTier,
              requestedAt: existingRequest.requestedAt,
            },
          },
          { status: 409 }
        );
      }

      // Create the request
      const newRequest = await TierUpgradeRequestService.createUpgradeRequest({
        vendorId: id,
        userId: String(user.id),
        requestedTier: body.requestedTier,
        vendorNotes: body.vendorNotes,
      });

      return NextResponse.json(
        { success: true, data: newRequest },
        { status: 201 }
      );
    } catch (error) {
      console.error('Error creating tier upgrade request:', error);
      return NextResponse.json(
        { success: false, error: 'INTERNAL_ERROR', message: 'Failed to create request' },
        { status: 500 }
      );
    }
  });
}

/**
 * GET - Get pending or most recent tier upgrade request
 * Note: GET requests are not rate-limited as aggressively since they're read-only
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await authenticateVendor(request, id);

    if ('error' in auth) {
      return NextResponse.json(
        { success: false, error: auth.error, message: auth.message },
        { status: auth.status }
      );
    }

    // Get pending request first, fall back to most recent
    const tierRequest = await TierUpgradeRequestService.getPendingRequest(id)
      ?? await TierUpgradeRequestService.getMostRecentRequest(id);

    return NextResponse.json({ success: true, data: tierRequest });
  } catch (error) {
    console.error('Error fetching tier upgrade request:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR', message: 'Failed to fetch request' },
      { status: 500 }
    );
  }
}
