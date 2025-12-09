#!/usr/bin/env python3
"""
Fix E2E Test Syntax Errors - Batch 11
Fixes mixed quotes and emoji encoding
"""

import re
from pathlib import Path

# Base directory
TEST_DIR = Path("/home/edwin/development/ptnextjs/tests/e2e")

# Files to fix
FILES = [
    "vendor-map-detailed-test.spec.ts",
    "vendor-map-tiles-test.spec.ts",
    "vendor-map-verification.spec.ts",
    "vendor-profile-tiers.spec.ts",
    "vendor-registration-integration.spec.ts",
    "vendor-review-display.spec.ts",
    "vendor-search-ux.spec.ts",
    "vendor-search-visual-check.spec.ts",
    "vendor-tier-security.spec.ts",
]

# Emoji replacements
EMOJI_MAP = {
    "✅": "[OK]",
    "✓": "[OK]",
    "❌": "[FAIL]",
    "📄": "[DOC]",
    "👤": "[USER]",
    "🔍": "[SEARCH]",
    "⚠️": "[WARN]",
    "⚠": "[WARN]",
}

def fix_mixed_quotes(content):
    """Fix template literals ending with ' instead of `"""
    # Pattern: `${BASE_URL}/path' -> `${BASE_URL}/path`
    # Match backtick followed by ${...} and ending with single quote
    pattern = r'`\$\{BASE_URL\}([^`\']*)\''
    replacement = r'`${BASE_URL}\1`'
    fixed = re.sub(pattern, replacement, content)

    # Count fixes
    matches = len(re.findall(pattern, content))
    return fixed, matches

def fix_emojis(content):
    """Replace emojis with ASCII equivalents"""
    count = 0
    for emoji, replacement in EMOJI_MAP.items():
        occurrences = content.count(emoji)
        if occurrences > 0:
            content = content.replace(emoji, replacement)
            count += occurrences
    return content, count

def main():
    print("Fixing Batch 11 E2E test syntax errors...")
    print()

    total_quote_fixes = 0
    total_emoji_fixes = 0
    fixed_files = []

    for filename in FILES:
        filepath = TEST_DIR / filename

        if not filepath.exists():
            print(f"❌ File not found: {filename}")
            continue

        # Read file
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Fix mixed quotes
        content, quote_fixes = fix_mixed_quotes(content)

        # Fix emojis
        content, emoji_fixes = fix_emojis(content)

        # Write back if changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

            fixed_files.append(filename)
            total_quote_fixes += quote_fixes
            total_emoji_fixes += emoji_fixes

            print(f"✓ {filename}")
            if quote_fixes > 0:
                print(f"  - Fixed {quote_fixes} mixed quote(s)")
            if emoji_fixes > 0:
                print(f"  - Fixed {emoji_fixes} emoji(s)")
        else:
            print(f"- {filename} (no changes needed)")

    print()
    print("=" * 50)
    print("Summary:")
    print(f"  Files processed: {len(FILES)}")
    print(f"  Files fixed: {len(fixed_files)}")
    print(f"  Mixed quotes fixed: {total_quote_fixes}")
    print(f"  Emojis fixed: {total_emoji_fixes}")
    print("=" * 50)

if __name__ == "__main__":
    main()
