# Test Execution Protocol (Shared Reference)

**Version**: 1.0.0  
**Agent OS**: v4.2.0  
**Purpose**: Shared test execution protocol used by orchestrated workflows and standalone test commands

---

## Invocation Context

This protocol is used by:
- `@instructions/core/execute-tasks.md` - Step 2.1 RED phase validation
- `@.claude/commands/e2e.md` - Unified E2E testing command

---

## Core Principle

**Main agent runs tests DIRECTLY for real-time output visibility.**
**Only FIXES are delegated to subagents.**

Why? Subagents don't stream intermediate output - users would see nothing for 5+ minutes.

---

## 1. Server Pre-Flight Check (E2E/Integration Only)

Before running E2E or integration tests, check if production server is running:

```bash
curl -sf --max-time 2 http://localhost:3000 && echo "Server: OK" || echo "Server: DOWN"
```

**If server is down - Start Production Server Autonomously:**

E2E tests MUST run against a production server (10-50x faster than dev server).

```bash
# 1. Kill any existing servers (avoid port conflicts)
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# 2. Detect framework and build
if [ -f "next.config.js" ] || [ -f "next.config.ts" ] || [ -f "next.config.mjs" ]; then
  npm run build && npm run start > /tmp/prod-server.log 2>&1 &
elif [ -f "vite.config.ts" ] || [ -f "vite.config.js" ]; then
  npm run build && npm run preview > /tmp/prod-server.log 2>&1 &
else
  npm run build && npm run start > /tmp/prod-server.log 2>&1 &
fi
echo $! > /tmp/prod-server.pid

# 3. Wait for ready (max 60s)
for i in {1..60}; do
  curl -sf http://localhost:3000 > /dev/null 2>&1 && break
  sleep 1
done

# 4. Verify
curl -sf http://localhost:3000 && echo "Production server ready" || { echo "ERROR: Server failed to start"; exit 1; }
```

**CRITICAL RULES:**
- **DO NOT ask user to start the server** - Start it yourself
- **DO NOT use dev server** (npm run dev) - Always use production build
- Production server is 10-50x faster for E2E tests

---

## 2. Run Tests with Streaming Reporter

### 2.1 Unit Tests (Vitest)

**EXACT command:**
```bash
node ~/.agent-os/hooks/lib/test-monitor.js pnpm vitest run --reporter=./scripts/reporters/vitest-streaming.js
```

### 2.2 E2E Tests (Playwright)

**EXACT command:**
```bash
node ~/.agent-os/hooks/lib/test-monitor.js pnpm playwright test --reporter=./scripts/reporters/playwright-streaming.ts
```

### 2.3 Specific Files

```bash
node ~/.agent-os/hooks/lib/test-monitor.js pnpm vitest run --reporter=./scripts/reporters/vitest-streaming.js [file1] [file2]
```

---

## 3. Validate Output Format

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

## 4. Failure Classification

When tests fail, classify each failure:

| Classification | Indicators | Fix Location |
|----------------|------------|--------------|
| `assertion` | Expected vs actual mismatch | Test or implementation |
| `timeout` | Test exceeded time limit | Async handling, server |
| `environment` | Missing server, env var, dependency | Environment setup |
| `syntax` | Parse/compile error | Code fix |
| `runtime` | Uncaught exception | Implementation |

### Classification Guide:

**Assertion Failure:**
- "Expected X but got Y"
- "toEqual", "toBe" mismatches
- Fix in test OR implementation

**Timeout Failure:**
- "Test exceeded timeout"
- "waitForSelector timed out"
- Check async/await, server health

**Environment Failure:**
- "Cannot connect to server"
- "ECONNREFUSED"
- "Missing environment variable"
- Start servers, set env vars

**Syntax Error:**
- "SyntaxError"
- "Unexpected token"
- Fix code syntax

**Runtime Error:**
- "TypeError", "ReferenceError"
- Uncaught exceptions
- Fix implementation

---

## 5. Failure Handling Decision Tree

```
IF all tests pass:
  → Report success
  → Exit

IF failures detected:
  → Classify each failure
  → Group by root cause
  → Present analysis to user/orchestrator
  
  BLOCKING FAILURES (cannot proceed):
    - NO_TESTS_FOUND: No tests created
    
  FIXABLE FAILURES (can attempt fix):
    - SYNTAX_ERRORS: Delegate fix, max 2 retries
    - INVALID_FAILURES: Delegate fix, max 2 retries
    - TESTS_PASSED_PREMATURELY: Investigate, may need revision
```

---

## 6. Fix Delegation (When Applicable)

When delegating fixes to a subagent:

```
DELEGATE to test-architect/implementation-specialist:

1. Provide specific failure details:
   - Test name
   - File path:line
   - Error message
   - Classification

2. Provide specific fix instructions based on classification

3. Constraints:
   - Only modify specified files
   - Do NOT refactor unrelated code
   - Do NOT run tests (main agent verifies)
   - Report changes + confidence level

4. After fix, re-run verification from Step 2
```

---

## 7. Analysis Persistence

Save test failure analysis to: `.agent-os/test-failures/[run-id].json`

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
      "classification": "[type]",
      "root_cause": "[hypothesis]",
      "fix_location": "[test|implementation|environment]",
      "status": "pending"
    }
  ],
  "fix_iterations": [],
  "final_status": "in_progress"
}
```

---

## Related Files

| File | Relationship |
|------|--------------|
| `@standards/testing-standards.md` | Canonical testing values |
| `@instructions/core/execute-tasks.md` | Orchestration flow |
| `@.claude/commands/e2e.md` | Unified E2E testing command |
| `@instructions/agents/test-runner.md` | Test execution agent guidance |

---

## Change Log

### v1.0.0 (v4.2.0)
- Initial shared protocol extracted from run-tests.md (now e2e.md)
- Consolidates test execution steps for reuse
