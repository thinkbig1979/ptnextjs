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

The orchestrated system uses a master `task-orchestrator` that coordinates multiple specialist agents working in parallel, each with optimized context windows and focused responsibilities. See `ORCHESTRATED_EXECUTION_GUIDE.md` for detailed documentation.

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