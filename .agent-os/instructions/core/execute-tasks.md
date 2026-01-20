---
version: 5.3.0
last-updated: 2026-01-09
related-files:
  - instructions/core/create-tasks.md
---


# Unified Task Execution Protocol

> **Version**: 1.3.0 | Beads-first orchestration with parallel specialists
> **Core Principle**: Create ALL beads tasks + dependencies FIRST, then delegate execution
> **v4.5.0**: Test integrity analysis (Phase 1.5)
> **v5.1.1**: Ledger maintenance prompts (non-blocking)
> **v5.3.0**: Mandatory session ledger when remaining work exists

## Execution Flow

```
Phase 0: Pre-Flight
├─ Quality hooks verification
├─ Repository health check
└─ Branch setup

Phase 1: Beads Task Decomposition
├─ Analyze work scope
├─ Create ALL beads tasks
├─ Define ALL dependencies
└─ Create execution plan

Phase 1.5: Test Integrity Analysis (v4.5.0)
├─ Identify modified files
├─ Discover affected existing tests
├─ Categorize impact (critical/high/medium)
├─ Create test update Beads tasks
└─ Link test updates → implementation

Phase 2: Parallel Execution
├─ Execute waves (implementation + test updates)
├─ Collect status reports
└─ Checkpoint after waves

Phase 3: Context Monitoring
├─ Track 75% limit
├─ Ledger update prompt at 70%
└─ Graceful stop with state saved

Phase 4: Post-Execution
├─ Verify deliverables
├─ Run full test suite
├─ Verify test integrity
├─ Session ledger if remaining work (MANDATORY)
└─ Final commit and summary
```

## Critical Directives

| Directive | Rule |
|-----------|------|
| **PreCompact hook** | When you see the "CONTEXT COMPACTION IMMINENT" message, follow its graceful shutdown instructions. |
| **Beads-first** | Create task BEFORE spawning subagent. |
| **Auto-formalize** | Convert ad-hoc work to Beads tasks at handoff time. |
| **Checkpoint frequency** | Every 10 tool calls or end of wave. |
| **User approval** | Always prompt for blocked/checkpoint decisions. |
| **Ledger prompts** | Suggest ledger updates after tasks and before compaction (non-blocking). |
| **Ledger on remaining work** | **MANDATORY**: Create session ledger BEFORE displaying summary if remaining tasks exist. |

---

<pre_flight_check>
  EXECUTE: @.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

## Phase 0: Pre-Flight

### 0.1: Quality Hooks Verification

```bash
CHECK: .claude/hooks/validate-file.js exists
CHECK: ~/.agent-os/hooks/config.yml configured

IF not installed:
  RECOMMEND: ~/.agent-os/setup/install-hooks.sh
  WARN: "Quality validation reduced without hooks"

CONFIRM: "Quality hooks: [Active/Not Installed]"
```

### 0.2: Repository Health Check

```bash
# Execute in parallel
git status
git branch -a
gh pr list --state open
bd doctor

# Decision tree
IF uncommitted changes:
  PROMPT: "Options: 1. commit 2. stash 3. continue"
  WAIT for user decision

IF open ready PRs:
  RECOMMEND: "Consider merging PRs first"
  LIST: PR details

IF Beads issues:
  EXECUTE: bd doctor --fix
  VERIFY: Resolved

CONFIRM: "Repository health: [Clean/Issues Resolved]"
```

### 0.3: Branch Setup

```bash
# Branch naming
IF spec folder provided:
  BRANCH = spec folder name (no date prefix)
  Example: "2025-03-15-password-reset" → "password-reset"
ELSE:
  BRANCH = "work/[brief-description]"

# Branch management
IF exists:
  git checkout ${BRANCH}
  git rebase main  # if behind
ELSE:
  git checkout -b ${BRANCH}

CONFIRM: "Working branch: ${BRANCH}"
```

---

## Phase 1: Beads Task Decomposition

### 1.1: Analyze Work Scope

```
READ:
  - tasks.md (overview)
  - tasks/task-*.md (details)
  - Spec documents

IDENTIFY:
  - Task count (parent + subtasks)
  - Dependencies
  - Specialist roles needed
  - Parallel opportunities
  - Potential blockers

OUTPUT:
  📋 Work Scope Analysis:
  - Parent tasks: [COUNT]
  - Subtasks: [COUNT]
  - Dependency chains: [LIST]
  - Parallel streams: [COUNT]
  - Roles needed: [LIST]
```

### 1.2: Create ALL Beads Tasks + Dependencies

**CRITICAL**: Create BEFORE execution begins.

```bash
FOR each parent_task in tasks.md:
  # Create parent
  bd create --title="[TITLE]" --type=[task|feature|bug]
  CAPTURE: PARENT_ID

  # Create subtasks
  FOR each subtask:
    bd create --title="[SUBTASK_TITLE]" --type=task
    CAPTURE: SUBTASK_ID
    bd dep add ${SUBTASK_ID} ${PARENT_ID}

  # Cross-task dependencies
  FOR each dependency:
    bd dep add ${CHILD_ID} ${PARENT_ID}  # child depends on parent

# Verify
bd list --json > /tmp/beads-tasks.json

OUTPUT:
  🔗 Beads Task Graph:
  [PARENT-001] Feature: User Auth
  ├─ [TASK-001] Unit tests
  ├─ [TASK-002] Implement service ← depends on TASK-001
  ├─ [TASK-003] Login UI ← depends on TASK-002
  └─ [TASK-004] Integration tests ← depends on TASK-002, TASK-003

  Total: [COUNT]
  Ready: [COUNT]
  Blocked: [COUNT]
```

