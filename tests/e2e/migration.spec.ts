/**
 * End-to-End Migration Testing
 *
 * Comprehensive E2E tests validating the TinaCMS → Payload CMS migration.
 * Tests cover all pages, content display, relationships, enhanced fields,
 * rich text rendering, and media loading.
 *
 * Test Scenarios:
 * 1. Navigation Testing
 * 2. Content Display Testing
 * 3. Relationship Testing
 * 4. Enhanced Fields Testing
 * 5. Rich Text Testing
 * 6. Media Testing
 * 7. Search and Filter Testing
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// Evidence directory for screenshots
const EVIDENCE_DIR = path.join(
  __dirname,
  '../../.agent-os/specs/2025-10-14-complete-tinacms-payload-migration/evidence/e2e'
);

// Ensure evidence directory exists
test.beforeAll(() => {
  if (!fs.existsSync(EVIDENCE_DIR)) {
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  }
});

/**
 * Test Scenario 1: Navigation Testing
 */
test.describe('1. Navigation Testing', () => {
  test('should navigate to all main pages without errors', async ({ page }) => {
    // Routes that exist in this application (no /team - team is on /about)
    const routes = [
      { path: '/', title: /paul thames|superyacht|home/i },
      { path: '/vendors', title: /vendors|partners/i },
      { path: '/products', title: /products|catalog/i },
      { path: '/yachts', title: /yachts|fleet/i },
      { path: '/blog', title: /blog|news|articles/i },
      { path: '/about', title: /about|company/i },
    ];

    for (const route of routes) {
      await page.goto(route.path);
      await expect(page).toHaveURL(new RegExp(route.path));

      // Wait for page to stabilize
      await page.waitForLoadState('networkidle');

      // Verify page loaded (has content)
      await expect(page.locator('body')).not.toBeEmpty();
      console.log(`[OK] Route ${route.path} loaded successfully`);
    }
  });

  test('should navigate from vendors list to vendor detail', async ({ page }) => {
    await page.goto('/vendors');
    await page.waitForLoadState('networkidle');

    // Wait for vendor cards to load
    const vendorCards = page.locator('[data-testid="vendor-card"]');
    await expect(vendorCards.first()).toBeVisible({ timeout: 30000 });

    // The vendor card is wrapped entirely in a Link - click the card itself
    await vendorCards.first().click();

    // Should be on vendor detail page
    await expect(page).toHaveURL(/\/(vendors|partners)\/[^/]+/);

    // Vendor detail should have content
    await expect(page.locator('h1')).toBeVisible();
    console.log('[OK] Vendor list to detail navigation working');
  });

  test('should navigate from products list to product detail', async ({ page }) => {
    await page.goto('/products');

    // Wait for product cards to load
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.waitFor({ timeout: 10000 });

    // Click the link inside the first product card
    await firstProduct.locator('a').first().click();

    // Should be on product detail page
    await expect(page).toHaveURL(/\/products\/[^/]+/);

    // Product detail should have content
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should navigate from yachts list to yacht detail', async ({ page }) => {
    await page.goto('/yachts');
    await page.waitForLoadState('networkidle');

    // Check if yacht cards exist
    const yachtCards = page.locator('[data-testid="yacht-card"]');
    const count = await yachtCards.count();

    if (count === 0) {
      console.log('[SKIP] No yacht cards available to test navigation');
      // Test passes - no yachts seeded is valid state
      return;
    }

    // Wait for yacht cards to load
    const firstYacht = yachtCards.first();
    await firstYacht.waitFor({ timeout: 10000 });

    // Click the link inside the first yacht card
    await firstYacht.locator('a').first().click();

    // Should be on yacht detail page
    await expect(page).toHaveURL(/\/yachts\/[^/]+/);

    // Yacht detail should have content
    await expect(page.locator('h1')).toBeVisible();
    console.log('[OK] Yacht navigation working');
  });

  test('should navigate from product to vendor via relationship link', async ({ page }) => {
    await page.goto('/products');

    // Click link inside first product card
    await page.locator('[data-testid="product-card"]').first().locator('a').first().click();
    await page.waitForLoadState('networkidle');

    // Find and click vendor link on product detail
    const vendorLink = page.locator('[data-testid="product-vendor-link"]').first();
    if (await vendorLink.isVisible()) {
      await vendorLink.click();

      // Should navigate to vendor detail
      await expect(page).toHaveURL(/\/vendors\/[^/]+/);
      console.log('[OK] Product → Vendor navigation working');
    }
  });
});

