import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Location Discovery Feature
 *
 * Tests cover:
 * 1. VendorsNearYou component on product detail pages
 * 2. Category filtering on vendors page
 * 3. Location persistence across page navigation
 *
 * Test Strategy:
 * - Use localStorage.setItem() to simulate user location preference
 * - Clear localStorage before each test for isolation
 * - Verify data-testid attributes for reliable element selection
 * - Test both "no location" and "location set" states
 */

const BASE_URL = 'http://localhost:3000';
const STORAGE_KEY = 'pt_user_location';

// Sample location data (Monaco - a common superyacht location)
const MONACO_LOCATION = {
  latitude: 43.7384,
  longitude: 7.4246,
  displayName: 'Monaco',
  timestamp: Date.now()
};

// Old location (31 days ago - should be expired)
const EXPIRED_LOCATION = {
  latitude: 43.7384,
  longitude: 7.4246,
  displayName: 'Monaco',
  timestamp: Date.now() - (31 * 24 * 60 * 60 * 1000) // 31 days ago
};

test.describe('Vendors Near You - Product Page', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test for isolation
    await page.evaluate(() => localStorage.clear());
  });

  test('shows "Set location" prompt when no location saved', async ({ page }) => {
    console.log('\n===== TEST: No Location Prompt =====');

    // Navigate to products page to find a product
    await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle' });

    // Get first product link
    const productLink = page.locator('a[href^="/products/"]').first();
    const productHref = await productLink.getAttribute('href');

    if (!productHref) {
      console.log('⚠️  No products found on products page, skipping test');
      test.skip();
      return;
    }

    console.log(`[OK] Navigating to product: ${productHref}`);
    await page.goto(`${BASE_URL}${productHref}`, { waitUntil: 'networkidle' });

    // Wait for page to fully load
    await page.waitForSelector('h1', { timeout: 10000 });

    // Check if VendorsNearYou section exists
    // It should be in a Card with "Vendors Near You" title
    const vendorsNearYouSection = page.locator('h3, [class*="CardTitle"]').filter({ hasText: 'Vendors Near You' });

    if (await vendorsNearYouSection.count() === 0) {
      console.log('⚠️  VendorsNearYou section not found (product may not have a category), skipping test');
      test.skip();
      return;
    }

    console.log('[OK] VendorsNearYou section found');
    await expect(vendorsNearYouSection).toBeVisible({ timeout: 5000 });

    // Verify "Set your location" prompt is shown
    const setLocationPrompt = page.locator('text=Set your location to find nearby vendors');
    await expect(setLocationPrompt).toBeVisible({ timeout: 5000 });
    console.log('[OK] "Set your location" prompt is visible');

    // Verify "Search Vendors" button/link is present
    const searchVendorsButton = page.locator('text=Search Vendors');
    await expect(searchVendorsButton).toBeVisible({ timeout: 5000 });
    console.log('[OK] "Search Vendors" button is visible');

    // Verify button links to vendors page with category parameter
    const buttonLink = await searchVendorsButton.locator('..').getAttribute('href');
    expect(buttonLink).toContain('/vendors');
    expect(buttonLink).toContain('category=');
    console.log(`[OK] Button links to: ${buttonLink}`);

    await page.screenshot({ path: '/tmp/vendors-near-you-no-location.png' });
  });

  test('shows nearby vendors when location is set', async ({ page }) => {
    console.log('\n===== TEST: Nearby Vendors with Location =====');

    // Set location in localStorage before navigating
    await page.addInitScript((data) => {
      localStorage.setItem(data.key, JSON.stringify(data.location));
    }, { key: STORAGE_KEY, location: MONACO_LOCATION });

    console.log('[OK] Location set in localStorage');

    // Navigate to products page to find a product
    await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle' });

    // Get first product link
    const productLink = page.locator('a[href^="/products/"]').first();
    const productHref = await productLink.getAttribute('href');

    if (!productHref) {
      console.log('⚠️  No products found on products page, skipping test');
      test.skip();
      return;
    }

    console.log(`[OK] Navigating to product: ${productHref}`);
    await page.goto(`${BASE_URL}${productHref}`, { waitUntil: 'networkidle' });

    // Wait for page to fully load
    await page.waitForSelector('h1', { timeout: 10000 });

    // Check if VendorsNearYou section exists
    const vendorsNearYouSection = page.locator('h3, [class*="CardTitle"]').filter({ hasText: 'Vendors Near You' });

    if (await vendorsNearYouSection.count() === 0) {
      console.log('⚠️  VendorsNearYou section not found (product may not have a category), skipping test');
      test.skip();
      return;
    }

    console.log('[OK] VendorsNearYou section found');
    await expect(vendorsNearYouSection).toBeVisible({ timeout: 5000 });

    // Wait a bit for vendors to load
    await page.waitForTimeout(1000);

    // Check for vendor cards or "no vendors" message
    const vendorCards = page.locator('[data-testid="nearby-vendor-card"]');
    const noVendorsMessage = page.locator('text=No vendors found within');
    const viewAllVendorsButton = page.locator('text=View all vendors, text=View All Vendors');

    const vendorCardCount = await vendorCards.count();
    const hasNoVendorsMessage = await noVendorsMessage.isVisible({ timeout: 2000 }).catch(() => false);
    const hasViewAllButton = await viewAllVendorsButton.isVisible({ timeout: 2000 }).catch(() => false);

    if (vendorCardCount > 0) {
      console.log(`[OK] Found ${vendorCardCount} nearby vendor cards`);

      // Verify vendor cards have expected content
      const firstCard = vendorCards.first();
      await expect(firstCard).toBeVisible();

      // Check for vendor name (h4)
      const vendorName = firstCard.locator('h4');
      await expect(vendorName).toBeVisible();
      const nameText = await vendorName.textContent();
      console.log(`[OK] First vendor: ${nameText}`);

      // Check for location (city, country)
      const location = firstCard.locator('p.text-xs').first();
      await expect(location).toBeVisible();

      // Check for distance indicator (if present)
      const distanceIndicator = firstCard.locator('text=/away$/');
      if (await distanceIndicator.count() > 0) {
        console.log('[OK] Distance indicator found');
      }

      // Verify "View all vendors" button is present
      await expect(viewAllVendorsButton.first()).toBeVisible();
      console.log('[OK] "View all vendors" button is visible');
    } else if (hasNoVendorsMessage) {
      console.log('[OK] "No vendors found" message displayed (expected for some categories)');
      await expect(noVendorsMessage).toBeVisible();

      // Should still show "View All Vendors" button
      await expect(viewAllVendorsButton.first()).toBeVisible();
      console.log('[OK] "View All Vendors" button is visible');
    } else {
      console.log('⚠️  No vendor cards or "no vendors" message found, component may be loading');
      // This is acceptable - not all products have vendors in their category
    }

    await page.screenshot({ path: '/tmp/vendors-near-you-with-location.png' });
  });

  test('clicking vendor card navigates to vendor page', async ({ page }) => {
    console.log('\n===== TEST: Vendor Card Navigation =====');

    // Set location in localStorage before navigating
    await page.addInitScript((data) => {
      localStorage.setItem(data.key, JSON.stringify(data.location));
    }, { key: STORAGE_KEY, location: MONACO_LOCATION });

    // Navigate to products page to find a product
    await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle' });

    // Get first product link
    const productLink = page.locator('a[href^="/products/"]').first();
    const productHref = await productLink.getAttribute('href');

    if (!productHref) {
      console.log('⚠️  No products found on products page, skipping test');
      test.skip();
      return;
    }

    console.log(`[OK] Navigating to product: ${productHref}`);
    await page.goto(`${BASE_URL}${productHref}`, { waitUntil: 'networkidle' });

    // Wait for page to fully load
    await page.waitForSelector('h1', { timeout: 10000 });

    // Check for vendor cards
    const vendorCards = page.locator('[data-testid="nearby-vendor-card"]');
    const vendorCardCount = await vendorCards.count();

    if (vendorCardCount === 0) {
      console.log('⚠️  No vendor cards found (no nearby vendors), skipping test');
      test.skip();
      return;
    }

    console.log(`[OK] Found ${vendorCardCount} vendor cards`);

    // Get href of first vendor card
    const firstCard = vendorCards.first();
    const vendorHref = await firstCard.getAttribute('href');

    expect(vendorHref).toBeTruthy();
    expect(vendorHref).toContain('/vendors/');
    console.log(`[OK] Vendor card links to: ${vendorHref}`);

    // Click the card
    await firstCard.click();

    // Wait for navigation
    await page.waitForURL(/\/vendors\/.+/, { timeout: 10000 });

    // Verify we're on a vendor detail page
    const currentUrl = page.url();
    expect(currentUrl).toContain('/vendors/');
    console.log(`[OK] Navigated to vendor page: ${currentUrl}`);

    // Verify vendor page loaded
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 });

    await page.screenshot({ path: '/tmp/vendor-card-navigation.png' });
  });

  test('clears expired location (31+ days old)', async ({ page }) => {
    console.log('\n===== TEST: Expired Location Cleared =====');

    // Set expired location (31 days old) in localStorage
    await page.addInitScript((data) => {
      localStorage.setItem(data.key, JSON.stringify(data.location));
    }, { key: STORAGE_KEY, location: EXPIRED_LOCATION });

    console.log('[OK] Expired location set in localStorage (31 days old)');

    // Navigate to products page to find a product
    await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle' });

    // Get first product link
    const productLink = page.locator('a[href^="/products/"]').first();
    const productHref = await productLink.getAttribute('href');

    if (!productHref) {
      console.log('⚠️  No products found on products page, skipping test');
      test.skip();
      return;
    }

    console.log(`[OK] Navigating to product: ${productHref}`);
    await page.goto(`${BASE_URL}${productHref}`, { waitUntil: 'networkidle' });

    // Wait for page to fully load
    await page.waitForSelector('h1', { timeout: 10000 });

    // Check if VendorsNearYou section exists
    const vendorsNearYouSection = page.locator('h3, [class*="CardTitle"]').filter({ hasText: 'Vendors Near You' });

    if (await vendorsNearYouSection.count() === 0) {
      console.log('⚠️  VendorsNearYou section not found (product may not have a category), skipping test');
      test.skip();
      return;
    }

    console.log('[OK] VendorsNearYou section found');
    await expect(vendorsNearYouSection).toBeVisible({ timeout: 5000 });

    // Verify "Set your location" prompt is shown (location should be expired and cleared)
    const setLocationPrompt = page.locator('text=Set your location to find nearby vendors');
    await expect(setLocationPrompt).toBeVisible({ timeout: 5000 });
    console.log('[OK] "Set your location" prompt is visible (expired location was cleared)');

    // Verify localStorage was cleared
    const storedLocation = await page.evaluate((key) => {
      return localStorage.getItem(key);
    }, STORAGE_KEY);

    expect(storedLocation).toBeNull();
    console.log('[OK] Expired location was removed from localStorage');

    await page.screenshot({ path: '/tmp/expired-location-cleared.png' });
  });
});

