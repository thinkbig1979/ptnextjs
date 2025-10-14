# Frontend Test Strategy

## Document Information
- **Project**: Payload CMS Vendor Enrollment
- **Phase**: Phase 3: Frontend Implementation
- **Created**: 2025-10-12
- **Version**: 1.0.0

---

## Executive Summary

This document defines the comprehensive testing strategy for the frontend implementation of the Payload CMS vendor enrollment system. The strategy follows industry best practices, leverages React Testing Library for component tests, Mock Service Worker (MSW) for API mocking, and Playwright for end-to-end testing. Target coverage: **80%+** for all critical paths and components.

---

## Testing Pyramid Overview

Our testing strategy follows the standard testing pyramid, with emphasis on fast, reliable unit and integration tests:

```
           /\
          /  \         E2E Tests (10%)
         /    \        - Critical user workflows
        /------\       - Cross-browser validation
       /        \      - Full system integration
      /          \
     /   Integration\  Integration Tests (30%)
    /     Tests     \  - Component + API integration
   /                \  - Context providers
  /------------------\ - Multi-component flows
 /                    \
/   Unit Tests (60%)   \ Unit Tests
-------------------------
- Individual components
- Pure functions
- Business logic
- UI rendering
- User interactions
```

### Test Distribution Goals
- **Unit Tests**: 60% of test effort
  - Fast execution (< 5s for full suite)
  - High coverage of individual components
  - Isolated component behavior
  - Form validation logic
  - UI state management

- **Integration Tests**: 30% of test effort
  - API integration with MSW
  - Context provider integration
  - Multi-component workflows
  - Authentication flows
  - Data fetching and caching

- **E2E Tests**: 10% of test effort
  - Critical user journeys
  - Registration → Approval → Login → Dashboard flow
  - Cross-browser compatibility
  - Accessibility validation
  - Visual regression (optional)

---

## Component Testing Strategy (React Testing Library)

### Philosophy
We follow React Testing Library's guiding principle: **"Test your components the way users interact with them."**

- ✅ Query by accessible roles, labels, and text
- ✅ Test user interactions (click, type, submit)
- ✅ Assert on visible UI changes
- ❌ Avoid testing implementation details
- ❌ Don't test internal state directly
- ❌ Don't shallow render

### Component Test Categories

#### 1. Form Components
**Components**: VendorRegistrationForm, VendorLoginForm, VendorProfileEditor

**Test Focus**:
- Render all form fields correctly
- Validate required fields
- Validate field formats (email, password, URL)
- Display validation errors
- Handle form submission
- Display loading states
- Handle API errors
- Display success messages
- Accessibility (labels, ARIA attributes)

**Example Test Pattern**:
```typescript
describe('VendorRegistrationForm', () => {
  it('displays validation errors for invalid email', async () => {
    const { getByLabelText, getByRole, findByText } = renderWithProviders(<VendorRegistrationForm />);

    const emailInput = getByLabelText(/email/i);
    const submitButton = getByRole('button', { name: /register/i });

    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.click(submitButton);

    expect(await findByText(/valid email address/i)).toBeInTheDocument();
  });
});
```

#### 2. Dashboard Components
**Components**: VendorDashboard, navigation, statistics

**Test Focus**:
- Render dashboard layout
- Display user information correctly
- Show tier-specific features
- Navigate between sections
- Handle authentication state
- Display loading states
- Handle logout action

**Example Test Pattern**:
```typescript
describe('VendorDashboard', () => {
  it('displays tier2 features for tier2 vendors', () => {
    const { getByText } = renderWithAuth(
      <VendorDashboard />,
      { user: mockTier2Vendor }
    );

    expect(getByText(/product management/i)).toBeInTheDocument();
    expect(getByText(/advanced analytics/i)).toBeInTheDocument();
  });
});
```

#### 3. Admin Components
**Components**: AdminApprovalQueue, vendor management

**Test Focus**:
- Display pending vendors list
- Show vendor details
- Handle approve action
- Handle reject action
- Show confirmation dialogs
- Update UI after actions
- Handle API errors
- Require admin authentication

