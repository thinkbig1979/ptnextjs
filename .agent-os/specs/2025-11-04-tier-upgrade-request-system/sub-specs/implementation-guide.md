# Implementation Guide

This is the implementation guide for the spec detailed in @.agent-os/specs/2025-11-04-tier-upgrade-request-system/spec.md

> Created: 2025-11-04
> Version: 1.0.0

## Development Approach

### Philosophy
- **MVP First**: Implement core functionality before enhancements
- **Incremental Delivery**: Ship working features in phases
- **Test-Driven**: Write tests alongside implementation
- **User-Centric**: Validate UX at each milestone

### Phased Implementation

**Phase 1: MVP (Week 1-2)**
- Core request submission and approval workflow
- Basic vendor and admin UI
- Essential validation and security

**Phase 2: Enhancements (Week 3)**
- Email notifications
- Advanced filtering and search
- Dashboard analytics
- Request history tracking

**Phase 3: Polish (Week 4)**
- Performance optimization
- UX refinements
- Documentation completion
- Deployment preparation

## Implementation Order

### 1. Database Schema (Day 1-2)
**Priority**: Critical path blocker
**Owner**: Backend engineer

**Tasks:**
1. Create Payload CMS collection definition in `payload.config.ts`
2. Define TypeScript interfaces in `lib/types.ts`
3. Create database migration (if applicable for production PostgreSQL)
4. Add seed data helpers for development

**Validation:**
- Schema passes TypeScript compilation
- Collection appears in Payload admin UI
- Can create/read/update/delete records manually
- Foreign key relationships work correctly

**Files to create/modify:**
- `payload.config.ts` - Add `tierUpgradeRequests` collection
- `lib/types.ts` - Add `TierUpgradeRequest` interface
- `lib/payload-cms-data-service.ts` - Add transform methods

### 2. API Endpoints (Day 3-4)
**Priority**: Critical path blocker
**Owner**: Backend engineer

**Vendor Endpoints:**
```typescript
POST   /api/portal/vendors/[id]/tier-upgrade-requests    // Submit request
GET    /api/portal/vendors/[id]/tier-upgrade-requests    // List own requests
DELETE /api/portal/vendors/[id]/tier-upgrade-requests/[requestId] // Cancel
```

**Admin Endpoints:**
```typescript
GET    /api/admin/tier-upgrade-requests                  // List all (with filters)
GET    /api/admin/tier-upgrade-requests/[id]            // Get single request
PATCH  /api/admin/tier-upgrade-requests/[id]/approve    // Approve request
PATCH  /api/admin/tier-upgrade-requests/[id]/reject     // Reject request
```

**Implementation checklist:**
- [ ] Authentication middleware (verify JWT, check user role)
- [ ] Authorization checks (vendor can only access own requests)
- [ ] Input validation (Zod schemas for all requests)
- [ ] Error handling (consistent error format)
- [ ] Rate limiting (max 10 requests/hour per vendor)
- [ ] Logging (all state changes)

**Validation:**
- All endpoints return correct status codes
- Unauthorized requests blocked (401/403)
- Invalid input rejected with clear errors (400)
- Database state changes as expected
- Unit tests pass (80%+ coverage)

**Files to create:**
- `app/api/portal/vendors/[id]/tier-upgrade-requests/route.ts`
- `app/api/portal/vendors/[id]/tier-upgrade-requests/[requestId]/route.ts`
- `app/api/admin/tier-upgrade-requests/route.ts`
- `app/api/admin/tier-upgrade-requests/[id]/route.ts`
- `app/api/admin/tier-upgrade-requests/[id]/approve/route.ts`
- `app/api/admin/tier-upgrade-requests/[id]/reject/route.ts`

### 3. Service Layer (Day 4-5)
**Priority**: Critical path blocker
**Owner**: Backend engineer

**Services to implement:**
```typescript
TierUpgradeRequestService {
  create(data: CreateRequest): Promise<TierUpgradeRequest>
  findByVendor(vendorId: string): Promise<TierUpgradeRequest[]>
  findPendingByVendor(vendorId: string): Promise<TierUpgradeRequest | null>
  approve(id: string, reviewedBy: string): Promise<void>
  reject(id: string, reviewedBy: string, reason: string): Promise<void>
  cancel(id: string): Promise<void>
  validateRequest(vendorId: string, targetTier: number): Promise<ValidationResult>
}
```

**Business logic:**
- Prevent duplicate pending requests
- Validate tier progression (cannot downgrade)
- Atomic tier update on approval
- Cascade status updates
- Transaction management

**Validation:**
- Unit tests for all service methods
- Integration tests with database
- Edge cases handled (race conditions, invalid states)
- Transactions work correctly (no partial updates)

**Files to create:**
- `lib/services/TierUpgradeRequestService.ts`
- `lib/services/__tests__/TierUpgradeRequestService.test.ts`

### 4. Vendor UI Components (Day 6-8)
**Priority**: User-facing critical
**Owner**: Frontend engineer

