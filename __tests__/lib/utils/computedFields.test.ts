/**
 * Tests for computedFields utilities
 */

import {
  computeYearsInBusiness,
  computeAgeCategory,
  computeProfileCompletion,
  computeProfileStrength,
  formatNumber,
  formatLargeNumber,
  isVendorPublishReady,
  getMissingRequiredFields,
} from '@/lib/utils/computedFields';

describe('computedFields', () => {
  describe('computeYearsInBusiness', () => {
    const currentYear = new Date().getFullYear();

    it('should calculate years correctly', () => {
      expect(computeYearsInBusiness(2020)).toBe(currentYear - 2020);
      expect(computeYearsInBusiness(2000)).toBe(currentYear - 2000);
      expect(computeYearsInBusiness(1990)).toBe(currentYear - 1990);
    });

    it('should return null for invalid years', () => {
      expect(computeYearsInBusiness(1700)).toBeNull();
      expect(computeYearsInBusiness(currentYear + 1)).toBeNull();
      expect(computeYearsInBusiness(null)).toBeNull();
      expect(computeYearsInBusiness(undefined)).toBeNull();
    });

    it('should handle current year', () => {
      expect(computeYearsInBusiness(currentYear)).toBe(0);
    });
  });

  describe('computeAgeCategory', () => {
    it('should return correct categories', () => {
      expect(computeAgeCategory(new Date().getFullYear() - 2)).toBe('Emerging');
      expect(computeAgeCategory(new Date().getFullYear() - 7)).toBe('Growing');
      expect(computeAgeCategory(new Date().getFullYear() - 15)).toBe('Established');
      expect(computeAgeCategory(new Date().getFullYear() - 25)).toBe('Industry Veteran');
    });

    it('should return null for invalid years', () => {
      expect(computeAgeCategory(null)).toBeNull();
      expect(computeAgeCategory(undefined)).toBeNull();
    });
  });

  describe('computeProfileCompletion', () => {
    it('should return low percentage for minimal profile', () => {
      const vendor = {
        companyName: 'Test Company',
        slug: 'test',
        description: 'Test description',
      };
      const completion = computeProfileCompletion(vendor);
      expect(completion).toBeLessThan(50);
    });

    it('should return high percentage for complete profile', () => {
      const vendor = {
        companyName: 'Test Company',
        slug: 'test',
        description: 'Test description',
        contactEmail: 'test@example.com',
        logo: 'logo.png',
        website: 'https://example.com',
        linkedinUrl: 'https://linkedin.com',
        foundedYear: 2000,
        longDescription: 'Long description here',
        certifications: [{ name: 'ISO' }],
        awards: [{ title: 'Best Company' }],
      };
      const completion = computeProfileCompletion(vendor);
      expect(completion).toBeGreaterThan(70);
    });

    it('should ignore empty arrays and strings', () => {
      const vendor = {
        companyName: 'Test Company',
        slug: 'test',
        description: 'Test description',
        certifications: [],
        website: '',
      };
      const completion = computeProfileCompletion(vendor);
      expect(completion).toBeLessThan(50);
    });
  });

  describe('computeProfileStrength', () => {
    it('should return correct strength levels', () => {
      expect(computeProfileStrength(20).label).toBe('Weak');
      expect(computeProfileStrength(50).label).toBe('Fair');
      expect(computeProfileStrength(75).label).toBe('Good');
      expect(computeProfileStrength(95).label).toBe('Excellent');
    });

    it('should have appropriate colors', () => {
      expect(computeProfileStrength(20).color).toBe('red');
      expect(computeProfileStrength(50).color).toBe('orange');
      expect(computeProfileStrength(75).color).toBe('blue');
      expect(computeProfileStrength(95).color).toBe('green');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with thousand separators', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(123456)).toBe('123,456');
    });

    it('should handle edge cases', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(null)).toBe('0');
      expect(formatNumber(undefined)).toBe('0');
    });
  });

  describe('formatLargeNumber', () => {
    it('should format with K suffix', () => {
      expect(formatLargeNumber(1000)).toBe('1.0K');
      expect(formatLargeNumber(5500)).toBe('5.5K');
      expect(formatLargeNumber(999999)).toBe('1000.0K');
    });

    it('should format with M suffix', () => {
      expect(formatLargeNumber(1000000)).toBe('1.0M');
      expect(formatLargeNumber(2500000)).toBe('2.5M');
    });

    it('should not format small numbers', () => {
      expect(formatLargeNumber(999)).toBe('999');
      expect(formatLargeNumber(500)).toBe('500');
    });

    it('should handle edge cases', () => {
      expect(formatLargeNumber(0)).toBe('0');
      expect(formatLargeNumber(null)).toBe('0');
      expect(formatLargeNumber(undefined)).toBe('0');
    });
  });

  describe('isVendorPublishReady', () => {
    it('should return true for complete required fields', () => {
      const vendor = {
        companyName: 'Test Company',
        slug: 'test',
        description: 'Test description',
        contactEmail: 'test@example.com',
      };
      expect(isVendorPublishReady(vendor)).toBe(true);
    });

    it('should return false for missing fields', () => {
      const vendor = {
        companyName: 'Test Company',
        slug: 'test',
      };
      expect(isVendorPublishReady(vendor)).toBe(false);
    });

    it('should return false for empty fields', () => {
      const vendor = {
        companyName: 'Test Company',
        slug: '',
        description: 'Test description',
        contactEmail: 'test@example.com',
      };
      expect(isVendorPublishReady(vendor)).toBe(false);
    });
  });

  describe('getMissingRequiredFields', () => {
    it('should return empty array for complete profile', () => {
      const vendor = {
        companyName: 'Test Company',
        slug: 'test',
        description: 'Test description',
        contactEmail: 'test@example.com',
        logo: 'logo.png',
      };
      expect(getMissingRequiredFields(vendor)).toEqual([]);
    });

    it('should return missing field names', () => {
      const vendor = {
        companyName: 'Test Company',
        slug: 'test',
      };
      const missing = getMissingRequiredFields(vendor);
      expect(missing).toContain('Short Description');
      expect(missing).toContain('Contact Email');
      expect(missing).toContain('Company Logo');
    });

    it('should detect empty fields as missing', () => {
      const vendor = {
        companyName: 'Test Company',
        slug: '',
        description: '',
        contactEmail: '',
        logo: '',
      };
      const missing = getMissingRequiredFields(vendor);
      expect(missing.length).toBeGreaterThan(0);
    });
  });
});
