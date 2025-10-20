# Test Plan: Vendor Location Mapping Feature
**Status:** READY TO EXECUTE (pending bug fix)
**Test Suite:** E2E Playwright Tests
**Total Tests:** 30

---

## Test Coverage Overview

### 1. Vendor Detail Page Map Display (3 tests)

**Test 1.1:** Should display map on vendor detail page with coordinates
- **Action:** Navigate to `/vendors/alfa-laval`
- **Verify:** Map wrapper visible within 10 seconds
- **Evidence:** Screenshot `01-vendor-page-with-map.png`

**Test 1.2:** Should load Leaflet map tiles correctly
- **Action:** Navigate to `/vendors/caterpillar-marine`
- **Verify:** OpenFreeMap tiles loaded (count > 0)
- **Evidence:** Tile count logged

**Test 1.3:** Should display map with proper dimensions
- **Action:** Navigate to `/vendors/crestron`
- **Verify:** Map height > 300px
- **Evidence:** Dimensions logged

---

### 2. Map Marker Visibility and Interactions (3 tests)

**Test 2.1:** Should display vendor marker on map
- **Action:** Navigate to vendor page, wait for map load
- **Verify:** Marker visible in `.leaflet-marker-pane`
- **Evidence:** Screenshot `02-map-with-marker.png`

**Test 2.2:** Should display popup when marker is clicked
- **Action:** Click on marker
- **Verify:** Popup appears with vendor name and coordinates
- **Evidence:** Screenshot `03-marker-popup.png`

**Test 2.3:** Should verify marker icon images load
- **Action:** Navigate to vendor page, check marker icon
- **Verify:** Icon `src` contains 'marker-icon'
- **Evidence:** Icon path logged

---

### 3. Location Card Information Display (3 tests)

**Test 3.1:** Should display VendorLocationCard with complete information
- **Action:** Navigate to vendor page
- **Verify:** Location card shows title, location text, coordinates
- **Evidence:** Screenshot `04-location-card.png`

**Test 3.2:** Should display address when available
- **Action:** Navigate to vendor with address
- **Verify:** Address field visible (if present in data)
- **Evidence:** Address logged or noted as missing

**Test 3.3:** Should format coordinates correctly
- **Action:** Navigate to vendor page, extract coordinates
- **Verify:** Format matches `XX.XXXX, YY.YYYY` (4 decimal places)
- **Evidence:** Coordinate string logged

---

### 4. Get Directions Functionality (3 tests)

**Test 4.1:** Should display Get Directions button
- **Action:** Navigate to vendor page
- **Verify:** Button visible with correct text
- **Evidence:** Screenshot `05-get-directions-button.png`

**Test 4.2:** Should have correct Google Maps directions URL
- **Action:** Check button link href
- **Verify:** URL contains `google.com/maps/dir/`, `destination=`, `api=1`
- **Verify:** Link opens in new tab (`target="_blank"`, `rel="noopener"`)
- **Evidence:** URL validated

**Test 4.3:** Should include vendor name in directions query
- **Action:** Check directions URL
- **Verify:** Query parameter includes vendor name
- **Evidence:** Query parameter logged

---

### 5. Responsive Design (4 tests)

**Test 5.1:** Should display map correctly on mobile viewport (375x667)
- **Action:** Set mobile viewport, navigate to vendor page
- **Verify:** Map visible and fits viewport width
- **Evidence:** Screenshot `06-mobile-map.png` (full page)

**Test 5.2:** Should display location card correctly on mobile
- **Action:** Set mobile viewport, check location card
- **Verify:** Card visible, readable, Get Directions clickable
- **Evidence:** Screenshot `07-mobile-location-card.png`

**Test 5.3:** Should display map correctly on tablet viewport (768x1024)
- **Action:** Set tablet viewport, navigate to vendor page
- **Verify:** Map displays properly
- **Evidence:** Screenshot `08-tablet-map.png` (full page)

**Test 5.4:** Should display map correctly on desktop viewport (1920x1080)
- **Action:** Set desktop viewport, navigate to vendor page
- **Verify:** Map displays properly
- **Evidence:** Screenshot `09-desktop-map.png` (full page)

---

### 6. Multiple Vendor Locations (4 tests)

**Test 6.1-6.3:** Should display map and location for [Vendor Name]
- **Vendors:** Alfa Laval, Caterpillar Marine, Crestron
- **Action:** Navigate to each vendor page
- **Verify:** Vendor name in H1, map visible, location card visible
- **Evidence:** Screenshots `10-[vendor-slug]-location.png` (3 files)

**Test 6.4:** Should display different coordinates for different vendors
- **Action:** Navigate to all three vendors, collect coordinates
- **Verify:** Received 3 different coordinate sets in valid format
- **Evidence:** All coordinates logged

---

### 7. Fallback Handling (1 test)

**Test 7.1:** Should validate coordinate ranges
- **Action:** Extract coordinates from vendor page
- **Verify:** Latitude: -90 to 90, Longitude: -180 to 180
- **Evidence:** Validated coordinates logged

---

### 8. Visual Verification Summary (1 test)

