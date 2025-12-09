#!/bin/bash
#
# Apply Phase 3: Vendor Seeding Fixes
#
# This script applies the fixes identified in phase-3-seed-fixes.md
#

set -e  # Exit on any error

echo "=================================================="
echo "  APPLYING PHASE 3: VENDOR SEEDING FIXES"
echo "=================================================="
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

echo "[1/3] Backing up original files..."
cp "$REPO_ROOT/tests/e2e/global-setup.ts" "$REPO_ROOT/tests/e2e/global-setup.ts.backup"
cp "$REPO_ROOT/app/api/test/vendors/seed/route.ts" "$REPO_ROOT/app/api/test/vendors/seed/route.ts.backup"
echo "  ✓ Backups created"
echo ""

echo "[2/3] Applying fixes..."
cp "$SCRIPT_DIR/global-setup-fixed.ts" "$REPO_ROOT/tests/e2e/global-setup.ts"
cp "$SCRIPT_DIR/seed-route-fixed.ts" "$REPO_ROOT/app/api/test/vendors/seed/route.ts"
echo "  ✓ Files updated"
echo ""

echo "[3/3] Verifying changes..."
if grep -q "slug: 'testvendor-tier1'" "$REPO_ROOT/tests/e2e/global-setup.ts"; then
  echo "  ✓ global-setup.ts: Explicit slugs added"
else
  echo "  ✗ global-setup.ts: Verification failed"
  exit 1
fi

if grep -q "slug?: string; // Optional" "$REPO_ROOT/app/api/test/vendors/seed/route.ts"; then
  echo "  ✓ seed/route.ts: Optional slug parameter added"
else
  echo "  ✗ seed/route.ts: Verification failed"
  exit 1
fi
echo ""

echo "=================================================="
echo "  FIXES APPLIED SUCCESSFULLY!"
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. Clear your test database:"
echo "   rm -f $REPO_ROOT/payload.db"
echo ""
echo "2. Start the dev server:"
echo "   cd $REPO_ROOT"
echo "   DISABLE_EMAILS=true npm run dev"
echo ""
echo "3. Run a test to verify:"
echo "   npx playwright test tests/e2e/computed-fields.spec.ts"
echo ""
echo "Backups saved as:"
echo "  - tests/e2e/global-setup.ts.backup"
echo "  - app/api/test/vendors/seed/route.ts.backup"
echo ""
