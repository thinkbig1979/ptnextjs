# Task: test-e2e-workflow - End-to-End User Workflow Testing with Playwright

## Task Metadata
- **Task ID**: test-e2e-workflow
- **Phase**: Phase 4: Frontend-Backend Integration
- **Agent**: test-architect
- **Estimated Time**: 40-50 minutes
- **Dependencies**: [integ-frontend-backend]
- **Status**: [ ] Not Started

## Task Description
Create and execute comprehensive E2E tests using Playwright covering complete user workflows: vendor registration → admin approval → vendor login → profile editing → tier restrictions.

## Specifics
- **E2E Test Files to Create**:
  - `__tests__/e2e/vendor-registration-flow.spec.ts` - Complete registration flow
  - `__tests__/e2e/admin-approval-flow.spec.ts` - Admin approval workflow
  - `__tests__/e2e/vendor-dashboard-flow.spec.ts` - Vendor dashboard and profile editing
  - `__tests__/e2e/tier-restriction-flow.spec.ts` - Tier-based access control validation
- **Critical E2E Scenarios**:
  1. **Vendor Registration Flow**:
     - Navigate to /vendor/register
     - Fill form with valid data
     - Submit registration
     - Verify redirect to /vendor/registration-pending
     - Verify user and vendor created in database (status='pending')
  2. **Admin Approval Flow**:
     - Login as admin
     - Navigate to /admin/vendors/pending
     - See pending vendor in list
     - Click approve
     - Confirm approval
     - Verify vendor removed from pending list
     - Verify database status updated to 'approved'
  3. **Vendor Login and Profile Edit Flow**:
     - Navigate to /vendor/login
     - Login with approved vendor credentials
     - Verify redirect to /vendor/dashboard
     - Navigate to /vendor/dashboard/profile
     - Edit profile fields (basic info)
     - Save changes
     - Verify success toast and data persistence
  4. **Tier Restriction Enforcement**:
     - Login as free tier vendor
     - Navigate to profile editor
     - Verify tier1+ fields are hidden
     - Attempt API call to update tier1+ field (should fail with 403)
     - Login as tier1 vendor
     - Verify tier1+ fields are visible and editable
- **Test Environment Setup**:
  - Use test database (SQLite or PostgreSQL test instance)
  - Seed database with test admin user
  - Clean database before each test run
  - Generate test data (vendors, products) as needed

## Acceptance Criteria
- [ ] All 4 E2E test files created and functional
- [ ] Vendor registration flow test passes (registration → pending state)
- [ ] Admin approval flow test passes (pending → approved)
- [ ] Vendor login and profile edit flow test passes (login → edit → save)
- [ ] Tier restriction enforcement test passes (free vs tier1 access)
- [ ] Tests run reliably without flakiness
- [ ] Screenshots/videos captured for critical steps
- [ ] Test database properly seeded and cleaned
- [ ] All tests pass in CI/CD pipeline (if applicable)

## Testing Requirements
- **E2E Test Execution**:
  - Run Playwright tests: `npx playwright test`
  - Generate test report: `npx playwright show-report`
  - Run tests in headed mode for debugging: `npx playwright test --headed`
- **Browser Coverage**: Test in Chromium, Firefox, WebKit (Playwright defaults)
- **Test Data**: Create reusable test fixtures for users and vendors

## Evidence Required
- Playwright test report showing all tests passing
- Screenshots/videos of critical workflow steps
- Test coverage report (if available)

## Context Requirements
- Playwright installation and configuration
- Test database setup and seeding scripts
- Understanding of complete user workflows from spec
- Knowledge of Playwright API and selectors

## Implementation Notes
- Use Playwright's built-in fixtures for browser automation
- Implement page object pattern for maintainable tests
- Use data-testid attributes in components for reliable selectors
- Implement wait strategies for async operations
- Capture screenshots on test failures for debugging
- Run tests in parallel for faster execution

## Quality Gates
- [ ] All E2E tests pass reliably
- [ ] Tests complete within reasonable time (< 5 minutes total)
- [ ] No flaky tests (tests pass consistently)
- [ ] Critical user workflows fully covered

## Related Files
- Technical Spec: User Flow & Interaction Patterns section
- All frontend pages and components
- Test database seeding scripts
