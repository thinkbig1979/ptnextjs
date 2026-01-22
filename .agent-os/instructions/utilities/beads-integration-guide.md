# Beads Integration Guide

Git-backed task tracking for persistent agent memory across sessions.

## Why Beads?

| Problem | Solution |
|---------|----------|
| Context window amnesia | Tasks survive sessions |
| Manual dependency resolution | `bd ready` finds unblocked work |
| Lost progress | Persistent state tracking |
| Multi-agent conflicts | Git-backed with hash IDs |

## Hybrid Architecture

| Feature | Markdown (tasks.md) | Beads (.beads/) |
|---------|---------------------|-----------------|
| Acceptance criteria | ✅ Rich detail | ❌ Text-only |
| Dependencies | ❌ Manual | ✅ Auto visualization |
| Ready detection | ❌ Manual scan | ✅ `bd ready` |
| Cross-session | ❌ Context limited | ✅ Persistent |

**Approach:** Markdown for specs, Beads for execution state.

## Data Flow

```
create-tasks.md → tasks.md + tasks/*.md
                         ↓
              sync-tasks-to-beads.sh
                         ↓
              .beads/issues.jsonl
                         ↓
                    bd ready
                         ↓
            execute-tasks.md
                         ↓
                 bd update/close
                         ↓
                     bd sync
```

## Configuration

```yaml
# config.yml
beads:
  enabled: true
  mode: "hybrid"
  auto_sync: true
  create_beads_from_tasks_md: true
```

## Essential Commands

```bash
# Query
bd ready                    # Unblocked tasks
bd list                     # All tasks
bd list --status in_progress
bd show <id>                # Task details

# Create
bd create "Title" -p 1 -t task

# Update
bd update <id> --status in_progress

# Complete
bd close <id> --reason "Done"

# Dependencies
bd dep add <dependent> <blocker> --type blocks
bd dep tree <id>

# Sync (CRITICAL at session end!)
bd sync
```

## Integration Points

### Task Creation (create-tasks.md Step 2.5)
```bash
~/.agent-os/setup/sync-tasks-to-beads.sh .agent-os/specs/my-feature
```

### Task Execution (execute-tasks.md)

**Step 0.2 - Query ready work:**
```bash
bd ready --json
```

**Step 0.3 - Claim task:**
```bash
bd update <id> --status in_progress
```

**Step 99 - Complete:**
```bash
bd close <id> --reason "Criteria met"
bd sync
```

### Discovered Work
```bash
bd create "Fix edge case" --deps "discovered-from:impl-comp1"
```

### Resume Session
```bash
bd list --status in_progress
```

## MCP Integration (Claude Code)

```javascript
await mcp__beads__ready()
await mcp__beads__create({ title: "...", priority: 1, type: "task" })
await mcp__beads__update({ id: "...", status: "in_progress" })
await mcp__beads__close({ id: "...", reason: "Done" })
await mcp__beads__sync()
```

## Worktree Compatibility

```bash
# Disable daemon in worktrees
export BEADS_NO_DAEMON=1
bd ready --no-daemon
```

## Audit Trail

The audit trail creates persistent records of significant decisions, discoveries, and learnings during task execution. This provides valuable context for future sessions and project understanding.

### Audit Types

| Type | When to Use | Example |
|------|-------------|---------|
| `decision` | Before major implementation choices | Choosing architecture patterns, libraries, approaches |
| `discovery` | When finding relevant existing code | Locating reusable modules, existing patterns |
| `blocker` | When encountering obstacles | Missing config, dependencies, user input needed |
| `learning` | After learning something important | Codebase conventions, undocumented behavior |
| `risk` | When identifying potential issues | Breaking changes, performance concerns |
| `assumption` | When making assumptions | About requirements, environment, behavior |

### Commands

