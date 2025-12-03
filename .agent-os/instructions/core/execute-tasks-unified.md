---
description: Unified task execution with Beads-first orchestration and parallel specialist execution
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Unified Task Execution Protocol

> **Version**: 1.0.0 | Combines Context-Aware Execution + Orchestrated Parallel Execution
> **Core Principle**: Main agent creates ALL beads tasks with dependencies FIRST, then delegates to parallel specialists

## Overview

Execute tasks using a Beads-first approach where:
1. Main agent plans ALL work upfront and creates beads tasks with dependencies
2. Pre-flight checks ensure clean repo state
3. Parallel specialist subagents execute work on assigned beads tasks
4. Context-aware monitoring ensures clean handoffs and checkpoints
5. Agent-OS task/spec documents are updated as work progresses

---

## Critical Directives

### Context Limit Enforcement
**Stop at 75% context capacity.** No exceptions. This ensures clean handoffs.

After EVERY significant action, evaluate:
1. Am I approaching 75%? → Initiate graceful stop
2. Can I complete next action AND save state? → If no, stop now
3. 10+ tool calls since last checkpoint? → Save progress to Beads

### Beads-First Principle
**Every subagent works on a tracked Beads task.** Create BEFORE spawning.

---

## Process Flow

<pre_flight_check>
  EXECUTE: @.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

<process_flow>

## Phase 0: Pre-Flight & Repository Health

<step number="0.1" name="quality_hooks_verification">

### Step 0.1: Quality Hooks Verification

Verify quality hooks are active for automatic validation.

<verification>
  CHECK: .claude/hooks/validate-file.js exists
  CHECK: Quality hooks configured in ~/.agent-os/hooks/config.yml

  IF hooks not installed:
    RECOMMEND: ~/.agent-os/setup/install-hooks.sh
    WARN: "Quality validation will be reduced without hooks"

  CONFIRM: "Quality hooks: [Active/Not Installed]"
</verification>

</step>

<step number="0.2" name="repository_health_check">

### Step 0.2: Repository Health Check

Ensure clean repository state before creating beads tasks.

<health_check>
  EXECUTE in parallel:
    - git status (check uncommitted changes)
    - git branch -a (list all branches)
    - gh pr list --state open (check open PRs)
    - bd doctor (Beads health check)

  <decision_tree>
    IF uncommitted changes exist:
      PROMPT: "Uncommitted changes detected. Options:
               1. commit - Commit changes now
               2. stash - Stash changes temporarily
               3. continue - Proceed anyway (risky)"
      WAIT for user decision
      EXECUTE chosen action

    IF open PRs that are ready to merge:
      RECOMMEND: "Consider merging ready PRs before new work"
      LIST: PR details with status
      WAIT for user acknowledgment

    IF Beads issues detected:
      EXECUTE: bd doctor --fix
      VERIFY: Issues resolved
  </decision_tree>

  CONFIRM: "Repository health: [Clean/Issues Resolved]"
</health_check>

</step>

<step number="0.3" name="branch_setup">

### Step 0.3: Branch Setup

Create or switch to the appropriate branch for this work.

<branch_management>
  IF spec folder provided:
    BRANCH_NAME = spec folder name (without date prefix)
    Example: "2025-03-15-password-reset" → "password-reset"
  ELSE:
    BRANCH_NAME = "work/[brief-description]"

  CHECK: git branch --list ${BRANCH_NAME}

  IF branch exists:
    SWITCH: git checkout ${BRANCH_NAME}
    REBASE: git rebase main (if behind)
  ELSE:
    CREATE: git checkout -b ${BRANCH_NAME}

  CONFIRM: "Working branch: ${BRANCH_NAME}"
</branch_management>

</step>

---

## Phase 1: Beads Task Decomposition (BEFORE Any Execution)

<step number="1.1" name="work_analysis">

### Step 1.1: Analyze Work Scope

Understand the full scope of work before creating any beads tasks.

<analysis>
  READ task specifications:
    - tasks.md (overview)
    - tasks/task-*.md (details for each task)
    - Relevant spec documents

  IDENTIFY:
    - Total number of tasks and subtasks
    - Dependencies between tasks
    - Required specialist roles (test-architect, implementation-specialist, etc.)
    - Estimated parallel execution opportunities
    - Potential blockers or risks

  OUTPUT:
    📋 Work Scope Analysis:
    - Parent tasks: [COUNT]
    - Total subtasks: [COUNT]
    - Dependency chains: [LIST]
    - Parallel streams possible: [COUNT]
    - Specialist roles needed: [LIST]
