#!/bin/bash
#
# E2E Test Syntax Error Fixer
# Fixes two types of critical syntax errors:
# 1. Mixed quotes: `...stuff...' -> `...stuff...`
# 2. Emoji encoding: Replace emojis with ASCII equivalents
#

set -euo pipefail

PROJECT_ROOT="/home/edwin/development/ptnextjs"
cd "$PROJECT_ROOT"

echo "==========================================="
echo "E2E Test Syntax Error Fixer"
echo "==========================================="
echo ""

# Counters
files_processed=0
files_fixed=0

# Find all .spec.ts files in tests/e2e
while IFS= read -r -d '' file; do
    ((files_processed++))

    rel_file="${file#$PROJECT_ROOT/}"
    changes_made=0

    # Create backup
    cp "$file" "$file.bak"

    # Fix 1: Mixed quotes - `...stuff...' -> `...stuff...`
    # This sed command finds backtick followed by characters and ending with single quote
    # and replaces the closing single quote with a backtick
    if grep -q "\`[^\`]*'" "$file"; then
        sed -i "s/\`\([^\`]*\)'/\`\1\`/g" "$file"
        ((changes_made++))
    fi

    # Fix 2: Replace emojis with ASCII equivalents
    # Check if file contains any emojis
    if grep -qE '✅|✓|❌|📄|👤|🔍|🏠|⚠️|⚠|🎯|🔧|📝|💡|🚀|🔒|🔑|📊|🎉|🐛|⏱️|⏱|🕐' "$file" 2>/dev/null; then
        sed -i 's/✅/[OK]/g' "$file"
        sed -i 's/✓/[OK]/g' "$file"
        sed -i 's/❌/[FAIL]/g' "$file"
        sed -i 's/📄/[DOC]/g' "$file"
        sed -i 's/👤/[USER]/g' "$file"
        sed -i 's/🔍/[SEARCH]/g' "$file"
        sed -i 's/🏠/[HOME]/g' "$file"
        sed -i 's/⚠️/[WARN]/g' "$file"
        sed -i 's/⚠/[WARN]/g' "$file"
        sed -i 's/🎯/[TARGET]/g' "$file"
        sed -i 's/🔧/[CONFIG]/g' "$file"
        sed -i 's/📝/[NOTE]/g' "$file"
        sed -i 's/💡/[INFO]/g' "$file"
        sed -i 's/🚀/[LAUNCH]/g' "$file"
        sed -i 's/🔒/[LOCK]/g' "$file"
        sed -i 's/🔑/[KEY]/g' "$file"
        sed -i 's/📊/[CHART]/g' "$file"
        sed -i 's/🎉/[SUCCESS]/g' "$file"
        sed -i 's/🐛/[BUG]/g' "$file"
        sed -i 's/⏱️/[TIMER]/g' "$file"
        sed -i 's/⏱/[TIMER]/g' "$file"
        sed -i 's/🕐/[TIME]/g' "$file"
        ((changes_made++))
    fi

    # Check if file actually changed
    if ! diff -q "$file" "$file.bak" >/dev/null 2>&1; then
        ((files_fixed++))
        echo "[FIXED] $rel_file"
        rm "$file.bak"
    else
        # No changes, restore backup
        mv "$file.bak" "$file"
    fi

done < <(find tests/e2e -name "*.spec.ts" -type f -print0)

echo ""
echo "==========================================="
echo "Summary"
echo "==========================================="
echo "Files processed: $files_processed"
echo "Files fixed: $files_fixed"
echo ""
echo "Done!"
