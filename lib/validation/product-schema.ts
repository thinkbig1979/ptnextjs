import { z } from 'zod';

/**
 * Product validation schemas for API operations
 * Matches Payload CMS Products collection field definitions
 */

// Product Image Schema - matches ProductImage interface and Payload CMS images array
export const ProductImageSchema = z.object({
  url: z.string().url('Invalid image URL').max(500, 'URL must be less than 500 characters'),
  altText: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().max(255, 'Alt text must be less than 255 characters').optional()
  ),
  isMain: z.boolean().optional().nullable().default(false),
  caption: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().max(255, 'Caption must be less than 255 characters').optional()
  ),
});

export type ProductImage = z.infer<typeof ProductImageSchema>;

// Specification Schema - matches Payload CMS specifications array
export const SpecificationSchema = z.object({
  label: z.string().min(1, 'Label is required').max(100, 'Label must be less than 100 characters'),
  value: z.string().min(1, 'Value is required').max(500, 'Value must be less than 500 characters'),
});

export type Specification = z.infer<typeof SpecificationSchema>;

// Feature Schema - matches Payload CMS features array
export const FeatureSchema = z.object({
  title: z.string().min(1, 'Feature title is required').max(200, 'Title must be less than 200 characters'),
  description: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().max(1000, 'Description must be less than 1000 characters').optional()
  ),
  icon: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().max(100, 'Icon must be less than 100 characters').optional()
  ),
  order: z.number().int().min(0).optional().nullable(),
});

export type Feature = z.infer<typeof FeatureSchema>;

// Pricing Schema - matches Payload CMS pricing group
export const PricingSchema = z.object({
  displayText: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().max(100, 'Display text must be less than 100 characters').optional()
  ),
  subtitle: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().max(200, 'Subtitle must be less than 200 characters').optional()
  ),
  showContactForm: z.boolean().optional().nullable().default(true),
  currency: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().max(10, 'Currency must be less than 10 characters').optional()
  ),
});

export type Pricing = z.infer<typeof PricingSchema>;

// Action Button Schema - matches Payload CMS actionButtons array
export const ActionButtonSchema = z.object({
  label: z.string().min(1, 'Button label is required').max(100, 'Label must be less than 100 characters'),
  type: z.enum(['primary', 'secondary', 'outline'], {
    required_error: 'Button type is required',
  }),
  action: z.enum(['contact', 'quote', 'download', 'external_link', 'video'], {
    required_error: 'Button action is required',
  }),
  actionData: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().max(500, 'Action data must be less than 500 characters').optional()
  ),
  icon: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().max(100, 'Icon must be less than 100 characters').optional()
  ),
  order: z.number().int().min(0).optional().nullable(),
});

type ActionButton = z.infer<typeof ActionButtonSchema>;

// Badge Schema - matches Payload CMS badges array
export const BadgeSchema = z.object({
  label: z.string().min(1, 'Badge label is required').max(100, 'Label must be less than 100 characters'),
  type: z.enum(['secondary', 'outline', 'success', 'warning', 'info'], {
    required_error: 'Badge type is required',
  }),
  icon: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().max(100, 'Icon must be less than 100 characters').optional()
  ),
  order: z.number().int().min(0).optional().nullable(),
});

export type Badge = z.infer<typeof BadgeSchema>;

// SEO Schema - matches Payload CMS seo group
export const SeoSchema = z.object({
  metaTitle: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().max(100, 'Meta title must be less than 100 characters').optional()
  ),
  metaDescription: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().max(300, 'Meta description must be less than 300 characters').optional()
  ),
  keywords: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().max(500, 'Keywords must be less than 500 characters').optional()
  ),
  ogImage: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().max(500, 'OG image URL must be less than 500 characters').optional()
  ),
});

type Seo = z.infer<typeof SeoSchema>;

// Helper to coerce string or number to string for relationship IDs
const relationshipIdSchema = z.preprocess(
  (val) => (typeof val === 'number' ? String(val) : val),
  z.string()
);

