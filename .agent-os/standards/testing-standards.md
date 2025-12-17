# Testing Standards (Authoritative Reference)

**Version**: 1.1.0  
**Agent OS**: v4.8.2  
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
| Local Dev | 4-8 | 3 | Leave headroom for dev server |
| Local (constrained) | 2 | 2 | Minimum parallelism |

### 11.3 Required Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  // CRITICAL: Explicit worker count
  workers: isCI ? 4 : 3,
  
  // CRITICAL: Prevent multiple server instances
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,  // REQUIRED
    timeout: 120000,
  },
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

## Change Log

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
