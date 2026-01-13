/**
 * Single Vendor API Route
 *
 * GET /api/vendors/[id] - Get a single vendor by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPayloadClient } from '@/lib/utils/get-payload-config';

interface VendorResponse {
  id: string;
  slug: string;
  companyName: string;
  description?: string;
  tier: string;
  contactEmail: string;
  published: boolean;
  [key: string]: unknown;
}

interface ErrorResponse {
  error: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<VendorResponse | ErrorResponse>> {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    const payload = await getPayloadClient();

    let vendor;
    try {
      vendor = await payload.findByID({
        collection: 'vendors',
        id,
        depth: 1,
      });
    } catch (findError) {
      // Payload throws when ID doesn't exist
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Transform to API response format
    const response: VendorResponse = {
      id: vendor.id as string,
      slug: vendor.slug,
      companyName: vendor.companyName,
      description: vendor.description || undefined,
      tier: vendor.tier,
      contactEmail: vendor.contactEmail,
      published: vendor.published || false,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    // If the error is a "not found" type error, return 404
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    console.error('Error fetching vendor:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendor' },
      { status: 500 }
    );
  }
}
