---
version: 1.0.0
last-updated: 2026-01-17
related-files:
  - instructions/core/execute-tasks.md
---

# Run Protocol

> **Purpose**: Unified task execution with autonomous mode and supervisor orchestration
> **Core Principle**: Supervisor -> PM -> subagent architecture for reliable execution
> **Context Management**: Supervisor stays minimal (<5% context), spawns PM subagents
> **v1.0**: Consolidates `/orchestrate` and `/context-aware` into single `/run` command

## Overview

`/run` is the unified command for task execution. By default, it uses autonomous
execution with the supervisor pattern. Use `--quick` for simpler direct execution.

## When to Use Each Mode

| Mode | Use When |
|------|----------|
| `/run` (default) | Multi-session work, large specs, hands-off execution |
| `/run --quick` | Few tasks, simple changes, faster startup |
| `/run --supervisor` | Force supervisor pattern regardless of task count |

## Execution Flow

```
Phase 0: Pre-Flight (same as execute-tasks)
├─ Quality hooks verification
├─ Repository health check
└─ Branch setup

Phase 1: Task Collection (SIMPLIFIED - no decision logic)
├─ Collect tasks from source
├─ Create Beads tasks if needed
├─ Group into waves (parallel when possible, sequential otherwise)
└─ NO decision about whether to orchestrate - always do it

Phase 2: Supervisor Orchestration (ALWAYS USED)
├─ Supervisor stays minimal
├─ Spawn PM subagent for each wave
├─ PM works until wave complete or PreCompact hook fires
├─ Checkpoint, spawn next PM
└─ Continue until all tasks complete

Phase 3-4: (same as execute-tasks)
├─ Verify deliverables
├─ Run tests
└─ Final commit
```

---

<pre_flight_check>
  EXECUTE: @.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

## Phase 0: Pre-Flight

Same as execute-tasks. See: `instructions/core/execute-tasks.md` Phase 0

```bash
# Quick summary
CHECK: Quality hooks installed
CHECK: Repository health (git status, bd doctor)
SETUP: Working branch
```

---

## Phase 1: Task Collection

### 1.1: Determine Task Source

```
PARSE input:

IF <SPEC_FOLDER> provided:
  SOURCE = "spec"
  READ: .agent-os/specs/{SPEC_FOLDER}/tasks.md
  READ: .agent-os/specs/{SPEC_FOLDER}/tasks/*.md

ELIF --beads OR no args:
  SOURCE = "beads"
  EXECUTE: bd ready --json

ELIF --tasks "T1, T2, ...":
  SOURCE = "inline"
  PARSE: Task list from argument

ELIF --file <path>:
  SOURCE = "file"
  READ: Task list from file

OUTPUT:
  📋 Task Source: {SOURCE}
  📊 Tasks found: {COUNT}
```

### 1.2: Create Beads Tasks (if needed)

```bash
IF SOURCE == "spec" AND tasks not in Beads:
  FOR each task in tasks.md:
    bd create --title="[TITLE]" --type=task
    CAPTURE: TASK_ID

IF SOURCE == "inline" OR SOURCE == "file":
  FOR each task:
    bd create --title="[TASK]" --type=task
    CAPTURE: TASK_ID

# Verify all tasks exist in Beads
bd list --json
```

### 1.3: Group into Waves

```
ANALYZE dependencies:

FOR each task:
  CHECK: bd show {TASK_ID} → blocked_by

GROUP tasks:
  Wave 1: Tasks with no blockers (can run in parallel)
  Wave 2: Tasks that depend on Wave 1
  Wave N: Continue until all tasks assigned

OUTPUT:
  📊 Execution Plan:
  Wave 1: [{TASK_IDS}] (parallel: {COUNT})
  Wave 2: [{TASK_IDS}]
  ...
  Total waves: {N}
```

### 1.4: Confirm with User

```
DISPLAY:
  "📋 ORCHESTRATED EXECUTION READY

   Mode: Supervisor → PM → Subagents
   Tasks: {COUNT} | Waves: {WAVE_COUNT}

   This will run autonomously with checkpointing.
   Intervention only needed for blockers.

   Options:
   1. proceed
   2. show-tasks (list all)
   3. abort"

WAIT for confirmation
```

---

## Phase 2: Supervisor Orchestration

**CRITICAL**: This phase ALWAYS uses the supervisor pattern. No decision logic.

### 2.1: Supervisor Role

```
SUPERVISOR CONSTRAINTS:
- Stay minimal - dispatch and coordinate only
- DO NOT do implementation work
- Only: dispatch, collect status, checkpoint, dispatch next

SUPERVISOR RESPONSIBILITIES:
1. Dispatch PM subagent with task wave
2. Receive status report
3. Update Beads based on report
4. Checkpoint if needed
5. Dispatch next wave or PM continuation
6. Repeat until complete
```

### 2.2: PM Dispatch Template

