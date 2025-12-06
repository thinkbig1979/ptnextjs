#!/bin/bash

# Script to apply notification system patches to existing files
# This integrates the notification system into TierUpgradeRequests and payload.config.ts

set -e

echo "Applying notification system patches..."

# Backup files before modifying
echo "Creating backups..."
cp payload.config.ts payload.config.ts.backup
cp payload/collections/TierUpgradeRequests.ts payload/collections/TierUpgradeRequests.ts.backup

# Patch 1: Add Notifications import to payload.config.ts
echo "Patching payload.config.ts..."
sed -i "/import ImportHistory from '.\/payload\/collections\/ImportHistory';/a import Notifications from './payload/collections/Notifications';" payload.config.ts

# Patch 2: Add Notifications to collections array
sed -i "/ImportHistory,/a \    Notifications," payload.config.ts

# Patch 3: Add NotificationService imports to TierUpgradeRequests.ts
echo "Patching TierUpgradeRequests.ts..."
sed -i "/} from '..\/..\/lib\/services\/EmailService';/a import {\n  notifyAdminOfTierRequest,\n  notifyVendorOfApproval,\n  notifyVendorOfRejection,\n} from '..\/..\/lib\/services\/NotificationService';" payload/collections/TierUpgradeRequests.ts

# Patch 4: Add notification calls for upgrade submitted
sed -i "/await sendTierUpgradeRequestedEmail(emailData);/a \              // Send in-app notification to admins\n              await notifyAdminOfTierRequest(\n                vendor.companyName,\n                doc.currentTier,\n                doc.requestedTier,\n                'upgrade',\n                doc.id,\n                vendorId\n              );" payload/collections/TierUpgradeRequests.ts

# Patch 5: Add notification calls for downgrade submitted
sed -i "/await sendTierDowngradeRequestedEmail(emailData);/a \              // Send in-app notification to admins\n              await notifyAdminOfTierRequest(\n                vendor.companyName,\n                doc.currentTier,\n                doc.requestedTier,\n                'downgrade',\n                doc.id,\n                vendorId\n              );" payload/collections/TierUpgradeRequests.ts

# Patch 6: Add notification calls for upgrade approved
sed -i "/await sendTierUpgradeApprovedEmail(emailData);/a \                // Send in-app notification to vendor user\n                const userId = typeof doc.user === 'object' ? doc.user.id : doc.user;\n                await notifyVendorOfApproval(\n                  userId,\n                  'upgrade',\n                  doc.currentTier,\n                  doc.requestedTier,\n                  doc.id,\n                  vendorId\n                );" payload/collections/TierUpgradeRequests.ts

# Patch 7: Add notification calls for downgrade approved
sed -i "/await sendTierDowngradeApprovedEmail(emailData);/a \                // Send in-app notification to vendor user\n                const userId = typeof doc.user === 'object' ? doc.user.id : doc.user;\n                await notifyVendorOfApproval(\n                  userId,\n                  'downgrade',\n                  doc.currentTier,\n                  doc.requestedTier,\n                  doc.id,\n                  vendorId\n                );" payload/collections/TierUpgradeRequests.ts

# Patch 8: Add notification calls for upgrade rejected
sed -i "/await sendTierUpgradeRejectedEmail(emailData, doc.rejectionReason || 'No reason provided');/a \                // Send in-app notification to vendor user\n                const userId = typeof doc.user === 'object' ? doc.user.id : doc.user;\n                await notifyVendorOfRejection(\n                  userId,\n                  'upgrade',\n                  doc.currentTier,\n                  doc.requestedTier,\n                  doc.rejectionReason || 'No reason provided',\n                  doc.id,\n                  vendorId\n                );" payload/collections/TierUpgradeRequests.ts

# Patch 9: Add notification calls for downgrade rejected
sed -i "/await sendTierDowngradeRejectedEmail(emailData, doc.rejectionReason || 'No reason provided');/a \                // Send in-app notification to vendor user\n                const userId = typeof doc.user === 'object' ? doc.user.id : doc.user;\n                await notifyVendorOfRejection(\n                  userId,\n                  'downgrade',\n                  doc.currentTier,\n                  doc.requestedTier,\n                  doc.rejectionReason || 'No reason provided',\n                  doc.id,\n                  vendorId\n                );" payload/collections/TierUpgradeRequests.ts

echo "Patches applied successfully!"
echo ""
echo "Backups created:"
echo "  - payload.config.ts.backup"
echo "  - payload/collections/TierUpgradeRequests.ts.backup"
echo ""
echo "To restore backups:"
echo "  mv payload.config.ts.backup payload.config.ts"
echo "  mv payload/collections/TierUpgradeRequests.ts.backup payload/collections/TierUpgradeRequests.ts"
echo ""
echo "Next steps:"
echo "  1. Review the changes: git diff"
echo "  2. Run type check: npm run type-check"
echo "  3. Test the notification system"
