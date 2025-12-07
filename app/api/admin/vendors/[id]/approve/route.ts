import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { authenticateAdmin } from '@/lib/utils/admin-auth';

/**
 * POST /api/admin/vendors/[id]/approve - Approve vendor
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const auth = await authenticateAdmin(request);
    if ('error' in auth) {
      return NextResponse.json(
        { error: auth.error, message: auth.message },
        { status: auth.status }
      );
    }

    const resolvedParams = await params;
    const userId = resolvedParams.id;
    const payload = await getPayload({ config });

    // Update user status
    const updateData: {
      status: 'approved';
      approved_at: string;
    } = {
      status: 'approved',
      approved_at: new Date().toISOString(),
    };

    let updatedUser;
    try {
      updatedUser = await payload.update({
        collection: 'users',
        id: userId,
        data: updateData,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('not found') || message.includes('No document')) {
        return NextResponse.json(
          { error: 'Vendor not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    // Find and update vendor profile
    const vendors = await payload.find({
      collection: 'vendors',
      where: { user: { equals: userId } },
      limit: 1,
    });

    if (vendors.docs.length > 0) {
      await payload.update({
        collection: 'vendors',
        id: vendors.docs[0].id,
        data: { published: true },
      });
    }

    return NextResponse.json({
      message: 'Vendor approved successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        status: updatedUser.status,
        approved_at: updateData.approved_at,
      },
    });
  } catch (error) {
    console.error('[Admin Approve] Error:', error);
    const message = error instanceof Error ? error.message : 'Approval action failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
