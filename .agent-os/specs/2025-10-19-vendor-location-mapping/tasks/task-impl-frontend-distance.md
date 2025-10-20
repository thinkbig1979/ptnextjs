# Task: Implement Haversine Distance Calculation Utility

**Task ID**: impl-frontend-distance
**Phase**: Phase 3 - Frontend Implementation (Map Components & UI)
**Agent**: frontend-react-specialist
**Estimated Time**: 1 hour
**Dependencies**: impl-frontend-search

## Objective

Create a utility function that calculates the great-circle distance between two geographic coordinates using the Haversine formula.

## Context Requirements

**Files to Review**:
- `/home/edwin/development/ptnextjs/lib/types.ts` (VendorCoordinates interface)
- `/home/edwin/development/ptnextjs/lib/` (existing utility patterns)

**Algorithm**: Haversine formula for calculating distance on a sphere

## Utility Specification

### File Location

Create: `/home/edwin/development/ptnextjs/lib/distance-calculator.ts`

### Function Signature

```typescript
import { VendorCoordinates } from './types';

/**
 * Calculates the great-circle distance between two points on Earth
 * using the Haversine formula
 *
 * @param coord1 - First coordinate (origin)
 * @param coord2 - Second coordinate (destination)
 * @param unit - Unit of measurement ('km' or 'miles'), defaults to 'km'
 * @returns Distance between the two coordinates in the specified unit
 * @throws Error if coordinates are invalid
 */
export function calculateDistance(
  coord1: VendorCoordinates,
  coord2: VendorCoordinates,
  unit?: 'km' | 'miles'
): number;
```

### Implementation

```typescript
import { VendorCoordinates } from './types';

/**
 * Earth's radius in kilometers
 */
const EARTH_RADIUS_KM = 6371;

/**
 * Earth's radius in miles
 */
const EARTH_RADIUS_MILES = 3959;

/**
 * Validates that a coordinate value is within valid ranges
 */
function validateCoordinate(lat: number, lng: number): void {
  if (lat < -90 || lat > 90) {
    throw new Error(`Invalid latitude: ${lat}. Must be between -90 and 90.`);
  }
  if (lng < -180 || lng > 180) {
    throw new Error(`Invalid longitude: ${lng}. Must be between -180 and 180.`);
  }
}

/**
 * Converts degrees to radians
 */
function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculates the great-circle distance between two points on Earth
 * using the Haversine formula
 *
 * Formula:
 * a = sin²(Δφ/2) + cos φ1 * cos φ2 * sin²(Δλ/2)
 * c = 2 * atan2(√a, √(1−a))
 * d = R * c
 *
 * Where:
 * - φ is latitude
 * - λ is longitude
 * - R is earth's radius
 *
 * @param coord1 - First coordinate (origin)
 * @param coord2 - Second coordinate (destination)
 * @param unit - Unit of measurement ('km' or 'miles'), defaults to 'km'
 * @returns Distance between the two coordinates in the specified unit, rounded to 2 decimal places
 * @throws Error if coordinates are invalid
 *
 * @example
 * const monaco = { latitude: 43.7384, longitude: 7.4246 };
 * const paris = { latitude: 48.8566, longitude: 2.3522 };
 * const distance = calculateDistance(monaco, paris); // ~688 km
 */
export function calculateDistance(
  coord1: VendorCoordinates,
  coord2: VendorCoordinates,
  unit: 'km' | 'miles' = 'km'
): number {
  // Validate coordinates
  validateCoordinate(coord1.latitude, coord1.longitude);
  validateCoordinate(coord2.latitude, coord2.longitude);

  // Select earth radius based on unit
  const earthRadius = unit === 'miles' ? EARTH_RADIUS_MILES : EARTH_RADIUS_KM;

  // Convert to radians
  const lat1 = degreesToRadians(coord1.latitude);
  const lat2 = degreesToRadians(coord2.latitude);
  const deltaLat = degreesToRadians(coord2.latitude - coord1.latitude);
  const deltaLng = degreesToRadians(coord2.longitude - coord1.longitude);

  // Haversine formula
  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = earthRadius * c;

  // Round to 2 decimal places
  return Math.round(distance * 100) / 100;
}

/**
 * Checks if a coordinate is within a specified distance from a reference point
 *
 * @param origin - Reference coordinate (user location)
 * @param target - Coordinate to check (vendor location)
 * @param maxDistance - Maximum distance in kilometers
 * @returns true if target is within maxDistance from origin, false otherwise
 *
 * @example
 * const userLocation = { latitude: 43.7384, longitude: 7.4246 };
 * const vendorLocation = { latitude: 43.7500, longitude: 7.4300 };
 * const isNearby = isWithinDistance(userLocation, vendorLocation, 50); // true
 */
export function isWithinDistance(
  origin: VendorCoordinates,
  target: VendorCoordinates,
  maxDistance: number
): boolean {
  try {
    const distance = calculateDistance(origin, target, 'km');
    return distance <= maxDistance;
  } catch (error) {
    // If coordinates are invalid, return false
    console.warn('Invalid coordinates in isWithinDistance:', error);
    return false;
  }
}

/**
 * Formats a distance value for display
 *
 * @param distance - Distance in kilometers
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted distance string with unit
 *
 * @example
 * formatDistance(42.567, 1) // "42.6 km"
 * formatDistance(0.75, 2) // "0.75 km"
 */
export function formatDistance(distance: number, decimals: number = 1): string {
  return `${distance.toFixed(decimals)} km`;
}
```

