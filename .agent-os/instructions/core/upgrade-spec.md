---
description: Comprehensive workflow for upgrading existing specs to Agent OS v3.3.0 standards
globs:
alwaysApply: false
version: 2.0
encoding: UTF-8
---

# Upgrade Spec to v3.3.0 Standards

## Overview

This workflow performs a complete modernization of existing Agent OS specifications to v3.3.0 standards through:
- Full re-evaluation of spec content
- Fresh codebase analysis with integration intelligence
- 6-file comprehensive spec structure
- Micro-granular task regeneration
- Optimized split task file structure
- Test context gathering with library documentation (v3.1+)
- Skills integration for pattern lookup (v3.2+)
- Test execution monitoring with streaming reporters (v3.3.0+)
- Test/code alignment validation (v3.3.0+)

**Expected Time**: 30-60 minutes depending on spec complexity

**Outcome**: Fully modernized spec with latest Agent OS v3.3.0 standards

<pre_flight_check>
  EXECUTE: @.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

<process_flow>

<step number="1" name="pre_upgrade_analysis">

### Step 1: Pre-Upgrade Analysis and Backup

Analyze the existing spec and create comprehensive backup before any modifications.

<spec_identification>
  **Identify Spec Location**:
  - User provides spec folder path: `specs/[spec-name]/`
  - OR user in spec directory already
  - OR user provides spec name to search for

  **Validation**:
  - [ ] Spec folder exists
  - [ ] Contains at minimum: spec.md or tasks.md
  - [ ] Valid Agent OS spec structure detected
</spec_identification>

<backup_creation>
  **Comprehensive Backup**:

  ACTION: Create backup directory
  LOCATION: `specs/[spec-name]/.backup-[timestamp]/`

  BACKUP FILES:
  - [ ] spec.md (if exists)
  - [ ] spec-lite.md (if exists)
  - [ ] technical-spec.md (if exists)
  - [ ] tasks.md (if exists)
  - [ ] tasks/ directory (if exists)
  - [ ] implementation-guide.md (if exists)
  - [ ] testing-strategy.md (if exists)
  - [ ] integration-requirements.md (if exists)
  - [ ] quality-gates.md (if exists)
  - [ ] architecture-decisions.md (if exists)
  - [ ] Any other .md files in spec folder

  RESULT: Complete snapshot for rollback if needed
</backup_creation>

<existing_content_analysis>
  **Analyze Current State**:

  READ and ANALYZE:
  - [ ] Main spec.md: Feature description, user stories, requirements
  - [ ] Technical spec (if exists): Implementation approach
  - [ ] Tasks.md (if exists): Current task breakdown and completion status
  - [ ] Other spec files: Additional context and requirements

  EXTRACT:
  - **Feature Purpose**: What problem does this solve?
  - **User Stories**: Who is the user and what do they need?
  - **Current Requirements**: Functional and non-functional requirements
  - **Existing Technical Approach**: Architecture, tech choices, patterns
  - **Task Completion Status**: Which tasks are done/in-progress/blocked
  - **Implementation Notes**: Lessons learned, gotchas, decisions made

  IDENTIFY:
  - **Spec Version**: v1.0, v2.x, v3.x, or custom format
  - **File Structure**: Monolithic, partial v2.0, or custom
  - **Completeness**: Missing files, incomplete sections
  - **Modernization Needs**: What needs updating for v3.3.0
</existing_content_analysis>

<instructions>
  ACTION: Create timestamp-based backup directory
  BACKUP: Copy all existing spec and task files
  ANALYZE: Extract all meaningful content from existing spec
  EXTRACT: Core feature purpose, requirements, implementation status
  IDENTIFY: Current version, structure, and modernization needs
  PRESERVE: All context for regeneration
</instructions>

</step>

<step number="2" subagent="context-fetcher" name="fresh_codebase_analysis">

### Step 2: Fresh Codebase Analysis

Perform comprehensive codebase analysis to gather current integration intelligence.

<codebase_analysis_instructions>
  ACTION: Use context-fetcher subagent to:
    - REQUEST: "Perform comprehensive codebase analysis for spec: [SPEC_NAME]"
    - REQUEST: "Identify existing components, APIs, models, and utilities"
    - REQUEST: "Map integration points for feature: [FEATURE_NAME]"
    - REQUEST: "Analyze architectural patterns and conventions in use"
    - REQUEST: "Identify reuse opportunities and dependencies"

  PROCESS: Fresh codebase intelligence for modern integration approach
  CACHE: Analysis results for spec regeneration
