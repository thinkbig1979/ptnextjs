---
description: Migration workflow for converting monolithic tasks.md to optimized split structure
version: 1.0
encoding: UTF-8
---

# Migrate Task Structure

## Overview

Migrate monolithic tasks.md to Agent OS v2.1.0 split structure: 90%+ context reduction.

**Benefits**: 90%+ reduction, scalable (50-200+ tasks), only load details when needed, easier maintenance

## Detection Logic

<detection_criteria>
  **Monolithic Indicators** (any triggers migration):
  - [ ] tasks.md > 200 lines
  - [ ] tasks/ subdirectory missing
  - [ ] Detailed acceptance criteria inline (5+ bullets per task)
  - [ ] "Testing Requirements" / "Evidence Required" sections inline
  - [ ] "Context Requirements" / "Quality Gates" sections inline

  **Decision Matrix**:
  - tasks.md > 200 lines AND no tasks/: **MIGRATE (High Priority)**
  - Verbose inline details: **MIGRATE (Medium Priority)**
  - tasks/ exists: **SKIP (Already optimized)**
  - tasks.md < 100 lines: **SKIP (Already concise/minimal)**
</detection_criteria>

<split_format_check>
  **Optimized Format Indicators**:
  - [ ] tasks/ subdirectory with task-*.md files
  - [ ] Master tasks.md links to detail files
  - [ ] Master ~50-100 lines for 10-20 tasks
  - [ ] Individual files contain comprehensive details
</split_format_check>

## Migration Process

### Phase 1: Pre-Migration Preparation

<step number="1" name="backup_original_file">

**Step 1: Backup**

```bash
cp tasks.md tasks.md.backup
```

VERIFY: Backup created with identical content
</step>

<step number="2" name="parse_monolithic_file">

**Step 2: Parse Monolithic File**

<parsing_logic>
  **Task Identification**:
  - Format: `- [ ] **task-id** - Task Title` or `- [ ] 1.2 Task Title`
  - Completed: `- [x] **task-id** - Task Title`
  - Subtasks: Two+ spaces before `- [ ]`
  - Sections: `##` or `###` followed by phase name

  **Extract**:
  1. Task ID (from bold/numeric)
  2. Title (after ID and hyphen)
  3. Status (`[ ]` vs `[x]`)
  4. Indentation level (hierarchy)
  5. Details (indented content until next task)
  6. Agent, time estimate, dependencies
  7. Specifics, acceptance criteria
  8. Testing, evidence, context requirements
  9. Quality gates

  **Data Structure**:
  ```
  Task {
    id, title, status, phase, agent, time_estimate,
    dependencies[], specifics[], acceptance_criteria[],
    testing_requirements{}, evidence_required[],
    context_requirements[], quality_gates[],
    implementation_notes[], related_files[],
    indentation_level, original_content
  }
  ```
</parsing_logic>

ACTION: Read file, parse line-by-line, extract metadata, build task array, count for verification
</step>

<step number="3" name="analyze_task_structure">

**Step 3: Analyze Structure**

<analysis_logic>
  **Phase Detection**: Identify section headers, group tasks, preserve ordering
  **Dependency Mapping**: Extract explicit/implicit, validate no circular
  **Hierarchy Analysis**: Map parent-child, preserve indentation, maintain groupings
  **Metadata Aggregation**: Count total, calculate time, identify agents, track completion
</analysis_logic>

ACTION: Analyze structure, map dependencies, aggregate metadata
</step>

### Phase 2: File Generation

<step number="4" name="create_directory_structure">

**Step 4: Create Directory**

```bash
mkdir -p tasks/
```

VERIFY: Directory exists and writable
</step>

<step number="5" name="generate_individual_task_files">

**Step 5: Generate Individual Task Files**

