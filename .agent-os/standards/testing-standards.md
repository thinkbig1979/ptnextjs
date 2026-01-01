# Testing Standards (Authoritative Reference)

**Version**: 1.2.0  
**Agent OS**: v4.9.0  
**Status**: CANONICAL - All other documents MUST reference this file for testing standards

---

## Purpose

This document is the **single source of truth** for all testing-related configuration values, standards, and requirements. Other instruction files MUST NOT duplicate these values - they should reference this document instead.

**Cross-Reference Format**: `See @standards/testing-standards.md Section X`

---

## 1. Timeout Configuration (CANONICAL)

These timeout values are the authoritative source. All other documents must reference this section.

### 1.1 Per-Test Timeouts

| Test Type | Timeout | Rationale |
|-----------|---------|-----------|
| Unit | 5 seconds | Fast, isolated, no I/O |
| Integration | 30 seconds | May involve real DB/API |
| E2E | 60 seconds | Full browser automation |
| E2E Step | 10 seconds | Individual action timeout |

### 1.2 Suite Timeouts

| Test Type | Timeout | Rationale |
|-----------|---------|-----------|
| Unit Suite | 2 minutes | Entire unit test run |
| Integration Suite | 5 minutes | Entire integration run |
| E2E Suite | 10 minutes | Full browser test suite |

### 1.3 Detection Timeouts

| Check | Timeout | Action on Timeout |
|-------|---------|-------------------|
| Server Health Check | 2 seconds | Block test execution |
| Idle Detection | 60 seconds | Alert/warn - possible hung test |
| Hung Test Detection | 30 seconds stuck | Kill test |

### 1.4 Framework Configuration Examples

**Vitest** (`vitest.config.ts`):
```typescript
export default defineConfig({
  test: {
    testTimeout: 5000,      // 5s per unit test
    hookTimeout: 10000,     // 10s for setup/teardown
  },
});
```

**Playwright** (`playwright.config.ts`):
```typescript
export default defineConfig({
  timeout: 60000,           // 60s per test
  expect: { timeout: 10000 }, // 10s for assertions
  use: {
    actionTimeout: 15000,   // 15s for actions
    navigationTimeout: 30000, // 30s for navigation
  },
});
```

**Jest** (`jest.config.js`):
```javascript
module.exports = {
  testTimeout: 5000,        // 5s per test
};
```

**Pytest** (`pytest.ini`):
```ini
[pytest]
timeout = 30
timeout_method = signal
```

---

## 2. File Location Standards (CANONICAL)

### 2.1 Directory Structure

```
project/
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   └── Button.test.tsx      # Co-located unit test (PREFERRED)
│   └── utils/
│       ├── helpers.ts
│       └── helpers.test.ts      # Co-located unit test
├── tests/
│   ├── unit/                    # Alternative unit test location
│   │   └── utils.test.ts
│   ├── integration/             # Integration tests ONLY
│   │   └── api.integration.ts
│   └── e2e/                     # E2E tests ONLY (CRITICAL)
│       ├── user-login.spec.ts
│       └── checkout-flow.spec.ts
├── scripts/
│   └── debug/                   # Debug scripts (NOT tests)
│       └── debug-auth-flow.js
└── tests/_archive/              # Archived old tests
    └── deprecated-feature.test.ts
```

### 2.2 File Naming Conventions

| Test Type | File Pattern | Examples |
|-----------|--------------|----------|
| Unit | `*.test.{ts,tsx,js,jsx}` | `Button.test.tsx`, `utils.test.ts` |
| Unit (alt) | `*.spec.{ts,tsx}` (if no E2E) | `helpers.spec.ts` |
| Integration | `*.integration.{ts,js}` | `api.integration.ts` |
| Integration (alt) | `*.int.test.{ts,js}` | `database.int.test.ts` |
| E2E | `*.spec.{ts,js}` (Playwright) | `login.spec.ts` |
| E2E (Cypress) | `*.cy.{ts,js}` | `checkout.cy.ts` |
| Debug Script | `debug-*.{ts,js}` | `debug-auth-flow.js` |

### 2.3 Allowed Locations by Test Type

