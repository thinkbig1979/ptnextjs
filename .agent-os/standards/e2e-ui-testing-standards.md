# E2E UI Testing Standards

> **Version**: 1.0.0 | Agent OS v5.1.0
> **Purpose**: UI-specific E2E test patterns, selectors, and best practices
> **Status**: CANONICAL - Extends @standards/testing-standards.md for UI-specific concerns

---

## Overview

This document provides UI-specific E2E testing patterns that supplement the canonical testing standards. It covers:

1. **UI Selector Standards** - data-testid conventions and accessibility locators
2. **Form Testing Patterns** - Validation, submission, error handling
3. **Navigation Testing Patterns** - Routing, guards, transitions
4. **Component Interaction Patterns** - Modals, dropdowns, accordions
5. **Visual Testing Patterns** - Screenshots, visual regression
6. **Accessibility Testing Patterns** - axe-core, keyboard navigation

---

## 1. UI Selector Standards

### 1.1 Selector Priority Order

Use selectors in this priority order for maximum stability:

| Priority | Selector Type | Example | When to Use |
|----------|--------------|---------|-------------|
| 1 | Role + Name | `getByRole('button', { name: 'Submit' })` | Interactive elements |
| 2 | Label | `getByLabelText('Email')` | Form fields |
| 3 | Text | `getByText('Welcome back')` | Static text content |
| 4 | data-testid | `getByTestId('login-form')` | Complex structures |
| 5 | CSS selector | `.card-header` | Last resort only |

### 1.2 data-testid Convention

```
[feature]-[component]-[element]
```

**Examples**:
```html
<!-- Form -->
<form data-testid="login-form">
  <input data-testid="login-email-input" />
  <input data-testid="login-password-input" />
  <button data-testid="login-submit-button">Login</button>
</form>

<!-- Card -->
<div data-testid="user-card">
  <img data-testid="user-card-avatar" />
  <h3 data-testid="user-card-name">John Doe</h3>
  <button data-testid="user-card-edit-button">Edit</button>
</div>

<!-- List item with index -->
<li data-testid="search-result-0">...</li>
<li data-testid="search-result-1">...</li>
```

### 1.3 Selector Object Pattern

Centralize selectors in a dedicated file:

```typescript
// tests/e2e/selectors/auth.selectors.ts
export const AUTH_SELECTORS = {
  // Forms
  loginForm: '[data-testid="login-form"]',
  registerForm: '[data-testid="register-form"]',

  // Login form fields
  emailInput: '[data-testid="login-email-input"]',
  passwordInput: '[data-testid="login-password-input"]',
  submitButton: '[data-testid="login-submit-button"]',
  forgotPasswordLink: '[data-testid="login-forgot-password-link"]',

  // Error states
  errorMessage: '[data-testid="login-error-message"]',
  fieldError: (field: string) => `[data-testid="login-${field}-error"]`,

  // Success states
  successToast: '[data-testid="auth-success-toast"]',
};

// Usage in test
import { AUTH_SELECTORS } from './selectors/auth.selectors';

test('user can login', async ({ page }) => {
  await page.fill(AUTH_SELECTORS.emailInput, 'user@example.com');
  await page.fill(AUTH_SELECTORS.passwordInput, 'password123');
  await page.click(AUTH_SELECTORS.submitButton);
});
```

### 1.4 Role-Based Selectors

Prefer role-based selectors for better accessibility testing:

```typescript
// Good - uses semantic roles
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByRole('textbox', { name: 'Email' }).fill('user@example.com');
await page.getByRole('link', { name: 'Forgot password?' }).click();
await page.getByRole('heading', { name: 'Welcome' }).isVisible();

// Good - uses labels
await page.getByLabel('Email').fill('user@example.com');
await page.getByLabel('Password').fill('password123');

// Acceptable - uses data-testid for complex structures
await page.getByTestId('user-card').getByRole('button', { name: 'Edit' }).click();

// Avoid - fragile CSS selectors
await page.locator('.btn.btn-primary.submit-btn').click(); // Bad
```

---

## 2. Form Testing Patterns

