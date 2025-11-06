# Task BE-10: API Route - Vendor Data Export

**Status:** 🔒 Blocked (waiting for BE-5)
**Agent:** backend-nodejs-specialist
**Estimated Time:** 3 hours
**Phase:** Backend Implementation
**Dependencies:** BE-5

## Objective

Create API endpoint for exporting vendor data to Excel format.

## Context Requirements

- Review BE-5: ExcelExportService
- Review existing API patterns
- Review VendorProfileService for data retrieval

## Acceptance Criteria

- [ ] File created at `/home/edwin/development/ptnextjs/app/api/portal/vendors/[id]/excel-export/route.ts`
- [ ] GET endpoint returns vendor data as Excel
- [ ] Authentication and authorization
- [ ] Tier-appropriate field export
- [ ] Include all vendor data (profile, locations, etc.)
- [ ] Proper headers and filename
- [ ] Error handling

## Detailed Specifications

```typescript
// GET /api/portal/vendors/[id]/excel-export

import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth-helpers';
import { ExcelExportService } from '@/lib/services/ExcelExportService';
import { VendorProfileService } from '@/lib/services/VendorProfileService';
import payload from 'payload';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authenticate
    // 2. Get vendor data
    // 3. Export to Excel
    // 4. Return file
  } catch (error) {
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
```

## Testing Requirements

- Integration tests for export endpoint
- Test with various vendor data scenarios
- Verify exported data matches vendor profile

## Evidence Requirements

- [ ] API route created
- [ ] Tests passing
- [ ] Manual verification of exported data

## Next Steps

Used by FE-3 (ExcelExportCard)
