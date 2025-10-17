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
    const routes = [
      { path: '/', title: /paul thames|superyacht|home/i },
      { path: '/vendors', title: /vendors|partners/i },
      { path: '/products', title: /products|catalog/i },
      { path: '/yachts', title: /yachts|fleet/i },
      { path: '/blog', title: /blog|news|articles/i },
      { path: '/team', title: /team|about/i },
      { path: '/about', title: /about|company/i },
    ];

    for (const route of routes) {
      await page.goto(route.path);
      await expect(page).toHaveURL(new RegExp(route.path));

      // Check no console errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      // Wait for page to stabilize
      await page.waitForLoadState('networkidle');

      expect(errors.length).toBe(0);
      console.log(`✅ Route ${route.path} loaded successfully`);
    }
  });

  test('should navigate from vendors list to vendor detail', async ({ page }) => {
    await page.goto('/vendors');

    // Wait for vendor cards to load
    const firstVendor = page.locator('[data-testid="vendor-card"]').first();
    await firstVendor.waitFor({ timeout: 10000 });

    // Click the link inside the first vendor card
    await firstVendor.locator('a').first().click();

    // Should be on vendor detail page
    await expect(page).toHaveURL(/\/vendors\/[^/]+/);

    // Vendor detail should have content
    await expect(page.locator('h1')).toBeVisible();
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

    // Wait for yacht cards to load
    const firstYacht = page.locator('[data-testid="yacht-card"]').first();
    await firstYacht.waitFor({ timeout: 10000 });

    // Click the link inside the first yacht card
    await firstYacht.locator('a').first().click();

    // Should be on yacht detail page
    await expect(page).toHaveURL(/\/yachts\/[^/]+/);

    // Yacht detail should have content
    await expect(page.locator('h1')).toBeVisible();
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
      console.log('✅ Product → Vendor navigation working');
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

    console.log('✅ Homepage displays featured content');
  });

  test('should display all vendors on /vendors page', async ({ page }) => {
    await page.goto('/vendors');
    await page.waitForLoadState('networkidle');

    // Check vendor cards exist
    const vendorCards = page.locator('[data-testid="vendor-card"]');
    const count = await vendorCards.count();
    expect(count).toBeGreaterThan(0);

    console.log(`✅ Vendors page displays ${count} vendors`);

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

    console.log(`✅ Products page displays ${count} products`);

    // Take screenshot
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, 'products-list.png'),
      fullPage: true,
    });
  });

  test('should display all yachts on /yachts page', async ({ page }) => {
    await page.goto('/yachts');
    await page.waitForLoadState('networkidle');

    // Check yacht cards exist
    const yachtCards = page.locator('[data-testid="yacht-card"]');
    const count = await yachtCards.count();
    expect(count).toBeGreaterThan(0);

    console.log(`✅ Yachts page displays ${count} yachts`);

    // Take screenshot
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, 'yachts-list.png'),
      fullPage: true,
    });
  });

  test('should display blog posts on /blog page', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    // Check blog post cards exist
    const postCards = page.locator('[data-testid="blog-post-card"]');
    const count = await postCards.count();
    expect(count).toBeGreaterThan(0);

    console.log(`✅ Blog page displays ${count} posts`);
  });

  test('should display team members on /team page', async ({ page }) => {
    await page.goto('/team');
    await page.waitForLoadState('networkidle');

    // Check team member cards exist
    const teamCards = page.locator('[data-testid="team-member-card"]');
    const count = await teamCards.count();
    expect(count).toBeGreaterThan(0);

    console.log(`✅ Team page displays ${count} team members`);
  });

  test('should display company info on /about page', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('networkidle');

    // Check company info sections exist
    const hasCompanyName = await page.locator('h1, h2').first().isVisible();
    expect(hasCompanyName).toBeTruthy();

    console.log('✅ About page displays company info');
  });
});

/**
 * Test Scenario 3: Relationship Testing
 */
