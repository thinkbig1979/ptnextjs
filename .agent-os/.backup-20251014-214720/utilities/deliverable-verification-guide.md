---
description: Guide for orchestrators to track and verify subagent deliverables
version: 1.0
encoding: UTF-8
---

# Deliverable Verification Guide

## Purpose

This guide ensures orchestrators **VERIFY** that subagents actually deliver all required files and implementation before marking tasks complete. This prevents the critical issue of tasks being marked complete when files are missing.

## Critical Problem Solved

**Previous Issue**: Orchestrators delegated work to subagents, received confirmation, and marked tasks complete WITHOUT verifying files were actually created/modified.

**Solution**: Mandatory deliverable tracking and verification at every step.

---

## Verification Workflow

### Phase 1: Pre-Delegation - Deliverable Planning

**BEFORE delegating to any subagent**, the orchestrator MUST:

#### Step 1: Analyze Task Requirements
```markdown
**Task**: [TASK_ID] [TASK_DESCRIPTION]

**Expected Deliverables Analysis**:
1. Review task acceptance criteria
2. Review task detail file (tasks/task-*.md)
3. Identify ALL files that must be created or modified
4. List specific content requirements for each file
5. Document verification criteria
```

#### Step 2: Create Deliverable Manifest
```markdown
## Deliverable Manifest for Task [TASK_ID]

### Files to be Created:
- [ ] `path/to/new/file1.ext`
  - Purpose: [DESCRIPTION]
  - Required Content: [KEY_REQUIREMENTS]
  - Verification: [HOW_TO_VERIFY]

- [ ] `path/to/new/file2.ext`
  - Purpose: [DESCRIPTION]
  - Required Content: [KEY_REQUIREMENTS]
  - Verification: [HOW_TO_VERIFY]

### Files to be Modified:
- [ ] `path/to/existing/file.ext`
  - Changes Required: [SPECIFIC_CHANGES]
  - Verification: [HOW_TO_VERIFY]

### Tests to be Created:
- [ ] `path/to/test/file.test.ext`
  - Test Coverage: [SCENARIOS]
  - Must Pass: Yes
  - Verification: Run test suite

### Acceptance Criteria Checklist:
- [ ] Criterion 1: [DESCRIPTION]
  - Evidence Required: [TYPE_OF_EVIDENCE]
  - Verification: [HOW_TO_CHECK]

- [ ] Criterion 2: [DESCRIPTION]
  - Evidence Required: [TYPE_OF_EVIDENCE]
  - Verification: [HOW_TO_CHECK]

### Quality Gates:
- [ ] All tests passing
- [ ] Code quality standards met
- [ ] Security requirements satisfied
- [ ] Documentation complete
```

#### Step 3: Share Manifest with Subagents
```markdown
**TO ALL SUBAGENTS**:

You are responsible for delivering the following files and meeting these criteria.
This is NOT optional - task completion will be BLOCKED until all deliverables are verified.

[PASTE DELIVERABLE MANIFEST]

**IMPORTANT**:
- Report when each deliverable is completed
- Provide file paths for verification
- Include evidence for acceptance criteria
- Do NOT report task complete until ALL items are delivered
```

---

### Phase 2: During Execution - Progress Tracking

**WHILE subagents are working**, the orchestrator MUST:

#### Monitor Deliverable Progress
```markdown
## Progress Tracking

**Updates from Subagents**:

[TIMESTAMP] - [SUBAGENT_NAME]:
- Completed: `path/to/file1.ext` ✓
- In Progress: `path/to/file2.ext`
- Not Started: `path/to/file3.ext`

[TIMESTAMP] - [SUBAGENT_NAME]:
- Completed: `path/to/file2.ext` ✓
- Issue: [DESCRIPTION_OF_ANY_PROBLEMS]
```

#### Update Manifest in Real-Time
```markdown
Update the deliverable manifest as subagents report completion:
- [x] `path/to/file1.ext` - ✅ Reported complete by [SUBAGENT]
- [x] `path/to/file2.ext` - ✅ Reported complete by [SUBAGENT]
- [ ] `path/to/file3.ext` - ⏳ In progress
```

#### Request Proof During Execution
```markdown
If a subagent reports a file is complete, request immediate verification:

"Subagent [NAME]: You reported `path/to/file.ext` is complete.
Please provide:
1. Confirmation the file exists at that exact path
2. Brief description of what you implemented
3. How you verified it works"
```

