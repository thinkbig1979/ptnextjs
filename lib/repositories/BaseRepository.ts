/**
 * BaseRepository
 *
 * Shared base class for all repositories providing common patterns:
 * - Payload CMS access
 * - Optional cache injection
 * - Cache key generation
 */

import { getPayload } from 'payload';
import config from '@payload-config';
import type { CacheService } from '@/lib/cache';
import type { Repository } from './types';

export abstract class BaseRepository implements Repository {
  protected cache?: CacheService;

  constructor(cache?: CacheService) {
    this.cache = cache;
  }

  /**
   * Get Payload CMS instance
   */
  protected async getPayload() {
    return getPayload({ config });
  }

  /**
   * Execute query with optional caching
   */
  protected async executeQuery<T>(
    cacheKey: string,
    fetcher: () => Promise<T>
  ): Promise<T> {
    if (this.cache) {
      return this.cache.get(cacheKey, fetcher);
    }
    return fetcher();
  }

  /**
   * Clear all cached data for this repository
   */
  clearCache(): void {
    // Subclasses can override if they need specific cache clearing logic
    if (this.cache) {
      this.cache.clear();
    }
  }
}
