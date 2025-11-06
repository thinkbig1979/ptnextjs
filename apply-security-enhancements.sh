#!/bin/bash
set -e

echo "=========================================="
echo "Security Enhancements for Tier Upgrade System"
echo "=========================================="
echo ""

# Backup original files
echo "Creating backups..."
cp /home/edwin/development/ptnextjs/middleware.ts /home/edwin/development/ptnextjs/middleware.ts.backup
cp /home/edwin/development/ptnextjs/lib/services/TierUpgradeRequestService.ts /home/edwin/development/ptnextjs/lib/services/TierUpgradeRequestService.ts.backup

# Apply changes
echo "1. Applying CSP and security headers to middleware..."
mv /home/edwin/development/ptnextjs/middleware-new.ts /home/edwin/development/ptnextjs/middleware.ts

echo "2. Applying rate limiting to vendor portal endpoints..."
mv /home/edwin/development/ptnextjs/app/api/portal/vendors/[id]/tier-upgrade-request/route-new.ts \
   /home/edwin/development/ptnextjs/app/api/portal/vendors/[id]/tier-upgrade-request/route.ts

mv /home/edwin/development/ptnextjs/app/api/portal/vendors/[id]/tier-upgrade-request/[requestId]/route-new.ts \
   /home/edwin/development/ptnextjs/app/api/portal/vendors/[id]/tier-upgrade-request/[requestId]/route.ts

echo "3. Applying rate limiting to admin endpoints..."
mv /home/edwin/development/ptnextjs/app/api/admin/tier-upgrade-requests/route-new.ts \
   /home/edwin/development/ptnextjs/app/api/admin/tier-upgrade-requests/route.ts

mv /home/edwin/development/ptnextjs/app/api/admin/tier-upgrade-requests/[id]/approve/route-new.ts \
   /home/edwin/development/ptnextjs/app/api/admin/tier-upgrade-requests/[id]/approve/route.ts

mv /home/edwin/development/ptnextjs/app/api/admin/tier-upgrade-requests/[id]/reject/route-new.ts \
   /home/edwin/development/ptnextjs/app/api/admin/tier-upgrade-requests/[id]/reject/route.ts

echo "4. Updating TierUpgradeRequestService with input validation..."
mv /home/edwin/development/ptnextjs/lib/services/TierUpgradeRequestService-new.ts \
   /home/edwin/development/ptnextjs/lib/services/TierUpgradeRequestService.ts

echo ""
echo "=========================================="
echo "Security Enhancements Applied Successfully!"
echo "=========================================="
echo ""
echo "Summary of Changes:"
echo "-------------------"
echo "✓ CSP Headers: Added Content-Security-Policy to all API routes"
echo "✓ Security Headers: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection"
echo "✓ Rate Limiting: 10 requests/minute per IP on tier-upgrade endpoints"
echo "✓ Input Validation: Minimum 10 chars for rejection reason"
echo "✓ Input Validation: Minimum 20 chars for vendor notes (when provided)"
echo ""
echo "Next Steps:"
echo "-----------"
echo "1. Run TypeScript compilation: npm run type-check"
echo "2. Run build to verify: npm run build"
echo "3. Test rate limiting with multiple requests"
echo "4. Verify security headers in API responses"
echo ""
echo "Backups created:"
echo "- middleware.ts.backup"
echo "- TierUpgradeRequestService.ts.backup"
