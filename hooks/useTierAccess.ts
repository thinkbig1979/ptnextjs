'use client';

import { useCallback, useMemo } from 'react';
import TierService, { Tier, TierFeature } from '@/lib/services/TierService';

export interface UseTierAccessResult {
  hasAccess: boolean;
  tier: Tier;
  upgradePath: Tier;
  feature: TierFeature;
  canAddLocation: (currentCount: number) => boolean;
  maxLocations: number;
}

/**
 * Custom hook for checking tier-based feature access
 */
export function useTierAccess(
  feature: TierFeature,
  tier?: Tier | string
): UseTierAccessResult {
  const normalizedTier = (tier as Tier | undefined) || 'free';

  const hasAccess = useMemo(
    () => TierService.canAccessFeature(normalizedTier, feature),
    [normalizedTier, feature]
  );

  const upgradePath = useMemo(
    () => TierService.getUpgradePath(feature),
    [feature]
  );

  const maxLocations = useMemo(
    () => TierService.getMaxLocations(normalizedTier),
    [normalizedTier]
  );

  const canAddLocation = useCallback(
    (currentCount: number) =>
      TierService.canAddLocation(normalizedTier, currentCount),
    [normalizedTier]
  );

  return {
    hasAccess,
    tier: normalizedTier,
    upgradePath,
    feature,
    canAddLocation,
    maxLocations,
  };
}

export default useTierAccess;
