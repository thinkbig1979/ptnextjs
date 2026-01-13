---
version: 5.1.0
last-updated: 2026-01-02
related-files:
  - standards/testing-standards.md
---


# E2E UI Testing Standards

**Version**: 1.0.0 | Agent OS v5.1.0
**Purpose**: UI-specific E2E test patterns extending `@standards/testing-standards.md`

---

## 1. Selector Standards

### Priority Order

| Priority | Type | Example | Use When |
|----------|------|---------|----------|
| 1 | Role + Name | `getByRole('button', { name: 'Submit' })` | Interactive elements |
| 2 | Label | `getByLabelText('Email')` | Form fields |
| 3 | Text | `getByText('Welcome back')` | Static text |
| 4 | data-testid | `getByTestId('login-form')` | Complex structures |
| 5 | CSS | `.card-header` | Last resort |

### data-testid Convention

Pattern: `[feature]-[component]-[element]`

```html
<form data-testid="login-form">
  <input data-testid="login-email-input" />
  <button data-testid="login-submit-button">Login</button>
</form>
```

### Selector Object Pattern

```typescript
// tests/e2e/selectors/auth.selectors.ts
export const AUTH_SELECTORS = {
  loginForm: '[data-testid="login-form"]',
  emailInput: '[data-testid="login-email-input"]',
  submitButton: '[data-testid="login-submit-button"]',
  fieldError: (field: string) => `[data-testid="login-${field}-error"]`,
};
```

---

## 2. Form Testing Patterns

### Basic Submission

```typescript
test('submits valid form', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('SecurePass123!');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL('/dashboard');
});
```

### Validation Testing

```typescript
test('shows error for empty required fields', async ({ page }) => {
  await page.goto('/register');
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.getByText('Email is required')).toBeVisible();
});

test('clears error when field corrected', async ({ page }) => {
  await page.getByLabel('Email').fill('invalid');
  await page.getByLabel('Email').blur();
  await expect(page.getByText('Invalid email')).toBeVisible();

  await page.getByLabel('Email').fill('valid@example.com');
  await expect(page.getByText('Invalid email')).not.toBeVisible();
});
```

---

## 3. Navigation Testing

### Basic Navigation

```typescript
test('navigates between pages', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await expect(page).toHaveURL('/dashboard');
});
```

### Auth Guards

```typescript
test('redirects unauthenticated to login', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL('/login?redirect=/dashboard');
});

test('redirects to intended page after login', async ({ page }) => {
  await page.goto('/settings');
  await expect(page).toHaveURL('/login?redirect=/settings');
  // ...login...
  await expect(page).toHaveURL('/settings');
});
```

---

## 4. Component Interaction Patterns

### Modal/Dialog

```typescript
test('opens and closes modal', async ({ page }) => {
  await page.getByRole('button', { name: 'Add Item' }).click();
  const modal = page.getByRole('dialog');
  await expect(modal).toBeVisible();

  await modal.getByRole('button', { name: 'Close' }).click();
  await expect(modal).not.toBeVisible();
});

test('closes on Escape', async ({ page }) => {
  await page.getByRole('button', { name: 'Add Item' }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('traps focus within modal', async ({ page }) => {
  await page.getByRole('button', { name: 'Add Item' }).click();
  const modal = page.getByRole('dialog');
  await expect(modal.getByLabel('Item Name')).toBeFocused();
  // Tab through, should wrap back to first element
});
```

### Dropdown/Menu

```typescript
test('keyboard navigation', async ({ page }) => {
  await page.getByRole('button', { name: 'Options' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menu')).toBeVisible();

  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem', { name: 'Edit' })).toBeFocused();
});
```

---

## 5. Visual Testing

### Screenshot Comparison

```typescript
test('dashboard matches snapshot', async ({ page }) => {
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveScreenshot('dashboard.png', { maxDiffPixels: 100 });
});
```

### Responsive Snapshots

```typescript
const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 720 },
];

for (const { name, width, height } of viewports) {
  test(`renders correctly on ${name}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/dashboard');
    await expect(page).toHaveScreenshot(`dashboard-${name}.png`);
  });
}
```

---

## 6. Accessibility Testing

### axe-core Integration

```typescript
import AxeBuilder from '@axe-core/playwright';

test('page has no a11y violations', async ({ page }) => {
  await page.goto('/dashboard');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

### Keyboard Navigation

```typescript
test('form completable with keyboard only', async ({ page }) => {
  await page.goto('/login');
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Email')).toBeFocused();
  await page.keyboard.type('user@example.com');
  await page.keyboard.press('Tab');
  await page.keyboard.type('password123');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/dashboard');
});
```

---

## 7. Anti-Patterns

| Bad | Good |
|-----|------|
| `.btn.btn-primary.submit-btn` | `getByRole('button', { name: 'Submit' })` |
| `page.waitForTimeout(3000)` | `page.waitForLoadState('networkidle')` |
| `page.mouse.click(100, 200)` | `getByRole('button', { name: 'X' }).click()` |
| `component.state.isLoading` | `expect(page.getByText('Loading')).not.toBeVisible()` |

---

## Related Documents

| Document | Purpose |
|----------|---------|
| `@standards/testing-standards.md` | Canonical testing standards |
| `@instructions/utilities/ui-component-testing-strategy.md` | Test type decision tree |
| `@instructions/utilities/e2e-test-placement-checklist.md` | E2E tier assignment |
