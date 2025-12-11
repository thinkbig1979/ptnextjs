#!/usr/bin/env python3
"""
Apply fixes for E2E test registration timeout issue.

This script makes two changes:
1. Fixes the registerVendor helper function to handle all HTTP status codes
2. Adds DISABLE_RATE_LIMIT=true to .env file
"""

import os
import sys


def fix_vendor_onboarding_helpers():
    """Fix the registerVendor function in vendor-onboarding-helpers.ts"""
    file_path = "tests/e2e/helpers/vendor-onboarding-helpers.ts"

    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found")
        return False

    with open(file_path, 'r') as f:
        content = f.read()

    # The buggy code
    old_code = """  // Wait for API response
  const apiResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/portal/vendors/register') &&
      (response.status() === 201 || response.status() === 200)
  );

  await page.click('button[type="submit"]');

  const apiResponse = await apiResponsePromise;
  const responseBody = await apiResponse.json();

  if (!responseBody.success || !responseBody.data?.vendorId) {
    throw new Error(
      `Registration failed: ${JSON.stringify(responseBody)}`
    );
  }"""

    # The fixed code
    new_code = """  // Wait for API response - using Promise.all to coordinate click and waitForResponse
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
  }"""

    if old_code not in content:
        print(f"Warning: Could not find expected code pattern in {file_path}")
        print("The file may have already been fixed or has been modified.")
        return False

    # Create backup
    backup_path = file_path + ".backup"
    with open(backup_path, 'w') as f:
        f.write(content)
    print(f"Created backup: {backup_path}")

    # Apply fix
    new_content = content.replace(old_code, new_code)

    with open(file_path, 'w') as f:
        f.write(new_content)

    print(f"✓ Fixed registerVendor function in {file_path}")
    return True


def fix_env_file():
    """Add DISABLE_RATE_LIMIT=true to .env file"""
    file_path = ".env"

    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found")
        return False

    with open(file_path, 'r') as f:
        content = f.read()

    # Check if already added
    if 'DISABLE_RATE_LIMIT' in content:
        print(f"✓ DISABLE_RATE_LIMIT already exists in {file_path}")
        return True

    # Create backup
    backup_path = file_path + ".backup"
    with open(backup_path, 'w') as f:
        f.write(content)
    print(f"Created backup: {backup_path}")

    # Add the new settings
    new_content = content.rstrip() + "\n"
    new_content += "# Disable rate limiting for E2E testing (prevents test failures from rate limits)\n"
    new_content += "DISABLE_RATE_LIMIT=true\n"

    with open(file_path, 'w') as f:
        f.write(new_content)

    print(f"✓ Added DISABLE_RATE_LIMIT=true to {file_path}")
    return True


def main():
    """Apply all fixes"""
    print("=" * 60)
    print("Applying E2E Test Registration Timeout Fixes")
    print("=" * 60)
    print()

    # Change to script directory (project root)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    print(f"Working directory: {os.getcwd()}")
    print()

    success = True

    print("Fix 1: Update registerVendor helper function")
    print("-" * 60)
    if not fix_vendor_onboarding_helpers():
        success = False
    print()

    print("Fix 2: Add DISABLE_RATE_LIMIT to .env")
    print("-" * 60)
    if not fix_env_file():
        success = False
    print()

    if success:
        print("=" * 60)
        print("✓ All fixes applied successfully!")
        print("=" * 60)
        print()
        print("Next steps:")
        print("1. Restart the development server: npm run stop:dev && npm run dev")
        print("2. Run the failing test: npx playwright test tests/e2e/vendor-onboarding/02-admin-approval.spec.ts:33")
        print()
        return 0
    else:
        print("=" * 60)
        print("✗ Some fixes failed - please review the output above")
        print("=" * 60)
        return 1


if __name__ == "__main__":
    sys.exit(main())