| Test Type | Allowed Locations | NOT Allowed |
|-----------|-------------------|-------------|
| Unit | `src/**/*.test.*`, `tests/unit/**` | `tests/e2e/`, `tests/integration/` |
| Integration | `tests/integration/**` | `src/`, `tests/e2e/` |
| E2E | `tests/e2e/**`, `e2e/**` | `src/`, `tests/unit/` |
| Debug Scripts | `scripts/debug/**` | `tests/**`, `src/**` |

---

## 3. Framework Directory Isolation (CRITICAL)

**This section prevents the "Vitest cannot be imported" error.**

### 3.1 The Problem

When Playwright's `testDir` includes directories containing Vitest unit tests, Playwright attempts to load those files and fails with:
```
Error: Vitest cannot be imported in a CommonJS module using require()
```

### 3.2 The Solution

**Each test framework MUST have exclusive ownership of its test directory.**

### 3.3 Mandatory Configuration

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

**Jest** (`jest.config.js`):
```javascript
module.exports = {
  testPathIgnorePatterns: [
    '/node_modules/',
    '/tests/e2e/',
    '/tests/integration/'
  ],
};
```

### 3.4 Validation Checklist

Before running ANY tests, verify:
- [ ] Playwright `testDir` is `./tests/e2e` (NOT `./tests`)
- [ ] Vitest `include` excludes E2E directories
- [ ] No Vitest imports (`vi`, `vitest`) in `*.spec.ts` files
- [ ] No Playwright imports (`@playwright/test`) in `*.test.ts` files

---

## 4. Pattern Lookup Hierarchy (CANONICAL)

When gathering testing patterns and documentation, use this priority order:

### 4.1 Priority Order

```
1. FIRST:  .agent-os/patterns/        (Project-specific patterns - HIGHEST PRIORITY)
2. SECOND: Skills                      (agent-os-patterns, agent-os-test-research)
3. THIRD:  MCPs                        (DocFork MCP, Context7 MCP)
4. FOURTH: WebSearch/WebFetch          (Fallback for gaps)
```

### 4.2 Project-Specific Patterns

Location: `.agent-os/patterns/testing/`

These patterns are generated by codebase analysis and TAKE PRECEDENCE over all other sources.

**Check these first**:
- `.agent-os/patterns/testing/vitest.md`
- `.agent-os/patterns/testing/playwright.md`
- `.agent-os/patterns/testing/convex.md`
- `.agent-os/patterns/testing/[framework].md`

### 4.3 Skills Invocation

**Ownership**: The `test-context-gatherer` agent OWNS skill invocations.

Required skill invocations:
```
Skill(skill="agent-os-test-research")
Skill(skill="agent-os-patterns")
```

### 4.4 MCP Fallback

Only use MCPs if skills don't provide needed information:
- `mcp__dockfork__get_documentation` - Pre-indexed documentation
- `mcp__context7__get_library_docs` - AI-optimized documentation

### 4.5 WebSearch Fallback

Only use for gaps not covered by above sources:
```
WebSearch(query="[library] [version] official documentation [topic]")
```

---

## 5. Pre-Creation Checklist (MANDATORY)

**This checklist MUST be completed before writing ANY test file.**

### 5.1 Checklist Template

```yaml
pre_creation_checklist:
  # Step 1: Test Classification
  test_type: ""           # REQUIRED: unit | integration | e2e
  rationale: ""           # WHY this test type is appropriate

  # Step 2: Framework Detection
  detected_framework: ""  # jest | vitest | pytest | rspec | playwright | etc.
  detection_method: ""    # How determined (package.json, config file, etc.)
  test_syntax: ""         # Syntax style (describe/it, test(), def test_, etc.)

  # Step 3: File Location
  file_path: ""           # FULL path where test will be created
  location_rationale: ""  # WHY this location matches Section 2 standards

  # Step 4: CI Safety
  exits_cleanly: true     # Test will exit with code 0/1, not hang
  no_watch_mode: true     # No --watch flag, uses --run for vitest
  has_timeout: true       # Test has timeout configuration
  timeout_value: ""       # Specific timeout (reference Section 1)

  # Step 5: Server Dependencies
  requires_servers: false # true if e2e/integration needs servers
  server_list: []         # List: ["frontend:3000", "backend:8000"]
  health_check_endpoints: [] # Endpoints: ["http://localhost:3000/health"]

  # Step 6: Assertions
  has_real_assertions: true  # Uses expect(), assert, etc.
  assertion_library: ""      # jest/vitest expect, chai, pytest assert, etc.

  # Step 7: Test Purpose
  is_true_test: true      # Has pass/fail criteria, not debug script
  purpose: ""             # What behavior is being verified
  acceptance_criteria_covered: [] # Which criteria this test verifies
```

