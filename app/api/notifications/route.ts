/**
 * GET /api/notifications
 * Get notifications for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserNotifications } from '@/lib/services/NotificationService';
import { getPayloadClient } from '@/lib/utils/get-payload-config';
import type { NotificationFilters } from '@/lib/types/notifications';

export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = String(user.id);
    const filters: NotificationFilters = {
      userId,
      type: searchParams.get('type') as any,
      read: searchParams.get('read') === 'true' ? true : searchParams.get('read') === 'false' ? false : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    };

    // Get notifications
    const result = await getUserNotifications(userId, filters);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SERVER_ERROR',
            message: result.error || 'Failed to fetch notifications',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notifications: result.notifications,
      unreadCount: result.unreadCount,
      totalCount: result.totalCount,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[API] GET /api/notifications failed:', errorMessage);

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
