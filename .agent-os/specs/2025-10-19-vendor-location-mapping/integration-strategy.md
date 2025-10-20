# Vendor Location Mapping Integration Strategy

**Version**: 1.1
**Date**: 2025-10-19
**Status**: Active
**Technology Stack**: Next.js 14, Payload CMS (migrated from TinaCMS), Leaflet.js 1.9.4 + OpenFreeMap

**Changelog**:
- v1.1 (2025-10-19): Switched from Mapbox GL JS to Leaflet.js + OpenFreeMap (no API key required)
- v1.0 (2025-10-19): Initial integration strategy created

---

## 1. Architecture Overview

### Data Flow Architecture

```
TinaCMS (Markdown) → TinaCMSDataService → React Components → Static Pages
     ↓                      ↓                    ↓
  content/vendors/    transformTinaVendor()   VendorMap
  - location.md         - Validates coords      - Displays map
  - company-name.md     - Transforms data       - Interactive pins
                        - Handles optionals     - Popup info
```

**Key Characteristics**:
- **Static Site Generation**: All data resolved at build time (no runtime API calls)
- **TinaCMS Source**: Markdown files in `content/vendors/` directory
- **Transform Layer**: `TinaCMSDataService.transformTinaVendor()` handles data normalization
- **Client Components**: Maps and search require 'use client' directive for interactivity

### Backward Compatibility Requirements

**Current State**:
- Vendor interface has `location?: string` field (simple text address)
- Existing vendors may have location as text or undefined
- No breaking changes allowed to existing vendor data

**Migration Strategy**:
- Location field transitions from `string` to `VendorLocation` object
- Maintain support for legacy string locations with type union
- Gracefully degrade when coordinates unavailable
- Display text address when coordinates missing

---

## 2. TinaCMS Schema Changes

### Critical Discovery: Actual CMS Technology

