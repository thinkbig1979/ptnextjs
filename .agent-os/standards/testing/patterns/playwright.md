---
version: 5.1.0
last-updated: 2026-01-02
related-files:
  - standards/testing/patterns/README.md
---


# Playwright Testing Patterns

Version compatibility: Playwright 1.40+

## Basic Test Structure

### Test File Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/path');
    await expect(page).toHaveTitle(/Expected Title/);
  });
});
```

### Test with Multiple Fixtures

```typescript
test('uses multiple fixtures', async ({ page, context, browser }) => {
  // page: isolated page for this test
  // context: browser context
  // browser: browser instance
});
```

## Locators

### Recommended Locator Strategies

```typescript
// ✅ BEST: Test IDs (most reliable)
await page.getByTestId('submit-button').click();

// ✅ GOOD: Role-based (accessible)
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByRole('textbox', { name: 'Email' }).fill('test@example.com');
await page.getByRole('link', { name: 'Home' }).click();

// ✅ GOOD: Label-based (accessible)
await page.getByLabel('Email').fill('test@example.com');
await page.getByPlaceholder('Enter your email').fill('test@example.com');

// ✅ GOOD: Text-based
await page.getByText('Welcome').click();
await page.getByText(/regex pattern/i).click();

// ⚠️ OK: CSS selectors (less reliable)
await page.locator('.class-name').click();
await page.locator('#id').click();

// ❌ AVOID: XPath (fragile)
await page.locator('//div[@class="something"]').click();
```

### Chaining Locators

```typescript
// Filter to specific element
await page
  .getByRole('listitem')
  .filter({ hasText: 'Specific Item' })
  .getByRole('button')
  .click();

// Nth element
await page.getByRole('listitem').nth(2).click();
await page.getByRole('listitem').first().click();
await page.getByRole('listitem').last().click();
```

## Assertions

### Page Assertions

```typescript
// Title
await expect(page).toHaveTitle('Page Title');
await expect(page).toHaveTitle(/Title Pattern/);

// URL
await expect(page).toHaveURL('/expected-path');
await expect(page).toHaveURL(/pattern/);
```

### Element Assertions

```typescript
// Visibility
await expect(locator).toBeVisible();
await expect(locator).toBeHidden();
await expect(locator).not.toBeVisible();

// Enabled/Disabled
await expect(locator).toBeEnabled();
await expect(locator).toBeDisabled();

// Text content
await expect(locator).toHaveText('exact text');
await expect(locator).toHaveText(/pattern/);
await expect(locator).toContainText('partial');

// Value (inputs)
await expect(locator).toHaveValue('input value');
await expect(locator).toHaveValue(/pattern/);

// Count
await expect(locator).toHaveCount(5);

// Attributes
await expect(locator).toHaveAttribute('href', '/link');
await expect(locator).toHaveClass(/active/);

// Checked state
await expect(locator).toBeChecked();
await expect(locator).not.toBeChecked();
```

## User Interactions

### Click Actions

```typescript
await locator.click();
await locator.dblclick();
await locator.click({ button: 'right' });
await locator.click({ modifiers: ['Shift'] });
await locator.click({ force: true });  // Skip actionability checks
```

### Form Interactions

```typescript
// Text input
await page.getByLabel('Email').fill('test@example.com');
await page.getByLabel('Password').fill('password123');

// Clear and type
await locator.clear();
await locator.type('text', { delay: 100 });  // With typing delay

// Checkbox/Radio
await page.getByRole('checkbox').check();
await page.getByRole('checkbox').uncheck();
await page.getByRole('radio', { name: 'Option 1' }).check();

// Select dropdown
await page.getByRole('combobox').selectOption('value');
await page.getByRole('combobox').selectOption({ label: 'Label' });
await page.getByRole('combobox').selectOption(['value1', 'value2']);

// File upload
await page.getByLabel('Upload').setInputFiles('file.pdf');
await page.getByLabel('Upload').setInputFiles(['file1.pdf', 'file2.pdf']);
```

## Waiting Strategies

### Auto-Waiting

```typescript
// Playwright auto-waits for elements to be actionable
// These all auto-wait:
await locator.click();      // Waits for visible, enabled
await locator.fill('text'); // Waits for visible, enabled, editable
await expect(locator).toBeVisible(); // Waits up to timeout
```

### Explicit Waiting

```typescript
// ✅ GOOD: Wait for specific condition
await expect(locator).toBeVisible({ timeout: 10000 });
await page.waitForURL('/dashboard');
await page.waitForLoadState('networkidle');

// Wait for element
await page.waitForSelector('[data-testid="loaded"]');

// Wait for function
await page.waitForFunction(() => {
  return document.querySelector('.loaded') !== null;
});

// ❌ AVOID: Hard waits
await page.waitForTimeout(5000);  // Don't use unless absolutely necessary
```

### Network Waiting

```typescript
// Wait for specific request
const response_promise = page.waitForResponse('**/api/users');
await page.getByRole('button', { name: 'Load' }).click();
const response = await response_promise;

