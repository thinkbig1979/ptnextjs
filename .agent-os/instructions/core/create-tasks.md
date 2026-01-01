---
description: Create Agent OS tasks from approved spec with micro-granular task generation
globs:
alwaysApply: false
version: 2.0
encoding: UTF-8
---

# Micro-Granular Task Creation

## Overview

Generate comprehensive, micro-granular tasks optimized for orchestrated parallel execution.

<pre_flight_check>
  EXECUTE: @.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

<process_flow>

<step number="1" subagent="context-fetcher" name="pre_execution_codebase_analysis">

### Step 1: Codebase Analysis

Use context-fetcher to identify reusable components, integration points, and patterns.

<codebase_analysis_instructions>
  ACTION: context-fetcher subagent to:
    - Identify existing components, APIs, models, utilities
    - Generate integration recommendations
    - Identify reuse opportunities
    - Map test patterns and quality standards
  CACHE: Analysis results
</codebase_analysis_instructions>

<analysis_scope>
  - **Components**: UI, business logic, utilities
  - **APIs**: Endpoints, controllers, middleware, auth
  - **Models**: DB models, types, validation
  - **Utilities**: Helpers, services, libraries
  - **Tests**: Patterns, mocks, coverage
  - **Patterns**: Architecture, organization, integration, quality
</analysis_scope>

<pattern_consistency_check version="5.0">
  **Purpose**: Ensure spec requirements align with existing codebase patterns.

  **Step 1.1: Load Pattern Documentation**
  ```yaml
  patterns_path: "{AGENT_OS_ROOT}/.agent-os/patterns"

  IF exists(patterns_path):
    LOAD:
      - architecture.md       # Overall patterns summary
      - frontend/routing.md   # URL structure (ID vs slug)
      - frontend/components.md # Component organization
      - backend/api.md        # API response format
      - global/naming.md      # Naming conventions

    EXTRACT constraints:
      url_pattern: "ID-based" | "slug-based" | "UUID-based"
      naming_convention: "PascalCase" | "kebab-case"
      api_format: "wrapped" | "flat"
      state_library: "zustand" | "redux" | "context"

  ELSE:
    WARN: "No patterns found. Run pattern-discovery-analyst first."
    SUGGEST: "Use /create-spec to trigger pattern discovery."
  ```

  **Step 1.2: Compare Spec Requirements**
  ```yaml
  FOR each spec requirement:
    COMPARE: requirement vs detected_patterns

    IF requirement.url_structure != patterns.url_structure:
      FLAG: "URL Pattern Conflict"
      DETAILS: "Spec uses {spec.url}, codebase uses {patterns.url}"

    IF requirement.naming != patterns.naming:
      FLAG: "Naming Convention Conflict"
      DETAILS: "Spec uses {spec.naming}, codebase uses {patterns.naming}"

    IF requirement.api_format != patterns.api_format:
      FLAG: "API Format Conflict"
      DETAILS: "Spec uses {spec.format}, codebase uses {patterns.format}"
  ```

  **Step 1.3: Resolve Conflicts**
  ```yaml
  IF conflicts_detected:
    PROMPT user:
      "Pattern conflicts detected between spec and existing codebase:

       1. URL Structure: Spec wants '{spec.url}', codebase uses '{patterns.url}'
       2. [other conflicts...]

       Options:
       A. Follow existing patterns (RECOMMENDED) - modify task requirements
       B. Deviate with justification - document as architectural decision
       C. Expand scope to refactor - update existing code to new pattern

       Which approach for each conflict?"

    WAIT: User decision

    FOR each conflict:
      IF decision == "follow_existing":
        UPDATE: Task requirements to match existing pattern
        NOTE: "Aligned with existing pattern: {pattern}"

      IF decision == "deviate":
        REQUIRE: Justification from user
        DOCUMENT: In tasks.md header and relevant task files
        CREATE: .agent-os/patterns/deviations/{spec_name}.md

      IF decision == "refactor":
        WARN: "Scope expansion - additional refactoring tasks will be created"
        CREATE: Refactoring tasks for existing code
        UPDATE: Dependency graph
  ```

  **Output**: Pattern-aligned task requirements ready for generation.
