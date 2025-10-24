# Task: TEST-BACKEND-SCHEMA - Backend Schema Test Design

## Task Metadata
- **Task ID**: TEST-BACKEND-SCHEMA
- **Phase**: Phase 2 - Backend Implementation
- **Agent**: test-architect
- **Estimated Time**: 20-25 minutes
- **Dependencies**: PRE-2
- **Status**: [ ] Not Started

## Task Description
Design comprehensive test suite for Payload CMS vendors collection schema modifications. Create tests for locations array field validation, HQ uniqueness enforcement, tier-based access control, and data integrity constraints before implementation begins.

## Specifics
- **Test Files to Create**:
  - `/home/edwin/development/ptnextjs/__tests__/payload/collections/vendors-locations-schema.test.ts`
  - `/home/edwin/development/ptnextjs/__tests__/payload/hooks/vendors-locations-hooks.test.ts`

- **Key Requirements**:
  - Test locations array field validation (required fields, data types, ranges)
  - Test HQ uniqueness constraint (exactly one location with isHQ: true)
  - Test tier-based access control (tier 0/1 cannot have multiple locations)
  - Test coordinate range validation (-90 to 90 lat, -180 to 180 long)
  - Test address field max length validation (500 chars)
  - Test city/country field max length validation (255 chars)
  - Test auto-designation of first location as HQ

- **Technical Details**:
  - Use Jest as test framework
  - Mock Payload CMS instance for isolated testing
  - Test both valid and invalid data scenarios
  - Test validation hooks (beforeChange, validate functions)
  - Test field-level access control for tier restrictions
  - Test migration compatibility (old location → new locations)

## Acceptance Criteria
- [ ] Test file created with comprehensive test cases
- [ ] All validation rules have corresponding tests (11+ test cases)
- [ ] HQ uniqueness tests cover edge cases (no HQ, multiple HQ, single HQ)
- [ ] Tier restriction tests cover all tier combinations (free, tier1, tier2)
- [ ] Coordinate validation tests include boundary values and out-of-range values
- [ ] String length validation tests include edge cases (empty, max length, over limit)
- [ ] Hook tests verify auto-HQ designation for first location
- [ ] Tests are runnable (can execute with npm run test)

## Testing Requirements
- **Functional Testing**: Tests should cover all validation logic from technical spec
- **Manual Verification**: Review tests against database-schema.md requirements
- **Browser Testing**: N/A (backend testing only)
- **Error Testing**: Tests should verify proper error messages for validation failures

## Evidence Required
- Test file with complete test suite including:
  - Test descriptions documenting what each test validates
  - Mock data for valid and invalid scenarios
  - Assertions for expected validation outcomes
  - Test for HQ uniqueness: `expect(() => validateLocations([...multipleHQ])).toThrow('Only one location can be designated as Headquarters')`
  - Test for tier restriction: `expect(() => updateVendor({ tier: 'tier1', locations: [loc1, loc2] })).toThrow('Multiple locations require Tier 2 subscription')`
  - Test output showing all tests pass (after implementation)

## Context Requirements
- Database schema from @.agent-os/specs/2025-10-22-multi-location-support/sub-specs/database-schema.md
- Technical spec validation requirements
- Existing Payload CMS test patterns in codebase
- Jest configuration and setup files

## Implementation Notes
- Write tests first (TDD approach) before schema implementation
- Use descriptive test names that document requirements
- Group related tests using describe blocks
- Mock Payload CMS methods to isolate validation logic
- Include both positive tests (valid data passes) and negative tests (invalid data fails)

## Quality Gates
- [ ] All validation rules from database-schema.md have test coverage
- [ ] Tests follow existing Jest patterns in codebase
- [ ] Test file has proper TypeScript types and imports
- [ ] Tests can be executed with npm run test command

## Related Files
- Spec: @.agent-os/specs/2025-10-22-multi-location-support/spec.md
- Database Schema: @.agent-os/specs/2025-10-22-multi-location-support/sub-specs/database-schema.md
- Related Tasks: IMPL-BACKEND-SCHEMA, IMPL-BACKEND-MIGRATION
