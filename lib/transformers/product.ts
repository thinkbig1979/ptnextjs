/**
 * Product transformation utilities for TinaCMS to Payload CMS migration
 *
 * Transforms product data from TinaCMS markdown frontmatter format to Payload CMS schema.
 * Handles vendor relationships, image arrays, categories, and enhanced product fields.
 */

import type { Payload } from 'payload';
import {
  TransformResult,
  generateSlug,
  resolveReference,
  resolveReferences,
  transformMediaPath,
} from './base';
import { markdownToLexical } from './markdown-to-lexical';

/**
 * TinaCMS product data structure
 * Represents the frontmatter fields from product markdown files
 */
export interface TinaCMSProduct {
  name: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  price?: string;

  // Vendor relationship (TinaCMS file path)
  vendor?: string;
  partner?: string; // Legacy field

  // Category relationship (TinaCMS file path)
  category?: string;

  // Tags relationships (TinaCMS file paths)
  tags?: string[];

  // Product images array
  product_images?: Array<{
    image?: string;
    url?: string;
    alt_text?: string;
    altText?: string;
    is_main?: boolean;
    isMain?: boolean;
    caption?: string;
    order?: number;
  }>;

  // Features array
  features?: Array<{
    title: string;
    description?: string;
    icon?: string;
    order?: number;
  }>;

  // Specifications
  specifications?: Array<{
    label: string;
    value: string;
    order?: number;
  }>;

  // Benefits
  benefits?: Array<{
    benefit: string;
    icon?: string;
    order?: number;
  }>;

  // Services
  services?: Array<{
    title: string;
    description: string;
    icon?: string;
    order?: number;
  }>;

  // Pricing configuration
  pricing?: {
    display_text?: string;
    displayText?: string;
    subtitle?: string;
    show_contact_form?: boolean;
    showContactForm?: boolean;
    currency?: string;
  };

  // Action buttons
  action_buttons?: Array<{
    label: string;
    type: 'primary' | 'secondary' | 'outline';
    action: 'contact' | 'quote' | 'download' | 'external_link' | 'video';
    action_data?: string;
    actionData?: string;
    icon?: string;
    order?: number;
  }>;

  // Badges
  badges?: Array<{
    label: string;
    type: 'secondary' | 'outline' | 'success' | 'warning' | 'info';
    icon?: string;
    order?: number;
  }>;

  // SEO
  seo?: {
    meta_title?: string;
    metaTitle?: string;
    meta_description?: string;
    metaDescription?: string;
    keywords?: string;
    og_image?: string;
    ogImage?: string;
  };

  // Markdown content (from file body)
  markdownContent?: string;
}

/**
 * Transforms TinaCMS product data to Payload CMS format
 *
 * CRITICAL DECISIONS:
 * - Vendor reference: Resolved from TinaCMS file path to Payload ID
 * - Category: Converted from single string to categories array
 * - Images: product_images array → images array with transformed URLs
 * - Enhanced fields: Default to empty/undefined (can be populated later)
 *
 * @param tinaCMSData - Product data from TinaCMS markdown frontmatter
 * @param payload - Payload CMS instance for reference resolution
 * @returns Transformation result with Payload product data or error
 */
/**
 * Payload Product type (simplified interface matching schema)
 */
export interface PayloadProduct {
  id?: string;
  vendor: string;
  name: string;
  slug: string;
  description: unknown;
  shortDescription?: string;
  images?: unknown[];
  categories?: string[];
  tags?: string[];
  specifications?: unknown[];
  published: boolean;
  price?: string;
  pricing?: unknown;
  features?: unknown[];
  benefits?: unknown[];
  services?: unknown[];
  actionButtons?: unknown[];
  badges?: unknown[];
  seo?: unknown;
  comparisonMetrics?: unknown;
  integrationCompatibility?: unknown;
  ownerReviews?: unknown;
  visualDemoContent?: unknown;
  technicalDocumentation?: unknown;
  warrantySupport?: unknown;
  [key: string]: unknown;
}

