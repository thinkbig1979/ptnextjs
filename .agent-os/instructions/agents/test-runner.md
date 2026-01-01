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
version: 4.0
encoding: UTF-8
---

# Test Runner Protocol Reference

## CRITICAL: Direct Execution Model (v4.0+)

**Tests MUST be run DIRECTLY by the main agent**, not delegated to subagents.

| Approach | User Experience | Use? |
|----------|-----------------|------|
| Main agent runs tests | User sees real-time streaming output | YES |
| Subagent runs tests | User sees nothing for 5+ minutes | NO |

**What Gets Delegated:**
- Running tests: **DIRECT** (main agent) - real-time visibility needed
- Fixing failures: **DELEGATED** (subagent) - no real-time output needed

**Canonical Reference**: `~/.agent-os/.claude/commands/run-tests.md`

---

## Step 1: Determine Test Type

Confirm type: `unit` | `e2e` | `integration` | `specific`

---

## Step 2: E2E Pre-Flight (E2E/Integration ONLY)

**MANDATORY before E2E or integration tests.**

### 2.1: Enforce Playwright Config Compliance

**Check and FIX non-compliant configurations BEFORE running tests.**

```bash
# Find playwright config
PLAYWRIGHT_CONFIG=$(ls playwright.config.ts playwright.config.js 2>/dev/null | head -1)
```

**Read the config and check for violations:**

| Violation | What to Look For | Required Fix |
|-----------|------------------|--------------|
| webServer exists | `webServer: { command: ... }` | **REMOVE entire block** |
| Unlimited workers | `workers: undefined` or high number | Change to `process.env.CI ? 4 : 3` |
| Hardcoded baseURL | `baseURL: 'http://localhost:3000'` | Change to `process.env.BASE_URL \|\| 'http://localhost:3000'` |
| Wrong testDir | `testDir: './tests'` | Change to `'./tests/e2e'` |

**If violations found, EDIT the config file to fix them:**

```typescript
// REQUIRED playwright.config.ts structure:
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',  // NOT './tests'
  timeout: 30000,
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  
  workers: process.env.CI ? 4 : 3,
  
  // NO webServer - we manage servers ourselves
  // webServer: undefined,
});
```

**Log changes made:**
```
CONFIG ENFORCEMENT:
  - Removed webServer block
  - Changed workers to limited (3)
  - Updated baseURL to use environment
```

### 2.2: Detect Project Server Configuration

**Read package.json to find correct commands:**

```bash
cat package.json | jq '.scripts'
```

**Determine server commands:**

| Framework | Build Command | Start Command | Port |
|-----------|---------------|---------------|------|
| Next.js | `npm run build` | `npm run start` | 3000 |
| Vite | `npm run build` | `npm run preview` | 4173 |
| Angular | `npm run build --prod` | `npx serve -s dist` | 3000 |
| Other | `npm run build` | `npm run start` | 3000 |

**Check for additional servers:**

```bash
# Separate backend?
ls -d backend/ server/ api/ 2>/dev/null

# Docker services?
ls docker-compose*.yml 2>/dev/null

# Database required?
grep -l "DATABASE_URL" .env* 2>/dev/null
```

### 2.3: Start All Required Servers

**Order: Database/Docker → Backend → Frontend**

```bash
mkdir -p .agent-os/e2e-repair

# === DATABASE/DOCKER ===
if [ -f "docker-compose.yml" ]; then
  echo "Starting Docker services..."
  docker-compose up -d
  sleep 5  # Wait for database
  
  # Seed if available
  npm run db:seed 2>/dev/null || npm run seed 2>/dev/null || true
fi

# === BACKEND (if separate) ===
if [ -d "backend" ] || [ -d "server" ] || [ -d "api" ]; then
  echo "Starting backend..."
  BACKEND_DIR=$(ls -d backend server api 2>/dev/null | head -1)
  BACKEND_PORT=3001
  
  lsof -ti:${BACKEND_PORT} | xargs kill -9 2>/dev/null || true
  
  cd ${BACKEND_DIR}
  npm run build 2>/dev/null || true
  npm run start > ../.agent-os/e2e-repair/backend.log 2>&1 &
  echo $! > ../.agent-os/e2e-repair/backend.pid
  cd ..
  
  # Wait for backend
  for i in {1..30}; do
    curl -sf http://localhost:${BACKEND_PORT}/health > /dev/null 2>&1 && break
    sleep 1
  done
fi

# === FRONTEND (PRODUCTION) ===
echo "Building production frontend..."
PROD_PORT=3000

# Kill existing
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

# Verify
curl -sf http://localhost:${PROD_PORT} > /dev/null 2>&1 \
  || { echo "ERROR: Server failed to start"; exit 1; }

# Clear rate limits
curl -X POST http://localhost:${PROD_PORT}/api/test/rate-limit/clear 2>/dev/null || true

# Set environment
export BASE_URL="http://localhost:${PROD_PORT}"
echo "BASE_URL=${BASE_URL}"
```

### 2.4: Verify All Servers

