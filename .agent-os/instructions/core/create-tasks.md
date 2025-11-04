---
description: Create an Agent OS tasks list from an approved feature spec with micro-granular task generation
globs:
alwaysApply: false
version: 2.0
encoding: UTF-8
---

# Enhanced Micro-Granular Task Creation Rules

## Overview

With the user's approval, proceed to creating a comprehensive, micro-granular tasks list based on the current feature spec. This enhanced workflow generates implementation-ready tasks optimized for orchestrated parallel execution.

<pre_flight_check>
  EXECUTE: @.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

<process_flow>

<step number="1" subagent="context-fetcher" name="pre_execution_codebase_analysis">

### Step 1: Pre-Execution Codebase Analysis

Use the context-fetcher subagent to perform comprehensive codebase analysis before task generation to identify reusable components, integration points, and architectural patterns.

<codebase_analysis_instructions>
  ACTION: Use context-fetcher subagent to:
    - REQUEST: "Perform comprehensive codebase analysis to identify existing components, APIs, models, and utilities"
    - REQUEST: "Generate integration recommendations based on existing code patterns"
    - REQUEST: "Identify reuse opportunities and architectural consistency requirements"
    - REQUEST: "Map existing test patterns and quality standards"
  PROCESS: Codebase intelligence for informed task generation
  CACHE: Analysis results for task optimization
</codebase_analysis_instructions>

<analysis_scope>
  <code_scanning>
    - Components: UI components, business logic components, utility components
    - APIs: Endpoints, controllers, middleware, authentication patterns
    - Models: Database models, data types, validation schemas
    - Utilities: Helper functions, services, shared libraries
    - Tests: Existing test patterns, mock strategies, coverage approaches
  </code_scanning>
  <pattern_analysis>
    - Architectural patterns: MVC, Repository, Service Layer, etc.
    - Code organization: File structure, naming conventions
    - Integration patterns: How components communicate
    - Quality patterns: Testing approaches, validation methods
  </pattern_analysis>
</analysis_scope>

</step>

<step number="1.5" name="full_stack_feature_detection">

### Step 1.5: Full-Stack Feature Detection

Analyze the spec to determine if this is a full-stack feature requiring both frontend and backend implementation.

<feature_classification>
  <backend_only_features>
    - CLI tools and command-line utilities
    - Background jobs and scheduled tasks
    - APIs for external service consumption (no UI)
    - Database migrations and schema updates only
    - Server-side batch processing
  </backend_only_features>

  <frontend_only_features>
    - Static page updates (no backend changes)
    - UI styling and layout improvements
    - Client-side only features (no API calls)
    - Component library additions
  </frontend_only_features>

  <full_stack_features>
    - User-facing features with data persistence
    - Forms that submit data to backend
    - Pages that display database data
    - Features with authentication/authorization
    - Any feature requiring API + UI
  </full_stack_features>
</feature_classification>

<detection_instructions>
  ACTION: Analyze sub-specs/technical-spec.md for indicators:
    BACKEND_REQUIRED:
      - Database schema changes mentioned
      - API endpoints specified
      - Business logic requirements
      - Data persistence needs

    FRONTEND_REQUIRED:
      - User interface mentioned
      - Forms or user input
      - Display of data to users
      - User interaction workflows
      - Browser-based functionality

  CLASSIFY:
    IF backend_required AND frontend_required:
      FEATURE_TYPE = "full_stack"
      REQUIRE: Both frontend and backend task phases
    ELIF backend_required ONLY:
      FEATURE_TYPE = "backend_only"
      GENERATE: Backend tasks only
    ELIF frontend_required ONLY:
      FEATURE_TYPE = "frontend_only"
      GENERATE: Frontend tasks only
    ELSE:
      FEATURE_TYPE = "unclear"
      ESCALATE: Request user clarification
</detection_instructions>

<full_stack_validation>
  IF FEATURE_TYPE = "full_stack":
    REQUIRE:
      - Frontend task phase with UI components
      - Backend task phase with API endpoints
      - Integration task for frontend-backend connection
      - E2E testing task that validates full user workflow

    VALIDATE:
      - Frontend agent assigned to UI tasks
      - Backend agent assigned to API tasks
      - Integration tasks have proper dependencies
</full_stack_validation>

</step>

<step number="1.6" subagent="file-creator" name="existing_tasks_detection_and_upgrade">

### Step 1.6: Existing Tasks Detection and Upgrade

Check if tasks already exist for this spec and offer to upgrade to v2.2.0 full-stack structure while preserving completed work.

<existing_tasks_check>
  ACTION: Check if [SPEC_FOLDER]/tasks.md exists

  IF tasks.md NOT found:
    SKIP this step
    PROCEED to Step 2

  IF tasks.md found:
    CONTINUE with detection and upgrade flow
</existing_tasks_check>

<format_detection>
  ACTION: Analyze existing tasks.md format

  <format_indicators>
    <monolithic_format>
      Indicators:
        - Single tasks.md file with all details inline
        - No tasks/ subdirectory
        - Task details embedded directly in checkbox items
      Version: Pre-2.1.0 (legacy)
    </monolithic_format>

    <split_format_v21>
      Indicators:
        - tasks.md references tasks/task-*.md files
        - tasks/ subdirectory exists
        - Does NOT have separate Phase 2 (Backend), Phase 3 (Frontend), Phase 4 (Integration)
        - Has generic "Component Implementation" phases
      Version: 2.1.x (needs full-stack upgrade)
    </split_format_v21>

    <split_format_v22>
      Indicators:
        - tasks.md references tasks/task-*.md files
        - tasks/ subdirectory exists
        - HAS Phase 2 (Backend Implementation), Phase 3 (Frontend Implementation), Phase 4 (Integration)
        - Uses specialized agents (frontend-vue-specialist, backend-nodejs-specialist)
      Version: 2.2.0 (current format)
    </split_format_v22>
  </format_indicators>

  CLASSIFY format as: MONOLITHIC | SPLIT_V21 | SPLIT_V22 | UNKNOWN
