# E2E Test Patterns and Scenarios (Playwright)

## Document Information
- **Project**: Payload CMS Vendor Enrollment
- **Phase**: Phase 4: Frontend-Backend Integration
- **Test Framework**: Playwright
- **Created**: 2025-10-12
- **Version**: 1.0.0

---

## Executive Summary

This document defines end-to-end (E2E) test patterns and scenarios using Playwright for the vendor enrollment system. E2E tests validate complete user workflows across the entire application stack, from frontend UI interactions to backend API responses and database persistence.

---

## E2E Testing Philosophy

### What E2E Tests Validate
- ✅ Complete user workflows (registration → approval → login → dashboard)
- ✅ Frontend-backend integration
- ✅ Database persistence
- ✅ Authentication and authorization
- ✅ Cross-browser compatibility
- ✅ Real API responses (not mocked)
- ✅ Page navigation and routing
- ✅ Form submissions with validation
- ✅ Error handling across the stack

### What E2E Tests Don't Validate
- ❌ Unit-level component behavior (covered by component tests)
- ❌ API endpoint logic (covered by integration tests)
- ❌ Edge cases and error branches (covered by unit tests)
- ❌ Performance testing (separate performance suite)

---

## Critical User Workflows

### Workflow 1: Complete Vendor Enrollment Journey

**Scenario**: New vendor registers, gets approved by admin, logs in, and edits profile

```gherkin
Feature: Vendor Enrollment Journey

  Scenario: Complete vendor enrollment and profile setup
    Given the application is running
    And the database is clean

    When I navigate to the registration page
    And I fill in the registration form:
      | Field          | Value                    |
      | Email          | newvendor@example.com    |
      | Password       | StrongPass123!@#         |
      | Company Name   | Test Marine Tech         |
      | Contact Name   | John Doe                 |
      | Phone          | +1-555-0123              |
      | Website        | https://testmarine.com   |
    And I submit the registration form

    Then I should see a success message "Registration successful"
    And I should see "Your account is pending approval"
    And the vendor should exist in the database with status "pending"

    # Admin approval
    When I log in as admin
    And I navigate to the admin approval queue
    Then I should see "Test Marine Tech" in the pending vendors list

    When I click approve for "Test Marine Tech"
    And I confirm the approval
    Then I should see "Vendor approved successfully"
    And the vendor status should be "approved" in the database

    # Vendor login
    When I log out
    And I navigate to the vendor login page
    And I log in with:
      | Email          | newvendor@example.com    |
      | Password       | StrongPass123!@#         |
    Then I should be redirected to the vendor dashboard
    And I should see "Welcome, Test Marine Tech"

    # Profile editing
    When I navigate to profile editor
    And I update the company description to "Leading provider of marine technology"
    And I save the profile
    Then I should see "Profile updated successfully"
    And the company description should be "Leading provider of marine technology" in the database
```

**Implementation** (`__tests__/e2e/complete-vendor-journey.spec.ts`):
```typescript
import { test, expect } from '@playwright/test';
import { cleanDatabase, createAdminUser } from '../utils/e2e-helpers';

test.describe('Complete Vendor Enrollment Journey', () => {
  test.beforeEach(async () => {
    await cleanDatabase();
    await createAdminUser();
  });

  test('vendor registers, gets approved, logs in, and edits profile', async ({ page }) => {
    // Registration
    await page.goto('/vendors/register');
    await page.fill('[name="email"]', 'newvendor@example.com');
    await page.fill('[name="password"]', 'StrongPass123!@#');
    await page.fill('[name="companyName"]', 'Test Marine Tech');
    await page.fill('[name="contactName"]', 'John Doe');
    await page.fill('[name="phone"]', '+1-555-0123');
    await page.fill('[name="website"]', 'https://testmarine.com');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Registration successful')).toBeVisible();
    await expect(page.locator('text=Your account is pending approval')).toBeVisible();

    // Admin approval
    await page.goto('/admin/login');
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'Admin123!@#');
    await page.click('button[type="submit"]');

    await page.goto('/admin/approval-queue');
    await expect(page.locator('text=Test Marine Tech')).toBeVisible();

    await page.click('button[data-vendor="Test Marine Tech"][data-action="approve"]');
    await page.click('button[data-confirm="approve"]');
    await expect(page.locator('text=Vendor approved successfully')).toBeVisible();

    // Vendor login
    await page.goto('/auth/logout');
    await page.goto('/vendors/login');
    await page.fill('[name="email"]', 'newvendor@example.com');
    await page.fill('[name="password"]', 'StrongPass123!@#');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/vendors/dashboard');
    await expect(page.locator('text=Welcome, Test Marine Tech')).toBeVisible();

    // Profile editing
    await page.click('a[href="/vendors/profile"]');
    await page.fill('[name="description"]', 'Leading provider of marine technology');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Profile updated successfully')).toBeVisible();
  });
});
```

