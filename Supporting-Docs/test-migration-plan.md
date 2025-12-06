# Test Directory Structure Migration Plan

**Date**: 2025-12-06
**Status**: READY FOR EXECUTION
**Estimated Effort**: 7-10 hours
**Risk Level**: Medium

---

## Overview

This document outlines the plan to migrate tests to a consistent structure:
- **Unit tests**: Colocated with source files
- **Integration tests**: Centralized in `__tests__/integration/`
- **E2E tests**: Consolidated in `tests/e2e/`

**Goal**: Make tests easy to find, write, and maintain.

---

## Migration Phases

### Phase 1: Consolidate E2E Tests (PRIORITY 1)
**Estimated Effort**: 1-2 hours
**Risk**: Low
**Files to Move**: 5 files

#### Action Items

Move all E2E tests from `e2e/` to `tests/e2e/`:

```bash
# Move Excel-related E2E tests
mv e2e/excel-export.spec.ts tests/e2e/
mv e2e/excel-import-happy-path.spec.ts tests/e2e/
mv e2e/excel-import-tier-restrictions.spec.ts tests/e2e/
mv e2e/excel-import-validation-errors.spec.ts tests/e2e/
mv e2e/excel-template-download.spec.ts tests/e2e/

# Remove empty directory
rmdir e2e/
```

#### Files Being Moved

1. `e2e/excel-export.spec.ts` → `tests/e2e/excel-export.spec.ts`
2. `e2e/excel-import-happy-path.spec.ts` → `tests/e2e/excel-import-happy-path.spec.ts`
3. `e2e/excel-import-tier-restrictions.spec.ts` → `tests/e2e/excel-import-tier-restrictions.spec.ts`
4. `e2e/excel-import-validation-errors.spec.ts` → `tests/e2e/excel-import-validation-errors.spec.ts`
5. `e2e/excel-template-download.spec.ts` → `tests/e2e/excel-template-download.spec.ts`

#### Verification Steps

```bash
# Run E2E tests to ensure they still work
npm run test:e2e

# Verify Playwright finds all tests
npx playwright test --list
```

#### Impact
- No code changes required
- All E2E tests now in one location
- Playwright config already points to `tests/e2e/`

---

### Phase 2: Colocate Component Tests (PRIORITY 2)
**Estimated Effort**: 3-4 hours
**Risk**: Medium
**Files to Move**: 15 files

#### Action Items

Move component tests from `__tests__/components/` to be colocated with their source components:

##### Dashboard Components (8 files)
```bash
mv __tests__/components/dashboard/ExcelExportCard.test.tsx \
   components/dashboard/ExcelExportCard.test.tsx

mv __tests__/components/dashboard/ExcelImportCard.test.tsx \
   components/dashboard/ExcelImportCard.test.tsx

mv __tests__/components/dashboard/ExcelPreviewDialog.test.tsx \
   components/dashboard/ExcelPreviewDialog.test.tsx

mv __tests__/components/dashboard/ImportHistoryCard.test.tsx \
   components/dashboard/ImportHistoryCard.test.tsx

mv __tests__/components/dashboard/LocationFormFields.test.tsx \
   components/dashboard/LocationFormFields.test.tsx

mv __tests__/components/dashboard/LocationsManagerCard.test.tsx \
   components/dashboard/LocationsManagerCard.test.tsx

mv __tests__/components/dashboard/ProfileEditTabs.test.tsx \
   components/dashboard/ProfileEditTabs.test.tsx

mv __tests__/components/dashboard/ValidationErrorsTable.test.tsx \
   components/dashboard/ValidationErrorsTable.test.tsx
```

##### UI Components (2 files)
```bash
mv __tests__/components/ui/GeocodingButton.test.tsx \
   components/ui/GeocodingButton.test.tsx

mv __tests__/components/ui/TierGate.test.tsx \
   components/ui/TierGate.test.tsx
```

##### Vendor Components (1 file)
```bash
mv __tests__/components/vendors/LocationsDisplaySection.test.tsx \
   components/vendors/LocationsDisplaySection.test.tsx
```

#### Files Being Moved

