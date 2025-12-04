---
description: Run tests with Agent OS protocol - real-time monitoring, hung test detection, streaming reporters, failure handling
globs:
alwaysApply: false
version: 4.1
encoding: UTF-8
---

# Run Tests (Agent OS Protocol)

## Overview: Direct Execution with Delegated Fixes

```
MAIN AGENT (You)
│
├─► STEP 1: Ask user which tests to run
├─► STEP 2: Run tests DIRECTLY (real-time output visible to user)
├─► STEP 3: Analyze failures (if any)
├─► STEP 4: Triage decision (if failures)
├─► STEP 5: Delegate fixes to FIX SUBAGENT(s)
├─► STEP 6: Run verification tests DIRECTLY
└─► STEP 7: Loop until resolved or user stops
```

**IMPORTANT: You run tests DIRECTLY (not via subagent) so users see real-time streaming output.**
**Only FIXES are delegated to subagents.**

---

## STEP 1: Ask User Which Tests to Run (MANDATORY)

**BEFORE doing anything else, ASK the user:**

> Which tests would you like to run?
> - **unit** - Unit tests only (Vitest/Jest)
> - **e2e** - E2E tests only (Playwright/Cypress)
> - **all** - All test suites
> - **specific** - Specific test file(s)

**Wait for the user's response before proceeding.**

---

## STEP 2: Run Tests DIRECTLY (Main Agent)

**You run tests directly so the user sees real-time streaming output.**

### 2a: Server Pre-Flight Check (E2E only)

```bash
curl -sf --max-time 2 http://localhost:3000 && echo "Frontend: OK" || echo "Frontend: DOWN"
curl -sf --max-time 2 http://localhost:3001 && echo "Backend: OK" || echo "Backend: DOWN"
```

If ANY server is down:
1. **STOP** - Do not run E2E tests
2. **Tell the user** which server(s) are down
3. **Ask them** to start the servers
4. **Wait** for confirmation before proceeding

### 2b: Run Tests with Streaming Reporter

**Unit tests (Vitest) - EXACT command:**
```bash
node ~/.agent-os/hooks/lib/test-monitor.js pnpm vitest run --reporter=./scripts/reporters/vitest-streaming.js
```

**E2E tests (Playwright) - EXACT command:**
```bash
node ~/.agent-os/hooks/lib/test-monitor.js pnpm playwright test --reporter=./scripts/reporters/playwright-streaming.ts
```

**Specific files:**
```bash
node ~/.agent-os/hooks/lib/test-monitor.js pnpm vitest run --reporter=./scripts/reporters/vitest-streaming.js [file1] [file2]
```

### 2c: Validate Output Format

**You MUST see `[AGENT-OS-TEST]` markers in the output:**

```
{"type":"run_start",...}
[AGENT-OS-TEST] ◉ Collected X test file(s)
[AGENT-OS-TEST] ▶ test name starting
[AGENT-OS-TEST] ✓ test name (Xms)
{"type":"test_end","status":"passed",...}
[AGENT-OS-TEST] ✓ Summary: X/Y passed
```

**IF you do NOT see `[AGENT-OS-TEST]` markers:**
1. Check if reporters exist:
   ```bash
   ls -la scripts/reporters/vitest-streaming.js
   ls -la scripts/reporters/playwright-streaming.ts
   ```
2. If missing, install them:
   ```bash
   ~/.agent-os/setup/install-test-monitoring.sh --target .
   ```
3. Retry the test command

---

## STEP 3: Analyze Results (Main Agent)

### 3a: If All Tests Pass

```
✅ All tests passed ([X] total, [duration]ms)
```

Report success to user and exit.

### 3b: If Tests Failed - Analyze Each Failure

For each failure, determine:

| Field | Value |
|-------|-------|
| **Test name** | From test output |
| **Test file** | path:line from output |
| **Error message** | From output |
| **Classification** | assertion \| timeout \| environment \| syntax \| runtime |
| **Root cause hypothesis** | Your analysis |
| **Fix location** | `test` \| `implementation` \| `environment` \| `both` |
| **Grouped with** | Other failures with same root cause |

