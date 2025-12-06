/**
 * TagRepository
 *
 * Data access layer for Tag entities.
 * Handles tags and tag-related queries including popularity.
 */

import { BaseRepository } from './BaseRepository';
import { transformTag } from '@/lib/transformers';
import type { PayloadTagDocument } from '@/lib/transformers/PayloadTypes';
import type { Tag } from '@/lib/types';
import type { CacheService } from '@/lib/cache';

export class TagRepository extends BaseRepository {
  constructor(cache?: CacheService) {
    super(cache);
  }

  /**
   * Get all tags
   */
  async getTags(): Promise<Tag[]> {
    const cacheKey = 'tags';
    const fetcher = async () => {
      const payload = await this.getPayload();
      const result = await payload.find({
        collection: 'tags',
        limit: 1000,
      });
      return result.docs.map(transformTag);
    };
    return this.executeQuery(cacheKey, fetcher);
  }

  /**
   * Get tag by slug
   */
  async getTagBySlug(slug: string): Promise<Tag | null> {
    const cacheKey = `tag:${slug}`;
    const fetcher = async () => {
      const payload = await this.getPayload();
      const result = await payload.find({
        collection: 'tags',
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

      return transformTag(result.docs[0]);
    };
    return this.executeQuery(cacheKey, fetcher);
  }

  /**
   * Get popular tags (sorted by usage count)
   */
  async getPopularTags(limit: number = 10): Promise<Tag[]> {
    const cacheKey = `popular-tags:${limit}`;
    const fetcher = async () => {
      const payload = await this.getPayload();
      const result = await payload.find({
        collection: 'tags',
        limit: 1000,
      });

      const tags = result.docs.map(transformTag);

      // Sort by usage count (if available) or fallback to alphabetical
      const sorted = tags.sort((a, b) => {
        const aCount = (a as any).usageCount || 0;
        const bCount = (b as any).usageCount || 0;
        if (aCount !== bCount) {
          return bCount - aCount;
        }
        return a.name.localeCompare(b.name);
      });

      return sorted.slice(0, limit);
    };
    return this.executeQuery(cacheKey, fetcher);
  }
}
