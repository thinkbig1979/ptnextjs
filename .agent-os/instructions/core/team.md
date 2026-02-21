---
version: 1.0.0
last-updated: 2026-02-21
related-files:
  - instructions/core/run.md
  - instructions/core/orchestrate.md
  - instructions/utilities/subagent-delegation-template.md
---

# Team-Based Execution Protocol

> **Purpose**: Structured multi-agent execution using Claude Code's agent teams feature
> **Architecture**: Lead (Opus) -> PM Teammate (Opus) -> Workers (Sonnet/Haiku) + QC Reviewers (Opus)
> **Use When**: Complex work benefiting from persistent teammates, real-time messaging, and independent QC
> **Requires**: Claude Code experimental agent teams (TeamCreate, SendMessage, shared TaskList)

## Overview

```
+-----------------------------------------------------------------+
| LEAD / ORCHESTRATOR (Opus)                                      |
| - Strategy, oversight, user reporting                           |
| - TeamCreate / TeamDelete lifecycle                             |
| - Receives final status from PM                                 |
+----------------------------+------------------------------------+
                             | spawns (teammate)
+----------------------------v------------------------------------+
| PM TEAMMATE (Opus)                                              |
| - Planning, task breakdown, delegation, dynamic scaling         |
| - Spawns/manages workers and QC reviewers                       |
| - Assigns model tiers per task complexity                       |
+----------------------------+------------------------------------+
                             | spawns (teammates)
+----------------------------v------------------------------------+
| WORKER TEAMMATES              | QC REVIEWER TEAMMATES           |
|                               |                                 |
| Worker A (Sonnet)             | QC Reviewer 1 (Opus)            |
|   - Implementation            |   - Validates completed work    |
| Worker B (Sonnet)             | QC Reviewer 2 (Opus)            |
|   - Tests, implementation     |   - Validates completed work    |
| Worker C (Haiku)              |   ... scaled per wave output    |
|   - File ops, simple refactors|                                 |
| ... PM scales as needed       |                                 |
+-----------------------------------------------------------------+
```

## When to Use

| Criteria | 2-Layer (`/run`) | 3-Layer (`/orchestrate`) | Team (`/team`) |
|----------|------------------|--------------------------|----------------|
| Task count | < 10 | 10+ | Any |
| QC review | None built-in | None built-in | Independent QC per wave |
| Communication | Return values | Return values | Real-time messaging |
| Agent lifecycle | Ephemeral | Ephemeral | Persistent teammates |
| Planning | Pre-existing tasks | Pre-existing tasks | Can plan from raw objective |

## Entry Points

```
/team "Build auth module"       -> Plans + executes (full lifecycle)
/team --tasks                   -> Executes existing Beads tasks
/team <SPEC_FOLDER>             -> Executes spec tasks
```

---

## Model Tier Mapping

| Role | Model | Rationale |
|------|-------|-----------|
| Lead / Orchestrator | opus | Strategic decisions, minimal context |
| PM (coordinator) | opus | Delegation judgment, complexity assessment |
| QC Reviewer(s) | opus | Must catch subtle architectural/security issues |
| Implementation | sonnet | Competent, follows specs, cost-effective |
| Test writing | sonnet | Follows patterns, needs some judgment |
| File ops, refactors | haiku | Mechanical, explicit instructions, cheapest |

---

## Phase 0: Pre-Flight (Lead)

```bash
# 0.1: Health checks
git status --short
bd doctor --quiet

# 0.2: Check for session resume
IF exists .agent-os/session-ledger.md:
  READ: session-ledger.md
  DISPLAY:
    "===============================================================
     SESSION LEDGER DETECTED
     ===============================================================

     Task: [from ledger]
     Stopped At: [from ledger]
     Next Action: [from ledger]

     Options:
     1. resume - Continue from checkpoint
     2. new - Start fresh (archives ledger)
     ==============================================================="

  WAIT for choice

  IF resume:
    LOAD handoff context
    SKIP to Phase 2

  IF new:
    ARCHIVE: mv session-ledger.md -> ledgers/LEDGER-{name}-{date}.md

# 0.3: Branch setup
IF spec folder provided:
  BRANCH = spec folder name
ELIF raw objective:
  BRANCH = "work/[slugified-objective]"
ELSE:
  BRANCH = "work/[description]"

git checkout -b ${BRANCH} 2>/dev/null || git checkout ${BRANCH}

# 0.4: Create the team
TEAM_NAME = "aos-team-$(date +%s)"
TeamCreate(name: ${TEAM_NAME})

CONFIRM: "Pre-flight complete. Branch: ${BRANCH}. Team: ${TEAM_NAME}"
```