**Classification guide:**
- `assertion` - Expected vs actual mismatch
- `timeout` - Test exceeded time limit
- `environment` - Missing server, env var, dependency
- `syntax` - Parse/compile error
- `runtime` - Uncaught exception

### 3c: Persist Analysis

Save analysis to `.agent-os/test-failures/[run-id].json`:

```json
{
  "run_id": "[timestamp]",
  "test_type": "[unit|e2e|all]",
  "initial_results": {
    "total": 0,
    "passed": 0,
    "failed": 0,
    "skipped": 0,
    "duration_ms": 0
  },
  "failures": [
    {
      "id": "failure-001",
      "test_name": "[name]",
      "test_file": "[path:line]",
      "error_message": "[message]",
      "stack_trace": "[trace]",
      "classification": "[type]",
      "root_cause": "[hypothesis]",
      "fix_location": "[test|implementation|environment]",
      "fix_file": "[path]",
      "fix_instructions": "[specific instructions]",
      "status": "pending",
      "fix_history": []
    }
  ],
  "fix_iterations": [],
  "final_status": "in_progress"
}
```

---

## STEP 4: Triage Decision (If Failures)

Present analysis summary to user:

```
═══════════════════════════════════════════════════════════════════
TEST FAILURE ANALYSIS
═══════════════════════════════════════════════════════════════════

[X] tests failed out of [Y] total

FAILURES BY CLASSIFICATION:
- Assertion failures: [count] (test vs implementation mismatch)
- Timeout failures: [count] (async/server issues)
- Environment failures: [count] (missing deps/servers)
- Syntax errors: [count] (code won't parse)
- Runtime errors: [count] (uncaught exceptions)

FAILURE GROUPS (by root cause):
1. [Root cause hypothesis] - affects [N] tests
   Files: [list]
   Fix location: [test|implementation]

2. [Root cause hypothesis] - affects [N] tests
   ...

═══════════════════════════════════════════════════════════════════

How would you like to proceed?
- **investigate** - Show detailed analysis for each failure
- **fix** - Attempt to fix the failures (spawns fix subagents)
- **skip** - Continue without fixing (report only)
- **rerun** - Run failed tests again (for flaky tests)
```

**Wait for user response.**

---

## STEP 5: Delegate Fixes to Subagent(s) (If User Chooses "fix")

