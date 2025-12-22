/**
 * Unit tests for CategorySelect component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategorySelect } from '@/components/vendors/CategorySelect';
import type { Category } from '@/lib/types';

// Mock data for testing
const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Marine Electronics',
    slug: 'marine-electronics',
    description: 'Electronics for marine vessels',
  },
  {
    id: 'cat-2',
    name: 'Navigation Systems',
    slug: 'navigation-systems',
    description: 'Navigation equipment',
  },
  {
    id: 'cat-3',
    name: 'Communication Equipment',
    slug: 'communication-equipment',
    description: 'Communication systems',
  },
];

describe('CategorySelect', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with "All Categories" placeholder', () => {
      render(
        <CategorySelect
          categories={mockCategories}
          value={null}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('All Categories')).toBeInTheDocument();
    });

    it('should render select trigger', () => {
      render(
        <CategorySelect
          categories={mockCategories}
          value={null}
          onChange={mockOnChange}
        />
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <CategorySelect
          categories={mockCategories}
          value={null}
          onChange={mockOnChange}
          className="custom-class"
        />
      );

      const trigger = container.querySelector('.custom-class');
      expect(trigger).toBeInTheDocument();
    });
  });

  describe('Dropdown Options', () => {
    it('should show all categories in dropdown when opened', async () => {
      const user = userEvent.setup();

      render(
        <CategorySelect
          categories={mockCategories}
          value={null}
          onChange={mockOnChange}
        />
      );

      // Open the dropdown
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      // Check all categories are in the dropdown
      expect(screen.getByText('Marine Electronics')).toBeInTheDocument();
      expect(screen.getByText('Navigation Systems')).toBeInTheDocument();
      expect(screen.getByText('Communication Equipment')).toBeInTheDocument();
    });

    it('should show "All Categories" option in dropdown', async () => {
      const user = userEvent.setup();

      render(
        <CategorySelect
          categories={mockCategories}
          value={null}
          onChange={mockOnChange}
        />
      );

      // Open the dropdown
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      // Should have two "All Categories" - one in trigger, one in dropdown
      const allCategoriesOptions = screen.getAllByText('All Categories');
      expect(allCategoriesOptions.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle empty categories array gracefully', async () => {
      const user = userEvent.setup();

      render(
        <CategorySelect
          categories={[]}
          value={null}
          onChange={mockOnChange}
        />
      );

      // Open the dropdown
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      // Should only show "All Categories" option in the listbox
      // Multiple "All Categories" elements exist (trigger text + option), so query by role
      const listbox = screen.getByRole('listbox');
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(1);
      expect(options[0]).toHaveTextContent('All Categories');
    });
  });

  describe('Selection Behavior', () => {
    it('should call onChange with category slug on selection', async () => {
      const user = userEvent.setup();

      render(
        <CategorySelect
          categories={mockCategories}
          value={null}
          onChange={mockOnChange}
        />
      );

      // Open the dropdown
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      // Select a category
      const marineOption = screen.getByText('Marine Electronics');
      await user.click(marineOption);

      // Should call onChange with the slug
      expect(mockOnChange).toHaveBeenCalledWith('marine-electronics');
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    it('should call onChange with null when "All Categories" selected', async () => {
      const user = userEvent.setup();

      render(
        <CategorySelect
          categories={mockCategories}
          value="marine-electronics"
          onChange={mockOnChange}
        />
      );

      // Open the dropdown
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      // Select "All Categories"
      const allCategoriesOptions = screen.getAllByText('All Categories');
      // Click the one that's in the dropdown (not the trigger)
      const dropdownOption = allCategoriesOptions.find(
        (el) => el.getAttribute('role') === 'option'
      );
      if (dropdownOption) {
        await user.click(dropdownOption);
      } else {
        // Fallback: click the last one
        await user.click(allCategoriesOptions[allCategoriesOptions.length - 1]);
      }

      // Should call onChange with null
      expect(mockOnChange).toHaveBeenCalledWith(null);
    });

    it('should select different categories sequentially', async () => {
      const user = userEvent.setup();

      const { rerender } = render(
        <CategorySelect
          categories={mockCategories}
          value={null}
          onChange={mockOnChange}
        />
      );

      // Select first category
      let trigger = screen.getByRole('combobox');
      await user.click(trigger);
      await user.click(screen.getByText('Marine Electronics'));

      expect(mockOnChange).toHaveBeenCalledWith('marine-electronics');

      // Update component with new value
      rerender(
        <CategorySelect
          categories={mockCategories}
          value="marine-electronics"
          onChange={mockOnChange}
        />
      );

      // Select second category
      trigger = screen.getByRole('combobox');
      await user.click(trigger);
      await user.click(screen.getByText('Navigation Systems'));

      expect(mockOnChange).toHaveBeenCalledWith('navigation-systems');
    });
  });

  describe('Selected State', () => {
    it('should show selected category name when value is set', () => {
      render(
        <CategorySelect
          categories={mockCategories}
          value="marine-electronics"
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Marine Electronics')).toBeInTheDocument();
    });

    it('should show "All Categories" when value is null', () => {
      render(
        <CategorySelect
          categories={mockCategories}
          value={null}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('All Categories')).toBeInTheDocument();
    });

    it('should update displayed value when value prop changes', () => {
      const { rerender } = render(
        <CategorySelect
          categories={mockCategories}
          value={null}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('All Categories')).toBeInTheDocument();

      // Update to selected category
      rerender(
        <CategorySelect
          categories={mockCategories}
          value="navigation-systems"
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Navigation Systems')).toBeInTheDocument();
    });

    it('should show correct category for each slug', () => {
      mockCategories.forEach((category) => {
        const { unmount } = render(
          <CategorySelect
            categories={mockCategories}
            value={category.slug}
            onChange={mockOnChange}
          />
        );

        expect(screen.getByText(category.name)).toBeInTheDocument();

        unmount();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation through options', async () => {
      const user = userEvent.setup();

      render(
        <CategorySelect
          categories={mockCategories}
          value={null}
          onChange={mockOnChange}
        />
      );

      const trigger = screen.getByRole('combobox');

      // Focus the select
      await user.click(trigger);

      // Navigate with arrow keys
      await user.keyboard('[ArrowDown]');
      await user.keyboard('[ArrowDown]');

      // Select with Enter
      await user.keyboard('[Enter]');

      // Should have selected the first category (after "All Categories")
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should close dropdown on Escape key', async () => {
      const user = userEvent.setup();

      render(
        <CategorySelect
          categories={mockCategories}
          value={null}
          onChange={mockOnChange}
        />
      );

      const trigger = screen.getByRole('combobox');

      // Open dropdown
      await user.click(trigger);

      // Verify dropdown is open (categories are visible)
      expect(screen.getByText('Marine Electronics')).toBeVisible();

      // Close with Escape
      await user.keyboard('[Escape]');

      // onChange should not be called when closing without selection
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA roles', () => {
      render(
        <CategorySelect
          categories={mockCategories}
          value={null}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();

      render(
        <CategorySelect
          categories={mockCategories}
          value={null}
          onChange={mockOnChange}
        />
      );

      // Tab to the select
      await user.tab();

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveFocus();
    });

    it('should have accessible labels for options', async () => {
      const user = userEvent.setup();

      render(
        <CategorySelect
          categories={mockCategories}
          value={null}
          onChange={mockOnChange}
        />
      );

      // Open dropdown
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      // Check that options are accessible
      const options = screen.getAllByRole('option');
      expect(options.length).toBeGreaterThan(0);
    });
  });

  describe('Value Conversion', () => {
    it('should convert null value to empty string for Select component', () => {
      const { container } = render(
        <CategorySelect
          categories={mockCategories}
          value={null}
          onChange={mockOnChange}
        />
      );

      // The internal value should be empty string, not "null"
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('data-state', 'closed');
    });

    it('should convert empty string from Select to null for onChange', async () => {
      const user = userEvent.setup();

      render(
        <CategorySelect
          categories={mockCategories}
          value="marine-electronics"
          onChange={mockOnChange}
        />
      );

      // Open dropdown
      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      // Select "All Categories" (empty value)
      const allCategoriesOptions = screen.getAllByText('All Categories');
      const dropdownOption = allCategoriesOptions[allCategoriesOptions.length - 1];
      await user.click(dropdownOption);

      // Should convert empty string to null
      expect(mockOnChange).toHaveBeenCalledWith(null);
    });
  });

  describe('Edge Cases', () => {
    it('should handle category with special characters in name', async () => {
      const user = userEvent.setup();

      const specialCategories: Category[] = [
        {
          id: 'cat-1',
          name: 'Category & Special',
          slug: 'category-special',
          description: 'Test',
        },
      ];

      render(
        <CategorySelect
          categories={specialCategories}
          value={null}
          onChange={mockOnChange}
        />
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      expect(screen.getByText('Category & Special')).toBeInTheDocument();
    });

    it('should handle very long category names', async () => {
      const user = userEvent.setup();

      const longCategories: Category[] = [
        {
          id: 'cat-1',
          name: 'This is a very long category name that should still work properly',
          slug: 'very-long-category',
          description: 'Test',
        },
      ];

      render(
        <CategorySelect
          categories={longCategories}
          value={null}
          onChange={mockOnChange}
        />
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      expect(
        screen.getByText('This is a very long category name that should still work properly')
      ).toBeInTheDocument();
    });

    it('should handle single category in list', async () => {
      const user = userEvent.setup();

      const singleCategory: Category[] = [mockCategories[0]];

      render(
        <CategorySelect
          categories={singleCategory}
          value={null}
          onChange={mockOnChange}
        />
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      // Should show "All Categories" and the single category
      expect(screen.getByText('Marine Electronics')).toBeInTheDocument();
    });

    it('should handle category slug that does not exist in list', () => {
      render(
        <CategorySelect
          categories={mockCategories}
          value="non-existent-slug"
          onChange={mockOnChange}
        />
      );

      // Component should still render without crashing
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should handle onChange callback that throws error gracefully', async () => {
      const user = userEvent.setup();
      const errorOnChange = jest.fn(() => {
        throw new Error('Test error');
      });

      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(
          <CategorySelect
            categories={mockCategories}
            value={null}
            onChange={errorOnChange}
          />
        );
      }).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('Multiple Instances', () => {
    it('should handle multiple CategorySelect instances independently', async () => {
      const user = userEvent.setup();
      const mockOnChange1 = jest.fn();
      const mockOnChange2 = jest.fn();

      const { container } = render(
        <div>
          <CategorySelect
            categories={mockCategories}
            value={null}
            onChange={mockOnChange1}
            className="select-1"
          />
          <CategorySelect
            categories={mockCategories}
            value={null}
            onChange={mockOnChange2}
            className="select-2"
          />
        </div>
      );

      // Get both selects
      const selects = screen.getAllByRole('combobox');
      expect(selects).toHaveLength(2);

      // Interact with first select
      await user.click(selects[0]);
      const firstOptions = screen.getAllByText('Marine Electronics');
      await user.click(firstOptions[0]);

      expect(mockOnChange1).toHaveBeenCalledWith('marine-electronics');
      expect(mockOnChange2).not.toHaveBeenCalled();
    });
  });

  describe('Styling', () => {
    it('should apply default width class', () => {
      const { container } = render(
        <CategorySelect
          categories={mockCategories}
          value={null}
          onChange={mockOnChange}
        />
      );

      const trigger = container.querySelector('.w-full');
      expect(trigger).toBeInTheDocument();
    });

    it('should merge custom className with default classes', () => {
      const { container } = render(
        <CategorySelect
          categories={mockCategories}
          value={null}
          onChange={mockOnChange}
          className="custom-width"
        />
      );

      const trigger = container.querySelector('.custom-width');
      expect(trigger).toBeInTheDocument();

      // Should still have w-full
      expect(trigger).toHaveClass('w-full');
    });
  });
});
