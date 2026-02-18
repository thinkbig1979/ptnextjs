/**
 * NotificationService
 *
 * Handles in-app notification creation and management.
 * Creates notifications when:
 * - Tier upgrade/downgrade requests are submitted (admin notification)
 * - Tier upgrade/downgrade requests are approved (vendor notification)
 * - Tier upgrade/downgrade requests are rejected (vendor notification)
 */

import { getPayloadClient } from '@/lib/utils/get-payload-config';
import type {
  Notification,
  CreateNotificationPayload,
  NotificationFilters,
  NotificationType,
  NotificationMetadata,
} from '../types/notifications';

/**
 * Create a notification for a user
 */
export async function createNotification(
  payload: CreateNotificationPayload
): Promise<{ success: boolean; notification?: Notification; error?: string }> {
  try {
    const payloadCMS = await getPayloadClient();

    const notification = await payloadCMS.create({
      collection: 'notifications',
      data: {
        user: payload.userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        read: false,
        metadata: payload.metadata || {},
      },
    });

    return {
      success: true,
      notification: notification as unknown as Notification,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[NotificationService] Failed to create notification:', errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Get notifications for a user with optional filters
 */
export async function getUserNotifications(
  userId: string,
  filters?: NotificationFilters
): Promise<{ success: boolean; notifications?: Notification[]; unreadCount?: number; totalCount?: number; error?: string }> {
  try {
    const payloadCMS = await getPayloadClient();

    // Build query
    const query: any = {
      user: {
        equals: userId,
      },
    };

    // Apply filters
    if (filters?.type) {
      query.type = { equals: filters.type };
    }

    if (typeof filters?.read === 'boolean') {
      query.read = { equals: filters.read };
    }

    // Fetch notifications with pagination
    const result = await payloadCMS.find({
      collection: 'notifications',
      where: query,
      limit: filters?.limit || 50,
      page: filters?.offset ? Math.floor(filters.offset / (filters.limit || 50)) + 1 : 1,
      sort: '-createdAt', // Most recent first
    });

    // Get unread count
    const unreadResult = await payloadCMS.find({
      collection: 'notifications',
      where: {
        user: { equals: userId },
        read: { equals: false },
      },
      limit: 0, // Just get the count
    });

    return {
      success: true,
      notifications: result.docs as unknown as Notification[],
      unreadCount: unreadResult.totalDocs,
      totalCount: result.totalDocs,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[NotificationService] Failed to get notifications:', errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Mark a notification as read
 */
export async function markAsRead(
  notificationId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const payloadCMS = await getPayloadClient();

    // Verify the notification belongs to the user
    const notification = await payloadCMS.findByID({
      collection: 'notifications',
      id: notificationId,
    });

    const notificationUserId = typeof notification.user === 'object' ? notification.user.id : notification.user;

    if (notificationUserId !== userId) {
      return {
        success: false,
        error: 'Unauthorized: Notification does not belong to user',
      };
    }

    // Update the notification
    await payloadCMS.update({
      collection: 'notifications',
      id: notificationId,
      data: {
        read: true,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[NotificationService] Failed to mark notification as read:', errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(
  userId: string
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    const payloadCMS = await getPayloadClient();

    // Find all unread notifications for the user
    const unreadNotifications = await payloadCMS.find({
      collection: 'notifications',
      where: {
        user: { equals: userId },
        read: { equals: false },
      },
      limit: 1000, // Process in batches if needed
    });

    // Update each notification
    let count = 0;
    for (const notification of unreadNotifications.docs) {
      await payloadCMS.update({
        collection: 'notifications',
        id: notification.id,
        data: {
          read: true,
        },
      });
      count++;
    }

    return {
      success: true,
      count,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[NotificationService] Failed to mark all notifications as read:', errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Create a notification for tier upgrade/downgrade request submission (admin notification)
 */
export async function notifyAdminOfTierRequest(
  vendorName: string,
  currentTier: string,
  requestedTier: string,
  requestType: 'upgrade' | 'downgrade',
  requestId: string,
  vendorId: string
): Promise<void> {
  try {
    const payloadCMS = await getPayloadClient();

    // Find all admin users
    const admins = await payloadCMS.find({
      collection: 'users',
      where: {
        role: { equals: 'admin' },
      },
    });

    // Create notification for each admin
    for (const admin of admins.docs) {
      const action = requestType === 'upgrade' ? 'Upgrade' : 'Downgrade';

      await createNotification({
        userId: String(admin.id),
        type: requestType === 'upgrade' ? 'tier_upgrade_submitted' : 'tier_downgrade_submitted',
        title: `New Tier ${action} Request`,
        message: `${vendorName} has requested to ${requestType} from ${currentTier} to ${requestedTier}.`,
        metadata: {
          vendorId,
          requestId,
          currentTier,
          requestedTier,
          requestType,
        },
      });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[NotificationService] Failed to notify admins:', errorMessage);
    // Don't throw - notifications are best-effort
  }
}

/**
 * Create a notification for tier request approval (vendor notification)
 */
export async function notifyVendorOfApproval(
  userId: string,
  requestType: 'upgrade' | 'downgrade',
  currentTier: string,
  newTier: string,
  requestId: string,
  vendorId: string
): Promise<void> {
  try {
    const action = requestType === 'upgrade' ? 'Upgrade' : 'Downgrade';
    const preposition = requestType === 'upgrade' ? 'to' : 'to';

    await createNotification({
      userId,
      type: requestType === 'upgrade' ? 'tier_upgrade_approved' : 'tier_downgrade_approved',
      title: `Tier ${action} Approved`,
      message: `Your tier ${requestType} request has been approved. Your subscription has been ${requestType === 'upgrade' ? 'upgraded' : 'downgraded'} ${preposition} ${newTier}.`,
      metadata: {
        vendorId,
        requestId,
        currentTier,
        requestedTier: newTier,
        requestType,
      },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[NotificationService] Failed to notify vendor of approval:', errorMessage);
    // Don't throw - notifications are best-effort
  }
}

/**
 * Create a notification for tier request rejection (vendor notification)
 */
export async function notifyVendorOfRejection(
  userId: string,
  requestType: 'upgrade' | 'downgrade',
  currentTier: string,
  requestedTier: string,
  rejectionReason: string,
  requestId: string,
  vendorId: string
): Promise<void> {
  try {
    const action = requestType === 'upgrade' ? 'Upgrade' : 'Downgrade';

    await createNotification({
      userId,
      type: requestType === 'upgrade' ? 'tier_upgrade_rejected' : 'tier_downgrade_rejected',
      title: `Tier ${action} Request Rejected`,
      message: `Your tier ${requestType} request from ${currentTier} to ${requestedTier} has been rejected. Reason: ${rejectionReason}`,
      metadata: {
        vendorId,
        requestId,
        currentTier,
        requestedTier,
        rejectionReason,
        requestType,
      },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[NotificationService] Failed to notify vendor of rejection:', errorMessage);
    // Don't throw - notifications are best-effort
  }
}
