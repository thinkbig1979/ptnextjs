#!/usr/bin/env python3
"""
Fix E2E Test Syntax Errors - Batch 9
Fixes emoji encoding errors and missing BASE_URL constants
"""

import os
import re

# Change to project root
os.chdir('/home/edwin/development/ptnextjs')

# Emoji replacements
EMOJI_REPLACEMENTS = {
    '✅': '[OK]',
    '❌': '[ERROR]',
    '⚠️': '[WARNING]',
    'ℹ️': '[INFO]',
    '📍': '[STEP]',
    '📸': '[SCREENSHOT]',
    '📊': '[DATA]',
    '📋': '[FORM]',
    '👤': '[USER]',
    '📦': '[ELEMENT]',
    '✓': '[OK]',
}

def replace_emojis(content):
    """Replace all emojis with ASCII equivalents"""
    for emoji, replacement in EMOJI_REPLACEMENTS.items():
        content = content.replace(emoji, replacement)
    return content

def add_base_url(content):
    """Add BASE_URL constant after imports if not present"""
    if 'BASE_URL' in content:
        # Check if it's already defined
        if re.search(r'const\s+BASE_URL\s*=', content):
            return content  # Already has it

    # Find the import statement
    import_match = re.search(r"(import\s+{[^}]+}\s+from\s+['\"]@playwright/test['\"];?\s*\n)", content)
    if import_match:
        # Insert BASE_URL after the import
        insert_pos = import_match.end()
        base_url_line = "\nconst BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';\n"
        content = content[:insert_pos] + base_url_line + content[insert_pos:]

    return content

# Files to fix
files_to_fix = {
    'tests/e2e/location-search-verification.spec.ts': {'emojis': True, 'base_url': False},
    'tests/e2e/migration.spec.ts': {'emojis': True, 'base_url': False},
    'tests/e2e/product-integration-tab.spec.ts': {'emojis': True, 'base_url': False},
    'tests/e2e/product-review-modal-fix.spec.ts': {'emojis': True, 'base_url': False},
    'tests/e2e/product-review-submission.spec.ts': {'emojis': True, 'base_url': True},
    'tests/e2e/product-reviews-visual-check.spec.ts': {'emojis': True, 'base_url': False},
    'tests/e2e/product-tabs-simplified.spec.ts': {'emojis': False, 'base_url': True},
    'tests/e2e/promotion-pack-form.spec.ts': {'emojis': True, 'base_url': False},
}

print("Fixing E2E Test Syntax Errors - Batch 9...\n")

for filepath, fixes in files_to_fix.items():
    if not os.path.exists(filepath):
        print(f"SKIP: {filepath} not found")
        continue

    print(f"Processing: {filepath}")

    # Read file
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Apply fixes
    if fixes['emojis']:
        content = replace_emojis(content)
        print(f"  - Removed emoji characters")

    if fixes['base_url']:
        content = add_base_url(content)
        print(f"  - Added BASE_URL constant")

    # Write back if changed
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  - File updated successfully")
    else:
        print(f"  - No changes needed")

    print()

print("\n" + "="*60)
print("SUMMARY")
print("="*60)
print("\nFiles fixed:")
print("- location-search-verification.spec.ts: Emoji removal")
print("- migration.spec.ts: Emoji removal")
print("- product-integration-tab.spec.ts: Emoji removal")
print("- product-review-modal-fix.spec.ts: Emoji removal")
print("- product-review-submission.spec.ts: Emoji removal + BASE_URL added")
print("- product-reviews-visual-check.spec.ts: Emoji removal")
print("- product-tabs-simplified.spec.ts: BASE_URL added")
print("- promotion-pack-form.spec.ts: Emoji removal")
print("\nFiles with no errors (unchanged):")
print("- manual-verification.spec.ts")
print("- partner-filter-validation.spec.ts")
print("\nAll fixes complete!")
