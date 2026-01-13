---
description: Comprehensive workflow for upgrading existing specs to Agent OS v5.1.0 standards
globs:
alwaysApply: false
version: 5.1.0
encoding: UTF-8
---

# Upgrade Spec to v5.1.0 Standards

## Overview

Complete modernization of existing Agent OS specs to v5.1.0 through:
- Full re-evaluation of spec content
- Fresh codebase analysis with integration intelligence
- 6-file comprehensive spec structure
- Micro-granular task regeneration with split structure
- Test context gathering and skills integration
- Test execution monitoring with streaming reporters
- Test/code alignment validation

**Time**: 30-60 minutes  
**Outcome**: Fully modernized spec with v5.1.0 standards

<pre_flight_check>
  EXECUTE: @.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

<process_flow>

<step number="1" name="pre_upgrade_analysis">

### Step 1: Pre-Upgrade Analysis and Backup

<spec_identification>
  IDENTIFY spec location:
  - User provides: `specs/[spec-name]/`
  - OR user in spec directory
  - OR user provides name to search

  VALIDATE:
  - [ ] Spec folder exists
  - [ ] Contains spec.md or tasks.md
  - [ ] Valid Agent OS structure detected
</spec_identification>

<backup_creation>
  CREATE: `specs/[spec-name]/.backup-[timestamp]/`
  
  BACKUP files:
  - [ ] spec.md, spec-lite.md, technical-spec.md
  - [ ] tasks.md, tasks/ directory
  - [ ] implementation-guide.md, testing-strategy.md
  - [ ] integration-requirements.md, quality-gates.md
  - [ ] architecture-decisions.md
  - [ ] Any other .md files

  RESULT: Complete snapshot for rollback
</backup_creation>

<existing_content_analysis>
  READ and ANALYZE:
  - [ ] spec.md: Feature description, user stories, requirements
  - [ ] technical-spec.md: Implementation approach
  - [ ] tasks.md: Task breakdown, completion status
  - [ ] Other files: Additional context

  EXTRACT:
  - Feature purpose (problem solved)
  - User stories (who, what, need)
  - Current requirements (functional/non-functional)
  - Existing technical approach
  - Task completion status (done/in-progress/blocked)
  - Implementation notes (lessons learned, gotchas)

  IDENTIFY:
  - Spec version (v1.0, v2.x, v3.x, custom)
  - File structure (monolithic, partial v2.0, custom)
  - Completeness (missing files, incomplete sections)
  - Modernization needs (v5.1.0 updates required)
</existing_content_analysis>

<instructions>
  ACTION: Create backup, analyze existing content, extract all meaningful data, preserve context for regeneration
</instructions>

</step>

<step number="2" subagent="context-fetcher" name="fresh_codebase_analysis">

### Step 2: Fresh Codebase Analysis

<codebase_analysis_instructions>
  USE: context-fetcher subagent
  REQUEST:
  - Comprehensive codebase analysis for spec: [SPEC_NAME]
  - Identify existing components, APIs, models, utilities
  - Map integration points for feature: [FEATURE_NAME]
  - Analyze architectural patterns and conventions
  - Identify reuse opportunities and dependencies

  PROCESS: Fresh codebase intelligence
  CACHE: Results for spec regeneration
</codebase_analysis_instructions>

<analysis_scope>
  **Code Scanning**:
  - Components: UI, business logic, utilities (src/components/, src/lib/)
  - APIs: Endpoints, controllers, middleware (src/api/, src/routes/)
  - Models: Database models, types, schemas (src/models/, src/types/)
  - Utilities: Helpers, services, libraries (src/utils/, src/services/)
  - Tests: Patterns and coverage (src/tests/, __tests__/)
  - Config: Setup, dependencies, environment (package.json, config/)

  **Integration Analysis**:
  - Architectural patterns (MVC, Repository, Service Layer, Component)
  - Code organization (structure, boundaries, naming)
  - Integration patterns (communication, data flow, state)
  - Quality patterns (testing, validation, error handling)
  - Performance patterns (caching, optimization, lazy loading)

  **Reuse Opportunities**:
  - Existing components (reuse/extend)
  - Available APIs (existing endpoints)
  - Database schema (tables/models available)
  - Utility functions (helpers to leverage)
  - Design patterns (patterns to follow)
</analysis_scope>

<instructions>
  ACTION: Use context-fetcher for codebase scan, identify reuse opportunities, map patterns
</instructions>

</step>

<step number="3" subagent="file-creator" name="regenerate_6_file_spec">

### Step 3: Regenerate 6-File Spec Structure

<spec_regeneration_approach>
  USE:
  - Extracted content from Step 1
  - Fresh codebase intelligence from Step 2
  - Latest v5.1.0 templates from create-spec.md
  
  ENHANCE: Modern best practices
  PRESERVE: Core feature purpose, completed work insights

  INVOKE SKILLS (v3.2+):
  - Skill(skill="agent-os-patterns") → code style, testing patterns
  - Skill(skill="agent-os-specialists") → specialist guidance
</spec_regeneration_approach>

