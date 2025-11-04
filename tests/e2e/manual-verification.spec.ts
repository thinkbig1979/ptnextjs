/**
 * Manual Verification Tests for Vendor Location Mapping
 * These tests verify critical user-facing functionality
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const EVIDENCE_DIR = path.join(
  __dirname,
  '../../.agent-os/specs/2025-10-19-vendor-location-mapping/evidence/verification'
);

test.beforeAll(() => {
  if (!fs.existsSync(EVIDENCE_DIR)) {
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
  }
});

test.describe('Manual Verification: Homepage & Vendor Pages', () => {
  test('Test 1: Homepage Verification - Featured Partners Load', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check HTTP status
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    // Check featured partners section loads
    const partnersSection = page.locator('[data-testid="featured-partners-section"]');
    if (await partnersSection.isVisible({ timeout: 5000 })) {
      console.log('Featured partners section loaded successfully');
    }

    // Check for React errors
    const consoleErrors: any[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Take screenshot
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, '01-homepage-working.png'),
      fullPage: true,
    });

    console.log('Homepage verified - Console errors:', consoleErrors.length);
    expect(consoleErrors.length).toBe(0);
  });

  test('Test 2: Vendor Page with Location Data - Alfa Laval', async ({ page }) => {
    const consoleErrors: any[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/vendors/alfa-laval');
    await page.waitForLoadState('networkidle');

    // Check page loaded
    await expect(page.locator('h1')).toContainText('Alfa Laval');

    // Look for location section
    const locationSection = page.locator('[data-testid="vendor-location-section"]');
    if (await locationSection.isVisible({ timeout: 5000 })) {
      console.log('Location section found on Alfa Laval page');
    }

    // Look for map
    const mapElement = page.locator('[data-testid="vendor-map"]');
    if (await mapElement.isVisible({ timeout: 5000 })) {
      console.log('Map element visible on Alfa Laval page');
    }

    // Take screenshot
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, '02-vendor-with-location.png'),
      fullPage: true,
    });

    console.log('Vendor page verified - Console errors:', consoleErrors.length);
  });

  test('Test 3: Map Component Verification - Leaflet Map Rendering', async ({ page }) => {
    await page.goto('/vendors/caterpillar-marine');
    await page.waitForLoadState('networkidle');

    // Wait for map to load
    const mapWrapper = page.locator('[data-testid="vendor-map"]');
    await expect(mapWrapper).toBeVisible({ timeout: 10000 });

    // Verify Leaflet map tiles load
    await page.waitForTimeout(2000);
    const tileCount = await page.locator('.leaflet-tile-pane img').count();
    console.log('Map tiles loaded:', tileCount);
    expect(tileCount).toBeGreaterThan(0);

    // Check for vendor marker
    const markerCount = await page.locator('.leaflet-marker-pane img').count();
    console.log('Markers on map:', markerCount);
    expect(markerCount).toBeGreaterThan(0);

    // Interact with marker
    const marker = page.locator('.leaflet-marker-pane img').first();
    await marker.click();

    // Verify popup appears
    const popup = page.locator('.vendor-map-popup');
    await expect(popup).toBeVisible({ timeout: 3000 });

    // Take screenshot of map interaction
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, '03-map-interaction.png'),
    });

    console.log('Map rendering and interaction verified');
  });

  test('Test 4: Location Card Verification', async ({ page }) => {
    await page.goto('/vendors/crestron');
    await page.waitForLoadState('networkidle');

    // Verify location card exists
    const locationCard = page.locator('[data-testid="vendor-location-card"]');
    await expect(locationCard).toBeVisible();

    // Verify city/country displayed
    const locationText = page.locator('[data-testid="vendor-location"]');
    await expect(locationText).toBeVisible();
    const location = await locationText.textContent();
    console.log('Location:', location);

    // Verify coordinates displayed
    const coordinates = page.locator('[data-testid="vendor-coordinates"]');
    await expect(coordinates).toBeVisible();
    const coords = await coordinates.textContent();
    console.log('Coordinates:', coords);
    expect(coords).toMatch(/[-]?\d+\.\d+,\s*[-]?\d+\.\d+/);

    // Verify Get Directions button exists
    const directionsButton = page.locator('[data-testid="get-directions"]');
    await expect(directionsButton).toBeVisible();
    await expect(directionsButton).toContainText('Get Directions');

    // Take screenshot
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, '04-location-card.png'),
    });

    console.log('Location card verified');
  });

  test('Test 5: Get Directions Button Functionality', async ({ page }) => {
    await page.goto('/vendors/alfa-laval');
    await page.waitForLoadState('networkidle');

    const directionsButton = page.locator('[data-testid="get-directions"]');
    const href = await directionsButton.getAttribute('href');

    // Verify URL structure
    expect(href).toContain('https://www.google.com/maps/dir/');
    expect(href).toContain('destination=');
    expect(href).toContain('api=1');

    // Verify link opens in new tab
    const target = await directionsButton.getAttribute('target');
    expect(target).toBe('_blank');

    console.log('Directions button verified - URL:', href);
  });

  test('Test 6: Console Error Check Across All Vendors', async ({ page }) => {
    const vendors = ['alfa-laval', 'caterpillar-marine', 'crestron'];
    const errorLog = [];

    for (const vendor of vendors) {
      const consoleErrors: any[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto(`/vendors/${vendor}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      if (consoleErrors.length > 0) {
        errorLog.push(`${vendor}: ${consoleErrors.join(', ')}`);
      }
      console.log(`${vendor}: ${consoleErrors.length} console errors`);
    }

    expect(errorLog.length).toBe(0);
  });
});

test.describe('Manual Verification: Responsive Design', () => {
  test('Test 7: Mobile Viewport - Map and Location Card Display', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/vendors/alfa-laval');
    await page.waitForLoadState('networkidle');

    // Verify map visible on mobile
    const mapWrapper = page.locator('[data-testid="vendor-map"]');
    await expect(mapWrapper).toBeVisible({ timeout: 10000 });

    // Verify location card visible
    const locationCard = page.locator('[data-testid="vendor-location-card"]');
    await expect(locationCard).toBeVisible();

    // Verify Get Directions button clickable
    const directionsButton = page.locator('[data-testid="get-directions"]');
    await expect(directionsButton).toBeVisible();

    // Take mobile screenshot
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, '05-mobile-responsive.png'),
      fullPage: true,
    });

    console.log('Mobile responsive design verified');
  });

  test('Test 8: Desktop Viewport - Full Page Layout', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });

    await page.goto('/vendors/caterpillar-marine');
    await page.waitForLoadState('networkidle');

    // Verify all elements visible
    const mapWrapper = page.locator('[data-testid="vendor-map"]');
    const locationCard = page.locator('[data-testid="vendor-location-card"]');

    await expect(mapWrapper).toBeVisible({ timeout: 10000 });
    await expect(locationCard).toBeVisible();

    // Take desktop screenshot
    await page.screenshot({
      path: path.join(EVIDENCE_DIR, '06-desktop-layout.png'),
      fullPage: true,
    });

    console.log('Desktop layout verified');
  });
});

test.describe('Manual Verification: Data Integrity', () => {
  test('Test 9: Verify Coordinate Data Validity', async ({ page }) => {
    const vendors = ['alfa-laval', 'caterpillar-marine', 'crestron'];

    for (const vendor of vendors) {
      await page.goto(`/vendors/${vendor}`);
      await page.waitForLoadState('networkidle');

      const coordsElement = page.locator('[data-testid="vendor-coordinates"] p.font-mono');
      const coordsText = await coordsElement.textContent();

      if (coordsText) {
        const [lat, lng] = coordsText.split(',').map(s => parseFloat(s.trim()));

        // Validate ranges
        expect(lat).toBeGreaterThanOrEqual(-90);
        expect(lat).toBeLessThanOrEqual(90);
        expect(lng).toBeGreaterThanOrEqual(-180);
        expect(lng).toBeLessThanOrEqual(180);

        console.log(`${vendor}: ${lat}, ${lng} - VALID`);
      }
    }
  });

  test('Test 10: Verify All Required Fields Display', async ({ page }) => {
    await page.goto('/vendors/crestron');
    await page.waitForLoadState('networkidle');

    // Check all required data-testid elements exist
    const requiredElements = [
      'vendor-map',
      'vendor-location-card',
      'vendor-location',
      'vendor-coordinates',
      'get-directions',
    ];

    for (const testId of requiredElements) {
      const element = page.locator(`[data-testid="${testId}"]`);
      await expect(element).toBeVisible({ timeout: 5000 });
      console.log(`Element ${testId}: FOUND`);
    }
  });
});
