'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/types';

export interface CategorySelectProps {
  categories: Category[];
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
}

/**
 * CategorySelect Component
 *
 * Category dropdown filter for vendors page using shadcn/ui Select.
 *
 * Features:
 * - "All Categories" option (value: null)
 * - Category list from props
 * - Uses category slug as value (for URL params)
 * - Accessible (keyboard navigation, ARIA labels)
 * - Styled with shadcn Select component
 *
 * @param categories - Array of categories to display
 * @param value - Currently selected category slug (or null for "All Categories")
 * @param onChange - Callback when selection changes (receives slug or null)
 * @param className - Additional CSS classes
 *
 * @example
 * <CategorySelect
 *   categories={categories}
 *   value={selectedCategory}
 *   onChange={(slug) => setSelectedCategory(slug)}
 * />
 */
export function CategorySelect({
  categories,
  value,
  onChange,
  className,
}: CategorySelectProps): React.JSX.Element {
  // Radix Select requires non-empty string values
  // Use sentinel value for "All Categories" option
  const ALL_CATEGORIES_VALUE = '__all__';

  const selectValue = value ?? ALL_CATEGORIES_VALUE;
  const handleValueChange = (newValue: string) => {
    onChange(newValue === ALL_CATEGORIES_VALUE ? null : newValue);
  };

  return (
    <Select value={selectValue} onValueChange={handleValueChange}>
      <SelectTrigger className={cn('w-full', className)}>
        <SelectValue placeholder="All Categories" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_CATEGORIES_VALUE}>All Categories</SelectItem>
        {categories.map((cat) => (
          <SelectItem key={cat.id} value={cat.slug}>
            {cat.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default CategorySelect;