**Components to implement:**
1. **TierUpgradeCard** - Dashboard widget showing current tier and upgrade CTA
2. **TierUpgradeRequestForm** - Modal form for submitting requests
3. **TierUpgradeRequestStatus** - Display pending/approved/rejected status
4. **TierComparisonTable** - Side-by-side tier feature comparison

**Implementation checklist:**
- [ ] Use shadcn/ui components for consistency
- [ ] Form validation (client-side + server-side)
- [ ] Loading states and error handling
- [ ] Success/error toast notifications
- [ ] Responsive design (mobile-first)
- [ ] Accessibility (WCAG 2.1 AA)

**Validation:**
- Components render correctly in dashboard
- Form validation works (empty fields, invalid tier)
- API calls succeed/fail gracefully
- Loading states show during async operations
- Error messages are clear and actionable
- E2E tests pass (Playwright)

**Files to create:**
- `components/dashboard/TierUpgradeCard.tsx`
- `components/dashboard/TierUpgradeRequestForm.tsx`
- `components/dashboard/TierUpgradeRequestStatus.tsx`
- `components/TierComparisonTable.tsx`
- `components/dashboard/__tests__/TierUpgradeCard.test.tsx`
- `e2e/vendor-tier-upgrade.spec.ts`

### 5. Admin UI Components (Day 9-10)
**Priority**: Admin-facing critical
**Owner**: Frontend engineer

**Components to implement:**
1. **TierUpgradeRequestList** - Admin table with filters/sorting
2. **TierUpgradeRequestDetail** - Detailed view with approve/reject actions
3. **TierUpgradeRequestFilters** - Status, date range, tier filtering
4. **TierUpgradeRequestStats** - Dashboard metrics (pending count, approval rate)

**Payload CMS Integration:**
- Extend Payload admin UI with custom components
- Add custom views to `tierUpgradeRequests` collection
- Use Payload's built-in authentication

**Implementation checklist:**
- [ ] Custom Payload components follow Payload UI patterns
- [ ] Bulk actions (approve/reject multiple)
- [ ] Export functionality (CSV download)
- [ ] Real-time updates (when request status changes)
- [ ] Audit trail display

**Validation:**
- Components render in Payload admin
- Filtering and sorting work correctly
- Bulk actions update multiple records
- Export generates correct CSV
- E2E tests pass (Playwright)

**Files to create:**
- `app/(payload)/admin/components/TierUpgradeRequestList.tsx`
- `app/(payload)/admin/components/TierUpgradeRequestDetail.tsx`
- `app/(payload)/admin/components/TierUpgradeRequestFilters.tsx`
- `app/(payload)/admin/components/TierUpgradeRequestStats.tsx`
- `e2e/admin-tier-upgrade-requests.spec.ts`

### 6. Testing (Day 11-12)
**Priority**: Gate for production release
**Owner**: Full team

**Testing layers:**
1. **Unit tests** (Jest) - Service layer, utilities, validation
2. **Integration tests** (Jest + Supertest) - API endpoints + database
3. **E2E tests** (Playwright) - Complete user flows

**Test coverage targets:**
- Service layer: 90%+
- API endpoints: 85%+
- UI components: 75%+
- Overall: 80%+

**Validation:**
- All tests pass in CI
- Coverage meets targets
- No flaky tests
- Performance tests pass

**Files to create:**
- All test files alongside implementation
- `e2e/tier-upgrade-request-system.spec.ts` - Complete E2E suite
- `scripts/seed-test-data.ts` - Test data generation

## Team Coordination

### Roles and Responsibilities

**Backend Engineer:**
- Database schema design and migration
- API endpoint implementation
- Service layer business logic
- Backend unit and integration tests

**Frontend Engineer:**
- UI component implementation
- Form validation and state management
- Integration with backend APIs
- Frontend unit and E2E tests

**Tech Lead:**
- Code review (all PRs)
- Architecture decisions
- Unblocking technical issues
- Performance validation

### Communication

**Daily standups:**
- Progress updates
- Blockers identification
- Cross-team dependencies

**Weekly demos:**
- Show working features
- Gather feedback
- Adjust priorities

**Code reviews:**
- All PRs require approval before merge
- Review within 24 hours
- Focus on correctness, security, maintainability

### Dependencies

**Backend → Frontend:**
- API contracts must be finalized before frontend work starts
- Use OpenAPI/TypeScript types for contract definition
- Mock API responses for parallel development if needed

**Both → Testing:**
- Both backend and frontend must be complete before E2E tests
- Unit tests can be written in parallel with implementation

## Branch Strategy

### Main branches:
- `main` - Production-ready code
- `develop` - Integration branch (not used for this feature)

### Feature branch:
```
feature/tier-upgrade-request-system
```

**Branch workflow:**
1. Create feature branch from `main`
2. All work happens in feature branch
3. Create sub-branches for parallel work:
   - `feature/tier-upgrade-request-system-backend`
   - `feature/tier-upgrade-request-system-frontend`
