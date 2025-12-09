#!/bin/bash
# Fix E2E Test Syntax Errors - Batch 9
# This script fixes emoji encoding errors in E2E test files

echo "Fixing E2E Test Syntax Errors - Batch 9..."

cd /home/edwin/development/ptnextjs

# Fix location-search-verification.spec.ts - Remove emojis
sed -i "s/console.log('✅ PASSED:/console.log('[PASSED]/g" tests/e2e/location-search-verification.spec.ts

# Fix migration.spec.ts - Remove emojis
sed -i "s/✅/[OK]/g" tests/e2e/migration.spec.ts
sed -i "s/⚠️/[WARNING]/g" tests/e2e/migration.spec.ts

# Fix product-integration-tab.spec.ts - Remove emojis
sed -i "s/✅/[OK]/g" tests/e2e/product-integration-tab.spec.ts
sed -i "s/⚠️/[WARNING]/g" tests/e2e/product-integration-tab.spec.ts
sed -i "s/ℹ️/[INFO]/g" tests/e2e/product-integration-tab.spec.ts
sed -i "s/📊/[DATA]/g" tests/e2e/product-integration-tab.spec.ts

# Fix product-review-modal-fix.spec.ts - Remove emojis
sed -i "s/📍/[STEP]/g" tests/e2e/product-review-modal-fix.spec.ts
sed -i "s/❌/[ERROR]/g" tests/e2e/product-review-modal-fix.spec.ts
sed -i "s/✅/[OK]/g" tests/e2e/product-review-modal-fix.spec.ts
sed -i "s/📋/[FORM]/g" tests/e2e/product-review-modal-fix.spec.ts
sed -i "s/📸/[SCREENSHOT]/g" tests/e2e/product-review-modal-fix.spec.ts

# Fix product-review-submission.spec.ts - Add missing BASE_URL and remove emojis
sed -i "3i\\const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';\n" tests/e2e/product-review-submission.spec.ts
sed -i "s/✅/[OK]/g" tests/e2e/product-review-submission.spec.ts
sed -i "s/ℹ️/[INFO]/g" tests/e2e/product-review-submission.spec.ts

# Fix product-reviews-visual-check.spec.ts - Remove emojis
sed -i "s/📍/[STEP]/g" tests/e2e/product-reviews-visual-check.spec.ts
sed -i "s/📸/[SCREENSHOT]/g" tests/e2e/product-reviews-visual-check.spec.ts
sed -i "s/📊/[DATA]/g" tests/e2e/product-reviews-visual-check.spec.ts
sed -i "s/✅/[OK]/g" tests/e2e/product-reviews-visual-check.spec.ts
sed -i "s/❌/[ERROR]/g" tests/e2e/product-reviews-visual-check.spec.ts
sed -i "s/👤/[USER]/g" tests/e2e/product-reviews-visual-check.spec.ts
sed -i "s/📦/[ELEMENT]/g" tests/e2e/product-reviews-visual-check.spec.ts

# Fix product-tabs-simplified.spec.ts - Add missing BASE_URL
sed -i "3i\\const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';\n" tests/e2e/product-tabs-simplified.spec.ts

# Fix promotion-pack-form.spec.ts - Remove emojis
sed -i "s/✓/[OK]/g" tests/e2e/promotion-pack-form.spec.ts

echo "All files fixed!"
echo ""
echo "Summary of fixes:"
echo "- location-search-verification.spec.ts: Removed emoji characters"
echo "- migration.spec.ts: Removed emoji characters"
echo "- product-integration-tab.spec.ts: Removed emoji characters"
echo "- product-review-modal-fix.spec.ts: Removed emoji characters"
echo "- product-review-submission.spec.ts: Added BASE_URL constant, removed emoji characters"
echo "- product-reviews-visual-check.spec.ts: Removed emoji characters"
echo "- product-tabs-simplified.spec.ts: Added BASE_URL constant"
echo "- promotion-pack-form.spec.ts: Removed emoji characters"
echo ""
echo "Files NOT needing fixes:"
echo "- manual-verification.spec.ts: No syntax errors found"
echo "- partner-filter-validation.spec.ts: No syntax errors found"