</codebase_analysis_instructions>

<analysis_scope>
  <code_scanning>
    - **Components**: UI components, business logic, utilities (src/components/, src/lib/)
    - **APIs**: Endpoints, controllers, middleware (src/api/, src/routes/)
    - **Models**: Database models, data types, schemas (src/models/, src/types/)
    - **Utilities**: Helper functions, services, shared libraries (src/utils/, src/services/)
    - **Tests**: Existing test patterns and coverage (src/tests/, __tests__/)
    - **Configuration**: Project setup, dependencies, environment (package.json, config/)
  </code_scanning>

  <integration_analysis>
    - **Architectural Patterns**: MVC, Repository, Service Layer, Component patterns
    - **Code Organization**: File structure, module boundaries, naming conventions
    - **Integration Patterns**: How components communicate, data flow, state management
    - **Quality Patterns**: Testing approaches, validation, error handling
    - **Performance Patterns**: Caching, optimization, lazy loading
  </integration_analysis>

  <reuse_opportunities>
    - **Existing Components**: What can be reused or extended
    - **Available APIs**: What endpoints already exist
    - **Database Schema**: What tables/models are available
    - **Utility Functions**: What helpers can be leveraged
    - **Design Patterns**: What patterns should be followed
  </reuse_opportunities>
</analysis_scope>

<instructions>
  ACTION: Use context-fetcher for fresh codebase scan
  ANALYZE: Current state of codebase since spec was created
  IDENTIFY: New reuse opportunities and integration points
  MAP: Architectural patterns and conventions to follow
  GENERATE: Integration intelligence for modern spec
</instructions>

</step>

<step number="3" subagent="file-creator" name="regenerate_6_file_spec">

### Step 3: Regenerate 6-File Comprehensive Spec Structure

Regenerate complete v3.3.0 spec structure with all 6 specification files.

<spec_regeneration_approach>
  **Re-evaluation Strategy**:

  USE: Extracted content from Step 1 (existing spec analysis)
  APPLY: Fresh codebase intelligence from Step 2
  FOLLOW: Latest v3.3.0 spec templates from create-spec.md
  ENHANCE: With modern best practices and standards
  PRESERVE: Core feature purpose and completed work insights

  **Content Synthesis**:
  - Combine original feature vision with current codebase reality
  - Update technical approach based on existing architecture
  - Incorporate lessons learned from task completion
  - Add modern integration intelligence
  - Apply latest Agent OS standards
</spec_regeneration_approach>

<file_generation_sequence>
  **Generate All 6 Spec Files**:

  USE: file-creator subagent for each file
  REFERENCE: Templates from @.agent-os/instructions/core/create-spec.md
  
  INVOKE SKILLS (v3.2+):
  - Skill(skill="agent-os-patterns") for code style and testing patterns
  - Skill(skill="agent-os-specialists") for specialist guidance

  1. **spec.md** - Core feature specification
     - Feature overview and user stories (preserve from original)
     - Updated functional requirements (enhanced with codebase analysis)
     - Non-functional requirements (updated to current standards)
     - Acceptance criteria (modernized)

  2. **technical-spec.md** - Technical implementation specification
     - Implementation architecture (updated to current codebase patterns)
     - Integration points (based on fresh codebase analysis)
     - Technology stack (current project dependencies)
     - Data models and API contracts (actual current schemas)
     - Performance requirements (updated standards)
     - **UX/UI Specifications** (if frontend required):
       - Component Architecture (adaptive to tech stack)
       - Page Layout Architecture with visual diagrams
       - Navigation Architecture and structure
       - User Flow & Interaction Patterns
       - Component Integration Map

  3. **implementation-guide.md** - Development approach
     - Step-by-step implementation plan
     - Component breakdown
     - Integration sequence
     - Testing approach per component
     - Rollout strategy

  4. **testing-strategy.md** - Comprehensive testing requirements
     - Test types and coverage requirements
     - Testing frameworks and tools (current project setup)
     - Test data and fixtures
     - Validation criteria
     - Evidence collection requirements

  5. **integration-requirements.md** - System integration specifications
     - Existing system dependencies (from codebase analysis)
     - API integration contracts
     - Database integration approach
     - State management integration
     - External service integration

  6. **architecture-decisions.md** - Technical decisions and constraints
     - Architectural patterns selected (aligned with codebase)
     - Technology choices and rationale
     - Trade-offs and constraints
     - Performance considerations
     - Security requirements

  7. **quality-gates.md** - Validation criteria and metrics
     - Code quality standards
     - Performance thresholds
     - Security requirements
     - Accessibility requirements
     - Deployment readiness criteria
