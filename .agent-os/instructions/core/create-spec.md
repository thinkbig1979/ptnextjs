---
description: Spec Creation Rules for Agent OS
globs:
alwaysApply: false
version: 1.1
encoding: UTF-8
---

# Spec Creation Rules

## Overview

Generate detailed feature specifications aligned with product roadmap and mission.

## CRITICAL: Subagent Delegation Requirements

When delegating sub-spec creation to actual subagents via `Task()`, you MUST use the standard delegation template:

```
@.agent-os/instructions/utilities/subagent-delegation-template.md
```

**Why This Matters**: Subagents do NOT automatically inherit:
- Mandatory skill invocations (Step 3.8)
- Pattern lookup hierarchy
- shadcn MCP requirements for UI specs

**Required for ALL Sub-Spec Delegation Prompts**:
```yaml
mandatory_inclusions:
  1_skill_invocation: |
    BEFORE writing this specification, you MUST invoke:
    - Skill(skill="agent-os-patterns")
    For UI specs: mcp__shadcn__list_components() and mcp__shadcn__get_component_demo()

  2_pattern_lookup_hierarchy: |
    FIRST: Check .agent-os/patterns/ (project-specific)
    SECOND: Invoke skills (generic patterns)
    THIRD: Use WebSearch as fallback

  3_confirmation_requirement: |
    CONFIRM which patterns/demos were loaded in the spec
```

**Example Delegation Prompt for UI Sub-Spec**:
```javascript
Task(subagent_type: "general-purpose", prompt: `
... [Use full template from subagent-delegation-template.md]

MANDATORY: Before writing this UI spec, invoke:
1. Skill(skill="agent-os-patterns")
2. mcp__shadcn__list_components()
3. mcp__shadcn__get_component_demo(componentName) for each component you specify

Document which skills/demos were loaded at the end of the spec.
`)
```

## Prerequisites

Before running create-spec, ensure Agent OS is installed via:
- @.agent-os/instructions/core/plan-product.md (for new products), or
- @.agent-os/instructions/core/analyze-product.md (for existing codebases)

This ensures required product-level files exist:
- `.agent-os/product/mission-lite.md` - Product vision and context
- `.agent-os/product/tech-stack.md` - Technology standards

<pre_flight_check>
  EXECUTE: @.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

<process_flow>

<step number="0" name="detect_agent_os_root">

### Step 0: Detect Agent OS Root Directory

Locate the root .agent-os directory to ensure all files are written to the correct location, especially in monorepo environments.

<detection_logic>
  SEARCH for .agent-os directory:
    1. Check current working directory for .agent-os/
    2. If not found, walk up parent directories until .agent-os/ is found
    3. If not found after reaching filesystem root, STOP and inform user

  STORE the absolute path to the directory containing .agent-os/ as AGENT_OS_ROOT

  USE AGENT_OS_ROOT as the base path for ALL subsequent file operations

  EXAMPLE:
    If found at: /home/user/monorepo/.agent-os
    Then AGENT_OS_ROOT = /home/user/monorepo
    All paths like ".agent-os/specs/..." become "/home/user/monorepo/.agent-os/specs/..."
</detection_logic>

<error_handling>
  IF .agent-os directory not found:
    INFORM user: "No .agent-os directory found in current directory or parent directories.
                 Please run one of these commands first:
                 - For new products: @.agent-os/instructions/core/plan-product.md
                 - For existing codebases: @.agent-os/instructions/core/analyze-product.md"
    STOP execution
</error_handling>

</step>

<step number="1" name="prerequisite_verification">

### Step 1: Prerequisite Verification

Verify that required product-level files exist before proceeding with spec creation.

<verification_actions>
  CHECK: {AGENT_OS_ROOT}/.agent-os/product/mission-lite.md exists
  CHECK: {AGENT_OS_ROOT}/.agent-os/product/tech-stack.md exists

  IF either file is missing:
    INFORM user: "Agent OS product files not found. Please run one of these commands first:
                 - For new products: @.agent-os/instructions/core/plan-product.md
                 - For existing codebases: @.agent-os/instructions/core/analyze-product.md"
    STOP execution
  ELSE:
    PROCEED to Step 2
</verification_actions>

<rationale>
  These files provide essential context for spec creation:
  - mission-lite.md: Ensures specs align with product vision
  - tech-stack.md: Guides technical decisions and architecture

  Without these files, specs may be inconsistent with product goals.
</rationale>

</step>

<step number="2" subagent="context-fetcher" name="spec_initiation">

### Step 2: Spec Initiation

Use the context-fetcher subagent to identify spec initiation method by either finding the next uncompleted roadmap item when user asks "what's next?" or accepting a specific spec idea from the user.

<option_a_flow>
  <trigger_phrases>
    - "what's next?"
  </trigger_phrases>
  <actions>
    1. CHECK {AGENT_OS_ROOT}/.agent-os/product/roadmap.md
    2. FIND next uncompleted item
    3. SUGGEST item to user
    4. WAIT for approval
  </actions>
</option_a_flow>

<option_b_flow>
  <trigger>user describes specific spec idea</trigger>
  <accept>any format, length, or detail level</accept>
  <proceed>to detail level selection</proceed>
</option_b_flow>

<detail_level_selection>

### Step 2.5: Select Specification Detail Level

After accepting the spec idea, present the user with three template options to determine the appropriate level of detail for the specification.

<selection_prompt>
  PRESENT to user:

  "Which level of detail would you like for this specification?

  **Quick** - Minimal specification (5-10 min read)
    - Best for: Small features, bug fixes, simple enhancements
    - Includes: Core requirements, basic technical approach, acceptance criteria
    - Template: minimal-spec-template.md
    - File count: 1 main spec file

  **More** - Standard specification (15-25 min read)
    - Best for: Medium features, new components, moderate complexity
    - Includes: Detailed requirements, architecture, API contracts, code examples
    - Template: standard-spec-template.md
    - File count: 2-3 spec files

  **A Lot** - Comprehensive specification (45-60 min read)
    - Best for: Major features, system redesigns, complex integrations
    - Includes: Full technical depth, multiple sub-specs, ERD diagrams, security analysis
    - Templates: All 5 sub-spec templates (implementation, testing, integration, quality, architecture)
    - File count: 5-8 detailed spec files

  Choose: [Quick | More | A Lot]"
</selection_prompt>

<selection_guidance>

  ### When to Use Each Template Level

  **Minimal (Quick) - Use When:**
  - Feature takes < 4 hours to implement
  - Limited scope and clear requirements
  - No new architecture or infrastructure needed
  - Few integration points with existing code
  - Examples: UI tweaks, config changes, simple CRUD operations

  **Standard (More) - Use When:**
  - Feature takes 4-16 hours to implement
  - Moderate complexity with some unknowns
  - Requires new components or services
  - Multiple integration points
  - Needs clear API contracts or data models
  - Examples: New API endpoints, form workflows, authentication features

  **Comprehensive (A Lot) - Use When:**
  - Feature takes > 16 hours to implement
  - High complexity or significant unknowns
  - Major architectural decisions required
  - Complex integration with multiple systems
  - Security or performance critical
  - Team needs extensive implementation guidance
  - Examples: Payment systems, real-time features, major refactors, multi-service integrations

  **Decision Factors:**
  - ⏱️ **Time**: How long will implementation take?
  - 🔧 **Complexity**: How many moving parts?
  - 🔗 **Integration**: How many touchpoints with existing code?
  - ⚠️ **Risk**: What's the impact of getting it wrong?
  - 👥 **Team**: How much guidance do implementers need?
  - 📚 **Documentation**: Will this be referenced long-term?

</selection_guidance>

<store_selection>
  AFTER user selects detail level:

  1. STORE selection in variable: SPEC_DETAIL_LEVEL = [minimal | standard | comprehensive]

  2. LOG selection for reference:
     "Specification detail level: [SELECTED_LEVEL]
      Template(s): [TEMPLATE_NAME(s)]"

  3. PROCEED to Step 3 (Context Gathering)

  This selection will be used in:
  - Step 8-13: Determining which template files to create
  - Step 13: Adjusting quality validation thresholds based on detail level
</store_selection>

</detail_level_selection>

</step>

<step number="3" subagent="context-fetcher" name="context_gathering">

### Step 3: Context Gathering (Conditional)

Use the context-fetcher subagent to read {AGENT_OS_ROOT}/.agent-os/product/mission-lite.md and {AGENT_OS_ROOT}/.agent-os/product/tech-stack.md only if not already in context to ensure minimal context for spec alignment.

<conditional_logic>
  IF both mission-lite.md AND tech-stack.md already read in current context:
    SKIP this entire step
    PROCEED to step 4
  ELSE:
    READ only files not already in context:
      - {AGENT_OS_ROOT}/.agent-os/product/mission-lite.md (if not in context)
      - {AGENT_OS_ROOT}/.agent-os/product/tech-stack.md (if not in context)
    CONTINUE with context analysis
</conditional_logic>

<context_analysis>
  <mission_lite>core product purpose and value</mission_lite>
  <tech_stack>technical requirements</tech_stack>
</context_analysis>

</step>

<step number="3.5" name="research_agents_execution">

### Step 3.5: Research Agents Execution (Compound Engineering Integration)

Execute specialized research agents in parallel to gather comprehensive insights about the codebase, best practices, framework documentation, and git history before creating the specification.

<agent_selection>
  EXECUTE all research agents in parallel for comprehensive context:
  - **repo-research-analyst**: Analyze existing codebase patterns and architecture
  - **best-practices-researcher**: Research industry best practices for similar features
  - **framework-docs-researcher**: Gather relevant framework documentation and patterns
  - **git-history-analyzer**: Analyze git history for similar changes and evolution patterns
</agent_selection>