### 1.3: Create Execution Plan

```bash
bd ready --json

# Identify parallel streams
Stream 1: [simultaneous TASK-IDs]
Stream 2: [next batch after Stream 1]

# Map roles
test-architect: [TASK-IDs]
implementation-specialist: [TASK-IDs]
frontend-specialist: [TASK-IDs]

OUTPUT:
  📊 Execution Plan:
  Wave 1 (parallel): [TASK-001, TASK-005]
  Wave 2: [TASK-002, TASK-003, TASK-006]
  Wave 3: [TASK-004]
  Estimated waves: [COUNT]
```

### 1.4: Confirm with User

```
DISPLAY:
  "📋 EXECUTION PLAN READY
   Tasks: [COUNT] | Waves: [COUNT]
   
   Options:
   1. proceed
   2. modify
   3. show-deps
   4. abort"

WAIT for confirmation

IF abort:
  bd close [ALL_TASK_IDS] --reason="Cancelled"
  HALT
```

---

## Phase 1.5: Test Integrity Analysis (v4.5.0)

**Purpose**: Identify existing tests affected by planned changes BEFORE implementation.

### 1.5.1: Check Configuration

```
READ: config.yml → test_integrity_maintenance

IF enabled = false:
  SKIP to Phase 2
```

### 1.5.2: Load Instructions

```
READ: @.agent-os/instructions/agents/test-integrity-analyzer.md
CONFIRM: "Loading test-integrity-analyzer instructions"
```

### 1.5.3: Scope Analysis

```
FOR each implementation task:
  EXTRACT:
    - Files modified: [LIST from deliverables]
    - Functions changed: [LIST from spec]
    - APIs affected: [LIST]
    - Schema changes: [LIST]

OUTPUT:
  📋 Change Scope {TASK_ID}:
  Files: [N] | Functions: [N] | APIs: [N]
```

### 1.5.4: Discover Affected Tests

| Strategy | Pattern |
|----------|---------|
| Direct tests | `**/{filename}.test.{ts,tsx,js}` |
| Mock references | `vi.mock(['\"].*{module_path}` |
| Import references | `import.*from.*{module_path}` (scope: `**/*.test.*`) |
| E2E routes | `page.goto(['\"].*{affected_route}` (scope: `tests/e2e/**`) |
| Fixtures | `fixtures/{model}` (if schema changes) |

### 1.5.5: Categorize + Prioritize

| Category | Priority | Action |
|----------|----------|--------|
| directly_affected | CRITICAL | Must update |
| mock_dependent | HIGH | Check signatures |
| e2e_affected | HIGH | Full verification |
| fixture_dependent | MEDIUM | Verify schema |
| indirect_consumer | MEDIUM | Verify behavior |

```
OUTPUT:
  🔍 Affected Tests:
  ┌──────────┬───────────────────┬───────┬─────────────────┐
  │ Priority │ Category          │ Count │ Action          │
  ├──────────┼───────────────────┼───────┼─────────────────┤
  │ CRITICAL │ Directly affected │  {N}  │ Must update     │
  │ HIGH     │ Mock dependent    │  {N}  │ Check sigs      │
  │ HIGH     │ E2E affected      │  {N}  │ Full verify     │
  │ MEDIUM   │ Fixture dependent │  {N}  │ Verify schema   │
  │ MEDIUM   │ Indirect          │  {N}  │ Verify behavior │
  └──────────┴───────────────────┴───────┴─────────────────┘
```

### 1.5.6: Create Test Update Tasks

```bash
IF auto_create_beads_tasks = true:
  FOR each test group (by feature):
    # Create task
    bd create --title="Update tests: {feature}" --type=task
    CAPTURE: TEST_UPDATE_ID

    # Add details
    bd note ${TEST_UPDATE_ID} "
    Affected tests:
    - {test.file}: {reason}
    
    Requirements:
    - Verify mocks match signatures
    - Update assertions
    - Confirm fixtures"

    # Link to implementation
    bd dep add ${TEST_UPDATE_ID} ${IMPL_ID}

OUTPUT:
  📝 Test Update Tasks:
  - {task.id}: {task.title} (depends on {impl_id})
```

### 1.5.7: Update Execution Plan

```
BEFORE:
  Wave 1: [IMPL-001]
  Wave 2: [IMPL-002]

AFTER (regrouped):
  Wave 1: [IMPL-001]
  Wave 2: [IMPL-002] + [TEST-UPD-001]
  Wave 3: [TEST-UPD-002]
```

### 1.5.8: Save Report

```bash
SAVE: .agent-os/test-integrity/{TASK_ID}-analysis.json

CONTENTS:
  - Task ID + timestamp
  - Change scope
  - Discovered tests + categories
  - Created Beads tasks
  - Recommendations
```

### 1.5.9: Enforcement

| Mode | Behavior |
|------|----------|
| `blocking` | Halt if critical tests + no update plan |
| `warning` | Prompt if affected tests found |
| `advisory` | Display summary and continue |

