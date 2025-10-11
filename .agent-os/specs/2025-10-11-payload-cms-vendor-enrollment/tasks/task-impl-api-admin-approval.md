# Task: impl-api-admin-approval - Implement Admin Approval API Endpoints

## Task Metadata
- **Task ID**: impl-api-admin-approval
- **Phase**: Phase 2: Backend Implementation
- **Agent**: backend-nodejs-specialist
- **Estimated Time**: 30-35 minutes
- **Dependencies**: [impl-auth-system]
- **Status**: [ ] Not Started

## Task Description
Implement admin-only API endpoints for vendor approval workflow: GET /api/admin/vendors/pending, POST /api/admin/vendors/{id}/approve, POST /api/admin/vendors/{id}/reject.

## Specifics
- **Files to Create**:
  - `/home/edwin/development/ptnextjs/app/api/admin/vendors/pending/route.ts` - Get pending vendors
  - `/home/edwin/development/ptnextjs/app/api/admin/vendors/[id]/approve/route.ts` - Approve vendor
  - `/home/edwin/development/ptnextjs/app/api/admin/vendors/[id]/reject/route.ts` - Reject vendor
- **GET /api/admin/vendors/pending**: Returns list of pending vendors with pagination
- **POST /api/admin/vendors/{id}/approve**: Updates status to 'approved', sets approved_at, publishes vendor
- **POST /api/admin/vendors/{id}/reject**: Updates status to 'rejected', stores rejection reason, sets rejected_at
- **Authorization**: Admin role required for all endpoints

## Acceptance Criteria
- [ ] All three API routes created and functional
- [ ] Admin authentication required (401 if not logged in, 403 if not admin)
- [ ] GET pending returns paginated list with metadata
- [ ] Approve endpoint updates user.status='approved', user.approved_at=NOW(), vendor.published=true
- [ ] Reject endpoint requires reason, updates user.status='rejected', stores rejection_reason
- [ ] Approve/reject endpoints handle not found (404)
- [ ] Approve/reject are idempotent (can be called multiple times safely)

## Testing Requirements
- Integration tests: Non-admin access (403), successful approval, successful rejection with reason, approve non-existent vendor (404)
- Manual verification: Approve test vendor via API, verify status in database and admin panel

## Related Files
- Technical Spec: Admin API endpoints specification
- Admin Access Control: `/home/edwin/development/ptnextjs/payload/access/isAdmin.ts`
