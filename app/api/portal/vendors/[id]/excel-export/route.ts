/**
 * API Route: Vendor Data Export to Excel
 *
 * GET /api/portal/vendors/[id]/excel-export
 *
 * Exports vendor data to Excel format with tier-appropriate fields.
 *
 * @requires Authentication
 * @requires Authorization (vendor owns resource or is admin)
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateToken } from '@/lib/auth';
import { ExcelExportService } from '@/lib/services/ExcelExportService';
import { VendorProfileService } from '@/lib/services/VendorProfileService';
import { convertTierToNumeric } from '@/lib/config/excel-field-mappings';
import type { Vendor } from '@/lib/types';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}


/**
 * GET /api/portal/vendors/[id]/excel-export
 *
 * Export vendor data to Excel with tier-appropriate fields
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    // Await params
    const { id } = await context.params;

    // Authenticate user
    const auth = await validateToken(request);
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    const user = auth.user;
    const isAdmin = user.role === 'admin';

    // Get vendor data using VendorProfileService (includes authorization)
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
    const numericTier = convertTierToNumeric(vendor.tier as string | undefined);

    // Export vendor data to Excel using ExcelExportService
    const buffer = await ExcelExportService.exportVendor(
      vendor as unknown as Vendor,
      numericTier,
      {
        includeMetadata: true,
        sheetName: 'Vendor Data'
      }
    );

    // Generate filename
    const filename = ExcelExportService.generateFilename(vendor.name as string | undefined, numericTier);

    // Return Excel file with proper headers
    return new NextResponse(Uint8Array.from(buffer), {
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
    console.error('Excel export error:', error);
    return NextResponse.json(
      {
        error: 'Failed to export vendor data to Excel',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
