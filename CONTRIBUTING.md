# Contributing to Paul Thames Superyacht Technology

Thank you for your interest in contributing to the Paul Thames Superyacht Technology platform! This guide will help you understand our development workflow, coding standards, and testing practices.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Test Organization](#test-organization)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- SQLite development tools (optional, for database work)

### Initial Setup

```bash
# Clone the repository
git clone [repository-url]
cd ptnextjs

# Install dependencies
npm install

# Run development server
npm run dev

# Access the application
# Frontend: http://localhost:3000
# CMS Admin: http://localhost:3000/admin
```

### Verify Your Setup

```bash
npm run type-check  # TypeScript validation
npm run lint        # Code quality checks
npm run test        # Run unit tests
npm run build       # Verify build works
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

Follow our [coding standards](#coding-standards) and write tests for new functionality.

### 3. Run Tests

```bash
npm run test              # Unit tests
npm run test:e2e          # End-to-end tests
npm run type-check        # TypeScript validation
npm run lint              # Linting
```

### 4. Commit Your Changes

Follow our [commit guidelines](#commit-guidelines).

### 5. Create a Pull Request

See our [PR process](#pull-request-process) below.

## Test Organization

We use a structured approach to organizing tests that makes them easy to find, write, and maintain.

### Test Types

1. **Unit Tests** - Test individual functions, components, or modules in isolation
2. **Integration Tests** - Test how multiple units work together
3. **E2E Tests** - Test complete user workflows using Playwright

### File Naming Conventions

- **Unit/Integration Tests**: Use `.test.ts` or `.test.tsx` extension
- **E2E Tests**: Use `.spec.ts` extension (Playwright convention)

### Where to Put Tests

#### Unit Tests - Colocated with Source Code

Place unit tests next to the code they test:

```
lib/services/EmailService.ts
lib/services/EmailService.test.ts

components/Button.tsx
components/Button.test.tsx

hooks/useAuth.ts
hooks/useAuth.test.ts
```

**Examples:**
- Component tests → `components/dashboard/TierUpgradeForm.test.tsx`
- Service tests → `lib/services/LocationService.test.ts`
- Utility tests → `lib/utils/validators.test.ts`
- Hook tests → `hooks/useTierAccess.test.ts`

**Benefits:**
- Easy to find related tests
- Encourages writing tests while developing
- Clear ownership and maintenance
- Tests naturally organized by domain

#### Integration Tests - Centralized in `__tests__/integration/`

Place integration tests in a centralized location, organized by domain:

```
__tests__/integration/
├── api/
│   ├── vendor-endpoints.test.ts
│   └── admin-endpoints.test.ts
├── workflows/
│   ├── tier-upgrade-workflow.test.tsx
│   └── vendor-registration.test.tsx
└── services/
    └── email-workflow.test.ts
```

**Examples:**
- API integration → `__tests__/integration/api/vendor-endpoints.test.ts`
- Multi-step workflows → `__tests__/integration/workflows/onboarding.test.tsx`
- Database integration → `__tests__/integration/database/migrations.test.ts`

**Benefits:**
- Clear separation from unit tests
- Logical grouping by system area
- Easy to run all integration tests together
- Shared test utilities naturally located here

#### E2E Tests - `tests/e2e/` Directory

All Playwright end-to-end tests go in the `tests/e2e/` directory:

```
tests/e2e/
├── vendor-onboarding/
│   ├── 01-registration.spec.ts
│   ├── 02-admin-approval.spec.ts
│   └── 03-authentication.spec.ts
├── tier-upgrade/
│   ├── vendor-workflow.spec.ts
│   └── admin-workflow.spec.ts
├── helpers/
│   ├── test-data-factories.ts
│   └── vendor-helpers.ts
└── admin-panel.spec.ts
```

**Benefits:**
- All E2E tests in one place
- Shared helpers easily accessible
- Clear separation from Jest tests
- Easy to run full E2E suite

### Tests That Should Stay Centralized

Some tests should remain in the `__tests__/` directory even though they're not integration tests:

```
__tests__/
├── api/                    # API route tests
│   ├── admin/
│   └── portal/
├── backend/                # Backend service tests
│   ├── schema/
│   └── services/
├── performance/            # Performance benchmarks
├── security/               # Security audits
└── payload/                # CMS configuration tests
```

**Why centralize these?**
- They test systems, not individual units
- Often require shared fixtures or utilities
- They span multiple domains
- Easier to run as a group

### Running Tests

```bash
# Run all unit and integration tests
npm run test

# Run tests in watch mode (great for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run specific test file
npm run test -- path/to/test.test.ts

# Run tests matching a pattern
npm run test -- --testNamePattern="should validate email"
```

### Writing Good Tests

#### Unit Test Example

```typescript
// lib/utils/validators.test.ts
import { validateEmail } from './validators';

describe('validateEmail', () => {
  it('should accept valid email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('test.user+tag@domain.co.uk')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(validateEmail('invalid')).toBe(false);
    expect(validateEmail('missing@domain')).toBe(false);
    expect(validateEmail('@nodomain.com')).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail(null)).toBe(false);
    expect(validateEmail(undefined)).toBe(false);
  });
});
```

#### Integration Test Example

```typescript
// __tests__/integration/workflows/tier-upgrade.test.ts
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TierUpgradeWorkflow } from '@/components/workflows/TierUpgradeWorkflow';