### 2.1 Basic Form Submission

```typescript
import { test, expect } from '@playwright/test';

test.describe('Login Form', () => {
  test('submits valid form successfully', async ({ page }) => {
    await page.goto('/login');

    // Fill form
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('SecurePass123!');

    // Submit
    await page.getByRole('button', { name: 'Login' }).click();

    // Verify success
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
  });
});
```

### 2.2 Form Validation Testing

```typescript
test.describe('Form Validation', () => {
  test('shows error for empty required fields', async ({ page }) => {
    await page.goto('/register');

    // Submit without filling
    await page.getByRole('button', { name: 'Register' }).click();

    // Verify validation errors
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();

    // Form should not have submitted
    await expect(page).toHaveURL('/register');
  });

  test('validates email format', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel('Email').fill('not-an-email');
    await page.getByLabel('Email').blur(); // Trigger onBlur validation

    await expect(page.getByText('Invalid email address')).toBeVisible();
  });

  test('validates password requirements', async ({ page }) => {
    await page.goto('/register');

    await page.getByLabel('Password').fill('weak');
    await page.getByLabel('Password').blur();

    await expect(page.getByText(/at least 8 characters/i)).toBeVisible();
  });

  test('clears error when field is corrected', async ({ page }) => {
    await page.goto('/register');

    // Trigger error
    await page.getByLabel('Email').fill('invalid');
    await page.getByLabel('Email').blur();
    await expect(page.getByText('Invalid email address')).toBeVisible();

    // Fix error
    await page.getByLabel('Email').fill('valid@example.com');
    await page.getByLabel('Email').blur();
    await expect(page.getByText('Invalid email address')).not.toBeVisible();
  });
});
```

### 2.3 Multi-Step Form (Wizard) Testing

```typescript
test.describe('Onboarding Wizard', () => {
  test('completes all steps', async ({ page }) => {
    await page.goto('/onboarding');

    // Step 1: Personal Info
    await expect(page.getByText('Step 1 of 3')).toBeVisible();
    await page.getByLabel('Full Name').fill('John Doe');
    await page.getByRole('button', { name: 'Next' }).click();

    // Step 2: Preferences
    await expect(page.getByText('Step 2 of 3')).toBeVisible();
    await page.getByLabel('Timezone').selectOption('America/New_York');
    await page.getByRole('button', { name: 'Next' }).click();

    // Step 3: Confirmation
    await expect(page.getByText('Step 3 of 3')).toBeVisible();
    await expect(page.getByText('John Doe')).toBeVisible(); // Review data
    await page.getByRole('button', { name: 'Complete' }).click();

    // Verify completion
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Onboarding complete!')).toBeVisible();
  });

  test('preserves data when navigating back', async ({ page }) => {
    await page.goto('/onboarding');

    // Fill step 1
    await page.getByLabel('Full Name').fill('John Doe');
    await page.getByRole('button', { name: 'Next' }).click();

    // Go back
    await page.getByRole('button', { name: 'Back' }).click();

    // Data should be preserved
    await expect(page.getByLabel('Full Name')).toHaveValue('John Doe');
  });
});
```

### 2.4 Form Error Recovery

```typescript
test.describe('Form Error Recovery', () => {
  test('preserves form data after server error', async ({ page }) => {
    await page.goto('/register');

    // Fill form
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('SecurePass123!');

    // Mock server error
    await page.route('/api/register', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' }),
      });
    });

    await page.getByRole('button', { name: 'Register' }).click();

    // Error should show
    await expect(page.getByText('Something went wrong')).toBeVisible();

    // Form data should be preserved
    await expect(page.getByLabel('Email')).toHaveValue('user@example.com');

    // User can retry
    await page.unroute('/api/register');
    await page.getByRole('button', { name: 'Register' }).click();
    await expect(page).toHaveURL('/dashboard');
  });
});
```

---

## 3. Navigation Testing Patterns

### 3.1 Basic Navigation

