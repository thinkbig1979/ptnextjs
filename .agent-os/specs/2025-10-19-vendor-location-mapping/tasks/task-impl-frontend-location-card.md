# Task: Create VendorLocationCard Component

**Task ID**: impl-frontend-location-card
**Phase**: Phase 3 - Frontend Implementation (Map Components & UI)
**Agent**: frontend-react-specialist
**Estimated Time**: 2 hours
**Dependencies**: impl-frontend-map

## Objective

Create a VendorLocationCard component that displays location information, structured address, and provides a "Get Directions" link to Google Maps.

## Context Requirements

**Files to Review**:
- `/home/edwin/development/ptnextjs/components/` (shadcn/ui component patterns)
- `/home/edwin/development/ptnextjs/lib/types.ts` (Vendor, VendorAddress, VendorCoordinates interfaces)
- `/home/edwin/development/ptnextjs/app/(site)/vendors/[slug]/page.tsx` (current location display)

**Design Pattern**: Use shadcn/ui Card component

## Component Specification

### File Location

Create: `/home/edwin/development/ptnextjs/components/VendorLocationCard.tsx`

### Component Interface

```typescript
import { VendorCoordinates, VendorAddress } from '@/lib/types';

interface VendorLocationCardProps {
  /** Vendor name for display */
  name: string;
  /** Display location string */
  location?: string;
  /** Geographic coordinates */
  coordinates?: VendorCoordinates;
  /** Structured address data */
  address?: VendorAddress;
  /** Optional distance from user location (in km) */
  distance?: number;
  /** Optional className for styling */
  className?: string;
}

export function VendorLocationCard({
  name,
  location,
  coordinates,
  address,
  distance,
  className
}: VendorLocationCardProps): JSX.Element;
```

### Implementation

