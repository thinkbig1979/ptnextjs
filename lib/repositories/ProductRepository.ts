/**
 * ProductRepository
 *
 * Data access layer for Product entities.
 * Handles product queries with vendor/partner relationships and filtering.
 */

import { BaseRepository } from './BaseRepository';
import { transformPayloadProduct } from '@/lib/transformers';
import type { Product } from '@/lib/types';
import type { CacheService } from '@/lib/cache';
import type { ProductQueryParams } from './types';

export class ProductRepository extends BaseRepository {
  constructor(cache?: CacheService) {
    super(cache);
  }

  /**
   * Get all products
   */
  async getAllProducts(): Promise<Product[]> {
    const cacheKey = 'products:all';
    const fetcher = async () => {
      const payload = await this.getPayload();
      const result = await payload.find({
        collection: 'products',
        limit: 1000,
        depth: 2, // Include vendor and category relationships
      });
      return result.docs.map(transformPayloadProduct);
    };
    return this.executeQuery(cacheKey, fetcher);
  }

  /**
   * Get products with optional filtering
   */
  async getProducts(params?: ProductQueryParams): Promise<Product[]> {
    const cacheKey = `products:${JSON.stringify(params || {})}`;
    const fetcher = async () => {
      const payload = await this.getPayload();

      const where: any = {};

      if (params?.category) {
        where.category = {
          equals: params.category,
        };
      }

      // Support both vendorId and partnerId (legacy compatibility)
      const vendorId = params?.vendorId || params?.partnerId;
      if (vendorId) {
        where.vendor = {
          equals: vendorId,
        };
      }

      const result = await payload.find({
        collection: 'products',
        where,
        limit: params?.limit || 1000,
        depth: 2,
      });

      return result.docs.map(transformPayloadProduct);
    };
    return this.executeQuery(cacheKey, fetcher);
  }

  /**
   * Get product by slug
   */
  async getProductBySlug(slug: string): Promise<Product | null> {
    const cacheKey = `product:${slug}`;
    const fetcher = async () => {
      const payload = await this.getPayload();
      const result = await payload.find({
        collection: 'products',
        where: {
          slug: {
            equals: slug,
          },
        },
        limit: 1,
        depth: 2,
      });

      if (result.docs.length === 0) {
        return null;
      }

      return transformPayloadProduct(result.docs[0]);
    };
    return this.executeQuery(cacheKey, fetcher);
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    const cacheKey = `product:id:${id}`;
    const fetcher = async () => {
      const payload = await this.getPayload();
      const result = await payload.findByID({
        collection: 'products',
        id,
        depth: 2,
      });

      if (!result) {
        return null;
      }

      return transformPayloadProduct(result);
    };
    return this.executeQuery(cacheKey, fetcher);
  }

  /**
   * Get products by vendor ID
   */
  async getProductsByVendor(vendorId: string): Promise<Product[]> {
    return this.getProducts({ vendorId });
  }

  /**
   * Get products by partner ID (legacy compatibility)
   */
  async getProductsByPartner(partnerId: string): Promise<Product[]> {
    return this.getProducts({ partnerId });
  }

  /**
   * Get all product slugs (for static generation)
   */
  async getProductSlugs(): Promise<string[]> {
    const cacheKey = 'product-slugs';
    const fetcher = async () => {
      const payload = await this.getPayload();
      const result = await payload.find({
        collection: 'products',
        limit: 1000,
      });
      return result.docs
        .map(doc => doc.slug)
        .filter((slug): slug is string => typeof slug === 'string');
    };
    return this.executeQuery(cacheKey, fetcher);
  }
}
