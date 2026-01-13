---
version: 5.1.0
last-updated: 2026-01-02
related-files:
  - instructions/core/create-spec.md
---


# Step 2: Spec Initiation and Detail Level

## Step 2: Spec Initiation

**Subagent**: context-fetcher

**Option A** - "what's next?":
1. Read `roadmap.md`
2. Find next uncompleted item
3. Suggest to user
4. Wait approval

**Option B** - User describes spec:
- Accept any format/detail level
- Proceed to detail selection

## Step 2.5: Detail Level Selection

```
Present options:
  Quick (5-10 min read):
    - Small features, bug fixes
    - 1 file: minimal-spec-template.md

  More (15-25 min read):
    - Medium features, new components
    - 2-3 files: standard-spec-template.md

  A Lot (45-60 min read):
    - Major features, system redesigns
    - 5-8 files: All sub-spec templates

STORE: SPEC_DETAIL_LEVEL = [minimal | standard | comprehensive]
```

**Selection Guidance**:
| Level | Time | Scope | Examples |
|-------|------|-------|----------|
| Minimal | <4h | Clear requirements, no new architecture | UI tweaks, config, simple CRUD |
| Standard | 4-16h | Moderate complexity, new components | API endpoints, forms, auth features |
| Comprehensive | >16h | High complexity, architectural decisions | Payments, real-time, major refactors |

**Factors**: Time, Complexity, Integration, Risk, Team, Documentation needs