```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { VendorCoordinates, VendorAddress } from '@/lib/types';

interface VendorLocationCardProps {
  name: string;
  location?: string;
  coordinates?: VendorCoordinates;
  address?: VendorAddress;
  distance?: number;
  className?: string;
}

export function VendorLocationCard({
  name,
  location,
  coordinates,
  address,
  distance,
  className = '',
}: VendorLocationCardProps) {
  // Format country code to country name (basic implementation)
  const getCountryName = (code?: string): string | undefined => {
    if (!code) return undefined;
    const countries: Record<string, string> = {
      US: 'United States',
      MC: 'Monaco',
      IT: 'Italy',
      FR: 'France',
      GB: 'United Kingdom',
      ES: 'Spain',
      DE: 'Germany',
      // Add more as needed
    };
    return countries[code.toUpperCase()] || code;
  };

  // Generate Google Maps directions URL
  const getDirectionsUrl = (): string | null => {
    if (!coordinates) return null;
    const { latitude, longitude } = coordinates;
    const query = encodeURIComponent(name);
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&query=${query}`;
  };

  // Format address for display
  const formatAddress = (): string[] => {
    if (!address) return [];
    const lines: string[] = [];

    if (address.street) lines.push(address.street);

    const cityStateLine = [address.city, address.state]
      .filter(Boolean)
      .join(', ');
    if (cityStateLine) lines.push(cityStateLine);

    if (address.postalCode) {
      lines.push(address.postalCode);
    }

    const country = getCountryName(address.country);
    if (country) lines.push(country);

    return lines;
  };

  const addressLines = formatAddress();
  const directionsUrl = getDirectionsUrl();

  return (
    <Card className={className} data-testid="vendor-location-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="w-5 h-5 text-primary" />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display Location String */}
        {location && (
          <div data-testid="vendor-location">
            <p className="text-sm font-medium text-gray-700">Location</p>
            <p className="text-base">{location}</p>
          </div>
        )}

        {/* Display Distance (if calculated) */}
        {distance !== undefined && (
          <div data-testid="vendor-distance" className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-blue-600" />
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{distance.toFixed(1)} km</span> away
            </p>
          </div>
        )}

        {/* Display Structured Address */}
        {addressLines.length > 0 && (
          <div data-testid="vendor-address">
            <p className="text-sm font-medium text-gray-700 mb-1">Address</p>
            <address className="not-italic text-sm text-gray-600">
              {addressLines.map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </address>
          </div>
        )}

        {/* Display Coordinates */}
        {coordinates && (
          <div data-testid="vendor-coordinates">
            <p className="text-sm font-medium text-gray-700 mb-1">Coordinates</p>
            <p className="text-xs font-mono text-gray-500">
              {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
            </p>
          </div>
        )}

        {/* Get Directions Button */}
        {directionsUrl && (
          <Button
            asChild
            variant="outline"
            className="w-full"
            data-testid="get-directions"
          >
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              Get Directions
              <ExternalLink className="w-3 h-3" />
            </a>
          </Button>
        )}

        {/* Fallback message if no location data */}
        {!location && !coordinates && !addressLines.length && (
          <p className="text-sm text-gray-500 italic">
            Location information not available
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

## Required shadcn/ui Components

Ensure these shadcn/ui components are installed:

```bash
# If not already installed
npx shadcn-ui@latest add card
npx shadcn-ui@latest add button
```

## Icons

Uses **lucide-react** icons (should already be installed with shadcn/ui):
- `MapPin` - Location icon
- `Navigation` - Directions/distance icon
- `ExternalLink` - External link indicator

## Usage Examples

### Example 1: Full Location Data

```typescript
<VendorLocationCard
  name="Test Vendor Monaco"
  location="Monaco"
  coordinates={{ latitude: 43.7384, longitude: 7.4246 }}
  address={{
    street: "10 Port de Fontvieille",
    city: "Monaco",
    country: "MC"
  }}
  distance={42.5}
/>
```

### Example 2: Coordinates Only

```typescript
<VendorLocationCard
  name="Test Vendor"
  location="Fort Lauderdale, Florida"
  coordinates={{ latitude: 26.1224, longitude: -80.1373 }}
/>
```

### Example 3: Legacy Vendor (Location String Only)

```typescript
<VendorLocationCard
  name="Legacy Vendor"
  location="Miami, Florida"
/>
```

### Example 4: In Vendor Detail Page

```typescript
// app/(site)/vendors/[slug]/page.tsx
import { VendorLocationCard } from '@/components/VendorLocationCard';

export default function VendorDetailPage({ vendor }: { vendor: Vendor }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Other vendor info */}

      <VendorLocationCard
        name={vendor.name}
        location={vendor.location}
        coordinates={vendor.coordinates}
        address={vendor.address}
        className="md:col-span-1"
      />
    </div>
  );
}
```

## Testing Steps

### 1. Visual Testing with Playwright

```typescript
// tests/e2e/vendor-location-card.spec.ts
import { test, expect } from '@playwright/test';

test('displays full location data', async ({ page }) => {
  await page.goto('/vendors/test-full-location');

  const card = page.locator('[data-testid="vendor-location-card"]');
  await expect(card).toBeVisible();

  // Check location string
  await expect(page.locator('[data-testid="vendor-location"]')).toContainText('Monaco');

  // Check address
  await expect(page.locator('[data-testid="vendor-address"]')).toBeVisible();

  // Check coordinates
  await expect(page.locator('[data-testid="vendor-coordinates"]')).toContainText('43.7384, 7.4246');

  // Check directions button
  const directionsBtn = page.locator('[data-testid="get-directions"]');
  await expect(directionsBtn).toBeVisible();

  const href = await directionsBtn.getAttribute('href');
  expect(href).toContain('google.com/maps');
  expect(href).toContain('43.7384');
});

test('handles legacy vendor without coordinates', async ({ page }) => {
  await page.goto('/vendors/test-legacy-vendor');

  const card = page.locator('[data-testid="vendor-location-card"]');
  await expect(card).toBeVisible();

  // Location string should show
  await expect(page.locator('[data-testid="vendor-location"]')).toContainText('Miami, Florida');

  // Coordinates and directions should not show
  await expect(page.locator('[data-testid="vendor-coordinates"]')).not.toBeVisible();
  await expect(page.locator('[data-testid="get-directions"]')).not.toBeVisible();
});

test('displays distance when provided', async ({ page }) => {
  // This requires location search integration
  // Test after implementing search functionality
});
```

Run tests:
```bash
npx playwright test vendor-location-card.spec.ts
```

### 2. Component Render Test

```bash
npm run dev
# Navigate to http://localhost:3000/vendors/test-full-location
```

Verify:
- [ ] Card renders with header "Location"
- [ ] Location string displays
- [ ] Address displays on separate lines
- [ ] Coordinates display in mono font
- [ ] Get Directions button visible and clickable
- [ ] Button opens Google Maps in new tab

### 3. Accessibility Test

```bash
npx playwright test --project=chromium vendor-location-card.spec.ts
```

Check:
- [ ] Semantic HTML (<address> tag)
- [ ] Proper heading structure
- [ ] Button has accessible text
- [ ] Icons have proper aria-labels

## Acceptance Criteria

- [ ] VendorLocationCard component created at `/home/edwin/development/ptnextjs/components/VendorLocationCard.tsx`
- [ ] Uses shadcn/ui Card component
- [ ] Displays location string when available
- [ ] Displays formatted address when available
- [ ] Displays coordinates in readable format
- [ ] Shows distance when provided
- [ ] "Get Directions" button links to Google Maps
- [ ] Google Maps link includes correct coordinates
- [ ] Link opens in new tab with noopener noreferrer
- [ ] Handles missing data gracefully (shows fallback message)
- [ ] Country codes converted to country names
- [ ] Address formatted with proper line breaks
- [ ] data-testid attributes for all sections
- [ ] TypeScript types are correct
- [ ] Component compiles without errors
- [ ] Playwright tests verify display and functionality
- [ ] Responsive design (works on mobile)
- [ ] Accessible (semantic HTML, proper ARIA)

## Edge Cases to Handle

- [ ] No location data at all (show fallback message)
- [ ] Coordinates but no address (show coordinates only)
- [ ] Address but no coordinates (show address, no directions button)
- [ ] Unknown country code (display code as-is)
- [ ] Very long addresses (ensure proper wrapping)
- [ ] Partial address data (city but no street)

## Country Code Expansion

Consider creating a separate utility file for country code mapping:

```typescript
// lib/country-codes.ts
export const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States',
  MC: 'Monaco',
  IT: 'Italy',
  FR: 'France',
  GB: 'United Kingdom',
  // ... expand as needed
};

export function getCountryName(code?: string): string | undefined {
  if (!code) return undefined;
  return COUNTRY_NAMES[code.toUpperCase()] || code;
}
```

## Notes

- Component is client-side ('use client') for interactivity
- Uses lucide-react icons (installed with shadcn/ui)
- Google Maps URL format: https://developers.google.com/maps/documentation/urls/get-started
- Consider adding Apple Maps option for iOS users
- Consider adding copy coordinates to clipboard feature
- Keep styling consistent with existing design system
