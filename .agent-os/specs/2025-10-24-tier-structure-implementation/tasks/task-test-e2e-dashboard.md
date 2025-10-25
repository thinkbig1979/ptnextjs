# Task TEST-E2E-DASHBOARD: E2E Test for Vendor Dashboard Editing Workflow

**ID**: test-e2e-dashboard
**Title**: End-to-end test for complete vendor dashboard editing workflow
**Agent**: quality-assurance
**Estimated Time**: 2 hours
**Dependencies**: integ-frontend-backend
**Phase**: 4 - Frontend-Backend Integration

## Context Requirements

Read these files:
- @.agent-os/specs/2025-10-24-tier-structure-implementation/spec.md (User Stories section)
- @app/portal/dashboard/page.tsx - Dashboard implementation
- Existing Playwright tests in __tests__/e2e/

## Objectives

1. Create Playwright E2E test for full vendor dashboard workflow
2. Test authentication and navigation to dashboard
3. Test editing basic info and saving
4. Test adding certification (array manager CRUD)
5. Test tier-restricted field access (Free tier cannot edit Brand Story)
6. Test computed field display (foundedYear → yearsInBusiness)
7. Test location limit enforcement
8. Test form validation and error handling

## Acceptance Criteria

- [ ] E2E test file created at __tests__/e2e/vendor-dashboard.spec.ts
- [ ] Test: Login as vendor user
- [ ] Test: Navigate to /portal/dashboard
- [ ] Test: Edit Basic Info (company name, description), click Save, verify success
- [ ] Test: Switch to Locations tab, verify tier limit enforced
- [ ] Test: Switch to Brand Story tab (Tier 1+), edit foundedYear, verify yearsInBusiness updates
- [ ] Test: Switch to Certifications tab, add certification, verify saved
- [ ] Test: Free tier user sees upgrade prompt on Brand Story tab
- [ ] Test: Validation errors display correctly (invalid email, year out of range)
- [ ] Test: Logout
- [ ] All assertions pass
- [ ] Test runs in CI environment

## Testing Requirements

- Run Playwright test in headed mode (verify UI)
- Run test in headless mode (CI compatibility)
- Test passes consistently (no flaky tests)
- Screenshot on failure for debugging

## Evidence Requirements

- __tests__/e2e/vendor-dashboard.spec.ts
- Playwright test execution report (HTML)
- Screenshots of test steps
- Test passing in CI (if applicable)