**Example Test Pattern**:
```typescript
describe('AdminApprovalQueue', () => {
  it('approves vendor when approve button is clicked', async () => {
    server.use(
      rest.post('/api/admin/vendors/:id/approve', (req, res, ctx) => {
        return res(ctx.json({ success: true }));
      })
    );

    const { getByRole } = renderWithAuth(<AdminApprovalQueue />, { user: mockAdmin });

    const approveButton = getByRole('button', { name: /approve/i });
    await userEvent.click(approveButton);

    await waitFor(() => {
      expect(screen.getByText(/vendor approved/i)).toBeInTheDocument();
    });
  });
});
```

#### 4. Shared Components
**Components**: TierGate, error boundaries, loading states

**Test Focus**:
- Conditional rendering based on tier
- Show upgrade prompts
- Handle loading states
- Display error states
- Accessibility features

**Example Test Pattern**:
```typescript
describe('TierGate', () => {
  it('shows upgrade prompt for restricted features', () => {
    const { getByText } = renderWithAuth(
      <TierGate requiredTier="tier2">
        <div>Premium Feature</div>
      </TierGate>,
      { user: mockFreeTierVendor }
    );

    expect(getByText(/upgrade to tier2/i)).toBeInTheDocument();
    expect(screen.queryByText(/premium feature/i)).not.toBeInTheDocument();
  });
});
```

---

## API Mocking Strategy (Mock Service Worker)

### Why MSW?
Mock Service Worker intercepts network requests at the network layer, providing:
- ✅ Realistic API mocking
- ✅ Works in both Node (tests) and browser (development)
- ✅ No changes to application code
- ✅ Type-safe with TypeScript
- ✅ Easy to test error scenarios

### MSW Setup Pattern

```typescript
// __tests__/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  // Success scenario
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        user: { id: '1', email: 'vendor@example.com', role: 'vendor', tier: 'tier2' },
        message: 'Login successful'
      })
    );
  }),

  // Error scenario
  rest.post('/api/vendors/register', (req, res, ctx) => {
    return res(
      ctx.status(400),
      ctx.json({ error: 'Email already exists' })
    );
  }),
];
```

### API Mock Scenarios

#### 1. Authentication APIs
- **POST /api/auth/login**
  - Success: Returns user + JWT token
  - 401: Invalid credentials
  - 403: Pending/rejected vendor

- **POST /api/auth/logout**
  - Success: Clears session
  - 401: No active session

#### 2. Registration APIs
- **POST /api/vendors/register**
  - Success: Returns registered vendor
  - 400: Validation errors
  - 409: Duplicate email/company

#### 3. Profile APIs
- **GET /api/vendors/profile**
  - Success: Returns vendor profile
  - 401: Not authenticated
  - 404: Vendor not found

- **PUT /api/vendors/:id**
  - Success: Returns updated vendor
  - 400: Validation errors
  - 403: Tier restrictions violated

#### 4. Admin APIs
- **GET /api/admin/vendors/pending**
  - Success: Returns pending vendors list
  - 401: Not authenticated
  - 403: Not admin

- **POST /api/admin/vendors/:id/approve**
  - Success: Returns approved vendor
  - 401: Not authenticated
  - 403: Not admin
  - 404: Vendor not found

---

## Context Testing Strategy

### AuthContext Testing

The AuthContext is critical for the entire application. Test coverage: **90%+**

**Test Scenarios**:
1. **Initial State**
   - User is null
   - Loading is true initially
   - isAuthenticated is false

2. **Login Flow**
   - Login updates user state
   - Login stores token
   - Login updates isAuthenticated
   - Failed login shows error

3. **Logout Flow**
   - Logout clears user state
   - Logout removes token
   - Logout updates isAuthenticated

4. **Token Validation**
   - Valid token restores session
   - Expired token triggers logout
   - Invalid token is ignored

5. **Protected Routes**
   - Redirects when not authenticated
   - Allows access when authenticated
   - Checks user role
   - Checks user tier

**Example Test**:
```typescript
describe('AuthContext', () => {
  it('restores session from valid token on mount', async () => {
    localStorage.setItem('access_token', mockValidToken);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });
});
```

---

## User Interaction Testing Patterns

### 1. Form Interactions

```typescript
// Filling form fields
await userEvent.type(emailInput, 'vendor@example.com');
await userEvent.type(passwordInput, 'StrongPass123!@#');

// Selecting options
await userEvent.selectOptions(tierSelect, 'tier2');

// Checking boxes
await userEvent.click(termsCheckbox);

// Submitting form
await userEvent.click(submitButton);
```

