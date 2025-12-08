#!/bin/bash

# Apply Token Version Implementation to Users.ts
# This script replaces the Users.ts file with the updated version containing tokenVersion field and hooks

set -e  # Exit on error

PROJECT_ROOT="/home/edwin/development/ptnextjs"
ORIGINAL_FILE="$PROJECT_ROOT/payload/collections/Users.ts"
NEW_FILE="$PROJECT_ROOT/payload/collections/Users.new.ts"
BACKUP_FILE="$PROJECT_ROOT/payload/collections/Users.ts.backup"

echo "================================"
echo "Token Version Patch Application"
echo "================================"
echo ""

# Check if new file exists
if [ ! -f "$NEW_FILE" ]; then
    echo "ERROR: Updated file not found at $NEW_FILE"
    exit 1
fi

# Check if original file exists
if [ ! -f "$ORIGINAL_FILE" ]; then
    echo "ERROR: Original file not found at $ORIGINAL_FILE"
    exit 1
fi

# Create backup
echo "Creating backup..."
cp "$ORIGINAL_FILE" "$BACKUP_FILE"
echo "✓ Backup created at $BACKUP_FILE"
echo ""

# Replace file
echo "Applying patch..."
mv "$NEW_FILE" "$ORIGINAL_FILE"
echo "✓ Users.ts updated with tokenVersion implementation"
echo ""

# Verify file
if [ -f "$ORIGINAL_FILE" ]; then
    echo "✓ File replacement successful"
    echo ""

    # Show what was added
    echo "Added tokenVersion field and increment hook to Users collection:"
    echo "  - tokenVersion field (default: 0, read-only)"
    echo "  - Auto-increment on password change"
    echo "  - Auto-increment on status change to suspended/rejected"
    echo ""
else
    echo "ERROR: File replacement failed"
    # Restore backup
    mv "$BACKUP_FILE" "$ORIGINAL_FILE"
    exit 1
fi

echo "Patch applied successfully!"
echo ""
echo "Next steps:"
echo "  1. Run: npm run type-check"
echo "  2. Run: npm run test:unit -- --grep 'Token Version'"
echo "  3. Commit changes: git add payload/collections/Users.ts"
echo ""
