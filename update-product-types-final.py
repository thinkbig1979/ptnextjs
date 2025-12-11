#!/usr/bin/env python3
"""
Single-file script to update Product interface and add API response types to lib/types.ts
No dependencies, no temp files, just reads, modifies, and writes.
"""

import os
import shutil

# File paths
TYPES_FILE = '/home/edwin/development/ptnextjs/lib/types.ts'
BACKUP_FILE = '/home/edwin/development/ptnextjs/lib/types.ts.backup'

# Updated Product interface + API response types
UPDATED_PRODUCT_SECTION = '''export interface Product {
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
'''

def main():
    print("Product Types Update Script")
    print("=" * 60)

    # Read original file
    print(f"Reading {TYPES_FILE}...")
    with open(TYPES_FILE, 'r') as f:
        lines = f.readlines()

    print(f"Original file: {len(lines)} lines")

    # Create backup
    print(f"Creating backup...")
    shutil.copy2(TYPES_FILE, BACKUP_FILE)
    print(f"✓ Backup created: {BACKUP_FILE}")

    # Split file:
    # - Part 1: Lines 1-795 (before Product interface)
    # - Part 2: Updated Product interface + API responses (replaces lines 796-853)
    # - Part 3: Lines 855+ (BlogPost and after)

    part1 = lines[:795]  # Lines 0-794 (display as 1-795)
    part3 = lines[854:]  # Lines 854+ (display as 855+)

    print(f"Part 1 (before Product): {len(part1)} lines")
    print(f"Part 2 (updated section): replacing lines 796-854")
    print(f"Part 3 (after Product): {len(part3)} lines")

    # Assemble new content
    new_content = ''.join(part1) + UPDATED_PRODUCT_SECTION + '\n\n' + ''.join(part3)

    # Write updated file
    print(f"Writing updated file...")
    with open(TYPES_FILE, 'w') as f:
        f.write(new_content)

    # Verify
    with open(TYPES_FILE, 'r') as f:
        new_lines = f.readlines()

    print(f"✓ Updated file: {len(new_lines)} lines")
    print(f"✓ Line count change: {len(new_lines) - len(lines):+d}")

    print("\n" + "=" * 60)
    print("UPDATE COMPLETE")
    print("=" * 60)
    print("\nChanges Made:")
    print("  ✓ Product.description: string → string | object")
    print("  ✓ Added Product.shortDescription?: string")
    print("  ✓ Added Product.published?: boolean")
    print("  ✓ Product.vendor: Vendor → string | Vendor")
    print("  ✓ Added Product.categories?: (string | Category)[]")
    print("  ✓ Product.tags: string[] → (string | Tag)[]")
    print("  ✓ Product.images: required → optional")
    print("  ✓ Product.features: required → optional")
    print("  ✓ Added Product.actionButtons?: ProductActionButton[]")
    print("\nAdded 7 API Response Interfaces:")
    print("  ✓ GetProductsResponse")
    print("  ✓ GetProductResponse")
    print("  ✓ CreateProductResponse")
    print("  ✓ UpdateProductResponse")
    print("  ✓ DeleteProductResponse")
    print("  ✓ TogglePublishResponse")
    print("  ✓ ApiErrorResponse")
    print(f"\nBackup: {BACKUP_FILE}")
    print(f"Updated: {TYPES_FILE}")

if __name__ == '__main__':
    main()
