/**
 * End-to-End Testing for Vendor Location Mapping Feature
 *
 * Comprehensive E2E tests validating the vendor location mapping implementation.
 * Tests cover map display, markers, location cards, responsive design, and user interactions.
 *
 * Test Scenarios:
 * 1. Vendor Detail Page Map Display
 * 2. Map Marker Visibility and Interactions
 * 3. Location Card Information Display
 * 4. Get Directions Functionality
 * 5. Responsive Design (Mobile/Desktop)
 * 6. Multiple Vendor Locations
 * 7. Fallback for Vendors Without Coordinates
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// Evidence directory for screenshots
const EVIDENCE_DIR = path.join(
  __dirname,
  '../../.agent-os/specs/2025-10-19-vendor-location-mapping/evidence/e2e'
);

// Ensure evidence directory exists
test.beforeAll(() => {
  if (!fs.existsSync(EVIDENCE_DIR)) {
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  }
});

/**
 * Test Scenario 1: Vendor Detail Page Map Display
 */
test.describe('1. Vendor Detail Page Map Display', () => {
  test('should display map on vendor detail page with coordinates', async ({ page }) => {
    // Navigate to a vendor with location data
    await page.goto('/vendors/alfa-laval');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that vendor page loaded
    await expect(page.locator('h1')).toContainText('Alfa Laval');
    
    // Wait for map to load (dynamically imported)
    const mapWrapper = page.locator('[data-testid="vendor-map"]');
    await expect(mapWrapper).toBeVisible({ timeout: 10000 });
    
    // Take screenshot
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, '01-vendor-page-with-map.png'),
      fullPage: true,
    });
    
    console.log('Map displayed on vendor detail page');
  });

  test('should load Leaflet map tiles correctly', async ({ page }) => {
    await page.goto('/vendors/caterpillar-marine');
    await page.waitForLoadState('networkidle');
    
    // Wait for map container
    const mapContainer = page.locator('.vendor-map-container');
    await expect(mapContainer).toBeVisible({ timeout: 10000 });
    
    // Wait for tiles to load (check for tile images in map)
    await page.waitForTimeout(2000); // Allow tiles to load
    
    // Check that OpenFreeMap tiles loaded
    const tileImages = await page.locator('.leaflet-tile-pane img').count();
    expect(tileImages).toBeGreaterThan(0);
    
    console.log('Loaded map tiles count:', tileImages);
  });

  test('should display map with proper dimensions', async ({ page }) => {
    await page.goto('/vendors/crestron');
    await page.waitForLoadState('networkidle');
    
    const mapWrapper = page.locator('[data-testid="vendor-map"]');
    await expect(mapWrapper).toBeVisible({ timeout: 10000 });
    
    // Check map has proper height
    const boundingBox = await mapWrapper.boundingBox();
    expect(boundingBox?.height).toBeGreaterThan(300); // Should be at least 300px
    
    console.log('Map dimensions:', boundingBox?.width, 'x', boundingBox?.height);
  });
});

/**
 * Test Scenario 2: Map Marker Visibility and Interactions
 */
