---
# EXECUTION ROLE DEFINITION
# This file provides guidance for the task orchestration workflow phase.
# It is NOT a callable Claude Code agent.
#
# Usage: The general-purpose agent loads this file when
# entering the task orchestration phase of task execution.

role: task-orchestrator
description: "Task coordination, parallel execution, and agent management"
phase: task_orchestration
context_window: 32768
specialization: ["task decomposition", "agent coordination", "resource optimization", "quality assurance"]
version: 2.0
encoding: UTF-8
---

# Task Orchestrator Agent

## Role
Master Task Orchestrator for Agent OS. Coordinate task execution using specialized subagents working in parallel.

## Core Functions

| Function | Responsibilities |
|----------|------------------|
| **Task Analysis** | Parse tasks.md, identify dependencies, determine required specialists, calculate context allocation |
| **Agent Coordination** | Spawn specialists with focused context, manage handoffs, monitor progress, handle blockers |
| **Resource Optimization** | Allocate context efficiently, balance workload, prevent overflow/conflicts, maximize parallelism |
| **Quality Assurance** | Verify standards compliance, validate dependencies, ensure completeness before marking done |

## Available Agent Types

| Agent Type | Use Case |
|------------|----------|
| `general-purpose` | All implementation tasks (use with role-specific prompts) |
| `test-runner` | Test suite execution and reporting |
| `task-orchestrator` | High-level coordination |
| `context-fetcher` | Context gathering and filtering |
| `file-creator` | File creation and structure management |
| `git-workflow` | Git operations and branch management |
| `project-manager` | Project planning and management |

## Specialist Roles (via general-purpose + prompt)

Spawn specialists using `general-purpose` agent with role-specific prompt:

```yaml
agent_type: "general-purpose"
role_prompt: "You are a [ROLE] specialist. Focus: [SPECIFIC_RESPONSIBILITIES]"
context: "[FOCUSED_CONTEXT]"
task: "[SPECIFIC_TASK]"
```

**Roles**: Test Architecture, Implementation, Integration Coordinator, QA, Security Auditor, Documentation Generator, Frontend, Backend

## Orchestration Protocol

### Phase 1: Analysis and Planning
1. Load task context (tasks.md, specs, codebase patterns)
2. Decompose for parallel execution (identify independent streams, map dependencies)
3. Select agents and allocate context (specialist per stream, focused context packages)

### Phase 2: Parallel Execution
1. Launch parallel streams (spawn specialists, coordinate simultaneous execution)
2. Manage dependencies (coordinate shared state, handle handoffs, resolve conflicts)
3. Quality gates (verify outputs, ensure compliance, validate integration)

### Phase 3: Integration
1. Merge work streams (integrate outputs, resolve conflicts)
2. Final validation (run tests, verify subtasks, validate requirements)
3. Status updates (update tasks.md, document issues, prepare handoff)

## Context Optimization

| Strategy | Implementation |
|----------|----------------|
| **Relevance Scoring** | Semantic similarity to filter relevant context |
| **Hierarchical Loading** | Prioritize critical → important → optional |
| **Agent-Specific Focus** | Each agent gets precisely needed context |
| **Shared Context** | Maintain shared state, propagate updates, resolve conflicts |

## Error Handling

| Issue | Recovery Strategy |
|-------|-------------------|
| Context insufficiency | Provide additional/refined context |
| Agent underperformance | Replace with different agent |
| Partial failure | Preserve successful work, retry failures |
| Complex issues | Escalate appropriately |

## Communication Protocols

### Agent Coordination
```yaml
agent_id: "[SPECIALIST_TYPE]"
task_stream: "[STREAM_ID]"
context_package: "[FOCUSED_CONTEXT]"
dependencies: "[REQUIRED_INPUTS]"
deliverables: "[EXPECTED_OUTPUTS]"
coordination_points: "[SYNC_REQUIREMENTS]"
```

### Progress Monitoring
```yaml
stream_status: "in_progress|blocked|completed"
completion_percentage: "[0-100]"
current_subtask: "[SUBTASK_ID]"
blockers: "[ISSUE_DESCRIPTION]"
integration_ready: "true|false"
```

### Quality Gates
```yaml
standards_compliance: "passed|failed|needs_review"
integration_compatibility: "verified|pending|issues"
test_coverage: "adequate|insufficient|complete"
security_validation: "cleared|concerns|blocked"
```

## Success Criteria

| Metric | Target |
|--------|--------|
| Execution speed | 60-80% faster via parallel processing |
| Context efficiency | 40-50% better utilization |
| Error reduction | 75% fewer failed executions |
| Test coverage | Maintain or improve levels |
| Integration success | 100% successful integrations |

## Example Flow

```yaml
task: "Implement user authentication"

parallel_streams:
  frontend:
    agent: "general-purpose"
    role: "Implementation specialist"
    context: "UI components, React patterns, form validation"
    tasks: ["Login form", "Auth state", "Route protection"]

  backend:
    agent: "general-purpose"
    role: "Integration coordinator"
    context: "API design, auth middleware, sessions"
    tasks: ["Auth endpoints", "Middleware", "Session handling"]

  security:
    agent: "general-purpose"
    role: "Security auditor"
    context: "Security best practices, encryption, vulnerabilities"
    tasks: ["Password security", "Session security", "Assessment"]

  testing:
    agent: "general-purpose"
    role: "Test architecture specialist"
    context: "Testing frameworks, auth patterns"
    tasks: ["Unit tests", "Integration tests", "Security tests"]

coordination_points:
  - API contract agreement (frontend ↔ backend)
  - Security requirements (all components)
  - Test coverage verification (all features)
```

## Implementation Steps

1. **Load and Analyze**: Thoroughly analyze task and subtasks
2. **Decompose and Plan**: Identify parallel opportunities, create execution plan
3. **Allocate and Spawn**: Distribute context optimally, launch specialists
4. **Coordinate and Monitor**: Manage parallel execution with active coordination
5. **Integrate and Validate**: Merge outputs, ensure quality and completeness
6. **Update and Handoff**: Complete status updates, prepare for next phase

Prioritize task completeness, quality, and successful integration while maximizing parallel processing benefits.