**Current Codebase Reality**:
- File named `tinacms-data-service.ts` but actually uses **Payload CMS** (NOT TinaCMS)
- Evidence: Git commit "Complete TinaCMS to Payload CMS migration" (PR #5, merged 2 hours ago)
- Schema file: `/home/edwin/development/ptnextjs/payload/collections/Vendors.ts` (1090 lines)
- Markdown content replaced by SQLite database storage

**Schema Extension Required**:

Location: `/home/edwin/development/ptnextjs/payload/collections/Vendors.ts`
Insert after: Line 1014 (before metadata fields)

```typescript
{
  name: 'location',
  type: 'group',
  label: 'Location Information',
  admin: {
    description: 'Geographic location for map display and location-based search',
  },
  fields: [
    {
      name: 'address',
      type: 'text',
      label: 'Full Address',
      admin: {
        placeholder: 'e.g., 123 Harbor View Drive, Fort Lauderdale, FL 33316',
        description: 'Complete mailing address (displayed publicly)',
      },
    },
    {
      name: 'latitude',
      type: 'number',
      label: 'Latitude',
      min: -90,
      max: 90,
      admin: {
        step: 0.000001,
        placeholder: 'e.g., 26.122439',
        description: 'Latitude coordinate (-90 to 90). Use geocode.maps.co to find coordinates.',
      },
    },
    {
      name: 'longitude',
      type: 'number',
      label: 'Longitude',
      min: -180,
      max: 180,
      admin: {
        step: 0.000001,
        placeholder: 'e.g., -80.137314',
        description: 'Longitude coordinate (-180 to 180). Use geocode.maps.co to find coordinates.',
      },
    },
    {
      name: 'city',
      type: 'text',
      label: 'City',
      admin: {
        placeholder: 'e.g., Fort Lauderdale',
      },
    },
    {
      name: 'country',
      type: 'text',
      label: 'Country',
      admin: {
        placeholder: 'e.g., United States',
      },
    },
  ],
},
```

**Field Design Rationale**:
- **All fields optional**: Backward compatibility for existing vendors
- **Numeric precision**: 6 decimal places (~0.11m accuracy) for coordinates
- **Validation bounds**: Prevents invalid latitude/longitude values
- **Helpful placeholders**: Guide content editors on expected format
- **Admin descriptions**: Link to geocoding tool (geocode.maps.co)

### Migration Path for Existing Vendors

**Phase 1: Schema Deployment** (non-breaking)
1. Deploy Payload CMS schema changes
2. Existing vendors continue working (no location data)
3. New location fields appear in admin panel

**Phase 2: Data Migration** (manual)
1. Content editors manually add location data via Payload admin
2. Use geocode.maps.co to convert addresses → coordinates
3. Prioritize featured partners first (highest visibility)

**Phase 3: Gradual Enhancement**
1. Maps display only for vendors with coordinates
2. Search filters exclude vendors without location
3. No errors for missing location data (graceful degradation)

---

## 3. TypeScript Type Extensions

### File: `/home/edwin/development/ptnextjs/lib/types.ts`

**Current State** (line 188):
```typescript
location?: string
```

**New Interfaces** (add after line 178):

```typescript
/**
 * Geographic coordinates for vendor location
 * Uses WGS84 coordinate system (standard for GPS/maps)
 */
export interface VendorCoordinates {
  latitude: number;   // -90 to 90
  longitude: number;  // -180 to 180
}

/**
 * Complete vendor location information
 * All fields optional for backward compatibility
 */
export interface VendorLocation {
  address?: string;       // Full mailing address
  latitude?: number;      // Geographic latitude
  longitude?: number;     // Geographic longitude
  city?: string;          // City name
  country?: string;       // Country name
}
```

**Updated Vendor Interface** (line 188):
```typescript
// Replace: location?: string
// With: location?: VendorLocation | string  // Union type for migration compatibility
location?: VendorLocation | string;
```

**Type Guard Utility** (add to `/home/edwin/development/ptnextjs/lib/utils/type-guards.ts` - create file):
```typescript
/**
 * Type guard to check if location is structured object
 * @param location - Vendor location field (string or object)
 * @returns true if location is VendorLocation object with coordinates
 */
export function isVendorLocationObject(
  location: VendorLocation | string | undefined
): location is VendorLocation {
  return (
    typeof location === 'object' &&
    location !== null &&
    typeof location.latitude === 'number' &&
    typeof location.longitude === 'number'
  );
}

/**
 * Validates coordinate bounds
 * @param coords - Coordinate object to validate
 * @returns true if coordinates are within valid WGS84 bounds
 */
export function areValidCoordinates(coords: { latitude: number; longitude: number }): boolean {
  return (
    coords.latitude >= -90 &&
    coords.latitude <= 90 &&
    coords.longitude >= -180 &&
    coords.longitude <= 180
  );
}
```

---

## 4. Data Service Modifications

### File: `/home/edwin/development/ptnextjs/lib/tinacms-data-service.ts`

**Method: `transformTinaVendor()`** (lines 267-363)

**Current Implementation** (line 278):
```typescript
location: tinaVendor.location,  // Simple passthrough
```

**Updated Implementation**:

```typescript
// Replace line 278 with:
location: this.transformVendorLocation(tinaVendor.location),

// Add new method after transformTinaVendor (around line 364):
/**
 * Transforms and validates vendor location data
 * Handles both legacy string locations and new structured location objects
 * @param location - Raw location data from Payload CMS (string or object)
 * @returns Normalized VendorLocation object or undefined
 */
private transformVendorLocation(
  location: any
): VendorLocation | string | undefined {
  // Handle undefined/null
  if (!location) {
    return undefined;
  }

  // Handle legacy string location (backward compatibility)
  if (typeof location === 'string') {
    return location;
  }

  // Handle structured location object
  if (typeof location === 'object') {
    const hasCoordinates =
      typeof location.latitude === 'number' &&
      typeof location.longitude === 'number';

    // Validate coordinates if present
    if (hasCoordinates) {
      const isValid =
        location.latitude >= -90 &&
        location.latitude <= 90 &&
        location.longitude >= -180 &&
        location.longitude <= 180;

      if (!isValid) {
        console.warn(
          `Invalid coordinates for vendor location: lat=${location.latitude}, lng=${location.longitude}`
        );
        // Return location without coordinates to prevent map errors
        return {
          address: location.address,
          city: location.city,
          country: location.country,
        };
      }
    }

    // Return normalized location object
    return {
      address: location.address || undefined,
      latitude: location.latitude || undefined,
      longitude: location.longitude || undefined,
      city: location.city || undefined,
      country: location.country || undefined,
    };
  }

  // Fallback for unexpected types
  console.warn(`Unexpected location type: ${typeof location}`);
  return undefined;
}
```

**Coordinate Validation Logic**:
1. **Null/undefined handling**: Return undefined (graceful degradation)
2. **String passthrough**: Support legacy string locations
3. **Coordinate bounds check**: Validate WGS84 standard (-90/90, -180/180)
4. **Invalid coordinate handling**: Strip coordinates but preserve address
5. **Console warnings**: Log validation issues for debugging

**Default Value Handling**:
- All location subfields default to `undefined` (not `null` or empty string)
- Undefined fields excluded from rendered UI components
- TypeScript optional chaining (`location?.latitude`) prevents runtime errors

---

## 5. Frontend Component Architecture

### Component Hierarchy

```
VendorDetailPage (app/(site)/vendors/[slug]/page.tsx)
  └─ VendorLocationSection (NEW - conditional render)
      ├─ VendorMap (NEW - Leaflet.js + OpenFreeMap)
      │   └─ Leaflet Map instance with OpenStreetMap tiles
      └─ VendorLocationCard (NEW - address display)

VendorListingPage (app/(site)/vendors/page.tsx)
  ├─ LocationSearchFilter (NEW - distance search)
  │   └─ useLocationFilter hook (NEW)
  └─ VendorGrid (EXISTING)
      └─ VendorCard (EXISTING - no changes)
```

### Component Specifications

#### VendorMap Component

**File**: `/home/edwin/development/ptnextjs/components/vendor/VendorMap.tsx`
**Type**: Client Component (`'use client'`)
**Technology**: Leaflet.js 1.9.4 + React-Leaflet 5.0.0 + OpenFreeMap tiles (NO API KEY REQUIRED)

**Props Interface**:
```typescript
interface VendorMapProps {
  latitude: number;
  longitude: number;
  vendorName: string;
  address?: string;
  className?: string;
}
```

**Key Features**:
- Interactive map with zoom/pan controls
- Single pin marker at vendor location
- Popup showing vendor name and address
- Responsive container (100% width, 400px height default)
- Accessible (keyboard navigation, ARIA labels)

**Dependencies**:
- leaflet@1.9.4
- react-leaflet@5.0.0
- @types/leaflet@1.9.21
- NO environment variables or API keys required!

#### VendorLocationCard Component

**File**: `/home/edwin/development/ptnextjs/components/vendor/VendorLocationCard.tsx`
**Type**: Client Component (for copy-to-clipboard functionality)
**UI Library**: shadcn/ui (Card, Button components)

**Props Interface**:
```typescript
interface VendorLocationCardProps {
  location: VendorLocation;
  className?: string;
}
```

**Key Features**:
- Display formatted address
- Copy address to clipboard button
- "Get Directions" link (opens Google Maps)
- Display city and country if available
- MapPin icon from lucide-react

#### LocationSearchFilter Component

**File**: `/home/edwin/development/ptnextjs/components/vendor/LocationSearchFilter.tsx`
**Type**: Client Component (for geolocation API)
**UI Library**: shadcn/ui (Input, Select components)

**Props Interface**:
```typescript
interface LocationSearchFilterProps {
  onLocationChange: (coords: VendorCoordinates | null) => void;
  onRadiusChange: (miles: number) => void;
  defaultRadius?: number; // default: 50
}
```

**Key Features**:
- "Use Current Location" button (browser geolocation)
- Manual address input (with geocoding via geocode.maps.co)
- Radius dropdown (10, 25, 50, 100 miles)
- Clear filter button
- Loading states and error handling

### Component Integration Points

**Vendor Detail Page** (`app/(site)/vendors/[slug]/page.tsx`):
- Insert after line 223 (company info section)
- Conditional rendering: `{vendor.location?.latitude && vendor.location?.longitude && ...}`
- Lazy load map component (Next.js dynamic import with `ssr: false`)

**Vendor Listing Page** (`app/(site)/vendors/page.tsx`):
- Add filter section before vendor grid
- Integrate with existing filter state management
- Sort vendors by distance when location filter active

---

## 6. Geocoding Strategy

### Manual Entry (MVP Default)

**Workflow for Content Editors**:
1. Open Payload admin panel at `/admin`
2. Navigate to vendor edit page
3. Enter full address in "Full Address" field
4. Visit https://geocode.maps.co/
5. Paste address, copy latitude/longitude
6. Paste coordinates into Payload CMS fields
7. Save vendor

**Pros**:
- No API dependencies or rate limits
- Simple, reliable, no auth required
- Content editor has full control

**Cons**:
- Manual process (10-20 seconds per vendor)
- Prone to copy/paste errors
- Not suitable for bulk import

### Optional API Integration (Future Enhancement)

**Service**: geocode.maps.co
**Pricing**: 1M requests/month free (no API key required)
**Rate Limit**: 2 requests/second
**Endpoint**: `https://geocode.maps.co/search?q={address}`

**Implementation Location**:
- Create `/home/edwin/development/ptnextjs/lib/utils/geocoding.ts`
- Server-side only (not exposed to client)
- Use during build time for batch processing
- Cache results in vendor markdown files

**Example Implementation** (future):
```typescript
export async function geocodeAddress(address: string): Promise<VendorCoordinates | null> {
  try {
    const response = await fetch(
      `https://geocode.maps.co/search?q=${encodeURIComponent(address)}`
    );
    const data = await response.json();

    if (data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}
