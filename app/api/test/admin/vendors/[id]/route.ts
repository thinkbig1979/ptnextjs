import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getPayloadClient } from '@/lib/utils/get-payload-config';

/**
 * Test Admin Vendor API
 * PATCH /api/test/admin/vendors/[id] - Update vendor data (for E2E tests)
 * DELETE /api/test/admin/vendors/[id] - Delete vendor with cascade
 *
 * Admin endpoint for managing vendors in test/development environments.
 * Only available in test/development environments for E2E testing.
 */

interface DeleteResponse {
  success: boolean;
  deleted?: {
    vendorId: string;
    productsDeleted: number;
    userDeleted: boolean;
  };
  error?: string;
}

/**
 * DELETE /api/test/admin/vendors/[id]
 * Delete a vendor and cascade delete related data (products, user association)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<DeleteResponse>> {
  // NODE_ENV guard - only allow in test/development OR when E2E_TEST is explicitly enabled
  const isE2ETest = process.env.E2E_TEST === 'true';
  if (process.env.NODE_ENV === 'production' && !isE2ETest) {
    return NextResponse.json(
      {
        success: false,
        error: 'Test endpoints are not available in production',
      },
      { status: 403 }
    );
  }

  try {
    const { id: vendorId } = await params;

    if (!vendorId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Vendor ID is required',
        },
        { status: 400 }
      );
    }

    const payload = await getPayloadClient();

    // First, verify the vendor exists
    const existingVendor = await payload.findByID({
      collection: 'vendors',
      id: vendorId,
    }).catch(() => null);

    if (!existingVendor) {
      return NextResponse.json(
        {
          success: false,
          error: `Vendor not found: ${vendorId}`,
        },
        { status: 404 }
      );
    }

    // Get the associated user ID before deletion
    const userId = typeof existingVendor.user === 'object' && existingVendor.user !== null
      ? existingVendor.user.id
      : existingVendor.user;

    // Find and delete all products associated with this vendor
    const vendorProducts = await payload.find({
      collection: 'products',
      where: {
        vendor: { equals: vendorId },
      },
      limit: 1000, // Get all products
    });

    let productsDeleted = 0;
    for (const product of vendorProducts.docs) {
      try {
        await payload.delete({
          collection: 'products',
          id: product.id as string,
        });
        productsDeleted++;
      } catch (productError) {
        console.error(`Failed to delete product ${product.id}:`, productError);
        // Continue with other deletions
      }
    }

    // Delete the vendor
    await payload.delete({
      collection: 'vendors',
      id: vendorId,
    });

    // Delete the associated user if it exists
    let userDeleted = false;
    if (userId) {
      try {
        await payload.delete({
          collection: 'users',
          id: userId as string,
        });
        userDeleted = true;
      } catch (userError) {
        // User might not exist or might have already been deleted
        console.warn(`Could not delete user ${userId}:`, userError);
      }
    }

    // Invalidate cache
    try {
      revalidatePath('/vendors/');
      revalidatePath('/');
      revalidatePath('/api/vendors');
      revalidatePath('/products/');
      revalidatePath('/api/products');
    } catch (cacheError) {
      console.error('[Admin Vendor Delete] Cache invalidation failed:', cacheError);
    }

    console.log(`[Admin Vendor Delete] Deleted vendor ${vendorId}: ${productsDeleted} products, user: ${userDeleted}`);

    return NextResponse.json({
      success: true,
      deleted: {
        vendorId,
        productsDeleted,
        userDeleted,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Admin Vendor Delete] Error:', errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/test/admin/vendors/[id]
 * Update a vendor's profile data without authentication (for E2E tests)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // NODE_ENV guard - only allow in test/development OR when E2E_TEST is explicitly enabled
  const isE2ETest = process.env.E2E_TEST === 'true';
  if (process.env.NODE_ENV === 'production' && !isE2ETest) {
    return NextResponse.json(
      {
        success: false,
        error: 'Test endpoints are not available in production',
      },
      { status: 403 }
    );
  }

  try {
    const { id: vendorId } = await params;

    if (!vendorId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Vendor ID is required',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const payload = await getPayloadClient();

    // Verify the vendor exists
    const existingVendor = await payload.findByID({
      collection: 'vendors',
      id: vendorId,
    }).catch(() => null);

    if (!existingVendor) {
      return NextResponse.json(
        {
          success: false,
          error: `Vendor not found: ${vendorId}`,
        },
        { status: 404 }
      );
    }

    // Update the vendor
    const updatedVendor = await payload.update({
      collection: 'vendors',
      id: vendorId,
      data: body,
    });

    // Invalidate cache
    try {
      revalidatePath(`/vendors/${existingVendor.slug}`);
      revalidatePath('/vendors/');
      revalidatePath('/');
    } catch (cacheError) {
      console.error('[Admin Vendor Update] Cache invalidation failed:', cacheError);
    }

    console.log(`[Admin Vendor Update] Updated vendor ${vendorId}`);

    return NextResponse.json({
      success: true,
      vendor: updatedVendor,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Admin Vendor Update] Error:', errorMessage);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
