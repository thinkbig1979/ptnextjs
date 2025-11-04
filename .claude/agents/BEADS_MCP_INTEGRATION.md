# Beads MCP Integration for Agents

## Overview

All agents in this project now have access to beads MCP tools for issue tracking, following the guidelines in AGENTS.md.

## Updated Agents

### 1. project-manager (Full Access)
**Tools Added**: `mcp__beads__create_issue`, `mcp__beads__list_issues`, `mcp__beads__update_issue`, `mcp__beads__close_issue`, `mcp__beads__get_ready_work`, `mcp__beads__add_dependency`, `mcp__beads__remove_dependency`

**Rationale**: As the primary task tracking agent, project-manager needs full CRUD access to issues, dependency management, and ready work detection.

### 2. git-workflow (Workflow Integration)
**Tools Added**: `mcp__beads__list_issues`, `mcp__beads__update_issue`, `mcp__beads__close_issue`, `mcp__beads__get_ready_work`

**Rationale**: Can link commits to issues, close issues when merging PRs, and update issue status during git operations.

### 3. test-runner (Bug Tracking)
**Tools Added**: `mcp__beads__create_issue`, `mcp__beads__list_issues`, `mcp__beads__update_issue`

**Rationale**: Can create bug issues for test failures, update existing issues, and check for related issues.

### 4. file-creator (Discovered Work)
**Tools Added**: `mcp__beads__create_issue`, `mcp__beads__list_issues`

**Rationale**: Can create issues for discovered work during file creation and check for existing related issues.

### 5. js-senior (Development Workflow)
**Tools Added**: `mcp__beads__create_issue`, `mcp__beads__list_issues`, `mcp__beads__update_issue`, `mcp__beads__close_issue`, `mcp__beads__get_ready_work`

**Rationale**: Can manage issues during development, claim ready work, and track discovered issues.

### 6. pwtester (Test Failure Tracking)
**Tools Added**: `mcp__beads__create_issue`, `mcp__beads__list_issues`, `mcp__beads__update_issue`

**Rationale**: Can create issues for e2e test failures and link them to existing issues.

### 7. context-fetcher (Read-Only Access)
**Tools Added**: `mcp__beads__list_issues`, `mcp__beads__get_ready_work`

**Rationale**: Can check for related issues when fetching context and identify ready work.

### 8. date-checker (No Access)
**Tools Added**: None

**Rationale**: Date checking is a utility function that doesn't need issue tracking integration.

## Common Beads MCP Tools

### Core Issue Management
- `mcp__beads__create_issue` - Create new issues (bugs, features, tasks, epics, chores)
- `mcp__beads__list_issues` - List and filter issues
- `mcp__beads__update_issue` - Update issue status, priority, or details
- `mcp__beads__close_issue` - Close completed or obsolete issues
- `mcp__beads__get_ready_work` - Get unblocked issues ready for work

### Dependency Management
- `mcp__beads__add_dependency` - Add blockers or relationships between issues
- `mcp__beads__remove_dependency` - Remove dependencies

## Usage Guidelines

### For Agents

1. **Always use beads for task tracking** - Never create markdown TODOs
2. **Use `--json` flag** for programmatic use (if applicable to MCP tools)
3. **Link discovered work** with `discovered-from` dependencies
4. **Check ready work** before asking "what should I work on?"
5. **Update status** as work progresses (pending → in_progress → closed)
6. **Commit together** - Always commit `.beads/issues.jsonl` with code changes

### Priority Levels
- `0` - Critical (security, data loss, broken builds)
- `1` - High (major features, important bugs)
- `2` - Medium (default, nice-to-have)
- `3` - Low (polish, optimization)
- `4` - Backlog (future ideas)

### Issue Types
- `bug` - Something broken
- `feature` - New functionality
- `task` - Work item (tests, docs, refactoring)
- `epic` - Large feature with subtasks
- `chore` - Maintenance (dependencies, tooling)

## Integration Complete

All relevant agents now have appropriate beads MCP access based on their roles and responsibilities. The system follows the Agent OS convention of using beads for ALL task tracking instead of markdown TODOs.
