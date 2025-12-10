# Task: Create Product Validation Schemas (Zod)

## Metadata
- **ID**: task-be-2
- **Phase**: 2 - Backend Implementation
- **Agent**: backend-nodejs-specialist
- **Time**: 20-25 min
- **Dependencies**: none
- **Status**: pending

## Description

Create Zod validation schemas for product create and update operations. These schemas will be used by both API routes and frontend forms to ensure consistent validation.

## Specifics

### File to Create
`lib/validation/product-schema.ts`

### Required Schemas

```typescript
import { z } from 'zod';

// Image object schema
export const ProductImageSchema = z.object({
  url: z.string().url().max(500),
  altText: z.string().max(255).optional(),
  isMain: z.boolean().optional(),
  caption: z.string().max(500).optional(),
});

// Specification key-value pair
export const SpecificationSchema = z.object({
  label: z.string().min(1).max(100),
  value: z.string().min(1).max(500),
});

// Create product schema
export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().min(1, 'Description is required'),
  shortDescription: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().max(500).optional()
  ),
  categories: z.array(z.string()).optional(),
  images: z.array(ProductImageSchema).optional(),
  specifications: z.array(SpecificationSchema).optional(),
  published: z.boolean().optional().default(false),
});

// Update product schema (all fields optional)
export const UpdateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  shortDescription: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.string().max(500).optional()
  ),
  categories: z.array(z.string()).optional(),
  images: z.array(ProductImageSchema).optional(),
  specifications: z.array(SpecificationSchema).optional(),
  published: z.boolean().optional(),
});

// Toggle publish schema
export const TogglePublishSchema = z.object({
  published: z.boolean(),
});

// Type exports
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type TogglePublishInput = z.infer<typeof TogglePublishSchema>;
export type ProductImage = z.infer<typeof ProductImageSchema>;
export type Specification = z.infer<typeof SpecificationSchema>;
```

### Pattern Reference
Follow patterns from: `lib/validation/vendorSchemas.ts`
- Use `z.preprocess()` for optional string fields to handle empty strings
- Export both schemas and inferred types
- Include min/max constraints that match Payload CMS field definitions

## Acceptance Criteria

- [ ] All schemas created with proper validation rules
- [ ] Type exports for all schemas
- [ ] Empty string handling for optional fields
- [ ] Validation rules match Payload CMS Products collection constraints
- [ ] No TypeScript errors

## Testing Requirements

These schemas should validate correctly:

```typescript
// Valid create
CreateProductSchema.parse({
  name: 'Advanced Navigation System',
  description: 'A state-of-the-art navigation system for superyachts.',
});

// Valid with all fields
CreateProductSchema.parse({
  name: 'GPS System',
  description: 'High-precision GPS.',
  shortDescription: 'Premium GPS for yachts',
  categories: ['cat-123', 'cat-456'],
  images: [{ url: 'https://example.com/img.jpg', altText: 'GPS' }],
  specifications: [{ label: 'Accuracy', value: '1cm' }],
  published: true,
});

// Invalid (missing required)
CreateProductSchema.parse({
  name: '',  // Should fail
  description: 'Test',
});

// Valid partial update
UpdateProductSchema.parse({
  name: 'Updated Name',
});

// Valid toggle
TogglePublishSchema.parse({
  published: true,
});
```

## Implementation Notes

### Empty String Handling

Use `z.preprocess()` to convert empty strings to undefined for optional fields:

```typescript
shortDescription: z.preprocess(
  (val) => (val === '' || val === null ? undefined : val),
  z.string().max(500).optional()
),
```

### Categories Validation

For v1, categories are just an array of string IDs. Reference integrity is handled by Payload CMS at save time.

## Related Files

- `lib/validation/vendorSchemas.ts` - Pattern reference
- `payload/collections/Products.ts` - Field constraints reference
