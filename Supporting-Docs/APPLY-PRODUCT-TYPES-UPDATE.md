# Product Types Update - Application Instructions

## Overview
This update adds TypeScript types for Product API responses and updates the Product interface to properly support Payload CMS field types.

## How to Apply

### Option 1: Run the Python Script (Recommended)
```bash
cd /home/edwin/development/ptnextjs
python3 update-product-types-final.py
```

The script will:
- Create a backup at `lib/types.ts.backup`
- Update the Product interface (lines 796-853)
- Add Product API response types
- Add generic ApiErrorResponse type

### Option 2: Manual Application
If the script fails, manually apply these changes to `/home/edwin/development/ptnextjs/lib/types.ts`:

#### Step 1: Backup
```bash
cp lib/types.ts lib/types.ts.backup
```

#### Step 2: Edit Product Interface (starting at line 796)

**Replace the existing Product interface (lines 796-853) with:**

```typescript
export interface Product {
  id: string;
  slug?: string;
  name: string;
  description: string | object; // Support both string and richText object from Payload
  shortDescription?: string; // Short description for listing pages
  price?: string;
  image?: string; // TinaCMS uses direct string paths
  published?: boolean; // Publication status (optional for backward compatibility, defaults to false in Payload)
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;

  // Payload CMS relations - support both ID references and populated objects
  vendor?: string | Vendor; // Vendor relationship - can be ID or populated object
  categories?: (string | Category)[]; // Category relationships - can be IDs or populated objects
  tags?: (string | Tag)[]; // Tag relationships - can be IDs or populated objects

  // TinaCMS simplified relations (for backward compatibility)
  vendorId?: string; // Resolved vendor ID
  vendorName?: string; // Resolved vendor name
  // Legacy fields for backward compatibility
  partnerId?: string; // Alias for vendorId
  partnerName?: string; // Alias for vendorName
  category?: string; // Resolved category name
  seo?: SEO;

  // Components (simplified structure)
  images?: ProductImage[]; // Product images array
  features?: Feature[]; // Product features array

  // New CMS-driven components
  specifications?: ProductSpecification[]; // Technical specifications
  benefits?: ProductBenefit[]; // Product benefits
  services?: ProductService[]; // Installation/support services
  pricing?: ProductPricing; // Pricing configuration
  actionButtons?: ProductActionButton[]; // Configurable action buttons (camelCase from Payload)
  action_buttons?: ProductActionButton[]; // Legacy snake_case for backward compatibility
  badges?: ProductBadge[]; // Product badges/certifications

  // Computed/backward compatibility fields
  categoryName?: string; // Alias for category
  tagNames?: string[]; // Alias for tags
  mainImage?: ProductImage; // Computed from images.find(img => img.isMain)
  imageUrl?: string; // Alias for image or mainImage.url

  // Product Comparison and Enhancement Fields
  comparisonMetrics?: {
    [category: string]: {
      [key: string]: string | number | boolean;
    };
  }; // Nested structure: category -> key -> value
  performanceMetrics?: PerformanceData[]; // Performance data for metrics display
  integrationCompatibility?: string[]; // Computed from integration_compatibility.supported_protocols
  systemRequirements?: SystemRequirements; // Computed from integration_compatibility.system_requirements
  compatibilityMatrix?: SystemCompatibility[]; // Computed from integration_compatibility.compatibility_matrix
  ownerReviews?: OwnerReview[]; // Computed from owner_reviews schema
  averageRating?: number; // Computed from owner reviews
  totalReviews?: number; // Computed from owner reviews count
  visualDemo?: VisualDemoContent; // Computed from visual_demo schema

  // Resolved vendor/partner objects (deprecated - use vendor field instead)
  partner?: Partner; // Legacy resolved partner object (alias for vendor)
}
```

#### Step 3: Add API Response Types (after Product interface, before BlogPost interface at line 855)

**Insert these interfaces between Product and BlogPost:**

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

## Verification

After applying the changes:

```bash
cd /home/edwin/development/ptnextjs

# Type check
npx tsc --noEmit

# Verify exports
node -e "const types = require('./lib/types'); console.log(Object.keys(types).filter(k => k.includes('Product')).sort())"
```

## Changes Summary

### Updated Product Interface Fields:
1. `description: string` → `description: string | object` (richText support)
2. Added `shortDescription?: string`
3. Added `published?: boolean`
4. `vendor?: Vendor` → `vendor?: string | Vendor` (Payload relationship)
5. Added `categories?: (string | Category)[]`
6. `tags?: string[]` → `tags?: (string | Tag)[]`
7. `images: ProductImage[]` → `images?: ProductImage[]` (optional)
8. `features: Feature[]` → `features?: Feature[]` (optional)
9. Added `actionButtons?: ProductActionButton[]` (camelCase)
10. Removed duplicate `vendor?: Vendor` declaration

### Added API Response Types:
- `GetProductsResponse` - List products
- `GetProductResponse` - Single product
- `CreateProductResponse` - Create product
- `UpdateProductResponse` - Update product
- `DeleteProductResponse` - Delete product
- `TogglePublishResponse` - Publish/unpublish
- `ApiErrorResponse` - Generic error response

## Rollback

If you need to rollback:
```bash
cp lib/types.ts.backup lib/types.ts
```

## Files Modified
- `/home/edwin/development/ptnextjs/lib/types.ts` - Updated with Product types
- `/home/edwin/development/ptnextjs/lib/types.ts.backup` - Original backup

## Task Completion
This update completes task `ptnextjs-him` - [FE-7] Add TypeScript types for Product API responses.
