/**
 * Repository Module
 *
 * Entity-specific repositories for data access layer.
 * Provides clean separation of concerns and optional caching support.
 *
 * Usage:
 * ```typescript
 * import { VendorRepository, ProductRepository } from '@/lib/repositories';
 * import { InMemoryCacheService } from '@/lib/cache';
 *
 * // Without caching
 * const vendorRepo = new VendorRepository();
 * const vendors = await vendorRepo.getAllVendors();
 *
 * // With caching
 * const cache = new InMemoryCacheService();
 * const productRepo = new ProductRepository(cache);
 * const products = await productRepo.getAllProducts();
 * ```
 */

import type { CacheService } from '@/lib/cache';

// Export repository classes
export { BaseRepository } from './BaseRepository';
export { VendorRepository } from './VendorRepository';
export { ProductRepository } from './ProductRepository';
export { BlogRepository } from './BlogRepository';
export { YachtRepository } from './YachtRepository';
export { CategoryRepository } from './CategoryRepository';
export { TagRepository } from './TagRepository';
export { CompanyRepository } from './CompanyRepository';

// Export types
export type {
  RepositoryConfig,
  QueryParams,
  VendorQueryParams,
  ProductQueryParams,
  BlogQueryParams,
  Repository,
} from './types';

// Repository factory for creating all repositories with shared cache
export class RepositoryFactory {
  private cache?: CacheService;

  constructor(cache?: CacheService) {
    this.cache = cache;
  }

  /**
   * Create VendorRepository instance
   */
  vendor() {
    const { VendorRepository } = require('./VendorRepository');
    return new VendorRepository(this.cache);
  }

  /**
   * Create ProductRepository instance
   */
  product() {
    const { ProductRepository } = require('./ProductRepository');
    return new ProductRepository(this.cache);
  }

  /**
   * Create BlogRepository instance
   */
  blog() {
    const { BlogRepository } = require('./BlogRepository');
    return new BlogRepository(this.cache);
  }

  /**
   * Create YachtRepository instance
   */
  yacht() {
    const { YachtRepository } = require('./YachtRepository');
    return new YachtRepository(this.cache);
  }

  /**
   * Create CategoryRepository instance
   */
  category() {
    const { CategoryRepository } = require('./CategoryRepository');
    return new CategoryRepository(this.cache);
  }

  /**
   * Create TagRepository instance
   */
  tag() {
    const { TagRepository } = require('./TagRepository');
    return new TagRepository(this.cache);
  }

  /**
   * Create CompanyRepository instance
   */
  company() {
    const { CompanyRepository } = require('./CompanyRepository');
    return new CompanyRepository(this.cache);
  }

  /**
   * Clear all caches across all repositories
   */
  clearAllCaches() {
    if (this.cache) {
      this.cache.clear();
    }
  }
}

/**
 * Create repository factory with optional shared cache
 *
 * @example
 * ```typescript
 * import { createRepositories } from '@/lib/repositories';
 * import { InMemoryCacheService } from '@/lib/cache';
 *
 * const cache = new InMemoryCacheService();
 * const repos = createRepositories(cache);
 *
 * const vendors = await repos.vendor().getAllVendors();
 * const products = await repos.product().getAllProducts();
 * ```
 */
export function createRepositories(cache?: CacheService): RepositoryFactory {
  return new RepositoryFactory(cache);
}
