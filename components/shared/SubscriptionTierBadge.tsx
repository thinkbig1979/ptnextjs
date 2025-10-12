import React from 'react';
import { Badge } from '@/components/ui/badge';

export interface SubscriptionTierBadgeProps {
  tier: 'free' | 'tier1' | 'tier2';
  className?: string;
}

/**
 * SubscriptionTierBadge Component
 *
 * Displays a tier badge with appropriate styling for different subscription tiers.
 */
export function SubscriptionTierBadge({ tier, className }: SubscriptionTierBadgeProps) {
  const tierConfig = {
    free: {
      label: 'Free Tier',
      variant: 'secondary' as const,
      className: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    },
    tier1: {
      label: 'Tier 1',
      variant: 'default' as const,
      className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    },
    tier2: {
      label: 'Tier 2',
      variant: 'default' as const,
      className: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    },
  };

  const config = tierConfig[tier];

  return (
    <Badge variant={config.variant} className={`${config.className} ${className || ''}`}>
      {config.label}
    </Badge>
  );
}