### 5.2 Validation Rules

| Rule | Block If |
|------|----------|
| test_type must be specified | test_type is empty |
| File location must match test type | e2e test not in tests/e2e/ |
| E2E tests must declare servers | test_type == 'e2e' AND server_list empty |
| Must have real assertions | has_real_assertions == false |
| E2E must have timeout | test_type == 'e2e' AND has_timeout == false |

### 5.3 Confirmation Output

Before writing tests, output this confirmation:
```
═══════════════════════════════════════════════════════════════════
PRE-CREATION CHECKLIST - CONFIRMED
═══════════════════════════════════════════════════════════════════

✓ Test Type: [unit/integration/e2e]
✓ Framework: [framework name] (detected from [source])
✓ File Location: [path] (matches [test_type] standards)
✓ CI-Safe: exits cleanly, no watch mode, timeout: [value]
✓ Server Dependencies: [none / list]
✓ Assertions: Using [library] expect/assert
✓ Purpose: [what is being tested]

PROCEEDING TO TEST CREATION...
═══════════════════════════════════════════════════════════════════
```

---

## 6. Post-Creation Requirements (MANDATORY)

After creating tests, the following are REQUIRED:

### 6.1 Pattern Documentation File

**File**: `.agent-os/test-context/[TASK_ID]-patterns-used.json`

**Required Structure**:
```json
{
  "task_id": "[TASK_ID]",
  "created_at": "[ISO_TIMESTAMP]",
  
  "test_runner": {
    "name": "[vitest|jest|pytest|rspec]",
    "version": "[VERSION]",
    "config_file": "[CONFIG_PATH]"
  },
  
  "e2e_framework": {
    "name": "[playwright|cypress|none]",
    "version": "[VERSION]",
    "config_file": "[CONFIG_PATH]"
  },
  
  "patterns_used": {
    "mocking": {
      "approach": "[vi.mock|jest.mock|unittest.mock|etc]",
      "example": "[actual code example]",
      "modules_mocked": ["[list]"],
      "notes": "[special considerations]"
    },
    "assertions": {
      "library": "[@vitest/expect|jest|chai|pytest]",
      "common_patterns": ["[toBe|toEqual|etc]"],
      "async_assertions": "[pattern]"
    },
    "async_handling": {
      "pattern": "[async/await|promises|callbacks]",
      "timeout_configured": true,
      "timeout_value": "[MS]"
    },
    "e2e_patterns": {
      "locators": "[data-testid|css|xpath|role]",
      "waiting": "[waitForSelector|waitForURL|etc]",
      "assertions": "[expect(page).toHaveText|etc]"
    }
  },
  
  "server_requirements": [
    {
      "name": "[server name]",
      "url": "[URL]",
      "health_endpoint": "[ENDPOINT]"
    }
  ],
  
  "test_file_locations": [
    "[path to each test file created]"
  ],
  
  "critical_notes": [
    "[Implementation notes for GREEN phase]"
  ]
}
```

### 6.2 Verification Requirements

After test creation:
- [ ] All test files exist at declared locations
- [ ] No syntax errors in test files
- [ ] patterns-used.json file created
- [ ] patterns-used.json contains all required sections

---

## 7. Test Sprawl Prevention Rules (CANONICAL)

### 7.1 What is Test Sprawl?

Accumulation of debug scripts, one-off verifications, and orphaned tests that:
- Bloat test suites
- Cause inconsistent CI behavior
- Require manual inspection to determine pass/fail

### 7.2 Prevention Rules

