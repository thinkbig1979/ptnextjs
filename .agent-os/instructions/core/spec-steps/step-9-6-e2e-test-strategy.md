---
version: 5.1.0
last-updated: 2026-01-02
related-files:
  - instructions/core/create-spec.md
---


# Step 9.6: Create E2E Test Strategy (Conditional)

**Subagent**: file-creator

**Condition**: `IF spec_requires_frontend_or_ui OR spec_has_user_flows`

File: `{AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/e2e-test-strategy.md`

**MANDATORY FOR UI FEATURES**: E2E test strategy must be defined BEFORE implementation.

---

## Template

```markdown
# E2E Test Strategy

> Spec: [SPEC_NAME]
> Created: [CURRENT_DATE]

## 1. User Flow Inventory

List all user flows that require E2E testing:

| Flow | Critical? | Tier | Priority |
|------|-----------|------|----------|
| [FLOW_1] | YES/NO | smoke/core/regression | P0/P1/P2 |
| [FLOW_2] | YES/NO | smoke/core/regression | P0/P1/P2 |

## 2. Critical Path Tests (Smoke Tier)

### [FLOW_NAME] (e.g., User Login)

**File**: `tests/e2e/smoke/[feature].spec.ts`

**Steps**:
1. Navigate to [PAGE]
2. [ACTION] - expect [RESULT]
3. [ACTION] - expect [RESULT]
4. Verify [FINAL_STATE]

**Test Data Requirements**:
- [DATA_REQUIREMENT_1]
- [DATA_REQUIREMENT_2]

**Success Criteria**:
- [ASSERTION_1]
- [ASSERTION_2]

**data-testid Elements**:
| Element | data-testid | Purpose |
|---------|-------------|---------|
| [ELEMENT] | [feature]-[element] | [PURPOSE] |

## 3. Core Feature Tests (Core Tier)

### [FEATURE_NAME]

**File**: `tests/e2e/core/[feature-group]/[feature].spec.ts`

**Scenarios**:
- Happy path: [DESCRIPTION]
- Error handling: [DESCRIPTION]
- Edge cases: [DESCRIPTION]

## 4. Regression Tests (Regression Tier)

### Edge Cases

| Test | Scenario | Expected |
|------|----------|----------|
| [TEST_1] | [SCENARIO] | [EXPECTED] |

### Validation Tests

| Field | Invalid Input | Expected Error |
|-------|---------------|----------------|
| [FIELD] | [INPUT] | [ERROR_MESSAGE] |

## 5. Accessibility Testing Requirements

### Per-Page Requirements

| Page | axe-core Scan | Keyboard Nav | Screen Reader |
|------|---------------|--------------|---------------|
| [PAGE] | Required | Required | Recommended |

### Component Requirements

| Component | WCAG Criteria | Test Method |
|-----------|---------------|-------------|
| [COMPONENT] | [CRITERIA] | unit/e2e |

## 6. Browser Validation Matrix

| Page/Flow | Chrome | Firefox | Safari | Mobile |
|-----------|--------|---------|--------|--------|
| [PAGE/FLOW] | Y | Y | Y/- | Y |

## 7. Test Data Setup

### Fixtures Required

| Fixture | Data | Used By |
|---------|------|---------|
| [FIXTURE] | [DESCRIPTION] | [TEST_FILES] |

### Environment Requirements

- [ ] Database seeded with: [DATA]
- [ ] Auth tokens for: [USER_TYPES]
- [ ] Feature flags: [FLAGS]

## 8. Test File Locations

| Test | Location | Tier |
|------|----------|------|
| [TEST_1] | tests/e2e/[tier]/[group]/[file].spec.ts | [TIER] |

## 9. Integration with test-inventory.ts

After implementation, update `tests/e2e/test-inventory.ts`:

\`\`\`typescript
// Add to smoke tier
{ file: 'smoke/[feature].spec.ts', tests: [...], estimatedDuration: N }

// Add to core tier
{ file: 'core/[group]/[feature].spec.ts', tests: [...], featureGroup: '[group]' }
\`\`\`

## 10. Acceptance Criteria for E2E Tests

- [ ] All smoke tests pass on every commit
- [ ] All core tests pass on PR
- [ ] Accessibility scan shows 0 violations
- [ ] Test inventory updated with new tests
- [ ] data-testid attributes added to components
```

---

## Validation Gates

**E2E Strategy Complete When**:
- [ ] All user flows identified and prioritized
- [ ] Tier assignment for each test (smoke/core/regression)
- [ ] data-testid elements specified for all interactive elements
- [ ] Test data requirements documented
- [ ] Accessibility requirements per page/component defined
- [ ] Browser matrix completed
- [ ] Test file locations specified

**Block Task Creation If**:
- Missing user flow inventory
- No tier assignments
- No data-testid specifications for forms
- No accessibility requirements
