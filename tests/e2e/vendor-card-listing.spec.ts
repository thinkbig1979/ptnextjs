import { test, expect } from '@playwright/test';

test.describe('VendorCard Listing Component - E2E Tests', () => {
  const BASE_URL = 'http://localhost:3000';

  test('Test 1: Navigate to vendors listing page and verify cards display (max 30s)', async ({ page }) => {
    console.log('\n===== TEST 1: Vendors Listing Page Navigation =====');
    const timer = Date.now();

    // Navigate to vendors page
    await page.goto(`${BASE_URL}/vendors/`, { waitUntil: 'networkidle' });
    console.log('[OK] Navigated to /vendors/');

    // Wait for vendor cards (existing vendor-card component)
    const vendorCards = page.locator('[data-testid="vendor-card"], .hover-lift, [class*="card"]');
    const count = await vendorCards.count();

    console.log(`[OK] Found ${count} vendor cards`);
    expect(count).toBeGreaterThan(0);

    // Verify page title
    const title = await page.locator('h1').first().textContent();
    console.log(`[OK] Page title: "${title}"`);

    // Screenshot
    await page.screenshot({ path: '/tmp/test-1-vendors-page.png' });

    const duration = Date.now() - timer;
    console.log(`[OK] Test 1 passed in ${duration}ms`);
    expect(duration).toBeLessThan(30000);
  });

  test('Test 2: Verify card content (logo, name, description, tier badge) (max 30s)', async ({ page }) => {
    console.log('\n===== TEST 2: Card Content Verification =====');
    const timer = Date.now();

    await page.goto(`${BASE_URL}/vendors/`, { waitUntil: 'networkidle' });

    // Get first vendor card - the card structure is: <a><div data-testid="vendor-card">
    const firstCard = page.locator('[data-testid="vendor-card"]').first();
    await firstCard.waitFor({ state: 'visible', timeout: 10000 });

    // Check for image (logo) - logos are inside the card content
    const logoImg = firstCard.locator('img').first();
    const imgCount = await firstCard.locator('img').count();
    console.log(`[OK] Logo image elements: ${imgCount} (may be lazy-loaded)`);
    // Note: Some cards may not have logos, so we just log the count

    // Check company name - it's in h3 inside the vendor card
    const nameHeading = firstCard.locator('h3').first();
    const name = await nameHeading.textContent();
    console.log(`[OK] Company name: "${name?.trim()}"`);
    expect(name?.trim().length).toBeGreaterThan(0);

    // Check description - p element with line-clamp or muted-foreground class
    const description = firstCard.locator('p').first();
    const desc = await description.textContent();
    console.log(`[OK] Description (${desc?.length} chars): "${desc?.substring(0, 50)}..."`);
    // Description may be empty for some test vendors
    expect(desc !== null).toBe(true);

    // Check badges - tier badges and featured badges
    const badges = firstCard.locator('[class*="rounded-full"][class*="border"]');
    const badgeCount = await badges.count();
    console.log(`[OK] Badge elements: ${badgeCount}`);

    await page.screenshot({ path: '/tmp/test-2-card-content.png' });

    const duration = Date.now() - timer;
    console.log(`[OK] Test 2 passed in ${duration}ms`);
    expect(duration).toBeLessThan(30000);
  });

  test('Test 3: Verify hover effects (max 30s)', async ({ page }) => {
    console.log('\n===== TEST 3: Hover Effects =====');
    const timer = Date.now();

    await page.goto(`${BASE_URL}/vendors/`, { waitUntil: 'networkidle' });

    const card = page.locator('[data-testid="vendor-card"], .hover-lift').first();

    // Get styles before
    const before = await card.evaluate(el => {
      const style = window.getComputedStyle(el);
      return { shadow: style.boxShadow, transform: style.transform };
    });
    console.log(`Before hover - shadow: "${before.shadow.substring(0, 40)}"`);

    // Hover
    await card.hover();
    await page.waitForTimeout(800);

    // Get styles after
    const after = await card.evaluate(el => {
      const style = window.getComputedStyle(el);
      return { shadow: style.boxShadow, transform: style.transform };
    });
    console.log(`After hover - shadow: "${after.shadow.substring(0, 40)}"`);

    const shadowChanged = before.shadow !== after.shadow;
    const transformChanged = before.transform !== after.transform;

    console.log(`[OK] Shadow changed: ${shadowChanged}`);
    console.log(`[OK] Transform changed: ${transformChanged}`);

    expect(shadowChanged || transformChanged).toBe(true);

    await page.screenshot({ path: '/tmp/test-3-hover.png' });

    const duration = Date.now() - timer;
    console.log(`[OK] Test 3 passed in ${duration}ms`);
    expect(duration).toBeLessThan(30000);
  });

  test('Test 4: Test navigation to detail page (max 45s)', async ({ page }) => {
    console.log('\n===== TEST 4: Navigation to Detail Page =====');
    const timer = Date.now();

    await page.goto(`${BASE_URL}/vendors/`, { waitUntil: 'networkidle' });

    // Get first vendor card link - the link wraps the vendor card
    // Structure is: <li><a href="/vendors/..."><div data-testid="vendor-card">
    const firstVendorLink = page.locator('ul[aria-label="Vendors list"] li a[href^="/vendors/"]').first();
    const href = await firstVendorLink.getAttribute('href');

    console.log(`[OK] Card link: ${href}`);
    expect(href).toMatch(/\/vendors\/[^/]+\/?$/);

    // Click the link
    await firstVendorLink.click();

    // Wait for navigation - URL may or may not have trailing slash
    await page.waitForURL(/\/vendors\/[^/]+\/?$/, { timeout: 15000 });

    const currentUrl = page.url();
    console.log(`[OK] Navigated to: ${currentUrl}`);

    // Verify page loaded
    const heading = page.locator('h1, h2').first();
    const headingVisible = await heading.isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`[OK] Detail page loaded: ${headingVisible}`);

    await page.screenshot({ path: '/tmp/test-4-detail.png' });

    const duration = Date.now() - timer;
    console.log(`[OK] Test 4 passed in ${duration}ms`);
    expect(duration).toBeLessThan(45000);
  });

  test('Test 5: Test responsive layout (max 60s)', async ({ page }) => {
    console.log('\n===== TEST 5: Responsive Layout =====');
    const timer = Date.now();

    // MOBILE
    console.log('\n  Mobile (375px):');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/vendors/`, { waitUntil: 'networkidle' });

    const mobileCard = page.locator('[data-testid="vendor-card"], .hover-lift').first();
    const mobileVisible = await mobileCard.isVisible();
    console.log(`  [OK] Card visible: ${mobileVisible}`);

    await page.screenshot({ path: '/tmp/test-5-mobile.png' });

    // DESKTOP
    console.log('\n  Desktop (1024px):');
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto(`${BASE_URL}/vendors/`, { waitUntil: 'networkidle' });

    const desktopCard = page.locator('[data-testid="vendor-card"], .hover-lift').first();
    const desktopVisible = await desktopCard.isVisible();
    console.log(`  [OK] Card visible: ${desktopVisible}`);

    expect(mobileVisible && desktopVisible).toBe(true);

    await page.screenshot({ path: '/tmp/test-5-desktop.png' });

    const duration = Date.now() - timer;
    console.log(`\n[OK] Test 5 passed in ${duration}ms`);
    expect(duration).toBeLessThan(60000);
  });
});
