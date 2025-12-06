import type { Access } from 'payload';

/**
 * Check if user has admin role
 *
 * @returns {boolean} True if user is an admin, false otherwise
 *
 * @example
 * ```ts
 * access: {
 *   create: isAdmin,
 *   update: isAdmin,
 * }
 * ```
 */
export const isAdmin: Access = ({ req: { user } }) => {
  return user?.role === 'admin';
};

/**
 * Check if user has vendor role
 *
 * @returns {boolean} True if user is a vendor, false otherwise
 *
 * @example
 * ```ts
 * access: {
 *   read: isVendor,
 * }
 * ```
 */
export const isVendor: Access = ({ req: { user } }) => {
  return user?.role === 'vendor';
};

/**
 * Check if user is authenticated (admin or vendor)
 *
 * @returns {boolean} True if user is logged in with any role, false otherwise
 *
 * @example
 * ```ts
 * access: {
 *   read: isAuthenticated,
 * }
 * ```
 */
export const isAuthenticated: Access = ({ req: { user } }) => {
  return Boolean(user);
};

/**
 * Check if user is admin OR accessing their own resource
 *
 * @returns {boolean} True if user is admin or accessing their own document
 *
 * @example
 * ```ts
 * access: {
 *   update: isAdminOrSelf,
 *   delete: isAdminOrSelf,
 * }
 * ```
 */
export const isAdminOrSelf: Access = ({ req: { user }, id }) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return user.id === id;
};

/**
 * Tier level type definition
 */
type TierLevel = 'free' | 'tier1' | 'tier2';

/**
 * Tier level hierarchy mapping
 * Higher numbers represent higher tier levels
 */
const TIER_LEVELS: Record<TierLevel, number> = {
  free: 0,
  tier1: 1,
  tier2: 2,
};

/**
 * Check if vendor has minimum tier access
 *
 * Admins always have access. For vendors, checks if their tier level
 * meets or exceeds the required minimum tier level.
 *
 * @param {TierLevel} minTier - Minimum tier required ('free' | 'tier1' | 'tier2')
 * @returns {Access} Access control function
 *
 * @example
 * ```ts
 * access: {
 *   create: hasTierAccess('tier2'), // Only tier2+ vendors can create
 * }
 * ```
 */
export const hasTierAccess = (minTier: TierLevel): Access => {
  return async ({ req: { user, payload } }) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role !== 'vendor') return false;

    // Fetch vendor to check tier
    const vendor = await payload.find({
      collection: 'vendors',
      where: {
        user: {
          equals: user.id,
        },
      },
    });

    if (!vendor.docs[0]) return false;

    const tier = vendor.docs[0].tier as TierLevel;

    return TIER_LEVELS[tier] >= TIER_LEVELS[minTier];
  };
};

/**
 * Check if user can access tier-restricted field
 *
 * Used in field-level access control. Admins always have access.
 * For vendors, checks if the document's tier meets or exceeds the required tier.
 *
 * @param {TierLevel} requiredTier - Tier required to access this field
 * @returns {Access} Access control function for field-level restrictions
 *
 * @example
 * ```ts
 * {
 *   name: 'premiumFeature',
 *   type: 'text',
 *   access: {
 *     read: canAccessTierField('tier2'),
 *     update: canAccessTierField('tier2'),
 *   }
 * }
 * ```
 */
export const canAccessTierField = (requiredTier: TierLevel): Access => {
  return async ({ req: { user }, data }) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role !== 'vendor') return false;

    // Check vendor's tier
    const tier = (data?.tier || 'free') as TierLevel;

    return TIER_LEVELS[tier] >= TIER_LEVELS[requiredTier];
  };
};
