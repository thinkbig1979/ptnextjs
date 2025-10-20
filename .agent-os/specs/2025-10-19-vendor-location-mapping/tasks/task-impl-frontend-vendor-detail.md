# Task: Integrate Map into Vendor Detail Pages

**Task ID**: impl-frontend-vendor-detail
**Phase**: Phase 3 - Frontend Implementation (Map Components & UI)
**Agent**: frontend-react-specialist
**Estimated Time**: 2 hours
**Dependencies**: impl-frontend-hook

## Objective

Integrate VendorMap and VendorLocationCard components into vendor detail pages to display location information with interactive maps.

## Context Requirements

**Files to Review**:
- `/home/edwin/development/ptnextjs/app/(site)/vendors/[slug]/page.tsx` (lines 216-217: current location display)
- `/home/edwin/development/ptnextjs/app/(site)/partners/[slug]/page.tsx` (similar structure)
- `/home/edwin/development/ptnextjs/components/VendorMap.tsx` (created in previous task)
- `/home/edwin/development/ptnextjs/components/VendorLocationCard.tsx` (created in previous task)

## Implementation Details

### File 1: Vendor Detail Page

**File**: `/home/edwin/development/ptnextjs/app/(site)/vendors/[slug]/page.tsx`

**Current Implementation** (lines 216-217):
```typescript
{vendor.location && (
  <p className="text-gray-600">{vendor.location}</p>
)}
```

**Updated Implementation**:

Replace the location display section (around lines 216-217) with:

```typescript
import { VendorMap } from '@/components/VendorMap';
import { VendorLocationCard } from '@/components/VendorLocationCard';

// ... existing imports and code ...

export default async function VendorDetailPage({ params }: Props) {
  // ... existing code ...

  return (
    <div>
      {/* ... existing header/content ... */}

      {/* Location Section */}
      {(vendor.location || vendor.coordinates) && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Location</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Map Display (left column) */}
            {vendor.coordinates ? (
              <div className="md:col-span-1">
                <VendorMap
                  name={vendor.name}
                  coordinates={vendor.coordinates}
                  height="400px"
                  zoom={13}
                  className="w-full"
                />
              </div>
            ) : (
              <div className="md:col-span-1 flex items-center justify-center bg-gray-100 rounded-lg h-[400px]">
                <div className="text-center p-6">
                  <p className="text-gray-600 mb-2">Map not available</p>
                  <p className="text-sm text-gray-500">
                    Location: {vendor.location}
                  </p>
                </div>
              </div>
            )}

            {/* Location Card (right column) */}
            <div className="md:col-span-1">
              <VendorLocationCard
                name={vendor.name}
                location={vendor.location}
                coordinates={vendor.coordinates}
                address={vendor.address}
                className="h-full"
              />
            </div>
          </div>
        </section>
      )}

      {/* ... rest of existing content ... */}
    </div>
  );
}
```

### File 2: Partner Detail Page

**File**: `/home/edwin/development/ptnextjs/app/(site)/partners/[slug]/page.tsx`

Apply the same pattern as vendor detail page. Partner pages share similar structure.

**Steps**:
1. Import VendorMap and VendorLocationCard
2. Find current location display section
3. Replace with map + location card grid layout
4. Handle missing coordinates with fallback UI

### File 3: Responsive Design Considerations

Ensure mobile-friendly layout:

```typescript
{/* Mobile: Stack vertically, Desktop: Side by side */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Map */}
  <div>
    <VendorMap
      name={vendor.name}
      coordinates={vendor.coordinates}
      height="350px" // Slightly shorter on mobile
      className="w-full"
    />
  </div>

  {/* Location Card */}
  <div>
    <VendorLocationCard
      name={vendor.name}
      location={vendor.location}
      coordinates={vendor.coordinates}
      address={vendor.address}
    />
  </div>
</div>
```

## Testing Steps

