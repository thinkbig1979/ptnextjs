# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Agent OS Framework

This is an Agent OS configuration repository that provides structured workflows for AI agents to build products systematically. Agent OS is designed to help agents follow consistent patterns for product planning, specification creation, task management, and execution.

### Core Commands

Agent OS provides main commands accessible through markdown files in the `commands/` directory:

**Core Workflow Commands:**
- `plan-product.md` - Plan new products and install Agent OS in codebases
- `analyze-product.md` - Analyze existing codebases and install Agent OS
- `create-spec.md` - Create detailed feature specifications with technical requirements
- `create-tasks.md` - Break down specifications into executable tasks
- `execute-tasks.md` - Execute individual tasks from the task list using **Orchestrated Parallel Execution**

**Maintenance & Upgrade Commands:**
- `upgrade-spec.md` - Fully modernize existing specs to v2.1 standards (complete re-evaluation and regeneration)
- `enhance-existing.md` - Add validation requirements to existing specs (preserves structure, adds validation)

**Validation Commands:**
- `validate-browser.md` - Mandatory browser testing for web components
- `validate-quality.md` - Comprehensive quality validation for specifications
- `validate-system.md` - System-wide validation and health checks

Each command references detailed instructions in `instructions/core/` that provide step-by-step workflows.

### Orchestrated Parallel Execution (v2.0)

Agent OS v2.0 introduces **Orchestrated Parallel Task Execution**, providing:

- **60-80% faster task completion** through intelligent parallel processing
- **Specialist agent coordination** for testing, implementation, integration, quality, security, and documentation
- **Advanced error handling** with automatic recovery and intelligent escalation
- **Context optimization** for maximum efficiency and relevance
- **🆕 Deliverable Verification (v2.5+)**: Mandatory verification of all files and deliverables before task completion

The execution system uses Claude Code's agent framework to coordinate task execution systematically, with optimized context and focused responsibilities for each task phase.

### Deliverable Verification Framework (v2.5+)

Agent OS v2.5+ includes **Mandatory Deliverable Verification** that ensures orchestrators verify all subagent deliverables before marking tasks complete:

- **100% file verification** - All expected files verified to exist using Read tool
- **Test execution validation** - All tests verified to pass using test-runner
- **Acceptance criteria evidence** - All criteria verified with tangible proof
- **Integration verification** - All integration points verified to work correctly
- **Automatic blocking** - Tasks cannot be marked complete without passing verification

This prevents the critical issue where orchestrators marked tasks complete while files were missing. The orchestrator now:
1. Creates a deliverable manifest before delegation
2. Tracks deliverable completion during execution
3. Verifies ALL deliverables exist after execution
4. Only marks task complete after verification passes

See `instructions/utilities/deliverable-verification-guide.md` for comprehensive verification workflows.

### Task File Structure Optimization (v2.1)

Agent OS v2.1 introduces **Optimized Task File Structure**, providing:

- **90%+ reduction in context consumption** through split file architecture
- **Lightweight master tasks.md** (~50-100 lines) for quick overview and task selection
- **Individual task detail files** (tasks/task-*.md) loaded only when executing specific tasks
- **Scales efficiently** to 50+, 100+, or 200+ tasks without context bloat

The split structure separates essential task overview (ID, title, agent, time, dependencies, link) from verbose implementation details (acceptance criteria, testing requirements, evidence specifications). This dramatically improves performance when reviewing task lists or selecting next tasks. See `TASK_FILE_OPTIMIZATION_GUIDE.md` for detailed documentation.

### Automatic Quality Enforcement (v2.2+)

Agent OS v2.2+ includes an **Automatic Quality Hooks System** that validates and auto-fixes every file write and edit operation using **Claude Code's native PostToolUse hooks**:

- **Zero manual intervention** - formatters, linters, and validators run automatically after every file operation
- **7 integrated validators** - syntax, formatting, linting, imports, type checking, security, test generation
- **Auto-fix capabilities** - automatically corrects formatting, imports, and safe lint issues
- **60% context token savings** - catches errors early, preventing iteration cycles
- **~0.8s overhead per file** - parallel execution optimized for performance
- **Language-agnostic** - supports JavaScript, TypeScript, Python, CSS, JSON, YAML, Markdown, and more
- **Native integration** - Uses Claude Code's built-in hook system for reliable, automatic triggering

