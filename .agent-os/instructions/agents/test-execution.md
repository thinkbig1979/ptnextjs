---
role: test-execution
description: "Test execution protocol - for DIRECT execution by main agent"
phase: test_execution
context_window: 6144
specialization: ["unit tests", "integration tests", "E2E tests", "result analysis"]
version: 5.2.0
encoding: UTF-8
---

# Test Execution Protocol

## CRITICAL: Direct Execution Model

**Tests MUST be run DIRECTLY by the main agent**, not delegated to subagents.

| Approach | User Experience | Use? |
|----------|-----------------|------|
| Main agent runs tests | User sees real-time streaming output | YES |
| Subagent runs tests | User sees nothing for 5+ minutes | NO |

**What Gets Delegated:**
- Running tests: **DIRECT** (main agent) - real-time visibility needed
- Fixing failures: **DELEGATED** (subagent) - no real-time output needed

---

## Step 1: Determine Test Type

Confirm type: `unit` | `e2e` | `integration` | `specific`

---

## Step 2: E2E Pre-Flight (E2E/Integration ONLY)

**MANDATORY before E2E or integration tests.**

### 2.1: Playwright Config Compliance

**Check and FIX non-compliant configurations BEFORE running tests.**

| Violation | What to Look For | Required Fix |
|-----------|------------------|--------------|
| webServer exists | `webServer: { command: ... }` | **REMOVE entire block** |
| Unlimited workers | `workers: undefined` or high number | Change to `process.env.CI ? 4 : 3` |
| Wrong testDir | `testDir: './tests'` | Change to `'./tests/e2e'` |

### 2.2: Start All Required Servers

**Order: Database/Docker → Backend → Frontend**

```bash
mkdir -p .agent-os/e2e-repair

# === FRONTEND (PRODUCTION) ===
PROD_PORT=3000
lsof -ti:${PROD_PORT} | xargs kill -9 2>/dev/null || true

# Build (REQUIRED)
npm run build
if [ $? -ne 0 ]; then
  echo "ERROR: Build failed"
  exit 1
fi

# Start production server
npm run start > .agent-os/e2e-repair/frontend.log 2>&1 &
echo $! > .agent-os/e2e-repair/frontend.pid

# Wait for ready
for i in {1..60}; do
  curl -sf http://localhost:${PROD_PORT} > /dev/null 2>&1 && break
  sleep 1
done

export BASE_URL="http://localhost:${PROD_PORT}"
```

### 2.3: Pre-Flight Checklist

```
SERVER PRE-FLIGHT COMPLETE
===========================
Frontend (3000):  Production - Running
Backend (3001):   Running (if applicable)
BASE_URL:         http://localhost:3000
```

**CRITICAL RULES:**
- **DO NOT ask user to start servers** - Start them yourself
- **DO NOT use dev server** (npm run dev) - Always production
- **DO NOT proceed if build fails** - Fix build first
- **ALWAYS rebuild after app code changes**

---

## Step 3: Execute Tests

### Exact Commands (DO NOT MODIFY)

| Framework | Command |
|-----------|---------|
| **Vitest** | `node ~/.agent-os/hooks/lib/test-monitor.js pnpm vitest run --reporter=./scripts/reporters/vitest-streaming.js` |
| **Playwright** | `node ~/.agent-os/hooks/lib/test-monitor.js pnpm playwright test --reporter=./scripts/reporters/playwright-streaming.ts` |
| **Jest** | `node ~/.agent-os/hooks/lib/test-monitor.js pnpm jest --ci --reporters=default` |
| **Pytest** | `pytest -v --tb=short` |

**For E2E tests, ensure BASE_URL is set:**
```bash
export BASE_URL="http://localhost:3000"
node ~/.agent-os/hooks/lib/test-monitor.js pnpm playwright test --reporter=./scripts/reporters/playwright-streaming.ts
```

---

## Step 4: Validate Output

**MUST see `[AGENT-OS-TEST]` markers:**

```
[AGENT-OS-TEST] Collected X test file(s)
[AGENT-OS-TEST] test name starting
[AGENT-OS-TEST] test name (Xms)
[AGENT-OS-TEST] Summary: X/Y passed
```

**If NO markers:**
1. Check reporters exist: `ls -la scripts/reporters/`
2. Install if missing: `~/.agent-os/setup/install-test-monitoring.sh --target .`
3. Retry test command

---

## Step 5: After App Code Changes - REBUILD

```bash
kill $(cat .agent-os/e2e-repair/frontend.pid) 2>/dev/null || true
npm run build
npm run start > .agent-os/e2e-repair/frontend.log 2>&1 &
echo $! > .agent-os/e2e-repair/frontend.pid
until curl -sf http://localhost:${PROD_PORT}; do sleep 1; done
```

---

## Step 6: Cleanup

```bash
if [ -f ".agent-os/e2e-repair/frontend.pid" ]; then
  kill $(cat .agent-os/e2e-repair/frontend.pid) 2>/dev/null || true
  rm .agent-os/e2e-repair/frontend.pid
fi
```

---

## FORBIDDEN: Watch Mode

| Framework | FORBIDDEN | Correct |
|-----------|-----------|---------|
| Vitest | `vitest` | `vitest run` |
| Jest | `jest --watch` | `jest --ci` |
| Playwright | `playwright test --ui` | `playwright test` |

---

## Failure Classification

| Type | Indicators | Fix Location |
|------|------------|--------------|
| `assertion` | Expected vs actual mismatch | Test or implementation |
| `timeout` | Test exceeded time limit | Async handling, server |
| `environment` | Missing server, env var | Environment setup |
| `syntax` | Parse/compile error | Code fix |

---

## Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| "Vitest cannot be imported in CommonJS" | Playwright `testDir` includes unit tests | `testDir: './tests/e2e'` |
| Tests use dev server | webServer in config | Remove webServer block |
| No per-test output | Not using streaming reporter | Use `--reporter=./scripts/reporters/...` |
| Tests fail after app changes | Didn't rebuild | Run `npm run build` |

---

## Quick Reference

```bash
# === PRE-FLIGHT (E2E) ===
npm run build
npm run start &
export BASE_URL=http://localhost:3000

# === RUN TESTS ===
# Unit
node ~/.agent-os/hooks/lib/test-monitor.js pnpm vitest run --reporter=./scripts/reporters/vitest-streaming.js

# E2E
node ~/.agent-os/hooks/lib/test-monitor.js pnpm playwright test --reporter=./scripts/reporters/playwright-streaming.ts

# === CLEANUP ===
kill $(cat .agent-os/e2e-repair/frontend.pid)
```
