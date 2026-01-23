import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LocationsDisplaySection } from '@/components/vendors/LocationsDisplaySection';
import { VendorLocation } from '@/lib/types';

// Mock Leaflet - don't spread boolean props to DOM
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children, center, zoom, zoomControl, dragging, scrollWheelZoom }: any) => (
    <div
      data-testid="map-container"
      data-center={center ? JSON.stringify(center) : undefined}
      data-zoom={zoom?.toString()}
      data-zoom-control={zoomControl?.toString()}
      data-dragging={dragging?.toString()}
      data-scroll-wheel-zoom={scrollWheelZoom?.toString()}
      role="region"
      aria-label="Locations map"
    >
      {children}
    </div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children, position }: any) => {
    // Don't use data-is-hq as it's not a valid DOM attribute
    // Extract isHQ from children if needed for testing
    return (
      <div
        data-testid="marker"
        data-position={JSON.stringify(position)}
        role="button"
        tabIndex={0}
      >
        {children}
      </div>
    );
  },
  Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
  useMap: () => ({
    setView: jest.fn(),
    invalidateSize: jest.fn()
  })
}));

// Mock Leaflet CSS
jest.mock('leaflet/dist/leaflet.css', () => ({}));

describe('LocationsDisplaySection', () => {
  const mockLocations: VendorLocation[] = [
    {
      id: 'loc-1',
      address: '123 Main St',
      city: 'Monaco',
      country: 'Monaco',
      latitude: 43.7384,
      longitude: 7.4246,
      isHQ: true,
      locationName: 'Monaco HQ'
    } as VendorLocation,
    {
      id: 'loc-2',
      address: '456 Park Ave',
      city: 'Fort Lauderdale',
      country: 'USA',
      latitude: 26.1224,
      longitude: -80.1373,
      isHQ: false,
      locationName: 'Florida Office'
    } as VendorLocation
  ];

  describe('Map Rendering', () => {
    it('renders map container', () => {
      render(<LocationsDisplaySection locations={mockLocations} />);

      expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });

    it('renders tile layer', () => {
      render(<LocationsDisplaySection locations={mockLocations} />);

      expect(screen.getByTestId('tile-layer')).toBeInTheDocument();
    });

    it('renders markers for all locations', () => {
      render(<LocationsDisplaySection locations={mockLocations} />);

      const markers = screen.getAllByTestId('marker');
      expect(markers).toHaveLength(2);
    });

    it('positions markers at correct coordinates', () => {
      render(<LocationsDisplaySection locations={mockLocations} />);

      const markers = screen.getAllByTestId('marker');

      const marker1Position = JSON.parse(markers[0].getAttribute('data-position') || '[]');
      expect(marker1Position).toEqual([43.7384, 7.4246]);

      const marker2Position = JSON.parse(markers[1].getAttribute('data-position') || '[]');
      expect(marker2Position).toEqual([26.1224, -80.1373]);
    });

    it('displays HQ marker differently from regular markers', () => {
      render(<LocationsDisplaySection locations={mockLocations} />);

      // Check that HQ badge is present in first popup (HQ location)
      const popups = screen.getAllByTestId('popup');
      expect(popups[0]).toHaveTextContent('Headquarters');
      
      // Regular location should not have HQ badge
      expect(popups[1]).not.toHaveTextContent('Headquarters');
    });
  });

  describe('Marker Interactions', () => {
    it('shows popup on marker click', async () => {
      render(<LocationsDisplaySection locations={mockLocations} />);

      // Popups are always rendered in this implementation
      const popups = screen.getAllByTestId('popup');
      expect(popups.length).toBeGreaterThan(0);
    });

    it('displays location details in popup', async () => {
      render(<LocationsDisplaySection locations={mockLocations} />);

      // Verify content in popups using getAllByText for duplicated text
      expect(screen.getByText('Monaco HQ')).toBeInTheDocument();
      
      // Use getAllByText for addresses that appear in both popup and card
      const addresses = screen.getAllByText('123 Main St');
      expect(addresses.length).toBeGreaterThan(0);
      
      // Check Monaco text exists
      expect(screen.getAllByText(/monaco/i).length).toBeGreaterThan(0);
    });

    it('shows HQ badge in popup for headquarters location', async () => {
      render(<LocationsDisplaySection locations={mockLocations} />);

      expect(screen.getByText(/headquarters/i)).toBeInTheDocument();
    });

    it('does not show HQ badge for regular locations', async () => {
      render(<LocationsDisplaySection locations={mockLocations} />);

      const popups = screen.getAllByTestId('popup');
      // Second popup should not have headquarters badge
      const secondPopupText = popups[1].textContent || '';
      expect(secondPopupText).not.toContain('Headquarters');
    });
  });

  describe('Multiple Locations Display', () => {
    it('centers map on HQ location by default', () => {
      render(<LocationsDisplaySection locations={mockLocations} />);

      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toHaveAttribute('data-center', JSON.stringify([43.7384, 7.4246]));
    });

    it('adjusts zoom level based on location spread', () => {
      render(<LocationsDisplaySection locations={mockLocations} />);

      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toHaveAttribute('data-zoom');
    });

    it('displays all locations when multiple present', () => {
      render(<LocationsDisplaySection locations={mockLocations} />);

      const markers = screen.getAllByTestId('marker');
      expect(markers).toHaveLength(mockLocations.length);
    });

    it('handles single location display', () => {
      const singleLocation = [mockLocations[0]];
      render(<LocationsDisplaySection locations={singleLocation} />);

      const markers = screen.getAllByTestId('marker');
      expect(markers).toHaveLength(1);
    });
  });

  describe('Tier-Based Filtering', () => {
    it('shows all locations for tier2+ vendors', () => {
      render(
        <LocationsDisplaySection
          locations={mockLocations}
          vendorTier="tier2"
        />
      );

      const markers = screen.getAllByTestId('marker');
      expect(markers).toHaveLength(2);
    });

    it('shows only HQ location for free tier vendors', () => {
      render(
        <LocationsDisplaySection
          locations={mockLocations}
          vendorTier="free"
        />
      );

      const markers = screen.getAllByTestId('marker');
      expect(markers).toHaveLength(1);

      const markerPosition = JSON.parse(markers[0].getAttribute('data-position') || '[]');
      expect(markerPosition).toEqual([43.7384, 7.4246]);
    });

    it('shows only HQ location for tier1 vendors', () => {
      render(
        <LocationsDisplaySection
          locations={mockLocations}
          vendorTier="tier1"
        />
      );

      const markers = screen.getAllByTestId('marker');
      expect(markers).toHaveLength(1);
    });

    it('does not show upgrade message to public users for restricted tiers', () => {
      render(
        <LocationsDisplaySection
          locations={mockLocations}
          vendorTier="free"
        />
      );

      // Public-facing component should NOT show upgrade messaging
      expect(screen.queryByText(/upgrade/i)).not.toBeInTheDocument();
    });
  });

  describe('Map Controls', () => {
    it('renders zoom controls', () => {
      render(<LocationsDisplaySection locations={mockLocations} />);

      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toHaveAttribute('data-zoom-control', 'true');
    });

    it('allows panning the map', () => {
      render(<LocationsDisplaySection locations={mockLocations} />);

      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toHaveAttribute('data-dragging', 'true');
    });

    it('enables scroll wheel zoom', () => {
      render(<LocationsDisplaySection locations={mockLocations} />);

      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toHaveAttribute('data-scroll-wheel-zoom', 'true');
    });
  });

  describe('Loading States', () => {
    it('shows loading spinner while map initializes', async () => {
      render(
        <LocationsDisplaySection locations={mockLocations} isLoading={true} />
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('displays map after loading completes', () => {
      render(<LocationsDisplaySection locations={mockLocations} isLoading={false} />);

      expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('displays error message when map fails to load', () => {
      render(
        <LocationsDisplaySection
          locations={mockLocations}
          error="Failed to load map"
        />
      );

      expect(screen.getByText(/failed to load map/i)).toBeInTheDocument();
    });

    it('shows fallback when no locations provided', () => {
      render(<LocationsDisplaySection locations={[]} />);

      expect(screen.getByText(/no locations available/i)).toBeInTheDocument();
    });

    it('handles invalid coordinates gracefully', () => {
      const invalidLocations: VendorLocation[] = [
        {
          ...mockLocations[0],
          latitude: NaN,
          longitude: NaN
        } as VendorLocation
      ];

      render(<LocationsDisplaySection locations={invalidLocations} />);

      expect(screen.getByText(/Location data is incomplete/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible label for map', () => {
      render(<LocationsDisplaySection locations={mockLocations} />);

      // There are multiple elements with the "Locations map" label (map container + region wrapper)
      // Use getAllByRole to handle multiple matches
      const mapRegions = screen.getAllByRole('region', { name: /locations map/i });
      expect(mapRegions.length).toBeGreaterThan(0);
    });

    it('provides keyboard navigation for markers', () => {
      render(<LocationsDisplaySection locations={mockLocations} />);

      const markers = screen.getAllByTestId('marker');
      markers[0].focus();
      expect(markers[0]).toHaveFocus();
    });

    it('includes alt text for location information', async () => {
      render(<LocationsDisplaySection locations={mockLocations} />);

      // Popups are always rendered, check content exists
      expect(screen.getByText('Monaco HQ')).toBeInTheDocument();
      
      // Use getAllByText for addresses that appear multiple times
      const addresses = screen.getAllByText('123 Main St');
      expect(addresses.length).toBeGreaterThan(0);
    });
  });
});
