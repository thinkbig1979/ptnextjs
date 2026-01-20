# Agent OS Instructions

This directory contains instruction files that guide Claude through workflow phases.

## Directory Structure

| Directory | Files | Purpose |
|-----------|-------|---------|
| `core/` | 11 files | Main workflow definitions |
| `agents/` | 6 files | Phase-specific guidance (NOT callable agents) |
| `utilities/` | 16 files | Tool and integration guides |
| `meta/` | 2 files | Meta-level guidance |
| `references/` | 1 file | External reference documents |

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
| `execute-tasks.md` | Main task execution flow |
| `create-spec.md` | Feature specification creation |
| `create-tasks.md` | Task breakdown |
| `validate-quality.md` | Quality validation |
| `validate-browser.md` | Browser testing |

### Phase Instructions (in `agents/`)
| File | Workflow Phase |
|------|----------------|
| `test-design.md` | Test strategy and design (TDD RED) |
| `test-execution.md` | Test running protocol |
| `test-maintenance.md` | Existing test impact analysis |
| `implementation-specialist.md` | Implementation phase (TDD GREEN) |
| `security-sentinel.md` | Security review phase |
| `pattern-guardian.md` | Pattern discovery and validation |

### Utilities
| File | Purpose |
|------|---------|
| `beads-integration-guide.md` | Beads task tracking |
| `tdd-validator.md` | TDD enforcement |
| `test-execution-protocol.md` | Test execution steps |
| `quality-lenses.md` | Quality analysis techniques (Inversion, Pre-Mortem, Evolution) |

## Usage Example

When entering the test design phase:
```
Load and follow instructions from instructions/agents/test-design.md
```

When entering implementation:
```
Load and follow instructions from instructions/agents/implementation-specialist.md
```

## See Also

- [agents/README.md](agents/README.md) - Execution role details
- [../docs/GLOSSARY.md](../docs/GLOSSARY.md) - Terminology
- [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) - System architecture