### 1. Build and Render Test

```bash
cd /home/edwin/development/ptnextjs
npm run build
npm run start

# Test with vendor that has coordinates
# Navigate to: http://localhost:3000/vendors/test-full-location
```

Verify:
- [ ] Map displays correctly
- [ ] Location card shows all information
- [ ] Layout is responsive (test on mobile viewport)
- [ ] No console errors

### 2. Playwright E2E Tests

Create: `/home/edwin/development/ptnextjs/tests/e2e/vendor-detail-map.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Vendor Detail Page - Location Section', () => {
  test('displays map and location card for vendor with coordinates', async ({ page }) => {
    await page.goto('/vendors/test-full-location');

    // Verify location section heading
    await expect(page.locator('h2', { hasText: 'Location' })).toBeVisible();

    // Verify map is visible
    await expect(page.locator('[data-testid="vendor-map"]')).toBeVisible();

    // Verify Leaflet map container loaded
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 5000 });

    // Verify location card is visible
    await expect(page.locator('[data-testid="vendor-location-card"]')).toBeVisible();

    // Verify location details
    await expect(page.locator('[data-testid="vendor-location"]')).toContainText('Monaco');

    // Verify coordinates displayed
    await expect(page.locator('[data-testid="vendor-coordinates"]')).toContainText('43.7384');

    // Verify Get Directions button
    await expect(page.locator('[data-testid="get-directions"]')).toBeVisible();

    // Take screenshot
    await page.screenshot({ path: 'test-results/vendor-detail-location.png' });
  });

  test('shows fallback UI for vendor without coordinates', async ({ page }) => {
    await page.goto('/vendors/test-legacy-vendor');

    // Map should not be visible
    await expect(page.locator('[data-testid="vendor-map"]')).not.toBeVisible();

    // Fallback message should show
    await expect(page.locator('text=Map not available')).toBeVisible();

    // Location string should still display
    await expect(page.locator('[data-testid="vendor-location"]')).toContainText('Miami');

    // Get Directions button should not be visible
    await expect(page.locator('[data-testid="get-directions"]')).not.toBeVisible();
  });

  test('map is responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/vendors/test-full-location');

    // Map should still be visible
    await expect(page.locator('[data-testid="vendor-map"]')).toBeVisible();

    // Location card should be below map (vertical stack)
    const mapBox = await page.locator('[data-testid="vendor-map"]').boundingBox();
    const cardBox = await page.locator('[data-testid="vendor-location-card"]').boundingBox();

    if (mapBox && cardBox) {
      // Card should be below map on mobile
      expect(cardBox.y).toBeGreaterThan(mapBox.y + mapBox.height);
    }

    // Take mobile screenshot
    await page.screenshot({ path: 'test-results/vendor-detail-mobile.png' });
  });

  test('Get Directions link works correctly', async ({ page, context }) => {
    await page.goto('/vendors/test-full-location');

    // Get the directions link
    const directionsLink = page.locator('[data-testid="get-directions"]');

    // Verify link attributes
    const href = await directionsLink.getAttribute('href');
    expect(href).toContain('google.com/maps');
    expect(href).toContain('43.7384,7.4246');

    // Verify opens in new tab
    expect(await directionsLink.getAttribute('target')).toBe('_blank');
    expect(await directionsLink.getAttribute('rel')).toContain('noopener');
  });

  test('map marker shows vendor name on click', async ({ page }) => {
    await page.goto('/vendors/test-full-location');

    // Wait for map to load
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 5000 });

    // Click marker
    await page.locator('.leaflet-marker-icon').click();

    // Popup should appear with vendor name
    await expect(page.locator('.leaflet-popup')).toBeVisible();
    await expect(page.locator('.leaflet-popup-content')).toContainText('Test Vendor - Full Location');
  });
});

test.describe('Partner Detail Page - Location Section', () => {
  test('displays location for partner vendors', async ({ page }) => {
    // Test partner page has same location functionality
    await page.goto('/partners/test-full-location');

    await expect(page.locator('[data-testid="vendor-map"]')).toBeVisible();
    await expect(page.locator('[data-testid="vendor-location-card"]')).toBeVisible();
  });
});
```

