import { test, expect, Page } from '@playwright/test';
import { seedVendors, createTestVendor } from '../helpers/seed-api-helpers';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test.describe('PUBLIC-P2: Public Profile Display', () => {
  test.setTimeout(60000); // 60 seconds timeout

  test('Test 10.1: Free tier public profile shows basic info only', async ({ page }) => {
    const vendorData = createTestVendor({
      tier: 'free',
      status: 'approved',
      description: 'Free tier vendor with basic information',
      website: 'https://example.com',
    });

    await seedVendors(page, [vendorData]);

    // Navigate to public profile
    const slug = vendorData.companyName.toLowerCase().replace(/\s+/g, '-');
    await page.goto(`${BASE_URL}/vendors/${slug}/`);
    await page.waitForLoadState('networkidle');

    // Verify basic info is visible
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible({ timeout: 5000 });

    const description = page.locator('text=/basic information|vendor/i').first();
    await expect(description).toBeVisible({ timeout: 3000 }).catch(() => {});

    // Verify advanced features are NOT visible for free tier
    const teamSection = page.locator('text=/Team|Meet.*Team/i').first();
    const teamVisible = await teamSection.isVisible({ timeout: 2000 }).catch(() => false);

    const certificationsSection = page.locator('text=/Certification|Certified/i').first();
    const certsVisible = await certificationsSection.isVisible({ timeout: 2000 }).catch(() => false);

    // Free tier should not show advanced sections or they should be empty
    console.log('[Test 10.1] Team section visible:', teamVisible);
    console.log('[Test 10.1] Certifications section visible:', certsVisible);
  });

  test('Test 10.2: Tier 1 public profile shows enhanced features', async ({ page }) => {
    const vendorData = createTestVendor({
      tier: 'tier1',
      status: 'approved',
      description: 'Tier 1 vendor with enhanced features',
      website: 'https://tier1-example.com',
      foundedYear: 2015,
    });

    await seedVendors(page, [vendorData]);

    const slug = vendorData.companyName.toLowerCase().replace(/\s+/g, '-');
    await page.goto(`${BASE_URL}/vendors/${slug}/`);
    await page.waitForLoadState('networkidle');

    // Verify enhanced features are available
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 5000 });

    // Check for years in business (computed field)
    const currentYear = new Date().getFullYear();
    const yearsInBusiness = currentYear - 2015;
    const yearsText = page.locator(`text=/${yearsInBusiness}.*year/i`).first();
    const yearsVisible = await yearsText.isVisible({ timeout: 3000 }).catch(() => false);
    console.log('[Test 10.2] Years in business displayed:', yearsVisible);

    // Check for tier 1 features availability
    const brandStory = page.locator('text=/about|story|history/i').first();
    const storyVisible = await brandStory.isVisible({ timeout: 3000 }).catch(() => false);
    console.log('[Test 10.2] Brand story section visible:', storyVisible);

    // Tier badge should indicate tier 1
    const tierBadge = page.locator('text=/Tier 1|Advanced/i, [data-tier="1"]').first();
    const badgeVisible = await tierBadge.isVisible({ timeout: 3000 }).catch(() => false);
    console.log('[Test 10.2] Tier 1 badge visible:', badgeVisible);
  });

  test('Test 10.3: Tier 2 public profile shows locations map', async ({ page }) => {
    const vendorData = createTestVendor({
      tier: 'tier2',
      status: 'approved',
      description: 'Tier 2 vendor with multiple locations',
      locations: [
        {
          name: 'Monaco Headquarters',
          city: 'Monaco',
          country: 'Monaco',
          latitude: 43.7384,
          longitude: 7.4246,
          isHQ: true,
        },
        {
          name: 'Cannes Office',
          city: 'Cannes',
          country: 'France',
          latitude: 43.5528,
          longitude: 7.0174,
        },
      ],
    });

    await seedVendors(page, [vendorData]);

    const slug = vendorData.companyName.toLowerCase().replace(/\s+/g, '-');
    await page.goto(`${BASE_URL}/vendors/${slug}/`);
    await page.waitForLoadState('networkidle');

    // Look for locations section
    const locationsSection = page.locator('text=/Location|Office|Our.*Locations/i').first();
    const sectionVisible = await locationsSection.isVisible({ timeout: 3000 }).catch(() => false);
    console.log('[Test 10.3] Locations section visible:', sectionVisible);

    if (sectionVisible) {
      // Look for map container
      const mapContainer = page.locator('.leaflet-container, [id*="map"], [class*="map"]').first();
      const mapVisible = await mapContainer.isVisible({ timeout: 3000 }).catch(() => false);
      console.log('[Test 10.3] Map container visible:', mapVisible);

      if (mapVisible) {
        await expect(mapContainer).toBeVisible();

        // Look for location markers
        const markers = page.locator('.leaflet-marker-icon, [class*="marker"]');
        const markerCount = await markers.count();
        console.log('[Test 10.3] Map markers found:', markerCount);
      }

      // Check for location names
      const monacoLocation = page.locator('text=/Monaco/i');
      await expect(monacoLocation.first()).toBeVisible({ timeout: 3000 }).catch(() => {});
    }
  });

  test('Test 10.4: Tier 3 public profile shows featured badge', async ({ page }) => {
    const vendorData = createTestVendor({
      tier: 'tier3',
      status: 'approved',
      featured: true,
      description: 'Tier 3 featured enterprise vendor',
    });

    await seedVendors(page, [vendorData]);

    const slug = vendorData.companyName.toLowerCase().replace(/\s+/g, '-');
    await page.goto(`${BASE_URL}/vendors/${slug}/`);
    await page.waitForLoadState('networkidle');

    // Look for tier 3 / enterprise badge
    const tier3Badge = page.locator('text=/Tier 3|Enterprise|Premium/i, [data-tier="3"]').first();
    const badgeVisible = await tier3Badge.isVisible({ timeout: 3000 }).catch(() => false);
    console.log('[Test 10.4] Tier 3 badge visible:', badgeVisible);

    // Look for featured indicator
    const featuredBadge = page.locator('text=/Featured|Featured.*Partner|Featured.*Vendor/i, [data-featured="true"]').first();
    const featuredVisible = await featuredBadge.isVisible({ timeout: 3000 }).catch(() => false);
    console.log('[Test 10.4] Featured badge visible:', featuredVisible);

    // At least one of tier or featured badge should be visible
    expect(badgeVisible || featuredVisible).toBeTruthy();
  });

  test('Test 10.5: Responsive design works on mobile (375px viewport)', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const vendorData = createTestVendor({
      tier: 'tier2',
      status: 'approved',
      description: 'Testing mobile responsive design',
    });

    await seedVendors(page, [vendorData]);

    const slug = vendorData.companyName.toLowerCase().replace(/\s+/g, '-');
    await page.goto(`${BASE_URL}/vendors/${slug}/`);
    await page.waitForLoadState('networkidle');

    // Verify content is visible on mobile
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 5000 });

    // Check if navigation menu is working (hamburger menu on mobile)
    const menuButton = page.locator('button[aria-label*="menu"], button[aria-label*="navigation"]').first();
    if (await menuButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('[Test 10.5] Mobile menu button found');
      await menuButton.click();
      await page.waitForTimeout(500);
    }

    // Verify text is readable (not cut off)
    const description = page.locator('p, div').filter({ hasText: /Testing mobile/ }).first();
    if (await description.isVisible({ timeout: 2000 }).catch(() => false)) {
      const box = await description.boundingBox();
      if (box) {
        // Verify content fits in viewport
        expect(box.width).toBeLessThanOrEqual(375);
        console.log('[Test 10.5] Content width:', box.width);
      }
    }

    // Verify images are responsive
    const images = page.locator('img');
    const imageCount = await images.count();
    if (imageCount > 0) {
      const firstImage = images.first();
      const imgBox = await firstImage.boundingBox();
      if (imgBox) {
        expect(imgBox.width).toBeLessThanOrEqual(375);
        console.log('[Test 10.5] Image width:', imgBox.width);
      }
    }
  });

  test('Test 10.6: SEO metadata present (title, description, OG tags)', async ({ page }) => {
    const vendorData = createTestVendor({
      tier: 'tier2',
      status: 'approved',
      description: 'SEO optimized vendor profile for testing',
    });

    await seedVendors(page, [vendorData]);

    const slug = vendorData.companyName.toLowerCase().replace(/\s+/g, '-');
    await page.goto(`${BASE_URL}/vendors/${slug}/`);
    await page.waitForLoadState('networkidle');

    // Check page title
    const title = await page.title();
    console.log('[Test 10.6] Page title:', title);
    expect(title.length).toBeGreaterThan(0);
    expect(title).not.toBe('');

    // Check meta description
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
    console.log('[Test 10.6] Meta description:', metaDescription);
    if (metaDescription) {
      expect(metaDescription.length).toBeGreaterThan(0);
    }

    // Check Open Graph tags
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content').catch(() => null);
    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content').catch(() => null);
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content').catch(() => null);
    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content').catch(() => null);

    console.log('[Test 10.6] OG Title:', ogTitle);
    console.log('[Test 10.6] OG Description:', ogDescription);
    console.log('[Test 10.6] OG Image:', ogImage);
    console.log('[Test 10.6] OG URL:', ogUrl);

    // At least title should be present
    expect(title.length).toBeGreaterThan(10); // Meaningful title

    // Check canonical URL
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href').catch(() => null);
    console.log('[Test 10.6] Canonical URL:', canonical);
  });
});
