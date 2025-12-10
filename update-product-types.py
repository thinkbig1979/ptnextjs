#!/usr/bin/env python3
"""
Script to update Product interface and add API response types to lib/types.ts
"""

# Read the original file
with open('/home/edwin/development/ptnextjs/lib/types.ts', 'r') as f:
    lines = f.readlines()

# Read the updated Product interface
with open('/home/edwin/development/ptnextjs/lib/types-product-updated.ts', 'r') as f:
    updated_content = f.read()

# Find the start and end of the Product interface
start_line = None
end_line = None

for i, line in enumerate(lines):
    if line.strip() == 'export interface Product {':
        start_line = i
    if start_line is not None and line.strip() == '}' and i > start_line:
        # Check if next non-empty line is another interface
        for j in range(i+1, min(i+5, len(lines))):
            if lines[j].strip() and not lines[j].strip().startswith('//'):
                if 'export interface BlogPost' in lines[j]:
                    end_line = i
                    break
                break
        if end_line is not None:
            break

print(f"Found Product interface at lines {start_line + 1} to {end_line + 1}")

# Replace the Product interface and add API response types
new_lines = lines[:start_line] + [updated_content + '\n\n'] + lines[end_line+1:]

# Write the updated file
with open('/home/edwin/development/ptnextjs/lib/types.ts', 'w') as f:
    f.writelines(new_lines)

print("Successfully updated lib/types.ts")
print("- Updated Product interface with Payload CMS support")
print("- Added Product API response types")
print("- Added generic ApiErrorResponse type")
