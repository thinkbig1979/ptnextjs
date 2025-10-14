---
description: Enhance existing specs and tasks with comprehensive validation requirements and migrate task structures
globs:
alwaysApply: false
version: 2.0
encoding: UTF-8
---

# Enhance Existing Specs and Tasks Command

## Overview

Upgrade existing Agent OS specs and tasks with the comprehensive validation system to prevent premature success reporting and ensure thorough testing. Includes automatic detection and migration of monolithic tasks.md files to the optimized split structure for 90%+ context reduction.

<pre_flight_check>
  EXECUTE: @.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

<process_flow>

<step number="0" name="detect_and_migrate_task_structure">

### Step 0: Detect and Migrate Task File Structure

Detect existing task files and migrate monolithic format to optimized split structure if needed.

<detection_logic>
  **Detection Criteria**:
  - Check if tasks.md exists and is > 200 lines (indicates monolithic format)
  - Check if tasks/ subdirectory does NOT exist
  - Verify file contains detailed acceptance criteria inline (sign of old format)

  **Migration Decision**:
  - IF monolithic format detected: Proceed with migration
  - IF split format detected: Skip migration, proceed to enhancement
  - IF no tasks.md: Skip this step entirely
</detection_logic>

<migration_process>
  REFERENCE: @.agent-os/instructions/core/migrate-task-structure.md
  ACTION: Execute migration workflow for detected monolithic files
  RESULT: Optimized split structure with 90%+ context efficiency
  PRESERVE: All existing task content and completion status
</migration_process>

<migration_benefits>
  **Context Optimization**:
  - Master tasks.md: Reduced from 500-1000+ lines to ~50-100 lines
  - Detail files: Loaded only when executing specific tasks
  - Context savings: 90%+ reduction in repeated context consumption
  - Scalability: Efficiently handles 50+, 100+, or 200+ tasks

  **Safety Features**:
  - Automatic backup creation (tasks.md.backup)
  - Comprehensive validation before completion
  - Error recovery with backup restoration
  - No content loss during migration
</migration_benefits>

<instructions>
  ACTION: Detect task file format in existing specs
  MIGRATE: Convert monolithic to split structure if needed
  PRESERVE: All existing task content and completion status
  OPTIMIZE: Reduce context consumption by 90%+
  VALIDATE: Verify migration completed successfully
  REPORT: Migration results and context savings achieved
</instructions>

</step>

<step number="1" name="scan_existing_content">

### Step 1: Scan Existing Content for Enhancement Opportunities (After Migration)

Identify existing specs and tasks that would benefit from validation enhancement.

<content_scanning>
  **Target Files to Scan**:
  - `spec.md` - Feature specifications
  - `tasks.md` - Task lists
  - `technical-spec.md` - Technical specifications
  - Custom task files in project

  **Enhancement Indicators**:
  - Web components without browser testing requirements
  - Tasks without functional testing requirements
  - Missing manual verification steps
  - No evidence collection requirements
  - Incomplete acceptance criteria
  - **Frontend specs missing UX/UI specifications**:
    - Missing Component Architecture section
    - Missing Page Layout Architecture
    - Missing Navigation Architecture
    - Missing User Flow & Interaction Patterns
    - Missing Component Integration Map
</content_scanning>

<scanning_criteria>
  **High Priority for Enhancement**:
  - [ ] Web components (React, Vue, HTML/CSS) without browser testing
  - [ ] API endpoints without integration testing requirements
  - [ ] Forms without validation testing
  - [ ] Interactive UI elements without manual verification
  - [ ] Business logic without unit test requirements
  - [ ] **Frontend specs without UX/UI architecture specifications**
  - [ ] **Frontend tasks without navigation/layout implementation tasks**

  **Medium Priority for Enhancement**:
  - [ ] Components with basic tests but no evidence requirements
  - [ ] Tasks with acceptance criteria but no validation gates
  - [ ] Specs without testing methodology defined
  - [ ] Tasks without error scenario testing
  - [ ] Frontend specs with partial UX/UI documentation
  - [ ] Tasks missing user flow validation requirements
</scanning_criteria>

<instructions>
  ACTION: Scan existing content and identify enhancement opportunities
  CATEGORIZE: High, medium, and low priority enhancements
  GENERATE: Enhancement plan with specific file targets
</instructions>

</step>

<step number="2" name="enhance_specifications">

### Step 2: Enhance Existing Specifications (After Migration)

Upgrade specifications with comprehensive validation requirements and testing methodology.