describe('Tier Upgrade Workflow', () => {
  it('should complete full tier upgrade request', async () => {
    const user = userEvent.setup();
    render(<TierUpgradeWorkflow vendorId="123" currentTier={1} />);

    // Select tier
    await user.click(screen.getByRole('button', { name: /tier 2/i }));

    // Fill justification
    await user.type(
      screen.getByLabelText(/justification/i),
      'We need additional locations for our expanding business'
    );

    // Submit request
    await user.click(screen.getByRole('button', { name: /submit request/i }));

    // Verify success
    await waitFor(() => {
      expect(screen.getByText(/request submitted/i)).toBeInTheDocument();
    });
  });
});
```

#### E2E Test Example

```typescript
// tests/e2e/vendor-onboarding/01-registration.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Vendor Registration', () => {
  test('should register new vendor successfully', async ({ page }) => {
    await page.goto('/register');

    // Fill registration form
    await page.fill('input[name="companyName"]', 'Test Marine Solutions');
    await page.fill('input[name="email"]', 'test@marinesolutions.com');
    await page.fill('input[name="password"]', 'SecurePassword123!');

    // Submit
    await page.click('button[type="submit"]');

    // Verify redirect to pending approval
    await expect(page).toHaveURL(/\/pending-approval/);
    await expect(page.locator('h1')).toContainText('Pending Approval');
  });
});
```

### Test Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what the code does, not how it does it
   - Tests should survive refactoring

2. **Use Descriptive Test Names**
   ```typescript
   // Good
   it('should display error when email is invalid', () => { ... });

   // Bad
   it('test email', () => { ... });
   ```

3. **Follow AAA Pattern**
   - **Arrange**: Set up test data and conditions
   - **Act**: Execute the code being tested
   - **Assert**: Verify the results

4. **Keep Tests Independent**
   - Each test should run in isolation
   - Don't rely on test execution order
   - Clean up after yourself

5. **Mock External Dependencies**
   - Mock API calls, databases, third-party services
   - Use Jest mocks or MSW for HTTP mocking

6. **Test Edge Cases**
   - Empty inputs
   - Null/undefined values
   - Boundary conditions
   - Error scenarios

7. **Maintain Test Data**
   - Use factories or builders for test data
   - Keep test data in separate files for reusability
   - See `tests/e2e/helpers/test-data-factories.ts` for examples

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types (avoid `any`)
- Use interfaces for object shapes
- Use type aliases for unions/intersections

### Code Style

We use ESLint and Prettier for code formatting:

```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues
```

### Component Guidelines

1. **Use Functional Components**
   ```typescript
   export function Button({ label, onClick }: ButtonProps) {
     return <button onClick={onClick}>{label}</button>;
   }
   ```

2. **Extract Complex Logic to Hooks**
   ```typescript
   export function useTierAccess(vendorId: string) {
     // Complex logic here
   }
   ```

3. **Colocate Related Files**
   ```
   components/dashboard/
   ├── TierUpgradeForm.tsx
   ├── TierUpgradeForm.test.tsx
   └── TierUpgradeForm.module.css
   ```

### Import Order

Organize imports in this order:

```typescript
// 1. React and Next.js
import React from 'react';
import { useRouter } from 'next/navigation';

// 2. External libraries
import { z } from 'zod';
import { toast } from 'sonner';

// 3. Internal components
import { Button } from '@/components/ui/button';

// 4. Internal utilities
import { validateEmail } from '@/lib/utils/validators';

// 5. Types
import type { Vendor } from '@/lib/types';

// 6. Styles
import styles from './Component.module.css';
```

## Commit Guidelines

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(vendor): Add tier upgrade request form

Implement new form component allowing vendors to request tier upgrades
with business justification. Includes validation and submission to admin
approval queue.

Closes #123
```

```
fix(locations): Correct geocoding API rate limiting

Add exponential backoff to geocoding requests to prevent API rate limit
errors when processing multiple locations.
```

```
test(email): Add comprehensive email service tests

Add unit tests covering all email template rendering scenarios including
vendor approval, rejection, and tier upgrade notifications.
```

### Scope Guidelines

Use scopes that match the domain area:

- `vendor` - Vendor-related features
- `admin` - Admin panel features
- `tier` - Tier system
- `locations` - Location management
- `products` - Product catalog
- `auth` - Authentication/authorization
- `email` - Email notifications
- `api` - API endpoints
- `db` - Database changes

## Pull Request Process

### Before Creating a PR

1. Ensure all tests pass
2. Run linting and fix any issues
3. Update documentation if needed
4. Rebase on latest main branch
5. Write clear commit messages

### Creating a PR

1. **Title**: Use conventional commit format
   ```
   feat(vendor): Add tier upgrade request workflow
   ```

2. **Description**: Include:
   - What changes were made
   - Why they were made
   - How to test them
   - Screenshots (for UI changes)
   - Related issues

3. **Template**:
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Unit tests added/updated
   - [ ] Integration tests added/updated
   - [ ] E2E tests added/updated
   - [ ] Manual testing completed

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex code
   - [ ] Documentation updated
   - [ ] No new warnings generated
   - [ ] Tests pass locally

   ## Screenshots (if applicable)
   Add screenshots here

   ## Related Issues
   Closes #123
   ```

### PR Review Process

1. **Automated Checks**: Must pass before review
   - TypeScript compilation
   - Linting
   - Unit tests
   - E2E tests (if applicable)

2. **Code Review**: At least one approval required
   - Review for correctness
   - Check test coverage
   - Verify documentation
   - Assess maintainability

3. **Merge**: Squash and merge when approved

## Code Review Guidelines

### As a Reviewer

- Be constructive and respectful
- Explain why changes are needed
- Suggest specific improvements
- Approve when ready (don't block on nitpicks)

### As an Author

- Respond to all comments
- Be open to feedback
- Ask questions if unclear
- Make requested changes promptly

## Getting Help

- Check existing documentation in `/docs`
- Review CLAUDE.md for project-specific guidance
- Ask questions in pull request comments
- Reach out to maintainers

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Payload CMS Documentation](https://payloadcms.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to the Paul Thames Superyacht Technology platform!
