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
import type { BlogQueryParams } from './types';

export class BlogRepository extends BaseRepository {
  constructor(cache?: CacheService) {
    super(cache);
  }

  /**
   * Get all blog posts
   */
  async getAllBlogPosts(): Promise<BlogPost[]> {
    const cacheKey = 'blog-posts:all';
    const fetcher = async () => {
      const payload = await this.getPayload();
      const result = await payload.find({
        collection: 'blog',
        limit: 1000,
        sort: '-publishedAt',
      });
      return result.docs.map(transformPayloadBlogPost);
    };
    return this.executeQuery(cacheKey, fetcher);
  }

  /**
   * Get blog posts with optional filtering
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
        collection: 'blog',
        where,
        limit: params?.limit || 1000,
        sort: '-publishedAt',
      });

      return result.docs.map(transformPayloadBlogPost);
    };
    return this.executeQuery(cacheKey, fetcher);
  }

  /**
   * Get blog post by slug
   */
  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    const cacheKey = `blog-post:${slug}`;
    const fetcher = async () => {
      const payload = await this.getPayload();
      const result = await payload.find({
        collection: 'blog',
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

      return transformPayloadBlogPost(result.docs[0]);
    };
    return this.executeQuery(cacheKey, fetcher);
  }

  /**
   * Get all blog post slugs (for static generation)
   */
  async getBlogPostSlugs(): Promise<string[]> {
    const cacheKey = 'blog-post-slugs';
    const fetcher = async () => {
      const payload = await this.getPayload();
      const result = await payload.find({
        collection: 'blog',
        limit: 1000,
      });
      return result.docs
        .map(doc => doc.slug)
        .filter((slug): slug is string => typeof slug === 'string');
    };
    return this.executeQuery(cacheKey, fetcher);
  }
}
