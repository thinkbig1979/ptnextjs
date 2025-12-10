---
description: Systematically repair E2E test suites through failure categorization, strategic batching, and parallel fix implementation. Detects and fixes application bugs before test infrastructure fixes.
globs:
alwaysApply: false
version: 1.1
encoding: UTF-8
---

# Fix E2E Tests (Agent OS Protocol)

## Overview: Multi-Agent Orchestration for E2E Test Repair

You are the ORCHESTRATOR AGENT responsible for systematically repairing the E2E test suite. You coordinate sub-agents and synthesize their findings into strategic repair plans.

**CRITICAL PRINCIPLE: Never work around application bugs. Fix them first.**

```
ORCHESTRATOR (You)
|
+-- Phase 0: Pre-Flight - Verify infrastructure
+-- Phase 1: Discovery - Dispatch test-runner sub-agents (parallel batches)
+-- Phase 2: Analysis - Categorize failures, DETECT APPLICATION BUGS
+-- Phase 2.5: Bug Fixing - If APPLICATION_BUG found, STOP and fix app first
+-- Phase 3: Fix - Dispatch fix sub-agents (one category at a time)
+-- Phase 4: Verification - Re-run affected tests
+-- Phase 5: Iterate - Repeat until pass rate exceeds 90%
+-- Context Handoff - Save state if context reaches 85%
```

---

## CRITICAL: Application Bug Handling

### The Golden Rule

**If a test fails because the APPLICATION is wrong, you MUST fix the application - NEVER modify the test to accept wrong behavior.**

### Detection

During Phase 2 (Analysis), for each failure ask:
1. What does the test expect?
2. Is that the correct/intended behavior (per specs/docs)?
3. What does the app actually do?

If test expectation is CORRECT but app behavior is WRONG = APPLICATION_BUG

### Mandatory Protocol for APPLICATION_BUG

```
1. STOP all test repair work
2. Create Beads bug task:
   bd create --title="BUG: [description]" --type=bug

3. Document the bug:
   bd update BEADS-XXX --body="
   Expected: [correct behavior]
   Actual: [what app does]
   Evidence: [test output]
   Location: [likely app file]
   Affected tests: [list]
   "

4. Dispatch bug fix subagent:
   Task(subagent_type="general-purpose", prompt="Fix APPLICATION bug...")

5. WAIT for fix to complete

6. Verify fix:
   Run affected tests with ORIGINAL expectations
   All must pass

7. Close bug task:
   bd close BEADS-XXX --reason="Fixed: [description]"

8. ONLY THEN resume test repair work
```

### FORBIDDEN Actions

- Writing tests that expect buggy behavior
- Adding workarounds in test helpers
- Skipping tests because app is broken
- Changing assertions to match wrong output
- Adding TODO comments and moving on

---

## STEP 0: Load Skill and Check for Resume

### 0a: Invoke the E2E Test Repair Skill

Invoke the skill to load patterns and reference material:

```
Skill(skill="e2e-test-repair")
```

This loads failure categories (including APPLICATION_BUG), fix patterns, and sub-agent templates.

### 0b: Check for Resume Flag

If user invoked with `--resume`:
1. Check for handoff file: `.agent-os/e2e-repair/handoff.json`
2. If exists, load state and continue from saved phase
3. If not exists, report no handoff found and start fresh

### 0c: Detect Project Configuration

Detect E2E test configuration:

```bash
# Find Playwright config
ls playwright.config.ts playwright.config.js 2>/dev/null

# Find test directory
ls -d tests/e2e/ e2e/ test/e2e/ 2>/dev/null | head -1

# Get base URL from config
grep -o 'baseURL.*localhost:[0-9]*' playwright.config.* 2>/dev/null | head -1
```