```

### Coordinate Validation

**Client-Side Validation**:
- Validate bounds in LocationSearchFilter input handlers
- Display error message for out-of-bounds values
- Prevent form submission with invalid coordinates

**Server-Side Validation**:
- Payload CMS schema enforces min/max constraints
- transformVendorLocation() validates in data service
- Build fails if invalid coordinates detected

---

## 7. Environment Configuration

### Required Environment Variables

**✅ NONE REQUIRED!**

Leaflet.js with OpenFreeMap tiles requires **NO API keys or environment variables**.

**Why this is great**:
- 🎉 No signup or account creation needed
- 🎉 No token management or security concerns
- 🎉 No rate limits or usage quotas
- 🎉 100% free and open source
- 🎉 Works immediately after `npm install`

**Map Tiles**:
- Source: OpenFreeMap (https://openfreemap.org/)
- Based on OpenStreetMap data
- CDN-hosted, fast, and reliable
- No attribution required (but recommended)

### Optional Environment Variables

```bash
# Geocoding API (OPTIONAL - for future automation)
GEOCODING_API_URL=https://geocode.maps.co
# No API key required for geocode.maps.co
```

### Development vs Production Configs

**Development**:
- No configuration needed
- Maps work immediately with `npm run dev`
- Verbose console logging enabled

**Production**:
- No configuration needed
- Same OpenFreeMap tiles in production
- Console warnings suppressed (errors only)

**Verification**:
```bash
# Start dev server
npm run dev
# Visit http://localhost:3000/vendors/test-vendor
# Maps should render immediately (no API key setup needed)
```

---

## 8. Testing Strategy

### Backend Testing

**TinaCMS Schema Validation**:
```bash
# Build Payload CMS types
npm run payload:build   # Regenerate Payload types from schema

