---
description: Rules to execute a task and its sub-tasks using Agent OS
globs:
alwaysApply: false
version: 2.0
encoding: UTF-8
---

# Task Execution Rules

## Overview

Execute a specific task along with its sub-tasks using intelligent orchestration with specialized subagents working in parallel.

<execution_routing>
  **AUTOMATIC ROUTING**: This file automatically routes to orchestrated parallel execution.

  **PRIMARY WORKFLOW**:
  ✅ Use @.agent-os/instructions/core/execute-task-orchestrated.md

  **BENEFITS**:
  - 60-80% faster task completion through parallel processing
  - Intelligent context optimization and distribution
  - Specialized agent coordination (testing, implementation, integration, quality, security, documentation)
  - Advanced error handling and recovery mechanisms
  - Comprehensive quality assurance and validation

  **ACTION REQUIRED**:
  IMMEDIATELY PROCEED to execute-task-orchestrated.md and follow those instructions.
  DO NOT use the legacy sequential workflow below unless orchestrated execution fails.
</execution_routing>

## ⚠️ Legacy Sequential Execution (Fallback Only)

**WARNING**: The following sequential workflow should ONLY be used if:
- Orchestrated execution encounters a blocking technical issue
- The task-orchestrator agent is unavailable
- Explicitly requested by the user

For normal operation, use execute-task-orchestrated.md as specified above.

<pre_flight_check>
  EXECUTE: @.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>


<process_flow>

<step number="1" name="task_understanding">

### Step 1: Task Understanding

Read the master tasks.md for overview, then load the detailed task file for comprehensive implementation requirements.

<task_analysis>
  <read_from_master_tasks_md>
    - Parent task ID and title
    - Task overview and phase
    - Dependencies list
    - Time estimate
  </read_from_master_tasks_md>

  <read_from_task_detail_file>
    - File location: tasks/task-[TASK_ID].md
    - Detailed task description and specifics
    - Complete acceptance criteria
    - Testing requirements and evidence needed
    - Quality gates and validation requirements
    - Implementation notes and context
  </read_from_task_detail_file>
</task_analysis>

<instructions>
  ACTION: Read master tasks.md for task identification
  LOCATE: Task detail file path from tasks.md link
  LOAD: Complete task details from tasks/task-[TASK_ID].md
  ANALYZE: Full scope of implementation required
  UNDERSTAND: Dependencies, acceptance criteria, and deliverables
  NOTE: All testing requirements, evidence needed, and quality gates
</instructions>

<context_efficiency>
  BENEFIT: Only load detailed requirements for current task
  SKIP: Verbose details of other tasks not being executed
  OPTIMIZE: Minimal context consumption for task execution
</context_efficiency>

</step>

<step number="2" name="technical_spec_review">

### Step 2: Technical Specification Review

Search and extract relevant sections from sub-specs/technical-spec.md to understand the technical implementation approach for this task.

<selective_reading>
  <search_technical_spec>
    FIND sections in sub-specs/technical-spec.md related to:
    - Current task functionality
    - Implementation approach for this feature
    - Integration requirements
    - Performance criteria
  </search_technical_spec>
</selective_reading>

<instructions>
  ACTION: Search sub-specs/technical-spec.md for task-relevant sections
  EXTRACT: Only implementation details for current task
  SKIP: Unrelated technical specifications
  FOCUS: Technical approach for this specific feature
  OPTIONAL: Review sub-specs/implementation-guide.md for development workflow
  OPTIONAL: Review sub-specs/integration-requirements.md for integration details
</instructions>

</step>

<step number="3" subagent="context-fetcher" name="best_practices_review">

### Step 3: Best Practices Review

Use the context-fetcher subagent to retrieve relevant sections from @.agent-os/standards/best-practices.md that apply to the current task's technology stack and feature type.

<selective_reading>
  <search_best_practices>
    FIND sections relevant to:
    - Task's technology stack
    - Feature type being implemented
    - Testing approaches needed
    - Code organization patterns
  </search_best_practices>
</selective_reading>

<instructions>
  ACTION: Use context-fetcher subagent
  REQUEST: "Find best practices sections relevant to:
            - Task's technology stack: [CURRENT_TECH]
            - Feature type: [CURRENT_FEATURE_TYPE]
            - Testing approaches needed
            - Code organization patterns"
  PROCESS: Returned best practices
  APPLY: Relevant patterns to implementation
</instructions>

</step>

<step number="4" subagent="context-fetcher" name="code_style_review">

### Step 4: Code Style Review

Use the context-fetcher subagent to retrieve relevant code style rules from @.agent-os/standards/code-style.md for the languages and file types being used in this task.

<selective_reading>
  <search_code_style>
    FIND style rules for:
    - Languages used in this task
    - File types being modified
    - Component patterns being implemented
    - Testing style guidelines
  </search_code_style>
</selective_reading>

