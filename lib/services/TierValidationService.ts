/**
 * TierValidationService - Tier-based field access validation
 *
 * Validates vendor field access based on subscription tier level.
 * Enforces tier hierarchy and feature access control.
 */

import { Tier, TierFeature, TIER_HIERARCHY, TIER_FEATURE_MAP, MAX_LOCATIONS_PER_TIER } from './TierService';

export type TierValidationResult = {
  valid: boolean;
  errors?: string[];
  restrictedFields?: string[];
};

export type LocationLimitResult = {
  valid: boolean;
  maxAllowed: number;
  current?: number;
  message?: string;
};

// Field access configuration by tier
const TIER_FIELD_ACCESS = {
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
    // Includes all free fields plus:
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
    // Includes all tier1 fields plus:
    'locations', // Multiple locations
    'featuredInCategory',
    'advancedAnalytics',
    'apiAccess',
    'customDomain',
  ],
  tier3: [
    // Includes all tier2 fields plus:
    'promotionPack',
    'editorialContent',
  ],
} as const;

// Note: Feature-to-tier mapping is imported from TIER_FEATURE_MAP via TierService
// The authoritative source is lib/constants/tierConfig.ts

// Helper function to capitalize field names
const capitalizeField = (field: string): string => {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

export class TierValidationService {
  /**
   * Validate if a tier can access a specific field
   */
  static validateFieldAccess(tier: Tier, fieldName: string): boolean {
    const tierLevel = TIER_HIERARCHY[tier] ?? 0;

    // Check if field is accessible at this tier level
    for (const [tierKey, fields] of Object.entries(TIER_FIELD_ACCESS)) {
      const checkTierLevel = TIER_HIERARCHY[tierKey as Tier];
      if (tierLevel >= checkTierLevel && (fields as readonly string[]).includes(fieldName)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Validate multiple fields for tier access
   */
  static validateFieldsAccess(
    tier: Tier,
    fields: string[]
  ): TierValidationResult {
    const restrictedFields: string[] = [];

    for (const field of fields) {
      if (!this.validateFieldAccess(tier, field)) {
        restrictedFields.push(field);
      }
    }

    if (restrictedFields.length > 0) {
      return {
        valid: false,
        restrictedFields,
        errors: [
          `Fields ${restrictedFields.join(', ')} are not accessible for ${tier} tier`,
        ],
      };
    }

    return { valid: true };
  }

  /**
   * Validate location count against tier limit
   */
  static validateLocationLimit(
    tier: Tier,
    locationCount: number
  ): LocationLimitResult {
    const maxAllowed = MAX_LOCATIONS_PER_TIER[tier] ?? 1;

    if (locationCount > maxAllowed) {
      return {
        valid: false,
        maxAllowed,
        current: locationCount,
        message: `Tier ${tier} allows maximum ${maxAllowed} Location(s), but ${locationCount} provided`,
      };
    }

    return {
      valid: true,
      maxAllowed,
      current: locationCount,
    };
  }

  /**
   * Check if a tier can access a specific feature
   */
  static canAccessFeature(tier: Tier, feature: TierFeature): boolean {
    const tierLevel = TIER_HIERARCHY[tier] ?? 0;
    const requiredLevel = TIER_FEATURE_MAP[feature] ?? TIER_HIERARCHY.tier2;

    return tierLevel >= requiredLevel;
  }

  /**
   * Get all features available for a tier
   */
  static getTierFeatures(tier: Tier): TierFeature[] {
    const tierLevel = TIER_HIERARCHY[tier] ?? 0;
    const features: TierFeature[] = [];

    for (const [feature, requiredLevel] of Object.entries(TIER_FEATURE_MAP)) {
      if (tierLevel >= requiredLevel) {
        features.push(feature as TierFeature);
      }
    }

    return features;
  }

  /**
   * Get location limit for a tier
   */
  static getLocationLimit(tier: Tier): number {
    return MAX_LOCATIONS_PER_TIER[tier] ?? 1;
  }

  /**
   * Get all accessible fields for a tier
   */
  static getAccessibleFields(tier: Tier): string[] {
    const tierLevel = TIER_HIERARCHY[tier] ?? 0;
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
   * Validate tier upgrade/downgrade
   * Checks if vendor data is compatible with new tier
   */
  static validateTierChange(
    currentTier: Tier,
    newTier: Tier,
    vendorData: Record<string, any>
  ): TierValidationResult {
    const errors: string[] = [];
    const currentLevel = TIER_HIERARCHY[currentTier];
    const newLevel = TIER_HIERARCHY[newTier];

    // Downgrade validation
    if (newLevel < currentLevel) {
      // Check if vendor has data in fields they'll lose access to
      const newAccessibleFields = this.getAccessibleFields(newTier);
      const currentAccessibleFields = this.getAccessibleFields(currentTier);
      const fieldsToLose = currentAccessibleFields.filter(
        (field) => !newAccessibleFields.includes(field)
      );

      for (const field of fieldsToLose) {
        if (vendorData[field] !== undefined && vendorData[field] !== null) {
          // Check if it's an array with data
          if (Array.isArray(vendorData[field]) && vendorData[field].length > 0) {
            errors.push(
              `Cannot downgrade: Vendor has data in ${field} which requires ${currentTier}`
            );
          }
          // Check if it's a non-empty object/string
          else if (
            typeof vendorData[field] === 'object' &&
            Object.keys(vendorData[field]).length > 0
          ) {
            errors.push(
              `Cannot downgrade: Vendor has data in ${field} which requires ${currentTier}`
            );
          } else if (
            typeof vendorData[field] === 'string' &&
            vendorData[field].length > 0
          ) {
            errors.push(
              `Cannot downgrade: Vendor has data in ${field} which requires ${currentTier}`
            );
          }
        }
      }

      // Check location count
      if (vendorData.locations && Array.isArray(vendorData.locations)) {
        const locationLimit = this.validateLocationLimit(
          newTier,
          vendorData.locations.length
        );
        if (!locationLimit.valid) {
          errors.push(locationLimit.message || 'Location limit exceeded');
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}

export default TierValidationService;
