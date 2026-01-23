/**
 * TierService - Tier-based feature access control
 *
 * Manages vendor subscription tiers:
 * - free: Single HQ location only
 * - tier1: Up to 3 locations
 * - tier2: Up to 10 locations + premium features
 * - tier3: Unlimited locations + all features
 *
 * IMPORTANT: All tier configuration is centralized in lib/constants/tierConfig.ts
 * This service provides helper methods but imports all constants from tierConfig.
 */

import {
  type Tier,
  type TierFeature,
  TIER_HIERARCHY,
  TIER_FEATURE_MAP,
  MAX_LOCATIONS_PER_TIER,
} from '@/lib/constants/tierConfig';

// Re-export types and constants for backwards compatibility
export { type Tier, type TierFeature, TIER_HIERARCHY, TIER_FEATURE_MAP, MAX_LOCATIONS_PER_TIER };

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
    if (level >= TIER_HIERARCHY.tier3) return 'tier3';
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
