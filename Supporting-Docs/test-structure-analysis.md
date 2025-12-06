# Test Directory Structure Analysis

**Date**: 2025-12-06
**Purpose**: Document current test organization and establish consistent testing conventions

---

## Executive Summary

### Current State
- **Total Test Files**: 97 test files (excluding node_modules)
- **Total E2E Spec Files**: ~100+ Playwright spec files
- **Organization**: Mixed approach with both colocated and centralized tests
- **Primary Issue**: Inconsistent organization making it hard to locate tests

### Recommended Approach
1. **Unit Tests**: Colocate with source files (e.g., `Component.tsx` → `Component.test.tsx`)
2. **Integration Tests**: Centralize in `__tests__/integration/`
3. **E2E Tests**: Keep in `tests/e2e/` (already well-organized)

---

## Current Test Inventory

### 1. Root `__tests__/` Directory (48 files)

#### API Tests (8 files)
```
__tests__/api/
├── admin/
│   └── tier-upgrade-requests.test.ts
└── portal/
    ├── tier-upgrade-request.test.ts
    └── vendors/
        ├── excel-export.test.ts
        ├── excel-import.test.ts
        ├── excel-template.test.ts
        └── import-history.test.ts
```

#### Backend Tests (7 files)
```
__tests__/backend/
├── integration/
│   └── vendor-api.test.ts
├── schema/
│   └── vendors-schema.test.ts
└── services/
    ├── tier-change-validation.test.ts
    ├── tier-downgrade-validation.test.ts
    ├── tier-request-operations.test.ts
    ├── tier-services.test.ts
    └── tier-upgrade-request-service.test.ts
```

#### Component Tests (15 files)
```
__tests__/components/
├── dashboard/
│   ├── ExcelExportCard.test.tsx
│   ├── ExcelImportCard.test.tsx
│   ├── ExcelPreviewDialog.test.tsx
│   ├── ImportHistoryCard.test.tsx
│   ├── LocationFormFields.test.tsx
│   ├── LocationsManagerCard.test.tsx
│   ├── ProfileEditTabs.test.tsx
│   └── ValidationErrorsTable.test.tsx
├── ui/
│   ├── GeocodingButton.test.tsx
│   └── TierGate.test.tsx
└── vendors/
    └── LocationsDisplaySection.test.tsx
```

#### Integration Tests (10 files)
```
__tests__/integration/
├── api-admin-endpoints.test.ts
├── api-contract-validation.test.ts
├── api-contract/
│   ├── vendor-update-schema-contract.test.ts
│   ├── vendors-api-http-contract.test.ts
│   └── vendors-locations-contract.test.ts
├── dashboard/
│   └── locations-workflow.test.tsx
├── file-upload-integration.test.tsx
├── seed-apis.test.ts
├── services/
│   └── location-service.test.ts
├── tier-access-control.test.tsx
└── vendors/
    └── profile-locations-display.test.tsx
```

#### Library Tests (6 files)
```
__tests__/lib/
├── config/
│   └── excel-field-mappings.test.ts
├── constants/
│   └── tierConfig.test.ts
├── services/
│   ├── EmailService.test.ts
│   ├── ExcelExportService.test.ts
│   ├── ExcelParserService.test.ts
│   ├── ExcelTemplateService.test.ts
│   ├── ImportExecutionService.test.ts
│   └── ImportValidationService.test.ts
└── utils/
    ├── computedFields.test.ts
    └── file-upload.test.ts
```

#### Payload Tests (3 files)
```
__tests__/payload/
├── collections/
│   ├── TierUpgradeRequests.test.ts
│   └── vendors-locations-schema.test.ts
└── hooks/
    └── vendors-locations-hooks.test.ts
```

#### Other Tests (2 files)
```
__tests__/
├── performance/
│   └── excel-vendor-performance.test.ts
└── security/
    ├── excel-import-comprehensive-security.test.ts
    └── excel-import-security.test.ts
```

### 2. Colocated Tests in `payload/collections/__tests__/` (11 files)

```
payload/collections/__tests__/
├── integration/
│   ├── access-control.test.ts
│   ├── cross-collection.test.ts
│   ├── data-integrity.test.ts
│   ├── enhanced-fields.test.ts
│   ├── hooks.test.ts
│   ├── relationships.test.ts
│   └── rich-text.test.ts
├── Products.test.ts
├── Tags.test.ts
├── Vendors.test.ts
└── Yachts.test.ts
```

