import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getPayloadClient } from '@/lib/utils/get-payload-config';
import { validateToken } from '@/lib/auth';
import { safeValidateVendorUpdate } from '@/lib/validation/vendor-update-schema';
import { filterFieldsByTier, type VendorTier } from '@/lib/utils/tier-validator';
import { VendorProfileService } from '@/lib/services/VendorProfileService';


// Force dynamic rendering - disable Next.js route caching
// This ensures fresh database reads on every request
export const dynamic = 'force-dynamic';

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
 * GET /api/portal/vendors/[id]
 *
 * Fetch vendor profile data for dashboard editing
 *
 * Authorization:
 * - Vendor can only access their own profile
 * - Admin can access any vendor profile
 *
 * Query Parameters:
 * - byUserId=true: Look up vendor by user_id instead of vendor id
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<GetSuccessResponse | ErrorResponse>> {
  try {
    const resolvedParams = await context.params;
    const id = resolvedParams.id;
    const { searchParams } = new URL(request.url);
    const byUserId = searchParams.get('byUserId') === 'true';

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

    // Fetch vendor using VendorProfileService
    try {
      let vendor;

      if (byUserId) {
        // Look up vendor by user_id
        vendor = await VendorProfileService.getVendorByUserId(id);
      } else {
        // Look up vendor by vendor id (default behavior)
        vendor = await VendorProfileService.getVendorForEdit(
          id,
          user.id.toString(),
          isAdmin
        );
      }

      // Log successful fetch
      console.log('[VendorGet] Vendor profile fetched:', {
        id,
        byUserId,
        userId: user.id,
        vendorId: vendor.id,
        tier: vendor.tier,
        hasCompanyName: 'companyName' in vendor,
        hasName: 'name' in vendor,
        companyNameValue: vendor.companyName,
        nameValue: vendor.name,
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

    // DEBUG: Log received body for troubleshooting 400 errors
    console.log('[VendorUpdate] Received body:', JSON.stringify(body, null, 2));

    // Validate input
    const validationResult = safeValidateVendorUpdate(body);

    if (!validationResult.success) {
      // DEBUG: Log exact validation errors
      console.error('[VendorUpdate] Validation FAILED:', {
        receivedFields: Object.keys(body),
        errors: validationResult.error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message,
          code: e.code,
        })),
      });

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

      // Clear the PayloadCMS data service cache for this vendor
      const { payloadCMSDataService } = await import('@/lib/payload-cms-data-service');
      // Clear by both ID and slug to ensure all cache keys are invalidated
      payloadCMSDataService.clearVendorCache(vendorId.toString());
      if (updatedVendor.slug && typeof updatedVendor.slug === 'string') {
        payloadCMSDataService.clearVendorCache(updatedVendor.slug);
      }
      console.log('[VendorUpdate] Cleared data service cache for vendor:', vendorId, updatedVendor.slug);

      // Revalidate the vendor's public profile page (ISR on-demand)
      if (updatedVendor.slug) {
        try {
          revalidatePath(`/vendors/${updatedVendor.slug}`);
          revalidatePath('/vendors'); // Also revalidate the vendors listing page
          console.log('[VendorUpdate] Revalidated vendor pages:', `/vendors/${updatedVendor.slug}`, '/vendors');
        } catch (revalidateError) {
          console.error('[VendorUpdate] Failed to revalidate pages:', revalidateError);
          // Don't fail the request if revalidation fails
        }
      }

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

    // DEBUG: Log received body for troubleshooting 400 errors
    console.log('[VendorUpdate] Received body:', JSON.stringify(body, null, 2));

    // Validate input
    const validationResult = safeValidateVendorUpdate(body);

    if (!validationResult.success) {
      // DEBUG: Log exact validation errors
      console.error('[VendorUpdate] Validation FAILED:', {
        receivedFields: Object.keys(body),
        errors: validationResult.error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message,
          code: e.code,
        })),
      });

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
    const payload = await getPayloadClient();

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

    // Clear the PayloadCMS data service cache for this vendor
    const { payloadCMSDataService } = await import('@/lib/payload-cms-data-service');
    // Clear by both ID and slug to ensure all cache keys are invalidated
    payloadCMSDataService.clearVendorCache(vendorId);
    if (updatedVendor.slug && typeof updatedVendor.slug === 'string') {
      payloadCMSDataService.clearVendorCache(updatedVendor.slug);
    }
    console.log('[VendorUpdate] Cleared data service cache for vendor:', vendorId, updatedVendor.slug);

    // Revalidate the vendor's public profile page (ISR on-demand)
    if (updatedVendor.slug) {
      try {
        revalidatePath(`/vendors/${updatedVendor.slug}`);
        revalidatePath('/vendors'); // Also revalidate the vendors listing page
        console.log('[VendorUpdate] Revalidated vendor pages:', `/vendors/${updatedVendor.slug}`, '/vendors');
      } catch (revalidateError) {
        console.error('[VendorUpdate] Failed to revalidate pages:', revalidateError);
        // Don't fail the request if revalidation fails
      }
    }

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
