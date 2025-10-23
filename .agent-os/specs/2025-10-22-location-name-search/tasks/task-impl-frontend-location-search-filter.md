# Task: impl-frontend-location-search-filter - Modify LocationSearchFilter Component

**Metadata:**
- **Task ID:** impl-frontend-location-search-filter
- **Phase:** Phase 3: Frontend Implementation
- **Agent:** frontend-react-specialist
- **Estimated Time:** 35-40 min
- **Dependencies:** impl-frontend-location-result-selector
- **Status:** Pending
- **Priority:** Critical

## Description

Modify the existing LocationSearchFilter component to add location name search functionality with Photon API integration, while preserving existing coordinate input and distance filtering.

## Specifics

**Modifications Required:**

1. **Add Location Name Input:**
   - Add Input component for location name search
   - Debounce input (300ms) to avoid excessive API calls
   - Show loading spinner during API call
   - Display error messages for API failures

2. **State Management:**
   ```typescript
   const [locationInput, setLocationInput] = useState('');
   const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
   const [showResultSelector, setShowResultSelector] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   ```

3. **Geocoding API Integration:**
   - Call /api/geocode when user types location name
   - Handle single result: Auto-apply coordinates
   - Handle multiple results: Show LocationResultSelector dialog
   - Handle empty results: Show "No locations found" message
   - Handle API errors: Show error message with retry option

4. **Result Handling:**
   - Single result → Auto-apply filter (no dialog)
   - Multiple results → Open LocationResultSelector dialog
   - Empty results → Show inline message
   - API error → Show error message with AlertCircle icon

5. **Advanced Coordinate Input (Fallback):**
   - Wrap existing coordinate inputs in Collapsible component
   - Label: "Advanced: Enter coordinates manually"
   - Collapsed by default
   - Expand/collapse toggle

6. **Preserve Existing Functionality:**
   - Distance slider still works
   - Coordinate-based filtering still works
   - Reset button clears all inputs
   - Integration with vendors-client unchanged

7. **UI Layout:**
   ```
   [Location name input] [Loading spinner if loading]
   [Error message if error]
   [Distance slider]
   [Advanced ▼]
     [Latitude input]
     [Longitude input]
   [Reset button]
   ```

**Files to Modify:**
- `/home/edwin/development/ptnextjs/components/LocationSearchFilter.tsx`

**Files to Create:**
- None (component already exists)

## Acceptance Criteria

- [ ] Location name input added and functional
- [ ] Input debounced to 300ms
- [ ] Loading state displays during API call
- [ ] Single result auto-applies coordinates
- [ ] Multiple results open LocationResultSelector dialog
- [ ] Empty results show "No locations found" message
- [ ] API errors show user-friendly error message
- [ ] Advanced coordinate input in Collapsible (collapsed by default)
- [ ] Distance slider preserved and functional
- [ ] Reset button clears all inputs including location name
- [ ] Integration with vendors-client unchanged
- [ ] All tests from test-frontend-ui pass
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] No breaking changes to existing functionality

## Testing Requirements

**Functional Testing:**
- Run component tests: `npm test -- LocationSearchFilter.test.tsx`
- All tests must pass
- No console errors or warnings

**Manual Verification:**
- Start dev server: `npm run dev`
- Navigate to vendors page
- Test location name search:
  - Type "Monaco" → Single result auto-applies
  - Type "Paris" → Multiple results, dialog opens
  - Type "asdfghjkl" → No results message
  - Type very fast → Only one API call (debounced)
- Test distance slider
- Test advanced coordinate input
- Test reset button
- Test combination: location search + distance filter

**Browser Testing:**
- Chrome: All functionality works
- Firefox: Debouncing and API calls work
- Safari: Dialog and collapsible work
- Mobile Safari: Touch interactions work
- Mobile Chrome: Responsive design correct

**Error Scenarios:**
- API returns 400 → Show "Invalid location search"
- API returns 429 → Show "Too many requests, please wait"
- API returns 500 → Show "Service error, please try again"
- API returns 503 → Show "Service unavailable, try manual coordinates"
- Network error → Show "Network error, please check connection"

**Evidence Required:**
- All unit tests passing
- Manual test results documented
- Screenshots of:
  - Location name input with loading state
  - Single result auto-applied
  - Multiple results dialog
  - Error state display
  - Advanced coordinate input (expanded)
  - Mobile responsive view
- Browser compatibility test results

## Context Requirements

**Required Context:**
- @.agent-os/specs/2025-10-22-location-name-search/spec.md
- @.agent-os/specs/2025-10-22-location-name-search/tasks/task-impl-frontend-location-result-selector.md
- @.agent-os/specs/2025-10-22-location-name-search/tasks/task-test-frontend-ui.md
- Existing LocationSearchFilter component code
- GeocodeResult and GeocodeResponse types from lib/types.ts

**Assumptions:**
- LocationResultSelector component is implemented
- /api/geocode endpoint is functional
- shadcn/ui Collapsible component is installed
- useDebouncedValue hook is available (or implement inline)

