# Integration Strategy - TinaCMS to Payload CMS Migration

> Created: 2025-10-14
> Task: PRE-1
> Author: integration-coordinator

## Overview

This document defines the complete integration strategy for migrating from TinaCMS markdown-based content management to Payload CMS database collections. The strategy ensures zero breaking changes to frontend pages while establishing a robust transformation layer and data service interface.

---

## 1. Transformation Layer Architecture

### File Structure

```
src/lib/transformers/
├── base-transformer.ts           # Shared utilities and base transformation functions
├── vendor-transformer.ts          # TinaCMS vendor → Payload vendor transformation
├── product-transformer.ts         # TinaCMS product → Payload product transformation
├── yacht-transformer.ts           # TinaCMS yacht → Payload yacht transformation
├── blog-transformer.ts            # TinaCMS blog post → Payload blog post transformation
├── team-transformer.ts            # TinaCMS team member → Payload team member transformation
├── category-transformer.ts        # TinaCMS category → Payload category transformation
├── tag-transformer.ts             # Tag extraction and transformation
└── markdown-to-lexical.ts         # Markdown → Lexical rich text conversion
```

### Base Transformer Utilities

**File: `src/lib/transformers/base-transformer.ts`**

```typescript
/**
 * Base transformation utilities shared across all transformers
 */

export interface TransformOptions {
  preserveIds?: boolean;
  validateReferences?: boolean;
  throwOnError?: boolean;
}

export interface TransformResult<T> {
  data: T;
  errors: string[];
  warnings: string[];
}

/**
 * Transform media paths from TinaCMS format to Payload public URLs
 *
 * Handles:
 * - /media/ prefix addition
 * - /public/ prefix removal
 * - Full URL passthrough
 * - Empty/undefined handling
 */
export function transformMediaPath(mediaPath: string | undefined): string {
  if (!mediaPath) return '';

  // Already a full URL
  if (mediaPath.startsWith('http')) return mediaPath;

  // Already has /media/ prefix
  if (mediaPath.startsWith('/media/')) return mediaPath;

  // Has / but not /media/
  if (mediaPath.startsWith('/') && !mediaPath.startsWith('/public/')) return mediaPath;

  // Remove /public/ prefix and add /media/
  if (mediaPath.startsWith('/public/')) {
    return mediaPath.replace('/public', '/media');
  }

  // Default: add /media/ prefix
  return `/media/${mediaPath.replace(/^\/+/, '')}`;
}

/**
 * Resolve TinaCMS file reference to Payload database ID
 *
 * Strategy:
 * 1. Extract slug from file path (content/vendors/acme.md → acme)
 * 2. Query Payload collection by slug
 * 3. Return database ID
 * 4. Cache results for performance
 */
export async function resolveFileReference(
  filePath: string,
  collection: string,
  payload: any
): Promise<string | null> {
  if (!filePath || !filePath.startsWith('content/')) return null;

  // Extract slug from file path
  const slug = filePath.split('/').pop()?.replace('.md', '') || '';

  // Query Payload by slug
  const result = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1
  });

  return result.docs[0]?.id || null;
}

/**
 * Resolve array of file references to array of database IDs
 */
export async function resolveFileReferences(
  filePaths: string[],
  collection: string,
  payload: any
): Promise<string[]> {
  const resolved = await Promise.all(
    filePaths.map(path => resolveFileReference(path, collection, payload))
  );

  return resolved.filter((id): id is string => id !== null);
}

/**
 * Extract slug from filename
 */
export function extractSlug(filename: string): string {
  return filename.replace('.md', '').replace(/^content\/[^/]+\//, '');
}

/**
 * Validate required fields presence
 */
export function validateRequiredFields<T extends Record<string, any>>(
  data: T,
  requiredFields: Array<keyof T>
): { isValid: boolean; missingFields: string[] } {
  const missingFields = requiredFields.filter(field => !data[field]);

  return {
    isValid: missingFields.length === 0,
    missingFields: missingFields as string[]
  };
}

/**
 * Safe array transformation with error handling
 */
export function transformArray<T, R>(
  items: T[] | undefined,
  transformer: (item: T, index: number) => R | null
): R[] {
  if (!Array.isArray(items)) return [];

  return items
    .map(transformer)
    .filter((item): item is R => item !== null);
}

/**
 * Default value provider for enhanced fields
 */
export function getDefaultEnhancedFields() {
  return {
    certifications: [],
    awards: [],
    socialProof: undefined,
    videoIntroduction: undefined,
    caseStudies: [],
    innovationHighlights: [],
    teamMembers: [],
    yachtProjects: []
  };
}
```

