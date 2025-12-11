#!/usr/bin/env python3
"""
Apply E2E test fixes to eliminate shared vendor dependencies
"""

import os

# Fix 1: vendor-dashboard.spec.ts - Replace shared TEST_VENDORS with unique seedVendors
vendor_dashboard_fix = '''import { test, expect, type Page } from '@playwright/test';
import { seedVendors } from './helpers/seed-api-helpers';

/**
 * TEST-E2E-DASHBOARD: Comprehensive E2E Tests for Vendor Dashboard Editing Workflow
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe.serial('TEST-E2E-DASHBOARD: Vendor Dashboard Editing Workflow', () => {
  // Create unique vendor credentials for this test suite
  const vendorData = {
    companyName: `Dashboard Test ${Date.now()}`,
    email: `dashboard-${Date.now()}@test.example.com`,
    password: 'DashboardTest123!@#',
    status: 'approved' as const,
    tier: 'tier1' as const,
  };

  // Seed the vendor once before all tests in this suite
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await seedVendors(page, [vendorData]);
    await context.close();
  });

  async function loginAsTestVendor(page: Page) {
    console.log('Logging in as test vendor...');
    await page.goto(`${BASE_URL}/vendor/login`);

    // Wait for React hydration - look for the form to be interactive
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500); // Extra wait for hydration

    const emailInput = page.getByPlaceholder('vendor@example.com');
    const passwordInput = page.getByPlaceholder('Enter your password');

    // Wait for inputs to be visible and enabled
    await emailInput.waitFor({ state: 'visible', timeout: 5000 });
    await passwordInput.waitFor({ state: 'visible', timeout: 5000 });

    await emailInput.fill(vendorData.email);
    await passwordInput.fill(vendorData.password);

    const loginPromise = page.waitForResponse(
      response => response.url().includes('/api/auth/login') && response.status() === 200
    );
    await page.getByRole('button', { name: /login/i }).click();
    await loginPromise;
    await page.waitForURL(`${BASE_URL}/vendor/dashboard`, { timeout: 10000 });

    // Wait for dashboard to hydrate
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
  }'''

# Read the original file
file_path = '/home/edwin/development/ptnextjs/tests/e2e/vendor-dashboard.spec.ts'
with open(file_path, 'r') as f:
    content = f.read()

# Find the section to replace (from import to end of loginAsTestVendor function)
start_marker = "import { test, expect, type Page } from '@playwright/test';"
end_marker = "  }\n\n  async function navigateToDashboardProfile"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    # Replace the section
    new_content = vendor_dashboard_fix + '\n\n  async function navigateToDashboardProfile' + content[end_idx + len(end_marker):]

    # Write the updated content
    with open(file_path, 'w') as f:
        f.write(new_content)

    print(f"✓ Fixed {file_path}")
    print("  - Removed dependency on TEST_VENDORS.tier1")
    print("  - Added unique vendor creation with seedVendors")
    print("  - Added beforeAll hook to seed vendor once per suite")
else:
    print(f"✗ Could not find markers in {file_path}")

print("\nDone!")
