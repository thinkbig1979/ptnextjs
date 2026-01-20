# Test/Code Alignment Checklist

**Version**: 1.0.0  
**Agent OS**: v3.3.0+  
**Purpose**: Ensure tests and implementation code remain aligned throughout development

## Overview

This checklist MUST be validated before marking a task's GREEN phase as complete. It ensures that:
1. Test patterns were documented during RED phase
2. Implementation uses the same patterns as tests
3. Test assertions match actual implementation behavior
4. No bypass logic circumvents test validation

## When to Use

| Phase | Action |
|-------|--------|
| **RED Phase (2.1)** | test-architect documents patterns used |
| **GREEN Phase (2.2)** | implementation-specialist reads pattern documentation |
| **Pre-Completion** | Orchestrator validates this checklist |

---

## Part 1: Pattern Documentation (RED Phase)

After test creation, test-architect MUST create:

**File**: `.agent-os/test-context/[TASK_ID]-patterns-used.json`

```json
{
  "task_id": "TASK_ID",
  "created_at": "ISO_TIMESTAMP",
  "test_runner": {
    "name": "vitest",
    "version": "1.6.0",
    "config_file": "vitest.config.ts"
  },
  "e2e_framework": {
    "name": "playwright",
    "version": "1.42.0",
    "config_file": "playwright.config.ts"
  },
  "patterns_used": {
    "mocking": {
      "approach": "vi.mock() with factory function",
      "example": "vi.mock('./api', () => ({ fetchData: vi.fn() }))",
      "modules_mocked": ["./services/api", "./lib/auth"]
    },
    "assertions": {
      "library": "@vitest/expect",
      "common_patterns": ["toBe", "toEqual", "toHaveBeenCalledWith"],
      "async_assertions": "await expect().resolves.toBe()"
    },
    "async_handling": {
      "pattern": "async/await with test.setTimeout()",
      "timeout_configured": true,
      "timeout_value": 5000
    },
    "e2e_patterns": {
      "locators": "data-testid attributes",
      "waiting": "page.waitForSelector()",
      "assertions": "expect(page).toHaveText()"
    }
  },
  "server_requirements": [
    {
      "name": "frontend",
      "url": "http://localhost:3000",
      "health_endpoint": "/health"
    },
    {
      "name": "api",
      "url": "http://localhost:4000",
      "health_endpoint": "/api/health"
    }
  ],
  "test_file_locations": [
    "src/features/auth/__tests__/login.test.ts",
    "e2e/auth/login.spec.ts"
  ],
  "critical_notes": [
    "API client must be mocked - tests do not call real endpoints",
    "Auth state managed via test fixtures, not real sessions",
    "E2E tests require seeded database state"
  ]
}
```

### Validation Gate (RED Phase Exit)

Before exiting RED phase, verify:

- [ ] Pattern documentation file exists
- [ ] All mocked modules are listed
- [ ] Assertion patterns are documented
- [ ] Server requirements are listed (for E2E)
- [ ] Critical implementation notes captured

---

## Part 2: Context Handoff (GREEN Phase Entry)

Implementation-specialist MUST read pattern documentation BEFORE writing code:

### Pre-Implementation Checklist

```markdown
## Implementation Context Review

Before writing implementation code, I have verified:

- [ ] Read `.agent-os/test-context/[TASK_ID]-patterns-used.json`
- [ ] Reviewed test files to understand setup expectations
- [ ] Noted mocking approach: _______________
- [ ] Noted assertion patterns: _______________
- [ ] Noted server requirements: _______________
- [ ] Understood critical notes: _______________

## Integration Plan

Based on test patterns, my implementation will:

1. Structure code to work with mocked modules: _______________
2. Return data types matching test assertions: _______________
3. Handle async operations as tests expect: _______________
4. Use error patterns that tests can catch: _______________
```

### Validation Gate (Implementation Start)

Before writing implementation:

- [ ] Pattern documentation file was read
- [ ] Test files were reviewed
- [ ] Implementation plan documented
- [ ] No contradictions with test expectations

---

## Part 3: Alignment Validation (GREEN Phase Exit)

Before marking GREEN phase complete:

### A. Pattern Integration Check

| Test Pattern | Implementation Uses It? | Evidence |
|--------------|------------------------|----------|
| Mocking approach | YES / NO | Code location: |
| Assertion patterns | YES / NO | Return types match: |
| Async handling | YES / NO | Async/await used: |
| Error patterns | YES / NO | Errors thrown correctly: |

### B. Test/Code Structure Alignment

```markdown
## Structure Alignment Verification

For each test file, verify corresponding implementation:

### Test: src/features/auth/__tests__/login.test.ts

- [ ] Test mocks `./services/api` → Implementation calls `./services/api`
- [ ] Test expects `{ user: User }` → Implementation returns `{ user: User }`
- [ ] Test catches `AuthError` → Implementation throws `AuthError`
- [ ] Test awaits async → Implementation is async

### Test: e2e/auth/login.spec.ts

- [ ] Test uses `data-testid="login-button"` → Component has `data-testid="login-button"`
- [ ] Test waits for `/dashboard` → Login redirects to `/dashboard`
- [ ] Test expects "Welcome, {name}" → UI displays "Welcome, {name}"
```

