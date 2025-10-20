# Task: Create LocationSearchFilter Component

**Task ID**: impl-frontend-search
**Phase**: Phase 3 - Frontend Implementation (Map Components & UI)
**Agent**: frontend-react-specialist
**Estimated Time**: 3 hours
**Dependencies**: impl-frontend-location-card

## Objective

Create a LocationSearchFilter component that allows users to search for vendors by location proximity using coordinates input and distance radius.

## Context Requirements

**Files to Review**:
- `/home/edwin/development/ptnextjs/app/(site)/vendors/page.tsx` (current vendor list page)
- `/home/edwin/development/ptnextjs/components/` (shadcn/ui component patterns)
- `/home/edwin/development/ptnextjs/lib/types.ts` (Vendor interface)

**Design Pattern**: Use shadcn/ui Input, Slider, and Button components

## Component Specification

### File Location

Create: `/home/edwin/development/ptnextjs/components/LocationSearchFilter.tsx`

### Component Interface

```typescript
import { VendorCoordinates } from '@/lib/types';

interface LocationSearchFilterProps {
  /** Callback when search is triggered */
  onSearch: (userLocation: VendorCoordinates, distance: number) => void;
  /** Callback when filters are reset */
  onReset: () => void;
  /** Number of results currently shown */
  resultCount?: number;
  /** Total number of vendors available */
  totalCount?: number;
  /** Optional className for styling */
  className?: string;
}

export function LocationSearchFilter({
  onSearch,
  onReset,
  resultCount,
  totalCount,
  className
}: LocationSearchFilterProps): JSX.Element;
```

### Implementation

```typescript
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { MapPin, Search, X, AlertCircle } from 'lucide-react';
import { VendorCoordinates } from '@/lib/types';

interface LocationSearchFilterProps {
  onSearch: (userLocation: VendorCoordinates, distance: number) => void;
  onReset: () => void;
  resultCount?: number;
  totalCount?: number;
  className?: string;
}

export function LocationSearchFilter({
  onSearch,
  onReset,
  resultCount,
  totalCount,
  className = '',
}: LocationSearchFilterProps) {
  const [locationInput, setLocationInput] = useState('');
  const [distance, setDistance] = useState<number>(100); // Default 100km
  const [error, setError] = useState<string | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Parse location input (expects "latitude, longitude" format)
  const parseLocationInput = (input: string): VendorCoordinates | null => {
    // Remove whitespace and split by comma
    const parts = input.trim().split(',').map(p => p.trim());

    if (parts.length !== 2) {
      setError('Please enter coordinates as: latitude, longitude');
      return null;
    }

    const latitude = parseFloat(parts[0]);
    const longitude = parseFloat(parts[1]);

    // Validate coordinates
    if (isNaN(latitude) || isNaN(longitude)) {
      setError('Invalid coordinates. Please enter valid numbers.');
      return null;
    }

    if (latitude < -90 || latitude > 90) {
      setError('Latitude must be between -90 and 90');
      return null;
    }

    if (longitude < -180 || longitude > 180) {
      setError('Longitude must be between -180 and 180');
      return null;
    }

    return { latitude, longitude };
  };

  const handleSearch = () => {
    setError(null);

    const userLocation = parseLocationInput(locationInput);
    if (!userLocation) return;

    setIsSearchActive(true);
    onSearch(userLocation, distance);
  };

  const handleReset = () => {
    setLocationInput('');
    setDistance(100);
    setError(null);
    setIsSearchActive(false);
    onReset();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Format result count message
  const getResultMessage = (): string | null => {
    if (!isSearchActive || resultCount === undefined) return null;

    if (resultCount === 0) {
      return `No vendors found within ${distance}km`;
    }

    if (totalCount !== undefined) {
      return `Showing ${resultCount} of ${totalCount} vendors within ${distance}km`;
    }

    return `${resultCount} vendors found within ${distance}km`;
  };

  const resultMessage = getResultMessage();

  return (
    <Card className={className} data-testid="location-search-filter">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Search by Location
        </CardTitle>
        <CardDescription>
          Find vendors near you by entering coordinates and distance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location Input */}
        <div className="space-y-2">
          <Label htmlFor="location-input">
            Your Location (Latitude, Longitude)
          </Label>
          <Input
            id="location-input"
            type="text"
            placeholder="e.g., 43.7384, 7.4246"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onKeyPress={handleKeyPress}
            data-testid="location-input"
            aria-describedby="location-help"
          />
          <p id="location-help" className="text-xs text-gray-500">
            Use Google Maps to find your coordinates: right-click on map → "What's here?"
          </p>
        </div>

        {/* Distance Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="distance-slider">
              Distance Radius
            </Label>
            <span className="text-sm font-medium" data-testid="distance-value">
              {distance} km
            </span>
          </div>
          <Slider
            id="distance-slider"
            min={10}
            max={500}
            step={10}
            value={[distance]}
            onValueChange={(value) => setDistance(value[0])}
            data-testid="distance-slider"
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>10 km</span>
            <span>500 km</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md"
            data-testid="error-message"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Result Count */}
        {resultMessage && (
          <div
            className="p-3 bg-blue-50 border border-blue-200 rounded-md"
            data-testid="result-count"
          >
            <p className="text-sm text-blue-800">{resultMessage}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleSearch}
            disabled={!locationInput.trim()}
            className="flex-1"
            data-testid="search-button"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          {isSearchActive && (
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex-1"
              data-testid="reset-button"
            >
              <X className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

## Required shadcn/ui Components

Ensure these components are installed:

```bash
# If not already installed
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add button
npx shadcn-ui@latest add slider
npx shadcn-ui@latest add label
```

## Usage Example

```typescript
// app/(site)/vendors/page.tsx
'use client';

