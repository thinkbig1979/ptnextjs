---
description: Rules to initiate execution of a set of tasks using Agent OS
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Task Execution Rules

## Overview

Execute tasks for a given spec following three distinct phases:
1. Pre-execution setup (Steps 1-3)
2. Task execution loop (Step 4) - **Uses orchestrated parallel execution automatically**
3. Post-execution tasks (Step 5)

**IMPORTANT**: All three phases MUST be completed. Do not stop after phase 2.

**EXECUTION MODE**: Task execution in Step 4 uses systematic execution via the general-purpose agent for coordinated task completion.

<pre_flight_check>
  EXECUTE: @.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

<process_flow>

## Phase 1: Pre-Execution Setup

<step number="0.5" name="quality_hooks_setup">

### Step 0.5: Quality Hooks Setup

**Automatic Quality Enforcement**: All file write and edit operations are automatically validated through the Agent OS quality hooks system. No manual intervention required.

<quality_hooks_overview>
  UNDERSTANDING: Every file creation and modification is automatically validated
  PROCESS: Write/Edit tools trigger hooks before finalizing file operations
  VALIDATION: Syntax, formatting, linting, security, type checking
  AUTO_FIX: Common issues are automatically corrected (formatting, imports, lint fixes)
  PERFORMANCE: ~0.8s overhead per file, saves 60% context tokens via early error detection
  TRANSPARENCY: All validation results displayed in console output
</quality_hooks_overview>

<automatic_validators>
  1. **Syntax Check** (Priority 1)
     - Validates file syntax is correct before writing
     - Catches syntax errors immediately
     - Language-aware: JS/TS, Python, JSON, YAML, CSS, etc.

  2. **Formatting** (Priority 2, Auto-fix enabled)
     - Applies code formatting standards automatically
     - Prettier for JS/TS/JSON/CSS/Markdown
     - Black for Python
     - Ensures consistent code style across all files

  3. **Linting** (Priority 3, Auto-fix enabled)
     - Runs language-specific linting rules
     - ESLint for JavaScript/TypeScript
     - Ruff for Python
     - Stylelint for CSS/SCSS
     - Auto-fixes safe issues (unused vars, semicolons, etc.)

  4. **Import Organization** (Priority 4, Auto-fix enabled)
     - Sorts and organizes import statements
     - Removes unused imports automatically
     - Groups imports by type (stdlib, external, internal)

  5. **Type Checking** (Priority 5)
     - Validates type correctness
     - TypeScript type checking (tsc)
     - Python type hints (mypy)
     - Reports type errors for manual fixing

  6. **Security Scanning** (Priority 6)
     - Scans for common security vulnerabilities
     - Detects hardcoded secrets and credentials
     - Identifies unsafe patterns and functions
     - Reports security issues for review

  7. **Test Generation** (Priority 7, Auto-fix enabled)
     - Generates basic test scaffolding for new source files
     - Creates test files in appropriate locations
     - Only triggers for testable code files (not configs/docs)
</automatic_validators>

<zero_manual_intervention>
  KEY_BENEFIT: You do not need to manually run formatters, linters, or validators
  AUTOMATIC: Every Write and Edit operation triggers the hook system
  TRANSPARENT: Validation results are displayed but don't block your workflow
  SMART_FIXING: Auto-fix capabilities handle most common issues automatically
  ERROR_HANDLING: Validation errors are reported but don't crash operations
  BALANCED_MODE: Warns on failures but doesn't block operations (recommended)
</zero_manual_intervention>

<performance_impact>
  OVERHEAD: ~0.8 seconds per file operation
  PARALLEL: Multiple validators run concurrently for speed
  SAVINGS: Catches errors early, saving 60% of context tokens
  CACHING: Smart caching reduces repeated validations
  INCREMENTAL: Only validates changed portions for file edits
  NET_BENEFIT: Time saved from prevented errors exceeds validation overhead
</performance_impact>

<for_more_information>
  GUIDE: See @.agent-os/instructions/utilities/quality-hooks-guide.md
  CONFIG: Hooks configured in ~/.agent-os/hooks/config.yml
  VALIDATORS: Located in ~/.agent-os/hooks/validators/
  RUNNER: Core orchestration in ~/.agent-os/hooks/runner.js