### 3. Colocated Tests in `lib/transformers/__tests__/` (2 files)

```
lib/transformers/__tests__/
├── markdown-to-lexical.test.ts
└── transformers.test.ts
```

### 4. Colocated Tests in `lib/cache/__tests__/` (2 files)

```
lib/cache/__tests__/
├── InMemoryCacheService.test.ts
└── integration.test.ts
```

### 5. Colocated Tests in `components/` (24 files)

```
components/
├── admin/__tests__/
│   └── AdminDirectTierChange.test.tsx
├── case-studies/__tests__/
│   ├── CaseStudyCard.test.tsx
│   ├── CaseStudyDetail.test.tsx
│   ├── CaseStudyNavigation.test.tsx
│   ├── InnovationHighlights.test.tsx
│   └── YachtProjectPortfolio.test.tsx
├── dashboard/__tests__/
│   ├── TierUpgradeRequestForm.test.tsx
│   └── UpgradeRequestStatusCard.test.tsx
├── enhanced-profiles/__tests__/
│   ├── AwardsSection.test.tsx
│   ├── CertificationBadge.test.tsx
│   ├── InteractiveOrgChart.test.tsx
│   ├── SocialProofMetrics.test.tsx
│   └── VideoIntroduction.test.tsx
├── product-comparison/__tests__/
│   ├── ComparisonMatrix.test.tsx
│   ├── IntegrationNotes.test.tsx
│   ├── OwnerReviews.test.tsx
│   ├── PerformanceMetrics.test.tsx
│   └── VisualDemo.test.tsx
├── yacht-profiles/__tests__/
│   ├── MaintenanceHistory.test.tsx
│   ├── SupplierMap.test.tsx
│   ├── SustainabilityScore.test.tsx
│   ├── YachtCard.test.tsx
│   └── YachtTimeline.test.tsx
└── __tests__/
    └── TierComparisonTable.test.tsx
```

### 6. Tests in `tests/` Directory (7 files)

#### E2E Tests (2 files)
```
tests/e2e/
├── full-stack-locations.test.ts
└── [~100+ .spec.ts files - see below]
```

#### Integration Tests (1 file)
```
tests/integration/
├── docker-stack.test.ts
└── location-search-workflow.test.tsx
```

#### Unit Tests (4 files)
```
tests/unit/
├── api/
│   └── geocode.test.ts
├── components/
│   ├── LocationResultSelector.test.tsx
│   └── LocationSearchFilter.test.tsx
└── hooks/
    └── useLocationFilter.test.ts
```

### 7. E2E Tests in `tests/e2e/` (~100+ files)

```
tests/e2e/
├── admin-approval-flow.spec.ts
├── admin-login-visual.spec.ts
├── admin-panel.spec.ts
├── blog-image-cache-fix.spec.ts
├── brand-story-tier-fix.spec.ts
├── bug-fixes-verification.spec.ts
├── certifications-awards-manager.spec.ts
├── comprehensive-form-save-test.spec.ts
├── computed-fields.spec.ts
├── dashboard-integration.spec.ts
├── debug-*.spec.ts (multiple debug test files)
├── dual-auth-system.spec.ts
├── example-*.spec.ts (example files)
├── location-*.spec.ts (multiple location-related tests)
├── logout-functionality.spec.ts
├── manual-verification.spec.ts
├── migration.spec.ts
├── multi-location-test.spec.ts
├── partner-filter-validation.spec.ts
├── product-*.spec.ts (multiple product-related tests)
├── promotion-pack-form.spec.ts
├── team-members-manager.spec.ts
├── tier-*.spec.ts (multiple tier-related tests)
├── vendor-*.spec.ts (multiple vendor-related tests)
├── verify-*.spec.ts (multiple verification tests)
├── helpers/
│   ├── database-seed-helpers.ts
│   ├── seed-api-helpers.ts
│   ├── test-data-factories.ts
│   ├── test-vendors.ts
│   ├── tier-upgrade-helpers.ts
│   └── vendor-onboarding-helpers.ts
├── tier-upgrade-request/
│   ├── admin-workflow.spec.ts
│   ├── edge-cases.spec.ts
│   ├── happy-path.spec.ts
│   └── vendor-workflow.spec.ts
└── vendor-onboarding/
    ├── 01-registration.spec.ts
    ├── 02-admin-approval.spec.ts
    ├── 03-authentication.spec.ts
    ├── 04-free-tier-profile.spec.ts
    ├── 05-tier-upgrade.spec.ts
    ├── 06-tier1-advanced-profile.spec.ts
    ├── 07-tier2-locations.spec.ts
    ├── 08-tier3-promotions.spec.ts
    ├── 09-product-management.spec.ts
    ├── 10-public-profile-display.spec.ts
    ├── 11-security-access-control.spec.ts
    └── 12-e2e-happy-path.spec.ts
```

