#!/bin/bash
#
# Quick script to apply Product types update
# Run with: bash apply-update.sh
#

cd /home/edwin/development/ptnextjs

echo "Applying Product types update..."
python3 update-product-types-final.py

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Update applied successfully!"
    echo ""
    echo "Verify with:"
    echo "  npx tsc --noEmit"
    echo ""
    echo "Backup location: lib/types.ts.backup"
else
    echo "✗ Update failed. Check error messages above."
    exit 1
fi
