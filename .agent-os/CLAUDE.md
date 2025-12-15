# CLAUDE.md

Agent OS v4.6.0 - Structured workflows for AI agents to build products systematically.

## Quick Reference

```
commands/           → Entry points (plan-product.md, create-spec.md, execute-tasks.md)
instructions/core/  → Detailed workflow steps
standards/          → Code style, tech stack, best practices
setup/              → Installation scripts
config.yml          → Version and feature toggles
```

## Core Workflow

1. **Plan**: `commands/plan-product.md` - Define product, install Agent OS
2. **Specify**: `commands/create-spec.md` - Create feature specifications
3. **Task**: `commands/create-tasks.md` - Break specs into executable tasks
4. **Execute**: `commands/execute-tasks.md` - Run tasks with orchestration
5. **Validate**: `commands/validate-browser.md` - Browser testing for web components

## Code Style (Enforced)

| Element | Convention | Example |
|---------|------------|---------|
| Indentation | 2 spaces | `if (x) {\n  return y;\n}` |
| Variables | snake_case | `user_name`, `is_active` |
| Classes | PascalCase | `UserProfile`, `AuthService` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_BASE_URL` |
| Strings | Single quotes | `'hello'` (double for interpolation) |

## Tech Stack Defaults

- **Framework**: Next.js + React (TypeScript)
- **Database**: PostgreSQL 17+ with Active Record
- **Build**: Vite, pnpm, Node 22 LTS
- **Styling**: TailwindCSS 4.0+, shadcn, Lucide icons
- **Hosting**: Self-hosted Docker Compose

## Agent Execution Model

Agent OS provides structured workflows executed by Claude Code's actual agents:

| Agent Type | Purpose | Invocation |
|------------|---------|------------|
| `general-purpose` | Main execution for all tasks | `Task(subagent_type: "general-purpose")` |
| `Explore` | Codebase analysis and context | `Task(subagent_type: "Explore")` |
| `Plan` | Strategic planning | `Task(subagent_type: "Plan")` |

**Important**: The "execution roles" in config.yml (test-architect, security-sentinel, etc.) are **workflow phase definitions**, NOT callable agents. They document structured phases that guide task execution through a single Claude Code agent.

For terminology definitions, see: `docs/GLOSSARY.md`

## Key Features by Version

### Task Execution (v2.0+)
- Parallel task processing via Claude Code's Task tool (spawns general-purpose subagents)
- Workflow phases: testing, implementation, integration, security (guided by instruction files)
- Context optimization per task phase

### Task File Structure (v2.1+)
- **Master file**: `tasks.md` (~50-100 lines) - task overview only
- **Detail files**: `tasks/task-*.md` - loaded per-task execution
- 90%+ context reduction for large task lists

### Quality Hooks (v2.2+)
Auto-triggered on every file write via `.claude/hooks/validate-file.js`:
- Syntax, formatting, linting, imports, types, security
- Auto-fix enabled for safe issues
- ~0.8s overhead per file

**Install**: `~/.agent-os/setup/install-hooks.sh`

### Deliverable Verification (v2.5+)
Tasks blocked until verified:
1. All expected files exist (Read tool verification)
2. All tests pass (test-runner execution)
3. All acceptance criteria have evidence
4. All integration points work

### Compound Engineering (v2.7+)

**Review Phases** (workflow phases with instruction files, NOT callable agents):
- `security-sentinel` instructions - OWASP Top 10, vulnerability scanning
- `performance-oracle` instructions - Bottleneck identification
- `architecture-strategist` instructions - Design pattern analysis
- `code-simplicity-reviewer` instructions - Complexity reduction

**Research Phases** (load via general-purpose agent):
- `repo-research-analyst` instructions - Codebase pattern analysis
- `best-practices-researcher` instructions - External best practices
- `framework-docs-researcher` instructions - Framework conventions

Note: These are instruction files in `instructions/agents/`, loaded by the general-purpose agent during relevant workflow phases. See `docs/GLOSSARY.md` for terminology.

**Security Gate**: P1 (CRITICAL) findings block task completion.

**Triage Workflow**: `commands/triage.md` - Interactive finding management with pause/resume.

**Worktree Isolation**: `.agent-os/worktrees/[task-id]/` - Parallel work without conflicts.

### Beads Integration (v2.8+)
Git-backed task tracking for persistent agent memory:

```bash
bd ready                    # Find unblocked tasks
bd update TASK --status in_progress
bd close TASK --reason "Done"
bd sync                     # Commit to git (critical at session end)
```

**Hybrid mode**: Markdown specs + Beads execution state.

### Test Infrastructure Reliability (v2.9+)
Prevents hung tests, CI failures, and test sprawl.

**Reference**: See `@standards/testing-standards.md` for canonical values (timeouts, file locations, etc.)

**Core Protocols** (ensure reliable test execution):

1. **Instruction Loading** (Step 1.9 in execute-tasks.md)
   - Subagents should read their instruction file to ensure proper task context
   - Agent type validated against task requirements

2. **Server Pre-Flight** (before E2E tests)
   - Health check required servers (2s timeout each)
   - Block test execution if servers down
   - Avoid auto-starting servers (test scripts should declare requirements)

3. **Watch Mode Prevention**
   - Detect and block: `vitest` (use `vitest run`), `jest --watch`, `playwright --ui`
   - Auto-fix commands when possible

4. **Timeout Enforcement** (See `@standards/testing-standards.md` Section 1)
   - Per-test: Unit 5s | Integration 30s | E2E 60s
   - Suite: Unit 2 min | Integration 5 min | E2E 10 min
   - Idle detection: 60s no output = hung test
   - Auto-kill hung tests

5. **Test Standards Validator** (`hooks/validators/test_standards.js`)
   - Validates: real assertions, no `.only()`, correct file location, timeout config
   - Blocks debug patterns as test files

6. **Sprawl Prevention** (See `@standards/testing-standards.md` Section 7)
   - Max 5 console statements per test file (configurable)
   - Debug scripts go to `scripts/debug/`, not test directories
   - Archive location: `tests/_archive/`

7. **Framework Directory Isolation** (prevents import conflicts - See `@standards/testing-standards.md` Section 3)
   - Playwright `testDir` should be `./tests/e2e` (not `./tests`) to prevent scanning unit tests
   - Vitest should exclude E2E directories
   - This separation prevents "Vitest cannot be imported" errors

**Required package.json scripts**:
```json
{
  "test:unit:ci": "vitest run",
  "test:e2e:ci": "playwright test",
  "test:check-servers": "curl -f http://localhost:3000/health"
}
```

### Test Context Gathering (v3.1+)
Pre-test research phase that gathers library documentation BEFORE test writing.

**Problem Solved**: Tests often fail on first run due to incorrect API usage, outdated patterns, or framework-specific requirements (e.g., Convex tests using wrong patterns).

**How It Works**:
1. **Library Detection** (Step 2.0): Scans package.json/pyproject.toml/Gemfile
2. **Documentation Fetching**: Skills → DocFork MCP → Context7 MCP → WebSearch (priority order)
3. **Pattern Extraction**: Extracts mocking, assertion, and lifecycle patterns
4. **Context Handoff**: Saves to `.agent-os/test-context/[TASK_ID].json`
5. **Test Writing**: test-architect uses gathered patterns

**Key Files**:
- `instructions/agents/test-context-gatherer.md` - Research phase instructions
- `~/.claude/skills/agent-os-test-research/` - Test research skill (v3.2+)
- `~/.claude/skills/agent-os-patterns/` - Testing patterns skill (v3.2+)

**Workflow Integration**: Step 2.0 in `execute-tasks.md` (before test-architect)

### Skills Integration (v3.2+)
Claude Code skills provide progressive-disclosure documentation without network dependencies.

**Pattern Lookup Hierarchy** (See `@standards/testing-standards.md` Section 4):
```
1. FIRST:  .agent-os/patterns/  (project-specific - HIGHEST PRIORITY)
2. SECOND: Skills               (agent-os-patterns, agent-os-test-research)
3. THIRD:  MCPs                 (DocFork MCP, Context7 MCP)
4. FOURTH: WebSearch/WebFetch   (Fallback for gaps)
```

Project-specific patterns take PRECEDENCE over all other sources.

**Skill Invocation Ownership** (v4.2.0+):
The `test-context-gatherer` agent OWNS skill invocations during test context gathering (Step 2.0).
The orchestrator does NOT invoke skills directly - it delegates to test-context-gatherer.

**Available Skills** (installed to `~/.claude/skills/`):

| Skill | Purpose | Available References |
|-------|---------|----------------------|
| `agent-os-testing-standards` | **Canonical testing values** (v4.2.0+) | canonical-values.md, execution-commands.md, validation-checklist.md, failure-classification.md |
| `agent-os-patterns` | Testing & code style | vitest.md, playwright.md, convex.md, test-strategies.md, coding-style.md |
| `agent-os-specialists` | Development guidance | backend-nodejs.md, frontend-react.md, implementation.md |
| `agent-os-test-research` | Pre-test research | Detection patterns, documentation sources |
| `e2e-test-repair` | **E2E test suite repair** (v4.6.0+) | failure-categories.md, fix-patterns.md, test-runner-agent.md, fix-agent.md, handoff-protocol.md |

**Skill Invocation Pattern** (v4.2.0+):
To access skill content, explicitly invoke skills using `Skill(skill="skill-name")`. Skills are not automatically loaded - they must be requested when needed.

**Required Skill Invocations by Phase**:
| Phase | Required Skills | Invocation |
|-------|-----------------|------------|
| Test Context (2.0) | Testing standards, Test research, Patterns | `Skill(skill="agent-os-testing-standards")`, `Skill(skill="agent-os-test-research")`, `Skill(skill="agent-os-patterns")` |
| Test Design (2.1) | Testing standards | `Skill(skill="agent-os-testing-standards")` |
| Alignment Validation (2.2a) | Testing standards | `Skill(skill="agent-os-testing-standards")` → references/validation-checklist.md |

**Project-Specific Patterns** (generated per-project in `.agent-os/patterns/`):

| Category | File | Generated By |
|----------|------|--------------|
| Frontend | `.agent-os/patterns/frontend/typescript.md` | Codebase analysis |
| Backend | `.agent-os/patterns/backend/python.md` | Codebase analysis |
| Backend | `.agent-os/patterns/backend/rails.md` | Codebase analysis |
| Backend | `.agent-os/patterns/backend/api.md` | Codebase analysis |
| Testing | `.agent-os/patterns/testing/*.md` | Codebase analysis |
| Global | `.agent-os/patterns/global/error-handling.md` | Codebase analysis |

**Workflow Integration Points**:
```yaml
create_tasks: Step 1.7 → Check .agent-os/patterns/, then agent-os-patterns skill
test_context: Step 2.0 → Check .agent-os/patterns/testing/, then skills
implementation: Step 2.2 → Check .agent-os/patterns/, then skills
```

**Skill Invocation Pattern**:
```
1. CHECK .agent-os/patterns/ for project-specific patterns (FIRST)
2. INVOKE Skill tool: Skill(skill="agent-os-patterns")
3. READ relevant references from skill
4. Project patterns OVERRIDE skill patterns where both exist
```

**Note**: Instruction files have explicit pattern lookup steps that check project-specific patterns first, then fall back to global skills.

### Test Execution Monitoring (v3.3.0+)
Real-time test visibility with hung test detection and streaming reporters.

**Problem Solved**: Tests run as batch, hung tests not detected until timeout, no per-test visibility.

**Solution**: Streaming reporters + test monitor utility:

**Key Files**:
- `scripts/reporters/vitest-streaming.js` - Vitest real-time reporter
- `scripts/reporters/playwright-streaming.ts` - Playwright real-time reporter
- `hooks/lib/test-monitor.js` - Monitor with hung detection
- `setup/install-test-monitoring.sh` - Installation script

**Usage**:
```bash
# Run with monitoring
node ~/.agent-os/hooks/lib/test-monitor.js pnpm vitest run --reporter=./scripts/reporters/vitest-streaming.js

# Environment variables
AGENT_OS_TEST_TIMEOUT=30000   # Per-test timeout (ms)
AGENT_OS_IDLE_TIMEOUT=15000   # Idle detection (ms)
AGENT_OS_ON_HUNG=alert        # Action: alert|kill|skip
```

**Benefits**:
- Per-test progress visibility (see which test is running)
- Hung test detection (alert/kill after timeout)
- Idle detection (no output = potential hang)
- Structured JSON events for parsing

### Test Failure Handling Protocol (v4.0.1+)
Direct test execution with automated failure analysis and delegated fixes.

**Problem Solved**: No explicit protocol for handling test failures - what to do after failures are detected.

**Solution**: Direct test execution (for real-time visibility) with delegated fixes:

```
MAIN AGENT
├─► Run tests DIRECTLY (user sees real-time streaming output)
├─► Analyze failures (classify, group by root cause)
├─► Triage decision (ask user: investigate|fix|skip|rerun)
├─► Delegate fixes → FIX SUBAGENT(s)
├─► Run verification tests DIRECTLY
└─► Loop until resolved
```

**Key Principle**: Main agent runs tests DIRECTLY (real-time output), only FIXES are delegated to subagents.

**Why direct execution?** Subagents don't stream intermediate output - users would see nothing for 5+ minutes.

**Failure Classification**:
| Type | Indicators | Fix Location |
|------|------------|--------------|
| `assertion` | Expected vs actual mismatch | Test or implementation |
| `timeout` | Test exceeded time limit | Async handling, server |
| `environment` | Missing server/dep/env var | Environment setup |
| `syntax` | Parse/compile error | Code fix |
| `runtime` | Uncaught exception | Implementation |

**Subagent Delegation**:

1. **Main agent runs tests directly**: For real-time streaming output visibility
   - References `instructions/agents/test-runner.md` for protocol
   - Uses streaming reporters and test-monitor.js
   - User sees `[AGENT-OS-TEST]` markers in real-time

2. **FIX SUBAGENT**: Fixes specific failures based on analysis (delegated)
   - Receives explicit fix instructions from main agent
   - Modifies only specified files
   - Does NOT run tests (main agent verifies)
   - Reports what changed + confidence level

**Analysis Persistence**: `.agent-os/test-failures/[run-id].json`
- Survives context, enables resume
- Tracks fix history across iterations
- Groups failures by root cause

### E2E Test Suite Repair (v4.6.0+)
Multi-agent orchestration for systematically repairing E2E test suites.

**Problem Solved**: E2E test suites with many failures need systematic repair, not one-off fixes.

**Solution**: Failure categorization + strategic batching + parallel fix implementation.

**Orchestration Flow**:
```
Phase 0: Pre-Flight     → Verify server, clear rate limits
Phase 1: Discovery      → Run test batches in parallel, collect failures
Phase 2: Analysis       → Categorize failures by root cause
Phase 3: Fix            → Fix ONE category at a time
Phase 4: Verification   → Re-run affected tests, confirm >80% pass
Phase 5: Iterate        → Repeat until pass rate >90%
```

**Failure Categories**:
| Category | Indicators | Priority |
|----------|------------|----------|
| `AUTH_FAILURE` | 401, Invalid credentials | P0 |
| `RATE_LIMIT` | 429, Too many requests | P0 |
| `SERVER_ERROR` | 500, ECONNREFUSED | P0 |
| `DATA_MISSING` | Test data not found | P1 |
| `SELECTOR_BROKEN` | Element not found | P2 |
| `LOGIC_ERROR` | Assertion failures | P2 |
| `HANG` | No progress >30s | P3 |

**Operational Constraints** (prevent resource exhaustion):
- Batch size: Max 5 test files per sub-agent (enables faster feedback)
- Stop threshold: 3 consecutive OR 5 total failures (early detection of systemic issues)
- Timeout: Hard 30s limit (surfaces hanging tests immediately)
- Fix order: Highest impact first (maximizes pass rate improvement)

**Key Files**:
- `.claude/commands/fix-e2e-tests.md` - Slash command entry point
- `~/.claude/skills/e2e-test-repair/` - Skill with reference files

**Usage**: `/fix-e2e-tests` or `/fix-e2e-tests --resume`

**Skill References**:
- `failure-categories.md` - Detailed category definitions
- `fix-patterns.md` - Proven fixes per category
- `test-runner-agent.md` - Sub-agent prompt for test execution
- `fix-agent.md` - Sub-agent prompt for fix implementation
- `handoff-protocol.md` - Context-aware session management

### Unified Execution Protocol (v4.1.0+)
Beads-first orchestration with parallel specialist delegation.

**Problem Solved**: Context exhaustion without clean handoffs, tasks not tracked in Beads before execution, subagent work lost on context limits.

**Solution**: Create ALL Beads tasks with dependencies BEFORE any execution, then delegate to parallel specialists with context-aware monitoring.

**Key Principle**: Main agent creates full task graph upfront, then orchestrates parallel execution waves.

**Execution Flow**:
```
Phase 0: Pre-Flight
├─ Quality hooks verification
├─ Repository health check
└─ Branch setup

Phase 1: Beads Task Decomposition (BEFORE any execution)
├─ Analyze full work scope
├─ Create ALL beads tasks with bd create
├─ Define ALL dependencies with bd dep add
└─ Create execution plan (parallel waves)

Phase 2: Parallel Execution
├─ Wave N: Launch parallel subagents (each on assigned Beads task)
├─ Collect status reports (STATUS, COMPLETED, REMAINING, BLOCKERS)
├─ Handle completions → bd close
├─ Handle checkpoints → bd note, continuation queue
├─ Handle blockers → prompt user
├─ Update documents (tasks.md, specs)
└─ Checkpoint (git commit, bd sync)

Phase 3: Context-Aware Monitoring
├─ Monitor orchestrator context (75% limit)
└─ Graceful stop with full state saved

Phase 4: Post-Execution
├─ Verify all deliverables
├─ Run full test suite
├─ Close all beads tasks
└─ Final commit and summary
```

**Beads-First Benefits**:
- Every subagent has a tracked task ID
- Dependencies prevent out-of-order execution
- Progress survives context exhaustion
- Clean handoff via `bd show <TASK_ID>`

**Subagent Status Report Format**:
```
STATUS: [completed | stopped_at_checkpoint | blocked]
TASK_ID: <beads_task_id>
COMPLETED: [bullet list]
REMAINING: [bullet list]
STOPPED_AT: [exact point - file:line or step]
NEXT_ACTION: [what next agent should do first]
BLOCKERS: [any issues]
```

**User Decision Prompts**: Main agent ALWAYS prompts user for:
- Blocked tasks (resolve | skip | abort)
- Checkpoint continuations (continue | defer | investigate)
- Execution plan confirmation before starting

**Key Files**:
- `instructions/core/execute-tasks.md` - Full protocol
- `.claude/commands/execute-tasks.md` - Command entry point

**Configuration** (`config.yml`):
```yaml
unified_execution:
  enabled: true
  beads_first: true
  context_limit: 0.75
  parallel_waves: true
```

### Test Integrity Maintenance (v4.5.0+)
Proactive analysis of existing tests BEFORE implementation to prevent test rot.

**Problem Solved**: Tests become outdated silently when implementation changes but tests aren't updated. This leads to:
- Tests that "pass" but test wrong behavior
- Misleading coverage metrics
- Bugs that slip through "passing" test suites
- Invisible technical debt accumulation

**Solution**: Analyze existing tests BEFORE building, create explicit update tasks:

```
Phase 1.5: Test Integrity Analysis (NEW)
├─ Identify files being modified
├─ Discover all tests that touch those files
├─ Categorize by impact (critical/high/medium)
├─ Create Beads tasks for test updates
└─ Link updates to implementation (dependencies)
```

**How It Works**:
1. **Scope Analysis**: Extract files/functions being modified from task spec
2. **Test Discovery**: Search for tests that:
   - Directly test modified files (`login.test.ts` for `login.ts`)
   - Mock modified modules (`vi.mock('./auth/login')`)
   - Use related fixtures (if schema changes)
   - Cover affected E2E routes
3. **Impact Categorization**:
   - `critical`: Directly tests modified code
   - `high`: Mocks the modified module
   - `medium`: Indirect consumer or fixture user
4. **Task Creation**: Auto-create Beads tasks for test updates
5. **Dependency Linking**: Test updates depend on implementation completion

**Key Files**:
- `instructions/agents/test-integrity-analyzer.md` - Analysis phase instructions
- `instructions/core/execute-tasks.md` (Phase 1.5) - Workflow integration

**Discovery Strategies**:
```yaml
# Direct test files
GLOB: "**/{filename}.test.{ts,tsx,js}"
GLOB: "**/{filename}.spec.{ts,tsx,js}"

