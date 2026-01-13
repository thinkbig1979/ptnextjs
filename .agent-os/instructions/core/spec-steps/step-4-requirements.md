---
version: 5.1.0
last-updated: 2026-01-02
related-files:
  - instructions/core/create-spec.md
---


# Step 4: Requirements Clarification

**Subagent**: context-fetcher

## Areas to Clarify

- Scope: in_scope, out_of_scope
- Technical: functionality, UI/UX, integrations

```
IF clarification_needed:
  ASK numbered_questions
  WAIT user_response
ELSE:
  PROCEED
```

## Step 4.5: TDD Workflow Definition

**Purpose**: Establish test-first strategy upfront

**When**: Always for new features, API endpoints, data models, business logic, integrations, critical bugs

**Skip**: Pure docs, config-only, UI styling, version bumps

**Sequence**:
1. Determine enforcement level (5-10 min)
2. Design RED phase (15-30 min)
3. Design GREEN phase (15-30 min)
4. Design REFACTOR phase (10-20 min)
5. Set coverage targets (5-10 min)

### Enforcement Levels

| Level | Use When | Behavior |
|-------|----------|----------|
| STRICT | Critical production, security, financial, data integrity | Block on violations |
| STANDARD | Standard features, API endpoints, business logic | Warn on violations |
| RELAXED | Prototyping, spikes, legacy integration | Log only |

### RED Phase Design

```markdown
### RED Phase: Failing Tests

**Objective**: Write tests that fail because feature not implemented

#### Unit Tests
1. **test_user_validation_requires_email**
   - Purpose: Verify user model requires email
   - Expected Failure: `ValidationError: email is required`
   - Test Data: User without email

[Continue for all tests...]

**Test Execution Order**:
1. Unit tests (parallel)
2. Integration tests (sequential)
3. Edge cases (parallel)

**RED Phase Complete When**:
- [ ] All tests written
- [ ] All tests execute (no syntax errors)
- [ ] All fail with expected messages
```

### GREEN Phase Design

```markdown
### GREEN Phase: Minimal Implementation

**Minimal Principles**:
- Max 50 lines/function
- Max complexity: 10
- Use stdlib over custom
- No premature abstraction

#### Implementation Steps
1. **Implement User email validation**
   - Files: `models/user.js`
   - Code: Add `email` required + validator
   - Tests Passing: `test_user_validation_requires_email`, `test_email_format_validation`
   - LOC: ~10
   - Checkpoint: Email validates presence/format

[Continue...]

**GREEN Phase Complete When**:
- [ ] All tests pass
- [ ] Coverage met
- [ ] No over-implementation
```

### REFACTOR Phase Design

```markdown
### REFACTOR Phase: Code Quality

1. **Extract email validation logic**
   - Current: Duplicated in model/API
   - Target: Shared `validateEmail()` utility
   - Files: `models/user.js`, `api/users.js`, `utils/validation.js` (new)
   - Effort: Small (15-20 min)
   - Priority: Should
   - Benefit: DRY, single source of truth

[Continue...]

**REFACTOR Phase Complete When**:
- [ ] Must refactorings done
- [ ] Tests passing
- [ ] Coverage maintained
```

### Coverage Targets

| Level | Min | Target | Warning |
|-------|-----|--------|---------|
| STRICT | 90% | 95% | 85% |
| STANDARD | 85% | 90% | 80% |
| RELAXED | 75% | 85% | 70% |

**Adjust by feature**:
- Business logic: +5%
- Data validation: +5%
- Security: +10%
- UI components: -5% (logic only)

### TDD Acceptance Criteria

- [ ] RED: Tests written, failing with expected errors
- [ ] GREEN: Tests passing, minimal implementation
- [ ] REFACTOR: Must refactorings done
- [ ] Coverage: Meets minimum ([NUMBER]%)
- [ ] Test-First: Tests created before implementation
- [ ] Quality Gates: All passed

**Skip Criteria** (ALL must be true):
- [ ] Pure documentation
- [ ] Config-only
- [ ] UI styling only
- [ ] Version bump (no API changes)
- [ ] No tests required/possible
