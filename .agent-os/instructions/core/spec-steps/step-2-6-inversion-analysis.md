---
version: 5.1.0
last-updated: 2026-01-02
related-files:
  - instructions/core/create-spec.md
---


# Step 2.6: Inversion Analysis (v5.2+)

**Purpose**: Transform "what should work" to "what could fail" - uncovering hidden risks before they become bugs.

**Reference**: `@.agent-os/instructions/utilities/quality-lenses.md#inversion-lens`
**Template**: `@.agent-os/templates/inversion-analysis.md.template`

## When to Apply

| Priority | Apply? | Justification |
|----------|--------|---------------|
| P0-P1 | **ALWAYS** | Critical features require thorough risk analysis |
| P2 | **ALWAYS** | Standard features benefit from failure mode identification |
| P3 | **CONDITIONAL** | Apply if: security implications, data integrity, external integrations, >4h work |
| P4 | **SKIP** | Pure docs, config, style-only, version bumps |

**Skip Conditions** (ALL must be true for P3-P4):
- [ ] No security/auth implications
- [ ] No data integrity risks
- [ ] No external service integrations
- [ ] <4 hours estimated work
- [ ] Pure documentation or config change

**If skipping, document**:
```markdown
## Inversion Analysis

**Status**: SKIPPED
**Priority**: [P3|P4]
**Justification**: [Specific reasons all skip conditions met]
```

## Process (10-15 minutes for standard features)

```yaml
inversion_analysis:
  # Step 1: Frame the Feature (1-2 min)
  frame:
    feature: "[One-line description]"
    user_action: "[What the user DOES]"
    system_action: "[What the system DOES]"
    success_criteria: "[How we know it works]"

  # Step 2: Analyze Each Failure Category (8-12 min)
  categories:
    adoption:        # What confuses users? Hard to discover? Disrupts workflows?
      min_failures: 2
      time: "2-3 min"
    execution:       # Concurrent access? Edge cases? External service failures?
      min_failures: 2
      time: "3-4 min"
    evolution:       # Hard to change? Confuses future devs? Tight coupling?
      min_failures: 2
      time: "2-3 min"
    security:        # User input exploits? Access control? Data exposure?
      min_failures: 2
      time: "2-3 min"

  # Step 3: Derive Constraints (2-3 min)
  derive_constraints:
    format: "Active voice, specific, implementable"
    example_bad: "Should handle edge cases"
    example_good: "Return 400 with {error: 'empty_list'} for empty input"

  # Step 4: Identify Anti-Patterns (1-2 min)
  anti_patterns:
    group_by: "Root cause"
    document: "What causes failures, how to prevent"
```

## Output

**Location**: `{SPEC_FOLDER}/analysis-inversion.md`

**Integration with Downstream Sections**:

| Failure Category | Feeds Into |
|------------------|------------|
| Adoption | UX/UI Spec > User Flow Architecture, Requirements > Usability |
| Execution | Technical Spec > Error Handling, Performance, Concurrency |
| Evolution | Technical Spec > Implementation Patterns, Architecture Decisions |
| Security | Technical Spec > Security Requirements, Quality Gates |

**Console Output**:
```
Inversion Analysis: COMPLETE
├── Adoption Failures: [N] identified
├── Execution Failures: [N] identified
├── Evolution Failures: [N] identified
├── Security Failures: [N] identified
├── Constraints Derived: [N]
└── Anti-Patterns Documented: [N]

Constraints integrated into spec sections.
```

## Minimum Requirements by Complexity

| Spec Complexity | Time Budget | Min Failures | Min Constraints |
|-----------------|-------------|--------------|-----------------|
| Minimal (<4h)   | 5-8 min     | 4 (1/category) | 4 |
| Standard (4-16h) | 10-15 min  | 8 (2/category) | 6 |
| Comprehensive (>16h) | 15-25 min | 12 (3/category) | 10 |
