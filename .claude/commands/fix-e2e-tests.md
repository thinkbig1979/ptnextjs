---
description: Systematically repair E2E test suites through failure categorization, strategic batching, and parallel fix implementation. Optimized for 500+ test suites with minimal context consumption.
globs:
alwaysApply: false
version: 2.0
encoding: UTF-8
---

# Fix E2E Tests (Agent OS Protocol v2.0 - Parallel Execution)

## Overview: Multi-Agent Orchestration for E2E Test Repair

You are the ORCHESTRATOR AGENT responsible for systematically repairing the E2E test suite. You coordinate sub-agents and synthesize their findings into strategic repair plans.

**KEY CHANGES IN v2.0:**
- Uses parallel-runner.ts for discovery (500+ tests in minutes)
- Minimal context consumption via aggregated JSON
- Dynamic shard calculation to avoid empty shards
- Single subagent for discovery instead of N batch subagents

**Core Principle**: Fix application bugs in the source code, not by modifying tests (tests should reveal true behavior).

```
ORCHESTRATOR (You - minimal context)
|
+-- Phase 0: Pre-Flight - Verify infrastructure, detect parallel-runner
+-- Phase 1: Discovery - ONE subagent runs parallel-runner.ts (returns aggregated.json)
+-- Phase 2: Analysis - Parse aggregated.json, categorize failures
+-- Phase 2.5: Bug Fixing - If APPLICATION_BUG found, pause and fix app first
+-- Phase 3: Fix - Dispatch fix sub-agents (parallel by category)
+-- Phase 4: Verification - Re-run affected files via parallel-runner
+-- Phase 5: Iterate - Repeat until pass rate exceeds 90%
+-- Context Handoff - Save state if context reaches 85%
```

---

## Application Bug Handling

### The Golden Rule

**Fix application bugs directly rather than working around them in tests.** When a test fails because the application has incorrect behavior, fixing the application ensures all users benefit from the correction.

### Detection

During Phase 2 (Analysis), for each failure ask:
1. What does the test expect?
2. Is that the correct/intended behavior (per specs/docs)?
3. What does the app actually do?

If test expectation is CORRECT but app behavior is WRONG = APPLICATION_BUG

### Required Protocol for APPLICATION_BUG

1. Pause test repair work temporarily
2. Create Beads bug task: bd create --title="BUG: [description]" --type=bug
3. Document the bug with expected vs actual behavior
4. Dispatch bug fix subagent
5. WAIT for fix to complete
6. Verify fix with ORIGINAL test expectations
7. Close bug task
8. ONLY THEN resume test repair work

### Patterns to Avoid

- Writing tests that expect buggy behavior
- Adding workarounds in test helpers
- Skipping tests because app is broken
- Changing assertions to match wrong output

---

## STEP 0: Load Skill and Check Infrastructure

### 0a: Invoke the E2E Test Repair Skill

```
Skill(skill="e2e-test-repair")
```

This loads failure categories, fix patterns, and sub-agent templates.

### 0b: Check for Resume Flag

If user invoked with `--resume`:
1. Check for handoff file: `.agent-os/e2e-repair/handoff.json`
2. If exists, load state and continue from saved phase
3. If not exists, report no handoff found and start fresh

### 0c: Detect Project Configuration

```bash
# Find test directory and count files
TEST_DIR=$(ls -d tests/e2e/ e2e/ test/e2e/ 2>/dev/null | head -1)
TEST_COUNT=$(find ${TEST_DIR} -name "*.spec.ts" -o -name "*.spec.js" 2>/dev/null | wc -l)

# Get base URL
BASE_URL=$(grep -o 'baseURL.*localhost:[0-9]*' playwright.config.* 2>/dev/null | head -1 | grep -o 'localhost:[0-9]*' || echo "localhost:3000")

# Check for parallel-runner.ts
PARALLEL_RUNNER=".agent-os/scripts/e2e-parallel/parallel-runner.ts"
ls ${PARALLEL_RUNNER} 2>/dev/null && echo "PARALLEL_RUNNER: FOUND" || echo "PARALLEL_RUNNER: NOT_FOUND"
```

### 0d: Calculate Optimal Shard Count

**Dynamic shard calculation prevents empty shards:**

```
shard_count = min(8, max(2, ceil(test_file_count / 25)))
```

| Test Files | Shards | Reasoning |
|------------|--------|-----------|
| 1-50       | 2      | Minimum parallelism |
| 51-100     | 4      | Standard |
| 101-150    | 6      | More parallelism |
| 151+       | 8      | Maximum (server limit) |

Store: SHARD_COUNT based on TEST_COUNT

---

## STEP 1: Pre-Flight Verification (Phase 0)

### 1a: Server Health Check

```bash
curl -sf --max-time 5 http://${BASE_URL}/health && echo "Server: OK" || echo "Server: DOWN"
```

If server is down: STOP, tell user, wait for confirmation.

### 1b: Clear Rate Limits

