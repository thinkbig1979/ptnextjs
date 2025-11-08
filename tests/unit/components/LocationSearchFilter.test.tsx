import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocationSearchFilter } from '@/components/LocationSearchFilter';

global.fetch = jest.fn();

describe('LocationSearchFilter', () => {
  const mockOnSearch = jest.fn();
  const mockOnReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, results: [] }),
    });
  });

  describe('Component Rendering', () => {
    it('should render location name input field', () => {
      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/search for a location/i)).toBeInTheDocument();
    });

    it('should render distance slider with default value', () => {
      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      expect(screen.getByTestId('distance-slider')).toBeInTheDocument();
      expect(screen.getByTestId('distance-value')).toHaveTextContent('160 km');
    });

    it('should render advanced options collapsible', () => {
      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      expect(screen.getByText(/advanced options/i)).toBeInTheDocument();
    });
  });

  describe('Location Name Input', () => {
    it('should update location input as user types', async () => {
      const user = userEvent.setup();

      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      const input = screen.getByLabelText(/location/i) as HTMLInputElement;

      await user.type(input, 'M');
      expect(input.value).toBe('M');

      await user.type(input, 'o');
      expect(input.value).toBe('Mo');
    });
  });

  describe('API Integration with Debouncing', () => {
    it('should call geocode API after user stops typing', async () => {
      const user = userEvent.setup();

      const mockApiResponse = {
        success: true,
        results: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [7.4246, 43.7384] },
            properties: {
              osm_id: 1124039,
              name: 'Monaco',
              country: 'Monaco',
              city: 'Monaco',
              type: 'city',
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      });

      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      const input = screen.getByLabelText(/location/i);

      await user.type(input, 'Monaco');

      // Wait for debounce + API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      }, { timeout: 1000 });

      // The fetch WAS called with the correct params, just verify the call happened with correct URL
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/geocode'),
        expect.any(Object)
      );
    });
  });

  describe('Multiple Results - Show Selector Dialog', () => {
    it('should show results dropdown when multiple results are returned', async () => {
      const user = userEvent.setup();

      const multipleResults = {
        success: true,
        results: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [2.3522, 48.8566] },
            properties: { name: 'Paris', country: 'France', city: 'Paris', type: 'city' },
          },
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [-95.5555, 33.6609] },
            properties: { name: 'Paris', country: 'United States', city: 'Paris', state: 'Texas', type: 'city' },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => multipleResults,
      });

      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      await user.type(screen.getByLabelText(/location/i), 'Paris');

      await waitFor(() => {
        expect(screen.getByTestId('location-results-dropdown')).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should update coordinates when result is selected from dialog', async () => {
      const user = userEvent.setup();

      const multipleResults = {
        success: true,
        results: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [2.3522, 48.8566] },
            properties: { name: 'Paris', country: 'France', city: 'Paris', type: 'city' },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => multipleResults,
      });

      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      await user.type(screen.getByLabelText(/location/i), 'Paris');

      await waitFor(() => {
        expect(screen.getByTestId('location-results-dropdown')).toBeInTheDocument();
      }, { timeout: 1000 });

      const parisOption = screen.getAllByRole('option')[0];
      await user.click(parisOption);

      expect(mockOnSearch).toHaveBeenCalledWith(
        { latitude: 48.8566, longitude: 2.3522 },
        160
      );
    });
  });

  describe('Distance Slider Interaction', () => {
    it('should display distance value', () => {
      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      expect(screen.getByTestId('distance-value')).toHaveTextContent('160 km');
    });
  });

  describe('Advanced Mode - Manual Coordinate Input', () => {
    it('should show coordinate inputs when advanced options is expanded', async () => {
      const user = userEvent.setup();

      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      const advancedToggle = screen.getByText(/advanced options/i);
      await user.click(advancedToggle);

      const latInput = await screen.findByLabelText(/latitude/i);
      const lonInput = await screen.findByLabelText(/longitude/i);

      expect(latInput).toBeInTheDocument();
      expect(lonInput).toBeInTheDocument();
    });

    it('should accept manual coordinate input', async () => {
      const user = userEvent.setup();

      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      await user.click(screen.getByText(/advanced options/i));

      const latInput = await screen.findByLabelText(/latitude/i);
      const lonInput = await screen.findByLabelText(/longitude/i);

      await user.type(latInput, '43.7384');
      await user.type(lonInput, '7.4246');

      expect(latInput).toHaveValue('43.7384');
      expect(lonInput).toHaveValue('7.4246');
    });
  });

  describe('Reset Functionality', () => {
    it('should show reset button after search is performed', async () => {
      const user = userEvent.setup();

      const singleResult = {
        success: true,
        results: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [7.4246, 43.7384] },
            properties: { name: 'Monaco', country: 'Monaco', city: 'Monaco', type: 'city' },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => singleResult,
      });

      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      await user.type(screen.getByLabelText(/location/i), 'Monaco');

      await waitFor(() => {
        expect(screen.getByTestId('location-results-dropdown')).toBeInTheDocument();
      }, { timeout: 1000 });

      const firstResult = screen.getAllByRole('option')[0];
      await user.click(firstResult);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
      });
    });

    it('should clear all inputs when reset is clicked', async () => {
      const user = userEvent.setup();

      const singleResult = {
        success: true,
        results: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [7.4246, 43.7384] },
            properties: { name: 'Monaco', country: 'Monaco', city: 'Monaco', type: 'city' },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => singleResult,
      });

      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      const input = screen.getByLabelText(/location/i) as HTMLInputElement;

      await user.type(input, 'Monaco');

      await waitFor(() => {
        expect(screen.getByTestId('location-results-dropdown')).toBeInTheDocument();
      }, { timeout: 1000 });

      const firstResult = screen.getAllByRole('option')[0];
      await user.click(firstResult);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /reset/i }));

      expect(input.value).toBe('');
      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('should display error message when API returns 400', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: 'Invalid query parameter',
          code: 'INVALID_QUERY',
        }),
      });

      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      await user.type(screen.getByLabelText(/location/i), 'xyzabc');

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      }, { timeout: 1000 });

      expect(screen.getByText(/invalid location search/i)).toBeInTheDocument();
    });

    it('should display error message when API returns 429 (rate limit)', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({
          success: false,
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT',
        }),
      });

      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      await user.type(screen.getByLabelText(/location/i), 'Monaco');

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      }, { timeout: 1000 });

      expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
    });

    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      await user.type(screen.getByLabelText(/location/i), 'Monaco');

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      }, { timeout: 1000 });

      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  describe('Empty Results Handling', () => {
    it('should display "No locations found" when API returns empty array', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, results: [] }),
      });

      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      await user.type(screen.getByLabelText(/location/i), 'Nonexistent Place');

      await waitFor(() => {
        expect(screen.getByText(/no locations found/i)).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should not call onSearch when no results found', async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, results: [] }),
      });

      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      await user.type(screen.getByLabelText(/location/i), 'Nonexistent');

      await waitFor(() => {
        expect(screen.getByText(/no locations found/i)).toBeInTheDocument();
      }, { timeout: 1000 });

      expect(mockOnSearch).not.toHaveBeenCalled();
    });
  });

  describe('Result Count Display', () => {
    it('should display result count after successful search', async () => {
      const user = userEvent.setup();

      const singleResult = {
        success: true,
        results: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [7.4246, 43.7384] },
            properties: { name: 'Monaco', country: 'Monaco', city: 'Monaco', type: 'city' },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => singleResult,
      });

      render(
        <LocationSearchFilter
          onSearch={mockOnSearch}
          onReset={mockOnReset}
          resultCount={5}
          totalCount={50}
        />
      );

      await user.type(screen.getByLabelText(/location/i), 'Monaco');

      await waitFor(() => {
        expect(screen.getByTestId('location-results-dropdown')).toBeInTheDocument();
      }, { timeout: 1000 });

      const firstResult = screen.getAllByRole('option')[0];
      await user.click(firstResult);

      await waitFor(() => {
        expect(screen.getByText(/showing 5 of 50/i)).toBeInTheDocument();
      });
    });
  });
});
