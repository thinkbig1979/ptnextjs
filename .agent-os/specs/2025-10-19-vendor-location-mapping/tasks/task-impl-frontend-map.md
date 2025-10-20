# Task: Create VendorMap Component (Leaflet.js)

**Task ID**: impl-frontend-map
**Phase**: Phase 3 - Frontend Implementation (Map Components & UI)
**Agent**: frontend-react-specialist
**Estimated Time**: 2 hours
**Dependencies**: test-frontend

## Objective

Create a reusable VendorMap React component that displays vendor locations using Leaflet.js with React-Leaflet and OpenFreeMap tiles. **NO API KEY REQUIRED** - uses free OpenStreetMap tiles.

## Context Requirements

**Files to Review**:
- `/home/edwin/development/ptnextjs/components/` (shadcn/ui component patterns)
- `/home/edwin/development/ptnextjs/lib/types.ts` (Vendor interface with coordinates)
- `/home/edwin/development/ptnextjs/.agent-os/specs/2025-10-19-vendor-location-mapping/sub-specs/technical-spec.md`

**Map Library**: Use **Leaflet.js** with **React-Leaflet** and **OpenFreeMap** tiles

## Dependencies to Install

```bash
npm install leaflet@1.9.4 react-leaflet@5.0.0
npm install --save-dev @types/leaflet
```

## Component Specification

### File Location

Create: `/home/edwin/development/ptnextjs/components/VendorMap.tsx`

### Component Interface

```typescript
import { VendorCoordinates } from '@/lib/types';

interface VendorMapProps {
  /** Vendor name for display in marker popup */
  name: string;
  /** Geographic coordinates */
  coordinates: VendorCoordinates;
  /** Optional className for styling */
  className?: string;
  /** Optional zoom level (default: 13) */
  zoom?: number;
  /** Optional map height (default: "400px") */
  height?: string;
}

export function VendorMap({
  name,
  coordinates,
  className,
  zoom = 13,
  height = "400px"
}: VendorMapProps): JSX.Element;
```

### Implementation

```typescript
'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { VendorCoordinates } from '@/lib/types';

// Fix for default marker icons in Next.js
// This is required because Webpack doesn't properly bundle Leaflet's marker images
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

interface VendorMapProps {
  name: string;
  coordinates: VendorCoordinates;
  className?: string;
  zoom?: number;
  height?: string;
}

export function VendorMap({
  name,
  coordinates,
  className = '',
  zoom = 13,
  height = '400px',
}: VendorMapProps) {
  // Validate coordinates
  const { latitude, longitude } = coordinates;

  if (
    latitude < -90 || latitude > 90 ||
    longitude < -180 || longitude > 180
  ) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ height }}
        data-testid="vendor-map-error"
      >
        <div className="text-center p-6">
          <p className="text-gray-600 text-sm">
            Invalid coordinates: {latitude}, {longitude}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`vendor-map-wrapper rounded-lg overflow-hidden shadow-md ${className}`}
      style={{ height }}
      data-testid="vendor-map"
    >
      <MapContainer
        center={[latitude, longitude]}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        className="vendor-map-container"
        attributionControl={true}
        aria-label={`Map showing location of ${name}`}
      >
        {/* OpenFreeMap tiles - NO API KEY REQUIRED */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tiles.openfreemap.org/osm/{z}/{x}/{y}.png"
          maxZoom={19}
          minZoom={1}
        />

        {/* Vendor location marker */}
        <Marker position={[latitude, longitude]}>
          <Popup>
            <div className="vendor-map-popup">
              <h3 className="font-semibold text-sm mb-1">{name}</h3>
              <p className="text-xs text-gray-600">
                {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
```

### Marker Icon Setup

Leaflet requires marker icon images to be available in the public directory. Create the following structure:

**File Location**: `/home/edwin/development/ptnextjs/public/leaflet/`

Download the default Leaflet marker icons and place them in this directory:
- `marker-icon.png` (25x41px)
- `marker-icon-2x.png` (50x82px - retina display)
- `marker-shadow.png` (41x41px)