---

### Phase 3: Post-Execution - Mandatory Verification

**AFTER subagents report completion**, the orchestrator MUST perform comprehensive verification **BEFORE marking task complete**.

#### Verification Step 1: File Existence Check

```markdown
## File Existence Verification

**ACTION**: Use Read or Glob tool to verify EVERY file in the manifest exists.

**Process**:
1. For each "Files to be Created" item:
   - Use Read tool to check file exists: Read `path/to/file.ext`
   - ✅ EXISTS: Mark verified
   - ❌ MISSING: BLOCK task completion, request subagent create it

2. For each "Files to be Modified" item:
   - Use Read tool to check file exists and has changes
   - Use git diff or Grep to verify expected changes present
   - ✅ VERIFIED: Mark verified
   - ❌ MISSING CHANGES: BLOCK task completion, request updates

**Example**:
```

**Check**: Does `src/components/LoginForm.tsx` exist?
- Action: Read `src/components/LoginForm.tsx`
- Result: ✅ File exists (1247 lines)

**Check**: Does `src/components/__tests__/LoginForm.test.tsx` exist?
- Action: Read `src/components/__tests__/LoginForm.test.tsx`
- Result: ❌ FILE NOT FOUND

**Status**: VERIFICATION FAILED - Test file missing
**Action**: BLOCK task completion, request test-specialist create missing test file
```
```

#### Verification Step 2: Content Validation

```markdown
## Content Verification

**ACTION**: For critical files, verify content matches requirements.

**Process**:
1. Read key implementation files
2. Check for required functions/components/exports
3. Verify implementation approach matches spec
4. Validate error handling and edge cases present

**Example**:
```

**File**: `src/components/LoginForm.tsx`

**Requirements Check**:
- [x] LoginForm component exported
- [x] Email and password fields present
- [x] Form validation implemented
- [x] Submit handler present
- [ ] Error message display - NOT FOUND
- [x] Loading state handling

**Status**: PARTIAL - Missing error message display
**Action**: Request implementation-specialist add error message display
```
```

#### Verification Step 3: Test Verification

```markdown
## Test Verification

**ACTION**: Verify all tests exist and pass.

**Process**:
1. Check test files exist (from manifest)
2. Use test-runner agent to execute tests
3. Verify 100% of tests pass
4. Check test coverage meets minimum threshold (80%+)

**Example**:
```

**Test File**: `src/components/__tests__/LoginForm.test.tsx`
- Status: ✅ Exists
- Tests: 12 total
- Passing: 10
- Failing: 2
- Coverage: 76%

**Failing Tests**:
1. "displays error message on invalid email" - FAIL
2. "handles network error gracefully" - FAIL

**Status**: VERIFICATION FAILED - Tests not passing
**Action**: BLOCK task completion, request test-specialist fix failing tests
```
```

#### Verification Step 4: Acceptance Criteria Evidence

```markdown
## Acceptance Criteria Verification

**ACTION**: Verify each acceptance criterion has evidence.

**Process**:
For each criterion in the task detail file:
1. Check if criterion is objectively verifiable
2. Request evidence from subagents if not already provided
3. Validate evidence proves criterion is met
4. Document verification in manifest

**Example**:
```

**Criterion 1**: "User can log in with valid credentials"
- Evidence Type: Manual testing + automated tests
- Evidence Provided:
  * Test: `test_successful_login` - PASSING ✅
  * Manual: Screenshot of successful login flow ✅
- Verification: ✅ VERIFIED

**Criterion 2**: "Error message displays for invalid credentials"
- Evidence Type: Automated test + manual verification
- Evidence Provided:
  * Test: `test_invalid_credentials_error` - FAILING ❌
  * Manual: No screenshot provided ❌
- Verification: ❌ NOT VERIFIED

**Status**: VERIFICATION FAILED - Criterion 2 not verified
**Action**: BLOCK task completion, request evidence for Criterion 2
```
```

#### Verification Step 5: Integration Check

```markdown
## Integration Verification

**ACTION**: Verify all components work together.

**Process**:
1. Check integration points between subagent deliverables
2. Verify APIs match between frontend/backend
3. Ensure no missing dependencies or imports
4. Validate data flow works end-to-end

**Example**:
```