</format_detection>

<user_prompt_and_decision>
  IF format = SPLIT_V22:
    MESSAGE: "✅ Tasks already in v2.2.0 format with full-stack phases"
    PROMPT: "Regenerate tasks anyway? This will overwrite existing tasks.
             Options:
             1. Keep existing tasks (recommended if in progress)
             2. Regenerate fresh (loses all progress)"

    IF user_choice = "keep":
      SKIP Step 2
      PROCEED to Step 3
    ELIF user_choice = "regenerate":
      WARN: "⚠️ This will overwrite existing tasks. Backup will be created."
      BACKUP: Create [SPEC_FOLDER]/tasks.md.backup.[TIMESTAMP]
      PROCEED to Step 2

  IF format = SPLIT_V21:
    MESSAGE: "📋 Found tasks in v2.1.x format (no full-stack phases)"
    PROMPT: "Upgrade to v2.2.0 with full-stack detection?
             Options:
             1. Upgrade to v2.2.0 (preserves completed tasks, adds full-stack phases)
             2. Keep existing tasks (no changes)
             3. Regenerate fresh (loses all progress)"

    IF user_choice = "upgrade":
      ACTION: Execute upgrade workflow (see below)
      SKIP Step 2 (already generated during upgrade)
      PROCEED to Step 3
    ELIF user_choice = "keep":
      SKIP Step 2
      PROCEED to Step 3
    ELIF user_choice = "regenerate":
      WARN: "⚠️ This will overwrite existing tasks. Backup will be created."
      BACKUP: Create [SPEC_FOLDER]/tasks.md.backup.[TIMESTAMP]
      PROCEED to Step 2

  IF format = MONOLITHIC:
    MESSAGE: "📋 Found tasks in pre-2.1.0 monolithic format"
    PROMPT: "Upgrade to v2.2.0 with split structure and full-stack phases?
             Options:
             1. Upgrade to v2.2.0 (preserves completed tasks, modernizes structure)
             2. Keep existing tasks (no changes, not recommended)
             3. Regenerate fresh (loses all progress)"

    IF user_choice = "upgrade":
      ACTION: Execute upgrade workflow (see below)
      SKIP Step 2 (already generated during upgrade)
      PROCEED to Step 3
    ELIF user_choice = "keep":
      WARN: "⚠️ Monolithic format has poor context efficiency. Consider upgrading."
      SKIP Step 2
      PROCEED to Step 3
    ELIF user_choice = "regenerate":
      WARN: "⚠️ This will overwrite existing tasks. Backup will be created."
      BACKUP: Create [SPEC_FOLDER]/tasks.md.backup.[TIMESTAMP]
      PROCEED to Step 2

  IF format = UNKNOWN:
    ERROR: "❌ Could not determine tasks.md format"
    PROMPT: "Tasks file format unclear. Options:
             1. Keep existing (safest, no changes)
             2. Regenerate fresh (overwrites with backup)"

    IF user_choice = "keep":
      SKIP Step 2
      PROCEED to Step 3
    ELIF user_choice = "regenerate":
      BACKUP: Create [SPEC_FOLDER]/tasks.md.backup.[TIMESTAMP]
      PROCEED to Step 2
</user_prompt_and_decision>

<upgrade_workflow>
  <parse_existing_tasks>
    ACTION: Parse existing tasks.md
    EXTRACT:
      - All task IDs and titles
      - Completion status ([x] or [ ])
      - Existing phase structure
      - Task dependencies (if present)

    CREATE: completed_tasks_list = [IDs of all tasks marked [x]]
    CREATE: in_progress_tasks_list = [IDs of tasks with partial completion or notes]
  </parse_existing_tasks>

  <backup_existing>
    ACTION: Create backup before upgrade
    BACKUP_LOCATION: [SPEC_FOLDER]/tasks.md.backup.[TIMESTAMP]

    IF tasks/ directory exists:
      BACKUP_LOCATION: [SPEC_FOLDER]/tasks.backup.[TIMESTAMP]/
      COPY: entire tasks/ directory

    CONFIRM: "✅ Backup created at [BACKUP_LOCATION]"
  </backup_existing>

  <generate_upgraded_tasks>
    ACTION: Use file-creator subagent to generate v2.2.0 tasks

    INSTRUCTIONS: Generate tasks using Step 2 logic with:
      - Full-stack feature detection from Step 1.5
      - Split file structure (master + detail files)
      - v2.2.0 phase structure (Backend, Frontend, Integration, Final Validation)
      - Specialized agent assignments

    GENERATE:
      - New master tasks.md with v2.2.0 phases
      - New tasks/task-*.md detail files
  </generate_upgraded_tasks>

  <preserve_completed_work>
    ACTION: Mark previously completed tasks in new structure

    FOR each task_id in completed_tasks_list:
      FIND: Equivalent task in new tasks.md by:
        - Matching task ID if exact match exists
        - Matching task title/description (fuzzy match)
        - Matching general purpose (e.g., "backend API" → "impl-backend-api")

      IF match found:
        UPDATE: Change [ ] to [x] in new tasks.md
        NOTE: Add comment "# Preserved from v2.1.x - completed"
      ELSE:
        LOG: "Could not find equivalent for completed task: [task_id]"

    FOR each task_id in in_progress_tasks_list:
      FIND: Equivalent task in new structure
      IF match found:
        NOTE: Add comment "# In progress from v2.1.x"
  </preserve_completed_work>

  <upgrade_summary>
    REPORT: "
      ✅ Tasks upgraded to v2.2.0

      📊 Upgrade Summary:
      - Preserved completed tasks: [COUNT] of [TOTAL]
      - Preserved in-progress notes: [COUNT]
      - New tasks added: [COUNT] (full-stack phases)
      - Backup location: [BACKUP_LOCATION]

      🆕 New in v2.2.0:
      - Phase 2: Backend Implementation
      - Phase 3: Frontend Implementation
      - Phase 4: Frontend-Backend Integration
      - Specialized agent assignments (Vue/React/Node.js)

      📝 Next Steps:
      - Review new task phases
      - Verify preserved completed tasks
      - Continue with execute-tasks
    "
  </upgrade_summary>