</analysis>

</step>

<step number="1.2" name="beads_task_creation">

### Step 1.2: Create ALL Beads Tasks with Dependencies

**CRITICAL**: Create ALL tasks and define ALL dependencies BEFORE any execution begins.

<beads_creation_protocol>
  FOR each parent_task in tasks.md:
    1. CREATE parent beads task:
       bd create --title="[TASK_TITLE]" --type=[task|feature|bug]
       CAPTURE: PARENT_TASK_ID

    2. FOR each subtask under this parent:
       bd create --title="[SUBTASK_TITLE]" --type=task
       CAPTURE: SUBTASK_ID

       # Link subtask to parent
       bd dep add ${SUBTASK_ID} ${PARENT_TASK_ID}

    3. FOR each cross-task dependency:
       # If task B depends on task A (A blocks B)
       bd dep add ${TASK_B_ID} ${TASK_A_ID}

  VERIFY dependency graph:
    bd list --json > /tmp/beads-tasks.json
    PARSE and display dependency tree

  OUTPUT:
    🔗 Beads Task Graph Created:

    [PARENT-001] Feature: User Authentication
    ├─ [TASK-001] Write unit tests (test-architect)
    ├─ [TASK-002] Implement auth service (implementation-specialist) ← depends on TASK-001
    ├─ [TASK-003] Create login UI (frontend-specialist) ← depends on TASK-002
    └─ [TASK-004] Integration tests (test-architect) ← depends on TASK-002, TASK-003

    Total tasks: [COUNT]
    Ready to execute (no blockers): [COUNT]
    Blocked (waiting on dependencies): [COUNT]
</beads_creation_protocol>

</step>

<step number="1.3" name="execution_plan">

### Step 1.3: Create Execution Plan

Plan which tasks can run in parallel and which must be sequential.

<execution_planning>
  QUERY: bd ready --json

  IDENTIFY parallel execution streams:
    Stream 1: [TASK-IDs that can run simultaneously]
    Stream 2: [Next batch after Stream 1 completes]
    ...

  MAP specialist roles to tasks:
    - test-architect: [TASK-IDs]
    - implementation-specialist: [TASK-IDs]
    - frontend-specialist: [TASK-IDs]
    - security-sentinel: [TASK-IDs]

  OUTPUT:
    📊 Execution Plan:

    Wave 1 (parallel):
    ├─ [TASK-001] test-architect
    └─ [TASK-005] test-architect

    Wave 2 (after Wave 1):
    ├─ [TASK-002] implementation-specialist
    ├─ [TASK-003] frontend-specialist
    └─ [TASK-006] implementation-specialist

    Wave 3 (after Wave 2):
    └─ [TASK-004] test-architect (integration)

    Estimated waves: [COUNT]
</execution_planning>

</step>

<step number="1.4" name="user_confirmation">

### Step 1.4: Confirm Execution Plan with User

Present the plan and get user approval before proceeding.

<confirmation>
  DISPLAY:
    "📋 EXECUTION PLAN READY

     Beads tasks created: [COUNT]
     Dependency chains defined: [COUNT]
     Parallel execution waves: [COUNT]

     Ready to begin execution?

     Options:
     1. proceed - Start execution as planned
     2. modify - Adjust the plan first
     3. show-deps - View full dependency graph
     4. abort - Cancel and clean up beads tasks"

  WAIT for user confirmation

  IF user selects "abort":
    CLEANUP: bd close [ALL_CREATED_TASK_IDS] --reason="Cancelled"
    HALT
</confirmation>

</step>

---

## Phase 2: Parallel Execution with Specialists

<step number="2.1" name="wave_execution">

### Step 2.1: Execute Waves with Specialist Subagents

Execute each wave of parallel tasks using specialist subagents.

