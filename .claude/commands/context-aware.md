---
description: Enable context-aware execution with automatic checkpointing and clean handoffs
globs:
alwaysApply: false
version: 2.1
encoding: UTF-8
---

# Context-Aware Execution Mode

> **Note**: Context-aware execution is integrated into `/execute-tasks`.
> Use this command only for ad-hoc work outside the normal task workflow.

## Critical Rules

### You MUST:
- Stop at 75% context capacity
- Save all progress to Beads before stopping
- Create a Beads task for every subagent before spawning
- Process every subagent status report
- Prompt user for decisions on incomplete tasks
- Commit all work to git at checkpoints

### You MUST NOT:
- Continue past 75% context for any reason
- Close tasks that are not 100% complete
- Ignore subagent status reports
- Make autonomous decisions about blocked/incomplete tasks
- Leave uncommitted work

## Subagent Status Report Format

All subagents must report:

```
STATUS: [completed | stopped_at_checkpoint | blocked]
TASK_ID: <beads_task_id>
COMPLETED: [bullet list]
REMAINING: [bullet list]
STOPPED_AT: [exact point - file:line or step]
NEXT_ACTION: [what next agent should do first]
BLOCKERS: [any issues]
```

## For Full Task Execution

Use `/execute-tasks` which includes context-aware features plus:
- Pre-flight checks and repo health
- Beads-first task creation with dependencies
- Parallel specialist execution

See: @.agent-os/instructions/core/execute-tasks.md
