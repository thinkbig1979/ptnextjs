# [FEATURE_NAME] - Minimal Spec

## Overview

**Purpose**: [Brief 1-2 sentence description of what this feature does]

**Why**: [Brief 1-2 sentence explanation of why this feature is needed]

**Scope**: [Quick statement of what's included and what's not]

---

## Core Requirements

### Functional Requirements
- [ ] [REQUIREMENT_1]: [Brief description]
- [ ] [REQUIREMENT_2]: [Brief description]
- [ ] [REQUIREMENT_3]: [Brief description]
- [ ] [REQUIREMENT_4]: [Brief description]

### Non-Functional Requirements
- [ ] **Performance**: [Performance expectation, e.g., "Page load < 2s"]
- [ ] **Security**: [Security requirement, e.g., "Role-based access control"]
- [ ] **Accessibility**: [Accessibility standard, e.g., "WCAG 2.1 AA compliance"]

---

## Technical Approach

### Implementation Strategy
**Primary Technology**: [Main tech/framework to use, e.g., "React with TypeScript"]

**Key Components**:
1. [COMPONENT_1]: [One-line description]
2. [COMPONENT_2]: [One-line description]
3. [COMPONENT_3]: [One-line description]

### Critical Decisions
- **[DECISION_1]**: [Brief rationale, e.g., "Using PostgreSQL for relational data integrity"]
- **[DECISION_2]**: [Brief rationale, e.g., "Client-side validation for better UX"]
- **[DECISION_3]**: [Brief rationale, e.g., "API-first design for future mobile app"]

### Dependencies
- [DEPENDENCY_1]: [Why needed]
- [DEPENDENCY_2]: [Why needed]

### Data Model (if applicable)
```
[ENTITY_1]:
  - field_1: type
  - field_2: type

[ENTITY_2]:
  - field_a: type
  - field_b: type
```

---

## Acceptance Criteria

### Must Have
- [ ] [CRITERION_1]: [Specific, measurable acceptance criterion]
- [ ] [CRITERION_2]: [Specific, measurable acceptance criterion]
- [ ] [CRITERION_3]: [Specific, measurable acceptance criterion]
- [ ] [CRITERION_4]: [Specific, measurable acceptance criterion]

### Should Have
- [ ] [CRITERION_5]: [Nice to have, but not blocking]
- [ ] [CRITERION_6]: [Nice to have, but not blocking]

### Definition of Done
- [ ] All acceptance criteria met
- [ ] Unit tests written and passing
- [ ] Integration tests passing
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Deployed to staging and verified

---

## Testing Strategy

### Test Coverage
**Unit Tests**:
- [TEST_AREA_1]: [Brief description of what to test]
- [TEST_AREA_2]: [Brief description of what to test]

**Integration Tests**:
- [INTEGRATION_TEST_1]: [Brief description]
- [INTEGRATION_TEST_2]: [Brief description]

**E2E Tests**:
- [E2E_SCENARIO_1]: [Brief user journey to test]
- [E2E_SCENARIO_2]: [Brief user journey to test]

### Critical Test Cases
1. **[TEST_CASE_1]**: [Expected behavior]
2. **[TEST_CASE_2]**: [Expected behavior]
3. **[TEST_CASE_3]**: [Expected behavior]
4. **[TEST_CASE_4]**: [Expected behavior]

### Edge Cases to Validate
- [EDGE_CASE_1]: [How to handle]
- [EDGE_CASE_2]: [How to handle]
- [EDGE_CASE_3]: [How to handle]

---

## Implementation Notes

### File Structure
```
[MAIN_DIRECTORY]/
├── [FILE_1].[ext]
├── [FILE_2].[ext]
├── [SUBDIRECTORY_1]/
│   ├── [FILE_3].[ext]
│   └── [FILE_4].[ext]
└── tests/
    └── [TEST_FILE].[ext]
```

### API Endpoints (if applicable)
- `[METHOD] [ENDPOINT_1]`: [Purpose]
- `[METHOD] [ENDPOINT_2]`: [Purpose]
- `[METHOD] [ENDPOINT_3]`: [Purpose]

### Configuration
- [CONFIG_ITEM_1]: [Value/approach]
- [CONFIG_ITEM_2]: [Value/approach]

---

## Reusability Analysis

Identify opportunities to extract reusable components following compounding engineering principles. See `@.agent-os/standards/best-practices.md` for philosophy.

### Existing Patterns to Reuse
- **Pattern/Component**: [Name]
  - **Location**: `file:line`
  - **How to reuse**: [Brief description]
  - **Modifications needed**: [None/Minor/Adapt]

