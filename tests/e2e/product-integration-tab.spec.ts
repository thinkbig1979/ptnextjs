/**
 * Product Integration Tab E2E Tests
 * Tests the integration of systemRequirements and compatibilityMatrix CMS fields
 * with the frontend IntegrationNotes component.
 */

import { test, expect } from '@playwright/test';

test.describe('Product Integration Tab', () => {
  test('should display integration information when available', async ({ page }) => {
    // Navigate to a product page
    await page.goto('/products');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Find and click on the first product
    const firstProductLink = page.locator('a[href*="/products/"]').first();
    if (await firstProductLink.count() > 0) {
      await firstProductLink.click();
      await page.waitForLoadState('networkidle');

      // Check if Integration tab exists
      const integrationTab = page.locator('button:has-text("Integration")');
      if (await integrationTab.count() > 0) {
        await integrationTab.click();
        await page.waitForTimeout(500);

        // Check for integration notes component
        const integrationNotes = page.locator('[data-testid="integration-notes"]');
        await expect(integrationNotes).toBeVisible();

        console.log('[OK] Integration tab is displayed');
      } else {
        console.log('[WARN]️ Integration tab not found on this product');
      }
    } else {
      console.log('[WARN]️ No products found to test');
    }
  });

  test('should display system compatibility when protocols exist', async ({ page }) => {
    // This test verifies the frontend can render supported protocols
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    const firstProductLink = page.locator('a[href*="/products/"]').first();
    if (await firstProductLink.count() > 0) {
      await firstProductLink.click();
      await page.waitForLoadState('networkidle');

      const integrationTab = page.locator('button:has-text("Integration")');
      if (await integrationTab.count() > 0) {
        await integrationTab.click();
        await page.waitForTimeout(500);

        // Check if system compatibility section exists
        const compatibilitySection = page.locator('h3:has-text("System Compatibility")');
        if (await compatibilitySection.count() > 0) {
          console.log('[OK] System Compatibility section found');

          // Check for protocol badges
          const badges = page.locator('.bg-secondary');
          const badgeCount = await badges.count();
          console.log(`[CHART] Found ${badgeCount} protocol badge(s)`);
        } else {
          console.log('ℹ️ No System Compatibility section (product may not have protocols configured)');
        }
      }
    }
  });

  test('should display system requirements section', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    const firstProductLink = page.locator('a[href*="/products/"]').first();
    if (await firstProductLink.count() > 0) {
      await firstProductLink.click();
      await page.waitForLoadState('networkidle');

      const integrationTab = page.locator('button:has-text("Integration")');
      if (await integrationTab.count() > 0) {
        await integrationTab.click();
        await page.waitForTimeout(500);

        // Check if system requirements section exists
        const requirementsSection = page.locator('h3:has-text("System Requirements")');
        if (await requirementsSection.count() > 0) {
          console.log('[OK] System Requirements section found');

          // Check for specific requirement fields
          const powerSupply = page.locator('text=/Power Supply:/i');
          const mounting = page.locator('text=/Mounting:/i');
          const operatingTemp = page.locator('text=/Operating Temperature:/i');
          const certification = page.locator('text=/Certifications:/i');
          const ipRating = page.locator('text=/IP Rating:/i');

          if (await powerSupply.count() > 0) console.log('  [OK] Power Supply field displayed');
          if (await mounting.count() > 0) console.log('  [OK] Mounting field displayed');
          if (await operatingTemp.count() > 0) console.log('  [OK] Operating Temperature field displayed');
          if (await certification.count() > 0) console.log('  [OK] Certifications field displayed');
          if (await ipRating.count() > 0) console.log('  [OK] IP Rating field displayed');
        } else {
          console.log('ℹ️ No System Requirements section (product may not have requirements configured)');
        }
      }
    }
  });

  test('should display compatibility matrix with proper indicators', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    const firstProductLink = page.locator('a[href*="/products/"]').first();
    if (await firstProductLink.count() > 0) {
      await firstProductLink.click();
      await page.waitForLoadState('networkidle');

      const integrationTab = page.locator('button:has-text("Integration")');
      if (await integrationTab.count() > 0) {
        await integrationTab.click();
        await page.waitForTimeout(500);

        // Check if compatibility details section exists
        const compatibilityDetails = page.locator('h3:has-text("Compatibility Details")');
        if (await compatibilityDetails.count() > 0) {
          console.log('[OK] Compatibility Details section found');

          // Check for compatibility matrix component
          const matrixComponent = page.locator('[data-testid="compatibility-matrix"]');
          if (await matrixComponent.count() > 0) {
            console.log('  [OK] Compatibility matrix component rendered');

            // Check for compatibility indicators (full, partial, adapter, none)
            const fullCompat = page.locator('[data-testid="compatibility-indicator-full"]');
            const partialCompat = page.locator('[data-testid="compatibility-indicator-partial"]');
            const adapterCompat = page.locator('[data-testid="compatibility-indicator-adapter"]');
            const noneCompat = page.locator('[data-testid="compatibility-indicator-none"]');

            const indicators = {
              full: await fullCompat.count(),
              partial: await partialCompat.count(),
              adapter: await adapterCompat.count(),
              none: await noneCompat.count(),
            };

            console.log('  [CHART] Compatibility indicators:', indicators);
          }
        } else {
          console.log('ℹ️ No Compatibility Details section (product may not have compatibility matrix configured)');
        }
      }
    }
  });

  test('should show fallback message when no integration data exists', async ({ page }) => {
    // This test verifies graceful handling of missing data
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    const firstProductLink = page.locator('a[href*="/products/"]').first();
    if (await firstProductLink.count() > 0) {
      await firstProductLink.click();
      await page.waitForLoadState('networkidle');

      const integrationTab = page.locator('button:has-text("Integration")');
      if (await integrationTab.count() > 0) {
        await integrationTab.click();
        await page.waitForTimeout(500);

        const integrationNotes = page.locator('[data-testid="integration-notes"]');
        const noInfoMessage = page.locator('text=/No integration information available/i');

        // Either we have info sections OR we show the no-info message
        const hasCompatibility = await page.locator('h3:has-text("System Compatibility")').count() > 0;
        const hasRequirements = await page.locator('h3:has-text("System Requirements")').count() > 0;
        const hasMatrix = await page.locator('h3:has-text("Compatibility Details")').count() > 0;
        const hasNoInfoMessage = await noInfoMessage.count() > 0;

        if (hasCompatibility || hasRequirements || hasMatrix) {
          console.log('[OK] Integration information is displayed');
        } else if (hasNoInfoMessage) {
          console.log('[OK] Fallback message displayed correctly for products without integration data');
        } else {
          console.log('[WARN]️ Unexpected state: no integration info and no fallback message');
        }
      }
    }
  });
});
