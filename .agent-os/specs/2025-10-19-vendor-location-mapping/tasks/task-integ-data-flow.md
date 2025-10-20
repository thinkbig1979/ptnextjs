# Task: Validate End-to-End Data Flow

**Task ID**: integ-data-flow
**Phase**: Phase 4 - Integration & Testing
**Agent**: qa-specialist
**Estimated Time**: 2 hours
**Dependencies**: impl-frontend-vendor-list

## Objective

Validate that location data flows correctly from TinaCMS markdown files through the data service layer to React components, ensuring the entire system works cohesively.

## Context Requirements

**Files to Review**:
- `/home/edwin/development/ptnextjs/content/vendors/` (markdown files with location data)
- `/home/edwin/development/ptnextjs/tina/__generated__/types.ts` (generated TinaCMS types)
- `/home/edwin/development/ptnextjs/lib/tinacms-data-service.ts` (data transformation)
- `/home/edwin/development/ptnextjs/lib/types.ts` (application types)
- All implemented frontend components

## Data Flow Architecture

```
TinaCMS Markdown (.md)
        ↓
TinaCMS Schema (tina/config.ts)
        ↓
Generated Types (tina/__generated__/types.ts)
        ↓
TinaCMSDataService.transformTinaVendor()
        ↓
Vendor Interface (lib/types.ts)
        ↓
React Server Components (pages)
        ↓
React Client Components (VendorMap, LocationSearchFilter)
        ↓
Browser (Leaflet.js Map Display via OpenFreeMap, Distance Calculation)
```

## Validation Steps

### Step 1: TinaCMS Content Validation

Create/verify test vendor with complete location data:

**File**: `/home/edwin/development/ptnextjs/content/vendors/test-full-location.md`

```markdown
---
name: Integration Test Vendor
featured: false
partner: true
location: Monaco
coordinates:
  latitude: 43.7384
  longitude: 7.4246
address:
  street: 10 Port de Fontvieille
  city: Monaco
  state: Monaco
  postalCode: "98000"
  country: MC
description: Test vendor for end-to-end data flow validation
---

This vendor has complete location data for integration testing.
```

Verify file exists and has correct YAML frontmatter:
```bash
cat /home/edwin/development/ptnextjs/content/vendors/test-full-location.md
```

### Step 2: TinaCMS Schema Validation

```bash
cd /home/edwin/development/ptnextjs
npm run tina:build
```

**Expected Output**:
```
✓ Schema compiled successfully
✓ Types generated in tina/__generated__/types.ts
✓ No validation errors
```

Verify generated types include location fields:
```bash
grep -A 10 "export type VendorsCoordinates" tina/__generated__/types.ts
grep -A 10 "export type VendorsAddress" tina/__generated__/types.ts
```

### Step 3: Data Service Transformation Validation

Add temporary logging to verify transformation:

```typescript
// In lib/tinacms-data-service.ts, temporarily add:
private transformTinaVendor(tinaVendor: any): Vendor {
  const vendor = {
    // ... existing transformation ...
  };

  // TEMPORARY: Log location data transformation
  if (vendor.name === 'Integration Test Vendor') {
    console.log('=== Data Service Transformation ===');
    console.log('Input (TinaCMS):', {
      location: tinaVendor.location,
      coordinates: tinaVendor.coordinates,
      address: tinaVendor.address,
    });
    console.log('Output (Vendor):', {
      location: vendor.location,
      coordinates: vendor.coordinates,
      address: vendor.address,
    });
    console.log('====================================');
  }

  return vendor;
}
```

Build and check console output:
```bash
npm run build 2>&1 | grep -A 20 "Data Service Transformation"
```

**Expected Output**:
```
=== Data Service Transformation ===
Input (TinaCMS): {
  location: 'Monaco',
  coordinates: { latitude: 43.7384, longitude: 7.4246 },
  address: {
    street: '10 Port de Fontvieille',
    city: 'Monaco',
    state: 'Monaco',
    postalCode: '98000',
    country: 'MC'
  }
}
Output (Vendor): {
  location: 'Monaco',
  coordinates: { latitude: 43.7384, longitude: 7.4246 },
  address: {
    street: '10 Port de Fontvieille',
    city: 'Monaco',
    state: 'Monaco',
    postalCode: '98000',
    country: 'MC'
  }
}
====================================
```

### Step 4: Static Page Generation Validation

```bash
npm run build
```

Verify vendor pages generated:
```bash
ls -la .next/server/app/\(site\)/vendors/test-full-location/
```

**Expected**: HTML file exists for test vendor

Check page includes location data:
```bash
# Extract rendered HTML (simplified check)
grep -i "monaco" .next/server/app/\(site\)/vendors/test-full-location/*.html
grep -i "43.7384" .next/server/app/\(site\)/vendors/test-full-location/*.html
```

