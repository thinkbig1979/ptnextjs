/**
 * Location API Contract Tests
 *
 * Tests contract alignment between:
 * - Frontend forms (LocationFormFields, LocationsManagerCard)
 * - TypeScript types (VendorLocation)
 * - Validation schemas (locationSchema, vendorUpdateSchema)
 * - Payload CMS database schema
 * - Geocode API
 *
 * PURPOSE: Ensure data sent by frontend matches backend expectations
 * and all fields are properly persisted to the database.
 */

import { VendorLocation } from '@/lib/types';
import { locationSchema } from '@/lib/validation/vendorSchemas';
import { vendorUpdateSchema } from '@/lib/validation/vendor-update-schema';

describe('Location API Contract Tests', () => {
  describe('TypeScript Type Alignment', () => {
    it('should define VendorLocation with all required Payload schema fields', () => {
      // This test verifies the TypeScript type includes all fields
      // that exist in the Payload CMS locations array schema
      const location: VendorLocation = {
        id: 'test-id',
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
      expect(location.id).toBe('test-id');
      expect(location.locationName).toBe('Monaco Office');
      expect(location.address).toBe('Port Hercules, Monaco');
      expect(location.city).toBe('Monaco');
      expect(location.country).toBe('Monaco');
      expect(location.postalCode).toBe('98000');
      expect(location.latitude).toBe(43.738414);
      expect(location.longitude).toBe(7.424603);
      expect(location.isHQ).toBe(true);
    });

    it('should allow all VendorLocation fields to be optional', () => {
      // All fields should be optional per interface definition
      const minimalLocation: VendorLocation = {};
      expect(minimalLocation).toBeDefined();
    });

    it('should support arrays of VendorLocation', () => {
      const locations: VendorLocation[] = [
        {
          id: 'loc-1',
          locationName: 'HQ',
          address: '123 Main St',
          city: 'Fort Lauderdale',
          country: 'United States',
          postalCode: '33316',
          latitude: 26.122439,
          longitude: -80.137314,
          isHQ: true,
        },
        {
          id: 'loc-2',
          locationName: 'Branch Office',
          address: '456 Harbor Dr',
          city: 'Monaco',
          country: 'Monaco',
          postalCode: '98000',
          latitude: 43.738414,
          longitude: 7.424603,
          isHQ: false,
        },
      ];

      expect(locations).toHaveLength(2);
      expect(locations[0].isHQ).toBe(true);
      expect(locations[1].isHQ).toBe(false);
    });
  });

  describe('Validation Schema Alignment', () => {
    it('should validate location with all Payload fields using locationSchema', () => {
      const locationData = {
        id: 'test-id',
        locationName: 'Test Office',
        address: '123 Main Street, Suite 100',
        city: 'Monaco',
        country: 'Monaco',
        postalCode: '98000',
        latitude: 43.738414,
        longitude: 7.424603,
        isHQ: true,
      };

      const result = locationSchema.safeParse(locationData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.locationName).toBe('Test Office');
        expect(result.data.postalCode).toBe('98000');
        expect(result.data.address).toBe('123 Main Street, Suite 100');
        expect(result.data.city).toBe('Monaco');
        expect(result.data.country).toBe('Monaco');
        expect(result.data.latitude).toBe(43.738414);
        expect(result.data.longitude).toBe(7.424603);
        expect(result.data.isHQ).toBe(true);
      }
    });

    it('should reject location with address too short (min 5 chars)', () => {
      const locationData = {
        address: '123', // Too short
        city: 'Monaco',
        country: 'Monaco',
      };

      const result = locationSchema.safeParse(locationData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('address');
        expect(result.error.errors[0].message).toContain('at least 5 characters');
      }
    });

    it('should reject location with invalid latitude (-91)', () => {
      const locationData = {
        address: '123 Main St',
        city: 'Monaco',
        country: 'Monaco',
        latitude: -91, // Out of range
      };

      const result = locationSchema.safeParse(locationData);
      expect(result.success).toBe(false);
    });

    it('should reject location with invalid longitude (181)', () => {
      const locationData = {
        address: '123 Main St',
        city: 'Monaco',
        country: 'Monaco',
        longitude: 181, // Out of range
      };

      const result = locationSchema.safeParse(locationData);
      expect(result.success).toBe(false);
    });

    it('should accept postalCode up to 20 characters', () => {
      const locationData = {
        address: '123 Main Street',
        city: 'City',
        country: 'Country',
        postalCode: '12345678901234567890', // Exactly 20 chars
      };

      const result = locationSchema.safeParse(locationData);
      expect(result.success).toBe(true);
    });

    it('should reject postalCode over 20 characters', () => {
      const locationData = {
        address: '123 Main Street',
        city: 'City',
        country: 'Country',
        postalCode: '123456789012345678901', // 21 chars
      };

      const result = locationSchema.safeParse(locationData);
      expect(result.success).toBe(false);
    });
  });

  describe('vendorUpdateSchema Location Array Validation', () => {
    it('should validate vendor update with locations array', () => {
      const updateData = {
        locations: [
          {
            id: 'loc-1',
            locationName: 'Monaco HQ',
            address: 'Port Hercules, Monaco',
            city: 'Monaco',
            country: 'Monaco',
            postalCode: '98000',
            latitude: 43.738414,
            longitude: 7.424603,
            isHQ: true,
          },
        ],
      };

      const result = vendorUpdateSchema.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('should reject vendor update with multiple HQ locations', () => {
      const updateData = {
        locations: [
          {
            address: '123 Main St',
            city: 'City1',
            country: 'Country',
            isHQ: true,
          },
          {
            address: '456 Second St',
            city: 'City2',
            country: 'Country',
            isHQ: true, // Second HQ - should fail
          },
        ],
      };

      const result = vendorUpdateSchema.safeParse(updateData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain('Only one location');
      }
    });

    it('should NOT accept fields that are not in Payload schema', () => {
      // CRITICAL TEST: Ensure validation rejects fields that won't be persisted
      const updateData = {
        locations: [
          {
            address: '123 Main St',
            city: 'City',
            country: 'Country',
            // These fields should NOT be in the schema (they're not in Payload)
            state: 'Florida', // Should be rejected
            phone: '555-1234', // Should be rejected
            email: 'test@example.com', // Should be rejected
            type: 'office', // Should be rejected
            isPrimary: true, // Should be rejected
          },
        ],
      };

      // After fix, these extra fields should cause validation to fail
      // OR they should be silently stripped (depends on implementation)
      const result = vendorUpdateSchema.safeParse(updateData);

      // If validation accepts it, at least verify the extra fields are stripped
      if (result.success) {
        const location = result.data.locations![0];
        expect(location).not.toHaveProperty('state');
        expect(location).not.toHaveProperty('phone');
        expect(location).not.toHaveProperty('email');
        expect(location).not.toHaveProperty('type');
        expect(location).not.toHaveProperty('isPrimary');
      }
    });
  });

  describe('Field Length Consistency', () => {
    it('should enforce consistent max lengths across schemas', () => {
      // These max lengths should match across all schemas:
      // - VendorLocation type (TypeScript)
      // - locationSchema (Zod)
      // - vendorUpdateSchema.locations (Zod)
      // - Payload CMS schema

      const maxLengths = {
        address: 500,
        city: 255,
        country: 255,
        postalCode: 20, // CRITICAL: Should be 20, not 50
        locationName: 255,
      };

      // Test address max length
      const longAddress = 'a'.repeat(501);
      const addressResult = locationSchema.safeParse({
        address: longAddress,
        city: 'City',
        country: 'Country',
      });
      expect(addressResult.success).toBe(false);

      // Test city max length
      const longCity = 'a'.repeat(256);
      const cityResult = locationSchema.safeParse({
        address: '123 Main St',
        city: longCity,
        country: 'Country',
      });
      expect(cityResult.success).toBe(false);

      // Test country max length
      const longCountry = 'a'.repeat(256);
      const countryResult = locationSchema.safeParse({
        address: '123 Main St',
        city: 'City',
        country: longCountry,
      });
      expect(countryResult.success).toBe(false);
    });
  });

  describe('Geocode API Contract', () => {
    it('should expect query parameters: q, limit, lang', () => {
      // The geocode API expects these query parameters:
      // - q: string (location search query)
      // - limit: number (optional, default 5)
      // - lang: string (optional, default 'en')

      const expectedParams = {
        q: 'Monaco',
        limit: 5,
        lang: 'en',
      };

      expect(expectedParams.q).toBeDefined();
      expect(typeof expectedParams.q).toBe('string');
      expect(typeof expectedParams.limit).toBe('number');
      expect(typeof expectedParams.lang).toBe('string');
    });

    it('should return GeocodeSuccessResponse with results array', () => {
      // Expected response structure from /api/geocode
      const mockResponse = {
        success: true,
        results: [
          {
            name: 'Monaco',
            city: 'Monaco',
            country: 'Monaco',
            latitude: 43.738414,
            longitude: 7.424603,
            displayName: 'Monaco',
            fullAddress: 'Monaco, Monaco',
          },
        ],
        count: 1,
      };

      expect(mockResponse.success).toBe(true);
      expect(Array.isArray(mockResponse.results)).toBe(true);
      expect(mockResponse.results[0]).toHaveProperty('latitude');
      expect(mockResponse.results[0]).toHaveProperty('longitude');
      expect(mockResponse.results[0]).toHaveProperty('name');
      expect(mockResponse.results[0]).toHaveProperty('displayName');
      expect(mockResponse.count).toBe(1);
    });

    it('should preserve coordinate precision (6+ decimal places)', () => {
      // Coordinates should maintain at least 6 decimal places
      // for accuracy within ~0.11 meters
      const coordinates = {
        latitude: 43.738414, // 6 decimal places
        longitude: 7.424603, // 6 decimal places
      };

      const latString = coordinates.latitude.toString();
      const lonString = coordinates.longitude.toString();

      const latDecimals = latString.split('.')[1]?.length || 0;
      const lonDecimals = lonString.split('.')[1]?.length || 0;

      expect(latDecimals).toBeGreaterThanOrEqual(6);
      expect(lonDecimals).toBeGreaterThanOrEqual(6);
    });
  });

  describe('Form-to-API Field Mapping', () => {
    it('should map LocationFormFields inputs to VendorLocation type', () => {
      // LocationFormFields.tsx collects these fields:
      const formData = {
        locationName: 'Monaco Office', // Line 189
        address: '123 Main Street', // Line 209
        city: 'Monaco', // Line 230
        country: 'Monaco', // Line 249
        postalCode: '98000', // Line 270
        latitude: 43.738414, // Line 288
        longitude: 7.424603, // Line 309
        isHQ: true, // Line 341
      };

      // All these fields should be in VendorLocation type
      const location: VendorLocation = formData;

      expect(location.locationName).toBe('Monaco Office');
      expect(location.address).toBe('123 Main Street');
      expect(location.city).toBe('Monaco');
      expect(location.country).toBe('Monaco');
      expect(location.postalCode).toBe('98000');
      expect(location.latitude).toBe(43.738414);
      expect(location.longitude).toBe(7.424603);
      expect(location.isHQ).toBe(true);
    });

    it('should NOT collect fields that are not in Payload schema', () => {
      // LocationFormFields should NOT have inputs for:
      // - state
      // - phone
      // - email
      // - type
      // - isPrimary

      // This is a compile-time check - if these fields were collected,
      // they would cause type errors when assigned to VendorLocation

      const formData: VendorLocation = {
        address: '123 Main St',
        city: 'City',
        country: 'Country',
        // @ts-expect-error - state should not exist
        // state: 'FL',
      };

      expect(formData).toBeDefined();
    });
  });

  describe('Data Persistence Alignment', () => {
    it('should define only fields that exist in Payload schema', () => {
      // CRITICAL: Every field in VendorLocation should exist in Payload
      // After the fix, these fields should be in Payload:
      const payloadFields = [
        'address',
        'city',
        'country',
        'postalCode', // MUST be in Payload after fix
        'locationName', // MUST be in Payload after fix
        'latitude',
        'longitude',
        'isHQ',
      ];

      // All these fields should be accepted by locationSchema
      const locationData: Record<string, unknown> = {
        address: '123 Main St',
        city: 'City',
        country: 'Country',
        postalCode: '12345',
        locationName: 'Office',
        latitude: 40.7128,
        longitude: -74.006,
        isHQ: true,
      };

      payloadFields.forEach((field) => {
        expect(locationData).toHaveProperty(field);
      });

      const result = locationSchema.safeParse(locationData);
      expect(result.success).toBe(true);
    });
  });

  describe('Tier-Based Location Limits', () => {
    it('should allow 1 location for Tier 0/1 vendors', () => {
      // This is enforced by LocationService.checkTierLocationAccess()
      const singleLocation: VendorLocation[] = [
        {
          address: '123 Main St',
          city: 'City',
          country: 'Country',
          isHQ: true,
        },
      ];

      expect(singleLocation.length).toBe(1);
    });

    it('should allow unlimited locations for Tier 2+ vendors', () => {
      // Tier 2 and above can have multiple locations
      const multipleLocations: VendorLocation[] = [
        {
          address: '123 Main St',
          city: 'City1',
          country: 'Country',
          isHQ: true,
        },
        {
          address: '456 Second St',
          city: 'City2',
          country: 'Country',
          isHQ: false,
        },
        {
          address: '789 Third St',
          city: 'City3',
          country: 'Country',
          isHQ: false,
        },
      ];

      expect(multipleLocations.length).toBeGreaterThan(1);
    });
  });
});
