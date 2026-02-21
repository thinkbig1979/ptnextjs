---
version: 2.1.0
last-updated: 2026-02-21
related-files:
  - instructions/core/orchestrate.md
  - instructions/core/team.md
  - instructions/utilities/beads-integration-guide.md
  - instructions/utilities/subagent-delegation-template.md
---

# 2-Layer Execution Protocol

> **Purpose**: Simple, efficient task execution for straightforward work
> **Architecture**: Orchestrator → Workers (parallel)
> **Use When**: < 10 tasks, single session likely sufficient
> **For Complex Work**: Use `/orchestrate` (3-layer) instead

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│ ORCHESTRATOR                                                │
│ - Analyzes tasks, groups into waves                         │
│ - Spawns workers directly (parallel within wave)            │
│ - Collects results, handles failures                        │
│ - PreCompact → workers finalize, create session ledger      │
└────────────────────────┬────────────────────────────────────┘
                         │ spawns (parallel)
┌────────────────────────▼────────────────────────────────────┐
│ WORKERS (specialized)                                       │
│ - implementation-specialist, test-architect, etc.           │
│ - Execute single task each                                  │
│ - bd comments every 5-10 calls                              │
│ - Report status back to orchestrator                        │
└─────────────────────────────────────────────────────────────┘
```

## When to Use

| Criteria | 2-Layer (`/run`) | 3-Layer (`/orchestrate`) | Team (`/team`) |
|----------|------------------|--------------------------|----------------|
| Task count | < 10 | 10+ | Any (can plan from scratch) |
| Complexity | Simple/medium | Complex | Complex + planning |
| Sessions | Single | Multi-session expected | Multi-session expected |
| Parallelism | Parallel workers | PM coordinates workers | PM + inter-agent comms |
| Model tiers | Yes (v2.1) | Yes (v1.1) | Yes (built-in) |
| QC review | Yes (v2.1) | Yes (v1.1) | Yes (dynamic scaling) |

---

## Phase 0: Pre-Flight

```bash
# Quick health check
git status --short
bd doctor --quiet

# Check for session resume
IF exists .agent-os/session-ledger.md:
  READ: session-ledger.md
  DISPLAY:
    "═══════════════════════════════════════════════════════════
     SESSION LEDGER DETECTED
     ═══════════════════════════════════════════════════════════

     Task: [from ledger]
     Stopped At: [from ledger]
     Next Action: [from ledger]

     Options:
     1. resume - Continue from checkpoint
     2. new - Start fresh (archives ledger)
     ═══════════════════════════════════════════════════════════"

  WAIT for choice

  IF resume:
    LOAD handoff context
    SKIP to Phase 2

  IF new:
    ARCHIVE: mv session-ledger.md → ledgers/LEDGER-{name}-{date}.md

# Branch setup
IF spec folder provided:
  BRANCH = spec folder name
ELSE:
  BRANCH = "work/[description]"

git checkout -b ${BRANCH} 2>/dev/null || git checkout ${BRANCH}

CONFIRM: "Pre-flight complete. Branch: ${BRANCH}"
```

---

## Phase 1: Task Collection

```bash
# 1.1: Identify task source
IF <SPEC_FOLDER> provided:
  READ: .agent-os/specs/${SPEC_FOLDER}/tasks.md
  TASKS = extract task list

ELIF --tasks "T1, T2, ...":
  TASKS = parse inline tasks

ELSE:
  TASKS = bd ready --json

# 1.2: Check task count - recommend 3-layer if too many
IF len(TASKS) > 10:
  DISPLAY:
    "⚠️  ${len(TASKS)} tasks detected.
     Consider using /orchestrate (3-layer) for better context management.

     Options:
     1. continue - Proceed with 2-layer
     2. switch - Use /orchestrate instead"

  WAIT for choice

# 1.3: Group into waves
WAVES = group_by_dependencies(TASKS)

# 1.4: Check gates (if enabled)
IF config.gates.enabled:
  FOR task in TASKS:
    GATES = bd gate blocked --task=${task} --json
    IF GATES not empty:
      HANDLE gate (see beads-integration-guide.md)