```
FOR each wave:

  # 1. Claim all tasks in wave
  FOR task in wave:
    bd update ${task} --status in_progress

  # 2. Spawn PM subagent
  Task(subagent_type: "general-purpose", prompt: "
═══════════════════════════════════════════════════════════
ORCHESTRATED EXECUTION - PM SESSION
═══════════════════════════════════════════════════════════

You are a PM (Project Manager) subagent. Execute the assigned tasks
autonomously until either:
- All tasks in this wave complete
- PreCompact hook fires (you'll see 'CONTEXT COMPACTION IMMINENT' message)

PRECOMPACT PROTOCOL:
- When you see 'CONTEXT COMPACTION IMMINENT', follow the graceful shutdown instructions
- Wait for any subagents you spawned to complete
- Write state to .agent-os/session-ledger.md (see execute-tasks.md Phase 3.1)
- Save notes to Beads before stopping
- Another PM will continue from session ledger checkpoint

WAVE ASSIGNMENT:
Tasks: ${WAVE_TASK_IDS}

FOR each task:
  1. bd show {TASK_ID}
  2. Load required instructions/skills
  3. Execute task
  4. bd close {TASK_ID} when complete
  5. Checkpoint: bd note, git commit

MANDATORY: Return status report (format below)

═══════════════════════════════════════════════════════════
INSTRUCTION LOADING
═══════════════════════════════════════════════════════════

BEFORE each task:
1. READ task details: bd show {TASK_ID}
2. READ relevant instruction file if specified
3. Skill invocations as needed
4. CHECK patterns: .agent-os/patterns/ first

═══════════════════════════════════════════════════════════
STATUS REPORT FORMAT (MANDATORY)
═══════════════════════════════════════════════════════════

---
STATUS: [completed | stopped_at_checkpoint | blocked]
WAVE: {WAVE_NUMBER}
COMPLETED_TASKS:
- {TASK_ID}: {summary}

REMAINING_TASKS:
- {TASK_ID}: {status}

FILES_MODIFIED:
- {file}: {description}

TESTS:
- {passing/failing/not yet run}

STOPPED_AT: {exact point if stopped}
NEXT_ACTION: {what next PM does first}
BLOCKERS: {if any}
---
")

  # 3. Process response
  PARSE: Status report

  IF STATUS == "completed":
    FOR task in completed_tasks:
      VERIFY: bd show {task} → status == closed
    CONTINUE to next wave

  ELIF STATUS == "stopped_at_checkpoint":
    DISPLAY: "⏸️ PM stopped at checkpoint"
    SPAWN: Continuation PM with remaining tasks

  ELIF STATUS == "blocked":
    DISPLAY: "🚫 BLOCKED: {BLOCKERS}"
    PROMPT: User for resolution
```

### 2.3: Wave Completion

```
AFTER each wave:

  # Checkpoint
  bd sync
  git add -A && git commit -m "checkpoint: wave {N} complete"

  # Status update
  DISPLAY:
    "✓ Wave {N}/{TOTAL} complete
     Completed: {COMPLETED_COUNT}
     Remaining: {REMAINING_COUNT}"

  # Continue to next wave
  IF more_waves:
    CONTINUE to next wave
  ELSE:
    PROCEED to Phase 3
```

---

## Phase 3: Post-Execution Verification

Same as execute-tasks Phase 4. See: `instructions/core/execute-tasks.md`

```bash
# Quick summary
VERIFY: All deliverables exist
RUN: pnpm tsc --noEmit (if TypeScript)
RUN: pnpm test
CLOSE: All Beads tasks
COMMIT: Final state
```

---

## Phase 4: Completion

```
DISPLAY:
  "✅ ORCHESTRATED EXECUTION COMPLETE

   📊 Summary:
   - Tasks completed: {COUNT}
   - Waves executed: {WAVE_COUNT}
   - PM sessions: {PM_COUNT}
   - Files modified: {FILE_COUNT}

   📁 Deliverables:
   {LIST}

   🔗 Branch: {BRANCH}

   Next steps:
   1. git diff main...HEAD
   2. gh pr create"

# Final sync
bd sync
git push (if appropriate)
```

<post_flight_check>
  EXECUTE: @.agent-os/instructions/meta/post-flight.md
</post_flight_check>

---

## Quick Reference

### Supervisor Stays Minimal

```
DO:
- Dispatch subagents
- Collect status reports
- Update Beads
- Checkpoint

DO NOT:
- Read implementation code
- Make implementation decisions
- Accumulate context
```

### PM Works Until Done or PreCompact

```
PM executes until:
1. All wave tasks complete → return "completed"
2. PreCompact hook fires → save state, return "stopped_at_checkpoint"
3. Blocker encountered → return "blocked"
```

### Checkpointing

```
EVERY checkpoint includes:
1. bd note {TASK_ID} with current state
2. git add -A && git commit
3. bd sync
```

---

## Configuration

```yaml
# config.yml
orchestrate:
  enabled: true
  auto_checkpoint: true
  parallel_waves: true            # Run wave tasks in parallel when possible
  # Context limits removed - PreCompact hook handles graceful shutdown automatically
```