```
DISPLAY:
  "═══════════════════════════════════════════════════════════
   TEST INTEGRITY ANALYSIS - COMPLETE
   ═══════════════════════════════════════════════════════════
   
   📋 Change Scope: {files} files, {funcs} functions
   🔍 Affected Tests: {total} (Critical: {N}, High: {N}, Medium: {N})
   📝 Update Tasks Created: {count}
   📍 Report: .agent-os/test-integrity/{TASK_ID}-analysis.json
   ═══════════════════════════════════════════════════════════"

PROCEED to Phase 2
```

---

## Phase 2: Parallel Execution

### 2.1: Execute Waves

```bash
FOR each wave:
  # 1. Claim tasks
  FOR task in wave:
    bd update ${task} --status in_progress

  # 2. Launch parallel subagents
  FOR task in wave:
    Task(subagent_type: "general-purpose",
         prompt: "{BEADS_DELEGATION_TEMPLATE}")

  # 3. Collect status reports
  FOR report in responses:
    PARSE: STATUS, TASK_ID, COMPLETED, REMAINING, BLOCKERS

    IF STATUS == "completed":
      bd close ${TASK_ID} --reason="[summary]"
      UPDATE tasks.md → ✅

    ELIF STATUS == "stopped_at_checkpoint":
      bd note ${TASK_ID} "[checkpoint details]"
      ADD to continuation_queue

    ELIF STATUS == "blocked":
      bd note ${TASK_ID} "[blocker details]"
      PROMPT user

  # 4. Handle continuations
  IF continuation_queue not empty:
    PROCESS continuations (Step 2.3)

  # 5. Checkpoint
  bd sync --from-main
  git add -A && git commit -m "checkpoint: wave [N] complete"
```

### 2.2: Beads-Aware Delegation Template

```
═══════════════════════════════════════════════════════════
BEADS CONTEXT PROTOCOL
═══════════════════════════════════════════════════════════

Working on: ${TASK_ID} - ${TASK_TITLE}

BEFORE starting:
1. READ: bd show ${TASK_ID}
2. CHECK for notes
3. VERIFY no blockers

DURING work:
1. Save every 10 calls: bd note ${TASK_ID} "..."
2. Update Agent-OS task file
3. If PreCompact hook fires, follow graceful shutdown instructions

BEFORE stopping (REQUIRED):
1. bd note ${TASK_ID} "[checkpoint]"
2. git add -A && git commit -m "checkpoint: ${TASK_ID} - [brief]"
3. bd sync --from-main
4. REPORT status (format below)

LEDGER UPDATE (OPTIONAL - non-blocking):
If significant decisions were made, consider updating:
  .agent-os/ledgers/LEDGER-{session-name}-{date}.md
with key decisions, patterns discovered, or blockers resolved.

═══════════════════════════════════════════════════════════
MANDATORY INSTRUCTION LOADING
═══════════════════════════════════════════════════════════

BEFORE work:
1. READ: @.agent-os/instructions/agents/${AGENT_ROLE}.md
2. INTERNALIZE key constraints
3. CONFIRM understanding
4. INVOKE required skills: ${SKILL_INVOCATIONS}
5. CONFIRM: "Skills loaded: [list invoked skills]"
6. CHECK patterns:
   FIRST:  .agent-os/patterns/ (project-specific)
   SECOND: Skills (generic)
   THIRD:  WebSearch (fallback)

═══════════════════════════════════════════════════════════
E2E TEST CREATION PROTOCOL (if creating E2E tests)
═══════════════════════════════════════════════════════════

BEFORE writing any E2E test:
1. Skill(skill="e2e-testing")
2. READ references/coverage-analysis.md
3. COMPLETE Step 0 (coverage analysis):
   - existing_tests_reviewed: true
   - gap_identified: [what gap this fills]
   - not_redundant_because: [justification]
4. IF redundant: SKIP test creation, document why
5. READ references/placement-checklist.md
6. COMPLETE placement decision (Steps 1-6):
   - Tier: [smoke|core|regression|quarantine]
   - Feature group: [group name]
   - Filename: [name].spec.ts
   - Rationale: [why this tier]
7. CONFIRM placement with orchestrator
8. CREATE test file
9. UPDATE test-inventory.ts with new test
10. VERIFY: npm run test:e2e:list shows updated counts

═══════════════════════════════════════════════════════════
TASK ASSIGNMENT
═══════════════════════════════════════════════════════════

TASK: ${TASK_TITLE}
BEADS_ID: ${TASK_ID}
ROLE: ${AGENT_ROLE}
PHASE: ${PHASE_NAME}

${REQUIREMENTS}

DELIVERABLES:
${DELIVERABLES}

ACCEPTANCE:
${ACCEPTANCE_CRITERIA}

═══════════════════════════════════════════════════════════
STATUS REPORT FORMAT (MANDATORY)
═══════════════════════════════════════════════════════════

---
STATUS: [completed | stopped_at_checkpoint | blocked]
TASK_ID: ${TASK_ID}
COMPLETED:
- [bullet list]

REMAINING:
- [bullet list]

FILES_MODIFIED:
- [file: description]

TESTS:
- [passing/failing/not yet run]

STOPPED_AT: [exact point - file:line or step]
NEXT_ACTION: [what next agent does first]
BLOCKERS: [issues]
---

Update: tasks/task-${TASK_ID}.md
```