### C. No Bypass Logic Check

Verify implementation doesn't circumvent tests:

- [ ] **No hardcoded returns** - Functions compute values, not return constants
- [ ] **No test-specific branches** - No `if (process.env.TEST)` in production code
- [ ] **No stub implementations** - All functions have real logic
- [ ] **Mocked calls are real** - If test mocks API, implementation actually calls API
- [ ] **Coverage is real** - Tests exercise actual code paths

### D. Coverage Validation

```bash
# Run coverage to verify tests cover implementation
vitest run --coverage

# Required thresholds:
# - Line coverage: >= 85%
# - Branch coverage: >= 80%
# - Function coverage: >= 85%
```

- [ ] Coverage meets thresholds
- [ ] All new code is covered
- [ ] No uncovered critical paths

---

## Part 4: Common Misalignment Patterns

### Anti-Patterns to Check For

#### 1. Mock Bypass
```typescript
// TEST expects API to be mocked
vi.mock('./api', () => ({ fetch: vi.fn() }));

// BAD: Implementation hardcodes response
export function getData() {
  return { data: 'hardcoded' }; // Never calls api.fetch!
}

// GOOD: Implementation calls the mocked function
export function getData() {
  return api.fetch('/data'); // Mock intercepts this
}
```

#### 2. Type Mismatch
```typescript
// TEST asserts specific structure
expect(result).toEqual({ user: { id: 1, name: 'Test' } });

// BAD: Implementation returns different structure
return { userData: { userId: 1, userName: 'Test' } };

// GOOD: Implementation matches expected structure
return { user: { id: 1, name: 'Test' } };
```

#### 3. Error Pattern Mismatch
```typescript
// TEST catches specific error type
await expect(login('')).rejects.toThrow(ValidationError);

// BAD: Implementation throws different error
throw new Error('Invalid input'); // Generic Error, not ValidationError

// GOOD: Implementation throws expected error
throw new ValidationError('Invalid input');
```

#### 4. Async Mismatch
```typescript
// TEST awaits async operation
const result = await fetchUser(1);

// BAD: Implementation is sync (breaks async test pattern)
export function fetchUser(id) {
  return cache[id]; // Sync return
}

// GOOD: Implementation is async as test expects
export async function fetchUser(id) {
  return await api.get(`/users/${id}`);
}
```

#### 5. E2E Locator Mismatch
```typescript
// TEST uses data-testid
await page.click('[data-testid="submit-btn"]');

// BAD: Component uses different attribute
<button id="submit">Submit</button>

// GOOD: Component has matching data-testid
<button data-testid="submit-btn">Submit</button>
```

---

## Part 5: Orchestrator Validation Protocol

The task orchestrator MUST verify alignment before task completion:

### Automated Checks

```yaml
alignment_verification:
  step_1_pattern_file_exists:
    file: ".agent-os/test-context/{TASK_ID}-patterns-used.json"
    required: true
    
  step_2_tests_pass:
    command: "pnpm test:unit:ci && pnpm test:e2e:ci"
    required: true
    timeout: 600000
    
  step_3_coverage_threshold:
    line: 85
    branch: 80
    function: 85
    required: true
    
  step_4_no_bypass_patterns:
    scan_for:
      - "process.env.TEST"
      - "process.env.NODE_ENV === 'test'"
      - "jest.fn()" # Should not be in implementation
      - "vi.fn()" # Should not be in implementation
    required: false # Advisory only
```

### Manual Review Points

If automated checks pass but tests were brittle:

1. **Review test/implementation coupling**
   - Are tests testing implementation details or behavior?
   - Would refactoring break tests unnecessarily?

2. **Review mock boundaries**
   - Are we mocking at appropriate boundaries?
   - Are mocks returning realistic data?

3. **Review E2E reliability**
   - Are waits appropriate for the UI?
   - Are selectors stable across changes?

---

## Quick Reference

### Files Created/Used

| Phase | File | Purpose |
|-------|------|---------|
| RED | `.agent-os/test-context/{TASK_ID}-patterns-used.json` | Document patterns |
| GREEN | Same file | Read patterns |
| Verify | `.agent-os/tdd-state/{TASK_ID}-alignment.yml` | Store verification results |

### Required Instruction Files

- `standards/` - Testing patterns reference
- `instructions/agents/` - Implementation guidance

### Config Reference

```yaml
# config.yml
test_code_alignment:
  enabled: true
  pattern_documentation:
    required: true
    file_pattern: ".agent-os/test-context/{task_id}-patterns-used.json"
  context_handoff:
    required: true
    verify_read: true
  alignment_validation:
    coverage_threshold: 85
    bypass_scan: true
    block_on_failure: true
```

---

## Summary

**The alignment checklist ensures:**

1. ✅ Tests document their patterns (RED phase output)
2. ✅ Implementation reads those patterns (GREEN phase input)
3. ✅ Code integrates with test expectations (structural alignment)
4. ✅ No shortcuts bypass test validation (integrity check)
5. ✅ Coverage proves real code is tested (coverage validation)

**Without alignment verification, tests may pass but for wrong reasons!**
