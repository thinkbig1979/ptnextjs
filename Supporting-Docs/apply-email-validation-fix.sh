#!/bin/bash

# Script to apply email validation fix for test domains
# This fixes the issue where Payload CMS rejects @test.com emails in E2E tests

echo "Applying email validation fix for test domains..."

# Fix 1: Add custom validate function to contactEmail in Vendors collection
echo "Fix 1: Adding custom email validation to Vendors.ts..."

# Create backup
cp /home/edwin/development/ptnextjs/payload/collections/Vendors.ts /home/edwin/development/ptnextjs/payload/collections/Vendors.ts.backup

# Use sed to add the validate function
# Find the contactEmail field and add validate function before the closing brace
sed -i '/name: '\''contactEmail'\''/,/},/{
  /admin: {/,/},/{
    /},/{
      a\      validate: (value) => {\
        // Basic email format check\
        if (!value || typeof value !== '\''string'\'') {\
          return '\''Email is required'\'';\
        }\
\
        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\
        if (!emailRegex.test(value)) {\
          return '\''Must be a valid email address'\'';\
        }\
\
        // In test/development, allow test domains\
        const isTestEnv = process.env.NODE_ENV === '\''test'\'' || process.env.NODE_ENV === '\''development'\'';\
        const testDomains = ['\''@test.com'\'', '\''@example.com'\'', '\''@localhost'\''];\
        const isTestEmail = testDomains.some(domain => value.endsWith(domain));\
\
        if (!isTestEnv && isTestEmail) {\
          return '\''Test email domains are not allowed in production'\'';\
        }\
\
        return true; // Valid\
      },
    }
  }
}' /home/edwin/development/ptnextjs/payload/collections/Vendors.ts

echo "Fix 1 complete!"

# Fix 2: Add overrideAccess to seed API
echo "Fix 2: Adding overrideAccess to seed API..."

# Create backup
cp /home/edwin/development/ptnextjs/app/api/test/vendors/seed/route.ts /home/edwin/development/ptnextjs/app/api/test/vendors/seed/route.ts.backup

# Add overrideAccess to user creation
sed -i '/const createdUser = await payload\.create({/,/});/{
  s/});/  overrideAccess: true, \/\/ Bypass access control for test seeding\n        });/
}' /home/edwin/development/ptnextjs/app/api/test/vendors/seed/route.ts

# Add overrideAccess to vendor creation
sed -i '/const createdVendor = await payload\.create({/,/});/{
  s/locations: locations\.length > 0 ? locations : undefined,/locations: locations.length > 0 ? locations : undefined,\n          overrideAccess: true, \/\/ Bypass access control for test seeding/
}' /home/edwin/development/ptnextjs/app/api/test/vendors/seed/route.ts

echo "Fix 2 complete!"

echo ""
echo "Email validation fix applied successfully!"
echo ""
echo "Backups created:"
echo "  - /home/edwin/development/ptnextjs/payload/collections/Vendors.ts.backup"
echo "  - /home/edwin/development/ptnextjs/app/api/test/vendors/seed/route.ts.backup"
echo ""
echo "To test the fix:"
echo "  npm run test:e2e -- --grep 'seed'"
