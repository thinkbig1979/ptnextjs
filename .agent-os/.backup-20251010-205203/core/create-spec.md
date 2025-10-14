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
  <proceed>to context gathering</proceed>
</option_b_flow>

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

<step number="5" subagent="date-checker" name="date_determination">

### Step 5: Date Determination

Use the date-checker subagent to determine the current date in YYYY-MM-DD format for folder naming. The subagent will output today's date which will be used in subsequent steps.

<subagent_output>
  The date-checker subagent will provide the current date in YYYY-MM-DD format at the end of its response. Store this date for use in folder naming in step 6.
</subagent_output>

</step>

<step number="6" subagent="file-creator" name="spec_folder_creation">

### Step 6: Spec Folder Creation

Use the file-creator subagent to create directory: {AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/ using the date from step 5.

Use kebab-case for spec name. Maximum 5 words in name.

<folder_naming>
  <format>YYYY-MM-DD-spec-name</format>
  <date>use stored date from step 5</date>
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

<step number="7" subagent="file-creator" name="create_spec_md">

### Step 7: Create spec.md

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

<step number="8" subagent="file-creator" name="create_spec_lite_md">

### Step 8: Create spec-lite.md

Use the file-creator subagent to create the file: {AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/spec-lite.md for the purpose of establishing a condensed spec for efficient AI context usage.

<file_template>
  <header>
    # Spec Summary (Lite)
  </header>
</file_template>

<content_structure>
  <spec_summary>
    - source: Step 7 spec.md overview section
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

<step number="9" subagent="file-creator" name="create_technical_spec">

### Step 9: Create Enhanced Technical Specification

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

<step number="9.1" subagent="file-creator" name="create_implementation_guide">

### Step 9.1: Create Implementation Guide

Use the file-creator subagent to create the file: {AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/implementation-guide.md using the implementation-guide-template.md from @.agent-os/templates/spec-templates/

<file_template>
  <source>@.agent-os/templates/spec-templates/implementation-guide-template.md</source>
  <destination>{AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/implementation-guide.md</destination>
  <variable_substitution>
    [SPEC_NAME] → spec name from Step 6
    [SPEC_DATE] → date from Step 5
    [SPEC_FOLDER] → folder name from Step 6
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

<step number="9.2" subagent="file-creator" name="create_testing_strategy">

### Step 9.2: Create Testing Strategy

Use the file-creator subagent to create the file: {AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/testing-strategy.md using the testing-strategy-template.md from @.agent-os/templates/spec-templates/

<file_template>
  <source>@.agent-os/templates/spec-templates/testing-strategy-template.md</source>
  <destination>{AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/testing-strategy.md</destination>
  <variable_substitution>
    [SPEC_NAME] → spec name from Step 6
    [SPEC_DATE] → date from Step 5
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

<step number="9.3" subagent="file-creator" name="create_integration_requirements">

### Step 9.3: Create Integration Requirements

Use the file-creator subagent to create the file: {AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/integration-requirements.md using the integration-requirements-template.md from @.agent-os/templates/spec-templates/

<file_template>
  <source>@.agent-os/templates/spec-templates/integration-requirements-template.md</source>
  <destination>{AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/integration-requirements.md</destination>
  <variable_substitution>
    [SPEC_NAME] → spec name from Step 6
    [SPEC_DATE] → date from Step 5
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

<step number="9.4" subagent="file-creator" name="create_quality_gates">

### Step 9.4: Create Quality Gates

Use the file-creator subagent to create the file: {AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/quality-gates.md using the quality-gates-template.md from @.agent-os/templates/spec-templates/

<file_template>
  <source>@.agent-os/templates/spec-templates/quality-gates-template.md</source>
  <destination>{AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/quality-gates.md</destination>
  <variable_substitution>
    [SPEC_NAME] → spec name from Step 6
    [SPEC_DATE] → date from Step 5
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

<step number="9.5" subagent="file-creator" name="create_architecture_decisions">

### Step 9.5: Create Architecture Decisions

Use the file-creator subagent to create the file: {AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/architecture-decisions.md using the architecture-decisions-template.md from @.agent-os/templates/spec-templates/

<file_template>
  <source>@.agent-os/templates/spec-templates/architecture-decisions-template.md</source>
  <destination>{AGENT_OS_ROOT}/.agent-os/specs/YYYY-MM-DD-spec-name/sub-specs/architecture-decisions.md</destination>
  <variable_substitution>
    [SPEC_NAME] → spec name from Step 6
    [SPEC_DATE] → date from Step 5
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

<step number="10" subagent="file-creator" name="create_database_schema">

### Step 10: Create Database Schema (Conditional)

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

<step number="11" subagent="file-creator" name="create_api_spec">

### Step 11: Create API Specification (Conditional)

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

<step number="12" name="enhanced_user_review">

### Step 12: Enhanced User Review

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

<step number="13" subagent="quality-assurance" name="specification_quality_validation">

### Step 13: Comprehensive Specification Quality Validation

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
</comprehensive_validation_categories>

<quality_gate_enforcement>
  <configurable_thresholds>
    - **Completeness**: ≥ 95% (all required files and sections)
    - **Technical Depth**: ≥ 90% (sufficient implementation detail)
    - **Implementation Readiness**: ≥ 90% (clear, actionable specifications)
    - **Documentation Quality**: ≥ 85% (clear, comprehensive docs)
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
