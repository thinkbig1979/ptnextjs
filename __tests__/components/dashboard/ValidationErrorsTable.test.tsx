import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ValidationErrorsTable, type ValidationError } from '@/components/dashboard/ValidationErrorsTable';

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

const { toast } = require('sonner');

describe('ValidationErrorsTable', () => {
  const mockErrors: ValidationError[] = [
    {
      row: 1,
      field: 'email',
      code: 'INVALID_FORMAT',
      message: 'Email format is invalid',
      suggestion: 'Use format: user@example.com',
      severity: 'error',
      value: 'invalid-email'
    },
    {
      row: 2,
      field: 'companyName',
      code: 'REQUIRED_FIELD',
      message: 'Company name is required',
      suggestion: 'Provide a company name',
      severity: 'error',
      value: ''
    },
    {
      row: 3,
      field: 'phone',
      code: 'INVALID_FORMAT',
      message: 'Phone number format is invalid',
      severity: 'error',
      value: '123'
    }
  ];

  const mockWarnings: ValidationError[] = [
    {
      row: 1,
      field: 'website',
      code: 'MISSING_PROTOCOL',
      message: 'Website should include protocol',
      suggestion: 'Add http:// or https://',
      severity: 'warning',
      value: 'example.com'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(() => Promise.resolve())
      }
    });
  });

  describe('Rendering', () => {
    it('renders validation errors table', () => {
      render(<ValidationErrorsTable errors={mockErrors} warnings={[]} />);
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('displays error messages', () => {
      render(<ValidationErrorsTable errors={mockErrors} warnings={[]} />);
      expect(screen.getByText('Email format is invalid')).toBeInTheDocument();
    });

    it('displays severity badges', () => {
      render(<ValidationErrorsTable errors={mockErrors} warnings={mockWarnings} />);
      const errorBadges = screen.getAllByText('Error');
      expect(errorBadges.length).toBe(3);
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no issues', () => {
      render(<ValidationErrorsTable errors={[]} warnings={[]} />);
      expect(screen.getByText('No Validation Issues')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('sorts by row number', () => {
      render(<ValidationErrorsTable errors={mockErrors} warnings={[]} />);
      const rowSortButton = screen.getByRole('button', { name: /row/i });
      fireEvent.click(rowSortButton);
      expect(screen.getAllByRole('row').length).toBeGreaterThan(0);
    });
  });

  describe('Export', () => {
    it('exports to clipboard', async () => {
      render(<ValidationErrorsTable errors={mockErrors} warnings={[]} />);
      const exportButton = screen.getByRole('button', { name: /export csv/i });
      fireEvent.click(exportButton);
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
      });
    });
  });
});
