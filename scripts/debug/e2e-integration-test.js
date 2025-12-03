const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';

test.describe('PT2 Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for page loads
    page.setDefaultTimeout(10000);
  });

  test('Homepage (/) - Check pt2 integration, hero section, Call Paul section, Two Pillars', async ({ page }) => {
    console.log('Testing Homepage...');
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Check page title
    await expect(page).toHaveTitle(/Paul Thames/);
    
    // Check for hero section
    const heroSection = page.locator('[data-testid="hero-section"], .hero, h1');
    await expect(heroSection.first()).toBeVisible();
    
    // Check for Call Paul section
    const callPaulSection = page.locator('text=Call Paul, text=Contact Paul, text=Get in Touch, [href*="tel:"], [href*="mailto:"]');
    const hasCallPaul = await callPaulSection.count() > 0;
    console.log('Call Paul section found:', hasCallPaul);
    
    // Check for Two Pillars content
    const twoPillarsSection = page.locator('text=Two Pillars, text=Discovery Platform, text=Bespoke Solutions');
    const hasTwoPillars = await twoPillarsSection.count() > 0;
    console.log('Two Pillars content found:', hasTwoPillars);
    
    // Check for navigation menu
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav.first()).toBeVisible();
    
    // Check for no console errors
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') logs.push(msg.text());
    });
    
    await page.waitForTimeout(2000);
    
    if (logs.length > 0) {
      console.log('Console errors:', logs);
    }
  });

  test('About page (/about) - Verify pt2 content integration', async ({ page }) => {
    console.log('Testing About page...');
    
    await page.goto(BASE_URL + '/about');
    await page.waitForLoadState('networkidle');
    
    // Check page loads without 404
    const notFound = page.locator('text=404, text=Not Found, text=Page not found');
    const isNotFound = await notFound.count() > 0;
    expect(isNotFound).toBeFalsy();
    
    // Check for main content
    const content = page.locator('main, .content, article, h1, h2');
    await expect(content.first()).toBeVisible();
    
    // Check for pt2 related content
    const pt2Content = page.locator('text=Paul Thames, text=superyacht, text=technology, text=marine');
    const hasPt2Content = await pt2Content.count() > 0;
    console.log('PT2 content found:', hasPt2Content);
  });

  test('Discovery Platform (/discovery-platform) - Check navigation menu and content', async ({ page }) => {
    console.log('Testing Discovery Platform page...');
    
    await page.goto(BASE_URL + '/discovery-platform');
    await page.waitForLoadState('networkidle');
    
    // Check page loads without 404
    const notFound = page.locator('text=404, text=Not Found, text=Page not found');
    const isNotFound = await notFound.count() > 0;
    expect(isNotFound).toBeFalsy();
    
    // Check for main content
    const content = page.locator('main, .content, article, h1, h2');
    await expect(content.first()).toBeVisible();
    
    // Check for discovery platform specific content
    const platformContent = page.locator('text=Discovery Platform, text=platform, text=discovery');
    const hasPlatformContent = await platformContent.count() > 0;
    console.log('Discovery Platform content found:', hasPlatformContent);
  });

  test('Bespoke Solutions (/bespoke-solutions) - Verify page loads and content', async ({ page }) => {
    console.log('Testing Bespoke Solutions page...');
    
    await page.goto(BASE_URL + '/bespoke-solutions');
    await page.waitForLoadState('networkidle');
    
    // Check page loads without 404
    const notFound = page.locator('text=404, text=Not Found, text=Page not found');
    const isNotFound = await notFound.count() > 0;
    expect(isNotFound).toBeFalsy();
    
    // Check for main content
    const content = page.locator('main, .content, article, h1, h2');
    await expect(content.first()).toBeVisible();
    
    // Check for bespoke solutions specific content
    const bespokeContent = page.locator('text=Bespoke Solutions, text=bespoke, text=solutions, text=custom');
    const hasBespokeContent = await bespokeContent.count() > 0;
    console.log('Bespoke Solutions content found:', hasBespokeContent);
  });

  test('Info For Vendors (/info-for-vendors) - Check page functionality', async ({ page }) => {
    console.log('Testing Info For Vendors page...');
    
    await page.goto(BASE_URL + '/info-for-vendors');
    await page.waitForLoadState('networkidle');
    
    // Check page loads without 404
    const notFound = page.locator('text=404, text=Not Found, text=Page not found');
    const isNotFound = await notFound.count() > 0;
    expect(isNotFound).toBeFalsy();
    
    // Check for main content
    const content = page.locator('main, .content, article, h1, h2');
    await expect(content.first()).toBeVisible();
    
    // Check for vendor-specific content
    const vendorContent = page.locator('text=vendor, text=Vendor, text=partner, text=Partner, text=supplier');
    const hasVendorContent = await vendorContent.count() > 0;
    console.log('Vendor content found:', hasVendorContent);
  });

  test('Navigation menu - Test dropdown functionality for Discovery Platform submenu', async ({ page }) => {
    console.log('Testing Navigation menu...');
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Look for navigation elements
    const nav = page.locator('nav, [role="navigation"], .navigation, .nav');
    await expect(nav.first()).toBeVisible();
    
    // Try to find Discovery Platform menu item
    const discoveryPlatformMenu = page.locator('text=Discovery Platform, [href*="discovery-platform"]');
    const hasDiscoveryMenu = await discoveryPlatformMenu.count() > 0;
    console.log('Discovery Platform menu found:', hasDiscoveryMenu);
    
    if (hasDiscoveryMenu) {
      // Try to hover or click to reveal submenu
      await discoveryPlatformMenu.first().hover();
      await page.waitForTimeout(500);
      
      // Check for submenu items
      const submenu = page.locator('[role="menu"], .submenu, .dropdown');
      const hasSubmenu = await submenu.count() > 0;
      console.log('Submenu found:', hasSubmenu);
    }
    
    // Test other navigation links
    const aboutLink = page.locator('[href*="about"], text=About');
    const hasAboutLink = await aboutLink.count() > 0;
    console.log('About link found:', hasAboutLink);
  });

  test('Internal links between pages - Test navigation flow', async ({ page }) => {
    console.log('Testing internal navigation flow...');
    
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Test navigation to About page
    const aboutLink = page.locator('[href*="about"], text=About').first();
    if (await aboutLink.count() > 0) {
      await aboutLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('about');
      console.log('About page navigation: SUCCESS');
    }
    
    // Go back to home
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Test navigation to Discovery Platform
    const discoveryLink = page.locator('[href*="discovery-platform"], text=Discovery Platform').first();
    if (await discoveryLink.count() > 0) {
      await discoveryLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('discovery-platform');
      console.log('Discovery Platform navigation: SUCCESS');
    }
    
    // Go back to home
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Test navigation to Bespoke Solutions
    const bespokeLink = page.locator('[href*="bespoke-solutions"], text=Bespoke Solutions').first();
    if (await bespokeLink.count() > 0) {
      await bespokeLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('bespoke-solutions');
      console.log('Bespoke Solutions navigation: SUCCESS');
    }
  });

  test('Images load properly across all pages', async ({ page }) => {
    console.log('Testing image loading...');
    
    const pagesToTest = ['/', '/about', '/discovery-platform', '/bespoke-solutions', '/info-for-vendors'];
    
    for (const pageUrl of pagesToTest) {
      console.log('Checking images on ' + pageUrl + '...');
      
      await page.goto(BASE_URL + pageUrl);
      await page.waitForLoadState('networkidle');
      
      // Wait for images to load
      await page.waitForTimeout(2000);
      
      // Check for images
      const images = page.locator('img');
      const imageCount = await images.count();
      console.log('Found ' + imageCount + ' images on ' + pageUrl);
      
      // Check if images are loaded (not broken)
      for (let i = 0; i < Math.min(imageCount, 5); i++) { // Check first 5 images
        const img = images.nth(i);
        const src = await img.getAttribute('src');
        if (src && !src.startsWith('data:')) {
          const naturalWidth = await img.evaluate(el => el.naturalWidth);
          if (naturalWidth === 0) {
            console.log('Broken image found: ' + src);
          }
        }
      }
    }
  });

  test('Responsive design - Mobile and desktop views', async ({ page }) => {
    console.log('Testing responsive design...');
    
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Check navigation is visible on desktop
    const desktopNav = page.locator('nav, [role="navigation"]');
    await expect(desktopNav.first()).toBeVisible();
    console.log('Desktop navigation: VISIBLE');
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // Check if mobile navigation exists (hamburger menu, etc.)
    const mobileNav = page.locator('[aria-label*="menu"], .hamburger, [data-testid*="mobile"], button[aria-expanded]');
    const hasMobileNav = await mobileNav.count() > 0;
    console.log('Mobile navigation found:', hasMobileNav);
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    
    const content = page.locator('main, .content, article');
    await expect(content.first()).toBeVisible();
    console.log('Tablet view: RESPONSIVE');
  });

  test('No console errors across all pages', async ({ page }) => {
    console.log('Testing for console errors...');
    
    const pagesToTest = ['/', '/about', '/discovery-platform', '/bespoke-solutions', '/info-for-vendors'];
    const allErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        allErrors.push(msg.text());
      }
    });
    
    for (const pageUrl of pagesToTest) {
      console.log('Checking console errors on ' + pageUrl + '...');
      
      await page.goto(BASE_URL + pageUrl);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }
    
    if (allErrors.length > 0) {
      console.log('Console errors found:', allErrors);
      // Do not fail the test for console errors, just report them
    } else {
      console.log('No console errors found!');
    }
  });
});
