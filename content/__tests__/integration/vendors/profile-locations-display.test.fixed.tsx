/**
 * Integration Tests - Public Profile Locations Display (FIXED VERSION)
 *
 * Tests vendor profile public display with tier-based filtering:
 * - Tier 2+ vendors: All locations displayed on map and list
 * - Tier 1 vendors: Only HQ shown (no upgrade messaging to public users)
 * - Free tier vendors: Only HQ shown (no upgrade messaging to public users)
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LocationsDisplaySection } from '@/components/vendors/LocationsDisplaySection';
import { LocationCard } from '@/components/vendors/LocationCard';
import {
  mockVendorTier2,
  mockVendorTier1,
  mockVendorFree,
  mockVendorNoLocations,
  mockVendorSingleLocation,
  mockLocationMonaco,
  mockLocationFortLauderdale,
  mockLocationNice,
} from '../../fixtures/vendor-data';

// Mock Leaflet
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children, center, zoom, ...props }: any) => (
    <div
      data-testid="map-container"
      data-center={JSON.stringify(center)}
      data-zoom={zoom}
    >
      {children}
    </div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children, position, ...props }: any) => {
    const icon = props.icon as any;
    const isHQ = icon?.options?.className?.includes('hq-marker');

    return (
      <div
        data-testid="marker"
        data-position={JSON.stringify(position)}
        data-is-hq={isHQ ? 'true' : 'false'}
      >
        {children}
      </div>
    );
  },
  Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
  useMap: () => ({
    setView: jest.fn(),
    invalidateSize: jest.fn(),
    fitBounds: jest.fn(),
  }),
}));

jest.mock('leaflet/dist/leaflet.css', () => ({}));

describe('Public Profile Locations Display - Integration Tests', () => {
  describe('Tier 2 Vendor - All Locations Display', () => {
    it('displays all locations for tier2 vendor on map', () => {
      render(
        <LocationsDisplaySection
          locations={mockVendorTier2.locations}
          vendorTier="tier2"
        />
      );

      const markers = screen.getAllByTestId('marker');
      expect(markers).toHaveLength(3);

      const positions = markers.map((m) =>
        JSON.parse(m.getAttribute('data-position') || '[]')
      );

      expect(positions).toContainEqual([43.7384, 7.4246]); // Monaco
      expect(positions).toContainEqual([26.1224, -80.1373]); // Fort Lauderdale
      expect(positions).toContainEqual([43.7102, 7.2620]); // Nice
    });

    it('displays all location cards for tier2 vendor', () => {
      render(
        <div>
          {mockVendorTier2.locations.map((location) => (
            <LocationCard key={location.id} location={location} />
          ))}
        </div>
      );

      expect(screen.getByText('Monaco')).toBeInTheDocument();
      expect(screen.getByText('Fort Lauderdale')).toBeInTheDocument();
      expect(screen.getByText('Nice')).toBeInTheDocument();
    });

    it('shows HQ marker with different styling', () => {
      render(
        <LocationsDisplaySection
          locations={mockVendorTier2.locations}
          vendorTier="tier2"
        />
      );

      const markers = screen.getAllByTestId('marker');
      const hqMarkers = markers.filter(
        (m) => m.getAttribute('data-is-hq') === 'true'
      );

      expect(hqMarkers).toHaveLength(1);
    });

    it('centers map to show all locations', () => {
      render(
        <LocationsDisplaySection
          locations={mockVendorTier2.locations}
          vendorTier="tier2"
        />
      );

      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toBeInTheDocument();

      const center = mapContainer.getAttribute('data-center');
      expect(center).toBeTruthy();
    });
  });

  describe('Tier 1 Vendor - HQ Only Display', () => {
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

      expect(markers[0].getAttribute('data-is-hq')).toBe('true');
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
      // Should still show HQ marker
      expect(screen.queryByTestId('marker')).toBeInTheDocument();
    });

    it('filters to HQ only for tier1 with hidden locations', () => {
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

      // Should show only 1 marker (HQ)
      const markers = screen.getAllByTestId('marker');
      expect(markers).toHaveLength(1);
    });
  });

  describe('Free Tier Vendor - HQ Only Display', () => {
    it('shows only HQ location for free tier vendor', () => {
      const freeWithLocations = {
        ...mockVendorFree,
        locations: [mockLocationMonaco, mockLocationFortLauderdale],
      };

      render(
        <LocationsDisplaySection
          locations={freeWithLocations.locations}
          vendorTier="free"
        />
      );

      const markers = screen.getAllByTestId('marker');
      expect(markers).toHaveLength(1);
    });

    it('does not show upgrade message to public users for free tier vendors', () => {
      const freeWithLocations = {
        ...mockVendorFree,
        locations: [mockLocationMonaco],
      };

      render(
        <LocationsDisplaySection
          locations={freeWithLocations.locations}
          vendorTier="free"
        />
      );

      // Public-facing component should NOT show upgrade messaging
      expect(screen.queryByText(/upgrade/i)).not.toBeInTheDocument();
      // Should still show HQ marker
      expect(screen.queryByTestId('marker')).toBeInTheDocument();
    });
  });

  describe('Location Card Integration', () => {
    it('displays complete address in location card', () => {
      render(<LocationCard location={mockLocationMonaco} />);

      expect(screen.getByText(/7 Avenue de Grande Bretagne/i)).toBeInTheDocument();
      expect(screen.getByText(/Monaco/i)).toBeInTheDocument();
    });

    it('includes Get Directions link with correct coordinates', () => {
      render(<LocationCard location={mockLocationMonaco} />);

      const directionsLink = screen.getByRole('link', {
        name: /get directions/i,
      });
      expect(directionsLink).toHaveAttribute(
        'href',
        expect.stringContaining('43.7384')
      );
      expect(directionsLink).toHaveAttribute(
        'href',
        expect.stringContaining('7.4246')
      );
    });

    it('shows HQ badge in location card for headquarters', () => {
      render(<LocationCard location={mockLocationMonaco} isHQ={true} />);

      expect(screen.getByText(/HQ/i)).toBeInTheDocument();
    });

    it('does not show HQ badge for non-headquarters locations', () => {
      render(<LocationCard location={mockLocationFortLauderdale} isHQ={false} />);

      expect(screen.queryByText(/HQ/i)).not.toBeInTheDocument();
    });

    it('displays location name when available', () => {
      render(<LocationCard location={mockLocationMonaco} />);

      expect(screen.getByText(/Monaco/i)).toBeInTheDocument();
    });
  });

  describe('Empty State and Error Handling', () => {
    it('displays empty state when no locations provided', () => {
      render(
        <LocationsDisplaySection locations={[]} vendorTier="tier2" />
      );

      expect(screen.getByText(/no locations available/i)).toBeInTheDocument();
    });

    it('handles single location display correctly', () => {
      render(
        <LocationsDisplaySection
          locations={mockVendorSingleLocation.locations}
          vendorTier="tier2"
        />
      );

      const markers = screen.getAllByTestId('marker');
      expect(markers).toHaveLength(1);

      const mapContainer = screen.getByTestId('map-container');
      const center = JSON.parse(
        mapContainer.getAttribute('data-center') || '[]'
      );
      expect(center).toEqual([43.7384, 7.4246]);
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

      expect(screen.getByText(/invalid location data/i)).toBeInTheDocument();
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

  describe('Map Interactions', () => {
    it('renders map container for interactions', () => {
      render(
        <LocationsDisplaySection
          locations={mockVendorTier2.locations}
          vendorTier="tier2"
        />
      );

      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toBeInTheDocument();
    });

    it('displays map with locations', () => {
      render(
        <LocationsDisplaySection
          locations={mockVendorTier2.locations}
          vendorTier="tier2"
        />
      );

      const markers = screen.getAllByTestId('marker');
      expect(markers.length).toBeGreaterThan(0);
    });

    it('calculates appropriate zoom level for location spread', () => {
      render(
        <LocationsDisplaySection
          locations={mockVendorTier2.locations}
          vendorTier="tier2"
        />
      );

      const mapContainer = screen.getByTestId('map-container');
      const zoom = mapContainer.getAttribute('data-zoom');

      expect(zoom).toBeTruthy();
    });
  });
});
