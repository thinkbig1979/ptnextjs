# Unified Task Execution Protocol

> **Version**: 1.1.0 | Beads-first orchestration with parallel specialists
> **Core Principle**: Create ALL beads tasks + dependencies FIRST, then delegate execution
> **v4.5.0**: Test integrity analysis (Phase 1.5)

## Execution Flow

```
Phase 0: Pre-Flight
├─ Quality hooks verification
├─ Repository health check
└─ Branch setup

Phase 1: Beads Task Decomposition
├─ Analyze work scope
├─ Create ALL beads tasks
├─ Define ALL dependencies
└─ Create execution plan

Phase 1.5: Test Integrity Analysis (v4.5.0)
├─ Identify modified files
├─ Discover affected existing tests
├─ Categorize impact (critical/high/medium)
├─ Create test update Beads tasks
└─ Link test updates → implementation

Phase 2: Parallel Execution
├─ Execute waves (implementation + test updates)
├─ Collect status reports
└─ Checkpoint after waves

Phase 3: Context Monitoring
├─ Track 75% limit
└─ Graceful stop with state saved

Phase 4: Post-Execution
├─ Verify deliverables
├─ Run full test suite
├─ Verify test integrity
└─ Final commit and summary
```

## Critical Directives

| Directive | Rule |
|-----------|------|
| **Context limit** | Stop at 75% capacity. No exceptions. |
| **Beads-first** | Create task BEFORE spawning subagent. |
| **Checkpoint frequency** | Every 10 tool calls or end of wave. |
| **User approval** | Always prompt for blocked/checkpoint decisions. |

---

<pre_flight_check>
  EXECUTE: @.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

## Phase 0: Pre-Flight

### 0.1: Quality Hooks Verification

```bash
CHECK: .claude/hooks/validate-file.js exists
CHECK: ~/.agent-os/hooks/config.yml configured

IF not installed:
  RECOMMEND: ~/.agent-os/setup/install-hooks.sh
  WARN: "Quality validation reduced without hooks"

CONFIRM: "Quality hooks: [Active/Not Installed]"
```

### 0.2: Repository Health Check

```bash
# Execute in parallel
git status
git branch -a
gh pr list --state open
bd doctor

# Decision tree
IF uncommitted changes:
  PROMPT: "Options: 1. commit 2. stash 3. continue"
  WAIT for user decision

IF open ready PRs:
  RECOMMEND: "Consider merging PRs first"
  LIST: PR details

IF Beads issues:
  EXECUTE: bd doctor --fix
  VERIFY: Resolved

CONFIRM: "Repository health: [Clean/Issues Resolved]"
```

### 0.3: Branch Setup

```bash
# Branch naming
IF spec folder provided:
  BRANCH = spec folder name (no date prefix)
  Example: "2025-03-15-password-reset" → "password-reset"
ELSE:
  BRANCH = "work/[brief-description]"

# Branch management
IF exists:
  git checkout ${BRANCH}
  git rebase main  # if behind
ELSE:
  git checkout -b ${BRANCH}

CONFIRM: "Working branch: ${BRANCH}"
```

---

## Phase 1: Beads Task Decomposition

### 1.1: Analyze Work Scope

```
READ:
  - tasks.md (overview)
  - tasks/task-*.md (details)
  - Spec documents

IDENTIFY:
  - Task count (parent + subtasks)
  - Dependencies
  - Specialist roles needed
  - Parallel opportunities
  - Potential blockers

OUTPUT:
  📋 Work Scope Analysis:
  - Parent tasks: [COUNT]
  - Subtasks: [COUNT]
  - Dependency chains: [LIST]
  - Parallel streams: [COUNT]
  - Roles needed: [LIST]
```

### 1.2: Create ALL Beads Tasks + Dependencies

**CRITICAL**: Create BEFORE execution begins.

