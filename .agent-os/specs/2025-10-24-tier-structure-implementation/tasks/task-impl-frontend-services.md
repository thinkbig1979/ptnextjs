# Task IMPL-FRONTEND-SERVICES: Implement Frontend Tier Validation Utilities

**ID**: impl-frontend-services
**Title**: Implement frontend tier validation utilities and hooks
**Agent**: frontend-react-specialist
**Estimated Time**: 1 hour
**Dependencies**: impl-frontend-contexts
**Phase**: 3 - Frontend Implementation

## Context Requirements

Read these files:
- @lib/constants/tiers.ts - Tier configuration from backend
- @lib/services/TierValidationService.ts - Backend validation (for reference)
- Test specifications from task-test-frontend-ui.md

## Objectives

1. Create client-side tier configuration (lib/constants/tierConfig.ts)
2. Implement useVendorProfile() hook for fetching vendor data
3. Implement useFieldAccess(fieldName) hook for component-level access checks
4. Create Zod validation schemas for all forms (lib/validation/vendorSchemas.ts)
5. Implement form validation utilities
6. Create computed field utilities (computeYearsInBusiness client-side)
7. Create API client functions for vendor endpoints

## Acceptance Criteria

- [ ] Tier configuration constants match backend (4 tiers, location limits, features)
- [ ] useVendorProfile(slug) hook fetches and caches vendor data via SWR
- [ ] useFieldAccess(fieldName) hook returns boolean based on current tier
- [ ] Zod schemas defined for BasicInfoForm
- [ ] Zod schemas defined for BrandStoryForm
- [ ] Zod schemas defined for all array managers (certifications, awards, etc.)
- [ ] Client-side yearsInBusiness computation matches backend logic
- [ ] API client functions typed with request/response interfaces
- [ ] All utilities have TypeScript types
- [ ] Unit tests for validation schemas and utilities

## Testing Requirements

- Test useVendorProfile with mocked API responses
- Test useFieldAccess with different tier levels
- Test Zod schema validation for valid and invalid inputs
- Test computed field calculation edge cases
- Test API client error handling

## Evidence Requirements

- lib/constants/tierConfig.ts
- lib/hooks/useVendorProfile.ts
- lib/hooks/useFieldAccess.ts
- lib/validation/vendorSchemas.ts
- lib/utils/computedFields.ts
- lib/api/vendorClient.ts
- Test files
- Test execution results