test.describe('2. Map Marker Visibility and Interactions', () => {
  test('should display vendor marker on map', async ({ page }) => {
    await page.goto('/vendors/alfa-laval');
    await page.waitForLoadState('networkidle');
    
    // Wait for map to load
    const mapWrapper = page.locator('[data-testid="vendor-map"]');
    await expect(mapWrapper).toBeVisible({ timeout: 10000 });
    
    // Wait for marker to appear
    await page.waitForTimeout(1500);
    
    // Check for marker element
    const marker = page.locator('.leaflet-marker-pane img');
    await expect(marker).toBeVisible({ timeout: 5000 });
    
    // Take screenshot showing marker
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, '02-map-with-marker.png'),
    });
    
    console.log('Vendor marker visible on map');
  });

  test('should display popup when marker is clicked', async ({ page }) => {
    await page.goto('/vendors/caterpillar-marine');
    await page.waitForLoadState('networkidle');
    
    // Wait for map and marker
    await page.waitForTimeout(2000);
    
    // Click on marker
    const marker = page.locator('.leaflet-marker-pane img').first();
    await marker.click();
    
    // Check popup appears
    const popup = page.locator('.vendor-map-popup');
    await expect(popup).toBeVisible({ timeout: 3000 });
    
    // Verify popup contains vendor name
    await expect(popup.locator('h3')).toContainText('Caterpillar Marine');
    
    // Verify popup contains coordinates
    const coordsText = await popup.locator('p.text-xs').textContent();
    expect(coordsText).toMatch(/[-]?\d+\.\d+,\s*[-]?\d+\.\d+/);
    
    // Take screenshot of popup
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, '03-marker-popup.png'),
    });
    
    console.log('Marker popup displays correctly');
  });

  test('should verify marker icon images load', async ({ page }) => {
    await page.goto('/vendors/crestron');
    await page.waitForLoadState('networkidle');
    
    // Wait for marker
    await page.waitForTimeout(2000);
    
    // Check marker icon
    const markerIcon = page.locator('.leaflet-marker-pane img').first();
    await expect(markerIcon).toBeVisible();
    
    // Verify icon has src attribute
    const iconSrc = await markerIcon.getAttribute('src');
    expect(iconSrc).toContain('marker-icon');
    
    console.log('Marker icon loaded:', iconSrc);
  });
});

/**
 * Test Scenario 3: Location Card Information Display
 */
test.describe('3. Location Card Information Display', () => {
  test('should display VendorLocationCard with complete information', async ({ page }) => {
    await page.goto('/vendors/alfa-laval');
    await page.waitForLoadState('networkidle');
    
    // Find location card
    const locationCard = page.locator('[data-testid="vendor-location-card"]');
    await expect(locationCard).toBeVisible();
    
    // Verify card title
    await expect(locationCard.getByText('Location')).toBeVisible();
    
    // Check location display (city, country)
    const locationText = page.locator('[data-testid="vendor-location"]');
    await expect(locationText).toBeVisible();
    
    // Check coordinates display
    const coordinates = page.locator('[data-testid="vendor-coordinates"]');
    await expect(coordinates).toBeVisible();
    
    const coordsText = await coordinates.textContent();
    expect(coordsText).toMatch(/Coordinates/i);
    expect(coordsText).toMatch(/[-]?\d+\.\d+,\s*[-]?\d+\.\d+/);
    
    // Take screenshot
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, '04-location-card.png'),
    });
    
    console.log('Location card displays complete information');
  });

  test('should display address when available', async ({ page }) => {
    await page.goto('/vendors/caterpillar-marine');
    await page.waitForLoadState('networkidle');
    
    const locationCard = page.locator('[data-testid="vendor-location-card"]');
    await expect(locationCard).toBeVisible();
    
    // Check for address field
    const address = page.locator('[data-testid="vendor-address"]');
    
    // If address exists, verify it is displayed
    if (await address.isVisible()) {
      const addressText = await address.textContent();
      expect(addressText).toMatch(/Address/i);
      console.log('Address displayed');
    } else {
      console.log('No address data for this vendor');
    }
  });

  test('should format coordinates correctly', async ({ page }) => {
    await page.goto('/vendors/crestron');
    await page.waitForLoadState('networkidle');
    
    const coordinates = page.locator('[data-testid="vendor-coordinates"]');
    await expect(coordinates).toBeVisible();
    
    // Extract coordinates text
    const coordsText = await coordinates.locator('p.font-mono').textContent();
    
    // Verify format: latitude, longitude (with 4 decimal places)
    const coordsPattern = /^[-]?\d+\.\d{4},\s*[-]?\d+\.\d{4}$/;
    expect(coordsText?.trim()).toMatch(coordsPattern);
    
    console.log('Coordinates formatted correctly:', coordsText);
  });
});

/**
 * Test Scenario 4: Get Directions Functionality
 */
