---
description: Unified task execution with autonomous mode and supervisor orchestration
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Run

> **Unified Command**: Combines `/execute-tasks`, `/orchestrate`, and `/context-aware` into a single entry point for task execution.

## Overview

`/run` is the primary command for executing tasks. It supports multiple modes:

| Mode | Description | Use When |
|------|-------------|----------|
| **Default** | Autonomous execution with session ledger | Large task lists, multi-session work |
| `--quick` | Direct execution without supervisor | Few tasks, simple work |
| `--supervisor` | Force supervisor pattern | Always want orchestration |

## Usage

```bash
/run                           # Execute ready Beads tasks (autonomous mode)
/run <SPEC_FOLDER>             # Execute all tasks for a spec
/run --quick                   # Direct execution (no supervisor overhead)
/run --supervisor              # Force supervisor pattern
/run --tasks "T1, T2"          # Inline task list
```

## Mode Details

### Default Mode (Autonomous)

Full autonomous execution with:
- Supervisor -> PM -> Subagent architecture
- Session ledger (`.agent-os/session-ledger.md`) for cross-session handoffs
- Automatic resume detection at session start
- PreCompact hook integration for graceful context management

**Best for**: Long-running work, complex specs, multi-session tasks

### Quick Mode (`--quick`)

Direct task execution without supervisor overhead:
- Faster for small task lists (< 5 tasks)
- No session ledger management
- Uses standard `/execute-tasks` protocol

**Best for**: Quick fixes, simple changes, few tasks

### Supervisor Mode (`--supervisor`)

Forces supervisor pattern regardless of task count:
- Always uses supervisor -> PM architecture
- Full checkpointing and handoff support
- Minimal user intervention

**Best for**: When you want hands-off execution regardless of task size

---

## Instructions

### Default/Supervisor Mode

@.agent-os/instructions/core/run.md

### Quick Mode

@.agent-os/instructions/core/execute-tasks.md

---

## Session Resume

Session start auto-detects `.agent-os/session-ledger.md` and offers to resume.
No explicit `--resume` flag needed.

## Quick Reference

| Goal | Command |
|------|---------|
| Run all ready tasks | `/run` |
| Run spec tasks | `/run my-feature` |
| Quick direct execution | `/run --quick` |
| Force supervisor | `/run --supervisor` |
| Check session state | `cat .agent-os/session-ledger.md` |
| Check Beads state | `bd ready` |