# Mock references
GREP: "vi.mock.*{module_path}"
GREP: "jest.mock.*{module_path}"

# Import references in tests
GREP: "import.*from.*{module_path}"
SCOPE: "**/*.test.*, **/*.spec.*"

# E2E route tests
GREP: "page.goto.*{affected_route}"
SCOPE: "tests/e2e/**"
```

**Output Example**:
```
TEST INTEGRITY ANALYSIS - COMPLETE

Change Scope: 3 files, 5 functions

Affected Tests: 8
   Critical: 2 (must update)
   High: 3 (check signatures)
   Medium: 3 (verify behavior)

Test Update Tasks Created:
   beads-abc: Update auth tests (depends on beads-impl-001)
   beads-def: Verify login E2E (depends on beads-impl-001)

Report: .agent-os/test-integrity/TASK-001-analysis.json
```

**Enforcement Modes**:
| Mode | Behavior |
|------|----------|
| `advisory` | Log findings, create tasks, continue (default) |
| `warning` | Show warnings, require acknowledgment |
| `blocking` | Cannot proceed with unaddressed critical tests |

**Configuration** (`config.yml`):
```yaml
test_integrity_maintenance:
  enabled: true
  triggers:
    before_every_task: true
    on_file_modification: true
  task_creation:
    auto_create_beads_tasks: true
    add_dependencies: true
  enforcement:
    mode: "advisory"
