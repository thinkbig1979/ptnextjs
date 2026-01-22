/**
 * Cache Service Module
 *
 * Provides a flexible caching layer with support for:
 * - Multiple cache implementations (in-memory, Redis, etc.)
 * - TTL-based expiration
 * - Tag-based invalidation
 * - Pattern-based invalidation
 * - Cache statistics and monitoring
 *
 * Example usage:
 * ```typescript
 * import { InMemoryCacheService } from '@/lib/cache';
 *
 * const cache = new InMemoryCacheService();
 *
 * // Get with automatic caching
 * const data = await cache.get('vendors', async () => {
 *   return await fetchVendors();
 * }, { tags: ['vendor'], ttl: 10 * 60 * 1000 });
 *
 * // Invalidate by pattern
 * cache.invalidatePattern('vendor:*');
 *
 * // Invalidate by tags
 * cache.invalidateByTags(['vendor']);
 * ```
 */

// Types
export type { CacheEntry, CacheOptions, CacheStats, CacheEntryInfo } from './types';

// Core interface
export type { CacheService } from './CacheService';

// Implementations
export { InMemoryCacheService, createCollectionPattern, createEntityTags } from './InMemoryCacheService';
export { LRUCacheService, lruCacheService, createLRUCollectionPattern, createLRUEntityTags } from './LRUCacheService';
export type { LRUCacheServiceOptions } from './LRUCacheService';

// Default export - singleton instance with default TTL
export { InMemoryCacheService as default } from './InMemoryCacheService';
