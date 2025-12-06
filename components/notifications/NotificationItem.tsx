'use client';

/**
 * NotificationItem
 *
 * Individual notification card/item with type-specific icons and actions.
 * Shows notification title, message, timestamp, and mark-as-read button.
 */

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Notification } from '@/lib/types/notifications';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClick?: () => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onClick,
}: NotificationItemProps) {
  const [isMarking, setIsMarking] = useState(false);

  async function handleMarkAsRead(e: React.MouseEvent) {
    e.stopPropagation();

    if (notification.read) return;

    setIsMarking(true);
    await onMarkAsRead(notification.id);
    setIsMarking(false);
  }

  function handleClick() {
    // Mark as read when clicked
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }

    // Navigate to relevant page based on notification type
    const metadata = notification.metadata;
    if (metadata?.requestId && metadata?.vendorId) {
      // For tier requests, navigate to the appropriate page
      if (notification.type.includes('submitted')) {
        // Admin notification - go to admin tier requests page
        window.location.href = '/admin/tier-requests/pending';
      } else {
        // Vendor notification - go to vendor dashboard
        window.location.href = `/portal/vendors/${metadata.vendorId}`;
      }
    }

    onClick?.();
  }

  // Get icon based on notification type
  function getNotificationIcon() {
    const iconClass = 'h-5 w-5';

    switch (notification.type) {
      case 'tier_upgrade_submitted':
        return <ArrowUp className={cn(iconClass, 'text-blue-500')} />;
      case 'tier_downgrade_submitted':
        return <ArrowDown className={cn(iconClass, 'text-orange-500')} />;
      case 'tier_upgrade_approved':
      case 'tier_downgrade_approved':
        return <CheckCircle2 className={cn(iconClass, 'text-green-500')} />;
      case 'tier_upgrade_rejected':
      case 'tier_downgrade_rejected':
        return <XCircle className={cn(iconClass, 'text-red-500')} />;
      default:
        return <AlertCircle className={cn(iconClass, 'text-gray-500')} />;
    }
  }

  // Format timestamp
  function getTimestamp() {
    try {
      return formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  }

  return (
    <div
      className={cn(
        'group relative cursor-pointer p-4 transition-colors hover:bg-muted/50',
        !notification.read && 'bg-blue-50/50 dark:bg-blue-950/10'
      )}
      onClick={handleClick}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">{getNotificationIcon()}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4
              className={cn(
                'text-sm font-medium leading-tight',
                !notification.read && 'font-semibold'
              )}
            >
              {notification.title}
            </h4>

            {/* Mark as read button */}
            {!notification.read && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                onClick={handleMarkAsRead}
                disabled={isMarking}
                title="Mark as read"
              >
                <Check className="h-3 w-3" />
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
            {notification.message}
          </p>

          <p className="text-xs text-muted-foreground">{getTimestamp()}</p>
        </div>

        {/* Unread indicator dot */}
        {!notification.read && (
          <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500" />
        )}
      </div>
    </div>
  );
}
