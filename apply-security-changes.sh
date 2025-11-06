#!/bin/bash
set -e

cd /home/edwin/development/ptnextjs

echo "=========================================="
echo "Applying Security Enhancements"
echo "=========================================="
echo ""

# Create backups
echo "1. Creating backups..."
if [ -f middleware.ts ]; then
  cp middleware.ts middleware.ts.backup
  echo "   ✓ middleware.ts backed up"
fi

if [ -f lib/services/TierUpgradeRequestService.ts ]; then
  cp lib/services/TierUpgradeRequestService.ts lib/services/TierUpgradeRequestService.ts.backup
  echo "   ✓ TierUpgradeRequestService.ts backed up"
fi

echo ""
echo "2. Applying changes..."

# Middleware with security headers
if [ -f middleware-new.ts ]; then
  mv middleware-new.ts middleware.ts
  echo "   ✓ middleware.ts updated with CSP headers"
else
  echo "   ✗ middleware-new.ts not found!"
  exit 1
fi

# Service layer validation
if [ -f lib/services/TierUpgradeRequestService-new.ts ]; then
  mv lib/services/TierUpgradeRequestService-new.ts lib/services/TierUpgradeRequestService.ts
  echo "   ✓ TierUpgradeRequestService.ts updated with input validation"
else
  echo "   ✗ TierUpgradeRequestService-new.ts not found!"
  exit 1
fi

# API routes
echo ""
echo "3. Updating API routes with rate limiting..."

if [ -f "app/api/portal/vendors/[id]/tier-upgrade-request/route-new.ts" ]; then
  mv "app/api/portal/vendors/[id]/tier-upgrade-request/route-new.ts" \
     "app/api/portal/vendors/[id]/tier-upgrade-request/route.ts"
  echo "   ✓ Vendor POST endpoint updated"
fi

if [ -f "app/api/portal/vendors/[id]/tier-upgrade-request/[requestId]/route-new.ts" ]; then
  mv "app/api/portal/vendors/[id]/tier-upgrade-request/[requestId]/route-new.ts" \
     "app/api/portal/vendors/[id]/tier-upgrade-request/[requestId]/route.ts"
  echo "   ✓ Vendor DELETE endpoint updated"
fi

if [ -f "app/api/admin/tier-upgrade-requests/route-new.ts" ]; then
  mv "app/api/admin/tier-upgrade-requests/route-new.ts" \
     "app/api/admin/tier-upgrade-requests/route.ts"
  echo "   ✓ Admin GET endpoint updated"
fi

if [ -f "app/api/admin/tier-upgrade-requests/[id]/approve/route-new.ts" ]; then
  mv "app/api/admin/tier-upgrade-requests/[id]/approve/route-new.ts" \
     "app/api/admin/tier-upgrade-requests/[id]/approve/route.ts"
  echo "   ✓ Admin approve endpoint updated"
fi

if [ -f "app/api/admin/tier-upgrade-requests/[id]/reject/route-new.ts" ]; then
  mv "app/api/admin/tier-upgrade-requests/[id]/reject/route-new.ts" \
     "app/api/admin/tier-upgrade-requests/[id]/reject/route.ts"
  echo "   ✓ Admin reject endpoint updated"
fi

echo ""
echo "=========================================="
echo "Security Enhancements Applied!"
echo "=========================================="
echo ""
echo "Changes:"
echo "  • CSP headers on all API routes"
echo "  • Rate limiting (10 req/min) on tier-upgrade endpoints"
echo "  • Minimum length validation (10 chars for rejection, 20 for notes)"
echo ""
echo "Next steps:"
echo "  1. npm run type-check    # Verify TypeScript"
echo "  2. npm run build         # Test build"
echo "  3. npm run test:e2e      # Run E2E tests"
echo ""