4. Merge sub-branches to feature branch via PR
5. Merge feature branch to `main` when complete

**Commit conventions:**
```
feat: Add tier upgrade request API endpoints
fix: Prevent duplicate pending requests
test: Add E2E tests for vendor tier upgrade flow
docs: Update API documentation for tier upgrade
refactor: Extract tier validation logic to service
```

## Code Review Guidelines

### All PRs must:
- Pass CI checks (tests, linting, type checking)
- Have clear description and screenshots (for UI changes)
- Reference related issues/tasks
- Be reviewed by at least 1 team member
- Have no merge conflicts

### Review checklist:
- [ ] Code follows project conventions
- [ ] Tests are included and passing
- [ ] Security concerns addressed
- [ ] Performance implications considered
- [ ] Documentation updated
- [ ] No breaking changes (or properly communicated)

### PR sizes:
- Keep PRs small (<500 lines changed)
- Split large features into multiple PRs
- Each PR should be independently reviewable

## Milestone Definitions

### M1: Backend Complete (Day 5)
**Deliverables:**
- ✅ Database schema implemented
- ✅ All API endpoints working
- ✅ Service layer complete
- ✅ Backend tests passing (80%+ coverage)
- ✅ API documentation complete

**Acceptance criteria:**
- Can create tier upgrade request via API
- Can list, approve, reject requests via API
- All auth/authz checks working
- No critical bugs

**Blockers cleared for:** Frontend development

### M2: Vendor UI Complete (Day 8)
**Deliverables:**
- ✅ Vendor dashboard components implemented
- ✅ Request submission form working
- ✅ Status display showing correctly
- ✅ Frontend tests passing
- ✅ E2E tests for vendor flow passing

**Acceptance criteria:**
- Vendor can submit tier upgrade request from dashboard
- Vendor can see request status
- Vendor can cancel pending request
- All UI states handled (loading, error, success)

**Blockers cleared for:** Admin UI development (can be parallel)

### M3: Admin UI Complete (Day 10)
**Deliverables:**
- ✅ Admin Payload components implemented
- ✅ Request management interface working
- ✅ Approval/rejection flow complete
- ✅ E2E tests for admin flow passing

**Acceptance criteria:**
- Admin can view all tier upgrade requests
- Admin can filter/sort requests
- Admin can approve/reject with comments
- Vendor tier updates correctly on approval

**Blockers cleared for:** Full system testing

### M4: Testing Complete, Ready for Staging (Day 12)
**Deliverables:**
- ✅ All unit tests passing
- ✅ All integration tests passing
- ✅ All E2E tests passing
- ✅ Code coverage >80%
- ✅ Performance tests passing
- ✅ Security review complete
- ✅ Documentation complete

**Acceptance criteria:**
- Complete user journeys work end-to-end
- No critical or high-severity bugs
- All quality gates passed
- Staging deployment successful

**Blockers cleared for:** Production deployment

## Risk Mitigation

### Technical risks:
1. **Race condition on duplicate requests**
   - Mitigation: Use database unique constraint + transaction isolation

2. **Partial tier update on approval failure**
   - Mitigation: Atomic transaction (update tier + request status together)

3. **Payload CMS upgrade breaking changes**
   - Mitigation: Lock Payload version, test upgrades in isolation

### Process risks:
1. **Backend delays blocking frontend**
   - Mitigation: Define API contracts early, use mocks for parallel work

2. **Scope creep delaying delivery**
   - Mitigation: Strict MVP definition, defer enhancements to Phase 2

3. **Insufficient testing coverage**
   - Mitigation: Write tests alongside implementation, enforce coverage gates

## Definition of Done

A feature is "done" when:
- ✅ Code is merged to feature branch
- ✅ All tests passing (unit, integration, E2E)
- ✅ Code reviewed and approved
- ✅ Documentation updated
- ✅ No critical bugs
- ✅ Performance acceptable
- ✅ Security review passed
- ✅ Product owner acceptance

## Deployment Strategy

### Staging deployment:
1. Merge feature branch to `main`
2. Deploy to staging environment
3. Run smoke tests
4. QA validation
5. Stakeholder demo

### Production deployment:
1. Final QA sign-off
2. Deploy during low-traffic window
3. Monitor error rates and performance
4. Rollback plan ready (revert commit)
5. Post-deployment validation

### Rollback criteria:
- Error rate >1%
- P95 latency >2s
- Critical bug discovered
- Data integrity issue

## Post-Launch

### Week 1 monitoring:
- Track request submission rate
- Monitor approval/rejection metrics
- Collect user feedback
- Fix critical bugs

### Week 2-4 enhancements:
- Implement Phase 2 features
- Address user feedback
- Performance optimization
- Analytics integration

### Long-term maintenance:
- Monthly review of metrics
- Quarterly feature updates
- Security patches as needed
- Documentation updates
