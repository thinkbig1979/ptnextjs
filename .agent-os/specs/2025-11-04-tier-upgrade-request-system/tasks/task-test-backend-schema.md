# Task: test-backend-schema - Design Database Schema Tests

## Task Metadata
- **Task ID**: test-backend-schema
- **Phase**: Phase 2: Backend Implementation
- **Agent**: test-architect
- **Estimated Time**: 15-20 minutes
- **Dependencies**: [pre-2]
- **Status**: [x] Complete
- **Beads Reference**: ptnextjs-bbec

## Task Description
Design comprehensive test suite for the TierUpgradeRequests database schema, ensuring all fields, relationships, constraints, and indexes are properly validated.

## Specifics
- **Files to Create/Modify**:
  - `__tests__/payload/collections/TierUpgradeRequests.test.ts`

- **Key Requirements**:
  - Test all field types and validations
  - Test relationship with vendors and users collections
  - Test status enum constraints
  - Test index effectiveness
  - Test cascade delete behavior

- **Technical Details**:
  - Use Payload CMS test utilities
  - Mock vendor and user data
  - Test beforeChange hooks (tier validation)
  - Verify database constraints

## Acceptance Criteria
- [ ] Schema creation test written
- [ ] Field validation tests cover all fields
- [ ] Relationship tests verify vendor/user connections
- [ ] Index tests verify query performance
- [ ] Cascade delete test verifies data integrity
- [ ] Hook tests verify tier validation logic
- [ ] All tests pass

## Testing Requirements
- **Unit Tests**: Schema validation, field constraints, relationships
- **Integration Tests**: Hook execution, cascade behavior
- **Test Coverage**: >90% of collection configuration

## Evidence Required
- Test file created at specified path
- Test execution output showing all tests passing
- Coverage report showing >90% coverage

## Context Requirements
- Technical specification from @.agent-os/specs/2025-11-04-tier-upgrade-request-system/sub-specs/technical-spec.md (Database Schema section)
- Payload CMS testing documentation
- Existing collection test patterns

## Implementation Notes
- Follow existing test patterns in `__tests__/payload/collections/`
- Use Payload local API for test execution
- Mock external dependencies (vendor/user lookups)
- Test edge cases (duplicate pending requests, invalid tier transitions)

## Quality Gates
- [ ] Tests follow project testing conventions
- [ ] Tests are deterministic and can run in isolation
- [ ] Test names clearly describe what is being tested
- [ ] Edge cases are covered

## Related Files
- Spec: @.agent-os/specs/2025-11-04-tier-upgrade-request-system/spec.md
- Technical Spec: @.agent-os/specs/2025-11-04-tier-upgrade-request-system/sub-specs/technical-spec.md (lines 1060-1303)
- Beads Issue: ptnextjs-bbec (Backend implementation)
