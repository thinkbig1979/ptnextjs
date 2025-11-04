# Triage Command

## Purpose

Present findings, decisions, or issues one by one for interactive triage to determine which items should be tracked as actionable todos in the Agent OS system.

## Overview

<command_purpose>
  Interactive triage workflow for processing findings from:
  - Quality validation (validate-quality.md)
  - Code review findings
  - Security audit results
  - Performance analysis
  - Any categorized findings requiring tracking and resolution
</command_purpose>

## Important Constraints

**CRITICAL: DO NOT CODE ANYTHING DURING TRIAGE!**

<constraints>
  - Triage is ONLY for decision-making and todo creation
  - No implementation work during triage
  - Focus on presenting findings clearly and capturing decisions
  - Keep momentum - process all findings efficiently
</constraints>

## Prerequisites

<requirements>
  - Findings available from validate-quality.md or other sources
  - Findings in standardized format (severity, category, location, description, recommendation, effort)
  - Access to todo directory structure (typically in spec folder or project root)
  - State directory for session persistence (`.triage-state/` in working directory)
</requirements>

<pre_flight_check>
  EXECUTE: @.agent-os/instructions/meta/pre-flight.md
</pre_flight_check>

## Pause/Resume System

<pause_resume_overview>
  Triage sessions can be paused at any point and resumed later without losing progress.
  State is automatically persisted during session and restored on resume.
</pause_resume_overview>

<state_file_format>

  ### State File Structure

  State files are stored in `.triage-state/` directory and contain complete session state:

  ```yaml
  # .triage-state/triage-session-[timestamp].yml

  session:
    id: "[SESSION_ID]"                    # Unique session identifier
    started_at: "[ISO_TIMESTAMP]"         # Session start time
    paused_at: "[ISO_TIMESTAMP]"          # Last pause/save time
    source_type: "[SOURCE_TYPE]"          # quality_validation|code_review|etc.
    source_file: "[PATH_TO_FINDINGS]"     # Original findings file path
    todos_directory: "[PATH_TO_TODOS]"    # Where todos are being created

  progress:
    total_findings: [NUMBER]              # Total findings in session
    triaged_count: [NUMBER]               # Findings with decisions made
    remaining_count: [NUMBER]             # Findings not yet triaged
    current_finding_index: [NUMBER]       # Index of current/next finding (0-based)
    todos_created: [NUMBER]               # Total todos created
    findings_skipped: [NUMBER]            # Total findings skipped
    custom_modifications: [NUMBER]        # Total custom modifications made

  time_estimation:
    session_start_time: "[ISO_TIMESTAMP]"
    use_actual_average: [BOOLEAN]         # Whether using actual vs default average
    average_time_per_finding: [DECIMAL]   # Current average (minutes)
    finding_durations:                     # Rolling window of last 10 durations
      - [DECIMAL]                          # Duration in minutes
      - [DECIMAL]
      # ... up to 10 entries
    current_finding_start_time: "[ISO_TIMESTAMP]|null"

  decisions:
    created_todos:                         # List of todos created
      - issue_id: "[ID]"
        filename: "[FILENAME]"
        title: "[TITLE]"
        priority: "[p1|p2|p3]"
        finding_index: [NUMBER]            # Which finding this came from
        created_at: "[ISO_TIMESTAMP]"

    skipped_findings:                      # List of skipped findings
      - finding_index: [NUMBER]
        finding_id: "[ID]"
        title: "[TITLE]"
        reason: "[REASON|null]"
        skipped_at: "[ISO_TIMESTAMP]"

    custom_modifications:                  # List of modified findings
      - finding_index: [NUMBER]
        modifications: "[DESCRIPTION]"
        modified_at: "[ISO_TIMESTAMP]"
        final_decision: "[yes|next|pending]"

  findings:
    # Complete list of findings from original source
    # Stored to enable resume without re-loading source
    - finding_id: "[ID]"
      severity: "[P1|P2|P3]"
      category: "[CATEGORY]"
      title: "[TITLE]"
      description: "[DESCRIPTION]"
      location: "[LOCATION]"
      problem: "[PROBLEM]"
      impact: "[IMPACT]"
      proposed_solution: "[SOLUTION]"
      effort: "[Small|Medium|Large]"
      source_agents: ["[AGENT1]", "[AGENT2]"]
      # ... all other finding fields
  ```

  **State File Naming:**
  - Format: `triage-session-[YYYYMMDD-HHMMSS].yml`
  - Example: `triage-session-20251026-143022.yml`
  - One state file per session (not per finding)
  - Latest state file is used for resume

  **State Directory Structure:**
  ```
  .triage-state/
  ├── triage-session-20251026-143022.yml   # Active or completed session
  ├── triage-session-20251025-091544.yml   # Previous session
  └── README.md                             # Explanation of state files
  ```

</state_file_format>

