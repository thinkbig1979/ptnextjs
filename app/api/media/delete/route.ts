import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/lib/utils/get-payload-config';
import { validateToken, verifyVendorOwnership } from '@/lib/auth';

interface SuccessResponse {
  success: true;
  message: string;
  deletedId: string;
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
 * DELETE /api/media/delete
 * Delete a media file from Payload Media collection
 *
 * @requires Authentication - Only authenticated users can delete media
 *
 * Request Body:
 * - mediaId: The ID of the media to delete (required)
 *
 * The route verifies that the authenticated user owns the media
 * (via the vendor relationship) before allowing deletion.
 * Admin users can delete any media.
 */
export async function DELETE(request: NextRequest): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    // Authenticate user - only logged-in users can delete media
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

    const body = await request.json();
    const { mediaId } = body;

    if (!mediaId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Media ID is required',
          },
        },
        { status: 400 }
      );
    }

    // Get Payload instance
    const payload = await getPayloadClient();

    // Fetch the media to verify ownership
    const media = await payload.findByID({
      collection: 'media',
      id: mediaId,
    });

    if (!media) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Media not found',
          },
        },
        { status: 404 }
      );
    }

    // For non-admin users, verify ownership via vendor relationship
    if (!isAdmin) {
      // Get the vendor ID from the media
      const mediaVendorId = typeof media.vendor === 'object' && media.vendor !== null
        ? (media.vendor as { id: string | number }).id
        : media.vendor;

      if (!mediaVendorId) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Media has no vendor association and cannot be deleted by non-admin users',
            },
          },
          { status: 403 }
        );
      }

      // Verify vendor ownership using the shared helper
      const ownershipResult = await verifyVendorOwnership(user.id, String(mediaVendorId), isAdmin);
      if (!ownershipResult.success) {
        // Map the error appropriately - if vendor not found, user doesn't have permission
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: ownershipResult.code === 'NOT_FOUND'
                ? 'You do not have a vendor profile'
                : 'You do not have permission to delete this media',
            },
          },
          { status: 403 }
        );
      }
    }

    // Delete the media
    await payload.delete({
      collection: 'media',
      id: mediaId,
    });

    return NextResponse.json({
      success: true,
      message: 'Media deleted successfully',
      deletedId: mediaId,
    });

  } catch (error) {
    console.error('Media delete error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Delete failed',
        },
      },
      { status: 500 }
    );
  }
}
