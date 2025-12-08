#!/bin/bash

# Test Verification Script for Refresh Token Rotation Tests
# Verifies test file quality and completeness

echo "=================================================="
echo "Refresh Token Rotation Test Verification"
echo "=================================================="
echo ""

TEST_FILE="__tests__/integration/auth/refresh-rotation.test.ts"
PROJECT_ROOT="/home/edwin/development/ptnextjs"

cd "$PROJECT_ROOT" || exit 1

echo "1. Checking test file exists..."
if [ -f "$TEST_FILE" ]; then
    echo "   ✅ Test file found: $TEST_FILE"
else
    echo "   ❌ Test file not found: $TEST_FILE"
    exit 1
fi

echo ""
echo "2. Counting test cases..."
TEST_COUNT=$(grep -c "it('should" "$TEST_FILE")
echo "   Found: $TEST_COUNT test cases"
if [ "$TEST_COUNT" -ge 20 ]; then
    echo "   ✅ Sufficient test coverage (20+ tests)"
else
    echo "   ⚠️  Warning: Less than 20 test cases"
fi

echo ""
echo "3. Checking for test quality issues..."

# Check for .only()
ONLY_COUNT=$(grep -c "\.only(" "$TEST_FILE" || echo "0")
if [ "$ONLY_COUNT" -eq 0 ]; then
    echo "   ✅ No .only() statements found"
else
    echo "   ❌ Found $ONLY_COUNT .only() statements (should be 0)"
fi

# Check for .skip()
SKIP_COUNT=$(grep -c "\.skip(" "$TEST_FILE" || echo "0")
if [ "$SKIP_COUNT" -eq 0 ]; then
    echo "   ✅ No .skip() statements found"
else
    echo "   ❌ Found $SKIP_COUNT .skip() statements (should be 0)"
fi

# Check for TODO/FIXME
TODO_COUNT=$(grep -c "TODO\|FIXME" "$TEST_FILE" || echo "0")
if [ "$TODO_COUNT" -eq 0 ]; then
    echo "   ✅ No TODO/FIXME comments"
else
    echo "   ⚠️  Found $TODO_COUNT TODO/FIXME comments"
fi

echo ""
echo "4. Verifying test structure..."
DESCRIBE_COUNT=$(grep -c "^describe(" "$TEST_FILE")
echo "   Test suites (describe): $DESCRIBE_COUNT"

echo ""
echo "5. Checking imports..."
if grep -q "from '@/lib/utils/jwt'" "$TEST_FILE"; then
    echo "   ✅ JWT utilities imported"
else
    echo "   ❌ Missing JWT utilities import"
fi

if grep -q "from '@jest/globals'" "$TEST_FILE"; then
    echo "   ✅ Jest globals imported"
else
    echo "   ❌ Missing Jest globals import"
fi

echo ""
echo "6. Verifying helper functions..."
if grep -q "function parseCookies" "$TEST_FILE"; then
    echo "   ✅ parseCookies helper found"
else
    echo "   ❌ Missing parseCookies helper"
fi

if grep -q "async function callRefreshEndpoint" "$TEST_FILE"; then
    echo "   ✅ callRefreshEndpoint helper found"
else
    echo "   ❌ Missing callRefreshEndpoint helper"
fi

echo ""
echo "7. Checking test groups..."
EXPECTED_GROUPS=(
    "Token Rotation"
    "Cookie Attributes"
    "Token Content"
    "Error Cases"
    "Token Rotation Sequence"
)

for GROUP in "${EXPECTED_GROUPS[@]}"; do
    if grep -q "describe('$GROUP'" "$TEST_FILE"; then
        echo "   ✅ Found: '$GROUP'"
    else
        echo "   ❌ Missing: '$GROUP'"
    fi
done

echo ""
echo "8. File statistics..."
LINE_COUNT=$(wc -l < "$TEST_FILE")
echo "   Total lines: $LINE_COUNT"

COMMENT_LINES=$(grep -c "^\s*//" "$TEST_FILE" || echo "0")
echo "   Comment lines: $COMMENT_LINES"

echo ""
echo "=================================================="
echo "Verification Complete"
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. Run: npm run test $TEST_FILE"
echo "2. Verify tests FAIL (RED phase)"
echo "3. Proceed with implementation task (ptnextjs-hqs6)"
echo ""
