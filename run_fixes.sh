#!/bin/bash
cd /home/edwin/development/ptnextjs

# 1. DashboardSidebar.tsx - Remove unused vendorName
echo "Fix 1/8: DashboardSidebar.tsx"
sed -i "s/{ tier, vendorName }/{ tier }/g" "app/(site)/vendor/dashboard/components/DashboardSidebar.tsx"

# 2. ProfileEditTabs.tsx - Remove unused TabsContent
echo "Fix 2/8: ProfileEditTabs.tsx"
sed -i "s/TabsList, TabsTrigger, TabsContent/TabsList, TabsTrigger/g" "app/(site)/vendor/dashboard/components/ProfileEditTabs.tsx"

# 3. PromotionPackForm.tsx - Prefix unused isUpdating
echo "Fix 3/8: PromotionPackForm.tsx"
sed -i "s/\[isUpdating, setIsUpdating\]/[_isUpdating, setIsUpdating]/g" "app/(site)/vendor/dashboard/components/PromotionPackForm.tsx"
sed -i "s/disabled={!isAdmin || isUpdating}/disabled={!isAdmin || _isUpdating}/g" "app/(site)/vendor/dashboard/components/PromotionPackForm.tsx"

# 4. BrandStoryForm.tsx - Remove unused imports
echo "Fix 4/8: BrandStoryForm.tsx"
sed -i "s/useForm, useFieldArray/useForm/g" "app/(site)/vendor/dashboard/components/BrandStoryForm.tsx"
sed -i "s/Loader2, Save, Plus, X, Link2, Calendar, Users, TrendingUp, Star, Video, Globe/Save, Plus, X, Calendar, Video, Globe/g" "app/(site)/vendor/dashboard/components/BrandStoryForm.tsx"
# Fix unescaped entities
sed -i "s/We'll/We\&apos;ll/g" "app/(site)/vendor/dashboard/components/BrandStoryForm.tsx"
sed -i "s/company's/company\&apos;s/g" "app/(site)/vendor/dashboard/components/BrandStoryForm.tsx"

# 5. CaseStudiesManager.tsx - Remove unused imports
echo "Fix 5/8: CaseStudiesManager.tsx"
sed -i "/import { zodResolver } from '@hookform\/resolvers\/zod';/d" "app/(site)/vendor/dashboard/components/CaseStudiesManager.tsx"
sed -i "/import { z } from 'zod';/d" "app/(site)/vendor/dashboard/components/CaseStudiesManager.tsx"
# Fix unescaped entities
sed -i "s/you've/you\&apos;ve/g" "app/(site)/vendor/dashboard/components/CaseStudiesManager.tsx"

# 6. CertificationsAwardsManager.tsx - Remove unused imports
echo "Fix 6/8: CertificationsAwardsManager.tsx"
sed -i "s/useForm, useFieldArray/useForm/g" "app/(site)/vendor/dashboard/components/CertificationsAwardsManager.tsx"
sed -i "s/Loader2, //" "app/(site)/vendor/dashboard/components/CertificationsAwardsManager.tsx"
sed -i "s/FileText, X, Upload, //" "app/(site)/vendor/dashboard/components/CertificationsAwardsManager.tsx"
# Fix unescaped entities
sed -i "s/You're/You\&apos;re/g" "app/(site)/vendor/dashboard/components/CertificationsAwardsManager.tsx"
sed -i "s/you're/you\&apos;re/g" "app/(site)/vendor/dashboard/components/CertificationsAwardsManager.tsx"

# 7. TeamMembersManager.tsx - Remove unused imports
echo "Fix 7/8: TeamMembersManager.tsx"
sed -i "/import { zodResolver } from '@hookform\/resolvers\/zod';/d" "app/(site)/vendor/dashboard/components/TeamMembersManager.tsx"
sed -i "/import { z } from 'zod';/d" "app/(site)/vendor/dashboard/components/TeamMembersManager.tsx"
sed -i "s/Upload, X, //" "app/(site)/vendor/dashboard/components/TeamMembersManager.tsx"
sed -i "s/Briefcase, //" "app/(site)/vendor/dashboard/components/TeamMembersManager.tsx"
sed -i "s/Info//" "app/(site)/vendor/dashboard/components/TeamMembersManager.tsx"

# 8. vendors-client.tsx - Remove unused imports
echo "Fix 8/8: vendors-client.tsx"
sed -i "/import { parseFilterParams } from \"@\/lib\/utils\";/d" "app/(site)/components/vendors-client.tsx"
sed -i "s/Vendor, Product, VendorCoordinates/Vendor, VendorCoordinates/g" "app/(site)/components/vendors-client.tsx"
sed -i "s/  baseUrl = \"\/vendors\",//" "app/(site)/components/vendors-client.tsx"

echo ""
echo "All fixes applied! Running lint..."
npm run lint
