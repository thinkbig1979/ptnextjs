# Test Coverage Plan

## Document Information
- **Project**: Payload CMS Vendor Enrollment
- **Phase**: Phase 3: Frontend Implementation
- **Overall Target**: 80%+ coverage
- **Created**: 2025-10-12
- **Version**: 1.0.0

---

## Executive Summary

This document defines the comprehensive test coverage goals, metrics, and tracking approach for the frontend implementation. The target is **80%+ coverage** for all components and critical paths, with higher coverage (90%+) for authentication, authorization, and tier-based access control.

---

## Coverage Targets by Component Type

### Critical Components (90%+ Coverage Required)

| Component | Type | Target | Priority | Rationale |
|-----------|------|--------|----------|-----------|
| **AuthContext** | Context Provider | 95% | P0 | Core authentication logic affects entire app |
| **VendorRegistrationForm** | Form Component | 90% | P0 | Entry point for vendor enrollment |
| **VendorLoginForm** | Form Component | 90% | P0 | Authentication critical path |
| **AdminApprovalQueue** | Admin Component | 90% | P0 | Controls vendor access |
| **TierGate** | Access Control | 95% | P0 | Enforces business logic |

### High Priority Components (85%+ Coverage Required)

| Component | Type | Target | Priority | Rationale |
|-----------|------|--------|----------|-----------|
| **VendorProfileEditor** | Form Component | 85% | P1 | Complex tier-based validation |
| **VendorDashboard** | Dashboard | 85% | P1 | Main vendor interface |
| **useAuth Hook** | Custom Hook | 90% | P1 | Authentication state management |

### Medium Priority Components (80%+ Coverage Required)

| Component | Type | Target | Priority | Rationale |
|-----------|------|--------|----------|-----------|
| **Dashboard Navigation** | Navigation | 80% | P2 | User navigation flows |
| **Profile Stats** | UI Component | 80% | P2 | Data display |
| **Tier Badge** | UI Component | 80% | P2 | Visual tier indicator |

### Lower Priority Components (75%+ Coverage Required)

| Component | Type | Target | Priority | Rationale |
|-----------|------|--------|----------|-----------|
| **Loading States** | UI Component | 75% | P3 | Simple loading indicators |
| **Error Boundaries** | Error Handling | 75% | P3 | Error display components |
| **Toast Notifications** | UI Component | 75% | P3 | User feedback |

---

## Coverage Breakdown by Feature Area

### 1. Authentication & Authorization (95% Target)

**Critical Paths**:
- ✅ User login flow
- ✅ User registration flow
- ✅ Token validation
- ✅ Session persistence
- ✅ Logout flow
- ✅ Token refresh
- ✅ Unauthorized access handling

**Test Coverage**:
```
AuthContext.tsx             | 95%+ | Statements, Branches, Functions, Lines
VendorLoginForm.tsx         | 90%+ | Statements, Branches, Functions, Lines
VendorRegistrationForm.tsx  | 90%+ | Statements, Branches, Functions, Lines
useAuth.ts                  | 90%+ | Statements, Branches, Functions, Lines
```

**Metrics**:
- **Total Lines**: ~500
- **Lines to Cover**: 475+
- **Critical Branches**: 40+
- **Edge Cases**: 15+

### 2. Tier-Based Access Control (95% Target)

**Critical Paths**:
- ✅ Free tier restrictions
- ✅ Tier1 restrictions
- ✅ Tier2 full access
- ✅ Admin bypass
- ✅ Upgrade prompts
- ✅ Field-level restrictions

**Test Coverage**:
```
TierGate.tsx                | 95%+ | Statements, Branches, Functions, Lines
VendorProfileEditor.tsx     | 85%+ | Statements, Branches, Functions, Lines (tier logic)
useTierAccess.ts            | 90%+ | Statements, Branches, Functions, Lines
```

**Metrics**:
- **Total Lines**: ~300
- **Lines to Cover**: 285+
- **Critical Branches**: 25+
- **Edge Cases**: 10+

### 3. Admin Approval Workflow (90% Target)

**Critical Paths**:
- ✅ Display pending vendors
- ✅ Approve vendor
- ✅ Reject vendor
- ✅ Confirmation dialogs
- ✅ Error handling
- ✅ List updates after actions

