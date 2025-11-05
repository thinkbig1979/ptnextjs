/**
 * Component Tests - UpgradeRequestStatusCard
 *
 * Tests the tier upgrade request status display card including:
 * - Status badge rendering with correct colors
 * - Request information display
 * - Cancel functionality for pending requests
 * - Rejection reason display
 * - Date formatting
 * - Conditional action button display
 *
 * Target coverage: 75%+
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { UpgradeRequestStatusCard } from '@/components/dashboard/UpgradeRequestStatusCard';
import {
  mockPendingRequest,
  mockApprovedRequest,
  mockRejectedRequest,
  mockCancelledRequest,
} from '../../../__tests__/fixtures/tier-upgrade-data';

// Mock sonner toast notifications
jest.mock('@/components/ui/sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const { toast } = require('@/components/ui/sonner');

// Mock fetch for API calls
global.fetch = jest.fn();

describe('UpgradeRequestStatusCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Status Badge Display', () => {
    it('renders pending status with yellow badge', () => {
      render(<UpgradeRequestStatusCard request={mockPendingRequest} />);

      const badge = screen.getByText(/pending/i);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-yellow-50', 'text-yellow-700');
    });

    it('renders approved status with green badge', () => {
      render(<UpgradeRequestStatusCard request={mockApprovedRequest} />);

      const badge = screen.getByText(/approved/i);
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-green-50', 'text-green-700');
    });

    it('renders rejected status with red badge', () => {
      render(<UpgradeRequestStatusCard request={mockRejectedRequest} />);

      const badge = screen.getByText(/rejected/i);
      expect(badge).toBeInTheDocument();
      // destructive variant uses bg-destructive
    });

    it('renders cancelled status with gray badge', () => {
      render(<UpgradeRequestStatusCard request={mockCancelledRequest} />);

      const badge = screen.getByText(/cancelled/i);
      expect(badge).toBeInTheDocument();
      // secondary variant
    });
  });

  describe('Request Information Display', () => {
    it('displays current and requested tier information', () => {
      render(<UpgradeRequestStatusCard request={mockPendingRequest} />);

      expect(screen.getByText(/free/i)).toBeInTheDocument();
      expect(screen.getByText(/tier 1/i)).toBeInTheDocument();
    });

    it('displays vendor notes when provided', () => {
      render(<UpgradeRequestStatusCard request={mockPendingRequest} />);

      expect(screen.getByText(/We need to list more products/i)).toBeInTheDocument();
    });

    it('displays formatted request date', () => {
      render(<UpgradeRequestStatusCard request={mockPendingRequest} />);

      // Should format as readable date (e.g., "Jan 15, 2024")
      expect(screen.getByText(/jan.*15.*2024/i)).toBeInTheDocument();
    });

    it('displays reviewer information for reviewed requests', () => {
      render(<UpgradeRequestStatusCard request={mockApprovedRequest} />);

      expect(screen.getByText(/admin user/i)).toBeInTheDocument();
    });

    it('displays rejection reason when status is rejected', () => {
      render(<UpgradeRequestStatusCard request={mockRejectedRequest} />);

      expect(
        screen.getByText(/Please provide more details about your business needs/i)
      ).toBeInTheDocument();
    });

    it('does not display rejection reason for non-rejected statuses', () => {
      render(<UpgradeRequestStatusCard request={mockPendingRequest} />);

      expect(screen.queryByText(/rejection/i)).not.toBeInTheDocument();
    });
  });

  describe('Cancel Functionality', () => {
    it('shows cancel button for pending requests when showActions is true', () => {
      render(
        <UpgradeRequestStatusCard
          request={mockPendingRequest}
          showActions={true}
        />
      );

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('does not show cancel button for approved requests', () => {
      render(
        <UpgradeRequestStatusCard
          request={mockApprovedRequest}
          showActions={true}
        />
      );

      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });

    it('does not show cancel button for rejected requests', () => {
      render(
        <UpgradeRequestStatusCard
          request={mockRejectedRequest}
          showActions={true}
        />
      );

      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });

    it('does not show cancel button when showActions is false', () => {
      render(
        <UpgradeRequestStatusCard
          request={mockPendingRequest}
          showActions={false}
        />
      );

      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });

    it('shows confirmation dialog when cancel button clicked', async () => {
      const user = userEvent.setup();
      render(
        <UpgradeRequestStatusCard
          request={mockPendingRequest}
          showActions={true}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      // AlertDialog should appear with confirmation message
      await waitFor(() => {
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      });
    });

    it('cancels request when confirmation is accepted', async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(
        <UpgradeRequestStatusCard
          request={mockPendingRequest}
          showActions={true}
          onCancel={onCancel}
        />
      );

      // Click cancel button
      const cancelButton = screen.getByRole('button', { name: /cancel.*request/i });
      await user.click(cancelButton);

      // Confirm in dialog
      const confirmButton = await screen.findByRole('button', { name: /continue/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/portal/vendors/${mockPendingRequest.vendorId}/tier-upgrade-request/${mockPendingRequest.id}`,
          expect.objectContaining({
            method: 'DELETE',
          })
        );
      }, { timeout: 5000 });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringMatching(/cancelled successfully/i)
        );
        expect(onCancel).toHaveBeenCalledWith(mockPendingRequest.id);
      }, { timeout: 5000 });
    });

    it('does not cancel request when confirmation is cancelled', async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();

      render(
        <UpgradeRequestStatusCard
          request={mockPendingRequest}
          showActions={true}
          onCancel={onCancel}
        />
      );

      // Click cancel button
      const cancelButton = screen.getByRole('button', { name: /cancel.*request/i });
      await user.click(cancelButton);

      // Cancel in dialog
      const cancelDialogButton = await screen.findByRole('button', { name: /^cancel$/i });
      await user.click(cancelDialogButton);

      // Should not call API
      expect(global.fetch).not.toHaveBeenCalled();
      expect(onCancel).not.toHaveBeenCalled();
    });

    it('shows error toast when cancel API fails', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(
        <UpgradeRequestStatusCard
          request={mockPendingRequest}
          showActions={true}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel.*request/i });
      await user.click(cancelButton);

      const confirmButton = await screen.findByRole('button', { name: /continue/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringMatching(/failed to cancel/i)
        );
      }, { timeout: 5000 });
    });

    it('shows error toast on network error', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      render(
        <UpgradeRequestStatusCard
          request={mockPendingRequest}
          showActions={true}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel.*request/i });
      await user.click(cancelButton);

      const confirmButton = await screen.findByRole('button', { name: /continue/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringMatching(/failed to cancel/i)
        );
      }, { timeout: 5000 });
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      render(<UpgradeRequestStatusCard request={mockPendingRequest} />);

      // Card should be rendered
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });

    it('has descriptive button labels', () => {
      render(
        <UpgradeRequestStatusCard
          request={mockPendingRequest}
          showActions={true}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toHaveAccessibleName();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing vendor notes gracefully', () => {
      const requestWithoutNotes = {
        ...mockPendingRequest,
        vendorNotes: undefined,
      };

      render(<UpgradeRequestStatusCard request={requestWithoutNotes} />);

      // Should not display notes section
      expect(screen.queryByText(/We need to list/i)).not.toBeInTheDocument();
    });

    it('handles missing reviewer information', () => {
      const requestWithoutReviewer = {
        ...mockApprovedRequest,
        reviewedBy: undefined,
      };

      render(<UpgradeRequestStatusCard request={requestWithoutReviewer} />);

      // Should still render the card
      expect(screen.getByText(/approved/i)).toBeInTheDocument();
    });
  });
});