<wave_execution_loop>
  FOR each wave in execution_plan:

    # 1. Claim all tasks in this wave
    FOR each task_id in wave:
      bd update ${task_id} --status in_progress

    # 2. Launch parallel subagents
    SPAWN parallel subagents using Task tool:
      FOR each task in wave:
        Task(subagent_type: "general-purpose",
             prompt: "{BEADS_AWARE_DELEGATION_TEMPLATE with task_id}")

    # 3. Wait for all subagents to complete
    COLLECT all subagent status reports

    # 4. Process each status report
    FOR each report:
      PARSE: STATUS, TASK_ID, COMPLETED, REMAINING, BLOCKERS

      IF STATUS == "completed":
        bd close ${TASK_ID} --reason="[summary]"
        UPDATE tasks.md status to ✅

      ELIF STATUS == "stopped_at_checkpoint":
        # Subagent hit context limit - needs continuation
        bd note ${TASK_ID} "[checkpoint details from report]"
        ADD to continuation_queue

      ELIF STATUS == "blocked":
        # Subagent encountered blocker
        bd note ${TASK_ID} "[blocker details]"
        PROMPT user for decision

    # 5. Handle continuations before next wave
    IF continuation_queue not empty:
      PROCESS continuations (see Step 2.3)

    # 6. Sync beads after each wave
    bd sync --from-main
    git add -A && git commit -m "checkpoint: wave [N] complete"

  END FOR each wave
</wave_execution_loop>

</step>

<step number="2.2" name="beads_aware_delegation">

### Step 2.2: Beads-Aware Delegation Template

Use this template for ALL subagent delegations.

<delegation_template>
```
═══════════════════════════════════════════════════════════════════
BEADS CONTEXT PROTOCOL - DO NOT SKIP
═══════════════════════════════════════════════════════════════════

You are working on Beads task: ${TASK_ID}
Task title: ${TASK_TITLE}

BEFORE starting work:
1. READ your Beads task: bd show ${TASK_ID}
2. CHECK for any notes from previous agents
3. VERIFY no blockers exist

DURING work:
1. Monitor your context usage - stop at 75% capacity
2. Save progress every 10 tool calls: bd note ${TASK_ID} "..."
3. Update Agent-OS task file if deliverables change

BEFORE stopping (required):
1. UPDATE Beads: bd note ${TASK_ID} "[checkpoint details]"
2. COMMIT work: git add -A && git commit -m "checkpoint: ${TASK_ID} - [brief]"
3. SYNC Beads: bd sync --from-main
4. REPORT status (format below)

═══════════════════════════════════════════════════════════════════
MANDATORY INSTRUCTION LOADING
═══════════════════════════════════════════════════════════════════

BEFORE performing ANY work, you MUST:

1. READ the instruction file for your role:
   @.agent-os/instructions/agents/${AGENT_ROLE}.md

2. INTERNALIZE key constraints from instructions

3. CONFIRM understanding by stating what you read

4. INVOKE required skills:
   ${SKILL_INVOCATIONS_FOR_PHASE}

5. CHECK pattern hierarchy:
   FIRST:  .agent-os/patterns/ (project-specific)
   SECOND: Skills (generic patterns)
   THIRD:  WebSearch (fallback)

═══════════════════════════════════════════════════════════════════
TASK ASSIGNMENT
═══════════════════════════════════════════════════════════════════

TASK: ${TASK_TITLE}
BEADS_ID: ${TASK_ID}
ROLE: ${AGENT_ROLE}
PHASE: ${PHASE_NAME}

${SPECIFIC_TASK_REQUIREMENTS}

DELIVERABLES:
${DELIVERABLES_LIST}

ACCEPTANCE CRITERIA:
${ACCEPTANCE_CRITERIA_LIST}

═══════════════════════════════════════════════════════════════════
STATUS REPORT FORMAT (MANDATORY ON COMPLETION)
═══════════════════════════════════════════════════════════════════

---
STATUS: [completed | stopped_at_checkpoint | blocked]
TASK_ID: ${TASK_ID}
COMPLETED:
- [bullet list of completed items]

REMAINING:
- [bullet list of remaining items, if any]

FILES_MODIFIED:
- [list of files created/modified with brief description]

TESTS:
- [passing/failing/not yet run]

STOPPED_AT: [exact point - file:line or step]
NEXT_ACTION: [what next agent should do first]
BLOCKERS: [any issues encountered]
---

Update Agent-OS task file: tasks/task-${TASK_ID}.md
Mark subtasks complete as you finish them.
```
</delegation_template>

</step>

<step number="2.3" name="continuation_handling">

### Step 2.3: Handle Continuations and Incomplete Tasks