```bash
# Add audit entries
bd audit add --type=decision --text="Chose JWT over sessions for stateless scaling"
bd audit add --type=discovery --text="Found existing auth middleware in src/auth/middleware.ts"
bd audit add --type=blocker --text="Missing DATABASE_URL env var - need user input"
bd audit add --type=learning --text="Next.js middleware runs on edge runtime"
bd audit add --type=risk --text="Large refactor may affect upstream consumers"
bd audit add --type=assumption --text="Assuming PostgreSQL based on connection string format"

# View audit trail
bd audit list
bd audit list --type=decision
bd audit list --since=today
```

### When to Audit

**ALWAYS audit:**
- Major architectural decisions
- Discovered existing code that affects implementation
- Blockers that require user intervention
- Important learnings about the codebase

**Consider auditing:**
- Trade-offs considered but not chosen
- Assumptions about undocumented behavior
- Risks identified during implementation
- Workarounds for limitations

### Integration Points

**During Task Execution (execute-tasks.md):**
- Decision point before major implementation choices
- Discovery logging when finding relevant existing code
- Blocker recording when stuck

**During PM Delegation (run.md):**
- PM subagents record significant decisions with rationale
- Unexpected discoveries are logged
- Blockers and resolutions are tracked

### Example Workflow

```bash
# 1. Starting a task - check existing patterns
bd audit add --type=discovery --text="Found UserService pattern in src/services/user.ts"

# 2. Making an implementation decision
bd audit add --type=decision --text="Using existing UserService over new implementation - maintains consistency"

# 3. Encountering a blocker
bd audit add --type=blocker --text="Missing DATABASE_URL env var - awaiting user input"

# 4. Learning something about the codebase
bd audit add --type=learning --text="Project uses Zod for validation, not Yup"

# 5. Identifying a risk
bd audit add --type=risk --text="This change affects 5 downstream consumers - need to verify compatibility"

# 6. Session end - sync includes audit trail
bd sync
```

## Gates (Async Workflow Coordination)

Gates block workflow progression until external conditions are met. Use gates when work cannot continue until an approval, external process, or dependent task completes.

### Gate Types

| Type | Purpose | Use Case |
|------|---------|----------|
| `human` | Manual approval required | Security review, deployment approval |
| `timer` | Time-based expiry | Scheduled deployments, cooldown periods |
| `gh:run` | Wait for GitHub workflow | CI pipeline completion |
| `gh:pr` | Wait for PR merge | Dependency on another PR |
| `bead` | Wait for another bead to close | Cross-task dependencies |

### Gate Commands

```bash
# Create gates
bd gate create --type=human --title="Security review required"
bd gate create --type=timer --duration=1h --title="Deployment cooldown"
bd gate create --type=gh:run --await="test-suite" --title="CI must pass"
bd gate create --type=gh:pr --await="#123" --title="Merge dependency PR"
bd gate create --type=bead --await="other-task-id" --title="Wait for auth module"

# Query gates
bd gate list                      # All pending gates
bd gate list --type=human         # Human approval gates only
bd gate show <gate-id>            # Gate details

# Resolve gates
bd gate resolve <gate-id>                        # Resolve (human gates)
bd gate resolve <gate-id> --approved             # Explicit approval
bd gate resolve <gate-id> --rejected --reason="Security concerns"

# Check gate status
bd gate status <gate-id>          # Check if gate is open/closed
bd gate blocked                   # Show tasks blocked by gates
```

### Gate Use Cases in Agent OS

#### 1. Security Review Gate

Block deployment until security-sentinel approves:

```bash
# After implementation, before deployment
bd gate create --type=human \
  --title="Security review required for ${TASK_ID}" \
  --assigned="security-sentinel"

# Security sentinel runs review, then:
bd gate resolve ${GATE_ID} --approved --note="No P1 issues found"
```

#### 2. CI Gate

Wait for tests to pass before proceeding:

```bash
# After pushing changes
bd gate create --type=gh:run \
  --await="test-suite" \
  --title="CI must pass for ${BRANCH}"

# Gate auto-resolves when workflow completes successfully
# Or manually check:
bd gate status ${GATE_ID}
```

#### 3. Cross-Task Gate

Wait for dependent task in another spec:

