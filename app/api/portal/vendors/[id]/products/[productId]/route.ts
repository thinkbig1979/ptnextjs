import { NextRequest, NextResponse } from 'next/server';
import { validateToken } from '@/lib/auth';
import { ProductService } from '@/lib/services/ProductService';
import { UpdateProductSchema } from '@/lib/validation/product-schema';
import { TierValidationService } from '@/lib/services/TierValidationService';
import { TierService, type Tier } from '@/lib/services/TierService';
import { getVendorWithTier, sanitizeForTier } from '@/lib/utils/product-tier';

interface RouteContext {
  params: Promise<{
    id: string;
    productId: string;
  }>;
}

interface SuccessResponse {
  success: true;
  data: Record<string, unknown>;
  message?: string;
}

interface ErrorResponse {
  success: false;
  error: {
    code: 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'SERVER_ERROR' | 'TIER_RESTRICTED';
    message: string;
    fields?: Record<string, string>;
    details?: string;
    upgradePath?: string;
  };
}

/**
 * GET /api/portal/vendors/[id]/products/[productId]
 *
 * Fetch single product by ID
 *
 * Authorization:
 * - Vendor can only access their own products
 * - Admin can access any product
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    const resolvedParams = await context.params;
    const { id: vendorId, productId } = resolvedParams;

    // Authenticate user
    const auth = await validateToken(request);

    if (!auth.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: auth.error,
          },
        },
        { status: auth.status }
      );
    }

    const user = auth.user;
    const isAdmin = user.role === 'admin';

    // Fetch product using ProductService
    try {
      const product = await ProductService.getProductById(
        productId,
        user.id.toString(),
        isAdmin
      );

      console.log('[ProductGet] Product fetched:', {
        vendorId,
        productId,
        userId: user.id,
        productName: product.name,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          success: true,
          data: product,
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
              message: 'You can only access your own products',
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
              message: 'Product not found',
            },
          },
          { status: 404 }
        );
      }

      throw error; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    // Log error for monitoring
    console.error('[ProductGet] Fetch failed:', {
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
          message: 'An error occurred while fetching product',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/portal/vendors/[id]/products/[productId]
 *
 * Update existing product
 *
 * Authorization:
 * - Vendor can only update their own products
 * - Admin can update any product
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    const resolvedParams = await context.params;
    const { id: vendorId, productId } = resolvedParams;

    // Authenticate user
    const auth = await validateToken(request);

    if (!auth.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: auth.error,
          },
        },
        { status: auth.status }
      );
    }

    const user = auth.user;
    const isAdmin = user.role === 'admin';

    // Tier validation - product management requires tier2+
    // Store vendor for later sanitization (skip for admins)
    let vendorTier: Tier = 'free';
    if (!isAdmin) {
      const vendor = await getVendorWithTier(vendorId);
      vendorTier = (vendor?.tier as Tier) || 'free';

      if (!TierValidationService.canAccessFeature(vendorTier, 'productManagement')) {
        console.log('[TierValidation] Product update blocked:', {
          vendorId,
          productId,
          tier: vendorTier,
          feature: 'productManagement',
          timestamp: new Date().toISOString(),
        });

        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'TIER_RESTRICTED',
              message: 'Product management requires Tier 2 or higher',
              upgradePath: TierService.getUpgradePath('productManagement'),
            },
          },
          { status: 403 }
        );
      }
    }

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

    // Sanitize tier-restricted fields for non-admins (defense in depth)
    if (!isAdmin) {
      body = sanitizeForTier(body, vendorTier);
    }

    // Validate body with UpdateProductSchema
    const validation = UpdateProductSchema.safeParse(body);

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        const path = err.path.join('.');
        fieldErrors[path] = err.message;
      });

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            fields: fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    // Update product using ProductService
    try {
      const updatedProduct = await ProductService.updateProduct(
        productId,
        validation.data,
        user.id.toString(),
        isAdmin
      );

      console.log('[ProductUpdate] Product updated:', {
        vendorId,
        productId,
        userId: user.id,
        productName: updatedProduct.name,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          success: true,
          data: updatedProduct,
          message: 'Product updated successfully',
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
              message: 'You can only update your own products',
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
              message: 'Product not found',
            },
          },
          { status: 404 }
        );
      }

      throw error; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    // Log error for monitoring
    console.error('[ProductUpdate] Update failed:', {
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
          message: 'An error occurred while updating product',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/portal/vendors/[id]/products/[productId]
 *
 * Delete product
 *
 * Authorization:
 * - Vendor can only delete their own products
 * - Admin can delete any product
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    const resolvedParams = await context.params;
    const { id: vendorId, productId } = resolvedParams;

    // Authenticate user
    const auth = await validateToken(request);

    if (!auth.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: auth.error,
          },
        },
        { status: auth.status }
      );
    }

    const user = auth.user;
    const isAdmin = user.role === 'admin';

    // Delete product using ProductService
    try {
      await ProductService.deleteProduct(
        productId,
        user.id.toString(),
        isAdmin
      );

      console.log('[ProductDelete] Product deleted:', {
        vendorId,
        productId,
        userId: user.id,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          success: true,
          data: { id: productId },
          message: 'Product deleted successfully',
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
              message: 'You can only delete your own products',
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
              message: 'Product not found',
            },
          },
          { status: 404 }
        );
      }

      throw error; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    // Log error for monitoring
    console.error('[ProductDelete] Delete failed:', {
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
          message: 'An error occurred while deleting product',
        },
      },
      { status: 500 }
    );
  }
}
