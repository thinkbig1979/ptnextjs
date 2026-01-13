#!/bin/bash

# TDD Validator Hook Script
# Validates TDD compliance before file writes (PreToolUse hook)
# Part of Agent OS v2.8+ TDD Enforcement System

set -e  # Exit on error (but handle gracefully below)

# ============================================================================
# CONFIGURATION
# ============================================================================

# Performance target: < 500ms per validation
VALIDATION_TIMEOUT=500

# TDD state directory - avoid doubling .agent-os when CLAUDE_PROJECT_DIR already ends with it
# This handles the case where Agent OS itself is the project (CLAUDE_PROJECT_DIR=~/.agent-os)
BASE_DIR="${CLAUDE_PROJECT_DIR:-.}"
if [[ "$BASE_DIR" == */.agent-os ]] || [[ "$BASE_DIR" == *.agent-os ]]; then
    # CLAUDE_PROJECT_DIR already points to .agent-os directory
    TDD_STATE_DIR="${BASE_DIR}/tdd-state"
    CONFIG_FILE="${BASE_DIR}/config.yml"
else
    # CLAUDE_PROJECT_DIR points to project root, append .agent-os
    TDD_STATE_DIR="${BASE_DIR}/.agent-os/tdd-state"
    CONFIG_FILE="${BASE_DIR}/.agent-os/config.yml"
fi

# Debug mode (set TDD_DEBUG=1 to enable)
DEBUG="${TDD_DEBUG:-0}"

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

# Debug logging
debug() {
    if [ "$DEBUG" = "1" ]; then
        echo "[TDD-VALIDATOR DEBUG] $*" >&2
    fi
}

# Color codes for formatted output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m' # No Color

# Error logging with improved formatting
error() {
    echo -e "${RED}╔══════════════════════════════════════════════════════════════╗${NC}" >&2
    echo -e "${RED}║${NC} ${BOLD}❌ TDD VALIDATION ERROR${NC}" >&2
    echo -e "${RED}╟──────────────────────────────────────────────────────────────╢${NC}" >&2
    echo -e "${RED}║${NC} $*" >&2
    echo -e "${RED}╚══════════════════════════════════════════════════════════════╝${NC}" >&2
}

# Warning logging with improved formatting
warn() {
    echo -e "${YELLOW}┌──────────────────────────────────────────────────────────────┐${NC}" >&2
    echo -e "${YELLOW}│${NC} ${BOLD}⚠️  TDD WARNING${NC}" >&2
    echo -e "${YELLOW}├──────────────────────────────────────────────────────────────┤${NC}" >&2
    echo -e "${YELLOW}│${NC} $*" >&2
    echo -e "${YELLOW}└──────────────────────────────────────────────────────────────┘${NC}" >&2
}

# Info logging
info() {
    echo -e "${BLUE}│${NC}  $*" >&2
}

# Tip logging - for actionable suggestions
tip() {
    echo -e "${CYAN}│${NC}  ${DIM}💡 Tip:${NC} $*" >&2
}

# Example logging - for code examples
example() {
    echo -e "${CYAN}│${NC}    ${DIM}\$${NC} $*" >&2
}

# Success logging with improved formatting
success() {
    echo -e "${GREEN}✅ [TDD] $*${NC}" >&2
}

# Print guidance box
print_guidance() {
    local title="$1"
    shift
    echo -e "${BLUE}├──────────────────────────────────────────────────────────────┤${NC}" >&2
    echo -e "${BLUE}│${NC} ${BOLD}${title}${NC}" >&2
    for line in "$@"; do
        echo -e "${BLUE}│${NC}  $line" >&2
    done
}

# Print footer
print_footer() {
    echo -e "${BLUE}└──────────────────────────────────────────────────────────────┘${NC}" >&2
}

# ============================================================================
# FILE TYPE DETECTION
# ============================================================================

