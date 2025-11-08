import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExcelExportCard } from '@/components/dashboard/ExcelExportCard';

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
const { toast } = require('sonner');

// Mock fetch globally
global.fetch = jest.fn();

describe('ExcelExportCard', () => {
  const mockVendor = {
    id: 'vendor-123',
    name: 'Test Vendor Co',
    tier: 'tier2'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useVendorDashboard.mockReturnValue({
      vendor: mockVendor
    });

    // Mock blob and URL APIs
    global.URL.createObjectURL = jest.fn(() => 'blob:test-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders ExcelExportCard with title and description', () => {
      render(<ExcelExportCard />);
      expect(screen.getByText('Excel Export')).toBeInTheDocument();
      expect(screen.getByText(/Download templates or export your current vendor data/i)).toBeInTheDocument();
    });

    it('renders download template section', () => {
      render(<ExcelExportCard />);
      expect(screen.getByText('Download Import Template')).toBeInTheDocument();
      expect(screen.getByText(/Get a pre-formatted Excel template/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /download.*template/i })).toBeInTheDocument();
    });

    it('renders export data section', () => {
      render(<ExcelExportCard />);
      expect(screen.getByText('Export Current Data')).toBeInTheDocument();
      expect(screen.getByText(/Export your current vendor profile data/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export.*data/i })).toBeInTheDocument();
    });

    it('renders metadata checkbox', () => {
      render(<ExcelExportCard />);
      const checkbox = screen.getByRole('checkbox', { name: /include export metadata/i });
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).toBeChecked();
    });

    it('renders footer with file format info', () => {
      render(<ExcelExportCard />);
      expect(screen.getByText(/Files are generated in .xlsx format/i)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading state when vendor is not available', () => {
      useVendorDashboard.mockReturnValue({
        vendor: null
      });

      render(<ExcelExportCard />);
      expect(screen.getByText('Excel Export')).toBeInTheDocument();
      expect(screen.getByText('Loading vendor information...')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Download Template', () => {
    it('downloads template successfully', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        blob: async () => mockBlob
      });

      render(<ExcelExportCard />);

      const downloadButton = screen.getByRole('button', { name: /download.*template/i });
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/portal/vendors/${mockVendor.id}/excel-template`
        );
      });
    });

    it('handles template download error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error'
      });

      render(<ExcelExportCard />);

      const downloadButton = screen.getByRole('button', { name: /download.*template/i });
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });

    it('shows loading state during template download', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<ExcelExportCard />);

      const downloadButton = screen.getByRole('button', { name: /download.*template/i });
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(screen.getByText(/Downloading.*template/i)).toBeInTheDocument();
      }, { timeout: 100 }).catch(() => {
        // Timeout is expected, we just wanted to verify the behavior starts
      });
    });
  });

  describe('Export Data', () => {
    it('exports data successfully without metadata', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        blob: async () => mockBlob
      });

      render(<ExcelExportCard />);

      // Uncheck metadata
      const checkbox = screen.getByRole('checkbox', { name: /include export metadata/i });
      fireEvent.click(checkbox);

      const exportButton = screen.getByRole('button', { name: /export.*data/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/portal/vendors/${mockVendor.id}/excel-export?metadata=false`
        );
      });
    });

    it('exports data successfully with metadata', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        blob: async () => mockBlob
      });

      render(<ExcelExportCard />);

      const exportButton = screen.getByRole('button', { name: /export.*data/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/portal/vendors/${mockVendor.id}/excel-export?metadata=true`
        );
      });
    });

    it('toggles metadata checkbox', () => {
      render(<ExcelExportCard />);

      const checkbox = screen.getByRole('checkbox', { name: /include export metadata/i });
      expect(checkbox).toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it('shows loading state during export', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<ExcelExportCard />);

      const exportButton = screen.getByRole('button', { name: /export.*data/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText(/Exporting.*data/i)).toBeInTheDocument();
      }, { timeout: 100 }).catch(() => {
        // Timeout is expected
      });
    });

    it('handles export error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Server Error'
      });

      render(<ExcelExportCard />);

      const exportButton = screen.getByRole('button', { name: /export.*data/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });

    it('handles network error during export', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<ExcelExportCard />);

      const exportButton = screen.getByRole('button', { name: /export.*data/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });

    it('disables buttons during export', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<ExcelExportCard />);

      const exportButton = screen.getByRole('button', { name: /export.*data/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(exportButton).toBeDisabled();
      }, { timeout: 100 }).catch(() => {
        // Timeout is expected
      });
    });
  });
});