```bash
FOR each parent_task in tasks.md:
  # Create parent
  bd create --title="[TITLE]" --type=[task|feature|bug]
  CAPTURE: PARENT_ID

  # Create subtasks
  FOR each subtask:
    bd create --title="[SUBTASK_TITLE]" --type=task
    CAPTURE: SUBTASK_ID
    bd dep add ${SUBTASK_ID} ${PARENT_ID}

  # Cross-task dependencies
  FOR each dependency:
    bd dep add ${CHILD_ID} ${PARENT_ID}  # child depends on parent

# Verify
bd list --json > /tmp/beads-tasks.json

OUTPUT:
  🔗 Beads Task Graph:
  [PARENT-001] Feature: User Auth
  ├─ [TASK-001] Unit tests
  ├─ [TASK-002] Implement service ← depends on TASK-001
  ├─ [TASK-003] Login UI ← depends on TASK-002
  └─ [TASK-004] Integration tests ← depends on TASK-002, TASK-003

  Total: [COUNT]
  Ready: [COUNT]
  Blocked: [COUNT]
```

### 1.3: Create Execution Plan

```bash
bd ready --json

# Identify parallel streams
Stream 1: [simultaneous TASK-IDs]
Stream 2: [next batch after Stream 1]

# Map roles
test-architect: [TASK-IDs]
implementation-specialist: [TASK-IDs]
frontend-specialist: [TASK-IDs]

OUTPUT:
  📊 Execution Plan:
  Wave 1 (parallel): [TASK-001, TASK-005]
  Wave 2: [TASK-002, TASK-003, TASK-006]
  Wave 3: [TASK-004]
  Estimated waves: [COUNT]
```

### 1.4: Confirm with User

```
DISPLAY:
  "📋 EXECUTION PLAN READY
   Tasks: [COUNT] | Waves: [COUNT]
   
   Options:
   1. proceed
   2. modify
   3. show-deps
   4. abort"

WAIT for confirmation

IF abort:
  bd close [ALL_TASK_IDS] --reason="Cancelled"
  HALT
```

---

## Phase 1.5: Test Integrity Analysis (v4.5.0)

**Purpose**: Identify existing tests affected by planned changes BEFORE implementation.

### 1.5.1: Check Configuration

```
READ: config.yml → test_integrity_maintenance

IF enabled = false:
  SKIP to Phase 2
```

### 1.5.2: Load Instructions

```
READ: @.agent-os/instructions/agents/test-integrity-analyzer.md
CONFIRM: "Loading test-integrity-analyzer instructions"
```

### 1.5.3: Scope Analysis

```
FOR each implementation task:
  EXTRACT:
    - Files modified: [LIST from deliverables]
    - Functions changed: [LIST from spec]
    - APIs affected: [LIST]
    - Schema changes: [LIST]

OUTPUT:
  📋 Change Scope {TASK_ID}:
  Files: [N] | Functions: [N] | APIs: [N]
```

### 1.5.4: Discover Affected Tests

| Strategy | Pattern |
|----------|---------|
| Direct tests | `**/{filename}.test.{ts,tsx,js}` |
| Mock references | `vi.mock(['\"].*{module_path}` |
| Import references | `import.*from.*{module_path}` (scope: `**/*.test.*`) |
| E2E routes | `page.goto(['\"].*{affected_route}` (scope: `tests/e2e/**`) |
| Fixtures | `fixtures/{model}` (if schema changes) |

### 1.5.5: Categorize + Prioritize

| Category | Priority | Action |
|----------|----------|--------|
| directly_affected | CRITICAL | Must update |
| mock_dependent | HIGH | Check signatures |
| e2e_affected | HIGH | Full verification |
| fixture_dependent | MEDIUM | Verify schema |
| indirect_consumer | MEDIUM | Verify behavior |

```
OUTPUT:
  🔍 Affected Tests:
  ┌──────────┬───────────────────┬───────┬─────────────────┐
  │ Priority │ Category          │ Count │ Action          │
  ├──────────┼───────────────────┼───────┼─────────────────┤
  │ CRITICAL │ Directly affected │  {N}  │ Must update     │
  │ HIGH     │ Mock dependent    │  {N}  │ Check sigs      │
  │ HIGH     │ E2E affected      │  {N}  │ Full verify     │
  │ MEDIUM   │ Fixture dependent │  {N}  │ Verify schema   │
  │ MEDIUM   │ Indirect          │  {N}  │ Verify behavior │
  └──────────┴───────────────────┴───────┴─────────────────┘
```

