---
description: Orchestrated parallel task execution using specialized subagents
globs:
alwaysApply: false
version: 2.0
encoding: UTF-8
---

# Orchestrated Task Execution Rules

## Overview

Execute a specific task and its sub-tasks using intelligent orchestration with specialized subagents working in parallel to maximize productivity while ensuring quality and completeness.

<pre_flight_check>
  EXECUTE: @.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

<process_flow>

<step number="0.2" name="beads_task_query_and_claim">

### Step 0.2: Beads Task Query and Claim (Optional)

Query Beads for ready work and claim the task before orchestration begins. This step provides intelligent task selection based on dependency resolution.

<beads_task_selection>
  <config_check>
    ACTION: Check if Beads integration is enabled

    IF config.yml → beads.enabled = true:
      PROCEED with Beads task query
    ELSE:
      SKIP this step
      USER must provide task ID manually
      PROCEED to Step 1
  </config_check>

  <beads_ready_work_query>
    ACTION: Query Beads for unblocked tasks

    EXECUTE:
      bd ready --json > /tmp/beads-ready-tasks.json

    IF command succeeds:
      PARSE JSON output
      EXTRACT ready tasks with: id, title, priority, phase
    ELSE:
      WARN: "⚠️  Beads query failed (non-critical)"
      FALLBACK: User provides task ID manually
      PROCEED to Step 1
  </beads_ready_work_query>

  <present_ready_tasks>
    ACTION: Display ready tasks to user in priority order

    FORMAT:
      📋 Ready Tasks (no dependencies blocking):

      Critical Path (P0):
        - integ-frontend-backend: Integrate Frontend with Backend APIs
        - final-validation: Final Quality Validation

      Important (P1):
        - impl-comp1-core: Implement Component 1 Core Logic
        - impl-comp2-ui: Implement Component 2 UI
        - test-integration: Integration Testing

      Normal (P2):
        - impl-comp1-style: Implement Component 1 Styling
        - docs-update: Update Documentation

      Total: [COUNT] tasks ready to execute

    SORT: By priority (P0 first), then by phase order
  </present_ready_tasks>

  <task_selection>
    ACTION: Determine which task to execute

    IF user specified task ID in command:
      TASK_ID = user_specified_id
      VALIDATE: Task exists in Beads
    ELSE:
      PROMPT user: "Which task would you like to execute?"
      OPTIONS:
        - Select from ready tasks list
        - Enter specific task ID
        - Show dependency tree for a task (bd dep tree <id>)
      CAPTURE: user_selection
      TASK_ID = user_selection
  </task_selection>

  <claim_task>
    ACTION: Claim task by updating status to in_progress

    EXECUTE:
      bd update ${TASK_ID} --status in_progress --json

    CONFIRM: "✅ Task ${TASK_ID} claimed and marked in_progress"

    IF claim fails:
      WARN: "⚠️  Could not claim task in Beads (non-critical)"
      LOG: Error details
      CONTINUE: Proceed with execution anyway
  </claim_task>

  <load_task_context>
    ACTION: Load detailed task specifications from markdown

    IF tasks/task-${TASK_ID}.md exists:
      READ: tasks/task-${TASK_ID}.md
      EXTRACT:
        - Objective
        - Acceptance Criteria
        - Implementation Details
        - Testing Requirements
        - Dependencies
        - Agent assignment
    ELSE:
      ERROR: "❌ Task detail file not found: tasks/task-${TASK_ID}.md"
      HALT: Cannot proceed without task specifications

    STORE: Task context for orchestrator
  </load_task_context>

  <dependency_validation>
    ACTION: Verify all dependencies are complete

    EXECUTE:
      bd show ${TASK_ID} --json

    CHECK: All "blocks" dependencies have status="closed"

    IF incomplete dependencies found:
      WARN:
        "⚠️  Warning: Task has incomplete dependencies:
         [LIST incomplete dependency IDs]

         These tasks should be completed first:
         - [dependency-1]: [Status]
         - [dependency-2]: [Status]

         Proceeding may cause integration issues."

      PROMPT: "Continue anyway? (y/n)"

      IF user says no:
        HALT: User chose to complete dependencies first
      ELSE:
        CONTINUE: User accepted risk
  </dependency_validation>

  <worktree_beads_compatibility>
    IF worktree is being used:
      SET: export BEADS_NO_DAEMON=1

      NOTE: "Beads daemon disabled in worktree to prevent branch contamination.
             All bd commands will run without daemon."

      COMMUNICATE to all subagents:
        "Use --no-daemon flag for all bd commands in worktree"
  </worktree_beads_compatibility>

  <execution_summary>
    DISPLAY:
      "🚀 Starting Task Execution

       Task ID: ${TASK_ID}
       Title: ${TASK_TITLE}
       Phase: ${TASK_PHASE}
       Agent: ${TASK_AGENT}
       Priority: P${TASK_PRIORITY}
       Dependencies: ${DEPENDENCY_COUNT} (all complete ✓)

       Detailed specs: tasks/task-${TASK_ID}.md
       Beads status: in_progress

       Proceeding to orchestration..."
  </execution_summary>
</beads_task_selection>

</step>

<step number="1" subagent="task-orchestrator" name="orchestration_setup">

### Step 1: Task Orchestration Setup with Deliverable Planning

Use the task-orchestrator subagent to analyze the task, decompose for parallel execution, coordinate specialized agents with optimized context allocation, and **CREATE DELIVERABLE MANIFEST** for verification.

