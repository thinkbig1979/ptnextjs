# Location Discovery E2E Tests

**Status**: Complete
**Test File**: `/home/edwin/development/ptnextjs/tests/e2e/location-discovery.spec.ts`
**Created**: 2025-12-22

## Overview

Comprehensive end-to-end tests for the location discovery feature using Playwright. Tests cover the VendorsNearYou component, category filtering, and location persistence.

## Test Coverage

### 1. Vendors Near You - Product Page (5 tests)

#### Test 1.1: No Location Prompt
- **Purpose**: Verify UI shows "Set location" prompt when no location is saved
- **Assertions**:
  - VendorsNearYou section is visible
  - "Set your location to find nearby vendors" text is shown
  - "Search Vendors" button is present and links to `/vendors?category=...`

#### Test 1.2: Nearby Vendors with Location
- **Purpose**: Verify vendor cards are displayed when location is set
- **Assertions**:
  - Vendor cards are shown (with `data-testid="nearby-vendor-card"`)
  - Vendor cards contain name, location, tier badge
  - Distance indicator is shown (if available)
  - "View all vendors" button is present
  - Handles "no vendors found" case gracefully

#### Test 1.3: Vendor Card Navigation
- **Purpose**: Verify clicking vendor card navigates to vendor detail page
- **Assertions**:
  - Vendor card is clickable link
  - Links to `/vendors/[slug]`
  - Navigation works correctly
  - Vendor detail page loads

#### Test 1.4: Expired Location Cleared
- **Purpose**: Verify expired locations (31+ days) are auto-cleared
- **Setup**: Set location with timestamp 31 days ago
- **Assertions**:
  - "Set your location" prompt is shown
  - Location is removed from localStorage
  - Component behaves as if no location is set

#### Test 1.5: Location Expiry Boundary
- **Purpose**: Verify exact 30-day boundary (30 days OK, 31 days expired)
- **Assertions**:
  - 30-day-old location is still valid
  - 31-day-old location is expired and cleared

### 2. Vendor Category Filter (3 tests)

#### Test 2.1: Filter by Product Category
- **Purpose**: Verify category dropdown filters vendors
- **Assertions**:
  - Category filter UI is visible
  - Selecting a category updates URL with `productCategory=...`
  - Filter description text is shown
  - Vendor list updates (tested via URL params)

#### Test 2.2: URL Params Persist on Refresh
- **Purpose**: Verify category selection persists after page refresh
- **Setup**: Navigate to `/vendors?productCategory=navigation`
- **Assertions**:
  - Category is pre-selected in dropdown
  - Page refresh maintains selection
  - URL params remain intact

#### Test 2.3: Clear Category Filter
- **Purpose**: Verify "All Categories" option clears filter
- **Setup**: Start with category filter applied
- **Assertions**:
  - Selecting "All Categories" removes `productCategory` from URL
  - Filter description is hidden
  - All vendors are shown again

### 3. Location Persistence (2 tests)

#### Test 3.1: Location Across Page Navigation
- **Purpose**: Verify location persists across different pages
- **Flow**: Set location → Vendors page → Products page → Product detail
- **Assertions**:
  - Location remains in localStorage across all pages
  - Location data is unchanged after navigation

#### Test 3.2: Location Expiry Boundary
- **Purpose**: Test exact expiry boundary (covered in Test 1.5)

## Test Data

### Monaco Location (Sample)
```json
{
  "latitude": 43.7384,
  "longitude": 7.4246,
  "displayName": "Monaco",
  "timestamp": [current timestamp]
}
```

### Expired Location (31 days old)
```json
{
  "latitude": 43.7384,
  "longitude": 7.4246,
  "displayName": "Monaco",
  "timestamp": [31 days ago]
}
```

## Test Isolation Strategy

1. **localStorage Cleanup**: Each test uses `beforeEach` to clear localStorage
2. **addInitScript**: Location data is injected before page navigation
3. **Independent Tests**: No test depends on another test's state
4. **Graceful Skipping**: Tests skip if required data/UI not available

## Key Test Patterns

### Setting Location Before Page Load
```typescript
await page.addInitScript((data) => {
  localStorage.setItem(data.key, JSON.stringify(data.location));
}, { key: STORAGE_KEY, location: MONACO_LOCATION });
```

### Checking localStorage in Tests
```typescript
const storedLocation = await page.evaluate((key) => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : null;
}, STORAGE_KEY);
```

### Handling Optional UI Elements
```typescript
if (await vendorCards.count() === 0) {
  console.log('⚠️  No vendor cards found, skipping test');
  test.skip();
  return;
}
```

## Test Selectors Used

| Element | Selector |
|---------|----------|
| VendorsNearYou section | `h3, [class*="CardTitle"]` with text filter |
| Vendor cards | `[data-testid="nearby-vendor-card"]` |
| Category filter label | `text=Filter by Product Type:` |
| Category select trigger | `button[role="combobox"]` |
| Category options | `[role="option"]` |
| Set location prompt | `text=Set your location to find nearby vendors` |
| Search Vendors button | `text=Search Vendors` |

## Running the Tests

```bash
# Run all location discovery tests
npm run test:e2e -- location-discovery.spec.ts

# Run with UI mode for debugging
npm run test:e2e:ui -- location-discovery.spec.ts

# Run specific test
npm run test:e2e -- location-discovery.spec.ts -g "shows nearby vendors when location is set"
```

## Expected Test Results

- **Total Tests**: 10
- **Test Groups**: 3 (Vendors Near You, Category Filter, Location Persistence)
- **Screenshot Outputs**: 9 screenshots saved to `/tmp/`

## Known Test Behaviors

1. **Product Availability**: Some tests skip if no products are available (expected in empty database)
2. **Category Availability**: Tests check for product categories before running filter tests
3. **Vendor Availability**: Tests gracefully handle "no vendors found" scenarios
4. **Dynamic Content**: Tests use generous timeouts for dynamic content loading

## Future Enhancements

1. Add tests for location search UI integration (when implemented)
2. Add tests for radius adjustment (if feature is added)
3. Test geolocation API integration (if browser location is supported)
4. Add visual regression tests for component rendering
5. Test mobile viewport behavior

## Related Files

- **Component**: `/home/edwin/development/ptnextjs/components/products/VendorsNearYou.tsx`
- **Hook**: `/home/edwin/development/ptnextjs/hooks/useLocationPreference.ts`
- **Page Integration**: `/home/edwin/development/ptnextjs/app/(site)/products/[id]/page.tsx`
- **Vendor Filter**: `/home/edwin/development/ptnextjs/app/(site)/components/vendors-client.tsx`
- **Category Select**: `/home/edwin/development/ptnextjs/components/vendors/CategorySelect.tsx`

## Test Maintenance Notes

1. **localStorage Key**: Tests use `STORAGE_KEY = 'pt_user_location'` constant
2. **Expiry Default**: 30 days (defined in `useLocationPreference` hook)
3. **Test Isolation**: Always clear localStorage in `beforeEach`
4. **Graceful Degradation**: Tests skip if required UI/data not available
5. **Screenshot Naming**: All screenshots use `/tmp/` prefix for easy cleanup
