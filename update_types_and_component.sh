#!/bin/bash

# Update lib/types.ts to add requestType to TierUpgradeRequest interface
sed -i '/  requestedTier: .tier1. | .tier2. | .tier3.;$/a\  /** Request type (upgrade or downgrade) */\n  requestType: '\''upgrade'\'' | '\''downgrade'\'';' /home/edwin/development/ptnextjs/lib/types.ts

# Update lib/types.ts to add requestType to TierUpgradeRequestFilters interface
sed -i '/  status\?: .pending. | .approved. | .rejected. | .cancelled.;$/a\  /** Filter by request type */\n  requestType?: '\''upgrade'\'' | '\''downgrade'\'';' /home/edwin/development/ptnextjs/lib/types.ts

echo "Types updated successfully"
