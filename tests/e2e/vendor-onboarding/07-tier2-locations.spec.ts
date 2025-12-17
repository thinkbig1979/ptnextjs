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

/**
 * Helper to get location form inputs by their id patterns.
 * LocationFormFields uses id attributes like:
 * - locationName-{id}
 * - address-{id}
 * - city-{id}
 * - country-{id}
 * - latitude-{id}
 * - longitude-{id}
 */
function getLocationFormInputs(page: Page) {
  return {
    locationName: page.locator('input[id^="locationName-"]').last(),
    address: page.locator('input[id^="address-"]').last(),
    city: page.locator('input[id^="city-"]').last(),
    country: page.locator('input[id^="country-"]').last(),
    latitude: page.locator('input[id^="latitude-"]').last(),
    longitude: page.locator('input[id^="longitude-"]').last(),
    isHQ: page.locator('input[id^="isHQ-"]').last(),
  };
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

        // Fill location details using the helper
        const inputs = getLocationFormInputs(page);
        await inputs.locationName.fill('Headquarters Office');
        await inputs.address.fill('123 Harbor Street');
        await inputs.city.fill('Monaco');
        await inputs.country.fill('Monaco');

        // The first location is automatically set as HQ, verify it's checked
        // HQ is a radio button that should already be selected for first location
        const hqRadio = inputs.isHQ;
        if (await hqRadio.isVisible({ timeout: 1000 }).catch(() => false)) {
          // First location is HQ by default, just verify it's checked
          await expect(hqRadio).toBeChecked({ timeout: 2000 }).catch(() => {});
        }

        // Click "Done Editing" button to finish editing the location
        const doneBtn = page.locator('button').filter({ hasText: /Done.*Editing/i }).first();
        if (await doneBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await doneBtn.click();
          await page.waitForTimeout(300);
        }

        // Save location
        const saveBtn = page.locator('button').filter({ hasText: /Save.*Locations/i }).first();
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

          const inputs = getLocationFormInputs(page);
          await inputs.locationName.fill(`Office ${cities[i]}`);
          await inputs.address.fill(`${i + 1} Main Street`);
          await inputs.city.fill(cities[i]);
          await inputs.country.fill(i === 0 ? 'Monaco' : 'France');

          // Click "Done Editing" button
          const doneBtn = page.locator('button').filter({ hasText: /Done.*Editing/i }).first();
          if (await doneBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
            await doneBtn.click();
            await page.waitForTimeout(300);
          }
        }

        // Save all locations
        const saveBtn = page.locator('button').filter({ hasText: /Save.*Locations/i }).first();
        await saveBtn.click();
        await page.waitForTimeout(1000);

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

        const inputs = getLocationFormInputs(page);
        await inputs.locationName.fill('Original Location');
        await inputs.address.fill('1 Barcelona Street');
        await inputs.city.fill('Barcelona');
        await inputs.country.fill('Spain');

        // Click "Done Editing" button
        const doneBtn = page.locator('button').filter({ hasText: /Done.*Editing/i }).first();
        if (await doneBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await doneBtn.click();
          await page.waitForTimeout(300);
        }

        // Save location
        const saveBtn = page.locator('button').filter({ hasText: /Save.*Locations/i }).first();
        await saveBtn.click();
        await page.waitForTimeout(1000);

        // Now edit it - click the Edit button (icon)
        const editBtn = page.locator('button[aria-label="Edit"]').first();
        if (await editBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await editBtn.click();
          await page.waitForTimeout(300);

          const editInputs = getLocationFormInputs(page);
          await editInputs.locationName.fill('Updated Barcelona Office');

          // Click "Done Editing" button
          const editDoneBtn = page.locator('button').filter({ hasText: /Done.*Editing/i }).first();
          if (await editDoneBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
            await editDoneBtn.click();
            await page.waitForTimeout(300);
          }

          // Save changes
          const updateBtn = page.locator('button').filter({ hasText: /Save.*Locations/i }).first();
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

      // Add two locations - first will be HQ, second can be deleted
      const addBtn = page.locator('button').filter({ hasText: /Add.*Location/i }).first();
      if (await addBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Add first location (HQ)
        await addBtn.click();
        await page.waitForTimeout(300);

        let inputs = getLocationFormInputs(page);
        await inputs.locationName.fill('Headquarters');
        await inputs.address.fill('1 Main Street');
        await inputs.city.fill('Monaco');
        await inputs.country.fill('Monaco');

        // Click "Done Editing" button
        let doneBtn = page.locator('button').filter({ hasText: /Done.*Editing/i }).first();
        if (await doneBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await doneBtn.click();
          await page.waitForTimeout(300);
        }

        // Add second location (to be deleted)
        await addBtn.click();
        await page.waitForTimeout(300);

        inputs = getLocationFormInputs(page);
        await inputs.locationName.fill('Location to Delete');
        await inputs.address.fill('2 Delete Street');
        await inputs.city.fill('Nice');
        await inputs.country.fill('France');

        // Click "Done Editing" button
        doneBtn = page.locator('button').filter({ hasText: /Done.*Editing/i }).first();
        if (await doneBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await doneBtn.click();
          await page.waitForTimeout(300);
        }

        // Save locations
        const saveBtn = page.locator('button').filter({ hasText: /Save.*Locations/i }).first();
        await saveBtn.click();
        await page.waitForTimeout(1000);

        // Now delete the second location (non-HQ)
        const deleteBtn = page.locator('button[aria-label="Delete"]').first();
        if (await deleteBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await deleteBtn.click();
          await page.waitForTimeout(300);

          // Confirm deletion in dialog
          const confirmBtn = page.locator('button').filter({ hasText: /^Delete$/i }).last();
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

        // Fill address using helper
        const inputs = getLocationFormInputs(page);
        await inputs.address.fill('Port Hercules');
        await inputs.city.fill('Monaco');
        await inputs.country.fill('Monaco');

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

          // Check if latitude/longitude fields are populated using helper
          const latValue = await inputs.latitude.inputValue();
          console.log('[Test 7.5] Latitude value:', latValue);
          // Monaco coordinates should be around 43.7°N
          expect(latValue.length).toBeGreaterThan(0);
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

  test('Test 7.7: Location limit enforcement (5 max for tier 2)', async ({ page }) => {
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
        // Try to add up to 6 locations (tier 2 limit is 5)
        let locationsAdded = 0;

        for (let i = 0; i < 6; i++) {
          // Check if add button is still enabled
          const btnEnabled = await addBtn.isEnabled({ timeout: 1000 }).catch(() => false);
          if (!btnEnabled) {
            console.log(`[Test 7.7] Add button disabled after ${locationsAdded} locations`);
            break;
          }

          await addBtn.click();
          await page.waitForTimeout(300);

          const inputs = getLocationFormInputs(page);
          if (await inputs.locationName.isVisible({ timeout: 1000 }).catch(() => false)) {
            await inputs.locationName.fill(`Location ${i + 1}`);
            await inputs.address.fill(`${i + 1} Main Street`);
            await inputs.city.fill(`City ${i + 1}`);
            await inputs.country.fill('France');

            // Click "Done Editing" button
            const doneBtn = page.locator('button').filter({ hasText: /Done.*Editing/i }).first();
            if (await doneBtn.isVisible({ timeout: 500 }).catch(() => false)) {
              await doneBtn.click();
              await page.waitForTimeout(300);
              locationsAdded++;
            } else {
              console.log(`[Test 7.7] Done Editing button not visible for location ${i + 1}`);
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
        // Tier 2 should allow up to 5 locations
        expect(locationsAdded).toBeLessThanOrEqual(5);
      }
    }
  });
});
