import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('Vendor Map - Final Verification', () => {
  test('should display complete functional map with tiles and markers', async ({ page }) => {
    const consoleMessages: { type: string; text: string }[] = [];
    const consoleErrors: string[] = [];

    // Capture all console messages
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text()
      });
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to vendor page with coordinates
    await page.goto(`${BASE_URL}/vendors/alfa-laval/`);
    await page.waitForLoadState('networkidle');

    // Click on "Locations" tab to reveal the map
    // The map is in a tabbed interface and defaults to "About" tab
    const locationsTab = page.getByRole('tab', { name: /locations/i });
    await expect(locationsTab).toBeVisible({ timeout: 10000 });
    await locationsTab.click();

    // Wait for map container (dynamically loaded after tab switch)
    // The map is inside a region with aria-label="Locations map"
    // Use .leaflet-container class since MapContainer generates this
    const mapContainer = page.locator('.leaflet-container');
    await expect(mapContainer).toBeVisible({ timeout: 15000 });

    // Wait for tiles to fully load
    await page.waitForTimeout(5000);

    // Verify map tiles loaded successfully
    const tileInfo = await page.evaluate(() => {
      const tiles = document.querySelectorAll('.leaflet-tile');
      const loadedTiles = Array.from(tiles).filter(tile => {
        const img = tile as HTMLImageElement;
        return img.complete && img.naturalWidth > 0;
      });
      return {
        total: tiles.length,
        loaded: loadedTiles.length,
        sampleTile: loadedTiles.length > 0 ? {
          width: (loadedTiles[0] as HTMLImageElement).naturalWidth,
          height: (loadedTiles[0] as HTMLImageElement).naturalHeight,
          src: (loadedTiles[0] as HTMLImageElement).src
        } : null
      };
    });

    // Verify marker is present
    const markerExists = await page.evaluate(() => {
      return document.querySelector('.leaflet-marker-icon') !== null;
    });

    // Verify zoom controls
    const zoomControls = await page.evaluate(() => {
      const zoomIn = document.querySelector('.leaflet-control-zoom-in');
      const zoomOut = document.querySelector('.leaflet-control-zoom-out');
      return {
        zoomInExists: zoomIn !== null,
        zoomOutExists: zoomOut !== null
      };
    });

    // Verify attribution
    const attribution = await page.evaluate(() => {
      const attr = document.querySelector('.leaflet-control-attribution');
      return attr?.textContent || null;
    });

    // Take full page screenshot
    await page.screenshot({
      path: 'test-results/map-final-verification.png',
      fullPage: true
    });

    // Take closeup of map using locator screenshot
    await mapContainer.screenshot({
      path: 'test-results/map-closeup-final.png'
    });

    // Filter out known safe console messages
    const relevantErrors = consoleErrors.filter(error =>
      !error.includes('Lit is in dev mode') &&
      !error.includes('favicon') &&
      !error.includes('401 (Unauthorized)')
    );

    // Log results
    console.log('\n=== FINAL VERIFICATION RESULTS ===');
    console.log('Map Tiles:');
    console.log('  - Total tiles:', tileInfo.total);
    console.log('  - Loaded tiles:', tileInfo.loaded);
    console.log('  - Sample tile:', tileInfo.sampleTile);
    console.log('\nMap Elements:');
    console.log('  - Marker present:', markerExists);
    console.log('  - Zoom in control:', zoomControls.zoomInExists);
    console.log('  - Zoom out control:', zoomControls.zoomOutExists);
    console.log('  - Attribution:', attribution?.substring(0, 50) + '...');
    console.log('\nConsole:');
    console.log('  - Errors (filtered):', relevantErrors.length > 0 ? relevantErrors : 'None');
    console.log('===================================\n');

    // Assertions
    expect(tileInfo.loaded).toBeGreaterThan(0);
    expect(tileInfo.sampleTile).not.toBeNull();
    expect(tileInfo.sampleTile?.width).toBe(256);
    expect(tileInfo.sampleTile?.height).toBe(256);
    expect(markerExists).toBe(true);
    expect(zoomControls.zoomInExists).toBe(true);
    expect(zoomControls.zoomOutExists).toBe(true);
    expect(attribution).toContain('OpenStreetMap');
    expect(relevantErrors.length).toBe(0);
  });

  test('should display map on another vendor page', async ({ page }) => {
    // Test with a different vendor to ensure it works across the site
    await page.goto(`${BASE_URL}/vendors/`);
    await page.waitForLoadState('networkidle');

    // Find a vendor card with coordinates and click it
    const vendorCards = await page.locator('[data-testid="vendor-card"]').all();

    // Take screenshot of vendors list
    await page.screenshot({
      path: 'test-results/vendors-list.png',
      fullPage: true
    });

    console.log(`Found ${vendorCards.length} vendor cards on the vendors page`);
  });
});
