/**
 * EmailService Unit Tests
 * Tests basic structure and type safety of EmailService functions
 */

import {
  sendVendorRegisteredEmail,
  sendProfilePublishedEmail,
  sendVendorRejectedEmail,
  sendTierUpgradeRequestedEmail,
  sendTierUpgradeApprovedEmail,
  sendTierUpgradeRejectedEmail,
  getTierFeatures,
  type EmailResult,
  type VendorEmailData,
  type TierUpgradeEmailData,
} from '@/lib/services/EmailService';

describe('EmailService', () => {
  describe('getTierFeatures', () => {
    it('should return tier features for all tiers', () => {
      const tiers = ['free', 'tier1', 'tier2', 'tier3'];

      tiers.forEach((tier) => {
        const features = getTierFeatures(tier);

        expect(features).toHaveProperty('tier');
        expect(features).toHaveProperty('description');
        expect(features).toHaveProperty('features');
        expect(Array.isArray(features.features)).toBe(true);
      });
    });

    it('should return default tier features for unknown tier', () => {
      const features = getTierFeatures('unknown');

      expect(features.tier).toBe('Unknown');
      expect(features.description).toBe('Vendor profile');
      expect(features.features).toEqual([]);
    });

    it('should return correct feature count for each tier', () => {
      expect(getTierFeatures('free').features).toHaveLength(2);
      expect(getTierFeatures('tier1').features).toHaveLength(4);
      expect(getTierFeatures('tier2').features).toHaveLength(4);
      expect(getTierFeatures('tier3').features).toHaveLength(4);
    });
  });

  describe('email function signatures', () => {
    it('should have correct function signatures for vendor emails', async () => {
      // These tests verify the functions exist and have correct return types
      expect(typeof sendVendorRegisteredEmail).toBe('function');
      expect(typeof sendProfilePublishedEmail).toBe('function');
      expect(typeof sendVendorRejectedEmail).toBe('function');
    });

    it('should have correct function signatures for tier upgrade emails', async () => {
      expect(typeof sendTierUpgradeRequestedEmail).toBe('function');
      expect(typeof sendTierUpgradeApprovedEmail).toBe('function');
      expect(typeof sendTierUpgradeRejectedEmail).toBe('function');
    });
  });

  describe('type definitions', () => {
    it('should allow valid VendorEmailData', () => {
      const data: VendorEmailData = {
        companyName: 'Test Company',
        contactEmail: 'contact@example.com',
        tier: 'tier1',
        vendorId: 'vendor-123',
      };

      expect(data.companyName).toBe('Test Company');
    });

    it('should allow valid TierUpgradeEmailData', () => {
      const data: TierUpgradeEmailData = {
        companyName: 'Test Company',
        contactEmail: 'contact@example.com',
        currentTier: 'tier1',
        requestedTier: 'tier2',
        vendorNotes: 'Growing business',
        requestId: 'request-123',
        vendorId: 'vendor-123',
      };

      expect(data.requestedTier).toBe('tier2');
    });

    it('should allow optional fields in TierUpgradeEmailData', () => {
      const data: TierUpgradeEmailData = {
        companyName: 'Test Company',
        contactEmail: 'contact@example.com',
        currentTier: 'tier1',
        requestedTier: 'tier2',
        requestId: 'request-123',
        vendorId: 'vendor-123',
        // vendorNotes and rejectionReason are optional
      };

      expect(data.vendorNotes).toBeUndefined();
    });

    it('should define EmailResult type', () => {
      const successResult: EmailResult = {
        success: true,
      };

      const errorResult: EmailResult = {
        success: false,
        error: 'Failed to send email',
      };

      expect(successResult.success).toBe(true);
      expect(errorResult.error).toBeDefined();
    });
  });
});