```bash
# Task B depends on Task A completing
bd gate create --type=bead \
  --await="${TASK_A_ID}" \
  --title="Waiting for auth module completion"

# Gate auto-resolves when TASK_A closes
```

#### 4. Deployment Cooldown Gate

Time-based gate for staged rollouts:

```bash
# After deploying to staging
bd gate create --type=timer \
  --duration=2h \
  --title="Staging observation period"

# Gate auto-resolves after 2 hours
```

#### 5. PR Dependency Gate

Wait for another PR to merge:

```bash
# Feature depends on infrastructure PR
bd gate create --type=gh:pr \
  --await="#456" \
  --title="Wait for infra PR to merge"

# Gate auto-resolves when PR #456 merges
```

### Gate Integration Points

**Phase 1.5 (Test Integrity Analysis):**
- Create security gate if changes affect authentication/authorization
- Gate blocks Phase 2 until security review completes

**Phase 2 (Parallel Execution):**
- Check gates before starting each wave
- Skip gated tasks, continue with non-gated work
- Report gate status in wave completion

**Phase 4 (Post-Execution):**
- Create deployment gate if production changes detected
- Security review gate for sensitive code paths
- CI gate only if CI is configured (`.github/workflows/` exists) AND `require_ci_gate: true`

### Gate Status in Task Execution

When `bd ready` returns tasks, gates are automatically checked:

```bash
# bd ready output includes gate status
{
  "id": "task-123",
  "title": "Deploy feature",
  "status": "ready",
  "gates": [
    {"id": "gate-456", "type": "human", "status": "pending", "title": "Security review"}
  ]
}

# Tasks with pending gates show as blocked
bd blocked --include-gates
```

### Gate Resolution Workflow

```
WHEN gate encountered:
  1. CHECK: Gate type

  IF type == "human":
    NOTIFY: Assigned reviewer or user
    DISPLAY: "Gate ${GATE_ID} requires manual approval"
    WAIT: User resolves gate
    CONTINUE: After resolution

  IF type == "timer":
    DISPLAY: "Gate ${GATE_ID} expires in ${DURATION}"
    CHECKPOINT: Save state
    OPTION: Wait or defer task

  IF type == "gh:run" OR type == "gh:pr":
    DISPLAY: "Gate ${GATE_ID} waiting for GitHub"
    CHECKPOINT: Save state
    POLL: Check status periodically
    CONTINUE: When GitHub event resolves

  IF type == "bead":
    DISPLAY: "Gate ${GATE_ID} waiting for ${BEAD_ID}"
    CONTINUE: Work on non-blocked tasks
    RESUME: When dependent bead closes
```

### Gate Templates

**Security Review Gate:**
```bash
bd gate create --type=human \
  --title="Security review: ${FEATURE_NAME}" \
  --assigned="security-sentinel" \
  --context="Review for: SQL injection, XSS, auth bypass, data exposure"
```

**Production Deployment Gate:**
```bash
bd gate create --type=human \
  --title="Production deployment approval" \
  --requires="ci-pass,staging-verified,security-approved"
```

**CI Pipeline Gate:**
```bash
bd gate create --type=gh:run \
  --await="ci" \
  --branch="${BRANCH}" \
  --title="All CI checks must pass"
```

## Best Practices

1. **Always sync at session end:** `bd sync`
2. **Use --json for scripts:** `bd ready --json`
3. **Quote titles:** `bd create "Fix bug"`
4. **Link discovered work:** `--deps "discovered-from:parent-id"`
5. **Check ready work first:** `bd ready` before asking "what's next?"
6. **Use gates for external dependencies:** Don't poll manually, create gates

## Activity Feed

The activity feed provides real-time visibility into bead mutations, essential for debugging multi-session work and understanding task history.

### Basic Commands

```bash
bd activity                    # Last 100 events
bd activity --follow           # Real-time streaming
bd activity --mol bd-x7k       # Filter by task ID
bd activity --since 5m         # Recent events (5 minutes)
bd activity --since 24h        # Last 24 hours
bd activity --type update      # Only updates
bd activity --limit 20         # Limit output
bd activity --town             # Include all agents in workspace
```