| Rule | Check | Violation Action |
|------|-------|------------------|
| Every test must have real assertions | Contains expect() or assert | Move to scripts/debug/ |
| No focused tests in committed code | No .only() or .skip() | Remove before commit |
| Debug scripts are NOT tests | Files for manual verification | Place in scripts/debug/ |
| Archive old tests | Unused tests | Move to tests/_archive/ |

### 7.3 Maximum Console Statements

**Per test file**: Maximum 5 console.log/console.warn/console.error statements

More suggests this is a debug script, not a test.

### 7.4 File Name Red Flags

These file names suggest debug scripts, NOT tests:
- `*-verification.spec.ts`
- `*-manual-*.spec.ts`
- `check-*.spec.ts`
- `debug-*.spec.ts`
- `evaluate-*.spec.ts`

**Action**: Move to `scripts/debug/` or delete.

### 7.5 True Test vs Debug Script

**True Test** (belongs in tests/):
- Has assertions that can fail
- Runs without manual intervention
- Has clear pass/fail exit code
- Tests actual behavior

**Debug Script** (belongs in scripts/debug/):
- Used for manual verification
- Outputs information for human review
- No automated assertions
- Delete after issue resolved

---

## 8. CI-Safe Test Commands (CANONICAL)

### 8.1 Required Package.json Scripts

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

### 8.2 Watch Mode Prevention

| Framework | Watch Mode (AVOID) | CI-Safe Command |
|-----------|-------------------|-----------------|
| Vitest | `vitest` | `vitest run` |
| Jest | `jest --watch` | `jest --ci` |
| Playwright | `playwright test --ui` | `playwright test` |
| Pytest | N/A | `pytest -v` |

### 8.3 Streaming Reporter Commands

For real-time output visibility:

**Unit Tests**:
```bash
node ~/.agent-os/hooks/lib/test-monitor.js pnpm vitest run --reporter=./scripts/reporters/vitest-streaming.js
```

**E2E Tests**:
```bash
node ~/.agent-os/hooks/lib/test-monitor.js pnpm playwright test --reporter=./scripts/reporters/playwright-streaming.ts
```

---

## 9. Related Files

| File | Relationship |
|------|--------------|
| `@standards/test-infrastructure.md` | Implementation details, scripts |
| `@instructions/agents/test-architect.md` | Test creation workflow |
| `@instructions/agents/test-context-gatherer.md` | Context gathering workflow |
| `@instructions/core/execute-tasks.md` | Orchestration flow |
| `@.claude/commands/run-tests.md` | Test execution command |
| `@config.yml` | Feature toggles |

---

## 10. Config.yml References

All testing behavior is controlled by `config.yml` toggles:

| Section | Toggle | Controls |
|---------|--------|----------|
| `test_infrastructure` | `enabled` | All infrastructure standards |
| `test_context_gathering` | `enabled` | Step 2.0 context gathering |
| `tdd_enforcement` | `enabled` | RED/GREEN/REFACTOR phases |
| `test_code_alignment` | `enabled` | Step 2.2a alignment validation |
| `test_execution_monitoring` | `enabled` | Streaming reporters |
| `skills_integration` | `enabled` | Skill invocations |

---

---

## 11. E2E Parallelism Configuration (CANONICAL)

### 11.1 The Problem

Unlimited Playwright workers cause:
- ECONNRESET errors (network exhaustion)
- Server resource exhaustion (CPU/memory thrashing)
- Unpredictable test failures
- 502/503 errors during test runs

### 11.2 Optimal Worker Configuration

| Environment | CPU Cores | Workers | Rationale |
|-------------|-----------|---------|-----------|
| CI (4-core) | 4 | 4 | Match core count |
| CI (8-core) | 8 | 6 | Leave headroom for OS/server |
| Local | 4-8 | 3 | Leave headroom for prod server |
| Local (constrained) | 2 | 2 | Minimum parallelism |

### 11.3 Required Playwright Configuration

