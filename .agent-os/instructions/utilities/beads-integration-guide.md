# Beads Integration Guide for Agent OS

## Overview

Beads provides distributed, git-backed task tracking that persists across sessions, enabling true "agent memory" without context window limitations. Agent OS v2.8+ uses a **hybrid architecture** combining markdown specifications with Beads execution state.

## Why Beads?

### Problems Solved

1. **Context Window Amnesia**: Tasks survive session boundaries and context loss
2. **Manual Dependency Resolution**: Automatic "ready work" detection via `bd ready`
3. **Lost Progress**: Persistent state tracking across interruptions
4. **Multi-Agent Conflicts**: Git-backed JSONL with hash IDs prevents collisions
5. **Discovered Work Tracking**: Issues found during implementation automatically linked

### Hybrid Architecture Benefits

| Feature | Markdown (tasks.md) | Beads (.beads/issues.jsonl) | Combined Benefit |
|---------|---------------------|------------------------------|------------------|
| Acceptance Criteria | ✅ Rich detail | ❌ Text-only | Best of both |
| Dependency Graph | ❌ Manual list | ✅ Auto visualization | Automatic |
| Ready Work Detection | ❌ Manual scan | ✅ `bd ready` | Instant |
| Cross-Session State | ❌ Context limited | ✅ Persistent SQLite | Permanent |
| Human Readability | ✅ Excellent | ❌ JSON format | Markdown wins |
| Implementation Specs | ✅ Code examples | ❌ Limited | Keep markdown |

**Conclusion:** Markdown for specifications, Beads for execution state.

---

## Architecture

### Data Flow

```
┌─────────────────────────────────────────────────┐
│  create-tasks.md                                │
│  ↓                                              │
│  Generate tasks.md + tasks/*.md (specs)        │
│  ↓                                              │
│  sync-tasks-to-beads.sh (automatic)            │
│  ↓                                              │
│  .beads/issues.jsonl (execution state)         │
│  ↓                                              │
│  bd ready → find unblocked work                │
│  ↓                                              │
│  execute-task-orchestrated.md                  │
│  ↓                                              │
│  bd update/close (track progress)              │
│  ↓                                              │
│  bd sync → commit to git                       │
└─────────────────────────────────────────────────┘
```

### File Structure

```
your-project/
├── .agent-os/
│   ├── specs/
│   │   └── my-feature/
│   │       ├── tasks.md              # Master task list (human-readable)
│   │       └── tasks/
│   │           ├── task-pre-1.md     # Detailed specs
│   │           ├── task-impl-1.md
│   │           └── ...
│   └── ...
├── .beads/
│   ├── issues.jsonl                  # Source of truth (committed)
│   ├── workspace.db                  # SQLite cache (gitignored)
│   └── .worktree-metadata           # Worktree tracking
└── .gitignore                        # Includes .beads/*.db
```

---

## Integration Points

### 1. Task Creation (create-tasks.md)

**Step 2.5: Automatic Beads Sync**

After generating tasks.md and detail files, Agent OS automatically syncs to Beads:

```bash
# Automatic sync script called from create-tasks.md
~/.agent-os/setup/sync-tasks-to-beads.sh .agent-os/specs/my-feature

# Creates bd issues for each task with:
# - Task ID matching markdown
# - Priority based on phase (Integration=0, Pre-execution=1, etc.)
# - Dependencies mapped from tasks.md
# - Labels: agent, phase, type
```

**What Gets Synced:**

```markdown
From tasks.md:
- [ ] **impl-comp1-core** - Implement Component 1 Core Logic
  - **Agent**: implementation-specialist
  - **Estimated Time**: 20-30 minutes
  - **Dependencies**: [test-comp1]

Becomes Beads issue:
{
  "id": "impl-comp1-core",
  "title": "Implement Component 1 Core Logic",
  "status": "open",
  "priority": 1,
  "type": "task",
  "labels": ["agent:implementation-specialist", "phase:Phase 2"],
  "dependencies": {"blocks": ["test-comp1"]},
  "description": "Time: 20-30 minutes\nDetail: tasks/task-impl-comp1-core.md"
}
```

### 2. Task Execution (execute-task-orchestrated.md)

**Step 0.2: Query Ready Work (NEW)**

Before orchestration begins, query Beads for unblocked tasks:

```bash
# Find ready work (no dependencies blocking)
bd ready --json

# Example output:
[
  {
    "id": "impl-comp1-core",
    "title": "Implement Component 1 Core Logic",
    "priority": 1,
    "status": "open"
  },
  {
    "id": "test-integration",
    "title": "Integration Testing",
    "priority": 0,
    "status": "open"
  }
]
```