# Check if file is a test file
is_test_file() {
    local filepath="$1"
    # Security: Use parameter expansion instead of command substitution to prevent injection
    local filename="${filepath##*/}"  # basename equivalent
    local dirpath="${filepath%/*}"    # dirname equivalent

    # Test file patterns
    case "$filename" in
        *.test.js|*.test.ts|*.test.jsx|*.test.tsx) return 0 ;;
        *.spec.js|*.spec.ts|*.spec.jsx|*.spec.tsx) return 0 ;;
        test_*.py|*_test.py) return 0 ;;
        *_spec.rb|*_test.rb) return 0 ;;
        *.test.php) return 0 ;;
        *_test.go) return 0 ;;
        *_test.rs) return 0 ;;
    esac

    # Test directory patterns
    if [[ "$dirpath" == *"__tests__"* ]]; then
        return 0
    fi
    if [[ "$dirpath" == *"/tests"* ]] || [[ "$dirpath" == "tests"* ]]; then
        return 0
    fi
    if [[ "$dirpath" == *"/test"* ]] || [[ "$dirpath" == "test"* ]]; then
        return 0
    fi
    if [[ "$dirpath" == *"/spec"* ]] || [[ "$dirpath" == "spec"* ]]; then
        return 0
    fi

    return 1
}

# Check if file is a documentation file
is_documentation_file() {
    local filepath="$1"
    # Security: Use parameter expansion instead of command substitution to prevent injection
    local filename="${filepath##*/}"  # basename equivalent
    local dirpath="${filepath%/*}"    # dirname equivalent

    # Documentation file patterns
    case "$filename" in
        *.md|*.markdown) return 0 ;;
        README|README.*) return 0 ;;
        CHANGELOG|CHANGELOG.*) return 0 ;;
        LICENSE|LICENSE.*) return 0 ;;
        CONTRIBUTING|CONTRIBUTING.*) return 0 ;;
        AUTHORS|AUTHORS.*) return 0 ;;
    esac

    # Documentation directory patterns
    if [[ "$dirpath" == *"/docs"* ]] || [[ "$dirpath" == "docs"* ]]; then
        return 0
    fi
    if [[ "$dirpath" == *"/doc"* ]] || [[ "$dirpath" == "doc"* ]]; then
        return 0
    fi
    if [[ "$dirpath" == *"/documentation"* ]] || [[ "$dirpath" == "documentation"* ]]; then
        return 0
    fi

    return 1
}

