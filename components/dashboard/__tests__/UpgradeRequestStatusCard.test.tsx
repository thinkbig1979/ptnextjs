/**
 * Component Tests - UpgradeRequestStatusCard
 *
 * Tests the upgrade request status display card including:
 * - Status badge rendering with correct colors
 * - Request details display
 * - Rejection reason display
 * - Cancel functionality for pending requests
 * - Date formatting
 * - Accessibility
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

// Mock fetch for API calls
global.fetch = jest.fn();

const { toast } = require('@/components/ui/sonner');

describe('UpgradeRequestStatusCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Card Rendering', () => {
    it('renders card with request details', () => {
      render(<UpgradeRequestStatusCard request={mockPendingRequest} />);

      expect(screen.getByText(/upgrade request status/i)).toBeInTheDocument();
      expect(screen.getByText(/tier1/i)).toBeInTheDocument();
      expect(screen.getByText(/free/i)).toBeInTheDocument();
    });

    it('displays status badge', () => {
      render(<UpgradeRequestStatusCard request={mockPendingRequest} />);

      const badge = screen.getByText(/pending/i);
      expect(badge).toBeInTheDocument();
    });

    it('shows requested tier and current tier', () => {
      render(<UpgradeRequestStatusCard request={mockPendingRequest} />);

      expect(screen.getByText(/tier1/i)).toBeInTheDocument();
      expect(screen.getByText(/free/i)).toBeInTheDocument();
    });

    it('displays request date', () => {
      render(<UpgradeRequestStatusCard request={mockPendingRequest} />);

      // Date should be formatted (implementation will use date-fns)
      expect(screen.getByText(/requested.*2024/i)).toBeInTheDocument();
    });

    it('shows vendor notes when provided', () => {
      render(<UpgradeRequestStatusCard request={mockPendingRequest} />);

      expect(screen.getByText(/we need to list more products/i)).toBeInTheDocument();
    });

    it('does not show vendor notes section when notes are empty', () => {
      const requestWithoutNotes = {
        ...mockPendingRequest,
        vendorNotes: undefined,
      };

      render(<UpgradeRequestStatusCard request={requestWithoutNotes} />);

      expect(screen.queryByText(/vendor notes/i)).not.toBeInTheDocument();
    });
  });

  describe('Status Badge Styling', () => {
    it('renders pending status badge with warning variant (yellow)', () => {
      render(<UpgradeRequestStatusCard request={mockPendingRequest} />);

      const badge = screen.getByText(/pending/i);
      expect(badge).toHaveClass(/warning|yellow/i); // Implementation will determine exact class
    });

    it('renders approved status badge with success variant (green)', () => {
      render(<UpgradeRequestStatusCard request={mockApprovedRequest} />);

      const badge = screen.getByText(/approved/i);
      expect(badge).toHaveClass(/success|green/i);
    });

    it('renders rejected status badge with destructive variant (red)', () => {
      render(<UpgradeRequestStatusCard request={mockRejectedRequest} />);

      const badge = screen.getByText(/rejected/i);
      expect(badge).toHaveClass(/destructive|red/i);
    });

    it('renders cancelled status badge with secondary variant (gray)', () => {
      render(<UpgradeRequestStatusCard request={mockCancelledRequest} />);

      const badge = screen.getByText(/cancelled/i);
      expect(badge).toHaveClass(/secondary|gray/i);
    });
  });

  describe('Pending Request Display', () => {
    it('shows cancel button for pending requests when showActions is true', () => {
      render(
        <UpgradeRequestStatusCard
          request={mockPendingRequest}
          showActions={true}
        />
      );

      expect(screen.getByRole('button', { name: /cancel request/i })).toBeInTheDocument();
    });

    it('does not show cancel button when showActions is false', () => {
      render(
        <UpgradeRequestStatusCard
          request={mockPendingRequest}
          showActions={false}
        />
      );

      expect(screen.queryByRole('button', { name: /cancel request/i })).not.toBeInTheDocument();
    });

    it('shows cancel button by default for pending requests', () => {
      render(<UpgradeRequestStatusCard request={mockPendingRequest} />);

      // showActions should default to true
      expect(screen.getByRole('button', { name: /cancel request/i })).toBeInTheDocument();
    });

    it('shows help text about pending review', () => {
      render(<UpgradeRequestStatusCard request={mockPendingRequest} />);

      expect(screen.getByText(/request is being reviewed/i)).toBeInTheDocument();
    });
  });

  describe('Approved Request Display', () => {
    it('does not show cancel button for approved requests', () => {
      render(
        <UpgradeRequestStatusCard
          request={mockApprovedRequest}
          showActions={true}
        />
      );

      expect(screen.queryByRole('button', { name: /cancel request/i })).not.toBeInTheDocument();
    });

    it('displays review date for approved requests', () => {
      render(<UpgradeRequestStatusCard request={mockApprovedRequest} />);

      expect(screen.getByText(/approved on/i)).toBeInTheDocument();
      expect(screen.getByText(/2024/i)).toBeInTheDocument();
    });

    it('displays reviewer name when available', () => {
      render(<UpgradeRequestStatusCard request={mockApprovedRequest} />);

      expect(screen.getByText(/admin user/i)).toBeInTheDocument();
    });

    it('shows success message for approved requests', () => {
      render(<UpgradeRequestStatusCard request={mockApprovedRequest} />);

      expect(screen.getByText(/your tier has been upgraded/i)).toBeInTheDocument();
    });
  });

  describe('Rejected Request Display', () => {
    it('does not show cancel button for rejected requests', () => {
      render(
        <UpgradeRequestStatusCard
          request={mockRejectedRequest}
          showActions={true}
        />
      );

      expect(screen.queryByRole('button', { name: /cancel request/i })).not.toBeInTheDocument();
    });

    it('displays rejection reason', () => {
      render(<UpgradeRequestStatusCard request={mockRejectedRequest} />);

      expect(screen.getByText(/please provide more details/i)).toBeInTheDocument();
    });

    it('displays review date for rejected requests', () => {
      render(<UpgradeRequestStatusCard request={mockRejectedRequest} />);

      expect(screen.getByText(/rejected on/i)).toBeInTheDocument();
    });

    it('displays reviewer name for rejected requests', () => {
      render(<UpgradeRequestStatusCard request={mockRejectedRequest} />);

      expect(screen.getByText(/admin user/i)).toBeInTheDocument();
    });

    it('shows alert for rejection with reason', () => {
      render(<UpgradeRequestStatusCard request={mockRejectedRequest} />);

      // Should use Alert component for rejection reason
      const alert = screen.getByText(/please provide more details/i).closest('[role="alert"]');
      expect(alert).toBeInTheDocument();
    });

    it('handles missing rejection reason gracefully', () => {
      const requestWithoutReason = {
        ...mockRejectedRequest,
        rejectionReason: undefined,
      };

      render(<UpgradeRequestStatusCard request={requestWithoutReason} />);

      expect(screen.getByText(/rejected/i)).toBeInTheDocument();
      expect(screen.queryByText(/reason/i)).not.toBeInTheDocument();
    });
  });

  describe('Cancelled Request Display', () => {
    it('does not show cancel button for cancelled requests', () => {
      render(
        <UpgradeRequestStatusCard
          request={mockCancelledRequest}
          showActions={true}
        />
      );

      expect(screen.queryByRole('button', { name: /cancel request/i })).not.toBeInTheDocument();
    });

    it('shows cancelled status message', () => {
      render(<UpgradeRequestStatusCard request={mockCancelledRequest} />);

      expect(screen.getByText(/this request was cancelled/i)).toBeInTheDocument();
    });
  });

  describe('Cancel Request Functionality', () => {
    it('opens confirmation dialog when cancel button clicked', async () => {
      const user = userEvent.setup();

      render(
        <UpgradeRequestStatusCard
          request={mockPendingRequest}
          showActions={true}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel request/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
        expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
      });
    });

    it('closes dialog when user cancels confirmation', async () => {
      const user = userEvent.setup();

      render(
        <UpgradeRequestStatusCard
          request={mockPendingRequest}
          showActions={true}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel request/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      });

      const cancelDialogButton = screen.getByRole('button', { name: /cancel$/i });
      await user.click(cancelDialogButton);

      await waitFor(() => {
        expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
      });
    });

    it('calls API to cancel request when confirmed', async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Request cancelled successfully',
        }),
      });

      render(
        <UpgradeRequestStatusCard
          request={mockPendingRequest}
          showActions={true}
          onCancel={onCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel request/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /confirm|continue/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/portal/vendors/${mockPendingRequest.vendorId}/tier-upgrade-request/${mockPendingRequest.id}`,
          expect.objectContaining({
            method: 'DELETE',
          })
        );
      });
    });

    it('shows success toast after successful cancellation', async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Request cancelled successfully',
        }),
      });

      render(
        <UpgradeRequestStatusCard
          request={mockPendingRequest}
          showActions={true}
          onCancel={onCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel request/i });
      await user.click(cancelButton);

      const confirmButton = screen.getByRole('button', { name: /confirm|continue/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringMatching(/request cancelled successfully/i)
        );
      });
    });

    it('calls onCancel callback after successful cancellation', async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
        }),
      });

      render(
        <UpgradeRequestStatusCard
          request={mockPendingRequest}
          showActions={true}
          onCancel={onCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel request/i });
      await user.click(cancelButton);

      const confirmButton = screen.getByRole('button', { name: /confirm|continue/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(onCancel).toHaveBeenCalledWith(mockPendingRequest.id);
      });
    });

    it('shows error toast when cancellation fails', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          error: 'INTERNAL_ERROR',
        }),
      });

      render(
        <UpgradeRequestStatusCard
          request={mockPendingRequest}
          showActions={true}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel request/i });
      await user.click(cancelButton);

      const confirmButton = screen.getByRole('button', { name: /confirm|continue/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringMatching(/failed to cancel request/i)
        );
      });
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

      const cancelButton = screen.getByRole('button', { name: /cancel request/i });
      await user.click(cancelButton);

      const confirmButton = screen.getByRole('button', { name: /confirm|continue/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringMatching(/failed to cancel request/i)
        );
      });
    });

    it('disables cancel button during cancellation', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(
        <UpgradeRequestStatusCard
          request={mockPendingRequest}
          showActions={true}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel request/i });
      await user.click(cancelButton);

      const confirmButton = screen.getByRole('button', { name: /confirm|continue/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(confirmButton).toBeDisabled();
      });
    });
  });

  describe('Date Formatting', () => {
    it('formats request date correctly', () => {
      render(<UpgradeRequestStatusCard request={mockPendingRequest} />);

      // Should format as readable date (implementation will use date-fns)
      // Example: "Jan 15, 2024" or "January 15, 2024"
      expect(screen.getByText(/2024/i)).toBeInTheDocument();
    });

    it('formats review date correctly for approved requests', () => {
      render(<UpgradeRequestStatusCard request={mockApprovedRequest} />);

      expect(screen.getByText(/2024/i)).toBeInTheDocument();
    });

    it('handles different date formats consistently', () => {
      const requestWithDifferentDate = {
        ...mockPendingRequest,
        requestedAt: '2024-12-25T00:00:00Z',
      };

      render(<UpgradeRequestStatusCard request={requestWithDifferentDate} />);

      expect(screen.getByText(/dec|december/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<UpgradeRequestStatusCard request={mockPendingRequest} />);

      const heading = screen.getByRole('heading', { name: /upgrade request status/i });
      expect(heading).toBeInTheDocument();
    });

    it('uses semantic card structure', () => {
      const { container } = render(
        <UpgradeRequestStatusCard request={mockPendingRequest} />
      );

      // Should use Card component with proper semantics
      expect(container.querySelector('[role="region"]')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(
        <UpgradeRequestStatusCard
          request={mockPendingRequest}
          showActions={true}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel request/i });
      expect(cancelButton).toHaveAccessibleName();
    });

    it('uses alert role for rejection reason', () => {
      render(<UpgradeRequestStatusCard request={mockRejectedRequest} />);

      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent(/please provide more details/i);
    });
  });

  describe('Edge Cases', () => {
    it('handles missing reviewer information gracefully', () => {
      const requestWithoutReviewer = {
        ...mockApprovedRequest,
        reviewedBy: undefined,
      };

      render(<UpgradeRequestStatusCard request={requestWithoutReviewer} />);

      expect(screen.getByText(/approved/i)).toBeInTheDocument();
      expect(screen.queryByText(/reviewed by/i)).not.toBeInTheDocument();
    });

    it('handles missing dates gracefully', () => {
      const requestWithoutDates = {
        ...mockPendingRequest,
        requestedAt: undefined,
      };

      render(<UpgradeRequestStatusCard request={requestWithoutDates as any} />);

      expect(screen.getByText(/pending/i)).toBeInTheDocument();
    });

    it('renders with minimal request data', () => {
      const minimalRequest = {
        id: 'req-minimal',
        vendorId: 'vendor-1',
        currentTier: 'free' as const,
        requestedTier: 'tier1' as const,
        status: 'pending' as const,
        requestedAt: new Date().toISOString(),
      };

      render(<UpgradeRequestStatusCard request={minimalRequest as any} />);

      expect(screen.getByText(/pending/i)).toBeInTheDocument();
      expect(screen.getByText(/tier1/i)).toBeInTheDocument();
    });
  });
});
