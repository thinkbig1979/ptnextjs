#!/bin/bash

# Script to update admin API endpoint to support requestType filter

FILE="/home/edwin/development/ptnextjs/app/api/admin/tier-upgrade-requests/route.ts"

# Make backup
cp "$FILE" "$FILE.backup-$(date +%Y%m%d_%H%M%S)"

# Update the import to include RequestType
sed -i "s/import type { RequestStatus } from/import type { RequestStatus, RequestType } from/" "$FILE"

# Update the comment to mention downgrades
sed -i "s/List all tier upgrade requests with filtering/List all tier upgrade\/downgrade requests with filtering/" "$FILE"

# Update GET function comment
sed -i "s/GET - List tier upgrade requests with filtering and pagination/GET - List tier upgrade\/downgrade requests with filtering and pagination/" "$FILE"

# Add requestType variable after status variable
sed -i "/const status = searchParams.get('status') as RequestStatus | null;/a\\      const requestType = searchParams.get('requestType') as RequestType | null;" "$FILE"

# Add requestType filter after status filter
sed -i "/if (status) {/,/}/a\\
\\
      if (requestType) {\\
        filters.requestType = requestType;\\
      }" "$FILE"

echo "✅ Successfully updated $FILE"
echo "📝 Backup created at $FILE.backup-$(date +%Y%m%d_%H%M%S)"
