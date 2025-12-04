---
description: Standalone task execution without Beads dependency
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Standalone Task Execution

## Overview

Execute a specific task using structured workflow phases WITHOUT requiring Beads issue tracking. This is a simplified version of execute-task-orchestrated.md for users who don't use Beads.

**When to use this file:**
- Beads is not installed or disabled (config.yml → beads.enabled: false)
- You want to execute a task directly from a task file
- You're prototyping or working outside the full Agent OS workflow

## Prerequisites

- Task file: `tasks/task-{TASK_ID}.md` must exist
- Optional: TDD state tracking enabled for test-first enforcement

## Quick Start

```
Execute task: [TASK_ID]
Using: execute-task-standalone.md
```

<process_flow>

<step number="1" name="load_task">

### Step 1: Load Task Specification

Load the task details from the markdown file.

<task_loading>
  INPUT: User provides TASK_ID

  IF tasks/task-${TASK_ID}.md exists:
    READ: tasks/task-${TASK_ID}.md
    EXTRACT:
      - Objective
      - Acceptance Criteria
      - Implementation Details
      - Testing Requirements
      - Dependencies (informational only)
      - Deliverables
  ELSE:
    ERROR: "❌ Task detail file not found: tasks/task-${TASK_ID}.md"
    SUGGESTION: "Create the task file or use execute-tasks.md to generate from tasks.md"
    HALT

  CONFIRM: "📋 Task loaded: ${TASK_TITLE}"
</task_loading>

</step>

<step number="2" name="tdd_state_init">

### Step 2: Initialize TDD State (Optional)

If TDD enforcement is enabled, initialize state tracking.

<tdd_check>
  IF config.yml → tdd_enforcement.enabled = true:
    LOAD: TDD State Manager

    IF state exists for ${TASK_ID}:
      LOAD: Existing state
      DISPLAY: Current phase: ${current_phase}
    ELSE:
      CREATE: Initial state (INIT phase)

    PROCEED: With TDD state tracking
  ELSE:
    SKIP: TDD state tracking
    PROCEED: Without phase enforcement
</tdd_check>

</step>

<step number="3" name="test_design_phase">

### Step 3: Test Design Phase

Design and write tests before implementation.

<test_design>
  LOAD_INSTRUCTION: instructions/agents/test-architect.md

  TASKS:
    1. Analyze acceptance criteria
    2. Identify test scenarios (happy path, edge cases, error cases)
    3. Design test structure
    4. Write test files

  DELIVERABLES:
    - Test files created in appropriate location
    - All tests initially failing (RED state)

  IF tdd_enabled:
    UPDATE_STATE: INIT → RED
    RECORD_METRICS: tests_written, tests_failing
</test_design>

</step>

<step number="4" name="implementation_phase">

### Step 4: Implementation Phase

Write code to pass the tests.

<implementation>
  IF tdd_enabled:
    VALIDATE: Current phase must be RED
    IF phase is not RED:
      WARN: "⚠️  Write failing tests first before implementing"
      IF enforcement_level = "strict":
        HALT
      ELSE:
        PROCEED with warning

  LOAD_INSTRUCTION: instructions/agents/implementation-specialist.md

  TASKS:
    1. Analyze test requirements
    2. Write minimal implementation to pass tests
    3. Run tests to verify
    4. Iterate until all tests pass

  DELIVERABLES:
    - Implementation files
    - All tests passing (GREEN state)

  IF tdd_enabled:
    UPDATE_STATE: RED → GREEN
    RECORD_METRICS: tests_passing, implementation_loc
</implementation>

</step>

<step number="5" name="quality_phase">

### Step 5: Quality Assurance Phase

Review code quality and standards compliance.

<quality_review>
  LOAD_INSTRUCTION: instructions/agents/quality-assurance.md

  CHECKS:
    - Code style compliance
    - Documentation completeness
    - Error handling adequacy
    - Performance considerations

  VALIDATION:
    - Hook validators pass on all modified files
    - No critical lint errors
    - Type checking passes (if applicable)
