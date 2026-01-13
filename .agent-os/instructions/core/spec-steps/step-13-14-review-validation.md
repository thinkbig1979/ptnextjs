---
version: 5.1.0
last-updated: 2026-01-02
related-files:
  - instructions/core/create-spec.md
---


# Steps 13-14: Review and Validation

## Step 13: Enhanced User Review

```
Present comprehensive package:

**Core**:
- spec.md
- spec-lite.md

**Technical**:
- technical-spec.md
- implementation-guide.md
- testing-strategy.md
- integration-requirements.md
- quality-gates.md
- architecture-decisions.md

**Conditional**:
- database-schema.md (if created)
- api-spec.md (if created)

**Summary**:
- Total files: [COUNT]
- Implementation-ready: Y
- Testing strategy: Y
- Integration requirements: Y
- Quality gates: Y
- Architecture decisions: Y

Please review. When ready, run /create-tasks.
```

**Validation** (before presenting):
- [ ] All 6 core files created
- [ ] Cross-file consistency
- [ ] Technical depth meets implementation-readiness
- [ ] Template variables substituted
- [ ] Quality gates defined

---

## Step 9.7: Evolution Scoring Gate (v5.2+)

**Purpose**: Evaluate spec quality through evolution lens before completion.

**Reference**: `@.agent-os/instructions/utilities/quality-lenses.md#inversion-lens`

**Trigger**: After all spec files created, before quality validation.

**Skip**: If `config.yml` -> `evolution_scoring.apply_to.specs: false`

```yaml
evolution_scoring_gate:
  # 1. Load configuration
  READ: config.yml -> evolution_scoring

  IF NOT enabled:
    SKIP to Step 14

  threshold: config.evolution_scoring.threshold  # default: 7
  mode: config.evolution_scoring.enforcement_mode  # "warning" | "blocking"

  # 2. Score the specification
  SCORE_CATEGORIES:
    maintainability:  # 0-10
      - Clear separation of concerns
      - Modular design specified
      - Dependencies well-defined
      - Testing strategy complete

    extensibility:    # 0-10
      - Extension points identified
      - Future considerations documented
      - Backwards compatibility addressed
      - API versioning strategy (if applicable)

    debuggability:    # 0-10
      - Error handling patterns defined
      - Logging strategy specified
      - Observable boundaries clear
      - Troubleshooting guidance included

    simplicity:       # 0-10
      - Minimal dependencies
      - Clear data flow
      - Appropriate abstraction level
      - No over-engineering

  # 3. Calculate composite score
  CALCULATE:
    raw_scores: [maintainability, extensibility, debuggability, simplicity]
    composite_score: average(raw_scores)

  # 4. Generate recommendations
  RECOMMENDATIONS:
    FOR each category WHERE score < 7:
      ADD: specific improvement suggestions

  # 5. Enforcement decision
  IF composite_score >= threshold:
    PASS: Continue to Step 14
    OUTPUT:
      "Evolution Score: PASSED
       +-- Composite: {composite_score}/10
       +-- Maintainability: {score}/10
       +-- Extensibility: {score}/10
       +-- Debuggability: {score}/10
       +-- Simplicity: {score}/10"

  ELIF mode == "warning":
    WARN: Show score breakdown and recommendations
    PROMPT: "Evolution score {composite_score}/10 below threshold {threshold}.

            Recommendations:
            {recommendations}

            Options:
            1. IMPROVE - Address recommendations
            2. CONTINUE - Proceed with justification
            3. ABORT - Cancel spec creation"

    IF choice == "IMPROVE":
      RETURN to relevant spec sections
    ELIF choice == "CONTINUE":
      REQUIRE: Justification for proceeding
      SAVE: .agent-os/specs/{spec_folder}/evolution-override.md
      PROCEED to Step 14
    ELIF choice == "ABORT":
      HALT

  ELIF mode == "blocking":
    BLOCK: Cannot proceed without meeting threshold
    OUTPUT:
      "Evolution Score: BLOCKED ({composite_score}/10 < {threshold})

       Must address:
       {recommendations}

       Return to spec sections and improve before proceeding."
    HALT until score >= threshold

# Save evolution report
SAVE: .agent-os/specs/{spec_folder}/evolution-score.json
CONTENTS:
  spec_folder: {spec_folder}
  timestamp: {ISO_TIMESTAMP}
  scores:
    maintainability: {score}
    extensibility: {score}
    debuggability: {score}
    simplicity: {score}
  composite_score: {composite_score}
  threshold: {threshold}
  status: {PASSED | WARNED | BLOCKED}
  recommendations: {list}
  override_justification: {if applicable}
```

**Console Output**:
```
Evolution Scoring Gate - {SPEC_NAME}
+-- Maintainability: {score}/10
+-- Extensibility: {score}/10
+-- Debuggability: {score}/10
+-- Simplicity: {score}/10
+-- Composite: {composite_score}/10
+-- Threshold: {threshold}
+-- Status: {PASSED | WARNED | BLOCKED}
```

---

## Step 14: Specification Quality Validation

**Subagent**: quality-assurance

Execute QualityGateValidator system.

### Quality Categories

| Category | Target | Validates |
|----------|--------|-----------|
| Completeness | >=95% | All 8 core files, no placeholders |
| Technical Depth | >=90% | Code examples, schemas, API endpoints |
| Implementation Readiness | >=90% | File paths, functions, API endpoints, components |
| Documentation Quality | >=85% | Content depth, examples, organization |
| Consistency | >=95% | Cross-file spec name/date/references |
| Reference Format | >=95% | `file_path:line_number` format compliance |

### Valid Reference Formats

- `src/models/user.rb:42`
- `app/controllers/auth.ts:105-120`
- `@.agent-os/standards/rails-patterns.md:250`
- `../lib/utils.ts:15`

**Invalid**:
- `user.rb line 42` (use `:` not "line")
- `auth_controller.ts` (missing line number)
- `models/user.rb#42` (use `:` not `#`)

### Validation Flow

1. Load quality config (`.agent-os/quality-config.yml` or defaults)
2. Execute `QualityGateValidator.validateSpecification(specPath)`
3. Generate quality report with scores/recommendations
4. Enforce quality gates based on thresholds
5. Provide actionable recommendations

### Actions

**Pass** (>=90% overall, all category thresholds met):
```
PROCEED to user review
Display quality summary (Overall: [SCORE]%, Categories: [BREAKDOWN])
Status: "Meets all quality standards"
```

**Fail** (<90% overall OR critical threshold missed):
```
Identify specific issues/gaps
Auto-correct minor issues (template vars, formatting)
Escalate major issues for manual review
Provide actionable recommendations
Retry validation after corrections
```

### Quality Report Includes

- Overall score and status
- Category-by-category breakdown
- Specific issues with file locations
- Actionable recommendations by priority
- Before/after comparison if re-validated

### Integration

- Automatic validation before user review
- No additional user input for standard validation
- Present quality results with specification delivery

### Quality Improvement Loop

1. Present quality report with recommendations
2. Implement automatic fixes where possible
3. Request user guidance for complex improvements
4. Re-validate after improvements
5. Continue until quality gates satisfied
