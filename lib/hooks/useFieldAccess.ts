'use client';

/**
 * useFieldAccess Hook
 *
 * Custom hook for checking field access based on vendor tier.
 * Provides component-level access control for tier-restricted fields.
 */

import { useMemo } from 'react';
import { Tier, canAccessField, getAccessibleFields, getTierLevel } from '@/lib/constants/tierConfig';

export interface UseFieldAccessOptions {
  /**
   * Current vendor tier
   */
  tier?: Tier | null;

  /**
   * Is user an admin (bypass tier restrictions)
   */
  isAdmin?: boolean;
}

export interface UseFieldAccessReturn {
  /**
   * Check if a specific field is accessible
   * @param fieldName - Field name to check
   * @returns Boolean indicating access
   */
  canAccess: (fieldName: string) => boolean;

  /**
   * Get all accessible fields for current tier
   */
  accessibleFields: string[];

  /**
   * Current tier level (0-3)
   */
  tierLevel: number;

  /**
   * Check if multiple fields are accessible
   * @param fieldNames - Array of field names
   * @returns Boolean indicating if all fields are accessible
   */
  canAccessAll: (fieldNames: string[]) => boolean;

  /**
   * Check if any of the fields are accessible
   * @param fieldNames - Array of field names
   * @returns Boolean indicating if any field is accessible
   */
  canAccessAny: (fieldNames: string[]) => boolean;

  /**
   * Get restricted fields from a list
   * @param fieldNames - Array of field names
   * @returns Array of restricted field names
   */
  getRestrictedFields: (fieldNames: string[]) => string[];

  /**
   * Is user an admin (bypasses restrictions)
   */
  isAdmin: boolean;
}

/**
 * useFieldAccess Hook
 *
 * Check field access based on vendor tier
 *
 * @param options - Hook options
 * @returns Field access methods and state
 *
 * @example
 * ```tsx
 * const { canAccess, accessibleFields } = useFieldAccess({
 *   tier: 'tier1',
 *   isAdmin: false,
 * });
 *
 * if (canAccess('certifications')) {
 *   // Show certifications field
 * }
 * ```
 */
export function useFieldAccess(options: UseFieldAccessOptions = {}): UseFieldAccessReturn {
  const { tier, isAdmin = false } = options;

  // Memoize tier level
  const tierLevel = useMemo(() => getTierLevel(tier ?? undefined), [tier]);

  // Memoize accessible fields
  const accessibleFields = useMemo(() => {
    if (isAdmin) {
      // Admins have access to all fields
      return getAccessibleFields('tier3');
    }
    return getAccessibleFields(tier ?? undefined);
  }, [tier, isAdmin]);

  /**
   * Check if a specific field is accessible
   */
  const canAccess = (fieldName: string): boolean => {
    if (isAdmin) return true;
    return canAccessField(tier ?? undefined, fieldName);
  };

  /**
   * Check if all fields are accessible
   */
  const canAccessAll = (fieldNames: string[]): boolean => {
    if (isAdmin) return true;
    return fieldNames.every((fieldName) => canAccessField(tier ?? undefined, fieldName));
  };

  /**
   * Check if any field is accessible
   */
  const canAccessAny = (fieldNames: string[]): boolean => {
    if (isAdmin) return true;
    return fieldNames.some((fieldName) => canAccessField(tier ?? undefined, fieldName));
  };

  /**
   * Get restricted fields from a list
   */
  const getRestrictedFields = (fieldNames: string[]): string[] => {
    if (isAdmin) return [];
    return fieldNames.filter((fieldName) => !canAccessField(tier ?? undefined, fieldName));
  };

  return {
    canAccess,
    accessibleFields,
    tierLevel,
    canAccessAll,
    canAccessAny,
    getRestrictedFields,
    isAdmin,
  };
}

/**
 * useFieldAccessWithVendor Hook
 *
 * Check field access with vendor object (automatically extracts tier)
 *
 * @param vendor - Vendor object (with tier field)
 * @param isAdmin - Is user an admin
 * @returns Field access methods and state
 *
 * @example
 * ```tsx
 * const { canAccess } = useFieldAccessWithVendor(vendor, false);
 * ```
 */
export function useFieldAccessWithVendor(
  vendor: { tier?: Tier | null } | null,
  isAdmin = false
): UseFieldAccessReturn {
  return useFieldAccess({
    tier: vendor?.tier ?? null,
    isAdmin,
  });
}

/**
 * useFieldAccessContext Hook
 *
 * Check field access using VendorDashboardContext
 * Must be used within VendorDashboardProvider
 *
 * @returns Field access methods and state
 *
 * @example
 * ```tsx
 * const { canAccess } = useFieldAccessContext();
 * ```
 */
export function useFieldAccessContext(): UseFieldAccessReturn {
  // Import the hook - this is safe because this function
  // should only be called from components within VendorDashboardProvider
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useVendorDashboard } = require('@/lib/context/VendorDashboardContext');

  // Call the hook unconditionally at the top level (React hooks rule)
  // This will throw if not within VendorDashboardProvider (expected behavior)
  const context = useVendorDashboard();
  const vendor = context.vendor;

  return useFieldAccess({
    tier: vendor?.tier ?? null,
    isAdmin: false,
  });
}

export default useFieldAccess;