<orchestration_analysis>
  <worktree_isolation>
    **Phase 1 Prerequisite**: Create isolated git worktree for task execution

    **Purpose**: Prevent file conflicts when multiple agents work simultaneously,
    isolate uncommitted changes from testing/validation, enable true parallel execution.

    **Setup Procedure**:
      IF project is a git repository:
        1. EXECUTE: ./setup/create-worktree.sh [TASK_ID]
        2. CAPTURE worktree path from script output
        3. SET working directory to worktree path for all subsequent operations
        4. COMMUNICATE worktree path to all subagents

      IF worktree creation fails:
        - CHECK for existing worktree (may need cleanup)
        - TRY: ./setup/cleanup-worktree.sh [TASK_ID] && ./setup/create-worktree.sh [TASK_ID]
        - IF still fails: proceed in main workspace (acceptable fallback)

      **Worktree Benefits**:
        - Isolated workspace prevents conflicts with main branch
        - Uncommitted changes don't interfere with testing
        - Multiple tasks can execute in parallel safely
        - Easy cleanup after task completion
        - Branch automatically created (worktree/[TASK_ID])

      **Cleanup After Task**:
        - On successful completion: ./setup/cleanup-worktree.sh [TASK_ID]
        - On error/cancellation: ./setup/cleanup-worktree.sh --keep-branch [TASK_ID]
        - Bulk cleanup: ./setup/cleanup-worktree.sh --all

    **Non-Git Projects**: Skip worktree setup, proceed with standard execution

    **Subagent Communication**:
      INFORM all subagents of worktree location:
        "Working directory: [WORKTREE_PATH]
         All file operations should use this path as base directory.
         Do not modify files outside worktree unless explicitly required."
  </worktree_isolation>

  <tdd_state_initialization>
    **Phase 1.5 Prerequisite**: Initialize TDD state before task orchestration begins

    **Purpose**: Establish TDD cycle tracking state, load enforcement configuration,
    and prepare for test-driven development workflow throughout task execution.

    **Initialization Procedure**:
      IF TDD enforcement enabled in config.yml:
        1. LOAD TDD configuration from config.yml
        2. VALIDATE configuration structure and values
        3. EXTRACT enforcement level (MINIMAL, BALANCED, STRICT)
        4. INITIALIZE TDD state with task ID and enforcement level
        5. CREATE .agent-os/tdd-state/ directory if needed
        6. SAVE initial state to .agent-os/tdd-state/[TASK_ID].json
        7. VERIFY state file creation and persistence

      IF TDD enforcement disabled:
        - LOG: "TDD enforcement disabled, skipping state initialization"
        - PROCEED to task decomposition

      IF initialization fails:
        - LOG error details and continue with warning
        - TDD cycle tracking will be unavailable
        - Task execution can continue without TDD state

    **TDD State Structure**:
      - task_id: Unique task identifier
      - current_phase: INIT (initial phase)
      - enforcement_level: MINIMAL | BALANCED | STRICT
      - phase_history: Array of phase transitions with timestamps
      - created_at: ISO timestamp of initialization
      - updated_at: ISO timestamp of last update
      - test_count: 0 (initial)
      - test_failures: 0 (initial)
      - blocked_transitions: [] (empty initially)

    **Enforcement Levels**:
      - **MINIMAL**: Log TDD cycle events, no blocking
      - **BALANCED**: Warn on TDD violations, allow override
      - **STRICT**: Block implementation without passing tests

    **Configuration Loading**:
      READ config.yml → tdd_enforcement section:
        - enabled: boolean (true/false)
        - enforcement_level: string (strict|standard|relaxed)
        - cycle_tracking.enabled: boolean
        - cycle_tracking.state_directory: string
        - test_first.enabled: boolean
        - test_first.require_passing_tests: boolean

      MAP config values to TDD state:
        - "strict" → STRICT enforcement
        - "standard" → BALANCED enforcement
        - "relaxed" → MINIMAL enforcement

    **State Directory Management**:
      DEFAULT location: .agent-os/tdd-state/
      OVERRIDE via: config.yml → cycle_tracking.state_directory

      CREATE directory structure:
        .agent-os/
        └── tdd-state/
            ├── [TASK_ID].json  # Current task state
            ├── [TASK_ID]-history.json  # Phase history (optional)
            └── metrics.json  # Aggregate metrics (optional)

    **Error Handling**:
      - Invalid config: Use defaults (BALANCED enforcement)
      - Missing config: Use defaults with warning
      - State save failure: Log error, continue without persistence
      - Invalid task ID: Throw error, halt execution
      - Directory creation failure: Attempt recovery, fallback to /tmp

    **Integration with Orchestration**:
      SEQUENCE:
        1. Worktree isolation (Phase 1)
        2. TDD state initialization (Phase 1.5) ← NEW
        3. Task decomposition (Phase 2)
        4. Deliverable planning (Phase 2.5)
        5. Orchestration (Phase 3)
        6. Execution (Step 2+)

      TDD state available to all subagents via shared state directory.

    **Example Execution**:
      ```
      # Step 0.5: TDD State Initialization

      📋 Loading TDD configuration...
      ✓ Config loaded: enforcement_level=standard (BALANCED)

      📋 Initializing TDD state for task: tdd-008...
      ✓ State initialized: current_phase=INIT

      📋 Creating state directory: .agent-os/tdd-state/
      ✓ Directory created

      📋 Saving initial state to: .agent-os/tdd-state/tdd-008.json
      ✓ State persisted successfully

      ✅ TDD state initialization complete

      Proceeding to task orchestration...
      ```

    **Subagent Communication**:
      INFORM all subagents of TDD state location:
        "TDD State: .agent-os/tdd-state/[TASK_ID].json
         Enforcement Level: [MINIMAL|BALANCED|STRICT]
         Current Phase: INIT

         TDD cycle tracking is enabled. Follow test-first workflow:
         1. Write failing test (RED phase)
         2. Implement minimal code to pass (GREEN phase)
         3. Refactor while maintaining tests (REFACTOR phase)

         State transitions are tracked automatically."

    **Success Criteria**:
      - ✓ Config loaded and validated
      - ✓ TDD state initialized with correct enforcement level
      - ✓ State directory created
      - ✓ Initial state persisted to JSON file
      - ✓ State accessible to all subagents
      - ✓ Error handling in place for failures
  </tdd_state_initialization>

  <prerequisite_gates>
    ### Step 1.6: Pre-Execution Verification Gates

    BEFORE delegating ANY work to subagents, verify:

    1. CONFIG CHECK:
       - IF config.yml → skills_integration.enabled = true:
           Skills are available, Step 2.0 will invoke them
       - IF config.yml → tdd_enforcement.enabled = true:
           TDD state must be initialized (verify file exists)
       - IF config.yml → test_context_gathering.gate_enforcement.enabled = true:
           Step 2.0 is MANDATORY, cannot skip

    2. FRAMEWORK ISOLATION CHECK (for projects with E2E tests):
       - READ playwright.config.ts (if exists)
       - VERIFY testDir is "./tests/e2e" (NOT "./tests")
       - IF VIOLATION: Block and report before ANY test work
       - REFERENCE: @standards/testing-standards.md Section 3

    3. TDD STATE VERIFICATION (if enabled):
       - VERIFY .agent-os/tdd-state/[TASK_ID].json exists
       - IF MISSING: Initialize now (don't proceed without it)

    GATE STATUS: [ ] All prerequisites verified
  </prerequisite_gates>

  <task_decomposition>
    - Read task overview from master tasks.md (lightweight format)
    - Load detailed requirements from tasks/task-[TASK_ID].md
    - Identify parallel execution opportunities and dependencies
    - Map subtasks to specialist agent capabilities
    - Calculate optimal context allocation strategy
  </task_decomposition>

  <task_file_structure>
    NOTE: Tasks use optimized file structure for minimal context consumption:
    - **Master tasks.md**: Lightweight overview (~50-100 lines)
    - **tasks/task-*.md**: Detailed requirements per task (loaded as needed)
    - **Benefit**: 90%+ reduction in context usage for task review
  </task_file_structure>

  <agent_selection>
    - Determine required specialist agents based on task complexity
    - Allocate context windows efficiently across agents
    - Prepare focused context packages for each agent
    - Plan coordination points and integration milestones
  </agent_selection>

  <execution_strategy>
    - Design parallel execution streams with dependency management
    - Establish quality gates and validation checkpoints
    - Plan error handling and recovery mechanisms
    - Set up progress monitoring and status tracking
  </execution_strategy>

  <deliverable_planning>
    **CRITICAL NEW REQUIREMENT**: Create comprehensive deliverable manifest before delegation.

    - Analyze acceptance criteria to identify ALL expected files
    - List files to be created with specific requirements
    - List files to be modified with expected changes
    - Identify test files required with coverage expectations
    - Document verification criteria for each deliverable
    - Plan integration verification points
    - Share manifest with all subagents before work begins

    See @.agent-os/instructions/utilities/deliverable-verification-guide.md for detailed process.
  </deliverable_planning>
</orchestration_analysis>

<instructions>
  ACTION: Use task-orchestrator subagent
  REQUEST: "Analyze and orchestrate task execution for:
            - Parent Task: [TASK_NUMBER] [TASK_DESCRIPTION]
            - Subtasks: [ALL_SUBTASKS_FROM_TASKS_MD]
            - Technical Requirements: [RELEVANT_TECH_SPEC_SECTIONS]
            - Quality Standards: [CODING_STANDARDS_AND_BEST_PRACTICES]

            Phase 1 - Worktree Isolation (if git repo):
            1. Create isolated worktree: ./setup/create-worktree.sh [TASK_ID]
            2. Capture worktree path from output
            3. Set all subsequent file operations to use worktree path
            4. Communicate worktree location to all subagents

            Phase 1.5 - TDD State Initialization (if TDD enforcement enabled):
            1. Load TDD configuration from config.yml
            2. Validate configuration structure and values
            3. Extract enforcement level (MINIMAL, BALANCED, STRICT)
            4. Initialize TDD state with task ID and enforcement level
            5. Create .agent-os/tdd-state/ directory if needed
            6. Save initial state to .agent-os/tdd-state/[TASK_ID].json
            7. Verify state file creation and persistence
            8. Communicate TDD state location to all subagents

            Phase 2 - Deliverable Planning (MANDATORY):
            1. Review acceptance criteria and task requirements
            2. Create deliverable manifest listing ALL expected files
            3. Document verification criteria for each file
            4. Identify test coverage requirements
            5. Plan integration verification points

            Phase 3 - Orchestration:
            1. Optimal specialist agent selection
            2. Focused context allocation per agent
            3. Dependency coordination and handoff points
            4. Quality assurance and integration strategy
            5. Progress monitoring and error handling

            Phase 4 - Manifest Distribution:
            1. Share deliverable manifest with ALL subagents
            2. Make clear that deliverables are MANDATORY
            3. Request subagents confirm deliverables received
            4. Set expectation that verification will occur"

  COORDINATE: Orchestrator manages all subsequent parallel execution
  MONITOR: Track progress across all specialist agents AND deliverable completion
  INTEGRATE: Ensure seamless integration of all work streams
  VERIFY: Prepare for comprehensive verification after execution
</instructions>

</step>

<step number="1.9" name="mandatory_instruction_loading">

### Step 1.9: Mandatory Instruction Loading Protocol (ENFORCEMENT)

**PURPOSE**: Ensure ALL subagents read and internalize their specialist instruction files before performing any work. This is the critical enforcement point that guarantees test and implementation standards are followed.

<instruction_loading_protocol>
  <rationale>
    Subagents spawned via Task tool do NOT automatically receive Agent OS instruction files.
    Without explicit instruction loading, subagents use general knowledge instead of
    Agent OS standards, leading to:
    - Tests written without CI-safe patterns
    - Missing timeout configurations
    - Incorrect file organization
    - Watch mode defaults causing hangs
    - Test sprawl and debug scripts masquerading as tests

    This protocol ENFORCES instruction loading before any work begins.
  </rationale>

  <agent_instruction_mapping>
    AGENT_TYPE → INSTRUCTION_FILE:
      test-architect     → @.agent-os/instructions/agents/test-architect.md
      test-runner        → @.agent-os/instructions/agents/test-runner.md
      implementation-specialist → @.agent-os/instructions/agents/implementation-specialist.md
      frontend-react-specialist → @.agent-os/instructions/agents/frontend-react-specialist.md
      frontend-vue-specialist   → @.agent-os/instructions/agents/frontend-vue-specialist.md
      backend-nodejs-specialist → @.agent-os/instructions/agents/backend-nodejs-specialist.md
      integration-coordinator   → @.agent-os/instructions/agents/integration-coordinator.md
      quality-assurance        → @.agent-os/instructions/agents/quality-assurance.md
      security-sentinel        → @.agent-os/instructions/agents/security-sentinel.md
      documentation-generator  → @.agent-os/instructions/agents/documentation-generator.md
  </agent_instruction_mapping>

  <mandatory_prompt_prefix>
    ALL subagent delegation prompts MUST begin with this instruction block:

    ```
    ═══════════════════════════════════════════════════════════════════
    MANDATORY INSTRUCTION LOADING - DO NOT SKIP
    ═══════════════════════════════════════════════════════════════════

    BEFORE performing ANY work, you MUST:

    1. READ the instruction file for your role:
       @.agent-os/instructions/agents/{AGENT_TYPE}.md

    2. INTERNALIZE all protocols, especially:
       - Pre-creation checklists (if applicable)
       - Quality gates you must pass
       - File organization standards
       - CI/CD safety requirements

    3. CONFIRM understanding by stating:
       "I have read {AGENT_TYPE}.md and will follow:
        - [Key constraint 1]
        - [Key constraint 2]
        - [Key constraint 3]"

    4. PROCEED with task only AFTER confirmation

    FAILURE to read instructions will result in work that doesn't meet
    Agent OS standards and will be rejected during verification.
    ═══════════════════════════════════════════════════════════════════
    ```
  </mandatory_prompt_prefix>

  <skill_invocation_block>
    ADD this block to delegation prompts for phases requiring skills:

    ```
    ═══════════════════════════════════════════════════════════════════
    MANDATORY SKILL INVOCATIONS
    ═══════════════════════════════════════════════════════════════════

    You MUST invoke these skills using the Skill() tool:

    Required for this phase:
      Skill(skill="agent-os-testing-standards")  # For test-related phases
      [Additional skills based on phase - see config.yml]

    These are TOOL CALLS, not just references. The orchestrator will
    verify your response contains actual Skill() invocations.

    Verbal confirmation ("I read the standards") is NOT sufficient.
    You must make explicit Skill() tool calls that will appear in the
    conversation history.

    VERIFICATION: After you complete your work, the orchestrator will
    parse your response for actual Skill() tool call patterns:
      - 'Skill(skill="skill-name")'
      - Tool invocation blocks

    If required skills are not invoked, you will be asked to retry.
    ═══════════════════════════════════════════════════════════════════
    ```

    **Required Skills by Phase**:
    ```yaml
    test_context_gathering (Step 2.0):
      - agent-os-testing-standards (REQUIRED)
      - agent-os-test-research (REQUIRED)
      - agent-os-patterns (REQUIRED)
    
    test_design (Step 2.1):
      - agent-os-testing-standards (REQUIRED)
      - agent-os-patterns (RECOMMENDED)
    
    implementation (Step 2.2):
      - agent-os-patterns (REQUIRED)
      - agent-os-specialists (REQUIRED)
    
    security_review (Step 4.0):
      - agent-os-specialists (REQUIRED)
    ```
  </skill_invocation_block>

  <test_specific_enforcement>
    FOR test-architect subagent delegations, ADD additional requirements:

    ```
    ═══════════════════════════════════════════════════════════════════
    TEST-SPECIFIC ENFORCEMENT
    ═══════════════════════════════════════════════════════════════════

    ALSO READ these critical standards:
    - @.agent-os/standards/test-infrastructure.md (test organization)
    - @.agent-os/instructions/utilities/tdd-validator.md (TDD enforcement)

    BEFORE writing ANY test file, you MUST complete the PRE-CREATION CHECKLIST
    documented in test-architect.md. This includes:

    1. TEST TYPE DECLARATION: unit | integration | e2e
    2. FILE LOCATION: Must match standards for test type
    3. CI-SAFE CONFIRMATION: No watch mode, has timeouts, exits cleanly
    4. SERVER DEPENDENCIES: List all required servers (for e2e)
    5. FRAMEWORK CONFIRMATION: Detected framework and syntax to use

    DO NOT write test files until checklist is complete.
    ═══════════════════════════════════════════════════════════════════
    ```
  </test_specific_enforcement>

  <test_runner_enforcement>
    FOR test-runner subagent delegations, ADD additional requirements:

    ```
    ═══════════════════════════════════════════════════════════════════
    TEST EXECUTION ENFORCEMENT
    ═══════════════════════════════════════════════════════════════════

    BEFORE running ANY tests, you MUST:

    1. VERIFY servers are running (if required by test type)
       - Check each endpoint with 2-second timeout
       - BLOCK execution if servers not responding
       - Report clear status: ✅ Running | ❌ Not Running

    2. VERIFY test command will EXIT cleanly
       - Check for watch mode (vitest without --run)
       - Add --run flag if needed
       - Wrap execution with hard timeout

    3. MONITOR for hung tests
       - If no output for 60 seconds, test is likely hung
       - Kill hung tests and report
       - Never wait indefinitely

    4. REPORT results clearly
       - Total / Passed / Failed counts
       - Exit code (0 = success, non-zero = failure)
       - Execution time

    See @.agent-os/standards/test-infrastructure.md for full protocol.
    ═══════════════════════════════════════════════════════════════════
    ```
  </test_runner_enforcement>

  <verification_of_instruction_loading>
    ORCHESTRATOR must verify subagent loaded instructions:

    AFTER spawning subagent, CHECK response for:
      - Explicit mention of reading instruction file
      - Listing of key constraints from the file
      - Commitment to follow protocols

    IF verification missing:
      WARN: "Subagent did not confirm instruction loading"
      ACTION: Re-prompt with explicit instruction requirement

    IF verification present:
      LOG: "✅ Subagent confirmed instruction loading for {AGENT_TYPE}"
      PROCEED: Allow subagent to begin work
  </verification_of_instruction_loading>

  <agent_type_validation>
    BEFORE delegating ANY task, validate agent assignment is correct:

    IF task involves WRITING tests:
      REQUIRED_AGENT: test-architect
      BLOCK_IF: agent assignment != test-architect
      MESSAGE: "❌ Test creation tasks MUST use test-architect agent.
                Current assignment: {CURRENT_AGENT}
                Fix task assignment before proceeding."

    IF task involves RUNNING tests:
      REQUIRED_AGENT: test-runner
      BLOCK_IF: agent assignment != test-runner
      MESSAGE: "❌ Test execution tasks MUST use test-runner agent.
                Current assignment: {CURRENT_AGENT}
                Fix task assignment before proceeding."

    IF task involves TEST INFRASTRUCTURE setup:
      REQUIRED_AGENTS: [test-architect, integration-coordinator]
      REQUIRE: Consultation with both agents
      MESSAGE: "Test infrastructure tasks require test-architect for standards
                and integration-coordinator for CI/CD integration."
  </agent_type_validation>
</instruction_loading_protocol>

</step>

<step number="1.9a" name="subagent_delegation_template">

### Step 1.9a: Subagent Delegation Prompt Template (CRITICAL)

**Purpose**: Ensure ALL mandatory instructions, skills, and context are passed to subagents.

When constructing `Task()` calls for subagent delegation, you MUST use the standard template from:

```
@.agent-os/instructions/utilities/subagent-delegation-template.md
```

**Why This Matters**: Subagents do NOT automatically inherit:
- Mandatory instruction loading requirements
- Skill invocation requirements from config.yml
- Global CLAUDE.md context
- Pattern lookup hierarchy

**Template Ensures Every Subagent Receives**:
1. Instruction loading protocol (read role file, confirm understanding)
2. Mandatory skill invocations for their phase
3. Pattern lookup hierarchy (project patterns > skills > web search)
4. Global execution requirements
5. Specific task requirements and acceptance criteria

**Quick Reference - Required Skills by Phase**:

| Phase | Required Skills |
|-------|-----------------|
| Test Context (2.0) | `agent-os-test-research`, `agent-os-patterns` |
| Test Design (2.1) | `agent-os-patterns`, `agent-os-specialists` |
| Implementation (3.0) | `agent-os-patterns`, `agent-os-specialists` |
| Security Review (4.0) | `agent-os-specialists` |
| Spec Creation | `agent-os-patterns`, shadcn MCPs for UI |

**Verification After Delegation**:
After receiving subagent response, verify:
- [ ] Instruction file was read and key constraints stated
- [ ] Required skills were invoked (check for Skill() calls)
- [ ] Project-specific patterns were checked first
- [ ] All deliverables were produced

</step>

<step number="2" name="parallel_execution_streams">

### Step 2: Parallel Execution Coordination

The task-orchestrator manages multiple specialist agents working in parallel across different execution streams, with intelligent context distribution and dependency coordination.

<step_2_0_test_context_gathering>

#### Step 2.0: Test Context Gathering (PREREQUISITE FOR ALL TESTING)

**Execution Order**: BEFORE test-architect (mandatory prerequisite)
**Agent**: general-purpose (test-context-gatherer role)
**Purpose**: Gather library documentation and testing patterns BEFORE test writing

**CRITICAL**: This step prevents test failures caused by incorrect API usage, outdated patterns, or framework-specific requirements. Tests written without proper context frequently fail on first run.

**⚠️ MANDATORY SKILL INVOCATION IN PHASE 3**

This step REQUIRES you to invoke the Skill tool. In Phase 3 below, you MUST call:
```
Skill(skill="agent-os-patterns")
Skill(skill="agent-os-test-research")
```
These are REQUIRED tool invocations, not optional guidance. Do not proceed to test-architect without invoking these skills first.

<skill_invocation_ownership>
  ### Skill Invocation Responsibility

  OWNERSHIP: test-context-gatherer agent OWNS skill invocations

  The orchestrator does NOT invoke skills directly. Instead:
  1. Orchestrator delegates to test-context-gatherer
  2. test-context-gatherer invokes Skill(skill="agent-os-patterns")
  3. test-context-gatherer invokes Skill(skill="agent-os-test-research")
  4. test-context-gatherer outputs context file

  VERIFICATION: Orchestrator checks context file exists (not skill invocation)
</skill_invocation_ownership>

<test_context_research>
  **Phase 1: Detect Testing Libraries**

  EXECUTE library detection to identify all testing frameworks and libraries:

  ```
  ACTION: Run library detection utility
  COMMAND: node ~/.agent-os/hooks/lib/detect-test-libraries.js [PROJECT_PATH] --json

  ALTERNATIVE (if utility unavailable):
  READ: package.json (JavaScript/TypeScript)
  READ: pyproject.toml or requirements.txt (Python)
  READ: Gemfile (Ruby)

  EXTRACT:
  - Test runner (jest, vitest, pytest, rspec, etc.)
  - E2E framework (playwright, cypress, etc.)
  - Mocking libraries (msw, sinon, nock, etc.)
  - Backend testing (convex-test, supertest, prisma, etc.)
  - Component testing (@testing-library/react, @vue/test-utils, etc.)
  - Versions for all detected libraries
  ```

  **Phase 2: Check Available Documentation Sources**

  DETERMINE available documentation fetching methods in priority order:

  ```yaml
  documentation_source_check:
    priority_0_skills:  # v3.2+: ALWAYS CHECK FIRST - No network required
      check: "Is skills_integration.enabled = true in config.yml?"
      if_available:
        action: "Invoke agent-os-patterns and agent-os-test-research skills"
        trigger: "Use Skill tool with skill='agent-os-patterns'"
        references:
          - references/testing/vitest.md
          - references/testing/playwright.md
          - references/testing/convex.md
          - references/testing/test-strategies.md
      benefits:
        - Always available (no network dependency)
        - Version controlled with Agent OS
        - Pre-validated patterns
        - Progressive disclosure

    priority_1_dockfork:
      check: "Are mcp__dockfork__* tools available?"
      if_available: "Use DocFork MCP for pre-indexed docs"

    priority_2_context7:
      check: "Are mcp__context7__* tools available?"
      if_available: "Use Context7 MCP for AI-optimized docs"

    priority_3_websearch:
      check: "WebSearch tool always available"
      usage: "Search for official documentation"

    priority_4_webfetch:
      check: "WebFetch tool always available"
      usage: "Direct fetch from known documentation URLs"
  ```

  **Phase 3: Fetch Documentation**

  **⚠️ EXECUTE PATTERN LOOKUP NOW**

  ```
  STEP 1: CHECK PROJECT-SPECIFIC PATTERNS FIRST

  CHECK: .agent-os/patterns/ and .agent-os/test-context/ in the project

  IF .agent-os/patterns/testing/ exists:
    READ project-specific test patterns (these take PRECEDENCE):
    - .agent-os/patterns/testing/vitest.md
    - .agent-os/patterns/testing/playwright.md
    - .agent-os/patterns/testing/convex.md

  IF .agent-os/test-context/[TASK_ID].json exists:
    READ cached test context from previous runs

  STEP 2: INVOKE SKILLS FOR GENERIC PATTERNS (MANDATORY)

  The test-context-gatherer agent invokes these skills:

    Skill(skill="agent-os-patterns")
    Skill(skill="agent-os-test-research")

  After invoking agent-os-patterns, READ the relevant testing references:

  | Detected Library | Skill Reference (Generic) |
  |------------------|---------------------------|
  | Vitest | references/testing/vitest.md |
  | Playwright | references/testing/playwright.md |
  | Convex | references/testing/convex.md |
  | All projects | references/testing/test-strategies.md |

  VERIFICATION before proceeding:
  - [ ] Checked .agent-os/patterns/ for project-specific patterns
  - [ ] Skill(skill="agent-os-patterns") was invoked
  - [ ] Skill(skill="agent-os-test-research") was invoked
  - [ ] Relevant reference files were read
  - [ ] Testing patterns are loaded

  OUTPUT:
  "✅ Project patterns: [list if found] (from .agent-os/patterns/)"
  "✅ Skill patterns: vitest.md, playwright.md, test-strategies.md"

  STEP 3: FALLBACK TO MCP/WEBSEARCH (only if skills insufficient)

  ELSE IF mcp__dockfork__get_documentation available:
    CALL mcp__dockfork__get_documentation(
      library: "[LIBRARY_NAME]",
      version: "[VERSION]",
      sections: ["mocking", "assertions", "lifecycle", "configuration"]
    )

  ELSE IF mcp__context7__get_library_docs available:
    CALL mcp__context7__get_library_docs(
      library_name: "[LIBRARY_NAME]",
      topic: "testing patterns mocking assertions API"
    )

  ELSE (WebSearch fallback):
    CALL WebSearch(
      query: "[LIBRARY_NAME] [VERSION] official documentation testing API",
      allowed_domains: ["[LIBRARY_DOCS_DOMAIN]", "github.com"]
    )

    THEN CALL WebFetch for specific documentation pages:
    - API reference
    - Mocking guide
    - Configuration reference
    - Migration/changelog (for version-specific features)
  ```

  **Phase 4: Extract Patterns and Anti-Patterns**

  FROM fetched documentation, extract:

  ```yaml
  patterns_to_extract:
    mocking_patterns:
      - Module mocking syntax
      - Partial mocking
      - Async mocking
      - Mock clearing/resetting

    assertion_patterns:
      - Available matchers
      - Async assertions
      - Custom matchers

    lifecycle_patterns:
      - Setup/teardown hooks
      - Test isolation
      - Parallel execution

    anti_patterns:
      - Common mistakes for this framework
      - Deprecated APIs
      - Version-specific gotchas
  ```

  **Phase 5: Store Context for test-architect**

  SAVE gathered context to accessible location:

  ```
  CREATE DIRECTORY: .agent-os/test-context/

  WRITE: .agent-os/test-context/[TASK_ID].json
  {
    "generated_at": "[TIMESTAMP]",
    "libraries": {
      "test_runner": { "name": "vitest", "version": "1.6.0", ... },
      "e2e_framework": { "name": "playwright", "version": "1.42.0", ... },
      ...
    },
    "documentation_sources_used": ["dockfork_mcp", "websearch"],
    "patterns_extracted": { ... },
    "anti_patterns": [ ... ]
  }

  WRITE: .agent-os/test-context/patterns/[LIBRARY].md
  - One file per major library
  - Contains code examples
  - Version-specific notes
  ```
</test_context_research>

<test_context_delegation>
  **Phase 6: Delegate to test-context-gatherer Agent**

  DELEGATE test context gathering to specialized agent:

  ```
  ACTION: Use general-purpose subagent (test-context-gatherer role)
  REQUEST: "Gather testing library documentation and patterns for task:

            ═══════════════════════════════════════════════════════════════════
            MANDATORY INSTRUCTION LOADING - DO NOT SKIP
            ═══════════════════════════════════════════════════════════════════

            BEFORE performing ANY work, you MUST:

            1. READ the instruction file for your role:
               @.agent-os/instructions/agents/test-context-gatherer.md

            2. READ the testing standards:
               @.agent-os/standards/testing-standards.md Section 4 (Pattern Lookup Hierarchy)

            3. CONFIRM understanding by stating:
               'I have read test-context-gatherer.md and testing-standards.md and will follow:
                - Pattern lookup hierarchy (project patterns FIRST, then skills)
                - Mandatory skill invocations (agent-os-test-research, agent-os-patterns)
                - Documentation priority order (skills → MCPs → web search)
                - Output requirements (context JSON with patterns extracted)'

            4. PROCEED with context gathering only AFTER confirmation

            ═══════════════════════════════════════════════════════════════════
            MANDATORY SKILL INVOCATIONS (You own these)
            ═══════════════════════════════════════════════════════════════════

            1. CHECK .agent-os/patterns/testing/ for project-specific patterns FIRST
            2. INVOKE Skill(skill='agent-os-testing-standards')  # Canonical testing values
            3. INVOKE Skill(skill='agent-os-test-research')      # Library detection
            4. INVOKE Skill(skill='agent-os-patterns')           # Code patterns
            5. ONLY THEN fall back to MCPs/WebSearch for gaps

            These are explicit Skill() tool calls you must make - not implicit knowledge.
            The agent-os-testing-standards skill provides canonical values for timeouts,
            file locations, and the pre-creation checklist.

            ═══════════════════════════════════════════════════════════════════
            CONTEXT GATHERING TASKS
            ═══════════════════════════════════════════════════════════════════

            Task Context:
            - Task ID: [TASK_ID]
            - Project Path: [PROJECT_PATH]
            - Testing Libraries: [TO BE DETECTED]

            Your Responsibilities:
            1. Detect all testing libraries (test runner, E2E, mocking, etc.)
            2. Gather documentation for detected libraries
            3. Extract patterns: mocking, assertions, lifecycle, async handling
            4. Document anti-patterns to avoid
            5. Save context to .agent-os/test-context/[TASK_ID].json

            Follow the process documented in your instruction file:
            - Phase 1: Detect Testing Libraries
            - Phase 2: Check Available Documentation Sources
            - Phase 3: Fetch Documentation (with pattern lookup)
            - Phase 4: Extract Patterns and Anti-Patterns
            - Phase 5: Store Context

            ═══════════════════════════════════════════════════════════════════
            MANDATORY OUTPUT
            ═══════════════════════════════════════════════════════════════════

            1. CREATE .agent-os/test-context/[TASK_ID].json
            2. INCLUDE sections: test_runner, e2e_framework, patterns_extracted, anti_patterns
            3. DOCUMENT sources used (skills, MCPs, web search)

            ═══════════════════════════════════════════════════════════════════
            VERIFICATION (Orchestrator will check)
            ═══════════════════════════════════════════════════════════════════

            After completion, orchestrator will verify:
            - [ ] Instruction confirmation statement present
            - [ ] Skill invocations performed (check for Skill() calls)
            - [ ] Context file created and contains required sections
            - [ ] Project-specific patterns were checked first"

  COORDINATE: Orchestrator tracks context gathering progress
  MONITOR: Verify skill invocations occur
  VERIFY: Context file created with required content
  ```
</test_context_delegation>

<test_context_verification>
  **Verification Gate**

  AFTER test-context-gatherer completes, orchestrator MUST verify:

  ```yaml
  test_context_gate:
    instruction_loading:
      - [ ] Confirmation statement present in response
      - [ ] Agent stated they read test-context-gatherer.md
      - [ ] Agent stated key constraints they will follow

    skill_invocation_verification:
      REQUIRED_SKILLS:
        - agent-os-testing-standards
        - agent-os-test-research
        - agent-os-patterns
      
      VERIFICATION_LOGIC:
        1. PARSE subagent response for Skill() tool calls
        2. SEARCH for patterns:
           - 'Skill(skill="[SKILL_NAME]")'
           - 'Skill(skill=\'[SKILL_NAME]\')'
           - Tool invocation block containing skill name
        3. FOR each required_skill:
             IF pattern NOT found:
               ADD to MISSING_SKILLS list
        4. IF MISSING_SKILLS not empty:
             BLOCK with error message (see below)
        5. ELSE:
             LOG: "✅ Skill invocations verified: [LIST_FOUND_SKILLS]"
      
      BLOCKING_IF_MISSING:
        ERROR: "❌ SKILL VERIFICATION FAILED
        
        Subagent did not invoke required skills:
        Missing: [LIST MISSING_SKILLS]
        
        Required skills must be invoked as tool calls, not just mentioned.
        Verbal confirmation like 'I read the standards' is NOT sufficient.
        
        ACTION OPTIONS:
        1. RETRY: Re-delegate with explicit skill requirement
        2. BLOCK: Refuse to proceed without skill invocations
        3. OVERRIDE: User explicitly approves (logs warning)
        
        DEFAULT: RETRY with enhanced prompt:
        'You MUST invoke these skills using the Skill() tool:
         [LIST MISSING_SKILLS]
         
         Example: Skill(skill=\"agent-os-testing-standards\")
         
         Do NOT proceed until you have invoked all required skills.'"
      
      VERIFICATION_CHECKLIST:
        - [ ] Skill(skill="agent-os-testing-standards") invoked ✓
        - [ ] Skill(skill="agent-os-test-research") invoked ✓
        - [ ] Skill(skill="agent-os-patterns") invoked ✓
        - [ ] Project patterns checked first (if they exist) ✓

    output_files:
      - [ ] .agent-os/test-context/[TASK_ID].json EXISTS
      - [ ] File contains: test_runner, e2e_framework, patterns_extracted
      - [ ] Anti-patterns documented

    blocking_if_missing:
      - "Instruction confirmation missing - agent may not follow standards"
      - "Skills not invoked - missing critical pattern context"
      - "Context file missing or incomplete"

    gate_status: "PASSED"  # Must be PASSED to proceed
  ```

  **IF ANY VERIFICATION FAILS**:
  ```
  ❌ BLOCK: Context gathering incomplete or non-compliant

  Missing Elements:
  - [List what failed verification]

  Required Action:
  - Re-delegate to test-context-gatherer with explicit requirements
  - Emphasize mandatory instruction loading
  - Confirm skill invocations are tool calls, not just mentions

  DO NOT PROCEED to test-architect until verification passes.
  ```

  **Output Summary** (when verification passes):
  ```
  ═══════════════════════════════════════════════════════════════════
  TEST CONTEXT GATHERING - COMPLETE
  ═══════════════════════════════════════════════════════════════════

  ✅ Instruction Loading Verified:
     - test-context-gatherer.md read and confirmed
     - Key constraints stated

  ✅ Skill Invocations Verified:
     - agent-os-testing-standards invoked ✓
     - agent-os-test-research invoked ✓
     - agent-os-patterns invoked ✓
     - Project patterns checked first ✓

  ✅ Libraries Detected:
     - vitest@1.6.0 (test runner)
     - playwright@1.42.0 (E2E)
     - convex-test@0.1.0 (backend)

  ✅ Documentation Fetched:
     - Vitest: via Skills (agent-os-patterns)
     - Playwright: via Skills (agent-os-patterns)
     - Convex: via WebFetch (docs.convex.dev)

  ✅ Patterns Extracted: 12 patterns, 5 anti-patterns

  ✅ Context Saved: .agent-os/test-context/[TASK_ID].json

  PROCEEDING TO TEST-ARCHITECT (Step 2.1)...
  ═══════════════════════════════════════════════════════════════════
  ```
</test_context_verification>

<step_2_0_completion_gate>
  ### Step 2.0 Completion Gate (BLOCKING)

  BEFORE proceeding to Step 2.1 (test-architect), VERIFY:

  STEP 1: SKILL INVOCATION VERIFICATION (MANDATORY)
    
    PARSE subagent response for actual Skill() tool calls
    
    REQUIRED_SKILLS:
      - agent-os-testing-standards
      - agent-os-test-research
      - agent-os-patterns
    
    FOR each required_skill:
      SEARCH response for patterns:
        - 'Skill(skill="[SKILL_NAME]")'
        - 'Skill(skill=\'[SKILL_NAME]\')'
        - Tool invocation block containing skill name
      
      IF pattern NOT found:
        ADD to MISSING_SKILLS list
    
    IF MISSING_SKILLS is not empty:
      ❌ BLOCK: Required skills not invoked
      
      ERROR MESSAGE:
        "❌ SKILL VERIFICATION FAILED
        
        Subagent did not invoke required skills:
        Missing: [LIST MISSING_SKILLS]
        
        Required skills must be invoked as tool calls, not just mentioned.
        Verbal confirmation like 'I read the standards' is NOT sufficient.
        
        The orchestrator verified your response and could not find explicit
        Skill() tool invocations for the required skills.
        
        REQUIRED ACTION: Re-delegate with explicit skill requirement"
      
      RETRY PROMPT:
        "You MUST invoke these skills using the Skill() tool:
         [LIST MISSING_SKILLS]
         
         Example: Skill(skill='agent-os-testing-standards')
         
         These must be actual tool calls that appear in the conversation.
         Do NOT proceed until you have invoked all required skills."
      
      DO NOT PROCEED until all skills invoked
    
    IF all skills found:
      ✅ Skill invocations verified: [LIST FOUND_SKILLS]
      PROCEED to Step 2 (file verification)

  STEP 2: FILE VERIFICATION
    
    CHECK file exists: .agent-os/test-context/[TASK_ID].json
    
    EXECUTE verification:
      FILE_PATH=".agent-os/test-context/${TASK_ID}.json"
      
      IF file does NOT exist:
        ❌ BLOCK: Cannot delegate to test-architect
        ERROR: "Test context file missing: ${FILE_PATH}"
        ACTION: Re-execute Step 2.0 (test-context-gatherer)
        
        PROMPT user:
          "Test context gathering did not complete. Options:
           1. retry - Re-run test-context-gatherer
           2. skip - Proceed without context (NOT RECOMMENDED)
           3. abort - Stop task execution"
        
        DO NOT PROCEED until gate passes

      IF file exists:
        ✅ Context file verified
        READ file and verify contains required keys:
          - test_runner (required)
          - patterns_extracted (required)
          - e2e_framework (optional, required if e2e tests)
        
        IF required keys missing:
          ⚠️ WARN: Context file incomplete
          LIST missing keys
          PROMPT: "Continue with incomplete context? (y/n)"

  VERIFICATION CHECKLIST:
    - [ ] Skill(skill="agent-os-testing-standards") invoked ✓
    - [ ] Skill(skill="agent-os-test-research") invoked ✓
    - [ ] Skill(skill="agent-os-patterns") invoked ✓
    - [ ] .agent-os/test-context/[TASK_ID].json exists ✓
    - [ ] File contains required keys ✓

  GATE STATUS: __________ (BLOCKED/PASSED)
</step_2_0_completion_gate>

</step_2_0_test_context_gathering>

<step_2_1_test_architecture_red_phase>

#### Step 2.1: Test Architecture & RED Phase Validation

**Execution Order**: AFTER test-context-gatherer (Step 2.0)
**Agent**: test-architect (general-purpose with test focus)
**Purpose**: Create failing tests to establish RED phase of TDD cycle

**Prerequisites**:
- **NEW**: Test context gathered (Step 2.0 complete)
- **NEW**: Context file exists at .agent-os/test-context/[TASK_ID].json
- TDD state initialized in Step 0.5 (current_phase: INIT)
- TDD enforcement enabled in config.yml
- Task requirements and acceptance criteria loaded

<test_creation_workflow>
  **Phase 0: Load Test Context (MANDATORY GATE)**

  BEFORE creating tests, VERIFY and LOAD context:

  VERIFY context file exists:
    FILE_PATH=".agent-os/test-context/[TASK_ID].json"
    
    IF NOT EXISTS:
      ❌ HARD BLOCK: Cannot write tests without context
      ERROR: "Context file missing - test-context-gatherer must run first"
      HALT: Return control to orchestrator
      
      MESSAGE TO ORCHESTRATOR:
        "Step 2.0 (test-context-gatherer) did not complete successfully.
         Required file missing: ${FILE_PATH}
         
         test-architect cannot proceed without test context.
         
         Action required:
         1. Verify Step 2.0 completion gate was checked
         2. Re-run test-context-gatherer if needed
         3. Ensure context file is created before delegating to test-architect"

  LOAD context:
    READ: .agent-os/test-context/[TASK_ID].json
    PARSE JSON
    
    EXTRACT and CONFIRM (state in response):
      - Test Runner: [NAME] v[VERSION]
      - E2E Framework: [NAME] v[VERSION] (if applicable)
      - Mocking patterns: [LIST]
      - Assertion API: [NAME]
    
    IF extraction fails:
      ❌ BLOCK: Context file corrupt or incomplete
      REPORT: "Context file exists but cannot be parsed"
      DETAIL: [Error message from JSON parse or missing keys]
      HALT: Return control to orchestrator

  OPTIONAL context files:
    READ: .agent-os/test-context/patterns/[TEST_RUNNER].md
    EXTRACT:
      - Mocking syntax for this framework
      - Assertion API
      - Lifecycle hooks

  APPLY: Use extracted patterns when writing tests
  AVOID: Documented anti-patterns
  
  CONFIRMATION OUTPUT:
    "✅ Test context loaded successfully
     - Test Runner: [NAME]@[VERSION]
     - E2E Framework: [NAME]@[VERSION]
     - Mocking: [APPROACH]
     - Assertions: [LIBRARY]
     
     Proceeding to test creation with validated context..."
  ```

  **Phase 1: Delegate Test Creation to test-architect Agent**

  DELEGATE to test-architect subagent with TDD-focused prompt:

  ```
  ACTION: Use general-purpose subagent (test-architect role)
  REQUEST: "Create comprehensive failing tests for task requirements (TDD RED phase):

            ═══════════════════════════════════════════════════════════════════
            MANDATORY INSTRUCTION LOADING - DO NOT SKIP
            ═══════════════════════════════════════════════════════════════════

            Before ANY work, you MUST:

            1. READ @.agent-os/instructions/agents/test-architect.md
            2. READ @.agent-os/standards/testing-standards.md
            3. CONFIRM by stating:
               'I have read test-architect.md and testing-standards.md and will follow:
                - Pre-Creation Checklist (all 7 steps before writing tests)
                - Test type declaration and file location standards
                - CI-safe patterns (no watch mode, proper timeouts)
                - Pattern documentation requirements (patterns-used.json)'

            4. PROCEED with test creation only AFTER confirmation

            ═══════════════════════════════════════════════════════════════════
            MANDATORY SKILL INVOCATION (First action)
            ═══════════════════════════════════════════════════════════════════

            INVOKE Skill(skill='agent-os-testing-standards')

            This provides canonical values for timeouts, file locations, and the
            pre-creation checklist. You MUST invoke this skill before writing any tests.

            ═══════════════════════════════════════════════════════════════════
            MANDATORY PRE-CREATION CHECKLIST
            ═══════════════════════════════════════════════════════════════════

            Before writing ANY test file, you MUST:

            1. Complete the Pre-Creation Checklist (all 7 steps from testing-standards.md Section 5)
            2. OUTPUT the checklist confirmation template showing:
               - Test type: [unit|integration|e2e]
               - File location: [path - must match test type standards]
               - CI-safe: [yes - no watch mode, has timeouts]
               - Server dependencies: [list if any]
               - Framework: [detected framework and syntax to use]
            3. ONLY THEN proceed to write tests

            ═══════════════════════════════════════════════════════════════════
            TDD & TEST CONTEXT
            ═══════════════════════════════════════════════════════════════════

            TDD Context:
            - Current Phase: INIT
            - Target Phase: RED (tests must fail initially)
            - Enforcement Level: [STRICT|BALANCED|MINIMAL from config]
            - State File: .agent-os/tdd-state/[TASK_ID].json

            **TEST CONTEXT (from Step 2.0)**:
            - Test Runner: [NAME]@[VERSION]
            - E2E Framework: [NAME]@[VERSION] (if applicable)
            - Backend Testing: [NAME]@[VERSION] (if applicable)
            - Patterns File: .agent-os/test-context/patterns/[RUNNER].md

            **IMPORTANT**: Use the patterns from the context file.
            Do NOT use generic patterns - use the exact API syntax
            documented for the detected framework version.

            Task Requirements:
            [ACCEPTANCE_CRITERIA from task detail file]

            Deliverable Manifest - Test Files:
            [LIST_OF_TEST_FILES_TO_CREATE from deliverable planning]

            ═══════════════════════════════════════════════════════════════════
            TEST CREATION GUIDELINES
            ═══════════════════════════════════════════════════════════════════

            1. Create comprehensive tests covering ALL acceptance criteria
            2. Tests MUST fail initially (implementation doesn't exist yet)
            3. Use descriptive test names indicating expected behavior
            4. Include edge cases and error conditions
            5. Follow project testing standards and conventions
            6. Expected Result: All tests FAIL with meaningful error messages
            7. Failure messages should indicate MISSING implementation (not syntax errors)
            8. **NEW**: Use mocking syntax from gathered context
            9. **NEW**: Use assertion API from gathered context
            10. **NEW**: Avoid documented anti-patterns

            Test-First Requirements:
            - Write tests for features that don't exist yet
            - Tests should fail because functions/classes are undefined
            - Do NOT implement any production code
            - Do NOT make tests pass - they should fail correctly
            - Failure messages should be clear and actionable

            Framework-Specific (from context):
            [PATTERNS_FROM_CONTEXT_FILE]

            Anti-Patterns to Avoid:
            [ANTI_PATTERNS_FROM_CONTEXT_FILE]

            ═══════════════════════════════════════════════════════════════════
            MANDATORY POST-CREATION
            ═══════════════════════════════════════════════════════════════════

            After writing tests, you MUST:

            1. Create .agent-os/test-context/[TASK_ID]-patterns-used.json
            2. Document ALL patterns you used:
               - mocking: { approach, modules_mocked, clearing_strategy }
               - assertions: { library, patterns_used }
               - async_handling: { approach, waiting_patterns }
               - e2e_patterns: { locators, waiting, navigation }
            3. Include critical_notes for implementation phase:
               - Required mocking patterns implementation must use
               - Data structures tests expect
               - Server/environment requirements
               - Any critical integration notes

            This file is MANDATORY for test/code alignment (Step 2.1a).

            ═══════════════════════════════════════════════════════════════════
            VERIFICATION (Orchestrator will check)
            ═══════════════════════════════════════════════════════════════════

            After completion, orchestrator will verify:
            - [ ] Instruction confirmation statement present
            - [ ] Pre-Creation Checklist output present
            - [ ] All test files created
            - [ ] patterns-used.json file created
            - [ ] Tests execute and fail for RIGHT reason

            Verification:
            After test creation, I will execute tests to confirm RED phase.
            Tests must fail for the RIGHT reason (missing implementation),
            not for wrong reasons (syntax errors, import issues, setup problems)."

  COORDINATE: task-orchestrator tracks test file creation
  MONITOR: Ensure test files appear in expected locations
  CAPTURE: List of test files created for verification
  ```

  **Test Creation Success Criteria**:
  - All test files from manifest created
  - Tests use correct framework syntax
  - Test names clearly describe expected behavior
  - No syntax errors in test files
  - Tests import/require non-existent implementation files
  - Tests are ready to execute (setup complete)
</test_creation_workflow>

<post_test_creation_validation>
  **Phase 2: Execute Tests to Validate RED Phase**

  After test-architect completes test creation, IMMEDIATELY execute tests to verify RED phase:

  **File Verification**:
  1. Use Read tool to verify ALL test files from manifest exist
  2. Check test file contents for proper structure
  3. Validate test framework syntax is correct
  4. Ensure no syntax errors in test files

  **Test Execution**:
  1. DETECT test framework (Jest, Vitest, pytest, RSpec, etc.)
  2. DETERMINE test command:
     - Jest/Vitest: `npm test` or `npx jest` or `npx vitest`
     - pytest: `pytest` or `python -m pytest`
     - RSpec: `bundle exec rspec`
     - Detect from package.json, pyproject.toml, or project files
  3. EXECUTE test suite using appropriate command
  4. CAPTURE full test output (stdout + stderr)
  5. SAVE output to: .agent-os/tdd-state/[TASK_ID]-red-output.txt

  **Test Output Analysis**:
  1. PARSE test output using Test Result Analyzer
  2. EXTRACT metrics:
     - Total test count
     - Passed count (should be 0 in RED phase)
     - Failed count (should be > 0)
     - Skipped count
     - Failing test names
     - Error messages from failures
  3. CLASSIFY failure types:
     - ✅ Expected: ReferenceError, NameError, undefined function/class
     - ❌ Unexpected: SyntaxError, ImportError, module not found
     - ❌ Unexpected: All tests passing (no RED phase)
</post_test_creation_validation>

<red_phase_validation_checklist>
  **Phase 3: RED Phase Validation Criteria**

  Execute comprehensive validation to confirm valid RED phase:

  **Validation Checklist**:

  1. **Syntax Error Check** (MUST PASS FIRST):
     - [ ] NO SyntaxError in test output
     - [ ] NO "Test suite failed to run" messages
     - [ ] NO "Cannot find module" for test framework dependencies
     - [ ] NO "Unexpected token" errors
     - [ ] Tests execute but fail (not crash)

     IF syntax errors detected:
       ❌ BLOCK: RED phase invalid
       REASON: Tests have setup/syntax issues preventing execution
       ACTION: Request test-architect fix syntax errors
       RETRY: After fixes, re-execute validation from beginning

  2. **Test Existence Check** (MUST PASS):
     - [ ] Test count > 0 (at least one test exists)
     - [ ] All test files from manifest verified present

     IF no tests found:
       ❌ BLOCK: RED phase invalid
       REASON: No tests created - TDD requires tests first
       ACTION: Request test-architect create tests
       RETRY: After creation, re-execute validation

  3. **Failure Requirement Check** (MUST PASS):
     - [ ] Failed count > 0 (at least one test fails)
     - [ ] NOT all tests passing (passed count < total count)

     IF all tests pass:
       ❌ BLOCK: RED phase invalid
       REASON: Tests cannot pass before implementation exists
       DETAIL: This indicates tests are not validating requirements properly
       ACTION: Request test-architect revise tests to fail when implementation missing
       RETRY: After revision, re-execute validation

  4. **Failure Message Validation** (MUST PASS):
     - [ ] Failure messages indicate missing implementation
     - [ ] Common patterns: "is not defined", "undefined", "NameError", "NoMethodError"
     - [ ] NO patterns: "SyntaxError", "ImportError", "module not found"

     IF failures are wrong type:
       ❌ BLOCK: RED phase invalid
       REASON: Tests failing for wrong reasons (not missing implementation)
       ACTION: Request test-architect fix test setup issues
       RETRY: After fixes, re-execute validation

  5. **Test Quality Check** (ADVISORY):
     - [ ] Test names are descriptive
     - [ ] Tests cover acceptance criteria
     - [ ] Edge cases included
     - [ ] Error conditions tested

     IF quality issues found:
       ⚠️ WARN: Consider improving test quality
       NOTE: Not blocking, but recommend improvements

  **Validation Result Classification**:

  ✅ **VALID_RED_PHASE**:
  - All syntax checks pass
  - Tests exist and execute successfully
  - At least one test fails
  - Failures indicate missing implementation
  - No syntax or setup errors

  ❌ **SYNTAX_ERRORS**:
  - Tests have syntax errors
  - Test suite fails to run
  - Import/module errors

  ❌ **NO_TESTS_FOUND**:
  - No tests created
  - Test count = 0

  ❌ **TESTS_PASSED_PREMATURELY**:
  - All tests pass before implementation
  - No failures detected

  ❌ **INVALID_FAILURES**:
  - Tests fail for wrong reasons
  - Setup or configuration errors
</red_phase_validation_checklist>

<failure_classification>
  ### RED Phase Failure Classification

  **BLOCKING FAILURES** (cannot proceed):
  
  - **NO_TESTS_FOUND**: No tests created, nothing to implement against
    
    **ACTION**: Block, request test-architect to create tests
    
    **REASON**: TDD requires tests first - cannot implement without test specifications
    
    **MESSAGE**:
    ```
    ❌ BLOCKING: No Tests Found
    
    Cannot proceed to implementation without tests.
    TDD workflow requires tests to be created first.
    
    Required Action:
    - Request test-architect to create comprehensive tests
    - Tests must cover all acceptance criteria
    - Tests should fail due to missing implementation
    
    Status: BLOCKED at RED phase
    Next: Create tests, then retry RED phase validation
    ```

  **FIXABLE FAILURES** (can delegate fix):

  - **SYNTAX_ERRORS**: Tests have syntax issues
    
    **ACTION**: Delegate fix to test-architect, then re-validate
    
    **MAX_RETRIES**: 2
    
    **REASON**: Syntax errors prevent test execution - must be fixed before proceeding
    
    **MESSAGE**:
    ```
    ⚠️ FIXABLE: Syntax Errors in Tests
    
    Tests have syntax errors that prevent execution.
    These can be fixed by test-architect.
    
    Error Details:
    [Specific syntax errors from test output]
    
    Required Action:
    - Delegate to test-architect to fix syntax errors
    - Re-run RED phase validation after fixes
    
    Retry Count: [X]/2
    Status: Attempting fix (will block if max retries exceeded)
    ```

  - **TESTS_PASSED_PREMATURELY**: Tests pass before implementation
    
    **ACTION**: Delegate investigation to test-architect
    
    **OUTCOMES**: 
      - Revise tests to properly fail when implementation missing
      - OR: Confirm this is a refactor task (implementation exists)
    
    **MESSAGE**:
    ```
    ⚠️ FIXABLE: Tests Passed Prematurely
    
    All tests passed before implementation exists.
    This indicates tests may not be validating real behavior.
    
    Possible Causes:
    - Tests check trivial conditions
    - Tests don't import non-existent implementation
    - Implementation already exists (refactor task?)
    
    Required Action:
    - Delegate investigation to test-architect
    - OPTION 1: Revise tests to fail when implementation missing
    - OPTION 2: Confirm this is a refactor task
    
    If refactor task:
      - Adjust TDD enforcement level to MINIMAL
      - Skip RED phase requirement
      - Proceed to implementation improvements
    
    Retry Count: [X]/2
    Status: Investigating cause
    ```

  - **INVALID_FAILURES**: Tests fail for wrong reasons (setup issues)
    
    **ACTION**: Delegate fix to test-architect, then re-validate
    
    **MAX_RETRIES**: 2
    
    **REASON**: Tests must fail due to missing implementation, not setup problems
    
    **MESSAGE**:
    ```
    ⚠️ FIXABLE: Invalid Test Failures
    
    Tests are failing, but for the wrong reasons.
    Expected: Failures due to missing implementation
    Actual: Failures due to setup/configuration issues
    
    Error Details:
    [Specific error patterns from test output]
    
    Required Action:
    - Delegate to test-architect to fix test setup
    - Ensure tests can execute properly
    - Re-run RED phase validation after fixes
    
    Retry Count: [X]/2
    Status: Attempting fix (will block if max retries exceeded)
    ```

  **WORKFLOW**:
  ```
  1. Execute tests
  2. Classify result (VALID_RED_PHASE | BLOCKING | FIXABLE)
  3. IF BLOCKING:
       - STOP with clear error message
       - Do NOT proceed to implementation
       - Wait for manual intervention or test creation
  4. IF FIXABLE:
       - Delegate fix to test-architect
       - Track retry count
       - Loop back to step 1 after fix
       - IF retry count > MAX_RETRIES:
           - Escalate to user for decision
           - Provide options: continue with warnings | manual intervention | skip TDD
  5. IF MAX_RETRIES exceeded:
       - ESCALATE to user with detailed report
       - Options:
         * Manual intervention to fix issues
         * Adjust TDD enforcement level
         * Skip TDD for this task (not recommended)
         * Abandon task until issues resolved
  6. IF VALID_RED_PHASE:
       - Proceed to Step 2.2 (GREEN phase implementation)
  ```

  **RETRY TRACKING**:
  ```yaml
  retry_state:
    task_id: [TASK_ID]
    failure_type: [SYNTAX_ERRORS|TESTS_PASSED_PREMATURELY|INVALID_FAILURES]
    retry_count: [current count]
    max_retries: 2
    attempts:
      - attempt: 1
        timestamp: [ISO timestamp]
        failure_reason: [specific reason]
        fix_action: [what was done]
        outcome: [still failed | fixed]
      - attempt: 2
        timestamp: [ISO timestamp]
        failure_reason: [specific reason]
        fix_action: [what was done]
        outcome: [still failed | fixed]
  ```

  **ESCALATION MESSAGE** (when max retries exceeded):
  ```
  ⚠️ ESCALATION: Unable to Achieve Valid RED Phase
  
  After [MAX_RETRIES] attempts, tests still cannot reach valid RED phase.
  
  Failure Type: [SYNTAX_ERRORS|TESTS_PASSED_PREMATURELY|INVALID_FAILURES]
  
  Attempt History:
  [List of all attempts with timestamps, actions, and outcomes]
  
  Current Status:
  - Tests created: [YES/NO]
  - Tests execute: [YES/NO]
  - Tests fail: [YES/NO]
  - Failures valid: [YES/NO]
  
  Options for Resolution:
  
  1. MANUAL INTERVENTION (Recommended)
     - Review test files manually
     - Fix underlying issues
     - Resume RED phase validation
  
  2. ADJUST TDD ENFORCEMENT
     - Change enforcement level to MINIMAL
     - Allow proceeding with warnings
     - Track technical debt
  
  3. SKIP TDD FOR THIS TASK (Not Recommended)
     - Implement without tests first
     - Add tests after implementation
     - Higher risk of bugs
  
  4. ABANDON TASK
     - Mark task as blocked
     - Resolve issues before resuming
     - Investigate root cause
  
  Please choose an option to proceed.
  ```
</failure_classification>

<state_transition_and_blocking>
  **Phase 4: TDD State Transition and Blocking Logic**

  Based on validation results, update TDD state and make blocking decision:

  **IF validation result = VALID_RED_PHASE**:
    ✅ RED phase validated successfully

    1. LOAD TDD state from .agent-os/tdd-state/[TASK_ID].json
    2. CALL TDD State Manager transitionTo('RED')
    3. UPDATE state fields:
       - current_phase: 'RED'
       - test_count: [total tests]
       - test_failures: [failed count]
       - phase_history: append RED phase entry with timestamp
       - updated_at: current timestamp
    4. SAVE updated state to JSON file
    5. LOG success message:
       ```
       ✅ RED Phase Validated Successfully

       Test Results:
       - Total: [X] tests
       - Failed: [Y] tests (as expected)
       - Failures indicate missing implementation

       TDD State Updated:
       - Phase: INIT → RED
       - Test Count: [X]
       - Failures: [Y]

       Proceeding to implementation (GREEN phase)...
       ```
    6. PROCEED to Step 2.2 (implementation streams)

  **IF validation result = SYNTAX_ERRORS**:
    ❌ RED phase validation FAILED - Blocking execution

    ERROR MESSAGE:
    ```
    ❌ RED Phase Validation Failed: Syntax Errors

    Problem:
    Tests have syntax or import errors that prevent proper execution.
    Tests must run successfully but fail due to missing implementation.

    Error Details:
    [Specific syntax errors from test output]

    Required Action:
    1. Fix syntax errors in test files
    2. Ensure all test dependencies are available
    3. Verify test framework is configured correctly
    4. Re-run tests to confirm they execute (and fail correctly)

    TDD Workflow Status:
    1. RED: Write failing tests (YOU ARE HERE - BLOCKED)
       ↳ Tests have syntax errors preventing execution
    2. GREEN: Implement code to pass tests (CANNOT PROCEED)
    3. REFACTOR: Improve code while maintaining tests (CANNOT PROCEED)

    Current Phase: INIT (unchanged - cannot transition to RED)
    ```

    BLOCK: Do not proceed to implementation
    WAIT: For test-architect to fix syntax errors
    RETRY: Re-execute validation after fixes

  **IF validation result = NO_TESTS_FOUND**:
    ❌ RED phase validation FAILED - Blocking execution

    ERROR MESSAGE:
    ```
    ❌ RED Phase Validation Failed: No Tests Created

    Problem:
    No tests were created. TDD requires tests before implementation.

    Required Action:
    1. Create comprehensive tests covering acceptance criteria
    2. Ensure tests fail because implementation doesn't exist yet
    3. Follow test creation guidelines
    4. Verify test files are in correct locations

    TDD Workflow Status:
    1. RED: Write failing tests (YOU ARE HERE - BLOCKED)
       ↳ No tests exist
    2. GREEN: Implement code to pass tests (CANNOT PROCEED)
    3. REFACTOR: Improve code while tests pass (CANNOT PROCEED)

    Current Phase: INIT (unchanged - cannot transition to RED)
    ```

    BLOCK: Do not proceed to implementation
    WAIT: For test-architect to create tests
    RETRY: Re-execute validation after test creation

  **IF validation result = TESTS_PASSED_PREMATURELY**:
    ❌ RED phase validation FAILED - Blocking execution

    ERROR MESSAGE:
    ```
    ❌ RED Phase Validation Failed: Tests Passed Prematurely

    Problem:
    All tests passed before implementation exists.
    This indicates tests are not properly validating requirements.

    Test Results:
    - Total: [X] tests
    - Passed: [X] tests (should be 0)
    - Failed: 0 tests (should be > 0)

    Common Causes:
    - Tests are checking trivial conditions
    - Tests are not actually importing implementation
    - Tests have incorrect assertions
    - Implementation already exists (check if this is a refactor task)

    Required Action:
    1. Review test assertions to ensure they test actual functionality
    2. Verify tests import/require implementation that doesn't exist yet
    3. Ensure tests fail when implementation is missing
    4. Consider if this is a refactoring task (implementation exists)

    TDD Workflow Status:
    1. RED: Write failing tests (YOU ARE HERE - BLOCKED)
       ↳ Tests pass without implementation (invalid RED phase)
    2. GREEN: Implement code to pass tests (CANNOT PROCEED)
    3. REFACTOR: Improve code while tests pass (CANNOT PROCEED)

    Current Phase: INIT (unchanged - cannot transition to RED)

    Note: If this is a refactoring task where implementation exists,
    enforcement level may need adjustment (use MINIMAL for refactor tasks).
    ```

    BLOCK: Do not proceed to implementation
    WAIT: For test-architect to revise tests
    RETRY: Re-execute validation after revision

  **IF validation result = INVALID_FAILURES**:
    ❌ RED phase validation FAILED - Blocking execution

    ERROR MESSAGE:
    ```
    ❌ RED Phase Validation Failed: Invalid Test Failures

    Problem:
    Tests are failing, but for the wrong reasons (not missing implementation).

    Failure Analysis:
    [Specific error patterns found]

    Expected Failure Patterns (valid RED):
    - ReferenceError: [function] is not defined
    - NameError: name '[function]' is not defined
    - NoMethodError: undefined method '[function]'
    - Cannot find [implementation file]

    Unexpected Failure Patterns (invalid RED):
    - SyntaxError: Invalid syntax
    - ImportError: Cannot import module
    - Test suite failed to run
    - Configuration errors

    Required Action:
    1. Fix test setup and configuration issues
    2. Ensure test framework dependencies are installed
    3. Verify import paths are correct (for non-existent implementation)
    4. Re-run tests to confirm failures indicate missing implementation

    TDD Workflow Status:
    1. RED: Write failing tests (YOU ARE HERE - BLOCKED)
       ↳ Tests fail for wrong reasons (setup issues)
    2. GREEN: Implement code to pass tests (CANNOT PROCEED)
    3. REFACTOR: Improve code while tests pass (CANNOT PROCEED)

    Current Phase: INIT (unchanged - cannot transition to RED)
    ```

    BLOCK: Do not proceed to implementation
    WAIT: For test-architect to fix test issues
    RETRY: Re-execute validation after fixes

  **Enforcement Level Adjustments**:

  - **STRICT enforcement**: BLOCK on any validation failure
  - **BALANCED enforcement**: BLOCK on SYNTAX_ERRORS and NO_TESTS_FOUND, WARN on others
  - **MINIMAL enforcement**: LOG validation results, allow proceeding with warning

  Enforcement level from config.yml (loaded in Step 0.5) determines blocking behavior.
</state_transition_and_blocking>

<evidence_collection>
  **Phase 5: Evidence Collection and Documentation**

  Capture evidence of RED phase validation for audit and verification:

  **Files to Create**:

  1. **Test Output Capture**:
     - Path: `.agent-os/tdd-state/[TASK_ID]-red-output.txt`
     - Contents: Full test execution output (stdout + stderr)
     - Purpose: Evidence of test failures, debugging reference

  2. **Validation Report**:
     - Path: `.agent-os/tdd-state/[TASK_ID]-red-validation.yml`
     - Format:
       ```yaml
       validation_timestamp: [ISO_timestamp]
       task_id: [TASK_ID]
       phase: RED
       validation_result: [VALID_RED_PHASE|SYNTAX_ERRORS|etc.]

       test_execution:
         framework: [jest|vitest|pytest|rspec]
         command: [test command used]
         exit_code: [exit code]
         duration_seconds: [execution time]

       test_metrics:
         total_count: [number]
         passed_count: [number]
         failed_count: [number]
         skipped_count: [number]

       validation_checks:
         syntax_errors: [true|false]
         tests_exist: [true|false]
         has_failures: [true|false]
         failure_types_valid: [true|false]
         test_quality: [pass|warn|fail]

       failing_tests:
         - test_name: [name]
           error_type: [ReferenceError|NameError|etc.]
           error_message: [message]

       state_transition:
         from_phase: INIT
         to_phase: [RED|INIT if blocked]
         transition_successful: [true|false]
         blocking_reason: [reason if blocked]

       next_steps:
         proceed_to_implementation: [true|false]
         required_actions: [list of actions if blocked]
       ```

  3. **Update TDD State**:
     - Path: `.agent-os/tdd-state/[TASK_ID].json`
     - Updated fields: current_phase, test_count, test_failures, phase_history

  **Evidence Integration**:
  - Link validation report in Step 3 verification
  - Include test output in task completion documentation
  - Reference RED phase evidence in acceptance criteria verification
</evidence_collection>

<integration_with_orchestration>
  **Step 2.1 Integration Points**:

  **Input from Previous Steps**:
  - Step 0.5: TDD state initialized (current_phase: INIT)
  - Step 1: Deliverable manifest with test file list
  - Step 1: Task requirements and acceptance criteria

  **Output to Next Steps**:
  - Step 2.2+: GREEN phase implementation (if RED validated)
  - Step 3: RED phase validation evidence for verification
  - Step 4: Test metrics and evidence for completion report

  **Coordination with Parallel Streams**:
  - Step 2.1 executes FIRST (sequential, not parallel)
  - Implementation streams (2.2+) WAIT for RED phase validation
  - If RED phase blocked, implementation cannot proceed
  - After RED validation, parallel streams can execute simultaneously

  **Error Recovery**:
  - Validation failures return to test-architect for fixes
  - Up to 3 retry attempts for test creation/fixes
  - After 3 failures, escalate to human intervention
  - Capture all attempts in validation evidence
</integration_with_orchestration>

<step_2_1_exit_gate>
  ### Step 2.1 Exit Gate (RED Phase Completion)

  BEFORE proceeding to Step 2.2 (GREEN phase), verify:

  REQUIRED FILES:
  - [ ] All test files from deliverable manifest exist
  - [ ] .agent-os/test-context/[TASK_ID]-patterns-used.json EXISTS
  - [ ] patterns-used.json contains: mocking, assertions, async_handling

  TEST EXECUTION RESULTS:
  - [ ] Tests execute without syntax errors
  - [ ] Tests FAIL (indicating missing implementation)
  - [ ] Failures are for RIGHT reason (missing impl, not setup errors)

  IF patterns-used.json MISSING:
    ❌ BLOCK: Cannot proceed without pattern documentation
    ACTION: Request test-architect to create pattern documentation
    REFERENCE: @instructions/agents/test-architect.md → Post-Creation Pattern Documentation

  IF tests pass prematurely:
    ⚠️ WARNING: Tests pass before implementation - investigate
    OPTIONS:
      - Tests may not be validating real behavior
      - Implementation may already exist (refactor task?)
    ACTION: Request test-architect review

  GATE STATUS: __________ (BLOCKED/PASSED)
</step_2_1_exit_gate>

</step_2_1_test_architecture_red_phase>

<step_2_2_implementation_green_phase>

#### Step 2.2: Implementation & GREEN Phase Validation

**Execution Order**: SECOND (after RED phase validated)
**Agent**: implementation-specialist (or frontend/backend specialist based on task)
**Purpose**: Implement minimal code to make failing tests pass (GREEN phase)

**Prerequisites**:
- RED phase validated in Step 2.1 (tests failing correctly)
- TDD state transitioned to RED phase
- Failing test output captured and analyzed
- Test failure patterns understood

<skill_invocation_for_implementation>
  **Phase 0: Load Implementation Patterns (v3.2+)**

  **⚠️ MANDATORY PATTERN LOOKUP - DO NOT SKIP**

  ```
  STEP 1: CHECK PROJECT-SPECIFIC PATTERNS FIRST

  CHECK: .agent-os/patterns/ directory in the project

  IF .agent-os/patterns/ exists:
    READ relevant files based on task type (these take PRECEDENCE):
    - .agent-os/patterns/frontend/typescript.md (TypeScript/React)
    - .agent-os/patterns/backend/python.md (Python)
    - .agent-os/patterns/backend/rails.md (Rails)
    - .agent-os/patterns/backend/api.md (API development)
    - .agent-os/patterns/global/error-handling.md (Error handling)

  Project-specific patterns reflect the actual codebase conventions.

  STEP 2: INVOKE SKILLS FOR GENERIC PATTERNS (MANDATORY)

  EXECUTE NOW - These are required tool calls:

    Skill(skill="agent-os-patterns")
    Skill(skill="agent-os-specialists")
  ```

  After invoking the skills, READ the relevant reference files:

  | Task Type | Skill Reference (Generic) |
  |-----------|---------------------------|
  | Code style | agent-os-patterns → references/global/coding-style.md |
  | Testing | agent-os-patterns → references/testing/*.md |

  | Task Type | Specialist Reference |
  |-----------|----------------------|
  | Node.js backend | agent-os-specialists → references/development/backend-nodejs.md |
  | React frontend | agent-os-specialists → references/development/frontend-react.md |
  | Vue frontend | agent-os-specialists → references/development/frontend-vue.md |
  | General | agent-os-specialists → references/development/implementation.md |

  **VERIFICATION** before proceeding to Phase 1:
  - [ ] Checked .agent-os/patterns/ for project-specific patterns
  - [ ] Skill(skill="agent-os-patterns") was invoked
  - [ ] Skill(skill="agent-os-specialists") was invoked
  - [ ] Relevant reference files were read
  - [ ] Implementation patterns are loaded

  **OUTPUT**:
  "✅ Project patterns: [list if found] (from .agent-os/patterns/)"
  "✅ Skill patterns: coding-style.md, backend-nodejs.md"
</skill_invocation_for_implementation>

<step_2_1a_pattern_context_handoff>
#### Step 2.1a: Pattern Documentation Gate (v3.3.0+ - BLOCKING)

**Execution Order**: AFTER RED phase validation (Step 2.1), BEFORE implementation
**Purpose**: BLOCKING gate to ensure test patterns are documented before implementation can proceed

**CRITICAL**: This step prevents test/code misalignment by requiring pattern documentation before implementation.

<pattern_documentation_verification>
  **Verify Pattern Documentation Exists (BLOCKING)**

  BEFORE proceeding to implementation, this gate MUST pass:

  **REQUIRED VERIFICATION**:
  ```
  FILE_PATH=".agent-os/test-context/[TASK_ID]-patterns-used.json"
  ```

  **CHECK 1: File Existence (BLOCKING)**
  
  IF file does NOT exist:
    ```
    ❌ BLOCK: Cannot proceed to implementation phase
    
    ERROR: "Pattern documentation missing: ${FILE_PATH}"
    
    REASON: Test-architect did not create patterns-used.json.
            This file is MANDATORY for test/code alignment.
    
    ACTION: Return to test-architect with explicit requirement:
      "Test phase incomplete. You MUST create patterns-used.json with:
       - patterns_used.mocking (approach and modules)
       - patterns_used.assertions (library and patterns)
       - patterns_used.async_handling (approach and patterns)
       - patterns_used.e2e_patterns (locators, waiting, navigation - if applicable)
       - critical_notes (implementation guidance)"
    
    DO NOT proceed to Step 2.2 until file exists.
    
    REFERENCE: @.agent-os/instructions/utilities/test-code-alignment-checklist.md
    ```
    
    **GATE STATUS: BLOCKED**
    **NEXT STEP: Fix pattern documentation, then retry this gate**

  **CHECK 2: Content Structure Validation**
  
  IF file exists:
    READ file and VALIDATE content structure:
    
    REQUIRED sections (MUST be present):
      - patterns_used.mocking ✓/✗
      - patterns_used.assertions ✓/✗
      - critical_notes ✓/✗
    
    RECOMMENDED sections (should be present):
      - patterns_used.async_handling ✓/✗
      - patterns_used.e2e_patterns ✓/✗ (if E2E tests exist)
    
    IF any REQUIRED section missing:
      ```
      ⚠️ WARN: Pattern file incomplete
      
      Missing required sections:
      [LIST missing sections]
      
      Current file structure:
      [SHOW what exists in file]
      
      PROMPT user: "Pattern file is incomplete. Options:
                   1. return - Send back to test-architect to complete
                   2. continue - Proceed with incomplete patterns (RISKY - may cause alignment issues)"
      ```
      
      IF user chooses "return":
        ❌ BLOCK: Return to test-architect
        ACTION: Request completion of missing sections
      
      IF user chooses "continue":
        ⚠️ PROCEED with warning
        LOG: "Proceeding with incomplete pattern documentation - alignment issues may occur"

  **CHECK 3: Pattern Content Validation**
  
  IF file exists and structure valid:
    VALIDATE each pattern section has content:
    
    - mocking.approach: not empty ✓/✗
    - mocking.modules_mocked: array with entries ✓/✗
    - assertions.library: not empty ✓/✗
    - assertions.patterns: array with entries ✓/✗
    - critical_notes: not empty ✓/✗
    
    IF any section is empty/null:
      ⚠️ WARN: Pattern sections exist but lack detail
      LOG warning but do not block

  **GATE PASSED**:
  ```
  ✅ Pattern documentation verified
  
  File: .agent-os/test-context/[TASK_ID]-patterns-used.json
  
  Verified sections:
  - patterns_used.mocking ✓
  - patterns_used.assertions ✓
  - critical_notes ✓
  
  GATE STATUS: PASSED
  PROCEED to context handoff
  ```
</pattern_documentation_verification>

<context_handoff_to_implementation>
  **Pass Pattern Context to Implementation Specialist**

  When delegating to implementation-specialist, INCLUDE pattern context:

  ```
  MANDATORY CONTEXT FOR IMPLEMENTATION:

  **PATTERN DOCUMENTATION** (READ THIS FIRST):
  File: .agent-os/test-context/[TASK_ID]-patterns-used.json

  **ALIGNMENT CHECKLIST** (FOLLOW THIS):
  @.agent-os/instructions/utilities/test-code-alignment-checklist.md

  Before writing ANY implementation code:
  1. READ the pattern documentation file above
  2. NOTE the mocking approach tests use
  3. NOTE the assertion patterns tests expect
  4. NOTE any critical implementation notes
  5. IMPLEMENT code that integrates with these patterns

  **SPECIFIC PATTERNS TO HONOR**:
  - Mocking: [EXTRACT FROM PATTERN FILE]
  - Assertions: [EXTRACT FROM PATTERN FILE]
  - Async: [EXTRACT FROM PATTERN FILE]
  - Server Requirements: [EXTRACT FROM PATTERN FILE]

  Your implementation MUST work with the test patterns, not against them.
  ```
</context_handoff_to_implementation>
</step_2_1a_pattern_context_handoff>

<step_2_2_prerequisite>
### Step 2.2 Prerequisite: Pattern File Confirmation (MANDATORY)

**BEFORE delegating to implementation-specialist, verify pattern documentation:**

**Prerequisite Check**:

1. **VERIFY patterns-used.json exists** (should have passed Step 2.1a):
   ```
   FILE: .agent-os/test-context/[TASK_ID]-patterns-used.json
   
   CHECK: File exists and passed Step 2.1a gate
   
   IF file does NOT exist:
     ❌ CRITICAL ERROR: Step 2.1a gate was bypassed
     ACTION: HALT implementation and return to Step 2.1a
     MESSAGE: "Cannot proceed - pattern documentation gate not completed"
   ```

2. **READ the patterns file and extract key patterns**:
   ```
   READ: .agent-os/test-context/[TASK_ID]-patterns-used.json
   
   EXTRACT and PREPARE for delegation:
   - MOCKING_APPROACH: patterns_used.mocking.approach
   - MOCKING_MODULES: patterns_used.mocking.modules_mocked
   - ASSERTION_LIBRARY: patterns_used.assertions.library
   - ASSERTION_PATTERNS: patterns_used.assertions.patterns
   - ASYNC_APPROACH: patterns_used.async_handling.approach (if present)
   - E2E_PATTERNS: patterns_used.e2e_patterns (if present)
   - CRITICAL_NOTES: critical_notes
   ```

3. **INCLUDE extracted patterns in delegation prompt** (see below):
   The delegation prompt MUST include the pattern context section with
   SPECIFIC patterns extracted from the file (not generic placeholders).

**Prerequisite Verification Checklist**:
- [ ] patterns-used.json file exists
- [ ] File content has been read
- [ ] Key patterns have been extracted
- [ ] Patterns will be included in delegation prompt (see Phase 1 below)

**IF VERIFICATION FAILS**:
```
❌ BLOCK: Cannot delegate to implementation-specialist

Pattern documentation prerequisite not met.
Step 2.1a must complete successfully before proceeding.

REQUIRED ACTION:
1. Ensure test-architect created patterns-used.json
2. Verify Step 2.1a gate passed
3. Retry Step 2.2 after prerequisite met
```

**IF VERIFICATION PASSES**:
```
✅ Prerequisites verified - proceeding to delegation

Pattern file: .agent-os/test-context/[TASK_ID]-patterns-used.json
Patterns extracted and ready for delegation
```

</step_2_2_prerequisite>

<implementation_workflow>
  **Phase 1: Delegate Implementation to Specialist Agents**

  After prerequisites verified (Step 2.2 prerequisite above):

  DELEGATE to appropriate specialist agents based on task type:

  ```
  ACTION: Use specialist subagents (frontend, backend, or implementation-specialist)
  REQUEST: "Implement minimal code to pass failing tests (TDD GREEN phase):

            ═══════════════════════════════════════════════════════════════════
            MANDATORY PATTERN READING - DO NOT SKIP
            ═══════════════════════════════════════════════════════════════════
            
            BEFORE implementing, you MUST read and acknowledge the test patterns:
            
            Pattern File: .agent-os/test-context/[TASK_ID]-patterns-used.json
            
            Key patterns you MUST honor (extracted from patterns-used.json):
            
            **Mocking:**
            - Approach: [MOCKING_APPROACH]
            - Modules mocked: [MOCKING_MODULES]
            - Clearing strategy: [from file if present]
            
            **Assertions:**
            - Library: [ASSERTION_LIBRARY]
            - Patterns used: [ASSERTION_PATTERNS]
            
            **Async Handling:**
            - Approach: [ASYNC_APPROACH]
            - Waiting patterns: [from file if present]
            
            **E2E Patterns (if applicable):**
            - Locators: [E2E locator strategy from file]
            - Waiting: [E2E waiting patterns from file]
            - Navigation: [E2E navigation patterns from file]
            
            **Critical Implementation Notes:**
            [CRITICAL_NOTES - these are specific constraints from test-architect]
            
            ═══════════════════════════════════════════════════════════════════
            MANDATORY CONFIRMATION
            ═══════════════════════════════════════════════════════════════════
            
            You MUST confirm understanding by stating:
            
            "I have read patterns-used.json and will:
             - Use [MOCKING_APPROACH] for mocking
             - Ensure code works with [ASSERTION_LIBRARY] assertions
             - Use [ASYNC_APPROACH] for async operations
             - Honor these critical constraints:
               [LIST specific constraints from CRITICAL_NOTES]"
            
            This confirmation is MANDATORY. You must demonstrate you understand
            the SPECIFIC patterns before writing code that integrates with them.
            
            ═══════════════════════════════════════════════════════════════════
            ADDITIONAL READING
            ═══════════════════════════════════════════════════════════════════
            
            Also READ:
            1. @.agent-os/instructions/agents/implementation-specialist.md
            2. @.agent-os/instructions/utilities/test-code-alignment-checklist.md

            ═══════════════════════════════════════════════════════════════════
            ALIGNMENT REQUIREMENT
            ═══════════════════════════════════════════════════════════════════

            Your implementation MUST align with test patterns:

            - Use mocking patterns that tests expect
              (if tests mock axios, you MUST use axios, not fetch)
            - Return data structures that match test assertions
              (if tests expect array, return array, not object)
            - Throw error types that tests catch
              (if tests expect CustomError, throw CustomError)
            - Use async patterns tests expect
              (if tests expect promises, return promises, not callbacks)
            - Include data-testid attributes for E2E locators
              (if tests use data-testid='submit-btn', add that attribute)

            Alignment is CRITICAL. Misalignment causes test failures and rework.

            ═══════════════════════════════════════════════════════════════════
            TDD CONTEXT
            ═══════════════════════════════════════════════════════════════════

            TDD Context:
            - Current Phase: RED (tests are failing)
            - Target Phase: GREEN (make tests pass)
            - Enforcement Level: [STRICT|BALANCED|MINIMAL from config]
            - State File: .agent-os/tdd-state/[TASK_ID].json
            - Failing Tests: [COUNT] tests failing

            **PATTERN CONTEXT (v3.3.0+ - MANDATORY)**:
            - Pattern File: .agent-os/test-context/[TASK_ID]-patterns-used.json
            - Alignment Checklist: @.agent-os/instructions/utilities/test-code-alignment-checklist.md
            - READ pattern file BEFORE implementing (see above)
            - HONOR test patterns in your implementation

            RED Phase Evidence:
            - Test Output: .agent-os/tdd-state/[TASK_ID]-red-output.txt
            - Failing Test Names: [LIST_OF_FAILING_TESTS]
            - Expected Errors: [ReferenceError|NameError|undefined function/class]

            ═══════════════════════════════════════════════════════════════════
            IMPLEMENTATION GUIDELINES
            ═══════════════════════════════════════════════════════════════════

            1. Implement MINIMAL code to make tests pass
            2. Focus on making tests green, not perfect code
            3. Avoid over-engineering or premature optimization
            4. Implement only what tests require (no extra features)
            5. Follow YAGNI principle (You Aren't Gonna Need It)
            6. Write simple, clear, working code
            7. Leave refactoring for REFACTOR phase

            Minimal Implementation Principles:
            - Simplest solution that passes tests
            - No unnecessary abstractions
            - No speculative features
            - No premature optimizations
            - Hard-coded values are OK if tests pass
            - Refactoring comes later (REFACTOR phase)

            Test-Driven Implementation:
            - Run tests frequently during implementation
            - Implement one test at a time (if practical)
            - Verify tests turn from RED → GREEN
            - Do NOT implement features beyond test coverage
            - Do NOT add functionality tests don't validate

            Expected Result:
            - All previously failing tests now PASS
            - No new test failures introduced
            - Implementation is minimal but correct
            - Code is clean and readable (but not over-engineered)

            ═══════════════════════════════════════════════════════════════════
            VERIFICATION (Orchestrator will check)
            ═══════════════════════════════════════════════════════════════════

            After completion, orchestrator will verify:
            
            **Pattern Acknowledgment (MANDATORY):**
            - [ ] Confirmation statement present with SPECIFIC patterns stated
            - [ ] Statement mentions SPECIFIC mocking approach (not generic)
            - [ ] Statement mentions SPECIFIC assertion library (not generic)
            - [ ] Statement lists critical constraints from patterns-used.json
            
            **Pattern Reference Check:**
            - [ ] Response references patterns-used.json file
            - [ ] Response mentions specific patterns from the file
            - [ ] Response shows understanding of constraints
            
            **IF Pattern Acknowledgment MISSING:**
            ```
            ⚠️ WARN: Implementation may not align with tests
            
            Subagent did not confirm reading patterns-used.json or did not
            state SPECIFIC patterns they will follow.
            
            RISK: Implementation may use different patterns than tests expect,
                  causing alignment issues and test failures.
            
            ACTION OPTIONS:
            1. Re-prompt subagent to read patterns-used.json and confirm
            2. Continue with warning (monitor for alignment issues)
            3. Review implementation manually for pattern alignment
            
            RECOMMENDED: Re-prompt for explicit pattern confirmation
            ```
            
            **IF Pattern Acknowledgment PRESENT:**
            ```
            ✅ Pattern acknowledgment verified
            
            Subagent confirmed:
            - Mocking approach: [approach from response]
            - Assertion library: [library from response]
            - Critical constraints: [listed constraints]
            
            Proceeding to alignment validation (Step 2.2a)
            ```
            
            **Final Verification (Step 2.2a):**
            - [ ] Implementation aligns with patterns-used.json (tested in Step 2.2a)
            - [ ] All tests pass (alignment validation in Step 2.2a)
            - [ ] No test bypasses or hardcoded shortcuts"

  COORDINATE: task-orchestrator monitors implementation progress
  MONITOR: Track which tests transition from failing → passing
  EXECUTE: Run tests periodically to track GREEN phase progress
  ```

  **Implementation Success Criteria**:
  - All implementation files from manifest created
  - Code implements functionality tests expect
  - Implementation is minimal (not over-engineered)
  - Code follows project conventions and standards
  - No unnecessary complexity introduced
</implementation_workflow>

<continuous_test_monitoring>
  **Phase 2: Continuous Test Execution During Implementation**

  Monitor test status continuously during implementation to track GREEN phase progress:

  **Test Execution Strategy**:

  1. **Baseline Capture** (at implementation start):
     - Execute tests before implementation begins
     - Capture initial failure count and failing test names
     - Save baseline: .agent-os/tdd-state/[TASK_ID]-baseline.txt

  2. **Periodic Test Execution** (during implementation):
     - Execute tests every N minutes (configurable, default: 5 minutes)
     - OR: Execute tests after each significant code change
     - Track failing → passing transition for each test
     - Calculate progress: (passing_count / total_count) * 100

  3. **Progress Monitoring**:
     - Display progress updates:
       ```
       🟢 GREEN Phase Progress: 3/10 tests passing (30%)
       ⏱️ Time elapsed: 15 minutes
       📈 Pace: 0.2 tests/minute
       🎯 Estimated completion: ~35 minutes
       ```
     - Update orchestrator with progress status
     - Alert if progress stalls (no new passing tests in 15+ minutes)

  4. **Completion Detection**:
     - GREEN phase complete when: passed_count == total_count
     - All tests must pass (100% pass rate required)
     - No skipped tests (unless intentional and documented)

  **Test Monitoring Commands** (v3.3.0+ with Real-Time Streaming):

  ```bash
  # PREFERRED: Use Agent OS Test Monitor for real-time visibility
  # This provides hung test detection and per-test progress tracking

  # For Vitest (with streaming reporter)
  node ~/.agent-os/hooks/lib/test-monitor.js \
    pnpm vitest run --reporter=./scripts/reporters/vitest-streaming.js

  # For Playwright (with streaming reporter)
  node ~/.agent-os/hooks/lib/test-monitor.js \
    pnpm playwright test --reporter=./scripts/reporters/playwright-streaming.ts

  # Environment variables for test monitor:
  # AGENT_OS_TEST_TIMEOUT=30000   # Per-test timeout (ms)
  # AGENT_OS_IDLE_TIMEOUT=15000   # Idle detection timeout (ms)
  # AGENT_OS_ON_HUNG=alert        # Action: alert|kill|skip
  # AGENT_OS_TEST_OUTPUT=./test-events.json  # Save events to file
  ```

  **Real-Time Monitoring Benefits**:
  - Per-test progress visibility (see which test is running)
  - Hung test detection (alert/kill after configurable timeout)
  - Idle detection (no output = potential hang)
  - Structured JSON events for parsing
  - Immediate intervention on issues
</continuous_test_monitoring>

<step_2_2a_alignment_validation>
#### Step 2.2a: Test/Code Alignment Validation (v3.3.0+)

**Execution Order**: AFTER implementation complete, BEFORE marking GREEN phase done
**Purpose**: Verify implementation code properly integrates with test patterns

**CRITICAL**: This step catches alignment issues before they cause E2E rework.

<alignment_validation_process>
  **Validate Test/Code Alignment**

  BEFORE transitioning to GREEN phase complete:

  REFERENCE: @.agent-os/instructions/utilities/test-code-alignment-checklist.md

  **ALIGNMENT VALIDATION REFERENCE:**
    Skill(skill='agent-os-testing-standards') → references/validation-checklist.md
    
  The validation checklist and bypass detection patterns are available in the skill.
  Orchestrator can reference this skill for alignment validation criteria.

  **VALIDATION CHECKLIST:**

  **A. PATTERN INTEGRATION CHECK:**
     - [ ] Implementation uses mocking approach from patterns-used.json
     - [ ] Return types match test assertion expectations
     - [ ] Async handling matches test patterns (callbacks, promises, async/await)
     - [ ] Error types match test catch expectations
     - [ ] Data structures returned match test expectations

     **How to Verify:**
     1. READ: .agent-os/test-context/[TASK_ID]-patterns-used.json
     2. EXTRACT: mocking.approach, assertions.patterns, async_handling
     3. READ: Implementation files from deliverable manifest
     4. COMPARE: Implementation patterns vs test patterns
     5. CONFIRM: Patterns are compatible

     **Common Issues:**
     - Implementation uses callbacks but tests expect promises
     - Implementation throws Error but tests expect CustomError
     - Implementation returns object but tests expect array
     - Implementation uses different module mocking approach

  **B. STRUCTURE ALIGNMENT CHECK:**
     - [ ] Mocked modules in tests are actually called in implementation
     - [ ] Test data structures match implementation returns
     - [ ] E2E locators (data-testid) exist in components
     - [ ] API contracts match between test mocks and implementation
     - [ ] Function signatures match test calls

     **How to Verify:**
     1. GREP for module imports in implementation files
     2. COMPARE with mocked modules list in patterns-used.json
     3. VERIFY implementation actually uses mocked dependencies
     4. CHECK E2E tests for data-testid locators
     5. GREP implementation for matching data-testid attributes
     6. VERIFY API endpoint paths match between tests and routes

     **Common Issues:**
     - Tests mock 'axios' but implementation uses 'fetch'
     - E2E tests use data-testid="submit-btn" but component has id="submit-btn"
     - Tests mock '/api/users' but implementation calls '/users'
     - Tests expect getUser() but implementation has fetchUser()

  **C. BYPASS LOGIC CHECK:**
     - [ ] No hardcoded returns bypassing real logic
     - [ ] No process.env.TEST branches in production code
     - [ ] No stub implementations (functions that just return empty values)
     - [ ] No test-specific code paths in production files

     **How to Verify:**
     1. GREP implementation for patterns:
        - `process.env.TEST`
        - `process.env.NODE_ENV === 'test'`
        - `if (process.env.TESTING)`
        - `jest.fn()` or `vi.fn()` in non-test files
     2. READ implementation functions for:
        - Functions that just return hardcoded values
        - Missing logic that tests should validate
        - Suspiciously simple implementations
     3. VERIFY coverage is from real logic, not shortcuts

     **Common Issues:**
     - `function getUser() { return { id: 1 } }` (hardcoded, bypasses real logic)
     - `if (process.env.TEST) return mockData;` (test-specific bypass)
     - `function save() { }` (empty stub that makes tests pass)

  **D. COVERAGE VALIDATION:**
     - [ ] Coverage >= 85% (from config.yml test_code_alignment.alignment_validation.coverage_threshold)
     - [ ] All new code paths covered by tests
     - [ ] Critical paths not uncovered (no untested error handlers)
     - [ ] Coverage metrics are from real execution, not stubs

     **How to Verify:**
     ```bash
     # Run coverage check
     pnpm vitest run --coverage

     # Check thresholds:
     # Line coverage: >= 85%
     # Branch coverage: >= 80%
     # Function coverage: >= 85%
     # Statement coverage: >= 85%
     ```

     **Read coverage report:**
     1. CHECK: coverage/index.html or terminal output
     2. IDENTIFY: Any uncovered lines in new files
     3. VERIFY: Uncovered lines are acceptable (edge cases, defensive code)
     4. CONFIRM: Main code paths are covered

     **Common Issues:**
     - High coverage from stub functions (false positive)
     - Error handlers not covered
     - Edge cases not tested
     - Coverage < 85% due to incomplete tests

  **IF ANY CHECK FAILS:**
    ❌ BLOCK: Alignment validation failed
    ACTION: Request implementation-specialist to fix alignment issues
    
    **SPECIFIC FAILURE RESPONSES:**

    **Pattern Integration Failure:**
    ```
    ❌ Alignment Issue: Pattern Integration Mismatch

    Problem: Implementation patterns don't match test patterns
    
    Details:
    - Test expects: [pattern from patterns-used.json]
    - Implementation uses: [detected pattern]
    - File: [implementation file]
    
    Required Action:
    1. Review patterns-used.json for test expectations
    2. Modify implementation to use compatible patterns
    3. OR: Modify tests if implementation pattern is correct
    4. Re-run alignment validation after fixes
    
    Examples:
    - If tests mock axios, implementation must use axios (not fetch)
    - If tests expect promises, implementation must return promises (not callbacks)
    - If tests expect CustomError, implementation must throw CustomError
    ```

    **Structure Alignment Failure:**
    ```
    ❌ Alignment Issue: Structure Mismatch

    Problem: Test and code structures don't align
    
    Details:
    - Missing locators: [list of data-testid missing in components]
    - Mocked modules not used: [list of mocked modules not imported]
    - API path mismatches: [list of path differences]
    
    Required Action:
    1. Add missing data-testid attributes to components
    2. Update implementation to use mocked modules
    3. Align API endpoint paths between tests and routes
    4. Re-run alignment validation after fixes
    ```

    **Bypass Logic Detected:**
    ```
    ⚠️ Alignment Issue: Test Bypass Patterns Found

    Problem: Implementation contains test-specific code or stubs
    
    Details:
    - Files with bypass patterns: [list]
    - Detected patterns: [process.env.TEST, hardcoded returns, etc.]
    
    Required Action:
    1. Remove test-specific conditionals from production code
    2. Replace hardcoded returns with real logic
    3. Implement actual functionality instead of stubs
    4. Re-run tests to ensure real code works
    5. Re-run alignment validation after fixes
    ```

    **Coverage Below Threshold:**
    ```
    ❌ Alignment Issue: Coverage Below Threshold

    Problem: Test coverage does not meet minimum requirements
    
    Current Coverage:
    - Line: [X]% (required: >= 85%)
    - Branch: [Y]% (required: >= 80%)
    - Function: [Z]% (required: >= 85%)
    
    Uncovered Areas:
    - [List of uncovered files or functions]
    
    Required Action:
    1. Add tests for uncovered code paths
    2. OR: Justify why certain code is acceptable to leave uncovered
    3. Re-run coverage after adding tests
    4. Re-run alignment validation after fixes
    ```

  **IF ALL CHECKS PASS:**
    ✅ PROCEED to GREEN phase completion

    **Success Output:**
    ```
    ✅ Test/Code Alignment Validated Successfully

    Pattern Integration:
    - Mocking approach: ✓ Compatible
    - Assertion patterns: ✓ Compatible
    - Async handling: ✓ Matches
    - Error types: ✓ Match

    Structure Alignment:
    - Mocked modules: ✓ All used in implementation
    - Data structures: ✓ Match test expectations
    - E2E locators: ✓ All present in components
    - API contracts: ✓ Aligned

    Bypass Logic:
    - Test-specific code: ✓ None detected
    - Hardcoded returns: ✓ None detected
    - Stub implementations: ✓ None detected

    Coverage:
    - Line: [X]% ✓ (>= 85%)
    - Branch: [Y]% ✓ (>= 80%)
    - Function: [Z]% ✓ (>= 85%)
    - Critical paths: ✓ All covered

    GATE STATUS: PASSED

    Proceeding to GREEN phase completion...
    ```

  **GATE STATUS:** __________ (BLOCKED/PASSED)
</alignment_validation_process>
</step_2_2a_alignment_validation>

<green_phase_validation_checklist>
  **Phase 3: GREEN Phase Validation Criteria**

  After implementation completes, validate GREEN phase before transitioning:

  **Validation Checklist**:

  1. **Test Pass Rate Check** (MUST PASS):
     - [ ] All tests passing (passed_count == total_count)
     - [ ] Zero test failures (failed_count == 0)
     - [ ] Exit code 0 from test execution

     IF any tests still failing:
       ❌ BLOCK: GREEN phase invalid
       REASON: Tests must all pass to complete GREEN phase
       DETAILS: [X] tests still failing: [TEST_NAMES]
       ACTION: Continue implementation to fix remaining failures
       RETRY: After fixes, re-execute validation

  2. **Implementation Completeness Check** (MUST PASS):
     - [ ] All implementation files from manifest exist
     - [ ] Required functions/classes implemented
     - [ ] No undefined/missing implementations

     IF implementation incomplete:
       ❌ BLOCK: GREEN phase invalid
       REASON: Implementation files missing or incomplete
       ACTION: Complete implementation of missing components
       RETRY: After completion, re-execute validation

  3. **Minimal Implementation Check** (ADVISORY):
     - [ ] Implementation is simple and focused
     - [ ] No unnecessary abstractions or complexity
     - [ ] No features beyond test coverage
     - [ ] Code is readable and maintainable

     IF over-engineering detected:
       ⚠️ WARN: Implementation may be over-engineered
       NOTE: Consider simplifying in REFACTOR phase
       NOTE: Not blocking GREEN phase completion

  4. **No Regression Check** (MUST PASS):
     - [ ] No existing tests broken by new implementation
     - [ ] All previously passing tests still pass
     - [ ] No new test failures in unrelated areas

     IF regressions detected:
       ❌ BLOCK: GREEN phase invalid
       REASON: New implementation broke existing tests
       DETAILS: [X] existing tests now failing: [TEST_NAMES]
       ACTION: Fix implementation to avoid breaking existing functionality
       RETRY: After fixes, re-execute validation

  5. **Code Quality Check** (ADVISORY):
     - [ ] Code follows project standards
     - [ ] No obvious bugs or issues
     - [ ] Error handling present (where needed)
     - [ ] Edge cases handled (where tested)

     IF quality issues found:
       ⚠️ WARN: Consider improving code quality in REFACTOR phase
       NOTE: Not blocking GREEN phase completion

  **Validation Result Classification**:

  ✅ **VALID_GREEN_PHASE**:
  - All tests passing (100% pass rate)
  - Implementation complete and functional
  - No regressions introduced
  - Code is minimal but working

  ❌ **TESTS_STILL_FAILING**:
  - Some tests not yet passing
  - Implementation incomplete

  ❌ **REGRESSIONS_DETECTED**:
  - Existing tests broken by new code
  - Unintended side effects

  ❌ **IMPLEMENTATION_INCOMPLETE**:
  - Required files missing
  - Functions/classes undefined
</green_phase_validation_checklist>

<state_transition_green>
  **Phase 4: TDD State Transition to GREEN**

  Based on validation results, update TDD state and make progression decision:

  **IF validation result = VALID_GREEN_PHASE**:
    ✅ GREEN phase validated successfully

    1. LOAD TDD state from .agent-os/tdd-state/[TASK_ID].json
    2. CALL TDD State Manager transitionTo('GREEN')
    3. UPDATE state fields:
       - current_phase: 'GREEN'
       - test_count: [total tests]
       - test_failures: 0 (all tests now passing)
       - phase_history: append GREEN phase entry with timestamp
       - updated_at: current timestamp
    4. SAVE test output: .agent-os/tdd-state/[TASK_ID]-green-output.txt
    5. LOG success message:
       ```
       ✅ GREEN Phase Validated Successfully

       Test Results:
       - Total: [X] tests
       - Passed: [X] tests (100%)
       - Failed: 0 tests
       - Transition: RED → GREEN complete

       Implementation Summary:
       - [Y] files created
       - [Z] functions/classes implemented
       - Implementation is minimal and focused

       TDD State Updated:
       - Phase: RED → GREEN
       - Test Failures: [Y] → 0
       - All acceptance criteria tests passing

       Next Steps:
       - REFACTOR phase (optional): Improve code while maintaining tests
       - OR: Proceed to integration and quality validation
       ```
    6. PROCEED to Step 2.3 (REFACTOR phase, optional)
       OR: Proceed to coordination_protocol (if refactoring not needed)

  **IF validation result = TESTS_STILL_FAILING**:
    ❌ GREEN phase validation FAILED - Continue implementation

    STATUS MESSAGE:
    ```
    ⏳ GREEN Phase In Progress: Tests Still Failing

    Test Results:
    - Total: [X] tests
    - Passed: [P] tests ([percentage]%)
    - Failed: [F] tests

    Failing Tests:
    [List of tests that are still failing]

    Progress:
    - Started: [X] minutes ago
    - Rate: [Y] tests passing per 10 minutes
    - Estimated completion: [Z] minutes

    Required Action:
    1. Continue implementation to fix remaining failures
    2. Run tests to verify fixes
    3. Repeat until all tests pass

    TDD Workflow Status:
    1. RED: Tests created and failing ✅ (COMPLETE)
    2. GREEN: Implement to pass tests ⏳ (IN PROGRESS - [percentage]% complete)
    3. REFACTOR: Improve code (BLOCKED - awaiting GREEN completion)

    Current Phase: RED (unchanged - cannot transition to GREEN until all tests pass)
    ```

    CONTINUE: Implementation work
    MONITOR: Test execution progress
    UPDATE: Progress metrics every 5 minutes

  **IF validation result = REGRESSIONS_DETECTED**:
    ❌ GREEN phase validation FAILED - Fix regressions

    ERROR MESSAGE:
    ```
    ❌ GREEN Phase Validation Failed: Regressions Detected

    Problem:
    New implementation broke existing tests that were previously passing.

    Regression Details:
    - Previously passing: [X] tests
    - Now failing: [Y] tests
    - Broken by changes in: [FILE_LIST]

    Affected Tests:
    [List of tests that regressed]

    Root Cause Analysis:
    [Attempt to identify which changes caused regressions]

    Required Action:
    1. Review changes that caused regressions
    2. Fix implementation to avoid breaking existing functionality
    3. Ensure new features don't have unintended side effects
    4. Re-run all tests to confirm fixes

    TDD Workflow Status:
    1. RED: Tests created and failing ✅ (COMPLETE)
    2. GREEN: Implement to pass tests ❌ (BLOCKED - regressions detected)
    3. REFACTOR: Improve code (BLOCKED - awaiting GREEN completion)

    Current Phase: RED (unchanged - cannot transition to GREEN with regressions)
    ```

    BLOCK: Cannot proceed with regressions
    ACTION: Fix implementation to eliminate regressions
    RETRY: After fixes, re-execute validation from beginning

  **IF validation result = IMPLEMENTATION_INCOMPLETE**:
    ❌ GREEN phase validation FAILED - Complete implementation

    ERROR MESSAGE:
    ```
    ❌ GREEN Phase Validation Failed: Implementation Incomplete

    Problem:
    Implementation is missing required files or components.

    Missing Components:
    [List of missing files or undefined functions/classes]

    Expected Deliverables:
    [List from deliverable manifest that are missing]

    Required Action:
    1. Implement missing files from deliverable manifest
    2. Define all required functions/classes
    3. Ensure complete implementation of acceptance criteria
    4. Re-run tests to verify completeness

    TDD Workflow Status:
    1. RED: Tests created and failing ✅ (COMPLETE)
    2. GREEN: Implement to pass tests ⏳ (IN PROGRESS - incomplete)
    3. REFACTOR: Improve code (BLOCKED - awaiting GREEN completion)

    Current Phase: RED (unchanged - cannot transition to GREEN with incomplete implementation)
    ```

    CONTINUE: Implementation work to complete missing components
    VERIFY: All deliverables from manifest created
    RETRY: After completion, re-execute validation

  **Enforcement Level Adjustments**:

  - **STRICT enforcement**: BLOCK on any validation failure, require 100% pass rate
  - **BALANCED enforcement**: BLOCK on regressions and completeness, warn on quality
  - **MINIMAL enforcement**: LOG validation results, allow proceeding with warnings

  Enforcement level from config.yml determines blocking behavior.
</state_transition_green>

<evidence_collection_green>
  **Phase 5: Evidence Collection and Documentation**

  Capture evidence of GREEN phase completion for audit and verification:

  **Files to Create**:

  1. **Green Test Output**:
     - Path: `.agent-os/tdd-state/[TASK_ID]-green-output.txt`
     - Contents: Full test execution output showing all tests passing
     - Purpose: Evidence of GREEN phase achievement

  2. **RED → GREEN Transition Report**:
     - Path: `.agent-os/tdd-state/[TASK_ID]-green-validation.yml`
     - Format:
       ```yaml
       validation_timestamp: [ISO_timestamp]
       task_id: [TASK_ID]
       phase: GREEN
       validation_result: [VALID_GREEN_PHASE|TESTS_STILL_FAILING|etc.]

       test_execution:
         framework: [jest|vitest|pytest|rspec]
         command: [test command used]
         exit_code: [should be 0]
         duration_seconds: [execution time]

       test_metrics:
         total_count: [number]
         passed_count: [should equal total]
         failed_count: [should be 0]
         skipped_count: [number]
         pass_rate_percentage: [should be 100]

       red_to_green_transition:
         red_phase_failures: [count from RED phase]
         green_phase_failures: 0
         tests_fixed: [count of tests that transitioned]
         transition_duration_minutes: [time from RED to GREEN]

       implementation_summary:
         files_created: [list]
         files_modified: [list]
         lines_of_code_added: [approximate count]
         minimal_implementation: [true|false based on analysis]

       validation_checks:
         all_tests_passing: [true|false]
         implementation_complete: [true|false]
         no_regressions: [true|false]
         minimal_implementation: [true|false]
         code_quality_acceptable: [true|false]

       state_transition:
         from_phase: RED
         to_phase: [GREEN|RED if blocked]
         transition_successful: [true|false]
         blocking_reason: [reason if blocked]

       next_steps:
         proceed_to_refactor: [true|false]
         required_actions: [list of actions if blocked]
       ```

  3. **Implementation Metrics**:
     - Track test pass rate over time
     - Measure implementation efficiency (tests passing per hour)
     - Record minimal implementation adherence
     - Calculate RED → GREEN transition time

  4. **Update TDD State**:
     - Path: `.agent-os/tdd-state/[TASK_ID].json`
     - Updated fields: current_phase='GREEN', test_failures=0, phase_history

  **Evidence Integration**:
  - Compare RED and GREEN test outputs (before/after)
  - Demonstrate all tests transition from failing → passing
  - Validate implementation completeness via test coverage
  - Include in Step 3 verification and Step 4 completion report
</evidence_collection_green>

<integration_with_orchestration_green>
  **Step 2.2 Integration Points**:

  **Input from Previous Steps**:
  - Step 2.1: RED phase validated, failing test output captured
  - Step 1: Deliverable manifest with implementation file list
  - Step 0.5: TDD state with current_phase='RED'

  **Output to Next Steps**:
  - Step 2.3: REFACTOR phase (if needed and time permits)
  - Step 2.5: Security scanning (runs after implementation)
  - Step 3: GREEN phase validation evidence for verification
  - Step 4: Implementation metrics and evidence for completion report

  **Parallel Execution**:
  - Multiple specialist agents can work in parallel (frontend, backend, etc.)
  - Each stream contributes to GREEN phase completion
  - Coordinate implementation to avoid conflicts
  - Continuous test monitoring tracks overall progress

  **Error Recovery**:
  - Implementation failures return to specialist agents for fixes
  - Up to 5 retry attempts for implementation issues
  - If tests still failing after 5 attempts, escalate to human intervention
  - Capture all attempts and progress in validation evidence
</integration_with_orchestration_green>

</step_2_2_implementation_green_phase>

<step_2_3_refactor_phase>

#### Step 2.3: REFACTOR Phase Tracking (Optional)

**Execution Order**: THIRD (after GREEN phase validated, optional)
**Agent**: code-simplicity-reviewer or implementation-specialist
**Purpose**: Improve code quality while maintaining passing tests (REFACTOR phase)

**Prerequisites**:
- GREEN phase validated in Step 2.2 (all tests passing)
- TDD state transitioned to GREEN phase
- Implementation complete and functional
- Test suite provides safety net for refactoring

**REFACTOR Phase Decision**:

The REFACTOR phase is OPTIONAL and should be executed when:
- ✅ Time permits (not under tight deadline)
- ✅ Code quality issues identified in GREEN phase
- ✅ Technical debt would accumulate if not addressed
- ✅ Improvements are clear and low-risk
- ✅ Refactoring provides meaningful value

SKIP REFACTOR phase when:
- ❌ Tight deadline (ship GREEN phase as-is)
- ❌ Code is already clean and maintainable
- ❌ No clear refactoring opportunities
- ❌ Risk of introducing bugs outweighs benefits

<refactor_workflow>
  **Phase 1: Refactoring Assessment**

  Before starting REFACTOR phase, assess whether refactoring is needed:

  **Assessment Criteria**:

  1. **Code Duplication**:
     - Multiple similar implementations
     - Copy-paste code patterns
     - Opportunity: Extract shared functions/components

  2. **Complexity**:
     - Functions > 50 lines
     - Nested conditionals > 3 levels deep
     - Cyclomatic complexity > 10
     - Opportunity: Simplify logic, extract methods

  3. **Naming and Clarity**:
     - Unclear variable/function names
     - Magic numbers without explanation
     - Confusing logic flow
     - Opportunity: Improve naming, add constants

  4. **Performance**:
     - Obvious inefficiencies
     - N+1 queries, unnecessary loops
     - Memory leaks
     - Opportunity: Optimize algorithms, cache results

  5. **Architecture**:
     - Tight coupling between modules
     - Missing abstractions
     - Violation of SOLID principles
     - Opportunity: Refactor to patterns, improve separation

  **Assessment Decision**:
  ```
  IF (refactoring_opportunities_count > 0 AND time_available):
    PROCEED to REFACTOR phase
    PRIORITIZE: High-impact, low-risk refactorings first
  ELSE:
    SKIP REFACTOR phase
    LOG: "Skipping REFACTOR phase - code is acceptable as-is"
    PROCEED to Step 2.5 (Security Scanning)
  ```

  **Refactoring Prioritization** (if proceeding):
  - **P1 (Critical)**: Security issues, major bugs hiding in complexity
  - **P2 (Important)**: Performance bottlenecks, significant duplication
  - **P3 (Nice-to-have)**: Naming improvements, minor simplifications

  Focus on P1 and P2 only unless ample time available.
</refactor_workflow>

<refactor_delegation>
  **Phase 2: Delegate Refactoring to Specialist Agent**

  If REFACTOR phase is needed, delegate to code-simplicity-reviewer:

  ```
  ACTION: Use code-simplicity-reviewer subagent (or implementation-specialist)
  REQUEST: "Refactor code to improve quality while maintaining passing tests (TDD REFACTOR phase):

            TDD Context:
            - Current Phase: GREEN (all tests passing)
            - Target Phase: REFACTOR (improve code quality)
            - Enforcement Level: [STRICT|BALANCED|MINIMAL from config]
            - State File: .agent-os/tdd-state/[TASK_ID].json

            GREEN Phase Evidence:
            - Test Output: .agent-os/tdd-state/[TASK_ID]-green-output.txt
            - All tests passing: YES
            - Test count: [X] tests

            Refactoring Opportunities Identified:
            [List of specific refactoring tasks prioritized by impact/risk]

            Refactoring Guidelines:
            1. Maintain ALL passing tests throughout refactoring
            2. Run tests after EACH refactoring step
            3. If any test fails, REVERT immediately
            4. Make small, incremental improvements
            5. Refactor one thing at a time
            6. Focus on readability and maintainability
            7. Avoid changing behavior (tests must remain green)

            Refactoring Principles:
            - **Safety First**: Tests must stay green
            - **Incremental**: Small changes, test frequently
            - **Reversible**: Easy to undo if tests break
            - **Purposeful**: Each refactoring has clear benefit
            - **Simple**: Reduce complexity, don't add it

            Common Refactorings:
            - Extract repeated code into functions
            - Rename variables/functions for clarity
            - Simplify complex conditionals
            - Replace magic numbers with named constants
            - Break large functions into smaller ones
            - Reduce nesting depth
            - Improve error handling

            Safety Protocol:
            STEP 1: Make small refactoring change
            STEP 2: Run full test suite immediately
            STEP 3: IF tests pass: COMMIT change, proceed to next
                    IF tests fail: REVERT change, analyze why, retry differently
            STEP 4: Repeat until refactorings complete

            Expected Result:
            - Code quality improved
            - ALL tests still passing (100% pass rate maintained)
            - No behavior changes (tests validate this)
            - Code is more readable and maintainable"

  COORDINATE: task-orchestrator monitors refactoring progress
  MONITOR: Test pass rate must stay 100% throughout
  EXECUTE: Run tests after EACH refactoring step
  ENFORCE: REVERT any change that breaks tests
  ```

  **Refactoring Success Criteria**:
  - Code quality metrics improved (complexity, duplication, etc.)
  - ALL tests continue to pass (100% pass rate maintained)
  - No behavior changes introduced
  - Code is more maintainable
</refactor_delegation>

<continuous_test_monitoring_refactor>
  **Phase 3: Continuous Test Monitoring During Refactoring**

  **CRITICAL**: Tests must remain green throughout REFACTOR phase

  **Test Execution Strategy**:

  1. **After Each Refactoring Step**:
     - Run full test suite immediately
     - Verify 100% pass rate maintained
     - If ANY test fails: REVERT immediately
     - Only proceed to next refactoring if tests pass

  2. **Red-Green-Refactor Safety**:
     ```
     GREEN state → Make refactoring change → Run tests
       ↓                                        ↓
       ↓                                   Tests pass?
       ↓                                        ↓
       ↓                                   Yes → Continue (stay GREEN)
       ↓                                   No  → REVERT (return to GREEN)
       ↓←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
     ```

  3. **Progress Monitoring**:
     ```
     🔵 REFACTOR Phase Progress:
     - Refactorings completed: [X]/[Y]
     - Tests status: ✅ ALL PASSING (100%)
     - Last test run: 30 seconds ago
     - Reverts: [Z] (refactorings that broke tests)
     ```

  4. **Failure Response**:
     - IF test fails after refactoring:
       ```
       ⚠️ Test Failure Detected During REFACTOR

       Action: REVERTING last change immediately
       Reason: Refactoring broke test: [TEST_NAME]
       Status: Tests back to passing ✅

       Analysis: Refactoring changed behavior unexpectedly
       Next: Try different refactoring approach or skip this one
       ```
     - ALWAYS revert failing changes
     - NEVER proceed with broken tests in REFACTOR phase
</continuous_test_monitoring_refactor>

<refactor_phase_validation>
  **Phase 4: REFACTOR Phase Validation**

  After refactorings complete, validate REFACTOR phase:

  **Validation Checklist**:

  1. **Test Pass Rate** (CRITICAL):
     - [ ] ALL tests still passing (100% pass rate)
     - [ ] No tests broken during refactoring
     - [ ] Test count unchanged (no tests removed/disabled)

     IF any tests failing:
       ❌ CRITICAL: REFACTOR phase broke tests
       ACTION: REVERT all refactoring changes
       REASON: Tests must stay green throughout REFACTOR
       RESULT: Return to GREEN phase state (before refactoring)

  2. **Code Quality Improvement** (VALIDATION):
     - [ ] Complexity reduced (measurable via linting tools)
     - [ ] Duplication reduced (DRY principle applied)
     - [ ] Naming improved (clearer variable/function names)
     - [ ] Readability improved (code easier to understand)

     IF no measurable improvement:
       ⚠️ WARN: Refactoring provided minimal value
       NOTE: Not blocking, but consider skipping future REFACTOR phases if time-limited

  3. **No Behavior Changes** (VALIDATION):
     - [ ] All original tests still pass with same assertions
     - [ ] No test modifications required (behavior unchanged)
     - [ ] Feature functionality identical to GREEN phase

     IF behavior changed:
       ❌ BLOCK: Refactoring changed behavior
       ACTION: Review and revert behavior-changing refactorings
       NOTE: REFACTOR should only improve code, not change behavior

  **Validation Result**:

  ✅ **VALID_REFACTOR_PHASE**:
  - All tests passing (100% maintained)
  - Code quality measurably improved
  - No behavior changes
  - Refactoring successful

  ❌ **TESTS_BROKEN**:
  - Tests failing after refactoring
  - MUST revert to GREEN phase

  ⚠️ **MINIMAL_BENEFIT**:
  - Tests passing but little improvement
  - Consider skipping REFACTOR in future
</refactor_phase_validation>

<state_transition_refactor>
  **Phase 5: TDD State Transition to REFACTOR**

  Update TDD state based on validation results:

  **IF validation result = VALID_REFACTOR_PHASE**:
    ✅ REFACTOR phase completed successfully

    1. LOAD TDD state from .agent-os/tdd-state/[TASK_ID].json
    2. CALL TDD State Manager transitionTo('REFACTOR')
    3. UPDATE state fields:
       - current_phase: 'REFACTOR'
       - test_count: [unchanged]
       - test_failures: 0 (maintained throughout)
       - phase_history: append REFACTOR phase entry with timestamp
       - updated_at: current timestamp
    4. SAVE test output: .agent-os/tdd-state/[TASK_ID]-refactor-output.txt
    5. LOG success message:
       ```
       ✅ REFACTOR Phase Completed Successfully

       Test Results:
       - Total: [X] tests
       - Passed: [X] tests (100% maintained throughout)
       - Failed: 0 tests
       - Phase: GREEN → REFACTOR complete

       Refactoring Summary:
       - Refactorings applied: [Y]
       - Code quality improvements:
         * Complexity reduced: [before] → [after]
         * Duplication reduced: [X]% less code duplication
         * Naming improvements: [Z] variables/functions renamed
       - Tests remained green: YES ✅
       - Behavior unchanged: YES ✅

       TDD State Updated:
       - Phase: GREEN → REFACTOR
       - All tests maintained passing state

       Next Steps:
       - Proceed to Step 2.5 (Security Scanning)
       ```
    6. PROCEED to Step 2.5 (Security Scanning)

  **IF validation result = TESTS_BROKEN**:
    ❌ CRITICAL: REFACTOR phase broke tests - REVERTING

    ERROR MESSAGE:
    ```
    ❌ REFACTOR Phase Failed: Tests Broken

    Problem:
    Refactoring changes broke existing tests. This is a critical failure
    in REFACTOR phase - tests MUST remain green.

    Test Results:
    - Total: [X] tests
    - Passed: [P] tests
    - Failed: [F] tests (SHOULD BE 0)

    Broken Tests:
    [List of tests that failed]

    Action Taken:
    🔄 REVERTING all refactoring changes
    ✅ Tests now passing again (back to GREEN phase state)

    Analysis:
    Refactoring inadvertently changed behavior, breaking tests.
    This violates the core principle of REFACTOR phase (maintain behavior).

    TDD Workflow Status:
    1. RED: Tests created ✅
    2. GREEN: Implementation complete ✅
    3. REFACTOR: Improve code ❌ → REVERTED to GREEN

    Current Phase: GREEN (REFACTOR phase reverted)

    Recommendation:
    Skipping REFACTOR phase and proceeding with GREEN phase implementation.
    Consider simpler, safer refactorings in future tasks.
    ```

    ACTION: REVERT all refactoring changes using version control
    RESULT: Return to GREEN phase state (all tests passing, before refactoring)
    CONTINUE: Proceed to Step 2.5 with GREEN phase implementation

  **IF REFACTOR phase skipped** (based on assessment):
    ℹ️ REFACTOR phase skipped

    LOG MESSAGE:
    ```
    ℹ️ REFACTOR Phase Skipped

    Reason: [One of:]
    - Code quality already high (no significant improvements identified)
    - Time constraints (deadline prioritization)
    - Low-risk refactorings not worth effort
    - Implementation already clean and maintainable

    Current State:
    - Phase: GREEN (maintaining, not transitioning to REFACTOR)
    - All tests passing: YES ✅
    - Code: Production-ready as-is

    Next Steps:
    - Proceeding directly to Step 2.5 (Security Scanning)
    ```

    MAINTAIN: GREEN phase (no state transition)
    PROCEED: Step 2.5 (Security Scanning)
</state_transition_refactor>

<evidence_collection_refactor>
  **Phase 6: Evidence Collection (if REFACTOR executed)**

  Capture evidence of REFACTOR phase for audit:

  **Files to Create**:

  1. **Refactor Test Output**:
     - Path: `.agent-os/tdd-state/[TASK_ID]-refactor-output.txt`
     - Contents: Final test execution output (all tests passing)
     - Purpose: Proof that tests maintained green throughout

  2. **Refactoring Report**:
     - Path: `.agent-os/tdd-state/[TASK_ID]-refactor-report.yml`
     - Format:
       ```yaml
       validation_timestamp: [ISO_timestamp]
       task_id: [TASK_ID]
       phase: REFACTOR
       refactor_executed: [true|false]
       skip_reason: [if skipped, why]

       refactoring_summary:
         refactorings_attempted: [count]
         refactorings_successful: [count]
         refactorings_reverted: [count]

       code_quality_metrics:
         before:
           cyclomatic_complexity: [number]
           code_duplication_percentage: [number]
           average_function_length: [number]
         after:
           cyclomatic_complexity: [number]
           code_duplication_percentage: [number]
           average_function_length: [number]
         improvement:
           complexity_reduction: [percentage]
           duplication_reduction: [percentage]

       test_metrics:
         total_count: [number]
         passed_count: [should equal total]
         failed_count: [should be 0]
         pass_rate_maintained: [true]

       refactorings_applied:
         - type: [extract_method|rename|simplify|etc.]
           file: [file path]
           description: [what was refactored]
           benefit: [improvement achieved]
           tests_passing: [true]

       state_transition:
         from_phase: GREEN
         to_phase: [REFACTOR|GREEN if skipped]
         transition_successful: [true|false]

       next_steps:
         proceed_to_security_scan: true
       ```

  3. **Update TDD State**:
     - Path: `.agent-os/tdd-state/[TASK_ID].json`
     - Updated: current_phase='REFACTOR' (or stays 'GREEN' if skipped)

  **Evidence Integration**:
  - Document code quality improvements
  - Demonstrate tests remained passing
  - Include in Step 4 completion report
</evidence_collection_refactor>

<integration_with_orchestration_refactor>
  **Step 2.3 Integration Points**:

  **Input from Previous Steps**:
  - Step 2.2: GREEN phase validated (all tests passing)
  - Step 1: Deliverable manifest
  - Step 0.5: TDD state with current_phase='GREEN'

  **Output to Next Steps**:
  - Step 2.5: Security scanning (happens regardless of REFACTOR)
  - Step 3: REFACTOR evidence (if executed) for verification
  - Step 4: Code quality metrics in completion report

  **Optional Execution**:
  - REFACTOR phase may be skipped based on assessment
  - Skipping is not a failure - it's a valid decision
  - If skipped, proceed directly to Step 2.5

  **Safety Guarantees**:
  - Tests MUST stay green throughout REFACTOR
  - Any test failure triggers immediate revert
  - Maximum 3 refactoring attempts before escalation
  - If REFACTOR breaks tests repeatedly, skip phase entirely
</integration_with_orchestration_refactor>

</step_2_3_refactor_phase>

<execution_streams>
  <stream_1_test_architecture>
    agent_type: "general-purpose"
    role: "Test architecture specialist"
    context_allocation: "Focused on testing frameworks and requirements"
    responsibilities:
      - Design comprehensive test strategy for the feature
      - Implement all test cases including unit, integration, and edge cases
      - Ensure test coverage meets quality standards
      - Coordinate with implementation stream for TDD workflow

    parallel_tasks:
      - Analyze feature requirements for test design
      - Create test plan and strategy document
      - Implement unit tests for all components
      - Design integration test scenarios
      - Create edge case and error condition tests
      - Set up test data and fixtures
  </stream_1_test_architecture>

  <stream_2_core_implementation>
    agent_type: "general-purpose"
    role: "Implementation specialist (or Frontend/Backend specialist based on task)"
    context_allocation: "Focused on business logic and architecture"
    responsibilities:
      - Implement core feature functionality and business logic
      - Ensure code quality and maintainability standards
      - Handle error conditions and edge cases
      - Coordinate with integration stream for API contracts

    parallel_tasks:
      - Analyze business requirements and logic
      - Design code architecture and patterns
      - Implement core functionality
      - Handle business rule validation
      - Implement error handling and edge cases
      - Optimize performance and resource usage
  </stream_2_core_implementation>

  <stream_3_integration_coordination>
    agent_type: "general-purpose"
    role: "Integration coordinator"
    context_allocation: "Focused on APIs and data flow"
    responsibilities:
      - Handle database operations and data persistence
      - Implement API endpoints and external service integration
      - Manage data flow and transformation
      - Ensure integration contracts are met

    parallel_tasks:
      - Design API contracts and endpoints
      - Implement database operations and queries
      - Handle external service integrations
      - Manage data validation and transformation
      - Implement authentication and authorization
      - Optimize database performance
  </stream_3_integration_coordination>

  <stream_4_quality_assurance>
    agent_type: "general-purpose"
    role: "Quality assurance specialist"
    context_allocation: "Focused on standards and optimization"
    responsibilities:
      - Ensure code quality and standards compliance
      - Perform code review and optimization
      - Validate performance requirements
      - Coordinate quality gates across streams

    parallel_tasks:
      - Review code for quality and standards compliance
      - Identify performance bottlenecks and optimizations
      - Validate coding standards adherence
      - Ensure technical debt minimization
      - Coordinate quality metrics tracking
      - Provide optimization recommendations
  </stream_4_quality_assurance>

  <stream_5_security_validation>
    agent_type: "general-purpose"
    role: "Security auditor"
    context_allocation: "Focused on security patterns and vulnerabilities"
    responsibilities:
      - Perform security vulnerability assessment
      - Implement secure coding practices
      - Validate authentication and authorization
      - Ensure data protection compliance

    parallel_tasks:
      - Analyze security requirements and threats
      - Review code for security vulnerabilities
      - Validate input sanitization and validation
      - Ensure secure data handling
      - Implement security best practices
      - Perform threat modeling validation
  </stream_5_security_validation>

  <stream_frontend_implementation>
    agent_type: "general-purpose"
    role: "Frontend specialist (React/Vue based on tech stack)"
    context_allocation: "Focused on UI components and state management"
    responsibilities:
      - Implement frontend UI components and interfaces
      - Create user-facing forms, displays, and interactions
      - Implement client-side state management and data flow
      - Ensure responsive design and accessibility
      - Coordinate with backend stream for API integration

    parallel_tasks:
      - Design UI component architecture
      - Implement React/Vue components for feature
      - Create forms and user input handling
      - Implement client-side validation
      - Add routing and navigation
      - Integrate with backend APIs
      - Implement error handling and loading states
      - Style components with TailwindCSS
      - Ensure responsive mobile-first design
      - Add accessibility features (ARIA, keyboard navigation)
  </stream_frontend_implementation>

  <stream_backend_implementation>
    agent_type: "general-purpose"
    role: "Backend Node.js specialist"
    context_allocation: "Focused on APIs and business logic"
    responsibilities:
      - Implement backend API endpoints and business logic
      - Create database operations and data persistence
      - Implement authentication and authorization
      - Handle server-side validation and error handling
      - Coordinate with frontend stream for API contracts

    parallel_tasks:
      - Design and implement REST/GraphQL APIs
      - Create database schema and migrations
      - Implement business logic and validation
      - Add authentication and authorization
      - Implement error handling and logging
      - Optimize database queries and performance
      - Add API documentation (OpenAPI/Swagger)
      - Coordinate API contracts with frontend
  </stream_backend_implementation>

  <stream_test_execution>
    agent_type: "test-runner"
    role: "Test execution with TDD state integration"
    context_allocation: "Focused on test suite execution and TDD cycle tracking"
    responsibilities:
      - Execute test suites with TDD state awareness
      - Report test results and update TDD state
      - Validate test coverage
      - Track RED → GREEN → REFACTOR phase transitions
      - Generate TDD evidence files

    tdd_integration:
      - Load TDD state before test execution (.agent-os/tdd-state/[TASK_ID].json)
      - Detect current TDD phase (RED, GREEN, REFACTOR)
      - Execute tests appropriate for current phase
      - Parse test output using Test Result Analyzer
      - Generate phase-specific evidence files
      - Update TDD state with test results
      - Validate phase transition criteria

    parallel_tasks:
      - Run unit test suites
      - Run integration test suites
      - Generate coverage reports
      - Report failures and issues
      - Update TDD state after each test execution
      - Capture test output for evidence collection

    tdd_specific_workflows:
      - **RED Phase Validation**: Run tests expecting failures, validate failure types
      - **GREEN Phase Monitoring**: Track failing → passing transitions, report progress
      - **REFACTOR Phase Safety**: Ensure tests stay green, revert on failures
      - **Evidence Generation**: Save test outputs to .agent-os/tdd-state/[TASK_ID]-[phase]-output.txt
  </stream_test_execution>

  <stream_6_documentation>
    agent_type: "general-purpose"
    role: "Documentation generator"
    context_allocation: "Focused on technical documentation"
    responsibilities:
      - Generate comprehensive technical documentation
      - Create API documentation and examples
      - Update code comments and inline documentation
      - Ensure documentation accuracy and completeness

    parallel_tasks:
      - Analyze implementation for documentation needs
      - Generate API documentation and schemas
      - Create code comments and docstrings
      - Update user-facing documentation
      - Generate usage examples and guides
      - Ensure documentation consistency
  </stream_6_documentation>
</execution_streams>

<coordination_protocol>
  <tdd_workflow_coordination>
    **TDD-Aware Task Orchestration** (if TDD enforcement enabled):

    The task-orchestrator manages TDD cycle enforcement throughout task execution:

    **TDD Coordination Responsibilities**:
    1. Initialize TDD state in Step 0.5 (current_phase: INIT)
    2. Enforce sequential execution of TDD phases:
       - Step 2.1 (RED): MUST complete before Step 2.2
       - Step 2.2 (GREEN): MUST complete before Step 2.3
       - Step 2.3 (REFACTOR): Optional, MUST maintain green tests
    3. Monitor phase transitions and validate correctness
    4. Block progression on invalid TDD states
    5. Collect and verify TDD evidence at each phase
    6. Enforce TDD compliance based on enforcement level

    **TDD Phase Gates** (sequential, not parallel):
    - Gate 0.5: TDD state initialized (INIT phase established)
    - Gate 2.1: RED phase validated (tests fail correctly)
    - Gate 2.2: GREEN phase validated (tests pass, implementation complete)
    - Gate 2.3: REFACTOR phase complete or skipped (tests maintained green)
    - Gate 3: TDD cycle verification (all evidence present and valid)

    **TDD Enforcement Levels**:
    - **STRICT**: Block on any TDD violation, require complete evidence
    - **BALANCED**: Block on critical violations (RED/GREEN), warn on others
    - **MINIMAL**: Log TDD compliance, allow proceeding with warnings

    **TDD Blocking Logic**:
    - IF current_phase = INIT: BLOCK implementation (Step 2.2) until RED validated
    - IF current_phase = RED: BLOCK quality/security (Step 2.5+) until GREEN validated
    - IF tests break in REFACTOR: REVERT to GREEN phase, skip REFACTOR
    - IF TDD verification fails in Step 3: BLOCK completion (STRICT/BALANCED only)

    **TDD Progress Tracking**:
    - Monitor TDD state file for updates
    - Track phase transition timestamps
    - Measure RED → GREEN transition time
    - Report TDD compliance status in completion summary

    **Integration with Parallel Execution**:
    - Step 2.1 (RED): Sequential, must complete first
    - Step 2.2 (GREEN): Can use parallel implementation streams after RED validated
    - Step 2.3 (REFACTOR): Sequential, maintains test green guarantee
    - Non-TDD streams (docs, quality): Can run in parallel with GREEN/REFACTOR
  </tdd_workflow_coordination>

  <dependency_management>
    sync_point_1: "Test strategy and API contracts agreed (RED phase complete)"
    sync_point_2: "Core implementation ready for integration (GREEN phase in progress)"
    sync_point_3: "Quality and security validation complete"
    sync_point_4: "Integration testing and documentation finalized (TDD cycle verified)"
  </dependency_management>

  <quality_gates>
    gate_1: "Test design approved and implementation started"
    gate_2: "Core functionality implemented and unit tests passing"
    gate_3: "Integration complete and API tests passing"
    gate_4: "Quality, security, and documentation requirements met"
  </quality_gates>

  <deliverable_tracking>
    **CRITICAL**: Track deliverable completion throughout execution.

    - Request regular status updates from each subagent
    - Update deliverable manifest as files are created/modified
    - Request file path confirmation for completed deliverables
    - Monitor for missing or delayed deliverables
    - Flag potential issues early before final verification
    - Keep manifest current for accurate Step 3 verification

    Format for subagent updates:
    "Report completed deliverables with specific file paths.
     Example: 'Completed: src/components/LoginForm.tsx (247 lines)'"
  </deliverable_tracking>

  <error_handling>
    context_adjustment: "Reallocate context if agents are struggling"
    agent_substitution: "Replace underperforming agents if needed"
    partial_recovery: "Preserve successful work and retry failures"
    escalation: "Human intervention for complex blocking issues"
    deliverable_alerts: "Flag missing deliverables early to prevent Step 3 failures"
  </error_handling>
</coordination_protocol>

<instructions>
  COORDINATE: Task-orchestrator manages all parallel streams
  MONITOR: Track progress, deliverable completion, and handle dependency synchronization
  UPDATE: Keep deliverable manifest current with completed files
  INTEGRATE: Merge work streams at coordination points
  VALIDATE: Ensure quality gates are met at each milestone
  VERIFY: Request file path confirmations for completed deliverables
  RECOVER: Handle errors and failures with intelligent strategies
</instructions>

</step>

<step number="2.5" subagent="task-orchestrator" name="security_scanning_and_p1_blocking">

### Step 2.5: Security Scanning and P1 Blocking (Compound Engineering Integration)

**MANDATORY SECURITY GATE**: After implementation completes, launch security-sentinel agent to scan all modified/created files for security vulnerabilities. **P1 (CRITICAL) findings BLOCK task completion** until resolved or acknowledged.

<security_scan_protocol>
  <scan_trigger>
    EXECUTE security scan when:
    - Implementation phase (Step 2) completes
    - Files have been created or modified
    - BEFORE marking task as complete
    - BEFORE proceeding to Step 3 verification

    SCOPE: All files created or modified in Step 2
  </scan_trigger>

  <file_identification>
    IDENTIFY all changed files:
      - New files created (from deliverable manifest)
      - Modified files (from git diff or file tracking)
      - Focus on source code files (.rb, .ts, .js, .py, .jsx, .tsx, etc.)
      - Exclude: config files, documentation, tests (unless they contain security issues)

    GROUP by language/framework:
      - Rails files: *.rb in app/, lib/, config/
      - TypeScript/Node files: *.ts, *.js, *.tsx, *.jsx
      - Python files: *.py

    PROVIDE file list to security-sentinel with language context
  </file_identification>

  <security_sentinel_invocation>
    LAUNCH security-sentinel agent via Task tool:

    PROVIDE:
      - List of all changed files with paths
      - Primary language/framework (Rails/TypeScript/Python)
      - Scan focus: Changed code only (not entire codebase)
      - Expected output: Structured findings with severity

    REQUEST: "Perform comprehensive security scan on changed files:
              - Files: [LIST_OF_CHANGED_FILES]
              - Framework: [Rails/TypeScript/Python/Mixed]
              - Focus: OWASP Top 10 vulnerabilities
              - Output: Structured findings with:
                * Severity: CRITICAL/HIGH/MEDIUM/LOW
                * Category: SQL Injection/XSS/Auth/etc.
                * Location: file:line
                * Description: What's wrong
                * Impact: What could happen
                * Recommendation: How to fix
                * Code example: Safe alternative"

    TIMEOUT: 5 minutes for security scan
    CONTEXT: Allocate 16KB for security-sentinel (comprehensive scanning)
  </security_sentinel_invocation>

  <finding_processing>
    COLLECT findings from security-sentinel:
      - Parse structured output
      - Categorize by severity (CRITICAL/HIGH/MEDIUM/LOW)
      - Group by file and vulnerability type
      - Calculate finding count per severity

    CLASSIFY findings as P1/P2/P3:
      - **P1 (CRITICAL)**: 🔴
        * CRITICAL severity from security-sentinel
        * SQL Injection vulnerabilities
        * Authentication bypass issues
        * Hardcoded secrets/credentials
        * Command injection
        * Remote code execution (RCE)
        * Unsafe deserialization

      - **P2 (IMPORTANT)**: 🟡
        * HIGH severity from security-sentinel
        * XSS vulnerabilities
        * CSRF protection issues
        * Authorization gaps
        * Sensitive data exposure
        * Open redirects

      - **P3 (NICE-TO-HAVE)**: 🔵
        * MEDIUM/LOW severity from security-sentinel
        * Missing security headers
        * Weak input validation
        * Code quality issues with security implications
        * Best practice violations
  </finding_processing>

  <p1_blocking_logic>
    **CRITICAL DECISION POINT**: P1 findings BLOCK task completion

    IF p1_findings_count > 0:
      BLOCK task completion
      PRESENT findings to user
      AWAIT user decision:
        1. Fix issues now (return to implementation)
        2. Create security todos for later (with acknowledgment)
        3. Override (with justification - rare cases only)

      FOR each P1 finding:
        ```markdown
        🔴 CRITICAL SECURITY ISSUE #[N]

        **Category**: [SQL Injection/Auth Bypass/etc.]
        **Location**: [file:line]

        **Problem**:
        [Detailed description of vulnerability]

        **Impact**:
        [What could happen if exploited - be specific]

        **Vulnerable Code**:
        ```[language]
        [Actual code snippet from file]
        ```

        **Recommended Fix**:
        ```[language]
        [Safe code alternative]
        ```

        **Action Required**:
        1. fix-now - Fix this issue before proceeding
        2. create-todo - Acknowledge risk, create todo for later
        3. false-positive - Mark as false positive with explanation
        ```

      LOOP through each P1 finding until all addressed

      IF user chooses "fix-now":
        RETURN to Step 2 (parallel execution) to fix issues
        RE-RUN security scan after fixes
        CONTINUE to Step 2.5 again

      IF user chooses "create-todo":
        REQUIRE: Explicit acknowledgment of security risk
        CREATE: Security todo file in todos/ directory
        FORMAT: [id]-pending-p1-security-[vulnerability-type].md
        LOG: User acknowledgment and reasoning
        CONTINUE to Step 3 (with P1 risks documented)

      IF user chooses "false-positive":
        REQUIRE: Detailed explanation why it's false positive
        LOG: False positive justification
        REMOVE: Finding from blocking list
        CONTINUE if no other P1 findings

    IF p1_findings_count == 0:
      PROCEED to Step 3 (verification)
      LOG: "✅ Security scan complete - No P1 findings"
  </p1_blocking_logic>

  <p2_p3_reporting>
    **NON-BLOCKING FINDINGS**: Report P2/P3 findings for awareness

    IF p2_findings_count > 0 OR p3_findings_count > 0:
      REPORT findings to user (non-blocking):
        ```markdown
        📊 Security Scan Results Summary

        🔴 P1 (Critical): [count] - BLOCKING
        🟡 P2 (Important): [count] - Review recommended
        🔵 P3 (Nice-to-have): [count] - Optional improvements

        **P2 Findings** (Review Recommended):
        [List of P2 findings with brief descriptions]

        **P3 Findings** (Optional Improvements):
        [List of P3 findings with brief descriptions]

        **Recommendation**:
        - Review P2 findings when time permits
        - Consider P3 findings for future refactoring
        - Run /triage to process all findings interactively
        ```

      OFFER: "Would you like to run /triage to process these findings?"
      CONTINUE: Task is not blocked by P2/P3 findings
  </p2_p3_reporting>

  <scan_results_persistence>
    SAVE security scan results:
      [spec_folder]/security-scan-[timestamp].yml

    FORMAT:
      ```yaml
      scan_timestamp: [ISO_timestamp]
      task_id: [TASK_ID]
      files_scanned: [count]
      findings_summary:
        p1_critical: [count]
        p2_important: [count]
        p3_nice_to_have: [count]
        total: [count]
      p1_blocking: [true/false]
      user_decisions:
        - finding_id: [id]
          decision: [fix-now|create-todo|false-positive]
          reasoning: [explanation]
      findings:
        - id: [unique_id]
          severity: [CRITICAL|HIGH|MEDIUM|LOW]
          priority: [P1|P2|P3]
          category: [SQL Injection|XSS|etc.]
          file: [file_path]
          line: [line_number]
          description: [detailed description]
          impact: [impact explanation]
          recommendation: [fix recommendation]
          vulnerable_code: [code snippet]
          safe_alternative: [safe code example]
      ```

    USE for:
      - Audit trail of security decisions
      - Tracking security improvements over time
      - Evidence for compliance and reviews
      - Input for /triage command
  </scan_results_persistence>

  <error_handling_security_scan>
    IF security-sentinel fails:
      LOG: Error details and continue with warning
      WARN: "⚠️ Security scan failed - proceeding without security validation"
      RECOMMEND: "Run manual security review before deploying"
      CONTINUE: Don't block task on scan failure (availability over blocking)

    IF security-sentinel times out:
      LOG: Timeout after 5 minutes
      WARN: "⚠️ Security scan timed out - consider manual review"
      CONTINUE: Don't block task on timeout

    IF finding parsing fails:
      LOG: Parsing error details
      WARN: "⚠️ Could not parse security findings - review agent output manually"
      CONTINUE: Don't block task on parsing errors
  </error_handling_security_scan>
</security_scan_protocol>

<instructions>
  ACTION: Launch security-sentinel agent for comprehensive security scan
  EXECUTE: Scan all files created/modified in Step 2
  PROCESS: Categorize findings as P1/P2/P3 based on severity
  BLOCK: Task completion if P1 findings exist (until resolved or acknowledged)
  REPORT: P2/P3 findings for awareness (non-blocking)
  PERSIST: Security scan results for audit trail
  DECISION: Await user action on P1 findings before proceeding
</instructions>

</step>

<step number="3" subagent="task-orchestrator" name="integration_and_validation">

### Step 3: Integration and Mandatory Deliverable Verification

The task-orchestrator coordinates the integration of all parallel work streams, **VERIFIES ALL DELIVERABLES EXIST AND FUNCTION**, and ensures task completeness. **Task CANNOT be marked complete without passing verification.**

<integration_process>
  <work_stream_integration>
    - Merge outputs from all specialist agents
    - Resolve any conflicts or inconsistencies between streams
    - Validate integration points and dependencies
    - Ensure seamless functionality across all components
  </work_stream_integration>

  <deliverable_verification>
    **CRITICAL REQUIREMENT**: Verify ALL deliverables from manifest before proceeding.

    Phase 1 - File Existence Verification (MANDATORY):
    - Use Read tool to verify EVERY file in manifest exists
    - Check files created: Use Read on each path
    - Check files modified: Use Read + git diff to verify changes
    - Document any missing files
    - BLOCK completion if ANY files missing

    Phase 2 - Content Validation (MANDATORY):
    - Read key implementation files
    - Verify required functions/components exist
    - Check implementation matches specification
    - Validate error handling present
    - BLOCK completion if content insufficient

    Phase 3 - Test Verification (MANDATORY):
    - Verify ALL test files exist (using Read)
    - Use test-runner to execute ALL tests
    - Confirm 100% of tests pass
    - Check test coverage meets threshold (80%+)
    - BLOCK completion if tests missing or failing

    Phase 4 - Acceptance Criteria Evidence (MANDATORY):
    - Review each acceptance criterion from task detail file
    - Verify evidence exists for each criterion
    - Request additional evidence if missing
    - Validate evidence proves criterion is met
    - BLOCK completion if criteria unverified

    Phase 5 - Integration Verification (MANDATORY):
    - Check integration points between components
    - Verify APIs match between frontend/backend
    - Ensure no missing dependencies or imports
    - Validate end-to-end data flow
    - BLOCK completion if integration broken

    See @.agent-os/instructions/utilities/deliverable-verification-guide.md Phase 3 for detailed verification process.
  </deliverable_verification>

  <tdd_cycle_verification>
    **Phase 6 - TDD Cycle Verification (if TDD enforcement enabled)**

    Verify that TDD cycle was followed correctly throughout task execution:

    **TDD State Verification**:

    1. **TDD State File Existence**:
       - Check: .agent-os/tdd-state/[TASK_ID].json exists
       - Verify state file is valid JSON
       - Load current TDD state

    2. **Phase Transition Validation**:
       - Verify phase_history array contains correct transitions
       - Expected sequence (minimum): INIT → RED → GREEN
       - Optional: GREEN → REFACTOR (if refactoring was performed)
       - Each phase entry must have timestamp
       - No invalid transitions (e.g., INIT → GREEN without RED)

    3. **RED Phase Evidence**:
       - File: .agent-os/tdd-state/[TASK_ID]-red-output.txt exists
       - File: .agent-os/tdd-state/[TASK_ID]-red-validation.yml exists
       - Validation report shows: validation_result = 'VALID_RED_PHASE'
       - Test metrics show: failed_count > 0 (tests initially failed)
       - Failure types are expected (ReferenceError, NameError, etc.)

    4. **GREEN Phase Evidence**:
       - File: .agent-os/tdd-state/[TASK_ID]-green-output.txt exists
       - File: .agent-os/tdd-state/[TASK_ID]-green-validation.yml exists
       - Validation report shows: validation_result = 'VALID_GREEN_PHASE'
       - Test metrics show: failed_count = 0 (all tests passing)
       - Pass rate = 100%

    5. **REFACTOR Phase Evidence** (if executed):
       - File: .agent-os/tdd-state/[TASK_ID]-refactor-output.txt exists
       - File: .agent-os/tdd-state/[TASK_ID]-refactor-report.yml exists
       - Validation shows: tests maintained green throughout
       - Code quality metrics improved

    6. **Test Transition Verification**:
       - Compare RED and GREEN test outputs
       - Verify same tests that failed in RED now pass in GREEN
       - Ensure test count unchanged (no tests added/removed between RED and GREEN)
       - Validate no test modifications that change behavior

    **TDD Verification Checklist**:

    - [ ] TDD state file exists and is valid
    - [ ] Phase transitions followed correct sequence
    - [ ] RED phase: Tests created and failed correctly
    - [ ] GREEN phase: Tests pass after implementation
    - [ ] RED → GREEN transition: Same tests went from failing to passing
    - [ ] Current phase is GREEN or REFACTOR
    - [ ] All evidence files present
    - [ ] No invalid phase transitions

    **TDD Verification Failure Handling**:

    IF TDD verification fails:
      ❌ BLOCK: TDD cycle not followed correctly

      ANALYZE failure type:

      1. **Missing Evidence Files**:
         - Problem: RED/GREEN validation files missing
         - Action: Request specialists re-run phases with proper evidence collection
         - Retry: After evidence captured

      2. **Invalid Phase Transitions**:
         - Problem: Skipped RED phase or invalid sequence
         - Action: This indicates TDD process was not followed
         - Escalate: Human review required
         - Note: Task may need to be re-executed with proper TDD workflow

      3. **Test Count Mismatch**:
         - Problem: Different number of tests in RED vs GREEN
         - Action: Investigate why tests were added/removed mid-cycle
         - Validate: Ensure tests weren't modified to force passing

      4. **Tests Didn't Transition**:
         - Problem: Different tests failing/passing between RED and GREEN
         - Action: Verify implementation actually fixed the failing tests
         - Check: Ensure tests weren't disabled or modified

    IF TDD enforcement level = STRICT:
      - BLOCK task completion on ANY TDD verification failure
      - Require proper TDD cycle evidence

    IF TDD enforcement level = BALANCED:
      - WARN on TDD verification issues
      - Allow proceeding with documented exceptions
      - Record TDD violations for review

    IF TDD enforcement level = MINIMAL:
      - LOG TDD verification results
      - Allow proceeding regardless of TDD compliance
      - Document for informational purposes

    **TDD Verification Success**:

    IF all TDD verifications pass:
      ✅ TDD cycle verified successfully

      LOG success message:
      ```
      ✅ TDD Cycle Verification Complete

      Phase Transitions:
      - INIT → RED: [timestamp]
      - RED → GREEN: [timestamp]
      - GREEN → REFACTOR: [timestamp] (if applicable)

      RED Phase:
      - Tests created: [X]
      - Tests failed: [Y] (as expected)
      - Failures indicated missing implementation: YES ✅

      GREEN Phase:
      - Tests passed: [X]/[X] (100%)
      - Implementation completed successfully
      - RED → GREEN transition validated

      REFACTOR Phase: [EXECUTED|SKIPPED]
      - Code quality: [IMPROVED|N/A]
      - Tests maintained green: [YES|N/A]

      TDD Compliance: ✅ VERIFIED
      Evidence: All validation files present and valid

      Proceeding to final validation checklist...
      ```

      PROCEED to comprehensive_validation

    **TDD Verification Documentation**:

    Create comprehensive TDD verification report:
    - Path: .agent-os/tdd-state/[TASK_ID]-tdd-verification.yml
    - Format:
      ```yaml
      verification_timestamp: [ISO_timestamp]
      task_id: [TASK_ID]
      tdd_enforcement_level: [STRICT|BALANCED|MINIMAL]

      verification_result: [VERIFIED|FAILED|SKIPPED]
      verification_failures: [list of failures if any]

      phase_transitions:
        - from: INIT
          to: RED
          timestamp: [ISO_timestamp]
          valid: [true|false]
        - from: RED
          to: GREEN
          timestamp: [ISO_timestamp]
          valid: [true|false]
        - from: GREEN
          to: REFACTOR
          timestamp: [ISO_timestamp]
          valid: [true|false]
          executed: [true|false]

      evidence_files:
        red_output: [exists: true|false]
        red_validation: [exists: true|false]
        green_output: [exists: true|false]
        green_validation: [exists: true|false]
        refactor_output: [exists: true|false, if applicable]
        refactor_report: [exists: true|false, if applicable]

      test_metrics_comparison:
        red_phase:
          total: [number]
          passed: [number]
          failed: [number]
        green_phase:
          total: [number]
          passed: [number]
          failed: [number]
        transition_valid: [true|false]
        same_tests: [true|false]

      compliance_status:
        tdd_cycle_followed: [true|false]
        evidence_complete: [true|false]
        transitions_valid: [true|false]
        overall_compliance: [COMPLIANT|NON_COMPLIANT|PARTIAL]

      enforcement_action:
        blocking: [true|false based on enforcement level]
        warnings_issued: [count]
        proceed_allowed: [true|false]
      ```

    Include this report in Step 4 completion documentation.
  </tdd_cycle_verification>

  <comprehensive_validation>
    - Run complete test suite including all new and updated tests
    - Validate API contracts and integration points
    - Verify security requirements and compliance
    - Confirm performance and quality standards are met
  </comprehensive_validation>

  <quality_assurance>
    - Perform final code review across all components
    - Validate documentation accuracy and completeness
    - Ensure all coding standards and best practices are followed
    - Confirm no regressions or breaking changes introduced
  </quality_assurance>
</integration_process>

<final_validation_checklist>
  <deliverable_verification>
    ✓ ALL files from manifest verified to exist (using Read tool)
    ✓ File contents validated to meet requirements
    ✓ ALL test files exist and tests pass (using test-runner)
    ✓ Test coverage meets minimum threshold (80%+)
    ✓ ALL acceptance criteria verified with evidence
    ✓ ALL integration points verified and working
  </deliverable_verification>

  <functionality_validation>
    ✓ All subtasks completed successfully
    ✓ Core functionality implemented and working
    ✓ Integration points tested and validated
    ✓ Error handling and edge cases covered
  </functionality_validation>

  <quality_validation>
    ✓ All tests passing (unit, integration, security)
    ✓ Code quality standards met
    ✓ Performance requirements satisfied
    ✓ Security vulnerabilities addressed
  </quality_validation>

  <documentation_validation>
    ✓ API documentation generated and accurate
    ✓ Code comments and docstrings complete
    ✓ Technical documentation updated
    ✓ Usage examples and guides created
  </documentation_validation>

  <compliance_validation>
    ✓ Coding standards adherence verified
    ✓ Best practices implementation confirmed
    ✓ Architecture guidelines followed
    ✓ Technical debt minimized
  </compliance_validation>
</final_validation_checklist>

<verification_failure_handling>
  IF ANY verification step fails:
    ❌ DO NOT PROCEED to Step 4 (Task Completion)
    ❌ DO NOT mark task as complete

    INSTEAD:
    1. Document specific verification failures
    2. Identify which subagent(s) responsible for missing deliverables
    3. Request subagent(s) deliver missing items immediately
    4. Wait for subagent(s) to complete fixes
    5. Re-run verification from the beginning
    6. Only proceed to Step 4 when ALL verifications pass

  Common Failures and Actions:
  - Missing files: Request subagent create them immediately
  - Failing tests: Request test-specialist or implementation-specialist fix
  - Missing evidence: Request subagents provide screenshots/proof
  - Integration broken: Request coordination between affected subagents
</verification_failure_handling>

<instructions>
  ACTION: Use task-orchestrator subagent for integration and verification
  REQUEST: "Integrate and VERIFY all work streams:

            Phase 1 - Integration:
            - Merge outputs from all specialist agents
            - Resolve conflicts and ensure consistency

            Phase 2 - MANDATORY Deliverable Verification:
            - Verify ALL files in manifest exist (use Read tool)
            - Validate file contents meet requirements
            - Verify ALL tests exist and pass (use test-runner)
            - Check test coverage meets threshold
            - Verify acceptance criteria with evidence
            - Validate integration points work

            Phase 3 - Completion Decision:
            - IF ALL verifications pass: APPROVE for completion
            - IF ANY verification fails: BLOCK completion and request fixes
            - Document verification results comprehensively
            - Create completion verification report"

  VALIDATE: All quality gates AND deliverable verification requirements met
  VERIFY: Use Read tool for file existence, test-runner for test execution
  BLOCK: Task completion if ANY verification fails
  CONFIRM: Task ready for completion ONLY after full verification passes
  DOCUMENT: Complete verification report with evidence
</instructions>

</step>

<step number="4" subagent="task-orchestrator" name="task_completion_and_status_update">

### Step 4: Task Completion and Status Updates (ONLY After Verification Passes)

**PREREQUISITE**: This step can ONLY be executed if Step 3 verification passed completely. If ANY verification failed, return to Step 3 to address failures.

The task-orchestrator finalizes the task by updating status, documenting results, and preparing for handoff to the next phase.

<completion_gate>
  **MANDATORY CHECK BEFORE PROCEEDING**:

  The orchestrator MUST confirm ALL of the following before marking task complete:
  - ✅ ALL files from deliverable manifest verified to exist
  - ✅ File contents validated to meet requirements
  - ✅ ALL tests exist and pass (100% pass rate)
  - ✅ Test coverage meets minimum threshold (80%+)
  - ✅ ALL acceptance criteria verified with evidence
  - ✅ ALL integration points verified and working
  - ✅ Deliverable verification report created

  IF ANY item above is NOT checked:
    ❌ DO NOT proceed with this step
    ❌ DO NOT mark task complete
    ↩️ RETURN to Step 3 to complete verification
</completion_gate>

<completion_process>
  <status_updates>
    - Mark parent task and all subtasks as complete in tasks.md
    - Mark task complete in tasks/task-[ID].md detail file
    - Update task checkboxes to [x] for completed items
    - Document any blocking issues or special notes (if applicable)
    - Record completion metrics and performance data
    - Attach deliverable verification report
  </status_updates>

  <results_documentation>
    - Generate summary of work completed across all streams
    - List ALL files created and modified (from verification)
    - Document test results and coverage achieved
    - Record any deviations from original plan
    - Include evidence of acceptance criteria being met
    - Record lessons learned and optimization opportunities
    - Prepare handoff documentation for next tasks
  </results_documentation>

  <quality_metrics_recording>
    - Record execution time and efficiency gains
    - Document parallel processing effectiveness
    - Track quality metrics and standards compliance
    - Measure context optimization and resource utilization
    - Record verification completion rate (100% expected)
  </quality_metrics_recording>

  <pattern_documentation>
    **COMPOUNDING ENGINEERING REQUIREMENT**: Document reusable patterns discovered during task execution.

    Before marking task complete, identify and document:
    - New reusable patterns created during implementation
    - Improvements to existing patterns
    - Learnings that make future work easier
    - Anti-patterns to avoid

    This documentation makes each task compound in value by capturing knowledge for future reuse.

    See `@.agent-os/standards/best-practices.md` for compounding engineering philosophy.

    <identifying_patterns_worth_documenting>
      **How to Identify Patterns Worth Documenting**:

      1. **Reusable Components** - Code that could be used in 2+ future features:
         - Utility functions (validation, formatting, parsing)
         - Service classes (email sending, file processing, API clients)
         - React components (forms, displays, layouts)
         - Database query patterns (complex joins, optimized queries)
         - Middleware/decorators (auth, logging, caching)

      2. **Problem-Solution Pairs** - Challenges solved that others will face:
         - "How to handle large file uploads without blocking"
         - "How to implement secure password reset flow"
         - "How to optimize slow N+1 queries"
         - "How to test async operations reliably"

      3. **Framework/Library Integration** - Working with external tools:
         - "How to configure Stripe webhooks in Rails"
         - "How to set up React Query with authentication"
         - "How to use Playwright for visual regression testing"
         - Include version numbers and gotchas

      4. **Architecture Decisions** - Design choices with trade-offs:
         - "Why we chose PostgreSQL JSON over separate table"
         - "Why we use optimistic updates for better UX"
         - "Why we batch notifications instead of real-time"
         - Document alternatives considered and reasoning

      5. **Performance Optimizations** - Speed/memory improvements:
         - Database indexing strategies
         - Caching layer implementations
         - Query optimization techniques
         - Frontend bundle size reductions

      6. **Security Patterns** - Security implementations:
         - Input sanitization approaches
         - Authentication flow implementations
         - CSRF protection strategies
         - Rate limiting configurations

      **Red Flags - DON'T Document**:
      - ❌ Code that's highly specific to this one feature
      - ❌ Obvious patterns already well-documented
      - ❌ Simple one-liners with no complexity
      - ❌ Patterns that may change soon
    </identifying_patterns_worth_documenting>

    <documentation_locations>
      **Where to Document Patterns**:

      1. **`.agent-os/CLAUDE.md`** - Project-specific patterns:
         - Codebase conventions and patterns
         - Framework configuration and setup
         - Common utilities and where to find them
         - Integration approaches with existing code

      2. **`.agent-os/standards/`** - General standards:
         - `best-practices.md` - Development principles
         - `code-style.md` - Formatting and naming
         - `tech-stack.md` - Technology choices and rationale
         - `code-style/[language].md` - Language-specific patterns

      3. **`docs/patterns/`** - Detailed pattern documentation:
         - Complex patterns needing examples
         - Multi-file implementations
         - Step-by-step guides
         - Architecture decision records (ADRs)

      4. **Code Comments** - Inline documentation:
         - Non-obvious implementation details
         - Performance considerations
         - Security considerations
         - Links to pattern documentation
    </documentation_locations>

    <pattern_documentation_template>
      **Pattern Documentation Format**:

      ```markdown
      ## Pattern: [Pattern Name]

      **When to use**: [Situations where this pattern applies]

      **Problem it solves**: [What challenge does this address]

      **Example**:
      `app/services/example_service.rb:15-30`

      ```[language]
      # Actual code example from implementation
      class ExampleService
        def process
          # Pattern implementation
        end
      end
      ```

      **Benefits**:
      - [Why this pattern compounds value]
      - [How it makes future work easier]

      **Trade-offs**:
      - [Limitations or considerations]

      **Related Patterns**:
      - [Links to similar patterns]

      **Used In**:
      - [List of features using this pattern]
      - [Task IDs where implemented]
      ```
    </pattern_documentation_template>

    <integration_with_task_completion>
      **Pattern Documentation Workflow**:

      1. **During Implementation** (Step 2):
         - Note patterns as you create them
         - Mark reusable components with TODOs
         - Keep track of learnings and challenges solved

      2. **Before Task Completion** (Step 4):
         - Review implementation for reusable patterns
         - Decide which patterns are worth documenting
         - Write pattern documentation in appropriate location
         - Update relevant files (CLAUDE.md, standards/, docs/)

      3. **Verification** (Step 4):
         - Confirm pattern documentation exists
         - Verify code examples are accurate and include references
         - Check that future value is explicitly stated
         - Ensure integration with existing documentation

      4. **Task Completion Checklist**:
         - [ ] Reviewed implementation for reusable patterns
         - [ ] Identified 0+ patterns worth documenting
         - [ ] Documented patterns in appropriate locations
         - [ ] Included code examples with file:line references
         - [ ] Stated future value and use cases explicitly
         - [ ] Updated CLAUDE.md or standards/ as needed
    </integration_with_task_completion>
  </pattern_documentation>
</completion_process>

<completion_criteria>
  <deliverable_verification_required>
    ✓ ALL deliverables from manifest verified (MANDATORY)
    ✓ Deliverable verification report created (MANDATORY)
    ✓ ALL files existence confirmed via Read tool (MANDATORY)
    ✓ ALL tests passing via test-runner (MANDATORY)
    ✓ Evidence provided for acceptance criteria (MANDATORY)
  </deliverable_verification_required>

  <task_completeness>
    ✓ All subtasks marked complete or properly blocked
    ✓ Core functionality fully implemented and tested
    ✓ Integration points validated and working
    ✓ Documentation complete and accurate
  </task_completeness>

  <quality_standards>
    ✓ Code quality standards met across all components
    ✓ Security requirements satisfied
    ✓ Performance benchmarks achieved
    ✓ Best practices implementation verified
  </quality_standards>

  <deliverable_readiness>
    ✓ Feature ready for integration with larger system
    ✓ Tests provide adequate coverage and confidence
    ✓ Documentation supports future maintenance
    ✓ No blocking issues or technical debt introduced
  </deliverable_readiness>

  <pattern_documentation_validation>
    ✓ Reusable patterns identified and documented
    ✓ Pattern documentation added to appropriate location (CLAUDE.md, standards/, etc.)
    ✓ Code examples included with file:line references
    ✓ Future value and use cases explicitly captured
  </pattern_documentation_validation>
</completion_criteria>

<task_status_update_format>
  <completed_format>
    - [x] Task description → [details](tasks/task-ID.md)
    ✅ Completed by orchestrated parallel execution
    📊 Metrics: [EXECUTION_TIME], [QUALITY_SCORE], [EFFICIENCY_GAIN]
    ✅ Deliverables: [COUNT] files created, [COUNT] modified, ALL verified
    ✅ Tests: [COUNT/COUNT] passing (100%), Coverage: [PERCENTAGE]%
    ✅ Verification: Complete with evidence
    📋 Report: [LINK_TO_VERIFICATION_REPORT]
  </completed_format>

  <blocked_format>
    - [ ] Task description → [details](tasks/task-ID.md)
    ⚠️ Blocking issue: [DETAILED_DESCRIPTION]
    🔄 Attempts: [NUMBER] different approaches tried
    📝 Recommendation: [SUGGESTED_RESOLUTION_APPROACH]
    ❌ Verification: Failed - [SPECIFIC_FAILURES]
  </blocked_format>
</task_status_update_format>

<instructions>
  ACTION: Use task-orchestrator subagent for completion
  REQUEST: "Finalize task completion (ONLY if verification passed):

            Phase 1 - Verification Confirmation:
            - Confirm ALL deliverables verified in Step 3
            - Confirm deliverable verification report exists
            - Confirm 100% test pass rate achieved
            - Confirm acceptance criteria evidence collected
            - IF ANY missing: STOP and return to Step 3

            Phase 2 - Pattern Documentation (MANDATORY):
            - Review implementation for reusable patterns
            - Identify patterns worth documenting (see criteria)
            - Document patterns in appropriate locations
            - Include code examples with file:line references
            - Capture future value and use cases explicitly
            - Update CLAUDE.md, standards/, or docs/ as needed

            Phase 3 - Status Updates:
            - Update tasks.md with completion markers
            - Update tasks/task-[ID].md detail file
            - Include verification metrics in completion notes
            - Include pattern documentation summary
            - Attach deliverable verification report

            Phase 4 - Results Documentation:
            - Generate comprehensive completion summary
            - List ALL files created/modified (verified)
            - Document test results and coverage
            - Include acceptance criteria evidence
            - Document patterns discovered and captured
            - Prepare handoff documentation

            Phase 5 - Metrics Recording:
            - Record execution metrics and performance
            - Document verification completion rate
            - Track pattern documentation completeness
            - Capture lessons learned and optimizations"

  VERIFY: Confirmation that Step 3 verification passed before proceeding
  DOCUMENT_PATTERNS: Identify and document reusable patterns (MANDATORY)
  UPDATE: Mark task complete ONLY after verification AND pattern documentation
  DOCUMENT: Complete results including verification report and patterns
  PREPARE: For handoff to post-execution workflow
  OPTIMIZE: Capture insights for future task orchestration
</instructions>

<critical_reminder>
  🚨 **NEVER mark a task complete without verified deliverables AND pattern documentation** 🚨

  The orchestrator MUST have:
  1. Created deliverable manifest in Step 1
  2. Tracked deliverables during Step 2
  3. Verified ALL deliverables in Step 3
  4. Confirmed verification passed before Step 4
  5. Documented reusable patterns in Step 4

  Missing deliverable verification is the ROOT CAUSE of incomplete implementations.
  Missing pattern documentation prevents compounding value from accumulating.

  **Compounding Engineering Principle**:
  Each task should make future tasks easier through pattern documentation.
  Without pattern capture, knowledge is lost and work doesn't compound.
</critical_reminder>

</step>

<step number="5" name="prompt_logging">

### Step 5: Prompt Logging (Optional)

Track prompts used during task execution for debugging, process improvement, and workflow optimization.

<logging_overview>
  **Purpose**: Document the prompts and agent interactions during task execution to:
  - Debug task execution issues and failures
  - Identify successful prompt patterns for reuse
  - Improve workflow efficiency over time
  - Provide audit trail for complex task execution
  - Analyze performance bottlenecks in orchestration

  **When to Use**:
  - Complex multi-agent orchestrations
  - Tasks that required troubleshooting or iteration
  - When establishing new workflows or patterns
  - For post-mortem analysis of failures
  - To capture successful patterns for documentation
</logging_overview>

<logging_configuration>
  **Storage Location**: `.agent-os/logs/prompts/[TASK_ID]-[TIMESTAMP].md`

  **Configuration**: Optional feature that can be enabled/disabled
  - Enable via environment or config: `PROMPT_LOGGING=true`
  - Logs stored locally only (not transmitted)
  - Automatically redacts sensitive data
  - Excluded from git commits via .gitignore

  **What to Log**:
  - Task ID, description, and metadata
  - Agent types used (orchestrator, specialists, etc.)
  - Full prompts sent to each agent
  - Agent responses (summary or full, based on verbosity setting)
  - Timestamps and execution duration
  - Success/failure status with error details
  - Resource utilization (context tokens, time)
  - Integration points and handoffs between agents
</logging_configuration>

<log_format>
  **Standard Log Structure**:

  ```markdown
  # Task Execution Prompt Log

  **Task ID**: ai-2
  **Task Title**: Add prompt logging to execute-tasks
  **Date**: 2025-10-26T13:17:00Z
  **Duration**: 1.5 hours
  **Status**: ✅ Success / ⚠️ Partial / ❌ Failed
  **Worktree**: /home/user/.agent-os/worktrees/ai-2

  ## Task Context

  **Specification**: specs/agent-os-improvements/spec.md
  **Dependencies**: ai-1 (Complete)
  **Agent Strategy**: Orchestrated parallel execution

  **Acceptance Criteria**:
  - Prompt logging section added to execute-task-orchestrated.md
  - Log format documented with examples
  - Privacy considerations included
  - .gitignore updated to exclude logs

  ## Step 1: Task Orchestration Setup

  **Agent**: task-orchestrator
  **Started**: 13:17:30
  **Duration**: 15 minutes
  **Status**: ✅ Success

  ### Prompt Sent
  ```
  Analyze and orchestrate task execution for:
  - Parent Task: ai-2 Add prompt logging to execute-tasks
  - Subtasks: [list of subtasks]
  - Technical Requirements: [requirements]
  ...
  ```

  ### Agent Response (Summary)
  - Identified 2 parallel execution streams
  - Allocated context: Implementation (8KB), Documentation (4KB)
  - Created deliverable manifest: 2 files expected
  - Dependencies: None (single file modification)

  ### Deliverable Manifest Created
  1. instructions/core/execute-task-orchestrated.md (modified)
  2. .gitignore (created)

  ## Step 2: Parallel Execution

  ### Stream 1: Implementation Specialist

  **Agent**: implementation-specialist
  **Started**: 13:18:00
  **Duration**: 45 minutes
  **Status**: ✅ Success
  **Context Used**: 8,247 tokens

  #### Prompt Sent
  ```
  Implement prompt logging section in execute-task-orchestrated.md:
  - Add as Step 5 after task completion
  - Include log format with examples
  - Document configuration options
  - Ensure markdown formatting consistency
  ...
  ```

  #### Response Summary
  - Modified execute-task-orchestrated.md (97 lines added)
  - Created log format template
  - Documented privacy considerations
  - Added usage instructions

  #### Deliverables Completed
  - ✅ instructions/core/execute-task-orchestrated.md

  ### Stream 2: Documentation Specialist

  **Agent**: documentation-specialist
  **Started**: 13:18:15
  **Duration**: 30 minutes
  **Status**: ✅ Success
  **Context Used**: 4,103 tokens

  #### Prompt Sent
  ```
  Create .gitignore entry for prompt logs:
  - Add .agent-os/logs/ directory exclusion
  - Include descriptive comment
  - Follow .gitignore best practices
  ...
  ```

  #### Response Summary
  - Created .gitignore file
  - Added logs directory exclusion
  - Included security notice

  #### Deliverables Completed
  - ✅ .gitignore

  ## Step 3: Integration and Verification

  **Agent**: task-orchestrator
  **Started**: 13:19:00
  **Duration**: 20 minutes
  **Status**: ✅ Success

  ### Verification Activities
  - ✅ File existence verified (Read tool)
  - ✅ Markdown syntax validated
  - ✅ Log format tested with example
  - ✅ .gitignore tested (git check-ignore)
  - ✅ Integration with existing workflow confirmed

  ### Acceptance Criteria Evidence
  1. ✅ Prompt logging section added (lines 962-1142)
  2. ✅ Log format documented with complete example
  3. ✅ Privacy considerations included (lines 1050-1067)
  4. ✅ .gitignore updated (lines 1-3)

  ## Step 4: Task Completion

  **Duration**: 5 minutes
  **Status**: ✅ Complete

  ### Files Modified
  - instructions/core/execute-task-orchestrated.md (+97 lines)
  - .gitignore (created, 3 lines)

  ### Metrics
  - Total Duration: 1 hour 15 minutes
  - Context Efficiency: 87% (12,350 / 14,200 tokens allocated)
  - Test Pass Rate: N/A (documentation task)
  - Verification Pass: 100%

  ## Insights and Learnings

  ### What Worked Well
  - Clear task decomposition enabled efficient parallel execution
  - Documentation specialist completed .gitignore quickly
  - Log format examples made requirements concrete

  ### Challenges Encountered
  - Initial log format was too verbose; simplified to focus on key data
  - Needed to balance detail vs. readability in log template

  ### Prompt Adjustments for Next Time
  - Include specific line count targets for documentation sections
  - Request explicit examples in initial prompt to reduce iteration
  - Specify markdown heading level consistency upfront

  ### Recommendations
  - Consider adding log analysis tools in future
  - Create prompt library from successful patterns
  - Implement automatic prompt logging for all orchestrated tasks
  ```
</log_format>

<privacy_and_security>
  **Privacy Considerations**:

  1. **Automatic Redaction** - Sensitive data must be removed before logging:
     - API keys and tokens (replace with `[REDACTED_API_KEY]`)
     - Passwords and credentials (replace with `[REDACTED_PASSWORD]`)
     - Personal information (emails, phone numbers, addresses)
     - Database connection strings (replace with `[REDACTED_DB_CONNECTION]`)
     - Secret environment variables
     - Authentication tokens and session IDs

  2. **Optional Logging** - Logging is disabled by default:
     - Enable via `PROMPT_LOGGING=true` environment variable
     - Or set `logging.prompts.enabled: true` in config.yml
     - Can be disabled per-task or globally

  3. **Local Storage Only**:
     - Logs stored in `.agent-os/logs/prompts/` directory
     - Never transmitted to external services
     - Stored on local filesystem only
     - User has full control over log retention

  4. **Git Exclusion**:
     - `.agent-os/logs/` added to .gitignore
     - Prevents accidental commit of logs to version control
     - Protects against inadvertent sensitive data exposure

  5. **Access Control**:
     - Logs inherit filesystem permissions
     - Recommend setting restrictive permissions (600 or 700)
     - Consider encrypting logs directory for sensitive projects

  6. **Retention Policy**:
     - Logs are not automatically cleaned up
     - Consider implementing log rotation
     - Recommended: Keep logs for 30 days, then archive or delete
     - Can use cron job or cleanup script

  **Security Best Practices**:
  - Review logs before sharing for troubleshooting
  - Delete logs after debugging is complete
  - Never commit logs to public repositories
  - Use redaction scripts before sharing logs with others
</privacy_and_security>

<usage_instructions>
  **Enabling Prompt Logging**:

  1. Via Environment Variable:
     ```bash
     export PROMPT_LOGGING=true
     # Run task execution
     execute-tasks ai-2
     ```

  2. Via Configuration File:
     ```yaml
     # config.yml
     logging:
       prompts:
         enabled: true
         verbosity: normal  # minimal | normal | verbose
         redact_sensitive: true
     ```

  3. Per-Task Override:
     ```bash
     # Enable logging for specific task
     PROMPT_LOGGING=true execute-tasks standards-3
     ```

  **Viewing Prompt Logs**:

  ```bash
  # View latest log
  cat .agent-os/logs/prompts/$(ls -t .agent-os/logs/prompts/ | head -1)

  # View specific task log
  cat .agent-os/logs/prompts/ai-2-*.md

  # View all logs for a task ID
  grep -r "Task ID: ai-2" .agent-os/logs/prompts/

  # List all logs by date
  ls -lt .agent-os/logs/prompts/
  ```

  **Analyzing Patterns**:

  ```bash
  # Find successful prompt patterns
  grep -A 20 "Status: ✅ Success" .agent-os/logs/prompts/*.md

  # Identify common failures
  grep -B 5 "Status: ❌ Failed" .agent-os/logs/prompts/*.md

  # Compare execution times
  grep "Duration:" .agent-os/logs/prompts/*.md | sort

  # Extract insights sections
  grep -A 10 "## Insights and Learnings" .agent-os/logs/prompts/*.md
  ```

  **Debug Failed Tasks**:

  When a task fails, review the prompt log to:
  1. Identify which agent/step failed
  2. Review the exact prompt sent
  3. Check agent response for error indicators
  4. Compare with successful similar tasks
  5. Identify missing context or unclear requirements

  **Improve Future Workflows**:

  1. **Build Prompt Library**:
     - Extract successful prompts from logs
     - Document patterns that work well
     - Create reusable prompt templates

  2. **Optimize Context Allocation**:
     - Review context usage per agent
     - Identify over/under-allocated agents
     - Adjust allocation strategy

  3. **Refine Agent Selection**:
     - Track which agents perform best for task types
     - Identify specialization opportunities
     - Optimize agent coordination patterns

  4. **Measure Performance**:
     - Track average execution time per task type
     - Monitor context efficiency trends
     - Calculate parallel processing gains
</usage_instructions>

<log_management>
  **Log Directory Structure**:
  ```
  .agent-os/logs/
  ├── prompts/
  │   ├── ai-2-20251026-131700.md
  │   ├── standards-3-20251026-140530.md
  │   └── compound-1-20251026-152045.md
  └── archived/
      └── 2025-10/
          └── prompts/
  ```

  **Automatic Cleanup Script** (Optional):
  ```bash
  #!/bin/bash
  # cleanup-prompt-logs.sh
  # Archive logs older than 30 days

  LOG_DIR=".agent-os/logs/prompts"
  ARCHIVE_DIR=".agent-os/logs/archived/$(date +%Y-%m)/prompts"

  mkdir -p "$ARCHIVE_DIR"

  # Find and move logs older than 30 days
  find "$LOG_DIR" -name "*.md" -mtime +30 -exec mv {} "$ARCHIVE_DIR/" \;

  echo "Archived logs older than 30 days to $ARCHIVE_DIR"
  ```

  **Log Analysis Tools** (Future Enhancement):
  - Create dashboard for prompt effectiveness
  - Generate reports on common patterns
  - Identify optimization opportunities
  - Track improvement metrics over time
</log_management>

<integration_with_orchestration>
  **When to Create Prompt Logs**:

  1. **Automatically** (if enabled):
     - Task-orchestrator creates log file at Step 1 start
     - Each agent adds entries as they execute
     - Orchestrator finalizes log at Step 4 completion

  2. **Manually** (for troubleshooting):
     - Create log after task failure for post-mortem
     - Document manual execution for workflow development
     - Capture one-off experiments and results

  **Log Creation Workflow**:
  ```
  Step 1 (Orchestration Setup):
    - Create log file: .agent-os/logs/prompts/[TASK_ID]-[TIMESTAMP].md
    - Write task context and strategy
    - Document deliverable manifest

  Step 2 (Parallel Execution):
    - Each agent appends their section
    - Document prompts, responses, deliverables
    - Track timestamps and context usage

  Step 3 (Verification):
    - Document verification activities
    - Record acceptance criteria evidence
    - Note any issues encountered

  Step 4 (Completion):
    - Add final metrics and summaries
    - Document insights and learnings
    - Suggest improvements for future tasks

  Step 5 (Post-Execution):
    - Review log for completeness
    - Redact any sensitive data
    - Archive if older than retention period
  ```
</integration_with_orchestration>

<instructions>
  OPTIONAL: If prompt logging is enabled (PROMPT_LOGGING=true):

  1. CREATE log file at task start:
     - Path: .agent-os/logs/prompts/[TASK_ID]-[TIMESTAMP].md
     - Use standard format template

  2. DOCUMENT each execution step:
     - Record prompts sent to each agent
     - Capture agent responses (summary)
     - Track timestamps and durations
     - Note deliverables completed

  3. REDACT sensitive information:
     - API keys, passwords, credentials
     - Personal information
     - Secret configuration values

  4. FINALIZE at task completion:
     - Add metrics and insights
     - Document learnings
     - Suggest improvements

  5. USE for future optimization:
     - Review successful patterns
     - Debug failures
     - Improve prompt templates
     - Optimize agent coordination
</instructions>

</step>

</process_flow>

<orchestration_success_metrics>
  <performance_improvements>
    execution_speed: "Target 60-80% faster completion through parallel processing"
    context_efficiency: "Target 40-50% better context utilization"
    error_reduction: "Target 75% fewer failed executions"
  </performance_improvements>

  <quality_maintenance>
    test_coverage: "Maintain or improve current coverage levels"
    code_quality: "Meet or exceed established quality standards"
    integration_success: "Achieve 100% successful integrations"
  </quality_maintenance>

  <coordination_effectiveness>
    agent_utilization: "Maximize parallel processing efficiency"
    context_optimization: "Optimize context window usage across agents"
    orchestration_overhead: "Minimize coordination costs while maximizing benefits"
  </coordination_effectiveness>
</orchestration_success_metrics>

<step number="99" name="beads_task_completion_and_sync">

### Step 99: Beads Task Completion and Sync (Optional)

Mark task complete in Beads and sync to git after all deliverables verified and quality gates passed.

<beads_completion>
  <config_check>
    ACTION: Check if Beads integration is enabled

    IF config.yml → beads.enabled = true:
      PROCEED with Beads completion
    ELSE:
      SKIP this step
      UPDATE: Only update tasks.md checkbox
      PROCEED to post-flight
  </config_check>

  <deliverable_summary>
    ACTION: Compile deliverable summary for Beads close reason

    EXTRACT from task execution:
      - All files created/modified
      - All tests passing
      - All acceptance criteria met
      - All quality gates passed
      - Integration points verified

    FORMAT summary:
      "All acceptance criteria met. Deliverables: [FILE_LIST].
       Tests: [TEST_COUNT] passing. Integration verified.
       Quality gates: [GATE_LIST] passed."
  </deliverable_summary>

  <mark_task_complete>
    ACTION: Close task in Beads

    EXECUTE:
      bd close ${TASK_ID} \
        --reason "[DELIVERABLE_SUMMARY]" \
        --json

    OUTPUT:
      {
        "id": "impl-comp1-core",
        "status": "closed",
        "closed_at": "2025-11-03T10:30:45Z",
        "reason": "All acceptance criteria met..."
      }

    CONFIRM: "✅ Task ${TASK_ID} marked complete in Beads"

    IF close fails:
      WARN: "⚠️  Could not close task in Beads (non-critical)"
      LOG: Error details
      CONTINUE: Proceed with markdown update anyway
  </mark_task_complete>

  <update_markdown_status>
    ACTION: Update tasks.md completion checkbox

    IF config.yml → beads.bidirectional_sync = true:
      EXECUTE:
        # Update checkbox from [ ] to [x]
        sed -i "s/\[ \] \*\*${TASK_ID}\*\*/[x] **${TASK_ID}**/" tasks.md

      CONFIRM: "✅ tasks.md updated with completion status"

      IF update fails:
        WARN: "⚠️  Could not update tasks.md (non-critical)"
        NOTE: "Manual update may be needed"
  </update_markdown_status>

  <sync_to_git>
    ACTION: Sync Beads database to git

    IF config.yml → beads.sync_on_task_complete = true:
      EXECUTE:
        bd sync

      PROCESS:
        - Exports pending changes to .beads/issues.jsonl
        - Commits .beads/issues.jsonl to git
        - Pulls from remote
        - Imports any updates from others
        - Pushes to remote

      CONFIRM: "✅ Beads database synced to git"

      IF sync fails:
        WARN: "⚠️  Beads sync failed"
        LOG: Error details
        NOTE: "Run 'bd sync' manually when git connection restored"
  </sync_to_git>

  <query_newly_unblocked>
    ACTION: Check if completing this task unblocked others

    EXECUTE:
      bd ready --json > /tmp/beads-newly-ready.json

    COMPARE:
      - Tasks ready before this task completion
      - Tasks ready after this task completion

    IF new tasks are now ready:
      DISPLAY:
        "🎉 Task completion unblocked new work:

         Newly Ready Tasks:
         - [NEW_TASK_1]: [TITLE] (P[PRIORITY])
         - [NEW_TASK_2]: [TITLE] (P[PRIORITY])

         Total ready tasks: [READY_COUNT]

         Would you like to continue with the next task?"

      OPTIONS:
        1. Continue with highest priority ready task
        2. Select specific task
        3. Stop here (commit changes, end session)

      IF user chooses to continue:
        LOOP back to Step 0.2 with next task
      ELSE:
        PROCEED to post-flight
    ELSE:
      INFORM: "No new tasks unblocked. All ready work remains the same."
      PROCEED to post-flight
  </query_newly_unblocked>

  <discovered_work_tracking>
    ACTION: Check for discovered work during task execution

    IF new issues were discovered:
      PROMPT: "Issues discovered during implementation:
               [LIST discovered issues]

               Create Beads issues for discovered work?"

      IF user agrees:
        FOR each discovered issue:
          EXECUTE:
            bd create "[ISSUE_TITLE]" \
              --deps "discovered-from:${TASK_ID}" \
              --priority [PRIORITY] \
              --type [bug|enhancement|task] \
              --label "discovered" \
              --json

          LINK: Creates "discovered-from" dependency to parent task
          TRACK: Maintains context chain for future work

        CONFIRM: "✅ [COUNT] discovered issues created and linked"
  </discovered_work_tracking>

  <stale_task_detection>
    IF config.yml → beads.stale_detection.enabled = true:
      ACTION: Check for stale tasks (optional, non-blocking)

      EXECUTE:
        bd stale --days [config.stale_detection.threshold_days] --json

      IF stale tasks found:
        WARN:
          "⚠️  Found [COUNT] stale tasks (inactive for [DAYS]+ days):
           [LIST stale task IDs and titles]

           Consider reviewing or closing stale tasks."

        NOTE: "Run 'bd stale --days 30' anytime to check"
  </stale_task_detection>

  <execution_metrics>
    DISPLAY final execution metrics:

      "✅ Task Execution Complete

       Task: ${TASK_ID}
       Status: Closed ✓
       Duration: [EXECUTION_TIME]
       Deliverables: [DELIVERABLE_COUNT] files
       Tests: [TEST_COUNT] passing
       Quality Gates: All passed ✓

       Beads Status:
       - Task marked complete
       - Database synced to git
       - Newly unblocked: [NEW_READY_COUNT] tasks
       - Discovered work: [DISCOVERED_COUNT] issues created

       Next: Review newly ready tasks or commit changes"
  </execution_metrics>

  <session_end_reminder>
    IF this is last task of session:
      REMIND:
        "💾 Session Ending Checklist:

         1. ✓ Task closed in Beads
         2. ✓ Database synced to git
         3. [ ] Review uncommitted changes (git status)
         4. [ ] Commit and push code changes
         5. [ ] Run final quality validation (optional)

         Next session will resume with:
         - Beads state automatically loaded
         - Ready tasks available via 'bd ready'
         - Full context preserved"
  </session_end_reminder>
</beads_completion>

</step>

<post_flight_check>
  EXECUTE: @.agent-os/instructions/meta/post-flight.md
</post_flight_check>