</upgrade_workflow>

<task_matching_algorithm>
  <exact_match>
    Priority: 1 (highest)
    Logic: task_id in old tasks matches task_id in new tasks
    Example: "impl-comp1-core" → "impl-comp1-core"
  </exact_match>

  <semantic_match>
    Priority: 2
    Logic: Match by purpose and component
    Examples:
      - "Implement backend API" → "impl-backend-api"
      - "Create UI components" → "impl-frontend-components"
      - "Integration testing" → "test-e2e-workflow" or "integ-frontend-backend"
  </semantic_match>

  <fuzzy_title_match>
    Priority: 3
    Logic: Similar task titles (>70% similarity)
    Use: When IDs changed but purpose is same
  </fuzzy_title_match>

  <no_match>
    Priority: 4 (lowest)
    Logic: Cannot find equivalent task
    Action: Log for user review, don't mark as complete in new structure
  </no_match>
</task_matching_algorithm>

<safety_and_recovery>
  <backup_guarantee>
    - ALWAYS create backup before any changes
    - Include timestamp in backup name
    - Preserve both tasks.md and tasks/ directory
    - Never delete original until backup confirmed
  </backup_guarantee>

  <rollback_instructions>
    IF upgrade fails or user wants to rollback:
      1. Delete new tasks.md and tasks/ directory
      2. Restore from backup:
         - Copy [SPEC_FOLDER]/tasks.md.backup.[TIMESTAMP] to tasks.md
         - Copy [SPEC_FOLDER]/tasks.backup.[TIMESTAMP]/ to tasks/
      3. Confirm restoration: "Rollback complete, original tasks restored"
  </rollback_instructions>

  <data_loss_prevention>
    - Never proceed without user confirmation for destructive actions
    - Show what will be lost before regenerating
    - Provide clear "keep existing" option
    - Multiple prompts for destructive operations
  </data_loss_prevention>
</safety_and_recovery>

</step>

<step number="2" subagent="file-creator" name="generate_micro_granular_tasks">

### Step 2: Generate Micro-Granular Tasks with Codebase Intelligence

Use the file-creator subagent to create a lightweight master tasks.md file plus individual detailed task files in tasks/ subdirectory. This structure optimizes context usage by keeping the master list concise while storing comprehensive details separately.

<enhanced_task_generation>
  <micro_granular_principles>
    - Task specificity: Each task targets a single, specific outcome
    - Agent optimization: Tasks designed for specialist agent execution
    - Dependency mapping: Clear task dependencies with parallel execution opportunities
    - Context packaging: Each task includes sufficient context for autonomous execution
    - Quality gates: Embedded validation criteria in every task
  </micro_granular_principles>

  <orchestration_optimization>
    - Parallel execution streams: Tasks grouped for simultaneous execution
    - Context distribution: Optimized context allocation per specialist agent
    - Dependency coordination: Minimal blocking dependencies
    - Resource efficiency: Tasks sized for agent context windows
  </orchestration_optimization>
</enhanced_task_generation>

<enhanced_task_structure>
  <task_phases>
    🔍 **Phase 1: Pre-Execution Analysis**
    - Codebase analysis and integration planning
    - Context preparation for specialist agents
    - Full-stack feature classification

    🔧 **Phase 2: Backend Implementation** (if backend required)
    - Backend test design and implementation
    - Database schema and migrations
    - API endpoint implementation
    - Business logic and validation
    - Backend integration testing

    🎨 **Phase 3: Frontend Implementation** (if frontend required)
    - Frontend test design and implementation
    - UI component implementation
    - State management implementation
    - Form handling and validation
    - Responsive design and styling
    - Frontend integration testing

    🔗 **Phase 4: Frontend-Backend Integration** (if full-stack)
    - API contract validation
    - Frontend-backend data flow integration
    - End-to-end workflow testing
    - Error handling across layers

    ✅ **Phase 5: Final Validation**
    - Cross-layer integration validation
    - User acceptance testing
    - Performance and security validation
    - Documentation and handoff
  </task_phases>

  <micro_task_format>
    - **Task ID**: Unique identifier for orchestration
    - **Title**: Specific, actionable task description
    - **Agent**: Specialist agent assignment
      - test-architect: Test design and implementation
      - frontend-vue-specialist: Vue.js UI implementation
      - frontend-react-specialist: React UI implementation
      - backend-nodejs-specialist: Node.js backend implementation
      - implementation-specialist: Generic implementation (use when no specialization needed)
      - integration-coordinator: System integration and APIs
      - quality-assurance: Code quality validation
    - **Specifics**: File paths, function signatures, exact requirements
    - **Acceptance Criteria**: Measurable, verifiable completion criteria
    - **Dependencies**: Prerequisite tasks for execution order
    - **Context Requirements**: Information needed for autonomous execution
    - **Estimated Time**: Realistic time expectations
  </micro_task_format>
</enhanced_task_structure>

