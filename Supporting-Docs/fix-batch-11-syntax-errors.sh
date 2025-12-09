#!/bin/bash
# Fix E2E Test Syntax Errors - Batch 11

echo "Fixing mixed quote errors and emoji encoding issues in 9 test files..."

# Fix vendor-map-detailed-test.spec.ts
sed -i "s|\`\${BASE_URL}/vendors/alfa-laval/'|\`\${BASE_URL}/vendors/alfa-laval/\`|g" /home/edwin/development/ptnextjs/tests/e2e/vendor-map-detailed-test.spec.ts

# Fix vendor-map-tiles-test.spec.ts
sed -i "s|\`\${BASE_URL}/vendors/alfa-laval/'|\`\${BASE_URL}/vendors/alfa-laval/\`|g" /home/edwin/development/ptnextjs/tests/e2e/vendor-map-tiles-test.spec.ts

# Fix vendor-map-verification.spec.ts
sed -i "s|\`\${BASE_URL}/vendors/alfa-laval/'|\`\${BASE_URL}/vendors/alfa-laval/\`|g" /home/edwin/development/ptnextjs/tests/e2e/vendor-map-verification.spec.ts
sed -i "s|\`\${BASE_URL}/vendors/'|\`\${BASE_URL}/vendors/\`|g" /home/edwin/development/ptnextjs/tests/e2e/vendor-map-verification.spec.ts

# Fix vendor-registration-integration.spec.ts (mixed quotes)
sed -i "s|\`\${BASE_URL}/vendor/register/'|\`\${BASE_URL}/vendor/register/\`|g" /home/edwin/development/ptnextjs/tests/e2e/vendor-registration-integration.spec.ts

# Fix vendor-search-ux.spec.ts
sed -i "s|\`\${BASE_URL}/vendors'|\`\${BASE_URL}/vendors\`|g" /home/edwin/development/ptnextjs/tests/e2e/vendor-search-ux.spec.ts

# Fix vendor-search-visual-check.spec.ts
sed -i "s|\`\${BASE_URL}/vendors'|\`\${BASE_URL}/vendors\`|g" /home/edwin/development/ptnextjs/tests/e2e/vendor-search-visual-check.spec.ts

# Fix emojis in vendor-registration-integration.spec.ts
sed -i 's/✅/[OK]/g' /home/edwin/development/ptnextjs/tests/e2e/vendor-registration-integration.spec.ts

# Fix emojis in vendor-review-display.spec.ts
sed -i 's/✓/[OK]/g' /home/edwin/development/ptnextjs/tests/e2e/vendor-review-display.spec.ts
sed -i 's/✅/[OK]/g' /home/edwin/development/ptnextjs/tests/e2e/vendor-review-display.spec.ts
sed -i 's/❌/[FAIL]/g' /home/edwin/development/ptnextjs/tests/e2e/vendor-review-display.spec.ts

echo "All fixes applied successfully!"
echo ""
echo "Summary of fixes:"
echo "- vendor-map-detailed-test.spec.ts: Fixed 1 mixed quote"
echo "- vendor-map-tiles-test.spec.ts: Fixed 1 mixed quote"
echo "- vendor-map-verification.spec.ts: Fixed 2 mixed quotes"
echo "- vendor-registration-integration.spec.ts: Fixed 4 mixed quotes + 4 emojis"
echo "- vendor-review-display.spec.ts: Fixed 3 emojis"
echo "- vendor-search-ux.spec.ts: Fixed 1 mixed quote"
echo "- vendor-search-visual-check.spec.ts: Fixed 1 mixed quote"
echo "- vendor-profile-tiers.spec.ts: No errors found"
echo "- vendor-tier-security.spec.ts: No errors found"