<resume_detection>

  ### Resume Detection and Prompt

  **On triage command start**, check for existing state:

  1. **Check for state directory:**
     ```bash
     if [ -d ".triage-state" ]; then
       # Find most recent state file
       latest_state=$(ls -t .triage-state/triage-session-*.yml 2>/dev/null | head -1)
     fi
     ```

  2. **If state file exists:**
     ```bash
     # Check if session has remaining findings
     remaining=$(grep "remaining_count:" "$latest_state" | awk '{print $2}')

     if [ "$remaining" -gt 0 ]; then
       # Session is resumable
       PROMPT_FOR_RESUME=true
     fi
     ```

  3. **Present resume options to user:**
     ```markdown
     🔄 Previous triage session found!

     Session Details:
     - Started: [START_TIME] ([TIME_AGO])
     - Progress: [TRIAGED]/[TOTAL] findings ([PERCENT]%)
     - Todos created: [COUNT]
     - Findings skipped: [COUNT]
     - Remaining: [REMAINING] findings
     - Estimated time to complete: [MINUTES] min

     What would you like to do?
     1. resume - Continue from where you left off (Finding #[NEXT])
     2. restart - Start fresh (previous session will be archived)
     3. view - View previous session summary before deciding
     ```

  4. **Handle user decision:**
     - **resume (1)**: Load state from file, continue from current_finding_index
     - **restart (2)**: Archive old state file, start new session
     - **view (3)**: Show detailed summary, then re-prompt for resume/restart

  **Resume Implementation:**

  ```
  WHEN user chooses "resume":
    1. LOAD state file (YAML parse)
    2. RESTORE all progress tracking variables
    3. RESTORE time estimation data
    4. RESTORE decisions (created_todos, skipped_findings lists)
    5. RESTORE findings list
    6. SET current_index = state.progress.current_finding_index
    7. DISPLAY resume confirmation:
       "✅ Session resumed! Continuing from Finding #[NEXT] of [TOTAL]"
    8. CONTINUE with Step 2 (present_findings) starting at current_index
  ```

  **Restart Implementation:**

  ```
  WHEN user chooses "restart":
    1. ARCHIVE old state file:
       mv .triage-state/triage-session-[old].yml \
          .triage-state/archived-[old].yml
    2. START fresh session (proceed to Step 0.5: Session Initialization)
    3. DISPLAY restart confirmation:
       "🔄 Starting fresh triage session. Previous session archived."
  ```

</resume_detection>

<process_flow>

<step number="0" name="session_initialization">

### Step 0: Session Initialization and Resume Detection

Initialize triage session and check for existing state to resume.

<resume_check>

  **Check for Previous Session:**

  1. **Look for state directory:**
     ```bash
     if [ -d ".triage-state" ]; then
       latest_state=$(ls -t .triage-state/triage-session-*.yml 2>/dev/null | head -1)
     fi
     ```

  2. **If state file found with remaining findings:**

     **Parse state file** to extract:
     - session.started_at (start time)
     - progress.total_findings
     - progress.triaged_count
     - progress.remaining_count
     - progress.todos_created
     - progress.findings_skipped

     **Calculate time since start:**
     - time_ago = current_time - started_at
     - Format: "2 hours ago" or "1 day ago"

     **Present resume prompt:**
     ```markdown
     🔄 Previous triage session found!

     Session Details:
     - Started: [START_TIME] ([TIME_AGO])
     - Progress: [TRIAGED]/[TOTAL] findings ([PERCENT]%)
     - Todos created: [COUNT]
     - Findings skipped: [COUNT]
     - Remaining: [REMAINING] findings
     - Estimated time to complete: ~[MINUTES] min

     What would you like to do?
     1. resume - Continue from where you left off (Finding #[NEXT])
     2. restart - Start fresh (previous session will be archived)
     3. view - View previous session summary before deciding
     ```

     **Wait for user decision**

  3. **Handle user decision:**

     **OPTION 1: resume**
     ```
     ACTION: Load state from file
     STEPS:
       1. Parse YAML state file
       2. Restore all variables:
          - session metadata (id, started_at, source info)
          - progress counters (all metrics)
          - time_estimation data (durations, averages)
          - decisions lists (created_todos, skipped_findings, custom_modifications)
          - findings array (complete list)
       3. Set resuming_session = true
       4. Set current_finding_index = state.progress.current_finding_index
       5. Display: "✅ Session resumed! Continuing from Finding #[NEXT] of [TOTAL]"
       6. SKIP to Step 2 (present_findings) starting at current_finding_index
     ```

     **OPTION 2: restart**
     ```
     ACTION: Archive old state, start fresh
     STEPS:
       1. Archive old state:
          timestamp=$(date +%Y%m%d-%H%M%S)
          mv .triage-state/triage-session-*.yml \
             .triage-state/archived-session-$timestamp.yml
       2. Set resuming_session = false
       3. Display: "🔄 Starting fresh triage session. Previous session archived."
       4. PROCEED to Step 1 (load_findings) for new session
     ```

     **OPTION 3: view**
     ```
     ACTION: Display detailed summary
     STEPS:
       1. Parse state file completely
       2. Display session summary:
          - All session metadata
          - Complete progress breakdown
          - List of created todos (with titles)
          - List of skipped findings (with reasons)
          - Time estimation details
       3. RE-PROMPT for resume/restart decision (show options 1 and 2 only)
       4. HANDLE decision (resume or restart)
     ```

