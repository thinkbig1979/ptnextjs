/**
 * YachtRepository
 *
 * Data access layer for Yacht entities.
 * Handles yacht queries including featured and vendor-specific yachts.
 */

import { BaseRepository } from './BaseRepository';
import { transformYacht } from '@/lib/transformers';
import type { Yacht } from '@/lib/types';
import type { CacheService } from '@/lib/cache';
import type { PayloadYachtDocument } from '@/lib/transformers/PayloadTypes';

export class YachtRepository extends BaseRepository {
  constructor(cache?: CacheService) {
    super(cache);
  }

  /**
   * Get all yachts
   */
  async getYachts(): Promise<Yacht[]> {
    const cacheKey = 'yachts';
    const fetcher = async () => {
      const payload = await this.getPayload();
      const result = await payload.find({
        collection: 'yachts',
        limit: 1000,
      });
      return result.docs.map((doc) => transformYacht(doc as unknown as PayloadYachtDocument));
    };
    return this.executeQuery(cacheKey, fetcher);
  }

  /**
   * Get yacht by slug
   */
  async getYachtBySlug(slug: string): Promise<Yacht | null> {
    const cacheKey = `yacht:${slug}`;
    const fetcher = async () => {
      const payload = await this.getPayload();
      const result = await payload.find({
        collection: 'yachts',
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

      return transformYacht(result.docs[0] as unknown as PayloadYachtDocument);
    };
    return this.executeQuery(cacheKey, fetcher);
  }

  /**
   * Get featured yachts
   */
  async getFeaturedYachts(): Promise<Yacht[]> {
    const cacheKey = 'yachts:featured';
    const fetcher = async () => {
      const payload = await this.getPayload();
      const result = await payload.find({
        collection: 'yachts',
        where: {
          featured: {
            equals: true,
          },
        },
        limit: 1000,
      });
      return result.docs.map((doc) => transformYacht(doc as unknown as PayloadYachtDocument));
    };
    return this.executeQuery(cacheKey, fetcher);
  }

  /**
   * Get yachts by vendor slug
   */
  async getYachtsByVendor(vendorSlug: string): Promise<Yacht[]> {
    const cacheKey = `yachts:vendor:${vendorSlug}`;
    const fetcher = async () => {
      const payload = await this.getPayload();

      // First get the vendor ID from the slug
      const vendorResult = await payload.find({
        collection: 'vendors',
        where: {
          slug: {
            equals: vendorSlug,
          },
        },
        limit: 1,
      });

      if (vendorResult.docs.length === 0) {
        return [];
      }

      const vendorId = vendorResult.docs[0].id;

      // Then get yachts for this vendor
      const result = await payload.find({
        collection: 'yachts',
        where: {
          vendors: {
            contains: vendorId,
          },
        },
        limit: 1000,
      });

      return result.docs.map((doc) => transformYacht(doc as unknown as PayloadYachtDocument));
    };
    return this.executeQuery(cacheKey, fetcher);
  }
}