### 2. Waiting for Async Updates

```typescript
// Wait for element to appear
await waitFor(() => {
  expect(screen.getByText(/success/i)).toBeInTheDocument();
});

// Wait for element to disappear
await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));

// Wait for specific state
await waitFor(() => {
  expect(mockApiCall).toHaveBeenCalled();
});
```

### 3. Testing Loading States

```typescript
it('shows loading spinner during form submission', async () => {
  const { getByRole, getByTestId } = renderWithProviders(<RegistrationForm />);

  const submitButton = getByRole('button', { name: /register/i });
  await userEvent.click(submitButton);

  expect(getByTestId('loading-spinner')).toBeInTheDocument();
  expect(submitButton).toBeDisabled();
});
```

### 4. Testing Error States

```typescript
it('displays API error message on failed submission', async () => {
  server.use(
    rest.post('/api/vendors/register', (req, res, ctx) => {
      return res(ctx.status(400), ctx.json({ error: 'Email already exists' }));
    })
  );

  const { getByRole, findByText } = renderWithProviders(<RegistrationForm />);

  await userEvent.click(getByRole('button', { name: /register/i }));

  expect(await findByText(/email already exists/i)).toBeInTheDocument();
});
```

---

## Accessibility Testing Approach

### ARIA Attributes Testing

```typescript
it('has proper ARIA attributes', () => {
  const { getByLabelText, getByRole } = render(<LoginForm />);

  expect(getByLabelText(/email/i)).toHaveAttribute('type', 'email');
  expect(getByRole('button', { name: /login/i })).toBeEnabled();
});
```

### Keyboard Navigation Testing

```typescript
it('supports keyboard navigation', async () => {
  const { getByLabelText } = render(<LoginForm />);

  const emailInput = getByLabelText(/email/i);
  emailInput.focus();

  expect(document.activeElement).toBe(emailInput);

  await userEvent.tab();
  expect(document.activeElement).toBe(getByLabelText(/password/i));
});
```

### Screen Reader Testing

```typescript
it('provides meaningful labels for screen readers', () => {
  const { getByLabelText } = render(<RegistrationForm />);

  expect(getByLabelText(/email address/i)).toBeInTheDocument();
  expect(getByLabelText(/password/i)).toHaveAttribute('aria-describedby');
});
```

---

## Test Coverage Goals

### Overall Coverage Target: **80%+**

| Component Type | Target Coverage | Priority |
|---------------|----------------|----------|
| Form Components | 85%+ | Critical |
| Dashboard Components | 80%+ | High |
| Admin Components | 85%+ | Critical |
| Shared Components | 75%+ | Medium |
| Context Providers | 90%+ | Critical |
| Utility Functions | 95%+ | High |

### Critical Paths (Must Have 95%+ Coverage)
1. User registration flow
2. Login authentication flow
3. Profile editing with tier restrictions
4. Admin approval workflow
5. Logout and session management

### Coverage Tracking

```bash
# Generate coverage report
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html

# CI/CD integration
# Fail build if coverage drops below 80%
```

---

## Testing Best Practices

### DO ✅

1. **Test user behavior, not implementation**
   ```typescript
   // ✅ Good - tests user interaction
   await userEvent.click(screen.getByRole('button', { name: /submit/i }));
   expect(screen.getByText(/success/i)).toBeInTheDocument();

   // ❌ Bad - tests implementation
   expect(component.state.isSubmitted).toBe(true);
   ```

2. **Use accessible queries**
   ```typescript
   // ✅ Good - accessible queries
   getByRole('button', { name: /submit/i })
   getByLabelText(/email/i)
   getByText(/welcome back/i)

   // ❌ Bad - fragile queries
   getByTestId('submit-btn')
   getByClassName('button-primary')
   ```

3. **Wait for async updates**
   ```typescript
   // ✅ Good - waits for async
   await waitFor(() => expect(mockApi).toHaveBeenCalled());

   // ❌ Bad - doesn't wait
   expect(mockApi).toHaveBeenCalled(); // May fail intermittently
   ```

4. **Mock external dependencies**
   ```typescript
   // ✅ Good - mocks API calls
   server.use(rest.post('/api/login', (req, res, ctx) => ...));

   // ❌ Bad - relies on real API
   // Tests will fail if API is down
   ```

