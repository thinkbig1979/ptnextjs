'use client';

/**
 * NotificationBell
 *
 * Displays a bell icon with unread notification count badge.
 * Triggers the NotificationDropdown when clicked.
 */

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { NotificationDropdown } from './NotificationDropdown';

interface NotificationBellProps {
  /** Initial unread count (optional, will fetch if not provided) */
  initialUnreadCount?: number;
}

export function NotificationBell({ initialUnreadCount = 0 }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch initial unread count
  useEffect(() => {
    fetchUnreadCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  async function fetchUnreadCount() {
    try {
      const response = await fetch('/api/notifications?read=false&limit=0');
      const data = await response.json();

      if (data.success) {
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }

  function handleNotificationRead() {
    // Decrement unread count when a notification is marked as read
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }

  function handleAllRead() {
    // Reset unread count when all notifications are marked as read
    setUnreadCount(0);
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <NotificationDropdown
          onNotificationRead={handleNotificationRead}
          onAllRead={handleAllRead}
          onClose={() => setIsOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}
