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
    it('renders ImportHistoryCard with title and description', () => {
      render(<ImportHistoryCard />);

      expect(screen.getByText('Import History')).toBeInTheDocument();
      expect(screen.getByText(/View past import operations/i)).toBeInTheDocument();
    });

    it('shows loading state initially', () => {
      render(<ImportHistoryCard />);

      // Look for Loader2 icon by its styling
      const loaders = document.querySelectorAll('[class*="animate-spin"]');
      expect(loaders.length).toBeGreaterThan(0);
    });

    it('displays import history data after loading', async () => {
      render(<ImportHistoryCard />);

      // Check for formatted date instead of filename
      await waitFor(() => {
        expect(screen.getByText(/Jan 15, 2025/i)).toBeInTheDocument();
      }, { timeout: 2000 });

      // Use getAllByText for "100" as it appears multiple times in the table
      const rowCounts = screen.getAllByText('100');
      expect(rowCounts.length).toBeGreaterThan(0);
      
      expect(screen.getByText('45')).toBeInTheDocument(); // successful rows
    });
  });

  describe('Status Badges', () => {
    it('displays success badge with correct styling', async () => {
      render(<ImportHistoryCard />);

      await waitFor(() => {
        const successBadges = screen.getAllByText('Success');
        expect(successBadges.length).toBeGreaterThan(0);
      }, { timeout: 2000 });
    });

    it('displays partial badge with correct styling', async () => {
      render(<ImportHistoryCard />);

      await waitFor(() => {
        expect(screen.getByText('Partial')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('displays failed badge with correct styling', async () => {
      render(<ImportHistoryCard />);

      await waitFor(() => {
        // Use getAllByText as "Failed" appears in both badge and table header
        const failedElements = screen.getAllByText('Failed');
        expect(failedElements.length).toBeGreaterThan(0);
      }, { timeout: 2000 });
    });
  });

  describe('Pagination', () => {
    it('displays pagination information', async () => {
      // Mock data with multiple pages to show pagination
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
        expect(screen.getByText(/Page 1 of 2/i)).toBeInTheDocument();
        expect(screen.getByText(/3 total imports/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('disables previous button on first page', async () => {
      // Mock data with multiple pages
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
        const prevButton = screen.getByRole('button', { name: /previous/i });
        expect(prevButton).toBeDisabled();
      }, { timeout: 2000 });
    });

    it('disables next button on last page', async () => {
      // Mock data on last page
      const lastPageData = {
        ...mockHistoryData,
        pagination: {
          ...mockHistoryData.pagination,
          page: 2,
          totalPages: 2,
          hasNextPage: false,
          hasPrevPage: true,
          prevPage: 1,
          nextPage: null
        }
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => lastPageData
      });

      render(<ImportHistoryCard />);

      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /next/i });
        expect(nextButton).toBeDisabled();
      }, { timeout: 2000 });
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
      }, { timeout: 2000 });

      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('page=2'),
          expect.any(Object)
        );
      }, { timeout: 2000 });
    });
  });

  describe('Details Dialog', () => {
    it('opens details dialog when clicking Details button', async () => {
      render(<ImportHistoryCard />);

      await waitFor(() => {
        expect(screen.getByText(/Jan 15, 2025/i)).toBeInTheDocument();
      }, { timeout: 2000 });

      const detailsButtons = screen.getAllByRole('button', { name: /details/i });
      fireEvent.click(detailsButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Import Details')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('displays summary information in dialog', async () => {
      render(<ImportHistoryCard />);

      await waitFor(() => {
        expect(screen.getByText(/Jan 15, 2025/i)).toBeInTheDocument();
      }, { timeout: 2000 });

      const detailsButtons = screen.getAllByRole('button', { name: /details/i });
      fireEvent.click(detailsButtons[0]);

      await waitFor(() => {
        // Filename is shown in dialog
        expect(screen.getAllByText(/vendor-data.xlsx/i).length).toBeGreaterThan(0);
      }, { timeout: 2000 });
    });

    it('displays errors in dialog when present', async () => {
      render(<ImportHistoryCard />);

      await waitFor(() => {
        expect(screen.getByText(/Jan 13, 2025/i)).toBeInTheDocument();
      }, { timeout: 2000 });

      const detailsButtons = screen.getAllByRole('button', { name: /details/i });
      fireEvent.click(detailsButtons[2]); // Click on failed import

      await waitFor(() => {
        expect(screen.getByText(/Required field missing/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('displays changes in dialog when present', async () => {
      render(<ImportHistoryCard />);

      await waitFor(() => {
        expect(screen.getByText(/Jan 15, 2025/i)).toBeInTheDocument();
      }, { timeout: 2000 });

      const detailsButtons = screen.getAllByRole('button', { name: /details/i });
      fireEvent.click(detailsButtons[0]); // Click on success import

      await waitFor(() => {
        expect(screen.getByText(/Old Name/i)).toBeInTheDocument();
        expect(screen.getByText(/New Name/i)).toBeInTheDocument();
      }, { timeout: 2000 });
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
      }, { timeout: 2000 });
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
      }, { timeout: 2000 });
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
      }, { timeout: 2000 });
    });
  });

  describe('Date Formatting', () => {
    it('formats dates correctly', async () => {
      render(<ImportHistoryCard />);

      await waitFor(() => {
        // Check for formatted date (e.g., "Jan 15, 2025")
        expect(screen.getByText(/Jan 15, 2025/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });
});