### 2.3: Handle Continuations

**stopped_at_checkpoint**:
```
DISPLAY:
  "⏸️  PAUSED: ${TASK_ID}
   Progress: ~[X]%
   Stopped at: ${STOPPED_AT}
   Next: ${NEXT_ACTION}
   
   Options:
   1. continue - Spawn continuation agent
   2. defer - Move to next wave
   3. investigate - Examine first"

WAIT for decision

IF continue:
  SPAWN with: task ID, STOPPED_AT, NEXT_ACTION, REMAINING
```

**blocked**:
```
DISPLAY:
  "🚫 BLOCKED: ${TASK_ID}
   Blocker: ${BLOCKERS}
   
   Options:
   1. resolve
   2. skip
   3. abort"

WAIT for decision
```

### 2.4: Update Documents

```bash
AFTER each task completion:
  # Update tasks.md
  - Mark subtasks ✅
  - Add completion notes

  # Update tasks/task-${TASK_ID}.md
  - Mark deliverables complete
  - Add file paths
  - Note deviations

  # Update specs if needed
  - Modify sub-spec docs
  - Document rationale

AFTER each wave:
  git add -A && git commit -m "docs: wave [N] progress"
```

---

## Phase 3: Context Management

### 3.1: PreCompact Hook Response (v5.4+)

**Purpose**: Gracefully wrap up when context compaction is imminent.

The PreCompact hook automatically fires before context compaction (auto or manual). When you see the "CONTEXT COMPACTION IMMINENT" message:

```
WHEN PreCompact hook fires:
  1. DO NOT start any new tasks or subagents

  2. WAIT for any running subagents to complete and report back

  3. ONCE all subagents are done:
     a. ENSURE BEADS TRACKING:
        IF current work NOT tracked in Beads:
          FOR each remaining work item:
            bd create --title="[descriptive title]" --type=task
          CONFIRM: "Created Beads tasks for remaining work: [IDs]"

     b. CREATE SESSION LEDGER:
        → Go to Step 3.4 (Session Ledger Handoff)

     c. COMMIT any uncommitted work:
        git add -A && git commit -m "WIP: <description>"
        bd sync

  4. STOP - do not continue work after ledger is created
```

### 3.2: Ledger Maintenance (v5.1.1+)

**Purpose**: Capture key decisions and learnings to session ledgers for future context.

**Ledger Location**: `.agent-os/ledgers/LEDGER-<name>-<date>.md`

**Prompts are NON-BLOCKING** - suggestions only, not requirements.

#### 3.2.1: Task Completion Prompt

```
AFTER task marked complete (bd close):
  SUGGEST:
    "📝 Update ledger with key decisions?
     Task: ${TASK_ID} - ${TASK_TITLE}

     Suggested entries:
     - Implementation approach chosen
     - Trade-offs considered
     - Future considerations

     [yes | no | later]"

  IF yes:
    CAPTURE: Brief summary of decisions/learnings
    APPEND to ledger

  ELSE:
    CONTINUE (non-blocking)
```

#### 3.2.2: Pre-Compaction Prompt

```
BEFORE context compaction or graceful stop:
  SUGGEST:
    "📝 CAPTURE STATE TO LEDGER
     About to checkpoint/stop. Consider capturing:
     - Current state summary
     - What worked well
     - What to avoid next time
     - Continuation guidance

     Ledger: .agent-os/ledgers/LEDGER-{session-name}-{date}.md

     [capture-now | skip]"

  IF capture-now:
    GENERATE: State summary
    APPEND to ledger with timestamp

  ELSE:
    CONTINUE to checkpoint (non-blocking)
```

#### 3.2.3: Ledger Entry Format

```markdown
## Session Entry - {TIMESTAMP}

### Task: {TASK_ID}

**Decisions Made**:
- {decision 1}: {rationale}
- {decision 2}: {rationale}

**Patterns Discovered**:
- {pattern}: {context}

**Blockers/Workarounds**:
- {blocker}: {resolution or workaround}

**For Future Sessions**:
- {recommendation}

---
```

#### 3.2.4: Configuration

```yaml
# config.yml
ledger_maintenance:
  enabled: true
  prompts:
    on_task_completion: true       # Suggest after task closes
    before_compaction: true        # Suggest before context stop (PreCompact hook handles this)
  blocking: false                  # ALWAYS non-blocking
  ledger_path: ".agent-os/ledgers"
```

---

### 3.3: Orchestrator Checkpoint

```bash
# 1. Ensure all subagents returned

# 2. Save state
bd note ${MAIN_TASK_ID} "
ORCHESTRATOR CHECKPOINT: [timestamp]

STATE:
- Current wave: [N]/[TOTAL]
- Completed: [LIST]
- Active subagents: none

PROGRESS:
- Overall: [X]%
- Completed: [TASK_IDS]
- Remaining: [TASK_IDS]
- In progress: [TASK_IDS + status]

CONTINUATION_QUEUE:
- [TASK_ID]: stopped at [X], needs [ACTION]

CONTEXT:
- Key decisions: [LIST]
- Integration notes: [NOTES]
- Blockers: [LIST]

NEXT ACTION:
[Exactly what next session does first]"

# 3. Commit
git add -A && git commit -m "checkpoint: orchestrator at wave [N]"

# 4. Sync
bd sync --from-main

# 5. Inform user
DISPLAY:
  "ORCHESTRATOR CHECKPOINT
   Progress: [X]% ([N]/[TOTAL] waves)
   State saved: ${MAIN_TASK_ID}

   Remaining: [SUMMARY]

   Next session will auto-detect and offer to resume."
```