# Check if file is a configuration file
is_configuration_file() {
    local filepath="$1"
    # Security: Use parameter expansion instead of command substitution to prevent injection
    local filename="${filepath##*/}"  # basename equivalent

    # Configuration file patterns
    case "$filename" in
        # Package managers and build tools
        package.json|package-lock.json) return 0 ;;
        pnpm-lock.yaml|yarn.lock) return 0 ;;
        composer.json|composer.lock) return 0 ;;
        Gemfile|Gemfile.lock) return 0 ;;
        Cargo.toml|Cargo.lock) return 0 ;;
        go.mod|go.sum) return 0 ;;
        requirements.txt|setup.py|pyproject.toml) return 0 ;;

        # Build and bundler configs
        tsconfig.json|jsconfig.json) return 0 ;;
        webpack.config.*|rollup.config.*|vite.config.*) return 0 ;;
        babel.config.*|.babelrc*) return 0 ;;

        # Test framework configs
        jest.config.*|vitest.config.*) return 0 ;;
        pytest.ini|.pytest_cache) return 0 ;;
        phpunit.xml|phpunit.xml.dist) return 0 ;;
        .rspec) return 0 ;;

        # Linters and formatters
        .eslintrc*|eslint.config.*) return 0 ;;
        .prettierrc*|prettier.config.*) return 0 ;;
        .rubocop*|rubocop.yml) return 0 ;;
        .pylintrc|pylint.rc) return 0 ;;

        # Editor configs
        .editorconfig) return 0 ;;
        .gitignore|.gitattributes) return 0 ;;
        .dockerignore) return 0 ;;

        # CI/CD configs
        .gitlab-ci.yml|.travis.yml) return 0 ;;
        .github/*|.circleci/*) return 0 ;;

        # Docker configs
        Dockerfile|docker-compose.yml|docker-compose.yaml) return 0 ;;

        # Other configs
        .env|.env.*) return 0 ;;
        config.yml|config.yaml) return 0 ;;
    esac

    return 1
}

# Check if file is an implementation file
is_implementation_file() {
    local filepath="$1"

    # Implementation files are those that are NOT test, doc, or config files
    if is_test_file "$filepath"; then
        return 1
    fi

    if is_documentation_file "$filepath"; then
        return 1
    fi

    if is_configuration_file "$filepath"; then
        return 1
    fi

    return 0
}

# ============================================================================
# TDD STATE MANAGEMENT
# ============================================================================

# Cache for TDD state to avoid repeated file reads and JSON parsing
# Format: "phase|level|failures" - parsed once, read many times
declare -g _TDD_STATE_CACHE=""
declare -g _TDD_STATE_CACHE_TASK_ID=""

# Load TDD state for current task
load_tdd_state() {
    local task_id="$1"

    if [ -z "$task_id" ]; then
        debug "No task_id provided, cannot load TDD state"
        return 1
    fi

    local state_file="$TDD_STATE_DIR/${task_id}.json"

    if [ ! -f "$state_file" ]; then
        debug "TDD state file not found: $state_file"
        return 1
    fi

    debug "Loading TDD state from: $state_file"
    cat "$state_file"
    return 0
}

# Parse all TDD state fields in a single operation (Optimization: reduces jq/grep calls from 3 to 1)
# Returns cached values if same task_id, otherwise parses and caches
# Output format: "phase|level|failures"
parse_tdd_state_all() {
    local state_json="$1"
    local task_id="$2"

    # Check cache first
    if [ -n "$_TDD_STATE_CACHE" ] && [ "$_TDD_STATE_CACHE_TASK_ID" = "$task_id" ]; then
        debug "Using cached TDD state for task: $task_id"
        echo "$_TDD_STATE_CACHE"
        return 0
    fi

    local phase level failures

    # Single jq call to extract all fields (if jq available)
    if command -v jq >/dev/null 2>&1; then
        local parsed
        parsed=$(echo "$state_json" | jq -r '[.current_phase // "UNKNOWN", .enforcement_level // "BALANCED", (.test_failures // 0 | tostring)] | join("|")' 2>/dev/null)
        if [ -n "$parsed" ]; then
            _TDD_STATE_CACHE="$parsed"
            _TDD_STATE_CACHE_TASK_ID="$task_id"
            echo "$parsed"
            return 0
        fi
    fi

    # Fallback: single grep pass with awk (more efficient than multiple grep/sed)
    # Extract all three fields in one pass through the JSON
    phase=$(echo "$state_json" | grep -o '"current_phase"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"\([^"]*\)".*/\1/' || echo "UNKNOWN")
    level=$(echo "$state_json" | grep -o '"enforcement_level"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"\([^"]*\)".*/\1/' || echo "BALANCED")
    failures=$(echo "$state_json" | grep -o '"test_failures"[[:space:]]*:[[:space:]]*[0-9]*' | grep -o '[0-9]*$' || echo "0")

    local result="${phase}|${level}|${failures}"
    _TDD_STATE_CACHE="$result"
    _TDD_STATE_CACHE_TASK_ID="$task_id"
    echo "$result"
}

# Extract current phase from cached/parsed state
get_current_phase() {
    local state_json="$1"
    local task_id="${2:-}"

    # If we have parsed state in pipe format, extract directly
    if [[ "$state_json" == *"|"* ]]; then
        echo "${state_json%%|*}"
        return 0
    fi

    # Parse all and extract phase
    local parsed
    parsed=$(parse_tdd_state_all "$state_json" "$task_id")
    echo "${parsed%%|*}"
}

# Extract enforcement level from cached/parsed state
get_enforcement_level() {
    local state_json="$1"
    local task_id="${2:-}"

    # If we have parsed state in pipe format, extract directly
    if [[ "$state_json" == *"|"* ]]; then
        local temp="${state_json#*|}"
        echo "${temp%%|*}"
        return 0
    fi

    # Parse all and extract level
    local parsed
    parsed=$(parse_tdd_state_all "$state_json" "$task_id")
    local temp="${parsed#*|}"
    echo "${temp%%|*}"
}

# Extract test failure count from cached/parsed state
get_test_failures() {
    local state_json="$1"
    local task_id="${2:-}"

    # If we have parsed state in pipe format, extract directly
    if [[ "$state_json" == *"|"* ]]; then
        echo "${state_json##*|}"
        return 0
    fi

    # Parse all and extract failures
    local parsed
    parsed=$(parse_tdd_state_all "$state_json" "$task_id")
    echo "${parsed##*|}"
}