<file_generation_sequence>
  USE: file-creator subagent for each
  REFERENCE: @.agent-os/instructions/core/create-spec.md

  1. **spec.md** - Core feature specification
     - Feature overview, user stories (preserve original)
     - Updated functional requirements (with codebase analysis)
     - Non-functional requirements (current standards)
     - Acceptance criteria (modernized)

  2. **technical-spec.md** - Technical implementation
     - Implementation architecture (current codebase patterns)
     - Integration points (fresh analysis)
     - Technology stack (current dependencies)
     - Data models, API contracts (actual schemas)
     - Performance requirements (updated)
     - **UX/UI Specifications** (if frontend):
       - Component Architecture (adaptive to tech stack)
       - Page Layout Architecture with visual diagrams
       - Navigation Architecture and structure
       - User Flow & Interaction Patterns
       - Component Integration Map

  3. **implementation-guide.md** - Development approach
     - Step-by-step plan
     - Component breakdown
     - Integration sequence
     - Testing approach per component
     - Rollout strategy

  4. **testing-strategy.md** - Testing requirements
     - Test types, coverage requirements
     - Frameworks and tools (current setup)
     - Test data and fixtures
     - Validation criteria
     - Evidence collection

  5. **integration-requirements.md** - System integration
     - Existing dependencies (from analysis)
     - API integration contracts
     - Database integration
     - State management
     - External services

  6. **architecture-decisions.md** - Technical decisions
     - Patterns selected (aligned with codebase)
     - Technology choices and rationale
     - Trade-offs and constraints
     - Performance considerations
     - Security requirements

  7. **quality-gates.md** - Validation criteria
     - Code quality standards
     - Performance thresholds
     - Security requirements
     - Accessibility requirements
     - Deployment readiness

  8. **spec-lite.md** - Quick reference summary
</file_generation_sequence>

<quality_enhancement>
  ✅ **Codebase Integration**: Reference actual components, APIs, patterns
  ✅ **Technical Accuracy**: Current stack, schema, endpoints, tests
  ✅ **Implementation Readiness**: Specific paths, signatures, examples
  ✅ **UX/UI Specifications**: Component/page/navigation architecture
  ✅ **Quality Standards**: Latest best practices, comprehensive testing
</quality_enhancement>

<instructions>
  ACTION: Regenerate all 6 files using file-creator, synthesize original + fresh analysis, apply latest standards
</instructions>

</step>

<step number="4" subagent="file-creator" name="regenerate_micro_granular_tasks">

### Step 4: Regenerate Micro-Granular Tasks with Split Structure

<task_regeneration_approach>
  INPUT: Newly regenerated 6-file spec
  APPLY: Codebase analysis from Step 2
  REFERENCE: create-tasks.md micro-granular templates
  PRESERVE: Task completion status from original

  **Status Preservation**:
  - IF original task with same purpose: Keep [x] completed
  - IF new/significantly different: Mark [ ] incomplete
  - COPY implementation notes from completed tasks
  - PRESERVE lessons learned and gotchas
</task_regeneration_approach>

<task_generation_process>
  USE: file-creator subagent
  REFERENCE: @.agent-os/instructions/core/create-tasks.md
  IMPLEMENT: Split task file structure

  **Phases**:
  1. Pre-Execution Analysis (mark [x] if done)
  2. Backend Implementation (if backend required)
  3. Frontend Implementation (if frontend required)
     - Component library, navigation, page layout
     - UI components per Component Architecture
     - State management, user flow per patterns
     - Frontend integration testing
  4. Full-Stack Integration (if both)
  5. System Integration

  **Output Structure**:
  ```
  specs/[spec-name]/
  ├── tasks.md              # Lightweight master (50-100 lines)
  └── tasks/                # Individual task detail files
      ├── task-pre-1.md
      ├── task-impl-1.md
      └── ...
  ```
</task_generation_process>

<micro_granular_quality>
  ✅ **Specificity**: Exact paths, signatures
  ✅ **Context**: Sufficient for autonomous execution
  ✅ **Dependencies**: Clear mapping, parallel opportunities
  ✅ **Validation**: Embedded quality gates, acceptance criteria
  ✅ **Testing**: Comprehensive per task
  ✅ **Evidence**: Clear collection specifications
  ✅ **Agent Optimization**: Specialist agents, optimized contexts
</micro_granular_quality>

<status_migration>
  FOR each completed task in original:
    IDENTIFY corresponding task in new breakdown
    IF exact match OR similar purpose:
      MARK new task [x] completed
      COPY implementation notes, lessons learned
      ADD "Migrated from original spec - work preserved"
    ELSE:
      MARK [ ] incomplete
      ADD "Re-evaluation needed - requirements changed"
</status_migration>

<instructions>
  ACTION: Generate micro-granular tasks with split structure, preserve completion status, optimize for parallel execution
</instructions>

</step>

<step number="5" name="validation_and_review">

### Step 5: Validation and User Review

