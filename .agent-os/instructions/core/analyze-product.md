---
description: Analyze Current Product & Install Agent OS
globs:
alwaysApply: false
version: 5.1.0
encoding: UTF-8
---

# Analyze Current Product & Install Agent OS

## Overview

Install Agent OS into existing codebase, analyze current product state and progress. Builds on plan-product.md.

<pre_flight_check>
  EXECUTE: @.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

<process_flow>

<step number="1" name="analyze_existing_codebase">

### Step 1: Analyze Existing Codebase

Deep codebase analysis to understand current state before documentation.

<analysis_areas>
  **Project Structure**:
  - Directory organization
  - File naming patterns
  - Module structure
  - Build configuration

  **Technology Stack**:
  - Frameworks in use
  - Dependencies (package.json, Gemfile, requirements.txt, etc.)
  - Database systems
  - Infrastructure configuration

  **Implementation Progress**:
  - Completed features
  - Work in progress
  - Authentication/authorization state
  - API endpoints
  - Database schema

  **Code Patterns**:
  - Coding style
  - Naming conventions
  - File organization
  - Testing approach
</analysis_areas>

<instructions>
  ACTION: Thoroughly analyze codebase, document technologies/features/patterns, identify architectural decisions, note development progress
</instructions>

</step>

<step number="2" subagent="context-fetcher" name="gather_product_context">

### Step 2: Gather Product Context

Use context-fetcher to supplement codebase analysis with business context.

<context_questions>
  Based on codebase analysis, I see you're building [OBSERVED_PRODUCT_TYPE].

  To properly set up Agent OS, I need:

  1. **Product Vision**: What problem? Who are target users?
  2. **Current State**: Features not obvious from code?
  3. **Roadmap**: Planned features? Major refactoring?
  4. **Team Preferences**: Coding standards/practices to capture?
</context_questions>

<instructions>
  ACTION: Ask for product context, merge with codebase analysis, prepare for plan-product.md
</instructions>

</step>

<step number="3" name="execute_plan_product">

### Step 3: Execute Plan-Product with Context

Execute standard flow for installing Agent OS in existing products.

<execution_parameters>
  - main_idea: [DERIVED_FROM_ANALYSIS_AND_INPUT]
  - key_features: [IMPLEMENTED_AND_PLANNED]
  - target_users: [FROM_USER_CONTEXT]
  - tech_stack: [DETECTED_FROM_CODEBASE]
</execution_parameters>

<execution_prompt>
  @.agent-os/instructions/core/plan-product.md

  Installing Agent OS into existing product:

  **Main Idea**: [SUMMARY_FROM_ANALYSIS_AND_CONTEXT]

  **Key Features**:
  - Implemented: [LIST_FROM_ANALYSIS]
  - Planned: [LIST_FROM_USER]

  **Target Users**: [FROM_USER_RESPONSE]

  **Tech Stack**: [DETECTED_STACK_WITH_VERSIONS]
</execution_prompt>

<instructions>
  ACTION: Execute plan-product.md with gathered information, provide structured input
</instructions>

</step>

<step number="4" name="customize_generated_files">

### Step 4: Customize Generated Documentation

Refine generated docs for accuracy: update roadmap, tech stack, decisions based on actual implementation.

<customization_tasks>
  **Roadmap Adjustment**:
  - Mark completed features as done
  - Move implemented to "Phase 0: Already Completed"
  - Adjust future phases based on progress

  **Tech Stack Verification**:
  - Verify detected versions correct
  - Add missing infrastructure details
  - Document actual deployment setup
</customization_tasks>

<roadmap_template>
  ## Phase 0: Already Completed

  Implemented features:
  - [x] [FEATURE_1] - [DESCRIPTION_FROM_CODE]
  - [x] [FEATURE_2] - [DESCRIPTION_FROM_CODE]
  - [x] [FEATURE_3] - [DESCRIPTION_FROM_CODE]

  ## Phase 1: Current Development
  - [ ] [IN_PROGRESS_FEATURE] - [DESCRIPTION]

  [CONTINUE_WITH_STANDARD_PHASES]
</roadmap_template>

</step>

<step number="5" name="final_verification">

### Step 5: Final Verification and Summary

Verify installation completeness, provide next steps.

<verification_checklist>
  - [ ] .agent-os/product/ created
  - [ ] All docs reflect actual codebase
  - [ ] Roadmap shows completed/planned accurately
  - [ ] Tech stack matches dependencies
</verification_checklist>

<summary_template>
  ## ✅ Agent OS Successfully Installed

  Analyzed [PRODUCT_TYPE] codebase and set up Agent OS with docs reflecting actual implementation.

  ### What I Found
  - **Tech Stack**: [DETECTED_STACK_SUMMARY]
  - **Completed Features**: [COUNT] implemented
  - **Code Style**: [DETECTED_PATTERNS]
  - **Current Phase**: [IDENTIFIED_STAGE]

  ### What Was Created
  - ✓ Product docs in `.agent-os/product/`
  - ✓ Roadmap with completed work in Phase 0
  - ✓ Tech stack reflecting actual dependencies

  ### Next Steps
  1. Review generated docs in `.agent-os/product/`
  2. Make necessary adjustments to reflect your vision
  3. See Agent OS README: https://github.com/buildermethods/agent-os
  4. Start using for next feature:
     ```
     @.agent-os/instructions/core/create-spec.md
     ```

  Your codebase is now Agent OS-enabled! 🚀
</summary_template>

</step>

</process_flow>

<post_flight_check>
  EXECUTE: @.agent-os/instructions/meta/post-flight.md
</post_flight_check>