</resume_check>

<new_session_init>

  **If no previous state found (or user chose restart):**

  1. **Create session ID:**
     ```
     session_id = "triage-" + timestamp (YYYYMMDD-HHMMSS)
     ```

  2. **Create state directory if needed:**
     ```bash
     mkdir -p .triage-state
     ```

  3. **Initialize session variables:**
     ```
     session = {
       id: session_id,
       started_at: current_timestamp,
       paused_at: null,
       source_type: null,  # Set in Step 1
       source_file: null,  # Set in Step 1
       todos_directory: null  # Set in Step 1
     }

     progress = {
       total_findings: 0,  # Set in Step 1
       triaged_count: 0,
       remaining_count: 0,  # Set in Step 1
       current_finding_index: 0,
       todos_created: 0,
       findings_skipped: 0,
       custom_modifications: 0
     }

     time_estimation = {
       session_start_time: current_timestamp,
       use_actual_average: false,
       average_time_per_finding: 1.5,
       finding_durations: [],
       current_finding_start_time: null
     }

     decisions = {
       created_todos: [],
       skipped_findings: [],
       custom_modifications: []
     }

     findings = []  # Populated in Step 1
     ```

  4. **Set resuming_session = false**

  5. **PROCEED to Step 1 (load_findings)**

</new_session_init>

<instructions>
  ACTION: Check for previous session state
  IF resumable state exists: PROMPT user for resume/restart/view
  IF user resumes: LOAD state and SKIP to Step 2
  IF user restarts OR no state: INITIALIZE new session
  PROCEED: To Step 1 for new session, or Step 2 for resumed session
</instructions>

</step>

<step number="1" name="load_findings">

### Step 1: Load and Prepare Findings

Load findings from the quality validation findings file or from provided input.

<finding_sources>
  <quality_validation>
    IF findings come from validate-quality:
      READ: [validation_target]/.quality-validation/findings-[timestamp].yml
      EXTRACT: All findings with metadata
      SORT: By severity (P1 → P2 → P3) then by ROI score
  </quality_validation>

  <direct_input>
    IF findings provided directly:
      PARSE: Finding format from user input or agent outputs
      VALIDATE: Required fields present
      SORT: By severity and priority
  </direct_input>

  <code_review>
    IF findings from code review:
      READ: Review findings from review agent outputs
      CONSOLIDATE: Multiple agent findings
      DEDUPLICATE: Similar findings
      SORT: By severity and impact
  </code_review>
</finding_sources>

<finding_preparation>
  PREPARE triage session:
    - Count total findings
    - Calculate estimated time (avg 1-2 min per finding)
    - Group by severity for reporting
    - Initialize progress tracking counters:
      * total_findings = count of all findings
      * triaged_count = 0
      * remaining_count = total_findings
      * todos_created = 0
      * findings_skipped = 0
      * custom_modifications = 0
      * session_start_time = current timestamp
      * average_time_per_finding = 1.5 minutes (default, updated dynamically)
    - Initialize time estimation tracking:
      * finding_durations = [] (rolling window of last 10 finding times)
      * current_finding_start_time = null (set when starting each finding)
      * use_actual_average = false (switch to true after 5 findings)
</finding_preparation>

<instructions>
  ACTION: Load findings from source
  VALIDATE: Finding format and required fields
  SORT: By priority (P1 first, then P2, then P3)
  PREPARE: Progress tracking and session metrics
</instructions>

</step>

<step number="2" name="present_findings">

### Step 2: Present Findings Iteratively

Present each finding one by one in standardized format with progress tracking.

<finding_presentation_format>
  FOR each finding in sorted order:

    ```markdown
    ---
    Progress: Finding #[X] of [TOTAL] ([PERCENT]% complete) | Estimated time remaining: [MINUTES] min

    Issue #[FINDING_ID]: [Brief Title]

    Severity: [🔴 P1 (CRITICAL) | 🟡 P2 (IMPORTANT) | 🔵 P3 (NICE-TO-HAVE)]

    Category: [Security|Performance|Architecture|Quality|Data|Patterns|Simplicity]

    Description:
    [Detailed explanation of the issue or improvement]

    Location: [file_path:line_number]

    Problem:
    [What's wrong or could be better - step by step if applicable]

    Impact:
    [What could happen if not addressed / why this matters]

    Proposed Solution:
    [How to fix it - specific actionable steps]

    Estimated Effort: [Small (< 2 hours) | Medium (2-8 hours) | Large (> 8 hours)]

    Source: [Agent names that identified this finding]

    ---
    Do you want to add this to the todo list?
    1. yes - create todo file
    2. next - skip this item
    3. custom - modify before creating

    (Type 'pause' at any time to save progress and exit)
    ```
</finding_presentation_format>

