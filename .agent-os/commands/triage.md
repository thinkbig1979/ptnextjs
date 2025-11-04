---
description: Interactive triage workflow for processing findings from quality validation and code reviews
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Triage Command

## Overview

Present findings, decisions, or issues one by one for interactive triage to determine which items should be tracked as actionable todos in the Agent OS system.

**Use this when:**
- Processing findings from quality validation (validate-quality.md)
- Triaging code review findings
- Processing security audit results
- Categorizing performance analysis findings
- Converting any categorized findings into actionable todos

**Key Features**:
- Interactive decision-making (yes/next/custom)
- Pause/resume capability for long triage sessions
- Automatic state persistence after each decision
- Progress tracking with time estimation
- Dynamic time estimation based on actual triage speed
- Session summaries with effort breakdown

**Important**: Triage is for decision-making only - no implementation work during triage!

Refer to the instructions located in this file:
@.agent-os/instructions/core/triage.md
