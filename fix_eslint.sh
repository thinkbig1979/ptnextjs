#!/bin/bash

# Fix ESLint errors in dashboard components

# File 1: vendors-client.tsx - Remove unused imports
sed -i '8d' /home/edwin/development/ptnextjs/app/\(site\)/components/vendors-client.tsx
sed -i 's/import { Vendor, Product, VendorCoordinates }/import { Vendor, VendorCoordinates }/' /home/edwin/development/ptnextjs/app/\(site\)/components/vendors-client.tsx

# File 2: BrandStoryForm.tsx - Remove unused imports
sed -i 's/import { useForm, useFieldArray }/import { useForm }/' /home/edwin/development/ptnextjs/app/\(site\)/vendor/dashboard/components/BrandStoryForm.tsx
sed -i 's/import { Loader2, Save, Plus, X, Link2, Calendar, Users, TrendingUp, Star, Video, Globe }/import { Save, Plus, X, Calendar, Video, Globe }/' /home/edwin/development/ptnextjs/app/\(site\)/vendor/dashboard/components/BrandStoryForm.tsx

# Fix unescaped entities in BrandStoryForm.tsx
sed -i "s/We'll/We\&#39;ll/g" /home/edwin/development/ptnextjs/app/\(site\)/vendor/dashboard/components/BrandStoryForm.tsx
sed -i "s/you're/you\&#39;re/g" /home/edwin/development/ptnextjs/app/\(site\)/vendor/dashboard/components/BrandStoryForm.tsx

# File 3: Case StudiesManager.tsx - Remove unused imports
sed -i 's/import { zodResolver }//' /home/edwin/development/ptnextjs/app/\(site\)/vendor/dashboard/components/CaseStudiesManager.tsx
sed -i 's/import { z } from .zod.;//' /home/edwin/development/ptnextjs/app/\(site\)/vendor/dashboard/components/CaseStudiesManager.tsx

# Fix unescaped entities in CaseStudiesManager.tsx
sed -i "s/you'll/you\&#39;ll/g" /home/edwin/development/ptnextjs/app/\(site\)/vendor/dashboard/components/CaseStudiesManager.tsx
sed -i "s/you've/you\&#39;ve/g" /home/edwin/development/ptnextjs/app/\(site\)/vendor/dashboard/components/CaseStudiesManager.tsx

# File 4: CertificationsAwardsManager.tsx - Remove unused imports
sed -i 's/import { useForm, useFieldArray }/import { useForm }/' /home/edwin/development/ptnextjs/app/\(site\)/vendor/dashboard/components/CertificationsAwardsManager.tsx

# Fix unescaped entities in CertificationsAwardsManager.tsx
sed -i "s/You're/You\&#39;re/g" /home/edwin/development/ptnextjs/app/\(site\)/vendor/dashboard/components/CertificationsAwardsManager.tsx
sed -i "s/you're/you\&#39;re/g" /home/edwin/development/ptnextjs/app/\(site\)/vendor/dashboard/components/CertificationsAwardsManager.tsx

# File 5: DashboardSidebar.tsx - Prefix unused param with underscore
sed -i 's/vendorName\?:/\_vendorName\?:/' /home/edwin/development/ptnextjs/app/\(site\)/vendor/dashboard/components/DashboardSidebar.tsx

# File 6: ProfileEditTabs.tsx - Remove unused import
sed -i '/import { Lock }/d' /home/edwin/development/ptnextjs/app/\(site\)/vendor/dashboard/components/ProfileEditTabs.tsx

# File 7: PromotionPackForm.tsx - Remove unused variables
sed -i 's/const \[isUpdating, setIsUpdating\]/const \[\_, setIsUpdating\]/' /home/edwin/development/ptnextjs/app/\(site\)/vendor/dashboard/components/PromotionPackForm.tsx

# File 8: TeamMembersManager.tsx - Remove unused imports
sed -i 's/import { zodResolver }//' /home/edwin/development/ptnextjs/app/\(site\)/vendor/dashboard/components/TeamMembersManager.tsx
sed -i 's/import { z } from .zod.;//' /home/edwin/development/ptnextjs/app/\(site\)/vendor/dashboard/components/TeamMembersManager.tsx

echo "ESLint fixes applied!"
