#!/bin/bash
#Fix E2E Test Syntax Errors - Batch 11 (Comprehensive)

cd /home/edwin/development/ptnextjs

echo "Fixing all mixed quote errors..."

# Fix template literal mixed quotes - change ending single quote to backtick
find tests/e2e -name "*.spec.ts" -type f -exec sed -i "s|\`\${BASE_URL}\([^']*\)'|\`\${BASE_URL}\1\`|g" {} \;

echo "Fixing emoji encoding issues..."

# Replace emojis with ASCII equivalents
find tests/e2e -name "*.spec.ts" -type f -exec sed -i '
s/✅/[OK]/g
s/✓/[OK]/g
s/❌/[FAIL]/g
s/📄/[DOC]/g
s/👤/[USER]/g
s/🔍/[SEARCH]/g
s/⚠️/[WARN]/g
s/⚠/[WARN]/g
' {} \;

echo ""
echo "All fixes applied!"
echo "Files modified in tests/e2e directory"
