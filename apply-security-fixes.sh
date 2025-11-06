#!/bin/bash
# Script to apply HIGH priority security fixes for tier-upgrade system

echo "Applying security enhancements..."

# 1. Replace middleware.ts with security headers
echo "1. Updating middleware.ts with security headers..."
mv /home/edwin/development/ptnextjs/middleware-new.ts /home/edwin/development/ptnextjs/middleware.ts

# 2. Update API endpoints with rate limiting
echo "2. Applying rate limiting to API endpoints..."
mv /home/edwin/development/ptnextjs/app/api/portal/vendors/[id]/tier-upgrade-request/route-new.ts \
   /home/edwin/development/ptnextjs/app/api/portal/vendors/[id]/tier-upgrade-request/route.ts

mv /home/edwin/development/ptnextjs/app/api/portal/vendors/[id]/tier-upgrade-request/[requestId]/route-new.ts \
   /home/edwin/development/ptnextjs/app/api/portal/vendors/[id]/tier-upgrade-request/[requestId]/route.ts

mv /home/edwin/development/ptnextjs/app/api/admin/tier-upgrade-requests/route-new.ts \
   /home/edwin/development/ptnextjs/app/api/admin/tier-upgrade-requests/route.ts

mv /home/edwin/development/ptnextjs/app/api/admin/tier-upgrade-requests/[id]/approve/route-new.ts \
   /home/edwin/development/ptnextjs/app/api/admin/tier-upgrade-requests/[id]/approve/route.ts

mv /home/edwin/development/ptnextjs/app/api/admin/tier-upgrade-requests/[id]/reject/route-new.ts \
   /home/edwin/development/ptnextjs/app/api/admin/tier-upgrade-requests/[id]/reject/route.ts

# 3. Update TierUpgradeRequestService with vendorNotes minimum length validation
echo "3. Updating TierUpgradeRequestService with vendorNotes minimum length validation..."
sed -i '157,160s/.*/  \/\/ Vendor notes validation (minimum and maximum length)\
  if (request.vendorNotes) {\
    const trimmedNotes = request.vendorNotes.trim();\
    if (trimmedNotes.length > 0 \&\& trimmedNotes.length < 20) {\
      errors.push('\''Vendor notes must be at least 20 characters when provided'\'');\
    }\
    if (request.vendorNotes.length > 500) {\
      errors.push('\''Vendor notes must not exceed 500 characters'\'');\
    }\
  }/' /home/edwin/development/ptnextjs/lib/services/TierUpgradeRequestService.ts

echo "Security enhancements applied successfully!"
echo ""
echo "Summary of changes:"
echo "- Added CSP and security headers to all API routes via middleware"
echo "- Applied rate limiting (10 req/min) to tier-upgrade API endpoints"
echo "- Added minimum length validation (10 chars) for rejection reason"
echo "- Added minimum length validation (20 chars) for vendor notes"
