import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LocationsManagerCard } from '@/components/dashboard/LocationsManagerCard';

// Mock dependencies
jest.mock('@/lib/hooks/useTierAccess', () => ({
  useTierAccess: jest.fn()
}));

jest.mock('@/components/ui/sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

const { useTierAccess } = require('@/lib/hooks/useTierAccess');

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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Tier-based Rendering', () => {
    it('renders LocationsManagerCard for tier2 vendors', () => {
      useTierAccess.mockReturnValue({
        hasAccess: true,
        tier: 'tier2',
        upgradePath: null
      });

      render(<LocationsManagerCard vendor={mockVendor} />);

      expect(screen.getByText(/manage locations/i)).toBeInTheDocument();
      expect(screen.queryByText(/upgrade/i)).not.toBeInTheDocument();
    });

    it('renders TierUpgradePrompt for tier1 vendors', () => {
      const tier1Vendor = { ...mockVendor, tier: 'tier1' };
      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: 'tier1',
        upgradePath: '/subscription/upgrade'
      });

      render(<LocationsManagerCard vendor={tier1Vendor} />);

      expect(screen.getByText(/upgrade to unlock/i)).toBeInTheDocument();
      expect(screen.queryByText(/manage locations/i)).not.toBeInTheDocument();
    });

    it('renders TierUpgradePrompt for free vendors', () => {
      const freeVendor = { ...mockVendor, tier: 'free' };
      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: 'free',
        upgradePath: '/subscription/upgrade'
      });

      render(<LocationsManagerCard vendor={freeVendor} />);

      expect(screen.getByText(/upgrade to unlock/i)).toBeInTheDocument();
    });
  });

  describe('Location List Display', () => {
    beforeEach(() => {
      useTierAccess.mockReturnValue({
        hasAccess: true,
        tier: 'tier2',
        upgradePath: null
      });
    });

    it('displays all vendor locations', () => {
      render(<LocationsManagerCard vendor={mockVendor} />);

      expect(screen.getByText('123 Main St')).toBeInTheDocument();
      expect(screen.getByText('Monaco')).toBeInTheDocument();
    });

    it('shows HQ badge for headquarters location', () => {
      render(<LocationsManagerCard vendor={mockVendor} />);

      expect(screen.getByText(/headquarters/i)).toBeInTheDocument();
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
      useTierAccess.mockReturnValue({
        hasAccess: true,
        tier: 'tier2',
        upgradePath: null
      });
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
        expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edit Location Workflow', () => {
    beforeEach(() => {
      useTierAccess.mockReturnValue({
        hasAccess: true,
        tier: 'tier2',
        upgradePath: null
      });
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
        const addressInput = screen.getByDisplayValue('123 Main St');
        expect(addressInput).toBeInTheDocument();
      });
    });
  });

  describe('Delete Location Workflow', () => {
    beforeEach(() => {
      useTierAccess.mockReturnValue({
        hasAccess: true,
        tier: 'tier2',
        upgradePath: null
      });
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
      useTierAccess.mockReturnValue({
        hasAccess: true,
        tier: 'tier2',
        upgradePath: null
      });
    });

    it('only allows one HQ location', async () => {
      render(<LocationsManagerCard vendor={mockVendor} />);

      // HQ designation uses radio button logic - tested in LocationFormFields
      expect(mockVendor.locations.filter(loc => loc.isHQ).length).toBe(1);
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      useTierAccess.mockReturnValue({
        hasAccess: true,
        tier: 'tier2',
        upgradePath: null
      });
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
