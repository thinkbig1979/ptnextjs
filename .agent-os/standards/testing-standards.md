---
version: 5.1.0
last-updated: 2026-01-02
related-files:
  - standards/testing/test-strategies.md
---


# Testing Standards (Canonical Reference)

**Version**: 1.3.0 | Agent OS v5.1.0
**Status**: CANONICAL - Single source of truth for all testing standards

---

## 1. Timeout Configuration

### Per-Test Timeouts

| Test Type | Timeout | Rationale |
|-----------|---------|-----------|
| Unit | 5s | Fast, isolated, no I/O |
| Integration | 30s | Real DB/API |
| E2E | 60s | Full browser |
| E2E Step | 10s | Individual action |

### Suite Timeouts

| Test Type | Timeout |
|-----------|---------|
| Unit | 2 min |
| Integration | 5 min |
| E2E | 10 min |

### Detection Timeouts

| Check | Timeout | Action |
|-------|---------|--------|
| Server Health | 2s | Block test execution |
| Idle Detection | 60s | Alert (possible hung test) |
| Hung Test | 30s stuck | Kill test |

### Framework Configuration

**Vitest**: `testTimeout: 5000, hookTimeout: 10000`
**Playwright**: `timeout: 60000, expect: { timeout: 10000 }`
**Jest**: `testTimeout: 5000`
**Pytest**: `timeout = 30`

---

## 2. File Location Standards

### Directory Structure

```
project/
├── src/components/Button.test.tsx   # Co-located (PREFERRED)
├── tests/
│   ├── unit/                        # Alternative unit location
│   ├── integration/                 # Integration tests ONLY
│   └── e2e/                         # E2E tests ONLY (CRITICAL)
├── scripts/debug/                   # Debug scripts (NOT tests)
└── tests/_archive/                  # Archived tests
```

### File Naming

| Type | Pattern | Example |
|------|---------|---------|
| Unit | `*.test.{ts,tsx}` | `Button.test.tsx` |
| Integration | `*.integration.ts` | `api.integration.ts` |
| E2E | `*.spec.ts` | `login.spec.ts` |
| Debug | `debug-*.ts` | `debug-auth.ts` |

---

## 3. Framework Directory Isolation (CRITICAL)

**Prevents "Vitest cannot be imported" error.**

### Mandatory Configuration

**Playwright**: `testDir: './tests/e2e'` (NEVER `'./tests'`)
**Vitest**: `exclude: ['tests/e2e/**', 'tests/integration/**']`

### Checklist

- [ ] Playwright `testDir` is `./tests/e2e`
- [ ] Vitest excludes E2E directories
- [ ] No Vitest imports in `*.spec.ts`
- [ ] No Playwright imports in `*.test.ts`

---

## 4. Pattern Lookup Hierarchy

```
1. FIRST:  .agent-os/patterns/        (Project-specific - HIGHEST)
2. SECOND: standards/                 (testing-standards.md, patterns/)
3. THIRD:  MCPs                       (DocFork, Context7)
4. FOURTH: WebSearch/WebFetch         (Fallback)
```

---

## 5. Pre-Creation Checklist (MANDATORY)

Complete before writing ANY test:

```yaml
test_type: ""              # unit | integration | e2e
detected_framework: ""     # jest | vitest | playwright
file_path: ""              # Full path
has_timeout: true          # Required for e2e
requires_servers: false    # List if true
has_real_assertions: true  # Uses expect/assert
```

---

## 6. Post-Creation Requirements

### Pattern Documentation

Create: `.agent-os/test-context/[TASK_ID]-patterns-used.json`

Required sections: `test_runner`, `e2e_framework`, `patterns_used`, `server_requirements`

---

## 7. Test Sprawl Prevention

### True Test vs Debug Script

| True Test | Debug Script |
|-----------|--------------|
| Has assertions | Outputs for review |
| Runs unattended | Manual inspection |
| Location: `tests/` | Location: `scripts/debug/` |

### Rules

- Every test must have real assertions
- No `.only()` or `.skip()` in committed code
- Max 5 console statements per test file
- Red flag names: `*-verification.spec.ts`, `debug-*.spec.ts`

---

## 8. CI-Safe Commands

```json
{
  "test:unit:ci": "vitest run --reporter=verbose",
  "test:e2e:ci": "playwright test --reporter=list",
  "test:check-servers": "node scripts/check-test-servers.js"
}
```

| Framework | Avoid | CI-Safe |
|-----------|-------|---------|
| Vitest | `vitest` | `vitest run` |
| Jest | `--watch` | `--ci` |
| Playwright | `--ui` | `playwright test` |

---

## 9. E2E Parallelism Configuration

### Optimal Workers