5. **Test error scenarios**
   ```typescript
   // ✅ Good - tests error handling
   it('displays error message on API failure', async () => {
     server.use(
       rest.post('/api/login', (req, res, ctx) => res(ctx.status(401)))
     );
     // ... test error display
   });
   ```

### DON'T ❌

1. **Don't test third-party libraries**
   - Trust that shadcn/ui components work
   - Don't test React Router navigation
   - Don't test Next.js routing

2. **Don't test CSS styles directly**
   - Test visible behavior instead
   - Use `toBeVisible()` not `toHaveStyle()`

3. **Don't use shallow rendering**
   - Always use full DOM rendering
   - Integration tests are more valuable

4. **Don't test implementation details**
   - Avoid testing state directly
   - Avoid testing private methods
   - Avoid testing props directly

5. **Don't write brittle tests**
   - Don't rely on specific HTML structure
   - Don't use CSS selectors
   - Don't test snapshot of entire component

---

## Common Testing Scenarios

### Scenario 1: Testing Form Validation

```typescript
describe('Form Validation', () => {
  it('validates email format', async () => {
    const { getByLabelText, getByRole, findByText } = renderWithProviders(<RegistrationForm />);

    await userEvent.type(getByLabelText(/email/i), 'invalid-email');
    await userEvent.click(getByRole('button', { name: /register/i }));

    expect(await findByText(/valid email/i)).toBeInTheDocument();
  });

  it('validates password strength', async () => {
    const { getByLabelText, getByRole, findByText } = renderWithProviders(<RegistrationForm />);

    await userEvent.type(getByLabelText(/password/i), 'weak');
    await userEvent.click(getByRole('button', { name: /register/i }));

    expect(await findByText(/at least 12 characters/i)).toBeInTheDocument();
  });
});
```

### Scenario 2: Testing Authentication Flow

```typescript
describe('Authentication Flow', () => {
  it('logs in user and redirects to dashboard', async () => {
    const mockPush = jest.fn();
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({ push: mockPush });

    server.use(
      rest.post('/api/auth/login', (req, res, ctx) => {
        return res(ctx.json({ user: mockVendor, token: 'valid-token' }));
      })
    );

    const { getByLabelText, getByRole } = renderWithProviders(<LoginForm />);

    await userEvent.type(getByLabelText(/email/i), 'vendor@example.com');
    await userEvent.type(getByLabelText(/password/i), 'StrongPass123!@#');
    await userEvent.click(getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });
});
```

### Scenario 3: Testing Tier Restrictions

```typescript
describe('Tier Restrictions', () => {
  it('restricts tier2 fields for free tier users', () => {
    const { getByLabelText, getByText } = renderWithAuth(
      <ProfileEditor />,
      { user: mockFreeTierVendor }
    );

    expect(getByLabelText(/advanced features/i)).toBeDisabled();
    expect(getByText(/upgrade to tier2/i)).toBeInTheDocument();
  });

  it('allows tier2 fields for tier2 users', () => {
    const { getByLabelText, queryByText } = renderWithAuth(
      <ProfileEditor />,
      { user: mockTier2Vendor }
    );

    expect(getByLabelText(/advanced features/i)).toBeEnabled();
    expect(queryByText(/upgrade to tier2/i)).not.toBeInTheDocument();
  });
});
```

### Scenario 4: Testing Admin Actions

```typescript
describe('Admin Actions', () => {
  it('approves vendor and updates list', async () => {
    server.use(
      rest.get('/api/admin/vendors/pending', (req, res, ctx) => {
        return res(ctx.json([mockPendingVendor]));
      }),
      rest.post('/api/admin/vendors/:id/approve', (req, res, ctx) => {
        return res(ctx.json({ success: true }));
      })
    );

    const { getByRole, queryByText } = renderWithAuth(<AdminApprovalQueue />, { user: mockAdmin });

    await waitFor(() => {
      expect(screen.getByText(mockPendingVendor.companyName)).toBeInTheDocument();
    });

    await userEvent.click(getByRole('button', { name: /approve/i }));

    await waitFor(() => {
      expect(queryByText(mockPendingVendor.companyName)).not.toBeInTheDocument();
    });
  });
});
```

---

## Troubleshooting Guide