**Integration Point**: LoginForm component → Auth API

**Checks**:
- [x] LoginForm imports auth service
- [x] Auth service endpoint exists
- [x] API contract matches (email, password parameters)
- [ ] Error response handling - MISSING
- [x] Success response handling

**Status**: PARTIAL - Missing error response handling
**Action**: Request implementation-specialist add error response handling
```
```

---

### Phase 4: Completion Decision

**AFTER all verification steps**, the orchestrator makes the final decision:

#### Decision Tree

```markdown
## Task Completion Decision

**Verification Results Summary**:
- File Existence: [PASSED/FAILED] - [X/Y files verified]
- Content Validation: [PASSED/FAILED] - [X/Y requirements met]
- Test Verification: [PASSED/FAILED] - [X/Y tests passing]
- Acceptance Criteria: [PASSED/FAILED] - [X/Y criteria verified]
- Integration: [PASSED/FAILED] - [X/Y integration points working]

**Overall Status**: [VERIFIED/BLOCKED]

**Decision**:

IF ALL verification steps PASSED:
  ✅ **APPROVE TASK COMPLETION**
  - Mark task as complete in tasks.md
  - Update task detail file with completion notes
  - Document verification results
  - Proceed to next task

ELSE IF ANY verification step FAILED:
  ❌ **BLOCK TASK COMPLETION**
  - DO NOT mark task complete
  - Document specific failures
  - Request subagents address failures
  - Re-run verification after fixes
  - Only approve after ALL verifications pass
```

#### Completion Report Template

```markdown
## Task [TASK_ID] Completion Verification Report

**Date**: [TIMESTAMP]
**Orchestrator**: task-orchestrator
**Task**: [TASK_DESCRIPTION]

### Deliverables Verified:
✅ Files Created: [COUNT]
✅ Files Modified: [COUNT]
✅ Tests Created: [COUNT]
✅ Tests Passing: [COUNT/TOTAL] (100%)
✅ Acceptance Criteria Met: [COUNT/TOTAL] (100%)
✅ Integration Points Verified: [COUNT/TOTAL] (100%)

### Quality Gates:
✅ All tests passing
✅ Code quality standards met
✅ Security requirements satisfied
✅ Documentation complete

### Verification Evidence:
- File existence: Verified via Read tool on [COUNT] files
- Test execution: Verified via test-runner agent
- Content validation: Reviewed [COUNT] key implementation files
- Integration: Verified [COUNT] integration points

### Approval:
✅ **TASK APPROVED FOR COMPLETION**

All verification requirements met. Task is complete and ready for integration.

---

**Signed**: task-orchestrator
**Timestamp**: [TIMESTAMP]
```

---

## Blocking Scenarios and Remediation

### Scenario 1: Missing Files

**Symptom**: Read tool returns "file not found" for expected deliverable

**Response**:
```markdown
❌ **VERIFICATION FAILED: Missing Files**

**Missing Files**:
- `path/to/file1.ext` - Expected from [SUBAGENT_NAME]
- `path/to/file2.ext` - Expected from [SUBAGENT_NAME]

**Action Required**:
TO [SUBAGENT_NAME]: Your task delegation included creating these files,
but they do not exist at the specified paths. Please:
1. Create the missing files immediately
2. Confirm file paths after creation
3. Report completion for re-verification

**Task Status**: BLOCKED - Cannot proceed until files exist
```

### Scenario 2: Tests Failing

**Symptom**: Test execution shows failures

**Response**:
```markdown
❌ **VERIFICATION FAILED: Test Failures**

**Failed Tests**: [COUNT]
1. `test_name_1` - [ERROR_MESSAGE]
2. `test_name_2` - [ERROR_MESSAGE]

**Action Required**:
TO [TEST_SPECIALIST]: Tests are failing. Please:
1. Fix the failing tests
2. Re-run test suite until 100% passing
3. Report completion for re-verification

TO [IMPLEMENTATION_SPECIALIST]: If test failures indicate implementation issues:
1. Review failed test scenarios
2. Fix implementation to make tests pass
3. Coordinate with test-specialist

**Task Status**: BLOCKED - Cannot complete until all tests pass
```

### Scenario 3: Acceptance Criteria Without Evidence

**Symptom**: Criterion states functionality but no proof provided

