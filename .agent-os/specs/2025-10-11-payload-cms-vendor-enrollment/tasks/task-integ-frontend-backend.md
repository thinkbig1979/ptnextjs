# Task: integ-frontend-backend - Integrate Frontend with Backend APIs

## Task Metadata
- **Task ID**: integ-frontend-backend
- **Phase**: Phase 4: Frontend-Backend Integration
- **Agent**: integration-coordinator
- **Estimated Time**: 30-40 minutes
- **Dependencies**: [integ-api-contract]
- **Status**: [ ] Not Started

## Task Description
Connect all frontend components to actual backend API endpoints, replacing any mock data or stub implementations. Verify data flows correctly from UI → API → Database and back.

## Specifics
- **Integration Points**:
  - VendorRegistrationForm → POST /api/vendors/register
  - VendorLoginForm → POST /api/auth/login (via AuthContext)
  - VendorProfileEditor → GET /api/vendors/{id}, PUT /api/vendors/{id}
  - AdminApprovalQueue → GET /api/admin/vendors/pending, POST approve/reject
  - Public pages → PayloadCMSDataService → Payload CMS collections
- **Data Flow Verification**:
  - Registration form submission creates user and vendor in database
  - Login form updates AuthContext and stores JWT cookie
  - Profile editor loads data from API and saves updates
  - Admin approval updates database status and publishes vendor
  - Public pages display migrated content from Payload CMS
- **Error Handling**:
  - Network errors show toast notifications
  - Validation errors display inline in forms
  - Authentication errors redirect to login
  - 403 errors show appropriate "upgrade tier" or "admin only" messages

## Acceptance Criteria
- [ ] All frontend components connected to backend APIs
- [ ] No mock data or stub implementations remaining
- [ ] Registration form creates records in database
- [ ] Login form authenticates and updates AuthContext
- [ ] Profile editor loads and saves data correctly
- [ ] Admin approval queue functional with real API calls
- [ ] Public pages display migrated Payload CMS content
- [ ] Error handling works correctly for all scenarios
- [ ] Loading states display during API calls
- [ ] Success/error toast notifications appear

## Testing Requirements
- Manual verification: Complete registration → approval → login → profile edit flow
- Browser DevTools: Verify API calls made with correct payloads
- Database verification: Check records created/updated in database
- Error scenario testing: Test network failure, validation errors, authentication errors

## Evidence Required
- Screenshots of successful API calls in browser DevTools
- Database screenshots showing created records
- Video walkthrough of complete user workflow

## Related Files
- All frontend components in `/components/vendor/` and `/components/admin/`
- All API routes in `/app/api/`