</pattern_consistency_check>

</step>

<step number="1.5" name="full_stack_feature_detection">

### Step 1.5: Full-Stack Feature Detection

Classify feature type to determine required phases.

<feature_classification>
  | Type | Indicators |
  |------|------------|
  | Backend-Only | CLI tools, background jobs, APIs (no UI), DB migrations only, batch processing |
  | Frontend-Only | Static pages, UI styling, client-side only, component library |
  | Full-Stack | User-facing + persistence, forms with backend, DB data display, auth/authz, API + UI |
</feature_classification>

<detection_instructions>
  ANALYZE: sub-specs/technical-spec.md for:
    BACKEND_REQUIRED: DB schema, API endpoints, business logic, data persistence
    FRONTEND_REQUIRED: UI, forms, user input, data display, browser functionality

  CLASSIFY:
    IF backend + frontend: FEATURE_TYPE = "full_stack" → Both phases
    ELIF backend only: FEATURE_TYPE = "backend_only" → Backend tasks
    ELIF frontend only: FEATURE_TYPE = "frontend_only" → Frontend tasks
    ELSE: FEATURE_TYPE = "unclear" → Request clarification
</detection_instructions>

<full_stack_validation>
  IF FEATURE_TYPE = "full_stack":
    REQUIRE:
      - Frontend phase (UI components)
      - Backend phase (API endpoints)
      - Integration task (frontend-backend)
      - E2E test (full workflow)
    VALIDATE:
      - Frontend agent → UI tasks
      - Backend agent → API tasks
      - Integration tasks → dependencies
</full_stack_validation>

</step>

<step number="1.6" subagent="file-creator" name="existing_tasks_detection_and_upgrade">

### Step 1.6: Existing Tasks Detection & Upgrade

Check for existing tasks and offer upgrade to v2.2.0 structure.

<existing_tasks_check>
  IF tasks.md NOT found: SKIP to Step 2
  IF found: CONTINUE
</existing_tasks_check>

<format_detection>
  | Format | Indicators | Action |
  |--------|------------|--------|
  | Monolithic | Single file, no tasks/ dir, inline details | Migrate to split |
  | Split v2.1 | tasks/ exists, no Phase 2/3/4 (Backend/Frontend/Integration) | Upgrade to v2.2 |
  | Split v2.2 | tasks/ exists, has Phase 2/3/4, specialized agents | Current format |
</format_detection>

<user_prompt_and_decision>
  IF v2.2:
    PROMPT: "Tasks in v2.2.0 format. Regenerate? (loses progress)"
    OPTIONS: 1=Keep (→Step 3), 2=Regenerate (backup→Step 2)

  IF v2.1:
    PROMPT: "Upgrade to v2.2.0 with full-stack phases?"
    OPTIONS: 1=Upgrade (preserve→upgrade), 2=Keep (→Step 3), 3=Regenerate (backup→Step 2)

  IF Monolithic:
    PROMPT: "Upgrade to v2.2.0 split structure?"
    OPTIONS: 1=Upgrade (preserve→upgrade), 2=Keep (→Step 3), 3=Regenerate (backup→Step 2)

  IF Unknown:
    PROMPT: "Format unclear. Keep or regenerate?"
    OPTIONS: 1=Keep (→Step 3), 2=Regenerate (backup→Step 2)
</user_prompt_and_decision>

