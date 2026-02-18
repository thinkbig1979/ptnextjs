/**
 * LRU Cache Service
 *
 * Implements CacheService using lru-cache for cross-request data caching.
 * Unlike InMemoryCacheService, this provides:
 * - Automatic eviction when max size is reached
 * - Better memory management for long-running processes
 * - Cross-request caching (beneficial with Vercel Fluid Compute)
 *
 * Best for: Frequently accessed data like vendors, products, categories
 */

import { LRUCache } from 'lru-cache';
import type { CacheService } from './CacheService';
import type { CacheOptions, CacheStats, CacheEntryInfo } from './types';

/**
 * Cache entry with metadata for tracking access and tags
 */
interface LRUCacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  tags?: string[];
}

/**
 * LRU Cache configuration options
 */
export interface LRUCacheServiceOptions {
  /** Maximum number of items in cache (default: 500) */
  maxItems?: number;
  /** Default time-to-live in milliseconds (default: 5 minutes) */
  defaultTTL?: number;
  /** Maximum memory size in bytes (optional, for memory-based eviction) */
  maxSize?: number;
}

/**
 * LRU Cache Service implementation
 *
 * Provides efficient cross-request caching with automatic eviction
 * based on least-recently-used policy.
 */
export class LRUCacheService implements CacheService {
  private cache: LRUCache<string, LRUCacheEntry<unknown>>;
  private readonly defaultTTL: number;
  private hits = 0;
  private misses = 0;

  /**
   * Create a new LRU cache service
   *
   * @param options - Configuration options
   */
  constructor(options: LRUCacheServiceOptions = {}) {
    const {
      maxItems = 500,
      defaultTTL = 5 * 60 * 1000, // 5 minutes
      maxSize,
    } = options;

    this.defaultTTL = defaultTTL;

    // Create LRU cache with size-based eviction
    this.cache = new LRUCache<string, LRUCacheEntry<unknown>>({
      max: maxItems,
      // Use memory size calculation if maxSize is provided
      ...(maxSize && {
        maxSize,
        sizeCalculation: (entry) => {
          // Rough estimate of entry size
          return JSON.stringify(entry.data).length;
        },
      }),
      // TTL is handled per-item via options
      ttl: defaultTTL,
      // Update age on access
      updateAgeOnGet: true,
      // Don't update TTL on access (use original TTL)
      updateAgeOnHas: false,
    });
  }

  /**
   * Get a value from cache or fetch it using the provided function
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const cached = this.cache.get(key) as LRUCacheEntry<T> | undefined;
    const now = Date.now();
    const ttl = options?.ttl ?? this.defaultTTL;

    // Check if we have a valid cached entry
    if (cached && now - cached.timestamp < ttl) {
      cached.accessCount++;
      this.hits++;

      return cached.data;
    }

    // Cache miss - fetch new data
    this.misses++;

    const data = await fetcher();

    // Store in cache with metadata
    const entry: LRUCacheEntry<T> = {
      data,
      timestamp: now,
      accessCount: 1,
      tags: options?.tags,
    };

    this.cache.set(key, entry, { ttl });

    return data;
  }

  /**
   * Invalidate a specific cache entry by key
   */
  invalidate(key: string): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
  }

  /**
   * Invalidate cache entries matching a pattern
   *
   * Supports simple wildcard patterns:
   * - 'vendor:*' matches all keys starting with 'vendor:'
   * - '*:123' matches all keys ending with ':123'
   * - 'vendor:*:products' matches keys with vendor: prefix and :products suffix
   */
  invalidatePattern(pattern: string): void {
    const regex = this.patternToRegex(pattern);
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => {
      this.cache.delete(key);
    });
  }

  /**
   * Invalidate all cache entries that have any of the specified tags
   */
  invalidateByTags(tags: string[]): void {
    if (tags.length === 0) return;

    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      const entry = this.cache.peek(key);
      if (entry?.tags && entry.tags.some((tag) => tags.includes(tag))) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => {
      this.cache.delete(key);
    });
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? this.hits / total : undefined;

    return {
      size: this.cache.size,
      entries: this.cache.size,
      hitRate,
      hits: this.hits,
      misses: this.misses,
    };
  }

  /**
   * Get detailed information about all cache entries
   */
  getEntryInfo(): CacheEntryInfo[] {
    const now = Date.now();
    const entries: CacheEntryInfo[] = [];

    for (const key of this.cache.keys()) {
      const entry = this.cache.peek(key);
      if (entry) {
        entries.push({
          key,
          age: now - entry.timestamp,
          accessCount: entry.accessCount,
          tags: entry.tags,
        });
      }
    }

    return entries;
  }

  /**
   * Convert a simple wildcard pattern to a RegExp
   *
   * @param pattern - Pattern with * wildcards
   * @returns RegExp that matches the pattern
   */
  private patternToRegex(pattern: string): RegExp {
    // Escape special regex characters except *
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    // Replace * with .*
    const regexPattern = escaped.replace(/\*/g, '.*');
    return new RegExp(`^${regexPattern}$`);
  }
}

/**
 * Singleton instance for cross-request caching
 * Use this for frequently accessed data like vendors, products, categories
 */
export const lruCacheService = new LRUCacheService({
  maxItems: 500,
  defaultTTL: 5 * 60 * 1000, // 5 minutes
});

/**
 * Create collection-specific cache patterns
 */
export function createLRUCollectionPattern(collection: string): string {
  return `${collection}:*`;
}

/**
 * Create entity-specific tags for cache invalidation
 */
export function createLRUEntityTags(collection: string, id?: string): string[] {
  const tags = [collection];
  if (id) {
    tags.push(`${collection}:${id}`);
  }
  return tags;
}
