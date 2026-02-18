import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/lib/utils/get-payload-config';

/**
 * Test API: Reset Vendor Tier
 * POST /api/test/vendors/reset-tier
 *
 * Resets a vendor's tier to a specific value by email.
 * This is essential for E2E tests that need vendors at specific tiers,
 * since tier approval tests permanently change vendor tiers.
 *
 * Request body:
 * {
 *   email: string,  // Vendor's email address
 *   tier: 'free' | 'tier1' | 'tier2' | 'tier3'
 * }
 *
 * Only available in test/development environments.
 */
export async function POST(request: NextRequest) {
  // Environment guard
  const isE2ETest = process.env.E2E_TEST === 'true';
  if (process.env.NODE_ENV === 'production' && !isE2ETest) {
    return NextResponse.json(
      { success: false, error: 'Test endpoints are not available in production' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { email, tier } = body;

    if (!email || !tier) {
      return NextResponse.json(
        { success: false, error: 'Email and tier are required' },
        { status: 400 }
      );
    }

    const validTiers = ['free', 'tier1', 'tier2', 'tier3'];
    if (!validTiers.includes(tier)) {
      return NextResponse.json(
        { success: false, error: `Invalid tier. Must be one of: ${validTiers.join(', ')}` },
        { status: 400 }
      );
    }

    const payload = await getPayloadClient();

    // Find vendor by user email
    const users = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
    });

    if (users.docs.length === 0) {
      return NextResponse.json(
        { success: false, error: `User not found with email: ${email}` },
        { status: 404 }
      );
    }

    const userId = users.docs[0].id;

    // Find vendor associated with this user
    const vendors = await payload.find({
      collection: 'vendors',
      where: { user: { equals: userId } },
      limit: 1,
    });

    if (vendors.docs.length === 0) {
      return NextResponse.json(
        { success: false, error: `Vendor not found for user: ${email}` },
        { status: 404 }
      );
    }

    const vendor = vendors.docs[0];

    // Update vendor tier
    const updatedVendor = await payload.update({
      collection: 'vendors',
      id: vendor.id,
      data: { tier },
    });

    return NextResponse.json({
      success: true,
      vendorId: vendor.id,
      previousTier: vendor.tier,
      newTier: tier,
    });
  } catch (error) {
    console.error('[Test API] Reset tier error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
