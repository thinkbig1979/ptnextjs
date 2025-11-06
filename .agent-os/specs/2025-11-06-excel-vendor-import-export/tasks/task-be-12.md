# Task BE-12: API Route - Import History

**Status:** 🔒 Blocked (waiting for BE-8)
**Agent:** backend-nodejs-specialist
**Estimated Time:** 2 hours
**Phase:** Backend Implementation
**Dependencies:** BE-8

## Objective

Create API endpoint for retrieving vendor import history.

## Context Requirements

- Review BE-8: ImportHistory collection
- Review existing API patterns

## Acceptance Criteria

- [ ] File created at `/home/edwin/development/ptnextjs/app/api/portal/vendors/[id]/import-history/route.ts`
- [ ] GET endpoint returns paginated import history
- [ ] Filter by status, date range
- [ ] Sort by date (newest first)
- [ ] Authentication and authorization
- [ ] Include related user and vendor data

## Detailed Specifications

```typescript
// GET /api/portal/vendors/[id]/import-history
// Query params: ?page=1&limit=10&status=success|partial|failed

import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth-helpers';
import payload from 'payload';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, error } = await authenticateUser(request);
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Authorization
    if (user.role !== 'admin' && user.vendorId !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse query params
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');

    // Query import history
    const where: any = { 'vendor.id': { equals: params.id } };
    if (status) {
      where.status = { equals: status };
    }

    const result = await payload.find({
      collection: 'import_history',
      where,
      sort: '-importDate',
      page,
      limit
    });

    return NextResponse.json(result);

  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
```

## Testing Requirements

- Test pagination
- Test filtering by status
- Test authorization

## Evidence Requirements

- [ ] API route created
- [ ] Tests passing

## Next Steps

Used by FE-5 (ImportHistoryCard)
