---
description: Unified E2E testing - run tests, autonomous repair loop, or view health dashboard
globs:
alwaysApply: false
version: 1.0.0
encoding: UTF-8
---

# E2E Testing

## Overview

Unified entry point for all E2E testing workflows. Replaces the former `/run-tests` and `/test-health` commands.

**Always Interactive**: This command shows a menu and asks what you want to do. No flags for mode selection.

## Usage

```
/e2e
```

## What It Does

1. **Detects existing repair sessions** and offers to resume
2. **Shows interactive menu** with three options:
   - `run` - Run tests interactively (shows results, asks before fixes)
   - `loop` - Start autonomous repair loop (hands-off until complete)
   - `health` - View test suite health dashboard

## When to Use

| Scenario | Mode |
|----------|------|
| Quick test run before PR | `run` |
| Debugging specific failures | `run` |
| Fixing a broken test suite | `loop` |
| Full autonomous repair | `loop` |
| Understanding current state | `health` |
| Checking what's quarantined | `health` |

## Key Features

### Session Detection
Automatically detects `.agent-os/e2e-repair/handoff.json` and offers to resume previous sessions.

### Loop Mode (Autonomous)
- Build -> Test -> Analyze -> Fix -> Repeat
- Max 3 attempts per root cause before quarantine
- Supervisor -> PM -> Subagent architecture
- Automatic checkpointing at 85% context

### Health Dashboard
- Tier breakdown (smoke/core/regression/quarantine)
- Recent run results
- Flakiness report
- Actionable recommendations

## Instructions

@.agent-os/instructions/core/e2e.md