These icons are available from the Leaflet repository:
https://github.com/Leaflet/Leaflet/tree/main/dist/images

**Alternative**: Create custom marker icons that match your brand colors.

### Styling

The component uses Tailwind CSS classes and Leaflet's default styles. No additional CSS file is required, but you can add custom styles if needed:

```css
/* Optional: Add to global CSS if you want to customize Leaflet controls */
.vendor-map-container .leaflet-control-attribution {
  font-size: 10px;
  background-color: rgba(255, 255, 255, 0.8);
}

.vendor-map-container .leaflet-popup-content-wrapper {
  border-radius: 8px;
}

.vendor-map-popup h3 {
  margin: 0 0 4px 0;
}

.vendor-map-popup p {
  margin: 0;
}
```

## File Structure

```
components/
└── VendorMap.tsx          # Main component

public/leaflet/
├── marker-icon.png        # Default marker (25x41px)
├── marker-icon-2x.png     # Retina marker (50x82px)
└── marker-shadow.png      # Marker shadow (41x41px)
```

## Usage Example

```typescript
import { VendorMap } from '@/components/VendorMap';
import { Vendor } from '@/lib/types';

export default function VendorDetailPage({ vendor }: { vendor: Vendor }) {
  if (!vendor.coordinates) {
    return <p>Location: {vendor.location}</p>;
  }

  return (
    <div>
      <h2>{vendor.name}</h2>
      <VendorMap
        name={vendor.name}
        coordinates={vendor.coordinates}
        height="500px"
        zoom={14}
        className="my-6"
      />
    </div>
  );
}
```

## Testing Steps

### 1. Component Render Test

```bash
cd /home/edwin/development/ptnextjs
npm run dev
```

Navigate to test vendor: `http://localhost:3000/vendors/test-full-location`

**Expected Result**:
- Map loads showing OpenStreetMap tiles
- Blue marker appears at vendor location
- Click marker to see popup with vendor name and coordinates
- Map is responsive and interactive

### 2. Visual Verification with Playwright

```typescript
// tests/e2e/vendor-map.spec.ts
import { test, expect } from '@playwright/test';

test('VendorMap renders correctly', async ({ page }) => {
  await page.goto('/vendors/test-full-location');

  // Map container should be visible
  await expect(page.locator('[data-testid="vendor-map"]')).toBeVisible();

  // Leaflet map should load
  await expect(page.locator('.leaflet-container')).toBeVisible();

  // Marker should be present
  await expect(page.locator('.leaflet-marker-icon')).toBeVisible();

  // Tiles should load
  await expect(page.locator('.leaflet-tile-container')).toBeVisible();

  // Screenshot for visual verification
  await page.screenshot({ path: 'test-results/vendor-map-leaflet.png' });
});

test('VendorMap marker popup works', async ({ page }) => {
  await page.goto('/vendors/test-full-location');

  // Click the marker
  await page.locator('.leaflet-marker-icon').click();

  // Popup should appear
  await expect(page.locator('.leaflet-popup')).toBeVisible();
  await expect(page.locator('.vendor-map-popup h3')).toBeVisible();
  await expect(page.locator('.vendor-map-popup p')).toBeVisible();
});

test('VendorMap shows error with invalid coordinates', async ({ page }) => {
  // This would require a test vendor with invalid coordinates
  // Create content/vendors/test-invalid-coords.md with latitude: 999

  await page.goto('/vendors/test-invalid-coords');

  // Should show error message
  await expect(page.locator('[data-testid="vendor-map-error"]')).toBeVisible();
  await expect(page.locator('text=Invalid coordinates')).toBeVisible();
});

test('VendorMap is responsive on mobile', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/vendors/test-full-location');

  // Map should still be visible and functional
  await expect(page.locator('[data-testid="vendor-map"]')).toBeVisible();
  await expect(page.locator('.leaflet-container')).toBeVisible();

  // Test touch interaction (marker click)
  await page.locator('.leaflet-marker-icon').tap();
  await expect(page.locator('.leaflet-popup')).toBeVisible();
});
```

