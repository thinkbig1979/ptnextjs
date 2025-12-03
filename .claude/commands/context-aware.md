---
description: Enable context-aware execution with automatic checkpointing and clean handoffs
globs:
alwaysApply: false
version: 2.0
encoding: UTF-8
---

# Context-Aware Execution Mode

> **Note**: Context-aware execution is now integrated into the Unified Execution Protocol.
> For task execution, prefer using `/execute-tasks` which includes all context-aware features.

This command enables context-aware execution for ad-hoc work outside the normal task workflow.

## Quick Start

1. **Load Protocol**: Read @.agent-os/instructions/core/context-aware-execution-protocol.md
2. **Confirm**: State your context limit (75%), current Beads task, and checkpointing commitment
3. **Work**: Follow the protocol below

## Critical Rules

### You MUST:
- Stop at 75% context capacity
- Save all progress to Beads before stopping
- Create a Beads task for every subagent before spawning
- Include the mandatory context protocol in every subagent prompt
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

All subagents must report back with:

```
---
STATUS: [completed | stopped_at_checkpoint | blocked]
TASK_ID: <beads_task_id>
COMPLETED: [bullet list]
REMAINING: [bullet list]
STOPPED_AT: [exact point - file:line or step]
NEXT_ACTION: [what next agent should do first]
BLOCKERS: [any issues]
---
```

## For Full Task Execution

Use the unified execution protocol which combines context-aware features with:
- Pre-flight checks and repo health
- Beads-first task creation with dependencies
- Parallel specialist execution
- Document synchronization

See: `/execute-tasks` or @.agent-os/instructions/core/execute-tasks-unified.md

---

## You Are Now Context-Aware

Proceed with your task. Remember: **state before action** - if in doubt, save first.
