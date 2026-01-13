---
version: 5.1.0
last-updated: 2026-01-02
related-files:
  - instructions/core/create-spec.md
---


# Steps 0-1: Prerequisites and Setup

## Step 0: Detect Agent OS Root

```
SEARCH .agent-os/:
  1. Check CWD
  2. Walk up parents
  3. Error if not found

STORE: AGENT_OS_ROOT = directory containing .agent-os/

ERROR: If not found, "Run plan-product or analyze-product first"
```

## Step 1: Prerequisite Verification

```
CHECK: {AGENT_OS_ROOT}/.agent-os/product/mission-lite.md
CHECK: {AGENT_OS_ROOT}/.agent-os/product/tech-stack.md

ERROR if missing: "Run plan-product or analyze-product first"
```

## Step 1.5: Pattern Discovery (v5.0+)

**Purpose**: Ensure new specs align with existing codebase patterns.

**Trigger**: Existing codebase with source files detected.

**Skip**: Greenfield projects with no source files.

```yaml
pattern_discovery:
  # Check if patterns exist and are current
  patterns_path: "{AGENT_OS_ROOT}/.agent-os/patterns"
  metadata_file: "{patterns_path}/_metadata.yml"

  IF NOT exists(patterns_path) OR patterns_stale(7 days):
    # Run pattern discovery
    SPAWN: pattern-discovery-analyst subagent
      TASK: "Analyze codebase and document existing patterns"
      OUTPUT: "{patterns_path}/"
      CATEGORIES:
        - url_structure      # ID vs slug vs UUID
        - naming_conventions # File and code naming
        - component_structure # Organization style
        - state_management   # Libraries and patterns
        - api_patterns       # Response formats
        - authentication     # Auth mechanism
        - form_handling      # Form libraries
        - error_handling     # Error patterns
        - testing_patterns   # Test framework
    WAIT: Analysis complete

  ELSE:
    # Load existing patterns
    LOAD: All pattern files from {patterns_path}
    VERIFY: Spot-check 3 files to confirm patterns current

  # Extract constraints for spec creation
  EXTRACT:
    - URL pattern constraint (e.g., "Use :id, not :slug")
    - Naming convention constraints
    - Component organization rules
    - API response format requirements
    - State management library

  PASS TO: Step 4 (Requirements Clarification)
```

**Output**: Pattern constraints available for spec design.

**Console Summary**:
```
Pattern Discovery: COMPLETE
├── URL Structure: ID-based (:id) [HIGH confidence]
├── Naming: PascalCase components [HIGH confidence]
├── API Format: { data: T } wrapper [HIGH confidence]
└── Constraints loaded for spec creation
```