<upgrade_workflow>
  PARSE: Extract task IDs, titles, completion status, dependencies
  CREATE: completed_tasks_list, in_progress_tasks_list

  BACKUP: [SPEC_FOLDER]/tasks.md.backup.[TIMESTAMP]
  IF tasks/ exists: [SPEC_FOLDER]/tasks.backup.[TIMESTAMP]/

  GENERATE: v2.2.0 tasks using Step 2 (full-stack, split, specialized agents)

  PRESERVE:
    FOR each completed_task:
      FIND: Equivalent in new tasks (ID match → semantic → fuzzy)
      IF found: Mark [x], add "# Preserved from v2.1.x - completed"
      ELSE: LOG unmapped task
    FOR each in_progress_task:
      IF found: Add "# In progress from v2.1.x"

  REPORT:
    - Preserved completed: [COUNT]
    - Preserved in-progress: [COUNT]
    - New tasks: [COUNT]
    - Backup: [PATH]
    - New phases: Backend, Frontend, Integration
</upgrade_workflow>

<task_matching_algorithm>
  1. Exact match: task_id identical
  2. Semantic match: Purpose + component (e.g., "Implement backend API" → "impl-backend-api")
  3. Fuzzy title: >70% similarity
  4. No match: Log for review
</task_matching_algorithm>

<safety_and_recovery>
  - ALWAYS backup before changes
  - Include timestamp
  - Never delete until backup confirmed
  - Rollback: Delete new, restore from backup
  - Confirm destructive actions
  - Multiple prompts for overwrites
</safety_and_recovery>

</step>

<step number="1.7" name="skill_pattern_lookup">

### Step 1.7: Load Code Patterns (v3.2+)

**⚠️ MANDATORY TOOL INVOCATION**

<skill_invocation_required>
  **STEP 1: Project-Specific Patterns FIRST**

  CHECK: .agent-os/patterns/ directory
  IF exists, READ:
    - .agent-os/patterns/frontend/typescript.md
    - .agent-os/patterns/backend/python.md
    - .agent-os/patterns/backend/rails.md
    - .agent-os/patterns/backend/api.md

  Project patterns OVERRIDE global patterns.

  **STEP 2: Global Skill**

  INVOKE: Skill(skill="agent-os-patterns")

  READ relevant references:
  | Task | Reference |
  |------|-----------|
  | Vitest | references/testing/vitest.md |
  | Playwright | references/testing/playwright.md |
  | Convex | references/testing/convex.md |
  | Strategy | references/testing/test-strategies.md |
  | Style | references/global/coding-style.md |

  USE: Include code examples, mocking syntax, file locations, naming in task detail files

  **VERIFICATION**:
  - [ ] Checked .agent-os/patterns/
  - [ ] Invoked Skill tool
  - [ ] Loaded relevant references
  - [ ] Patterns ready for tasks

  OUTPUT: "✅ Project: typescript.md | Skill: vitest.md, coding-style.md"
</skill_invocation_required>

<pattern_constraints_for_tasks version="5.0">
  **Purpose**: Inject pattern constraints into every task definition.

  **Step 1: Generate Constraints Block**
  ```yaml
  # Extract from loaded patterns
  constraints_block: |
    ## Pattern Constraints (AUTO-GENERATED)

    These patterns MUST be followed for integration consistency:

    | Category | Constraint | Source |
    |----------|------------|--------|
    | URL Structure | Use `/:id` (numeric), NOT `/:slug` | .agent-os/patterns/frontend/routing.md |
    | File Naming | Components: PascalCase.tsx | .agent-os/patterns/global/naming.md |
    | API Response | Wrap in `{ data: T }` | .agent-os/patterns/backend/api.md |
    | State | Use Zustand for global state | .agent-os/patterns/frontend/state.md |
    | Forms | React Hook Form + Zod | .agent-os/patterns/frontend/forms.md |

    **Deviation Protocol**: If you must deviate, STOP and document justification.
  ```

  **Step 2: Inject Into Task Files**
  ```yaml
  FOR each task-*.md file:
    INSERT: constraints_block after "## Context Requirements"

    # Example task structure:
    # ## Task: task-impl-user-profile
    # ## Context Requirements
    # - Read: src/components/...
    # ## Pattern Constraints (AUTO-GENERATED)  <-- INSERTED
    # - URL Structure: Use /:id...
    # ## Implementation Notes
    # ...
  ```

  **Step 3: Add to Master tasks.md Header**
  ```yaml
  INSERT in tasks.md header:
    ## Active Pattern Constraints

    All tasks in this spec follow these patterns:
    - **URL**: ID-based routing (`:id`)
    - **Naming**: PascalCase components, camelCase functions
    - **API**: `{ data: T }` response wrapper
    - **State**: Zustand + TanStack Query

    Pattern source: `.agent-os/patterns/`
    Last analyzed: {DATE}
  ```

  **Verification**:
  - [ ] Constraints block generated from patterns
  - [ ] Every task-*.md includes constraints section
  - [ ] Master tasks.md has pattern summary
  - [ ] Deviation protocol documented
