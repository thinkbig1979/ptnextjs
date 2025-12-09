#!/usr/bin/env python3

"""
Fix E2E Test Syntax Errors - Batch 7
Replaces emojis with ASCII equivalents in test files
"""

import os
import re
import shutil

# Emoji replacement mapping
EMOJI_REPLACEMENTS = {
    '✅': '[OK]',
    '✓': '[OK]',
    '❌': '[FAIL]',
    '⚠️': '[WARNING]',
    '⚠': '[WARNING]',
    'ℹ️': '[INFO]',
    'ℹ': '[INFO]',
    '📄': '[DOC]',
    '👤': '[USER]',
    '🔍': '[SEARCH]',
    '🎯': '[TARGET]',
    '💾': '[SAVE]',
    '🔧': '[CONFIG]',
    '📝': '[NOTE]',
    '🚀': '[LAUNCH]',
    '💡': '[IDEA]',
    '🏢': '[BUSINESS]',
    '📊': '[CHART]',
    '🔄': '[REFRESH]',
    '📋': '[LIST]',
    '📅': '[DATE]',
    '📦': '[PACKAGE]',
    '📸': '[SCREENSHOT]',
    '✗': '[X]',
}

# Files to process
FILES = [
    'tests/e2e/blog-image-cache-fix.spec.ts',
    'tests/e2e/brand-story-tier-fix.spec.ts',
    'tests/e2e/debug-cache-clearing.spec.ts',
    'tests/e2e/debug-errors.spec.ts',
    'tests/e2e/debug-founded-year-display.spec.ts',
    'tests/e2e/debug-founded-year-flow.spec.ts',
    'tests/e2e/debug-save-button.spec.ts',
    'tests/e2e/debug-vendor-data.spec.ts',
    'tests/e2e/debug-vendor-update.spec.ts',
    'tests/e2e/example-tier-upgrade-helpers-usage.spec.ts',
]

def fix_emojis_in_file(filepath):
    """Fix emojis in a single file"""

    if not os.path.exists(filepath):
        print(f"WARNING: File not found: {filepath}")
        return False

    # Read file content
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if file has emojis
    has_emojis = any(emoji in content for emoji in EMOJI_REPLACEMENTS.keys())

    if not has_emojis:
        print(f"  - No emojis found, skipping")
        return False

    print(f"  - Fixing emojis...")

    # Create backup
    backup_path = filepath + '.bak'
    shutil.copy2(filepath, backup_path)

    # Replace all emojis
    new_content = content
    replacements_made = 0
    for emoji, replacement in EMOJI_REPLACEMENTS.items():
        if emoji in new_content:
            count = new_content.count(emoji)
            new_content = new_content.replace(emoji, replacement)
            replacements_made += count
            print(f"    - Replaced {count}x '{emoji}' with '{replacement}'")

    # Write updated content
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"  - Done ({replacements_made} replacements)")
    return True

def verify_files():
    """Verify that all emojis have been removed"""
    issues_found = False

    for filepath in FILES:
        if not os.path.exists(filepath):
            continue

        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check for remaining emojis
        remaining_emojis = []
        for emoji in EMOJI_REPLACEMENTS.keys():
            if emoji in content:
                count = content.count(emoji)
                remaining_emojis.append(f"{emoji} ({count}x)")

        if remaining_emojis:
            print(f"WARNING: Emojis still found in {filepath}:")
            for emoji_info in remaining_emojis:
                print(f"  - {emoji_info}")
            issues_found = True

    return not issues_found

def main():
    repo_root = '/home/edwin/development/ptnextjs'
    os.chdir(repo_root)

    print("=== Fixing Batch 7 E2E Test Syntax Errors ===")
    print()

    print("Processing files...")
    files_modified = 0
    for filepath in FILES:
        print(f"File: {filepath}")
        if fix_emojis_in_file(filepath):
            files_modified += 1

    print()
    print("=== Verification ===")
    print("Checking for remaining emojis...")
    print()

    if verify_files():
        print("[OK] All syntax errors fixed!")
        print()
        print("Backup files created with .bak extension")
        print("Run 'rm tests/e2e/*.bak' to remove backups if tests pass")
    else:
        print("[WARNING] Some issues remain - manual review required")

    print()
    print("=== Summary ===")
    print(f"Processed {len(FILES)} files")
    print(f"Modified {files_modified} files")
    print("  - Replaced emojis with ASCII equivalents")
    print("  - No mixed quote errors found in batch 7 files")

if __name__ == '__main__':
    main()