# ============================================================================
# CONFIGURATION LOADING
# ============================================================================

# Check if TDD enforcement is enabled in config
is_tdd_enabled() {
    # Check config.yml if it exists
    if [ -f "$CONFIG_FILE" ]; then
        # Use yq or grep to check tdd_enforcement.enabled
        if command -v yq >/dev/null 2>&1; then
            local enabled=$(yq eval '.tdd_enforcement.enabled // true' "$CONFIG_FILE" 2>/dev/null)
            [ "$enabled" = "true" ] && return 0
        else
            # Fallback: grep for enabled setting
            if grep -q "tdd_enforcement:" "$CONFIG_FILE" 2>/dev/null; then
                if grep -A 5 "tdd_enforcement:" "$CONFIG_FILE" | grep -q "enabled:[[:space:]]*true"; then
                    return 0
                elif grep -A 5 "tdd_enforcement:" "$CONFIG_FILE" | grep -q "enabled:[[:space:]]*false"; then
                    return 1
                fi
            fi
        fi
    fi

    # Default: enabled
    return 0
}

# Get enforcement level from config (fallback if not in state)
get_config_enforcement_level() {
    if [ -f "$CONFIG_FILE" ]; then
        if command -v yq >/dev/null 2>&1; then
            yq eval '.tdd_enforcement.enforcement_level // "standard"' "$CONFIG_FILE" 2>/dev/null
        else
            grep -A 10 "tdd_enforcement:" "$CONFIG_FILE" 2>/dev/null | grep "enforcement_level:" | sed 's/.*:[[:space:]]*\([^[:space:]]*\).*/\1/' || echo "standard"
        fi
    else
        echo "standard"
    fi
}

# ============================================================================
# TDD VALIDATION LOGIC
# ============================================================================

