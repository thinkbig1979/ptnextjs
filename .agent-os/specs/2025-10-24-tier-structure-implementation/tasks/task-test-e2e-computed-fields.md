# Task TEST-E2E-COMPUTED-FIELDS: E2E Test for Years in Business Computation

**ID**: test-e2e-computed-fields
**Title**: End-to-end test for years in business computed field accuracy
**Agent**: quality-assurance
**Estimated Time**: 45 minutes
**Dependencies**: test-e2e-public-profile
**Phase**: 4 - Frontend-Backend Integration

## Context Requirements

Read these files:
- @.agent-os/specs/2025-10-24-tier-structure-implementation/sub-specs/technical-spec.md (lines 1373-1387, 1420-1431) - Computed field specification
- @lib/services/VendorComputedFieldsService.ts - Backend computation
- @components/vendors/YearsInBusinessDisplay.tsx - Frontend display

## Objectives

1. Create E2E test for computed field accuracy
2. Test foundedYear input triggers yearsInBusiness calculation
3. Test edge cases (null, future year, year 1800)
4. Verify computation matches between dashboard and public profile
5. Test computation updates immediately after save

## Acceptance Criteria

- [ ] E2E test file created at __tests__/e2e/computed-fields.spec.ts
- [ ] Test: Login as Tier 1 vendor
- [ ] Test: Navigate to Brand Story tab
- [ ] Test: Enter foundedYear: 2010
- [ ] Test: Verify yearsInBusiness displays "15 years" (assuming current year 2025)
- [ ] Test: Save form
- [ ] Test: Visit public profile
- [ ] Test: Verify yearsInBusiness badge shows "15 years"
- [ ] Test: Edit foundedYear to null
- [ ] Test: Verify yearsInBusiness shows "Not specified"
- [ ] Test: Edit foundedYear to future year (2030)
- [ ] Test: Verify yearsInBusiness shows "Not specified" or error
- [ ] Test: Edit foundedYear to 1800
- [ ] Test: Verify yearsInBusiness shows "225 years"
- [ ] All assertions pass

## Testing Requirements

- Test computation accuracy (2025 - 2010 = 15)
- Test edge cases handled gracefully
- Test synchronization between dashboard and public profile
- Test updates immediately visible after save

## Evidence Requirements

- __tests__/e2e/computed-fields.spec.ts
- Test execution report
- Screenshots showing computed values
- Test passing results
