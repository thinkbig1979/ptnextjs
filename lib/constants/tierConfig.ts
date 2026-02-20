/**
 * Tier Configuration Constants
 *
 * Client-side tier configuration that matches backend TierService and TierValidationService.
 * Used for frontend tier-based feature access control and UI display.
 */

export type Tier = 'free' | 'tier1' | 'tier2' | 'tier3';
export type TierFeature =
  | 'multipleLocations'
  | 'advancedAnalytics'
  | 'apiAccess'
  | 'customDomain'
  | 'promotionPack'
  | 'editorialContent'
  | 'media-gallery'
  | 'excel-import'
  | 'productManagement';

/**
 * Tier hierarchy levels (0-3)
 */
export const TIER_HIERARCHY: Record<Tier, number> = {
  free: 0,
  tier1: 1,
  tier2: 2,
  tier3: 3,
};

/**
 * Feature requirements (minimum tier level needed)
 */
export const TIER_FEATURE_MAP: Record<TierFeature, number> = {
  multipleLocations: TIER_HIERARCHY.tier1,
  advancedAnalytics: TIER_HIERARCHY.tier2,
  apiAccess: TIER_HIERARCHY.tier2,
  customDomain: TIER_HIERARCHY.tier2,
  promotionPack: TIER_HIERARCHY.tier3,
  editorialContent: TIER_HIERARCHY.tier3,
  'media-gallery': TIER_HIERARCHY.tier1,
  'excel-import': TIER_HIERARCHY.tier2,
  productManagement: TIER_HIERARCHY.tier2,
};

/**
 * Maximum locations allowed per tier
 */
export const MAX_LOCATIONS_PER_TIER: Record<Tier, number> = {
  free: 1,
  tier1: 3,
  tier2: 10,
  tier3: 999,
};

/**
 * Maximum products allowed per tier
 */
const MAX_PRODUCTS_PER_TIER: Record<Tier, number> = {
  free: 3,
  tier1: 10,
  tier2: 25,
  tier3: 999, // Effectively unlimited
};

/**
 * Maximum media items allowed per tier in the media gallery
 */
const MAX_MEDIA_PER_TIER: Record<Tier, number> = {
  free: 5,
  tier1: 20,
  tier2: 50,
  tier3: 999, // Effectively unlimited
};

/**
 * Tier display names
 */
export const TIER_NAMES: Record<Tier, string> = {
  free: 'Free',
  tier1: 'Professional',
  tier2: 'Business',
  tier3: 'Enterprise',
};

/**
 * Tier descriptions
 */
export const TIER_DESCRIPTIONS: Record<Tier, string> = {
  free: 'Basic profile with single location',
  tier1: 'Enhanced profile with up to 3 locations',
  tier2: 'Business profile with up to 10 locations and analytics',
  tier3: 'Enterprise profile with unlimited locations and premium features',
};

/**
 * Field access configuration by tier
 * Each tier includes access to all fields from lower tiers
 */
const TIER_FIELD_ACCESS: Record<Tier, string[]> = {
  free: [
    'companyName',
    'slug',
    'description',
    'logo',
    'contactEmail',
    'contactPhone',
    'published',
    'featured',
    'partner',
  ],
  tier1: [
    // Free fields are inherited
    'website',
    'linkedinUrl',
    'twitterUrl',
    'foundedYear',
    'certifications',
    'awards',
    'totalProjects',
    'employeeCount',
    'linkedinFollowers',
    'instagramFollowers',
    'clientSatisfactionScore',
    'repeatClientPercentage',
    'videoUrl',
    'videoThumbnail',
    'videoDuration',
    'videoTitle',
    'videoDescription',
    'caseStudies',
    'innovationHighlights',
    'teamMembers',
    'yachtProjects',
    'longDescription',
    'serviceAreas',
    'companyValues',
  ],
  tier2: [
    // Tier1 fields are inherited
    'locations',
    'featuredInCategory',
    'advancedAnalytics',
    'apiAccess',
    'customDomain',
  ],
  tier3: [
    // Tier2 fields are inherited
    'promotionPack',
    'editorialContent',
  ],
};

/**
 * Features available by tier
 */
const TIER_FEATURES: Record<Tier, TierFeature[]> = {
  free: [],
  tier1: ['multipleLocations', 'media-gallery'],
  tier2: ['multipleLocations', 'media-gallery', 'advancedAnalytics', 'apiAccess', 'customDomain', 'excel-import', 'productManagement'],
  tier3: [
    'multipleLocations',
    'media-gallery',
    'advancedAnalytics',
    'apiAccess',
    'customDomain',
    'excel-import',
    'productManagement',
    'promotionPack',
    'editorialContent',
  ],
};

/**
 * Tier colors for UI display
 */
