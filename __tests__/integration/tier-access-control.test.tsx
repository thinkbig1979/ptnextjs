/**
 * Integration Tests - Tier-Based Access Control
 *
 * Tests complete tier access control workflow across components:
 * - TierGate component with different tier levels
 * - LocationsManagerCard tier-based rendering
 * - TierUpgradePrompt display logic
 * - Admin bypass functionality
 * - Feature limits enforcement
 * - Upgrade paths and messaging
 *
 * Total: 12+ integration test cases
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TierGate } from '@/components/vendor/TierGate';
import { LocationsManagerCard } from '@/components/dashboard/LocationsManagerCard';
import { LocationsDisplaySection } from '@/components/vendors/LocationsDisplaySection';
import {
  mockVendorFree,
  mockVendorTier1,
  mockVendorTier2,
  mockVendorTier3,
  mockLocationMonaco,
  mockLocationFortLauderdale,
  mockLocationNice,
  mockLocationGenoa,
} from '../fixtures/vendor-data';

// Mock Leaflet
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }: any) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
  useMap: () => ({
    setView: jest.fn(),
    invalidateSize: jest.fn(),
  }),
}));

jest.mock('leaflet/dist/leaflet.css', () => ({}));

// Mock hooks
jest.mock('@/hooks/useTierAccess', () => ({
  useTierAccess: jest.fn(),
}));

jest.mock('@/lib/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/components/ui/sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const { useTierAccess } = require('@/hooks/useTierAccess');
const { useAuth } = require('@/lib/context/AuthContext');

describe('Tier-Based Access Control - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default: Regular user (non-admin)
    useAuth.mockReturnValue({
      user: { id: 'user-1', role: 'user' },
      isAuthenticated: true,
    });
  });

  describe('Free Tier (Tier 0) Access Control', () => {
    it('blocks LocationsManagerCard for free tier vendors', () => {
      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: 'free',
        upgradePath: '/subscription/upgrade',
      });

      render(<LocationsManagerCard vendor={mockVendorFree} />);

      expect(screen.queryByText(/manage locations/i)).not.toBeInTheDocument();
      expect(screen.getByText(/upgrade to unlock/i)).toBeInTheDocument();
    });

    it('shows TierUpgradePrompt with correct tier badge for free tier', () => {
      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: 'free',
        upgradePath: '/subscription/upgrade',
      });

      render(<LocationsManagerCard vendor={mockVendorFree} />);

      expect(screen.getByText(/free/i)).toBeInTheDocument();
      expect(screen.getByText(/upgrade/i)).toBeInTheDocument();
    });

    it('displays feature benefits in upgrade prompt for free tier', () => {
      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: 'free',
        upgradePath: '/subscription/upgrade',
      });

      render(<LocationsManagerCard vendor={mockVendorFree} />);

      expect(
        screen.getByText(/multiple locations/i)
      ).toBeInTheDocument();
    });

    it('provides upgrade button with correct link for free tier', () => {
      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: 'free',
        upgradePath: '/subscription/upgrade',
      });

      render(<LocationsManagerCard vendor={mockVendorFree} />);

      const upgradeButton = screen.getByRole('link', { name: /upgrade now/i });
      expect(upgradeButton).toHaveAttribute('href', '/subscription/upgrade');
    });
  });

  describe('Tier 1 Access Control', () => {
    it('blocks multi-location features for tier1 vendors', () => {
      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: 'tier1',
        upgradePath: '/subscription/upgrade',
      });

      render(<LocationsManagerCard vendor={mockVendorTier1} />);

      expect(screen.getByText(/upgrade to unlock/i)).toBeInTheDocument();
    });

    it('shows only HQ location on public profile for tier1 vendors', () => {
      const tier1WithMultipleLocations = {
        ...mockVendorTier1,
        locations: [mockLocationMonaco, mockLocationFortLauderdale],
      };

      render(
        <LocationsDisplaySection
          locations={tier1WithMultipleLocations.locations}
          vendorTier="tier1"
        />
      );

      // Should only show HQ marker
      const markers = screen.getAllByTestId('marker');
      expect(markers).toHaveLength(1);
    });

    it('displays upgrade message for tier1 with hidden locations', () => {
      const tier1WithMultipleLocations = {
        ...mockVendorTier1,
        locations: [mockLocationMonaco, mockLocationFortLauderdale],
      };

      render(
        <LocationsDisplaySection
          locations={tier1WithMultipleLocations.locations}
          vendorTier="tier1"
          showUpgradePrompt={true}
        />
      );

      expect(
        screen.getByText(/upgrade to see all locations/i)
      ).toBeInTheDocument();
    });

    it('shows tier2 as target tier in upgrade path for tier1', () => {
      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: 'tier1',
        upgradePath: '/subscription/upgrade?to=tier2',
      });

      render(<LocationsManagerCard vendor={mockVendorTier1} />);

      const upgradeButton = screen.getByRole('link', { name: /upgrade now/i });
      expect(upgradeButton).toHaveAttribute(
        'href',
        '/subscription/upgrade?to=tier2'
      );
    });
  });

  describe('Tier 2 Access Control', () => {
    it('grants full access to LocationsManagerCard for tier2 vendors', () => {
      useTierAccess.mockReturnValue({
        hasAccess: true,
        tier: 'tier2',
        upgradePath: null,
      });

      render(<LocationsManagerCard vendor={mockVendorTier2} />);

      expect(screen.getByText(/manage locations/i)).toBeInTheDocument();
      expect(screen.queryByText(/upgrade to unlock/i)).not.toBeInTheDocument();
    });

    it('displays all locations on public profile for tier2 vendors', () => {
      render(
        <LocationsDisplaySection
          locations={mockVendorTier2.locations}
          vendorTier="tier2"
        />
      );

      const markers = screen.getAllByTestId('marker');
      expect(markers).toHaveLength(3);
    });

    it('allows adding multiple locations for tier2 vendors', () => {
      useTierAccess.mockReturnValue({
        hasAccess: true,
        tier: 'tier2',
        upgradePath: null,
      });

      render(<LocationsManagerCard vendor={mockVendorTier2} />);

      const addButton = screen.getByRole('button', { name: /add location/i });
      expect(addButton).toBeEnabled();
    });

    it('does not show upgrade prompts for tier2 vendors', () => {
      useTierAccess.mockReturnValue({
        hasAccess: true,
        tier: 'tier2',
        upgradePath: null,
      });

      render(<LocationsManagerCard vendor={mockVendorTier2} />);

      expect(screen.queryByText(/upgrade/i)).not.toBeInTheDocument();
    });
  });

  describe('Tier 3 (Enterprise) Access Control', () => {
    it('grants full access to all features for tier3 vendors', () => {
      useTierAccess.mockReturnValue({
        hasAccess: true,
        tier: 'tier3',
        upgradePath: null,
      });

      render(<LocationsManagerCard vendor={mockVendorTier3} />);

      expect(screen.getByText(/manage locations/i)).toBeInTheDocument();
      expect(screen.queryByText(/upgrade/i)).not.toBeInTheDocument();
    });

    it('displays all locations for tier3 vendors', () => {
      render(
        <LocationsDisplaySection
          locations={mockVendorTier3.locations}
          vendorTier="tier3"
        />
      );

      const markers = screen.getAllByTestId('marker');
      expect(markers).toHaveLength(4);
    });

    it('allows unlimited locations for tier3 vendors', () => {
      useTierAccess.mockReturnValue({
        hasAccess: true,
        tier: 'tier3',
        upgradePath: null,
      });

      const tier3WithManyLocations = {
        ...mockVendorTier3,
        locations: [
          mockLocationMonaco,
          mockLocationFortLauderdale,
          mockLocationNice,
          mockLocationGenoa,
        ],
      };

      render(<LocationsManagerCard vendor={tier3WithManyLocations} />);

      // Should be able to add more locations
      const addButton = screen.getByRole('button', { name: /add location/i });
      expect(addButton).toBeEnabled();
    });
  });

  describe('Admin Bypass Functionality', () => {
    it('allows admin to access all features regardless of vendor tier', () => {
      useAuth.mockReturnValue({
        user: { id: 'admin-1', role: 'admin' },
        isAuthenticated: true,
      });

      useTierAccess.mockReturnValue({
        hasAccess: true, // Admin bypass gives access
        tier: 'free',
        upgradePath: null,
      });

      render(
        <TierGate requiredTier="tier2" currentTier="free">
          <div>Protected Content</div>
        </TierGate>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('admin can manage locations for any tier vendor', () => {
      useAuth.mockReturnValue({
        user: { id: 'admin-1', role: 'admin' },
        isAuthenticated: true,
      });

      useTierAccess.mockReturnValue({
        hasAccess: true, // Admin has access
        tier: 'free',
        upgradePath: null,
      });

      render(<LocationsManagerCard vendor={mockVendorFree} />);

      expect(screen.getByText(/manage locations/i)).toBeInTheDocument();
    });
  });

  describe('TierGate Component Integration', () => {
    it('blocks content when tier requirement not met', () => {
      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: 'tier1',
        upgradePath: 'tier2',
      });

      render(
        <TierGate requiredTier="tier2" currentTier="tier1">
          <div>Tier 2 Content</div>
        </TierGate>
      );

      expect(screen.queryByText('Tier 2 Content')).not.toBeInTheDocument();
    });

    it('shows content when tier requirement is met', () => {
      useTierAccess.mockReturnValue({
        hasAccess: true,
        tier: 'tier2',
        upgradePath: null,
      });

      render(
        <TierGate requiredTier="tier2" currentTier="tier2">
          <div>Tier 2 Content</div>
        </TierGate>
      );

      expect(screen.getByText('Tier 2 Content')).toBeInTheDocument();
    });

    it('renders custom fallback when access denied', () => {
      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: 'tier1',
        upgradePath: 'tier2',
      });

      render(
        <TierGate
          requiredTier="tier2"
          currentTier="tier1"
          fallback={<div>Custom Upgrade Message</div>}
        >
          <div>Protected Content</div>
        </TierGate>
      );

      expect(screen.getByText('Custom Upgrade Message')).toBeInTheDocument();
    });

    it('renders default upgrade prompt when no custom fallback provided', () => {
      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: 'tier1',
        upgradePath: 'tier2',
      });

      render(
        <TierGate requiredTier="tier2" currentTier="tier1">
          <div>Protected Content</div>
        </TierGate>
      );

      expect(screen.getByText(/Premium Feature/i)).toBeInTheDocument();
    });
  });

  describe('Feature Limits Enforcement', () => {
    it('enforces maximum locations based on tier', () => {
      useTierAccess.mockReturnValue({
        hasAccess: true,
        tier: 'tier2',
        upgradePath: null,
        maxLocations: 5,
      });

      const vendorWith5Locations = {
        ...mockVendorTier2,
        locations: [
          mockLocationMonaco,
          mockLocationFortLauderdale,
          mockLocationNice,
          mockLocationGenoa,
          { ...mockLocationMonaco, id: 'loc-5' },
        ],
      };

      render(<LocationsManagerCard vendor={vendorWith5Locations} />);

      // Add button should be disabled at limit
      const addButton = screen.getByRole('button', { name: /add location/i });
      expect(addButton).toBeDisabled();
    });

    it('shows limit warning when approaching max locations', () => {
      useTierAccess.mockReturnValue({
        hasAccess: true,
        tier: 'tier2',
        upgradePath: null,
        maxLocations: 5,
      });

      const vendorWith4Locations = {
        ...mockVendorTier2,
        locations: [
          mockLocationMonaco,
          mockLocationFortLauderdale,
          mockLocationNice,
          mockLocationGenoa,
        ],
      };

      render(<LocationsManagerCard vendor={vendorWith4Locations} />);

      expect(
        screen.getByText(/4 of 5 locations used/i)
      ).toBeInTheDocument();
    });
  });

  describe('Upgrade Path Integration', () => {
    it('displays correct tier comparison in upgrade prompt', () => {
      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: 'tier1',
        currentTierName: 'Standard',
        targetTierName: 'Premium',
        upgradePath: '/subscription/upgrade?to=tier2',
      });

      render(<LocationsManagerCard vendor={mockVendorTier1} />);

      expect(screen.getByText(/standard/i)).toBeInTheDocument();
      expect(screen.getByText(/premium/i)).toBeInTheDocument();
    });

    it('includes pricing information in upgrade prompt', () => {
      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: 'tier1',
        upgradePath: '/subscription/upgrade',
        upgradePrice: '$99/month',
      });

      render(<LocationsManagerCard vendor={mockVendorTier1} />);

      expect(screen.getByText(/\$99\/month/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error States', () => {
    it('handles undefined vendor tier gracefully', () => {
      const vendorNoTier = { ...mockVendorTier1, tier: undefined as any };

      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: undefined,
        upgradePath: 'tier2',
      });

      render(<LocationsManagerCard vendor={vendorNoTier} />);

      expect(screen.getByText(/upgrade/i)).toBeInTheDocument();
    });

    it('handles missing tier gracefully', () => {
      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: null,
        upgradePath: 'tier2',
      });

      render(
        <TierGate requiredTier="tier2" currentTier={undefined}>
          <div>Protected Content</div>
        </TierGate>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });
});
