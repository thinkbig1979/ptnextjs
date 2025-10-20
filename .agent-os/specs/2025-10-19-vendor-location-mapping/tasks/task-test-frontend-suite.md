# Task: Design Frontend Component Test Suite

**Task ID**: test-frontend
**Phase**: Phase 3 - Frontend Implementation (Map Components & UI)
**Agent**: test-architect
**Estimated Time**: 2 hours
**Dependencies**: test-backend-integration

## Objective

Design comprehensive test suite for frontend map components and location-based search functionality using Playwright for E2E testing.

## Context Requirements

**Files to Review**:
- `/home/edwin/development/ptnextjs/app/(site)/vendors/[slug]/page.tsx` (vendor detail page)
- `/home/edwin/development/ptnextjs/app/(site)/vendors/page.tsx` (vendor list page)
- `/home/edwin/development/ptnextjs/.agent-os/specs/2025-10-19-vendor-location-mapping/sub-specs/technical-spec.md`
- `/home/edwin/development/ptnextjs/CLAUDE.md` (note: always verify with Playwright)

## Deliverables

Create test specification: `/home/edwin/development/ptnextjs/.agent-os/specs/2025-10-19-vendor-location-mapping/tasks/frontend-test-suite.md`

### Test Categories

#### 1. VendorMap Component Tests (Unit/Integration)

```typescript
describe('VendorMap Component', () => {
  // Rendering tests
  test('renders map container with valid coordinates')
  test('displays fallback message when coordinates missing')
  test('applies correct CSS classes and styles')
  test('renders with correct aspect ratio')

  // Leaflet integration tests
  test('initializes Leaflet map container')
  test('centers map on vendor coordinates')
  test('sets appropriate zoom level (12-14)')
  test('adds marker at vendor location')
  test('applies custom marker styling')

  // Interaction tests
  test('marker click shows vendor name popup')
  test('map controls (zoom, navigation) are functional')
  test('map is draggable')

  // Error handling tests
  test('handles invalid coordinates (out of range)')
  test('handles Leaflet initialization failures')
  test('logs errors to console')

  // Accessibility tests
  test('includes alt text for map container')
  test('keyboard navigation works for controls')
  test('screen reader announcements for location')
})
```

#### 2. VendorLocationCard Component Tests

```typescript
describe('VendorLocationCard Component', () => {
  // Display tests
  test('displays location string when available')
  test('displays formatted address when available')
  test('displays coordinates in readable format')
  test('shows distance when calculated')

  // Conditional rendering tests
  test('hides address section when no address data')
  test('shows "Get Directions" link with coordinates')
  test('displays location string only when no coordinates')

  // Formatting tests
  test('formats coordinates to 4 decimal places')
  test('formats address with proper line breaks')
  test('displays country name from country code')

  // Link tests
  test('Google Maps link includes correct coordinates')
  test('Google Maps link opens in new tab')
  test('link includes vendor name in query')
})
```

#### 3. LocationSearchFilter Component Tests

```typescript
describe('LocationSearchFilter Component', () => {
  // Input tests
  test('accepts user location input')
  test('validates location format')
  test('shows placeholder text')
  test('clears input on reset')

  // Distance filter tests
  test('displays distance slider (10-500km)')
  test('updates distance value on slider change')
  test('shows current distance value')

  // Search execution tests
  test('triggers search on button click')
  test('triggers search on Enter key')
  test('disables search with empty input')

  // Results display tests
  test('shows vendor count after search')
  test('displays "no results" message when appropriate')
  test('updates vendor list with filtered results')

  // Reset functionality tests
  test('reset button clears filters')
  test('reset button shows all vendors')
  test('reset button clears distance value')
})
```

#### 4. useLocationFilter Hook Tests

```typescript
describe('useLocationFilter Hook', () => {
  // State management tests
  test('initializes with null user location')
  test('updates user location on setUserLocation')
  test('updates distance on setDistance')

  // Filtering logic tests
  test('filters vendors by distance correctly')
  test('handles vendors without coordinates')
  test('returns all vendors when no user location set')
  test('returns empty array when no vendors in range')

  // Distance calculation tests
  test('calculates Haversine distance correctly')
  test('handles edge cases (equator, poles)')
  test('converts km to miles correctly (if needed)')

  // Performance tests
  test('filters large vendor list efficiently')
  test('memoizes results when inputs unchanged')
})
```

#### 5. Haversine Distance Utility Tests

```typescript
describe('calculateDistance Utility', () => {
  // Accuracy tests
  test('calculates distance between known coordinates')
  test('returns 0 for identical coordinates')
  test('handles antipodal points correctly')

  // Input validation tests
  test('throws error for invalid latitude')
  test('throws error for invalid longitude')
  test('handles edge coordinates (90, -90, 180, -180)')

  // Unit tests
  test('returns distance in kilometers by default')
  test('converts to miles when specified')
  test('rounds to 2 decimal places')
})

// Known test cases
const testCases = [
  {
    from: { lat: 43.7384, lng: 7.4246 }, // Monaco
    to: { lat: 48.8566, lng: 2.3522 },   // Paris
    expectedKm: 688
  },
  {
    from: { lat: 26.1224, lng: -80.1373 }, // Fort Lauderdale
    to: { lat: 25.7617, lng: -80.1918 },   // Miami
    expectedKm: 43
  }
];
```

### Playwright E2E Tests

#### E2E Test 1: Vendor Map Display