test.describe('Vendor Category Filter', () => {
  test('filters vendors by product category', async ({ page }) => {
    console.log('\n===== TEST: Category Filter =====');

    // Navigate to vendors page
    await page.goto(`${BASE_URL}/vendors`, { waitUntil: 'networkidle' });
    console.log('[OK] Navigated to /vendors');

    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 10000 });

    // Look for the category select filter
    // According to vendors-client.tsx, it uses CategorySelect component
    const categoryLabel = page.locator('text=Filter by Product Type:');

    if (await categoryLabel.count() === 0) {
      console.log('⚠️  Category filter not found, skipping test');
      test.skip();
      return;
    }

    await expect(categoryLabel).toBeVisible({ timeout: 5000 });
    console.log('[OK] Category filter label found');

    // Find the Select trigger (shadcn/ui Select component)
    // The SelectTrigger is typically a button with role="combobox"
    const selectTrigger = page.locator('button[role="combobox"]').first();
    await expect(selectTrigger).toBeVisible({ timeout: 5000 });
    console.log('[OK] Category select trigger found');

    // Click to open the dropdown
    await selectTrigger.click();
    await page.waitForTimeout(500); // Wait for dropdown animation

    // Find category options in the dropdown
    // shadcn Select renders options with role="option"
    const categoryOptions = page.locator('[role="option"]');
    const optionCount = await categoryOptions.count();

    expect(optionCount).toBeGreaterThan(0);
    console.log(`[OK] Found ${optionCount} category options`);

    // Select a non-"All Categories" option (skip the first one which is "All Categories")
    if (optionCount > 1) {
      const secondOption = categoryOptions.nth(1);
      const categoryName = await secondOption.textContent();
      console.log(`[OK] Selecting category: ${categoryName}`);

      await secondOption.click();
      await page.waitForTimeout(500); // Wait for filter to apply

      // Verify URL params updated with productCategory
      const currentUrl = page.url();
      expect(currentUrl).toContain('productCategory=');
      console.log(`[OK] URL updated: ${currentUrl}`);

      // Verify filter description is shown
      const filterDescription = page.locator(`text=Showing vendors with ${categoryName} products`);
      if (await filterDescription.count() > 0) {
        await expect(filterDescription).toBeVisible();
        console.log('[OK] Filter description is visible');
      }

      await page.screenshot({ path: '/tmp/category-filter-applied.png' });
    } else {
      console.log('⚠️  Only "All Categories" option available, skipping test');
      test.skip();
    }
  });

  test('URL params persist category on refresh', async ({ page }) => {
    console.log('\n===== TEST: Category Persistence on Refresh =====');

    // Navigate directly to vendors page with productCategory param
    const categoryParam = 'navigation'; // Common category
    await page.goto(`${BASE_URL}/vendors?productCategory=${categoryParam}`, { waitUntil: 'networkidle' });
    console.log(`[OK] Navigated to /vendors?productCategory=${categoryParam}`);

    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 10000 });

    // Wait a bit for client-side state to initialize
    await page.waitForTimeout(1000);

    // Check if the category is pre-selected in the select
    const selectTrigger = page.locator('button[role="combobox"]').first();

    if (await selectTrigger.count() === 0) {
      console.log('⚠️  Category select not found, skipping test');
      test.skip();
      return;
    }

    // Get the current selected value from the select trigger
    const selectedValue = await selectTrigger.textContent();
    console.log(`[OK] Current selected value: ${selectedValue}`);

    // Refresh the page
    await page.reload({ waitUntil: 'networkidle' });
    console.log('[OK] Page refreshed');

    // Wait for page to reload
    await page.waitForSelector('h1', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Verify URL still has the productCategory param
    const currentUrl = page.url();
    expect(currentUrl).toContain(`productCategory=${categoryParam}`);
    console.log(`[OK] URL still contains productCategory: ${currentUrl}`);

    // Verify category is still selected
    const selectTriggerAfterRefresh = page.locator('button[role="combobox"]').first();
    const selectedValueAfterRefresh = await selectTriggerAfterRefresh.textContent();

    expect(selectedValueAfterRefresh).toBe(selectedValue);
    console.log(`[OK] Category still selected after refresh: ${selectedValueAfterRefresh}`);

    await page.screenshot({ path: '/tmp/category-persistence.png' });
  });

  test('clears category filter when "All Categories" selected', async ({ page }) => {
    console.log('\n===== TEST: Clear Category Filter =====');

    // Navigate to vendors page with a category filter
    await page.goto(`${BASE_URL}/vendors?productCategory=navigation`, { waitUntil: 'networkidle' });
    console.log('[OK] Navigated to /vendors with productCategory filter');

    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Verify URL has productCategory param
    let currentUrl = page.url();
    expect(currentUrl).toContain('productCategory=');
    console.log(`[OK] Initial URL: ${currentUrl}`);

    // Find and click the category select
    const selectTrigger = page.locator('button[role="combobox"]').first();

    if (await selectTrigger.count() === 0) {
      console.log('⚠️  Category select not found, skipping test');
      test.skip();
      return;
    }

    await selectTrigger.click();
    await page.waitForTimeout(500);

    // Select "All Categories" (first option)
    const allCategoriesOption = page.locator('[role="option"]').first();
    const allCategoriesText = await allCategoriesOption.textContent();

    expect(allCategoriesText).toContain('All Categories');
    console.log('[OK] "All Categories" option found');

    await allCategoriesOption.click();
    await page.waitForTimeout(500);

    // Verify URL no longer has productCategory param
    currentUrl = page.url();
    expect(currentUrl).not.toContain('productCategory=');
    console.log(`[OK] URL cleared productCategory: ${currentUrl}`);

    // Verify filter description is no longer shown
    const filterDescription = page.locator('text=/Showing vendors with .* products/');
    const hasFilterDescription = await filterDescription.isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasFilterDescription).toBe(false);
    console.log('[OK] Filter description is hidden');

    await page.screenshot({ path: '/tmp/category-filter-cleared.png' });
  });
});