### Workflow 2: Vendor Registration with Validation Errors

**Scenario**: Vendor attempts registration with invalid data and corrects errors

```gherkin
Feature: Vendor Registration Validation

  Scenario: Registration form validates inputs correctly
    Given I am on the registration page

    When I submit the form without filling any fields
    Then I should see validation errors:
      | Field          | Error Message                          |
      | Email          | Email is required                      |
      | Password       | Password is required                   |
      | Company Name   | Company name is required               |

    When I fill in email as "invalid-email"
    And I submit the form
    Then I should see "Please enter a valid email address"

    When I fill in password as "weak"
    And I submit the form
    Then I should see "Password must be at least 12 characters"

    When I fill in valid email and password
    And I submit the form
    Then the registration should succeed
```

**Implementation** (`__tests__/e2e/registration-validation.spec.ts`):
```typescript
test.describe('Registration Validation', () => {
  test('validates all required fields', async ({ page }) => {
    await page.goto('/vendors/register');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
    await expect(page.locator('text=Company name is required')).toBeVisible();
  });

  test('validates email format', async ({ page }) => {
    await page.goto('/vendors/register');
    await page.fill('[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
  });

  test('validates password strength', async ({ page }) => {
    await page.goto('/vendors/register');
    await page.fill('[name="password"]', 'weak');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Password must be at least 12 characters')).toBeVisible();
  });
});
```

### Workflow 3: Admin Rejects Vendor

**Scenario**: Admin rejects a pending vendor registration

```gherkin
Feature: Vendor Rejection

  Scenario: Admin rejects pending vendor
    Given a vendor "Rejected Marine" is pending approval
    And I am logged in as admin

    When I navigate to the approval queue
    And I click reject for "Rejected Marine"
    And I confirm the rejection
    Then I should see "Vendor rejected successfully"
    And the vendor status should be "rejected" in the database

    When I log out
    And I attempt to log in as "Rejected Marine"
    Then I should see "Your account has been rejected"
    And I should not be able to access the dashboard
```

**Implementation** (`__tests__/e2e/vendor-rejection.spec.ts`):
```typescript
test.describe('Vendor Rejection', () => {
  test.beforeEach(async () => {
    await createPendingVendor({
      email: 'rejected@example.com',
      companyName: 'Rejected Marine',
      password: 'StrongPass123!@#'
    });
  });

  test('admin rejects pending vendor', async ({ page }) => {
    // Admin login
    await page.goto('/admin/login');
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'Admin123!@#');
    await page.click('button[type="submit"]');

    // Navigate to approval queue
    await page.goto('/admin/approval-queue');
    await expect(page.locator('text=Rejected Marine')).toBeVisible();

    // Reject vendor
    await page.click('button[data-vendor="Rejected Marine"][data-action="reject"]');
    await page.click('button[data-confirm="reject"]');
    await expect(page.locator('text=Vendor rejected successfully')).toBeVisible();

    // Attempt to log in as rejected vendor
    await page.goto('/auth/logout');
    await page.goto('/vendors/login');
    await page.fill('[name="email"]', 'rejected@example.com');
    await page.fill('[name="password"]', 'StrongPass123!@#');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Your account has been rejected')).toBeVisible();
    await expect(page).not.toHaveURL('/vendors/dashboard');
  });
});
```

### Workflow 4: Tier-Based Feature Access

**Scenario**: Vendors access features based on their tier

```gherkin
Feature: Tier-Based Feature Access

  Scenario: Free tier vendor sees upgrade prompts
    Given I am logged in as a free tier vendor
    When I navigate to the profile editor
    Then I should see basic fields enabled
    And I should see tier1 fields disabled
    And I should see "Upgrade to Tier 1" message

  Scenario: Tier2 vendor has full access
    Given I am logged in as a tier2 vendor
    When I navigate to the profile editor
    Then I should see all fields enabled
    And I should not see any upgrade messages
    And I can edit advanced features
```

