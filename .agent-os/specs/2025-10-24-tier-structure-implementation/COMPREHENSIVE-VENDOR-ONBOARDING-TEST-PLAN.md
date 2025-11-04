# Comprehensive Vendor Onboarding Test Plan

**Document Version**: 1.0
**Created**: 2025-11-03
**Status**: Ready for Implementation
**Test Framework**: Playwright E2E
**Target**: Complete Vendor Onboarding Workflow Validation

---

## Executive Summary

This test plan provides comprehensive automated testing coverage for the complete vendor onboarding and lifecycle workflow, from initial registration through tier upgrades, profile enrichment, and product management. All tests are designed for full automation using Playwright.

**Test Coverage**: 12 test suites, 87+ individual test scenarios
**Estimated Execution Time**: ~45 minutes (parallel execution)
**Pass Criteria**: 100% test pass rate required for production deployment

---

## Table of Contents

1. [Test Environment Setup](#1-test-environment-setup)
2. [Test Suite 1: Vendor Registration](#2-test-suite-1-vendor-registration)
3. [Test Suite 2: Admin Approval Workflow](#3-test-suite-2-admin-approval-workflow)
4. [Test Suite 3: Vendor Authentication](#4-test-suite-3-vendor-authentication)
5. [Test Suite 4: Free Tier Profile Setup](#5-test-suite-4-free-tier-profile-setup)
6. [Test Suite 5: Tier Upgrade Flow](#6-test-suite-5-tier-upgrade-flow)
7. [Test Suite 6: Tier 1 Advanced Profile](#7-test-suite-6-tier-1-advanced-profile)
8. [Test Suite 7: Tier 2 Location Management](#8-test-suite-7-tier-2-location-management)
9. [Test Suite 8: Tier 3 Promotion Features](#9-test-suite-8-tier-3-promotion-features)
10. [Test Suite 9: Product Management](#10-test-suite-9-product-management)
11. [Test Suite 10: Public Profile Display](#11-test-suite-10-public-profile-display)
12. [Test Suite 11: Security & Access Control](#12-test-suite-11-security-access-control)
13. [Test Suite 12: End-to-End Happy Path](#13-test-suite-12-end-to-end-happy-path)
14. [Test Data Management](#14-test-data-management)
15. [Test Utilities & Helpers](#15-test-utilities-helpers)

---

## 1. Test Environment Setup

### Prerequisites

```bash
# Start development server
npm run dev

# Verify server is running
curl http://localhost:3000/

# Verify Payload CMS API
curl http://localhost:3000/api/payload-health

# Run test database seeding
npm run test:seed
```

### Test Configuration

```typescript
// playwright.config.ts adjustments for vendor onboarding tests
{
  testDir: './tests/e2e/vendor-onboarding',
  timeout: 60000, // 60s per test
  retries: 2,
  workers: 4, // Parallel execution
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  }
}
```

### Test Isolation Strategy

- **Unique Test Data**: Each test uses timestamp-based unique emails/company names
- **Database State**: Tests do not share vendor records (isolated)
- **Auth Cookies**: Cleared between test suites
- **Cache Invalidation**: Tests trigger cache refresh where needed

---

## 2. Test Suite 1: Vendor Registration

**File**: `tests/e2e/vendor-onboarding/01-registration.spec.ts`
**Duration**: ~5 minutes
**Dependencies**: None

### Test Scenarios

#### 1.1 Successful Registration - Complete Form

```typescript
test('should successfully register new vendor with all required fields', async ({ page }) => {
  // Arrange
  const testData = {
    email: `vendor-${Date.now()}@example.com`,
    companyName: `Test Company ${Date.now()}`,
    contactName: 'John Doe',
    contactPhone: '+1-555-0123',
    website: 'https://example.com',
    password: 'SecurePass123!@#',
    description: 'Test vendor company description',
  };

  // Act
  await page.goto('/vendor/register/');
  await fillRegistrationForm(page, testData);

  const apiResponse = await page.waitForResponse(
    response => response.url().includes('/api/portal/vendors/register') && response.status() === 201
  );

  // Assert
  const responseBody = await apiResponse.json();
  expect(responseBody.success).toBe(true);
  expect(responseBody.data).toMatchObject({
    vendorId: expect.any(String),
    status: 'pending',
    message: expect.stringContaining('registration successful'),
  });

  // Verify redirect to pending page
  await expect(page).toHaveURL(/\/vendor\/registration-pending\/?/);
  await expect(page.locator('h1')).toContainText('Registration Successful');

  // Verify pending status message
  await expect(page.locator('text=/pending approval|awaiting approval/i')).toBeVisible();

  // Screenshot for evidence
  await page.screenshot({ path: `evidence/01-1-1-registration-success-${Date.now()}.png`, fullPage: true });
});
```

#### 1.2 Registration Validation - Missing Required Fields

```typescript
test('should show validation errors for missing required fields', async ({ page }) => {
  await page.goto('/vendor/register/');

  // Submit empty form
  await page.click('button[type="submit"]');

  // Should stay on registration page
  await expect(page).toHaveURL(/\/vendor\/register\/?/);

  // Should show multiple validation errors
  const errorMessages = await page.locator('[role="alert"], .text-destructive, .text-red-500').all();
  expect(errorMessages.length).toBeGreaterThan(0);

  // Verify specific field errors
  await expect(page.locator('text=/email.*required/i')).toBeVisible();
  await expect(page.locator('text=/company.*required/i')).toBeVisible();
  await expect(page.locator('text=/password.*required/i')).toBeVisible();
});
```

#### 1.3 Registration Validation - Invalid Email Format

```typescript
test('should validate email format', async ({ page }) => {
  await page.goto('/vendor/register/');

  await page.getByPlaceholder('vendor@example.com').fill('invalid-email');
  await page.getByPlaceholder('Your Company Ltd').fill('Test Company');
  await page.getByPlaceholder('Enter strong password').fill('SecurePass123!@#');
  await page.getByPlaceholder('Re-enter password').fill('SecurePass123!@#');

  await page.click('button[type="submit"]');

  // Should show email validation error
  await expect(page.locator('text=/invalid email/i')).toBeVisible();
});
```

#### 1.4 Registration Validation - Password Mismatch

```typescript
test('should validate password confirmation match', async ({ page }) => {
  await page.goto('/vendor/register/');

  await fillRegistrationForm(page, {
    email: `test-${Date.now()}@example.com`,
    companyName: 'Test Company',
    password: 'SecurePass123!@#',
    passwordConfirm: 'DifferentPass456!@#', // Mismatch
  });

  await page.click('button[type="submit"]');

  await expect(page.locator('text=/password.*match/i')).toBeVisible();
});
```

#### 1.5 Registration Validation - Weak Password

```typescript
test('should reject weak passwords', async ({ page }) => {
  await page.goto('/vendor/register/');

  await fillRegistrationForm(page, {
    email: `test-${Date.now()}@example.com`,
    companyName: 'Test Company',
    password: 'weak', // Too weak
    passwordConfirm: 'weak',
  });

  await page.click('button[type="submit"]');

  await expect(page.locator('text=/password.*strong/i')).toBeVisible();
});
```

#### 1.6 Registration Validation - Duplicate Email

```typescript
test('should prevent duplicate email registration', async ({ page }) => {
  const duplicateEmail = 'existing@example.com';

  // First registration (assumed to exist in test database)
  // Second registration with same email
  await page.goto('/vendor/register/');
  await fillRegistrationForm(page, {
    email: duplicateEmail,
    companyName: 'Another Company',
  });

  const apiResponse = await page.waitForResponse(
    response => response.url().includes('/api/portal/vendors/register')
  );

  expect(apiResponse.status()).toBe(409); // Conflict

  const errorBody = await apiResponse.json();
  expect(errorBody.error?.message).toMatch(/email.*already.*exist/i);

  // Should show error toast
  await expect(page.locator('.sonner-toast, [role="status"]')).toBeVisible({ timeout: 3000 });
});
```

#### 1.7 Registration - Submit Button Disabled During Submission

```typescript
test('should disable submit button during API call', async ({ page }) => {
  await page.goto('/vendor/register/');

  await fillRegistrationForm(page, {
    email: `test-${Date.now()}@example.com`,
    companyName: `Test Company ${Date.now()}`,
  });

  const submitButton = page.locator('button[type="submit"]');

  // Click submit
  await submitButton.click();

  // Button should be disabled immediately
  await expect(submitButton).toBeDisabled({ timeout: 1000 });
});
```

#### 1.8 Registration - Terms and Conditions Acceptance

```typescript
test('should require terms and conditions acceptance', async ({ page }) => {
  await page.goto('/vendor/register/');

  await fillRegistrationForm(page, {
    email: `test-${Date.now()}@example.com`,
    companyName: 'Test Company',
  });

  // Uncheck terms checkbox
  const termsCheckbox = page.getByRole('checkbox', { name: 'Agree to terms and conditions' });
  await termsCheckbox.uncheck();

  await page.click('button[type="submit"]');

  // Should show validation error
  await expect(page.locator('text=/must accept.*terms/i')).toBeVisible();
});
```

---

## 3. Test Suite 2: Admin Approval Workflow

**File**: `tests/e2e/vendor-onboarding/02-admin-approval.spec.ts`
**Duration**: ~8 minutes
**Dependencies**: Registration must be working

### Test Scenarios

#### 2.1 Admin Login and Navigation to Pending Vendors

```typescript
test('admin should access pending vendors list', async ({ page }) => {
  // Login as admin
  await loginAsAdmin(page);

  // Navigate to Payload admin
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin/);

  // Navigate to Vendors collection
  await page.click('text=Vendors');
  await expect(page).toHaveURL(/\/admin\/collections\/vendors/);

  // Filter by pending status
  await page.click('button:has-text("Filter")');
  await page.selectOption('select[name="status"]', 'pending');
  await page.click('button:has-text("Apply")');

  // Verify pending vendors are displayed
  const pendingVendors = page.locator('[data-status="pending"]');
  expect(await pendingVendors.count()).toBeGreaterThan(0);
});
```

#### 2.2 Admin Approves Vendor

```typescript
test('admin should successfully approve pending vendor', async ({ page }) => {
  // Create pending vendor
  const vendorData = await createPendingVendor(page);

  // Login as admin
  await loginAsAdmin(page);

  // Navigate to vendor record
  await page.goto(`/admin/collections/vendors/${vendorData.id}`);

  // Change status to approved
  await page.selectOption('select[name="status"]', 'approved');

  // Save
  await page.click('button:has-text("Save")');

  // Wait for success message
  await expect(page.locator('text=/saved successfully/i')).toBeVisible({ timeout: 5000 });

  // Verify status changed
  const statusField = page.locator('select[name="status"]');
  await expect(statusField).toHaveValue('approved');
});
```

#### 2.3 Vendor Cannot Login While Pending

```typescript
test('pending vendor should be blocked from login', async ({ page }) => {
  const vendorData = await createPendingVendor(page);

  await page.goto('/vendor/login/');
  await page.getByPlaceholder('vendor@example.com').fill(vendorData.email);
  await page.getByPlaceholder('Enter your password').fill(vendorData.password);

  const loginResponse = await page.waitForResponse(
    response => response.url().includes('/api/auth/login')
  );

  expect(loginResponse.status()).toBe(403); // Forbidden

  const errorBody = await loginResponse.json();
  expect(errorBody.error?.message).toMatch(/pending approval/i);

  // Should show error toast
  await expect(page.locator('.sonner-toast:has-text("pending")')).toBeVisible();
});
```

#### 2.4 Approved Vendor Can Login

```typescript
test('approved vendor should successfully login', async ({ page }) => {
  const vendorData = await createAndApproveVendor(page);

  await page.goto('/vendor/login/');
  await page.getByPlaceholder('vendor@example.com').fill(vendorData.email);
  await page.getByPlaceholder('Enter your password').fill(vendorData.password);

  const loginResponse = await page.waitForResponse(
    response => response.url().includes('/api/auth/login') && response.status() === 200
  );

  const loginBody = await loginResponse.json();
  expect(loginBody.success).toBe(true);
  expect(loginBody.data?.user).toBeDefined();

  // Should redirect to dashboard
  await expect(page).toHaveURL(/\/vendor\/dashboard\/?/);
  await expect(page.locator('h1')).toContainText('Welcome');
});
```

#### 2.5 Admin Rejects Vendor

```typescript
test('admin should be able to reject vendor application', async ({ page }) => {
  const vendorData = await createPendingVendor(page);

  await loginAsAdmin(page);
  await page.goto(`/admin/collections/vendors/${vendorData.id}`);

  // Change status to rejected
  await page.selectOption('select[name="status"]', 'rejected');

  // Add rejection reason
  await page.fill('textarea[name="rejectionReason"]', 'Does not meet our criteria');

  // Save
  await page.click('button:has-text("Save")');
  await expect(page.locator('text=/saved successfully/i')).toBeVisible({ timeout: 5000 });

  // Verify rejected vendor cannot login
  await page.goto('/vendor/login/');
  await page.getByPlaceholder('vendor@example.com').fill(vendorData.email);
  await page.getByPlaceholder('Enter your password').fill(vendorData.password);

  const loginResponse = await page.waitForResponse(
    response => response.url().includes('/api/auth/login')
  );

  expect(loginResponse.status()).toBe(403);
});
```

---

## 4. Test Suite 3: Vendor Authentication

**File**: `tests/e2e/vendor-onboarding/03-authentication.spec.ts`
**Duration**: ~5 minutes
**Dependencies**: Admin approval must be working

### Test Scenarios

#### 3.1 Successful Login with Valid Credentials

```typescript
test('should login successfully with valid credentials', async ({ page }) => {
  const vendor = await createAndApproveVendor(page);

  await page.goto('/vendor/login/');
  await page.getByPlaceholder('vendor@example.com').fill(vendor.email);
  await page.getByPlaceholder('Enter your password').fill(vendor.password);

  await page.click('button:has-text("Login")');

  // Should redirect to dashboard
  await expect(page).toHaveURL(/\/vendor\/dashboard\/?/, { timeout: 5000 });
  await expect(page.locator('h1:has-text("Welcome")')).toBeVisible();
});
```

#### 3.2 Login Fails with Invalid Credentials

```typescript
test('should reject invalid credentials', async ({ page }) => {
  await page.goto('/vendor/login/');
  await page.getByPlaceholder('vendor@example.com').fill('nonexistent@example.com');
  await page.getByPlaceholder('Enter your password').fill('WrongPassword123');

  const loginResponse = await page.waitForResponse(
    response => response.url().includes('/api/auth/login')
  );

  expect(loginResponse.status()).toBe(401); // Unauthorized

  // Should show error message
  await expect(page.locator('text=/invalid.*credentials/i')).toBeVisible();
});
```

#### 3.3 Session Persistence

```typescript
test('should maintain session after page reload', async ({ page, context }) => {
  const vendor = await createAndApproveVendor(page);
  await loginVendor(page, vendor);

  // Verify logged in
  await expect(page).toHaveURL(/\/vendor\/dashboard\/?/);

  // Reload page
  await page.reload();

  // Should still be logged in
  await expect(page).toHaveURL(/\/vendor\/dashboard\/?/);
  await expect(page.locator('h1:has-text("Welcome")')).toBeVisible();
});
```

#### 3.4 Logout Functionality

```typescript
test('should logout successfully and clear session', async ({ page }) => {
  const vendor = await createAndApproveVendor(page);
  await loginVendor(page, vendor);

  // Click logout
  await page.click('button:has-text("Logout"), a:has-text("Logout")');

  // Should redirect to login page
  await expect(page).toHaveURL(/\/vendor\/login\/?/);

  // Attempt to access dashboard (should redirect back to login)
  await page.goto('/vendor/dashboard/');
  await expect(page).toHaveURL(/\/vendor\/login\/?/);
});
```

#### 3.5 Protected Route Access Without Auth

```typescript
test('should redirect unauthenticated users to login', async ({ page }) => {
  await page.goto('/vendor/dashboard/');

  // Should redirect to login
  await expect(page).toHaveURL(/\/vendor\/login\/?/);
});
```

---

## 5. Test Suite 4: Free Tier Profile Setup

**File**: `tests/e2e/vendor-onboarding/04-free-tier-profile.spec.ts`
**Duration**: ~8 minutes
**Dependencies**: Authentication must be working

### Test Scenarios

#### 4.1 Dashboard Loads for Free Tier Vendor

```typescript
test('free tier vendor should see dashboard with tier badge', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'free' });
  await loginVendor(page, vendor);

  // Verify dashboard loaded
  await expect(page.locator('h1:has-text("Welcome")')).toBeVisible();

  // Verify tier badge shows "Free"
  await expect(page.locator('text=/free tier/i, [data-tier="free"]')).toBeVisible();

  // Verify profile status card
  await expect(page.locator('text=/profile.*status/i')).toBeVisible();

  // Verify subscription tier card
  await expect(page.locator('text=/subscription.*tier/i')).toBeVisible();

  // Verify Quick Actions
  await expect(page.locator('text=/quick actions/i')).toBeVisible();
  await expect(page.getByRole('button', { name: /edit profile/i })).toBeVisible();
});
```

#### 4.2 Edit Basic Info Form - Free Tier Fields

```typescript
test('should edit and save basic info (free tier fields)', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'free' });
  await loginVendor(page, vendor);

  // Navigate to profile editor
  await page.click('button:has-text("Edit Profile")');
  await expect(page).toHaveURL(/\/vendor\/dashboard\/profile\/?/);

  // Verify Basic Info tab is active (default)
  await expect(page.locator('[role="tab"][aria-selected="true"]:has-text("Basic Info")')).toBeVisible();

  // Edit fields
  const updatedData = {
    companyName: `${vendor.companyName} Updated`,
    description: 'Updated company description for testing',
    contactPhone: '+1-555-9876',
    contactEmail: `updated-${vendor.email}`,
  };

  await page.fill('input[name="companyName"]', updatedData.companyName);
  await page.fill('textarea[name="description"]', updatedData.description);
  await page.fill('input[name="contactPhone"]', updatedData.contactPhone);

  // Save
  const saveResponse = await page.waitForResponse(
    response => response.url().includes(`/api/portal/vendors/${vendor.id}`) && response.request().method() === 'PUT'
  );

  await page.click('button:has-text("Save")');

  expect(saveResponse.status()).toBe(200);

  // Verify success toast
  await expect(page.locator('.sonner-toast:has-text("saved")')).toBeVisible({ timeout: 3000 });

  // Reload and verify persistence
  await page.reload();
  await expect(page.locator('input[name="companyName"]')).toHaveValue(updatedData.companyName);
  await expect(page.locator('textarea[name="description"]')).toHaveValue(updatedData.description);
});
```

#### 4.3 Free Tier Cannot Access Tier 1+ Fields

```typescript
test('free tier vendor should not see tier 1+ fields', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'free' });
  await loginVendor(page, vendor);

  await page.goto('/vendor/dashboard/profile/');

  // Free tier fields should be visible
  await expect(page.locator('input[name="companyName"]')).toBeVisible();
  await expect(page.locator('textarea[name="description"]')).toBeVisible();

  // Tier 1+ tabs should NOT be visible
  const brandStoryTab = page.locator('[role="tab"]:has-text("Brand Story")');
  expect(await brandStoryTab.isVisible()).toBe(false);

  // Or should show upgrade prompt
  const upgradePrompt = page.locator('text=/upgrade.*tier/i');
  const hasUpgradePrompt = await upgradePrompt.isVisible();

  if (hasUpgradePrompt) {
    expect(await upgradePrompt.isVisible()).toBe(true);
    await expect(page.locator('text=/unlock.*features/i')).toBeVisible();
  }
});
```

#### 4.4 Free Tier Upload Logo

```typescript
test('should upload logo image (free tier)', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'free' });
  await loginVendor(page, vendor);

  await page.goto('/vendor/dashboard/profile/');

  // Upload logo
  const logoInput = page.locator('input[type="file"][name="logo"]');
  await logoInput.setInputFiles('test-fixtures/test-logo.png');

  // Wait for upload to complete
  await expect(page.locator('img[alt*="logo"]')).toBeVisible({ timeout: 5000 });

  // Save profile
  await page.click('button:has-text("Save")');

  // Verify success
  await expect(page.locator('.sonner-toast:has-text("saved")')).toBeVisible();
});
```

#### 4.5 Free Tier Form Validation Errors

```typescript
test('should show validation errors for invalid data', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'free' });
  await loginVendor(page, vendor);

  await page.goto('/vendor/dashboard/profile/');

  // Clear required field
  await page.fill('input[name="companyName"]', '');

  // Try to save
  await page.click('button:has-text("Save")');

  // Should show validation error
  await expect(page.locator('text=/company name.*required/i')).toBeVisible();

  // Invalid email format
  await page.fill('input[name="contactEmail"]', 'invalid-email');
  await page.click('button:has-text("Save")');

  await expect(page.locator('text=/invalid.*email/i')).toBeVisible();
});
```

#### 4.6 Free Tier Single Location Limit

```typescript
test('free tier should be limited to 1 location', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'free' });
  await loginVendor(page, vendor);

  await page.goto('/vendor/dashboard/profile/');

  // Check if Locations tab exists
  const locationsTab = page.locator('[role="tab"]:has-text("Locations")');

  if (await locationsTab.isVisible()) {
    await locationsTab.click();

    // Should show 1 location limit message
    await expect(page.locator('text=/1 location/i')).toBeVisible();

    // Add location button should be disabled or show upgrade prompt
    const addLocationBtn = page.locator('button:has-text("Add Location")');

    if (await addLocationBtn.isVisible()) {
      // If already has 1 location, button should be disabled or show upgrade
      await expect(page.locator('text=/upgrade.*more locations/i')).toBeVisible();
    }
  }
});
```

---

## 6. Test Suite 5: Tier Upgrade Flow

**File**: `tests/e2e/vendor-onboarding/05-tier-upgrade.spec.ts`
**Duration**: ~10 minutes
**Dependencies**: Free tier profile must be working

### Test Scenarios

#### 5.1 View Tier Upgrade Options

```typescript
test('should display tier upgrade options and pricing', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'free' });
  await loginVendor(page, vendor);

  // Navigate to upgrade page (if exists) or click upgrade prompt
  const upgradeLink = page.locator('a:has-text("Upgrade"), button:has-text("Upgrade")').first();
  await upgradeLink.click();

  // Should show tier comparison
  await expect(page.locator('text=/tier 1.*professional/i')).toBeVisible();
  await expect(page.locator('text=/tier 2.*business/i')).toBeVisible();
  await expect(page.locator('text=/tier 3.*enterprise/i')).toBeVisible();

  // Should show pricing
  await expect(page.locator('text=/\\$99/i')).toBeVisible(); // Tier 1
  await expect(page.locator('text=/\\$299/i')).toBeVisible(); // Tier 2
  await expect(page.locator('text=/\\$999/i')).toBeVisible(); // Tier 3

  // Should show feature comparison
  await expect(page.locator('text=/enhanced profile/i')).toBeVisible();
  await expect(page.locator('text=/multiple locations/i')).toBeVisible();
  await expect(page.locator('text=/case studies/i')).toBeVisible();
});
```

#### 5.2 Upgrade to Tier 1 (Simulated Payment)

```typescript
test('should upgrade from free to tier 1', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'free' });
  await loginVendor(page, vendor);

  // Navigate to upgrade
  await page.click('a:has-text("Upgrade"), button:has-text("Upgrade")');

  // Select Tier 1
  await page.click('button:has-text("Choose Tier 1"), button:has-text("Select Professional")');

  // Fill payment form (mock/test mode)
  await fillPaymentForm(page, {
    cardNumber: '4242424242424242', // Test card
    expiry: '12/25',
    cvc: '123',
    name: 'Test User',
  });

  // Submit payment
  const upgradeResponse = await page.waitForResponse(
    response => response.url().includes('/api/portal/vendors/upgrade')
  );

  await page.click('button:has-text("Complete Upgrade")');

  expect(upgradeResponse.status()).toBe(200);

  // Verify success message
  await expect(page.locator('text=/upgrade.*successful/i')).toBeVisible({ timeout: 5000 });

  // Verify tier badge updated
  await page.goto('/vendor/dashboard/');
  await expect(page.locator('[data-tier="tier1"], text=/tier 1|professional/i')).toBeVisible();
});
```

#### 5.3 Tier 1 Features Unlocked After Upgrade

```typescript
test('tier 1 features should be accessible after upgrade', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'free' });
  await loginVendor(page, vendor);

  // Upgrade to Tier 1
  await upgradeTier(page, vendor.id, 'tier1');

  // Navigate to profile editor
  await page.goto('/vendor/dashboard/profile/');

  // Tier 1 tabs should now be visible
  await expect(page.locator('[role="tab"]:has-text("Brand Story")')).toBeVisible();
  await expect(page.locator('[role="tab"]:has-text("Certifications")')).toBeVisible();
  await expect(page.locator('[role="tab"]:has-text("Team")')).toBeVisible();
  await expect(page.locator('[role="tab"]:has-text("Case Studies")')).toBeVisible();

  // Brand Story tab fields should be editable
  await page.click('[role="tab"]:has-text("Brand Story")');
  await expect(page.locator('input[name="website"]')).not.toBeDisabled();
  await expect(page.locator('input[name="linkedinUrl"]')).not.toBeDisabled();
  await expect(page.locator('input[name="foundedYear"]')).not.toBeDisabled();
});
```

#### 5.4 Upgrade to Tier 2

```typescript
test('should upgrade from tier 1 to tier 2', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier1' });
  await loginVendor(page, vendor);

  // Navigate to upgrade
  await page.click('a:has-text("Upgrade")');

  // Select Tier 2
  await page.click('button:has-text("Choose Tier 2"), button:has-text("Select Business")');

  await fillPaymentForm(page, {
    cardNumber: '4242424242424242',
    expiry: '12/25',
    cvc: '123',
    name: 'Test User',
  });

  await page.click('button:has-text("Complete Upgrade")');

  // Verify upgrade
  await expect(page.locator('text=/upgrade.*successful/i')).toBeVisible({ timeout: 5000 });
  await page.goto('/vendor/dashboard/');
  await expect(page.locator('[data-tier="tier2"], text=/tier 2|business/i')).toBeVisible();
});
```

#### 5.5 Upgrade to Tier 3 (Enterprise)

```typescript
test('should upgrade to tier 3 enterprise', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier2' });
  await loginVendor(page, vendor);

  await page.click('a:has-text("Upgrade")');
  await page.click('button:has-text("Choose Tier 3"), button:has-text("Select Enterprise")');

  // Tier 3 might require contact sales
  const contactSalesBtn = page.locator('button:has-text("Contact Sales")');

  if (await contactSalesBtn.isVisible()) {
    await contactSalesBtn.click();

    // Verify contact form
    await expect(page.locator('text=/contact.*sales/i')).toBeVisible();
  } else {
    // Standard upgrade flow
    await fillPaymentForm(page, {
      cardNumber: '4242424242424242',
      expiry: '12/25',
      cvc: '123',
      name: 'Test User',
    });

    await page.click('button:has-text("Complete Upgrade")');

    await expect(page.locator('text=/upgrade.*successful/i')).toBeVisible({ timeout: 5000 });
  }
});
```

#### 5.6 Cannot Downgrade Tier

```typescript
test('should prevent tier downgrades', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier2' });
  await loginVendor(page, vendor);

  // Attempt to access tier 1 upgrade (should be disabled/hidden)
  await page.goto('/vendor/dashboard/upgrade/');

  // Tier 1 option should be disabled or not show "Downgrade" option
  const tier1Option = page.locator('[data-tier="tier1"]');

  if (await tier1Option.isVisible()) {
    await expect(tier1Option.locator('text=/current tier|unavailable/i')).toBeVisible();
  }
});
```

---

## 7. Test Suite 6: Tier 1 Advanced Profile

**File**: `tests/e2e/vendor-onboarding/06-tier1-advanced-profile.spec.ts`
**Duration**: ~12 minutes
**Dependencies**: Tier upgrade must be working

### Test Scenarios

#### 6.1 Brand Story Form - Website and Social Links

```typescript
test('should fill brand story with website and social links', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier1' });
  await loginVendor(page, vendor);

  await page.goto('/vendor/dashboard/profile/');
  await page.click('[role="tab"]:has-text("Brand Story")');

  // Fill brand story fields
  await page.fill('input[name="website"]', 'https://testcompany.com');
  await page.fill('input[name="linkedinUrl"]', 'https://linkedin.com/company/testcompany');
  await page.fill('input[name="twitterUrl"]', 'https://twitter.com/testcompany');
  await page.fill('input[name="foundedYear"]', '2010');

  // Fill social proof metrics (Tier 1+)
  await page.fill('input[name="totalProjects"]', '150');
  await page.fill('input[name="employeeCount"]', '50');
  await page.fill('input[name="clientSatisfactionScore"]', '95');

  // Save
  await page.click('button:has-text("Save")');

  await expect(page.locator('.sonner-toast:has-text("saved")')).toBeVisible();

  // Verify years in business computed (2025 - 2010 = 15)
  await expect(page.locator('text=/15 years in business/i')).toBeVisible();
});
```

#### 6.2 Certifications Manager - Add Certification

```typescript
test('should add certification to profile', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier1' });
  await loginVendor(page, vendor);

  await page.goto('/vendor/dashboard/profile/');
  await page.click('[role="tab"]:has-text("Certifications")');

  // Click Add Certification
  await page.click('button:has-text("Add Certification")');

  // Fill certification form
  await page.fill('input[name="certificationName"]', 'ISO 9001');
  await page.fill('input[name="issuingOrganization"]', 'ISO');
  await page.fill('input[name="dateIssued"]', '2020-01-01');
  await page.fill('input[name="expirationDate"]', '2025-01-01');

  // Save certification
  await page.click('button:has-text("Add"), button:has-text("Save Certification")');

  // Verify certification appears in list
  await expect(page.locator('text=ISO 9001')).toBeVisible();
  await expect(page.locator('text=ISO')).toBeVisible();
});
```

#### 6.3 Certifications Manager - Edit Certification

```typescript
test('should edit existing certification', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier1' });
  await loginVendor(page, vendor);

  // Add a certification first
  await addCertification(page, {
    name: 'ISO 9001',
    issuer: 'ISO',
    dateIssued: '2020-01-01',
  });

  await page.goto('/vendor/dashboard/profile/');
  await page.click('[role="tab"]:has-text("Certifications")');

  // Click edit on first certification
  await page.click('[data-test="certification-item"]:first-child button:has-text("Edit")');

  // Update name
  await page.fill('input[name="certificationName"]', 'ISO 9001:2015');

  // Save
  await page.click('button:has-text("Save")');

  // Verify updated
  await expect(page.locator('text=ISO 9001:2015')).toBeVisible();
});
```

#### 6.4 Certifications Manager - Delete Certification

```typescript
test('should delete certification with confirmation', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier1' });
  await loginVendor(page, vendor);

  await addCertification(page, {
    name: 'Test Certification',
    issuer: 'Test Org',
  });

  await page.goto('/vendor/dashboard/profile/');
  await page.click('[role="tab"]:has-text("Certifications")');

  // Click delete
  await page.click('[data-test="certification-item"]:has-text("Test Certification") button:has-text("Delete")');

  // Confirm deletion
  await expect(page.locator('text=/confirm.*delete/i')).toBeVisible();
  await page.click('button:has-text("Delete"), button:has-text("Confirm")');

  // Verify deleted
  await expect(page.locator('text=Test Certification')).not.toBeVisible();
});
```

#### 6.5 Awards Manager - Add Award

```typescript
test('should add award to profile', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier1' });
  await loginVendor(page, vendor);

  await page.goto('/vendor/dashboard/profile/');
  await page.click('[role="tab"]:has-text("Certifications")');

  // Scroll to awards section
  await page.locator('text=/awards/i').scrollIntoViewIfNeeded();

  // Add award
  await page.click('button:has-text("Add Award")');
  await page.fill('input[name="awardName"]', 'Best Innovation 2023');
  await page.fill('input[name="awardingOrganization"]', 'Industry Awards');
  await page.fill('input[name="yearReceived"]', '2023');
  await page.fill('textarea[name="awardDescription"]', 'Recognized for innovative yacht technology');

  await page.click('button:has-text("Add Award"), button:has-text("Save Award")');

  await expect(page.locator('text=Best Innovation 2023')).toBeVisible();
});
```

#### 6.6 Case Studies Manager - Add Case Study

```typescript
test('should create new case study', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier1' });
  await loginVendor(page, vendor);

  await page.goto('/vendor/dashboard/profile/');
  await page.click('[role="tab"]:has-text("Case Studies")');

  // Click Add Case Study
  await page.click('button:has-text("Add Case Study")');

  // Fill case study form (modal)
  await page.fill('input[name="title"]', 'Luxury Yacht Refit Project');
  await page.fill('textarea[name="description"]', 'Complete renovation of 80m superyacht');
  await page.fill('input[name="client"]', 'Confidential Client');
  await page.fill('input[name="projectYear"]', '2023');
  await page.fill('textarea[name="challenge"]', 'Tight deadline and complex requirements');
  await page.fill('textarea[name="solution"]', 'Innovative project management approach');
  await page.fill('textarea[name="results"]', 'Completed on time and under budget');

  // Upload images
  await page.locator('input[type="file"][name="images"]').setInputFiles([
    'test-fixtures/case-study-1.jpg',
    'test-fixtures/case-study-2.jpg',
  ]);

  // Mark as featured
  await page.check('input[name="featured"]');

  // Save
  await page.click('button:has-text("Save Case Study")');

  // Verify appears in list
  await expect(page.locator('text=Luxury Yacht Refit Project')).toBeVisible();
  await expect(page.locator('[data-featured="true"]:has-text("Luxury Yacht")')).toBeVisible();
});
```

#### 6.7 Team Members Manager - Add Team Member

```typescript
test('should add team member to profile', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier1' });
  await loginVendor(page, vendor);

  await page.goto('/vendor/dashboard/profile/');
  await page.click('[role="tab"]:has-text("Team")');

  // Add team member
  await page.click('button:has-text("Add Team Member")');

  await page.fill('input[name="name"]', 'John Smith');
  await page.fill('input[name="title"]', 'Chief Technology Officer');
  await page.fill('input[name="bio"]', 'Over 20 years experience in marine technology');
  await page.fill('input[name="linkedinUrl"]', 'https://linkedin.com/in/johnsmith');
  await page.fill('input[name="email"]', 'john@testcompany.com');

  // Upload photo
  await page.locator('input[type="file"][name="photo"]').setInputFiles('test-fixtures/team-member.jpg');

  // Save
  await page.click('button:has-text("Save Team Member")');

  await expect(page.locator('text=John Smith')).toBeVisible();
  await expect(page.locator('text=Chief Technology Officer')).toBeVisible();
});
```

#### 6.8 Team Members Manager - Reorder Team Members

```typescript
test('should reorder team members via drag and drop', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier1' });
  await loginVendor(page, vendor);

  // Add multiple team members
  await addTeamMember(page, { name: 'John Doe', title: 'CEO' });
  await addTeamMember(page, { name: 'Jane Smith', title: 'CTO' });
  await addTeamMember(page, { name: 'Bob Johnson', title: 'CFO' });

  await page.goto('/vendor/dashboard/profile/');
  await page.click('[role="tab"]:has-text("Team")');

  // Get initial order
  const initialOrder = await page.locator('[data-test="team-member-item"]').allTextContents();

  // Drag second item to first position
  const secondItem = page.locator('[data-test="team-member-item"]').nth(1);
  const firstItem = page.locator('[data-test="team-member-item"]').first();

  await secondItem.dragTo(firstItem);

  // Verify order changed
  const newOrder = await page.locator('[data-test="team-member-item"]').allTextContents();
  expect(newOrder).not.toEqual(initialOrder);

  // Save
  await page.click('button:has-text("Save")');

  // Reload and verify order persisted
  await page.reload();
  const persistedOrder = await page.locator('[data-test="team-member-item"]').allTextContents();
  expect(persistedOrder).toEqual(newOrder);
});
```

#### 6.9 Long Description Field (Tier 1+)

```typescript
test('should add long company description', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier1' });
  await loginVendor(page, vendor);

  await page.goto('/vendor/dashboard/profile/');
  await page.click('[role="tab"]:has-text("Brand Story")');

  // Fill long description (rich text editor)
  const longDesc = `
    We are a leading provider of superyacht technology solutions with over 15 years of experience.

    Our team specializes in:
    - Advanced navigation systems
    - Entertainment and communication systems
    - Smart yacht automation
    - Custom integration services

    We have successfully completed projects for over 150 superyachts worldwide.
  `;

  // Use rich text editor if available, otherwise textarea
  const richTextEditor = page.locator('[data-lexical-editor="true"], [contenteditable="true"]');

  if (await richTextEditor.isVisible()) {
    await richTextEditor.fill(longDesc);
  } else {
    await page.fill('textarea[name="longDescription"]', longDesc);
  }

  await page.click('button:has-text("Save")');

  await expect(page.locator('.sonner-toast:has-text("saved")')).toBeVisible();
});
```

---

## 8. Test Suite 7: Tier 2 Location Management

**File**: `tests/e2e/vendor-onboarding/07-tier2-locations.spec.ts`
**Duration**: ~10 minutes
**Dependencies**: Tier 1 profile must be working

### Test Scenarios

#### 7.1 Add First Location (Headquarters)

```typescript
test('should add first location as headquarters', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier2' });
  await loginVendor(page, vendor);

  await page.goto('/vendor/dashboard/profile/');
  await page.click('[role="tab"]:has-text("Locations")');

  // Add location
  await page.click('button:has-text("Add Location")');

  await page.fill('input[name="locationName"]', 'Main Office');
  await page.fill('input[name="address"]', '123 Harbor Street');
  await page.fill('input[name="city"]', 'Monaco');
  await page.fill('input[name="state"]', '');
  await page.fill('input[name="postalCode"]', '98000');
  await page.fill('input[name="country"]', 'Monaco');

  // Mark as HQ
  await page.check('input[name="isHQ"]');

  // Geocode address
  await page.click('button:has-text("Geocode Address")');

  // Wait for coordinates to populate
  await expect(page.locator('input[name="latitude"]')).not.toHaveValue('', { timeout: 5000 });
  await expect(page.locator('input[name="longitude"]')).not.toHaveValue('');

  // Save location
  await page.click('button:has-text("Save Location")');

  // Verify location appears in list
  await expect(page.locator('text=Main Office')).toBeVisible();
  await expect(page.locator('[data-hq="true"]:has-text("Main Office")')).toBeVisible();
});
```

#### 7.2 Add Additional Locations (Tier 2 allows up to 10)

```typescript
test('should add multiple locations up to tier 2 limit', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier2' });
  await loginVendor(page, vendor);

  await page.goto('/vendor/dashboard/profile/');
  await page.click('[role="tab"]:has-text("Locations")');

  // Add locations
  const locations = [
    { name: 'Monaco Office', city: 'Monaco', country: 'Monaco' },
    { name: 'Fort Lauderdale Office', city: 'Fort Lauderdale', country: 'USA' },
    { name: 'Barcelona Office', city: 'Barcelona', country: 'Spain' },
  ];

  for (const location of locations) {
    await page.click('button:has-text("Add Location")');
    await page.fill('input[name="locationName"]', location.name);
    await page.fill('input[name="city"]', location.city);
    await page.fill('input[name="country"]', location.country);

    await page.click('button:has-text("Geocode Address")');
    await page.waitForTimeout(1000); // Wait for geocoding

    await page.click('button:has-text("Save Location")');

    await expect(page.locator(`text=${location.name}`)).toBeVisible();
  }

  // Verify count
  const locationCount = await page.locator('[data-test="location-item"]').count();
  expect(locationCount).toBe(3);
});
```

#### 7.3 Edit Existing Location

```typescript
test('should edit location details', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier2' });
  await loginVendor(page, vendor);

  await addLocation(page, { name: 'Test Office', city: 'Monaco' });

  await page.goto('/vendor/dashboard/profile/');
  await page.click('[role="tab"]:has-text("Locations")');

  // Edit location
  await page.click('[data-test="location-item"]:has-text("Test Office") button:has-text("Edit")');

  // Update name
  await page.fill('input[name="locationName"]', 'Updated Office Name');
  await page.fill('input[name="phone"]', '+377-1234-5678');

  await page.click('button:has-text("Save Location")');

  await expect(page.locator('text=Updated Office Name')).toBeVisible();
  await expect(page.locator('text=+377-1234-5678')).toBeVisible();
});
```

#### 7.4 Delete Location

```typescript
test('should delete location with confirmation', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier2' });
  await loginVendor(page, vendor);

  await addLocation(page, { name: 'Temporary Office', city: 'Paris' });

  await page.goto('/vendor/dashboard/profile/');
  await page.click('[role="tab"]:has-text("Locations")');

  // Delete
  await page.click('[data-test="location-item"]:has-text("Temporary Office") button:has-text("Delete")');

  // Confirm
  await expect(page.locator('text=/confirm.*delete/i')).toBeVisible();
  await page.click('button:has-text("Delete"), button:has-text("Confirm")');

  // Verify deleted
  await expect(page.locator('text=Temporary Office')).not.toBeVisible();
});
```

#### 7.5 Geocoding Integration

```typescript
test('should geocode address to coordinates', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier2' });
  await loginVendor(page, vendor);

  await page.goto('/vendor/dashboard/profile/');
  await page.click('[role="tab"]:has-text("Locations")');
  await page.click('button:has-text("Add Location")');

  // Fill address
  await page.fill('input[name="address"]', '1 Avenue des Castelans');
  await page.fill('input[name="city"]', 'Monaco');
  await page.fill('input[name="postalCode"]', '98000');
  await page.fill('input[name="country"]', 'Monaco');

  // Geocode
  await page.click('button:has-text("Geocode Address")');

  // Verify coordinates populated
  await expect(page.locator('input[name="latitude"]')).not.toHaveValue('', { timeout: 5000 });
  await expect(page.locator('input[name="longitude"]')).not.toHaveValue('');

  // Verify coordinates are in valid range
  const lat = await page.locator('input[name="latitude"]').inputValue();
  const lon = await page.locator('input[name="longitude"]').inputValue();

  expect(parseFloat(lat)).toBeGreaterThanOrEqual(-90);
  expect(parseFloat(lat)).toBeLessThanOrEqual(90);
  expect(parseFloat(lon)).toBeGreaterThanOrEqual(-180);
  expect(parseFloat(lon)).toBeLessThanOrEqual(180);
});
```

#### 7.6 Map Preview for Locations

```typescript
test('should display map preview with location markers', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier2' });
  await loginVendor(page, vendor);

  await addLocation(page, {
    name: 'Monaco Office',
    city: 'Monaco',
    latitude: 43.7384,
    longitude: 7.4246,
  });

  await page.goto('/vendor/dashboard/profile/');
  await page.click('[role="tab"]:has-text("Locations")');

  // Verify map is visible
  await expect(page.locator('[data-test="location-map"], .leaflet-container')).toBeVisible();

  // Verify marker is on map
  await expect(page.locator('.leaflet-marker-icon')).toBeVisible();
});
```

#### 7.7 Location Limit Enforcement (Tier 2: 10 locations)

```typescript
test('tier 2 should be limited to 10 locations', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier2' });
  await loginVendor(page, vendor);

  // Add 10 locations
  for (let i = 1; i <= 10; i++) {
    await addLocation(page, { name: `Office ${i}`, city: 'Test City' });
  }

  await page.goto('/vendor/dashboard/profile/');
  await page.click('[role="tab"]:has-text("Locations")');

  // Verify count
  const count = await page.locator('[data-test="location-item"]').count();
  expect(count).toBe(10);

  // Add Location button should be disabled or show message
  const addBtn = page.locator('button:has-text("Add Location")');

  if (await addBtn.isVisible()) {
    await expect(addBtn).toBeDisabled();
    await expect(page.locator('text=/maximum.*10.*location/i')).toBeVisible();
  }
});
```

---

## 9. Test Suite 8: Tier 3 Promotion Features

**File**: `tests/e2e/vendor-onboarding/08-tier3-promotions.spec.ts`
**Duration**: ~6 minutes
**Dependencies**: Tier 2 features must be working

### Test Scenarios

#### 9.1 Access Promotion Pack Tab

```typescript
test('tier 3 vendor should access promotion pack features', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier3' });
  await loginVendor(page, vendor);

  await page.goto('/vendor/dashboard/profile/');

  // Verify Promotion Pack tab is visible (Tier 3 only)
  await expect(page.locator('[role="tab"]:has-text("Promotion Pack")')).toBeVisible();

  await page.click('[role="tab"]:has-text("Promotion Pack")');

  // Verify promotion features displayed
  await expect(page.locator('text=/featured placement/i')).toBeVisible();
  await expect(page.locator('text=/priority listing/i')).toBeVisible();
  await expect(page.locator('text=/homepage feature/i')).toBeVisible();
});
```

#### 9.2 Featured Placement Toggle

```typescript
test('should enable featured placement', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier3' });
  await loginVendor(page, vendor);

  await page.goto('/vendor/dashboard/profile/');
  await page.click('[role="tab"]:has-text("Promotion Pack")');

  // Check featured placement checkbox
  const featuredCheckbox = page.locator('input[name="featured"]');
  await featuredCheckbox.check();

  // Save
  await page.click('button:has-text("Save")');

  await expect(page.locator('.sonner-toast:has-text("saved")')).toBeVisible();

  // Verify on public profile (featured badge)
  await page.goto(`/vendors/${vendor.slug}/`);
  await expect(page.locator('[data-featured="true"], text=/featured/i')).toBeVisible();
});
```

#### 9.3 Editorial Content Display

```typescript
test('should display editorial content fields', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier3' });
  await loginVendor(page, vendor);

  await page.goto('/vendor/dashboard/profile/');
  await page.click('[role="tab"]:has-text("Promotion Pack")');

  // Verify editorial content section exists
  await expect(page.locator('text=/editorial content/i')).toBeVisible();

  // Fields are read-only (managed by admin)
  const editorialField = page.locator('[name="editorialContent"]');

  if (await editorialField.isVisible()) {
    await expect(editorialField).toBeDisabled();
  }

  // Verify "Contact Sales" CTA
  await expect(page.locator('button:has-text("Contact Sales"), a:has-text("Contact Sales")')).toBeVisible();
});
```

#### 9.4 Tier 3 Badge Display

```typescript
test('tier 3 vendor should display enterprise badge', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier3' });
  await loginVendor(page, vendor);

  await page.goto('/vendor/dashboard/');

  // Verify enterprise badge on dashboard
  await expect(page.locator('[data-tier="tier3"], text=/tier 3|enterprise/i')).toBeVisible();

  // Verify on public profile
  await page.goto(`/vendors/${vendor.slug}/`);
  await expect(page.locator('[data-tier="tier3"], .tier-badge:has-text("Enterprise")')).toBeVisible();
});
```

#### 9.5 Unlimited Locations (Tier 3)

```typescript
test('tier 3 should allow unlimited locations', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier3' });
  await loginVendor(page, vendor);

  await page.goto('/vendor/dashboard/profile/');
  await page.click('[role="tab"]:has-text("Locations")');

  // Add 15+ locations (beyond tier 2 limit)
  for (let i = 1; i <= 15; i++) {
    await addLocation(page, { name: `Office ${i}`, city: 'Test City' });
  }

  // Verify all added
  const count = await page.locator('[data-test="location-item"]').count();
  expect(count).toBe(15);

  // Add button should still be enabled
  const addBtn = page.locator('button:has-text("Add Location")');
  await expect(addBtn).toBeEnabled();

  // Should not show limit message
  await expect(page.locator('text=/maximum.*location/i')).not.toBeVisible();
});
```

---

## 10. Test Suite 9: Product Management

**File**: `tests/e2e/vendor-onboarding/09-product-management.spec.ts`
**Duration**: ~10 minutes
**Dependencies**: Tier 2+ profile must be working

### Test Scenarios

#### 10.1 Access Product Management (Tier 2+)

```typescript
test('tier 2+ vendor should access product management', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier2' });
  await loginVendor(page, vendor);

  await page.goto('/vendor/dashboard/');

  // Verify "Manage Products" link/button exists
  await expect(page.locator('a:has-text("Manage Products"), button:has-text("Manage Products")')).toBeVisible();

  await page.click('a:has-text("Manage Products"), button:has-text("Manage Products")');

  // Should navigate to products page
  await expect(page).toHaveURL(/\/vendor\/dashboard\/products\/?/);
  await expect(page.locator('h1:has-text("Products")')).toBeVisible();
});
```

#### 10.2 View Product List

```typescript
test('should display list of vendor products', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier2' });
  await loginVendor(page, vendor);

  // Seed vendor with products
  await seedProducts(page, vendor.id, [
    { name: 'Product A', description: 'Test product A' },
    { name: 'Product B', description: 'Test product B' },
  ]);

  await page.goto('/vendor/dashboard/products/');

  // Verify products displayed
  await expect(page.locator('text=Product A')).toBeVisible();
  await expect(page.locator('text=Product B')).toBeVisible();

  // Verify product cards show key info
  await expect(page.locator('[data-test="product-item"]')).toHaveCount(2);
});
```

#### 10.3 Add New Product

```typescript
test('should create new product', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier2' });
  await loginVendor(page, vendor);

  await page.goto('/vendor/dashboard/products/');

  // Click Add Product
  await page.click('button:has-text("Add Product")');

  // Fill product form
  await page.fill('input[name="productName"]', 'Test Product');
  await page.fill('textarea[name="description"]', 'This is a test product for E2E testing');
  await page.selectOption('select[name="category"]', 'Navigation Systems');

  // Upload product image
  await page.locator('input[type="file"][name="image"]').setInputFiles('test-fixtures/product-image.jpg');

  // Fill specifications
  await page.fill('input[name="manufacturer"]', 'Test Manufacturer');
  await page.fill('input[name="model"]', 'TM-2000');
  await page.fill('input[name="price"]', '5000');

  // Save
  const createResponse = await page.waitForResponse(
    response => response.url().includes('/api/portal/products') && response.request().method() === 'POST'
  );

  await page.click('button:has-text("Save Product")');

  expect(createResponse.status()).toBe(201);

  // Verify product appears in list
  await expect(page.locator('text=Test Product')).toBeVisible();
});
```

#### 10.4 Edit Existing Product

```typescript
test('should edit product details', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier2' });
  await loginVendor(page, vendor);

  await seedProducts(page, vendor.id, [
    { name: 'Original Product', description: 'Original description' },
  ]);

  await page.goto('/vendor/dashboard/products/');

  // Click Edit on product
  await page.click('[data-test="product-item"]:has-text("Original Product") button:has-text("Edit")');

  // Update fields
  await page.fill('input[name="productName"]', 'Updated Product');
  await page.fill('textarea[name="description"]', 'Updated description');

  // Save
  await page.click('button:has-text("Save")');

  // Verify updated
  await expect(page.locator('text=Updated Product')).toBeVisible();
  await expect(page.locator('text=Original Product')).not.toBeVisible();
});
```

#### 10.5 Delete Product

```typescript
test('should delete product with confirmation', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier2' });
  await loginVendor(page, vendor);

  await seedProducts(page, vendor.id, [
    { name: 'Product to Delete', description: 'Will be deleted' },
  ]);

  await page.goto('/vendor/dashboard/products/');

  // Delete
  await page.click('[data-test="product-item"]:has-text("Product to Delete") button:has-text("Delete")');

  // Confirm
  await expect(page.locator('text=/confirm.*delete/i')).toBeVisible();
  await page.click('button:has-text("Delete"), button:has-text("Confirm")');

  // Verify deleted
  await expect(page.locator('text=Product to Delete')).not.toBeVisible();
});
```

#### 10.6 Publish/Unpublish Product

```typescript
test('should publish and unpublish product', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier2' });
  await loginVendor(page, vendor);

  await seedProducts(page, vendor.id, [
    { name: 'Draft Product', published: false },
  ]);

  await page.goto('/vendor/dashboard/products/');

  // Product should show "Draft" status
  await expect(page.locator('[data-test="product-item"]:has-text("Draft Product") [data-status="draft"]')).toBeVisible();

  // Publish
  await page.click('[data-test="product-item"]:has-text("Draft Product") button:has-text("Publish")');

  // Verify published
  await expect(page.locator('[data-test="product-item"]:has-text("Draft Product") [data-status="published"]')).toBeVisible();

  // Verify visible on public products page
  await page.goto('/products/');
  await expect(page.locator('text=Draft Product')).toBeVisible();
});
```

#### 10.7 Product Categories Assignment

```typescript
test('should assign product to categories', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier2' });
  await loginVendor(page, vendor);

  await page.goto('/vendor/dashboard/products/');
  await page.click('button:has-text("Add Product")');

  await page.fill('input[name="productName"]', 'Navigation System Pro');
  await page.fill('textarea[name="description"]', 'Advanced navigation system');

  // Select multiple categories
  await page.selectOption('select[name="categories"]', ['Navigation Systems', 'Electronics']);

  await page.click('button:has-text("Save Product")');

  // Verify product appears in both categories
  await page.goto('/products/?category=Navigation%20Systems');
  await expect(page.locator('text=Navigation System Pro')).toBeVisible();

  await page.goto('/products/?category=Electronics');
  await expect(page.locator('text=Navigation System Pro')).toBeVisible();
});
```

---

## 11. Test Suite 10: Public Profile Display

**File**: `tests/e2e/vendor-onboarding/10-public-profile-display.spec.ts`
**Duration**: ~10 minutes
**Dependencies**: All profile features must be working

### Test Scenarios

#### 11.1 Free Tier Public Profile Display

```typescript
test('free tier public profile should show basic info only', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'free' });

  await page.goto(`/vendors/${vendor.slug}/`);

  // Basic info should be visible
  await expect(page.locator('h1:has-text("' + vendor.companyName + '")')).toBeVisible();
  await expect(page.locator('text=' + vendor.description)).toBeVisible();
  await expect(page.locator('img[alt*="logo"]')).toBeVisible();

  // Tier badge should show "Free"
  await expect(page.locator('[data-tier="free"], .tier-badge:has-text("Free")')).toBeVisible();

  // Tier 1+ sections should NOT be visible
  await expect(page.locator('text=/brand story/i')).not.toBeVisible();
  await expect(page.locator('text=/certifications/i')).not.toBeVisible();
  await expect(page.locator('text=/case studies/i')).not.toBeVisible();
  await expect(page.locator('text=/team members/i')).not.toBeVisible();
});
```

#### 11.2 Tier 1 Public Profile Display

```typescript
test('tier 1 public profile should show enhanced features', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier1' });
  await loginVendor(page, vendor);

  // Fill tier 1 content
  await fillBrandStory(page, {
    website: 'https://testcompany.com',
    foundedYear: '2010',
    totalProjects: '150',
  });
  await addCertification(page, { name: 'ISO 9001', issuer: 'ISO' });
  await addTeamMember(page, { name: 'John Doe', title: 'CEO' });

  // Logout and view public profile
  await page.click('button:has-text("Logout")');
  await page.goto(`/vendors/${vendor.slug}/`);

  // Verify tier 1 content visible
  await expect(page.locator('text=15 years in business')).toBeVisible(); // Computed field
  await expect(page.locator('a[href="https://testcompany.com"]')).toBeVisible();
  await expect(page.locator('text=/150.*project/i')).toBeVisible();

  // Certifications section
  await expect(page.locator('text=/certifications/i')).toBeVisible();
  await expect(page.locator('text=ISO 9001')).toBeVisible();

  // Team section
  await expect(page.locator('text=/team/i')).toBeVisible();
  await expect(page.locator('text=John Doe')).toBeVisible();
  await expect(page.locator('text=CEO')).toBeVisible();
});
```

#### 11.3 Tier 2 Public Profile with Locations

```typescript
test('tier 2 public profile should show location map', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier2' });
  await loginVendor(page, vendor);

  // Add locations
  await addLocation(page, {
    name: 'Monaco HQ',
    city: 'Monaco',
    latitude: 43.7384,
    longitude: 7.4246,
    isHQ: true,
  });
  await addLocation(page, {
    name: 'Barcelona Office',
    city: 'Barcelona',
    latitude: 41.3874,
    longitude: 2.1686,
  });

  // View public profile
  await page.goto(`/vendors/${vendor.slug}/`);

  // Verify locations section
  await expect(page.locator('text=/locations/i')).toBeVisible();
  await expect(page.locator('text=Monaco HQ')).toBeVisible();
  await expect(page.locator('text=Barcelona Office')).toBeVisible();

  // Verify map is visible
  await expect(page.locator('.leaflet-container, [data-test="location-map"]')).toBeVisible();

  // Verify markers on map
  const markers = page.locator('.leaflet-marker-icon');
  expect(await markers.count()).toBe(2);
});
```

#### 11.4 Tier 3 Public Profile with Featured Badge

```typescript
test('tier 3 featured vendor should display prominently', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier3', featured: true });

  await page.goto(`/vendors/${vendor.slug}/`);

  // Featured badge
  await expect(page.locator('[data-featured="true"], .featured-badge')).toBeVisible();

  // Enterprise tier badge
  await expect(page.locator('[data-tier="tier3"], .tier-badge:has-text("Enterprise")')).toBeVisible();

  // Verify on vendor listing page (featured should be first)
  await page.goto('/vendors/');

  const firstVendor = page.locator('[data-test="vendor-card"]').first();
  await expect(firstVendor).toContainText(vendor.companyName);
  await expect(firstVendor.locator('[data-featured="true"]')).toBeVisible();
});
```

#### 11.5 Responsive Design - Mobile View

```typescript
test('public profile should be responsive on mobile', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier2' });

  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });

  await page.goto(`/vendors/${vendor.slug}/`);

  // Verify mobile-friendly layout
  await expect(page.locator('h1')).toBeVisible();

  // Tabs should be horizontally scrollable or collapsed
  const tabs = page.locator('[role="tablist"]');

  if (await tabs.isVisible()) {
    // Check if tabs are scrollable
    const isScrollable = await tabs.evaluate(
      el => el.scrollWidth > el.clientWidth
    );
    expect(isScrollable).toBe(true);
  }
});
```

#### 11.6 SEO Metadata

```typescript
test('public profile should have proper SEO metadata', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, {
    tier: 'tier1',
    companyName: 'Test SEO Company',
    description: 'SEO test description',
  });

  await page.goto(`/vendors/${vendor.slug}/`);

  // Verify title tag
  await expect(page).toHaveTitle(new RegExp(vendor.companyName));

  // Verify meta description
  const metaDescription = page.locator('meta[name="description"]');
  const descContent = await metaDescription.getAttribute('content');
  expect(descContent).toContain(vendor.description);

  // Verify Open Graph tags
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', new RegExp(vendor.companyName));
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', new RegExp(vendor.description));
});
```

---

## 12. Test Suite 11: Security & Access Control

**File**: `tests/e2e/vendor-onboarding/11-security-access-control.spec.ts`
**Duration**: ~8 minutes
**Dependencies**: All features must be working

### Test Scenarios

#### 12.1 Vendor Cannot Access Another Vendor's Dashboard

```typescript
test('vendor should not access other vendor profiles', async ({ page }) => {
  const vendor1 = await createAndApproveVendor(page, { tier: 'tier2' });
  const vendor2 = await createAndApproveVendor(page, { tier: 'tier2' });

  // Login as vendor1
  await loginVendor(page, vendor1);

  // Attempt to access vendor2's dashboard
  await page.goto(`/vendor/dashboard/profile/?vendorId=${vendor2.id}`);

  // Should be redirected or see error
  await expect(page.locator('text=/unauthorized|access denied|forbidden/i')).toBeVisible();
});
```

#### 12.2 API Endpoint Security - Tier Field Restrictions

```typescript
test('API should reject tier-restricted fields from lower tier vendors', async ({ page, context }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'free' });
  await loginVendor(page, vendor);

  // Extract auth cookies
  const cookies = await context.cookies();

  // Attempt to update tier1+ fields via API
  const response = await page.evaluate(async ({ vendorId, cookies }) => {
    document.cookie = cookies.map(c => `${c.name}=${c.value}`).join('; ');

    const res = await fetch(`/api/portal/vendors/${vendorId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        website: 'https://forbidden.com', // Tier 1+ field
        linkedinUrl: 'https://linkedin.com/company/forbidden', // Tier 1+ field
      }),
    });

    return {
      status: res.status,
      body: await res.json(),
    };
  }, { vendorId: vendor.id, cookies });

  // Should be rejected (403 Forbidden or 400 Bad Request)
  expect([400, 403]).toContain(response.status);
  expect(response.body.error?.message).toMatch(/tier|permission|forbidden/i);
});
```

#### 12.3 API Endpoint Security - Vendor ID Mismatch

```typescript
test('API should prevent vendor from updating another vendor', async ({ page, context }) => {
  const vendor1 = await createAndApproveVendor(page, { tier: 'tier1' });
  const vendor2 = await createAndApproveVendor(page, { tier: 'tier1' });

  // Login as vendor1
  await loginVendor(page, vendor1);
  const cookies = await context.cookies();

  // Attempt to update vendor2 via API
  const response = await page.evaluate(async ({ vendor2Id, cookies }) => {
    document.cookie = cookies.map(c => `${c.name}=${c.value}`).join('; ');

    const res = await fetch(`/api/portal/vendors/${vendor2Id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        companyName: 'Hacked Company Name',
      }),
    });

    return {
      status: res.status,
      body: await res.json(),
    };
  }, { vendor2Id: vendor2.id, cookies });

  // Should be rejected (403 Forbidden)
  expect(response.status).toBe(403);
  expect(response.body.error?.message).toMatch(/unauthorized|forbidden/i);
});
```

#### 12.4 XSS Prevention - Script Injection in Profile Fields

```typescript
test('should sanitize script injection attempts', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier1' });
  await loginVendor(page, vendor);

  await page.goto('/vendor/dashboard/profile/');

  // Attempt XSS via company name
  const xssPayload = '<script>alert("XSS")</script>';
  await page.fill('input[name="companyName"]', xssPayload);

  await page.click('button:has-text("Save")');

  // Verify saved (should be sanitized)
  await page.reload();

  // Check public profile
  await page.goto(`/vendors/${vendor.slug}/`);

  // Verify no script executed (check page content)
  const h1Content = await page.locator('h1').textContent();

  // Should either be sanitized or encoded
  expect(h1Content).not.toContain('<script>');

  // Verify no alert dialog appeared
  const hasAlert = await page.evaluate(() => {
    return window.document.querySelector('dialog[role="alert"]') !== null;
  });
  expect(hasAlert).toBe(false);
});
```

#### 12.5 CSRF Protection

```typescript
test('API should have CSRF protection', async ({ page, context }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier1' });
  await loginVendor(page, vendor);

  // Get cookies but make request from different origin (simulated)
  const cookies = await context.cookies();

  const response = await page.evaluate(async ({ vendorId, cookieString }) => {
    // Simulate cross-origin request (no CSRF token)
    const res = await fetch(`/api/portal/vendors/${vendorId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieString,
        // Missing CSRF token
      },
      body: JSON.stringify({
        companyName: 'CSRF Attack',
      }),
    });

    return {
      status: res.status,
    };
  }, {
    vendorId: vendor.id,
    cookieString: cookies.map(c => `${c.name}=${c.value}`).join('; '),
  });

  // Should be rejected if CSRF protection is enabled
  // Note: This test may need adjustment based on CSRF implementation
  expect([403, 401]).toContain(response.status);
});
```

#### 12.6 Rate Limiting

```typescript
test('API should have rate limiting', async ({ page }) => {
  const vendor = await createAndApproveVendor(page, { tier: 'tier1' });
  await loginVendor(page, vendor);

  // Make many rapid requests
  const requests = [];
  for (let i = 0; i < 100; i++) {
    requests.push(
      page.evaluate(async ({ vendorId }) => {
        const res = await fetch(`/api/portal/vendors/${vendorId}`, {
          credentials: 'include',
        });
        return res.status;
      }, { vendorId: vendor.id })
    );
  }

  const results = await Promise.all(requests);

  // Should have some 429 (Too Many Requests) responses
  const rateLimitedCount = results.filter(status => status === 429).length;

  expect(rateLimitedCount).toBeGreaterThan(0);
});
```

---

## 13. Test Suite 12: End-to-End Happy Path

**File**: `tests/e2e/vendor-onboarding/12-e2e-happy-path.spec.ts`
**Duration**: ~15 minutes
**Dependencies**: All features must be working

### Full Journey Test

```typescript
test('complete vendor journey from registration to tier 3', async ({ page }) => {
  // ===== STEP 1: Registration =====
  console.log('Step 1: Registration');
  const vendorData = {
    email: `e2e-vendor-${Date.now()}@example.com`,
    companyName: `E2E Test Company ${Date.now()}`,
    password: 'SecurePass123!@#',
    contactName: 'E2E Test User',
    contactPhone: '+1-555-E2E',
    description: 'Complete E2E test vendor',
  };

  await page.goto('/vendor/register/');
  await fillRegistrationForm(page, vendorData);
  await page.click('button[type="submit"]');

  // Wait for registration success
  await expect(page).toHaveURL(/\/vendor\/registration-pending\/?/);
  await expect(page.locator('h1:has-text("Registration Successful")')).toBeVisible();

  // ===== STEP 2: Admin Approval =====
  console.log('Step 2: Admin Approval');
  const vendorId = await approveVendor(page, vendorData.email);

  // ===== STEP 3: First Login =====
  console.log('Step 3: First Login');
  await page.goto('/vendor/login/');
  await page.fill('input[name="email"]', vendorData.email);
  await page.fill('input[name="password"]', vendorData.password);
  await page.click('button:has-text("Login")');

  await expect(page).toHaveURL(/\/vendor\/dashboard\/?/);
  await expect(page.locator('h1:has-text("Welcome")')).toBeVisible();

  // ===== STEP 4: Free Tier Profile Setup =====
  console.log('Step 4: Free Tier Profile Setup');
  await page.click('button:has-text("Edit Profile")');
  await page.fill('textarea[name="description"]', 'Updated description for E2E test');
  await page.click('button:has-text("Save")');
  await expect(page.locator('.sonner-toast:has-text("saved")')).toBeVisible();

  // ===== STEP 5: Upgrade to Tier 1 =====
  console.log('Step 5: Upgrade to Tier 1');
  await upgradeTier(page, vendorId, 'tier1');
  await page.goto('/vendor/dashboard/');
  await expect(page.locator('[data-tier="tier1"]')).toBeVisible();

  // ===== STEP 6: Fill Tier 1 Brand Story =====
  console.log('Step 6: Fill Brand Story');
  await page.goto('/vendor/dashboard/profile/');
  await page.click('[role="tab"]:has-text("Brand Story")');
  await page.fill('input[name="website"]', 'https://e2e-test.com');
  await page.fill('input[name="foundedYear"]', '2015');
  await page.fill('input[name="totalProjects"]', '200');
  await page.click('button:has-text("Save")');
  await expect(page.locator('.sonner-toast:has-text("saved")')).toBeVisible();

  // ===== STEP 7: Add Certifications =====
  console.log('Step 7: Add Certifications');
  await page.click('[role="tab"]:has-text("Certifications")');
  await addCertification(page, {
    name: 'ISO 9001:2015',
    issuer: 'ISO',
    dateIssued: '2020-01-01',
  });
  await expect(page.locator('text=ISO 9001:2015')).toBeVisible();

  // ===== STEP 8: Add Team Members =====
  console.log('Step 8: Add Team Members');
  await page.click('[role="tab"]:has-text("Team")');
  await addTeamMember(page, {
    name: 'Alice Johnson',
    title: 'CEO',
    bio: 'Founder and CEO',
  });
  await expect(page.locator('text=Alice Johnson')).toBeVisible();

  // ===== STEP 9: Add Case Study =====
  console.log('Step 9: Add Case Study');
  await page.click('[role="tab"]:has-text("Case Studies")');
  await addCaseStudy(page, {
    title: 'Major Yacht Refit',
    description: 'Complete refit of 100m superyacht',
    client: 'Confidential',
    year: '2023',
  });
  await expect(page.locator('text=Major Yacht Refit')).toBeVisible();

  // ===== STEP 10: Upgrade to Tier 2 =====
  console.log('Step 10: Upgrade to Tier 2');
  await upgradeTier(page, vendorId, 'tier2');
  await page.goto('/vendor/dashboard/');
  await expect(page.locator('[data-tier="tier2"]')).toBeVisible();

  // ===== STEP 11: Add Locations =====
  console.log('Step 11: Add Locations');
  await page.goto('/vendor/dashboard/profile/');
  await page.click('[role="tab"]:has-text("Locations")');
  await addLocation(page, {
    name: 'Monaco HQ',
    city: 'Monaco',
    country: 'Monaco',
    isHQ: true,
  });
  await addLocation(page, {
    name: 'Barcelona Office',
    city: 'Barcelona',
    country: 'Spain',
  });
  await expect(page.locator('[data-test="location-item"]')).toHaveCount(2);

  // ===== STEP 12: Add Products =====
  console.log('Step 12: Add Products');
  await page.goto('/vendor/dashboard/products/');
  await addProduct(page, {
    name: 'Navigation System Pro',
    description: 'Advanced navigation system',
    category: 'Navigation Systems',
  });
  await expect(page.locator('text=Navigation System Pro')).toBeVisible();

  // ===== STEP 13: Upgrade to Tier 3 =====
  console.log('Step 13: Upgrade to Tier 3');
  await upgradeTier(page, vendorId, 'tier3');
  await page.goto('/vendor/dashboard/');
  await expect(page.locator('[data-tier="tier3"]')).toBeVisible();

  // ===== STEP 14: Enable Featured Placement =====
  console.log('Step 14: Enable Featured');
  await page.goto('/vendor/dashboard/profile/');
  await page.click('[role="tab"]:has-text("Promotion Pack")');
  await page.check('input[name="featured"]');
  await page.click('button:has-text("Save")');

  // ===== STEP 15: View Public Profile =====
  console.log('Step 15: View Public Profile');
  const slug = await page.evaluate(() => {
    const url = new URL(window.location.href);
    return url.searchParams.get('slug');
  });

  await page.goto(`/vendors/${slug || vendorData.companyName.toLowerCase().replace(/\s+/g, '-')}/`);

  // Verify all content is visible
  await expect(page.locator(`h1:has-text("${vendorData.companyName}")`)).toBeVisible();
  await expect(page.locator('[data-tier="tier3"]')).toBeVisible();
  await expect(page.locator('[data-featured="true"]')).toBeVisible();
  await expect(page.locator('text=10 years in business')).toBeVisible(); // 2025 - 2015
  await expect(page.locator('text=ISO 9001:2015')).toBeVisible();
  await expect(page.locator('text=Alice Johnson')).toBeVisible();
  await expect(page.locator('text=Major Yacht Refit')).toBeVisible();
  await expect(page.locator('text=Monaco HQ')).toBeVisible();
  await expect(page.locator('.leaflet-container')).toBeVisible();

  // ===== STEP 16: Verify on Listing Pages =====
  console.log('Step 16: Verify Listings');
  await page.goto('/vendors/');

  // Should be featured (first or near top)
  const featuredVendors = page.locator('[data-featured="true"]');
  await expect(featuredVendors.first()).toContainText(vendorData.companyName);

  // Verify products page
  await page.goto('/products/');
  await expect(page.locator('text=Navigation System Pro')).toBeVisible();

  console.log('✅ E2E Happy Path Complete');
});
```

---

## 14. Test Data Management

### Test Data Helpers

```typescript
// test-helpers.ts

export interface VendorTestData {
  email: string;
  companyName: string;
  password: string;
  contactName?: string;
  contactPhone?: string;
  website?: string;
  description?: string;
  tier?: 'free' | 'tier1' | 'tier2' | 'tier3';
  featured?: boolean;
}

export async function generateUniqueVendorData(
  overrides?: Partial<VendorTestData>
): Promise<VendorTestData> {
  const timestamp = Date.now();
  return {
    email: `vendor-${timestamp}@example.com`,
    companyName: `Test Company ${timestamp}`,
    password: 'SecurePass123!@#',
    contactName: 'Test User',
    contactPhone: '+1-555-0123',
    website: 'https://example.com',
    description: 'Test vendor company description',
    tier: 'free',
    featured: false,
    ...overrides,
  };
}

export async function fillRegistrationForm(
  page: Page,
  data: VendorTestData
): Promise<void> {
  await page.getByPlaceholder('vendor@example.com').fill(data.email);
  await page.getByPlaceholder('Your Company Ltd').fill(data.companyName);
  await page.getByPlaceholder('John Smith').fill(data.contactName || 'Test User');
  await page.getByPlaceholder('+1 (555) 123-4567').fill(data.contactPhone || '+1-555-0123');

  if (data.website) {
    await page.getByPlaceholder('https://example.com').fill(data.website);
  }

  await page.getByPlaceholder('Enter strong password').fill(data.password);
  await page.getByPlaceholder('Re-enter password').fill(data.password);

  if (data.description) {
    await page.getByPlaceholder('Tell us about your company...').fill(data.description);
  }

  await page.getByRole('checkbox', { name: 'Agree to terms and conditions' }).check();
}

export async function createPendingVendor(
  page: Page,
  overrides?: Partial<VendorTestData>
): Promise<VendorTestData & { id: string }> {
  const vendorData = await generateUniqueVendorData(overrides);

  await page.goto('/vendor/register/');
  await fillRegistrationForm(page, vendorData);

  const apiResponse = await page.waitForResponse(
    response => response.url().includes('/api/portal/vendors/register') && response.status() === 201
  );

  await page.click('button[type="submit"]');

  const responseBody = await apiResponse.json();

  return {
    ...vendorData,
    id: responseBody.data.vendorId,
  };
}

export async function approveVendor(
  page: Page,
  vendorId: string
): Promise<void> {
  // Direct database update via API (simulating admin approval)
  await page.evaluate(async ({ id }) => {
    // NOTE: This requires an admin API endpoint or direct DB access
    // Implementation depends on your admin approval mechanism
    await fetch(`/api/admin/vendors/${id}/approve`, {
      method: 'POST',
      credentials: 'include',
    });
  }, { id: vendorId });
}

export async function createAndApproveVendor(
  page: Page,
  overrides?: Partial<VendorTestData>
): Promise<VendorTestData & { id: string; slug: string }> {
  const vendor = await createPendingVendor(page, overrides);
  await approveVendor(page, vendor.id);

  const slug = vendor.companyName.toLowerCase().replace(/\s+/g, '-');

  return { ...vendor, slug };
}

export async function loginVendor(
  page: Page,
  vendor: VendorTestData
): Promise<void> {
  await page.goto('/vendor/login/');
  await page.fill('input[name="email"]', vendor.email);
  await page.fill('input[name="password"]', vendor.password);
  await page.click('button:has-text("Login")');

  await page.waitForURL(/\/vendor\/dashboard\/?/);
}

export async function upgradeTier(
  page: Page,
  vendorId: string,
  tier: 'tier1' | 'tier2' | 'tier3'
): Promise<void> {
  // Direct tier upgrade via API or admin
  await page.evaluate(async ({ id, newTier }) => {
    await fetch(`/api/admin/vendors/${id}/tier`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier: newTier }),
      credentials: 'include',
    });
  }, { id: vendorId, newTier: tier });
}

// ... Additional helper functions for adding certifications, locations, products, etc.
```

---

## 15. Test Utilities & Helpers

### Authentication Helper

```typescript
// auth-helpers.ts

export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/admin/login');
  await page.fill('input[name="email"]', process.env.ADMIN_EMAIL || 'admin@example.com');
  await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD || 'admin123');
  await page.click('button:has-text("Login")');

  await page.waitForURL(/\/admin/);
}

export async function getVendorAuthCookies(
  page: Page,
  context: BrowserContext
): Promise<Cookie[]> {
  return await context.cookies();
}
```

### Assertion Helpers

```typescript
// assertion-helpers.ts

export async function expectToastMessage(
  page: Page,
  message: string | RegExp
): Promise<void> {
  const toast = page.locator('.sonner-toast, [role="status"]').first();
  await expect(toast).toBeVisible({ timeout: 5000 });
  await expect(toast).toContainText(message);
}

export async function expectValidationError(
  page: Page,
  fieldName: string,
  errorMessage: string | RegExp
): Promise<void> {
  const errorLocator = page.locator(`[data-field="${fieldName}"] [role="alert"], text=${errorMessage}`);
  await expect(errorLocator).toBeVisible();
}
```

### Database Helpers

```typescript
// db-helpers.ts

export async function seedProducts(
  page: Page,
  vendorId: string,
  products: Array<{ name: string; description: string }>
): Promise<void> {
  for (const product of products) {
    await page.evaluate(async ({ vendorId, product }) => {
      await fetch('/api/portal/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...product,
          vendorId,
        }),
      });
    }, { vendorId, product });
  }
}

