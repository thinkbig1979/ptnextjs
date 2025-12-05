#!/bin/bash
# Script to apply TierUpgradeRequestService updates for downgrade support

set -e

cd /home/edwin/development/ptnextjs

echo "Creating backup of original file..."
cp lib/services/TierUpgradeRequestService.ts lib/services/TierUpgradeRequestService.ts.backup

echo "Replacing with new version..."
mv lib/services/TierUpgradeRequestService.ts.new lib/services/TierUpgradeRequestService.ts

echo "File updated successfully!"
echo "Original backed up to: lib/services/TierUpgradeRequestService.ts.backup"

echo ""
echo "Running type check..."
npm run type-check
