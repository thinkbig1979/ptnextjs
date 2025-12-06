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
import type { VendorQueryParams } from './types';

export class VendorRepository extends BaseRepository {
  constructor(cache?: CacheService) {
    super(cache);
  }

  /**
   * Get all vendors
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
   * Get vendors with optional filtering
   */
  async getVendors(params?: VendorQueryParams): Promise<Vendor[]> {
    const cacheKey = `vendors:${JSON.stringify(params || {})}`;
    const fetcher = async () => {
      const payload = await this.getPayload();

      const where: any = {};

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
        depth: 2,
      });

      return result.docs.map(transformPayloadVendor);
    };
    return this.executeQuery(cacheKey, fetcher);
  }

  /**
   * Get vendor by slug
   */
  async getVendorBySlug(slug: string): Promise<Vendor | null> {
    const cacheKey = `vendor:${slug}`;
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
        depth: 2,
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
  async getVendorById(id: string): Promise<Vendor | null> {
    const cacheKey = `vendor:id:${id}`;
    const fetcher = async () => {
      const payload = await this.getPayload();
      const result = await payload.findByID({
        collection: 'vendors',
        id,
        depth: 2,
      });

      if (!result) {
        return null;
      }

      return transformPayloadVendor(result);
    };
    return this.executeQuery(cacheKey, fetcher);
  }

  /**
   * Get featured vendors
   */
  async getFeaturedVendors(): Promise<Vendor[]> {
    return this.getVendors({ featured: true });
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
    const vendor = await this.getVendorById(vendorId);
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
   */
  async getAllPartners(): Promise<Partner[]> {
    return this.getVendors({ partnersOnly: true }) as Promise<Partner[]>;
  }

  /**
   * Get partners with optional filtering
   */
  async getPartners(params?: { category?: string; featured?: boolean }): Promise<Partner[]> {
    return this.getVendors({ ...params, partnersOnly: true }) as Promise<Partner[]>;
  }

  /**
   * Get featured partners
   */
  async getFeaturedPartners(): Promise<Partner[]> {
    return this.getVendors({ featured: true, partnersOnly: true }) as Promise<Partner[]>;
  }

  /**
   * Get partner by slug
   */
  async getPartnerBySlug(slug: string): Promise<Partner | null> {
    return this.getVendorBySlug(slug) as Promise<Partner | null>;
  }

  /**
   * Get partner by ID
   */
  async getPartnerById(id: string): Promise<Partner | null> {
    return this.getVendorById(id) as Promise<Partner | null>;
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
      });
      return result.docs
        .map(doc => doc.slug)
        .filter((slug): slug is string => typeof slug === 'string');
    };
    return this.executeQuery(cacheKey, fetcher);
  }
}