<individual_file_generation>
  **Filename**: `task-[TASK_ID].md`
  - Sanitize ID: Replace spaces/dots/special chars with hyphens
  - Lowercase for consistency
  - Examples: task-pre-1.md, task-impl-comp1-core.md

  **Template**:
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
  [DETAILED_DESCRIPTION or TITLE if none]

  ## Specifics
  [EXTRACTED_SPECIFICS or "See acceptance criteria"]

  ## Acceptance Criteria
  [EXTRACTED_CRITERIA]

  ## Testing Requirements
  [EXTRACTED_TESTING if present]

  ## Evidence Required
  [EXTRACTED_EVIDENCE if present]

  ## Context Requirements
  [EXTRACTED_CONTEXT if present]

  ## Implementation Notes
  [EXTRACTED_NOTES if present]

  ## Quality Gates
  [EXTRACTED_GATES if present]

  ## Related Files
  - Spec: ../../spec.md
  - Technical Spec: ../../technical-spec.md
  - Master Task List: ../tasks.md
  [ADDITIONAL_FILES if present]
  ```

  **Rules**:
  - Omit sections with no content
  - Preserve exact formatting
  - Maintain checkbox states
  - Include all subsections/bullets
  - Keep original markdown
</individual_file_generation>

FOR each task:
  GENERATE filename from sanitized ID
  POPULATE template with extracted content
  WRITE file to tasks/
  VERIFY creation

LOG: "Generated [COUNT] files"
</step>

<step number="6" name="generate_master_tasks_file">

**Step 6: Generate Master tasks.md**

<master_file_generation>
  **Template**:
  ```markdown
  # Spec Tasks

  ## Metadata
  - **Spec Name**: [SPEC_NAME]
  - **Generation Date**: [CURRENT_DATE]
  - **Total Tasks**: [TASK_COUNT]
  - **Completed**: [COMPLETED_COUNT]/[TASK_COUNT]
  - **Estimated Total Time**: [TOTAL_TIME]
  - **Migrated**: ✅ Split structure on [MIGRATION_DATE]

  ## [PHASE_1_NAME]

  - [STATUS] **[TASK_ID]** - [TASK_TITLE] → [details](tasks/task-[SANITIZED_ID].md)
    - **Agent**: [AGENT_NAME]
    - **Estimated Time**: [TIME_ESTIMATE]
    - **Dependencies**: [DEPENDENCY_LIST]

  [SUBTASKS with indentation]

  ## [PHASE_2_NAME]
  ...

  ## Task Summary
  - **Total**: [TOTAL_COUNT]
  - **Completed**: [COMPLETED_COUNT] ([PERCENTAGE]%)
  - **Remaining**: [REMAINING_COUNT]
  - **Total Time**: [TOTAL_TIME]
  ```

  **Rules**:
  - ONE line per task: ID, title, link
  - Indented lines: Agent, time, dependencies ONLY
  - NO verbose criteria, testing, evidence inline
  - Links: `[details](tasks/task-[SANITIZED_ID].md)`
  - Preserve hierarchy with indentation
  - Maintain phase organization
  - Preserve completion checkboxes
</master_file_generation>

ACTION: Build from analyzed structure, include only essential metadata, link to detail files, calculate statistics, write new tasks.md
</step>

### Phase 3: Validation and Verification

<step number="7" name="validate_migration">

**Step 7: Validate Migration**

<validation_checks>
  **Structure**:
  - [ ] tasks/ subdirectory exists
  - [ ] Individual files created (count matches original)
  - [ ] Master tasks.md regenerated
  - [ ] Backup file exists (tasks.md.backup)

  **Content**:
  - [ ] All tasks from original present
  - [ ] Task IDs match master and details
  - [ ] Completion status preserved ([x] counts match)
  - [ ] All acceptance criteria in detail files
  - [ ] All testing/evidence/context preserved
  - [ ] Phase organization maintained
  - [ ] Task hierarchy preserved

  **Links**:
  - [ ] All links point to existing files
  - [ ] Format correct: `[details](tasks/task-[ID].md)`
  - [ ] No broken links

  **Quality**:
  - [ ] Master ~50-100 lines (significantly reduced)
  - [ ] Detail files comprehensive
  - [ ] No content loss
  - [ ] Formatting preserved

  **Algorithm**:
  1. Count tasks in backup
  2. Count tasks in new master
  3. Count task-*.md files
  4. Compare counts (must match)
  5. Count [x] completed in backup
  6. Count [x] completed in master
  7. Compare completion (must match)
  8. Verify all links resolve
  9. Sample 3-5 detail files for completeness
</validation_checks>

ACTION: Verify counts, status, links, content; report results; restore if validation fails
</step>

<step number="8" name="migration_summary">

**Step 8: Migration Summary**

<migration_report>
  ```
  ✅ Task Structure Migration Complete

  **Migration Details**:
  - **Original**: tasks.md ([ORIGINAL_LINES] lines)
  - **New Master**: tasks.md ([NEW_LINES] lines)
  - **Context Reduction**: [REDUCTION_%]% ([LINES] saved)
  - **Detail Files**: [COUNT] in tasks/
  - **Backup**: tasks.md.backup

  **Statistics**:
  - **Total**: [TOTAL] tasks
  - **Completed**: [COMPLETED] ([%]%)
  - **Remaining**: [REMAINING]
  - **Phases**: [PHASE_COUNT]

  **Validation**:
  - ✅ All tasks migrated
  - ✅ Completion status preserved
  - ✅ Content preserved in details
  - ✅ All links functional
  - ✅ No content loss

  **Next Steps**:
  - Master optimized for quick overview
  - Details in tasks/ subdirectory
  - Use execute-tasks workflow
  - 90%+ context savings
  - Original preserved in tasks.md.backup

  **Benefits**:
  - 🚀 [%]% faster loading
  - 📊 Scalable for large lists
  - 🎯 Context-efficient execution
  - 🔄 Easier status updates
  ```
</migration_report>

ACTION: Generate report with statistics, summarize outcomes, present to user
</step>

## Error Handling

<error_handling>
  **Backup Restoration**:
  - IF migration fails: Restore from backup, remove tasks/, log error, notify user

  **Common Errors**:
  1. **Parse Failure**: Unexpected format
     - Solution: Manual review, format correction
     - Action: Detailed error about parsing issue

  2. **File Creation Failure**: Permission/disk issues
     - Solution: Check permissions, disk space
     - Action: Restore backup, notify

  3. **Validation Failure**: Count mismatch, content loss
     - Solution: Restore backup, review extraction
     - Action: Notify with specific failures

  4. **Link Generation Failure**: Broken links
     - Solution: Fix sanitization, regenerate
     - Action: Restore backup, retry
</error_handling>

<recovery_instructions>
  IF failure:
  1. STOP at failure point
  2. PRESERVE error info and logs
  3. RESTORE tasks.md from backup
  4. REMOVE partial tasks/ directory
  5. NOTIFY user with error details
  6. PROVIDE manual migration guidance if needed
</recovery_instructions>

## Migration Skip Scenarios

<skip_scenarios>
  **Skip When**:
  1. **Already Optimized**: tasks/ exists, structure correct
  2. **Minimal Tasks**: tasks.md < 100 lines (already concise)
  3. **No tasks.md**: File doesn't exist
  4. **User Preference**: Explicit skip request
  5. **Custom Format**: Non-standard requiring manual review

  **Skip Message**:
  ```
  ℹ️ Task structure migration skipped

  **Reason**: [SKIP_REASON]
  **Current**: [STRUCTURE_DESCRIPTION]
  **Recommendation**: [IF_APPLICABLE]
  ```
</skip_scenarios>

## Best Practices

<best_practices>
  **Optimal Timing**:
  - Before starting new task execution
  - During spec enhancement workflow
  - When task list > 20 tasks
  - When context consumption noticeable

  **Pre-Migration Checklist**:
  - [ ] Commit pending changes to tasks.md
  - [ ] No active task execution in progress
  - [ ] Spec directory writable
  - [ ] Adequate disk space

  **Post-Migration Verification**:
  - [ ] Review master tasks.md
  - [ ] Spot-check 3-5 detail files
  - [ ] Verify links work
  - [ ] Test execute-tasks workflow
  - [ ] Archive backup after verification
</best_practices>

## Integration with Agent OS Workflows

<workflow_integration>
  **No Changes Required**:
  - execute-tasks.md supports split structure
  - Automatically detects and uses detail files
  - Falls back to monolithic if not present
  - Migration transparent to execution

  **Enhanced Performance**:
  - Task selection: Only loads master
  - Task execution: Only loads specific detail
  - Progress tracking: Uses lightweight master
  - Context savings: 90%+ reduction
</workflow_integration>

## Conclusion

Migration designed to be:
- **Safe**: Automatic backup and validation
- **Reliable**: Comprehensive error handling and recovery
- **Transparent**: Clear reporting and verification
- **Efficient**: 90%+ context reduction
- **Recommended**: Split format is standard for optimal performance

Transforms large task files into efficient, scalable structures supporting Agent OS orchestrated execution while maintaining all content and completion status.
