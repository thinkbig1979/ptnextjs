---
description: Spec Creation Rules for Agent OS
globs:
alwaysApply: false
version: 5.1.0
encoding: UTF-8
---

# Spec Creation Rules

Generate detailed feature specifications aligned with product roadmap and mission.

## CRITICAL: Subagent Delegation

When delegating via `Task()`, MUST use template:
`@.agent-os/instructions/utilities/subagent-delegation-template.md`

**Why**: Subagents don't inherit:
- Mandatory skill invocations (Step 3.8)
- Pattern lookup hierarchy
- shadcn MCP requirements for UI specs

**Required in ALL delegation prompts**:
```yaml
mandatory_inclusions:
  1_pattern_lookup: |
    BEFORE writing spec: READ standards/testing-standards.md
    For UI: mcp__shadcn__list_components(), mcp__shadcn__get_component_demo()

  2_pattern_priority: |
    FIRST: .agent-os/patterns/ (project-specific)
    SECOND: standards/ (generic patterns)
    THIRD: WebSearch (fallback)

  3_confirmation: |
    CONFIRM patterns/demos loaded in spec
```

## Prerequisites

Run BEFORE create-spec:
- `plan-product.md` (new products) OR
- `analyze-product.md` (existing codebases)

Ensures:
- `.agent-os/product/mission-lite.md`
- `.agent-os/product/tech-stack.md`

<pre_flight_check>
  EXECUTE: @.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

---

## Process Flow Overview

| Phase | Steps | Description | Reference |
|-------|-------|-------------|-----------|
| Setup | 0-1.5 | Prerequisites, root detection, pattern discovery | `step-0-1-prerequisites.md` |
| Initiation | 2-2.5 | Spec initiation, detail level selection | `step-2-initiation.md` |
| Quality Lenses | 2.6-2.7 | Inversion analysis, pre-mortem | `step-2-6-inversion-analysis.md`, `step-2-7-pre-mortem.md` |
| Research | 3-3.8 | Context gathering, research agents, patterns | `step-3-context-research.md` |
| Requirements | 4-4.5 | Clarification, TDD workflow | `step-4-requirements.md` |
| Analysis | 5 | Ultra-thinking protocol | `step-5-ultra-thinking.md` |
| Core Spec | 6-9 | Folder creation, spec.md, spec-lite.md | `step-6-9-spec-creation.md` |
| UX/UI | 9.5 | UX/UI specification (conditional) | `step-9-5-ux-ui-spec.md` |
| E2E Testing | 9.6 | E2E test strategy (conditional) | `step-9-6-e2e-test-strategy.md` |
| Technical | 10 | Technical specification | `step-10-technical-spec.md` |
| Sub-Specs | 10.1-12 | Implementation, testing, integration, quality, architecture | `step-10-1-5-sub-specs.md` |
| Validation | 9.7, 13-14 | Evolution scoring, review, quality validation | `step-13-14-review-validation.md` |

---

## Phase 1: Setup (Steps 0-1.5)

**EXECUTE**: `@.agent-os/instructions/core/spec-steps/step-0-1-prerequisites.md`

**Summary**:
- Step 0: Detect Agent OS root directory
- Step 1: Verify prerequisites (mission-lite.md, tech-stack.md)
- Step 1.5: Pattern discovery for existing codebases

---

## Phase 2: Initiation (Steps 2-2.5)

**EXECUTE**: `@.agent-os/instructions/core/spec-steps/step-2-initiation.md`

**Summary**:
- Step 2: Initiate spec from roadmap or user description
- Step 2.5: Select detail level (minimal/standard/comprehensive)

---

## Phase 3: Quality Lenses (Steps 2.6-2.7)

### Step 2.6: Inversion Analysis (v5.2+)

**EXECUTE**: `@.agent-os/instructions/core/spec-steps/step-2-6-inversion-analysis.md`

Transform "what should work" to "what could fail."

**Output**: `{SPEC_FOLDER}/analysis-inversion.md`

### Step 2.7: Pre-Mortem Risk Analysis (v5.2+)

**EXECUTE**: `@.agent-os/instructions/core/spec-steps/step-2-7-pre-mortem.md`

Imagine the feature has failed and work backward.

**Output**: `{SPEC_FOLDER}/sub-specs/pre-mortem-analysis.md`

---

## Phase 4: Research (Steps 3-3.8)

**EXECUTE**: `@.agent-os/instructions/core/spec-steps/step-3-context-research.md`

**Summary**:
- Step 3: Read mission-lite.md and tech-stack.md
- Step 3.5: Execute research agents in parallel
- Step 3.8: Load patterns via Skills (MANDATORY)

---

## Phase 5: Requirements (Steps 4-4.5)

**EXECUTE**: `@.agent-os/instructions/core/spec-steps/step-4-requirements.md`

**Summary**:
- Step 4: Requirements clarification
- Step 4.5: TDD workflow definition (RED/GREEN/REFACTOR)

---

## Phase 6: Deep Analysis (Step 5)

**EXECUTE**: `@.agent-os/instructions/core/spec-steps/step-5-ultra-thinking.md`

**When**: New features, architecture changes, security, performance-critical

**Analyses**:
1. Stakeholder Perspective (30-120 min)
2. Scenario Exploration (30-120 min)
3. Multi-Angle Review (30-90 min)

---

## Phase 7: Core Spec Creation (Steps 6-9)

