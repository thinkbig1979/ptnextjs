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

type ErrorCode = 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'SERVER_ERROR' | 'TIER_RESTRICTED';

interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    fields?: Record<string, string>;
    details?: string;
    upgradePath?: string;
  };
}

function errorResponse(
  code: ErrorCode,
  message: string,
  status: number,
  extra?: { fields?: Record<string, string>; upgradePath?: string }
): NextResponse<ErrorResponse> {
  return NextResponse.json(
    { success: false, error: { code, message, ...extra } },
    { status }
  );
}

function handleServiceError(error: unknown, action: string): NextResponse<ErrorResponse> {
  const msg = error instanceof Error ? error.message : 'Unknown error';

  if (msg.includes('Unauthorized')) {
    return errorResponse('FORBIDDEN', `You can only ${action} your own products`, 403);
  }
  if (msg.includes('not found')) {
    return errorResponse('NOT_FOUND', 'Product not found', 404);
  }

  throw error;
}

function logAndReturnServerError(label: string, error: unknown, action: string): NextResponse<ErrorResponse> {
  console.error(`[${label}] ${action} failed:`, {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  });
  return errorResponse('SERVER_ERROR', `An error occurred while ${action.toLowerCase()}`, 500);
}

/**
 * GET /api/portal/vendors/[id]/products/[productId]
 * Fetch single product by ID
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    const { id: vendorId, productId } = await context.params;
    const auth = await validateToken(request);

    if (!auth.success) {
      return errorResponse('UNAUTHORIZED', auth.error, auth.status);
    }

    try {
      const product = await ProductService.getProductById(
        productId,
        auth.user.id.toString(),
        auth.user.role === 'admin'
      );
      return NextResponse.json({ success: true, data: product }, { status: 200 });
    } catch (error) {
      return handleServiceError(error, 'access');
    }
  } catch (error) {
    return logAndReturnServerError('ProductGet', error, 'fetching product');
  }
}

/**
 * PUT /api/portal/vendors/[id]/products/[productId]
 * Update existing product
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    const { id: vendorId, productId } = await context.params;
    const auth = await validateToken(request);

    if (!auth.success) {
      return errorResponse('UNAUTHORIZED', auth.error, auth.status);
    }

    const user = auth.user;
    const isAdmin = user.role === 'admin';

    let vendorTier: Tier = 'free';
    if (!isAdmin) {
      const vendor = await getVendorWithTier(vendorId);
      vendorTier = (vendor?.tier as Tier) || 'free';

      if (!TierValidationService.canAccessFeature(vendorTier, 'productManagement')) {
        return errorResponse(
          'TIER_RESTRICTED',
          'Product management requires Tier 2 or higher',
          403,
          { upgradePath: TierService.getUpgradePath('productManagement') }
        );
      }
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return errorResponse('VALIDATION_ERROR', 'Invalid JSON in request body', 400);
    }

    if (!isAdmin) {
      body = sanitizeForTier(body, vendorTier);
    }

    const validation = UpdateProductSchema.safeParse(body);
    if (!validation.success) {
      const fields: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        fields[err.path.join('.')] = err.message;
      });
      return errorResponse('VALIDATION_ERROR', 'Validation failed', 400, { fields });
    }

    try {
      const updatedProduct = await ProductService.updateProduct(
        productId,
        validation.data,
        user.id.toString(),
        isAdmin
      );
      return NextResponse.json(
        { success: true, data: updatedProduct, message: 'Product updated successfully' },
        { status: 200 }
      );
    } catch (error) {
      return handleServiceError(error, 'update');
    }
  } catch (error) {
    return logAndReturnServerError('ProductUpdate', error, 'updating product');
  }
}

/**
 * DELETE /api/portal/vendors/[id]/products/[productId]
 * Delete product
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    const { id: vendorId, productId } = await context.params;
    const auth = await validateToken(request);

    if (!auth.success) {
      return errorResponse('UNAUTHORIZED', auth.error, auth.status);
    }

    try {
      await ProductService.deleteProduct(
        productId,
        auth.user.id.toString(),
        auth.user.role === 'admin'
      );
      return NextResponse.json(
        { success: true, data: { id: productId }, message: 'Product deleted successfully' },
        { status: 200 }
      );
    } catch (error) {
      return handleServiceError(error, 'delete');
    }
  } catch (error) {
    return logAndReturnServerError('ProductDelete', error, 'deleting product');
  }
}