Every file creation and modification automatically triggers validation through Claude Code's PostToolUse hooks (configured in `.claude/settings.json`). Issues are detected and often auto-fixed immediately, ensuring consistent code quality without manual effort.

**Installation**: Run `~/.agent-os/setup/install-hooks.sh` in your project to enable hooks.

See `CLAUDE_CODE_HOOKS_INTEGRATION.md` for setup guide and `instructions/utilities/quality-hooks-guide.md` for comprehensive documentation.

### Compound Engineering Integration (v2.7+)

Agent OS v2.7+ introduces **Compound Engineering Philosophy** - a comprehensive set of 15 transformative features that ensure each unit of engineering work makes subsequent work easier, not harder:

#### Multi-Agent System (10 Specialized Review Agents)

**Deep Analysis Agents** for comprehensive code review:
- `security-sentinel` - Security vulnerability detection and OWASP Top 10 analysis
- `performance-oracle` - Performance optimization and bottleneck identification
- `architecture-strategist` - Architectural pattern analysis and system design review
- `pattern-recognition-specialist` - Code pattern detection and reusability opportunities
- `code-simplicity-reviewer` - Complexity reduction and maintainability improvement
- `data-integrity-guardian` - Data validation, consistency, and integrity checks

**Research Agents** for context gathering:
- `repo-research-analyst` - Codebase pattern analysis and existing implementations
- `best-practices-researcher` - External best practice research and recommendations
- `framework-docs-researcher` - Framework documentation and convention research
- `git-history-analyzer` - Historical context and evolution analysis

All agents output standardized findings with severity (P1/P2/P3), effort estimation, and actionable solutions.

#### Interactive Triage Workflow

Comprehensive finding management system with intelligent prioritization:
- **One-by-one presentation** - Process findings individually with full context
- **Progress tracking** - Real-time progress display ("Finding 5/12 - 40% complete")
- **Time estimation** - Dynamic time remaining calculation based on actual processing speeds
- **Pause/resume capability** - State persistence to `.triage-state/` for multi-session triage
- **Structured todo generation** - Priority-based filenames (XXX-pending-p[1-3]-slug.md)
- **Interactive decisions** - Yes (create todo), Next (skip), Custom text options

Access via: `commands/triage.md` (1356 lines of comprehensive workflow)

#### Systematic Security Scanning

**6-Step Security Protocol** integrated into every task execution:
1. Input validation analysis (injection attacks, XSS)
2. SQL injection vulnerability detection
3. Authentication/authorization flaw identification
4. Data exposure risk assessment
5. OWASP Top 10 compliance checking
6. Security best practice verification

**P1 (CRITICAL) findings block task completion** - mandatory security gate prevents shipping vulnerable code.

Integration: Automatic scanning in `execute-task-orchestrated.md` Step 2.5

#### Ultra-Thinking Deep Dive Protocol

Multi-perspective analysis framework for comprehensive requirement gathering:
- **Stakeholder perspectives** - Developer, Ops, User, Security, Business viewpoints
- **Scenario exploration** - Edge cases, failure modes, scale considerations
- **Multi-angle review** - Technical, Business, Risk, Team impact analysis

Integrated into spec creation (Step 4.5) to ensure specifications consider all angles before development begins.

#### Finding Synthesis & Prioritization

Intelligent consolidation and ranking of multi-agent findings:
- **Duplicate removal** - Smart clustering of similar findings across agents
- **Severity assignment** - 🔴 P1 (Critical), 🟡 P2 (Important), 🔵 P3 (Nice-to-have)
- **Effort estimation** - Small/Medium/Large based on complexity analysis
- **ROI calculation** - Prioritize highest-impact, lowest-effort improvements
- **Categorization** - Security, Performance, Architecture, Quality, Data Integrity, Patterns

Outputs prioritized, actionable findings ready for triage workflow.

#### Git Worktree Isolation Pattern

**Isolated work environments** prevent context switching and file conflicts:
- Worktrees created at `.agent-os/worktrees/[task-id]/`
- Automatic branch creation and management
- Metadata tracking in `.worktree-metadata`
- Clean separation from main workspace
- Scripts: `setup/create-worktree.sh` and `setup/cleanup-worktree.sh`

Benefits: Parallel work on multiple tasks, test reviews without affecting main branch, easy cleanup.

#### Language-Specific Quality Standards

**5,773+ lines of comprehensive standards** across multiple languages:
- **Backend**: `standards/backend/rails-patterns.md` (1308 lines)
- **Backend**: `standards/backend/python-patterns.md` (2409 lines)
- **Frontend**: `standards/frontend/typescript-patterns.md` (2056 lines)
- **Additional**: API patterns, Database patterns, Styling patterns, HTML patterns

