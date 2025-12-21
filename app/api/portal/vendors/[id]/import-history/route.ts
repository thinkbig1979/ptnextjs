/**
 * API Route: Import History
 *
 * GET /api/portal/vendors/[id]/import-history
 *
 * Retrieves paginated import history for a vendor.
 *
 * @requires Authentication
 * @requires Authorization (vendor owns resource or is admin)
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateToken } from '@/lib/auth';
import { getPayloadClient } from '@/lib/utils/get-payload-config';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}


/**
 * GET /api/portal/vendors/[id]/import-history
 *
 * Retrieve paginated import history with filtering
 * Query params:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 50)
 * - status: Filter by status (success|partial|failed)
 * - startDate: Filter by date range start (ISO format)
 * - endDate: Filter by date range end (ISO format)
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    // Await params
    const { id } = await context.params;

    // Initialize Payload
    const payload = await getPayloadClient();

    // Authenticate user
    const auth = await validateToken(request);
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const user = auth.user;
    const isAdmin = user.role === 'admin';

    // Authorization: Verify user owns this vendor (or is admin)
    if (!isAdmin) {
      const vendor = await payload.findByID({
        collection: 'vendors',
        id,
        depth: 0
      });

      if (!vendor || vendor.user?.toString() !== user.id) {
        return NextResponse.json(
          { error: 'Forbidden - You do not have access to this vendor\'s import history' },
          { status: 403 }
        );
      }
    }

    // Parse query parameters
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '10')));
    const status = url.searchParams.get('status');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    // Build query conditions
    const where: {
      vendor: { equals: string };
      status?: { equals: string };
      importDate?: {
        greater_than_equal?: string;
        less_than_equal?: string;
      };
    } = {
      vendor: { equals: id }
    };

    // Filter by status if provided
    if (status && ['success', 'partial', 'failed'].includes(status)) {
      where.status = { equals: status };
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      where.importDate = {};
      if (startDate) {
        try {
          where.importDate.greater_than_equal = new Date(startDate).toISOString();
        } catch (error) {
          return NextResponse.json(
            { error: 'Invalid startDate format. Use ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)' },
            { status: 400 }
          );
        }
      }
      if (endDate) {
        try {
          where.importDate.less_than_equal = new Date(endDate).toISOString();
        } catch (error) {
          return NextResponse.json(
            { error: 'Invalid endDate format. Use ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)' },
            { status: 400 }
          );
        }
      }
    }

    // Query import history from Payload CMS
    const result = await payload.find({
      collection: 'import_history',
      where,
      sort: '-importDate', // Newest first
      page,
      limit,
      depth: 1 // Include related vendor and user data
    });

    return NextResponse.json({
      success: true,
      data: result.docs,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        totalDocs: result.totalDocs,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
        nextPage: result.nextPage,
        prevPage: result.prevPage
      },
      filters: {
        status: status || null,
        startDate: startDate || null,
        endDate: endDate || null
      }
    });

  } catch (error) {
    console.error('Import history fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch import history',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
