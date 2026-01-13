import { z } from 'zod';

/**
 * Extended Product Form Types and Schemas
 *
 * Re-exports existing API schemas and adds new schemas for enhanced form fields.
 * Used with React Hook Form + Zod resolver for form validation.
 */

// Re-export existing schemas from API validation
export {
  ProductImageSchema,
  SpecificationSchema,
  FeatureSchema,
  PricingSchema,
  type ProductImage,
  type Specification,
  type Feature,
  type Pricing,
} from '@/lib/validation/product-schema';

// =============================================================================
// New Schemas for Enhanced Form Fields
// =============================================================================

/**
 * Action Button Schema - Call-to-action buttons for product page
 * Matches Products.ts actionButtons array
 */
export const ActionButtonSchema = z.object({
  label: z.string().min(1, 'Button label is required').max(100),
  type: z.enum(['primary', 'secondary', 'outline'], {
    required_error: 'Button type is required',
  }),
  action: z.enum(['contact', 'quote', 'download', 'external_link', 'video'], {
    required_error: 'Button action is required',
  }),
  actionData: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().max(500).optional()
  ),
  icon: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().max(100).optional()
  ),
  order: z.number().int().min(0).optional().nullable(),
});

export type ActionButton = z.infer<typeof ActionButtonSchema>;

/**
 * Badge Schema - Quality badges and certifications
 * Matches Products.ts badges array
 */
export const BadgeSchema = z.object({
  label: z.string().min(1, 'Badge label is required').max(100),
  type: z.enum(['secondary', 'outline', 'success', 'warning', 'info'], {
    required_error: 'Badge type is required',
  }),
  icon: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().max(100).optional()
  ),
  order: z.number().int().min(0).optional().nullable(),
});

export type Badge = z.infer<typeof BadgeSchema>;

/**
 * SEO Schema - Search engine optimization settings
 * Matches Products.ts seo group
 */
export const SeoSchema = z.object({
  metaTitle: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().max(100).optional()
  ),
  metaDescription: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().max(300).optional()
  ),
  keywords: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().max(500).optional()
  ),
  ogImage: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().url('Invalid URL').max(500).optional().or(z.literal(''))
  ),
});

export type Seo = z.infer<typeof SeoSchema>;

// Import base schemas for ExtendedProductFormSchema
import {
  ProductImageSchema as BaseProductImageSchema,
  SpecificationSchema as BaseSpecificationSchema,
  FeatureSchema as BaseFeatureSchema,
  PricingSchema as BasePricingSchema,
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
  categories: z.array(z.union([z.string(), z.number()])).optional().default([]),
  tags: z.array(z.union([z.string(), z.number()])).optional().default([]),

  // Enhanced form fields
  actionButtons: z.array(ActionButtonSchema).optional().default([]),
  badges: z.array(BadgeSchema).optional().default([]),

  // Pricing
  price: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().max(100).optional()
  ),
  pricing: BasePricingSchema.optional(),

  // SEO
  seo: SeoSchema.optional(),

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
export interface FormSectionConfig {
  id: string;
  title: string;
  description?: string;
  requiredTier?: TierLevel;
  defaultOpen?: boolean;
}

/**
 * Array field item with order property for drag-and-drop reordering
 */
export interface OrderableItem {
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
export interface FormSubmissionResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}
