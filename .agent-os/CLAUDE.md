---
version: 5.7.0
last-updated: 2026-02-08
related-files:
  - docs/GETTING_STARTED.md
  - docs/ARCHITECTURE.md
  - docs/FEATURES.md
---

# CLAUDE.md

Agent OS v5.7.0 - Structured workflows for AI agents to build products systematically.

## What is Agent OS?

A framework that guides AI agents through product development using specs, tasks, and orchestrated execution. It provides persistent memory via Beads, quality gates, and context-aware handoffs for complex multi-session work.

## Session Start: Check for Resume

**IMPORTANT**: At the start of every session, check for an existing session ledger:

```
IF .agent-os/session-ledger.md exists:
  READ the file
  DISPLAY:
    ═══════════════════════════════════════════════════════════
    SESSION LEDGER DETECTED
    ═══════════════════════════════════════════════════════════

    Task: [Task Context from ledger]
    Last Updated: [timestamp]
    Stopped At: [location from Handoff Context]
    Next Action: [next action from Handoff Context]

    Options:
    1. resume - Continue from where you left off
    2. new - Start fresh (archives current ledger)
    3. view - Show full ledger details
    ═══════════════════════════════════════════════════════════

  WAIT for user choice before proceeding

  IF resume:
    LOAD context from ledger
    BEGIN work from Next Action

  IF new:
    ARCHIVE: mv .agent-os/session-ledger.md .agent-os/ledgers/LEDGER-[name]-[date].md
    PROCEED with fresh session
```

## Project Structure

```
.claude/commands/   -> Slash commands (plan-product, create-spec, execute-tasks)
instructions/       -> Detailed workflow steps and agent guidance
standards/          -> Testing, code patterns, best practices
config.yml          -> Feature toggles and thresholds
```

## Core Workflow

1. **Plan**: `/plan-product` - Define product, install Agent OS
2. **Specify**: `/create-spec` - Create feature specifications
3. **Task**: `/create-tasks` - Break specs into executable tasks
4. **Execute**: `/run` or `/orchestrate` - Task execution (2-layer or 3-layer)
5. **Validate**: `/validate-browser` - Browser testing for web components

### Execution Modes

| Command | Layers | When to Use |
|---------|--------|-------------|
| `/run` | 2-layer (Orchestrator → Workers) | < 10 tasks, single session expected |
| `/run --quick` | 1-layer (direct) | Simple, immediate tasks |
| `/orchestrate` | 3-layer (Orchestrator → PM → Workers) | > 10 tasks, multi-session, complex dependencies |

## Agent Execution Model

### Callable Agents (use with Task tool)

| Agent | Purpose |
|-------|---------|
| `general-purpose` | Main execution for all tasks |
| `Explore` | Codebase analysis and context |
| `Plan` | Strategic planning |

### Workflow Phases (NOT callable - instruction files)

Load these with general-purpose: `Task(subagent_type: "general-purpose", prompt: "Read instructions/agents/test-design.md, then...")`

- `test-design` - Test design (RED phase)
- `test-execution` - Test running protocol
- `implementation-specialist` - Code implementation (GREEN phase)
- `security-sentinel` - Security review
- `pattern-guardian` - Pattern discovery and validation

## Beads Task Tracking

Git-backed persistent memory for multi-session work:

```bash
bd ready                              # Find unblocked tasks
bd update <task> --status=in_progress # Claim work
bd close <task>                       # Complete task
bd sync                               # Sync with git (always run at session end)
```

## Essential Commands

```bash
# Installation
~/.agent-os/setup/install-agent-os.sh    # Install in project
~/.agent-os/setup/install-hooks.sh       # Install quality hooks

# Task execution - 2-layer (Orchestrator → Workers)
/run                                     # Execute ready tasks
/run <SPEC_FOLDER>                       # Execute spec tasks
/run --quick                             # Direct execution (no orchestration)
/run --tasks "T1, T2"                    # Inline task list

# Task execution - 3-layer (Orchestrator → PM → Workers)
/orchestrate                             # Complex multi-session work
/orchestrate <SPEC_FOLDER>               # Execute spec with PM coordination
# Note: Session start auto-detects ledger for resume

# E2E Testing (unified command)
/e2e                                     # Interactive test+fix workflow
/e2e --auto                              # Auto-fix in priority order
/e2e --health                            # Quick smoke test check
/e2e --tier=core                         # Run specific tier

# Codebase Health (v5.7.0+)
/sweep                                   # Full sweep: analyze + safe fixes
/sweep --dry-run                         # Analysis only, no fixes
/sweep --category=types                  # Only TypeScript errors
/sweep --category=deps                   # Only unused dependencies
```

## Checklists

### Task Completion
- [ ] All deliverable files exist
- [ ] Tests pass (`pnpm test`, `pnpm test:e2e`)
- [ ] TypeScript compiles (`pnpm tsc --noEmit`)
- [ ] No P1 security findings
- [ ] `bd sync` run

### Test Creation
- [ ] Correct file location (unit vs e2e)
- [ ] Appropriate timeouts
- [ ] Real assertions (not `expect(true)`)
- [ ] No `.only()` left in code

## File References

Use `file:line` format for precision:
- Internal: `src/models/user.ts:42`
- Standards: `standards/testing-standards.md:150`

## Documentation

| Doc | Purpose |
|-----|---------|
| [Features](docs/FEATURES.md) | Detailed feature documentation |
| [Architecture](docs/ARCHITECTURE.md) | System design |
| [Getting Started](docs/GETTING_STARTED.md) | New user guide |
| [Testing Standards](standards/testing-standards.md) | Test writing reference |
| [Glossary](docs/GLOSSARY.md) | Terminology |
| [FAQ](docs/FAQ.md) | Common questions |
| [Troubleshooting](docs/TROUBLESHOOTING.md) | Issue resolution |
