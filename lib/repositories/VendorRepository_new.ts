/**
 * VendorRepository
 *
 * Data access layer for Vendor entities.
 * Handles vendor queries including partners, certifications, awards, and social proof.
 * Note: Partner methods are wrappers around Vendor methods for backward compatibility.
 */

import { BaseRepository } from './BaseRepository';
import { transformPayloadVendor } from '@/lib/transformers';
import type { Vendor, Partner } from '@/lib/types';
import type { CacheService } from '@/lib/cache';
import type { VendorQueryParams } from './types_new';
import type { PaginatedResult } from '@/lib/types/pagination';
import { normalizePaginationParams, calculatePaginationMetadata, PAGINATION_DEFAULTS } from '@/lib/types/pagination';
import type { Where } from 'payload';

export class VendorRepository extends BaseRepository {
  constructor(cache?: CacheService) {
    super(cache);
  }

  /**
   * Get all vendors (non-paginated - for backward compatibility)
   * @deprecated Use getVendorsPaginated for better performance
   */
  async getAllVendors(): Promise<Vendor[]> {
    const cacheKey = 'vendors:all';
    const fetcher = async () => {
      const payload = await this.getPayload();
      const result = await payload.find({
        collection: 'vendors',
        limit: 1000,
        depth: 2,
      });
      return result.docs.map(transformPayloadVendor);
    };
    return this.executeQuery(cacheKey, fetcher);
  }

  /**
   * Get vendors with optional filtering (non-paginated - backward compatible)
   * @deprecated Use getVendorsPaginated for better performance
   */
  async getVendors(params?: VendorQueryParams): Promise<Vendor[]> {
    const cacheKey = `vendors:${JSON.stringify(params || {})}`;
    const fetcher = async () => {
      const payload = await this.getPayload();

      const where: Where = {};

      if (params?.category) {
        where.categories = {
          contains: params.category,
        };
      }

      if (params?.featured) {
        where.featured = {
          equals: true,
        };
      }

      if (params?.partnersOnly) {
        where.partner = {
          equals: true,
        };
      }

      const result = await payload.find({
        collection: 'vendors',
        where,
        limit: params?.limit || 1000,
        depth: params?.depth !== undefined ? params.depth : 2,
      });

      return result.docs.map(transformPayloadVendor);
    };
    return this.executeQuery(cacheKey, fetcher);
  }

  /**
   * Get vendors with pagination support
   * This is the new recommended method for fetching vendors
   */
  async getVendorsPaginated(params?: VendorQueryParams): Promise<PaginatedResult<Vendor>> {
    // Normalize pagination params
    const normalizedParams = normalizePaginationParams(params);
    const { page, limit, sort, order } = normalizedParams;

    // Calculate offset for Payload CMS
    const offset = (page - 1) * limit;

    const cacheKey = `vendors:paginated:${JSON.stringify({ ...params, page, limit, sort, order })}`;
    const fetcher = async () => {
      const payload = await this.getPayload();

      const where: Where = {};

      if (params?.category) {
        where.categories = {
          contains: params.category,
        };
      }

      if (params?.featured) {
        where.featured = {
          equals: true,
        };
      }

      if (params?.partnersOnly) {
        where.partner = {
          equals: true,
        };
      }

      // Determine depth - use 0-1 for list views, 2-3 for detail views
      const depth = params?.depth !== undefined ? params.depth : 1;

      // Build sort string for Payload
      const sortField = sort.startsWith('-') ? sort : `${order === 'desc' ? '-' : ''}${sort}`;

      const result = await payload.find({
        collection: 'vendors',
        where,
        limit,
        page,
        depth,
        sort: sortField,
      });

      const vendors = result.docs.map(transformPayloadVendor);

      return calculatePaginationMetadata(vendors, result.totalDocs, page, limit);
    };

    return this.executeQuery(cacheKey, fetcher);
  }