Store detected values:
- TEST_DIR: detected test directory
- BASE_URL: detected base URL (default: http://localhost:3000)
- CONFIG_FILE: playwright config path

---

## STEP 1: Pre-Flight Verification (Phase 0)

Before running any tests, verify infrastructure is ready.

### 1a: Server Health Check

```bash
# Check server is running
curl -sf --max-time 5 ${BASE_URL}/health && echo "Server: OK" || echo "Server: DOWN"
curl -sf --max-time 5 ${BASE_URL} && echo "Base URL: OK" || echo "Base URL: DOWN"
```

If server is down:
1. STOP - Do not proceed
2. Tell user which server(s) are down
3. Ask them to start servers
4. Wait for confirmation

### 1b: Clear Rate Limits

```bash
curl -X POST ${BASE_URL}/api/test/rate-limit/clear 2>/dev/null || echo "No rate limit endpoint"
```

### 1c: Verify Test Data

```bash
curl -sf ${BASE_URL}/api/test/vendors/status 2>/dev/null || echo "No vendor status endpoint"
```

### 1d: Check Build (Next.js)

```bash
ls -la .next/ 2>/dev/null | head -3 || echo "No .next build found"
```

If ANY critical check fails, report to user and ask how to proceed.

---

## STEP 2: Discovery Phase (Phase 1)

Dispatch test-runner sub-agents in parallel to discover failures.

### 2a: Discover Test Files

```bash
find ${TEST_DIR} -name "*.spec.ts" -o -name "*.spec.js" | head -50
```

### 2b: Create Test Batches

Group test files into batches of maximum 5 files each:

1. **auth batch**: `${TEST_DIR}/auth/*.spec.ts`
2. **onboarding batch**: `${TEST_DIR}/vendor-onboarding/*.spec.ts`
3. **verify batch**: `${TEST_DIR}/verify-*.spec.ts`
4. **remaining**: Other files grouped by directory

### 2c: Dispatch Parallel Test Runners

For each batch, dispatch a general-purpose sub-agent with the test-runner prompt:

```
Task(
  subagent_type="general-purpose",
  prompt="""
You are a TEST EXECUTION agent. Run this batch and report failures.

Read the test-runner template from the e2e-test-repair skill:
  ~/.claude/skills/e2e-test-repair/references/test-runner-agent.md

BATCH: {batch_name}
PROJECT_DIR: {project_dir}
TEST_FILES: {test_files}

Execute using:
cd {project_dir} && DISABLE_EMAILS=true npx playwright test {test_files} --reporter=list --timeout=30000 2>&1 | head -200

STOP CONDITIONS:
- After 5 total failures
- After 3 consecutive failures
- After 2 minutes no output

Return JSON report with categorized failures.

IMPORTANT: If you detect an APPLICATION_BUG (app behavior wrong, not test wrong),
flag it clearly in your report. Do NOT suggest test modifications for app bugs.
""",
  description="Test batch: {batch_name}"
)
```

Dispatch ALL batches in a SINGLE message with multiple Task invocations for parallel execution.

### 2d: Collect Results

Use AgentOutputTool to collect results from all test-runner sub-agents.
Merge all failure reports into a unified failure database.

---

## STEP 3: Analysis Phase (Phase 2)

Analyze collected failures to identify root causes.

### 3a: Categorize All Failures

Load category definitions:
```
~/.claude/skills/e2e-test-repair/references/failure-categories.md
```

For each failure, determine category using this priority:

1. **APPLICATION_BUG** - Is app behavior wrong? (BLOCKING)
2. AUTH_FAILURE - 401, credentials
3. RATE_LIMIT - 429, too many requests
4. SERVER_ERROR - 500, connection refused
5. DATA_MISSING - test data not found
6. SELECTOR_BROKEN - element not found
7. LOGIC_ERROR - test logic wrong (NOT app wrong)
8. HANG - no progress

### 3b: Check for Application Bugs FIRST

**Before proceeding, explicitly check:**

For each LOGIC_ERROR or assertion failure:
- Read the test expectation
- Check documentation/specs for intended behavior
- If test expectation matches intended behavior but app does different = APPLICATION_BUG

**Reclassify any misclassified bugs before continuing.**

### 3c: Count by Category

```
FAILURE ANALYSIS COMPLETE
========================
Total Failures: N

BLOCKING (must fix before continuing):
  APPLICATION_BUG: N tests - FIX APP FIRST!

By Category:
  AUTH_FAILURE:    N tests (NN%)
  RATE_LIMIT:      N tests (NN%)
  SERVER_ERROR:    N tests (NN%)
  DATA_MISSING:    N tests (NN%)
  SELECTOR_BROKEN: N tests (NN%)
  LOGIC_ERROR:     N tests (NN%)
  HANG:            N tests (NN%)
```

### 3d: If APPLICATION_BUG Found - Execute Phase 2.5

**Do NOT proceed to Phase 3 if any APPLICATION_BUG detected.**

---

## STEP 3.5: Bug Fixing Phase (Phase 2.5)

**This phase is MANDATORY if any APPLICATION_BUG was detected.**

### 3.5a: Create Bug Tasks

For each APPLICATION_BUG, create a Beads task:

```bash
bd create --title="BUG: [clear description of wrong behavior]" --type=bug
```

### 3.5b: Document Each Bug

```bash
bd update BEADS-XXX --body="
## Bug Description
[What is broken in the application]

## Expected Behavior
[What should happen according to specs/documentation]

## Actual Behavior  
[What the application actually does]

## Evidence
- Test file: [path]
- Error: [message]
- Stack trace: [relevant lines]

## Affected Tests
- [test1.spec.ts]
- [test2.spec.ts]

## Likely Location
[File and function in app code]
"
```

### 3.5c: Dispatch Bug Fix Subagent

For each bug (or group of related bugs):

```
Task(
  subagent_type="general-purpose",
  prompt="""
You are fixing an APPLICATION BUG discovered during E2E test repair.

CRITICAL: Fix the APPLICATION CODE, not the tests.
NEVER modify tests to accept wrong behavior.

BUG TASK: BEADS-XXX

EXPECTED BEHAVIOR:
[what should happen]

ACTUAL BEHAVIOR:
[what app does]

EVIDENCE:
- Test: [test file]
- Error: [error message]

LIKELY LOCATION:
[app file and function]

YOUR TASK:
1. Read the failing test to understand expected behavior
2. Find the bug in the application code
3. Fix the application code
4. Run affected tests to verify (with ORIGINAL expectations)
5. Report what you changed

RULES:
- Fix the APP, not the test
- Do not change test expectations
- Do not add workarounds
- If cannot find bug, report back

VERIFICATION - Run these tests after fixing:
[list of affected test files]

All must pass with ORIGINAL expectations.
""",
  description="Fix bug: BEADS-XXX"
)
```

### 3.5d: Verify Bug Fixes

After each bug fix subagent completes:

1. Run affected tests:
   ```bash
   npx playwright test [affected_tests] --reporter=list --timeout=30000
   ```

2. Check results:
   - If tests pass: Close bug task and continue
   - If tests fail with same error: Bug not fixed, iterate
   - If tests fail with different error: New issue, analyze

3. Close completed bugs:
   ```bash
   bd close BEADS-XXX --reason="Fixed: [brief description]"
   ```

### 3.5e: Repeat Until All Bugs Fixed

**Do NOT proceed to Phase 3 until ALL APPLICATION_BUGs are resolved.**

---

## STEP 4: Fix Phase (Phase 3)

Fix ONE category at a time, verify, then proceed to next.

**Note: Only reach this phase after all APPLICATION_BUGs are fixed.**

### 4a: Load Fix Patterns

```
~/.claude/skills/e2e-test-repair/references/fix-patterns.md
```

### 4b: Dispatch Fix Sub-Agent

For the highest-priority category, dispatch a fix sub-agent:

```
Task(
  subagent_type="general-purpose",
  prompt="""
You are a FIX IMPLEMENTATION agent.

Read the fix-agent template from the e2e-test-repair skill:
  ~/.claude/skills/e2e-test-repair/references/fix-agent.md

Also read fix patterns:
  ~/.claude/skills/e2e-test-repair/references/fix-patterns.md

CATEGORY: {category}
ROOT_CAUSE: {root_cause}
AFFECTED_TESTS: {count}
SAMPLE_ERROR: {sample_error}
FILES_TO_EXAMINE: {file_list}
PROJECT_DIR: {project_dir}

CRITICAL: Before fixing, verify this is NOT an APPLICATION_BUG.
If you discover the app behavior is wrong, STOP and report back.
Do NOT modify tests to work around app bugs.

Implement the fix and verify with 2-3 affected tests.
Return JSON report with fix details and verification result.
""",
  description="Fix: {category}"
)
```

### 4c: Handle APPLICATION_BUG Discovery

If fix sub-agent reports APPLICATION_BUG discovered:
1. Return to Phase 2.5
2. Create bug task
3. Fix the app
4. Then resume Phase 3

### 4d: Collect Fix Report

Wait for fix sub-agent to complete.
Review the fix applied and verification result.

---

## STEP 5: Verification Phase (Phase 4)

After each fix, verify it worked.

### 5a: Run Affected Tests

Run ONLY the tests that were failing in the fixed category:

```bash
npx playwright test {affected_test_files} --reporter=list --timeout=30000
```

### 5b: Calculate Pass Rate

```
VERIFICATION RESULTS
====================
Category: {category}
Tests Run: {count}
Passed: {passed}
Failed: {failed}
Pass Rate: {rate}%
```

### 5c: Decision

- If pass rate >= 80%: Mark category as RESOLVED, proceed to next category
- If pass rate < 80%: Analyze remaining failures
  - Check for APPLICATION_BUG misclassification
  - Report to user, ask how to proceed

---

## STEP 6: Iteration (Phase 5)

Repeat phases 3-4 until:
- All high-impact categories are resolved
- Remaining failures are isolated edge cases
- Test pass rate exceeds 90%

### 6a: Update Progress Table

Maintain running tally:

```
| CATEGORY        | TOTAL | FIXED | REMAINING | STATUS      |
|-----------------|-------|-------|-----------|-------------|
| APPLICATION_BUG | 5     | 5     | 0         | RESOLVED    |
| AUTH_FAILURE    | 45    | 42    | 3         | RESOLVED    |
| RATE_LIMIT      | 30    | 30    | 0         | RESOLVED    |
| SERVER_ERROR    | 15    | 0     | 15        | PENDING     |
| ...             |       |       |           |             |
```

### 6b: Check Success Criteria

- Pass rate >= 95%: SUCCESS - Report final state and exit
- Pass rate >= 90% after 3 cycles: SUCCESS with caveats
- Pass rate < 70% after 2 cycles: ESCALATE to human

---

## STEP 7: Context Management

Monitor context usage throughout the session.

### 7a: Check Context Periodically

After each major phase:
- If context < 70%: Continue normally
- If context 70-85%: Prepare handoff state
- If context >= 85%: Execute handoff immediately

### 7b: Create Handoff

Load handoff protocol:
```
~/.claude/skills/e2e-test-repair/references/handoff-protocol.md
```

Save state to:
- `.agent-os/e2e-repair/handoff.json`
- `.agent-os/e2e-repair/handoff.md`

### 7c: Report to User

```
E2E REPAIR SESSION PAUSED
=========================
Context limit reached (NN%)

Progress: X/Y failures fixed (ZZ% pass rate)
Current: [current phase and task]
Pending bugs: [any unresolved APPLICATION_BUGs]

State saved to: .agent-os/e2e-repair/handoff.json

TO RESUME:
  /fix-e2e-tests --resume

Or start fresh:
  /fix-e2e-tests
```

---

## Escalation Triggers

Stop and ask user when:
- Application bug detected - MUST fix before continuing
- Server will not start - infrastructure issue
- Database schema changes needed
- Test requires unavailable external service
- Same fix attempted 3x without success
- Unclear if test or app behavior is wrong - ASK, do not guess
- Context reaches 85%

---

## Critical Rules

1. **APPLICATION_BUG is blocking** - Fix app before any test fixes
2. **NEVER work around bugs** - No test modifications for app bugs
3. **Batch Size**: Maximum 5 test files per sub-agent
4. **Stop Threshold**: Stop after 3 consecutive OR 5 total failures per batch
5. **Timeout**: Hard 30s limit - NO increases allowed
6. **Fix Order**: APPLICATION_BUG first, then AUTH, RATE_LIMIT, SERVER, rest
7. **One Category at a Time**: Fix and verify before moving to next
8. **Parallel Discovery**: Run test batches in parallel
9. **Sequential Fixes**: Apply fixes sequentially with verification
10. **Context Aware**: Handoff before exceeding 90% context
11. **User Decisions**: Ask before major actions
12. **When in doubt**: Ask user if behavior is test issue or app bug

---

## Sub-Agent Types

All sub-agents use `subagent_type="general-purpose"` with role-specific prompts:

- **Test Runner**: Executes test batches, reports failures, flags potential app bugs
- **Fix Implementer**: Implements test/infrastructure fixes, detects app bugs
- **Bug Fixer**: Fixes application code (dispatched only for APPLICATION_BUG)

Sub-agents receive templates from skill references:
- `references/test-runner-agent.md`
- `references/fix-agent.md`

---

## Beads Integration

Create tasks for all significant work:

```bash
# For application bugs (REQUIRED)
bd create --title="BUG: [description]" --type=bug

# For test infrastructure fixes (optional but recommended)
bd create --title="Fix: [category] - [root cause]" --type=task

# Track progress
bd update BEADS-XXX --status=in_progress
bd close BEADS-XXX --reason="[completion note]"
```

---

## Quick Start

1. User invokes: `/fix-e2e-tests`
2. Skill loads failure patterns
3. Pre-flight checks infrastructure
4. Discovery finds all failures (parallel batches)
5. Analysis categorizes by root cause, **IDENTIFIES APPLICATION BUGS**
6. **Bug fixing: Fix ALL application bugs first** (Phase 2.5)
7. Test/infrastructure fixes applied one category at a time
8. Verification after each fix
9. Iterate until 90%+ pass rate or user stops
