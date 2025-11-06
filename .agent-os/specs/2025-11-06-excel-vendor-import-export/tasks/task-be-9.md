# Task BE-9: API Route - Excel Template Download

**Status:** 🔒 Blocked (waiting for BE-3)
**Agent:** backend-nodejs-specialist
**Estimated Time:** 3 hours
**Phase:** Backend Implementation
**Dependencies:** BE-3

## Objective

Create API endpoint for downloading tier-appropriate Excel import templates.

## Context Requirements

- Review BE-3: ExcelTemplateService
- Review existing API patterns in /app/api/portal/vendors/[id]/
- Review authentication patterns (authenticateUser)

## Acceptance Criteria

- [ ] File created at `/home/edwin/development/ptnextjs/app/api/portal/vendors/[id]/excel-template/route.ts`
- [ ] GET endpoint returns Excel template buffer
- [ ] Authentication and authorization (vendor owns resource or is admin)
- [ ] Tier-based template generation
- [ ] Proper Content-Type and Content-Disposition headers
- [ ] Filename includes vendor name and date
- [ ] Error handling (404, 403, 500)
- [ ] Rate limiting consideration

## Detailed Specifications

### API Route

```typescript
// /home/edwin/development/ptnextjs/app/api/portal/vendors/[id]/excel-template/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth-helpers';
import { ExcelTemplateService } from '@/lib/services/ExcelTemplateService';
import { TierService } from '@/lib/services/TierService';
import payload from 'payload';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const { user, error } = await authenticateUser(request);
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get vendor
    const vendor = await payload.findByID({
      collection: 'vendors',
      id: params.id
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // Authorization check
    if (user.role !== 'admin' && user.vendorId !== vendor.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Generate template
    const tier = vendor.tier || 'FREE';
    const buffer = await ExcelTemplateService.generateTemplate(tier);

    // Generate filename
    const filename = ExcelTemplateService.generateFilename(vendor.name, tier);

    // Return Excel file
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString()
      }
    });

  } catch (error) {
    console.error('Template generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    );
  }
}
```

## Testing Requirements

### Integration Tests

```typescript
describe('GET /api/portal/vendors/[id]/excel-template', () => {
  it('should download template for authenticated vendor');
  it('should reject unauthenticated requests');
  it('should reject requests for other vendors');
  it('should generate tier-appropriate template');
  it('should return proper headers and filename');
});
```

## Evidence Requirements

- [ ] API route file created
- [ ] Integration tests passing
- [ ] Manual test: download template via browser
- [ ] Headers correct (Content-Type, Content-Disposition)

## Next Steps

Used by FE-3 (ExcelExportCard component)