## Test Suite

Create: `/home/edwin/development/ptnextjs/lib/__tests__/distance-calculator.test.ts`

```typescript
import { calculateDistance, isWithinDistance, formatDistance } from '../distance-calculator';

describe('calculateDistance', () => {
  // Known test cases (verified with online calculators)
  test('calculates distance between Monaco and Paris', () => {
    const monaco = { latitude: 43.7384, longitude: 7.4246 };
    const paris = { latitude: 48.8566, longitude: 2.3522 };

    const distance = calculateDistance(monaco, paris);

    // Expected: ~688 km (allow 10km margin for rounding)
    expect(distance).toBeGreaterThan(680);
    expect(distance).toBeLessThan(700);
  });

  test('calculates distance between Fort Lauderdale and Miami', () => {
    const fortLauderdale = { latitude: 26.1224, longitude: -80.1373 };
    const miami = { latitude: 25.7617, longitude: -80.1918 };

    const distance = calculateDistance(fortLauderdale, miami);

    // Expected: ~43 km
    expect(distance).toBeGreaterThan(40);
    expect(distance).toBeLessThan(50);
  });

  test('returns 0 for identical coordinates', () => {
    const coord = { latitude: 43.7384, longitude: 7.4246 };
    const distance = calculateDistance(coord, coord);

    expect(distance).toBe(0);
  });

  test('converts to miles when specified', () => {
    const coord1 = { latitude: 40.7128, longitude: -74.0060 }; // New York
    const coord2 = { latitude: 34.0522, longitude: -118.2437 }; // Los Angeles

    const distanceKm = calculateDistance(coord1, coord2, 'km');
    const distanceMiles = calculateDistance(coord1, coord2, 'miles');

    // 1 mile ≈ 1.60934 km
    expect(distanceMiles).toBeGreaterThan(0);
    expect(distanceKm / distanceMiles).toBeCloseTo(1.60934, 1);
  });

  test('throws error for invalid latitude (> 90)', () => {
    const valid = { latitude: 43.7384, longitude: 7.4246 };
    const invalid = { latitude: 100, longitude: 7.4246 };

    expect(() => calculateDistance(valid, invalid)).toThrow('Invalid latitude');
  });

  test('throws error for invalid latitude (< -90)', () => {
    const valid = { latitude: 43.7384, longitude: 7.4246 };
    const invalid = { latitude: -100, longitude: 7.4246 };

    expect(() => calculateDistance(valid, invalid)).toThrow('Invalid latitude');
  });

  test('throws error for invalid longitude (> 180)', () => {
    const valid = { latitude: 43.7384, longitude: 7.4246 };
    const invalid = { latitude: 43.7384, longitude: 200 };

    expect(() => calculateDistance(valid, invalid)).toThrow('Invalid longitude');
  });

  test('throws error for invalid longitude (< -180)', () => {
    const valid = { latitude: 43.7384, longitude: 7.4246 };
    const invalid = { latitude: 43.7384, longitude: -200 };

    expect(() => calculateDistance(valid, invalid)).toThrow('Invalid longitude');
  });

  test('handles edge coordinates (equator, prime meridian)', () => {
    const equatorPrime = { latitude: 0, longitude: 0 };
    const nearEquator = { latitude: 1, longitude: 0 };

    const distance = calculateDistance(equatorPrime, nearEquator);

    // 1 degree latitude ≈ 111 km
    expect(distance).toBeCloseTo(111, 0);
  });

  test('handles coordinates at poles', () => {
    const northPole = { latitude: 90, longitude: 0 };
    const nearNorthPole = { latitude: 89, longitude: 0 };

    const distance = calculateDistance(northPole, nearNorthPole);

    expect(distance).toBeGreaterThan(0);
    expect(distance).toBeLessThan(200); // Should be ~111 km
  });

  test('rounds result to 2 decimal places', () => {
    const coord1 = { latitude: 43.7384, longitude: 7.4246 };
    const coord2 = { latitude: 43.7385, longitude: 7.4247 };

    const distance = calculateDistance(coord1, coord2);

    // Check that result has at most 2 decimal places
    expect(distance.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
  });
});

describe('isWithinDistance', () => {
  test('returns true when within distance', () => {
    const origin = { latitude: 43.7384, longitude: 7.4246 };
    const nearby = { latitude: 43.7500, longitude: 7.4300 };

    const result = isWithinDistance(origin, nearby, 50);

    expect(result).toBe(true);
  });

  test('returns false when outside distance', () => {
    const origin = { latitude: 43.7384, longitude: 7.4246 };
    const farAway = { latitude: 48.8566, longitude: 2.3522 }; // Paris, ~688km

    const result = isWithinDistance(origin, farAway, 100);

    expect(result).toBe(false);
  });

  test('returns true when exactly at max distance', () => {
    const origin = { latitude: 43.7384, longitude: 7.4246 };
    const target = { latitude: 43.7385, longitude: 7.4247 };

    const exactDistance = calculateDistance(origin, target);
    const result = isWithinDistance(origin, target, exactDistance);

    expect(result).toBe(true);
  });

  test('returns false for invalid coordinates', () => {
    const valid = { latitude: 43.7384, longitude: 7.4246 };
    const invalid = { latitude: 100, longitude: 200 };

    const result = isWithinDistance(valid, invalid, 100);

    expect(result).toBe(false);
  });
});

describe('formatDistance', () => {
  test('formats distance with default 1 decimal place', () => {
    expect(formatDistance(42.567)).toBe('42.6 km');
  });

  test('formats distance with specified decimal places', () => {
    expect(formatDistance(42.567, 2)).toBe('42.57 km');
    expect(formatDistance(42.567, 0)).toBe('43 km');
  });

  test('handles small distances', () => {
    expect(formatDistance(0.75, 2)).toBe('0.75 km');
  });

  test('handles large distances', () => {
    expect(formatDistance(1234.567, 1)).toBe('1234.6 km');
  });
});
```

