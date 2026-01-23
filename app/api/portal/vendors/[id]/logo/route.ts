import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/lib/utils/get-payload-config';
import { validateToken, verifyVendorOwnership } from '@/lib/auth';

// Force dynamic rendering - disable Next.js route caching
export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

interface SuccessResponse {
  success: true;
  data: {
    logoUrl: string;
    message?: string;
  };
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
 * POST /api/portal/vendors/[id]/logo
 *
 * Upload a logo for the vendor
 *
 * Authorization:
 * - Vendor can only upload to their own profile
 * - Admin can upload to any vendor profile
 */
export async function POST(
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
    const isAdmin = user.role === 'admin';

    // Verify vendor ownership using the shared helper
    const ownershipResult = await verifyVendorOwnership(user.id, vendorId, isAdmin);
    if (!ownershipResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ownershipResult.code,
            message: ownershipResult.error,
          },
        },
        { status: ownershipResult.status }
      );
    }

    const vendor = ownershipResult.vendor;
    const payload = await getPayloadClient();

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('logo') as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No logo file provided',
          },
        },
        { status: 400 }
      );
    }

    // Validate file type
    const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!acceptedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed',
          },
        },
        { status: 400 }
      );
    }

    // Validate file size (5MB max for logos)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'File size exceeds 5MB limit',
          },
        },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create media document in Payload
    const mediaDoc = await payload.create({
      collection: 'media',
      data: {
        alt: `${vendor.companyName} logo`,
        vendor: vendorId,
      },
      file: {
        data: buffer,
        mimetype: file.type,
        name: file.name,
        size: file.size,
      },
    });

    // Update vendor with the new logo reference
    await payload.update({
      collection: 'vendors',
      id: vendorId,
      data: {
        logo: mediaDoc.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        logoUrl: mediaDoc.url || `/media/${mediaDoc.filename}`,
        message: 'Logo uploaded successfully',
      },
    });

  } catch (error) {
    console.error('Logo upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to upload logo',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/portal/vendors/[id]/logo
 *
 * Delete the vendor's logo
 *
 * Authorization:
 * - Vendor can only delete their own logo
 * - Admin can delete any vendor's logo
 */
export async function DELETE(
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
    const isAdmin = user.role === 'admin';

    // Verify vendor ownership using the shared helper
    const ownershipResult = await verifyVendorOwnership(user.id, vendorId, isAdmin);
    if (!ownershipResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ownershipResult.code,
            message: ownershipResult.error,
          },
        },
        { status: ownershipResult.status }
      );
    }

    const vendor = ownershipResult.vendor;
    const payload = await getPayloadClient();

    // Check if vendor has a logo
    if (!vendor.logo) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Vendor does not have a logo',
          },
        },
        { status: 404 }
      );
    }

    // Get the logo media ID
    const vendorLogo = vendor.logo as { id: string | number } | string | number | null;
    const logoId = typeof vendorLogo === 'object' && vendorLogo !== null ? vendorLogo.id : vendorLogo;

    // Remove logo reference from vendor
    await payload.update({
      collection: 'vendors',
      id: vendorId,
      data: {
        logo: null,
      },
    });

    // Delete the media document (only if we have a valid ID)
    if (logoId) {
      try {
        await payload.delete({
          collection: 'media',
          id: logoId,
        });
      } catch (deleteError) {
        // Log but don't fail if media deletion fails (may already be deleted)
        console.warn('Could not delete media document:', deleteError);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        logoUrl: '',
        message: 'Logo deleted successfully',
      },
    });

  } catch (error) {
    console.error('Logo delete error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete logo',
        },
      },
      { status: 500 }
    );
  }
}