```

### TypeScript Type Checking (v4.3.0+)
Mandatory TypeScript type verification to prevent type errors from entering the codebase.

**Problem Solved**: TypeScript errors were accumulating because:
- `syntax_check.js` only validates JavaScript syntax, not TypeScript types
- No explicit directive for agents to run `tsc --noEmit`
- No pre-commit hook to block commits with type errors

**Solution**: Multi-layer type checking:

| Layer | Implementation | When | What It Catches |
|-------|---------------|------|-----------------|
| Validator | `hooks/validators/type_checking.js` | Per-file write | Immediate errors |
| Task Verification | `execute-tasks.md` Step 4.2 | Before task completion | Accumulated errors |
| Pre-commit Hook | `.git/hooks/pre-commit` | Before commit | Final safety net |

**Key Commands**:
```bash
# Manual type check
pnpm tsc --noEmit

# Install pre-commit hook
~/.agent-os/setup/install-typescript-precommit.sh

# Add typecheck script to package.json
npm pkg set scripts.typecheck="tsc --noEmit"
```

**Configuration** (`config.yml`):
```yaml
typescript_checking:
  enabled: true
  triggers:
    on_file_write: true
    on_task_completion: true
    pre_commit: true
  error_handling:
    block_on_error: true
```

Before completing any task in a TypeScript project, run `pnpm tsc --noEmit` and fix all errors.

**Key Files**:
- `.claude/commands/run-tests.md` - Full protocol (v4.1)
- `instructions/agents/test-runner.md` - Test execution reference (v3.1)

**Usage**: `/run-tests` command triggers the workflow.

### Test/Code Alignment (v3.3.0+)
Ensures tests and implementation code remain aligned throughout TDD cycle.

**Problem Solved**: E2E tests need rework because implementation doesn't match test patterns.

**Solution**: Pattern documentation + context handoff:

**Key Files**:
- `instructions/utilities/test-code-alignment-checklist.md` - Full alignment guide
- `instructions/agents/implementation-context-handoff.md` - GREEN phase guidance
- `execute-tasks.md` (Steps 2.1a, 2.2a) - Workflow integration

**Workflow**:
1. **RED Phase (2.1)**: test-architect documents patterns used
   - Output: `.agent-os/test-context/[TASK_ID]-patterns-used.json`
2. **Step 2.1a**: Orchestrator verifies pattern documentation exists
3. **GREEN Phase (2.2)**: implementation-specialist reads pattern file FIRST
4. **Step 2.2a**: Alignment validation before marking GREEN complete

**Pattern Documentation** (created by test-architect):
```json
{
  "patterns_used": {
    "mocking": { "approach": "vi.mock()", "modules_mocked": [...] },
    "assertions": { "library": "@vitest/expect", "patterns": [...] },
    "e2e_patterns": { "locators": "data-testid", "waiting": "waitForSelector" }
  },
  "critical_notes": ["API must be mocked", "Auth via fixtures"]
}
```

**Configuration** (`config.yml`):
```yaml
test_execution_monitoring:
  enabled: true
  per_test_timeout:
    unit_test: 5000
    e2e_test: 30000
  intervention:
    on_hung_test: "alert"