### Event Symbols

| Symbol | Meaning |
|--------|---------|
| `+` | Created |
| `→` | In progress |
| `✓` | Completed |
| `✗` | Failed |
| `⊘` | Deleted |

### Use Cases

#### 1. Session Start Context

At the beginning of a session, check recent activity to understand what happened:

```bash
bd activity --since 24h --limit 20
```

This shows:
- Which tasks were worked on
- What succeeded or failed
- Who (which agent) made changes

#### 2. Debugging Failed Sessions

When a previous session ended unexpectedly or left tasks incomplete:

```bash
# View all events for a specific task
bd activity --mol bd-123

# Filter to just status updates
bd activity --mol bd-123 --type update

# See what happened in the last hour
bd activity --since 1h
```

#### 3. Multi-Agent Visibility

When multiple agents are working in parallel:

```bash
# Real-time monitoring of all activity
bd activity --follow --town

# Check what happened across all agents
bd activity --town --since 30m
```

#### 4. Tracing Task History

To understand the full lifecycle of a task:

```bash
# All events for a task from creation to completion
bd activity --mol bd-456

# Combine with show for full context
bd show bd-456
bd activity --mol bd-456
```

### Debugging Patterns

#### Pattern: Understand Why Task Is Stuck

```bash
# 1. Check current status
bd show <task-id>

# 2. View history to find when/why it stopped
bd activity --mol <task-id>

# 3. Check for blockers
bd dep tree <task-id>
bd gate blocked
```

#### Pattern: Resume After Crash

```bash
# 1. Find in-progress tasks
bd list --status in_progress

# 2. Check what was happening before crash
bd activity --since 1h

# 3. Review specific task history
bd activity --mol <task-id>

# 4. Resume or reset as needed
bd update <task-id> --status pending  # Reset if needed
```

#### Pattern: Audit Multi-Session Work

```bash
# View all activity over multiple days
bd activity --since 7d

# Filter by type to see completions
bd activity --since 7d --type close

# Export for review
bd activity --since 7d --json > activity-log.json
```

#### Pattern: Monitor Parallel Agent Work

```bash
# In one terminal, stream all activity
bd activity --follow --town

# This shows real-time updates as agents:
# - Claim tasks (→)
# - Complete work (✓)
# - Encounter failures (✗)
```

### Integration with Session Ledger

The activity feed complements the session ledger:

| Purpose | Tool |
|---------|------|
| Resume exact work state | Session ledger |
| Understand what happened | Activity feed |
| Debug failures | Activity feed |
| Multi-agent coordination | Activity feed |

### Best Practices

1. **Check activity at session start:** `bd activity --since 24h --limit 20`
2. **Use --mol for task-specific debugging:** `bd activity --mol <id>`
3. **Stream during parallel work:** `bd activity --follow --town`
4. **Combine with other commands:** Use `bd show` + `bd activity` for full context

## Agent State Tracking

Agent state tracking provides visibility into subagent lifecycle during orchestrated execution. This enables monitoring, debugging stuck agents, and understanding multi-agent coordination.

### Agent States

| State | Meaning | When Set |
|-------|---------|----------|
| `idle` | Agent exists but not working | Initial state |
| `spawning` | Agent being created | Before Task() call |
| `running` | Agent started, loading context | Task() started |
| `working` | Agent actively executing | During task work |
| `stuck` | Agent not progressing | After timeout without heartbeat |
| `done` | Agent completed successfully | Task completed |
| `stopped` | Agent stopped gracefully | PreCompact or checkpoint |
| `dead` | Agent terminated unexpectedly | Error or crash |

### Agent Naming Convention

Agents are named by role and session context:

```
Format: {project}-{role}-{session}

Examples:
  aos-supervisor-001          # Main supervisor
  aos-pm-wave1                # PM for wave 1
  aos-impl-task123            # Implementation specialist for task
  aos-test-task456            # Test architect for task
  aos-security-pr789          # Security sentinel for PR review
```

