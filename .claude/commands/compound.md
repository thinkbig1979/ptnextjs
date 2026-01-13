---
description: Extract and compound learnings from session artifacts into proposed patterns and rules
globs:
alwaysApply: false
version: 1.0
encoding: UTF-8
---

# /compound - Extract and Compound Learnings

Extract patterns from session artifacts and propose new rules/patterns for adoption.

## Overview

This command scans your session history and extracts recurring patterns that may be worth formalizing into your workflow. It helps identify:

- **Patterns** that worked well (3+ occurrences = strong signal)
- **Rules** you've been applying consistently
- **Workflows** that emerged from your sessions
- **Hooks** (automated triggers) you've relied on

**Safety First:**
- Read-only scan of session sources
- Output ONLY goes to `.agent-os/learnings/` (project-local)
- NEVER modifies core Agent OS files (`~/.agent-os/`)
- All proposals require manual adoption - nothing auto-applied

---

## Usage

```bash
/compound                    # Extract from all sources (last 30 days)
/compound --days 7           # Only scan last 7 days
/compound --dry-run          # Show what would be extracted without writing files
```

---

## STEP 1: Validate Prerequisites

### 1.1: Parse Arguments

```bash
# Default values
DAYS=${ARGUMENTS.days:-30}
DRY_RUN=${ARGUMENTS.dry-run:-false}

echo "Extraction mode: ${DRY_RUN == true ? 'DRY RUN' : 'NORMAL'}"
echo "Time range: Last ${DAYS} days"
```

### 1.2: Ensure Output Directories Exist

```bash
mkdir -p .agent-os/learnings/proposed-patterns
mkdir -p .agent-os/learnings/proposed-rules
mkdir -p .agent-os/learnings/proposed-workflows
mkdir -p .agent-os/learnings/proposed-hooks
mkdir -p .agent-os/learnings/archive
```

### 1.3: Check for Source Files

Scan for available sources:
- `.agent-os/ledgers/*.md` - Session ledgers
- `.agent-os/handoffs/*.md` - PM handoff files
- `.agent-os/sessions/*.md` - Session logs
- `.agent-os/retrospectives/*.md` - Retrospective notes
- `.beads/issues.jsonl` - Beads task notes

Report which sources exist and have content.

---

## STEP 2: Run Extraction

### 2.1: Execute the Extraction Engine

```javascript
const { extractLearnings, generateSummary } = require('~/.agent-os/lib/learnings-extractor.js');

const result = await extractLearnings({
  project_path: process.cwd(),
  dry_run: $DRY_RUN,
  min_signal: 2,  // Log patterns with 2+ occurrences
  include_beads: true,
});
```

### 2.2: Filter by Time Range (if --days specified)

The extraction engine processes all available sources. If `--days` is specified, filter results to only include insights from files modified within that window.

```bash
# Find files modified within time range
find .agent-os -name "*.md" -mtime -${DAYS} -type f
```

---

## STEP 3: Display Results

### 3.1: Summary Report

Display a summary of what was found:

```
=======================================================================
LEARNINGS EXTRACTION COMPLETE
=======================================================================

Project: [current directory]
Time range: Last [DAYS] days
Mode: [NORMAL | DRY RUN]

SOURCES SCANNED:
  - Ledgers: [N] files
  - Handoffs: [N] files
  - Session logs: [N] files
  - Beads notes: [N] entries

STATISTICS:
  - Raw insights found: [N]
  - After deduplication: [N]
  - Actionable (signal >= 2): [N]

=======================================================================
```

### 3.2: Signal-Grouped Results

Display findings grouped by signal strength:

```
STRONG SIGNAL (5+ occurrences) - High confidence patterns:
  * "[pattern description]" (seen [N] times)
    Category: [pattern|rule|workflow|hook]
    Sources: [list of sources]
    -> proposed-patterns/YYYY-MM-DD-[slug].md

RECOMMENDED (3-4 occurrences) - Likely worth adopting:
  * "[pattern description]" (seen [N] times)
    Category: [category]
    -> proposed-rules/YYYY-MM-DD-[slug].md

LOGGED (2 occurrences) - For reference only:
  * "[pattern description]" (seen [N] times)

SINGLE OCCURRENCE (not actionable):
  * [count] insights with single occurrence (likely noise)

=======================================================================
```

### 3.3: Output Location

```
OUTPUT DIRECTORY: .agent-os/learnings/

Files created:
  - proposed-patterns/[N] files
  - proposed-rules/[N] files
  - proposed-workflows/[N] files
  - proposed-hooks/[N] files
  - extraction-log.md (updated)

=======================================================================
```

---

## STEP 4: Adoption Instructions

Display clear instructions for what to do next:

```
NEXT STEPS - How to Adopt Learnings
=======================================================================

1. REVIEW proposed learnings:
   ls -la .agent-os/learnings/proposed-*/

   Each file contains:
   - The pattern/rule description
   - Evidence (quotes from sources)
   - Signal strength
   - Suggested adoption location
   - Adoption status checkbox

2. TO ADOPT a learning:
   a) Read the file: cat .agent-os/learnings/proposed-patterns/[file].md
   b) Decide if it should be formalized
   c) If yes: Copy relevant content to the suggested location
   d) Update the "Adoption Status" section in the file

3. SUGGESTED LOCATIONS for adopted learnings:
   - Patterns: CLAUDE.md or standards/best-practices.md
   - Rules: CLAUDE.md or standards/code-style.md
   - Workflows: instructions/core/ or commands/
   - Hooks: hooks/ directory
   - Testing: standards/testing-standards.md

4. ARCHIVE reviewed learnings:
   mv .agent-os/learnings/proposed-patterns/[file].md \
      .agent-os/learnings/archive/

=======================================================================
```