**Test Coverage**:
```
AdminApprovalQueue.tsx      | 90%+ | Statements, Branches, Functions, Lines
useAdminActions.ts          | 85%+ | Statements, Branches, Functions, Lines
```

**Metrics**:
- **Total Lines**: ~400
- **Lines to Cover**: 360+
- **Critical Branches**: 30+
- **Edge Cases**: 12+

### 4. Profile Management (85% Target)

**Critical Paths**:
- ✅ Load profile data
- ✅ Edit profile fields
- ✅ Validate form inputs
- ✅ Save profile changes
- ✅ Handle API errors
- ✅ Display success/error messages

**Test Coverage**:
```
VendorProfileEditor.tsx     | 85%+ | Statements, Branches, Functions, Lines
useProfileUpdate.ts         | 85%+ | Statements, Branches, Functions, Lines
```

**Metrics**:
- **Total Lines**: ~600
- **Lines to Cover**: 510+
- **Critical Branches**: 35+
- **Edge Cases**: 15+

### 5. Dashboard & Navigation (80% Target)

**Critical Paths**:
- ✅ Display vendor info
- ✅ Show tier badge
- ✅ Navigate between sections
- ✅ Display statistics
- ✅ Handle logout

**Test Coverage**:
```
VendorDashboard.tsx         | 85%+ | Statements, Branches, Functions, Lines
DashboardNav.tsx            | 80%+ | Statements, Branches, Functions, Lines
```

**Metrics**:
- **Total Lines**: ~400
- **Lines to Cover**: 320+
- **Critical Branches**: 20+
- **Edge Cases**: 8+

---

## Coverage Metrics Definitions

### Statement Coverage
**Definition**: Percentage of executable statements that are executed during tests

**Target**: 80%+ overall, 90%+ for critical components

**Calculation**:
```
Statement Coverage = (Executed Statements / Total Statements) × 100
```

### Branch Coverage
**Definition**: Percentage of branches (if/else, switch, ternary) that are tested

**Target**: 75%+ overall, 85%+ for critical components

**Calculation**:
```
Branch Coverage = (Executed Branches / Total Branches) × 100
```

### Function Coverage
**Definition**: Percentage of functions that are called during tests

**Target**: 85%+ overall, 95%+ for critical components

**Calculation**:
```
Function Coverage = (Called Functions / Total Functions) × 100
```

### Line Coverage
**Definition**: Percentage of lines of code that are executed during tests

**Target**: 80%+ overall, 90%+ for critical components

**Calculation**:
```
Line Coverage = (Executed Lines / Total Lines) × 100
```

---

## Critical Path Identification

### Path 1: Vendor Registration → Approval → Login (P0)

**Steps**:
1. User fills registration form
2. User submits form
3. Validation passes
4. API call succeeds
5. User receives confirmation
6. Admin views pending vendor
7. Admin approves vendor
8. Vendor logs in
9. Vendor accesses dashboard

**Coverage Requirements**:
- ✅ All steps must have 95%+ coverage
- ✅ All error scenarios must be tested
- ✅ All validation rules must be tested
- ✅ All API interactions must be tested

**Test Files**:
```
__tests__/components/vendor/VendorRegistrationForm.test.tsx
__tests__/components/admin/AdminApprovalQueue.test.tsx
__tests__/components/vendor/VendorLoginForm.test.tsx
__tests__/e2e/complete-vendor-journey.spec.ts
```

### Path 2: Profile Editing with Tier Restrictions (P0)

**Steps**:
1. Vendor logs in
2. Vendor navigates to profile editor
3. System displays profile data
4. System applies tier restrictions
5. Vendor edits allowed fields
6. System validates changes
7. Vendor saves profile
8. API updates profile
9. System displays success message

**Coverage Requirements**:
- ✅ All tier combinations must be tested (free, tier1, tier2)
- ✅ All field restrictions must be tested
- ✅ All validation rules must be tested
- ✅ All API interactions must be tested

**Test Files**:
```
__tests__/components/vendor/VendorProfileEditor.test.tsx
__tests__/components/shared/TierGate.test.tsx
__tests__/e2e/tier-restrictions.spec.ts
```

