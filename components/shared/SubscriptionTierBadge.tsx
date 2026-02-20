import React from 'react';
import { Badge } from '@/components/ui/badge';

interface SubscriptionTierBadgeProps {
  tier: 'free' | 'tier1' | 'tier2';
  className?: string;
}

/**
 * SubscriptionTierBadge Component
 *
 * Displays a tier badge with appropriate styling for different subscription tiers.
 */
export function SubscriptionTierBadge({ tier, className }: SubscriptionTierBadgeProps): React.JSX.Element {
  const tierConfig = {
    free: {
      label: 'Free Tier',
      variant: 'secondary' as const,
      className: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    },
    tier1: {
      label: 'Tier 1',
      variant: 'default' as const,
      className: 'bg-primary/20 text-primary hover:bg-primary/30',
    },
    tier2: {
      label: 'Tier 2',
      variant: 'default' as const,
      className: 'bg-accent text-accent-foreground hover:bg-accent/90',
    },
  };

  const config = tierConfig[tier];

  return (
    <Badge variant={config.variant} className={`${config.className} ${className || ''}`}>
      {config.label}
    </Badge>
  );
}