### 8. E2E Tests in Root `e2e/` Directory (5 files)

```
e2e/
├── excel-export.spec.ts
├── excel-import-happy-path.spec.ts
├── excel-import-tier-restrictions.spec.ts
├── excel-import-validation-errors.spec.ts
└── excel-template-download.spec.ts
```

---

## Test Type Distribution

### By Test Type
| Type | Count | Locations |
|------|-------|-----------|
| Unit Tests | ~60 | Colocated + `__tests__/` + `tests/unit/` |
| Integration Tests | ~15 | `__tests__/integration/` + `tests/integration/` |
| E2E Tests (Playwright) | ~105 | `tests/e2e/` + `e2e/` |
| **Total** | **~180** | Multiple locations |

### By Location Pattern
| Pattern | Count | Example |
|---------|-------|---------|
| Colocated (`__tests__/` subdirs) | 37 | `components/dashboard/__tests__/` |
| Centralized (`__tests__/` root) | 48 | `__tests__/integration/` |
| Centralized (`tests/` dir) | 7 | `tests/unit/` |
| E2E (`tests/e2e/`) | ~100 | `tests/e2e/*.spec.ts` |
| E2E (`e2e/`) | 5 | `e2e/excel-*.spec.ts` |

---

## Issues with Current Structure

### 1. Inconsistent Placement
- Component tests in both `__tests__/components/` AND `components/__tests__/`
- Unit tests in both `__tests__/` AND `tests/unit/`
- E2E tests in both `tests/e2e/` AND `e2e/`

### 2. Hard to Find Tests
- No clear pattern: "Where do I put a new test?"
- New developers confused about test location conventions

### 3. Duplicate Organization
- Some domains (like `dashboard`) have tests in multiple locations:
  - `__tests__/components/dashboard/`
  - `components/dashboard/__tests__/`
  - `__tests__/integration/dashboard/`

### 4. Tool Configuration Complexity
- Jest needs complex `testMatch` patterns to find all tests
- IDE test runners may not discover all tests

---

## Recommended Convention

### Philosophy
**Colocate unit tests, centralize integration/E2E tests**

### Rules

#### 1. Unit Tests → Colocated
Place unit tests next to the code they test:

```
lib/services/EmailService.ts
lib/services/EmailService.test.ts

components/Button.tsx
components/Button.test.tsx

hooks/useAuth.ts
hooks/useAuth.test.ts
```

**Benefits:**
- Easy to find related tests
- Encourages testing while developing
- Clear ownership and maintenance
- Natural organization by domain

#### 2. Integration Tests → `__tests__/integration/`
Place integration tests in centralized location by domain:

```
__tests__/integration/
├── api/
│   ├── vendor-endpoints.test.ts
│   └── admin-endpoints.test.ts
├── database/
│   └── migrations.test.ts
├── services/
│   └── email-workflow.test.ts
└── workflows/
    └── tier-upgrade.test.tsx
```

**Benefits:**
- Clear separation from unit tests
- Logical grouping by system area
- Easy to run all integration tests
- Shared test utilities naturally located here

#### 3. E2E Tests → `tests/e2e/`
Keep all Playwright tests in one location:

```
tests/e2e/
├── vendor-onboarding/
│   ├── 01-registration.spec.ts
│   ├── 02-approval.spec.ts
│   └── ...
├── tier-upgrade/
│   ├── admin-workflow.spec.ts
│   └── vendor-workflow.spec.ts
├── helpers/
│   ├── test-data-factories.ts
│   └── vendor-helpers.ts
└── admin-panel.spec.ts
```

**Benefits:**
- All E2E tests in one place
- Shared helpers easily accessible
- Playwright config naturally scoped
- Clear separation from Jest tests