### Vendor Transformer

**File: `src/lib/transformers/vendor-transformer.ts`**

```typescript
import { transformMediaPath, transformArray, getDefaultEnhancedFields } from './base-transformer';
import type { Vendor } from '@/lib/types';

export interface TinaCMSVendor {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  image?: string;
  website?: string;
  founded?: number;
  location?: string;
  featured?: boolean;
  partner?: boolean;
  services?: Array<{ service: string }>;
  statistics?: Array<{ label: string; value: string; order?: number }>;
  achievements?: Array<{ title: string; description: string; icon?: string; order?: number }>;
  certifications?: any[];
  awards?: any[];
  socialProof?: any;
  videoIntroduction?: any;
  caseStudies?: any[];
  innovationHighlights?: any[];
  teamMembers?: any[];
  yachtProjects?: any[];
}

export interface PayloadVendor {
  companyName: string;
  slug: string;
  description: string;
  logo?: string;
  image?: string;
  website?: string;
  founded?: number;
  location?: string;
  featured?: boolean;
  partner?: boolean;
  published?: boolean;
  services?: Array<{ service: string }>;
  statistics?: Array<{ label: string; value: string; order?: number }>;
  achievements?: Array<{ title: string; description: string; icon?: string; order?: number }>;
  certifications?: any[];
  awards?: any[];
  socialProof?: any;
  videoIntroduction?: any;
  caseStudies?: any[];
  innovationHighlights?: any[];
  teamMembers?: any[];
  yachtProjects?: any[];
  category?: string; // Relationship ID
  tags?: string[]; // Relationship IDs
}

/**
 * Transform TinaCMS vendor to Payload format
 */
export function transformVendorFromMarkdown(
  tinaVendor: TinaCMSVendor,
  filename: string
): PayloadVendor {
  const defaults = getDefaultEnhancedFields();

  return {
    companyName: tinaVendor.name,
    slug: tinaVendor.slug || filename,
    description: tinaVendor.description || 'Description coming soon.',
    logo: transformMediaPath(tinaVendor.logo),
    image: transformMediaPath(tinaVendor.image),
    website: tinaVendor.website,
    founded: tinaVendor.founded,
    location: tinaVendor.location,
    featured: tinaVendor.featured || false,
    partner: tinaVendor.partner !== undefined ? tinaVendor.partner : true,
    published: true, // Existing content is published

    // Services
    services: tinaVendor.services || [],
    statistics: tinaVendor.statistics || [],
    achievements: tinaVendor.achievements || [],

    // Enhanced fields with defaults
    certifications: transformArray(tinaVendor.certifications, (cert) => ({
      name: cert.name || '',
      issuer: cert.issuer || '',
      year: cert.year,
      expiryDate: cert.expiryDate,
      certificateUrl: cert.certificateUrl,
      logo: transformMediaPath(cert.logo)
    })),

    awards: transformArray(tinaVendor.awards, (award) => ({
      title: award.title || '',
      year: award.year || new Date().getFullYear(),
      organization: award.organization,
      category: award.category,
      description: award.description
    })),

    socialProof: tinaVendor.socialProof,
    videoIntroduction: tinaVendor.videoIntroduction ? {
      videoUrl: tinaVendor.videoIntroduction.videoUrl,
      thumbnailImage: transformMediaPath(tinaVendor.videoIntroduction.thumbnailImage),
      title: tinaVendor.videoIntroduction.title,
      description: tinaVendor.videoIntroduction.description
    } : undefined,

    caseStudies: transformArray(tinaVendor.caseStudies, (cs) => ({
      title: cs.title || '',
      slug: cs.slug || '',
      client: cs.client,
      challenge: cs.challenge || '',
      solution: cs.solution || '',
      results: cs.results,
      images: (cs.images || []).map(transformMediaPath),
      technologies: cs.technologies || []
    })),

    innovationHighlights: tinaVendor.innovationHighlights || defaults.innovationHighlights,
    teamMembers: transformArray(tinaVendor.teamMembers, (tm) => ({
      name: tm.name || '',
      position: tm.position || '',
      bio: tm.bio,
      photo: transformMediaPath(tm.photo),
      linkedinUrl: tm.linkedinUrl,
      expertise: tm.expertise || []
    })),

    yachtProjects: transformArray(tinaVendor.yachtProjects, (yp) => ({
      yachtName: yp.yachtName || '',
      systems: yp.systems || [],
      projectYear: yp.projectYear,
      role: yp.role,
      description: yp.description
    }))
  };
}
```

