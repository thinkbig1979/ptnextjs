# Test Coverage Plan

**Document Version**: 1.0
**Created**: 2025-10-24
**Task**: TEST-FRONTEND-UI
**Target Coverage**: ≥80% across all metrics

---

## Overview

This document outlines the comprehensive test coverage strategy for the tier structure implementation frontend, including target coverage percentages, critical paths requiring 100% coverage, and systematic approach to achieving and maintaining coverage goals.

---

## Coverage Targets

### Overall Targets

| Metric | Target | Critical Paths |
|--------|--------|----------------|
| **Statements** | ≥ 80% | 100% |
| **Branches** | ≥ 75% | 100% |
| **Functions** | ≥ 80% | 100% |
| **Lines** | ≥ 80% | 100% |

### Per-Category Targets

| Category | Target | Notes |
|----------|--------|-------|
| Dashboard Components | ≥ 85% | High user interaction |
| Form Components | ≥ 90% | Critical business logic |
| Display Components | ≥ 75% | Mostly presentational |
| Tier Validation | 100% | Critical security path |
| Computed Fields | 100% | Critical business logic |
| API Integration | ≥ 80% | Network error handling |

---

## Critical Paths Requiring 100% Coverage

### 1. Tier Validation Logic

**Files**:
- `lib/services/TierValidationService.ts`
- `lib/utils/tier-validator.ts`
- Frontend tier access checks

**Why 100%**:
- Security-critical: Prevents unauthorized access to premium features
- Business-critical: Core monetization logic
- Legal implications: Tier access must be enforced correctly

**Test Requirements**:
- ✅ All tier levels tested (Free, Tier 1, Tier 2, Tier 3)
- ✅ All field access scenarios tested
- ✅ All feature access scenarios tested
- ✅ Edge cases: null values, invalid tiers, boundary conditions
- ✅ Upgrade paths validated

**Example Critical Tests**:
```typescript
describe('TierValidationService - Critical Paths', () => {
  it('blocks Free tier from accessing foundedYear field', () => {
    expect(TierValidationService.validateFieldAccess('free', 'foundedYear')).toBe(false);
  });

  it('allows Tier 1+ to access foundedYear field', () => {
    expect(TierValidationService.validateFieldAccess('tier1', 'foundedYear')).toBe(true);
  });

  it('blocks Tier 1 from accessing promotion pack', () => {
    expect(TierValidationService.canAccessFeature('tier1', 'promotionPack')).toBe(false);
  });

  it('allows Tier 3 to access all features', () => {
    const allFeatures = ['certifications', 'caseStudies', 'promotionPack'];
    allFeatures.forEach(feature => {
      expect(TierValidationService.canAccessFeature('tier3', feature)).toBe(true);
    });
  });
});
```

---

### 2. Computed Fields Logic

**Files**:
- `lib/services/VendorComputedFieldsService.ts`
- `components/vendors/YearsInBusinessDisplay.tsx`
- Frontend computed field calculations

**Why 100%**:
- Data integrity: Incorrect calculations affect user trust
- Business-critical: Years in business is a key metric
- Consistency: Frontend and backend must compute identically

**Test Requirements**:
- ✅ Valid year calculations (all valid years 1800-current)
- ✅ Invalid year handling (< 1800, > current, null)
- ✅ Edge cases: founded this year, founded at minimum year
- ✅ Frontend-backend parity verification

**Example Critical Tests**:
```typescript
describe('Years in Business Computation - Critical Paths', () => {
  const currentYear = new Date().getFullYear();

  it('computes correctly for valid years', () => {
    expect(computeYearsInBusiness(2010)).toBe(currentYear - 2010);
    expect(computeYearsInBusiness(2000)).toBe(currentYear - 2000);
  });

  it('returns null for invalid years', () => {
    expect(computeYearsInBusiness(1799)).toBeNull();
    expect(computeYearsInBusiness(currentYear + 1)).toBeNull();
    expect(computeYearsInBusiness(null)).toBeNull();
  });

  it('handles edge case: founded this year', () => {
    expect(computeYearsInBusiness(currentYear)).toBe(0);
  });

  it('handles edge case: founded at minimum year', () => {
    expect(computeYearsInBusiness(1800)).toBe(currentYear - 1800);
  });
});
```

---

### 3. Form Submission Workflows

**Files**:
- All dashboard form components
- API integration code
- Validation schemas

**Why 100%**:
- Data integrity: User data must be saved correctly
- Error handling: Users must receive clear feedback
- State management: Form state must be preserved correctly

**Test Requirements**:
- ✅ Valid submission succeeds
- ✅ Invalid submission shows errors
- ✅ Network errors handled gracefully
- ✅ Form state preserved on error
- ✅ Success feedback shown to user
- ✅ Form reset after success

---

## Component Coverage Breakdown

### Dashboard Components