test_code_alignment:
  enabled: true
  pattern_documentation:
    required: true
  alignment_validation:
    coverage_threshold: 85
```

### Subagent Delegation Template (v3.2.1+)
Ensures mandatory instructions, skills, and context are passed to subagents in orchestrated workflows.

**Problem Solved**: When delegating work via `Task()`, subagents do NOT automatically inherit:
- Mandatory instruction loading requirements
- Skill invocation requirements from config.yml
- Global CLAUDE.md context
- Pattern lookup hierarchy

**Solution**: Standard delegation template at `instructions/utilities/subagent-delegation-template.md`

**Key Files**:
- `instructions/utilities/subagent-delegation-template.md` - Copy-paste template for Task() prompts
- `instructions/core/execute-tasks.md` (Step 1.9a) - Template reference
- `instructions/core/create-spec.md` - Subagent delegation guidance section
- `instructions/agents/test-context-gatherer.md` (Section 2.0) - Mandatory skill invocations

**Required Skills by Phase**:

| Phase | Required Skills |
|-------|-----------------|
| Test Context (2.0) | `agent-os-test-research`, `agent-os-patterns` |
| Test Design (2.1) | `agent-os-patterns`, `agent-os-specialists` |
| Implementation (3.0) | `agent-os-patterns`, `agent-os-specialists` |
| Security Review (4.0) | `agent-os-specialists` |
| Spec Creation | `agent-os-patterns`, shadcn MCPs for UI |

**Verification Checklist** (after delegation):
- [ ] Instruction file was read and key constraints stated
- [ ] Required skills were invoked (check for Skill() calls)
- [ ] Project-specific patterns were checked first
- [ ] All deliverables were produced

**Configuration** (`config.yml`):
```yaml
skills_integration:
  enabled: true
  invocation_mode: "explicit"  # or "auto" for model-invoked
