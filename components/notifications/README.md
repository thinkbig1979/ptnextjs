# Notification System

Comprehensive in-app notification system for tier upgrade/downgrade requests.

## Overview

The notification system provides real-time in-app notifications for users when:
- Tier upgrade/downgrade requests are submitted (admin notification)
- Tier upgrade/downgrade requests are approved (vendor notification)
- Tier upgrade/downgrade requests are rejected (vendor notification)

## Architecture

### Backend Components

1. **Payload Collection** (`payload/collections/Notifications.ts`)
   - Stores notifications in the database
   - Fields: user, type, title, message, read, metadata, timestamps
   - Access control: Users can only read/update their own notifications

2. **NotificationService** (`lib/services/NotificationService.ts`)
   - `createNotification()` - Create a new notification
   - `getUserNotifications()` - Fetch user's notifications with filters
   - `markAsRead()` - Mark single notification as read
   - `markAllAsRead()` - Mark all user's notifications as read
   - `notifyAdminOfTierRequest()` - Notify admins of new tier request
   - `notifyVendorOfApproval()` - Notify vendor of request approval
   - `notifyVendorOfRejection()` - Notify vendor of request rejection

3. **API Endpoints**
   - `GET /api/notifications` - Get user's notifications
   - `PUT /api/notifications/[id]/read` - Mark notification as read
   - `PUT /api/notifications/mark-all-read` - Mark all as read

4. **TypeScript Types** (`lib/types/notifications.ts`)
   - `Notification` - Main notification interface
   - `NotificationType` - Notification type enum
   - `NotificationMetadata` - Additional context data
   - Various request/response types

### Frontend Components

1. **NotificationBell** (`components/notifications/NotificationBell.tsx`)
   - Bell icon with unread count badge
   - Polls for new notifications every 30 seconds
   - Triggers notification dropdown on click

2. **NotificationDropdown** (`components/notifications/NotificationDropdown.tsx`)
   - Dropdown panel showing recent notifications
   - "Mark all as read" functionality
   - Scrollable list of notifications

3. **NotificationItem** (`components/notifications/NotificationItem.tsx`)
   - Individual notification card
   - Type-specific icons and colors
   - Click to navigate to relevant page
   - Mark as read button

## Usage

### Add NotificationBell to Layout/Header

```typescript
import { NotificationBell } from '@/components/notifications';

export function Header() {
  return (
    <header>
      {/* Other header content */}
      <NotificationBell />
    </header>
  );
}
```

### Create Custom Notifications

```typescript
import { createNotification } from '@/lib/services/NotificationService';

await createNotification({
  userId: 'user-id',
  type: 'tier_upgrade_submitted',
  title: 'New Tier Upgrade Request',
  message: 'Vendor ABC has requested to upgrade from Tier 1 to Tier 2',
  metadata: {
    vendorId: 'vendor-id',
    requestId: 'request-id',
    currentTier: 'tier1',
    requestedTier: 'tier2',
  },
});
```

### Fetch Notifications Programmatically

```typescript
import { getUserNotifications } from '@/lib/services/NotificationService';

const result = await getUserNotifications('user-id', {
  read: false, // Only unread
  limit: 20,
});

console.log(result.notifications);
console.log(result.unreadCount);
```

## Notification Types

| Type | Recipient | Trigger |
|------|-----------|---------|
| `tier_upgrade_submitted` | Admins | Vendor submits upgrade request |
| `tier_downgrade_submitted` | Admins | Vendor submits downgrade request |
| `tier_upgrade_approved` | Vendor User | Admin approves upgrade |
| `tier_downgrade_approved` | Vendor User | Admin approves downgrade |
| `tier_upgrade_rejected` | Vendor User | Admin rejects upgrade |
| `tier_downgrade_rejected` | Vendor User | Admin rejects downgrade |

## Integration with Tier Requests

The notification system is automatically triggered by the TierUpgradeRequests collection hooks:

1. **On Request Create** - Notifies all admin users
2. **On Request Approval** - Notifies the vendor user who submitted the request
3. **On Request Rejection** - Notifies the vendor user with rejection reason

See `NOTIFICATION_INTEGRATION_PATCH.md` for integration details.

## Customization

### Add New Notification Types

1. Add type to `NotificationType` in `lib/types/notifications.ts`
2. Update icon mapping in `NotificationItem.tsx` (`getNotificationIcon()`)
3. Add navigation logic in `NotificationItem.tsx` (`handleClick()`)
4. Create helper function in `NotificationService.ts` if needed

### Styling

All components use Tailwind CSS and shadcn/ui components:
- Modify `NotificationBell.tsx` for bell icon styling
- Modify `NotificationItem.tsx` for notification card styling
- Unread notifications have blue background: `bg-blue-50/50 dark:bg-blue-950/10`
- Unread badge is red: `bg-red-500`

### Polling Interval

Change the polling interval in `NotificationBell.tsx`:

```typescript
// Default: 30 seconds
const interval = setInterval(fetchUnreadCount, 30000);

// Change to 1 minute:
const interval = setInterval(fetchUnreadCount, 60000);
```

## Testing

### Manual Testing Checklist

- [ ] Submit tier upgrade request - verify admin receives notification
- [ ] Submit tier downgrade request - verify admin receives notification
- [ ] Approve tier request - verify vendor receives notification
- [ ] Reject tier request - verify vendor receives notification
- [ ] Mark single notification as read
- [ ] Mark all notifications as read
- [ ] Verify unread count badge updates
- [ ] Verify notifications sorted by date (newest first)
- [ ] Verify click navigation works
- [ ] Verify only user's own notifications are visible

### API Testing

```bash
# Get notifications
curl -H "Cookie: payload-token=..." http://localhost:3000/api/notifications

# Mark as read
curl -X PUT -H "Cookie: payload-token=..." \
  http://localhost:3000/api/notifications/[id]/read

# Mark all as read
curl -X PUT -H "Cookie: payload-token=..." \
  http://localhost:3000/api/notifications/mark-all-read
```

## Performance Considerations

- Notifications are paginated (default 50 per page)
- Unread count is cached on frontend with 30s refresh
- Database queries use indexed fields (user, read, type, createdAt)
- Mark all as read processes in batches of 1000

## Security

- Users can only access their own notifications (enforced at collection level)
- Admins can access all notifications
- All API endpoints require authentication
- Notifications created server-side (hooks) bypass user authentication

## Future Enhancements

- [ ] Real-time notifications via WebSockets/Server-Sent Events
- [ ] Push notifications (browser API)
- [ ] Email digest of unread notifications
- [ ] Notification preferences/settings
- [ ] Bulk delete notifications
- [ ] Notification categories/groups
- [ ] Sound/visual alerts for new notifications
- [ ] Mark as read on hover (auto-mark)