### Product Transformer

**File: `src/lib/transformers/product-transformer.ts`**

```typescript
import { transformMediaPath, transformArray } from './base-transformer';
import type { Product } from '@/lib/types';

export interface TinaCMSProduct {
  name: string;
  slug: string;
  description: string;
  price?: string;
  product_images?: any[];
  features?: any[];
  specifications?: any[];
  benefits?: any[];
  services?: any[];
  pricing?: any;
  action_buttons?: any[];
  badges?: any[];
  comparisonMetrics?: any;
  integrationCompatibility?: any[];
  ownerReviews?: any[];
  visualDemo?: any;
}

export interface PayloadProduct {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price?: string;
  published?: boolean;
  images: any[];
  features?: any[];
  specifications?: any[];
  benefits?: any[];
  services?: any[];
  pricing?: any;
  actionButtons?: any[];
  badges?: any[];
  comparisonMetrics?: any;
  integrationCompatibility?: any;
  ownerReviews?: any[];
  visualDemo?: any;
  vendor?: string; // Relationship ID
  categories?: string[]; // Relationship IDs
  tags?: string[]; // Relationship IDs
}

/**
 * Transform TinaCMS product to Payload format
 */
export function transformProductFromMarkdown(
  tinaProduct: TinaCMSProduct,
  filename: string
): PayloadProduct {
  const images = tinaProduct.product_images || [];
  const mainImage = images.find((img: any) => img.is_main) || images[0];

  return {
    name: tinaProduct.name,
    slug: tinaProduct.slug || filename,
    description: tinaProduct.description,
    shortDescription: tinaProduct.description.substring(0, 200),
    price: tinaProduct.price,
    published: true,

    // Images transformation
    images: images.map((img: any, index: number) => ({
      url: transformMediaPath(img.image),
      altText: img.alt_text || tinaProduct.name,
      isMain: img.is_main || false,
      caption: img.caption,
      order: index
    })),

    // Features
    features: transformArray(tinaProduct.features, (f, index) => ({
      title: f.title || '',
      description: f.description,
      icon: f.icon,
      order: f.order || index
    })),

    // Specifications
    specifications: transformArray(tinaProduct.specifications, (s) => ({
      label: s.label || '',
      value: s.value || ''
    })),

    // Enhanced fields
    benefits: tinaProduct.benefits || [],
    services: tinaProduct.services || [],
    pricing: tinaProduct.pricing,
    actionButtons: tinaProduct.action_buttons || [],
    badges: tinaProduct.badges || [],
    comparisonMetrics: tinaProduct.comparisonMetrics || {},
    integrationCompatibility: tinaProduct.integrationCompatibility,
    ownerReviews: tinaProduct.ownerReviews || [],
    visualDemo: tinaProduct.visualDemo
  };
}
```