```bash
curl -X POST http://${BASE_URL}/api/test/rate-limit/clear 2>/dev/null || true
```

### 1c: Check Parallel Runner

```bash
ls .agent-os/scripts/e2e-parallel/parallel-runner.ts 2>/dev/null
```

If NOT found:
1. Run Agent OS update to install missing scripts:
   ```bash
   ~/.agent-os/setup/update-agent-os.sh --target ./.agent-os
   ```
2. If update unavailable, fall back to sequential batch mode (slower)

### 1d: Verify Dependencies

```bash
# Check tsx is available (for parallel-runner.ts)
npx tsx --version 2>/dev/null || echo "tsx not found - install with: npm i -D tsx"
```

---

## STEP 2: Discovery Phase (Phase 1) - PARALLEL

### 2a: Dispatch Single Parallel Discovery Agent

Dispatch ONE subagent that runs the parallel test suite:

```
Task(
  subagent_type="general-purpose",
  prompt="""
You are a PARALLEL TEST EXECUTION agent.

Read the parallel-runner template:
  ~/.claude/skills/e2e-test-repair/references/parallel-runner-agent.md

PROJECT_DIR: {project_dir}
SHARD_COUNT: {shard_count}
MODE: discovery

Execute:
cd {project_dir} && npx tsx .agent-os/scripts/e2e-parallel/parallel-runner.ts \
  --shards={shard_count} \
  --timeout=30000 \
  --output=./test-results/parallel

After completion:
1. Read ./test-results/parallel/aggregated.json
2. Categorize each failure (AUTH_FAILURE, RATE_LIMIT, etc.)
3. Flag any potential APPLICATION_BUG

Return ONLY:
- stats (total, passed, failed, skipped)
- failures array with category for each
- shard distribution (for imbalance detection)
- duration

DO NOT return raw test output - only the structured JSON.
""",
  description="Parallel discovery: {shard_count} shards, {test_count} tests"
)
```

### 2b: Fallback to Sequential (if no parallel-runner)

If parallel-runner not available:

```
Task(
  subagent_type="general-purpose",
  prompt="""
You are a TEST EXECUTION agent. Run tests in batches.

Read: ~/.claude/skills/e2e-test-repair/references/test-runner-agent.md

TEST_FILES: {batch of 5 files}
PROJECT_DIR: {project_dir}

Run: npx playwright test {files} --reporter=list --timeout=30000

STOP after 5 failures or 3 consecutive failures.
Return categorized failures only.
""",
  description="Test batch: {batch_name}"
)
```

Dispatch multiple batch agents in parallel.

### 2c: Collect Discovery Results

Use AgentOutputTool to get results from the discovery agent(s).

**For parallel mode**: Parse the aggregated.json structure directly.
**For sequential mode**: Merge batch results.

---

## STEP 3: Analysis Phase (Phase 2)

### 3a: Parse Aggregated Results

From the discovery agent response, extract:

```
stats:
  total: 500
  passed: 400
  failed: 100
  skipped: 0

failures: [array of {file, title, error, category}]
```

### 3b: Categorize and Count

Group failures by category:

```
FAILURE ANALYSIS COMPLETE
=========================
Total: 500 tests | Passed: 400 | Failed: 100 | Pass Rate: 80%

BLOCKING (fix before continuing):
  APPLICATION_BUG: N tests - FIX APP FIRST!

By Category (priority order):
  AUTH_FAILURE:    N tests (NN%)
  RATE_LIMIT:      N tests (NN%)
  SERVER_ERROR:    N tests (NN%)
  DATA_MISSING:    N tests (NN%)
  SELECTOR_BROKEN: N tests (NN%)
  LOGIC_ERROR:     N tests (NN%)
  HANG:            N tests (NN%)
```

### 3c: Check for Application Bugs FIRST

For each LOGIC_ERROR or assertion failure:
- Is the test expectation correct per specs?
- Does the app do something different?

If yes = APPLICATION_BUG. Reclassify before proceeding.

### 3d: If APPLICATION_BUG Found

**Do NOT proceed to Phase 3 until all APPLICATION_BUGs are fixed.**

---

## STEP 3.5: Bug Fixing Phase (Phase 2.5)

**Required if any APPLICATION_BUG detected.**

### 3.5a: Create Bug Tasks

```bash
bd create --title="BUG: [description]" --type=bug
```

### 3.5b: Dispatch Bug Fix Subagent

```
Task(
  subagent_type="general-purpose",
  prompt="""
You are fixing an APPLICATION BUG.

Important: Fix the application source code rather than modifying tests.

BUG: [description]
EXPECTED: [correct behavior]
ACTUAL: [what app does]
EVIDENCE: [test output]
LOCATION: [likely app file]

Fix the app, then verify with affected tests.
Report what you changed.
""",
  description="Fix bug: {bug_id}"
)
```

### 3.5c: Verify and Close

Run affected tests. If pass, close bug task. If fail, iterate.

---