export async function transformProductFromMarkdown(
  tinaCMSData: TinaCMSProduct,
  payload: Payload
): Promise<TransformResult<Partial<PayloadProduct>>> {
  const warnings: string[] = [];

  try {
    // Basic Information (Required)
    const name = tinaCMSData.name;
    if (!name) {
      return {
        success: false,
        error: 'Product name is required',
      };
    }

    const slug = tinaCMSData.slug || generateSlug(name);

    // Description - convert Markdown to Lexical
    const description = tinaCMSData.description
      ? markdownToLexical(tinaCMSData.description)
      : markdownToLexical('');

    const shortDescription = tinaCMSData.shortDescription;

    // Resolve vendor reference
    const vendorPath = tinaCMSData.vendor || tinaCMSData.partner;
    const vendorId = vendorPath
      ? await resolveReference(vendorPath, 'vendors', payload)
      : null;

    if (!vendorId) {
      return {
        success: false,
        error: `Failed to resolve vendor reference: ${vendorPath}`,
      };
    }

    // Transform product images
    const images = tinaCMSData.product_images?.map(img => ({
      url: transformMediaPath(img.image || img.url || ''),
      altText: img.alt_text || img.altText,
      isMain: img.is_main ?? img.isMain ?? false,
      caption: img.caption,
    })) || [];

    // Resolve category reference (single → array)
    let categories: string[] = [];
    if (tinaCMSData.category) {
      const categoryId = await resolveReference(
        tinaCMSData.category,
        'categories',
        payload
      );
      if (categoryId) {
        categories = [categoryId];
      } else {
        warnings.push(`Failed to resolve category reference: ${tinaCMSData.category}`);
      }
    }

    // Resolve tag references
    const tags = tinaCMSData.tags
      ? await resolveReferences(tinaCMSData.tags, 'tags', payload)
      : [];

    if (tinaCMSData.tags && tags.length < tinaCMSData.tags.length) {
      warnings.push(`Failed to resolve some tag references`);
    }

    // Transform specifications
    const specifications = tinaCMSData.specifications?.map(spec => ({
      label: spec.label,
      value: spec.value,
    }));

    // Transform features
    const features = tinaCMSData.features?.map(feature => ({
      title: feature.title,
      description: feature.description,
      icon: feature.icon,
      order: feature.order,
    }));

    // Transform benefits
    const benefits = tinaCMSData.benefits?.map(benefit => ({
      benefit: benefit.benefit,
      icon: benefit.icon,
      order: benefit.order,
    }));

    // Transform services
    const services = tinaCMSData.services?.map(service => ({
      title: service.title,
      description: service.description,
      icon: service.icon,
      order: service.order,
    }));

    // Transform pricing
    const pricing = tinaCMSData.pricing
      ? {
          displayText: tinaCMSData.pricing.display_text || tinaCMSData.pricing.displayText,
          subtitle: tinaCMSData.pricing.subtitle,
          showContactForm: tinaCMSData.pricing.show_contact_form ?? tinaCMSData.pricing.showContactForm ?? true,
          currency: tinaCMSData.pricing.currency,
        }
      : undefined;

    // Transform action buttons
    const actionButtons = tinaCMSData.action_buttons?.map(button => ({
      label: button.label,
      type: button.type,
      action: button.action,
      actionData: button.action_data || button.actionData,
      icon: button.icon,
      order: button.order,
    }));

    // Transform badges
    const badges = tinaCMSData.badges?.map(badge => ({
      label: badge.label,
      type: badge.type,
      icon: badge.icon,
      order: badge.order,
    }));

    // Build SEO group
    const seo = tinaCMSData.seo
      ? {
          metaTitle: tinaCMSData.seo.meta_title || tinaCMSData.seo.metaTitle,
          metaDescription: tinaCMSData.seo.meta_description || tinaCMSData.seo.metaDescription,
          keywords: tinaCMSData.seo.keywords,
          ogImage: transformMediaPath(tinaCMSData.seo.og_image || tinaCMSData.seo.ogImage),
        }
      : undefined;

    // Build Payload product object
    const payloadProduct: Partial<PayloadProduct> = {
      // Vendor relationship (required)
      vendor: vendorId as any, // Payload expects RelationTo type

      // Basic information
      name,
      slug,
      description,
      shortDescription,

      // Images
      images,

      // Categories and Tags
      categories: categories as any,
      tags: tags as any,

      // Specifications
      specifications,

      // Metadata
      published: true, // TinaCMS products are considered published

      // ============================================================================
      // ENHANCED FIELDS - Product Showcase Features
      // ============================================================================

      // Price (basic field from TinaCMS)
      price: tinaCMSData.price,

      // Pricing configuration
      pricing,

      // Features, Benefits, Services
      features,
      benefits,
      services,

      // Action buttons and badges
      actionButtons,
      badges,

      // SEO
      seo,

      // ============================================================================
      // COMPARISON & BENCHMARKING
      // ============================================================================
      // Default to empty - can be populated later via admin UI
      comparisonMetrics: undefined,

      // ============================================================================
      // INTEGRATION & COMPATIBILITY
      // ============================================================================
      // Default to empty - can be populated later via admin UI
      integrationCompatibility: undefined,

      // ============================================================================
      // OWNER REVIEWS & TESTIMONIALS
      // ============================================================================
      // Default to empty - can be populated later via admin UI
      ownerReviews: undefined,

      // ============================================================================
      // VISUAL DEMO & INTERACTIVE CONTENT
      // ============================================================================
      // Default to empty - can be populated later via admin UI
      visualDemoContent: undefined,

      // ============================================================================
      // DOCUMENTATION & SUPPORT
      // ============================================================================
      // Default to empty - can be populated later via admin UI
      technicalDocumentation: undefined,
      warrantySupport: undefined,
    };

    return {
      success: true,
      data: payloadProduct,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: `Transformation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }
}
