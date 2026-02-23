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
import type { ProductQueryParams } from './types_new';
import type { PaginatedResult } from '@/lib/types/pagination';
import { normalizePaginationParams, calculatePaginationMetadata, PAGINATION_DEFAULTS } from '@/lib/types/pagination';
import type { Where } from 'payload';

export class ProductRepository extends BaseRepository {
  constructor(cache?: CacheService) {
    super(cache);
  }

  /**
   * Get all products (non-paginated - for backward compatibility)
   * @deprecated Use getProductsPaginated for better performance
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
   * Get products with optional filtering (non-paginated - backward compatible)
   * @deprecated Use getProductsPaginated for better performance
   */
  async getProducts(params?: ProductQueryParams): Promise<Product[]> {
    const cacheKey = `products:${JSON.stringify(params || {})}`;
    const fetcher = async () => {
      const payload = await this.getPayload();

      const where: Where = {};

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
        depth: params?.depth !== undefined ? params.depth : 2,
      });

      return result.docs.map(transformPayloadProduct);
    };
    return this.executeQuery(cacheKey, fetcher);
  }

  /**
   * Get products with pagination support
   * This is the new recommended method for fetching products
   */
  async getProductsPaginated(params?: ProductQueryParams): Promise<PaginatedResult<Product>> {
    // Normalize pagination params
    const normalizedParams = normalizePaginationParams(params);
    const { page, limit, sort, order } = normalizedParams;

    // Calculate offset for Payload CMS
    const offset = (page - 1) * limit;

    const cacheKey = `products:paginated:${JSON.stringify({ ...params, page, limit, sort, order })}`;
    const fetcher = async () => {
      const payload = await this.getPayload();

      const where: Where = {};

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

      // Determine depth - use 0-1 for list views, 2-3 for detail views
      const depth = params?.depth !== undefined ? params.depth : 1;

      // Build sort string for Payload
      const sortField = sort.startsWith('-') ? sort : `${order === 'desc' ? '-' : ''}${sort}`;

      const result = await payload.find({
        collection: 'products',
        where,
        limit,
        page,
        depth,
        sort: sortField,
      });

      const products = result.docs.map(transformPayloadProduct);

      return calculatePaginationMetadata(products, result.totalDocs, page, limit);
    };

    return this.executeQuery(cacheKey, fetcher);
  }

  /**
   * Get product by slug
   */
  async getProductBySlug(slug: string, depth: number = 2): Promise<Product | null> {
    const cacheKey = `product:${slug}:depth:${depth}`;
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
        depth,
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
  async getProductById(id: string, depth: number = 2): Promise<Product | null> {
    const cacheKey = `product:id:${id}:depth:${depth}`;
    const fetcher = async () => {
      const payload = await this.getPayload();
      const result = await payload.findByID({
        collection: 'products',
        id,
        depth,
      });

      if (!result) {
        return null;
      }

      return transformPayloadProduct(result);
    };
    return this.executeQuery(cacheKey, fetcher);
  }

  /**
   * Get products by vendor ID (backward compatible)
   */
  async getProductsByVendor(vendorId: string): Promise<Product[]> {
    return this.getProducts({ vendorId });
  }

  /**
   * Get products by vendor ID with pagination
   */
  async getProductsByVendorPaginated(vendorId: string, params?: ProductQueryParams): Promise<PaginatedResult<Product>> {
    return this.getProductsPaginated({ ...params, vendorId });
  }

  /**
   * Get products by partner ID (legacy compatibility)
   */
  async getProductsByPartner(partnerId: string): Promise<Product[]> {
    return this.getProducts({ partnerId });
  }

  /**
   * Get products by partner ID with pagination (legacy compatibility)
   */
  async getProductsByPartnerPaginated(partnerId: string, params?: ProductQueryParams): Promise<PaginatedResult<Product>> {
    return this.getProductsPaginated({ ...params, partnerId });
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
        depth: 0, // No need for relationships when just getting slugs
      });
      return result.docs
        .map(doc => doc.slug)
        .filter((slug): slug is string => typeof slug === 'string');
    };
    return this.executeQuery(cacheKey, fetcher);
  }
}
