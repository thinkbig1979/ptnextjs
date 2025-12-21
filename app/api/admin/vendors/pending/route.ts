import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/lib/utils/get-payload-config';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/vendors/pending - Get pending vendor approvals
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
    console.error('[Admin Pending] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