<task_file_structure>
  <directory_structure>
    specs/[spec-name]/
    ├── tasks.md              # Lightweight master list (context-optimized)
    └── tasks/                # Detailed task files
        ├── task-pre-1.md
        ├── task-pre-2.md
        ├── task-test-comp1.md
        ├── task-impl-comp1-core.md
        └── ...
  </directory_structure>

  <master_tasks_md_template>
    # Spec Tasks

    ## Metadata
    - **Spec Name**: [SPEC_NAME]
    - **Generation Date**: [CURRENT_DATE]
    - **Total Tasks**: [TASK_COUNT]
    - **Estimated Execution Time**: [TOTAL_TIME]
    - **Granularity Score**: [GRANULARITY_SCORE]

    ## Phase 1: Pre-Execution Analysis

    - [ ] **pre-1** - Perform Codebase Analysis → [details](tasks/task-pre-1.md)
      - **Agent**: context-fetcher
      - **Estimated Time**: 3-5 minutes
      - **Dependencies**: []

    - [ ] **pre-2** - Create Integration Strategy → [details](tasks/task-pre-2.md)
      - **Agent**: integration-coordinator
      - **Estimated Time**: 5-8 minutes
      - **Dependencies**: [pre-1]

    ## Phase 2: [COMPONENT_NAME] Implementation

    - [ ] **test-comp1** - Design Comprehensive Test Suite for [COMPONENT_NAME] → [details](tasks/task-test-comp1.md)
      - **Agent**: test-architect
      - **Estimated Time**: 15-20 minutes
      - **Dependencies**: [pre-2]

    - [ ] **impl-comp1-core** - Implement [COMPONENT_NAME] Core Logic → [details](tasks/task-impl-comp1-core.md)
      - **Agent**: implementation-specialist
      - **Estimated Time**: 20-30 minutes implementation + 15-20 minutes testing
      - **Dependencies**: [test-comp1]

    - [ ] **impl-comp1-style** - Implement [COMPONENT_NAME] Styling → [details](tasks/task-impl-comp1-style.md)
      - **Agent**: implementation-specialist
      - **Estimated Time**: 10-15 minutes
      - **Dependencies**: [impl-comp1-core]

    - [ ] **integ-comp1** - Integrate [COMPONENT_NAME] with Existing Systems → [details](tasks/task-integ-comp1.md)
      - **Agent**: integration-coordinator
      - **Estimated Time**: 15-25 minutes
      - **Dependencies**: [impl-comp1-core]

    - [ ] **valid-comp1** - Validate [COMPONENT_NAME] Implementation → [details](tasks/task-valid-comp1.md)
      - **Agent**: implementation-validator
      - **Estimated Time**: 15-25 minutes validation + time for evidence gathering
      - **Dependencies**: [integ-comp1]

    ## Phase 2: Backend Implementation (BACKEND_FEATURES_ONLY)

    - [ ] **test-backend-api** - Design Backend API Test Suite → [details](tasks/task-test-backend-api.md)
      - **Agent**: test-architect
      - **Estimated Time**: 15-20 minutes
      - **Dependencies**: [pre-2]

    - [ ] **impl-backend-database** - Implement Database Schema and Migrations → [details](tasks/task-impl-backend-database.md)
      - **Agent**: backend-nodejs-specialist
      - **Estimated Time**: 20-25 minutes
      - **Dependencies**: [test-backend-api]

    - [ ] **impl-backend-api** - Implement Backend API Endpoints → [details](tasks/task-impl-backend-api.md)
      - **Agent**: backend-nodejs-specialist
      - **Estimated Time**: 25-35 minutes
      - **Dependencies**: [impl-backend-database]

    - [ ] **impl-backend-logic** - Implement Business Logic and Validation → [details](tasks/task-impl-backend-logic.md)
      - **Agent**: backend-nodejs-specialist
      - **Estimated Time**: 20-30 minutes
      - **Dependencies**: [impl-backend-api]

    - [ ] **test-backend-integration** - Backend Integration Testing → [details](tasks/task-test-backend-integration.md)
      - **Agent**: test-architect
      - **Estimated Time**: 15-20 minutes
      - **Dependencies**: [impl-backend-logic]

    ## Phase 3: Frontend Implementation (FRONTEND_FEATURES_ONLY)

    - [ ] **test-frontend-ui** - Design Frontend UI Test Suite → [details](tasks/task-test-frontend-ui.md)
      - **Agent**: test-architect
      - **Estimated Time**: 15-20 minutes
      - **Dependencies**: [test-backend-integration OR pre-2]

    ### 🎨 UX/UI Architecture Tasks (REQUIRED FIRST for Frontend Features)

    ⚠️ **CRITICAL**: For any frontend feature, these architecture tasks MUST be completed BEFORE component implementation.
    **Why**: Prevents catastrophic failure pattern of building components without navigation/routing (see @.agent-os/instructions/utilities/ux-ui-specification-checklist.md)

    - [ ] **ux-validate-arch-spec** - Validate UX/UI Architecture Specification Completeness → [details](tasks/task-ux-validate-arch-spec.md)
      - **Agent**: quality-assurance
      - **Estimated Time**: 10-15 minutes
      - **Dependencies**: [test-frontend-ui OR pre-2]

      **Specifics**:
      - Read @.agent-os/specs/{SPEC_NAME}/sub-specs/ux-ui-spec.md (if exists)
      - Apply @.agent-os/instructions/utilities/ux-ui-specification-checklist.md
      - Verify Phase 1 (Application Architecture) is COMPLETE:
        * All routes explicitly defined (no "TBD")
        * Navigation structure fully specified (no "if exists")
        * Global layout integration specified
        * User entry points identified
        * User flows documented
      - **IF incomplete**: BLOCK all frontend implementation tasks until fixed
      - **IF complete**: Generate validation report, proceed to implementation

      **Acceptance Criteria**:
      - [ ] Phase 1 validation passes (all routes, navigation, layout specified)
      - [ ] No "if exists", "TBD", or conditional language found for core features
      - [ ] All user entry points explicitly documented
      - [ ] User flows include step-by-step component and route specifications
      - [ ] Validation report created documenting architecture completeness

    - [ ] **impl-app-routes** - Implement Application Routes → [details](tasks/task-impl-app-routes.md)
      - **Agent**: frontend-[tech]-specialist
      - **Estimated Time**: 15-20 minutes
      - **Dependencies**: [ux-validate-arch-spec]

      **Specifics** (from sub-specs/ux-ui-spec.md Phase 1.2 Route Structure):
      - Create route definitions for: {LIST_ALL_ROUTES from spec}
      - Configure route guards/authentication: {AUTH_REQUIREMENTS}
      - Set up nested routing (if applicable): {PARENT_CHILD_ROUTES}
      - Implement route parameters: {DYNAMIC_ROUTES}
      - Create placeholder page components (to be filled in later phases)

      **Acceptance Criteria**:
      - [ ] All routes from spec are accessible by URL
      - [ ] Route authentication/guards work correctly
      - [ ] Nested routes render in correct parent layouts
      - [ ] Dynamic route parameters are captured correctly
      - [ ] Browser navigation (back/forward) works

    - [ ] **impl-global-layout** - Implement Global Layout Shell → [details](tasks/task-impl-global-layout.md)
      - **Agent**: frontend-[tech]-specialist
      - **Estimated Time**: 25-30 minutes
      - **Dependencies**: [impl-app-routes]

      **Specifics** (from sub-specs/ux-ui-spec.md Phase 1.3 Global Layout Integration):
      {IF layout_strategy === "NEW_LAYOUT"}
        - Create layout components: {LIST_LAYOUT_COMPONENTS with file paths}
        - Implement header: {HEIGHT, STICKY_BEHAVIOR, CONTENTS}
        - Implement sidebar: {WIDTH, POSITION, NAVIGATION_ITEMS}
        - Implement main content area: {MAX_WIDTH, PADDING, SCROLL}
        - Apply responsive behavior: {MOBILE_BEHAVIOR}
      {ELSIF layout_strategy === "EXTEND_EXISTING"}
        - Modify existing layout at {EXISTING_LAYOUT_PATH}
        - Make changes: {SPECIFIC_MODIFICATIONS}
        - Create new layout components: {NEW_COMPONENTS}
      {ELSIF layout_strategy === "USE_EXISTING"}
        - Integrate feature with existing layout at {EXISTING_LAYOUT_PATH}
        - No layout changes needed
      {ENDIF}

      **Acceptance Criteria**:
      - [ ] Global layout renders correctly on all pages
      - [ ] Header/sidebar (if applicable) render with correct dimensions
      - [ ] Main content area has correct max-width and padding
      - [ ] Layout is responsive (desktop, tablet, mobile tested)
      - [ ] Layout component files match specified paths

    - [ ] **impl-navigation-structure** - Implement Navigation Architecture → [details](tasks/task-impl-navigation-structure.md)
      - **Agent**: frontend-[tech]-specialist
      - **Estimated Time**: 25-30 minutes
      - **Dependencies**: [impl-global-layout]

      **Specifics** (from sub-specs/ux-ui-spec.md Phase 1.4 Navigation Structure):
      - Implement navigation type: {SIDEBAR | TOP_BAR | HYBRID}
      - Create navigation component at {NAVIGATION_COMPONENT_PATH}
      - Add navigation items: {LIST_NAV_ITEMS with labels, routes, icons, positions}
      - Implement active state highlighting: {ROUTER_HOOK | MANUAL_STATE}
      - Add mobile navigation: {HAMBURGER_DRAWER | BOTTOM_TABS}
      - Implement breadcrumbs (if applicable): {AUTO_GENERATED | MANUAL}
      - Add user menu: {LOCATION, TRIGGER, ITEMS}

      **Acceptance Criteria**:
      - [ ] All navigation items render with correct labels and icons
      - [ ] Clicking navigation items navigates to correct routes
      - [ ] Active route is visually highlighted
      - [ ] Mobile navigation works (hamburger menu, drawer, etc.)
      - [ ] Breadcrumbs show correct page hierarchy (if applicable)
      - [ ] User menu renders and functions correctly
      - [ ] Navigation matches specified file paths

    ### Component Library Setup Tasks

    - [ ] **setup-component-library** - Install and Configure UI Component Library → [details](tasks/task-setup-component-library.md)
      - **Agent**: frontend-[tech]-specialist
      - **Estimated Time**: 15-20 minutes
      - **Dependencies**: [impl-navigation-structure]

      {IF project_uses_component_library}
        **Specifics** (from sub-specs/ux-ui-spec.md Phase 3.1 Component Library Strategy):
        - Install {LIBRARY_NAME} version {VERSION}
        - Configure {CSS_FRAMEWORK} integration
        - Set up theme/design tokens
        - Install required components: {LIST_FROM_SPEC}
        - Configure library customization: {THEME_OVERRIDES, WRAPPER_COMPONENTS}
      {ELSE}
        **Specifics** (from sub-specs/ux-ui-spec.md Phase 3.1 Component Library Strategy):
        - Create base UI primitive components per spec: {LIST_PRIMITIVES}
        - Set up {CSS_APPROACH} system
        - Define design tokens (colors, spacing, typography) per Phase 2.2 and 2.3
        - Implement component states: default, hover, active, disabled, loading, error
        - Create component documentation
      {ENDIF}

    ### Page Layout and Component Implementation Tasks

    - [ ] **impl-page-layouts** - Implement Page Layout Templates → [details](tasks/task-impl-page-layouts.md)
      - **Agent**: frontend-[tech]-specialist
      - **Estimated Time**: 25-30 minutes
      - **Dependencies**: [setup-component-library]

      **Specifics** (from sub-specs/ux-ui-spec.md Phase 2.4 Page Layout Patterns):
      - Implement layout pattern for each page: {Dashboard Grid | Form Centered | List + Detail | Master-Detail | Wizard}
      - Create page layout components per spec: {LIST_LAYOUT_COMPONENTS with file paths}
      - Apply container specifications: {RESPONSIVE_PADDING, MAX_WIDTH from Phase 2.1}
      - Implement component hierarchy per spec
      - Apply spacing system per Phase 2.2
      - Test responsive behavior: desktop (≥1024px), tablet (768-1023px), mobile (<768px)

    - [ ] **impl-frontend-components** - Implement UI Components per Component Architecture → [details](tasks/task-impl-frontend-components.md)
      - **Agent**: frontend-[tech]-specialist
      - **Estimated Time**: 30-40 minutes
      - **Dependencies**: [impl-page-layouts]

      **Specifics** (from sub-specs/technical-spec.md Component Architecture section):
      {IF component_library}
        - Use {LIBRARY_NAME} components: {LIST_COMPONENTS_FROM_SPEC}
        - Build custom components on library primitives
        - Follow component hierarchy from spec
      {ELSE}
        - Build custom UI components
        - Use base primitives created in setup task
        - Implement according to component hierarchy
      {ENDIF}
      - Implement per Page Layout Architecture
      - Follow Component Integration Map
      - Apply styling per design system

    - [ ] **impl-frontend-state** - Implement State Management → [details](tasks/task-impl-frontend-state.md)
      - **Agent**: frontend-[tech]-specialist
      - **Estimated Time**: 20-25 minutes
      - **Dependencies**: [impl-frontend-components]

    - [ ] **impl-frontend-forms** - Implement Forms and User Input → [details](tasks/task-impl-frontend-forms.md)
      - **Agent**: frontend-[tech]-specialist
      - **Estimated Time**: 25-30 minutes
      - **Dependencies**: [impl-frontend-state]

    - [ ] **impl-frontend-styling** - Implement Responsive Styling → [details](tasks/task-impl-frontend-styling.md)
      - **Agent**: frontend-[tech]-specialist
      - **Estimated Time**: 15-20 minutes
      - **Dependencies**: [impl-frontend-forms]

    - [ ] **test-frontend-integration** - Frontend Integration Testing → [details](tasks/task-test-frontend-integration.md)
      - **Agent**: test-architect
      - **Estimated Time**: 15-20 minutes
      - **Dependencies**: [impl-frontend-styling]

    ### User Flow Validation Tasks

    - [ ] **impl-user-flow-{name}** - Implement {FlowName} User Flow → [details](tasks/task-impl-user-flow-{name}.md)
      - **Agent**: frontend-[tech]-specialist
      - **Estimated Time**: 25-35 minutes
      - **Dependencies**: [impl-frontend-components, impl-frontend-state]

      **Specifics** (from sub-specs/technical-spec.md User Flow & Interaction Patterns):
      - Implement complete flow: {STEP_1 → STEP_2 → ... → STEP_N}
      - Connect components per interaction patterns
      - Add navigation between pages/states
      - Implement loading states
      - Implement error states
      - Implement success states with notifications

    - [ ] **test-user-flow-{name}** - Validate {FlowName} User Flow → [details](tasks/task-test-user-flow-{name}.md)
      - **Agent**: test-architect
      - **Estimated Time**: 20-25 minutes
      - **Dependencies**: [impl-user-flow-{name}]

      **Specifics**:
      - E2E test of complete user flow from spec
      - Verify each step in flow diagram
      - Test error handling at each step
      - Test loading states
      - Capture evidence (screenshots/recordings)

    ## Phase 4: Frontend-Backend Integration (FULL_STACK_FEATURES_ONLY)

    - [ ] **integ-api-contract** - Validate API Contract Compatibility → [details](tasks/task-integ-api-contract.md)
      - **Agent**: integration-coordinator
      - **Estimated Time**: 10-15 minutes
      - **Dependencies**: [test-backend-integration, test-frontend-integration]

    - [ ] **integ-frontend-backend** - Integrate Frontend with Backend APIs → [details](tasks/task-integ-frontend-backend.md)
      - **Agent**: integration-coordinator
      - **Estimated Time**: 20-30 minutes
      - **Dependencies**: [integ-api-contract]

    - [ ] **test-e2e-workflow** - End-to-End User Workflow Testing → [details](tasks/task-test-e2e-workflow.md)
      - **Agent**: test-architect
      - **Estimated Time**: 25-35 minutes
      - **Dependencies**: [integ-frontend-backend]

    - [ ] **valid-full-stack** - Validate Full-Stack Completeness → [details](tasks/task-valid-full-stack.md)
      - **Agent**: quality-assurance
      - **Estimated Time**: 20-25 minutes
      - **Dependencies**: [test-e2e-workflow]

    ## Phase 5: System Integration and Final Validation

    - [ ] **final-integration** - Perform System Integration → [details](tasks/task-final-integration.md)
      - **Agent**: integration-coordinator
      - **Estimated Time**: 20-30 minutes
      - **Dependencies**: [ALL_COMPONENT_VALIDATION_TASKS]

    - [ ] **final-validation** - Final Quality Validation → [details](tasks/task-final-validation.md)
      - **Agent**: quality-assurance
      - **Estimated Time**: 15-20 minutes
      - **Dependencies**: [final-integration]

    ## Dependency Graph
    ```
    [DEPENDENCY_VISUALIZATION]
    ```

    ## Task Generation Summary
    - **Total Tasks Generated**: [TOTAL_TASK_COUNT]
    - **Parallel Execution Opportunities**: [PARALLEL_TASK_COUNT]
    - **Estimated Sequential Time**: [SEQUENTIAL_TIME]
    - **Estimated Parallel Time**: [PARALLEL_TIME] (60-80% faster)
    - **Granularity Score**: [GRANULARITY_SCORE]/1.0
    - **Quality Score**: [QUALITY_SCORE]/1.0
  </master_tasks_md_template>

  <individual_task_file_template>
    # Task: [TASK_ID] - [TASK_TITLE]

    ## Task Metadata
    - **Task ID**: [TASK_ID]
    - **Phase**: [PHASE_NAME]
    - **Agent**: [ASSIGNED_AGENT]
    - **Estimated Time**: [TIME_ESTIMATE]
    - **Dependencies**: [DEPENDENCY_LIST]
    - **Status**: [ ] Not Started

    ## Task Description
    [DETAILED_TASK_DESCRIPTION]

    ## Specifics
    - **Files to Create/Modify**:
      - [FILE_PATH_1]
      - [FILE_PATH_2]
    - **Key Requirements**:
      - [REQUIREMENT_1]
      - [REQUIREMENT_2]
    - **Technical Details**:
      - [TECH_DETAIL_1]
      - [TECH_DETAIL_2]

    ## Acceptance Criteria
    - [ ] [CRITERION_1]
    - [ ] [CRITERION_2]
    - [ ] [CRITERION_3]

    ## Testing Requirements (if applicable)
    - **Functional Testing**: [FUNCTIONAL_TEST_REQUIREMENTS]
    - **Manual Verification**: [MANUAL_TEST_REQUIREMENTS]
    - **Browser Testing**: [BROWSER_TEST_REQUIREMENTS]
    - **Error Testing**: [ERROR_TEST_REQUIREMENTS]

    ## Evidence Required (if applicable)
    - [EVIDENCE_1]
    - [EVIDENCE_2]

    ## Context Requirements
    - [CONTEXT_ITEM_1]
    - [CONTEXT_ITEM_2]
    - **UX/UI Specifications** (if applicable):
      - Component Architecture from @.agent-os/specs/{SPEC_NAME}/sub-specs/technical-spec.md
      - Page Layout Architecture requirements
      - Navigation Architecture structure
      - User Flow patterns for this component
      - Component Integration Map

    ## Implementation Notes
    - [NOTE_1]
    - [NOTE_2]

    ## Quality Gates (if applicable)
    - [ ] [QUALITY_GATE_1]
    - [ ] [QUALITY_GATE_2]

    ## Related Files
    - Spec: [SPEC_FILE_PATH]
    - Technical Spec: [TECHNICAL_SPEC_PATH]
    - Related Tasks: [RELATED_TASK_IDS]
  </individual_task_file_template>
