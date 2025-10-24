/**
 * Vendor Update Schema Contract Tests
 *
 * Tests that the vendor update validation schema aligns with:
 * - VendorLocation TypeScript interface
 * - API endpoint expectations
 * - Frontend request structure
 *
 * Total: 12 contract test cases
 */

import { safeValidateVendorUpdate, validateVendorUpdate } from '@/lib/validation/vendor-update-schema';
import { VendorLocation } from '@/lib/types';

describe('Vendor Update Schema Contract Tests', () => {
  describe('Locations Field Validation', () => {
    it('should accept valid locations array', () => {
      const data = {
        locations: [
          {
            id: 'loc-1',
            locationName: 'Monaco Office',
            address: 'Port de Monaco',
            city: 'Monaco',
            country: 'Monaco',
            postalCode: '98000',
            latitude: 43.738414,
            longitude: 7.424603,
            isHQ: true,
          },
        ] as VendorLocation[],
      };

      const result = safeValidateVendorUpdate(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.locations).toBeDefined();
        expect(result.data.locations).toHaveLength(1);
      }
    });

    it('should accept multiple locations', () => {
      const data = {
        locations: [
          {
            address: 'HQ Address',
            latitude: 26.122439,
            longitude: -80.137314,
            isHQ: true,
          },
          {
            address: 'Branch Office',
            latitude: 40.7128,
            longitude: -74.006,
            isHQ: false,
          },
        ] as VendorLocation[],
      };

      const result = safeValidateVendorUpdate(data);
      expect(result.success).toBe(true);
    });

    it('should accept empty locations array', () => {
      const data = {
        locations: [] as VendorLocation[],
      };

      const result = safeValidateVendorUpdate(data);
      expect(result.success).toBe(true);
    });

    it('should accept locations field as optional', () => {
      const data = {
        companyName: 'Test Company',
        // No locations field
      };

      const result = safeValidateVendorUpdate(data);
      expect(result.success).toBe(true);
    });
  });

  describe('Coordinate Validation', () => {
    it('should reject latitude below -90', () => {
      const data = {
        locations: [
          {
            address: 'Test',
            latitude: -91,
            longitude: 0,
            isHQ: true,
          },
        ],
      };

      const result = safeValidateVendorUpdate(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.errors[0].message;
        expect(errorMessage).toContain('Latitude must be between -90 and 90');
      }
    });

    it('should reject latitude above 90', () => {
      const data = {
        locations: [
          {
            address: 'Test',
            latitude: 91,
            longitude: 0,
            isHQ: true,
          },
        ],
      };

      const result = safeValidateVendorUpdate(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.errors[0].message;
        expect(errorMessage).toContain('Latitude must be between -90 and 90');
      }
    });

    it('should reject longitude below -180', () => {
      const data = {
        locations: [
          {
            address: 'Test',
            latitude: 0,
            longitude: -181,
            isHQ: true,
          },
        ],
      };

      const result = safeValidateVendorUpdate(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.errors[0].message;
        expect(errorMessage).toContain('Longitude must be between -180 and 180');
      }
    });

    it('should reject longitude above 180', () => {
      const data = {
        locations: [
          {
            address: 'Test',
            latitude: 0,
            longitude: 181,
            isHQ: true,
          },
        ],
      };

      const result = safeValidateVendorUpdate(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.errors[0].message;
        expect(errorMessage).toContain('Longitude must be between -180 and 180');
      }
    });
  });

  describe('HQ Designation Validation', () => {
    it('should reject multiple HQ locations', () => {
      const data = {
        locations: [
          {
            address: 'HQ 1',
            isHQ: true,
          },
          {
            address: 'HQ 2',
            isHQ: true,
          },
        ],
      };

      const result = safeValidateVendorUpdate(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.errors[0].message;
        expect(errorMessage).toContain('Only one location can be designated as Headquarters');
      }
    });

    it('should accept single HQ location', () => {
      const data = {
        locations: [
          {
            address: 'HQ',
            isHQ: true,
          },
        ],
      };

      const result = safeValidateVendorUpdate(data);
      expect(result.success).toBe(true);
    });

    it('should accept one HQ and multiple non-HQ locations', () => {
      const data = {
        locations: [
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
        ],
      };

      const result = safeValidateVendorUpdate(data);
      expect(result.success).toBe(true);
    });
  });

  describe('String Length Validation', () => {
    it('should reject address over 500 characters', () => {
      const data = {
        locations: [
          {
            address: 'A'.repeat(501),
            isHQ: true,
          },
        ],
      };

      const result = safeValidateVendorUpdate(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errorMessage = result.error.errors[0].message;
        expect(errorMessage).toContain('Address must not exceed 500 characters');
      }
    });
  });
});