---

## STEP 5: Verify Output Location

**CRITICAL**: Confirm all output went to project-local `.agent-os/learnings/`:

```bash
# Verify no writes to core Agent OS
if [ -n "$(git -C ~/.agent-os status --porcelain 2>/dev/null)" ]; then
  echo "ERROR: Core Agent OS was modified - this should not happen!"
  exit 1
fi

# Show what was created
echo "Output verified in .agent-os/learnings/:"
find .agent-os/learnings -type f -name "*.md" | head -20
```

---

## Example Output Files

After running `/compound`, you'll find files like:

### `.agent-os/learnings/proposed-patterns/2024-12-15-test-before-commit.md`

```markdown
# Proposed Pattern: Always run tests before committing

Generated: 2024-12-15T10:30:00.000Z
Signal Strength: 5 occurrences
Category: Pattern (Design and implementation patterns)
Recommendation: Strong

## Pattern
Always run tests before committing changes to ensure nothing is broken.

## Evidence
- [ledgers]: "Pattern: Run tests before every commit"
- [handoffs]: "Always: verify tests pass before git commit"
- [beads]: "Lesson Learned: skipped tests caused regression"
- [retrospectives]: "Best Practice: test-before-commit workflow"
- [ledgers]: "Note to self: don't skip tests again"

## Sources
- [ledgers]: .agent-os/ledgers/2024-12-10.md:45
- [handoffs]: .agent-os/handoffs/pm-session-3.md:120
- [beads]: beads:task-abc123:15
- [retrospectives]: .agent-os/retrospectives/week-50.md:30
- [ledgers]: .agent-os/ledgers/2024-12-14.md:88

## Context
```
What Worked:
- Running full test suite before commits
- Catching regressions early
```

## Suggested Location
If adopted, add to: CLAUDE.md or standards/best-practices.md

## Adoption Status
- [ ] Not reviewed
- [ ] Reviewed - Rejected (reason: ___)
- [ ] Reviewed - Adopted (location: ___)

---
*This file was auto-generated by the Learnings Extraction Engine.*
```

---

## Dry Run Mode

When `--dry-run` is specified:

1. Scan all sources as normal
2. Analyze and categorize findings
3. Display the full report (what WOULD be created)
4. **Do NOT write any files**

```
=======================================================================
DRY RUN MODE - No files written
=======================================================================

Would create the following files:

PROPOSED PATTERNS:
  - 2024-12-15-test-before-commit.md (signal: 5)
  - 2024-12-15-use-vitest-for-unit-tests.md (signal: 3)

PROPOSED RULES:
  - 2024-12-15-prefer-single-quotes.md (signal: 4)

PROPOSED WORKFLOWS:
  - 2024-12-15-red-green-refactor-cycle.md (signal: 3)

To actually create these files, run:
  /compound

=======================================================================
```

---

## Insight Markers

The extraction engine looks for these patterns in your session artifacts:

| Marker | Example |
|--------|---------|
| `Pattern:` | "Pattern: Always check null before access" |
| `Always:` | "Always: run linter before commit" |
| `Never:` | "Never: commit secrets to git" |
| `Lesson Learned` | "Lesson Learned: mock network calls in tests" |
| `Best Practice:` | "Best Practice: use async/await over callbacks" |
| `Gotcha:` | "Gotcha: React hooks must be called at top level" |
| `What Worked` | Section header with bullet points |
| `What Failed` | Section header with bullet points |
| `Avoid:` | "Avoid: deeply nested callbacks" |
| `Prefer:` | "Prefer: composition over inheritance" |
| `Tip:` | "Tip: use vitest for faster tests" |

---

## Signal Strength Thresholds

| Occurrences | Level | Action |
|-------------|-------|--------|
| 1 | Skip | Likely noise, not actionable |
| 2 | Log | Noted for reference only |
| 3-4 | Recommend | Worth reviewing for adoption |
| 5+ | Strong | High confidence, likely should adopt |

---

## Configuration

Add to `config.yml` to customize:

```yaml
learnings_extraction:
  enabled: true
  min_signal: 2                    # Minimum occurrences to log
  recommend_threshold: 3           # Occurrences to recommend adoption
  strong_threshold: 5              # High confidence threshold
  sources:
    ledgers: true
    handoffs: true
    sessions: true
    retrospectives: true
    beads: true
  output_dir: ".agent-os/learnings"
```

---

## Critical Rules

1. **Read-only input** - Source files are never modified
2. **Project-local output** - All output goes to `.agent-os/learnings/`
3. **Never touch core** - `~/.agent-os/` is never modified
4. **Manual adoption** - Proposals are suggestions, not auto-applied
5. **Evidence-based** - Each proposal includes source quotes
6. **Transparent** - Full extraction log in `extraction-log.md`

---

## Troubleshooting

### No sources found
```bash
# Check if source directories exist
ls -la .agent-os/ledgers/ .agent-os/handoffs/ .agent-os/sessions/

# Check for beads
ls -la .beads/issues.jsonl
```

### Low signal findings
- Review your session artifacts for insight markers
- Use consistent markers like "Pattern:", "Always:", "Lesson Learned"
- Run retrospectives to capture learnings

### Too many false positives
- Increase `min_signal` in config to 3+
- Use more specific markers in your notes
- Review and archive non-actionable proposals
