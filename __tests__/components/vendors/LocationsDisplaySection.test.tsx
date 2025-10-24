import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LocationsDisplaySection } from '@/components/vendors/LocationsDisplaySection';
import { VendorLocation } from '@/lib/types';

// Mock Leaflet
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children, ...props }: any) => (
    <div data-testid="map-container" {...props}>
      {children}
    </div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children, position, ...props }: any) => (
    <div data-testid="marker" data-position={JSON.stringify(position)} {...props}>
      {children}
    </div>
  ),
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
    },
    {
      id: 'loc-2',
      address: '456 Park Ave',
      city: 'Fort Lauderdale',
      country: 'USA',
      latitude: 26.1224,
      longitude: -80.1373,
      isHQ: false,
      locationName: 'Florida Office'
    }
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

      const markers = screen.getAllByTestId('marker');

      // HQ marker should have special styling/icon
      expect(markers[0]).toHaveAttribute('data-is-hq', 'true');
      expect(markers[1]).toHaveAttribute('data-is-hq', 'false');
    });
  });

  describe('Marker Interactions', () => {
    it('shows popup on marker click', async () => {
      render(<LocationsDisplaySection locations={mockLocations} />);

      const markers = screen.getAllByTestId('marker');
      fireEvent.click(markers[0]);

      await waitFor(() => {
        expect(screen.getByTestId('popup')).toBeInTheDocument();
      });
    });

    it('displays location details in popup', async () => {
      render(<LocationsDisplaySection locations={mockLocations} />);

      const markers = screen.getAllByTestId('marker');
      fireEvent.click(markers[0]);

      await waitFor(() => {
        expect(screen.getByText('Monaco HQ')).toBeInTheDocument();
        expect(screen.getByText('123 Main St')).toBeInTheDocument();
        expect(screen.getByText(/monaco/i)).toBeInTheDocument();
      });
    });

    it('shows HQ badge in popup for headquarters location', async () => {
      render(<LocationsDisplaySection locations={mockLocations} />);

      const markers = screen.getAllByTestId('marker');
      fireEvent.click(markers[0]);

      await waitFor(() => {
        expect(screen.getByText(/headquarters/i)).toBeInTheDocument();
      });
    });

    it('does not show HQ badge for regular locations', async () => {
      render(<LocationsDisplaySection locations={mockLocations} />);

      const markers = screen.getAllByTestId('marker');
      fireEvent.click(markers[1]);

      await waitFor(() => {
        expect(screen.queryByText(/headquarters/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Multiple Locations Display', () => {
    it('centers map on HQ location by default', () => {
      render(<LocationsDisplaySection locations={mockLocations} />);

      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toHaveAttribute('center', JSON.stringify([43.7384, 7.4246]));
    });

    it('adjusts zoom level based on location spread', () => {
      render(<LocationsDisplaySection locations={mockLocations} />);

      const mapContainer = screen.getByTestId('map-container');
      // Should zoom out when locations are far apart
      expect(mapContainer).toHaveAttribute('zoom');
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
      expect(markerPosition).toEqual([43.7384, 7.4246]); // HQ location
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

    it('shows upgrade message for restricted tiers', () => {
      render(
        <LocationsDisplaySection
          locations={mockLocations}
          vendorTier="free"
        />
      );

      expect(screen.getByText(/upgrade to see all locations/i)).toBeInTheDocument();
    });
  });

  describe('Map Controls', () => {
    it('renders zoom controls', () => {
      render(<LocationsDisplaySection locations={mockLocations} />);

      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toHaveAttribute('zoomControl', 'true');
    });

    it('allows panning the map', () => {
      render(<LocationsDisplaySection locations={mockLocations} />);

      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toHaveAttribute('dragging', 'true');
    });

    it('enables scroll wheel zoom', () => {
      render(<LocationsDisplaySection locations={mockLocations} />);

      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toHaveAttribute('scrollWheelZoom', 'true');
    });
  });

  describe('Loading States', () => {
    it('shows loading spinner while map initializes', async () => {
      const { container } = render(
        <LocationsDisplaySection locations={mockLocations} isLoading={true} />
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      });
    });

    it('displays map after loading completes', async () => {
      const { rerender } = render(
        <LocationsDisplaySection locations={mockLocations} isLoading={true} />
      );

      rerender(<LocationsDisplaySection locations={mockLocations} isLoading={false} />);

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
      const invalidLocations = [
        {
          ...mockLocations[0],
          latitude: NaN,
          longitude: NaN
        }
      ];

      render(<LocationsDisplaySection locations={invalidLocations} />);

      expect(screen.getByText(/invalid location data/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible label for map', () => {
      render(<LocationsDisplaySection locations={mockLocations} />);

      expect(screen.getByRole('region', { name: /locations map/i })).toBeInTheDocument();
    });

    it('provides keyboard navigation for markers', () => {
      render(<LocationsDisplaySection locations={mockLocations} />);

      const markers = screen.getAllByTestId('marker');
      markers[0].focus();
      expect(markers[0]).toHaveFocus();
    });

    it('includes alt text for location information', async () => {
      render(<LocationsDisplaySection locations={mockLocations} />);

      const markers = screen.getAllByTestId('marker');
      fireEvent.click(markers[0]);

      await waitFor(() => {
        expect(screen.getByText('Monaco HQ')).toBeInTheDocument();
        expect(screen.getByText('123 Main St')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('adjusts map height for mobile screens', () => {
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

      render(<LocationsDisplaySection locations={mockLocations} />);

      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toHaveClass(/h-64|h-80/); // Mobile height
    });

    it('uses larger map height for desktop screens', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
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

      render(<LocationsDisplaySection locations={mockLocations} />);

      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toHaveClass(/h-96|h-\[500px\]/); // Desktop height
    });
  });
});
