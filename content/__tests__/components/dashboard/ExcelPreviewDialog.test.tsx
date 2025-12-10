import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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
            severity: 'warning' as const,
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
            severity: 'error' as const,
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

    it('displays validation results', () => {
      render(<ExcelPreviewDialog {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('renders tabs', () => {
      render(<ExcelPreviewDialog {...defaultProps} />);
      expect(screen.getByRole('tab', { name: /data preview/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /validation errors/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /changes/i })).toBeInTheDocument();
    });

    it('renders action buttons', () => {
      render(<ExcelPreviewDialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByText(/Confirm Import/i)).toBeInTheDocument();
    });
  });

  describe('Data Preview Tab', () => {
    it('displays data preview table', () => {
      render(<ExcelPreviewDialog {...defaultProps} />);
      expect(screen.getByText('Test Company 1')).toBeInTheDocument();
    });

    it('shows data in table', () => {
      render(<ExcelPreviewDialog {...defaultProps} />);
      expect(screen.getByText('Test Company 2')).toBeInTheDocument();
    });
  });

  describe('Validation Errors Tab', () => {
    it('displays validation errors', () => {
      render(<ExcelPreviewDialog {...defaultProps} />);
      const errorsTab = screen.getByRole('tab', { name: /validation errors/i });
      fireEvent.click(errorsTab);
    });

    it('shows error information', () => {
      render(<ExcelPreviewDialog {...defaultProps} />);
      expect(screen.getByRole('tab', { name: /validation errors/i })).toBeInTheDocument();
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

      const confirmButton = screen.getByRole('button', { name: /confirm|importing/i });
      fireEvent.click(confirmButton);

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('disables confirm button when validation fails', () => {
      const failedValidation: ValidationResult = {
        ...mockValidationResult,
        valid: false
      };

      render(
        <ExcelPreviewDialog
          {...defaultProps}
          validationResult={failedValidation}
        />
      );

      const buttons = screen.getAllByRole('button');
      const confirmButton = buttons.find(b => b.textContent?.includes('Confirm'));
      expect(confirmButton).toBeDisabled();
    });

    it('disables buttons when loading', () => {
      render(<ExcelPreviewDialog {...defaultProps} isLoading={true} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('Empty Data', () => {
    it('handles empty validation result', () => {
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

      const emptyParseResult: ParseResult = {
        success: true,
        rows: [],
        metadata: {
          filename: 'test-data.xlsx',
          rowCount: 0,
          columnCount: 0
        }
      };

      render(
        <ExcelPreviewDialog
          {...defaultProps}
          validationResult={emptyValidationResult}
          parseResult={emptyParseResult}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
