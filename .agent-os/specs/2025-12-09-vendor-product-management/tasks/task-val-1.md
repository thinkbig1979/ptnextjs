# Task: Run and Pass All E2E Tests

## Metadata
- **ID**: task-val-1
- **Phase**: 5 - Final Validation
- **Agent**: quality-assurance
- **Time**: 30-40 min
- **Dependencies**: task-int-2, task-int-3
- **Status**: pending

## Description

Execute all E2E tests for product management and ensure they pass. Fix any remaining issues discovered during test execution.

## Specifics

### Test Suite
`tests/e2e/vendor-onboarding/09-product-management.spec.ts`

### Tests to Pass

| Test | Line | Status Before | Target |
|------|------|---------------|--------|
| 9.1 Access product management | 17 | PASSING | PASS |
| 9.2 View product list | 55 | FAILING | PASS |
| 9.3 Add new product | 105 | FAILING | PASS |
| 9.4 Edit existing product | 170 | FAILING | PASS |
| 9.5 Delete product | 219 | FAILING | PASS |
| 9.6 Publish/unpublish | 268 | FAILING | PASS |
| 9.7 Categories assignment | 320 | PASSING | PASS |

### Execution Commands

```bash
# Pre-requisite: Start dev server
npm run dev

# Run all product tests
DISABLE_EMAILS=true npx playwright test tests/e2e/vendor-onboarding/09-product-management.spec.ts --reporter=list

# Run with headed browser for visual debugging
DISABLE_EMAILS=true npx playwright test tests/e2e/vendor-onboarding/09-product-management.spec.ts --headed

# Run single failing test
DISABLE_EMAILS=true npx playwright test 09-product-management.spec.ts:55 --debug

# Run with trace for failure analysis
DISABLE_EMAILS=true npx playwright test 09-product-management.spec.ts --trace=retain-on-failure

# View trace
npx playwright show-trace test-results/*/trace.zip
```

### Test Execution Procedure

1. **Ensure clean state**:
   ```bash
   npm run dev
   # Wait for server to be ready
   ```

2. **Run full suite**:
   ```bash
   DISABLE_EMAILS=true npx playwright test 09-product-management.spec.ts --reporter=list
   ```

3. **For each failure**:
   - Note the test name and line number
   - Run in debug mode: `--debug`
   - Identify the failing assertion
   - Trace back to component/API issue
   - Fix the issue
   - Re-run the single test
   - Re-run full suite

4. **Document results**:
   - Screenshot of passing tests
   - List any remaining issues

### Common Failure Patterns

#### "Timeout waiting for selector"
- Element doesn't exist or has wrong selector
- Solution: Check component matches test selector

#### "Expected visible but was hidden"
- Element exists but not rendered
- Solution: Check conditional rendering logic

#### "Expected text but got different"
- Data not loaded or wrong data
- Solution: Check API response and state updates

#### "API returned error"
- Backend issue or test data problem
- Solution: Check server logs, verify test data setup

### Failure Resolution Workflow

```
1. Run test in debug mode
   └── npx playwright test [file]:[line] --debug

2. Pause at failure point
   └── Use Playwright Inspector

3. Identify issue
   ├── Element not found → Check selector
   ├── Wrong data → Check API/state
   ├── Action failed → Check handlers
   └── Timing issue → Add wait

4. Fix in component/API

5. Re-run single test

6. Re-run full suite to verify no regression
```

## Acceptance Criteria

- [ ] All 7 tests pass (100% pass rate)
- [ ] No flaky tests (run 3 times without failure)
- [ ] Test execution time < 90 seconds total
- [ ] No test modifications needed (unless fixing broken selectors)
- [ ] Clean console output (no unexpected errors)

## Evidence Required

Screenshot or log output showing:
```
Running 7 tests using 1 worker

  ✓ Test 9.1: Access product management (tier 2+ only)
  ✓ Test 9.2: View product list for vendor
  ✓ Test 9.3: Add new product with all fields
  ✓ Test 9.4: Edit existing product details
  ✓ Test 9.5: Delete product with confirmation
  ✓ Test 9.6: Publish/unpublish product toggle
  ✓ Test 9.7: Product categories assignment

  7 passed (XXs)
```

## Related Files

- `tests/e2e/vendor-onboarding/09-product-management.spec.ts`
- `tests/e2e/helpers/seed-api-helpers.ts`
- All implementation files from previous tasks