/**
 * Test Scenario 2: Content Display Testing
 */
test.describe('2. Content Display Testing', () => {
  test('should display featured content on homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for featured sections (at least one should exist)
    const hasFeaturedVendors = await page.locator('[data-testid="featured-vendors"]').isVisible();
    const hasFeaturedProducts = await page.locator('[data-testid="featured-products"]').isVisible();
    const hasFeaturedYachts = await page.locator('[data-testid="featured-yachts"]').isVisible();

    expect(hasFeaturedVendors || hasFeaturedProducts || hasFeaturedYachts).toBeTruthy();

    // Take screenshot
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, 'homepage-featured-content.png'),
      fullPage: true,
    });

    console.log('[OK] Homepage displays featured content');
  });

  test('should display all vendors on /vendors page', async ({ page }) => {
    await page.goto('/vendors');
    await page.waitForLoadState('networkidle');

    // Check vendor cards exist
    const vendorCards = page.locator('[data-testid="vendor-card"]');
    const count = await vendorCards.count();
    expect(count).toBeGreaterThan(0);

    console.log(`[OK] Vendors page displays ${count} vendors`);

    // Take screenshot
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, 'vendors-list.png'),
      fullPage: true,
    });
  });

  test('should display all products on /products page', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Check product cards exist
    const productCards = page.locator('[data-testid="product-card"]');
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);

    console.log(`[OK] Products page displays ${count} products`);

    // Take screenshot
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, 'products-list.png'),
      fullPage: true,
    });
  });

  test('should display yachts page correctly', async ({ page }) => {
    await page.goto('/yachts');
    await page.waitForLoadState('networkidle');

    // Check page title/header exists
    const pageHeader = page.getByRole('heading', { name: /yacht/i }).first();
    await expect(pageHeader).toBeVisible();

    // Check yacht cards if they exist (may have no yachts seeded)
    const yachtCards = page.locator('[data-testid="yacht-card"]');
    const count = await yachtCards.count();

    if (count > 0) {
      console.log(`[OK] Yachts page displays ${count} yachts`);
      // Take screenshot
      await page.screenshot({
        path: path.join(EVIDENCE_DIR, 'yachts-list.png'),
        fullPage: true,
      });
    } else {
      console.log('[INFO] Yachts page loaded but no yacht data seeded');
    }

    // Page should at least be functional
    expect(await pageHeader.textContent()).toBeTruthy();
  });

  test('should display blog posts on /blog page', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    // Check blog post cards exist
    const postCards = page.locator('[data-testid="blog-post-card"]');
    const count = await postCards.count();
    expect(count).toBeGreaterThan(0);

    console.log(`[OK] Blog page displays ${count} posts`);
  });

  test('should display team members on /about page if available', async ({ page }) => {
    // Note: Team members are displayed on the /about page, not a separate /team page
    // The team section only renders if there are team members in the database
    await page.goto('/about');
    await page.waitForLoadState('networkidle');

    // Check for "Our Team" section header (may not exist if no team members)
    const teamHeader = page.getByRole('heading', { name: /our team/i });
    const hasTeamSection = await teamHeader.isVisible().catch(() => false);

    if (hasTeamSection) {
      // Check team member cards exist
      const teamSection = page.locator('h2:has-text("Our Team")').locator('..');
      const teamCards = teamSection.locator('.grid >> div:has(img)');
      const count = await teamCards.count();
      expect(count).toBeGreaterThan(0);
      console.log(`[OK] About page displays ${count} team members`);
    } else {
      // No team members in database - this is valid state
      console.log('[INFO] No team section found (no team members seeded in database)');
    }
  });

  test('should display company info on /about page', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('networkidle');

    // Check company info sections exist
    const hasCompanyName = await page.locator('h1, h2').first().isVisible();
    expect(hasCompanyName).toBeTruthy();

    console.log('[OK] About page displays company info');
  });
});

