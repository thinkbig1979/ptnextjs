#!/bin/bash

# Backup original file
cp /home/edwin/development/ptnextjs/payload/collections/TierUpgradeRequests.ts /home/edwin/development/ptnextjs/payload/collections/TierUpgradeRequests.ts.backup

# Replace with new version
cp /home/edwin/development/ptnextjs/payload/collections/TierUpgradeRequests_NEW.ts /home/edwin/development/ptnextjs/payload/collections/TierUpgradeRequests.ts

# Remove temporary file
rm /home/edwin/development/ptnextjs/payload/collections/TierUpgradeRequests_NEW.ts

echo "File updated successfully"
echo "Backup saved as TierUpgradeRequests.ts.backup"