**Response**:
```markdown
❌ **VERIFICATION FAILED: Missing Evidence**

**Unverified Criteria**:
- Criterion #2: "Error messages display properly"
  - Required Evidence: Screenshot or automated test
  - Provided Evidence: None

**Action Required**:
TO ALL SUBAGENTS: Please provide evidence for unverified criteria:
1. Run manual testing and provide screenshots, OR
2. Create automated tests that verify the criteria
3. Submit evidence for review

**Task Status**: BLOCKED - Cannot complete without acceptance criteria evidence
```

### Scenario 4: Integration Issues

**Symptom**: Components don't work together properly

**Response**:
```markdown
❌ **VERIFICATION FAILED: Integration Issues**

**Integration Problems**:
- Frontend component expects API endpoint `/auth/login`
- Backend implemented endpoint `/api/auth/login` (mismatch)

**Action Required**:
TO [FRONTEND_SPECIALIST] and [BACKEND_SPECIALIST]:
Your implementations have mismatched integration points. Please:
1. Coordinate on correct API endpoint path
2. Update either frontend or backend to match
3. Verify integration works end-to-end
4. Report completion for re-verification

**Task Status**: BLOCKED - Cannot complete with integration failures
```

---

## Orchestrator Responsibilities

### The orchestrator MUST:

1. **Create deliverable manifest** before delegation
2. **Track progress** during execution
3. **Verify deliverables** after completion
4. **Block task completion** if verification fails
5. **Request fixes** for failed verifications
6. **Re-verify** after fixes applied
7. **Document verification** in completion report

### The orchestrator MUST NOT:

1. ❌ Mark task complete without verification
2. ❌ Assume files exist because subagent said so
3. ❌ Skip verification steps to save time
4. ❌ Accept "it works on my machine" without proof
5. ❌ Trust test results without seeing execution
6. ❌ Approve tasks with partial deliverables
7. ❌ Skip integration verification

---

## Verification Checklist for Orchestrators

Use this checklist for EVERY task:

```markdown
## Pre-Delegation:
- [ ] Analyzed task requirements thoroughly
- [ ] Created complete deliverable manifest
- [ ] Identified all files to be created/modified
- [ ] Listed all acceptance criteria with evidence requirements
- [ ] Shared manifest with subagents

## During Execution:
- [ ] Monitored subagent progress regularly
- [ ] Updated manifest as work completed
- [ ] Requested clarification for unclear updates
- [ ] Tracked any reported issues

## Post-Execution:
- [ ] Verified ALL files in manifest exist (using Read/Glob)
- [ ] Validated content of key implementation files
- [ ] Verified ALL tests exist
- [ ] Confirmed ALL tests pass (using test-runner)
- [ ] Checked test coverage meets minimum threshold
- [ ] Verified acceptance criteria with evidence
- [ ] Validated integration points work
- [ ] Checked quality gates satisfied

## Completion Decision:
- [ ] All verification steps passed
- [ ] Created completion verification report
- [ ] Documented all verified deliverables
- [ ] Marked task complete in tasks.md
- [ ] Updated task detail file

## If Verification Failed:
- [ ] Documented specific failures
- [ ] Requested subagents address issues
- [ ] Blocked task completion
- [ ] Tracked remediation progress
- [ ] Re-ran verification after fixes
```

---

## Integration with Orchestrated Execution

This verification guide integrates into execute-task-orchestrated.md at these points:

1. **Step 1 (Orchestration Setup)**: Create deliverable manifest
2. **Step 2 (Parallel Execution)**: Share manifest, track progress
3. **Step 3 (Integration and Validation)**: Perform comprehensive verification
4. **Step 4 (Task Completion)**: Only complete if verification passes

See execute-task-orchestrated.md for the updated workflow.

---

## Success Metrics

**Before Deliverable Verification**:
- Tasks marked complete with missing files
- No validation of subagent work
- Acceptance criteria unverified

**After Deliverable Verification**:
- ✅ 100% of files verified to exist before task completion
- ✅ 100% of tests verified to pass before task completion
- ✅ 100% of acceptance criteria verified with evidence
- ✅ 0% tasks marked complete with missing deliverables

**This verification system ensures orchestrators cannot mark tasks complete until they have proof that all work was actually delivered and functions correctly.**