<spec_enhancement_template>
  **Enhanced Spec Sections to Add**:

  ```markdown
  ## Testing & Validation Requirements

  ### Component Type Classification
  - **Component Type**: [Web Component | API Endpoint | Business Logic | Utility]
  - **Validation Level**: [Critical | High | Medium] based on user impact
  - **Testing Requirements**: Based on component type detection

  ### Mandatory Testing Requirements
  **For Web Components**:
  - [ ] **MANDATORY**: Functional tests for all user interactions
  - [ ] **MANDATORY**: Browser testing (Chrome + Firefox minimum)
  - [ ] **MANDATORY**: Responsive design validation (desktop + mobile)
  - [ ] **MANDATORY**: Manual verification with screenshots
  - [ ] **MANDATORY**: Accessibility testing (if public-facing)

  **For API Endpoints**:
  - [ ] **MANDATORY**: Functional tests for all endpoints
  - [ ] **MANDATORY**: Integration testing with database
  - [ ] **MANDATORY**: Error handling validation
  - [ ] **MANDATORY**: Performance testing
  - [ ] **MANDATORY**: Security validation

  **For Business Logic**:
  - [ ] **MANDATORY**: Unit tests with 80%+ coverage
  - [ ] **MANDATORY**: Functional testing of all methods
  - [ ] **MANDATORY**: Edge case and error scenario testing
  - [ ] **MANDATORY**: Integration testing

  ### Evidence Requirements
  - **Visual Evidence**: Screenshots/videos of manual testing
  - **Test Evidence**: Test execution logs showing all tests pass
  - **Performance Evidence**: Load times and performance metrics
  - **Browser Evidence**: Cross-browser compatibility screenshots
  - **Coverage Evidence**: Test coverage reports meeting thresholds

  ### Validation Gates
  - **Implementation Validator**: Must approve before task completion
  - **Browser Testing Validator**: Required for web components
  - **Quality Gate Validator**: Must meet quality thresholds
  - **Agent Accountability**: Evidence tracking and completion blocking

  ### Success Criteria
  Task completion BLOCKED until:
  - [ ] All mandatory tests written and passing
  - [ ] Evidence provided for all testing requirements
  - [ ] Validation gates approve implementation
  - [ ] No critical issues in browser testing
  - [ ] Performance meets specified thresholds
  ```
</spec_enhancement_template>

<enhancement_process>
  **Specification Enhancement Process**:

  1. **Analyze Existing Spec**:
     - Identify component types described
     - Assess current testing requirements
     - Determine validation level needed

  2. **Add Testing & Validation Section**:
     - Insert enhanced testing requirements
     - Add evidence collection requirements
     - Define validation gates and success criteria

  3. **Update Acceptance Criteria**:
     - Add validation requirements to existing criteria
     - Include evidence submission requirements
     - Reference validation system components

  4. **Preserve Existing Content**:
     - Keep all original functionality requirements
     - Enhance rather than replace existing criteria
     - Maintain backward compatibility

  5. **Add UX/UI Specifications** (for frontend features):
     - Add Component Architecture section to technical-spec.md
     - Add Page Layout Architecture with responsive design
     - Add Navigation Architecture and structure
     - Add User Flow & Interaction Patterns
     - Add Component Integration Map
</enhancement_process>

<ux_ui_enhancement>
  **UX/UI Specification Enhancement** (for frontend-facing specs):

  IF spec includes frontend components:
    ADD to technical-spec.md (or create sub-specs/technical-spec.md):

    ```markdown
    ### Component Architecture

    **UI Component Strategy**: {Detect from project's tech-stack.md or package.json}

    **Component Library**: {shadcn/ui | Material-UI | Ant Design | Custom components}

    **Library Components to Use**:
    - {List specific components from library that this feature will use}
    - {Include import paths, variants, props}

    **Custom Components** (if needed):
    - {List custom components built on library primitives}

    ### Page Layout Architecture

    **Global Layout Structure**: {Sidebar + Top Bar | Top Bar only | etc.}

    **Page-Specific Layouts**:
    - {Describe layout for each page in this feature}
    - {Include responsive behavior}

    **Component Hierarchy**:
    ```
    {PageComponent}
    ├── {ChildComponent1}
    └── {ChildComponent2}
    ```

    ### Navigation Architecture

    **Navigation Pattern**: {From tech-stack or existing codebase}

    **Routes Added**:
    - {List new routes this feature adds}
    - {Include route guards, navigation flow}

    ### User Flow & Interaction Patterns

    **Primary User Flows**:
    1. {Step-by-step user journey for key workflows}
    2. {Include success and error paths}
    3. {Specify loading states, error states}

    **Component Interaction Patterns**:
    - {How components communicate}
    - {State management approach}

    ### Component Integration Map

    **Data Flow**:
    ```
    User Action → Component → State → API → Response → UI Update
    ```

    **Component Communication**:
    - {Describe how components work together}
    ```

  **Priority**:
  - HIGH: Frontend specs missing UX/UI sections entirely
  - MEDIUM: Frontend specs with partial UX/UI documentation
  - LOW: Frontend specs with complete UX/UI documentation (validation only)

  **Validation**:
  - Component Architecture references actual component library from project
  - Page layouts include responsive design specifications
  - Navigation structure matches existing app navigation pattern
  - User flows are complete and testable
  - Component integration is clearly documented