</file_generation_sequence>

<quality_enhancement>
  **Modernization Improvements**:

  ✅ **Codebase Integration**:
  - Reference actual existing components and APIs
  - Use current architectural patterns
  - Follow established coding conventions
  - Identify specific integration points

  ✅ **Technical Accuracy**:
  - Current technology stack (from package.json)
  - Actual database schema (from models)
  - Real API endpoints (from routes)
  - Existing test patterns (from test files)

  ✅ **Implementation Readiness**:
  - Specific file paths and function signatures
  - Exact integration points
  - Concrete examples from codebase
  - Clear implementation sequence

  ✅ **UX/UI Specifications** (for frontend features):
  - Component Architecture mapped to tech stack
  - Page Layout Architecture with responsive design
  - Navigation Architecture and user flows
  - Component Integration Map showing data flow
  - Interaction patterns and user journey documentation

  ✅ **Quality Standards**:
  - Latest best practices
  - Comprehensive testing requirements
  - Evidence collection specifications
  - Validation gates and criteria
</quality_enhancement>

<instructions>
  ACTION: Use file-creator subagent to regenerate all 6 spec files
  REFERENCE: create-spec.md templates for v3.3.0 structure
  SYNTHESIZE: Original spec content + fresh codebase analysis
  ENHANCE: Apply latest standards and best practices
  VALIDATE: All 6 files complete and consistent
  GENERATE: spec-lite.md summary for quick reference
</instructions>

</step>

<step number="4" subagent="file-creator" name="regenerate_micro_granular_tasks">

### Step 4: Regenerate Micro-Granular Tasks with Split Structure

Generate comprehensive micro-granular task breakdown with optimized split file structure.

<task_regeneration_approach>
  **Task Generation Strategy**:

  INPUT: Newly regenerated 6-file spec structure
  APPLY: Codebase analysis from Step 2
  REFERENCE: create-tasks.md micro-granular templates
  PRESERVE: Task completion status from original tasks.md

  **Status Preservation Logic**:
  - IF original task exists with same purpose: Keep [x] completed status
  - IF task is new or significantly different: Mark [ ] incomplete
  - COPY implementation notes from completed tasks
  - PRESERVE lessons learned and gotchas
</task_regeneration_approach>

<task_generation_process>
  **Use file-creator subagent to generate**:

  REFERENCE: @.agent-os/instructions/core/create-tasks.md templates
  APPLY: Micro-granular task decomposition
  IMPLEMENT: Split task file structure

  **Phase 1: Pre-Execution Analysis Tasks**
  - Codebase analysis (mark [x] if already done)
  - Integration strategy creation
  - Context package preparation

  **Phase 2: Backend Implementation Tasks** (if backend required)
  - Backend test design
  - Database schema and migrations
  - API endpoint implementation
  - Business logic and validation
  - Backend integration testing

  **Phase 3: Frontend Implementation Tasks** (if frontend required)
  - Component library setup
  - Navigation architecture implementation
  - Page layout implementation
  - UI component implementation per Component Architecture
  - State management implementation
  - User flow implementation per User Flow patterns
  - Frontend integration testing

  **Phase 4: Full-Stack Integration Tasks** (if both frontend and backend)
  - API contract validation
  - Frontend-backend integration
  - End-to-end user workflow testing

  **Phase 5: System Integration Tasks**
  - Cross-component integration
  - End-to-end validation
  - Final quality assurance

  **Output Structure**:
  ```
  specs/[spec-name]/
  ├── tasks.md              # Lightweight master (50-100 lines)
  └── tasks/                # Individual task detail files
      ├── task-pre-1.md
      ├── task-pre-2.md
      ├── task-impl-1.md
      └── ...
  ```
</task_generation_process>

<micro_granular_quality>
  **Task Quality Requirements**:

  ✅ **Specificity**: Each task has exact file paths, function signatures
  ✅ **Context**: Each task includes sufficient context for autonomous execution
  ✅ **Dependencies**: Clear dependency mapping with parallel execution opportunities
  ✅ **Validation**: Embedded quality gates and acceptance criteria
  ✅ **Testing**: Comprehensive testing requirements per task
  ✅ **Evidence**: Clear evidence collection specifications

  **Agent Optimization**:
  - Tasks assigned to specialist agents (test-architect, implementation-specialist, etc.)
  - Context packages optimized per agent type
  - Parallel execution streams identified
  - Dependency coordination planned
