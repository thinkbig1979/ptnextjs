import { test, expect } from '@playwright/test';

/**
 * Test to verify that vendor categories are displayed correctly
 * on the vendor detail page
 */
test.describe('Vendor Category Display', () => {
  test('should display category in Quick Info section', async ({ page }) => {
    // Navigate to a vendor detail page
    await page.goto('/vendors/nautictech-solutions');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Find the Quick Info section
    const quickInfoSection = page.locator('h4:has-text("Quick Info")').locator('..');

    // Verify the Category label and value are present
    await expect(quickInfoSection).toBeVisible();

    // Look for the category row
    const categoryRow = quickInfoSection.locator('div:has-text("Category:")');
    await expect(categoryRow).toBeVisible();

    // Verify the category value is NOT empty
    const categoryValue = await categoryRow.locator('span').nth(1).textContent();
    expect(categoryValue).toBeTruthy();
    expect(categoryValue?.trim()).not.toBe('');

    console.log(`[OK] Category displayed: ${categoryValue}`);
  });

  test('should display different categories for different vendors', async ({ page }) => {
    const vendors = [
      { slug: 'nautictech-solutions', expectedCategory: 'Navigation & Communication' },
      { slug: 'marineaudio-pro', expectedCategory: 'Audio & Entertainment' },
      { slug: 'yacht-lighting-systems', expectedCategory: 'Lighting Systems' },
    ];

    for (const vendor of vendors) {
      await page.goto(`/vendors/${vendor.slug}`);
      await page.waitForLoadState('networkidle');

      // Find the Quick Info section
      const quickInfoSection = page.locator('h4:has-text("Quick Info")').locator('..');

      // Look for the category row
      const categoryRow = quickInfoSection.locator('div:has-text("Category:")');
      const categoryValue = await categoryRow.locator('span').nth(1).textContent();

      // Verify the category matches expected
      expect(categoryValue?.trim()).toBe(vendor.expectedCategory);
      console.log(`[OK] ${vendor.slug}: ${categoryValue}`);
    }
  });

  test('should display tags in Specializations section', async ({ page }) => {
    await page.goto('/vendors/nautictech-solutions');
    await page.waitForLoadState('networkidle');

    // Find the Specializations section
    const specializationsSection = page.locator('h4:has-text("Specializations")').locator('..');

    // Verify the section is visible
    await expect(specializationsSection).toBeVisible();

    // Verify there are tag badges
    const tagBadges = specializationsSection.locator('[class*="badge"]');
    const count = await tagBadges.count();

    expect(count).toBeGreaterThan(0);
    console.log(`[OK] Found ${count} specialization tags`);

    // Log the tag names
    for (let i = 0; i < count; i++) {
      const tagText = await tagBadges.nth(i).textContent();
      console.log(`   - ${tagText}`);
    }
  });
});
