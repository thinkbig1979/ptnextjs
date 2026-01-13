---
description: Force supervisor-orchestrated execution for task lists without decision logic
globs:
alwaysApply: false
version: 2.0
encoding: UTF-8
---

# Orchestrate

## Overview

Force the **supervisor -> PM -> subagent** architecture for processing task lists. Unlike `/execute-tasks` which decides whether to use orchestration based on task structure, `/orchestrate` **always** uses the supervisor pattern.

**v2.0**: Uses unified session ledger (`.agent-os/session-ledger.md`) for cross-session handoffs. Session start auto-detects ledger and offers to resume.

### Use Cases

- Processing task lists without constant monitoring
- Long-running work that may exceed context limits
- Any scenario where you want autonomous execution with checkpointing
- Tasks that don't naturally trigger parallel execution but still benefit from orchestrated flow

### Key Differences from /execute-tasks

| Aspect | /execute-tasks | /orchestrate |
|--------|---------------|--------------|
| Decision logic | Analyzes task structure | Skipped - always orchestrates |
| Parallelism | Conditional on dependencies | Parallel when possible, sequential otherwise |
| User intervention | May require more | Minimal - autonomous execution |
| Context management | Standard | Always uses supervisor pattern |

## Usage

```
/orchestrate                      # Execute all ready beads tasks
/orchestrate <SPEC_FOLDER>        # Execute all tasks for a spec
/orchestrate --beads              # Execute all ready beads tasks (explicit)
/orchestrate --tasks "T1, T2"     # Inline task list
/orchestrate --file <path>        # Read tasks from file
```

**Use this when:** You have a list of tasks and want hands-off, autonomous processing with built-in checkpointing.

## Instructions

@.agent-os/instructions/core/orchestrate.md
