---
version: 1.1.0
last-updated: 2026-02-21
related-files:
  - instructions/core/run.md
  - instructions/core/team.md
  - instructions/utilities/beads-integration-guide.md
  - instructions/utilities/subagent-delegation-template.md
---

# 3-Layer Orchestration Protocol

> **Purpose**: Maximum context efficiency for complex, multi-session work
> **Architecture**: Orchestrator → PM → Workers (parallel)
> **Context Budget**: Orchestrator ~5%, PM ~30%, Workers ~60%
> **Use When**: 10+ tasks, complex specs, multi-session expected

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│ ORCHESTRATOR (minimal context ~5%)                          │
│ - High-level decisions ONLY                                 │
│ - Spawns/replaces PM agents                                 │
│ - Receives status summaries from PM                         │
│ - PreCompact → tell PM to finish, save orchestrator state   │
└────────────────────────┬────────────────────────────────────┘
                         │ spawns
┌────────────────────────▼────────────────────────────────────┐
│ PM (coordinator ~30% context)                               │
│ - Receives wave assignment from orchestrator                │
│ - Dispatches granular tasks to workers IN PARALLEL          │
│ - Tracks worker status, aggregates results                  │
│ - Feeds key status/questions to orchestrator                │
│ - PreCompact → tell workers to finalize, create PM handoff  │
└────────────────────────┬────────────────────────────────────┘
                         │ spawns (parallel)
┌────────────────────────▼────────────────────────────────────┐
│ WORKERS (specialized ~60% context)                          │
│ - implementation-specialist, test-architect, etc.           │
│ - Execute granular tasks                                    │
│ - Report completion/blockers to PM                          │
└─────────────────────────────────────────────────────────────┘
```

## Key Principles

1. **Orchestrator stays MINIMAL** - No implementation details, only high-level steering
2. **PM coordinates, doesn't implement** - Dispatches to workers, tracks status
3. **Workers do the actual work** - Specialized roles, full implementation context
4. **Handoffs preserve context** - Each tier creates handoff for replacement

---

## Phase 0: Pre-Flight (Orchestrator)

```bash
# Orchestrator performs minimal setup
ORCHESTRATOR_ID="aos-orchestrator-$(date +%s)"
bd agent state ${ORCHESTRATOR_ID} working

# Quick health check
git status --short
bd doctor --quiet

# Check for session resume
IF exists .agent-os/session-ledger.md:
  READ: session-ledger.md
  PROMPT: "Resume from checkpoint? [yes/no]"
  IF yes:
    LOAD: handoff context
    SKIP to Phase 2 with loaded state