### 1.5.6: Create Test Update Tasks

```bash
IF auto_create_beads_tasks = true:
  FOR each test group (by feature):
    # Create task
    bd create --title="Update tests: {feature}" --type=task
    CAPTURE: TEST_UPDATE_ID

    # Add details
    bd note ${TEST_UPDATE_ID} "
    Affected tests:
    - {test.file}: {reason}
    
    Requirements:
    - Verify mocks match signatures
    - Update assertions
    - Confirm fixtures"

    # Link to implementation
    bd dep add ${TEST_UPDATE_ID} ${IMPL_ID}

OUTPUT:
  📝 Test Update Tasks:
  - {task.id}: {task.title} (depends on {impl_id})
```

### 1.5.7: Update Execution Plan

```
BEFORE:
  Wave 1: [IMPL-001]
  Wave 2: [IMPL-002]

AFTER (regrouped):
  Wave 1: [IMPL-001]
  Wave 2: [IMPL-002] + [TEST-UPD-001]
  Wave 3: [TEST-UPD-002]
```

### 1.5.8: Save Report

```bash
SAVE: .agent-os/test-integrity/{TASK_ID}-analysis.json

CONTENTS:
  - Task ID + timestamp
  - Change scope
  - Discovered tests + categories
  - Created Beads tasks
  - Recommendations
```

### 1.5.9: Enforcement

| Mode | Behavior |
|------|----------|
| `blocking` | Halt if critical tests + no update plan |
| `warning` | Prompt if affected tests found |
| `advisory` | Display summary and continue |

```
DISPLAY:
  "═══════════════════════════════════════════════════════════
   TEST INTEGRITY ANALYSIS - COMPLETE
   ═══════════════════════════════════════════════════════════
   
   📋 Change Scope: {files} files, {funcs} functions
   🔍 Affected Tests: {total} (Critical: {N}, High: {N}, Medium: {N})
   📝 Update Tasks Created: {count}
   📍 Report: .agent-os/test-integrity/{TASK_ID}-analysis.json
   ═══════════════════════════════════════════════════════════"

PROCEED to Phase 2
```

---

## Phase 2: Parallel Execution

### 2.1: Execute Waves

```bash
FOR each wave:
  # 1. Claim tasks
  FOR task in wave:
    bd update ${task} --status in_progress

  # 2. Launch parallel subagents
  FOR task in wave:
    Task(subagent_type: "general-purpose",
         prompt: "{BEADS_DELEGATION_TEMPLATE}")

  # 3. Collect status reports
  FOR report in responses:
    PARSE: STATUS, TASK_ID, COMPLETED, REMAINING, BLOCKERS

    IF STATUS == "completed":
      bd close ${TASK_ID} --reason="[summary]"
      UPDATE tasks.md → ✅

    ELIF STATUS == "stopped_at_checkpoint":
      bd note ${TASK_ID} "[checkpoint details]"
      ADD to continuation_queue

    ELIF STATUS == "blocked":
      bd note ${TASK_ID} "[blocker details]"
      PROMPT user

  # 4. Handle continuations
  IF continuation_queue not empty:
    PROCESS continuations (Step 2.3)

  # 5. Checkpoint
  bd sync --from-main
  git add -A && git commit -m "checkpoint: wave [N] complete"
```

### 2.2: Beads-Aware Delegation Template

