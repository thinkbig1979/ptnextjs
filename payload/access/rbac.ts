import type { Access } from 'payload';

/**
 * Check if user is an admin
 */
export const isAdmin: Access = ({ req: { user } }) => {
  return user?.role === 'admin';
};

/**
 * Check if user is a vendor
 */
export const isVendor: Access = ({ req: { user } }) => {
  return user?.role === 'vendor';
};

/**
 * Check if user is authenticated (admin or vendor)
 */
export const isAuthenticated: Access = ({ req: { user } }) => {
  return Boolean(user);
};

/**
 * Check if user is admin OR vendor accessing their own resource
 */
export const isAdminOrSelf: Access = ({ req: { user }, id }) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return user.id === id;
};

/**
 * Check if vendor has specific tier access
 * @param minTier - Minimum tier required ('free' | 'tier1' | 'tier2')
 */
export const hasTierAccess = (minTier: 'free' | 'tier1' | 'tier2'): Access => {
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

    const tier = vendor.docs[0].tier;
    const tierLevels = { free: 0, tier1: 1, tier2: 2 };

    return tierLevels[tier] >= tierLevels[minTier];
  };
};

/**
 * Check if user can access tier-restricted field
 * Used in field-level access control
 */
export const canAccessTierField = (requiredTier: 'free' | 'tier1' | 'tier2'): Access => {
  return async ({ req: { user, payload }, data }) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role !== 'vendor') return false;

    // Check vendor's tier
    const tier = data?.tier || 'free';
    const tierLevels = { free: 0, tier1: 1, tier2: 2 };

    return tierLevels[tier] >= tierLevels[requiredTier];
  };
};