---

## Phase 1: Planning (Lead -> PM)

**Applies when raw objective is provided. Skip if `--tasks` or `<SPEC_FOLDER>`.**

```
# 1.1: Spawn PM teammate
PM_ID = "aos-pm-${TEAM_NAME}"

Task(subagent_type: "general-purpose",
     model: "opus",
     team_name: ${TEAM_NAME},
     prompt: "
     ${PM_PLANNING_TEMPLATE}
     ")

# 1.2: PM breaks objective into Beads tasks
PM performs:
  - Analyze objective scope and complexity
  - bd create for each task with title, description, deliverables, acceptance criteria
  - bd dep add for task dependencies
  - Size each task to 60-70% of executing agent's context window
  - Assign model tier per task (sonnet/haiku) based on complexity
  - Label tasks with wave assignments

# 1.3: PM reports plan to Lead via SendMessage
PM -> Lead (SendMessage):
  PLAN_STATUS: ready
  TASK_COUNT: ${COUNT}
  WAVE_COUNT: ${COUNT}
  WAVES:
    Wave 1: [TASK_IDS] (model tiers)
    Wave 2: [TASK_IDS] (model tiers)
    ...

# 1.4: Lead displays plan for user confirmation
DISPLAY:
  "EXECUTION PLAN (Team-Based)

   Objective: ${OBJECTIVE}
   Tasks: ${TASK_COUNT}
   Waves: ${WAVE_COUNT}
   Team: ${TEAM_NAME}

   Wave 1: [TASK_IDS] (parallel)
   Wave 2: [TASK_IDS]
   ...

   Model allocation:
   - Sonnet workers: ${SONNET_COUNT}
   - Haiku workers: ${HAIKU_COUNT}
   - QC reviewers: scaled per wave

   [proceed / show-details / abort]"

WAIT for confirmation
```

### When `--tasks` or `<SPEC_FOLDER>` is provided:

```
# Skip planning, go straight to task collection
IF <SPEC_FOLDER> provided:
  READ: .agent-os/specs/${SPEC_FOLDER}/tasks.md
  TASKS = extract task list

ELIF --tasks:
  TASKS = bd ready --json

# Spawn PM for execution coordination only
Task(subagent_type: "general-purpose",
     model: "opus",
     team_name: ${TEAM_NAME},
     prompt: "
     ${PM_EXECUTION_TEMPLATE}
     ")
```

---

## Phase 2: Execution Loop (PM coordinates)

```
FOR each wave:

  # 2.1: PM spawns worker teammates
  FOR task in wave (PARALLEL):
    TIER = task.model_tier   # sonnet or haiku
    WORKER_ID = "aos-worker-${TASK_ID}"

    bd update ${TASK_ID} --status in_progress

    Task(subagent_type: "general-purpose",
         model: ${TIER},
         team_name: ${TEAM_NAME},
         prompt: "
         ${WORKER_DISPATCH_TEMPLATE}
         ")

  # 2.2: Workers execute
  Workers:
    - Claim task from shared TaskList (TaskUpdate with owner)
    - Load role instructions
    - Execute implementation
    - bd comments every 5 tool calls
    - SendMessage to PM on blockers IMMEDIATELY (don't wait for wave end)
    - SendMessage to PM on completion

  # 2.3: PM handles blockers in real-time
  ON blocker message from worker:
    IF PM can resolve:
      SendMessage resolution to worker
    ELIF needs Lead decision:
      SendMessage to Lead with blocker + options
      Lead prompts user if needed
      Lead -> PM -> Worker (resolution chain)

  # 2.4: Wave completion - QC phase
  WHEN all wave workers report complete:

    # Dynamic QC scaling
    completed_count = len(completed_tasks_this_wave)
    IF completed_count <= 2:
      qc_count = 1
    ELIF completed_count <= 5:
      qc_count = 2
    ELSE:
      qc_count = ceil(completed_count / 3)

    # PM spawns QC reviewer teammates
    FOR i in range(qc_count):
      QC_ID = "aos-qc-wave${WAVE}-${i}"
      assigned_tasks = distribute_tasks(completed_tasks, qc_count, i)

      Task(subagent_type: "general-purpose",
           model: "opus",
           team_name: ${TEAM_NAME},
           prompt: "
           ${QC_REVIEWER_TEMPLATE}
           ")

    # QC reviewers validate in parallel (~3 tasks each)
    QC reviewers:
      - Review implementation against acceptance criteria
      - Check code quality, test coverage, patterns
      - Can SendMessage to original implementer for questions
      - Report pass/fail per task to PM

  # 2.5: PM processes QC results
  FOR task in qc_results:
    IF qc_status == "pass":
      bd close ${TASK_ID} --reason="QC passed: [summary]"
    ELIF qc_status == "fail":
      bd comments add ${TASK_ID} "QC FAIL: [issues]"
      # Assign rework to original implementer
      Task(subagent_type: "general-purpose",
           model: ${ORIGINAL_TIER},
           team_name: ${TEAM_NAME},
           prompt: "
           REWORK: ${TASK_ID}
           QC Issues: ${QC_ISSUES}
           Fix the identified issues and report back.
           ${WORKER_DISPATCH_TEMPLATE}
           ")
      # Reworked tasks go through QC again next cycle

  # 2.6: Wave checkpoint
  bd sync
  git add -A && git commit -m "checkpoint: wave ${WAVE_NUMBER} complete"

  # 2.7: PM reports wave status to Lead
  PM -> Lead (SendMessage):
    WAVE_STATUS: complete
    WAVE: ${WAVE_NUMBER}
    COMPLETED: ${PASS_COUNT}
    REWORK: ${FAIL_COUNT}
    REMAINING_WAVES: ${COUNT}

  WAVE_NUMBER++
```

