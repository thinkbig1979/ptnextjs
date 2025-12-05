---
description: Execute individual tasks from the task list using Unified Beads-First Execution
globs:
alwaysApply: false
version: 2.0
encoding: UTF-8
---

# Execute Tasks

## Overview

Execute tasks using Agent OS v4.1+ **Unified Execution Protocol** - combining Beads-first orchestration with parallel specialist delegation. This command provides:

### Core Features
- ✅ **Beads-first orchestration** - ALL tasks created with dependencies BEFORE execution
- ✅ **Context-aware execution** - 75% context limit with clean checkpoints
- ✅ **Parallel specialist execution** - Independent tasks run in parallel waves
- ✅ **Real-time progress tracking** - Tasks and specs updated as work progresses

### Inherited from Orchestrated Execution
- ✅ **60-80% faster execution** through intelligent parallel processing
- ✅ **Specialist agent coordination** for testing, implementation, security, etc.
- ✅ **Pre-flight checks** - Repo health and quality hooks verification
- ✅ **Deliverable verification** (v2.5+) - all files verified before completion
- ✅ **TDD enforcement** with RED-GREEN-REFACTOR cycle tracking

### Inherited from Context-Aware Protocol
- ✅ **Clean handoffs** - Full state saved to Beads before stopping
- ✅ **User decision prompts** - No autonomous decisions on blocked tasks
- ✅ **Checkpoint protocol** - Git commits and Beads sync at every checkpoint
- ✅ **Continuation support** - Seamless resume from checkpoints

## Execution Flow

```
Phase 0: Pre-Flight
├─ Quality hooks verification
├─ Repository health check
└─ Branch setup

Phase 1: Beads Task Decomposition (BEFORE any execution)
├─ Analyze full work scope
├─ Create ALL beads tasks
├─ Define ALL dependencies
└─ Create execution plan (parallel waves)

Phase 2: Parallel Execution
├─ Wave N: Launch parallel subagents
├─ Collect status reports
├─ Handle completions/checkpoints/blockers
├─ Update documents (tasks.md, specs)
└─ Checkpoint (git commit, bd sync)

Phase 3: Context-Aware Monitoring
├─ Monitor orchestrator context
└─ Graceful stop if approaching 75%

Phase 4: Post-Execution
├─ Verify all deliverables
├─ Run full test suite
├─ Close beads tasks
└─ Final commit and summary
```

## Usage

```
/execute-tasks                    # Execute next uncompleted task
/execute-tasks <SPEC_FOLDER>      # Execute all tasks for a spec
/execute-tasks <TASK_ID>          # Execute specific task
```

**Use this when:** Implementing tasks from a task list created by create-tasks.

**Use validate-spec after:** To validate implementation quality and completeness.

## Instructions

@.agent-os/instructions/core/execute-tasks-unified.md
