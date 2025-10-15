---
description: Execute comprehensive quality validation for Agent OS artifacts
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Quality Validation Execution Instructions

## Overview

Execute comprehensive quality validation for Agent OS specifications, tasks, or implementations using the QualityGateValidator system with configurable thresholds and detailed reporting.

<pre_flight_check>
  EXECUTE: @.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

<process_flow>

<step number="1" name="validation_setup">

### Step 1: Validation Setup and Target Identification

Initialize validation environment and identify the target for quality assessment.

<target_detection>
  <user_specified>
    - Use provided path parameter
    - Validate path exists and is accessible
    - Determine target type based on path structure
  </user_specified>

  <auto_detection>
    IF no path provided:
      SCAN current working directory for:
        - "spec.md" OR "tasks.md" → specification validation
        - "src/" OR "lib/" OR "*.js" OR "*.ts" → implementation validation
        - Multiple candidates → prompt user for selection
  </auto_detection>

  <target_classification>
    <specification_targets>
      - Directory containing spec.md
      - Must have multiple .md files
      - Validates completeness, technical depth, implementation readiness
    </specification_targets>

    <task_targets>
      - Single tasks.md file
      - Contains markdown checklist format
      - Validates granularity, dependencies, testability
    </task_targets>

    <implementation_targets>
      - Directory with source code
      - Contains .js, .ts, .py, or other code files
      - Validates code quality, test coverage, documentation
    </implementation_targets>
  </target_classification>
</target_detection>

<configuration_loading>
  <quality_config>
    LOAD: .agent-os/quality-config.yml (if exists)
    DEFAULT: Built-in quality thresholds
    OVERRIDE: Command-line parameters (if provided)
  </quality_config>

  <threshold_configuration>
    - min_completeness: 0.90
    - min_technical_depth: 0.85
    - min_implementation_readiness: 0.90
    - min_test_coverage: 0.85
    - min_documentation_quality: 0.80
  </threshold_configuration>
</configuration_loading>

<instructions>
  ACTION: Initialize QualityGateValidator with configuration
  DETECT: Target type and path for validation
  LOAD: Project-specific quality configuration
  PREPARE: Validation environment and parameters
</instructions>

</step>

<step number="2" name="quality_assessment_execution">

### Step 2: Execute Quality Assessment

Perform comprehensive quality analysis based on target type and generate detailed metrics.

<specification_validation>
  IF target_type == "specification":
    EXECUTE: QualityGateValidator.validateSpecification(specPath)

    <validation_components>
      <completeness_check>
        - Scan for required files: spec.md, technical-spec.md, implementation-guide.md
        - Check for optional files: database-schema.md, api-spec.md
        - Validate file structure and organization
        - Score: (present_required / total_required) + bonus_optional
      </completeness_check>

      <technical_depth_analysis>
        - Analyze technical-spec.md for implementation details
        - Count code blocks, function signatures, API endpoints
        - Assess database schema references and data models
        - Score: aggregate of technical indicator presence and quality
      </technical_depth_analysis>

      <implementation_readiness_assessment>
        - Extract specific file paths and function names
        - Identify API endpoints and database operations
        - Validate error handling and testing requirements
        - Score: implementation-specific detail density
      </implementation_readiness_assessment>

      <documentation_quality_evaluation>
        - Analyze word count and content depth
        - Check for examples, diagrams, and visual aids
        - Validate table of contents and organization
        - Score: documentation completeness and utility
      </documentation_quality_evaluation>
    </validation_components>
</specification_validation>

<task_validation>
  IF target_type == "task_list":
    EXECUTE: QualityGateValidator.validateTaskList(tasksPath)

    <validation_components>
      <granularity_analysis>
        - Parse tasks from markdown checklist format
        - Analyze task length and specificity
        - Check for implementation details and acceptance criteria
        - Score: optimal task sizing and detail level
      </granularity_analysis>

      <dependency_validation>
        - Extract task dependencies from details
        - Build dependency graph and check for cycles
        - Validate dependency chain consistency
        - Score: dependency clarity and absence of circular references
      </dependency_validation>

      <testability_assessment>
        - Check for acceptance criteria in task details
        - Identify verifiable outcomes and specific deliverables
        - Validate measurable completion criteria
        - Score: task testability and verification potential
      </testability_assessment>

      <specificity_evaluation>
        - Extract file paths, function names, component names
        - Check for time estimates and effort indicators
        - Validate technical detail and implementation guidance
        - Score: task specificity and implementation clarity
      </specificity_evaluation>
    </validation_components>