**Implementation** (`__tests__/e2e/tier-restrictions.spec.ts`):
```typescript
test.describe('Tier-Based Feature Access', () => {
  test('free tier vendor sees upgrade prompts', async ({ page }) => {
    await createAndLoginVendor(page, { tier: 'free' });

    await page.goto('/vendors/profile');

    // Basic fields enabled
    await expect(page.locator('[name="companyName"]')).toBeEnabled();
    await expect(page.locator('[name="description"]')).toBeEnabled();

    // Tier1 fields disabled
    await expect(page.locator('[name="certifications"]')).toBeDisabled();
    await expect(page.locator('text=Upgrade to Tier 1')).toBeVisible();
  });

  test('tier2 vendor has full access', async ({ page }) => {
    await createAndLoginVendor(page, { tier: 'tier2' });

    await page.goto('/vendors/profile');

    // All fields enabled
    await expect(page.locator('[name="companyName"]')).toBeEnabled();
    await expect(page.locator('[name="certifications"]')).toBeEnabled();
    await expect(page.locator('[name="caseStudies"]')).toBeEnabled();

    // No upgrade messages
    await expect(page.locator('text=Upgrade')).not.toBeVisible();
  });
});
```

### Workflow 5: Authentication and Session Management

**Scenario**: User session is managed correctly across navigation

```gherkin
Feature: Session Management

  Scenario: User session persists across page navigation
    Given I am logged in as a vendor
    When I navigate to the dashboard
    Then I should see my vendor information

    When I navigate to the profile editor
    Then I should still be authenticated
    And I should see my profile data

    When I refresh the page
    Then I should still be authenticated
    And I should see my profile data

  Scenario: User is redirected to login when token expires
    Given I am logged in as a vendor
    And my session token has expired
    When I navigate to the dashboard
    Then I should be redirected to the login page
    And I should see "Session expired. Please log in again."

  Scenario: User can log out successfully
    Given I am logged in as a vendor
    When I click the logout button
    Then I should be redirected to the login page
    And I should not be able to access the dashboard without logging in
```

**Implementation** (`__tests__/e2e/session-management.spec.ts`):
```typescript
test.describe('Session Management', () => {
  test('session persists across navigation', async ({ page }) => {
    await createAndLoginVendor(page);

    await page.goto('/vendors/dashboard');
    await expect(page.locator('text=Test Vendor')).toBeVisible();

    await page.goto('/vendors/profile');
    await expect(page.locator('[name="companyName"]')).toHaveValue('Test Vendor');

    await page.reload();
    await expect(page).toHaveURL('/vendors/profile');
    await expect(page.locator('[name="companyName"]')).toHaveValue('Test Vendor');
  });

  test('redirects to login when session expires', async ({ page, context }) => {
    await createAndLoginVendor(page);

    // Clear cookies to simulate expired session
    await context.clearCookies();

    await page.goto('/vendors/dashboard');
    await expect(page).toHaveURL('/vendors/login');
    await expect(page.locator('text=Session expired')).toBeVisible();
  });

  test('logout clears session', async ({ page }) => {
    await createAndLoginVendor(page);

    await page.goto('/vendors/dashboard');
    await page.click('button[data-action="logout"]');

    await expect(page).toHaveURL('/vendors/login');

    // Attempt to access dashboard
    await page.goto('/vendors/dashboard');
    await expect(page).toHaveURL('/vendors/login');
  });
});
```

---

## Page Object Model (POM) Pattern

### Benefits of Page Object Model
- ✅ Reduces code duplication
- ✅ Improves test maintainability
- ✅ Centralizes locator definitions
- ✅ Makes tests more readable
- ✅ Simplifies test refactoring

### Example: Registration Page Object