**IMPORTANT**: E2E tests MUST run against a production server. See Section 17.

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    // Use BASE_URL from environment, default to prod port
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
  },
  
  // CRITICAL: Explicit worker count
  workers: process.env.CI ? 4 : 3,
  
  // CRITICAL: Do NOT use webServer - we manage the server ourselves
  // Tests run against pre-built production server for 10-50x speed improvement
  // webServer: undefined,
});
```

### 11.4 When to Reduce Workers

Reduce worker count if you see:
- ECONNRESET errors
- 502/503 errors during tests
- Tests timing out that pass individually
- High memory usage during test runs

---

## 12. Serial Mode for Write-Heavy Tests (CANONICAL)

### 12.1 When to Use Serial Mode

Mark tests as serial when they:
- Modify shared user/vendor accounts
- Create or delete database records
- Test race condition handling explicitly
- Perform bulk import/export operations
- Send emails or notifications

### 12.2 Implementation

```typescript
import { test, expect } from '@playwright/test';

// At the top of the describe block
test.describe.configure({ mode: 'serial' });

test.describe('Vendor Dashboard', () => {
  test('updates vendor profile', async ({ page }) => {
    // This test modifies shared vendor state
  });
});
```

### 12.3 Common Serial Mode Candidates

| File Pattern | Reason |
|--------------|--------|
| `*-dashboard.spec.ts` | Modifies user state |
| `*-registration*.spec.ts` | Creates new accounts |
| `*-onboarding*.spec.ts` | Multi-step state changes |
| `*-import*.spec.ts` | Bulk data operations |
| `*-approval*.spec.ts` | Admin state changes |
| `concurrent-*.spec.ts` | Explicit race condition tests |

---

## 13. Selector Standards (CANONICAL)

### 13.1 Priority Order

1. `[data-testid="..."]` - PREFERRED for test stability
2. `[role="..."][name="..."]` - Accessibility-driven, stable
3. `getByRole()` - Playwright's accessibility locators
4. `.class-name` - AVOID unless stable component library
5. Text selectors - LAST resort

### 13.2 Standard Selector Object Pattern

```typescript
// tests/e2e/selectors/page-selectors.ts
export const LOGIN_SELECTORS = {
  emailInput: '[data-testid="login-email"]',
  passwordInput: '[data-testid="login-password"]',
  submitButton: '[data-testid="login-submit"]',
  errorMessage: '[data-testid="login-error"]',
};