## Testing Steps

### 1. Unit Tests

```bash
cd /home/edwin/development/ptnextjs

# Run tests (if Jest/Vitest configured)
npm test distance-calculator.test.ts

# Or run type check
npm run type-check
```

### 2. Manual Testing

Create a test script: `/home/edwin/development/ptnextjs/scripts/test-distance.ts`

```typescript
import { calculateDistance } from '../lib/distance-calculator';

// Test known distances
const tests = [
  {
    name: 'Monaco to Paris',
    coord1: { latitude: 43.7384, longitude: 7.4246 },
    coord2: { latitude: 48.8566, longitude: 2.3522 },
    expectedKm: 688,
  },
  {
    name: 'Fort Lauderdale to Miami',
    coord1: { latitude: 26.1224, longitude: -80.1373 },
    coord2: { latitude: 25.7617, longitude: -80.1918 },
    expectedKm: 43,
  },
  {
    name: 'New York to Los Angeles',
    coord1: { latitude: 40.7128, longitude: -74.0060 },
    coord2: { latitude: 34.0522, longitude: -118.2437 },
    expectedKm: 3944,
  },
];

console.log('Distance Calculation Tests:\n');

tests.forEach(({ name, coord1, coord2, expectedKm }) => {
  const actualKm = calculateDistance(coord1, coord2, 'km');
  const actualMiles = calculateDistance(coord1, coord2, 'miles');
  const error = Math.abs(actualKm - expectedKm);
  const errorPercent = (error / expectedKm) * 100;

  console.log(`${name}:`);
  console.log(`  Expected: ${expectedKm} km`);
  console.log(`  Actual: ${actualKm} km (${actualMiles} mi)`);
  console.log(`  Error: ${error.toFixed(2)} km (${errorPercent.toFixed(2)}%)`);
  console.log('');
});
```