test_context_gathering:
  documentation_sources:
    priority:
      - skills           # Priority 1: Always available
      - dockfork_mcp     # Priority 2: If MCP available
      - context7_mcp     # Priority 3: If MCP available
      - websearch        # Priority 4: Fallback
```

### TypeScript Type Checking (v4.3.0+)
Mandatory TypeScript type verification to prevent type errors from entering the codebase.

**Problem Solved**: TypeScript errors were accumulating because:
- `syntax_check.js` only validates JavaScript syntax, not TypeScript types
- No explicit directive for agents to run `tsc --noEmit`
- No pre-commit hook to block commits with type errors

**Solution**: Multi-layer type checking:

| Layer | Implementation | When | What It Catches |
|-------|---------------|------|-----------------|
| Validator | `hooks/validators/type_checking.js` | Per-file write | Immediate errors |
| Task Verification | `execute-tasks.md` Step 4.2 | Before task completion | Accumulated errors |
| Pre-commit Hook | `.git/hooks/pre-commit` | Before commit | Final safety net |

**Key Commands**:
```bash
# Manual type check
pnpm tsc --noEmit

# Install pre-commit hook
~/.agent-os/setup/install-typescript-precommit.sh

# Add typecheck script to package.json
npm pkg set scripts.typecheck="tsc --noEmit"
```

**Configuration** (`config.yml`):
```yaml
typescript_checking:
  enabled: true
  triggers:
    on_file_write: true
    on_task_completion: true
    pre_commit: true
  error_handling:
    block_on_error: true
