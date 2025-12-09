#!/bin/bash
# Fix E2E Test Syntax Errors - Batch 6
# Fixes mixed quote errors and emoji encoding issues

set -e

PROJECT_ROOT="/home/edwin/development/ptnextjs"
cd "$PROJECT_ROOT"

echo "========================================"
echo "E2E Test Syntax Error Fixer - Batch 6"
echo "========================================"
echo ""

# Counter for statistics
total_files=0
files_fixed=0
quote_fixes=0
emoji_fixes=0

# Function to fix a single file
fix_file() {
    local file="$1"
    local temp_file="${file}.tmp"
    local changes_made=0

    # Check if file exists
    if [[ ! -f "$file" ]]; then
        echo "[SKIP] File not found: $file"
        return
    fi

    ((total_files++))

    # Create temp file with fixes
    cat "$file" > "$temp_file"

    # Fix 1: Mixed quotes - Template literals ending with single quote
    # Pattern: `...stuff...' should be `...stuff...`
    # We need to be careful to only match template literals
    if grep -q "\`[^\`]*'" "$temp_file"; then
        # Fix various patterns of mixed quotes
        sed -i "s/\`\([^\`]*\)'/\`\1\`/g" "$temp_file"

        # Count how many were fixed
        local count=$(grep -c "\`[^\`]*'" "$file" 2>/dev/null || echo "0")
        if [[ $count -gt 0 ]]; then
            ((changes_made++))
            ((quote_fixes += count))
        fi
    fi

    # Fix 2: Emojis - Replace with ASCII equivalents
    # Check if file has emojis
    if grep -qP '[\x{2600}-\x{26FF}\x{2700}-\x{27BF}\x{1F300}-\x{1F5FF}\x{1F600}-\x{1F64F}\x{1F680}-\x{1F6FF}\x{1F900}-\x{1F9FF}]' "$temp_file" 2>/dev/null || \
       grep -q '✅\|✓\|❌\|📄\|👤\|🔍\|🏠\|⚠️\|⚠\|🎯\|🔧\|📝\|💡\|🚀\|🔒\|🔑\|📊\|🎉\|🐛\|⏱️\|⏱\|🕐' "$temp_file"; then

        # Count emojis before replacement
        local emoji_count=$(grep -o '✅\|✓\|❌\|📄\|👤\|🔍\|🏠\|⚠️\|⚠\|🎯\|🔧\|📝\|💡\|🚀\|🔒\|🔑\|📊\|🎉\|🐛\|⏱️\|⏱\|🕐' "$temp_file" | wc -l)

        # Replace emojis with ASCII equivalents
        sed -i 's/✅/[OK]/g' "$temp_file"
        sed -i 's/✓/[OK]/g' "$temp_file"
        sed -i 's/❌/[FAIL]/g' "$temp_file"
        sed -i 's/📄/[DOC]/g' "$temp_file"
        sed -i 's/👤/[USER]/g' "$temp_file"
        sed -i 's/🔍/[SEARCH]/g' "$temp_file"
        sed -i 's/🏠/[HOME]/g' "$temp_file"
        sed -i 's/⚠️/[WARN]/g' "$temp_file"
        sed -i 's/⚠/[WARN]/g' "$temp_file"
        sed -i 's/🎯/[TARGET]/g' "$temp_file"
        sed -i 's/🔧/[CONFIG]/g' "$temp_file"
        sed -i 's/📝/[NOTE]/g' "$temp_file"
        sed -i 's/💡/[INFO]/g' "$temp_file"
        sed -i 's/🚀/[LAUNCH]/g' "$temp_file"
        sed -i 's/🔒/[LOCK]/g' "$temp_file"
        sed -i 's/🔑/[KEY]/g' "$temp_file"
        sed -i 's/📊/[CHART]/g' "$temp_file"
        sed -i 's/🎉/[SUCCESS]/g' "$temp_file"
        sed -i 's/🐛/[BUG]/g' "$temp_file"
        sed -i 's/⏱️/[TIMER]/g' "$temp_file"
        sed -i 's/⏱/[TIMER]/g' "$temp_file"
        sed -i 's/🕐/[TIME]/g' "$temp_file"

        if [[ $emoji_count -gt 0 ]]; then
            ((changes_made++))
            ((emoji_fixes += emoji_count))
        fi
    fi

    # If changes were made, replace original file
    if [[ $changes_made -gt 0 ]]; then
        mv "$temp_file" "$file"
        ((files_fixed++))
        echo "[FIXED] $file"
        return 0
    else
        rm "$temp_file"
        return 1
    fi
}

# Fix all E2E test files
echo "Scanning for E2E test files..."
echo ""

# Use find to get all .spec.ts files in tests/e2e
while IFS= read -r file; do
    fix_file "$file"
done < <(find tests/e2e -name "*.spec.ts" -type f)

echo ""
echo "========================================"
echo "SUMMARY"
echo "========================================"
echo "Files processed: $total_files"
echo "Files fixed: $files_fixed"
echo "Mixed quote fixes: $quote_fixes"
echo "Emoji replacements: $emoji_fixes"
echo ""
echo "Done!"
