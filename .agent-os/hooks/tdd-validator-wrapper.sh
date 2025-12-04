#!/bin/bash

# TDD Validator Wrapper - Security Hardened
# Safely invokes tdd-validator.sh with sanitized inputs
# Prevents command injection from Claude Code hook system
# Part of Agent OS v2.8+ Security Fix

set -e

# Security: Read file path from environment variable (safer than $1)
# This prevents command substitution in the argument
FILEPATH="${CLAUDE_FILE_PATH:-${CLAUDE_HOOK_TOOL_PARAMETERS_file_path:-${1}}}"

# Security: Sanitize filepath
# Remove null bytes
FILEPATH="${FILEPATH//$'\x00'/}"

# Security: Strip any remaining dangerous characters
# Remove command substitution patterns
FILEPATH="${FILEPATH//\$(/}"
FILEPATH="${FILEPATH//\`/}"
FILEPATH="${FILEPATH//)/}"

# Export sanitized filepath
export CLAUDE_FILE_PATH="$FILEPATH"

# Invoke actual validator
exec bash "${CLAUDE_PROJECT_DIR:-.}/.agent-os/hooks/tdd-validator.sh" "$FILEPATH"