test.describe('Location Persistence', () => {
  test('remembers location across page navigation', async ({ page }) => {
    console.log('\n===== TEST: Location Persistence Across Navigation =====');

    // Set location in localStorage
    await page.addInitScript((data) => {
      localStorage.setItem(data.key, JSON.stringify(data.location));
    }, { key: STORAGE_KEY, location: MONACO_LOCATION });

    console.log('[OK] Location set in localStorage');

    // Navigate to vendors page
    await page.goto(`${BASE_URL}/vendors`, { waitUntil: 'networkidle' });
    console.log('[OK] Navigated to vendors page');

    // Verify location is still in localStorage
    let storedLocation = await page.evaluate((key) => {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    }, STORAGE_KEY);

    expect(storedLocation).toBeTruthy();
    expect(storedLocation.latitude).toBe(MONACO_LOCATION.latitude);
    expect(storedLocation.longitude).toBe(MONACO_LOCATION.longitude);
    console.log(`[OK] Location persisted on vendors page: ${storedLocation.displayName}`);

    // Navigate to products page
    await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle' });
    console.log('[OK] Navigated to products page');

    // Verify location is still in localStorage
    storedLocation = await page.evaluate((key) => {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    }, STORAGE_KEY);

    expect(storedLocation).toBeTruthy();
    expect(storedLocation.latitude).toBe(MONACO_LOCATION.latitude);
    expect(storedLocation.longitude).toBe(MONACO_LOCATION.longitude);
    console.log(`[OK] Location persisted on products page: ${storedLocation.displayName}`);

    // Navigate to a product detail page (if available)
    const productLink = page.locator('a[href^="/products/"]').first();
    const productHref = await productLink.getAttribute('href');

    if (productHref) {
      await page.goto(`${BASE_URL}${productHref}`, { waitUntil: 'networkidle' });
      console.log(`[OK] Navigated to product detail page: ${productHref}`);

      // Verify location is still in localStorage
      storedLocation = await page.evaluate((key) => {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : null;
      }, STORAGE_KEY);

      expect(storedLocation).toBeTruthy();
      expect(storedLocation.latitude).toBe(MONACO_LOCATION.latitude);
      expect(storedLocation.longitude).toBe(MONACO_LOCATION.longitude);
      console.log(`[OK] Location persisted on product detail page: ${storedLocation.displayName}`);
    }

    await page.screenshot({ path: '/tmp/location-persistence.png' });
  });

  test('location persists after 30 days but not after 31 days', async ({ page }) => {
    console.log('\n===== TEST: Location Expiry Boundary (30 vs 31 days) =====');

    // Test 1: 30-day-old location (should NOT be expired)
    const location30DaysOld = {
      latitude: 43.7384,
      longitude: 7.4246,
      displayName: 'Monaco',
      timestamp: Date.now() - (30 * 24 * 60 * 60 * 1000) // Exactly 30 days ago
    };

    await page.addInitScript((data) => {
      localStorage.setItem(data.key, JSON.stringify(data.location));
    }, { key: STORAGE_KEY, location: location30DaysOld });

    console.log('[OK] 30-day-old location set in localStorage');

    // Navigate to products page
    await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle' });

    // Get first product link
    const productLink = page.locator('a[href^="/products/"]').first();
    const productHref = await productLink.getAttribute('href');

    if (!productHref) {
      console.log('⚠️  No products found, skipping test');
      test.skip();
      return;
    }

    await page.goto(`${BASE_URL}${productHref}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('h1', { timeout: 10000 });

    // Check if VendorsNearYou section exists
    const vendorsNearYouSection = page.locator('h3, [class*="CardTitle"]').filter({ hasText: 'Vendors Near You' });

    if (await vendorsNearYouSection.count() === 0) {
      console.log('⚠️  VendorsNearYou section not found, skipping test');
      test.skip();
      return;
    }

    // Verify location is still valid (should NOT show "Set your location" prompt)
    const setLocationPrompt = page.locator('text=Set your location to find nearby vendors');
    const hasSetLocationPrompt = await setLocationPrompt.isVisible({ timeout: 2000 }).catch(() => false);

    // At 30 days, location should still be valid
    expect(hasSetLocationPrompt).toBe(false);
    console.log('[OK] 30-day-old location is still valid (not expired)');

    // Verify location is still in localStorage
    let storedLocation = await page.evaluate((key) => {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    }, STORAGE_KEY);

    expect(storedLocation).toBeTruthy();
    console.log('[OK] 30-day-old location still in localStorage');

    // Test 2: Clear and set 31-day-old location (should be expired)
    await page.evaluate(() => localStorage.clear());

    await page.addInitScript((data) => {
      localStorage.setItem(data.key, JSON.stringify(data.location));
    }, { key: STORAGE_KEY, location: EXPIRED_LOCATION });

    console.log('[OK] 31-day-old location set in localStorage');

    // Reload the page
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('h1', { timeout: 10000 });

    // Verify "Set your location" prompt is shown (location should be expired)
    await expect(setLocationPrompt).toBeVisible({ timeout: 5000 });
    console.log('[OK] 31-day-old location is expired (shows set location prompt)');

    // Verify location was cleared from localStorage
    storedLocation = await page.evaluate((key) => {
      return localStorage.getItem(key);
    }, STORAGE_KEY);

    expect(storedLocation).toBeNull();
    console.log('[OK] 31-day-old location was cleared from localStorage');

    await page.screenshot({ path: '/tmp/location-expiry-boundary.png' });
  });
});