### Additional Transformer TypeScript Signatures

**Yacht Transformer** (`yacht-transformer.ts`):
```typescript
export function transformYachtFromMarkdown(tinaYacht: TinaCMSYacht, filename: string): PayloadYacht;
```

**Blog Transformer** (`blog-transformer.ts`):
```typescript
export function transformBlogPostFromMarkdown(tinaBlogPost: TinaCMSBlogPost, filename: string, markdownContent: string): PayloadBlogPost;
```

**Team Transformer** (`team-transformer.ts`):
```typescript
export function transformTeamMemberFromMarkdown(tinaMember: TinaCMSTeamMember, filename: string): PayloadTeamMember;
```

**Category Transformer** (`category-transformer.ts`):
```typescript
export function transformCategoryFromMarkdown(tinaCategory: TinaCMSCategory, filename: string): PayloadCategory;
```

**Tag Transformer** (`tag-transformer.ts`):
```typescript
export function extractTagsFromContent(content: any): string[];
export function transformTagFromMarkdown(tinaTag: TinaCMSTag, filename: string): PayloadTag;
```

---

## 2. Data Service Interface Contract

### PayloadCMSDataService Architecture

**File: `lib/payload-cms-data-service.ts` (Enhanced)**

The PayloadCMSDataService must maintain 100% API compatibility with TinaCMSDataService to ensure zero breaking changes to frontend pages.

### Method Signatures (Complete Parity)

