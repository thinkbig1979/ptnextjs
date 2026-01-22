---
description: 2-Layer task execution (Orchestrator → Workers)
globs:
alwaysApply: false
version: 2.0
encoding: UTF-8
---

# Run (2-Layer)

> **Simple Execution**: Orchestrator spawns workers directly in parallel
> **For Complex Work**: Use `/orchestrate` (3-layer) instead

## Architecture

```
Orchestrator → Workers (parallel)
```

- Orchestrator analyzes tasks, groups into waves
- Workers execute tasks in parallel within each wave
- Good for < 10 tasks, single session expected

## Usage

```bash
/run                           # Execute ready Beads tasks
/run <SPEC_FOLDER>             # Execute all tasks for a spec
/run --tasks "T1, T2"          # Inline task list
```

## When to Use

| Criteria | `/run` (2-Layer) | `/orchestrate` (3-Layer) |
|----------|------------------|--------------------------|
| Task count | < 10 | 10+ |
| Complexity | Simple/medium | Complex |
| Sessions | Single | Multi-session |
| Context | Workers use most | PM coordinates workers |

## Instructions

@.agent-os/instructions/core/run.md

## Quick Reference

| Goal | Command |
|------|---------|
| Run ready tasks | `/run` |
| Run spec tasks | `/run my-feature` |
| Complex work | `/orchestrate` |
| Check state | `bd ready` |

ARGUMENTS: $ARGUMENTS
