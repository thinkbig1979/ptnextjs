/**
 * API Route: Excel Vendor Import
 *
 * POST /api/portal/vendors/[id]/excel-import?phase=preview|execute
 *
 * Two-phase import process:
 * - preview: Upload and validate Excel file, return validation results
 * - execute: Perform actual import after validation passes
 *
 * @requires Authentication
 * @requires Authorization (vendor owns resource or is admin)
 * @requires Tier 2+ subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/middleware/auth-middleware';
import { ExcelParserService } from '@/lib/services/ExcelParserService';
import { ImportValidationService } from '@/lib/services/ImportValidationService';
import { ImportExecutionService } from '@/lib/services/ImportExecutionService';
import { VendorProfileService } from '@/lib/services/VendorProfileService';
import { TierService } from '@/lib/services/TierService';
import type { VendorTier as NumericVendorTier } from '@/lib/config/excel-field-mappings';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
 * POST /api/portal/vendors/[id]/excel-import
 *
 * Upload and import Excel file with vendor data
 */
export async function POST(
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

    // Check tier access (Tier 2+ only)
    if (!TierService.isTierOrHigher(vendor.tier as any, 'tier2')) {
      return NextResponse.json(
        {
          error: 'Excel import requires Tier 2 or higher subscription',
          currentTier: vendor.tier,
          requiredTier: 'tier2',
          upgradePath: 'tier2'
        },
        { status: 403 }
      );
    }

    // Get upload phase from query params
    const url = new URL(request.url);
    const phase = url.searchParams.get('phase') || 'preview';

    if (phase !== 'preview' && phase !== 'execute') {
      return NextResponse.json(
        { error: 'Invalid phase parameter. Must be "preview" or "execute"' },
        { status: 400 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded. Please provide a file in the "file" field' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: 'File size exceeds maximum limit',
          maxSize: MAX_FILE_SIZE,
          actualSize: file.size
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert tier to numeric format for Excel services
    const numericTier = convertTierToNumeric(vendor.tier);

    // Parse Excel file
    const parseResult = await ExcelParserService.parse(
      buffer,
      numericTier,
      file.name
    );

    if (!parseResult.success) {
      return NextResponse.json(
        {
          phase: 'preview',
          parseResult,
          validationResult: null,
          error: 'Failed to parse Excel file. Please check the file format and try again.'
        },
        { status: 400 }
      );
    }

    // Validate parsed data
    const validationResult = await ImportValidationService.validate(
      parseResult.rows,
      numericTier,
      vendor.id
    );

    // Preview phase: Return validation results
    if (phase === 'preview') {
      return NextResponse.json({
        phase: 'preview',
        parseResult,
        validationResult,
        message: validationResult.valid
          ? 'File validated successfully. Ready for import.'
          : 'Validation errors found. Please fix the errors before importing.'
      });
    }

    // Execute phase: Perform actual import
    if (phase === 'execute') {
      // Ensure validation passed
      if (!validationResult.valid) {
        return NextResponse.json(
          {
            error: 'Cannot execute import with validation errors',
            validationResult,
            parseResult
          },
          { status: 400 }
        );
      }

      // Execute import with atomic operations
      const executionResult = await ImportExecutionService.execute(
        validationResult.rows,
        {
          vendorId: vendor.id,
          userId: user.id.toString(),
          overwriteExisting: true
        }
      );

      return NextResponse.json({
        phase: 'execute',
        executionResult,
        message: executionResult.success
          ? `Successfully imported ${executionResult.successfulRows} records`
          : `Import completed with errors. ${executionResult.successfulRows} successful, ${executionResult.failedRows} failed`
      });
    }

    // Should never reach here due to earlier phase validation
    return NextResponse.json(
      { error: 'Invalid phase' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Excel import error:', error);
    return NextResponse.json(
      {
        error: 'Import failed due to an unexpected error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