</pattern_constraints_for_tasks>

</step>

<step number="2" subagent="file-creator" name="generate_micro_granular_tasks">

### Step 2: Generate Micro-Granular Tasks

Use file-creator to create lightweight master tasks.md + detailed task-*.md files.

<enhanced_task_generation>
  **Principles**:
  - Specificity: Single outcome per task
  - Agent optimization: Designed for specialists
  - Dependency mapping: Clear, parallel-ready
  - Context packaging: Autonomous execution
  - Quality gates: Embedded validation

  **Orchestration**:
  - Parallel streams: Simultaneous execution
  - Context distribution: Optimized allocation
  - Minimal blocking dependencies
  - Sized for context windows
</enhanced_task_generation>

<task_phases>
  🔍 **Phase 1: Pre-Execution**
  - Codebase analysis, integration planning
  - Full-stack classification

  🔧 **Phase 2: Backend** (if required)
  - Test design + implementation
  - DB schema, migrations
  - API endpoints
  - Business logic, validation
  - Backend integration testing

  🎨 **Phase 3: Frontend** (if required)
  - Test design + implementation
  - UI components
  - State management
  - Forms, validation
  - Responsive design, styling
  - Frontend integration testing

  🔗 **Phase 4: Integration** (if full-stack)
  - API contract validation
  - Frontend-backend data flow
  - E2E workflow testing
  - Cross-layer error handling

  ✅ **Phase 5: Final Validation**
  - Cross-layer integration
  - UAT
  - Performance, security
  - Documentation
</task_phases>

<micro_task_format>
  - **Task ID**: Unique identifier
  - **Title**: Specific, actionable
  - **Agent**: Specialist assignment (test-architect, frontend-vue-specialist, frontend-react-specialist, backend-nodejs-specialist, implementation-specialist, integration-coordinator, quality-assurance)
  - **Specifics**: Files, signatures, requirements
  - **Acceptance Criteria**: Measurable, verifiable
  - **Dependencies**: Prerequisites
  - **Context Requirements**: Autonomous execution info
  - **Estimated Time**: Realistic expectations
</micro_task_format>

<task_file_structure>
  ```
  specs/[spec-name]/
  ├── tasks.md              # Master list (~50-100 lines)
  └── tasks/
      ├── task-pre-1.md
      ├── task-test-comp1.md
      ├── task-impl-comp1-core.md
      └── ...
  ```

  **Master tasks.md**:
  - Metadata: spec, date, counts, time, granularity
  - Phases with task checkboxes
  - Per task: ID, title, agent, time, dependencies, link to details
  - Dependency graph
  - Summary: counts, parallel opportunities, times, scores

  **Individual task-*.md**:
  - Metadata: ID, phase, agent, time, dependencies, status
  - Description
  - Specifics: files, requirements, technical details
  - Acceptance criteria
  - Testing requirements (if applicable)
  - Evidence required (if applicable)
  - Context requirements (UX/UI specs if applicable)
  - Implementation notes
  - Quality gates (if applicable)
  - Related files
</task_file_structure>

