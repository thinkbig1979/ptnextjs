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

# Error logging
error() {
    echo "❌ [TDD-VALIDATOR ERROR] $*" >&2
}

# Warning logging
warn() {
    echo "⚠️  [TDD-VALIDATOR WARNING] $*" >&2
}

# Info logging
info() {
    echo "ℹ️  [TDD-VALIDATOR] $*" >&2
}

# Success logging
success() {
    echo "✅ [TDD-VALIDATOR] $*" >&2
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

# Extract current phase from TDD state JSON
get_current_phase() {
    local state_json="$1"

    # Use jq if available, otherwise fallback to grep/sed
    if command -v jq >/dev/null 2>&1; then
        echo "$state_json" | jq -r '.current_phase // "UNKNOWN"'
    else
        # Fallback: simple grep/sed extraction
        echo "$state_json" | grep -o '"current_phase"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"\([^"]*\)".*/\1/' || echo "UNKNOWN"
    fi
}

# Extract enforcement level from TDD state JSON
get_enforcement_level() {
    local state_json="$1"

    if command -v jq >/dev/null 2>&1; then
        echo "$state_json" | jq -r '.enforcement_level // "BALANCED"'
    else
        echo "$state_json" | grep -o '"enforcement_level"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"\([^"]*\)".*/\1/' || echo "BALANCED"
    fi
}

# Extract test failure count from TDD state JSON
get_test_failures() {
    local state_json="$1"

    if command -v jq >/dev/null 2>&1; then
        echo "$state_json" | jq -r '.test_failures // 0'
    else
        echo "$state_json" | grep -o '"test_failures"[[:space:]]*:[[:space:]]*[0-9]*' | grep -o '[0-9]*$' || echo "0"
    fi
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
            case "$enforcement_level" in
                STRICT)
                    error "Test-first violation: No tests have been written yet (STRICT mode)"
                    info "Required steps:"
                    info "  1. Write failing tests for ${filepath##*/}"
                    info "  2. Run tests to confirm RED phase (tests fail)"
                    info "  3. Then implement code to pass tests"
                    return 1
                    ;;
                STANDARD)
                    warn "Test-first violation: No tests have been written yet (STANDARD mode)"
                    info "Recommended steps:"
                    info "  1. Write failing tests for ${filepath##*/}"
                    info "  2. Run tests to confirm RED phase"
                    info "  3. Then implement code to pass tests"
                    info "Continuing with warning..."
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
            case "$enforcement_level" in
                STRICT)
                    error "Test-first violation: Tests are currently failing ($test_failures failures) (STRICT mode)"
                    info "You are in RED phase with failing tests."
                    info "Required steps:"
                    info "  1. Implement minimal code to make tests pass"
                    info "  2. Run tests to verify implementation"
                    info "  3. Once tests pass, system will transition to GREEN phase"
                    return 1
                    ;;
                STANDARD)
                    warn "Test-first violation: Tests are currently failing ($test_failures failures) (STANDARD mode)"
                    info "You are in RED phase with failing tests."
                    info "Recommended: Implement code to make tests pass first"
                    info "Continuing with warning..."
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
            # Unknown phase - allow with warning
            warn "TDD state not found or phase unknown - allowing operation"
            debug "Consider initializing TDD state for this task"
            return 0
            ;;

        *)
            warn "Unknown TDD phase: $current_phase - allowing operation"
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

    # Security: Strip null bytes from filepath to prevent injection
    filepath="${filepath//$'\x00'/}"

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
        warn "No TDD_TASK_ID set - cannot validate TDD state"
        info "Set TDD_TASK_ID environment variable to enable TDD validation"
        return 0
    fi

    # Load TDD state
    local state_json=$(load_tdd_state "$task_id")
    if [ $? -ne 0 ]; then
        warn "TDD state not found for task: $task_id - allowing operation"
        debug "TDD state file should be at: $TDD_STATE_DIR/${task_id}.json"
        return 0
    fi

    # Extract state information
    local current_phase=$(get_current_phase "$state_json")
    local enforcement_level=$(get_enforcement_level "$state_json")
    local test_failures=$(get_test_failures "$state_json")

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
        error "No file path provided"
        error "Usage: $0 <filepath>"
        error "Or set CLAUDE_FILE_PATH environment variable"
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