</for_more_information>

**NOTE**: This step is informational only. The hooks system is already active and requires no manual setup. Continue to Step 1 for task assignment.

</step>

<step number="1" name="task_assignment">

### Step 1: Task Assignment

Identify which tasks to execute from the spec (using spec_srd_reference file path and optional specific_tasks array), defaulting to the next uncompleted parent task if not specified.

<task_selection>
  <explicit>user specifies exact task(s)</explicit>
  <implicit>find next uncompleted task in tasks.md</implicit>
</task_selection>

<task_file_structure>
  NOTE: Tasks use optimized file structure:
  - **Master tasks.md**: Lightweight overview with task IDs, titles, and links
  - **tasks/task-*.md**: Detailed implementation requirements per task
  - **Benefit**: Minimal context consumption when reviewing task list
</task_file_structure>

<instructions>
  ACTION: Read master tasks.md for task overview
  IDENTIFY: Next uncompleted task(s) to execute
  DEFAULT: Select next uncompleted parent task if not specified
  CONFIRM: Task selection with user
  NOTE: Detailed requirements will be loaded from task detail files during execution
</instructions>

</step>

<step number="2" subagent="context-fetcher" name="enhanced_context_analysis">

### Step 2: Enhanced Context Analysis with Codebase Intelligence

Use the context-fetcher subagent to gather comprehensive context for task understanding, including existing codebase analysis to identify reusable components and integration opportunities.

<enhanced_instructions>
  ACTION: Use context-fetcher subagent to:
    - REQUEST: "Get product pitch from mission-lite.md"
    - REQUEST: "Get spec summary from spec-lite.md"
    - REQUEST: "Get technical approach from sub-specs/technical-spec.md"
    🆕 REQUEST: "Perform codebase analysis to identify existing components, APIs, models, and utilities"
    🆕 REQUEST: "Generate integration recommendations based on existing code patterns"
  PROCESS: Returned information including codebase intelligence
  OPTIMIZE: Context allocation using codebase analysis results
</enhanced_instructions>

<codebase_analysis_integration>
  <analysis_scope>
    - Scan existing components for reuse opportunities
    - Identify available APIs and database models
    - Find utility functions and helper libraries
    - Analyze architectural patterns in use
    - Map integration points with existing systems
  </analysis_scope>

  <intelligence_output>
    - Available components: List of reusable UI/logic components
    - Existing APIs: Endpoints that can be extended or referenced
    - Database models: Tables/models that can be reused or extended
    - Utility functions: Helper functions to avoid reimplementation
    - Architectural patterns: Existing patterns to maintain consistency
    - Integration points: How new code should integrate with existing systems
  </intelligence_output>

  <context_optimization>
    - Prioritize context based on task relevance and existing code matches
    - Include specific file paths and function signatures for reusable components
    - Provide concrete examples of existing patterns to follow
    - Identify potential conflicts or compatibility issues early
  </context_optimization>
</codebase_analysis_integration>

<context_gathering>
  <essential_docs>
    - tasks.md for lightweight task overview (optimized structure)
    - tasks/task-*.md for detailed task requirements (loaded per task as needed)
    🆕 codebase analysis results for integration intelligence
  </essential_docs>
  <conditional_docs>
    - mission-lite.md for product alignment
    - spec-lite.md for feature summary
    - sub-specs/technical-spec.md for implementation details
    - sub-specs/implementation-guide.md for development workflow
    - sub-specs/testing-strategy.md for test requirements
    - sub-specs/integration-requirements.md for integration details
    🆕 existing component documentation for reuse guidance
    🆕 API documentation for integration patterns
  </conditional_docs>
  <intelligent_context>
    🆕 reusable_components: Components that can be extended or referenced
    🆕 integration_points: Existing systems that new code must integrate with
    🆕 architectural_patterns: Established patterns to maintain consistency
    🆕 available_utilities: Helper functions and services already available
    🆕 code_quality_patterns: Testing and validation approaches in use
  </intelligent_context>
  <context_optimization>
    ✅ Master tasks.md: ~50-100 lines (lightweight overview)
    ✅ Task detail files: Only loaded when executing specific task
    ✅ Context savings: 90%+ reduction vs monolithic tasks.md
  </context_optimization>
