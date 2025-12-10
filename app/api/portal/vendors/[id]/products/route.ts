import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/middleware/auth-middleware';
import { ProductService } from '@/lib/services/ProductService';
import { CreateProductSchema } from '@/lib/validation/product-schema';
import type { ProductFilters } from '@/lib/services/ProductService';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

interface SuccessResponse {
  success: true;
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}

interface ErrorResponse {
  success: false;
  error: {
    code: 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'SERVER_ERROR';
    message: string;
    fields?: Record<string, string>;
    details?: string;
  };
}

/**
 * Helper function to authenticate user from request
 */
async function authenticateUser(request: NextRequest) {
  let user = getUserFromRequest(request);

  // If user not in headers (middleware not applied), extract from token manually
  if (!user) {
    const { authService } = await import('@/lib/services/auth-service');
    const token =
      request.headers.get('authorization')?.replace('Bearer ', '') ||
      request.cookies.get('access_token')?.value;

    if (!token) {
      return null;
    }

    try {
      user = authService.validateToken(token);
    } catch (error) {
      return null;
    }
  }

  return user;
}

/**
 * GET /api/portal/vendors/[id]/products
 *
 * List vendor products with optional filters
 *
 * Authorization:
 * - Vendor can only access their own products
 * - Admin can access any vendor's products
 *
 * Query Parameters:
 * - published: boolean - Filter by published status (optional)
 * - category: string - Filter by category ID (optional)
 * - search: string - Search in name and description (optional)
 * - limit: number - Limit results (optional, default 100)
 * - page: number - Page number for pagination (optional, default 1)
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    const resolvedParams = await context.params;
    const vendorId = resolvedParams.id;
    const { searchParams } = new URL(request.url);

    // Authenticate user
    const user = await authenticateUser(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    const isAdmin = user.role === 'admin';

    // Parse query parameters
    const filters: ProductFilters = {};

    // Published filter
    const publishedParam = searchParams.get('published');
    if (publishedParam !== null) {
      filters.published = publishedParam === 'true';
    }

    // Category filter
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      filters.category = categoryParam;
    }

    // Search filter
    const searchParam = searchParams.get('search');
    if (searchParam) {
      filters.search = searchParam;
    }

    // Note: limit and page parameters can be added in the future
    // For now, ProductService returns up to 100 products sorted by creation date

    // Fetch products using ProductService
    try {
      const products = await ProductService.getVendorProducts(
        vendorId,
        user.id.toString(),
        isAdmin,
        filters
      );

      // Log successful fetch
      console.log('[ProductsList] Products fetched:', {
        vendorId,
        userId: user.id,
        isAdmin,
        filters,
        count: products.length,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          success: true,
          data: products,
        },
        { status: 200 }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Check for authorization error
      if (errorMessage.includes('Unauthorized')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'You can only access your own vendor products',
            },
          },
          { status: 403 }
        );
      }

      // Check for not found error
      if (errorMessage.includes('not found')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Vendor not found',
            },
          },
          { status: 404 }
        );
      }

      throw error; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    // Log error for monitoring
    console.error('[ProductsList] Fetch failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // Return generic error response
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while fetching products',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/portal/vendors/[id]/products
 *
 * Create new product for vendor
 *
 * Authorization:
 * - Vendor can only create products for their own vendor
 * - Admin can create products for any vendor
 *
 * Request Body:
 * - name: string (required) - Product name
 * - description: string (required) - Product description
 * - slug: string (optional) - URL slug (auto-generated if not provided)
 * - shortDescription: string (optional) - Short description
 * - images: array (optional) - Product images
 * - categories: array (optional) - Category IDs
 * - specifications: array (optional) - Product specifications
 * - features: array (optional) - Product features
 * - tags: array (optional) - Product tags
 * - price: string (optional) - Price display text
 * - pricing: object (optional) - Pricing details
 * - published: boolean (optional) - Published status (default: false)
 */
export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    const resolvedParams = await context.params;
    const vendorId = resolvedParams.id;

    // Authenticate user
    const user = await authenticateUser(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      );
    }

    const isAdmin = user.role === 'admin';

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid JSON in request body',
          },
        },
        { status: 400 }
      );
    }

    // Add vendor ID to body (from URL parameter)
    body.vendor = vendorId;

    // Validate request body with CreateProductSchema
    const validation = CreateProductSchema.safeParse(body);

    if (!validation.success) {
      // Format validation errors
      const fields: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        const path = err.path.join('.');
        fields[path] = err.message;
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            fields,
          },
        },
        { status: 400 }
      );
    }

    // Create product using ProductService
    try {
      const product = await ProductService.createProduct(
        vendorId,
        validation.data,
        user.id.toString(),
        isAdmin
      );

      // Log successful creation
      console.log('[ProductCreate] Product created:', {
        productId: product.id,
        vendorId,
        userId: user.id,
        isAdmin,
        name: validation.data.name,
        published: validation.data.published,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          success: true,
          data: product,
        },
        { status: 201 }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Check for authorization error
      if (errorMessage.includes('Unauthorized')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'You can only create products for your own vendor',
            },
          },
          { status: 403 }
        );
      }

      // Check for not found error
      if (errorMessage.includes('not found')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Vendor not found',
            },
          },
          { status: 404 }
        );
      }

      // Check for duplicate slug error
      if (errorMessage.includes('duplicate') || errorMessage.includes('unique')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Product with this slug already exists',
              fields: {
                slug: 'This slug is already in use',
              },
            },
          },
          { status: 400 }
        );
      }

      throw error; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    // Log error for monitoring
    console.error('[ProductCreate] Creation failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // Return generic error response
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An error occurred while creating product',
        },
      },
      { status: 500 }
    );
  }
}
