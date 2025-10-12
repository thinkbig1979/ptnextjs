import { test, expect } from '@playwright/test';

test.describe('Payload CMS Admin Interface Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Set timeout for slow initial loads
    test.setTimeout(60000);
  });

  test('should load admin interface without errors', async ({ page }) => {
    // Navigate to admin interface
    const response = await page.goto('http://localhost:3000/admin', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Verify page loaded successfully
    expect(response?.status()).toBeLessThan(400);

    // Wait for the admin interface to render
    await page.waitForLoadState('domcontentloaded');

    // Check for common error indicators
    const pageContent = await page.content();
    expect(pageContent).not.toContain('Module not found');
    expect(pageContent).not.toContain('compiler-runtime');
    expect(pageContent).not.toContain('Cannot find module');
  });

  test('should display all 7 Payload collections', async ({ page }) => {
    await page.goto('http://localhost:3000/admin', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for navigation/sidebar to render
    await page.waitForSelector('nav, [role="navigation"], aside', { timeout: 15000 });

    // Get page content to check for collections
    const content = await page.content();

    // Verify all 7 collections are present in the UI
    const collections = [
      'Users',
      'Vendors',
      'Products',
      'Categories',
      'Blog Posts',
      'Team Members',
      'Company Info'
    ];

    const missingCollections: string[] = [];
    for (const collection of collections) {
      if (!content.includes(collection)) {
        missingCollections.push(collection);
      }
    }

    if (missingCollections.length > 0) {
      console.log('Missing collections:', missingCollections);
      console.log('Page content sample:', content.substring(0, 1000));
    }

    expect(missingCollections).toEqual([]);
  });

  test('should not have React compiler-runtime errors', async ({ page }) => {
    const errors: string[] = [];

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('http://localhost:3000/admin', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait a bit for any async errors
    await page.waitForTimeout(3000);

    // Check for React compiler-runtime errors
    const runtimeErrors = errors.filter(err =>
      err.includes('compiler-runtime') ||
      err.includes('Module not found')
    );

    if (runtimeErrors.length > 0) {
      console.log('Runtime errors detected:', runtimeErrors);
    }

    expect(runtimeErrors).toEqual([]);
  });

  test('should have working Payload admin assets', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/admin', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Check that the page loaded
    expect(response?.status()).toBe(200);

    // Check for Payload branding or UI elements
    const hasPayloadUI = await page.evaluate(() => {
      const bodyText = document.body.textContent || '';
      const hasPayloadText = bodyText.includes('Payload') ||
                            bodyText.includes('Dashboard') ||
                            bodyText.includes('Collections');
      return hasPayloadText;
    });

    expect(hasPayloadUI).toBe(true);
  });
});
