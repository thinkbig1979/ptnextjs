const fs = require('fs');
const path = require('path');

function fixFile(filePath, replacements) {
  const fullPath = path.join(__dirname, filePath);
  console.log(`Fixing: ${filePath}`);

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let changed = false;

    for (const [from, to] of replacements) {
      if (content.includes(from)) {
        content = content.replaceAll(from, to);
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`  ✓ Fixed`);
    } else {
      console.log(`  - No changes needed`);
    }
  } catch (err) {
    console.error(`  ✗ Error: ${err.message}`);
  }
}

console.log('Applying ESLint fixes...\n');

// 1. DashboardSidebar.tsx
fixFile('app/(site)/vendor/dashboard/components/DashboardSidebar.tsx', [
  ['{ tier, vendorName }', '{ tier }']
]);

// 2. ProfileEditTabs.tsx
fixFile('app/(site)/vendor/dashboard/components/ProfileEditTabs.tsx', [
  ['TabsList, TabsTrigger, TabsContent', 'TabsList, TabsTrigger']
]);

// 3. PromotionPackForm.tsx
fixFile('app/(site)/vendor/dashboard/components/PromotionPackForm.tsx', [
  ['[isUpdating, setIsUpdating]', '[_isUpdating, setIsUpdating]'],
  ['disabled={!isAdmin || isUpdating}', 'disabled={!isAdmin || _isUpdating}']
]);

// 4. BrandStoryForm.tsx
fixFile('app/(site)/vendor/dashboard/components/BrandStoryForm.tsx', [
  ['useForm, useFieldArray', 'useForm'],
  ['Loader2, Save, Plus, X, Link2, Calendar, Users, TrendingUp, Star, Video, Globe', 'Save, Plus, X, Calendar, Video, Globe'],
  ["We'll", "We&apos;ll"],
  ["company's", "company&apos;s"]
]);

// 5. CaseStudiesManager.tsx
fixFile('app/(site)/vendor/dashboard/components/CaseStudiesManager.tsx', [
  ["import { zodResolver } from '@hookform/resolvers/zod';\n", ''],
  ["import { z } from 'zod';\n", ''],
  ["you've", "you&apos;ve"]
]);

// 6. CertificationsAwardsManager.tsx
fixFile('app/(site)/vendor/dashboard/components/CertificationsAwardsManager.tsx', [
  ['useForm, useFieldArray', 'useForm'],
  ['Loader2, ', ''],
  ['FileText, X, Upload, ', ''],
  ["You're", "You&apos;re"],
  ["you're", "you&apos;re"]
]);

// 7. TeamMembersManager.tsx
fixFile('app/(site)/vendor/dashboard/components/TeamMembersManager.tsx', [
  ["import { zodResolver } from '@hookform/resolvers/zod';\n", ''],
  ["import { z } from 'zod';\n", ''],
  ['Upload, X, ', ''],
  ['Briefcase, ', ''],
  ['Linkedin, Info', 'Linkedin']
]);

// 8. vendors-client.tsx
fixFile('app/(site)/components/vendors-client.tsx', [
  ['import { parseFilterParams } from "@/lib/utils";\n', ''],
  ['Vendor, Product, VendorCoordinates', 'Vendor, VendorCoordinates'],
  ['  baseUrl = "/vendors",\n', '']
]);

console.log('\n✓ All fixes applied!\n');
console.log('Run "npm run lint" to verify.');
