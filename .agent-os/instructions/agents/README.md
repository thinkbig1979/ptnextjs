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
| Test Architect | `test-architect.md` | Test design and structure |
| Test Runner | `test-runner.md` | Test execution and results |
| Implementation | `implementation-specialist.md` | Feature implementation |
| Integration | `integration-coordinator.md` | System integration |
| Quality | `quality-assurance.md` | Code quality review |
| Security | `security-auditor.md` | Security analysis |
| Documentation | `documentation-generator.md` | Technical docs |

### Compound Engineering Review Phases
| Role | File | Purpose |
|------|------|---------|
| Security Sentinel | `security-sentinel.md` | OWASP/vulnerability scanning |
| Performance Oracle | `performance-oracle.md` | Performance analysis |
| Architecture Strategist | `architecture-strategist.md` | Design patterns |
| Pattern Recognition | `pattern-recognition-specialist.md` | Code patterns |
| Code Simplicity | `code-simplicity-reviewer.md` | Complexity reduction |
| Data Integrity | `data-integrity-guardian.md` | Data validation |

### Research Phases
| Role | File | Purpose |
|------|------|---------|
| Repo Research | `repo-research-analyst.md` | Codebase analysis |
| Best Practices | `best-practices-researcher.md` | External research |
| Framework Docs | `framework-docs-researcher.md` | Documentation research |
| Git History | `git-history-analyzer.md` | Version control analysis |

### Specialist Phases
| Role | File | Purpose |
|------|------|---------|
| Frontend Vue | `frontend-vue-specialist.md` | Vue.js development |
| Frontend React | `frontend-react-specialist.md` | React development |
| Backend Node.js | `backend-nodejs-specialist.md` | Node.js development |

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
┌────────────────────────────────────────────────────────┐
│         General-Purpose Agent Execution                 │
│                                                         │
│  1. Load test-architect.md → Design tests              │
│                    ↓                                    │
│  2. Load implementation-specialist.md → Write code     │
│                    ↓                                    │
│  3. Load integration-coordinator.md → Integrate        │
│                    ↓                                    │
│  4. Load security-sentinel.md → Security review        │
│                    ↓                                    │
│  5. Complete task                                       │
└────────────────────────────────────────────────────────┘
```

## See Also

- [../README.md](../README.md) - Instructions overview
- [../../docs/GLOSSARY.md](../../docs/GLOSSARY.md) - Terminology definitions
- [../../docs/FAQ.md](../../docs/FAQ.md) - Frequently asked questions
- [../../config.yml](../../config.yml) - Execution role configuration
