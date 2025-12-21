/**
 * Vendor Portal API - Tier Downgrade Request Management
 *
 * POST   /api/portal/vendors/[id]/tier-downgrade-request - Submit new downgrade request
 * GET    /api/portal/vendors/[id]/tier-downgrade-request - Get pending/recent downgrade request
 *
 * Authentication: Required (vendor role)
 * Authorization: Vendors can only access their own requests
 * Security: Rate limited to 10 requests per minute per IP
 */

import { NextRequest, NextResponse } from 'next/server';
import * as TierUpgradeRequestService from '@/lib/services/TierUpgradeRequestService';
import { rateLimit } from '@/lib/middleware/rateLimit';
import { requireVendorOwnership } from '@/lib/auth';

/**
 * POST - Submit a new tier downgrade request
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return rateLimit(request, async () => {
    try {
      const { id } = await params;
      const auth = await requireVendorOwnership(id)(request);

      if (!auth.success) {
        return NextResponse.json(
          { success: false, error: auth.code || 'UNAUTHORIZED', message: auth.error },
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

      // Validate tier downgrade
      const validation = TierUpgradeRequestService.validateTierRequest({
        vendor: id,
        user: String(user.id),
        currentTier: vendor.tier as string | undefined,
        requestedTier: body.requestedTier,
        vendorNotes: body.vendorNotes,
        status: 'pending',
        requestType: 'downgrade',
      }, 'downgrade');

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

      // Check for duplicate pending downgrade request
      const existingRequest = await TierUpgradeRequestService.getPendingRequest(id, 'downgrade');

      if (existingRequest) {
        return NextResponse.json(
          {
            success: false,
            error: 'DUPLICATE_REQUEST',
            message: 'You already have a pending downgrade request',
            existingRequest: {
              id: existingRequest.id,
              requestedTier: existingRequest.requestedTier,
              requestedAt: existingRequest.requestedAt,
            },
          },
          { status: 409 }
        );
      }

      // Create the downgrade request
      const newRequest = await TierUpgradeRequestService.createDowngradeRequest({
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
      console.error('Error creating tier downgrade request:', error);
      return NextResponse.json(
        { success: false, error: 'INTERNAL_ERROR', message: 'Failed to create request' },
        { status: 500 }
      );
    }
  });
}

/**
 * GET - Get pending or most recent tier downgrade request
 * Rate limited to 60 requests per minute (higher than POST since read-only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return rateLimit(request, async () => {
    try {
      const { id } = await params;
      const auth = await requireVendorOwnership(id)(request);

      if (!auth.success) {
        return NextResponse.json(
          { success: false, error: auth.code || 'UNAUTHORIZED', message: auth.error },
          { status: auth.status }
        );
      }

      // Get pending downgrade request
      const tierRequest = await TierUpgradeRequestService.getPendingRequest(id, 'downgrade');

      return NextResponse.json({ success: true, data: tierRequest });
    } catch (error) {
      console.error('Error fetching tier downgrade request:', error);
      return NextResponse.json(
        { success: false, error: 'INTERNAL_ERROR', message: 'Failed to fetch request' },
        { status: 500 }
      );
    }
  }, { maxRequests: 60, windowMs: 60000 });
}
