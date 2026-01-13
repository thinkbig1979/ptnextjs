---
description: Product Planning Rules for Agent OS
globs:
alwaysApply: false
version: 5.1.0
encoding: UTF-8
---

# Product Planning Rules

## Overview

Generate product docs for new projects: mission, tech-stack, roadmap for AI agent consumption.

<pre_flight_check>
  EXECUTE: @.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

<process_flow>

<step number="0" name="detect_or_set_agent_os_root">

### Step 0: Detect or Set Agent OS Root

<detection_logic>
  SEARCH for .agent-os/:
  1. Check current directory
  2. Walk up parents

  IF existing .agent-os in parent:
    SET AGENT_OS_ROOT = parent directory
    INFORM: "Found .agent-os at {ROOT}/.agent-os/ - files created there"
  ELSE:
    SET AGENT_OS_ROOT = current directory
    INFORM: "Creating new .agent-os in current directory"

  USE AGENT_OS_ROOT for ALL file operations
</detection_logic>

</step>

<step number="1" subagent="context-fetcher" name="gather_user_input">

### Step 1: Gather User Input

Use context-fetcher subagent to collect required inputs with blocking validation.

<data_sources>
  PRIMARY: user_direct_input
  FALLBACK:
  1. @.agent-os/standards/global/tech-stack.md
  2. @.claude/CLAUDE.md
  3. Cursor User Rules
</data_sources>

<error_template>
  Provide missing:
  1. Main idea for product
  2. Key features (minimum 3)
  3. Target users/use cases (minimum 1)
  4. Tech stack preferences
  5. Application initialized and in project folder? (yes/no)
</error_template>

</step>

<step number="2" subagent="file-creator" name="create_documentation_structure">

### Step 2: Create Documentation Structure

Use file-creator to create structure with write permission validation.

<file_structure>
  {AGENT_OS_ROOT}/.agent-os/
  └── product/
      ├── mission.md          # Product vision
      ├── mission-lite.md     # Condensed for AI
      ├── tech-stack.md       # Technical architecture
      └── roadmap.md          # Development phases
</file_structure>

</step>

<step number="3" subagent="file-creator" name="create_mission_md">

### Step 3: Create mission.md

File: {AGENT_OS_ROOT}/.agent-os/product/mission.md

<sections>
  **Pitch** (1-2 sentences, elevator pitch):
  ```
  [PRODUCT_NAME] is a [TYPE] that helps [TARGET_USERS] 
  [SOLVE_PROBLEM] by providing [KEY_VALUE_PROP].
  ```

  **Users**:
  - Primary Customers: [SEGMENTS with descriptions]
  - User Personas:
    - [USER_TYPE] ([AGE_RANGE])
    - Role: [JOB_TITLE]
    - Context: [BUSINESS_CONTEXT]
    - Pain Points: [LIST]
    - Goals: [LIST]

  **The Problem** (2-4 problems):
  ```
  ### [PROBLEM_TITLE]
  [DESCRIPTION]. [QUANTIFIABLE_IMPACT].
  **Our Solution:** [SOLUTION_DESCRIPTION]
  ```

  **Differentiators** (2-3):
  ```
  ### [DIFFERENTIATOR_TITLE]
  Unlike [COMPETITOR], we provide [ADVANTAGE]. 
  This results in [MEASURABLE_BENEFIT].
  ```

  **Key Features** (8-10, grouped by category):
  - **[FEATURE]:** [USER_BENEFIT_DESCRIPTION]
</sections>

</step>

<step number="4" subagent="file-creator" name="create_tech_stack_md">

### Step 4: Create tech-stack.md

File: {AGENT_OS_ROOT}/.agent-os/product/tech-stack.md

<required_items>
  - application_framework (+ version)
  - database_system
  - javascript_framework
  - import_strategy (importmaps/node)
  - css_framework (+ version)
  - ui_component_library
  - fonts_provider
  - icon_library
  - application_hosting
  - database_hosting
  - asset_hosting
  - deployment_solution
  - code_repository_url
</required_items>

<data_resolution>
  IF has context-fetcher:
    FOR missing items:
      REQUEST from tech-stack.md
      USE found defaults

  ELSE manual resolution:
    FOR each required_item:
      IF NOT in user_input:
        CHECK:
        1. @.agent-os/standards/global/tech-stack.md
        2. @.claude/CLAUDE.md
        3. Cursor User Rules
      ELSE add_to_missing_list

  IF missing items:
    PROMPT: "Provide tech stack details: [NUMBERED_LIST]
            (respond with choice or 'n/a')"
</data_resolution>

</step>

<step number="5" subagent="file-creator" name="create_mission_lite_md">

### Step 5: Create mission-lite.md

File: {AGENT_OS_ROOT}/.agent-os/product/mission-lite.md

Condensed mission for efficient AI context.

<content_structure>
  - Elevator pitch (from mission.md pitch)
  - Value summary (1-3 sentences):
    - Value proposition
    - Target users
    - Key differentiator
  - Exclude: Secondary users, secondary differentiators
</content_structure>

<example>
  TaskFlow is a project management tool that helps remote teams 
  coordinate work efficiently by providing real-time collaboration 
  and automated workflow tracking.

  TaskFlow serves distributed software teams who need seamless task 
  coordination across time zones. Unlike traditional tools, TaskFlow 
  automatically syncs with development workflows and provides 
  intelligent prioritization based on team capacity and dependencies.
</example>

</step>

<step number="6" subagent="file-creator" name="create_roadmap_md">

### Step 6: Create roadmap.md

File: {AGENT_OS_ROOT}/.agent-os/product/roadmap.md

<phase_structure>
  **Count**: 1-3 phases
  **Features per phase**: 3-7

  **Template**:
  ```markdown
  ## Phase [NUMBER]: [NAME]

  **Goal:** [PHASE_GOAL]
  **Success Criteria:** [MEASURABLE_CRITERIA]

  ### Features
  - [ ] [FEATURE] - [DESCRIPTION] `[EFFORT]`

  ### Dependencies
  - [DEPENDENCY]
  ```

  **Guidelines**:
  - Phase 1: Core MVP
  - Phase 2: Key differentiators
  - Phase 3: Scale and polish
  - Phase 4: Advanced features
  - Phase 5: Enterprise features

  **Effort Scale**:
  - XS: 1 day
  - S: 2-3 days
  - M: 1 week
  - L: 2 weeks
  - XL: 3+ weeks
</phase_structure>

</step>

</process_flow>

<post_flight_check>
  EXECUTE: @.agent-os/instructions/meta/post-flight.md
</post_flight_check>
