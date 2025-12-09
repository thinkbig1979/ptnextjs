---
description: Utility guide for working with optimized task file structure
version: 2.0
encoding: UTF-8
---

# Task File Structure Utilities

## Overview

Agent OS v2.0 uses an optimized task file structure that dramatically reduces context consumption by separating lightweight task overview from detailed task requirements.

## File Structure

```
specs/[spec-name]/
├── tasks.md              # Lightweight master list (50-100 lines)
└── tasks/                # Detailed task files (loaded as needed)
    ├── task-pre-1.md
    ├── task-pre-2.md
    ├── task-test-comp1.md
    ├── task-impl-comp1-core.md
    └── ...
```

## Context Optimization Benefits

- **Master tasks.md**: ~50-100 lines instead of 500-1000+ lines
- **Detail files**: Only loaded when executing specific task
- **Context savings**: 90%+ reduction in repeated context consumption
- **Scalability**: Efficiently handles 50+, 100+, or 200+ tasks

## Reading Tasks

### Get Task Overview
```
READ: specs/[spec-name]/tasks.md
PURPOSE: Quick scan of all tasks, phases, dependencies
USE CASE: Task selection, progress tracking, dependency mapping
CONTEXT: Minimal (~50-100 lines)
```

### Get Task Details
```
READ: specs/[spec-name]/tasks/task-[TASK_ID].md
PURPOSE: Complete implementation requirements for specific task
USE CASE: Task execution, detailed planning
CONTEXT: Only loaded when needed (per task basis)
```

## Updating Task Status

### Mark Task Complete

**Update Master tasks.md:**
```markdown
- [x] **task-id** - Task Title → [details](tasks/task-task-id.md)
  - **Agent**: agent-name
  - **Estimated Time**: time-estimate
  - **Dependencies**: [deps]
```

**Update Task Detail File (tasks/task-[TASK_ID].md):**
```markdown
## Task Metadata
- **Task ID**: task-id
- **Status**: [x] Complete
```

### Mark Task Blocked

**Update Master tasks.md:**
```markdown
- [ ] **task-id** - Task Title → [details](tasks/task-task-id.md)
  - **Agent**: agent-name
  - **Estimated Time**: time-estimate
  - **Dependencies**: [deps]
⚠️ Blocking issue: [DESCRIPTION]
```

**Update Task Detail File:**
Add blocking information to Implementation Notes section.

## Task File Templates

### Master tasks.md Format
```markdown
# Spec Tasks

## Metadata
- **Spec Name**: [NAME]
- **Total Tasks**: [COUNT]
- **Status**: [COMPLETE]/[TOTAL] complete

## Phase [N]: [PHASE_NAME]

- [ ] **task-id** - Task Title → [details](tasks/task-task-id.md)
  - **Agent**: agent-name
  - **Estimated Time**: time
  - **Dependencies**: [list]
```

### Individual Task File Format
```markdown
# Task: [TASK_ID] - [TITLE]

## Task Metadata
- **Task ID**: [ID]
- **Phase**: [PHASE]
- **Agent**: [AGENT]
- **Estimated Time**: [TIME]
- **Dependencies**: [DEPS]
- **Status**: [ ] Not Started

## Task Description
[Detailed description]

## Specifics
- **Files to Create/Modify**: [list]
- **Key Requirements**: [list]
- **Technical Details**: [list]

## Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]

## Testing Requirements
- **Functional Testing**: [requirements]
- **Manual Verification**: [requirements]

## Context Requirements
- [Context items needed]

## Implementation Notes
- [Additional notes]

## Related Files
- Spec: [path]
- Technical Spec: [path]
```

## Migration Guide

### Converting Legacy Monolithic tasks.md

If you have an existing monolithic tasks.md file:

1. **Create tasks/ directory** in spec folder
2. **Extract each task** to individual file:
   - Filename: `task-[TASK_ID].md`
   - Content: Full task details using individual task template
3. **Rewrite master tasks.md** with lightweight format:
   - Keep only: task ID, title, agent, time, dependencies, link
   - Remove: verbose acceptance criteria, testing details, evidence
4. **Update execute-tasks workflow** to reference new structure

## Best Practices

### When Reading Tasks
- **Quick review**: Only read master tasks.md
- **Task execution**: Read master + specific task detail file
- **Never**: Load all task detail files at once

### When Creating Tasks
- **Always**: Generate master tasks.md + individual detail files
- **Master file**: Keep ultra-concise (one line per task + metadata)
- **Detail files**: Include comprehensive requirements

### When Updating Status
- **Always**: Update both master and detail file
- **Master**: Just change checkbox status
- **Detail**: Update status metadata + add notes if needed

### Context Management
- **Task selection**: Use master tasks.md only
- **Task execution**: Load specific detail file only
- **Progress tracking**: Use master tasks.md only
- **Result**: 90%+ context savings vs monolithic file

## Integration with Workflows

### create-tasks.md
Generates both master and detail files automatically

### execute-tasks.md
Reads master for overview, references detail files during execution

### execute-tasks.md
Loads specific detail file for comprehensive task requirements

### execute-tasks.md
Uses detail files for specialist agent context packages

## Troubleshooting

### Master tasks.md too large
- Verify only essential info included (ID, title, agent, time, deps, link)
- Move all verbose content to detail files

### Can't find task details
- Check link format: `[details](tasks/task-[TASK_ID].md)`
- Verify task detail file exists in tasks/ subdirectory

### Inconsistent status between files
- Always update both master and detail file simultaneously
- Use edit tool to update both in single operation when possible
