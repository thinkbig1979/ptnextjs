/**
 * AdminTierRequestQueue Validation Tests
 *
 * Tests for rejection reason validation functionality in the admin tier request queue.
 * Ensures frontend validation matches backend requirements (10-1000 characters).
 *
 * Bug: AdminTierRequestQueue.tsx lacked proper validation for rejection reason length
 * Backend requires: 10-1000 characters
 * Frontend now validates: same 10-1000 character requirement
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AdminTierRequestQueue from '@/components/admin/AdminTierRequestQueue';
import { useToast } from '@/hooks/use-toast';

// Mock useToast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('AdminTierRequestQueue - Rejection Reason Validation', () => {
  const mockToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * Helper: Mock API response with sample tier requests
   */
  function mockTierRequestsResponse(requests = [
    {
      id: 'request-1',
      vendor: {
        id: 'vendor-1',
        companyName: 'Test Vendor Co.',
        contactEmail: 'contact@testvendor.com',
      },
      currentTier: 'tier1',
      requestedTier: 'tier2',
      requestType: 'upgrade' as const,
      status: 'pending' as const,
      requestedAt: new Date().toISOString(),
      vendorNotes: 'We need more locations for our expanding business.',
    },
  ]) {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { requests },
      }),
    });
  }

  /**
   * Helper: Open reject dialog for a request
   */
  async function openRejectDialog(user: ReturnType<typeof userEvent.setup>) {
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /reject test vendor co/i })).toBeInTheDocument();
    });

    const rejectButton = screen.getByRole('button', { name: /reject test vendor co/i });
    await user.click(rejectButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  }

  /**
   * Helper: Get reject button in dialog
   */
  function getDialogRejectButton() {
    const dialog = screen.getByRole('dialog');
    const buttons = screen.getAllByRole('button', { name: /reject/i });
    // Find the button inside the dialog (not the table row button)
    return buttons.find((btn) => dialog.contains(btn));
  }

  describe('Validation Function Behavior', () => {
    it('validates empty rejection reason as invalid', async () => {
      const user = userEvent.setup();
      mockTierRequestsResponse();
      render(<AdminTierRequestQueue />);

      await openRejectDialog(user);

      // Reject button should be disabled with empty input
      const dialogRejectButton = getDialogRejectButton();
      expect(dialogRejectButton).toBeDisabled();
    });

    it('validates short rejection reason (<10 chars) as invalid', async () => {
      const user = userEvent.setup();
      mockTierRequestsResponse();
      render(<AdminTierRequestQueue />);

      await openRejectDialog(user);

      // Type 9 characters
      const textarea = screen.getByLabelText(/rejection reason/i);
      await user.type(textarea, 'Too short'); // 9 characters

      // Reject button should be disabled
      const dialogRejectButton = getDialogRejectButton();
      expect(dialogRejectButton).toBeDisabled();
    });

    it('validates 10-character rejection reason as valid', async () => {
      const user = userEvent.setup();
      mockTierRequestsResponse();
      render(<AdminTierRequestQueue />);

      await openRejectDialog(user);

      // Type exactly 10 characters
      const textarea = screen.getByLabelText(/rejection reason/i);
      await user.type(textarea, '1234567890'); // 10 characters

      // Reject button should be enabled
      const dialogRejectButton = getDialogRejectButton();
      expect(dialogRejectButton).toBeEnabled();
    });

    it('validates valid rejection reason (10-1000 chars) as valid', async () => {
      const user = userEvent.setup();
      mockTierRequestsResponse();
      render(<AdminTierRequestQueue />);

      await openRejectDialog(user);

      // Type valid rejection reason
      const textarea = screen.getByLabelText(/rejection reason/i);
      await user.type(textarea, 'This is a valid rejection reason with sufficient detail.');

      // Reject button should be enabled
      const dialogRejectButton = getDialogRejectButton();
      expect(dialogRejectButton).toBeEnabled();
    });

    it('validates rejection reason at exactly 1000 characters as valid', async () => {
      const user = userEvent.setup();
      mockTierRequestsResponse();
      render(<AdminTierRequestQueue />);

      await openRejectDialog(user);

      // Type exactly 1000 characters
      const textarea = screen.getByLabelText(/rejection reason/i);
      const validText = 'a'.repeat(1000);
      await user.type(textarea, validText);

      // Wait for state update
      await waitFor(() => {
        expect(textarea).toHaveValue(validText);
      });

      // Reject button should be enabled
      const dialogRejectButton = getDialogRejectButton();
      expect(dialogRejectButton).toBeEnabled();
    });

    it('prevents input beyond 1000 characters via maxLength attribute', async () => {
      const user = userEvent.setup();
      mockTierRequestsResponse();
      render(<AdminTierRequestQueue />);

      await openRejectDialog(user);

      // Textarea should have maxLength attribute preventing input >1000 chars
      const textarea = screen.getByLabelText(/rejection reason/i);
      expect(textarea).toHaveAttribute('maxLength', '1000');

      // Try to type 1001 characters - should be capped at 1000
      const attemptedText = 'a'.repeat(1001);
      await user.type(textarea, attemptedText);

      // Should only have 1000 characters
      await waitFor(() => {
        const value = (textarea as HTMLTextAreaElement).value;
        expect(value.length).toBe(1000);
      });
    });
  });

  describe('Error Message Display', () => {
    it('shows minimum length error for empty rejection reason', async () => {
      const user = userEvent.setup();
      mockTierRequestsResponse();
      render(<AdminTierRequestQueue />);

      await openRejectDialog(user);

      // Should show minimum character requirement
      expect(screen.getByText(/minimum 10 characters required/i)).toBeInTheDocument();
    });

    it('shows minimum length error for rejection reason <10 characters', async () => {
      const user = userEvent.setup();
      mockTierRequestsResponse();
      render(<AdminTierRequestQueue />);

      await openRejectDialog(user);

      // Type 9 characters
      const textarea = screen.getByLabelText(/rejection reason/i);
      await user.type(textarea, 'Too short'); // 9 characters

      // Should show minimum character requirement
      expect(screen.getByText(/minimum 10 characters required/i)).toBeInTheDocument();
    });

    it('hides error message when rejection reason is valid (>=10 chars)', async () => {
      const user = userEvent.setup();
      mockTierRequestsResponse();
      render(<AdminTierRequestQueue />);

      await openRejectDialog(user);

      // Type valid text
      const textarea = screen.getByLabelText(/rejection reason/i);
      await user.type(textarea, 'Valid reason text here');

      // Error message should not be visible
      expect(screen.queryByText(/minimum 10 characters required/i)).not.toBeInTheDocument();
    });
  });

  describe('Reject Button Disabled State', () => {
    it('disables reject button when rejection reason is empty', async () => {
      const user = userEvent.setup();
      mockTierRequestsResponse();
      render(<AdminTierRequestQueue />);

      await openRejectDialog(user);

      const dialogRejectButton = getDialogRejectButton();
      expect(dialogRejectButton).toBeDisabled();
    });

    it('disables reject button when rejection reason is too short (<10 chars)', async () => {
      const user = userEvent.setup();
      mockTierRequestsResponse();
      render(<AdminTierRequestQueue />);

      await openRejectDialog(user);

      // Type 5 characters
      const textarea = screen.getByLabelText(/rejection reason/i);
      await user.type(textarea, 'Short');

      const dialogRejectButton = getDialogRejectButton();
      expect(dialogRejectButton).toBeDisabled();
    });

    it('enables reject button when rejection reason is valid (>=10 chars)', async () => {
      const user = userEvent.setup();
      mockTierRequestsResponse();
      render(<AdminTierRequestQueue />);

      await openRejectDialog(user);

      // Type valid text
      const textarea = screen.getByLabelText(/rejection reason/i);
      await user.type(textarea, 'This is a valid rejection reason');

      const dialogRejectButton = getDialogRejectButton();
      expect(dialogRejectButton).toBeEnabled();
    });

    it('keeps reject button enabled for rejection reasons up to 1000 chars', async () => {
      const user = userEvent.setup();
      mockTierRequestsResponse();
      render(<AdminTierRequestQueue />);

      await openRejectDialog(user);

      // Type 500 characters
      const textarea = screen.getByLabelText(/rejection reason/i);
      const validText = 'a'.repeat(500);
      await user.type(textarea, validText);

      await waitFor(() => {
        expect(textarea).toHaveValue(validText);
      });

      const dialogRejectButton = getDialogRejectButton();
      expect(dialogRejectButton).toBeEnabled();
    });
  });

  describe('Character Counter Display', () => {
    it('shows 0/1000 when rejection reason is empty', async () => {
      const user = userEvent.setup();
      mockTierRequestsResponse();
      render(<AdminTierRequestQueue />);

      await openRejectDialog(user);

      expect(screen.getByText('0/1000')).toBeInTheDocument();
    });

    it('shows correct count when characters are entered', async () => {
      const user = userEvent.setup();
      mockTierRequestsResponse();
      render(<AdminTierRequestQueue />);

      await openRejectDialog(user);

      // Type 45 characters
      const textarea = screen.getByLabelText(/rejection reason/i);
      const testText = 'This is exactly forty-five characters long!!'; // 45 chars
      await user.type(textarea, testText);

      await waitFor(() => {
        expect(screen.getByText('45/1000')).toBeInTheDocument();
      });
    });

    it('shows warning style when character count exceeds 90% (>900 chars)', async () => {
      const user = userEvent.setup();
      mockTierRequestsResponse();
      render(<AdminTierRequestQueue />);

      await openRejectDialog(user);

      // Type 950 characters
      const textarea = screen.getByLabelText(/rejection reason/i);
      const testText = 'a'.repeat(950);
      await user.type(textarea, testText);

      await waitFor(() => {
        const counter = screen.getByText('950/1000');
        expect(counter).toBeInTheDocument();
        // Check if it has warning styling (text-warning class)
        expect(counter).toHaveClass('text-warning');
      });
    });

    it('shows normal style when character count is below 90% (<=900 chars)', async () => {
      const user = userEvent.setup();
      mockTierRequestsResponse();
      render(<AdminTierRequestQueue />);

      await openRejectDialog(user);

      // Type 100 characters
      const textarea = screen.getByLabelText(/rejection reason/i);
      const testText = 'a'.repeat(100);
      await user.type(textarea, testText);

      await waitFor(() => {
        const counter = screen.getByText('100/1000');
        expect(counter).toBeInTheDocument();
        // Should have muted-foreground, not warning
        expect(counter).toHaveClass('text-muted-foreground');
        expect(counter).not.toHaveClass('text-warning');
      });
    });
  });

  describe('Integration: Validation Prevents Invalid API Calls', () => {
    it('prevents reject API call when rejection reason is too short', async () => {
      const user = userEvent.setup();
      mockTierRequestsResponse();
      render(<AdminTierRequestQueue />);

      await openRejectDialog(user);

      // Type short reason
      const textarea = screen.getByLabelText(/rejection reason/i);
      await user.type(textarea, 'Short');

      // Try to click reject button (should be disabled)
      const dialogRejectButton = getDialogRejectButton();
      expect(dialogRejectButton).toBeDisabled();

      // Verify no API call was made
      expect(global.fetch).toHaveBeenCalledTimes(1); // Only the initial fetch
    });

    it('allows reject API call when rejection reason is valid', async () => {
      const user = userEvent.setup();
      mockTierRequestsResponse();
      render(<AdminTierRequestQueue />);

      await openRejectDialog(user);

      // Type valid reason
      const textarea = screen.getByLabelText(/rejection reason/i);
      const validReason = 'This is a valid rejection reason with sufficient detail.';
      await user.type(textarea, validReason);

      // Mock successful reject API call
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      // Click reject button (should be enabled)
      const dialogRejectButton = getDialogRejectButton();
      expect(dialogRejectButton).toBeEnabled();
      await user.click(dialogRejectButton);

      // Verify reject API was called
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/admin/tier-upgrade-requests/request-1/reject'),
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify({ rejectionReason: validReason }),
          })
        );
      });
    });
  });

  describe('Validation Edge Cases', () => {
    it('trims whitespace when validating rejection reason', async () => {
      const user = userEvent.setup();
      mockTierRequestsResponse();
      render(<AdminTierRequestQueue />);

      await openRejectDialog(user);

      // Type text with leading/trailing whitespace that's <10 chars when trimmed
      const textarea = screen.getByLabelText(/rejection reason/i);
      await user.type(textarea, '   Short   '); // "Short" is 5 chars when trimmed

      // Button should be disabled because trimmed length is <10
      const dialogRejectButton = getDialogRejectButton();
      expect(dialogRejectButton).toBeDisabled();
    });

    it('counts whitespace in character counter but not in validation', async () => {
      const user = userEvent.setup();
      mockTierRequestsResponse();
      render(<AdminTierRequestQueue />);

      await openRejectDialog(user);

      // Type "   Short   " (5 chars + 6 spaces = 11 chars total)
      const textarea = screen.getByLabelText(/rejection reason/i);
      await user.type(textarea, '   Short   ');

      // Character counter shows 11 (raw length)
      await waitFor(() => {
        expect(screen.getByText('11/1000')).toBeInTheDocument();
      });

      // But button is disabled because trimmed length is 5 (<10)
      const dialogRejectButton = getDialogRejectButton();
      expect(dialogRejectButton).toBeDisabled();
    });

    it('handles rapid typing without validation issues', async () => {
      const user = userEvent.setup();
      mockTierRequestsResponse();
      render(<AdminTierRequestQueue />);

      await openRejectDialog(user);

      // Type rapidly
      const textarea = screen.getByLabelText(/rejection reason/i);
      await user.type(textarea, 'This is a valid rejection reason!', { delay: 1 });

      // Should eventually enable button
      await waitFor(() => {
        const dialogRejectButton = getDialogRejectButton();
        expect(dialogRejectButton).toBeEnabled();
      });
    });
  });
});
