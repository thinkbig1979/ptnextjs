# Product API Types Update

## Summary
Adding TypeScript types for Product API responses and updating the Product interface to match Payload CMS schema.

## Changes Required

### 1. Update Product Interface (lines 796-853)

**Current Issues:**
- `description` is `string` but Payload uses `richText` (can be string or object)
- Missing `shortDescription?: string` field
- Missing `published: boolean` field
- `vendor` field only supports `Vendor` object, needs to support `string | Vendor`
- Missing `categories` field for Payload relationships
- `images` is required (`ProductImage[]`) but should be optional
- `features` is required but should be optional

**Required Changes:**
- Change `description: string` to `description: string | object`
- Add `shortDescription?: string`
- Add `published: boolean` (required field in Payload)
- Change `vendor?: Vendor` to `vendor?: string | Vendor`
- Add `categories?: (string | Category)[]`
- Update `tags` from `string[]` to `(string | Tag)[]`
- Change `images: ProductImage[]` to `images?: ProductImage[]`
- Change `features: Feature[]` to `features?: Feature[]`
- Add `actionButtons?: ProductActionButton[]` (camelCase from Payload)
- Keep `action_buttons` for backward compatibility

### 2. Add Product API Response Types (after line 853, before BlogPost interface)

```typescript
// ============================================================================
// PRODUCT API RESPONSE TYPES
// ============================================================================

/**
 * Response for getting list of products
 * GET /api/portal/vendors/[id]/products
 */
export interface GetProductsResponse {
  success: true;
  data: Product[];
}

/**
 * Response for getting single product
 * GET /api/portal/vendors/[id]/products/[productId]
 */
export interface GetProductResponse {
  success: true;
  data: Product;
}

/**
 * Response for creating a product
 * POST /api/portal/vendors/[id]/products
 */
export interface CreateProductResponse {
  success: true;
  data: Product;
}

/**
 * Response for updating a product
 * PUT /api/portal/vendors/[id]/products/[productId]
 */
export interface UpdateProductResponse {
  success: true;
  data: Product;
}

/**
 * Response for deleting a product
 * DELETE /api/portal/vendors/[id]/products/[productId]
 */
export interface DeleteProductResponse {
  success: true;
  data: {
    message: string;
  };
}

/**
 * Response for toggling product publish status
 * PUT /api/portal/vendors/[id]/products/[productId]/publish
 */
export interface TogglePublishResponse {
  success: true;
  data: Product;
}

/**
 * Generic API error response
 * Used across all API endpoints
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'SERVER_ERROR';
    message: string;
    fields?: Record<string, string>;
    details?: string;
  };
}
```

## Implementation Status
- [ ] Update Product interface
- [ ] Add API response types
- [ ] Verify TypeScript compilation
- [ ] Test with existing code