</task_validation>

<full_stack_coupling_validation>
  IF target_type == "specification":
    EXECUTE: validateFullStackCoupling(specPath)

    <coupling_checks>
      <backend_frontend_pairing>
        - IF database-schema.md exists OR api-spec.md exists:
          REQUIRE: Frontend UI components specified in technical-spec.md
          VALIDATE:
            - Frontend Implementation section is present
            - UI Components subsection has content
            - At least one component specified
          ERROR_IF_MISSING: "Backend APIs/database specified but no frontend UI components found"

        - IF Frontend Implementation section exists:
          CHECK: Are there API endpoints to support the UI?
          VALIDATE:
            - API Specification section exists
            - OR Backend Implementation section exists
            - OR explicit note that frontend is static/no backend needed
          WARNING_IF_MISSING: "Frontend UI specified but no backend APIs found"
      </backend_frontend_pairing>

      <integration_specification>
        - IF both frontend and backend specified:
          REQUIRE: Frontend-Backend Integration section
          VALIDATE:
            - API Contract subsection exists
            - Integration Points subsection exists
            - Data flow described
            - Error handling strategy defined
          ERROR_IF_MISSING: "Full-stack feature missing integration specification"
      </integration_specification>

      <e2e_testing_requirement>
        - IF full-stack feature detected:
          REQUIRE: E2E testing strategy
          VALIDATE:
            - Testing Strategy mentions end-to-end tests
            - OR Full user workflows testing specified
          WARNING_IF_MISSING: "Full-stack feature should include E2E testing"
      </e2e_testing_requirement>
    </coupling_checks>

    <scoring>
      full_stack_coupling_score:
        - Backend without frontend: -0.20 (if user-facing)
        - Frontend without backend: -0.10 (if data persistence needed)
        - Missing integration section: -0.15
        - Missing E2E tests: -0.10
        - Complete full-stack spec: +0.10 bonus
    </scoring>
</full_stack_coupling_validation>

<implementation_validation>
  IF target_type == "implementation":
    EXECUTE: QualityGateValidator.validateImplementation(implementationPath)

    <validation_components>
      <code_quality_analysis>
        - Analyze code style consistency and conventions
        - Check for proper naming, commenting, and structure
        - Assess complexity and maintainability metrics
        - Score: code quality and maintainability
      </code_quality_analysis>

      <test_coverage_assessment>
        - Identify test files and testing frameworks
        - Analyze test coverage breadth and depth
        - Check for unit tests, integration tests, edge cases
        - Score: test coverage completeness and quality
      </test_coverage_assessment>

      <documentation_evaluation>
        - Check for README files and inline documentation
        - Analyze API documentation and usage examples
        - Validate documentation currency and accuracy
        - Score: documentation completeness and utility
      </documentation_evaluation>

      <performance_analysis>
        - Assess algorithmic complexity and efficiency
        - Check for performance optimization opportunities
        - Validate resource usage and scalability considerations
        - Score: performance optimization and efficiency
      </performance_analysis>
    </validation_components>
</implementation_validation>

<instructions>
  ACTION: Execute appropriate validation based on target type
  ANALYZE: Comprehensive quality metrics across all categories
  GENERATE: Detailed scoring and assessment data
  CALCULATE: Overall quality score using weighted factors
</instructions>

</step>

<step number="3" name="quality_report_generation">

### Step 3: Generate Comprehensive Quality Report

Create detailed quality report with scores, issues identification, and actionable recommendations.

