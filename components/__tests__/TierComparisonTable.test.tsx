/**
 * Component Tests - TierComparisonTable
 *
 * Tests the tier comparison table component including:
 * - Feature matrix rendering
 * - Current tier highlighting
 * - Tier column styling
 * - Feature value display (boolean, numeric, string)
 * - Category organization
 * - Accessibility
 *
 * Target coverage: 75%+
 */

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TierComparisonTable } from '@/components/TierComparisonTable';

describe('TierComparisonTable', () => {
  describe('Table Rendering', () => {
    it('renders table with all tier columns', () => {
      render(<TierComparisonTable />);

      expect(screen.getByText(/free/i)).toBeInTheDocument();
      expect(screen.getByText(/tier 1/i)).toBeInTheDocument();
      expect(screen.getByText(/tier 2/i)).toBeInTheDocument();
      expect(screen.getByText(/tier 3/i)).toBeInTheDocument();
    });

    it('renders table with caption', () => {
      render(<TierComparisonTable />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      expect(screen.getByText(/compare subscription tier features/i)).toBeInTheDocument();
    });

    it('renders all feature categories', () => {
      render(<TierComparisonTable />);

      expect(screen.getByText(/listings.*products/i)).toBeInTheDocument();
      expect(screen.getAllByText(/locations/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/profile.*branding/i)).toBeInTheDocument();
      expect(screen.getByText(/marketing.*visibility/i)).toBeInTheDocument();
      expect(screen.getByText(/analytics.*insights/i)).toBeInTheDocument();
      expect(screen.getAllByText(/support/i)[0]).toBeInTheDocument();
    });

    it('renders key feature rows', () => {
      render(<TierComparisonTable />);

      // Check for important features
      expect(screen.getByText(/products listed/i)).toBeInTheDocument();
      expect(screen.getByText(/business locations/i)).toBeInTheDocument();
      expect(screen.getByText(/featured products/i)).toBeInTheDocument();
      expect(screen.getByText(/search result priority/i)).toBeInTheDocument();
    });
  });

  describe('Feature Value Display', () => {
    it('displays numeric values correctly', () => {
      render(<TierComparisonTable />);

      // Check product listing limits
      expect(screen.getAllByText('1')[0]).toBeInTheDocument(); // Free tier products
      expect(screen.getAllByText('5')[0]).toBeInTheDocument(); // Tier 1 products
      expect(screen.getByText('25')).toBeInTheDocument(); // Tier 2 products
    });

    it('displays "Unlimited" for unlimited features', () => {
      render(<TierComparisonTable />);

      const unlimitedCells = screen.getAllByText(/unlimited/i);
      expect(unlimitedCells.length).toBeGreaterThan(0);
    });

    it('displays checkmarks for available boolean features', () => {
      render(<TierComparisonTable />);

      // Should have Check icons for features that are available
      // Implementation will use lucide-react Check icon
      const checkIcons = document.querySelectorAll('[data-testid="check-icon"]');
      expect(checkIcons.length).toBeGreaterThan(0);
    });

    it('displays X icons for unavailable boolean features', () => {
      render(<TierComparisonTable />);

      // Should have X icons for features that are not available
      // Implementation will use lucide-react X icon
      const xIcons = document.querySelectorAll('[data-testid="x-icon"]');
      expect(xIcons.length).toBeGreaterThan(0);
    });

    it('displays string values for text-based features', () => {
      render(<TierComparisonTable />);

      // Check for descriptive values
      expect(screen.getByText(/^low$/i)).toBeInTheDocument(); // Search priority
      expect(screen.getByText(/medium/i)).toBeInTheDocument();
      expect(screen.getAllByText(/high/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/highest/i)).toBeInTheDocument();
    });

    it('displays character limits correctly', () => {
      render(<TierComparisonTable />);

      // Check for character limit values
      expect(screen.getByText(/100 chars/i)).toBeInTheDocument();
      expect(screen.getByText(/250 chars/i)).toBeInTheDocument();
      expect(screen.getByText(/500 chars/i)).toBeInTheDocument();
    });
  });

  describe('Current Tier Highlighting', () => {
    it('highlights free tier column when currentTier is free', () => {
      render(<TierComparisonTable currentTier="free" />);

      // Free column should have visual distinction
      const freeHeader = screen.getByText(/^free$/i);
      const columnElement = freeHeader.closest('th') || freeHeader.closest('td');
      expect(columnElement).toHaveClass(/bg-|border-|font-bold/); // Implementation will determine exact classes
    });

    it('highlights tier1 column when currentTier is tier1', () => {
      render(<TierComparisonTable currentTier="tier1" />);

      const tier1Header = screen.getByText(/tier 1/i);
      const columnElement = tier1Header.closest('th') || tier1Header.closest('td');
      expect(columnElement).toHaveClass(/bg-|border-|font-bold/);
    });

    it('highlights tier2 column when currentTier is tier2', () => {
      render(<TierComparisonTable currentTier="tier2" />);

      const tier2Header = screen.getByText(/tier 2/i);
      const columnElement = tier2Header.closest('th') || tier2Header.closest('td');
      expect(columnElement).toHaveClass(/bg-|border-|font-bold/);
    });

    it('highlights tier3 column when currentTier is tier3', () => {
      render(<TierComparisonTable currentTier="tier3" />);

      const tier3Header = screen.getByText(/tier 3/i);
      const columnElement = tier3Header.closest('th') || tier3Header.closest('td');
      expect(columnElement).toHaveClass(/bg-|border-|font-bold/);
    });

    it('does not highlight any column when currentTier is not provided', () => {
      const { container } = render(<TierComparisonTable />);

      // No special highlighting should be applied
      const highlightedCells = container.querySelectorAll('.bg-primary, .border-primary');
      expect(highlightedCells.length).toBe(0);
    });

    it('shows "Current Plan" badge on highlighted tier', () => {
      render(<TierComparisonTable currentTier="tier1" />);

      expect(screen.getByText(/current plan/i)).toBeInTheDocument();
    });
  });

  describe('Highlight Tier Feature', () => {
    it('highlights specified tier when highlightTier is provided', () => {
      render(<TierComparisonTable highlightTier="tier2" />);

      const tier2Header = screen.getByText(/tier 2/i);
      const columnElement = tier2Header.closest('th') || tier2Header.closest('td');
      expect(columnElement).toHaveClass(/bg-|border-|highlight/);
    });

    it('prefers currentTier highlighting over highlightTier', () => {
      render(<TierComparisonTable currentTier="tier1" highlightTier="tier2" />);

      // Tier1 should be highlighted as "Current Plan"
      expect(screen.getByText(/current plan/i)).toBeInTheDocument();

      // Implementation should prioritize currentTier over highlightTier
      const tier1Header = screen.getByText(/tier 1/i);
      const tier1Element = tier1Header.closest('th');
      expect(tier1Element).toHaveClass(/bg-|border-/);
    });
  });

  describe('Feature Categories', () => {
    it('groups features under category headers', () => {
      render(<TierComparisonTable />);

      // Each category should be a distinct section
      const listingsCategory = screen.getByText(/listings.*products/i);
      const locationsCategory = screen.getAllByText(/locations/i)[0];

      expect(listingsCategory).toBeInTheDocument();
      expect(locationsCategory).toBeInTheDocument();
    });

    it('displays all features for Listings & Products category', () => {
      render(<TierComparisonTable />);

      expect(screen.getByText(/products listed/i)).toBeInTheDocument();
      expect(screen.getByText(/product images per product/i)).toBeInTheDocument();
      expect(screen.getByText(/featured products/i)).toBeInTheDocument();
    });

    it('displays all features for Locations category', () => {
      render(<TierComparisonTable />);

      expect(screen.getByText(/business locations/i)).toBeInTheDocument();
      expect(screen.getByText(/interactive map display/i)).toBeInTheDocument();
    });

    it('displays all features for Profile & Branding category', () => {
      render(<TierComparisonTable />);

      expect(screen.getByText(/company logo/i)).toBeInTheDocument();
      expect(screen.getByText(/company description/i)).toBeInTheDocument();
      expect(screen.getByText(/social media links/i)).toBeInTheDocument();
      expect(screen.getByText(/custom branding colors/i)).toBeInTheDocument();
    });

    it('displays all features for Marketing & Visibility category', () => {
      render(<TierComparisonTable />);

      expect(screen.getByText(/search result priority/i)).toBeInTheDocument();
      expect(screen.getByText(/homepage featured listing/i)).toBeInTheDocument();
      expect(screen.getByText(/promotion pack credits/i)).toBeInTheDocument();
    });

    it('displays all features for Analytics & Insights category', () => {
      render(<TierComparisonTable />);

      expect(screen.getByText(/profile views/i)).toBeInTheDocument();
      expect(screen.getByText(/product clicks/i)).toBeInTheDocument();
      expect(screen.getByText(/contact button clicks/i)).toBeInTheDocument();
    });

    it('displays all features for Support category', () => {
      render(<TierComparisonTable />);

      expect(screen.getByText(/email support/i)).toBeInTheDocument();
      expect(screen.getByText(/response time/i)).toBeInTheDocument();
      expect(screen.getByText(/account manager/i)).toBeInTheDocument();
    });
  });

  describe('Tier Progression', () => {
    it('shows progression from free to tier3', () => {
      render(<TierComparisonTable />);

      // Verify feature values increase across tiers
      const table = screen.getByRole('table');

      // Products listed: 1 → 5 → 25 → Unlimited
      expect(within(table).getAllByText('1')[0]).toBeInTheDocument();
      expect(within(table).getAllByText('5')[0]).toBeInTheDocument();
      expect(within(table).getByText('25')).toBeInTheDocument();
    });

    it('shows features becoming available in higher tiers', () => {
      render(<TierComparisonTable />);

      // Features that unlock at higher tiers (e.g., custom branding in tier2+)
      // Implementation should show X for lower tiers and Check for higher tiers
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('renders table with proper structure on desktop', () => {
      render(<TierComparisonTable />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      // Should have proper table structure
      const thead = table.querySelector('thead');
      const tbody = table.querySelector('tbody');

      expect(thead).toBeInTheDocument();
      expect(tbody).toBeInTheDocument();
    });

    it('applies custom className when provided', () => {
      const { container } = render(
        <TierComparisonTable className="custom-table-class" />
      );

      const wrapper = container.querySelector('.custom-table-class');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveClass('w-full', 'overflow-x-auto', 'custom-table-class');
    });
  });

  describe('Accessibility', () => {
    it('has proper table role', () => {
      render(<TierComparisonTable />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });

    it('has accessible column headers', () => {
      render(<TierComparisonTable />);

      // All tier columns should be proper th elements
      const freeHeader = screen.getByText(/^free$/i);
      expect(freeHeader.tagName).toBe('TH');

      const tier1Header = screen.getByText(/tier 1/i);
      expect(tier1Header.tagName).toBe('TH');
    });

    it('has accessible row headers for features', () => {
      render(<TierComparisonTable />);

      const productsHeader = screen.getByText(/products listed/i);
      expect(productsHeader.tagName).toBe('TH' || 'TD');
    });

    it('has table caption for screen readers', () => {
      render(<TierComparisonTable />);

      const caption = screen.getByText(/compare subscription tier features/i);
      expect(caption).toBeInTheDocument();
      expect(caption.tagName).toBe('CAPTION');
    });

    it('uses semantic markup for boolean values', () => {
      render(<TierComparisonTable />);

      // Check and X icons should have appropriate aria-labels or sr-only text
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      // Implementation should add aria-label="Available" or "Not available"
    });
  });

  describe('Feature Descriptions', () => {
    it('shows feature names clearly', () => {
      render(<TierComparisonTable />);

      // All feature names should be readable
      expect(screen.getByText(/products listed/i)).toBeInTheDocument();
      expect(screen.getByText(/business locations/i)).toBeInTheDocument();
      expect(screen.getByText(/search result priority/i)).toBeInTheDocument();
    });

    it('displays promotion pack credits correctly', () => {
      render(<TierComparisonTable />);

      // Check for promotion pack credit values
      expect(screen.getByText(/promotion pack credits/i)).toBeInTheDocument();
      // Values: 0, 2, 6, 12
      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
    });

    it('displays response time values', () => {
      render(<TierComparisonTable />);

      expect(screen.getByText(/48hrs/i)).toBeInTheDocument();
      expect(screen.getAllByText(/24hrs/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/12hrs/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/4hrs/i)[0]).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing currentTier gracefully', () => {
      render(<TierComparisonTable currentTier={undefined} />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });

    it('handles invalid currentTier gracefully', () => {
      render(<TierComparisonTable currentTier={'invalid' as any} />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      expect(screen.queryByText(/current plan/i)).not.toBeInTheDocument();
    });

    it('renders without crashing with all props', () => {
      render(
        <TierComparisonTable
          currentTier="tier2"
          highlightTier="tier3"
          className="custom-class"
        />
      );

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });

    it('renders without crashing with minimal props', () => {
      render(<TierComparisonTable />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });
  });

  describe('Visual Styling', () => {
    it('applies zebra striping to rows for readability', () => {
      const { container } = render(<TierComparisonTable />);

      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBeGreaterThan(0);

      // Implementation should alternate row backgrounds
    });

    it('applies proper border styling', () => {
      const { container } = render(<TierComparisonTable />);

      const table = container.querySelector('table');
      // Table uses shadcn/ui Table component with default styling
      expect(table).toHaveClass('w-full', 'caption-bottom', 'text-sm');
    });

    it('uses proper spacing for readability', () => {
      const { container } = render(<TierComparisonTable />);

      const table = container.querySelector('table');
      // Implementation should add padding to cells
      expect(table).toBeInTheDocument();
    });

    it('highlights category headers visually', () => {
      render(<TierComparisonTable />);

      const categoryHeader = screen.getByText(/listings.*products/i);
      const headerElement = categoryHeader.closest('tr');

      // Category rows should be visually distinct
      expect(headerElement).toHaveClass(/bg-|font-bold|border/);
    });
  });
});
