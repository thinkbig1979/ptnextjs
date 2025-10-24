'use client';

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles } from 'lucide-react';
import { Tier } from '@/lib/services/TierService';
import useTierAccess from '@/hooks/useTierAccess';

export interface TierGateProps {
  requiredTier: Tier;
  currentTier?: Tier | string;
  feature?: string;
  upgradeMessage?: string;
  upgradeUrl?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

/**
 * TierGate - Conditional rendering wrapper based on vendor tier
 *
 * Shows content if vendor has sufficient tier, otherwise displays upgrade prompt
 */
export function TierGate({
  requiredTier,
  currentTier,
  feature = 'multipleLocations',
  upgradeMessage,
  upgradeUrl = '/vendor/dashboard/billing',
  children,
  fallback,
  className = '',
}: TierGateProps) {
  const { hasAccess, upgradePath } = useTierAccess(
    feature as any,
    currentTier
  );

  // Grant access if tier is sufficient
  if (hasAccess) {
    return <>{children}</>;
  }

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Show upgrade prompt
  const defaultMessage =
    upgradeMessage ||
    `This feature requires ${upgradePath === 'tier2' ? 'Tier 2' : 'Tier 1'} subscription.`;

  return (
    <Alert className={className}>
      <Lock className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-yellow-500" />
        Premium Feature
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p>{defaultMessage}</p>
        <p className="text-sm text-muted-foreground">
          Upgrade to {upgradePath === 'tier2' ? 'Tier 2' : 'Tier 1'} to unlock this feature and
          many more.
        </p>
        <Button asChild size="sm" className="mt-2">
          <a href={upgradeUrl}>
            <Sparkles className="mr-2 h-4 w-4" />
            Upgrade Now
          </a>
        </Button>
      </AlertDescription>
    </Alert>
  );
}

export default TierGate;
