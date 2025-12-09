# Triage Command

## Purpose

Interactive triage workflow for processing findings from quality validation, code reviews, security audits, or performance analysis. Present findings one-by-one for tracking decisions.

## Constraints

**CRITICAL: NO CODING DURING TRIAGE**
- Decision-making and todo creation only
- No implementation work
- Process findings efficiently

## Prerequisites

- Findings in standardized format (severity, category, location, description, recommendation, effort)
- Access to todo directory
- State directory (`.triage-state/`) for persistence

**Pre-flight**: Execute `@.agent-os/instructions/meta/pre-flight.md`

## Pause/Resume System

Sessions are auto-saved after each decision. Pause anytime with `pause` command. Resume from exact position later.

### State File Structure

**Location**: `.triage-state/triage-session-[YYYYMMDD-HHMMSS].yml`

```yaml
session:
  id: "[SESSION_ID]"
  started_at: "[ISO_TIMESTAMP]"
  paused_at: "[ISO_TIMESTAMP]"
  source_type: "[quality_validation|code_review|etc]"
  source_file: "[PATH]"
  todos_directory: "[PATH]"

progress:
  total_findings: [NUMBER]
  triaged_count: [NUMBER]
  remaining_count: [NUMBER]
  current_finding_index: [NUMBER]
  todos_created: [NUMBER]
  findings_skipped: [NUMBER]
  custom_modifications: [NUMBER]

time_estimation:
  session_start_time: "[ISO_TIMESTAMP]"
  use_actual_average: [BOOLEAN]
  average_time_per_finding: [DECIMAL]
  finding_durations: [[DECIMAL], ...]  # Rolling window, last 10
  current_finding_start_time: "[ISO_TIMESTAMP]|null"

decisions:
  created_todos:
    - issue_id: "[ID]"
      filename: "[FILENAME]"
      title: "[TITLE]"
      priority: "[p1|p2|p3]"
      finding_index: [NUMBER]
      created_at: "[ISO_TIMESTAMP]"
  skipped_findings:
    - finding_index: [NUMBER]
      finding_id: "[ID]"
      title: "[TITLE]"
      reason: "[REASON|null]"
      skipped_at: "[ISO_TIMESTAMP]"
  custom_modifications:
    - finding_index: [NUMBER]
      modifications: "[DESCRIPTION]"
      modified_at: "[ISO_TIMESTAMP]"
      final_decision: "[yes|next|pending]"

findings: [COMPLETE_ARRAY]
```

## Workflow Steps

### Step 0: Session Initialization

#### Resume Check

**IF state file exists with remaining findings:**

```markdown
🔄 Previous triage session found!

Session Details:
- Started: [START_TIME] ([TIME_AGO])
- Progress: [TRIAGED]/[TOTAL] findings ([PERCENT]%)
- Todos created: [COUNT]
- Findings skipped: [COUNT]
- Remaining: [REMAINING] findings
- Estimated time: ~[MINUTES] min

Options:
1. resume - Continue from Finding #[NEXT]
2. restart - Start fresh (archives previous session)
3. view - View session summary first
```

**Handle Decision:**

| Decision | Action |
|----------|--------|
| `resume` | Load state from YAML, restore all variables, set `current_finding_index`, skip to Step 2 |
| `restart` | Archive old state to `archived-session-[timestamp].yml`, proceed to Step 1 |
| `view` | Display full summary (session metadata, todos created, findings skipped), re-prompt for resume/restart |

#### New Session Initialization

**IF no state OR user chose restart:**

```javascript
session = {
  id: "triage-" + timestamp,
  started_at: current_timestamp,
  paused_at: null,
  source_type: null,
  source_file: null,
  todos_directory: null
}

progress = {
  total_findings: 0,
  triaged_count: 0,
  remaining_count: 0,
  current_finding_index: 0,
  todos_created: 0,
  findings_skipped: 0,
  custom_modifications: 0
}

time_estimation = {
  session_start_time: current_timestamp,
  use_actual_average: false,
  average_time_per_finding: 1.5,
  finding_durations: [],
  current_finding_start_time: null
}

decisions = {
  created_todos: [],
  skipped_findings: [],
  custom_modifications: []
}

findings = []
```

Create `.triage-state/` directory if needed. Proceed to Step 1.

### Step 1: Load and Prepare Findings

**Finding Sources:**

