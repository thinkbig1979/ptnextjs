---
description: Quick specification for simple changes (< 30 min work)
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Quick Spec

## Overview

Create lightweight specifications for simple changes that don't need full analysis.

**Use for:**
- Bug fixes
- Documentation updates
- Small refactors (< 3 files)
- Configuration changes
- Estimated work < 30 minutes

**Use full `/create-spec` instead for:**
- New features or capabilities
- Changes touching > 3 files
- Security-sensitive changes
- Work estimated > 30 minutes
- Architectural decisions needed

## Process

### Step 1: Verify Scope

```
CONFIRM simple change criteria:
- [ ] < 30 minutes estimated work
- [ ] < 3 files affected
- [ ] No architectural decisions
- [ ] No security implications
- [ ] Clear requirements (no discovery needed)

IF any unchecked → STOP and use /create-spec
```

### Step 2: Create Quick Spec

```
CREATE: .agent-os/specs/{spec-name}/quick-spec.md

USE template: @.agent-os/templates/quick-spec.md.template
```

### Step 3: Output

```yaml
quick_spec_complete:
  location: ".agent-os/specs/{spec-name}/quick-spec.md"
  next_step: "Run /create-tasks {spec-name} OR implement directly"

guidance:
  direct_implementation: "For trivial changes, skip tasks and implement"
  task_creation: "For changes with 2+ distinct steps, create tasks first"
```

## Decision Tree

```
Is this < 30 min work?
├── NO → /create-spec
└── YES → Is it trivial (single step)?
          ├── YES → Create quick-spec, implement directly
          └── NO → Create quick-spec, then /create-tasks
```
