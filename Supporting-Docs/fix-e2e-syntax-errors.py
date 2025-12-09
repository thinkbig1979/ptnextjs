#!/usr/bin/env python3
"""
Fix E2E Test Syntax Errors

This script fixes two types of critical syntax errors in E2E test files:
1. Mixed quote errors: Template literals ending with single quote instead of backtick
2. Emoji encoding errors: Emojis in console.log or template literals

Usage:
    python fix-e2e-syntax-errors.py
"""

import os
import re
import glob
from pathlib import Path

# Emoji replacement map
EMOJI_MAP = {
    '✅': '[OK]',
    '✓': '[OK]',
    '❌': '[FAIL]',
    '📄': '[DOC]',
    '👤': '[USER]',
    '🔍': '[SEARCH]',
    '🏠': '[HOME]',
    '⚠️': '[WARN]',
    '⚠': '[WARN]',
    '🎯': '[TARGET]',
    '🔧': '[CONFIG]',
    '📝': '[NOTE]',
    '💡': '[INFO]',
    '🚀': '[LAUNCH]',
    '🔒': '[LOCK]',
    '🔑': '[KEY]',
    '📊': '[CHART]',
    '🎉': '[SUCCESS]',
    '🐛': '[BUG]',
    '⏱️': '[TIMER]',
    '⏱': '[TIMER]',
    '🕐': '[TIME]',
}

def fix_mixed_quotes(content):
    """Fix template literals that end with single quote instead of backtick."""
    # Pattern: backtick followed by anything, ending with single quote instead of backtick
    # This pattern looks for `...stuff...' and replaces with `...stuff...`
    pattern = r'`([^`]*?)\'(?=\s*[;\)\],])'
    fixed = re.sub(pattern, r'`\1`', content)

    # Count how many fixes were made
    original_matches = len(re.findall(pattern, content))

    return fixed, original_matches

def fix_emojis(content):
    """Replace emojis with ASCII equivalents."""
    fixed = content
    emoji_count = 0

    for emoji, replacement in EMOJI_MAP.items():
        if emoji in fixed:
            count = fixed.count(emoji)
            fixed = fixed.replace(emoji, replacement)
            emoji_count += count

    # Also remove any other remaining emojis (Unicode range for emojis)
    # This is a comprehensive emoji pattern
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"  # emoticons
        "\U0001F300-\U0001F5FF"  # symbols & pictographs
        "\U0001F680-\U0001F6FF"  # transport & map symbols
        "\U0001F1E0-\U0001F1FF"  # flags (iOS)
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "\U0001F900-\U0001F9FF"  # Supplemental Symbols and Pictographs
        "\U0001FA00-\U0001FA6F"  # Chess Symbols
        "\U00002600-\U000026FF"  # Miscellaneous Symbols
        "]+",
        flags=re.UNICODE
    )

    additional_emojis = len(emoji_pattern.findall(fixed))
    fixed = emoji_pattern.sub('', fixed)
    emoji_count += additional_emojis

    return fixed, emoji_count

def process_file(file_path):
    """Process a single file and fix syntax errors."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Fix mixed quotes
        content, quote_fixes = fix_mixed_quotes(content)

        # Fix emojis
        content, emoji_fixes = fix_emojis(content)

        # Only write if changes were made
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True, quote_fixes, emoji_fixes

        return False, 0, 0

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False, 0, 0

def main():
    """Main function to process all E2E test files."""
    # Get the project root directory
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    tests_dir = project_root / 'tests' / 'e2e'

    print(f"Searching for E2E test files in: {tests_dir}")

    # Find all .spec.ts files
    test_files = list(tests_dir.rglob('*.spec.ts'))

    print(f"Found {len(test_files)} test files\n")

    total_files_fixed = 0
    total_quote_fixes = 0
    total_emoji_fixes = 0

    fixed_files = []

    for test_file in sorted(test_files):
        modified, quote_fixes, emoji_fixes = process_file(test_file)

        if modified:
            total_files_fixed += 1
            total_quote_fixes += quote_fixes
            total_emoji_fixes += emoji_fixes

            relative_path = test_file.relative_to(project_root)
            fixed_files.append({
                'path': str(relative_path),
                'quotes': quote_fixes,
                'emojis': emoji_fixes
            })

            print(f"[FIXED] {relative_path}")
            if quote_fixes > 0:
                print(f"  - Fixed {quote_fixes} mixed quote error(s)")
            if emoji_fixes > 0:
                print(f"  - Replaced {emoji_fixes} emoji(s)")

    print(f"\n{'='*60}")
    print(f"SUMMARY")
    print(f"{'='*60}")
    print(f"Files processed: {len(test_files)}")
    print(f"Files fixed: {total_files_fixed}")
    print(f"Total mixed quote fixes: {total_quote_fixes}")
    print(f"Total emoji replacements: {total_emoji_fixes}")

    if fixed_files:
        print(f"\n{'='*60}")
        print(f"DETAILED CHANGES")
        print(f"{'='*60}")
        for file_info in fixed_files:
            print(f"\n{file_info['path']}")
            if file_info['quotes'] > 0:
                print(f"  Quotes: {file_info['quotes']} fixes")
            if file_info['emojis'] > 0:
                print(f"  Emojis: {file_info['emojis']} replacements")

if __name__ == '__main__':
    main()
