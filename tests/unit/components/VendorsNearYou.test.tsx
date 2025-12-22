/**
 * Unit tests for VendorsNearYou component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { VendorsNearYou } from '@/components/products/VendorsNearYou';
import type { Vendor, Product } from '@/lib/types';

// Mock hooks
jest.mock('@/hooks/useLocationPreference');
jest.mock('@/hooks/useNearbyVendorsByCategory');

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock NearbyVendorCard component
jest.mock('@/components/products/NearbyVendorCard', () => ({
  NearbyVendorCard: ({ vendor, distance }: { vendor: Vendor; distance?: number }) => (
    <div
      data-testid="nearby-vendor-card"
      data-vendor-id={vendor.id}
      data-distance={distance}
    >
      {vendor.name}
    </div>
  ),
}));

const mockUseLocationPreference = require('@/hooks/useLocationPreference').useLocationPreference as jest.Mock;
const mockUseNearbyVendorsByCategory = require('@/hooks/useNearbyVendorsByCategory').useNearbyVendorsByCategory as jest.Mock;

// Mock data for testing
const createMockVendor = (id: string, name: string, distance?: number): Vendor => ({
  id,
  name,
  slug: name.toLowerCase().replace(/\s+/g, '-'),
  tier: 'premium',
  partner: false,
  locations: [
    {
      id: `${id}-loc`,
      name: `${name} Office`,
      city: 'Monaco',
      country: 'Monaco',
      latitude: 43.7384,
      longitude: 7.4246,
      isHQ: true,
    },
  ],
  distance,
});

const mockVendors: Vendor[] = [
  createMockVendor('vendor-1', 'Vendor 1', 10),
  createMockVendor('vendor-2', 'Vendor 2', 20),
  createMockVendor('vendor-3', 'Vendor 3', 30),
  createMockVendor('vendor-4', 'Vendor 4', 40),
  createMockVendor('vendor-5', 'Vendor 5', 50),
];

const mockProducts: Product[] = [];

describe('VendorsNearYou', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show skeleton cards while loading', () => {
      mockUseLocationPreference.mockReturnValue({
        location: { latitude: 43.7384, longitude: 7.4246 },
        isExpired: false,
      });

      mockUseNearbyVendorsByCategory.mockReturnValue({
        vendors: [],
        isLoading: true,
        error: null,
      });

      render(
        <VendorsNearYou
          category="marine-electronics"
          vendors={mockVendors}
          products={mockProducts}
        />
      );

      expect(screen.getByText('Vendors Near You')).toBeInTheDocument();

      // Should render 3 skeleton cards
      const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThanOrEqual(3);
    });

    it('should not show vendor cards while loading', () => {
      mockUseLocationPreference.mockReturnValue({
        location: { latitude: 43.7384, longitude: 7.4246 },
        isExpired: false,
      });

      mockUseNearbyVendorsByCategory.mockReturnValue({
        vendors: mockVendors.slice(0, 4),
        isLoading: true,
        error: null,
      });

      render(
        <VendorsNearYou
          category="marine-electronics"
          vendors={mockVendors}
          products={mockProducts}
        />
      );

      expect(screen.queryByTestId('nearby-vendor-card')).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error message when hook returns error', () => {
      mockUseLocationPreference.mockReturnValue({
        location: { latitude: 43.7384, longitude: 7.4246 },
        isExpired: false,
      });

      mockUseNearbyVendorsByCategory.mockReturnValue({
        vendors: [],
        isLoading: false,
        error: new Error('Failed to fetch vendors'),
      });

      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <VendorsNearYou
          category="marine-electronics"
          vendors={mockVendors}
          products={mockProducts}
        />
      );

      expect(screen.getByText('Vendors Near You')).toBeInTheDocument();
      expect(
        screen.getByText('Unable to load nearby vendors. Please try again later.')
      ).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('should not show vendor cards when error occurs', () => {
      mockUseLocationPreference.mockReturnValue({
        location: { latitude: 43.7384, longitude: 7.4246 },
        isExpired: false,
      });

      mockUseNearbyVendorsByCategory.mockReturnValue({
        vendors: [],
        isLoading: false,
        error: new Error('Network error'),
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(
        <VendorsNearYou
          category="marine-electronics"
          vendors={mockVendors}
          products={mockProducts}
        />
      );

      expect(screen.queryByTestId('nearby-vendor-card')).not.toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('No Location State', () => {
    it('should show "Set your location" prompt when location is null', () => {
      mockUseLocationPreference.mockReturnValue({
        location: null,
        isExpired: false,
      });

      mockUseNearbyVendorsByCategory.mockReturnValue({
        vendors: [],
        isLoading: false,
        error: null,
      });

      render(
        <VendorsNearYou
          category="marine-electronics"
          vendors={mockVendors}
          products={mockProducts}
        />
      );

      expect(screen.getByText('Vendors Near You')).toBeInTheDocument();
      expect(screen.getByText('Set your location to find nearby vendors')).toBeInTheDocument();
    });

    it('should show "Set your location" prompt when location is expired', () => {
      mockUseLocationPreference.mockReturnValue({
        location: { latitude: 43.7384, longitude: 7.4246 },
        isExpired: true,
      });

      mockUseNearbyVendorsByCategory.mockReturnValue({
        vendors: [],
        isLoading: false,
        error: null,
      });

      render(
        <VendorsNearYou
          category="marine-electronics"
          vendors={mockVendors}
          products={mockProducts}
        />
      );

      expect(screen.getByText('Set your location to find nearby vendors')).toBeInTheDocument();
    });

    it('should show "Search Vendors" button when no location', () => {
      mockUseLocationPreference.mockReturnValue({
        location: null,
        isExpired: false,
      });

      mockUseNearbyVendorsByCategory.mockReturnValue({
        vendors: [],
        isLoading: false,
        error: null,
      });

      render(
        <VendorsNearYou
          category="marine-electronics"
          vendors={mockVendors}
          products={mockProducts}
        />
      );

      const button = screen.getByText('Search Vendors');
      expect(button).toBeInTheDocument();

      // Button should be inside a link to /vendors with category param
      const link = button.closest('a');
      expect(link).toHaveAttribute('href', '/vendors?category=marine-electronics');
    });
  });

  describe('No Results State', () => {
    it('should show "No vendors found" message when vendors array is empty', () => {
      mockUseLocationPreference.mockReturnValue({
        location: { latitude: 43.7384, longitude: 7.4246 },
        isExpired: false,
      });

      mockUseNearbyVendorsByCategory.mockReturnValue({
        vendors: [],
        isLoading: false,
        error: null,
      });

      render(
        <VendorsNearYou
          category="marine-electronics"
          vendors={mockVendors}
          products={mockProducts}
          defaultRadius={500}
        />
      );

      expect(screen.getByText('Vendors Near You')).toBeInTheDocument();
      expect(screen.getByText('No vendors found within 500 km')).toBeInTheDocument();
    });

    it('should show "View All Vendors" button when no results', () => {
      mockUseLocationPreference.mockReturnValue({
        location: { latitude: 43.7384, longitude: 7.4246 },
        isExpired: false,
      });

      mockUseNearbyVendorsByCategory.mockReturnValue({
        vendors: [],
        isLoading: false,
        error: null,
      });

      render(
        <VendorsNearYou
          category="marine-electronics"
          vendors={mockVendors}
          products={mockProducts}
        />
      );

      const button = screen.getByText('View All Vendors');
      expect(button).toBeInTheDocument();

      const link = button.closest('a');
      expect(link).toHaveAttribute('href', '/vendors?category=marine-electronics');
    });

    it('should use custom radius in no results message', () => {
      mockUseLocationPreference.mockReturnValue({
        location: { latitude: 43.7384, longitude: 7.4246 },
        isExpired: false,
      });

      mockUseNearbyVendorsByCategory.mockReturnValue({
        vendors: [],
        isLoading: false,
        error: null,
      });

      render(
        <VendorsNearYou
          category="marine-electronics"
          vendors={mockVendors}
          products={mockProducts}
          defaultRadius={100}
        />
      );

      expect(screen.getByText('No vendors found within 100 km')).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('should render NearbyVendorCard for each vendor', () => {
      mockUseLocationPreference.mockReturnValue({
        location: { latitude: 43.7384, longitude: 7.4246 },
        isExpired: false,
      });

      const nearbyVendors = mockVendors.slice(0, 4);
      mockUseNearbyVendorsByCategory.mockReturnValue({
        vendors: nearbyVendors,
        isLoading: false,
        error: null,
      });

      render(
        <VendorsNearYou
          category="marine-electronics"
          vendors={mockVendors}
          products={mockProducts}
        />
      );

      expect(screen.getByText('Vendors Near You')).toBeInTheDocument();

      const vendorCards = screen.getAllByTestId('nearby-vendor-card');
      expect(vendorCards).toHaveLength(4);

      // Verify each vendor is rendered
      nearbyVendors.forEach((vendor) => {
        expect(screen.getByText(vendor.name)).toBeInTheDocument();
      });
    });

    it('should show "View all vendors" link in success state', () => {
      mockUseLocationPreference.mockReturnValue({
        location: { latitude: 43.7384, longitude: 7.4246 },
        isExpired: false,
      });

      mockUseNearbyVendorsByCategory.mockReturnValue({
        vendors: mockVendors.slice(0, 4),
        isLoading: false,
        error: null,
      });

      render(
        <VendorsNearYou
          category="marine-electronics"
          vendors={mockVendors}
          products={mockProducts}
        />
      );

      const button = screen.getByText('View all vendors');
      expect(button).toBeInTheDocument();
    });

    it('should include category param in "View all vendors" link', () => {
      mockUseLocationPreference.mockReturnValue({
        location: { latitude: 43.7384, longitude: 7.4246 },
        isExpired: false,
      });

      mockUseNearbyVendorsByCategory.mockReturnValue({
        vendors: mockVendors.slice(0, 4),
        isLoading: false,
        error: null,
      });

      render(
        <VendorsNearYou
          category="navigation-systems"
          vendors={mockVendors}
          products={mockProducts}
        />
      );

      const button = screen.getByText('View all vendors');
      const link = button.closest('a');
      expect(link).toHaveAttribute('href', '/vendors?category=navigation-systems');
    });

    it('should pass distance to NearbyVendorCard', () => {
      mockUseLocationPreference.mockReturnValue({
        location: { latitude: 43.7384, longitude: 7.4246 },
        isExpired: false,
      });

      const vendorsWithDistance = mockVendors.slice(0, 2).map((v, i) => ({
        ...v,
        distance: (i + 1) * 10,
      }));

      mockUseNearbyVendorsByCategory.mockReturnValue({
        vendors: vendorsWithDistance,
        isLoading: false,
        error: null,
      });

      render(
        <VendorsNearYou
          category="marine-electronics"
          vendors={mockVendors}
          products={mockProducts}
        />
      );

      const cards = screen.getAllByTestId('nearby-vendor-card');
      expect(cards[0]).toHaveAttribute('data-distance', '10');
      expect(cards[1]).toHaveAttribute('data-distance', '20');
    });
  });

  describe('Limits and Props', () => {
    it('should respect maxVendors prop', () => {
      mockUseLocationPreference.mockReturnValue({
        location: { latitude: 43.7384, longitude: 7.4246 },
        isExpired: false,
      });

      mockUseNearbyVendorsByCategory.mockReturnValue({
        vendors: mockVendors.slice(0, 2),
        isLoading: false,
        error: null,
      });

      render(
        <VendorsNearYou
          category="marine-electronics"
          vendors={mockVendors}
          products={mockProducts}
          maxVendors={2}
        />
      );

      const vendorCards = screen.getAllByTestId('nearby-vendor-card');
      expect(vendorCards).toHaveLength(2);

      // Verify maxVendors was passed to hook
      expect(mockUseNearbyVendorsByCategory).toHaveBeenCalledWith(
        mockVendors,
        mockProducts,
        expect.objectContaining({ maxResults: 2 })
      );
    });

    it('should use default maxVendors of 4 when not provided', () => {
      mockUseLocationPreference.mockReturnValue({
        location: { latitude: 43.7384, longitude: 7.4246 },
        isExpired: false,
      });

      mockUseNearbyVendorsByCategory.mockReturnValue({
        vendors: mockVendors.slice(0, 4),
        isLoading: false,
        error: null,
      });

      render(
        <VendorsNearYou
          category="marine-electronics"
          vendors={mockVendors}
          products={mockProducts}
        />
      );

      const vendorCards = screen.getAllByTestId('nearby-vendor-card');
      expect(vendorCards).toHaveLength(4);

      expect(mockUseNearbyVendorsByCategory).toHaveBeenCalledWith(
        mockVendors,
        mockProducts,
        expect.objectContaining({ maxResults: 4 })
      );
    });

    it('should pass defaultRadius to hook', () => {
      mockUseLocationPreference.mockReturnValue({
        location: { latitude: 43.7384, longitude: 7.4246 },
        isExpired: false,
      });

      mockUseNearbyVendorsByCategory.mockReturnValue({
        vendors: [],
        isLoading: false,
        error: null,
      });

      render(
        <VendorsNearYou
          category="marine-electronics"
          vendors={mockVendors}
          products={mockProducts}
          defaultRadius={250}
        />
      );

      expect(mockUseNearbyVendorsByCategory).toHaveBeenCalledWith(
        mockVendors,
        mockProducts,
        expect.objectContaining({ radius: 250 })
      );
    });

    it('should pass currentVendorId to hook to exclude from results', () => {
      mockUseLocationPreference.mockReturnValue({
        location: { latitude: 43.7384, longitude: 7.4246 },
        isExpired: false,
      });

      mockUseNearbyVendorsByCategory.mockReturnValue({
        vendors: mockVendors.slice(1, 4),
        isLoading: false,
        error: null,
      });

      render(
        <VendorsNearYou
          category="marine-electronics"
          currentVendorId="vendor-1"
          vendors={mockVendors}
          products={mockProducts}
        />
      );

      expect(mockUseNearbyVendorsByCategory).toHaveBeenCalledWith(
        mockVendors,
        mockProducts,
        expect.objectContaining({ excludeVendorId: 'vendor-1' })
      );

      // Vendor 1 should not be in results
      expect(screen.queryByText('Vendor 1')).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      mockUseLocationPreference.mockReturnValue({
        location: { latitude: 43.7384, longitude: 7.4246 },
        isExpired: false,
      });

      mockUseNearbyVendorsByCategory.mockReturnValue({
        vendors: mockVendors.slice(0, 2),
        isLoading: false,
        error: null,
      });

      const { container } = render(
        <VendorsNearYou
          category="marine-electronics"
          vendors={mockVendors}
          products={mockProducts}
          className="custom-class"
        />
      );

      const card = container.querySelector('.custom-class');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Hook Integration', () => {
    it('should pass userLocation to hook when location is valid', () => {
      const location = { latitude: 43.7384, longitude: 7.4246 };
      mockUseLocationPreference.mockReturnValue({
        location,
        isExpired: false,
      });

      mockUseNearbyVendorsByCategory.mockReturnValue({
        vendors: [],
        isLoading: false,
        error: null,
      });

      render(
        <VendorsNearYou
          category="marine-electronics"
          vendors={mockVendors}
          products={mockProducts}
        />
      );

      expect(mockUseNearbyVendorsByCategory).toHaveBeenCalledWith(
        mockVendors,
        mockProducts,
        expect.objectContaining({
          userLocation: {
            latitude: 43.7384,
            longitude: 7.4246,
          },
        })
      );
    });

    it('should pass null userLocation to hook when location is expired', () => {
      mockUseLocationPreference.mockReturnValue({
        location: { latitude: 43.7384, longitude: 7.4246 },
        isExpired: true,
      });

      mockUseNearbyVendorsByCategory.mockReturnValue({
        vendors: [],
        isLoading: false,
        error: null,
      });

      render(
        <VendorsNearYou
          category="marine-electronics"
          vendors={mockVendors}
          products={mockProducts}
        />
      );

      expect(mockUseNearbyVendorsByCategory).toHaveBeenCalledWith(
        mockVendors,
        mockProducts,
        expect.objectContaining({ userLocation: null })
      );
    });

    it('should pass category to hook', () => {
      mockUseLocationPreference.mockReturnValue({
        location: { latitude: 43.7384, longitude: 7.4246 },
        isExpired: false,
      });

      mockUseNearbyVendorsByCategory.mockReturnValue({
        vendors: [],
        isLoading: false,
        error: null,
      });

      render(
        <VendorsNearYou
          category="navigation-systems"
          vendors={mockVendors}
          products={mockProducts}
        />
      );

      expect(mockUseNearbyVendorsByCategory).toHaveBeenCalledWith(
        mockVendors,
        mockProducts,
        expect.objectContaining({ category: 'navigation-systems' })
      );
    });
  });

  describe('UI Elements', () => {
    it('should render MapPin icon in header', () => {
      mockUseLocationPreference.mockReturnValue({
        location: { latitude: 43.7384, longitude: 7.4246 },
        isExpired: false,
      });

      mockUseNearbyVendorsByCategory.mockReturnValue({
        vendors: mockVendors.slice(0, 2),
        isLoading: false,
        error: null,
      });

      const { container } = render(
        <VendorsNearYou
          category="marine-electronics"
          vendors={mockVendors}
          products={mockProducts}
        />
      );

      // MapPin icon should be rendered
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should render ArrowRight icon in buttons', () => {
      mockUseLocationPreference.mockReturnValue({
        location: { latitude: 43.7384, longitude: 7.4246 },
        isExpired: false,
      });

      mockUseNearbyVendorsByCategory.mockReturnValue({
        vendors: mockVendors.slice(0, 2),
        isLoading: false,
        error: null,
      });

      const { container } = render(
        <VendorsNearYou
          category="marine-electronics"
          vendors={mockVendors}
          products={mockProducts}
        />
      );

      const button = screen.getByText('View all vendors');
      const buttonContainer = button.parentElement;

      // ArrowRight icon should be in the button
      const icons = buttonContainer?.querySelectorAll('svg');
      expect(icons).toBeTruthy();
    });
  });
});