export const MODAL_SELECTORS = {
  container: '[data-testid="modal"]',
  confirmButton: '[data-testid="modal-confirm"]',
  cancelButton: '[data-testid="modal-cancel"]',
  resultItem: (index: number) => `[data-testid="result-${index}"]`,
};
```

### 13.3 When to Add data-testid

**Add to:**
- Interactive elements (buttons, links, inputs)
- Dynamic content containers
- Test-critical elements
- Elements that change based on state

**Skip for:**
- Static text content
- Decorative elements
- Layout containers

---

## 14. Semantic Wait Utilities (CANONICAL)

### 14.1 The Anti-Pattern

```typescript
// NEVER DO THIS
await page.waitForTimeout(2000);
await page.waitForTimeout(5000);  // "just to be safe"
```

### 14.2 Why Hardcoded Waits Are Bad

1. **Unreliable**: Sometimes too short, sometimes too long
2. **Slow**: Always waits full duration even if ready sooner
3. **Flaky**: Different timing on CI vs local
4. **Anti-pattern**: Playwright explicitly discourages this

### 14.3 Semantic Wait Utilities

Create helpers for common wait scenarios:

| Utility | Use Case |
|---------|----------|
| `waitForPageReady(page)` | After navigation/reload |
| `waitForElementStable(page, selector)` | After dynamic content |
| `waitForFormReady(page)` | Before form interaction |
| `waitForApiResponse(page, pattern)` | After form submission |
| `waitForModal(page)` | After modal trigger |

### 14.4 Implementation Reference

See `~/.claude/skills/e2e-test-repair/references/stability-patterns.md` Section 4 for full implementations.

---

## 15. Test Isolation Patterns (CANONICAL)

### 15.1 The Problem

Multiple parallel tests using the same user/vendor account causes:
- Session conflicts
- Data corruption
- Race conditions
- Flaky, unreproducible failures

### 15.2 Solution: Unique Fixtures

Create per-test entities that don't conflict with parallel tests:

```typescript
// tests/e2e/fixtures/test-fixtures.ts
export const testWithUniqueVendor = base.extend<UniqueVendorFixture>({
  uniqueVendor: async ({ page, request }, use, testInfo) => {
    const timestamp = Date.now();
    const testId = testInfo.testId.slice(-8);
    const email = `test-vendor-${timestamp}-${testId}@example.com`;
    
    // Create unique vendor
    await request.post('/api/test/vendors/create', { data: { email } });
    
    await use({ email, /* ... */ });
    
    // Automatic cleanup
    await request.delete(`/api/test/vendors/${slug}`);
  },
});
```

### 15.3 When to Use Unique Fixtures

- Tests that log in as specific users
- Tests that create/modify records
- Any test with state dependencies
- Tests that fail in parallel but pass alone (ISOLATION_FAILURE)

### 15.4 Implementation Reference

See `~/.claude/skills/e2e-test-repair/references/stability-patterns.md` Section 3 for full implementations.

---

## 16. Health Check Endpoint Standard (CANONICAL)

### 16.1 Recommended Endpoint

Projects should implement `/api/test/health` that verifies:

```typescript
interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  checks: {
    database: { ok: boolean; message: string };
    requiredTables: { ok: boolean; count: number };
    testEndpoints: { ok: boolean; message: string };
  };
  readyForTests: boolean;
}
```

### 16.2 Global Setup Integration

```typescript
// tests/e2e/global-setup.ts
const health = await checkHealth(baseURL, 30000);
if (!health.ready) {
  throw new Error('Server not ready for tests');
}
```

### 16.3 Implementation Reference

See `~/.claude/skills/e2e-test-repair/references/stability-patterns.md` Section 6 for full implementations.

---

## 17. Production Server Requirement (CANONICAL v4.9.0)

### 17.1 The Requirement

**E2E tests MUST run against a PRODUCTION server, NOT a dev server.**

This is mandatory for all E2E test execution. Tests should never spawn their own dev server.

### 17.2 Why Production Server?

| Aspect | Dev Server | Prod Server |
|--------|------------|-------------|
| Startup | 30-60s | Already built |
| Per-request | Hot reload overhead | Optimized |
| Test speed | ~500ms/test | ~50ms/test |
| 100 tests | ~5 minutes | ~30 seconds |
| Parallelism | Needs sharding | Handles concurrent |
| Stability | Memory leaks, rebuilds | Stable, predictable |

### 17.3 Required Workflow

```bash
# 1. Kill any existing servers
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# 2. Build production
npm run build

# 3. Start production server
npm run start > /tmp/prod-server.log 2>&1 &
echo $! > /tmp/prod-server.pid

# 4. Wait for ready
until curl -sf http://localhost:3000 > /dev/null; do sleep 1; done

# 5. Run tests
export BASE_URL="http://localhost:3000"
npx playwright test

# 6. Stop server
kill $(cat /tmp/prod-server.pid) 2>/dev/null || true
```

### 17.4 Playwright Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
  },
  // CRITICAL: No webServer - we manage server ourselves
  // webServer: undefined,
  
  // Reasonable parallelism - prod server handles it
  workers: process.env.CI ? 4 : 3,
});
```

### 17.5 After Application Code Changes

**MUST rebuild before running tests:**

```bash
# Kill current server
kill $(cat /tmp/prod-server.pid) 2>/dev/null || true

# Rebuild
npm run build

# Restart
npm run start > /tmp/prod-server.log 2>&1 &
echo $! > /tmp/prod-server.pid

# Wait and continue
until curl -sf http://localhost:3000 > /dev/null; do sleep 1; done
```

### 17.6 CI Pipeline Example

```yaml
e2e_tests:
  steps:
    - npm run build
    - npm run start &
    - npx wait-on http://localhost:3000
    - npm run test:e2e:ci
```

---

---

## 18. UI Component Testing Strategy (v5.1.0)

### 18.1 Test Type Decision Tree