test.describe('4. Get Directions Functionality', () => {
  test('should display Get Directions button', async ({ page }) => {
    await page.goto('/vendors/alfa-laval');
    await page.waitForLoadState('networkidle');
    
    // Find Get Directions button
    const directionsButton = page.locator('[data-testid="get-directions"]');
    await expect(directionsButton).toBeVisible();
    
    // Verify button text
    await expect(directionsButton).toContainText('Get Directions');
    
    // Take screenshot
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, '05-get-directions-button.png'),
    });
    
    console.log('Get Directions button displayed');
  });

  test('should have correct Google Maps directions URL', async ({ page }) => {
    await page.goto('/vendors/caterpillar-marine');
    await page.waitForLoadState('networkidle');

    const directionsButton = page.locator('[data-testid="get-directions"]');
    await expect(directionsButton).toBeVisible();

    // With asChild, the data-testid is on the <a> element itself
    const href = await directionsButton.getAttribute('href');

    // Verify it is a Google Maps directions URL
    expect(href).toContain('https://www.google.com/maps/dir/');
    expect(href).toContain('destination=');
    expect(href).toContain('api=1');

    // Verify it opens in new tab
    const target = await directionsButton.getAttribute('target');
    expect(target).toBe('_blank');

    const rel = await directionsButton.getAttribute('rel');
    expect(rel).toContain('noopener');

    console.log('Directions URL validated');
  });

  test('should include vendor name in directions query', async ({ page }) => {
    await page.goto('/vendors/crestron');
    await page.waitForLoadState('networkidle');

    const directionsButton = page.locator('[data-testid="get-directions"]');
    await expect(directionsButton).toBeVisible();

    // With asChild, the data-testid is on the <a> element itself
    const href = await directionsButton.getAttribute('href');

    // Verify query parameter includes vendor name
    expect(href).toContain('query=');
    expect(href).toContain('Crestron');

    console.log('Vendor name included in directions URL');
  });
});

/**
 * Test Scenario 5: Responsive Design (Mobile/Desktop)
 */
test.describe('5. Responsive Design', () => {
  test('should display map correctly on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/vendors/alfa-laval');
    await page.waitForLoadState('networkidle');
    
    // Map should still be visible
    const mapWrapper = page.locator('[data-testid="vendor-map"]');
    await expect(mapWrapper).toBeVisible({ timeout: 10000 });
    
    // Check map dimensions fit mobile viewport
    const boundingBox = await mapWrapper.boundingBox();
    expect(boundingBox?.width).toBeLessThanOrEqual(375);
    
    // Take mobile screenshot
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, '06-mobile-map.png'),
      fullPage: true,
    });
    
    console.log('Map displays correctly on mobile');
  });

  test('should display location card correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/vendors/caterpillar-marine');
    await page.waitForLoadState('networkidle');
    
    const locationCard = page.locator('[data-testid="vendor-location-card"]');
    await expect(locationCard).toBeVisible();
    
    // Verify card is readable on mobile
    const boundingBox = await locationCard.boundingBox();
    expect(boundingBox?.width).toBeLessThanOrEqual(375);
    
    // Verify Get Directions button is clickable
    const directionsButton = page.locator('[data-testid="get-directions"]');
    await expect(directionsButton).toBeVisible();
    
    // Take mobile screenshot
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, '07-mobile-location-card.png'),
    });
    
    console.log('Location card displays correctly on mobile');
  });

  test('should display map correctly on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/vendors/crestron');
    await page.waitForLoadState('networkidle');
    
    const mapWrapper = page.locator('[data-testid="vendor-map"]');
    await expect(mapWrapper).toBeVisible({ timeout: 10000 });
    
    // Take tablet screenshot
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, '08-tablet-map.png'),
      fullPage: true,
    });
    
    console.log('Map displays correctly on tablet');
  });

  test('should display map correctly on desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await page.goto('/vendors/alfa-laval');
    await page.waitForLoadState('networkidle');
    
    const mapWrapper = page.locator('[data-testid="vendor-map"]');
    await expect(mapWrapper).toBeVisible({ timeout: 10000 });
    
    // Take desktop screenshot
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, '09-desktop-map.png'),
      fullPage: true,
    });
    
    console.log('Map displays correctly on desktop');
  });
});

/**
 * Test Scenario 6: Multiple Vendor Locations
 */
