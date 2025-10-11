---
description: Orchestrated parallel task execution using specialized subagents
globs:
alwaysApply: false
version: 2.0
encoding: UTF-8
---

# Orchestrated Task Execution Rules

## Overview

Execute a specific task and its sub-tasks using intelligent orchestration with specialized subagents working in parallel to maximize productivity while ensuring quality and completeness.

<pre_flight_check>
  EXECUTE: @.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

<process_flow>

<step number="1" subagent="task-orchestrator" name="orchestration_setup">

### Step 1: Task Orchestration Setup with Deliverable Planning

Use the task-orchestrator subagent to analyze the task, decompose for parallel execution, coordinate specialized agents with optimized context allocation, and **CREATE DELIVERABLE MANIFEST** for verification.

<orchestration_analysis>
  <task_decomposition>
    - Read task overview from master tasks.md (lightweight format)
    - Load detailed requirements from tasks/task-[TASK_ID].md
    - Identify parallel execution opportunities and dependencies
    - Map subtasks to specialist agent capabilities
    - Calculate optimal context allocation strategy
  </task_decomposition>

  <task_file_structure>
    NOTE: Tasks use optimized file structure for minimal context consumption:
    - **Master tasks.md**: Lightweight overview (~50-100 lines)
    - **tasks/task-*.md**: Detailed requirements per task (loaded as needed)
    - **Benefit**: 90%+ reduction in context usage for task review
  </task_file_structure>

  <agent_selection>
    - Determine required specialist agents based on task complexity
    - Allocate context windows efficiently across agents
    - Prepare focused context packages for each agent
    - Plan coordination points and integration milestones
  </agent_selection>

  <execution_strategy>
    - Design parallel execution streams with dependency management
    - Establish quality gates and validation checkpoints
    - Plan error handling and recovery mechanisms
    - Set up progress monitoring and status tracking
  </execution_strategy>

  <deliverable_planning>
    **CRITICAL NEW REQUIREMENT**: Create comprehensive deliverable manifest before delegation.

    - Analyze acceptance criteria to identify ALL expected files
    - List files to be created with specific requirements
    - List files to be modified with expected changes
    - Identify test files required with coverage expectations
    - Document verification criteria for each deliverable
    - Plan integration verification points
    - Share manifest with all subagents before work begins

    See @.agent-os/instructions/utilities/deliverable-verification-guide.md for detailed process.
  </deliverable_planning>
</orchestration_analysis>

<instructions>
  ACTION: Use task-orchestrator subagent
  REQUEST: "Analyze and orchestrate task execution for:
            - Parent Task: [TASK_NUMBER] [TASK_DESCRIPTION]
            - Subtasks: [ALL_SUBTASKS_FROM_TASKS_MD]
            - Technical Requirements: [RELEVANT_TECH_SPEC_SECTIONS]
            - Quality Standards: [CODING_STANDARDS_AND_BEST_PRACTICES]

            Phase 1 - Deliverable Planning (MANDATORY):
            1. Review acceptance criteria and task requirements
            2. Create deliverable manifest listing ALL expected files
            3. Document verification criteria for each file
            4. Identify test coverage requirements
            5. Plan integration verification points

            Phase 2 - Orchestration:
            1. Optimal specialist agent selection
            2. Focused context allocation per agent
            3. Dependency coordination and handoff points
            4. Quality assurance and integration strategy
            5. Progress monitoring and error handling

            Phase 3 - Manifest Distribution:
            1. Share deliverable manifest with ALL subagents
            2. Make clear that deliverables are MANDATORY
            3. Request subagents confirm deliverables received
            4. Set expectation that verification will occur"

  COORDINATE: Orchestrator manages all subsequent parallel execution
  MONITOR: Track progress across all specialist agents AND deliverable completion
  INTEGRATE: Ensure seamless integration of all work streams
  VERIFY: Prepare for comprehensive verification after execution
</instructions>

</step>

<step number="2" name="parallel_execution_streams">

### Step 2: Parallel Execution Coordination

