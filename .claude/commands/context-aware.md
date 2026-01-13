---
description: Enable context-aware execution with automatic checkpointing and clean handoffs
globs:
alwaysApply: false
version: 4.0
encoding: UTF-8
---

# Context-Aware Autonomous Execution

> **Version 4.0**: Unified session ledger for seamless cross-session handoffs
> **Goal**: Complete ALL tasks from a spec with minimal human intervention

## Overview

This command implements a **3-tier execution model** that survives context limits:

```
SUPERVISOR (You - Ultra-minimal context)
│
├── Spawns PROJECT MANAGER subagent
│   ├── PM uses /execute-tasks protocol
│   ├── PM spawns SPECIALIST subagents for implementation
│   ├── PM monitors own context (~85% triggers session ledger handoff)
│   └── PM saves state to unified session ledger
│
├── Monitors PM status (periodic check)
│
├── On PM handoff → Spawns NEW PM with continuation context from session ledger
│
└── Repeats until ALL tasks complete
```

**Why this works:**
- Supervisor uses <5% context (only spawns/monitors)
- PM uses full /execute-tasks protocol with specialists
- **Session ledger** (`.agent-os/session-ledger.md`) persists ALL state
- **Auto-resume**: Next session auto-detects ledger and offers to resume
- Automatic continuation without user intervention

---

## Usage

```bash
/context-aware                     # Start from ready Beads tasks
/context-aware <SPEC_FOLDER>       # Execute all tasks for a spec
```

**Note**: `--resume` flag is no longer needed. Session start auto-detects `.agent-os/session-ledger.md` and offers to resume.

---

## STEP 0: Supervisor Initialization

### 0.1: Validate Prerequisites

```bash
# Check Beads is initialized
bd doctor || (echo "ERROR: Beads not initialized" && exit 1)

# Check for open tasks
OPEN_TASKS=$(bd list --status=open --json | jq length)
READY_TASKS=$(bd ready --json | jq length)

echo "Open tasks: ${OPEN_TASKS}"
echo "Ready tasks: ${READY_TASKS}"
```

### 0.2: Check for Session Ledger

```bash
IF .agent-os/session-ledger.md exists:
  READ: .agent-os/session-ledger.md
  PARSE: Handoff Context section

  DISPLAY:
    "═══════════════════════════════════════════════════════════
     SESSION LEDGER DETECTED
     ═══════════════════════════════════════════════════════════

     Task: ${Task_Context}
     Last Updated: ${Last_Updated}
     Stopped At: ${Stopped_At}
     Next Action: ${Next_Action}

     Options:
     1. resume - Continue from where you left off
     2. new - Start fresh (archives current ledger)
     3. view - Show full ledger details
     ═══════════════════════════════════════════════════════════"

  WAIT for user choice

  IF resume:
    LOAD: PM_Session, Completed_Tasks, Current_Task, Remaining_Tasks, Last_Commit
    SKIP to Step 1 (Spawn PM with continuation)

  IF new:
    ARCHIVE: mv .agent-os/session-ledger.md .agent-os/ledgers/LEDGER-${name}-$(date +%Y%m%d).md
    PROCEED with fresh start

ELSE:
  DISPLAY: "No session ledger found, starting fresh"
```

### 0.3: Confirm Execution Scope

```bash
IF <SPEC_FOLDER> provided:
  READ: ${SPEC_FOLDER}/tasks.md
  DISPLAY task summary

DISPLAY:
  "═══════════════════════════════════════════════════════════
   AUTONOMOUS EXECUTION MODE
   ═══════════════════════════════════════════════════════════
   
   Ready tasks: ${READY_TASKS}
   Total open: ${OPEN_TASKS}
   
   This will run until ALL tasks complete.
   Intervention only required for blockers.
   
   Options:
   1. proceed - Start autonomous execution
   2. list - Show task details
   3. abort - Cancel
   ═══════════════════════════════════════════════════════════"

WAIT for confirmation
```