### New Reusable Components
- **Component**: [Name and purpose]
  - **Abstraction level**: [Utility/Service/Module/Library]
  - **Future use cases**: [List potential reuses]

### Compound Value Assessment
- **Immediate value**: [Direct benefit of this feature]
- **Future value**: [How it makes future features easier]
- **Compound factor**: [Low/Medium/High/Very High]

### Refactoring Opportunities (if any)
- **Location**: `file:line`
  - **Current issue**: [What makes it hard to reuse]
  - **Proposed refactor**: [How to improve it]
  - **Priority**: [High/Medium/Low]

---

## Failure Modes & Anti-Patterns

> Reference: `@.agent-os/instructions/utilities/quality-lenses.md#inversion-lens`
> Status: [COMPLETED | SKIPPED - see justification below]

### Identified Failure Modes

| Mode | Category | Severity | Mitigation |
|------|----------|----------|------------|
| [FAILURE_MODE_1] | [Adoption/Execution/Evolution/Security] | [High/Med/Low] | [Constraint] |
| [FAILURE_MODE_2] | [Adoption/Execution/Evolution/Security] | [High/Med/Low] | [Constraint] |
| [FAILURE_MODE_3] | [Adoption/Execution/Evolution/Security] | [High/Med/Low] | [Constraint] |
| [FAILURE_MODE_4] | [Adoption/Execution/Evolution/Security] | [High/Med/Low] | [Constraint] |

### Anti-Patterns to Avoid

- **DO NOT** [ANTI_PATTERN_1] because [reason from failure analysis]
- **DO NOT** [ANTI_PATTERN_2] because [reason from failure analysis]

### Derived Constraints

- **MUST** [CONSTRAINT_1] (from: [failure category])
- **MUST** [CONSTRAINT_2] (from: [failure category])
- **SHOULD** [CONSTRAINT_3] (from: [failure category])
- **SHOULD** [CONSTRAINT_4] (from: [failure category])

<!-- For P3-P4 features that skip inversion analysis, replace above with: -->
<!--
### Inversion Analysis

**Status**: SKIPPED
**Priority**: [P3|P4]
**Justification**: [All of: no security implications, no data integrity risks, no external integrations, <4h work, pure docs/config]
-->

---

## Pre-Mortem Risk Analysis

> Reference: `@.agent-os/instructions/utilities/quality-lenses.md#pre-mortem-lens`
> Status: [COMPLETED | SKIPPED - see justification below]

### Failure Scenario

> "It's 6 months from now. This feature has failed completely. Why?"

### Risk Assessment

| Cause | Category | L | I | D | Score | Mitigation |
|-------|----------|---|---|---|-------|------------|
| [RISK_1] | [Technical/Product/Process/External] | [1-5] | [1-5] | [1-5] | [L*I*D/2] | [Mitigation] |
| [RISK_2] | [Technical/Product/Process/External] | [1-5] | [1-5] | [1-5] | [L*I*D/2] | [Mitigation] |

**Scoring**: L=Likelihood, I=Impact, D=Detectability. Score > 12 requires mitigation.

### High-Risk Mitigations (Score > 12)

1. **[RISK_TITLE]**: [Action] - Owner: [Name], Deadline: [Date]

### Early Warning Indicators

- [ ] [INDICATOR_1]: [Threshold]
- [ ] [INDICATOR_2]: [Threshold]

<!-- For P2-P4 features that skip pre-mortem analysis, replace above with: -->
<!--
### Pre-Mortem Analysis

**Status**: SKIPPED
**Priority**: [P2|P3|P4]
**Justification**: [All of: no external dependencies, no data integrity risks, no security implications, low complexity]
-->

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| [RISK_1] | [High/Medium/Low] | [Mitigation strategy] |
| [RISK_2] | [High/Medium/Low] | [Mitigation strategy] |
| [RISK_3] | [High/Medium/Low] | [Mitigation strategy] |

---

## Success Metrics

**How we'll measure success**:
- [METRIC_1]: [Target value]
- [METRIC_2]: [Target value]
- [METRIC_3]: [Target value]

---

## Timeline

- **Specification**: [TIME_ESTIMATE]
- **Implementation**: [TIME_ESTIMATE]
- **Testing**: [TIME_ESTIMATE]
- **Review & Deploy**: [TIME_ESTIMATE]

**Total Estimated Time**: [TOTAL_TIME]

---

**Template Version**: 1.1.0
**Created**: [DATE]
**Last Updated**: [DATE]