CONFIRM: "Pre-flight complete"
```

---

## Phase 1: Task Analysis (Orchestrator)

**Keep this BRIEF - orchestrator should not accumulate context**

```bash
# 1.1: Identify task source
IF <SPEC_FOLDER> provided:
  COUNT tasks in spec (don't read details)
  TASKS = bd list --json --label "spec:${SPEC_FOLDER}"
ELSE:
  TASKS = bd ready --json

# 1.2: Group into waves (high-level only)
WAVES = group_by_dependencies(TASKS)

# 1.3: Quick display
DISPLAY:
  "📋 ORCHESTRATION PLAN
   Tasks: ${TASK_COUNT}
   Waves: ${WAVE_COUNT}
   Mode: 3-Layer (Orchestrator → PM → Workers)

   Wave 1: ${WAVE_1_COUNT} tasks (parallel)
   Wave 2: ${WAVE_2_COUNT} tasks
   ...

   [proceed / abort]"

WAIT for confirmation
```

---

## Phase 2: PM Dispatch Loop (Orchestrator)

**CRITICAL: Orchestrator only dispatches PM, never reads task details**

```
WHILE waves_remaining:

  # 2.1: Spawn PM for current wave (always Opus for coordination judgment)
  PM_ID="aos-pm-wave${WAVE_NUMBER}-$(date +%s)"
  bd agent state ${PM_ID} spawning

  Task(subagent_type: "general-purpose", model: "opus", prompt: "
  ${PM_DISPATCH_TEMPLATE}
  ")

  # 2.2: Process PM response
  PARSE: PM status report

  IF pm_status == "wave_complete":
    bd agent state ${PM_ID} done
    WAVE_NUMBER++
    CONTINUE

  ELIF pm_status == "pm_precompact":
    # PM hit context limit, needs replacement
    bd agent state ${PM_ID} stopped
    SAVE: pm_handoff to session state
    SPAWN: new PM with handoff context

  ELIF pm_status == "blocked":
    # PM escalated a blocker
    DISPLAY: blocker to user
    PROMPT: resolution
    SPAWN: PM continuation with resolution

  ELIF pm_status == "question":
    # PM needs orchestrator decision
    DISPLAY: question
    PROMPT: decision
    SPAWN: PM continuation with answer

# 2.3: All waves complete
bd agent state ${ORCHESTRATOR_ID} done
PROCEED to Phase 3
```

### PM Dispatch Template

```
═══════════════════════════════════════════════════════════
PM SESSION - WAVE ${WAVE_NUMBER}
═══════════════════════════════════════════════════════════

PM_ID: ${PM_ID}
ORCHESTRATOR_ID: ${ORCHESTRATOR_ID}

You are a PM (Project Manager) subagent. Your job is to COORDINATE workers,
not implement tasks yourself.

═══════════════════════════════════════════════════════════
AGENT STATE PROTOCOL
═══════════════════════════════════════════════════════════

ON START:
  bd agent state ${PM_ID} working

DURING WORK (every 10 tool calls):
  bd agent heartbeat ${PM_ID}

ON COMPLETE:
  bd agent state ${PM_ID} done

ON PRECOMPACT:
  bd agent state ${PM_ID} stopped

═══════════════════════════════════════════════════════════
WAVE ASSIGNMENT
═══════════════════════════════════════════════════════════

WAVE: ${WAVE_NUMBER}
TASKS: ${TASK_IDS}

${IF_HANDOFF_EXISTS}
CONTINUING FROM PREVIOUS PM:
${PM_HANDOFF_CONTEXT}
${ENDIF}

═══════════════════════════════════════════════════════════
YOUR RESPONSIBILITIES
═══════════════════════════════════════════════════════════

1. READ task details: bd show ${TASK_ID} for each task
2. ASSESS task complexity and ASSIGN model tiers:
   - Implementation, test writing → model: "sonnet"
   - File ops, mechanical refactors → model: "haiku" (with explicit step-by-step instructions)
   - Security review, architectural decisions → model: "opus"
   See: instructions/utilities/subagent-delegation-template.md (Model-Tier Selection)
3. SIZE tasks to 60-70% of executing agent's context window
   - Split tasks exceeding 70% into subtasks
   - Combine tasks under 40% if they're related
4. DISPATCH workers IN PARALLEL for independent tasks
5. TRACK worker status via bd agent state
6. AFTER each wave: SPAWN QC reviewers (Opus) to validate completed work
   - 1 QC reviewer per 3 completed tasks (minimum 1)
   - QC reviewer must NOT have implemented the tasks they review
   - If QC fails: assign rework to original implementer
7. AGGREGATE results from workers and QC reviewers
8. UPDATE task status: bd comments, bd close (only after QC passes)
9. REPORT summary to orchestrator (not details)
10. ESCALATE blockers/questions to orchestrator

EXCEPTION: You may execute small complex tasks directly when delegation
overhead exceeds task effort (e.g., a 2-line config change requiring
full worker setup). Use judgment, but your own work is still reviewed by QC.

DO NOT:
- Implement large tasks yourself
- Accumulate implementation code in your context
- Make architectural decisions (escalate to orchestrator)
- Read file contents unless absolutely necessary for coordination
- Close tasks before QC review passes (no self-QC, ever)

═══════════════════════════════════════════════════════════
WORKER DISPATCH
═══════════════════════════════════════════════════════════

FOR each task (PARALLEL where independent):

  WORKER_ID="aos-${ROLE}-${TASK_ID}"
  MODEL_TIER = determine_model_tier(ROLE)
  # implementation-specialist, test-architect → "sonnet"
  # file ops, refactors → "haiku"
  # security-sentinel → "opus"
  bd agent state ${WORKER_ID} spawning

  Task(subagent_type: "general-purpose", model: "${MODEL_TIER}", prompt: "
  ${WORKER_DISPATCH_TEMPLATE}
  ")

  # Process worker response
  IF worker_status == "completed":
    bd agent state ${WORKER_ID} done
    ADD to completed_this_wave  # DO NOT bd close yet - QC first

  ELIF worker_status == "stopped":
    bd agent state ${WORKER_ID} stopped
    SAVE: worker checkpoint

  ELIF worker_status == "blocked":
    bd agent state ${WORKER_ID} stuck
    IF can_resolve:
      RESOLVE and respawn worker
    ELSE:
      ESCALATE to orchestrator

═══════════════════════════════════════════════════════════
POST-WAVE QC REVIEW
═══════════════════════════════════════════════════════════

AFTER all workers in wave complete:

  # Determine QC reviewer count
  completed_count = len(completed_this_wave)
  IF completed_count <= 2:
    qc_count = 1
  ELIF completed_count <= 5:
    qc_count = 2
  ELSE:
    qc_count = ceil(completed_count / 3)

  # Distribute tasks across QC reviewers (~3 per reviewer)
  qc_batches = split(completed_this_wave, qc_count)

  # Spawn QC reviewers IN PARALLEL (always Opus)
  FOR batch in qc_batches (PARALLEL):
    QC_ID="aos-qc-wave${WAVE_NUMBER}-${batch_index}"
    Task(subagent_type: "general-purpose", model: "opus", prompt: "
    ${QC_REVIEWER_TEMPLATE}
    ")
    # QC_REVIEWER_TEMPLATE: see run.md QC Reviewer Template section

  # Process QC results
  FOR task in qc_results:
    IF task.qc_status == "pass":
      bd close ${task.id} --reason="QC passed: ${task.summary}"
    ELIF task.qc_status == "fail":
      # Re-assign rework to original implementer
      SPAWN worker with rework instructions (same model tier)

═══════════════════════════════════════════════════════════
PRECOMPACT PROTOCOL
═══════════════════════════════════════════════════════════

WHEN you see 'CONTEXT COMPACTION IMMINENT':

1. STOP dispatching new workers
2. TELL active workers to finalize:
   - Let them complete current subtask
   - Have them report checkpoint state
3. WAIT for all workers to respond
4. CREATE PM handoff brief:

   ---
   PM_HANDOFF:
   wave: ${WAVE_NUMBER}
   completed_tasks:
     - ${TASK_ID}: ${summary}
   in_progress_tasks:
     - ${TASK_ID}:
         worker_checkpoint: ${checkpoint}
         next_action: ${next}
   remaining_tasks:
     - ${TASK_ID}: not started
   key_decisions:
     - ${decision}
   blockers:
     - ${blocker}
   ---

5. REPORT to orchestrator with handoff brief

═══════════════════════════════════════════════════════════
STATUS REPORT FORMAT (to Orchestrator)
═══════════════════════════════════════════════════════════

---
PM_STATUS: [wave_complete | pm_precompact | blocked | question]
PM_ID: ${PM_ID}
WAVE: ${WAVE_NUMBER}

COMPLETED_TASKS: ${COUNT}
IN_PROGRESS_TASKS: ${COUNT}
REMAINING_TASKS: ${COUNT}

SUMMARY: [1-2 sentence high-level summary]

${IF pm_precompact}
PM_HANDOFF:
  [handoff brief]
${ENDIF}

${IF blocked}
BLOCKER: [description]
OPTIONS: [possible resolutions]
${ENDIF}

${IF question}
QUESTION: [question for orchestrator]
OPTIONS: [choices if applicable]
${ENDIF}
---
```

---

## Phase 2.5: Worker Dispatch (PM)

**This happens inside the PM subagent**

### Worker Dispatch Template

```
═══════════════════════════════════════════════════════════
WORKER SESSION - ${TASK_ID}
═══════════════════════════════════════════════════════════

WORKER_ID: ${WORKER_ID}
PM_ID: ${PM_ID}
ROLE: ${ROLE}

═══════════════════════════════════════════════════════════
AGENT STATE PROTOCOL
═══════════════════════════════════════════════════════════

ON START:
  bd agent state ${WORKER_ID} working
  bd comments add ${TASK_ID} "Worker starting: ${ROLE}"

DURING WORK (every 5-10 tool calls):
  bd comments add ${TASK_ID} "Progress: [what you just did]"
  bd agent heartbeat ${WORKER_ID}

ON KEY DECISIONS:
  bd audit add --type=decision --text="[choice] because [rationale]"

ON DISCOVERIES:
  bd audit add --type=discovery --text="Found [what] at [location]"

ON COMPLETE:
  bd comments add ${TASK_ID} "Complete: [summary]"
  bd agent state ${WORKER_ID} done

ON STOP (PreCompact):
  bd comments add ${TASK_ID} "Stopped at: [checkpoint]"
  bd agent state ${WORKER_ID} stopped

═══════════════════════════════════════════════════════════
TASK ASSIGNMENT
═══════════════════════════════════════════════════════════

TASK_ID: ${TASK_ID}
TITLE: ${TASK_TITLE}

INSTRUCTIONS:
1. READ: bd show ${TASK_ID}
2. READ: @.agent-os/instructions/agents/${ROLE}.md
3. EXECUTE the task
4. REPORT back to PM

DELIVERABLES:
${DELIVERABLES}

ACCEPTANCE CRITERIA:
${ACCEPTANCE_CRITERIA}

═══════════════════════════════════════════════════════════
PRECOMPACT PROTOCOL
═══════════════════════════════════════════════════════════

WHEN you see 'CONTEXT COMPACTION IMMINENT':

1. COMPLETE current subtask if possible (< 2 min)
2. SAVE checkpoint state
3. REPORT to PM immediately

═══════════════════════════════════════════════════════════
STATUS REPORT FORMAT (to PM)
═══════════════════════════════════════════════════════════

---
WORKER_STATUS: [completed | stopped | blocked]
WORKER_ID: ${WORKER_ID}
TASK_ID: ${TASK_ID}

COMPLETED:
- [bullet list of what was done]

REMAINING:
- [bullet list of what's left]

FILES_MODIFIED:
- [file]: [description]

TESTS:
- [passing/failing/not run]

${IF stopped}
STOPPED_AT: [exact checkpoint - file:line or step]
NEXT_ACTION: [what to do first when resumed]
${ENDIF}

${IF blocked}
BLOCKER: [description]
NEED: [what's needed to unblock]
${ENDIF}
---
```

---

## Phase 3: Completion (Orchestrator)

```bash
# All waves complete
DISPLAY:
  "✅ ORCHESTRATION COMPLETE

   📊 Summary:
   - Tasks completed: ${TASK_COUNT}
   - Waves executed: ${WAVE_COUNT}
   - PM sessions: ${PM_COUNT}
   - Worker sessions: ${WORKER_COUNT}

   📁 Deliverables:
   [high-level list from PM reports]

   🔗 Branch: ${BRANCH}

   Next steps:
   1. Review changes: git diff main...HEAD
   2. Create PR: gh pr create"

# Final sync
bd agent state ${ORCHESTRATOR_ID} done
bd sync
```

---

## Phase 4: Orchestrator PreCompact

**When orchestrator hits context limit**

```bash
WHEN 'CONTEXT COMPACTION IMMINENT':

1. TELL PM to finish:
   "PreCompact imminent. Finish current workers and create handoff."

2. WAIT for PM handoff

3. CREATE orchestrator handoff:

   # Session Ledger: Orchestration
   Created: ${TIMESTAMP}
   Last Updated: ${NOW}

   ## Orchestrator State
   - Wave: ${CURRENT_WAVE}/${TOTAL_WAVES}
   - Tasks completed: ${COUNT}
   - Tasks remaining: ${COUNT}

   ## PM Handoff
   ${PM_HANDOFF_BRIEF}

   ## Resume Instructions
   1. Read this ledger
   2. Spawn new PM with PM Handoff section
   3. Continue from wave ${CURRENT_WAVE}

4. SAVE to .agent-os/session-ledger.md

5. COMMIT:
   git add -A
   git commit -m "checkpoint: orchestrator handoff at wave ${WAVE}"
   bd sync

6. EXIT gracefully
```

---

## Handoff Chain Summary

```
Worker PreCompact:
  → Finalize subtask
  → Report checkpoint to PM
  → PM spawns replacement worker if needed

PM PreCompact:
  → Tell workers to finalize
  → Collect worker checkpoints
  → Create PM handoff brief
  → Report to orchestrator
  → Orchestrator spawns replacement PM

Orchestrator PreCompact:
  → Tell PM to finish
  → Receive PM handoff
  → Create session ledger
  → Exit (user starts new session)
  → New orchestrator reads ledger, continues
```

---

## Beads Integration Summary

| Tier | Model | Commands Used |
|------|-------|---------------|
| Orchestrator | opus | `bd agent state` (PM), `bd ready`, `bd sync` |
| PM | opus | `bd agent state` (workers/QC), `bd show`, `bd comments`, `bd close` |
| Workers | sonnet/haiku | `bd agent state`, `bd comments`, `bd audit`, `bd agent heartbeat` |
| QC Reviewers | opus | `bd show`, `bd comments` (QC verdict), report to PM |

---

## Configuration

```yaml
orchestrate:
  enabled: true
  mode: "3-layer"

  # Context budgets (advisory)
  orchestrator_context: 0.05   # 5%
  pm_context: 0.30             # 30%
  worker_context: 0.60         # 60%

  # Model tiers (v1.1)
  model_tiers:
    pm: "opus"
    implementation: "sonnet"
    testing: "sonnet"
    security: "opus"
    file_ops: "haiku"
    qc: "opus"

  # QC (v1.1)
  qc:
    enabled: true
    min_reviewers: 1
    tasks_per_reviewer: 3
    no_self_review: true

  # Task sizing (v1.1)
  task_sizing:
    target_context_pct: 0.65   # 65% of agent's context window
    max_context_pct: 0.70      # Split above this

  # Parallelism
  max_parallel_workers: 5      # Per PM

  # Handoffs
  auto_handoff: true           # Auto-create handoffs on PreCompact

  # Beads
  worker_comment_interval: 5   # Comments every N tool calls
  worker_heartbeat_interval: 10
```

---

## Quick Reference

### Orchestrator Does:
- Spawn/replace PMs
- Receive high-level status
- Make architectural decisions
- Create session ledger on exit

### Orchestrator Does NOT:
- Read task details
- Read implementation code
- Track individual worker status
- Make implementation decisions

### PM Does:
- Read task details (bd show)
- Assess task complexity and assign model tiers
- Size tasks to 60-70% context budget
- Dispatch workers in parallel (with correct model tier)
- Spawn QC reviewers after each wave (Opus, never the implementer)
- Track worker and QC status
- Aggregate results, handle rework on QC failures
- Close tasks only after QC passes
- Execute small tasks directly when delegation overhead > task effort
- Create PM handoff

### PM Does NOT:
- Implement large tasks
- Read file contents
- Make architectural decisions (escalate)
- Close tasks before QC review
- Self-review its own work (QC reviewer handles this)

### Workers Do:
- Full implementation work
- Read/write code
- Run tests
- bd comments, bd audit
- Report to PM