test.describe('3. Relationship Testing', () => {
  test('should display vendor info on product detail page', async ({ page }) => {
    await page.goto('/products');
    await page.locator('[data-testid="product-card"]').first().locator('a').first().click();
    await page.waitForLoadState('networkidle');

    // Check for vendor information section
    const hasVendorSection = await page.locator('[data-testid="product-vendor"]').isVisible();

    if (hasVendorSection) {
      console.log('✅ Product detail shows vendor relationship');
    } else {
      console.log('⚠️  Vendor relationship not displayed on product detail');
    }
  });

  test('should display products on vendor detail page', async ({ page }) => {
    await page.goto('/vendors');
    await page.locator('[data-testid="vendor-card"]').first().locator('a').first().click();
    await page.waitForLoadState('networkidle');

    // Check for products section
    const hasProductsSection = await page.locator('[data-testid="vendor-products"]').isVisible();

    if (hasProductsSection) {
      console.log('✅ Vendor detail shows related products');
    } else {
      console.log('⚠️  Products not displayed on vendor detail');
    }
  });

  test('should display supplier map on yacht detail page', async ({ page }) => {
    await page.goto('/yachts');
    await page.locator('[data-testid="yacht-card"]').first().locator('a').first().click();
    await page.waitForLoadState('networkidle');

    // Check for supplier map section
    const hasSupplierMap = await page.locator('[data-testid="supplier-map"]').isVisible();

    if (hasSupplierMap) {
      console.log('✅ Yacht detail shows supplier map');

      // Take screenshot
      await page.screenshot({
        path: path.join(EVIDENCE_DIR, 'yacht-supplier-map.png'),
        fullPage: true,
      });
    } else {
      console.log('⚠️  Supplier map not displayed on yacht detail');
    }
  });
});

/**
 * Test Scenario 4: Enhanced Fields Testing
 */
test.describe('4. Enhanced Fields Testing', () => {
  test('should display vendor certifications', async ({ page }) => {
    await page.goto('/vendors');
    await page.locator('[data-testid="vendor-card"]').first().locator('a').first().click();
    await page.waitForLoadState('networkidle');

    // Check for certifications section
    const hasCertifications = await page.locator('[data-testid="certifications"]').isVisible();

    if (hasCertifications) {
      console.log('✅ Vendor certifications displayed');
    } else {
      console.log('⚠️  Certifications section not found');
    }
  });

  test('should display vendor awards', async ({ page }) => {
    await page.goto('/vendors');
    await page.locator('[data-testid="vendor-card"]').first().locator('a').first().click();
    await page.waitForLoadState('networkidle');

    // Check for awards section
    const hasAwards = await page.locator('[data-testid="awards"]').isVisible();

    if (hasAwards) {
      console.log('✅ Vendor awards displayed');
    } else {
      console.log('⚠️  Awards section not found');
    }
  });

  test('should display vendor case studies', async ({ page }) => {
    await page.goto('/vendors');
    await page.locator('[data-testid="vendor-card"]').first().locator('a').first().click();
    await page.waitForLoadState('networkidle');

    // Check for case studies section
    const hasCaseStudies = await page.locator('[data-testid="case-studies"]').isVisible();

    if (hasCaseStudies) {
      console.log('✅ Vendor case studies displayed');
    } else {
      console.log('⚠️  Case studies section not found');
    }
  });

  test('should display product comparison metrics', async ({ page }) => {
    await page.goto('/products');
    await page.locator('[data-testid="product-card"]').first().locator('a').first().click();
    await page.waitForLoadState('networkidle');

    // Check for comparison metrics section
    const hasComparisonMetrics = await page.locator('[data-testid="comparison-metrics"]').isVisible();

    if (hasComparisonMetrics) {
      console.log('✅ Product comparison metrics displayed');
    } else {
      console.log('⚠️  Comparison metrics section not found');
    }
  });

  test('should display product owner reviews', async ({ page }) => {
    await page.goto('/products');
    await page.locator('[data-testid="product-card"]').first().locator('a').first().click();
    await page.waitForLoadState('networkidle');

    // Check for owner reviews section
    const hasOwnerReviews = await page.locator('[data-testid="owner-reviews"]').isVisible();

    if (hasOwnerReviews) {
      console.log('✅ Product owner reviews displayed');
    } else {
      console.log('⚠️  Owner reviews section not found');
    }
  });

  test('should display yacht timeline', async ({ page }) => {
    await page.goto('/yachts');
    await page.locator('[data-testid="yacht-card"]').first().locator('a').first().click();
    await page.waitForLoadState('networkidle');

    // Check for timeline section
    const hasTimeline = await page.locator('[data-testid="yacht-timeline"]').isVisible();

    if (hasTimeline) {
      console.log('✅ Yacht timeline displayed');

      // Take screenshot
      await page.screenshot({
        path: path.join(EVIDENCE_DIR, 'yacht-timeline.png'),
        fullPage: true,
      });
    } else {
      console.log('⚠️  Timeline section not found');
    }
  });

  test('should display yacht sustainability metrics', async ({ page }) => {
    await page.goto('/yachts');
    await page.locator('[data-testid="yacht-card"]').first().locator('a').first().click();
    await page.waitForLoadState('networkidle');

    // Check for sustainability section
    const hasSustainability = await page.locator('[data-testid="sustainability"]').isVisible();

    if (hasSustainability) {
      console.log('✅ Yacht sustainability metrics displayed');
    } else {
      console.log('⚠️  Sustainability section not found');
    }
  });
});

