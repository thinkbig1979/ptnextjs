/**
 * VendorProfileService - Vendor profile management service
 *
 * Handles vendor profile CRUD operations with tier validation,
 * authorization, and computed field enrichment.
 */

import { getPayload } from 'payload';
import config from '@/payload.config';
import { TierValidationService } from './TierValidationService';
import { VendorComputedFieldsService } from './VendorComputedFieldsService';
import type { Tier } from './TierService';

export interface VendorProfileOptions {
  includeComputed?: boolean;
  includeDraft?: boolean;
}

export interface UpdateVendorOptions {
  userId: string;
  isAdmin: boolean;
  validateTier?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

export class VendorProfileService {
  /**
   * Get vendor profile for public display
   * Filters fields based on tier and enriches with computed fields
   *
   * @param slug - Vendor slug
   * @param options - Fetch options
   * @returns Vendor profile with computed fields
   */
  static async getVendorProfile(
    slug: string,
    options: VendorProfileOptions = {}
  ): Promise<any> {
    const { includeComputed = true } = options;

    const payload = await getPayload({ config });

    // Find vendor by slug
    const result = await payload.find({
      collection: 'vendors',
      where: {
        slug: {
          equals: slug,
        },
        published: {
          equals: true, // Only return published vendors for public access
        },
      },
      limit: 1,
    });

    if (!result.docs || result.docs.length === 0) {
      throw new Error('Vendor not found');
    }

    let vendor = result.docs[0];

    // Enrich with computed fields if requested
    if (includeComputed) {
      vendor = VendorComputedFieldsService.enrichVendorData(vendor);
    }

    return vendor;
  }

  /**
   * Get vendor profile for dashboard editing
   * Includes all fields (published and draft) with authorization checks
   *
   * @param id - Vendor ID
   * @param userId - User ID making the request
   * @param isAdmin - Whether user is admin
   * @returns Vendor profile
   */
  static async getVendorForEdit(
    id: string,
    userId: string,
    isAdmin: boolean
  ): Promise<any> {
    const payload = await getPayload({ config });

    // Fetch vendor
    const vendor = await payload.findByID({
      collection: 'vendors',
      id,
    });

    console.log('[VendorProfileService] Raw vendor from Payload:', {
      id: vendor.id,
      tier: vendor.tier,
      hasTierField: 'tier' in vendor,
      tierType: typeof vendor.tier,
      allKeys: Object.keys(vendor),
    });

    // Authorization: Check ownership
    if (!isAdmin) {
      const vendorUserId =
        typeof vendor.user === 'object' && vendor.user !== null
          ? vendor.user.id
          : vendor.user;

      if (vendorUserId?.toString() !== userId.toString()) {
        throw new Error('Unauthorized: You can only access your own vendor profile');
      }
    }

    // Enrich with computed fields
    const enriched = VendorComputedFieldsService.enrichVendorData(vendor);

    console.log('[VendorProfileService] After enrichment:', {
      id: enriched.id,
      tier: enriched.tier,
      hasTierField: 'tier' in enriched,
    });

    return enriched;
  }

  /**
   * Get vendor by user ID for editing
   * Used when user logs in and we need to find their vendor profile
   */
  static async getVendorByUserId(userId: string): Promise<any> {
    const payload = await getPayload({ config });

    // Find vendor by user_id
    const result = await payload.find({
      collection: 'vendors',
      where: {
        user: {
          equals: userId,
        },
      },
      limit: 1,
    });

    if (!result.docs || result.docs.length === 0) {
      throw new Error(`Vendor not found for user ID: ${userId}`);
    }

    const vendor = result.docs[0];

    console.log('[VendorProfileService.getVendorByUserId] Raw vendor from Payload:', {
      id: vendor.id,
      tier: vendor.tier,
      hasTierField: 'tier' in vendor,
      tierType: typeof vendor.tier,
    });

    // Enrich with computed fields
    const enriched = VendorComputedFieldsService.enrichVendorData(vendor);

    console.log('[VendorProfileService.getVendorByUserId] After enrichment:', {
      id: enriched.id,
      tier: enriched.tier,
      hasTierField: 'tier' in enriched,
    });

    return enriched;
  }

