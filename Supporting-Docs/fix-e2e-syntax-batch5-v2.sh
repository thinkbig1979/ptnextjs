#!/bin/bash

# Fix E2E Test Syntax Errors - Batch 5 (Version 2)
# This script fixes two types of critical syntax errors:
# 1. Mixed quotes: template literals ending with ' instead of `
# 2. Emoji encoding: replaces emojis with ASCII equivalents

set -e

echo "=== Fixing E2E Test Syntax Errors - Batch 5 ==="
echo ""

cd /home/edwin/development/ptnextjs/tests/e2e

# Count initial errors
INITIAL_MIXED=$(grep -rn '\`.*\${[^}]*}[^`]*'"'" --include="*.spec.ts" . 2>/dev/null | wc -l)
INITIAL_EMOJIS=$(grep -rP '[✅✓❌📄👤🔍🏠⚠🎯📝🔧💡🚀✨]' --include="*.spec.ts" . 2>/dev/null | wc -l)

echo "Initial error count:"
echo "  - Mixed quote errors: $INITIAL_MIXED"
echo "  - Emoji errors: $INITIAL_EMOJIS"
echo ""

# Fix all mixed quote errors in all spec files
echo "Step 1: Fixing mixed quote errors..."
echo "--------------------------------------"

# Find all files with the error pattern
FIXED_MIXED=0
while IFS= read -r file; do
  if [ -f "$file" ]; then
    echo "  Processing: $file"
    # Use perl for more reliable regex replacement
    # Pattern: backtick followed by content including ${...}, ending with single quote
    perl -i -pe "s/\`([^\`]*\\\$\{BASE_URL\}[^\`']*?)'/\`\$1\`/g" "$file"
    FIXED_MIXED=$((FIXED_MIXED + 1))
  fi
done < <(grep -l '\`.*${BASE_URL}[^`]*'"'" --include="*.spec.ts" . 2>/dev/null)

echo "  Files processed: $FIXED_MIXED"
echo ""

# Fix all emoji errors in all spec files
echo "Step 2: Fixing emoji encoding errors..."
echo "---------------------------------------"

# Find all files with emoji characters
FIXED_EMOJIS=0
while IFS= read -r file; do
  if [ -f "$file" ]; then
    echo "  Processing: $file"
    # Replace emojis with ASCII equivalents using perl for better Unicode support
    perl -i -pe 's/✅/[OK]/g' "$file"
    perl -i -pe 's/✓/[OK]/g' "$file"
    perl -i -pe 's/❌/[FAIL]/g' "$file"
    perl -i -pe 's/📄/[DOC]/g' "$file"
    perl -i -pe 's/👤/[USER]/g' "$file"
    perl -i -pe 's/🔍/[SEARCH]/g' "$file"
    perl -i -pe 's/🏠/[HOME]/g' "$file"
    perl -i -pe 's/⚠️?/[WARN]/g' "$file"
    perl -i -pe 's/🎯/[TARGET]/g' "$file"
    perl -i -pe 's/📝/[NOTE]/g' "$file"
    perl -i -pe 's/🔧/[TOOL]/g' "$file"
    perl -i -pe 's/💡/[IDEA]/g' "$file"
    perl -i -pe 's/🚀/[ROCKET]/g' "$file"
    perl -i -pe 's/✨/[SPARKLE]/g' "$file"
    FIXED_EMOJIS=$((FIXED_EMOJIS + 1))
  fi
done < <(grep -lP '[✅✓❌📄👤🔍🏠⚠🎯📝🔧💡🚀✨]' --include="*.spec.ts" . 2>/dev/null)

echo "  Files processed: $FIXED_EMOJIS"
echo ""

# Verification
echo "Step 3: Verification..."
echo "-----------------------"

REMAINING_MIXED=$(grep -rn '\`.*\${[^}]*}[^`]*'"'" --include="*.spec.ts" . 2>/dev/null | wc -l)
REMAINING_EMOJIS=$(grep -rP '[✅✓❌📄👤🔍🏠⚠🎯📝🔧💡🚀✨]' --include="*.spec.ts" . 2>/dev/null | wc -l)

echo "Final error count:"
echo "  - Mixed quote errors: $REMAINING_MIXED (was $INITIAL_MIXED)"
echo "  - Emoji errors: $REMAINING_EMOJIS (was $INITIAL_EMOJIS)"
echo ""

echo "=== Fix Complete ==="
echo ""
echo "Summary:"
echo "  - Fixed mixed quotes in $FIXED_MIXED files"
echo "  - Fixed emojis in $FIXED_EMOJIS files"
echo "  - Errors eliminated: $((INITIAL_MIXED + INITIAL_EMOJIS - REMAINING_MIXED - REMAINING_EMOJIS))"
echo ""

if [ $REMAINING_MIXED -eq 0 ] && [ $REMAINING_EMOJIS -eq 0 ]; then
  echo "[OK] All syntax errors fixed successfully!"
  exit 0
else
  echo "[WARN] Some errors may remain:"
  if [ $REMAINING_MIXED -gt 0 ]; then
    echo ""
    echo "Remaining mixed quote errors:"
    grep -rn '\`.*\${[^}]*}[^`]*'"'" --include="*.spec.ts" . 2>/dev/null | head -10
  fi
  if [ $REMAINING_EMOJIS -gt 0 ]; then
    echo ""
    echo "Remaining emoji errors:"
    grep -rnP '[✅✓❌📄👤🔍🏠⚠🎯📝🔧💡🚀✨]' --include="*.spec.ts" . 2>/dev/null | head -10
  fi
  exit 0
fi
