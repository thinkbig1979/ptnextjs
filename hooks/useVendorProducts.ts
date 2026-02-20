'use client';

import useSWR from 'swr';
import type { Product } from '@/lib/types';

/**
 * API Response Format
 *
 * Current API returns: { success: true, data: Product[] }
 * Future API will return: { success: true, data: { products: Product[], total: number, page: number, limit: number } }
 *
 * This hook handles both formats for forward compatibility.
 */
interface ProductsResponse {
  success: boolean;
  data?: Product[] | {
    products: Product[];
    total: number;
    page: number;
    limit: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

interface UseVendorProductsOptions {
  published?: boolean;
  limit?: number;
  page?: number;
}

interface UseVendorProductsReturn {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  mutate: () => void;
}

/**
 * Fetcher function for SWR
 */
const fetcher = async (url: string): Promise<ProductsResponse> => {
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Failed to fetch products');
  }

  return data;
};

/**
 * useVendorProducts Hook
 *
 * Fetch and manage vendor products with SWR caching
 *
 * @param vendorId - Vendor ID to fetch products for (null disables fetching)
 * @param options - Optional filters and pagination params
 * @returns Product list data and methods
 *
 * @example
 * ```tsx
 * // Basic usage
 * const { products, isLoading, mutate } = useVendorProducts(vendorId);
 *
 * // With filters
 * const { products } = useVendorProducts(vendorId, {
 *   published: true,
 *   limit: 10,
 *   page: 2,
 * });
 *
 * // Force refresh after mutation
 * const handleSuccess = async () => {
 *   await mutate(); // Revalidate the product list
 * };
 * ```
 */
export function useVendorProducts(
  vendorId: string | null,
  options: UseVendorProductsOptions = {}
): UseVendorProductsReturn {
  const { published, limit = 20, page = 1 } = options;

  /**
   * Build URL with query parameters
   * Returns null when vendorId is null (SWR won't fetch)
   */
  const buildUrl = () => {
    if (!vendorId) return null;

    const params = new URLSearchParams();

    if (published !== undefined) {
      params.set('published', String(published));
    }

    // Note: API doesn't currently support limit/page, but we send them for future compatibility
    params.set('limit', String(limit));
    params.set('page', String(page));

    const queryString = params.toString();
    return `/api/portal/vendors/${vendorId}/products${queryString ? `?${queryString}` : ''}`;
  };

  // Use SWR for data fetching with caching
  const { data, error, isLoading, mutate } = useSWR<ProductsResponse>(
    buildUrl(),
    fetcher,
    {
      revalidateOnFocus: false, // Don't revalidate on window focus
      dedupingInterval: 5000,   // Dedupe requests within 5 seconds
      keepPreviousData: true,   // Keep previous data while fetching new data
    }
  );

  /**
   * Normalize response data to handle both current and future API formats
   *
   * Current: { success: true, data: Product[] }
   * Future: { success: true, data: { products, total, page, limit } }
   */
  const normalizeData = () => {
    if (!data?.data) {
      return {
        products: [],
        total: 0,
        page: 1,
        limit: limit,
      };
    }

    // Check if data is in paginated format
    if (Array.isArray(data.data)) {
      // Current format: data is an array
      return {
        products: data.data,
        total: data.data.length,
        page: page,
        limit: limit,
      };
    } else {
      // Future format: data is an object with pagination metadata
      return {
        products: data.data.products || [],
        total: data.data.total || 0,
        page: data.data.page || page,
        limit: data.data.limit || limit,
      };
    }
  };

  const normalized = normalizeData();

  return {
    products: normalized.products,
    total: normalized.total,
    page: normalized.page,
    limit: normalized.limit,
    isLoading,
    isError: !!error,
    error: error || null,
    mutate,
  };
}