import { useState } from 'react';
import { LocationSearchFilter } from '@/components/LocationSearchFilter';
import { useLocationFilter } from '@/hooks/useLocationFilter';
import { Vendor, VendorCoordinates } from '@/lib/types';

export default function VendorsPage({ vendors }: { vendors: Vendor[] }) {
  const [userLocation, setUserLocation] = useState<VendorCoordinates | null>(null);
  const [maxDistance, setMaxDistance] = useState<number>(100);

  const { filteredVendors } = useLocationFilter(vendors, userLocation, maxDistance);

  const handleSearch = (location: VendorCoordinates, distance: number) => {
    setUserLocation(location);
    setMaxDistance(distance);
  };

  const handleReset = () => {
    setUserLocation(null);
    setMaxDistance(100);
  };

  const displayVendors = userLocation ? filteredVendors : vendors;

  return (
    <div className="container mx-auto py-8">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Search Filter Sidebar */}
        <aside className="md:col-span-1">
          <LocationSearchFilter
            onSearch={handleSearch}
            onReset={handleReset}
            resultCount={displayVendors.length}
            totalCount={vendors.length}
          />
        </aside>

        {/* Vendor List */}
        <div className="md:col-span-2">
          {/* Render vendor cards */}
        </div>
      </div>
    </div>
  );
}
```

## Testing Steps

### 1. Playwright E2E Tests

```typescript
// tests/e2e/location-search.spec.ts
import { test, expect } from '@playwright/test';

test('performs location search successfully', async ({ page }) => {
  await page.goto('/vendors');

  // Verify filter component is visible
  await expect(page.locator('[data-testid="location-search-filter"]')).toBeVisible();

  // Enter coordinates (Monaco)
  await page.fill('[data-testid="location-input"]', '43.7384, 7.4246');

  // Adjust distance slider to 200km
  const slider = page.locator('[data-testid="distance-slider"]');
  await slider.fill('200'); // Set slider value

  // Verify distance value updated
  await expect(page.locator('[data-testid="distance-value"]')).toContainText('200 km');

  // Click search button
  await page.click('[data-testid="search-button"]');

  // Verify result count appears
  await expect(page.locator('[data-testid="result-count"]')).toBeVisible();

  // Verify vendors are filtered
  const vendorCards = page.locator('[data-testid="vendor-card"]');
  const count = await vendorCards.count();
  expect(count).toBeGreaterThan(0);
});

