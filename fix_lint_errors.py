#!/usr/bin/env python3
"""
Fix ESLint errors in dashboard components
"""

import re
import os

def fix_vendors_client():
    """Fix vendors-client.tsx - remove unused imports and variables"""
    file_path = "/home/edwin/development/ptnextjs/app/(site)/components/vendors-client.tsx"

    with open(file_path, 'r') as f:
        content = f.read()

    # Remove unused imports
    content = re.sub(r'import \{ parseFilterParams \} from "@/lib/utils";\n', '', content)
    content = re.sub(r'Product, ', '', content)

    # Remove unused variables/functions
    content = re.sub(r'  const inView = true; // Always show content immediately\n\n', '', content)
    content = re.sub(r'  // Navigation functions\n  const navigateToProducts = React\.useCallback\(\n.*?\n  \);\n\n  const handleCategoryClick = React\.useCallback\(.*?\n  \}, \[\]\);\n\n', '', content, flags=re.DOTALL)

    # Remove unused baseUrl from destructuring
    content = re.sub(r'  baseUrl = "/vendors",\n', '', content)

    # Remove unused props
    content = re.sub(r'        {/\* Vendors Grid \*/}\n      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">\n        {paginatedVendors\.map\(\(vendor, index\) => \{.*?const vendorProducts = initialProducts\.filter\(\n            \(product\) =>\n              product\?\.partnerId === vendor\?\.id \|\|\n              product\?\.vendorId === vendor\?\.id,\n          \);\n          const isHighlighted', r'        {/* Vendors Grid */}\n      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">\n        {paginatedVendors.map((vendor) => {\n          const isHighlighted', content, flags=re.DOTALL)

    with open(file_path, 'w') as f:
        f.write(content)

    print(f"✓ Fixed {file_path}")

def fix_brand_story_form():
    """Fix BrandStoryForm.tsx - remove unused imports, fix unescaped entities"""
    file_path = "/home/edwin/development/ptnextjs/app/(site)/vendor/dashboard/components/BrandStoryForm.tsx"

    with open(file_path, 'r') as f:
        content = f.read()

    # Remove unused imports from react-hook-form
    content = re.sub(r'import \{ useForm, useFieldArray \}', 'import { useForm }', content)

    # Remove unused icons
    content = re.sub(
        r'import \{ Loader2, Save, Plus, X, Link2, Calendar, Users, TrendingUp, Star, Video, Globe \}',
        'import { Save, Plus, X, Calendar, Video, Globe }',
        content
    )

    # Fix unescaped entities
    content = content.replace("We'll", "We&apos;ll")
    content = content.replace("you're", "you&apos;re")
    content = content.replace("company's", "company&apos;s")

    with open(file_path, 'w') as f:
        f.write(content)

    print(f"✓ Fixed {file_path}")

def fix_case_studies_manager():
    """Fix CaseStudiesManager.tsx - remove unused imports, fix unescaped entities"""
    file_path = "/home/edwin/development/ptnextjs/app/(site)/vendor/dashboard/components/CaseStudiesManager.tsx"

    with open(file_path, 'r') as f:
        content = f.read()

    # Remove unused imports
    content = re.sub(r'import \{ zodResolver \} from .*?\n', '', content)
    content = re.sub(r'import \{ z \} from .*?\n', '', content)

    # Fix unescaped entities
    content = content.replace("you'll", "you&apos;ll")
    content = content.replace("you've", "you&apos;ve")
    content = content.replace("you're", "you&apos;re")
    content = content.replace("vendor's", "vendor&apos;s")

    with open(file_path, 'w') as f:
        f.write(content)

    print(f"✓ Fixed {file_path}")

def fix_certifications_awards_manager():
    """Fix CertificationsAwardsManager.tsx - remove unused imports, fix unescaped entities"""
    file_path = "/home/edwin/development/ptnextjs/app/(site)/vendor/dashboard/components/CertificationsAwardsManager.tsx"

    with open(file_path, 'r') as f:
        content = f.read()

    # Remove unused imports from react-hook-form (line 4)
    content = re.sub(r'import \{ useForm, useFieldArray \}', 'import { useForm }', content)

    # Remove unused icons from imports
    content = re.sub(
        r'  Loader2, Save, Plus, Edit2, Trash2, Award, Medal, Building2,\n  Calendar, Link2, FileText, X, Upload, Image as ImageIcon',
        '  Save, Plus, Edit2, Trash2, Award, Medal, Building2,\n  Calendar, Link2, Image as ImageIcon',
        content
    )

    # Fix unescaped entities
    content = content.replace("You're", "You&apos;re")
    content = content.replace("you're", "you&apos;re")
    content = content.replace("Let's", "Let&apos;s")
    content = content.replace("company's", "company&apos;s")

    with open(file_path, 'w') as f:
        f.write(content)

    print(f"✓ Fixed {file_path}")

