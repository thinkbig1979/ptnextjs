# shadcn/ui Component Testing Guide

## Testing Framework

**Stack:**
- Jest 30.1.3
- React Testing Library 16.3.0
- @testing-library/user-event 14.6.1
- @testing-library/jest-dom 6.8.0

**Test Environment:** jsdom (configured in `jest.config.js`)

---

## Key Principles

### ✅ DO: Test User Behavior, Not Implementation

shadcn/ui components use Radix UI primitives which render custom ARIA-compliant elements, not native HTML. Test how users interact with the UI, not the underlying DOM structure.

**Good:**
```typescript
const trigger = screen.getByLabelText(/requested tier/i);
await user.click(trigger);
```

**Bad:**
```typescript
expect(select).toHaveAttribute('name', 'requestedTier'); // Radix Select doesn't add name to trigger
```

---

## Component-Specific Patterns

### Select Component (Radix UI)

**How it renders:**
- Trigger: `<button role="combobox">`
- Portal: Options rendered in body (outside component tree)
- Items: Custom divs with `data-radix-collection-item`, NOT `<option role="option">`

**Correct Interaction:**
```typescript
async function selectOption(user, labelText: string) {
  // 1. Find and click the trigger
  const trigger = screen.getByRole('combobox');
  await user.click(trigger);

  // 2. Wait for portal to render, find by text
  const option = await screen.findByText(labelText);
  await user.click(option);
}

// Usage:
await selectOption(user, 'Tier 1');
```

**Common Mistakes:**
```typescript
// ❌ WRONG: Looking for role="option"
const option = await screen.findByRole('option', { name: /tier 1/i });

// ❌ WRONG: Expecting name attribute on trigger
expect(trigger).toHaveAttribute('name', 'tierSelect');

// ❌ WRONG: Using getByText synchronously (portal not rendered yet)
const option = screen.getByText('Tier 1');
```

---

### Form Components (React Hook Form + Zod)

**Key Characteristics:**
- Validation is **async** (happens on blur/submit)
- Error messages render in `<FormMessage>` components
- Form state updates trigger re-renders

**Correct Validation Testing:**
```typescript
it('shows validation error', async () => {
  const user = userEvent.setup();

  const textarea = screen.getByLabelText(/notes/i);
  await user.clear(textarea);
  await user.type(textarea, 'Too short');
  await user.tab(); // Trigger blur

  // ✅ Use waitFor with timeout for async validation
  await waitFor(
    () => {
      expect(screen.getByText(/at least 20 characters/i)).toBeInTheDocument();
    },
    { timeout: 3000 } // Allow time for async validation
  );
});
```

**Common Mistakes:**
```typescript
// ❌ WRONG: Not waiting for validation
await user.type(textarea, 'Short');
expect(screen.getByText(/error/i)).toBeInTheDocument(); // Fails - validation not complete

// ❌ WRONG: Default timeout too short
await waitFor(() => {
  expect(screen.getByText(/error/i)).toBeInTheDocument();
}); // Default 1000ms might not be enough

// ❌ WRONG: Not triggering validation
await user.type(textarea, 'Short');
// Missing: await user.tab() or form submit
```

---

### Toast Notifications (Sonner)

**Setup Required:**
```typescript
// Mock in test file
jest.mock('@/components/ui/sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
}));

const { toast } = require('@/components/ui/sonner');
```

**Export from sonner.tsx:**
```typescript
// components/ui/sonner.tsx
import { Toaster as Sonner, toast } from "sonner"
export { Toaster, toast } // ← Must export toast!
```

**Testing:**
```typescript
it('shows success toast', async () => {
  // ... trigger action ...

  await waitFor(() => {
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringMatching(/success/i)
    );
  }, { timeout: 5000 });
});
```

---

### Textarea Component

**Works like native textarea:**
```typescript
const textarea = screen.getByLabelText(/notes/i);
await user.clear(textarea); // Always clear first
await user.type(textarea, 'New content');

// Has name attribute (unlike Select)
expect(textarea).toHaveAttribute('name', 'vendorNotes');
```

---

### Button Component

**Rendered as native button:**
```typescript
const button = screen.getByRole('button', { name: /submit/i });
await user.click(button);

// Check disabled state
expect(button).toBeDisabled();
expect(button).toHaveTextContent(/submitting/i);
```

---

## Form Submission Testing