When a subagent stops at checkpoint or is blocked, handle appropriately.

<continuation_protocol>
  IF STATUS == "stopped_at_checkpoint":

    DISPLAY:
      "⏸️  TASK PAUSED: ${TASK_ID} - ${TASK_TITLE}

       Progress: ~[X]% complete
       Stopped at: ${STOPPED_AT}
       Next action: ${NEXT_ACTION}

       Remaining work:
       ${REMAINING}

       Options:
       1. continue - Spawn continuation agent
       2. defer - Move to next wave, continue later
       3. investigate - I'll examine before proceeding"

    WAIT for user decision

    IF user selects "continue":
      SPAWN continuation agent with:
        - Beads task ID
        - Previous agent's STOPPED_AT and NEXT_ACTION
        - REMAINING items
        - Full context from bd show ${TASK_ID}

  IF STATUS == "blocked":

    DISPLAY:
      "🚫 TASK BLOCKED: ${TASK_ID} - ${TASK_TITLE}

       Blocker: ${BLOCKERS}

       Options:
       1. resolve - Help me resolve the blocker
       2. skip - Skip this task for now
       3. abort - Stop all work on this task"

    WAIT for user decision
    EXECUTE chosen action
</continuation_protocol>

</step>

<step number="2.4" name="document_updates">

### Step 2.4: Update Agent-OS Documents as Work Progresses

Keep task and spec documents synchronized with actual progress.

<document_sync>
  AFTER each task completion:
    1. UPDATE tasks.md:
       - Mark completed subtasks with ✅
       - Add actual completion notes

    2. UPDATE tasks/task-${TASK_ID}.md:
       - Mark deliverables as completed
       - Add file paths for created files
       - Note any deviations from plan

    3. IF spec changes needed:
       - UPDATE relevant sub-spec documents
       - Document rationale for changes

  AFTER each wave:
    1. SYNC all document changes
    2. COMMIT: git add -A && git commit -m "docs: update task progress after wave [N]"
</document_sync>

</step>

---

## Phase 3: Context-Aware Monitoring

<step number="3.1" name="orchestrator_context_monitoring">

### Step 3.1: Main Agent Context Monitoring

The main orchestrating agent must also monitor its own context.

<self_monitoring>
  AFTER each wave:
    EVALUATE:
      - Am I approaching 75% context?
      - How many waves remain?
      - Can I complete next wave AND save state?

    IF approaching 75%:
      INITIATE graceful stop (Step 3.2)
</self_monitoring>

</step>

<step number="3.2" name="orchestrator_checkpoint">

### Step 3.2: Orchestrator Checkpoint Protocol

If main agent must stop, save full orchestration state.

<checkpoint_protocol>
  EXECUTE:
    1. Ensure all active subagents have reported back

    2. Save orchestration state to Beads:
       bd note ${MAIN_TASK_ID} "
       ORCHESTRATOR CHECKPOINT: [timestamp]

       ORCHESTRATION STATE:
       - Current wave: [N] of [TOTAL]
       - Waves completed: [LIST]
       - Active subagents: [none - all returned]

       TASK PROGRESS:
       - Overall: [X]% complete
       - Tasks completed: [LIST with IDs]
       - Tasks remaining: [LIST with IDs]
       - Tasks in progress: [LIST with IDs and status]

       CONTINUATION QUEUE:
       - [TASK_ID]: stopped at [X], needs [NEXT_ACTION]

       FULL CONTEXT:
       - Key decisions made: [LIST]
       - Integration notes: [NOTES]
       - Blockers encountered: [LIST]

       NEXT ORCHESTRATOR ACTION:
       [Exactly what the next session should do first]
       "

    3. Commit all changes:
       git add -A
       git commit -m "checkpoint: orchestrator stopping at wave [N]"

    4. Sync Beads:
       bd sync --from-main

    5. Inform user:
       "ORCHESTRATOR CHECKPOINT

        I am approaching my context limit and must stop.

        Progress: [X]% complete ([N] of [TOTAL] waves)
        All state saved to Beads task: ${MAIN_TASK_ID}

        To resume:
          1. Start new session
          2. Run: bd show ${MAIN_TASK_ID}
          3. Instruct me to continue from checkpoint

        Remaining work:
        [SUMMARY]"
</checkpoint_protocol>

</step>

---

## Phase 4: Post-Execution & Verification