### Issue: "Unable to find element by role"

**Cause**: Element may not be rendered or role is incorrect

**Solution**:
```typescript
// Check what's actually rendered
screen.debug();

// Use findBy for async elements
const button = await screen.findByRole('button', { name: /submit/i });

// Check if element exists at all
const button = screen.queryByRole('button', { name: /submit/i });
expect(button).toBeNull(); // or .toBeInTheDocument()
```

### Issue: "Cannot read property of undefined"

**Cause**: Async operation not awaited, or context not provided

**Solution**:
```typescript
// Always await user interactions
await userEvent.click(button);

// Always wait for async updates
await waitFor(() => expect(mockApi).toHaveBeenCalled());

// Ensure providers are wrapped
renderWithProviders(<Component />); // Not just render()
```

### Issue: "Test timeout exceeded"

**Cause**: Waiting for element that never appears

**Solution**:
```typescript
// Increase timeout for specific test
it('slow test', async () => {
  // ...
}, 10000); // 10 second timeout

// Check if element appears at all
const element = await screen.findByText(/text/i, {}, { timeout: 5000 });

// Debug what's actually rendered
screen.debug();
```

### Issue: "MSW handler not being called"

**Cause**: URL mismatch or handler not registered

**Solution**:
```typescript
// Log requests to debug
server.events.on('request:start', req => {
  console.log('MSW intercepted:', req.method, req.url.href);
});

// Ensure exact URL match
rest.post('http://localhost:3000/api/auth/login', ...); // Full URL

// Or use relative URL
rest.post('/api/auth/login', ...);
```

### Issue: "Act warnings in console"

**Cause**: State updates not wrapped in act()

**Solution**:
```typescript
// Use async/await with userEvent
await userEvent.click(button);

// Use waitFor for async updates
await waitFor(() => expect(element).toBeInTheDocument());

// Ensure all async operations complete
await waitFor(() => expect(mockApi).toHaveBeenCalled());
```

---

## Developer Testing Checklist

Before submitting a PR with new frontend components:

### Component Tests
- [ ] All user interactions are tested
- [ ] Form validation is tested (valid + invalid)
- [ ] Loading states are tested
- [ ] Error states are tested
- [ ] Success states are tested
- [ ] Accessibility is tested (ARIA, keyboard)
- [ ] Conditional rendering is tested
- [ ] Props variations are tested

### API Integration Tests
- [ ] Successful API calls are mocked and tested
- [ ] Error responses (400, 401, 403, 500) are tested
- [ ] Loading indicators appear during API calls
- [ ] Error messages are displayed
- [ ] Success messages are displayed
- [ ] UI updates after successful API calls

### Authentication Tests
- [ ] Protected routes redirect when not authenticated
- [ ] Authenticated routes display correctly
- [ ] Login updates authentication state
- [ ] Logout clears authentication state
- [ ] Token expiration is handled

### Coverage
- [ ] New component has 80%+ test coverage
- [ ] No critical paths are uncovered
- [ ] All branches are tested
- [ ] All user flows are tested

### Test Quality
- [ ] Tests use accessible queries (role, label, text)
- [ ] Tests wait for async operations
- [ ] Tests are deterministic (no random failures)
- [ ] Tests are isolated (no shared state)
- [ ] Test names clearly describe what's being tested

---

## Next Steps

After this test design is complete:

1. **Implement Test Infrastructure** (Stream 2)
   - Set up MSW handlers
   - Create test utilities
   - Create test fixtures

2. **Implement Component Tests** (Stream 3)
   - Convert templates to actual tests
   - Run tests and verify coverage
   - Fix any failing tests

3. **Implement E2E Tests** (Phase 4)
   - Set up Playwright
   - Implement critical user workflows
   - Run E2E tests in CI/CD

4. **Continuous Improvement**
   - Monitor coverage trends
   - Add tests for bug fixes
   - Refactor brittle tests
   - Update documentation

---

## References

- [React Testing Library Documentation](https://testing-library.com/react)
- [MSW Documentation](https://mswjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Jest Documentation](https://jestjs.io/)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Backend Test Patterns](../deliverables/task-impl-auth-system-completion-report.md)

---

**Document Status**: ✅ Complete
**Next Document**: E2E Test Patterns
**Related**: Test Coverage Plan, Component Test Templates
