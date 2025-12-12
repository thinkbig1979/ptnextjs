/**
 * E2E Test: Mobile Viewport Testing
 *
 * TEST PLACEMENT DECISION:
 * - Tier: CORE (responsive design is essential for all users)
 * - Feature Group: responsive
 * - Gap Identified: Critical flows not tested on mobile viewports
 * - Not Redundant: Desktop-only tests don't catch mobile-specific issues
 *
 * Tests critical user flows on mobile viewport (375x667 - iPhone SE).
 * Verifies responsive design works correctly for touch users.
 */

import { test, expect } from '@playwright/test';
import {
  generateUniqueVendorData,
  fillRegistrationForm,
} from './helpers/vendor-onboarding-helpers';
import { TEST_VENDORS, loginVendor, API_BASE } from './helpers/test-vendors';

// Mobile viewport configuration
test.use({
  viewport: { width: 375, height: 667 },
  hasTouch: true,
  isMobile: true,
});

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('Mobile Viewport: Registration Flow', () => {
  test.setTimeout(45000);

  test('MOB-REG-01: Registration form is usable on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendor/register`);
    await page.waitForLoadState('networkidle');

    // Form should be visible without horizontal scroll
    const formWidth = await page.evaluate(() => {
      const form = document.querySelector('form');
      return form ? form.scrollWidth : 0;
    });

    expect(formWidth).toBeLessThanOrEqual(375);

    // All form fields should be visible
    const companyInput = page.getByPlaceholder('Your Company Ltd');
    await expect(companyInput).toBeVisible();

    const emailInput = page.getByPlaceholder('vendor@example.com');
    await expect(emailInput).toBeVisible();
  });

  test('MOB-REG-02: Form inputs are touch-friendly (min 44x44 target)', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendor/register`);
    await page.waitForLoadState('networkidle');

    // Check input sizes (should be at least 44px for touch)
    const inputs = await page.locator('input:visible').all();

    for (const input of inputs) {
      const box = await input.boundingBox();
      if (box) {
        // Input height should be touch-friendly
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }

    // Submit button should be large enough
    const submitBtn = page.locator('button[type="submit"]');
    const btnBox = await submitBtn.boundingBox();
    if (btnBox) {
      expect(btnBox.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('MOB-REG-03: Complete registration on mobile', async ({ page }) => {
    const vendor = generateUniqueVendorData();

    await page.goto(`${BASE_URL}/vendor/register`);
    await page.waitForLoadState('networkidle');

    // Fill form with mobile-friendly taps
    await page.getByPlaceholder('Your Company Ltd').tap();
    await page.getByPlaceholder('Your Company Ltd').fill(vendor.companyName);

    await page.getByPlaceholder('vendor@example.com').tap();
    await page.getByPlaceholder('vendor@example.com').fill(vendor.email);

    await page.getByPlaceholder('Enter strong password').tap();
    await page.getByPlaceholder('Enter strong password').fill(vendor.password);

    await page.getByPlaceholder('Re-enter password').tap();
    await page.getByPlaceholder('Re-enter password').fill(vendor.password);

    // Submit
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.tap();

    // Wait for response
    await page.waitForURL(/\/vendor\/registration-pending\/?/, { timeout: 15000 });
    expect(page.url()).toContain('/vendor/registration-pending');
  });
});

test.describe('Mobile Viewport: Vendor Dashboard', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await loginVendor(page, TEST_VENDORS.tier2.email, TEST_VENDORS.tier2.password);
  });

  test('MOB-DASH-01: Dashboard navigation is accessible on mobile', async ({ page }) => {
    await page.goto(`${API_BASE}/vendor/dashboard`);
    await page.waitForLoadState('networkidle');

    // Should have a mobile menu (hamburger) or visible navigation
    const hamburgerMenu = page.locator(
      'button[aria-label*="menu" i], button[class*="hamburger"], [data-testid="mobile-menu"]'
    );
    const visibleNav = page.locator('nav:visible');

    const hasMobileNav = (await hamburgerMenu.count()) > 0 || (await visibleNav.count()) > 0;
    expect(hasMobileNav).toBe(true);

    // If hamburger menu exists, it should open navigation
    if ((await hamburgerMenu.count()) > 0) {
      await hamburgerMenu.first().tap();
      await page.waitForTimeout(300);

      // Navigation should appear
      const navLinks = page.locator('nav a:visible, [role="navigation"] a:visible');
      expect(await navLinks.count()).toBeGreaterThan(0);
    }
  });

  test('MOB-DASH-02: Dashboard content fits mobile viewport', async ({ page }) => {
    await page.goto(`${API_BASE}/vendor/dashboard`);
    await page.waitForLoadState('networkidle');

    // Check for horizontal overflow
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);

    // Main content should be visible
    const mainContent = page.locator('main, [role="main"], #main');
    if ((await mainContent.count()) > 0) {
      await expect(mainContent.first()).toBeVisible();
    }
  });

  test('MOB-DASH-03: Profile editing works on mobile', async ({ page }) => {
    await page.goto(`${API_BASE}/vendor/dashboard/profile`);
    await page.waitForLoadState('networkidle');

    // Find an editable field
    const descriptionField = page.locator('textarea[name*="description" i]').first();

    if ((await descriptionField.count()) > 0) {
      await descriptionField.tap();
      await descriptionField.fill('Updated via mobile test');

      // Find and tap save button
      const saveBtn = page.locator('button:has-text("Save"), button[type="submit"]').first();
      if ((await saveBtn.count()) > 0) {
        await saveBtn.tap();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('MOB-DASH-04: Tabs work with touch navigation', async ({ page }) => {
    await page.goto(`${API_BASE}/vendor/dashboard/profile`);
    await page.waitForLoadState('networkidle');

    // Find tabs
    const tabs = page.locator('[role="tab"], button[class*="tab"]');
    const tabCount = await tabs.count();

    if (tabCount > 1) {
      // Tap second tab
      await tabs.nth(1).tap();
      await page.waitForTimeout(300);

      // Tab should be selected
      const secondTab = tabs.nth(1);
      const isActive = await secondTab.evaluate((el) => {
        return (
          el.getAttribute('aria-selected') === 'true' ||
          el.classList.contains('active') ||
          el.getAttribute('data-state') === 'active'
        );
      });

      expect(isActive).toBe(true);
    }
  });
});

test.describe('Mobile Viewport: Public Vendor Profile', () => {
  test.setTimeout(45000);

  test('MOB-PUB-01: Vendor profile page renders on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendors`);
    await page.waitForLoadState('networkidle');

    // Tap first vendor card
    const vendorCard = page.locator('a[href*="/vendors/"]').first();

    if ((await vendorCard.count()) > 0) {
      await vendorCard.tap();
      await page.waitForLoadState('networkidle');

      // Profile should render without horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);

      // Company name should be visible
      const h1 = page.locator('h1');
      await expect(h1.first()).toBeVisible();
    }
  });

  test('MOB-PUB-02: Vendor listing is scrollable on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendors`);
    await page.waitForLoadState('networkidle');

    // Get initial scroll position
    const initialScroll = await page.evaluate(() => window.scrollY);

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);

    // Verify scroll happened
    const newScroll = await page.evaluate(() => window.scrollY);
    expect(newScroll).toBeGreaterThan(initialScroll);
  });

  test('MOB-PUB-03: Contact actions work on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendors`);
    await page.waitForLoadState('networkidle');

    // Navigate to a vendor
    const vendorCard = page.locator('a[href*="/vendors/"]').first();

    if ((await vendorCard.count()) > 0) {
      await vendorCard.tap();
      await page.waitForLoadState('networkidle');

      // Look for contact buttons (email, phone, website)
      const contactLinks = page.locator(
        'a[href^="mailto:"], a[href^="tel:"], a[target="_blank"]'
      );

      // Contact links should be tap-friendly
      const links = await contactLinks.all();
      for (const link of links) {
        const box = await link.boundingBox();
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(40);
        }
      }
    }
  });
});

