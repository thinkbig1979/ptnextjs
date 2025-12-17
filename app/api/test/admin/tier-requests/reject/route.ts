/**
 * Test Admin Tier Request Rejection API
 * POST /api/test/admin/tier-requests/reject
 *
 * Admin tier rejection endpoint for E2E tests.
 * Only available in test/development environments.
 * Bypasses admin authentication for testing purposes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

interface RejectRequest {
  requestId: string;
  rejectionReason: string;
}

interface RejectResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * POST /api/test/admin/tier-requests/reject
 * Reject a tier upgrade/downgrade request for E2E testing
 */
export async function POST(request: NextRequest): Promise<NextResponse<RejectResponse>> {
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
    const body = await request.json() as RejectRequest;

    if (!body.requestId) {
      return NextResponse.json(
        {
          success: false,
          error: 'requestId is required',
        },
        { status: 400 }
      );
    }

    if (!body.rejectionReason || body.rejectionReason.length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: 'rejectionReason is required and must be at least 10 characters',
        },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config });

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
        { success: false, error: 'Can only reject pending requests' },
        { status: 400 }
      );
    }

    // Update request status
    await payload.update({
      collection: 'tier_upgrade_requests',
      id: body.requestId,
      data: {
        status: 'rejected',
        reviewedBy: adminId,
        reviewedAt: new Date().toISOString(),
        rejectionReason: body.rejectionReason,
      },
    });

    console.log('[Test Admin Reject] Success');

    return NextResponse.json(
      {
        success: true,
        message: 'Request rejected successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Test Admin Reject] Error:', errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
