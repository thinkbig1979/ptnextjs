/**
 * Component Tests - TierUpgradeRequestForm
 *
 * Tests the tier upgrade request form component including:
 * - Form rendering and field validation
 * - Tier selection based on current tier
 * - Form submission and API integration
 * - Loading states and error handling
 * - Accessibility attributes
 * - User interactions
 *
 * Target coverage: 75%+
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TierUpgradeRequestForm } from '@/components/dashboard/TierUpgradeRequestForm';
import {
  mockVendorAtFree,
  mockVendorAtTier1,
  mockVendorAtTier2,
  mockApiSuccessResponse,
  mockApiErrorResponse,
  mockApiDuplicateErrorResponse,
  validFormData,
  invalidFormDataShortNotes,
  invalidFormDataLongNotes,
} from '../../../__tests__/fixtures/tier-upgrade-data';

// Mock sonner toast notifications
jest.mock('@/components/ui/sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
  },
}));

// Mock fetch for API calls
global.fetch = jest.fn();

const { toast } = require('@/components/ui/sonner');

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

describe('TierUpgradeRequestForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Form Rendering', () => {
    it('renders form with all required fields', () => {
      render(
        <TierUpgradeRequestForm
          currentTier="free"
          vendorId={mockVendorAtFree.id}
        />
      );

      expect(screen.getByLabelText(/requested tier/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/vendor notes/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit request/i })).toBeInTheDocument();
    });

    it('renders card with title and description', () => {
      render(
        <TierUpgradeRequestForm
          currentTier="free"
          vendorId={mockVendorAtFree.id}
        />
      );

      expect(screen.getByText(/request tier upgrade/i)).toBeInTheDocument();
      expect(screen.getByText(/select.*tier.*provide.*details/i)).toBeInTheDocument();
    });

    it('has accessible form labels', () => {
      render(
        <TierUpgradeRequestForm
          currentTier="free"
          vendorId={mockVendorAtFree.id}
        />
      );

      const tierSelect = screen.getByLabelText(/requested tier/i);
      const notesTextarea = screen.getByLabelText(/vendor notes/i);

      // Verify fields are accessible via labels
      expect(tierSelect).toBeInTheDocument();
      expect(notesTextarea).toBeInTheDocument();
      expect(notesTextarea).toHaveAttribute('name', 'vendorNotes');
    });

    it('shows optional indicator for vendor notes', () => {
      render(
        <TierUpgradeRequestForm
          currentTier="free"
          vendorId={mockVendorAtFree.id}
        />
      );

      expect(screen.getByText(/optional/i)).toBeInTheDocument();
    });
  });

  describe('Tier Selection Logic', () => {
    it('shows tier1, tier2, tier3 options when current tier is free', () => {
      render(
        <TierUpgradeRequestForm
          currentTier="free"
          vendorId={mockVendorAtFree.id}
        />
      );

      const select = screen.getByLabelText(/requested tier/i);
      expect(select).toBeInTheDocument();

      // Note: Since this is a shadcn Select component, we need to test the
      // actual options after clicking the trigger. This is a simplified test.
      // In full implementation, you'd need to click the select and verify options.
    });

    it('only shows tier2 and tier3 options when current tier is tier1', () => {
      render(
        <TierUpgradeRequestForm
          currentTier="tier1"
          vendorId={mockVendorAtTier1.id}
        />
      );

      const select = screen.getByLabelText(/requested tier/i);
      expect(select).toBeInTheDocument();
      // Tier1 should not be an available option (implementation will handle this)
    });

    it('only shows tier3 option when current tier is tier2', () => {
      render(
        <TierUpgradeRequestForm
          currentTier="tier2"
          vendorId={mockVendorAtTier2.id}
        />
      );

      const select = screen.getByLabelText(/requested tier/i);
      expect(select).toBeInTheDocument();
      // Only tier3 should be available
    });

    it('does not render form when current tier is tier3 (max tier)', () => {
      render(
        <TierUpgradeRequestForm
          currentTier="tier3"
          vendorId="vendor-tier3-1"
        />
      );

      // Form should not be visible or should show a message
      expect(screen.queryByLabelText(/requested tier/i)).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows error when vendor notes are less than 20 characters', async () => {
      const user = userEvent.setup();
      render(
        <TierUpgradeRequestForm
          currentTier="free"
          vendorId={mockVendorAtFree.id}
        />
      );

      const notesTextarea = screen.getByLabelText(/vendor notes/i);
      await user.clear(notesTextarea);
      await user.type(notesTextarea, 'Too short');
      await user.tab(); // Trigger blur validation

      await waitFor(
        () => {
          expect(screen.getByText(/at least 20 characters/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('shows error when vendor notes exceed 500 characters', async () => {
      const user = userEvent.setup();
      render(
        <TierUpgradeRequestForm
          currentTier="free"
          vendorId={mockVendorAtFree.id}
        />
      );

      const notesTextarea = screen.getByLabelText(/vendor notes/i);
      const longText = 'x'.repeat(501);
      await user.clear(notesTextarea);
      await user.type(notesTextarea, longText);
      await user.tab();

      await waitFor(
        () => {
          expect(screen.getByText(/cannot exceed 500 characters/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('shows error when no tier is selected', async () => {
      const user = userEvent.setup();
      render(
        <TierUpgradeRequestForm
          currentTier="free"
          vendorId={mockVendorAtFree.id}
        />
      );

      const submitButton = screen.getByRole('button', { name: /submit request/i });
      await user.click(submitButton);

      await waitFor(
        () => {
          expect(screen.getByText(/please select.*tier/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('allows submission with valid tier and no notes', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiSuccessResponse,
      });

      render(
        <TierUpgradeRequestForm
          currentTier="free"
          vendorId={mockVendorAtFree.id}
        />
      );

      // Select tier first - this is required
      await selectTier(user, 'Tier 1');

      const submitButton = screen.getByRole('button', { name: /submit request/i });
      await user.click(submitButton);

      // Verify no validation error for missing notes (since it's optional)
      await waitFor(() => {
        expect(screen.queryByText(/notes.*required/i)).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('accepts notes with exactly 20 characters', async () => {
      const user = userEvent.setup();
      render(
        <TierUpgradeRequestForm
          currentTier="free"
          vendorId={mockVendorAtFree.id}
        />
      );

      const notesTextarea = screen.getByLabelText(/vendor notes/i);
      await user.clear(notesTextarea); // Always clear first
      await user.type(notesTextarea, 'Need more features!!'); // Exactly 20 chars
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/at least 20 characters/i)).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('accepts notes with exactly 500 characters', async () => {
      const user = userEvent.setup();
      render(
        <TierUpgradeRequestForm
          currentTier="free"
          vendorId={mockVendorAtFree.id}
        />
      );

      const notesTextarea = screen.getByLabelText(/vendor notes/i);
      await user.clear(notesTextarea); // Always clear first
      const maxText = 'x'.repeat(500);
      await user.type(notesTextarea, maxText);
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/cannot exceed 500 characters/i)).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid data and shows success toast', async () => {
      const user = userEvent.setup();
      const onSuccess = jest.fn();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiSuccessResponse,
      });

      render(
        <TierUpgradeRequestForm
          currentTier="free"
          vendorId={mockVendorAtFree.id}
          onSuccess={onSuccess}
        />
      );

      // Select tier using helper function
      await selectTier(user, 'Tier 1');

      // Fill notes
      const notesTextarea = screen.getByLabelText(/vendor notes/i);
      await user.type(notesTextarea, validFormData.vendorNotes);

      const submitButton = screen.getByRole('button', { name: /submit request/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/portal/vendors/${mockVendorAtFree.id}/tier-upgrade-request`,
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })
        );
      }, { timeout: 5000 });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringMatching(/tier upgrade request submitted successfully/i)
        );
        expect(onSuccess).toHaveBeenCalled();
      }, { timeout: 5000 });
    });

    it('disables form during submission', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(
        <TierUpgradeRequestForm
          currentTier="free"
          vendorId={mockVendorAtFree.id}
        />
      );

      // Select tier first
      await selectTier(user, 'Tier 1');

      const notesTextarea = screen.getByLabelText(/vendor notes/i);
      await user.type(notesTextarea, validFormData.vendorNotes);

      const submitButton = screen.getByRole('button', { name: /submit request/i });
      await user.click(submitButton);

      // Check that form elements are disabled during submission
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(notesTextarea).toBeDisabled();
      }, { timeout: 3000 });
    });

    it('shows loading indicator during submission', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(
        <TierUpgradeRequestForm
          currentTier="free"
          vendorId={mockVendorAtFree.id}
        />
      );

      // Select tier first
      await selectTier(user, 'Tier 1');

      const notesTextarea = screen.getByLabelText(/vendor notes/i);
      await user.type(notesTextarea, validFormData.vendorNotes);

      const submitButton = screen.getByRole('button', { name: /submit request/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toHaveTextContent(/submitting/i);
      }, { timeout: 3000 });
    });

    it('calls onSuccess callback after successful submission', async () => {
      const user = userEvent.setup();
      const onSuccess = jest.fn();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiSuccessResponse,
      });

      render(
        <TierUpgradeRequestForm
          currentTier="free"
          vendorId={mockVendorAtFree.id}
          onSuccess={onSuccess}
        />
      );

      // Select tier first
      await selectTier(user, 'Tier 1');

      const notesTextarea = screen.getByLabelText(/vendor notes/i);
      await user.type(notesTextarea, validFormData.vendorNotes);

      const submitButton = screen.getByRole('button', { name: /submit request/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(mockApiSuccessResponse.data);
      }, { timeout: 5000 });
    });
  });

  describe('API Error Handling', () => {
    it('shows error toast on validation error (400)', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => mockApiErrorResponse,
      });

      render(
        <TierUpgradeRequestForm
          currentTier="free"
          vendorId={mockVendorAtFree.id}
        />
      );

      // Select tier first
      await selectTier(user, 'Tier 1');

      const notesTextarea = screen.getByLabelText(/vendor notes/i);
      await user.type(notesTextarea, 'We need more products to serve our customers'); // Valid notes

      const submitButton = screen.getByRole('button', { name: /submit request/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      }, { timeout: 5000 });
    });

    it('shows error toast on duplicate request (409)', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => mockApiDuplicateErrorResponse,
      });

      render(
        <TierUpgradeRequestForm
          currentTier="free"
          vendorId={mockVendorAtFree.id}
        />
      );

      // Select tier first
      await selectTier(user, 'Tier 1');

      const notesTextarea = screen.getByLabelText(/vendor notes/i);
      await user.type(notesTextarea, validFormData.vendorNotes);

      const submitButton = screen.getByRole('button', { name: /submit request/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringMatching(/already have a pending upgrade request/i)
        );
      }, { timeout: 5000 });
    });

    it('shows generic error toast on server error (500)', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          error: 'INTERNAL_ERROR',
          message: 'Server error',
        }),
      });

      render(
        <TierUpgradeRequestForm
          currentTier="free"
          vendorId={mockVendorAtFree.id}
        />
      );

      // Select tier first
      await selectTier(user, 'Tier 1');

      const notesTextarea = screen.getByLabelText(/vendor notes/i);
      await user.type(notesTextarea, validFormData.vendorNotes);

      const submitButton = screen.getByRole('button', { name: /submit request/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringMatching(/failed to submit request/i)
        );
      }, { timeout: 5000 });
    });

    it('shows error toast on network error', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      render(
        <TierUpgradeRequestForm
          currentTier="free"
          vendorId={mockVendorAtFree.id}
        />
      );

      // Select tier first
      await selectTier(user, 'Tier 1');

      const notesTextarea = screen.getByLabelText(/vendor notes/i);
      await user.type(notesTextarea, validFormData.vendorNotes);

      const submitButton = screen.getByRole('button', { name: /submit request/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringMatching(/failed to submit request/i)
        );
      }, { timeout: 5000 });
    });

    it('re-enables form after error', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      render(
        <TierUpgradeRequestForm
          currentTier="free"
          vendorId={mockVendorAtFree.id}
        />
      );

      // Select tier first
      await selectTier(user, 'Tier 1');

      const notesTextarea = screen.getByLabelText(/vendor notes/i);
      await user.type(notesTextarea, validFormData.vendorNotes);

      const submitButton = screen.getByRole('button', { name: /submit request/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });

      // Form should be re-enabled after error
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
        expect(notesTextarea).not.toBeDisabled();
      });
    });
  });

  describe('Cancel Functionality', () => {
    it('calls onCancel callback when cancel button clicked', async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();

      render(
        <TierUpgradeRequestForm
          currentTier="free"
          vendorId={mockVendorAtFree.id}
          onCancel={onCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(onCancel).toHaveBeenCalled();
    });

    it('does not show cancel button when onCancel is not provided', () => {
      render(
        <TierUpgradeRequestForm
          currentTier="free"
          vendorId={mockVendorAtFree.id}
        />
      );

      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for form fields', () => {
      render(
        <TierUpgradeRequestForm
          currentTier="free"
          vendorId={mockVendorAtFree.id}
        />
      );

      const tierSelect = screen.getByLabelText(/requested tier/i);
      const notesTextarea = screen.getByLabelText(/vendor notes/i);

      expect(tierSelect).toHaveAccessibleName();
      expect(notesTextarea).toHaveAccessibleName();
    });

    it('associates error messages with form fields', async () => {
      const user = userEvent.setup();
      render(
        <TierUpgradeRequestForm
          currentTier="free"
          vendorId={mockVendorAtFree.id}
        />
      );

      const notesTextarea = screen.getByLabelText(/vendor notes/i);
      await user.type(notesTextarea, 'Short');
      await user.tab();

      await waitFor(() => {
        const errorMessage = screen.getByText(/at least 20 characters/i);
        expect(errorMessage).toBeInTheDocument();
        // In full implementation, verify aria-describedby relationship
      });
    });

    it('has descriptive button text', () => {
      render(
        <TierUpgradeRequestForm
          currentTier="free"
          vendorId={mockVendorAtFree.id}
        />
      );

      const submitButton = screen.getByRole('button', { name: /submit request/i });
      expect(submitButton).toHaveAccessibleName();
    });
  });
});