## STEP 4: Fix Phase (Phase 3) - PARALLEL BY CATEGORY

### 4a: Group Fixes by Category

Group all failures by category. Dispatch fix subagents in parallel for independent categories.

### 4b: Dispatch Parallel Fix Subagents

```
Task(
  subagent_type="general-purpose",
  prompt="""
You are a FIX IMPLEMENTATION agent.

Read: ~/.claude/skills/e2e-test-repair/references/fix-patterns.md

CATEGORY: {category}
AFFECTED_FILES: {file_list}
SAMPLE_ERRORS: {samples}

Apply the standard fix pattern for {category}.
Verify with 2-3 affected tests.
Report what you changed.

Note: If you discover the application behavior is wrong rather than the test setup, pause and report back so we can address the root cause.
""",
  description="Fix: {category} ({count} tests)"
)
```

Dispatch fix agents for AUTH_FAILURE, RATE_LIMIT, SERVER_ERROR in parallel (they're independent).

### 4c: Wait and Collect

Use AgentOutputTool to collect all fix results.

---

## STEP 5: Verification Phase (Phase 4) - PARALLEL

### 5a: Build Affected File List

Collect all test files that had fixes applied.

### 5b: Run Targeted Verification

If parallel-runner available and file count > 10:

```
Task(
  subagent_type="general-purpose",
  prompt="""
Run verification on affected files.

PROJECT_DIR: {project_dir}
AFFECTED_FILES: {file_list}

cd {project_dir} && npx tsx .agent-os/scripts/e2e-parallel/parallel-runner.ts \
  --shards=2 \
  --timeout=30000 \
  -- {affected_files}

Return stats and any remaining failures.
""",
  description="Verify fixes: {file_count} files"
)
```

If file count <= 10, run directly:
```bash
npx playwright test {files} --reporter=list --timeout=30000
```

### 5c: Calculate New Pass Rate

```
VERIFICATION RESULTS
====================
Tests Run: {count}
Passed: {passed}
Failed: {failed}
New Pass Rate: {rate}%
```

---

## STEP 6: Iteration (Phase 5)

### 6a: Update Progress Table

```
| CATEGORY        | TOTAL | FIXED | REMAINING | STATUS      |
|-----------------|-------|-------|-----------|-------------|
| APPLICATION_BUG | 5     | 5     | 0         | RESOLVED    |
| AUTH_FAILURE    | 45    | 42    | 3         | RESOLVED    |
| RATE_LIMIT      | 30    | 30    | 0         | RESOLVED    |
| ...             |       |       |           |             |

Overall: 450/500 passing (90%)
```

### 6b: Check Success Criteria

- Pass rate >= 95%: SUCCESS
- Pass rate >= 90% after 3 cycles: SUCCESS with caveats
- Pass rate < 70% after 2 cycles: ESCALATE to human

---

## STEP 7: Context Management

### 7a: Check Periodically

After each major phase:
- Context < 70%: Continue
- Context 70-85%: Prepare handoff
- Context >= 85%: Execute handoff immediately

### 7b: Create Handoff

Save state to `.agent-os/e2e-repair/handoff.json`:
- Current phase
- Failures remaining by category
- Fixes applied
- Pass rate history

### 7c: Report to User

```
E2E REPAIR SESSION PAUSED
=========================
Context limit reached.

Progress: 400/500 passing (80%)
Current Phase: Fix - SERVER_ERROR
Remaining: 100 failures in 3 categories

TO RESUME: /fix-e2e-tests --resume
```

---

## Critical Rules (v2.0)

1. **APPLICATION_BUG is blocking** - Fix app before test fixes
2. **Parallel Discovery** - Use parallel-runner.ts for discovery
3. **Dynamic Shards** - Calculate based on test count to avoid empty shards
4. **Minimal Context** - Only pass aggregated.json, not raw output
5. **Single Worker Per Shard** - Prevent server overload
6. **Parallel Fixes** - Group by category, dispatch in parallel
7. **Targeted Verification** - Re-run only affected files

---

## Sub-Agent Types

All use `subagent_type="general-purpose"` with role-specific prompts:

- **Parallel Discovery**: Runs parallel-runner.ts, returns aggregated.json
- **Fix Implementer**: Applies fixes by category
- **Bug Fixer**: Fixes application code (for APPLICATION_BUG only)

---

## Performance Expectations

| Test Count | Discovery Time | Total Time (est) |
|------------|----------------|------------------|
| 100        | ~3 min         | ~15 min          |
| 250        | ~7 min         | ~30 min          |
| 500        | ~15 min        | ~45 min          |

(Assuming 4-8 shards, single dev server)

---

## Quick Start

1. `/fix-e2e-tests` - Invoke command
2. Skill loads, pre-flight checks
3. Parallel discovery (one subagent, N shards)
4. Analysis: categorize failures from aggregated.json
5. Fix APPLICATION_BUGs first (if any)
6. Parallel fixes by category
7. Targeted verification
8. Iterate until 90%+ pass rate