</context_gathering>

<codebase_analysis_output_format>
  📋 **Codebase Analysis Summary**
  - **Files Scanned**: [NUMBER] source files analyzed
  - **Components Found**: [NUMBER] reusable components identified
  - **APIs Available**: [NUMBER] existing endpoints found
  - **Models Available**: [NUMBER] database/data models found
  - **Utilities Available**: [NUMBER] helper functions found
  - **Patterns Identified**: [LIST] architectural patterns in use

  🔧 **Integration Recommendations**
  - **Reuse Opportunities**: [LIST] existing code that can be reused
  - **Extension Points**: [LIST] existing code that can be extended
  - **Integration Patterns**: [LIST] how to integrate with existing systems
  - **Consistency Guidelines**: [LIST] patterns to follow for consistency

  ⚠️ **Considerations**
  - **Potential Conflicts**: [LIST] areas requiring careful integration
  - **Dependencies**: [LIST] existing dependencies to consider
  - **Performance Impact**: [LIST] performance considerations based on existing code
</codebase_analysis_output_format>

</step>

<step number="3" subagent="git-workflow" name="repository_health_and_branch_management">

### Step 3: Repository Health Check & Branch Management

Use the git-workflow subagent to examine the repository state, manage open PRs, and prepare a clean working environment before starting new work.

<instructions>
  ACTION: Use git-workflow subagent
  REQUEST: "Perform repository health check and branch management for spec: [SPEC_FOLDER]

            PHASE 1: Repository Health Analysis
            - List all branches (local and remote)
            - Check for open PRs (using gh pr list)
            - Identify merge conflicts between branches
            - Check if current branch is behind main
            - Detect stale or abandoned branches

            PHASE 2: Strategy Recommendation
            - Recommend merging ready PRs before starting new work
            - Suggest rebasing existing branches on main if behind
            - Identify conflicting PRs that need resolution
            - Propose cleanup of stale branches
            - Consider impact of starting new spec on existing work

            PHASE 3: User Decision & Execution
            - Present findings and recommendations to user
            - Wait for user approval on strategy
            - Execute approved actions (merge PRs, rebase, cleanup)
            - Create or switch to spec branch
            - Handle any uncommitted changes"
  WAIT: For repository health check and branch setup completion
  VERIFY: Repository is in clean state before proceeding
</instructions>

<repository_health_analysis>
  <git_state_check>
    - git branch -a (all branches)
    - gh pr list --state open (open PRs)
    - git log --oneline --graph --all --decorate -20 (branch topology)
    - git status (current working tree status)
  </git_state_check>

  <conflict_detection>
    - Check for merge conflicts between open PR branches
    - Identify files modified in multiple branches
    - Detect branches that would conflict with current spec
  </conflict_detection>

  <best_practices>
    - Merge ready PRs before starting unrelated work
    - Keep number of concurrent PRs minimal (ideally 1-2)
    - Rebase feature branches on main regularly
    - Clean up merged or abandoned branches
    - Avoid starting new specs when existing PRs are ready to merge
  </best_practices>
</repository_health_analysis>

<strategy_decision_tree>
  <scenario name="ready_prs_exist">
    RECOMMEND: "Found [N] open PR(s) that appear ready to merge. Recommend merging these before starting new work to avoid conflicts."
    ACTION: Present PRs with status, wait for user decision
  </scenario>

  <scenario name="conflicting_branches">
    RECOMMEND: "Detected [N] branches with overlapping changes. Recommend resolving conflicts or merging in order: [PRIORITY_LIST]"
    ACTION: Present conflict analysis, wait for user decision
  </scenario>

  <scenario name="branches_behind_main">
    RECOMMEND: "Found [N] branch(es) behind main. Recommend rebasing before creating new PR to avoid future conflicts."
    ACTION: Present branches needing rebase, wait for user decision
  </scenario>

  <scenario name="stale_branches">
    RECOMMEND: "Detected [N] stale branch(es) from old work. Recommend cleanup."
    ACTION: Present stale branches, wait for user decision
  </scenario>

  <scenario name="clean_state">
    PROCEED: "Repository is in clean state. Proceeding with branch creation for [SPEC_FOLDER]."
    ACTION: Create/switch to spec branch
  </scenario>
