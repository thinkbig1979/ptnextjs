---
# EXECUTION ROLE DEFINITION
# This file provides guidance for the test execution workflow phase.
# It is NOT a callable Claude Code agent.
#
# Usage: The main agent references this file when running tests directly.
# Tests are run by the MAIN AGENT (not subagents) for real-time output visibility.

role: test-runner
description: "Test execution protocol reference - for DIRECT execution by main agent"
phase: test_execution
context_window: 6144
specialization: ["unit tests", "integration tests", "E2E tests", "result analysis", "verification reporting"]
version: 3.1
encoding: UTF-8
---

# Test Runner Protocol Reference

## CRITICAL: Direct Execution Model (v4.0.1+)

**Tests MUST be run DIRECTLY by the main agent**, not delegated to subagents.

### Why Direct Execution?

| Approach | User Experience | Recommendation |
|----------|-----------------|----------------|
| Main agent runs tests | User sees real-time streaming output | ✅ USE THIS |
| Subagent runs tests | User sees nothing for 5+ minutes | ❌ NEVER DO THIS |

**The streaming reporters (`[AGENT-OS-TEST]` markers) are designed for real-time visibility.**
Delegating to a subagent defeats this purpose since Task tool doesn't stream intermediate output.

### What Gets Delegated?

| Action | Execution Model | Reason |
|--------|-----------------|--------|
| Running tests | DIRECT (main agent) | User needs real-time visibility |
| Fixing failures | DELEGATED (subagent) | No real-time output needed |

### Canonical Reference

The authoritative protocol is in: `~/.agent-os/.claude/commands/run-tests.md`

---

## Test Execution Protocol

### Step 1: Determine Test Type

Before running tests, confirm which type:
- **unit** - Unit tests (Vitest/Jest)
- **e2e** - E2E tests (Playwright/Cypress)
- **integration** - Integration tests
- **specific** - Specific test files

### Step 2: Server Pre-Flight Check (E2E/Integration ONLY)

**MANDATORY before ANY E2E or integration tests:**

```bash
curl -sf --max-time 2 http://localhost:3000 && echo "Frontend: OK" || echo "Frontend: DOWN"
curl -sf --max-time 2 http://localhost:3001 && echo "Backend: OK" || echo "Backend: DOWN"
```

**Output format:**
```
═══════════════════════════════════════════════════════════════════
SERVER PRE-FLIGHT CHECK
═══════════════════════════════════════════════════════════════════
Frontend (localhost:3000):  ✅ Running | ❌ Not Running
Backend (localhost:3001):   ✅ Running | ❌ Not Running
═══════════════════════════════════════════════════════════════════
```

**IF ANY server is down:**
1. **STOP** - Do NOT proceed with tests
2. Tell user which servers are down
3. Ask user to start servers
4. **NEVER auto-start servers** (causes port conflicts)

**IF all servers running:**
- Proceed to test execution

### Step 3: Execute Tests with Streaming Reporter

#### Unit Tests (Vitest)

**EXACT command - do not modify:**
```bash
node ~/.agent-os/hooks/lib/test-monitor.js pnpm vitest run --reporter=./scripts/reporters/vitest-streaming.js
```

**For specific files:**
```bash
node ~/.agent-os/hooks/lib/test-monitor.js pnpm vitest run --reporter=./scripts/reporters/vitest-streaming.js path/to/test.test.ts
```

#### Unit Tests (Jest)

**EXACT command:**
```bash
node ~/.agent-os/hooks/lib/test-monitor.js pnpm jest --ci --reporters=default
```

#### E2E Tests (Playwright)

**EXACT command - do not modify:**
```bash
node ~/.agent-os/hooks/lib/test-monitor.js pnpm playwright test --reporter=./scripts/reporters/playwright-streaming.ts
```

**For specific files:**
```bash
node ~/.agent-os/hooks/lib/test-monitor.js pnpm playwright test --reporter=./scripts/reporters/playwright-streaming.ts path/to/test.spec.ts
```

#### E2E Tests (Cypress)

**EXACT command:**
```bash
node ~/.agent-os/hooks/lib/test-monitor.js pnpm cypress run
```