**User sees:**
```
📋 Ready Tasks (no dependencies blocking):

Critical Path (P0):
  - test-integration: Integration Testing

Important (P1):
  - impl-comp1-core: Implement Component 1 Core Logic
  - impl-comp2-ui: Implement Component 2 UI

Which task would you like to execute?
```

**Step 0.3: Claim Task**

```bash
# Claim task before execution
bd update impl-comp1-core --status in_progress --json

# Load detailed specs from markdown
cat tasks/task-impl-comp1-core.md
```

**Step 99: Complete Task (NEW)**

After all deliverable verification passes:

```bash
# Mark complete in Beads
bd close impl-comp1-core \
  --reason "All acceptance criteria met. Deliverables verified." \
  --json

# Update markdown completion checkbox
sed -i "s/\[ \] \*\*impl-comp1-core\*\*/[x] **impl-comp1-core**/" tasks.md

# Sync to git (exports JSONL, commits, pulls, pushes)
bd sync

# Check for newly unblocked tasks
bd ready --json
```

### 3. Discovered Work Pattern

When implementation reveals new tasks:

```bash
# Agent discovers edge case during impl-comp1-core
bd create "Fix edge case in validation" \
  --deps "discovered-from:impl-comp1-core" \
  --priority 1 \
  --type bug \
  --json

# This creates:
# 1. New issue linked to parent task
# 2. Dependency chain maintained
# 3. Context preserved for future sessions
```

### 4. Cross-Session Resume

At session start:

```bash
# Check for in-progress work
bd list --status in_progress --json

# If found, prompt user:
# "🔄 Resuming previous session work:
#  - impl-comp1-core: Implement Component 1 Core Logic (25% complete)
#
#  Continue with this task?"
```

---

## Configuration

### Config.yml Settings

```yaml
beads:
  enabled: true                         # Enable Beads integration
  mode: "hybrid"                        # Keep markdown + beads
  auto_sync: true                       # Sync on task completion
  create_beads_from_tasks_md: true     # Auto-create issues
  bidirectional_sync: true             # Keep both in sync
  mcp_preferred: true                   # Use MCP when available
```

### Disabling Beads

To disable Beads integration:

```yaml
beads:
  enabled: false
```

Agent OS will continue using markdown-only workflow.

---

## MCP Integration (Claude Code)

### Preferred Method

When using Claude Code, prefer MCP function calls over CLI:

```javascript
// Query ready work
const ready = await mcp__beads__ready()

// Create issue
await mcp__beads__create({
  title: "Implement new feature",
  priority: 1,
  type: "task",
  labels: ["agent:implementation-specialist"]
})

// Update status
await mcp__beads__update({
  id: "impl-comp1-core",
  status: "in_progress"
})

// Close issue
await mcp__beads__close({
  id: "impl-comp1-core",
  reason: "Completed successfully"
})

// Sync to git
await mcp__beads__sync()
```

**Benefits:**
- Native Claude Code integration
- Structured return types
- Automatic workspace detection
- No shell escaping issues

### Fallback to CLI

If MCP unavailable, use CLI commands:

```bash
bd ready --json
bd create "Title" -p 1 --json
bd update task-1 --status in_progress --json
bd close task-1 --reason "Done" --json
bd sync
```

---

## Worktree Compatibility

### The Problem

Git worktrees share a single Beads daemon, which doesn't know which branch each worktree has checked out. This can cause branch contamination.

### The Solution

Disable daemon in worktrees:

```bash
# In worktree isolation setup (execute-task-orchestrated.md Step 1)
export BEADS_NO_DAEMON=1

# All bd commands work without daemon
bd ready --no-daemon --json
bd update task-1 --status in_progress --no-daemon --json
```

**Automatic in Agent OS:** The worktree setup automatically sets `BEADS_NO_DAEMON=1` when `config.yml` has `beads.worktree_compatibility: true`.

---

## Common Commands

### Query Tasks

```bash
# Show unblocked tasks ready to work on
bd ready

# Show all tasks
bd list

# Show in-progress tasks
bd list --status in_progress

# Show tasks by priority
bd list --priority 0  # Critical

# Show tasks by label
bd list --label "agent:implementation-specialist"

# Show stale tasks (inactive for 30+ days)
bd stale --days 30
```

### Create Tasks

```bash
# Create basic task
bd create "Task title" -p 1 -t task

# Create with labels
bd create "Implement feature" \
  -p 1 \
  -t task \
  -l "agent:implementation-specialist" \
  -l "phase:Phase 2"

# Create discovered work
bd create "Fix bug" \
  --deps "discovered-from:impl-comp1-core" \
  -p 1 \
  -t bug
```

### Update Tasks

