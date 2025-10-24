/**
 * Tests for tierConfig constants and helper functions
 */

import {
  Tier,
  TIER_HIERARCHY,
  MAX_LOCATIONS_PER_TIER,
  canAccessFeature,
  getTierLevel,
  isTierOrHigher,
  getMaxLocations,
  canAddLocation,
  getAccessibleFields,
  canAccessField,
} from '@/lib/constants/tierConfig';

describe('tierConfig', () => {
  describe('TIER_HIERARCHY', () => {
    it('should have correct tier levels', () => {
      expect(TIER_HIERARCHY.free).toBe(0);
      expect(TIER_HIERARCHY.tier1).toBe(1);
      expect(TIER_HIERARCHY.tier2).toBe(2);
      expect(TIER_HIERARCHY.tier3).toBe(3);
    });
  });

  describe('MAX_LOCATIONS_PER_TIER', () => {
    it('should have correct location limits', () => {
      expect(MAX_LOCATIONS_PER_TIER.free).toBe(1);
      expect(MAX_LOCATIONS_PER_TIER.tier1).toBe(3);
      expect(MAX_LOCATIONS_PER_TIER.tier2).toBe(10);
      expect(MAX_LOCATIONS_PER_TIER.tier3).toBe(999);
    });
  });

  describe('canAccessFeature', () => {
    it('should allow tier1+ to access multipleLocations', () => {
      expect(canAccessFeature('free', 'multipleLocations')).toBe(false);
      expect(canAccessFeature('tier1', 'multipleLocations')).toBe(true);
      expect(canAccessFeature('tier2', 'multipleLocations')).toBe(true);
      expect(canAccessFeature('tier3', 'multipleLocations')).toBe(true);
    });

    it('should allow tier2+ to access advancedAnalytics', () => {
      expect(canAccessFeature('free', 'advancedAnalytics')).toBe(false);
      expect(canAccessFeature('tier1', 'advancedAnalytics')).toBe(false);
      expect(canAccessFeature('tier2', 'advancedAnalytics')).toBe(true);
      expect(canAccessFeature('tier3', 'advancedAnalytics')).toBe(true);
    });

    it('should allow tier3 to access promotionPack', () => {
      expect(canAccessFeature('free', 'promotionPack')).toBe(false);
      expect(canAccessFeature('tier1', 'promotionPack')).toBe(false);
      expect(canAccessFeature('tier2', 'promotionPack')).toBe(false);
      expect(canAccessFeature('tier3', 'promotionPack')).toBe(true);
    });

    it('should return false for undefined tier', () => {
      expect(canAccessFeature(undefined, 'multipleLocations')).toBe(false);
    });
  });

  describe('getTierLevel', () => {
    it('should return correct tier levels', () => {
      expect(getTierLevel('free')).toBe(0);
      expect(getTierLevel('tier1')).toBe(1);
      expect(getTierLevel('tier2')).toBe(2);
      expect(getTierLevel('tier3')).toBe(3);
    });

    it('should return 0 for undefined tier', () => {
      expect(getTierLevel(undefined)).toBe(0);
    });
  });

  describe('isTierOrHigher', () => {
    it('should correctly compare tier levels', () => {
      expect(isTierOrHigher('tier1', 'free')).toBe(true);
      expect(isTierOrHigher('tier2', 'tier1')).toBe(true);
      expect(isTierOrHigher('tier3', 'tier2')).toBe(true);
      expect(isTierOrHigher('tier1', 'tier2')).toBe(false);
      expect(isTierOrHigher('free', 'tier1')).toBe(false);
    });

    it('should handle same tier', () => {
      expect(isTierOrHigher('tier1', 'tier1')).toBe(true);
    });

    it('should handle undefined tier', () => {
      expect(isTierOrHigher(undefined, 'tier1')).toBe(false);
    });
  });

  describe('getMaxLocations', () => {
    it('should return correct max locations for each tier', () => {
      expect(getMaxLocations('free')).toBe(1);
      expect(getMaxLocations('tier1')).toBe(3);
      expect(getMaxLocations('tier2')).toBe(10);
      expect(getMaxLocations('tier3')).toBe(999);
    });

    it('should return 1 for undefined tier', () => {
      expect(getMaxLocations(undefined)).toBe(1);
    });
  });

  describe('canAddLocation', () => {
    it('should allow adding locations within limit', () => {
      expect(canAddLocation('free', 0)).toBe(true);
      expect(canAddLocation('tier1', 2)).toBe(true);
      expect(canAddLocation('tier2', 9)).toBe(true);
    });

    it('should prevent adding locations at limit', () => {
      expect(canAddLocation('free', 1)).toBe(false);
      expect(canAddLocation('tier1', 3)).toBe(false);
      expect(canAddLocation('tier2', 10)).toBe(false);
    });

    it('should handle tier3 with high counts', () => {
      expect(canAddLocation('tier3', 100)).toBe(true);
      expect(canAddLocation('tier3', 999)).toBe(false);
    });
  });

  describe('getAccessibleFields', () => {
    it('should return all free fields for free tier', () => {
      const fields = getAccessibleFields('free');
      expect(fields).toContain('companyName');
      expect(fields).toContain('description');
      expect(fields).toContain('logo');
      expect(fields).not.toContain('certifications');
    });

    it('should return free + tier1 fields for tier1', () => {
      const fields = getAccessibleFields('tier1');
      expect(fields).toContain('companyName');
      expect(fields).toContain('website');
      expect(fields).toContain('certifications');
      expect(fields).not.toContain('locations');
    });

    it('should return all fields up to tier2', () => {
      const fields = getAccessibleFields('tier2');
      expect(fields).toContain('companyName');
      expect(fields).toContain('certifications');
      expect(fields).toContain('locations');
      expect(fields).not.toContain('promotionPack');
    });

    it('should return all fields for tier3', () => {
      const fields = getAccessibleFields('tier3');
      expect(fields).toContain('companyName');
      expect(fields).toContain('certifications');
      expect(fields).toContain('locations');
      expect(fields).toContain('promotionPack');
    });
  });

  describe('canAccessField', () => {
    it('should allow access to free fields for all tiers', () => {
      expect(canAccessField('free', 'companyName')).toBe(true);
      expect(canAccessField('tier1', 'companyName')).toBe(true);
      expect(canAccessField('tier2', 'companyName')).toBe(true);
    });

    it('should restrict tier1 fields from free tier', () => {
      expect(canAccessField('free', 'certifications')).toBe(false);
      expect(canAccessField('tier1', 'certifications')).toBe(true);
    });

    it('should restrict tier2 fields from lower tiers', () => {
      expect(canAccessField('free', 'locations')).toBe(false);
      expect(canAccessField('tier1', 'locations')).toBe(false);
      expect(canAccessField('tier2', 'locations')).toBe(true);
    });

    it('should restrict tier3 fields from lower tiers', () => {
      expect(canAccessField('free', 'promotionPack')).toBe(false);
      expect(canAccessField('tier1', 'promotionPack')).toBe(false);
      expect(canAccessField('tier2', 'promotionPack')).toBe(false);
      expect(canAccessField('tier3', 'promotionPack')).toBe(true);
    });
  });
});