---

## STEP 1: Spawn Project Manager

### 1.1: Create PM Tracking Task

```bash
# Create supervisor tracking task (if not resuming)
IF NOT resuming:
  bd create --title="SUPERVISOR: Autonomous execution session" --type=task
  CAPTURE: SUPERVISOR_TASK_ID
  
  bd note ${SUPERVISOR_TASK_ID} "
  SESSION START: $(date -Iseconds)
  SCOPE: ${SPEC_FOLDER:-all ready tasks}
  READY_TASKS: ${READY_TASKS}
  "
```

### 1.2: Dispatch Project Manager

```javascript
Task(
  subagent_type: "general-purpose",
  prompt: `
═══════════════════════════════════════════════════════════════════
PROJECT MANAGER AGENT - AUTONOMOUS EXECUTION
═══════════════════════════════════════════════════════════════════

You are a PROJECT MANAGER responsible for executing tasks using the
Agent OS /execute-tasks protocol. You operate autonomously until:
1. ALL tasks are complete, OR
2. You reach ~85% context capacity

CRITICAL PROTOCOL: Read and follow /execute-tasks workflow exactly.

═══════════════════════════════════════════════════════════════════
MANDATORY FIRST ACTIONS
═══════════════════════════════════════════════════════════════════

1. READ: @.agent-os/instructions/core/execute-tasks.md
   - This is your primary workflow. Follow it exactly.

2. CHECK Beads state:
   bd ready              # Tasks you can work on
   bd list --status=in_progress  # Resume any active work

3. IF resuming from handoff:
   - Read: .agent-os/session-ledger.md
   - Continue from STOPPED_AT point
   - Do NOT restart completed work

4. CONFIRM: "PM initialized. Ready tasks: [N]. Starting execution."

═══════════════════════════════════════════════════════════════════
CONTEXT MONITORING (CRITICAL)
═══════════════════════════════════════════════════════════════════

You MUST monitor your context usage and prepare handoff at ~85%.

AFTER EVERY WAVE or every ~20 tool calls:
  - Estimate your context usage
  - If approaching 85%: STOP and execute handoff protocol

DO NOT wait until you're out of context. Save state EARLY.

═══════════════════════════════════════════════════════════════════
HANDOFF PROTOCOL (when approaching 85% context)
═══════════════════════════════════════════════════════════════════

1. STOP current work at a clean point (between tasks, not mid-task)

2. ENSURE BEADS TRACKING:
   IF current work NOT tracked in Beads:
     FOR each remaining work item:
       bd create --title="[descriptive title]" --type=task
     CONFIRM: "Created Beads tasks for remaining work"

3. SAVE state to Beads:
   bd note ${CURRENT_TASK_ID} "
   PM CHECKPOINT: $(date -Iseconds)
   STOPPED_AT: [exact point - task/step/file]
   NEXT_ACTION: [what next PM should do first]
   "

4. WRITE session ledger:
   Save to .agent-os/session-ledger.md:

   # Session Ledger: [session_name]
   Created: [original timestamp]
   Last Updated: [current timestamp]
   Task Context: [main task ID]

   ## Handoff Context
   - **PM Session**: [N]
   - **Completed Tasks**: [beads-xxx, beads-yyy]
   - **Current Task**: [beads-zzz]
   - **Stopped At**: [exact point - file:line or step]
   - **Next Action**: [what to do first]
   - **Remaining Tasks**: [beads-aaa, beads-bbb]
   - **Last Commit**: [commit sha]

   ## Goal
   [success criteria from spec]

   ## State
   - **DONE**: [completed items]
   - **NOW**: [current focus]
   - **NEXT**: [upcoming items]

   ## Working Set
   - **Files**: [modified files]
   - **Branch**: [current branch]
   - **Commands**: [key commands]

   ## Session Notes
   [context notes, key decisions]

5. COMMIT all work:
   git add -A
   git commit -m "checkpoint: session ledger at [task/step]"

