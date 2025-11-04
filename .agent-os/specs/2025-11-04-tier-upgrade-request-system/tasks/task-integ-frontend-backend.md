# Task: integ-frontend-backend - Connect Frontend to Backend APIs

## Task Metadata
- **Task ID**: integ-frontend-backend
- **Phase**: Phase 4: Frontend-Backend Integration
- **Agent**: integration-coordinator
- **Estimated Time**: 20-25 minutes
- **Dependencies**: [integ-api-contract]
- **Status**: [ ] Not Started

## Task Description
Integrate frontend components with backend API endpoints, ensuring proper data flow, error handling, and state management across the full stack.

## Specifics
- **Files to Create/Modify**:
  - `components/dashboard/TierUpgradeRequestForm.tsx` (modify API integration)
  - `components/dashboard/UpgradeRequestStatusCard.tsx` (modify API integration)
  - `app/(site)/vendor/dashboard/subscription/page.tsx` (modify data fetching)

- **Key Requirements**:
  - Connect form submission to POST /api/portal/vendors/[id]/tier-upgrade-request
  - Connect status display to GET /api/portal/vendors/[id]/tier-upgrade-request
  - Connect cancel action to DELETE /api/portal/vendors/[id]/tier-upgrade-request/[requestId]
  - Implement proper error handling for all API calls
  - Handle authentication errors and redirects
  - Implement optimistic UI updates where appropriate

- **Technical Details**:
  - Use Next.js fetch with proper headers
  - Handle 401, 403, 409, 500 status codes appropriately
  - Implement toast notifications for all outcomes
  - Use React Server Components for initial data fetch
  - Use client-side fetch for mutations

## Acceptance Criteria
- [ ] Form submission successfully creates request in backend
- [ ] Status card displays request data from backend
- [ ] Cancel action successfully updates backend and UI
- [ ] Error responses are handled gracefully
- [ ] Authentication errors redirect to login
- [ ] Duplicate request (409) shows appropriate message
- [ ] Loading states are displayed during API calls
- [ ] All API calls use correct endpoints and headers

## Testing Requirements
- **Integration Testing**:
  - Form submission creates request in database
  - Status display shows correct request data
  - Cancel action removes request from database
  - Error handling works for all error types
- **Manual Verification**:
  - Complete user flow from form to status display
  - Test all error scenarios
  - Verify data consistency

## Evidence Required
- Successful form submission with network logs
- Status display showing real backend data
- Cancel action with before/after database state
- Error handling demonstration for each error type

## Context Requirements
- API Specification from @.agent-os/specs/2025-11-04-tier-upgrade-request-system/sub-specs/api-spec.md
- Frontend component implementations
- Backend API endpoint implementations
- Authentication flow documentation

## Implementation Notes
- Test with real backend running
- Use development database for integration testing
- Verify error messages match API specification
- Ensure data transformations match TypeScript types
- Test with various user roles (vendor, admin)

## Quality Gates
- [ ] All API calls succeed with valid data
- [ ] All error cases are handled appropriately
- [ ] No data inconsistencies between frontend and backend
- [ ] Network waterfall is optimized (no unnecessary requests)
- [ ] Security headers are properly set

## Related Files
- Spec: @.agent-os/specs/2025-11-04-tier-upgrade-request-system/spec.md
- API Spec: @.agent-os/specs/2025-11-04-tier-upgrade-request-system/sub-specs/api-spec.md
- Frontend Components: components/dashboard/TierUpgradeRequestForm.tsx, UpgradeRequestStatusCard.tsx
- Backend APIs: app/api/portal/vendors/[id]/tier-upgrade-request/route.ts