### Path 3: Admin Approval Workflow (P0)

**Steps**:
1. Admin logs in
2. Admin navigates to approval queue
3. System displays pending vendors
4. Admin clicks approve/reject
5. System shows confirmation dialog
6. Admin confirms action
7. API processes approval/rejection
8. System updates vendor list
9. System displays success message

**Coverage Requirements**:
- ✅ Both approve and reject flows must have 90%+ coverage
- ✅ All error scenarios must be tested
- ✅ All confirmation flows must be tested
- ✅ All API interactions must be tested

**Test Files**:
```
__tests__/components/admin/AdminApprovalQueue.test.tsx
__tests__/e2e/vendor-rejection.spec.ts
```

---

## Uncovered Code Tracking

### Identifying Uncovered Code

```bash
# Generate coverage report with uncovered lines highlighted
npm run test:coverage -- --collectCoverageFrom='components/**/*.{ts,tsx}' --collectCoverageFrom='app/components/**/*.{ts,tsx}'

# View HTML report
open coverage/lcov-report/index.html

# Check coverage summary
npm run test:coverage -- --coverageReporters=text-summary
```

### Acceptable Uncovered Code

The following code patterns are acceptable to leave uncovered:

1. **Type definitions and interfaces**
   ```typescript
   // No need to test
   interface VendorProfile {
     companyName: string;
     tier: 'free' | 'tier1' | 'tier2';
   }
   ```

2. **Simple pass-through functions**
   ```typescript
   // No need to test
   export const formatDate = (date: string) => new Date(date).toLocaleDateString();
   ```

3. **Error boundaries (if basic)**
   ```typescript
   // Optional to test
   class ErrorBoundary extends React.Component {
     componentDidCatch(error, errorInfo) {
       console.error(error, errorInfo);
     }
   }
   ```

4. **Default exports**
   ```typescript
   // No need to test
   export default VendorDashboard;
   ```

### Unacceptable Uncovered Code

The following code MUST be covered:

1. **Business logic functions**
2. **Validation functions**
3. **API call functions**
4. **State management functions**
5. **Conditional rendering logic**
6. **User interaction handlers**
7. **Error handling logic**
8. **Authentication/authorization logic**

---

## Coverage Improvement Plan

### Phase 1: Establish Baseline (Week 1)
- [ ] Run initial coverage report
- [ ] Document current coverage
- [ ] Identify critical gaps
- [ ] Prioritize components to test

### Phase 2: Critical Components (Week 2)
- [ ] AuthContext → 95%+
- [ ] TierGate → 95%+
- [ ] VendorRegistrationForm → 90%+
- [ ] VendorLoginForm → 90%+
- [ ] AdminApprovalQueue → 90%+

### Phase 3: High Priority Components (Week 3)
- [ ] VendorProfileEditor → 85%+
- [ ] VendorDashboard → 85%+
- [ ] useAuth Hook → 90%+

### Phase 4: Remaining Components (Week 4)
- [ ] All other components → 80%+
- [ ] Edge cases → 75%+
- [ ] Error scenarios → 80%+

### Phase 5: E2E Coverage (Week 5)
- [ ] Complete vendor journey
- [ ] Admin approval workflow
- [ ] Tier restriction scenarios
- [ ] Authentication flows
- [ ] Session management

---

## Integration with CI/CD

### GitHub Actions Coverage Check

