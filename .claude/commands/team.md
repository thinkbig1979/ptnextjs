---
description: Team-based orchestration with inter-agent messaging, model tiers, and dynamic QC
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Team (Agent Teams)

> **Full Lifecycle**: Plans from raw objectives OR executes existing tasks
> **Inter-Agent Comms**: Workers and QC reviewers communicate directly
> **Cost Optimized**: Model tiers (Opus/Sonnet/Haiku) matched to role complexity

## Architecture

```
Lead (Opus, ~5% context)
     ↓
PM Teammate (Opus, ~30% context) - plans, delegates, scales QC
     ↓
Workers (Sonnet/Haiku) + QC Reviewers (Opus) - parallel execution
```

- Lead creates team, spawns PM, reports to user
- PM plans tasks (if raw objective), dispatches workers, scales QC dynamically
- Workers implement in parallel, communicate via team messages
- QC reviewers validate work (never self-review), can message implementers
- Cost-optimized: Opus for judgment, Sonnet for implementation, Haiku for mechanical work

## Usage

```bash
/team "Build auth module"          # Full lifecycle: plan → execute → QC
/team --tasks                      # Execute existing Beads tasks with teams
/team <SPEC_FOLDER>                # Execute spec tasks with teams
```

## When to Use

| Criteria | `/run` | `/orchestrate` | `/team` |
|----------|--------|-----------------|---------|
| Task count | < 10 | 10+ | 10+ or raw objective |
| Inter-agent comms | No | No | Yes |
| Model tiers | No | No | Yes (Opus/Sonnet/Haiku) |
| QC reviewers | No | No | Yes (dynamic scaling) |
| Plans from objective | No | No | Yes |
| Complexity | Simple | Complex | Complex + planning |

## Key Benefits

1. **Model-Tier Cost Savings** - Haiku for file ops, Sonnet for implementation, Opus only for judgment
2. **Dynamic QC** - QC reviewer count scales with wave output (1 per 3 tasks)
3. **Direct Communication** - Workers message QC, QC messages implementers
4. **Full Lifecycle** - Can start from raw objective, not just existing tasks
5. **No Self-QC** - All reviews by Opus agents who didn't implement

## Instructions

@.agent-os/instructions/core/team.md

## Quick Reference

| Goal | Command |
|------|---------|
| Plan + execute | `/team "objective"` |
| Execute existing tasks | `/team --tasks` |
| Execute spec tasks | `/team my-feature` |
| Simple work | `/run` |
| Complex (no teams) | `/orchestrate` |
| Help choosing | `/pick-orchestration` |

ARGUMENTS: $ARGUMENTS
