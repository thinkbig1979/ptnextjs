---
description: "[DEPRECATED] Use /run instead - Execute tasks with 2-layer orchestration"
globs:
alwaysApply: false
version: 3.0
encoding: UTF-8
---

# Execute Tasks

> **DEPRECATED**: This command is deprecated. Use `/run` or `/orchestrate` instead.

## Migration Guide

| Old Command | New Command | When to Use |
|-------------|-------------|-------------|
| `/execute-tasks` | `/run` | Simple work, < 10 tasks |
| `/execute-tasks` (complex) | `/orchestrate` | Complex work, 10+ tasks |

## Quick Redirect

For most cases, just use:
```bash
/run                           # 2-layer: Orchestrator → Workers
/run <SPEC_FOLDER>             # Execute spec tasks
```

For complex multi-session work:
```bash
/orchestrate                   # 3-layer: Orchestrator → PM → Workers
/orchestrate <SPEC_FOLDER>     # Execute spec tasks with PM coordination
```

## Why the Change?

The old `/execute-tasks` mixed 2-layer and 3-layer patterns inconsistently. The new commands provide:

- `/run` - Clean 2-layer (Orchestrator → Workers) for simple work
- `/orchestrate` - Clean 3-layer (Orchestrator → PM → Workers) for complex work

## Instructions

**If you really need the old behavior**, the instruction file still exists:

@.agent-os/instructions/core/execute-tasks.md

**But prefer using:**
- @.agent-os/instructions/core/run.md (2-layer)
- @.agent-os/instructions/core/orchestrate.md (3-layer)
