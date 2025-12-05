---
description: Migration workflow for converting monolithic tasks.md files to optimized split structure
version: 1.0
encoding: UTF-8
---

# Migrate Task Structure

## Overview

This workflow detects and migrates monolithic tasks.md files to Agent OS v2.1.0's optimized split structure, providing 90%+ context reduction while preserving all task details and completion status.

### Benefits of Migration

- **90%+ Context Reduction**: Master tasks.md reduced from 500-1000+ lines to ~50-100 lines
- **Scalability**: Efficiently handle 50+, 100+, or 200+ tasks
- **Performance**: Only load detailed requirements when executing specific tasks
- **Maintainability**: Easier to update individual task details without reloading entire file
- **Migration Recommended**: Split format is the standard; migration improves performance

## Detection Logic

### Monolithic Format Indicators

<detection_criteria>
  **Primary Indicators** (any one triggers migration recommendation):
  - [ ] tasks.md exists and is > 200 lines
  - [ ] tasks/ subdirectory does NOT exist
  - [ ] File contains detailed acceptance criteria inline (5+ bullet points per task)
  - [ ] File contains "Testing Requirements" or "Evidence Required" sections inline
  - [ ] File contains "Context Requirements" or "Quality Gates" sections inline

  **Detection Algorithm**:
  1. Check if tasks.md exists in spec folder
  2. Count lines in tasks.md (if > 200 lines, likely monolithic)
  3. Check if tasks/ subdirectory exists (if not, definitely monolithic)
  4. Scan content for verbose acceptance criteria patterns
  5. Look for inline testing/evidence/quality sections

  **Decision Matrix**:
  - IF tasks.md > 200 lines AND no tasks/ subdirectory: **MIGRATE (High Priority)**
  - IF tasks.md contains verbose inline details: **MIGRATE (Medium Priority)**
  - IF tasks/ subdirectory exists: **SKIP (Already optimized)**
  - IF tasks.md < 100 lines: **SKIP (Already concise or minimal tasks)**
</detection_criteria>

### Split Format Verification

<split_format_check>
  **Indicators of Optimized Format**:
  - [ ] tasks/ subdirectory exists with task-*.md files
  - [ ] Master tasks.md contains links to task detail files
  - [ ] Master tasks.md is concise (~50-100 lines for 10-20 tasks)
  - [ ] Individual task files contain comprehensive details

  **Verification Steps**:
  1. Check for tasks/ subdirectory existence
  2. Count task-*.md files in tasks/ directory
  3. Verify master tasks.md has links to detail files
  4. Confirm master tasks.md line count is reasonable
</split_format_check>

## Migration Process

### Phase 1: Pre-Migration Preparation

<step number="1" name="backup_original_file">

#### Step 1: Backup Original File

Create a backup of the monolithic tasks.md file before any modifications.

<backup_instructions>
  ACTION: Copy original tasks.md to tasks.md.backup
  LOCATION: Same directory as tasks.md
  NAMING: tasks.md.backup (append .backup extension)
  VERIFY: Backup file created successfully with identical content
  PURPOSE: Safety net for recovery if migration fails
</backup_instructions>

<instructions>
  EXECUTE: cp tasks.md tasks.md.backup
  VERIFY: Backup file exists and matches original
  LOG: "Created backup: tasks.md.backup"
</instructions>

</step>

<step number="2" name="parse_monolithic_file">

#### Step 2: Parse Monolithic File

Extract all tasks from the monolithic tasks.md file, identifying structure and content.

