/**
 * TierService - Tier-based feature access control
 *
 * Manages vendor subscription tiers:
 * - free: Single HQ location only
 * - tier1: Up to 3 locations
 * - tier2: Unlimited locations + premium features
 */

export type Tier = 'free' | 'tier1' | 'tier2';
export type TierFeature = 'multipleLocations' | 'advancedAnalytics' | 'apiAccess' | 'customDomain';

export const TIER_HIERARCHY: Record<Tier, number> = {
  free: 0,
  tier1: 1,
  tier2: 2,
};

export const TIER_FEATURE_MAP: Record<TierFeature, number> = {
  multipleLocations: TIER_HIERARCHY.tier1,
  advancedAnalytics: TIER_HIERARCHY.tier2,
  apiAccess: TIER_HIERARCHY.tier2,
  customDomain: TIER_HIERARCHY.tier2,
};

export const MAX_LOCATIONS_PER_TIER: Record<Tier, number> = {
  free: 1,
  tier1: 3,
  tier2: 999,
};

export class TierService {
  static canAccessFeature(tier: Tier | undefined, feature: TierFeature): boolean {
    if (!tier) return feature === 'multipleLocations' ? false : true;

    const tierLevel = TIER_HIERARCHY[tier] ?? 0;
    const requiredLevel = TIER_FEATURE_MAP[feature] ?? TIER_HIERARCHY.tier2;

    return tierLevel >= requiredLevel;
  }

  static getTierLevel(tier: Tier | undefined): number {
    if (!tier) return TIER_HIERARCHY.free;
    return TIER_HIERARCHY[tier] ?? TIER_HIERARCHY.free;
  }

  static getTierFromLevel(level: number): Tier {
    if (level >= TIER_HIERARCHY.tier2) return 'tier2';
    if (level >= TIER_HIERARCHY.tier1) return 'tier1';
    return 'free';
  }

  static isTierOrHigher(tier: Tier | undefined, requiredTier: Tier): boolean {
    const tierLevel = this.getTierLevel(tier);
    const requiredLevel = TIER_HIERARCHY[requiredTier] ?? 0;
    return tierLevel >= requiredLevel;
  }

  static getMaxLocations(tier: Tier | undefined): number {
    if (!tier) return MAX_LOCATIONS_PER_TIER.free;
    return MAX_LOCATIONS_PER_TIER[tier] ?? MAX_LOCATIONS_PER_TIER.free;
  }

  static canAddLocation(tier: Tier | undefined, currentLocationCount: number): boolean {
    const maxLocations = this.getMaxLocations(tier);
    return currentLocationCount < maxLocations;
  }

  static getUpgradePath(feature: TierFeature): Tier {
    const requiredLevel = TIER_FEATURE_MAP[feature] ?? TIER_HIERARCHY.tier2;
    return this.getTierFromLevel(requiredLevel);
  }

  static getFeatureInfo(feature: TierFeature, currentTier: Tier | undefined) {
    const hasAccess = this.canAccessFeature(currentTier, feature);
    const upgradePath = this.getUpgradePath(feature);

    return {
      feature,
      hasAccess,
      upgradePath,
      currentTier: currentTier || 'free',
    };
  }
}

export default TierService;