  /**
   * Update vendor profile with tier validation
   *
   * @param id - Vendor ID
   * @param data - Update data
   * @param options - Update options with user context
   * @returns Updated vendor profile
   */
  static async updateVendorProfile(
    id: string,
    data: Record<string, any>,
    options: UpdateVendorOptions
  ): Promise<any> {
    const { userId, isAdmin, validateTier = true } = options;

    const payload = await getPayload({ config });

    // Fetch existing vendor
    const vendor = await payload.findByID({
      collection: 'vendors',
      id,
    });

    // Authorization: Check ownership
    if (!isAdmin) {
      const vendorUserId =
        typeof vendor.user === 'object' && vendor.user !== null
          ? vendor.user.id
          : vendor.user;

      if (vendorUserId?.toString() !== userId.toString()) {
        throw new Error('Unauthorized: You can only update your own vendor profile');
      }
    }

    // Tier validation
    if (validateTier && !isAdmin) {
      const vendorTier = (vendor.tier as Tier) || 'free';
      const fieldsToUpdate = Object.keys(data);

      const validationResult = TierValidationService.validateFieldsAccess(
        vendorTier,
        fieldsToUpdate
      );

      if (!validationResult.valid) {
        throw new Error(
          `Tier validation failed: ${validationResult.errors?.join(', ')}`
        );
      }

      // Validate location limit if locations are being updated
      if (data.locations && Array.isArray(data.locations)) {
        const locationLimit = TierValidationService.validateLocationLimit(
          vendorTier,
          data.locations.length
        );

        if (!locationLimit.valid) {
          throw new Error(locationLimit.message || 'Location limit exceeded');
        }
      }
    }

    // Update vendor
    const updatedVendor = await payload.update({
      collection: 'vendors',
      id,
      data,
    });

    // Enrich with computed fields
    const enriched = VendorComputedFieldsService.enrichVendorData(updatedVendor);

    return enriched;
  }

  /**
   * Validate vendor data for tier downgrade
   *
   * @param vendorId - Vendor ID
   * @param newTier - Proposed new tier
   * @returns Validation result
   */
  static async validateTierDowngrade(
    vendorId: string,
    newTier: Tier
  ): Promise<ValidationResult> {
    const payload = await getPayload({ config });

    const vendor = await payload.findByID({
      collection: 'vendors',
      id: vendorId,
    });

    const currentTier = (vendor.tier as Tier) || 'free';

    const validationResult = TierValidationService.validateTierChange(
      currentTier,
      newTier,
      vendor
    );

    return {
      valid: validationResult.valid,
      errors: validationResult.errors,
    };
  }

  /**
   * Get all vendors with optional tier filtering
   *
   * @param tier - Optional tier to filter by
   * @param limit - Max number of results
   * @returns Array of vendor profiles
   */
  static async getVendors(tier?: Tier, limit: number = 100): Promise<any[]> {
    const payload = await getPayload({ config });

    const query: any = {
      collection: 'vendors',
      where: {
        published: {
          equals: true,
        },
      },
      limit,
    };

    if (tier) {
      query.where.tier = { equals: tier };
    }

    const result = await payload.find(query);

    // Enrich all vendors with computed fields
    const enriched = VendorComputedFieldsService.enrichVendorsData(result.docs);

    return enriched;
  }

  /**
   * Get featured vendors (tier2+ with featured flag)
   *
   * @param limit - Max number of results
   * @returns Array of featured vendor profiles
   */
  static async getFeaturedVendors(limit: number = 10): Promise<any[]> {
    const payload = await getPayload({ config });

    const result = await payload.find({
      collection: 'vendors',
      where: {
        published: {
          equals: true,
        },
        featured: {
          equals: true,
        },
        tier: {
          in: ['tier2', 'tier3'], // Only tier2+ vendors can be featured
        },
      },
      limit,
      sort: '-createdAt', // Newest first
    });

    return VendorComputedFieldsService.enrichVendorsData(result.docs);
  }
}

export default VendorProfileService;
