/**
 * VendorProfileService - Vendor profile management service
 *
 * Handles vendor profile CRUD operations with tier validation,
 * authorization, and computed field enrichment.
 */

import type { Where } from 'payload';
import { getPayloadClient } from '@/lib/utils/get-payload-config';
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

/**
 * Convert plain text to minimal Lexical JSON for richText fields.
 * Splits on newlines to create separate paragraphs.
 */
function plainTextToLexicalJson(text: string): Record<string, unknown> {
  const paragraphs = text.split(/\n+/).filter(p => p.trim());
  return {
    root: {
      type: 'root',
      children: paragraphs.map(p => ({
        type: 'paragraph',
        children: [{ type: 'text', text: p.trim(), detail: 0, format: 0, mode: 'normal', style: '', version: 1 }],
        direction: 'ltr',
        format: '',
        indent: 0,
        textFormat: 0,
        version: 1,
      })),
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  };
}

/**
 * Check if a value is already Lexical JSON (has root.type === 'root')
 */
function isLexicalJson(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    'root' in value &&
    typeof (value as Record<string, unknown>).root === 'object'
  );
}

/**
 * Strip upload fields that are URL strings (Payload expects media IDs).
 * Returns the value unchanged if it's a number (valid media ID) or nullish.
 */
function stripUploadUrlString(value: unknown): unknown {
  if (typeof value === 'string') return undefined;
  return value;
}

/**
 * Transform frontend data to match Payload CMS schema.
 *
 * Handles:
 * - Upload fields sent as URL strings (logo, videoThumbnail, sub-field uploads)
 * - serviceAreas/companyValues string-to-object conversion
 * - certifications: certificateUrl → verificationUrl, strip logo URLs
 * - teamMembers: image → strip (upload URL), linkedin → linkedinUrl, order → displayOrder
 * - caseStudies: plain text → Lexical JSON for richText fields, strip image URLs
 * - mediaGallery: component format → Payload schema
 */
