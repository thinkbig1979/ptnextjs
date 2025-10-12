import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { getUserFromRequest } from '@/lib/middleware/auth-middleware';
import { safeValidateVendorUpdate } from '@/lib/validation/vendor-update-schema';
import { filterFieldsByTier, type VendorTier } from '@/lib/utils/tier-validator';

interface RouteContext {
  params: {
    id: string;
  };
}

interface SuccessResponse {
  success: true;
  data: {
    vendor: any;
    message: string;
  };
}

interface ErrorResponse {
  success: false;
  error: {
    code: 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'SERVER_ERROR';
    message: string;
    fields?: Record<string, string>;
  };
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
    const vendorId = context.params.id;

    // Extract user from request (set by auth middleware or extracted from token)
    // Note: In a production setup, this route would be protected by auth middleware
    // For now, we'll extract the user manually
    let user = getUserFromRequest(request);

    // If user not in headers (middleware not applied), extract from token manually
    if (!user) {
      const { authService } = await import('@/lib/services/auth-service');
      const token =
        request.headers.get('authorization')?.replace('Bearer ', '') ||
        request.cookies.get('access_token')?.value;

      if (!token) {
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

      try {
        user = authService.validateToken(token);
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Invalid or expired token',
            },
          },
          { status: 401 }
        );
      }
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
    let filteredData: Record<string, any>;
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