The task-orchestrator manages multiple specialist agents working in parallel across different execution streams, with intelligent context distribution and dependency coordination.

<execution_streams>
  <stream_1_test_architecture>
    agent_type: "general-purpose"
    role: "Test architecture specialist"
    context_allocation: "Focused on testing frameworks and requirements"
    responsibilities:
      - Design comprehensive test strategy for the feature
      - Implement all test cases including unit, integration, and edge cases
      - Ensure test coverage meets quality standards
      - Coordinate with implementation stream for TDD workflow

    parallel_tasks:
      - Analyze feature requirements for test design
      - Create test plan and strategy document
      - Implement unit tests for all components
      - Design integration test scenarios
      - Create edge case and error condition tests
      - Set up test data and fixtures
  </stream_1_test_architecture>

  <stream_2_core_implementation>
    agent_type: "general-purpose"
    role: "Implementation specialist (or Frontend/Backend specialist based on task)"
    context_allocation: "Focused on business logic and architecture"
    responsibilities:
      - Implement core feature functionality and business logic
      - Ensure code quality and maintainability standards
      - Handle error conditions and edge cases
      - Coordinate with integration stream for API contracts

    parallel_tasks:
      - Analyze business requirements and logic
      - Design code architecture and patterns
      - Implement core functionality
      - Handle business rule validation
      - Implement error handling and edge cases
      - Optimize performance and resource usage
  </stream_2_core_implementation>

  <stream_3_integration_coordination>
    agent_type: "general-purpose"
    role: "Integration coordinator"
    context_allocation: "Focused on APIs and data flow"
    responsibilities:
      - Handle database operations and data persistence
      - Implement API endpoints and external service integration
      - Manage data flow and transformation
      - Ensure integration contracts are met

    parallel_tasks:
      - Design API contracts and endpoints
      - Implement database operations and queries
      - Handle external service integrations
      - Manage data validation and transformation
      - Implement authentication and authorization
      - Optimize database performance
  </stream_3_integration_coordination>

  <stream_4_quality_assurance>
    agent_type: "general-purpose"
    role: "Quality assurance specialist"
    context_allocation: "Focused on standards and optimization"
    responsibilities:
      - Ensure code quality and standards compliance
      - Perform code review and optimization
      - Validate performance requirements
      - Coordinate quality gates across streams

    parallel_tasks:
      - Review code for quality and standards compliance
      - Identify performance bottlenecks and optimizations
      - Validate coding standards adherence
      - Ensure technical debt minimization
      - Coordinate quality metrics tracking
      - Provide optimization recommendations
  </stream_4_quality_assurance>

  <stream_5_security_validation>
    agent_type: "general-purpose"
    role: "Security auditor"
    context_allocation: "Focused on security patterns and vulnerabilities"
    responsibilities:
      - Perform security vulnerability assessment
      - Implement secure coding practices
      - Validate authentication and authorization
      - Ensure data protection compliance

    parallel_tasks:
      - Analyze security requirements and threats
      - Review code for security vulnerabilities
      - Validate input sanitization and validation
      - Ensure secure data handling
      - Implement security best practices
      - Perform threat modeling validation
  </stream_5_security_validation>

  <stream_frontend_implementation>
    agent_type: "general-purpose"
    role: "Frontend specialist (React/Vue based on tech stack)"
    context_allocation: "Focused on UI components and state management"
    responsibilities:
      - Implement frontend UI components and interfaces
      - Create user-facing forms, displays, and interactions
      - Implement client-side state management and data flow
      - Ensure responsive design and accessibility
      - Coordinate with backend stream for API integration

    parallel_tasks:
      - Design UI component architecture
      - Implement React/Vue components for feature
      - Create forms and user input handling
      - Implement client-side validation
      - Add routing and navigation
      - Integrate with backend APIs
      - Implement error handling and loading states
      - Style components with TailwindCSS
      - Ensure responsive mobile-first design
      - Add accessibility features (ARIA, keyboard navigation)
  </stream_frontend_implementation>

  <stream_backend_implementation>
    agent_type: "general-purpose"
    role: "Backend Node.js specialist"
    context_allocation: "Focused on APIs and business logic"
    responsibilities:
      - Implement backend API endpoints and business logic
      - Create database operations and data persistence
      - Implement authentication and authorization
      - Handle server-side validation and error handling
      - Coordinate with frontend stream for API contracts

    parallel_tasks:
      - Design and implement REST/GraphQL APIs
      - Create database schema and migrations
      - Implement business logic and validation
      - Add authentication and authorization
      - Implement error handling and logging
      - Optimize database queries and performance
      - Add API documentation (OpenAPI/Swagger)
      - Coordinate API contracts with frontend
  </stream_backend_implementation>

  <stream_test_execution>
    agent_type: "test-runner"
    role: "Test execution"
    context_allocation: "Focused on test suite execution"
    responsibilities:
      - Execute test suites
      - Report test results
      - Validate test coverage

    parallel_tasks:
      - Run unit test suites
      - Run integration test suites
      - Generate coverage reports
      - Report failures and issues
  </stream_test_execution>

  <stream_6_documentation>
    agent_type: "general-purpose"
    role: "Documentation generator"
    context_allocation: "Focused on technical documentation"
    responsibilities:
      - Generate comprehensive technical documentation
      - Create API documentation and examples
      - Update code comments and inline documentation
      - Ensure documentation accuracy and completeness

    parallel_tasks:
      - Analyze implementation for documentation needs
      - Generate API documentation and schemas
      - Create code comments and docstrings
      - Update user-facing documentation
      - Generate usage examples and guides
      - Ensure documentation consistency
  </stream_6_documentation>
