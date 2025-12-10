# Task: Create ProductService Business Logic

## Metadata
- **ID**: task-be-1
- **Phase**: 2 - Backend Implementation
- **Agent**: backend-nodejs-specialist
- **Time**: 30-40 min
- **Dependencies**: none
- **Status**: pending

## Description

Create the ProductService class that encapsulates all business logic for product CRUD operations. This service will be used by API routes and follows the existing pattern from `VendorProfileService.ts`.

## Specifics

### File to Create
`lib/services/ProductService.ts`

### Required Methods

```typescript
class ProductService {
  // List all products for a vendor
  static async getVendorProducts(
    vendorId: string,
    userId: string,
    isAdmin: boolean,
    filters?: { published?: boolean; limit?: number; page?: number }
  ): Promise<{ products: Product[]; total: number; page: number; limit: number }>;

  // Get single product by ID
  static async getProductById(
    productId: string,
    userId: string,
    isAdmin: boolean
  ): Promise<Product>;

  // Create new product
  static async createProduct(
    vendorId: string,
    data: CreateProductInput,
    userId: string,
    isAdmin: boolean
  ): Promise<Product>;

  // Update existing product
  static async updateProduct(
    productId: string,
    data: UpdateProductInput,
    userId: string,
    isAdmin: boolean
  ): Promise<Product>;

  // Delete product
  static async deleteProduct(
    productId: string,
    userId: string,
    isAdmin: boolean
  ): Promise<void>;

  // Toggle publish status
  static async togglePublish(
    productId: string,
    published: boolean,
    userId: string,
    isAdmin: boolean
  ): Promise<Product>;

  // Private: Verify ownership
  private static async verifyOwnership(
    productId: string,
    userId: string,
    isAdmin: boolean
  ): Promise<Product>;

  // Private: Convert plain text to Lexical JSON
  private static textToLexical(text: string): LexicalJSON;
}
```

### Pattern Reference
Follow patterns from: `lib/services/VendorProfileService.ts`
- Static methods for all operations
- Authorization checks before database access
- Use Payload CMS `getPayload()` for database operations
- Error handling with specific error types

### Technical Requirements

1. **Payload CMS Integration**:
   ```typescript
   import { getPayload } from 'payload';
   import config from '@payload-config';

   const payload = await getPayload({ config });
   ```

2. **Ownership Verification**:
   - Fetch product with `depth: 1` to include vendor relation
   - Check if `product.vendor.user === userId` OR `isAdmin === true`
   - Throw `ForbiddenError` if not authorized

3. **Lexical Conversion**:
   - Description field requires Lexical JSON format
   - Provide helper to convert plain text to basic Lexical structure

4. **Slug Generation**:
   - If slug not provided, auto-generate from name
   - Use slugify: `name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')`

## Acceptance Criteria

- [ ] ProductService class created with all required methods
- [ ] All methods have TypeScript types
- [ ] Ownership verification works for all mutation methods
- [ ] Admin bypass works correctly
- [ ] Lexical conversion utility created
- [ ] Error handling with specific error types
- [ ] No TypeScript errors

## Implementation Notes

### Payload Query Examples

```typescript
// List products for vendor
const result = await payload.find({
  collection: 'products',
  where: {
    vendor: { equals: vendorId },
    ...(filters?.published !== undefined && { published: { equals: filters.published } }),
  },
  limit: filters?.limit || 20,
  page: filters?.page || 1,
  depth: 1,
});

// Create product
const product = await payload.create({
  collection: 'products',
  data: {
    vendor: vendorId,
    name: data.name,
    description: this.textToLexical(data.description),
    shortDescription: data.shortDescription,
    categories: data.categories,
    images: data.images,
    specifications: data.specifications,
    published: data.published || false,
  },
});

// Update product
const updated = await payload.update({
  collection: 'products',
  id: productId,
  data: updateData,
});

// Delete product
await payload.delete({
  collection: 'products',
  id: productId,
});
```

### Lexical JSON Structure

```typescript
function textToLexical(text: string): object {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text, version: 1 }],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  };
}
```

## Related Files

- `lib/services/VendorProfileService.ts` - Pattern reference
- `payload/collections/Products.ts` - Collection schema
- `lib/types.ts` - Type definitions
