---
version: 1.0.0
last-updated: 2026-01-03
related-files:
  - instructions/core/orchestrate.md
  - instructions/utilities/test-execution-protocol.md
---

# E2E Testing Protocol

> **Purpose**: Unified E2E testing command with interactive mode selection
> **Core Principle**: Always interactive - no flags, always ask what user wants
> **Modes**: run (interactive), loop (autonomous), health (dashboard)

## Entry Point Flow

```
/e2e invoked
    |
    +-> Phase 0: Session Detection
    |   Check for existing repair session
    |
    +-> Phase 1: Mode Selection
    |   Show interactive menu
    |
    +-> Phase 2: Execute Selected Mode
        Dispatch to appropriate workflow
```

---

## Phase 0: Session Detection

```bash
# Check for existing repair session
if [ -f ".agent-os/e2e-repair/handoff.json" ]; then
  SESSION_EXISTS=true
  SESSION_DATA=$(cat .agent-os/e2e-repair/handoff.json)
fi
```

### If Session Exists

```
DISPLAY:
  =====================================================================
  E2E REPAIR SESSION DETECTED
  =====================================================================

  Previous session: {progress}% complete, {remaining} failures remaining
  Last activity: {time_ago}
  Phase: {phase} (RC-{current_rc})

  Options:
  1. [resume] Continue from where you left off
  2. [fresh] Start new session (archives current)
  3. [status] View detailed session state
  =====================================================================

WAIT for user choice

IF resume:
  LOAD context from handoff.json
  INVOKE: Skill(skill: "e2e-testing")
  CONTINUE from saved phase

IF fresh:
  ARCHIVE: mv .agent-os/e2e-repair/handoff.json .agent-os/e2e-repair/archived/handoff-{timestamp}.json
  PROCEED to Phase 1

IF status:
  DISPLAY detailed session state
  RETURN to options menu
```

---

## Phase 1: Mode Selection (No Existing Session)

```
DISPLAY:
  =====================================================================
  E2E TESTING
  =====================================================================

  What would you like to do?

  1. [run] Run tests interactively
     Executes tests, shows results, asks before each fix
     Best for: Quick test runs, debugging specific tests

  2. [loop] Start autonomous repair loop
     Builds, tests, analyzes, fixes - repeats until done
     Best for: Fixing a broken test suite hands-off

  3. [health] View test suite health
     Shows tier breakdown, recent results, recommendations
     Best for: Understanding current test suite state

  =====================================================================

WAIT for user choice
```

---

## Phase 2: Execute Selected Mode

### Mode: run (Interactive)

```
INVOKE: Skill(skill: "e2e-testing")

LOAD: ~/.claude/skills/e2e-testing/references/workflows/interactive.md

EXECUTE interactive workflow:
  1. Pre-flight checks (server, config)
  2. Ask user which tests to run (smoke/core/all/specific)
  3. Run tests with streaming output
  4. On failures:
     - Show analysis summary
     - Ask: investigate | fix | skip | rerun
  5. If fix chosen:
     - Spawn fix subagent per root cause
     - Verify fixes
     - Report results
  6. Loop until resolved or user stops
```

### Mode: loop (Autonomous)

```
INVOKE: Skill(skill: "e2e-testing")

LOAD: ~/.claude/skills/e2e-testing/references/workflows/loop.md

EXECUTE autonomous loop:
  SUPERVISOR (stays <5% context)
  |
  +-> Phase BUILD: Spawn Build Agent
  |   Build prod server, fix build issues
  |
  +-> Phase TEST: Spawn Test Agent
  |   Run tests, collect failures, group by root cause
  |
  +-> Phase ANALYZE: Parse results
  |   Rank by impact, check for APPLICATION_BUG
  |
  +-> Phase FIX: Spawn Fix Agent (per RC)
  |   Fix root cause, verify with samples
  |   Track attempts (max 3 per RC)
  |   Quarantine after 3 failures
  |
  +-> Phase VERIFY: Spawn Test Agent
  |   Run previously-failing tests
  |   IF improved -> next RC
  |   IF no improvement -> rollback, try different approach
  |   IF all fixed -> complete
  |
  +-> CHECKPOINT (when PreCompact hook fires)
      Save to .agent-os/e2e-repair/handoff.json
      Report "checkpoint saved, resumable"
```

### Mode: health (Dashboard)

```
EXECUTE health dashboard:
  1. Load test inventory
     - Count tests by tier (smoke/core/regression/quarantine)

  2. Check recent results
     - Parse test-results/*.json
     - Calculate pass/fail rates

  3. Check quarantine status
     - List quarantined tests
     - Check for tracking issues

  4. Check for active repair session
     - Parse handoff.json if exists

  5. Generate recommendations
     - Time since last run
     - Failure patterns
     - Quarantine issues
     - Tier assignment suggestions

  6. Display dashboard

OUTPUT FORMAT:
  ====================================================================
                       E2E TEST SUITE HEALTH DASHBOARD
  ====================================================================

  INVENTORY
  ---------
    Smoke:        {N} tests   (~{time})    Critical path
    Core:         {N} tests   (~{time})    Main features
    Regression:   {N} tests   (~{time})    Edge cases
    Quarantine:   {N} tests   (excluded)   Known issues
    ----------------------------------------------------------------
    Total:        {N} tests   (~{time})    Full suite

  RECENT RUNS
  -----------
    Last smoke:       {status}  {pass}/{total}   ({time_ago})
    Last core:        {status}  {pass}/{total}   ({time_ago})
    Last full:        {status}  {pass}/{total}   ({time_ago})

  QUARANTINE STATUS
  -----------------
    {test_file}      {tracking_issue}: {reason}
    ...

  ACTIVE REPAIR SESSION
  ---------------------
    Phase: {phase}
    Progress: {progress}% sample pass rate
    Root causes fixed: {fixed}/{total}
    Last activity: {time_ago}

  RECOMMENDATIONS
  ---------------
    1. {recommendation}
    2. {recommendation}
    ...

  ====================================================================
```