test('shows validation error for invalid coordinates', async ({ page }) => {
  await page.goto('/vendors');

  // Enter invalid coordinates
  await page.fill('[data-testid="location-input"]', '100, 200');

  // Click search
  await page.click('[data-testid="search-button"]');

  // Verify error message
  await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  await expect(page.locator('[data-testid="error-message"]')).toContainText('Latitude must be between -90 and 90');
});

test('resets filters correctly', async ({ page }) => {
  await page.goto('/vendors');

  // Perform search
  await page.fill('[data-testid="location-input"]', '43.7384, 7.4246');
  await page.click('[data-testid="search-button"]');

  // Verify reset button appears
  await expect(page.locator('[data-testid="reset-button"]')).toBeVisible();

  // Click reset
  await page.click('[data-testid="reset-button"]');

  // Verify input cleared
  await expect(page.locator('[data-testid="location-input"]')).toHaveValue('');

  // Verify reset button hidden
  await expect(page.locator('[data-testid="reset-button"]')).not.toBeVisible();
});

test('keyboard Enter key triggers search', async ({ page }) => {
  await page.goto('/vendors');

  await page.fill('[data-testid="location-input"]', '43.7384, 7.4246');

  // Press Enter
  await page.press('[data-testid="location-input"]', 'Enter');

  // Verify search executed
  await expect(page.locator('[data-testid="result-count"]')).toBeVisible();
});
```

Run tests:
```bash
npx playwright test location-search.spec.ts
```

### 2. Manual Testing Checklist

```bash
npm run dev
# Navigate to http://localhost:3000/vendors
```

Test scenarios:
- [ ] Enter valid coordinates → Search works
- [ ] Enter invalid latitude (>90) → Error shown
- [ ] Enter invalid longitude (>180) → Error shown
- [ ] Enter malformed input ("abc, def") → Error shown
- [ ] Adjust distance slider → Value updates
- [ ] Click Search → Results filter
- [ ] Click Reset → Filters clear
- [ ] Press Enter in input → Search triggers
- [ ] Search with 0 results → "No vendors found" message
- [ ] Component is responsive on mobile

## Acceptance Criteria

- [ ] LocationSearchFilter component created
- [ ] Accepts onSearch and onReset callbacks
- [ ] Location input accepts "latitude, longitude" format
- [ ] Validates coordinate ranges (-90 to 90, -180 to 180)
- [ ] Distance slider ranges from 10km to 500km
- [ ] Shows error messages for invalid input
- [ ] Shows result count after search
- [ ] Reset button clears all filters
- [ ] Enter key triggers search
- [ ] Search button disabled when input empty
- [ ] Accessible (labels, ARIA attributes)
- [ ] data-testid attributes for testing
- [ ] TypeScript types are correct
- [ ] Playwright tests pass
- [ ] Responsive design (works on mobile)

## Edge Cases

- [ ] Empty input (search button disabled)
- [ ] Whitespace-only input (treated as empty)
- [ ] Single number input (shows error)
- [ ] Three numbers input (shows error)
- [ ] Decimal coordinates (accepted)
- [ ] Negative coordinates (accepted if in range)
- [ ] Very large/small numbers (validated)
- [ ] Special characters in input (shows error)

## Accessibility Requirements

- [ ] Label for location input
- [ ] Label for distance slider
- [ ] Help text for coordinate format
- [ ] Error messages have role="alert"
- [ ] Slider accessible via keyboard
- [ ] Buttons have descriptive text
- [ ] Focus indicators visible

## Future Enhancements

Consider for future iterations:
- Geocoding API integration (convert address → coordinates)
- Browser geolocation API (get user's current location)
- City/address autocomplete
- Save favorite locations
- Recent searches history
- Map view for selecting location

## Notes

- Component is client-side ('use client') for state management
- Coordinate parsing is strict (requires exact format)
- Distance in kilometers (consider adding miles option)
- Error messages are user-friendly
- Help text guides users on finding coordinates
- Component integrates with useLocationFilter hook