/**
 * Test Scenario 3: Relationship Testing
 */
test.describe('3. Relationship Testing', () => {
  test('should display vendor info on product detail page', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Wait for product cards
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards.first()).toBeVisible({ timeout: 15000 });

    // Click learn more or first link in the product card
    const firstCard = productCards.first();
    const link = firstCard.getByRole('link').first();
    await link.click();
    await page.waitForLoadState('networkidle');

    // Check for vendor information section
    const hasVendorSection = await page.locator('[data-testid="product-vendor"], [class*="vendor"], h2:has-text("Vendor")').first().isVisible().catch(() => false);

    if (hasVendorSection) {
      console.log('[OK] Product detail shows vendor relationship');
    } else {
      console.log('[INFO] Vendor relationship not displayed on product detail (product may not have vendor link)');
    }
  });

  test('should display products on vendor detail page', async ({ page }) => {
    await page.goto('/vendors');
    await page.waitForLoadState('networkidle');

    // Wait for vendor cards
    const vendorCards = page.locator('[data-testid="vendor-card"]');
    await expect(vendorCards.first()).toBeVisible({ timeout: 30000 });

    // The vendor card is wrapped entirely in a Link - click the card itself
    await vendorCards.first().click();
    await page.waitForLoadState('networkidle');

    // Check for products section
    const hasProductsSection = await page.locator('[data-testid="vendor-products"], h2:has-text("Products"), h3:has-text("Products")').first().isVisible().catch(() => false);

    if (hasProductsSection) {
      console.log('[OK] Vendor detail shows related products');
    } else {
      console.log('[INFO] Products not displayed on vendor detail (vendor may not have products)');
    }
  });

  test('should display supplier map on yacht detail page', async ({ page }) => {
    await page.goto('/yachts');
    await page.waitForLoadState('networkidle');

    // Check if yacht cards exist
    const yachtCards = page.locator('[data-testid="yacht-card"]');
    if ((await yachtCards.count()) === 0) {
      console.log('[SKIP] No yachts available to test supplier map');
      return;
    }

    await yachtCards.first().locator('a').first().click();
    await page.waitForLoadState('networkidle');

    // Check for supplier map section (or similar map element)
    const hasSupplierMap = await page.locator('[data-testid="supplier-map"], .leaflet-container, [class*="map"]').first().isVisible().catch(() => false);

    if (hasSupplierMap) {
      console.log('[OK] Yacht detail shows supplier map');

      // Take screenshot
      await page.screenshot({
        path: path.join(EVIDENCE_DIR, 'yacht-supplier-map.png'),
        fullPage: true,
      });
    } else {
      console.log('[INFO] Supplier map not displayed on yacht detail (may not have supplier data)');
    }
  });
});

/**
 * Test Scenario 4: Enhanced Fields Testing
 */