---

## Pre-Flight Checks (All Modes)

### Server Check

```bash
# Check if server is running
curl -sf --max-time 2 http://localhost:3000 && echo "Server: OK" || echo "Server: DOWN"
```

### Config Enforcement

```bash
# Check playwright.config.ts for violations
grep -E "webServer|workers.*undefined" playwright.config.ts

# Violations to fix:
# - webServer exists -> remove entire block
# - workers: undefined -> workers: process.env.CI ? 4 : 3
# - hardcoded baseURL -> baseURL: process.env.BASE_URL || 'http://localhost:3000'
```

### Test Inventory

```bash
# Check for test inventory
if [ -f "tests/e2e/test-inventory.ts" ]; then
  npx tsx tests/e2e/test-inventory.ts --list
else
  echo "NO_INVENTORY - using file count"
  find tests/e2e -name "*.spec.ts" | wc -l
fi
```

---

## Skill Loading

```yaml
skill: e2e-testing
location: ~/.claude/skills/e2e-testing/

load_by_mode:
  run:
    - SKILL.md (router)
    - references/workflows/interactive.md
    - references/agents/fix-agent.md (on demand)

  loop:
    - SKILL.md (router)
    - references/workflows/loop.md
    - references/agents/build-agent.md
    - references/agents/test-agent.md
    - references/agents/fix-agent.md

  health:
    - SKILL.md (router)
    - references/core/tier-definitions.md

load_on_demand:
  - references/core/failure-categories.md (when analyzing failures)
  - references/patterns/fix-patterns.md (when fixing)
  - references/patterns/root-cause.md (when analyzing)
  - references/patterns/quarantine.md (when quarantining)
  - references/patterns/handoff.md (when checkpointing)
```

---

## State Management

### Session State Location

```
.agent-os/e2e-repair/
  handoff.json        # Current session state (resumable)
  session-log.json    # Full history of current session
  archived/           # Previous session states
    handoff-{timestamp}.json
```

### Handoff JSON Structure

```json
{
  "version": "1.0.0",
  "session_id": "e2e-2026-01-03-1234",
  "started_at": "2026-01-03T10:00:00Z",
  "last_updated": "2026-01-03T12:30:00Z",

  "mode": "loop",
  "phase": "fix",

  "progress": {
    "initial_failures": 45,
    "current_failures": 12,
    "pass_rate": 0.83,
    "root_causes_total": 5,
    "root_causes_fixed": 3,
    "root_causes_quarantined": 1,
    "root_causes_remaining": 1
  },

  "current_root_cause": {
    "id": "RC-4",
    "description": "Button selector changed",
    "affected_tests": ["test1.spec.ts", "test2.spec.ts"],
    "attempts": 2,
    "last_attempt_result": "partial_success"
  },

  "quarantined": [
    {
      "root_cause_id": "RC-3",
      "reason": "Max attempts reached (3)",
      "tests": ["flaky-test.spec.ts"],
      "beads_task": ".agent-os-xyz"
    }
  ],

  "last_commit": "abc123",
  "rebuild_required": false,
  "next_action": "Continue fixing RC-4"
}
```

---

## Beads Integration

### Creating Tracking Tasks

```bash
# When quarantining
bd create --title="E2E: [root cause description]" --type=bug

# Track in handoff
# quarantined[].beads_task = task_id
```

### Session Tracking

```bash
# At session start
bd create --title="E2E Repair Session" --type=task
bd update <task_id> --status=in_progress

# At session end
bd close <task_id>
bd sync
```

---

## Configuration

```yaml
# config.yml - e2e section
e2e:
  enabled: true

  tiers:
    smoke:
      timeout_minutes: 3
      stop_on_failure: true
    core:
      timeout_minutes: 15
      stop_on_failure: false
    regression:
      timeout_minutes: 45
      stop_on_failure: false

  loop:
    max_iterations: 3           # Per root cause
    max_total_iterations: 10    # Total loop iterations
    success_threshold: 0.95     # Stop when 95% pass
    quarantine_after_failures: 3

  fix:
    prioritize_by: "impact"     # impact | category | file
    verify_sample_size: 3       # Tests to verify after fix
```

---

## Quick Reference

### Start E2E Testing
```
/e2e
```

### Resume Previous Session
```
/e2e -> [resume]
```

### Run Specific Tests
```
/e2e -> [run] -> "specific" -> tests/e2e/auth.spec.ts
```

### Start Autonomous Repair
```
/e2e -> [loop]
```

### Check Test Health
```
/e2e -> [health]
```
