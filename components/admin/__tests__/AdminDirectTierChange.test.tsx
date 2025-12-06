/**
 * AdminDirectTierChange Component Tests
 *
 * Tests for the admin direct tier change component functionality.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AdminDirectTierChange from '../AdminDirectTierChange';
import { useToast } from '@/hooks/use-toast';

// Mock useToast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// Helper function to select a tier from the dropdown
async function selectTier(user: ReturnType<typeof userEvent.setup>, tierLabel: string) {
  const trigger = screen.getByRole('combobox');
  await user.click(trigger);
  // shadcn Select renders options in a portal - there will be multiple matches:
  // 1. Hidden <option> element (for form submission)
  // 2. Visible <span> in the portal
  // We need to get all matches and click the visible one (not aria-hidden)
  const options = await screen.findAllByText(
    tierLabel,
    {},
    { timeout: 5000 }
  );
  // Find the visible option (not inside aria-hidden select element)
  const visibleOption = options.find(
    (el) => !el.closest('select[aria-hidden="true"]')
  );
  if (!visibleOption) {
    throw new Error(`Could not find visible option for "${tierLabel}"`);
  }
  await user.click(visibleOption);
}

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
    const user = userEvent.setup();
    render(<AdminDirectTierChange {...defaultProps} />);

    // Select a different tier using helper function (tier2 = Business)
    await selectTier(user, 'Business - Business profile with up to 10 locations and analytics');

    const changeButton = screen.getByRole('button', { name: /change tier/i });
    expect(changeButton).toBeEnabled();
  });

  it('shows confirmation dialog when change tier button is clicked', async () => {
    const user = userEvent.setup();
    render(<AdminDirectTierChange {...defaultProps} />);

    // Select a different tier (tier2 = Business)
    await selectTier(user, 'Business - Business profile with up to 10 locations and analytics');

    // Click change tier button
    const changeButton = screen.getByRole('button', { name: /change tier/i });
    await user.click(changeButton);

    // Confirmation dialog should appear
    await waitFor(() => {
      expect(screen.getByText('Confirm Tier Change')).toBeInTheDocument();
      expect(screen.getByText(/Test Vendor Inc\./)).toBeInTheDocument();
    });
  });

  it('shows downgrade warning when downgrading tier', async () => {
    const user = userEvent.setup();
    render(<AdminDirectTierChange {...defaultProps} currentTier="tier3" />);

    // Select a lower tier (tier1 = Professional)
    await selectTier(user, 'Professional - Enhanced profile with up to 3 locations');

    // Click change tier button
    const changeButton = screen.getByRole('button', { name: /change tier/i });
    await user.click(changeButton);

    // Downgrade warning should appear
    await waitFor(() => {
      expect(screen.getByText('Downgrade Warning')).toBeInTheDocument();
      expect(
        screen.getByText(/will lose access to features available in higher tiers/i)
      ).toBeInTheDocument();
    });
  });

  it('shows upgrade confirmation when upgrading tier', async () => {
    const user = userEvent.setup();
    render(<AdminDirectTierChange {...defaultProps} currentTier="tier1" />);

    // Select a higher tier (tier2 = Business)
    await selectTier(user, 'Business - Business profile with up to 10 locations and analytics');

    // Click change tier button
    const changeButton = screen.getByRole('button', { name: /change tier/i });
    await user.click(changeButton);

    // Upgrade confirmation should appear
    await waitFor(() => {
      expect(screen.getByText('Upgrade Confirmation')).toBeInTheDocument();
      expect(
        screen.getByText(/will gain access to additional features/i)
      ).toBeInTheDocument();
    });
  });

  it('successfully updates tier via API', async () => {
    const user = userEvent.setup();
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
    await selectTier(user, 'Business - Business profile with up to 10 locations and analytics');

    // Open confirmation dialog
    const changeButton = screen.getByRole('button', { name: /change tier/i });
    await user.click(changeButton);

    // Confirm change
    const confirmButton = await screen.findByRole('button', { name: /confirm change/i });
    await user.click(confirmButton);

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
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Vendor not found',
      }),
    });

    render(<AdminDirectTierChange {...defaultProps} />);

    // Select tier2
    await selectTier(user, 'Business - Business profile with up to 10 locations and analytics');

    // Open confirmation dialog and confirm
    const changeButton = screen.getByRole('button', { name: /change tier/i });
    await user.click(changeButton);

    const confirmButton = await screen.findByRole('button', { name: /confirm change/i });
    await user.click(confirmButton);

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
    const user = userEvent.setup();
    render(<AdminDirectTierChange {...defaultProps} />);

    // Select tier2
    await selectTier(user, 'Business - Business profile with up to 10 locations and analytics');

    // Open confirmation dialog
    const changeButton = screen.getByRole('button', { name: /change tier/i });
    await user.click(changeButton);

    // Cancel
    const cancelButton = await screen.findByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByText('Confirm Tier Change')).not.toBeInTheDocument();
    });

    // No API call should be made
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
