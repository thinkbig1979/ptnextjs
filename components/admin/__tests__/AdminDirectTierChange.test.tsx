/**
 * AdminDirectTierChange Component Tests
 *
 * Tests for the admin direct tier change component functionality.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminDirectTierChange from '../AdminDirectTierChange';
import { useToast } from '@/hooks/use-toast';

// Mock useToast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('AdminDirectTierChange', () => {
  const mockToast = jest.fn();
  const mockOnSuccess = jest.fn();

  const defaultProps = {
    vendorId: 'vendor-123',
    currentTier: 'tier1' as const,
    vendorName: 'Test Vendor Inc.',
    onSuccess: mockOnSuccess,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders current tier information', () => {
    render(<AdminDirectTierChange {...defaultProps} />);

    expect(screen.getByText('Admin Tier Control')).toBeInTheDocument();
    expect(screen.getByText('Current Tier')).toBeInTheDocument();
    expect(screen.getByText('Professional')).toBeInTheDocument();
  });

  it('disables change button when no tier is selected or tier unchanged', () => {
    render(<AdminDirectTierChange {...defaultProps} />);

    const changeButton = screen.getByRole('button', { name: /change tier/i });
    expect(changeButton).toBeDisabled();
  });

  it('enables change button when different tier is selected', async () => {
    render(<AdminDirectTierChange {...defaultProps} />);

    // Open select dropdown
    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);

    // Select a different tier
    await waitFor(() => {
      const tier2Option = screen.getByText(/Business - Business profile/i);
      fireEvent.click(tier2Option);
    });

    const changeButton = screen.getByRole('button', { name: /change tier/i });
    expect(changeButton).toBeEnabled();
  });

  it('shows confirmation dialog when change tier button is clicked', async () => {
    render(<AdminDirectTierChange {...defaultProps} />);

    // Select a different tier
    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);

    await waitFor(() => {
      const tier2Option = screen.getByText(/Business - Business profile/i);
      fireEvent.click(tier2Option);
    });

    // Click change tier button
    const changeButton = screen.getByRole('button', { name: /change tier/i });
    fireEvent.click(changeButton);

    // Confirmation dialog should appear
    await waitFor(() => {
      expect(screen.getByText('Confirm Tier Change')).toBeInTheDocument();
      expect(screen.getByText(/Test Vendor Inc\./)).toBeInTheDocument();
    });
  });

  it('shows downgrade warning when downgrading tier', async () => {
    render(<AdminDirectTierChange {...defaultProps} currentTier="tier3" />);

    // Select a lower tier
    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);

    await waitFor(() => {
      const tier1Option = screen.getByText(/Professional - Enhanced profile/i);
      fireEvent.click(tier1Option);
    });

    // Click change tier button
    const changeButton = screen.getByRole('button', { name: /change tier/i });
    fireEvent.click(changeButton);

    // Downgrade warning should appear
    await waitFor(() => {
      expect(screen.getByText('Downgrade Warning')).toBeInTheDocument();
      expect(
        screen.getByText(/will lose access to features available in higher tiers/i)
      ).toBeInTheDocument();
    });
  });

  it('shows upgrade confirmation when upgrading tier', async () => {
    render(<AdminDirectTierChange {...defaultProps} currentTier="tier1" />);

    // Select a higher tier
    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);

    await waitFor(() => {
      const tier2Option = screen.getByText(/Business - Business profile/i);
      fireEvent.click(tier2Option);
    });

    // Click change tier button
    const changeButton = screen.getByRole('button', { name: /change tier/i });
    fireEvent.click(changeButton);

    // Upgrade confirmation should appear
    await waitFor(() => {
      expect(screen.getByText('Upgrade Confirmation')).toBeInTheDocument();
      expect(
        screen.getByText(/will gain access to additional features/i)
      ).toBeInTheDocument();
    });
  });

  it('successfully updates tier via API', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Vendor tier updated successfully',
        vendor: {
          id: 'vendor-123',
          companyName: 'Test Vendor Inc.',
          tier: 'tier2',
        },
      }),
    });

    render(<AdminDirectTierChange {...defaultProps} />);

    // Select tier2
    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);

    await waitFor(() => {
      const tier2Option = screen.getByText(/Business - Business profile/i);
      fireEvent.click(tier2Option);
    });

    // Open confirmation dialog
    const changeButton = screen.getByRole('button', { name: /change tier/i });
    fireEvent.click(changeButton);

    // Confirm change
    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /confirm change/i });
      fireEvent.click(confirmButton);
    });

    // Wait for API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/admin/vendors/vendor-123/tier',
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ tier: 'tier2' }),
        })
      );
    });

    // Success toast should be shown
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Tier updated',
      })
    );

    // onSuccess callback should be called
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('handles API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Vendor not found',
      }),
    });

    render(<AdminDirectTierChange {...defaultProps} />);

    // Select tier2
    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);

    await waitFor(() => {
      const tier2Option = screen.getByText(/Business - Business profile/i);
      fireEvent.click(tier2Option);
    });

    // Open confirmation dialog and confirm
    const changeButton = screen.getByRole('button', { name: /change tier/i });
    fireEvent.click(changeButton);

    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /confirm change/i });
      fireEvent.click(confirmButton);
    });

    // Error toast should be shown
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          variant: 'destructive',
        })
      );
    });

    // onSuccess should NOT be called
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('allows canceling confirmation dialog', async () => {
    render(<AdminDirectTierChange {...defaultProps} />);

    // Select tier2
    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);

    await waitFor(() => {
      const tier2Option = screen.getByText(/Business - Business profile/i);
      fireEvent.click(tier2Option);
    });

    // Open confirmation dialog
    const changeButton = screen.getByRole('button', { name: /change tier/i });
    fireEvent.click(changeButton);

    // Cancel
    await waitFor(() => {
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);
    });

    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByText('Confirm Tier Change')).not.toBeInTheDocument();
    });

    // No API call should be made
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
