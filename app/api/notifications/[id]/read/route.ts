/**
 * PUT /api/notifications/[id]/read
 * Mark a specific notification as read
 */

import { NextRequest, NextResponse } from 'next/server';
import { markAsRead } from '@/lib/services/NotificationService';
import { getPayload } from 'payload';
import config from '@payload-config';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const payloadCMS = await getPayload({ config });

    // Get authenticated user
    const { user } = await payloadCMS.auth({ headers: request.headers });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    const notificationId = id;

    // Mark notification as read
    const result = await markAsRead(notificationId, String(user.id));

    if (!result.success) {
      if (result.error?.includes('Unauthorized')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'You do not have permission to modify this notification',
            },
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SERVER_ERROR',
            message: result.error || 'Failed to mark notification as read',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[API] PUT /api/notifications/${id}/read failed:`, errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Internal server error',
          details: errorMessage,
        },
      },
      { status: 500 }
    );
  }
}