### 3.4: Session Ledger Handoff (v5.2+)

**Purpose**: Create unified session ledger that enables seamless auto-resume on next session start.

```bash
# 1. Gather handoff data
COMPLETED_TASKS=$(bd list --status=closed --json | jq -r '.[].id' | tail -10)
CURRENT_TASK=$(bd list --status=in_progress --json | jq -r '.[0].id')
REMAINING_TASKS=$(bd ready --json | jq -r '.[].id')
LAST_COMMIT=$(git rev-parse --short HEAD)
CURRENT_BRANCH=$(git branch --show-current)
PM_SESSION=${PM_SESSION_NUMBER:-1}

# 2. Create/update session ledger
WRITE: .agent-os/session-ledger.md

CONTENTS:
```markdown
# Session Ledger: ${SESSION_NAME}
Created: ${CREATED_TIMESTAMP}
Last Updated: $(date -Iseconds)
Task Context: ${MAIN_TASK_ID}

## Handoff Context
- **PM Session**: ${PM_SESSION}
- **Completed Tasks**: ${COMPLETED_TASKS}
- **Current Task**: ${CURRENT_TASK}
- **Stopped At**: ${STOPPED_AT_LOCATION}
- **Next Action**: ${NEXT_ACTION}
- **Remaining Tasks**: ${REMAINING_TASKS}
- **Last Commit**: ${LAST_COMMIT}

## Goal
${GOAL_FROM_SPEC_OR_TASK}

## Constraints
${CONSTRAINTS_FROM_SPEC}

## State
- **DONE**: ${COMPLETED_ITEMS}
- **NOW**: ${CURRENT_FOCUS}
- **NEXT**: ${UPCOMING_ITEMS}

## Working Set
- **Files**: ${MODIFIED_FILES}
- **Branch**: ${CURRENT_BRANCH}
- **Commands**: ${KEY_COMMANDS}

## Session Notes
${CONTEXT_NOTES_AND_KEY_DECISIONS}
```

# 3. Commit ledger
git add .agent-os/session-ledger.md
git add -A
git commit -m "checkpoint: session ledger at ${STOPPED_AT_LOCATION}"

# 4. Sync
bd sync

# 5. Inform user
DISPLAY:
  "═══════════════════════════════════════════════════════════
   SESSION LEDGER SAVED
   ═══════════════════════════════════════════════════════════

   Progress: [X]% complete
   Stopped At: ${STOPPED_AT_LOCATION}
   Next Action: ${NEXT_ACTION}

   Session ledger: .agent-os/session-ledger.md
   Last commit: ${LAST_COMMIT}

   Next session will auto-detect this ledger and offer to resume.
   ═══════════════════════════════════════════════════════════"
```

---

## Phase 4: Post-Execution

### 4.1: Verify Deliverables

```bash
FOR each task:
  READ: tasks/task-${TASK_ID}.md
  EXTRACT: deliverable manifest

  FOR each file:
    VERIFY: Exists (Read tool)
    VERIFY: Expected content/structure

  FOR each test requirement:
    VERIFY: Tests exist + pass

REPORT:
  ✅ Verified: [LIST]
  ❌ Missing: [LIST]
  ⚠️  Issues: [LIST]

IF issues:
  PROMPT user
```

### 4.2: TypeScript Verification

**MANDATORY for TS projects.**

```bash
CHECK: tsconfig.json exists?

IF yes:
  EXECUTE: pnpm tsc --noEmit

  IF errors:
    REPORT: file:line:column format
    PROMPT: "Options:
             1. fix (RECOMMENDED)
             2. investigate
             3. continue (NOT recommended)"

    IF fix:
      FIX errors
      RE-RUN: pnpm tsc --noEmit
      VERIFY: Clean

  IF clean:
    CONFIRM: "✓ TypeScript passed"

IF no tsconfig:
  SKIP
```

### 4.2.5: Browser Validation Gate (v5.1.0+)

**Purpose**: Verify UI components and user flows pass browser validation.

**Trigger**: After frontend implementation tasks, before task completion.

**Skip**: Backend-only features, non-UI tasks.