6. SYNC Beads:
   bd sync

7. RETURN this exact format:
   ---
   PM_STATUS: handoff_required
   PM_SESSION: [N]
   COMPLETED_TASKS: [list]
   REMAINING_TASKS: [list]
   STOPPED_AT: [exact point]
   NEXT_ACTION: [what next PM does first]
   LAST_COMMIT: [sha]
   SESSION_LEDGER: .agent-os/session-ledger.md
   ---

═══════════════════════════════════════════════════════════════════
SUCCESS PROTOCOL (when ALL tasks complete)
═══════════════════════════════════════════════════════════════════

When you have completed ALL tasks:

1. RUN final verification:
   - All tests pass
   - All deliverables verified
   - bd list --status=open shows 0 (or only blocked items)

2. CLOSE supervisor task:
   bd close ${SUPERVISOR_TASK_ID} --reason="All tasks completed successfully"

3. ARCHIVE session ledger (if exists):
   IF .agent-os/session-ledger.md exists:
     mv .agent-os/session-ledger.md .agent-os/ledgers/LEDGER-${name}-$(date +%Y%m%d)-complete.md

4. COMMIT:
   git add -A
   git commit -m "feat: [description] - all tasks complete"

5. SYNC:
   bd sync

6. RETURN this exact format:
   ---
   PM_STATUS: all_complete
   COMPLETED_TASKS: [full list]
   FINAL_COMMIT: [sha]
   SUMMARY: [brief summary of what was built]
   ---

═══════════════════════════════════════════════════════════════════
BLOCKER PROTOCOL (when stuck)
═══════════════════════════════════════════════════════════════════

If you encounter a blocker you cannot resolve:

1. DOCUMENT the blocker:
   bd note ${TASK_ID} "BLOCKED: [detailed description]"

2. DO NOT keep trying the same thing

3. RETURN this exact format:
   ---
   PM_STATUS: blocked
   BLOCKED_TASK: [beads ID]
   BLOCKER: [detailed description]
   ATTEMPTED: [what you tried]
   NEEDS: [what you need to continue]
   ---

The supervisor will prompt the user and provide guidance.

═══════════════════════════════════════════════════════════════════
EXECUTION PARAMETERS
═══════════════════════════════════════════════════════════════════

SCOPE: ${SPEC_FOLDER:-"all ready tasks"}
SUPERVISOR_TASK: ${SUPERVISOR_TASK_ID}
PM_SESSION: ${PM_SESSION_NUMBER:-1}
RESUMING_FROM: ${RESUME_POINT:-"fresh start"}

═══════════════════════════════════════════════════════════════════
BEGIN EXECUTION
═══════════════════════════════════════════════════════════════════

Start now. Follow /execute-tasks protocol. Work autonomously.
Report back only when: complete, handoff needed, or blocked.
`,
  description: "PM Session ${PM_SESSION_NUMBER}: Execute tasks autonomously"
)
```

---

## STEP 2: Monitor PM Status

### 2.1: Wait for PM Response

```
# PM runs autonomously
# Supervisor waits for PM to return with status

RECEIVE: PM response
PARSE: PM_STATUS field
```

### 2.2: Handle PM Response

```
SWITCH PM_STATUS:

  CASE "all_complete":
    → Go to Step 4 (Success)

  CASE "handoff_required":
    → Go to Step 3 (Spawn New PM)

  CASE "blocked":
    → Go to Step 2.3 (Handle Blocker)

  DEFAULT:
    → Log warning, check Beads state, decide action
```

### 2.3: Handle Blocker

