---
description: Interactive decision helper - recommends the best orchestration pattern for your situation
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Pick Orchestration

> **Decision Helper**: Analyzes your situation and recommends `/run`, `/orchestrate`, or `/team`
> **Not an executor**: This command only recommends, you run the suggested command yourself

## How It Works

Gather context, walk through the decision tree, and output a recommendation.

## Decision Tree

Execute these steps in order:

### Step 1: Detect Available Tasks

```bash
# Check for existing Beads tasks
BEADS_TASKS=$(bd ready --json 2>/dev/null)
BEADS_COUNT=$(bd list --status=open --json 2>/dev/null | wc -l)

# Check for spec folders
SPEC_FOLDERS=$(ls .agent-os/specs/ 2>/dev/null)

# Check if user provided a raw objective
RAW_OBJECTIVE=$ARGUMENTS
```

### Step 2: Assess Complexity

```
IF BEADS_COUNT > 0:
  TASK_SOURCE = "beads"
  TASK_COUNT = BEADS_COUNT

  # Check for cross-dependencies
  BLOCKED = $(bd blocked --json 2>/dev/null)
  HAS_CROSS_DEPS = len(BLOCKED) > 0

ELIF SPEC_FOLDERS not empty:
  TASK_SOURCE = "spec"
  # Count tasks in spec
  TASK_COUNT = count tasks in spec/tasks.md

ELIF RAW_OBJECTIVE not empty:
  TASK_SOURCE = "objective"
  # Estimate complexity from description
  TASK_COUNT = "unknown (needs planning)"

ELSE:
  DISPLAY: "No tasks, specs, or objective found. Create tasks first with /create-tasks or provide an objective."
  EXIT
```

### Step 3: Apply Decision Matrix

```
# Primary decision: task count
IF TASK_SOURCE == "objective":
  # Raw objective needs planning
  IF objective seems simple (< 5 implied tasks):
    RECOMMEND = "/run --tasks 'inline tasks'"
    ALT = "/team '${objective}'"
    REASON = "Simple objective, inline tasks sufficient"
  ELSE:
    RECOMMEND = "/team '${objective}'"
    ALT = "Create tasks manually with /create-tasks, then /orchestrate"
    REASON = "Complex objective benefits from PM-driven planning"

ELIF TASK_COUNT < 5:
  RECOMMEND = "/run"
  ALT = none
  REASON = "Few tasks, minimal overhead needed"

ELIF TASK_COUNT <= 10:
  RECOMMEND = "/run"
  ALT = "/orchestrate"
  REASON = "Moderate task count, 2-layer sufficient but 3-layer available"

ELIF TASK_COUNT > 10:
  IF HAS_CROSS_DEPS:
    RECOMMEND = "/team --tasks"
    ALT = "/orchestrate"
    REASON = "Many tasks with cross-dependencies, inter-agent comms valuable"
  ELSE:
    RECOMMEND = "/orchestrate"
    ALT = "/team --tasks"
    REASON = "Many independent tasks, 3-layer coordination sufficient"

# Secondary: inter-agent communication need
IF tasks involve frontend+backend, shared APIs, or cross-cutting concerns:
  PREFER = "/team" variants
  REASON += " + cross-cutting work benefits from direct agent messaging"

# Tertiary: session expectations
IF work likely spans multiple sessions:
  NOTE = "Multi-session expected - session ledger will handle continuity"
```

### Step 4: Output Recommendation

```
DISPLAY:
  "═══════════════════════════════════════════════════════
   ORCHESTRATION RECOMMENDATION
   ═══════════════════════════════════════════════════════

   Context:
     Task source: ${TASK_SOURCE}
     Task count: ${TASK_COUNT}
     Cross-dependencies: ${HAS_CROSS_DEPS}

   Recommended: ${RECOMMEND}
   Rationale: ${REASON}

   ${IF ALT}
   Alternative: ${ALT}
   ${ENDIF}

   ${IF NOTE}
   Note: ${NOTE}
   ${ENDIF}

   ═══════════════════════════════════════════════════════"
```

## Reference: Decision Matrix

| Scenario | Recommended | Why |
|----------|-------------|-----|
| < 5 simple tasks, existing list | `/run` | Minimal overhead |
| 5-10 tasks, existing list | `/run` | Subagents sufficient |
| 10+ tasks, existing list | `/team --tasks` | Inter-agent comms, dynamic QC |
| 10+ independent tasks | `/orchestrate` | 3-layer coordination sufficient |
| Raw objective, complex | `/team "..."` | Full lifecycle: plan + execute + QC |
| Raw objective, simple | `/run --tasks "..."` | Inline task list, no planning needed |
| Teams feature unavailable | `/orchestrate` | Subagent fallback |

## Quick Reference

| Goal | Command |
|------|---------|
| Get recommendation | `/pick-orchestration` |
| Run simple work | `/run` |
| Run complex work | `/orchestrate` |
| Decide first | `/pick-orchestration` |

ARGUMENTS: $ARGUMENTS
