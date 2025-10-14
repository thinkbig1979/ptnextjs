---
description: Rules to finish off and deliver to user set of tasks that have been completed using Agent OS
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# Task Execution Rules

## Overview

Follow these steps to mark your progress updates, create a recap, and deliver the final report to the user.

<pre_flight_check>
  EXECUTE: @.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

<process_flow>

<step number="1" subagent="test-runner" name="test_suite_verification">

### Step 1: Run All Tests

Use the test-runner subagent to run the ALL tests in the application's test suite to ensure no regressions and fix any failures until all tests pass.

<instructions>
  ACTION: Use test-runner subagent
  REQUEST: "Run the full test suite"
  WAIT: For test-runner analysis
  PROCESS: Fix any reported failures
  REPEAT: Until all tests pass
</instructions>

<test_execution>
  <order>
    1. Run entire test suite
    2. Fix any failures
  </order>
  <requirement>100% pass rate</requirement>
</test_execution>

<failure_handling>
  <action>troubleshoot and fix</action>
  <priority>before proceeding</priority>
</failure_handling>

</step>

<step number="1.5" subagent="quality-assurance" name="full_stack_completeness_check">

### Step 1.5: Full-Stack Completeness Validation

Use the quality-assurance subagent to verify that if the spec requires both frontend and backend, both have been implemented before creating PR.

<full_stack_detection>
  ACTION: Read spec files to determine feature type
    - Check sub-specs/technical-spec.md for Frontend Implementation section
    - Check sub-specs/technical-spec.md for Backend Implementation section
    - Check sub-specs/database-schema.md existence
    - Check sub-specs/api-spec.md existence

  CLASSIFY:
    - FULL_STACK: Both frontend and backend sections present
    - BACKEND_ONLY: Only backend sections present
    - FRONTEND_ONLY: Only frontend sections present
</full_stack_detection>

<completeness_validation>
  IF feature_type = FULL_STACK:
    VALIDATE_BACKEND:
      - Check for API endpoint files (routes/, controllers/, api/)
      - Check for database migration files
      - Check for service layer implementation
      - Verify backend tests exist and pass

    VALIDATE_FRONTEND:
      - Check for UI component files (components/, views/, pages/)
      - Check for state management files (stores/, context/)
      - Check for frontend API integration code
      - Verify frontend tests exist and pass

    VALIDATE_INTEGRATION:
      - Check for API client configuration
      - Verify frontend makes actual API calls to backend
      - Ensure error handling for API calls exists
      - Validate E2E tests cover full user workflow

    IF any_validation_fails:
      ERROR: "Full-stack feature incomplete"
      REPORT:
        - What was specified: [frontend + backend]
        - What was implemented: [actual implementation]
        - What is missing: [specific gaps]
      BLOCK_PR: true
      SUGGEST: "Complete missing implementation before creating PR"
</completeness_validation>

<user_facing_check>
  IF backend_apis_implemented:
    CHECK: Is there a UI for users to interact with these APIs?
    IF no_ui_found:
      WARN: "Backend APIs implemented but no frontend UI found"
      PROMPT: "Is this intentional? (API-only feature or missing frontend?)"
</user_facing_check>

<instructions>
  ACTION: Use quality-assurance subagent
  REQUEST: "Validate full-stack completeness for spec: [SPEC_FOLDER]
            - Detect feature type from spec
            - Verify all required layers implemented
            - Check frontend-backend integration
            - Block PR if incomplete"
  WAIT: For completeness validation
  PROCEED: Only if validation passes
</instructions>

</step>

<step number="2" subagent="git-workflow" name="git_workflow_and_repository_finalization">

### Step 2: Git Workflow & Repository Finalization

Use the git-workflow subagent to create git commit, push to GitHub, create pull request, and finalize repository state with strategic recommendations.

<instructions>
  ACTION: Use git-workflow subagent
  REQUEST: "Complete git workflow and repository finalization for [SPEC_NAME] feature:

            PHASE 1: Commit & Push
            - Spec: [SPEC_FOLDER_PATH]
            - Changes: All modified files
            - Target: main branch
            - Description: [SUMMARY_OF_IMPLEMENTED_FEATURES]
            - Create descriptive commit message
            - Push to spec branch

            PHASE 2: Pull Request Creation
            - Create PR with descriptive title
            - Include functionality recap in description
            - Link related issues/specs if applicable
            - Save PR URL for summary

            PHASE 3: Repository Finalization Analysis
            - Re-examine all open PRs including this new one
            - Check for PR dependencies and merge order
            - Identify conflicts between open PRs
            - Analyze which PRs are ready to merge
            - Check if any PRs are blocking others
            - Assess repository health post-completion

            PHASE 4: Strategic Recommendations
            - Recommend optimal PR merge order
            - Suggest which PRs should be merged immediately
            - Identify PRs needing rebase or conflict resolution
            - Propose next spec to work on based on dependencies
            - Recommend repository cleanup actions

            PHASE 5: Present Findings
            - Show updated repository state
            - Present merge strategy and recommendations
            - Provide clear next steps for user"
  WAIT: For workflow completion and analysis
  PROCESS: Save PR URL and strategic recommendations for summary