**Dashboard Components:**
1. `__tests__/components/dashboard/ExcelExportCard.test.tsx` → `components/dashboard/ExcelExportCard.test.tsx`
2. `__tests__/components/dashboard/ExcelImportCard.test.tsx` → `components/dashboard/ExcelImportCard.test.tsx`
3. `__tests__/components/dashboard/ExcelPreviewDialog.test.tsx` → `components/dashboard/ExcelPreviewDialog.test.tsx`
4. `__tests__/components/dashboard/ImportHistoryCard.test.tsx` → `components/dashboard/ImportHistoryCard.test.tsx`
5. `__tests__/components/dashboard/LocationFormFields.test.tsx` → `components/dashboard/LocationFormFields.test.tsx`
6. `__tests__/components/dashboard/LocationsManagerCard.test.tsx` → `components/dashboard/LocationsManagerCard.test.tsx`
7. `__tests__/components/dashboard/ProfileEditTabs.test.tsx` → `components/dashboard/ProfileEditTabs.test.tsx`
8. `__tests__/components/dashboard/ValidationErrorsTable.test.tsx` → `components/dashboard/ValidationErrorsTable.test.tsx`

**UI Components:**
9. `__tests__/components/ui/GeocodingButton.test.tsx` → `components/ui/GeocodingButton.test.tsx`
10. `__tests__/components/ui/TierGate.test.tsx` → `components/ui/TierGate.test.tsx`

**Vendor Components:**
11. `__tests__/components/vendors/LocationsDisplaySection.test.tsx` → `components/vendors/LocationsDisplaySection.test.tsx`

#### Cleanup
```bash
# Remove empty directories after moving files
rmdir __tests__/components/dashboard/
rmdir __tests__/components/ui/
rmdir __tests__/components/vendors/
rmdir __tests__/components/
```

#### Verification Steps

```bash
# Run Jest to ensure all tests are found
npm run test

# Run specific test to verify it works
npm run test -- components/dashboard/ExcelExportCard.test.tsx

# Verify test count hasn't changed
npm run test -- --listTests | wc -l
```

#### Potential Issues
- **Import paths**: Relative paths may need adjustment (check after moving)
- **Test mocks**: Verify mock paths still work
- **Coverage reports**: Ensure coverage still includes colocated tests

---

### Phase 3: Colocate Library Tests (PRIORITY 3)
**Estimated Effort**: 2-3 hours
**Risk**: Medium
**Files to Move**: 12 files

#### Action Items

Move library tests from `__tests__/lib/` to be colocated:

##### Service Tests (7 files)
```bash
mv __tests__/lib/services/EmailService.test.ts \
   lib/services/EmailService.test.ts

mv __tests__/lib/services/ExcelExportService.test.ts \
   lib/services/ExcelExportService.test.ts

mv __tests__/lib/services/ExcelParserService.test.ts \
   lib/services/ExcelParserService.test.ts

mv __tests__/lib/services/ExcelTemplateService.test.ts \
   lib/services/ExcelTemplateService.test.ts

mv __tests__/lib/services/ImportExecutionService.test.ts \
   lib/services/ImportExecutionService.test.ts

mv __tests__/lib/services/ImportValidationService.test.ts \
   lib/services/ImportValidationService.test.ts
```

##### Utility Tests (2 files)
```bash
mv __tests__/lib/utils/computedFields.test.ts \
   lib/utils/computedFields.test.ts

mv __tests__/lib/utils/file-upload.test.ts \
   lib/utils/file-upload.test.ts
```

##### Config Tests (1 file)
```bash
mv __tests__/lib/config/excel-field-mappings.test.ts \
   lib/config/excel-field-mappings.test.ts
```

##### Constants Tests (1 file)
```bash
mv __tests__/lib/constants/tierConfig.test.ts \
   lib/constants/tierConfig.test.ts
```

#### Files Being Moved

**Services:**
1. `__tests__/lib/services/EmailService.test.ts` → `lib/services/EmailService.test.ts`
2. `__tests__/lib/services/ExcelExportService.test.ts` → `lib/services/ExcelExportService.test.ts`
3. `__tests__/lib/services/ExcelParserService.test.ts` → `lib/services/ExcelParserService.test.ts`
4. `__tests__/lib/services/ExcelTemplateService.test.ts` → `lib/services/ExcelTemplateService.test.ts`
5. `__tests__/lib/services/ImportExecutionService.test.ts` → `lib/services/ImportExecutionService.test.ts`
6. `__tests__/lib/services/ImportValidationService.test.ts` → `lib/services/ImportValidationService.test.ts`

**Utilities:**
7. `__tests__/lib/utils/computedFields.test.ts` → `lib/utils/computedFields.test.ts`
8. `__tests__/lib/utils/file-upload.test.ts` → `lib/utils/file-upload.test.ts`

**Config:**
9. `__tests__/lib/config/excel-field-mappings.test.ts` → `lib/config/excel-field-mappings.test.ts`

**Constants:**
10. `__tests__/lib/constants/tierConfig.test.ts` → `lib/constants/tierConfig.test.ts`

