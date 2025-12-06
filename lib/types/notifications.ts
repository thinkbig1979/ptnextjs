/**
 * Notification System Types
 * In-app notifications for tier upgrade/downgrade requests and other events
 */

import { User } from '../types';

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

/**
 * Notification type enum
 * Categorizes different types of in-app notifications
 */
export type NotificationType =
  | 'tier_upgrade_submitted'
  | 'tier_upgrade_approved'
  | 'tier_upgrade_rejected'
  | 'tier_downgrade_submitted'
  | 'tier_downgrade_approved'
  | 'tier_downgrade_rejected';

/**
 * Notification metadata
 * Additional context data attached to notifications
 */
export interface NotificationMetadata {
  /** Vendor ID associated with the notification */
  vendorId?: string;
  /** Tier upgrade/downgrade request ID */
  requestId?: string;
  /** Current tier at time of notification */
  currentTier?: string;
  /** Requested tier for upgrade/downgrade */
  requestedTier?: string;
  /** Rejection reason for rejected requests */
  rejectionReason?: string;
  /** Request type: upgrade or downgrade */
  requestType?: 'upgrade' | 'downgrade';
  /** Any additional context */
  [key: string]: string | undefined;
}

/**
 * Notification
 * Represents an in-app notification for a user
 */
export interface Notification {
  /** Unique notification ID */
  id: string;
  /** User who receives the notification - can be ID or populated object */
  user: string | User;
  /** Type of notification */
  type: NotificationType;
  /** Notification title/headline */
  title: string;
  /** Notification message body */
  message: string;
  /** Whether the notification has been read */
  read: boolean;
  /** Additional metadata about the notification */
  metadata?: NotificationMetadata;
  /** Timestamp when notification was created */
  createdAt: string;
  /** Timestamp when notification was last updated */
  updatedAt: string;
}

/**
 * Create Notification Payload
 * Data required to create a new notification
 */
export interface CreateNotificationPayload {
  /** User ID who will receive the notification */
  userId: string;
  /** Type of notification */
  type: NotificationType;
  /** Notification title/headline */
  title: string;
  /** Notification message body */
  message: string;
  /** Additional metadata (optional) */
  metadata?: NotificationMetadata;
}

/**
 * Notification Filters
 * Query parameters for filtering notifications
 */
export interface NotificationFilters {
  /** Filter by user ID */
  userId?: string;
  /** Filter by notification type */
  type?: NotificationType;
  /** Filter by read status */
  read?: boolean;
  /** Limit number of results */
  limit?: number;
  /** Skip first N results */
  offset?: number;
}

/**
 * Get Notifications Response
 * API response for fetching user notifications
 */
export interface GetNotificationsResponse {
  success: true;
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
}

/**
 * Mark As Read Response
 * API response for marking notification(s) as read
 */
export interface MarkAsReadResponse {
  success: true;
  message: string;
}

/**
 * Notification Error Response
 * API error response for notification operations
 */
export interface NotificationErrorResponse {
  success: false;
  error: {
    code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'SERVER_ERROR';
    message: string;
    details?: string;
  };
}

/**
 * Notification Service Response
 * Union type for all notification API responses
 */
export type NotificationResponse =
  | GetNotificationsResponse
  | MarkAsReadResponse
  | NotificationErrorResponse;