**Test 8.1:** Should capture complete vendor page with map for documentation
- **Action:** Navigate to 3 vendor pages, capture multiple screenshot types
- **Verify:** Screenshots generated
- **Evidence:**
  - Full page screenshots: `complete-[vendor]-page.png` (3 files)
  - Map only: `map-[vendor].png` (3 files)
  - Location card only: `location-card-[vendor].png` (3 files)

---

## Test Data

### Vendors Used for Testing
1. **Alfa Laval** (`/vendors/alfa-laval`)
2. **Caterpillar Marine** (`/vendors/caterpillar-marine`)
3. **Crestron** (`/vendors/crestron`)

### Viewport Sizes
- **Mobile:** 375 x 667 (iPhone SE)
- **Tablet:** 768 x 1024 (iPad)
- **Desktop:** 1920 x 1080 (Full HD)

### Browsers
- **Chromium** (Desktop Chrome)
- **Firefox** (Desktop Firefox)
- **WebKit** (Desktop Safari)

---

## Test Selectors

### Data Test IDs
- `[data-testid="vendor-map"]` - Map wrapper
- `[data-testid="vendor-location-card"]` - Location card
- `[data-testid="vendor-location"]` - Location display text
- `[data-testid="vendor-coordinates"]` - Coordinates display
- `[data-testid="vendor-address"]` - Address display
- `[data-testid="vendor-distance"]` - Distance display (if calculated)
- `[data-testid="get-directions"]` - Get Directions button

### CSS Selectors
- `.vendor-map-container` - Map container
- `.leaflet-marker-pane img` - Map marker
- `.leaflet-tile-pane img` - Map tiles
- `.vendor-map-popup` - Marker popup

---

## Expected Evidence Files

Once tests execute successfully:

```
evidence/e2e/
├── 01-vendor-page-with-map.png
├── 02-map-with-marker.png
├── 03-marker-popup.png
├── 04-location-card.png
├── 05-get-directions-button.png
├── 06-mobile-map.png
├── 07-mobile-location-card.png
├── 08-tablet-map.png
├── 09-desktop-map.png
├── 10-alfa-laval-location.png
├── 10-caterpillar-marine-location.png
├── 10-crestron-location.png
├── complete-alfa-laval-page.png
├── complete-caterpillar-marine-page.png
├── complete-crestron-page.png
├── map-alfa-laval.png
├── map-caterpillar-marine.png
├── map-crestron.png
├── location-card-alfa-laval.png
├── location-card-caterpillar-marine.png
└── location-card-crestron.png
```

**Total Screenshots:** 21

---

## Test Configuration

**Playwright Config:**
- Base URL: `http://localhost:3000`
- Test timeout: 60 seconds
- Action timeout: 30 seconds
- Expect timeout: 10 seconds
- Screenshot on failure: Yes
- Trace on retry: Yes

**Test Execution:**
```bash
# Run all tests (all browsers)
npx playwright test tests/e2e/vendor-location-mapping.spec.ts

# Run Chromium only
npx playwright test tests/e2e/vendor-location-mapping.spec.ts --project=chromium

# Run with headed browser (visual mode)
npx playwright test tests/e2e/vendor-location-mapping.spec.ts --headed

# Debug specific test
npx playwright test tests/e2e/vendor-location-mapping.spec.ts -g "should display map" --debug

# Generate HTML report
npx playwright show-report
```

---

## Success Criteria

### All Tests Pass ✅
- 30/30 tests passing
- All screenshots captured
- No console errors
- No failed assertions

### Visual Validation ✅
- Maps display correctly
- Markers appear and are clickable
- Popups show vendor information
- Location cards render properly
- Responsive design works across viewports

### Functional Validation ✅
- Map tiles load from OpenFreeMap
- Markers placed at correct coordinates
- Get Directions links to Google Maps
- Location information formatted correctly
- Coordinates displayed with proper precision

### Cross-Browser Compatibility ✅
- Chromium: All tests pass
- Firefox: All tests pass
- WebKit: All tests pass

---

## Performance Benchmarks (To Measure)

- **Page Load:** < 3 seconds
- **Map Initialization:** < 2 seconds
- **Tile Loading:** < 1 second
- **Marker Rendering:** < 500ms
- **Popup Display:** < 300ms

---

## Known Limitations

1. Tests require dev server running on port 3000
2. Leaflet is client-side only (dynamic import used)
3. Map tiles require internet connection (OpenFreeMap CDN)
4. Tests use actual vendor data from Payload CMS
5. Screenshots may vary slightly based on tile server response time

---

## Ready to Execute

All test infrastructure is in place:
- ✅ Test file: `tests/e2e/vendor-location-mapping.spec.ts`
- ✅ Evidence directory: Created
- ✅ Playwright config: Configured
- ✅ Test data: Available
- ⏳ **Waiting for:** BUG-001 fix

**Once bug is fixed, tests will execute automatically and provide comprehensive validation of the vendor location mapping feature.**

---

**Test Plan Version:** 1.0
**Created:** 2025-10-19
**Status:** Ready to Execute