</execution_streams>

<coordination_protocol>
  <dependency_management>
    sync_point_1: "Test strategy and API contracts agreed"
    sync_point_2: "Core implementation ready for integration"
    sync_point_3: "Quality and security validation complete"
    sync_point_4: "Integration testing and documentation finalized"
  </dependency_management>

  <quality_gates>
    gate_1: "Test design approved and implementation started"
    gate_2: "Core functionality implemented and unit tests passing"
    gate_3: "Integration complete and API tests passing"
    gate_4: "Quality, security, and documentation requirements met"
  </quality_gates>

  <deliverable_tracking>
    **CRITICAL**: Track deliverable completion throughout execution.

    - Request regular status updates from each subagent
    - Update deliverable manifest as files are created/modified
    - Request file path confirmation for completed deliverables
    - Monitor for missing or delayed deliverables
    - Flag potential issues early before final verification
    - Keep manifest current for accurate Step 3 verification

    Format for subagent updates:
    "Report completed deliverables with specific file paths.
     Example: 'Completed: src/components/LoginForm.tsx (247 lines)'"
  </deliverable_tracking>

  <error_handling>
    context_adjustment: "Reallocate context if agents are struggling"
    agent_substitution: "Replace underperforming agents if needed"
    partial_recovery: "Preserve successful work and retry failures"
    escalation: "Human intervention for complex blocking issues"
    deliverable_alerts: "Flag missing deliverables early to prevent Step 3 failures"
  </error_handling>
</coordination_protocol>

<instructions>
  COORDINATE: Task-orchestrator manages all parallel streams
  MONITOR: Track progress, deliverable completion, and handle dependency synchronization
  UPDATE: Keep deliverable manifest current with completed files
  INTEGRATE: Merge work streams at coordination points
  VALIDATE: Ensure quality gates are met at each milestone
  VERIFY: Request file path confirmations for completed deliverables
  RECOVER: Handle errors and failures with intelligent strategies
</instructions>

</step>

<step number="3" subagent="task-orchestrator" name="integration_and_validation">

### Step 3: Integration and Mandatory Deliverable Verification

The task-orchestrator coordinates the integration of all parallel work streams, **VERIFIES ALL DELIVERABLES EXIST AND FUNCTION**, and ensures task completeness. **Task CANNOT be marked complete without passing verification.**

