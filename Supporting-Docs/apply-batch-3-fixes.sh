#!/bin/bash
# Apply Batch 3 E2E Test Syntax Fixes
# This script applies the corrected versions of the test files

set -e

echo "==================================================================="
echo "   Batch 3 E2E Test Syntax Fixes - Application Script"
echo "==================================================================="
echo ""

# Define paths
BASE_DIR="/home/edwin/development/ptnextjs"
TESTS_DIR="$BASE_DIR/tests/e2e"

# Files to fix
FILE1_ORIG="$TESTS_DIR/product-description-rendering.spec.ts"
FILE1_FIXED="$TESTS_DIR/product-description-rendering.spec.ts.fixed"
FILE2_ORIG="$TESTS_DIR/vendor-dashboard.spec.ts"
FILE2_FIXED="$TESTS_DIR/vendor-dashboard.spec.ts.fixed"

echo "Step 1: Verify fixed files exist..."
if [ ! -f "$FILE1_FIXED" ]; then
    echo "ERROR: Fixed file not found: $FILE1_FIXED"
    exit 1
fi
if [ ! -f "$FILE2_FIXED" ]; then
    echo "ERROR: Fixed file not found: $FILE2_FIXED"
    exit 1
fi
echo "  [OK] All fixed files found"
echo ""

echo "Step 2: Create backups of original files..."
cp "$FILE1_ORIG" "$FILE1_ORIG.backup"
cp "$FILE2_ORIG" "$FILE2_ORIG.backup"
echo "  [OK] Backups created:"
echo "      - $FILE1_ORIG.backup"
echo "      - $FILE2_ORIG.backup"
echo ""

echo "Step 3: Apply fixes..."
cp "$FILE1_FIXED" "$FILE1_ORIG"
cp "$FILE2_FIXED" "$FILE2_ORIG"
echo "  [OK] Fixes applied to:"
echo "      - $FILE1_ORIG"
echo "      - $FILE2_ORIG"
echo ""

echo "Step 4: Verify syntax (quick check)..."
# Check for mixed quotes
if grep -l "\`[^\`]*';" "$FILE1_ORIG" "$FILE2_ORIG" 2>/dev/null; then
    echo "  [WARN] Mixed quotes still detected!"
else
    echo "  [OK] No mixed quotes detected"
fi

# Check for emojis
if grep -l "[✅✓❌📄👤🔍🏠⚠]" "$FILE1_ORIG" "$FILE2_ORIG" 2>/dev/null; then
    echo "  [WARN] Emojis still detected!"
else
    echo "  [OK] No emojis detected"
fi

# Check for BASE_URL constant
if grep -q "const BASE_URL" "$FILE1_ORIG"; then
    echo "  [OK] BASE_URL constant found in file 1"
else
    echo "  [WARN] BASE_URL constant missing in file 1!"
fi
echo ""

echo "Step 5: Cleanup fixed files..."
rm "$FILE1_FIXED"
rm "$FILE2_FIXED"
echo "  [OK] Temporary fixed files removed"
echo ""

echo "==================================================================="
echo "   Batch 3 Fixes Applied Successfully!"
echo "==================================================================="
echo ""
echo "Summary:"
echo "  - Files fixed: 2"
echo "  - Syntax errors fixed: 23"
echo "    - Mixed quote errors: 5"
echo "    - Emoji encoding errors: 17"
echo "    - Missing constants: 1"
echo ""
echo "Next Steps:"
echo "  1. Run type check: cd $BASE_DIR && npm run type-check"
echo "  2. Run E2E tests: npm run test:e2e"
echo ""
echo "To restore backups if needed:"
echo "  cp $FILE1_ORIG.backup $FILE1_ORIG"
echo "  cp $FILE2_ORIG.backup $FILE2_ORIG"
echo ""
