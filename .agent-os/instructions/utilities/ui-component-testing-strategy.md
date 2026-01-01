# UI Component Testing Strategy

> **Version**: 1.0.0 | Agent OS v5.1.0
> **Purpose**: Decision tree for determining test type (unit vs integration vs E2E) for UI components
> **Status**: CANONICAL - Referenced by create-tasks.md and execute-tasks.md

---

## Overview

This document provides definitive guidance on what type of tests to create for different UI components and scenarios. Following this strategy ensures:

1. **Right test for the job** - Unit tests for logic, E2E for workflows
2. **No redundant coverage** - Avoid testing the same thing multiple ways
3. **Fast feedback** - Unit tests run in milliseconds, E2E in seconds
4. **Maintainable tests** - Clear ownership and location

---

## 1. Decision Tree: Which Test Type?

```
START: What are you testing?
│
├─► COMPONENT LOGIC (props, state, computed values)
│   └─► UNIT TEST (co-located: Component.test.tsx)
│
├─► COMPONENT RENDERING (visual output, conditional display)
│   └─► Is it isolated from external dependencies?
│       ├─► YES → UNIT TEST (with mocked children)
│       └─► NO  → INTEGRATION TEST (tests/integration/)
│
├─► COMPONENT + FORM LIBRARY (React Hook Form, Formik, etc.)
│   └─► INTEGRATION TEST (tests/integration/forms/)
│
├─► COMPONENT + STATE LIBRARY (Zustand, Redux, etc.)
│   └─► INTEGRATION TEST (tests/integration/state/)
│
├─► COMPONENT + API (data fetching, mutations)
│   └─► Does it involve navigation or multiple pages?
│       ├─► YES → E2E TEST (tests/e2e/)
│       └─► NO  → INTEGRATION TEST (tests/integration/api/)
│
├─► USER FLOW (multi-step, navigation, full journey)
│   └─► E2E TEST (tests/e2e/[feature]/)
│
├─► ACCESSIBILITY (keyboard, screen reader, WCAG)
│   └─► Where tested?
│       ├─► Component level → UNIT TEST (with axe-core)
│       └─► Page/flow level → E2E TEST (with accessibility assertions)
│
└─► VISUAL REGRESSION (appearance, layout)
    └─► E2E TEST (with screenshot comparison)
```

---

## 2. Test Type Definitions

### 2.1 Unit Tests

**Purpose**: Test component logic in isolation.

**What to test**:
- Props handling (required, optional, defaults)
- State changes (user interactions, side effects)
- Computed/derived values
- Event handlers (click, change, submit)
- Conditional rendering logic
- Error states

**What NOT to test**:
- Implementation details (internal state structure)
- Third-party library internals
- Styling/appearance (use visual regression for this)
- API responses (mock these)

**Location**: Co-located with component
```
src/components/
├── Button/
│   ├── Button.tsx
│   ├── Button.test.tsx    ← UNIT TEST
│   └── index.ts
```

**Framework**: Vitest + React Testing Library

**Example**:
```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when loading', () => {
    render(<Button loading>Submit</Button>);
    
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows spinner when loading', () => {
    render(<Button loading>Submit</Button>);
    
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
});
```

### 2.2 Integration Tests

**Purpose**: Test component interactions with external systems (forms, state, APIs).

**What to test**:
- Form validation with form library (RHF + Zod)
- State management integration (Zustand store updates)
- API integration (with MSW mocking)
- Component composition (parent-child data flow)
- Context providers

**What NOT to test**:
- Navigation between pages (use E2E)
- Full user journeys (use E2E)
- Browser-specific behavior (use E2E)

**Location**: Dedicated integration directory
```
tests/
└── integration/
    ├── forms/
    │   └── LoginForm.integration.ts
    ├── state/
    │   └── UserStore.integration.ts
    └── api/
        └── UserProfile.integration.ts
```

**Framework**: Vitest + MSW + React Testing Library

