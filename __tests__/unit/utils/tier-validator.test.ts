import {
  filterFieldsByTier,
  getAllowedFieldsForTier,
  isFieldAllowedForTier,
  getTierLevel,
  hasTierAccess,
  type VendorTier,
} from '@/lib/utils/tier-validator';

describe('Tier Validator', () => {
  describe('getAllowedFieldsForTier', () => {
    it('should return correct fields for free tier', () => {
      const fields = getAllowedFieldsForTier('free');
      expect(fields).toEqual([
        'companyName',
        'description',
        'logo',
        'contactEmail',
        'contactPhone',
      ]);
    });

    it('should return correct fields for tier1', () => {
      const fields = getAllowedFieldsForTier('tier1');
      expect(fields).toContain('companyName');
      expect(fields).toContain('website');
      expect(fields).toContain('linkedinUrl');
      expect(fields).toContain('twitterUrl');
      expect(fields).toContain('certifications');
    });

    it('should return correct fields for tier2', () => {
      const fields = getAllowedFieldsForTier('tier2');
      expect(fields).toContain('companyName');
      expect(fields).toContain('website');
      expect(fields).toContain('certifications');
    });
  });

  describe('filterFieldsByTier', () => {
    it('should allow free tier fields for free tier vendor', () => {
      const updateData = {
        companyName: 'Test Company',
        description: 'Test description',
        contactEmail: 'test@example.com',
      };

      const filtered = filterFieldsByTier(updateData, 'free', false);
      expect(filtered).toEqual(updateData);
    });

    it('should reject tier1 fields for free tier vendor', () => {
      const updateData = {
        companyName: 'Test Company',
        website: 'https://example.com',
      };

      expect(() => filterFieldsByTier(updateData, 'free', false)).toThrow(
        /Tier restriction.*website/
      );
    });

    it('should allow tier1 fields for tier1 vendor', () => {
      const updateData = {
        companyName: 'Test Company',
        website: 'https://example.com',
        linkedinUrl: 'https://linkedin.com/company/test',
      };

      const filtered = filterFieldsByTier(updateData, 'tier1', false);
      expect(filtered).toEqual(updateData);
    });

    it('should allow all tier1 fields for tier2 vendor', () => {
      const updateData = {
        companyName: 'Test Company',
        website: 'https://example.com',
        certifications: [{ certification: 'ISO 9001' }],
      };

      const filtered = filterFieldsByTier(updateData, 'tier2', false);
      expect(filtered).toEqual(updateData);
    });

    it('should bypass tier restrictions for admin', () => {
      const updateData = {
        companyName: 'Test Company',
        website: 'https://example.com',
        linkedinUrl: 'https://linkedin.com/company/test',
      };

      const filtered = filterFieldsByTier(updateData, 'free', true);
      expect(filtered).toEqual(updateData);
    });

    it('should throw error listing restricted fields', () => {
      const updateData = {
        website: 'https://example.com',
        linkedinUrl: 'https://linkedin.com/test',
      };

      expect(() => filterFieldsByTier(updateData, 'free', false)).toThrow(
        /website, linkedinUrl/
      );
    });

    it('should filter out restricted fields defensively', () => {
      const updateData = {
        companyName: 'Test Company',
      };

      const filtered = filterFieldsByTier(updateData, 'free', false);
      expect(filtered).toHaveProperty('companyName');
      expect(Object.keys(filtered)).toHaveLength(1);
    });
  });

  describe('isFieldAllowedForTier', () => {
    it('should return true for allowed fields', () => {
      expect(isFieldAllowedForTier('companyName', 'free', false)).toBe(true);
      expect(isFieldAllowedForTier('website', 'tier1', false)).toBe(true);
    });

    it('should return false for restricted fields', () => {
      expect(isFieldAllowedForTier('website', 'free', false)).toBe(false);
      expect(isFieldAllowedForTier('linkedinUrl', 'free', false)).toBe(false);
    });

    it('should return true for admin regardless of tier', () => {
      expect(isFieldAllowedForTier('website', 'free', true)).toBe(true);
      expect(isFieldAllowedForTier('certifications', 'free', true)).toBe(true);
    });
  });

  describe('getTierLevel', () => {
    it('should return correct tier levels', () => {
      expect(getTierLevel('free')).toBe(0);
      expect(getTierLevel('tier1')).toBe(1);
      expect(getTierLevel('tier2')).toBe(2);
    });

    it('should return 0 for unknown tier', () => {
      expect(getTierLevel('unknown' as VendorTier)).toBe(0);
    });
  });

  describe('hasTierAccess', () => {
    it('should allow access when current tier meets requirement', () => {
      expect(hasTierAccess('tier1', 'free', false)).toBe(true);
      expect(hasTierAccess('tier2', 'tier1', false)).toBe(true);
      expect(hasTierAccess('tier2', 'tier2', false)).toBe(true);
    });

    it('should deny access when current tier does not meet requirement', () => {
      expect(hasTierAccess('free', 'tier1', false)).toBe(false);
      expect(hasTierAccess('tier1', 'tier2', false)).toBe(false);
    });

    it('should allow access for admin regardless of tier', () => {
      expect(hasTierAccess('free', 'tier2', true)).toBe(true);
    });
  });
});