#### Python Tests (Pytest)

**EXACT command:**
```bash
pytest -v --tb=short
```

### Step 4: Validate Output Format

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
1. **STOP** - The streaming reporter is NOT working
2. Check if reporters exist:
   ```bash
   ls -la scripts/reporters/vitest-streaming.js
   ls -la scripts/reporters/playwright-streaming.ts
   ```
3. If missing, install them:
   ```bash
   ~/.agent-os/setup/install-test-monitoring.sh --target .
   ```
4. Retry the test command

### Step 5: Handle Hung Tests

The `test-monitor.js` wrapper automatically detects hung tests:

**Timeouts (configurable via environment):**
- `AGENT_OS_TEST_TIMEOUT` - Per-test timeout (default: 30000ms)
- `AGENT_OS_IDLE_TIMEOUT` - Idle detection (default: 15000ms)
- `AGENT_OS_ON_HUNG` - Action: `alert` | `kill` | `skip` (default: alert)

**If hung test detected:**
- Monitor will log warning with test name and duration
- Action taken depends on `AGENT_OS_ON_HUNG` setting

---

## FORBIDDEN: Watch Mode

**NEVER use watch mode. Tests MUST exit cleanly.**

| Framework | Forbidden | Correct |
|-----------|-----------|---------|
| Vitest | `vitest` (default is watch) | `vitest run` |
| Jest | `jest --watch` | `jest --ci` |
| Playwright | `playwright test --ui` | `playwright test` |

**If you see a command without `run` for Vitest, ADD IT.**

---

## Failure Classification

When tests fail, classify each failure:

| Classification | Indicators | Typical Fix Location |
|---------------|------------|---------------------|
| `assertion` | Expected vs actual mismatch | Test or implementation |
| `timeout` | Test exceeded time limit | Async handling, server |
| `environment` | Missing server, env var, dep | Environment setup |
| `syntax` | Parse/compile error | Code fix |
| `runtime` | Uncaught exception | Implementation |

---

## Common Issues and Fixes

### "Vitest cannot be imported in CommonJS"

**Cause:** Playwright `testDir` includes unit test files

**Fix:** Edit `playwright.config.ts`:
```typescript
testDir: './tests/e2e',  // NOT './tests'
```

### No per-test output (just final summary)

**Cause:** Not using streaming reporter

**Fix:** Use EXACT commands with `--reporter=./scripts/reporters/...`

### "idle warnings" during Playwright

**Cause:** Default reporter doesn't emit per-test events

**Fix:** Must use `--reporter=./scripts/reporters/playwright-streaming.ts`

### Tests hang indefinitely

**Cause:** Watch mode enabled or missing `run` flag

**Fix:** 
- Vitest: Use `vitest run` not `vitest`
- Ensure test-monitor.js wrapper is used

---

## Protocol Compliance Checklist

Before considering test execution complete, verify:

- [ ] Test monitor wrapper used (`node ~/.agent-os/hooks/lib/test-monitor.js`)
- [ ] Streaming reporter used (`--reporter=./scripts/reporters/...`)
- [ ] `[AGENT-OS-TEST]` markers visible in output
- [ ] Server pre-flight completed (for E2E tests)
- [ ] Watch mode prevented (tests exited cleanly)
- [ ] All failures classified
- [ ] Stack traces captured for failures

---

## Quick Reference: Exact Commands

```bash
# Unit tests (Vitest)
node ~/.agent-os/hooks/lib/test-monitor.js pnpm vitest run --reporter=./scripts/reporters/vitest-streaming.js

# Unit tests (Jest)
node ~/.agent-os/hooks/lib/test-monitor.js pnpm jest --ci

# E2E tests (Playwright) - After server pre-flight
node ~/.agent-os/hooks/lib/test-monitor.js pnpm playwright test --reporter=./scripts/reporters/playwright-streaming.ts

# E2E tests (Cypress)
node ~/.agent-os/hooks/lib/test-monitor.js pnpm cypress run

# Install missing reporters
~/.agent-os/setup/install-test-monitoring.sh --target .
```

**Remember: If you don't see `[AGENT-OS-TEST]` markers, STOP and fix the reporter first.**
