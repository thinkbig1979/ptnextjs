import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExcelImportCard } from '@/components/dashboard/ExcelImportCard';

// Mock dependencies
jest.mock('@/lib/context/VendorDashboardContext', () => ({
  useVendorDashboard: jest.fn()
}));

jest.mock('@/hooks/useTierAccess', () => ({
  useTierAccess: jest.fn()
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn()
  }
}));

jest.mock('@/components/dashboard/UpgradePromptCard', () => ({
  UpgradePromptCard: jest.fn(() => <div>Upgrade to access this feature</div>)
}));

const { useVendorDashboard } = require('@/lib/context/VendorDashboardContext');
const { useTierAccess } = require('@/hooks/useTierAccess');
const { toast } = require('sonner');

// Mock fetch globally
global.fetch = jest.fn();

describe('ExcelImportCard', () => {
  const mockVendor = {
    id: 'vendor-123',
    name: 'Test Vendor',
    tier: 'tier2'
  };

  const mockValidationResult = {
    valid: true,
    rows: [
      {
        rowNumber: 1,
        valid: true,
        errors: [],
        warnings: [],
        data: { companyName: 'Test Company', email: 'test@example.com' }
      },
      {
        rowNumber: 2,
        valid: true,
        errors: [],
        warnings: [],
        data: { companyName: 'Another Company', email: 'another@example.com' }
      }
    ],
    summary: {
      totalRows: 2,
      validRows: 2,
      errorRows: 0,
      warningRows: 0,
      totalErrors: 0,
      totalWarnings: 0
    },
    errorsByField: {}
  };

  const mockParseResult = {
    success: true,
    rows: mockValidationResult.rows,
    metadata: {
      filename: 'test.xlsx',
      rowCount: 2,
      columnCount: 2
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    useVendorDashboard.mockReturnValue({
      vendor: mockVendor
    });

    useTierAccess.mockReturnValue({
      hasAccess: true,
      tier: 'tier2',
      upgradePath: 'tier2',
      feature: 'excel-import'
    });
  });

  describe('Rendering', () => {
    it('renders ExcelImportCard with title and description', () => {
      render(<ExcelImportCard />);

      expect(screen.getByText('Excel Import')).toBeInTheDocument();
      expect(screen.getByText(/Upload an Excel file to import or update/i)).toBeInTheDocument();
    });

    it('renders file upload dropzone in idle state', () => {
      render(<ExcelImportCard />);

      expect(screen.getByText(/Drop Excel file here or click to browse/i)).toBeInTheDocument();
      expect(screen.getByText(/Maximum file size: 5MB/i)).toBeInTheDocument();
    });

    it('renders upload and validate button', () => {
      render(<ExcelImportCard />);

      expect(screen.getByRole('button', { name: /upload and validate/i })).toBeInTheDocument();
    });
  });

  describe('Tier Access', () => {
    it('shows upgrade prompt when user lacks access', () => {
      useTierAccess.mockReturnValue({
        hasAccess: false,
        tier: 'tier1',
        upgradePath: 'tier2',
        feature: 'excel-import'
      });

      render(<ExcelImportCard />);

      expect(screen.getByText('Upgrade to access this feature')).toBeInTheDocument();
      expect(screen.queryByText(/Upload an Excel file/i)).not.toBeInTheDocument();
    });

    it('shows main card when user has access', () => {
      useTierAccess.mockReturnValue({
        hasAccess: true,
        tier: 'tier2',
        upgradePath: 'tier2',
        feature: 'excel-import'
      });

      render(<ExcelImportCard />);

      expect(screen.queryByText('Upgrade to access this feature')).not.toBeInTheDocument();
      expect(screen.getByText(/Upload an Excel file/i)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('shows loading state when vendor is not available', () => {
      useVendorDashboard.mockReturnValue({
        vendor: null
      });

      render(<ExcelImportCard />);

      expect(screen.getByText('Excel Import')).toBeInTheDocument();
      expect(screen.getByText('Loading vendor information...')).toBeInTheDocument();
    });
  });

  describe('File Selection', () => {
    it('selects file via file input', async () => {
      render(<ExcelImportCard />);

      const file = new File(['test content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const fileInput = screen.getByRole('button', { name: /upload and validate/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(fileInput, 'files', {
        value: [file]
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByText('test.xlsx')).toBeInTheDocument();
        expect(toast.success).toHaveBeenCalledWith(
          'File selected',
          expect.objectContaining({
            description: 'test.xlsx is ready for upload'
          })
        );
      });
    });

    it('validates file type', async () => {
      render(<ExcelImportCard />);

      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

      const fileInput = screen.getByRole('button', { name: /upload and validate/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(fileInput, 'files', {
        value: [file]
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Invalid file',
          expect.objectContaining({
            description: expect.stringContaining('Invalid file type')
          })
        );
      });
    });

    it('validates file size', async () => {
      render(<ExcelImportCard />);

      // Create a file larger than 5MB
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const fileInput = screen.getByRole('button', { name: /upload and validate/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(fileInput, 'files', {
        value: [largeFile]
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Invalid file',
          expect.objectContaining({
            description: expect.stringContaining('exceeds maximum limit')
          })
        );
      });
    });

    it('displays selected file info', async () => {
      render(<ExcelImportCard />);

      const file = new File(['test content'], 'vendor-data.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const fileInput = screen.getByRole('button', { name: /upload and validate/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(fileInput, 'files', {
        value: [file]
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByText('vendor-data.xlsx')).toBeInTheDocument();
      });
    });

    it('allows removing selected file', async () => {
      render(<ExcelImportCard />);

      const file = new File(['test content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const fileInput = screen.getByRole('button', { name: /upload and validate/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(fileInput, 'files', {
        value: [file]
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByText('test.xlsx')).toBeInTheDocument();
      });

      const removeButton = screen.getByRole('button', { name: /remove/i });
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByText('test.xlsx')).not.toBeInTheDocument();
      });
    });
  });

  describe('Drag and Drop', () => {
    it('handles drag enter event', () => {
      render(<ExcelImportCard />);

      const dropzone = screen.getByText(/Drop Excel file here/i).parentElement;
      
      fireEvent.dragEnter(dropzone!);

      // Dropzone should have dragging styles (checking class changes is fragile, so we just verify no errors)
      expect(dropzone).toBeInTheDocument();
    });

    it('handles drag leave event', () => {
      render(<ExcelImportCard />);

      const dropzone = screen.getByText(/Drop Excel file here/i).parentElement;
      
      fireEvent.dragEnter(dropzone!);
      fireEvent.dragLeave(dropzone!);

      expect(dropzone).toBeInTheDocument();
    });

    it('handles file drop', async () => {
      render(<ExcelImportCard />);

      const file = new File(['test content'], 'dropped.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const dropzone = screen.getByText(/Drop Excel file here/i).parentElement;

      fireEvent.drop(dropzone!, {
        dataTransfer: {
          files: [file]
        }
      });

      await waitFor(() => {
        expect(screen.getByText('dropped.xlsx')).toBeInTheDocument();
      });
    });
  });

  describe('Upload and Validation', () => {
    it('uploads and validates file successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          phase: 'preview',
          parseResult: mockParseResult,
          validationResult: mockValidationResult,
          message: 'Validation successful'
        })
      });

      render(<ExcelImportCard />);

      const file = new File(['test content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const fileInput = screen.getByRole('button', { name: /upload and validate/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(fileInput, 'files', {
        value: [file]
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByText('test.xlsx')).toBeInTheDocument();
      });

      const uploadButton = screen.getByRole('button', { name: /upload and validate/i });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(screen.getByText('Uploading file...')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Validating data...')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Total Rows')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('shows upload progress', async () => {
      (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

      render(<ExcelImportCard />);

      const file = new File(['test content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const fileInput = screen.getByRole('button', { name: /upload and validate/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(fileInput, 'files', {
        value: [file]
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByText('test.xlsx')).toBeInTheDocument();
      });

      const uploadButton = screen.getByRole('button', { name: /upload and validate/i });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(screen.getByText('Uploading file...')).toBeInTheDocument();
        expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
      });
    });

    it('handles validation errors', async () => {
      const errorValidationResult = {
        valid: false,
        rows: [
          {
            rowNumber: 1,
            valid: false,
            errors: [{ field: 'email', message: 'Invalid email format' }],
            warnings: [],
            data: { email: 'invalid' }
          }
        ],
        summary: {
          totalRows: 1,
          validRows: 0,
          errorRows: 1,
          warningRows: 0,
          totalErrors: 1,
          totalWarnings: 0
        },
        errorsByField: { email: 1 }
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          phase: 'preview',
          parseResult: mockParseResult,
          validationResult: errorValidationResult,
          message: 'Validation completed with errors'
        })
      });

      render(<ExcelImportCard />);

      const file = new File(['test content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const fileInput = screen.getByRole('button', { name: /upload and validate/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(fileInput, 'files', {
        value: [file]
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByText('test.xlsx')).toBeInTheDocument();
      });

      const uploadButton = screen.getByRole('button', { name: /upload and validate/i });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(toast.warning).toHaveBeenCalledWith(
          'Validation errors found',
          expect.any(Object)
        );
      }, { timeout: 3000 });
    });

    it('handles upload error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Upload failed' })
      });

      render(<ExcelImportCard />);

      const file = new File(['test content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const fileInput = screen.getByRole('button', { name: /upload and validate/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(fileInput, 'files', {
        value: [file]
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByText('test.xlsx')).toBeInTheDocument();
      });

      const uploadButton = screen.getByRole('button', { name: /upload and validate/i });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Upload failed',
          expect.objectContaining({
            description: 'Upload failed'
          })
        );
      });
    });

    it('disables upload button when no file selected', () => {
      render(<ExcelImportCard />);

      const uploadButton = screen.getByRole('button', { name: /upload and validate/i });
      expect(uploadButton).toBeDisabled();
    });

    it('enables upload button when file is selected', async () => {
      render(<ExcelImportCard />);

      const file = new File(['test content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const fileInput = screen.getByRole('button', { name: /upload and validate/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(fileInput, 'files', {
        value: [file]
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        const uploadButton = screen.getByRole('button', { name: /upload and validate/i });
        expect(uploadButton).not.toBeDisabled();
      });
    });
  });

  describe('Preview State', () => {
    beforeEach(async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          phase: 'preview',
          parseResult: mockParseResult,
          validationResult: mockValidationResult,
          message: 'Validation successful'
        })
      });
    });

    it('displays validation summary', async () => {
      render(<ExcelImportCard />);

      const file = new File(['test content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const fileInput = screen.getByRole('button', { name: /upload and validate/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(fileInput, 'files', {
        value: [file]
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByText('test.xlsx')).toBeInTheDocument();
      });

      const uploadButton = screen.getByRole('button', { name: /upload and validate/i });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(screen.getByText('Total Rows')).toBeInTheDocument();
        expect(screen.getByText('Valid Rows')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('shows cancel button in preview state', async () => {
      render(<ExcelImportCard />);

      const file = new File(['test content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const fileInput = screen.getByRole('button', { name: /upload and validate/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(fileInput, 'files', {
        value: [file]
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByText('test.xlsx')).toBeInTheDocument();
      });

      const uploadButton = screen.getByRole('button', { name: /upload and validate/i });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('shows confirm import button when validation is successful', async () => {
      render(<ExcelImportCard />);

      const file = new File(['test content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const fileInput = screen.getByRole('button', { name: /upload and validate/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(fileInput, 'files', {
        value: [file]
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByText('test.xlsx')).toBeInTheDocument();
      });

      const uploadButton = screen.getByRole('button', { name: /upload and validate/i });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /confirm import/i })).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('cancels preview and returns to idle', async () => {
      render(<ExcelImportCard />);

      const file = new File(['test content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const fileInput = screen.getByRole('button', { name: /upload and validate/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(fileInput, 'files', {
        value: [file]
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByText('test.xlsx')).toBeInTheDocument();
      });

      const uploadButton = screen.getByRole('button', { name: /upload and validate/i });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      }, { timeout: 3000 });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Total Rows')).not.toBeInTheDocument();
        expect(screen.getByText(/Drop Excel file here/i)).toBeInTheDocument();
      });
    });
  });

  describe('Import Execution', () => {
    beforeEach(async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          phase: 'preview',
          parseResult: mockParseResult,
          validationResult: mockValidationResult,
          message: 'Validation successful'
        })
      });
    });

    it('executes import successfully', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            phase: 'preview',
            parseResult: mockParseResult,
            validationResult: mockValidationResult,
            message: 'Validation successful'
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            phase: 'execute',
            executionResult: {
              success: true,
              summary: {
                successCount: 2,
                errorCount: 0,
                warningCount: 0
              },
              changes: [],
              errors: []
            },
            message: 'Import successful'
          })
        });

      render(<ExcelImportCard />);

      const file = new File(['test content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const fileInput = screen.getByRole('button', { name: /upload and validate/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(fileInput, 'files', {
        value: [file]
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByText('test.xlsx')).toBeInTheDocument();
      });

      const uploadButton = screen.getByRole('button', { name: /upload and validate/i });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /confirm import/i })).toBeInTheDocument();
      }, { timeout: 3000 });

      const confirmButton = screen.getByRole('button', { name: /confirm import/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('Importing data...')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Import Completed Successfully!')).toBeInTheDocument();
        expect(toast.success).toHaveBeenCalledWith(
          'Import successful',
          expect.any(Object)
        );
      }, { timeout: 3000 });
    });

    it('shows import another file button after completion', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            phase: 'preview',
            parseResult: mockParseResult,
            validationResult: mockValidationResult,
            message: 'Validation successful'
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            phase: 'execute',
            executionResult: {
              success: true,
              summary: {
                successCount: 2,
                errorCount: 0,
                warningCount: 0
              },
              changes: [],
              errors: []
            },
            message: 'Import successful'
          })
        });

      render(<ExcelImportCard />);

      const file = new File(['test content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const fileInput = screen.getByRole('button', { name: /upload and validate/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(fileInput, 'files', {
        value: [file]
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByText('test.xlsx')).toBeInTheDocument();
      });

      const uploadButton = screen.getByRole('button', { name: /upload and validate/i });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /confirm import/i })).toBeInTheDocument();
      }, { timeout: 3000 });

      const confirmButton = screen.getByRole('button', { name: /confirm import/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /import another file/i })).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('resets state when clicking import another file', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            phase: 'preview',
            parseResult: mockParseResult,
            validationResult: mockValidationResult,
            message: 'Validation successful'
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            phase: 'execute',
            executionResult: {
              success: true,
              summary: {
                successCount: 2,
                errorCount: 0,
                warningCount: 0
              },
              changes: [],
              errors: []
            },
            message: 'Import successful'
          })
        });

      render(<ExcelImportCard />);

      const file = new File(['test content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const fileInput = screen.getByRole('button', { name: /upload and validate/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(fileInput, 'files', {
        value: [file]
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByText('test.xlsx')).toBeInTheDocument();
      });

      const uploadButton = screen.getByRole('button', { name: /upload and validate/i });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /confirm import/i })).toBeInTheDocument();
      }, { timeout: 3000 });

      const confirmButton = screen.getByRole('button', { name: /confirm import/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /import another file/i })).toBeInTheDocument();
      }, { timeout: 3000 });

      const resetButton = screen.getByRole('button', { name: /import another file/i });
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(screen.getByText(/Drop Excel file here/i)).toBeInTheDocument();
        expect(screen.queryByText('Import Completed Successfully!')).not.toBeInTheDocument();
      });
    });

    it('handles import execution error', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            phase: 'preview',
            parseResult: mockParseResult,
            validationResult: mockValidationResult,
            message: 'Validation successful'
          })
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ error: 'Import failed' })
        });

      render(<ExcelImportCard />);

      const file = new File(['test content'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const fileInput = screen.getByRole('button', { name: /upload and validate/i })
        .parentElement?.querySelector('input[type="file"]') as HTMLInputElement;

      Object.defineProperty(fileInput, 'files', {
        value: [file]
      });

      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(screen.getByText('test.xlsx')).toBeInTheDocument();
      });

      const uploadButton = screen.getByRole('button', { name: /upload and validate/i });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /confirm import/i })).toBeInTheDocument();
      }, { timeout: 3000 });

      const confirmButton = screen.getByRole('button', { name: /confirm import/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Import failed',
          expect.objectContaining({
            description: 'Import failed'
          })
        );
      });
    });
  });
});