| Source | Action |
|--------|--------|
| Quality Validation | Read `.quality-validation/findings-[timestamp].yml`, extract all findings, sort by severity (P1→P2→P3) then ROI |
| Direct Input | Parse user-provided findings, validate required fields, sort by severity and priority |
| Code Review | Read review findings, consolidate multi-agent outputs, deduplicate, sort by severity and impact |

**Preparation:**
- Count total findings
- Calculate estimated time (default: 1.5 min/finding)
- Group by severity
- Initialize all progress counters
- Initialize time estimation tracking

### Step 2: Present Findings Iteratively

**For each finding:**

```markdown
---
Progress: Finding #[X] of [TOTAL] ([PERCENT]% complete) | Est. time remaining: [MINUTES] min

Issue #[FINDING_ID]: [Brief Title]

Severity: [🔴 P1 | 🟡 P2 | 🔵 P3]
Category: [Security|Performance|Architecture|Quality|Data|Patterns|Simplicity]

Description:
[Detailed explanation]

Location: [file_path:line_number]

Problem:
[What's wrong - step by step if applicable]

Impact:
[Why this matters / what could happen]

Proposed Solution:
[Actionable steps to fix]

Estimated Effort: [Small (<2h) | Medium (2-8h) | Large (>8h)]
Source: [Agent names]

---
Options:
1. yes - create todo file
2. next - skip this item
3. custom - modify before creating

(Type 'pause' at any time to save and exit)
```

**Progress Display:**

```
📊 Triage Progress: 15/42 findings (36%)
⏱️  Estimated time remaining: ~27 minutes
   ├─ Based on last 10 findings (avg: 1.8 min/finding)
   └─ Adjusted for complexity (12 P1s, 8 P2s remaining)
✅ Todos created: 8 | ⏭️  Skipped: 7 | ✏️  Modified: 2
```

**Update after each decision:**
- Increment triaged count
- Recalculate percentage: `(triaged / total) * 100`
- Update average processing time
- Recalculate time remaining with complexity adjustment

#### Time Estimation Algorithm

**Tracking:**

- **Before each finding**: Record `current_finding_start_time`
- **After each decision**: 
  - Calculate `finding_duration = current_time - start_time`
  - Add to `finding_durations` array (max 10, rolling window)
  - Calculate `actual_average = sum(durations) / count`
  - If count ≥ 5: Set `use_actual_average = true`
  - Clamp average to 0.5-5.0 min bounds

**Complexity Adjustment:**

For each remaining finding:

```javascript
complexity_multiplier = 1.0

// Severity adjustment
if (P1) complexity_multiplier += 0.5
if (P3) complexity_multiplier -= 0.25

// Description length adjustment
if (description.length > 500) complexity_multiplier += 0.25

// Multi-file adjustment
if (affects_multiple_files) complexity_multiplier += 0.25

adjusted_time = base_average * complexity_multiplier
```

**Display:**

```
// Before 5 findings processed:
⏱️  Estimated time remaining: ~41 minutes (initial estimate)

// After 5+ findings processed:
⏱️  Estimated time remaining: ~27 minutes (~0.5 hours)
   ├─ Based on last 10 findings (avg: 1.9 min/finding)
   └─ Adjusted for complexity (12 P1s, 8 P2s, 7 P3s remaining)
```

### Step 3: Handle User Decisions

#### Option 1: Yes

1. **Determine next issue ID**: Find highest in `todos/`, increment, zero-pad to 3 digits
2. **Generate filename**: `{issue_id}-pending-{priority}-{brief-slug}.md`
   - `brief-slug`: lowercase, hyphens, max 5 words, 40 chars
3. **Create todo file**: Use template (Step 4), populate with finding data
4. **Confirm**: `✅ Created: {filename} - Issue #{issue_id}`
5. **Update progress**:
   - Increment `todos_created`, `triaged_count`
   - Decrement `remaining_count`
   - Add to `created_todos` list
   - Update time estimation (calculate duration, update average)
   - Recalculate progress percentage and time remaining
6. **Save state**: Call `save_session_state()`, update `current_finding_index`, set `paused_at`
7. **Continue**: Next finding

#### Option 2: Next

1. **Log skip**: Record finding ID, title, reason (if provided)
2. **Update progress**:
   - Increment `findings_skipped`, `triaged_count`
   - Decrement `remaining_count`
   - Update time estimation
   - Recalculate progress percentage and time remaining