| Component Type | Unit Test | Integration Test | E2E Test |
|----------------|-----------|------------------|----------|
| Presentational (Button, Card) | ✅ Required | ❌ Skip | ❌ Skip |
| Form Input (TextInput, Select) | ✅ Required | ✅ With form library | ❌ Skip |
| Form Container (LoginForm) | ⚠️ Logic only | ✅ Required | ✅ Critical paths |
| Data Display (Table, List) | ✅ Required | ✅ With API mocking | ⚠️ If critical |
| Page Component (DashboardPage) | ⚠️ Logic only | ⚠️ Complex cases | ✅ Required |
| User Flow (multi-step) | ❌ Skip | ❌ Skip | ✅ Required |

Legend: ✅ Required | ⚠️ Conditional | ❌ Skip

### 18.2 Test File Location by Component Type

| Component Type | Unit Test Location | Integration Location | E2E Location |
|----------------|-------------------|---------------------|--------------|
| Presentational | `src/components/X/X.test.tsx` | N/A | N/A |
| Form Input | `src/components/X/X.test.tsx` | `tests/integration/forms/` | N/A |
| Form Container | `src/components/X/X.test.tsx` | `tests/integration/forms/` | `tests/e2e/[tier]/` |
| Page | N/A | N/A | `tests/e2e/[tier]/` |
| User Flow | N/A | N/A | `tests/e2e/[tier]/[flow].spec.ts` |

### 18.3 Canonical Reference

Full guidance: `@instructions/utilities/ui-component-testing-strategy.md`

---

## 19. UI-Specific Selector Standards (v5.1.0)

### 19.1 Selector Priority Order

1. **Role + Name** (preferred): `getByRole('button', { name: 'Submit' })`
2. **Label**: `getByLabel('Email')`
3. **Text**: `getByText('Welcome back')`
4. **data-testid**: `getByTestId('login-form')`
5. **CSS** (last resort): `.card-header`

### 19.2 data-testid Convention

Pattern: `[feature]-[component]-[element]`

Examples:
- `login-form` - Form container
- `login-email-input` - Email field
- `login-submit-button` - Submit button
- `login-error-message` - Error display
- `user-card-0` - Indexed list item

### 19.3 Selector Object Pattern

```typescript
// tests/e2e/selectors/auth.selectors.ts
export const AUTH_SELECTORS = {
  loginForm: '[data-testid="login-form"]',
  emailInput: '[data-testid="login-email-input"]',
  passwordInput: '[data-testid="login-password-input"]',
  submitButton: '[data-testid="login-submit-button"]',
  errorMessage: '[data-testid="login-error-message"]',
  fieldError: (field: string) => `[data-testid="login-${field}-error"]`,
};
```

### 19.4 Canonical Reference

Full patterns: `@standards/e2e-ui-testing-standards.md`

---

## 20. E2E Test Placement Rules (v5.1.0)

### 20.1 Tier Criteria

| Tier | Criteria | When to Run | Duration Target |
|------|----------|-------------|-----------------|
| Smoke | Critical user journeys, high impact, stable, fast | Every commit | < 2 minutes |
| Core | Feature happy paths, CRUD operations, medium impact | Every PR | < 20 minutes |
| Regression | Edge cases, validation, slow tests, complex setup | Nightly | < 45 minutes |
| Quarantine | Broken or flaky tests | Manual only | N/A |

### 20.2 Tier Assignment Decision

```
Is this a CRITICAL user journey? (auth, payment, core feature)
├─► YES + Fast (< 30s) + Stable → SMOKE
├─► YES + Slow or Unstable → CORE (optimize later)
└─► NO: Is this a main feature happy path?
    ├─► YES → CORE
    └─► NO: Is this an edge case or error path?
        ├─► YES → REGRESSION
        └─► NO: Is this broken or flaky?
            └─► YES → QUARANTINE (requires tracking issue)
```

### 20.3 Directory Structure