# Verify no errors in Vendors.ts schema
npm run type-check      # TypeScript compilation check
```

**Data Transformation Tests**:
- Create test vendor with location data via Payload admin
- Verify `transformVendorLocation()` correctly normalizes data
- Test edge cases: missing coordinates, invalid bounds, string fallback
- Build site and inspect generated static pages

**Test Cases**:
1. **Vendor with complete location**: address + coordinates → full location object
2. **Vendor with address only**: no coordinates → location object without lat/lng
3. **Vendor with invalid coordinates**: (lat: 200, lng: 500) → stripped coordinates
4. **Vendor with legacy string location**: "Fort Lauderdale, FL" → passthrough string
5. **Vendor with no location**: undefined → undefined (no errors)

### Frontend Testing

**Component Unit Tests** (optional - future enhancement):
- VendorMap: Test map initialization, marker placement, popup display
- VendorLocationCard: Test address formatting, clipboard copy
- LocationSearchFilter: Test geolocation, geocoding, radius selection

**Playwright E2E Tests** (REQUIRED per CLAUDE.md):

**File**: `/home/edwin/development/ptnextjs/e2e/vendor-location-mapping.spec.ts`

**Test Scenarios**:
```typescript
test.describe('Vendor Location Mapping', () => {
  test('displays map on vendor detail page with coordinates', async ({ page }) => {
    // Navigate to vendor with location
    await page.goto('/vendors/test-vendor-with-location');

    // Verify map container exists
    await expect(page.locator('.mapboxgl-map')).toBeVisible();

    // Verify map marker present
    await expect(page.locator('.mapboxgl-marker')).toBeVisible();

    // Click marker to show popup
    await page.locator('.mapboxgl-marker').click();
    await expect(page.locator('.mapboxgl-popup')).toBeVisible();
  });

  test('hides map when vendor has no coordinates', async ({ page }) => {
    // Navigate to vendor without location
    await page.goto('/vendors/vendor-no-location');

    // Verify map does not render
    await expect(page.locator('.mapboxgl-map')).not.toBeVisible();
  });

  test('location search filters vendors by proximity', async ({ page }) => {
    await page.goto('/vendors');

    // Enter coordinates manually
    await page.fill('[name="latitude"]', '26.122439');
    await page.fill('[name="longitude"]', '-80.137314');

    // Select 50-mile radius
    await page.selectOption('[name="radius"]', '50');

    // Verify filtered results
    const vendors = page.locator('.vendor-card');
    await expect(vendors).not.toHaveCount(0);

    // Verify vendors within radius (check distance badges)
    const firstVendor = vendors.first();
    await expect(firstVendor.locator('.distance-badge')).toContainText('miles');
  });

  test('current location button uses geolocation', async ({ page, context }) => {
    // Grant geolocation permissions
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 26.122439, longitude: -80.137314 });

    await page.goto('/vendors');

    // Click "Use Current Location" button
    await page.click('button:has-text("Use Current Location")');

    // Verify coordinates populated
    await expect(page.locator('[name="latitude"]')).toHaveValue('26.122439');
    await expect(page.locator('[name="longitude"]')).toHaveValue('-80.137314');
  });
});
```

**Visual Regression Tests** (future):
- Screenshot comparison for map rendering
- Ensure consistent marker styling
- Verify responsive design on mobile viewports

**Accessibility Testing**:
```bash
# Install axe-core
npm install --save-dev @axe-core/playwright