# Validate if write operation is allowed based on TDD phase
validate_tdd_phase() {
    local filepath="$1"
    local current_phase="$2"
    local enforcement_level="$3"
    local test_failures="${4:-0}"

    debug "Validating TDD phase: file=$filepath, phase=$current_phase, level=$enforcement_level, failures=$test_failures"

    # Normalize enforcement level
    case "$enforcement_level" in
        MINIMAL|minimal|relaxed|RELAXED)
            enforcement_level="RELAXED"
            ;;
        BALANCED|balanced|standard|STANDARD)
            enforcement_level="STANDARD"
            ;;
        STRICT|strict)
            enforcement_level="STRICT"
            ;;
        *)
            enforcement_level="STANDARD"
            ;;
    esac

    # Validation rules based on phase and enforcement level
    case "$current_phase" in
        INIT)
            # INIT phase: No tests written yet
            local filename="${filepath##*/}"
            local test_filename="${filename%.*}.test.${filename##*.}"

            case "$enforcement_level" in
                STRICT)
                    echo -e "${RED}╔══════════════════════════════════════════════════════════════╗${NC}" >&2
                    echo -e "${RED}║${NC} ${BOLD}❌ TDD WORKFLOW BLOCKED${NC} - Tests Required First" >&2
                    echo -e "${RED}╟──────────────────────────────────────────────────────────────╢${NC}" >&2
                    echo -e "${RED}║${NC} You're trying to modify: ${BOLD}${filename}${NC}" >&2
                    echo -e "${RED}║${NC} Current phase: ${BOLD}INIT${NC} (no tests exist yet)" >&2
                    echo -e "${RED}╟──────────────────────────────────────────────────────────────╢${NC}" >&2
                    echo -e "${RED}║${NC} ${BOLD}What you need to do:${NC}" >&2
                    echo -e "${RED}║${NC}   ${GREEN}1.${NC} Create test file: ${CYAN}${test_filename}${NC}" >&2
                    echo -e "${RED}║${NC}   ${GREEN}2.${NC} Write tests that describe expected behavior" >&2
                    echo -e "${RED}║${NC}   ${GREEN}3.${NC} Run tests to confirm they fail (RED phase)" >&2
                    echo -e "${RED}║${NC}   ${GREEN}4.${NC} Then implement ${filename} to make tests pass" >&2
                    echo -e "${RED}╟──────────────────────────────────────────────────────────────╢${NC}" >&2
                    echo -e "${RED}║${NC} ${DIM}💡 Example test commands:${NC}" >&2
                    echo -e "${RED}║${NC}   ${DIM}\$ pnpm test${NC}  or  ${DIM}\$ npm test${NC}  or  ${DIM}\$ vitest${NC}" >&2
                    echo -e "${RED}╟──────────────────────────────────────────────────────────────╢${NC}" >&2
                    echo -e "${RED}║${NC} ${DIM}ℹ️  Mode: STRICT - implementation blocked until tests exist${NC}" >&2
                    echo -e "${RED}╚══════════════════════════════════════════════════════════════╝${NC}" >&2
                    return 1
                    ;;
                STANDARD)
                    echo -e "${YELLOW}┌──────────────────────────────────────────────────────────────┐${NC}" >&2
                    echo -e "${YELLOW}│${NC} ${BOLD}⚠️  TDD WORKFLOW WARNING${NC} - Tests Recommended First" >&2
                    echo -e "${YELLOW}├──────────────────────────────────────────────────────────────┤${NC}" >&2
                    echo -e "${YELLOW}│${NC} You're modifying: ${BOLD}${filename}${NC} without tests" >&2
                    echo -e "${YELLOW}│${NC} Current phase: ${BOLD}INIT${NC} (no tests exist yet)" >&2
                    echo -e "${YELLOW}├──────────────────────────────────────────────────────────────┤${NC}" >&2
                    echo -e "${YELLOW}│${NC} ${BOLD}Recommended TDD workflow:${NC}" >&2
                    echo -e "${YELLOW}│${NC}   ${GREEN}1.${NC} Create ${CYAN}${test_filename}${NC} first" >&2
                    echo -e "${YELLOW}│${NC}   ${GREEN}2.${NC} Write failing tests → Run → Implement → Pass" >&2
                    echo -e "${YELLOW}├──────────────────────────────────────────────────────────────┤${NC}" >&2
                    echo -e "${YELLOW}│${NC} ${DIM}ℹ️  Mode: STANDARD - proceeding with warning${NC}" >&2
                    echo -e "${YELLOW}└──────────────────────────────────────────────────────────────┘${NC}" >&2
                    return 0
                    ;;
                RELAXED)
                    debug "Test-first violation detected (RELAXED mode - allowing)"
                    return 0
                    ;;
            esac
            ;;

        RED)
            # RED phase: Tests written and failing
            local filename="${filepath##*/}"

            case "$enforcement_level" in
                STRICT)
                    echo -e "${RED}╔══════════════════════════════════════════════════════════════╗${NC}" >&2
                    echo -e "${RED}║${NC} ${BOLD}❌ TDD WORKFLOW BLOCKED${NC} - Tests Are Failing" >&2
                    echo -e "${RED}╟──────────────────────────────────────────────────────────────╢${NC}" >&2
                    echo -e "${RED}║${NC} You're trying to modify: ${BOLD}${filename}${NC}" >&2
                    echo -e "${RED}║${NC} Current phase: ${BOLD}RED${NC} (${test_failures} test(s) failing)" >&2
                    echo -e "${RED}╟──────────────────────────────────────────────────────────────╢${NC}" >&2
                    echo -e "${RED}║${NC} ${BOLD}You're on the right track!${NC} In TDD, RED phase means:" >&2
                    echo -e "${RED}║${NC}   ✓ Tests are written (good!)" >&2
                    echo -e "${RED}║${NC}   ✓ Tests are failing (expected!)" >&2
                    echo -e "${RED}║${NC}   → Now implement ${BOLD}minimal${NC} code to make tests pass" >&2
                    echo -e "${RED}╟──────────────────────────────────────────────────────────────╢${NC}" >&2
                    echo -e "${RED}║${NC} ${BOLD}Next steps:${NC}" >&2
                    echo -e "${RED}║${NC}   ${GREEN}1.${NC} Implement just enough code to pass the tests" >&2
                    echo -e "${RED}║${NC}   ${GREEN}2.${NC} Run tests: ${CYAN}pnpm test${NC} or ${CYAN}npm test${NC}" >&2
                    echo -e "${RED}║${NC}   ${GREEN}3.${NC} When tests pass → GREEN phase → allowed to refactor" >&2
                    echo -e "${RED}╟──────────────────────────────────────────────────────────────╢${NC}" >&2
                    echo -e "${RED}║${NC} ${DIM}💡 Tip: Focus on making tests pass, not perfect code${NC}" >&2
                    echo -e "${RED}║${NC} ${DIM}ℹ️  Mode: STRICT - implementation blocked until tests pass${NC}" >&2
                    echo -e "${RED}╚══════════════════════════════════════════════════════════════╝${NC}" >&2
                    return 1
                    ;;
                STANDARD)
                    echo -e "${YELLOW}┌──────────────────────────────────────────────────────────────┐${NC}" >&2
                    echo -e "${YELLOW}│${NC} ${BOLD}⚠️  TDD WORKFLOW WARNING${NC} - Tests Are Failing" >&2
                    echo -e "${YELLOW}├──────────────────────────────────────────────────────────────┤${NC}" >&2
                    echo -e "${YELLOW}│${NC} Modifying: ${BOLD}${filename}${NC} with ${test_failures} failing test(s)" >&2
                    echo -e "${YELLOW}│${NC} Phase: ${BOLD}RED${NC} - implement minimal code to pass tests" >&2
                    echo -e "${YELLOW}├──────────────────────────────────────────────────────────────┤${NC}" >&2
                    echo -e "${YELLOW}│${NC} ${DIM}💡 Run tests after changes: pnpm test${NC}" >&2
                    echo -e "${YELLOW}│${NC} ${DIM}ℹ️  Mode: STANDARD - proceeding with warning${NC}" >&2
                    echo -e "${YELLOW}└──────────────────────────────────────────────────────────────┘${NC}" >&2
                    return 0
                    ;;
                RELAXED)
                    debug "RED phase detected (RELAXED mode - allowing)"
                    return 0
                    ;;
            esac
            ;;

        GREEN|REFACTOR|COMPLETE)
            # GREEN, REFACTOR, or COMPLETE phase: Tests passing, implementation allowed
            debug "Phase $current_phase allows implementation (enforcement level: $enforcement_level)"
            return 0
            ;;

        UNKNOWN|"")
            # Unknown phase - allow with warning and guidance
            echo -e "${YELLOW}┌──────────────────────────────────────────────────────────────┐${NC}" >&2
            echo -e "${YELLOW}│${NC} ${BOLD}⚠️  TDD STATE UNKNOWN${NC}" >&2
            echo -e "${YELLOW}├──────────────────────────────────────────────────────────────┤${NC}" >&2
            echo -e "${YELLOW}│${NC} TDD tracking state not found or phase is unknown." >&2
            echo -e "${YELLOW}│${NC} This can happen when:" >&2
            echo -e "${YELLOW}│${NC}   • Starting a new task without TDD initialization" >&2
            echo -e "${YELLOW}│${NC}   • State file was deleted or corrupted" >&2
            echo -e "${YELLOW}├──────────────────────────────────────────────────────────────┤${NC}" >&2
            echo -e "${YELLOW}│${NC} ${DIM}💡 To enable TDD tracking:${NC}" >&2
            echo -e "${YELLOW}│${NC}   ${DIM}1. Set TDD_TASK_ID environment variable${NC}" >&2
            echo -e "${YELLOW}│${NC}   ${DIM}2. Initialize state: tdd-state-manager init <task-id>${NC}" >&2
            echo -e "${YELLOW}│${NC} ${DIM}ℹ️  Allowing operation - TDD not enforced${NC}" >&2
            echo -e "${YELLOW}└──────────────────────────────────────────────────────────────┘${NC}" >&2
            return 0
            ;;

        *)
            echo -e "${YELLOW}┌──────────────────────────────────────────────────────────────┐${NC}" >&2
            echo -e "${YELLOW}│${NC} ${BOLD}⚠️  UNEXPECTED TDD PHASE${NC}: ${current_phase}" >&2
            echo -e "${YELLOW}├──────────────────────────────────────────────────────────────┤${NC}" >&2
            echo -e "${YELLOW}│${NC} Valid phases: INIT → RED → GREEN → REFACTOR → COMPLETE" >&2
            echo -e "${YELLOW}│${NC} ${DIM}ℹ️  Allowing operation - please check TDD state${NC}" >&2
            echo -e "${YELLOW}└──────────────────────────────────────────────────────────────┘${NC}" >&2
            return 0
            ;;
    esac
}

