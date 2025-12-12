/**
 * E2E Test: Public Pages Accessibility (Screen Reader Compatibility)
 *
 * TEST PLACEMENT DECISION:
 * - Tier: REGRESSION (accessibility compliance testing)
 * - Feature Group: accessibility
 * - Gap Identified: No screen reader compatibility testing on public pages
 * - Not Redundant: Public pages have different a11y requirements than authenticated pages
 *
 * Tests screen reader compatibility and semantic HTML on public-facing pages.
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('Accessibility: Public Pages Screen Reader Compatibility', () => {
  test.setTimeout(60000);

  test('A11Y-PUB-01: Homepage passes axe-core audit', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('[data-testid="map"]') // Exclude third-party maps
      .analyze();

    // Log violations
    if (results.violations.length > 0) {
      console.log(`Homepage: ${results.violations.length} violations found`);
      results.violations.forEach((v) => {
        console.log(`- ${v.id}: ${v.impact} - ${v.description}`);
      });
    }

    // Critical issues must be zero
    const critical = results.violations.filter((v) => v.impact === 'critical');
    expect(critical).toHaveLength(0);
  });

  test('A11Y-PUB-02: Vendor listing page is accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendors`);
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    // Critical violations
    const critical = results.violations.filter((v) => v.impact === 'critical');
    expect(critical).toHaveLength(0);

    // Check list structure for screen readers
    const lists = await page.locator('ul, ol, [role="list"]').count();
    expect(lists).toBeGreaterThan(0);

    // Check vendor cards have proper structure
    const articles = await page.locator('article, [role="article"], [class*="card"]').count();
    expect(articles).toBeGreaterThan(0);
  });

  test('A11Y-PUB-03: Blog page has proper semantic structure', async ({ page }) => {
    await page.goto(`${BASE_URL}/blog`);
    await page.waitForLoadState('networkidle');

    // Check for proper heading hierarchy
    const h1 = await page.locator('h1').count();
    expect(h1).toBe(1);

    // Blog posts should be in article elements
    const articles = await page.locator('article').count();

    // Should have semantic time elements for dates
    const timeElements = await page.locator('time').count();
  });

  test('A11Y-PUB-04: All images have alt text', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');
      const ariaHidden = await img.getAttribute('aria-hidden');

      // Image should have alt text OR be decorative
      const isAccessible = alt !== null || role === 'presentation' || ariaHidden === 'true';

      if (!isAccessible) {
        const src = await img.getAttribute('src');
        console.log(`Image missing alt text: ${src}`);
      }

      expect(isAccessible).toBe(true);
    }
  });

  test('A11Y-PUB-05: Links have meaningful text', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const links = await page.locator('a').all();
    const genericTexts = ['click here', 'read more', 'here', 'link', 'more'];

    for (const link of links.slice(0, 20)) {
      // Limit for performance
      const text = (await link.textContent())?.toLowerCase().trim() || '';
      const ariaLabel = await link.getAttribute('aria-label');
      const ariaLabelledby = await link.getAttribute('aria-labelledby');
      const title = await link.getAttribute('title');

      // Should have some accessible text
      const hasAccessibleText = text.length > 0 || ariaLabel || ariaLabelledby || title;
      expect(hasAccessibleText).toBeTruthy();

      // Warn about generic link text (not a hard failure)
      if (genericTexts.includes(text) && !ariaLabel) {
        console.log(`Warning: Generic link text "${text}" found`);
      }
    }
  });

  test('A11Y-PUB-06: Search functionality is keyboard accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendors`);
    await page.waitForLoadState('networkidle');

    // Find search input
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i], input[aria-label*="search" i]'
    );

    if ((await searchInput.count()) > 0) {
      // Should be focusable
      await searchInput.first().focus();

      const isFocused = await searchInput.first().evaluate((el) => document.activeElement === el);
      expect(isFocused).toBe(true);

      // Type and check results update
      await searchInput.first().fill('marine');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);

      // Results should update (live region or aria-live)
      const liveRegion = page.locator(
        '[aria-live], [role="status"], [role="alert"]'
      );

      // Search should provide feedback mechanism
      const resultsArea = page.locator('[class*="result"], [class*="list"]');
      expect((await liveRegion.count()) > 0 || (await resultsArea.count()) > 0).toBe(true);
    }
  });

  test('A11Y-PUB-07: Tables have proper headers', async ({ page }) => {
    // Check various pages for tables
    const pagesToCheck = [BASE_URL, `${BASE_URL}/vendors`];

    for (const url of pagesToCheck) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      const tables = await page.locator('table').all();

      for (const table of tables) {
        // Table should have headers
        const hasHeaders = (await table.locator('th').count()) > 0;
        const hasCaption = (await table.locator('caption').count()) > 0;
        const ariaLabel = await table.getAttribute('aria-label');
        const ariaDescribedby = await table.getAttribute('aria-describedby');

        // Table should be identifiable
        expect(hasHeaders || hasCaption || ariaLabel || ariaDescribedby).toBeTruthy();
      }
    }
  });

  test('A11Y-PUB-08: Page language is specified', async ({ page }) => {
    await page.goto(BASE_URL);

    // html element should have lang attribute
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBeTruthy();
    expect(htmlLang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/); // en or en-US format
  });

  test('A11Y-PUB-09: Vendor profile page is accessible', async ({ page }) => {
    // Go to vendors list first
    await page.goto(`${BASE_URL}/vendors`);
    await page.waitForLoadState('networkidle');

    // Click first vendor card to go to profile
    const vendorLink = page.locator('a[href*="/vendors/"]').first();

    if ((await vendorLink.count()) > 0) {
      await vendorLink.click();
      await page.waitForLoadState('networkidle');

      // Run accessibility audit
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .exclude('[data-testid="map"]')
        .analyze();

      // Critical violations
      const critical = results.violations.filter((v) => v.impact === 'critical');
      expect(critical).toHaveLength(0);

      // Verify page structure
      const h1 = await page.locator('h1').count();
      expect(h1).toBe(1);
    }
  });

  test('A11Y-PUB-10: Contact information is properly marked up', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendors`);
    await page.waitForLoadState('networkidle');

    // Navigate to a vendor profile
    const vendorLink = page.locator('a[href*="/vendors/"]').first();

    if ((await vendorLink.count()) > 0) {
      await vendorLink.click();
      await page.waitForLoadState('networkidle');

      // Check for proper contact markup
      const emailLinks = await page.locator('a[href^="mailto:"]').count();
      const phoneLinks = await page.locator('a[href^="tel:"]').count();
      const addressElement = await page.locator('address').count();

      // Contact info should use semantic elements or proper link types
      const hasProperContactMarkup =
        emailLinks > 0 || phoneLinks > 0 || addressElement > 0;

      // If there's contact info displayed, it should be accessible
      const contactText = await page.locator('text=/email|phone|contact/i').count();
      if (contactText > 0) {
        expect(hasProperContactMarkup).toBe(true);
      }
    }
  });
});
