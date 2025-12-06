# Notification System Quick Reference

One-page reference for the notification system implementation.

## Installation (One Command)

```bash
cd /home/edwin/development/ptnextjs
chmod +x scripts/apply-notification-patches.sh
./scripts/apply-notification-patches.sh
npm run dev
```

## Add to Header (2 Lines)

```typescript
import { NotificationBell } from '@/components/notifications';
<NotificationBell />
```

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/notifications` | Get user notifications |
| PUT | `/api/notifications/[id]/read` | Mark as read |
| PUT | `/api/notifications/mark-all-read` | Mark all as read |

## Query Parameters

```bash
# Filter by read status
GET /api/notifications?read=false

# Filter by type
GET /api/notifications?type=tier_upgrade_submitted

# Pagination
GET /api/notifications?limit=20&offset=0
```

## NotificationService Functions

```typescript
import {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  notifyAdminOfTierRequest,
  notifyVendorOfApproval,
  notifyVendorOfRejection,
} from '@/lib/services/NotificationService';

// Create notification
await createNotification({
  userId: 'user-id',
  type: 'tier_upgrade_submitted',
  title: 'Title',
  message: 'Message',
  metadata: { key: 'value' },
});

// Get notifications
const result = await getUserNotifications('user-id', {
  read: false,
  limit: 20,
});

// Mark as read
await markAsRead('notification-id', 'user-id');

// Mark all as read
await markAllAsRead('user-id');
```

## Notification Types

| Type | Recipient | Icon | Color |
|------|-----------|------|-------|
| `tier_upgrade_submitted` | Admin | ⬆️ | Blue |
| `tier_downgrade_submitted` | Admin | ⬇️ | Orange |
| `tier_upgrade_approved` | Vendor | ✅ | Green |
| `tier_downgrade_approved` | Vendor | ✅ | Green |
| `tier_upgrade_rejected` | Vendor | ❌ | Red |
| `tier_downgrade_rejected` | Vendor | ❌ | Red |

## Components

```typescript
// Bell icon with badge
import { NotificationBell } from '@/components/notifications';
<NotificationBell initialUnreadCount={5} />

// Dropdown (used internally by NotificationBell)
import { NotificationDropdown } from '@/components/notifications';
<NotificationDropdown
  onNotificationRead={() => {}}
  onAllRead={() => {}}
  onClose={() => {}}
/>

// Single notification item (used internally)
import { NotificationItem } from '@/components/notifications';
<NotificationItem
  notification={notification}
  onMarkAsRead={(id) => {}}
  onClick={() => {}}
/>
```

## TypeScript Types

```typescript
import type {
  Notification,
  NotificationType,
  NotificationMetadata,
  CreateNotificationPayload,
  NotificationFilters,
  GetNotificationsResponse,
} from '@/lib/types/notifications';

// Example usage
const notification: Notification = {
  id: 'notif-123',
  user: 'user-123',
  type: 'tier_upgrade_submitted',
  title: 'New Request',
  message: 'Vendor ABC...',
  read: false,
  metadata: { vendorId: 'vendor-abc' },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};
```

## Database Schema

```sql
-- Notifications collection
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user TEXT NOT NULL,        -- Foreign key to users
  type TEXT NOT NULL,        -- NotificationType enum
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  metadata JSON,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created ON notifications(createdAt);
```

## Testing Commands

```bash
# Type check
npm run type-check

# Start dev server
npm run dev

# Generate Payload types
npm run payload generate:types

# Access admin panel
open http://localhost:3000/admin/collections/notifications
```

## Quick Test Flow

1. Log in as vendor
2. Submit tier upgrade request
3. Log out, log in as admin
4. See notification badge
5. Click bell → see notification
6. Approve request
7. Log in as vendor
8. See approval notification

## Customization

```typescript
// Change polling interval (NotificationBell.tsx)
const interval = setInterval(fetchUnreadCount, 30000); // 30 seconds

// Change notification limit (NotificationDropdown.tsx)
const response = await fetch('/api/notifications?limit=20');

// Change icon colors (NotificationItem.tsx)
case 'tier_upgrade_submitted':
  return <ArrowUp className="h-5 w-5 text-blue-500" />;
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Bell not showing | Check authentication, verify import |
| No notifications | Check Payload admin, verify user ID |
| Count not updating | Check console for errors, verify polling |
| TypeScript errors | Run `npm run payload generate:types` |

## File Locations

```
payload/collections/Notifications.ts           [Collection]
lib/types/notifications.ts                     [Types]
lib/services/NotificationService.ts            [Service]
app/api/notifications/route.ts                 [API]
components/notifications/NotificationBell.tsx  [Component]
```

## Documentation

| Document | Purpose |
|----------|---------|
| `NOTIFICATION_SYSTEM_INSTALLATION.md` | Step-by-step setup |
| `NOTIFICATION_INTEGRATION_PATCH.md` | Integration details |
| `components/notifications/README.md` | Component usage |
| `Supporting-Docs/notification-system-testing-guide.md` | Test scenarios |
| `NOTIFICATION_SYSTEM_SUMMARY.md` | Complete overview |

## Support Checklist

- [ ] Read installation guide
- [ ] Check server logs (`npm run dev` output)
- [ ] Verify Payload admin shows notifications
- [ ] Check browser console for errors
- [ ] Verify user authentication
- [ ] Run type check
- [ ] Review testing guide

## One-Line Checks

```bash
# Check if Notifications collection exists
ls payload/collections/Notifications.ts

# Check if service exists
ls lib/services/NotificationService.ts

# Check if API endpoints exist
ls app/api/notifications/route.ts

# Check if components exist
ls components/notifications/NotificationBell.tsx

# Verify TypeScript compilation
npm run type-check

# Check database for notifications
# (if using SQLite)
sqlite3 data/payload.db "SELECT COUNT(*) FROM notifications;"
```

## Environment

No additional environment variables required. Uses existing Payload CMS configuration:
- `PAYLOAD_SECRET`
- `DATABASE_URL`
- `NEXT_PUBLIC_BASE_URL`

## Access Control Summary

| Role | Create | Read | Update | Delete |
|------|--------|------|--------|--------|
| Admin | ✅ | All | All | All |
| Vendor | ❌ | Own | Own | ❌ |
| Hooks | ✅ | N/A | N/A | N/A |

## Performance

- **Polling:** 30 seconds
- **Batch Size:** 1000 (mark all read)
- **Default Limit:** 50 notifications per page
- **Indexes:** user, read, type, createdAt

## Security

- ✅ User-scoped access (RLS)
- ✅ Authentication required
- ✅ Server-side validation
- ✅ No sensitive data in messages

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

---

**For detailed information, see:**
- `/home/edwin/development/ptnextjs/NOTIFICATION_SYSTEM_SUMMARY.md`
- `/home/edwin/development/ptnextjs/NOTIFICATION_SYSTEM_INSTALLATION.md`
