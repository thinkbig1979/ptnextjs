/**
 * Repository Types
 *
 * Common types and interfaces for repository pattern implementation.
 * Repositories provide data access layer with optional caching.
 */

import type { CacheService } from '@/lib/cache';
import type { PaginationParams } from '@/lib/types/pagination';

/**
 * Base configuration for all repositories
 */
export interface RepositoryConfig {
  cache?: CacheService;
}

/**
 * Common query parameters for filtering
 */
export interface QueryParams extends PaginationParams {
  category?: string;
  featured?: boolean;
  /** @deprecated Use page and limit from PaginationParams instead */
  limit?: number;
  /** @deprecated Use page from PaginationParams instead */
  offset?: number;
  /** Query depth for relationships (0-3) */
  depth?: number;
}

/**
 * Vendor-specific query parameters
 */
export interface VendorQueryParams extends QueryParams {
  partnersOnly?: boolean;
}

/**
 * Product-specific query parameters
 */
export interface ProductQueryParams extends QueryParams {
  vendorId?: string;
  partnerId?: string;
}

/**
 * Blog-specific query parameters
 */
export interface BlogQueryParams extends QueryParams {
  category?: string;
}

/**
 * Repository base interface
 */
export interface Repository {
  /**
   * Clear all cached data for this repository
   */
  clearCache(): void;
}
