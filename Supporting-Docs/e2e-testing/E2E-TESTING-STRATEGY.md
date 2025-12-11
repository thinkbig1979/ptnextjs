# E2E Testing Strategy - Unified Approach

This document provides a comprehensive, repeatable instruction set for organizing, creating, running, and repairing E2E tests.

## Table of Contents

1. [Overview: Two Complementary Systems](#overview-two-complementary-systems)
2. [Part A: Tiered Test Organization](#part-a-tiered-test-organization)
3. [Part B: Test Creation Guidelines](#part-b-test-creation-guidelines)
4. [Part C: Test Execution Workflows](#part-c-test-execution-workflows)
5. [Part D: Test Repair Protocol](#part-d-test-repair-protocol)
6. [Comparison Analysis](#comparison-analysis)

---

## Overview: Two Complementary Systems

This project uses two complementary systems for E2E testing:

| System | Purpose | When to Use |
|--------|---------|-------------|
| **Tiered Test Organization** | Organize and run tests efficiently | Daily development, PRs, releases |
| **fix-e2e-tests Protocol** | Repair broken test suites systematically | When tests are failing (50+ failures) |

### How They Work Together

```
DAILY WORKFLOW                          REPAIR WORKFLOW
===============                          ================

1. Developer makes changes               1. Tests failing (50+)
2. Run smoke tests (2 min)               2. /fix-e2e-tests command
3. If pass, commit                       3. Parallel discovery
4. Before PR: run core tests             4. Categorize failures
5. Before release: run full suite        5. Fix by category
                                         6. Verify and iterate
        |                                        |
        v                                        v
   TIERED SYSTEM                          REPAIR PROTOCOL
   (test-inventory.ts)                    (e2e-test-repair skill)
```

---

## Part A: Tiered Test Organization

### A.1 Test Tiers

Tests are organized into tiers based on criticality and execution time:

| Tier | Files | Duration | Purpose | When to Run |
|------|-------|----------|---------|-------------|
| **smoke** | 4 | ~2 min | Critical user journeys | Every commit |
| **core** | 26 | ~20 min | Main feature coverage | Pull requests |
| **regression** | 44 | ~45 min | Edge cases, validation | Nightly |
| **full** | 70 | ~60 min | Complete suite | Before release |
| **quarantine** | 23 | varies | Broken/debug tests | Manual only |

### A.2 Tier Definitions

**SMOKE (Critical Path)**
- Registration, authentication, basic dashboard
- If these fail, the application is fundamentally broken
- Must ALWAYS pass

**CORE (Main Features)**
- Tier upgrade/downgrade, location management, products
- Should pass before merging any PR
- Covers primary user workflows

**REGRESSION (Full Coverage)**
- Edge cases, validation errors, security tests
- Run nightly or before releases
- Catches subtle issues

**QUARANTINE (Isolated)**
- Debug/temporary tests
- Tests with known issues needing fix
- Excluded from CI/CD

### A.3 Feature Groups

Tests can also be run by feature area:

| Feature | Tests | Use Case |
|---------|-------|----------|
| auth | 5 | After auth changes |
| tiers | 8 | After tier system changes |
| locations | 13 | After location/map changes |
| products | 9 | After product changes |
| excel | 5 | After import/export changes |
| dashboard | 7 | After dashboard changes |
| search | 10 | After search changes |
| vendor-onboarding | 12 | After onboarding flow changes |

### A.4 Configuration Files

**`tests/e2e/test-inventory.ts`** - Source of truth for categorization:
```typescript
export const TEST_TIERS = {
  smoke: ['file1.spec.ts', ...],
  core: ['file2.spec.ts', ...],
  regression: ['file3.spec.ts', ...],
  quarantine: ['debug-file.spec.ts', ...]
};

export const FEATURE_GROUPS = {
  auth: ['auth-test.spec.ts', ...],
  tiers: ['tier-test.spec.ts', ...],
  // ...
};
```

**`playwright.config.ts`** - Reads from inventory based on env vars:
```typescript
const tier = process.env.TEST_TIER || 'full';
const feature = process.env.TEST_FEATURE;
// Dynamically selects test files
```

---

## Part B: Test Creation Guidelines

### B.1 Where to Place New Tests

When creating a new test, determine its tier:

```
Decision Tree:
==============

Is this a critical user journey?
(registration, login, basic dashboard access)
  |
  +-- YES --> SMOKE tier
  |
  NO
  |
  v
Is this a main feature test?
(tier upgrades, location management, products)
  |
  +-- YES --> CORE tier
  |
  NO
  |
  v
Is this an edge case, validation, or security test?
  |
  +-- YES --> REGRESSION tier
  |
  NO
  |
  v
Is this a debug/temporary test?
  |
  +-- YES --> QUARANTINE tier
```

### B.2 Adding a New Test

1. **Create the test file** in `tests/e2e/` or appropriate subdirectory

2. **Add to test-inventory.ts** in the correct tier:
   ```typescript
   // In tests/e2e/test-inventory.ts
   export const TEST_TIERS = {
     core: [
       // ... existing tests
       'my-new-feature.spec.ts',  // Add here
     ],
   };
   ```

3. **Add to feature group** if applicable:
   ```typescript
   export const FEATURE_GROUPS = {
     dashboard: [
       // ... existing tests
       'my-new-feature.spec.ts',  // Add here too
     ],
   };
   ```

4. **Verify categorization**:
   ```bash
   npm run test:e2e:list  # Should show updated counts
   ```

### B.3 Test File Naming Convention

```
{feature}-{description}.spec.ts

Examples:
  vendor-registration-flow.spec.ts       # SMOKE - critical path
  tier-upgrade-happy-path.spec.ts        # CORE - main feature
  excel-import-validation-errors.spec.ts # REGRESSION - edge case
  debug-form-submission.spec.ts          # QUARANTINE - debug
```

### B.4 Test Structure Best Practices

```typescript
import { test, expect } from '@playwright/test';

// Use descriptive test names that explain the user journey
test.describe('Feature Name', () => {

  // Setup - use beforeAll for expensive operations
  test.beforeAll(async () => {
    // Seed data, clear rate limits
  });

  // Critical path test - could be SMOKE
  test('should complete primary user flow', async ({ page }) => {
    // Test the happy path
  });

  // Edge case test - REGRESSION
  test('should handle validation errors gracefully', async ({ page }) => {
    // Test error handling
  });
});
```

---

## Part C: Test Execution Workflows

### C.1 Quick Reference Commands

```bash
# TIERED EXECUTION
npm run test:e2e:smoke      # ~2 min - critical paths
npm run test:e2e:core       # ~20 min - main features
npm run test:e2e:full       # ~60 min - complete suite
npm run test:e2e:regression # ~45 min - edge cases only

# FEATURE-SPECIFIC
npm run test:e2e:auth       # After auth changes
npm run test:e2e:tiers      # After tier system changes
npm run test:e2e:locations  # After location changes
npm run test:e2e:products   # After product changes
npm run test:e2e:excel      # After import/export changes
npm run test:e2e:dashboard  # After dashboard changes

# UTILITIES
npm run test:e2e:list       # Show tier breakdown
npm run test:e2e:ui         # Playwright UI mode
npm run test:e2e:debug      # Debug mode
```

### C.2 Development Workflow

```
+------------------+     +------------------+     +------------------+
|  Make Changes    | --> |  Run Smoke Tests | --> |  Commit & Push   |
|                  |     |  (2 min)         |     |                  |
+------------------+     +------------------+     +------------------+
                                |
                                | If fail
                                v
                         +------------------+
                         |  Fix & Retry     |
                         +------------------+
```

**Commands:**
```bash
# After making changes
npm run test:e2e:smoke

# If working on specific feature
npm run test:e2e:auth  # or appropriate feature
```

### C.3 Pull Request Workflow

```
+------------------+     +------------------+     +------------------+
|  Feature Branch  | --> |  Run Core Tests  | --> |  Create PR       |
|  Complete        |     |  (20 min)        |     |                  |
+------------------+     +------------------+     +------------------+
                                |
                                | If fail
                                v
                         +------------------+
                         |  Fix & Re-run    |
                         +------------------+
```

**Commands:**
```bash
# Before creating PR
npm run test:e2e:core
```

### C.4 Release Workflow

```
+------------------+     +------------------+     +------------------+
|  Release Branch  | --> |  Run Full Suite  | --> |  Tag & Deploy    |
|  Ready           |     |  (60 min)        |     |                  |
+------------------+     +------------------+     +------------------+
                                |
                                | If fail
                                v
                         +------------------+
                         |  /fix-e2e-tests  |
                         +------------------+
```

**Commands:**
```bash
# Before release
npm run test:e2e:full

# If many failures
/fix-e2e-tests
```

### C.5 Pre-Flight Checklist

Before running any E2E tests:

1. **Start dev server:**
   ```bash
   DISABLE_EMAILS=true DISABLE_RATE_LIMIT=true npm run dev
   ```

2. **Verify server is up:**
   ```bash
   curl -sf http://localhost:3000 && echo "OK"
   ```

3. **Clear rate limits:**
   ```bash
   curl -X POST http://localhost:3000/api/test/rate-limit/clear
   ```

The test runner does this automatically, but manual verification helps debug issues.

---

## Part D: Test Repair Protocol

### D.1 When to Use /fix-e2e-tests

Use the repair protocol when:
- 50+ tests failing
- Multiple categories of failures
- Systematic issues (auth broken, rate limits, etc.)
- After major code changes

### D.2 Repair Workflow Overview

```
/fix-e2e-tests
     |
     v
+--------------------+
| Phase 0: Pre-Flight|  Check server, parallel-runner
+--------------------+
     |
     v
+--------------------+
| Phase 1: Discovery |  Run all tests via parallel-runner.ts
|    (PARALLEL)      |  Returns aggregated.json
+--------------------+
     |
     v
+--------------------+
| Phase 2: Analysis  |  Categorize failures
+--------------------+
     |
     | If APPLICATION_BUG found
     v
+--------------------+
| Phase 2.5: Bug Fix |  STOP - Fix app bugs FIRST
|    (BLOCKING)      |  Never work around app bugs
+--------------------+
     |
     v
+--------------------+
| Phase 3: Fix       |  Dispatch fix agents per category
|    (PARALLEL)      |  AUTH, RATE_LIMIT, SELECTOR, etc.
+--------------------+
     |
     v
+--------------------+
| Phase 4: Verify    |  Re-run affected tests
+--------------------+
     |
     v
+--------------------+
| Phase 5: Iterate   |  Repeat until 90%+ pass rate
+--------------------+
```

### D.3 Failure Categories

| Category | Indicators | Priority | Fix |
|----------|------------|----------|-----|
| APPLICATION_BUG | App behavior wrong | P0-BLOCKING | Fix app first |
| AUTH_FAILURE | 401, Invalid credentials | P0 | Sync passwords |
| RATE_LIMIT | 429, Too many requests | P0 | Clear limits |
| SERVER_ERROR | 500, ECONNREFUSED | P0 | Rebuild, restart |
| DATA_MISSING | Test data not found | P1 | Re-seed data |
| SELECTOR_BROKEN | Element not found | P2 | Update selectors |
| LOGIC_ERROR | Test assertion wrong | P2 | Fix test logic |
| HANG | No progress 30s+ | P3 | Skip, investigate |

### D.4 Critical Rule: APPLICATION_BUG

**NEVER work around application bugs. ALWAYS fix them first.**

When a test fails because the APP is wrong (not the test):
1. STOP all test repair
2. Create bug task: `bd create --title="BUG: description" --type=bug`
3. Fix the application code
4. Verify with original test expectations
5. ONLY THEN continue test repair

**FORBIDDEN:**
- Tests that expect buggy behavior
- Workarounds in test code
- Skipping tests because app is broken
- Changing assertions to match wrong output

### D.5 Quarantine Management

When tests fail repeatedly and need investigation:

1. Move to quarantine in test-inventory.ts:
   ```typescript
   quarantine: [
     // Tests with known issues
     'broken-test.spec.ts',  // TODO: Fix form placeholder
   ],
   ```

2. Document the issue as a comment

3. Create a task to fix later:
   ```bash
   bd create --title="Fix broken-test.spec.ts - form placeholder issue" --type=task
   ```

4. Remove from quarantine once fixed

---

## Comparison Analysis

### Tiered System vs fix-e2e-tests

| Aspect | Tiered System | fix-e2e-tests |
|--------|---------------|---------------|
| **Purpose** | Organize & run efficiently | Repair broken suites |
| **When** | Daily development | Major failures |
| **Approach** | Proactive, preventive | Reactive, corrective |
| **Granularity** | Tier/feature selection | Category-based repair |
| **Parallelism** | Playwright workers | Custom parallel-runner.ts |
| **Output** | Pass/fail per tier | Categorized fix plan |

### How They Complement Each Other

1. **Tiered System PREVENTS** the need for fix-e2e-tests:
   - Running smoke tests catches issues early
   - Quick feedback loop prevents accumulation

2. **fix-e2e-tests REPAIRS** when prevention fails:
   - Systematic categorization
   - Parallel fix implementation
   - Ensures 90%+ pass rate

### Recommended Integration

```
Development Cycle:
==================

1. DAILY: Use tiered system
   - smoke tests after changes
   - feature tests for targeted validation

2. PR: Use core tier
   - Catches regressions before merge

3. RELEASE: Use full tier
   - If failures > 50, switch to /fix-e2e-tests

4. REPAIR: Use fix-e2e-tests
   - Systematic repair when needed
   - Returns to tiered system when stable
```

---

## Summary: Quick Decision Guide

### What command should I run?

| Situation | Command |
|-----------|---------|
| Quick validation after changes | `npm run test:e2e:smoke` |
| Before creating PR | `npm run test:e2e:core` |
| Before release | `npm run test:e2e:full` |
| After changing auth code | `npm run test:e2e:auth` |
| After changing tier system | `npm run test:e2e:tiers` |
| 50+ tests failing | `/fix-e2e-tests` |
| See test inventory | `npm run test:e2e:list` |

### Where should I put a new test?

| Test Type | Tier | Feature Group |
|-----------|------|---------------|
| Critical user journey | smoke | - |
| Main feature happy path | core | relevant feature |
| Validation/edge case | regression | relevant feature |
| Security test | regression | auth |
| Debug/temporary | quarantine | - |

### What if tests are failing?

1. **Few failures (< 10)**: Fix manually
2. **Many failures (10-50)**: Run by feature to isolate
3. **Mass failures (50+)**: Use `/fix-e2e-tests`
4. **Persistent failures**: Move to quarantine, create task