**EXECUTE**: `@.agent-os/instructions/core/spec-steps/step-6-9-spec-creation.md`

**Summary**:
- Step 6: Determine date (YYYY-MM-DD)
- Step 7: Create spec folder
- Step 8: Create spec.md
- Step 9: Create spec-lite.md

---

## Phase 8: Conditional Specifications

### Step 9.5: UX/UI Spec

**EXECUTE**: `@.agent-os/instructions/core/spec-steps/step-9-5-ux-ui-spec.md`

**Condition**: `IF spec_requires_frontend_or_ui`

**Phases**:
1. Application Architecture (routes, layout, navigation, user flows)
2. Layout Systems (containers, spacing, typography)
3. Component Patterns (library strategy, component specs)
4. Interaction Patterns (states, animations, validation)

### Step 9.6: E2E Test Strategy

**EXECUTE**: `@.agent-os/instructions/core/spec-steps/step-9-6-e2e-test-strategy.md`

**Condition**: `IF spec_requires_frontend_or_ui OR spec_has_user_flows`

**Content**: User flow inventory, test tiers, accessibility, browser matrix

---

## Phase 9: Technical Specification (Step 10)

**EXECUTE**: `@.agent-os/instructions/core/spec-steps/step-10-technical-spec.md`

**Content**:
- Feature classification (frontend/backend/full-stack)
- Frontend: Components, state, routing, UI specs
- Backend: API endpoints, business logic, database
- Integration: API contracts, data flow, testing

---

## Phase 10: Sub-Specifications (Steps 10.1-12)

**EXECUTE**: `@.agent-os/instructions/core/spec-steps/step-10-1-5-sub-specs.md`

| Step | File | Content |
|------|------|---------|
| 10.1 | implementation-guide.md | Development approach, architecture, workflow |
| 10.2 | testing-strategy.md | Framework, test types, data management |
| 10.3 | integration-requirements.md | System integration, APIs, external services |
| 10.4 | quality-gates.md | Metrics, validation, automated checks |
| 10.5 | architecture-decisions.md | ADRs, constraints, design principles |
| 11 | database-schema.md | (Conditional) Schema changes, migrations |
| 12 | api-spec.md | (Conditional) Endpoint specifications |

---

## Phase 11: Review and Validation (Steps 9.7, 13-14)

**EXECUTE**: `@.agent-os/instructions/core/spec-steps/step-13-14-review-validation.md`

### Step 9.7: Evolution Scoring Gate (v5.2+)

**Trigger**: After all spec files created

**Scores** (0-10 each):
- Maintainability
- Extensibility
- Debuggability
- Simplicity

**Threshold**: 7 (configurable)

### Step 13: User Review

Present comprehensive package with all files created.

### Step 14: Quality Validation

**Categories** (target):
- Completeness: >=95%
- Technical Depth: >=90%
- Implementation Readiness: >=90%
- Documentation Quality: >=85%
- Consistency: >=95%
- Reference Format: >=95%

---

## Output Structure

```
.agent-os/specs/YYYY-MM-DD-spec-name/
+-- spec.md                          # Main requirements
+-- spec-lite.md                     # Summary (1-3 sentences)
+-- analysis-inversion.md            # Step 2.6 output
+-- research-findings.yml            # Step 3.5 output
+-- evolution-score.json             # Step 9.7 output
+-- sub-specs/
    +-- ux-ui-spec.md               # Step 9.5 (conditional)
    +-- e2e-test-strategy.md        # Step 9.6 (conditional)
    +-- technical-spec.md           # Step 10
    +-- implementation-guide.md     # Step 10.1
    +-- testing-strategy.md         # Step 10.2
    +-- integration-requirements.md # Step 10.3
    +-- quality-gates.md            # Step 10.4
    +-- architecture-decisions.md   # Step 10.5
    +-- database-schema.md          # Step 11 (conditional)
    +-- api-spec.md                 # Step 12 (conditional)
    +-- pre-mortem-analysis.md      # Step 2.7 output
```

---

## Quick Reference: Step Files

All step files located in: `@.agent-os/instructions/core/spec-steps/`

| File | Steps | Lines |
|------|-------|-------|
| step-0-1-prerequisites.md | 0, 1, 1.5 | Pattern discovery, root detection |
| step-2-initiation.md | 2, 2.5 | Initiation, detail level |
| step-2-6-inversion-analysis.md | 2.6 | Failure mode analysis |
| step-2-7-pre-mortem.md | 2.7 | Risk projection |
| step-3-context-research.md | 3, 3.5, 3.8 | Context, research, patterns |
| step-4-requirements.md | 4, 4.5 | Requirements, TDD |
| step-5-ultra-thinking.md | 5 | Deep analysis protocol |
| step-6-9-spec-creation.md | 6, 7, 8, 9 | Core spec files |
| step-9-5-ux-ui-spec.md | 9.5 | UX/UI specification |
| step-9-6-e2e-test-strategy.md | 9.6 | E2E test strategy |
| step-10-technical-spec.md | 10 | Technical specification |
| step-10-1-5-sub-specs.md | 10.1-12 | Sub-specifications |
| step-13-14-review-validation.md | 9.7, 13, 14 | Evolution, review, validation |

---

<post_flight_check>
  EXECUTE: @.agent-os/instructions/meta/post-flight.md
</post_flight_check>
