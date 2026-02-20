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
;

// Core interface
export type { CacheService } from './CacheService';

// Implementations
export { InMemoryCacheService,   } from './InMemoryCacheService';
;
;

// Default export - singleton instance with default TTL
;