#### Cleanup
```bash
# Remove empty directories
rmdir __tests__/lib/services/
rmdir __tests__/lib/utils/
rmdir __tests__/lib/config/
rmdir __tests__/lib/constants/
rmdir __tests__/lib/
```

#### Verification Steps

```bash
# Run all tests
npm run test

# Check specific service tests work
npm run test -- lib/services/EmailService.test.ts

# Verify coverage includes colocated tests
npm run test:coverage
```

---

### Phase 4: Consolidate Unit Tests (PRIORITY 4)
**Estimated Effort**: 1 hour
**Risk**: Low
**Files to Move**: 4 files

#### Action Items

Move tests from `tests/unit/` to appropriate colocated locations:

```bash
# Move API test
mv tests/unit/api/geocode.test.ts \
   app/api/geocode/route.test.ts

# Move component tests
mv tests/unit/components/LocationResultSelector.test.tsx \
   components/LocationResultSelector.test.tsx

mv tests/unit/components/LocationSearchFilter.test.tsx \
   components/LocationSearchFilter.test.tsx

# Move hook test
mv tests/unit/hooks/useLocationFilter.test.ts \
   hooks/useLocationFilter.test.ts
```

#### Files Being Moved

1. `tests/unit/api/geocode.test.ts` → `app/api/geocode/route.test.ts`
2. `tests/unit/components/LocationResultSelector.test.tsx` → `components/LocationResultSelector.test.tsx`
3. `tests/unit/components/LocationSearchFilter.test.tsx` → `components/LocationSearchFilter.test.tsx`
4. `tests/unit/hooks/useLocationFilter.test.ts` → `hooks/useLocationFilter.test.ts`

#### Cleanup
```bash
# Remove empty directories
rmdir tests/unit/api/
rmdir tests/unit/components/
rmdir tests/unit/hooks/
rmdir tests/unit/
```

#### Verification Steps

```bash
# Run all tests
npm run test

# Verify each moved test works
npm run test -- app/api/geocode/route.test.ts
npm run test -- components/LocationResultSelector.test.tsx
npm run test -- hooks/useLocationFilter.test.ts
```

---

## Files That Should NOT Be Moved

These tests should remain in `__tests__/` because they test systems, not individual units:

### API Tests
```
__tests__/api/
├── admin/tier-upgrade-requests.test.ts
└── portal/tier-upgrade-request.test.ts
```
**Reason**: API route integration tests

### Backend Tests
```
__tests__/backend/
├── integration/vendor-api.test.ts
├── schema/vendors-schema.test.ts
└── services/
    ├── tier-change-validation.test.ts
    ├── tier-downgrade-validation.test.ts
    ├── tier-request-operations.test.ts
    ├── tier-services.test.ts
    └── tier-upgrade-request-service.test.ts
```
**Reason**: Backend service layer and database schema tests

### Integration Tests
```
__tests__/integration/
├── api-admin-endpoints.test.ts
├── api-contract-validation.test.ts
├── api-contract/
├── dashboard/locations-workflow.test.tsx
├── file-upload-integration.test.tsx
├── seed-apis.test.ts
├── services/location-service.test.ts
├── tier-access-control.test.tsx
└── vendors/profile-locations-display.test.tsx
```
**Reason**: Cross-cutting integration tests

### Payload Tests
```
__tests__/payload/
├── collections/
│   ├── TierUpgradeRequests.test.ts
│   └── vendors-locations-schema.test.ts
└── hooks/vendors-locations-hooks.test.ts
```
**Reason**: CMS configuration and schema tests

### Performance Tests
```
__tests__/performance/
└── excel-vendor-performance.test.ts
```
**Reason**: Performance benchmarks

### Security Tests
```
__tests__/security/
├── excel-import-comprehensive-security.test.ts
└── excel-import-security.test.ts
```
**Reason**: Security audit tests

---

## Pre-Migration Checklist

Before starting the migration:

- [ ] Review this plan with team
- [ ] Ensure all tests currently pass
- [ ] Create backup branch
- [ ] Inform team of migration in progress
- [ ] Set aside dedicated time for migration

---

## Migration Execution Checklist

### Phase 1: E2E Consolidation
- [ ] Create feature branch: `chore/consolidate-e2e-tests`
- [ ] Move 5 files from `e2e/` to `tests/e2e/`
- [ ] Remove empty `e2e/` directory
- [ ] Run `npm run test:e2e` to verify
- [ ] Verify `npx playwright test --list` shows all tests
- [ ] Commit changes: `chore(test): Consolidate E2E tests in tests/e2e/`
- [ ] Push and create PR

