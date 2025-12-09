#!/bin/bash

# Fix E2E Test Syntax Errors - Batch 5
# This script fixes two types of critical syntax errors:
# 1. Mixed quotes: template literals ending with ' instead of `
# 2. Emoji encoding: replaces emojis with ASCII equivalents

set -e

echo "=== Fixing E2E Test Syntax Errors - Batch 5 ==="
echo ""

cd /home/edwin/development/ptnextjs/tests/e2e

# Fix mixed quote errors (template literal with single quote at end)
echo "Step 1: Fixing mixed quote errors..."
echo "--------------------------------------"

FILES_WITH_MIXED_QUOTES=(
  "tier-downgrade-request-workflow.spec.ts"
  "certifications-awards-manager.spec.ts"
  "location-filter-debug.spec.ts"
  "vendor-featured-sorting.spec.ts"
  "admin-panel.spec.ts"
  "vendor-map-tiles-test.spec.ts"
  "vendor-search-ux.spec.ts"
  "debug-form-submission.spec.ts"
  "product-review-submission.spec.ts"
  "vendor-map-verification.spec.ts"
  "location-search-nantes.spec.ts"
  "comprehensive-form-save-test.spec.ts"
  "verify-featured-priority.spec.ts"
  "logout-functionality.spec.ts"
  "vendor-search-visual-check.spec.ts"
  "simple-form-test.spec.ts"
  "verify-data-mapping.spec.ts"
  "debug-vendor-products.spec.ts"
  "tier-restriction-flow.spec.ts"
  "vendor-dashboard-flow.spec.ts"
  "vendor-featured-visual.spec.ts"
  "product-description-rendering.spec.ts"
  "verify-form-save.spec.ts"
  "vendor-map-detailed-test.spec.ts"
  "product-tabs-simplified.spec.ts"
  "multi-location-test.spec.ts"
  "vendor-registration-integration.spec.ts"
  "bug-fixes-verification.spec.ts"
  "admin-approval-flow.spec.ts"
)

for file in "${FILES_WITH_MIXED_QUOTES[@]}"; do
  if [ -f "$file" ]; then
    echo "  Fixing: $file"
    # Fix pattern: `${BASE_URL}/path' -> `${BASE_URL}/path`
    sed -i "s/\`\${BASE_URL}\/\([^']*\)'/\`\${BASE_URL}\/\1\`/g" "$file"
    # Fix pattern: `${BASE_URL}' -> `${BASE_URL}`
    sed -i "s/\`\${BASE_URL}'/\`\${BASE_URL}\`/g" "$file"
    # Fix any other template literal with mixed quotes
    sed -i "s/\`\([^\`]*\${[^}]*}[^']*\)'/\`\1\`/g" "$file"
  else
    echo "  Skipping: $file (not found)"
  fi
done

echo ""
echo "Step 2: Fixing emoji encoding errors..."
echo "---------------------------------------"

FILES_WITH_EMOJIS=(
  "vendor-review-submission.spec.ts"
  "blog-image-cache-fix.spec.ts"
  "vendor-dashboard.spec.ts"
  "debug-founded-year-flow.spec.ts"
  "vendor-card-listing.spec.ts"
  "verify-single-form.spec.ts"
  "dual-auth-system.spec.ts"
  "brand-story-tier-fix.spec.ts"
  "tier-restriction-flow.spec.ts"
  "verify-product-reviews-display.spec.ts"
  "vendor-registration-integration.spec.ts"
  "vendor-review-display.spec.ts"
  "verify-data-mapping.spec.ts"
  "verify-form-save.spec.ts"
  "verify-free-tier-product-restrictions.spec.ts"
  "verify-integration-seeded-data.spec.ts"
  "verify-product-reviews-full-display.spec.ts"
  "verify-vendor-category.spec.ts"
  "debug-form-submission.spec.ts"
  "debug-founded-year-display.spec.ts"
  "debug-products-page.spec.ts"
  "debug-vendor-products.spec.ts"
  "location-filter-debug.spec.ts"
  "location-search-verification.spec.ts"
  "migration.spec.ts"
  "multi-location-test.spec.ts"
  "product-integration-tab.spec.ts"
  "product-review-modal-fix.spec.ts"
  "product-review-submission.spec.ts"
  "product-reviews-visual-check.spec.ts"
  "promotion-pack-form.spec.ts"
  "tier-downgrade-request-workflow.spec.ts"
  "vendor-dashboard-flow.spec.ts"
  "admin-approval-flow.spec.ts"
  "comprehensive-form-save-test.spec.ts"
  "tier-upgrade-request/happy-path.spec.ts"
  "vendor-onboarding/12-e2e-happy-path.spec.ts"
)

for file in "${FILES_WITH_EMOJIS[@]}"; do
  if [ -f "$file" ]; then
    echo "  Fixing: $file"
    # Replace emojis with ASCII equivalents
    sed -i 's/✅/[OK]/g' "$file"
    sed -i 's/✓/[OK]/g' "$file"
    sed -i 's/❌/[FAIL]/g' "$file"
    sed -i 's/📄/[DOC]/g' "$file"
    sed -i 's/👤/[USER]/g' "$file"
    sed -i 's/🔍/[SEARCH]/g' "$file"
    sed -i 's/🏠/[HOME]/g' "$file"
    sed -i 's/⚠/[WARN]/g' "$file"
    sed -i 's/⚠️/[WARN]/g' "$file"
    sed -i 's/🎯/[TARGET]/g' "$file"
    sed -i 's/📝/[NOTE]/g' "$file"
    sed -i 's/🔧/[TOOL]/g' "$file"
    sed -i 's/💡/[IDEA]/g' "$file"
    sed -i 's/🚀/[ROCKET]/g' "$file"
    sed -i 's/✨/[SPARKLE]/g' "$file"
  else
    echo "  Skipping: $file (not found)"
  fi
done

echo ""
echo "Step 3: Verification..."
echo "-----------------------"

# Check if any mixed quotes remain
echo "Checking for remaining mixed quote errors..."
REMAINING_MIXED=$(grep -rn '`${BASE_URL}[^`]*'"'" --include="*.spec.ts" . 2>/dev/null | wc -l)
echo "  Remaining mixed quote errors: $REMAINING_MIXED"

# Check if any emojis remain
echo "Checking for remaining emoji errors..."
REMAINING_EMOJIS=$(grep -rn '[✅✓❌📄👤🔍🏠⚠]' --include="*.spec.ts" . 2>/dev/null | wc -l)
echo "  Remaining emoji errors: $REMAINING_EMOJIS"

echo ""
echo "=== Fix Complete ==="
echo ""
echo "Summary:"
echo "  - Mixed quote errors fixed in ${#FILES_WITH_MIXED_QUOTES[@]} files"
echo "  - Emoji errors fixed in ${#FILES_WITH_EMOJIS[@]} files"
echo "  - Remaining mixed quote errors: $REMAINING_MIXED"
echo "  - Remaining emoji errors: $REMAINING_EMOJIS"
echo ""

if [ $REMAINING_MIXED -eq 0 ] && [ $REMAINING_EMOJIS -eq 0 ]; then
  echo "[OK] All syntax errors fixed successfully!"
  exit 0
else
  echo "[WARN] Some errors may remain. Please review the output above."
  exit 0
fi