</ux_ui_enhancement>

<instructions>
  ACTION: Enhance existing specifications with validation requirements
  PRESERVE: All existing functionality and requirements
  ADD: Comprehensive testing and validation sections
  ADD: UX/UI specifications for frontend features
  ENSURE: Backward compatibility maintained
</instructions>

</step>

<step number="3" name="enhance_task_lists">

### Step 3: Enhance Existing Task Lists (Post-Migration)

Upgrade existing task lists with validation requirements and evidence collection. Works with both monolithic and split task structures.

<task_file_awareness>
  **Structure Support**:
  - **Split Structure** (Recommended): Update both master tasks.md and individual task detail files
  - **Monolithic Structure**: Update single tasks.md file directly
  - **Detection**: Automatically detect structure from Step 0 results
  - **Enhancement**: Apply validation requirements to appropriate files
</task_file_awareness>

<task_enhancement_template>
  **Enhanced Task Template**:

  ```markdown
  - [ ] **[TASK_ID]** - [Original Task Title]
    - **Agent**: [Specialist Agent Type]
    - **Specifics**: [Original Task Specifics]
    - **Enhanced Acceptance Criteria**:
      - [ ] [Original Criteria Preserved]
      - [ ] **MANDATORY**: Functional tests written and passing
      - [ ] **MANDATORY**: Manual testing completed with evidence
      - [ ] **MANDATORY**: Browser testing completed (if web component)
      - [ ] **MANDATORY**: All edge cases and error scenarios tested
      - [ ] **VALIDATION REQUIRED**: Implementation validator approval
    - **Testing Requirements**:
      - **Functional Testing**: Write and execute tests for all functionality
      - **Manual Verification**: Test manually and provide screenshots/videos
      - **Browser Testing**: Test in Chrome and Firefox, desktop and mobile
      - **Error Testing**: Test all error conditions and edge cases
      - **Integration Testing**: Verify component works with existing system
    - **Evidence Required**:
      - Test execution results showing all tests pass
      - Screenshots/videos of manual testing
      - Browser compatibility evidence (if web component)
      - Performance validation results
      - Error handling demonstration
    - **Dependencies**: [Original Dependencies]
    - **Context**: [Enhanced with validation tools and standards]
    - **Estimated Time**: [Original Time] + 15-20 minutes validation
  ```
</task_enhancement_template>

<task_upgrade_process>
  **Task List Upgrade Process**:

  1. **Preserve Original Tasks**:
     - Keep all existing task structure
     - Maintain original acceptance criteria
     - Preserve dependencies and context

  2. **Add Validation Layer**:
     - Insert mandatory testing requirements
     - Add evidence collection requirements
     - Include validation gate references

  3. **Update Time Estimates**:
     - Add 15-20 minutes for validation evidence
     - Account for potential re-testing cycles
     - Include validation approval time

  4. **Add Validation Tasks**:
     - Insert validation tasks after implementation tasks
     - Reference implementation validator
     - Include browser testing validation for web components

  5. **Add UX/UI Implementation Tasks** (for frontend features):
     - Insert component library setup task (if missing)
     - Insert navigation architecture task (if missing)
     - Insert page layout implementation task (if missing)
     - Insert user flow validation tasks (if missing)
     - Reference UX/UI specifications from technical-spec.md
</task_upgrade_process>

