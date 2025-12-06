# Notification System Integration Patch

This file documents the manual changes needed to integrate the notification system into the TierUpgradeRequests collection.

## File: `/home/edwin/development/ptnextjs/payload/collections/TierUpgradeRequests.ts`

### 1. Add NotificationService imports

Add this import at the top of the file, after the EmailService imports:

```typescript
import {
  notifyAdminOfTierRequest,
  notifyVendorOfApproval,
  notifyVendorOfRejection,
} from '../../lib/services/NotificationService';
```

### 2. Add notification calls in the afterChange hook

#### For Tier Request Submission (create operation)

After line 316 (`await sendTierUpgradeRequestedEmail(emailData);`), add:

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

After line 319 (`await sendTierDowngradeRequestedEmail(emailData);`), add:

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

#### For Tier Request Approval (update operation, status = approved)

After line 349 (`await sendTierUpgradeApprovedEmail(emailData);`), add:

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

After line 352 (`await sendTierDowngradeApprovedEmail(emailData);`), add:

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

#### For Tier Request Rejection (update operation, status = rejected)

After line 360 (`await sendTierUpgradeRejectedEmail(emailData, doc.rejectionReason || 'No reason provided');`), add:

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

After line 363 (`await sendTierDowngradeRejectedEmail(emailData, doc.rejectionReason || 'No reason provided');`), add:

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

## File: `/home/edwin/development/ptnextjs/payload.config.ts`

### Add Notifications collection import

After line 38 (`import ImportHistory from './payload/collections/ImportHistory';`), add:

```typescript
import Notifications from './payload/collections/Notifications';
```

### Add Notifications to collections array

In the collections array (around line 91), add after `ImportHistory,`:

```typescript
Notifications,
```

The collections array should look like:

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
  Notifications,
],
```

## Apply the patch

Run this command to apply all changes:

```bash
# This will be done manually or via script
```
