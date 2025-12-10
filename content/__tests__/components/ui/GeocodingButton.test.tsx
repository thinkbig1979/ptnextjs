import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GeocodingButton } from '@/components/vendor/GeocodingButton';

// Mock fetch and localStorage before importing the component
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

const { toast } = require('sonner');

describe('GeocodingButton', () => {
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();
  const mockAddress = '123 Main St, Monaco';

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Button Rendering', () => {
    it('renders geocoding button', () => {
      render(
        <GeocodingButton
          address={mockAddress}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByRole('button', { name: /find coordinates/i })).toBeInTheDocument();
    });

    it('displays icon on button', () => {
      render(
        <GeocodingButton
          address={mockAddress}
          onSuccess={mockOnSuccess}
        />
      );

      const button = screen.getByRole('button', { name: /find coordinates/i });
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('is disabled when no address provided', () => {
      render(
        <GeocodingButton
          address=""
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByRole('button', { name: /find coordinates/i })).toBeDisabled();
    });

    it('is enabled when address provided', () => {
      render(
        <GeocodingButton
          address={mockAddress}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByRole('button', { name: /find coordinates/i })).not.toBeDisabled();
    });

    it('shows loading state during geocoding', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          results: [{
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [7.4246, 43.7384]
            },
            properties: {
              name: 'Monaco',
              country: 'Monaco'
            }
          }]
        })
      });

      render(
        <GeocodingButton
          address={mockAddress}
          onSuccess={mockOnSuccess}
        />
      );

      const button = screen.getByRole('button', { name: /find coordinates/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /geocoding/i })).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('API Call Success Path', () => {
    it('calls geocoding API when button clicked', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          results: [{
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [7.4246, 43.7384]
            },
            properties: {
              name: 'Monaco',
              country: 'Monaco'
            }
          }]
        })
      });

      render(
        <GeocodingButton
          address={mockAddress}
          onSuccess={mockOnSuccess}
        />
      );

      const button = screen.getByRole('button', { name: /find coordinates/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('calls onSuccess callback with coordinates', async () => {
      const latitude = 43.7384;
      const longitude = 7.4246;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          results: [{
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            properties: {
              name: 'Monaco',
              country: 'Monaco'
            }
          }]
        })
      });

      render(
        <GeocodingButton
          address={mockAddress}
          onSuccess={mockOnSuccess}
        />
      );

      const button = screen.getByRole('button', { name: /find coordinates/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(latitude, longitude);
      }, { timeout: 3000 });
    });

    it('shows success toast message', async () => {
      const latitude = 43.7384;
      const longitude = 7.4246;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          results: [{
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            properties: {
              name: 'Monaco',
              country: 'Monaco'
            }
          }]
        })
      });

      render(
        <GeocodingButton
          address={mockAddress}
          onSuccess={mockOnSuccess}
        />
      );

      const button = screen.getByRole('button', { name: /find coordinates/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('clears loading state after successful geocoding', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          results: [{
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [7.4246, 43.7384]
            },
            properties: {
              name: 'Monaco',
              country: 'Monaco'
            }
          }]
        })
      });

      render(
        <GeocodingButton
          address={mockAddress}
          onSuccess={mockOnSuccess}
        />
      );

      const button = screen.getByRole('button', { name: /find coordinates/i });
      fireEvent.click(button);

      await waitFor(() => {
        const findButton = screen.queryByRole('button', { name: /find coordinates/i });
        expect(findButton).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('API Call Error Path', () => {
    it('shows error toast on API failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: 'Address not found'
        })
      });

      render(
        <GeocodingButton
          address={mockAddress}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const button = screen.getByRole('button', { name: /find coordinates/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('calls onError callback on failure', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      render(
        <GeocodingButton
          address={mockAddress}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      const button = screen.getByRole('button', { name: /find coordinates/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
      }, { timeout: 3000 });
    });

    it('clears loading state after error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      render(
        <GeocodingButton
          address={mockAddress}
          onSuccess={mockOnSuccess}
        />
      );

      const button = screen.getByRole('button', { name: /find coordinates/i });
      fireEvent.click(button);

      await waitFor(() => {
        const findButton = screen.queryByRole('button', { name: /find coordinates/i });
        expect(findButton).toBeInTheDocument();
        expect(findButton).not.toBeDisabled();
      }, { timeout: 3000 });
    });
  });

  describe('Button Variants and Sizes', () => {
    it('accepts custom variant prop', () => {
      const { container } = render(
        <GeocodingButton
          address={mockAddress}
          onSuccess={mockOnSuccess}
          variant="outline"
        />
      );

      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });

    it('accepts custom size prop', () => {
      const { container } = render(
        <GeocodingButton
          address={mockAddress}
          onSuccess={mockOnSuccess}
          size="lg"
        />
      );

      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });

    it('accepts custom className prop', () => {
      const { container } = render(
        <GeocodingButton
          address={mockAddress}
          onSuccess={mockOnSuccess}
          className="custom-class"
        />
      );

      const button = container.querySelector('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Edge Cases', () => {
    it('handles whitespace-only address', () => {
      render(
        <GeocodingButton
          address="   "
          onSuccess={mockOnSuccess}
        />
      );

      const button = screen.getByRole('button', { name: /find coordinates/i });
      expect(button).toBeDisabled();
    });

    it('handles undefined onError gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      render(
        <GeocodingButton
          address={mockAddress}
          onSuccess={mockOnSuccess}
          onError={undefined}
        />
      );

      const button = screen.getByRole('button', { name: /find coordinates/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });
});