</quality_review>

</step>

<step number="6" name="security_phase">

### Step 6: Security Review Phase

Scan for security vulnerabilities.

<security_review>
  LOAD_INSTRUCTION: instructions/agents/security-sentinel.md

  SCAN:
    - OWASP Top 10 vulnerabilities
    - Hardcoded credentials
    - SQL injection risks
    - XSS vulnerabilities
    - Dependency vulnerabilities

  IF P1 (CRITICAL) findings:
    ERROR: "❌ Critical security findings must be addressed"
    LIST: Findings with fix guidance
    HALT: Until P1 findings resolved

  IF P2-P4 findings:
    WARN: List findings for review
    CONTINUE: Allow completion with warnings
</security_review>

</step>

<step number="7" name="integration_phase">

### Step 7: Integration Phase

Verify integration with existing code.

<integration>
  LOAD_INSTRUCTION: instructions/agents/integration-coordinator.md

  CHECKS:
    - API contracts honored
    - Database schema changes applied
    - Configuration updates complete
    - Dependencies installed

  VALIDATION:
    - Integration tests pass
    - No breaking changes to existing functionality
</integration>

</step>

<step number="8" name="verification_phase">

### Step 8: Deliverable Verification

Verify all deliverables are complete.

<verification>
  CHECK acceptance criteria from task file:

  FOR each criterion:
    VERIFY: Criterion met
    EVIDENCE: How it was verified (test name, manual check, etc.)

  CHECK deliverables:
    FOR each expected file:
      VERIFY: File exists (Use Read tool)
      VERIFY: File contains expected content

  IF any criterion not met:
    ERROR: "❌ Incomplete deliverables"
    LIST: Missing items
    HALT

  IF all criteria met:
    CONFIRM: "✅ All acceptance criteria verified"
</verification>

</step>

<step number="9" name="complete_task">

### Step 9: Mark Task Complete

Finalize task completion.

<completion>
  IF tdd_enabled:
    UPDATE_STATE: → COMPLETE

  UPDATE task file status:
    EDIT: tasks/task-${TASK_ID}.md
    SET: status = "completed"
    ADD: completion_date = [current timestamp]

  IF tasks.md exists:
    UPDATE: Master task list with completion status

  SUMMARY:
    "✅ Task ${TASK_ID} completed successfully

    Deliverables:
    - [List created/modified files]

    Tests:
    - [X] tests written, [Y] passing

    Security:
    - [No critical findings / Findings addressed]

    Next suggested task: [If known from dependencies]"
</completion>

</step>

</process_flow>

## Configuration

This standalone execution respects the following config.yml settings:

```yaml
# TDD Enforcement (optional)
tdd_enforcement:
  enabled: true/false
  enforcement_level: strict/standard/relaxed

# Quality Hooks
quality_hooks:
  enabled: true
  fail_on_error: true/false

# Security
compound_engineering:
  security:
    block_on_p1: true
```

## Differences from Orchestrated Execution

| Aspect | execute-task-orchestrated.md | execute-task-standalone.md |
|--------|-----------------------------|-----------------------------|
| Beads integration | Required (with fallback) | Not used |
| Task selection | From Beads ready queue | Direct task ID input |
| Dependency tracking | Via Beads dependencies | Informational only |
| Status updates | Synced to Beads | Local task file only |
| Complexity | Full orchestration | Simplified flow |

## See Also

- [execute-task-orchestrated.md](execute-task-orchestrated.md) - Full orchestrated execution with Beads
- [execute-tasks.md](execute-tasks.md) - Bulk task execution
- [../agents/test-architect.md](../agents/test-architect.md) - Test design guidance
- [../agents/implementation-specialist.md](../agents/implementation-specialist.md) - Implementation guidance
- [../../tdd-state/README.md](../../tdd-state/README.md) - TDD state tracking
