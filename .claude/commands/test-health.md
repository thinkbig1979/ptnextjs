---
description: Display E2E test suite health dashboard showing tier breakdown, recent run results, quarantine status, and recommendations.
globs:
alwaysApply: false
version: 1.0.0
---

# Test Health Dashboard

Show current state of the E2E test suite without running tests.

## Usage

```
/test-health
/test-health --verbose
```

## Step 1: Load Test Inventory

```bash
# Check for test inventory
if [[ -f tests/e2e/test-inventory.ts ]]; then
  npx tsx tests/e2e/test-inventory.ts --list
else
  echo "NO_INVENTORY"
fi
```

If NO_INVENTORY:
  - Count test files manually
  - Suggest running inventory generator

## Step 2: Check Recent Results

```bash
# Find recent test results
ls -lt test-results/*.json 2>/dev/null | head -5
ls -lt playwright-report/*.json 2>/dev/null | head -5
```

Parse most recent results for pass/fail counts.

## Step 3: Check Quarantine Status

```bash
# Get quarantine count from inventory
npx tsx -e "
  const inv = require('./tests/e2e/test-inventory');
  console.log('Quarantined:', inv.TEST_TIERS.quarantine.length);
  inv.TEST_TIERS.quarantine.forEach(t => console.log('  -', t));
"
```

## Step 4: Check Repair Session

```bash
# Check for active repair session
if [[ -f .agent-os/e2e-repair/session-state.json ]]; then
  cat .agent-os/e2e-repair/session-state.json
fi
```

## Step 5: Generate Dashboard

Output format:

```
================================================================================
                         E2E TEST SUITE HEALTH DASHBOARD
================================================================================

INVENTORY
---------
  Smoke:        4 tests   (~2 min)    Critical path
  Core:        26 tests   (~20 min)   Main features  
  Regression:  44 tests   (~45 min)   Edge cases
  Quarantine:   3 tests   (excluded)  Known issues
  ────────────────────────────────────────────────
  Total:       74 tests   (~67 min)   Full suite

RECENT RUNS
-----------
  Last smoke:       PASS  4/4   (2 hours ago)
  Last core:        WARN  24/26 (1 day ago)
  Last full:        FAIL  65/77 (3 days ago)

QUARANTINE STATUS
-----------------
  flaky-websocket.spec.ts      BEADS-123: Intermittent timeout
  broken-export.spec.ts        BEADS-456: Blocked by app bug
  debug-form.spec.ts           No tracking issue (!)

ACTIVE REPAIR SESSION
---------------------
  Phase: fix (RC-2)
  Progress: 83% sample pass rate
  Root causes fixed: 1/3
  Last activity: 30 minutes ago

RECOMMENDATIONS
---------------
  1. Run smoke tests (last run > 2 hours ago)
  2. Investigate 2 core test failures from last run
  3. Add tracking issue for debug-form.spec.ts in quarantine
  4. Consider promoting auth-flow.spec.ts to smoke (100% pass rate)
  5. Resume active repair session: /fix-e2e-large --resume

================================================================================
```

## Verbose Mode (--verbose)

With --verbose flag, also show:

### Test File Details

```
SMOKE TESTS (4)
---------------
  vendor-registration.spec.ts    Last: PASS   Avg: 12s
  vendor-login.spec.ts           Last: PASS   Avg: 8s
  dashboard-loads.spec.ts        Last: PASS   Avg: 15s
  basic-navigation.spec.ts       Last: PASS   Avg: 10s

CORE TESTS (26)
---------------
  tier-upgrade.spec.ts           Last: PASS   Avg: 45s
  location-management.spec.ts    Last: FAIL   Avg: 38s  (!)
  ...
```

### Feature Group Coverage

```
FEATURE GROUPS
--------------
  auth:        5 tests   Last: PASS
  dashboard:   7 tests   Last: PASS
  search:     10 tests   Last: WARN (1 failure)
  locations:  13 tests   Last: FAIL (3 failures)
```

### Flakiness Report

```
FLAKINESS (last 7 days)
-----------------------
  flaky-websocket.spec.ts    3/5 runs passed (60%)
  search-filters.spec.ts     4/5 runs passed (80%)
```

## Recommendations Logic

Generate recommendations based on:

1. Time since last run:
   - Smoke > 2 hours: "Run smoke tests"
   - Core > 1 day: "Run core tests before PR"
   - Full > 7 days: "Run full suite for health check"

2. Failure patterns:
   - Same test failing repeatedly: "Investigate {test}"
   - Feature group has failures: "Run test:e2e:{feature} to isolate"

3. Quarantine issues:
   - No tracking issue: "Add tracking issue for {test}"
   - In quarantine > 30 days: "Review or remove {test}"

4. Tier assignments:
   - 100% pass rate, fast, in core: "Consider promoting to smoke"
   - Slow test in smoke: "Consider demoting to core"

5. Active sessions:
   - Repair session exists: "Resume with /fix-e2e-large --resume"

## No Test Results Available

If no recent test results found:

```
================================================================================
                         E2E TEST SUITE HEALTH DASHBOARD
================================================================================

INVENTORY
---------
  Smoke:        4 tests
  Core:        26 tests
  Regression:  44 tests
  Quarantine:   3 tests
  ────────────────────────────────────────────────
  Total:       74 tests

RECENT RUNS
-----------
  No recent test results found.
  
  Run tests to populate:
    npm run test:e2e:smoke   # Quick health check
    npm run test:e2e:core    # Main features
    npm run test:e2e:full    # Complete suite

RECOMMENDATIONS
---------------
  1. Run smoke tests to establish baseline health

================================================================================
```

## Exit Codes

- 0: Dashboard displayed successfully
- 1: No test inventory found (suggest generation)
- 2: Server not running (for health check context)