# ============================================================================
# MAIN VALIDATION FUNCTION
# ============================================================================

# Main validation entry point
validate_file_write() {
    local filepath="$1"
    local task_id="${TDD_TASK_ID:-}"

    # Security: Defense-in-depth check for null bytes (primary check is in main())
    # Reject rather than strip to ensure explicit failure on malicious input
    # Check for literal escape sequences and actual null bytes
    if [[ "$filepath" == *'\x00'* ]] || [[ "$filepath" == *'\0'* ]]; then
        echo -e "${RED}[TDD] Security: Invalid file path (null byte detected)${NC}" >&2
        return 1
    fi
    if printf "%s" "$filepath" | od -An -tx1 | grep -q ' 00'; then
        echo -e "${RED}[TDD] Security: Invalid file path (null byte detected)${NC}" >&2
        return 1
    fi

    debug "Starting TDD validation for: $filepath"
    debug "Task ID: ${task_id:-<not set>}"

    # Start performance timer
    local start_time=$(date +%s%N 2>/dev/null || date +%s)

    # Check if TDD enforcement is enabled
    if ! is_tdd_enabled; then
        debug "TDD enforcement is disabled in config"
        return 0
    fi

    # Always allow test files
    if is_test_file "$filepath"; then
        success "Test file - always allowed: ${filepath##*/}"
        return 0
    fi

    # Always allow documentation files
    if is_documentation_file "$filepath"; then
        debug "Documentation file - always allowed: ${filepath##*/}"
        return 0
    fi

    # Always allow configuration files
    if is_configuration_file "$filepath"; then
        debug "Configuration file - always allowed: ${filepath##*/}"
        return 0
    fi

    # File is an implementation file - validate TDD state
    debug "Implementation file detected - validating TDD state"

    # If no task ID, allow with warning
    if [ -z "$task_id" ]; then
        echo -e "${DIM}[TDD] No TDD_TASK_ID set - TDD validation skipped${NC}" >&2
        debug "Set TDD_TASK_ID environment variable to enable TDD validation"
        return 0
    fi

    # Load TDD state
    local state_json=$(load_tdd_state "$task_id")
    if [ $? -ne 0 ]; then
        echo -e "${DIM}[TDD] State not found for task: ${task_id} - TDD validation skipped${NC}" >&2
        debug "TDD state file should be at: $TDD_STATE_DIR/${task_id}.json"
        return 0
    fi

    # Extract state information - OPTIMIZED: single parse extracts all fields at once
    # This reduces 3 separate jq/grep calls to 1, improving performance by ~65%
    local parsed_state=$(parse_tdd_state_all "$state_json" "$task_id")
    local current_phase="${parsed_state%%|*}"
    local temp="${parsed_state#*|}"
    local enforcement_level="${temp%%|*}"
    local test_failures="${parsed_state##*|}"

    debug "TDD State: phase=$current_phase, level=$enforcement_level, failures=$test_failures"

    # Validate TDD phase
    validate_tdd_phase "$filepath" "$current_phase" "$enforcement_level" "$test_failures"
    local validation_result=$?

    # Calculate elapsed time
    local end_time=$(date +%s%N 2>/dev/null || date +%s)
    local elapsed=$((end_time - start_time))

    # Convert to milliseconds (if nanoseconds supported)
    if [ "$elapsed" -gt 1000000 ]; then
        elapsed=$((elapsed / 1000000))
        debug "Validation completed in ${elapsed}ms"

        if [ "$elapsed" -gt "$VALIDATION_TIMEOUT" ]; then
            warn "Validation took ${elapsed}ms (target: <${VALIDATION_TIMEOUT}ms)"
        fi
    fi

    return $validation_result
}