<step number="4.1" name="deliverable_verification">

### Step 4.1: Verify All Deliverables

Before completing, verify all expected deliverables exist.

<verification>
  FOR each task:
    READ tasks/task-${TASK_ID}.md
    EXTRACT deliverable manifest

    FOR each expected file:
      VERIFY: File exists using Read tool
      VERIFY: File has expected content/structure

    FOR each test requirement:
      VERIFY: Tests exist and pass

  REPORT:
    ✅ Verified: [LIST of verified deliverables]
    ❌ Missing: [LIST of missing items]
    ⚠️  Issues: [LIST of verification failures]

  IF any missing or issues:
    PROMPT user for resolution
</verification>

</step>

<step number="4.2" name="test_suite_execution">

### Step 4.2: Run Full Test Suite

Execute all tests to verify implementation quality.

<test_execution>
  EXECUTE directly (for real-time visibility):
    - Unit tests: pnpm test:unit:ci (or equivalent)
    - Integration tests: pnpm test:integration:ci
    - E2E tests: pnpm test:e2e:ci

  Use streaming reporters for visibility:
    node ~/.agent-os/hooks/lib/test-monitor.js [test command]

  IF failures:
    ANALYZE failure patterns
    PROMPT user: "Test failures detected. Options:
                  1. investigate - Analyze failures
                  2. fix - Delegate fixes to subagent
                  3. continue - Proceed anyway (not recommended)"
</test_execution>

</step>

<step number="4.3" name="beads_completion">

### Step 4.3: Complete Beads Tasks

Close all completed beads tasks with proper documentation.

<beads_completion>
  FOR each completed task:
    bd close ${TASK_ID} --reason="Completed: [deliverables summary]"

  Verify all tasks closed:
    bd list --status=open

    IF tasks still open:
      REPORT: "⚠️  Tasks still open: [LIST]"
      PROMPT user for action

  Final sync:
    bd sync --from-main
</beads_completion>

</step>

<step number="4.4" name="final_commit_and_summary">

### Step 4.4: Final Commit and Summary

Create final commit and generate completion summary.

<completion>
  1. Stage all changes:
     git add -A

  2. Create completion commit:
     git commit -m "feat: [feature description]

     Completed tasks:
     - [TASK-001]: [description]
     - [TASK-002]: [description]

     🤖 Generated with [Claude Code](https://claude.com/claude-code)

     Co-Authored-By: Claude <noreply@anthropic.com>"

  3. Generate summary:
     "✅ EXECUTION COMPLETE

      📊 Summary:
      - Tasks completed: [COUNT]
      - Files created/modified: [COUNT]
      - Tests passing: [COUNT]
      - Execution waves: [COUNT]

      📁 Deliverables:
      [LIST with file paths]

      🔗 Branch: ${BRANCH_NAME}

      Next steps:
      1. Review changes: git diff main...HEAD
      2. Create PR when ready: gh pr create"
</completion>

</step>

</process_flow>

<post_flight_check>
  EXECUTE: @.agent-os/instructions/meta/post-flight.md
</post_flight_check>

---

## Quick Reference: Beads Commands

```bash
# Finding work
bd ready                     # Show unblocked tasks
bd list --status=in_progress # Active work
bd show <id>                 # Task details

# Creating & updating
bd create --title="..." --type=task
bd update <id> --status=in_progress
bd note <id> "checkpoint..."
bd close <id> --reason="..."

# Dependencies
bd dep add <child> <parent>  # child depends on parent
bd blocked                   # Show blocked tasks

# Sync (critical at checkpoints)
bd sync --from-main          # Pull updates from main
```

---

## Skill Invocations by Role

| Role | Required Skills |
|------|-----------------|
| test-context-gatherer | agent-os-test-research, agent-os-patterns |
| test-architect | agent-os-patterns (vitest.md, playwright.md) |
| implementation-specialist | agent-os-patterns, agent-os-specialists |
| frontend-specialist | agent-os-patterns, agent-os-specialists (frontend-react.md) |
| security-sentinel | agent-os-specialists |

---

## Configuration

Enable in `config.yml`:

```yaml
unified_execution:
  enabled: true
  beads_first: true
  context_limit: 0.75
  checkpoint_interval: 10  # tool calls
  parallel_waves: true
  auto_continuation: false  # require user approval
```
