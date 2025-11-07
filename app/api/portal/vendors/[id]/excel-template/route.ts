/**
 * API Route: Excel Template Download
 *
 * GET /api/portal/vendors/[id]/excel-template
 *
 * Downloads a tier-appropriate Excel import template for the vendor.
 *
 * @requires Authentication
 * @requires Authorization (vendor owns resource or is admin)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/middleware/auth-middleware';
import { ExcelTemplateService } from '@/lib/services/ExcelTemplateService';
import { VendorProfileService } from '@/lib/services/VendorProfileService';
import type { VendorTier as NumericVendorTier } from '@/lib/config/excel-field-mappings';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Helper function to authenticate user from request
 */
async function authenticateUser(request: NextRequest) {
  let user = getUserFromRequest(request);

  // If user not in headers (middleware not applied), extract from token manually
  if (!user) {
    const { authService } = await import('@/lib/services/auth-service');
    const token =
      request.headers.get('authorization')?.replace('Bearer ', '') ||
      request.cookies.get('access_token')?.value;

    if (!token) {
      return null;
    }

    try {
      user = authService.validateToken(token);
    } catch (error) {
      return null;
    }
  }

  return user;
}

/**
 * Convert string tier to numeric tier for Excel services
 */
function convertTierToNumeric(tier: string | undefined): NumericVendorTier {
  switch (tier) {
    case 'tier1':
      return 1;
    case 'tier2':
      return 2;
    case 'tier3':
      return 3;
    case 'tier4':
      return 4;
    case 'free':
    default:
      return 0;
  }
}

/**
 * GET /api/portal/vendors/[id]/excel-template
 *
 * Download tier-appropriate Excel import template
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Await params
    const { id } = await context.params;

    // Authenticate user
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      );
    }

    const isAdmin = user.role === 'admin';

    // Get vendor using VendorProfileService (includes authorization)
    const vendor = await VendorProfileService.getVendorForEdit(
      id,
      user.id.toString(),
      isAdmin
    );

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Convert tier to numeric format for Excel service
    const numericTier = convertTierToNumeric(vendor.tier);

    // Generate template using ExcelTemplateService
    const buffer = await ExcelTemplateService.generateTemplate(numericTier);

    // Generate filename
    const filename = ExcelTemplateService.generateFilename(vendor.name, numericTier);

    // Return Excel file with proper headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Excel template generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate Excel template',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
