#!/bin/bash
# Batch 3 E2E Test Syntax Fixes
# This script fixes mixed quote syntax errors and emoji encoding issues

set -e

echo "=== Batch 3 E2E Test Syntax Fixes ==="
echo ""

# File 1: product-description-rendering.spec.ts
echo "Fixing: tests/e2e/product-description-rendering.spec.ts"
FILE1="/home/edwin/development/ptnextjs/tests/e2e/product-description-rendering.spec.ts"

# Add BASE_URL constant after import line
sed -i "2i\\
\\
const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';" "$FILE1"

# Fix mixed quotes - replace '); with `);
sed -i "s/\`\${BASE_URL}\/products');/\`\${BASE_URL}\/products\`);/g" "$FILE1"
sed -i "s/\`\${BASE_URL}\/products\/maritime-technology-partners-intelligent-lighting-control-system');/\`\${BASE_URL}\/products\/maritime-technology-partners-intelligent-lighting-control-system\`);/g" "$FILE1"

echo "  - Added BASE_URL constant"
echo "  - Fixed 5 instances of mixed quotes (backtick to single quote)"
echo ""

# File 2: vendor-dashboard.spec.ts
echo "Fixing: tests/e2e/vendor-dashboard.spec.ts"
FILE2="/home/edwin/development/ptnextjs/tests/e2e/vendor-dashboard.spec.ts"

# Replace all emoji characters with ASCII equivalents
sed -i "s/✓/[OK]/g" "$FILE2"
sed -i "s/⚠/[WARN]/g" "$FILE2"

echo "  - Replaced ✓ emoji with [OK] (16 instances)"
echo "  - Replaced ⚠ emoji with [WARN] (1 instance)"
echo ""

echo "=== Syntax Fixes Complete ==="
echo ""
echo "Files fixed:"
echo "  - /home/edwin/development/ptnextjs/tests/e2e/product-description-rendering.spec.ts"
echo "  - /home/edwin/development/ptnextjs/tests/e2e/vendor-dashboard.spec.ts"
