#!/bin/bash
# Fix for registerVendor helper function timeout issue
# This script patches the vendor-onboarding-helpers.ts file to fix the waitForResponse timeout

HELPER_FILE="tests/e2e/helpers/vendor-onboarding-helpers.ts"

# Backup the original file
cp "$HELPER_FILE" "$HELPER_FILE.backup"

# Use sed to replace the problematic waitForResponse code
# The issue: waitForResponse only waits for 200/201, causing timeout on other status codes
# The fix: Wait for ANY response and handle errors explicitly

cat > /tmp/fix-patch.txt << 'EOF'
  // Wait for API response - using Promise.all to coordinate click and waitForResponse
  // Accept ANY status code to avoid timeout if API returns error (429, 409, etc.)
  const [apiResponse] = await Promise.all([
    page.waitForResponse(
      (response) => response.url().includes('/api/portal/vendors/register'),
      { timeout: 15000 }
    ),
    page.click('button[type="submit"]')
  ]);

  const responseBody = await apiResponse.json();

  // Check if registration was successful
  if (apiResponse.status() !== 200 && apiResponse.status() !== 201) {
    throw new Error(
      `Registration failed with status ${apiResponse.status()}: ${JSON.stringify(responseBody)}`
    );
  }

  if (!responseBody.success || !responseBody.data?.vendorId) {
    throw new Error(
      `Registration failed: ${JSON.stringify(responseBody)}`
    );
  }
EOF

echo "Patch file created. Manual merge required."
echo "The issue is in lines 182-198 of $HELPER_FILE"
echo ""
echo "Current code waits only for status 200/201, causing timeout on rate limit (429) or other errors."
echo "Fix: Use Promise.all pattern and wait for ANY response, then handle errors explicitly."