</micro_granular_quality>

<status_migration>
  **Preserve Work Done**:

  ANALYZE: Original tasks.md for completed tasks

  FOR each completed task in original:
    IDENTIFY: Corresponding task in new breakdown
    IF exact match OR similar purpose:
      MARK: New task as [x] completed
      COPY: Implementation notes and lessons learned
      ADD: "Migrated from original spec - work preserved"
    ELSE:
      MARK: [ ] incomplete (significantly changed)
      ADD: "Re-evaluation needed - requirements changed"

  RESULT: Credit for completed work while ensuring quality
</status_migration>

<instructions>
  ACTION: Use file-creator for micro-granular task generation
  REFERENCE: create-tasks.md v2.0 templates
  GENERATE: Master tasks.md + individual task detail files
  PRESERVE: Task completion status from original spec
  OPTIMIZE: Split structure for 90%+ context reduction
  VALIDATE: Task count appropriate, dependencies clear
</instructions>

</step>

<step number="5" name="validation_and_review">

### Step 5: Validation and User Review

Validate the upgraded spec and present to user for review.

<upgrade_validation>
  **Validation Checklist**:

  ✅ **Backup Verification**:
  - [ ] Backup directory created with timestamp
  - [ ] All original files copied to backup
  - [ ] Backup is complete and accessible

  ✅ **Spec File Completeness**:
  - [ ] spec.md regenerated with full content
  - [ ] technical-spec.md with modern integration approach
  - [ ] implementation-guide.md with clear development path
  - [ ] testing-strategy.md with comprehensive testing requirements
  - [ ] integration-requirements.md with codebase integration details
  - [ ] architecture-decisions.md with technical decisions
  - [ ] quality-gates.md with validation criteria
  - [ ] spec-lite.md generated for quick reference

  ✅ **Task Structure Validation**:
  - [ ] tasks.md is lightweight (50-100 lines)
  - [ ] tasks/ directory created with individual task files
  - [ ] All tasks have corresponding detail files
  - [ ] Links in master tasks.md work correctly
  - [ ] Task completion status preserved where appropriate

  ✅ **Content Quality**:
  - [ ] Feature purpose preserved from original spec
  - [ ] Technical approach updated to current codebase
  - [ ] Integration points reference actual existing code
  - [ ] Task breakdown is implementation-ready
  - [ ] All 6 spec files are consistent with each other

  ✅ **Codebase Integration**:
  - [ ] References actual components and APIs
  - [ ] Uses current architectural patterns
  - [ ] Follows established conventions
  - [ ] Integration points are specific and accurate
</upgrade_validation>

<user_review_presentation>
  **Present Upgrade Results**:

  📊 **Upgrade Summary**:
  - **Original Spec Version**: [detected version]
  - **Upgraded To**: Agent OS v3.3.0
  - **Files Backed Up**: [count] files to `.backup-[timestamp]/`
  - **Files Generated**: [count] spec files + [count] task files
  - **Tasks Preserved**: [count]/[total] tasks marked complete
  - **Context Reduction**: [%] reduction in task file context

  📁 **New Spec Structure**:
  ```
  specs/[spec-name]/
  ├── .backup-[timestamp]/     # Your original files (safe rollback)
  ├── spec.md                  # ✅ Regenerated
  ├── spec-lite.md             # ✅ New summary
  ├── technical-spec.md        # ✅ Regenerated with codebase analysis
  ├── implementation-guide.md  # ✅ Generated
  ├── testing-strategy.md      # ✅ Generated
  ├── integration-requirements.md  # ✅ Generated
  ├── architecture-decisions.md    # ✅ Generated
  ├── quality-gates.md         # ✅ Generated
  ├── tasks.md                 # ✅ Lightweight master (50-100 lines)
  └── tasks/                   # ✅ Individual task detail files
      ├── task-pre-1.md
      ├── task-pre-2.md
      └── ...
  ```

  🎯 **Key Improvements**:
  - ✅ 6-file comprehensive spec structure
  - ✅ Fresh codebase integration intelligence
  - ✅ Micro-granular task breakdown
  - ✅ 90%+ context reduction with split task files
  - ✅ Latest Agent OS v3.3.0 standards
  - ✅ Work preservation (completed tasks marked [x])

  🔄 **Rollback Available**:
  If you need to revert: All original files in `.backup-[timestamp]/`

  **Review the upgraded spec and let me know if you'd like any adjustments.**
</user_review_presentation>