Run tests:
```bash
npx playwright test vendor-detail-map.spec.ts
```

### 3. Visual Regression Testing

```bash
# Take baseline screenshots
npx playwright test vendor-detail-map.spec.ts --update-snapshots

# Future runs will compare against baselines
npx playwright test vendor-detail-map.spec.ts
```

### 4. Accessibility Testing

```typescript
// Add to vendor-detail-map.spec.ts
import { injectAxe, checkA11y } from 'axe-playwright';

test('location section is accessible', async ({ page }) => {
  await page.goto('/vendors/test-full-location');

  // Inject axe-core
  await injectAxe(page);

  // Check accessibility
  await checkA11y(page, '[data-testid="vendor-map"]', {
    detailedReport: true,
    detailedReportOptions: { html: true },
  });

  await checkA11y(page, '[data-testid="vendor-location-card"]', {
    detailedReport: true,
  });
});
```

## Acceptance Criteria

- [ ] VendorMap component integrated into vendor detail page
- [ ] VendorLocationCard component integrated into vendor detail page
- [ ] Same integration applied to partner detail page
- [ ] Location section has proper heading ("Location")
- [ ] Map and card display side-by-side on desktop
- [ ] Map and card stack vertically on mobile
- [ ] Fallback UI shown for vendors without coordinates
- [ ] "Get Directions" button links to Google Maps
- [ ] Map marker shows vendor name on click
- [ ] Responsive design works on all viewport sizes
- [ ] No TypeScript compilation errors
- [ ] No console errors or warnings
- [ ] Playwright tests pass
- [ ] Accessibility tests pass
- [ ] Visual regression tests pass

## Edge Cases to Handle

- [ ] Vendor with only location string (no coordinates)
- [ ] Vendor with coordinates but no address
- [ ] Vendor with full location data
- [ ] Vendor with no location data at all (hide section)
- [ ] Slow network (map loading state)
- [ ] Map initialization failure (graceful fallback)

## Layout Variations

### Desktop Layout (≥768px)
```
┌──────────────────────────────────────────────┐
│ Location                                      │
├─────────────────────┬────────────────────────┤
│                     │                        │
│    Map Component    │   Location Card        │
│    (400px height)   │   - Location string    │
│                     │   - Address            │
│                     │   - Coordinates        │
│                     │   - Get Directions     │
└─────────────────────┴────────────────────────┘
```

### Mobile Layout (<768px)
```
┌──────────────────────┐
│ Location             │
├──────────────────────┤
│                      │
│   Map Component      │
│   (350px height)     │
│                      │
├──────────────────────┤
│                      │
│   Location Card      │
│   - Location         │
│   - Address          │
│   - Coordinates      │
│   - Get Directions   │
│                      │
└──────────────────────┘
```

## Performance Considerations

- [ ] Map initializes only once per page load
- [ ] Map cleanup on component unmount (handled by VendorMap)
- [ ] Images optimized with Next.js Image component
- [ ] No layout shift (fixed heights for map container)
- [ ] Lazy load map tiles (handled by Leaflet)

## SEO Considerations

- [ ] Location section has semantic HTML (heading, section)
- [ ] Address uses proper <address> tag
- [ ] Structured data for location (future enhancement)
- [ ] Alt text for map container
- [ ] Descriptive link text for "Get Directions"

## Notes

- VendorMap component handles all map initialization and cleanup
- VendorLocationCard handles all location data display
- Parent page just provides layout and data props
- Same components work for both /vendors and /partners pages
- Ensure test vendors (created in backend tasks) have proper data
- Consider adding loading skeleton while map initializes