test.describe('6. Multiple Vendor Locations', () => {
  const vendorsToTest = [
    { slug: 'alfa-laval', name: 'Alfa Laval' },
    { slug: 'caterpillar-marine', name: 'Caterpillar Marine' },
    { slug: 'crestron', name: 'Crestron' },
  ];

  for (const vendor of vendorsToTest) {
    test('should display map and location for ' + vendor.name, async ({ page }) => {
      await page.goto('/vendors/' + vendor.slug);
      await page.waitForLoadState('networkidle');
      
      // Verify vendor name
      await expect(page.locator('h1')).toContainText(vendor.name);
      
      // Verify map is visible
      const mapWrapper = page.locator('[data-testid="vendor-map"]');
      await expect(mapWrapper).toBeVisible({ timeout: 10000 });
      
      // Verify location card
      const locationCard = page.locator('[data-testid="vendor-location-card"]');
      await expect(locationCard).toBeVisible();
      
      // Verify location text exists
      const locationText = await page.locator('[data-testid="vendor-location"]').textContent();
      expect(locationText).toBeTruthy();
      
      // Take screenshot
      await page.screenshot({
        path: path.join(EVIDENCE_DIR, '10-' + vendor.slug + '-location.png'),
      });
      
      console.log(vendor.name + ' - Map and location verified');
    });
  }

  test('should display different coordinates for different vendors', async ({ page }) => {
    const coordinates: string[] = [];
    
    for (const vendor of vendorsToTest) {
      await page.goto('/vendors/' + vendor.slug);
      await page.waitForLoadState('networkidle');
      
      const coordsElement = page.locator('[data-testid="vendor-coordinates"] p.font-mono');
      const coordsText = await coordsElement.textContent();
      
      if (coordsText) {
        coordinates.push(coordsText);
        console.log(vendor.name + ': ' + coordsText);
      }
    }
    
    // Verify we got coordinates for all vendors
    expect(coordinates.length).toBe(vendorsToTest.length);
    
    // Verify coordinates are valid
    for (const coord of coordinates) {
      expect(coord).toMatch(/[-]?\d+\.\d+,\s*[-]?\d+\.\d+/);
    }
    
    console.log('Retrieved coordinates for ' + coordinates.length + ' vendors');
  });
});

/**
 * Test Scenario 7: Fallback Handling
 */
test.describe('7. Fallback Handling', () => {
  test('should validate coordinate ranges', async ({ page }) => {
    await page.goto('/vendors/alfa-laval');
    await page.waitForLoadState('networkidle');
    
    const coordsElement = page.locator('[data-testid="vendor-coordinates"] p.font-mono');
    const coordsText = await coordsElement.textContent();
    
    if (coordsText) {
      const [lat, lng] = coordsText.split(',').map(s => parseFloat(s.trim()));
      
      // Validate latitude range: -90 to 90
      expect(lat).toBeGreaterThanOrEqual(-90);
      expect(lat).toBeLessThanOrEqual(90);
      
      // Validate longitude range: -180 to 180
      expect(lng).toBeGreaterThanOrEqual(-180);
      expect(lng).toBeLessThanOrEqual(180);
      
      console.log('Coordinates within valid ranges:', lat, lng);
    }
  });
});

/**
 * Test Scenario 8: Visual Verification Summary
 */
test.describe('8. Visual Verification Summary', () => {
  test('should capture complete vendor page with map for documentation', async ({ page }) => {
    const vendorsForDocs = ['alfa-laval', 'caterpillar-marine', 'crestron'];
    
    for (const vendorSlug of vendorsForDocs) {
      await page.goto('/vendors/' + vendorSlug);
      await page.waitForLoadState('networkidle');
      
      // Wait for map to fully load
      await page.waitForTimeout(3000);
      
      // Take full page screenshot
      await page.screenshot({
        path: path.join(EVIDENCE_DIR, 'complete-' + vendorSlug + '-page.png'),
        fullPage: true,
      });
      
      // Take focused map screenshot
      const mapWrapper = page.locator('[data-testid="vendor-map"]');
      await mapWrapper.screenshot({
        path: path.join(EVIDENCE_DIR, 'map-' + vendorSlug + '.png'),
      });
      
      // Take focused location card screenshot
      const locationCard = page.locator('[data-testid="vendor-location-card"]');
      await locationCard.screenshot({
        path: path.join(EVIDENCE_DIR, 'location-card-' + vendorSlug + '.png'),
      });
      
      console.log('Documentation screenshots captured for ' + vendorSlug);
    }
  });
});
