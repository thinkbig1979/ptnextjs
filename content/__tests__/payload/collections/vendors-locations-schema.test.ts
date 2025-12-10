/**
 * Backend Schema Tests - Vendors Locations Array Field
 *
 * Tests coverage:
 * - Locations array field validation (required fields, data types, ranges)
 * - HQ uniqueness constraint (exactly one location with isHQ: true)
 * - Tier-based access control (tier 0/1 cannot have multiple locations)
 * - Coordinate range validation (-90 to 90 lat, -180 to 180 long)
 * - Address field max length validation (500 chars)
 * - City/country field max length validation (255 chars)
 * - Auto-designation of first location as HQ
 *
 * Total: 20+ test cases
 */

import { validateVendorLocations, autoDesignateHQLocation, checkTierLocationAccess } from '@/lib/services/LocationService';

describe('Vendors Collection - Locations Array Schema Tests', () => {
  describe('Locations Array Field Validation', () => {
    it('should accept valid locations array with all fields', () => {
      const locations = [
        {
          address: '123 Harbor View Dr, Fort Lauderdale, FL 33316',
          latitude: 26.122439,
          longitude: -80.137314,
          city: 'Fort Lauderdale',
          country: 'United States',
          isHQ: true,
        },
      ];

      const result = validateVendorLocations(locations);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept locations array with minimal fields', () => {
      const locations = [
        {
          address: '456 Main St',
          isHQ: true,
        },
      ];

      const result = validateVendorLocations(locations);
      expect(result.valid).toBe(true);
    });

    it('should accept empty locations array', () => {
      const locations: any[] = [];

      const result = validateVendorLocations(locations);
      expect(result.valid).toBe(true);
    });

    it('should accept locations array with multiple locations', () => {
      const locations = [
        {
          address: 'HQ Address',
          latitude: 26.122439,
          longitude: -80.137314,
          city: 'Fort Lauderdale',
          country: 'USA',
          isHQ: true,
        },
        {
          address: 'Branch Office',
          latitude: 40.7128,
          longitude: -74.0060,
          city: 'New York',
          country: 'USA',
          isHQ: false,
        },
      ];

      const result = validateVendorLocations(locations);
      expect(result.valid).toBe(true);
    });
  });

  describe('HQ Uniqueness Validation', () => {
    it('should require exactly one HQ location when locations exist', () => {
      const locationsWithoutHQ = [
        {
          address: 'Location 1',
          isHQ: false,
        },
        {
          address: 'Location 2',
          isHQ: false,
        },
      ];

      const result = validateVendorLocations(locationsWithoutHQ);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Exactly one location must be designated as Headquarters');
    });

    it('should reject multiple HQ designations', () => {
      const multipleHQ = [
        {
          address: 'HQ 1',
          isHQ: true,
        },
        {
          address: 'HQ 2',
          isHQ: true,
        },
      ];

      const result = validateVendorLocations(multipleHQ);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Only one location can be designated as Headquarters');
    });

    it('should accept single location with isHQ: true', () => {
      const singleHQ = [
        {
          address: 'HQ Address',
          isHQ: true,
        },
      ];

      const result = validateVendorLocations(singleHQ);
      expect(result.valid).toBe(true);
    });

    it('should accept one HQ and multiple non-HQ locations', () => {
      const validLocations = [
        {
          address: 'HQ',
          isHQ: true,
        },
        {
          address: 'Branch 1',
          isHQ: false,
        },
        {
          address: 'Branch 2',
          isHQ: false,
        },
      ];

      const result = validateVendorLocations(validLocations);
      expect(result.valid).toBe(true);
    });
  });

  describe('Coordinate Range Validation', () => {
    it('should accept valid latitude range (-90 to 90)', () => {
      const locations = [
        {
          address: 'Test',
          latitude: 45.5,
          longitude: -120.0,
          isHQ: true,
        },
      ];

      const result = validateVendorLocations(locations);
      expect(result.valid).toBe(true);
    });

    it('should accept latitude boundary values', () => {
      const minLat = [{ address: 'South Pole', latitude: -90, longitude: 0, isHQ: true }];
      const maxLat = [{ address: 'North Pole', latitude: 90, longitude: 0, isHQ: true }];

      expect(validateVendorLocations(minLat).valid).toBe(true);
      expect(validateVendorLocations(maxLat).valid).toBe(true);
    });

    it('should reject latitude below -90', () => {
      const locations = [
        {
          address: 'Test',
          latitude: -91,
          longitude: 0,
          isHQ: true,
        },
      ];

      const result = validateVendorLocations(locations);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Latitude must be between -90 and 90');
    });

    it('should reject latitude above 90', () => {
      const locations = [
        {
          address: 'Test',
          latitude: 91,
          longitude: 0,
          isHQ: true,
        },
      ];

      const result = validateVendorLocations(locations);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Latitude must be between -90 and 90');
    });

    it('should accept valid longitude range (-180 to 180)', () => {
      const locations = [
        {
          address: 'Test',
          latitude: 0,
          longitude: -120.5,
          isHQ: true,
        },
      ];

      const result = validateVendorLocations(locations);
      expect(result.valid).toBe(true);
    });

    it('should accept longitude boundary values', () => {
      const minLong = [{ address: 'West', latitude: 0, longitude: -180, isHQ: true }];
      const maxLong = [{ address: 'East', latitude: 0, longitude: 180, isHQ: true }];

      expect(validateVendorLocations(minLong).valid).toBe(true);
      expect(validateVendorLocations(maxLong).valid).toBe(true);
    });

    it('should reject longitude below -180', () => {
      const locations = [
        {
          address: 'Test',
          latitude: 0,
          longitude: -181,
          isHQ: true,
        },
      ];

      const result = validateVendorLocations(locations);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Longitude must be between -180 and 180');
    });

    it('should reject longitude above 180', () => {
      const locations = [
        {
          address: 'Test',
          latitude: 0,
          longitude: 181,
          isHQ: true,
        },
      ];

      const result = validateVendorLocations(locations);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Longitude must be between -180 and 180');
    });
  });

  describe('String Length Validation', () => {
    it('should accept address at max length (500 chars)', () => {
      const locations = [
        {
          address: 'A'.repeat(500),
          isHQ: true,
        },
      ];

      const result = validateVendorLocations(locations);
      expect(result.valid).toBe(true);
    });

    it('should reject address over max length (500 chars)', () => {
      const locations = [
        {
          address: 'A'.repeat(501),
          isHQ: true,
        },
      ];

      const result = validateVendorLocations(locations);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Address must not exceed 500 characters');
    });

    it('should accept city at max length (255 chars)', () => {
      const locations = [
        {
          address: 'Test',
          city: 'C'.repeat(255),
          isHQ: true,
        },
      ];

      const result = validateVendorLocations(locations);
      expect(result.valid).toBe(true);
    });

    it('should reject city over max length (255 chars)', () => {
      const locations = [
        {
          address: 'Test',
          city: 'C'.repeat(256),
          isHQ: true,
        },
      ];

      const result = validateVendorLocations(locations);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('City must not exceed 255 characters');
    });

    it('should accept country at max length (255 chars)', () => {
      const locations = [
        {
          address: 'Test',
          country: 'C'.repeat(255),
          isHQ: true,
        },
      ];

      const result = validateVendorLocations(locations);
      expect(result.valid).toBe(true);
    });

    it('should reject country over max length (255 chars)', () => {
      const locations = [
        {
          address: 'Test',
          country: 'C'.repeat(256),
          isHQ: true,
        },
      ];

      const result = validateVendorLocations(locations);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Country must not exceed 255 characters');
    });
  });

  describe('Tier-Based Access Control', () => {
    it('should allow tier 2 vendor to have multiple locations', () => {
      const tier = 'tier2';
      const locations = [
        { address: 'HQ', isHQ: true },
        { address: 'Branch 1', isHQ: false },
        { address: 'Branch 2', isHQ: false },
      ];

      const result = checkTierLocationAccess(tier, locations);
      expect(result.allowed).toBe(true);
    });

    it('should block tier 0 (free) vendor from having multiple locations', () => {
      const tier = 'free';
      const locations = [
        { address: 'HQ', isHQ: true },
        { address: 'Branch 1', isHQ: false },
      ];

      const result = checkTierLocationAccess(tier, locations);
      expect(result.allowed).toBe(false);
      expect(result.error).toBe('Multiple locations require Tier 2 subscription');
    });

    it('should block tier 1 vendor from having multiple locations', () => {
      const tier = 'tier1';
      const locations = [
        { address: 'HQ', isHQ: true },
        { address: 'Branch 1', isHQ: false },
      ];

      const result = checkTierLocationAccess(tier, locations);
      expect(result.allowed).toBe(false);
      expect(result.error).toBe('Multiple locations require Tier 2 subscription');
    });

    it('should allow tier 0 vendor to have single location', () => {
      const tier = 'free';
      const locations = [
        { address: 'HQ', isHQ: true },
      ];

      const result = checkTierLocationAccess(tier, locations);
      expect(result.allowed).toBe(true);
    });

    it('should allow tier 1 vendor to have single location', () => {
      const tier = 'tier1';
      const locations = [
        { address: 'HQ', isHQ: true },
      ];

      const result = checkTierLocationAccess(tier, locations);
      expect(result.allowed).toBe(true);
    });
  });

  describe('Auto-HQ Designation Hook', () => {
    it('should auto-designate first location as HQ', () => {
      const locations = [
        {
          address: 'First Location',
          // isHQ not set
        },
      ];

      const result = autoDesignateHQLocation(locations);
      expect(result[0].isHQ).toBe(true);
    });

    it('should auto-designate first location when multiple locations without HQ', () => {
      const locations = [
        {
          address: 'Location 1',
          // isHQ not set
        },
        {
          address: 'Location 2',
          isHQ: false,
        },
      ];

      const result = autoDesignateHQLocation(locations);
      expect(result[0].isHQ).toBe(true);
      expect(result[1].isHQ).toBe(false);
    });

    it('should not override explicit HQ designation', () => {
      const locations = [
        {
          address: 'Not HQ',
          isHQ: false,
        },
        {
          address: 'Designated HQ',
          isHQ: true,
        },
      ];

      const result = autoDesignateHQLocation(locations);
      expect(result[0].isHQ).toBe(false);
      expect(result[1].isHQ).toBe(true);
    });

    it('should handle empty locations array', () => {
      const locations: any[] = [];

      const result = autoDesignateHQLocation(locations);
      expect(result).toEqual([]);
    });
  });
});
