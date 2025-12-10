import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TierGate } from '@/components/shared/TierGate';

// Mock dependencies
jest.mock('@/lib/hooks/useTierAccess', () => ({
  useTierAccess: jest.fn()
}));

jest.mock('@/lib/hooks/useAuth', () => ({
  useAuth: jest.fn()
}));

const { useTierAccess } = require('@/lib/hooks/useTierAccess');
const { useAuth } = require('@/lib/hooks/useAuth');

describe('TierGate', () => {
  const mockVendor = {
    id: 'vendor-1',
    name: 'Test Vendor',
    tier: 'tier2'
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock: non-admin user
    useAuth.mockReturnValue({
      user: { id: 'user-1', role: 'user' },
      isAuthenticated: true
    });
  });

  describe('Tier 0 (Free) Access Control', () => {
    it('blocks content for free tier vendors', () => {
      const freeVendor = { ...mockVendor, tier: 'free' };
      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: 'free',
        upgradePath: '/subscription/upgrade'
      });

      render(
        <TierGate requiredTier="tier2" vendor={freeVendor}>
          <div>Protected Content</div>
        </TierGate>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('shows fallback for free tier vendors', () => {
      const freeVendor = { ...mockVendor, tier: 'free' };
      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: 'free',
        upgradePath: '/subscription/upgrade'
      });

      render(
        <TierGate
          requiredTier="tier2"
          vendor={freeVendor}
          fallback={<div>Upgrade Required</div>}
        >
          <div>Protected Content</div>
        </TierGate>
      );

      expect(screen.getByText('Upgrade Required')).toBeInTheDocument();
    });
  });

  describe('Tier 1 Access Control', () => {
    it('blocks tier2 content for tier1 vendors', () => {
      const tier1Vendor = { ...mockVendor, tier: 'tier1' };
      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: 'tier1',
        upgradePath: '/subscription/upgrade'
      });

      render(
        <TierGate requiredTier="tier2" vendor={tier1Vendor}>
          <div>Tier 2 Content</div>
        </TierGate>
      );

      expect(screen.queryByText('Tier 2 Content')).not.toBeInTheDocument();
    });

    it('allows tier1 content for tier1 vendors', () => {
      const tier1Vendor = { ...mockVendor, tier: 'tier1' };
      useTierAccess.mockReturnValue({
        hasAccess: true,
        tier: 'tier1',
        upgradePath: null
      });

      render(
        <TierGate requiredTier="tier1" vendor={tier1Vendor}>
          <div>Tier 1 Content</div>
        </TierGate>
      );

      expect(screen.getByText('Tier 1 Content')).toBeInTheDocument();
    });
  });

  describe('Tier 2 Access Control', () => {
    it('allows tier2 content for tier2 vendors', () => {
      useTierAccess.mockReturnValue({
        hasAccess: true,
        tier: 'tier2',
        upgradePath: null
      });

      render(
        <TierGate requiredTier="tier2" vendor={mockVendor}>
          <div>Tier 2 Content</div>
        </TierGate>
      );

      expect(screen.getByText('Tier 2 Content')).toBeInTheDocument();
    });

    it('blocks tier2 content for lower tier vendors', () => {
      const tier1Vendor = { ...mockVendor, tier: 'tier1' };
      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: 'tier1',
        upgradePath: '/subscription/upgrade'
      });

      render(
        <TierGate requiredTier="tier2" vendor={tier1Vendor}>
          <div>Tier 2 Content</div>
        </TierGate>
      );

      expect(screen.queryByText('Tier 2 Content')).not.toBeInTheDocument();
    });
  });

  describe('Tier 3 (Enterprise) Access Control', () => {
    it('allows tier3 content for tier3 vendors', () => {
      const tier3Vendor = { ...mockVendor, tier: 'tier3' };
      useTierAccess.mockReturnValue({
        hasAccess: true,
        tier: 'tier3',
        upgradePath: null
      });

      render(
        <TierGate requiredTier="tier3" vendor={tier3Vendor}>
          <div>Enterprise Content</div>
        </TierGate>
      );

      expect(screen.getByText('Enterprise Content')).toBeInTheDocument();
    });

    it('blocks tier3 content for tier2 vendors', () => {
      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: 'tier2',
        upgradePath: '/subscription/upgrade'
      });

      render(
        <TierGate requiredTier="tier3" vendor={mockVendor}>
          <div>Enterprise Content</div>
        </TierGate>
      );

      expect(screen.queryByText('Enterprise Content')).not.toBeInTheDocument();
    });
  });

  describe('Admin Bypass', () => {
    it('allows admins to access all content regardless of tier', () => {
      const freeVendor = { ...mockVendor, tier: 'free' };

      useAuth.mockReturnValue({
        user: { id: 'admin-1', role: 'admin' },
        isAuthenticated: true
      });

      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: 'free',
        upgradePath: '/subscription/upgrade'
      });

      render(
        <TierGate requiredTier="tier3" vendor={freeVendor}>
          <div>Enterprise Content</div>
        </TierGate>
      );

      expect(screen.getByText('Enterprise Content')).toBeInTheDocument();
    });

    it('shows admin badge when admin bypasses restrictions', () => {
      const freeVendor = { ...mockVendor, tier: 'free' };

      useAuth.mockReturnValue({
        user: { id: 'admin-1', role: 'admin' },
        isAuthenticated: true
      });

      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: 'free',
        upgradePath: '/subscription/upgrade'
      });

      render(
        <TierGate
          requiredTier="tier2"
          vendor={freeVendor}
          showAdminBadge={true}
        >
          <div>Protected Content</div>
        </TierGate>
      );

      expect(screen.getByText(/admin view/i)).toBeInTheDocument();
    });
  });

  describe('Fallback Component Rendering', () => {
    it('renders custom fallback when access denied', () => {
      const tier1Vendor = { ...mockVendor, tier: 'tier1' };
      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: 'tier1',
        upgradePath: '/subscription/upgrade'
      });

      const CustomFallback = () => <div>Custom Upgrade Message</div>;

      render(
        <TierGate
          requiredTier="tier2"
          vendor={tier1Vendor}
          fallback={<CustomFallback />}
        >
          <div>Protected Content</div>
        </TierGate>
      );

      expect(screen.getByText('Custom Upgrade Message')).toBeInTheDocument();
    });

    it('renders default fallback when no custom fallback provided', () => {
      const tier1Vendor = { ...mockVendor, tier: 'tier1' };
      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: 'tier1',
        upgradePath: '/subscription/upgrade'
      });

      render(
        <TierGate requiredTier="tier2" vendor={tier1Vendor}>
          <div>Protected Content</div>
        </TierGate>
      );

      expect(screen.getByText(/upgrade to unlock/i)).toBeInTheDocument();
    });

    it('renders nothing when fallback is null', () => {
      const tier1Vendor = { ...mockVendor, tier: 'tier1' };
      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: 'tier1',
        upgradePath: '/subscription/upgrade'
      });

      const { container } = render(
        <TierGate
          requiredTier="tier2"
          vendor={tier1Vendor}
          fallback={null}
        >
          <div>Protected Content</div>
        </TierGate>
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Upgrade Path Integration', () => {
    it('includes upgrade link in fallback', () => {
      const tier1Vendor = { ...mockVendor, tier: 'tier1' };
      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: 'tier1',
        upgradePath: '/subscription/upgrade'
      });

      render(
        <TierGate requiredTier="tier2" vendor={tier1Vendor}>
          <div>Protected Content</div>
        </TierGate>
      );

      const upgradeLink = screen.getByRole('link', { name: /upgrade now/i });
      expect(upgradeLink).toHaveAttribute('href', '/subscription/upgrade');
    });

    it('passes required tier to upgrade path', () => {
      const tier1Vendor = { ...mockVendor, tier: 'tier1' };
      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: 'tier1',
        upgradePath: '/subscription/upgrade?to=tier2'
      });

      render(
        <TierGate requiredTier="tier2" vendor={tier1Vendor}>
          <div>Protected Content</div>
        </TierGate>
      );

      const upgradeLink = screen.getByRole('link', { name: /upgrade now/i });
      expect(upgradeLink).toHaveAttribute('href', '/subscription/upgrade?to=tier2');
    });
  });

  describe('Multiple Children', () => {
    it('renders all children when access granted', () => {
      useTierAccess.mockReturnValue({
        hasAccess: true,
        tier: 'tier2',
        upgradePath: null
      });

      render(
        <TierGate requiredTier="tier2" vendor={mockVendor}>
          <div>First Child</div>
          <div>Second Child</div>
          <div>Third Child</div>
        </TierGate>
      );

      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
      expect(screen.getByText('Third Child')).toBeInTheDocument();
    });

    it('hides all children when access denied', () => {
      const tier1Vendor = { ...mockVendor, tier: 'tier1' };
      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: 'tier1',
        upgradePath: '/subscription/upgrade'
      });

      render(
        <TierGate requiredTier="tier2" vendor={tier1Vendor}>
          <div>First Child</div>
          <div>Second Child</div>
        </TierGate>
      );

      expect(screen.queryByText('First Child')).not.toBeInTheDocument();
      expect(screen.queryByText('Second Child')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined vendor tier gracefully', () => {
      const noTierVendor = { ...mockVendor, tier: undefined };
      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: undefined,
        upgradePath: '/subscription/upgrade'
      });

      render(
        <TierGate requiredTier="tier2" vendor={noTierVendor}>
          <div>Protected Content</div>
        </TierGate>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('handles missing vendor gracefully', () => {
      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: null,
        upgradePath: '/subscription/upgrade'
      });

      render(
        <TierGate requiredTier="tier2" vendor={null}>
          <div>Protected Content</div>
        </TierGate>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible error message for blocked content', () => {
      const tier1Vendor = { ...mockVendor, tier: 'tier1' };
      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: 'tier1',
        upgradePath: '/subscription/upgrade'
      });

      render(
        <TierGate requiredTier="tier2" vendor={tier1Vendor}>
          <div>Protected Content</div>
        </TierGate>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('includes ARIA label for upgrade link', () => {
      const tier1Vendor = { ...mockVendor, tier: 'tier1' };
      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: 'tier1',
        upgradePath: '/subscription/upgrade'
      });

      render(
        <TierGate requiredTier="tier2" vendor={tier1Vendor}>
          <div>Protected Content</div>
        </TierGate>
      );

      const upgradeLink = screen.getByRole('link', { name: /upgrade now/i });
      expect(upgradeLink).toHaveAttribute('aria-label', expect.stringMatching(/upgrade/i));
    });
  });

  describe('Responsive Behavior', () => {
    it('adjusts fallback message for mobile screens', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(max-width: 768px)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      const tier1Vendor = { ...mockVendor, tier: 'tier1' };
      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: 'tier1',
        upgradePath: '/subscription/upgrade'
      });

      render(
        <TierGate requiredTier="tier2" vendor={tier1Vendor}>
          <div>Protected Content</div>
        </TierGate>
      );

      // Fallback should be responsive
      expect(screen.getByText(/upgrade to unlock/i)).toBeInTheDocument();
    });
  });
});
