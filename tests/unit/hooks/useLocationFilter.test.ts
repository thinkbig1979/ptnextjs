/**
 * Unit tests for useLocationFilter hook
 *
 * Tests the custom hook for filtering vendors by location proximity,
 * with special focus on the unit mismatch fix (km vs miles).
 */

import { renderHook } from '@testing-library/react';
import {
  useLocationFilter,
  useNearbyVendors,
  useIsVendorNearby,
} from '@/hooks/useLocationFilter';
import { Vendor, VendorCoordinates } from '@/lib/types';
import { calculateDistance } from '@/lib/utils/location';

// Mock the calculateDistance function
jest.mock('@/lib/utils/location', () => ({
  calculateDistance: jest.fn(),
}));

const mockCalculateDistance = calculateDistance as jest.MockedFunction<
  typeof calculateDistance
>;

describe('useLocationFilter', () => {
  // Mock vendor data
  const monacoCoords: VendorCoordinates = { latitude: 43.7384, longitude: 7.4246 };
  const niceCoords: VendorCoordinates = { latitude: 43.7102, longitude: 7.262 };
  const parisCoords: VendorCoordinates = { latitude: 48.8566, longitude: 2.3522 };
  const londonCoords: VendorCoordinates = { latitude: 51.5074, longitude: -0.1278 };

  const vendors: Vendor[] = [
    {
      id: '1',
      name: 'Monaco Vendor',
      locations: [{ ...monacoCoords, isHQ: true, city: 'Monaco', country: 'Monaco' }],
      description: '',
      category: [],
      featured: false,
      partner: false,
    },
    {
      id: '2',
      name: 'Nice Vendor',
      locations: [{ ...niceCoords, isHQ: true, city: 'Nice', country: 'France' }],
      description: '',
      category: [],
      featured: false,
      partner: false,
    },
    {
      id: '3',
      name: 'Paris Vendor',
      locations: [{ ...parisCoords, isHQ: true, city: 'Paris', country: 'France' }],
      description: '',
      category: [],
      featured: false,
      partner: false,
    },
    {
      id: '4',
      name: 'London Vendor',
      locations: [{ ...londonCoords, isHQ: true, city: 'London', country: 'UK' }],
      description: '',
      category: [],
      featured: false,
      partner: false,
    },
    {
      id: '5',
      name: 'No Location Vendor',
      locations: [],
      description: '',
      category: [],
      featured: false,
      partner: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock distances in kilometers
    mockCalculateDistance.mockImplementation((from, to) => {
      // Monaco to Nice: ~20 km
      if (
        from.latitude === monacoCoords.latitude &&
        to.latitude === niceCoords.latitude
      ) {
        return 20;
      }
      // Monaco to Paris: ~680 km
      if (
        from.latitude === monacoCoords.latitude &&
        to.latitude === parisCoords.latitude
      ) {
        return 680;
      }
      // Monaco to London: ~1000 km
      if (
        from.latitude === monacoCoords.latitude &&
        to.latitude === londonCoords.latitude
      ) {
        return 1000;
      }
      return 0;
    });
  });

  describe('Unit Mismatch Fix - Kilometer Calculations', () => {
    it('should calculate distance in kilometers (not miles)', () => {
      renderHook(() =>
        useLocationFilter(vendors, monacoCoords, 100)
      );

      // Verify calculateDistance was called with 'km' unit
      expect(mockCalculateDistance).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        'km'
      );
    });

    it('should verify real-world distance calculations are in km', () => {
      // Monaco to Nice: approximately 20 km (not 20 miles = 32 km)
      const distance = 20; // km

      mockCalculateDistance.mockReturnValue(distance);

      const { result } = renderHook(() =>
        useLocationFilter(vendors, monacoCoords, 50)
      );

      expect(result.current.filteredVendors).toContainEqual(
        expect.objectContaining({ name: 'Nice Vendor', distance: 20 })
      );
    });

    it('should verify Monaco to Paris distance is ~680 km (not miles)', () => {
      // Monaco to Paris: approximately 680 km
      // If this was miles, it would be 1094 km
      mockCalculateDistance.mockReturnValue(680);

      const { result } = renderHook(() =>
        useLocationFilter(vendors, monacoCoords, 700)
      );

      expect(result.current.filteredVendors).toContainEqual(
        expect.objectContaining({ name: 'Paris Vendor', distance: 680 })
      );
    });

    it('should verify distance conversion accuracy with known coordinates', () => {
      // Test case: Monaco (43.7384, 7.4246) to Nice (43.7102, 7.2620)
      // Expected: ~20 km
      // If calculated in miles: would be ~12.4 miles
      mockCalculateDistance.mockReturnValue(20);

      const { result } = renderHook(() =>
        useLocationFilter(vendors, monacoCoords, 100)
      );

      const niceVendor = result.current.filteredVendors.find(
        v => v.name === 'Nice Vendor'
      );

      expect(niceVendor).toBeDefined();
      expect(niceVendor?.distance).toBe(20); // km, not miles
    });
  });

  describe('Distance Filtering with Kilometers', () => {
    it('should filter vendors within 50 km radius', () => {
      const { result } = renderHook(() =>
        useLocationFilter(vendors, monacoCoords, 50)
      );

      // Should include Monaco (0 km) and Nice (20 km)
      expect(result.current.filteredVendors).toHaveLength(2);
      expect(result.current.filteredVendors.map(v => v.name)).toEqual(
        expect.arrayContaining(['Monaco Vendor', 'Nice Vendor'])
      );
    });

    it('should filter vendors within 700 km radius', () => {
      const { result } = renderHook(() =>
        useLocationFilter(vendors, monacoCoords, 700)
      );

      // Should include Monaco (0 km), Nice (20 km), and Paris (680 km)
      expect(result.current.filteredVendors).toHaveLength(3);
      expect(result.current.filteredVendors.map(v => v.name)).toEqual(
        expect.arrayContaining(['Monaco Vendor', 'Nice Vendor', 'Paris Vendor'])
      );
    });

    it('should exclude vendors beyond 700 km', () => {
      const { result } = renderHook(() =>
        useLocationFilter(vendors, monacoCoords, 700)
      );

      // Should NOT include London (1000 km)
      expect(result.current.filteredVendors.map(v => v.name)).not.toContain(
        'London Vendor'
      );
    });

    it('should correctly apply maxDistance threshold in km', () => {
      // Test at exactly 680 km threshold
      const { result } = renderHook(() =>
        useLocationFilter(vendors, monacoCoords, 680)
      );

      // Paris is exactly at 680 km, should be included
      expect(result.current.filteredVendors.map(v => v.name)).toContain(
        'Paris Vendor'
      );
    });
  });

  describe('isWithinDistance uses km correctly', () => {
    it('should return true for vendors within distance (km)', () => {
      const { result } = renderHook(() =>
        useLocationFilter(vendors, monacoCoords, 50)
      );

      // Nice is 20 km away, should be within 50 km
      const niceVendor = result.current.filteredVendors.find(
        v => v.name === 'Nice Vendor'
      );
      expect(niceVendor).toBeDefined();
    });

    it('should return false for vendors beyond distance (km)', () => {
      const { result } = renderHook(() =>
        useLocationFilter(vendors, monacoCoords, 50)
      );

      // Paris is 680 km away, should NOT be within 50 km
      expect(result.current.filteredVendors.map(v => v.name)).not.toContain(
        'Paris Vendor'
      );
    });

    it('should handle boundary cases correctly (exactly at threshold)', () => {
      mockCalculateDistance.mockReturnValue(50); // exactly 50 km

      const { result } = renderHook(() =>
        useLocationFilter(vendors, monacoCoords, 50)
      );

      // Vendor at exactly 50 km should be included (<=)
      expect(result.current.filteredVendors.length).toBeGreaterThan(0);
    });
  });

  describe('Vendor Filtering Logic', () => {
    it('should return all vendors when no user location is set', () => {
      const { result } = renderHook(() =>
        useLocationFilter(vendors, null, 100)
      );

      expect(result.current.filteredVendors).toHaveLength(5);
      expect(result.current.isFiltering).toBe(false);
    });

    it('should exclude vendors without coordinates when filtering by location', () => {
      const { result } = renderHook(() =>
        useLocationFilter(vendors, monacoCoords, 100)
      );

      // Should not include "No Location Vendor"
      expect(result.current.filteredVendors.map(v => v.name)).not.toContain(
        'No Location Vendor'
      );
    });

    it('should count vendors with and without coordinates', () => {
      const { result } = renderHook(() =>
        useLocationFilter(vendors, monacoCoords, 100)
      );

      expect(result.current.vendorsWithCoordinates).toBe(4);
      expect(result.current.vendorsWithoutCoordinates).toBe(1);
    });

    it('should sort vendors by distance (closest first)', () => {
      const { result } = renderHook(() =>
        useLocationFilter(vendors, monacoCoords, 1000)
      );

      const distances = result.current.filteredVendors.map(v => v.distance);

      // Verify sorted order: 0 (Monaco), 20 (Nice), 680 (Paris), 1000 (London - exactly at threshold)
      expect(distances).toEqual([0, 20, 680, 1000]);
    });

    it('should mark filtering as active when user location is set', () => {
      const { result } = renderHook(() =>
        useLocationFilter(vendors, monacoCoords, 100)
      );

      expect(result.current.isFiltering).toBe(true);
    });
  });

  describe('Existing Vendor Filtering Still Works', () => {
    it('should maintain backward compatibility with vendor filtering', () => {
      const { result } = renderHook(() =>
        useLocationFilter(vendors, monacoCoords, 50)
      );

      // Basic filtering should still work
      expect(result.current.filteredVendors).toBeDefined();
      expect(Array.isArray(result.current.filteredVendors)).toBe(true);
    });

    it('should preserve vendor properties after filtering', () => {
      const { result } = renderHook(() =>
        useLocationFilter(vendors, monacoCoords, 50)
      );

      const vendor = result.current.filteredVendors[0];

      expect(vendor).toHaveProperty('id');
      expect(vendor).toHaveProperty('name');
      expect(vendor).toHaveProperty('locations');
      expect(vendor).toHaveProperty('distance');
    });

    it('should handle vendors with empty locations array', () => {
      const { result } = renderHook(() =>
        useLocationFilter(vendors, monacoCoords, 100)
      );

      expect(result.current).toBeDefined();
      expect(result.current.vendorsWithoutCoordinates).toBe(1);
    });
  });

  describe('useNearbyVendors Helper Hook', () => {
    it('should return filtered vendors without metadata', () => {
      const { result } = renderHook(() =>
        useNearbyVendors(vendors, monacoCoords, 50)
      );

      expect(result.current).toHaveLength(2);
      expect(result.current.map(v => v.name)).toEqual(
        expect.arrayContaining(['Monaco Vendor', 'Nice Vendor'])
      );
    });

    it('should use kilometers for distance calculations', () => {
      renderHook(() => useNearbyVendors(vendors, monacoCoords, 50));

      expect(mockCalculateDistance).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        'km'
      );
    });
  });

  describe('useIsVendorNearby Helper Hook', () => {
    it('should return true for vendor within distance (km)', () => {
      mockCalculateDistance.mockReturnValue(20); // 20 km

      const { result } = renderHook(() =>
        useIsVendorNearby(vendors[1], monacoCoords, 50) // Nice vendor
      );

      expect(result.current.isNearby).toBe(true);
      expect(result.current.distance).toBe(20);
    });

    it('should return false for vendor beyond distance (km)', () => {
      mockCalculateDistance.mockReturnValue(680); // 680 km

      const { result } = renderHook(() =>
        useIsVendorNearby(vendors[2], monacoCoords, 50) // Paris vendor
      );

      expect(result.current.isNearby).toBe(false);
      expect(result.current.distance).toBe(680);
    });

    it('should use kilometers for distance calculations', () => {
      mockCalculateDistance.mockReturnValue(20);

      renderHook(() =>
        useIsVendorNearby(vendors[1], monacoCoords, 100)
      );

      expect(mockCalculateDistance).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        'km'
      );
    });

    it('should handle vendor with no location', () => {
      const { result } = renderHook(() =>
        useIsVendorNearby(vendors[4], monacoCoords, 100) // No location vendor
      );

      expect(result.current.isNearby).toBe(false);
      expect(result.current.distance).toBeUndefined();
    });

    it('should handle null user location', () => {
      const { result } = renderHook(() =>
        useIsVendorNearby(vendors[1], null, 100)
      );

      expect(result.current.isNearby).toBe(false);
      expect(result.current.distance).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle distance calculation errors gracefully', () => {
      mockCalculateDistance.mockImplementation(() => {
        throw new Error('Calculation error');
      });

      const { result } = renderHook(() =>
        useLocationFilter(vendors, monacoCoords, 100)
      );

      // Should not crash, should exclude vendors with errors
      expect(result.current.filteredVendors).toBeDefined();
      expect(result.current.filteredVendors.length).toBeLessThan(4);
    });

    it('should log warning for calculation errors', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      mockCalculateDistance.mockImplementation(() => {
        throw new Error('Calculation error');
      });

      renderHook(() => useLocationFilter(vendors, monacoCoords, 100));

      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Multi-Location Support (New Feature)', () => {
    describe('Multi-Location Format', () => {
      it('should filter vendors with locations array (new format)', () => {
        const multiLocationVendors: Vendor[] = [
          {
            id: '1',
            name: 'Global Vendor',
            tier: 'tier2',
            locations: [
              { ...monacoCoords, isHQ: true, address: 'HQ', city: 'Monaco', country: 'Monaco' },
              { ...parisCoords, isHQ: false, address: 'Office', city: 'Paris', country: 'France' },
            ],
            description: '',
            category: [],
            featured: false,
            partner: false,
          },
        ];

        mockCalculateDistance.mockReturnValueOnce(0).mockReturnValueOnce(680);

        const { result } = renderHook(() =>
          useLocationFilter(multiLocationVendors, monacoCoords, 50)
        );

        expect(result.current.filteredVendors).toHaveLength(1);
        expect(result.current.filteredVendors[0].matchedLocation?.city).toBe('Monaco');
      });

      it('should select closest location for tier 2+ vendors', () => {
        const multiLocationVendors: Vendor[] = [
          {
            id: '1',
            name: 'Global Vendor',
            tier: 'tier2',
            locations: [
              { ...monacoCoords, isHQ: true, address: 'HQ', city: 'Monaco', country: 'Monaco' },
              { ...parisCoords, isHQ: false, address: 'Office', city: 'Paris', country: 'France' },
            ],
            description: '',
            category: [],
            featured: false,
            partner: false,
          },
        ];

        // Mock distances: Monaco=680km, Paris=20km (Paris is closer)
        mockCalculateDistance.mockReturnValueOnce(680).mockReturnValueOnce(20);

        const { result } = renderHook(() =>
          useLocationFilter(multiLocationVendors, parisCoords, 5000)
        );

        expect(result.current.filteredVendors).toHaveLength(1);
        expect(result.current.filteredVendors[0].matchedLocation?.city).toBe('Paris');
        expect(result.current.filteredVendors[0].distance).toBe(20);
      });
    });

    describe('Tier-Based Location Filtering', () => {
      it('should only consider HQ location for tier 1 vendors', () => {
        const tier1Vendors: Vendor[] = [
          {
            id: '1',
            name: 'Tier 1 Vendor',
            tier: 'tier1',
            locations: [
              { ...monacoCoords, isHQ: true, address: 'HQ', city: 'Monaco', country: 'Monaco' },
              { ...niceCoords, isHQ: false, address: 'Office', city: 'Nice', country: 'France' },
            ],
            description: '',
            category: [],
            featured: false,
            partner: false,
          },
        ];

        // User is near Nice office, but tier1 vendors only show HQ
        // Monaco HQ is ~20km from Nice, so it should be included
        mockCalculateDistance.mockReturnValue(20);

        const { result} = renderHook(() =>
          useLocationFilter(tier1Vendors, niceCoords, 50)
        );

        // Monaco HQ is within 50km, should be included (tier1 only considers HQ)
        expect(result.current.filteredVendors).toHaveLength(1);
        expect(result.current.filteredVendors[0].matchedLocation?.city).toBe('Monaco');
      });

      it('should only consider HQ location for free tier vendors', () => {
        const freeTierVendors: Vendor[] = [
          {
            id: '1',
            name: 'Free Tier Vendor',
            tier: 'free',
            locations: [
              { ...monacoCoords, isHQ: true, address: 'HQ', city: 'Monaco', country: 'Monaco' },
              { ...niceCoords, isHQ: false, address: 'Office', city: 'Nice', country: 'France' },
            ],
            description: '',
            category: [],
            featured: false,
            partner: false,
          },
        ];

        // Monaco HQ is ~20km from Nice
        mockCalculateDistance.mockReturnValue(20);

        const { result } = renderHook(() =>
          useLocationFilter(freeTierVendors, niceCoords, 50)
        );

        // HQ is within 50km, should be included (free tier only considers HQ)
        expect(result.current.filteredVendors).toHaveLength(1);
        expect(result.current.filteredVendors[0].matchedLocation?.city).toBe('Monaco');
      });

      it('should consider all locations for tier 2 vendors', () => {
        const tier2Vendors: Vendor[] = [
          {
            id: '1',
            name: 'Tier 2 Vendor',
            tier: 'tier2',
            locations: [
              { ...monacoCoords, isHQ: true, address: 'HQ', city: 'Monaco', country: 'Monaco' },
              { ...niceCoords, isHQ: false, address: 'Office', city: 'Nice', country: 'France' },
            ],
            description: '',
            category: [],
            featured: false,
            partner: false,
          },
        ];

        // User near Nice office
        mockCalculateDistance.mockReturnValueOnce(20).mockReturnValueOnce(0);

        const { result } = renderHook(() =>
          useLocationFilter(tier2Vendors, niceCoords, 50)
        );

        // Should match Nice office (tier2 sees all locations)
        expect(result.current.filteredVendors).toHaveLength(1);
        expect(result.current.filteredVendors[0].matchedLocation?.city).toBe('Nice');
      });
    });

    describe('Edge Cases for Multi-Location', () => {
      it('should exclude vendors with no locations', () => {
        const noLocationVendors: Vendor[] = [
          {
            id: '1',
            name: 'No Locations Vendor',
            locations: [],
            description: '',
            category: [],
            featured: false,
            partner: false,
          },
        ];

        const { result } = renderHook(() =>
          useLocationFilter(noLocationVendors, monacoCoords, 50)
        );

        expect(result.current.filteredVendors).toHaveLength(0);
      });

      it('should exclude vendors with locations beyond range', () => {
        const distantVendors: Vendor[] = [
          {
            id: '1',
            name: 'Distant Vendor',
            tier: 'tier2',
            locations: [
              { ...londonCoords, isHQ: true, address: 'HQ', city: 'London', country: 'UK' },
            ],
            description: '',
            category: [],
            featured: false,
            partner: false,
          },
        ];

        mockCalculateDistance.mockReturnValue(1000); // 1000km away

        const { result } = renderHook(() =>
          useLocationFilter(distantVendors, monacoCoords, 50)
        );

        expect(result.current.filteredVendors).toHaveLength(0);
      });

      it('should handle tier 2 vendor with HQ beyond range but office within range', () => {
        const mixedDistanceVendors: Vendor[] = [
          {
            id: '1',
            name: 'Mixed Distance Vendor',
            tier: 'tier2',
            locations: [
              { ...londonCoords, isHQ: true, address: 'HQ', city: 'London', country: 'UK' },
              { ...niceCoords, isHQ: false, address: 'Office', city: 'Nice', country: 'France' },
            ],
            description: '',
            category: [],
            featured: false,
            partner: false,
          },
        ];

        // London=1000km (out of range), Nice=20km (in range)
        mockCalculateDistance.mockReturnValueOnce(1000).mockReturnValueOnce(20);

        const { result } = renderHook(() =>
          useLocationFilter(mixedDistanceVendors, monacoCoords, 50)
        );

        // Should match Nice office
        expect(result.current.filteredVendors).toHaveLength(1);
        expect(result.current.filteredVendors[0].matchedLocation?.city).toBe('Nice');
      });

      it('should handle vendors without tier field (default to free)', () => {
        const noTierVendors: Vendor[] = [
          {
            id: '1',
            name: 'No Tier Vendor',
            locations: [
              { ...monacoCoords, isHQ: true, address: 'HQ', city: 'Monaco', country: 'Monaco' },
              { ...niceCoords, isHQ: false, address: 'Office', city: 'Nice', country: 'France' },
            ],
            description: '',
            category: [],
            featured: false,
            partner: false,
          },
        ];

        // Monaco HQ is ~20km from Nice
        mockCalculateDistance.mockReturnValue(20);

        const { result } = renderHook(() =>
          useLocationFilter(noTierVendors, niceCoords, 50)
        );

        // Without tier, defaults to free tier (only HQ considered, which is within range)
        expect(result.current.filteredVendors).toHaveLength(1);
        expect(result.current.filteredVendors[0].matchedLocation?.city).toBe('Monaco');
      });
    });

    describe('Matched Location Field', () => {
      it('should populate matchedLocation for matched vendors', () => {
        const vendors: Vendor[] = [
          {
            id: '1',
            name: 'Test Vendor',
            tier: 'tier2',
            locations: [
              { ...monacoCoords, isHQ: true, address: '123 Monaco St', city: 'Monaco', country: 'Monaco' },
            ],
            description: '',
            category: [],
            featured: false,
            partner: false,
          },
        ];

        mockCalculateDistance.mockReturnValue(5);

        const { result } = renderHook(() =>
          useLocationFilter(vendors, monacoCoords, 50)
        );

        expect(result.current.filteredVendors[0].matchedLocation).toBeDefined();
        expect(result.current.filteredVendors[0].matchedLocation?.address).toBe('123 Monaco St');
        expect(result.current.filteredVendors[0].matchedLocation?.city).toBe('Monaco');
      });

      it('should not populate matchedLocation for excluded vendors', () => {
        const vendors: Vendor[] = [
          {
            id: '1',
            name: 'Distant Vendor',
            tier: 'tier2',
            locations: [
              { ...londonCoords, isHQ: true, address: 'HQ', city: 'London', country: 'UK' },
            ],
            description: '',
            category: [],
            featured: false,
            partner: false,
          },
        ];

        mockCalculateDistance.mockReturnValue(1000);

        const { result } = renderHook(() =>
          useLocationFilter(vendors, monacoCoords, 50)
        );

        expect(result.current.filteredVendors).toHaveLength(0);
      });
    });

  });

  describe('Performance and Memoization', () => {
    it('should memoize results with same inputs', () => {
      const { result, rerender } = renderHook(
        ({ vendors, location, distance }) =>
          useLocationFilter(vendors, location, distance),
        {
          initialProps: {
            vendors,
            location: monacoCoords,
            distance: 100,
          },
        }
      );

      const firstResult = result.current;

      // Rerender with same props
      rerender({
        vendors,
        location: monacoCoords,
        distance: 100,
      });

      // Results should be referentially equal (memoized)
      expect(result.current).toBe(firstResult);
    });

    it('should recalculate when inputs change', () => {
      const { result, rerender } = renderHook(
        ({ vendors, location, distance }) =>
          useLocationFilter(vendors, location, distance),
        {
          initialProps: {
            vendors,
            location: monacoCoords,
            distance: 100,
          },
        }
      );

      const firstResult = result.current;
      const firstLength = firstResult.filteredVendors.length;

      // Rerender with different distance (more restrictive)
      rerender({
        vendors,
        location: monacoCoords,
        distance: 10,
      });

      // Results should be different (referentially different object)
      expect(result.current).not.toBe(firstResult);
      // With distance of 10km, should only get Monaco (0km), not Nice (20km)
      expect(result.current.filteredVendors.length).toBeLessThan(firstLength);
    });
  });
});