</strategy_decision_tree>

<branch_naming>
  <source>spec folder name</source>
  <format>exclude date prefix</format>
  <example>
    - folder: 2025-03-15-password-reset
    - branch: password-reset
  </example>
</branch_naming>

<output_format>
  📊 **Repository Health Report**

  **Open PRs**: [NUMBER]
  - [PR_1]: [TITLE] - [STATUS: Ready/In Progress/Blocked]
  - [PR_2]: [TITLE] - [STATUS]

  **Active Branches**: [NUMBER]
  - [BRANCH_1]: [STATUS: Current/Behind main/Conflicting]

  **Recommendations**:
  1. [ACTION_1]: [REASON]
  2. [ACTION_2]: [REASON]

  **Proposed Strategy**:
  [SPECIFIC_STEPS_TO_TAKE]

  Waiting for user approval to proceed...
</output_format>

</step>

## Phase 2: Task Execution Loop

<step number="4" name="task_execution_loop">

### Step 4: Task Execution Loop

**IMPORTANT**: This is a loop. Execute ALL assigned tasks before proceeding to Phase 3.

**EXECUTION MODE**: Systematic task execution is used. The execute-task.md file provides structured execution guidance for coordinated task completion.

Execute all assigned parent tasks and their subtasks using @.agent-os/instructions/core/execute-task.md instructions, continuing until all tasks are complete.

<execution_flow>
  LOAD @.agent-os/instructions/core/execute-task.md ONCE

  FOR each parent_task assigned in Step 1:
    EXECUTE instructions from execute-task.md with:
      - parent_task_number
      - all associated subtasks
    WAIT for task completion
    UPDATE tasks.md status
  END FOR

  **IMPORTANT**: After loop completes, CONTINUE to Phase 3 (Step 5). Do not stop here.
</execution_flow>

<loop_logic>
  <continue_conditions>
    - More unfinished parent tasks exist
    - User has not requested stop
  </continue_conditions>
  <exit_conditions>
    - All assigned tasks marked complete
    - User requests early termination
    - Blocking issue prevents continuation
  </exit_conditions>
</loop_logic>

<task_status_check>
  AFTER each task execution:
    CHECK tasks.md for remaining tasks
    IF all assigned tasks complete:
      PROCEED to next step
    ELSE:
      CONTINUE with next task
</task_status_check>

<instructions>
  ACTION: Load execute-task.md instructions once at start
  REUSE: Same instructions for each parent task iteration
  LOOP: Through all assigned parent tasks
  UPDATE: Task status after each completion
  VERIFY: All tasks complete before proceeding
  HANDLE: Blocking issues appropriately
  **IMPORTANT**: When all tasks complete, proceed to Step 5
</instructions>

</step>

## Phase 3: Post-Execution Tasks

<step number="5" name="post_execution_tasks">

### Step 5: Run the task completion steps

**CRITICAL**: This step MUST be executed after all tasks are implemented. Do not end the process without completing this phase.

After all tasks in tasks.md have been implemented, use @.agent-os/instructions/core/post-execution-tasks.md to run our series of steps we always run when finishing and delivering a new feature.

<instructions>
  LOAD: @.agent-os/instructions/core/post-execution-tasks.md once
  ACTION: execute all steps in the post-execution-tasks.md process_flow.
  **IMPORTANT**: This includes:
    - Running full test suite
    - Git workflow (commit, push, PR)
    - Verifying task completion
    - Updating roadmap (if applicable)
    - Creating recap document
    - Generating completion summary
    - Playing notification sound
</instructions>

</step>

</process_flow>

<post_flight_check>
  EXECUTE: @.agent-os/instructions/meta/post-flight.md
</post_flight_check>
