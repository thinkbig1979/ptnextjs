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

## Best Practices

1. **Always sync at session end:** `bd sync`
2. **Use --json for scripts:** `bd ready --json`
3. **Quote titles:** `bd create "Fix bug"`
4. **Link discovered work:** `--deps "discovered-from:parent-id"`
5. **Check ready work first:** `bd ready` before asking "what's next?"

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Daemon conflicts (worktrees) | `export BEADS_NO_DAEMON=1` |
| Changes not in git | `bd sync` |
| Circular dependencies | `bd dep cycles`, then `bd dep remove` |
| Stale tasks | `bd stale --days 30` |