### Step 5: Component Rendering Validation (Playwright)

```typescript
// tests/e2e/data-flow-validation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('End-to-End Data Flow Validation', () => {
  test('vendor data flows from TinaCMS to UI correctly', async ({ page }) => {
    await page.goto('/vendors/test-full-location');

    // 1. Verify page rendered
    await expect(page.locator('h1')).toContainText('Integration Test Vendor');

    // 2. Verify location string displayed
    await expect(page.locator('[data-testid="vendor-location"]')).toContainText('Monaco');

    // 3. Verify coordinates displayed
    await expect(page.locator('[data-testid="vendor-coordinates"]')).toContainText('43.7384');
    await expect(page.locator('[data-testid="vendor-coordinates"]')).toContainText('7.4246');

    // 4. Verify address displayed
    const addressCard = page.locator('[data-testid="vendor-address"]');
    await expect(addressCard).toContainText('10 Port de Fontvieille');
    await expect(addressCard).toContainText('Monaco');
    await expect(addressCard).toContainText('98000');

    // 5. Verify map rendered
    await expect(page.locator('[data-testid="vendor-map"]')).toBeVisible();
    await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 5000 });

    // 6. Verify map marker present
    await expect(page.locator('.leaflet-marker-icon')).toBeVisible();

    // 7. Verify Get Directions link
    const directionsLink = page.locator('[data-testid="get-directions"]');
    await expect(directionsLink).toBeVisible();
    const href = await directionsLink.getAttribute('href');
    expect(href).toContain('43.7384');
    expect(href).toContain('7.4246');
  });

  test('location search uses correct coordinate data', async ({ page }) => {
    await page.goto('/vendors');

    // Search near Monaco
    await page.fill('[data-testid="location-input"]', '43.7384, 7.4246');
    await page.locator('[data-testid="distance-slider"]').fill('50');
    await page.click('[data-testid="search-button"]');

    await page.waitForTimeout(500);

    // Integration Test Vendor should appear (distance ~0km)
    const vendorCards = page.locator('[data-testid="vendor-card"]');
    const count = await vendorCards.count();
    expect(count).toBeGreaterThan(0);

    // First result should be Integration Test Vendor (closest)
    const firstCard = vendorCards.first();
    await expect(firstCard).toContainText('Integration Test Vendor');

    // Distance badge should show ~0 km
    const distanceBadge = firstCard.locator('[data-testid="vendor-distance"]');
    const distanceText = await distanceBadge.textContent();
    const distance = parseFloat(distanceText?.match(/[\d.]+/)?.[0] || '999');
    expect(distance).toBeLessThan(1); // Should be very close (~0 km)
  });

  test('data transformation handles missing coordinates gracefully', async ({ page }) => {
    await page.goto('/vendors/test-legacy-vendor');

    // Legacy vendor page should render
    await expect(page.locator('h1')).toContainText('Test Vendor - Legacy');

    // Location string should display
    await expect(page.locator('[data-testid="vendor-location"]')).toContainText('Miami');

    // Map should not render (no coordinates)
    await expect(page.locator('[data-testid="vendor-map"]')).not.toBeVisible();

    // Fallback message should show
    await expect(page.locator('text=Map not available')).toBeVisible();

    // Get Directions should not be available
    await expect(page.locator('[data-testid="get-directions"]')).not.toBeVisible();
  });

  test('invalid coordinates are filtered out by data service', async ({ page }) => {
    // This requires a test vendor with invalid coordinates
    // Verify it doesn't crash the page

    await page.goto('/vendors');

    // Page should load without errors
    await expect(page.locator('h1')).toBeVisible();

    // Check console for validation warnings (not errors)
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'warn' || msg.type() === 'error') {
        consoleLogs.push(msg.text());
      }
    });

    // Trigger data loading
    await page.reload();

    // Should have warnings for invalid coordinates, not errors
    const hasWarnings = consoleLogs.some(log => log.includes('Invalid'));
    const hasErrors = consoleLogs.some(log => log.includes('Error'));

    // Warnings are OK, errors are not
    expect(hasErrors).toBe(false);
  });
});
```

Run test:
```bash
npx playwright test data-flow-validation.spec.ts
```

### Step 6: Type Safety Validation

```bash
# Ensure all types align correctly
npm run type-check
```

**Expected**: No type errors

Verify type inference works:
```typescript
// Create temporary test file: scripts/test-types.ts
import { Vendor, VendorCoordinates, VendorAddress } from '@/lib/types';

const testVendor: Vendor = {
  id: 'test',
  name: 'Test',
  slug: 'test',
  location: 'Monaco',
  coordinates: { latitude: 43.7384, longitude: 7.4246 },
  address: { city: 'Monaco', country: 'MC' },
};

// TypeScript should infer types correctly
const coords: VendorCoordinates | undefined = testVendor.coordinates;
const addr: VendorAddress | undefined = testVendor.address;

// This should compile without errors
console.log('Type safety validated');
```