Run:
```bash
npx ts-node scripts/test-distance.ts
```

### 3. Integration Testing

Test with real vendor data:

```typescript
// Temporary test in a page or component
import { calculateDistance } from '@/lib/distance-calculator';

const userLocation = { latitude: 43.7384, longitude: 7.4246 }; // Monaco

vendors.forEach(vendor => {
  if (vendor.coordinates) {
    const distance = calculateDistance(userLocation, vendor.coordinates);
    console.log(`${vendor.name}: ${distance} km`);
  }
});
```

## Acceptance Criteria

- [ ] `calculateDistance()` function created in `/home/edwin/development/ptnextjs/lib/distance-calculator.ts`
- [ ] Uses Haversine formula for accuracy
- [ ] Validates coordinate ranges (-90 to 90, -180 to 180)
- [ ] Returns distance in kilometers by default
- [ ] Supports miles conversion
- [ ] Rounds result to 2 decimal places
- [ ] Throws descriptive errors for invalid coordinates
- [ ] `isWithinDistance()` helper function created
- [ ] `formatDistance()` helper function created
- [ ] Comprehensive JSDoc comments
- [ ] Test suite created with known test cases
- [ ] All tests pass
- [ ] TypeScript types are correct
- [ ] No compilation errors
- [ ] Verified with real-world distances

## Known Test Cases

Verify accuracy against these known distances:

| From | To | Distance |
|------|-----|----------|
| Monaco (43.7384, 7.4246) | Paris (48.8566, 2.3522) | ~688 km |
| Fort Lauderdale (26.1224, -80.1373) | Miami (25.7617, -80.1918) | ~43 km |
| New York (40.7128, -74.0060) | Los Angeles (34.0522, -118.2437) | ~3,944 km |
| London (51.5074, -0.1278) | Edinburgh (55.9533, -3.1883) | ~534 km |

## Edge Cases

- [ ] Identical coordinates (should return 0)
- [ ] Antipodal points (opposite sides of Earth)
- [ ] Coordinates at poles (90, -90)
- [ ] Coordinates at date line (180, -180)
- [ ] Coordinates at equator (0)
- [ ] Coordinates at prime meridian (0)
- [ ] Very small distances (<1 km)
- [ ] Very large distances (>10,000 km)

## Performance Considerations

- Function is pure (no side effects)
- O(1) time complexity
- Minimal memory footprint
- Can be called thousands of times without performance issues
- Consider memoization if called repeatedly with same inputs

## Notes

- Haversine formula assumes Earth is a perfect sphere (slight inaccuracy)
- Accuracy typically within 0.5% for most distances
- For very precise calculations, consider Vincenty formula (more complex)
- Earth's radius values are standard constants
- Result precision suitable for vendor proximity search use case