<task_generation_instructions>
  SEQUENCE:
  1. CREATE: tasks/ subdirectory
  2. GENERATE: task-*.md files in tasks/
     - Format: task-[TASK_ID].md
     - Content: Full details from template
  3. GENERATE: Master tasks.md
     - Content: Lightweight list
     - Links: → detail files
     - Exclude: Verbose criteria, testing, evidence

  BENEFITS:
  - Master: ~50-100 lines vs 500-1000+
  - Details: Load only when executing task
  - Savings: 90%+ context reduction
  - Scales: 50+, 100+, 200+ tasks
</task_generation_instructions>

<intelligent_task_adaptation>
  - Leverage existing components (no reimplementation)
  - Follow established patterns
  - Reuse utilities, services
  - Maintain code style consistency
  - Package context for specialists
  - Include specific paths, signatures
  - Provide codebase examples
  - Optimize for context windows
  - Embed quality gates
  - Specific acceptance criteria
  - Reference quality standards
  - Ensure testability
</intelligent_task_adaptation>

<ux_ui_architecture_tasks>
  **CRITICAL: Frontend features REQUIRE UX/UI architecture tasks BEFORE components**

  **Why**: Prevents building components without navigation/routing (see @.agent-os/instructions/utilities/ux-ui-specification-checklist.md)

  **Required Tasks**:

  1. **ux-validate-arch-spec** - Validate UX/UI Architecture Completeness
     - Agent: quality-assurance, 10-15 min, depends: [test-frontend-ui OR pre-2]
     - Read sub-specs/ux-ui-spec.md, apply checklist
     - Verify Phase 1 complete: routes defined, navigation specified, layout integrated, entry points identified, flows documented
     - Block frontend if incomplete
     - AC: Phase 1 passes, no "TBD"/"if exists", entry points documented, flows have specs

  2. **design-e2e-test-strategy** - Design E2E Test Strategy (v5.1.0+)
     - Agent: test-architect, 15-20 min, depends: [ux-validate-arch-spec]
     - Read sub-specs/e2e-test-strategy.md (created in spec)
     - Verify all user flows have test plans
     - Assign tiers (smoke/core/regression) per @instructions/utilities/e2e-test-placement-checklist.md
     - Define data-testid attributes for all interactive elements
     - Document accessibility testing requirements
     - **OUTPUT**: .agent-os/specs/[spec]/e2e-strategy-verified.md
     - AC: All flows have tier assignment, data-testid list complete, accessibility requirements defined

  3. **impl-app-routes** - Implement Application Routes
     - Agent: frontend-[tech]-specialist, 15-20 min, depends: [design-e2e-test-strategy]
     - Create route definitions, guards/auth, nested routing, parameters, placeholder pages
     - AC: Routes accessible, auth works, nested render correctly, parameters captured, navigation works

  4. **impl-global-layout** - Implement Global Layout Shell
     - Agent: frontend-[tech]-specialist, 25-30 min, depends: [impl-app-routes]
     - Based on layout_strategy (NEW/EXTEND/USE): Create/modify components, header, sidebar, main area, responsive
     - AC: Layout renders, dimensions correct, responsive tested

  5. **impl-navigation-structure** - Implement Navigation Architecture
     - Agent: frontend-[tech]-specialist, 25-30 min, depends: [impl-global-layout]
     - Type (sidebar/top/hybrid), component, items, active state, mobile nav, breadcrumbs, user menu
     - AC: Items render, navigate correctly, active highlighted, mobile works, breadcrumbs show hierarchy, user menu functions

  6. **setup-component-library** - Setup UI Component Library
     - Agent: frontend-[tech]-specialist, 15-20 min, depends: [impl-navigation-structure]
     - Install library OR create base primitives, configure theme, design tokens
     - AC varies by library vs custom

  7. **impl-page-layouts** - Implement Page Layout Templates
     - Agent: frontend-[tech]-specialist, 25-30 min, depends: [setup-component-library]
     - Patterns (grid/form/list/master-detail/wizard), layout components, containers, hierarchy, spacing, responsive
     - AC: Patterns implemented, responsive tested

  8. **impl-frontend-components** - Implement UI Components
     - Agent: frontend-[tech]-specialist, 30-40 min, depends: [impl-page-layouts]
     - Use library OR custom, follow hierarchy, apply styling
     - **MUST include data-testid attributes** per design-e2e-test-strategy output
     - AC per @instructions/utilities/ui-acceptance-criteria-checklist.md

  9. **impl-user-flow-{name}** - Implement {FlowName} User Flow
     - Agent: frontend-[tech]-specialist, 25-35 min, depends: [impl-frontend-components, impl-frontend-state]
     - Complete flow steps, connect components, navigation, loading/error/success states
     - **BLOCKED BY**: test-user-flow-{name} must pass for task to complete

  10. **test-user-flow-{name}** - Create E2E Tests for {FlowName} User Flow
      - Agent: test-architect, 20-25 min, depends: [impl-frontend-components] (NOT impl-user-flow)
      - **⚠️ BLOCKING DEPENDENCY**: This task BLOCKS impl-user-flow-{name} completion
      - Read: @instructions/utilities/e2e-test-placement-checklist.md
      - Read: @standards/e2e-ui-testing-standards.md
      - Create E2E test per e2e-strategy-verified.md
      - Place in correct tier (smoke/core/regression)
      - Include accessibility assertions (axe-core)
      - Update test-inventory.ts
      - AC: E2E test passes, tier assigned correctly, accessibility scan passes, inventory updated

  11. **validate-browser-{flow}** - Browser Validation for {FlowName}
      - Agent: quality-assurance, 15-20 min, depends: [test-user-flow-{name}]
      - Run browser validation per @instructions/core/validate-browser.md
      - Verify Chrome, Firefox, Safari (if supported), Mobile
      - Run accessibility scan (WCAG 2.1 AA)
      - Check Core Web Vitals (LCP < 2.5s, CLS < 0.1)
      - **OUTPUT**: .agent-os/validation/[flow]-validation-report.json
      - AC: All browsers pass, 0 critical a11y violations, performance targets met
