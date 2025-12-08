# Task: integ-api-routes - Migrate API Routes to Unified Auth Module

## Task Metadata
- **Task ID**: integ-api-routes
- **Phase**: Phase 2 - Backend Implementation
- **Agent**: backend-nodejs-specialist
- **Estimated Time**: 45-60 minutes
- **Dependencies**: [impl-auth-module]
- **Status**: [ ] Not Started

## Task Description
Update all API routes to use the new unified auth module, deprecating the old auth utilities with re-exports for backward compatibility.

## Specifics
- **Files to Modify** (API Routes):
  - `app/api/portal/vendors/[id]/route.ts`
  - `app/api/portal/vendors/[id]/team/route.ts`
  - `app/api/portal/vendors/[id]/products/route.ts`
  - `app/api/portal/vendors/[id]/locations/route.ts`
  - `app/api/portal/vendors/[id]/tier-upgrade-request/route.ts`
  - `app/api/portal/vendors/[id]/tier-downgrade-request/route.ts`
  - `app/api/portal/me/route.ts`
  - `app/api/admin/tier-upgrade-requests/route.ts`
  - `app/api/admin/tier-upgrade-requests/[id]/approve/route.ts`
  - `app/api/admin/tier-upgrade-requests/[id]/reject/route.ts`
  - `app/api/admin/vendors/[id]/tier/route.ts`
  - (and any other routes using old auth utilities)

- **Files to Modify** (Deprecation):
  ```typescript
  // lib/middleware/auth-middleware.ts
  export * from '@/lib/auth';
  console.warn('[DEPRECATED] Import from @/lib/auth instead');

  // lib/middleware/vendor-portal-auth.ts
  export * from '@/lib/auth';
  console.warn('[DEPRECATED] Import from @/lib/auth instead');

  // lib/utils/admin-auth.ts
  export * from '@/lib/auth';
  console.warn('[DEPRECATED] Import from @/lib/auth instead');
  ```

- **Migration Pattern**:
  ```typescript
  // Before
  import { validateVendorPortalAuth } from '@/lib/middleware/vendor-portal-auth';

  // After
  import { requireVendorOwnership, isAuthError } from '@/lib/auth';

  export async function GET(request: NextRequest, { params }: Props) {
    const authResult = await requireVendorOwnership(request, params.id);
    if (isAuthError(authResult)) return authResult;

    const { user, vendor } = authResult;
    // ... rest of handler
  }
  ```

## Acceptance Criteria
- [ ] All portal routes use unified auth module
- [ ] All admin routes use unified auth module
- [ ] Old auth utilities re-export from new module
- [ ] Deprecation warnings logged when old imports used
- [ ] All existing API functionality preserved
- [ ] No breaking changes to API responses

## Context Requirements
- Reference each route's current auth implementation
- Maintain exact same authorization logic

## Implementation Notes
- Use isAuthError type guard for clean early returns
- Vendor routes: requireVendorOwnership
- Admin routes: requireAdmin
- Mixed routes: requireRole(['admin', 'vendor'])

## Quality Gates
- [ ] All existing tests pass
- [ ] No TypeScript errors
- [ ] API responses unchanged
- [ ] Authorization behavior identical