```
═══════════════════════════════════════════════════════════
BEADS CONTEXT PROTOCOL
═══════════════════════════════════════════════════════════

Working on: ${TASK_ID} - ${TASK_TITLE}

BEFORE starting:
1. READ: bd show ${TASK_ID}
2. CHECK for notes
3. VERIFY no blockers

DURING work:
1. Monitor context (stop at 75%)
2. Save every 10 calls: bd note ${TASK_ID} "..."
3. Update Agent-OS task file

BEFORE stopping (REQUIRED):
1. bd note ${TASK_ID} "[checkpoint]"
2. git add -A && git commit -m "checkpoint: ${TASK_ID} - [brief]"
3. bd sync --from-main
4. REPORT status (format below)

═══════════════════════════════════════════════════════════
MANDATORY INSTRUCTION LOADING
═══════════════════════════════════════════════════════════

BEFORE work:
1. READ: @.agent-os/instructions/agents/${AGENT_ROLE}.md
2. INTERNALIZE key constraints
3. CONFIRM understanding
4. INVOKE required skills: ${SKILL_INVOCATIONS}
5. CHECK patterns:
   FIRST:  .agent-os/patterns/ (project-specific)
   SECOND: Skills (generic)
   THIRD:  WebSearch (fallback)

═══════════════════════════════════════════════════════════
TASK ASSIGNMENT
═══════════════════════════════════════════════════════════

TASK: ${TASK_TITLE}
BEADS_ID: ${TASK_ID}
ROLE: ${AGENT_ROLE}
PHASE: ${PHASE_NAME}

${REQUIREMENTS}

DELIVERABLES:
${DELIVERABLES}

ACCEPTANCE:
${ACCEPTANCE_CRITERIA}

═══════════════════════════════════════════════════════════
STATUS REPORT FORMAT (MANDATORY)
═══════════════════════════════════════════════════════════

---
STATUS: [completed | stopped_at_checkpoint | blocked]
TASK_ID: ${TASK_ID}
COMPLETED:
- [bullet list]

REMAINING:
- [bullet list]

FILES_MODIFIED:
- [file: description]

TESTS:
- [passing/failing/not yet run]

STOPPED_AT: [exact point - file:line or step]
NEXT_ACTION: [what next agent does first]
BLOCKERS: [issues]
---

Update: tasks/task-${TASK_ID}.md
```

### 2.3: Handle Continuations

**stopped_at_checkpoint**:
```
DISPLAY:
  "⏸️  PAUSED: ${TASK_ID}
   Progress: ~[X]%
   Stopped at: ${STOPPED_AT}
   Next: ${NEXT_ACTION}
   
   Options:
   1. continue - Spawn continuation agent
   2. defer - Move to next wave
   3. investigate - Examine first"

WAIT for decision

IF continue:
  SPAWN with: task ID, STOPPED_AT, NEXT_ACTION, REMAINING
```

**blocked**:
```
DISPLAY:
  "🚫 BLOCKED: ${TASK_ID}
   Blocker: ${BLOCKERS}
   
   Options:
   1. resolve
   2. skip
   3. abort"

WAIT for decision
```

### 2.4: Update Documents

```bash
AFTER each task completion:
  # Update tasks.md
  - Mark subtasks ✅
  - Add completion notes

  # Update tasks/task-${TASK_ID}.md
  - Mark deliverables complete
  - Add file paths
  - Note deviations

  # Update specs if needed
  - Modify sub-spec docs
  - Document rationale

AFTER each wave:
  git add -A && git commit -m "docs: wave [N] progress"
```

---

## Phase 3: Context Monitoring

### 3.1: Orchestrator Context Check

```
AFTER each wave:
  EVALUATE:
    - Am I at 75% context?
    - Waves remaining?
    - Can I complete next + save state?

  IF approaching 75%:
    INITIATE graceful stop (Step 3.2)
```

### 3.2: Orchestrator Checkpoint

```bash
# 1. Ensure all subagents returned

# 2. Save state
bd note ${MAIN_TASK_ID} "
ORCHESTRATOR CHECKPOINT: [timestamp]

STATE:
- Current wave: [N]/[TOTAL]
- Completed: [LIST]
- Active subagents: none

PROGRESS:
- Overall: [X]%
- Completed: [TASK_IDS]
- Remaining: [TASK_IDS]
- In progress: [TASK_IDS + status]

CONTINUATION_QUEUE:
- [TASK_ID]: stopped at [X], needs [ACTION]

CONTEXT:
- Key decisions: [LIST]
- Integration notes: [NOTES]
- Blockers: [LIST]

NEXT ACTION:
[Exactly what next session does first]"

# 3. Commit
git add -A && git commit -m "checkpoint: orchestrator at wave [N]"

# 4. Sync
bd sync --from-main

# 5. Inform user
DISPLAY:
  "ORCHESTRATOR CHECKPOINT
   Progress: [X]% ([N]/[TOTAL] waves)
   State saved: ${MAIN_TASK_ID}
   
   To resume:
   1. Start new session
   2. bd show ${MAIN_TASK_ID}
   3. Continue from checkpoint
   
   Remaining: [SUMMARY]"
```

