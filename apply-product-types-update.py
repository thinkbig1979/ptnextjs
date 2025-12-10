#!/usr/bin/env python3
"""Update lib/types.ts with improved Product interface and API response types"""

import os

types_file = '/home/edwin/development/ptnextjs/lib/types.ts'
updated_section_file = '/home/edwin/development/ptnextjs/lib/types-product-updated.ts'
backup_file = '/home/edwin/development/ptnextjs/lib/types.ts.backup'

# Read the original file
with open(types_file, 'r') as f:
    lines = f.readlines()

# Read the updated Product section
with open(updated_section_file, 'r') as f:
    updated_content = f.read()

# Backup original
with open(backup_file, 'w') as f:
    f.writelines(lines)

print(f"Created backup: {backup_file}")

# Extract parts:
# Part 1: Lines 1-795 (everything before Product interface)
# Part 2: Updated Product interface + API response types
# Part 3: Lines 855+ (BlogPost and everything after)

part1 = lines[:795]  # Lines 0-794 (lines 1-795 in editor)
part3 = lines[854:]  # Lines 854+ (lines 855+ in editor)

# Assemble new file
new_content = ''.join(part1) + updated_content + '\n\n' + ''.join(part3)

# Write updated file
with open(types_file, 'w') as f:
    f.write(new_content)

print(f"✓ Successfully updated {types_file}")
print("  - Updated Product interface with Payload CMS field types")
print("  - Added shortDescription and published fields")
print("  - Updated vendor, categories, tags to support Payload relationships")
print("  - Made images and features optional")
print("  - Added actionButtons (camelCase)")
print("  - Added Product API response types (7 interfaces)")
print("  - Added generic ApiErrorResponse type")
print(f"\nOriginal backed up to: {backup_file}")
