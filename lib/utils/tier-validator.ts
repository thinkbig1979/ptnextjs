/**
 * Tier-based field restriction validator
 *
 * Enforces tier restrictions for vendor profile updates
 */

export type VendorTier = 'free' | 'tier1' | 'tier2';

/**
 * Tier-based field access mapping
 */
const TIER_FIELDS: Record<VendorTier, string[]> = {
  free: ['companyName', 'description', 'logo', 'contactEmail', 'contactPhone'],
  tier1: [
    'companyName',
    'description',
    'logo',
    'contactEmail',
    'contactPhone',
    'website',
    'linkedinUrl',
    'twitterUrl',
    'certifications',
  ],
  tier2: [
    'companyName',
    'description',
    'logo',
    'contactEmail',
    'contactPhone',
    'website',
    'linkedinUrl',
    'twitterUrl',
    'certifications',
    // Tier2 would include products in future, but that's a relationship field
  ],
};

/**
 * Get allowed fields for a given tier
 */
export function getAllowedFieldsForTier(tier: VendorTier): string[] {
  return TIER_FIELDS[tier] || TIER_FIELDS.free;
}

/**
 * Filter update data to only include fields allowed for the vendor's tier
 *
 * @param updateData - The fields the user is attempting to update
 * @param tier - The vendor's current tier
 * @param isAdmin - Whether the user is an admin (bypasses tier restrictions)
 * @returns Filtered object with only allowed fields
 * @throws Error if restricted fields are attempted without proper tier
 */
export function filterFieldsByTier(
  updateData: Record<string, any>,
  tier: VendorTier,
  isAdmin: boolean = false
): Record<string, any> {
  // Admins bypass all tier restrictions
  if (isAdmin) {
    return updateData;
  }

  const allowedFields = getAllowedFieldsForTier(tier);
  const attemptedFields = Object.keys(updateData);

  // Check for restricted fields
  const restrictedFields = attemptedFields.filter(
    (field) => !allowedFields.includes(field)
  );

  if (restrictedFields.length > 0) {
    throw new Error(
      `Tier restriction: Fields ${restrictedFields.join(', ')} require tier1 or higher. Current tier: ${tier}`
    );
  }

  // Filter to only allowed fields (defensive programming)
  const filteredData: Record<string, any> = {};
  attemptedFields.forEach((field) => {
    if (allowedFields.includes(field)) {
      filteredData[field] = updateData[field];
    }
  });

  return filteredData;
}

/**
 * Check if a specific field is allowed for the given tier
 */
export function isFieldAllowedForTier(
  field: string,
  tier: VendorTier,
  isAdmin: boolean = false
): boolean {
  if (isAdmin) {
    return true;
  }

  const allowedFields = getAllowedFieldsForTier(tier);
  return allowedFields.includes(field);
}

/**
 * Get tier hierarchy level (for comparison)
 */
export function getTierLevel(tier: VendorTier): number {
  const tierLevels: Record<VendorTier, number> = {
    free: 0,
    tier1: 1,
    tier2: 2,
  };
  return tierLevels[tier] || 0;
}

/**
 * Check if a vendor can access features of a required tier
 */
export function hasTierAccess(
  currentTier: VendorTier,
  requiredTier: VendorTier,
  isAdmin: boolean = false
): boolean {
  if (isAdmin) {
    return true;
  }

  return getTierLevel(currentTier) >= getTierLevel(requiredTier);
}
