#!/bin/bash
# Script to register AuditLogs collection in payload.config.ts

CONFIG_FILE="/home/edwin/development/ptnextjs/payload.config.ts"

# Check if AuditLogs import already exists
if grep -q "import AuditLogs from" "$CONFIG_FILE"; then
  echo "✓ AuditLogs import already exists"
else
  # Add import after ImportHistory
  sed -i "/import ImportHistory from/a import AuditLogs from './payload/collections/AuditLogs';" "$CONFIG_FILE"
  echo "✓ Added AuditLogs import"
fi

# Check if AuditLogs is in collections array
if grep -q "AuditLogs," "$CONFIG_FILE"; then
  echo "✓ AuditLogs already in collections array"
else
  # Add to collections array after ImportHistory
  sed -i "/ImportHistory,/a \    AuditLogs," "$CONFIG_FILE"
  echo "✓ Added AuditLogs to collections array"
fi

echo ""
echo "✓ Successfully registered AuditLogs collection"
