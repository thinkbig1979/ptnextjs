---
version: 5.1.0
last-updated: 2026-01-02
related-files:
  - instructions/core/create-spec.md
---


# Step 2.7: Pre-Mortem Risk Analysis (v5.2+)

**Purpose**: Identify risks by imagining the feature has already failed and working backward to find potential causes. Unlike traditional risk assessment ("what could go wrong?"), pre-mortem asks "assuming this failed, why did it fail?" - overcoming optimism bias.

**Reference**: `@.agent-os/instructions/utilities/quality-lenses.md#pre-mortem-lens`
**Template**: `@.agent-os/templates/pre-mortem-analysis.md.template`

## When to Apply

| Priority | Apply? | Justification |
|----------|--------|---------------|
| P0-P1 | **MANDATORY** | Critical features require thorough risk projection |
| P2-P4 | **OPTIONAL** | Apply if: external dependencies, data integrity risks, security implications, high complexity |

**Skip Conditions** (ALL must be true for P2-P4):
- [ ] No external service dependencies
- [ ] No data migration or integrity risks
- [ ] No security implications
- [ ] Low complexity feature
- [ ] No time-critical delivery requirements

**If skipping, document**:
```markdown
## Pre-Mortem Risk Analysis

**Status**: SKIPPED
**Priority**: [P2|P3|P4]
**Justification**: [Specific reasons all skip conditions met]
```

## Process (15-20 minutes)

```yaml
pre_mortem_analysis:
  # Phase 1: Set the Stage (2 min)
  failure_scenario:
    time_horizon: "6 months from launch"
    prompt: |
      "It's 6 months from now. This feature has failed completely.
       Users have abandoned it, stakeholders are frustrated, and
       we're considering removing it entirely. Looking back, we
       should have seen this coming."

  # Phase 2: Brainstorm Failure Causes (5 min)
  categories:
    technical:        # Architecture, performance, security, integration
      min_causes: 2
    product:          # UX, value proposition, adoption, market fit
      min_causes: 2
    process:          # Communication, coordination, timeline, resources
      min_causes: 2
    external:         # Dependencies, market changes, regulatory, competition
      min_causes: 2

  # Phase 3: Risk Scoring (5 min)
  scoring:
    # Formula: Score = Likelihood x Impact x (Detectability / 2)
    likelihood: 1-5     # 1=Rare, 5=Almost Certain
    impact: 1-5         # 1=Minimal, 5=Catastrophic
    detectability: 1-5  # 1=Obvious, 5=Hidden
    threshold: 12       # Score > 12 requires mitigation

  # Phase 4: Mitigation Assignment (3 min)
  mitigations:
    required_for: "score > 12"
    must_include:
      - specific_action
      - owner
      - deadline
      - verification_method
```

## Output

**Location**: `{SPEC_FOLDER}/sub-specs/pre-mortem-analysis.md`

**Integration with Downstream Sections**:

| Risk Category | Feeds Into |
|---------------|------------|
| Technical | Technical Spec > Architecture Decisions, Performance, Security |
| Product | UX/UI Spec > User Flow Architecture, Acceptance Criteria |
| Process | Implementation Plan > Timeline, Resource Allocation |
| External | Integration Requirements > External Services, Dependencies |

**Console Output**:
```
Pre-Mortem Analysis: COMPLETE
├── Technical Risks: [N] identified ([M] critical)
├── Product Risks: [N] identified ([M] critical)
├── Process Risks: [N] identified ([M] critical)
├── External Risks: [N] identified ([M] critical)
├── Total Risk Score: [N] (threshold: 12)
├── Mitigations Required: [N]
└── Early Warning Indicators: [N] defined

High-risk mitigations integrated into acceptance criteria.
```

## Minimum Requirements by Priority

| Priority | Time Budget | Min Risks | Min Mitigations | Early Warnings |
|----------|-------------|-----------|-----------------|----------------|
| P0-P1 | 15-20 min | 8 (2/category) | All > 12 score | Top 5 risks |
| P2 | 10-15 min | 4 (1/category) | All > 16 score | Top 3 risks |
| P3-P4 | Skip or 5-10 min | 4 | Critical only | Optional |

## Link to Acceptance Criteria

High-risk mitigations (score > 12) MUST be linked to acceptance criteria:
```markdown
## Acceptance Criteria (Pre-Mortem Linked)

- [ ] **AC-PM-1**: [Mitigation from pre-mortem] - Addresses: [Risk ID]
- [ ] **AC-PM-2**: [Mitigation from pre-mortem] - Addresses: [Risk ID]
```