```bash
# Claim task
bd update impl-comp1-core --status in_progress

# Change priority
bd update impl-comp1-core --priority 0

# Add label
bd label add impl-comp1-core "needs-review"
```

### Complete Tasks

```bash
# Close task
bd close impl-comp1-core --reason "All acceptance criteria met"

# Close multiple tasks
bd close impl-comp1-core impl-comp2-ui --reason "Batch completion"
```

### Dependencies

```bash
# Show dependency tree
bd dep tree impl-comp1-core

# Add dependency (task-A blocks task-B)
bd dep add task-B task-A --type blocks

# Remove dependency
bd dep remove task-B task-A

# Check for circular dependencies
bd dep cycles
```

### Sync

```bash
# Sync to git (do this at session end!)
bd sync

# Check database info
bd info

# Check daemon status
bd daemons list
```

---

## Best Practices

### 1. Always Sync at Session End

```bash
# CRITICAL: Run bd sync before stopping work
bd sync
```

Without this, changes remain in the 5-second debounce window and may not be committed.

### 2. Use --json for Programmatic Access

```bash
# Always use --json in scripts
bd ready --json
bd list --json
bd create "Title" -p 1 --json
```

### 3. Quote Titles and Descriptions

```bash
# Always use double quotes
bd create "Fix bug in user validation" -d "Edge case discovered during testing"
```

### 4. Link Discovered Work

```bash
# Use discovered-from to maintain context
bd create "Refactor validation logic" \
  --deps "discovered-from:impl-comp1-core"
```

### 5. Check Ready Work Before Asking

```bash
# Query Beads before asking "what's next?"
bd ready --json
```

### 6. Leverage Hash IDs

Modern Beads uses collision-resistant hash IDs (bd-a1b2). Agent OS automatically uses these via `id_format: "hash"` in config.yml.

---

## Troubleshooting

### Issue: Daemon conflicts with worktrees

**Solution:**
```bash
export BEADS_NO_DAEMON=1
bd ready --no-daemon --json
```

Agent OS automatically sets this in worktree environments.

### Issue: Changes not appearing in git

**Solution:**
```bash
bd sync  # Flush debounce window and sync
```

### Issue: Circular dependencies detected

**Solution:**
```bash
bd dep cycles  # Identify cycles
bd dep remove task-B task-A  # Break cycle
```

### Issue: Stale tasks accumulating

**Solution:**
```bash
bd stale --days 30  # Find forgotten work
bd close stale-task-1 --reason "No longer needed"
```

### Issue: MCP functions not available

**Solution:**
```bash
# Install MCP server
pip install beads-mcp

# Fallback to CLI if needed
bd ready --json
```

---

## Migration from Markdown-Only

For existing Agent OS projects:

```bash
# 1. Install Beads
~/.agent-os/setup/install-beads.sh

# 2. Initialize in project
cd /path/to/project
bd init

# 3. Sync existing tasks
~/.agent-os/setup/sync-tasks-to-beads.sh .agent-os/specs/my-feature

# 4. Verify sync
bd list
bd ready

# 5. Continue using Agent OS workflows
# (now with Beads tracking!)
```

---

## Advanced: Custom Sync Script

For projects with unique task structures, customize the sync script:

```bash
# Copy template
cp ~/.agent-os/setup/sync-tasks-to-beads.sh ./custom-sync.sh

# Modify extraction logic for your task format
# Then use in create-tasks.md Step 2.5
```

---

## Reference: Beads CLI Quick Reference

```bash
# Query
bd ready                    # Unblocked tasks
bd list                     # All tasks
bd show <id>               # Task details
bd stale --days 30         # Inactive tasks

# Create
bd create "Title" -p 1 -t task

# Update
bd update <id> --status in_progress
bd update <id> --priority 0

# Close
bd close <id> --reason "Done"

# Dependencies
bd dep add <dependent> <blocker> --type blocks
bd dep tree <id>
bd dep cycles

# Labels
bd label add <id> <label>
bd label remove <id> <label>

# Sync
bd sync

# Info
bd info
bd daemons list

# All commands support --json for programmatic use
```

---

## Summary

Beads transforms Agent OS from a **specification framework** into a **specification + execution framework** with persistent memory. The hybrid approach preserves markdown's human-readable specs while adding Beads' programmatic execution state.

**Key Integration Points:**
1. ✅ create-tasks.md Step 2.5 → Auto-sync to Beads
2. ✅ execute-task-orchestrated.md Step 0.2 → Query ready work
3. ✅ execute-task-orchestrated.md Step 99 → Complete and sync
4. ✅ Worktree compatibility → No-daemon mode
5. ✅ MCP integration → Preferred for Claude Code

**Result:** Agents can now track state across sessions, detect ready work automatically, and maintain dependency chains without context window limitations.
