#!/usr/bin/env python3
"""
Fix E2E Test Syntax Errors - Batch 5
Fixes two types of critical syntax errors:
1. Mixed quotes: template literals ending with ' instead of `
2. Emoji encoding: replaces emojis with ASCII equivalents
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
    '📝': '[NOTE]',
    '🔧': '[TOOL]',
    '💡': '[IDEA]',
    '🚀': '[ROCKET]',
    '✨': '[SPARKLE]',
}

def fix_mixed_quotes(content):
    """Fix template literals that end with single quote instead of backtick"""
    # Pattern: backtick, content with ${...}, ending with single quote
    # Example: `${BASE_URL}/path' -> `${BASE_URL}/path`
    pattern = r'`([^`]*\$\{[^}]+\}[^`\']*)\''
    fixed = re.sub(pattern, r'`\1`', content)
    return fixed

def fix_emojis(content):
    """Replace emojis with ASCII equivalents"""
    for emoji, replacement in EMOJI_MAP.items():
        content = content.replace(emoji, replacement)
    return content

def process_file(file_path):
    """Process a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            original_content = f.read()

        # Apply fixes
        fixed_content = fix_mixed_quotes(original_content)
        fixed_content = fix_emojis(fixed_content)

        # Only write if changes were made
        if fixed_content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            return True, file_path
        return False, file_path
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False, file_path

def main():
    # Change to test directory
    test_dir = '/home/edwin/development/ptnextjs/tests/e2e'
    os.chdir(test_dir)

    # Find all spec files
    spec_files = glob.glob('**/*.spec.ts', recursive=True)

    print("=== Fixing E2E Test Syntax Errors - Batch 5 ===\n")
    print(f"Found {len(spec_files)} spec files\n")

    # Count initial errors
    initial_mixed_quotes = 0
    initial_emojis = 0
    for file_path in spec_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            initial_mixed_quotes += len(re.findall(r'`[^`]*\$\{[^}]+\}[^`\']*\'', content))
            for emoji in EMOJI_MAP.keys():
                initial_emojis += content.count(emoji)
        except:
            pass

    print(f"Initial error count:")
    print(f"  - Mixed quote errors: {initial_mixed_quotes}")
    print(f"  - Emoji errors: {initial_emojis}\n")

    # Process all files
    fixed_files = []
    for file_path in spec_files:
        changed, path = process_file(file_path)
        if changed:
            fixed_files.append(path)

    # Count final errors
    final_mixed_quotes = 0
    final_emojis = 0
    for file_path in spec_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            final_mixed_quotes += len(re.findall(r'`[^`]*\$\{[^}]+\}[^`\']*\'', content))
            for emoji in EMOJI_MAP.keys():
                final_emojis += content.count(emoji)
        except:
            pass

    print(f"\nFinal error count:")
    print(f"  - Mixed quote errors: {final_mixed_quotes} (was {initial_mixed_quotes})")
    print(f"  - Emoji errors: {final_emojis} (was {initial_emojis})\n")

    print("=== Fix Complete ===\n")
    print(f"Summary:")
    print(f"  - Files modified: {len(fixed_files)}")
    print(f"  - Errors fixed: {(initial_mixed_quotes - final_mixed_quotes) + (initial_emojis - final_emojis)}")

    if fixed_files:
        print(f"\nModified files:")
        for file in sorted(fixed_files):
            print(f"  - {file}")

    if final_mixed_quotes == 0 and final_emojis == 0:
        print("\n[OK] All syntax errors fixed successfully!")
    else:
        print(f"\n[WARN] Some errors remain - please review manually")
        if final_mixed_quotes > 0:
            print(f"\nRemaining mixed quote errors in:")
            for file_path in spec_files:
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    matches = re.findall(r'`[^`]*\$\{[^}]+\}[^`\']*\'', content)
                    if matches:
                        print(f"  - {file_path}: {len(matches)} errors")
                except:
                    pass

if __name__ == '__main__':
    main()