#### ProfileEditTabs
**Target**: 90%
**Priority**: P0 (Critical)

**Test Coverage**:
- [ ] Tab visibility for each tier (4 scenarios)
- [ ] Tab switching preserves form state
- [ ] Upgrade prompts displayed correctly
- [ ] URL hash updates on tab change
- [ ] Responsive tab layout (mobile/tablet/desktop)

**Critical Branches**:
- Tier-based tab visibility (100% coverage required)
- Form dirty state detection

---

#### BrandStoryForm
**Target**: 90%
**Priority**: P0 (Critical)

**Test Coverage**:
- [ ] All fields render correctly
- [ ] Founded year validation (1800-current)
- [ ] Years in business auto-computation
- [ ] Social proof metrics validation
- [ ] Video introduction URL validation
- [ ] Form submission success/error
- [ ] Tier access control (Free tier blocked)

**Critical Branches**:
- Founded year edge cases (< 1800, > current, null)
- Tier access check

---

#### CertificationsAwardsManager
**Target**: 85%
**Priority**: P1 (High)

**Test Coverage**:
- [ ] Add certification flow
- [ ] Edit certification flow
- [ ] Delete certification flow
- [ ] Add award flow
- [ ] Edit/delete award flow
- [ ] Validation errors displayed
- [ ] Empty state shown

**Critical Branches**:
- CRUD operations success/failure
- Validation logic

---

#### CaseStudiesManager
**Target**: 85%
**Priority**: P1 (High)

**Test Coverage**:
- [ ] Add case study flow
- [ ] Edit case study flow
- [ ] Delete case study flow
- [ ] Image gallery management
- [ ] Featured toggle
- [ ] Rich text editing

**Critical Branches**:
- CRUD operations
- Image upload/validation

---

#### TeamMembersManager
**Target**: 80%
**Priority**: P1 (High)

**Test Coverage**:
- [ ] Add team member flow
- [ ] Edit team member flow
- [ ] Delete team member flow
- [ ] Photo upload
- [ ] Display order management

**Critical Branches**:
- CRUD operations
- Photo upload validation

---

#### PromotionPackForm
**Target**: 90%
**Priority**: P1 (High - Tier 3 only)

**Test Coverage**:
- [ ] Feature toggles work correctly
- [ ] Tier 3 access only
- [ ] Free/Tier 1/Tier 2 blocked with upgrade prompt
- [ ] Form submission

**Critical Branches**:
- Tier 3 access check (100% coverage)

---

### Display Components

#### VendorCard
**Target**: 80%
**Priority**: P1 (High)

**Test Coverage**:
- [ ] Displays vendor data correctly
- [ ] Tier badge shown with correct style
- [ ] Featured indicator (Tier 2+)
- [ ] Years in business badge (Tier 1+)
- [ ] Click navigation works
- [ ] Responsive layout

**Critical Branches**:
- Tier badge rendering
- Featured flag check

---

#### TierBadge
**Target**: 95%
**Priority**: P0 (Critical - used everywhere)

**Test Coverage**:
- [ ] Renders for all tier levels
- [ ] Correct color for each tier
- [ ] Correct icon for each tier
- [ ] Size variants (sm, md, lg)
- [ ] Accessibility attributes

**Critical Branches**:
- All tier variants (100% coverage)

---

#### YearsInBusinessDisplay
**Target**: 100%
**Priority**: P0 (Critical - computed field)

**Test Coverage**:
- [ ] Computes years correctly
- [ ] Handles invalid years (< 1800, > current)
- [ ] Handles null founded year
- [ ] Shows label if requested
- [ ] Badge vs inline variants
- [ ] Accessibility attributes

**Critical Branches**:
- All computation edge cases (100% coverage required)

---

#### VendorProfilePage
**Target**: 85%
**Priority**: P1 (High)

**Test Coverage**:
- [ ] Data fetching and display
- [ ] Tier-responsive sections
- [ ] All tier levels tested
- [ ] Loading states
- [ ] Error states
- [ ] Responsive layout

**Critical Branches**:
- Tier-based section visibility

---

#### TierUpgradePrompt
**Target**: 90%
**Priority**: P1 (High)

**Test Coverage**:
- [ ] Displays current and target tier
- [ ] Shows feature benefits
- [ ] CTA button works
- [ ] All upgrade paths tested
- [ ] Modal open/close

**Critical Branches**:
- Upgrade path logic

---

## Integration Test Coverage

### Tier Tab Visibility Integration
**Target**: 100%
**Priority**: P0 (Critical)

**Test Scenarios**:
- [ ] Free tier: 2 tabs only
- [ ] Tier 1: 7 tabs
- [ ] Tier 2: 8 tabs
- [ ] Tier 3: 9 tabs
- [ ] Tab switching works for accessible tabs
- [ ] Locked tabs show upgrade prompt

