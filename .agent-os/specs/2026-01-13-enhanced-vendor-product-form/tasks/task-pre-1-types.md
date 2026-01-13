# Task: pre-1-types

## Metadata
- **Phase**: 1 - Pre-Execution
- **Agent**: implementation-specialist
- **Estimated Time**: 20-30 min
- **Dependencies**: none
- **Status**: pending

## Description

Create TypeScript types and extended Zod schemas for the enhanced product form. These types unify the existing API schemas with form-specific requirements.

## Specifics

### Files to Create
- `components/dashboard/product-form/types.ts` - Form types and schemas

### Files to Reference
- `lib/validation/product-schema.ts` - Existing API validation schemas
- `lib/types.ts` - Base Product type definition
- `payload/collections/Products.ts` - Full collection schema for reference

### Technical Details

1. **Import and re-export existing schemas** from `lib/validation/product-schema.ts`:
   - ProductImageSchema
   - SpecificationSchema
   - FeatureSchema
   - PricingSchema

2. **Create new schemas** (matching Products.ts collection):
   ```typescript
   ActionButtonSchema = z.object({
     label: z.string().min(1).max(100),
     type: z.enum(['primary', 'secondary', 'outline']),
     action: z.enum(['contact', 'quote', 'download', 'external_link', 'video']),
     actionData: z.string().max(500).optional(),
     icon: z.string().max(100).optional(),
     order: z.number().int().min(0).optional(),
   })

   BadgeSchema = z.object({
     label: z.string().min(1).max(100),
     type: z.enum(['secondary', 'outline', 'success', 'warning', 'info']),
     icon: z.string().max(100).optional(),
     order: z.number().int().min(0).optional(),
   })

   SeoSchema = z.object({
     metaTitle: z.string().max(100).optional(),
     metaDescription: z.string().max(300).optional(),
     keywords: z.string().max(500).optional(),
     ogImage: z.string().url().max(500).optional(),
   })
   ```

3. **Create ExtendedProductFormSchema** combining all sections

4. **Export TypeScript types** inferred from schemas

## Acceptance Criteria

- [ ] All types compile without TypeScript errors (`npm run type-check`)
- [ ] ExtendedProductFormSchema validates sample data correctly
- [ ] Existing ProductImageSchema, SpecificationSchema, FeatureSchema, PricingSchema are re-exported
- [ ] New schemas (ActionButton, Badge, SEO) match Products.ts collection fields
- [ ] Default values provided for optional array fields

## Context Requirements

### Must Read Before Implementation
- `lib/validation/product-schema.ts` - Full file to understand existing schemas
- `payload/collections/Products.ts` - Lines 100-200 for actionButtons, badges, seo fields

### Codebase Patterns
- Form schemas use Zod with React Hook Form resolver
- Optional arrays default to `[]` with `.optional().default([])`
- String lengths match API constraints

## Implementation Notes

```typescript
// Pattern for form schema with defaults
export const ExtendedProductFormSchema = z.object({
  // Required
  name: z.string().min(1, 'Product name is required').max(255),
  description: z.string().min(1, 'Description is required'),

  // Optional with empty string handling
  shortDescription: z.string().max(500).optional(),
  slug: z.string().max(255).regex(/^[a-z0-9-]*$/).optional(),

  // Arrays with defaults
  images: z.array(ProductImageSchema).optional().default([]),
  specifications: z.array(SpecificationSchema).optional().default([]),
  features: z.array(FeatureSchema).optional().default([]),
  categories: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  actionButtons: z.array(ActionButtonSchema).optional().default([]),
  badges: z.array(BadgeSchema).optional().default([]),

  // Objects
  price: z.string().max(100).optional(),
  pricing: PricingSchema.optional(),
  seo: SeoSchema.optional(),
});

export type ExtendedProductFormValues = z.infer<typeof ExtendedProductFormSchema>;
```

## Related Files
- `components/dashboard/ProductForm.tsx` - Will consume these types
- `components/dashboard/product-form/index.ts` - Re-exports (to be created)