<parsing_logic>
  **Task Identification Patterns**:
  - Task line format: `- [ ] **task-id** - Task Title` or `- [ ] 1.2 Task Title`
  - Completed task: `- [x] **task-id** - Task Title`
  - Subtask indentation: Two or more spaces before `- [ ]`
  - Section headers: `##` or `###` followed by phase/category name

  **Content Extraction**:
  1. **Task ID**: Extract from bold text or numeric pattern
  2. **Title**: Text after task ID and hyphen
  3. **Status**: Check `[ ]` vs `[x]` checkbox
  4. **Indentation Level**: Count leading spaces to determine hierarchy
  5. **Details**: All indented content following task line until next task
  6. **Agent**: Look for `- **Agent**:` pattern
  7. **Time Estimate**: Look for `- **Estimated Time**:` pattern
  8. **Dependencies**: Look for `- **Dependencies**:` pattern
  9. **Specifics**: Extract detailed requirements
  10. **Acceptance Criteria**: Extract `- [ ]` checklist items
  11. **Testing Requirements**: Extract testing sections
  12. **Evidence Required**: Extract evidence sections
  13. **Context Requirements**: Extract context sections
  14. **Quality Gates**: Extract quality gate sections

  **Data Structure**:
  ```
  Task {
    id: string
    title: string
    status: 'complete' | 'incomplete'
    phase: string
    agent: string
    time_estimate: string
    dependencies: string[]
    specifics: string[]
    acceptance_criteria: string[]
    testing_requirements: object
    evidence_required: string[]
    context_requirements: string[]
    quality_gates: string[]
    implementation_notes: string[]
    related_files: string[]
    indentation_level: number
    original_content: string
  }
  ```
</parsing_logic>

<parsing_instructions>
  ACTION: Read entire tasks.md file
  PARSE: Line by line, identifying tasks and their details
  EXTRACT: All task metadata and content sections
  STRUCTURE: Build task object array with complete information
  VALIDATE: All tasks extracted successfully
  COUNT: Total tasks found for verification
</parsing_instructions>

</step>

<step number="3" name="analyze_task_structure">

#### Step 3: Analyze Task Structure

Analyze the extracted tasks to identify phases, dependencies, and organization.

