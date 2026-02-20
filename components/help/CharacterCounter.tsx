'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface CharacterCounterProps {
  /** Current character count */
  current: number;
  /** Maximum allowed characters */
  max: number;
  /** Minimum required characters (optional) */
  min?: number;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show the counter even when below threshold */
  alwaysShow?: boolean;
  /** Threshold percentage to start showing (default: 0 = always show) */
  showThreshold?: number;
}

/**
 * CharacterCounter - Displays character count with color-coded feedback
 *
 * Color states:
 * - Gray: < 80% of max
 * - Yellow/Warning: 80-95% of max
 * - Red/Destructive: > 95% of max or exceeds max
 *
 * @example
 * <CharacterCounter current={45} max={100} min={10} />
 * // Displays: "45/100" in appropriate color
 */
export function CharacterCounter({
  current,
  max,
  min,
  className,
  alwaysShow = true,
  showThreshold = 0,
}: CharacterCounterProps) {
  const percentage = (current / max) * 100;
  const thresholdMet = percentage >= showThreshold;

  // Don't render if below show threshold
  if (!alwaysShow && !thresholdMet) {
    return null;
  }

  // Determine color state based on percentage
  const getColorClass = (): string => {
    if (current > max) {
      // Over limit - red
      return 'text-destructive';
    }
    if (percentage > 95) {
      // Critical zone (95-100%) - red
      return 'text-destructive';
    }
    if (percentage >= 80) {
      // Warning zone (80-95%) - yellow/amber
      return 'text-yellow-600 dark:text-yellow-500';
    }
    // Normal zone (<80%) - gray
    return 'text-muted-foreground';
  };

  // Check if minimum requirement is not met
  const belowMinimum = min !== undefined && current < min;

  return (
    <div
      className={cn(
        'flex items-center gap-1 text-xs font-medium tabular-nums',
        getColorClass(),
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={`${current} of ${max} characters${min ? `, minimum ${min}` : ''}`}
    >
      <span>{current}</span>
      <span>/</span>
      <span>{max}</span>
      {belowMinimum && (
        <span className="text-muted-foreground ml-1">
          (min: {min})
        </span>
      )}
    </div>
  );
}

