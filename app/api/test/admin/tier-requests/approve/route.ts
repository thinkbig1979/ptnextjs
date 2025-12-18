/**
 * Test Admin Tier Request Approval API
 * POST /api/test/admin/tier-requests/approve
 *
 * Admin tier approval endpoint for E2E tests.
 * Only available in test/development environments.
 * Bypasses admin authentication for testing purposes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/lib/utils/get-payload-config';

interface ApproveRequest {
  requestId: string;
}

interface ApproveResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * POST /api/test/admin/tier-requests/approve
 * Approve a tier upgrade/downgrade request for E2E testing
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApproveResponse>> {
  // NODE_ENV guard - only allow in test/development OR when E2E_TEST is explicitly enabled
  const isE2ETest = process.env.E2E_TEST === 'true';
  if (process.env.NODE_ENV === 'production' && !isE2ETest) {
    return NextResponse.json(
      {
        success: false,
        error: 'Test endpoints are not available in production',
      },
      { status: 403 }
    );
  }

  try {
    const body = await request.json() as ApproveRequest;

    if (!body.requestId) {
      return NextResponse.json(
        {
          success: false,
          error: 'requestId is required',
        },
        { status: 400 }
      );
    }

    const payload = await getPayloadClient();

    // Find or create a test admin user
    let adminUser = await payload.find({
      collection: 'users',
      where: {
        email: { equals: 'test-admin@test.example.com' },
        role: { equals: 'admin' },
      },
      limit: 1,
    });

    let adminId: string;

    if (adminUser.docs.length === 0) {
      // Create test admin user
      const newAdmin = await payload.create({
        collection: 'users',
        data: {
          email: 'test-admin@test.example.com',
          password: 'TestAdminPass123!@#',
          role: 'admin',
          status: 'approved',
        },
      });
      adminId = newAdmin.id as string;
      console.log('[Test Admin] Created test admin user:', adminId);
    } else {
      adminId = adminUser.docs[0].id as string;
    }

    console.log('[Test Admin Approve] Using admin ID:', adminId, 'for request:', body.requestId);

    // Get the request
    const tierRequest = await payload.findByID({
      collection: 'tier_upgrade_requests',
      id: body.requestId,
    });

    if (!tierRequest) {
      return NextResponse.json(
        { success: false, error: 'Request not found' },
        { status: 404 }
      );
    }

    if (tierRequest.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Can only approve pending requests' },
        { status: 400 }
      );
    }

    // Update vendor tier
    const vendorId = typeof tierRequest.vendor === 'object'
      ? (tierRequest.vendor as { id: string | number }).id
      : tierRequest.vendor;

    await payload.update({
      collection: 'vendors',
      id: vendorId as string | number,
      data: {
        tier: tierRequest.requestedTier,
      },
    });

    // Update request status
    await payload.update({
      collection: 'tier_upgrade_requests',
      id: body.requestId,
      data: {
        status: 'approved',
        reviewedBy: adminId,
        reviewedAt: new Date().toISOString(),
      },
    });

    console.log('[Test Admin Approve] Success');

    return NextResponse.json(
      {
        success: true,
        message: 'Request approved successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Test Admin Approve] Error:', errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
