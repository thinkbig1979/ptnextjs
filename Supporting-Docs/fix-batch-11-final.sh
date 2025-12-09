#!/bin/bash
# Fix E2E Test Syntax Errors - Batch 11
# Fixes mixed quotes (template literals ending with ') and emojis

cd /home/edwin/development/ptnextjs/tests/e2e

echo "Fixing Batch 11 E2E test syntax errors..."
echo ""

# Create backup
echo "Creating backups..."
for file in vendor-map-detailed-test.spec.ts vendor-map-tiles-test.spec.ts vendor-map-verification.spec.ts vendor-registration-integration.spec.ts vendor-review-display.spec.ts vendor-search-ux.spec.ts vendor-search-visual-check.spec.ts; do
  cp "$file" "$file.bak"
done

# Fix mixed quotes: Change `${BASE_URL}/path' to `${BASE_URL}/path`
echo "Fixing mixed quote errors..."

# vendor-map-detailed-test.spec.ts
perl -pi -e "s/\`\\\$\{BASE_URL\}\/vendors\/alfa-laval\/'/\`\\\$\{BASE_URL\}\/vendors\/alfa-laval\/\`/g" vendor-map-detailed-test.spec.ts

# vendor-map-tiles-test.spec.ts
perl -pi -e "s/\`\\\$\{BASE_URL\}\/vendors\/alfa-laval\/'/\`\\\$\{BASE_URL\}\/vendors\/alfa-laval\/\`/g" vendor-map-tiles-test.spec.ts

# vendor-map-verification.spec.ts
perl -pi -e "s/\`\\\$\{BASE_URL\}\/vendors\/alfa-laval\/'/\`\\\$\{BASE_URL\}\/vendors\/alfa-laval\/\`/g" vendor-map-verification.spec.ts
perl -pi -e "s/\`\\\$\{BASE_URL\}\/vendors\/'/\`\\\$\{BASE_URL\}\/vendors\/\`/g" vendor-map-verification.spec.ts

# vendor-registration-integration.spec.ts
perl -pi -e "s/\`\\\$\{BASE_URL\}\/vendor\/register\/'/\`\\\$\{BASE_URL\}\/vendor\/register\/\`/g" vendor-registration-integration.spec.ts

# vendor-search-ux.spec.ts
perl -pi -e "s/\`\\\$\{BASE_URL\}\/vendors'/\`\\\$\{BASE_URL\}\/vendors\`/g" vendor-search-ux.spec.ts

# vendor-search-visual-check.spec.ts
perl -pi -e "s/\`\\\$\{BASE_URL\}\/vendors'/\`\\\$\{BASE_URL\}\/vendors\`/g" vendor-search-visual-check.spec.ts

echo "Fixing emoji encoding..."

# vendor-registration-integration.spec.ts
sed -i 's/✅/[OK]/g' vendor-registration-integration.spec.ts

# vendor-review-display.spec.ts
sed -i 's/✓/[OK]/g' vendor-review-display.spec.ts
sed -i 's/✅/[OK]/g' vendor-review-display.spec.ts
sed -i 's/❌/[FAIL]/g' vendor-review-display.spec.ts

echo ""
echo "======================================"
echo "Summary:"
echo "- vendor-map-detailed-test.spec.ts: 1 mixed quote"
echo "- vendor-map-tiles-test.spec.ts: 1 mixed quote"
echo "- vendor-map-verification.spec.ts: 2 mixed quotes"
echo "- vendor-profile-tiers.spec.ts: No errors"
echo "- vendor-registration-integration.spec.ts: 4 mixed quotes + 5 emojis"
echo "- vendor-review-display.spec.ts: 3 emojis"
echo "- vendor-search-ux.spec.ts: 1 mixed quote"
echo "- vendor-search-visual-check.spec.ts: 3 mixed quotes"
echo "- vendor-tier-security.spec.ts: No errors"
echo ""
echo "Total fixes: 12 mixed quotes + 8 emojis"
echo "======================================"
echo ""
echo "Backup files created with .bak extension"
echo "Run 'rm *.bak' to remove backups after verification"