```typescript
test.describe('Navigation', () => {
  test('navigates between pages', async ({ page }) => {
    await page.goto('/');

    // Click nav link
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL('/dashboard');

    // Click nav link
    await page.getByRole('link', { name: 'Settings' }).click();
    await expect(page).toHaveURL('/settings');
  });

  test('highlights active nav item', async ({ page }) => {
    await page.goto('/dashboard');

    const dashboardLink = page.getByRole('link', { name: 'Dashboard' });
    await expect(dashboardLink).toHaveAttribute('aria-current', 'page');

    await page.goto('/settings');

    const settingsLink = page.getByRole('link', { name: 'Settings' });
    await expect(settingsLink).toHaveAttribute('aria-current', 'page');
  });
});
```

### 3.2 Protected Routes (Auth Guards)

```typescript
test.describe('Auth Guards', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    // Try to access protected route
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL('/login?redirect=/dashboard');
  });

  test('redirects to intended page after login', async ({ page }) => {
    // Try to access protected route
    await page.goto('/settings');

    // Redirected to login with redirect param
    await expect(page).toHaveURL('/login?redirect=/settings');

    // Login
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Should redirect to intended page
    await expect(page).toHaveURL('/settings');
  });

  test('redirects authenticated users away from login', async ({ page, context }) => {
    // Set auth cookie
    await context.addCookies([{
      name: 'auth_token',
      value: 'valid-token',
      domain: 'localhost',
      path: '/',
    }]);

    // Try to access login
    await page.goto('/login');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
  });
});
```

### 3.3 Breadcrumb Navigation

```typescript
test.describe('Breadcrumbs', () => {
  test('shows correct breadcrumb trail', async ({ page }) => {
    await page.goto('/settings/account/security');

    const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(breadcrumb.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(breadcrumb.getByRole('link', { name: 'Settings' })).toBeVisible();
    await expect(breadcrumb.getByRole('link', { name: 'Account' })).toBeVisible();
    await expect(breadcrumb.getByText('Security')).toBeVisible(); // Current page, not a link
  });

  test('navigates via breadcrumb', async ({ page }) => {
    await page.goto('/settings/account/security');

    await page.getByRole('link', { name: 'Settings' }).click();
    await expect(page).toHaveURL('/settings');
  });
});
```

---

## 4. Component Interaction Patterns

### 4.1 Modal/Dialog Testing

```typescript
test.describe('Modal Interactions', () => {
  test('opens and closes modal', async ({ page }) => {
    await page.goto('/dashboard');

    // Open modal
    await page.getByRole('button', { name: 'Add Item' }).click();
    const modal = page.getByRole('dialog', { name: 'Add New Item' });
    await expect(modal).toBeVisible();

    // Close via X button
    await modal.getByRole('button', { name: 'Close' }).click();
    await expect(modal).not.toBeVisible();
  });

  test('closes modal on backdrop click', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByRole('button', { name: 'Add Item' }).click();
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    // Click backdrop (outside modal)
    await page.locator('[data-testid="modal-backdrop"]').click({ force: true });
    await expect(modal).not.toBeVisible();
  });

  test('closes modal on Escape key', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByRole('button', { name: 'Add Item' }).click();
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });

  test('traps focus within modal', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByRole('button', { name: 'Add Item' }).click();
    const modal = page.getByRole('dialog');

    // First focusable element should be focused
    await expect(modal.getByLabel('Item Name')).toBeFocused();

    // Tab through modal elements
    await page.keyboard.press('Tab');
    await expect(modal.getByLabel('Description')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(modal.getByRole('button', { name: 'Cancel' })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(modal.getByRole('button', { name: 'Save' })).toBeFocused();

    // Tab should wrap to first element
    await page.keyboard.press('Tab');
    await expect(modal.getByLabel('Item Name')).toBeFocused();
  });
});
```

### 4.2 Dropdown/Menu Testing

