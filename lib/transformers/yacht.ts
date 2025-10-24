/**
 * Yacht transformation utilities for TinaCMS to Payload CMS migration
 *
 * Transforms yacht data from TinaCMS markdown frontmatter format to Payload CMS schema.
 * Note: Yachts are a new collection in Payload CMS, so TinaCMS data is minimal.
 * This provides basic transformation only.
 */

import type { Payload } from 'payload';
import {
  TransformResult,
  generateSlug,
  resolveReferences,
  transformMediaPath,
  extractNumericValue,
} from './base';

/**
 * TinaCMS yacht data structure
 * Represents the minimal frontmatter fields from yacht markdown files
 * (Yachts are new in Payload, so TinaCMS structure is basic)
 */
export interface TinaCMSYacht {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  images?: string[];

  // Basic specifications
  length?: number | string;
  beam?: number | string;
  draft?: number | string;
  displacement?: number | string;
  builder?: string;
  designer?: string;
  launchYear?: number;
  deliveryYear?: number;
  homePort?: string;
  flag?: string;
  classification?: string;

  // Performance
  cruisingSpeed?: number | string;
  maxSpeed?: number | string;
  range?: number | string;

  // Capacity
  guests?: number;
  crew?: number;

  // Metadata
  featured?: boolean;

  // Category and tags (TinaCMS file paths)
  category?: string;
  tags?: string[];

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
 * Transforms TinaCMS yacht data to Payload CMS format
 *
 * CRITICAL DECISIONS:
 * - Basic transformation only (no timeline/supplier map initially)
 * - Timeline and supplier map can be added later via admin UI
 * - Sustainability metrics not in TinaCMS, default to undefined
 *
 * @param tinaCMSData - Yacht data from TinaCMS markdown frontmatter
 * @param payload - Payload CMS instance for reference resolution
 * @returns Transformation result with Payload yacht data or error
 */
/**
 * Payload Yacht type (simplified interface matching schema)
 */
export interface PayloadYacht {
  id?: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  images?: string[];
  length?: number;
  beam?: number;
  draft?: number;
  displacement?: number;
  builder?: string;
  designer?: string;
  launchYear?: number;
  deliveryYear?: number;
  homePort?: string;
  flag?: string;
  classification?: string;
  cruisingSpeed?: number;
  maxSpeed?: number;
  range?: number;
  guests?: number;
  crew?: number;
  featured: boolean;
  published: boolean;
  tags?: string[];
  timeline?: any;
  supplierMap?: any;
  sustainabilityScore?: any;
  customizations?: any;
  maintenanceHistory?: any;
  seo?: any;
  [key: string]: any;
}

export async function transformYachtFromMarkdown(
  tinaCMSData: TinaCMSYacht,
  payload: Payload
): Promise<TransformResult<Partial<PayloadYacht>>> {
  const warnings: string[] = [];

  try {
    // Basic Information (Required)
    const name = tinaCMSData.name;
    if (!name) {
      return {
        success: false,
        error: 'Yacht name is required',
      };
    }

    const slug = tinaCMSData.slug || generateSlug(name);

    // Description - convert Markdown to Lexical if provided
    const description = tinaCMSData.description || '';

    // Main image
    const image = transformMediaPath(tinaCMSData.image);

    // Gallery images
    const images = tinaCMSData.images?.map(transformMediaPath) || [];

    // Extract numeric values from potentially mixed-format fields
    const length = extractNumericValue(tinaCMSData.length);
    const beam = extractNumericValue(tinaCMSData.beam);
    const draft = extractNumericValue(tinaCMSData.draft);
    const displacement = extractNumericValue(tinaCMSData.displacement);
    const cruisingSpeed = extractNumericValue(tinaCMSData.cruisingSpeed);
    const maxSpeed = extractNumericValue(tinaCMSData.maxSpeed);
    const range = extractNumericValue(tinaCMSData.range);

    // Validate numeric conversions
    if (tinaCMSData.length && !length) {
      warnings.push(`Failed to extract numeric value from length: ${tinaCMSData.length}`);
    }
    if (tinaCMSData.beam && !beam) {
      warnings.push(`Failed to extract numeric value from beam: ${tinaCMSData.beam}`);
    }
    if (tinaCMSData.cruisingSpeed && !cruisingSpeed) {
      warnings.push(`Failed to extract numeric value from cruisingSpeed: ${tinaCMSData.cruisingSpeed}`);
    }

    // Resolve tag references
    const tags = tinaCMSData.tags
      ? await resolveReferences(tinaCMSData.tags, 'tags', payload)
      : [];

    if (tinaCMSData.tags && tags.length < tinaCMSData.tags.length) {
      warnings.push(`Failed to resolve some tag references`);
    }

    // Build Payload yacht object
    const payloadYacht: Partial<PayloadYacht> = {
      // Basic information
      name,
      slug,
      description,
      image,
      images,

      // Specifications
      length: length ?? undefined,
      beam: beam ?? undefined,
      draft: draft ?? undefined,
      displacement: displacement ?? undefined,
      builder: tinaCMSData.builder,
      designer: tinaCMSData.designer,
      launchYear: tinaCMSData.launchYear,
      deliveryYear: tinaCMSData.deliveryYear,
      homePort: tinaCMSData.homePort,
      flag: tinaCMSData.flag,
      classification: tinaCMSData.classification,

      // Performance
      cruisingSpeed: cruisingSpeed ?? undefined,
      maxSpeed: maxSpeed ?? undefined,
      range: range ?? undefined,

      // Capacity
      guests: tinaCMSData.guests,
      crew: tinaCMSData.crew,

      // Metadata
      featured: tinaCMSData.featured || false,
      published: true, // TinaCMS yachts are considered published

      // Tags
      tags: tags as any,

      // ============================================================================
      // YACHT-SPECIFIC CONTENT
      // ============================================================================
      // These fields are new in Payload and not present in TinaCMS
      // Default to undefined - can be populated later via admin UI

      // Timeline (not in TinaCMS)
      timeline: undefined,

      // Supplier map (not in TinaCMS)
      supplierMap: undefined,

      // Sustainability score (not in TinaCMS)
      sustainabilityScore: undefined,

      // Customizations (not in TinaCMS)
      customizations: undefined,

      // Maintenance history (not in TinaCMS)
      maintenanceHistory: undefined,

      // SEO
      seo: tinaCMSData.seo
        ? {
            metaTitle: tinaCMSData.seo.meta_title || tinaCMSData.seo.metaTitle,
            metaDescription: tinaCMSData.seo.meta_description || tinaCMSData.seo.metaDescription,
            keywords: tinaCMSData.seo.keywords,
            ogImage: transformMediaPath(tinaCMSData.seo.og_image || tinaCMSData.seo.ogImage),
          }
        : undefined,
    };

    return {
      success: true,
      data: payloadYacht,
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
