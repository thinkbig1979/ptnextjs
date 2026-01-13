/**
 * BlogRepository
 *
 * Data access layer for Blog Post entities.
 * Handles blog posts and blog-related queries.
 */

import { BaseRepository } from './BaseRepository';
import { transformPayloadBlogPost } from '@/lib/transformers';
import type { BlogPost } from '@/lib/types';
import type { CacheService } from '@/lib/cache';
import type { BlogQueryParams } from './types_new';
import type { PaginatedResult } from '@/lib/types/pagination';
import { normalizePaginationParams, calculatePaginationMetadata, PAGINATION_DEFAULTS } from '@/lib/types/pagination';
import type { PayloadBlogDocument } from '@/lib/transformers/PayloadTypes';

export class BlogRepository extends BaseRepository {
  constructor(cache?: CacheService) {
    super(cache);
  }

  /**
   * Get all blog posts (non-paginated - for backward compatibility)
   * @deprecated Use getBlogPostsPaginated for better performance
   */
  async getAllBlogPosts(): Promise<BlogPost[]> {
    const cacheKey = 'blog-posts:all';
    const fetcher = async () => {
      const payload = await this.getPayload();
      const result = await payload.find({
        collection: 'blog-posts',
        limit: 1000,
        sort: '-publishedAt',
      });
      return result.docs.map((doc) => transformPayloadBlogPost(doc as unknown as PayloadBlogDocument));
    };
    return this.executeQuery(cacheKey, fetcher);
  }

  /**
   * Get blog posts with optional filtering (non-paginated - backward compatible)
   * @deprecated Use getBlogPostsPaginated for better performance
   */
  async getBlogPosts(params?: BlogQueryParams): Promise<BlogPost[]> {
    const cacheKey = `blog-posts:${JSON.stringify(params || {})}`;
    const fetcher = async () => {
      const payload = await this.getPayload();

      const where: any = {};

      if (params?.category) {
        where.category = {
          equals: params.category,
        };
      }

      if (params?.featured) {
        where.featured = {
          equals: true,
        };
      }

      const result = await payload.find({
        collection: 'blog-posts',
        where,
        limit: params?.limit || 1000,
        sort: '-publishedAt',
        depth: params?.depth !== undefined ? params.depth : 1,
      });

      return result.docs.map((doc) => transformPayloadBlogPost(doc as unknown as PayloadBlogDocument));
    };
    return this.executeQuery(cacheKey, fetcher);
  }

  /**
   * Get blog posts with pagination support
   * This is the new recommended method for fetching blog posts
   */
  async getBlogPostsPaginated(params?: BlogQueryParams): Promise<PaginatedResult<BlogPost>> {
    // Normalize pagination params
    const normalizedParams = normalizePaginationParams(params);
    const { page, limit, sort, order } = normalizedParams;

    // Default sort for blog posts is by publishedAt descending
    const defaultSort = params?.sort || '-publishedAt';

    const cacheKey = `blog-posts:paginated:${JSON.stringify({ ...params, page, limit, sort: defaultSort })}`;
    const fetcher = async () => {
      const payload = await this.getPayload();

      const where: any = {};

      if (params?.category) {
        where.category = {
          equals: params.category,
        };
      }

      if (params?.featured) {
        where.featured = {
          equals: true,
        };
      }

      // Determine depth - use 0-1 for list views, 2-3 for detail views
      const depth = params?.depth !== undefined ? params.depth : 1;

      const result = await payload.find({
        collection: 'blog-posts',
        where,
        limit,
        page,
        depth,
        sort: defaultSort,
      });

      const blogPosts = result.docs.map((doc) => transformPayloadBlogPost(doc as unknown as PayloadBlogDocument));

      return calculatePaginationMetadata(blogPosts, result.totalDocs, page, limit);
    };

    return this.executeQuery(cacheKey, fetcher);
  }

  /**
   * Get blog post by slug
   */
  async getBlogPostBySlug(slug: string, depth: number = 2): Promise<BlogPost | null> {
    const cacheKey = `blog-post:${slug}:depth:${depth}`;
    const fetcher = async () => {
      const payload = await this.getPayload();
      const result = await payload.find({
        collection: 'blog-posts',
        where: {
          slug: {
            equals: slug,
          },
        },
        limit: 1,
        depth,
      });

      if (result.docs.length === 0) {
        return null;
      }

      return transformPayloadBlogPost(result.docs[0] as unknown as PayloadBlogDocument);
    };
    return this.executeQuery(cacheKey, fetcher);
  }

  /**
   * Get featured blog posts (backward compatible)
   */
  async getFeaturedBlogPosts(): Promise<BlogPost[]> {
    return this.getBlogPosts({ featured: true });
  }

  /**
   * Get featured blog posts with pagination
   */
  async getFeaturedBlogPostsPaginated(params?: BlogQueryParams): Promise<PaginatedResult<BlogPost>> {
    return this.getBlogPostsPaginated({ ...params, featured: true });
  }

  /**
   * Get all blog post slugs (for static generation)
   */
  async getBlogPostSlugs(): Promise<string[]> {
    const cacheKey = 'blog-post-slugs';
    const fetcher = async () => {
      const payload = await this.getPayload();
      const result = await payload.find({
        collection: 'blog-posts',
        limit: 1000,
        depth: 0, // No need for relationships when just getting slugs
      });
      return result.docs
        .map(doc => doc.slug)
        .filter((slug): slug is string => typeof slug === 'string');
    };
    return this.executeQuery(cacheKey, fetcher);
  }
}