<parallel_execution_protocol>
  <execution_strategy>
    LAUNCH all research agents simultaneously using Task tool:

    FOR each research agent:
      PROVIDE:
        - Feature description (from user's spec idea)
        - Target type (specification creation context)
        - Tech stack information (from tech-stack.md)
        - Context window allocation (per agent limits from config.yml)

    EXECUTE: All 4 agents in parallel

    COLLECT: Research findings as they complete

    TIMEOUT: 10 minutes maximum for parallel execution
      IF any agent exceeds timeout:
        - Log warning about incomplete research
        - Continue with findings from successful agents
        - Proceed to spec creation with available research
  </execution_strategy>

  <research_format_standard>
    Each agent MUST return research findings in standardized format:

    ```yaml
    agent: [agent_name]
    research_type: [codebase|best_practices|framework_docs|git_history]
    findings:
      - category: [Implementation Patterns|Best Practices|Framework Features|Historical Context]
        title: [Brief finding title]
        description: [Detailed explanation]
        relevance: [How this applies to the current spec]
        examples: [Code examples or references]
        recommendations: [How to apply this in the spec]
        references: [Documentation links or file paths]
    ```

    EXAMPLE RESEARCH FINDING:
    ```yaml
    agent: repo-research-analyst
    research_type: codebase
    findings:
      - category: Implementation Patterns
        title: Existing authentication pattern using Devise gem
        description: Current codebase uses Devise for authentication with custom controllers in app/controllers/users/
        relevance: Password reset should follow existing Devise patterns for consistency
        examples: |
          # app/controllers/users/sessions_controller.rb
          class Users::SessionsController < Devise::SessionsController
            # Custom session handling
          end
        recommendations: |
          - Extend Devise::PasswordsController for password reset
          - Follow existing pattern in app/controllers/users/
          - Reuse existing mailer patterns from app/mailers/users/
        references: |
          - app/controllers/users/sessions_controller.rb:1
          - app/mailers/users/welcome_mailer.rb:1
          - config/initializers/devise.rb:1
    ```
  </research_format_standard>

  <agent_context_optimization>
    Allocate context windows efficiently across research agents:

    <context_allocation>
      - repo-research-analyst: 16KB (comprehensive codebase analysis)
      - best-practices-researcher: 12KB (external research and patterns)
      - framework-docs-researcher: 12KB (framework documentation)
      - git-history-analyzer: 12KB (git history analysis)

      TOTAL: 52KB across 4 agents (leaves context headroom for spec creation)
    </context_allocation>

    <context_filtering>
      FOR each agent:
        - **repo-research-analyst**: Focus on relevant files based on feature type (models, controllers, services, components)
        - **best-practices-researcher**: Search for industry standards and security best practices
        - **framework-docs-researcher**: Find relevant framework documentation (Rails, React, etc.)
        - **git-history-analyzer**: Analyze commits related to similar features or touched files
    </context_filtering>
  </agent_context_optimization>
</parallel_execution_protocol>

<research_synthesis>
  <synthesis_process>
    ### Consolidate Research Findings

    AFTER all research agents complete:

    1. **Collect findings** from all agents:
       - Codebase patterns from repo-research-analyst
       - Best practices from best-practices-researcher
       - Framework patterns from framework-docs-researcher
       - Historical context from git-history-analyzer

    2. **Identify key insights**:
       - Existing implementation patterns to follow
       - Framework features to leverage
       - Best practices to incorporate
       - Historical lessons learned

    3. **Generate recommendations for spec**:
       - Implementation approach based on codebase patterns
       - Code examples from existing codebase
       - Framework-specific considerations
       - Security and performance best practices
       - Common pitfalls to avoid (from git history)

    4. **Prepare integration guidance**:
       - Files likely to be modified
       - Integration points with existing code
       - Testing patterns used in codebase
       - Documentation standards

  </synthesis_process>

  <synthesis_output_format>
    📚 **Research Synthesis Summary**

    **Codebase Insights** (repo-research-analyst):
    - Existing patterns: [list]
    - Related components: [list with file paths]
    - Integration points: [list]
    - Code examples: [relevant snippets]

    **Best Practices** (best-practices-researcher):
    - Industry standards: [list]
    - Security considerations: [list]
    - Performance patterns: [list]
    - Recommended approaches: [list]

    **Framework Patterns** (framework-docs-researcher):
    - Relevant framework features: [list]
    - Framework-specific patterns: [list]
    - Documentation references: [links]
    - Example implementations: [snippets]

    **Historical Context** (git-history-analyzer):
    - Similar past changes: [list with commit refs]
    - Evolution patterns: [observations]
    - Common issues encountered: [list]
    - Lessons learned: [insights]

    **Actionable Recommendations**:
    1. [Implementation approach based on research]
    2. [Files to modify based on codebase analysis]
    3. [Framework features to leverage]
    4. [Security/performance considerations]
    5. [Testing strategy based on existing patterns]
  </synthesis_output_format>
</research_synthesis>

<spec_enhancement_preparation>
  <research_integration>
    USE research findings to enhance spec creation:

    **In Step 8 (spec.md creation)**:
    - Include code examples from codebase research
    - Reference existing patterns and integration points
    - Incorporate best practices in recommendations
    - Add framework-specific considerations

    **In Step 9.5 (UX/UI spec if applicable)**:
    - Reference existing UI patterns from codebase
    - Include component examples
    - Follow established design system

    **In technical spec creation**:
    - Use actual file paths from codebase research
    - Include real code examples from repo analysis
    - Reference framework documentation
    - Apply historical lessons learned

    **In implementation guidance**:
    - Provide specific file paths to modify
    - Include integration steps based on codebase structure
    - Reference similar past implementations
    - Highlight potential pitfalls from git history
  </research_integration>

  <state_persistence>
    SAVE research findings to:
      {AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/research-findings.yml

    FORMAT:
      ```yaml
      research_timestamp: [ISO_timestamp]
      feature_description: [user's spec idea]
      tech_stack: [from tech-stack.md]
      agents_executed:
        - repo-research-analyst
        - best-practices-researcher
        - framework-docs-researcher
        - git-history-analyzer
      codebase_insights:
        existing_patterns: [list]
        integration_points: [list with file paths]
        code_examples: [map of examples]
      best_practices:
        security: [list]
        performance: [list]
        general: [list]
      framework_patterns:
        features: [list]
        documentation: [list of links]
        examples: [list]
      historical_context:
        similar_changes: [list with commits]
        lessons_learned: [list]
      recommendations:
        implementation_approach: [description]
        files_to_modify: [list with paths]
        testing_strategy: [description]
      ```

    USE research file for:
      - Spec creation reference (Steps 7-9)
      - Technical spec enhancement
      - Implementation guidance
      - Code example inclusion
  </state_persistence>
</spec_enhancement_preparation>

<error_handling_research>
  <agent_failure_handling>
    IF research agent fails to complete:
      - LOG: Agent name, error message, timestamp
      - CONTINUE: With remaining agents (degraded but functional)
      - PROCEED: To spec creation with available research

    IF multiple agents fail (>50%):
      - WARN: Research may be incomplete
      - ASK: User whether to continue or retry
      - OPTION: Skip research and proceed with basic spec creation

    IF all agents fail:
      - WARN: No research available
      - PROCEED: With basic spec creation (Steps 4-9)
      - SUGGEST: Manual research or retry later
  </agent_failure_handling>

  <finding_quality_validation>
    FOR each agent's findings:
      VALIDATE:
        - Category present and valid
        - Description provides actionable insights
        - Relevance explained for current spec
        - Examples or references provided

      IF validation fails for minor issues:
        - LOG: Low-quality finding details
        - INCLUDE: Finding with quality warning
        - PROCEED: With synthesis

      IF validation fails critically (no content):
        - SKIP: Invalid finding
        - LOG: Error for debugging
  </finding_quality_validation>
</error_handling_research>

<instructions>
  ACTION: Launch all 4 research agents in parallel
  EXECUTE: Agents simultaneously with feature context and tech stack
  COLLECT: Research findings from each agent
  SYNTHESIZE: Consolidate insights into actionable recommendations
  PREPARE: Enhanced context for spec creation in subsequent steps
  PERSIST: Save research findings for reference during spec creation
</instructions>

</step>

<step number="3.8" name="skill_pattern_lookup">

### Step 3.8: Load Tech Stack Patterns via Skills (v3.2+)

**⚠️ MANDATORY TOOL INVOCATION - DO NOT SKIP**

This step requires you to use the Skill tool. You MUST make an actual tool call.

<skill_invocation_required>
  **STEP 1: Check for Project-Specific Patterns FIRST**

  Before invoking the global skill, check if project-specific patterns exist:

  ```
  CHECK: .agent-os/patterns/ directory in the project

  IF .agent-os/patterns/ exists:
    READ relevant files based on tech stack:
    - .agent-os/patterns/frontend/typescript.md (TypeScript/React)
    - .agent-os/patterns/backend/python.md (Python)
    - .agent-os/patterns/backend/rails.md (Rails)
    - .agent-os/patterns/backend/api.md (API development)
    - .agent-os/patterns/global/error-handling.md (Error handling)

  These project-specific patterns take PRECEDENCE over generic skill patterns.
  ```

  **STEP 2: Invoke Global Skill for Generic Patterns**

  ```
  Skill(skill="agent-os-patterns")
  ```

  This is a REQUIRED tool invocation. The skill provides generic patterns for:
  - Testing conventions (Vitest, Playwright, Convex)
  - Code style standards

  **After invoking the skill**, READ the relevant reference files:

  | Task | Skill Reference (Generic) |
  |------|---------------------------|
  | Vitest testing | references/testing/vitest.md |
  | Playwright E2E | references/testing/playwright.md |
  | Convex testing | references/testing/convex.md |
  | Test strategy | references/testing/test-strategies.md |
  | Code style | references/global/coding-style.md |

  **VERIFICATION**: Before proceeding to Step 4, confirm:
  - [ ] Checked .agent-os/patterns/ for project-specific patterns
  - [ ] Skill tool was invoked
  - [ ] Relevant reference files were loaded
  - [ ] Patterns are available for spec creation

  **OUTPUT**: State which patterns were loaded, e.g.:
  "✅ Project patterns: typescript.md (from .agent-os/patterns/)"
  "✅ Skill patterns: vitest.md, coding-style.md"
</skill_invocation_required>

</step>

<step number="4" subagent="context-fetcher" name="requirements_clarification">

### Step 4: Requirements Clarification

Use the context-fetcher subagent to clarify scope boundaries and technical considerations by asking numbered questions as needed to ensure clear requirements before proceeding.

<clarification_areas>
  <scope>
    - in_scope: what is included
    - out_of_scope: what is excluded (optional)
  </scope>
  <technical>
    - functionality specifics
    - UI/UX requirements
    - integration points
  </technical>
</clarification_areas>

<decision_tree>
  IF clarification_needed:
    ASK numbered_questions
    WAIT for_user_response
  ELSE:
    PROCEED to_date_determination
</decision_tree>

</step>

<step number="4.5" subagent="spec-creator" name="tdd_workflow_definition">

### Step 4.5: TDD Workflow Definition

Define the Test-Driven Development workflow for this specification, including enforcement level, RED-GREEN-REFACTOR phases, and coverage targets. This ensures systematic test-first development during implementation.

<tdd_workflow_purpose>
  The TDD workflow definition ensures:
  - Clear test-first development strategy is established upfront
  - RED-GREEN-REFACTOR cycle is planned before implementation
  - Appropriate enforcement level matches feature criticality
  - Coverage targets are set based on feature requirements
  - Implementation follows test-first principles consistently

  This planning prevents ad-hoc testing approaches and ensures quality from the start.
</tdd_workflow_purpose>

<when_to_apply>
  ALWAYS define TDD workflow for:
    - New feature implementations
    - API endpoint development
    - Data model changes
    - Business logic implementation
    - Integration components
    - Critical bug fixes requiring tests

  MAY skip TDD workflow for:
    - Pure documentation updates
    - Configuration-only changes
    - UI styling tweaks (no logic)
    - Dependency version bumps (no behavior changes)
</when_to_apply>

<step_sequence>
  Execute TDD workflow definition in this order:

  1. **Determine Enforcement Level** (5-10 min)
     - Assess feature criticality and risk level
     - Select appropriate enforcement level (STRICT, STANDARD, RELAXED)
     - Document rationale for enforcement level choice

  2. **Design RED Phase** (15-30 min)
     - Identify failing tests to write first
     - Define expected test failures and error messages
     - Plan test structure and organization

  3. **Design GREEN Phase** (15-30 min)
     - Define minimal implementation to pass tests
     - Identify simplest solution approach
     - Plan incremental implementation steps

  4. **Design REFACTOR Phase** (10-20 min)
     - Identify potential refactoring opportunities
     - Define code quality improvements
     - Plan optimization opportunities

  5. **Set Coverage Targets** (5-10 min)
     - Define minimum coverage requirements
     - Set target coverage goals
     - Document coverage validation approach
</step_sequence>

<enforcement_level_selection>
  **Input**: Feature requirements and risk assessment from Steps 3-4

  **Process**:
    1. Assess feature criticality using these criteria:
       - Data integrity impact
       - Security sensitivity
       - Financial transaction involvement
       - User safety implications
       - System stability impact
       - Error recovery criticality

    2. Select enforcement level based on assessment:

       **STRICT Enforcement**:
       - Critical production features
       - Security-sensitive code (authentication, authorization, encryption)
       - Financial transactions (payments, billing, accounting)
       - Data integrity operations (migrations, validation, consistency)
       - Safety-critical systems
       - Compliance-required functionality

       **STANDARD Enforcement** (Default):
       - Standard feature development
       - API endpoint implementation
       - Business logic components
       - UI components with business logic
       - Integration points
       - Most production code

       **RELAXED Enforcement**:
       - Rapid prototyping phase
       - Spike development for research
       - Legacy code integration (adding tests to existing code)
       - Learning exercises
       - Proof-of-concept development

    3. Document enforcement level rationale

  **Output Format**:
    ```markdown
    ## TDD Workflow

    ### Enforcement Level: [STRICT|STANDARD|RELAXED]

    **Rationale**: [1-2 sentences explaining why this level is appropriate]

    **Enforcement Behavior**:
    - Test-first requirement: [Block|Warn|Log only]
    - Implementation blocking: [Enabled|Disabled]
    - Quality gates: [List specific gates for this level]
    ```

  **Integration with Config**:
    - Enforcement level overrides config.yml default for this feature
    - Add enforcement_level field to spec YAML frontmatter
    - Referenced by task-orchestrator during task execution
</enforcement_level_selection>

<red_phase_design>
  **Input**: Feature requirements and acceptance criteria

  **Process**:
    1. Identify test categories to write:
       - Unit tests (functions, methods, classes)
       - Integration tests (component interactions)
       - API tests (endpoints, request/response)
       - Database tests (queries, migrations, constraints)
       - Edge case tests (boundaries, errors, validation)

    2. For each test category:
       - List specific tests to write
       - Define expected failures (what should fail and why)
       - Specify expected error messages
       - Plan test data and fixtures

    3. Define test execution order:
       - Start with simplest unit tests
       - Progress to integration tests
       - End with edge cases and error scenarios

    4. Estimate test writing time

  **Output Format**:
    ```markdown
    ### RED Phase: Failing Tests

    **Objective**: Write tests that fail because feature not yet implemented

    #### Unit Tests
    1. **Test Name**: `test_user_validation_requires_email`
       - **Purpose**: Verify user model requires email field
       - **Expected Failure**: `ValidationError: email is required`
       - **Test Data**: User object without email field

    2. **Test Name**: `test_email_format_validation`
       - **Purpose**: Verify email must be valid format
       - **Expected Failure**: `ValidationError: invalid email format`
       - **Test Data**: User with invalid email "notanemail"

    [Continue for all tests...]

    #### Integration Tests
    [Same format for integration tests...]

    #### Edge Case Tests
    [Same format for edge cases...]

    **Test Execution Order**:
    1. Unit tests (parallel execution)
    2. Integration tests (sequential)
    3. Edge case tests (parallel execution)

    **Expected Test Results**:
    - Total tests: [NUMBER]
    - Expected failures: [NUMBER] (100%)
    - Expected passes: 0

    **RED Phase Complete When**:
    - [ ] All planned tests written
    - [ ] All tests execute (no syntax errors)
    - [ ] All tests fail with expected error messages
    - [ ] Test failures clearly indicate missing implementation
    ```

  **Integration with Spec**:
    - RED phase tests become part of Testing Strategy section
    - Expected failures document what implementation must provide
    - Test data requirements inform data model design
</red_phase_design>

<green_phase_design>
  **Input**: RED phase test specifications and feature requirements

  **Process**:
    1. For each failing test, define minimal implementation:
       - Simplest code to make test pass
       - No premature optimization
       - No extra features beyond test requirements
       - Clear, readable approach

    2. Plan implementation order:
       - Start with foundational components
       - Build incrementally to satisfy tests
       - Verify tests pass after each increment

    3. Define "minimal" explicitly:
       - Maximum lines per function: [NUMBER from config]
       - Complexity constraints: Avoid nested loops, deep conditionals
       - Avoid abstractions not required by tests
       - Use standard library over custom solutions

    4. Identify implementation checkpoints:
       - After each test passes, commit state
       - Document what each checkpoint achieves

  **Output Format**:
    ```markdown
    ### GREEN Phase: Minimal Implementation

    **Objective**: Write simplest code to pass all tests

    #### Implementation Approach

    **Minimal Implementation Principles**:
    - Maximum 50 lines per function
    - Maximum cyclomatic complexity: 10
    - Use standard library functions over custom code
    - No premature abstraction
    - Single responsibility per function

    #### Implementation Steps

    1. **Step**: Implement User model email validation
       - **Files**: `models/user.js`
       - **Code**: Add `email` required field with email validator
       - **Tests Passing**: `test_user_validation_requires_email`, `test_email_format_validation`
       - **Lines of Code**: ~10 lines
       - **Checkpoint**: User model validates email presence and format

    2. **Step**: Implement email uniqueness check
       - **Files**: `models/user.js`
       - **Code**: Add unique constraint and uniqueness validation
       - **Tests Passing**: `test_email_uniqueness`
       - **Lines of Code**: ~5 lines
       - **Checkpoint**: Users cannot have duplicate emails

    [Continue for all implementation steps...]

    **Implementation Order**:
    1. Data models and validations
    2. Core business logic functions
    3. API endpoint handlers
    4. Integration components
    5. Error handling

    **Expected Test Results After GREEN**:
    - Total tests: [NUMBER]
    - Expected failures: 0
    - Expected passes: [NUMBER] (100%)
    - Expected coverage: [PERCENTAGE]%

    **GREEN Phase Complete When**:
    - [ ] All tests pass
    - [ ] Coverage target met
    - [ ] No over-implementation detected
    - [ ] Code follows minimal implementation principles
    - [ ] All checkpoints achieved
    ```

  **Integration with Spec**:
    - Implementation steps become task acceptance criteria
    - Minimal implementation principles guide code review
    - Checkpoints become progress tracking milestones
</green_phase_design>

<refactor_phase_design>
  **Input**: GREEN phase implementation and test suite

  **Process**:
    1. Identify refactoring opportunities:
       - Code duplication to extract
       - Functions exceeding complexity limits
       - Performance optimization opportunities
       - Code clarity improvements
       - Pattern application opportunities

    2. For each opportunity:
       - Define current state (what needs refactoring)
       - Define target state (improved version)
       - Estimate effort (Small/Medium/Large)
       - Assess priority (Must/Should/Could)

    3. Plan refactoring order:
       - Prioritize Must refactorings
       - Group related refactorings
       - Ensure tests remain passing throughout

    4. Define refactoring validation:
       - Tests must pass after each refactoring
       - Coverage must not decrease
       - Performance must not regress

  **Output Format**:
    ```markdown
    ### REFACTOR Phase: Code Quality Improvements

    **Objective**: Improve code quality while maintaining passing tests

    #### Refactoring Opportunities

    1. **Opportunity**: Extract email validation logic
       - **Current State**: Validation logic duplicated in model and API handler
       - **Target State**: Shared `validateEmail()` utility function
       - **Files Affected**: `models/user.js`, `api/users.js`, `utils/validation.js` (new)
       - **Effort**: Small (15-20 min)
       - **Priority**: Should
       - **Benefit**: DRY principle, single source of truth for email validation

    2. **Opportunity**: Optimize database query for user lookup
       - **Current State**: N+1 query for user email uniqueness check
       - **Target State**: Single query with index
       - **Files Affected**: `models/user.js`, `migrations/add_email_index.js` (new)
       - **Effort**: Medium (30-40 min)
       - **Priority**: Must
       - **Benefit**: Performance improvement for high-volume scenarios

    [Continue for all refactoring opportunities...]

    #### Refactoring Order
    1. Must-have refactorings (blocking quality issues)
    2. Should-have refactorings (significant improvements)
    3. Could-have refactorings (nice-to-have polish)

    #### Refactoring Validation
    - [ ] All tests pass after each refactoring
    - [ ] Coverage remains ≥ target
    - [ ] Performance benchmarks do not regress
    - [ ] Code complexity metrics improve
    - [ ] No new linting warnings

    **REFACTOR Phase Complete When**:
    - [ ] All Must refactorings completed
    - [ ] Should refactorings completed (or documented for future)
    - [ ] All tests passing
    - [ ] Coverage target maintained
    - [ ] Code quality metrics improved
    ```

  **Integration with Spec**:
    - Must refactorings become task acceptance criteria
    - Should refactorings become optional improvements
    - Could refactorings documented for future consideration
</refactor_phase_design>

<coverage_targets>
  **Input**: Feature criticality and enforcement level

  **Process**:
    1. Determine base coverage targets by enforcement level:

       **STRICT Enforcement**:
       - Minimum coverage: 90%
       - Target coverage: 95%
       - Threshold for warnings: 85%

       **STANDARD Enforcement**:
       - Minimum coverage: 85%
       - Target coverage: 90%
       - Threshold for warnings: 80%

       **RELAXED Enforcement**:
       - Minimum coverage: 75%
       - Target coverage: 85%
       - Threshold for warnings: 70%

    2. Adjust targets based on feature type:
       - Business logic: +5% to all targets
       - Data validation: +5% to all targets
       - Security features: +10% to all targets
       - UI components: -5% to all targets (focus on logic coverage)

    3. Define coverage validation approach:
       - Tools: Jest/Vitest/pytest/etc.
       - Reports: HTML, JSON, terminal
       - CI/CD integration: Block merge if below minimum

  **Output Format**:
    ```markdown
    ### Coverage Targets

    **Enforcement Level**: [LEVEL]
    **Feature Type**: [TYPE]

    **Coverage Requirements**:
    - Minimum coverage: [NUMBER]% (blocks task completion if not met)
    - Target coverage: [NUMBER]% (goal for implementation)
    - Warning threshold: [NUMBER]% (triggers warning messages)

    **Coverage Categories**:
    - Statement coverage: [NUMBER]%
    - Branch coverage: [NUMBER]%
    - Function coverage: [NUMBER]%
    - Line coverage: [NUMBER]%

    **Coverage Validation**:
    - Testing framework: [Jest|Vitest|pytest|RSpec|PHPUnit|etc.]
    - Coverage tool: [Framework built-in|Istanbul|Coverage.py|SimpleCov|etc.]
    - Report formats: HTML (detailed), JSON (CI), Terminal (developer)
    - Validation timing: After GREEN phase, after REFACTOR phase
    - CI/CD integration: Block PR merge if below minimum coverage

    **Coverage Exclusions** (if any):
    - Configuration files
    - Type definitions
    - Generated code
    - Third-party integrations (covered by integration tests separately)
    ```

  **Integration with Spec**:
    - Coverage targets become acceptance criteria
    - Coverage validation added to testing strategy
    - CI/CD pipeline configured with coverage gates
</coverage_targets>

<tdd_acceptance_criteria>
  After defining TDD workflow, add these criteria to specification:

  **TDD Acceptance Criteria** (added to main spec acceptance criteria):
    - [ ] RED Phase: All planned tests written and failing with expected errors
    - [ ] GREEN Phase: All tests passing with minimal implementation
    - [ ] REFACTOR Phase: Must-have refactorings completed (if applicable)
    - [ ] Coverage: Meets or exceeds minimum coverage target ([NUMBER]%)
    - [ ] Test-First: Implementation files created after test files (timestamp verification)
    - [ ] Quality Gates: All TDD quality gates passed

  These criteria are enforced by task-orchestrator during task execution.
</tdd_acceptance_criteria>

<final_tdd_workflow_documentation>
  After completing TDD workflow definition:

  1. **Add TDD Section to Specification**:
     In main spec.md file, add section after requirements:

     ```markdown
     ## Test-Driven Development Approach

     ### TDD Configuration
     - **Enforcement Level**: [STRICT|STANDARD|RELAXED]
     - **Rationale**: [Why this level is appropriate]

     ### RED Phase: Failing Tests
     [Content from red_phase_design]

     ### GREEN Phase: Minimal Implementation
     [Content from green_phase_design]

     ### REFACTOR Phase: Code Quality
     [Content from refactor_phase_design]

     ### Coverage Targets
     [Content from coverage_targets]

     ### TDD Acceptance Criteria
     [Content from tdd_acceptance_criteria]
     ```

  2. **Update Spec Frontmatter**:
     Add TDD configuration to YAML frontmatter:
     ```yaml
     tdd_enforcement:
       enabled: true
       level: [STRICT|STANDARD|RELAXED]
       minimum_coverage: [NUMBER]
       target_coverage: [NUMBER]
     ```

  3. **Reference in Tasks**:
     When creating tasks (Step 10), reference TDD workflow:
     - Each task inherits TDD configuration from spec
     - Task acceptance criteria include TDD criteria
     - Task-orchestrator uses TDD workflow during execution

  4. **Verification**:
     - [ ] TDD section complete in spec.md
     - [ ] Enforcement level selected and documented
     - [ ] RED/GREEN/REFACTOR phases defined
     - [ ] Coverage targets set
     - [ ] TDD acceptance criteria added
     - [ ] Spec frontmatter updated
</final_tdd_workflow_documentation>

<time_investment>
  **Total Time**: 50-100 minutes depending on feature complexity

  **Simple Features** (50-60 min):
    - Enforcement level selection: 5 min
    - RED phase design: 15 min
    - GREEN phase design: 15 min
    - REFACTOR phase design: 10 min
    - Coverage targets: 5 min

  **Moderate Features** (70-80 min):
    - Enforcement level selection: 10 min
    - RED phase design: 20 min
    - GREEN phase design: 25 min
    - REFACTOR phase design: 15 min
    - Coverage targets: 5 min

  **Complex Features** (90-100 min):
    - Enforcement level selection: 10 min
    - RED phase design: 30 min
    - GREEN phase design: 30 min
    - REFACTOR phase design: 20 min
    - Coverage targets: 10 min

  Time investment ensures clear testing strategy before implementation begins.
</time_investment>

<skip_criteria>
  TDD workflow definition MAY be skipped if ALL of the following are true:
    - [ ] Feature is pure documentation (no code changes)
    - [ ] Feature is configuration-only (no logic)
    - [ ] Feature is UI styling only (no behavior changes)
    - [ ] Feature is dependency version bump (no API changes)
    - [ ] No tests are required or possible for this feature

  If ANY criterion is false, TDD workflow MUST be defined.
</skip_criteria>

<output>
  After completing TDD workflow definition:

  1. CONFIRM completion to user:
     ```
     ✅ TDD Workflow Defined

     - Enforcement Level: [LEVEL]
     - RED Phase: [COUNT] tests planned
     - GREEN Phase: [COUNT] implementation steps
     - REFACTOR Phase: [COUNT] opportunities identified
     - Coverage Target: [NUMBER]%

     TDD workflow added to specification. Ready to proceed to Ultra-Thinking Protocol.
     ```

  2. PROCEED to Step 5 (Ultra-Thinking Protocol)
</output>

</step>

<step number="5" subagent="spec-creator" name="ultra_thinking_protocol">

### Step 5: Ultra-Thinking Protocol (Deep Analysis)

Apply systematic deep analysis using three specialized templates to ensure comprehensive specification quality.

<ultra_thinking_purpose>
  The ultra-thinking protocol ensures specifications are:
  - Considered from ALL stakeholder perspectives (not just technical)
  - Resilient to edge cases, failures, and attack scenarios
  - Reviewed from multiple quality angles (technical, business, UX, risk, team, vision)

  This deep analysis prevents costly rework and production issues by surfacing concerns early.
</ultra_thinking_purpose>

<when_to_apply>
  ALWAYS apply ultra-thinking for:
    - New features with broad user/business impact
    - Architecture changes affecting multiple systems
    - Security-sensitive functionality
    - Performance-critical components
    - Complex multi-step workflows

  MAY skip ultra-thinking for:
    - Simple bug fixes (single file, <50 lines changed)
    - Cosmetic UI tweaks with no logic changes
    - Documentation-only updates
    - Dependency version bumps (no API changes)
</when_to_apply>

<analysis_sequence>
  Execute the three ultra-thinking analyses in this order:

  1. **Stakeholder Perspective Analysis** (30-120 min)
     - Template: templates/ultra-thinking/stakeholder-analysis.md
     - Purpose: Identify concerns across 6 stakeholder perspectives
     - Output: Multi-stakeholder impact assessment with conflicts and resolutions

  2. **Scenario Exploration** (30-120 min)
     - Template: templates/ultra-thinking/scenario-exploration.md
     - Purpose: Systematically explore edge cases, failures, scale, security scenarios
     - Output: Risk-prioritized scenario list with mitigation strategies

  3. **Multi-Angle Review** (30-90 min)
     - Template: templates/ultra-thinking/multi-angle-review.md
     - Purpose: Review from 6 quality angles (technical, business, risk, team, UX, vision)
     - Output: Comprehensive review report with overall rating and recommendation
</analysis_sequence>

<execution_approach>
  FOR each analysis template:
    1. READ the template from templates/ultra-thinking/
    2. APPLY the framework systematically to current specification
    3. DOCUMENT findings in the analysis format specified
    4. IDENTIFY gaps, risks, and improvements needed
    5. UPDATE specification draft to address critical findings
</execution_approach>

<analysis_1_stakeholder_perspective>
  **Input**: Current specification draft (from Step 3.5 research synthesis)

  **Process**:
    1. Read templates/ultra-thinking/stakeholder-analysis.md
    2. For each of 6 stakeholder perspectives (Developer, Operations, User, Security, Business, QA):
       - Apply the analysis framework questions
       - Rate impact (1-5 scale) for this stakeholder
       - Document positive impacts and concerns
       - Propose mitigation strategies
    3. Identify conflicts between stakeholder interests
    4. Propose conflict resolutions with explicit trade-offs
    5. Define success criteria per stakeholder

  **Output Format**:
    ```markdown
    ## Stakeholder Analysis Summary

    ### Multi-Stakeholder Impact Assessment

    **Developer Impact**: [1-5] ⭐
    - Positive: [benefits]
    - Negative: [concerns]
    - Mitigation: [how to address]

    **Operations Impact**: [1-5] ⭐
    [Same format for Operations, User, Security, Business, QA]

    ### Identified Conflicts
    1. [Stakeholder A] vs [Stakeholder B]: [conflict description]
       - Resolution: [approach]
       - Trade-off: [what we're optimizing for]

    ### Recommended Approach
    Based on stakeholder analysis:
    1. [Key recommendation balancing stakeholder needs]
    2. [Phasing strategy if applicable]

    ### Success Criteria by Stakeholder
    - Developer: [how developers measure success]
    - Operations: [how ops measures success]
    - User: [how users measure success]
    - Security: [how security measures success]
    - Business: [how business measures success]
    - QA: [how QA measures success]
    ```

  **Integration with Spec**:
    - ADD stakeholder success criteria to specification
    - UPDATE technical approach to address developer/ops concerns
    - ADD user experience requirements from user perspective
    - ADD security requirements from security perspective
    - ADD business metrics from business perspective
    - ADD testing requirements from QA perspective
</analysis_1_stakeholder_perspective>

<analysis_2_scenario_exploration>
  **Input**: Specification draft + Stakeholder analysis findings

  **Process**:
    1. Read templates/ultra-thinking/scenario-exploration.md
    2. For each of 7 scenario categories:
       - Edge Cases & Boundary Conditions: Empty input, max size, concurrent access
       - Failure Scenarios: Infrastructure failures, data failures, dependency failures
       - Scale & Performance: High volume, large data, slow networks, resource constraints
       - Security Attacks: Injection, auth bypass, privilege escalation, DoS
       - User Behavior: Unexpected usage, mistakes, multi-device, power users
       - Integration & Dependencies: Third-party changes, data consistency, migrations
       - Operational: Deployment, monitoring, maintenance, configuration
    3. For each identified scenario:
       - Assess likelihood (Very Likely → Very Unlikely)
       - Assess impact (Critical → Minimal)
       - Calculate risk level (Likelihood × Impact)
       - Determine priority (P1/P2/P3)
    4. For high-risk scenarios (P1), define mitigation strategies:
       - Prevention (design to prevent)
       - Detection (identify when occurs)
       - Graceful degradation (handle elegantly)
       - Recovery (restore normal operation)

  **Output Format**:
    ```markdown
    ## Scenario Exploration Report

    ### Scenarios Identified: [TOTAL]
    **High Risk (P1)**: [COUNT]
    **Medium Risk (P2)**: [COUNT]
    **Low Risk (P3)**: [COUNT]

    ### High Risk Scenarios (Must Address)

    #### Scenario: [NAME]
    **Category**: [Edge Case/Failure/Scale/Security/User/Integration/Operational]
    **Description**: [What happens in this scenario]
    **Likelihood**: [Very Likely/Likely/Possible/Unlikely/Very Unlikely]
    **Impact**: [Critical/High/Medium/Low/Minimal]
    **Current Handling**: [How currently handled, or "Unhandled"]

    **Recommended Mitigation**:
    1. Prevention: [strategy]
    2. Detection: [strategy]
    3. Graceful Degradation: [strategy]
    4. Recovery: [strategy]

    **Implementation Priority**: P1
    **Estimated Effort**: [Small/Medium/Large]

    ### Summary & Recommendations
    **Critical Gaps**: [List unhandled P1 scenarios]
    **Recommended Actions**:
    1. [Immediate P1 actions]
    2. [Near-term P2 actions]
    3. [Future P3 considerations]

    **Specification Updates Needed**:
    - [Spec sections requiring updates]

    **Testing Requirements**:
    - [Test cases for scenario coverage]
    ```

  **Integration with Spec**:
    - ADD error handling requirements for P1 failure scenarios
    - ADD input validation requirements for P1 edge cases
    - ADD performance requirements for P1 scale scenarios
    - ADD security requirements for P1 attack scenarios
    - ADD acceptance criteria for P1 scenario handling
    - CREATE test cases for all P1 scenarios
</analysis_2_scenario_exploration>

<analysis_3_multi_angle_review>
  **Input**: Specification draft + Stakeholder analysis + Scenario exploration

  **Process**:
    1. Read templates/ultra-thinking/multi-angle-review.md
    2. For each of 6 review angles:
       - Technical Excellence: Code quality, architecture, technical debt
       - Business Value: ROI, competitive advantage, strategic alignment
       - Risk Management: Technical risks, security vulnerabilities, compliance
       - Team Collaboration: Onboarding, documentation, development velocity
       - User Experience: Usability, accessibility, performance perception
       - Long-term Vision: Scalability, maintainability, future evolution
    3. For each angle:
       - Apply the review framework questions
       - Document strengths (what's done well)
       - Document concerns (what needs improvement)
       - Assign rating (1-5 scale)
       - List specific recommendations
    4. Synthesize findings:
       - Calculate overall rating (average of angles)
       - Identify critical issues across angles
       - Make final recommendation (Proceed / Caution / Needs Revision)

  **Output Format**:
    ```markdown
    ## Multi-Angle Review Report

    ### Review by Angle

    #### 1. Technical Excellence 🔧
    **Rating**: [1-5] ⭐

    **Strengths**:
    - [What's done well technically]

    **Concerns**:
    - [Technical issues or debt]

    **Recommendations**:
    - [Specific technical improvements]

    [Same format for Business Value, Risk Management, Team Collaboration, UX, Long-term Vision]

    ### Synthesis

    **Overall Rating**: [Average] ⭐
    **Recommendation**: [✅ Proceed / ⚠️ Proceed with Caution / ❌ Needs Revision]

    **Critical Issues** (must address before implementation):
    1. [Issue from any angle requiring immediate attention]
    2. [Another critical issue]

    **Important Improvements** (should address):
    1. [Improvement that would significantly increase quality]

    **Nice-to-Have Enhancements** (optional):
    1. [Enhancement that would add value but not critical]

    ### Implementation Readiness
    - [ ] Technical architecture is sound
    - [ ] Business value is clear and measurable
    - [ ] Risks are identified and mitigated
    - [ ] Team can execute with available skills/resources
    - [ ] User experience meets quality standards
    - [ ] Long-term maintainability is acceptable

    **Ready for Implementation**: [YES/NO/CONDITIONAL]

    If CONDITIONAL: [What must be addressed first]
    ```

  **Integration with Spec**:
    - ADDRESS all critical issues before proceeding
    - UPDATE specification to incorporate important improvements
    - DOCUMENT nice-to-have enhancements for future consideration
    - ENSURE all 6 readiness criteria are met
</analysis_3_multi_angle_review>

<final_specification_update>
  After completing all three ultra-thinking analyses:

  1. **Consolidate Findings**:
     - Merge stakeholder requirements into spec
     - Add P1 scenario handling to requirements
     - Address critical issues from multi-angle review

  2. **Update Core Sections**:
     - Requirements: Add validated requirements from all three analyses
     - Acceptance Criteria: Include P1 scenario handling criteria
     - Testing Requirements: Add test cases for critical scenarios
     - Security Requirements: Add mitigations for P1 security scenarios
     - Performance Requirements: Add requirements for P1 scale scenarios

  3. **Document Analysis Artifacts**:
     SAVE analysis outputs to spec folder:
     - [spec_folder]/analysis-stakeholder.md
     - [spec_folder]/analysis-scenarios.md
     - [spec_folder]/analysis-multi-angle.md

     REFERENCE in main spec:
     ```markdown
     ## Deep Analysis

     This specification underwent ultra-thinking protocol analysis:
     - [Stakeholder Analysis](./analysis-stakeholder.md)
     - [Scenario Exploration](./analysis-scenarios.md)
     - [Multi-Angle Review](./analysis-multi-angle.md)
     ```

  4. **Verification**:
     - [ ] All P1 scenarios have defined handling approach
     - [ ] All stakeholder perspectives are represented in requirements
     - [ ] All critical issues from multi-angle review are addressed
     - [ ] Implementation readiness criteria are met
     - [ ] Analysis artifacts are saved and referenced
</final_specification_update>

<time_investment_guidelines>
  **Total Time**: 1.5 - 5.5 hours depending on feature complexity

  **Simple Features** (1.5-3 hours):
    - Stakeholder Analysis: 30-60 min
    - Scenario Exploration: 30-60 min
    - Multi-Angle Review: 30-90 min

  **Moderate Features** (2.5-4 hours):
    - Stakeholder Analysis: 60-90 min
    - Scenario Exploration: 60-90 min
    - Multi-Angle Review: 45-90 min

  **Complex Features** (4-5.5 hours):
    - Stakeholder Analysis: 90-120 min
    - Scenario Exploration: 90-120 min
    - Multi-Angle Review: 60-90 min

  The time investment prevents:
    - Production incidents from unhandled scenarios (saves weeks)
    - Rework from missed stakeholder requirements (saves days)
    - Technical debt from rushed decisions (saves months)
</time_investment_guidelines>

<skip_criteria>
  Ultra-thinking MAY be skipped if ALL of the following are true:
    - [ ] Changes are <50 lines in a single file
    - [ ] No new external dependencies or integrations
    - [ ] No changes to authentication, authorization, or data validation
    - [ ] No impact on performance-critical paths
    - [ ] No changes to database schema or data models
    - [ ] No new user-facing features or UI changes

  If ANY criterion is false, ultra-thinking MUST be performed.
</skip_criteria>

<output>
  After completing ultra-thinking protocol:

  1. CONFIRM completion to user:
     ```
     ✅ Ultra-Thinking Protocol Complete

     - Stakeholder Analysis: [RATING] ⭐
     - Scenario Exploration: [P1_COUNT] high-risk scenarios identified
     - Multi-Angle Review: [RATING] ⭐ - [RECOMMENDATION]

     Specification updated with findings. Ready to proceed to date determination.
     ```

  2. PROCEED to Step 6 (Date Determination)
</output>

</step>

<step number="6" subagent="date-checker" name="date_determination">

### Step 6: Date Determination

Use the date-checker subagent to determine the current date in YYYY-MM-DD format for folder naming. The subagent will output today's date which will be used in subsequent steps.

<subagent_output>
  The date-checker subagent will provide the current date in YYYY-MM-DD format at the end of its response. Store this date for use in folder naming in step 7.
</subagent_output>

</step>

<step number="7" subagent="file-creator" name="spec_folder_creation">

### Step 7: Spec Folder Creation

Use the file-creator subagent to create directory: {AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/ using the date from step 6.

Use kebab-case for spec name. Maximum 5 words in name.

<folder_naming>
  <format>YYYY-MM-DD-spec-name</format>
  <date>use stored date from step 6</date>
  <name_constraints>
    - max_words: 5
    - style: kebab-case
    - descriptive: true
  </name_constraints>
</folder_naming>

<example_names>
  - 2025-03-15-password-reset-flow
  - 2025-03-16-user-profile-dashboard
  - 2025-03-17-api-rate-limiting
</example_names>

</step>

<step number="8" subagent="file-creator" name="create_spec_md">

### Step 8: Create spec.md

Use the file-creator subagent to create the file: {AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/spec.md using this template:

<file_template>
  <header>
    # Spec Requirements Document

    > Spec: [SPEC_NAME]
    > Created: [CURRENT_DATE]
  </header>
  <required_sections>
    - Overview
    - User Stories
    - Spec Scope
    - Out of Scope
    - Expected Deliverable
  </required_sections>
</file_template>

<section name="overview">
  <template>
    ## Overview

    [1-2_SENTENCE_GOAL_AND_OBJECTIVE]
  </template>
  <constraints>
    - length: 1-2 sentences
    - content: goal and objective
  </constraints>
  <example>
    Implement a secure password reset functionality that allows users to regain account access through email verification. This feature will reduce support ticket volume and improve user experience by providing self-service account recovery.
  </example>
</section>

<section name="user_stories">
  <template>
    ## User Stories

    ### [STORY_TITLE]

    As a [USER_TYPE], I want to [ACTION], so that [BENEFIT].

    [DETAILED_WORKFLOW_DESCRIPTION]
  </template>
  <constraints>
    - count: 1-3 stories
    - include: workflow and problem solved
    - format: title + story + details
  </constraints>
</section>

<section name="spec_scope">
  <template>
    ## Spec Scope

    1. **[FEATURE_NAME]** - [ONE_SENTENCE_DESCRIPTION]
    2. **[FEATURE_NAME]** - [ONE_SENTENCE_DESCRIPTION]
  </template>
  <constraints>
    - count: 1-5 features
    - format: numbered list
    - description: one sentence each
  </constraints>
</section>

<section name="out_of_scope">
  <template>
    ## Out of Scope

    - [EXCLUDED_FUNCTIONALITY_1]
    - [EXCLUDED_FUNCTIONALITY_2]
  </template>
  <purpose>explicitly exclude functionalities</purpose>
</section>

<section name="expected_deliverable">
  <template>
    ## Expected Deliverable

    1. [TESTABLE_OUTCOME_1]
    2. [TESTABLE_OUTCOME_2]
  </template>
  <constraints>
    - count: 1-3 expectations
    - focus: browser-testable outcomes
  </constraints>
</section>

</step>

<step number="9" subagent="file-creator" name="create_spec_lite_md">

### Step 9: Create spec-lite.md

Use the file-creator subagent to create the file: {AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/spec-lite.md for the purpose of establishing a condensed spec for efficient AI context usage.

<file_template>
  <header>
    # Spec Summary (Lite)
  </header>
</file_template>

<content_structure>
  <spec_summary>
    - source: Step 8 spec.md overview section
    - length: 1-3 sentences
    - content: core goal and objective of the feature
  </spec_summary>
</content_structure>

<content_template>
  [1-3_SENTENCES_SUMMARIZING_SPEC_GOAL_AND_OBJECTIVE]
</content_template>

<example>
  Implement secure password reset via email verification to reduce support tickets and enable self-service account recovery. Users can request a reset link, receive a time-limited token via email, and set a new password following security best practices.
</example>

</step>

<step number="9.5" subagent="file-creator" name="create_ux_ui_specification">

### Step 9.5: Create UX/UI Specification (Conditional - Frontend Features Only)

Use the file-creator subagent to create the file: {AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/ux-ui-spec.md ONLY IF this spec requires frontend/UI implementation.

<decision_tree>
  IF spec_requires_frontend_or_ui:
    CREATE {AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/ux-ui-spec.md
    APPLY @.agent-os/instructions/utilities/ux-ui-specification-checklist.md
  ELSE:
    SKIP this_step
</decision_tree>

<critical_importance>
  ⚠️ **CRITICAL**: UX/UI specifications MUST follow architecture-first approach.

  **The Catastrophic Failure Pattern**:
  - Specifying pixel-perfect components WITHOUT navigation = unusable feature
  - Defining hover states WITHOUT page layouts = implementation chaos
  - Creating beautiful cards WITHOUT routing = users can't access feature

  **Prevention**: This step ENFORCES Phase 1 (Application Architecture) BEFORE any component design.
</critical_importance>

<file_template>
  <header>
    # UX/UI Specification

    This is the UX/UI specification for the spec detailed in @.agent-os/specs/YYYY-MM-DD-spec-name/spec.md

    **IMPORTANT**: This specification follows the architecture-first approach from @.agent-os/instructions/utilities/ux-ui-specification-checklist.md
  </header>
</file_template>

<ux_ui_specification_phases>

  <phase_1_architecture_required_first>
    ## Phase 1: Application Architecture (REQUIRED FIRST)

    ⚠️ **CRITICAL**: Complete this phase BEFORE any component design.

    ### 1.1 Feature Classification

    **Feature Type**: [FULL_STACK | FRONTEND_ONLY | BACKEND_ONLY]

    **Frontend Required**: [YES | NO]
    **Backend Required**: [YES | NO]

    **Justification**: [Explain why frontend and/or backend are needed]

    ### 1.2 Route Structure

    **New Routes Required**:
    ```
    /route-path-1                → [Page Name] - [Purpose]
    /route-path-2                → [Page Name] - [Purpose]
    /route-path-3/:id            → [Page Name] - [Purpose]
    /route-path-4/:id/subpage    → [Page Name] - [Purpose]
    ```

    **Route Integration with Existing Navigation**:
    - How these routes integrate with existing application structure
    - Parent route (if nested under existing pages)
    - Route guards/authentication requirements

    **❌ NEVER**: "Route structure (TBD)" or "Routes (if needed)"
    **✅ ALWAYS**: Explicit list of every route with exact paths

    ### 1.3 Global Layout Integration

    **Layout Strategy**: [NEW_LAYOUT | EXTEND_EXISTING | USE_EXISTING]

    **IF NEW_LAYOUT**:
    ```
    ┌─────────────────────────────────────────────────────────┐
    │ Header: [HEIGHT], [STICKY/FIXED/STATIC], [CONTENTS]    │
    │ [Logo] [Navigation] [User Menu]                         │
    ├──────────────┬──────────────────────────────────────────┤
    │ Sidebar      │ Main Content Area                        │
    │ [WIDTH]      │ [MAX-WIDTH] [PADDING] [SCROLL]           │
    │ [POSITION]   │                                          │
    │              │                                          │
    │ [Nav Items]  │ <Page content renders here>             │
    │              │                                          │
    └──────────────┴──────────────────────────────────────────┘
    ```

    **Layout Components to Create**:
    - `[FILE_PATH]`: [Component Name] - [Purpose]
    - `[FILE_PATH]`: [Component Name] - [Purpose]

    **IF EXTEND_EXISTING**:
    - **Existing layout**: [FILE_PATH to existing layout component]
    - **Modifications needed**: [Specific changes to existing layout]
    - **New components**: [FILE_PATHs to new layout components]

    **IF USE_EXISTING**:
    - **Existing layout**: [FILE_PATH to existing layout component]
    - **No changes needed**: This feature uses existing layout as-is

    **❌ NEVER**: "App Shell (if exists)" or "Layout (to be determined)"
    **✅ ALWAYS**: Explicit layout decision with file paths

    ### 1.4 Navigation Structure

    **Primary Navigation Integration**: [HOW_THIS_FEATURE_APPEARS_IN_NAV]

    **Navigation Component**: [FILE_PATH to nav component]

    **Navigation Items to Add/Modify**:
    - **[Label]**: [Route] - [Icon] - [Position in nav]
    - **[Label]**: [Route] - [Icon] - [Position in nav]

    **Active State Behavior**:
    - Implementation: [ROUTER_HOOK | MANUAL_STATE]
    - Highlighting: [CSS_CLASSES or STYLING_APPROACH]

    **Mobile Navigation**:
    - Pattern: [HAMBURGER_DRAWER | BOTTOM_TABS | COLLAPSIBLE_MENU]
    - Breakpoint: [PIXEL_VALUE]
    - Implementation: [FILE_PATH to mobile nav component]

    **Breadcrumbs** (if applicable):
    - Pattern: [HOME > SECTION > PAGE]
    - Generation: [AUTO_FROM_ROUTES | MANUAL_PER_PAGE]
    - Component: [FILE_PATH]

    **User Entry Points**:
    1. [Entry Point 1]: [How user accesses feature] - [From which page/nav]
    2. [Entry Point 2]: [Alternative access method]

    **❌ NEVER**: "Navigation (if needed)" or "Menu items (TBD)"
    **✅ ALWAYS**: Explicit navigation items with labels, routes, and positioning

    ### 1.5 User Flow Architecture

    **Primary User Flows**:

    #### Flow 1: [FLOW_NAME]
    1. **Starting Point**: [PAGE_OR_STATE] at [ROUTE]
    2. **Trigger**: [USER_ACTION] - Click "[BUTTON_TEXT]" ([COMPONENT_TYPE])
    3. **Navigation**: Navigate to [ROUTE] or [MODAL_OPENS]
    4. **Page Loads**: [COMPONENT_NAME] renders with [DATA_REQUIREMENTS]
    5. **User Interaction**: [WHAT_USER_DOES] - [FORM_FIELDS or SELECTIONS]
    6. **Validation**: [CLIENT_SIDE_VALIDATION_APPROACH]
    7. **Submit**: [WHAT_HAPPENS] - [API_CALL or STATE_UPDATE]
    8. **Success Path**:
       - Notification: [TOAST/ALERT] with "[MESSAGE]"
       - Navigation: [WHERE_USER_GOES_NEXT]
       - UI Update: [WHAT_CHANGES_ON_SCREEN]
    9. **Error Path**:
       - Error Display: [HOW_ERRORS_SHOWN]
       - Form State: [PRESERVED | CLEARED]
       - Recovery: [USER_CAN_RETRY | USER_MUST_START_OVER]

    #### Flow 2: [FLOW_NAME]
    [Repeat structure for each major user flow]

    **❌ NEVER**: "User clicks somewhere and something happens"
    **✅ ALWAYS**: Step-by-step flow with exact components, routes, and states

  </phase_1_architecture_required_first>

  <phase_2_layout_systems_required_second>
    ## Phase 2: Layout Systems & Containers (REQUIRED SECOND)

    ⚠️ **ONLY proceed after Phase 1 is complete**

    ### 2.1 Container Specifications

    **Page Container**:
    ```tsx
    <div className="max-w-[MAX_WIDTH] mx-auto px-[MOBILE] md:px-[TABLET] lg:px-[DESKTOP] py-[MOBILE] md:py-[TABLET] lg:py-[DESKTOP]">
      {/* Page content */}
    </div>
    ```

    | Breakpoint         | Horizontal Padding | Vertical Padding | Max Width | Tailwind Classes                    |
    |--------------------|--------------------|-----------------  |-----------|-------------------------------------|
    | Mobile (<768px)    | [PIXEL_VALUE]      | [PIXEL_VALUE]     | [VALUE]   | px-[X] py-[Y]                       |
    | Tablet (768-1023px)| [PIXEL_VALUE]      | [PIXEL_VALUE]     | [VALUE]   | md:px-[X] md:py-[Y]                 |
    | Desktop (≥1024px)  | [PIXEL_VALUE]      | [PIXEL_VALUE]     | [VALUE]   | lg:px-[X] lg:py-[Y] max-w-[VALUE]   |

    **Section Containers**:
    ```tsx
    <section className="space-y-[MOBILE] md:space-y-[TABLET] lg:space-y-[DESKTOP]">
      {/* Section content */}
    </section>
    ```

    **Component Containers**:
    - **Grid Layout**: `grid grid-cols-[MOBILE] md:grid-cols-[TABLET] lg:grid-cols-[DESKTOP] gap-[VALUE]`
    - **Flex Layout**: `flex flex-col md:flex-row gap-[VALUE] items-[ALIGNMENT]`

    **❌ NEVER**: "Card padding: 20px" (without responsive breakpoints and classes)
    **✅ ALWAYS**: Complete responsive specifications with Tailwind utilities

    ### 2.2 Spacing System Implementation

    **Spacing Scale & Usage Matrix**:

    | Context                        | Desktop | Tablet | Mobile | Tailwind Classes                  | Use Case                           |
    |--------------------------------|---------|--------|--------|-----------------------------------|------------------------------------|
    | Page container horizontal      | [PX]    | [PX]   | [PX]   | px-[X] md:px-[Y] lg:px-[Z]       | Outer page margins                 |
    | Page container vertical        | [PX]    | [PX]   | [PX]   | py-[X] md:py-[Y] lg:py-[Z]       | Top/bottom page spacing            |
    | Section vertical spacing       | [PX]    | [PX]   | [PX]   | space-y-[X] md:space-y-[Y]       | Between major sections             |
    | Subsection vertical spacing    | [PX]    | [PX]   | [PX]   | space-y-[X]                      | Between related groups             |
    | Card padding                   | [PX]    | [PX]   | [PX]   | p-[X] md:p-[Y]                   | Card internal spacing              |
    | Card grid gaps                 | [PX]    | [PX]   | [PX]   | gap-[X] md:gap-[Y]               | Space between cards in grid        |
    | Form element spacing           | [PX]    | [PX]   | [PX]   | space-y-[X]                      | Between form fields                |
    | Button padding horizontal      | [PX]    | [PX]   | [PX]   | px-[X]                           | Button left/right padding          |
    | Button padding vertical        | [PX]    | [PX]   | [PX]   | py-[X]                           | Button top/bottom padding          |

    **Implementation Examples**:
    ```tsx
    // Page container
    <div className="max-w-7xl mx-auto px-4 py-8 md:px-8 md:py-12 lg:px-12 lg:py-16">
      {/* Major sections */}
      <div className="space-y-16">
        <section className="space-y-8">
          {/* Subsection content */}
          <div className="space-y-4">
            {/* Related elements */}
          </div>
        </section>
      </div>
    </div>
    ```

    **❌ NEVER**: "lg: 16px (1rem) - Card padding, vertical spacing"
    **✅ ALWAYS**: Usage matrix showing exact context, breakpoints, and Tailwind classes

    ### 2.3 Typography System Implementation

    **Type Scale & Hierarchy**:

    #### H1 - Page Title
    ```tsx
    <h1 className="text-[SIZE] font-[WEIGHT] leading-[HEIGHT] tracking-[SPACING] text-gray-900 dark:text-gray-50">
      [Example Text]
    </h1>
    ```
    - **Size**: [PIXEL_VALUE] ([REM_VALUE])
    - **Weight**: [FONT_WEIGHT_NUMBER] ([WEIGHT_NAME])
    - **Line Height**: [VALUE]
    - **Letter Spacing**: [VALUE] (if custom)
    - **Use**: Once per page, main page title only
    - **Spacing After**: [PIXEL_VALUE] (`mb-[VALUE]`)

    #### H2 - Section Header
    ```tsx
    <h2 className="text-[SIZE] font-[WEIGHT] leading-[HEIGHT] text-gray-900 dark:text-gray-50">
      [Example Text]
    </h2>
    ```
    - **Size**: [PIXEL_VALUE] ([REM_VALUE])
    - **Weight**: [FONT_WEIGHT_NUMBER] ([WEIGHT_NAME])
    - **Line Height**: [VALUE]
    - **Use**: Major section dividers
    - **Spacing After**: [PIXEL_VALUE] (`mb-[VALUE]`)

    #### H3 - Subsection / Card Title
    ```tsx
    <h3 className="text-[SIZE] font-[WEIGHT] leading-[HEIGHT] text-gray-900 dark:text-gray-50">
      [Example Text]
    </h3>
    ```
    - **Size**: [PIXEL_VALUE] ([REM_VALUE])
    - **Weight**: [FONT_WEIGHT_NUMBER] ([WEIGHT_NAME])
    - **Line Height**: [VALUE]
    - **Use**: Card titles, dialog headers, subsections
    - **Spacing After**: [PIXEL_VALUE] (`mb-[VALUE]`)

    #### Body - Default
    ```tsx
    <p className="text-[SIZE] leading-[HEIGHT] text-gray-700 dark:text-gray-300">
      [Example Text]
    </p>
    ```
    - **Size**: [PIXEL_VALUE] ([REM_VALUE])
    - **Weight**: 400 (normal)
    - **Line Height**: [VALUE] (comfortable reading)
    - **Use**: Primary body text, descriptions

    #### Body - Small (Metadata)
    ```tsx
    <p className="text-[SIZE] leading-[HEIGHT] text-gray-600 dark:text-gray-400">
      [Example Text]
    </p>
    ```
    - **Size**: [PIXEL_VALUE] ([REM_VALUE])
    - **Weight**: 400 (normal)
    - **Line Height**: [VALUE]
    - **Use**: Timestamps, metadata, auxiliary info

    **Visual Hierarchy Rules**:
    1. **Page title (H1)** is largest text on page - immediate focal point
    2. **Section headers (H2)** create clear content blocks - [SPACING_VALUE] spacing before
    3. **Card titles (H3)** stand out from body - minimum [SPACING_VALUE] spacing after
    4. **Body text** uses comfortable reading line-height ([VALUE]) for multi-line content
    5. **Metadata text** is visually de-emphasized via size AND color (gray-600)

    **❌ NEVER**: "Card title: 18px (1.125rem) - font-semibold"
    **✅ ALWAYS**: Complete typography spec with classes, use cases, and hierarchy rules

    ### 2.4 Page Layout Patterns

    **For Each Page in This Feature**:

    #### [PAGE_NAME] Layout ([ROUTE])

    **Layout Pattern**: [Dashboard Grid | Form Centered | List + Detail | Master-Detail | Wizard | Custom]

    **Layout Structure**:
    ```
    ┌─────────────────────────────────────────────────────┐
    │ Page Header ([H1 Title] [Action Buttons])           │
    │ - Title: H1 with mb-[VALUE]                         │
    │ - Controls: Flex row with gap-[VALUE]               │
    ├─────────────────────────────────────────────────────┤
    │ [Layout Pattern Specific Structure]                 │
    │                                                     │
    │ Main Content Area:                                  │
    │ - [GRID/FLEX LAYOUT]: [SPECS]                       │
    │ - [RESPONSIVE BEHAVIOR]                             │
    │                                                     │
    │ Sidebar (if applicable):                            │
    │ - Width: [VALUE]                                    │
    │ - Contents: [FILTERS/METADATA/ACTIONS]             │
    └─────────────────────────────────────────────────────┘
    ```

    **Component Hierarchy**:
    ```
    [PageComponent] (file: [FILE_PATH])
    ├── [PageHeader] (file: [FILE_PATH])
    │   ├── [Breadcrumbs] (if applicable)
    │   ├── [H1 Title]
    │   └── [ActionButtons]
    ├── [MainContent] (layout: [GRID/FLEX])
    │   ├── [PrimaryComponent1] (file: [FILE_PATH])
    │   │   └── [NestedComponent] (file: [FILE_PATH])
    │   └── [PrimaryComponent2] (file: [FILE_PATH])
    └── [Sidebar] (if applicable, file: [FILE_PATH])
        ├── [FilterComponent]
        └── [MetadataComponent]
    ```

    **Responsive Behavior**:
    - **Desktop (≥1024px)**: [LAYOUT_DESCRIPTION with columns, widths]
    - **Tablet (768-1023px)**: [LAYOUT_CHANGES with responsive adjustments]
    - **Mobile (<768px)**: [MOBILE_LAYOUT with stacking, drawers, etc.]

    **Implementation**:
    ```tsx
    <div className="[CONTAINER_CLASSES]">
      {/* Page header */}
      <header className="[HEADER_CLASSES]">
        <h1 className="[H1_CLASSES]">[Page Title]</h1>
        <div className="[ACTIONS_CLASSES]">
          {/* Action buttons */}
        </div>
      </header>

      {/* Main layout */}
      <div className="[LAYOUT_CLASSES: grid/flex with responsive breakpoints]">
        {/* Content sections */}
      </div>
    </div>
    ```

    **❌ NEVER**: "Page uses card layout"
    **✅ ALWAYS**: Complete layout spec with ASCII diagram, hierarchy, responsive behavior, and code

  </phase_2_layout_systems_required_second>

  <phase_3_component_patterns_required_third>
    ## Phase 3: Component Patterns (REQUIRED THIRD)

    ⚠️ **ONLY proceed after Phase 2 is complete**

    ### 3.1 Component Library Strategy

    **Component Library**: [LIBRARY_NAME | Custom Components]

    **IF using component library**:

    **Library Information**:
    - **Name**: [e.g., shadcn/ui, MUI, Ant Design]
    - **Version**: [VERSION_NUMBER]
    - **Installation**: [COMMAND to install]
    - **Documentation**: [URL]

    **Library Components to Use**:

    #### [COMPONENT_NAME_1] (e.g., Button)
    - **Import**: `import { [ComponentName] } from '[LIBRARY_PATH]'`
    - **Purpose**: [What this component does in the feature]
    - **Variants**: [List variants: primary, secondary, destructive, outline, ghost]
    - **Props Used**: [Key props: size, variant, disabled, loading, onClick]
    - **Usage Context**: [Where in feature: form submit, card actions, page header]
    - **Example**:
      ```tsx
      <Button variant="primary" size="md" onClick={handleSubmit}>
        Submit
      </Button>
      ```

    #### [COMPONENT_NAME_2] (e.g., Card)
    - **Import**: `import { [ComponentName], [SubComponents] } from '[LIBRARY_PATH]'`
    - **Purpose**: [What this component does]
    - **Sub-components**: [CardHeader, CardContent, CardFooter]
    - **Props Used**: [Key props]
    - **Styling Approach**: [How to customize: className, sx, theme]
    - **Example**:
      ```tsx
      <Card>
        <CardHeader>
          <CardTitle>[Title]</CardTitle>
        </CardHeader>
        <CardContent>
          [Content]
        </CardContent>
        <CardFooter>
          [Actions]
        </CardFooter>
      </Card>
      ```

    [Continue for ALL library components used: Modal/Dialog, Form components, Input, Select, etc.]

    **Custom Components Built on Library**:
    - **[CUSTOM_COMPONENT_NAME]**: Combines [base library components] for [specific purpose]
      - Built from: [LIBRARY_COMPONENTS_USED]
      - Purpose: [FEATURE_SPECIFIC_USE_CASE]
      - File: [FILE_PATH]
      - Props: [CUSTOM_PROPS]
      - Example: [CODE_EXAMPLE]

    **IF custom components**:

    **Base UI Primitives to Build**:

    #### Button (file: [FILE_PATH])
    - **Purpose**: Reusable button component
    - **Props**:
      - `variant`: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost'
      - `size`: 'sm' | 'md' | 'lg'
      - `disabled`: boolean
      - `loading`: boolean
      - `onClick`: () => void
      - `children`: ReactNode
    - **States**:
      - Default: [STYLES with Tailwind classes]
      - Hover: [HOVER_STYLES]
      - Active: [ACTIVE_STYLES]
      - Disabled: [DISABLED_STYLES]
      - Loading: [LOADING_STYLES with spinner]
    - **Implementation**:
      ```tsx
      export function Button({ variant, size, disabled, loading, onClick, children }: ButtonProps) {
        return (
          <button
            className={cn(
              'base-classes',
              variant === 'primary' && 'primary-classes',
              size === 'md' && 'size-classes',
              disabled && 'disabled-classes'
            )}
            onClick={onClick}
            disabled={disabled || loading}
          >
            {loading && <Spinner className="mr-2" />}
            {children}
          </button>
        )
      }
      ```

    [Continue for Card, Modal/Dialog, Form components: Input, Select, Checkbox, Radio, Textarea]

    **Styling Approach**: [CSS Modules | Tailwind | Styled Components | CSS-in-JS]

    **❌ NEVER**: "Use Button component"
    **✅ ALWAYS**: Specify library/custom, import paths, variants, props, and examples

    ### 3.2 Component Specifications

    **For EACH Component in This Feature**:

    #### [COMPONENT_NAME] (e.g., TemplateCard)

    **Purpose**: [What user problem this solves, why component exists]

    **File**: [FILE_PATH e.g., components/templates/TemplateCard.tsx]

    **Props**:
    ```typescript
    interface [ComponentName]Props {
      prop1: type
      prop2: type
      onAction?: () => void
    }
    ```

    **Structure & Spacing**:
    ```tsx
    <Card className="p-[VALUE] space-y-[VALUE] [OTHER_CLASSES]">
      <CardHeader className="pb-[VALUE] border-b border-gray-[VALUE] space-y-[VALUE]">
        <CardTitle className="[TYPOGRAPHY_CLASSES]">
          [Title]
        </CardTitle>
        <div className="flex items-center gap-[VALUE] text-[SIZE] text-gray-[VALUE]">
          [Metadata badges, tags]
        </div>
      </CardHeader>

      <CardContent className="pt-[VALUE] pb-[VALUE] space-y-[VALUE]">
        <p className="[TYPOGRAPHY_CLASSES] line-clamp-[VALUE]">
          [Description]
        </p>
      </CardContent>

      <CardFooter className="pt-[VALUE] border-t border-gray-[VALUE] flex items-center justify-between">
        <div className="flex gap-[VALUE]">
          [Action buttons]
        </div>
        <p className="text-[SIZE] text-gray-[VALUE]">
          [Timestamp]
        </p>
      </CardFooter>
    </Card>
    ```

    **Spacing Breakdown**:
    - Card padding: [PIXEL_VALUE] all sides (`p-[VALUE]`)
    - Header bottom padding: [PIXEL_VALUE] (`pb-[VALUE]`)
    - Header bottom border: 1px solid gray-[VALUE]
    - Title to metadata gap: [PIXEL_VALUE] (`space-y-[VALUE]`)
    - Content top/bottom padding: [PIXEL_VALUE] (`pt-[VALUE]`, `pb-[VALUE]`)
    - Content elements gap: [PIXEL_VALUE] (`space-y-[VALUE]`)
    - Actions top padding: [PIXEL_VALUE] (`pt-[VALUE]`)
    - Actions top border: 1px solid gray-[VALUE]
    - Action buttons gap: [PIXEL_VALUE] (`gap-[VALUE]`)

    **State Variations**:
    - **Default**: [BASE_CLASSES]
    - **Hover**: `hover:shadow-md hover:-translate-y-0.5 transition-all duration-150`
    - **Active/Selected**: [ACTIVE_CLASSES with border or background change]
    - **Disabled**: `opacity-50 cursor-not-allowed`
    - **Loading**: [SKELETON_OR_SPINNER approach]
    - **Error**: `border-red-500 bg-red-50`
    - **Empty**: [EMPTY_STATE_CONTENT]

    **Responsive Behavior**:
    - **Desktop**: [FULL_SPEC]
    - **Tablet**: [ADJUSTMENTS e.g., reduced padding]
    - **Mobile**: [MOBILE_LAYOUT e.g., stack instead of flex-row]

    **Accessibility**:
    - ARIA labels: [SPECIFIC_LABELS]
    - Keyboard navigation: [TAB_ORDER, ENTER_ACTION]
    - Screen reader: [ANNOUNCEMENTS]
    - Focus states: [FOCUS_RING_CLASSES]

    **Integration Example**:
    ```tsx
    // Used in TemplateLibraryPage
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {templates.map(template => (
        <TemplateCard
          key={template.id}
          title={template.title}
          description={template.description}
          category={template.category}
          tags={template.tags}
          modifiedAt={template.modifiedAt}
          onUse={() => handleUseTemplate(template.id)}
          onEdit={() => handleEditTemplate(template.id)}
        />
      ))}
    </div>
    ```

    **❌ NEVER**: "Card component with padding and title"
    **✅ ALWAYS**: Complete spec with markup, spacing, states, responsive, accessibility, and integration

    [Repeat "Component Specifications" section for EVERY component in the feature]

  </phase_3_component_patterns_required_third>

  <phase_4_interaction_patterns_required_fourth>
    ## Phase 4: Interaction Patterns & Polish (REQUIRED LAST)

    ⚠️ **ONLY proceed after Phase 3 is complete**

    ### 4.1 Interactive States

    **Hover Effects**:
    - **Buttons**: `hover:bg-[COLOR] hover:shadow-md transition-colors duration-150`
    - **Cards**: `hover:shadow-lg hover:-translate-y-1 transition-all duration-200`
    - **Links**: `hover:text-[COLOR] hover:underline transition-colors duration-100`

    **Active States**:
    - **Buttons**: `active:scale-95 transition-transform duration-75`
    - **Cards**: `active:shadow-sm active:translate-y-0 transition-all duration-75`

    **Focus States** (WCAG 2.1 AA compliant):
    - **All interactive elements**: `focus:outline-none focus:ring-2 focus:ring-[COLOR] focus:ring-offset-2`
    - **Keyboard navigation**: Tab order follows visual hierarchy

    **Loading States**:
    - **Buttons**: [SPINNER inside button, button disabled]
    - **Pages**: [SKELETON_SCREENS or FULL_PAGE_SPINNER]
    - **Components**: [SHIMMER_EFFECT or PULSE_ANIMATION]

    **Error States**:
    - **Form fields**: `border-red-500 text-red-900 placeholder-red-300 focus:ring-red-500`
    - **Inline errors**: `text-sm text-red-600 mt-1` below field
    - **Alert banners**: [ALERT_COMPONENT with error styling]

    **Empty States**:
    - **Empty lists**: [ILLUSTRATION, HEADING, DESCRIPTION, CTA_BUTTON]
    - **No search results**: [HELPFUL_MESSAGE, SUGGESTIONS, CLEAR_SEARCH_BUTTON]
    - **First-time user**: [ONBOARDING_PROMPT, TUTORIAL_LINK]

    ### 4.2 Animations & Transitions

    **Page Transitions**:
    - **Route changes**: [FADE_IN, SLIDE, or NO_ANIMATION]
    - **Duration**: [MILLISECONDS]
    - **Easing**: [EASE_IN_OUT, LINEAR, CUBIC_BEZIER]

    **Component Animations**:
    - **Modal open/close**: `transition-opacity duration-300 ease-in-out` + `transition-transform duration-300 ease-in-out`
    - **Dropdown expand**: `transition-all duration-200 ease-out`
    - **Toast notifications**: Slide in from [TOP_RIGHT, BOTTOM_RIGHT], fade out after [SECONDS]

    **Micro-interactions**:
    - **Button press**: Scale down (`active:scale-95`)
    - **Card hover**: Lift up (`hover:-translate-y-1`) + shadow increase
    - **Checkbox check**: [CHECKMARK_ANIMATION duration 150ms]
    - **Loading spinner**: [ROTATION_ANIMATION infinite]

    **Performance Considerations**:
    - **GPU acceleration**: Use `transform` and `opacity` (not `top`, `left`, `width`, `height`)
    - **Will-change**: Apply sparingly: `will-change-transform` only on frequently animated elements
    - **Reduce motion**: Respect `prefers-reduced-motion` media query

    ### 4.3 Form Validation & Feedback

    **Validation Approach**: [CLIENT_SIDE_LIBRARY (e.g., Zod, Yup) | CUSTOM_VALIDATION]

    **Validation Timing**:
    - **On blur**: Validate field when user leaves it
    - **On submit**: Validate entire form before submission
    - **Real-time** (optional): For password strength, username availability

    **Error Display**:
    - **Inline errors**: Below each invalid field
    - **Error summary**: At top of form if multiple errors
    - **Field highlighting**: Red border on invalid fields

    **Success Feedback**:
    - **Toast notification**: "[ACTION] successful" with checkmark icon
    - **Redirect**: Navigate to [SUCCESS_PAGE] after [DELAY]
    - **UI update**: Show newly created/updated item immediately

  </phase_4_interaction_patterns_required_fourth>

</ux_ui_specification_phases>

<critical_validation_gates>

  ### BEFORE proceeding to next step, validate:

  ✅ **Phase 1 Completeness** (CRITICAL):
  - [ ] All routes explicitly defined (no "TBD" or "if needed")
  - [ ] Navigation structure fully specified (no "if exists")
  - [ ] Global layout integration specified (NEW_LAYOUT | EXTEND_EXISTING | USE_EXISTING)
  - [ ] User entry points identified
  - [ ] User flows documented step-by-step

  **IF ANY checkbox unchecked: SPECIFICATION IS INCOMPLETE. FIX BEFORE PROCEEDING.**

  ✅ **Phase 2 Completeness**:
  - [ ] Container specifications with responsive breakpoints
  - [ ] Spacing usage matrix with Tailwind classes
  - [ ] Typography scale with visual hierarchy rules
  - [ ] Page layout patterns with component hierarchy

  ✅ **Phase 3 Completeness**:
  - [ ] Component library strategy defined
  - [ ] All components specified with markup, spacing, states
  - [ ] Accessibility requirements for each component
  - [ ] Integration examples provided

  ✅ **Phase 4 Completeness**:
  - [ ] Interactive states defined (hover, active, focus, loading, error, empty)
  - [ ] Animations and transitions specified
  - [ ] Form validation and feedback patterns

  ✅ **Code Readiness Test** (FINAL):
  **Question**: "Can a developer implement this without asking ANY questions?"
  - [ ] No ambiguous descriptions
  - [ ] No missing architectural decisions
  - [ ] No conditional language for core features ("if exists", "TBD")
  - [ ] Complete code examples with Tailwind classes

  **IF developer would need to ask questions: SPECIFICATION IS INCOMPLETE.**

</critical_validation_gates>

<specification_anti_patterns>

  ### ❌ NEVER DO THESE:

  1. **"If Exists" Language**:
     - ❌ "App Navigation Bar (if exists)"
     - ❌ "Layout (to be determined)"
     - ❌ "Routes (if needed)"

  2. **Pixel Values Without Tailwind Classes**:
     - ❌ "Card padding: 20px"
     - ✅ "Card padding: 20px (`p-5`)"

  3. **Missing Responsive Breakpoints**:
     - ❌ "Container width: 1200px"
     - ✅ "Container: mobile 100%, tablet 768px, desktop 1200px (`max-w-7xl`)"

  4. **Vague Component Descriptions**:
     - ❌ "Use card component"
     - ✅ "[Full component spec with markup, spacing, states, accessibility]"

  5. **Specifying Polish Before Foundation**:
     - ❌ Day 1: Card hover animations, Day 8: Realize no navigation
     - ✅ Day 1: Architecture & routes, Day 8: Animations

</specification_anti_patterns>

<success_metrics>

  ### Specification Quality Indicators:
  - ✅ Zero clarification questions during implementation
  - ✅ All architectural decisions explicitly documented
  - ✅ Complete code examples for all patterns
  - ✅ Usage matrices for all design tokens
  - ✅ Passed Code Readiness Test

  ### Failed Specification Indicators:
  - ❌ Developer asks "How should I..." questions
  - ❌ Phrases like "if exists", "TBD", "optional" for core features
  - ❌ Missing navigation or routing specifications
  - ❌ Pixel values without Tailwind class equivalents
  - ❌ Ambiguous layout or spacing descriptions

</success_metrics>

</step>

<step number="10" subagent="file-creator" name="create_technical_spec">

### Step 10: Create Enhanced Technical Specification

Use the file-creator subagent to create the file: {AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/technical-spec.md using this comprehensive template:

<file_template>
  <header>
    # Technical Specification

    This is the technical specification for the spec detailed in @.agent-os/specs/YYYY-MM-DD-spec-name/spec.md
  </header>
</file_template>

<enhanced_spec_sections>
  <implementation_architecture>
    - component structure breakdown with specific implementation details
    - data flow specification with system interaction mapping
    - state management requirements with specific implementation patterns
    - error handling strategy with specific error scenarios and responses
  </implementation_architecture>
  <integration_points>
    - existing code dependencies identification and analysis
    - API contracts specification with exact signatures and data structures
    - database interactions mapping with specific queries and operations
    - external services integration with detailed requirements and protocols
  </integration_points>
  <implementation_patterns>
    - design patterns specification with specific pattern usage guidance
    - code organization guidelines with file structure and module organization
    - naming conventions with specific naming patterns for feature components
    - coding standards reference with relevant best-practices.md sections
  </implementation_patterns>
  <performance_and_security>
    - performance criteria with specific metrics and benchmarks
    - security requirements with authentication, authorization, and data protection
    - quality validation requirements with specific validation criteria
  </performance_and_security>
  <technical_requirements_legacy>
    - maintain existing technical requirements section for backward compatibility
    - external dependencies (conditional) for new libraries/packages
  </technical_requirements_legacy>
</enhanced_spec_sections>

<comprehensive_template>
  ## Feature Classification

  **Feature Type**: [BACKEND_ONLY | FRONTEND_ONLY | FULL_STACK]

  **Frontend Required**: [YES | NO]
  **Backend Required**: [YES | NO]

  **Justification**: [Explain why frontend and/or backend are needed]

  ---

  ## Frontend Implementation (if applicable)

  ### UI Components

  #### **[COMPONENT_NAME_1]**
  - **Type**: [Page | Form | Modal | Card | List | etc.]
  - **Purpose**: [What user problem does this solve]
  - **User Interactions**: [Click, submit, select, etc.]
  - **State Management**: [Local state | Global store | API data]
  - **Routing**: [URL path if applicable]

  #### **[COMPONENT_NAME_2]**
  - **Type**: [Component type]
  - **Purpose**: [User-facing purpose]
  - **Props**: [Expected props]
  - **Events**: [Emitted events]

  ### Frontend State Management

  **State Management Pattern**: [Context API | Pinia | Zustand | Redux]

  **State Stores Required**:
  - **[STORE_NAME]**: [What data it manages]
    - State shape: [TypeScript interface or JSON structure]
    - Actions: [List of actions/mutations]
    - Computed/Selectors: [Derived state]

  ### Frontend Routing

  **Routes Required**:
  - **[ROUTE_PATH]**: [Component] - [Purpose]
  - **[ROUTE_PATH]**: [Component] - [Purpose]

  **Route Guards**: [Authentication, authorization requirements]

  ### User Interface Specifications

  **Design Requirements**:
  - **Responsive Breakpoints**: [mobile, tablet, desktop requirements]
  - **Accessibility**: [WCAG 2.1 AA compliance requirements]
  - **Loading States**: [How to show async operations]
  - **Error States**: [How to display errors to users]
  - **Empty States**: [What to show when no data]

  **Form Validations** (if applicable):
  - **[FIELD_NAME]**: [Validation rules]
  - **[FIELD_NAME]**: [Validation rules]

  ### Component Architecture

  **UI Component Strategy**: {DETECTED_FROM_TECH_STACK}

  {IF component_library_specified_in_tech_stack}
    **Component Library**: {LIBRARY_NAME} ({LIBRARY_VERSION})

    **Library Components to Use**:
    - **{COMPONENT_NAME_1}** (`{IMPORT_PATH}`): {PURPOSE}
      - Usage: {SPECIFIC_USE_CASES}
      - Variants: {LIST_VARIANTS}
      - Props: {KEY_PROPS}

    - **{COMPONENT_NAME_2}** (`{IMPORT_PATH}`): {PURPOSE}
      - Usage: {SPECIFIC_USE_CASES}
      - Sub-components: {LIST_SUB_COMPONENTS}

    [List all library components needed for this feature]

    **Custom Components** (built on library):
    - **{CUSTOM_COMPONENT_NAME}**: Combines {base components} for {specific purpose}
      - Built from: {LIBRARY_COMPONENTS_USED}
      - Purpose: {FEATURE_SPECIFIC_USE_CASE}
      - Props: {CUSTOM_PROPS}

  {ELSE}
    **Component Library**: None (Custom components)

    **Base UI Primitives to Build**:
    - **Button**: Reusable button component
      - Props: variant ('primary' | 'secondary' | 'destructive'), size, disabled, loading, onClick
      - Styling: {CSS_APPROACH_FROM_TECH_STACK}
      - States: default, hover, active, disabled, loading

    - **Card**: Container component for content grouping
      - Props: title, children, actions, footer
      - Styling: {CSS_APPROACH_FROM_TECH_STACK}

    - **Modal/Dialog**: Overlay dialog component
      - Props: isOpen, onClose, title, children
      - Implementation: Portal pattern with backdrop

    - **Form Components**: Input, Select, Checkbox, Radio, Textarea
      - Validation: {VALIDATION_LIBRARY_OR_CUSTOM}
      - Error handling: {ERROR_DISPLAY_APPROACH}

    **Custom Complex Components**:
    - **{COMPONENT_NAME}**: {DETAILED_DESCRIPTION}
      - Built from: {PRIMITIVES_USED}
      - Purpose: {SPECIFIC_USE_CASE}
  {ENDIF}

  ### Page Layout Architecture

  **Layout Approach**: {DETECTED_FROM_TECH_STACK}

  **Global Layout Structure**:
  ```
  ┌─────────────────────────────────────┐
  │  Header (h-{HEIGHT})                 │
  │  - {HEADER_CONTENTS}                 │
  ├──────┬──────────────────────────────┤
  │      │                              │
  │{NAV} │  Main Content Area           │
  │{BAR} │  {MAIN_LAYOUT_DESCRIPTION}   │
  │      │                              │
  └──────┴──────────────────────────────┘
  ```

  **Layout Implementation**:
  {IF component_library_has_layout_system}
    - Using: {LIBRARY_LAYOUT_COMPONENTS}
    - Grid system: {LIBRARY_GRID_CONFIGURATION}
    - Breakpoints: {LIBRARY_RESPONSIVE_BREAKPOINTS}
  {ELSE}
    - Using: CSS Grid for page structure, Flexbox for components
    - Grid configuration: {COLUMNS, GAP, RESPONSIVE_BEHAVIOR}
    - Breakpoints: {from tech-stack.md or 640px, 1024px defaults}
  {ENDIF}

  **Page-Specific Layouts**:

  #### {PAGE_NAME} Layout
  - **Layout Pattern**: [Dashboard Grid | Form Centered | List + Detail | Master-Detail | Wizard]
  - **Structure**:
    ```
    {ASCII_OR_DESCRIPTION_OF_LAYOUT}
    - Header area: {BREADCRUMBS, PAGE_TITLE, ACTION_BUTTONS}
    - Main content: {PRIMARY_CONTENT_SECTIONS}
    - Sidebar: {FILTERS, METADATA, ACTIONS} (if applicable)
    ```
  - **Responsive Behavior**:
    - Desktop (≥1024px): {3-column grid, full sidebar visible}
    - Tablet (640-1024px): {2-column grid, collapsible sidebar}
    - Mobile (<640px): {Single column stack, drawer for sidebar}

  **Component Hierarchy** (page structure, not styling):
  ```
  {PageComponent}
  ├── {HeaderComponent}
  │   ├── {BreadcrumbsComponent}
  │   ├── {PageTitleComponent}
  │   └── {ActionButtonsComponent}
  ├── {MainContentContainer}
  │   ├── {PrimaryComponent1}
  │   │   └── {NestedComponent}
  │   └── {PrimaryComponent2}
  └── {SidebarComponent} (conditional)
      ├── {FilterComponent}
      └── {MetadataComponent}
  ```

  ### Navigation Architecture

  **Navigation Pattern**: {DETECTED_FROM_TECH_STACK or default to Hybrid}

  **Navigation Structure**:
  ```
  {Primary Navigation Type}
  ├── {Route1} ({PATH})
  ├── {Route2} ({PATH})
  │   ├── {SubRoute1} ({SUB_PATH})
  │   └── {SubRoute2} ({SUB_PATH})
  ├── {Route3} ({PATH})
  └── {UserMenu} (dropdown)
      ├── Profile
      ├── Settings
      └── Logout
  ```

  **Navigation Implementation**:
  {IF component_library_has_nav_components}
    - **Primary Nav**: {LIBRARY_NAV_COMPONENT}
    - **Mobile Menu**: {LIBRARY_MOBILE_MENU_COMPONENT}
    - **Breadcrumbs**: {LIBRARY_BREADCRUMB_COMPONENT}
    - **User Menu**: {LIBRARY_DROPDOWN_COMPONENT}
  {ELSE}
    - **Primary Nav**: Custom {NavSidebar | NavBar} component
      - Structure: {DESCRIPTION}
      - Styling: {CSS_APPROACH}
      - Mobile: {DRAWER_OR_OVERLAY_PATTERN}
    - **Breadcrumbs**: Custom breadcrumb component
      - Generation: {AUTO_FROM_ROUTES | MANUAL}
    - **User Menu**: Custom dropdown component
      - Trigger: {AVATAR_CLICK | USERNAME_CLICK}
  {ENDIF}

  **Navigation Components**:

  {IF sidebar_navigation}
    - **{MainNavComponent}**: Sidebar navigation
      - Position: {fixed-left | sticky}
      - Width: {240px desktop, full-width mobile overlay}
      - Active state: {HIGHLIGHT_APPROACH}
      - Collapsible: {YES_OR_NO}
      - Mobile behavior: {OVERLAY_DRAWER_WITH_BACKDROP}
  {ENDIF}

  {IF top_bar_navigation}
    - **{TopNavComponent}**: Horizontal navigation bar
      - Layout: {FLEX_LAYOUT_DESCRIPTION}
      - Sticky: {YES_OR_NO}
      - Mobile: {COLLAPSE_TO_HAMBURGER | STACK}
  {ENDIF}

  - **{BreadcrumbsComponent}**: Shown on {all pages | specific pages}
    - Pattern: {Home > Section > Page}
    - Implementation: {LIBRARY_OR_CUSTOM}

  - **{UserMenuComponent}**: User account dropdown
    - Location: {top-right corner}
    - Trigger: {INTERACTION_TYPE}
    - Items: {LIST_MENU_ITEMS}

  **Navigation State Management**:
  - **Active Route Tracking**: {ROUTER_HOOK | MANUAL_STATE}
  - **Mobile Menu State**: {LOCAL_COMPONENT_STATE | GLOBAL_STATE_STORE}
  - **Breadcrumb Data**: {AUTO_GENERATED_FROM_ROUTES | MANUAL_PER_PAGE}

  ### User Flow & Interaction Patterns

  **Primary User Flows**:

  #### Flow {N}: {FLOW_NAME}
  1. **Starting Point**: {PAGE_OR_STATE}
  2. **Trigger**: {USER_ACTION} - Click "{BUTTON_TEXT}" ({COMPONENT_TYPE from library or custom})
  3. **Action**: {WHAT_HAPPENS}
     - {IF navigation}: Navigate to {ROUTE}
     - {IF modal}: Open {MODAL_COMPONENT}
     - {IF state change}: Update {STATE_DESCRIPTION}
  4. **Page/Component Loads**: {COMPONENT_NAME} renders
     - Uses {FORM/DISPLAY_COMPONENTS}
     - Validation: {VALIDATION_APPROACH}
     - Loading state: {LOADING_INDICATOR_APPROACH}
  5. **User Interaction**: {WHAT_USER_DOES}
     - Real-time feedback: {VALIDATION_ERRORS, SUGGESTIONS, ETC}
     - Error states: {HOW_ERRORS_DISPLAYED}
  6. **Submit/Complete**: {FINAL_USER_ACTION}
     - Loading indicator: {BUTTON_SPINNER, OVERLAY, ETC}
     - API call: {METHOD} {ENDPOINT}
  7. **Success Path**:
     - Notification: {TOAST_ALERT_INLINE from library or custom}
     - Navigation: {WHERE_USER_GOES}
     - UI update: {WHAT_CHANGES}
  8. **Error Path**:
     - Error display: {COMPONENT_AND_LOCATION}
     - Form state: {PRESERVED_OR_CLEARED}
     - Recovery action: {WHAT_USER_CAN_DO}

  **Component Interaction Patterns**:

  - **{PATTERN_NAME}** (e.g., Master-Detail, Modal Workflow, etc.):
    - {COMPONENT_A} (using {LIBRARY_COMPONENT or custom}) →
    - User action: {CLICK, SELECT, ETC} →
    - {COMPONENT_B} {ACTION: displays, updates, navigates}
    - State management: {HOW_COMPONENTS_COMMUNICATE}
    - Data flow: {COMPONENT_A → STATE → COMPONENT_B}

  **Form Submission Pattern** (standardized across all forms):
    1. User fills form ({FORM_IMPLEMENTATION: library components or custom})
    2. Client-side validation: {VALIDATION_LIBRARY and APPROACH}
    3. Submit button: {LOADING_STATE_APPROACH}
    4. API call: {METHOD} {ENDPOINT}
    5. Success: {NOTIFICATION} + {NAVIGATION_OR_UPDATE}
    6. Error: {ERROR_DISPLAY} + {FORM_STATE_HANDLING}

  ### Component Integration Map

  **How Components Work Together**:

  #### {FEATURE_NAME} Integration Flow
  ```
  User Action: {INITIAL_ACTION}
  ↓
  {PAGE_COMPONENT} {WHAT_IT_DOES}
  ↓
  Data flows to child components:
    ├→ {CHILD_COMPONENT_1} (receives {DATA_DESCRIPTION})
    ├→ {CHILD_COMPONENT_2} (receives {DATA_DESCRIPTION})
    └→ {CHILD_COMPONENT_3} (receives {DATA_DESCRIPTION})
  ↓
  User interacts: {INTERACTION_DESCRIPTION}
  ↓
  {RESULTING_ACTION}
  ```

  #### Component Communication Patterns

  **Page → Container → Presentational Pattern**:
  ```
  {PageComponent} (manages routing, fetches data)
    ↓ passes data props
  {ContainerComponent} (manages local state, handles events)
    ↓ passes data + event handlers
  {PresentationalComponent} (displays data only, emits events)
    ↑ emits user interaction events
  {ContainerComponent} (handles events, updates state or calls API)
    ↑ updates page state if needed
  {PageComponent}
  ```

  **State Flow Between Components**:
  - **Global State** ({STATE_MANAGEMENT_SOLUTION}):
    - Auth state, user preferences, theme
    - Accessed by: {HOW_COMPONENTS_ACCESS}

  - **Shared Component State** (props drilling or context):
    - {PARENT_COMPONENT} manages state
    - Passes to: {LIST_CHILD_COMPONENTS}

  - **API Data Flow**:
    - Fetched in: {WHERE_DATA_FETCHED}
    - Cached with: {CACHING_STRATEGY}
    - Shared via: {STATE_SHARING_METHOD}

  ---

  ## Backend Implementation (if applicable)

  ### API Endpoints

  #### **[METHOD] [ENDPOINT_PATH]**

  **Purpose**: [What this endpoint does]

  **Authentication**: [Required | Public]
  **Authorization**: [Role requirements]

  **Request**:
  ```typescript
  interface RequestBody {
    field1: string
    field2: number
  }

  interface QueryParams {
    param1?: string
  }
  ```

  **Response**:
  ```typescript
  interface SuccessResponse {
    success: true
    data: {
      // Response shape
    }
  }

  interface ErrorResponse {
    success: false
    error: {
      code: string
      message: string
    }
  }
  ```

  **Status Codes**:
  - 200: Success
  - 400: Validation error
  - 401: Unauthorized
  - 403: Forbidden
  - 500: Server error

  ### Business Logic

  **Core Business Rules**:
  1. [Business rule 1]
  2. [Business rule 2]

  **Validation Requirements**:
  - **Server-side**: [What must be validated on server]
  - **Data Integrity**: [Uniqueness, referential integrity]
  - **Business Constraints**: [Domain-specific rules]

  **Service Layer Architecture**:
  - **[SERVICE_NAME]**: [Responsibility]
    - Methods: [List of methods]
    - Dependencies: [What it depends on]

  ### Database Schema

  **Tables/Collections Required**:

  #### **[TABLE_NAME]**
  ```sql
  CREATE TABLE table_name (
    id UUID PRIMARY KEY,
    field1 VARCHAR(255) NOT NULL,
    field2 INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  CREATE INDEX idx_field1 ON table_name(field1);
  ```

  **Relationships**:
  - [Relationship description]

  **Migrations**:
  - [What data migrations are needed]

  ---

  ## Frontend-Backend Integration (if full-stack)

  ### API Contract

  **Contract Owner**: Backend provides, Frontend consumes

  **Type Sharing Strategy**:
  - [Shared TypeScript types package]
  - [OpenAPI/Swagger code generation]
  - [Manual type definitions]

  **Data Flow**:
  1. User action in Frontend →
  2. API call to Backend →
  3. Backend processes and responds →
  4. Frontend updates UI

  ### Integration Points

  **Frontend Calls Backend For**:
  - [Specific user action] → [Specific API endpoint]
  - [Specific user action] → [Specific API endpoint]

  **Error Handling Strategy**:
  - **Network Errors**: [How frontend handles network failures]
  - **Validation Errors**: [How backend errors are displayed]
  - **Authentication Errors**: [Redirect to login, token refresh, etc.]

  ### Testing Strategy

  **Frontend Tests**:
  - Unit tests for components
  - Integration tests for state management
  - Mock backend API responses

  **Backend Tests**:
  - Unit tests for business logic
  - Integration tests for API endpoints
  - Database integration tests

  **E2E Tests**:
  - Full user workflows from UI to database and back
  - Critical path scenarios
  - Error handling scenarios

  ---

  ## Implementation Architecture

  ### Component Structure

  #### **[PRIMARY_COMPONENT_NAME]**

  - **Responsibilities**: [COMPONENT_RESPONSIBILITIES]
  - **Implementation approach**: [IMPLEMENTATION_APPROACH]
  - **Dependencies**: [COMPONENT_DEPENDENCIES]
  - **Interface contracts**: [INTERFACE_CONTRACTS]

  #### **[SECONDARY_COMPONENT_NAME]**

  - **Responsibilities**: [COMPONENT_RESPONSIBILITIES]
  - **Implementation approach**: [IMPLEMENTATION_APPROACH]
  - **Dependencies**: [COMPONENT_DEPENDENCIES]
  - **Interface contracts**: [INTERFACE_CONTRACTS]

  ### Data Flow

  1. **[DATA_FLOW_STEP_1]**: [STEP_1_DETAILS] →
  2. **[DATA_FLOW_STEP_2]**: [STEP_2_DETAILS] →
  3. **[DATA_FLOW_STEP_3]**: [STEP_3_DETAILS]

  **Flow Details**:
  - **[DATA_FLOW_STEP_1]**: [DETAILED_STEP_1_SPECIFICATION]
  - **[DATA_FLOW_STEP_2]**: [DETAILED_STEP_2_SPECIFICATION]
  - **[DATA_FLOW_STEP_3]**: [DETAILED_STEP_3_SPECIFICATION]

  ### State Management

  **State Management Pattern**: [STATE_MANAGEMENT_PATTERN]
  **Implementation Details**: [STATE_MANAGEMENT_IMPLEMENTATION]

  **State Stores**:
  - **[STATE_STORE_1]**: [STORE_1_STRUCTURE]
  - **[STATE_STORE_2]**: [STORE_2_STRUCTURE]

  ### Error Handling

  **Error Handling Strategy**: [ERROR_HANDLING_STRATEGY]

  **Error Scenarios**:
  - **[ERROR_SCENARIO_1]**: [ERROR_1_HANDLING_STRATEGY]
  - **[ERROR_SCENARIO_2]**: [ERROR_2_HANDLING_STRATEGY]
  - **[ERROR_SCENARIO_3]**: [ERROR_3_HANDLING_STRATEGY]

  **Error Response Format**:
  ```json
  {
    "success": false,
    "error": {
      "code": "[ERROR_CODE]",
      "message": "[USER_FRIENDLY_MESSAGE]",
      "details": "[TECHNICAL_DETAILS]",
      "timestamp": "[ISO_TIMESTAMP]"
    }
  }
  ```

  ## Integration Points

  ### Existing Code Dependencies

  #### **[EXISTING_DEPENDENCY_1] Integration**

  - **Purpose**: [INTEGRATION_PURPOSE]
  - **Interface requirements**: [INTERFACE_REQUIREMENTS]
  - **Data exchange**: [DATA_EXCHANGE_DETAILS]
  - **Error handling**: [ERROR_HANDLING_APPROACH]

  #### **[EXISTING_DEPENDENCY_2] Integration**

  - **Purpose**: [INTEGRATION_PURPOSE]
  - **Interface requirements**: [INTERFACE_REQUIREMENTS]
  - **Data exchange**: [DATA_EXCHANGE_DETAILS]
  - **Error handling**: [ERROR_HANDLING_APPROACH]

  ### API Contracts

  #### **[HTTP_METHOD] [API_ENDPOINT]**

  **Purpose**: [API_PURPOSE]

  **Request Structure**:
  ```json
  {
    "[REQUEST_FIELD_1]": "[REQUEST_TYPE_1]",
    "[REQUEST_FIELD_2]": "[REQUEST_TYPE_2]"
  }
  ```

  **Response Structure**:
  ```json
  {
    "[RESPONSE_FIELD_1]": "[RESPONSE_TYPE_1]",
    "[RESPONSE_FIELD_2]": "[RESPONSE_TYPE_2]"
  }
  ```

  **Error Responses**: [ERROR_RESPONSE_DETAILS]

  ### Database Interactions

  #### **[DATABASE_TABLE] Table**

  **Operations**: [DATABASE_OPERATIONS]

  **Queries**:
  - **[QUERY_NAME_1]**: [QUERY_1_IMPLEMENTATION]
  - **[QUERY_NAME_2]**: [QUERY_2_IMPLEMENTATION]

  **Indexes**: [TABLE_INDEXES]
  **Constraints**: [TABLE_CONSTRAINTS]

  ### External Services Integration

  #### **[EXTERNAL_SERVICE] Integration**

  **Protocol**: [SERVICE_PROTOCOL]
  **Authentication**: [AUTHENTICATION_METHOD]

  **Endpoints**:
  - **[ENDPOINT_1]**: [ENDPOINT_1_USAGE]
  - **[ENDPOINT_2]**: [ENDPOINT_2_USAGE]

  **Rate Limiting**: [RATE_LIMITS]
  **Error Handling**: [SERVICE_ERROR_HANDLING]
  **Timeout Configuration**: [TIMEOUT_SETTINGS]

  ## Implementation Patterns

  ### Design Patterns

  **Primary Patterns**:
  - **[PRIMARY_DESIGN_PATTERN]**: [PATTERN_USAGE_GUIDANCE]
  - **[SECONDARY_DESIGN_PATTERN]**: [PATTERN_IMPLEMENTATION_DETAILS]

  **Pattern Selection Rationale**: [DESIGN_PATTERN_JUSTIFICATION]

  ### Code Organization

  ```
  [PROJECT_ROOT]/
  ├── src/
  │   ├── components/
  │   │   └── [FEATURE_COMPONENTS]/
  │   ├── services/
  │   │   └── [FEATURE_SERVICES]/
  │   ├── utils/
  │   │   └── [FEATURE_UTILITIES]/
  │   ├── types/
  │   │   └── [FEATURE_TYPES]/
  │   └── tests/
  │       └── [FEATURE_TESTS]/
  └── docs/
      └── [FEATURE_DOCUMENTATION]/
  ```

  **File Organization Guidelines**:
  - **Component files**: [COMPONENT_FILE_STRUCTURE]
  - **Service files**: [SERVICE_FILE_STRUCTURE]
  - **Utility files**: [UTILITY_FILE_STRUCTURE]
  - **Test files**: [TEST_FILE_STRUCTURE]

  ### Naming Conventions

  **Components**: [COMPONENT_NAMING_PATTERN]
  **Services**: [SERVICE_NAMING_PATTERN]
  **Utilities**: [UTILITY_NAMING_PATTERN]
  **Types/Interfaces**: [TYPE_NAMING_PATTERN]
  **Constants**: [CONSTANT_NAMING_PATTERN]

  **Variable Naming**:
  - **Functions**: [FUNCTION_NAMING_CONVENTION]
  - **Variables**: [VARIABLE_NAMING_CONVENTION]
  - **Class methods**: [METHOD_NAMING_CONVENTION]

  ### Coding Standards

  **Code Style Reference**: Follow guidelines from @.agent-os/standards/best-practices.md

  **Key Standards**:
  - **Indentation**: 2 spaces (never tabs)
  - **Line length**: Maximum 100 characters
  - **Comments**: Explain "why" not "what"
  - **Error handling**: Always include proper error handling
  - **Type safety**: Use TypeScript for type safety where applicable

  **Quality Requirements**:
  - **Test coverage**: Minimum 80% coverage for new code
  - **Documentation**: All public APIs must be documented
  - **Performance**: [PERFORMANCE_STANDARDS]
  - **Security**: [SECURITY_STANDARDS]

  ## Performance Criteria

  ### Response Time Requirements

  **Target Response Time**: [TARGET_RESPONSE_TIME]
  **Measurement Points**: [PERFORMANCE_MEASUREMENT_POINTS]
  **Optimization Strategies**: [OPTIMIZATION_STRATEGIES]

  ### Throughput Requirements

  **Target Throughput**: [TARGET_THROUGHPUT]
  **Load Testing Scenarios**: [LOAD_TESTING_SCENARIOS]
  **Scalability Requirements**: [SCALABILITY_REQUIREMENTS]

  ### Concurrency Requirements

  **Concurrent Users**: [CONCURRENT_USER_LIMIT]
  **Resource Management**: [RESOURCE_MANAGEMENT_STRATEGY]
  **Bottleneck Prevention**: [BOTTLENECK_PREVENTION_MEASURES]

  ## Security Requirements

  ### Authentication Requirements

  **Authentication Method**: [AUTHENTICATION_METHOD]
  **Token Management**: [TOKEN_MANAGEMENT_STRATEGY]
  **Session Handling**: [SESSION_HANDLING_APPROACH]

  ### Authorization Requirements

  **Authorization Model**: [AUTHORIZATION_MODEL]
  **Permission Validation**: [PERMISSION_VALIDATION_STRATEGY]
  **Access Control**: [ACCESS_CONTROL_IMPLEMENTATION]

  ### Data Protection

  **Encryption Standard**: [ENCRYPTION_STANDARD]
  **Data at Rest**: [DATA_AT_REST_PROTECTION]
  **Data in Transit**: [DATA_IN_TRANSIT_PROTECTION]
  **Sensitive Data Handling**: [SENSITIVE_DATA_HANDLING]

  ### Input Validation

  **Validation Approach**: [INPUT_VALIDATION_APPROACH]
  **Sanitization Rules**: [SANITIZATION_RULES]
  **Injection Prevention**: [INJECTION_PREVENTION_MEASURES]

  ## Quality Validation Requirements

  ### Technical Depth Validation

  **Implementation Readiness**: Each specification section must contain sufficient technical detail for immediate implementation
  **Technical Accuracy**: All technical specifications must be validated for accuracy and feasibility
  **Completeness Check**: All required implementation details must be present and well-defined

  ### Integration Validation

  **Compatibility Assessment**: Verify compatibility with existing codebase and architecture
  **Dependency Validation**: Ensure all dependencies are identified and integration points are defined
  **API Contract Validation**: Validate all API contracts for consistency and completeness

  ### Performance Validation

  **Performance Benchmarks**: All performance criteria must be measurable and achievable
  **Resource Requirements**: Validate resource requirements and optimization strategies
  **Scalability Assessment**: Ensure scalability requirements are realistic and well-defined

  ### Security Validation

  **Security Standards Compliance**: Verify compliance with established security standards
  **Vulnerability Assessment**: Identify and address potential security vulnerabilities
  **Authentication/Authorization Validation**: Ensure secure authentication and authorization implementation

  ## Technical Requirements

  - [SPECIFIC_TECHNICAL_REQUIREMENT_1]
  - [SPECIFIC_TECHNICAL_REQUIREMENT_2]
  - [SPECIFIC_TECHNICAL_REQUIREMENT_3]

  ## External Dependencies (Conditional)

  [ONLY_IF_NEW_DEPENDENCIES_NEEDED]
  - **[LIBRARY_NAME]** - [PURPOSE]
  - **Justification:** [REASON_FOR_INCLUSION]
  - **Version Requirements:** [VERSION_SPECIFICATIONS]
</comprehensive_template>

<enhanced_conditional_logic>
  ALWAYS_INCLUDE:
    - Implementation Architecture section
    - Integration Points section
    - Implementation Patterns section
    - Performance Criteria section
    - Security Requirements section
    - Quality Validation Requirements section
    - Technical Requirements section (for backward compatibility)

  CONDITIONAL:
    IF spec_requires_new_external_dependencies:
      INCLUDE "External Dependencies" section
    ELSE:
      OMIT "External Dependencies" section entirely
</enhanced_conditional_logic>

<implementation_readiness_criteria>
  <technical_depth>
    - Each component must have specific implementation details
    - Data flow must include exact system interaction mapping
    - State management must specify concrete implementation patterns
    - Error handling must define specific scenarios and responses
  </technical_depth>
  <integration_specificity>
    - API contracts must include exact request/response structures
    - Database interactions must specify actual queries and operations
    - External service integrations must detail protocols and authentication
    - Existing code dependencies must map to specific interfaces
  </integration_specificity>
  <quality_assurance>
    - All sections must be populated with actionable technical detail
    - Implementation patterns must provide specific coding guidance
    - Performance criteria must be measurable and achievable
    - Security requirements must be comprehensive and specific
  </quality_assurance>
</implementation_readiness_criteria>

</step>

<step number="10.1" subagent="file-creator" name="create_implementation_guide">

### Step 10.1: Create Implementation Guide

Use the file-creator subagent to create the file: {AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/implementation-guide.md using the implementation-guide-template.md from @.agent-os/templates/spec-templates/

<file_template>
  <source>@.agent-os/templates/spec-templates/implementation-guide-template.md</source>
  <destination>{AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/implementation-guide.md</destination>
  <variable_substitution>
    [SPEC_NAME] → spec name from Step 7
    [SPEC_DATE] → date from Step 6
    [SPEC_FOLDER] → folder name from Step 7
  </variable_substitution>
</file_template>

<implementation_guide_content>
  <development_approach>
    - methodology: agile, waterfall, or hybrid approach
    - development workflow: branching strategy, code review process
    - team coordination: roles, responsibilities, communication
  </development_approach>
  <architecture_overview>
    - high-level architecture diagram
    - component relationships and dependencies
    - data flow and interaction patterns
  </architecture_overview>
  <implementation_strategy>
    - phased implementation plan
    - milestone definitions and success criteria
    - risk mitigation strategies
  </implementation_strategy>
  <development_workflow>
    - setup and environment configuration
    - coding standards and conventions
    - testing and validation procedures
  </development_workflow>
  <quality_assurance>
    - code review guidelines
    - testing requirements
    - documentation standards
  </quality_assurance>
</implementation_guide_content>

<template_usage>
  ACTION: Use file-creator subagent with implementation-guide-template.md
  PROCESS: Substitute variables with actual spec data
  POPULATE: Fill template sections with specific implementation details
  VALIDATE: Ensure all sections contain actionable guidance
</template_usage>

</step>

<step number="10.2" subagent="file-creator" name="create_testing_strategy">

### Step 10.2: Create Testing Strategy

Use the file-creator subagent to create the file: {AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/testing-strategy.md using the testing-strategy-template.md from @.agent-os/templates/spec-templates/

<file_template>
  <source>@.agent-os/templates/spec-templates/testing-strategy-template.md</source>
  <destination>{AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/testing-strategy.md</destination>
  <variable_substitution>
    [SPEC_NAME] → spec name from Step 7
    [SPEC_DATE] → date from Step 6
    [TESTING_FRAMEWORK] → determined based on tech stack
    [COVERAGE_TARGET] → minimum 80% coverage requirement
  </variable_substitution>
</file_template>

<testing_strategy_content>
  <testing_framework>
    - primary testing framework selection and justification
    - testing tool ecosystem and integration
    - test runner configuration and setup
  </testing_framework>
  <test_types_coverage>
    - unit tests: component-level testing strategy
    - integration tests: system interaction validation
    - end-to-end tests: complete workflow validation
    - performance tests: load and stress testing approach
  </test_types_coverage>
  <test_data_management>
    - test data creation and maintenance strategy
    - mock and stub management
    - test environment configuration
  </test_data_management>
  <continuous_integration>
    - automated testing pipeline integration
    - test reporting and metrics
    - quality gate enforcement
  </continuous_integration>
</testing_strategy_content>

<template_usage>
  ACTION: Use file-creator subagent with testing-strategy-template.md
  PROCESS: Determine appropriate testing framework based on tech stack
  POPULATE: Fill template with specific testing requirements
  VALIDATE: Ensure comprehensive test coverage plan
</template_usage>

</step>

<step number="10.3" subagent="file-creator" name="create_integration_requirements">

### Step 10.3: Create Integration Requirements

Use the file-creator subagent to create the file: {AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/integration-requirements.md using the integration-requirements-template.md from @.agent-os/templates/spec-templates/

<file_template>
  <source>@.agent-os/templates/spec-templates/integration-requirements-template.md</source>
  <destination>{AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/integration-requirements.md</destination>
  <variable_substitution>
    [SPEC_NAME] → spec name from Step 7
    [SPEC_DATE] → date from Step 6
    [INTEGRATION_SYSTEMS] → identified system dependencies
    [COMPATIBILITY_REQUIREMENTS] → backward/forward compatibility needs
  </variable_substitution>
</file_template>

<integration_requirements_content>
  <system_integration_overview>
    - integration architecture and patterns
    - data flow between systems
    - integration points and interfaces
  </system_integration_overview>
  <api_integration_requirements>
    - REST API specifications and contracts
    - authentication and authorization requirements
    - rate limiting and error handling
  </api_integration_requirements>
  <database_integration>
    - database connection and query patterns
    - data migration and synchronization
    - transaction management and consistency
  </database_integration>
  <external_service_integration>
    - third-party service dependencies
    - webhook and event-driven integration
    - service level agreements and reliability
  </external_service_integration>
  <compatibility_requirements>
    - backward compatibility constraints
    - version compatibility matrix
    - deprecation and migration strategies
  </compatibility_requirements>
</integration_requirements_content>

<template_usage>
  ACTION: Use file-creator subagent with integration-requirements-template.md
  PROCESS: Identify all integration points and dependencies
  POPULATE: Specify detailed integration requirements
  VALIDATE: Ensure all integration scenarios are covered
</template_usage>

</step>

<step number="10.4" subagent="file-creator" name="create_quality_gates">

### Step 10.4: Create Quality Gates

Use the file-creator subagent to create the file: {AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/quality-gates.md using the quality-gates-template.md from @.agent-os/templates/spec-templates/

<file_template>
  <source>@.agent-os/templates/spec-templates/quality-gates-template.md</source>
  <destination>{AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/quality-gates.md</destination>
  <variable_substitution>
    [SPEC_NAME] → spec name from Step 7
    [SPEC_DATE] → date from Step 6
    [QUALITY_METRICS] → defined quality measurement criteria
    [COMPLIANCE_STANDARDS] → applicable compliance requirements
  </variable_substitution>
</file_template>

<quality_gates_content>
  <quality_metrics_thresholds>
    - code coverage: minimum percentage requirements
    - performance: response time and throughput benchmarks
    - security: vulnerability and compliance thresholds
    - maintainability: code complexity and technical debt limits
  </quality_metrics_thresholds>
  <validation_criteria>
    - automated quality checks and tools
    - manual review and approval processes
    - stakeholder acceptance criteria
  </validation_criteria>
  <automated_quality_checks>
    - static code analysis configuration
    - security scanning and vulnerability assessment
    - performance monitoring and alerting
  </automated_quality_checks>
  <compliance_validation>
    - regulatory compliance requirements
    - industry standard adherence
    - audit trail and documentation requirements
  </compliance_validation>
</quality_gates_content>

<template_usage>
  ACTION: Use file-creator subagent with quality-gates-template.md
  PROCESS: Define measurable quality criteria
  POPULATE: Specify automated and manual quality checks
  VALIDATE: Ensure quality gates are achievable and enforceable
</template_usage>

</step>

<step number="10.5" subagent="file-creator" name="create_architecture_decisions">

### Step 10.5: Create Architecture Decisions

Use the file-creator subagent to create the file: {AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/architecture-decisions.md using the architecture-decisions-template.md from @.agent-os/templates/spec-templates/

<file_template>
  <source>@.agent-os/templates/spec-templates/architecture-decisions-template.md</source>
  <destination>{AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/architecture-decisions.md</destination>
  <variable_substitution>
    [SPEC_NAME] → spec name from Step 7
    [SPEC_DATE] → date from Step 6
    [ARCHITECTURAL_DECISIONS] → key architectural choices made
    [TECHNICAL_CONSTRAINTS] → identified constraints and limitations
  </variable_substitution>
</file_template>

<architecture_decisions_content>
  <architectural_decision_records>
    - decision context and problem statement
    - decision options considered
    - chosen solution and rationale
    - consequences and trade-offs
  </architectural_decision_records>
  <technical_constraints>
    - performance requirements and limitations
    - scalability constraints and considerations
    - security requirements and restrictions
    - resource constraints and dependencies
  </technical_constraints>
  <design_principles>
    - fundamental design principles adopted
    - architectural patterns and styles used
    - coding standards and conventions
  </design_principles>
  <technology_choices>
    - framework and library selections
    - database and storage technology decisions
    - infrastructure and deployment choices
  </technology_choices>
</architecture_decisions_content>

<template_usage>
  ACTION: Use file-creator subagent with architecture-decisions-template.md
  PROCESS: Document key architectural decisions and rationale
  POPULATE: Record technical constraints and design principles
  VALIDATE: Ensure decisions are well-documented and justified
</template_usage>

</step>

<step number="11" subagent="file-creator" name="create_database_schema">

### Step 11: Create Database Schema (Conditional)

Use the file-creator subagent to create the file: {AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/database-schema.md ONLY IF database changes needed for this task.

<decision_tree>
  IF spec_requires_database_changes:
    CREATE {AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/database-schema.md
  ELSE:
    SKIP this_step
</decision_tree>

<file_template>
  <header>
    # Database Schema

    This is the database schema implementation for the spec detailed in @.agent-os/specs/YYYY-MM-DD-spec-name/spec.md
  </header>
</file_template>

<schema_sections>
  <changes>
    - new tables
    - new columns
    - modifications
    - migrations
  </changes>
  <specifications>
    - exact SQL or migration syntax
    - indexes and constraints
    - foreign key relationships
  </specifications>
  <rationale>
    - reason for each change
    - performance considerations
    - data integrity rules
  </rationale>
</schema_sections>

</step>

<step number="12" subagent="file-creator" name="create_api_spec">

### Step 12: Create API Specification (Conditional)

Use the file-creator subagent to create file: {AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/api-spec.md ONLY IF API changes needed.

<decision_tree>
  IF spec_requires_api_changes:
    CREATE {AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/api-spec.md
  ELSE:
    SKIP this_step
</decision_tree>

<file_template>
  <header>
    # API Specification

    This is the API specification for the spec detailed in @.agent-os/specs/YYYY-MM-DD-spec-name/spec.md
  </header>
</file_template>

<api_sections>
  <routes>
    - HTTP method
    - endpoint path
    - parameters
    - response format
  </routes>
  <controllers>
    - action names
    - business logic
    - error handling
  </controllers>
  <purpose>
    - endpoint rationale
    - integration with features
  </purpose>
</api_sections>

<endpoint_template>
  ## Endpoints

  ### [HTTP_METHOD] [ENDPOINT_PATH]

  **Purpose:** [DESCRIPTION]
  **Parameters:** [LIST]
  **Response:** [FORMAT]
  **Errors:** [POSSIBLE_ERRORS]
</endpoint_template>

</step>

<step number="13" name="enhanced_user_review">

### Step 13: Enhanced User Review

Request user review of all specification files with comprehensive presentation, waiting for approval or revision requests.

<enhanced_review_request>
  I've created a comprehensive 6+ file specification package at {AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/:

  **Core Specification Files:**
  - Spec Requirements: @.agent-os/specs/YYYY-MM-DD-spec-name/spec.md
  - Spec Summary: @.agent-os/specs/YYYY-MM-DD-spec-name/spec-lite.md

  **Enhanced Technical Specifications:**
  - Technical Specification: @.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/technical-spec.md
  - Implementation Guide: @.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/implementation-guide.md
  - Testing Strategy: @.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/testing-strategy.md
  - Integration Requirements: @.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/integration-requirements.md
  - Quality Gates: @.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/quality-gates.md
  - Architecture Decisions: @.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/architecture-decisions.md

  **Conditional Specifications:**
  [LIST_DATABASE_SCHEMA_IF_CREATED]
  [LIST_API_SPEC_IF_CREATED]

  **Specification Summary:**
  - Total files generated: [TOTAL_FILE_COUNT]
  - Implementation-ready technical detail: ✓
  - Comprehensive testing strategy: ✓
  - Integration requirements defined: ✓
  - Quality gates established: ✓
  - Architectural decisions documented: ✓

  This enhanced specification package provides implementation-ready detail for development teams and ensures comprehensive coverage of all technical aspects.

  Please review the complete specification package and let me know if any changes are needed.

  When you're ready, run the /create-tasks command to have me build the tasks checklist from this comprehensive specification.
</enhanced_review_request>

<specification_validation>
  BEFORE presenting to user:
    - Verify all 6 core specification files were created successfully
    - Validate cross-file consistency (spec name, date, references)
    - Confirm technical depth meets implementation-readiness criteria
    - Check template variable substitution is complete
    - Ensure quality gates are properly defined
</specification_validation>

</step>

<step number="14" subagent="quality-assurance" name="specification_quality_validation">

### Step 14: Comprehensive Specification Quality Validation

Use the quality-assurance subagent to perform comprehensive automated validation of the complete specification package using the QualityGateValidator system to ensure quality and completeness before final delivery.

<enhanced_quality_validation>
  ACTION: Use quality-assurance subagent to:
    REQUEST: "Validate specification quality at {AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/"
    CONFIGURE: Apply project-specific quality thresholds
    ANALYZE: Generate comprehensive quality report
    ENFORCE: Quality gates with configurable thresholds
</enhanced_quality_validation>

<comprehensive_validation_categories>
  <completeness_validation>
    🔍 **File Completeness Assessment**
    - Verify all 8 core specification files exist (spec.md, technical-spec.md, implementation-guide.md, testing-strategy.md, integration-requirements.md, quality-gates.md, architecture-decisions.md, spec-lite.md)
    - Check conditional files (database-schema.md, api-spec.md) when required
    - Validate all template variables have been substituted
    - Ensure no placeholder text ([VARIABLE_NAME]) remains
    - **Target Score**: ≥ 95% completeness
  </completeness_validation>

  <technical_depth_validation>
    🔧 **Technical Implementation Depth**
    - Assess code examples, function signatures, API endpoints
    - Validate database schema references and data models
    - Check implementation patterns and architectural decisions
    - Verify error handling and testing requirements
    - **Target Score**: ≥ 90% technical depth
  </technical_depth_validation>

  <implementation_readiness_validation>
    🎯 **Implementation Readiness Assessment**
    - Extract specific file paths and function names
    - Identify API endpoints and database operations
    - Validate component structure and integration points
    - Check for actionable implementation guidance
    - **Target Score**: ≥ 90% implementation readiness
  </implementation_readiness_validation>

  <documentation_quality_validation>
    📚 **Documentation Quality Assessment**
    - Analyze content depth and clarity
    - Check for examples, diagrams, and visual aids
    - Validate organization and table of contents
    - Assess completeness and utility
    - **Target Score**: ≥ 85% documentation quality
  </documentation_quality_validation>

  <consistency_validation>
    🔗 **Cross-File Consistency Validation**
    - Validate spec name consistency across all files
    - Check date consistency and version alignment
    - Verify cross-file references are accurate
    - Ensure technical approach alignment between files
    - **Target Score**: ≥ 95% consistency
  </consistency_validation>

  <reference_validation>
    📎 **File Reference Format Validation**
    - Validate all file references follow standard format: `file_path:line_number`
    - Check for common violations (e.g., "line N", "#N", missing line numbers)
    - Verify referenced files exist (when accessible)
    - Report violations with suggested corrections
    - **Target Score**: ≥ 95% reference format compliance

    **Valid Reference Formats:**
    - ✅ `src/models/user.rb:42`
    - ✅ `app/controllers/auth_controller.ts:105-120`
    - ✅ `@.agent-os/standards/rails-patterns.md:250`
    - ✅ Relative paths: `../lib/utils.ts:15`
    - ✅ Home paths: `~/projects/app/main.py:8`

    **Invalid Reference Formats:**
    - 🔴 `user.rb line 42` (use :line not "line")
    - 🔴 `See auth_controller.ts` (missing line number)
    - 🔴 `models/user.rb#42` (use : not #)

    **Validation Process:**
    1. Scan all specification files for file references
    2. Check each reference against standard format pattern
    3. Verify file existence (optional, when path is accessible)
    4. Report all violations with line numbers
    5. Suggest corrected format for each violation

    **Auto-Fix Capability (Optional):**
    - Convert "line N" → ":N"
    - Convert "#N" → ":N"
    - Flag missing line numbers for manual review
  </reference_validation>
</comprehensive_validation_categories>

<quality_gate_enforcement>
  <configurable_thresholds>
    - **Completeness**: ≥ 95% (all required files and sections)
    - **Technical Depth**: ≥ 90% (sufficient implementation detail)
    - **Implementation Readiness**: ≥ 90% (clear, actionable specifications)
    - **Documentation Quality**: ≥ 85% (clear, comprehensive docs)
    - **Consistency**: ≥ 95% (cross-file alignment and references)
    - **Reference Format**: ≥ 95% (file reference format compliance)
    - **Overall Score**: ≥ 90% (weighted average across categories)
  </configurable_thresholds>

  <adaptive_thresholds>
    - **Project Type**: Adjust thresholds based on project complexity
    - **Phase**: Higher thresholds for production vs. prototype
    - **Custom Rules**: Apply project-specific validation rules
    - **Strict Mode**: Enforce 95%+ across all categories when enabled
  </adaptive_thresholds>
</quality_gate_enforcement>

<validation_execution_flow>
  STEP 1: Load quality configuration (.agent-os/quality-config.yml or defaults)
  STEP 2: Execute QualityGateValidator.validateSpecification(specPath)
  STEP 3: Generate comprehensive quality report with scores and recommendations
  STEP 4: Enforce quality gates based on configured thresholds
  STEP 5: Provide actionable recommendations for any quality issues
</validation_execution_flow>

<enhanced_validation_actions>
  <quality_gate_pass>
    IF overall_score ≥ 90% AND all_category_thresholds_met:
      ✅ PROCEED to user review with quality confidence
      📊 DISPLAY: Quality summary (Overall: [SCORE]%, Categories: [BREAKDOWN])
      🎯 STATUS: "Specification package meets all quality standards"
  </quality_gate_pass>

  <quality_gate_fail>
    IF overall_score < 90% OR any_critical_threshold_missed:
      ⚠️ IDENTIFY: Specific quality issues and gaps
      🔧 AUTO-CORRECT: Minor issues where possible (template variables, formatting)
      📋 ESCALATE: Major issues for manual review
      💡 PROVIDE: Actionable recommendations for improvement
      🔄 RETRY: Validation after corrections implemented
  </quality_gate_fail>

  <quality_reporting>
    GENERATE: Comprehensive quality report including:
      - Overall quality score and status
      - Category-by-category breakdown
      - Specific issues identified with file locations
      - Actionable recommendations prioritized by impact
      - Before/after comparison if re-validation performed
  </quality_reporting>
</enhanced_validation_actions>

<integration_with_workflow>
  <automatic_validation>
    - Execute quality validation automatically before user review
    - No additional user input required for standard validation
    - Present quality results as part of specification delivery
  </automatic_validation>

  <quality_improvement_loop>
    IF quality issues found:
      1. Present quality report with specific recommendations
      2. Implement automatic fixes where possible
      3. Request user guidance for complex improvements
      4. Re-validate after improvements implemented
      5. Continue until quality gates are satisfied
  </quality_improvement_loop>
</integration_with_workflow>

</step>

</process_flow>

<post_flight_check>
  EXECUTE: @.agent-os/instructions/meta/post-flight.md
</post_flight_check>