```yaml
browser_validation_gate:
  # Check if task has UI deliverables
  ANALYZE: Task deliverables

  IF NOT has_ui_deliverables:
    SKIP to 4.2.6

  # Load validation requirements
  READ: @instructions/core/validate-browser.md
  READ: @instructions/utilities/ui-acceptance-criteria-checklist.md

  # Execute validation
  FOR each user_flow in task:
    # Run E2E tests
    EXECUTE: pnpm test:e2e:ci --grep "{flow_name}"

    IF e2e_tests_fail:
      BLOCK: Task cannot complete until E2E tests pass
      SHOW: Failure details
      PROMPT: "E2E tests failing. Options:
               1. FIX - Delegate fixes to subagent
               2. INVESTIGATE - Show detailed analysis
               3. SKIP - Continue without E2E (NOT RECOMMENDED)"

      IF choice == "FIX":
        DELEGATE: Fix to test-fixer subagent
        RERUN: E2E tests after fix

    # Run accessibility scan
    EXECUTE: Accessibility scan with axe-core

    IF a11y_violations > 0:
      CATEGORIZE:
        - critical: BLOCK completion
        - serious: WARN + require acknowledgment
        - moderate: LOG only
        - minor: LOG only

      IF critical_violations > 0:
        BLOCK: Task cannot complete with critical a11y issues
        SHOW: Violation details with fix suggestions
        PROMPT: "Critical accessibility violations. Must fix."

    # Check Core Web Vitals
    EXECUTE: Lighthouse or Web Vitals measurement

    VERIFY:
      - LCP < 2.5s (WARN if exceeded)
      - CLS < 0.1 (WARN if exceeded)
      - INP < 200ms (WARN if exceeded)

    IF performance_warnings > 0:
      SHOW: Performance issues
      LOG: To validation report

    # Generate validation report
    SAVE: .agent-os/validation/{TASK_ID}-browser-report.json

    CONTENTS:
      task_id: {TASK_ID}
      timestamp: {ISO_TIMESTAMP}
      e2e_tests:
        passed: {COUNT}
        failed: {COUNT}
        skipped: {COUNT}
      accessibility:
        critical: {COUNT}
        serious: {COUNT}
        moderate: {COUNT}
        minor: {COUNT}
      performance:
        lcp: {VALUE}
        cls: {VALUE}
        inp: {VALUE}
      browsers_tested:
        - chrome: {PASS/FAIL}
        - firefox: {PASS/FAIL}
        - safari: {PASS/FAIL}
        - mobile: {PASS/FAIL}
      status: {PASSED/BLOCKED}

  # Final gate check
  IF all_flows_passed:
    CONFIRM: "✓ Browser validation passed"
    CONTINUE to 4.2.6

  ELSE:
    BLOCK: "Browser validation failed - fix issues before completing task"
    SHOW: Summary of blocking issues
```

**Console Output**:
```
Browser Validation Gate - {TASK_ID}
├── E2E Tests: ✓ 5/5 passed
├── Accessibility: ✓ 0 violations
├── Performance:
│   ├── LCP: 1.8s ✓
│   ├── CLS: 0.05 ✓
│   └── INP: 150ms ✓
├── Browsers:
│   ├── Chrome: ✓
│   ├── Firefox: ✓
│   └── Mobile: ✓
└── Status: ✓ PASSED
```

### 4.2.6: Pattern Consistency Validation (v5.0+)

**Purpose**: Verify implemented code matches existing codebase patterns.

**Trigger**: After TypeScript verification, before evolution check.

```yaml
pattern_validation:
  # Load patterns
  patterns_path: "{AGENT_OS_ROOT}/.agent-os/patterns"

  IF NOT exists(patterns_path):
    WARN: "No patterns found - skipping validation"
    CONTINUE to 4.3

  # Get changed files
  CHANGED_FILES: git diff --name-only HEAD~1
  SOURCE_FILES: filter(CHANGED_FILES, include: ["*.ts", "*.tsx", "*.js"])

  # Run validation
  SPAWN: pattern-consistency-validator subagent
    FILES: SOURCE_FILES
    PATTERNS: patterns_path
    MODE: config.pattern_consistency.enforcement.mode  # advisory|warning|blocking

  # Handle results
  RECEIVE: validation_report

  IF validation_report.blocking_violations > 0:
    SHOW: Violation details

    PROMPT: |
      ❌ Pattern violations detected that block completion:

      {for each violation}
      File: {file}
      Issue: {issue}
      Expected: {expected}
      Actual: {actual}
      {end for}

      Options:
      1. FIX violations (recommended)
      2. JUSTIFY deviations (document reason)
      3. OVERRIDE (not recommended)

    IF choice == "FIX":
      FOR each violation:
        APPLY: suggested_fix if auto_fixable
        ELSE: Prompt user for manual fix
      REVALIDATE: Run pattern-consistency-validator again

    IF choice == "JUSTIFY":
      FOR each violation:
        PROMPT: "Justification for {violation}:"
        SAVE: .agent-os/patterns/deviations/{task_id}.md
      CONTINUE: With documented deviations

    IF choice == "OVERRIDE":
      WARN: "Overriding pattern validation is not recommended"
      REQUIRE: Explicit confirmation
      LOG: Override in validation report
      CONTINUE

  IF validation_report.warnings > 0:
    SHOW: Warning summary
    LOG: To validation report
    CONTINUE: Warnings don't block

  IF validation_report.passed:
    CONFIRM: "✓ Pattern consistency validated"

  # Save report
  SAVE: .agent-os/pattern-validation/{TASK_ID}-report.json
```

**Console Output**:
```
Pattern Consistency Validation
├── Files checked: 5
├── Patterns verified: 6
├── Violations: 0
└── Status: ✓ PASSED
```

### 4.2.7: Evolution Check for Deliverables (v5.2+)

**Purpose**: Verify implementation aligns with spec's evolution requirements and flag new anti-patterns.

