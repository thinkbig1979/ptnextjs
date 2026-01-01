# Test Infrastructure Standards

**Version**: 1.1.0
**Purpose**: Universal standards for reliable, repeatable test infrastructure across all Agent OS projects.

---

## CANONICAL REFERENCE

**For canonical testing values, see: `@standards/testing-standards.md`**

This document provides implementation details and scripts. For authoritative values (timeouts, file locations, pattern hierarchies), always reference the canonical testing-standards.md file.

---

## CRITICAL: Framework Directory Isolation

**This section prevents the "Vitest cannot be imported" error and MUST be verified BEFORE any test work.**

### The Problem

When Playwright's `testDir` includes directories containing Vitest unit tests, Playwright attempts to load those files and fails:
```
Error: Vitest cannot be imported in a CommonJS module using require()
```

### The Solution

**Each test framework MUST have exclusive ownership of its test directory.**

### Mandatory Configuration

**Playwright** (`playwright.config.ts`):
```typescript
export default defineConfig({
  // CRITICAL: Must be './tests/e2e', NEVER './tests'
  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',
});
```

**Vitest** (`vitest.config.ts`):
```typescript
export default defineConfig({
  test: {
    include: [
      'src/**/*.test.{ts,tsx}',
      'tests/unit/**/*.test.{ts,tsx}'
    ],
    // CRITICAL: Exclude E2E and integration directories
    exclude: [
      'tests/e2e/**',
      'tests/integration/**',
      'node_modules/**'
    ],
  },
});
```

### Validation Checklist (MUST verify before test work)

- [ ] Playwright `testDir` is `./tests/e2e` (NOT `./tests`)
- [ ] Vitest `include` excludes E2E directories
- [ ] No Vitest imports (`vi`, `vitest`) in `*.spec.ts` files
- [ ] No Playwright imports (`@playwright/test`) in `*.test.ts` files

**Full details**: See `@standards/testing-standards.md` Section 3.

---

## Overview

This document defines the standards that prevent common testing failures:
- Hung tests that never complete
- Watch mode defaults causing CI failures
- Missing server dependencies
- Test sprawl and debug scripts in test suites
- Inconsistent test organization

**All test-related agents (test-architect, test-runner) MUST follow these standards.**

---

## 1. Test Classification System

### 1.1 Test Types

| Type | Purpose | Speed | Dependencies | Location |
|------|---------|-------|--------------|----------|
| **Unit** | Test isolated functions/components | Fast (<100ms) | None (mocked) | Co-located or `tests/unit/` |
| **Integration** | Test component interactions | Medium (<30s) | Database, APIs | `tests/integration/` |
| **E2E** | Test full user workflows | Slow (<5min) | All servers | `tests/e2e/` |

### 1.2 File Naming Conventions

```
Unit Tests:
  [component].test.ts      # TypeScript/JavaScript
  [component].test.tsx     # React components
  test_[module].py         # Python
  [module]_test.py         # Python alternative
  [module]_spec.rb         # Ruby

Integration Tests:
  [feature].integration.ts
  [feature].int.test.ts
  test_[feature]_integration.py

E2E Tests:
  [workflow].spec.ts       # Playwright convention
  [workflow].e2e.ts
  [workflow].cy.ts         # Cypress convention
```

### 1.3 Directory Structure

```
project/
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   └── Button.test.tsx    # Co-located unit test
│   └── utils/
│       ├── helpers.ts
│       └── helpers.test.ts    # Co-located unit test
├── tests/
│   ├── unit/                  # Alternative unit test location
│   │   └── utils.test.ts
│   ├── integration/           # Integration tests
│   │   └── api.integration.ts
│   └── e2e/                   # E2E tests ONLY
│       ├── user-login.spec.ts
│       └── checkout-flow.spec.ts
├── scripts/
│   └── debug/                 # Debug scripts (NOT tests)
│       └── debug-auth-flow.js
└── tests/_archive/            # Archived old tests
    └── deprecated-feature.test.ts
```

---

## 2. CI-Safe Test Commands

### 2.1 Required Package.json Scripts

Every project MUST have these CI-safe test scripts:

```json
{
  "scripts": {
    "test:unit": "vitest",
    "test:unit:ci": "vitest run --reporter=verbose",

    "test:e2e": "playwright test",
    "test:e2e:ci": "playwright test --reporter=list",

    "test:check-servers": "node scripts/check-test-servers.js",

    "test:all:ci": "npm run test:unit:ci && npm run test:e2e:ci"
  }
}
```

### 2.2 Watch Mode Prevention

| Framework | Default Behavior | CI-Safe Command |
|-----------|-----------------|-----------------|
| **Vitest** | Watch mode (hangs) | `vitest run` |
| **Jest** | Single run (OK) | `jest --ci` |
| **Playwright** | Single run (OK) | `playwright test` |
| **Pytest** | Single run (OK) | `pytest -v` |

**CRITICAL**: Never use `vitest` alone - always use `vitest run` for CI.

### 2.3 Server Health Check Script

Every project with E2E tests MUST have a server check script:

