# E2E Test Placement Checklist

> **Version**: 1.0.0 | Agent OS v5.1.0
> **Purpose**: Determine correct tier (smoke/core/regression) and location for E2E tests
> **Status**: CANONICAL - Referenced by test-architect and execute-tasks.md

---

## Overview

This checklist ensures E2E tests are placed in the correct tier for optimal CI/CD execution:

- **Smoke** (every commit): Critical paths that must always work
- **Core** (every PR): Main feature coverage
- **Regression** (nightly): Edge cases, validation, security

Proper placement ensures fast feedback on critical issues while comprehensive coverage runs at appropriate times.

---

## 1. Pre-Placement Checklist (MANDATORY)

Complete this checklist BEFORE creating any E2E test file.

```yaml
pre_placement_checklist:
  # Step 0: Verify test is needed
  coverage_analysis:
    existing_tests_reviewed: false  # REQUIRED: Did you check for existing coverage?
    gap_identified: ""              # What gap does this test fill?
    not_redundant_because: ""       # Why isn't this covered by existing tests?

  # Step 1: Feature criticality
  feature_assessment:
    feature_name: ""                # What feature is being tested?
    user_impact: ""                 # high | medium | low
    revenue_impact: ""              # high | medium | low | none
    security_relevant: false        # Does it involve auth/authz/sensitive data?

  # Step 2: Test characteristics
  test_characteristics:
    estimated_duration: ""          # seconds
    requires_data_setup: false      # Needs specific test data?
    modifies_shared_state: false    # Changes data that affects other tests?
    flakiness_risk: ""              # high | medium | low

  # Step 3: Tier decision
  tier_decision:
    selected_tier: ""               # smoke | core | regression | quarantine
    rationale: ""                   # Why this tier?

  # Step 4: Location
  file_location:
    feature_group: ""               # auth | dashboard | settings | etc.
    file_name: ""                   # [feature].spec.ts
    full_path: ""                   # tests/e2e/[tier]/[group]/[file].spec.ts
```

---

## 2. Tier Decision Matrix

### 2.1 Smoke Tier (Every Commit)

**Criteria** (ALL must be true):
- [ ] Critical user journey (auth, core feature, data creation)
- [ ] High user impact if broken
- [ ] Stable (low flakiness risk)
- [ ] Fast (< 30 seconds)
- [ ] No complex data setup

**Examples**:
| Test | Justification |
|------|---------------|
| User login | Critical path, high impact, fast |
| User registration | Revenue-impacting, must always work |
| Dashboard loads | Core functionality verification |
| Create primary entity | Main value proposition |

**File Pattern**: `tests/e2e/smoke/[feature].spec.ts`

**Suite Duration Target**: < 2 minutes total

### 2.2 Core Tier (Every PR)

**Criteria** (ANY):
- [ ] Feature happy path (not critical, but important)
- [ ] CRUD operations for secondary features
- [ ] Settings/preferences functionality
- [ ] Medium user impact if broken

**Examples**:
| Test | Justification |
|------|---------------|
| Update user profile | Important but not critical |
| Search functionality | Core feature, medium impact |
| Export data | Valuable feature, acceptable delay |
| Notification settings | User preferences |

**File Pattern**: `tests/e2e/core/[feature-group]/[feature].spec.ts`

**Suite Duration Target**: < 20 minutes total

### 2.3 Regression Tier (Nightly)

**Criteria** (ANY):
- [ ] Edge cases and boundary conditions
- [ ] Error handling and validation
- [ ] Less common user paths
- [ ] Slower tests (> 30 seconds)
- [ ] Complex data setup required

**Examples**:
| Test | Justification |
|------|---------------|
| Form validation errors | Edge case testing |
| Rate limiting behavior | Security edge case |
| Large file upload | Slow, complex setup |
| Concurrent user scenarios | Complex, edge case |

**File Pattern**: `tests/e2e/regression/[feature-group]/[feature].spec.ts`

**Suite Duration Target**: < 45 minutes total

### 2.4 Quarantine Tier (Manual Only)

**Criteria** (ANY):
- [ ] Currently broken (known failure)
- [ ] Flaky (intermittent failures)
- [ ] Under investigation
- [ ] Awaiting fix in separate issue

**Requirements**:
- MUST have tracking issue
- MUST have owner assigned
- MUST have resolution deadline (max 30 days)

**File Pattern**: `tests/e2e/quarantine/[feature].spec.ts`

---

## 3. Decision Flow

```
START: New E2E test needed
│
├─► Is this a CRITICAL user journey?
│   ├─► YES: Is it fast (< 30s) and stable?
│   │   ├─► YES → SMOKE tier
│   │   └─► NO  → CORE tier (optimize for speed later)
│   │
│   └─► NO: Is this a main feature happy path?
│       ├─► YES → CORE tier
│       │
│       └─► NO: Is this an edge case, error path, or slow test?
│           ├─► YES → REGRESSION tier
│           │
│           └─► NO: Is this test currently broken or flaky?
│               ├─► YES → QUARANTINE tier
│               └─► NO  → Re-evaluate if test is needed
```

---

## 4. Feature Group Assignment

Organize tests by feature group within each tier.

### Standard Feature Groups

