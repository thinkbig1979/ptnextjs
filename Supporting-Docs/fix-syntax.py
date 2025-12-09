#!/usr/bin/env python3
import re
import sys
from pathlib import Path

def fix_file(filepath):
    """Fix syntax errors in a single file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original = content
        changes = []

        # Fix 1: Mixed quotes - `...stuff...' -> `...stuff...`
        # This regex finds backtick, then any characters except backtick, then single quote
        pattern = r'`([^`]*?)\''
        matches = list(re.finditer(pattern, content))
        if matches:
            content = re.sub(pattern, r'`\1`', content)
            changes.append(f"Fixed {len(matches)} mixed quote error(s)")

        # Fix 2: Replace emojis
        emoji_map = {
            '✅': '[OK]',
            '✓': '[OK]',
            '❌': '[FAIL]',
            '📄': '[DOC]',
            '👤': '[USER]',
            '🔍': '[SEARCH]',
            '🏠': '[HOME]',
            '⚠️': '[WARN]',
            '⚠': '[WARN]',
        }

        emoji_count = 0
        for emoji, replacement in emoji_map.items():
            count = content.count(emoji)
            if count > 0:
                content = content.replace(emoji, replacement)
                emoji_count += count

        if emoji_count > 0:
            changes.append(f"Replaced {emoji_count} emoji(s)")

        # Write if changes were made
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True, changes

        return False, []

    except Exception as e:
        print(f"ERROR processing {filepath}: {e}", file=sys.stderr)
        return False, []

def main():
    project_root = Path(__file__).parent.parent
    tests_dir = project_root / 'tests' / 'e2e'

    files_fixed = 0
    total_files = 0

    print("Fixing E2E test syntax errors...")
    print()

    for test_file in sorted(tests_dir.rglob('*.spec.ts')):
        total_files += 1
        fixed, changes = fix_file(test_file)

        if fixed:
            files_fixed += 1
            rel_path = test_file.relative_to(project_root)
            print(f"[FIXED] {rel_path}")
            for change in changes:
                print(f"  - {change}")

    print()
    print(f"Summary: Fixed {files_fixed} of {total_files} files")

if __name__ == '__main__':
    main()