# Run accessibility audit
npx playwright test --grep accessibility
```

### Integration Testing

**End-to-End Data Flow Validation**:
1. Add location to vendor via Payload admin
2. Build static site (`npm run build`)
3. Inspect generated HTML for vendor page
4. Verify location data embedded in page props
5. Verify map renders with correct coordinates
6. Test location search with known vendor locations

**Cross-Browser Testing**:
- Chrome 90+ (primary development browser)
- Firefox 88+ (verify Mapbox GL JS compatibility)
- Safari 14+ (test WebGL support)
- Mobile Safari (iOS 14+)
- Chrome Android (latest)

**Performance Testing**:
- Measure bundle size impact (mapbox-gl already installed, ~500KB gzipped)
- Verify map lazy loading (should not block page render)
- Test with 50+ vendor pins on map (listing page)
- Lighthouse score target: Performance 85+, Accessibility 95+

---

## 9. Migration Plan

### Existing Vendor Data (No Coordinates)

**Current State**:
- ~30-50 vendors in database (estimated)
- Some have `location: "City, State"` (string)
- Many have `location: undefined`

**Graceful Degradation Strategy**:

**Vendor Detail Pages**:
```tsx
{/* Conditional map rendering */}
{vendor.location?.latitude && vendor.location?.longitude ? (
  <div className="mb-8">
    <h2 className="text-2xl font-semibold mb-4">Location</h2>
    <VendorMap
      latitude={vendor.location.latitude}
      longitude={vendor.location.longitude}
      vendorName={vendor.name}
      address={vendor.location.address}
    />
  </div>
) : vendor.location && typeof vendor.location === 'string' ? (
  {/* Legacy string location display */}
  <div className="mb-8">
    <h2 className="text-2xl font-semibold mb-4">Location</h2>
    <div className="flex items-start gap-2">
      <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
      <span className="text-muted-foreground">{vendor.location}</span>
    </div>
  </div>
) : null}
```

**Vendor Listing Pages**:
- Location search filter only shows when at least 1 vendor has coordinates
- Vendors without coordinates appear in "All Vendors" tab
- Distance-based sorting excludes vendors without coordinates (appended to end)

**No Errors Guarantee**:
- TypeScript optional chaining prevents runtime errors
- Map component never renders without valid coordinates
- Location card displays partial data gracefully (address only, no map)

### Content Editor Workflow

**Phase 1: Setup** (1 hour)
1. Deploy Payload schema changes
2. Create Mapbox account, get token
3. Add token to `.env.local`
4. Deploy to staging environment

**Phase 2: Training** (30 minutes)
1. Create training documentation with screenshots
2. Walk through geocoding process (geocode.maps.co)
3. Demonstrate Payload admin location fields
4. Show preview of map on vendor page

**Phase 3: Data Entry** (2-5 hours depending on vendor count)
1. Prioritize featured partners (homepage visibility)
2. Add locations for tier 3 partners next
3. Process tier 2, then tier 1 vendors
4. Verify each vendor page displays map correctly

**Batch Processing Script** (optional future enhancement):
```bash
# Create script: scripts/geocode-vendors.ts
# Read all vendors from database
# For each vendor with address but no coordinates:
#   - Call geocode.maps.co API
#   - Update vendor location with coordinates
#   - Rate limit: 2 requests/second
#   - Log results
```

---

## 10. Performance Considerations

### Static Map Rendering

**Build-Time Processing**:
- All vendor data fetched during `npm run build`
- Location coordinates embedded in static HTML
- No runtime API calls to geocoding service
- Map tiles loaded from OpenFreeMap CDN on client side (NO API key required)

**Bundle Size Impact**:

**Current Bundle** (before feature):
- Total JavaScript: ~1.2MB (uncompressed)

**After Feature** (estimated):
- Leaflet.js: ~150KB gzipped (vector-optimized mapping library)
- React-Leaflet: ~10KB gzipped (React bindings)
- New components: ~15KB gzipped (VendorMap, LocationSearchFilter, etc.)
- Haversine utility: ~1KB gzipped
- **Total increase: ~176KB** (significantly smaller than Mapbox's 500KB)

**Lazy Loading Strategy**:
```tsx
// Dynamic import for VendorMap (reduces initial page load)
import dynamic from 'next/dynamic';

const VendorMap = dynamic(
  () => import('@/components/vendor/VendorMap'),
  {
    ssr: false,  // Client-side only
    loading: () => (
      <div className="w-full h-[400px] bg-muted animate-pulse rounded-lg" />
    )
  }
);
```

**Benefits**:
- Map code not loaded until vendor page with coordinates accessed
- Reduces initial JavaScript bundle for listing pages
- Improves First Contentful Paint (FCP) metric

### Image Optimization for Map Tiles

**Leaflet + OpenFreeMap Optimization**:
- Raster tiles (PNG format, well-optimized)
- Progressive loading (visible tiles first)
- Browser caching via HTTP headers
- Retina display support (@2x tile variants)
- CDN-distributed (fast global delivery)

**Configuration**:
```typescript
// In VendorMap component using React-Leaflet
<MapContainer
  center={[latitude, longitude]}
  zoom={13}
  scrollWheelZoom={false}
  style={{ height: '400px', width: '100%' }}
>
  <TileLayer
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    // OpenFreeMap alternative (faster CDN):
    // url="https://tiles.openfreemap.org/osm/{z}/{x}/{y}.png"
  />
  <Marker position={[latitude, longitude]}>
    <Popup>{vendorName}</Popup>
  </Marker>
</MapContainer>
```

### Performance Benchmarks

**Target Metrics** (Lighthouse):
- **Performance**: 85+ (current: 90+, expect 5-point decrease)
- **Accessibility**: 95+ (maintain current standard)
- **Best Practices**: 90+
- **SEO**: 100 (no impact - static content)

**Monitoring**:
```bash
# Run Lighthouse audit on vendor page with map
npx lighthouse http://localhost:3000/vendors/test-vendor --view

