import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/lib/utils/get-payload-config';
import { authService } from '@/lib/services/auth-service';

/**
 * Extract user from auth token
 */
function extractUser(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    throw new Error('Authentication required');
  }

  return authService.validateToken(token);
}

/**
 * GET /api/vendors/profile - Get current vendor's profile
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const user = extractUser(request);

    if (user.role !== 'vendor') {
      return NextResponse.json(
        { error: 'Only vendors can access this endpoint' },
        { status: 403 }
      );
    }

    const payload = await getPayloadClient();

    // Find vendor profile linked to user
    const vendors = await payload.find({
      collection: 'vendors',
      where: { user: { equals: user.id } },
      limit: 1,
      depth: 2,
    });

    if (vendors.docs.length === 0) {
      return NextResponse.json(
        { error: 'Vendor profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ vendor: vendors.docs[0] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch profile';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

/**
 * PATCH /api/vendors/profile - Update current vendor's profile
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const user = extractUser(request);

    if (user.role !== 'vendor') {
      return NextResponse.json(
        { error: 'Only vendors can access this endpoint' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const payload = await getPayloadClient();

    // Find vendor profile
    const vendors = await payload.find({
      collection: 'vendors',
      where: { user: { equals: user.id } },
      limit: 1,
    });

    if (vendors.docs.length === 0) {
      return NextResponse.json(
        { error: 'Vendor profile not found' },
        { status: 404 }
      );
    }

    const vendorId = vendors.docs[0].id;
    const currentTier = vendors.docs[0].tier;

    // Build update data (only allow certain fields)
    const updateData: Record<string, unknown> = {};

    // Always allowed fields
    if (body.description !== undefined) updateData.description = body.description;
    if (body.website !== undefined) updateData.website = body.website;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.logo !== undefined) updateData.logo = body.logo;
    if (body.image !== undefined) updateData.image = body.image;

    // Tier-based field restrictions
    if (currentTier === 'free') {
      // Free tier: basic fields only (already handled above)
    } else if (currentTier === 'tier1' || currentTier === 'tier2') {
      // Tier1 & Tier2: Enhanced profile fields
      if (body.services !== undefined) updateData.services = body.services;
      if (body.certifications !== undefined) updateData.certifications = body.certifications;
    }

    if (currentTier === 'tier2') {
      // Tier2: Premium features
      if (body.awards !== undefined) updateData.awards = body.awards;
      if (body.caseStudies !== undefined) updateData.caseStudies = body.caseStudies;
      if (body.teamMembers !== undefined) updateData.teamMembers = body.teamMembers;
    }

    // Update vendor profile
    const updatedVendor = await payload.update({
      collection: 'vendors',
      id: vendorId,
      data: updateData,
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      vendor: updatedVendor,
    });
  } catch (error) {
    console.error('[Vendor Profile Update] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
