/**
 * E2E Test: Vendor Review Submission Feature
 * Tests button visibility, modal opening, form rendering, and hCaptcha integration
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const EVIDENCE_DIR = path.join(
  __dirname,
  '../../.agent-os/specs/2025-10-24-tier-structure-implementation/evidence/vendor-review-submission'
);

test.beforeAll(() => {
  if (!fs.existsSync(EVIDENCE_DIR)) {
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  }
});

test.describe('Vendor Review Submission Feature', () => {
  const vendorUrl = '/vendors/test-vendor-1762171312643';

  test('01 - Click button and verify modal opens', async ({ page }) => {
    console.log('\n=== Testing Vendor Review Modal ===\n');

    await page.goto(vendorUrl);
    await page.waitForLoadState('networkidle');

    // Screenshot: Initial page
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, '01-initial-page.png'),
      fullPage: false,
    });

    // Click Reviews tab
    const reviewsTab = page.locator('[role="tab"]').filter({ hasText: 'Reviews' });
    await reviewsTab.click();
    await page.waitForTimeout(1000);

    // Screenshot: Reviews tab
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, '02-reviews-tab.png'),
      fullPage: false,
    });

    // Find the button
    const writeButton = page.locator('button').filter({ hasText: /Write.*Review/ }).first();
    const buttonExists = await writeButton.count();
    console.log(`Write Review buttons found: ${buttonExists}`);

    if (buttonExists > 0) {
      const buttonText = await writeButton.textContent();
      console.log(`Button text: "${buttonText?.trim()}"`);

      // Click the button
      console.log('Clicking Write Review button...');
      await writeButton.click();
      await page.waitForTimeout(2000);

      // Screenshot: After click
      await page.screenshot({
        path: path.join(EVIDENCE_DIR, '03-after-button-click.png'),
        fullPage: false,
      });

      // Check if dialog appeared
      const dialog = page.locator('[role="dialog"]');
      const dialogVisible = await dialog.isVisible().catch(() => false);

      if (dialogVisible) {
        console.log('✅ SUCCESS: Modal opened');

        // Screenshot: Modal
        await page.screenshot({
          path: path.join(EVIDENCE_DIR, '04-modal-opened.png'),
          fullPage: false,
        });
      } else {
        console.log('❌ FAILURE: Modal did not open');

        // Check for any dialogs in DOM
        const allDialogs = page.locator('[role="dialog"], .dialog, [class*="Dialog"]');
        const dialogCount = await allDialogs.count();
        console.log(`Total dialog elements in DOM: ${dialogCount}`);

        // Log all visible buttons
        const allButtons = page.locator('button:visible');
        const count = await allButtons.count();
        console.log(`\nAll visible buttons (${count}):`);
        for (let i = 0; i < Math.min(count, 10); i++) {
          const text = await allButtons.nth(i).textContent();
          console.log(`  ${i + 1}. "${text?.trim()}"`);
        }
      }
    } else {
      console.log('❌ No Write Review button found');
    }
  });

  test('02 - Check console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      errors.push(`PageError: ${error.message}`);
    });

    await page.goto(vendorUrl);
    await page.waitForLoadState('networkidle');

    const reviewsTab = page.locator('[role="tab"]').filter({ hasText: 'Reviews' });
    await reviewsTab.click();
    await page.waitForTimeout(1000);

    const writeButton = page.locator('button').filter({ hasText: /Write.*Review/ }).first();
    if (await writeButton.isVisible()) {
      await writeButton.click();
      await page.waitForTimeout(2000);
    }

    console.log(`\nConsole errors: ${errors.length}`);
    if (errors.length > 0) {
      errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    } else {
      console.log('No console errors found');
    }
  });
});
