import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GeocodingButton } from '@/components/vendor/GeocodingButton';

// Mock GeocodingService
const mockGeocodeAddress = jest.fn();
jest.mock('@/lib/services/geocoding', () => ({
  GeocodingService: {
    geocodeAddress: (...args: any[]) => mockGeocodeAddress(...args)
  }
}));

// Mock toast notifications
jest.mock('@/components/ui/sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

const { toast } = require('@/components/ui/sonner');

describe('GeocodingButton', () => {
  const mockOnCoordinatesUpdate = jest.fn();
  const mockAddress = '123 Main St, Monaco';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Button Rendering', () => {
    it('renders geocoding button', () => {
      render(
        <GeocodingButton
          address={mockAddress}
          onCoordinatesUpdate={mockOnCoordinatesUpdate}
        />
      );

      expect(screen.getByRole('button', { name: /get coordinates/i })).toBeInTheDocument();
    });

    it('displays icon on button', () => {
      render(
        <GeocodingButton
          address={mockAddress}
          onCoordinatesUpdate={mockOnCoordinatesUpdate}
        />
      );

      const button = screen.getByRole('button', { name: /get coordinates/i });
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('is disabled when no address provided', () => {
      render(
        <GeocodingButton
          address=""
          onCoordinatesUpdate={mockOnCoordinatesUpdate}
        />
      );

      expect(screen.getByRole('button', { name: /get coordinates/i })).toBeDisabled();
    });

    it('is enabled when address provided', () => {
      render(
        <GeocodingButton
          address={mockAddress}
          onCoordinatesUpdate={mockOnCoordinatesUpdate}
        />
      );

      expect(screen.getByRole('button', { name: /get coordinates/i })).not.toBeDisabled();
    });
  });

  describe('API Call Success Path', () => {
    it('calls geocoding API when button clicked', async () => {
      mockGeocodeAddress.mockResolvedValue({
        latitude: 43.7384,
        longitude: 7.4246
      });

      render(
        <GeocodingButton
          address={mockAddress}
          onCoordinatesUpdate={mockOnCoordinatesUpdate}
        />
      );

      const button = screen.getByRole('button', { name: /get coordinates/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockGeocodeAddress).toHaveBeenCalledWith(mockAddress);
      });
    });

    it('updates coordinates on successful geocoding', async () => {
      mockGeocodeAddress.mockResolvedValue({
        latitude: 43.7384,
        longitude: 7.4246
      });

      render(
        <GeocodingButton
          address={mockAddress}
          onCoordinatesUpdate={mockOnCoordinatesUpdate}
        />
      );

      const button = screen.getByRole('button', { name: /get coordinates/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockOnCoordinatesUpdate).toHaveBeenCalledWith({
          latitude: 43.7384,
          longitude: 7.4246
        });
      });
    });

    it('shows success toast on successful geocoding', async () => {
      mockGeocodeAddress.mockResolvedValue({
        latitude: 43.7384,
        longitude: 7.4246
      });

      render(
        <GeocodingButton
          address={mockAddress}
          onCoordinatesUpdate={mockOnCoordinatesUpdate}
        />
      );

      const button = screen.getByRole('button', { name: /get coordinates/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringMatching(/coordinates updated/i)
        );
      });
    });
  });

  describe('API Call Error Path', () => {
    it('handles API error gracefully', async () => {
      mockGeocodeAddress.mockRejectedValue(new Error('Geocoding API failed'));

      render(
        <GeocodingButton
          address={mockAddress}
          onCoordinatesUpdate={mockOnCoordinatesUpdate}
        />
      );

      const button = screen.getByRole('button', { name: /get coordinates/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });

    it('shows error toast with message on failure', async () => {
      mockGeocodeAddress.mockRejectedValue(new Error('Geocoding API failed'));

      render(
        <GeocodingButton
          address={mockAddress}
          onCoordinatesUpdate={mockOnCoordinatesUpdate}
        />
      );

      const button = screen.getByRole('button', { name: /get coordinates/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringMatching(/failed to geocode address/i)
        );
      });
    });

    it('does not update coordinates on error', async () => {
      mockGeocodeAddress.mockRejectedValue(new Error('Geocoding API failed'));

      render(
        <GeocodingButton
          address={mockAddress}
          onCoordinatesUpdate={mockOnCoordinatesUpdate}
        />
      );

      const button = screen.getByRole('button', { name: /get coordinates/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });

      expect(mockOnCoordinatesUpdate).not.toHaveBeenCalled();
    });

    it('handles network timeout gracefully', async () => {
      mockGeocodeAddress.mockRejectedValue(new Error('Network timeout'));

      render(
        <GeocodingButton
          address={mockAddress}
          onCoordinatesUpdate={mockOnCoordinatesUpdate}
        />
      );

      const button = screen.getByRole('button', { name: /get coordinates/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringMatching(/failed to geocode|network/i)
        );
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading state while geocoding', async () => {
      mockGeocodeAddress.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          latitude: 43.7384,
          longitude: 7.4246
        }), 100))
      );

      render(
        <GeocodingButton
          address={mockAddress}
          onCoordinatesUpdate={mockOnCoordinatesUpdate}
        />
      );

      const button = screen.getByRole('button', { name: /get coordinates/i });
      fireEvent.click(button);

      // Button should show loading state
      expect(screen.getByRole('button', { name: /geocoding/i })).toBeInTheDocument();
    });

    it('disables button while loading', async () => {
      mockGeocodeAddress.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          latitude: 43.7384,
          longitude: 7.4246
        }), 100))
      );

      render(
        <GeocodingButton
          address={mockAddress}
          onCoordinatesUpdate={mockOnCoordinatesUpdate}
        />
      );

      const button = screen.getByRole('button', { name: /get coordinates/i });
      fireEvent.click(button);

      const loadingButton = screen.getByRole('button', { name: /geocoding/i });
      expect(loadingButton).toBeDisabled();
    });

    it('restores button state after loading completes', async () => {
      mockGeocodeAddress.mockResolvedValue({
        latitude: 43.7384,
        longitude: 7.4246
      });

      render(
        <GeocodingButton
          address={mockAddress}
          onCoordinatesUpdate={mockOnCoordinatesUpdate}
        />
      );

      const button = screen.getByRole('button', { name: /get coordinates/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /get coordinates/i })).not.toBeDisabled();
      });
    });

    it('shows loading spinner icon while geocoding', async () => {
      mockGeocodeAddress.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          latitude: 43.7384,
          longitude: 7.4246
        }), 100))
      );

      render(
        <GeocodingButton
          address={mockAddress}
          onCoordinatesUpdate={mockOnCoordinatesUpdate}
        />
      );

      const button = screen.getByRole('button', { name: /get coordinates/i });
      fireEvent.click(button);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible button label', () => {
      render(
        <GeocodingButton
          address={mockAddress}
          onCoordinatesUpdate={mockOnCoordinatesUpdate}
        />
      );

      expect(screen.getByRole('button', { name: /get coordinates/i })).toBeInTheDocument();
    });

    it('has ARIA attributes for loading state', async () => {
      mockGeocodeAddress.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          latitude: 43.7384,
          longitude: 7.4246
        }), 100))
      );

      render(
        <GeocodingButton
          address={mockAddress}
          onCoordinatesUpdate={mockOnCoordinatesUpdate}
        />
      );

      const button = screen.getByRole('button', { name: /get coordinates/i });
      fireEvent.click(button);

      const loadingButton = screen.getByRole('button', { name: /geocoding/i });
      expect(loadingButton).toHaveAttribute('aria-busy', 'true');
    });

    it('supports keyboard activation', () => {
      mockGeocodeAddress.mockResolvedValue({
        latitude: 43.7384,
        longitude: 7.4246
      });

      render(
        <GeocodingButton
          address={mockAddress}
          onCoordinatesUpdate={mockOnCoordinatesUpdate}
        />
      );

      const button = screen.getByRole('button', { name: /get coordinates/i });
      button.focus();
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });

      expect(mockGeocodeAddress).toHaveBeenCalledWith(mockAddress);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty response from API', async () => {
      mockGeocodeAddress.mockResolvedValue(null);

      render(
        <GeocodingButton
          address={mockAddress}
          onCoordinatesUpdate={mockOnCoordinatesUpdate}
        />
      );

      const button = screen.getByRole('button', { name: /get coordinates/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringMatching(/no results found/i)
        );
      });
    });

    it('handles invalid coordinates in response', async () => {
      mockGeocodeAddress.mockResolvedValue({
        latitude: NaN,
        longitude: NaN
      });

      render(
        <GeocodingButton
          address={mockAddress}
          onCoordinatesUpdate={mockOnCoordinatesUpdate}
        />
      );

      const button = screen.getByRole('button', { name: /get coordinates/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringMatching(/invalid coordinates/i)
        );
      });
    });

    it('prevents multiple simultaneous API calls', async () => {
      mockGeocodeAddress.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          latitude: 43.7384,
          longitude: 7.4246
        }), 200))
      );

      render(
        <GeocodingButton
          address={mockAddress}
          onCoordinatesUpdate={mockOnCoordinatesUpdate}
        />
      );

      const button = screen.getByRole('button', { name: /get coordinates/i });
      fireEvent.click(button);
      fireEvent.click(button); // Second click should be ignored

      await waitFor(() => {
        expect(mockGeocodeAddress).toHaveBeenCalledTimes(1);
      });
    });
  });
});
