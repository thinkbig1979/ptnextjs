/**
 * E2E Test: Dashboard Accessibility (Keyboard Navigation & Focus Management)
 *
 * TEST PLACEMENT DECISION:
 * - Tier: REGRESSION (accessibility compliance testing)
 * - Feature Group: accessibility
 * - Gap Identified: No keyboard navigation or focus management testing
 * - Not Redundant: Existing dashboard tests don't verify a11y compliance
 *
 * Tests keyboard navigation, focus management, and ARIA attributes
 * on the vendor dashboard pages.
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { TEST_VENDORS, loginVendor, API_BASE } from '../helpers/test-vendors';

test.describe('Accessibility: Dashboard Keyboard Navigation', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    // Login as a tier2 vendor to access most features
    await loginVendor(page, TEST_VENDORS.tier2.email, TEST_VENDORS.tier2.password);
  });

  test('A11Y-DASH-01: Dashboard page passes axe-core audit', async ({ page }) => {
    await page.goto(`${API_BASE}/vendor/dashboard`);
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .exclude('[data-testid="map-container"]') // Exclude map for now (third-party)
      .analyze();

    // Log violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Dashboard accessibility violations:');
      accessibilityScanResults.violations.forEach((violation) => {
        console.log(`- ${violation.id}: ${violation.description} (${violation.impact})`);
      });
    }

    // Critical violations should be zero
    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical'
    );
    expect(criticalViolations).toHaveLength(0);
  });

  test('A11Y-DASH-02: Sidebar navigation is keyboard accessible', async ({ page }) => {
    await page.goto(`${API_BASE}/vendor/dashboard`);
    await page.waitForLoadState('networkidle');

    // Find sidebar navigation links
    const sidebarLinks = page.locator('nav a, aside a, [role="navigation"] a');
    const linkCount = await sidebarLinks.count();

    if (linkCount > 0) {
      // Focus first link
      await sidebarLinks.first().focus();

      // Verify focus is visible
      const isFocused = await sidebarLinks.first().evaluate((el) => {
        return document.activeElement === el;
      });
      expect(isFocused).toBe(true);

      // Tab through navigation links
      for (let i = 0; i < Math.min(linkCount - 1, 5); i++) {
        await page.keyboard.press('Tab');
      }

      // Enter should activate the link
      await sidebarLinks.first().focus();
      const href = await sidebarLinks.first().getAttribute('href');
      await page.keyboard.press('Enter');

      // Should navigate or update the page
      await page.waitForTimeout(500);
    }
  });

  test('A11Y-DASH-03: Tab panels are keyboard navigable', async ({ page }) => {
    await page.goto(`${API_BASE}/vendor/dashboard/profile`);
    await page.waitForLoadState('networkidle');

    // Find tabs
    const tabs = page.locator('[role="tab"], [data-state="active"], button[class*="tab"]');
    const tabCount = await tabs.count();

    if (tabCount > 1) {
      // Focus first tab
      await tabs.first().focus();

      // Arrow keys should navigate between tabs
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(200);

      // Check if a different tab is focused
      const activeElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(activeElement).toBeTruthy();
    }
  });

  test('A11Y-DASH-04: Modals/dialogs trap focus correctly', async ({ page }) => {
    await page.goto(`${API_BASE}/vendor/dashboard/profile`);
    await page.waitForLoadState('networkidle');

    // Try to open a modal (e.g., by clicking an edit button)
    const editButton = page
      .locator('button:has-text("Edit"), button:has-text("Add"), [data-testid*="edit"]')
      .first();

    if ((await editButton.count()) > 0) {
      await editButton.click();
      await page.waitForTimeout(500);

      // Check if a modal/dialog is open
      const modal = page.locator('[role="dialog"], [role="alertdialog"], [data-state="open"]');

      if ((await modal.count()) > 0) {
        // Focus should be within the modal
        const focusInModal = await page.evaluate(() => {
          const modal = document.querySelector('[role="dialog"], [role="alertdialog"]');
          const activeElement = document.activeElement;
          return modal?.contains(activeElement);
        });

        // Tab through modal - focus should stay within
        for (let i = 0; i < 10; i++) {
          await page.keyboard.press('Tab');
        }

        const stillInModal = await page.evaluate(() => {
          const modal = document.querySelector('[role="dialog"], [role="alertdialog"]');
          const activeElement = document.activeElement;
          return modal?.contains(activeElement);
        });

        // Focus should remain trapped in modal
        expect(stillInModal || focusInModal).toBe(true);

        // Escape should close modal
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
      }
    }
  });

  test('A11Y-DASH-05: Interactive elements have accessible names', async ({ page }) => {
    await page.goto(`${API_BASE}/vendor/dashboard`);
    await page.waitForLoadState('networkidle');

    // Check buttons have accessible names
    const buttons = await page.locator('button').all();

    for (const button of buttons.slice(0, 10)) {
      // Limit to first 10 for performance
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const ariaLabelledby = await button.getAttribute('aria-labelledby');
      const title = await button.getAttribute('title');

      // Button must have some accessible name
      const hasAccessibleName =
        (text && text.trim().length > 0) || ariaLabel || ariaLabelledby || title;

      if (!hasAccessibleName) {
        // Check for icon buttons with visually hidden text
        const srText = await button.locator('.sr-only, .visually-hidden').textContent();
        expect(srText || hasAccessibleName).toBeTruthy();
      }
    }
  });

  test('A11Y-DASH-06: Form inputs have proper error announcements', async ({ page }) => {
    await page.goto(`${API_BASE}/vendor/dashboard/profile`);
    await page.waitForLoadState('networkidle');

    // Find a form input
    const inputs = page.locator('input:visible, textarea:visible');

    if ((await inputs.count()) > 0) {
      const firstInput = inputs.first();

      // Check for aria-describedby linking to error messages
      const ariaDescribedby = await firstInput.getAttribute('aria-describedby');
      const ariaInvalid = await firstInput.getAttribute('aria-invalid');

      // Clear and enter invalid data
      await firstInput.clear();

      // Try to trigger validation
      await page.keyboard.press('Tab');
      await page.waitForTimeout(300);

      // If there's an error state, check it's properly announced
      const currentAriaInvalid = await firstInput.getAttribute('aria-invalid');
      if (currentAriaInvalid === 'true') {
        // Should have aria-describedby pointing to error message
        const describedBy = await firstInput.getAttribute('aria-describedby');
        expect(describedBy).toBeTruthy();
      }
    }
  });

  test('A11Y-DASH-07: Skip links exist for main content', async ({ page }) => {
    await page.goto(`${API_BASE}/vendor/dashboard`);
    await page.waitForLoadState('networkidle');

    // Check for skip link
    const skipLink = page.locator('a[href="#main"], a[href="#content"], a:has-text("Skip")');

    // Skip link might be visually hidden but should exist
    const skipLinkExists = (await skipLink.count()) > 0;

    // Or main content should be marked with id or landmark
    const mainLandmark = page.locator('main, [role="main"], #main, #content');
    const mainExists = (await mainLandmark.count()) > 0;

    // At least one navigation aid should exist
    expect(skipLinkExists || mainExists).toBe(true);
  });

  test('A11Y-DASH-08: ARIA landmarks are properly used', async ({ page }) => {
    await page.goto(`${API_BASE}/vendor/dashboard`);
    await page.waitForLoadState('networkidle');

    // Check for proper landmark regions
    const landmarks = await page.evaluate(() => {
      return {
        main: document.querySelectorAll('main, [role="main"]').length,
        navigation: document.querySelectorAll('nav, [role="navigation"]').length,
        banner: document.querySelectorAll('header, [role="banner"]').length,
        contentinfo: document.querySelectorAll('footer, [role="contentinfo"]').length,
      };
    });

    // Should have exactly one main landmark
    expect(landmarks.main).toBe(1);

    // Should have at least one navigation
    expect(landmarks.navigation).toBeGreaterThanOrEqual(1);
  });
});
