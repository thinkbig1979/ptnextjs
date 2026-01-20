---
version: 5.2.0
last-updated: 2026-01-17
related-files:
  - docs/GLOSSARY.md
---

# Execution Role Instructions

## Important: These Are NOT Callable Agents

The files in this directory are **instruction documents**, not callable Claude Code agent definitions.

### Correct Understanding
- Each file provides guidance for a **workflow phase**
- The **general-purpose** agent loads these as needed
- They document context, rules, and best practices for each phase

### Incorrect Understanding
- These are NOT separate agents you can invoke
- `test-design` is NOT a callable agent type
- You cannot use `Task(subagent_type: "test-design")`

## Correct Usage

```javascript
// WRONG - will fail with "Agent type not found"
Task(subagent_type: "test-design", prompt: "...")

// CORRECT - load instructions via general-purpose agent
Task(subagent_type: "general-purpose",
     prompt: "Load and follow instructions from instructions/agents/test-design.md...")
```

## Available Execution Roles

### Testing Phases
| Role | File | Purpose |
|------|------|---------|
| Test Design | `test-design.md` | Test strategy, framework research, TDD RED phase |
| Test Execution | `test-execution.md` | Test running protocol (direct by main agent) |
| Test Maintenance | `test-maintenance.md` | Pre-implementation test impact analysis |

### Development Phases
| Role | File | Purpose |
|------|------|---------|
| Implementation Specialist | `implementation-specialist.md` | Feature implementation (TDD GREEN) |
| Security Sentinel | `security-sentinel.md` | Security review and OWASP scanning |

### Pattern & Quality
| Role | File | Purpose |
|------|------|---------|
| Pattern Guardian | `pattern-guardian.md` | Pattern discovery and consistency validation |

## How Phases Work

```
+--------------------------------------------------------+
|         General-Purpose Agent Execution                 |
|                                                         |
|  1. Load pattern-guardian.md (discovery) → Get patterns |
|                    |                                    |
|  2. Load test-design.md → Design tests (RED)            |
|                    |                                    |
|  3. Load implementation-specialist.md → Write code      |
|                    |                                    |
|  4. Load test-execution.md → Run tests                  |
|                    |                                    |
|  5. Load security-sentinel.md → Security review         |
|                    |                                    |
|  6. Load pattern-guardian.md (validation) → Verify      |
|                    |                                    |
|  7. Complete task                                       |
+--------------------------------------------------------+
```

## YAML Frontmatter Format

All files use this consistent format:

```yaml
---
role: role-name
description: "Brief description of this phase"
phase: phase_identifier
context_window: 16384
version: 5.2.0
encoding: UTF-8
---
```

## See Also

- [../README.md](../README.md) - Instructions overview
- [../../docs/GLOSSARY.md](../../docs/GLOSSARY.md) - Terminology definitions
- [../../docs/FAQ.md](../../docs/FAQ.md) - Frequently asked questions
- [../../config.yml](../../config.yml) - Execution role configuration
