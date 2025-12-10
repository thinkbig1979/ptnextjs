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