// Wait for request
const request_promise = page.waitForRequest('**/api/submit');
await page.getByRole('button', { name: 'Submit' }).click();
await request_promise;
```

## Network Interception

### Mock API Responses

```typescript
// Mock all requests to an endpoint
await page.route('**/api/users', (route) => {
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ users: [] })
  });
});

// Conditional mocking
await page.route('**/api/users/*', (route, request) => {
  if (request.method() === 'GET') {
    route.fulfill({ body: JSON.stringify({ id: 1, name: 'User' }) });
  } else {
    route.continue();
  }
});

// Modify response
await page.route('**/api/data', async (route) => {
  const response = await route.fetch();
  const json = await response.json();
  json.modified = true;
  route.fulfill({ response, json });
});
```

### Block Resources

```typescript
// Block images for faster tests
await page.route('**/*.{png,jpg,jpeg,gif,svg}', (route) => {
  route.abort();
});

// Block external scripts
await page.route('**/analytics.js', (route) => route.abort());
```

## Page Object Pattern

### Page Object Class

```typescript
// pages/login-page.ts
import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly email_input: Locator;
  readonly password_input: Locator;
  readonly submit_button: Locator;
  readonly error_message: Locator;

  constructor(page: Page) {
    this.page = page;
    this.email_input = page.getByLabel('Email');
    this.password_input = page.getByLabel('Password');
    this.submit_button = page.getByRole('button', { name: 'Sign In' });
    this.error_message = page.getByTestId('error-message');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.email_input.fill(email);
    await this.password_input.fill(password);
    await this.submit_button.click();
  }

  async expect_error(message: string) {
    await expect(this.error_message).toHaveText(message);
  }
}
```

### Using Page Objects

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login-page';

test.describe('Login', () => {
  let login_page: LoginPage;

  test.beforeEach(async ({ page }) => {
    login_page = new LoginPage(page);
    await login_page.goto();
  });

  test('successful login', async ({ page }) => {
    await login_page.login('user@example.com', 'password');
    await expect(page).toHaveURL('/dashboard');
  });

  test('invalid credentials', async () => {
    await login_page.login('wrong@example.com', 'wrong');
    await login_page.expect_error('Invalid credentials');
  });
});
```

## Test Configuration

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : 3,

  reporter: 'html',

  use: {
    // Use BASE_URL from environment (set by test runner to prod server)
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
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
  ],

  // CRITICAL: Do NOT use webServer - tests run against production server
  // Build and start prod server BEFORE running tests (10-50x faster)
  // See: @standards/testing-standards.md Section 17
  // webServer: undefined,
});
```

## Fixtures

### Custom Fixtures

```typescript
import { test as base } from '@playwright/test';
import { LoginPage } from './pages/login-page';

type Fixtures = {
  login_page: LoginPage;
  authenticated_page: void;
};

export const test = base.extend<Fixtures>({
  login_page: async ({ page }, use) => {
    const login_page = new LoginPage(page);
    await use(login_page);
  },

  authenticated_page: async ({ page }, use) => {
    // Setup: login
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('/dashboard');

    await use();

    // Teardown: logout
    await page.goto('/logout');
  },
});
```

## Screenshots and Visual Testing

### Screenshots

```typescript
// Full page screenshot
await page.screenshot({ path: 'screenshot.png', fullPage: true });

// Element screenshot
await locator.screenshot({ path: 'element.png' });

// Visual comparison
await expect(page).toHaveScreenshot('homepage.png');
await expect(locator).toHaveScreenshot('component.png');
```

## Anti-Patterns to Avoid

### ❌ Hard Waits

```typescript
// ❌ WRONG: Never use hard waits
await page.waitForTimeout(5000);

// ✅ CORRECT: Wait for specific condition
await expect(page.getByTestId('loaded')).toBeVisible();
await page.waitForLoadState('networkidle');
```

### ❌ Fragile Locators

```typescript
// ❌ WRONG: Fragile CSS/XPath
await page.locator('div > div:nth-child(3) > button').click();
await page.locator('//div[@class="wrapper"]/button').click();

// ✅ CORRECT: Semantic locators
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByTestId('submit-btn').click();
```

### ❌ Not Using Auto-Wait

```typescript
// ❌ WRONG: Manual sleep before action
await page.waitForTimeout(1000);
await locator.click();

// ✅ CORRECT: Playwright auto-waits
await locator.click();  // Already waits for actionability
```

### ❌ Tight Coupling to Implementation

```typescript
// ❌ WRONG: Testing implementation details
await expect(page.locator('.MuiButton-root')).toBeVisible();

// ✅ CORRECT: Test user-facing behavior
await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
```

### ❌ Running in Watch/UI Mode in CI

```typescript
// ❌ WRONG: Will hang in CI
npx playwright test --ui

// ✅ CORRECT: Headless mode for CI
npx playwright test
```