```typescript
class PayloadCMSDataService {
  // ============================================
  // CACHING INFRASTRUCTURE (5-minute TTL)
  // ============================================
  private cache: Map<string, CacheEntry<any>>;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes (MUST match TinaCMS)
  private readonly MAX_CACHE_SIZE = 100;
  private readonly MAX_MEMORY_SIZE = 50 * 1024 * 1024; // 50MB

  private async getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T>;
  private cleanExpiredCache(): void;
  private evictLRUEntries(): void;

  // ============================================
  // VENDOR METHODS (Primary API)
  // ============================================
  async getAllVendors(): Promise<Vendor[]>;
  async getVendors(params?: {
    category?: string;
    featured?: boolean;
    partnersOnly?: boolean
  }): Promise<Vendor[]>;
  async getVendorBySlug(slug: string): Promise<Vendor | null>;
  async getVendorById(id: string): Promise<Vendor | null>;
  async getFeaturedVendors(): Promise<Vendor[]>;
  async searchVendors(query: string): Promise<Vendor[]>;
  async getVendorSlugs(): Promise<string[]>;

  // ============================================
  // PARTNER METHODS (Backward Compatibility)
  // ============================================
  async getAllPartners(): Promise<Partner[]>;
  async getPartners(params?: {
    category?: string;
    featured?: boolean
  }): Promise<Partner[]>;
  async getPartnerBySlug(slug: string): Promise<Partner | null>;
  async getPartnerById(id: string): Promise<Partner | null>;
  async getFeaturedPartners(): Promise<Partner[]>; // Filter: featured=true AND partner=true
  async searchPartners(query: string): Promise<Partner[]>;
  async getPartnerSlugs(): Promise<string[]>;

  // ============================================
  // PRODUCT METHODS
  // ============================================
  async getAllProducts(): Promise<Product[]>;
  async getProducts(params?: {
    category?: string;
    partnerId?: string;
    vendorId?: string
  }): Promise<Product[]>;
  async getProductBySlug(slug: string): Promise<Product | null>;
  async getProductById(id: string): Promise<Product | null>;
  async getProductsByVendor(vendorId: string): Promise<Product[]>;
  async getProductsByPartner(partnerId: string): Promise<Product[]>; // Alias for getProductsByVendor
  async searchProducts(query: string): Promise<Product[]>;
  async getProductSlugs(): Promise<string[]>;

  // ============================================
  // YACHT METHODS (New Collection)
  // ============================================
  async getAllYachts(): Promise<Yacht[]>;
  async getYachts(options?: { featured?: boolean }): Promise<Yacht[]>;
  async getYachtBySlug(slug: string): Promise<Yacht | null>;
  async getYachtById(id: string): Promise<Yacht | null>;
  async getFeaturedYachts(): Promise<Yacht[]>;
  async searchYachts(query: string): Promise<Yacht[]>;
  async getYachtSlugs(): Promise<string[]>;

  // ============================================
  // BLOG METHODS
  // ============================================
  async getAllBlogPosts(): Promise<BlogPost[]>;
  async getBlogPosts(params?: {
    category?: string;
    featured?: boolean
  }): Promise<BlogPost[]>;
  async getBlogPostBySlug(slug: string): Promise<BlogPost | null>;
  async searchBlogPosts(query: string): Promise<BlogPost[]>;
  async getBlogPostSlugs(): Promise<string[]>;

  // ============================================
  // CATEGORY METHODS
  // ============================================
  async getCategories(): Promise<Category[]>;
  async getBlogCategories(): Promise<Category[]>; // Alias for getCategories

  // ============================================
  // TAG METHODS (New Collection)
  // ============================================
  async getTags(): Promise<Tag[]>;
  async getTagBySlug(slug: string): Promise<Tag | null>;

  // ============================================
  // TEAM METHODS
  // ============================================
  async getTeamMembers(): Promise<TeamMember[]>;

  // ============================================
  // COMPANY INFO METHODS
  // ============================================
  async getCompanyInfo(): Promise<CompanyInfo>;

  // ============================================
  // ENHANCED VENDOR PROFILE METHODS
  // ============================================
  async getVendorCertifications(vendorId: string): Promise<any[]>;
  async getVendorAwards(vendorId: string): Promise<any[]>;
  async getVendorSocialProof(vendorId: string): Promise<any>;
  async getEnhancedVendorProfile(vendorId: string): Promise<any>;
  async preloadEnhancedVendorData(vendorId: string): Promise<void>;

  // ============================================
  // YACHT-SPECIFIC METHODS
  // ============================================
  async getYachtTimeline(yachtId: string): Promise<any[]>;
  async getYachtSupplierMap(yachtId: string): Promise<any[]>;
  async getYachtSustainabilityScore(yachtId: string): Promise<any>;
  async getYachtMaintenanceHistory(yachtId: string): Promise<any[]>;
  async getYachtCustomizations(yachtId: string): Promise<any[]>;
  async preloadYachtData(yachtId: string): Promise<void>;

  // ============================================
  // CACHE MANAGEMENT
  // ============================================
  clearCache(): void;
  clearVendorCache(vendorId?: string): void;
  clearYachtCache(yachtId?: string): void;
  getCacheStats(): CacheStats & { hitRatio: number };
  getCacheInfo(): Array<{ key: string; size: number; age: number; accessCount: number }>;
  getCacheStatistics(): { totalKeys: number; cacheSize: number; hitRatio?: number };

  // ============================================
  // VALIDATION METHODS
  // ============================================
  async validateCMSContent(): Promise<{ isValid: boolean; errors: string[] }>;
}
```

### Data Flow Architecture

```
┌─────────────┐
│   Page      │ (app/vendors/[slug]/page.tsx)
│  Component  │
└──────┬──────┘
       │ const vendor = await payloadCMSDataService.getVendorBySlug(slug)
       ↓
┌──────────────────────┐
│ PayloadCMSDataService│
│  getCached()         │ Check cache (5-min TTL)
└──────┬───────────────┘
       │ Cache Miss
       ↓
┌──────────────────────┐
│  Payload REST API    │ getPayload({ config }).find({ collection: 'vendors', ... })
└──────┬───────────────┘
       │ Raw Payload data
       ↓
┌──────────────────────┐
│ transformPayloadVendor│ Transform to TinaCMS-compatible format
└──────┬───────────────┘
       │ Vendor object
       ↓
┌──────────────────────┐
│  Cache & Return      │ Store in cache, return to page
└──────────────────────┘
```