<integration_process>
  <work_stream_integration>
    - Merge outputs from all specialist agents
    - Resolve any conflicts or inconsistencies between streams
    - Validate integration points and dependencies
    - Ensure seamless functionality across all components
  </work_stream_integration>

  <deliverable_verification>
    **CRITICAL REQUIREMENT**: Verify ALL deliverables from manifest before proceeding.

    Phase 1 - File Existence Verification (MANDATORY):
    - Use Read tool to verify EVERY file in manifest exists
    - Check files created: Use Read on each path
    - Check files modified: Use Read + git diff to verify changes
    - Document any missing files
    - BLOCK completion if ANY files missing

    Phase 2 - Content Validation (MANDATORY):
    - Read key implementation files
    - Verify required functions/components exist
    - Check implementation matches specification
    - Validate error handling present
    - BLOCK completion if content insufficient

    Phase 3 - Test Verification (MANDATORY):
    - Verify ALL test files exist (using Read)
    - Use test-runner to execute ALL tests
    - Confirm 100% of tests pass
    - Check test coverage meets threshold (80%+)
    - BLOCK completion if tests missing or failing

    Phase 4 - Acceptance Criteria Evidence (MANDATORY):
    - Review each acceptance criterion from task detail file
    - Verify evidence exists for each criterion
    - Request additional evidence if missing
    - Validate evidence proves criterion is met
    - BLOCK completion if criteria unverified

    Phase 5 - Integration Verification (MANDATORY):
    - Check integration points between components
    - Verify APIs match between frontend/backend
    - Ensure no missing dependencies or imports
    - Validate end-to-end data flow
    - BLOCK completion if integration broken

    See @.agent-os/instructions/utilities/deliverable-verification-guide.md Phase 3 for detailed verification process.
  </deliverable_verification>

  <comprehensive_validation>
    - Run complete test suite including all new and updated tests
    - Validate API contracts and integration points
    - Verify security requirements and compliance
    - Confirm performance and quality standards are met
  </comprehensive_validation>

  <quality_assurance>
    - Perform final code review across all components
    - Validate documentation accuracy and completeness
    - Ensure all coding standards and best practices are followed
    - Confirm no regressions or breaking changes introduced
  </quality_assurance>
</integration_process>

<final_validation_checklist>
  <deliverable_verification>
    ✓ ALL files from manifest verified to exist (using Read tool)
    ✓ File contents validated to meet requirements
    ✓ ALL test files exist and tests pass (using test-runner)
    ✓ Test coverage meets minimum threshold (80%+)
    ✓ ALL acceptance criteria verified with evidence
    ✓ ALL integration points verified and working
  </deliverable_verification>

  <functionality_validation>
    ✓ All subtasks completed successfully
    ✓ Core functionality implemented and working
    ✓ Integration points tested and validated
    ✓ Error handling and edge cases covered
  </functionality_validation>

  <quality_validation>
    ✓ All tests passing (unit, integration, security)
    ✓ Code quality standards met
    ✓ Performance requirements satisfied
    ✓ Security vulnerabilities addressed
  </quality_validation>

  <documentation_validation>
    ✓ API documentation generated and accurate
    ✓ Code comments and docstrings complete
    ✓ Technical documentation updated
    ✓ Usage examples and guides created
  </documentation_validation>

  <compliance_validation>
    ✓ Coding standards adherence verified
    ✓ Best practices implementation confirmed
    ✓ Architecture guidelines followed
    ✓ Technical debt minimized
  </compliance_validation>
</final_validation_checklist>

<verification_failure_handling>
  IF ANY verification step fails:
    ❌ DO NOT PROCEED to Step 4 (Task Completion)
    ❌ DO NOT mark task as complete

    INSTEAD:
    1. Document specific verification failures
    2. Identify which subagent(s) responsible for missing deliverables
    3. Request subagent(s) deliver missing items immediately
    4. Wait for subagent(s) to complete fixes
    5. Re-run verification from the beginning
    6. Only proceed to Step 4 when ALL verifications pass

  Common Failures and Actions:
  - Missing files: Request subagent create them immediately
  - Failing tests: Request test-specialist or implementation-specialist fix
  - Missing evidence: Request subagents provide screenshots/proof
  - Integration broken: Request coordination between affected subagents