Run:
```bash
npx ts-node scripts/test-types.ts
```

### Step 7: Performance Validation

Measure data transformation performance:

```bash
# Start dev server
npm run dev

# In another terminal, measure page load time
curl -o /dev/null -s -w "Time: %{time_total}s\n" http://localhost:3000/vendors/test-full-location
```

**Expected**: Page load < 2 seconds

Check build performance:
```bash
time npm run build
```

**Expected**: Build completes in reasonable time (< 5 minutes for full site)

## Acceptance Criteria

### Data Integrity
- [ ] Test vendor markdown file has complete location data
- [ ] TinaCMS schema validation passes
- [ ] Generated types include coordinate and address types
- [ ] Data service transforms location data correctly
- [ ] Transformed data matches expected output format
- [ ] No data loss during transformation

### Type Safety
- [ ] TypeScript compilation passes
- [ ] No type errors in data service
- [ ] No type errors in components
- [ ] Type inference works correctly
- [ ] Optional fields handled properly

### Page Generation
- [ ] Static pages generated for all vendors
- [ ] Test vendor page includes location data in HTML
- [ ] Pages build without errors
- [ ] No runtime errors during generation

### Component Rendering
- [ ] VendorMap displays with correct coordinates
- [ ] VendorLocationCard shows all location fields
- [ ] Location search filters vendors correctly
- [ ] Distance calculations are accurate
- [ ] Legacy vendors (no coordinates) render correctly

### Integration Testing
- [ ] All Playwright E2E tests pass
- [ ] No console errors in browser
- [ ] Console warnings are appropriate (not errors)
- [ ] Map initializes successfully
- [ ] Marker shows vendor name on click

### Performance
- [ ] Page load time < 2 seconds
- [ ] Build time acceptable (< 5 minutes)
- [ ] Distance calculation efficient (< 100ms for 1000 vendors)
- [ ] No memory leaks in components

## Validation Checklist

Complete this checklist in order:

1. **TinaCMS Layer**
   - [ ] Test vendor file created with location data
   - [ ] `npm run tina:build` succeeds
   - [ ] Generated types include location fields

2. **Data Service Layer**
   - [ ] transformTinaVendor includes coordinate/address logic
   - [ ] Coordinate validation works
   - [ ] Transformation logging shows correct data flow
   - [ ] Invalid coordinates filtered out

3. **Type System Layer**
   - [ ] VendorCoordinates interface exists
   - [ ] VendorAddress interface exists
   - [ ] Vendor interface includes optional coordinates/address
   - [ ] `npm run type-check` passes

4. **Static Generation Layer**
   - [ ] `npm run build` succeeds
   - [ ] Test vendor page generated
   - [ ] HTML includes location data
   - [ ] No build errors or warnings

5. **Component Layer**
   - [ ] VendorMap component renders
   - [ ] VendorLocationCard displays data
   - [ ] LocationSearchFilter filters correctly
   - [ ] Distance calculation accurate

6. **Browser Layer**
   - [ ] Playwright tests pass
   - [ ] Map displays in browser
   - [ ] Location search works end-to-end
   - [ ] No console errors

7. **Performance Layer**
   - [ ] Page load time acceptable
   - [ ] Build time acceptable
   - [ ] Distance calc performance good

## Common Issues and Resolutions

### Issue: Coordinates not displaying
- **Check**: TinaCMS schema includes coordinates field
- **Check**: transformTinaVendor includes coordinate transformation
- **Check**: Vendor interface has coordinates?: VendorCoordinates

### Issue: Map not rendering
- **Check**: Leaflet.js and React-Leaflet installed correctly
- **Check**: OpenFreeMap tile layer configured properly
- **Check**: Coordinates are valid (-90 to 90, -180 to 180)
- **Check**: Leaflet CSS included in application

### Issue: Distance calculation incorrect
- **Check**: Haversine formula implementation
- **Check**: Coordinate order (latitude first, then longitude)
- **Check**: Distance unit (km vs miles)

### Issue: Build fails
- **Check**: TypeScript errors (`npm run type-check`)
- **Check**: TinaCMS schema errors (`npm run tina:build`)
- **Check**: Required fields in vendor schema

## Documentation

After validation, document findings in:

**File**: `/home/edwin/development/ptnextjs/.agent-os/specs/2025-10-19-vendor-location-mapping/data-flow-validation-results.md`

Include:
- Validation date
- Test results (pass/fail for each step)
- Performance metrics
- Screenshot examples
- Any issues discovered and resolutions
- Recommendations for optimization

## Notes

- Remove temporary logging after validation
- Keep test vendor files for future regression testing
- Document any deviations from expected behavior
- Update integration strategy if issues found
- Consider this validation as gate for production deployment
