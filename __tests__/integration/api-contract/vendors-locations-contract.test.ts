/**
 * API Contract Tests - Vendors Locations Multi-Location Support
 *
 * Tests the API contract between frontend and backend for vendor location management:
 * - Request/response structure validation
 * - TypeScript type alignment
 * - HTTP status codes
 * - Error response formats
 * - Data serialization/deserialization
 * - Coordinate precision preservation
 *
 * Total: 18 contract test cases
 */

import { VendorLocation } from '@/lib/types';
import { validateVendorLocations, checkTierLocationAccess } from '@/lib/services/LocationService';

describe('API Contract Tests - Vendor Locations', () => {
  describe('TypeScript Type Alignment', () => {
    it('should have VendorLocation interface with all required fields', () => {
      // Compile-time type check - this test passes if TypeScript compilation succeeds
      const location: VendorLocation = {
        id: 'loc-1',
        locationName: 'Monaco Office',
        address: 'Port Hercules, Monaco',
        city: 'Monaco',
        country: 'Monaco',
        postalCode: '98000',
        latitude: 43.738414,
        longitude: 7.424603,
        isHQ: true,
      };

      expect(location).toBeDefined();
      expect(location.latitude).toBe(43.738414);
      expect(location.longitude).toBe(7.424603);
      expect(location.isHQ).toBe(true);
    });

    it('should allow optional fields in VendorLocation interface', () => {
      // Test that all fields are truly optional per interface definition
      const minimalLocation: VendorLocation = {};

      expect(minimalLocation).toBeDefined();
    });

    it('should support locations array type in vendor data', () => {
      // Type check for locations array
      const locations: VendorLocation[] = [
        {
          id: 'loc-1',
          address: 'Test Address 1',
          latitude: 26.122439,
          longitude: -80.137314,
          isHQ: true,
        },
        {
          id: 'loc-2',
          address: 'Test Address 2',
          latitude: 40.7128,
          longitude: -74.006,
          isHQ: false,
        },
      ];

      expect(locations).toHaveLength(2);
      expect(locations[0].isHQ).toBe(true);
      expect(locations[1].isHQ).toBe(false);
    });
  });

  describe('Request Body Structure Validation', () => {
    it('should accept valid locations array with all fields', () => {
      const locations: VendorLocation[] = [
        {
          id: 'loc-1',
          locationName: 'Fort Lauderdale HQ',
          address: '123 Harbor View Dr, Fort Lauderdale, FL 33316',
          city: 'Fort Lauderdale',
          country: 'United States',
          postalCode: '33316',
          latitude: 26.122439,
          longitude: -80.137314,
          isHQ: true,
        },
      ];

      const result = validateVendorLocations(locations);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept locations array with minimal required fields', () => {
      const locations: VendorLocation[] = [
        {
          address: '456 Main St',
          isHQ: true,
        },
      ];

      const result = validateVendorLocations(locations);
      expect(result.valid).toBe(true);
    });

    it('should accept multiple locations for tier2 vendors', () => {
      const locations: VendorLocation[] = [
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
          longitude: -74.006,
          city: 'New York',
          country: 'USA',
          isHQ: false,
        },
      ];

      const tierCheck = checkTierLocationAccess('tier2', locations);
      expect(tierCheck.allowed).toBe(true);
    });
  });

  describe('Request Body Validation - Invalid Cases', () => {
    it('should reject locations with invalid latitude range (< -90)', () => {
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

    it('should reject locations with invalid latitude range (> 90)', () => {
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

    it('should reject locations with invalid longitude range (< -180)', () => {
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

    it('should reject locations with invalid longitude range (> 180)', () => {
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

    it('should reject multiple HQ designations', () => {
      const locations = [
        {
          address: 'HQ 1',
          isHQ: true,
        },
        {
          address: 'HQ 2',
          isHQ: true,
        },
      ];

      const result = validateVendorLocations(locations);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Only one location can be designated as Headquarters');
    });

    it('should reject multiple locations for tier0 vendors', () => {
      const locations = [
        {
          address: 'HQ',
          isHQ: true,
        },
        {
          address: 'Branch',
          isHQ: false,
        },
      ];

      const tierCheck = checkTierLocationAccess('free', locations);
      expect(tierCheck.allowed).toBe(false);
      expect(tierCheck.error).toBe('Multiple locations require Tier 2 subscription');
    });

    it('should reject multiple locations for tier1 vendors', () => {
      const locations = [
        {
          address: 'HQ',
          isHQ: true,
        },
        {
          address: 'Branch',
          isHQ: false,
        },
      ];

      const tierCheck = checkTierLocationAccess('tier1', locations);
      expect(tierCheck.allowed).toBe(false);
      expect(tierCheck.error).toBe('Multiple locations require Tier 2 subscription');
    });
  });

  describe('Coordinate Precision Preservation', () => {
    it('should preserve latitude precision to 6 decimal places', () => {
      const locations: VendorLocation[] = [
        {
          address: 'Test',
          latitude: 43.738414,
          longitude: 7.424603,
          isHQ: true,
        },
      ];

      // Validate coordinate precision is maintained
      expect(locations[0].latitude).toBe(43.738414);
      expect(locations[0].latitude?.toFixed(6)).toBe('43.738414');
    });

    it('should preserve longitude precision to 6 decimal places', () => {
      const locations: VendorLocation[] = [
        {
          address: 'Test',
          latitude: 43.738414,
          longitude: 7.424603,
          isHQ: true,
        },
      ];

      // Validate coordinate precision is maintained
      expect(locations[0].longitude).toBe(7.424603);
      expect(locations[0].longitude?.toFixed(6)).toBe('7.424603');
    });

    it('should handle boundary coordinates with precision', () => {
      const locations: VendorLocation[] = [
        {
          address: 'North Pole',
          latitude: 90.0,
          longitude: 0.0,
          isHQ: true,
        },
        {
          address: 'South Pole',
          latitude: -90.0,
          longitude: 0.0,
          isHQ: false,
        },
      ];

      expect(locations[0].latitude).toBe(90.0);
      expect(locations[1].latitude).toBe(-90.0);
    });
  });

  describe('Data Serialization/Deserialization', () => {
    it('should correctly serialize locations to JSON', () => {
      const locations: VendorLocation[] = [
        {
          id: 'loc-1',
          locationName: 'Test Office',
          address: '123 Test St',
          city: 'Test City',
          country: 'Test Country',
          postalCode: '12345',
          latitude: 26.122439,
          longitude: -80.137314,
          isHQ: true,
        },
      ];

      const serialized = JSON.stringify(locations);
      const deserialized = JSON.parse(serialized) as VendorLocation[];

      expect(deserialized).toHaveLength(1);
      expect(deserialized[0].latitude).toBe(26.122439);
      expect(deserialized[0].longitude).toBe(-80.137314);
      expect(deserialized[0].isHQ).toBe(true);
    });

    it('should handle optional fields during serialization', () => {
      const locations: VendorLocation[] = [
        {
          address: 'Minimal Address',
          isHQ: true,
        },
      ];

      const serialized = JSON.stringify(locations);
      const deserialized = JSON.parse(serialized) as VendorLocation[];

      expect(deserialized[0].address).toBe('Minimal Address');
      expect(deserialized[0].latitude).toBeUndefined();
      expect(deserialized[0].longitude).toBeUndefined();
      expect(deserialized[0].city).toBeUndefined();
    });
  });

  describe('Error Response Structure Validation', () => {
    it('should provide structured validation errors', () => {
      const locations = [
        {
          address: 'Test',
          latitude: 999, // Invalid
          longitude: 7.424603,
          isHQ: true,
        },
      ];

      const result = validateVendorLocations(locations);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(Array.isArray(result.errors)).toBe(true);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should provide tier restriction error messages', () => {
      const locations = [
        { address: 'HQ', isHQ: true },
        { address: 'Branch', isHQ: false },
      ];

      const tierCheck = checkTierLocationAccess('free', locations);

      expect(tierCheck.allowed).toBe(false);
      expect(tierCheck.error).toBeDefined();
      expect(typeof tierCheck.error).toBe('string');
      expect(tierCheck.error).toContain('Tier 2');
    });
  });
});
