/**
 * Tier Downgrade Validation Test Suite
 *
 * Tests validation logic specifically for tier downgrade requests using
 * the validateTierRequest function with requestType='downgrade'.
 *
 * This test suite complements tier-change-validation.test.ts by specifically
 * testing downgrade scenarios through the unified validateTierRequest function.
 */

import { describe, it, expect } from '@jest/globals';
import { validateTierRequest } from '@/lib/services/TierUpgradeRequestService';

describe('Tier Downgrade Validation with validateTierRequest', () => {
  describe('Valid Downgrade Scenarios', () => {
    it('should accept downgrade from tier3 to tier2', () => {
      const result = validateTierRequest({
        vendor: 'vendor-1',
        user: 'user-1',
        currentTier: 'tier3',
        requestedTier: 'tier2',
      }, 'downgrade');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept downgrade from tier3 to tier1', () => {
      const result = validateTierRequest({
        vendor: 'vendor-1',
        user: 'user-1',
        currentTier: 'tier3',
        requestedTier: 'tier1',
      }, 'downgrade');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept downgrade from tier3 to free', () => {
      const result = validateTierRequest({
        vendor: 'vendor-1',
        user: 'user-1',
        currentTier: 'tier3',
        requestedTier: 'free',
      }, 'downgrade');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept downgrade from tier2 to tier1', () => {
      const result = validateTierRequest({
        vendor: 'vendor-1',
        user: 'user-1',
        currentTier: 'tier2',
        requestedTier: 'tier1',
      }, 'downgrade');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept downgrade from tier2 to free', () => {
      const result = validateTierRequest({
        vendor: 'vendor-1',
        user: 'user-1',
        currentTier: 'tier2',
        requestedTier: 'free',
      }, 'downgrade');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept downgrade from tier1 to free', () => {
      const result = validateTierRequest({
        vendor: 'vendor-1',
        user: 'user-1',
        currentTier: 'tier1',
        requestedTier: 'free',
      }, 'downgrade');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Invalid Downgrade Scenarios - Wrong Direction', () => {
    it('should reject upgrade request when requestType is downgrade', () => {
      const result = validateTierRequest({
        vendor: 'vendor-1',
        user: 'user-1',
        currentTier: 'tier1',
        requestedTier: 'tier2',
      }, 'downgrade');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Requested tier must be lower than current tier for downgrades');
    });

    it('should reject same-tier request when requestType is downgrade', () => {
      const result = validateTierRequest({
        vendor: 'vendor-1',
        user: 'user-1',
        currentTier: 'tier2',
        requestedTier: 'tier2',
      }, 'downgrade');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Requested tier must be lower than current tier for downgrades');
    });

    it('should reject multi-tier upgrade when requestType is downgrade', () => {
      const result = validateTierRequest({
        vendor: 'vendor-1',
        user: 'user-1',
        currentTier: 'free',
        requestedTier: 'tier3',
      }, 'downgrade');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Requested tier must be lower than current tier for downgrades');
    });
  });

  describe('Invalid Downgrade Scenarios - Cannot Downgrade from Free', () => {
    it('should reject downgrade from free tier (already at lowest)', () => {
      // When already at free tier, cannot request downgrade
      const result = validateTierRequest({
        vendor: 'vendor-1',
        user: 'user-1',
        currentTier: 'free',
        requestedTier: 'free',
      }, 'downgrade');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Requested tier must be lower than current tier for downgrades');
    });
  });

  describe('Auto-Detection of Request Type', () => {
    it('should auto-detect downgrade when no requestType provided', () => {
      // When requestedTier < currentTier, should auto-detect as downgrade
      const result = validateTierRequest({
        vendor: 'vendor-1',
        user: 'user-1',
        currentTier: 'tier3',
        requestedTier: 'tier1',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should auto-detect upgrade when no requestType provided', () => {
      // When requestedTier > currentTier, should auto-detect as upgrade
      const result = validateTierRequest({
        vendor: 'vendor-1',
        user: 'user-1',
        currentTier: 'tier1',
        requestedTier: 'tier3',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Vendor Notes Validation for Downgrades', () => {
    it('should accept downgrade with valid vendor notes', () => {
      const result = validateTierRequest({
        vendor: 'vendor-1',
        user: 'user-1',
        currentTier: 'tier3',
        requestedTier: 'tier1',
        vendorNotes: 'We need to reduce our subscription due to budget constraints.',
      }, 'downgrade');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject downgrade with too short vendor notes', () => {
      const result = validateTierRequest({
        vendor: 'vendor-1',
        user: 'user-1',
        currentTier: 'tier3',
        requestedTier: 'tier1',
        vendorNotes: 'Too short',
      }, 'downgrade');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Vendor notes must be at least 20 characters when provided');
    });

    it('should reject downgrade with vendor notes exceeding 500 characters', () => {
      const result = validateTierRequest({
        vendor: 'vendor-1',
        user: 'user-1',
        currentTier: 'tier3',
        requestedTier: 'tier1',
        vendorNotes: 'a'.repeat(501),
      }, 'downgrade');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Vendor notes must not exceed 500 characters');
    });

    it('should accept downgrade without vendor notes (optional field)', () => {
      const result = validateTierRequest({
        vendor: 'vendor-1',
        user: 'user-1',
        currentTier: 'tier3',
        requestedTier: 'tier1',
      }, 'downgrade');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Required Fields Validation for Downgrades', () => {
    it('should reject downgrade without vendor ID', () => {
      const result = validateTierRequest({
        vendor: undefined as unknown as string,
        user: 'user-1',
        currentTier: 'tier3',
        requestedTier: 'tier1',
      }, 'downgrade');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Vendor ID is required');
    });

    it('should reject downgrade with null vendor', () => {
      const result = validateTierRequest({
        vendor: null as unknown as string,
        user: 'user-1',
        currentTier: 'tier3',
        requestedTier: 'tier1',
      }, 'downgrade');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Vendor relationship is required');
    });

    it('should reject downgrade without user ID', () => {
      const result = validateTierRequest({
        vendor: 'vendor-1',
        user: undefined as unknown as string,
        currentTier: 'tier3',
        requestedTier: 'tier1',
      }, 'downgrade');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('User ID is required');
    });

    it('should reject downgrade without requested tier', () => {
      const result = validateTierRequest({
        vendor: 'vendor-1',
        user: 'user-1',
        currentTier: 'tier3',
        requestedTier: '' as unknown as string,
      }, 'downgrade');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Requested tier is required');
    });
  });

  describe('Multiple Validation Errors for Downgrades', () => {
    it('should accumulate all validation errors', () => {
      const result = validateTierRequest({
        vendor: null as unknown as string,
        user: null as unknown as string,
        currentTier: 'tier1',
        requestedTier: 'tier2', // Wrong direction for downgrade
        vendorNotes: 'Short', // Too short
      }, 'downgrade');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain('Vendor relationship is required');
      expect(result.errors).toContain('User relationship is required');
      expect(result.errors).toContain('Requested tier must be lower than current tier for downgrades');
      expect(result.errors).toContain('Vendor notes must be at least 20 characters when provided');
    });
  });

  describe('Invalid Tier Values for Downgrades', () => {
    it('should reject invalid current tier value', () => {
      const result = validateTierRequest({
        vendor: 'vendor-1',
        user: 'user-1',
        currentTier: 'premium' as unknown as string, // Invalid tier
        requestedTier: 'tier1',
      }, 'downgrade');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid current tier value');
    });

    it('should reject invalid requested tier for downgrade', () => {
      const result = validateTierRequest({
        vendor: 'vendor-1',
        user: 'user-1',
        currentTier: 'tier3',
        requestedTier: 'tier4' as unknown as string, // Invalid tier
      }, 'downgrade');

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid requested tier'))).toBe(true);
    });
  });

  describe('Downgrade Tier Allowance (free is valid for downgrade)', () => {
    it('should accept free tier as valid downgrade target', () => {
      // Unlike upgrades where free is invalid target, downgrades CAN target free
      const result = validateTierRequest({
        vendor: 'vendor-1',
        user: 'user-1',
        currentTier: 'tier1',
        requestedTier: 'free',
      }, 'downgrade');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept all lower tiers as valid downgrade targets', () => {
      const validDowngrades = [
        { from: 'tier3', to: 'tier2' },
        { from: 'tier3', to: 'tier1' },
        { from: 'tier3', to: 'free' },
        { from: 'tier2', to: 'tier1' },
        { from: 'tier2', to: 'free' },
        { from: 'tier1', to: 'free' },
      ];

      for (const { from, to } of validDowngrades) {
        const result = validateTierRequest({
          vendor: 'vendor-1',
          user: 'user-1',
          currentTier: from,
          requestedTier: to,
        }, 'downgrade');

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }
    });
  });
});
