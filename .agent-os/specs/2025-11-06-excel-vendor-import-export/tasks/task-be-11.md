# Task BE-11: API Route - Excel Import

**Status:** 🔒 Blocked (waiting for BE-7)
**Agent:** backend-nodejs-specialist
**Estimated Time:** 5 hours
**Phase:** Backend Implementation
**Dependencies:** BE-7

## Objective

Create API endpoint for uploading and importing Excel vendor data with validation preview.

## Context Requirements

- Review BE-4: ExcelParserService
- Review BE-6: ImportValidationService
- Review BE-7: ImportExecutionService
- Review multipart/form-data handling in Next.js

## Acceptance Criteria

- [ ] File created at `/home/edwin/development/ptnextjs/app/api/portal/vendors/[id]/excel-import/route.ts`
- [ ] POST endpoint accepts multipart/form-data
- [ ] Two-phase import: preview (validation) and execute
- [ ] Parse uploaded Excel file
- [ ] Validate data and return errors
- [ ] Execute import only if confirmed
- [ ] Tier-based import restrictions (Tier 2+ only)
- [ ] File size limits (5MB)
- [ ] Comprehensive error handling
- [ ] Return detailed results

## Detailed Specifications

```typescript
// POST /api/portal/vendors/[id]/excel-import
// Query params: ?phase=preview|execute

import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth-helpers';
import { ExcelParserService } from '@/lib/services/ExcelParserService';
import { ImportValidationService } from '@/lib/services/ImportValidationService';
import { ImportExecutionService } from '@/lib/services/ImportExecutionService';
import { TierService } from '@/lib/services/TierService';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authenticate
    const { user, error } = await authenticateUser(request);
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Check tier access (Tier 2+ only)
    const vendor = await payload.findByID({
      collection: 'vendors',
      id: params.id
    });

    if (!TierService.checkFeatureAccess(vendor.tier, 'excel-import')) {
      return NextResponse.json(
        { error: 'Excel import requires Tier 2 or higher' },
        { status: 403 }
      );
    }

    // 3. Get upload phase
    const url = new URL(request.url);
    const phase = url.searchParams.get('phase') || 'preview';

    // 4. Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 5. Convert to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 6. Parse Excel
    const parseResult = await ExcelParserService.parse(
      buffer,
      vendor.tier,
      file.name
    );

    if (!parseResult.success) {
      return NextResponse.json({ parseResult }, { status: 400 });
    }

    // 7. Validate data
    const validationResult = await ImportValidationService.validate(
      parseResult.rows,
      vendor.tier,
      vendor.id
    );

    if (phase === 'preview') {
      // Return validation results for preview
      return NextResponse.json({
        phase: 'preview',
        parseResult,
        validationResult
      });
    }

    // 8. Execute import (if phase=execute and validation passed)
    if (phase === 'execute') {
      if (!validationResult.valid) {
        return NextResponse.json(
          { error: 'Cannot execute import with validation errors', validationResult },
          { status: 400 }
        );
      }

      const executionResult = await ImportExecutionService.execute(
        validationResult.rows,
        {
          vendorId: vendor.id,
          userId: user.id,
          overwriteExisting: true
        }
      );

      return NextResponse.json({
        phase: 'execute',
        executionResult
      });
    }

    return NextResponse.json({ error: 'Invalid phase' }, { status: 400 });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Import failed' },
      { status: 500 }
    );
  }
}
```

## Testing Requirements

### Integration Tests

```typescript
describe('POST /api/portal/vendors/[id]/excel-import', () => {
  it('should validate uploaded file (preview phase)');
  it('should execute import (execute phase)');
  it('should reject Tier 1 vendors');
  it('should reject files over 5MB');
  it('should handle parsing errors');
  it('should handle validation errors');
  it('should require authentication');
});
```

## Evidence Requirements

- [ ] API route created
- [ ] Tests passing
- [ ] Manual test with actual Excel upload
- [ ] Both preview and execute phases work

## Next Steps

Used by FE-4 (ExcelImportCard) and INT-1 (file upload integration)
