/**
 * CategoryRepository
 *
 * Data access layer for Category entities.
 * Handles product categories, blog categories, and all category-related queries.
 */

import { BaseRepository } from './BaseRepository';
import { transformCategory } from '@/lib/transformers';
import type { PayloadCategoryDocument } from '@/lib/transformers/PayloadTypes';
import type { Category } from '@/lib/types';
import type { CacheService } from '@/lib/cache';

export class CategoryRepository extends BaseRepository {
  constructor(cache?: CacheService) {
    super(cache);
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<Category[]> {
    const cacheKey = 'categories';
    const fetcher = async () => {
      const payload = await this.getPayload();
      const result = await payload.find({
        collection: 'categories',
        limit: 1000,
      });
      return result.docs.map((doc) => transformCategory(doc as unknown as PayloadCategoryDocument));
    };
    return this.executeQuery(cacheKey, fetcher);
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const cacheKey = `category:${slug}`;
    const fetcher = async () => {
      const payload = await this.getPayload();
      const result = await payload.find({
        collection: 'categories',
        where: {
          slug: {
            equals: slug,
          },
        },
        limit: 1,
      });

      if (result.docs.length === 0) {
        return null;
      }

      return transformCategory(result.docs[0] as unknown as PayloadCategoryDocument);
    };
    return this.executeQuery(cacheKey, fetcher);
  }

  /**
   * Get blog-specific categories
   */
  async getBlogCategories(): Promise<Category[]> {
    const categories = await this.getCategories();
    // Filter for categories used by blog posts
    // Filter for categories used by blog posts (all categories for now)
    return categories;
  }
}