```typescript
// tests/e2e/vendor-map.spec.ts
test('displays map on vendor detail page with coordinates', async ({ page }) => {
  await page.goto('/vendors/test-full-location');

  // Verify map container exists
  await expect(page.locator('[data-testid="vendor-map"]')).toBeVisible();

  // Verify Leaflet container loaded
  await expect(page.locator('.leaflet-container')).toBeVisible();

  // Verify marker present
  await expect(page.locator('.leaflet-marker-icon')).toBeVisible();

  // Click marker to show popup
  await page.locator('.leaflet-marker-icon').click();
  await expect(page.locator('.leaflet-popup')).toContainText('Test Vendor - Full Location');

  // Take screenshot for visual verification
  await page.screenshot({ path: 'test-results/vendor-map.png' });
});

test('shows fallback message for vendor without coordinates', async ({ page }) => {
  await page.goto('/vendors/test-legacy-vendor');

  // Map should not be visible
  await expect(page.locator('[data-testid="vendor-map"]')).not.toBeVisible();

  // Location string should display
  await expect(page.locator('[data-testid="vendor-location"]')).toContainText('Miami, Florida');
});
```

#### E2E Test 2: Location-Based Search

```typescript
// tests/e2e/location-search.spec.ts
test('filters vendors by location', async ({ page }) => {
  await page.goto('/vendors');

  // Initial vendor count
  const initialCount = await page.locator('[data-testid="vendor-card"]').count();
  expect(initialCount).toBeGreaterThan(0);

  // Enter user location (Monaco coordinates)
  await page.fill('[data-testid="location-input"]', '43.7384, 7.4246');

  // Set distance to 100km
  await page.locator('[data-testid="distance-slider"]').fill('100');

  // Click search
  await page.click('[data-testid="search-button"]');

  // Wait for results
  await page.waitForTimeout(500);

  // Verify filtered results
  const filteredCount = await page.locator('[data-testid="vendor-card"]').count();
  expect(filteredCount).toBeLessThanOrEqual(initialCount);

  // Verify result count message
  await expect(page.locator('[data-testid="result-count"]')).toBeVisible();

  // Reset filters
  await page.click('[data-testid="reset-button"]');

  // Verify all vendors shown again
  const resetCount = await page.locator('[data-testid="vendor-card"]').count();
  expect(resetCount).toBe(initialCount);
});
```

#### E2E Test 3: Get Directions Link

```typescript
test('Google Maps directions link works', async ({ page, context }) => {
  await page.goto('/vendors/test-full-location');

  // Get the directions link
  const directionsLink = page.locator('[data-testid="get-directions"]');
  await expect(directionsLink).toBeVisible();

  // Verify link href
  const href = await directionsLink.getAttribute('href');
  expect(href).toContain('google.com/maps');
  expect(href).toContain('43.7384');
  expect(href).toContain('7.4246');

  // Verify link opens in new tab
  expect(await directionsLink.getAttribute('target')).toBe('_blank');
});
```

## Test Data Requirements

### Test Vendors (Use Backend Test Data)

Use test vendors created in `test-backend-integration`:
- `test-full-location` (full coordinates + address)
- `test-coordinates-only` (coordinates only)
- `test-legacy-vendor` (no coordinates)

### Mock Data for Unit Tests

```typescript
// Mock vendor with full location data
export const mockVendorFull = {
  id: 'mock-vendor-1',
  name: 'Mock Vendor Monaco',
  slug: 'mock-vendor-monaco',
  location: 'Monaco',
  coordinates: {
    latitude: 43.7384,
    longitude: 7.4246
  },
  address: {
    city: 'Monaco',
    country: 'MC'
  }
};

// Mock vendor without coordinates
export const mockVendorLegacy = {
  id: 'mock-vendor-2',
  name: 'Mock Legacy Vendor',
  slug: 'mock-legacy-vendor',
  location: 'Miami, Florida'
};
```

## Environment Setup

### Leaflet CSS for Tests

Ensure Leaflet CSS is loaded in the test environment. No API tokens required for Leaflet.

### Playwright Configuration

Ensure Playwright is configured in `playwright.config.ts`:

```typescript
export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'on-failure',
    video: 'retain-on-failure'
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: true
  }
});
```

## Acceptance Criteria

- [ ] Frontend test suite document created
- [ ] All 5 component test categories defined
- [ ] Playwright E2E tests specified (3 test files)
- [ ] Test data requirements documented
- [ ] Mock data structures created
- [ ] Environment setup documented
- [ ] Data-testid attributes planned for all components
- [ ] Visual regression test strategy defined
- [ ] Accessibility test requirements included
- [ ] Performance test considerations documented

## Testing Tools

- **Unit/Integration**: React Testing Library (if configured)
- **E2E**: Playwright (as required by CLAUDE.md)
- **Visual**: Playwright screenshots
- **Accessibility**: Playwright accessibility testing

## Test Execution Plan

1. **Development**: Unit tests run on file change
2. **Pre-commit**: Type check + lint
3. **Pre-push**: Full test suite
4. **CI/CD**: E2E tests with Playwright

## Data-testid Naming Convention

```typescript
// Map component
[data-testid="vendor-map"]
[data-testid="vendor-map-container"]
[data-testid="vendor-marker"]

// Location card
[data-testid="vendor-location"]
[data-testid="vendor-address"]
[data-testid="vendor-coordinates"]
[data-testid="get-directions"]

// Search filter
[data-testid="location-input"]
[data-testid="distance-slider"]
[data-testid="search-button"]
[data-testid="reset-button"]
[data-testid="result-count"]

// Vendor cards
[data-testid="vendor-card"]
[data-testid="vendor-card-{slug}"]
```

## Notes

- CRITICAL: Always use Playwright to verify assumptions (per CLAUDE.md)
- Test with actual Leaflet library in E2E tests (no API keys required)
- Consider offline/network failure scenarios (tile loading)
- Test on different viewport sizes (mobile, tablet, desktop)
- Include visual regression tests for map rendering
- Test keyboard navigation for accessibility
- Verify Leaflet CSS is properly loaded for map styling