## Implementation Notes

**Debouncing Implementation:**

```typescript
import { useEffect, useState } from 'react';

// Option 1: Custom hook
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Usage
const debouncedLocationInput = useDebouncedValue(locationInput, 300);

useEffect(() => {
  if (debouncedLocationInput.trim()) {
    searchLocation(debouncedLocationInput);
  }
}, [debouncedLocationInput]);
```

**Geocoding API Call:**

```typescript
const searchLocation = async (query: string) => {
  setIsLoading(true);
  setError(null);

  try {
    const response = await fetch(
      `/api/geocode?q=${encodeURIComponent(query)}&limit=5`
    );

    const data: GeocodeResponse = await response.json();

    if (!response.ok) {
      if (data.success === false) {
        setError(getErrorMessage(data.code));
      } else {
        setError('Failed to search location');
      }
      return;
    }

    if (data.success && data.results.length === 0) {
      setError('No locations found');
      return;
    }

    if (data.success && data.results.length === 1) {
      // Auto-apply single result
      handleResultSelect(data.results[0]);
    } else if (data.success && data.results.length > 1) {
      // Show selector for multiple results
      setSearchResults(data.results);
      setShowResultSelector(true);
    }
  } catch (err) {
    setError('Network error. Please check your connection.');
  } finally {
    setIsLoading(false);
  }
};

const getErrorMessage = (code: string): string => {
  switch (code) {
    case 'RATE_LIMIT':
      return 'Too many requests. Please wait a moment.';
    case 'INVALID_QUERY':
      return 'Invalid location search.';
    case 'SERVICE_ERROR':
      return 'Service error. Please try again.';
    default:
      return 'An error occurred. Please try again.';
  }
};
```

**Result Selection Handler:**

```typescript
const handleResultSelect = (result: GeocodeResult) => {
  // Update coordinates from selected result
  setLatitude(result.coordinates.lat);
  setLongitude(result.coordinates.lon);

  // Close dialog
  setShowResultSelector(false);

  // Clear search results
  setSearchResults([]);

  // Optionally update location input to show selected location
  setLocationInput(result.display_name);
};
```

**Component Structure:**

```tsx
export function LocationSearchFilter({ onFilterChange }: Props) {
  // ... state declarations ...

  return (
    <div className="space-y-4">
      {/* Location Name Search */}
      <div>
        <Label htmlFor="location-search">Location</Label>
        <div className="relative">
          <Input
            id="location-search"
            placeholder="Search by city, region, or postal code"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
          )}
        </div>
        {error && (
          <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Distance Slider */}
      <div>
        <Label htmlFor="distance">Distance: {distance} km</Label>
        <Slider
          id="distance"
          min={0}
          max={500}
          step={10}
          value={[distance]}
          onValueChange={([value]) => setDistance(value)}
        />
      </div>

      {/* Advanced Coordinate Input */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between">
            Advanced: Enter coordinates manually
            <ChevronDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mt-2">
          <div>
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              value={latitude}
              onChange={(e) => setLatitude(parseFloat(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              value={longitude}
              onChange={(e) => setLongitude(parseFloat(e.target.value))}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Reset Button */}
      <Button variant="outline" onClick={handleReset}>
        Reset Filter
      </Button>

      {/* Result Selector Dialog */}
      <LocationResultSelector
        results={searchResults}
        isOpen={showResultSelector}
        onSelect={handleResultSelect}
        onCancel={() => setShowResultSelector(false)}
      />
    </div>
  );
}
```

**Reset Handler:**

```typescript
const handleReset = () => {
  setLocationInput('');
  setSearchResults([]);
  setShowResultSelector(false);
  setIsLoading(false);
  setError(null);
  setLatitude(0);
  setLongitude(0);
  setDistance(100);
  onFilterChange(null); // Clear filter
};
```

## Quality Gates

- [ ] Component follows React 19 best practices
- [ ] TypeScript strict mode compliance
- [ ] No prop-drilling
- [ ] Debouncing works correctly
- [ ] API error handling is comprehensive
- [ ] Loading states provide good UX
- [ ] Backward compatible with existing functionality
- [ ] Code reviewed and approved

## Related Files

**Spec Files:**
- @.agent-os/specs/2025-10-22-location-name-search/spec.md
- @.agent-os/specs/2025-10-22-location-name-search/sub-specs/technical-spec.md

**Implementation Files:**
- /home/edwin/development/ptnextjs/components/LocationSearchFilter.tsx (MODIFY)
- /home/edwin/development/ptnextjs/components/location-result-selector.tsx (uses)
- /home/edwin/development/ptnextjs/lib/types.ts (uses types)

**Test Files:**
- /home/edwin/development/ptnextjs/tests/unit/components/LocationSearchFilter.test.tsx

**Related Tasks:**
- task-impl-frontend-location-result-selector (prerequisite)
- task-test-frontend-ui (provides test suite)
- task-impl-frontend-styling (styles this component)
- task-impl-frontend-unit-mismatch-fix (fixes related hook)