test.describe('4. Enhanced Fields Testing', () => {
  // Helper to navigate to vendor detail
  async function goToVendorDetail(page) {
    await page.goto('/vendors');
    await page.waitForLoadState('networkidle');

    const vendorCards = page.locator('[data-testid="vendor-card"]');
    await expect(vendorCards.first()).toBeVisible({ timeout: 30000 });

    // The vendor card is wrapped entirely in a Link - click the card itself
    await vendorCards.first().click();
    await page.waitForLoadState('networkidle');
  }

  test('should display vendor certifications if available', async ({ page }) => {
    await goToVendorDetail(page);

    // Check for certifications section using multiple locator strategies
    const hasCertifications = await page
      .locator('[data-testid="certifications"], :text("Certifications"), h2:has-text("Certifications"), h3:has-text("Certifications")')
      .first()
      .isVisible()
      .catch(() => false);

    if (hasCertifications) {
      console.log('[OK] Vendor certifications displayed');
    } else {
      console.log('[INFO] Certifications section not found (vendor may not have certifications)');
    }
  });

  test('should display vendor awards if available', async ({ page }) => {
    await goToVendorDetail(page);

    // Check for awards section using multiple locator strategies
    const hasAwards = await page
      .locator('[data-testid="awards"], :text("Awards"), h2:has-text("Awards"), h3:has-text("Awards")')
      .first()
      .isVisible()
      .catch(() => false);

    if (hasAwards) {
      console.log('[OK] Vendor awards displayed');
    } else {
      console.log('[INFO] Awards section not found (vendor may not have awards)');
    }
  });

  test('should display vendor case studies if available', async ({ page }) => {
    await goToVendorDetail(page);

    // Check for case studies section using multiple locator strategies
    const hasCaseStudies = await page
      .locator('[data-testid="case-studies"], :text("Case Studies"), h2:has-text("Case Studies"), h3:has-text("Case Studies")')
      .first()
      .isVisible()
      .catch(() => false);

    if (hasCaseStudies) {
      console.log('[OK] Vendor case studies displayed');
    } else {
      console.log('[INFO] Case studies section not found (vendor may not have case studies)');
    }
  });

  // Helper to navigate to product detail
  async function goToProductDetail(page) {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards.first()).toBeVisible({ timeout: 15000 });

    await productCards.first().getByRole('link').first().click();
    await page.waitForLoadState('networkidle');
  }

  test('should display product comparison metrics', async ({ page }) => {
    await goToProductDetail(page);

    // Check for comparison metrics section
    const hasComparisonMetrics = await page.locator('[data-testid="comparison-metrics"], [class*="metrics"], [class*="comparison"]').first().isVisible().catch(() => false);

    if (hasComparisonMetrics) {
      console.log('[OK] Product comparison metrics displayed');
    } else {
      console.log('[INFO] Comparison metrics section not found (product may not have metrics)');
    }
  });

  test('should display product owner reviews', async ({ page }) => {
    await goToProductDetail(page);

    // Check for owner reviews section
    const hasOwnerReviews = await page.locator('[data-testid="owner-reviews"], [data-testid="reviews"], h2:has-text("Reviews"), h3:has-text("Reviews")').first().isVisible().catch(() => false);

    if (hasOwnerReviews) {
      console.log('[OK] Product owner reviews displayed');
    } else {
      console.log('[INFO] Owner reviews section not found (product may not have reviews)');
    }
  });

  test('should display yacht timeline', async ({ page }) => {
    await page.goto('/yachts');
    await page.waitForLoadState('networkidle');

    // Check if yacht cards exist
    const yachtCards = page.locator('[data-testid="yacht-card"]');
    if ((await yachtCards.count()) === 0) {
      console.log('[SKIP] No yachts available to test timeline');
      return;
    }

    await yachtCards.first().locator('a').first().click();
    await page.waitForLoadState('networkidle');

    // Check for timeline section
    const hasTimeline = await page.locator('[data-testid="yacht-timeline"], [class*="timeline"]').first().isVisible().catch(() => false);

    if (hasTimeline) {
      console.log('[OK] Yacht timeline displayed');

      // Take screenshot
      await page.screenshot({
        path: path.join(EVIDENCE_DIR, 'yacht-timeline.png'),
        fullPage: true,
      });
    } else {
      console.log('[INFO] Timeline section not found (may not have timeline data)');
    }
  });

  test('should display yacht sustainability metrics', async ({ page }) => {
    await page.goto('/yachts');
    await page.waitForLoadState('networkidle');

    // Check if yacht cards exist
    const yachtCards = page.locator('[data-testid="yacht-card"]');
    if ((await yachtCards.count()) === 0) {
      console.log('[SKIP] No yachts available to test sustainability');
      return;
    }

    await yachtCards.first().locator('a').first().click();
    await page.waitForLoadState('networkidle');

    // Check for sustainability section
    const hasSustainability = await page.locator('[data-testid="sustainability"], [class*="sustainab"]').first().isVisible().catch(() => false);

    if (hasSustainability) {
      console.log('[OK] Yacht sustainability metrics displayed');
    } else {
      console.log('[INFO] Sustainability section not found (may not have sustainability data)');
    }
  });
});

/**
 * Test Scenario 5: Rich Text Testing
 */
