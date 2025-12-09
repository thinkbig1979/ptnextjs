#!/bin/bash
#
# Fix E2E Test Syntax Errors - Batch 9
# Fixes emoji encoding errors and missing BASE_URL constants
#

set -e  # Exit on error

cd /home/edwin/development/ptnextjs

echo "========================================="
echo "E2E Test Syntax Fixes - Batch 9"
echo "========================================="
echo ""

# Function to backup a file
backup_file() {
    local file="$1"
    if [ -f "$file" ]; then
        cp "$file" "$file.backup-batch9"
        echo "  [BACKUP] Created backup: $file.backup-batch9"
    fi
}

# Function to add BASE_URL constant
add_base_url() {
    local file="$1"
    echo "[FIX] Adding BASE_URL to: $file"
    backup_file "$file"

    # Insert BASE_URL after the import line
    sed -i "/^import.*@playwright\/test/a\\
\\
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';" "$file"

    echo "  [OK] BASE_URL constant added"
}

# Function to remove emojis
remove_emojis() {
    local file="$1"
    echo "[FIX] Removing emojis from: $file"

    if [ ! -f "$file.backup-batch9" ]; then
        backup_file "$file"
    fi

    # Replace emojis with ASCII equivalents
    sed -i 's/✅/[OK]/g' "$file"
    sed -i 's/❌/[ERROR]/g' "$file"
    sed -i 's/⚠️/[WARNING]/g' "$file"
    sed -i 's/ℹ️/[INFO]/g' "$file"
    sed -i 's/📍/[STEP]/g' "$file"
    sed -i 's/📸/[SCREENSHOT]/g' "$file"
    sed -i 's/📊/[DATA]/g' "$file"
    sed -i 's/📋/[FORM]/g' "$file"
    sed -i 's/👤/[USER]/g' "$file"
    sed -i 's/📦/[ELEMENT]/g' "$file"
    sed -i 's/✓/[OK]/g' "$file"

    echo "  [OK] Emojis removed"
}

echo "Step 1: Fixing product-tabs-simplified.spec.ts"
echo "-----------------------------------------------"
if [ -f "tests/e2e/product-tabs-simplified.spec.ts" ]; then
    if ! grep -q "const BASE_URL" "tests/e2e/product-tabs-simplified.spec.ts"; then
        add_base_url "tests/e2e/product-tabs-simplified.spec.ts"
    else
        echo "  [SKIP] BASE_URL already defined"
    fi
else
    echo "  [ERROR] File not found"
fi
echo ""

echo "Step 2: Fixing product-review-submission.spec.ts"
echo "-----------------------------------------------"
if [ -f "tests/e2e/product-review-submission.spec.ts" ]; then
    if ! grep -q "const BASE_URL" "tests/e2e/product-review-submission.spec.ts"; then
        add_base_url "tests/e2e/product-review-submission.spec.ts"
    else
        echo "  [SKIP] BASE_URL already defined"
    fi
    remove_emojis "tests/e2e/product-review-submission.spec.ts"
else
    echo "  [ERROR] File not found"
fi
echo ""

echo "Step 3: Fixing location-search-verification.spec.ts"
echo "-----------------------------------------------"
if [ -f "tests/e2e/location-search-verification.spec.ts" ]; then
    remove_emojis "tests/e2e/location-search-verification.spec.ts"
else
    echo "  [ERROR] File not found"
fi
echo ""

echo "Step 4: Fixing migration.spec.ts"
echo "-----------------------------------------------"
if [ -f "tests/e2e/migration.spec.ts" ]; then
    remove_emojis "tests/e2e/migration.spec.ts"
else
    echo "  [ERROR] File not found"
fi
echo ""

echo "Step 5: Fixing product-integration-tab.spec.ts"
echo "-----------------------------------------------"
if [ -f "tests/e2e/product-integration-tab.spec.ts" ]; then
    remove_emojis "tests/e2e/product-integration-tab.spec.ts"
else
    echo "  [ERROR] File not found"
fi
echo ""

echo "Step 6: Fixing product-review-modal-fix.spec.ts"
echo "-----------------------------------------------"
if [ -f "tests/e2e/product-review-modal-fix.spec.ts" ]; then
    remove_emojis "tests/e2e/product-review-modal-fix.spec.ts"
else
    echo "  [ERROR] File not found"
fi
echo ""

echo "Step 7: Fixing product-reviews-visual-check.spec.ts"
echo "-----------------------------------------------"
if [ -f "tests/e2e/product-reviews-visual-check.spec.ts" ]; then
    remove_emojis "tests/e2e/product-reviews-visual-check.spec.ts"
else
    echo "  [ERROR] File not found"
fi
echo ""

echo "Step 8: Fixing promotion-pack-form.spec.ts"
echo "-----------------------------------------------"
if [ -f "tests/e2e/promotion-pack-form.spec.ts" ]; then
    remove_emojis "tests/e2e/promotion-pack-form.spec.ts"
else
    echo "  [ERROR] File not found"
fi
echo ""

echo "========================================="
echo "SUMMARY"
echo "========================================="
echo ""
echo "Fixed files:"
echo "  1. product-tabs-simplified.spec.ts (BASE_URL added)"
echo "  2. product-review-submission.spec.ts (BASE_URL added + emojis removed)"
echo "  3. location-search-verification.spec.ts (emojis removed)"
echo "  4. migration.spec.ts (emojis removed)"
echo "  5. product-integration-tab.spec.ts (emojis removed)"
echo "  6. product-review-modal-fix.spec.ts (emojis removed)"
echo "  7. product-reviews-visual-check.spec.ts (emojis removed)"
echo "  8. promotion-pack-form.spec.ts (emojis removed)"
echo ""
echo "Files with no errors (unchanged):"
echo "  - manual-verification.spec.ts"
echo "  - partner-filter-validation.spec.ts"
echo ""
echo "Backups created with .backup-batch9 extension"
echo ""
echo "All fixes complete!"