<instructions>
  ACTION: Validate all upgraded spec and task files
  CHECK: Backup created, files complete, links working
  VERIFY: Content quality and codebase integration
  PRESENT: Comprehensive upgrade summary to user
  OFFER: Rollback option if needed
  AWAIT: User approval or adjustment requests
</instructions>

</step>

<step number="6" name="finalization">

### Step 6: Finalization and Next Steps

Finalize the upgrade and provide guidance on next steps.

<finalization_actions>
  **IF user approves upgrade**:

  ✅ **Confirm Upgrade Complete**:
  - Spec successfully upgraded to v3.3.0 standards
  - Backup preserved in `.backup-[timestamp]/` directory
  - Ready for task execution with modern workflow

  ✅ **Update Tracking** (if applicable):
  - Update roadmap.md if spec is tracked there
  - Mark original spec as upgraded in any project tracking

  ✅ **Provide Next Steps**:

  INFORM USER:
  ```
  ✅ Spec upgrade to v3.3.0 complete!

  **Next Steps**:

  1. **Review the upgraded spec files**:
     - Check spec.md for feature overview
     - Review technical-spec.md for implementation approach
     - Verify tasks.md has appropriate task breakdown

  2. **Execute tasks with modern workflow**:
     ```
     @.agent-os/commands/execute-tasks.md
     ```
     - Uses micro-granular tasks
     - Leverages split task file structure (90%+ context efficiency)
     - Can use orchestrated parallel execution

  3. **If you need adjustments**:
     - Request specific changes to any spec file
     - I can regenerate individual files
     - Rollback available in `.backup-[timestamp]/`

  **Backup Location**: specs/[spec-name]/.backup-[timestamp]/
  **New Structure**: 6 comprehensive spec files + optimized task structure
  **Context Efficiency**: 90%+ reduction in task review overhead
  ```

  **IF user requests adjustments**:
  - Make specific changes to requested files
  - Maintain v3.3.0 structure and standards
  - Re-validate after changes

  **IF user wants rollback**:
  - Copy files from `.backup-[timestamp]/` back to spec folder
  - Restore original spec structure
  - Explain rollback completed successfully
</finalization_actions>

<instructions>
  ACTION: Confirm upgrade completion with user
  PROVIDE: Clear next steps for task execution
  OFFER: Adjustment capability if needed
  PRESERVE: Backup for rollback option
  GUIDE: User toward execute-tasks workflow
</instructions>

</step>

</process_flow>

<upgrade_outcomes>

## Upgrade Outcomes

### **✅ Comprehensive Modernization**
- **6-file spec structure** with implementation-ready details
- **Fresh codebase integration** based on current code state
- **Micro-granular tasks** optimized for parallel execution
- **90%+ context reduction** with split task file structure

### **✅ Work Preservation**
- **Completed tasks preserved** - credit for work done
- **Implementation notes maintained** - lessons learned captured
- **Backup created** - safe rollback available
- **No data loss** - all original content backed up

### **✅ Modern Standards**
- **Agent OS v3.3.0** - latest version standards
- **Codebase intelligence** - real integration points
- **Quality gates** - comprehensive validation
- **Evidence requirements** - thorough testing standards

### **✅ Execution Ready**
- **Implementation-ready tasks** with exact file paths
- **Optimized for orchestration** - parallel execution support
- **Context efficient** - minimal overhead for task review
- **Quality focused** - embedded validation at every step

</upgrade_outcomes>

<comparison_with_enhance_existing>

## Upgrade-Spec vs Enhance-Existing

**Use `upgrade-spec` when**:
- ✅ You want to fully modernize an old spec to v3.3.0 standards
- ✅ You need fresh codebase analysis and integration intelligence
- ✅ You want the 6-file comprehensive spec structure
- ✅ You want micro-granular task regeneration
- ✅ You want optimized split task file structure
- ✅ Spec is significantly outdated (v1.0 or early v2.0)

**Use `enhance-existing` when**:
- ✅ You just want to add validation requirements
- ✅ Spec structure is already good, just needs validation gates
- ✅ You want to preserve exact existing content structure
- ✅ You only need task structure migration (monolithic → split)
- ✅ Spec is recent and follows good patterns

**Key Differences**:
- `upgrade-spec`: **Full re-evaluation and regeneration**
- `enhance-existing`: **Additive enhancements only**

</comparison_with_enhance_existing>

<post_flight_check>
  EXECUTE: @.agent-os/instructions/meta/post-flight.md
</post_flight_check>
