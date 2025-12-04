# Agent OS Instructions

This directory contains instruction files that guide Claude through workflow phases.

## Directory Structure

| Directory | Files | Purpose |
|-----------|-------|---------|
| `core/` | 13 files | Main workflow definitions |
| `agents/` | 29 files | Phase-specific guidance (NOT callable agents) |
| `utilities/` | 8 files | Tool and integration guides |
| `validation/` | 2 files | Validation protocols |
| `meta/` | 2 files | Meta-level guidance |

## How Instructions Are Used

1. Claude loads instruction files based on current workflow phase
2. Instructions provide context, rules, and examples
3. One agent follows multiple instruction files sequentially

## Important Note

**Files in `agents/` are NOT callable Claude Code agents.**

They are instruction documents loaded by the general-purpose agent to guide behavior during specific workflow phases.

See: [docs/GLOSSARY.md](../docs/GLOSSARY.md) for terminology.

## Quick Reference

### Core Workflows
| File | Purpose |
|------|---------|
| `execute-task-orchestrated.md` | Main task execution flow |
| `create-spec.md` | Feature specification creation |
| `create-tasks.md` | Task breakdown |
| `validate-quality.md` | Quality validation |
| `validate-browser.md` | Browser testing |

### Phase Instructions (in `agents/`)
| File | Workflow Phase |
|------|----------------|
| `test-architect.md` | Test design phase |
| `implementation-specialist.md` | Implementation phase |
| `integration-coordinator.md` | Integration phase |
| `security-sentinel.md` | Security review phase |
| `quality-assurance.md` | Quality review phase |

### Utilities
| File | Purpose |
|------|---------|
| `beads-integration-guide.md` | Beads task tracking |
| `quality-hooks-guide.md` | Hook system usage |
| `tdd-validator.md` | TDD enforcement |

## Usage Example

When entering the test design phase:
```
Load and follow instructions from instructions/agents/test-architect.md
```

When entering implementation:
```
Load and follow instructions from instructions/agents/implementation-specialist.md
```

## See Also

- [agents/README.md](agents/README.md) - Execution role details
- [../docs/GLOSSARY.md](../docs/GLOSSARY.md) - Terminology
- [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) - System architecture