function transformArrayFieldsForPayload(data: Record<string, unknown>): Record<string, unknown> {
  const transformed = { ...data };

  // Strip top-level upload fields if they're URL strings
  if (typeof transformed.logo === 'string') {
    delete transformed.logo;
  }
  if (typeof transformed.videoThumbnail === 'string') {
    delete transformed.videoThumbnail;
  }

  // Transform serviceAreas: string[] -> {area: string}[], filtering empty entries
  if (Array.isArray(transformed.serviceAreas)) {
    transformed.serviceAreas = transformed.serviceAreas
      .filter((item: unknown) => {
        if (typeof item === 'string') return item.trim() !== '';
        return item != null;
      })
      .map((item: unknown) => {
        if (typeof item === 'string') {
          return { area: item };
        }
        return item;
      });
  }

  // Transform companyValues: string[] -> {value: string}[], filtering empty entries
  if (Array.isArray(transformed.companyValues)) {
    transformed.companyValues = transformed.companyValues
      .filter((item: unknown) => {
        if (typeof item === 'string') return item.trim() !== '';
        return item != null;
      })
      .map((item: unknown) => {
        if (typeof item === 'string') {
          return { value: item };
        }
        return item;
      });
  }

  // Transform certifications: fix field name mismatches, strip upload URLs
  if (Array.isArray(transformed.certifications)) {
    transformed.certifications = transformed.certifications
      .filter((item: unknown) => item != null && typeof item === 'object')
      .map((item: unknown) => {
        const cert = item as Record<string, unknown>;
        const result: Record<string, unknown> = {
          name: cert.name,
          issuer: cert.issuer,
          year: cert.year,
        };
        if (cert.expiryDate) result.expiryDate = cert.expiryDate;
        if (cert.certificateNumber) result.certificateNumber = cert.certificateNumber;
        // Component uses 'certificateUrl', Payload expects 'verificationUrl'
        const verUrl = cert.verificationUrl || cert.certificateUrl;
        if (verUrl && typeof verUrl === 'string' && verUrl.trim()) {
          result.verificationUrl = verUrl;
        }
        // Strip logo URL strings (Payload expects media ID for upload field)
        const logoVal = stripUploadUrlString(cert.logo);
        if (logoVal !== undefined) result.logo = logoVal;
        return result;
      });
  }

  // Transform awards: strip upload URL for image field
  if (Array.isArray(transformed.awards)) {
    transformed.awards = transformed.awards
      .filter((item: unknown) => item != null && typeof item === 'object')
      .map((item: unknown) => {
        const award = item as Record<string, unknown>;
        const result: Record<string, unknown> = {
          title: award.title,
          organization: award.organization,
          year: award.year,
        };
        if (award.category) result.category = award.category;
        if (award.description) result.description = award.description;
        // Strip image URL strings (Payload expects media ID for upload field)
        const imgVal = stripUploadUrlString(award.image);
        if (imgVal !== undefined) result.image = imgVal;
        return result;
      });
  }

  // Transform teamMembers: rename fields, strip upload URLs, remove synthetic fields
  if (Array.isArray(transformed.teamMembers)) {
    transformed.teamMembers = transformed.teamMembers
      .filter((item: unknown) => item != null && typeof item === 'object')
      .map((item: unknown) => {
        const member = item as Record<string, unknown>;
        const result: Record<string, unknown> = {
          name: member.name,
          role: member.role,
        };
        if (member.bio) result.bio = member.bio;
        if (member.email) result.email = member.email;
        // Component uses 'linkedin', Payload expects 'linkedinUrl'
        const linkedinVal = member.linkedinUrl || member.linkedin;
        if (linkedinVal && typeof linkedinVal === 'string' && linkedinVal.trim()) {
          result.linkedinUrl = linkedinVal;
        }
        // Component uses 'order', Payload expects 'displayOrder'
        const orderVal = member.displayOrder ?? member.order;
        if (orderVal !== undefined && orderVal !== null) {
          result.displayOrder = typeof orderVal === 'string' ? parseInt(orderVal, 10) : orderVal;
        }
        // Component uses 'image' (URL string), Payload expects 'photo' (upload/media ID)
        // Strip URL strings, keep numeric media IDs
        const photoVal = stripUploadUrlString(member.photo || member.image);
        if (photoVal !== undefined) result.photo = photoVal;
        // Do NOT copy synthetic fields: id, createdAt, updatedAt
        return result;
      });
  }

  // Transform caseStudies: convert richText fields, strip image URLs
  if (Array.isArray(transformed.caseStudies)) {
    transformed.caseStudies = transformed.caseStudies
      .filter((item: unknown) => item != null && typeof item === 'object')
      .map((item: unknown) => {
        const cs = item as Record<string, unknown>;
        const result: Record<string, unknown> = {
          title: cs.title,
          featured: cs.featured ?? false,
        };
        if (cs.yachtName) result.yachtName = cs.yachtName;
        if (cs.yacht) result.yacht = cs.yacht;
        // projectDate: form sends "YYYY-MM" (month input), Payload expects ISO timestamp
        // Convert partial dates to full ISO, strip empty strings
        if (cs.projectDate && typeof cs.projectDate === 'string' && cs.projectDate.trim()) {
          const dateStr = cs.projectDate.trim();
          // "2024-03" → "2024-03-01T00:00:00.000Z"
          if (/^\d{4}-\d{2}$/.test(dateStr)) {
            result.projectDate = `${dateStr}-01T00:00:00.000Z`;
          } else {
            // Already a full date string or ISO - pass through
            result.projectDate = dateStr;
          }
        }
        if (cs.testimonyQuote) result.testimonyQuote = cs.testimonyQuote;
        if (cs.testimonyAuthor) result.testimonyAuthor = cs.testimonyAuthor;
        if (cs.testimonyRole) result.testimonyRole = cs.testimonyRole;
        // Convert challenge/solution/results: plain text → Lexical JSON
        for (const field of ['challenge', 'solution', 'results'] as const) {
          const val = cs[field];
          if (typeof val === 'string' && val.trim()) {
            result[field] = plainTextToLexicalJson(val);
          } else if (isLexicalJson(val)) {
            result[field] = val; // Already Lexical JSON, pass through
          }
        }
        // Strip image URLs - Payload expects [{image: mediaId}], not string URLs
        // Keep only entries with numeric media IDs
        if (Array.isArray(cs.images)) {
          const validImages = cs.images
            .filter((img: unknown) => {
              if (typeof img === 'object' && img !== null) {
                const imgObj = img as Record<string, unknown>;
                return typeof imgObj.image === 'number';
              }
              return false;
            });
          if (validImages.length > 0) result.images = validImages;
        }
        return result;
      });
  }

  // Transform mediaGallery: component format → Payload schema
  if (Array.isArray(transformed.mediaGallery)) {
    transformed.mediaGallery = transformed.mediaGallery
      .filter((item: unknown) => item != null && typeof item === 'object')
      .map((item: unknown) => {
        const media = item as Record<string, unknown>;
        const result: Record<string, unknown> = {
          type: media.type || 'image',
        };
        // For images: component uses 'url' for uploaded image URL, Payload expects 'media' (upload ID)
        // Only keep numeric media IDs, strip URL strings
        if (media.type === 'image') {
          const mediaVal = media.media ?? media.url;
          if (typeof mediaVal === 'number') {
            result.media = mediaVal;
          }
          // else: strip - can't send URL string to upload field
        }
        // For videos: component uses 'url' (embed URL), Payload expects 'videoUrl'
        if (media.type === 'video') {
          const videoUrl = media.videoUrl ?? media.url;
          if (typeof videoUrl === 'string' && videoUrl.trim()) {
            result.videoUrl = videoUrl;
          }
        }
        if (media.caption) result.caption = media.caption;
        if (media.altText) result.altText = media.altText;
        if (media.album) result.album = media.album;
        if (media.order !== undefined && media.order !== null) {
          result.order = typeof media.order === 'string' ? parseInt(media.order as string, 10) : media.order;
        }
        // Do NOT copy: id, filename, videoPlatform, thumbnailUrl, uploadedAt
        return result;
      });
  }

  return transformed;
}