**Complete Pattern:**
```typescript
it('submits form successfully', async () => {
  const user = userEvent.setup();
  const onSuccess = jest.fn();

  // Mock API
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({ success: true, data: mockData }),
  });

  render(<MyForm onSuccess={onSuccess} />);

  // 1. Fill ALL required fields (including Select)
  await selectOption(user, 'Tier 1');

  const textarea = screen.getByLabelText(/notes/i);
  await user.type(textarea, 'Valid notes content');

  // 2. Submit
  const button = screen.getByRole('button', { name: /submit/i });
  await user.click(button);

  // 3. Verify API call
  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/endpoint',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
  }, { timeout: 5000 });

  // 4. Verify success handling
  await waitFor(() => {
    expect(toast.success).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith(mockData);
  }, { timeout: 5000 });
});
```

**Common Mistakes:**
```typescript
// ❌ WRONG: Not filling required fields
const button = screen.getByRole('button', { name: /submit/i });
await user.click(button);
// Form validation prevents submission, fetch never called!

// ❌ WRONG: Not waiting for async submission
await user.click(button);
expect(fetch).toHaveBeenCalled(); // Fails - submission not complete yet

// ❌ WRONG: Short timeout
await waitFor(() => {
  expect(toast.success).toHaveBeenCalled();
}); // Default 1000ms often too short for form submission
```

---

## Loading States Testing

```typescript
it('disables form during submission', async () => {
  // Mock slow API
  (global.fetch as jest.Mock).mockImplementationOnce(
    () => new Promise((resolve) => setTimeout(resolve, 1000))
  );

  // Fill and submit form
  await selectOption(user, 'Tier 1');
  await user.type(textarea, validNotes);
  await user.click(submitButton);

  // Check disabled state while submitting
  await waitFor(() => {
    expect(submitButton).toBeDisabled();
    expect(textarea).toBeDisabled();
    expect(submitButton).toHaveTextContent(/submitting/i);
  }, { timeout: 3000 });
});
```

---

## Accessibility Testing

```typescript
it('has proper accessibility attributes', () => {
  render(<MyForm />);

  // ✅ Labels associate correctly
  const field = screen.getByLabelText(/tier/i);
  expect(field).toBeInTheDocument();

  // ✅ ARIA labels present
  expect(field).toHaveAttribute('aria-label');

  // ✅ Error messages associated
  // (React Hook Form handles aria-describedby automatically)
});
```

---

## Common Pitfalls Summary

### ❌ AVOID:

1. **Assuming native HTML attributes** - Radix components use custom elements
2. **Synchronous queries for async content** - Use `findBy*` and `waitFor`
3. **Default timeouts** - Increase to 3000-5000ms for complex operations
4. **Testing implementation details** - Test user-visible behavior
5. **Incomplete form filling** - Fill ALL required fields before submission
6. **Missing `user.tab()`** - React Hook Form validation often needs blur event
7. **Not mocking toast** - Will cause test failures on toast calls
8. **Searching for role="option"** - Radix Select doesn't use this role
9. **Expecting `name` on Select trigger** - Only textarea/input have name attributes
10. **Not clearing before typing** - Previous content interferes with validation

---

## Test File Template

```typescript
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock toast
jest.mock('@/components/ui/sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const { toast } = require('@/components/ui/sonner');

// Helper for Select interaction
async function selectOption(user, text: string) {
  const trigger = screen.getByRole('combobox');
  await user.click(trigger);
  const option = await screen.findByText(text);
  await user.click(option);
}

describe('MyComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    // Use helper for Select
    await selectOption(user, 'Option 1');

    // Standard interaction for textarea
    const textarea = screen.getByLabelText(/notes/i);
    await user.clear(textarea);
    await user.type(textarea, 'Content');
    await user.tab();

    // Wait for async validation
    await waitFor(
      () => expect(screen.queryByText(/error/i)).not.toBeInTheDocument(),
      { timeout: 3000 }
    );
  });
});
```

---

## Quick Reference

| Component | Find By | Interaction | Notes |
|-----------|---------|-------------|-------|
| **Select** | `getByRole('combobox')` | Click trigger → `findByText()` option → Click | Portal renders async |
| **Textarea** | `getByLabelText(/label/i)` | `clear()` → `type()` → `tab()` | Has `name` attribute |
| **Button** | `getByRole('button')` | `click()` | Native button element |
| **Form** | N/A | Fill all fields → `click(submit)` | Validation is async |
| **Toast** | Mock `@/components/ui/sonner` | Check mock calls | Must export from sonner.tsx |

---

**Key Takeaway:** shadcn/ui components use Radix UI primitives with custom ARIA patterns. Test the user experience, not the DOM structure. Always wait for async operations (validation, API calls, portal rendering) with appropriate timeouts.