```
DISPLAY:
  "═══════════════════════════════════════════════════════════
   ⚠️  PM REPORTED BLOCKER
   ═══════════════════════════════════════════════════════════
   
   Task: ${BLOCKED_TASK}
   Blocker: ${BLOCKER}
   Attempted: ${ATTEMPTED}
   Needs: ${NEEDS}
   
   Options:
   1. provide [guidance] - Give PM specific guidance
   2. skip - Skip this task, continue with others
   3. abort - Stop execution
   ═══════════════════════════════════════════════════════════"

WAIT for user input

IF provide:
  CAPTURE: user_guidance
  UPDATE: Resume point with guidance
  → Go to Step 3 (Spawn New PM with guidance)

IF skip:
  bd update ${BLOCKED_TASK} --status=blocked
  bd note ${BLOCKED_TASK} "Skipped by user"
  → Go to Step 3 (Spawn New PM)

IF abort:
  → Go to Step 5 (Abort)
```

---

## STEP 3: Spawn New PM (Continuation)

### 3.1: Prepare Continuation Context

```bash
# Read handoff state
READ: .agent-os/session-ledger.md

# Increment session number
PM_SESSION_NUMBER = previous + 1

# Prepare continuation context
RESUME_POINT = "${stopped_at}"
NEXT_ACTION = "${next_action}"
CONTEXT_NOTES = "${context_notes}"
```

### 3.2: Update Supervisor Tracking

```bash
bd note ${SUPERVISOR_TASK_ID} "
PM SESSION ${PM_SESSION_NUMBER} STARTING: $(date -Iseconds)
RESUMING FROM: ${RESUME_POINT}
COMPLETED SO FAR: ${completed_tasks}
REMAINING: ${remaining_tasks}
"
```

### 3.3: Dispatch New PM

```javascript
# Same prompt as Step 1.2, but with:
# - PM_SESSION: incremented
# - RESUMING_FROM: exact resume point
# - Additional context from handoff

Task(
  subagent_type: "general-purpose",
  prompt: `
[Same PM prompt as Step 1.2]

CONTINUATION CONTEXT:
═══════════════════════════════════════════════════════════════════
PM_SESSION: ${PM_SESSION_NUMBER}
RESUMING_FROM: ${RESUME_POINT}
NEXT_ACTION: ${NEXT_ACTION}

Previous PM completed: ${completed_tasks}
Remaining tasks: ${remaining_tasks}

Context from previous PM:
${CONTEXT_NOTES}

${USER_GUIDANCE_IF_PROVIDED}
═══════════════════════════════════════════════════════════════════

IMPORTANT: Read .agent-os/session-ledger.md for full state.
Continue from NEXT_ACTION, do not restart completed work.

═══════════════════════════════════════════════════════════════════
HANDOFF VALIDATION (MANDATORY FIRST ACTION)
═══════════════════════════════════════════════════════════════════

Before doing ANY work, you MUST answer these validation probes to
confirm context was properly transferred:

1. PROBE: "What was the last task completed before this handoff?"
   YOUR ANSWER: [state the Beads task ID and brief description]

2. PROBE: "What file/location was work stopped at?"
   YOUR ANSWER: [state exact file:line or step reference from handoff]

3. PROBE: "What is the immediate next action you will take?"
   YOUR ANSWER: [state specific action, not generic "continue work"]

VALIDATION REQUIREMENT:
- Your answers MUST match the stored handoff state
- If you cannot answer accurately, STOP and re-read state:
  cat .agent-os/session-ledger.md
  bd show ${CURRENT_TASK_ID}
  bd list --status=in_progress
- Then answer the probes again before proceeding

FORMAT YOUR PROBE RESPONSES:
---
PROBE_ANSWERS:
  last_task: "[task ID]: [description]"
  stopped_at: "[exact location]"
  next_action: "[specific action]"
---

Only proceed with execution AFTER providing probe answers.
═══════════════════════════════════════════════════════════════════
`,
  description: "PM Session ${PM_SESSION_NUMBER}: Continue from ${RESUME_POINT}"
)
```

### 3.4: Handoff Validation Probes

After spawning a new PM following a handoff, verify that context was properly transferred by requiring the PM to answer validation probes.

**Purpose**: Detect context transfer failures early, before the PM wastes cycles on incorrect work.

