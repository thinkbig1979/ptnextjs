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
import { validateToken } from '@/lib/auth';
import { ExcelParserService } from '@/lib/services/ExcelParserService';
import { ImportValidationService } from '@/lib/services/ImportValidationService';
import { ImportExecutionService } from '@/lib/services/ImportExecutionService';
import { VendorProfileService } from '@/lib/services/VendorProfileService';
import { TierService } from '@/lib/services/TierService';
import { convertTierToNumeric } from '@/lib/config/excel-field-mappings';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB


/**
 * POST /api/portal/vendors/[id]/excel-import
 *
 * Upload and import Excel file with vendor data
 */
export async function POST(
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
    const numericTier = convertTierToNumeric(vendor.tier as string | undefined);

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
      vendor.id as string
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

    const executionResult = await ImportExecutionService.execute(
      validationResult.rows,
      {
        vendorId: vendor.id as string,
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