### PM Direct Execution Rule

```
IF task.estimated_effort < 5 minutes AND task.complexity == "trivial":
  PM MAY execute directly instead of spawning a worker
  RATIONALE: Delegation overhead exceeds task effort
  CONSTRAINT: PM-executed work still requires QC by a reviewer
```

---

## Phase 3: Completion (Lead)

```bash
# 3.1: PM reports final status to Lead
PM -> Lead (SendMessage):
  FINAL_STATUS: all_waves_complete
  TASKS_COMPLETED: ${COUNT}
  WAVES_EXECUTED: ${COUNT}
  WORKERS_SPAWNED: ${COUNT}
  QC_REVIEWS: ${COUNT}
  REWORK_CYCLES: ${COUNT}

# 3.2: Lead synthesizes results for user
DISPLAY:
  "EXECUTION COMPLETE (Team-Based)

   Summary:
   - Tasks completed: ${TASK_COUNT}
   - Waves executed: ${WAVE_COUNT}
   - Workers spawned: ${WORKER_COUNT}
   - QC reviews: ${QC_COUNT}
   - Rework cycles: ${REWORK_COUNT}

   Deliverables:
   [high-level list from PM reports]

   Branch: ${BRANCH}

   Next steps:
   1. Review changes: git diff main...HEAD
   2. Create PR: gh pr create"

# 3.3: Cleanup
# Shut down teammates
SendMessage(team: ${TEAM_NAME}, type: "shutdown_request",
            target: "all")

# Final sync
bd sync
git add -A && git commit -m "feat: [description]

Completed:
- [task summaries]

Co-Authored-By: Claude <noreply@anthropic.com>"

# Delete team
TeamDelete(name: ${TEAM_NAME})
```

---

## PreCompact Handling

### Lead PreCompact

```bash
WHEN 'CONTEXT COMPACTION IMMINENT':

1. SendMessage to PM: "PreCompact imminent. Finalize current wave."

2. WAIT for PM handoff message

3. CREATE session ledger:

   # Session Ledger: Team Execution
   Created: ${TIMESTAMP}
   Last Updated: ${NOW}
   Mode: Team-Based
   Team: ${TEAM_NAME}

   ## Progress
   - Completed: ${COMPLETED_TASKS}
   - In Progress: ${IN_PROGRESS_TASKS}
   - Remaining: ${REMAINING_TASKS}
   - Current Wave: ${WAVE_NUMBER}

   ## PM Handoff
   ${PM_HANDOFF_BRIEF}

   ## Resume Instructions
   1. Read this ledger
   2. TeamCreate with same configuration
   3. Spawn PM with handoff context
   4. Continue from wave ${CURRENT_WAVE}

4. SAVE to .agent-os/session-ledger.md

5. COMMIT:
   git add -A
   git commit -m "checkpoint: team handoff at wave ${WAVE}"
   bd sync

6. TeamDelete(name: ${TEAM_NAME})

7. EXIT gracefully
```

