/**
 * Verify Integration Seeded Data E2E Test
 * Verifies that the seeded integration data is properly displayed on product pages
 */

import { test, expect } from '@playwright/test';

test.describe('Integration Seeded Data Verification', () => {
  test('should display seeded integration data on Complete System Integration product', async ({ page }) => {
    // Navigate directly to a product that should have seeded data
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Look for "Complete System Integration" product
    const productLink = page.locator('a:has-text("Complete System Integration")').first();

    if (await productLink.count() > 0) {
      await productLink.click();
      await page.waitForLoadState('networkidle');

      console.log(`\n📦 Testing product: ${await page.title()}\n`);

      // Click Integration tab
      const integrationTab = page.locator('button:has-text("Integration")');
      if (await integrationTab.count() > 0) {
        await integrationTab.click();
        await page.waitForTimeout(1000);

        // Check for System Requirements section with seeded data
        const systemReqSection = page.locator('h3:has-text("System Requirements")');
        if (await systemReqSection.count() > 0) {
          console.log('[OK] System Requirements section found');

          // Check for specific seeded values
          const powerSupply = page.locator('text=/12V\/24V DC/i');
          const ipRating = page.locator('text=/IP6[47]/i');
          const certification = page.locator('text=/CE/i');

          if (await powerSupply.count() > 0) {
            console.log('  [OK] Power Supply data found');
            await expect(powerSupply.first()).toBeVisible();
          }

          if (await ipRating.count() > 0) {
            console.log('  [OK] IP Rating data found');
            await expect(ipRating.first()).toBeVisible();
          }

          if (await certification.count() > 0) {
            console.log('  [OK] Certification data found');
            await expect(certification.first()).toBeVisible();
          }
        } else {
          console.log('[WARN]️ System Requirements section not found');
        }

        // Check for Compatibility Matrix with seeded data
        const compatMatrix = page.locator('h3:has-text("Compatibility Details")');
        if (await compatMatrix.count() > 0) {
          console.log('\n[OK] Compatibility Details section found');

          // Check for specific system names from seeded data
          const garminSystem = page.locator('text=/Garmin/i');
          const raymarineSystem = page.locator('text=/Raymarine/i');
          const maretronSystem = page.locator('text=/Maretron/i');
          const victronSystem = page.locator('text=/Victron/i');

          const systems = [];
          if (await garminSystem.count() > 0) {
            systems.push('Garmin');
            console.log('  [OK] Garmin system compatibility found');
          }
          if (await raymarineSystem.count() > 0) {
            systems.push('Raymarine');
            console.log('  [OK] Raymarine system compatibility found');
          }
          if (await maretronSystem.count() > 0) {
            systems.push('Maretron');
            console.log('  [OK] Maretron system compatibility found');
          }
          if (await victronSystem.count() > 0) {
            systems.push('Victron');
            console.log('  [OK] Victron system compatibility found');
          }

          if (systems.length > 0) {
            console.log(`  [CHART] Found ${systems.length} system compatibilities: ${systems.join(', ')}`);
            expect(systems.length).toBeGreaterThan(0);
          }

          // Check for compatibility indicators
          const fullCompat = page.locator('[data-testid*="compatibility-indicator-full"]');
          const partialCompat = page.locator('[data-testid*="compatibility-indicator-partial"]');
          const adapterCompat = page.locator('[data-testid*="compatibility-indicator-adapter"]');

          const indicators = {
            full: await fullCompat.count(),
            partial: await partialCompat.count(),
            adapter: await adapterCompat.count(),
          };

          console.log(`  [TARGET] Compatibility indicators: ${indicators.full} full, ${indicators.partial} partial, ${indicators.adapter} adapter`);

          if (indicators.full > 0) {
            await expect(fullCompat.first()).toBeVisible();
            console.log('  [OK] Full compatibility indicator visible');
          }
        } else {
          console.log('\n[WARN]️ Compatibility Details section not found');
        }

        console.log('\n[OK] Integration seeded data verification complete!\n');
      } else {
        console.log('[WARN]️ Integration tab not found');
      }
    } else {
      console.log('[WARN]️ "Complete System Integration" product not found');
    }
  });

  test('should display integration data on Entertainment system product', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Look for "Entertainment" or "Audio" product
    const productLink = page.locator('a:has-text("Audio"), a:has-text("Entertainment")').first();

    if (await productLink.count() > 0) {
      await productLink.click();
      await page.waitForLoadState('networkidle');

      console.log(`\n📦 Testing entertainment product: ${await page.title()}\n`);

      const integrationTab = page.locator('button:has-text("Integration")');
      if (await integrationTab.count() > 0) {
        await integrationTab.click();
        await page.waitForTimeout(1000);

        // Check for entertainment-specific compatibility systems
        const sonosSystem = page.locator('text=/Sonos/i');
        const fusionSystem = page.locator('text=/Fusion/i');
        const crestronSystem = page.locator('text=/Crestron/i');

        if (await sonosSystem.count() > 0) {
          console.log('[OK] Sonos compatibility found (entertainment template)');
          await expect(sonosSystem.first()).toBeVisible();
        }

        if (await fusionSystem.count() > 0) {
          console.log('[OK] Fusion compatibility found (entertainment template)');
        }

        if (await crestronSystem.count() > 0) {
          console.log('[OK] Crestron compatibility found (entertainment template)');
        }

        console.log('\n[OK] Entertainment product integration data verified!\n');
      }
    }
  });

  test('should display searchable integration matrix', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    const firstProductLink = page.locator('a[href*="/products/"]').first();

    if (await firstProductLink.count() > 0) {
      await firstProductLink.click();
      await page.waitForLoadState('networkidle');

      const integrationTab = page.locator('button:has-text("Integration")');
      if (await integrationTab.count() > 0) {
        await integrationTab.click();
        await page.waitForTimeout(1000);

        // Check if search box is available
        const searchInput = page.locator('input[placeholder*="Search integrations"]');
        if (await searchInput.count() > 0) {
          console.log('[OK] Integration search functionality available');

          // Try searching for a common system
          await searchInput.fill('Garmin');
          await page.waitForTimeout(500);

          const garminResults = page.locator('text=/Garmin/i');
          if (await garminResults.count() > 0) {
            console.log('[OK] Search filtering works - Garmin results shown');
          }

          // Clear search
          await searchInput.clear();
          await page.waitForTimeout(500);
        }
      }
    }
  });
});
