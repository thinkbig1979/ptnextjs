# Alignment Validation Protocol

**Version**: 1.0.0  
**Agent OS**: v4.2.0  
**Purpose**: Test/code alignment validation performed at GREEN phase exit (Step 2.2a)

---

## Usage

This protocol is referenced by:
- `@instructions/core/execute-task-orchestrated.md` - Step 2.2a
- `@instructions/utilities/test-code-alignment-checklist.md` - Full alignment guide

---

## Prerequisites

Before running this validation:
1. Implementation code has been written (GREEN phase)
2. All tests pass
3. Pattern documentation exists: `.agent-os/test-context/[TASK_ID]-patterns-used.json`

---

## Validation Checklist

### A. Pattern Integration Check

Verify implementation uses patterns documented by test-architect:

| Check | How to Verify | Example Issue |
|-------|---------------|---------------|
| Mocking approach matches | Compare patterns-used.json mocking.approach with implementation | Tests use vi.mock() but impl uses real API |
| Return types match | Compare test assertions with function returns | Test expects {user: User} but impl returns {userData: ...} |
| Async handling matches | Compare async patterns | Tests await promises but impl uses callbacks |
| Error types match | Compare caught error types | Tests catch AuthError but impl throws Error |

**Verification Commands:**
```bash
# Read pattern file
cat .agent-os/test-context/[TASK_ID]-patterns-used.json

# Check implementation imports
grep -r "import" src/ | head -20
```

### B. Structure Alignment Check

Verify code structure matches what tests expect:

| Check | How to Verify | Example Issue |
|-------|---------------|---------------|
| Mocked modules called | Grep implementation for module usage | Tests mock './api' but impl doesn't call it |
| Data structures match | Compare return values | Tests expect array, impl returns object |
| E2E locators exist | Search for data-testid | Tests use [data-testid="submit"] but component lacks it |
| API paths match | Compare routes | Tests mock /api/users but impl calls /users |

**Verification Commands:**
```bash
# Check for data-testid attributes
grep -r "data-testid" src/components/

# Verify mocked modules are imported
grep -r "from './api'" src/
```

### C. Bypass Logic Check

Verify implementation doesn't circumvent tests:

| Pattern | GREP Command | Why It's Bad |
|---------|--------------|--------------|
| Hardcoded returns | `grep -r "return {" src/` | Skips actual logic |
| Test-specific branches | `grep -r "process.env.TEST" src/` | Different behavior in tests |
| Stub implementations | `grep -r "TODO\|STUB\|MOCK" src/` | Incomplete implementation |
| jest/vi in production | `grep -r "vi.fn\|jest.fn" src/` | Test utilities in prod code |

**If any bypass patterns found:**
- Document the location
- Determine if intentional (and document why)
- Or fix the implementation

### D. Coverage Validation

Verify test coverage meets thresholds:

| Metric | Threshold | Command |
|--------|-----------|---------|
| Line coverage | >= 85% | `pnpm test:unit:ci --coverage` |
| Branch coverage | >= 80% | Check coverage report |
| Function coverage | >= 85% | Check coverage report |

**Threshold Source:** `config.yml → test_code_alignment.alignment_validation.coverage_threshold`

---

## Validation Output Format

After running all checks, produce this output:

```
═══════════════════════════════════════════════════════════════════
ALIGNMENT VALIDATION - [TASK_ID]
═══════════════════════════════════════════════════════════════════

A. PATTERN INTEGRATION CHECK:
   [ ] Mocking approach: [PASS/FAIL] - [details]
   [ ] Return types: [PASS/FAIL] - [details]
   [ ] Async handling: [PASS/FAIL] - [details]
   [ ] Error types: [PASS/FAIL] - [details]

B. STRUCTURE ALIGNMENT CHECK:
   [ ] Mocked modules called: [PASS/FAIL] - [details]
   [ ] Data structures match: [PASS/FAIL] - [details]
   [ ] E2E locators exist: [PASS/FAIL] - [details]
   [ ] API paths match: [PASS/FAIL] - [details]

C. BYPASS LOGIC CHECK:
   [ ] No hardcoded returns: [PASS/FAIL] - [details]
   [ ] No test branches: [PASS/FAIL] - [details]
   [ ] No stubs: [PASS/FAIL] - [details]

D. COVERAGE VALIDATION:
   [ ] Line: [X]% (>= 85%): [PASS/FAIL]
   [ ] Branch: [X]% (>= 80%): [PASS/FAIL]
   [ ] Function: [X]% (>= 85%): [PASS/FAIL]

OVERALL STATUS: [PASSED/BLOCKED]

═══════════════════════════════════════════════════════════════════
```

---

## Failure Handling

### If Pattern Integration Fails:
```
❌ PATTERN INTEGRATION MISMATCH

Files involved:
- Test: [test file path]
- Implementation: [impl file path]
- Pattern doc: .agent-os/test-context/[TASK_ID]-patterns-used.json

Mismatch details: [specific mismatch]

Required fix: [specific fix instructions]
```

### If Structure Alignment Fails:
```
❌ STRUCTURE ALIGNMENT MISMATCH

The implementation structure doesn't match test expectations.

Test expects: [expected structure]
Implementation provides: [actual structure]

Fix: Update implementation to match test expectations.
```

### If Bypass Logic Detected:
```
⚠️ BYPASS LOGIC DETECTED

Location: [file:line]
Pattern found: [the bypass pattern]

This may cause tests to pass incorrectly.

Fix: Remove bypass logic and implement real behavior.
```

### If Coverage Below Threshold:
```
❌ COVERAGE BELOW THRESHOLD

Current: Line [X]%, Branch [Y]%, Function [Z]%
Required: Line 85%, Branch 80%, Function 85%

Add tests to cover:
- [uncovered file/function 1]
- [uncovered file/function 2]
```

---

## Related Files

| File | Relationship |
|------|--------------|
| `@standards/testing-standards.md` | Canonical testing values |
| `@instructions/utilities/test-code-alignment-checklist.md` | Full alignment guide |
| `@instructions/core/execute-task-orchestrated.md` | Orchestration flow (Step 2.2a) |
| `.agent-os/test-context/[TASK_ID]-patterns-used.json` | Pattern documentation from test-architect |

---

## Change Log

### v1.0.0 (v4.2.0)
- Initial extraction from execute-task-orchestrated.md
- Standalone protocol for alignment validation
