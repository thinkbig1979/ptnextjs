#!/bin/bash

# Fix E2E Test Syntax Errors - Batch 7
# Fixes:
# 1. Emoji encoding errors in console.log statements
# Note: No mixed quote errors found in batch 7 files

set -e

REPO_ROOT="/home/edwin/development/ptnextjs"
cd "$REPO_ROOT"

echo "=== Fixing Batch 7 E2E Test Syntax Errors ==="
echo ""

# List of files to fix
FILES=(
  "tests/e2e/blog-image-cache-fix.spec.ts"
  "tests/e2e/brand-story-tier-fix.spec.ts"
  "tests/e2e/debug-cache-clearing.spec.ts"
  "tests/e2e/debug-errors.spec.ts"
  "tests/e2e/debug-founded-year-display.spec.ts"
  "tests/e2e/debug-founded-year-flow.spec.ts"
  "tests/e2e/debug-save-button.spec.ts"
  "tests/e2e/debug-vendor-data.spec.ts"
  "tests/e2e/debug-vendor-update.spec.ts"
  "tests/e2e/example-tier-upgrade-helpers-usage.spec.ts"
)

# Function to fix emojis in a file
fix_emojis() {
  local file="$1"

  # Check if file has emojis
  if ! grep -qP '[\x{1F300}-\x{1F9FF}\x{2600}-\x{26FF}\x{2700}-\x{27BF}✅✓❌⚠️ℹ️📄👤🔍🎯💾🔧📝🚀💡🏢📊🔄📋📅📦📸]' "$file" 2>/dev/null; then
    echo "  - No emojis found, skipping"
    return 0
  fi

  echo "  - Fixing emojis..."

  # Create backup
  cp "$file" "$file.bak"

  # Fix emojis - using explicit character codes for reliability
  sed -i 's/✅/[OK]/g' "$file"
  sed -i 's/✓/[OK]/g' "$file"
  sed -i 's/❌/[FAIL]/g' "$file"
  sed -i 's/⚠️/[WARNING]/g' "$file"
  sed -i 's/⚠/[WARNING]/g' "$file"
  sed -i 's/ℹ️/[INFO]/g' "$file"
  sed -i 's/ℹ/[INFO]/g' "$file"
  sed -i 's/📄/[DOC]/g' "$file"
  sed -i 's/👤/[USER]/g' "$file"
  sed -i 's/🔍/[SEARCH]/g' "$file"
  sed -i 's/🎯/[TARGET]/g' "$file"
  sed -i 's/💾/[SAVE]/g' "$file"
  sed -i 's/🔧/[CONFIG]/g' "$file"
  sed -i 's/📝/[NOTE]/g' "$file"
  sed -i 's/🚀/[LAUNCH]/g' "$file"
  sed -i 's/💡/[IDEA]/g' "$file"
  sed -i 's/🏢/[BUSINESS]/g' "$file"
  sed -i 's/📊/[CHART]/g' "$file"
  sed -i 's/🔄/[REFRESH]/g' "$file"
  sed -i 's/📋/[LIST]/g' "$file"
  sed -i 's/📅/[DATE]/g' "$file"
  sed -i 's/📦/[PACKAGE]/g' "$file"
  sed -i 's/📸/[SCREENSHOT]/g' "$file"
  sed -i 's/✗/[X]/g' "$file"

  echo "  - Done"
}

# Process each file
echo "Processing files..."
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "File: $file"
    fix_emojis "$file"
  else
    echo "WARNING: File not found: $file"
  fi
done

echo ""
echo "=== Verification ==="
echo "Checking for remaining emojis..."

# Check for remaining issues
ISSUES_FOUND=0
for file in "${FILES[@]}"; do
  if [ ! -f "$file" ]; then
    continue
  fi

  # Check for common emojis
  if grep -qE '✅|✓|❌|⚠️|ℹ️|📄|👤|🔍|🎯|💾|🔧|📝|🚀|💡|🏢|📊|🔄|📋|📅|📦|📸|✗' "$file" 2>/dev/null; then
    echo "WARNING: Emojis still found in $file:"
    grep -n -E '✅|✓|❌|⚠️|ℹ️|📄|👤|🔍|🎯|💾|🔧|📝|🚀|💡|🏢|📊|🔄|📋|📅|📦|📸|✗' "$file"
    ISSUES_FOUND=1
  fi
done

echo ""
if [ $ISSUES_FOUND -eq 0 ]; then
  echo "[OK] All syntax errors fixed!"
  echo ""
  echo "Backup files created with .bak extension"
  echo "Run 'rm tests/e2e/*.bak' to remove backups if tests pass"
else
  echo "[WARNING] Some issues remain - manual review required"
fi

echo ""
echo "=== Summary ==="
echo "Processed ${#FILES[@]} files"
echo "  - Replaced emojis with ASCII equivalents"
echo "  - No mixed quote errors found in batch 7 files"
