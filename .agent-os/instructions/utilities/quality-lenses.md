# Quality Lenses - Comprehensive Guide

> **Version**: 1.0.0 | Agent OS v5.2.0+
> **Purpose**: Complete reference for Inversion, Pre-Mortem, and Evolution lenses
> **Status**: CANONICAL - Consolidates all quality lens documentation

---

## Table of Contents

1. [Overview](#overview)
2. [When to Use](#when-to-use)
3. [Inversion Lens](#inversion-lens)
4. [Pre-Mortem Lens](#pre-mortem-lens)
5. [Evolution Scoring](#evolution-scoring)
6. [Combined Workflow](#combined-workflow)
7. [Skip Conditions](#skip-conditions)
8. [Integration with Tasks](#integration-with-tasks)
9. [Templates and Output](#templates-and-output)

---

## Overview

Three complementary analysis techniques that systematically uncover risks, identify failure modes, and ensure specifications are built to last.

Quality Lenses transform specifications from "what should work" to "what could fail" and "how will this age" - catching problems that optimistic, success-focused thinking misses.

| Lens | Core Question | Psychological Mechanism | Primary Output |
|------|---------------|------------------------|----------------|
| **Inversion** | "What guarantees failure?" | Inverts success criteria | Constraints |
| **Pre-Mortem** | "Why did this fail in 6 months?" | Overcomes optimism bias | Mitigations |
| **Evolution** | "How will this age?" | Forces long-term thinking | Quality gates |

### How the Lenses Complement Each Other

```
                    ┌───────────────────────────────────────┐
                    │           INVERSION LENS               │
                    │    "What guarantees failure?"          │
                    │  • Immediate failures                  │
                    │  • Edge cases                          │
                    │  • Technical anti-patterns             │
                    │  • Security vulnerabilities            │
                    └─────────────────┬─────────────────────┘
                                      │
                        Failures inform risks
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            PRE-MORTEM LENS                                    │
│                    "Why did this fail in 6 months?"                           │
│  • Process failures       • External dependencies    • Team dynamics          │
│  • Gradual degradation    • Market changes          • Hidden assumptions      │
│  • Communication gaps     • Resource constraints    • Adoption barriers       │
└────────────────────────────────────┬─────────────────────────────────────────┘
                                     │
                      Risks inform evolution concerns
                                     │
                                     ▼
                    ┌───────────────────────────────────────┐
                    │          EVOLUTION SCORING             │
                    │       "How will this age?"             │
                    │  • Maintainability over time          │
                    │  • Extensibility for future needs     │
                    │  • Debuggability when things break    │
                    │  • Simplicity for understanding       │
                    └───────────────────────────────────────┘
```

### What Each Lens Uniquely Catches

| Risk Type | Inversion | Pre-Mortem | Evolution |
|-----------|-----------|------------|-----------|
| SQL injection in search | CATCHES | - | - |
| Team member leaves mid-project | - | CATCHES | - |
| Code becomes unmaintainable | partially | partially | CATCHES |
| Concurrent update race condition | CATCHES | - | - |
| Third-party API deprecation | - | CATCHES | partially |
| New requirements impossible to add | partially | - | CATCHES |
| Users don't discover feature | partially | CATCHES | - |
| Hidden dependencies cause cascading failures | - | partially | CATCHES |

---

## When to Use

### Decision Tree

```
Is this a spec/feature change?
├── NO → Skip all lenses
│         (docs, config, version bumps)
│
└── YES → Estimated complexity?
          │
          ├── < 4 hours → SKIP (justification required)
          │
          ├── 4-16 hours → STANDARD
          │   ├── Inversion: 8 failures minimum
          │   ├── Pre-Mortem: 8 risks minimum
          │   └── Evolution: Score required
          │
          └── > 16 hours → COMPREHENSIVE
              ├── Inversion: 12 failures minimum
              ├── Pre-Mortem: 12 risks minimum
              └── Evolution: Score required + blocking mode
```

### Lens Applicability by Feature Type

| Feature Type | Inversion | Pre-Mortem | Evolution |
|--------------|-----------|------------|-----------|
| User-facing UI | HIGH | HIGH | MEDIUM |
| API endpoints | HIGH | MEDIUM | HIGH |
| Database schema | HIGH | HIGH | HIGH |
| Authentication/Auth | CRITICAL | CRITICAL | HIGH |
| External integrations | HIGH | CRITICAL | MEDIUM |
| Background jobs | MEDIUM | HIGH | MEDIUM |
| Internal tooling | MEDIUM | MEDIUM | MEDIUM |

### Time Budget

| Lens | Minimal (<4h) | Standard (4-16h) | Comprehensive (>16h) |
|------|---------------|------------------|----------------------|
| Inversion | 5-8 min | 10-15 min | 15-25 min |
| Pre-Mortem | 8-10 min | 15-20 min | 20-30 min |
| Evolution | 3 min | 5 min | 5-10 min |
| **Total** | **16-21 min** | **30-40 min** | **40-65 min** |

---

## Inversion Lens

Transform specifications from "what should work" to "what could fail" - uncovering hidden risks before they become bugs.

### Purpose

The Inversion Lens asks: **"What would GUARANTEE this feature fails?"**

By systematically exploring failure modes, we:
- Discover requirements that success-focused thinking misses
- Derive constraints that prevent common failures
- Identify anti-patterns before they're implemented
- Create more robust, defensible specifications

### Step-by-Step Process

#### Step 1: Frame the Feature (1-2 min)

```markdown
**Feature**: [One-line description]
**Primary User Action**: [What the user DOES]
**Primary System Action**: [What the system DOES]
**Success Criteria**: [How we know it works]
```

**Example**:
```markdown
**Feature**: Password reset via email
**Primary User Action**: Request reset, click link, set new password
**Primary System Action**: Generate token, send email, validate, update
**Success Criteria**: User can log in with new password
```

#### Step 2: Invert Each Category (8-12 min)

##### 2.1 Adoption Failures (2-3 min)

**Core Question**: "What would make users NEVER successfully adopt this?"

Think about:
- First-time users with no context
- Developers integrating with this feature
- Migration from existing solutions

**Quick Prompts**:
- What requires explanation that isn't obvious?
- What error messages will confuse users?
- What will users try that won't work?

##### 2.2 Execution Failures (3-4 min)

**Core Question**: "What would make this FAIL in production?"

Think about:
- Concurrent users doing the same action
- Edge cases: empty, null, maximum values
- External services being slow or down

**Quick Prompts**:
- What happens with 2 simultaneous requests?
- What happens with 0 items? 1 million items?
- What if the database is slow? The API is down?

##### 2.3 Evolution Failures (2-3 min)

**Core Question**: "What would make this UNMAINTAINABLE in 6 months?"

Think about:
- New requirements that are impossible to add
- Developers who don't understand the code
- Tests that break for unrelated changes

**Quick Prompts**:
- What will definitely change in requirements?
- What will confuse the next developer?
- What can't be tested in isolation?

##### 2.4 Security Failures (2-3 min)

**Core Question**: "What would let attackers EXPLOIT this?"

Think about:
- User input that becomes queries/commands
- Access to other users' data
- Information leaked in errors/logs

**Quick Prompts**:
- What user input is used in database queries?
- Can User A access User B's data by changing an ID?
- What appears in logs that shouldn't?

#### Step 3: Derive Constraints (2-3 min)

For each failure identified, derive a constraint:

| Failure Mode | Constraint |
|--------------|------------|
| Race condition on update | Use optimistic locking with version field |
| SQL injection in search | Parameterized queries only, no string concat |
| No way to extend formats | Use pluggable format handlers |

**Constraint Format**: Active voice, specific, implementable

- BAD: "Should handle edge cases" (vague)
- GOOD: "Return 400 with `{error: 'empty_list'}` for empty input" (specific)

#### Step 4: Identify Anti-Patterns (1-2 min)

Group failures that share a root cause:

```markdown
**Anti-Pattern**: Direct string concatenation in queries

**Causes These Failures**:
- SQL injection (Security)
- XSS via stored data (Security)
- Query syntax errors on special chars (Execution)

**Prevent With**:
- Parameterized queries for all database access
- HTML escaping for all rendered user content
```

### Good vs Weak Analysis Examples

#### Example 1: Search Feature

**WEAK Analysis**:
```markdown
Failure: Search might be slow
Constraint: Make search fast
```

**GOOD Analysis**:
```markdown
Failure: Search query with 50+ terms causes query timeout (30s)
         at >10K records, blocking connection pool
Risk: HIGH - Production outage for all users
Constraint: Limit search terms to 10, timeout at 5s,
            return partial results with "refine search" CTA
```

#### Example 2: User Profile Update

**WEAK Analysis**:
```markdown
Failure: Two users updating at same time
Constraint: Handle concurrency
```

**GOOD Analysis**:
```markdown
Failure: Lost update - User A and B both load profile with
         email="old@test.com". A saves email="a@test.com".
         B saves phone="555-1234" (still has old email).
         B's save overwrites A's email change.
Risk: HIGH - Data loss without user awareness
Constraint: Use optimistic locking with `updated_at` check.
            Return 409 Conflict with current values when stale.
            UI shows "Someone else updated this. Refresh to see changes."
```

### Common Failure Modes by Feature Type

**CRUD Features**:
- Race conditions on update/delete
- Mass assignment vulnerabilities
- N+1 queries on list views
- Missing soft-delete causing data loss

**Authentication Features**:
- Token in URL (leaks via Referer)
- Timing attacks on password comparison
- Brute force without rate limiting
- Session fixation after login

**Search/Filter Features**:
- SQL injection via sort parameter
- Regex DoS via crafted patterns
- Full table scans without index
- Disclosure via filter enumeration

**File Upload Features**:
- Path traversal in filename
- Polyglot files bypassing validation
- Denial of service via huge files
- SSRF via URL-based upload

**API Integration Features**:
- Secret in client-side code
- No timeout causing hung requests
- Unbounded retry causing amplification
- Webhook replay attacks

**Real-time Features**:
- WebSocket connection exhaustion
- Message ordering race conditions
- Stale data after reconnect
- Memory leak from disconnected clients

### Inversion Validation Checklist

- [ ] All 4 failure categories analyzed
- [ ] Minimum failures identified (based on complexity)
- [ ] Each failure has: specific trigger, risk level, constraint
- [ ] Anti-patterns documented with root causes
- [ ] Constraints formatted for spec integration
- [ ] Analysis saved to spec folder

---

## Pre-Mortem Lens

A pre-mortem is a risk assessment technique where the team imagines a project has already failed and works backward to identify potential causes.

### Purpose

Unlike traditional risk assessment which asks "what could go wrong?", pre-mortem thinking asks **"assuming this failed, why did it fail?"**

This psychological reframing overcomes optimism bias and encourages more honest risk identification.

### Facilitation Process

#### Phase 1: Set the Stage (2 minutes)

**Read aloud:**
> "It's 6 months from now. This feature has failed completely. Users have abandoned it, stakeholders are frustrated, and we're considering removing it entirely. Looking back, we should have seen this coming."

**Key facilitation points:**
- Use past tense consistently ("failed" not "might fail")
- Make the failure concrete and vivid
- Establish psychological safety

#### Phase 2: Silent Brainstorm (5 minutes)

List failure causes across four categories:

| Category | Focus Areas | Example Triggers |
|----------|-------------|------------------|
| **Technical** | Architecture, performance, security, integration | "The system couldn't handle scale" |
| **Product** | UX, value proposition, market fit, adoption | "Users didn't understand it" |
| **Process** | Communication, coordination, timeline, resources | "We ran out of time" |
| **External** | Dependencies, market changes, regulatory, competition | "The API we relied on changed" |

**Instructions:**
1. Write at least 2 causes per category
2. Be specific - "database failed" becomes "PostgreSQL connection pool exhausted under 100 concurrent users"
3. Include unlikely but devastating causes

#### Phase 3: Round-Robin Sharing (5 minutes)

- Each person shares ONE cause at a time
- Continue until all unique causes are captured
- No discussion or debate during this phase
- Aim for 8-15 unique risks total

#### Phase 4: Risk Scoring (5 minutes)

Score three factors for each risk:

##### Likelihood (How probable?)

| Score | Label | Probability |
|-------|-------|-------------|
| 1 | Rare | <5% |
| 2 | Unlikely | 5-20% |
| 3 | Possible | 20-50% |
| 4 | Likely | 50-80% |
| 5 | Almost Certain | >80% |

##### Impact (How bad?)

| Score | Label | Effect |
|-------|-------|--------|
| 1 | Minimal | Cosmetic issue only |
| 2 | Minor | Workaround exists |
| 3 | Moderate | Degraded experience |
| 4 | Major | Core function broken |
| 5 | Catastrophic | Total failure |

##### Detectability (How quickly known?)

| Score | Label | Detection Time |
|-------|-------|----------------|
| 1 | Obvious | Immediate |
| 2 | Easy | <1 day |
| 3 | Moderate | 1-7 days |
| 4 | Difficult | 7-30 days |
| 5 | Hidden | 30+ days |

**Risk Score Formula**: `Likelihood x Impact x (Detectability / 2)`

#### Phase 5: Mitigation Assignment (3 minutes)

For risks scoring **> 12** (mandatory mitigation threshold):

1. Assign specific owner (not "team" - a person)
2. Define concrete action (not "monitor" - specific implementation)
3. Set deadline (before launch for critical)
4. Specify verification method

### Scoring Calibration Examples

#### Example 1: Authentication Service Dependency

**Scenario:** "Single sign-on service has an outage, blocking all user access"

| Factor | Score | Reasoning |
|--------|-------|-----------|
| Likelihood | 3 | SSO provider has 99.9% uptime, but we've seen 2 incidents this year |
| Impact | 5 | Complete feature outage - no workaround |
| Detectability | 1 | Monitoring catches within seconds |

**Calculation:** 3 x 5 x (1/2) = 7.5 (MEDIUM)

#### Example 2: Poor Mobile Performance

**Scenario:** "Feature loads slowly on mobile, users abandon before completing"

| Factor | Score | Reasoning |
|--------|-------|-----------|
| Likelihood | 4 | We haven't tested on mobile yet, complex UI |
| Impact | 4 | Mobile is 60% of traffic, major UX degradation |
| Detectability | 4 | Gradual abandonment, not immediately visible |

**Calculation:** 4 x 4 x (4/2) = 32 (CRITICAL)

### Mitigation Quality Criteria

| Characteristic | Description | Example |
|----------------|-------------|---------|
| **Specific** | Concrete action | "Add connection pooling with 50 max connections" vs "Improve database performance" |
| **Measurable** | Clear success criteria | "Response time <200ms at p99" vs "Fast enough" |
| **Assigned** | Single owner | "Sarah implements by Friday" vs "Team will handle" |
| **Time-bound** | Clear deadline | "Before launch" vs "Soon" |
| **Verified** | How to confirm | "Load test with 1000 users" vs "Test it" |

### Mitigation Anti-Patterns

| Anti-Pattern | Problem | Better Alternative |
|--------------|---------|-------------------|
| "Monitor closely" | Not an action | "Set alert for >5% error rate, on-call responds within 15 min" |
| "Be careful" | Not measurable | "Add pre-commit hook that blocks X pattern" |
| "Team will review" | No owner | "Alex reviews all PRs touching auth module" |
| "Fix if needed" | Reactive | "Implement before launch with load test verification" |

### Early Warning Indicators

Define measurable signals that indicate a risk is materializing:

**Technical:**
- Error rate exceeds 0.1%
- p99 latency exceeds 500ms
- Database connection pool utilization >80%

**Product:**
- Feature completion rate drops below 70%
- Time-on-task exceeds 2 minutes
- Support tickets mentioning feature >5/week

**Process:**
- Sprint velocity drops 20% from baseline
- Blockers unresolved >3 days

**External:**
- Third-party API response time doubles
- Competitor announces similar feature

### Pre-Mortem Validation Checklist

- [ ] At least 8 risks identified across all four categories
- [ ] Each risk has specific failure narrative
- [ ] All risks scored with justified ratings
- [ ] All risks with score >12 have assigned mitigation
- [ ] Mitigations meet quality criteria
- [ ] Early warning indicators defined for top 5 risks

---

## Evolution Scoring

Evaluates specifications for **timelessness** and **evolution-readiness**. Content that scores well remains valuable as tools, versions, and ecosystems change.

### Score Scale

| Score | Category | Description | Action |
|-------|----------|-------------|--------|
| **1-4** | Reject | Ephemeral, tightly coupled | Do not merge; requires rewrite |
| **5-6** | Requires Revision | Sound core, hardcoded elements | Revise before merging |
| **7-8** | Approved | Principle-based with extension points | Ready for merge |
| **9-10** | Exemplary | Fundamental problems, composable | Merge and reference |

### Evaluation Criteria

#### 1. Maintainability (25%)

| Score | Criteria |
|-------|----------|
| 1-2 | Hardcoded versions throughout |
| 3-4 | Some version coupling |
| 5-6 | Versions mentioned with upgrade paths |
| 7-8 | Version-agnostic, capability-based |
| 9-10 | Implementation-neutral |

#### 2. Extensibility (25%)

| Score | Criteria |
|-------|----------|
| 1-2 | No extension mechanism |
| 3-4 | Limited extensibility |
| 5-6 | Some extension points |
| 7-8 | Clear extension points documented |
| 9-10 | First-class extensibility |

#### 3. Debuggability (20%)

| Score | Criteria |
|-------|----------|
| 1-2 | Pure implementation, no principles |
| 3-4 | Implementations dominate |
| 5-6 | Balance of both |
| 7-8 | Principles lead, implementations illustrate |
| 9-10 | Principle-first with examples |

#### 4. Simplicity (15%)

| Score | Criteria |
|-------|----------|
| 1-2 | Will break within months |
| 3-4 | Valid for 1 year |
| 5-6 | Valid for 2-3 years |
| 7-8 | Valid for 5+ years |
| 9-10 | Indefinitely valid |

### Anti-Pattern Catalog

| Anti-Pattern | Detection | Impact |
|--------------|-----------|--------|
| Version Pinning | `"react": "18.2.0"` | -1 to -2 per instance |
| Tool-Specific Without Abstraction | Commands without explaining pattern | -1 if no abstraction |
| Missing Extension Points | No hook/plugin mentions | -2 if >500 words |
| Implicit Dependencies | `"assumes Docker installed"` | -1 per dependency |
| Temporal Anchoring | `"as of 2024"` | -1 per instance |
| Framework Worship | `"the React way"` | -1 per instance |

### Scoring Threshold

**Minimum Score**: 7 (configurable in config.yml)

- **PASS**: Score >= 7 → Continue
- **WARN**: Score < 7, mode=warning → Show options
- **BLOCK**: Score < 7, mode=blocking → Must improve

---

## Combined Workflow

### Workflow Position in Spec Creation

```
Step 2.1-2.5: Core Specification Work
    ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 2.6: INVERSION LENS (10-15 min)                                │
│ Question: "What would GUARANTEE this fails?"                         │
│ Output → analysis-inversion.md                                       │
└─────────────────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 2.7: PRE-MORTEM LENS (15-20 min)                               │
│ Question: "It's 6 months later - this failed. Why?"                  │
│ Output → sub-specs/pre-mortem-analysis.md                            │
└─────────────────────────────────────────────────────────────────────┘
    ↓
Steps 3-9.6: Remaining Spec Work
    ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 9.7: EVOLUTION SCORING GATE (5 min)                            │
│ Question: "How will this age over 1-2 years?"                        │
│ Output → evolution-score.json                                        │
└─────────────────────────────────────────────────────────────────────┘
    ↓
Step 14: Quality Validation
```

---

## Skip Conditions

### When to Skip

| Condition | Skip Inversion | Skip Pre-Mortem | Skip Evolution |
|-----------|----------------|-----------------|----------------|
| Pure documentation | YES | YES | YES |
| Config file changes | YES | YES | YES |
| Version bumps | YES | YES | YES |
| Style-only (unless a11y) | YES | YES | YES |
| Complexity < 4h | OPTIONAL* | OPTIONAL* | NO |
| Single developer hotfix | YES | OPTIONAL* | NO |

*Requires justification logged to spec folder

### Justification Format

```markdown
## Quality Lens Skip Justification

**Lens(es) Skipped**: [Inversion / Pre-Mortem / Both]
**Reason**: [Config change / Documentation / Hotfix / Other]
**Risk Acceptance**: [Why this is acceptable]
**Approver**: [Tech Lead name if applicable]
**Date**: [ISO date]
```

Save to: `.agent-os/specs/{spec_folder}/lens-skip-justification.md`

---

## Integration with Tasks

### Inversion Constraints → Task Requirements

```markdown
# From analysis-inversion.md
Constraint: Use optimistic locking with version field for concurrent updates

# Becomes task requirement
Requirements:
- [ ] Implement optimistic locking with `updated_at` version check
- [ ] Return 409 Conflict with current values when stale
```

### Pre-Mortem Mitigations → Blocking Tasks

```markdown
# From pre-mortem-analysis.md
Risk: SSO service outage blocks all user access (Score: 15)
Mitigation: Implement circuit breaker with cached session fallback

# Becomes blocking task
- [BLOCKING] impl-auth-circuit-breaker
  - Depends on: impl-auth-service
  - Blocks: launch-readiness
```

### Evolution Score → Quality Gate

```markdown
# From evolution-score.json
{ "composite_score": 6.5, "status": "WARNED" }

# In execute-tasks.md Step 4.2.7
Evolution Score Check: WARNED (6.5/10 < 7)
- Cannot proceed without addressing recommendations
- OR provide justification and override
```

---

## Templates and Output

### Output File Structure

```
.agent-os/specs/{spec_folder}/
├── spec.md                           # Main specification
├── analysis-inversion.md             # Step 2.6 output
│   ├── Failure modes by category
│   ├── Derived constraints
│   └── Anti-patterns
├── sub-specs/
│   └── pre-mortem-analysis.md        # Step 2.7 output
│       ├── Risks by category
│       ├── Risk scores
│       ├── Mitigations assigned
│       └── Early warning indicators
├── evolution-score.json              # Step 9.7 output
│   ├── Individual dimension scores
│   ├── Composite score
│   ├── Recommendations
│   └── Status (PASSED/WARNED/BLOCKED)
└── evolution-override.md             # If threshold bypassed
```

### Templates

| Template | Purpose |
|----------|---------|
| `templates/inversion-analysis.md.template` | Inversion lens output format |
| `templates/pre-mortem-analysis.md.template` | Pre-mortem output format |

---

## Quick Reference Card

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                      QUALITY LENSES QUICK REFERENCE                          │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  STEP 2.6: INVERSION LENS (10-15 min)                                        │
│  ─────────────────────────────────────                                       │
│  Question: "What GUARANTEES this fails?"                                     │
│  Categories: Adoption | Execution | Evolution | Security                     │
│  Output: 8+ failures → constraints → anti-patterns                           │
│  File: analysis-inversion.md                                                 │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  STEP 2.7: PRE-MORTEM LENS (15-20 min)                                       │
│  ───────────────────────────────────────                                     │
│  Question: "It's 6 months later - this failed. Why?"                         │
│  Categories: Technical | Product | Process | External                        │
│  Score: Likelihood x Impact x (Detectability/2)                              │
│  Threshold: >12 requires mitigation                                          │
│  Output: 8+ risks → scores → mitigations                                     │
│  File: sub-specs/pre-mortem-analysis.md                                      │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  STEP 9.7: EVOLUTION SCORING (5 min)                                         │
│  ─────────────────────────────────────                                       │
│  Question: "How will this age over 1-2 years?"                               │
│  Dimensions: Maintainability | Extensibility | Debuggability | Simplicity    │
│  Score: 0-10 each, composite = average                                       │
│  Threshold: 7 (configurable)                                                 │
│  Mode: warning | blocking                                                    │
│  File: evolution-score.json                                                  │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  TIME BUDGET:                                                                │
│  Standard (4-16h work): 30-40 min total                                      │
│  Comprehensive (>16h):  40-65 min total                                      │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Configuration

```yaml
# config.yml
quality_lenses:
  inversion:
    enabled: true
    minimum_failures:
      minimal: 4
      standard: 8
      comprehensive: 12
  pre_mortem:
    enabled: true
    minimum_risks:
      minimal: 4
      standard: 8
      comprehensive: 12
    mitigation_threshold: 12
  evolution:
    enabled: true
    minimum_score: 7
    enforcement_mode: warning  # warning | blocking

evolution_scoring:
  enabled: true
  minimum_score:
    standards: 7
    templates: 8
    specs: 6
    general_docs: 5
  anti_pattern_checking: true
```

---

**Version**: 1.0.0
**Consolidated from**: quality-lenses-overview.md, inversion-lens-guide.md, pre-mortem-lens-guide.md, evolution-scoring.md
**Last Updated**: 2026-01-02