---

### Form Validation Flow Integration
**Target**: 90%
**Priority**: P1 (High)

**Test Scenarios**:
- [ ] Invalid data shows errors
- [ ] Valid data submits successfully
- [ ] Network errors handled
- [ ] Form state preserved on error
- [ ] Success toast shown

---

### Computed Fields Integration
**Target**: 100%
**Priority**: P0 (Critical)

**Test Scenarios**:
- [ ] Frontend computes years in business
- [ ] Backend returns computed value
- [ ] Frontend and backend match
- [ ] Edge cases handled identically

---

### Public Profile Tier Display Integration
**Target**: 85%
**Priority**: P1 (High)

**Test Scenarios**:
- [ ] Free tier: Basic info only
- [ ] Tier 1: Adds certifications, team, case studies
- [ ] Tier 2: Adds products, featured badge
- [ ] Tier 3: Adds promotion features

---

## Coverage Exclusions

**Exclude from coverage**:
- [ ] Next.js generated files (`next.config.js`, etc.)
- [ ] Third-party library wrappers (if no custom logic)
- [ ] Type definition files (`*.d.ts`)
- [ ] Test utilities and fixtures
- [ ] Mock implementations
- [ ] Configuration files
- [ ] Build scripts

---

## Coverage Monitoring Strategy

### CI/CD Integration

**Pre-Commit**:
- Run tests for changed files only
- Block commit if new code has < 80% coverage
- Fast feedback (< 30 seconds)

**Pull Request**:
- Run full test suite
- Generate coverage report
- Block merge if overall coverage drops below 80%
- Require maintainer approval for coverage drops

**Post-Merge**:
- Update coverage baseline
- Generate coverage badge
- Notify team if coverage decreases

### Coverage Reports

**Format**: Istanbul/NYC HTML reports
**Location**: `coverage/lcov-report/index.html`
**CI**: Upload to Codecov or Coveralls

**Key Metrics to Track**:
- Overall coverage percentage
- Coverage change vs previous build
- Uncovered lines by file
- Branch coverage gaps

---

## Achieving Target Coverage

### Phase 1: Foundation (Week 1)

**Goal**: 60% overall coverage

**Tasks**:
1. Implement all component unit tests
2. Focus on rendering and basic interaction tests
3. Set up coverage reporting

---

### Phase 2: Validation & Logic (Week 2)

**Goal**: 75% overall coverage, 100% critical paths

**Tasks**:
1. Implement all form validation tests
2. Achieve 100% coverage on tier validation
3. Achieve 100% coverage on computed fields
4. Add integration tests

---

### Phase 3: Edge Cases & Refinement (Week 3)

**Goal**: 85%+ overall coverage

**Tasks**:
1. Add edge case tests
2. Fill coverage gaps identified in reports
3. Add accessibility tests
4. Add responsive behavior tests

---

### Phase 4: Maintenance

**Ongoing**:
- Monitor coverage on every PR
- Add tests for bug fixes
- Add tests for new features
- Refactor tests as needed

---

## Coverage Gaps & Remediation

### Common Coverage Gaps

**Uncovered Branches**:
- Early returns in functions
- Error handling catch blocks
- Conditional rendering

**Remediation**:
- Add specific tests for each branch
- Use parameterized tests for multiple scenarios
- Mock errors to trigger catch blocks

**Uncovered Lines**:
- Console.log statements
- Debug code
- Unreachable code

**Remediation**:
- Remove debug code
- Delete dead code
- Add tests to reach the lines

---

## Test-to-Code Ratio

**Target Ratio**: 1.5:1 (test lines : code lines)

**Rationale**:
- Comprehensive testing requires more test code than production code
- Includes setup, assertions, and edge cases
- Acceptable range: 1.2:1 to 2:1

---

## Coverage Review Process

### Weekly Coverage Review

**Participants**: Dev team
**Duration**: 15 minutes
**Agenda**:
1. Review current coverage percentage
2. Identify files with < 80% coverage
3. Assign coverage improvement tasks
4. Celebrate coverage milestones

### Monthly Coverage Audit

**Participants**: Tech lead, QA lead
**Duration**: 1 hour
**Deliverables**:
- Coverage trend report
- Critical path coverage verification
- Test quality assessment
- Recommendations for improvement

---

## Summary

**Total Components to Test**: 13
**Total Integration Tests**: 5
**Estimated Total Test Cases**: 500+
**Target Overall Coverage**: ≥ 80%
**Critical Path Coverage**: 100%

**Key Success Metrics**:
- ✅ All critical paths at 100% coverage
- ✅ Overall coverage ≥ 80%
- ✅ No regressions in coverage on new PRs
- ✅ All new features include tests

---

**Document Version**: 1.0
**Last Updated**: 2025-10-24
**Next Review**: Weekly during implementation