```typescript
test.describe('Dropdown Menu', () => {
  test('opens on click', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByRole('button', { name: 'Options' }).click();
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();
  });

  test('selects item and closes', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByRole('button', { name: 'Options' }).click();
    await page.getByRole('menuitem', { name: 'Edit' }).click();

    // Menu should close
    await expect(page.getByRole('menu')).not.toBeVisible();
  });

  test('supports keyboard navigation', async ({ page }) => {
    await page.goto('/dashboard');

    // Open with keyboard
    await page.getByRole('button', { name: 'Options' }).focus();
    await page.keyboard.press('Enter');

    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();

    // Navigate with arrows
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitem', { name: 'Edit' })).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitem', { name: 'Delete' })).toBeFocused();

    // Select with Enter
    await page.keyboard.press('Enter');
    await expect(menu).not.toBeVisible();
  });
});
```

### 4.3 Accordion/Disclosure Testing

```typescript
test.describe('Accordion', () => {
  test('expands and collapses sections', async ({ page }) => {
    await page.goto('/faq');

    const section = page.getByRole('button', { name: 'What is your return policy?' });

    // Initially collapsed
    await expect(page.getByText('30 days money back guarantee')).not.toBeVisible();

    // Expand
    await section.click();
    await expect(page.getByText('30 days money back guarantee')).toBeVisible();

    // Collapse
    await section.click();
    await expect(page.getByText('30 days money back guarantee')).not.toBeVisible();
  });

  test('supports keyboard activation', async ({ page }) => {
    await page.goto('/faq');

    const section = page.getByRole('button', { name: 'What is your return policy?' });

    await section.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText('30 days money back guarantee')).toBeVisible();

    await page.keyboard.press('Space');
    await expect(page.getByText('30 days money back guarantee')).not.toBeVisible();
  });
});
```

### 4.4 Toast/Notification Testing

```typescript
test.describe('Toast Notifications', () => {
  test('shows success toast after action', async ({ page }) => {
    await page.goto('/settings');

    await page.getByLabel('Display Name').fill('New Name');
    await page.getByRole('button', { name: 'Save' }).click();

    // Toast should appear
    const toast = page.getByRole('alert');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('Settings saved');

    // Toast should auto-dismiss
    await expect(toast).not.toBeVisible({ timeout: 6000 });
  });

  test('toast can be manually dismissed', async ({ page }) => {
    await page.goto('/settings');

    await page.getByLabel('Display Name').fill('New Name');
    await page.getByRole('button', { name: 'Save' }).click();

    const toast = page.getByRole('alert');
    await expect(toast).toBeVisible();

    await toast.getByRole('button', { name: 'Dismiss' }).click();
    await expect(toast).not.toBeVisible();
  });
});
```

---

## 5. Visual Testing Patterns

### 5.1 Screenshot Comparison

```typescript
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('dashboard matches snapshot', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for async content
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await expect(page).toHaveScreenshot('dashboard.png', {
      maxDiffPixels: 100, // Allow minor differences
    });
  });

  test('component in all states', async ({ page }) => {
    await page.goto('/components/button');

    // Default state
    await expect(page.getByTestId('button-default')).toHaveScreenshot('button-default.png');

    // Hover state
    await page.getByTestId('button-default').hover();
    await expect(page.getByTestId('button-default')).toHaveScreenshot('button-hover.png');

    // Focus state
    await page.getByTestId('button-default').focus();
    await expect(page.getByTestId('button-default')).toHaveScreenshot('button-focus.png');

    // Disabled state
    await expect(page.getByTestId('button-disabled')).toHaveScreenshot('button-disabled.png');
  });
});
```

### 5.2 Responsive Snapshots

```typescript
test.describe('Responsive Design', () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 720 },
  ];

  for (const { name, width, height } of viewports) {
    test(`dashboard renders correctly on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot(`dashboard-${name}.png`);
    });
  }
});
```

---

## 6. Accessibility Testing Patterns

### 6.1 axe-core Integration

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('page has no accessibility violations', async ({ page }) => {
    await page.goto('/dashboard');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa']) // WCAG 2.1 AA
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('form has no accessibility violations', async ({ page }) => {
    await page.goto('/register');

    const results = await new AxeBuilder({ page })
      .include('[data-testid="register-form"]')
      .analyze();

    expect(results.violations).toEqual([]);
  });

  // Exclude known issues temporarily
  test('page with known issues', async ({ page }) => {
    await page.goto('/legacy-page');

    const results = await new AxeBuilder({ page })
      .disableRules(['color-contrast']) // Known issue, tracked in #123
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
```