```
VALIDATION PROBES (PM must answer these correctly):

1. "What was the last task completed before this handoff?"
   - Expected: Match Completed Tasks[-1] from session ledger
   - Validates: PM read the handoff state

2. "What file/location was work stopped at?"
   - Expected: Match Stopped At from session ledger
   - Validates: PM knows exact resume point

3. "What is the immediate next action you will take?"
   - Expected: Match Next Action from session ledger
   - Validates: PM has clear direction

VALIDATION LOGIC:
  IF PM answers ALL probes correctly:
    PROCEED with execution
  ELSE:
    DISPLAY: "Context transfer incomplete. Re-reading Beads state..."
    PM MUST:
      1. Re-read: .agent-os/session-ledger.md
      2. Run: bd show ${CURRENT_TASK_ID}
      3. Run: bd list --status=in_progress
      4. Re-answer probes before proceeding
```

**Integration in PM Prompt** (add to Step 1.2 and 3.3 prompts):

```
═══════════════════════════════════════════════════════════════════
HANDOFF VALIDATION (if resuming from previous PM)
═══════════════════════════════════════════════════════════════════

Before starting any work, you MUST answer these validation probes:

1. PROBE: "What was the last task completed before this handoff?"
   YOUR ANSWER: [state the task ID and brief description]

2. PROBE: "What file/location was work stopped at?"
   YOUR ANSWER: [state exact file:line or step reference]

3. PROBE: "What is the immediate next action you will take?"
   YOUR ANSWER: [state specific action, not generic "continue work"]

If you cannot answer these accurately, STOP and:
- Re-read: .agent-os/session-ledger.md
- Run: bd show <TASK_ID> for the current task
- Run: bd list --status=in_progress
- Then answer the probes again before proceeding
═══════════════════════════════════════════════════════════════════
```

**Supervisor Verification** (after receiving PM response):

```
WHEN PM responds with probe answers:

  LOAD: .agent-os/session-ledger.md

  VERIFY each probe answer against stored state:

  IF probe_1_answer MATCHES completed_tasks[-1]:
    ✓ Last task verified
  ELSE:
    ✗ Mismatch: Expected "${completed_tasks[-1]}", got "${probe_1_answer}"

  IF probe_2_answer MATCHES stopped_at:
    ✓ Stop point verified
  ELSE:
    ✗ Mismatch: Expected "${stopped_at}", got "${probe_2_answer}"

  IF probe_3_answer MATCHES next_action (semantic match):
    ✓ Next action verified
  ELSE:
    ✗ Mismatch: Expected "${next_action}", got "${probe_3_answer}"

  IF all verified:
    DISPLAY: "Handoff validated. PM proceeding."
  ELSE:
    DISPLAY: "Handoff validation FAILED. Instructing PM to re-read state."
    SEND to PM: "Your probe answers don't match saved state.
                 Run: cat .agent-os/session-ledger.md
                 Run: bd show <TASK_ID>
                 Then provide corrected answers."
```

### 3.5: Loop Back to Monitor

```
→ Go to Step 2 (Monitor PM Status)
```

---

## STEP 4: Success - All Tasks Complete

### 4.1: Verify Completion

```bash
# Confirm no open tasks remain
OPEN=$(bd list --status=open --json | jq length)

IF OPEN > 0:
  DISPLAY: "Warning: ${OPEN} tasks still open"
  bd list --status=open
```

### 4.2: Clean Up Supervisor State

```bash
# Close supervisor task
bd close ${SUPERVISOR_TASK_ID} --reason="Autonomous execution complete"

# Archive session ledger (already done in step 3)

# Final sync
bd sync --from-main
```

### 4.3: Report Success