</instructions>

<commit_process>
  <commit>
    <message>descriptive summary of changes</message>
    <format>conventional commits if applicable</format>
  </commit>
  <push>
    <target>spec branch</target>
    <remote>origin</remote>
  </push>
  <pull_request>
    <title>descriptive PR title</title>
    <description>functionality recap</description>
  </pull_request>
</commit_process>

<repository_finalization_analysis>
  <pr_dependency_check>
    - List all open PRs with status
    - Identify which PRs depend on others
    - Detect PRs that modify same files/features
    - Check for PRs that should be merged in specific order
  </pr_dependency_check>

  <conflict_analysis>
    - Check if open PRs conflict with each other
    - Identify files modified in multiple PRs
    - Detect merge conflicts that would occur
    - Recommend resolution strategy
  </conflict_analysis>

  <merge_readiness>
    - Assess which PRs are ready to merge immediately
    - Identify PRs waiting for review/testing
    - Check CI/CD status for all PRs
    - Recommend merge priority order
  </merge_readiness>

  <strategic_planning>
    - Suggest optimal merge sequence
    - Recommend which spec to work on next
    - Identify dependencies between remaining specs
    - Propose repository maintenance actions
  </strategic_planning>
</repository_finalization_analysis>

<strategic_recommendations_format>
  🎯 **Repository Finalization Strategy**

  **Current State**:
  - Total open PRs: [NUMBER]
  - PRs ready to merge: [NUMBER]
  - PRs with conflicts: [NUMBER]
  - PRs behind main: [NUMBER]

  **PR Analysis**:
  1. [PR_TITLE] (#[NUMBER])
     - Status: [Ready/Needs Review/Has Conflicts/Behind Main]
     - Files: [NUMBER] files changed
     - Conflicts: [NONE/List conflicting PRs]
     - Recommendation: [Merge now/Wait for review/Rebase/Resolve conflicts]

  **Merge Strategy**:
  1. [STEP_1]: Merge PR #[NUMBER] ([REASON])
  2. [STEP_2]: Rebase PR #[NUMBER] after #[PREV] is merged
  3. [STEP_3]: Review and merge remaining PRs in order

  **Next Steps**:
  - [ ] Immediate: [ACTION_1]
  - [ ] Then: [ACTION_2]
  - [ ] Next spec to work on: [SPEC_NAME] (based on dependency analysis)

  **Repository Health**:
  - Overall status: [Healthy/Needs Attention/Requires Cleanup]
  - Recommendations: [LIST_OF_CLEANUP_ACTIONS]
</strategic_recommendations_format>

<best_practices>
  <merge_order_priority>
    1. Independent PRs with no conflicts (merge first)
    2. PRs that other PRs depend on (merge before dependents)
    3. PRs modifying same areas (merge in chronological or priority order)
    4. Experimental or risky PRs (merge last after validation)
  </merge_order_priority>

  <conflict_prevention>
    - Merge PRs promptly when ready to avoid conflicts
    - Rebase feature branches regularly on main
    - Limit concurrent PRs to 2-3 maximum
    - Work on independent features in parallel
    - Coordinate work on related features sequentially
  </conflict_prevention>

  <repository_hygiene>
    - Delete branches after PR merge
    - Clean up stale branches weekly
    - Keep main branch always deployable
    - Address conflicts immediately
    - Review PRs within 24-48 hours
  </repository_hygiene>
</best_practices>

</step>

<step number="3" subagent="project-manager" name="tasks_list_check">

### Step 3: Tasks Completion Verification

Use the project-manager subagent to read the current spec's tasks.md file and verify that all tasks have been properly marked as complete with [x] or documented with blockers.

<instructions>
  ACTION: Use project-manager subagent
  REQUEST: "Verify that all tasks have been marked with their outcome:
            - Read [SPEC_FOLDER_PATH]/tasks.md
            - Check all tasks are marked complete with [x] or (in rare cases) a documented blocking issue."
  WAIT: For task verification analysis
  PROCESS: Update task status as needed
</instructions>

</step>

<step number="4" subagent="project-manager" name="roadmap_progress_check">

### Step 4: Roadmap Progress Update (conditional)

Use the project-manager subagent to read @.agent-os/product/roadmap.md and mark roadmap items as complete with [x] ONLY IF the executed tasks have completed any roadmap item(s) and the spec completes that item.

<conditional_execution>
  <preliminary_check>
    EVALUATE: Did executed tasks complete any roadmap item(s)?
    IF NO:
      SKIP this entire step
      PROCEED to step 5
    IF YES:
      CONTINUE with roadmap check
  </preliminary_check>
</conditional_execution>

<roadmap_criteria>
  <update_when>
    - spec fully implements roadmap feature
    - all related tasks completed
    - tests passing
  </update_when>
</roadmap_criteria>

<instructions>
  ACTION: First evaluate if roadmap check is needed
      SKIP: If tasks clearly don't complete roadmap items
  EVALUATE: If current spec completes roadmap goals
  UPDATE: Mark roadmap items complete with [x] if applicable
</instructions>

</step>

<step number="5" subagent="project-manager" name="document_recap">

### Step 5: Create Recap Document

Use the project-manager subagent to create a recap document in .agent-os/recaps/ folder that summarizes what was built for this spec.

<instructions>
  ACTION: Use project-manager subagent
  REQUEST: "Create recap document for current spec:
            - Create file: .agent-os/recaps/[SPEC_FOLDER_NAME].md
            - Use template format with completed features summary
            - Include context from spec-lite.md
            - Document: [SPEC_FOLDER_PATH]"
  WAIT: For recap document creation
  PROCESS: Verify file is created with proper content
</instructions>

<recap_template>
  # [yyyy-mm-dd] Recap: Feature Name

  This recaps what was built for the spec documented at .agent-os/specs/[spec-folder-name]/spec.md.

  ## Recap

  [1 paragraph summary plus short bullet list of what was completed]

  ## Context

  [Copy the summary found in spec-lite.md to provide concise context of what the initial goal for this spec was]
</recap_template>

<file_creation>
  <location>.agent-os/recaps/</location>
  <naming>[SPEC_FOLDER_NAME].md</naming>
  <format>markdown with yaml frontmatter if needed</format>
</file_creation>

<content_requirements>
  <summary>1 paragraph plus bullet points</summary>
  <context>from spec-lite.md summary</context>
  <reference>link to original spec</reference>
</content_requirements>

</step>

<step number="6" subagent="project-manager" name="completion_summary">

### Step 6: Completion Summary

Use the project-manager subagent to create a structured summary message with emojis showing what was done, any issues, testing instructions, and PR link.

<summary_template>
  ## ✅ What's been done

  1. **[FEATURE_1]** - [ONE_SENTENCE_DESCRIPTION]
  2. **[FEATURE_2]** - [ONE_SENTENCE_DESCRIPTION]

  ## ⚠️ Issues encountered

  [ONLY_IF_APPLICABLE]
  - **[ISSUE_1]** - [DESCRIPTION_AND_REASON]

  ## 👀 Ready to test in browser

  [ONLY_IF_APPLICABLE]
  1. [STEP_1_TO_TEST]
  2. [STEP_2_TO_TEST]

  ## 📦 Pull Request

  View PR: [GITHUB_PR_URL]
</summary_template>

<summary_sections>
  <required>
    - functionality recap
    - pull request info
  </required>
  <conditional>
    - issues encountered (if any)
    - testing instructions (if testable in browser)
  </conditional>
</summary_sections>

<instructions>
  ACTION: Create comprehensive summary
  INCLUDE: All required sections
  ADD: Conditional sections if applicable
  FORMAT: Use emoji headers for scannability
</instructions>

</step>

<step number="7" subagent="project-manager" name="completion_notification">

### Step 7: Task Completion Notification

Use the project-manager subagent to play a system sound to alert the user that tasks are complete.

<notification_command>
  afplay /System/Library/Sounds/Glass.aiff
</notification_command>

<instructions>
  ACTION: Play completion sound
  PURPOSE: Alert user that task is complete
</instructions>

</step>

</process_flow>

<post_flight_check>
  EXECUTE: @.agent-os/instructions/meta/post-flight.md
</post_flight_check>