### Transformation Strategy in Data Service

The PayloadCMSDataService must transform Payload responses to match TinaCMS data structures:

```typescript
private transformPayloadVendor(doc: any): Vendor {
  return {
    id: doc.id.toString(),
    slug: doc.slug,
    name: doc.companyName, // Payload field → TinaCMS field
    category: doc.category?.name || '', // Resolve relationship
    description: doc.description,
    logo: this.transformMediaPath(doc.logo),
    image: this.transformMediaPath(doc.image),
    website: doc.website,
    founded: doc.founded,
    location: doc.location,
    tags: doc.tags?.map((t: any) => t.name) || [], // Resolve relationships
    featured: doc.featured || false,
    partner: doc.partner !== undefined ? doc.partner : true,

    // Enhanced fields
    certifications: doc.certifications || [],
    awards: doc.awards || [],
    socialProof: doc.socialProof,
    videoIntroduction: doc.videoIntroduction,
    caseStudies: doc.caseStudies || [],
    innovationHighlights: doc.innovationHighlights || [],
    teamMembers: doc.teamMembers || [],
    yachtProjects: doc.yachtProjects || []
  };
}
```

---

## 3. Markdown-to-Lexical Conversion Strategy

### Converter Architecture

**File: `src/lib/transformers/markdown-to-lexical.ts`**

```typescript
import { marked } from 'marked';

export interface LexicalNode {
  type: string;
  version: number;
  [key: string]: any;
}

export interface LexicalDocument {
  root: {
    type: 'root';
    format: '';
    indent: 0;
    version: 1;
    children: LexicalNode[];
  };
}

/**
 * Convert markdown string to Lexical JSON format
 *
 * Supported markdown features:
 * - Headings (h1-h6)
 * - Paragraphs
 * - Lists (ordered/unordered)
 * - Links
 * - Images
 * - Code blocks
 * - Blockquotes
 * - Bold, italic, strikethrough
 * - Tables (if present)
 */
export function convertMarkdownToLexical(markdown: string): LexicalDocument {
  if (!markdown || markdown.trim() === '') {
    return {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        children: []
      }
    };
  }

  const tokens = marked.lexer(markdown);
  const children: LexicalNode[] = [];

  for (const token of tokens) {
    try {
      const node = tokenToLexicalNode(token);
      if (node) children.push(node);
    } catch (error) {
      console.warn(`Failed to convert markdown token:`, error);
      // Fall back to paragraph node
      children.push({
        type: 'paragraph',
        version: 1,
        children: [
          {
            type: 'text',
            version: 1,
            text: token.raw || ''
          }
        ]
      });
    }
  }

  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      children
    }
  };
}

/**
 * Convert markdown token to Lexical node
 */
function tokenToLexicalNode(token: any): LexicalNode | null {
  switch (token.type) {
    case 'heading':
      return {
        type: 'heading',
        version: 1,
        tag: `h${token.depth}`,
        children: parseInlineTokens(token.tokens)
      };

    case 'paragraph':
      return {
        type: 'paragraph',
        version: 1,
        children: parseInlineTokens(token.tokens)
      };

    case 'list':
      return {
        type: 'list',
        version: 1,
        listType: token.ordered ? 'number' : 'bullet',
        start: token.start || 1,
        children: token.items.map((item: any) => ({
          type: 'listitem',
          version: 1,
          children: parseInlineTokens(item.tokens)
        }))
      };

    case 'code':
      return {
        type: 'code',
        version: 1,
        language: token.lang || 'plaintext',
        children: [
          {
            type: 'text',
            version: 1,
            text: token.text
          }
        ]
      };

    case 'blockquote':
      return {
        type: 'quote',
        version: 1,
        children: token.tokens.map(tokenToLexicalNode).filter(Boolean)
      };

    default:
      console.warn(`Unsupported markdown token type: ${token.type}`);
      return null;
  }
}

/**
 * Parse inline markdown tokens (bold, italic, links, etc.)
 */
function parseInlineTokens(tokens: any[]): LexicalNode[] {
  if (!tokens) return [];

  return tokens.map((token: any) => {
    switch (token.type) {
      case 'text':
        return {
          type: 'text',
          version: 1,
          text: token.text,
          format: 0
        };

      case 'strong':
        return {
          type: 'text',
          version: 1,
          text: token.text,
          format: 1 // Bold
        };

      case 'em':
        return {
          type: 'text',
          version: 1,
          text: token.text,
          format: 2 // Italic
        };

      case 'link':
        return {
          type: 'link',
          version: 1,
          url: token.href,
          children: [
            {
              type: 'text',
              version: 1,
              text: token.text
            }
          ]
        };

      case 'image':
        return {
          type: 'image',
          version: 1,
          src: token.href,
          altText: token.text || '',
          width: null,
          height: null
        };

      default:
        return {
          type: 'text',
          version: 1,
          text: token.raw || token.text || ''
        };
    }
  }).filter(Boolean);
}

/**
 * Error handling wrapper
 */
export function safeMarkdownToLexical(markdown: string): LexicalDocument {
  try {
    return convertMarkdownToLexical(markdown);
  } catch (error) {
    console.error('Failed to convert markdown to Lexical:', error);

    // Return safe fallback
    return {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'paragraph',
            version: 1,
            children: [
              {
                type: 'text',
                version: 1,
                text: markdown
              }
            ]
          }
        ]
      }
    };
  }
}
```

