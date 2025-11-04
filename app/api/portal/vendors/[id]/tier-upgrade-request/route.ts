/**
 * Vendor Portal API - Tier Upgrade Request Management
 *
 * POST   /api/portal/vendors/[id]/tier-upgrade-request - Submit new request
 * GET    /api/portal/vendors/[id]/tier-upgrade-request - Get pending/recent request
 *
 * Authentication: Required (vendor role)
 * Authorization: Vendors can only access their own requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import * as TierUpgradeRequestService from '@/lib/services/TierUpgradeRequestService';

/**
 * Authenticate and authorize vendor access
 */
async function authenticateVendor(request: NextRequest, vendorId: string) {
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

    // Check if user has vendor relationship
    const vendor = await payload.findByID({
      collection: 'vendors',
      id: vendorId,
    });

    if (!vendor) {
      return { error: 'NOT_FOUND', status: 404, message: 'Vendor not found' };
    }

    // Check if this user owns the vendor account
    if (vendor.user !== user.id && user.role !== 'admin') {
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
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateVendor(request, params.id);

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
      vendor: params.id,
      user: user.id,
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
    const existingRequest = await TierUpgradeRequestService.getPendingRequest(params.id);

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
      vendorId: params.id,
      userId: user.id,
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
}

/**
 * GET - Get pending or most recent tier upgrade request
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateVendor(request, params.id);

    if ('error' in auth) {
      return NextResponse.json(
        { success: false, error: auth.error, message: auth.message },
        { status: auth.status }
      );
    }

    // Get pending request first, fall back to most recent
    const tierRequest = await TierUpgradeRequestService.getPendingRequest(params.id)
      ?? await TierUpgradeRequestService.getMostRecentRequest(params.id);

    return NextResponse.json({ success: true, data: tierRequest });
  } catch (error) {
    console.error('Error fetching tier upgrade request:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_ERROR', message: 'Failed to fetch request' },
      { status: 500 }
    );
  }
}