<report_structure_generation>
  <header_section>
    📊 **Quality Validation Report**
    - **Target Type**: [specification|task_list|implementation]
    - **Target Path**: [validated_path]
    - **Validation Timestamp**: [ISO_timestamp]
    - **Validator Version**: [version]
    - **Configuration**: [threshold_summary]
  </header_section>

  <overall_score_section>
    🎯 **Overall Quality Score: [SCORE]/1.0 ([STATUS])**

    <status_mapping>
      - 0.90+ → 🟢 **Excellent** - Ready for implementation/deployment
      - 0.80-0.89 → 🟡 **Good** - Minor improvements recommended
      - 0.70-0.79 → 🟠 **Acceptable** - Some enhancements needed
      - 0.60-0.69 → 🔴 **Needs Improvement** - Significant issues to address
      - <0.60 → ⚫ **Inadequate** - Major rework required
    </status_mapping>
  </overall_score_section>

  <detailed_breakdown_section>
    📈 **Quality Category Breakdown**

    FOR each validation category:
      - **[Category Name]**: [Score]/1.0 ([Pass/Fail/Warning])
        - Threshold: [configured_threshold]
        - Details: [category_specific_metrics]
        - Issues: [identified_problems]
  </detailed_breakdown_section>

  <issues_identification_section>
    ⚠️ **Issues Identified ([TOTAL_COUNT])**

    <priority_categorization>
      🔴 **High Priority ([COUNT])** - Must address before proceeding
      🟡 **Medium Priority ([COUNT])** - Should address for quality improvement
      🔵 **Low Priority ([COUNT])** - Consider for future enhancement
    </priority_categorization>

    FOR each issue:
      - **[Issue_Type]**: [Description]
        - **Location**: [File/Section]
        - **Impact**: [Quality_impact_explanation]
        - **Recommendation**: [Specific_action_to_take]
  </issues_identification_section>

  <recommendations_section>
    💡 **Actionable Recommendations ([COUNT])**

    <immediate_actions>
      🎯 **Immediate Actions Required**
      FOR each critical issue:
        1. **[Issue]**: [Specific action needed]
           - **Location**: [Where to make changes]
           - **Expected Outcome**: [Success criteria]
           - **Estimated Effort**: [Time/complexity]
    </immediate_actions>

    <improvement_opportunities>
      🔧 **Improvement Opportunities**
      FOR each enhancement:
        1. **[Enhancement]**: [Improvement suggestion]
           - **Benefit**: [Why this matters]
           - **Implementation**: [How to implement]
           - **Priority**: [High/Medium/Low]
    </improvement_opportunities>

    <best_practices>
      📚 **Best Practice Recommendations**
      FOR each best practice gap:
        1. **[Practice]**: [Recommended practice]
           - **Reference**: [Standard/Documentation]
           - **Implementation Guide**: [How to apply]
    </best_practices>
  </recommendations_section>

  <quality_gates_section>
    ✅ **Quality Gate Status**

    <gate_results>
      - **Passed Gates**: [list_of_passed_gates]
      - **Failed Gates**: [list_of_failed_gates]
      - **Warning Gates**: [list_of_warning_gates]
    </gate_results>

    <threshold_analysis>
      FOR each configured threshold:
        - **[Threshold_Name]**: [Actual_Score] vs [Required_Score] ([Pass/Fail])
    </threshold_analysis>
  </quality_gates_section>
</report_structure_generation>

<instructions>
  ACTION: Generate comprehensive quality report
  FORMAT: Structured markdown with clear sections and actionable content
  INCLUDE: Specific file paths, line numbers, and concrete recommendations
  PRIORITIZE: Issues by impact and effort required for resolution
</instructions>

</step>

<step number="4" name="actionable_guidance_provision">

### Step 4: Provide Actionable Guidance and Follow-up Options

Present specific, implementable recommendations with clear next steps and follow-up validation options.