```
tests/e2e/
├── smoke/           # Critical paths - every commit
│   ├── auth.spec.ts
│   └── dashboard.spec.ts
├── core/            # Feature coverage - every PR
│   ├── auth/
│   │   └── password-reset.spec.ts
│   └── user-management/
│       └── profile.spec.ts
├── regression/      # Edge cases - nightly
│   ├── validation/
│   │   └── form-validation.spec.ts
│   └── error-handling/
│       └── api-errors.spec.ts
└── quarantine/      # Broken/flaky - manual only
    └── flaky-upload.spec.ts  # Tracking: #123
```

### 20.4 Canonical Reference

Full checklist: `@instructions/utilities/e2e-test-placement-checklist.md`

---

## 21. UI Accessibility Test Requirements (v5.1.0)

### 21.1 Mandatory Accessibility Testing

Required for:
- All new UI components
- All forms
- All user-facing pages

### 21.2 WCAG 2.1 AA Criteria

| Criterion | Requirement | How to Test |
|-----------|-------------|-------------|
| Color Contrast | Text ≥ 4.5:1, UI ≥ 3:1 | axe-core |
| Keyboard Navigation | All functionality accessible | Manual + E2E |
| Focus Indicators | Visible focus ring (2px min) | Visual inspection |
| Screen Reader | Correct announcements | NVDA/VoiceOver testing |
| ARIA Usage | Correct roles, states, properties | axe-core |

### 21.3 axe-core Integration Pattern

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('page has no accessibility violations', async ({ page }) => {
  await page.goto('/dashboard');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  expect(results.violations).toEqual([]);
});
```

### 21.4 Violation Severity

| Severity | Action | Blocks Completion? |
|----------|--------|-------------------|
| Critical | Must fix immediately | YES |
| Serious | Must fix before release | YES (after grace period) |
| Moderate | Should fix | NO |
| Minor | Nice to fix | NO |

### 21.5 Canonical Reference

Full requirements: `@instructions/utilities/ui-acceptance-criteria-checklist.md`

---

## 22. UI Performance Requirements (v5.1.0)

### 22.1 Core Web Vitals Targets

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| LCP (Largest Contentful Paint) | < 2.5s | 2.5-4s | > 4s |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.1-0.25 | > 0.25 |
| INP (Interaction to Next Paint) | < 200ms | 200-500ms | > 500ms |
| FCP (First Contentful Paint) | < 1.8s | 1.8-3s | > 3s |

### 22.2 When to Measure

- Before task completion (blocking for page components)
- Before PR merge (warning level)
- In CI pipeline (regression detection)

### 22.3 Measurement Methods

```bash
# Lighthouse CLI
lighthouse http://localhost:3000 --output=json --output-path=./lighthouse.json

# Playwright with Lighthouse
const { lighthouse } = require('lighthouse');
```

### 22.4 Canonical Reference

Full criteria: `@instructions/utilities/ui-acceptance-criteria-checklist.md`

---

## Change Log

### v1.3.0 (v5.1.0)
- Added Section 18: UI Component Testing Strategy
- Added Section 19: UI-Specific Selector Standards
- Added Section 20: E2E Test Placement Rules
- Added Section 21: UI Accessibility Test Requirements
- Added Section 22: UI Performance Requirements
- New utility documents: ui-component-testing-strategy.md, e2e-test-placement-checklist.md, ui-acceptance-criteria-checklist.md
- New standards document: e2e-ui-testing-standards.md
- E2E tests now BLOCK UI implementation task completion
- Browser validation gate added to execute-tasks.md

### v1.2.0 (v4.9.0)
- Added Section 17: Production Server Requirement (MANDATORY)
- E2E tests must run against production server, not dev server
- Removed sharding requirements (not needed with prod server)
- Tests run 10-50x faster with production server

### v1.1.0 (v4.8.2)
- Added Section 11: E2E Parallelism Configuration
- Added Section 12: Serial Mode for Write-Heavy Tests
- Added Section 13: Selector Standards (data-testid)
- Added Section 14: Semantic Wait Utilities
- Added Section 15: Test Isolation Patterns
- Added Section 16: Health Check Endpoint Standard
- Cross-references to e2e-test-repair skill for implementations

### v1.0.0 (v4.2.0)
- Initial canonical reference
- Consolidated from: test-infrastructure.md, test-architect.md, CLAUDE.md
- Established single source of truth for all testing standards
