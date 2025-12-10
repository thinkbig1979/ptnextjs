# ProductService Usage Examples

## Import

```typescript
import { ProductService } from '@/lib/services/ProductService';
import type { CreateProductData, UpdateProductData, ProductFilters } from '@/lib/services/ProductService';
```

## Example 1: List Vendor Products (All)

```typescript
// In API route handler (e.g., app/api/portal/products/route.ts)
import { ProductService } from '@/lib/services/ProductService';

export async function GET(request: Request) {
  // Extract from session/auth
  const userId = 'user-123';
  const vendorId = 'vendor-456';
  const isAdmin = false;

  try {
    const products = await ProductService.getVendorProducts(
      vendorId,
      userId,
      isAdmin
    );

    return Response.json({ products });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: error.message.includes('Unauthorized') ? 403 : 404 }
    );
  }
}
```

## Example 2: List Published Products Only

```typescript
const filters: ProductFilters = {
  published: true
};

const publishedProducts = await ProductService.getVendorProducts(
  vendorId,
  userId,
  isAdmin,
  filters
);
```

## Example 3: Search Products

```typescript
const filters: ProductFilters = {
  search: 'navigation',
  published: true
};

const searchResults = await ProductService.getVendorProducts(
  vendorId,
  userId,
  isAdmin,
  filters
);
```

## Example 4: Get Single Product

```typescript
const productId = 'product-789';

const product = await ProductService.getProductById(
  productId,
  userId,
  isAdmin
);
```

## Example 5: Create Basic Product

```typescript
const productData: CreateProductData = {
  name: 'Advanced Marine Radar',
  description: 'High-performance radar system for superyachts',
  shortDescription: '50nm range, HD display, collision avoidance',
  published: false
};

const newProduct = await ProductService.createProduct(
  vendorId,
  productData,
  userId,
  isAdmin
);

console.log('Created product:', newProduct.id);
```

## Example 6: Create Product with Rich Features

```typescript
const productData: CreateProductData = {
  name: 'Premium Navigation System',
  slug: 'premium-navigation-system', // Optional, auto-generated if omitted
  description: 'State-of-the-art navigation system with AI-powered route optimization',
  shortDescription: 'AI-powered navigation with real-time weather integration',

  // Images
  images: [
    {
      url: 'https://cdn.example.com/product-main.jpg',
      altText: 'Premium Navigation System - Main View',
      isMain: true,
      caption: 'Main console display'
    },
    {
      url: 'https://cdn.example.com/product-detail.jpg',
      altText: 'Detail view of interface',
      isMain: false,
      caption: 'User interface close-up'
    }
  ],

  // Categories (relationship IDs)
  categories: ['cat-navigation', 'cat-electronics'],

  // Tags (relationship IDs)
  tags: ['tag-ai', 'tag-premium', 'tag-weatherproof'],

  // Specifications
  specifications: [
    { label: 'Display Size', value: '24 inches' },
    { label: 'Resolution', value: '4K Ultra HD' },
    { label: 'Range', value: '100 nautical miles' }
  ],

  // Pricing
  price: '$45,000',
  pricing: {
    displayText: 'From $45,000',
    subtitle: 'Professional installation included',
    showContactForm: true,
    currency: 'USD'
  },

  // Features
  features: [
    {
      title: 'AI Route Optimization',
      description: 'Machine learning algorithms optimize routes based on weather, fuel efficiency, and time',
      icon: 'Brain',
      order: 1
    },
    {
      title: 'Real-time Weather',
      description: 'Live weather data integration with storm tracking',
      icon: 'Cloud',
      order: 2
    }
  ],

  // Benefits
  benefits: [
    {
      benefit: 'Reduce fuel costs by up to 20%',
      icon: 'DollarSign',
      order: 1
    },
    {
      benefit: 'Enhanced safety with collision avoidance',
      icon: 'Shield',
      order: 2
    }
  ],

  // Services
  services: [
    {
      title: 'Professional Installation',
      description: 'Certified technicians install and configure the system on your vessel',
      icon: 'Wrench',
      order: 1
    },
    {
      title: '24/7 Technical Support',
      description: 'Round-the-clock support via phone, email, and remote assistance',
      icon: 'HeadphonesIcon',
      order: 2
    }
  ],

  // Call-to-Action Buttons
  actionButtons: [
    {
      label: 'Request Quote',
      type: 'primary',
      action: 'quote',
      icon: 'FileText',
      order: 1
    },
    {
      label: 'Download Brochure',
      type: 'secondary',
      action: 'download',
      actionData: 'https://cdn.example.com/brochure.pdf',
      icon: 'Download',
      order: 2
    }
  ],

  // Quality Badges
  badges: [
    {
      label: 'ISO 9001 Certified',
      type: 'success',
      icon: 'Award',
      order: 1
    },
    {
      label: 'Marine Grade',
      type: 'info',
      icon: 'Anchor',
      order: 2
    }
  ],

  // Comparison Metrics
  comparisonMetrics: [
    {
      metricName: 'Range',
      value: '100 nautical miles',
      numericValue: 100,
      unit: 'nm',
      category: 'performance',
      compareHigherBetter: true,
      industryAverage: '75 nm'
    },
    {
      metricName: 'Response Time',
      value: '50 milliseconds',
      numericValue: 50,
      unit: 'ms',
      category: 'performance',
      compareHigherBetter: false,
      industryAverage: '100 ms'
    }
  ],

  published: false // Start as draft
};

const richProduct = await ProductService.createProduct(
  vendorId,
  productData,
  userId,
  isAdmin
);
```