<upgrade_validation>
  **Checklist**:
  
  ✅ **Backup**:
  - [ ] Backup directory with timestamp
  - [ ] All original files copied
  - [ ] Backup complete and accessible

  ✅ **Spec Files**:
  - [ ] spec.md, technical-spec.md, implementation-guide.md
  - [ ] testing-strategy.md, integration-requirements.md
  - [ ] architecture-decisions.md, quality-gates.md
  - [ ] spec-lite.md

  ✅ **Task Structure**:
  - [ ] tasks.md lightweight (50-100 lines)
  - [ ] tasks/ directory with detail files
  - [ ] All tasks have detail files
  - [ ] Links work correctly
  - [ ] Completion status preserved

  ✅ **Content Quality**:
  - [ ] Feature purpose preserved
  - [ ] Technical approach updated to current codebase
  - [ ] Integration points reference actual code
  - [ ] Task breakdown implementation-ready
  - [ ] All 6 files consistent

  ✅ **Codebase Integration**:
  - [ ] References actual components, APIs
  - [ ] Uses current architectural patterns
  - [ ] Follows established conventions
  - [ ] Integration points specific and accurate
</upgrade_validation>

<user_review_presentation>
  **Upgrade Summary**:
  - **Original Version**: [detected]
  - **Upgraded To**: Agent OS v5.1.0
  - **Files Backed Up**: [count] → `.backup-[timestamp]/`
  - **Files Generated**: [count] spec + [count] task files
  - **Tasks Preserved**: [count]/[total] marked complete
  - **Context Reduction**: [%] in task files

  **New Structure**:
  ```
  specs/[spec-name]/
  ├── .backup-[timestamp]/     # Original files (rollback available)
  ├── spec.md                  # ✅ Regenerated
  ├── spec-lite.md             # ✅ New summary
  ├── technical-spec.md        # ✅ With codebase analysis
  ├── implementation-guide.md  # ✅ Generated
  ├── testing-strategy.md      # ✅ Generated
  ├── integration-requirements.md  # ✅ Generated
  ├── architecture-decisions.md    # ✅ Generated
  ├── quality-gates.md         # ✅ Generated
  ├── tasks.md                 # ✅ Lightweight (50-100 lines)
  └── tasks/                   # ✅ Detail files
  ```

  **Key Improvements**:
  - ✅ 6-file comprehensive structure
  - ✅ Fresh codebase integration
  - ✅ Micro-granular task breakdown
  - ✅ 90%+ context reduction
  - ✅ Latest v5.1.0 standards
  - ✅ Work preserved (completed tasks [x])

  **Rollback**: All original files in `.backup-[timestamp]/`

  Review and let me know if adjustments needed.
</user_review_presentation>

<instructions>
  ACTION: Validate all files, present summary, offer rollback, await approval
</instructions>

</step>

<step number="6" name="finalization">

### Step 6: Finalization and Next Steps

<finalization_actions>
  **IF approved**:
  
  ✅ **Confirm Complete**:
  - Spec upgraded to v5.1.0
  - Backup in `.backup-[timestamp]/`
  - Ready for task execution

  ✅ **Update Tracking**:
  - Update roadmap.md if applicable
  - Mark original spec as upgraded

  ✅ **Next Steps**:
  ```
  ✅ Spec upgrade to v5.1.0 complete!

  **Next Steps**:
  1. Review upgraded spec files
  2. Execute tasks:
     @.agent-os/commands/execute-tasks.md
  3. For adjustments: Request specific changes
  4. Rollback available: `.backup-[timestamp]/`

  **New Structure**: 6 comprehensive spec files + optimized tasks
  **Context Efficiency**: 90%+ reduction in task overhead
  ```

  **IF adjustments needed**: Make specific changes, maintain v5.1.0 structure, re-validate

  **IF rollback**: Copy from `.backup-[timestamp]/`, restore original
</finalization_actions>

<instructions>
  ACTION: Confirm completion, provide next steps, offer adjustments/rollback
</instructions>

</step>

</process_flow>

<upgrade_outcomes>
  **✅ Comprehensive Modernization**: 6-file structure, fresh codebase integration, micro-granular tasks, 90%+ context reduction
  **✅ Work Preservation**: Completed tasks preserved, notes maintained, backup created, no data loss
  **✅ Modern Standards**: v5.1.0, codebase intelligence, quality gates, evidence requirements
  **✅ Execution Ready**: Implementation-ready tasks, optimized for orchestration, context efficient, quality focused
</upgrade_outcomes>

<comparison_with_enhance_existing>
  **Use `upgrade-spec` when**:
  - Full modernization to v5.1.0 needed
  - Fresh codebase analysis required
  - Want 6-file comprehensive structure
  - Micro-granular task regeneration needed
  - Optimized split structure desired
  - Spec significantly outdated (v1.0/early v2.0)

  **Use `enhance-existing` when**:
  - Just add validation requirements
  - Spec structure already good
  - Preserve exact existing structure
  - Only need task structure migration
  - Spec recent and follows good patterns

  **Key Difference**: upgrade-spec = full re-evaluation; enhance-existing = additive only
</comparison_with_enhance_existing>

<post_flight_check>
  EXECUTE: @.agent-os/instructions/meta/post-flight.md
</post_flight_check>
