---
description: Progressive E2E test repair for large test suites (100+ tests). Uses sampling, root cause analysis, and incremental verification instead of running full suite repeatedly.
globs:
alwaysApply: false
version: 1.0.0
---

# Fix E2E Large - Progressive Test Repair

## Overview

This command repairs large E2E test suites (100+ tests) efficiently through:
1. Tiered execution (smoke first, then expand)
2. Root cause identification (not just failure categorization)
3. Incremental verification (sample, then expand)
4. Persistent state (survives context exhaustion)

## When to Use

- 100+ E2E tests with significant failures
- Full suite takes too long to run repeatedly
- Need to identify root causes, not just fix symptoms
- Previous fix attempts exhausted context without completing

## Pre-Flight

### Step 0: Load Required Skills

```
Skill(skill="e2e-test-organization")
Skill(skill="e2e-test-repair")
```

### Step 1: Check for Resume

```bash
# Check for existing repair session
ls .agent-os/e2e-repair/session-state.json 2>/dev/null
```

If session exists and user passed --resume:
  - Load session state
  - Report progress so far
  - Continue from saved phase

If session exists but no --resume:
  - Ask user: "Found previous session at Phase X. Resume or start fresh?"

### Step 2: Verify Infrastructure

```bash
# Check test inventory exists
ls tests/e2e/test-inventory.ts 2>/dev/null || echo "NO_INVENTORY"

# Check server health
curl -sf --max-time 5 http://localhost:3000/health && echo "SERVER_OK" || echo "SERVER_DOWN"

# Clear rate limits
curl -X POST http://localhost:3000/api/test/rate-limit/clear 2>/dev/null || true
```

If NO_INVENTORY:
  - Run: npx tsx ~/.agent-os/scripts/test-organization/generate-inventory.ts
  - Ask user to review and commit before continuing

If SERVER_DOWN:
  - STOP and tell user to start the server
  - Do NOT auto-start (causes port conflicts)

---

## Phase 1: Smoke Triage (BLOCKING)

### Purpose

If smoke tests fail, the app is fundamentally broken. Fix these FIRST before wasting time on other tests.

### Step 1.1: Run Smoke Tests

```bash
npm run test:e2e:smoke 2>&1 | tee .agent-os/e2e-repair/smoke-results.txt
```

OR if no tiered scripts:
```bash
# Get smoke tests from inventory
SMOKE_TESTS=$(npx tsx -e "require('./tests/e2e/test-inventory').TEST_TIERS.smoke.forEach(t => console.log(t))")
npx playwright test ${SMOKE_TESTS} --reporter=list --timeout=30000
```

### Step 1.2: Evaluate Smoke Results

```
SMOKE TRIAGE RESULTS
====================
Tests Run: N
Passed: N
Failed: N
Pass Rate: NN%
```

IF all smoke tests pass:
  - Proceed to Phase 2

IF any smoke tests fail:
  - These are BLOCKING
  - Analyze each failure
  - Fix smoke tests before proceeding
  - DO NOT proceed to Phase 2 until smoke is green

### Step 1.3: Fix Smoke Failures (if any)

For each smoke failure:
1. Classify: Is this APPLICATION_BUG or TEST_ISSUE?
2. If APPLICATION_BUG: Create beads task, fix app, verify
3. If TEST_ISSUE: Fix test directly
4. Re-run smoke until all pass

---

## Phase 2: Sample Discovery

### Purpose

Instead of running all 500 tests, sample 20-30 to identify failure patterns and root causes.

### Step 2.1: Select Sample

```typescript
// Sample selection strategy
const allTests = [...TEST_TIERS.core, ...TEST_TIERS.regression];
const sampleSize = Math.min(30, Math.ceil(allTests.length * 0.1));

// Stratified sample: proportional from each tier
const coreSample = selectRandom(TEST_TIERS.core, Math.ceil(sampleSize * 0.6));
const regSample = selectRandom(TEST_TIERS.regression, Math.ceil(sampleSize * 0.4));
const sample = [...coreSample, ...regSample];
```

### Step 2.2: Run Sample

```bash
npx playwright test ${SAMPLE_TESTS} --reporter=json --timeout=30000 > .agent-os/e2e-repair/sample-results.json
```

### Step 2.3: Analyze Sample