### PM PreCompact

```bash
WHEN 'CONTEXT COMPACTION IMMINENT':

1. STOP dispatching new workers
2. SendMessage to active workers: "Finalize current subtask and report."
3. WAIT for worker responses
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
   qc_pending:
     - ${TASK_ID}: awaiting review
   key_decisions:
     - ${decision}
   ---

5. SendMessage handoff to Lead
```

### Worker PreCompact

```bash
WHEN 'CONTEXT COMPACTION IMMINENT':

1. COMPLETE current subtask if quick (< 2 min)
2. SAVE state:
   bd comments add ${TASK_ID} "Stopped at: [exact checkpoint]"
3. SendMessage to PM: checkpoint state + next action
```

---

## QC Rules

1. **No self-review**: QC must be performed by an Opus agent that did NOT implement the task
2. **PM work is also reviewed**: If PM executes a task directly, a QC reviewer validates it
3. **QC reviewers are ephemeral**: Spawned per wave, not persistent (avoids idle cost)
4. **Direct communication**: QC reviewers can SendMessage to implementers for clarification
5. **Workers can pre-consult**: Workers may SendMessage QC reviewers for pre-review questions during implementation

---

## Task Sizing

Each task should consume 60-70% of the executing agent's context window:

| Agent Tier | Target | Max | Rationale |
|------------|--------|-----|-----------|
| Sonnet worker | 65% | 70% | Room for tool results, iteration |
| Haiku worker | 60% | 65% | Smaller window, needs more margin |
| QC reviewer | 50% | 60% | Must hold multiple tasks for comparison |

If a task exceeds target sizing, PM splits it before dispatch.

---

## Haiku Worker Guidelines

Haiku workers receive explicit step-by-step instructions with narrow scope:

```
HAIKU WORKER RULES:
- Task must be fully specified (no ambiguity)
- Instructions are numbered steps, not goals
- Scope limited to: file renames, simple refactors, config edits, boilerplate
- No architectural decisions
- No complex logic implementation
- If confused, SendMessage PM immediately (do not guess)
```

---

## Templates

### PM Planning Template (Lead spawns PM for objective)

```
===============================================================
PM TEAMMATE SESSION - PLANNING
===============================================================

PM_ID: ${PM_ID}
TEAM: ${TEAM_NAME}
LEAD_ID: ${LEAD_ID}

You are a PM teammate. Your job is to break down the objective into
executable Beads tasks, establish dependencies, and prepare for execution.

===============================================================
AGENT STATE PROTOCOL
===============================================================

ON START:
  bd agent state ${PM_ID} working

DURING WORK (every 10 tool calls):
  bd agent heartbeat ${PM_ID}

ON COMPLETE:
  bd agent state ${PM_ID} done

===============================================================
OBJECTIVE
===============================================================

${RAW_OBJECTIVE}

===============================================================
YOUR RESPONSIBILITIES
===============================================================

1. ANALYZE objective scope and complexity
2. READ relevant specs, existing code, patterns:
   - .agent-os/patterns/ for project-specific patterns
   - standards/ for coding and testing standards
3. CREATE Beads tasks:
   - bd create --title="[title]" --description="[desc]"
   - Include deliverables and acceptance criteria in description
4. ESTABLISH dependencies:
   - bd dep add ${CHILD} ${PARENT}
5. SIZE tasks to 60-70% of executing agent's context window
6. ASSIGN model tier per task:
   - sonnet: implementation, tests, moderate complexity
   - haiku: file ops, renames, config edits, boilerplate
7. GROUP into waves based on dependency order
8. REPORT plan to Lead via SendMessage:

   PLAN_STATUS: ready
   TASK_COUNT: ${COUNT}
   WAVE_COUNT: ${COUNT}
   WAVES:
     Wave 1: [TASK_IDS with tiers]
     Wave 2: [TASK_IDS with tiers]
     ...

DO NOT:
- Implement tasks yourself (except trivial < 5 min tasks)
- Make architectural decisions without confirming with Lead
- Skip dependency analysis
```

### PM Execution Template (Lead spawns PM for existing tasks)