```yaml
# .github/workflows/test-coverage.yml
name: Test Coverage

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm run test:coverage

      - name: Check coverage thresholds
        run: |
          npx jest --coverage --coverageThreshold='{
            "global": {
              "statements": 80,
              "branches": 75,
              "functions": 85,
              "lines": 80
            },
            "components/": {
              "statements": 85,
              "branches": 80,
              "functions": 90,
              "lines": 85
            }
          }'

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: frontend
          name: frontend-coverage

      - name: Comment PR with coverage
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          lcov-file: ./coverage/lcov.info
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Jest Coverage Configuration

```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'app/components/**/*.{ts,tsx}',
    'contexts/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__tests__/**',
  ],
  coverageThresholds: {
    global: {
      statements: 80,
      branches: 75,
      functions: 85,
      lines: 80,
    },
    // Critical components require higher coverage
    'components/vendor/VendorRegistrationForm.tsx': {
      statements: 90,
      branches: 85,
      functions: 95,
      lines: 90,
    },
    'components/vendor/VendorLoginForm.tsx': {
      statements: 90,
      branches: 85,
      functions: 95,
      lines: 90,
    },
    'contexts/AuthContext.tsx': {
      statements: 95,
      branches: 90,
      functions: 95,
      lines: 95,
    },
  },
};
```

---

## Coverage Reporting

### Weekly Coverage Report Template

```markdown
# Weekly Coverage Report - Week [X]

## Overall Coverage
- **Statements**: [X]% (Target: 80%+)
- **Branches**: [X]% (Target: 75%+)
- **Functions**: [X]% (Target: 85%+)
- **Lines**: [X]% (Target: 80%+)

## Coverage by Component Type
| Component Type | Current | Target | Status |
|---------------|---------|--------|--------|
| Critical | [X]% | 90%+ | 🟢/🟡/🔴 |
| High Priority | [X]% | 85%+ | 🟢/🟡/🔴 |
| Medium Priority | [X]% | 80%+ | 🟢/🟡/🔴 |
| Lower Priority | [X]% | 75%+ | 🟢/🟡/🔴 |

## Components Below Target
1. [Component Name] - Current: [X]%, Target: [Y]% - [Action Plan]
2. [Component Name] - Current: [X]%, Target: [Y]% - [Action Plan]

## Improvements This Week
- [Component Name] increased from [X]% to [Y]%
- [Component Name] reached target coverage of [Y]%

## Next Week Goals
- [ ] Improve [Component Name] to [X]%
- [ ] Reach target for [Component Name]
- [ ] Add E2E tests for [Workflow]
```

### Coverage Badge (README)

```markdown
[![Coverage Status](https://codecov.io/gh/username/repo/branch/main/graph/badge.svg)](https://codecov.io/gh/username/repo)
```

---

## Coverage Monitoring Dashboard

### Recommended Tools
1. **Codecov** - Cloud-based coverage tracking
2. **Coveralls** - Alternative coverage tracking
3. **SonarQube** - Comprehensive code quality + coverage
4. **Istanbul NYC** - Built-in Jest coverage reporter

### Dashboard Metrics to Track
- Overall coverage percentage
- Coverage trend (up/down over time)
- Components below target
- Critical paths coverage
- New code coverage (diff coverage)
- Pull request coverage impact

---

## Coverage Goals Timeline

### Month 1: Foundation (Weeks 1-4)
- **Target**: 60%+ overall coverage
- **Focus**: Critical components (AuthContext, TierGate, Login/Registration forms)

### Month 2: Expansion (Weeks 5-8)
- **Target**: 75%+ overall coverage
- **Focus**: High priority components (Dashboard, Profile Editor, Admin Queue)

### Month 3: Excellence (Weeks 9-12)
- **Target**: 80%+ overall coverage
- **Focus**: All components, E2E tests, edge cases

### Ongoing: Maintenance
- **Target**: Maintain 80%+ coverage
- **Focus**: New features, bug fixes, regression tests

---

## Success Criteria

✅ **Coverage Target Met** when:
1. Overall coverage ≥ 80%
2. All critical components ≥ 90%
3. All high priority components ≥ 85%
4. All critical paths have E2E tests
5. Coverage integrated with CI/CD
6. Coverage reports generated on every PR
7. Coverage trends are monitored
8. Coverage thresholds enforced

---

## References

- [Jest Coverage Documentation](https://jestjs.io/docs/configuration#collectcoveragefrom-array)
- [Istanbul Coverage Reports](https://istanbul.js.org/)
- [Codecov Documentation](https://docs.codecov.com/)
- [Frontend Test Strategy](./frontend-test-strategy.md)
- [E2E Test Patterns](./e2e-test-patterns.md)

---

**Document Status**: ✅ Complete
**Next Phase**: Test Infrastructure Implementation
**Related**: Frontend Test Strategy, E2E Test Patterns