</verification_failure_handling>

<instructions>
  ACTION: Use task-orchestrator subagent for integration and verification
  REQUEST: "Integrate and VERIFY all work streams:

            Phase 1 - Integration:
            - Merge outputs from all specialist agents
            - Resolve conflicts and ensure consistency

            Phase 2 - MANDATORY Deliverable Verification:
            - Verify ALL files in manifest exist (use Read tool)
            - Validate file contents meet requirements
            - Verify ALL tests exist and pass (use test-runner)
            - Check test coverage meets threshold
            - Verify acceptance criteria with evidence
            - Validate integration points work

            Phase 3 - Completion Decision:
            - IF ALL verifications pass: APPROVE for completion
            - IF ANY verification fails: BLOCK completion and request fixes
            - Document verification results comprehensively
            - Create completion verification report"

  VALIDATE: All quality gates AND deliverable verification requirements met
  VERIFY: Use Read tool for file existence, test-runner for test execution
  BLOCK: Task completion if ANY verification fails
  CONFIRM: Task ready for completion ONLY after full verification passes
  DOCUMENT: Complete verification report with evidence
</instructions>

</step>

<step number="4" subagent="task-orchestrator" name="task_completion_and_status_update">

### Step 4: Task Completion and Status Updates (ONLY After Verification Passes)

**PREREQUISITE**: This step can ONLY be executed if Step 3 verification passed completely. If ANY verification failed, return to Step 3 to address failures.

The task-orchestrator finalizes the task by updating status, documenting results, and preparing for handoff to the next phase.

<completion_gate>
  **MANDATORY CHECK BEFORE PROCEEDING**:

  The orchestrator MUST confirm ALL of the following before marking task complete:
  - ✅ ALL files from deliverable manifest verified to exist
  - ✅ File contents validated to meet requirements
  - ✅ ALL tests exist and pass (100% pass rate)
  - ✅ Test coverage meets minimum threshold (80%+)
  - ✅ ALL acceptance criteria verified with evidence
  - ✅ ALL integration points verified and working
  - ✅ Deliverable verification report created

  IF ANY item above is NOT checked:
    ❌ DO NOT proceed with this step
    ❌ DO NOT mark task complete
    ↩️ RETURN to Step 3 to complete verification
</completion_gate>

<completion_process>
  <status_updates>
    - Mark parent task and all subtasks as complete in tasks.md
    - Mark task complete in tasks/task-[ID].md detail file
    - Update task checkboxes to [x] for completed items
    - Document any blocking issues or special notes (if applicable)
    - Record completion metrics and performance data
    - Attach deliverable verification report
  </status_updates>

  <results_documentation>
    - Generate summary of work completed across all streams
    - List ALL files created and modified (from verification)
    - Document test results and coverage achieved
    - Record any deviations from original plan
    - Include evidence of acceptance criteria being met
    - Record lessons learned and optimization opportunities
    - Prepare handoff documentation for next tasks
  </results_documentation>

  <quality_metrics_recording>
    - Record execution time and efficiency gains
    - Document parallel processing effectiveness
    - Track quality metrics and standards compliance
    - Measure context optimization and resource utilization
    - Record verification completion rate (100% expected)
  </quality_metrics_recording>
</completion_process>

<completion_criteria>
  <deliverable_verification_required>
    ✓ ALL deliverables from manifest verified (MANDATORY)
    ✓ Deliverable verification report created (MANDATORY)
    ✓ ALL files existence confirmed via Read tool (MANDATORY)
    ✓ ALL tests passing via test-runner (MANDATORY)
    ✓ Evidence provided for acceptance criteria (MANDATORY)
  </deliverable_verification_required>

  <task_completeness>
    ✓ All subtasks marked complete or properly blocked
    ✓ Core functionality fully implemented and tested
    ✓ Integration points validated and working
    ✓ Documentation complete and accurate
  </task_completeness>

  <quality_standards>
    ✓ Code quality standards met across all components
    ✓ Security requirements satisfied
    ✓ Performance benchmarks achieved
    ✓ Best practices implementation verified
  </quality_standards>

  <deliverable_readiness>
    ✓ Feature ready for integration with larger system
    ✓ Tests provide adequate coverage and confidence
    ✓ Documentation supports future maintenance
    ✓ No blocking issues or technical debt introduced
  </deliverable_readiness>