// Create Product Schema - all required fields for product creation
export const CreateProductSchema = z.object({
  // Required fields
  name: z.string().min(1, 'Product name is required').max(255, 'Product name must be less than 255 characters'),
  description: z.string().min(1, 'Product description is required'),
  vendor: z.string().min(1, 'Vendor ID is required'), // Relationship ID

  // Optional basic fields
  slug: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().max(255, 'Slug must be less than 255 characters').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').optional()
  ),
  shortDescription: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().max(500, 'Short description must be less than 500 characters').optional()
  ),

  // Product images array
  images: z.array(ProductImageSchema).optional().nullable().default([]),

  // Categories and tags relationships (accept both string and number IDs)
  categories: z.array(relationshipIdSchema).optional().nullable().default([]),
  tags: z.array(relationshipIdSchema).optional().nullable().default([]),

  // Specifications array
  specifications: z.array(SpecificationSchema).optional().nullable().default([]),

  // Features array
  features: z.array(FeatureSchema).optional().nullable().default([]),

  // Pricing information
  price: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().max(100, 'Price must be less than 100 characters').optional()
  ),
  pricing: PricingSchema.optional().nullable(),

  // Action buttons array
  actionButtons: z.array(ActionButtonSchema).optional().nullable().default([]),

  // Badges array
  badges: z.array(BadgeSchema).optional().nullable().default([]),

  // SEO settings
  seo: SeoSchema.optional().nullable(),

  // Published status
  published: z.boolean().optional().nullable().default(false),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;

// Update Product Schema - all fields optional for partial updates
export const UpdateProductSchema = z.object({
  // Optional basic fields
  name: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().min(1, 'Product name must be at least 1 character if provided').max(255, 'Product name must be less than 255 characters').optional()
  ),
  description: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().min(1, 'Description must be at least 1 character if provided').optional()
  ),
  slug: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().max(255, 'Slug must be less than 255 characters').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').optional()
  ),
  shortDescription: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().max(500, 'Short description must be less than 500 characters').optional()
  ),

  // Vendor relationship (usually shouldn't change after creation)
  vendor: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().optional()
  ),

  // Product images array
  images: z.array(ProductImageSchema).optional().nullable(),

  // Categories and tags relationships (accept both string and number IDs)
  categories: z.array(relationshipIdSchema).optional().nullable(),
  tags: z.array(relationshipIdSchema).optional().nullable(),

  // Specifications array
  specifications: z.array(SpecificationSchema).optional().nullable(),

  // Features array
  features: z.array(FeatureSchema).optional().nullable(),

  // Pricing information
  price: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().max(100, 'Price must be less than 100 characters').optional()
  ),
  pricing: PricingSchema.optional().nullable(),

  // Action buttons array
  actionButtons: z.array(ActionButtonSchema).optional().nullable(),

  // Badges array
  badges: z.array(BadgeSchema).optional().nullable(),

  // SEO settings
  seo: SeoSchema.optional().nullable(),

  // Published status
  published: z.boolean().optional().nullable(),
});

export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

// Toggle Publish Schema - simple schema for publish/unpublish operations
export const TogglePublishSchema = z.object({
  published: z.boolean({
    required_error: 'Published status is required',
    invalid_type_error: 'Published must be a boolean',
  }),
});

export type TogglePublishInput = z.infer<typeof TogglePublishSchema>;

// Bulk Operations Schemas (useful for future bulk operations)
export const BulkPublishSchema = z.object({
  productIds: z.array(z.string()).min(1, 'At least one product ID is required'),
  published: z.boolean(),
});

type BulkPublishInput = z.infer<typeof BulkPublishSchema>;

export const BulkDeleteSchema = z.object({
  productIds: z.array(z.string()).min(1, 'At least one product ID is required'),
});

type BulkDeleteInput = z.infer<typeof BulkDeleteSchema>;
