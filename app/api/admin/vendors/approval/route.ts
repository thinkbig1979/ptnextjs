import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/lib/utils/get-payload-config';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/vendors/approval - Get pending vendor approvals
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireAdmin(request);
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error, code: auth.code },
        { status: auth.status }
      );
    }

    const payload = await getPayloadClient();

    // Get all users with pending status
    const pendingUsers = await payload.find({
      collection: 'users',
      where: { status: { equals: 'pending' } },
      limit: 100,
    });

    // Get vendor profiles for pending users
    const vendorProfiles = await Promise.all(
      pendingUsers.docs.map(async (user) => {
        const vendors = await payload.find({
          collection: 'vendors',
          where: { user: { equals: user.id } },
          limit: 1,
        });

        return {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt,
          },
          vendor: vendors.docs[0] || null,
        };
      })
    );

    return NextResponse.json({ pending: vendorProfiles });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch pending approvals';
    console.error('[Admin Approval] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/admin/vendors/approval - Approve or reject vendor
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await requireAdmin(request);
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error, code: auth.code },
        { status: auth.status }
      );
    }

    const body = await request.json();
    const { userId, action, rejectionReason } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID and action are required' },
        { status: 400 }
      );
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Action must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    if (action === 'reject' && !rejectionReason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    const payload = await getPayloadClient();

    // Update user status
    // Timestamps (approvedAt/rejectedAt) are set automatically by the Users beforeChange hook
    const updateData: {
      status: 'approved' | 'rejected';
      rejectionReason?: string;
    } = {
      status: action === 'approve' ? 'approved' : 'rejected',
    };

    if (action === 'reject') {
      updateData.rejectionReason = rejectionReason;
    }

    const updatedUser = await payload.update({
      collection: 'users',
      id: userId,
      data: updateData,
    });

    // Email notification is sent automatically via the Users collection afterChange hook
    // when status transitions to 'approved' or 'rejected'

    return NextResponse.json({
      message: `Vendor ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        status: updatedUser.status,
      },
    });
  } catch (error) {
    console.error('[Admin Approval] Error:', error);
    const message = error instanceof Error ? error.message : 'Approval action failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