### Conversion Usage in Migration Script

```typescript
import { convertMarkdownToLexical } from '@/lib/transformers/markdown-to-lexical';

// During blog post migration
const { data, content } = matter(fileContent);
const lexicalContent = convertMarkdownToLexical(content);

await payload.create({
  collection: 'blog-posts',
  data: {
    title: data.title,
    slug: data.slug,
    content: lexicalContent, // Lexical JSON
    // ... other fields
  }
});
```

---

## 4. Backward Compatibility Strategy

### Vendor/Partner Unification

**Approach:**
- Single unified `Vendor` model in Payload with `partner: boolean` field
- `Partner` interface extends `Vendor` in TypeScript
- PayloadCMSDataService provides both Vendor and Partner methods

**Implementation:**

```typescript
// lib/types.ts
export interface Vendor {
  id: string;
  name: string;
  partner: boolean; // New field: distinguishes partners from suppliers
  // ... all other fields
}

export interface Partner extends Vendor {
  // Partner is simply an alias for Vendor
  // partner field is implicit (always true for Partner type)
}
```

```typescript
// lib/payload-cms-data-service.ts
async getFeaturedPartners(): Promise<Partner[]> {
  const vendors = await this.getAllVendors();

  // Filter: featured AND partner
  const featuredPartners = vendors.filter(
    v => v.featured === true && v.partner === true
  );

  return featuredPartners.map(v => ({ ...v } as Partner));
}
```

### Reference Resolution Strategy

**TinaCMS File References → Payload Database IDs**

```typescript
// TinaCMS markdown:
// vendor: "content/vendors/acme.md"

// Migration transformation:
const vendorRef = data.vendor; // "content/vendors/acme.md"
const vendorSlug = vendorRef.split('/').pop()?.replace('.md', ''); // "acme"

// Query Payload to get database ID
const vendorResult = await payload.find({
  collection: 'vendors',
  where: { slug: { equals: vendorSlug } },
  limit: 1
});

const vendorId = vendorResult.docs[0]?.id; // "cm3abc123def"

// Store database ID in product
await payload.create({
  collection: 'products',
  data: {
    name: data.name,
    vendor: vendorId, // Database relationship
    // ... other fields
  }
});
```

