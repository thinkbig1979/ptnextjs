---
description: 3-Layer orchestration (Orchestrator → PM → Workers) for complex work
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Orchestrate (3-Layer)

> **Maximum Context Efficiency**: Orchestrator stays minimal, PM coordinates workers
> **For Simple Work**: Use `/run` (2-layer) instead

## Architecture

```
Orchestrator (~5% context)
     ↓
PM (~30% context) - coordinates, doesn't implement
     ↓
Workers (~60% context) - parallel execution
```

- Orchestrator makes high-level decisions only
- PM dispatches workers in parallel, tracks status
- Workers do actual implementation
- Proper handoff chain at each tier on PreCompact

## Usage

```bash
/orchestrate                   # Execute ready Beads tasks (3-layer)
/orchestrate <SPEC_FOLDER>     # Execute all tasks for a spec
```

## When to Use

| Criteria | `/run` (2-Layer) | `/orchestrate` (3-Layer) |
|----------|------------------|--------------------------|
| Task count | < 10 | 10+ |
| Complexity | Simple/medium | Complex |
| Sessions | Single | Multi-session expected |
| Context | Workers use most | PM coordinates workers |

## Key Benefits

1. **Context Isolation** - Orchestrator stays clean for high-level steering
2. **Parallel Workers** - PM coordinates multiple workers simultaneously
3. **Graceful Handoffs** - Each tier creates proper handoff on PreCompact
4. **Beads Integration** - Full agent state tracking, comments, audit trail

## Instructions

@.agent-os/instructions/core/orchestrate.md

## Quick Reference

| Goal | Command |
|------|---------|
| Complex work | `/orchestrate` |
| Simple work | `/run` |
| Check state | `bd ready` |
| Agent status | `bd agent list` |

ARGUMENTS: $ARGUMENTS