Run tests:
```bash
npm run test:e2e # or playwright test
```

### 3. Accessibility Test

```bash
# Use Playwright accessibility testing
npx playwright test --project=chromium vendor-map.spec.ts
```

Verify:
- [ ] Map has aria-label
- [ ] Keyboard navigation works (Tab to marker, Enter to open popup)
- [ ] Screen reader announces location
- [ ] Sufficient color contrast in popup

## Acceptance Criteria

- [ ] VendorMap component created at `/home/edwin/development/ptnextjs/components/VendorMap.tsx`
- [ ] Component uses leaflet@1.9.4 and react-leaflet@5.0.0
- [ ] Uses OpenFreeMap tiles - **NO API KEY REQUIRED**
- [ ] Accepts name and coordinates props
- [ ] Validates coordinate ranges (-90 to 90, -180 to 180)
- [ ] Displays error state for invalid coordinates
- [ ] Renders Leaflet map centered on coordinates
- [ ] Adds marker at vendor location
- [ ] Marker click shows popup with vendor name and coordinates
- [ ] Includes default Leaflet zoom controls
- [ ] Responsive design (works on mobile)
- [ ] Accessible (aria-label, keyboard navigation)
- [ ] data-testid attributes added for testing
- [ ] Marker icons properly configured in public/leaflet/
- [ ] TypeScript types are correct
- [ ] Component compiles without errors
- [ ] Playwright tests verify map display and interactions
- [ ] No console errors or warnings

## Performance Considerations

- MapContainer mounts once and manages map instance lifecycle
- React-Leaflet handles cleanup automatically
- Leaflet is lightweight (~150KB minified+gzipped vs Mapbox's ~500KB)
- No API calls or rate limiting to worry about
- Tiles are cached by browser automatically
- Consider lazy loading component if used in lists
- Component is client-side only ('use client' directive required)

## Accessibility Requirements

- [ ] aria-label on map container describing location
- [ ] Keyboard navigation for map controls (zoom in/out with +/- keys)
- [ ] Popup content is screen-reader accessible
- [ ] Sufficient color contrast for markers and popups
- [ ] Focus indicators visible on interactive elements

## Browser Compatibility

Leaflet supports a wide range of browsers:
- Chrome/Edge (latest and previous version)
- Firefox (latest and previous version)
- Safari 12+ (desktop and iOS)
- iOS Safari 12+ (full touch support)
- Android Chrome (latest)
- IE 11 (with polyfills, though Next.js 14 drops IE support)

Leaflet has **better browser compatibility** than Mapbox GL JS, especially on older devices and browsers.

## Notes

### Why Leaflet.js over Mapbox GL JS?

**Advantages**:
- **No API key required** - completely free, no rate limits
- **Smaller bundle size** - ~150KB vs ~500KB for Mapbox
- **Better browser support** - works on older devices
- **Open source and free** - no vendor lock-in
- **Privacy-friendly** - no tracking or analytics
- **React-Leaflet** provides excellent React integration with declarative components

**Trade-offs**:
- Less "flashy" 3D features than Mapbox (but not needed for simple location display)
- Slightly less smooth animations (but still excellent for most use cases)

### Important Implementation Details

1. **Client-side only**: Component uses 'use client' directive (required for React-Leaflet)
2. **Icon fix required**: Webpack bundling in Next.js breaks default Leaflet icons, must configure manually
3. **OpenFreeMap tiles**: Free, fast, no registration required
4. **Declarative components**: React-Leaflet uses MapContainer, TileLayer, Marker, Popup components
5. **No environment variables needed**: Zero configuration required

### Optional Enhancements

Consider adding these features in future iterations:
- Custom marker icons with brand colors
- Map clustering for multiple vendors
- Geolocation to show user's position
- Different map styles (satellite, terrain)
- Export map as static image
- Distance calculation from user location

### Development Tips

1. Always include marker icon files in public/leaflet/
2. Test on mobile devices for touch interactions
3. Use scrollWheelZoom={false} to prevent accidental zooming
4. Consider adding loading state if map takes time to render
5. Add error boundaries for production resilience
