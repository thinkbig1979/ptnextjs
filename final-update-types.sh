#!/bin/bash
set -e

cd /home/edwin/development/ptnextjs

# Backup
cp lib/types.ts lib/types.ts.backup
echo "✓ Created backup: lib/types.ts.backup"

# Use Python to do the replacement
python3 - << 'PYTHON_SCRIPT'
# Read files
with open('lib/types.ts', 'r') as f:
    lines = f.readlines()

with open('lib/types-product-updated.ts', 'r') as f:
    updated = f.read()

# Combine: lines 1-795 + updated section + lines 855+
result = ''.join(lines[:795]) + updated + '\n\n' + ''.join(lines[854:])

# Write
with open('lib/types.ts', 'w') as f:
    f.write(result)

print("✓ Updated lib/types.ts successfully")
PYTHON_SCRIPT

echo ""
echo "Update Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Updated Product interface:"
echo "  • description: string | object (richText support)"
echo "  • shortDescription?: string (new field)"
echo "  • published?: boolean (new field)"
echo "  • vendor?: string | Vendor (Payload relationship)"
echo "  • categories?: (string | Category)[] (new field)"
echo "  • tags?: (string | Tag)[] (Payload relationship)"
echo "  • images?: ProductImage[] (now optional)"
echo "  • features?: Feature[] (now optional)"
echo "  • actionButtons?: ProductActionButton[] (camelCase)"
echo ""
echo "Added API Response Types:"
echo "  • GetProductsResponse"
echo "  • GetProductResponse"
echo "  • CreateProductResponse"
echo "  • UpdateProductResponse"
echo "  • DeleteProductResponse"
echo "  • TogglePublishResponse"
echo "  • ApiErrorResponse (generic)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Files modified:"
echo "  📝 /home/edwin/development/ptnextjs/lib/types.ts"
echo ""
echo "Backup location:"
echo "  💾 /home/edwin/development/ptnextjs/lib/types.ts.backup"
