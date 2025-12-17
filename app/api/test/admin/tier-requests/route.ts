/**
 * Test Admin Tier Requests List API
 * GET /api/test/admin/tier-requests
 *
 * List tier upgrade/downgrade requests for E2E tests.
 * Only available in test/development environments.
 * Bypasses admin authentication for testing purposes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';

interface ListResponse {
  success: boolean;
  data?: {
    requests: Array<{
      id: string;
      vendor: string;
      currentTier: string;
      requestedTier: string;
      requestType: string;
      status: string;
      vendorNotes?: string;
      rejectionReason?: string;
      requestedAt: string;
    }>;
    total: number;
  };
  error?: string;
}

/**
 * GET /api/test/admin/tier-requests
 * List tier requests for E2E testing
 *
 * Query params:
 * - status: 'pending' | 'approved' | 'rejected' | 'cancelled'
 * - requestType: 'upgrade' | 'downgrade'
 * - vendorId: filter by vendor
 */
export async function GET(request: NextRequest): Promise<NextResponse<ListResponse>> {
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
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const requestType = searchParams.get('requestType');
    const vendorId = searchParams.get('vendorId');

    const payload = await getPayload({ config });

    // Build where clause
    const whereConditions: Array<{ [key: string]: { equals: string } }> = [];

    if (status) {
      whereConditions.push({ status: { equals: status } });
    }

    if (requestType) {
      whereConditions.push({ requestType: { equals: requestType } });
    }

    if (vendorId) {
      whereConditions.push({ vendor: { equals: vendorId } });
    }

    // Fetch tier requests
    const result = await payload.find({
      collection: 'tier_upgrade_requests',
      where: whereConditions.length > 0 ? { and: whereConditions } : {},
      limit: 100,
      sort: '-createdAt',
    });

    const requests = result.docs.map((doc) => ({
      id: doc.id as string,
      vendor: typeof doc.vendor === 'object' ? (doc.vendor as { id: string }).id : doc.vendor as string,
      currentTier: doc.currentTier as string,
      requestedTier: doc.requestedTier as string,
      requestType: doc.requestType as string,
      status: doc.status as string,
      vendorNotes: doc.vendorNotes as string | undefined,
      rejectionReason: doc.rejectionReason as string | undefined,
      requestedAt: doc.requestedAt as string,
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          requests,
          total: result.totalDocs,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Test Admin List] Error:', errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
