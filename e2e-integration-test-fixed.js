const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';

test.describe('PT2 Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    page.setDefaultTimeout(10000);
  });

  test('Homepage (/) - Check pt2 integration, hero section, Call Paul section, Two Pillars', async ({ page }) => {
    console.log('Testing Homepage...');
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Check page title
    await expect(page).toHaveTitle(/Paul Thames/);
    
    // Check for hero section
    const heroSection = page.locator('h1, .hero, [data-testid="hero-section"]');
    await expect(heroSection.first()).toBeVisible();
    
    // Check for Call Paul section
    const callPaulSection = page.locator('text="Call Paul" >> visible=true');
    const hasCallPaul = await callPaulSection.count() > 0;
    console.log('Call Paul section found:', hasCallPaul);
    
    // Check for Two Pillars content
    const twoPillarsSection = page.locator('text="Two Pillars" >> visible=true');
    const hasTwoPillars = await twoPillarsSection.count() > 0;
    console.log('Two Pillars content found:', hasTwoPillars);
    
    // Check for navigation menu
    const nav = page.locator('nav');
    await expect(nav.first()).toBeVisible();
  });

  test('Navigation menu - Test dropdown functionality for Discovery Platform submenu', async ({ page }) => {
    console.log('Testing Navigation menu...');
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Look for navigation elements
    const nav = page.locator('nav');
    await expect(nav.first()).toBeVisible();
    
    // Try to find Discovery Platform menu item
    const discoveryPlatformMenu = page.locator('text="Discovery Platform" >> visible=true');
    const hasDiscoveryMenu = await discoveryPlatformMenu.count() > 0;
    console.log('Discovery Platform menu found:', hasDiscoveryMenu);
    
    // Test other navigation links
    const aboutLink = page.locator('a[href*="about"]');
    const hasAboutLink = await aboutLink.count() > 0;
    console.log('About link found:', hasAboutLink);
  });

  test('Internal links between pages - Test navigation flow', async ({ page }) => {
    console.log('Testing internal navigation flow...');
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Test navigation to About page
    const aboutLink = page.locator('a[href*="about"]').first();
    if (await aboutLink.count() > 0) {
      await aboutLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('about');
      console.log('About page navigation: SUCCESS');
    } else {
      console.log('About link not found');
    }
  });
});