```
SAMPLE ANALYSIS
===============
Sample Size: 30 tests
Passed: 18 (60%)
Failed: 12 (40%)

Estimated Full Suite: ~300/500 passing (60%)

Failure Breakdown:
  AUTH_FAILURE:    5 tests
  SELECTOR_BROKEN: 4 tests
  LOGIC_ERROR:     3 tests
```

---

## Phase 3: Root Cause Identification

### Purpose

Group failures by ROOT CAUSE, not just category. One fix may resolve many failures.

### Step 3.1: Pattern Analysis

For each failure category, look for patterns:

```
AUTH_FAILURE (5 tests):
  - All fail at login step
  - All use testvendor1@example.com
  - Error: "Invalid credentials"
  
  ROOT CAUSE: Password mismatch in global-setup.ts
  IMPACT: Likely affects ~150 tests (all auth-required tests)
  FIX COMPLEXITY: Low (single file change)
```

### Step 3.2: Root Cause Ranking

```
ROOT CAUSE ANALYSIS
===================
RC-1: Password sync in global-setup.ts
      Impact: ~150 tests | Fix: 1 file | Priority: P0
      
RC-2: Button selector changed (data-testid="submit" -> data-testid="submit-btn")
      Impact: ~30 tests | Fix: 1 component | Priority: P1
      
RC-3: Rate limit not cleared between tests
      Impact: ~20 tests | Fix: beforeEach hook | Priority: P1

Recommended Fix Order:
1. RC-1 (highest impact, low effort)
2. RC-2 (medium impact, low effort)  
3. RC-3 (lower impact, may be fixed by RC-1)
```

### Step 3.3: Check for APPLICATION_BUG

For each root cause, determine:
- Is the TEST wrong?
- Or is the APPLICATION wrong?

If APPLICATION wrong:
1. STOP other work
2. Create beads bug task
3. Fix application
4. Verify with affected tests
5. Then continue

---

## Phase 4: Fix Highest Impact

### Purpose

Fix one root cause at a time, verify with sample, then continue.

### Step 4.1: Apply Fix

Dispatch fix subagent for highest-impact root cause:

```
Task(
  subagent_type="general-purpose",
  prompt="""
You are fixing a ROOT CAUSE issue in the E2E test suite.

ROOT CAUSE: {description}
AFFECTED FILES: {list}
SAMPLE TESTS AFFECTED: {test_list}

Read: ~/.claude/skills/e2e-test-repair/references/fix-patterns.md

Apply the fix. Report:
1. What you changed
2. Files modified
3. Confidence level (high/medium/low)

DO NOT run tests - the orchestrator will verify.
""",
  description="Fix RC: {root_cause_id}"
)
```

### Step 4.2: Verify with Sample

Re-run the SAMPLE tests (not full suite):

```bash
npx playwright test ${SAMPLE_TESTS} --reporter=json --timeout=30000
```

### Step 4.3: Evaluate Progress

```
FIX VERIFICATION
================
Root Cause Fixed: RC-1 (Password sync)
Sample Before: 18/30 passing (60%)
Sample After:  25/30 passing (83%)
Improvement: +23%

Remaining Failures: 5
  - 3 SELECTOR_BROKEN (RC-2)
  - 2 LOGIC_ERROR (new issues)
```

IF improvement > 10%:
  - Commit fix
  - Save checkpoint
  - Continue to next root cause

IF no improvement or regression:
  - Rollback fix
  - Re-analyze root cause
  - Try different approach

### Step 4.4: Checkpoint

After each successful fix:

```bash
# Save state
cat > .agent-os/e2e-repair/session-state.json << EOF
{
  "phase": "fix",
  "timestamp": "$(date -Iseconds)",
  "rootCausesFixed": ["RC-1"],
  "rootCausesRemaining": ["RC-2", "RC-3"],
  "samplePassRate": 0.83,
  "estimatedFullPassRate": 0.85,
  "fixHistory": [
    {"rc": "RC-1", "file": "global-setup.ts", "result": "success"}
  ]
}
EOF

# Git commit
git add .
git commit -m "fix(e2e): RC-1 - Password sync in global-setup"
```

---

## Phase 5: Progressive Expansion

### Purpose

Once sample hits 90%+, expand verification to full tiers.

### Step 5.1: Check Sample Threshold

IF sample pass rate >= 90%:
  - Proceed to core tier verification

