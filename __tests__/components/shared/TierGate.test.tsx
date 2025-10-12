/**
 * TierGate Component Test
 * Tests tier-based conditional rendering
 */

import { renderWithTier, renderWithAdmin } from '@/__tests__/setup/react-testing-library.config';
import { screen } from '@testing-library/react';

import { TierGate } from '@/components/shared/TierGate';

describe('TierGate', () => {
  const PremiumContent = () => <div>Premium Feature</div>;

  describe('Tier-Based Rendering', () => {
    it('shows content for matching tier', () => {
      renderWithTier(
        <TierGate requiredTier="tier2">
          <PremiumContent />
        </TierGate>,
        'tier2'
      );

      expect(screen.getByText('Premium Feature')).toBeInTheDocument();
    });

    it('shows content for higher tier', () => {
      renderWithTier(
        <TierGate requiredTier="tier1">
          <PremiumContent />
        </TierGate>,
        'tier2'
      );

      expect(screen.getByText('Premium Feature')).toBeInTheDocument();
    });

    it('hides content for lower tier', () => {
      renderWithTier(
        <TierGate requiredTier="tier2">
          <PremiumContent />
        </TierGate>,
        'free'
      );

      expect(screen.queryByText('Premium Feature')).not.toBeInTheDocument();
    });

    it('shows upgrade message for restricted content', () => {
      renderWithTier(
        <TierGate requiredTier="tier2">
          <PremiumContent />
        </TierGate>,
        'free'
      );

      expect(screen.getByText(/upgrade to tier 2/i)).toBeInTheDocument();
    });
  });

  describe('Admin Bypass', () => {
    it('admin can access all tier content', () => {
      renderWithAdmin(
        <TierGate requiredTier="tier2">
          <PremiumContent />
        </TierGate>
      );

      expect(screen.getByText('Premium Feature')).toBeInTheDocument();
    });

    it('admin does not see upgrade messages', () => {
      renderWithAdmin(
        <TierGate requiredTier="tier2">
          <PremiumContent />
        </TierGate>
      );

      expect(screen.queryByText(/upgrade/i)).not.toBeInTheDocument();
    });
  });

  describe('Fallback Content', () => {
    it('renders custom fallback for restricted content', () => {
      renderWithTier(
        <TierGate
          requiredTier="tier2"
          fallback={<div>Custom Upgrade Message</div>}
        >
          <PremiumContent />
        </TierGate>,
        'free'
      );

      expect(screen.getByText('Custom Upgrade Message')).toBeInTheDocument();
      expect(screen.queryByText('Premium Feature')).not.toBeInTheDocument();
    });

    it('hides default upgrade message when showUpgradeMessage is false', () => {
      renderWithTier(
        <TierGate requiredTier="tier2" showUpgradeMessage={false}>
          <PremiumContent />
        </TierGate>,
        'free'
      );

      expect(screen.queryByText('Premium Feature')).not.toBeInTheDocument();
      expect(screen.queryByText(/upgrade/i)).not.toBeInTheDocument();
    });
  });

  describe('Default Tier Handling', () => {
    it('treats undefined tier as free tier', () => {
      renderWithTier(
        <TierGate requiredTier="tier1">
          <PremiumContent />
        </TierGate>,
        'free'
      );

      expect(screen.queryByText('Premium Feature')).not.toBeInTheDocument();
      expect(screen.getByText(/upgrade to tier 1/i)).toBeInTheDocument();
    });
  });

  describe('Tier Hierarchy', () => {
    it('tier1 can access free tier content', () => {
      renderWithTier(
        <TierGate requiredTier="free">
          <PremiumContent />
        </TierGate>,
        'tier1'
      );

      expect(screen.getByText('Premium Feature')).toBeInTheDocument();
    });

    it('tier2 can access tier1 content', () => {
      renderWithTier(
        <TierGate requiredTier="tier1">
          <PremiumContent />
        </TierGate>,
        'tier2'
      );

      expect(screen.getByText('Premium Feature')).toBeInTheDocument();
    });

    it('free tier cannot access tier1 content', () => {
      renderWithTier(
        <TierGate requiredTier="tier1">
          <PremiumContent />
        </TierGate>,
        'free'
      );

      expect(screen.queryByText('Premium Feature')).not.toBeInTheDocument();
    });
  });
});