| Group | Contains | Examples |
|-------|----------|----------|
| `auth` | Authentication and authorization | login, register, logout, password-reset |
| `dashboard` | Main dashboard functionality | stats, overview, quick-actions |
| `user-management` | User CRUD and settings | profile, preferences, account |
| `[entity]-management` | Primary entity CRUD | products, orders, invoices |
| `search` | Search and filtering | global-search, filters, sorting |
| `settings` | Application settings | system-settings, integrations |
| `admin` | Administrative functions | admin-dashboard, user-admin |
| `reports` | Reporting and analytics | exports, charts, dashboards |

### Directory Structure

```
tests/e2e/
├── smoke/
│   ├── auth.spec.ts           # Login, register (no subdirectory for critical)
│   ├── dashboard.spec.ts
│   └── core-entity.spec.ts
│
├── core/
│   ├── auth/
│   │   ├── password-reset.spec.ts
│   │   └── session-management.spec.ts
│   ├── user-management/
│   │   ├── profile.spec.ts
│   │   └── preferences.spec.ts
│   └── search/
│       └── global-search.spec.ts
│
├── regression/
│   ├── auth/
│   │   ├── validation.spec.ts
│   │   └── rate-limiting.spec.ts
│   ├── user-management/
│   │   └── edge-cases.spec.ts
│   └── error-handling/
│       └── api-errors.spec.ts
│
└── quarantine/
    └── flaky-upload.spec.ts   # Tracking: #123
```

---

## 5. Test Inventory Integration

After placing a test, update the test inventory.

### 5.1 Inventory File Location

`tests/e2e/test-inventory.ts`

### 5.2 Inventory Entry Format

```typescript
// test-inventory.ts
export const testInventory = {
  smoke: [
    {
      file: 'smoke/auth.spec.ts',
      tests: ['user can login', 'user can register'],
      estimatedDuration: 15, // seconds
      lastUpdated: '2025-01-15',
    },
    // ...
  ],
  core: [
    {
      file: 'core/user-management/profile.spec.ts',
      tests: ['user can update profile', 'user can change avatar'],
      estimatedDuration: 25,
      featureGroup: 'user-management',
      lastUpdated: '2025-01-15',
    },
    // ...
  ],
  regression: [
    // ...
  ],
  quarantine: [
    {
      file: 'quarantine/flaky-upload.spec.ts',
      tests: ['large file upload'],
      reason: 'Intermittent timeout on CI',
      trackingIssue: '#123',
      owner: 'developer-name',
      quarantinedDate: '2025-01-10',
      deadline: '2025-02-10',
    },
  ],
};
```

### 5.3 Update Commands

```bash
# List all tests by tier
npm run test:e2e:list

# Validate inventory matches actual files
npm run test:e2e:validate-inventory

# Run specific tier
npm run test:e2e:smoke
npm run test:e2e:core
npm run test:e2e:regression
```

---

## 6. Placement Confirmation Output

Before creating the test file, output this confirmation:

```
═══════════════════════════════════════════════════════════════════
E2E TEST PLACEMENT - CONFIRMED
═══════════════════════════════════════════════════════════════════

✓ Coverage Analysis:
  - Existing tests reviewed: YES
  - Gap identified: [description]
  - Not redundant because: [reason]

✓ Feature: [feature name]
  - User Impact: [high/medium/low]
  - Security Relevant: [yes/no]

✓ Tier: [SMOKE/CORE/REGRESSION]
  - Rationale: [why this tier]

✓ Location:
  - Feature Group: [group]
  - File: tests/e2e/[tier]/[group]/[feature].spec.ts

✓ Inventory:
  - Will update: test-inventory.ts

PROCEEDING TO TEST CREATION...
═══════════════════════════════════════════════════════════════════
```

---

## 7. Tier Migration Guidelines

### 7.1 Promoting Tests (Higher → Lower Tier)

**Regression → Core**:
- Test has been stable for 2+ weeks
- Covers an important (not critical) feature
- Duration is acceptable (< 30s)

**Core → Smoke**:
- Test covers critical user journey
- Test is fast (< 15s ideally, < 30s max)
- Test has been stable for 1+ month
- High user/revenue impact if broken

### 7.2 Demoting Tests (Lower → Higher Tier)

**Smoke → Core**:
- Test is too slow (> 30s)
- Test is flaky (failed 2+ times in a week)
- Feature is no longer critical

**Core → Regression**:
- Test is slow (> 60s)
- Test covers edge case, not happy path
- Feature usage is low

**Any → Quarantine**:
- Test is currently broken
- Test is flaky (> 3 failures in a week)
- Must create tracking issue

---

## 8. Verification Checklist

Before marking placement complete:

- [ ] Pre-placement checklist completed
- [ ] Tier decision documented with rationale
- [ ] Feature group assigned
- [ ] File path follows convention: `tests/e2e/[tier]/[group]/[feature].spec.ts`
- [ ] Test inventory updated with new test
- [ ] Test runs successfully in assigned tier
- [ ] Duration is within tier target
- [ ] No redundant coverage with existing tests

---

## 9. Related Documents

| Document | Purpose |
|----------|---------|
| `@standards/testing-standards.md` | Canonical timeout/location values |
| `@instructions/utilities/ui-component-testing-strategy.md` | Test type decision tree |
| `@config.yml` → `e2e_test_organization` | Tier configuration |
| `~/.claude/skills/e2e-test-organization/` | Tier definitions and workflows |