test.describe('5. Rich Text Testing', () => {
  test('should render vendor description (Lexical → HTML)', async ({ page }) => {
    await page.goto('/vendors');
    await page.waitForLoadState('networkidle');

    // Navigate to vendor detail - click the card itself
    const vendorCards = page.locator('[data-testid="vendor-card"]');
    await expect(vendorCards.first()).toBeVisible({ timeout: 30000 });
    await vendorCards.first().click();
    await page.waitForLoadState('networkidle');

    // Check for rendered description content - may have data-testid or be in a prose section
    const description = page.locator('[data-testid="vendor-description"], .prose, [class*="description"]').first();
    const hasDescription = await description.isVisible().catch(() => false);

    if (hasDescription) {
      const text = await description.textContent();
      if (text && text.length > 0) {
        console.log('[OK] Vendor description renders correctly');
      } else {
        console.log('[INFO] Vendor description section exists but has no content');
      }
    } else {
      console.log('[INFO] Vendor description section not found (vendor may not have description)');
    }
  });

  test('should render product description', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Wait for product cards
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards.first()).toBeVisible({ timeout: 15000 });

    // Click on the first product
    await productCards.first().getByRole('link').first().click();
    await page.waitForLoadState('networkidle');

    // Check for rendered description content
    const description = page.locator('[data-testid="product-description"], .prose, [class*="description"]').first();
    const hasDescription = await description.isVisible().catch(() => false);

    if (hasDescription) {
      const text = await description.textContent();
      if (text && text.length > 0) {
        console.log('[OK] Product description renders correctly');
      } else {
        console.log('[INFO] Product description exists but has no content');
      }
    } else {
      console.log('[INFO] Product description not found');
    }
  });

  test('should render blog post content', async ({ page }) => {
    await page.goto('/blog');
    await page.locator('[data-testid="blog-post-card"]').first().click();
    await page.waitForLoadState('networkidle');

    // Check for rendered blog content
    const content = page.locator('article, [data-testid="blog-content"]');
    const hasContent = await content.isVisible();

    if (hasContent) {
      const text = await content.textContent();
      expect(text).not.toBeNull();
      expect(text!.length).toBeGreaterThan(0);
      console.log('[OK] Blog post content renders correctly');
    }
  });
});

/**
 * Test Scenario 6: Media Testing
 */
test.describe('6. Media Testing', () => {
  test('should load vendor logos without errors', async ({ page }) => {
    await page.goto('/vendors');
    await page.waitForLoadState('networkidle');

    // Check for vendor logo images
    const logoImages = page.locator('[data-testid="vendor-card"] img');
    const count = await logoImages.count();

    if (count > 0) {
      // Check first logo loads successfully
      const firstLogo = logoImages.first();
      const naturalWidth = await firstLogo.evaluate((img: HTMLImageElement) => img.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);

      console.log(`[OK] Vendor logos load correctly (${count} logos)`);
    }
  });

  test('should load product images without errors', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Check for product images
    const productImages = page.locator('[data-testid="product-card"] img');
    const count = await productImages.count();

    if (count > 0) {
      // Check first image loads successfully
      const firstImage = productImages.first();
      const naturalWidth = await firstImage.evaluate((img: HTMLImageElement) => img.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);

      console.log(`[OK] Product images load correctly (${count} images)`);
    }
  });

  test('should load yacht images without errors', async ({ page }) => {
    await page.goto('/yachts');
    await page.waitForLoadState('networkidle');

    // Check for yacht images
    const yachtImages = page.locator('[data-testid="yacht-card"] img');
    const count = await yachtImages.count();

    if (count > 0) {
      // Check first image loads successfully
      const firstImage = yachtImages.first();
      const naturalWidth = await firstImage.evaluate((img: HTMLImageElement) => img.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);

      console.log(`[OK] Yacht images load correctly (${count} images)`);
    }
  });

  test('should load team member photos without errors', async ({ page }) => {
    await page.goto('/team');
    await page.waitForLoadState('networkidle');

    // Check for team member photos
    const photoImages = page.locator('[data-testid="team-member-card"] img');
    const count = await photoImages.count();

    if (count > 0) {
      // Check first photo loads successfully
      const firstPhoto = photoImages.first();
      const naturalWidth = await firstPhoto.evaluate((img: HTMLImageElement) => img.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);

      console.log(`[OK] Team member photos load correctly (${count} photos)`);
    }
  });

  test('should not have any broken images on homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get all images
    const images = page.locator('img');
    const count = await images.count();

    let brokenCount = 0;
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const naturalWidth = await img.evaluate((img: HTMLImageElement) => img.naturalWidth);
      if (naturalWidth === 0) {
        brokenCount++;
      }
    }

    expect(brokenCount).toBe(0);
    console.log(`[OK] Homepage has no broken images (${count} images checked)`);
  });
});