---

## Phase 4: Post-Execution

### 4.1: Verify Deliverables

```bash
FOR each task:
  READ: tasks/task-${TASK_ID}.md
  EXTRACT: deliverable manifest

  FOR each file:
    VERIFY: Exists (Read tool)
    VERIFY: Expected content/structure

  FOR each test requirement:
    VERIFY: Tests exist + pass

REPORT:
  ✅ Verified: [LIST]
  ❌ Missing: [LIST]
  ⚠️  Issues: [LIST]

IF issues:
  PROMPT user
```

### 4.2: TypeScript Verification

**MANDATORY for TS projects.**

```bash
CHECK: tsconfig.json exists?

IF yes:
  EXECUTE: pnpm tsc --noEmit

  IF errors:
    REPORT: file:line:column format
    PROMPT: "Options:
             1. fix (RECOMMENDED)
             2. investigate
             3. continue (NOT recommended)"

    IF fix:
      FIX errors
      RE-RUN: pnpm tsc --noEmit
      VERIFY: Clean

  IF clean:
    CONFIRM: "✓ TypeScript passed"

IF no tsconfig:
  SKIP
```

### 4.3: Run Full Test Suite

```bash
# Execute directly (real-time visibility)
pnpm test:unit:ci
pnpm test:integration:ci
pnpm test:e2e:ci

# Use streaming
node ~/.agent-os/hooks/lib/test-monitor.js [command]

IF failures:
  ANALYZE patterns
  PROMPT: "Options:
           1. investigate
           2. fix (delegate to subagent)
           3. continue (not recommended)"
```

### 4.4: Complete Beads Tasks

```bash
FOR each task:
  bd close ${TASK_ID} --reason="[summary]"

# Verify
bd list --status=open

IF open tasks:
  REPORT: "⚠️ Still open: [LIST]"
  PROMPT user

# Final sync
bd sync --from-main
```

### 4.5: Final Commit + Summary

```bash
# 1. Stage
git add -A

# 2. Commit
git commit -m "feat: [description]

Completed:
- [TASK-001]: [desc]
- [TASK-002]: [desc]

🤖 [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 3. Summary
DISPLAY:
  "✅ EXECUTION COMPLETE
   
   📊 Summary:
   - Tasks: [COUNT]
   - Files: [COUNT]
   - Tests passing: [COUNT]
   - Waves: [COUNT]
   
   📁 Deliverables:
   [LIST with paths]
   
   🔗 Branch: ${BRANCH}
   
   Next:
   1. git diff main...HEAD
   2. gh pr create"
```

<post_flight_check>
  EXECUTE: @.agent-os/instructions/meta/post-flight.md
</post_flight_check>

---

## Quick Reference

### Beads Commands

```bash
# Find work
bd ready                     # Unblocked tasks
bd list --status=in_progress # Active work
bd show <id>                 # Task details

# Create + update
bd create --title="..." --type=task
bd update <id> --status=in_progress
bd note <id> "checkpoint..."
bd close <id> --reason="..."

# Dependencies
bd dep add <child> <parent>  # child depends on parent
bd blocked                   # Show blocked

# Sync (critical)
bd sync --from-main
```

### Skill Invocations

| Role | Required Skills |
|------|-----------------|
| test-context-gatherer | agent-os-test-research, agent-os-patterns |
| test-architect | agent-os-patterns (vitest, playwright) |
| implementation-specialist | agent-os-patterns, agent-os-specialists |
| frontend-specialist | agent-os-patterns, agent-os-specialists |
| security-sentinel | agent-os-specialists |

### Configuration

```yaml
unified_execution:
  enabled: true
  beads_first: true
  context_limit: 0.75
  checkpoint_interval: 10
  parallel_waves: true
  auto_continuation: false
```