### Dual Field Population

Products maintain both vendor and partner fields for backward compatibility:

```typescript
// In PayloadCMSDataService transformation
private transformPayloadProduct(doc: any): Product {
  const vendor = doc.vendor;

  return {
    id: doc.id.toString(),
    name: doc.name,

    // Both vendor and partner fields populated
    vendorId: vendor?.id?.toString() || '',
    vendorName: vendor?.companyName || '',
    partnerId: vendor?.id?.toString() || '', // Same as vendorId
    partnerName: vendor?.companyName || '', // Same as vendorName

    vendor: vendor ? this.transformPayloadVendor(vendor) : undefined,
    partner: vendor ? this.transformPayloadVendor(vendor) : undefined,

    // ... other fields
  };
}
```

---

## 5. Media Path Transformation

**Strategy:**
- TinaCMS uses direct file paths: `/media/logo.png` or `public/media/logo.png`
- Payload CMS stores uploads in: `/media/filename-hash.png`
- Transformation layer normalizes all paths to `/media/` prefix

**Implementation in transformMediaPath():**
1. Detect format (HTTP URL, /media/, /public/, relative)
2. Apply appropriate transformation
3. Ensure consistent `/media/` prefix for public URLs

---

## 6. Error Handling Patterns

### Transformation Error Handling

```typescript
export interface TransformResult<T> {
  data: T | null;
  errors: string[];
  warnings: string[];
}

export function safeTransform<T>(
  transformer: () => T,
  context: string
): TransformResult<T> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const data = transformer();
    return { data, errors, warnings };
  } catch (error) {
    errors.push(`${context}: ${error.message}`);
    return { data: null, errors, warnings };
  }
}
```

### Data Service Error Handling

```typescript
private async getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  try {
    // Cache logic
    const data = await fetcher();
    return data;
  } catch (error) {
    console.error(`Failed to fetch ${key}:`, error);
    throw new Error(
      `Static build failed: Unable to fetch ${key} from Payload CMS. ` +
      `Ensure database is accessible and collections are properly configured.`
    );
  }
}
```

---

## 7. Performance Optimization

### Caching Strategy

**5-Minute TTL (Matches TinaCMS):**
- Cache key patterns: `vendors`, `vendor:${slug}`, `enhanced-vendor:${id}`
- LRU eviction when exceeding MAX_CACHE_SIZE (100 entries)
- Memory-based eviction when exceeding MAX_MEMORY_SIZE (50MB)
- Automatic cleanup every 60 seconds

### Preloading Methods

```typescript
// Preload all vendor data in parallel
async preloadEnhancedVendorData(vendorId: string): Promise<void> {
  await Promise.all([
    this.getVendorCertifications(vendorId),
    this.getVendorAwards(vendorId),
    this.getVendorSocialProof(vendorId),
    this.getEnhancedVendorProfile(vendorId)
  ]);
}
```

### Depth Control in Payload Queries

```typescript
// Optimize relationship loading
await payload.find({
  collection: 'products',
  depth: 3, // Load vendor → vendor.category → vendor.tags
  limit: 1000
});
```

---

## Success Criteria

1. **Zero Breaking Changes**: All frontend pages work identically with PayloadCMSDataService
2. **100% Method Parity**: All 50+ TinaCMSDataService methods replicated
3. **Consistent Caching**: 5-minute TTL maintained across migrations
4. **Data Integrity**: All transformations preserve data accuracy
5. **Performance**: Build time remains < 5 minutes
6. **Error Resilience**: Graceful degradation with meaningful error messages

---

## Next Steps

This integration strategy enables:
- Phase 2: Backend Implementation (Payload collections enhancement)
- Phase 3: Migration Script Development (Using transformation layer)
- Phase 4: Frontend Integration (Swapping data services)
- Phase 5: Testing & Validation (Using validation strategy from PRE-2)