<progress_tracking>

  ### Progress Calculation

  Calculate and display comprehensive progress metrics throughout the triage process:

  **Core Metrics:**
  - **Total Findings**: Count of all findings from validate-quality or other sources
  - **Triaged**: Count of findings with user decisions (yes/custom/next)
  - **Remaining**: Total - Triaged
  - **Progress Percentage**: (Triaged / Total) * 100%
  - **Estimated Time Remaining**: Remaining * Average Time Per Finding

  **Progress Display Format:**
  ```
  📊 Triage Progress: 15/42 findings (36%)
  ⏱️  Estimated time remaining: ~27 minutes (assuming 1min/finding)
  ✅ Todos created: 8 | ⏭️  Skipped: 7 | ✏️  Modified: 2
  ```

  **Display Requirements:**

  DISPLAY progress header on each finding:
    - Current finding number / Total findings
    - Percentage complete
    - Estimated time remaining (based on average time per finding)
    - Running totals: todos created, items skipped, custom modifications

  UPDATE progress after each decision:
    - Increment findings processed (triaged count)
    - Update average processing time
    - Recalculate time remaining
    - Recalculate progress percentage
    - Update running totals display

  TRACK metrics:
    - Start time of triage session
    - Average time per finding (dynamic, updated after each finding)
    - Todos created count
    - Findings skipped count
    - Custom modifications count
    - Total findings count
    - Triaged findings count
    - Remaining findings count

  **Implementation Notes:**
  - Initialize all counters at session start (Step 1)
  - Update progress after EVERY finding decision (in Step 3)
  - Calculate percentage as integer: `Math.floor((triaged / total) * 100)`
  - Calculate time remaining as: `remaining * average_time_per_finding`
  - Display time in minutes if < 60, otherwise in hours and minutes
  - Use default of 1-2 minutes per finding until actual average is established
</progress_tracking>

<time_estimation_algorithm>

  ### Time Estimation Algorithm

  Implement dynamic time estimation that learns from actual triage speeds and adjusts for finding complexity.

  **Algorithm Overview:**

  Track actual time spent per finding and calculate rolling averages with complexity adjustments to provide accurate remaining time estimates.

  **Dynamic Average Calculation:**

  BEFORE presenting each finding:
    - Record current_finding_start_time = current timestamp
    - Mark finding as "in progress"

  AFTER each finding decision (yes/next/custom final decision):
    - Calculate finding_duration = current timestamp - current_finding_start_time
    - Add finding_duration to finding_durations array
    - If finding_durations.length > 10:
        * Remove oldest duration (keep rolling window of last 10)
    - Calculate actual_average = sum(finding_durations) / finding_durations.length
    - Apply complexity adjustment to actual_average (see below)
    - Update average_time_per_finding = adjusted_average

  SWITCHING to actual average:
    - IF finding_durations.length >= 5:
        * Set use_actual_average = true
        * Use calculated actual_average instead of default 1.5 minutes
    - ELSE:
        * Continue using default 1.5 minutes per finding

  BOUNDS checking:
    - Minimum average: 0.5 minutes (30 seconds)
    - Maximum average: 5.0 minutes
    - Clamp actual_average to this range to prevent unrealistic estimates

  **Complexity Adjustment:**

  Analyze remaining findings to adjust time estimates based on complexity factors:

  FOR each remaining finding:
    complexity_multiplier = 1.0

    APPLY severity adjustment:
      - P1 findings: complexity_multiplier += 0.5 (50% more time - higher complexity)
      - P2 findings: no adjustment (standard time)
      - P3 findings: complexity_multiplier -= 0.25 (25% less time - simpler)

    APPLY description length adjustment:
      - IF finding.description.length > 500 characters:
          * complexity_multiplier += 0.25 (25% more time - complex issue)

    APPLY multi-file adjustment:
      - IF finding affects multiple files (detected from location field):
          * complexity_multiplier += 0.25 (25% more time - broader scope)

    adjusted_time = base_average * complexity_multiplier
    total_estimated_time += adjusted_time

  CALCULATE overall complexity factor:
    - Count P1s, P2s, P3s in remaining findings
    - Calculate weighted average of complexity multipliers
    - Apply to base average for display

  **Enhanced Progress Display:**

  ```
  📊 Triage Progress: 15/42 findings (36%)
  ⏱️  Estimated time remaining: ~27 minutes
     ├─ Based on last 10 findings (avg: 1.8 min/finding)
     └─ Adjusted for complexity (12 P1s, 8 P2s remaining)
  ✅ Todos created: 8 | ⏭️  Skipped: 7 | ✏️  Modified: 2
  ```

  **Display Requirements:**

  WHEN use_actual_average is false (< 5 findings processed):
    ```
    ⏱️  Estimated time remaining: ~41 minutes (initial estimate)
    ```

  WHEN use_actual_average is true (>= 5 findings processed):
    ```
    ⏱️  Estimated time remaining: ~27 minutes
       ├─ Based on last [N] findings (avg: [X.X] min/finding)
       └─ Adjusted for complexity ([P1_COUNT] P1s, [P2_COUNT] P2s remaining)
    ```

  **Calculation Example:**

  Given:
    - Last 10 finding durations: [1.2, 2.1, 1.5, 2.8, 1.9, 1.7, 2.3, 1.4, 2.0, 1.8]
    - Actual average: 1.87 minutes
    - Remaining findings: 12 P1s, 8 P2s, 7 P3s

  Calculate:
    - P1 estimated time: 12 * (1.87 * 1.5) = 33.66 minutes
    - P2 estimated time: 8 * (1.87 * 1.0) = 14.96 minutes
    - P3 estimated time: 7 * (1.87 * 0.75) = 9.81 minutes
    - Total: 58.43 minutes ≈ 58 minutes (or "~1 hour")

  Display:
    ```
    ⏱️  Estimated time remaining: ~58 minutes (~1 hour)
       ├─ Based on last 10 findings (avg: 1.9 min/finding)
       └─ Adjusted for complexity (12 P1s, 8 P2s, 7 P3s remaining)
    ```

  **Implementation Notes:**

  - Store finding_durations as array of decimals (minutes with 2 decimal places)
  - Convert timestamps to minutes for calculations
  - Round displayed averages to 1 decimal place
  - Round estimated time to nearest minute
  - If estimated time > 60 minutes, also show hours (e.g., "~73 minutes (~1.2 hours)")
  - Update estimates AFTER each finding decision, not before
  - Track current_finding_start_time separately from session_start_time

