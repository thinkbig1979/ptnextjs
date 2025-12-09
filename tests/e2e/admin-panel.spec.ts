import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('Payload CMS Admin Panel', () => {
  test('should load /admin route without 500 error', async ({ page }) => {
    // Navigate to admin panel
    const response = await page.goto(`${BASE_URL}/admin`);

    // Verify the response is not a 500 error
    expect(response?.status()).not.toBe(500);

    // Verify we get either a 200 (loaded) or 302/307 (redirect to login)
    expect([200, 302, 307]).toContain(response?.status() || 0);

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check that we don't see the error message from the bug
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('Cannot destructure property');
    expect(bodyText).not.toContain('TypeError');
    // Check for HTTP 500 error indicators (not just "500" which appears in CSS)
    expect(bodyText).not.toContain('Internal Server Error');
    expect(bodyText).not.toContain('500 Error');
  });

  test('should load /admin/login route successfully', async ({ page }) => {
    // Navigate to admin login page
    const response = await page.goto(`${BASE_URL}/admin/login`);

    // Verify successful response
    expect(response?.status()).toBe(200);

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Verify login page elements are present
    // Look for common Payload CMS login elements
    const hasEmailField = await page.locator('input[type="email"], input[name="email"]').count() > 0;
    const hasPasswordField = await page.locator('input[type="password"], input[name="password"]').count() > 0;
    const hasLoginButton = await page.locator('button[type="submit"]').count() > 0;

    // At least one of these should be true if the admin panel loaded correctly
    const isLoginPageRendered = hasEmailField || hasPasswordField || hasLoginButton;

    expect(isLoginPageRendered).toBe(true);

    // Check that we don't see error messages
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('Cannot destructure property');
    expect(bodyText).not.toContain('Internal Server Error');
  });

  test('should not have CodeEditor context errors', async ({ page, browser }) => {
    const context = await browser.newContext();
    const consoleLogs: string[] = [];
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleLogs.push(msg.text());
      }
    });

    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    // Navigate to admin panel
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' });

    // Give some time for any errors to appear
    await page.waitForTimeout(2000);

    // Check that there are no CodeEditor or context-related errors
    const hasCodeEditorError = [...consoleLogs, ...errors].some(log =>
      log.includes('CodeEditor') ||
      log.includes('Cannot destructure') ||
      log.includes('ue(...)') ||
      log.includes('EditorConfig')
    );

    expect(hasCodeEditorError).toBe(false);

    await context.close();
  });
});