---

## Migration Plan

### Phase 1: Document Standards (DONE)
- ✅ Create this analysis document
- ✅ Update CONTRIBUTING.md with test conventions
- ✅ Update jest.config.js to support both patterns

### Phase 2: Consolidate E2E Tests (Low Risk)
**Estimated Effort**: 1-2 hours

Move 5 files from `e2e/` to `tests/e2e/`:
```bash
mv e2e/excel-export.spec.ts tests/e2e/
mv e2e/excel-import-happy-path.spec.ts tests/e2e/
mv e2e/excel-import-tier-restrictions.spec.ts tests/e2e/
mv e2e/excel-import-validation-errors.spec.ts tests/e2e/
mv e2e/excel-template-download.spec.ts tests/e2e/
rmdir e2e/
```

**Impact**:
- Zero code changes (just file moves)
- Playwright config already points to `tests/e2e/`
- All E2E tests in one location

### Phase 3: Colocate Component Tests (Medium Risk)
**Estimated Effort**: 3-4 hours

Move tests from `__tests__/components/` to be colocated:
```bash
# Example moves
mv __tests__/components/dashboard/ExcelExportCard.test.tsx \
   components/dashboard/ExcelExportCard.test.tsx

mv __tests__/components/ui/TierGate.test.tsx \
   components/ui/TierGate.test.tsx
```

**Files to Move**: 15 files
- `__tests__/components/dashboard/` (8 files) → `components/dashboard/`
- `__tests__/components/ui/` (2 files) → `components/ui/`
- `__tests__/components/vendors/` (1 file) → `components/vendors/`

**Impact**:
- Import paths may need updating (relative paths)
- Test discovery should work (jest config supports both)
- Better organization by domain

### Phase 4: Colocate Library Tests (Medium Risk)
**Estimated Effort**: 2-3 hours

Move tests from `__tests__/lib/` to be colocated:
```bash
# Example moves
mv __tests__/lib/services/EmailService.test.ts \
   lib/services/EmailService.test.ts

mv __tests__/lib/utils/computedFields.test.ts \
   lib/utils/computedFields.test.ts
```

**Files to Move**: 12 files
- `__tests__/lib/services/` (7 files) → `lib/services/`
- `__tests__/lib/utils/` (2 files) → `lib/utils/`
- `__tests__/lib/config/` (1 file) → `lib/config/`
- `__tests__/lib/constants/` (1 file) → `lib/constants/`

### Phase 5: Consolidate Unit Tests (Low Risk)
**Estimated Effort**: 1 hour

Move tests from `tests/unit/` to appropriate colocated locations:
```bash
mv tests/unit/api/geocode.test.ts \
   app/api/geocode/geocode.test.ts

mv tests/unit/hooks/useLocationFilter.test.ts \
   hooks/useLocationFilter.test.ts
```

**Files to Move**: 4 files
- Better consistency with colocation pattern

### Phase 6: Keep Integration Tests Centralized
**No Action Required**

Integration tests are already well-organized in `__tests__/integration/`:
- Keep API contract tests
- Keep workflow tests
- Keep service integration tests

This centralized location works well for cross-cutting concerns.

---

## Files NOT to Move

### Keep in `__tests__/`
These should stay centralized:

1. **Integration Tests** (`__tests__/integration/`)
   - Cross-cutting concerns
   - Multi-system tests
   - API contract tests

2. **Backend Tests** (`__tests__/backend/`)
   - Server-side logic
   - Database schemas
   - Service layer tests

3. **API Tests** (`__tests__/api/`)
   - API route tests
   - Contract validation

4. **Performance Tests** (`__tests__/performance/`)
   - Benchmarks
   - Load tests

5. **Security Tests** (`__tests__/security/`)
   - Security audits
   - Vulnerability tests

6. **Payload Tests** (`__tests__/payload/`)
   - CMS configuration tests
   - Collection schema tests

### Why Keep These Centralized?
- They test **systems**, not individual units
- They often require shared fixtures/utilities
- They span multiple domains
- They're easier to run as a group

---

## Migration Checklist

### Pre-Migration
- [ ] Review this analysis with team
- [ ] Update CONTRIBUTING.md
- [ ] Update jest.config.js
- [ ] Create git branch for migration