### 6.2 Keyboard Navigation Testing

```typescript
test.describe('Keyboard Navigation', () => {
  test('can complete form with keyboard only', async ({ page }) => {
    await page.goto('/login');

    // Tab to email field
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Email')).toBeFocused();

    // Type email
    await page.keyboard.type('user@example.com');

    // Tab to password field
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Password')).toBeFocused();

    // Type password
    await page.keyboard.type('password123');

    // Tab to submit button
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Login' })).toBeFocused();

    // Submit with Enter
    await page.keyboard.press('Enter');

    // Verify success
    await expect(page).toHaveURL('/dashboard');
  });

  test('skip link works', async ({ page }) => {
    await page.goto('/');

    // Tab to skip link
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();

    // Activate skip link
    await page.keyboard.press('Enter');

    // Focus should be on main content
    await expect(page.getByRole('main')).toBeFocused();
  });
});
```

### 6.3 Screen Reader Announcements

```typescript
test.describe('Screen Reader Support', () => {
  test('loading state is announced', async ({ page }) => {
    await page.goto('/data-page');

    // During loading
    const loadingRegion = page.getByRole('status');
    await expect(loadingRegion).toHaveText('Loading data...');
    await expect(loadingRegion).toHaveAttribute('aria-busy', 'true');

    // After loading
    await page.waitForLoadState('networkidle');
    await expect(loadingRegion).toHaveAttribute('aria-busy', 'false');
  });

  test('form errors are announced', async ({ page }) => {
    await page.goto('/register');

    await page.getByRole('button', { name: 'Register' }).click();

    // Error alert should exist
    const errorSummary = page.getByRole('alert');
    await expect(errorSummary).toBeVisible();
    await expect(errorSummary).toContainText('Please fix the following errors');
  });

  test('dynamic content changes are announced', async ({ page }) => {
    await page.goto('/notifications');

    // Delete notification
    await page.getByRole('button', { name: 'Delete notification' }).first().click();

    // Status should announce change
    const status = page.getByRole('status');
    await expect(status).toHaveText('Notification deleted');
  });
});
```

---

## 7. Common Anti-Patterns to Avoid

### 7.1 Fragile Selectors

```typescript
// BAD - Fragile CSS selectors
await page.locator('.btn.btn-primary.submit-btn').click();
await page.locator('#app > div > div:nth-child(2) > form > button').click();

// GOOD - Semantic selectors
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByTestId('login-submit').click();
```

### 7.2 Hardcoded Waits

```typescript
// BAD - Hardcoded timeout
await page.waitForTimeout(3000);

// GOOD - Wait for specific condition
await page.waitForLoadState('networkidle');
await expect(page.getByText('Loading')).not.toBeVisible();
await page.waitForResponse('/api/data');
```

### 7.3 Ignoring Accessibility

```typescript
// BAD - Clicking by coordinates
await page.mouse.click(100, 200);

// GOOD - Click by accessible name
await page.getByRole('button', { name: 'Submit' }).click();
```

### 7.4 Testing Implementation Details

```typescript
// BAD - Testing internal state
expect(component.state.isLoading).toBe(false);

// GOOD - Testing user-visible behavior
await expect(page.getByText('Loading...')).not.toBeVisible();
await expect(page.getByTestId('data-table')).toBeVisible();
```

---

## 8. Related Documents

| Document | Purpose |
|----------|---------|
| `@standards/testing-standards.md` | Canonical testing standards |
| `@instructions/utilities/ui-component-testing-strategy.md` | Test type decision tree |
| `@instructions/utilities/e2e-test-placement-checklist.md` | E2E tier assignment |
| `@instructions/utilities/ui-acceptance-criteria-checklist.md` | Component acceptance criteria |
| `~/.claude/skills/e2e-test-repair/` | E2E repair patterns |