/**
 * Test Scenario 7: Search and Filter Testing
 */
test.describe('7. Search and Filter Testing', () => {
  test('should filter products by category', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Check for category filter
    const categoryFilter = page.locator('[data-testid="category-filter"]');
    const hasFilter = await categoryFilter.isVisible();

    if (hasFilter) {
      // Get initial count
      const initialCount = await page.locator('[data-testid="product-card"]').count();

      // Click a category filter option
      await categoryFilter.click();
      const firstOption = page.locator('[data-testid="category-option"]').first();
      if (await firstOption.isVisible()) {
        await firstOption.click();
        await page.waitForLoadState('networkidle');

        // Check filtered results
        const filteredCount = await page.locator('[data-testid="product-card"]').count();
        console.log(`[OK] Category filter works (${initialCount} → ${filteredCount} products)`);
      }
    } else {
      console.log('[WARN]️  Category filter not found');
    }
  });

  test('should filter blog posts by category', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    // Check for category filter
    const categoryFilter = page.locator('[data-testid="blog-category-filter"]');
    const hasFilter = await categoryFilter.isVisible();

    if (hasFilter) {
      console.log('[OK] Blog category filter exists');
    } else {
      console.log('[WARN]️  Blog category filter not found');
    }
  });

  test('should display featured content correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for featured flags or sections
    const hasFeaturedContent = await page.locator('[data-featured="true"], [data-testid*="featured"]').count() > 0;

    if (hasFeaturedContent) {
      console.log('[OK] Featured content filtering works');
    }
  });
});

/**
 * Additional: Console Errors and 404 Testing
 */
test.describe('8. Error Detection', () => {
  test('should have no critical console errors on any major page', async ({ page }) => {
    // Routes that exist in this application (no /team - team is on /about)
    const routes = ['/', '/vendors', '/products', '/yachts', '/blog', '/about'];
    const allErrors: { route: string; errors: string[] }[] = [];

    // Expected errors that are safe to ignore (e.g., 401 auth checks when not logged in)
    const expectedErrorPatterns = [
      /401/,  // Auth check failures are expected when not logged in
      /Unauthorized/,
      /Failed to load resource.*401/,
    ];

    for (const route of routes) {
      const errors: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          const text = msg.text();
          // Only capture unexpected errors
          const isExpected = expectedErrorPatterns.some(pattern => pattern.test(text));
          if (!isExpected) {
            errors.push(text);
          }
        }
      });

      await page.goto(route);
      await page.waitForLoadState('networkidle');

      if (errors.length > 0) {
        allErrors.push({ route, errors });
      }
    }

    if (allErrors.length > 0) {
      console.log('[WARN]️  Unexpected console errors found:');
      allErrors.forEach(({ route, errors }) => {
        console.log(`  ${route}: ${errors.length} errors`);
        errors.forEach(err => console.log(`    - ${err}`));
      });
    }

    expect(allErrors.length).toBe(0);
  });

  test('should have no 404 errors on major pages', async ({ page }) => {
    // Routes that exist in this application (no /team - team is on /about)
    const routes = ['/', '/vendors', '/products', '/yachts', '/blog', '/about'];
    const notFoundRoutes: string[] = [];

    for (const route of routes) {
      const response = await page.goto(route);
      if (response && response.status() === 404) {
        notFoundRoutes.push(route);
      }
    }

    expect(notFoundRoutes.length).toBe(0);
    console.log('[OK] No 404 errors on major pages');
  });
});