<analysis_logic>
  **Phase Detection**:
  - Identify section headers (## or ###)
  - Group tasks by phase/section
  - Preserve phase ordering

  **Dependency Mapping**:
  - Extract explicit dependencies from task metadata
  - Identify implicit dependencies from task ordering
  - Validate no circular dependencies exist

  **Hierarchy Analysis**:
  - Map parent-child task relationships
  - Preserve indentation structure
  - Maintain task groupings

  **Metadata Aggregation**:
  - Count total tasks
  - Calculate total estimated time
  - Identify assigned agents
  - Track completion status
</analysis_logic>

<instructions>
  ANALYZE: Task structure and organization
  MAP: Dependencies and relationships
  AGGREGATE: Metadata for master file
  VALIDATE: Structure integrity
</instructions>

</step>

### Phase 2: File Generation

<step number="4" name="create_directory_structure">

#### Step 4: Create Directory Structure

Create the tasks/ subdirectory for individual task detail files.

<directory_instructions>
  ACTION: Create tasks/ subdirectory in spec folder
  LOCATION: Same directory as tasks.md
  VERIFICATION: Directory exists and is writable
  ERROR_HANDLING: If directory exists, verify it's empty or confirm overwrite
</directory_instructions>

<instructions>
  EXECUTE: mkdir -p tasks/
  VERIFY: tasks/ directory exists
  LOG: "Created tasks/ directory"
</instructions>

</step>

<step number="5" name="generate_individual_task_files">

#### Step 5: Generate Individual Task Files

Create detailed task files for each extracted task.

<individual_file_generation>
  **Filename Convention**:
  - Format: `task-[TASK_ID].md`
  - Examples:
    - task-pre-1.md
    - task-impl-comp1-core.md
    - task-test-1.md
  - Sanitize task ID: Replace spaces, dots, special chars with hyphens
  - Lowercase task ID for consistency

  **File Content Template**:
  ```markdown
  # Task: [TASK_ID] - [TASK_TITLE]

  ## Task Metadata
  - **Task ID**: [TASK_ID]
  - **Phase**: [PHASE_NAME]
  - **Agent**: [ASSIGNED_AGENT]
  - **Estimated Time**: [TIME_ESTIMATE]
  - **Dependencies**: [DEPENDENCY_LIST]
  - **Status**: [STATUS_CHECKBOX] [STATUS_TEXT]

  ## Task Description
  [DETAILED_TASK_DESCRIPTION or TASK_TITLE if no description]

  ## Specifics
  [EXTRACTED_SPECIFICS or "See acceptance criteria below"]

  ## Acceptance Criteria
  [EXTRACTED_ACCEPTANCE_CRITERIA]

  ## Testing Requirements
  [EXTRACTED_TESTING_REQUIREMENTS if present]

  ## Evidence Required
  [EXTRACTED_EVIDENCE_REQUIREMENTS if present]

  ## Context Requirements
  [EXTRACTED_CONTEXT_REQUIREMENTS if present]

  ## Implementation Notes
  [EXTRACTED_IMPLEMENTATION_NOTES if present]

  ## Quality Gates
  [EXTRACTED_QUALITY_GATES if present]

  ## Related Files
  - Spec: ../../spec.md
  - Technical Spec: ../../technical-spec.md
  - Master Task List: ../tasks.md
  [ADDITIONAL_RELATED_FILES if present]
  ```

  **Content Population Rules**:
  1. If section has no content, omit section entirely
  2. Preserve exact formatting from original
  3. Maintain checkbox states for acceptance criteria
  4. Include all subsections and bullet points
  5. Keep original markdown formatting
</individual_file_generation>

<generation_instructions>
  FOR each extracted task:
    GENERATE: Filename from sanitized task ID
    POPULATE: Template with extracted content
    WRITE: File to tasks/ subdirectory
    VERIFY: File created successfully
  END FOR

  LOG: "Generated [COUNT] individual task files"
</generation_instructions>

</step>

<step number="6" name="generate_master_tasks_file">

#### Step 6: Generate Master Tasks File

Create lightweight master tasks.md with links to detail files.

<master_file_generation>
  **Master File Template**:
  ```markdown
  # Spec Tasks

  ## Metadata
  - **Spec Name**: [SPEC_NAME]
  - **Generation Date**: [CURRENT_DATE]
  - **Total Tasks**: [TASK_COUNT]
  - **Completed Tasks**: [COMPLETED_COUNT]/[TASK_COUNT]
  - **Estimated Total Time**: [TOTAL_TIME]
  - **Migrated**: ✅ Migrated from monolithic to split structure on [MIGRATION_DATE]

  ## [PHASE_1_NAME]

  - [STATUS] **[TASK_ID]** - [TASK_TITLE] → [details](tasks/task-[SANITIZED_ID].md)
    - **Agent**: [AGENT_NAME]
    - **Estimated Time**: [TIME_ESTIMATE]
    - **Dependencies**: [DEPENDENCY_LIST]

  [SUBTASKS with increased indentation if present]

  ## [PHASE_2_NAME]

  - [STATUS] **[TASK_ID]** - [TASK_TITLE] → [details](tasks/task-[SANITIZED_ID].md)
    - **Agent**: [AGENT_NAME]
    - **Estimated Time**: [TIME_ESTIMATE]
    - **Dependencies**: [DEPENDENCY_LIST]

  ## Task Summary
  - **Total Tasks**: [TOTAL_COUNT]
  - **Completed**: [COMPLETED_COUNT] ([COMPLETION_PERCENTAGE]%)
  - **Remaining**: [REMAINING_COUNT]
  - **Total Estimated Time**: [TOTAL_TIME]
  ```

  **Content Rules**:
  - Each task: ONE line with ID, title, link
  - Indented lines: Agent, time, dependencies ONLY
  - NO verbose acceptance criteria
  - NO testing requirements inline
  - NO evidence requirements inline
  - Links format: `[details](tasks/task-[SANITIZED_ID].md)`
  - Preserve task hierarchy with indentation
  - Maintain phase organization
  - Preserve completion status checkboxes
</master_file_generation>

<generation_instructions>
  BUILD: Master file from analyzed task structure
  INCLUDE: Only essential metadata per task
  LINK: Each task to its detail file
  PRESERVE: Phase organization and hierarchy
  CALCULATE: Aggregate statistics
  WRITE: New tasks.md file (overwrite original)
  VERIFY: File generated successfully
  LOG: "Generated master tasks.md with [COUNT] tasks"
</generation_instructions>

</step>

### Phase 3: Validation and Verification

<step number="7" name="validate_migration">

#### Step 7: Validate Migration

Verify migration completed successfully and all content preserved.

<validation_checks>
  **File Structure Validation**:
  - [ ] tasks/ subdirectory exists
  - [ ] Individual task files created (count matches original task count)
  - [ ] Master tasks.md regenerated
  - [ ] Backup file exists (tasks.md.backup)

  **Content Validation**:
  - [ ] All tasks from original file present in new structure
  - [ ] Task IDs match between master and detail files
  - [ ] Completion status preserved (check [x] counts match)
  - [ ] All acceptance criteria preserved in detail files
  - [ ] All testing requirements preserved
  - [ ] All evidence requirements preserved
  - [ ] Phase organization maintained
  - [ ] Task hierarchy preserved

  **Link Validation**:
  - [ ] All links in master file point to existing detail files
  - [ ] Link format correct: `[details](tasks/task-[ID].md)`
  - [ ] No broken links

  **Quality Validation**:
  - [ ] Master file line count significantly reduced (should be ~50-100 lines)
  - [ ] Detail files contain comprehensive information
  - [ ] No content loss during migration
  - [ ] Formatting preserved

  **Validation Algorithm**:
  1. Count tasks in original backup file
  2. Count tasks in new master file
  3. Count task-*.md files in tasks/ directory
  4. Compare counts (all should match)
  5. Count [x] completed tasks in original
  6. Count [x] completed tasks in new master
  7. Compare completion counts (should match)
  8. Verify all links resolve to existing files
  9. Sample 3-5 detail files for content completeness
</validation_checks>

<validation_instructions>
  VERIFY: Task count matches original
  VERIFY: Completion status preserved
  VERIFY: All links functional
  VERIFY: Content preserved in detail files
  REPORT: Validation results
  ERROR: If validation fails, restore from backup
</validation_instructions>

</step>

<step number="8" name="migration_summary">

#### Step 8: Migration Summary

Generate migration report and present to user.

<migration_report>
  **Migration Report Template**:
  ```
  ✅ Task Structure Migration Complete

  **Migration Details**:
  - **Original File**: tasks.md ([ORIGINAL_LINE_COUNT] lines)
  - **New Master File**: tasks.md ([NEW_LINE_COUNT] lines)
  - **Context Reduction**: [REDUCTION_PERCENTAGE]% ([REDUCTION_LINE_COUNT] lines saved)
  - **Detail Files Created**: [DETAIL_FILE_COUNT] files in tasks/ directory
  - **Backup Created**: tasks.md.backup

  **Task Statistics**:
  - **Total Tasks**: [TOTAL_TASK_COUNT]
  - **Completed Tasks**: [COMPLETED_COUNT] ([COMPLETION_PERCENTAGE]%)
  - **Remaining Tasks**: [REMAINING_COUNT]
  - **Phases**: [PHASE_COUNT]

  **Validation Results**:
  - ✅ All tasks migrated successfully
  - ✅ Completion status preserved
  - ✅ All content preserved in detail files
  - ✅ All links functional
  - ✅ No content loss detected

  **Next Steps**:
  - Master tasks.md now optimized for quick overview
  - Individual task details available in tasks/ subdirectory
  - Use execute-tasks workflow with new structure
  - 90%+ context savings when reviewing task list
  - Original file preserved as tasks.md.backup for reference

  **Benefits Achieved**:
  - 🚀 [REDUCTION_PERCENTAGE]% faster task list loading
  - 📊 Scalable structure for large task lists
  - 🎯 Context-efficient task execution
  - 🔄 Easier task status updates
  ```
</migration_report>

<instructions>
  GENERATE: Migration report with statistics
  CALCULATE: Context reduction percentage
  SUMMARIZE: Migration outcomes
  PRESENT: Report to user
  CONFIRM: Migration successful
</instructions>

</step>

## Error Handling

### Migration Failures

<error_handling>
  **Backup Restoration**:
  - IF migration fails at any step:
    - RESTORE: tasks.md from tasks.md.backup
    - REMOVE: tasks/ directory if partially created
    - LOG: Error details and failure point
    - NOTIFY: User of migration failure and restoration

  **Common Errors**:
  1. **Parse Failure**: Unable to extract tasks from monolithic file
     - Cause: Unexpected format or structure
     - Solution: Manual review and format correction needed
     - Action: Provide detailed error about parsing issue

  2. **File Creation Failure**: Unable to create tasks/ directory or detail files
     - Cause: Permission issues or disk space
     - Solution: Check permissions and disk space
     - Action: Restore backup and notify user

  3. **Validation Failure**: Task count mismatch or content loss
     - Cause: Parsing logic error or incomplete extraction
     - Solution: Restore backup and review extraction logic
     - Action: Notify user with specific validation failures

  4. **Link Generation Failure**: Broken links in master file
     - Cause: Filename sanitization issue or path error
     - Solution: Fix sanitization logic and regenerate
     - Action: Restore backup and retry with fixes
</error_handling>

### Recovery Process

<recovery_instructions>
  IF migration fails:
    1. STOP immediately at failure point
    2. PRESERVE error information and logs
    3. RESTORE original tasks.md from backup
    4. REMOVE partially created tasks/ directory
    5. NOTIFY user with error details
    6. PROVIDE manual migration guidance if needed
</recovery_instructions>

## Migration Skip Scenarios

<skip_scenarios>
  **When to Skip Migration**:
  1. **Already Optimized**: tasks/ subdirectory exists and structure is correct
  2. **Minimal Tasks**: tasks.md < 100 lines (already concise)
  3. **No tasks.md**: File doesn't exist (nothing to migrate)
  4. **User Preference**: User explicitly requests to skip migration
  5. **Custom Format**: Non-standard task format requiring manual review

  **Skip Message**:
  ```
  ℹ️ Task structure migration skipped

  **Reason**: [SKIP_REASON]

  **Current Structure**:
  - [STRUCTURE_DESCRIPTION]

  **Recommendation**: [RECOMMENDATION if applicable]
  ```
</skip_scenarios>

## Best Practices

### Migration Timing

<best_practices>
  **Optimal Migration Timing**:
  - Before starting new task execution
  - During spec enhancement workflow
  - When task list grows beyond 20 tasks
  - When context consumption becomes noticeable

  **Pre-Migration Checklist**:
  - [ ] Commit any pending changes to tasks.md
  - [ ] Verify no active task execution in progress
  - [ ] Ensure spec directory is writable
  - [ ] Confirm adequate disk space available

  **Post-Migration Verification**:
  - [ ] Review master tasks.md for accuracy
  - [ ] Spot-check 3-5 detail files for completeness
  - [ ] Verify all links work correctly
  - [ ] Test execute-tasks workflow with new structure
  - [ ] Archive backup file after successful verification
</best_practices>

## Integration with Agent OS Workflows

### Execute-Tasks Integration

<workflow_integration>
  **No Workflow Changes Required**:
  - execute-tasks.md already supports split structure
  - Automatically detects and uses detail files
  - Falls back to monolithic if detail files not present
  - Migration is transparent to execution workflow

  **Enhanced Performance**:
  - Task selection: Only loads master tasks.md
  - Task execution: Only loads specific detail file needed
  - Progress tracking: Uses lightweight master file
  - Context savings: 90%+ reduction in repeated context consumption
</workflow_integration>

## Conclusion

The migration process is designed to be:
- **Safe**: Automatic backup and validation
- **Reliable**: Comprehensive error handling and recovery
- **Transparent**: Clear reporting and verification
- **Efficient**: 90%+ context reduction achieved
- **Migration Recommended**: Split format is the standard for optimal performance

Migration transforms large, unwieldy task files into efficient, scalable structures that support Agent OS's orchestrated execution model while maintaining all original content and completion status.