**Trigger**: After pattern validation, before test suite.

**Skip**: If `config.yml` → `evolution_scoring.apply_to.tasks: false`

```yaml
evolution_check:
  # 1. Load configuration
  READ: config.yml → evolution_scoring

  IF NOT enabled OR NOT apply_to.tasks:
    SKIP to 4.3

  # 2. Load spec's evolution requirements
  spec_folder: {AGENT_OS_ROOT}/.agent-os/specs/{spec_name}

  IF exists({spec_folder}/analysis-inversion.md):
    LOAD: inversion_analysis
    anti_patterns: EXTRACT anti_patterns from inversion_analysis
    constraints: EXTRACT constraints from inversion_analysis
  ELSE:
    anti_patterns: []
    constraints: []

  # 3. Analyze deliverables for anti-patterns
  FOR each modified_file in task.deliverables:
    SCAN for:
      # Global anti-patterns (always checked)
      global_anti_patterns:
        - god_objects: "Class/module with >10 responsibilities"
        - hidden_dependencies: "Dependencies not in function signature"
        - magic_values: "Unexplained constants or strings"
        - nested_callbacks: "Callback depth > 3"
        - mixed_abstractions: "High-level mixed with low-level code"
        - excessive_coupling: "Module depends on >5 other modules"

      # Spec-specific anti-patterns (from inversion analysis)
      spec_anti_patterns: {anti_patterns}

  # 4. Verify constraint compliance
  FOR each constraint in constraints:
    VERIFY: Implementation satisfies constraint
    IF NOT satisfied:
      FLAG: constraint_violation

  # 5. Calculate evolution impact
  evolution_impact:
    anti_patterns_introduced: [list of new anti-patterns]
    constraints_violated: [list of violated constraints]
    total_issues: count(anti_patterns_introduced) + count(constraints_violated)

  # 6. Enforcement decision
  mode: config.evolution_scoring.enforcement_mode  # "warning" | "blocking"

  IF evolution_impact.total_issues == 0:
    PASS: Continue to 4.3
    OUTPUT:
      "Evolution Check: PASSED
       ├── Anti-patterns: 0 introduced
       ├── Constraints: All satisfied
       └── Status: ✓ Clean implementation"

  ELIF mode == "warning":
    WARN: Show issues
    PROMPT: "Evolution issues detected:

            Anti-patterns introduced:
            {for each anti_pattern}
            - {file}: {pattern_name} - {description}
            {end for}

            Constraints violated:
            {for each violation}
            - {constraint}: {how_violated}
            {end for}

            Options:
            1. FIX - Address issues before proceeding
            2. CONTINUE - Proceed with justification
            3. DEFER - Create follow-up task"

    IF choice == "FIX":
      RETURN to implementation phase
    ELIF choice == "CONTINUE":
      REQUIRE: Justification
      SAVE: .agent-os/evolution/{TASK_ID}-override.md
      PROCEED to 4.3
    ELIF choice == "DEFER":
      CREATE: Follow-up Beads task for tech debt
      PROCEED to 4.3

  ELIF mode == "blocking":
    BLOCK: Cannot proceed with evolution issues
    OUTPUT:
      "Evolution Check: BLOCKED

       Must address before completion:
       {issues}

       Return to implementation and fix these issues."
    HALT until issues resolved

  # 7. Save evolution report
  SAVE: .agent-os/evolution/{TASK_ID}-check.json
  CONTENTS:
    task_id: {TASK_ID}
    timestamp: {ISO_TIMESTAMP}
    anti_patterns_found: {list}
    constraints_violated: {list}
    status: {PASSED | WARNED | BLOCKED}
    override_justification: {if applicable}
    deferred_tasks: {if any}
```

**Console Output**:
```
Evolution Check - {TASK_ID}
├── Anti-patterns: {count} introduced
├── Constraints: {satisfied}/{total} satisfied
├── Files analyzed: {count}
└── Status: {PASSED | WARNED | BLOCKED}
```

### 4.3: Run Full Test Suite

```bash
# Execute directly (real-time visibility)
pnpm test:unit:ci
pnpm test:integration:ci
pnpm test:e2e:ci

# Use streaming
node ~/.agent-os/hooks/lib/test-monitor.js [command]

IF failures:
  ANALYZE patterns
  PROMPT: "Options:
           1. investigate
           2. fix (delegate to subagent)
           3. continue (not recommended)"
```

### 4.4: Complete Beads Tasks

```bash
FOR each task:
  bd close ${TASK_ID} --reason="[summary]"

# Verify
bd list --status=open

IF open tasks:
  REPORT: "⚠️ Still open: [LIST]"
  PROMPT user

# Final sync
bd sync --from-main
```

### 4.5: Session Ledger for Remaining Work (v5.3.0+)

**MANDATORY**: Create session ledger BEFORE any summary if work remains.