Each standard includes framework-specific validation rules, security patterns, linting configuration, anti-pattern detection, and code style conventions.

#### Code Examples in Specifications

**Real, working examples** from actual codebase:
- Actual code examples following established patterns
- Mock filenames with realistic structure (todos)
- ERD diagrams for model changes
- Research agents provide formatted examples automatically
- Reference format: `file_path:line_number` or `file.rb:42-58` for ranges

Ensures specifications are immediately actionable with proven patterns.

#### Multi-Level Planning Detail

**Three specification detail levels** for different feature complexities:
- **Minimal** - Simple features, quick development (basic structure only)
- **Standard** - Typical features, moderate complexity (full sections)
- **Comprehensive** - Complex features, architectural changes (includes ADRs, ultra-thinking)

User selects detail level during spec creation (Step 2.5) - template automatically includes appropriate sections.

#### Comprehensive Reference Collection

**Standardized reference format** for traceability:
- Internal: `src/models/user.rb:42` or `app/controllers/auth.ts:105-120`
- External: Full URLs to documentation
- Related: Issue/PR references (#123, PR #456)
- Standards: `@.agent-os/standards/rails-patterns.md:250`

All specifications, findings, and documentation use consistent reference format for easy navigation.

#### AI-Era Development Considerations

**Documentation for AI-assisted development**:
- AI tools used documented in specs
- Effective prompts captured for reuse
- AI-generated code review requirements
- Testing emphasis for rapid implementation
- Context sections for AI agents

Template section: `## AI Development Notes` in architecture-decisions-template.md

#### Enhanced Work Command

**Execute-task workflow improvements**:
- Explicit "read plan document" capability for PRD/design doc execution
- Automatic test execution after each task completion
- Task detail files loaded from `tasks/` directory
- Integration verification framework
- Deliverable verification before completion

All task orchestration includes automatic validation and testing.

#### Interactive Finding Presentation

**Real-time progress tracking during triage**:
- Progress display: "📊 Triage Progress: 15/42 findings (36%)"
- Time estimation: "⏱️ Estimated time remaining: ~27 minutes"
- Rolling average calculation (last 10 findings)
- Complexity adjustments (more P1s = longer estimates)
- Fastest/slowest finding metrics

Integrated into triage workflow for accurate planning.

#### Compounding Engineering Philosophy

**Core principle: Write code that compounds in value over time**

Four key concepts integrated throughout Agent OS:
1. **Reusability First** - Extract patterns, create composable components
2. **Composability** - Build features from existing building blocks
3. **Knowledge Capture** - Document patterns in CLAUDE.md, standards, examples
4. **Systematic Improvement** - Each task should leave codebase easier to work with

**Required in all workflows:**
- Reusability analysis in specifications
- Pattern documentation as task acceptance criteria
- Code review agents check for reusability opportunities
- Examples: shared UI components vs one-off implementations, extracted utilities vs duplicated logic

Documented in: `standards/best-practices.md` - Compounding Engineering Philosophy section

#### Beads Issue Tracking Integration (v2.8+)

**Distributed, git-backed task tracking** for persistent agent memory across sessions:

Agent OS v2.8+ integrates **Beads** - a lightweight issue tracker designed specifically for AI coding agents. Beads provides distributed memory through git-backed task tracking, eliminating context window amnesia.

**Hybrid Architecture:**
- **Markdown** (tasks.md, tasks/*.md) - Human-readable specifications, acceptance criteria, implementation details
- **Beads** (.beads/issues.jsonl) - Execution state, dependency resolution, cross-session persistence

**Key Benefits:**
- **Persistent Memory** - Tasks survive context loss and session boundaries
- **Automatic Dependency Resolution** - `bd ready` finds unblocked work instantly
- **Discovered Work Tracking** - Issues found during implementation automatically linked with `discovered-from` dependencies
- **Git-Based Distribution** - Multi-agent safe with collision-resistant hash IDs (bd-a1b2)
- **Zero Context Cost** - SQLite cache (<100ms queries) + JSONL source of truth

**Integration Points:**
1. **Task Creation** (create-tasks.md Step 2.6) - Auto-sync markdown tasks to Beads
2. **Task Execution** (execute-task-orchestrated.md Step 0.2) - Query ready work before orchestration
3. **Task Completion** (execute-task-orchestrated.md Step 99) - Mark complete, sync to git, detect newly unblocked tasks
4. **Worktree Compatibility** - No-daemon mode prevents branch contamination

**Common Workflow:**
```bash
# Query unblocked tasks
bd ready

# Claim task
bd update impl-comp1-core --status in_progress

# (Execute task via Agent OS orchestration)

# Complete task
bd close impl-comp1-core --reason "All acceptance criteria met"

# Sync to git (CRITICAL at session end)
bd sync

# Check for newly unblocked work
bd ready
```

**MCP Integration:** When using Claude Code, prefer MCP function calls (`mcp__beads__ready()`) over CLI for structured return types and automatic workspace detection.

**Configuration:** Beads integration controlled via `config.yml` → `beads.enabled: true` (default). Disable with `false` to use markdown-only workflow.

**Documentation:** Complete guide at `instructions/utilities/beads-integration-guide.md`

**Installation:** `~/.agent-os/setup/install-beads.sh` (automatically prompted during Agent OS installation)

#### System Integration

All 15 features work together as a **compounding development system**:

**Spec Creation Pipeline:**
Research agents → Ultra-thinking → Multi-level detail → Code examples → AI considerations → Standardized references

**Quality Assurance Pipeline:**
Multi-agent review → Security scanning → Finding synthesis → Interactive triage → Progress tracking → Language standards validation

**Development Workflow:**
Beads task query → Worktree isolation → Work command orchestration → Security gate → Compounding philosophy → Deliverable verification → Beads sync

**Verification Status:** All 15 features verified operational (see `FEATURE_VERIFICATION_REPORT.md`). Beads integration added in v2.8+.

### Configuration Structure

The repository follows this organizational pattern:

```
.agent-os/
├── config.yml              # Agent OS version and project type configuration
├── commands/               # High-level command entry points
├── instructions/           # Detailed workflow instructions
│   ├── core/              # Main workflow instructions
│   ├── meta/              # Pre/post-flight checks
│   └── utilities/         # Utility guides and helpers
├── standards/             # Code and development standards
│   ├── best-practices.md  # Development guidelines
│   ├── code-style.md      # Formatting and naming conventions
│   ├── tech-stack.md      # Default technology choices
│   └── code-style/        # Language-specific style guides
└── setup/                 # Installation scripts
```

### Development Standards

#### Tech Stack Defaults
- **App Framework**: Next.js latest stable
- **Language**: TypeScript
- **Database**: PostgreSQL 17+
- **ORM**: Active Record
- **Frontend**: React latest stable
- **Build Tool**: Vite
- **Package Manager**: pnpm
- **Node Version**: 22 LTS
- **CSS**: TailwindCSS 4.0+
- **UI Components**: shadcn latest
- **Icons**: Lucide React components
- **Hosting**: Self-hosted Docker Compose stacks

#### Code Style Guidelines
- **Indentation**: 2 spaces (never tabs)
- **Methods/Variables**: snake_case
- **Classes/Modules**: PascalCase
- **Constants**: UPPER_SNAKE_CASE
- **Strings**: Single quotes ('') unless interpolation needed
- **Comments**: Explain "why" not "what", keep concise and accurate

#### Development Principles
- Keep implementations simple and avoid over-engineering
- Optimize for code readability over micro-optimizations
- Follow DRY principles - extract repeated logic to reusable components
- Choose well-maintained, popular libraries when adding dependencies
- Maintain consistent file organization and naming conventions

#### Automatic Quality Assurance
- **Quality hooks run automatically** on every file write and edit via Claude Code's native PostToolUse hooks
- **No manual validation needed** - syntax, formatting, linting, security checks happen automatically
- **Auto-fix enabled** - code formatting, import organization, and safe lint issues are corrected on-the-fly
- **Test generation** - basic test scaffolding is created for new source files
- **Configured in `.claude-settings.json`** - uses Claude Code's built-in hook system for reliability
- See `instructions/utilities/quality-hooks-guide.md` for details on the quality enforcement system

### Workflow Integration

When working with this Agent OS installation:

1. Use the command files in `commands/` as entry points
2. Each command will reference the appropriate instruction file in `instructions/core/`
3. Follow the standards defined in `standards/` for consistent code quality
4. The configuration in `config.yml` determines which agents are enabled and project structure

This framework enables systematic, repeatable workflows for product development while maintaining consistency across different projects and team members.