# Notification System Installation Guide

This guide provides step-by-step instructions to complete the installation of the in-app notification system.

## Files Created

The following files have been created and are ready to use:

### Backend Files
- `/home/edwin/development/ptnextjs/payload/collections/Notifications.ts` - Payload collection
- `/home/edwin/development/ptnextjs/lib/types/notifications.ts` - TypeScript types
- `/home/edwin/development/ptnextjs/lib/services/NotificationService.ts` - Service layer
- `/home/edwin/development/ptnextjs/app/api/notifications/route.ts` - GET notifications API
- `/home/edwin/development/ptnextjs/app/api/notifications/[id]/read/route.ts` - Mark as read API
- `/home/edwin/development/ptnextjs/app/api/notifications/mark-all-read/route.ts` - Mark all as read API

### Frontend Files
- `/home/edwin/development/ptnextjs/components/notifications/NotificationBell.tsx` - Bell icon component
- `/home/edwin/development/ptnextjs/components/notifications/NotificationDropdown.tsx` - Dropdown component
- `/home/edwin/development/ptnextjs/components/notifications/NotificationItem.tsx` - Item component
- `/home/edwin/development/ptnextjs/components/notifications/index.ts` - Export index
- `/home/edwin/development/ptnextjs/components/notifications/README.md` - Component documentation

### Documentation Files
- `/home/edwin/development/ptnextjs/NOTIFICATION_INTEGRATION_PATCH.md` - Integration instructions
- `/home/edwin/development/ptnextjs/scripts/apply-notification-patches.sh` - Automated patch script

## Manual Installation Steps

### Step 1: Update payload.config.ts

Add the Notifications collection import and registration:

```bash
# Open the file
nano /home/edwin/development/ptnextjs/payload.config.ts

# After line 38 (import ImportHistory...), add:
import Notifications from './payload/collections/Notifications';

# In the collections array (around line 91), add after ImportHistory,:
Notifications,
```

**Full collections array should look like:**
```typescript
collections: [
  Users,
  Media,
  Vendors,
  Products,
  Categories,
  BlogPosts,
  TeamMembers,
  CompanyInfo,
  Tags,
  Yachts,
  TierUpgradeRequests,
  ImportHistory,
  Notifications,  // <-- Add this
],
```

### Step 2: Update TierUpgradeRequests.ts

Add notification service integration:

```bash
# Open the file
nano /home/edwin/development/ptnextjs/payload/collections/TierUpgradeRequests.ts
```

**2.1: Add imports (after EmailService import around line 10):**

```typescript
import {
  notifyAdminOfTierRequest,
  notifyVendorOfApproval,
  notifyVendorOfRejection,
} from '../../lib/services/NotificationService';
```

**2.2: Add notification calls in afterChange hook**

Find each email notification call and add the corresponding in-app notification:

#### A. For tier request submission (CREATE operation):

After `await sendTierUpgradeRequestedEmail(emailData);` (around line 316), add:
```typescript
// Send in-app notification to admins
await notifyAdminOfTierRequest(
  vendor.companyName,
  doc.currentTier,
  doc.requestedTier,
  'upgrade',
  doc.id,
  vendorId
);
```

After `await sendTierDowngradeRequestedEmail(emailData);` (around line 319), add:
```typescript
// Send in-app notification to admins
await notifyAdminOfTierRequest(
  vendor.companyName,
  doc.currentTier,
  doc.requestedTier,
  'downgrade',
  doc.id,
  vendorId
);
```

#### B. For tier request approval (UPDATE operation, status = approved):

After `await sendTierUpgradeApprovedEmail(emailData);` (around line 349), add:
```typescript
// Send in-app notification to vendor user
const userId = typeof doc.user === 'object' ? doc.user.id : doc.user;
await notifyVendorOfApproval(
  userId,
  'upgrade',
  doc.currentTier,
  doc.requestedTier,
  doc.id,
  vendorId
);
```

After `await sendTierDowngradeApprovedEmail(emailData);` (around line 352), add:
```typescript
// Send in-app notification to vendor user
const userId = typeof doc.user === 'object' ? doc.user.id : doc.user;
await notifyVendorOfApproval(
  userId,
  'downgrade',
  doc.currentTier,
  doc.requestedTier,
  doc.id,
  vendorId
);
```