// Export for testing
export { plainTextToLexicalJson, isLexicalJson, transformArrayFieldsForPayload };

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
  ): Promise<Record<string, unknown>> {
    const { includeComputed = true } = options;

    const payload = await getPayloadClient();

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
  ): Promise<Record<string, unknown>> {
    const payload = await getPayloadClient();

    // Fetch vendor
    const vendor = await payload.findByID({
      collection: 'vendors',
      id,
    });

    // Authorization: Check ownership
    if (!isAdmin) {
      const vendorUserId =
        typeof vendor.user === 'object' && vendor.user !== null
          ? (vendor.user as Record<string, unknown>).id
          : vendor.user;

      if (vendorUserId?.toString() !== userId.toString()) {
        throw new Error('Unauthorized: You can only access your own vendor profile');
      }
    }

    // Enrich with computed fields
    const enriched = VendorComputedFieldsService.enrichVendorData(vendor);

    return enriched;
  }

  /**
   * Get vendor by user ID for editing
   * Used when user logs in and we need to find their vendor profile
   */
  static async getVendorByUserId(userId: string): Promise<Record<string, unknown>> {
    const payload = await getPayloadClient();

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

    // Enrich with computed fields
    const enriched = VendorComputedFieldsService.enrichVendorData(vendor);

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
    data: Record<string, unknown>,
    options: UpdateVendorOptions
  ): Promise<Record<string, unknown>> {
    const { userId, isAdmin, validateTier = true } = options;

    const payload = await getPayloadClient();

    // Fetch existing vendor
    const vendor = await payload.findByID({
      collection: 'vendors',
      id,
    });

    // Authorization: Check ownership
    if (!isAdmin) {
      const vendorUserId =
        typeof vendor.user === 'object' && vendor.user !== null
          ? (vendor.user as Record<string, unknown>).id
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

    // Transform array fields (serviceAreas, companyValues) from strings to objects
    const transformedData = transformArrayFieldsForPayload(data);

    // Update vendor
    const updatedVendor = await payload.update({
      collection: 'vendors',
      id,
      data: transformedData,
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
    const payload = await getPayloadClient();

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
  static async getVendors(tier?: Tier, limit: number = 100): Promise<Array<Record<string, unknown>>> {
    const payload = await getPayloadClient();

    const whereClause: Where = {
      published: {
        equals: true,
      },
    };

    if (tier) {
      whereClause.tier = { equals: tier };
    }

    const result = await payload.find({
      collection: 'vendors',
      where: whereClause,
      limit,
    });

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
  static async getFeaturedVendors(limit: number = 10): Promise<Array<Record<string, unknown>>> {
    const payload = await getPayloadClient();

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
