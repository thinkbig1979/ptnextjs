---
version: 5.1.0
last-updated: 2026-01-02
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
- `test-architect` is NOT a callable agent type
- You cannot use `Task(subagent_type: "test-architect")`

## Correct Usage

```javascript
// WRONG - will fail with "Agent type not found"
Task(subagent_type: "test-architect", prompt: "...")

// CORRECT - load instructions via general-purpose agent
Task(subagent_type: "general-purpose",
     prompt: "Load and follow instructions from instructions/agents/test-architect.md...")
```

## Available Execution Roles

### Development Phases
| Role | File | Purpose |
|------|------|---------|
| Test Architect | `test-architect.md` | Test design and TDD RED phase |
| Test Runner | `test-runner.md` | Test execution and monitoring |
| Test Context Gatherer | `test-context-gatherer.md` | Pre-test library research |
| Test Integrity Analyzer | `test-integrity-analyzer.md` | Proactive test impact analysis |
| Implementation Specialist | `implementation-specialist.md` | Feature implementation (TDD GREEN) |
| Security Sentinel | `security-sentinel.md` | Security review and OWASP scanning |

### Pattern & Quality
| Role | File | Purpose |
|------|------|---------|
| Pattern Discovery Analyst | `pattern-discovery-analyst.md` | Codebase pattern analysis |
| Pattern Consistency Validator | `pattern-consistency-validator.md` | Pattern enforcement |

## YAML Frontmatter Format

All files should use this consistent format:

```yaml
---
# EXECUTION ROLE DEFINITION
# This file provides guidance for a workflow phase.
# It is NOT a callable Claude Code agent.
#
# Usage: The general-purpose agent loads this file when
# entering the specified phase of task execution.

role: role-name
description: "Brief description of this phase"
phase: phase_identifier
context_window: 16384
version: 2.0
encoding: UTF-8
---
```

## How Phases Work

```
+--------------------------------------------------------+
|         General-Purpose Agent Execution                 |
|                                                         |
|  1. Load test-context-gatherer.md -> Research libs      |
|                    |                                    |
|  2. Load test-architect.md -> Design tests (RED)        |
|                    |                                    |
|  3. Load implementation-specialist.md -> Write code     |
|                    |                                    |
|  4. Load security-sentinel.md -> Security review        |
|                    |                                    |
|  5. Complete task                                       |
+--------------------------------------------------------+
```

## See Also

- [../README.md](../README.md) - Instructions overview
- [../../docs/GLOSSARY.md](../../docs/GLOSSARY.md) - Terminology definitions
- [../../docs/FAQ.md](../../docs/FAQ.md) - Frequently asked questions
- [../../config.yml](../../config.yml) - Execution role configuration
