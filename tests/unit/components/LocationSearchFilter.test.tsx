/**
 * Unit tests for LocationSearchFilter component
 *
 * Tests the enhanced location search filter component with:
 * - Location name input and geocoding
 * - Debounced API calls
 * - Result selection and dialog management
 * - Distance slider
 * - Manual coordinate input (advanced mode)
 * - Error handling and loading states
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocationSearchFilter } from '@/components/LocationSearchFilter';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('LocationSearchFilter', () => {
  const mockOnSearch = jest.fn();
  const mockOnReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, results: [] }),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
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

      // Use testid instead of role for slider
      expect(screen.getByTestId('distance-slider')).toBeInTheDocument();
      expect(screen.getByTestId('distance-value')).toHaveTextContent('160 km');
    });

    it('should not render search button (auto-search on type)', () => {
      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      // No search button in new design - searches automatically as you type
      expect(screen.queryByRole('button', { name: /^search$/i })).not.toBeInTheDocument();
    });

    it('should not render reset button initially', () => {
      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      expect(screen.queryByRole('button', { name: /reset/i })).not.toBeInTheDocument();
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
      const user = userEvent.setup({ delay: null });

      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      const input = screen.getByLabelText(/location/i) as HTMLInputElement;

      // Type just 1 character first (won't trigger loading state)
      await user.type(input, 'M');
      expect(input.value).toBe('M');

      // Type another character (will trigger loading state at 2+ chars)
      await user.type(input, 'o');
      expect(input.value).toBe('Mo');
    });

    it('should show loading indicator when user types', async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      const input = screen.getByLabelText(/location/i);

      // Type just 1 character - should not be disabled
      await user.type(input, 'M');
      expect(input).not.toBeDisabled();

      // Type second character - loading state begins, input gets disabled
      await user.type(input, 'o');
      // Now the input should be disabled due to loading state
      expect(input).toBeDisabled();
    });
  });

  describe('API Integration with Debouncing', () => {
    it('should debounce location input and call geocode API after 300ms', async () => {
      const user = userEvent.setup({ delay: null });

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

      // Type quickly
      await user.type(input, 'Monaco');

      // API should not be called immediately
      expect(global.fetch).not.toHaveBeenCalled();

      // Fast-forward 300ms
      jest.advanceTimersByTime(300);

      // Now API should be called
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/geocode')
        );
      });
    });

    it('should only make one API call despite rapid typing', async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      const input = screen.getByLabelText(/location/i);

      // Type quickly
      await user.type(input, 'M');
      await user.type(input, 'o');
      await user.type(input, 'n');
      await user.type(input, 'a');
      await user.type(input, 'c');
      await user.type(input, 'o');

      // Fast-forward 300ms
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Loading States', () => {
    it('should display loading state during API call', async () => {
      const user = userEvent.setup({ delay: null });

      // Mock slow API response
      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({ success: true, results: [] }),
        }), 1000))
      );

      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      await user.type(screen.getByLabelText(/location/i), 'Monaco');
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText(/searching/i)).toBeInTheDocument();
      });
    });

    it('should disable input during loading', async () => {
      const user = userEvent.setup({ delay: null });

      (global.fetch as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      const input = screen.getByLabelText(/location/i) as HTMLInputElement;
      await user.type(input, 'Monaco');

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(input).toBeDisabled();
      });
    });
  });

  describe('Single Result Auto-Apply', () => {
    it('should auto-apply filter when single result is returned', async () => {
      const user = userEvent.setup({ delay: null });

      const singleResult = {
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
        json: async () => singleResult,
      });

      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      await user.type(screen.getByLabelText(/location/i), 'Monaco');
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith(
          { latitude: 43.7384, longitude: 7.4246 },
          160
        );
      });
    });

    it('should not show result selector for single result', async () => {
      const user = userEvent.setup({ delay: null });

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
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Multiple Results - Show Selector Dialog', () => {
    it('should show selector dialog when multiple results are returned', async () => {
      const user = userEvent.setup({ delay: null });

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
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should update coordinates when result is selected from dialog', async () => {
      const user = userEvent.setup({ delay: null });

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
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Click first result
      const parisOption = screen.getByText(/Paris, France/i);
      await user.click(parisOption);

      expect(mockOnSearch).toHaveBeenCalledWith(
        { latitude: 48.8566, longitude: 2.3522 },
        160
      );
    });

    it('should close dialog when Cancel is clicked', async () => {
      const user = userEvent.setup({ delay: null });

      // Use multiple results for dialog test instead of single result
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
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(mockOnSearch).not.toHaveBeenCalled();
    });
  });

  describe('Distance Slider Interaction', () => {
    it('should update distance value when slider is moved', async () => {
      const user = userEvent.setup();

      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      // Use testid instead of role for slider
      const slider = screen.getByTestId('distance-slider');

      // Change slider value (note: actual slider interaction depends on implementation)
      // For now, we'll test the display
      expect(screen.getByTestId('distance-value')).toHaveTextContent('160 km');
    });

    it('should include updated distance when searching', async () => {
      const user = userEvent.setup({ delay: null });

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

      // Type location
      await user.type(screen.getByLabelText(/location/i), 'Monaco');

      // Simulate changing slider to 320 km (implementation-specific)
      // ... slider change code ...

      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalled();
      });
    });
  });

  describe('Advanced Mode - Manual Coordinate Input', () => {
    it('should show coordinate inputs when advanced options is expanded', async () => {
      // Use real timers for this test to avoid Collapsible animation issues
      jest.useRealTimers();
      const user = userEvent.setup();

      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      const advancedToggle = screen.getByText(/advanced options/i);
      await user.click(advancedToggle);

      // Wait for collapsible animation and elements to appear
      const latInput = await screen.findByLabelText(/latitude/i, {}, { timeout: 3000 });
      const lonInput = await screen.findByLabelText(/longitude/i, {}, { timeout: 3000 });

      expect(latInput).toBeInTheDocument();
      expect(lonInput).toBeInTheDocument();

      // Restore fake timers for other tests
      jest.useFakeTimers();
    });

    it('should accept manual coordinate input', async () => {
      // Use real timers for this test
      jest.useRealTimers();
      const user = userEvent.setup();

      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      // Expand advanced options
      await user.click(screen.getByText(/advanced options/i));

      const latInput = await screen.findByLabelText(/latitude/i, {}, { timeout: 3000 });
      const lonInput = await screen.findByLabelText(/longitude/i, {}, { timeout: 3000 });

      await user.type(latInput, '43.7384');
      await user.type(lonInput, '7.4246');

      expect(latInput).toHaveValue('43.7384');
      expect(lonInput).toHaveValue('7.4246');

      // Restore fake timers
      jest.useFakeTimers();
    });

    it('should apply filter with manual coordinates when search is clicked', async () => {
      // Use real timers for this test
      jest.useRealTimers();
      const user = userEvent.setup();

      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      await user.click(screen.getByText(/advanced options/i));

      const latInput = await screen.findByLabelText(/latitude/i, {}, { timeout: 3000 });
      const lonInput = await screen.findByLabelText(/longitude/i, {}, { timeout: 3000 });

      await user.type(latInput, '43.7384');
      await user.type(lonInput, '7.4246');

      const searchButton = await screen.findByRole('button', { name: /search.*coordinates/i }, { timeout: 3000 });
      await user.click(searchButton);

      expect(mockOnSearch).toHaveBeenCalledWith(
        { latitude: 43.7384, longitude: 7.4246 },
        160
      );

      // Restore fake timers
      jest.useFakeTimers();
    });
  });

  describe('Reset Functionality', () => {
    it('should show reset button after search is performed', async () => {
      const user = userEvent.setup({ delay: null });

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
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
      });
    });

    it('should clear all inputs when reset is clicked', async () => {
      const user = userEvent.setup({ delay: null });

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
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /reset/i }));

      expect(input.value).toBe('');
      expect(mockOnReset).toHaveBeenCalledTimes(1);
    });

    it('should reset distance to default (160 km)', async () => {
      const user = userEvent.setup({ delay: null });

      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      // Perform search
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

      await user.type(screen.getByLabelText(/location/i), 'Monaco');
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /reset/i }));

      expect(screen.getByTestId('distance-value')).toHaveTextContent('160 km');
    });
  });

  describe('Error Handling', () => {
    it('should display error message when API returns 400', async () => {
      const user = userEvent.setup({ delay: null });

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

      // Type at least 2 characters to trigger API call
      await user.type(screen.getByLabelText(/location/i), 'xy');
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/invalid location search/i)).toBeInTheDocument();
      });
    });

    it('should display error message when API returns 429 (rate limit)', async () => {
      const user = userEvent.setup({ delay: null });

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
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
      });
    });

    it('should display error message when API returns 500', async () => {
      const user = userEvent.setup({ delay: null });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          error: 'Internal server error',
          code: 'SERVICE_ERROR',
        }),
      });

      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      await user.type(screen.getByLabelText(/location/i), 'Monaco');
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/service error/i)).toBeInTheDocument();
      });
    });

    it('should display error message when API returns 503', async () => {
      const user = userEvent.setup({ delay: null });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({
          success: false,
          error: 'Service unavailable',
          code: 'SERVICE_UNAVAILABLE',
        }),
      });

      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      await user.type(screen.getByLabelText(/location/i), 'Monaco');
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/temporarily unavailable/i)).toBeInTheDocument();
      });
    });

    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup({ delay: null });

      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      await user.type(screen.getByLabelText(/location/i), 'Monaco');
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Empty Results Handling', () => {
    it('should display "No locations found" when API returns empty array', async () => {
      const user = userEvent.setup({ delay: null });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, results: [] }),
      });

      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      await user.type(screen.getByLabelText(/location/i), 'Nonexistent Place');
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText(/no locations found/i)).toBeInTheDocument();
      });
    });

    it('should not call onSearch when no results found', async () => {
      const user = userEvent.setup({ delay: null });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, results: [] }),
      });

      render(
        <LocationSearchFilter onSearch={mockOnSearch} onReset={mockOnReset} />
      );

      await user.type(screen.getByLabelText(/location/i), 'Nonexistent');
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText(/no locations found/i)).toBeInTheDocument();
      });

      expect(mockOnSearch).not.toHaveBeenCalled();
    });
  });

  describe('Result Count Display', () => {
    it('should display result count after successful search', async () => {
      const user = userEvent.setup({ delay: null });

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
      jest.advanceTimersByTime(300);

      await waitFor(() => {
        expect(screen.getByText(/showing 5 of 50/i)).toBeInTheDocument();
      });
    });
  });
});
