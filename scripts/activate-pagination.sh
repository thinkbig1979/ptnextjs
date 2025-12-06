#!/bin/bash

# Pagination System Activation Script
# This script replaces the old repository files with the new paginated versions

set -e

echo "========================================="
echo "Pagination System Activation"
echo "========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: Must be run from project root directory"
    exit 1
fi

# Backup old files
echo "Creating backups..."
mkdir -p .backups/pagination-migration-$(date +%Y%m%d-%H%M%S)
BACKUP_DIR=".backups/pagination-migration-$(date +%Y%m%d-%H%M%S)"

cp lib/repositories/types.ts "$BACKUP_DIR/types.ts.bak"
cp lib/repositories/VendorRepository.ts "$BACKUP_DIR/VendorRepository.ts.bak"
cp lib/repositories/ProductRepository.ts "$BACKUP_DIR/ProductRepository.ts.bak"
cp lib/repositories/BlogRepository.ts "$BACKUP_DIR/BlogRepository.ts.bak"

echo "Backups created in $BACKUP_DIR"
echo ""

# Replace files
echo "Activating pagination system..."

mv lib/repositories/types_new.ts lib/repositories/types.ts
mv lib/repositories/VendorRepository_new.ts lib/repositories/VendorRepository.ts
mv lib/repositories/ProductRepository_new.ts lib/repositories/ProductRepository.ts
mv lib/repositories/BlogRepository_new.ts lib/repositories/BlogRepository.ts

echo "✓ Repository files updated"
echo ""

# Type check
echo "Running TypeScript type check..."
npm run type-check

if [ $? -eq 0 ]; then
    echo "✓ Type check passed"
else
    echo "✗ Type check failed"
    echo "Restoring backups..."
    cp "$BACKUP_DIR/types.ts.bak" lib/repositories/types.ts
    cp "$BACKUP_DIR/VendorRepository.ts.bak" lib/repositories/VendorRepository.ts
    cp "$BACKUP_DIR/ProductRepository.ts.bak" lib/repositories/ProductRepository.ts
    cp "$BACKUP_DIR/BlogRepository.ts.bak" lib/repositories/BlogRepository.ts
    echo "Files restored from backup"
    exit 1
fi

echo ""
echo "========================================="
echo "Pagination system activated successfully!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Run tests: npm run test"
echo "2. Test API endpoints:"
echo "   - GET /api/vendors?page=1&limit=20"
echo "   - GET /api/products?page=1&limit=20"
echo "   - GET /api/blog?page=1&limit=20"
echo "3. Update frontend components to use paginated APIs"
echo ""