</task_file_structure>

<task_generation_instructions>
  <file_creation_sequence>
    STEP 1: Create tasks/ directory in spec folder
    STEP 2: Generate individual task detail files (tasks/task-*.md)
    STEP 3: Generate master tasks.md with links to detail files
  </file_creation_sequence>

  <file_creator_instructions>
    ACTION: Use file-creator subagent to:
      1. CREATE: tasks/ subdirectory in spec folder
      2. GENERATE: One .md file per task in tasks/ subdirectory
         - Filename format: task-[TASK_ID].md (e.g., task-pre-1.md, task-impl-comp1-core.md)
         - Content: Full detailed task information using individual_task_file_template
         - Include: All specifics, acceptance criteria, testing requirements, evidence, quality gates
      3. GENERATE: Master tasks.md in spec folder root
         - Content: Lightweight task list using master_tasks_md_template
         - Include: Task ID, title, agent, time estimate, dependencies, link to detail file
         - Exclude: Verbose acceptance criteria, testing details, evidence requirements
  </file_creator_instructions>

  <context_optimization_benefits>
    - **Master tasks.md**: ~50-100 lines instead of 500-1000+ lines
    - **Detail files**: Only loaded when executing specific task
    - **Context savings**: 90%+ reduction in repeated context consumption
    - **Scalability**: Works efficiently with 50+, 100+, or even 200+ tasks
  </context_optimization_benefits>
