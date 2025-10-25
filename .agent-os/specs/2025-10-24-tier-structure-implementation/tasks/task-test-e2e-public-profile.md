# Task TEST-E2E-PUBLIC-PROFILE: E2E Test for Public Profile Display at Each Tier

**ID**: test-e2e-public-profile
**Title**: End-to-end test for public vendor profile display across all tiers
**Agent**: quality-assurance
**Estimated Time**: 1.5 hours
**Dependencies**: test-e2e-dashboard
**Phase**: 4 - Frontend-Backend Integration

## Context Requirements

Read these files:
- @.agent-os/specs/2025-10-24-tier-structure-implementation/spec.md (Public Profile Display user story)
- @app/vendors/[slug]/page.tsx - Public profile implementation

## Objectives

1. Create Playwright E2E test for public vendor profiles
2. Test Free tier vendor profile (basic info only)
3. Test Tier 1 vendor profile (extended sections visible)
4. Test Tier 2 vendor profile (products section visible)
5. Test Tier 3 vendor profile (editorial content, featured badge)
6. Verify tier-appropriate field visibility
7. Verify computed fields display
8. Test responsive layout

## Acceptance Criteria

- [ ] E2E test file created at __tests__/e2e/vendor-profile-tiers.spec.ts
- [ ] Test: Visit Free tier vendor profile (/vendors/free-vendor-slug)
- [ ] Test: Verify only basic sections visible (About, Locations with 1 HQ)
- [ ] Test: Verify Brand Story, Certifications sections NOT visible
- [ ] Test: Visit Tier 1 vendor profile
- [ ] Test: Verify extended sections visible (Certifications, Awards, Case Studies, Team)
- [ ] Test: Verify yearsInBusiness badge present
- [ ] Test: Verify max 3 locations displayed
- [ ] Test: Visit Tier 2 vendor profile
- [ ] Test: Verify Products section visible
- [ ] Test: Verify all locations displayed (unlimited)
- [ ] Test: Visit Tier 3 vendor profile
- [ ] Test: Verify featured badge present
- [ ] Test: Verify editorial content section visible
- [ ] Test: Responsive layout (mobile view collapses correctly)
- [ ] All assertions pass

## Testing Requirements

- Run test for all 4 tier levels
- Verify section visibility matches tier
- Test responsive breakpoints (mobile, tablet, desktop)
- Test passes consistently

## Evidence Requirements

- __tests__/e2e/vendor-profile-tiers.spec.ts
- Playwright test execution report
- Screenshots of each tier profile
- Test passing results
