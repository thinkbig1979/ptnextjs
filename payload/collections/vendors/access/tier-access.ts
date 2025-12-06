/**
 * Reusable tier-based access control functions for Vendor fields
 */

import type { FieldAccess } from 'payload';

/**
 * Creates a tier-based access control function for field-level update access
 * @param minTier - Minimum tier required to update the field
 * @returns Field access function that checks vendor's tier
 */
export const createTierUpdateAccess = (
  minTier: 'tier1' | 'tier2' | 'tier3'
): FieldAccess => {
  return ({ req: { user }, data }) => {
    if (!user) return false;
    if (user.role === 'admin') return true;

    const tierOrder = ['free', 'tier1', 'tier2', 'tier3'];
    const vendorTier = data?.tier || 'free';
    return tierOrder.indexOf(vendorTier) >= tierOrder.indexOf(minTier);
  };
};

/**
 * Tier 1+ field update access
 */
export const tier1UpdateAccess: FieldAccess = createTierUpdateAccess('tier1');

/**
 * Tier 2+ field update access
 */
export const tier2UpdateAccess: FieldAccess = createTierUpdateAccess('tier2');

/**
 * Tier 3 field update access
 */
export const tier3UpdateAccess: FieldAccess = createTierUpdateAccess('tier3');

/**
 * Creates a tier-based admin condition for showing/hiding fields
 * @param minTier - Minimum tier required to see the field
 * @returns Admin condition function
 */
export const createTierCondition = (minTier: 'tier1' | 'tier2' | 'tier3') => {
  return (data: any) => {
    const tierOrder = ['free', 'tier1', 'tier2', 'tier3'];
    const vendorTier = data?.tier || 'free';
    return tierOrder.indexOf(vendorTier) >= tierOrder.indexOf(minTier);
  };
};

/**
 * Tier 1+ admin condition
 */
export const tier1Condition = createTierCondition('tier1');

/**
 * Tier 2+ admin condition
 */
export const tier2Condition = createTierCondition('tier2');

/**
 * Tier 3 admin condition
 */
export const tier3Condition = createTierCondition('tier3');

/**
 * Public read access (all fields are readable by public)
 */
export const publicReadAccess: FieldAccess = () => true;

/**
 * Admin-only update access
 */
export const adminOnlyUpdateAccess: FieldAccess = ({ req: { user } }) => {
  return user?.role === 'admin';
};
