import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/lib/utils/get-payload-config';
import { requireAdmin } from '@/lib/auth';

/**
 * POST /api/admin/vendors/[id]/reject - Reject vendor
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const auth = await requireAdmin(request);
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error, code: auth.code },
        { status: auth.status }
      );
    }

    const body = await request.json();
    const { rejectionReason } = body;

    // Validate rejection reason
    if (!rejectionReason || rejectionReason.trim() === '') {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    const resolvedParams = await params;
    const userId = resolvedParams.id;
    const payload = await getPayloadClient();

    // Update user status
    const updateData: {
      status: 'rejected';
      rejected_at: string;
      rejection_reason: string;
    } = {
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      rejection_reason: rejectionReason,
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

    return NextResponse.json({
      message: 'Vendor rejected successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        status: updatedUser.status,
        rejected_at: updateData.rejected_at,
        rejection_reason: rejectionReason,
      },
    });
  } catch (error) {
    console.error('[Admin Reject] Error:', error);
    const message = error instanceof Error ? error.message : 'Rejection action failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