```
===============================================================
PM TEAMMATE SESSION - EXECUTION
===============================================================

PM_ID: ${PM_ID}
TEAM: ${TEAM_NAME}
LEAD_ID: ${LEAD_ID}

You are a PM teammate. Your job is to COORDINATE workers and QC reviewers,
not implement tasks yourself.

===============================================================
AGENT STATE PROTOCOL
===============================================================

ON START:
  bd agent state ${PM_ID} working

DURING WORK (every 10 tool calls):
  bd agent heartbeat ${PM_ID}

ON COMPLETE:
  bd agent state ${PM_ID} done

ON PRECOMPACT:
  bd agent state ${PM_ID} stopped

===============================================================
TASK ASSIGNMENT
===============================================================

TASKS: ${TASK_IDS}
WAVES: ${WAVE_DEFINITIONS}

${IF_HANDOFF_EXISTS}
CONTINUING FROM PREVIOUS PM:
${PM_HANDOFF_CONTEXT}
${ENDIF}

===============================================================
YOUR RESPONSIBILITIES
===============================================================

1. READ task details: bd show ${TASK_ID} for each task
2. ASSIGN model tiers based on task complexity:
   - sonnet: implementation, tests
   - haiku: file ops, renames, config, boilerplate
3. DISPATCH workers IN PARALLEL for independent tasks
   Use Task() with model and team_name parameters
4. MONITOR worker messages for blockers (real-time)
5. SPAWN QC reviewers after each wave completes:
   completed_count = len(completed_tasks_this_wave)
   IF completed_count <= 2: spawn 1 QC reviewer
   ELIF completed_count <= 5: spawn 2 QC reviewers
   ELSE: spawn ceil(completed_count / 3) QC reviewers
6. PROCESS QC results: close passing tasks, assign rework for failures
7. CHECKPOINT: bd sync + git commit after each wave
8. REPORT wave status to Lead via SendMessage
9. REPORT final status to Lead when all waves complete

DO NOT:
- Implement tasks yourself (except trivial < 5 min tasks)
- Accumulate implementation code in your context
- Make architectural decisions (escalate to Lead)
- Skip QC phase for any wave
- Allow self-review (implementer != reviewer)
```

### Worker Dispatch Template (PM spawns workers)

```
===============================================================
WORKER TEAMMATE SESSION - ${TASK_ID}
===============================================================

WORKER_ID: ${WORKER_ID}
TEAM: ${TEAM_NAME}
PM_ID: ${PM_ID}
ROLE: ${ROLE}

===============================================================
AGENT STATE PROTOCOL
===============================================================

ON START:
  bd agent state ${WORKER_ID} working
  bd comments add ${TASK_ID} "Worker starting: ${ROLE}"

DURING WORK (every 5 tool calls):
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

===============================================================
MANDATORY INSTRUCTION LOADING
===============================================================

BEFORE work:
1. READ: bd show ${TASK_ID}
2. READ: @.agent-os/instructions/agents/${ROLE}.md
3. CHECK: .agent-os/patterns/ for project-specific patterns
4. CONFIRM: "Instructions loaded for ${ROLE}"

===============================================================
COMMUNICATION
===============================================================

- SendMessage to PM on completion with status report
- SendMessage to PM IMMEDIATELY on blockers (do not wait)
- SendMessage to QC reviewers for pre-review questions (optional)
- Respond to SendMessage from QC reviewers promptly

===============================================================
TASK ASSIGNMENT
===============================================================

TASK_ID: ${TASK_ID}
TITLE: ${TASK_TITLE}

DELIVERABLES:
${DELIVERABLES}

ACCEPTANCE CRITERIA:
${ACCEPTANCE_CRITERIA}

===============================================================
STATUS REPORT FORMAT (SendMessage to PM)
===============================================================

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

### QC Reviewer Dispatch Template (PM spawns reviewers)

```
===============================================================
QC REVIEWER TEAMMATE SESSION - WAVE ${WAVE_NUMBER}
===============================================================

QC_ID: ${QC_ID}
TEAM: ${TEAM_NAME}
PM_ID: ${PM_ID}

You are a QC reviewer. Your job is to validate completed work against
acceptance criteria and code quality standards.

===============================================================
AGENT STATE PROTOCOL
===============================================================

ON START:
  bd agent state ${QC_ID} working

ON COMPLETE:
  bd agent state ${QC_ID} done

===============================================================
ASSIGNED TASKS FOR REVIEW
===============================================================

${FOR each assigned_task}
TASK_ID: ${TASK_ID}
TITLE: ${TASK_TITLE}
IMPLEMENTER: ${WORKER_ID}
${ENDFOR}

===============================================================
REVIEW PROTOCOL
===============================================================

FOR each assigned task:

1. READ: bd show ${TASK_ID} (acceptance criteria, deliverables)
2. READ: All files listed in worker's FILES_MODIFIED
3. VERIFY:
   - All deliverables exist
   - Acceptance criteria met
   - Tests exist and pass
   - Code follows project patterns (.agent-os/patterns/)
   - No security issues (OWASP basics)
   - No leftover debug code, TODOs, or .only()
4. If UNCLEAR, SendMessage to implementer (${WORKER_ID}) for clarification
5. REPORT to PM via SendMessage

===============================================================
QC REPORT FORMAT (SendMessage to PM)
===============================================================

---
QC_STATUS: [pass | fail]
QC_ID: ${QC_ID}
TASK_ID: ${TASK_ID}

VERDICT: [pass | fail]

${IF pass}
SUMMARY: [1-2 sentence confirmation]
${ENDIF}

${IF fail}
ISSUES:
- [issue 1: description + file:line]
- [issue 2: description + file:line]

SEVERITY: [minor | major | critical]
RECOMMENDATION: [specific fix guidance]
${ENDIF}
---

===============================================================
RULES
===============================================================

- You must NOT have implemented any task you are reviewing
- Review against acceptance criteria, not personal preference
- Flag security concerns as critical regardless of other quality
- Be specific: cite file:line for every issue
- Approve work that meets criteria even if you would do it differently
```

---

## Beads Integration Summary

| Tier | Commands Used |
|------|---------------|
| Lead | `bd agent state`, `bd ready`, `bd sync`, TeamCreate, TeamDelete |
| PM | `bd agent state`, `bd show`, `bd create`, `bd dep add`, `bd comments`, `bd close`, SendMessage |
| Workers | `bd agent state`, `bd comments`, `bd audit`, `bd agent heartbeat`, SendMessage |
| QC Reviewers | `bd agent state`, `bd show`, SendMessage |

---

## Configuration

```yaml
team:
  enabled: true
  mode: "team-based"

  model_tiers:
    lead: "opus"
    pm: "opus"
    qc: "opus"
    implementation: "sonnet"
    testing: "sonnet"
    file_ops: "haiku"

  qc:
    min_reviewers: 1
    tasks_per_reviewer: 3
    no_self_review: true

  task_sizing:
    target_context_pct: 0.65
    max_context_pct: 0.70

  max_parallel_workers: 5
  worker_comment_interval: 5
```

---

## Quick Reference

### Lead Does:
- TeamCreate / TeamDelete lifecycle
- Spawn PM teammate
- Display plans, collect user confirmation
- Receive final status from PM
- Create session ledger on PreCompact
- Report results to user

### Lead Does NOT:
- Read task details or implementation code
- Spawn workers directly
- Make implementation decisions
- Track individual worker status

### PM Does:
- Break objectives into Beads tasks (planning mode)
- Read task details (bd show)
- Assign model tiers per task
- Spawn workers and QC reviewers as teammates
- Handle blocker escalations in real-time
- Process QC results, assign rework
- Execute trivial tasks directly (< 5 min)
- Checkpoint after each wave

### PM Does NOT:
- Implement non-trivial tasks
- Make architectural decisions (escalate to Lead)
- Skip QC for any completed work
- Review its own work

### Workers Do:
- Full implementation or testing work
- Load role instructions before work
- bd comments every 5 tool calls
- SendMessage to PM on blockers immediately
- SendMessage to PM on completion
- Respond to QC reviewer questions

### QC Reviewers Do:
- Validate deliverables against acceptance criteria
- Check code quality, tests, patterns, security
- SendMessage to implementers for clarification
- Report pass/fail with specific file:line citations

### QC Reviewers Do NOT:
- Review work they implemented
- Implement fixes (only report issues)
- Make architectural decisions

### Role Mapping

| Task Type | Model Tier | Role |
|-----------|------------|------|
| Implementation | sonnet | implementation-specialist |
| Tests (unit) | sonnet | test-architect |
| Tests (e2e) | sonnet | test-architect |
| Frontend | sonnet | frontend-specialist |
| File ops, renames | haiku | general-purpose |
| Config edits | haiku | general-purpose |
| Security review | opus (QC) | security-sentinel |
| QC validation | opus | qc-reviewer |

---

## See Also

- `/run` - 2-layer protocol for simple work
- `/orchestrate` - 3-layer protocol for complex work without teams
- `beads-integration-guide.md` - Full Beads reference
- `subagent-delegation-template.md` - Delegation patterns