</task_generation_instructions>

<intelligent_task_adaptation>
  <codebase_integration>
    - Leverage existing components instead of reimplementing
    - Follow established architectural patterns
    - Reuse existing utilities and services
    - Maintain consistency with existing code style
  </codebase_integration>

  <context_optimization>
    - Package relevant context for each specialist agent
    - Include specific file paths and function signatures
    - Provide examples from existing codebase
    - Optimize for agent context window limits
  </context_optimization>

  <quality_enforcement>
    - Embed quality gates in every task
    - Include specific acceptance criteria
    - Reference existing quality standards
    - Ensure testability and validation
  </quality_enforcement>
</intelligent_task_adaptation>

</step>

<step number="2.6" name="beads_issue_sync">

### Step 2.6: Beads Issue Sync (Optional)

Automatically sync generated tasks to Beads for distributed task tracking with persistent state across sessions.

<beads_integration>
  <config_check>
    ACTION: Check if Beads integration is enabled

    IF config.yml → beads.enabled = true:
      PROCEED with Beads sync
    ELSE:
      SKIP this step
      PROCEED to Step 3
  </config_check>

  <beads_initialization>
    ACTION: Ensure Beads is initialized in project

    IF .beads/ directory does NOT exist:
      RUN: bd init --quiet
      CONFIRM: "✅ Beads initialized in project"
    ELSE:
      CONFIRM: "✅ Beads already initialized"
  </beads_initialization>

  <automatic_sync>
    ACTION: Run sync script to create Beads issues from tasks.md

    EXECUTE:
      ~/.agent-os/setup/sync-tasks-to-beads.sh [SPEC_FOLDER]

    PROCESS:
      - Reads tasks.md and tasks/*.md detail files
      - Creates bd issue for each task with matching ID
      - Maps dependencies from tasks.md to Beads "blocks" relationships
      - Sets priority based on phase (Integration=0, Pre-execution=1, etc.)
      - Adds labels: agent, phase, spec name
      - Syncs to git via bd sync

    OUTPUT:
      📊 Beads Sync Summary:
      - Created: [COUNT] tasks
      - Skipped: [COUNT] tasks (already exist)
      - Dependencies mapped: [COUNT]
      - Priority assignments: P0=[COUNT], P1=[COUNT], P2=[COUNT]

      🔍 Query Commands:
      - bd ready → Show unblocked tasks
      - bd list → Show all tasks
      - bd dep tree <task-id> → Show dependency graph
  </automatic_sync>

  <bidirectional_sync>
    IF config.yml → beads.bidirectional_sync = true:
      NOTE: Tasks.md and Beads will stay in sync:
      - Task completion in Beads → Update tasks.md checkbox
      - Task creation in Beads → Add to tasks.md (manual or via script)
      - Status changes sync automatically during execution
  </bidirectional_sync>

  <benefits_summary>
    INFORM user of Beads benefits:

    "✅ Tasks synced to Beads for:

     🧠 Persistent Memory: Tasks survive context window and session boundaries
     🔗 Dependency Resolution: Automatic 'bd ready' finds unblocked work
     🌳 Visualization: 'bd dep tree' shows critical path
     🔄 Cross-Session Resume: Continue exactly where you left off
     🤝 Multi-Agent Safe: Git-backed JSONL with collision-resistant IDs

     📚 Guide: ~/.agent-os/instructions/utilities/beads-integration-guide.md"
  </benefits_summary>

  <error_handling>
    IF sync fails:
      WARN: "⚠️  Beads sync failed (non-critical)"
      LOG: Error details
      CONTINUE: Tasks.md still available for markdown-only workflow
  </error_handling>
</beads_integration>

</step>

<step number="3" name="micro_granular_execution_readiness">

### Step 3: Micro-Granular Execution Readiness

Present the enhanced task breakdown with orchestration overview and parallel execution opportunities.

<enhanced_readiness_summary>
  <orchestration_overview>
    📊 **Task Generation Summary**
    - **Total Tasks**: [TASK_COUNT] micro-granular tasks
    - **Execution Phases**: [PHASE_COUNT] coordinated phases
    - **Parallel Opportunities**: [PARALLEL_COUNT] tasks can run simultaneously
    - **Estimated Time**: [SEQUENTIAL_TIME] sequential → [PARALLEL_TIME] parallel (60-80% faster)
    - **Granularity Score**: [GRANULARITY_SCORE]/1.0 (quality measure)

    🤖 **Specialist Agent Allocation**
    - **Test Architect**: [TEST_TASKS] tasks focused on comprehensive testing
    - **Implementation Specialist**: [IMPL_TASKS] tasks for core functionality
    - **Integration Coordinator**: [INTEG_TASKS] tasks for system integration
    - **Quality Assurance**: [QA_TASKS] tasks for validation and quality

    🎯 **Next Phase Ready**
    - **Phase 1**: Pre-Execution Analysis ([PRE_TASK_COUNT] tasks)
    - **First Task**: [FIRST_TASK_TITLE]
    - **Specialist Agent**: [FIRST_TASK_AGENT]
    - **Context Package**: Optimized for [FIRST_TASK_AGENT] execution
  </orchestration_overview>
</enhanced_readiness_summary>

<enhanced_execution_prompt>
  PROMPT: "🚀 **Enhanced Micro-Granular Task Generation Complete**

  I've generated **[TASK_COUNT] micro-granular tasks** optimized for orchestrated parallel execution. This enhanced approach provides:

  ✅ **60-80% faster execution** through intelligent parallel processing
  ✅ **Specialist agent optimization** with focused context packages
  ✅ **Implementation-ready specificity** with exact file paths and requirements
  ✅ **Quality gates embedded** in every task for consistent delivery
  ✅ **Codebase intelligence** leveraging existing components and patterns

  **Ready to Execute:**
  - **Phase 1**: Pre-Execution Analysis ([PRE_TASK_COUNT] tasks, [PRE_TIME] estimated)
  - **Phase 2**: Component Implementation ([COMP_TASK_COUNT] tasks, [COMP_TIME] estimated)
  - **Phase 3**: System Integration ([INTEG_TASK_COUNT] tasks, [INTEG_TIME] estimated)

  **Execution Options:**
  1. **Orchestrated Parallel** (Recommended): Execute all phases with specialist agents working in parallel
  2. **Phase-by-Phase**: Execute one phase at a time for controlled progression
  3. **Single Task**: Start with just the first task for validation

  Would you like me to proceed with **Orchestrated Parallel Execution** for maximum efficiency, or would you prefer a different approach?"
</enhanced_execution_prompt>

<enhanced_execution_flow>
  IF user_chooses_orchestrated_parallel:
    REFERENCE: @.agent-os/instructions/core/execute-task-orchestrated.md
    MODE: Full orchestrated execution with all specialist agents
    OPTIMIZATION: Use generated context packages for maximum efficiency
  ELIF user_chooses_phase_by_phase:
    REFERENCE: @.agent-os/instructions/core/execute-tasks.md
    MODE: Sequential phase execution with micro-granular tasks
    FOCUS: Complete one phase before proceeding to next
  ELIF user_chooses_single_task:
    REFERENCE: @.agent-os/instructions/core/execute-tasks.md
    MODE: Single task execution for validation
    CONSTRAINT: Execute only first task and wait for user confirmation
  ELSE:
    WAIT: For user clarification or modifications
</enhanced_execution_flow>

</step>

</process_flow>

<post_flight_check>
  EXECUTE: @.agent-os/instructions/meta/post-flight.md
</post_flight_check>
