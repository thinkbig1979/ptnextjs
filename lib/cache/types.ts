/**
 * Cache Service Types
 *
 * Defines interfaces and types for the caching system.
 */

/**
 * Cache entry with metadata for tracking access and expiration
 */
export interface CacheEntry<T> {
  /** The cached data */
  data: T;
  /** Timestamp when the entry was created/last updated */
  timestamp: number;
  /** Number of times this entry has been accessed */
  accessCount: number;
  /** Optional tags for cache invalidation by category */
  tags?: string[];
}

/**
 * Options for cache operations
 */
export interface CacheOptions {
  /** Time-to-live in milliseconds (overrides default TTL) */
  ttl?: number;
  /** Tags for categorizing cache entries for bulk invalidation */
  tags?: string[];
}

/**
 * Cache statistics for monitoring and debugging
 */
export interface CacheStats {
  /** Number of entries in the cache */
  size: number;
  /** Total number of entries (same as size for backward compatibility) */
  entries: number;
  /** Cache hit rate (0-1), undefined if not tracked */
  hitRate?: number;
  /** Total cache hits */
  hits?: number;
  /** Total cache misses */
  misses?: number;
}

/**
 * Detailed information about a specific cache entry
 */
export interface CacheEntryInfo {
  /** Cache key */
  key: string;
  /** Age of the entry in milliseconds */
  age: number;
  /** Number of times accessed */
  accessCount: number;
  /** Optional tags */
  tags?: string[];
}