**Example**:
```typescript
// LoginForm.integration.ts
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { LoginForm } from '@/components/LoginForm';
import { FormProvider } from 'react-hook-form';

describe('LoginForm Integration', () => {
  it('validates email format with Zod', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={vi.fn()} />);
    
    await user.type(screen.getByLabelText('Email'), 'invalid-email');
    await user.click(screen.getByRole('button', { name: 'Login' }));
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });
  });

  it('submits valid form data', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();
    render(<LoginForm onSubmit={handleSubmit} />);
    
    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Login' }));
    
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });
    });
  });
});
```

### 2.3 E2E Tests

**Purpose**: Test complete user flows through the actual application.

**What to test**:
- User journeys (registration, login, checkout)
- Navigation flows (page transitions, routing)
- Full-stack integration (frontend + backend + database)
- Accessibility at page level
- Responsive design
- Cross-browser behavior

**What NOT to test**:
- Component internals (use unit tests)
- Edge cases in validation (use integration tests)
- Every permutation (focus on critical paths)

**Location**: Dedicated E2E directory with tier organization
```
tests/
└── e2e/
    ├── smoke/                 ← Critical paths (every commit)
    │   ├── auth.spec.ts
    │   └── dashboard.spec.ts
    ├── core/                  ← Feature coverage (PR)
    │   ├── user-profile.spec.ts
    │   └── settings.spec.ts
    └── regression/            ← Edge cases (nightly)
        ├── validation.spec.ts
        └── error-handling.spec.ts
```

**Framework**: Playwright

**Example**:
```typescript
// auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('user can register and login', async ({ page }) => {
    // Navigate to registration
    await page.goto('/register');
    
    // Fill registration form
    await page.fill('[data-testid="email-input"]', 'new@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.fill('[data-testid="confirm-password-input"]', 'SecurePass123!');
    await page.click('[data-testid="register-submit"]');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email-input"]', 'wrong@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-submit"]');
    
    await expect(page.getByText('Invalid email or password')).toBeVisible();
    await expect(page).toHaveURL('/login'); // Still on login page
  });
});
```

---

## 3. Component Type Guidelines

| Component Type | Unit Test | Integration Test | E2E Test |
|----------------|-----------|------------------|----------|
| **Presentational** (Button, Card, Badge) | ✅ Required | ❌ Skip | ❌ Skip |
| **Form Input** (TextInput, Select, Checkbox) | ✅ Required | ✅ With form library | ❌ Skip |
| **Form Container** (LoginForm, SettingsForm) | ⚠️ Logic only | ✅ Required | ✅ Critical paths |
| **Data Display** (UserList, DataTable) | ✅ Required | ✅ With API mocking | ⚠️ If critical |
| **Page Component** (DashboardPage, ProfilePage) | ⚠️ Logic only | ⚠️ Complex cases | ✅ Required |
| **Layout** (Header, Sidebar, Footer) | ✅ Required | ❌ Skip | ⚠️ Navigation only |
| **Modal/Dialog** | ✅ Required | ✅ With triggers | ⚠️ Critical flows |
| **Navigation** (NavBar, Breadcrumbs) | ✅ Required | ❌ Skip | ✅ Required |

Legend:
- ✅ Required - Must have this test type
- ⚠️ Conditional - Depends on complexity
- ❌ Skip - Not needed for this component type

---

## 4. Testing Depth by Component Complexity

### 4.1 Simple Components (Stateless, No Side Effects)

**Examples**: Button, Badge, Avatar, Icon

**Test Coverage**:
- Unit test: Props → Rendering
- No integration or E2E needed

```typescript
// Badge.test.tsx
describe('Badge', () => {
  it('renders with default variant', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toHaveClass('bg-gray-100');
  });

  it('renders success variant', () => {
    render(<Badge variant="success">Active</Badge>);
    expect(screen.getByText('Active')).toHaveClass('bg-green-100');
  });
});
```

### 4.2 Interactive Components (State, Events)

**Examples**: Toggle, Accordion, Dropdown, Tabs

**Test Coverage**:
- Unit test: State changes, event handlers
- Integration test: If uses external state management
- E2E: Only if part of critical user flow

```typescript
// Accordion.test.tsx
describe('Accordion', () => {
  it('expands panel on click', async () => {
    const user = userEvent.setup();
    render(
      <Accordion items={[{ title: 'Section 1', content: 'Content 1' }]} />
    );
    
    expect(screen.queryByText('Content 1')).not.toBeVisible();
    
    await user.click(screen.getByText('Section 1'));
    
    expect(screen.getByText('Content 1')).toBeVisible();
  });

  it('collapses previously expanded panel', async () => {
    // ...
  });
});
```