```javascript
// scripts/check-test-servers.js
const http = require('http');

const SERVERS = [
  { name: 'Frontend', url: 'http://localhost:3000' },
  { name: 'Backend', url: 'http://localhost:8000/health' },
  // Add all required servers
];

async function checkServer(server) {
  return new Promise((resolve) => {
    const req = http.get(server.url, { timeout: 2000 }, (res) => {
      resolve({ ...server, status: 'running', code: res.statusCode });
    });
    req.on('error', () => resolve({ ...server, status: 'not_running' }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ ...server, status: 'timeout' });
    });
  });
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('SERVER PRE-FLIGHT CHECK');
  console.log('═══════════════════════════════════════════════════════════════════');

  const results = await Promise.all(SERVERS.map(checkServer));
  let allRunning = true;

  for (const result of results) {
    const icon = result.status === 'running' ? '✅' : '❌';
    console.log(`${icon} ${result.name}: ${result.status}`);
    if (result.status !== 'running') allRunning = false;
  }

  console.log('═══════════════════════════════════════════════════════════════════');

  if (allRunning) {
    console.log('All servers running. Ready for E2E tests.');
    process.exit(0);
  } else {
    console.log('Some servers not running. Start them before running tests.');
    process.exit(1);
  }
}

main();
```

---

## 3. Timeout Configuration

**CANONICAL VALUES**: See `@standards/testing-standards.md` Section 1 for authoritative timeout values.

### 3.1 Required Timeouts by Test Type

| Test Type | Per-Test Timeout | Suite Timeout |
|-----------|-----------------|---------------|
| Unit | 5 seconds | 2 minutes |
| Integration | 30 seconds | 5 minutes |
| E2E | 60 seconds | 10 minutes |

### 3.2 Framework-Specific Configuration

**Vitest (vitest.config.ts)**:
```typescript
export default defineConfig({
  test: {
    testTimeout: 5000,      // 5s per test
    hookTimeout: 10000,     // 10s for setup/teardown
  },
});
```

**Playwright (playwright.config.ts)**:
```typescript
export default defineConfig({
  // CRITICAL: Point to e2e directory ONLY, not parent tests/ folder
  testDir: './tests/e2e',   // NOT './tests' - prevents Vitest file pickup
  timeout: 60000,           // 60s per test
  expect: { timeout: 10000 }, // 10s for assertions
  use: {
    actionTimeout: 15000,   // 15s for actions
    navigationTimeout: 30000, // 30s for navigation
  },
});
```

### 3.3 Framework Test Directory Isolation

**NOTE**: This critical topic is now covered at the TOP of this document and in `@standards/testing-standards.md` Section 3.

See the "CRITICAL: Framework Directory Isolation" section above for mandatory configuration.

**Jest (jest.config.js)**:
```javascript
module.exports = {
  testTimeout: 5000,        // 5s per test
};
```

**Pytest (pytest.ini)**:
```ini
[pytest]
timeout = 30
timeout_method = signal
```

---

## 4. Test Sprawl Prevention

### 4.1 What is Test Sprawl?

Test sprawl occurs when debug scripts, one-off verifications, and orphaned tests accumulate in test directories, causing:
- CI suite bloat (3000+ tests from node_modules)
- Inconsistent pass/fail behavior
- Tests that require manual inspection
- Slow test execution

### 4.2 Test Classification Rules

**TRUE TEST** (belongs in tests/):
- Has assertions that can fail
- Runs without manual intervention
- Produces clear pass/fail exit code
- Tests actual behavior

**DEBUG SCRIPT** (belongs in scripts/debug/):
- Used for manual verification
- Outputs information for human review
- No automated assertions
- Delete after issue resolved

**VERIFICATION UTILITY** (belongs in scripts/dev/):
- Checks system state (not behavior)
- Used during development only
- Named `check-[what].js`

### 4.3 Forbidden Patterns in Test Files

```javascript
// ❌ FORBIDDEN - No real assertions
test('check data', async () => {
  const data = await fetchData();
  console.log(data);  // Just logging, no assertion
});

// ❌ FORBIDDEN - Focused test
test.only('my test', () => {  // Will skip all other tests
  expect(true).toBe(true);
});

// ❌ FORBIDDEN - Always passes
test('verification', () => {
  // No assertions = always passes
});

// ✅ CORRECT - Real assertion
test('fetches user data correctly', async () => {
  const data = await fetchData();
  expect(data.id).toBeDefined();
  expect(data.name).toBe('Test User');
});
```

### 4.4 File Naming Red Flags

These file names suggest debug scripts, NOT tests:
- `*-verification.spec.ts`
- `*-manual-*.spec.ts`
- `check-*.spec.ts`
- `debug-*.spec.ts`
- `evaluate-*.spec.ts`

**Action**: Move to `scripts/debug/` or delete.

---

## 5. Server Management Protocol

### 5.1 Pre-Test Server Verification

Before running E2E or integration tests:

1. **BUILD** production server:
   - Run `npm run build` (or framework equivalent)
   - Block if build fails