```
SERVER PRE-FLIGHT COMPLETE
===========================
Frontend (3000):  Production - Running
Backend (3001):   Running (if applicable)
Docker:           Running (if applicable)
BASE_URL:         http://localhost:3000
```

**CRITICAL RULES:**
- **DO NOT ask user to start servers** - Start them yourself
- **DO NOT use dev server** (npm run dev) - Always production
- **DO NOT proceed if build fails** - Fix build first
- **ALWAYS rebuild after app code changes**

---

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

**For E2E tests, ensure BASE_URL is set:**
```bash
export BASE_URL="http://localhost:3000"
node ~/.agent-os/hooks/lib/test-monitor.js pnpm playwright test --reporter=./scripts/reporters/playwright-streaming.ts
```

---

## Step 4: Validate Output Format

**MUST see `[AGENT-OS-TEST]` markers:**

```
{"type":"run_start",...}
[AGENT-OS-TEST] Collected X test file(s)
[AGENT-OS-TEST] test name starting
[AGENT-OS-TEST] test name (Xms)
{"type":"test_end","status":"passed",...}
[AGENT-OS-TEST] Summary: X/Y passed
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

---

## Step 5: Handle Hung Tests

Monitor wrapper auto-detects hung tests.

**Timeouts (env vars):**
- `AGENT_OS_TEST_TIMEOUT` - Per-test (default: 30000ms)
- `AGENT_OS_IDLE_TIMEOUT` - Idle detection (default: 15000ms)
- `AGENT_OS_ON_HUNG` - Action: `alert` | `kill` | `skip` (default: alert)

---

## Step 6: After App Code Changes - REBUILD

**If you modify application code (not just tests), you MUST rebuild:**

```bash
# Kill current server
kill $(cat .agent-os/e2e-repair/frontend.pid) 2>/dev/null || true

# Rebuild
npm run build

# Restart
npm run start > .agent-os/e2e-repair/frontend.log 2>&1 &
echo $! > .agent-os/e2e-repair/frontend.pid

# Wait
until curl -sf http://localhost:${PROD_PORT}; do sleep 1; done
echo "Server rebuilt and ready"
```

---

## Step 7: Cleanup (After All Tests)

```bash
# Stop frontend
if [ -f ".agent-os/e2e-repair/frontend.pid" ]; then
  kill $(cat .agent-os/e2e-repair/frontend.pid) 2>/dev/null || true
  rm .agent-os/e2e-repair/frontend.pid
fi

# Stop backend
if [ -f ".agent-os/e2e-repair/backend.pid" ]; then
  kill $(cat .agent-os/e2e-repair/backend.pid) 2>/dev/null || true
  rm .agent-os/e2e-repair/backend.pid
fi

# Docker (optional - may want to keep)
# docker-compose down

echo "Servers stopped."
```

---

## FORBIDDEN: Watch Mode

**NEVER use watch mode. Tests MUST exit cleanly.**

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
| `environment` | Missing server, env var, dep | Environment setup |
| `syntax` | Parse/compile error | Code fix |
| `runtime` | Uncaught exception | Implementation |

---

## Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| "Vitest cannot be imported in CommonJS" | Playwright `testDir` includes unit tests | Edit `playwright.config.ts`: `testDir: './tests/e2e'` |
| Tests use dev server | webServer config in playwright.config.ts | Remove webServer block, use pre-flight |
| Unlimited parallelism | workers not set | Set `workers: process.env.CI ? 4 : 3` |
| No per-test output | Not using streaming reporter | Use `--reporter=./scripts/reporters/...` |
| Tests fail after app changes | Didn't rebuild | Run `npm run build` before re-testing |

---

## Protocol Compliance Checklist

- [ ] Playwright config enforced (no webServer, limited workers)
- [ ] All servers started (database, backend, frontend)
- [ ] Production build used (not dev server)
- [ ] BASE_URL environment variable set
- [ ] Test monitor wrapper used
- [ ] Streaming reporter used
- [ ] `[AGENT-OS-TEST]` markers visible
- [ ] Rebuilt after any app code changes
- [ ] Servers stopped after completion

---

## Quick Reference

```bash
# === PRE-FLIGHT (E2E) ===
# 1. Check/fix playwright.config.ts (remove webServer, limit workers)
# 2. Start docker: docker-compose up -d
# 3. Start backend: cd backend && npm start &
# 4. Build frontend: npm run build
# 5. Start frontend: npm run start &
# 6. Export: BASE_URL=http://localhost:3000

# === RUN TESTS ===
# Unit (Vitest)
node ~/.agent-os/hooks/lib/test-monitor.js pnpm vitest run --reporter=./scripts/reporters/vitest-streaming.js

# E2E (Playwright) - after pre-flight
export BASE_URL=http://localhost:3000
node ~/.agent-os/hooks/lib/test-monitor.js pnpm playwright test --reporter=./scripts/reporters/playwright-streaming.ts

# === AFTER APP CHANGES ===
kill $(cat .agent-os/e2e-repair/frontend.pid)
npm run build && npm run start &

# === CLEANUP ===
kill $(cat .agent-os/e2e-repair/frontend.pid)
kill $(cat .agent-os/e2e-repair/backend.pid)
```
