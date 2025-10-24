# Task TEST-FRONTEND-UI: Design Frontend UI Test Suite

**ID**: test-frontend-ui
**Title**: Design comprehensive UI test suite for dashboard and public profiles
**Agent**: test-architect
**Estimated Time**: 2 hours
**Dependencies**: test-backend-integration
**Phase**: 3 - Frontend Implementation

## Context Requirements

Read these files:
- @.agent-os/specs/2025-10-24-tier-structure-implementation/sub-specs/technical-spec.md (lines 621-1276) - Full frontend specification
- Existing test files in __tests__/components/
- @components/ui/*.tsx - shadcn component examples

## Objectives

1. Design test suite for all dashboard components (20+ components)
2. Create test specifications for form validation and submission
3. Design tests for tier-aware UI visibility (upgrade prompts, locked fields)
4. Create test specifications for computed field display (YearsInBusinessDisplay)
5. Design tests for array managers (CRUD operations for certifications, awards, etc.)
6. Create test specifications for public profile tier-responsive sections
7. Design tests for VendorCard with tier badges
8. Create accessibility tests for all interactive components
9. Design responsive layout tests (mobile, tablet, desktop)
10. Create test fixtures and mock data for all tier levels

## Acceptance Criteria

- [ ] Test specifications for all 15+ dashboard form components
- [ ] Test specifications for tier-aware field visibility
- [ ] Test specifications for upgrade prompt interactions
- [ ] Test specifications for array CRUD operations
- [ ] Test specifications for computed field calculations (client-side)
- [ ] Test specifications for public profile sections at each tier
- [ ] Test specifications for VendorCard variants
- [ ] Accessibility test specifications (WCAG 2.1 AA)
- [ ] Responsive layout test specifications (3 breakpoints)
- [ ] Mock data fixtures for Free, Tier 1, Tier 2, Tier 3 vendors
- [ ] Component test templates (React Testing Library)
- [ ] Visual regression test specifications (optional)

## Testing Requirements

N/A (this task designs tests)

## Evidence Requirements

- Frontend test specification document (markdown)
- Component test file templates
- Mock data fixtures (TypeScript files)
- Test coverage plan showing all components
- Accessibility test checklist
