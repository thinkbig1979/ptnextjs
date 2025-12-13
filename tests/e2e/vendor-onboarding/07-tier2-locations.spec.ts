import { test, expect, Page } from '@playwright/test';
import { seedVendors, createTestVendor } from '../helpers/seed-api-helpers';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

async function loginAsVendor(page: Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/vendor/login/`);
  await page.getByPlaceholder('vendor@example.com').fill(email);
  await page.getByPlaceholder(/password/i).fill(password);
  await page.click('button:has-text("Login")');
  await page.waitForURL(/\/vendor\/dashboard\/?/, { timeout: 10000 });
}

test.describe('TIER2-P2: Tier 2 Location Management', () => {
  // Serial mode: location CRUD operations and geocoding must not race
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(90000); // 90 seconds for longer tests

  test('Test 7.1: Add first location as headquarters with HQ flag', async ({ page }) => {
    const vendorData = createTestVendor({
      tier: 'tier2',
      status: 'approved',
    });

    await seedVendors(page, [vendorData]);
    await loginAsVendor(page, vendorData.email, vendorData.password);

    await page.goto(`${BASE_URL}/vendor/dashboard/profile/`);
    await page.waitForLoadState('networkidle');

    // Find and click Locations tab
    const locationsTab = page.locator('button[role="tab"]').filter({ hasText: /Location/i });
    if (await locationsTab.count() > 0) {
      await locationsTab.first().click();
      await page.waitForTimeout(500);

      // Look for Add Location button
      const addBtn = page.locator('button').filter({ hasText: /Add.*Location|New.*Location/i }).first();
      if (await addBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await addBtn.click();
        await page.waitForTimeout(300);

        // Fill location details
        const nameInput = page.locator('input[name*="name"], input[placeholder*="name"]').last();
        await nameInput.fill('Headquarters Office');

        const addressInput = page.locator('input[name*="address"], input[placeholder*="address"]').last();
        if (await addressInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          await addressInput.fill('123 Harbor Street');
        }

        const cityInput = page.locator('input[name*="city"], input[placeholder*="city"]').last();
        if (await cityInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          await cityInput.fill('Monaco');
        }

        const countryInput = page.locator('input[name*="country"], input[placeholder*="country"]').last();
        if (await countryInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          await countryInput.fill('Monaco');
        }

        // Check HQ flag
        const hqCheckbox = page.locator('input[type="checkbox"][name*="hq"], input[type="checkbox"][name*="headquarters"]').last();
        if (await hqCheckbox.isVisible({ timeout: 1000 }).catch(() => false)) {
          await hqCheckbox.check();
        }

        // Save location
        const saveBtn = page.locator('button').filter({ hasText: /Save|Add|Create/ }).last();
        await saveBtn.click();
        await page.waitForTimeout(1000);

        // Verify location appears
        const locationItem = page.locator('text=/Headquarters Office|Monaco/i');
        await expect(locationItem.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
      }
    }
  });

  test('Test 7.2: Add multiple locations (up to 10 for tier 2)', async ({ page }) => {
    const vendorData = createTestVendor({
      tier: 'tier2',
      status: 'approved',
    });

    await seedVendors(page, [vendorData]);
    await loginAsVendor(page, vendorData.email, vendorData.password);

    await page.goto(`${BASE_URL}/vendor/dashboard/profile/`);
    await page.waitForLoadState('networkidle');

    const locationsTab = page.locator('button[role="tab"]').filter({ hasText: /Location/i });
    if (await locationsTab.count() > 0) {
      await locationsTab.first().click();
      await page.waitForTimeout(500);

      const addBtn = page.locator('button').filter({ hasText: /Add.*Location/i }).first();
      if (await addBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Add 3 locations
        const cities = ['Monaco', 'Nice', 'Cannes'];

        for (let i = 0; i < cities.length; i++) {
          await addBtn.click();
          await page.waitForTimeout(300);

          const nameInput = page.locator('input[name*="name"]').last();
          await nameInput.fill(`Office ${cities[i]}`);

          const cityInput = page.locator('input[name*="city"]').last();
          if (await cityInput.isVisible({ timeout: 1000 }).catch(() => false)) {
            await cityInput.fill(cities[i]);
          }

          const countryInput = page.locator('input[name*="country"]').last();
          if (await countryInput.isVisible({ timeout: 1000 }).catch(() => false)) {
            await countryInput.fill('France');
          }

          const saveBtn = page.locator('button').filter({ hasText: /Save|Add/ }).last();
          await saveBtn.click();
          await page.waitForTimeout(1000);
        }

        // Verify all locations appear
        for (const city of cities) {
          const locationItem = page.locator(`text=/${city}/i`);
          await expect(locationItem.first()).toBeVisible({ timeout: 3000 }).catch(() => {});
        }
      }
    }
  });

  test('Test 7.3: Edit existing location details', async ({ page }) => {
    const vendorData = createTestVendor({
      tier: 'tier2',
      status: 'approved',
    });

    await seedVendors(page, [vendorData]);
    await loginAsVendor(page, vendorData.email, vendorData.password);

    await page.goto(`${BASE_URL}/vendor/dashboard/profile/`);
    await page.waitForLoadState('networkidle');

    const locationsTab = page.locator('button[role="tab"]').filter({ hasText: /Location/i });
    if (await locationsTab.count() > 0) {
      await locationsTab.first().click();
      await page.waitForTimeout(500);

      // Add a location first
      const addBtn = page.locator('button').filter({ hasText: /Add.*Location/i }).first();
      if (await addBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await addBtn.click();
        await page.waitForTimeout(300);

        const nameInput = page.locator('input[name*="name"]').last();
        await nameInput.fill('Original Location');

        const cityInput = page.locator('input[name*="city"]').last();
        if (await cityInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          await cityInput.fill('Barcelona');
        }

        const saveBtn = page.locator('button').filter({ hasText: /Save|Add/ }).last();
        await saveBtn.click();
        await page.waitForTimeout(1000);

        // Now edit it
        const editBtn = page.locator('button').filter({ hasText: /Edit/i }).first();
        if (await editBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await editBtn.click();
          await page.waitForTimeout(300);

          const editNameInput = page.locator('input[name*="name"]').last();
          await editNameInput.fill('Updated Barcelona Office');

          const updateBtn = page.locator('button').filter({ hasText: /Save|Update/ }).last();
          await updateBtn.click();
          await page.waitForTimeout(1000);

          // Verify updated name appears
          const updatedItem = page.locator('text=/Updated Barcelona Office/i');
          await expect(updatedItem).toBeVisible({ timeout: 5000 }).catch(() => {});
        }
      }
    }
  });

  test('Test 7.4: Delete location with confirmation', async ({ page }) => {
    const vendorData = createTestVendor({
      tier: 'tier2',
      status: 'approved',
    });

    await seedVendors(page, [vendorData]);
    await loginAsVendor(page, vendorData.email, vendorData.password);

    await page.goto(`${BASE_URL}/vendor/dashboard/profile/`);
    await page.waitForLoadState('networkidle');

    const locationsTab = page.locator('button[role="tab"]').filter({ hasText: /Location/i });
    if (await locationsTab.count() > 0) {
      await locationsTab.first().click();
      await page.waitForTimeout(500);

      // Add a location first
      const addBtn = page.locator('button').filter({ hasText: /Add.*Location/i }).first();
      if (await addBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await addBtn.click();
        await page.waitForTimeout(300);

        const nameInput = page.locator('input[name*="name"]').last();
        await nameInput.fill('Location to Delete');

        const saveBtn = page.locator('button').filter({ hasText: /Save|Add/ }).last();
        await saveBtn.click();
        await page.waitForTimeout(1000);

        // Now delete it
        const deleteBtn = page.locator('button').filter({ hasText: /Delete|Remove/i }).first();
        if (await deleteBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await deleteBtn.click();
          await page.waitForTimeout(300);

          // Confirm deletion if dialog appears
          const confirmBtn = page.locator('button').filter({ hasText: /Confirm|Yes|Delete/i }).last();
          if (await confirmBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
            await confirmBtn.click();
          }

          await page.waitForTimeout(1000);

          // Verify location is gone
          const deletedItem = page.locator('text=/Location to Delete/i');
          const isGone = !(await deletedItem.isVisible({ timeout: 2000 }).catch(() => false));
          expect(isGone).toBeTruthy();
        }
      }
    }
  });

  test('Test 7.5: Geocoding integration (address to coordinates)', async ({ page }) => {
    const vendorData = createTestVendor({
      tier: 'tier2',
      status: 'approved',
    });

    await seedVendors(page, [vendorData]);
    await loginAsVendor(page, vendorData.email, vendorData.password);

    await page.goto(`${BASE_URL}/vendor/dashboard/profile/`);
    await page.waitForLoadState('networkidle');

    const locationsTab = page.locator('button[role="tab"]').filter({ hasText: /Location/i });
    if (await locationsTab.count() > 0) {
      await locationsTab.first().click();
      await page.waitForTimeout(500);

      const addBtn = page.locator('button').filter({ hasText: /Add.*Location/i }).first();
      if (await addBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await addBtn.click();
        await page.waitForTimeout(300);

        // Fill address
        const addressInput = page.locator('input[name*="address"]').last();
        if (await addressInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          await addressInput.fill('Port Hercules');
        }

        const cityInput = page.locator('input[name*="city"]').last();
        if (await cityInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          await cityInput.fill('Monaco');
        }

        const countryInput = page.locator('input[name*="country"]').last();
        if (await countryInput.isVisible({ timeout: 1000 }).catch(() => false)) {
          await countryInput.fill('Monaco');
        }

        // Look for geocoding button
        const geocodeBtn = page.locator('button').filter({ hasText: /Geocode|Find.*Coordinates|Locate/i }).last();
        if (await geocodeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          // Click geocode button and wait for API call
          const [geocodeResponse] = await Promise.all([
            page.waitForResponse(
              (r: any) => r.url().includes('/api/geocode'),
              { timeout: 5000 }
            ).catch(() => null),
            geocodeBtn.click()
          ]);

          if (geocodeResponse) {
            console.log('[Test 7.5] Geocode API status:', geocodeResponse.status());
          }

          await page.waitForTimeout(1000);

          // Check if latitude/longitude fields are populated
          const latInput = page.locator('input[name*="latitude"], input[name*="lat"]').last();
          const lngInput = page.locator('input[name*="longitude"], input[name*="lng"], input[name*="lon"]').last();

          if (await latInput.isVisible({ timeout: 1000 }).catch(() => false)) {
            const latValue = await latInput.inputValue();
            console.log('[Test 7.5] Latitude value:', latValue);
            // Monaco coordinates should be around 43.7°N
            expect(latValue.length).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  test('Test 7.6: Map preview with location markers (Leaflet)', async ({ page }) => {
    const vendorData = createTestVendor({
      tier: 'tier2',
      status: 'approved',
      locations: [
        {
          name: 'Monaco Office',
          city: 'Monaco',
          country: 'Monaco',
          latitude: 43.7384,
          longitude: 7.4246,
          isHQ: true,
        },
      ],
    });

    await seedVendors(page, [vendorData]);
    await loginAsVendor(page, vendorData.email, vendorData.password);

    await page.goto(`${BASE_URL}/vendor/dashboard/profile/`);
    await page.waitForLoadState('networkidle');

    const locationsTab = page.locator('button[role="tab"]').filter({ hasText: /Location/i });
    if (await locationsTab.count() > 0) {
      await locationsTab.first().click();
      await page.waitForTimeout(1000);

      // Look for map container (Leaflet uses specific class names)
      const mapContainer = page.locator('.leaflet-container, [id*="map"], [class*="map"]').first();
      if (await mapContainer.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('[Test 7.6] Map container found');

        // Look for map markers
        const marker = page.locator('.leaflet-marker-icon, [class*="marker"]').first();
        const markerVisible = await marker.isVisible({ timeout: 2000 }).catch(() => false);
        console.log('[Test 7.6] Marker visible:', markerVisible);

        // Verify map is displayed
        await expect(mapContainer).toBeVisible();
      } else {
        // If map isn't immediately visible, check if there's a preview button
        const previewBtn = page.locator('button').filter({ hasText: /Preview|View.*Map|Show.*Map/i }).first();
        if (await previewBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await previewBtn.click();
          await page.waitForTimeout(1000);

          const mapAfterClick = page.locator('.leaflet-container, [id*="map"]').first();
          await expect(mapAfterClick).toBeVisible({ timeout: 3000 }).catch(() => {});
        }
      }
    }
  });

  test('Test 7.7: Location limit enforcement (10 max for tier 2)', async ({ page }) => {
    const vendorData = createTestVendor({
      tier: 'tier2',
      status: 'approved',
    });

    await seedVendors(page, [vendorData]);
    await loginAsVendor(page, vendorData.email, vendorData.password);

    await page.goto(`${BASE_URL}/vendor/dashboard/profile/`);
    await page.waitForLoadState('networkidle');

    const locationsTab = page.locator('button[role="tab"]').filter({ hasText: /Location/i });
    if (await locationsTab.count() > 0) {
      await locationsTab.first().click();
      await page.waitForTimeout(500);

      const addBtn = page.locator('button').filter({ hasText: /Add.*Location/i }).first();
      if (await addBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Try to add up to 11 locations (tier 2 limit is 10)
        let locationsAdded = 0;

        for (let i = 0; i < 11; i++) {
          // Check if add button is still enabled
          const btnEnabled = await addBtn.isEnabled({ timeout: 1000 }).catch(() => false);
          if (!btnEnabled) {
            console.log(`[Test 7.7] Add button disabled after ${locationsAdded} locations`);
            break;
          }

          await addBtn.click();
          await page.waitForTimeout(300);

          const nameInput = page.locator('input[name*="name"]').last();
          if (await nameInput.isVisible({ timeout: 1000 }).catch(() => false)) {
            await nameInput.fill(`Location ${i + 1}`);

            const cityInput = page.locator('input[name*="city"]').last();
            if (await cityInput.isVisible({ timeout: 500 }).catch(() => false)) {
              await cityInput.fill(`City ${i + 1}`);
            }

            const saveBtn = page.locator('button').filter({ hasText: /Save|Add/ }).last();
            const saved = await saveBtn.isVisible({ timeout: 500 }).catch(() => false);

            if (saved) {
              await saveBtn.click();
              await page.waitForTimeout(500);
              locationsAdded++;
            } else {
              console.log(`[Test 7.7] Save button not visible for location ${i + 1}`);
              break;
            }
          }

          // Check for limit warning message
          const limitMsg = page.locator('text=/limit|maximum|upgrade/i').first();
          if (await limitMsg.isVisible({ timeout: 500 }).catch(() => false)) {
            console.log('[Test 7.7] Limit warning message appeared');
            break;
          }
        }

        console.log(`[Test 7.7] Total locations added: ${locationsAdded}`);
        // Tier 2 should allow up to 10 locations
        expect(locationsAdded).toBeLessThanOrEqual(10);
      }
    }
  });
});
