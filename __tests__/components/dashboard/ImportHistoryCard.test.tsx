import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ImportHistoryCard } from '@/components/dashboard/ImportHistoryCard';

// Mock dependencies
jest.mock('@/lib/context/VendorDashboardContext', () => ({
  useVendorDashboard: jest.fn()
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

const { useVendorDashboard } = require('@/lib/context/VendorDashboardContext');

// Mock fetch globally
global.fetch = jest.fn();

describe('ImportHistoryCard', () => {
  const mockVendor = {
    id: 'vendor-1',
    name: 'Test Vendor',
    tier: 'tier2'
  };

  const mockHistoryData = {
    success: true,
    data: [
      {
        id: 'import-1',
        importDate: '2025-01-15T10:30:00Z',
        status: 'success',
        rowsProcessed: 100,
        successfulRows: 100,
        failedRows: 0,
        filename: 'vendor-data.xlsx',
        changes: [
          {
            rowNumber: 1,
            field: 'companyName',
            oldValue: 'Old Name',
            newValue: 'New Name'
          }
        ],
        errors: []
      },
      {
        id: 'import-2',
        importDate: '2025-01-14T09:15:00Z',
        status: 'partial',
        rowsProcessed: 50,
        successfulRows: 45,
        failedRows: 5,
        filename: 'vendor-update.xlsx',
        changes: [],
        errors: [
          {
            rowNumber: 10,
            field: 'email',
            message: 'Invalid email format'
          }
        ]
      },
      {
        id: 'import-3',
        importDate: '2025-01-13T14:20:00Z',
        status: 'failed',
        rowsProcessed: 20,
        successfulRows: 0,
        failedRows: 20,
        filename: 'bad-data.xlsx',
        changes: [],
        errors: [
          {
            rowNumber: 1,
            field: 'companyName',
            message: 'Required field missing'
          }
        ]
      }
    ],
    pagination: {
      page: 1,
      limit: 10,
      totalPages: 1,
      totalDocs: 3,
      hasNextPage: false,
      hasPrevPage: false,
      nextPage: null,
      prevPage: null
    },
    filters: {
      status: null,
      startDate: null,
      endDate: null
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useVendorDashboard.mockReturnValue({
      vendor: mockVendor
    });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockHistoryData
    });
  });

  describe('Rendering', () => {
    it('renders ImportHistoryCard with title and description', async () => {
      render(<ImportHistoryCard />);

      expect(screen.getByText('Import History')).toBeInTheDocument();
      expect(screen.getByText(/View past import operations/i)).toBeInTheDocument();
    });

    it('shows loading state initially', () => {
      render(<ImportHistoryCard />);

      expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
    });

    it('displays import history data after loading', async () => {
      render(<ImportHistoryCard />);

      await waitFor(() => {
        expect(screen.getByText('vendor-data.xlsx')).toBeInTheDocument();
      });

      expect(screen.getByText('100')).toBeInTheDocument(); // rows processed
      expect(screen.getByText('45')).toBeInTheDocument(); // successful rows
    });
  });

  describe('Status Badges', () => {
    it('displays success badge with correct styling', async () => {
      render(<ImportHistoryCard />);

      await waitFor(() => {
        const successBadges = screen.getAllByText('Success');
        expect(successBadges.length).toBeGreaterThan(0);
      });
    });

    it('displays partial badge with correct styling', async () => {
      render(<ImportHistoryCard />);

      await waitFor(() => {
        expect(screen.getByText('Partial')).toBeInTheDocument();
      });
    });

    it('displays failed badge with correct styling', async () => {
      render(<ImportHistoryCard />);

      await waitFor(() => {
        expect(screen.getByText('Failed')).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('allows filtering by status', async () => {
      render(<ImportHistoryCard />);

      await waitFor(() => {
        expect(screen.getByText('vendor-data.xlsx')).toBeInTheDocument();
      });

      // Find and click the filter select
      const filterSelect = screen.getByRole('combobox');
      fireEvent.click(filterSelect);

      // Click on "Success" filter option
      const successOption = await screen.findByText('Success', { selector: '[role="option"]' });
      fireEvent.click(successOption);

      // Verify fetch was called with correct params
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('status=success'),
          expect.any(Object)
        );
      });
    });

    it('resets to page 1 when filter changes', async () => {
      render(<ImportHistoryCard />);

      await waitFor(() => {
        expect(screen.getByText('vendor-data.xlsx')).toBeInTheDocument();
      });

      const filterSelect = screen.getByRole('combobox');
      fireEvent.click(filterSelect);

      const partialOption = await screen.findByText('Partial', { selector: '[role="option"]' });
      fireEvent.click(partialOption);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('page=1'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Pagination', () => {
    it('displays pagination information', async () => {
      render(<ImportHistoryCard />);

      await waitFor(() => {
        expect(screen.getByText(/Page 1 of 1/i)).toBeInTheDocument();
        expect(screen.getByText(/3 total imports/i)).toBeInTheDocument();
      });
    });

    it('disables previous button on first page', async () => {
      render(<ImportHistoryCard />);

      await waitFor(() => {
        const prevButton = screen.getByRole('button', { name: /previous/i });
        expect(prevButton).toBeDisabled();
      });
    });

    it('disables next button on last page', async () => {
      render(<ImportHistoryCard />);

      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /next/i });
        expect(nextButton).toBeDisabled();
      });
    });

    it('enables and handles next page navigation', async () => {
      const multiPageData = {
        ...mockHistoryData,
        pagination: {
          ...mockHistoryData.pagination,
          totalPages: 2,
          hasNextPage: true,
          nextPage: 2
        }
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => multiPageData
      });

      render(<ImportHistoryCard />);

      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /next/i });
        expect(nextButton).not.toBeDisabled();
      });

      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('page=2'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Details Dialog', () => {
    it('opens details dialog when clicking Details button', async () => {
      render(<ImportHistoryCard />);

      await waitFor(() => {
        expect(screen.getByText('vendor-data.xlsx')).toBeInTheDocument();
      });

      const detailsButtons = screen.getAllByRole('button', { name: /details/i });
      fireEvent.click(detailsButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Import Details')).toBeInTheDocument();
      });
    });

    it('displays summary information in dialog', async () => {
      render(<ImportHistoryCard />);

      await waitFor(() => {
        expect(screen.getByText('vendor-data.xlsx')).toBeInTheDocument();
      });

      const detailsButtons = screen.getAllByRole('button', { name: /details/i });
      fireEvent.click(detailsButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/vendor-data.xlsx/i)).toBeInTheDocument();
      });
    });

    it('displays errors in dialog when present', async () => {
      render(<ImportHistoryCard />);

      await waitFor(() => {
        expect(screen.getByText('bad-data.xlsx')).toBeInTheDocument();
      });

      const detailsButtons = screen.getAllByRole('button', { name: /details/i });
      fireEvent.click(detailsButtons[2]); // Click on failed import

      await waitFor(() => {
        expect(screen.getByText(/Required field missing/i)).toBeInTheDocument();
      });
    });

    it('displays changes in dialog when present', async () => {
      render(<ImportHistoryCard />);

      await waitFor(() => {
        expect(screen.getByText('vendor-data.xlsx')).toBeInTheDocument();
      });

      const detailsButtons = screen.getAllByRole('button', { name: /details/i });
      fireEvent.click(detailsButtons[0]); // Click on success import

      await waitFor(() => {
        expect(screen.getByText(/Old Name/i)).toBeInTheDocument();
        expect(screen.getByText(/New Name/i)).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('displays empty state when no history', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          ...mockHistoryData,
          data: [],
          pagination: {
            ...mockHistoryData.pagination,
            totalDocs: 0
          }
        })
      });

      render(<ImportHistoryCard />);

      await waitFor(() => {
        expect(screen.getByText(/No import history yet/i)).toBeInTheDocument();
      });
    });

    it('displays filtered empty state message', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          ...mockHistoryData,
          data: [],
          pagination: {
            ...mockHistoryData.pagination,
            totalDocs: 0
          }
        })
      });

      render(<ImportHistoryCard />);

      await waitFor(() => {
        expect(screen.getByText('vendor-data.xlsx')).toBeInTheDocument();
      });

      const filterSelect = screen.getByRole('combobox');
      fireEvent.click(filterSelect);

      const failedOption = await screen.findByText('Failed', { selector: '[role="option"]' });
      fireEvent.click(failedOption);

      await waitFor(() => {
        expect(screen.getByText(/No failed imports found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error toast on fetch failure', async () => {
      const { toast } = require('sonner');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Failed to fetch import history' })
      });

      render(<ImportHistoryCard />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to load import history',
          expect.any(Object)
        );
      });
    });

    it('handles network errors gracefully', async () => {
      const { toast } = require('sonner');
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<ImportHistoryCard />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Failed to load import history',
          expect.objectContaining({
            description: 'Network error'
          })
        );
      });
    });
  });

  describe('Date Formatting', () => {
    it('formats dates correctly', async () => {
      render(<ImportHistoryCard />);

      await waitFor(() => {
        // Check for formatted date (e.g., "Jan 15, 2025")
        expect(screen.getByText(/Jan 15, 2025/i)).toBeInTheDocument();
      });
    });
  });
});