## Example 7: Update Product (Partial)

```typescript
// Update only specific fields
const updateData: UpdateProductData = {
  shortDescription: 'Updated product description',
  price: '$49,999',
  published: true // Publish the product
};

const updatedProduct = await ProductService.updateProduct(
  productId,
  updateData,
  userId,
  isAdmin
);
```

## Example 8: Update Product Description (String to Lexical)

```typescript
// Service automatically converts plain text to Lexical JSON
const updateData: UpdateProductData = {
  description: 'This is a new plain text description that will be converted to Lexical format'
};

const updatedProduct = await ProductService.updateProduct(
  productId,
  updateData,
  userId,
  isAdmin
);
```

## Example 9: Toggle Publish Status

```typescript
// Publish a product
const publishedProduct = await ProductService.togglePublish(
  productId,
  true, // published = true
  userId,
  isAdmin
);

// Unpublish a product
const draftProduct = await ProductService.togglePublish(
  productId,
  false, // published = false
  userId,
  isAdmin
);
```

## Example 10: Delete Product

```typescript
await ProductService.deleteProduct(
  productId,
  userId,
  isAdmin
);

console.log('Product deleted successfully');
```

## Example 11: Admin Access (Bypass Ownership)

```typescript
// Admin can access any vendor's products
const isAdmin = true;
const anyVendorId = 'vendor-999';

const products = await ProductService.getVendorProducts(
  anyVendorId,
  userId,
  isAdmin // Admin override
);
```

## Error Handling Patterns

```typescript
try {
  const product = await ProductService.getProductById(
    productId,
    userId,
    isAdmin
  );

  return Response.json({ product });
} catch (error) {
  if (error.message === 'Product not found') {
    return Response.json({ error: error.message }, { status: 404 });
  }

  if (error.message.includes('Unauthorized')) {
    return Response.json({ error: error.message }, { status: 403 });
  }

  // Other errors
  return Response.json({ error: 'Internal server error' }, { status: 500 });
}
```

## Integration with Next.js API Routes

### GET /api/portal/vendors/[id]/products

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/ProductService';
import { getServerSession } from 'next-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const vendorId = params.id;
  const userId = session.user.id;
  const isAdmin = session.user.role === 'admin';

  // Get query params
  const { searchParams } = new URL(request.url);
  const published = searchParams.get('published');
  const search = searchParams.get('search');

  const filters: ProductFilters = {};
  if (published !== null) {
    filters.published = published === 'true';
  }
  if (search) {
    filters.search = search;
  }

  try {
    const products = await ProductService.getVendorProducts(
      vendorId,
      userId,
      isAdmin,
      filters
    );

    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}
```

### POST /api/portal/vendors/[id]/products

```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const vendorId = params.id;
  const userId = session.user.id;
  const isAdmin = session.user.role === 'admin';

  const body = await request.json();

  try {
    const product = await ProductService.createProduct(
      vendorId,
      body,
      userId,
      isAdmin
    );

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    const status = error.message.includes('Unauthorized') ? 403 :
                   error.message.includes('not found') ? 404 : 500;

    return NextResponse.json({ error: error.message }, { status });
  }
}
```

## Notes

- All methods are static, no need to instantiate the class
- Ownership is automatically verified for non-admin users
- Plain text descriptions are automatically converted to Lexical JSON
- Slug is auto-generated from name if not provided
- All array/object fields are optional and can be added/updated later
- The service handles Payload CMS relationships automatically
