import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/lib/utils/get-payload-config';
import { requireAdmin } from '@/lib/auth';
import type { VendorTier } from '@/lib/utils/tier-validator';

/**
 * Validate tier value
 */
function validateTier(tier: unknown): tier is VendorTier {
  return ['free', 'tier1', 'tier2', 'tier3'].includes(tier as string);
}

/**
 * PUT /api/admin/vendors/[id]/tier - Update vendor tier
 *
 * Admin-only endpoint to upgrade or downgrade vendor tiers without payment.
 * Used primarily for testing and administrative tier adjustments.
 *
 * Request Body:
 * {
 *   "tier": "free" | "tier1" | "tier2" | "tier3"
 * }
 *
 * Response:
 * {
 *   "message": "Vendor tier updated successfully",
 *   "vendor": {
 *     "id": string,
 *     "companyName": string,
 *     "tier": string,
 *     "updatedAt": string
 *   }
 * }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Verify admin authentication
    const auth = await requireAdmin(request);
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error, code: auth.code },
        { status: auth.status }
      );
    }

    // Parse request body
    const body = await request.json();
    const { tier } = body;

    // Validate tier parameter
    if (!tier) {
      return NextResponse.json(
        { error: 'Tier is required' },
        { status: 400 }
      );
    }

    if (!validateTier(tier)) {
      return NextResponse.json(
        {
          error: 'Invalid tier value. Must be one of: free, tier1, tier2, tier3',
        },
        { status: 400 }
      );
    }

    const resolvedParams = await params;
    const vendorId = resolvedParams.id;

    const payload = await getPayloadClient();

    // Fetch vendor to verify it exists
    let vendor;
    try {
      vendor = await payload.findByID({
        collection: 'vendors',
        id: vendorId,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('not found') || message.includes('No document')) {
        return NextResponse.json(
          { error: 'Vendor not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    // Update vendor tier
    const updateData = {
      tier,
      updatedAt: new Date().toISOString(),
    };

    const updatedVendor = await payload.update({
      collection: 'vendors',
      id: vendorId,
      data: updateData,
    });

    // Log the tier change
    console.log('[Admin Tier Update]', {
      vendorId,
      previousTier: vendor.tier || 'free',
      newTier: tier,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      message: 'Vendor tier updated successfully',
      vendor: {
        id: updatedVendor.id,
        companyName: updatedVendor.companyName,
        tier: updatedVendor.tier,
        updatedAt: updatedVendor.updatedAt,
      },
    });
  } catch (error) {
    console.error('[Admin Tier Update] Error:', error);
    const message = error instanceof Error ? error.message : 'Tier update failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
