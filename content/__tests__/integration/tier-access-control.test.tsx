/**
 * Integration Tests - Tier-Based Access Control (FIXED VERSION)
 *
 * Tests complete tier access control workflow across components:
 * - TierGate component with different tier levels
 * - LocationsManagerCard tier-based rendering
 * - Admin bypass functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TierGate } from '@/components/shared/TierGate';
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

// Mock useAuth context (the actual hook that TierGate uses)
jest.mock('@/lib/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const { useAuth } = require('@/lib/context/AuthContext');

describe('Tier-Based Access Control - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default: Regular user (non-admin)
    useAuth.mockReturnValue({
      user: { id: 'user-1', role: 'user' },
      isAuthenticated: true,
      tier: 'free',
      role: 'vendor',
    });
  });

  describe('TierGate Component Integration', () => {
    it('blocks content when tier requirement not met', () => {
      useAuth.mockReturnValue({
        tier: 'tier1',
        role: 'vendor',
      });

      render(
        <TierGate requiredTier="tier2">
          <div>Tier 2 Content</div>
        </TierGate>
      );

      expect(screen.queryByText('Tier 2 Content')).not.toBeInTheDocument();
    });

    it('shows content when tier requirement is met', () => {
      useAuth.mockReturnValue({
        tier: 'tier2',
        role: 'vendor',
      });

      render(
        <TierGate requiredTier="tier2">
          <div>Tier 2 Content</div>
        </TierGate>
      );

      expect(screen.getByText('Tier 2 Content')).toBeInTheDocument();
    });

    it('renders custom fallback when access denied', () => {
      useAuth.mockReturnValue({
        tier: 'tier1',
        role: 'vendor',
      });

      render(
        <TierGate
          requiredTier="tier2"
          fallback={<div>Custom Upgrade Message</div>}
        >
          <div>Protected Content</div>
        </TierGate>
      );

      expect(screen.getByText('Custom Upgrade Message')).toBeInTheDocument();
    });

    it('renders default upgrade prompt when no custom fallback provided', () => {
      useAuth.mockReturnValue({
        tier: 'tier1',
        role: 'vendor',
      });

      render(
        <TierGate requiredTier="tier2">
          <div>Protected Content</div>
        </TierGate>
      );

      expect(screen.getByText(/Premium Feature/i)).toBeInTheDocument();
    });
  });

  describe('Admin Bypass Functionality', () => {
    it('allows admin to access all features regardless of vendor tier', () => {
      useAuth.mockReturnValue({
        tier: 'free',
        role: 'admin',
      });

      render(
        <TierGate requiredTier="tier2">
          <div>Protected Content</div>
        </TierGate>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('LocationsDisplaySection Tier-Based Display', () => {
    it('displays all locations for tier2 vendor on map', () => {
      render(
        <LocationsDisplaySection
          locations={mockVendorTier2.locations}
          vendorTier="tier2"
        />
      );

      const markers = screen.getAllByTestId('marker');
      expect(markers).toHaveLength(3);
    });

    it('shows only HQ location for tier1 vendor', () => {
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

      const markers = screen.getAllByTestId('marker');
      expect(markers).toHaveLength(1);

      expect(markers).toHaveLength(1);
    });

    it('does not show upgrade message to public users for tier1 vendors', () => {
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

      // Public-facing component should NOT show upgrade messaging
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

    it('handles empty locations gracefully', () => {
      render(
        <LocationsDisplaySection locations={[]} vendorTier="tier2" />
      );

      expect(screen.getByText(/no locations available/i)).toBeInTheDocument();
    });

    it('shows loading state while map initializes', () => {
      render(
        <LocationsDisplaySection
          locations={mockVendorTier2.locations}
          vendorTier="tier2"
          isLoading={true}
        />
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error States', () => {
    it('handles undefined vendor tier gracefully', () => {
      render(
        <TierGate requiredTier="tier2">
          <div>Protected Content</div>
        </TierGate>
      );

      expect(screen.getByText(/Premium Feature/i)).toBeInTheDocument();
    });

    it('handles missing tier gracefully', () => {
      useAuth.mockReturnValue({
        tier: null,
        role: 'vendor',
      });

      render(
        <TierGate requiredTier="tier2">
          <div>Protected Content</div>
        </TierGate>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('handles invalid coordinates gracefully', () => {
      const invalidLocation = {
        ...mockLocationMonaco,
        latitude: NaN,
        longitude: NaN,
      };

      render(
        <LocationsDisplaySection
          locations={[invalidLocation]}
          vendorTier="tier2"
        />
      );

      expect(screen.getByText(/Location data is incomplete/i)).toBeInTheDocument();
    });
  });
});