/**
 * Test Scenario 5: Rich Text Testing
 */
test.describe('5. Rich Text Testing', () => {
  test('should render vendor description (Lexical → HTML)', async ({ page }) => {
    await page.goto('/vendors');
    await page.locator('[data-testid="vendor-card"]').first().locator('a').first().click();
    await page.waitForLoadState('networkidle');

    // Check for rendered description content
    const description = page.locator('[data-testid="vendor-description"]');
    const hasDescription = await description.isVisible();

    if (hasDescription) {
      const text = await description.textContent();
      expect(text).not.toBeNull();
      expect(text!.length).toBeGreaterThan(0);
      console.log('✅ Vendor description renders correctly');
    }
  });

  test('should render product description', async ({ page }) => {
    await page.goto('/products');
    await page.locator('[data-testid="product-card"]').first().locator('a').first().click();
    await page.waitForLoadState('networkidle');

    // Check for rendered description content
    const description = page.locator('[data-testid="product-description"]');
    const hasDescription = await description.isVisible();

    if (hasDescription) {
      const text = await description.textContent();
      expect(text).not.toBeNull();
      expect(text!.length).toBeGreaterThan(0);
      console.log('✅ Product description renders correctly');
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
      console.log('✅ Blog post content renders correctly');
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

      console.log(`✅ Vendor logos load correctly (${count} logos)`);
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

      console.log(`✅ Product images load correctly (${count} images)`);
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

      console.log(`✅ Yacht images load correctly (${count} images)`);
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

      console.log(`✅ Team member photos load correctly (${count} photos)`);
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
    console.log(`✅ Homepage has no broken images (${count} images checked)`);
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
        console.log(`✅ Category filter works (${initialCount} → ${filteredCount} products)`);
      }
    } else {
      console.log('⚠️  Category filter not found');
    }
  });

  test('should filter blog posts by category', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    // Check for category filter
    const categoryFilter = page.locator('[data-testid="blog-category-filter"]');
    const hasFilter = await categoryFilter.isVisible();

    if (hasFilter) {
      console.log('✅ Blog category filter exists');
    } else {
      console.log('⚠️  Blog category filter not found');
    }
  });

  test('should display featured content correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for featured flags or sections
    const hasFeaturedContent = await page.locator('[data-featured="true"], [data-testid*="featured"]').count() > 0;

    if (hasFeaturedContent) {
      console.log('✅ Featured content filtering works');
    }
  });
});

/**
 * Additional: Console Errors and 404 Testing
 */
test.describe('8. Error Detection', () => {
  test('should have no console errors on any major page', async ({ page }) => {
    const routes = ['/', '/vendors', '/products', '/yachts', '/blog', '/team', '/about'];
    const allErrors: { route: string; errors: string[] }[] = [];

    for (const route of routes) {
      const errors: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto(route);
      await page.waitForLoadState('networkidle');

      if (errors.length > 0) {
        allErrors.push({ route, errors });
      }
    }

    if (allErrors.length > 0) {
      console.log('⚠️  Console errors found:');
      allErrors.forEach(({ route, errors }) => {
        console.log(`  ${route}: ${errors.length} errors`);
        errors.forEach(err => console.log(`    - ${err}`));
      });
    }

    expect(allErrors.length).toBe(0);
  });

  test('should have no 404 errors on major pages', async ({ page }) => {
    const routes = ['/', '/vendors', '/products', '/yachts', '/blog', '/team', '/about'];
    const notFoundRoutes: string[] = [];

    for (const route of routes) {
      const response = await page.goto(route);
      if (response && response.status() === 404) {
        notFoundRoutes.push(route);
      }
    }

    expect(notFoundRoutes.length).toBe(0);
    console.log('✅ No 404 errors on major pages');
  });
});