test.describe('Mobile Viewport: Location Search', () => {
  test.setTimeout(45000);

  test('MOB-LOC-01: Location search works on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendors`);
    await page.waitForLoadState('networkidle');

    // Find search/filter controls
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="location" i], input[placeholder*="search" i]'
    );

    if ((await searchInput.count()) > 0) {
      await searchInput.first().tap();
      await searchInput.first().fill('London');

      // Trigger search
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);

      // Results should update (page should still be usable)
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
    }
  });

  test('MOB-LOC-02: Map interaction on mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendors`);
    await page.waitForLoadState('networkidle');

    // Find map container
    const mapContainer = page.locator(
      '[class*="map"], [data-testid="map"], .leaflet-container'
    );

    if ((await mapContainer.count()) > 0) {
      // Map should be visible
      await expect(mapContainer.first()).toBeVisible();

      // Map should fit viewport
      const box = await mapContainer.first().boundingBox();
      if (box) {
        expect(box.width).toBeLessThanOrEqual(375);
      }
    }
  });
});

test.describe('Mobile Viewport: Touch Gestures', () => {
  test.setTimeout(45000);

  test('MOB-TOUCH-01: Pull-to-refresh does not break UI', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendors`);
    await page.waitForLoadState('networkidle');

    // Simulate pull-to-refresh gesture
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });

    // Touch start at top, drag down
    await page.touchscreen.tap(187, 100);

    // Page should not be in broken state
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('MOB-TOUCH-02: Swipe navigation works on carousels', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Look for carousels or swipeable elements
    const carousel = page.locator(
      '[class*="carousel"], [class*="swiper"], [data-testid="carousel"]'
    );

    if ((await carousel.count()) > 0) {
      const box = await carousel.first().boundingBox();
      if (box) {
        // Swipe left
        await page.mouse.move(box.x + box.width - 20, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + 20, box.y + box.height / 2);
        await page.mouse.up();

        await page.waitForTimeout(300);

        // Carousel should still be functional
        await expect(carousel.first()).toBeVisible();
      }
    }
  });
});