IF sample pass rate < 90%:
  - Continue fixing root causes
  - Do NOT expand yet

### Step 5.2: Run Core Tier

```bash
npm run test:e2e:core
```

### Step 5.3: Evaluate Core Results

```
CORE TIER RESULTS
=================
Tests Run: 26
Passed: 24
Failed: 2
Pass Rate: 92%

New Failures (not in sample):
  - product-crud.spec.ts: Timeout in beforeAll
  - search-basic.spec.ts: Element detached
```

IF core pass rate >= 90%:
  - Proceed to regression tier

IF core pass rate < 90%:
  - Analyze new failures
  - Fix root causes
  - Re-run core

### Step 5.4: Run Regression Tier

```bash
npm run test:e2e:regression
```

### Step 5.5: Final Verification

```bash
npm run test:e2e:full
```

---

## Phase 6: Quarantine & Cleanup

### Purpose

Isolate remaining flaky tests, document issues, prepare for ongoing maintenance.

### Step 6.1: Identify Quarantine Candidates

Tests that should be quarantined:
- Failed 3+ times across repair cycles
- Intermittent pass/fail with same code
- Require investigation beyond current scope

### Step 6.2: Update Test Inventory

```typescript
// Move flaky tests to quarantine
quarantine: [
  'flaky-websocket.spec.ts',  // BEADS-XXX: Intermittent timeout
  'race-condition.spec.ts',   // BEADS-YYY: Timing dependent
],
```

### Step 6.3: Create Tracking Issues

```bash
bd create --title="Investigate flaky-websocket.spec.ts" --type=task
bd create --title="Fix race-condition.spec.ts timing issue" --type=task
```

### Step 6.4: Final Report

```
E2E REPAIR COMPLETE
===================
Duration: 45 minutes (across 2 sessions)

Before:
  Estimated: ~300/500 passing (60%)
  
After:
  Full Suite: 485/500 passing (97%)
  Quarantined: 8 tests (with tracking issues)
  
Root Causes Fixed:
  1. RC-1: Password sync - 150 tests fixed
  2. RC-2: Button selector - 30 tests fixed
  3. RC-3: Rate limit clearing - 20 tests fixed
  
Remaining Issues:
  - 7 tests in quarantine (tracking issues created)
  - 0 known application bugs outstanding
  
Next Steps:
  1. Review quarantined tests weekly
  2. Run smoke tests on every commit
  3. Run core tests on every PR
```

---

## State Persistence

### Session State File

Location: `.agent-os/e2e-repair/session-state.json`

```json
{
  "version": "1.0",
  "startedAt": "2024-12-10T10:00:00Z",
  "lastUpdatedAt": "2024-12-10T10:45:00Z",
  "phase": "fix",
  "currentRootCause": "RC-2",
  "progress": {
    "smokePassed": true,
    "samplePassRate": 0.83,
    "corePassRate": null,
    "fullPassRate": null
  },
  "rootCauses": {
    "identified": ["RC-1", "RC-2", "RC-3"],
    "fixed": ["RC-1"],
    "remaining": ["RC-2", "RC-3"]
  },
  "fixHistory": [
    {
      "rootCause": "RC-1",
      "description": "Password sync in global-setup.ts",
      "filesChanged": ["tests/e2e/global-setup.ts"],
      "result": "success",
      "testsFixed": 150
    }
  ],
  "quarantined": [],
  "notes": []
}
```

### Resume Protocol

When resuming:
1. Load session-state.json
2. Report progress to user
3. Continue from saved phase
4. Verify previous fixes still work (quick smoke check)

---

## Escalation Triggers

Stop and ask user when:
- Smoke tests won't pass after 3 fix attempts
- Application bug detected (requires app fix)
- Root cause unclear after analysis
- Pass rate stuck below 80% after 3 cycles
- Context approaching 80% (save state first)

---

## Key Differences from /fix-e2e-tests

| Aspect | /fix-e2e-tests | /fix-e2e-large |
|--------|----------------|----------------|
| Initial run | All tests | Smoke only |
| Discovery | Full parallel | Sample (30 tests) |
| Grouping | By category | By root cause |
| Verification | All affected | Sample first |
| State | Handoff on exhaustion | Continuous checkpoints |
| Tiers | Not used | Core workflow |
