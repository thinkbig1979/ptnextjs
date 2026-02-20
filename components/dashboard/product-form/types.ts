import { z } from 'zod';

/**
 * Extended Product Form Types and Schemas
 *
 * Re-exports existing API schemas for use in the product form.
 * Used with React Hook Form + Zod resolver for form validation.
 */

// Re-export all schemas from API validation (single source of truth)
export {
  
  
  
  
  
  
  
  type ProductImage,
  
  
  
  
  type Badge,
  
} from '@/lib/validation/product-schema';

// Import base schemas for ExtendedProductFormSchema
import {
  ProductImageSchema as BaseProductImageSchema,
  SpecificationSchema as BaseSpecificationSchema,
  FeatureSchema as BaseFeatureSchema,
  PricingSchema as BasePricingSchema,
  ActionButtonSchema as BaseActionButtonSchema,
  BadgeSchema as BaseBadgeSchema,
  SeoSchema as BaseSeoSchema,
} from '@/lib/validation/product-schema';

// =============================================================================
// Extended Product Form Schema
// =============================================================================

/**
 * Extended Product Form Schema
 *
 * Comprehensive schema for the enhanced product form combining:
 * - Basic product info (name, description, slug)
 * - Media (images)
 * - Categorization (categories, tags)
 * - Technical details (specifications, features)
 * - Pricing configuration
 * - Call-to-action buttons
 * - Quality badges
 * - SEO settings
 */
export const ExtendedProductFormSchema = z.object({
  // Required fields
  name: z.string().min(1, 'Product name is required').max(255),
  description: z.string().min(1, 'Description is required'),

  // Optional basic fields
  shortDescription: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().max(500).optional()
  ),
  slug: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string()
      .max(255)
      .regex(/^[a-z0-9-]*$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
      .optional()
  ),

  // Arrays with defaults
  images: z.array(BaseProductImageSchema).optional().default([]),
  specifications: z.array(BaseSpecificationSchema).optional().default([]),
  features: z.array(BaseFeatureSchema).optional().default([]),

  // Relationship IDs (categories and tags)
  categories: z.array(
    z.union([z.string(), z.number()]).transform(val => typeof val === 'number' ? val : String(val))
  ).optional().default([]),
  tags: z.array(
    z.union([z.string(), z.number()]).transform(val => typeof val === 'number' ? val : String(val))
  ).optional().default([]),

  // Enhanced form fields
  actionButtons: z.array(BaseActionButtonSchema).optional().default([]),
  badges: z.array(BaseBadgeSchema).optional().default([]),

  // Pricing
  price: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().max(100).optional()
  ),
  pricing: BasePricingSchema.optional(),

  // SEO
  seo: BaseSeoSchema.optional(),

  // Status
  published: z.boolean().optional().default(false),
});

export type ExtendedProductFormValues = z.infer<typeof ExtendedProductFormSchema>;

// =============================================================================
// Default Form Values
// =============================================================================

/**
 * Default values for initializing the form
 * Ensures arrays are properly initialized as empty arrays
 */
export const defaultExtendedProductFormValues: ExtendedProductFormValues = {
  name: '',
  description: '',
  shortDescription: '',
  slug: '',
  images: [],
  specifications: [],
  features: [],
  categories: [],
  tags: [],
  actionButtons: [],
  badges: [],
  price: '',
  pricing: {
    displayText: '',
    subtitle: '',
    showContactForm: true,
    currency: '',
  },
  seo: {
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    ogImage: '',
  },
  published: false,
};

// =============================================================================
// Form Section Types
// =============================================================================

/**
 * Tier access levels for gating form sections
 */
export type TierLevel = 'free' | 'tier1' | 'tier2' | 'tier3';

/**
 * Form section configuration for collapsible sections
 */
interface FormSectionConfig {
  id: string;
  title: string;
  description?: string;
  requiredTier?: TierLevel;
  defaultOpen?: boolean;
}

/**
 * Array field item with order property for drag-and-drop reordering
 */
interface OrderableItem {
  order?: number | null;
}

// =============================================================================
// Utility Types
// =============================================================================

/**
 * Category option for multi-select dropdown
 */
export interface CategoryOption {
  id: number | string;
  name: string;
  slug: string;
  description?: string;
}

/**
 * Tag option for multi-select dropdown
 */
export interface TagOption {
  id: number | string;
  name: string;
  slug: string;
  color?: string;
}

/**
 * Form submission result
 */
interface FormSubmissionResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}
