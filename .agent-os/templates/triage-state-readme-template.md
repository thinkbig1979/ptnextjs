# Triage Session State Files

This directory contains state files for triage sessions, enabling pause/resume functionality.

## Overview

When you run a triage session (via the `/triage` command), the system automatically saves your progress after each decision. This allows you to:

- **Pause** at any time without losing work
- **Resume** exactly where you left off
- **Track** session history and metrics
- **Recover** from interruptions

## File Structure

### Active Session Files

```
triage-session-[YYYYMMDD-HHMMSS].yml
```

**Example:** `triage-session-20251026-143022.yml`

These files contain:
- Session metadata (start time, source, todos directory)
- Progress tracking (findings processed, todos created, skipped items)
- Time estimation data (rolling averages, durations)
- Complete findings list (for resume without re-loading source)
- Decision history (all todos created and findings skipped)

### Completed Session Files

```
completed-session-[YYYYMMDD-HHMMSS].yml
```

Sessions that have processed all findings are renamed to `completed-session-*` to prevent them from appearing in resume prompts.

### Archived Session Files

```
archived-session-[YYYYMMDD-HHMMSS].yml
```

When you choose "restart" instead of "resume", the previous session is archived with this prefix for reference.

## State File Format

State files are in YAML format with this structure:

```yaml
session:
  id: "triage-20251026-143022"
  started_at: "2025-10-26T14:30:22Z"
  paused_at: "2025-10-26T14:45:30Z"
  source_type: "quality_validation"
  source_file: ".quality-validation/findings-20251026.yml"
  todos_directory: "todos/"

progress:
  total_findings: 42
  triaged_count: 15
  remaining_count: 27
  current_finding_index: 15
  todos_created: 8
  findings_skipped: 7
  custom_modifications: 2

time_estimation:
  session_start_time: "2025-10-26T14:30:22Z"
  use_actual_average: true
  average_time_per_finding: 1.87
  finding_durations: [1.2, 2.1, 1.5, 2.8, 1.9, 1.7, 2.3, 1.4, 2.0, 1.8]
  current_finding_start_time: "2025-10-26T14:45:12Z"

decisions:
  created_todos:
    - issue_id: "042"
      filename: "042-pending-p1-sql-injection-search.md"
      title: "SQL Injection in search query"
      priority: "p1"
      finding_index: 3
      created_at: "2025-10-26T14:32:45Z"
    # ... more todos

  skipped_findings:
    - finding_index: 5
      finding_id: "sec-006"
      title: "Minor code style issue"
      reason: "Already addressed in style guide"
      skipped_at: "2025-10-26T14:35:12Z"
    # ... more skipped

  custom_modifications:
    - finding_index: 8
      modifications: "Changed priority from P2 to P1"
      modified_at: "2025-10-26T14:38:20Z"
      final_decision: "yes"
    # ... more modifications

findings:
  - finding_id: "sec-001"
    severity: "P1"
    category: "Security"
    title: "SQL Injection vulnerability"
    description: "User input not properly sanitized..."
    # ... complete finding details
  # ... all findings
```

## Usage

### Resuming a Session

When you run the triage command and there's a resumable session:

```
🔄 Previous triage session found!

Session Details:
- Started: 2025-10-26 14:30:22 (15 minutes ago)
- Progress: 15/42 findings (36%)
- Todos created: 8
- Findings skipped: 7
- Remaining: 27 findings
- Estimated time to complete: ~27 min

What would you like to do?
1. resume - Continue from where you left off (Finding #16)
2. restart - Start fresh (previous session will be archived)
3. view - View previous session summary before deciding
```

### Pausing a Session

At any decision point, type `pause`, `stop`, or `save`:

```
⏸️  Pausing triage session...

✅ Triage session paused and saved!

Progress saved:
- Completed: 15/42 findings (36%)
- Todos created: 8
- Findings skipped: 7
- Next: Finding #16
- State file: .triage-state/triage-session-triage-20251026-143022.yml

To resume this session later:
- Run the triage command again
- Select "resume" when prompted
- You'll continue from Finding #16
```

## File Management

### Automatic State Saving

State is automatically saved:
- After creating each todo (yes decision)
- After skipping each finding (next decision)
- When explicitly pausing (pause command)
- At session completion

### Manual Cleanup

State files are retained indefinitely. To clean up old sessions:

```bash
# Remove completed sessions older than 30 days
find .triage-state -name "completed-session-*.yml" -mtime +30 -delete

# Remove archived sessions older than 7 days
find .triage-state -name "archived-session-*.yml" -mtime +7 -delete

# Remove all state files (use with caution!)
rm -rf .triage-state/*.yml
```

### Backup

To backup triage session history:

```bash
# Create backup
tar -czf triage-state-backup-$(date +%Y%m%d).tar.gz .triage-state/

# Restore backup
tar -xzf triage-state-backup-20251026.tar.gz
```

## Troubleshooting

### Resume Not Working

If resume doesn't work:

1. **Check state file exists:**
   ```bash
   ls -la .triage-state/triage-session-*.yml
   ```

2. **Verify remaining_count > 0:**
   ```bash
   grep "remaining_count:" .triage-state/triage-session-*.yml
   ```

3. **Check YAML syntax:**
   ```bash
   # Install yamllint if needed
   yamllint .triage-state/triage-session-*.yml
   ```

### Corrupt State File

If state file is corrupted:

1. **Archive the bad file:**
   ```bash
   mv .triage-state/triage-session-bad.yml \
      .triage-state/corrupted-session-$(date +%Y%m%d-%H%M%S).yml
   ```

2. **Start fresh session:**
   Run triage command again - it will start a new session

### Multiple Sessions

If you have multiple active sessions (shouldn't happen normally):

```bash
# List all active sessions
ls -t .triage-state/triage-session-*.yml

# Archive all but the most recent
cd .triage-state
ls -t triage-session-*.yml | tail -n +2 | \
  xargs -I {} mv {} archived-{}
```

## Best Practices

1. **Regular Sessions**: For large triage sessions (50+ findings), take breaks and use pause/resume
2. **One Session at a Time**: Complete or archive previous sessions before starting new ones
3. **Backup Important Sessions**: Before major cleanups, backup your state directory
4. **Check Resume Prompt**: Always check the session details before resuming to ensure it's the right session
5. **Use View Option**: If uncertain, use "view" option to see full session details before resuming

## Security Note

State files contain complete finding details including:
- File paths and line numbers
- Code snippets and vulnerability details
- Security issue descriptions

**Do not commit state files to version control.** Add `.triage-state/` to your `.gitignore`:

```bash
echo ".triage-state/" >> .gitignore
```

## Support

For issues or questions about triage state files:
- Review the triage command documentation: `commands/triage.md`
- Check the Agent OS documentation
- File an issue if you discover bugs in state persistence
