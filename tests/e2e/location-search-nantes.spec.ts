import { test, expect } from './fixtures/test-fixtures';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('Location Search - Nantes France Debug', () => {
  test('should debug Nantes search issue', async ({ page, geocodeMock }) => {
    // Listen to console messages
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      console.log('BROWSER:', text);
    });

    await page.goto(`${BASE_URL}/vendors`);
    await page.waitForLoadState('networkidle');

    // Scroll to location filter
    await page.locator('[data-testid="location-search-filter"]').scrollIntoViewIfNeeded();

    console.log('\n=== SEARCHING FOR NANTES ===\n');

    // Type Nantes in the location input
    const locationInput = page.locator('#location-name-input');
    await locationInput.fill('Nantes');

    // Wait for geocoding results (mock responds quickly)
    await page.waitForSelector('[data-testid="location-results-dropdown"]', { timeout: 5000 });

    // Get the geocoding results
    const results = await page.locator('[data-testid^="location-result-"]').count();
    console.log(`\n=== GEOCODING RESULTS: ${results} ===\n`);

    // Log all results
    for (let i = 0; i < results; i++) {
      const resultText = await page.locator(`[data-testid="location-result-${i}"]`).textContent();
      console.log(`Result ${i}: ${resultText}`);
    }

    // Select first result (Nantes, France)
    console.log('\n=== SELECTING NANTES (first result) ===\n');
    await page.locator('[data-testid="location-result-0"]').click();

    // Wait for state to update
    await page.waitForTimeout(500);

    // Check the distance slider value
    const distanceValue = await page.locator('[data-testid="distance-value"]').textContent();
    console.log(`\n=== DISTANCE: ${distanceValue} ===\n`);

    // Get results text
    const resultsText = await page.locator('text=/Showing.*vendors/').first().textContent().catch(() => 'No results text found');
    console.log(`\n=== RESULTS: ${resultsText} ===\n`);

    // Try increasing the radius to 800km
    console.log('\n=== INCREASING RADIUS TO 800km ===\n');
    await page.locator('[data-testid="distance-slider"]').fill('800');
    await page.waitForTimeout(500);

    const newResultsText = await page.locator('text=/Showing.*vendors/').first().textContent().catch(() => 'No results text found');
    console.log(`\n=== RESULTS AT 800km: ${newResultsText} ===\n`);

    // Print vendor location logs
    console.log('\n=== VENDOR LOCATION LOGS ===');
    const locationLogs = consoleLogs.filter(log =>
      log.includes('Vendor location data') ||
      log.includes('filteredCount') ||
      log.includes('Error calculating distance')
    );
    locationLogs.forEach(log => console.log(log));

    // Take screenshot
    await page.screenshot({ path: 'test-results/nantes-search-debug.png', fullPage: true });
  });

  test('should check vendor coordinates in database', async ({ page, geocodeMock }) => {
    // Add a script to check vendor data
    await page.goto(`${BASE_URL}/vendors`);
    await page.waitForLoadState('networkidle');

    const vendorData = await page.evaluate(() => {
      // Get vendor data from window or component props
      const vendorElements = document.querySelectorAll('[data-testid="vendor-card"]');
      return Array.from(vendorElements).length;
    });

    console.log(`\n=== TOTAL VENDORS ON PAGE: ${vendorData} ===\n`);

    // Check if we can access vendor location data through the page
    const locationInfo = await page.evaluate(() => {
      // Try to get location data from the page
      const locationBadges = document.querySelectorAll('[data-testid="vendor-card"] .text-xs');
      const locations: string[] = [];
      locationBadges.forEach(badge => {
        const text = badge.textContent;
        if (text && text.includes('+')) {
          locations.push(text.trim());
        }
      });
      return locations;
    });

    console.log('\n=== VENDOR LOCATIONS FROM CARDS ===');
    locationInfo.forEach((loc, i) => console.log(`${i + 1}. ${loc}`));
  });
});
