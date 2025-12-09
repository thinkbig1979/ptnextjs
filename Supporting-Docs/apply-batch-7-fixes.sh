#!/bin/bash

# Apply Batch 7 E2E Test Syntax Fixes
# This script applies emoji replacements to the 4 files that need fixing

set -e

cd /home/edwin/development/ptnextjs

echo "=== Applying Batch 7 Fixes ==="
echo ""

# Create backups
echo "Creating backups..."
cp tests/e2e/blog-image-cache-fix.spec.ts tests/e2e/blog-image-cache-fix.spec.ts.bak
cp tests/e2e/brand-story-tier-fix.spec.ts tests/e2e/brand-story-tier-fix.spec.ts.bak
cp tests/e2e/debug-founded-year-display.spec.ts tests/e2e/debug-founded-year-display.spec.ts.bak
cp tests/e2e/debug-founded-year-flow.spec.ts tests/e2e/debug-founded-year-flow.spec.ts.bak
echo "Backups created"
echo ""

# Fix File 1: blog-image-cache-fix.spec.ts
echo "Fixing blog-image-cache-fix.spec.ts..."
sed -i "s/✅/[OK]/g" tests/e2e/blog-image-cache-fix.spec.ts
sed -i "s/✓/[OK]/g" tests/e2e/blog-image-cache-fix.spec.ts
sed -i "s/⚠️/[WARNING]/g" tests/e2e/blog-image-cache-fix.spec.ts
sed -i "s/ℹ️/[INFO]/g" tests/e2e/blog-image-cache-fix.spec.ts

# Fix File 2: brand-story-tier-fix.spec.ts
echo "Fixing brand-story-tier-fix.spec.ts..."
sed -i "s/✓/[OK]/g" tests/e2e/brand-story-tier-fix.spec.ts
sed -i "s/✗/[X]/g" tests/e2e/brand-story-tier-fix.spec.ts
sed -i "s/❌/[FAIL]/g" tests/e2e/brand-story-tier-fix.spec.ts
sed -i "s/✅/[OK]/g" tests/e2e/brand-story-tier-fix.spec.ts

# Fix File 3: debug-founded-year-display.spec.ts
echo "Fixing debug-founded-year-display.spec.ts..."
sed -i "s/📋/[LIST]/g" tests/e2e/debug-founded-year-display.spec.ts
sed -i "s/🔍/[SEARCH]/g" tests/e2e/debug-founded-year-display.spec.ts
sed -i "s/✅/[OK]/g" tests/e2e/debug-founded-year-display.spec.ts
sed -i "s/❌/[FAIL]/g" tests/e2e/debug-founded-year-display.spec.ts
sed -i "s/📅/[DATE]/g" tests/e2e/debug-founded-year-display.spec.ts
sed -i "s/📦/[PACKAGE]/g" tests/e2e/debug-founded-year-display.spec.ts
sed -i "s/📸/[SCREENSHOT]/g" tests/e2e/debug-founded-year-display.spec.ts

# Fix File 4: debug-founded-year-flow.spec.ts
echo "Fixing debug-founded-year-flow.spec.ts..."
sed -i "s/✓/[OK]/g" tests/e2e/debug-founded-year-flow.spec.ts
sed -i "s/✅/[OK]/g" tests/e2e/debug-founded-year-flow.spec.ts

echo ""
echo "=== Verification ==="

# Verify fixes
ERRORS=0

echo "Checking for remaining emojis..."
if grep -q "✅\|✓\|❌\|⚠️\|ℹ️\|📋\|🔍\|📅\|📦\|📸\|✗" tests/e2e/blog-image-cache-fix.spec.ts; then
  echo "[FAIL] Emojis still in blog-image-cache-fix.spec.ts"
  ERRORS=1
fi

if grep -q "✅\|✓\|❌\|✗" tests/e2e/brand-story-tier-fix.spec.ts; then
  echo "[FAIL] Emojis still in brand-story-tier-fix.spec.ts"
  ERRORS=1
fi

if grep -q "✅\|❌\|📋\|🔍\|📅\|📦\|📸" tests/e2e/debug-founded-year-display.spec.ts; then
  echo "[FAIL] Emojis still in debug-founded-year-display.spec.ts"
  ERRORS=1
fi

if grep -q "✅\|✓" tests/e2e/debug-founded-year-flow.spec.ts; then
  echo "[FAIL] Emojis still in debug-founded-year-flow.spec.ts"
  ERRORS=1
fi

if [ $ERRORS -eq 0 ]; then
  echo "[OK] All emojis successfully replaced!"
  echo ""
  echo "Summary:"
  echo "  - Fixed 4 files"
  echo "  - Replaced approximately 47 emoji instances"
  echo "  - Backups saved with .bak extension"
  echo ""
  echo "Next steps:"
  echo "  1. Run tests to verify syntax is correct"
  echo "  2. If tests pass, remove backups: rm tests/e2e/*.bak"
else
  echo "[WARNING] Some emojis may remain - check output above"
  echo "Backup files can be restored from .bak files"
fi