3. **Save state**: Call `save_session_state()`
4. **Continue**: Next finding

#### Option 3: Custom

1. **Ask for modifications**:
   ```
   What to modify?
   - Priority (P1/P2/P3)
   - Description
   - Effort estimate
   - Proposed solution
   - Other details
   ```
2. **Apply changes**: Update finding fields
3. **Re-present**: Display modified finding
4. **Re-prompt**: Options 1/2/3 again
5. **Track**: Increment `custom_modifications` (don't update `triaged_count` yet)

#### Option 4: Pause

1. **Acknowledge**: `⏸️  Pausing triage session...`
2. **Save state**: Call `save_session_state()` at current position
3. **Display summary**:
   ```markdown
   ✅ Triage session paused and saved!

   Progress saved:
   - Completed: [TRIAGED]/[TOTAL] findings ([PERCENT]%)
   - Todos created: [COUNT]
   - Findings skipped: [COUNT]
   - Next: Finding #[NEXT]
   - State file: .triage-state/triage-session-[id].yml

   To resume: Run triage command, select "resume"
   ```
4. **Exit**: Stop processing, return to prompt (no final summary)

**Pause Detection**: Accept `pause`/`stop`/`save` at any decision point.

#### State Persistence Function

```javascript
save_session_state():
  state = {
    session: {...},
    progress: {...},
    time_estimation: {...},
    decisions: {...},
    findings: [...]
  }
  
  filename = ".triage-state/triage-session-" + session.id + ".yml"
  WRITE state to filename (YAML format)
  
  if (!file_exists(filename)) ERROR("Save failed")
```

**Save Triggers**: After every yes/next decision, on explicit pause, before final summary.

### Step 4: Create Todo Files

**Todo Template:**

```markdown
---
status: pending
priority: [p1|p2|p3]
issue_id: "[ISSUE_ID]"
tags: [[CATEGORY], [ADDITIONAL_TAGS]]
dependencies: []
source: triage
created_from: [quality_validation|code_review|security_audit|performance_analysis]
finding_agents: [[AGENT_LIST]]
---

# [Finding Title]

## Problem Statement

[Detailed description]
[Impact explanation]

## Findings

- **Location**: [file_path:line_number]
- **Category**: [Category]
- **Severity**: [P1|P2|P3]
- **Discovered by**: [Agents]
- **Context**: [Discovery context]

[Step-by-step problem scenario]

## Proposed Solutions

### Option 1: [Primary solution]

[Detailed recommendation]

- **Pros**: [Benefits]
- **Cons**: [Drawbacks]
- **Effort**: [Small|Medium|Large]
- **Risk**: [Low|Medium|High]
- **Implementation steps**:
  1. [Step 1]
  2. [Step 2]
  3. [Step 3]

## Recommended Action

[Leave blank - filled during approval/planning]

## Technical Details

- **Affected Files**: [Files list]
- **Related Components**: [Components]
- **Database Changes**: [Yes/No - describe]
- **API Changes**: [Yes/No - describe]
- **Frontend Changes**: [Yes/No - describe]

## Resources

- **Original finding**: Triage session [date]
- **Finding source**: [source type]
- **Related findings**: [Other issue numbers]
- **Agent reports**: [Agent names]
- **References**: [Documentation links]

## Acceptance Criteria

- [ ] [Specific success criteria]
- [ ] Tests written and passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] No regression in related functionality

## Work Log

### [CURRENT_DATE] - Initial Discovery

**By:** Agent OS Triage System
**Actions:**
- Issue discovered during [session type]
- Categorized as [severity] / [category]
- Estimated effort: [effort]
- Prioritized based on [impact and ROI]

**Context:** [Additional context]
**Learnings:** [Key insights]

## Notes

Source: Triage session on [CURRENT_DATE]
Finding ID: [FINDING_ID]
Agents: [AGENT_LIST]
```

**Naming Conventions:**

| Element | Format | Example |
|---------|--------|---------|
| Priority | P1→`p1`, P2→`p2`, P3→`p3` | `p1` |
| Slug | lowercase, hyphens, max 5 words, 40 chars | `sql-injection-search-query` |
| Issue ID | 3-digit zero-padded, sequential | `042` |
| Filename | `{id}-pending-{priority}-{slug}.md` | `042-pending-p1-sql-injection-search.md` |

**Issue ID Generation:**
- Scan `todos/` for existing files
- Extract numeric prefixes, find max
- Increment by 1, zero-pad to 3 digits
- If no todos exist, start at `001`

### Step 5: Generate Triage Summary

**Before Summary:**

1. **Mark complete**: Set `remaining_count = 0`, `current_finding_index = total_findings`, add `completed_at` timestamp
2. **Save final state**: Call `save_session_state()` with completion markers
3. **Move state** (optional): Rename to `completed-session-[id].yml`

**Summary Report:**

```markdown
## 🎯 Triage Session Complete

**Session Duration**: [DURATION]
**Total Findings Reviewed**: [TOTAL]
**Todos Created**: [CREATED_COUNT]
**Findings Skipped**: [SKIPPED_COUNT]
**Custom Modifications**: [CUSTOM_COUNT]
**Average Time per Finding**: [AVG_TIME]
**Time Estimation Accuracy**:
  - Findings used: [COUNT] (last [N] in window)
  - Actual average: [X.X] min/finding
  - Method: [Actual average | Default estimate]
  - Fastest/Slowest: [MIN]/[MAX] minutes
  - Complexity adjustments: [Yes|No]

---

### ✅ Created Todos ([COUNT])

**Critical (P1)**: [P1_COUNT]
- `[filename]` - [title]
[repeat for all P1]

**Important (P2)**: [P2_COUNT]
- `[filename]` - [title]
[repeat for all P2]

**Nice-to-Have (P3)**: [P3_COUNT]
- `[filename]` - [title]
[repeat for all P3]

---

### ⏭️ Skipped Findings ([COUNT])

- Finding #[ID]: [title] ([reason])
[repeat for all skipped]

---

### 📊 Effort Summary

**Total Estimated Effort**: [HOURS] hours

Breakdown:
- Small tasks (<2h): [COUNT] todos = [TOTAL_HOURS] hours
- Medium tasks (2-8h): [COUNT] todos = [TOTAL_HOURS] hours
- Large tasks (>8h): [COUNT] todos = [TOTAL_HOURS] hours

---

### 🎯 Quick Wins (High Impact, Low Effort)

[IF quick wins exist (P1/P2 + Small effort):]
- `[filename]` - [title] (Effort: Small, Priority: [P1|P2])
[repeat]

---

### 🔥 Critical Items Requiring Immediate Attention

[IF P1 todos exist:]
- `[filename]` - [title]
  Impact: [impact]
  Effort: [effort]
[repeat]

---

### 📋 Next Steps

1. **Review pending todos**: `ls todos/*-pending-*.md`
2. **Prioritize and approve**: Review P1 first, consider quick wins
3. **Start execution**: Use execute-tasks workflow or pick individual todos
4. **Track progress**: Update status, add work log entries, mark complete

---

### 💾 Session Data

**Findings Source**: [quality_validation|code_review|etc]
**Findings File**: [path]
**Todos Directory**: [path]
**Session Timestamp**: [ISO timestamp]
```

**Metrics to Report:**
- Session start/end time, total duration
- Findings processed count
- Todos created count
- Skipped findings count
- Custom modifications count
- Time estimation metrics (actual average, min/max, complexity adjustments)
- Total estimated effort
- P1/P2/P3 distribution

## Error Handling

| Error Type | Action |
|------------|--------|
| Finding validation failure | Warn, skip or prompt for manual input, log error, continue |
| Todo creation failure | Error message, retry once, fallback to logged finding data, notify user, continue |
| Invalid user input | Clarify options, re-prompt, provide help, continue after valid input |

## Best Practices

**Momentum:**
- Process findings quickly and efficiently
- Don't wait for approval between items
- Keep presentations concise but complete
- Maintain clear progress visibility
- Use pause/resume for long sessions (>30 findings)
- State auto-saves after each decision - safe to pause anytime

**Decisions:**
- Create todo for anything requiring action
- Skip duplicates or non-actionable items
- Use custom to adjust priority or details
- Consider effort vs impact
- Group related findings when applicable

**Quality:**
- Ensure todos have clear acceptance criteria
- Include all relevant context from findings
- Preserve agent recommendations
- Link to original findings sources
- Maintain consistent formatting

**Post-flight**: Execute `@.agent-os/instructions/meta/post-flight.md`