<instructions>
  ACTION: Use context-fetcher subagent
  REQUEST: "Find code style rules for:
            - Languages: [LANGUAGES_IN_TASK]
            - File types: [FILE_TYPES_BEING_MODIFIED]
            - Component patterns: [PATTERNS_BEING_IMPLEMENTED]
            - Testing style guidelines"
  PROCESS: Returned style rules
  APPLY: Relevant formatting and patterns
</instructions>

</step>

<step number="5" name="task_execution">

### Step 5: Task and Sub-task Execution

Execute the parent task and all sub-tasks in order using test-driven development (TDD) approach.

<typical_task_structure>
  <first_subtask>Write tests for [feature]</first_subtask>
  <middle_subtasks>Implementation steps</middle_subtasks>
  <final_subtask>Verify all tests pass</final_subtask>
</typical_task_structure>

<execution_order>
  <subtask_1_tests>
    IF sub-task 1 is "Write tests for [feature]":
      - Write all tests for the parent feature
      - Include unit tests, integration tests, edge cases
      - Run tests to ensure they fail appropriately
      - Mark sub-task 1 complete
  </subtask_1_tests>

  <middle_subtasks_implementation>
    FOR each implementation sub-task (2 through n-1):
      - Implement the specific functionality
      - Make relevant tests pass
      - Update any adjacent/related tests if needed
      - Refactor while keeping tests green
      - Mark sub-task complete
  </middle_subtasks_implementation>

  <final_subtask_verification>
    IF final sub-task is "Verify all tests pass":
      - Run entire test suite
      - Fix any remaining failures
      - Ensure no regressions
      - Mark final sub-task complete
  </final_subtask_verification>
</execution_order>

<test_management>
  <new_tests>
    - Written in first sub-task
    - Cover all aspects of parent feature
    - Include edge cases and error handling
  </new_tests>
  <test_updates>
    - Made during implementation sub-tasks
    - Update expectations for changed behavior
    - Maintain backward compatibility
  </test_updates>
</test_management>

<instructions>
  ACTION: Execute sub-tasks in their defined order
  RECOGNIZE: First sub-task typically writes all tests
  IMPLEMENT: Middle sub-tasks build functionality
  VERIFY: Final sub-task ensures all tests pass
  UPDATE: Mark each sub-task complete as finished
</instructions>

</step>

<step number="6" subagent="test-runner" name="task_test_verification">

### Step 6: Task-Specific Test Verification

Use the test-runner subagent to run and verify only the tests specific to this parent task (not the full test suite) to ensure the feature is working correctly.

<focused_test_execution>
  <run_only>
    - All new tests written for this parent task
    - All tests updated during this task
    - Tests directly related to this feature
  </run_only>
  <skip>
    - Full test suite (done later in execute-tasks.md)
    - Unrelated test files
  </skip>
</focused_test_execution>

<final_verification>
  IF any test failures:
    - Debug and fix the specific issue
    - Re-run only the failed tests
  ELSE:
    - Confirm all task tests passing
    - Ready to proceed
</final_verification>

<instructions>
  ACTION: Use test-runner subagent
  REQUEST: "Run tests for [this parent task's test files]"
  WAIT: For test-runner analysis
  PROCESS: Returned failure information
  VERIFY: 100% pass rate for task-specific tests
  CONFIRM: This feature's tests are complete
</instructions>

</step>

<step number="7" name="task_status_updates">

### Step 7: Mark this task complete in both master and detail files

IMPORTANT: Update task status in both the master tasks.md and the individual task detail file.

<update_locations>
  <master_tasks_md>
    - Update checkbox: - [ ] → - [x]
    - Keep task ID, title, and link to detail file
    - Maintain lightweight format
  </master_tasks_md>

  <task_detail_file>
    - Update status in metadata: **Status**: [ ] Not Started → **Status**: [x] Complete
    - Add completion notes if needed
    - Preserve all task details for reference
  </task_detail_file>
</update_locations>

<update_format>
  <completed>- [x] Task description → [details](tasks/task-ID.md)</completed>
  <incomplete>- [ ] Task description → [details](tasks/task-ID.md)</incomplete>
  <blocked>
    - [ ] Task description → [details](tasks/task-ID.md)
    ⚠️ Blocking issue: [DESCRIPTION]
  </blocked>
</update_format>

<blocking_criteria>
  <attempts>maximum 3 different approaches</attempts>
  <action>document blocking issue in both files</action>
  <emoji>⚠️</emoji>
</blocking_criteria>

<instructions>
  ACTION: Update both tasks.md and tasks/task-[ID].md after completion
  MARK: [x] for completed items in both locations
  DOCUMENT: Blocking issues with ⚠️ emoji in both files
  LIMIT: 3 attempts before marking as blocked
  MAINTAIN: Lightweight format in master, full details in task file
</instructions>

</step>

</process_flow>

<post_flight_check>
  EXECUTE: @.agent-os/instructions/meta/post-flight.md
</post_flight_check>
