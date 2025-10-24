import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { getUserFromRequest } from '@/lib/middleware/auth-middleware';
import { safeValidateVendorUpdate } from '@/lib/validation/vendor-update-schema';
import { filterFieldsByTier, type VendorTier } from '@/lib/utils/tier-validator';
import { VendorProfileService } from '@/lib/services/VendorProfileService';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

interface GetSuccessResponse {
  success: true;
  data: Record<string, unknown>;
}

interface SuccessResponse {
  success: true;
  data: {
    vendor: Record<string, unknown>;
    message: string;
  };
}

interface ErrorResponse {
  success: false;
  error: {
    code: 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'SERVER_ERROR' | 'TIER_PERMISSION_DENIED';
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
 * GET /api/portal/vendors/[id]
 *
 * Fetch vendor profile data for dashboard editing
 *
 * Authorization:
 * - Vendor can only access their own profile
 * - Admin can access any vendor profile
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<GetSuccessResponse | ErrorResponse>> {
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

    // Fetch vendor using VendorProfileService
    try {
      const vendor = await VendorProfileService.getVendorForEdit(
        vendorId,
        user.id.toString(),
        isAdmin
      );

      // Log successful fetch
      console.log('[VendorGet] Vendor profile fetched:', {
        vendorId,
        userId: user.id,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          success: true,
          data: vendor,
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
              message: 'You can only access your own vendor profile',
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
    console.error('[VendorGet] Fetch failed:', {
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
          message: 'An error occurred while fetching vendor profile',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/portal/vendors/[id]
 *
 * Update vendor profile with tier validation
 *
 * Authorization:
 * - Vendor can only update their own profile
 * - Admin can update any vendor profile
 */
export async function PUT(
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

    // Parse request body
    const body = await request.json();

    // Validate input
    const validationResult = safeValidateVendorUpdate(body);

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((error) => {
        const field = error.path[0] as string;
        fieldErrors[field] = error.message;
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

    const updateData = validationResult.data;

    // Check if there are any fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No fields to update',
          },
        },
        { status: 400 }
      );
    }

    const isAdmin = user.role === 'admin';

    // Update vendor using VendorProfileService
    try {
      const updatedVendor = await VendorProfileService.updateVendorProfile(
        vendorId,
        updateData,
        {
          userId: user.id.toString(),
          isAdmin,
          validateTier: !isAdmin, // Skip tier validation for admins
        }
      );

      // Log successful update
      console.log('[VendorUpdate] Vendor profile updated:', {
        vendorId,
        userId: user.id,
        updatedFields: Object.keys(updateData),
        timestamp: new Date().toISOString(),
      });

      // Return updated vendor
      return NextResponse.json(
        {
          success: true,
          data: {
            vendor: updatedVendor,
            message: 'Vendor profile updated successfully',
          },
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
              message: 'You can only update your own vendor profile',
            },
          },
          { status: 403 }
        );
      }

      // Check for tier validation error
      if (errorMessage.includes('Tier validation failed')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'TIER_PERMISSION_DENIED',
              message: 'Tier restriction violated',
              details: errorMessage.replace('Tier validation failed: ', ''),
            },
          },
          { status: 403 }
        );
      }

      // Check for location limit error
      if (errorMessage.includes('Location limit') || errorMessage.includes('location limit')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: errorMessage,
            },
          },
          { status: 400 }
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
    console.error('[VendorUpdate] Update failed:', {
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
          message: 'An error occurred while updating vendor profile',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/vendors/{id}
 *
 * Update vendor profile with tier-based field restrictions
 *
 * Authorization:
 * - Vendor can only update their own profile
 * - Admin can update any vendor profile
 *
 * Tier Restrictions:
 * - Free: companyName, description, logo, contactEmail, contactPhone
 * - Tier1+: website, linkedinUrl, twitterUrl, certifications
 * - Tier2+: (future: products)
 */
export async function PATCH(
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

    // Parse request body
    const body = await request.json();

    // Validate input
    const validationResult = safeValidateVendorUpdate(body);

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.errors.forEach((error) => {
        const field = error.path[0] as string;
        fieldErrors[field] = error.message;
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

    const updateData = validationResult.data;

    // Check if there are any fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No fields to update',
          },
        },
        { status: 400 }
      );
    }

    // Get Payload instance
    const payload = await getPayload({ config });

    // Fetch vendor from database
    let vendor;
    try {
      vendor = await payload.findByID({
        collection: 'vendors',
        id: vendorId,
      });
    } catch (error) {
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

    const isAdmin = user.role === 'admin';

    // Check ownership (vendor can only update their own profile)
    if (!isAdmin) {
      const vendorUserId =
        typeof vendor.user === 'object' && vendor.user !== null
          ? vendor.user.id
          : vendor.user;

      if (vendorUserId?.toString() !== user.id.toString()) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'You can only update your own vendor profile',
            },
          },
          { status: 403 }
        );
      }
    }

    // Get vendor tier
    const vendorTier: VendorTier = vendor.tier || 'free';

    // Filter fields based on tier restrictions
    let filteredData: Record<string, unknown>;
    try {
      filteredData = filterFieldsByTier(updateData, vendorTier, isAdmin);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: error instanceof Error ? error.message : 'Tier restriction error',
          },
        },
        { status: 403 }
      );
    }

    // Update vendor record
    const updatedVendor = await payload.update({
      collection: 'vendors',
      id: vendorId,
      data: filteredData,
    });

    // Log successful update
    console.log('[VendorUpdate] Vendor profile updated:', {
      vendorId,
      userId: user.id,
      updatedFields: Object.keys(filteredData),
      timestamp: new Date().toISOString(),
    });

    // Return updated vendor
    return NextResponse.json(
      {
        success: true,
        data: {
          vendor: updatedVendor,
          message: 'Vendor profile updated successfully',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // Log error for monitoring
    console.error('[VendorUpdate] Update failed:', {
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
          message: 'An error occurred while updating vendor profile',
        },
      },
      { status: 500 }
    );
  }
}
