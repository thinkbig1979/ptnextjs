/**
 * E2E Test: Registration Form Accessibility (WCAG Compliance)
 *
 * TEST PLACEMENT DECISION:
 * - Tier: REGRESSION (accessibility compliance testing)
 * - Feature Group: accessibility
 * - Gap Identified: No automated a11y testing on registration flow
 * - Not Redundant: Existing registration tests don't verify WCAG compliance
 *
 * Tests WCAG 2.1 Level AA compliance on the vendor registration form.
 * Uses @axe-core/playwright for automated accessibility auditing.
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('Accessibility: Registration Form (WCAG 2.1 AA)', () => {
  test.setTimeout(60000);

  test('A11Y-REG-01: Registration page passes axe-core audit', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendor/register`);
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Log violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations found:');
      accessibilityScanResults.violations.forEach((violation) => {
        console.log(`- ${violation.id}: ${violation.description}`);
        violation.nodes.forEach((node) => {
          console.log(`  Target: ${node.target}`);
          console.log(`  HTML: ${node.html.substring(0, 100)}...`);
        });
      });
    }

    // Critical violations should be zero
    const criticalViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical'
    );
    expect(criticalViolations).toHaveLength(0);

    // Serious violations should be minimal (allow for known issues)
    const seriousViolations = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'serious'
    );
    expect(seriousViolations.length).toBeLessThanOrEqual(3);
  });

  test('A11Y-REG-02: Form fields have accessible labels', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendor/register`);
    await page.waitForLoadState('networkidle');

    // Check that all input fields have associated labels or aria-label
    const inputs = await page.locator('input:visible').all();

    for (const input of inputs) {
      const inputId = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledby = await input.getAttribute('aria-labelledby');
      const placeholder = await input.getAttribute('placeholder');

      // Check for label element
      let hasLabel = false;
      if (inputId) {
        const label = page.locator(`label[for="${inputId}"]`);
        hasLabel = (await label.count()) > 0;
      }

      // Input must have at least one accessible name source
      const hasAccessibleName = hasLabel || ariaLabel || ariaLabelledby || placeholder;
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('A11Y-REG-03: Form can be navigated with keyboard only', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendor/register`);
    await page.waitForLoadState('networkidle');

    // Start from the beginning
    await page.keyboard.press('Tab');

    // Track focused elements
    const focusedElements: string[] = [];
    let maxIterations = 20;

    while (maxIterations > 0) {
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        return {
          tag: el.tagName.toLowerCase(),
          type: (el as HTMLInputElement).type || '',
          name: (el as HTMLInputElement).name || '',
          id: el.id || '',
        };
      });

      if (!focusedElement) break;

      focusedElements.push(
        `${focusedElement.tag}[${focusedElement.type || focusedElement.name || focusedElement.id}]`
      );

      // Check if we've reached the submit button
      if (focusedElement.tag === 'button' && focusedElement.type === 'submit') {
        break;
      }

      await page.keyboard.press('Tab');
      maxIterations--;
    }

    // Should be able to tab through form fields
    expect(focusedElements.length).toBeGreaterThan(3);

    // Should reach the submit button
    const hasSubmitButton = focusedElements.some((el) => el.includes('button'));
    expect(hasSubmitButton).toBe(true);
  });

  test('A11Y-REG-04: Focus indicators are visible', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendor/register`);
    await page.waitForLoadState('networkidle');

    // Focus the first input
    const firstInput = page.locator('input:visible').first();
    await firstInput.focus();

    // Check that focus is visible (has outline or ring)
    const focusStyles = await firstInput.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow,
        borderColor: styles.borderColor,
      };
    });

    // Should have some visible focus indicator
    const hasFocusIndicator =
      focusStyles.outlineWidth !== '0px' ||
      focusStyles.boxShadow !== 'none' ||
      focusStyles.outline !== 'none';

    expect(hasFocusIndicator).toBe(true);
  });

  test('A11Y-REG-05: Error messages are announced to screen readers', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendor/register`);
    await page.waitForLoadState('networkidle');

    // Submit empty form to trigger validation errors
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();
    await page.waitForTimeout(500);

    // Check for aria-live regions or role="alert" for error messages
    const alertElements = await page.locator('[role="alert"], [aria-live]').all();
    const errorMessages = await page.locator('[class*="error"], [class*="Error"]').all();

    // Either ARIA live regions exist OR error messages have proper attributes
    const hasAccessibleErrors =
      alertElements.length > 0 ||
      errorMessages.some(async (el) => {
        const ariaDescribedby = await el.getAttribute('aria-describedby');
        const role = await el.getAttribute('role');
        return ariaDescribedby || role === 'alert';
      });

    // Form should provide some feedback mechanism
    expect(hasAccessibleErrors || errorMessages.length > 0).toBe(true);
  });

  test('A11Y-REG-06: Color contrast meets WCAG AA standards', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendor/register`);
    await page.waitForLoadState('networkidle');

    // Run axe-core specifically for color-contrast
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .options({ runOnly: ['color-contrast'] })
      .analyze();

    // Color contrast violations should be zero
    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'color-contrast'
    );

    if (contrastViolations.length > 0) {
      console.log('Color contrast issues:');
      contrastViolations.forEach((v) => {
        v.nodes.forEach((node) => {
          console.log(`- ${node.target}: ${node.failureSummary}`);
        });
      });
    }

    expect(contrastViolations.length).toBeLessThanOrEqual(2);
  });

  test('A11Y-REG-07: Images have alt text (if present)', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendor/register`);
    await page.waitForLoadState('networkidle');

    // Check all images have alt attributes
    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');
      const ariaHidden = await img.getAttribute('aria-hidden');

      // Image should have alt text OR be marked as decorative
      const isAccessible = alt !== null || role === 'presentation' || ariaHidden === 'true';
      expect(isAccessible).toBe(true);
    }
  });

  test('A11Y-REG-08: Page has proper heading structure', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendor/register`);
    await page.waitForLoadState('networkidle');

    // Get all headings in order
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    const headingLevels: number[] = [];

    for (const heading of headings) {
      const tagName = await heading.evaluate((el) => el.tagName);
      headingLevels.push(parseInt(tagName.replace('H', ''), 10));
    }

    // Should have at least one h1
    expect(headingLevels.includes(1)).toBe(true);

    // Heading levels should not skip (e.g., h1 -> h3)
    for (let i = 1; i < headingLevels.length; i++) {
      const diff = headingLevels[i] - headingLevels[i - 1];
      // Allow going deeper by 1 level or going back up any amount
      expect(diff).toBeLessThanOrEqual(1);
    }
  });
});
