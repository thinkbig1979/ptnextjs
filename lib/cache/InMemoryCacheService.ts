/**
 * In-Memory Cache Service Implementation
 *
 * A simple Map-based cache implementation with TTL support,
 * tag-based invalidation, and pattern matching.
 *
 * This is extracted from PayloadCMSDataService to be a standalone,
 * reusable caching layer.
 */

import type { CacheService } from './CacheService';
import type { CacheEntry, CacheOptions, CacheStats, CacheEntryInfo } from './types';

/**
 * In-memory cache implementation using JavaScript Map
 */
export class InMemoryCacheService implements CacheService {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private readonly defaultTTL: number;
  private hits = 0;
  private misses = 0;

  /**
   * Create a new in-memory cache service
   *
   * @param defaultTTL - Default time-to-live in milliseconds (default: 5 minutes)
   */
  constructor(defaultTTL: number = 5 * 60 * 1000) {
    this.defaultTTL = defaultTTL;
  }

  /**
   * Get a value from cache or fetch it using the provided function
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();
    const ttl = options?.ttl ?? this.defaultTTL;

    // Check if we have a valid cached entry
    if (cached && now - cached.timestamp < ttl) {
      cached.accessCount++;
      this.hits++;

      if (process.env.NODE_ENV === 'development') {
        console.log(`📋 Cache hit for ${key} (accessed ${cached.accessCount} times)`);
      }

      return cached.data as T;
    }

    // Cache miss - fetch new data
    this.misses++;

    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 Cache miss - Fetching ${key}...`);
    }

    const data = await fetcher();

    // Store in cache with metadata
    this.cache.set(key, {
      data,
      timestamp: now,
      accessCount: 1,
      tags: options?.tags,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Cached ${key} (${this.cache.size} total entries)`);
    }

    return data;
  }

  /**
   * Invalidate a specific cache entry by key
   */
  invalidate(key: string): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);

      if (process.env.NODE_ENV === 'development') {
        console.log(`🗑️ Invalidated cache key: ${key}`);
      }
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

    keysToDelete.forEach(key => {
      this.cache.delete(key);
    });

    if (process.env.NODE_ENV === 'development' && keysToDelete.length > 0) {
      console.log(`🗑️ Invalidated ${keysToDelete.length} cache entries matching pattern: ${pattern}`);
    }
  }

  /**
   * Invalidate all cache entries that have any of the specified tags
   */
  invalidateByTags(tags: string[]): void {
    if (tags.length === 0) return;

    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags && entry.tags.some(tag => tags.includes(tag))) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
    });

    if (process.env.NODE_ENV === 'development' && keysToDelete.length > 0) {
      console.log(`🗑️ Invalidated ${keysToDelete.length} cache entries with tags: ${tags.join(', ')}`);
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;

    if (process.env.NODE_ENV === 'development') {
      console.log(`🗑️ Cleared all ${size} cache entries`);
    }
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

    return Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: now - entry.timestamp,
      accessCount: entry.accessCount,
      tags: entry.tags,
    }));
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
 * Helper function to create a collection-specific invalidation pattern
 *
 * @param collection - Collection name (e.g., 'vendor', 'product', 'blog')
 * @param identifier - Optional identifier (ID or slug)
 * @returns Pattern string for invalidation
 */
export function createCollectionPattern(collection: string, identifier?: string): string {
  if (identifier) {
    return `${collection}*:${identifier}*`;
  }
  return `${collection}*`;
}

/**
 * Helper function to create standard cache tags for a collection entity
 *
 * @param collection - Collection name
 * @param id - Entity ID
 * @returns Array of standard tags
 */
export function createEntityTags(collection: string, id: string): string[] {
  return [
    collection,           // e.g., 'vendor'
    `${collection}:${id}`, // e.g., 'vendor:123'
  ];
}
