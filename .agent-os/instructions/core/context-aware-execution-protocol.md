# Context-Aware Execution Protocol

> **Integration Note**: This protocol is now integrated into the Unified Execution Protocol.
> See `execute-tasks-unified.md` for the combined approach with Beads-first orchestration.
> This file remains as a reference for the core context-aware concepts.

## Critical Directive: Never Exhaust Context

You MUST monitor your context usage throughout execution. **Stop working BEFORE reaching 75% context capacity** to ensure clean handoff.

### Context Checkpoints

After EVERY significant action (file edit, test run, tool use), evaluate:

1. **Am I approaching 75% context?** If yes → initiate graceful stop
2. **Can I complete the next action AND have room to save state?** If no → stop now
3. **Have I been working for 10+ tool calls since last checkpoint?** If yes → save progress to Beads

### Graceful Stop Protocol

When stopping (either at 75% context OR task completion), you MUST:

```bash
# 1. Update the Beads task with current state
bd update <TASK_ID> --status in_progress

# 2. Add a detailed progress note
bd note <TASK_ID> "
CHECKPOINT: [timestamp]
COMPLETED:
- [List what was accomplished]

IN PROGRESS:
- [Current activity when stopped]

NEXT STEPS:
- [Exactly what the next agent should do first]
- [Subsequent steps in order]

CONTEXT:
- [Key decisions made and why]
- [Files modified: list with brief description]
- [Tests status: passing/failing/not yet run]

BLOCKERS:
- [Any issues discovered]
"

# 3. Commit all changes
git add -A
git commit -m "checkpoint: [brief description of progress]"

# 4. Sync Beads
bd sync --from-main
```

---

## Subagent Delegation Protocol

### Before Spawning ANY Subagent

You MUST create a Beads task for the subagent to work on:

```bash
# 1. Create the subagent's task
bd create --title="[Specific task description]" --type=task

# 2. Link it to the parent task (if applicable)
bd dep <PARENT_TASK_ID> <NEW_TASK_ID>

# 3. Assign it to the subagent
bd update <NEW_TASK_ID> --status in_progress
```

### When Spawning the Subagent

Include these instructions in the Task tool prompt:

```
MANDATORY CONTEXT PROTOCOL:

1. You are working on Beads task: <NEW_TASK_ID>
2. Monitor your context usage - stop at 75% capacity
3. Before stopping, you MUST:
   - Update YOUR Beads task with progress: bd note <NEW_TASK_ID> "..."
   - Report back exactly where you stopped
   - List completed items
   - List remaining items  
   - Note any blockers or decisions made
4. Do NOT continue working if you cannot complete the next action 
   AND save your state
5. Commit your work: git add -A && git commit -m "checkpoint: ..."
6. Sync Beads: bd sync --from-main

Your report-back format:
---
STATUS: [completed | stopped_at_checkpoint | blocked]
TASK_ID: <NEW_TASK_ID>
COMPLETED: [bullet list]
REMAINING: [bullet list]  
STOPPED_AT: [exact point - file:line or step description]
NEXT_ACTION: [what the next agent should do first]
BLOCKERS: [any issues]
CONTEXT_USED: [estimate if possible]
---
```

### Subagent Monitoring

After EACH subagent returns:

1. **Parse the status report** - extract completed/remaining/stopped_at
2. **Update Beads** with the subagent's progress (if not already done by subagent)
3. **Decide next action:**
   - If `STATUS: completed` → close the subagent's task, proceed to next phase
   - If `STATUS: stopped_at_checkpoint` → spawn continuation agent with NEXT_ACTION
   - If `STATUS: blocked` → log blocker, prompt user for decision

### Continuation Agent Prompt Template

When spawning an agent to continue interrupted work:

```
CONTINUATION TASK

You are continuing work that was interrupted at a checkpoint.

Beads Task: <TASK_ID>
Previous agent stopped at: <STOPPED_AT>
Previous agent's next action: <NEXT_ACTION>

Remaining work:
<REMAINING items from previous report>

Context from previous agent:
<Any CONTEXT notes>

MANDATORY: Follow the Context-Aware Execution Protocol. 
Read the full Beads task history first: bd show <TASK_ID>

Begin with: <NEXT_ACTION>
```

---

## Task Lifecycle Rules

**Tasks are only closed when fully complete.** No exceptions.

```bash
# ONLY when the task is 100% done:
bd close <TASK_ID> --reason="Completed: [summary of what was delivered]"
```

**If an agent cannot complete a task**, it must:

1. Save all progress to the Beads task
2. Commit all work to git
3. Report back to the main agent with status `stopped_at_checkpoint` or `blocked`
4. **Leave the task open** (status remains `in_progress`)

**The main agent must then prompt the user for a decision:**

```
TASK INCOMPLETE: <TASK_ID> - [task title]

The subagent could not complete this task.

Reason: [stopped at context limit | blocked by <issue> | other]
Progress: [X]% complete
Stopped at: [description]

Remaining work:
- [item 1]
- [item 2]

Options:
1. **continue** - Spawn a new agent to continue from checkpoint
2. **investigate** - I'll examine the issue before proceeding
3. **skip** - Mark as deferred and proceed with other work
4. **abort** - Stop all work on this task

How would you like to proceed?
```

**Wait for user response before taking action.**

---

## Main Agent Responsibilities

As the orchestrating agent, you must:

1. **Create Beads tasks before delegation** - every subagent works on a tracked task
2. **Track all spawned subagents** - maintain mental map of who is doing what
3. **Process every subagent report** - never ignore a status report
4. **Persist progress immediately** - update Beads after each subagent returns
5. **Spawn continuation agents** - when subagents stop at checkpoints
6. **Prompt user when blocked** - never make autonomous decisions about incomplete tasks
7. **Monitor YOUR OWN context** - you are also bound by the 75% rule
8. **Handoff cleanly** - if you approach 75%, save full orchestration state to Beads

### Main Agent Checkpoint Format

If YOU (the main agent) must stop:

```bash
bd note <TASK_ID> "
ORCHESTRATOR CHECKPOINT: [timestamp]

ORCHESTRATION STATE:
- Current phase: [e.g., test execution, implementation, review]
- Active subagents: [none - all returned]
- Pending subagent spawns: [list with prompts if needed]

TASK PROGRESS:
- Overall: [X]% complete
- [Phase 1]: [status]
- [Phase 2]: [status]
- ...

SUBAGENT HISTORY:
- Agent 1 (<TASK_ID_1>): completed, task closed
- Agent 2 (<TASK_ID_2>): stopped at src/auth.ts:45, needs continuation

NEXT ORCHESTRATOR ACTION:
- [Exactly what the next main agent should do]

FULL CONTEXT FOR RESUMPTION:
- [Key decisions, rationale, anything the next orchestrator needs]
"
```

Then prompt the user:

```
ORCHESTRATOR CHECKPOINT

I am approaching my context limit and must stop.

Current progress has been saved to Beads task: <TASK_ID>

To resume, start a new session and run:
  bd show <TASK_ID>

Then instruct me to continue from the checkpoint.
```

---

## Rules (Non-Negotiable)

1. **75% is a hard stop** - no exceptions, no "just one more thing"
2. **State before action** - if in doubt whether you can finish, save state first
3. **Beads is the source of truth** - all progress lives there
4. **Every subagent gets a Beads task** - create before spawning
5. **Tasks only close when complete** - incomplete tasks stay open
6. **User decides on incomplete tasks** - prompt and wait for response
7. **Subagents report back** - every subagent must return a status report
8. **Git commits are checkpoints** - uncommitted work is lost work
9. **Explicit over implicit** - write down everything the next agent needs
