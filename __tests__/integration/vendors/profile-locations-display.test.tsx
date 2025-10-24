/**
 * Integration Tests - Public Profile Locations Display
 *
 * Tests vendor profile public display with tier-based filtering:
 * - Tier 2+ vendors: All locations displayed on map and list
 * - Tier 1 vendors: Only HQ shown with upgrade message
 * - Free tier vendors: Only HQ shown with upgrade message
 * - Map rendering with correct markers and popups
 * - Location cards with addresses and "Get Directions" links
 * - Empty state handling
 * - Responsive layout (mobile/desktop)
 *
 * Total: 10+ integration test cases
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

      // Verify marker positions
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

      expect(screen.getByText('Monaco Headquarters')).toBeInTheDocument();
      expect(screen.getByText('Florida Sales Office')).toBeInTheDocument();
      expect(screen.getByText('Nice Service Center')).toBeInTheDocument();
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

    it('displays location details in map popup on marker click', async () => {
      render(
        <LocationsDisplaySection
          locations={mockVendorTier2.locations}
          vendorTier="tier2"
        />
      );

      const markers = screen.getAllByTestId('marker');
      fireEvent.click(markers[0]);

      await waitFor(() => {
        const popup = screen.getByTestId('popup');
        expect(popup).toBeInTheDocument();
        expect(popup).toHaveTextContent(/Monaco/i);
      });
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

      // Should have a center point
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

      // Verify it's the HQ marker
      expect(markers[0].getAttribute('data-is-hq')).toBe('true');
    });

    it('displays upgrade message for tier1 vendors with multiple locations', () => {
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

    it('shows location count indicator for tier1 with hidden locations', () => {
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

      expect(screen.getByText(/2 locations/i)).toBeInTheDocument();
      expect(screen.getByText(/showing 1/i)).toBeInTheDocument();
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

    it('displays upgrade message for free tier vendors', () => {
      const freeWithLocations = {
        ...mockVendorFree,
        locations: [mockLocationMonaco],
      };

      render(
        <LocationsDisplaySection
          locations={freeWithLocations.locations}
          vendorTier="free"
          showUpgradePrompt={true}
        />
      );

      expect(
        screen.getByText(/upgrade.*unlock.*locations/i)
      ).toBeInTheDocument();
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
      render(<LocationCard location={mockLocationMonaco} />);

      expect(screen.getByText(/headquarters/i)).toBeInTheDocument();
    });

    it('does not show HQ badge for non-headquarters locations', () => {
      render(<LocationCard location={mockLocationFortLauderdale} />);

      expect(screen.queryByText(/headquarters/i)).not.toBeInTheDocument();
    });

    it('displays location name when available', () => {
      render(<LocationCard location={mockLocationMonaco} />);

      expect(screen.getByText('Monaco Headquarters')).toBeInTheDocument();
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

      // Map should center on single location
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

  describe('Responsive Layout', () => {
    it('displays map and list side-by-side on desktop', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
          matches: query === '(min-width: 1024px)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(
        <LocationsDisplaySection
          locations={mockVendorTier2.locations}
          vendorTier="tier2"
        />
      );

      const container = screen.getByTestId('locations-container');
      expect(container).toHaveClass(/grid|flex/);
    });

    it('stacks map and list vertically on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation((query) => ({
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

      render(
        <LocationsDisplaySection
          locations={mockVendorTier2.locations}
          vendorTier="tier2"
        />
      );

      const container = screen.getByTestId('locations-container');
      expect(container).toHaveClass(/flex-col|block/);
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

      // Should have a reasonable zoom level
      expect(zoom).toBeTruthy();
    });
  });
});