</completion_criteria>

<task_status_update_format>
  <completed_format>
    - [x] Task description → [details](tasks/task-ID.md)
    ✅ Completed by orchestrated parallel execution
    📊 Metrics: [EXECUTION_TIME], [QUALITY_SCORE], [EFFICIENCY_GAIN]
    ✅ Deliverables: [COUNT] files created, [COUNT] modified, ALL verified
    ✅ Tests: [COUNT/COUNT] passing (100%), Coverage: [PERCENTAGE]%
    ✅ Verification: Complete with evidence
    📋 Report: [LINK_TO_VERIFICATION_REPORT]
  </completed_format>

  <blocked_format>
    - [ ] Task description → [details](tasks/task-ID.md)
    ⚠️ Blocking issue: [DETAILED_DESCRIPTION]
    🔄 Attempts: [NUMBER] different approaches tried
    📝 Recommendation: [SUGGESTED_RESOLUTION_APPROACH]
    ❌ Verification: Failed - [SPECIFIC_FAILURES]
  </blocked_format>
</task_status_update_format>

<instructions>
  ACTION: Use task-orchestrator subagent for completion
  REQUEST: "Finalize task completion (ONLY if verification passed):

            Phase 1 - Verification Confirmation:
            - Confirm ALL deliverables verified in Step 3
            - Confirm deliverable verification report exists
            - Confirm 100% test pass rate achieved
            - Confirm acceptance criteria evidence collected
            - IF ANY missing: STOP and return to Step 3

            Phase 2 - Status Updates:
            - Update tasks.md with completion markers
            - Update tasks/task-[ID].md detail file
            - Include verification metrics in completion notes
            - Attach deliverable verification report

            Phase 3 - Results Documentation:
            - Generate comprehensive completion summary
            - List ALL files created/modified (verified)
            - Document test results and coverage
            - Include acceptance criteria evidence
            - Prepare handoff documentation

            Phase 4 - Metrics Recording:
            - Record execution metrics and performance
            - Document verification completion rate
            - Capture lessons learned and optimizations"

  VERIFY: Confirmation that Step 3 verification passed before proceeding
  UPDATE: Mark task complete ONLY after verification confirmed
  DOCUMENT: Complete results including verification report
  PREPARE: For handoff to post-execution workflow
  OPTIMIZE: Capture insights for future task orchestration
</instructions>

<critical_reminder>
  🚨 **NEVER mark a task complete without verified deliverables** 🚨

  The orchestrator MUST have:
  1. Created deliverable manifest in Step 1
  2. Tracked deliverables during Step 2
  3. Verified ALL deliverables in Step 3
  4. Confirmed verification passed before Step 4

  Missing this verification is the ROOT CAUSE of incomplete implementations.
  This step prevents tasks from being marked complete with missing files.
</critical_reminder>

</step>

</process_flow>

<orchestration_success_metrics>
  <performance_improvements>
    execution_speed: "Target 60-80% faster completion through parallel processing"
    context_efficiency: "Target 40-50% better context utilization"
    error_reduction: "Target 75% fewer failed executions"
  </performance_improvements>

  <quality_maintenance>
    test_coverage: "Maintain or improve current coverage levels"
    code_quality: "Meet or exceed established quality standards"
    integration_success: "Achieve 100% successful integrations"
  </quality_maintenance>

  <coordination_effectiveness>
    agent_utilization: "Maximize parallel processing efficiency"
    context_optimization: "Optimize context window usage across agents"
    orchestration_overhead: "Minimize coordination costs while maximizing benefits"
  </coordination_effectiveness>
</orchestration_success_metrics>

<post_flight_check>
  EXECUTE: @.agent-os/instructions/meta/post-flight.md
</post_flight_check>