```typescript
// __tests__/e2e/pages/RegistrationPage.ts
import { Page, expect } from '@playwright/test';

export class RegistrationPage {
  constructor(private page: Page) {}

  // Locators
  private emailInput = '[name="email"]';
  private passwordInput = '[name="password"]';
  private companyNameInput = '[name="companyName"]';
  private contactNameInput = '[name="contactName"]';
  private phoneInput = '[name="phone"]';
  private websiteInput = '[name="website"]';
  private submitButton = 'button[type="submit"]';
  private successMessage = 'text=Registration successful';
  private errorMessage = '[role="alert"]';

  // Actions
  async goto() {
    await this.page.goto('/vendors/register');
  }

  async fillEmail(email: string) {
    await this.page.fill(this.emailInput, email);
  }

  async fillPassword(password: string) {
    await this.page.fill(this.passwordInput, password);
  }

  async fillCompanyName(companyName: string) {
    await this.page.fill(this.companyNameInput, companyName);
  }

  async fillContactName(contactName: string) {
    await this.page.fill(this.contactNameInput, contactName);
  }

  async fillPhone(phone: string) {
    await this.page.fill(this.phoneInput, phone);
  }

  async fillWebsite(website: string) {
    await this.page.fill(this.websiteInput, website);
  }

  async fillForm(data: {
    email: string;
    password: string;
    companyName: string;
    contactName: string;
    phone: string;
    website: string;
  }) {
    await this.fillEmail(data.email);
    await this.fillPassword(data.password);
    await this.fillCompanyName(data.companyName);
    await this.fillContactName(data.contactName);
    await this.fillPhone(data.phone);
    await this.fillWebsite(data.website);
  }

  async submit() {
    await this.page.click(this.submitButton);
  }

  // Assertions
  async expectSuccessMessage() {
    await expect(this.page.locator(this.successMessage)).toBeVisible();
  }

  async expectErrorMessage(message: string) {
    await expect(this.page.locator(`text=${message}`)).toBeVisible();
  }

  async expectValidationError(field: string, message: string) {
    const errorLocator = `[data-field="${field}"] ${this.errorMessage}`;
    await expect(this.page.locator(errorLocator)).toContainText(message);
  }
}
```

### Example: Login Page Object

```typescript
// __tests__/e2e/pages/LoginPage.ts
import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  private emailInput = '[name="email"]';
  private passwordInput = '[name="password"]';
  private submitButton = 'button[type="submit"]';
  private errorMessage = '[role="alert"]';

  async goto() {
    await this.page.goto('/vendors/login');
  }

  async login(email: string, password: string) {
    await this.page.fill(this.emailInput, email);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.submitButton);
  }

  async expectRedirectToDashboard() {
    await expect(this.page).toHaveURL('/vendors/dashboard');
  }

  async expectErrorMessage(message: string) {
    await expect(this.page.locator(`text=${message}`)).toBeVisible();
  }
}
```

### Using Page Objects in Tests

```typescript
test('vendor registration with page objects', async ({ page }) => {
  const registrationPage = new RegistrationPage(page);

  await registrationPage.goto();
  await registrationPage.fillForm({
    email: 'vendor@example.com',
    password: 'StrongPass123!@#',
    companyName: 'Test Marine',
    contactName: 'John Doe',
    phone: '+1-555-0123',
    website: 'https://testmarine.com'
  });
  await registrationPage.submit();
  await registrationPage.expectSuccessMessage();
});
```

---

## Test Data Setup and Teardown

### Database Cleanup Strategy

```typescript
// __tests__/utils/e2e-helpers.ts
import { getPayloadClient } from '@/lib/payload-client';

export async function cleanDatabase() {
  const payload = await getPayloadClient();

  // Delete all test vendors
  await payload.delete({
    collection: 'vendors',
    where: {
      email: {
        contains: '@example.com'
      }
    }
  });

  // Delete all test users
  await payload.delete({
    collection: 'users',
    where: {
      email: {
        contains: '@example.com'
      }
    }
  });
}

export async function createAdminUser() {
  const payload = await getPayloadClient();

  return await payload.create({
    collection: 'users',
    data: {
      email: 'admin@example.com',
      password: 'Admin123!@#',
      role: 'admin'
    }
  });
}

export async function createPendingVendor(data: {
  email: string;
  companyName: string;
  password: string;
}) {
  const payload = await getPayloadClient();

  const user = await payload.create({
    collection: 'users',
    data: {
      email: data.email,
      password: data.password,
      role: 'vendor'
    }
  });

  return await payload.create({
    collection: 'vendors',
    data: {
      user: user.id,
      companyName: data.companyName,
      approvalStatus: 'pending',
      tier: 'free'
    }
  });
}

export async function createApprovedVendor(data: {
  email: string;
  companyName: string;
  password: string;
  tier?: 'free' | 'tier1' | 'tier2';
}) {
  const payload = await getPayloadClient();

  const user = await payload.create({
    collection: 'users',
    data: {
      email: data.email,
      password: data.password,
      role: 'vendor'
    }
  });

  return await payload.create({
    collection: 'vendors',
    data: {
      user: user.id,
      companyName: data.companyName,
      approvalStatus: 'approved',
      tier: data.tier || 'free'
    }
  });
}
```

