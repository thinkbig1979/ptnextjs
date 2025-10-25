/**
 * Integration Tests - Vendor API Service Layer
 *
 * Tests the service layer integration for vendor API endpoints:
 * - TierValidationService + VendorComputedFieldsService integration
 * - Field access validation across tiers
 * - Computed field calculation
 * - Location limit enforcement
 * - Error handling scenarios
 *
 * Total: 45+ integration test scenarios
 */

import { TierValidationService } from '@/lib/services/TierValidationService';
import { VendorComputedFieldsService } from '@/lib/services/VendorComputedFieldsService';
import type { Tier } from '@/lib/services/TierService';

describe('Vendor API Service Integration Tests', () => {
  /**
   * Tier Validation Integration Tests
   */
  describe('TierValidationService Integration', () => {
    describe('Field Access Validation', () => {
      it('should validate free tier can access free tier fields', () => {
        const fields = ['companyName', 'description', 'contactEmail'];
        const result = TierValidationService.validateFieldsAccess('free', fields);

        expect(result.valid).toBe(true);
        expect(result.errors).toBeUndefined();
      });

      it('should reject free tier accessing tier1 fields', () => {
        const fields = ['website', 'linkedinUrl'];
        const result = TierValidationService.validateFieldsAccess('free', fields);

        expect(result.valid).toBe(false);
        expect(result.restrictedFields).toEqual(['website', 'linkedinUrl']);
        expect(result.errors).toBeDefined();
      });

      it('should validate tier1 can access tier1+ fields', () => {
        const fields = ['companyName', 'website', 'linkedinUrl', 'certifications'];
        const result = TierValidationService.validateFieldsAccess('tier1', fields);

        expect(result.valid).toBe(true);
      });

      it('should reject tier1 accessing tier2 fields', () => {
        const fields = ['featuredInCategory', 'locations'];
        const result = TierValidationService.validateFieldsAccess('tier1', fields);

        expect(result.valid).toBe(false);
        expect(result.restrictedFields).toContain('featuredInCategory');
        expect(result.restrictedFields).toContain('locations');
      });

      it('should validate tier2 can access tier2+ fields', () => {
        const fields = ['website', 'locations', 'featuredInCategory', 'apiAccess'];
        const result = TierValidationService.validateFieldsAccess('tier2', fields);

        expect(result.valid).toBe(true);
      });

      it('should reject tier2 accessing tier3 fields', () => {
        const fields = ['promotionPack', 'editorialContent'];
        const result = TierValidationService.validateFieldsAccess('tier2', fields);

        expect(result.valid).toBe(false);
        expect(result.restrictedFields).toEqual(['promotionPack', 'editorialContent']);
      });

      it('should validate tier3 can access all fields', () => {
        const fields = [
          'companyName',
          'website',
          'locations',
          'featuredInCategory',
          'promotionPack',
          'editorialContent',
        ];
        const result = TierValidationService.validateFieldsAccess('tier3', fields);

        expect(result.valid).toBe(true);
      });
    });

    describe('Location Limit Validation', () => {
      it('should allow 1 location for free tier', () => {
        const result = TierValidationService.validateLocationLimit('free', 1);

        expect(result.valid).toBe(true);
        expect(result.maxAllowed).toBe(1);
        expect(result.current).toBe(1);
      });

      it('should reject 2+ locations for free tier', () => {
        const result = TierValidationService.validateLocationLimit('free', 2);

        expect(result.valid).toBe(false);
        expect(result.maxAllowed).toBe(1);
        expect(result.current).toBe(2);
        expect(result.message).toContain('maximum 1 location');
      });

      it('should allow up to 3 locations for tier1', () => {
        const result = TierValidationService.validateLocationLimit('tier1', 3);

        expect(result.valid).toBe(true);
        expect(result.maxAllowed).toBe(3);
      });

      it('should reject 4+ locations for tier1', () => {
        const result = TierValidationService.validateLocationLimit('tier1', 4);

        expect(result.valid).toBe(false);
        expect(result.message).toContain('maximum 3 location');
      });

      it('should allow up to 10 locations for tier2', () => {
        const result = TierValidationService.validateLocationLimit('tier2', 10);

        expect(result.valid).toBe(true);
        expect(result.maxAllowed).toBe(10);
      });

      it('should reject 11+ locations for tier2', () => {
        const result = TierValidationService.validateLocationLimit('tier2', 11);

        expect(result.valid).toBe(false);
        expect(result.message).toContain('maximum 10 location');
      });

      it('should allow unlimited locations for tier3', () => {
        const result = TierValidationService.validateLocationLimit('tier3', 100);

        expect(result.valid).toBe(true);
        expect(result.maxAllowed).toBe(999);
      });
    });

    describe('Feature Access Validation', () => {
      it('should allow multipleLocations for tier1+', () => {
        expect(TierValidationService.canAccessFeature('tier1', 'multipleLocations')).toBe(true);
        expect(TierValidationService.canAccessFeature('tier2', 'multipleLocations')).toBe(true);
        expect(TierValidationService.canAccessFeature('tier3', 'multipleLocations')).toBe(true);
      });

      it('should reject multipleLocations for free tier', () => {
        expect(TierValidationService.canAccessFeature('free', 'multipleLocations')).toBe(false);
      });

      it('should allow productManagement for tier2+', () => {
        expect(TierValidationService.canAccessFeature('tier2', 'productManagement')).toBe(true);
        expect(TierValidationService.canAccessFeature('tier3', 'productManagement')).toBe(true);
      });

      it('should reject productManagement for tier1 and below', () => {
        expect(TierValidationService.canAccessFeature('free', 'productManagement')).toBe(false);
        expect(TierValidationService.canAccessFeature('tier1', 'productManagement')).toBe(false);
      });

      it('should allow promotionPack only for tier3', () => {
        expect(TierValidationService.canAccessFeature('tier3', 'promotionPack')).toBe(true);
        expect(TierValidationService.canAccessFeature('tier2', 'promotionPack')).toBe(false);
        expect(TierValidationService.canAccessFeature('tier1', 'promotionPack')).toBe(false);
      });
    });

    describe('Tier Change Validation', () => {
      it('should allow tier upgrade without data', () => {
        const vendorData = {
          companyName: 'Test Vendor',
          description: 'Description',
        };

        const result = TierValidationService.validateTierChange('free', 'tier1', vendorData);

        expect(result.valid).toBe(true);
        expect(result.errors).toBeUndefined();
      });

      it('should reject tier downgrade with restricted data', () => {
        const vendorData = {
          companyName: 'Test Vendor',
          website: 'https://example.com',
          linkedinUrl: 'https://linkedin.com/company/test',
        };

        const result = TierValidationService.validateTierChange('tier1', 'free', vendorData);

        expect(result.valid).toBe(false);
        expect(result.errors).toBeDefined();
        expect(result.errors?.some((e) => e.includes('website'))).toBe(true);
      });

      it('should reject downgrade when locations exceed new tier limit', () => {
        const vendorData = {
          companyName: 'Test Vendor',
          locations: [
            { address: 'Location 1', isHQ: true },
            { address: 'Location 2', isHQ: false },
            { address: 'Location 3', isHQ: false },
          ],
        };

        const result = TierValidationService.validateTierChange('tier1', 'free', vendorData);

        expect(result.valid).toBe(false);
        expect(result.errors?.some((e) => e.includes('location'))).toBe(true);
      });

      it('should allow downgrade when data is compatible', () => {
        const vendorData = {
          companyName: 'Test Vendor',
          description: 'Description',
          contactEmail: 'test@example.com',
        };

        const result = TierValidationService.validateTierChange('tier1', 'free', vendorData);

        expect(result.valid).toBe(true);
      });
    });

    describe('Get Accessible Fields', () => {
      it('should return correct fields for free tier', () => {
        const fields = TierValidationService.getAccessibleFields('free');

        expect(fields).toContain('companyName');
        expect(fields).toContain('description');
        expect(fields).toContain('contactEmail');
        expect(fields).not.toContain('website');
        expect(fields).not.toContain('locations');
      });

      it('should return correct fields for tier1', () => {
        const fields = TierValidationService.getAccessibleFields('tier1');

        expect(fields).toContain('companyName');
        expect(fields).toContain('website');
        expect(fields).toContain('linkedinUrl');
        expect(fields).toContain('certifications');
        expect(fields).not.toContain('locations');
        expect(fields).not.toContain('featuredInCategory');
      });

      it('should return correct fields for tier2', () => {
        const fields = TierValidationService.getAccessibleFields('tier2');

        expect(fields).toContain('companyName');
        expect(fields).toContain('website');
        expect(fields).toContain('locations');
        expect(fields).toContain('featuredInCategory');
        expect(fields).not.toContain('promotionPack');
      });

      it('should return all fields for tier3', () => {
        const fields = TierValidationService.getAccessibleFields('tier3');

        expect(fields).toContain('companyName');
        expect(fields).toContain('website');
        expect(fields).toContain('locations');
        expect(fields).toContain('featuredInCategory');
        expect(fields).toContain('promotionPack');
        expect(fields).toContain('editorialContent');
      });
    });
  });

  /**
   * Computed Fields Integration Tests
   */
  describe('VendorComputedFieldsService Integration', () => {
    describe('Years in Business Computation', () => {
      it('should compute yearsInBusiness correctly', () => {
        const currentYear = new Date().getFullYear();
        const years = VendorComputedFieldsService.computeYearsInBusiness(2000);

        expect(years).toBe(currentYear - 2000);
      });

      it('should compute 0 years for current year', () => {
        const currentYear = new Date().getFullYear();
        const years = VendorComputedFieldsService.computeYearsInBusiness(currentYear);

        expect(years).toBe(0);
      });

      it('should return null for undefined foundedYear', () => {
        const years = VendorComputedFieldsService.computeYearsInBusiness(undefined);

        expect(years).toBeNull();
      });

      it('should return null for null foundedYear', () => {
        const years = VendorComputedFieldsService.computeYearsInBusiness(null);

        expect(years).toBeNull();
      });

      it('should return null for invalid foundedYear (too old)', () => {
        const years = VendorComputedFieldsService.computeYearsInBusiness(1799);

        expect(years).toBeNull();
      });

      it('should return null for invalid foundedYear (future)', () => {
        const currentYear = new Date().getFullYear();
        const years = VendorComputedFieldsService.computeYearsInBusiness(currentYear + 1);

        expect(years).toBeNull();
      });

      it('should validate founded year correctly', () => {
        expect(VendorComputedFieldsService.isValidFoundedYear(2000)).toBe(true);
        expect(VendorComputedFieldsService.isValidFoundedYear(1800)).toBe(true);
        expect(VendorComputedFieldsService.isValidFoundedYear(1799)).toBe(false);
        expect(VendorComputedFieldsService.isValidFoundedYear(2050)).toBe(false);
        expect(VendorComputedFieldsService.isValidFoundedYear(undefined)).toBe(false);
        expect(VendorComputedFieldsService.isValidFoundedYear(null)).toBe(false);
      });
    });

    describe('Vendor Data Enrichment', () => {
      it('should enrich vendor with yearsInBusiness', () => {
        const currentYear = new Date().getFullYear();
        const vendor = {
          id: 'vendor-1',
          companyName: 'Test Vendor',
          foundedYear: 2010,
        };

        const enriched = VendorComputedFieldsService.enrichVendorData(vendor);

        expect(enriched.yearsInBusiness).toBe(currentYear - 2010);
        expect(enriched.id).toBe('vendor-1');
        expect(enriched.companyName).toBe('Test Vendor');
        expect(enriched.foundedYear).toBe(2010);
      });

      it('should enrich vendor without foundedYear', () => {
        const vendor = {
          id: 'vendor-1',
          companyName: 'Test Vendor',
        };

        const enriched = VendorComputedFieldsService.enrichVendorData(vendor);

        expect(enriched.yearsInBusiness).toBeUndefined();
        expect(enriched.id).toBe('vendor-1');
      });

      it('should enrich multiple vendors', () => {
        const currentYear = new Date().getFullYear();
        const vendors = [
          { id: 'vendor-1', companyName: 'Vendor 1', foundedYear: 2000 },
          { id: 'vendor-2', companyName: 'Vendor 2', foundedYear: 2010 },
          { id: 'vendor-3', companyName: 'Vendor 3', foundedYear: 2020 },
        ];

        const enriched = VendorComputedFieldsService.enrichVendorsData(vendors);

        expect(enriched).toHaveLength(3);
        expect(enriched[0].yearsInBusiness).toBe(currentYear - 2000);
        expect(enriched[1].yearsInBusiness).toBe(currentYear - 2010);
        expect(enriched[2].yearsInBusiness).toBe(currentYear - 2020);
      });

      it('should not mutate original vendor object', () => {
        const vendor = {
          id: 'vendor-1',
          companyName: 'Test Vendor',
          foundedYear: 2010,
        };

        const enriched = VendorComputedFieldsService.enrichVendorData(vendor);

        expect(vendor).not.toHaveProperty('yearsInBusiness');
        expect(enriched).toHaveProperty('yearsInBusiness');
      });
    });

    describe('Computed Metrics', () => {
      it('should compute all metrics for vendor', () => {
        const currentYear = new Date().getFullYear();
        const vendor = {
          companyName: 'Test Vendor',
          foundedYear: 2015,
        };

        const metrics = VendorComputedFieldsService.computeAllMetrics(vendor);

        expect(metrics.yearsInBusiness).toBe(currentYear - 2015);
      });

      it('should handle vendor without foundedYear', () => {
        const vendor = {
          companyName: 'Test Vendor',
        };

        const metrics = VendorComputedFieldsService.computeAllMetrics(vendor);

        expect(metrics.yearsInBusiness).toBeNull();
      });
    });

    describe('Founded Year Constraints', () => {
      it('should return correct year constraints', () => {
        const constraints = VendorComputedFieldsService.getFoundedYearConstraints();

        expect(constraints.min).toBe(1800);
        expect(constraints.max).toBe(new Date().getFullYear());
      });
    });
  });

  /**
   * Cross-Service Integration Tests
   */
  describe('TierValidation + ComputedFields Integration', () => {
    it('should validate and enrich vendor data for free tier', () => {
      const vendor = {
        companyName: 'Free Tier Vendor',
        description: 'Test description',
        contactEmail: 'test@example.com',
        foundedYear: 2020,
        tier: 'free' as Tier,
      };

      // Validate fields
      const fields = ['companyName', 'description', 'contactEmail'];
      const validation = TierValidationService.validateFieldsAccess(vendor.tier, fields);
      expect(validation.valid).toBe(true);

      // Enrich with computed fields
      const enriched = VendorComputedFieldsService.enrichVendorData(vendor);
      const currentYear = new Date().getFullYear();
      expect(enriched.yearsInBusiness).toBe(currentYear - 2020);
    });

    it('should validate tier1 fields and enrich data', () => {
      const vendor = {
        companyName: 'Tier 1 Vendor',
        website: 'https://example.com',
        linkedinUrl: 'https://linkedin.com/company/test',
        foundedYear: 2015,
        tier: 'tier1' as Tier,
      };

      const fields = ['companyName', 'website', 'linkedinUrl', 'foundedYear'];
      const validation = TierValidationService.validateFieldsAccess(vendor.tier, fields);
      expect(validation.valid).toBe(true);

      const enriched = VendorComputedFieldsService.enrichVendorData(vendor);
      const currentYear = new Date().getFullYear();
      expect(enriched.yearsInBusiness).toBe(currentYear - 2015);
    });

    it('should reject invalid tier field access even with valid computed fields', () => {
      const vendor = {
        companyName: 'Free Tier Vendor',
        website: 'https://example.com', // Tier 1+ field
        foundedYear: 2020,
        tier: 'free' as Tier,
      };

      const fields = ['companyName', 'website'];
      const validation = TierValidationService.validateFieldsAccess(vendor.tier, fields);
      expect(validation.valid).toBe(false);

      // Computed fields should still work
      const enriched = VendorComputedFieldsService.enrichVendorData(vendor);
      const currentYear = new Date().getFullYear();
      expect(enriched.yearsInBusiness).toBe(currentYear - 2020);
    });

    it('should handle location limits with enriched data', () => {
      const vendor = {
        companyName: 'Tier 1 Vendor',
        locations: [
          { address: 'Location 1', isHQ: true },
          { address: 'Location 2', isHQ: false },
        ],
        foundedYear: 2018,
        tier: 'tier1' as Tier,
      };

      // Validate location count
      const locationValidation = TierValidationService.validateLocationLimit(
        vendor.tier,
        vendor.locations.length
      );
      expect(locationValidation.valid).toBe(true);

      // Enrich with computed fields
      const enriched = VendorComputedFieldsService.enrichVendorData(vendor);
      const currentYear = new Date().getFullYear();
      expect(enriched.yearsInBusiness).toBe(currentYear - 2018);
    });
  });
});
