import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/lib/utils/get-payload-config';
import { validateToken, verifyVendorOwnership } from '@/lib/auth';
import { TierValidationService } from '@/lib/services/TierValidationService';
import { type Tier, getMaxMedia, TIER_NAMES } from '@/lib/constants/tierConfig';

interface SuccessResponse {
  success: true;
  url: string | null | undefined;
  filename: string | undefined;
  id: string | number;
  vendorId: string | null;
}

interface ErrorResponse {
  success: false;
  error: {
    code: 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'SERVER_ERROR';
    message: string;
    details?: string;
  };
}

/**
 * POST /api/media/upload
 * Upload an image to Payload Media collection
 *
 * @requires Authentication - Only authenticated users can upload media
 * @requires Tier - Requires tier1 or higher for media-gallery feature
 *
 * Form Data:
 * - file: The image file to upload (required)
 * - vendorId: The vendor ID to associate with the upload (required for vendor users)
 *
 * The route verifies that the authenticated user owns the specified vendor
 * and that the vendor's tier allows media gallery access (tier1+)
 * before allowing the upload. Admin users can upload without a vendorId.
 */
export async function POST(request: NextRequest): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    // Authenticate user - only logged-in users can upload media
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const vendorId = formData.get('vendorId') as string | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'No file provided',
          },
        },
        { status: 400 }
      );
    }

    // Get Payload instance
    const payload = await getPayloadClient();

    // For non-admin users, vendorId is required and ownership must be verified
    if (!isAdmin) {
      if (!vendorId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Vendor ID is required for media uploads',
            },
          },
          { status: 400 }
        );
      }

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

      // Verify vendor tier allows media gallery access (tier1+)
      const vendorTier = (vendor.tier || 'free') as Tier;
      if (!TierValidationService.canAccessFeature(vendorTier, 'media-gallery')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Media gallery requires Professional tier (tier1) or higher. Please upgrade your subscription.',
            },
          },
          { status: 403 }
        );
      }

      // Check media count limit for this vendor's tier
      const existingMedia = await payload.count({
        collection: 'media',
        where: {
          vendor: { equals: vendorId },
        },
      });

      const maxMedia = getMaxMedia(vendorTier);
      if (existingMedia.totalDocs >= maxMedia) {
        const tierName = TIER_NAMES[vendorTier];
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: `Media limit reached. ${tierName} tier allows up to ${maxMedia} media items. Please upgrade your subscription or delete existing media.`,
              details: `Current count: ${existingMedia.totalDocs}, Max allowed: ${maxMedia}`,
            },
          },
          { status: 403 }
        );
      }
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

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'File size exceeds 10MB limit',
          },
        },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create media document in Payload with vendor association
    const mediaDoc = await payload.create({
      collection: 'media',
      data: {
        alt: file.name,
        // Associate with vendor if provided (null for admin uploads without vendorId)
        ...(vendorId && { vendor: vendorId }),
      },
      file: {
        data: buffer,
        mimetype: file.type,
        name: file.name,
        size: file.size,
      },
    });

    // Return media URL
    return NextResponse.json({
      success: true,
      url: mediaDoc.url,
      filename: mediaDoc.filename,
      id: mediaDoc.id,
      vendorId: vendorId || null,
    });

  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Upload failed',
        },
      },
      { status: 500 }
    );
  }
}