### Commands

```bash
# Set agent state
bd agent state ${AGENT_ID} spawning
bd agent state ${AGENT_ID} working
bd agent state ${AGENT_ID} done

# Heartbeat (during long work)
bd agent heartbeat ${AGENT_ID}

# View agents
bd agent show                        # All agents
bd agent show ${AGENT_ID}            # Specific agent
bd agent list --state=working        # Filter by state
bd agent list --stuck                # Find stuck agents
```

### Integration Points

#### Supervisor Orchestration (run.md)

When spawning PM subagents:

```bash
# 1. Before spawning PM
AGENT_ID="aos-pm-wave${WAVE_NUMBER}"
bd agent state ${AGENT_ID} spawning

# 2. PM starts work
# (PM does this internally)
bd agent state ${AGENT_ID} working

# 3. PM sends heartbeat every 10 tool calls
bd agent heartbeat ${AGENT_ID}

# 4. PM completes
bd agent state ${AGENT_ID} done
```

#### Subagent Delegation Template

Include in delegation prompt:

```
═══════════════════════════════════════════════════════════
AGENT STATE PROTOCOL
═══════════════════════════════════════════════════════════

AGENT_ID: ${AGENT_ID}

ON START:
  bd agent state ${AGENT_ID} working

DURING WORK (every 10 tool calls):
  bd agent heartbeat ${AGENT_ID}

ON COMPLETE:
  bd agent state ${AGENT_ID} done

ON STOP (checkpoint):
  bd agent state ${AGENT_ID} stopped
```

#### Execute Tasks (execute-tasks.md)

Phase 2 parallel execution:

```bash
FOR task in wave:
  AGENT_ID="aos-${ROLE}-${TASK_ID}"
  bd agent state ${AGENT_ID} spawning

  Task(subagent_type: "general-purpose", ...)

  # On response
  IF STATUS == "completed":
    bd agent state ${AGENT_ID} done
  ELIF STATUS == "stopped_at_checkpoint":
    bd agent state ${AGENT_ID} stopped
  ELIF STATUS == "blocked":
    bd agent state ${AGENT_ID} stuck
```

### Monitoring Patterns

#### Detect Stuck Agents

```bash
# Find agents that haven't sent heartbeat in 5 minutes
bd agent list --stuck --since 5m

# Get details on stuck agent
bd agent show ${AGENT_ID}
bd activity --mol ${RELATED_TASK_ID}
```

#### Multi-Agent Dashboard

```bash
# Real-time agent status
bd agent list --watch

# Combined with activity
bd agent list && bd activity --since 10m
```

#### Debugging Failed Sessions

```bash
# 1. Check agent states
bd agent list

# 2. Find dead/stuck agents
bd agent list --state=dead
bd agent list --state=stuck

# 3. Correlate with tasks
bd show ${RELATED_TASK_ID}
bd activity --mol ${RELATED_TASK_ID}
```

### Best Practices

1. **Set state at transitions:** Always update state when agent lifecycle changes
2. **Regular heartbeats:** Every 10 tool calls during long work
3. **Use meaningful IDs:** Include role and task context in agent ID
4. **Check stuck agents:** Before spawning new work, check for stuck agents
5. **Clean up on exit:** Set `done` or `stopped` before agent exits

## Swarm Management

For parallel agent coordination, see [Swarm Management Guide](../../Supporting-Docs/beads/swarm-management.md).

Quick reference:
```bash
bd swarm create <epic-id>      # Create swarm for parallel work
bd swarm status <epic-id>      # View progress by state
bd swarm validate <epic-id>    # Check structure before swarming
bd swarm list                  # List all active swarms
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Daemon conflicts (worktrees) | `export BEADS_NO_DAEMON=1` |
| Changes not in git | `bd sync` |
| Circular dependencies | `bd dep cycles`, then `bd dep remove` |
| Stale tasks | `bd stale --days 30` |
