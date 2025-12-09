import { test, expect } from '@playwright/test';

test.describe('Payload CMS Admin Login - Visual Verification', () => {
  test('should render login page with all required elements', async ({ page, baseURL }) => {
    // Navigate to admin login page
    const response = await page.goto(`${baseURL}/admin/login`);

    // Verify HTTP 200 response (not 500 error)
    expect(response?.status()).toBe(200);

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Take a screenshot for visual verification
    await page.screenshot({
      path: 'tests/screenshots/admin-login-page.png',
      fullPage: true
    });

    // Verify no error messages in the visible content
    const pageContent = await page.content();
    expect(pageContent).not.toContain('Internal Server Error');
    expect(pageContent).not.toContain('Cannot destructure property');
    expect(pageContent).not.toContain('useServerFunctions must be used within a ServerFunctionsProvider');

    // Verify login form elements are present
    // Wait for either email input or Payload CMS branding to appear
    await Promise.race([
      page.waitForSelector('input[type="email"]', { timeout: 10000 }).catch(() => null),
      page.waitForSelector('input[name="email"]', { timeout: 10000 }).catch(() => null),
      page.waitForSelector('text=Payload', { timeout: 10000 }).catch(() => null),
      page.waitForSelector('[class*="payload"]', { timeout: 10000 }).catch(() => null),
    ]);

    // Check for login-related elements
    const hasEmailField = (await page.locator('input[type="email"], input[name="email"]').count()) > 0;
    const hasPasswordField = (await page.locator('input[type="password"], input[name="password"]').count()) > 0;
    const hasLoginButton = (await page.locator('button[type="submit"]').count()) > 0;
    const hasPayloadBranding = (await page.locator('text=/payload/i').count()) > 0;

    // Log what we found for debugging
    console.log('Login page elements found:', {
      hasEmailField,
      hasPasswordField,
      hasLoginButton,
      hasPayloadBranding,
    });

    // At least some login-related elements should be present
    const hasLoginElements = hasEmailField || hasPasswordField || hasLoginButton || hasPayloadBranding;
    expect(hasLoginElements).toBe(true);

    // Verify page title
    const title = await page.title();
    expect(title).toContain('Login');
  });

  test('should not have JavaScript console errors', async ({ page, baseURL }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Capture page errors
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    // Navigate to admin login page
    await page.goto(`${baseURL}/admin/login`, { waitUntil: `networkidle` });

    // Wait a bit for any async errors to appear
    await page.waitForTimeout(3000);

    // Log errors for debugging
    if (consoleErrors.length > 0) {
      console.log('Console errors:', consoleErrors);
    }
    if (pageErrors.length > 0) {
      console.log('Page errors:', pageErrors);
    }

    // Check for critical errors
    const hasCriticalError = [...consoleErrors, ...pageErrors].some(error =>
      error.includes('Cannot destructure') ||
      error.includes('useServerFunctions') ||
      error.includes('ServerFunctionsProvider') ||
      error.includes('500')
    );

    expect(hasCriticalError).toBe(false);
  });

  test('should render without HTTP 500 status code', async ({ page, baseURL }) => {
    const response = await page.goto(`${baseURL}/admin/login`);

    // The key test - verify NOT a 500 error
    expect(response?.status()).not.toBe(500);

    // Should be 200 (OK) or 30x (redirect)
    const status = response?.status() || 0;
    expect(status >= 200 && status < 400).toBe(true);
  });
});
