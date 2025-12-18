/**
 * PUT /api/notifications/mark-all-read
 * Mark all notifications as read for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { markAllAsRead } from '@/lib/services/NotificationService';
import { getPayloadClient } from '@/lib/utils/get-payload-config';

export async function PUT(request: NextRequest) {
  try {
    const payloadCMS = await getPayloadClient();

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

    // Mark all notifications as read
    const result = await markAllAsRead(String(user.id));

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SERVER_ERROR',
            message: result.error || 'Failed to mark all notifications as read',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${result.count} notification(s) marked as read`,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[API] PUT /api/notifications/mark-all-read failed:', errorMessage);

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
