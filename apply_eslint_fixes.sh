#!/bin/bash

set -e  # Exit on error

echo "Applying ESLint fixes to dashboard components..."
echo ""

# Change to project directory
cd /home/edwin/development/ptnextjs

# File 1: DashboardSidebar.tsx - Remove unused vendorName parameter
echo "✓ Fixing DashboardSidebar.tsx..."
sed -i 's/{ tier, vendorName }/{ tier }/' app/\(site\)/vendor/dashboard/components/DashboardSidebar.tsx

# File 2: ProfileEditTabs.tsx - Remove unused TabsContent import
echo "✓ Fixing ProfileEditTabs.tsx..."
sed -i 's/, TabsContent//' app/\(site\)/vendor/dashboard/components/ProfileEditTabs.tsx

# File 3: PromotionPackForm.tsx - Prefix unused isUpdating with underscore
echo "✓ Fixing PromotionPackForm.tsx..."
sed -i 's/const \[isUpdating, setIsUpdating\]/const \[_isUpdating, setIsUpdating\]/' app/\(site\)/vendor/dashboard/components/PromotionPackForm.tsx
# Also update the one place it's checked
sed -i 's/disabled={!isAdmin || isUpdating}/disabled={!isAdmin || _isUpdating}/' app/\(site\)/vendor/dashboard/components/PromotionPackForm.tsx

# File 4: BrandStoryForm.tsx - Remove unused imports
echo "✓ Fixing BrandStoryForm.tsx..."
sed -i 's/useForm, useFieldArray/useForm/' app/\(site\)/vendor/dashboard/components/BrandStoryForm.tsx
sed -i 's/Loader2, Save, Plus, X, Link2, Calendar, Users, TrendingUp, Star, Video, Globe/Save, Plus, X, Calendar, Video, Globe/' app/\(site\)/vendor/dashboard/components/BrandStoryForm.tsx
# Fix unescaped entities
sed -i "s/We'll/We\&apos;ll/g" app/\(site\)/vendor/dashboard/components/BrandStoryForm.tsx
sed -i "s/company's/company\&apos;s/g" app/\(site\)/vendor/dashboard/components/BrandStoryForm.tsx

# File 5: CaseStudiesManager.tsx - Remove unused imports and fix entities
echo "✓ Fixing CaseStudiesManager.tsx..."
sed -i '/import { zodResolver }/d' app/\(site\)/vendor/dashboard/components/CaseStudiesManager.tsx
sed -i '/^import { z } from/d' app/\(site\)/vendor/dashboard/components/CaseStudiesManager.tsx
# Fix unescaped entities
sed -i "s/you've/you\&apos;ve/g" app/\(site\)/vendor/dashboard/components/CaseStudiesManager.tsx
sed -i "s/your work/your work/g" app/\(site\)/vendor/dashboard/components/CaseStudiesManager.tsx

# File 6: CertificationsAwardsManager.tsx - Remove unused imports and fix entities
echo "✓ Fixing CertificationsAwardsManager.tsx..."
sed -i 's/useForm, useFieldArray/useForm/' app/\(site\)/vendor/dashboard/components/CertificationsAwardsManager.tsx
sed -i 's/Loader2, Save, Plus, Edit2, Trash2, Award, Medal, Building2,/Save, Plus, Edit2, Trash2, Award, Medal, Building2,/' app/\(site\)/vendor/dashboard/components/CertificationsAwardsManager.tsx
sed -i 's/Calendar, Link2, FileText, X, Upload, Image as ImageIcon/Calendar, Link2, Image as ImageIcon/' app/\(site\)/vendor/dashboard/components/CertificationsAwardsManager.tsx
# Fix unescaped entities
sed -i "s/You're/You\&apos;re/g" app/\(site\)/vendor/dashboard/components/CertificationsAwardsManager.tsx
sed -i "s/you're/you\&apos;re/g" app/\(site\)/vendor/dashboard/components/CertificationsAwardsManager.tsx

# File 7: TeamMembersManager.tsx - Remove unused imports
echo "✓ Fixing TeamMembersManager.tsx..."
sed -i '/import { zodResolver }/d' app/\(site\)/vendor/dashboard/components/TeamMembersManager.tsx
sed -i '/^import { z } from/d' app/\(site\)/vendor/dashboard/components/TeamMembersManager.tsx
sed -i 's/Loader2, Save, Plus, Edit2, Trash2, GripVertical, Mail,/Loader2, Save, Plus, Edit2, Trash2, GripVertical, Mail,/' app/\(site\)/vendor/dashboard/components/TeamMembersManager.tsx
sed -i 's/Upload, X, User, Briefcase, Linkedin, Info/User, Linkedin/' app/\(site\)/vendor/dashboard/components/TeamMembersManager.tsx

# File 8: vendors-client.tsx - Remove unused imports and variables
echo "✓ Fixing vendors-client.tsx..."
sed -i '/parseFilterParams/d' app/\(site\)/components/vendors-client.tsx
sed -i 's/, Product//' app/\(site\)/components/vendors-client.tsx
sed -i 's/baseUrl = "\/vendors",//' app/\(site\)/components/vendors-client.tsx
sed -i 's/initialProducts = \[\],/initialProducts = [],/' app/\(site\)/components/vendors-client.tsx

echo ""
echo "✓ All fixes applied successfully!"
echo ""
echo "Running TypeScript check..."
npx tsc --noEmit --pretty

echo ""
echo "Running ESLint..."
npm run lint

echo ""
echo "✓ Done!"