2. **START** production server:
   - Kill any existing servers on the port
   - Run `npm run start` in background
   - Wait for server ready (health check)

3. **VERIFY** server is running:
   - HTTP GET to base URL
   - 2-second timeout
   - Report status: ✅ Running | ❌ Not Running

4. **SET** environment:
   - `export BASE_URL="http://localhost:3000"`

5. **CLEANUP** after tests:
   - Kill production server process

### 5.2 Playwright Configuration (Production Server)

**CRITICAL**: E2E tests MUST run against a production server, NOT a dev server.
Tests run 10-50x faster against production server.

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    // Use BASE_URL from environment (set by test runner)
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
  },
  
  // CRITICAL: Do NOT use webServer - we manage the server ourselves
  // Build and start prod server BEFORE running tests
  // webServer: undefined,
  
  workers: process.env.CI ? 4 : 3,
});
```

**Important**: The agent builds and starts the production server itself. Do NOT configure `webServer` in Playwright - this causes dev server overhead and 10-50x slower tests.

---

## 6. Hung Test Detection and Recovery

### 6.1 Detection Criteria

A test is considered hung if:
- No stdout/stderr output for 60 seconds
- Total execution exceeds suite timeout
- Process doesn't respond to SIGTERM

### 6.2 Recovery Protocol

```bash
# Execution wrapper with timeout
timeout --signal=SIGTERM --kill-after=30s 600s \
  pnpm test:e2e:ci 2>&1

EXIT_CODE=$?
if [ $EXIT_CODE -eq 124 ]; then
  echo "❌ TEST EXECUTION TIMED OUT"
  echo "Possible causes:"
  echo "  - Infinite loop in code"
  echo "  - Missing async/await"
  echo "  - Server not responding"
  echo "  - Test waiting for user input"
fi
```

### 6.3 Common Hang Causes

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Test starts, never finishes | Infinite loop | Add breakpoint debugging |
| Test waits for element | Element never appears | Check selectors, add timeout |
| Multiple tests hang | Server issue | Verify server health |
| Intermittent hangs | Race condition | Add proper waits/retries |

---

## 7. Quality Hooks Integration

### 7.1 Automatic Validation

The `test_standards.js` validator automatically checks test files for:
- Correct file location for test type
- Presence of real assertions
- Absence of focused tests (.only)
- Timeout configuration for E2E
- Debug script patterns

### 7.2 Validation Output

```
═══════════════════════════════════════════════════════════════════
TEST STANDARDS VIOLATION - Review and fix before committing
═══════════════════════════════════════════════════════════════════

ERRORS (must fix):
  ❌ Focused test (.only) found - will skip other tests in CI
  ❌ Test file has no assertions - is this a debug script?

WARNINGS (should review):
  ⚠️  E2E test without explicit timeout configuration

STANDARDS REFERENCE:
  📖 @.agent-os/standards/test-infrastructure.md
  📖 @.agent-os/instructions/agents/test-architect.md
═══════════════════════════════════════════════════════════════════
```

---

## 8. Quick Reference

### 8.1 Before Writing Tests

```
✅ Determine test type (unit/integration/e2e)
✅ Choose correct file location
✅ Select appropriate framework syntax
✅ Plan assertions (not just console.log)
✅ Document server dependencies (if e2e)
✅ Configure timeouts
```

### 8.2 Before Running Tests

```
✅ Check servers running (pnpm test:check-servers)
✅ Use CI-safe command (vitest run, not vitest)
✅ Have timeout wrapper ready
✅ Know how to kill hung tests
```

### 8.3 Before Committing Tests

```
✅ Remove .only() and .skip()
✅ Remove console.log debugging
✅ Remove debugger statements
✅ Verify tests pass in CI mode
✅ Check test_standards validator passes
```

---

## 9. References

- **Test Architect Agent**: `@.agent-os/instructions/agents/test-architect.md`
- **Test Runner Agent**: `@.agent-os/instructions/agents/test-runner.md`
- **TDD Validator**: `@.agent-os/instructions/utilities/tdd-validator.md`
- **Quality Hooks**: `@.agent-os/instructions/utilities/quality-hooks-guide.md`
- **Test Standards Validator**: `@.agent-os/hooks/validators/test_standards.js`

---

## Related Files

| File | Relationship |
|------|--------------|
| `@standards/testing-standards.md` | Canonical values (REFERENCE THIS FIRST) |
| `@instructions/agents/test-architect.md` | Test creation workflow |
| `@instructions/agents/test-runner.md` | Test execution workflow |
| `@instructions/core/execute-tasks.md` | Orchestration flow |

---

## Change Log

### v1.1.0 (v4.2.0)
- Added canonical reference banner
- Moved Framework Directory Isolation to top (CRITICAL section)
- Added cross-references to testing-standards.md
- Removed duplicate content (now references canonical source)

### v1.0.0 (2024-11-23)
- Initial release
- Test classification system
- CI-safe test commands
- Timeout configuration standards
- Test sprawl prevention rules
- Server management protocol
- Hung test detection and recovery
- Quality hooks integration
