# Bug Fix Report: .agent-os-d2f5

## Issue Summary
**Beads ID:** .agent-os-d2f5
**Type:** Bug (P2)
**Priority:** P2 (Important)
**Discovered From:** .agent-os-696c (tdd-017)

## Problem Description
When `CLAUDE_PROJECT_DIR` points to an `.agent-os` directory, the state file path was being doubled (e.g., `/path/.agent-os/.agent-os/tdd-state`). This occurred when Agent OS itself was the project, where `CLAUDE_PROJECT_DIR` would be set to `~/.agent-os`, causing incorrect path construction.

### Expected Behavior
- When `CLAUDE_PROJECT_DIR=/home/user/.agent-os`
- State path should be: `/home/user/.agent-os/tdd-state/task-123.json`
- NOT: `/home/user/.agent-os/.agent-os/tdd-state/task-123.json`

## Root Cause
The original code in `hooks/tdd-validator.sh` (line 17) always appended `.agent-os` to the base directory:

```bash
TDD_STATE_DIR="${CLAUDE_PROJECT_DIR:-.}/.agent-os/tdd-state"
```

This didn't account for the case where `CLAUDE_PROJECT_DIR` already ended with `.agent-os`.

## Solution Implemented

### Code Changes
**File:** `/home/edwin/.agent-os/hooks/tdd-validator.sh`
**Lines:** 16-27

```bash
# TDD state directory - avoid doubling .agent-os when CLAUDE_PROJECT_DIR already ends with it
# This handles the case where Agent OS itself is the project (CLAUDE_PROJECT_DIR=~/.agent-os)
BASE_DIR="${CLAUDE_PROJECT_DIR:-.}"
if [[ "$BASE_DIR" == */.agent-os ]] || [[ "$BASE_DIR" == *.agent-os ]]; then
    # CLAUDE_PROJECT_DIR already points to .agent-os directory
    TDD_STATE_DIR="${BASE_DIR}/tdd-state"
    CONFIG_FILE="${BASE_DIR}/config.yml"
else
    # CLAUDE_PROJECT_DIR points to project root, append .agent-os
    TDD_STATE_DIR="${BASE_DIR}/.agent-os/tdd-state"
    CONFIG_FILE="${BASE_DIR}/.agent-os/config.yml"
fi
```

### Fix Logic
1. Extract `BASE_DIR` from `CLAUDE_PROJECT_DIR` (defaults to `.` if not set)
2. Check if `BASE_DIR` ends with `.agent-os` (handles both `/.agent-os` and `.agent-os` patterns)
3. If it ends with `.agent-os`: Don't append another `.agent-os`, use `${BASE_DIR}/tdd-state`
4. If it doesn't end with `.agent-os`: Append `.agent-os`, use `${BASE_DIR}/.agent-os/tdd-state`

## Test Coverage

### New Test Files Created

#### 1. Path Construction Test (`hooks/tests/test-path-construction.sh`)
Comprehensive test suite covering:
- Test 1: CLAUDE_PROJECT_DIR ends with `.agent-os` (absolute path)
- Test 2: CLAUDE_PROJECT_DIR ends with `.agent-os` (HOME shortcut)
- Test 3: CLAUDE_PROJECT_DIR points to regular project (should append `.agent-os`)
- Test 4: CLAUDE_PROJECT_DIR not set (defaults to current directory)
- Test 5: Edge case - directory name contains `.agent-os` but doesn't end with it

**Result:** ✅ All 5 tests PASSED

#### 2. Real-World Scenario Test (`hooks/tests/test-real-world-scenario.sh`)
Simulates the actual bug scenario:
- Sets `CLAUDE_PROJECT_DIR=~/.agent-os` (Agent OS as the project)
- Verifies no double `.agent-os` in paths
- Validates state file path construction
- Confirms expected behavior matches actual behavior

**Result:** ✅ All checks PASSED

### Regression Testing
Ran existing integration tests to ensure no regressions:

**Test Suite:** `tests/orchestration/phase-2-integration.test.js`
**Result:** ✅ All 14 tests PASSED (0.366s)

Test categories:
- Complete RED → GREEN → REFACTOR Workflow (2 tests)
- RED Phase Validation Scenarios (2 tests)
- GREEN Phase Transition Scenarios (2 tests)
- REFACTOR Phase Safety (2 tests)
- TDD Verification in Step 3 (3 tests)
- Enforcement Level Behaviors (3 tests)

## Verification Results

### Path Construction Verification
| Scenario | CLAUDE_PROJECT_DIR | Expected Path | Actual Path | Status |
|----------|-------------------|---------------|-------------|--------|
| Agent OS as project | `/home/user/.agent-os` | `/home/user/.agent-os/tdd-state` | `/home/user/.agent-os/tdd-state` | ✅ PASS |
| Agent OS with HOME | `~/.agent-os` | `~/.agent-os/tdd-state` | `~/.agent-os/tdd-state` | ✅ PASS |
| Regular project | `/home/user/my-project` | `/home/user/my-project/.agent-os/tdd-state` | `/home/user/my-project/.agent-os/tdd-state` | ✅ PASS |
| Not set (default) | (unset) | `./.agent-os/tdd-state` | `./.agent-os/tdd-state` | ✅ PASS |
| Edge case | `/home/user/.agent-os-backup/project` | `/home/user/.agent-os-backup/project/.agent-os/tdd-state` | `/home/user/.agent-os-backup/project/.agent-os/tdd-state` | ✅ PASS |

### Integration Test Results
- **Total Tests:** 14
- **Passed:** 14
- **Failed:** 0
- **Duration:** 0.366s
- **Status:** ✅ NO REGRESSIONS

## Files Modified

1. **`/home/edwin/.agent-os/hooks/tdd-validator.sh`** (lines 16-27)
   - Added conditional path construction logic
   - Detects if `CLAUDE_PROJECT_DIR` ends with `.agent-os`
   - Avoids doubling `.agent-os` directory

## Files Created

1. **`/home/edwin/.agent-os/hooks/tests/test-path-construction.sh`**
   - Comprehensive path construction test suite
   - 5 test scenarios covering all edge cases

2. **`/home/edwin/.agent-os/hooks/tests/test-real-world-scenario.sh`**
   - Real-world scenario validation
   - Simulates Agent OS as the project

3. **`/home/edwin/.agent-os/hooks/tests/FIX-REPORT-d2f5.md`** (this file)
   - Complete documentation of the fix

## Impact Analysis

### Affected Scenarios
1. ✅ Agent OS working on itself (CLAUDE_PROJECT_DIR=~/.agent-os)
2. ✅ Regular projects using Agent OS (CLAUDE_PROJECT_DIR=/path/to/project)
3. ✅ Projects without CLAUDE_PROJECT_DIR set (defaults to current directory)

### Backward Compatibility
✅ **Fully backward compatible** - All existing tests pass without modification

### Performance Impact
- **Negligible** - Added one conditional check (bash pattern matching)
- Pattern matching in bash is O(1) for simple suffix checks
- No additional file I/O or external commands

## Conclusion

**Status:** ✅ **BUG FIXED AND VERIFIED**

The fix successfully addresses issue .agent-os-d2f5 by:
1. Detecting when `CLAUDE_PROJECT_DIR` already ends with `.agent-os`
2. Avoiding path doubling in all scenarios
3. Maintaining backward compatibility with existing behavior
4. Passing all test suites (new and existing)
5. Handling edge cases correctly

**No regressions detected.** The fix is safe to merge.

---

**Fix Date:** 2025-11-03
**Orchestrator:** task-orchestrator
**Verification:** All tests passing (19/19 tests)
