import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ExcelPreviewDialog } from '@/components/dashboard/ExcelPreviewDialog';
import type { ValidationResult } from '@/lib/services/ImportValidationService';
import type { ParseResult } from '@/lib/services/ExcelParserService';

describe('ExcelPreviewDialog', () => {
  const mockValidationResult: ValidationResult = {
    valid: true,
    rows: [
      {
        rowNumber: 1,
        valid: true,
        errors: [],
        warnings: [],
        data: { companyName: 'Test Company 1', email: 'test1@example.com', phone: '123-456-7890' }
      },
      {
        rowNumber: 2,
        valid: true,
        errors: [],
        warnings: [
          {
            field: 'website',
            message: 'Website URL should include protocol (http:// or https://)',
            rowNumber: 2,
            severity: 'WARNING' as const,
            value: 'example.com'
          }
        ],
        data: { companyName: 'Test Company 2', email: 'test2@example.com', website: 'example.com' }
      },
      {
        rowNumber: 3,
        valid: false,
        errors: [
          {
            field: 'email',
            message: 'Invalid email format',
            rowNumber: 3,
            severity: 'ERROR' as const,
            value: 'invalid-email'
          }
        ],
        warnings: [],
        data: { companyName: 'Test Company 3', email: 'invalid-email' }
      }
    ],
    summary: {
      totalRows: 3,
      validRows: 2,
      errorRows: 1,
      warningRows: 1,
      totalErrors: 1,
      totalWarnings: 1
    },
    errorsByField: { email: 1 }
  };

  const mockParseResult: ParseResult = {
    success: true,
    rows: mockValidationResult.rows.map(row => ({
      rowNumber: row.rowNumber,
      data: row.data
    })),
    metadata: {
      filename: 'test-data.xlsx',
      rowCount: 3,
      columnCount: 3
    }
  };

  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    validationResult: mockValidationResult,
    parseResult: mockParseResult,
    isLoading: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders dialog when open', () => {
      render(<ExcelPreviewDialog {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Import Preview')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(<ExcelPreviewDialog {...defaultProps} open={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders summary section with correct stats', () => {
      render(<ExcelPreviewDialog {...defaultProps} />);

      expect(screen.getByText('Total Rows')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      
      expect(screen.getByText('Valid Rows')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      
      expect(screen.getByText('Errors')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      
      expect(screen.getByText('Warnings')).toBeInTheDocument();
    });

    it('renders three tabs', () => {
      render(<ExcelPreviewDialog {...defaultProps} />);

      expect(screen.getByRole('tab', { name: /data preview/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /validation errors/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /changes/i })).toBeInTheDocument();
    });

    it('displays error count badge on validation errors tab', () => {
      render(<ExcelPreviewDialog {...defaultProps} />);

      const errorsTab = screen.getByRole('tab', { name: /validation errors/i });
      expect(errorsTab).toHaveTextContent('1');
    });

    it('renders cancel and confirm buttons', () => {
      render(<ExcelPreviewDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /confirm import/i })).toBeInTheDocument();
    });
  });

  describe('Data Preview Tab', () => {
    it('displays data preview table', () => {
      render(<ExcelPreviewDialog {...defaultProps} />);

      expect(screen.getByText('companyName')).toBeInTheDocument();
      expect(screen.getByText('email')).toBeInTheDocument();
      expect(screen.getByText('Test Company 1')).toBeInTheDocument();
      expect(screen.getByText('test1@example.com')).toBeInTheDocument();
    });

    it('highlights rows with errors', () => {
      render(<ExcelPreviewDialog {...defaultProps} />);

      const errorRow = screen.getByText('Test Company 3').closest('tr');
      expect(errorRow).toHaveClass('bg-red-50');
    });

    it('displays row numbers in preview', () => {
      render(<ExcelPreviewDialog {...defaultProps} />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('shows empty state when no data', () => {
      const emptyParseResult: ParseResult = {
        success: true,
        rows: [],
        metadata: {
          filename: 'empty.xlsx',
          rowCount: 0,
          columnCount: 0
        }
      };

      const emptyValidationResult: ValidationResult = {
        valid: true,
        rows: [],
        summary: {
          totalRows: 0,
          validRows: 0,
          errorRows: 0,
          warningRows: 0,
          totalErrors: 0,
          totalWarnings: 0
        },
        errorsByField: {}
      };

      render(
        <ExcelPreviewDialog
          {...defaultProps}
          parseResult={emptyParseResult}
          validationResult={emptyValidationResult}
        />
      );

      expect(screen.getByText('No data to preview')).toBeInTheDocument();
    });
  });

  describe('Validation Errors Tab', () => {
    it('switches to validation errors tab', () => {
      render(<ExcelPreviewDialog {...defaultProps} />);

      const errorsTab = screen.getByRole('tab', { name: /validation errors/i });
      fireEvent.click(errorsTab);

      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });

    it('displays errors with severity badges', () => {
      render(<ExcelPreviewDialog {...defaultProps} />);

      const errorsTab = screen.getByRole('tab', { name: /validation errors/i });
      fireEvent.click(errorsTab);

      expect(screen.getByText('ERROR')).toBeInTheDocument();
      expect(screen.getByText('WARNING')).toBeInTheDocument();
    });

    it('displays error details', () => {
      render(<ExcelPreviewDialog {...defaultProps} />);

      const errorsTab = screen.getByRole('tab', { name: /validation errors/i });
      fireEvent.click(errorsTab);

      expect(screen.getByText('email')).toBeInTheDocument();
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      expect(screen.getByText('invalid-email')).toBeInTheDocument();
    });

    it('shows empty state when no errors', () => {
      const noErrorsResult: ValidationResult = {
        valid: true,
        rows: [
          {
            rowNumber: 1,
            valid: true,
            errors: [],
            warnings: [],
            data: { companyName: 'Test' }
          }
        ],
        summary: {
          totalRows: 1,
          validRows: 1,
          errorRows: 0,
          warningRows: 0,
          totalErrors: 0,
          totalWarnings: 0
        },
        errorsByField: {}
      };

      render(
        <ExcelPreviewDialog
          {...defaultProps}
          validationResult={noErrorsResult}
        />
      );

      const errorsTab = screen.getByRole('tab', { name: /validation errors/i });
      fireEvent.click(errorsTab);

      expect(screen.getByText('No validation errors found')).toBeInTheDocument();
    });
  });

  describe('Changes Tab', () => {
    it('switches to changes tab', () => {
      render(<ExcelPreviewDialog {...defaultProps} />);

      const changesTab = screen.getByRole('tab', { name: /changes/i });
      fireEvent.click(changesTab);

      expect(screen.getByText('Row')).toBeInTheDocument();
      expect(screen.getByText('Field')).toBeInTheDocument();
      expect(screen.getByText('Old Value')).toBeInTheDocument();
      expect(screen.getByText('New Value')).toBeInTheDocument();
    });

    it('displays change records', () => {
      render(<ExcelPreviewDialog {...defaultProps} />);

      const changesTab = screen.getByRole('tab', { name: /changes/i });
      fireEvent.click(changesTab);

      expect(screen.getByText('companyName')).toBeInTheDocument();
    });

    it('shows empty state when no changes', () => {
      const emptyParseResult: ParseResult = {
        success: true,
        rows: [],
        metadata: {
          filename: 'empty.xlsx',
          rowCount: 0,
          columnCount: 0
        }
      };

      const emptyValidationResult: ValidationResult = {
        valid: true,
        rows: [],
        summary: {
          totalRows: 0,
          validRows: 0,
          errorRows: 0,
          warningRows: 0,
          totalErrors: 0,
          totalWarnings: 0
        },
        errorsByField: {}
      };

      render(
        <ExcelPreviewDialog
          {...defaultProps}
          parseResult={emptyParseResult}
          validationResult={emptyValidationResult}
        />
      );

      const changesTab = screen.getByRole('tab', { name: /changes/i });
      fireEvent.click(changesTab);

      expect(screen.getByText('No changes detected')).toBeInTheDocument();
    });
  });

  describe('Button Actions', () => {
    it('calls onClose when cancel button is clicked', () => {
      const onClose = jest.fn();
      render(<ExcelPreviewDialog {...defaultProps} onClose={onClose} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onConfirm when confirm button is clicked', () => {
      const onConfirm = jest.fn();
      render(<ExcelPreviewDialog {...defaultProps} onConfirm={onConfirm} />);

      const confirmButton = screen.getByRole('button', { name: /confirm import/i });
      fireEvent.click(confirmButton);

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('disables confirm button when validation has errors', () => {
      const invalidResult: ValidationResult = {
        ...mockValidationResult,
        valid: false
      };

      render(
        <ExcelPreviewDialog
          {...defaultProps}
          validationResult={invalidResult}
        />
      );

      const confirmButton = screen.getByRole('button', { name: /confirm import/i });
      expect(confirmButton).toBeDisabled();
    });

    it('enables confirm button when validation is successful', () => {
      const validResult: ValidationResult = {
        ...mockValidationResult,
        valid: true
      };

      render(
        <ExcelPreviewDialog
          {...defaultProps}
          validationResult={validResult}
        />
      );

      const confirmButton = screen.getByRole('button', { name: /confirm import/i });
      expect(confirmButton).not.toBeDisabled();
    });

    it('disables buttons during loading', () => {
      render(<ExcelPreviewDialog {...defaultProps} isLoading={true} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      const confirmButton = screen.getByRole('button', { name: /importing/i });

      expect(cancelButton).toBeDisabled();
      expect(confirmButton).toBeDisabled();
    });

    it('shows loading text on confirm button when importing', () => {
      render(<ExcelPreviewDialog {...defaultProps} isLoading={true} />);

      expect(screen.getByText('Importing...')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper dialog role', () => {
      render(<ExcelPreviewDialog {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<ExcelPreviewDialog {...defaultProps} />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /confirm import/i })).toBeInTheDocument();
    });

    it('has accessible tab navigation', () => {
      render(<ExcelPreviewDialog {...defaultProps} />);

      expect(screen.getByRole('tab', { name: /data preview/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /validation errors/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /changes/i })).toBeInTheDocument();
    });
  });
});
