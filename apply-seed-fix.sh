#!/bin/bash
# Apply the seed API fix

cd /home/edwin/development/ptnextjs

echo "Applying seed API fix..."
cp seed-route-fixed.ts app/api/test/vendors/seed/route.ts

echo "✓ Seed API fixed!"
echo ""
echo "Next steps:"
echo "1. Run the dev server: npm run dev"
echo "2. Test the fix: npm run test:e2e -- tests/e2e/vendor-onboarding/03-authentication.spec.ts"
