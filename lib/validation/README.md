# Product Validation Schemas

This directory contains Zod validation schemas for product-related operations.

## Overview

The `product-schema.ts` file provides comprehensive validation schemas that match the Payload CMS Products collection field definitions. These schemas are designed for use in API routes and form validation.

## Available Schemas

### Core Schemas

#### ProductImageSchema
Validates product image objects.

```typescript
import { ProductImageSchema, type ProductImage } from '@/lib/validation/product-schema';

const image: ProductImage = {
  url: 'https://example.com/image.jpg',
  altText: 'Product image', // optional
  isMain: true, // optional, defaults to false
  caption: 'Image caption', // optional
};

const result = ProductImageSchema.safeParse(image);
```

**Fields:**
- `url` (required): Valid URL, max 500 characters
- `altText` (optional): Max 255 characters, empty strings converted to undefined
- `isMain` (optional): Boolean, defaults to false
- `caption` (optional): Max 255 characters, empty strings converted to undefined

#### SpecificationSchema
Validates product technical specifications.

```typescript
import { SpecificationSchema, type Specification } from '@/lib/validation/product-schema';

const spec: Specification = {
  label: 'Weight',
  value: '10 kg',
};

const result = SpecificationSchema.safeParse(spec);
```

**Fields:**
- `label` (required): Min 1, max 100 characters
- `value` (required): Min 1, max 500 characters

#### FeatureSchema
Validates product features.

```typescript
import { FeatureSchema, type Feature } from '@/lib/validation/product-schema';

const feature: Feature = {
  title: 'Advanced Navigation',
  description: 'GPS system', // optional
  icon: 'navigation', // optional
  order: 1, // optional
};

const result = FeatureSchema.safeParse(feature);
```

**Fields:**
- `title` (required): Min 1, max 200 characters
- `description` (optional): Max 1000 characters
- `icon` (optional): Max 100 characters
- `order` (optional): Non-negative integer

#### PricingSchema
Validates product pricing configuration.

```typescript
import { PricingSchema, type Pricing } from '@/lib/validation/product-schema';

const pricing: Pricing = {
  displayText: '$50,000',
  subtitle: 'Starting price',
  showContactForm: true,
  currency: 'USD',
};

const result = PricingSchema.safeParse(pricing);
```

**Fields:**
- `displayText` (optional): Max 100 characters
- `subtitle` (optional): Max 200 characters
- `showContactForm` (optional): Boolean, defaults to true
- `currency` (optional): Max 10 characters

### Operation Schemas

#### CreateProductSchema
Validates product creation requests. All required fields must be provided.

```typescript
import { CreateProductSchema, type CreateProductInput } from '@/lib/validation/product-schema';

const newProduct: CreateProductInput = {
  name: 'Marine Navigation System',
  description: 'Advanced GPS navigation system',
  vendor: 'vendor-id-123', // Required: Vendor relationship ID

  // Optional fields
  slug: 'marine-navigation-system',
  shortDescription: 'GPS for yachts',
  images: [],
  categories: ['cat-1', 'cat-2'],
  tags: ['tag-1'],
  specifications: [
    { label: 'Weight', value: '5 kg' }
  ],
  features: [
    { title: 'GPS', description: 'High-precision' }
  ],
  price: '$10,000',
  pricing: {
    displayText: '$10,000',
    currency: 'USD',
  },
  published: false,
};

const result = CreateProductSchema.safeParse(newProduct);
```

**Required Fields:**
- `name`: Min 1, max 255 characters
- `description`: Min 1 character (richText content)
- `vendor`: Vendor relationship ID

**Optional Fields:**
- All other fields are optional with sensible defaults

#### UpdateProductSchema
Validates product update requests. All fields are optional for partial updates.

```typescript
import { UpdateProductSchema, type UpdateProductInput } from '@/lib/validation/product-schema';

const update: UpdateProductInput = {
  name: 'Updated Product Name',
  published: true,
  // Only include fields you want to update
};

const result = UpdateProductSchema.safeParse(update);
```

**Features:**
- All fields are optional
- Empty strings are converted to undefined
- Supports partial updates

#### TogglePublishSchema
Simple schema for publish/unpublish operations.

```typescript
import { TogglePublishSchema, type TogglePublishInput } from '@/lib/validation/product-schema';

const toggle: TogglePublishInput = {
  published: true,
};

const result = TogglePublishSchema.safeParse(toggle);
```

**Fields:**
- `published` (required): Boolean

### Bulk Operation Schemas

#### BulkPublishSchema
Validates bulk publish/unpublish operations.

```typescript
import { BulkPublishSchema, type BulkPublishInput } from '@/lib/validation/product-schema';

const bulkPublish: BulkPublishInput = {
  productIds: ['prod-1', 'prod-2', 'prod-3'],
  published: true,
};

const result = BulkPublishSchema.safeParse(bulkPublish);
```

#### BulkDeleteSchema
Validates bulk delete operations.

```typescript
import { BulkDeleteSchema, type BulkDeleteInput } from '@/lib/validation/product-schema';

const bulkDelete: BulkDeleteInput = {
  productIds: ['prod-1', 'prod-2'],
};

const result = BulkDeleteSchema.safeParse(bulkDelete);
```

## Usage in API Routes

### Example: Create Product Endpoint

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { CreateProductSchema } from '@/lib/validation/product-schema';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body
    const validation = CreateProductSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten()
        },
        { status: 400 }
      );
    }

    const productData = validation.data;

    // Create product in database
    // ...

    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Example: Update Product Endpoint

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { UpdateProductSchema } from '@/lib/validation/product-schema';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    // Validate request body
    const validation = UpdateProductSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten()
        },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    // Update product in database
    // ...

    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Key Features

### Empty String Handling
The schemas use `z.preprocess()` to convert empty strings to `undefined`. This prevents validation errors when forms submit empty strings for optional fields.

```typescript
// Input: { name: 'Product', shortDescription: '' }
// After validation: { name: 'Product', shortDescription: undefined }
```

### Slug Validation
Slug fields enforce lowercase alphanumeric characters and hyphens only:

```typescript
slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
```

### Array Defaults
Array fields default to empty arrays when not provided:

```typescript
images: z.array(ProductImageSchema).optional().nullable().default([])
```

### Nullable vs Optional
- `optional()`: Field can be omitted from the object
- `nullable()`: Field can be explicitly set to `null`
- Both can be combined for maximum flexibility

## Pattern Reference

These schemas follow the same patterns as `vendorSchemas.ts`:

1. Use `z.preprocess()` for optional string fields to handle empty strings
2. Include min/max constraints matching Payload CMS field definitions
3. Export both schemas and inferred types
4. Provide sensible defaults for optional fields
5. Use descriptive error messages

## Testing

Comprehensive tests are available in `__tests__/product-schema.test.ts`. Run tests with:

```bash
npm test lib/validation/__tests__/product-schema.test.ts
```

## Type Safety

All schemas export corresponding TypeScript types using `z.infer<typeof Schema>`:

```typescript
import type {
  CreateProductInput,
  UpdateProductInput,
  TogglePublishInput,
  ProductImage,
  Specification,
  Feature,
  Pricing,
} from '@/lib/validation/product-schema';
```

These types provide full IDE autocompletion and type checking.
