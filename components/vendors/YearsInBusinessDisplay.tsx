'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

export interface YearsInBusinessDisplayProps {
  foundedYear?: number | null;
  showLabel?: boolean;
  variant?: 'badge' | 'inline';
  className?: string;
}

/**
 * Compute years in business from founded year
 */
export function computeYearsInBusiness(foundedYear?: number | null): number | null {
  if (!foundedYear || foundedYear < 1800 || foundedYear > new Date().getFullYear()) {
    return null;
  }
  return new Date().getFullYear() - foundedYear;
}

/**
 * YearsInBusinessDisplay Component
 *
 * Displays computed years in business or "Established [year]" format
 *
 * @param foundedYear - Year company was founded
 * @param showLabel - Show "years in business" label
 * @param variant - Display as badge or inline text
 * @param className - Additional CSS classes
 */
export function YearsInBusinessDisplay({
  foundedYear,
  showLabel = true,
  variant = 'badge',
  className = '',
}: YearsInBusinessDisplayProps) {
  const years = computeYearsInBusiness(foundedYear);

  if (years === null) {
    return null;
  }

  const content = (
    <>
      <Calendar className="h-3.5 w-3.5" />
      {showLabel ? (
        <span>
          {years} {years === 1 ? 'year' : 'years'} in business
        </span>
      ) : (
        <span>Est. {foundedYear}</span>
      )}
    </>
  );

  if (variant === 'badge') {
    return (
      <Badge variant="outline" className={`inline-flex items-center gap-1.5 ${className}`}>
        {content}
      </Badge>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 ${className}`}>
      {content}
    </span>
  );
}

export default YearsInBusinessDisplay;
