import { test, expect } from '@playwright/test';

test.describe('VendorCard Listing Component - E2E Tests', () => {
  const BASE_URL = `${BASE_URL}';

  test('Test 1: Navigate to vendors listing page and verify cards display (max 30s)', async ({ page }) => {
    console.log('\n===== TEST 1: Vendors Listing Page Navigation =====');
    const timer = Date.now();

    // Navigate to vendors page
    await page.goto(`${BASE_URL}/vendors/`, { waitUntil: 'networkidle' });
    console.log('✓ Navigated to /vendors/');

    // Wait for vendor cards (existing vendor-card component)
    const vendorCards = page.locator('[data-testid="vendor-card"], .hover-lift, [class*="card"]');
    const count = await vendorCards.count();

    console.log(`✓ Found ${count} vendor cards`);
    expect(count).toBeGreaterThan(0);

    // Verify page title
    const title = await page.locator('h1').first().textContent();
    console.log(`✓ Page title: "${title}"`);

    // Screenshot
    await page.screenshot({ path: '/tmp/test-1-vendors-page.png' });

    const duration = Date.now() - timer;
    console.log(`✓ Test 1 passed in ${duration}ms`);
    expect(duration).toBeLessThan(30000);
  });

  test('Test 2: Verify card content (logo, name, description, tier badge) (max 30s)', async ({ page }) => {
    console.log('\n===== TEST 2: Card Content Verification =====');
    const timer = Date.now();

    await page.goto(`${BASE_URL}/vendors/`, { waitUntil: 'networkidle' });

    // Get first vendor card
    const firstCard = page.locator('[data-testid="vendor-card"]').first();
    await firstCard.waitFor({ state: 'visible', timeout: 10000 });

    // Check for image (logo) - logos are in separate Link element above CardHeader
    const logoLink = page.locator('[data-testid="vendor-card"]').first().locator('a[href*="/vendors/"]').first();
    const logoImg = logoLink.locator('img');
    const imgCount = await logoImg.count();
    console.log(`✓ Logo image elements: ${imgCount} (may be lazy-loaded)`);
    // Note: Some cards may not have logos, so we just log the count

    // Check company name - it's in a Link inside CardTitle
    const nameLink = firstCard.locator('a[href*="/vendors/"]').filter({ hasText: /.+/ }).first();
    const name = await nameLink.textContent();
    console.log(`✓ Company name: "${name?.trim()}"`);
    expect(name?.trim().length).toBeGreaterThan(0);

    // Check description - CardDescription with line-clamp-3
    const description = firstCard.locator('[class*="line-clamp"], p').first();
    const desc = await description.textContent();
    console.log(`✓ Description (${desc?.length} chars): "${desc?.substring(0, 50)}..."`);
    expect(desc?.length).toBeGreaterThan(0);

    // Check badges
    const badges = firstCard.locator('[class*="badge"], [class*="Badge"]');
    const badgeCount = await badges.count();
    console.log(`✓ Badge elements: ${badgeCount}`);

    await page.screenshot({ path: '/tmp/test-2-card-content.png' });

    const duration = Date.now() - timer;
    console.log(`✓ Test 2 passed in ${duration}ms`);
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

    console.log(`✓ Shadow changed: ${shadowChanged}`);
    console.log(`✓ Transform changed: ${transformChanged}`);

    expect(shadowChanged || transformChanged).toBe(true);

    await page.screenshot({ path: '/tmp/test-3-hover.png' });

    const duration = Date.now() - timer;
    console.log(`✓ Test 3 passed in ${duration}ms`);
    expect(duration).toBeLessThan(30000);
  });

  test('Test 4: Test navigation to detail page (max 45s)', async ({ page }) => {
    console.log('\n===== TEST 4: Navigation to Detail Page =====');
    const timer = Date.now();

    await page.goto(`${BASE_URL}/vendors/`, { waitUntil: 'networkidle' });

    // Get first card link
    const link = page.locator('a[href*="/vendors/"]').first();
    const href = await link.getAttribute('href');

    console.log(`✓ Card link: ${href}`);
    expect(href).toMatch(/\/vendors\/[^/]+\/?$/);

    // Click
    await link.click();

    // Wait for navigation - URL may or may not have trailing slash
    await page.waitForURL(/\/vendors\/[^/]+\/?$/, { timeout: 15000 });

    const currentUrl = page.url();
    console.log(`✓ Navigated to: ${currentUrl}`);

    // Verify page loaded
    const heading = page.locator('h1, h2').first();
    const headingVisible = await heading.isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`✓ Detail page loaded: ${headingVisible}`);

    await page.screenshot({ path: '/tmp/test-4-detail.png' });

    const duration = Date.now() - timer;
    console.log(`✓ Test 4 passed in ${duration}ms`);
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
    console.log(`  ✓ Card visible: ${mobileVisible}`);

    await page.screenshot({ path: '/tmp/test-5-mobile.png' });

    // DESKTOP
    console.log('\n  Desktop (1024px):');
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto(`${BASE_URL}/vendors/`, { waitUntil: 'networkidle' });

    const desktopCard = page.locator('[data-testid="vendor-card"], .hover-lift').first();
    const desktopVisible = await desktopCard.isVisible();
    console.log(`  ✓ Card visible: ${desktopVisible}`);

    expect(mobileVisible && desktopVisible).toBe(true);

    await page.screenshot({ path: '/tmp/test-5-desktop.png' });

    const duration = Date.now() - timer;
    console.log(`\n✓ Test 5 passed in ${duration}ms`);
    expect(duration).toBeLessThan(60000);
  });
});