  /**
   * Get vendor by slug
   */
  async getVendorBySlug(slug: string, depth: number = 2): Promise<Vendor | null> {
    const cacheKey = `vendor:${slug}:depth:${depth}`;
    const fetcher = async () => {
      const payload = await this.getPayload();
      const result = await payload.find({
        collection: 'vendors',
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

      return transformPayloadVendor(result.docs[0]);
    };
    return this.executeQuery(cacheKey, fetcher);
  }

  /**
   * Get vendor by ID
   */
  async getVendorById(id: string, depth: number = 2): Promise<Vendor | null> {
    const cacheKey = `vendor:id:${id}:depth:${depth}`;
    const fetcher = async () => {
      const payload = await this.getPayload();
      const result = await payload.findByID({
        collection: 'vendors',
        id,
        depth,
      });

      if (!result) {
        return null;
      }

      return transformPayloadVendor(result);
    };
    return this.executeQuery(cacheKey, fetcher);
  }

  /**
   * Get featured vendors (backward compatible)
   */
  async getFeaturedVendors(): Promise<Vendor[]> {
    return this.getVendors({ featured: true });
  }

  /**
   * Get featured vendors with pagination
   */
  async getFeaturedVendorsPaginated(params?: VendorQueryParams): Promise<PaginatedResult<Vendor>> {
    return this.getVendorsPaginated({ ...params, featured: true });
  }

  /**
   * Get all vendor slugs (for static generation)
   */
  async getVendorSlugs(): Promise<string[]> {
    const cacheKey = 'vendor-slugs';
    const fetcher = async () => {
      const payload = await this.getPayload();
      const result = await payload.find({
        collection: 'vendors',
        limit: 1000,
        depth: 0, // No need for relationships when just getting slugs
      });
      return result.docs
        .map(doc => doc.slug)
        .filter((slug): slug is string => typeof slug === 'string');
    };
    return this.executeQuery(cacheKey, fetcher);
  }

  /**
   * Get vendor certifications by vendor ID
   */
  async getVendorCertifications(vendorId: string): Promise<any[]> {
    const vendor = await this.getVendorById(vendorId);
    return vendor?.certifications || [];
  }

  /**
   * Get vendor awards by vendor ID
   */
  async getVendorAwards(vendorId: string): Promise<any[]> {
    const vendor = await this.getVendorById(vendorId);
    return vendor?.awards || [];
  }

  /**
   * Get vendor social proof by vendor ID
   */
  async getVendorSocialProof(vendorId: string): Promise<any> {
    const vendor = await this.getVendorById(vendorId);
    return vendor?.socialProof || null;
  }

  /**
   * Get enhanced vendor profile with all related data
   */
  async getEnhancedVendorProfile(vendorId: string): Promise<any> {
    const vendor = await this.getVendorById(vendorId, 3); // Use depth 3 for full profile
    if (!vendor) {
      return null;
    }

    return {
      ...vendor,
      certifications: vendor.certifications || [],
      awards: vendor.awards || [],
      socialProof: vendor.socialProof || null,
    };
  }

  // =================================================================
  // Partner Methods (Legacy Compatibility - Wrappers around Vendor)
  // =================================================================

  /**
   * Get all partners (vendors with partner flag)
   * @deprecated Use getPartnersPaginated for better performance
   */
  async getAllPartners(): Promise<Partner[]> {
    return this.getVendors({ partnersOnly: true }) as Promise<Partner[]>;
  }

  /**
   * Get partners with optional filtering
   * @deprecated Use getPartnersPaginated for better performance
   */
  async getPartners(params?: { category?: string; featured?: boolean }): Promise<Partner[]> {
    return this.getVendors({ ...params, partnersOnly: true }) as Promise<Partner[]>;
  }

  /**
   * Get partners with pagination
   */
  async getPartnersPaginated(params?: VendorQueryParams): Promise<PaginatedResult<Partner>> {
    return this.getVendorsPaginated({ ...params, partnersOnly: true }) as Promise<PaginatedResult<Partner>>;
  }

  /**
   * Get featured partners
   */
  async getFeaturedPartners(): Promise<Partner[]> {
    return this.getVendors({ featured: true, partnersOnly: true }) as Promise<Partner[]>;
  }

  /**
   * Get featured partners with pagination
   */
  async getFeaturedPartnersPaginated(params?: VendorQueryParams): Promise<PaginatedResult<Partner>> {
    return this.getVendorsPaginated({ ...params, featured: true, partnersOnly: true }) as Promise<PaginatedResult<Partner>>;
  }

  /**
   * Get partner by slug
   */
  async getPartnerBySlug(slug: string, depth: number = 2): Promise<Partner | null> {
    return this.getVendorBySlug(slug, depth) as Promise<Partner | null>;
  }

  /**
   * Get partner by ID
   */
  async getPartnerById(id: string, depth: number = 2): Promise<Partner | null> {
    return this.getVendorById(id, depth) as Promise<Partner | null>;
  }

  /**
   * Get all partner slugs (for static generation)
   */
  async getPartnerSlugs(): Promise<string[]> {
    const cacheKey = 'partner-slugs';
    const fetcher = async () => {
      const payload = await this.getPayload();
      const result = await payload.find({
        collection: 'vendors',
        where: {
          partner: {
            equals: true,
          },
        },
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
