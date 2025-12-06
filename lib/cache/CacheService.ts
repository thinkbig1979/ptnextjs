/**
 * Cache Service Interface
 *
 * Defines the contract for cache implementations.
 * This allows for different caching strategies (in-memory, Redis, etc.)
 * while maintaining a consistent API.
 */

import type { CacheOptions, CacheStats, CacheEntryInfo } from './types';

/**
 * Abstract interface for cache implementations
 */
export interface CacheService {
  /**
   * Get a value from cache or fetch it using the provided function
   *
   * @param key - Unique cache key
   * @param fetcher - Function to fetch data if not cached
   * @param options - Cache options (TTL, tags)
   * @returns The cached or freshly fetched data
   */
  get<T>(key: string, fetcher: () => Promise<T>, options?: CacheOptions): Promise<T>;

  /**
   * Invalidate a specific cache entry by key
   *
   * @param key - Cache key to invalidate
   */
  invalidate(key: string): void;

  /**
   * Invalidate cache entries matching a pattern
   *
   * @param pattern - Pattern to match (supports wildcards like 'vendor:*')
   */
  invalidatePattern(pattern: string): void;

  /**
   * Invalidate all cache entries that have any of the specified tags
   *
   * @param tags - Array of tags to match
   */
  invalidateByTags(tags: string[]): void;

  /**
   * Clear all cache entries
   */
  clear(): void;

  /**
   * Get cache statistics
   *
   * @returns Statistics about cache usage
   */
  getStats(): CacheStats;

  /**
   * Get detailed information about all cache entries
   *
   * @returns Array of entry information
   */
  getEntryInfo(): CacheEntryInfo[];
}
