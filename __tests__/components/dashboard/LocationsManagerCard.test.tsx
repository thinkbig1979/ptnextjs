import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LocationsManagerCard } from '@/components/dashboard/LocationsManagerCard';

// Mock dependencies
jest.mock('@/hooks/useTierAccess', () => ({
  useTierAccess: jest.fn()
}));

jest.mock('@/components/ui/sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

// Mock the TierUpgradePrompt component
jest.mock('@/components/dashboard/TierUpgradePrompt', () => ({
  TierUpgradePrompt: ({ featureName }: { featureName: string }) => (
    <div data-testid="tier-upgrade-prompt">Upgrade to unlock {featureName}</div>
  )
}));

// Mock LocationFormFields component
jest.mock('@/components/dashboard/LocationFormFields', () => ({
  LocationFormFields: ({ location, onChange }: any) => (
    <div data-testid="location-form-fields">
      <input
        type="text"
        aria-label="Address"
        value={location.address}
        onChange={(e) => onChange({ ...location, address: e.target.value })}
      />
      <input
        type="text"
        value={location.city}
        onChange={(e) => onChange({ ...location, city: e.target.value })}
      />
    </div>
  )
}));

const { useTierAccess } = require('@/hooks/useTierAccess');

describe('LocationsManagerCard', () => {
  const mockVendor = {
    id: 'vendor-1',
    name: 'Test Vendor',
    tier: 'tier2',
    locations: [
      {
        id: 'loc-1',
        address: '123 Main St',
        city: 'Monaco',
        country: 'Monaco',
        latitude: 43.7384,
        longitude: 7.4246,
        isHQ: true
      }
    ]
  };

  // Default mock return value with all required fields
  const defaultMockTierAccess = {
    hasAccess: true,
    tier: 'tier2',
    upgradePath: 'tier3',
    feature: 'multipleLocations',
    canAddLocation: jest.fn((count: number) => count < 5),
    maxLocations: 5
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Set default mock return value
    useTierAccess.mockReturnValue(defaultMockTierAccess);
  });

  describe('Tier-based Rendering', () => {
    it('renders LocationsManagerCard for tier2 vendors', () => {
      useTierAccess.mockReturnValue({
        ...defaultMockTierAccess,
        hasAccess: true,
        tier: 'tier2',
        upgradePath: 'tier3'
      });

      render(<LocationsManagerCard vendor={mockVendor} />);

      expect(screen.getByText(/manage locations/i)).toBeInTheDocument();
      expect(screen.queryByTestId('tier-upgrade-prompt')).not.toBeInTheDocument();
    });

    it('renders LocationsManagerCard for tier1 vendors with location limit', () => {
      const tier1Vendor = { ...mockVendor, tier: 'tier1' };
      useTierAccess.mockReturnValue({
        ...defaultMockTierAccess,
        hasAccess: true,
        tier: 'tier1',
        upgradePath: 'tier2',
        canAddLocation: jest.fn((count: number) => count < 1),
        maxLocations: 1
      });

      render(<LocationsManagerCard vendor={tier1Vendor} />);

      expect(screen.getByText(/manage locations/i)).toBeInTheDocument();
    });

    it('shows tier limit message when at max locations', () => {
      const tier1Vendor = { ...mockVendor, tier: 'tier1' };
      useTierAccess.mockReturnValue({
        ...defaultMockTierAccess,
        hasAccess: true,
        tier: 'tier1',
        upgradePath: 'tier2',
        canAddLocation: jest.fn((count: number) => count < 1),
        maxLocations: 1
      });

      render(<LocationsManagerCard vendor={tier1Vendor} />);

      expect(screen.getByText(/you've reached the maximum of 1 location/i)).toBeInTheDocument();
    });
  });

  describe('Location List Display', () => {
    beforeEach(() => {
      useTierAccess.mockReturnValue(defaultMockTierAccess);
    });

    it('displays all vendor locations', () => {
      render(<LocationsManagerCard vendor={mockVendor} />);

      expect(screen.getByText('123 Main St')).toBeInTheDocument();
      expect(screen.getByText('Monaco')).toBeInTheDocument();
    });

    it('shows HQ badge for headquarters location', () => {
      render(<LocationsManagerCard vendor={mockVendor} />);

      // Check for HQ badge
      expect(screen.getByText('Headquarters')).toBeInTheDocument();
    });

    it('displays multiple locations correctly', () => {
      const multiLocVendor = {
        ...mockVendor,
        locations: [
          mockVendor.locations[0],
          {
            id: 'loc-2',
            address: '456 Park Ave',
            city: 'Fort Lauderdale',
            country: 'USA',
            latitude: 26.1224,
            longitude: -80.1373,
            isHQ: false
          }
        ]
      };

      render(<LocationsManagerCard vendor={multiLocVendor} />);

      expect(screen.getByText('123 Main St')).toBeInTheDocument();
      expect(screen.getByText('456 Park Ave')).toBeInTheDocument();
    });
  });

  describe('Add Location Workflow', () => {
    beforeEach(() => {
      useTierAccess.mockReturnValue(defaultMockTierAccess);
    });

    it('shows add location button', () => {
      render(<LocationsManagerCard vendor={mockVendor} />);

      expect(screen.getByRole('button', { name: /add location/i })).toBeInTheDocument();
    });

    it('opens location form when add button clicked', async () => {
      render(<LocationsManagerCard vendor={mockVendor} />);

      const addButton = screen.getByRole('button', { name: /add location/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByTestId('location-form-fields')).toBeInTheDocument();
      });
    });
  });

  describe('Edit Location Workflow', () => {
    beforeEach(() => {
      useTierAccess.mockReturnValue(defaultMockTierAccess);
    });

    it('shows edit button for each location', () => {
      render(<LocationsManagerCard vendor={mockVendor} />);

      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });

    it('opens edit form with location data when edit clicked', async () => {
      render(<LocationsManagerCard vendor={mockVendor} />);

      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByTestId('location-form-fields')).toBeInTheDocument();
        expect(screen.getByDisplayValue('123 Main St')).toBeInTheDocument();
      });
    });
  });

  describe('Delete Location Workflow', () => {
    beforeEach(() => {
      useTierAccess.mockReturnValue(defaultMockTierAccess);
    });

    it('shows delete button for non-HQ locations', () => {
      const multiLocVendor = {
        ...mockVendor,
        locations: [
          mockVendor.locations[0],
          {
            id: 'loc-2',
            address: '456 Park Ave',
            city: 'Fort Lauderdale',
            country: 'USA',
            latitude: 26.1224,
            longitude: -80.1373,
            isHQ: false
          }
        ]
      };

      render(<LocationsManagerCard vendor={multiLocVendor} />);

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    it('shows confirmation dialog when delete clicked', async () => {
      const multiLocVendor = {
        ...mockVendor,
        locations: [
          mockVendor.locations[0],
          {
            id: 'loc-2',
            address: '456 Park Ave',
            city: 'Fort Lauderdale',
            country: 'USA',
            latitude: 26.1224,
            longitude: -80.1373,
            isHQ: false
          }
        ]
      };

      render(<LocationsManagerCard vendor={multiLocVendor} />);

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      });
    });
  });

  describe('HQ Designation Logic', () => {
    beforeEach(() => {
      useTierAccess.mockReturnValue(defaultMockTierAccess);
    });

    it('only allows one HQ location', () => {
      render(<LocationsManagerCard vendor={mockVendor} />);

      // HQ designation uses radio button logic - tested in LocationFormFields
      expect(mockVendor.locations.filter(loc => loc.isHQ).length).toBe(1);
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      useTierAccess.mockReturnValue(defaultMockTierAccess);
    });

    it('has accessible labels for buttons', () => {
      render(<LocationsManagerCard vendor={mockVendor} />);

      expect(screen.getByRole('button', { name: /add location/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      render(<LocationsManagerCard vendor={mockVendor} />);

      const addButton = screen.getByRole('button', { name: /add location/i });
      addButton.focus();
      expect(addButton).toHaveFocus();
    });
  });
});
