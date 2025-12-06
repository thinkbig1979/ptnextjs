'use client';

/**
 * NotificationDropdown
 *
 * Dropdown panel showing recent notifications with actions.
 * Displays list of notifications with mark-as-read functionality.
 */

import { useState, useEffect } from 'react';
import { NotificationItem } from './NotificationItem';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCheck, Loader2 } from 'lucide-react';
import type { Notification } from '@/lib/types/notifications';

interface NotificationDropdownProps {
  /** Callback when a single notification is marked as read */
  onNotificationRead?: () => void;
  /** Callback when all notifications are marked as read */
  onAllRead?: () => void;
  /** Callback when dropdown should close */
  onClose?: () => void;
}

export function NotificationDropdown({
  onNotificationRead,
  onAllRead,
  onClose,
}: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications?limit=20');
      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsRead(notificationId: string) {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      });

      if (response.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );

        // Notify parent
        onNotificationRead?.();
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  async function handleMarkAllAsRead() {
    try {
      setMarkingAllRead(true);
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
      });

      if (response.ok) {
        // Update all local notifications to read
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

        // Notify parent
        onAllRead?.();
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    } finally {
      setMarkingAllRead(false);
    }
  }

  const unreadNotifications = notifications.filter((n) => !n.read);
  const hasUnread = unreadNotifications.length > 0;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <h3 className="font-semibold">Notifications</h3>
        {hasUnread && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markingAllRead}
            className="h-8 text-xs"
          >
            {markingAllRead ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Marking...
              </>
            ) : (
              <>
                <CheckCheck className="mr-1 h-3 w-3" />
                Mark all read
              </>
            )}
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted p-3 mb-2">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onClick={onClose}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t p-2 text-center">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      )}
    </div>
  );
}

// Missing import - add Bell icon
import { Bell } from 'lucide-react';