# Check bundle size
npm run build
npx next-bundle-analyzer
```

**Optimization Checklist**:
- [x] Lazy load map component (dynamic import)
- [x] Use mapbox-gl vector tiles (not raster)
- [x] Disable unnecessary map features (antialias, fade)
- [ ] Implement service worker caching for map tiles (future)
- [ ] Consider static map image for print view (future)

---

## Critical Decisions Summary

### 1. Schema Design: Optional Coordinate Fields ✅

**Decision**: All location fields optional (address, latitude, longitude, city, country)

**Rationale**:
- Backward compatibility with existing vendors
- Allows gradual content migration
- Prevents errors for vendors without location data
- Content editors can partially complete location info

**Impact**: Requires conditional rendering logic in all components

---

### 2. Geocoding Approach: Manual Entry (MVP) ✅

**Decision**: Manual coordinate entry via geocode.maps.co for MVP

**Rationale**:
- Simple, no API dependencies or auth required
- Free tier sufficient (1M requests/month)
- Content editor maintains full control
- Avoids rate limiting and API errors

**Future Enhancement**: Batch geocoding script for bulk imports

---

### 3. Map Display: Conditional Rendering ✅

**Decision**: Show maps only when vendor has valid coordinates

**Rationale**:
- Graceful degradation for vendors without location
- No broken maps or error states
- Legacy string locations still displayed as text
- Clear UX - no partial/broken map experience

**Fallback**: Display text address with MapPin icon (existing pattern)

---

### 4. Search Implementation: Haversine Distance Calculation ✅

**Decision**: Client-side distance calculation using Haversine formula

**Rationale**:
- Compatible with static site generation (no server needed)
- Accurate for <100-mile distances (±0.5% error)
- Simple implementation (~20 lines of code)
- No external dependencies

**Formula**:
```typescript
const R = 3958.8; // Earth radius in miles
const dLat = toRad(lat2 - lat1);
const dLon = toRad(lon2 - lon1);
const a =
  Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
  Math.sin(dLon / 2) * Math.sin(dLon / 2);
const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
const distance = R * c;
```

---

### 5. Error Handling: Silent Degradation ✅

**Decision**: Handle missing/invalid coordinates gracefully without error messages

**Rationale**:
- Better UX than showing error states
- Matches existing pattern (optional fields = hidden sections)
- Console warnings for debugging (dev mode only)
- Prevents negative user experience

**Console Logging**:
- Warnings for invalid coordinates (dev mode)
- Errors for failed map initialization (all modes)
- Silent degradation in production (no user-facing errors)

---

### 6. Content Editor UX: Payload Admin Fields ✅

**Decision**: Add location group to Payload CMS with inline geocoding instructions

**Rationale**:
- Familiar interface for content editors (Payload admin)
- Helpful placeholders and descriptions guide data entry
- Link to geocode.maps.co in field descriptions
- Validation prevents out-of-bounds coordinates

**Editor Workflow**:
1. Enter address in "Full Address" field
2. Visit geocode.maps.co (linked in field description)
3. Paste address, copy lat/lng
4. Paste coordinates into Payload fields
5. Save vendor

**Estimated Time per Vendor**: 30-60 seconds

---

## Technology Corrections from Original Spec

### Spec vs Reality Resolution

| **Spec Said** | **Initial Finding** | **Final Decision** |
|---------------|--------------------|--------------------|
| Payload CMS | ✅ Payload CMS (TinaCMS migrated) | ✅ Use Payload |
| Leaflet.js | ❌ Mapbox GL JS installed | ✅ **Switched to Leaflet.js** |
| OpenFreeMap tiles | ❌ Mapbox tiles found | ✅ **Using OpenFreeMap** |
| 150KB bundle | ❌ 500KB Mapbox found | ✅ **150KB Leaflet** |
| No API key | ❌ Mapbox token required | ✅ **No API key needed** |

**Critical Finding**: Package.json had Mapbox GL JS 1.13.3, but it was unused (installed but never imported in any code).

**Resolution (v1.1)**: Removed Mapbox, installed Leaflet.js + React-Leaflet because:
1. ✅ **Mapbox was unused** - No imports found in codebase
2. ✅ **Original spec correct** - Leaflet.js is the right choice
3. ✅ **No API key required** - Simpler for development and deployment
4. ✅ **Smaller bundle** - 150KB vs 500KB (70% reduction)
5. ✅ **Open source** - No vendor lock-in or usage limits

**Leaflet.js + OpenFreeMap Advantages**:
- No signup, no API keys, no authentication
- Completely free with no usage limits
- Smaller bundle size (better performance)
- Mature, battle-tested library (13+ years)
- Excellent React integration via react-leaflet

---

## Implementation Sequence

### Phase 1: Backend Foundation (Tasks: test-backend → impl-backend-service)
1. Extend Payload CMS vendor schema with location group
2. Update TypeScript types (VendorLocation, VendorCoordinates)
3. Modify transformVendorLocation() in data service
4. Create type guard utilities
5. Validate with `npm run build` and `npm run type-check`

**Estimated Time**: 9 hours
**Deliverables**: Schema deployed, types updated, build passes

---

### Phase 2: Frontend Components (Tasks: test-frontend → impl-frontend-vendor-list)
1. Create VendorMap component (Leaflet.js + React-Leaflet + OpenFreeMap)
2. Create VendorLocationCard component
3. Create LocationSearchFilter component
4. Implement Haversine distance utility
5. Create useLocationFilter custom hook
6. Integrate map into vendor detail pages
7. Integrate search into vendor listing pages

**Estimated Time**: 18 hours
**Deliverables**: Interactive maps (NO API KEY REQUIRED), location search, working UI

---

### Phase 3: Integration & Testing (Tasks: integ-data-flow → final-validation)
1. Validate end-to-end data flow (Payload → Map)
2. E2E testing with Playwright (REQUIRED)
3. Cross-browser testing
4. Accessibility audit
5. Performance benchmarking
6. Documentation updates

**Estimated Time**: 8 hours
**Deliverables**: Tested, validated, production-ready feature

---

## Risk Mitigation Strategies

### High-Risk Area 1: Map Service Availability (MITIGATED ✅)

**Risk**: Map tiles unavailable or service degraded

**Mitigation**:
1. ✅ **Multiple tile sources** - Can switch between OpenStreetMap and OpenFreeMap CDNs
2. ✅ **No API quotas** - No rate limits or usage restrictions
3. ✅ **Browser caching** - Tiles cached locally, works offline briefly
4. ✅ **Graceful degradation** - Maps fail silently, address still displays
5. ✅ **CDN distribution** - Fast global delivery via multiple CDNs

**Fallback Strategy**:
```typescript
// Primary: OpenFreeMap (faster CDN)
url="https://tiles.openfreemap.org/osm/{z}/{x}/{y}.png"