</ux_ui_architecture_tasks>

<e2e_test_blocking_dependencies>
  **⚠️ CRITICAL: E2E Tests BLOCK Implementation Completion (v5.1.0+)**

  **The Problem**: Previously, `test-user-flow-{name}` was optional - implementations could complete without E2E tests.

  **The Solution**: E2E test tasks now BLOCK implementation task completion.

  **Dependency Structure**:
  ```
  impl-frontend-components
           │
           ├─────────────────────────────┐
           ▼                             ▼
  impl-user-flow-{name}         test-user-flow-{name}
           │                             │
           │◄────── BLOCKS ──────────────┘
           │
           ▼
  validate-browser-{flow}
           │
           ▼
  User Flow COMPLETE ✅
  ```

  **Enforcement**:
  - impl-user-flow-{name} status remains "in_progress" until test-user-flow-{name} passes
  - Beads dependency: `bd dep add impl-user-flow-X test-user-flow-X`
  - Task completion gate verifies: `test-user-flow-{name}.status == "completed"`

  **Task File Template Addition**:
  ```yaml
  # In task-impl-user-flow-{name}.md
  blocking_dependencies:
    - task_id: test-user-flow-{name}
      type: e2e_test
      must_pass: true
      verification: "E2E tests pass + accessibility scan clean"

    - task_id: validate-browser-{flow}
      type: browser_validation
      must_pass: true
      verification: "Browser validation report generated with 0 critical issues"
  ```

  **User Flow Completion Criteria**:
  - [ ] impl-user-flow-{name} implementation complete
  - [ ] test-user-flow-{name} E2E tests pass
  - [ ] validate-browser-{flow} browser validation passes
  - [ ] Accessibility: 0 critical/serious violations
  - [ ] Performance: Core Web Vitals targets met
  - [ ] Evidence documented in task file