```bash
# Check for remaining work
REMAINING_TASKS=$(bd ready --json 2>/dev/null | jq length)
SPEC_TASKS_REMAINING=$(grep -c "^\s*- \[ \]" tasks.md 2>/dev/null || echo 0)

IF REMAINING_TASKS > 0 OR SPEC_TASKS_REMAINING > 0:
  # MUST create session ledger before summary
  EXECUTE: Step 3.4 (Session Ledger Handoff)

  # Update ledger with batch completion context
  APPEND to .agent-os/session-ledger.md:
    """
    ## Batch Complete - $(date -Iseconds)

    **Completed This Session**:
    ${COMPLETED_TASK_LIST}

    **Remaining Work**:
    - Beads tasks ready: ${REMAINING_TASKS}
    - Spec tasks unchecked: ${SPEC_TASKS_REMAINING}

    **Ready to Continue**:
    $(bd ready --json | jq -r '.[] | "- \(.id): \(.title)"')
    """

  CONFIRM: "Session ledger created: .agent-os/session-ledger.md"

ELSE:
  # All work complete - archive any existing ledger
  IF exists .agent-os/session-ledger.md:
    MOVE: .agent-os/session-ledger.md → .agent-os/ledgers/LEDGER-${spec_name}-$(date +%Y-%m-%d).md
    CONFIRM: "Session ledger archived (all work complete)"
```

### 4.6: Final Commit + Summary

```bash
# 1. Stage
git add -A

# 2. Commit
git commit -m "feat: [description]

Completed:
- [TASK-001]: [desc]
- [TASK-002]: [desc]

🤖 [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 3. Summary
IF session_ledger_created:
  DISPLAY:
    "📋 SESSION COMPLETE (more work remains)
     
     📊 This Session:
     - Tasks completed: [COUNT]
     - Files modified: [COUNT]
     - Tests passing: [COUNT]
     
     📁 Deliverables:
     [LIST with paths]
     
     🔗 Branch: ${BRANCH}
     📝 Session ledger: .agent-os/session-ledger.md
     
     Remaining:
     - Tasks ready: [COUNT]
     
     To continue: /execute-tasks --resume or start new session"

ELSE:
  DISPLAY:
    "✅ EXECUTION COMPLETE
     
     📊 Summary:
     - Tasks: [COUNT]
     - Files: [COUNT]
     - Tests passing: [COUNT]
     - Waves: [COUNT]
     
     📁 Deliverables:
     [LIST with paths]
     
     🔗 Branch: ${BRANCH}
     
     Next:
     1. git diff main...HEAD
     2. gh pr create"
```

<post_flight_check>
  EXECUTE: @.agent-os/instructions/meta/post-flight.md
</post_flight_check>

---

## Quick Reference

### Beads Commands

```bash
# Find work
bd ready                     # Unblocked tasks
bd list --status=in_progress # Active work
bd show <id>                 # Task details

# Create + update
bd create --title="..." --type=task
bd update <id> --status=in_progress
bd note <id> "checkpoint..."
bd close <id> --reason="..."

# Dependencies
bd dep add <child> <parent>  # child depends on parent
bd blocked                   # Show blocked

# Sync (critical)
bd sync --from-main
```

### Skills and Instruction Files

| Role | Skills / Instruction Files |
|------|---------------------------|
| test-context-gatherer | e2e-testing, instructions/agents/test-context-gatherer.md |
| test-architect | e2e-testing, instructions/agents/test-architect.md |
| implementation-specialist | standards/, instructions/agents/implementation-specialist.md |
| frontend-specialist | standards/, instructions/agents/frontend-specialist.md |
| security-sentinel | instructions/agents/security-sentinel.md |
| e2e-repair | e2e-testing |

### Skill Enforcement Protocol (v4.8.0)

**MANDATORY**: Subagents MUST invoke required skills and confirm.

When dispatching ANY subagent with test responsibilities:

1. **Include skill requirements in prompt**:
   ```
   MANDATORY FIRST ACTIONS:
   1. Skill(skill="e2e-testing")
   2. Read references/canonical-values.md
   3. Confirm: "Skills loaded: [list]"

   DO NOT proceed without skill confirmation.
   ```

2. **Verify in response**:
   - Response MUST contain "Skills loaded:" confirmation
   - If missing, prompt subagent or fail task

3. **E2E test creation additional requirements**:
   ```
   FOR E2E tests:
   1. Skill(skill="e2e-testing")
   2. Read references/placement-checklist.md
   3. Complete placement decision BEFORE writing test
   4. Add test to test-inventory.ts
   ```

### Ledger Maintenance (v5.1.1+)

**Prompts are NON-BLOCKING suggestions**:

| Trigger | Threshold | Action |
|---------|-----------|--------|
| Context threshold | 70% | Suggest updating ledger with decisions/patterns |
| Task completion | After `bd close` | Suggest capturing key decisions |
| Pre-compaction | Before checkpoint | Suggest capturing state summary |

**Ledger Location**: `.agent-os/ledgers/LEDGER-<name>-<date>.md`

**Entry Format**:
```markdown
## Session Entry - {TIMESTAMP}
### Task: {TASK_ID}
**Decisions Made**: ...
**Patterns Discovered**: ...
**For Future Sessions**: ...
```

### Configuration

```yaml
unified_execution:
  enabled: true
  beads_first: true
  context_limit: 0.75
  checkpoint_interval: 10

ledger_maintenance:
  enabled: true
  prompts:
    context_threshold: 0.70
    on_task_completion: true
    before_compaction: true
  blocking: false
  ledger_path: ".agent-os/ledgers"

# Additional unified_execution options
unified_execution:
  parallel_waves: true
  auto_continuation: false
```