</time_estimation_algorithm>

<instructions>
  ACTION: Present each finding in standardized format
  DISPLAY: Progress tracking header
  PROVIDE: Clear decision options (yes/next/custom)
  WAIT: For user decision before proceeding
</instructions>

</step>

<step number="3" name="handle_user_decisions">

### Step 3: Handle User Decisions

Process user's decision for each finding and take appropriate action.

<decision_handling>
  <option_yes>
    WHEN user says "yes" OR "1":

    1. **Determine next issue ID:**
       ```bash
       # Find highest existing issue number in todos directory
       ls todos/ 2>/dev/null | grep -o '^[0-9]\+' | sort -n | tail -1
       # If no todos exist, start at 001
       # Else increment by 1
       ```

    2. **Generate filename:**
       ```
       Format: {issue_id}-pending-{priority}-{brief-slug}.md

       WHERE:
         issue_id: 3-digit zero-padded number (e.g., 042)
         priority: p1 | p2 | p3 (from severity)
         brief-slug: kebab-case description (max 5 words)

       EXAMPLES:
         - 042-pending-p1-sql-injection-users.md
         - 043-pending-p2-n-plus-one-query.md
         - 044-pending-p3-simplify-validation.md
       ```

    3. **Create todo file:**
       Use todo template (see Step 4 for template)
       Populate with finding data
       Save to todos/ directory

    4. **Confirm creation:**
       "✅ Created: `{filename}` - Issue #{issue_id}"

    5. **Update progress tracking:**
       - Increment todos_created counter
       - Increment triaged_count
       - Decrement remaining_count
       - Add to created_todos list for summary
       - **Update time estimation (see time_estimation_algorithm):**
         * Calculate finding_duration = current_timestamp - current_finding_start_time
         * Add finding_duration to finding_durations array
         * If finding_durations.length > 10, remove oldest duration
         * Calculate actual_average from finding_durations
         * If finding_durations.length >= 5, set use_actual_average = true
         * Apply complexity adjustments to estimate remaining time
         * Clamp average to 0.5-5.0 minute bounds
       - Recalculate progress_percentage = (triaged_count / total_findings) * 100
       - Recalculate estimated_time_remaining using complexity-adjusted algorithm
       - Update TodoWrite if tracking progress

    6. **Save state to file:**
       ```
       CALL: save_session_state()
       - Update progress.current_finding_index to next finding
       - Set session.paused_at to current timestamp
       - Write complete state to .triage-state/triage-session-[id].yml
       ```

    7. **Continue to next finding:**
       PROCEED to next finding in queue
  </option_yes>

  <option_next>
    WHEN user says "next" OR "2":

    1. **Log skipped item:**
       - Record finding ID and title
       - Add to skipped_findings list
       - Note reason if provided by user

    2. **Update progress tracking:**
       - Increment findings_skipped counter
       - Increment triaged_count
       - Decrement remaining_count
       - **Update time estimation (see time_estimation_algorithm):**
         * Calculate finding_duration = current_timestamp - current_finding_start_time
         * Add finding_duration to finding_durations array
         * If finding_durations.length > 10, remove oldest duration
         * Calculate actual_average from finding_durations
         * If finding_durations.length >= 5, set use_actual_average = true
         * Apply complexity adjustments to estimate remaining time
         * Clamp average to 0.5-5.0 minute bounds
       - Recalculate progress_percentage = (triaged_count / total_findings) * 100
       - Recalculate estimated_time_remaining using complexity-adjusted algorithm
       - Update TodoWrite progress

    3. **Save state to file:**
       ```
       CALL: save_session_state()
       - Update progress.current_finding_index to next finding
       - Set session.paused_at to current timestamp
       - Write complete state to .triage-state/triage-session-[id].yml
       ```

    4. **Continue to next finding:**
       PROCEED to next finding in queue
  </option_next>

  <option_custom>
    WHEN user says "custom" OR "3":

    1. **Ask for modifications:**
       "What would you like to modify?
       - Priority (P1/P2/P3)
       - Description
       - Effort estimate
       - Proposed solution
       - Other details"

    2. **Apply user modifications:**
       UPDATE finding fields based on user input

    3. **Re-present modified finding:**
       DISPLAY updated finding in same format

    4. **Ask for decision again:**
       "Do you want to add this to the todo list?
       1. yes - create todo file
       2. next - skip this item
       3. custom - modify further"

    5. **Track customization:**
       - Increment custom_modifications counter
       - NOTE: Do not update triaged_count yet - wait for final yes/next decision
  </option_custom>

  <option_pause>
    WHEN user says "pause" OR "stop" OR "save" at any point:

    1. **Acknowledge pause request:**
       "⏸️  Pausing triage session..."

    2. **Save current state:**
       ```
       CALL: save_session_state()
       - Set progress.current_finding_index to current finding (not next)
       - Set session.paused_at to current timestamp
       - Write complete state to .triage-state/triage-session-[id].yml
       ```

    3. **Display pause summary:**
       ```markdown
       ✅ Triage session paused and saved!

       Progress saved:
       - Completed: [TRIAGED]/[TOTAL] findings ([PERCENT]%)
       - Todos created: [COUNT]
       - Findings skipped: [COUNT]
       - Next: Finding #[NEXT]
       - State file: .triage-state/triage-session-[id].yml

       To resume this session later:
       - Run the triage command again
       - Select "resume" when prompted
       - You'll continue from Finding #[NEXT]
       ```

    4. **Exit triage workflow:**
       STOP processing findings
       DO NOT proceed to next finding
       DO NOT generate final summary (Step 5)
       RETURN to command prompt

    **Pause Detection:**

    The triage workflow should accept "pause", "stop", or "save" at any decision point:
    - During initial resume/restart prompt
    - During yes/next/custom decision prompt
    - During custom modification prompts

    If user types pause/stop/save:
    - Execute pause logic immediately
    - Do not process current finding decision
    - Save state at current position
    - Exit workflow

  </option_pause>