export async function cleanupTestVendors(page: Page): Promise<void> {
  // Cleanup test data after test suite completes
  await page.evaluate(async () => {
    await fetch('/api/test/cleanup-vendors', {
      method: 'DELETE',
      credentials: 'include',
    });
  });
}
```

---

## Test Execution

### Run All Tests

```bash
# Run all vendor onboarding tests
npm run test:e2e -- tests/e2e/vendor-onboarding

# Run specific test suite
npm run test:e2e -- tests/e2e/vendor-onboarding/01-registration.spec.ts

# Run with UI mode for debugging
npm run test:e2e:ui -- tests/e2e/vendor-onboarding

# Run in parallel (4 workers)
npm run test:e2e -- tests/e2e/vendor-onboarding --workers=4

# Generate HTML report
npm run test:e2e -- tests/e2e/vendor-onboarding --reporter=html
```

### CI/CD Integration

```yaml
# .github/workflows/e2e-vendor-onboarding.yml
name: E2E Vendor Onboarding Tests

on:
  pull_request:
    paths:
      - 'app/(site)/vendor/**'
      - 'lib/services/**'
      - 'tests/e2e/vendor-onboarding/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npm run test:e2e -- tests/e2e/vendor-onboarding
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: test-results
          path: test-results/
```

---

## Success Criteria

This test plan is considered complete when:

✅ All 87+ test scenarios pass consistently
✅ Tests run in under 45 minutes (parallel execution)
✅ No flaky tests (>95% pass rate on repeated runs)
✅ All user workflows validated end-to-end
✅ Security and access control verified
✅ Cross-browser testing (Chrome, Firefox, Safari)
✅ Responsive design tested (mobile, tablet, desktop)
✅ CI/CD integration working
✅ Test documentation complete

---

## Next Steps

1. **Implement Test Files**: Create the 12 test suite files in `tests/e2e/vendor-onboarding/`
2. **Build Test Helpers**: Implement all helper functions in `tests/helpers/`
3. **Configure Playwright**: Update `playwright.config.ts` with vendor onboarding settings
4. **Create Test Fixtures**: Add test images, PDFs, and sample data to `test-fixtures/`
5. **Run Initial Test Suite**: Execute tests and fix any failures
6. **Document Results**: Generate test report and update this document
7. **CI/CD Setup**: Integrate tests into GitHub Actions workflow
8. **Handoff to QA**: Provide this document and test files to testing team

---

**Document End**
