'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Sparkles, Circle } from 'lucide-react';
import { Tier } from '@/lib/services/TierService';

export interface TierBadgeProps {
  tier: Tier | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const TIER_CONFIG = {
  free: {
    label: 'Free',
    variant: 'secondary' as const,
    icon: Circle,
    className: 'bg-muted text-foreground dark:bg-muted dark:text-muted-foreground',
  },
  tier1: {
    label: 'Tier 1',
    variant: 'default' as const,
    icon: Star,
    className: 'bg-accent/10 text-accent dark:bg-accent/10 dark:text-accent',
  },
  tier2: {
    label: 'Tier 2',
    variant: 'default' as const,
    icon: Sparkles,
    className: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  },
  tier3: {
    label: 'Tier 3',
    variant: 'default' as const,
    icon: Crown,
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  },
};

const SIZE_CLASSES = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

/**
 * TierBadge Component
 *
 * Displays vendor tier level with color coding and optional icon
 *
 * @param tier - Vendor tier level ('free', 'tier1', 'tier2', 'tier3')
 * @param size - Badge size ('sm', 'md', 'lg')
 * @param showIcon - Whether to show tier icon
 * @param className - Additional CSS classes
 */
export function TierBadge({
  tier,
  size = 'md',
  showIcon = true,
  className = '',
}: TierBadgeProps) {
  const normalizedTier = (tier as Tier) || 'free';
  const config = TIER_CONFIG[normalizedTier] || TIER_CONFIG.free;
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${SIZE_CLASSES[size]} ${className} inline-flex items-center gap-1`}
    >
      {showIcon && <Icon size={iconSize} />}
      <span>{config.label}</span>
    </Badge>
  );
}

export default TierBadge;
