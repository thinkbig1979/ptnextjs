import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { authService } from '@/lib/services/auth-service';

/**
 * Extract and validate admin user
 */
function extractAdminUser(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    throw new Error('Authentication required');
  }

  const user = authService.validateToken(token);

  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }

  return user;
}

/**
 * GET /api/admin/vendors/approval - Get pending vendor approvals
 */
export async function GET(request: NextRequest) {
  try {
    extractAdminUser(request);

    const payload = await getPayload({ config });

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

    if (message.includes('Admin access required')) {
      return NextResponse.json({ error: message }, { status: 403 });
    }

    return NextResponse.json({ error: message }, { status: 401 });
  }
}

/**
 * POST /api/admin/vendors/approval - Approve or reject vendor
 */
export async function POST(request: NextRequest) {
  try {
    extractAdminUser(request);

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

    const payload = await getPayload({ config });

    // Update user status
    const updateData: any = {
      status: action === 'approve' ? 'active' : 'rejected',
    };

    if (action === 'approve') {
      updateData.approved_at = new Date().toISOString();
    } else {
      updateData.rejected_at = new Date().toISOString();
      updateData.rejection_reason = rejectionReason;
    }

    const updatedUser = await payload.update({
      collection: 'users',
      id: userId,
      data: updateData,
    });

    // TODO: Send email notification to vendor

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