### Test Fixtures

```typescript
// __tests__/fixtures/e2e-vendors.ts
export const E2E_VENDORS = {
  freeTier: {
    email: 'free-tier@example.com',
    password: 'StrongPass123!@#',
    companyName: 'Free Tier Marine',
    tier: 'free' as const
  },
  tier1: {
    email: 'tier1@example.com',
    password: 'StrongPass123!@#',
    companyName: 'Tier 1 Marine',
    tier: 'tier1' as const
  },
  tier2: {
    email: 'tier2@example.com',
    password: 'StrongPass123!@#',
    companyName: 'Tier 2 Marine',
    tier: 'tier2' as const
  },
  admin: {
    email: 'admin@example.com',
    password: 'Admin123!@#',
    role: 'admin' as const
  }
};
```

---

## Cross-Browser Testing Configuration

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

---

## Accessibility Testing Integration

### Example: Axe-core Integration

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('registration page has no accessibility violations', async ({ page }) => {
    await page.goto('/vendors/register');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('dashboard has no accessibility violations', async ({ page }) => {
    await createAndLoginVendor(page);
    await page.goto('/vendors/dashboard');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

---

## Visual Regression Testing (Optional)

### Example: Snapshot Testing

```typescript
test.describe('Visual Regression Tests', () => {
  test('registration page matches snapshot', async ({ page }) => {
    await page.goto('/vendors/register');
    await expect(page).toHaveScreenshot('registration-page.png');
  });

  test('dashboard matches snapshot', async ({ page }) => {
    await createAndLoginVendor(page);
    await page.goto('/vendors/dashboard');
    await expect(page).toHaveScreenshot('dashboard.png');
  });
});
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Start database
        run: docker-compose up -d postgres

      - name: Run E2E tests
        run: npm run test:e2e

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

---

## Test Execution Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test __tests__/e2e/complete-vendor-journey.spec.ts

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests in specific browser
npx playwright test --project=chromium

# Run tests with UI mode (interactive)
npx playwright test --ui

# Debug specific test
npx playwright test --debug __tests__/e2e/registration-validation.spec.ts

# Generate test report
npx playwright show-report
```

---

## Best Practices for E2E Tests

### DO ✅

1. **Use data-testid for stability**
   ```typescript
   await page.click('[data-testid="submit-button"]');
   ```

2. **Wait for network requests**
   ```typescript
   await Promise.all([
     page.waitForResponse(resp => resp.url().includes('/api/vendors/register')),
     page.click('button[type="submit"]')
   ]);
   ```

3. **Use fixtures for test data**
   ```typescript
   test.beforeEach(async () => {
     await createApprovedVendor(E2E_VENDORS.tier2);
   });
   ```

4. **Clean up after tests**
   ```typescript
   test.afterEach(async () => {
     await cleanDatabase();
   });
   ```

5. **Use page objects for reusability**

### DON'T ❌

1. **Don't use hard-coded waits**
   ```typescript
   // ❌ Bad
   await page.waitForTimeout(3000);

   // ✅ Good
   await page.waitForSelector('[data-testid="success-message"]');
   ```

2. **Don't test unit-level logic**
   - E2E tests should focus on user workflows
   - Leave unit testing to Jest/RTL

3. **Don't make tests dependent on each other**
   - Each test should be independent
   - Use beforeEach for setup

4. **Don't ignore flaky tests**
   - Fix the root cause
   - Don't just increase retries

5. **Don't test every edge case**
   - Focus on critical paths
   - Leave edge cases to unit tests

---

## Next Steps

1. **Implement Page Objects** for all pages
2. **Implement E2E Test Helpers** (database cleanup, test data creation)
3. **Configure Playwright** with browsers and settings
4. **Implement Critical Workflows** (5 scenarios defined above)
5. **Integrate with CI/CD** for automated testing
6. **Set up Visual Regression** testing (optional)
7. **Add Accessibility Testing** with axe-core

---

## References

- [Playwright Documentation](https://playwright.dev/)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Axe-core Accessibility Testing](https://github.com/dequelabs/axe-core)
- [Frontend Test Strategy](./frontend-test-strategy.md)

---

**Document Status**: ✅ Complete
**Next Document**: Test Coverage Plan
**Related**: Frontend Test Strategy, Component Test Templates