### 4.3 Form Components (Validation, Submission)

**Examples**: LoginForm, RegistrationForm, SettingsForm

**Test Coverage**:
- Unit test: Individual field components
- Integration test: Form + validation library
- E2E: Critical forms (login, registration, payment)

```typescript
// LoginForm.integration.ts
describe('LoginForm', () => {
  it('validates required fields', async () => {
    // Integration with form library
  });

  it('submits to API endpoint', async () => {
    // Integration with MSW-mocked API
  });
});

// auth.spec.ts (E2E)
test('user can login with valid credentials', async ({ page }) => {
  // Full browser test with real backend
});
```

### 4.4 Page Components (Composition, Routing)

**Examples**: DashboardPage, ProfilePage, SettingsPage

**Test Coverage**:
- Unit test: Minimal (maybe loading states)
- Integration test: Complex data flows
- E2E: Required for all pages with user interactions

```typescript
// dashboard.spec.ts (E2E)
test.describe('Dashboard Page', () => {
  test('displays user stats', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByTestId('stats-card')).toBeVisible();
  });

  test('navigates to settings', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('[data-testid="settings-link"]');
    await expect(page).toHaveURL('/settings');
  });
});
```

---

## 5. Accessibility Testing Strategy

### 5.1 Unit Level (axe-core)

```typescript
// Button.test.tsx
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Button Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has accessible name when icon-only', async () => {
    const { container } = render(
      <Button icon={<CloseIcon />} aria-label="Close" />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### 5.2 E2E Level (Playwright + axe)

```typescript
// accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('dashboard has no critical violations', async ({ page }) => {
    await page.goto('/dashboard');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('forms are keyboard navigable', async ({ page }) => {
    await page.goto('/login');
    
    // Tab through form
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Email')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByLabel('Password')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Login' })).toBeFocused();
  });
});
```

---

## 6. Test File Location Reference

```
project/
├── src/
│   └── components/
│       └── Button/
│           ├── Button.tsx
│           └── Button.test.tsx      ← UNIT: Co-located
│
├── tests/
│   ├── integration/
│   │   ├── forms/
│   │   │   └── LoginForm.integration.ts  ← INTEGRATION: Form + validation
│   │   ├── state/
│   │   │   └── UserStore.integration.ts  ← INTEGRATION: Component + state
│   │   └── api/
│   │       └── UserProfile.integration.ts ← INTEGRATION: Component + API
│   │
│   └── e2e/
│       ├── smoke/              ← E2E Tier 1: Every commit
│       │   ├── auth.spec.ts
│       │   └── dashboard.spec.ts
│       ├── core/               ← E2E Tier 2: Every PR
│       │   ├── user-profile.spec.ts
│       │   └── settings.spec.ts
│       └── regression/         ← E2E Tier 3: Nightly
│           ├── validation.spec.ts
│           └── error-handling.spec.ts
```

---

## 7. Verification Checklist

Before completing UI component development, verify:

### Unit Tests
- [ ] All component props are tested
- [ ] All user interactions are tested (click, hover, focus)
- [ ] Conditional rendering is tested
- [ ] Error states are tested
- [ ] Loading states are tested
- [ ] Accessibility basics (axe-core) pass

### Integration Tests (if applicable)
- [ ] Form validation with actual validation library
- [ ] State management integration
- [ ] API mocking with MSW
- [ ] Component composition works correctly

### E2E Tests (for user flows)
- [ ] Happy path works end-to-end
- [ ] Error handling shows correct messages
- [ ] Navigation works correctly
- [ ] Responsive design verified
- [ ] Accessibility at page level verified

---

## 8. Related Documents

| Document | Purpose |
|----------|---------|
| `@standards/testing-standards.md` | Canonical timeout/location values |
| `@instructions/utilities/e2e-test-placement-checklist.md` | E2E tier assignment |
| `@instructions/utilities/ui-acceptance-criteria-checklist.md` | Component completion criteria |
| `@standards/e2e-ui-testing-standards.md` | E2E patterns for UI testing |