```
DISPLAY:
  "═══════════════════════════════════════════════════════════
   ✅ AUTONOMOUS EXECUTION COMPLETE
   ═══════════════════════════════════════════════════════════
   
   PM Sessions: ${PM_SESSION_NUMBER}
   Tasks Completed: ${total_completed}
   Final Commit: ${FINAL_COMMIT}
   
   Summary:
   ${SUMMARY}
   
   Next steps:
   1. git diff main...HEAD  (review changes)
   2. gh pr create          (create PR)
   ═══════════════════════════════════════════════════════════"
```

---

## STEP 5: Abort Execution

### 5.1: Save Current State

```bash
# Ensure all work is committed
git add -A
git status --short

IF uncommitted changes:
  git commit -m "checkpoint: execution aborted by user"

# Sync Beads
bd sync --from-main

# Note on supervisor task
bd note ${SUPERVISOR_TASK_ID} "ABORTED by user at $(date -Iseconds)"
```

### 5.2: Report Status

```
DISPLAY:
  "═══════════════════════════════════════════════════════════
   ⏹️  EXECUTION ABORTED
   ═══════════════════════════════════════════════════════════
   
   Progress saved to Beads.
   PM Sessions completed: ${PM_SESSION_NUMBER}
   Tasks completed: [list]
   Tasks remaining: [list]
   
   To resume later: /context-aware --resume
   ═══════════════════════════════════════════════════════════"
```

---

## Critical Rules

### Supervisor Rules (YOU)

1. **Stay minimal** - Only spawn PMs and monitor status
2. **Never do implementation work** - That's the PM's job
3. **Trust PM handoffs** - They follow /execute-tasks protocol
4. **Only intervene for blockers** - Everything else is autonomous
5. **Keep count** - Track PM session numbers for debugging

### PM Rules (Subagent)

1. **Follow /execute-tasks exactly** - It's the primary protocol
2. **Monitor context aggressively** - Handoff at 85%, not 95%
3. **Save state to Beads** - Every checkpoint, every handoff
4. **Clean handoffs** - Between tasks, not mid-implementation
5. **Report accurately** - Status format must be exact
6. **Answer validation probes** - When resuming, answer all 3 probes before work

### Session Ledger State

The session ledger `.agent-os/session-ledger.md` contains:

**Handoff Context section:**
- `PM Session` - Which PM session (1, 2, 3...)
- `Completed Tasks` - Beads IDs of completed work
- `Current Task` - What was being worked on
- `Stopped At` - Exact point (task/step/file:line)
- `Next Action` - What next PM does first
- `Remaining Tasks` - What's left
- `Last Commit` - Git SHA for verification

**Plus standard ledger sections:**
- Goal, Constraints, State (DONE/NOW/NEXT), Working Set, Session Notes

---

## Configuration

Add to `config.yml`:

```yaml
autonomous_execution:
  enabled: true
  pm_context_limit: 0.85           # When PM triggers handoff
  supervisor_context_limit: 0.95   # Emergency stop (should never hit)
  max_pm_sessions: 20              # Safety limit
  handoff_directory: ".agent-os"
  handoff_file: "session-ledger.md"
  ledger_archive_directory: ".agent-os/ledgers"
  require_user_confirmation: true  # Confirm before starting
  auto_resume: true                # Session start auto-detects ledger
```

---

## Directory Structure

```
.agent-os/
├── session-ledger.md          # Current session state (unified handoff)
├── ledgers/                   # Archived session ledgers
│   └── LEDGER-*.md            # Historical session records
├── test-context/              # Test patterns (from execute-tasks)
├── test-failures/             # Failure analysis (from execute-tasks)
└── tdd-state/                 # TDD cycle tracking
```

---

## Quick Reference

### Start Fresh
```bash
/context-aware specs/my-feature    # Execute all tasks for spec
```

### Resume After Interruption
Session start auto-detects `.agent-os/session-ledger.md` and offers to resume.
No explicit command needed - just start a new session.

### Check Progress (from another terminal)
```bash
bd list --status=in_progress       # What's being worked on
bd stats                           # Overall progress
cat .agent-os/session-ledger.md  # Current state
```