</e2e_test_blocking_dependencies>

</step>

<step number="2.6" name="beads_issue_sync">

### Step 2.6: Beads Issue Sync (Optional)

Sync tasks to Beads for persistent tracking across sessions.

<beads_integration>
  CHECK: config.yml → beads.enabled
  IF false: SKIP to Step 3

  INIT: IF .beads/ missing: bd init --quiet

  SYNC: ~/.agent-os/setup/sync-tasks-to-beads.sh [SPEC_FOLDER]
  PROCESS:
    - Read tasks.md, tasks/*.md
    - Create bd issue per task (matching ID)
    - Map dependencies → "blocks"
    - Set priority by phase (Integration=0, Pre=1, etc.)
    - Add labels: agent, phase, spec
    - bd sync to git

  OUTPUT:
    - Created: [COUNT]
    - Skipped: [COUNT]
    - Dependencies: [COUNT]
    - Priority: P0/P1/P2 counts
    - Commands: bd ready, bd list, bd dep tree

  IF bidirectional_sync: Tasks.md ↔ Beads auto-sync

  BENEFITS:
    - Persistent memory (survives context/sessions)
    - Dependency resolution (bd ready)
    - Visualization (bd dep tree)
    - Cross-session resume
    - Multi-agent safe (git-backed JSONL)

  ERROR: Warn, log, continue (non-critical)
</beads_integration>

</step>

<step number="3" name="micro_granular_execution_readiness">

### Step 3: Execution Readiness

Present task breakdown with orchestration overview.

<enhanced_readiness_summary>
  📊 **Summary**:
  - Total: [COUNT] tasks
  - Phases: [COUNT]
  - Parallel: [COUNT] simultaneous
  - Time: [SEQ] → [PAR] (60-80% faster)
  - Granularity: [SCORE]/1.0

  🤖 **Agents**:
  - Test Architect: [COUNT]
  - Implementation: [COUNT]
  - Integration: [COUNT]
  - QA: [COUNT]

  🎯 **Next**:
  - Phase 1: Pre-Execution ([COUNT] tasks)
  - First: [TITLE]
  - Agent: [AGENT]
</enhanced_readiness_summary>

<enhanced_execution_prompt>
  PROMPT:
  "🚀 Generated **[COUNT] micro-granular tasks** for orchestrated parallel execution.

  ✅ 60-80% faster via parallel processing
  ✅ Specialist optimization + focused context
  ✅ Implementation-ready specificity
  ✅ Embedded quality gates
  ✅ Codebase intelligence

  **Ready**:
  - Phase 1: Pre-Execution ([COUNT], [TIME])
  - Phase 2: Components ([COUNT], [TIME])
  - Phase 3: Integration ([COUNT], [TIME])

  **Options**:
  1. Orchestrated Parallel (recommended): All phases, specialists parallel
  2. Phase-by-Phase: One phase at a time
  3. Single Task: First task only

  Proceed with **Orchestrated Parallel**?"
</enhanced_execution_prompt>

<enhanced_execution_flow>
  IF orchestrated_parallel:
    REFERENCE: @.agent-os/instructions/core/execute-tasks.md
    MODE: Full orchestrated, Beads-first
    OPTIMIZATION: Generated context packages

  IF phase_by_phase:
    REFERENCE: @.agent-os/instructions/core/execute-tasks.md
    MODE: Sequential phase, micro-granular tasks
    FOCUS: Complete phase before next

  IF single_task:
    REFERENCE: @.agent-os/instructions/core/execute-tasks.md
    MODE: Single task validation
    CONSTRAINT: Execute first, wait confirmation

  ELSE: WAIT for clarification
</enhanced_execution_flow>

</step>

</process_flow>

<post_flight_check>
  EXECUTE: @.agent-os/instructions/meta/post-flight.md
</post_flight_check>
