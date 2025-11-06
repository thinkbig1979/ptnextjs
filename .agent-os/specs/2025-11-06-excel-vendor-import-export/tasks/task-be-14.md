# Task BE-14: Integration Tests for API Routes

**Status:** 🔒 Blocked (waiting for BE-9,BE-10,BE-11,BE-12)
**Agent:** test-architect
**Estimated Time:** 6 hours
**Phase:** Backend Implementation
**Dependencies:** BE-9, BE-10, BE-11, BE-12

## Objective

Create integration tests for all Excel import/export API endpoints.

## Context Requirements

- Review API route implementations (BE-9 through BE-12)
- Review Next.js API testing patterns
- Review authentication testing patterns

## Acceptance Criteria

- [ ] Integration tests for excel-template route (BE-9)
- [ ] Integration tests for excel-export route (BE-10)
- [ ] Integration tests for excel-import route (BE-11)
- [ ] Integration tests for import-history route (BE-12)
- [ ] Test authentication and authorization
- [ ] Test with actual database (test environment)
- [ ] Test multipart file uploads
- [ ] Test error scenarios
- [ ] Tests clean up after themselves

## Detailed Specifications

### Test Files Structure

```
__tests__/app/api/portal/vendors/
├── excel-template.test.ts
├── excel-export.test.ts
├── excel-import.test.ts
└── import-history.test.ts
```

### Test Scenarios Per Route

**Excel Template (BE-9):**
- Download template successfully
- Reject unauthenticated requests
- Reject unauthorized vendors
- Generate tier-appropriate templates
- Correct file headers

**Excel Export (BE-10):**
- Export vendor data successfully
- Tier-appropriate field export
- Authentication/authorization
- Correct file format

**Excel Import (BE-11):**
- Preview phase validation
- Execute phase import
- Tier 2+ restriction enforcement
- File size limits
- Parse errors
- Validation errors
- Successful import

**Import History (BE-12):**
- Retrieve import history
- Pagination
- Filtering by status
- Authorization

## Testing Requirements

```bash
npm test -- api/portal/vendors
```

## Evidence Requirements

- [ ] All test files created
- [ ] All tests passing
- [ ] Tests use test database
- [ ] Cleanup happens correctly

## Success Metrics

- All API endpoints tested
- >80% code coverage for routes
- Tests run reliably
- No database pollution between tests