<actionable_guidance_formatting>
  <step_by_step_improvements>
    🚀 **Quality Improvement Roadmap**

    **Phase 1: Critical Issues (Required)**
    FOR each high-priority issue:
      □ **Step [N]**: [Specific action]
        - **File**: [exact_file_path]
        - **Change**: [what_to_modify]
        - **Validation**: [how_to_verify_fix]
        - **Time Estimate**: [estimated_effort]

    **Phase 2: Quality Enhancements (Recommended)**
    FOR each medium-priority improvement:
      □ **Step [N]**: [Enhancement action]
        - **Benefit**: [quality_improvement_expected]
        - **Implementation**: [step_by_step_guide]
        - **Success Metrics**: [how_to_measure_success]

    **Phase 3: Best Practice Adoption (Optional)**
    FOR each best practice recommendation:
      □ **Step [N]**: [Best practice implementation]
        - **Standard**: [reference_documentation]
        - **Application**: [project_specific_guidance]
        - **Long-term Benefit**: [maintenance_and_scalability_gains]
  </step_by_step_improvements>

  <implementation_templates>
    📝 **Implementation Templates**

    FOR complex recommendations:
      PROVIDE: Code templates, configuration examples, documentation templates
      INCLUDE: Before/after examples showing the improvement
      SPECIFY: Exact changes needed with file paths and line numbers
  </implementation_templates>
</actionable_guidance_formatting>

<follow_up_options>
  <re_validation_offering>
    🔄 **Re-validation Options**

    - **Immediate Re-run**: Validate again after implementing critical fixes
    - **Progress Tracking**: Compare before/after quality scores
    - **Incremental Validation**: Validate specific categories after targeted improvements
    - **Full Re-assessment**: Complete quality re-evaluation after all changes
  </re_validation_offering>

  <continuous_monitoring_setup>
    📊 **Continuous Quality Monitoring**

    - **Automated Quality Checks**: Set up pre-commit hooks for quality validation
    - **CI/CD Integration**: Add quality gates to deployment pipelines
    - **Periodic Assessment**: Schedule regular quality reviews
    - **Quality Metrics Dashboard**: Track quality trends over time
  </continuous_monitoring_setup>

  <integration_guidance>
    🔗 **Integration with Agent OS Workflows**

    - **create-spec.md Integration**: Automatic quality validation before user review
    - **create-tasks.md Integration**: Task quality validation during generation
    - **execute-tasks.md Integration**: Implementation quality validation during execution
    - **Custom Workflow Integration**: Add quality gates to custom workflows
  </integration_guidance>
</follow_up_options>

<user_interaction>
  <improvement_confirmation>
    PROMPT: "Would you like me to help implement any of these improvements?"
    OPTIONS:
      - "Yes, help with critical issues first"
      - "Yes, provide implementation guidance for [specific issue]"
      - "No, I'll implement these myself"
      - "Re-run validation after I make changes"
  </improvement_confirmation>

  <customization_options>
    OFFER: "Would you like to customize quality thresholds for this project?"
    PROVIDE: Template for .agent-os/quality-config.yml
    EXPLAIN: How different thresholds affect validation results
  </customization_options>
</user_interaction>

<instructions>
  ACTION: Provide clear, actionable guidance for quality improvements
  OFFER: Follow-up validation and monitoring options
  ENGAGE: User interaction for immediate improvement assistance
  INTEGRATE: Quality validation with existing Agent OS workflows
</instructions>

</step>

</process_flow>

<error_handling>

## Error Handling and Edge Cases

<validation_errors>
  <file_access_errors>
    - Missing files or directories
    - Permission issues
    - Corrupted or unreadable files
    - ACTION: Provide clear error messages with resolution guidance
  </file_access_errors>

  <parsing_errors>
    - Malformed markdown in task lists
    - Invalid configuration files
    - Unexpected file formats
    - ACTION: Graceful degradation with partial validation results
  </parsing_errors>

  <configuration_errors>
    - Invalid quality thresholds
    - Missing configuration files
    - Conflicting settings
    - ACTION: Fall back to defaults with warning messages
  </configuration_errors>
</validation_errors>

<edge_cases>
  <empty_targets>
    - Empty specification directories
    - Empty task files
    - Empty implementation directories
    - ACTION: Provide guidance on minimum content requirements
  </empty_targets>

  <partial_implementations>
    - Incomplete specifications
    - Work-in-progress implementations
    - Draft task lists
    - ACTION: Adjust expectations and provide appropriate guidance
  </partial_implementations>
</edge_cases>

</error_handling>

<post_flight_check>
  EXECUTE: @.agent-os/instructions/meta/post-flight.md
</post_flight_check>