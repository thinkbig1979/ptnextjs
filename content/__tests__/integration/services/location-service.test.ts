/**
 * Integration Tests - LocationService
 *
 * Tests coverage:
 * - Distance calculation accuracy (Haversine formula)
 * - Validation methods with real data
 * - Tier-based filtering logic
 * - Location search within radius
 *
 * Total: 15+ test cases
 */

import {
  validateVendorLocations,
  checkTierLocationAccess,
  autoDesignateHQLocation,
  calculateDistance,
  filterLocationsByTier,
  findVendorsWithinRadius,
} from '@/lib/services/LocationService';

describe('LocationService - Integration Tests', () => {
  describe('Distance Calculation', () => {
    it('should calculate distance between Fort Lauderdale and Miami accurately', () => {
      // Fort Lauderdale: 26.122439, -80.137314
      // Miami: 25.7617, -80.1918
      const distance = calculateDistance(26.122439, -80.137314, 25.7617, -80.1918);

      // Expected distance: ~42 km
      expect(distance).toBeGreaterThan(40);
      expect(distance).toBeLessThan(45);
    });

    it('should calculate distance between New York and Los Angeles accurately', () => {
      // New York: 40.7128, -74.0060
      // Los Angeles: 34.0522, -118.2437
      const distance = calculateDistance(40.7128, -74.0060, 34.0522, -118.2437);

      // Expected distance: ~3935 km
      expect(distance).toBeGreaterThan(3900);
      expect(distance).toBeLessThan(4000);
    });

    it('should return 0 for same coordinates', () => {
      const distance = calculateDistance(26.122439, -80.137314, 26.122439, -80.137314);
      expect(distance).toBe(0);
    });

    it('should handle negative coordinates correctly', () => {
      // Sydney: -33.8688, 151.2093
      // Melbourne: -37.8136, 144.9631
      const distance = calculateDistance(-33.8688, 151.2093, -37.8136, 144.9631);

      // Expected distance: ~713 km
      expect(distance).toBeGreaterThan(700);
      expect(distance).toBeLessThan(750);
    });
  });

  describe('Tier-Based Location Filtering', () => {
    const multipleLocations = [
      { address: 'HQ', city: 'Miami', isHQ: true, latitude: 25.7617, longitude: -80.1918 },
      { address: 'Branch 1', city: 'New York', isHQ: false, latitude: 40.7128, longitude: -74.0060 },
      { address: 'Branch 2', city: 'Los Angeles', isHQ: false, latitude: 34.0522, longitude: -118.2437 },
    ];

    it('should return all locations for tier2 vendor', () => {
      const filtered = filterLocationsByTier(multipleLocations, 'tier2');
      expect(filtered).toHaveLength(3);
    });

    it('should return only HQ for tier1 vendor', () => {
      const filtered = filterLocationsByTier(multipleLocations, 'tier1');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].isHQ).toBe(true);
    });

    it('should return only HQ for free tier vendor', () => {
      const filtered = filterLocationsByTier(multipleLocations, 'free');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].isHQ).toBe(true);
      expect(filtered[0].city).toBe('Miami');
    });

    it('should return empty array for vendor with no locations', () => {
      const filtered = filterLocationsByTier([], 'tier2');
      expect(filtered).toEqual([]);
    });
  });

  describe('Vendor Search Within Radius', () => {
    const mockVendors = [
      {
        id: 'vendor1',
        companyName: 'Miami Vendor',
        tier: 'tier2',
        locations: [
          { address: 'Miami HQ', latitude: 25.7617, longitude: -80.1918, isHQ: true },
        ],
      },
      {
        id: 'vendor2',
        companyName: 'Fort Lauderdale Vendor',
        tier: 'tier2',
        locations: [
          { address: 'Fort Lauderdale HQ', latitude: 26.122439, longitude: -80.137314, isHQ: true },
        ],
      },
      {
        id: 'vendor3',
        companyName: 'New York Vendor',
        tier: 'tier2',
        locations: [
          { address: 'New York HQ', latitude: 40.7128, longitude: -74.0060, isHQ: true },
        ],
      },
    ];

    it('should find vendors within 50km of Miami', () => {
      // Search center: Miami (25.7617, -80.1918)
      // Radius: 50km
      const results = findVendorsWithinRadius(mockVendors, 25.7617, -80.1918, 50);

      // Should find Miami (0km) and Fort Lauderdale (~42km)
      expect(results).toHaveLength(2);
      expect(results.find((v: any) => v.id === 'vendor1')).toBeDefined();
      expect(results.find((v: any) => v.id === 'vendor2')).toBeDefined();
      expect(results.find((v: any) => v.id === 'vendor3')).toBeUndefined();
    });

    it('should find vendors within 100km of Fort Lauderdale', () => {
      // Search center: Fort Lauderdale (26.122439, -80.137314)
      // Radius: 100km
      const results = findVendorsWithinRadius(mockVendors, 26.122439, -80.137314, 100);

      // Should find Fort Lauderdale (0km) and Miami (~42km)
      expect(results).toHaveLength(2);
      expect(results.find((v: any) => v.id === 'vendor1')).toBeDefined();
      expect(results.find((v: any) => v.id === 'vendor2')).toBeDefined();
      expect(results.find((v: any) => v.id === 'vendor3')).toBeUndefined();
    });

    it('should not find any vendors with very small radius', () => {
      // Search from a point between Miami and Fort Lauderdale
      // Radius: 1km
      const results = findVendorsWithinRadius(mockVendors, 26.0, -80.15, 1);

      expect(results).toHaveLength(0);
    });

    it('should filter locations by tier before searching', () => {
      const tieredVendors = [
        {
          id: 'tier1-vendor',
          companyName: 'Tier 1 Vendor',
          tier: 'tier1',
          locations: [
            { address: 'HQ', latitude: 25.7617, longitude: -80.1918, isHQ: true },
            { address: 'Branch', latitude: 26.122439, longitude: -80.137314, isHQ: false },
          ],
        },
      ];

      // Search near the branch location
      // For tier1, only HQ should be visible, so vendor should not be found
      const resultsNearBranch = findVendorsWithinRadius(tieredVendors, 26.122439, -80.137314, 10);
      expect(resultsNearBranch).toHaveLength(0);

      // Search near the HQ location
      // Should find the vendor
      const resultsNearHQ = findVendorsWithinRadius(tieredVendors, 25.7617, -80.1918, 10);
      expect(resultsNearHQ).toHaveLength(1);
    });
  });

  describe('Comprehensive Validation Integration', () => {
    it('should validate complex location scenario', () => {
      const complexLocations = [
        {
          address: '123 Ocean Drive, Miami Beach, FL 33139',
          latitude: 25.7907,
          longitude: -80.1300,
          city: 'Miami Beach',
          country: 'United States',
          isHQ: true,
        },
        {
          address: '456 Collins Ave, Miami Beach, FL 33140',
          latitude: 25.8153,
          longitude: -80.1265,
          city: 'Miami Beach',
          country: 'United States',
          isHQ: false,
        },
      ];

      const validation = validateVendorLocations(complexLocations);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should validate and auto-designate HQ in integration workflow', () => {
      const locationsWithoutHQ = [
        {
          address: 'Location 1',
          latitude: 25.7617,
          longitude: -80.1918,
        },
        {
          address: 'Location 2',
          latitude: 26.122439,
          longitude: -80.137314,
        },
      ];

      // Auto-designate HQ
      const withHQ = autoDesignateHQLocation(locationsWithoutHQ);

      // Validate the result
      const validation = validateVendorLocations(withHQ);
      expect(validation.valid).toBe(true);
      expect(withHQ[0].isHQ).toBe(true);
      expect(withHQ[1].isHQ).toBe(false);
    });

    it('should enforce tier restrictions on multiple locations', () => {
      const multipleLocations = [
        { address: 'HQ', isHQ: true },
        { address: 'Branch', isHQ: false },
      ];

      const tier2Result = checkTierLocationAccess('tier2', multipleLocations);
      expect(tier2Result.allowed).toBe(true);

      const tier1Result = checkTierLocationAccess('tier1', multipleLocations);
      expect(tier1Result.allowed).toBe(false);
      expect(tier1Result.error).toBe('Multiple locations require Tier 2 subscription');

      const freeResult = checkTierLocationAccess('free', multipleLocations);
      expect(freeResult.allowed).toBe(false);
      expect(freeResult.error).toBe('Multiple locations require Tier 2 subscription');
    });
  });
});
