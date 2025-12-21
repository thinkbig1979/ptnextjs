import { NextRequest, NextResponse } from 'next/server';
import { validateToken } from '@/lib/auth';
import { ProductService } from '@/lib/services/ProductService';
import { TogglePublishSchema } from '@/lib/validation/product-schema';

/**
 * Route Context Type
 */
interface RouteContext {
  params: Promise<{
    id: string;
    productId: string;
  }>;
}

/**
 * Success Response Type
 */
interface SuccessResponse {
  success: true;
  data: {
    product: Record<string, unknown>;
    message: string;
  };
}

/**
 * Error Response Type
 */
interface ErrorResponse {
  success: false;
  error: {
    code: 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'SERVER_ERROR';
    message: string;
    fields?: Record<string, string>;
  };
}

/**
 * PATCH /api/portal/vendors/[id]/products/[productId]/publish
 *
 * Toggle product publish status (publish/unpublish)
 *
 * Authorization:
 * - Vendor can only toggle their own products
 * - Admin can toggle any product
 *
 * Request body:
 * - published: boolean - New publish status
 *
 * Returns:
 * - 200: Product publish status updated successfully
 * - 400: Validation error
 * - 401: Not authenticated
 * - 403: Not authorized to modify this product
 * - 404: Product not found
 * - 500: Server error
 */
export async function PATCH(
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

    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = TogglePublishSchema.safeParse(body);

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
            message: 'Invalid input data',
            fields: fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { published } = validation.data;

    // Toggle product publish status using ProductService
    // This will verify ownership and throw appropriate errors
    const product = await ProductService.togglePublish(
      productId,
      published,
      user.id,
      user.role === 'admin'
    );

    const message = published
      ? 'Product published successfully'
      : 'Product unpublished successfully';

    return NextResponse.json(
      {
        success: true,
        data: {
          product,
          message,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('[ProductPublish] Error toggling publish status:', error);

    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('not found')) {
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

      if (error.message.includes('not authorized') || error.message.includes('permission')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'You do not have permission to modify this product',
            },
          },
          { status: 403 }
        );
      }
    }

    // Generic server error
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}
