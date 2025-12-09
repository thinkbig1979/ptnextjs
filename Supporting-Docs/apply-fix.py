#!/usr/bin/env python3
"""
Apply email validation fix for test vendor seeding
"""

import re
import shutil
from pathlib import Path

def fix_vendors_ts():
    """Add custom email validation to Vendors.ts contactEmail field"""
    file_path = Path('/home/edwin/development/ptnextjs/payload/collections/Vendors.ts')

    # Create backup
    backup_path = file_path.with_suffix('.ts.backup')
    shutil.copy(file_path, backup_path)
    print(f"Created backup: {backup_path}")

    # Read file
    content = file_path.read_text()

    # Find and replace contactEmail field
    # Pattern matches the entire contactEmail field object
    pattern = r"(\{\s*\n\s*name: 'contactEmail',\s*\n\s*type: 'email',\s*\n\s*required: true,\s*\n\s*admin: \{\s*\n\s*description: 'Contact email address',\s*\n\s*\},\s*\n\s*\},)"

    replacement = """{
      name: 'contactEmail',
      type: 'email',
      required: true,
      admin: {
        description: 'Contact email address',
      },
      validate: (value) => {
        // Basic email format check
        if (!value || typeof value !== 'string') {
          return 'Email is required';
        }

        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Must be a valid email address';
        }

        // In test/development, allow test domains
        const isTestEnv = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';
        const testDomains = ['@test.com', '@example.com', '@localhost'];
        const isTestEmail = testDomains.some(domain => value.endsWith(domain));

        if (!isTestEnv && isTestEmail) {
          return 'Test email domains are not allowed in production';
        }

        return true; // Valid
      },
    },"""

    # Try to replace
    new_content = re.sub(pattern, replacement, content)

    if new_content == content:
        print("Warning: Pattern not found, trying simpler approach...")
        # Simpler approach: find the closing brace after admin description
        pattern2 = r"(name: 'contactEmail',\s*\n\s*type: 'email',\s*\n\s*required: true,\s*\n\s*admin: \{\s*\n\s*description: 'Contact email address',\s*\n\s*\},)"

        replacement2 = """name: 'contactEmail',
      type: 'email',
      required: true,
      admin: {
        description: 'Contact email address',
      },
      validate: (value) => {
        // Basic email format check
        if (!value || typeof value !== 'string') {
          return 'Email is required';
        }

        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        if (!emailRegex.test(value)) {
          return 'Must be a valid email address';
        }

        // In test/development, allow test domains
        const isTestEnv = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';
        const testDomains = ['@test.com', '@example.com', '@localhost'];
        const isTestEmail = testDomains.some(domain => value.endsWith(domain));

        if (!isTestEnv && isTestEmail) {
          return 'Test email domains are not allowed in production';
        }

        return true; // Valid
      },"""

        new_content = re.sub(pattern2, replacement2, content)

        if new_content == content:
            print("Error: Could not find contactEmail field to patch")
            return False

    # Write back
    file_path.write_text(new_content)
    print(f"✓ Fixed {file_path}")
    return True

def fix_seed_route():
    """Add overrideAccess to seed API"""
    file_path = Path('/home/edwin/development/ptnextjs/app/api/test/vendors/seed/route.ts')

    # Create backup
    backup_path = file_path.with_suffix('.ts.backup')
    shutil.copy(file_path, backup_path)
    print(f"Created backup: {backup_path}")

    # Read file
    content = file_path.read_text()

    # Fix 1: Add overrideAccess to user creation
    pattern1 = r"(const createdUser = await payload\.create\(\{\s*\n\s*collection: 'users',\s*\n\s*data: \{[^}]+\},\s*\n\s*)\}\)"

    replacement1 = r"\1overrideAccess: true, // Bypass access control for test seeding\n        })"

    new_content = re.sub(pattern1, replacement1, content)

    # Fix 2: Add overrideAccess to vendor creation
    pattern2 = r"(const createdVendor = await payload\.create\(\{\s*\n\s*collection: 'vendors',\s*\n\s*data: \{[^}]+locations: locations\.length > 0 \? locations : undefined,\s*\n\s*\},\s*\n\s*)\}\)"

    replacement2 = r"\1overrideAccess: true, // Bypass access control for test seeding\n        })"

    new_content = re.sub(pattern2, replacement2, new_content)

    if new_content == content:
        print("Warning: Could not find patterns to patch in seed route")
        return False

    # Write back
    file_path.write_text(new_content)
    print(f"✓ Fixed {file_path}")
    return True

def main():
    print("=== Applying Email Validation Fix ===\n")

    success = True

    # Apply fixes
    if not fix_vendors_ts():
        success = False
        print("✗ Failed to fix Vendors.ts")

    if not fix_seed_route():
        success = False
        print("✗ Failed to fix seed route")

    if success:
        print("\n=== All fixes applied successfully! ===")
        print("\nTo test:")
        print("  npm run test:e2e -- --grep 'seed'")
    else:
        print("\n=== Some fixes failed ===")
        print("See Supporting-Docs/email-validation-fix.md for manual instructions")

    return success

if __name__ == '__main__':
    import sys
    sys.exit(0 if main() else 1)