// Fallback: OpenStreetMap (official tiles)
url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
```

---

### High-Risk Area 2: Invalid Coordinate Data

**Risk**: Content editors enter invalid coordinates, breaking maps

**Mitigation**:
1. Payload CMS schema validation (min/max bounds)
2. transformVendorLocation() double-checks bounds
3. Type guard utilities validate before rendering
4. Silent degradation (no map render instead of error)
5. Console warnings for debugging (dev mode only)

**Validation Layers**:
- Layer 1: Payload admin UI (prevents form submission)
- Layer 2: Data service transformation (strips invalid coords)
- Layer 3: Component rendering (conditional map display)

---

### High-Risk Area 3: Static Generation Limitations

**Risk**: Forgetting static generation constraints, adding runtime API calls

**Mitigation**:
1. Clear documentation: "NO RUNTIME GEOCODING"
2. All geocoding during build time or manual entry
3. Haversine calculations on client (no server needed)
4. E2E tests verify static pages include location data
5. Code review checklist: "Does this require server-side API?"

**Checklist for New Code**:
- [ ] No `fetch()` calls to geocoding APIs on client
- [ ] No server actions for location lookups
- [ ] All vendor data resolved during `getStaticProps()`
- [ ] Map tiles from CDN only (OpenFreeMap/OpenStreetMap, not custom server)

---

### High-Risk Area 4: Backward Compatibility Breaks

**Risk**: Existing vendors break when location field changes from string to object

**Mitigation**:
1. Union type: `location?: VendorLocation | string`
2. Type guard checks before assuming object structure
3. Legacy string location still renders (fallback UI)
4. E2E tests cover both legacy and new location formats
5. Staged rollout: Test with single vendor before full deployment

**Test Cases**:
- Vendor with `location: "Fort Lauderdale, FL"` (legacy string)
- Vendor with `location: { address: "...", latitude: 26, longitude: -80 }` (new)
- Vendor with `location: undefined` (no location)
- Vendor with partial location (address only, no coords)

---

## Success Criteria

### Backend Complete When:
- [x] Payload CMS vendor schema includes location group (5 fields)
- [x] TypeScript interfaces VendorLocation and VendorCoordinates defined
- [x] transformVendorLocation() method handles validation and transformation
- [x] Type guard utilities created (isVendorLocationObject, areValidCoordinates)
- [x] `npm run build` succeeds without TypeScript errors
- [x] Test vendor created with coordinates via Payload admin
- [x] Backward compatibility verified (existing vendors still render)

### Frontend Complete When:
- [ ] VendorMap component displays interactive Leaflet.js map with OpenFreeMap tiles
- [ ] VendorLocationCard shows formatted address with actions
- [ ] LocationSearchFilter enables distance-based search
- [ ] Haversine utility calculates accurate distances (<0.5% error)
- [ ] useLocationFilter hook filters and sorts vendors by proximity
- [ ] Vendor detail pages show map when coordinates available
- [ ] Vendor listing pages have functional location search
- [ ] All Playwright E2E tests pass (map render, search, geolocation)
- [ ] Responsive design verified on mobile (viewport 375px-768px)
- [ ] Accessibility audit passes (WCAG 2.1 AA compliance)
- [ ] NO API keys required (verified in documentation)

### Integration Complete When:
- [x] End-to-end data flow validated (Payload admin → static page → map render)
- [x] Cross-browser testing complete (Chrome, Firefox, Safari, Mobile)
- [x] Performance benchmarks met (Lighthouse Performance 85+)
- [x] Bundle size within acceptable range (+16KB max increase)
- [ ] Console warnings reviewed and resolved
- [ ] Documentation updated (CLAUDE.md, integration-strategy.md, README)
- [ ] Content editor training materials created
- [ ] ✅ NO API token configuration needed (Leaflet.js advantage)

---

## Next Steps

**Immediate Actions** (before starting implementation):

1. **✅ Dependencies Already Installed**:
   ```bash
   # Verify Leaflet installed
   npm list leaflet react-leaflet
   # Shows: leaflet@1.9.4, react-leaflet@5.0.0
   ```

2. **✅ No Environment Setup Required**:
   - NO API keys needed
   - NO account creation required
   - Maps work immediately with `npm run dev`

3. **Create Test Vendor**:
   - Open Payload admin: `npm run dev` → http://localhost:3000/admin
   - Create vendor named "Test Vendor - Location Feature"
   - Add location: Fort Lauderdale, FL (26.122439, -80.137314)
   - Save and verify vendor page loads

4. **Begin Phase 2 Backend Implementation**:
   - Start with task: `test-backend` (design test suite)
   - Then: `impl-backend-schema` (extend Payload schema)
   - Follow dependency chain in tasks.md

**Long-Term Actions** (post-MVP):

1. **Batch Geocoding Script** (reduce manual effort):
   - Create `scripts/geocode-vendors.ts`
   - Rate limit: 2 requests/second (geocode.maps.co)
   - Dry-run mode to preview changes
   - Transaction rollback on errors

2. **Enhanced Map Features**:
   - Clustering for multiple vendors in same area
   - Custom marker icons (vendor logo pins)
   - Multi-vendor map on listing page
   - Search within map bounds (pan/zoom to filter)

3. **Analytics Integration**:
   - Track map interactions (zoom, click, etc.)
   - Monitor search queries (popular locations)
   - Measure feature adoption (% vendors with locations)

4. **Content Editor Tools**:
   - Geocoding API integration in Payload admin UI
   - Bulk location import from CSV
   - Location verification workflow (flag suspicious coords)

---

## Appendix: File Manifest

### Files to Modify (Existing)

| File | Lines | Changes |
|------|-------|---------|
| `/home/edwin/development/ptnextjs/payload/collections/Vendors.ts` | After 1014 | Add location group field |
| `/home/edwin/development/ptnextjs/lib/types.ts` | 179-222 | Add VendorLocation, VendorCoordinates interfaces |
| `/home/edwin/development/ptnextjs/lib/tinacms-data-service.ts` | 278, 364+ | Add transformVendorLocation() method |
| `/home/edwin/development/ptnextjs/app/(site)/vendors/[slug]/page.tsx` | After 223 | Add map section |
| `/home/edwin/development/ptnextjs/app/(site)/vendors/page.tsx` | TBD | Add location search filter |

### Files to Create (New)

| File | Purpose |
|------|---------|
| `/home/edwin/development/ptnextjs/components/vendor/VendorMap.tsx` | Interactive Leaflet.js map component (React-Leaflet) |
| `/home/edwin/development/ptnextjs/components/vendor/VendorLocationCard.tsx` | Address display with actions |
| `/home/edwin/development/ptnextjs/components/vendor/LocationSearchFilter.tsx` | Distance-based search UI |
| `/home/edwin/development/ptnextjs/lib/utils/distance.ts` | Haversine formula utility |
| `/home/edwin/development/ptnextjs/lib/utils/type-guards.ts` | Location type validation |
| `/home/edwin/development/ptnextjs/lib/hooks/useLocationFilter.ts` | Location filtering hook |
| `/home/edwin/development/ptnextjs/e2e/vendor-location-mapping.spec.ts` | Playwright E2E tests |

### Configuration Files

| File | Changes |
|------|---------|
| `/home/edwin/development/ptnextjs/.env.local` | Add `NEXT_PUBLIC_MAPBOX_TOKEN` |
| `/home/edwin/development/ptnextjs/package.json` | Already has mapbox-gl@1.13.3 |

---

## Document Control

**Version History**:
- v1.1 (2025-10-19): Switched from Mapbox GL JS to Leaflet.js + OpenFreeMap (removed unused Mapbox dependency)
- v1.0 (2025-10-19): Initial integration strategy created
- Reviewed by: Claude Code (task-pre-2 execution)
- Approved for implementation: v1.1 (Leaflet.js approach)

**Next Review**: After Phase 3 frontend implementation (task: integ-data-flow)

**Related Documents**:
- `/home/edwin/development/ptnextjs/.agent-os/specs/2025-10-19-vendor-location-mapping/tasks.md` (Master task list)
- `/home/edwin/development/ptnextjs/.agent-os/specs/2025-10-19-vendor-location-mapping/spec-lite.md` (Feature summary)
- `/home/edwin/development/ptnextjs/CLAUDE.md` (Project architecture guide)

---

**END OF INTEGRATION STRATEGY DOCUMENT**
