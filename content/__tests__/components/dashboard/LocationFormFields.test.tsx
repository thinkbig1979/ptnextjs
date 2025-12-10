import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LocationFormFields } from '@/components/dashboard/LocationFormFields';
import { VendorLocation } from '@/lib/types';

// Mock dependencies
jest.mock('@/components/ui/sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('@/components/vendor/GeocodingButton', () => ({
  GeocodingButton: ({ onSuccess }: any) => (
    <button
      data-testid="geocoding-button"
      onClick={() => onSuccess(43.7384, 7.4246)}
    >
      Get Coordinates
    </button>
  )
}));

describe('LocationFormFields', () => {
  const mockLocation: VendorLocation = {
    id: 'loc-1',
    address: '123 Main St',
    city: 'Monaco',
    country: 'Monaco',
    postalCode: '98000',
    locationName: 'Monaco Office',
    latitude: 43.7384,
    longitude: 7.4246,
    isHQ: true
  };

  const mockOnChange = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Form Field Rendering', () => {
    it('renders all location form fields', () => {
      render(
        <LocationFormFields
          location={mockLocation}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
          isHQ={true}
          canEdit={true}
        />
      );

      expect(screen.getByLabelText(/location name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/postal code/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/latitude/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/longitude/i)).toBeInTheDocument();
    });

    it('displays location data in form fields', () => {
      render(
        <LocationFormFields
          location={mockLocation}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
          isHQ={true}
          canEdit={true}
        />
      );

      expect(screen.getByDisplayValue('123 Main St')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Monaco Office')).toBeInTheDocument();
      expect(screen.getByDisplayValue('43.7384')).toBeInTheDocument();
      expect(screen.getByDisplayValue('7.4246')).toBeInTheDocument();
    });

    it('renders geocoding button', () => {
      render(
        <LocationFormFields
          location={mockLocation}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
          isHQ={false}
          canEdit={true}
        />
      );

      expect(screen.getByTestId('geocoding-button')).toBeInTheDocument();
    });
  });

  describe('HQ Radio Button', () => {
    it('renders HQ designation radio button', () => {
      render(
        <LocationFormFields
          location={mockLocation}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
          isHQ={true}
          canEdit={true}
        />
      );

      expect(screen.getByRole('radio', { name: /headquarters/i })).toBeInTheDocument();
    });

    it('checks HQ radio when isHQ is true', () => {
      render(
        <LocationFormFields
          location={mockLocation}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
          isHQ={true}
          canEdit={true}
        />
      );

      const hqRadio = screen.getByRole('radio', { name: /headquarters/i });
      expect(hqRadio).toBeChecked();
    });

    it('unchecks HQ radio when isHQ is false', () => {
      render(
        <LocationFormFields
          location={{ ...mockLocation, isHQ: false }}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
          isHQ={false}
          canEdit={true}
        />
      );

      const hqRadio = screen.getByRole('radio', { name: /headquarters/i });
      expect(hqRadio).not.toBeChecked();
    });

    it('calls onChange when HQ radio clicked', () => {
      render(
        <LocationFormFields
          location={{ ...mockLocation, isHQ: false }}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
          isHQ={false}
          canEdit={true}
        />
      );

      const hqRadio = screen.getByRole('radio', { name: /headquarters/i });
      fireEvent.click(hqRadio);

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('Form Field Validation', () => {
    it('validates latitude range (-90 to 90)', async () => {
      render(
        <LocationFormFields
          location={mockLocation}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
          isHQ={false}
          canEdit={true}
        />
      );

      const latInput = screen.getByLabelText(/latitude/i);

      // Test invalid latitude > 90
      fireEvent.change(latInput, { target: { value: '95' } });
      fireEvent.blur(latInput);

      await waitFor(() => {
        expect(screen.getByText(/latitude must be between -90 and 90/i)).toBeInTheDocument();
      });
    });

    it('validates longitude range (-180 to 180)', async () => {
      render(
        <LocationFormFields
          location={mockLocation}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
          isHQ={false}
          canEdit={true}
        />
      );

      const lngInput = screen.getByLabelText(/longitude/i);

      // Test invalid longitude > 180
      fireEvent.change(lngInput, { target: { value: '185' } });
      fireEvent.blur(lngInput);

      await waitFor(() => {
        expect(screen.getByText(/longitude must be between -180 and 180/i)).toBeInTheDocument();
      });
    });

    it('validates locationName max length (100 characters)', async () => {
      render(
        <LocationFormFields
          location={mockLocation}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
          isHQ={false}
          canEdit={true}
        />
      );

      const nameInput = screen.getByLabelText(/location name/i);
      const longName = 'A'.repeat(101);

      fireEvent.change(nameInput, { target: { value: longName } });
      fireEvent.blur(nameInput);

      await waitFor(() => {
        expect(screen.getByText(/location name must be 100 characters or less/i)).toBeInTheDocument();
      });
    });

    it('validates address max length (200 characters)', async () => {
      render(
        <LocationFormFields
          location={mockLocation}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
          isHQ={false}
          canEdit={true}
        />
      );

      const addressInput = screen.getByLabelText(/address/i);
      const longAddress = 'A'.repeat(201);

      fireEvent.change(addressInput, { target: { value: longAddress } });
      fireEvent.blur(addressInput);

      await waitFor(() => {
        expect(screen.getByText(/address must be 200 characters or less/i)).toBeInTheDocument();
      });
    });

    it('validates required fields', async () => {
      render(
        <LocationFormFields
          location={{ ...mockLocation, address: '' }}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
          isHQ={false}
          canEdit={true}
        />
      );

      const addressInput = screen.getByLabelText(/address/i);
      fireEvent.blur(addressInput);

      await waitFor(() => {
        expect(screen.getByText(/address is required/i)).toBeInTheDocument();
      });
    });

    it('accepts valid coordinate values', () => {
      render(
        <LocationFormFields
          location={mockLocation}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
          isHQ={false}
          canEdit={true}
        />
      );

      const latInput = screen.getByLabelText(/latitude/i);
      const lngInput = screen.getByLabelText(/longitude/i);

      fireEvent.change(latInput, { target: { value: '45.5' } });
      fireEvent.change(lngInput, { target: { value: '-122.3' } });
      fireEvent.blur(latInput);
      fireEvent.blur(lngInput);

      // No error messages should appear
      expect(screen.queryByText(/latitude must be between/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/longitude must be between/i)).not.toBeInTheDocument();
    });
  });

  describe('Geocoding Integration', () => {
    it('updates coordinates when geocoding succeeds', async () => {
      render(
        <LocationFormFields
          location={mockLocation}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
          isHQ={false}
          canEdit={true}
        />
      );

      const geocodingButton = screen.getByTestId('geocoding-button');
      fireEvent.click(geocodingButton);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            latitude: 43.7384,
            longitude: 7.4246
          })
        );
      });
    });
  });

  describe('Field Interactions', () => {
    it('calls onChange when address field changes', () => {
      render(
        <LocationFormFields
          location={mockLocation}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
          isHQ={false}
          canEdit={true}
        />
      );

      const addressInput = screen.getByLabelText(/address/i);
      fireEvent.change(addressInput, { target: { value: '456 New St' } });

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('calls onChange when city field changes', () => {
      render(
        <LocationFormFields
          location={mockLocation}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
          isHQ={false}
          canEdit={true}
        />
      );

      const cityInput = screen.getByLabelText(/city/i);
      fireEvent.change(cityInput, { target: { value: 'New City' } });

      expect(mockOnChange).toHaveBeenCalled();
    });

    it('calls onDelete when delete button clicked', () => {
      render(
        <LocationFormFields
          location={mockLocation}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
          isHQ={false}
          canEdit={true}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalled();
    });

    it('disables delete button for HQ location', () => {
      render(
        <LocationFormFields
          location={mockLocation}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
          isHQ={true}
          canEdit={true}
        />
      );

      const deleteButton = screen.queryByRole('button', { name: /delete/i });
      expect(deleteButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has accessible labels for all form fields', () => {
      render(
        <LocationFormFields
          location={mockLocation}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
          isHQ={false}
          canEdit={true}
        />
      );

      expect(screen.getByLabelText(/location name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/latitude/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/longitude/i)).toBeInTheDocument();
    });

    it('supports keyboard navigation between fields', () => {
      render(
        <LocationFormFields
          location={mockLocation}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
          isHQ={false}
          canEdit={true}
        />
      );

      const addressInput = screen.getByLabelText(/address/i);
      addressInput.focus();
      expect(addressInput).toHaveFocus();
    });

    it('has ARIA attributes for validation errors', async () => {
      render(
        <LocationFormFields
          location={{ ...mockLocation, address: '' }}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
          isHQ={false}
          canEdit={true}
        />
      );

      const addressInput = screen.getByLabelText(/address/i);
      fireEvent.blur(addressInput);

      await waitFor(() => {
        expect(addressInput).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });

  describe('Read-Only Mode', () => {
    it('disables all fields when canEdit is false', () => {
      render(
        <LocationFormFields
          location={mockLocation}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
          isHQ={false}
          canEdit={false}
        />
      );

      expect(screen.getByLabelText(/address/i)).toBeDisabled();
      expect(screen.getByLabelText(/city/i)).toBeDisabled();
      expect(screen.getByLabelText(/country/i)).toBeDisabled();
    });

    it('hides delete button when canEdit is false', () => {
      render(
        <LocationFormFields
          location={mockLocation}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
          isHQ={false}
          canEdit={false}
        />
      );

      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('renders mobile-friendly layout on small screens', () => {
      // Mock window.matchMedia for mobile viewport
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(max-width: 768px)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(
        <LocationFormFields
          location={mockLocation}
          onChange={mockOnChange}
          onDelete={mockOnDelete}
          isHQ={false}
          canEdit={true}
        />
      );

      // Form should stack vertically on mobile
      const formContainer = screen.getByLabelText(/address/i).closest('div');
      // Check that container has proper spacing for mobile layout
      expect(formContainer).toHaveClass('space-y-2');
    });
  });
});