const TIER_COLORS: Record<Tier, { bg: string; text: string; border: string }> = {
  free: {
    bg: 'bg-muted',
    text: 'text-gray-800',
    border: 'border-border',
  },
  tier1: {
    bg: 'bg-accent/10',
    text: 'text-accent',
    border: 'border-blue-300',
  },
  tier2: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300',
  },
  tier3: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-300',
  },
};

/**
 * Tier pricing information (for upgrade prompts)
 */
const TIER_PRICING: Record<Tier, { monthly: number; yearly: number }> = {
  free: { monthly: 0, yearly: 0 },
  tier1: { monthly: 99, yearly: 990 },
  tier2: { monthly: 299, yearly: 2990 },
  tier3: { monthly: 999, yearly: 9990 },
};

/**
 * Helper function to check if a tier can access a feature
 */
export function canAccessFeature(tier: Tier | undefined, feature: TierFeature): boolean {
  if (!tier) return false;

  const tierLevel = TIER_HIERARCHY[tier] ?? 0;
  const requiredLevel = TIER_FEATURE_MAP[feature] ?? TIER_HIERARCHY.tier2;

  return tierLevel >= requiredLevel;
}

/**
 * Helper function to get tier level
 */
export function getTierLevel(tier: Tier | undefined): number {
  if (!tier) return TIER_HIERARCHY.free;
  return TIER_HIERARCHY[tier] ?? TIER_HIERARCHY.free;
}

/**
 * Helper function to check if tier meets minimum requirement
 */
export function isTierOrHigher(tier: Tier | undefined, requiredTier: Tier): boolean {
  const tierLevel = getTierLevel(tier);
  const requiredLevel = TIER_HIERARCHY[requiredTier] ?? 0;
  return tierLevel >= requiredLevel;
}

/**
 * Helper function to get maximum locations for a tier
 */
export function getMaxLocations(tier: Tier | undefined): number {
  if (!tier) return MAX_LOCATIONS_PER_TIER.free;
  return MAX_LOCATIONS_PER_TIER[tier] ?? MAX_LOCATIONS_PER_TIER.free;
}

/**
 * Helper function to check if can add more locations
 */
export function canAddLocation(tier: Tier | undefined, currentLocationCount: number): boolean {
  const maxLocations = getMaxLocations(tier);
  return currentLocationCount < maxLocations;
}

/**
 * Helper function to get maximum products for a tier
 */
export function getMaxProducts(tier: Tier | undefined): number {
  if (!tier) return MAX_PRODUCTS_PER_TIER.free;
  return MAX_PRODUCTS_PER_TIER[tier] ?? MAX_PRODUCTS_PER_TIER.free;
}

/**
 * Helper function to check if can add more products
 */
export function canAddProduct(tier: Tier | undefined, currentProductCount: number): boolean {
  const maxProducts = getMaxProducts(tier);
  return currentProductCount < maxProducts;
}

/**
 * Helper function to get maximum media items for a tier
 */
export function getMaxMedia(tier: Tier | undefined): number {
  if (!tier) return MAX_MEDIA_PER_TIER.free;
  return MAX_MEDIA_PER_TIER[tier] ?? MAX_MEDIA_PER_TIER.free;
}

/**
 * Helper function to check if can add more media items
 */
function canAddMedia(tier: Tier | undefined, currentMediaCount: number): boolean {
  const maxMedia = getMaxMedia(tier);
  return currentMediaCount < maxMedia;
}

/**
 * Helper function to get all accessible fields for a tier
 */
export function getAccessibleFields(tier: Tier | undefined): string[] {
  if (!tier) return TIER_FIELD_ACCESS.free;

  const tierLevel = getTierLevel(tier);
  const accessibleFields: Set<string> = new Set();

  // Collect all fields from this tier and lower tiers
  for (const [tierKey, fields] of Object.entries(TIER_FIELD_ACCESS)) {
    const checkTierLevel = TIER_HIERARCHY[tierKey as Tier];
    if (tierLevel >= checkTierLevel) {
      fields.forEach((field) => accessibleFields.add(field));
    }
  }

  return Array.from(accessibleFields);
}

/**
 * Helper function to check if a field is accessible at a tier level
 */
export function canAccessField(tier: Tier | undefined, fieldName: string): boolean {
  const accessibleFields = getAccessibleFields(tier);
  return accessibleFields.includes(fieldName);
}

/**
 * Helper function to get tier display info
 */
function getTierDisplayInfo(tier: Tier | undefined): {
  name: string;
  description: string;
  colors: typeof TIER_COLORS[Tier];
  features: string[];
  maxLocations: number;
  pricing: typeof TIER_PRICING[Tier];
} {
  const normalizedTier = tier ?? 'free';
  return {
    name: TIER_NAMES[normalizedTier],
    description: TIER_DESCRIPTIONS[normalizedTier],
    colors: TIER_COLORS[normalizedTier],
    features: TIER_FEATURES[normalizedTier],
    maxLocations: MAX_LOCATIONS_PER_TIER[normalizedTier],
    pricing: TIER_PRICING[normalizedTier],
  };
}