```

Before completing any task in a TypeScript project, run `pnpm tsc --noEmit` and fix all errors.

### Validator Improvements (v3.0+)

**Configurable Test Standards** (`hooks/validators/test_standards.js` v2.0):
- All thresholds configurable via `config.yml`
- Per-file skip directives: `// @agent-os-skip test-standards:<check>`
- CI environment auto-detection (stricter validation in CI)
- Enhanced error messages with why/fix/example guidance

**Skip Directives** (add to first 10 lines of test file):
```javascript
// @agent-os-skip test-standards:assertions
// @agent-os-skip test-standards:console-limit
// @agent-os-skip test-standards:timeout-config
```

**TDD State Manager** (`hooks/tdd-state-manager.js`):
- Tracks RED-GREEN-REFACTOR cycle per task
- Auto-transition on metrics changes
- Phase validation and action blocking
- Enforcement levels: strict/standard/relaxed

**Validator Registry** (`hooks/validator-registry.js`):
- Pluggable validator system
- Dynamic discovery and registration
- Priority-based execution ordering
- Configuration-driven enable/disable

**Standalone Execution** (`instructions/core/execute-tasks.md`):
- Execute tasks without Beads dependency
- Simplified workflow for prototyping
- Full TDD state integration (optional)

## Checklist: Task Execution

