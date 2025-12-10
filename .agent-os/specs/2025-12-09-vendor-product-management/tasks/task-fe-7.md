# Task: Add TypeScript Types for Product API Responses

## Metadata
- **ID**: task-fe-7
- **Phase**: 3 - Frontend Implementation
- **Agent**: frontend-react-specialist
- **Time**: 15-20 min
- **Dependencies**: task-be-3 (API contract)
- **Status**: pending

## Description

Ensure TypeScript types for Product API responses are complete and consistent between frontend and backend. Verify existing types in `lib/types.ts` match API contract.

## Specifics

### File to Update/Verify
`lib/types.ts`

### Required Types

Verify these types exist and match API contract:

```typescript
// Product image
export interface ProductImage {
  url: string;
  altText?: string;
  isMain?: boolean;
  caption?: string;
}

// Product specification
export interface ProductSpecification {
  label: string;
  value: string;
}

// Product (full)
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | object;  // Can be string or Lexical JSON
  shortDescription?: string;
  vendor: string | Vendor;
  categories?: (string | Category)[];
  images?: ProductImage[];
  specifications?: ProductSpecification[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface GetProductsResponse {
  success: true;
  data: {
    products: Product[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface GetProductResponse {
  success: true;
  data: Product;
}

export interface CreateProductResponse {
  success: true;
  data: {
    product: Product;
    message: string;
  };
}

export interface UpdateProductResponse {
  success: true;
  data: {
    product: Product;
    message: string;
  };
}

export interface DeleteProductResponse {
  success: true;
  data: {
    message: string;
  };
}

export interface TogglePublishResponse {
  success: true;
  data: {
    product: Product;
    message: string;
  };
}

// Error response (shared)
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

// Union type for API responses
export type ProductApiResponse =
  | GetProductsResponse
  | GetProductResponse
  | CreateProductResponse
  | UpdateProductResponse
  | DeleteProductResponse
  | TogglePublishResponse
  | ApiErrorResponse;
```

### Verification Steps

1. Check if `Product` interface exists in `lib/types.ts`
2. Verify it matches Payload CMS Products collection fields
3. Add any missing response types
4. Export types that need to be shared

### Type Alignment Checklist

| Field | Payload Schema | TypeScript |
|-------|----------------|------------|
| id | auto | string |
| name | text (required) | string |
| slug | text (required) | string |
| description | richText | string \| object |
| shortDescription | textarea | string? |
| vendor | relationship | string \| Vendor |
| categories | relationship[] | (string \| Category)[]? |
| images | array | ProductImage[]? |
| specifications | array | ProductSpecification[]? |
| published | checkbox | boolean |
| createdAt | auto | string |
| updatedAt | auto | string |

## Acceptance Criteria

- [ ] Product interface exists and is complete
- [ ] ProductImage interface exists
- [ ] ProductSpecification interface exists
- [ ] API response types defined
- [ ] Types exported for use in components
- [ ] No TypeScript errors in existing code after updates

## Implementation Notes

### Check Existing Types First

```bash
# Search for existing Product type
grep -n "interface Product" lib/types.ts

# Search for ProductImage
grep -n "ProductImage" lib/types.ts
```

### Category Type Reference

The Product type references Category. Ensure this exists:

```typescript
export interface Category {
  id: string;
  name: string;
  slug?: string;
}
```

### Vendor Type Reference

The Product type references Vendor. This should already exist in the codebase.

## Related Files

- `lib/types.ts` - Main types file
- `lib/validation/product-schema.ts` - Zod schemas (task-be-2)
- `payload/collections/Products.ts` - Payload schema reference