# 1.5: Display plan
DISPLAY:
  "📋 EXECUTION PLAN (2-Layer)

   Tasks: ${TASK_COUNT}
   Waves: ${WAVE_COUNT}

   Wave 1: [TASK_IDS] (parallel)
   Wave 2: [TASK_IDS]
   ...

   [proceed / show-details / abort]"

WAIT for confirmation
```

---

## Phase 2: Worker Dispatch Loop

```
FOR each wave:

  # 2.1: Claim tasks and set agent states
  FOR task in wave:
    bd update ${task} --status in_progress
    WORKER_ID="aos-worker-${task}"
    bd agent state ${WORKER_ID} spawning

  # 2.2: Determine model tier per task
  FOR task in wave:
    ROLE = determine_role(task)  # implementation-specialist, test-architect, etc.
    MODEL_TIER = determine_model_tier(ROLE)
    # See: instructions/utilities/subagent-delegation-template.md (Model-Tier Selection)
    # implementation-specialist, test-architect → "sonnet"
    # file ops, refactors → "haiku"
    # security-sentinel, architectural decisions → "opus"

  # 2.3: Dispatch workers IN PARALLEL
  FOR task in wave (PARALLEL):
    WORKER_ID="aos-worker-${task}"

    Task(subagent_type: "general-purpose", model: "${MODEL_TIER}", prompt: "
    ${WORKER_DISPATCH_TEMPLATE}
    ")

  # 2.4: Collect worker responses
  FOR response in worker_responses:
    PARSE: status, task_id, completed, remaining, blockers

    IF status == "completed":
      bd agent state ${WORKER_ID} done
      ADD to completed_this_wave

    ELIF status == "stopped":
      bd agent state ${WORKER_ID} stopped
      SAVE checkpoint
      ADD to continuation_queue

    ELIF status == "blocked":
      bd agent state ${WORKER_ID} stuck
      DISPLAY blocker
      PROMPT user for resolution

  # 2.5: Post-Wave QC Review
  IF len(completed_this_wave) > 0:
    # Determine QC reviewer count based on wave output
    completed_count = len(completed_this_wave)
    IF completed_count <= 2:
      qc_count = 1
    ELIF completed_count <= 5:
      qc_count = 2
    ELSE:
      qc_count = ceil(completed_count / 3)

    # Distribute tasks across QC reviewers
    qc_batches = split(completed_this_wave, qc_count)  # ~3 tasks per reviewer

    # Spawn QC reviewers IN PARALLEL (always Opus, never the implementer)
    FOR batch in qc_batches (PARALLEL):
      QC_ID="aos-qc-wave${WAVE_NUMBER}-${batch_index}"
      Task(subagent_type: "general-purpose", model: "opus", prompt: "
      ${QC_REVIEWER_TEMPLATE}
      ")

    # Process QC results
    FOR qc_response in qc_responses:
      FOR task in qc_response.tasks:
        IF task.qc_status == "pass":
          bd close ${task.id} --reason="QC passed: ${task.summary}"
        ELIF task.qc_status == "fail":
          DISPLAY: "QC failed for ${task.id}: ${task.issues}"
          # Re-assign to original worker for rework
          ADD to rework_queue

    # Handle rework if any
    IF rework_queue not empty:
      FOR task in rework_queue:
        SPAWN worker with rework instructions (same model tier as original)

  # 2.6: Handle continuations
  IF continuation_queue not empty:
    FOR checkpoint in continuation_queue:
      SPAWN worker with checkpoint context

  # 2.7: Wave checkpoint
  bd sync
  git add -A && git commit -m "checkpoint: wave ${WAVE_NUMBER} complete"

  # 2.8: Next wave
  WAVE_NUMBER++
```

### Worker Dispatch Template

```
═══════════════════════════════════════════════════════════
WORKER SESSION - ${TASK_ID}
═══════════════════════════════════════════════════════════

WORKER_ID: ${WORKER_ID}
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
MANDATORY INSTRUCTION LOADING
═══════════════════════════════════════════════════════════

BEFORE work:
1. READ: bd show ${TASK_ID}
2. READ: @.agent-os/instructions/agents/${ROLE}.md
3. CHECK: .agent-os/patterns/ for project-specific patterns
4. CONFIRM: "Instructions loaded for ${ROLE}"

═══════════════════════════════════════════════════════════
TASK ASSIGNMENT
═══════════════════════════════════════════════════════════

TASK_ID: ${TASK_ID}
TITLE: ${TASK_TITLE}

DELIVERABLES:
${DELIVERABLES}

ACCEPTANCE CRITERIA:
${ACCEPTANCE_CRITERIA}

═══════════════════════════════════════════════════════════
PRECOMPACT PROTOCOL
═══════════════════════════════════════════════════════════

WHEN you see 'CONTEXT COMPACTION IMMINENT':

1. COMPLETE current subtask if quick (< 2 min)
2. SAVE state:
   bd comments add ${TASK_ID} "Stopped at: [exact checkpoint]"
   bd agent state ${WORKER_ID} stopped
3. REPORT to orchestrator immediately

═══════════════════════════════════════════════════════════
STATUS REPORT FORMAT (MANDATORY)
═══════════════════════════════════════════════════════════

---
STATUS: [completed | stopped | blocked]
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

### QC Reviewer Template

```
═══════════════════════════════════════════════════════════
QC REVIEW SESSION - WAVE ${WAVE_NUMBER}
═══════════════════════════════════════════════════════════

QC_ID: ${QC_ID}
MODEL: opus (always)

You are a QC reviewer. Your job is to VALIDATE completed work,
not implement or fix anything yourself.

RULE: You must NOT have implemented any of the tasks you are reviewing.
All reviews must be by a separate agent from the implementer.

═══════════════════════════════════════════════════════════
TASKS TO REVIEW
═══════════════════════════════════════════════════════════

${FOR each task in batch}
TASK_ID: ${TASK_ID}
TITLE: ${TASK_TITLE}
IMPLEMENTER: ${WORKER_ID}
FILES_MODIFIED: ${FILES_LIST}
${ENDFOR}

═══════════════════════════════════════════════════════════
REVIEW CHECKLIST (per task)
═══════════════════════════════════════════════════════════

FOR each task:
1. READ the task requirements: bd show ${TASK_ID}
2. READ all modified files listed above
3. VERIFY:
   - [ ] Deliverables exist and match acceptance criteria
   - [ ] Code compiles (no syntax errors)
   - [ ] Tests pass (if applicable)
   - [ ] No security vulnerabilities (OWASP Top 10)
   - [ ] No hardcoded secrets or credentials
   - [ ] Consistent with existing patterns in codebase
   - [ ] No unnecessary changes beyond task scope
4. RECORD: bd comments add ${TASK_ID} "QC: [pass/fail] - [summary]"

═══════════════════════════════════════════════════════════
REPORT FORMAT
═══════════════════════════════════════════════════════════

---
QC_STATUS: [all_pass | has_failures]
QC_ID: ${QC_ID}
WAVE: ${WAVE_NUMBER}

REVIEWS:
${FOR each task}
- TASK_ID: ${TASK_ID}
  STATUS: [pass | fail]
  ${IF fail}
  ISSUES:
  - [specific issue with file:line reference]
  REWORK_NEEDED:
  - [what needs to change]
  ${ENDIF}
${ENDFOR}
---
```

---

## Phase 3: Post-Execution

```bash
# 3.1: Verify deliverables
FOR task in completed_tasks:
  VERIFY: deliverables exist
  VERIFY: tests pass (if applicable)

IF verification_failures:
  DISPLAY failures
  PROMPT: "Fix issues? [yes/no]"

# 3.2: TypeScript check (if applicable)
IF exists tsconfig.json:
  RUN: pnpm tsc --noEmit
  IF errors:
    DISPLAY errors
    PROMPT: "Fix? [yes/no]"

# 3.3: Run tests
RUN: pnpm test (or equivalent)

IF test_failures:
  DISPLAY failures
  PROMPT: "Investigate? [yes/no]"

# 3.4: Final commit
git add -A
git commit -m "feat: [description]

Completed:
- [task summaries]

Co-Authored-By: Claude <noreply@anthropic.com>"

bd sync
```

---

## Phase 4: Completion

```bash
# Check for remaining work
REMAINING = bd ready --json

IF len(REMAINING) > 0:
  # More work exists - create session ledger
  CREATE session-ledger.md (see below)

  DISPLAY:
    "📋 SESSION COMPLETE (more work remains)

     ✅ Completed: ${COMPLETED_COUNT} tasks
     📝 Remaining: ${len(REMAINING)} tasks

     Session ledger: .agent-os/session-ledger.md

     To continue: Start new session, will auto-detect ledger"

ELSE:
  # All done
  DISPLAY:
    "✅ EXECUTION COMPLETE

     📊 Summary:
     - Tasks: ${TASK_COUNT}
     - Waves: ${WAVE_COUNT}
     - Files modified: ${FILE_COUNT}

     🔗 Branch: ${BRANCH}

     Next:
     1. git diff main...HEAD
     2. gh pr create"
```

---

## Orchestrator PreCompact

```bash
WHEN 'CONTEXT COMPACTION IMMINENT':

1. STOP dispatching new workers

2. TELL active workers to finalize:
   (Workers will see their own PreCompact hooks)

3. WAIT for worker responses

4. CREATE session ledger:

   # Session Ledger
   Created: ${TIMESTAMP}
   Last Updated: ${NOW}
   Mode: 2-Layer

   ## Progress
   - Completed: ${COMPLETED_TASKS}
   - In Progress: ${IN_PROGRESS_TASKS}
   - Remaining: ${REMAINING_TASKS}

   ## Worker Checkpoints
   ${FOR each stopped worker}
   - ${TASK_ID}:
       stopped_at: ${checkpoint}
       next_action: ${next}
   ${ENDFOR}

   ## Resume Instructions
   1. Read this ledger
   2. Continue from worker checkpoints
   3. Then proceed to remaining tasks

5. COMMIT:
   git add -A
   git commit -m "checkpoint: session handoff"
   bd sync

6. EXIT gracefully
```

---

## Configuration

```yaml
run:
  enabled: true
  mode: "2-layer"

  # Recommend 3-layer threshold
  recommend_orchestrate_threshold: 10

  # Model tiers (v2.1)
  model_tiers:
    implementation: "sonnet"
    testing: "sonnet"
    security: "opus"
    file_ops: "haiku"
    qc: "opus"

  # QC (v2.1)
  qc:
    enabled: true
    min_reviewers: 1
    tasks_per_reviewer: 3
    no_self_review: true

  # Parallelism
  max_parallel_workers: 5

  # Beads
  worker_comment_interval: 5
  worker_heartbeat_interval: 10

gates:
  enabled: true
  require_ci_gate: false          # CI gates OFF by default
  auto_resolve_github: true
  auto_resolve_bead: true
  security_gate_on_sensitive: true
  poll_interval: 30
```

---

## Quick Reference

### Orchestrator Does:
- Analyze tasks, group into waves
- Spawn workers in parallel
- Collect results
- Handle blockers
- Create session ledger on PreCompact

### Workers Do:
- Full implementation work
- Read/write code
- Run tests
- bd comments every 5-10 calls
- bd audit for decisions
- Report status to orchestrator

### Role-to-Model Mapping

| Task Type | Role | Model Tier |
|-----------|------|------------|
| Implementation | implementation-specialist | sonnet |
| Tests (unit) | test-architect | sonnet |
| Tests (e2e) | test-architect | sonnet |
| Frontend | frontend-specialist | sonnet |
| Security review | security-sentinel | opus |
| File ops/refactors | (direct) | haiku |
| QC review | qc-reviewer | opus |

---

## See Also

- `/orchestrate` - 3-layer protocol for complex work (subagent-based)
- `/team` - Team-based protocol with inter-agent messaging and dynamic QC
- `/pick-orchestration` - Decision helper to choose the right execution mode
- `beads-integration-guide.md` - Full Beads reference
- `subagent-delegation-template.md` - Delegation patterns and model-tier mapping