Before marking task complete:
- [ ] All files in deliverable manifest exist
- [ ] **TypeScript type check passes** (`pnpm tsc --noEmit`) - important for TypeScript projects
- [ ] All tests pass (`test:unit:ci`, `test:e2e:ci`)
- [ ] **Existing tests verified** - Test integrity analysis completed (v4.5.0+)
- [ ] No P1 security findings
- [ ] Acceptance criteria verified with evidence
- [ ] Integration points tested
- [ ] `bd sync` if using Beads

## Checklist: Test Creation

**Reference**: See `@standards/testing-standards.md` for test creation requirements.

Before creating tests:
- [ ] Read `@standards/testing-standards.md` (canonical reference)
- [ ] Read `instructions/agents/test-architect.md`
- [ ] Complete Pre-Creation Checklist (Section 5 of testing-standards.md)
- [ ] Verify test type (unit/integration/E2E)
- [ ] Confirm file location matches Section 2 standards
- [ ] Add appropriate timeouts (Section 1)
- [ ] No `.only()` or debug patterns (Section 7)
- [ ] Real assertions (not just `expect(true)`)

## Common Commands

```bash
# Install Agent OS in a project
~/.agent-os/setup/install-agent-os.sh

# Update existing installation
~/.agent-os/setup/update-agent-os.sh --target ./.agent-os

# Rollout to all projects
~/.agent-os/setup/rollout-agent-os.sh

# Install quality hooks
~/.agent-os/setup/install-hooks.sh

# Install TDD hooks
~/.agent-os/setup/install-tdd-hooks.sh
```

## File Reference Format

Use consistent references for traceability:
- Internal: `src/models/user.rb:42` or `app/controllers/auth.ts:105-120`
- Standards: `@.agent-os/standards/rails-patterns.md:250`
- External: Full URLs

## Configuration

All features toggled in `config.yml`:
- `test_integrity_maintenance.enabled: true` - v4.5 proactive test analysis (NEW)
- `typescript_checking.enabled: true` - v4.3 TypeScript type verification
- `unified_execution.enabled: true` - v4.1 Beads-first orchestration
- `skills_integration.enabled: true` - v3.2 skills-based context
- `test_infrastructure.enabled: true` - v2.9 test reliability
- `tdd_enforcement.enabled: true` - Test-first workflow
- `beads.enabled: true` - Git-backed task tracking
- `quality_hooks.enabled: true` - Auto-validation
- `compound_engineering.enabled: true` - Review workflow phases

## Additional Documentation

- [Glossary](docs/GLOSSARY.md) - Terminology definitions
- [Getting Started](docs/GETTING_STARTED.md) - New user guide
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues and solutions
- [FAQ](docs/FAQ.md) - Frequently asked questions
- [Architecture](docs/ARCHITECTURE.md) - System architecture