def fix_dashboard_sidebar():
    """Fix DashboardSidebar.tsx - prefix unused param"""
    file_path = "/home/edwin/development/ptnextjs/app/(site)/vendor/dashboard/components/DashboardSidebar.tsx"

    with open(file_path, 'r') as f:
        content = f.read()

    # Prefix unused vendorName parameter with underscore
    content = re.sub(r'vendorName\?:', '_vendorName?:', content)
    content = re.sub(r'export function DashboardSidebar\(\{ tier, vendorName \}', 'export function DashboardSidebar({ tier, _vendorName }', content)

    with open(file_path, 'w') as f:
        f.write(content)

    print(f"✓ Fixed {file_path}")

def fix_profile_edit_tabs():
    """Fix ProfileEditTabs.tsx - remove unused import"""
    file_path = "/home/edwin/development/ptnextjs/app/(site)/vendor/dashboard/components/ProfileEditTabs.tsx"

    with open(file_path, 'r') as f:
        content = f.read()

    # Remove Lock import (it's used in the JSX)
    # Actually, check if it's used first
    if 'Lock' in content and '<Lock' in content:
        print(f"⚠ Lock is used in {file_path}, skipping")
        return

    content = re.sub(r'import \{ Lock \} from .*?\n', '', content)

    with open(file_path, 'w') as f:
        f.write(content)

    print(f"✓ Fixed {file_path}")

def fix_promotion_pack_form():
    """Fix PromotionPackForm.tsx - prefix unused variables"""
    file_path = "/home/edwin/development/ptnextjs/app/(site)/vendor/dashboard/components/PromotionPackForm.tsx"

    with open(file_path, 'r') as f:
        content = f.read()

    # Find and fix unused isUpdating variable
    # First check if it's actually used
    if content.count('isUpdating') > 1:
        print(f"⚠ isUpdating is used in {file_path}, skipping")
        return

    content = re.sub(r'const \[isUpdating, setIsUpdating\]', 'const [_isUpdating, setIsUpdating]', content)

    with open(file_path, 'w') as f:
        f.write(content)

    print(f"✓ Fixed {file_path}")

def fix_team_members_manager():
    """Fix TeamMembersManager.tsx - remove unused imports"""
    file_path = "/home/edwin/development/ptnextjs/app/(site)/vendor/dashboard/components/TeamMembersManager.tsx"

    with open(file_path, 'r') as f:
        content = f.read()

    # Remove unused imports
    content = re.sub(r'import \{ zodResolver \} from .*?\n', '', content)
    content = re.sub(r'import \{ z \} from .*?\n', '', content)

    # Remove unused icons
    content = re.sub(
        r'  Loader2, Save, Plus, Edit2, Trash2, GripVertical, Mail,\n  Upload, X, User, Briefcase, Linkedin, Info',
        '  Loader2, Save, Plus, Edit2, Trash2, GripVertical, Mail,\n  User, Linkedin',
        content
    )

    with open(file_path, 'w') as f:
        f.write(content)

    print(f"✓ Fixed {file_path}")

if __name__ == '__main__':
    print("Fixing ESLint errors in dashboard components...")
    print("")

    try:
        fix_vendors_client()
    except Exception as e:
        print(f"✗ Error fixing vendors-client.tsx: {e}")

    try:
        fix_brand_story_form()
    except Exception as e:
        print(f"✗ Error fixing BrandStoryForm.tsx: {e}")

    try:
        fix_case_studies_manager()
    except Exception as e:
        print(f"✗ Error fixing CaseStudiesManager.tsx: {e}")

    try:
        fix_certifications_awards_manager()
    except Exception as e:
        print(f"✗ Error fixing CertificationsAwardsManager.tsx: {e}")

    try:
        fix_dashboard_sidebar()
    except Exception as e:
        print(f"✗ Error fixing DashboardSidebar.tsx: {e}")

    try:
        fix_profile_edit_tabs()
    except Exception as e:
        print(f"✗ Error fixing ProfileEditTabs.tsx: {e}")

    try:
        fix_promotion_pack_form()
    except Exception as e:
        print(f"✗ Error fixing PromotionPackForm.tsx: {e}")

    try:
        fix_team_members_manager()
    except Exception as e:
        print(f"✗ Error fixing TeamMembersManager.tsx: {e}")

    print("")
    print("✓ All fixes applied! Run 'npm run lint' to verify.")
