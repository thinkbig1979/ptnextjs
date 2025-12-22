/**
 * Unit tests for NearbyVendorCard component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { NearbyVendorCard } from '@/components/products/NearbyVendorCard';
import type { Vendor } from '@/lib/types';

// Mock next/link - forward all props including data-testid
jest.mock('next/link', () => {
  return ({ children, href, ...rest }: { children: React.ReactNode; href: string; [key: string]: unknown }) => {
    return <a href={href} {...rest}>{children}</a>;
  };
});

// Mock TierBadge component
jest.mock('@/components/vendors/TierBadge', () => ({
  TierBadge: ({ tier, size }: { tier: string; size: string }) => (
    <div data-testid="tier-badge" data-tier={tier} data-size={size}>
      {tier.toUpperCase()}
    </div>
  ),
}));

// Mock formatDistance utility
jest.mock('@/lib/utils/location', () => ({
  formatDistance: jest.fn((distance: number) => `${distance.toFixed(1)} km`),
}));

// Mock vendor data for testing
const createMockVendor = (overrides?: Partial<Vendor>): Vendor => ({
  id: 'vendor-123',
  name: 'Monaco Marine Services',
  slug: 'monaco-marine-services',
  tier: 'premium',
  partner: false,
  locations: [
    {
      id: 'loc-1',
      name: 'Monaco HQ',
      city: 'Monaco',
      country: 'Monaco',
      latitude: 43.7384,
      longitude: 7.4246,
      isHQ: true,
    },
  ],
  ...overrides,
});

describe('NearbyVendorCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render vendor name', () => {
      const vendor = createMockVendor();
      render(<NearbyVendorCard vendor={vendor} />);

      expect(screen.getByText('Monaco Marine Services')).toBeInTheDocument();
    });

    it('should have correct data-testid', () => {
      const vendor = createMockVendor();
      render(<NearbyVendorCard vendor={vendor} />);

      expect(screen.getByTestId('nearby-vendor-card')).toBeInTheDocument();
    });

    it('should link to correct vendor page', () => {
      const vendor = createMockVendor();
      render(<NearbyVendorCard vendor={vendor} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/vendors/monaco-marine-services');
    });
  });

  describe('Location Display', () => {
    it('should render city and country from locations array (HQ location)', () => {
      const vendor = createMockVendor();
      render(<NearbyVendorCard vendor={vendor} />);

      expect(screen.getByText('Monaco, Monaco')).toBeInTheDocument();
    });

    it('should prefer HQ location when multiple locations exist', () => {
      const vendor = createMockVendor({
        locations: [
          {
            id: 'loc-1',
            name: 'Branch Office',
            city: 'Nice',
            country: 'France',
            latitude: 43.7102,
            longitude: 7.2620,
            isHQ: false,
          },
          {
            id: 'loc-2',
            name: 'Main Office',
            city: 'Monaco',
            country: 'Monaco',
            latitude: 43.7384,
            longitude: 7.4246,
            isHQ: true,
          },
        ],
      });

      render(<NearbyVendorCard vendor={vendor} />);

      expect(screen.getByText('Monaco, Monaco')).toBeInTheDocument();
      expect(screen.queryByText('Nice, France')).not.toBeInTheDocument();
    });

    it('should use first location when no HQ is designated', () => {
      const vendor = createMockVendor({
        locations: [
          {
            id: 'loc-1',
            name: 'First Office',
            city: 'Paris',
            country: 'France',
            latitude: 48.8566,
            longitude: 2.3522,
            isHQ: false,
          },
          {
            id: 'loc-2',
            name: 'Second Office',
            city: 'Lyon',
            country: 'France',
            latitude: 45.7640,
            longitude: 4.8357,
            isHQ: false,
          },
        ],
      });

      render(<NearbyVendorCard vendor={vendor} />);

      expect(screen.getByText('Paris, France')).toBeInTheDocument();
    });

    it('should handle missing location data gracefully', () => {
      const vendor = createMockVendor({
        locations: undefined,
        location: undefined,
      });

      render(<NearbyVendorCard vendor={vendor} />);

      expect(screen.getByText('Location, Unknown')).toBeInTheDocument();
    });

    it('should fallback to legacy location field when locations array is empty', () => {
      const vendor = createMockVendor({
        locations: [],
        location: {
          city: 'Cannes',
          country: 'France',
          latitude: 43.5528,
          longitude: 7.0174,
        } as any,
      });

      render(<NearbyVendorCard vendor={vendor} />);

      expect(screen.getByText('Cannes, France')).toBeInTheDocument();
    });

    it('should handle partial location data (missing city)', () => {
      const vendor = createMockVendor({
        locations: [
          {
            id: 'loc-1',
            name: 'Office',
            city: undefined as any,
            country: 'France',
            latitude: 43.7384,
            longitude: 7.4246,
            isHQ: true,
          },
        ],
      });

      render(<NearbyVendorCard vendor={vendor} />);

      expect(screen.getByText('Unknown, France')).toBeInTheDocument();
    });
  });

  describe('Tier Badge', () => {
    it('should render tier badge via TierBadge component', () => {
      const vendor = createMockVendor({ tier: 'premium' });
      render(<NearbyVendorCard vendor={vendor} />);

      const badge = screen.getByTestId('tier-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveAttribute('data-tier', 'premium');
      expect(badge).toHaveAttribute('data-size', 'sm');
    });

    it('should default to free tier when tier is not provided', () => {
      const vendor = createMockVendor({ tier: undefined });
      render(<NearbyVendorCard vendor={vendor} />);

      const badge = screen.getByTestId('tier-badge');
      expect(badge).toHaveAttribute('data-tier', 'free');
    });

    it('should render different tier levels correctly', () => {
      const tiers = ['free', 'basic', 'premium', 'elite'] as const;

      tiers.forEach((tier) => {
        const { unmount } = render(
          <NearbyVendorCard vendor={createMockVendor({ tier })} />
        );

        const badge = screen.getByTestId('tier-badge');
        expect(badge).toHaveAttribute('data-tier', tier);

        unmount();
      });
    });
  });

  describe('Distance Display', () => {
    it('should show distance when provided', () => {
      const vendor = createMockVendor();
      render(<NearbyVendorCard vendor={vendor} distance={12.5} />);

      expect(screen.getByText('12.5 km away')).toBeInTheDocument();
    });

    it('should use formatDistance utility to format distance', () => {
      const formatDistanceMock = require('@/lib/utils/location').formatDistance;
      const vendor = createMockVendor();

      render(<NearbyVendorCard vendor={vendor} distance={25.8} />);

      expect(formatDistanceMock).toHaveBeenCalledWith(25.8);
    });

    it('should hide distance section when distance not provided', () => {
      const vendor = createMockVendor();
      render(<NearbyVendorCard vendor={vendor} />);

      expect(screen.queryByText(/km away/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/away/i)).not.toBeInTheDocument();
    });

    it('should hide distance section when distance is undefined', () => {
      const vendor = createMockVendor();
      render(<NearbyVendorCard vendor={vendor} distance={undefined} />);

      expect(screen.queryByText(/km away/i)).not.toBeInTheDocument();
    });

    it('should show distance of 0 when explicitly set to 0', () => {
      const vendor = createMockVendor();
      render(<NearbyVendorCard vendor={vendor} distance={0} />);

      expect(screen.getByText('0.0 km away')).toBeInTheDocument();
    });

    it('should render Navigation icon when distance is shown', () => {
      const vendor = createMockVendor();
      const { container } = render(
        <NearbyVendorCard vendor={vendor} distance={15} />
      );

      // Navigation icon is rendered (lucide-react adds svg with specific class)
      const navigationIcon = container.querySelector('svg');
      expect(navigationIcon).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('should apply correct CSS classes for card styling', () => {
      const vendor = createMockVendor();
      const { container } = render(<NearbyVendorCard vendor={vendor} />);

      const card = screen.getByTestId('nearby-vendor-card');
      expect(card).toHaveClass('block', 'p-3', 'rounded-lg', 'border');
    });

    it('should have hover styles applied', () => {
      const vendor = createMockVendor();
      render(<NearbyVendorCard vendor={vendor} />);

      const card = screen.getByTestId('nearby-vendor-card');
      expect(card).toHaveClass('hover:bg-muted/50');
    });

    it('should truncate long vendor names', () => {
      const vendor = createMockVendor({
        name: 'This is a very long vendor name that should be truncated to prevent layout issues',
      });
      const { container } = render(<NearbyVendorCard vendor={vendor} />);

      const nameElement = container.querySelector('h4');
      expect(nameElement).toHaveClass('truncate');
    });

    it('should truncate long location names', () => {
      const vendor = createMockVendor({
        locations: [
          {
            id: 'loc-1',
            name: 'Office',
            city: 'Very Long City Name That Should Be Truncated',
            country: 'Very Long Country Name That Should Also Be Truncated',
            latitude: 43.7384,
            longitude: 7.4246,
            isHQ: true,
          },
        ],
      });
      const { container } = render(<NearbyVendorCard vendor={vendor} />);

      const locationElement = container.querySelector('p.text-xs');
      expect(locationElement).toHaveClass('truncate');
    });
  });

  describe('Edge Cases', () => {
    it('should handle vendor with empty string name', () => {
      const vendor = createMockVendor({ name: '' });
      render(<NearbyVendorCard vendor={vendor} />);

      // Component should still render without crashing
      expect(screen.getByTestId('nearby-vendor-card')).toBeInTheDocument();
    });

    it('should handle vendor with empty string slug', () => {
      const vendor = createMockVendor({ slug: '' });
      render(<NearbyVendorCard vendor={vendor} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/vendors/');
    });

    it('should handle very large distance values', () => {
      const vendor = createMockVendor();
      render(<NearbyVendorCard vendor={vendor} distance={9999.99} />);

      // Note: 9999.99.toFixed(1) rounds to 10000.0
      expect(screen.getByText('10000.0 km away')).toBeInTheDocument();
    });

    it('should handle very small distance values', () => {
      const vendor = createMockVendor();
      render(<NearbyVendorCard vendor={vendor} distance={0.01} />);

      expect(screen.getByText('0.0 km away')).toBeInTheDocument();
    });

    it('should handle locations with missing country', () => {
      const vendor = createMockVendor({
        locations: [
          {
            id: 'loc-1',
            name: 'Office',
            city: 'Monaco',
            country: undefined as any,
            latitude: 43.7384,
            longitude: 7.4246,
            isHQ: true,
          },
        ],
      });

      render(<NearbyVendorCard vendor={vendor} />);

      expect(screen.getByText('Monaco,')).toBeInTheDocument();
    });
  });
});