| Environment | Workers |
|-------------|---------|
| CI (4-core) | 4 |
| CI (8-core) | 6 |
| Local | 3 |

```typescript
// playwright.config.ts
workers: process.env.CI ? 4 : 3,
```

### Reduce Workers If

- ECONNRESET errors
- 502/503 errors during tests
- Tests timeout but pass individually

---

## 10. Serial Mode for Write-Heavy Tests

```typescript
test.describe.configure({ mode: 'serial' });
```

Use when tests:
- Modify shared accounts
- Create/delete database records
- Test race conditions
- Perform bulk operations

---

## 11. Selector Standards

### Priority Order

1. `[data-testid="..."]` - PREFERRED
2. `[role="..."][name="..."]` - Accessibility-driven
3. `getByRole()` - Playwright locators
4. `.class-name` - AVOID
5. Text selectors - LAST resort

### data-testid Pattern

```typescript
export const SELECTORS = {
  emailInput: '[data-testid="login-email"]',
  submitButton: '[data-testid="login-submit"]',
  resultItem: (i: number) => `[data-testid="result-${i}"]`,
};
```

---

## 12. Semantic Wait Utilities

### Anti-Pattern

```typescript
// NEVER DO THIS
await page.waitForTimeout(2000);
```

### Semantic Waits

| Utility | Use Case |
|---------|----------|
| `waitForPageReady(page)` | After navigation |
| `waitForElementStable(page, selector)` | After dynamic content |
| `waitForApiResponse(page, pattern)` | After form submission |

---

## 13. Test Isolation Patterns

Create per-test entities to avoid parallel conflicts:

```typescript
export const testWithUniqueVendor = base.extend({
  uniqueVendor: async ({ request }, use, testInfo) => {
    const email = `test-${Date.now()}-${testInfo.testId.slice(-8)}@example.com`;
    await request.post('/api/test/vendors/create', { data: { email } });
    await use({ email });
    await request.delete(`/api/test/vendors/${email}`);
  },
});
```

---

## 14. Production Server Requirement (v4.9.0)

**E2E tests MUST run against PRODUCTION server, NOT dev server.**

### Why

| Aspect | Dev Server | Prod Server |
|--------|------------|-------------|
| Per-request | Hot reload overhead | Optimized |
| 100 tests | ~5 minutes | ~30 seconds |

### Workflow

```bash
npm run build && npm run start &
until curl -sf http://localhost:3000; do sleep 1; done
export BASE_URL="http://localhost:3000"
npx playwright test
```

### Playwright Config

```typescript
export default defineConfig({
  use: { baseURL: process.env.BASE_URL || 'http://localhost:3000' },
  // NO webServer - we manage server ourselves
  workers: process.env.CI ? 4 : 3,
});
```

---

## 15. UI Component Testing Strategy (v5.1.0)

| Component Type | Unit | Integration | E2E |
|----------------|------|-------------|-----|
| Presentational | Required | Skip | Skip |
| Form Input | Required | With form library | Skip |
| Form Container | Logic only | Required | Critical paths |
| Page | Logic only | Complex cases | Required |
| User Flow | Skip | Skip | Required |

---

## 16. E2E Test Placement Rules (v5.1.0)

| Tier | Criteria | When to Run | Duration |
|------|----------|-------------|----------|
| Smoke | Critical journeys | Every commit | < 2 min |
| Core | Feature happy paths | Every PR | < 20 min |
| Regression | Edge cases | Nightly | < 45 min |
| Quarantine | Broken/flaky | Manual | N/A |

### Directory Structure

```
tests/e2e/
├── smoke/        # Critical paths
├── core/         # Feature coverage
├── regression/   # Edge cases
└── quarantine/   # Broken tests
```

---

## 17. Accessibility Requirements (v5.1.0)

### WCAG 2.1 AA Criteria

| Criterion | Requirement |
|-----------|-------------|
| Color Contrast | Text >= 4.5:1 |
| Keyboard Nav | All functionality accessible |
| Focus Indicators | 2px minimum visible ring |

### axe-core Integration

```typescript
const results = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa'])
  .analyze();
expect(results.violations).toEqual([]);
```

---

## 18. Performance Requirements (v5.1.0)

### Core Web Vitals

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| LCP | < 2.5s | 2.5-4s | > 4s |
| CLS | < 0.1 | 0.1-0.25 | > 0.25 |
| INP | < 200ms | 200-500ms | > 500ms |

---

## Related Files

| File | Purpose |
|------|---------|
| `testing/test-strategies.md` | General testing philosophy and patterns |
| `e2e-ui-testing-standards.md` | UI-specific E2E patterns |
| `instructions/agents/test-architect.md` | Test creation workflow |
| `instructions/utilities/test-execution-protocol.md` | Execution protocol |
| `config.yml` | Feature toggles |