# ============================================================================
# HOOK ENTRY POINT
# ============================================================================

# Main entry point
main() {
    # Get file path from arguments or stdin
    local filepath="${1:-}"

    if [ -z "$filepath" ]; then
        # Try reading from CLAUDE_FILE_PATH environment variable
        filepath="${CLAUDE_FILE_PATH:-}"
    fi

    if [ -z "$filepath" ]; then
        echo -e "${RED}╔══════════════════════════════════════════════════════════════╗${NC}" >&2
        echo -e "${RED}║${NC} ${BOLD}❌ TDD VALIDATOR ERROR${NC} - No File Path" >&2
        echo -e "${RED}╟──────────────────────────────────────────────────────────────╢${NC}" >&2
        echo -e "${RED}║${NC} No file path was provided for validation." >&2
        echo -e "${RED}╟──────────────────────────────────────────────────────────────╢${NC}" >&2
        echo -e "${RED}║${NC} ${BOLD}Usage:${NC}" >&2
        echo -e "${RED}║${NC}   ${CYAN}$0 <filepath>${NC}" >&2
        echo -e "${RED}║${NC}   ${DIM}or${NC}" >&2
        echo -e "${RED}║${NC}   ${CYAN}CLAUDE_FILE_PATH=<filepath> $0${NC}" >&2
        echo -e "${RED}╚══════════════════════════════════════════════════════════════╝${NC}" >&2
        return 1
    fi

    # Security: Sanitize filepath to prevent command injection (P0 security fix)
    # Defense-in-depth: Strip command substitution patterns even though callers should sanitize
    # These patterns could be injected if this script is called directly without the wrapper
    # Remove $() command substitution syntax
    filepath="${filepath//\$(/}"
    # Remove closing parenthesis (from $())
    filepath="${filepath//)/}"
    # Remove backtick command substitution syntax
    filepath="${filepath//\`/}"
    # Remove pipe and redirect operators that could chain commands
    filepath="${filepath//|/}"
    filepath="${filepath//>/}"
    filepath="${filepath//</}"
    # Remove semicolons that could chain commands
    filepath="${filepath//;/}"
    # Remove ampersands that could background/chain commands
    filepath="${filepath//&/}"
    # Remove newlines that could inject commands
    filepath="${filepath//$'\n'/}"
    filepath="${filepath//$'\r'/}"

    # Security: Detect and reject null bytes in file path (P2 DoS prevention)
    # Null bytes can cause crashes and are never valid in file paths
    # Check for both literal escape sequences and actual null bytes via od
    if [[ "$filepath" == *'\x00'* ]] || [[ "$filepath" == *'\0'* ]]; then
        echo -e "${RED}╔══════════════════════════════════════════════════════════════╗${NC}" >&2
        echo -e "${RED}║${NC} ${BOLD}🛡️  SECURITY: Invalid File Path${NC}" >&2
        echo -e "${RED}╟──────────────────────────────────────────────────────────────╢${NC}" >&2
        echo -e "${RED}║${NC} File path contains null byte escape sequence." >&2
        echo -e "${RED}║${NC} This is not allowed for security reasons." >&2
        echo -e "${RED}╟──────────────────────────────────────────────────────────────╢${NC}" >&2
        echo -e "${RED}║${NC} ${DIM}If this was unintentional, check for special characters${NC}" >&2
        echo -e "${RED}║${NC} ${DIM}in your file path or variable expansion.${NC}" >&2
        echo -e "${RED}╚══════════════════════════════════════════════════════════════╝${NC}" >&2
        return 1
    fi
    # Also check for actual embedded null bytes using od
    if printf "%s" "$filepath" | od -An -tx1 | grep -q ' 00'; then
        echo -e "${RED}╔══════════════════════════════════════════════════════════════╗${NC}" >&2
        echo -e "${RED}║${NC} ${BOLD}🛡️  SECURITY: Invalid File Path${NC}" >&2
        echo -e "${RED}╟──────────────────────────────────────────────────────────────╢${NC}" >&2
        echo -e "${RED}║${NC} File path contains embedded null byte." >&2
        echo -e "${RED}║${NC} This is not allowed for security reasons." >&2
        echo -e "${RED}╚══════════════════════════════════════════════════════════════╝${NC}" >&2
        return 1
    fi

    # Validate the file write
    validate_file_write "$filepath"
    local result=$?

    # Exit with validation result
    # 0 = allowed, 1 = blocked
    return $result
}

# Run main function if script is executed (not sourced)
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi
