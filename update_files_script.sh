#!/bin/bash

cd /home/edwin/development/ptnextjs

# Backup original component
cp components/admin/AdminTierRequestQueue.tsx components/admin/AdminTierRequestQueue.tsx.bak

# Replace with new version
mv components/admin/AdminTierRequestQueue.new.tsx components/admin/AdminTierRequestQueue.tsx

# Update lib/types.ts - Add requestType field to TierUpgradeRequest
# Find the line with "requestedTier: 'tier1' | 'tier2' | 'tier3';" and add requestType after it
sed -i "/requestedTier: 'tier1' | 'tier2' | 'tier3';/a\  /** Request type (upgrade or downgrade) */\n  requestType: 'upgrade' | 'downgrade';" lib/types.ts

# Update lib/types.ts - Add requestType to TierUpgradeRequestFilters
# Find the line with "status?: 'pending' | 'approved' | 'rejected' | 'cancelled';" and add requestType after it
sed -i "/status\?: 'pending' | 'approved' | 'rejected' | 'cancelled';/a\  /** Filter by request type */\n  requestType?: 'upgrade' | 'downgrade';" lib/types.ts

echo "Files updated successfully!"
echo "- AdminTierRequestQueue.tsx has been updated"
echo "- lib/types.ts has been updated with requestType field"
