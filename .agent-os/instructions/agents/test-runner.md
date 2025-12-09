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

| Approach | User Experience | Use? |
|----------|-----------------|------|
| Main agent runs tests | User sees real-time streaming output | ✅ YES |
| Subagent runs tests | User sees nothing for 5+ minutes | ❌ NO |

**What Gets Delegated:**
- Running tests: **DIRECT** (main agent) - real-time visibility needed
- Fixing failures: **DELEGATED** (subagent) - no real-time output needed

**Canonical Reference**: `~/.agent-os/.claude/commands/run-tests.md`

## Step 1: Determine Test Type

Confirm type: `unit` | `e2e` | `integration` | `specific`

## Step 2: Server Pre-Flight (E2E/Integration ONLY)

**MANDATORY before E2E or integration tests:**

```bash
curl -sf --max-time 2 http://localhost:3000 && echo "Frontend: OK" || echo "Frontend: DOWN"
curl -sf --max-time 2 http://localhost:3001 && echo "Backend: OK" || echo "Backend: DOWN"
```

**Output:**
```
═══════════════════════════════════════════════════════════════════
SERVER PRE-FLIGHT CHECK
═══════════════════════════════════════════════════════════════════
Frontend (localhost:3000):  ✅ Running | ❌ Not Running
Backend (localhost:3001):   ✅ Running | ❌ Not Running
═══════════════════════════════════════════════════════════════════
```

**If ANY server is down:**
1. **STOP** - Do NOT proceed
2. Tell user which servers are down
3. Ask user to start servers
4. **NEVER auto-start servers** (port conflicts)

## Step 3: Execute Tests with Streaming Reporter

### Exact Commands (DO NOT MODIFY)

| Framework | Command |
|-----------|---------|
| **Vitest** | `node ~/.agent-os/hooks/lib/test-monitor.js pnpm vitest run --reporter=./scripts/reporters/vitest-streaming.js` |
| **Vitest (specific)** | `node ~/.agent-os/hooks/lib/test-monitor.js pnpm vitest run --reporter=./scripts/reporters/vitest-streaming.js path/to/test.test.ts` |
| **Jest** | `node ~/.agent-os/hooks/lib/test-monitor.js pnpm jest --ci --reporters=default` |
| **Playwright** | `node ~/.agent-os/hooks/lib/test-monitor.js pnpm playwright test --reporter=./scripts/reporters/playwright-streaming.ts` |
| **Playwright (specific)** | `node ~/.agent-os/hooks/lib/test-monitor.js pnpm playwright test --reporter=./scripts/reporters/playwright-streaming.ts path/to/test.spec.ts` |
| **Cypress** | `node ~/.agent-os/hooks/lib/test-monitor.js pnpm cypress run` |
| **Pytest** | `pytest -v --tb=short` |

## Step 4: Validate Output Format

**MUST see `[AGENT-OS-TEST]` markers:**

```
{"type":"run_start",...}
[AGENT-OS-TEST] ◉ Collected X test file(s)
[AGENT-OS-TEST] ▶ test name starting
[AGENT-OS-TEST] ✓ test name (Xms)
{"type":"test_end","status":"passed",...}
[AGENT-OS-TEST] ✓ Summary: X/Y passed
```

**If NO `[AGENT-OS-TEST]` markers:**
1. **STOP** - Reporter not working
2. Check reporters exist:
   ```bash
   ls -la scripts/reporters/vitest-streaming.js
   ls -la scripts/reporters/playwright-streaming.ts
   ```
3. Install if missing: `~/.agent-os/setup/install-test-monitoring.sh --target .`
4. Retry test command

## Step 5: Handle Hung Tests

Monitor wrapper auto-detects hung tests.

**Timeouts (env vars):**
- `AGENT_OS_TEST_TIMEOUT` - Per-test (default: 30000ms)
- `AGENT_OS_IDLE_TIMEOUT` - Idle detection (default: 15000ms)
- `AGENT_OS_ON_HUNG` - Action: `alert` | `kill` | `skip` (default: alert)

## FORBIDDEN: Watch Mode

**NEVER use watch mode. Tests MUST exit cleanly.**

| Framework | ❌ Forbidden | ✅ Correct |
|-----------|-------------|-----------|
| Vitest | `vitest` | `vitest run` |
| Jest | `jest --watch` | `jest --ci` |
| Playwright | `playwright test --ui` | `playwright test` |

## Failure Classification

| Type | Indicators | Fix Location |
|------|------------|--------------|
| `assertion` | Expected vs actual mismatch | Test or implementation |
| `timeout` | Test exceeded time limit | Async handling, server |
| `environment` | Missing server, env var, dep | Environment setup |
| `syntax` | Parse/compile error | Code fix |
| `runtime` | Uncaught exception | Implementation |

## Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| "Vitest cannot be imported in CommonJS" | Playwright `testDir` includes unit tests | Edit `playwright.config.ts`: `testDir: './tests/e2e'` (NOT `'./tests'`) |
| No per-test output | Not using streaming reporter | Use EXACT commands with `--reporter=./scripts/reporters/...` |
| Idle warnings during Playwright | Default reporter doesn't emit per-test events | Must use `--reporter=./scripts/reporters/playwright-streaming.ts` |
| Tests hang indefinitely | Watch mode or missing `run` | Use `vitest run` not `vitest`, ensure test-monitor.js wrapper |

## Protocol Compliance Checklist

- [ ] Test monitor wrapper used (`node ~/.agent-os/hooks/lib/test-monitor.js`)
- [ ] Streaming reporter used (`--reporter=./scripts/reporters/...`)
- [ ] `[AGENT-OS-TEST]` markers visible in output
- [ ] Server pre-flight completed (for E2E tests)
- [ ] Watch mode prevented (tests exited cleanly)
- [ ] All failures classified
- [ ] Stack traces captured for failures

## Quick Reference

```bash
# Unit (Vitest)
node ~/.agent-os/hooks/lib/test-monitor.js pnpm vitest run --reporter=./scripts/reporters/vitest-streaming.js

# Unit (Jest)
node ~/.agent-os/hooks/lib/test-monitor.js pnpm jest --ci

# E2E (Playwright) - After pre-flight
node ~/.agent-os/hooks/lib/test-monitor.js pnpm playwright test --reporter=./scripts/reporters/playwright-streaming.ts

# E2E (Cypress)
node ~/.agent-os/hooks/lib/test-monitor.js pnpm cypress run

# Install missing reporters
~/.agent-os/setup/install-test-monitoring.sh --target .
```

**Remember: If you don't see `[AGENT-OS-TEST]` markers, STOP and fix the reporter first.**