### Phase 2: Component Test Colocation
- [ ] Create feature branch: `chore/colocate-component-tests`
- [ ] Move 8 dashboard component tests
- [ ] Move 2 UI component tests
- [ ] Move 1 vendor component test
- [ ] Remove empty directories
- [ ] Run `npm run test` to verify
- [ ] Check test coverage with `npm run test:coverage`
- [ ] Commit changes: `chore(test): Colocate component tests with source`
- [ ] Push and create PR

### Phase 3: Library Test Colocation
- [ ] Create feature branch: `chore/colocate-library-tests`
- [ ] Move 7 service tests
- [ ] Move 2 utility tests
- [ ] Move 1 config test
- [ ] Move 1 constants test
- [ ] Remove empty directories
- [ ] Run `npm run test` to verify
- [ ] Commit changes: `chore(test): Colocate library tests with source`
- [ ] Push and create PR

### Phase 4: Unit Test Consolidation
- [ ] Create feature branch: `chore/consolidate-unit-tests`
- [ ] Move 1 API test
- [ ] Move 2 component tests
- [ ] Move 1 hook test
- [ ] Remove empty directories
- [ ] Run `npm run test` to verify
- [ ] Commit changes: `chore(test): Move remaining unit tests to colocated structure`
- [ ] Push and create PR

---

## Post-Migration Checklist

After completing all phases:

- [ ] Run full test suite: `npm run test`
- [ ] Run E2E tests: `npm run test:e2e`
- [ ] Generate coverage report: `npm run test:coverage`
- [ ] Verify coverage hasn't decreased
- [ ] Update any CI/CD configurations if needed
- [ ] Update team documentation
- [ ] Announce completion to team
- [ ] Archive this migration plan

---

## Rollback Plan

If issues are discovered during migration:

1. **Immediate Rollback**:
   ```bash
   git reset --hard HEAD~1
   git push --force
   ```

2. **Revert Specific Phase**:
   ```bash
   git revert <commit-hash>
   git push
   ```

3. **Manual Rollback**:
   - Move files back to original locations
   - Restore any modified test imports
   - Run tests to verify

---

## Success Criteria

Migration is successful when:

1. **All Tests Pass**: `npm run test` and `npm run test:e2e` pass
2. **Test Count Unchanged**: Same number of tests before and after
3. **Coverage Maintained**: Coverage percentage hasn't decreased
4. **CI/CD Works**: Automated tests pass in CI/CD pipeline
5. **Documentation Updated**: CONTRIBUTING.md reflects new structure
6. **Team Onboarded**: Team understands new structure

---

## Timeline

**Recommended Schedule**:

- **Week 1**: Phase 1 (E2E Consolidation)
- **Week 2**: Phase 2 (Component Colocation)
- **Week 3**: Phase 3 (Library Colocation)
- **Week 4**: Phase 4 (Unit Consolidation) + Final Verification

**Alternative**: Execute all phases in one day (requires ~8 hours dedicated time)

---

## Known Risks and Mitigations

### Risk 1: Import Path Issues
**Impact**: Tests fail due to incorrect import paths
**Mitigation**:
- Move files in small batches
- Run tests after each batch
- Fix imports incrementally

### Risk 2: Test Discovery Issues
**Impact**: Jest doesn't find colocated tests
**Mitigation**:
- Jest config already supports both patterns
- Verify with `npm run test -- --listTests`

### Risk 3: Coverage Report Changes
**Impact**: Coverage reports don't include colocated tests
**Mitigation**:
- Jest `collectCoverageFrom` already includes all source directories
- Verify coverage before/after migration

### Risk 4: CI/CD Pipeline Failures
**Impact**: Automated tests fail in GitHub Actions
**Mitigation**:
- Review CI/CD configuration before migration
- Update test paths if hardcoded
- Run full pipeline in test branch

---

## Questions and Answers

**Q: Why not move all tests at once?**
A: Incremental migration reduces risk and makes issues easier to debug.

**Q: Can we mix colocated and centralized tests?**
A: Yes, the jest config supports both. Some tests should remain centralized.

**Q: What if a test file doesn't have a clear source file?**
A: Keep it in `__tests__/integration/` - it's likely an integration test.

**Q: How do we handle shared test utilities?**
A: Keep in `__tests__/utils/` or `tests/e2e/helpers/` depending on test type.

**Q: What about fixture files?**
A: Keep in `__tests__/fixtures/` - they're shared across tests.

---

## Contact

For questions about this migration:
- Review the analysis document: `Supporting-Docs/test-structure-analysis.md`
- Check CONTRIBUTING.md for test organization guidelines
- Ask in the team channel or PR comments

---

**Document Status**: READY FOR EXECUTION
**Last Updated**: 2025-12-06
**Author**: Senior TypeScript Developer (Agent)
