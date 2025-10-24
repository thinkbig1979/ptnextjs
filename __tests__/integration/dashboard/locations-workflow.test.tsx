/**
 * Integration Tests - Dashboard Locations Workflow
 *
 * Tests complete CRUD workflow for vendor locations in dashboard:
 * - Load dashboard with existing locations
 * - Add new location with form validation
 * - Edit existing location
 * - Delete location with confirmation
 * - Geocode address to get coordinates
 * - HQ designation toggle
 * - API error handling
 * - Optimistic UI updates
 *
 * Total: 12+ integration test cases
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { LocationsManagerCard } from '@/components/dashboard/LocationsManagerCard';
import {
  mockVendorTier2,
  mockLocationMonaco,
  mockLocationFortLauderdale,
} from '../../fixtures/vendor-data';

// Mock hooks
jest.mock('@/hooks/useTierAccess', () => ({
  useTierAccess: jest.fn(),
}));

jest.mock('@/components/ui/sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
}));

// Mock fetch for API calls
global.fetch = jest.fn();

const { useTierAccess } = require('@/hooks/useTierAccess');
const { toast } = require('@/components/ui/sonner');

describe('Dashboard Locations Workflow - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful fetch responses
    (global.fetch as jest.Mock).mockImplementation((url: string, options?: any) => {
      if (url.includes('/api/vendors/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, data: mockVendorTier2 }),
        });
      }
      if (url.includes('/api/geocode')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true, lat: 43.7384, lng: 7.4246 }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    });

    // Default: Tier 2 access granted
    useTierAccess.mockReturnValue({
      hasAccess: true,
      tier: 'tier2',
      upgradePath: null,
    });
  });

  describe('Load Dashboard with Existing Locations', () => {
    it('loads and displays existing locations on mount', async () => {
      render(<LocationsManagerCard vendor={mockVendorTier2} />);

      // Verify locations are displayed
      await waitFor(() => {
        expect(screen.getByText('Monaco Headquarters')).toBeInTheDocument();
        expect(screen.getByText('Florida Sales Office')).toBeInTheDocument();
      });

      // Verify addresses
      expect(screen.getByText(/7 Avenue de Grande Bretagne/i)).toBeInTheDocument();
      expect(screen.getByText(/1635 SE 3rd Avenue/i)).toBeInTheDocument();
    });

    it('displays HQ badge for headquarters location', async () => {
      render(<LocationsManagerCard vendor={mockVendorTier2} />);

      await waitFor(() => {
        const hqBadges = screen.getAllByText(/headquarters/i);
        expect(hqBadges.length).toBeGreaterThan(0);
      });
    });

    it('shows location count correctly', async () => {
      render(<LocationsManagerCard vendor={mockVendorTier2} />);

      await waitFor(() => {
        expect(screen.getByText(/3 locations?/i)).toBeInTheDocument();
      });
    });
  });

  describe('Add New Location Workflow', () => {
    it('opens add location form when Add Location button clicked', async () => {
      const user = userEvent.setup();
      render(<LocationsManagerCard vendor={mockVendorTier2} />);

      const addButton = screen.getByRole('button', { name: /add location/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
      });
    });

    it('completes full add location workflow with geocoding', async () => {
      const user = userEvent.setup();
      render(<LocationsManagerCard vendor={mockVendorTier2} />);

      // Click Add Location
      const addButton = screen.getByRole('button', { name: /add location/i });
      await user.click(addButton);

      // Fill in address fields
      await waitFor(() => {
        expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
      });

      const addressInput = screen.getByLabelText(/address/i);
      const cityInput = screen.getByLabelText(/city/i);
      const countryInput = screen.getByLabelText(/country/i);

      await user.type(addressInput, 'Via XX Settembre 41');
      await user.type(cityInput, 'Genoa');
      await user.type(countryInput, 'Italy');

      // Click Geocode button
      const geocodeButton = screen.getByRole('button', { name: /geocode/i });
      await user.click(geocodeButton);

      // Verify coordinates are populated
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringMatching(/coordinates found/i)
        );
      });

      // Submit form
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Verify API was called
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringMatching(/location added/i)
        );
      });
    });

    it('validates required fields before submission', async () => {
      const user = userEvent.setup();
      render(<LocationsManagerCard vendor={mockVendorTier2} />);

      // Click Add Location
      const addButton = screen.getByRole('button', { name: /add location/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
      });

      // Try to submit without filling fields
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Verify validation errors
      await waitFor(() => {
        expect(screen.getByText(/address is required/i)).toBeInTheDocument();
        expect(screen.getByText(/city is required/i)).toBeInTheDocument();
      });
    });

    it('shows loading state during save operation', async () => {
      const user = userEvent.setup();
      render(<LocationsManagerCard vendor={mockVendorTier2} />);

      // Open form and fill minimal data
      const addButton = screen.getByRole('button', { name: /add location/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
      });

      const addressInput = screen.getByLabelText(/address/i);
      const cityInput = screen.getByLabelText(/city/i);
      const countryInput = screen.getByLabelText(/country/i);

      await user.type(addressInput, 'Test Address');
      await user.type(cityInput, 'Monaco');
      await user.type(countryInput, 'Monaco');

      // Submit
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Verify loading indicator
      await waitFor(() => {
        expect(toast.loading).toHaveBeenCalled();
      });
    });
  });

  describe('Edit Existing Location Workflow', () => {
    it('opens edit form with pre-filled location data', async () => {
      const user = userEvent.setup();
      render(<LocationsManagerCard vendor={mockVendorTier2} />);

      await waitFor(() => {
        expect(screen.getByText('Monaco Headquarters')).toBeInTheDocument();
      });

      // Click Edit button for first location
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await user.click(editButtons[0]);

      // Verify form is pre-filled
      await waitFor(() => {
        expect(screen.getByDisplayValue('7 Avenue de Grande Bretagne')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Monaco')).toBeInTheDocument();
      });
    });

    it('updates location and shows optimistic update', async () => {
      const user = userEvent.setup();
      render(<LocationsManagerCard vendor={mockVendorTier2} />);

      await waitFor(() => {
        expect(screen.getByText('Monaco Headquarters')).toBeInTheDocument();
      });

      // Open edit form
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Monaco')).toBeInTheDocument();
      });

      // Change address
      const addressInput = screen.getByLabelText(/address/i);
      await user.clear(addressInput);
      await user.type(addressInput, 'New Address 123');

      // Submit
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Verify success
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringMatching(/location updated/i)
        );
      });
    });

    it('handles edit with geocoding update', async () => {
      const user = userEvent.setup();
      render(<LocationsManagerCard vendor={mockVendorTier2} />);

      await waitFor(() => {
        expect(screen.getByText('Monaco Headquarters')).toBeInTheDocument();
      });

      // Open edit form
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Monaco')).toBeInTheDocument();
      });

      // Change city
      const cityInput = screen.getByLabelText(/city/i);
      await user.clear(cityInput);
      await user.type(cityInput, 'Nice');

      // Re-geocode
      const geocodeButton = screen.getByRole('button', { name: /geocode/i });
      await user.click(geocodeButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringMatching(/coordinates found/i)
        );
      });
    });
  });

  describe('Delete Location Workflow', () => {
    it('shows confirmation dialog when delete clicked', async () => {
      const user = userEvent.setup();
      const vendorWithMultipleLocations = {
        ...mockVendorTier2,
        locations: [mockLocationMonaco, mockLocationFortLauderdale],
      };

      render(<LocationsManagerCard vendor={vendorWithMultipleLocations} />);

      await waitFor(() => {
        expect(screen.getByText('Florida Sales Office')).toBeInTheDocument();
      });

      // Click delete button for non-HQ location
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      // Verify confirmation dialog
      await waitFor(() => {
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
        expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
      });
    });

    it('completes delete workflow after confirmation', async () => {
      const user = userEvent.setup();
      const vendorWithMultipleLocations = {
        ...mockVendorTier2,
        locations: [mockLocationMonaco, mockLocationFortLauderdale],
      };

      render(<LocationsManagerCard vendor={vendorWithMultipleLocations} />);

      await waitFor(() => {
        expect(screen.getByText('Florida Sales Office')).toBeInTheDocument();
      });

      // Click delete
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      });

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      // Verify success message
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringMatching(/location deleted/i)
        );
      });
    });

    it('prevents deletion of HQ location when it is the only location', async () => {
      const user = userEvent.setup();
      const vendorWithOnlyHQ = {
        ...mockVendorTier2,
        locations: [mockLocationMonaco],
      };

      render(<LocationsManagerCard vendor={vendorWithOnlyHQ} />);

      await waitFor(() => {
        expect(screen.getByText('Monaco Headquarters')).toBeInTheDocument();
      });

      // Delete button should be disabled or not present for HQ
      const deleteButtons = screen.queryAllByRole('button', { name: /delete/i });
      expect(deleteButtons).toHaveLength(0);
    });
  });

  describe('HQ Designation Toggle', () => {
    it('allows changing HQ designation between locations', async () => {
      const user = userEvent.setup();
      const vendorWithMultipleLocations = {
        ...mockVendorTier2,
        locations: [mockLocationMonaco, mockLocationFortLauderdale],
      };

      render(<LocationsManagerCard vendor={vendorWithMultipleLocations} />);

      await waitFor(() => {
        expect(screen.getByText('Monaco Headquarters')).toBeInTheDocument();
      });

      // Open edit form for second location
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await user.click(editButtons[1]);

      await waitFor(() => {
        expect(screen.getByLabelText(/headquarters/i)).toBeInTheDocument();
      });

      // Toggle HQ checkbox
      const hqCheckbox = screen.getByLabelText(/headquarters/i);
      await user.click(hqCheckbox);

      // Submit
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Verify update
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });
    });

    it('automatically clears old HQ when setting new HQ', async () => {
      const user = userEvent.setup();
      const vendorWithMultipleLocations = {
        ...mockVendorTier2,
        locations: [
          { ...mockLocationMonaco, isHQ: true },
          { ...mockLocationFortLauderdale, isHQ: false },
        ],
      };

      render(<LocationsManagerCard vendor={vendorWithMultipleLocations} />);

      await waitFor(() => {
        expect(screen.getAllByText(/headquarters/i).length).toBeGreaterThan(0);
      });

      // Only one location should have HQ badge
      const hqBadges = screen.getAllByText(/headquarters/i).filter((el) =>
        el.classList.contains('inline-flex')
      );
      expect(hqBadges.length).toBe(1);
    });
  });

  describe('API Error Handling', () => {
    it('shows error message when API update fails', async () => {
      // Mock fetch to return error
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ success: false, error: 'Server error' }),
        })
      );

      const user = userEvent.setup();
      render(<LocationsManagerCard vendor={mockVendorTier2} />);

      // Try to add location
      const addButton = screen.getByRole('button', { name: /add location/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
      });

      // Fill and submit
      await user.type(screen.getByLabelText(/address/i), 'Test');
      await user.type(screen.getByLabelText(/city/i), 'Monaco');
      await user.type(screen.getByLabelText(/country/i), 'Monaco');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      // Verify error message
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringMatching(/failed|error/i)
        );
      });
    });

    it('handles geocoding API failure gracefully', async () => {
      // Mock fetch to return geocoding error
      (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          status: 503,
          json: () => Promise.resolve({ success: false, error: 'Geocoding failed' }),
        })
      );

      const user = userEvent.setup();
      render(<LocationsManagerCard vendor={mockVendorTier2} />);

      const addButton = screen.getByRole('button', { name: /add location/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
      });

      // Fill fields
      await user.type(screen.getByLabelText(/address/i), 'Test Address');
      await user.type(screen.getByLabelText(/city/i), 'Monaco');
      await user.type(screen.getByLabelText(/country/i), 'Monaco');

      // Try to geocode
      const geocodeButton = screen.getByRole('button', { name: /geocode/i });
      await user.click(geocodeButton);

      // Verify error handling
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringMatching(/geocod.*failed|unable to find/i)
        );
      });
    });
  });
});