#### C. For tier request rejection (UPDATE operation, status = rejected):

After `await sendTierUpgradeRejectedEmail(emailData, doc.rejectionReason || 'No reason provided');` (around line 360), add:
```typescript
// Send in-app notification to vendor user
const userId = typeof doc.user === 'object' ? doc.user.id : doc.user;
await notifyVendorOfRejection(
  userId,
  'upgrade',
  doc.currentTier,
  doc.requestedTier,
  doc.rejectionReason || 'No reason provided',
  doc.id,
  vendorId
);
```

After `await sendTierDowngradeRejectedEmail(emailData, doc.rejectionReason || 'No reason provided');` (around line 363), add:
```typescript
// Send in-app notification to vendor user
const userId = typeof doc.user === 'object' ? doc.user.id : doc.user;
await notifyVendorOfRejection(
  userId,
  'downgrade',
  doc.currentTier,
  doc.requestedTier,
  doc.rejectionReason || 'No reason provided',
  doc.id,
  vendorId
);
```

### Step 3: Add NotificationBell to Layout/Header

Find your main layout or header component and add the NotificationBell:

```typescript
// Example: app/layout.tsx or components/Header.tsx
import { NotificationBell } from '@/components/notifications';

export function Header() {
  return (
    <header className="flex items-center justify-between">
      {/* Your existing header content */}
      <div className="flex items-center gap-4">
        {/* Other header items */}
        <NotificationBell />
      </div>
    </header>
  );
}
```

### Step 4: Export notification types from main types file (Optional)

Add to `/home/edwin/development/ptnextjs/lib/types.ts`:

```typescript
// At the bottom of the file, add:
export * from './types/notifications';
```

## Automated Installation (Alternative)

Run the automated patch script:

```bash
cd /home/edwin/development/ptnextjs
chmod +x scripts/apply-notification-patches.sh
./scripts/apply-notification-patches.sh
```

This will automatically apply all patches. Review the changes before committing.

## Verification Steps

After installation, verify the system works:

### 1. Type Check
```bash
npm run type-check
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Check Payload Admin
- Navigate to http://localhost:3000/admin
- Verify "Notifications" collection appears in the admin sidebar

### 4. Test Notification Creation
- Submit a tier upgrade request as a vendor
- Check that admin users see a notification
- Approve/reject the request as admin
- Check that vendor user sees a notification

### 5. Test UI Components
- Click the notification bell icon
- Verify unread count badge appears
- Click a notification to mark as read
- Test "Mark all as read" button

## Troubleshooting

### Import Errors
If you see import errors for notification types:
```bash
# Re-generate Payload types
npm run payload generate:types
```

### Database Migration
If you see database errors:
```bash
# Payload will auto-migrate the schema on next start
npm run dev
```

### Component Not Showing
If NotificationBell doesn't appear:
- Check authentication (component requires authenticated user)
- Verify component is imported correctly
- Check browser console for errors

## Next Steps

Once installed, you can:
1. Customize notification styles in component files
2. Add new notification types for other events
3. Integrate with additional collections
4. Add real-time updates via WebSockets (future enhancement)

See `/home/edwin/development/ptnextjs/components/notifications/README.md` for detailed usage and customization guide.

## Rollback

If you need to rollback the changes:

```bash
# If you used the automated script (backups created)
mv payload.config.ts.backup payload.config.ts
mv payload/collections/TierUpgradeRequests.ts.backup payload/collections/TierUpgradeRequests.ts

# Or use git
git checkout payload.config.ts payload/collections/TierUpgradeRequests.ts

# Remove created files
rm -rf components/notifications
rm -rf lib/types/notifications.ts
rm -rf lib/services/NotificationService.ts
rm -rf app/api/notifications
rm payload/collections/Notifications.ts
```

## Support

For issues or questions:
1. Check the notification system README: `components/notifications/README.md`
2. Review the integration patch documentation: `NOTIFICATION_INTEGRATION_PATCH.md`
3. Check server logs for error messages
4. Verify all files are created correctly