<ux_ui_task_enhancement>
  **UX/UI Task Enhancement** (for frontend task lists):

  IF tasks.md includes frontend implementation:
    CHECK for these essential UX/UI tasks, ADD if missing:

    ```markdown
    ### Component Library and Navigation Tasks

    - [ ] **setup-component-library** - Install and Configure UI Component Library
      - Agent: frontend-[tech]-specialist
      - Specifics from sub-specs/technical-spec.md Component Architecture
      - Install {LIBRARY_NAME} components
      - Configure theme/design tokens
      - Time: 15-20 minutes

    - [ ] **impl-navigation-structure** - Implement Navigation Architecture
      - Agent: frontend-[tech]-specialist
      - Specifics from sub-specs/technical-spec.md Navigation Architecture
      - Implement {NAV_PATTERN}
      - Add breadcrumbs, mobile menu
      - Time: 25-30 minutes

    - [ ] **impl-page-layouts** - Implement Page Layout Templates
      - Agent: frontend-[tech]-specialist
      - Specifics from sub-specs/technical-spec.md Page Layout Architecture
      - Implement responsive layouts
      - Time: 25-30 minutes

    ### User Flow Validation Tasks

    - [ ] **impl-user-flow-{name}** - Implement {FlowName} User Flow
      - Agent: frontend-[tech]-specialist
      - Specifics from sub-specs/technical-spec.md User Flow section
      - Implement complete flow with all states
      - Time: 25-35 minutes

    - [ ] **test-user-flow-{name}** - Validate {FlowName} User Flow
      - Agent: test-architect
      - E2E test of complete workflow
      - Capture evidence (screenshots/recordings)
      - Time: 20-25 minutes
    ```

  **Integration**:
  - UX/UI tasks reference technical-spec.md sections
  - Dependencies: Navigation before layouts, layouts before components
  - User flow tasks depend on component implementation
  - All UX/UI tasks include time estimates
</ux_ui_task_enhancement>

<bulk_enhancement_support>
  **Bulk Enhancement Features**:

  - **Pattern Recognition**: Automatically detect task types needing enhancement
  - **Template Application**: Apply appropriate validation templates
  - **Dependency Preservation**: Maintain existing task relationships
  - **Agent Assignment**: Suggest appropriate specialist agents
  - **Context Enhancement**: Add validation tools to task context
</bulk_enhancement_support>

<instructions>
  ACTION: Enhance existing task lists with validation requirements
  PRESERVE: All original task functionality and structure
  ADD: Mandatory testing and evidence requirements
  UPDATE: Time estimates to include validation activities
</instructions>

</step>

<step number="4" name="validation_integration">

### Step 4: Integrate Enhanced Content with Validation System (Final Step)

Ensure enhanced specs and tasks properly integrate with the validation system.

<integration_checklist>
  **Integration Validation Checklist**:

  ✅ **Specification Integration**:
  - [ ] Testing requirements reference validation system components
  - [ ] Evidence requirements compatible with agent accountability system
  - [ ] Validation gates properly configured
  - [ ] Component type detection working correctly

  ✅ **Task Integration**:
  - [ ] Tasks reference appropriate validation agents
  - [ ] Acceptance criteria include validation requirements
  - [ ] Evidence collection integrated into task flow
  - [ ] Dependencies updated to include validation tasks

  ✅ **System Integration**:
  - [ ] Implementation validator configured for enhanced tasks
  - [ ] Browser testing validator available for web components
  - [ ] Quality gates updated with enhanced criteria
  - [ ] Agent accountability tracking enabled
</integration_checklist>

<validation_testing>
  **Enhanced Content Validation**:

  1. **Test Enhanced Specs**:
     - Verify validation requirements are complete
     - Confirm evidence collection is specified
     - Test validation gate integration

  2. **Test Enhanced Tasks**:
     - Verify tasks can be executed with validation
     - Confirm validation blocks task completion appropriately
     - Test evidence submission workflow

  3. **System Integration Test**:
     - Run sample enhanced task through full validation
     - Verify all validation components work together
     - Confirm backward compatibility maintained
</validation_testing>

<instructions>
  ACTION: Integrate enhanced content with validation system
  TEST: All validation components working with enhanced content
  VERIFY: Backward compatibility maintained
  VALIDATE: Complete workflow from enhanced spec to validated completion
</instructions>

</step>

</process_flow>

<enhancement_outcomes>

## Enhancement Outcomes

### **✅ Backward Compatible Upgrades**
- **Existing functionality preserved** - no breaking changes
- **Progressive enhancement** - add validation as needed
- **Graceful degradation** - works with or without validation

### **✅ Comprehensive Validation**
- **Evidence-based completion** - no more premature success
- **Browser testing required** - web components thoroughly tested
- **Quality gates enforced** - consistent delivery standards

### **✅ Enhanced Reliability**
- **Thorough testing required** - functional, manual, browser testing
- **Error scenario coverage** - edge cases and error handling tested
- **Performance validation** - meets performance thresholds

</enhancement_outcomes>

<post_flight_check>
  EXECUTE: @.agent-os/instructions/meta/post-flight.md
</post_flight_check>