**Only fixes are delegated to subagents** (they don't need real-time output visibility).

For each failure group (by root cause), spawn a FIX SUBAGENT:

```
═══════════════════════════════════════════════════════════════════
FIX SUBAGENT - Specific Test Failure Fix
═══════════════════════════════════════════════════════════════════

You are fixing a specific test failure. Do NOT deviate from these instructions.

FAILURE DETAILS:
- Test: [test name]
- File: [test file path:line]
- Error: [error message]
- Classification: [assertion|timeout|runtime|etc.]

ROOT CAUSE ANALYSIS (from main agent):
[Root cause hypothesis from Step 3b]

FIX LOCATION:
- [ ] Test file: [path] (if test is wrong)
- [ ] Implementation file: [path] (if implementation is wrong)

SPECIFIC FIX REQUIRED:
[Explicit instructions based on classification]

For ASSERTION failures:
- Compare expected vs actual values
- Determine if test expectation is wrong OR implementation is wrong
- Fix the appropriate side

For TIMEOUT failures:
- Check for missing async/await
- Check for unresolved promises
- Check if server dependency is missing
- Add appropriate timeout configuration

For ENVIRONMENT failures:
- Identify missing dependency
- Report back - do NOT install dependencies yourself

For SYNTAX errors:
- Fix the syntax error in the identified file

For RUNTIME errors:
- Read the stack trace
- Identify the throw location
- Fix the underlying issue

═══════════════════════════════════════════════════════════════════
BEFORE YOU START
═══════════════════════════════════════════════════════════════════

1. Read the failing test file
2. Read the implementation file(s) involved
3. Confirm the root cause analysis is correct
4. If analysis seems WRONG, report back WITHOUT making changes

═══════════════════════════════════════════════════════════════════
CONSTRAINTS
═══════════════════════════════════════════════════════════════════

- Only modify the files listed above
- Do NOT refactor unrelated code
- Do NOT add new features
- Do NOT fix other issues you notice (report them instead)
- Do NOT run tests - main agent handles verification

═══════════════════════════════════════════════════════════════════
REPORT BACK WITH
═══════════════════════════════════════════════════════════════════

1. Fix applied: yes | no | partial
2. Files modified:
   - [file]: [brief description of change]
3. Confidence level: high | medium | low
4. If root cause analysis was incorrect:
   - What you found instead
   - Recommended fix approach
5. Blockers (if any):
   - [blocker description]
6. Other issues noticed (for main agent to triage):
   - [issue description]
7. Other failures this fix might resolve:
   - [failure IDs]
```

---

## STEP 6: Run Verification Tests DIRECTLY (Main Agent)

After FIX SUBAGENT(s) report back, **run verification tests directly** (not via subagent):

```bash
# Run only the previously failing test files
node ~/.agent-os/hooks/lib/test-monitor.js pnpm vitest run --reporter=./scripts/reporters/vitest-streaming.js [failed-file-1] [failed-file-2]
```

Or for E2E:
```bash
node ~/.agent-os/hooks/lib/test-monitor.js pnpm playwright test --reporter=./scripts/reporters/playwright-streaming.ts [failed-file-1] [failed-file-2]
```

---

## STEP 7: Evaluate and Loop (Main Agent)

### 7a: Compare Results

```
BEFORE: [X] failures
AFTER:  [Y] failures

RESOLVED:
- [failure-001]: ✅ Now passing
- [failure-002]: ✅ Now passing

STILL FAILING:
- [failure-003]: ❌ Still failing (same error)
- [failure-004]: ❌ Still failing (different error - regression?)

NEW FAILURES:
- [failure-005]: ⚠️ New failure introduced
```

### 7b: Decision Tree

```
IF all failures resolved:
  → Update analysis file with final_status: "resolved"
  → Report success to user
  → Exit

IF some failures still exist:
  → Update analysis with fix attempt history
  → Return to STEP 4 (triage) with updated analysis
  → Ask user: continue fixing | stop

IF new failures introduced:
  → Flag as potential regression
  → Ask user: revert changes | investigate new failures | continue

IF max iterations reached (default: 3):
  → Report current state to user
  → Ask: continue | stop | escalate
```

### 7c: Update Persisted Analysis

After each iteration, update `.agent-os/test-failures/[run-id].json` with fix history.

---

## Common Issues

### "Vitest cannot be imported in CommonJS"
**Cause:** Playwright `testDir` includes unit test files
**Fix:** Edit `playwright.config.ts`:
```typescript
testDir: './tests/e2e',  // NOT './tests'
```

### No per-test output (just final summary)
**Cause:** Not using streaming reporter
**Fix:** Use the EXACT commands with `--reporter=./scripts/reporters/...`

### "idle warnings" during Playwright
**Cause:** Default reporter doesn't emit per-test events
**Fix:** Must use `--reporter=./scripts/reporters/playwright-streaming.ts`

---

## CRITICAL RULES

1. **You RUN TESTS DIRECTLY** - User sees real-time streaming output
2. **You DELEGATE FIXES to subagents** - They don't need output visibility
3. **NEVER run tests without the streaming reporter**
4. **NEVER run E2E tests without checking servers first**
5. **ALWAYS use the test-monitor wrapper**
6. **ALWAYS wait for user to specify test type**
7. **ALWAYS persist analysis to `.agent-os/test-failures/`**
8. **If you don't see `[AGENT-OS-TEST]` output, the reporter is broken - fix it before continuing**
9. **Fix decisions are informed by analysis, not blind attempts**
