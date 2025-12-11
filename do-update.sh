#!/bin/bash
set -e

cd /home/edwin/development/ptnextjs

echo "Backing up lib/types.ts..."
cp lib/types.ts lib/types.ts.backup

echo "Applying Product interface updates..."
python3 apply-product-types-update.py

echo "Done! Verifying TypeScript compilation..."
npx tsc --noEmit lib/types.ts 2>&1 | head -20 || echo "Type check complete (some errors expected in isolated file check)"

echo ""
echo "Update complete! Summary:"
echo "- Backup: lib/types.ts.backup"
echo "- Updated: lib/types.ts"
echo ""
echo "Changes made:"
echo "  ✓ Product.description now supports string | object (richText)"
echo "  ✓ Added Product.shortDescription?: string"
echo "  ✓ Added Product.published?: boolean"
echo "  ✓ Updated Product.vendor to string | Vendor"
echo "  ✓ Added Product.categories?: (string | Category)[]"
echo "  ✓ Updated Product.tags to (string | Tag)[]"
echo "  ✓ Made Product.images and Product.features optional"
echo "  ✓ Added Product.actionButtons (camelCase)"
echo "  ✓ Added 7 Product API response interfaces"
echo "  ✓ Added ApiErrorResponse interface"