</decision_handling>

<state_persistence>

  ### State Persistence Function

  **save_session_state()** - Save complete session state to YAML file

  ```yaml
  FUNCTION save_session_state():

    # Build complete state object
    state = {
      session: {
        id: session.id,
        started_at: session.started_at,
        paused_at: current_timestamp,
        source_type: session.source_type,
        source_file: session.source_file,
        todos_directory: session.todos_directory
      },

      progress: {
        total_findings: progress.total_findings,
        triaged_count: progress.triaged_count,
        remaining_count: progress.remaining_count,
        current_finding_index: progress.current_finding_index,
        todos_created: progress.todos_created,
        findings_skipped: progress.findings_skipped,
        custom_modifications: progress.custom_modifications
      },

      time_estimation: {
        session_start_time: time_estimation.session_start_time,
        use_actual_average: time_estimation.use_actual_average,
        average_time_per_finding: time_estimation.average_time_per_finding,
        finding_durations: time_estimation.finding_durations,
        current_finding_start_time: time_estimation.current_finding_start_time
      },

      decisions: {
        created_todos: decisions.created_todos,
        skipped_findings: decisions.skipped_findings,
        custom_modifications: decisions.custom_modifications
      },

      findings: findings  # Complete findings array
    }

    # Generate filename
    filename = ".triage-state/triage-session-" + session.id + ".yml"

    # Write YAML file
    WRITE state to filename in YAML format

    # Verify write succeeded
    IF file exists and is readable:
      RETURN success
    ELSE:
      ERROR: "Failed to save state file"
      RETURN failure
  ```

  **When to Save State:**

  State is automatically saved after EVERY finding decision (yes/next):
  - After creating todo file (option_yes step 6)
  - After skipping finding (option_next step 3)
  - On explicit pause request (option_pause step 2)
  - Before triage summary in Step 5 (mark session complete)

  **State File Location:**
  - Directory: `.triage-state/` (created if doesn't exist)
  - Filename: `triage-session-[session-id].yml`
  - Example: `.triage-state/triage-session-triage-20251026-143022.yml`

  **State Retention:**
  - Active session state: Retained until session completes
  - Completed session state: Retained for reference
  - Archived sessions: Moved to `archived-session-[timestamp].yml` on restart
  - Cleanup: Manual (user can delete old state files)

</state_persistence>

<instructions>
  ACTION: Process user decision (yes/next/custom/pause)
  EXECUTE: Appropriate action based on decision
  UPDATE: Progress tracking and session metrics
  SAVE: State to file after each decision
  CONTINUE: To next finding automatically (maintain momentum)
  PAUSE: Exit workflow cleanly if user requests pause
</instructions>

</step>

<step number="4" name="todo_file_creation">

### Step 4: Create Todo Files

Generate properly formatted todo files for approved findings.

<todo_template>
  ```markdown
  ---
  status: pending
  priority: [p1|p2|p3]
  issue_id: "[ISSUE_ID]"
  tags: [[CATEGORY], [ADDITIONAL_TAGS]]
  dependencies: []
  source: triage
  created_from: [quality_validation|code_review|security_audit|performance_analysis]
  finding_agents: [[LIST_OF_AGENTS_THAT_FOUND_THIS]]
  ---

  # [Finding Title]

  ## Problem Statement

  [Detailed description from finding]

  [Impact explanation - what could happen if not addressed]

  ## Findings

  - **Location**: [file_path:line_number]
  - **Category**: [Security|Performance|Architecture|etc.]
  - **Severity**: [P1|P2|P3]
  - **Discovered by**: [Agent names]
  - **Context**: [Additional context about how this was discovered]

  [Step-by-step problem scenario if applicable]

  ## Proposed Solutions

  ### Option 1: [Primary solution from finding]

  [Detailed recommendation from finding]

  - **Pros**: [Benefits of this approach]
  - **Cons**: [Drawbacks if any]
  - **Effort**: [Small|Medium|Large]
  - **Risk**: [Low|Medium|High]
  - **Implementation steps**:
    1. [Step 1]
    2. [Step 2]
    3. [Step 3]

  ## Recommended Action

  [Leave blank - to be filled during triage approval or task planning]

  ## Technical Details

  - **Affected Files**: [List files from finding location]
  - **Related Components**: [Components affected]
  - **Database Changes**: [Yes/No - describe if yes]
  - **API Changes**: [Yes/No - describe if yes]
  - **Frontend Changes**: [Yes/No - describe if yes]

  ## Resources

  - **Original finding**: Triage session [date]
  - **Finding source**: [quality_validation|code_review|etc.]
  - **Related findings**: [Other finding numbers if clustered]
  - **Agent reports**: [Agent names]
  - **References**: [Documentation links or standards]

  ## Acceptance Criteria

  - [ ] [Specific success criteria based on proposed solution]
  - [ ] Tests written and passing
  - [ ] Code reviewed
  - [ ] Documentation updated
  - [ ] No regression in related functionality

  ## Work Log

  ### [CURRENT_DATE] - Initial Discovery

  **By:** Agent OS Triage System
  **Actions:**
  - Issue discovered during [triage session type]
  - Categorized as [severity] / [category]
  - Estimated effort: [effort]
  - Prioritized based on [impact and ROI]

  **Context:**
  [Additional context from agents or research]

  **Learnings:**
  [Key insights from finding analysis]

  ## Notes

  Source: Triage session on [CURRENT_DATE]
  Finding ID: [FINDING_ID]
  Agents: [LIST_OF_AGENTS]
  ```
</todo_template>

<todo_naming_conventions>
  <priority_mapping>
    - 🔴 P1 (CRITICAL) → `p1`
    - 🟡 P2 (IMPORTANT) → `p2`
    - 🔵 P3 (NICE-TO-HAVE) → `p3`
  </priority_mapping>

  <slug_generation>
    CONVERT title to slug:
      - Lowercase all characters
      - Replace spaces with hyphens
      - Remove special characters
      - Limit to 5 words maximum
      - Maximum 40 characters total

    EXAMPLES:
      "SQL Injection vulnerability in search query" → "sql-injection-search-query"
      "N+1 Query in User Dashboard" → "n-plus-one-user-dashboard"
      "Simplify Complex Validation Logic" → "simplify-validation-logic"
  </slug_generation>

  <issue_id_generation>
    DETERMINE next ID:
      - Scan todos/ directory for existing files
      - Extract numeric prefixes
      - Find maximum
      - Add 1
      - Zero-pad to 3 digits

    IF todos/ directory doesn't exist:
      - CREATE todos/ directory
      - Start with 001

    EXAMPLES:
      - First todo: 001
      - After 042: 043
      - After 099: 100
  </issue_id_generation>
</todo_naming_conventions>

<instructions>
  ACTION: Generate todo file from template
  POPULATE: All fields with finding data
  FORMAT: Proper markdown with frontmatter
  SAVE: To todos/[issue_id]-pending-[priority]-[slug].md
  CONFIRM: File creation with user
</instructions>

</step>

<step number="5" name="triage_summary">

### Step 5: Generate Triage Summary

After all findings processed, generate comprehensive summary report and finalize session state.

<session_completion>

  **Before Generating Summary:**

  1. **Mark session as complete:**
     ```
     progress.remaining_count = 0
     progress.current_finding_index = total_findings
     session.completed_at = current_timestamp
     ```

  2. **Save final state:**
     ```
     CALL: save_session_state()
     - Include session.completed_at timestamp
     - Set progress.remaining_count = 0
     - Mark state as completed session
     ```

  3. **Move state to completed:**
     ```bash
     # Optional: Rename state file to mark as completed
     mv .triage-state/triage-session-[id].yml \
        .triage-state/completed-session-[id].yml
     ```

  This allows future resume checks to ignore completed sessions.

</session_completion>

<summary_generation>
  ```markdown
  ## 🎯 Triage Session Complete

  **Session Duration**: [DURATION]
  **Total Findings Reviewed**: [TOTAL]
  **Todos Created**: [CREATED_COUNT]
  **Findings Skipped**: [SKIPPED_COUNT]
  **Custom Modifications**: [CUSTOM_COUNT]
  **Average Time per Finding**: [AVG_TIME]
  **Time Estimation Accuracy**:
    - Findings used for average: [COUNT] (last [N] in rolling window)
    - Actual average: [X.X] minutes/finding
    - Estimation method: [Actual average | Default estimate]
    - Fastest finding: [MIN] minutes
    - Slowest finding: [MAX] minutes
    - Complexity adjustments applied: [Yes|No]

  ---

  ### ✅ Created Todos ([COUNT])

  **Critical (P1)**: [P1_COUNT]
  FOR each P1 todo:
    - `[filename]` - [title]

  **Important (P2)**: [P2_COUNT]
  FOR each P2 todo:
    - `[filename]` - [title]

  **Nice-to-Have (P3)**: [P3_COUNT]
  FOR each P3 todo:
    - `[filename]` - [title]

  ---

  ### ⏭️ Skipped Findings ([COUNT])

  FOR each skipped finding:
    - Finding #[ID]: [title] ([reason if provided])

  ---

  ### 📊 Effort Summary

  **Total Estimated Effort**: [HOURS] hours

  Breakdown:
  - Small tasks (< 2 hrs): [COUNT] todos = [TOTAL_HOURS] hours
  - Medium tasks (2-8 hrs): [COUNT] todos = [TOTAL_HOURS] hours
  - Large tasks (> 8 hrs): [COUNT] todos = [TOTAL_HOURS] hours

  ---

  ### 🎯 Quick Wins (High Impact, Low Effort)

  IF quick wins exist:
    FOR each quick win (P1/P2 + Small effort):
      - `[filename]` - [title] (Effort: Small, Priority: [P1|P2])

  ---

  ### 🔥 Critical Items Requiring Immediate Attention

  IF P1 todos exist:
    FOR each P1 todo:
      - `[filename]` - [title]
      - Impact: [impact description]
      - Effort: [effort]

  ---

  ### 📋 Next Steps

  1. **Review pending todos**:
     ```bash
     ls todos/*-pending-*.md
     ```

  2. **Prioritize and approve todos**:
     - Review P1 items first
     - Consider quick wins for immediate action
     - Estimate capacity and plan sprints

  3. **Start execution**:
     - Use execute-tasks workflow for systematic implementation
     - Or pick individual todos for focused work

  4. **Track progress**:
     - Update todo status as work progresses
     - Add work log entries
     - Mark complete when acceptance criteria met

  ---

  ### 💾 Session Data

  **Findings Source**: [quality_validation|code_review|etc.]
  **Findings File**: [path to findings file if applicable]
  **Todos Directory**: [path to todos directory]
  **Session Timestamp**: [ISO timestamp]
  ```
</summary_generation>

<session_metrics>
  TRACK and report:
    - Session start/end time
    - Total duration
    - Findings processed count
    - Todos created count
    - Skipped findings count
    - Custom modifications count
    - Average processing time per finding (actual average from time estimation algorithm)
    - Time estimation metrics:
      * Number of findings used for average calculation
      * Actual average time per finding (from rolling window)
      * Whether actual average was used (vs default)
      * Complexity adjustment factors applied
      * Min/max finding durations observed
    - Total estimated effort for created todos
    - P1/P2/P3 distribution
</session_metrics>

<instructions>
  ACTION: Generate comprehensive triage summary
  REPORT: All session metrics and outcomes
  PROVIDE: Clear next steps for todo execution
  SAVE: Session summary for reference
</instructions>

</step>

</process_flow>

<error_handling>

## Error Handling

<finding_validation_errors>
  IF finding missing required fields:
    - WARN: Invalid finding format
    - SKIP: Finding or prompt for manual input
    - LOG: Validation error for debugging
    - CONTINUE: With next finding
</finding_validation_errors>

<todo_creation_errors>
  IF todo file creation fails:
    - ERROR: File system issue or permission problem
    - RETRY: Once with error handling
    - FALLBACK: Log finding data for manual creation
    - NOTIFY: User of failure and provide finding details
    - CONTINUE: With remaining findings
</todo_creation_errors>

<user_input_errors>
  IF user provides unexpected input:
    - CLARIFY: Expected options (yes/next/custom)
    - RE-PROMPT: For valid decision
    - HELP: Explain options if needed
    - CONTINUE: After receiving valid input
</user_input_errors>

</error_handling>

<best_practices>

## Best Practices

<momentum_maintenance>
  - Process findings quickly and efficiently
  - Don't wait for approval between items
  - Keep presentations concise but complete
  - Maintain clear progress visibility
  - Use TodoWrite for session tracking
  - Use pause/resume for long triage sessions (> 30 findings)
  - State is auto-saved after each decision - safe to pause anytime
</momentum_maintenance>

<decision_guidance>
  - Create todo for anything requiring action
  - Skip duplicates or non-actionable items
  - Use custom to adjust priority or details
  - Consider effort vs impact when deciding
  - Group related findings when applicable
</decision_guidance>

<quality_standards>
  - Ensure todos have clear acceptance criteria
  - Include all relevant context from findings
  - Preserve agent recommendations
  - Link to original findings sources
  - Maintain consistent formatting
</quality_standards>

</best_practices>

<post_flight_check>
  EXECUTE: @.agent-os/instructions/meta/post-flight.md
</post_flight_check>
