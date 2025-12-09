#!/bin/bash
# Fix E2E Test Syntax Errors - Batch 11 (Targeted - 9 files only)

cd /home/edwin/development/ptnextjs/tests/e2e

echo "Fixing Batch 11 files..."
echo ""

# File 1: vendor-map-detailed-test.spec.ts - 1 mixed quote
echo "1. vendor-map-detailed-test.spec.ts"
sed -i "28s|'\$|}\`|" vendor-map-detailed-test.spec.ts
echo "   - Fixed 1 mixed quote on line 28"

# File 2: vendor-map-tiles-test.spec.ts - 1 mixed quote
echo "2. vendor-map-tiles-test.spec.ts"
sed -i "6s|'\$|}\`|" vendor-map-tiles-test.spec.ts
echo "   - Fixed 1 mixed quote on line 6"

# File 3: vendor-map-verification.spec.ts - 2 mixed quotes
echo "3. vendor-map-verification.spec.ts"
sed -i "20s|'\$|}\`|" vendor-map-verification.spec.ts
sed -i "116s|'\$|}\`|" vendor-map-verification.spec.ts
echo "   - Fixed 2 mixed quotes on lines 20, 116"

# File 4: vendor-profile-tiers.spec.ts - no errors
echo "4. vendor-profile-tiers.spec.ts"
echo "   - No syntax errors found"

# File 5: vendor-registration-integration.spec.ts - 4 mixed quotes + 5 emojis
echo "5. vendor-registration-integration.spec.ts"
sed -i "23s|'\$|}\`|" vendor-registration-integration.spec.ts
sed -i "92s|'\$|}\`|" vendor-registration-integration.spec.ts
sed -i "108s|'\$|}\`|" vendor-registration-integration.spec.ts
sed -i "137s|'\$|}\`|" vendor-registration-integration.spec.ts
sed -i 's/✅/[OK]/g' vendor-registration-integration.spec.ts
echo "   - Fixed 4 mixed quotes on lines 23, 92, 108, 137"
echo "   - Fixed 5 emojis"

# File 6: vendor-review-display.spec.ts - 3 emojis
echo "6. vendor-review-display.spec.ts"
sed -i 's/✓/[OK]/g' vendor-review-display.spec.ts
sed -i 's/✅/[OK]/g' vendor-review-display.spec.ts
sed -i 's/❌/[FAIL]/g' vendor-review-display.spec.ts
echo "   - Fixed 3 emojis"

# File 7: vendor-search-ux.spec.ts - 1 mixed quote
echo "7. vendor-search-ux.spec.ts"
sed -i "5s|')|}\`)|" vendor-search-ux.spec.ts
echo "   - Fixed 1 mixed quote on line 5"

# File 8: vendor-search-visual-check.spec.ts - 3 mixed quotes
echo "8. vendor-search-visual-check.spec.ts"
sed -i "4s|')|}\`)|" vendor-search-visual-check.spec.ts
sed -i "15s|')|}\`)|" vendor-search-visual-check.spec.ts
sed -i "32s|')|}\`)|" vendor-search-visual-check.spec.ts
echo "   - Fixed 3 mixed quotes on lines 4, 15, 32"

# File 9: vendor-tier-security.spec.ts - no errors
echo "9. vendor-tier-security.spec.ts"
echo "   - No syntax errors found"

echo ""
echo "======================================"
echo "Batch 11 fixes complete!"
echo "Total: 12 mixed quotes + 8 emojis fixed"
echo "======================================"
