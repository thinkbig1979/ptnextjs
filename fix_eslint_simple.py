#!/usr/bin/env python3
"""Simple ESLint fixes for dashboard components"""

import sys

def fix_dashboard_sidebar():
    """Fix: Remove unused vendorName parameter"""
    file_path = "app/(site)/vendor/dashboard/components/DashboardSidebar.tsx"
    with open(file_path, 'r') as f:
        content = f.read()

    # Simple string replacement
    content = content.replace('{ tier, vendorName }', '{ tier }')

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"✓ Fixed {file_path}")

def fix_profile_edit_tabs():
    """Fix: Remove unused TabsContent import"""
    file_path = "app/(site)/vendor/dashboard/components/ProfileEditTabs.tsx"
    with open(file_path, 'r') as f:
        content = f.read()

    # Remove TabsContent from import
    content = content.replace(', TabsContent', '')

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"✓ Fixed {file_path}")

def fix_promotion_pack_form():
    """Fix: Prefix unused isUpdating variable"""
    file_path = "app/(site)/vendor/dashboard/components/PromotionPackForm.tsx"
    with open(file_path, 'r') as f:
        content = f.read()

    # Prefix with underscore
    content = content.replace('[isUpdating, setIsUpdating]', '[_isUpdating, setIsUpdating]')
    # Update usage
    content = content.replace('disabled={!isAdmin || isUpdating}', 'disabled={!isAdmin || _isUpdating}')

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"✓ Fixed {file_path}")

def fix_brand_story_form():
    """Fix: Remove unused imports and fix entities"""
    file_path = "app/(site)/vendor/dashboard/components/BrandStoryForm.tsx"
    with open(file_path, 'r') as f:
        content = f.read()

    # Remove useFieldArray
    content = content.replace('useForm, useFieldArray', 'useForm')

    # Remove unused icons
    content = content.replace(
        'Loader2, Save, Plus, X, Link2, Calendar, Users, TrendingUp, Star, Video, Globe',
        'Save, Plus, X, Calendar, Video, Globe'
    )

    # Fix unescaped entities
    content = content.replace("We'll", "We&apos;ll")
    content = content.replace("company's", "company&apos;s")

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"✓ Fixed {file_path}")

def fix_case_studies_manager():
    """Fix: Remove unused imports and fix entities"""
    file_path = "app/(site)/vendor/dashboard/components/CaseStudiesManager.tsx"
    with open(file_path, 'r') as f:
        lines = f.readlines()

    # Remove specific import lines
    new_lines = []
    for line in lines:
        if 'import { zodResolver }' in line:
            continue
        if line.strip().startswith('import { z }') and 'zod' in line:
            continue
        # Fix entities
        line = line.replace("you've", "you&apos;ve")
        new_lines.append(line)

    with open(file_path, 'w') as f:
        f.writelines(new_lines)
    print(f"✓ Fixed {file_path}")

def fix_certifications_awards_manager():
    """Fix: Remove unused imports and fix entities"""
    file_path = "app/(site)/vendor/dashboard/components/CertificationsAwardsManager.tsx"
    with open(file_path, 'r') as f:
        content = f.read()

    # Remove useFieldArray
    content = content.replace('useForm, useFieldArray', 'useForm')

    # Remove unused icons (split into multiple replacements for safety)
    content = content.replace('Loader2, Save,', 'Save,')
    content = content.replace('FileText, X, Upload,', '')

    # Fix unescaped entities
    content = content.replace("You're", "You&apos;re")
    content = content.replace("you're", "you&apos;re")

    with open(file_path, 'w') as f:
        f.write(content)
    print(f"✓ Fixed {file_path}")

def fix_team_members_manager():
    """Fix: Remove unused imports"""
    file_path = "app/(site)/vendor/dashboard/components/TeamMembersManager.tsx"
    with open(file_path, 'r') as f:
        lines = f.readlines()

    # Remove specific import lines
    new_lines = []
    for line in lines:
        if 'import { zodResolver }' in line:
            continue
        if line.strip().startswith('import { z }') and 'zod' in line:
            continue
        new_lines.append(line)

    # Also remove unused icons
    content = ''.join(new_lines)
    content = content.replace('Upload, X, User,', 'User,')
    content = content.replace('Briefcase, Linkedin, Info', 'Linkedin')

    with open(content, 'w') as f:
        f.write(content)
    print(f"✓ Fixed {file_path}")

def fix_vendors_client():
    """Fix: Remove unused imports"""
    file_path = "app/(site)/components/vendors-client.tsx"
    with open(file_path, 'r') as f:
        lines = f.readlines()

    # Remove specific imports and clean up
    new_lines = []
    for line in lines:
        if 'parseFilterParams' in line:
            continue
        # Remove Product from type imports
        if 'Vendor, Product, VendorCoordinates' in line:
            line = line.replace('Product, ', '')
        # Remove baseUrl default param (but this is tricky in destructuring)
        new_lines.append(line)

    with open(file_path, 'w') as f:
        f.writelines(new_lines)
    print(f"✓ Fixed {file_path}")

if __name__ == '__main__':
    print("Applying ESLint fixes...\n")

    try:
        fix_dashboard_sidebar()
        fix_profile_edit_tabs()
        fix_promotion_pack_form()
        fix_brand_story_form()
        fix_case_studies_manager()
        fix_certifications_awards_manager()
        fix_team_members_manager()
        fix_vendors_client()

        print("\n✓ All fixes applied!")
        print("\nRun 'npm run lint' to verify.")

    except Exception as e:
        print(f"\n✗ Error: {e}")
        sys.exit(1)
