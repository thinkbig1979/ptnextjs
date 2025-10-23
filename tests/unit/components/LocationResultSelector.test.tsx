/**
 * Unit tests for LocationResultSelector component
 *
 * Tests the dialog component that displays multiple geocoding results
 * and allows users to select their desired location.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocationResultSelector } from '@/components/location-result-selector';
import { PhotonFeature } from '@/lib/types';

// Mock PhotonFeature data for testing
const mockResults: PhotonFeature[] = [
  {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [2.3522, 48.8566], // [lon, lat] format
    },
    properties: {
      osm_id: 7444,
      osm_type: 'R',
      name: 'Paris',
      country: 'France',
      countrycode: 'FR',
      city: 'Paris',
      state: 'Île-de-France',
      type: 'city',
    },
  },
  {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-95.5555, 33.6609],
    },
    properties: {
      osm_id: 123456,
      osm_type: 'R',
      name: 'Paris',
      country: 'United States',
      countrycode: 'US',
      city: 'Paris',
      state: 'Texas',
      type: 'city',
    },
  },
  {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-88.3267, 36.302],
    },
    properties: {
      osm_id: 789012,
      osm_type: 'R',
      name: 'Paris',
      country: 'United States',
      countrycode: 'US',
      city: 'Paris',
      state: 'Tennessee',
      type: 'city',
    },
  },
];

const singleResult: PhotonFeature[] = [mockResults[0]];

const manyResults: PhotonFeature[] = Array.from({ length: 15 }, (_, i) => ({
  ...mockResults[0],
  properties: {
    ...mockResults[0].properties,
    osm_id: 7444 + i,
    name: `Location ${i + 1}`,
    city: `City ${i + 1}`,
  },
}));

describe('LocationResultSelector', () => {
  const mockOnSelect = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render dialog with multiple results', () => {
      render(
        <LocationResultSelector
          results={mockResults}
          open={true}
          onSelect={mockOnSelect}
          onCancel={mockOnCancel}
        />
      );

      // Verify dialog is visible
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Verify all results are displayed
      expect(screen.getByText('Paris, France')).toBeInTheDocument();
      expect(screen.getByText('Paris, Texas, United States')).toBeInTheDocument();
      expect(screen.getByText('Paris, Tennessee, United States')).toBeInTheDocument();
    });

    it('should display MapPin icons for each result', () => {
      render(
        <LocationResultSelector
          results={mockResults}
          open={true}
          onSelect={mockOnSelect}
          onCancel={mockOnCancel}
        />
      );

      // Verify MapPin icons are rendered (via test-id or class)
      const icons = screen.getAllByTestId('map-pin-icon');
      expect(icons).toHaveLength(3);
    });

    it('should render results in scrollable area when many results (>10)', () => {
      render(
        <LocationResultSelector
          results={manyResults}
          open={true}
          onSelect={mockOnSelect}
          onCancel={mockOnCancel}
        />
      );

      // Verify ScrollArea component is rendered
      const scrollArea = screen.getByTestId('result-scroll-area');
      expect(scrollArea).toBeInTheDocument();

      // Verify all 15 results are in the DOM
      expect(screen.getByText('City 1, France')).toBeInTheDocument();
      expect(screen.getByText('City 15, France')).toBeInTheDocument();
    });

    it('should display formatted location names (City, Region, Country)', () => {
      render(
        <LocationResultSelector
          results={mockResults}
          open={true}
          onSelect={mockOnSelect}
          onCancel={mockOnCancel}
        />
      );

      // Verify formatting: "City, State, Country" or "City, Country"
      expect(screen.getByText('Paris, France')).toBeInTheDocument();
      expect(screen.getByText(/Texas, United States/)).toBeInTheDocument();
    });

    it('should render dialog title and description', () => {
      render(
        <LocationResultSelector
          results={mockResults}
          open={true}
          onSelect={mockOnSelect}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Select Location')).toBeInTheDocument();
      expect(screen.getByText(/Multiple locations found/i)).toBeInTheDocument();
    });

    it('should render Cancel button', () => {
      render(
        <LocationResultSelector
          results={mockResults}
          open={true}
          onSelect={mockOnSelect}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onSelect with correct result when result is clicked', async () => {
      const user = userEvent.setup();

      render(
        <LocationResultSelector
          results={mockResults}
          open={true}
          onSelect={mockOnSelect}
          onCancel={mockOnCancel}
        />
      );

      // Click on the first result (Paris, France)
      const firstResult = screen.getByText('Paris, France');
      await user.click(firstResult);

      // Verify onSelect was called with the correct result
      expect(mockOnSelect).toHaveBeenCalledTimes(1);
      expect(mockOnSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          properties: expect.objectContaining({
            name: 'Paris',
            country: 'France',
          }),
        })
      );
    });

    it('should call onCancel when Cancel button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <LocationResultSelector
          results={mockResults}
          open={true}
          onSelect={mockOnSelect}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should close dialog when result is selected', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <LocationResultSelector
          results={mockResults}
          open={true}
          onSelect={mockOnSelect}
          onCancel={mockOnCancel}
        />
      );

      // Click a result
      await user.click(screen.getByText('Paris, France'));

      // Simulate parent closing the dialog after selection
      rerender(
        <LocationResultSelector
          results={mockResults}
          open={false}
          onSelect={mockOnSelect}
          onCancel={mockOnCancel}
        />
      );

      // Dialog should not be visible
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Dialog State Management', () => {
    it('should show dialog when open prop is true', () => {
      render(
        <LocationResultSelector
          results={mockResults}
          open={true}
          onSelect={mockOnSelect}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should hide dialog when open prop is false', () => {
      render(
        <LocationResultSelector
          results={mockResults}
          open={false}
          onSelect={mockOnSelect}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should toggle dialog visibility when open prop changes', () => {
      const { rerender } = render(
        <LocationResultSelector
          results={mockResults}
          open={false}
          onSelect={mockOnSelect}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      // Open dialog
      rerender(
        <LocationResultSelector
          results={mockResults}
          open={true}
          onSelect={mockOnSelect}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support arrow key navigation through results', async () => {
      const user = userEvent.setup();

      render(
        <LocationResultSelector
          results={mockResults}
          open={true}
          onSelect={mockOnSelect}
          onCancel={mockOnCancel}
        />
      );

      // Get all result options
      const results = screen.getAllByRole('option');

      // Tab to first result
      await user.tab();

      // After tabbing, one of the results should have focus
      // (may be first or second depending on DOM order and portal rendering)
      const focusedElement = document.activeElement;
      const initialIndex = results.findIndex(r => r === focusedElement);
      expect(initialIndex).toBeGreaterThanOrEqual(0);

      // Navigate down with arrow keys
      await user.keyboard('{ArrowDown}');
      await waitFor(() => {
        expect(results[Math.min(initialIndex + 1, results.length - 1)]).toHaveFocus();
      });

      // Navigate up
      await user.keyboard('{ArrowUp}');
      await waitFor(() => {
        expect(results[initialIndex]).toHaveFocus();
      });
    });

    it('should select result when Enter key is pressed', async () => {
      const user = userEvent.setup();

      render(
        <LocationResultSelector
          results={mockResults}
          open={true}
          onSelect={mockOnSelect}
          onCancel={mockOnCancel}
        />
      );

      // Focus first result
      const results = screen.getAllByRole('option');
      results[0].focus();

      // Press Enter
      await user.keyboard('{Enter}');

      expect(mockOnSelect).toHaveBeenCalledTimes(1);
      expect(mockOnSelect).toHaveBeenCalledWith(mockResults[0]);
    });

    it('should cancel when Escape key is pressed', async () => {
      const user = userEvent.setup();

      render(
        <LocationResultSelector
          results={mockResults}
          open={true}
          onSelect={mockOnSelect}
          onCancel={mockOnCancel}
        />
      );

      // Press Escape
      await user.keyboard('{Escape}');

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      render(
        <LocationResultSelector
          results={mockResults}
          open={true}
          onSelect={mockOnSelect}
          onCancel={mockOnCancel}
        />
      );

      // Dialog should have role
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Results should have option role
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(3);

      // Dialog should have accessible title
      expect(screen.getByRole('dialog')).toHaveAccessibleName();
    });

    it('should have aria-label for result items', () => {
      render(
        <LocationResultSelector
          results={mockResults}
          open={true}
          onSelect={mockOnSelect}
          onCancel={mockOnCancel}
        />
      );

      const options = screen.getAllByRole('option');
      options.forEach(option => {
        expect(option).toHaveAccessibleName();
      });
    });

    it('should support screen reader announcements', () => {
      render(
        <LocationResultSelector
          results={mockResults}
          open={true}
          onSelect={mockOnSelect}
          onCancel={mockOnCancel}
        />
      );

      // Verify dialog has proper describedby
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-describedby');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty results array gracefully', () => {
      render(
        <LocationResultSelector
          results={[]}
          open={true}
          onSelect={mockOnSelect}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /no locations found/i })).toBeInTheDocument();
    });

    it('should handle single result', () => {
      render(
        <LocationResultSelector
          results={singleResult}
          open={true}
          onSelect={mockOnSelect}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Paris, France')).toBeInTheDocument();
      expect(screen.getAllByRole('option')).toHaveLength(1);
    });

    it('should handle results with missing properties gracefully', () => {
      const incompleteResult: PhotonFeature[] = [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [0, 0],
          },
          properties: {
            osm_id: 999,
            osm_type: 'N',
            name: 'Unknown',
            type: 'place',
            // Missing city, state, country
          },
        },
      ];

      render(
        <LocationResultSelector
          results={incompleteResult}
          open={true}
          onSelect={mockOnSelect}
          onCancel={mockOnCancel}
        />
      );

      // Should render without crashing
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/Unknown/)).toBeInTheDocument();
    });
  });
});
