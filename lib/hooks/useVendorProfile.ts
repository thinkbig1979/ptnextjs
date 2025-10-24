'use client';

/**
 * useVendorProfile Hook
 *
 * Custom hook for fetching and managing vendor profile data using SWR.
 * Provides caching, revalidation, and optimistic updates.
 */

import useSWR, { SWRConfiguration } from 'swr';
import { Vendor } from '@/lib/types';
import { fetchVendor, VendorApiError } from '@/lib/api/vendorClient';
import { computeYearsInBusiness } from '@/lib/utils/computedFields';

export interface UseVendorProfileOptions extends SWRConfiguration<Vendor> {
  /**
   * Vendor ID to fetch
   */
  vendorId?: string | null;

  /**
   * Initial data (from server-side)
   */
  initialData?: Vendor;

  /**
   * Enable automatic revalidation on focus
   * @default false
   */
  revalidateOnFocus?: boolean;

  /**
   * Enable automatic revalidation on reconnect
   * @default true
   */
  revalidateOnReconnect?: boolean;

  /**
   * Revalidation interval in milliseconds
   * @default undefined (no interval)
   */
  refreshInterval?: number;
}

export interface UseVendorProfileReturn {
  /**
   * Vendor data
   */
  vendor: Vendor | null;

  /**
   * Loading state (initial load)
   */
  isLoading: boolean;

  /**
   * Validating state (revalidating)
   */
  isValidating: boolean;

  /**
   * Error object
   */
  error: VendorApiError | Error | null;

  /**
   * Computed: Years in business
   */
  yearsInBusiness: number | null;

  /**
   * Mutate function for optimistic updates
   */
  mutate: (
    data?: Vendor | Promise<Vendor> | ((currentData?: Vendor) => Vendor | Promise<Vendor>),
    shouldRevalidate?: boolean
  ) => Promise<Vendor | undefined>;

  /**
   * Refresh vendor data
   */
  refresh: () => Promise<void>;

  /**
   * Check if vendor has specific field
   */
  hasField: (fieldName: string) => boolean;
}

/**
 * Fetcher function for SWR
 */
const vendorFetcher = async (url: string): Promise<Vendor> => {
  // Extract vendor ID from URL
  const vendorId = url.split('/').pop();
  if (!vendorId) {
    throw new Error('Invalid vendor URL');
  }
  return fetchVendor(vendorId);
};

/**
 * useVendorProfile Hook
 *
 * Fetch and manage vendor profile data with SWR caching
 *
 * @param options - Hook options
 * @returns Vendor profile data and methods
 *
 * @example
 * ```tsx
 * const { vendor, isLoading, error, refresh } = useVendorProfile({
 *   vendorId: '123',
 *   revalidateOnFocus: false,
 * });
 * ```
 */
export function useVendorProfile(
  options: UseVendorProfileOptions = {}
): UseVendorProfileReturn {
  const {
    vendorId,
    initialData,
    revalidateOnFocus = false,
    revalidateOnReconnect = true,
    refreshInterval,
    ...swrOptions
  } = options;

  // Generate SWR key
  const swrKey = vendorId ? `/api/portal/vendors/${vendorId}` : null;

  // Use SWR for data fetching
  const {
    data: vendor,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<Vendor, VendorApiError | Error>(swrKey, vendorFetcher, {
    fallbackData: initialData,
    revalidateOnFocus,
    revalidateOnReconnect,
    refreshInterval,
    ...swrOptions,
  });

  // Compute years in business
  const yearsInBusiness = computeYearsInBusiness(vendor?.foundedYear);

  /**
   * Refresh vendor data
   */
  const refresh = async () => {
    await mutate();
  };

  /**
   * Check if vendor has a specific field
   */
  const hasField = (fieldName: string): boolean => {
    if (!vendor) return false;
    const value = vendor[fieldName as keyof Vendor];
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return true;
  };

  return {
    vendor: vendor ?? null,
    isLoading,
    isValidating,
    error: error ?? null,
    yearsInBusiness,
    mutate,
    refresh,
    hasField,
  };
}

/**
 * useVendorProfileBySlug Hook
 *
 * Fetch vendor profile by slug (public endpoint)
 *
 * @param slug - Vendor slug
 * @param options - SWR options
 * @returns Vendor profile data and methods
 */
export function useVendorProfileBySlug(
  slug: string | null,
  options: SWRConfiguration<Vendor> = {}
): UseVendorProfileReturn {
  const swrKey = slug ? `/api/vendors/${slug}` : null;

  const {
    data: vendor,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<Vendor, VendorApiError | Error>(
    swrKey,
    async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch vendor');
      }
      const data = await response.json();
      return data.data as Vendor;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      ...options,
    }
  );

  const yearsInBusiness = computeYearsInBusiness(vendor?.foundedYear);

  const refresh = async () => {
    await mutate();
  };

  const hasField = (fieldName: string): boolean => {
    if (!vendor) return false;
    const value = vendor[fieldName as keyof Vendor];
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return true;
  };

  return {
    vendor: vendor ?? null,
    isLoading,
    isValidating,
    error: error ?? null,
    yearsInBusiness,
    mutate,
    refresh,
    hasField,
  };
}

export default useVendorProfile;