### Phase 1: E2E Consolidation
- [ ] Move 5 files from `e2e/` to `tests/e2e/`
- [ ] Remove empty `e2e/` directory
- [ ] Run all E2E tests to verify
- [ ] Commit changes

### Phase 2: Component Test Colocation
- [ ] Move 15 files from `__tests__/components/` to `components/`
- [ ] Update any import paths
- [ ] Run Jest to verify all tests found
- [ ] Commit changes

### Phase 3: Library Test Colocation
- [ ] Move 12 files from `__tests__/lib/` to `lib/`
- [ ] Update any import paths
- [ ] Run Jest to verify
- [ ] Commit changes

### Phase 4: Unit Test Consolidation
- [ ] Move 4 files from `tests/unit/` to colocated locations
- [ ] Update paths
- [ ] Run tests
- [ ] Commit changes

### Post-Migration
- [ ] Update documentation
- [ ] Run full test suite
- [ ] Update CI/CD if needed
- [ ] Remove empty directories

---

## Estimated Total Effort

| Phase | Files | Effort | Risk |
|-------|-------|--------|------|
| E2E Consolidation | 5 | 1-2 hours | Low |
| Component Colocation | 15 | 3-4 hours | Medium |
| Library Colocation | 12 | 2-3 hours | Medium |
| Unit Consolidation | 4 | 1 hour | Low |
| **Total** | **36** | **7-10 hours** | **Medium** |

### Risks
1. **Import Path Issues**: Relative paths may need adjustment
2. **CI/CD Updates**: GitHub Actions may need path updates
3. **IDE Configuration**: Developers may need to refresh IDE
4. **Test Discovery**: Ensure all tests still found by Jest

### Mitigation
- Move files in small batches
- Run tests after each batch
- Commit frequently
- Keep PR small and reviewable

---

## Success Metrics

After migration, we should achieve:

1. **Clear Convention**: Every developer knows where tests go
2. **Easy Discovery**:
   - Unit tests next to source: `find . -name "*.test.ts"`
   - Integration tests: `ls __tests__/integration/`
   - E2E tests: `ls tests/e2e/`
3. **Faster Onboarding**: New developers understand structure immediately
4. **Better Tooling**: IDEs and test runners find all tests
5. **Maintainability**: Tests easy to locate and update

---

## Questions for Team

1. **Timeline**: When should we execute this migration?
2. **Scope**: Do all phases at once, or incrementally?
3. **Ownership**: Who will execute and review the migration?
4. **Documentation**: Any additional docs needed beyond CONTRIBUTING.md?
5. **Exceptions**: Any tests that don't fit this convention?

---

## Appendix: Jest Configuration Analysis

### Current testMatch Pattern
```javascript
testMatch: [
  '**/__tests__/**/*.(test|spec).(ts|tsx|js|jsx)',
  '**/*.(test|spec).(ts|tsx|js|jsx)',
  '!**/__tests__/fixtures/**',
  '!**/__tests__/utils/**',
  '!**/__tests__/docs/**',
],
```

### What This Matches
1. Any `.test.ts` or `.spec.ts` file in `__tests__/` directories
2. Any `.test.ts` or `.spec.ts` file anywhere in the project
3. Excludes fixture, utility, and doc files in `__tests__/`

### Recommended Update
**No changes needed!** Current config already supports:
- Colocated tests (`Component.test.tsx`)
- Centralized tests (`__tests__/integration/api.test.ts`)
- Both patterns can coexist

### Current testPathIgnorePatterns
```javascript
testPathIgnorePatterns: [
  '<rootDir>/.next/',
  '<rootDir>/node_modules/',
  '<rootDir>/tests/e2e/',
  '<rootDir>/e2e/',
  '\\.spec\\.(ts|tsx|js|jsx)$',
],
```

### What This Excludes
- Next.js build output
- Node modules
- E2E test directories (Playwright only)
- All `.spec.*` files (Playwright convention)

### Status
Configuration is already optimal for our proposed structure.

---

## Next Steps

1. **Review this document** with the team
2. **Update CONTRIBUTING.md** with the recommended conventions
3. **Create migration plan PR** (documentation only)
4. **Schedule migration work** in sprints
5. **Execute in phases** with thorough testing

---

**Document Status**: DRAFT - Awaiting team review
**Last Updated**: 2025-12-06
**Author**: Senior TypeScript Developer (Agent)
